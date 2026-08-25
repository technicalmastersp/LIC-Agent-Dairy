import AdminLayout  from "./AdminLayout";
import { useState, useEffect } from "react";
import axios from "axios";
import { Button }        from "@/components/ui/button";
import { Badge }         from "@/components/ui/badge";
import { Input }         from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast }      from "@/hooks/use-toast";
import { getPendingUpiVerifications, verifyUpiId, rejectUpiId } from "../../../services/adminService";
import { CheckCircle2, XCircle, RefreshCw } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

const initials = (name = "") =>
  name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();

const fmt = (d?: string) => d
  ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
  : "—";

interface PendingUpiVerification {
  userId: string;
  userName: string;
  userEasyId?: string;
  userEmail?: string;
  userProfileImage?: string;
  upiId: string;
  upiRejectionReason?: string;
  updatedAt?: string;
}

const PaymentVerifications = () => {
  const { toast }      = useToast();

  const [pending, setPending]     = useState<PendingUpiVerification[]>([]);
  const [loading, setLoading]     = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [processing, setProcessing] = useState<string | null>(null);

  const [rejectModal, setRejectModal] = useState<{ userId: string; name: string; upiId: string } | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  useEffect(() => {
    fetchPending();
  }, []);

  const fetchPending = async (isRefresh = false) => {
    try {
      if (isRefresh) { setRefreshing(true); } else { setLoading(true); }
      const data = await getPendingUpiVerifications();
      setPending(data.pending ?? []);
    } catch (err) {
      console.error(err);
      if (!isRefresh) setPending([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleApprove = async (userId: string) => {
    setProcessing(userId);
    try {
      await verifyUpiId(userId);
      toast({ title: "Verified!", description: "UPI ID marked as verified." });
      setPending(prev => prev.filter(p => p.userId !== userId));
    } catch (err: unknown) {
      const message = axios.isAxiosError(err) ? err.response?.data?.message : undefined;
      toast({ title: "Error", description: message, variant: "destructive" });
    } finally { setProcessing(null); }
  };

  const handleReject = async () => {
    if (!rejectModal || !rejectReason.trim()) {
      toast({ title: "Required", description: "Please enter a rejection reason.", variant: "destructive" });
      return;
    }
    setProcessing(rejectModal.userId);
    try {
      await rejectUpiId(rejectModal.userId, rejectReason);
      toast({ title: "Rejected", description: "The user will see this reason on their account." });
      setPending(prev => prev.filter(p => p.userId !== rejectModal.userId));
      setRejectModal(null);
      setRejectReason("");
    } catch (err: unknown) {
      const message = axios.isAxiosError(err) ? err.response?.data?.message : undefined;
      toast({ title: "Error", description: message, variant: "destructive" });
    } finally { setProcessing(null); }
  };

  return (
    <AdminLayout>
      <div className="min-h-screen bg-muted/30">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-5xl mx-auto space-y-6">

            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <h1 className="text-2xl font-medium text-form-header">Pending UPI Verifications</h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Bank accounts are auto-verified via IFSC lookup. UPI IDs require manual review.
                </p>
              </div>
              <Button size="sm" variant="outline" onClick={() => fetchPending(true)} disabled={refreshing}>
                <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${refreshing ? "animate-spin" : ""}`} />
                {refreshing ? "Refreshing…" : "Refresh"}
              </Button>
            </div>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                  Pending
                  <span className="normal-case font-normal ml-2 text-muted-foreground">({pending.length})</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <p className="text-center text-sm text-muted-foreground py-8">Loading…</p>
                ) : !pending.length ? (
                  <p className="text-center text-sm text-muted-foreground py-8">No pending UPI verifications.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted">
                          <TableHead className="text-xs">User</TableHead>
                          <TableHead className="text-xs">UPI ID</TableHead>
                          <TableHead className="text-xs">Submitted</TableHead>
                          <TableHead className="text-xs">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {pending.map((p) => (
                          <TableRow key={p.userId} className="hover:bg-muted/50">
                            <TableCell>
                              <div className="flex items-center gap-2.5">
                                <Avatar className="w-8 h-8 shrink-0">
                                  {p.userProfileImage && <AvatarImage src={p.userProfileImage} alt={p.userName} />}
                                  <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                                    {initials(p.userName)}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="min-w-0">
                                  <p className="text-sm font-medium">{p.userName}</p>
                                  <p className="text-xs text-muted-foreground">{p.userEasyId}</p>
                                  <p className="text-xs text-muted-foreground">{p.userEmail}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <p className="text-sm font-mono">{p.upiId}</p>
                              {p.upiRejectionReason && (
                                <p className="text-xs text-red-600 mt-0.5">Previously rejected: {p.upiRejectionReason}</p>
                              )}
                            </TableCell>
                            <TableCell>
                              <p className="text-xs">{fmt(p.updatedAt)}</p>
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  className="h-7 text-xs bg-green-600 hover:bg-green-700 text-primary-foreground"
                                  disabled={processing === p.userId}
                                  onClick={() => handleApprove(p.userId)}
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Verify
                                </Button>
                                <Button
                                  size="sm" variant="outline"
                                  className="h-7 text-xs bg-red-50 hover:bg-red-100 border-red-200 text-red-700"
                                  disabled={processing === p.userId}
                                  onClick={() => setRejectModal({ userId: p.userId, name: p.userName, upiId: p.upiId })}
                                >
                                  <XCircle className="w-3.5 h-3.5 mr-1" /> Reject
                                </Button>
                              </div>
                            </TableCell>
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

        {rejectModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle className="text-base">Reject UPI ID</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm">
                  <p className="font-medium text-red-700">{rejectModal.name}</p>
                  <p className="text-red-600 font-mono text-xs mt-0.5">{rejectModal.upiId}</p>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-muted-foreground">Reason for rejection (user will see this)</label>
                  <Input
                    placeholder="e.g. UPI ID doesn't match account holder name"
                    value={rejectReason}
                    onChange={e => setRejectReason(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    className="flex-1 bg-red-600 hover:bg-red-700 text-primary-foreground"
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

export default PaymentVerifications;