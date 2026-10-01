// UI-only display formatters.
//
// Every function here only changes how a value is *shown* — inside an
// input while typing, or in a read-only view. None of them change what
// gets stored in component state, sent to the API, or saved in the
// database. Each formatter has a matching "unformat" helper so a
// controlled input can keep its underlying state as plain digits and
// only format the value at render time, e.g.:
//
//   <Input
//     value={formatAadhaar(watch("aadhaarNumber"))}
//     onChange={(e) => setValue("aadhaarNumber", unformatAadhaar(e.target.value))}
//   />
//
// The form state (and whatever gets submitted) stays "123456789012";
// only the box on screen shows "1234 5678 9012".

/** Strips everything except digits. Base helper for the formatters below. */
export const digitsOnly = (value: string) => (value || "").replace(/\D/g, "");

/**
 * True if `value` is the backend's encrypted-field format ("v1:iv:authTag:
 * ciphertext" — see backend/utils/encryption.js's isEncrypted()). This is
 * exactly what an admin without the "view sensitive data" permission gets
 * back for Aadhaar/PAN/bank/UPI fields: the real ciphertext, by design.
 * Formatters below must skip it — running digit-grouping on a base64
 * ciphertext would extract whatever digits happen to appear in it and
 * display a garbled string that *looks* like a plausible real number.
 */
export const isEncryptedValue = (value: string) =>
  typeof value === "string" && /^v1:[^:]+:[^:]+:[^:]+$/.test(value);

/**
 * Aadhaar number, grouped in 4s for readability: "123456789012" -> "1234 5678 9012".
 * Display only — always feed the unformatted value to unformatAadhaar before storing it.
 * Passes an encrypted value through unchanged (see isEncryptedValue above).
 */
export const formatAadhaar = (value: string) => {
  if (isEncryptedValue(value)) return value;
  const digits = digitsOnly(value).slice(0, 12);
  return digits.replace(/(\d{4})(?=\d)/g, "$1 ");
};

/** Reverse of formatAadhaar — strips the spaces back out, capped at 12 digits. */
export const unformatAadhaar = (value: string) => digitsOnly(value).slice(0, 12);

/**
 * Indian mobile number, grouped 5+5 for readability: "9876543210" -> "98765 43210".
 * Display only — always feed the unformatted value to unformatMobileNumber before storing it.
 */
export const formatMobileNumber = (value: string) => {
  if (isEncryptedValue(value)) return value;
  const digits = digitsOnly(value).slice(0, 10);
  return digits.length > 5 ? `${digits.slice(0, 5)} ${digits.slice(5)}` : digits;
};

/** Reverse of formatMobileNumber — strips the space back out, capped at 10 digits. */
export const unformatMobileNumber = (value: string) => digitsOnly(value).slice(0, 10);

/**
 * Indian numbering system (lakh/crore grouping) for money display:
 *   "1234567"    -> "12,34,567"
 *   "1234567.5"  -> "12,34,567.5"
 *   "-50000"     -> "-50,000"
 * Keeps a typed decimal part (paise) intact instead of discarding it, and
 * only ever reads digits, an optional leading "-", and a single "." out of
 * whatever was passed in — safe to call on a value that's already formatted.
 */
export const formatIndianNumber = (value: string | number | undefined | null) => {
  const raw = (value ?? "").toString().trim();
  if (!raw) return "";

  const isNegative = raw.startsWith("-");
  const [wholePartRaw, decimalPartRaw] = raw.replace(/[^\d.]/g, "").split(".");
  const wholePart = (wholePartRaw || "").replace(/^0+(?=\d)/, ""); // no leading zeros, e.g. "007" -> "7"

  if (!wholePart) return "";

  const lastThree = wholePart.slice(-3);
  const otherDigits = wholePart.slice(0, -3);
  const groupedWhole = otherDigits
    ? otherDigits.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + "," + lastThree
    : lastThree;

  const decimalSuffix = decimalPartRaw !== undefined ? `.${decimalPartRaw.slice(0, 2)}` : "";
  return `${isNegative ? "-" : ""}${groupedWhole}${decimalSuffix}`;
};

/**
 * Reverse of formatIndianNumber — strips the grouping commas back out to a
 * plain numeric string: "12,34,567.50" -> "1234567.50". Use this in onChange
 * so the stored/submitted value is always plain digits, never the display string.
 */
export const unformatIndianNumber = (value: string) => {
  const raw = (value ?? "").toString().trim();
  const isNegative = raw.startsWith("-");
  const cleaned = raw.replace(/[^\d.]/g, "");
  return `${isNegative ? "-" : ""}${cleaned}`;
};

/**
 * Money display with a ₹ prefix for read-only views, e.g. "₹12,34,567".
 * Returns "" for an empty/zero-less input so callers can still fall back
 * to their own placeholder (e.g. `formatMoney(value) || "₹0"`).
 */
export const formatMoney = (value: string | number | undefined | null) => {
  const formatted = formatIndianNumber(value);
  return formatted ? `₹${formatted}` : "";
};
