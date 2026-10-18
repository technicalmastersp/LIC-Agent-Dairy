
export interface MonthlyTrendPoint {
  label: string;
  recordsAdded: number;
  duePolicies: number;
  /** Due months still unpaid; null for the current month (not over yet). */
  missedPayments: number | null;
}
export interface ReferralDashboardData {
  withdrawalsEnabled?: boolean;
  totalL1?: number;
  totalL2?: number;
  availableBalance?: number;
  pendingEarnings?: number;
  totalEarned?: number;
}
