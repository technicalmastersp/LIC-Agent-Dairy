// Authentication utilities and user management

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

// Set current user session
export const setCurrentUser = (user: User): void => {
  localStorage.setItem('currentUser', JSON.stringify(user));
};

// Get current user
export const getCurrentUser = (): User | null => {
  try {
    const stored = localStorage.getItem('currentUser');
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  return getCurrentUser() !== null;
};