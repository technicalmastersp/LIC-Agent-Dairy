import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import AdminLayout from "./AdminLayout";
import { Button }  from "@/components/ui/button";
import { Badge }   from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input }   from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { getCurrentUser, type User } from "@/utils/auth";
import { getUserDetails, deleteUser, changeUserSubscription, forceLogoutUser } from "../../../services/adminService";
import RecordDetailsModal from "@/components/RecordDetailsModal";
import type { Record as PolicyRecord } from "@/types/Record";
import { ArrowLeft, Trash2, RefreshCw, Eye, LogOut, Building2, Smartphone, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

const fmt = (d?: string) => d
  ? new Date(d).toLocaleDateString("en-IN", { day:"2-digit", month:"short", year:"numeric" })
  : "—";

const initials = (name = "") =>
  name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();

const PLANS = [
  { id: "1month-free", label: "Free — 1 Month"    },
  { id: "1month", label: "Starter — 1 Month"    },
  { id: "6months",     label: "Basic — 6 Months"  },
  { id: "12months",    label: "Standard — 12 Months" },
  { id: "24months",    label: "Premium — 24 Months"  },
];

interface AdminUserDetailData extends User {
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

const AdminUserDetail = () => {
  const { userId }  = useParams();
  const navigate    = useNavigate();
  const { toast }   = useToast();
  const currentUser = getCurrentUser();

  const [user,          setUser]          = useState<AdminUserDetailData | null>(null);
  const [loading,       setLoading]       = useState(true);
  const [selectedPlan,  setSelectedPlan]  = useState("");
  const [planReason,    setPlanReason]    = useState("");
  const [changingPlan,  setChangingPlan]  = useState(false);
  const [deleteModal,   setDeleteModal]   = useState(false);
  const [deleteReason,  setDeleteReason]  = useState("");
  const [deleting,      setDeleting]      = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<PolicyRecord | null>(null);

  const [logoutModal,  setLogoutModal]  = useState(false);
  const [logoutReason, setLogoutReason] = useState("");
  const [loggingOut,   setLoggingOut]   = useState(false);


  const handleForceLogout = async () => {
    setLoggingOut(true);
    try {
      await forceLogoutUser(userId!, logoutReason || "Session ended by admin.");
      toast({ title: "Logged out", description: `${user?.name}'s session has been ended.` });
      setLogoutModal(false);
      setLogoutReason("");
    } catch (err: unknown) {
      const message = axios.isAxiosError(err) ? err.response?.data?.message : undefined;
      toast({ title: "Error", description: message, variant: "destructive" });
    } finally { setLoggingOut(false); }
  };

  const fetchUser = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getUserDetails(userId!);
      setUser(data);
      setSelectedPlan(data.subscription?.planId || "");
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [userId]);

  useEffect(() => { fetchUser(); }, [fetchUser]);

  const handleChangePlan = async () => {
    if (!selectedPlan) return;
    setChangingPlan(true);
    try {
      await changeUserSubscription(userId!, selectedPlan, planReason);
      toast({ title: "Plan updated", description: `Subscription changed to ${selectedPlan}.` });
      fetchUser();
    } catch (err: unknown) {
      const message = axios.isAxiosError(err) ? err.response?.data?.message : undefined;
      toast({ title: "Error", description: message, variant: "destructive" });
    } finally { setChangingPlan(false); }
  };

  const handleDelete = async () => {
    if (!deleteReason.trim()) {
      toast({ title: "Required", description: "Please enter a reason.", variant: "destructive" });
      return;
    }
    setDeleting(true);
    try {
      await deleteUser(userId!, deleteReason);
      toast({ title: "Deleted", description: "User permanently deleted." });
      navigate("/admin/users");
    } catch (err: unknown) {
      const message = axios.isAxiosError(err) ? err.response?.data?.message : undefined;
      toast({ title: "Error", description: message, variant: "destructive" });
    } finally { setDeleting(false); }
  };

  if (loading) return <AdminLayout><p className="text-sm text-muted-foreground py-10 text-center">Loading…</p></AdminLayout>;
  if (!user)   return <AdminLayout><p className="text-sm text-muted-foreground py-10 text-center">User not found.</p></AdminLayout>;

  return (
    <AdminLayout>
      <div className="space-y-5 max-w-4xl">

        {/* Back + header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <Button size="sm" variant="outline" onClick={() => navigate("/admin/users")}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-xl font-medium">{user.name}</h1>
              <p className="text-xs text-muted-foreground">{user.email} · {user.easyId}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Badge className={user.isActive
              ? "bg-green-100 text-green-700 border border-green-200"
              : "bg-red-100 text-red-700 border border-red-200"}>
              {user.isActive ? "Active" : "Deactivated"}
            </Badge>
            {currentUser?.role === "superadmin" && (
              <Button size="sm" variant="outline"
                className="bg-red-50 hover:bg-red-100 border-red-200 text-red-700"
                onClick={() => setDeleteModal(true)}>
                <Trash2 className="w-3.5 h-3.5 mr-1.5" /> Delete user
              </Button>
            )}
            {currentUser?.role === "superadmin" && (
              <Button size="sm" variant="outline"
                className="bg-orange-50 hover:bg-orange-100 border-orange-200 text-orange-700"
                onClick={() => setLogoutModal(true)}>
                <LogOut className="w-3.5 h-3.5 mr-1.5" /> Force logout
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* User info */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-xs uppercase tracking-wide text-muted-foreground">Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-0">
              <div className="flex items-center gap-3 pb-4 mb-1 border-b border-border">
                <Avatar className="w-14 h-14">
                  {user.profileImage && <AvatarImage src={user.profileImage} alt={user.name} />}
                  <AvatarFallback className="bg-primary/10 text-primary text-base font-semibold">
                    {initials(user.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{user.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{user.easyId}</p>
                </div>
              </div>
              {[
                { label: "Name",         val: user.name },
                { label: "Email",        val: user.email },
                { label: "Mobile",       val: user.mobileNumber || "—" },
                { label: "Address",      val: user.fullAddress  || "—" },
                { label: "Referral Code",  val: user.referralCode   || "—" },
                { label: "Joined",       val: fmt(user.createdAt) },
                { label: "Referred by",  val: user.referredBy   || "—" },
                { label: "Email verified", val: user.isEmailVerified ? "Yes" : "No" },
              ].map(({ label, val }) => (
                <div key={label} className="flex justify-between py-2 border-b border-border last:border-0">
                  <span className="text-xs text-muted-foreground">{label}</span>
                  <span className="text-xs font-medium text-right max-w-[200px] truncate">{val}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Subscription + change plan */}
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-xs uppercase tracking-wide text-muted-foreground">Subscription</CardTitle>
              </CardHeader>
              <CardContent className="space-y-0">
                {[
                  { label: "Plan",    val: user.subscription?.planType || "—" },
                  { label: "Status",  val: user.subscription?.status   || "—" },
                  { label: "Price",   val: `₹${user.subscription?.price ?? 0}` },
                  { label: "Expires", val: fmt(user.subscription?.endDate) },
                ].map(({ label, val }) => (
                  <div key={label} className="flex justify-between py-2 border-b border-border last:border-0">
                    <span className="text-xs text-muted-foreground">{label}</span>
                    <span className="text-xs font-medium">{val}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Change plan — superadmin only */}
            {currentUser?.role === "superadmin" && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-xs uppercase tracking-wide text-muted-foreground flex items-center gap-2">
                    <RefreshCw className="w-3.5 h-3.5" /> Change subscription
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Select value={selectedPlan} onValueChange={setSelectedPlan}>
                    <SelectTrigger className="text-sm">
                      <SelectValue placeholder="Select plan" />
                    </SelectTrigger>
                    <SelectContent>
                      {PLANS.map(p => (
                        <SelectItem key={p.id} value={p.id}>{p.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input placeholder="Reason (optional)" value={planReason}
                    onChange={e => setPlanReason(e.target.value)} />
                  <Button size="sm" className="w-full" onClick={handleChangePlan}
                    disabled={changingPlan || selectedPlan === user.subscription?.planId}>
                    {changingPlan ? "Updating…" : "Update plan"}
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Payment details — debit-card style */}
            {user.paymentDetails && (user.paymentDetails.upiId || user.paymentDetails.accountNumber) && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-xs uppercase tracking-wide text-muted-foreground">Payment details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {user.paymentDetails.accountNumber && (
                    <div className="relative rounded-2xl p-4 text-primary-foreground overflow-hidden shadow-md"
                      style={{ background: "linear-gradient(135deg, #1e3a8a 0%, #1e40af 45%, #2563eb 100%)" }}>
                      <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-white/10" />
                      <div className="relative flex items-center justify-between mb-4">
                        <Building2 className="w-5 h-5 opacity-90" />
                        {user.paymentDetails.bankVerified ? (
                          <Badge className="bg-white/15 text-primary-foreground border-0 text-[10px]"><CheckCircle2 className="w-3 h-3 mr-1" />Verified</Badge>
                        ) : (
                          <Badge className="bg-amber-400/90 text-amber-950 border-0 text-[10px]"><Clock className="w-3 h-3 mr-1" />Pending</Badge>
                        )}
                      </div>
                      <p className="font-mono text-base tracking-[0.15em] mb-3">•••• •••• •••• {user.paymentDetails.accountNumber.slice(-4)}</p>
                      <div className="flex items-end justify-between text-xs">
                        <div>
                          <p className="text-[9px] uppercase text-primary-foreground/60">Holder</p>
                          <p className="uppercase">{user.paymentDetails.accountHolder || "—"}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[9px] uppercase text-primary-foreground/60">{user.paymentDetails.bankName || "Bank"}</p>
                          <p className="text-primary-foreground/80">{user.paymentDetails.ifscCode}{user.paymentDetails.branchName ? ` · ${user.paymentDetails.branchName}` : ""}</p>
                        </div>
                      </div>
                    </div>
                  )}
                  {user.paymentDetails.upiId && (
                    <div className="relative rounded-2xl p-4 text-primary-foreground overflow-hidden shadow-md"
                      style={{ background: "linear-gradient(135deg, #065f46 0%, #059669 50%, #10b981 100%)" }}>
                      <div className="absolute -right-4 -bottom-4 w-20 h-20 rounded-full bg-white/10" />
                      <div className="relative flex items-center justify-between mb-4">
                        <Smartphone className="w-5 h-5 opacity-90" />
                        {user.paymentDetails.upiVerified ? (
                          <Badge className="bg-white/15 text-primary-foreground border-0 text-[10px]"><CheckCircle2 className="w-3 h-3 mr-1" />Verified via IFSC</Badge>
                        ) : user.paymentDetails.upiRejectionReason ? (
                          <Badge className="bg-red-400/90 text-red-950 border-0 text-[10px]"><AlertCircle className="w-3 h-3 mr-1" />Rejected</Badge>
                        ) : (
                          <Badge className="bg-amber-400/90 text-amber-950 border-0 text-[10px]"><Clock className="w-3 h-3 mr-1" />Pending review</Badge>
                        )}
                      </div>
                      <p className="font-mono text-base">{user.paymentDetails.upiId}</p>
                      {user.paymentDetails.upiRejectionReason && (
                        <p className="text-xs text-red-100 mt-2 bg-red-950/30 rounded px-2 py-1">{user.paymentDetails.upiRejectionReason}</p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Referral summary */}
            {user.referral && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-xs uppercase tracking-wide text-muted-foreground">Referral summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-0">
                  {[
                    { label: "Total earned",    val: `₹${user.referral.totalEarned}` },
                    { label: "Available",       val: `₹${user.referral.availableBalance}` },
                    { label: "Withdrawn",       val: `₹${user.referral.totalWithdrawn}` },
                    { label: "L1 referrals",    val: user.referral.totalL1 },
                    { label: "L2 referrals",    val: user.referral.totalL2 },
                  ].map(({ label, val }) => (
                    <div key={label} className="flex justify-between py-2 border-b border-border last:border-0">
                      <span className="text-xs text-muted-foreground">{label}</span>
                      <span className="text-xs font-medium">{val}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Policy records */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-xs uppercase tracking-wide text-muted-foreground">
              Policy records ({user.totalRecords})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!user.records?.length ? (
              <p className="text-sm text-muted-foreground text-center py-4">No records.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted">
                      <th className="text-xs text-left p-2.5 font-medium text-muted-foreground">Name</th>
                      <th className="text-xs text-left p-2.5 font-medium text-muted-foreground">Policy Type</th>
                      <th className="text-xs text-left p-2.5 font-medium text-muted-foreground">Policy no.</th>
                      <th className="text-xs text-left p-2.5 font-medium text-muted-foreground">Sum assured</th>
                      <th className="text-xs text-left p-2.5 font-medium text-muted-foreground">Branch</th>
                      <th className="text-xs text-left p-2.5 font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(user.records ?? []).map((r: PolicyRecord, i: number) => (
                      <tr key={i} className="border-b border-border last:border-0 hover:bg-muted/50">
                        <td className="p-2.5 font-medium">{r.name}</td>
                        <td className="p-2.5">
                          <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">
                            {r?.insuranceType || "Life Insurance"}
                          </span>
                        </td>
                        <td className="p-2.5">
                          <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">
                            {r.currentPolicy?.policyNumber || "—"}
                          </span>
                        </td>
                        <td className="p-2.5 text-xs">₹{r.currentPolicy?.sumAssured || "0"}</td>
                        <td className="p-2.5 text-xs">{r.currentPolicy?.branch || "—"}</td>
                        <td className="p-2.5">
                          <Button size="sm" variant="outline" className="h-7 w-7 p-0"
                            onClick={() => setSelectedRecord(r)}>
                            <Eye className="w-3.5 h-3.5" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Record details modal */}
      <RecordDetailsModal
        record={selectedRecord}
        isOpen={!!selectedRecord}
        onClose={() => setSelectedRecord(null)}
      />

      {/* Delete modal */}
      {deleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-base text-red-600">Delete user permanently</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm">
                <p className="font-medium text-red-700">{user.name}</p>
                <p className="text-xs text-red-600 mt-0.5">
                  This will permanently delete the user and all their data. This cannot be undone.
                </p>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-muted-foreground">Reason for deletion</label>
                <Input placeholder="Enter reason…" value={deleteReason}
                  onChange={e => setDeleteReason(e.target.value)} />
              </div>
              <div className="flex gap-2">
                <Button className="flex-1 bg-red-600 hover:bg-red-700 text-primary-foreground"
                  onClick={handleDelete} disabled={deleting}>
                  {deleting ? "Deleting…" : "Confirm delete"}
                </Button>
                <Button variant="outline" className="flex-1"
                  onClick={() => { setDeleteModal(false); setDeleteReason(""); }}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {logoutModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <LogOut className="w-4 h-4 text-orange-600" /> Force logout
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                <p className="text-sm font-medium text-orange-700">{user.name}</p>
                <p className="text-xs text-orange-600 mt-0.5">
                  Their current session will be immediately invalidated.
                  They'll need to login again on their next request.
                </p>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-muted-foreground">Reason (optional)</label>
                <Input placeholder="e.g. Security update, suspicious activity…"
                  value={logoutReason} onChange={e => setLogoutReason(e.target.value)} />
              </div>
              <div className="flex gap-2">
                <Button className="flex-1 bg-orange-500 hover:bg-orange-600 text-primary-foreground"
                  onClick={handleForceLogout} disabled={loggingOut}>
                  {loggingOut ? "Logging out…" : "Confirm force logout"}
                </Button>
                <Button variant="outline" className="flex-1"
                  onClick={() => { setLogoutModal(false); setLogoutReason(""); }}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminUserDetail;