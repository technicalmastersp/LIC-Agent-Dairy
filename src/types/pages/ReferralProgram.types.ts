export interface PaymentDetails {
  upiId?:              string;
  upiVerified?:        boolean;
  upiRejectionReason?: string;
  accountNumber?:      string;
  ifscCode?:           string;
  accountHolder?:      string;
  bankName?:           string;
  branchName?:         string;
  bankVerified?:       boolean;
  updatedAt?:          string;
}
export interface WithdrawalRecord {
  amount:        number;
  status:        "requested" | "processed" | "failed";
  requestedAt:   string;
  processedAt?:  string;
  method:        string;
  upiId?:        string;
  accountNumber?: string;
  bankName?:     string;
  adminNote?:    string;
}
export interface ReferredUser {
  name:          string;
  planType:      string;
  planId:        string;
  joinedAt:      string;
  status:        "active" | "expired" | "trial" | "pending";
  level:         1 | 2;
  referredBy?:   string;
  earning:       number;
  rewardPaid:    boolean;
  rewardExpired: boolean;
  daysLeft?:     number | null;
}
export interface Dashboard {
  referralCode:      string;
  totalL1:           number;
  totalL2:           number;
  totalEarned:       number;
  pendingEarnings:   number;
  availableBalance:  number;
  totalWithdrawn:    number;
  hasPaymentDetails: boolean;
  paymentDetails:    PaymentDetails | null;
  lastWithdrawal:    { amount: number; status: string; requestedAt: string; method: string } | null;
  withdrawalHistory: WithdrawalRecord[];
  referredUsers:     ReferredUser[];
  earningsHistory:   { date: string; description: string; amount: number; status: string; level?: 1 | 2 }[];
}
export interface WithdrawalRowProps {
  w: WithdrawalRecord;
  fmt: (date?: string) => string;
  withdrawStatusStyle: Record<string, string>;
}
export interface ReferralRowProps {
  u: ReferredUser;
  fmt: (date?: string) => string;
  initials: (name: string) => string;
  statusStyle: Record<string, string>;
}