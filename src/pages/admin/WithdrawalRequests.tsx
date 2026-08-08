
import AdminLayout  from "./AdminLayout";
import { useState, useEffect } from "react";
import { useNavigate }   from "react-router-dom";
import { Button }        from "@/components/ui/button";
import { Badge }         from "@/components/ui/badge";
import { Input }         from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast }      from "@/hooks/use-toast";
import { getCurrentUser, isAuthenticated } from "@/utils/auth";
import { getWithdrawals, approveWithdrawal, rejectWithdrawal } from "../../../services/adminService";
import { CheckCircle2, XCircle, Eye, Filter } from "lucide-react";

const statusStyle: Record<string, string> = {
  requested: "bg-yellow-100 text-yellow-700 border border-yellow-200",
  processed: "bg-green-100 text-green-700 border border-green-200",
  failed:    "bg-red-100 text-red-700 border border-red-200",
};

const fmt = (d?: string) => d
  ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
  : "—";

const WithdrawalRequests = () => {
  const navigate    = useNavigate();
  const { toast }   = useToast();
  const currentUser = getCurrentUser();
  const authenticated = isAuthenticated();

  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [summary,     setSummary]     = useState<any>(null);
  const [loading,     setLoading]     = useState(true);
  const [statusFilter, setStatusFilter] = useState("requested");
  const [rejectModal, setRejectModal]   = useState<{ referralId: string; withdrawalId: string; name: string; amount: number } | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [processing,   setProcessing]   = useState<string | null>(null);

  useEffect(() => {
    if (!authenticated || !currentUser) { navigate("/login"); return; }
    const role = currentUser?.role;
    if (role !== "admin" && role !== "superadmin") { navigate("/"); return; }
    fetchWithdrawals();
  }, [statusFilter]);

  const fetchWithdrawals = async () => {
    try {
      setLoading(true);
      const data = await getWithdrawals(statusFilter);
      setWithdrawals(data.withdrawals);
      setSummary(data.summary);
    } catch (err) {
      console.error(err);
    } finally { setLoading(false); }
  };

  const handleApprove = async (referralId: string, withdrawalId: string, amount: number) => {
    setProcessing(withdrawalId);
    try {
      await approveWithdrawal(referralId, withdrawalId);
      toast({ title: "Approved!", description: `₹${amount} withdrawal approved.` });
      fetchWithdrawals();
    } catch (err: any) {
      toast({ title: "Error", description: err.response?.data?.message, variant: "destructive" });
    } finally { setProcessing(null); }
  };

  const handleReject = async () => {
    if (!rejectModal || !rejectReason.trim()) {
      toast({ title: "Required", description: "Please enter a rejection reason.", variant: "destructive" });
      return;
    }
    setProcessing(rejectModal.withdrawalId);
    try {
      await rejectWithdrawal(rejectModal.referralId, rejectModal.withdrawalId, rejectReason);
      toast({ title: "Rejected", description: `₹${rejectModal.amount} refunded to user wallet.` });
      setRejectModal(null);
      setRejectReason("");
      fetchWithdrawals();
    } catch (err: any) {
      toast({ title: "Error", description: err.response?.data?.message, variant: "destructive" });
    } finally { setProcessing(null); }
  };

  return (
    <AdminLayout>
      <div className="min-h-screen bg-muted/30">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto space-y-6">

            {/* Header */}
            <div>
              <h1 className="text-2xl font-medium text-form-header">Withdrawal Requests</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Review and process user withdrawal requests
              </p>
            </div>

            {/* Summary cards */}
            {summary && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { label: "Pending",   val: summary.totalPending,   color: "text-yellow-600", bg: "bg-yellow-50 border-yellow-200" },
                  { label: "Processed", val: summary.totalProcessed, color: "text-green-600",  bg: "bg-green-50 border-green-200"  },
                  { label: "Failed",    val: summary.totalFailed,    color: "text-red-600",    bg: "bg-red-50 border-red-200"      },
                  { label: "Pending amount", val: `₹${summary.totalAmount}`, color: "text-blue-600", bg: "bg-blue-50 border-blue-200" },
                ].map(({ label, val, color, bg }) => (
                  <Card key={label} className={`border ${bg}`}>
                    <CardContent className="p-4 text-center">
                      <p className={`text-2xl font-medium ${color}`}>{val}</p>
                      <p className="text-xs text-muted-foreground mt-1">{label}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Filter tabs */}
            <div className="flex gap-2 flex-wrap">
              {["requested", "processed", "failed", "all"].map(s => (
                <Button
                  key={s} size="sm"
                  variant={statusFilter === s ? "default" : "outline"}
                  onClick={() => setStatusFilter(s)}
                  className="capitalize"
                >
                  {s}
                </Button>
              ))}
            </div>

            {/* Table */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                  {statusFilter === "all" ? "All" : statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)} withdrawals
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <p className="text-center text-sm text-muted-foreground py-8">Loading…</p>
                ) : !withdrawals.length ? (
                  <p className="text-center text-sm text-muted-foreground py-8">
                    No {statusFilter} withdrawal requests.
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted">
                          <TableHead className="text-xs">User</TableHead>
                          <TableHead className="text-xs">Amount</TableHead>
                          <TableHead className="text-xs">Method</TableHead>
                          <TableHead className="text-xs">Payment details</TableHead>
                          <TableHead className="text-xs">Requested</TableHead>
                          <TableHead className="text-xs">Status</TableHead>
                          {statusFilter === "requested" && (
                            <TableHead className="text-xs">Actions</TableHead>
                          )}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {withdrawals.map((w, i) => (
                          <TableRow key={i} className="hover:bg-muted/50">
                            <TableCell>
                              <p className="text-sm font-medium">{w.userName}</p>
                              <p className="text-xs text-muted-foreground">{w.userEasyId}</p>
                              <p className="text-xs text-muted-foreground">{w.userEmail}</p>
                            </TableCell>
                            <TableCell>
                              <p className="text-sm font-medium text-green-600">₹{w.amount}</p>
                            </TableCell>
                            <TableCell>
                              <Badge className="text-xs bg-blue-100 text-blue-700 border border-blue-200">
                                {w.method}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {w.upiId && <p className="text-xs">{w.upiId}</p>}
                              {w.accountNumber && (
                                <>
                                  <p className="text-xs font-medium">{w.accountHolder}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {w.bankName} · ••••{w.accountNumber.slice(-4)}
                                  </p>
                                  <p className="text-xs text-muted-foreground">{w.ifscCode}</p>
                                </>
                              )}
                            </TableCell>
                            <TableCell>
                              <p className="text-xs">{fmt(w.requestedAt)}</p>
                              {w.processedAt && (
                                <p className="text-xs text-muted-foreground">
                                  Done: {fmt(w.processedAt)}
                                </p>
                              )}
                            </TableCell>
                            <TableCell>
                              <Badge className={`text-xs ${statusStyle[w.status]}`}>
                                {w.status}
                              </Badge>
                            </TableCell>
                            {statusFilter === "requested" && (
                              <TableCell>
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    className="h-7 text-xs bg-green-600 hover:bg-green-700 text-white"
                                    disabled={processing === w.withdrawalId}
                                    onClick={() => handleApprove(w.referralId, w.withdrawalId, w.amount)}
                                  >
                                    <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                                    Approve
                                  </Button>
                                  <Button
                                    size="sm" variant="outline"
                                    className="h-7 text-xs bg-red-50 hover:bg-red-100 border-red-200 text-red-700"
                                    disabled={processing === w.withdrawalId}
                                    onClick={() => setRejectModal({
                                      referralId:   w.referralId,
                                      withdrawalId: w.withdrawalId,
                                      name:         w.userName,
                                      amount:       w.amount,
                                    })}
                                  >
                                    <XCircle className="w-3.5 h-3.5 mr-1" />
                                    Reject
                                  </Button>
                                </div>
                              </TableCell>
                            )}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>

          </div>
        </div>

        {/* Reject modal */}
        {rejectModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle className="text-base">Reject withdrawal</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm">
                  <p className="font-medium text-red-700">{rejectModal.name}</p>
                  <p className="text-red-600">₹{rejectModal.amount} will be refunded to their wallet</p>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-muted-foreground">Reason for rejection (user will see this)</label>
                  <Input
                    placeholder="e.g. Incorrect bank details, please update and retry"
                    value={rejectReason}
                    onChange={e => setRejectReason(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                    onClick={handleReject}
                    disabled={!!processing}
                  >
                    {processing ? "Rejecting…" : "Confirm reject"}
                  </Button>
                  <Button
                    variant="outline" className="flex-1"
                    onClick={() => { setRejectModal(null); setRejectReason(""); }}
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default WithdrawalRequests;