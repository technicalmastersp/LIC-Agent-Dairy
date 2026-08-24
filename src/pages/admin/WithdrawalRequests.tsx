import AdminLayout  from "./AdminLayout";
import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { Button }        from "@/components/ui/button";
import { Badge }         from "@/components/ui/badge";
import { Input }         from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast }      from "@/hooks/use-toast";
import { getWithdrawals, approveWithdrawal, rejectWithdrawal } from "../../../services/adminService";
import { CheckCircle2, XCircle, Eye, Search, ArrowUpDown, X, RefreshCw } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

const initials = (name = "") =>
  name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();

const statusStyle: Record<string, string> = {
  requested: "bg-yellow-100 text-yellow-700 border border-yellow-200",
  processed: "bg-green-100 text-green-700 border border-green-200",
  failed:    "bg-red-100 text-red-700 border border-red-200",
};

const fmt = (d?: string) => d
  ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
  : "—";

type SortField = "amount" | "requestedAt" | null;
type SortDir = "asc" | "desc";

interface WithdrawalItem {
  withdrawalId: string;
  referralId: string;
  userId?: string;
  userName: string;
  userEasyId?: string;
  userEmail?: string;
  userProfileImage?: string;
  amount: number;
  method: string;
  status: "requested" | "processed" | "failed";
  requestedAt?: string;
  processedAt?: string;
  rejectionReason?: string;
  upiId?: string;
  accountNumber?: string;
  accountHolder?: string;
  bankName?: string;
  ifscCode?: string;
}

