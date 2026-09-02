import type { User } from "@/types/utils/auth.types";
import type { Record as PolicyRecord } from "@/types/Record";

export interface AdminUserDetailData extends User {
  userId: string;
  records?: PolicyRecord[];
  referral?: {
    totalEarned: number;
    availableBalance: number;
    totalWithdrawn: number;
    totalL1: number;
    totalL2: number;
  };
}
