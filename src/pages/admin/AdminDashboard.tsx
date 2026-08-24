import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, Link }   from "react-router-dom";
import AdminLayout  from "./AdminLayout";
import { Badge }    from "@/components/ui/badge";
import { Button }   from "@/components/ui/button";
import { Input }   from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentUser } from "@/utils/auth";
import {
  getDashboardStats, forceLogoutGroup, getMyPermissions,
  triggerNextMonthDueReminders, triggerMissedPaymentReminders,
} from "../../../services/adminService";
import {
  Users, TrendingUp, Wallet, ArrowDownToLine,
  Clock, CheckCircle2, UserX, Gift,
  ArrowUpRight, ArrowDownRight, RefreshCw, LogOut, AlertTriangle,
  BadgeCheck, LifeBuoy, Lightbulb, IndianRupee, CalendarClock, Mail,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const ACTION_COLORS: Record<string, string> = {
  WITHDRAWAL_APPROVED:       "bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400",
  WITHDRAWAL_REJECTED:       "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400",
  USER_DEACTIVATED:          "bg-orange-100 text-orange-700 dark:bg-orange-950/40 dark:text-orange-400",
  USER_REACTIVATED:          "bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400",
  USER_DELETED:              "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400",
  SUBSCRIPTION_CHANGED:      "bg-purple-100 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400",
  ADMIN_CREATED:             "bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400",
  ADMIN_DEACTIVATED:         "bg-orange-100 text-orange-700 dark:bg-orange-950/40 dark:text-orange-400",
  ADMIN_PERMISSIONS_UPDATED: "bg-indigo-100 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400",
  UPI_VERIFIED:              "bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400",
  UPI_REJECTED:              "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400",
};

const PLAN_COLOR: Record<string, string> = {
  "1month-free": "bg-gray-100 text-gray-600 dark:bg-muted dark:text-muted-foreground",
  "6months":     "bg-violet-100 text-violet-700 dark:bg-violet-950/40 dark:text-violet-400",
  "12months":    "bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400",
  "24months":    "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400",
};

const fmt = (d?: string) => d
  ? new Date(d).toLocaleDateString("en-IN", { day:"2-digit", month:"short" })
  : "—";

const fmtTime = (d?: string) => d
  ? new Date(d).toLocaleString("en-IN", {
      day:"2-digit", month:"short",
      hour:"2-digit", minute:"2-digit"
    })
  : "—";

interface ActivityLogItem {
  action: string;
  adminName?: string;
  targetName?: string;
  createdAt?: string;
}

interface RecentUserItem {
  name: string;
  email: string;
  planId: string;
  planType: string;
  createdAt: string;
}

interface DashboardStats {
  users: { total: number; newThisMonth: number; growthPct: number; deactivated: number };
  subscriptions: { active: number; paid: number; freeTrial: number; expired: number };
  revenue: { total?: number; thisMonthIncome?: number };
  withdrawals: { pending: number; pendingAmount: number; processedAmount: number };
  referrals: { totalEarnings: number };
  recentActivity: ActivityLogItem[];
  recentUsers: RecentUserItem[];
  paymentVerifications?: { pendingUpi?: number };
  support?: { openHighPriority?: number; openGuest?: number; newSuggestions?: number };
}

const AdminDashboard = () => {
  const [permissions, setPermissions] = useState<Record<string, boolean> | null>(null);
  const { toast }   = useToast();
  const navigate    = useNavigate();
  const currentUser = getCurrentUser();

  const [stats,     setStats]     = useState<DashboardStats | null>(null);
  const [loading,   setLoading]   = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [groupLogoutModal,  setGroupLogoutModal]  = useState<string | null>(null);
  const [groupLogoutReason, setGroupLogoutReason] = useState("");
  const [groupLoggingOut,   setGroupLoggingOut]   = useState(false);

  const [sendingNextMonth, setSendingNextMonth] = useState(false);
  const [sendingMissed,    setSendingMissed]    = useState(false);
  
  const handleGroupLogout = async () => {
    if (!groupLogoutModal) return;
    setGroupLoggingOut(true);
    try {
      const res = await forceLogoutGroup(
        groupLogoutModal as "all_users" | "all_admins" | "everyone",
        groupLogoutReason || "Session invalidated by superadmin."
      );
      toast({ title: "Done", description: res.message });
      setGroupLogoutModal(null);
      setGroupLogoutReason("");
    } catch (err: unknown) {
      const message = axios.isAxiosError(err) ? err.response?.data?.message : undefined;
      toast({ title: "Error", description: message, variant: "destructive" });
    } finally { setGroupLoggingOut(false); }
  };

  useEffect(() => {
    getMyPermissions().then(d => setPermissions(d.permissions)).catch(() => {});
    fetchStats();
  }, []);

  const handleTriggerNextMonthReminders = async () => {
    setSendingNextMonth(true);
    try {
      const res = await triggerNextMonthDueReminders();
      toast({ title: "Reminders sent", description: `Sent to ${res.data.sent} agent(s) with policies due next month.` });
    } catch (err: unknown) {
      const message = axios.isAxiosError(err) ? err.response?.data?.message : undefined;
      toast({ title: "Error", description: message, variant: "destructive" });
    } finally { setSendingNextMonth(false); }
  };

  const handleTriggerMissedReminders = async () => {
    setSendingMissed(true);
    try {
      const res = await triggerMissedPaymentReminders();
      toast({ title: "Reminders sent", description: `Sent to ${res.data.sent} agent(s) with overdue policies.` });
    } catch (err: unknown) {
      const message = axios.isAxiosError(err) ? err.response?.data?.message : undefined;
      toast({ title: "Error", description: message, variant: "destructive" });
    } finally { setSendingMissed(false); }
  };

  const fetchStats = async (isRefresh = false) => {
    try {
      if (isRefresh) { setRefreshing(true); } else { setLoading(true); }
      setStats(await getDashboardStats());
    } catch (err) { console.error(err); }
    finally { setLoading(false); setRefreshing(false); }
  };

  if (loading) return (
    <AdminLayout>
      <p className="text-center text-sm text-muted-foreground py-20">Loading dashboard…</p>
    </AdminLayout>
  );

  if (!stats) return (
    <AdminLayout>
      <p className="text-center text-sm text-muted-foreground py-20">Failed to load stats.</p>
    </AdminLayout>
  );

  const { users, subscriptions, revenue, withdrawals, referrals, recentActivity, recentUsers } = stats;

  return (
    <AdminLayout>
      <div className="space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-xl font-medium">Dashboard</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Welcome back, {currentUser?.name} ·{" "}
              <span className="capitalize">{currentUser?.role}</span>
            </p>
          </div>
          <Button size="sm" variant="outline" onClick={() => fetchStats(true)} disabled={refreshing}>
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${refreshing ? "animate-spin" : ""}`} />
            {refreshing ? "Refreshing…" : "Refresh"}
          </Button>
        </div>

        {/* ── Primary stat cards ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            {
              label:   "Total users",
              val:     users.total,
              icon:    <Users className="w-5 h-5 text-blue-600" />,
              bg:      "bg-blue-50 border-blue-200",
              sub:     `+${users.newThisMonth} this month`,
              trend:   users.growthPct,
              link:    "/admin/users",
            },
            {
              label:   "Active subscriptions",
              val:     subscriptions.active,
              icon:    <CheckCircle2 className="w-5 h-5 text-green-600" />,
              bg:      "bg-green-50 border-green-200",
              sub:     `${subscriptions.paid} paid · ${subscriptions.freeTrial} trial`,
              link:    "/admin/users?status=active",
            },
            {
              label:   "Total revenue",
              val:     `₹${(revenue.total ?? 0).toLocaleString("en-IN")}`,
              icon:    <TrendingUp className="w-5 h-5 text-purple-600" />,
              bg:      "bg-purple-50 border-purple-200 dark:bg-purple-950/40 dark:border-purple-900",
              sub:     `${subscriptions.paid} paid users`,
              link:    null,
            },
            {
              label:   "Pending withdrawals",
              val:     withdrawals.pending,
              icon:    <Clock className="w-5 h-5 text-amber-600" />,
              bg:      `border ${withdrawals.pending > 0 ? "bg-amber-50 border-amber-300 dark:bg-amber-950/40 dark:border-amber-800" : "bg-gray-50 border-gray-200 dark:bg-muted dark:border-border"}`,
              sub:     `₹${withdrawals.pendingAmount.toLocaleString("en-IN")} pending`,
              link:    "/admin/withdrawals",
              urgent:  withdrawals.pending > 0,
            },
            ...(currentUser?.role === "superadmin" || permissions?.can_verify_payment_details ? [{
              label:   "Pending UPI verifications",
              val:     stats.paymentVerifications?.pendingUpi ?? 0,
              icon:    <BadgeCheck className="w-5 h-5 text-blue-600" />,
              bg:      `border ${(stats.paymentVerifications?.pendingUpi ?? 0) > 0 ? "bg-blue-50 border-blue-300 dark:bg-blue-950/40 dark:border-blue-800" : "bg-gray-50 border-gray-200 dark:bg-muted dark:border-border"}`,
              sub:     "Awaiting manual review",
              link:    "/admin/payment-verifications",
              urgent:  (stats.paymentVerifications?.pendingUpi ?? 0) > 0,
            }] : []),
            ...(currentUser?.role === "superadmin" || permissions?.can_manage_support ? [
              {
                label:   "Open support tickets",
                val:     (stats.support?.openHighPriority ?? 0) + (stats.support?.openGuest ?? 0),
                icon:    <LifeBuoy className="w-5 h-5 text-orange-600" />,
                bg:      `border ${(stats.support?.openHighPriority ?? 0) > 0 ? "bg-orange-50 border-orange-300 dark:bg-orange-950/40 dark:border-orange-800" : "bg-gray-50 border-gray-200 dark:bg-muted dark:border-border"}`,
                sub:     `${stats.support?.openHighPriority ?? 0} high · ${stats.support?.openGuest ?? 0} guest`,
                link:    "/admin/support",
                urgent:  (stats.support?.openHighPriority ?? 0) > 0,
              },
              {
                label:   "New suggestions",
                val:     stats.support?.newSuggestions ?? 0,
                icon:    <Lightbulb className="w-5 h-5 text-purple-600" />,
                bg:      `border ${(stats.support?.newSuggestions ?? 0) > 0 ? "bg-purple-50 border-purple-300 dark:bg-purple-950/40 dark:border-purple-800" : "bg-gray-50 border-gray-200 dark:bg-muted dark:border-border"}`,
                sub:     "Awaiting review",
                link:    "/admin/suggestions",
                urgent:  false,
              },
            ] : []),
            ...(currentUser?.role === "superadmin" || permissions?.can_view_revenue ? [{
              label:   "This month's income",
              val:     `₹${(stats.revenue?.thisMonthIncome ?? 0).toLocaleString("en-IN")}`,
              icon:    <IndianRupee className="w-5 h-5 text-green-600" />,
              bg:      "border bg-green-50 border-green-200 dark:bg-green-950/40 dark:border-green-900",
              sub:     "View full revenue report",
              link:    "/admin/revenue",
              urgent:  false,
            }] : []),
          ].map(({ label, val, icon, bg, sub, trend, link, urgent }) => (
            <Card key={label}
              className={`border ${bg} ${link ? "cursor-pointer hover:shadow-md transition-shadow" : ""} ${urgent ? "ring-2 ring-amber-400" : ""}`}
              onClick={() => link && navigate(link)}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="w-9 h-9 rounded-lg bg-white dark:bg-background border border-border flex items-center justify-center">
                    {icon}
                  </div>
                  {trend !== undefined && (
                    <span className={`text-xs font-medium flex items-center gap-0.5 ${trend >= 0 ? "text-green-600" : "text-red-500"}`}>
                      {trend >= 0
                        ? <ArrowUpRight className="w-3 h-3" />
                        : <ArrowDownRight className="w-3 h-3" />}
                      {Math.abs(trend)}%
                    </span>
                  )}
                </div>
                <p className="text-2xl font-medium mt-2">{val}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
                {sub && <p className="text-xs text-muted-foreground mt-1 opacity-70">{sub}</p>}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* ── Secondary stats ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Expired subscriptions", val: subscriptions.expired, color: "text-red-600",    icon: <UserX    className="w-4 h-4" /> },
            { label: "Deactivated users",     val: users.deactivated,     color: "text-orange-600", icon: <UserX    className="w-4 h-4" /> },
            { label: "Total paid out",        val: `₹${withdrawals.processedAmount.toLocaleString("en-IN")}`, color: "text-green-600", icon: <Wallet className="w-4 h-4" /> },
            { label: "Total referral rewards",val: `₹${referrals.totalEarnings.toLocaleString("en-IN")}`,    color: "text-blue-600",  icon: <Gift   className="w-4 h-4" /> },
          ].map(({ label, val, color, icon }) => (
            <Card key={label}>
              <CardContent className="p-4 flex items-center gap-3">
                <div className={`shrink-0 ${color}`}>{icon}</div>
                <div>
                  <p className={`text-lg font-medium ${color}`}>{val}</p>
                  <p className="text-xs text-muted-foreground">{label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {currentUser?.role === "superadmin" && (
          <Card className="border-orange-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-xs uppercase tracking-wide text-muted-foreground flex items-center gap-2">
                <LogOut className="w-4 h-4 text-orange-600" /> Force logout
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-xs text-muted-foreground">
                Immediately invalidate sessions for a group of users.
                They'll need to login again on their next request.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {[
                  { target: "all_users",  label: "All users",  desc: `${stats?.users?.total ?? 0} users`,   color: "border-blue-200 text-blue-700 hover:bg-blue-50"   },
                  { target: "all_admins", label: "All admins", desc: "All admin accounts",                  color: "border-orange-200 text-orange-700 hover:bg-orange-50" },
                  { target: "everyone",   label: "Everyone",   desc: "Users + admins",                      color: "border-red-200 text-red-700 hover:bg-red-50"       },
                ].map(({ target, label, desc, color }) => (
                  <button key={target}
                    className={`border rounded-lg p-3 text-left transition-colors ${color}`}
                    onClick={() => setGroupLogoutModal(target)}>
                    <p className="text-sm font-medium">{label}</p>
                    <p className="text-xs opacity-70 mt-0.5">{desc}</p>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
        
        {currentUser?.role === "superadmin" && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-xs uppercase tracking-wide text-muted-foreground flex items-center gap-2">
                <Mail className="w-4 h-4 text-blue-600" /> Policy reminder emails
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-1">
                These run automatically on the 28th and 1st of every month — trigger them manually here if needed.
              </p>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-3">
              <Button variant="outline" onClick={handleTriggerNextMonthReminders} disabled={sendingNextMonth}>
                <CalendarClock className="w-4 h-4 mr-2" />
                {sendingNextMonth ? "Sending…" : "Send next-month due reminders"}
              </Button>
              <Button variant="outline" onClick={handleTriggerMissedReminders} disabled={sendingMissed}>
                <AlertTriangle className="w-4 h-4 mr-2" />
                {sendingMissed ? "Sending…" : "Send missed-payment reminders"}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Group logout confirmation modal */}
        {groupLogoutModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-500" /> Confirm force logout
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm font-medium text-red-700 capitalize">
                    Target: {groupLogoutModal.replace(/_/g, " ")}
                  </p>
                  <p className="text-xs text-red-600 mt-0.5">
                    All matching sessions will be immediately invalidated.
                    Your own session will not be affected.
                  </p>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-muted-foreground">Reason (optional)</label>
                  <Input placeholder="e.g. Security patch deployed, token refresh required…"
                    value={groupLogoutReason}
                    onChange={e => setGroupLogoutReason(e.target.value)} />
                </div>
                <div className="flex gap-2">
                  <Button className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                    onClick={handleGroupLogout} disabled={groupLoggingOut}>
                    {groupLoggingOut ? "Processing…" : "Confirm logout"}
                  </Button>
                  <Button variant="outline" className="flex-1"
                    onClick={() => { setGroupLogoutModal(null); setGroupLogoutReason(""); }}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* ── Quick actions ── */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-xs uppercase tracking-wide text-muted-foreground">Quick actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {[
                { label: "View pending withdrawals", path: "/admin/withdrawals",         show: true,                                      urgent: withdrawals.pending > 0 },
                { label: "View all users",           path: "/admin/users",               show: true,                                      urgent: false },
                { label: "View expired plans",       path: "/admin/users?status=plan+expired",show: true,                                      urgent: subscriptions.expired > 0 },
                { label: "Manage admins",            path: "/admin/admins",              show: currentUser?.role === "superadmin",         urgent: false },
                { label: "Activity logs",            path: "/admin/logs",                show: currentUser?.role === "superadmin",         urgent: false },
              ].filter(a => a.show).map(({ label, path, urgent }) => (
                <Button key={label} size="sm"
                  variant={urgent ? "default" : "outline"}
                  className={urgent ? "bg-amber-500 hover:bg-amber-600 text-white" : ""}
                  onClick={() => navigate(path)}>
                  {urgent && <Clock className="w-3.5 h-3.5 mr-1.5" />}
                  {label}
                  {urgent && withdrawals.pending > 0 && label.includes("withdrawal") && (
                    <Badge className="ml-1.5 bg-white text-amber-700 text-xs px-1.5">{withdrawals.pending}</Badge>
                  )}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

          {/* ── Recent activity ── */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-xs uppercase tracking-wide text-muted-foreground flex items-center justify-between">
                Recent activity
                {currentUser?.role === "superadmin" && (
                  <Link to="/admin/logs" className="text-xs text-blue-600 hover:underline normal-case">View all →</Link>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!recentActivity?.length ? (
                <p className="text-sm text-muted-foreground text-center py-4">No activity yet.</p>
              ) : (
                <div>
                  {recentActivity.map((log: ActivityLogItem, i: number) => (
                    <div key={i} className="flex items-start gap-2.5 py-2.5 border-b border-border last:border-0">
                      <Badge className={`text-xs shrink-0 mt-0.5 ${ACTION_COLORS[log.action] || "bg-gray-100 text-gray-600 dark:bg-muted dark:text-muted-foreground"}`}>
                        {log.action.replace(/_/g," ")}
                      </Badge>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate">
                          {log.adminName}
                          {log.targetName && <span className="text-muted-foreground"> → {log.targetName}</span>}
                        </p>
                        <p className="text-xs text-muted-foreground">{fmtTime(log.createdAt)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* ── Recently joined users ── */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-xs uppercase tracking-wide text-muted-foreground flex items-center justify-between">
                Recently joined
                <Link to="/admin/users" className="text-xs text-blue-600 hover:underline normal-case">View all →</Link>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!recentUsers?.length ? (
                <p className="text-sm text-muted-foreground text-center py-4">No users yet.</p>
              ) : (
                <div>
                  {recentUsers.map((u: RecentUserItem, i: number) => (
                    <div key={i} className="flex items-center gap-2.5 py-2.5 border-b border-border last:border-0">
                      <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-medium shrink-0">
                        {u.name.split(" ").map((w: string) => w[0]).join("").slice(0,2).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{u.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                      </div>
                      <div className="shrink-0 text-right">
                        <Badge className={`text-xs ${PLAN_COLOR[u.planId] || "bg-gray-100 text-gray-600 dark:bg-muted dark:text-muted-foreground"}`}>
                          {u.planType}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-0.5">{fmt(u.createdAt)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;