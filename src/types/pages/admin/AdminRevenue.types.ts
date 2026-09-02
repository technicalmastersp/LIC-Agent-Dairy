
export interface ExpenseBreakdownItem {
  category: string;
  amount: number;
}
export interface RevenueSummary {
  income: number;
  totalExpenses: number;
  totalProfit: number;
  totalLoss: number;
  gatewayFees?: number;
  refunds?: number;
  referralPayouts?: number;
  walletRedemptions?: number;
  expenseBreakdown?: ExpenseBreakdownItem[];
}
export interface RevenueTrendPoint {
  label: string;
  income: number;
  expenses: number;
  net: number;
}
export interface RevenueTransaction {
  id: string;
  kind: "income" | "expense" | "payout";
  date?: string;
  description: string;
  user?: string;
  amount: number;
  refundStatus?: "none" | "partial" | "full";
  refundedAmount?: number;
}
