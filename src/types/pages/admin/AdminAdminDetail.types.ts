import type { AdminUserDetailData } from "./AdminUserDetail.types";

export interface AdminAdminDetailData extends AdminUserDetailData {
  permissions?: Record<string, boolean>;
  tempSuperadmin?: { expiresAt: string; reason?: string };
}
