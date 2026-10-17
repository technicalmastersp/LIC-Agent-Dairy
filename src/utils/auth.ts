import type { User } from "@/types/utils/auth.types";
import { USER_UPDATED_EVENT } from "@/utils/userEvents";
// Authentication utilities and user management
// Set current user session
export const setCurrentUser = (user: User): void => {
  localStorage.setItem('currentUser', JSON.stringify(user));
  // Let listeners (e.g. the Hide/Show sensitive-data provider) re-read it.
  window.dispatchEvent(new Event(USER_UPDATED_EVENT));
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