
export interface PendingUpiVerification {
  userId: string;
  userName: string;
  userEasyId?: string;
  userEmail?: string;
  userProfileImage?: string;
  upiId: string;
  upiRejectionReason?: string;
  updatedAt?: string;
}
