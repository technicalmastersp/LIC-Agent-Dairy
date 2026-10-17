// ─────────────────────────────────────────────────────────────────────────────
// SOURCE OF TRUTH — which data the "Hide/Show sensitive data" button masks.
//
// Every field the UI hides when the button is in its "hidden" state is listed
// here, once, with HOW it is hidden and WHERE it appears. Nothing else decides
// what is masked:
//   • <SensitiveValue field="…">           (components/SensitiveValue.tsx)
//   • useSensitiveInputClass("…")           (hooks/useSensitiveMask.tsx)
//   • maskValue("…", raw)                   (utils/maskSensitive.ts)
// all take a SensitiveFieldKey from this file, so an unknown field is a
// compile error, and test/sensitiveDataRegistry.test.ts fails if a surface
// listed below no longer uses its field (or a SensitiveValue uses a field that
// isn't listed). docs/SENSITIVE_DATA_MASKING.md is the human-readable view.
//
// To mask a new field:   add it to SENSITIVE_FIELDS, wrap its render sites with
//                        <SensitiveValue field="…">, list those files in
//                        `surfaces`, update docs/SENSITIVE_DATA_MASKING.md.
// To stop masking one:   delete it here (the compiler then points at every
//                        remaining use).
//
// The saved on/off choice lives in the database
// (User.userPersonalInfo[0].maskSensitiveData, backend
// controllers/userController/privacySettingsController.js). The backend master
// switch is SENSITIVE_MASKING_ENABLED (config/privacyConfig.js).
//
// Masking is presentational: the API returns the same data either way. It
// protects against shoulder-surfing and screen-sharing, not against someone
// with devtools open — real access control is backend/utils/sensitiveFields.js
// (encryption at rest + can_view_sensitive_data).
// ─────────────────────────────────────────────────────────────────────────────

/**
 * How a value is hidden:
 *  - "last4": all but the last 4 characters become dots (identifying but safe)
 *  - "full":  a fixed-width block of dots — hides the value AND its length
 *  - "email": first character + domain stay, e.g. r•••••@gmail.com
 *  - "money": "₹ ••••••"
 */
export type MaskStyle = "last4" | "full" | "email" | "money";

export type SensitiveCategory = "identity" | "bank" | "contact" | "financial" | "policy";

export interface SensitiveFieldDef {
  /** Human label, as used in docs and the toggle's tooltip text. */
  label: string;
  category: SensitiveCategory;
  style: MaskStyle;
  /** Insert a space every N characters of the masked output (Aadhaar: 4). */
  groupBy?: number;
  /** Why it is classed sensitive — shown in the docs. */
  why: string;
  /**
   * Source files (relative to src/) that render this field through the masking
   * layer. Verified against the code by test/sensitiveDataRegistry.test.ts.
   */
  surfaces: readonly string[];
}

