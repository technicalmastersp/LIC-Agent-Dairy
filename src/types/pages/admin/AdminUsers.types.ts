import type { STATUS_OPTIONS, PLAN_SORT_OPTIONS } from "@/pages/admin/AdminUsers";

export type StatusFilter = typeof STATUS_OPTIONS[number];
export type PlanSort = keyof typeof PLAN_SORT_OPTIONS;
export interface UserSubscriptionInfo {
  planId?: string;
  planType?: string;
  status?: string;
}
export interface AdminUserRow {
  userId: string;
  name: string;
  email: string;
  easyId?: string;
  mobileNumber?: string;
  profileImage?: string;
  isActive: boolean;
  totalRecords?: number;
  createdAt?: string;
  subscription: UserSubscriptionInfo;
}
export interface ModalTarget {
  userId: string;
  name: string;
}
