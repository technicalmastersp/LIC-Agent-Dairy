// Referral system utilities
export interface ReferralStats {
  totalReferrals: number;
  totalEarnings: number;
  pendingRewards: number;
  level1Referrals: number;
  level2Referrals: number;
}

export interface ReferralTransaction {
  id: string;
  referrerId: string;
  referredUserId: string;
  planPrice: number;
  commission: number;
  level: 1 | 2;
  date: string;
  status: 'pending' | 'paid';
}

// Initialize referral code from URL on app load
export const initializeReferralCode = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const referralCode = urlParams.get('ref');
  
  if (referralCode) {
    localStorage.setItem('referral_code', referralCode);
    // Clean URL after storing referral code
    const url = new URL(window.location.href);
    url.searchParams.delete('ref');
    window.history.replaceState({}, document.title, url.toString());
  }
};

// Get stored referral code
export const getStoredReferralCode = (): string | null => {
  return localStorage.getItem('referral_code');
};

// Clear referral code (after user signs up)
export const clearReferralCode = () => {
  localStorage.removeItem('referral_code');
};

// Process referral when user purchases a plan
export const processReferral = (userId: string, planPrice: number): void => {
  const referralCode = getStoredReferralCode();
  if (!referralCode) return;

  // Find the referrer by referral code
  const users = JSON.parse(localStorage.getItem('users') || '[]');
  const referrer = users.find((user: any) => user.referralCode === referralCode);
  
  if (!referrer) return;

  // Calculate commission (5% for direct referral)
  const commission = planPrice * 0.05;
  
  // Create referral transaction
  const transaction: ReferralTransaction = {
    id: `ref_${Date.now()}`,
    referrerId: referrer.id,
    referredUserId: userId,
    planPrice,
    commission,
    level: 1,
    date: new Date().toISOString(),
    status: 'pending'
  };

  // Save transaction
  const transactions = JSON.parse(localStorage.getItem('referral_transactions') || '[]');
  transactions.push(transaction);
  localStorage.setItem('referral_transactions', JSON.stringify(transactions));

  // Update referrer stats
  updateReferralStats(referrer.id, commission, 1);

  // Check for level 2 referral (if referrer was also referred)
  processLevel2Referral(referrer.id, planPrice);

  // Mark the user as referred and store their referrer
  const referredUsers = JSON.parse(localStorage.getItem('referred_users') || '{}');
  referredUsers[userId] = referrer.id;
  localStorage.setItem('referred_users', JSON.stringify(referredUsers));

  // Clear the referral code
  clearReferralCode();
};

// Process level 2 referral (2% commission)
const processLevel2Referral = (referrerId: string, planPrice: number): void => {
  const referredUsers = JSON.parse(localStorage.getItem('referred_users') || '{}');
  const originalReferrerId = referredUsers[referrerId];
  
  if (!originalReferrerId) return;

  // Calculate level 2 commission (2%)
  const commission = planPrice * 0.02;
  
  // Create level 2 transaction
  const transaction: ReferralTransaction = {
    id: `ref2_${Date.now()}`,
    referrerId: originalReferrerId,
    referredUserId: referrerId,
    planPrice,
    commission,
    level: 2,
    date: new Date().toISOString(),
    status: 'pending'
  };

  // Save transaction
  const transactions = JSON.parse(localStorage.getItem('referral_transactions') || '[]');
  transactions.push(transaction);
  localStorage.setItem('referral_transactions', JSON.stringify(transactions));

  // Update original referrer stats
  updateReferralStats(originalReferrerId, commission, 2);
};

// Update referral stats for a user
const updateReferralStats = (userId: string, commission: number, level: 1 | 2): void => {
  const stats = getReferralStats(userId);
  
  stats.totalReferrals += level === 1 ? 1 : 0;
  stats.totalEarnings += commission;
  stats.pendingRewards += commission;
  stats.level1Referrals += level === 1 ? 1 : 0;
  stats.level2Referrals += level === 2 ? 1 : 0;

  localStorage.setItem(`referral_stats_${userId}`, JSON.stringify(stats));
};

// Get referral stats for a user
export const getReferralStats = (userId: string): ReferralStats => {
  const stats = localStorage.getItem(`referral_stats_${userId}`);
  if (stats) {
    return JSON.parse(stats);
  }
  
  return {
    totalReferrals: 0,
    totalEarnings: 0,
    pendingRewards: 0,
    level1Referrals: 0,
    level2Referrals: 0
  };
};

// Get all referral transactions for a user
export const getUserReferralTransactions = (userId: string): ReferralTransaction[] => {
  const transactions = JSON.parse(localStorage.getItem('referral_transactions') || '[]');
  return transactions.filter((t: ReferralTransaction) => t.referrerId === userId);
};