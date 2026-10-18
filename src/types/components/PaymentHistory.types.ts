// Shapes returned by GET/POST/PUT/DELETE /api/user/payments (backend:
// controllers/userController/policyPaymentsController.js → buildPaymentsPayload).

export type MonthStatus = "paid" | "missed" | "due" | "upcoming";

export interface PaymentEntry {
  id: string;
  /** YYYY-MM-DD */
  paidOn: string;
  /** "YYYY-MM" due months this payment settles */
  coversMonths: string[];
  /** Premium paid; null for the row made from a pre-existing last-payment date */
  amount: number | null;
  hasAdditionalCharge: boolean;
  additionalChargeAmount: number;
  totalPaid: number;
  notes: string;
  source: "manual" | "legacy";
  createdAt?: string;
}

export interface ScheduleItem {
  month: string;
  status: MonthStatus;
  paymentId: string | null;
}

export interface PaymentSummary {
  paymentsCount: number;
  totalPremium: number;
  totalAdditionalCharges: number;
  totalPaid: number;
  missedCount: number;
  unpaidMonths: string[];
  nextUpcomingMonth: string | null;
  suggestedPerMonthAmount: number | null;
}

export interface PaymentsPayload {
  record: { recordId: string; name?: string; modeOfPayment: string; lastPaymentDate: string | null };
  payments: PaymentEntry[];
  schedule: ScheduleItem[];
  summary: PaymentSummary;
  legacyLastPaymentDate: string | null;
}

/** The body POSTed/PUT to the API. */
export interface PaymentInput {
  paidOn: string;
  coversMonths: string[];
  amount: number;
  hasAdditionalCharge: boolean;
  additionalChargeAmount: number;
  notes: string;
}
