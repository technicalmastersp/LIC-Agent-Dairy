// Authentication utilities and user management
import { processReferral } from "./referral";

export interface User {
  id: string;
  easyId: string;
  name: string;
  fullAddress: string;
  mobileNumber: string;
  designation: string;
  email: string;
  password: string;
  createdAt: string;
  subscription?: UserSubscription;
  referralCode?: string;
  referredBy?: string;
}

export interface UserSubscription {
  planId: string;
  duration: string;
  price: number;
  startDate: string;
  endDate: string;
  status: 'active' | 'expired' | 'cancelled';
}

export interface LoginCredentials {
  userId: string;
  password: string;
}

// Generate auto User ID
export const generateAutoUserId = (): string => {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `UID${timestamp}${random}`;
};

// Generate easy-to-remember User ID
export const generateEasyUserId = (name: string, mobile: string, address: string): string => {
  const nameClean = name.toLowerCase().replace(/[^a-z]/g, '').slice(0, 6);
  const mobileEnd = mobile.slice(-3);
  const addressClean = address.toLowerCase().replace(/[^a-z]/g, '').slice(0, 5);
  return `${nameClean}${mobileEnd}${addressClean}`;
};

// Save user to customers-list
export const saveUser = (user: User): boolean => {
  try {
    const customersList = getCustomersList();
    
    // Check if email or mobile already exists
    const existingUser = customersList.find(u => 
      u.email === user.email || u.mobileNumber === user.mobileNumber
    );
    
    if (existingUser) {
      return false; // User already exists
    }
    
    customersList.push(user);
    localStorage.setItem('customers-list', JSON.stringify(customersList));
    return true;
  } catch (error) {
    console.error('Error saving user:', error);
    return false;
  }
};

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

// Validate login credentials
export const validateLogin = (credentials: LoginCredentials): User | null => {
  try {
    const customersList = getCustomersList();
    const user = customersList.find(u => 
      (u.id === credentials.userId || u.easyId === credentials.userId) && 
      u.password === credentials.password
    );
    return user || null;
  } catch (error) {
    console.error('Error validating login:', error);
    return null;
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

// Logout user
export const logout = (): void => {
  localStorage.removeItem('currentUser');
};

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  return getCurrentUser() !== null;
};

// Initialize test user credentials
export const initializeTestUser = (): void => {
  const testUser: User = {
    id: 'UID123456',
    easyId: 'test123demo',
    name: 'Test User',
    fullAddress: '123 Demo Street, Test City, Demo State - 123456',
    mobileNumber: '9876543210',
    designation: 'Software Developer',
    email: 'test@demo.com',
    password: 'test123',
    createdAt: new Date().toISOString()
  };

  const customersList = getCustomersList();
  const existingTest = customersList.find(u => u.id === testUser.id);
  
  if (!existingTest) {
    customersList.push(testUser);
    localStorage.setItem('customers-list', JSON.stringify(customersList));
  }
};

// Save user records to dedicated folder simulation
export const saveUserRecord = (userId: string, record: any): boolean => {
  try {
    const userRecordsKey = `customers-record-lists-${userId}`;
    const existingRecords = JSON.parse(localStorage.getItem(userRecordsKey) || '[]');
    
    const recordWithId = {
      ...record,
      id: Date.now().toString(),
      userId: userId,
      createdAt: new Date().toISOString()
    };
    
    existingRecords.push(recordWithId);
    localStorage.setItem(userRecordsKey, JSON.stringify(existingRecords));
    return true;
  } catch (error) {
    console.error('Error saving user record:', error);
    return false;
  }
};

// Get user records
export const getUserRecords = (userId: string): any[] => {
  try {
    const userRecordsKey = `customers-record-lists-${userId}`;
    const stored = localStorage.getItem(userRecordsKey);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error loading user records:', error);
    return [];
  }
};

// Delete user record
export const deleteUserRecord = (userId: string, recordId: string): boolean => {
  try {
    const userRecordsKey = `customers-record-lists-${userId}`;
    const existingRecords = JSON.parse(localStorage.getItem(userRecordsKey) || '[]');
    const filteredRecords = existingRecords.filter((record: any) => record.id !== recordId);
    localStorage.setItem(userRecordsKey, JSON.stringify(filteredRecords));
    return true;
  } catch (error) {
    console.error('Error deleting user record:', error);
    return false;
  }
};

// Update user record
export const updateUserRecord = (userId: string, recordId: string, updatedData: any): boolean => {
  try {
    const userRecordsKey = `customers-record-lists-${userId}`;
    const existingRecords = JSON.parse(localStorage.getItem(userRecordsKey) || '[]');
    const updatedRecords = existingRecords.map((record: any) => 
      record.id === recordId ? { ...record, ...updatedData } : record
    );
    localStorage.setItem(userRecordsKey, JSON.stringify(updatedRecords));
    return true;
  } catch (error) {
    console.error('Error updating user record:', error);
    return false;
  }
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
export const generateReferralCode = (name: string, userId: string): string => {
  const nameClean = name.toLowerCase().replace(/[^a-z]/g, '').slice(0, 4);
  const userIdEnd = userId.slice(-4);
  return `${nameClean}${userIdEnd}`.toUpperCase();
};