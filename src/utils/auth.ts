// Authentication utilities and user management
import { processReferral } from "./referral";

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
  password: string;
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

// Get all customers
export const getCustomersList = (): User[] => {
  try {
    const stored = localStorage.getItem('customers-list');
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error loading customers list:', error);
    return [];
  }
};

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

// Update user subscription
export const updateUserSubscription = (userId: string, subscription: UserSubscription): boolean => {
  try {
    const customersList = getCustomersList();
    const updatedCustomers = customersList.map(user => 
      user.id === userId ? { ...user, subscription } : user
    );
    localStorage.setItem('customers-list', JSON.stringify(updatedCustomers));
    
    // Update current user session if it's the same user
    const currentUser = getCurrentUser();
    if (currentUser && currentUser.id === userId) {
      setCurrentUser({ ...currentUser, subscription });
    }
    
    // Process referral reward if plan was purchased
    if (subscription.status === 'active') {
      const planPrices: Record<string, number> = {
        'plan-6': 599,
        'plan-12': 1099,
        'plan-24': 2099
      };
      const planPrice = planPrices[subscription.planId];
      if (planPrice) {
        processReferral(userId, planPrice);
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error updating user subscription:', error);
    return false;
  }
};

// Generate referral code
/* export const generateReferralCode = (name: string, userId: string): string => {
  const nameClean = name.toLowerCase().replace(/[^a-z]/g, '').slice(0, 4);
  const userIdEnd = userId.slice(-4);
  return `${nameClean}${userIdEnd}`.toUpperCase();
}; */