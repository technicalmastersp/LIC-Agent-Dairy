export interface PermissionDef {
  key: string;
  label: string;
  desc: string;
  risk: "low" | "medium" | "high" | "critical";
}

export const PERMISSION_DEFS: PermissionDef[] = [
  { key: "can_view_users",          label: "View users",              desc: "See user list and details",                  risk: "low"    },
  { key: "can_deactivate_users",    label: "Deactivate users",        desc: "Activate or deactivate user accounts",       risk: "medium" },
  { key: "can_view_withdrawals",    label: "View withdrawals",        desc: "See all withdrawal requests",                risk: "low"    },
  { key: "can_approve_withdrawals", label: "Approve withdrawals",     desc: "Approve pending withdrawal requests",        risk: "high"   },
  { key: "can_reject_withdrawals",  label: "Reject withdrawals",      desc: "Reject and refund withdrawal requests",      risk: "high"   },
  { key: "can_view_logs",           label: "View activity logs",      desc: "See admin action logs",                      risk: "medium" },
  { key: "can_change_subscription", label: "Change subscriptions",    desc: "Modify any user's subscription plan",        risk: "high"   },
  { key: "can_delete_users",        label: "Delete users",            desc: "Permanently delete user accounts and data",  risk: "critical"},
  { key: "can_verify_payment_details", label: "Verify payment details", desc: "Approve or reject users' UPI IDs for withdrawal payouts", risk: "high" },
  { key: "can_manage_support", label: "Manage support & suggestions", desc: "View and reply to support tickets, review user suggestions", risk: "medium" },
  { key: "can_view_revenue", label: "View revenue", desc: "See financial reports — income, expenses, profit/loss", risk: "high" },
  { key: "can_manage_expenses", label: "Manage expenses & refunds", desc: "Log expenses, edit/delete entries, process payment refunds", risk: "critical" },
];

export const PERMISSION_RISK_COLOR: Record<string, string> = {
  low:      "text-green-600",
  medium:   "text-yellow-600",
  high:     "text-orange-600",
  critical: "text-red-600",
};
