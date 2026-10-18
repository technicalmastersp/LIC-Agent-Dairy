import { SENSITIVE_FIELDS, type SensitiveFieldKey } from "@/config/sensitiveDataRegistry";
import { isEncryptedValue } from "@/utils/inputValueFormats";

export const MASK_CHAR = "•";
const FULL_MASK = MASK_CHAR.repeat(8);
const MONEY_MASK = `₹ ${MASK_CHAR.repeat(6)}`;

const group = (s: string, n: number) => s.replace(new RegExp(`(.{${n}})(?=.)`, "g"), "$1 ");

/**
 * The masked text for a value of a registered sensitive field. Pure function —
 * the "how" comes from the field's `style` in the registry. Never throws; empty
 * input gives "" so callers can keep their own placeholder.
 *
 * Output never contains more of the original than the style allows (last 4
 * characters / first character + domain / nothing).
 */
export function maskValue(field: SensitiveFieldKey, raw: string | number | null | undefined): string {
  if (raw === null || raw === undefined) return "";
  const value = String(raw).trim();
  if (!value) return "";
  const def = SENSITIVE_FIELDS[field];

  // Ciphertext is already unreadable; never "mask" it into something that
  // looks like a real value. (SensitiveValue handles this case itself.)
  if (isEncryptedValue(value)) return value;

  switch (def.style) {
    case "money":
      return MONEY_MASK;
    case "email": {
      const at = value.lastIndexOf("@");
      if (at < 1) return FULL_MASK; // not an address shape — hide all of it
      return `${value[0]}${MASK_CHAR.repeat(5)}${value.slice(at)}`;
    }
    case "last4": {
      // Hide everything except the last 4 letters/digits; ignore separators the
      // user typed ("1234 5678 9012") so the result doesn't depend on them.
      const compact = value.replace(/[\s-]/g, "");
      const keep = compact.length > 4 ? 4 : 0; // 4 or fewer chars: hide all
      const masked = MASK_CHAR.repeat(compact.length - keep) + compact.slice(compact.length - keep);
      return "groupBy" in def && def.groupBy ? group(masked, def.groupBy) : masked;
    }
    case "full":
    default:
      return FULL_MASK;
  }
}
