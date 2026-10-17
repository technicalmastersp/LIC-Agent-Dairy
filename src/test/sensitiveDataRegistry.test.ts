// Keeps the Hide/Show registry (src/config/sensitiveDataRegistry.ts) honest:
// what the registry says is masked must be what the code actually masks, and
// maskValue must never leak more than the field's style allows.
import { describe, it, expect } from "vitest";
import { readdirSync, readFileSync, statSync, existsSync } from "node:fs";
import { join } from "node:path";
import { SENSITIVE_FIELDS, SENSITIVE_FIELD_KEYS, NOT_MASKED_BY_DESIGN } from "@/config/sensitiveDataRegistry";
import { maskValue, MASK_CHAR } from "@/utils/maskSensitive";

const SRC = join(process.cwd(), "src");
const walk = (dir: string): string[] =>
  readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });
const sourceFiles = walk(SRC).filter(
  (p) => /\.tsx?$/.test(p) && !p.includes(`${join("src", "test")}`) && !p.endsWith("sensitiveDataRegistry.ts"),
);

describe("registry ↔ code", () => {
  it("every listed surface exists and really uses its field", () => {
    for (const key of SENSITIVE_FIELD_KEYS) {
      const def = SENSITIVE_FIELDS[key];
      expect(def.surfaces.length, `${key} lists no surfaces`).toBeGreaterThan(0);
      for (const rel of def.surfaces) {
        const file = join(SRC, rel);
        expect(existsSync(file), `${key}: ${rel} does not exist`).toBe(true);
        const text = readFileSync(file, "utf8");
        const used = text.includes(`field="${key}"`) || text.includes(`useSensitiveInputClass("${key}")`);
        expect(used, `${key} is listed for ${rel} but not used there`).toBe(true);
      }
    }
  });

  it("every file that masks a field is listed under that field (no unlisted masking)", () => {
    for (const file of sourceFiles) {
      const text = readFileSync(file, "utf8");
      const rel = file.slice(SRC.length + 1).split("\\").join("/");
      const keys = [
        ...[...text.matchAll(/<SensitiveValue[^>]*?field="(\w+)"/g)].map((m) => m[1]),
        ...[...text.matchAll(/useSensitiveInputClass\("(\w+)"\)/g)].map((m) => m[1]),
      ];
      for (const k of keys) {
        expect(k in SENSITIVE_FIELDS, `${rel} masks unregistered field "${k}"`).toBe(true);
        expect(
          (SENSITIVE_FIELDS as Record<string, { surfaces: readonly string[] }>)[k].surfaces.includes(rel),
          `${rel} masks "${k}" but is not in its registry surfaces`,
        ).toBe(true);
      }
    }
  });

  it("documents what is deliberately not masked", () => {
    expect(NOT_MASKED_BY_DESIGN.length).toBeGreaterThan(0);
    NOT_MASKED_BY_DESIGN.forEach((e) => { expect(e.what && e.reason).toBeTruthy(); });
  });
});

describe("maskValue", () => {
  const dots = (s: string) => [...s].filter((c) => c === MASK_CHAR).length;

  it("Aadhaar: only last 4 digits survive, grouped by 4, separators ignored", () => {
    expect(maskValue("aadhaarNumber", "123456789012")).toBe("•••• •••• 9012");
    expect(maskValue("aadhaarNumber", "1234 5678 9012")).toBe("•••• •••• 9012");
  });
  it("bank account / mobile / PAN / policy number keep the last 4 only", () => {
    expect(maskValue("bankAccountNumber", "000123456789")).toBe("••••••••6789");
    expect(maskValue("mobileNumber", "9876543210")).toBe("••••••3210");
    expect(maskValue("panNumber", "ABCDE1234F")).toBe("••••••234F");
    expect(maskValue("policyNumber", "123456789")).toBe("•••••6789");
  });
  it("values of 4 or fewer characters are fully hidden", () => {
    expect(maskValue("mobileNumber", "1234")).toBe("••••");
    expect(maskValue("policyNumber", "12")).toBe("••");
  });
  it("email keeps first character and domain, hides the rest of the local part", () => {
    expect(maskValue("email", "ratnesh@gmail.com")).toBe("r•••••@gmail.com");
    expect(maskValue("upiId", "ratnesh@okaxis")).toBe("r•••••@okaxis");
    expect(maskValue("email", "not-an-email")).not.toContain("not");
  });
  it("full / money styles hide length and value", () => {
    expect(maskValue("ifscCode", "SBIN0001234")).toBe(maskValue("ifscCode", "X"));
    expect(maskValue("address", "12 MG Road")).not.toMatch(/[A-Za-z0-9]/);
    expect(maskValue("dateOfBirth", "01-01-1990")).not.toMatch(/\d/);
    expect(maskValue("sumAssured", "₹5,00,000")).toBe("₹ ••••••");
    expect(maskValue("walletAmount", 1500)).not.toMatch(/\d/);
  });
  it("never reveals more than 4 characters of any last4 field", () => {
    for (const k of SENSITIVE_FIELD_KEYS.filter((x) => SENSITIVE_FIELDS[x].style === "last4")) {
      const out = maskValue(k, "ABCDEFGHIJ1234567890");
      expect(out.replace(/[•\s]/g, "").length).toBeLessThanOrEqual(4);
      expect(dots(out)).toBe(16);
    }
  });
  it("empty / nullish input gives an empty string", () => {
    expect(maskValue("email", null)).toBe("");
    expect(maskValue("email", undefined)).toBe("");
    expect(maskValue("email", "   ")).toBe("");
  });
  it("leaves backend ciphertext untouched (it is already unreadable)", () => {
    const c = "v1:aabbccddeeff00112233:00112233445566778899aabbccddeeff:deadbeef";
    expect(maskValue("aadhaarNumber", c)).toBe(c);
  });
});
