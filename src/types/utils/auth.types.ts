export interface PaymentDetails {
  upiId?: string;
  upiVerified?: boolean;
  upiRejectionReason?: string;
  accountNumber?: string;
  ifscCode?: string;
  accountHolder?: string;
  bankName?: string;
  branchName?: string;
  bankVerified?: boolean;
  updatedAt?: string;
}
export interface User {
  profileImage: string;
  id?: string;
  easyId?: string;
  name: string;
  fullAddress: string;
  mobileNumber: string;
  // designation: string;
  email: string;
  createdAt: string;
  subscription?: UserSubscription;
  referralCode?: string;
  referredBy?: string;
  totalRecords?: number;
  isEmailVerified?: boolean;
  emailVerificationToken?: string;
  role?: 'user' | 'admin' | 'superadmin';
  isActive: boolean;
  permissions?: Record<string, boolean>;
  paymentDetails?: PaymentDetails | null;
  hasSeenOnboarding?: boolean;
  notificationPreferences?: {
    policyDueReminders: boolean;
    subscriptionReminders: boolean;
  };
  deactivatedAt?: string | null;
  deactivationNote?: string | null;
}
export interface UserSubscription {
  planId: string;
  duration: string;
  price: number;
  startDate: string;
  endDate: string;
  status: 'active' | 'expired' | 'cancelled' | 'pending_payment';
  planType: string;
}
export interface LoginCredentials {
  userId: string;
  password: string;
}