
export type SortField = "amount" | "requestedAt" | null;
export type SortDir = "asc" | "desc";
export interface WithdrawalItem {
  withdrawalId: string;
  referralId: string;
  userId?: string;
  userName: string;
  userEasyId?: string;
  userEmail?: string;
  userProfileImage?: string;
  amount: number;
  method: string;
  status: "requested" | "processed" | "failed";
  requestedAt?: string;
  processedAt?: string;
  rejectionReason?: string;
  upiId?: string;
  accountNumber?: string;
  accountHolder?: string;
  bankName?: string;
  ifscCode?: string;
}
