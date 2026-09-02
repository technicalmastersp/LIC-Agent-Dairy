
export interface ActivityLogItem {
  action: string;
  adminName?: string;
  targetName?: string;
  createdAt?: string;
}
export interface RecentUserItem {
  name: string;
  email: string;
  planId: string;
  planType: string;
  createdAt: string;
}
export interface DashboardStats {
  users: { total: number; newThisMonth: number; growthPct: number; deactivated: number };
  subscriptions: { active: number; paid: number; freeTrial: number; expired: number };
  revenue: { total?: number; thisMonthIncome?: number };
  withdrawals: { pending: number; pendingAmount: number; processedAmount: number };
  referrals: { totalEarnings: number };
  recentActivity: ActivityLogItem[];
  recentUsers: RecentUserItem[];
  paymentVerifications?: { pendingUpi?: number };
  support?: { openHighPriority?: number; openGuest?: number; newSuggestions?: number };
}
