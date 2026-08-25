import { describe, it, expect } from "vitest";
import { convertDateToIndianFormat } from "./tools";

describe("convertDateToIndianFormat", () => {
  it("converts a valid ISO date to Indian display format (no type arg)", () => {
    expect(convertDateToIndianFormat("2024-01-15T10:30:00.000Z")).toBe("15-Jan-2024");
  });

  it("converts a valid ISO date to a plain date string when a type arg is passed", () => {
    // With a `type` arg the function takes the other branch: split on "T"
    // and return the date-only portion, ignoring the Indian-format path.
    expect(convertDateToIndianFormat("2024-01-15T10:30:00.000Z", "iso")).toBe("2024-01-15");
  });

  it("returns an empty string for an empty input", () => {
    expect(convertDateToIndianFormat("")).toBe("");
  });

  it("returns an empty string for an undefined input", () => {
    // Record date fields (createdAt, dateOfBirth, lastPaymentDate, etc.)
    // are optional, so callers legitimately pass `undefined` here —
    // the param type is `string | undefined` to match.
    expect(convertDateToIndianFormat(undefined)).toBe("");
  });

  it("returns an empty string for an unparseable date string", () => {
    expect(convertDateToIndianFormat("not-a-date")).toBe("");
  });

  it("passes an already-formatted Indian-style date back through unchanged", () => {
    // "15-Jan-2024" happens to be parseable by `new Date(...)`, so the
    // no-type branch re-formats it right back to the same string.
    expect(convertDateToIndianFormat("15-Jan-2024")).toBe("15-Jan-2024");
  });

  it("passes an already-formatted date through unchanged when a type arg is passed", () => {
    // No "T" in the string, so split("T")[0] is a no-op.
    expect(convertDateToIndianFormat("15-Jan-2024", "iso")).toBe("15-Jan-2024");
  });
});