export const SENSITIVE_FIELDS = {
  // ── identity (government IDs — also encrypted at rest, see backend sensitiveFields.js)
  aadhaarNumber: {
    label: "Aadhaar number", category: "identity", style: "last4", groupBy: 4,
    why: "Government ID; regulated personal data (DPDP Act 2023).",
    surfaces: [
      "components/EditRecordModal.tsx",
      "components/RecordDetailsModal.tsx",
      "pages/AddRecord.tsx",
    ],
  },
  panNumber: {
    label: "PAN", category: "identity", style: "last4",
    why: "Government tax ID.",
    surfaces: [
      "components/EditRecordModal.tsx",
      "components/RecordDetailsModal.tsx",
      "pages/AddRecord.tsx",
    ],
  },
  dateOfBirth: {
    label: "Date of birth", category: "identity", style: "full",
    why: "Personal identifier commonly used to verify identity.",
    surfaces: [
      "components/RecordDetailsModal.tsx",
    ],
  },

  // ── bank & payment (also encrypted at rest)
  bankAccountNumber: {
    label: "Bank account number", category: "bank", style: "last4",
    why: "Financial account identifier.",
    surfaces: [
      "components/EditRecordModal.tsx",
      "components/RecordDetailsModal.tsx",
      "pages/AddRecord.tsx",
      "pages/Profile.tsx",
      "pages/ReferralProgram.tsx",
      "pages/admin/AdminUserDetail.tsx",
      "pages/admin/WithdrawalRequests.tsx",
    ],
  },
  ifscCode: {
    label: "IFSC code", category: "bank", style: "full",
    why: "Bank branch identifier, treated as sensitive alongside the account number.",
    surfaces: [
      "components/EditRecordModal.tsx",
      "components/RecordDetailsModal.tsx",
      "pages/AddRecord.tsx",
      "pages/admin/AdminUserDetail.tsx",
      "pages/admin/WithdrawalRequests.tsx",
    ],
  },
  upiId: {
    label: "UPI ID", category: "bank", style: "email",
    why: "Payment address that can receive money.",
    surfaces: [
      "pages/Profile.tsx",
      "pages/ReferralProgram.tsx",
      "pages/admin/AdminUserDetail.tsx",
      "pages/admin/PaymentVerifications.tsx",
      "pages/admin/WithdrawalRequests.tsx",
    ],
  },

  // ── contact
  mobileNumber: {
    label: "Mobile / phone number", category: "contact", style: "last4",
    why: "Direct contact detail (policyholder, Aadhaar-linked, agent, caller).",
    surfaces: [
      "components/ContactActionModal.tsx",
      "components/EditRecordModal.tsx",
      "components/RecordDetailsModal.tsx",
      "pages/AddRecord.tsx",
      "pages/CurrentMonthDue.tsx",
      "pages/HelpSupport.tsx",
      "pages/MissedPayments.tsx",
      "pages/Profile.tsx",
      "pages/UpcomingDuePolicies.tsx",
      "pages/admin/AdminAdminDetail.tsx",
      "pages/admin/AdminCallRequests.tsx",
      "pages/admin/AdminUserDetail.tsx",
    ],
  },
  email: {
    label: "Email address", category: "contact", style: "email",
    why: "Direct contact detail and login identifier.",
    surfaces: [
      "components/RecordDetailsModal.tsx",
      "pages/HelpSupport.tsx",
      "pages/Profile.tsx",
      "pages/admin/AdminAdminDetail.tsx",
      "pages/admin/AdminAdmins.tsx",
      "pages/admin/AdminDashboard.tsx",
      "pages/admin/AdminSuggestions.tsx",
      "pages/admin/AdminSupportTickets.tsx",
      "pages/admin/AdminUserDetail.tsx",
      "pages/admin/AdminUsers.tsx",
    ],
  },
  address: {
    label: "Postal address", category: "contact", style: "full",
    why: "Physical location of a person.",
    surfaces: [
      "components/RecordDetailsModal.tsx",
      "pages/Profile.tsx",
      "pages/admin/AdminAdminDetail.tsx",
      "pages/admin/AdminUserDetail.tsx",
    ],
  },

  // ── policy
  policyNumber: {
    label: "Policy number", category: "policy", style: "last4",
    why: "Account-level identifier an insurer accepts as proof of ownership.",
    surfaces: [
      "components/PaymentUpdateModal.tsx",
      "components/RecordDetailsModal.tsx",
      "pages/CurrentMonthDue.tsx",
      "pages/MissedPayments.tsx",
      "pages/UpcomingDuePolicies.tsx",
      "pages/ViewRecords.tsx",
      "pages/admin/AdminUserDetail.tsx",
    ],
  },

  // ── financial amounts
  sumAssured: {
    label: "Sum assured", category: "financial", style: "money",
    why: "A client's coverage amount, including portfolio totals.",
    surfaces: [
      "components/PaymentUpdateModal.tsx",
      "components/RecordDetailsModal.tsx",
      "pages/MissedPayments.tsx",
      "pages/ViewRecords.tsx",
      "pages/admin/AdminUserDetail.tsx",
    ],
  },
  annualIncome: {
    label: "Annual income", category: "financial", style: "money",
    why: "A client's income.",
    surfaces: [
      "components/RecordDetailsModal.tsx",
    ],
  },
  walletAmount: {
    label: "Referral wallet amounts", category: "financial", style: "money",
    why: "Personal balance / earnings.",
    surfaces: [
      "pages/Home.tsx",
      "pages/Profile.tsx",
      "pages/ReferralProgram.tsx",
      "pages/admin/AdminDashboard.tsx",
      "pages/admin/AdminUserDetail.tsx",
    ],
  },
  withdrawalAmount: {
    label: "Withdrawal amounts", category: "financial", style: "money",
    why: "A person's payout amount (admin view).",
    surfaces: [
      "pages/admin/AdminDashboard.tsx",
      "pages/admin/AdminUserDetail.tsx",
      "pages/admin/WithdrawalRequests.tsx",
    ],
  },
  revenueAmount: {
    label: "Business revenue & expense amounts", category: "financial", style: "money",
    why: "Company financials (admin view).",
    surfaces: [
      "pages/admin/AdminDashboard.tsx",
      "pages/admin/AdminRevenue.tsx",
    ],
  },
} as const satisfies Record<string, SensitiveFieldDef>;

export type SensitiveFieldKey = keyof typeof SENSITIVE_FIELDS;

export const SENSITIVE_FIELD_KEYS = Object.keys(SENSITIVE_FIELDS) as SensitiveFieldKey[];

/**
 * Deliberately NOT masked, so nobody has to rediscover why. Each is a decision,
 * not an oversight — move an entry into SENSITIVE_FIELDS to change it.
 */
export const NOT_MASKED_BY_DESIGN: readonly { what: string; reason: string }[] = [
  { what: "Policyholder / nominee / agent names", reason: "Needed to recognise a record at a glance; masking them would make every list unusable." },
  { what: "Counts and dates (record counts, due dates, plan expiry)", reason: "Not personal data; the Home dashboard stays useful while data is hidden." },
  { what: "CSV / Excel exports, vCard and WhatsApp/tel/mailto links", reason: "Deliberate user actions that must carry the real value; the on-screen text is masked, the action still works." },
  { what: "Form inputs while editing (shown as dots, not removed)", reason: "Editing needs the real value; inputs are visually obscured instead — see useSensitiveInputClass." },
  { what: "Add/Edit record form inputs other than Aadhaar, PAN, Aadhaar-linked mobile, bank account and IFSC (e.g. email, address, date of birth, income, policy number)", reason: "Obscured inputs are limited to the government-ID and bank fields; date pickers can't be obscured. Extend by adding useSensitiveInputClass to more inputs." },
  { what: "Agent-defined custom fields and insurance-type-specific details on a record", reason: "Free-form, so they can't be classified in advance." },
  { what: "The agent's own digital business card (preview and download)", reason: "It is made to be shared; its contents are chosen by the agent." },
  { what: "Subscription plan price and payment history of the agent's own plan", reason: "The agent's own billing, not client or business data." },
  { what: "Values the backend already returns as ciphertext (viewer lacks can_view_sensitive_data)", reason: "Already unreadable; SensitiveValue keeps its existing lock-icon rendering." },
];
