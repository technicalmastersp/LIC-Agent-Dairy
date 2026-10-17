# Hide/Show sensitive data — source of truth

> **The code is authoritative:** `src/config/sensitiveDataRegistry.ts`. This page is generated from it — edit the registry, then regenerate.
> `src/test/sensitiveDataRegistry.test.ts` fails if this list and the code disagree (a listed surface that no longer masks its field, or a file masking a field that isn't listed).

## How it works

1. The eye button (Home page and Admin panel header/sidebar) toggles `maskSensitiveData` on the signed-in account — saved in MongoDB (`User.userPersonalInfo[0].maskSensitiveData`) via `PUT /api/user/privacy-settings`, so the choice follows the user across devices. Admins use the same field on their own account.
2. **Open eye** = data visible (press to hide). **Closed eye** = data hidden (press to show).
3. Every field below is rendered through `<SensitiveValue field="…">` (or, for text inputs, `useSensitiveInputClass("…")`). When hidden, the real value is not placed in the DOM.
4. **Master switch:** backend env `SENSITIVE_MASKING_ENABLED`. On unless exactly `false`. When `false`: no button, nothing masked, `PUT` returns 403. Saved choices are kept. No frontend rebuild needed.
5. Masking is presentational (shoulder-surfing / screen-share protection). Real access control remains backend `utils/sensitiveFields.js` (encryption at rest + `can_view_sensitive_data`).

## Masked fields

| Key | Field | Category | Mask style | Where it is masked (src/) |
|---|---|---|---|---|
| `aadhaarNumber` | Aadhaar number | identity | last4 (grouped by 4) | `components/EditRecordModal.tsx`<br>`components/RecordDetailsModal.tsx`<br>`pages/AddRecord.tsx` |
| `panNumber` | PAN | identity | last4 | `components/EditRecordModal.tsx`<br>`components/RecordDetailsModal.tsx`<br>`pages/AddRecord.tsx` |
| `dateOfBirth` | Date of birth | identity | full | `components/RecordDetailsModal.tsx` |
| `bankAccountNumber` | Bank account number | bank | last4 | `components/EditRecordModal.tsx`<br>`components/RecordDetailsModal.tsx`<br>`pages/AddRecord.tsx`<br>`pages/Profile.tsx`<br>`pages/ReferralProgram.tsx`<br>`pages/admin/AdminUserDetail.tsx`<br>`pages/admin/WithdrawalRequests.tsx` |
| `ifscCode` | IFSC code | bank | full | `components/EditRecordModal.tsx`<br>`components/RecordDetailsModal.tsx`<br>`pages/AddRecord.tsx`<br>`pages/admin/AdminUserDetail.tsx`<br>`pages/admin/WithdrawalRequests.tsx` |
| `upiId` | UPI ID | bank | email | `pages/Profile.tsx`<br>`pages/ReferralProgram.tsx`<br>`pages/admin/AdminUserDetail.tsx`<br>`pages/admin/PaymentVerifications.tsx`<br>`pages/admin/WithdrawalRequests.tsx` |
| `mobileNumber` | Mobile / phone number | contact | last4 | `components/ContactActionModal.tsx`<br>`components/EditRecordModal.tsx`<br>`components/RecordDetailsModal.tsx`<br>`pages/AddRecord.tsx`<br>`pages/CurrentMonthDue.tsx`<br>`pages/HelpSupport.tsx`<br>`pages/MissedPayments.tsx`<br>`pages/Profile.tsx`<br>`pages/UpcomingDuePolicies.tsx`<br>`pages/admin/AdminAdminDetail.tsx`<br>`pages/admin/AdminCallRequests.tsx`<br>`pages/admin/AdminUserDetail.tsx` |
| `email` | Email address | contact | email | `components/RecordDetailsModal.tsx`<br>`pages/HelpSupport.tsx`<br>`pages/Profile.tsx`<br>`pages/admin/AdminAdminDetail.tsx`<br>`pages/admin/AdminAdmins.tsx`<br>`pages/admin/AdminDashboard.tsx`<br>`pages/admin/AdminSuggestions.tsx`<br>`pages/admin/AdminSupportTickets.tsx`<br>`pages/admin/AdminUserDetail.tsx`<br>`pages/admin/AdminUsers.tsx` |
| `address` | Postal address | contact | full | `components/RecordDetailsModal.tsx`<br>`pages/Profile.tsx`<br>`pages/admin/AdminAdminDetail.tsx`<br>`pages/admin/AdminUserDetail.tsx` |
| `policyNumber` | Policy number | policy | last4 | `components/PaymentUpdateModal.tsx`<br>`components/RecordDetailsModal.tsx`<br>`pages/CurrentMonthDue.tsx`<br>`pages/MissedPayments.tsx`<br>`pages/UpcomingDuePolicies.tsx`<br>`pages/ViewRecords.tsx`<br>`pages/admin/AdminUserDetail.tsx` |
| `sumAssured` | Sum assured | financial | money | `components/PaymentUpdateModal.tsx`<br>`components/RecordDetailsModal.tsx`<br>`pages/MissedPayments.tsx`<br>`pages/ViewRecords.tsx`<br>`pages/admin/AdminUserDetail.tsx` |
| `annualIncome` | Annual income | financial | money | `components/RecordDetailsModal.tsx` |
| `walletAmount` | Referral wallet amounts | financial | money | `pages/Home.tsx`<br>`pages/Profile.tsx`<br>`pages/ReferralProgram.tsx`<br>`pages/admin/AdminDashboard.tsx`<br>`pages/admin/AdminUserDetail.tsx` |
| `withdrawalAmount` | Withdrawal amounts | financial | money | `pages/admin/AdminDashboard.tsx`<br>`pages/admin/AdminUserDetail.tsx`<br>`pages/admin/WithdrawalRequests.tsx` |
| `revenueAmount` | Business revenue & expense amounts | financial | money | `pages/admin/AdminDashboard.tsx`<br>`pages/admin/AdminRevenue.tsx` |

Mask styles: **last4** — all but the last 4 characters hidden (`••••••••9012`); **full** — fixed block of dots, hides the length too (`••••••••`); **email** — first character + domain (`r•••••@gmail.com`); **money** — `₹ ••••••`.

## Deliberately NOT masked

- **Policyholder / nominee / agent names** — Needed to recognise a record at a glance; masking them would make every list unusable.
- **Counts and dates (record counts, due dates, plan expiry)** — Not personal data; the Home dashboard stays useful while data is hidden.
- **CSV / Excel exports, vCard and WhatsApp/tel/mailto links** — Deliberate user actions that must carry the real value; the on-screen text is masked, the action still works.
- **Form inputs while editing (shown as dots, not removed)** — Editing needs the real value; inputs are visually obscured instead — see useSensitiveInputClass.
- **Add/Edit record form inputs other than Aadhaar, PAN, Aadhaar-linked mobile, bank account and IFSC (e.g. email, address, date of birth, income, policy number)** — Obscured inputs are limited to the government-ID and bank fields; date pickers can't be obscured. Extend by adding useSensitiveInputClass to more inputs.
- **Agent-defined custom fields and insurance-type-specific details on a record** — Free-form, so they can't be classified in advance.
- **The agent's own digital business card (preview and download)** — It is made to be shared; its contents are chosen by the agent.
- **Subscription plan price and payment history of the agent's own plan** — The agent's own billing, not client or business data.
- **Values the backend already returns as ciphertext (viewer lacks can_view_sensitive_data)** — Already unreadable; SensitiveValue keeps its existing lock-icon rendering.

## Adding or removing a field

- **Add:** add an entry to `SENSITIVE_FIELDS`; wrap each render with `<SensitiveValue field="key" value={…} render={…} />`; list the files in `surfaces`; regenerate this page.
- **Remove:** delete the registry entry — the compiler then flags every remaining use.