const WithdrawalRequests = () => {
  const { toast }   = useToast();

  // ---- data (fetched once) ----
  const [allWithdrawals, setAllWithdrawals] = useState<WithdrawalItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // ---- client-side filter / search / sort state ----
  const [statusFilter, setStatusFilter] = useState("requested");
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sortField, setSortField] = useState<SortField>(null);
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  // ---- approve / reject modals ----
  const [approveModal, setApproveModal] = useState<{ referralId: string; withdrawalId: string; name: string; amount: number; method: string } | null>(null);
  const [rejectModal, setRejectModal]   = useState<{ referralId: string; withdrawalId: string; name: string; amount: number } | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [processing,   setProcessing]   = useState<string | null>(null);

  useEffect(() => {
    fetchWithdrawals();
  }, []);

  const fetchWithdrawals = async (isRefresh = false) => {
    try {
      if (isRefresh) { setRefreshing(true); } else { setLoading(true); }
      const data = await getWithdrawals("all");
      setAllWithdrawals(data.withdrawals ?? []);
    } catch (err) {
      console.error(err);
      if (!isRefresh) setAllWithdrawals([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    if (value.trim()) {
      setStatusFilter("all");
      setDateFrom("");
      setDateTo("");
    }
  };

  const summary = useMemo(() => {
    const pending   = allWithdrawals.filter(w => w.status === "requested");
    const processed = allWithdrawals.filter(w => w.status === "processed");
    const failed    = allWithdrawals.filter(w => w.status === "failed");
    const totalAmount = pending.reduce((sum, w) => sum + (Number(w.amount) || 0), 0);
    return {
      totalPending:   pending.length,
      totalProcessed: processed.length,
      totalFailed:    failed.length,
      totalAmount,
    };
  }, [allWithdrawals]);

  const filtered = useMemo(() => {
    let result = allWithdrawals;

    if (statusFilter !== "all") {
      result = result.filter(w => w.status === statusFilter);
    }

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(w =>
        w.userName?.toLowerCase().includes(q) ||
        w.userEasyId?.toLowerCase().includes(q) ||
        w.userEmail?.toLowerCase().includes(q) ||
        w.upiId?.toLowerCase().includes(q) ||
        w.accountHolder?.toLowerCase().includes(q) ||
        w.bankName?.toLowerCase().includes(q) ||
        w.accountNumber?.toLowerCase().includes(q) ||
        w.ifscCode?.toLowerCase().includes(q)
      );
    }

    if (dateFrom) {
      const from = new Date(dateFrom).getTime();
      result = result.filter(w => w.requestedAt && new Date(w.requestedAt).getTime() >= from);
    }
    if (dateTo) {
      const to = new Date(dateTo);
      to.setHours(23, 59, 59, 999);
      result = result.filter(w => w.requestedAt && new Date(w.requestedAt).getTime() <= to.getTime());
    }

    return result;
  }, [allWithdrawals, statusFilter, search, dateFrom, dateTo]);

  const sorted = useMemo(() => {
    if (!sortField) return filtered;
    const copy = [...filtered];
    copy.sort((a, b) => {
      let cmp = 0;
      if (sortField === "amount") {
        cmp = (Number(a.amount) || 0) - (Number(b.amount) || 0);
      } else if (sortField === "requestedAt") {
        cmp = new Date(a.requestedAt || 0).getTime() - new Date(b.requestedAt || 0).getTime();
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
    return copy;
  }, [filtered, sortField, sortDir]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(d => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("desc");
    }
  };

  const SortableHeader = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <TableHead
      className="text-xs cursor-pointer select-none hover:bg-muted/70"
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center gap-1">
        <span>{children}</span>
        <ArrowUpDown className={`w-3 h-3 ${sortField === field ? "text-foreground" : "text-muted-foreground/50"}`} />
      </div>
    </TableHead>
  );

  const clearDateFilter = () => { setDateFrom(""); setDateTo(""); };

  // ---- Approve: now opens confirmation dialog instead of firing immediately ----
  const handleApprove = async () => {
    if (!approveModal) return;
    setProcessing(approveModal.withdrawalId);
    try {
      await approveWithdrawal(approveModal.referralId, approveModal.withdrawalId);
      toast({ title: "Approved!", description: `₹${approveModal.amount} withdrawal approved.` });
      setAllWithdrawals(prev => prev.map(w =>
        w.withdrawalId === approveModal.withdrawalId
          ? { ...w, status: "processed", processedAt: new Date().toISOString() }
          : w
      ));
      setApproveModal(null);
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
    setProcessing(rejectModal.withdrawalId);
    try {
      await rejectWithdrawal(rejectModal.referralId, rejectModal.withdrawalId, rejectReason);
      toast({ title: "Rejected", description: `₹${rejectModal.amount} refunded to user wallet.` });
      setAllWithdrawals(prev => prev.map(w =>
        w.withdrawalId === rejectModal.withdrawalId
          ? { ...w, status: "failed", processedAt: new Date().toISOString(), rejectionReason: rejectReason }
          : w
      ));
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
          <div className="max-w-6xl mx-auto space-y-6">

            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <h1 className="text-2xl font-medium text-form-header">Withdrawal Requests</h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Review and process user withdrawal requests
                </p>
              </div>
              <Button size="sm" variant="outline" onClick={() => fetchWithdrawals(true)} disabled={refreshing}>
                <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${refreshing ? "animate-spin" : ""}`} />
                {refreshing ? "Refreshing…" : "Refresh"}
              </Button>
            </div>

            {/* Summary cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: "Pending",       val: summary.totalPending,       color: "text-yellow-600", bg: "bg-yellow-50 border-yellow-200", target: "requested" },
                { label: "Processed",     val: summary.totalProcessed,     color: "text-green-600",  bg: "bg-green-50 border-green-200",   target: "processed" },
                { label: "Failed",        val: summary.totalFailed,        color: "text-red-600",    bg: "bg-red-50 border-red-200",       target: "failed"    },
                { label: "Pending amount",val: `₹${summary.totalAmount}`,  color: "text-blue-600",   bg: "bg-blue-50 border-blue-200",     target: "requested" },
              ].map(({ label, val, color, bg, target }) => (
                <Card
                  key={label}
                  role="button"
                  tabIndex={0}
                  onClick={() => { setStatusFilter(target); setSearch(""); }}
                  onKeyDown={e => { if (e.key === "Enter") { setStatusFilter(target); setSearch(""); } }}
                  className={`border ${bg} cursor-pointer transition hover:shadow-sm hover:-translate-y-0.5 ${statusFilter === target && !search ? "ring-2 ring-offset-1 ring-primary/40" : ""}`}
                >
                  <CardContent className="p-4 text-center">
                    <p className={`text-2xl font-medium ${color}`}>{val}</p>
                    <p className="text-xs text-muted-foreground mt-1">{label}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

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

            {/* Search + date range */}
            <div className="flex flex-wrap gap-3 items-end">
              <div className="relative max-w-xs flex-1 min-w-[220px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  className="pl-9"
                  placeholder="Search name, ID, email, payment details…"
                  value={search}
                  onChange={e => handleSearchChange(e.target.value)}
                />
              </div>

              <div className="flex items-end gap-2">
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground block">From</label>
                  <Input
                    type="date"
                    className="h-9 w-[150px]"
                    value={dateFrom}
                    onChange={e => setDateFrom(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground block">To</label>
                  <Input
                    type="date"
                    className="h-9 w-[150px]"
                    value={dateTo}
                    onChange={e => setDateTo(e.target.value)}
                  />
                </div>
                {(dateFrom || dateTo) && (
                  <Button size="sm" variant="ghost" className="h-9" onClick={clearDateFilter}>
                    <X className="w-3.5 h-3.5 mr-1" />
                    Clear
                  </Button>
                )}
              </div>
            </div>

            {search.trim() && (
              <p className="text-xs text-muted-foreground -mt-3">
                Searching across all statuses and dates for "{search}"
              </p>
            )}

            {/* Table */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                  {search.trim() ? "Search results" : statusFilter === "all" ? "All" : statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)} withdrawals
                  <span className="normal-case font-normal ml-2 text-muted-foreground">
                    ({sorted.length} of {allWithdrawals.length})
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <p className="text-center text-sm text-muted-foreground py-8">Loading…</p>
                ) : !sorted.length ? (
                  <p className="text-center text-sm text-muted-foreground py-8">
                    {search.trim()
                      ? `No withdrawals match "${search}".`
                      : `No ${statusFilter === "all" ? "" : statusFilter} withdrawal requests match your filters.`}
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted">
                          <TableHead className="text-xs">User</TableHead>
                          <SortableHeader field="amount">Amount</SortableHeader>
                          <TableHead className="text-xs">Method</TableHead>
                          <TableHead className="text-xs">Payment details</TableHead>
                          <SortableHeader field="requestedAt">Requested</SortableHeader>
                          <TableHead className="text-xs">Status</TableHead>
                          {statusFilter === "requested" && !search.trim() && (
                            <TableHead className="text-xs">Actions</TableHead>
                          )}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {sorted.map((w, i) => (
                          <TableRow key={w.withdrawalId ?? i} className="hover:bg-muted/50">
                            <TableCell>
                              <div className="flex items-center gap-2.5">
                                <Avatar className="w-8 h-8 shrink-0">
                                  {w.userProfileImage && <AvatarImage src={w.userProfileImage} alt={w.userName} />}
                                  <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                                    {initials(w.userName)}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="min-w-0">
                                  <p className="text-sm font-medium">{w.userName}</p>
                                  <p className="text-xs text-muted-foreground">{w.userEasyId}</p>
                                  <p className="text-xs text-muted-foreground">{w.userEmail}</p>
                                </div>
                              </div>
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
                            {statusFilter === "requested" && !search.trim() && (
                              <TableCell>
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    className="h-7 text-xs bg-green-600 hover:bg-green-700 text-primary-foreground"
                                    disabled={processing === w.withdrawalId}
                                    onClick={() => setApproveModal({
                                      referralId:   w.referralId,
                                      withdrawalId: w.withdrawalId,
                                      name:         w.userName,
                                      amount:       w.amount,
                                      method:       w.method,
                                    })}
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

        {/* Approve modal */}
        {approveModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle className="text-base">Approve withdrawal</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm">
                  <p className="font-medium text-green-700">{approveModal.name}</p>
                  <p className="text-green-700 mt-0.5">
                    ₹{approveModal.amount} will be sent via {approveModal.method}
                  </p>
                  <p className="text-xs text-green-600 mt-1">
                    This action cannot be undone once processed.
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    className="flex-1 bg-green-600 hover:bg-green-700 text-primary-foreground"
                    onClick={handleApprove}
                    disabled={!!processing}
                  >
                    {processing === approveModal.withdrawalId ? "Approving…" : "Confirm approve"}
                  </Button>
                  <Button
                    variant="outline" className="flex-1"
                    onClick={() => setApproveModal(null)}
                    disabled={!!processing}
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

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

export default WithdrawalRequests;