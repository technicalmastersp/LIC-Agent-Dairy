// UPI ID: name@bank — e.g. john.doe@okhdfcbank, 9876543210@ybl
export const UPI_REGEX = /^[a-zA-Z0-9.\-_]{2,49}@[a-zA-Z]{2,49}$/;

// IFSC: 4 letters (bank code) + 0 (reserved) + 6 alphanumeric (branch code)
// e.g. SBIN0001234, HDFC0000001
export const IFSC_REGEX = /^[A-Z]{4}0[A-Z0-9]{6}$/;

// Indian bank account numbers vary 9–18 digits across banks — no universal
// checksum exists, so length + digits-only is the honest limit of client-side
// validation. Real verification (penny-drop/account-verification API) is a
// separate integration if you want it — flagging that rather than pretending
// a regex can confirm the account is real.
export const ACCOUNT_NUMBER_REGEX = /^[0-9]{9,18}$/;

export const validateUpiId = (upiId) => UPI_REGEX.test(upiId?.trim() || "");
export const validateIfsc = (ifsc) => IFSC_REGEX.test((ifsc?.trim() || "").toUpperCase());
export const validateAccountNumber = (accNum) => ACCOUNT_NUMBER_REGEX.test((accNum?.trim() || "").replace(/\s/g, ""));