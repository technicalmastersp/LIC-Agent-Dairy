
export interface AdminItem {
  userId: string;
  name: string;
  email: string;
  easyId?: string;
  isActive: boolean;
  deactivatedAt?: string;
  deactivationNote?: string;
  profileImage?: string;
  permissions?: Record<string, boolean>;
}
export interface SuperAdminItem {
  userId: string;
  name: string;
  email: string;
  easyId?: string;
  userProfileImage?: string;
  tempSuperadmin?: { expiresAt: string; reason?: string };
}
export interface ModalTarget {
  userId: string;
  name: string;
}
