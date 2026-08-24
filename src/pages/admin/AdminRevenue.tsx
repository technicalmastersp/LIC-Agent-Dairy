import AdminLayout from "./AdminLayout";
import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { getCurrentUser } from "@/utils/auth";
import {
  getRevenueSummary, getRevenueTrend, getRevenueTransactions,
  createExpense, getExpenses, deleteExpense, refundPayment,
} from "../../../services/revenueService";
import {
  TrendingUp, TrendingDown, Wallet, IndianRupee, RefreshCw,
  Plus, Trash2, ChevronLeft, ChevronRight, ArrowUpRight, ArrowDownRight,
} from "lucide-react";
import {
  ResponsiveContainer, LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from "recharts";

const EXPENSE_CATEGORIES = [
  "Hosting & Infrastructure", "Software & Tools", "Marketing & Ads",
  "Salaries & Contractors", "Legal & Compliance", "Office & Admin", "Other",
];

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 5 }, (_, i) => currentYear - i);
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

const inr = (n: number) => `₹${(n ?? 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
const fmt = (d?: string) => d
  ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
  : "—";

interface ExpenseBreakdownItem {
  category: string;
  amount: number;
}

interface RevenueSummary {
  income: number;
  totalExpenses: number;
  totalProfit: number;
  totalLoss: number;
  gatewayFees?: number;
  refunds?: number;
  referralPayouts?: number;
  walletRedemptions?: number;
  expenseBreakdown?: ExpenseBreakdownItem[];
}

interface RevenueTrendPoint {
  label: string;
  income: number;
  expenses: number;
  net: number;
}

interface RevenueTransaction {
  id: string;
  kind: "income" | "expense" | "payout";
  date?: string;
  description: string;
  user?: string;
  amount: number;
  refundStatus?: "none" | "partial" | "full";
  refundedAmount?: number;
}

const AdminRevenue = () => {
  const navigate      = useNavigate();
  const { toast }     = useToast();
  const currentUser   = getCurrentUser();
  const canManageExpenses = currentUser?.role === "superadmin" || currentUser?.permissions?.can_manage_expenses;

  const [scope, setScope]   = useState<"all" | "year" | "month">("all");
  const [year, setYear]     = useState(currentYear);
  const [month, setMonth]   = useState(new Date().getMonth() + 1);

  const [summary, setSummary]         = useState<RevenueSummary | null>(null);
  const [trend, setTrend]             = useState<RevenueTrendPoint[]>([]);
  const [transactions, setTransactions] = useState<RevenueTransaction[]>([]);
  const [txType, setTxType]           = useState<"all" | "income" | "expense" | "payout">("all");
  const [txPage, setTxPage]           = useState(1);
  const [txPages, setTxPages]         = useState(1);

  const [loading, setLoading]     = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [expenseForm, setExpenseForm] = useState({ category: EXPENSE_CATEGORIES[0], description: "", amount: "", date: "" });
  const [savingExpense, setSavingExpense] = useState(false);

  const [refundModal, setRefundModal] = useState<RevenueTransaction | null>(null);
  const [refundAmount, setRefundAmount] = useState("");
  const [refundReason, setRefundReason] = useState("");
  const [refunding, setRefunding] = useState(false);

  const [expenseToDelete, setExpenseToDelete] = useState<RevenueTransaction | null>(null);
  const [deletingExpense, setDeletingExpense] = useState(false);

  const fetchAll = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) { setRefreshing(true); } else { setLoading(true); }
      const [s, t] = await Promise.all([
        getRevenueSummary(scope, scope !== "all" ? year : undefined, scope === "month" ? month : undefined),
        getRevenueTrend(year),
      ]);
      setSummary(s);
      setTrend(t);
    } catch (err: unknown) {
      const message = axios.isAxiosError(err) ? err.response?.data?.message : undefined;
      toast({ title: "Error", description: message, variant: "destructive" });
    } finally { setLoading(false); setRefreshing(false); }
  }, [scope, year, month, toast]);

  const fetchTransactions = useCallback(async () => {
    try {
      const data = await getRevenueTransactions(scope, scope !== "all" ? year : undefined, scope === "month" ? month : undefined, txType, txPage);
      setTransactions(data.records);
      setTxPages(data.pages || 1);
    } catch { setTransactions([]); }
  }, [scope, year, month, txType, txPage]);

  useEffect(() => { fetchAll(); }, [fetchAll]);
  useEffect(() => { fetchTransactions(); }, [fetchTransactions]);

  const handleAddExpense = async () => {
    if (!expenseForm.description.trim() || !expenseForm.amount || Number(expenseForm.amount) <= 0) {
      toast({ title: "Missing details", description: "Description and a positive amount are required.", variant: "destructive" });
      return;
    }
    setSavingExpense(true);
    try {
      await createExpense({ ...expenseForm, amount: Number(expenseForm.amount) });
      toast({ title: "Expense logged" });
      setExpenseForm({ category: EXPENSE_CATEGORIES[0], description: "", amount: "", date: "" });
      setShowExpenseForm(false);
      fetchAll(true);
      fetchTransactions();
    } catch (err: unknown) {
      const message = axios.isAxiosError(err) ? err.response?.data?.message : undefined;
      toast({ title: "Error", description: message, variant: "destructive" });
    } finally { setSavingExpense(false); }
  };

  const handleDeleteExpense = async () => {
    if (!expenseToDelete) return;
    setDeletingExpense(true);
    try {
      await deleteExpense(expenseToDelete.id);
      toast({ title: "Deleted" });
      fetchAll(true);
      fetchTransactions();
      setExpenseToDelete(null);
    } catch (err: unknown) {
      const message = axios.isAxiosError(err) ? err.response?.data?.message : undefined;
      toast({ title: "Error", description: message, variant: "destructive" });
    } finally {
      setDeletingExpense(false);
    }
  };

  const handleRefund = async () => {
    if (!refundModal || !refundAmount || Number(refundAmount) <= 0) {
      toast({ title: "Enter a valid amount", variant: "destructive" });
      return;
    }
    setRefunding(true);
    try {
      await refundPayment(refundModal.id, Number(refundAmount), refundReason);
      toast({ title: "Refund processed" });
      setRefundModal(null);
      setRefundAmount("");
      setRefundReason("");
      fetchAll(true);
      fetchTransactions();
    } catch (err: unknown) {
      const message = axios.isAxiosError(err) ? err.response?.data?.message : undefined;
      toast({ title: "Error", description: message, variant: "destructive" });
    } finally { setRefunding(false); }
  };

  const summaryCards = summary ? [
    { label: "Total Income",   val: summary.income,        icon: <IndianRupee className="w-5 h-5 text-blue-600" />,  bg: "bg-blue-50 border-blue-200" },
    { label: "Total Expenses", val: summary.totalExpenses, icon: <Wallet className="w-5 h-5 text-orange-600" />,     bg: "bg-orange-50 border-orange-200" },
    { label: "Total Profit",   val: summary.totalProfit,   icon: <TrendingUp className="w-5 h-5 text-green-600" />,  bg: "bg-green-50 border-green-200" },
    { label: "Total Loss",     val: summary.totalLoss,     icon: <TrendingDown className="w-5 h-5 text-red-600" />, bg: "bg-red-50 border-red-200" },
  ] : [];

  return (
    <AdminLayout>
      <div className="min-h-screen bg-muted/30">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto space-y-6">

            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <h1 className="text-2xl font-medium text-form-header">Revenue</h1>
                <p className="text-sm text-muted-foreground mt-1">Income, expenses, and profit &amp; loss overview.</p>
              </div>
              <Button size="sm" variant="outline" onClick={() => fetchAll(true)} disabled={refreshing}>
                <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${refreshing ? "animate-spin" : ""}`} />
                {refreshing ? "Refreshing…" : "Refresh"}
              </Button>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-2 flex-wrap">
              {(["all", "year", "month"] as const).map(s => (
                <Button key={s} size="sm" variant={scope === s ? "default" : "outline"} className="capitalize"
                  onClick={() => setScope(s)}>
                  {s === "all" ? "All time" : s === "year" ? "This year" : "This month"}
                </Button>
              ))}
              {scope !== "all" && (
                <Select value={String(year)} onValueChange={(v) => setYear(Number(v))}>
                  <SelectTrigger className="h-9 w-[100px] text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>{YEARS.map(y => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}</SelectContent>
                </Select>
              )}
              {scope === "month" && (
                <Select value={String(month)} onValueChange={(v) => setMonth(Number(v))}>
                  <SelectTrigger className="h-9 w-[140px] text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>{MONTHS.map((m, i) => <SelectItem key={i} value={String(i + 1)}>{m}</SelectItem>)}</SelectContent>
                </Select>
              )}
            </div>

            {/* Summary cards */}
            {loading ? (
              <p className="text-center text-sm text-muted-foreground py-8">Loading…</p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {summaryCards.map(({ label, val, icon, bg }) => (
                  <Card key={label} className={`border ${bg}`}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        {icon}
                      </div>
                      <p className="text-xl font-semibold">{inr(val)}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Expense breakdown */}
            {summary && (summary.expenseBreakdown?.length > 0 || summary.gatewayFees > 0 || summary.refunds > 0 || summary.referralPayouts > 0) && (
              <Card>
                <CardHeader className="pb-3"><CardTitle className="text-xs uppercase tracking-wide text-muted-foreground">Expense breakdown</CardTitle></CardHeader>
                <CardContent className="space-y-0">
                  {[
                    { label: "Payment gateway fees", val: summary.gatewayFees },
                    { label: "Refunds issued",        val: summary.refunds },
                    { label: "Referral payouts",      val: summary.referralPayouts },
                    { label: "Wallet redemptions",    val: summary.walletRedemptions },
                    ...(summary.expenseBreakdown ?? []).map((e: ExpenseBreakdownItem) => ({ label: e.category, val: e.amount })),
                  ].filter(r => r.val > 0).map(({ label, val }) => (
                    <div key={label} className="flex items-center justify-between py-2.5 border-b border-border last:border-0">
                      <span className="text-sm text-muted-foreground">{label}</span>
                      <span className="text-sm font-medium">{inr(val)}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Trend chart */}
            <Card>
              <CardHeader className="pb-3 flex-row items-center justify-between">
                <CardTitle className="text-xs uppercase tracking-wide text-muted-foreground">Monthly trend — {year}</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={trend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `₹${v / 1000}k`} />
                    <Tooltip formatter={(v: number) => inr(v)} />
                    <Legend />
                    <Line type="monotone" dataKey="income" stroke="#2563eb" name="Income" strokeWidth={2} />
                    <Line type="monotone" dataKey="expenses" stroke="#f97316" name="Expenses" strokeWidth={2} />
                    <Line type="monotone" dataKey="net" stroke="#16a34a" name="Net" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Expense management */}
            {canManageExpenses && (
              <Card>
                <CardHeader className="pb-3 flex-row items-center justify-between">
                  <CardTitle className="text-xs uppercase tracking-wide text-muted-foreground">Log an expense</CardTitle>
                  <Button size="sm" variant="outline" onClick={() => setShowExpenseForm(p => !p)}>
                    <Plus className="w-3.5 h-3.5 mr-1" /> {showExpenseForm ? "Cancel" : "Add expense"}
                  </Button>
                </CardHeader>
                {showExpenseForm && (
                  <CardContent className="space-y-3 pt-0">
                    <div className="grid sm:grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label className="text-xs">Category</Label>
                        <Select value={expenseForm.category} onValueChange={(v) => setExpenseForm(p => ({ ...p, category: v }))}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>{EXPENSE_CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs">Amount (₹)</Label>
                        <Input type="number" value={expenseForm.amount} onChange={(e) => setExpenseForm(p => ({ ...p, amount: e.target.value }))} />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Description</Label>
                      <Input value={expenseForm.description} onChange={(e) => setExpenseForm(p => ({ ...p, description: e.target.value }))} placeholder="e.g. Vercel Pro plan — August" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Date incurred (optional — defaults to today)</Label>
                      <Input type="date" value={expenseForm.date} onChange={(e) => setExpenseForm(p => ({ ...p, date: e.target.value }))} />
                    </div>
                    <Button onClick={handleAddExpense} disabled={savingExpense}>{savingExpense ? "Saving…" : "Save expense"}</Button>
                  </CardContent>
                )}
              </Card>
            )}

            {/* Detailed transactions */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <CardTitle className="text-xs uppercase tracking-wide text-muted-foreground">Transactions</CardTitle>
                  <div className="flex gap-1.5">
                    {(["all", "income", "expense", "payout"] as const).map(t => (
                      <Button key={t} size="sm" variant={txType === t ? "default" : "outline"} className="h-7 text-xs capitalize"
                        onClick={() => { setTxType(t); setTxPage(1); }}>
                        {t}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {!transactions.length ? (
                  <p className="text-center text-sm text-muted-foreground py-8">No records for this period.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted">
                          <TableHead className="text-xs">Date</TableHead>
                          <TableHead className="text-xs">Description</TableHead>
                          <TableHead className="text-xs">Type</TableHead>
                          <TableHead className="text-xs text-right">Amount</TableHead>
                          <TableHead className="text-xs"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {transactions.map((t) => (
                          <TableRow key={`${t.kind}-${t.id}`}>
                            <TableCell className="text-xs">{fmt(t.date)}</TableCell>
                            <TableCell className="text-xs">
                              {t.description}
                              {t.user && <span className="text-muted-foreground"> — {t.user}</span>}
                              {t.refundStatus && t.refundStatus !== "none" && (
                                <Badge variant="outline" className="ml-2 text-[10px]">
                                  {t.refundStatus === "full" ? "Fully refunded" : `Refunded ₹${t.refundedAmount}`}
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              <Badge className={`text-[10px] ${
                                t.kind === "income" ? "bg-blue-100 text-blue-700 border border-blue-200"
                                : t.kind === "expense" ? "bg-orange-100 text-orange-700 border border-orange-200"
                                : "bg-purple-100 text-purple-700 border border-purple-200"
                              }`}>
                                {t.kind === "income" ? <ArrowUpRight className="w-2.5 h-2.5 mr-0.5 inline" /> : <ArrowDownRight className="w-2.5 h-2.5 mr-0.5 inline" />}
                                {t.kind}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-xs text-right font-medium">{inr(t.amount)}</TableCell>
                            <TableCell className="text-right">
                              {t.kind === "income" && canManageExpenses && t.refundStatus !== "full" && (
                                <Button size="sm" variant="outline" className="h-6 text-[11px] px-2"
                                  onClick={() => setRefundModal(t)}>
                                  Refund
                                </Button>
                              )}
                              {t.kind === "expense" && canManageExpenses && (
                                <Button size="sm" variant="outline" className="h-6 text-[11px] px-2 text-red-600 border-red-200"
                                  onClick={() => setExpenseToDelete(t)}>
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
                {txPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-4">
                    <Button size="sm" variant="outline" disabled={txPage === 1} onClick={() => setTxPage(p => p - 1)}>
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </Button>
                    <span className="text-xs text-muted-foreground">Page {txPage} of {txPages}</span>
                    <Button size="sm" variant="outline" disabled={txPage === txPages} onClick={() => setTxPage(p => p + 1)}>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

          </div>
        </div>

        {refundModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-md">
              <CardHeader><CardTitle className="text-base">Process refund</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm">
                  <p className="font-medium text-amber-800">{refundModal.description}</p>
                  <p className="text-amber-700 text-xs mt-0.5">Original amount: {inr(refundModal.amount)}</p>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Refund amount (₹)</Label>
                  <Input type="number" value={refundAmount} onChange={(e) => setRefundAmount(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Reason</Label>
                  <Textarea rows={2} value={refundReason} onChange={(e) => setRefundReason(e.target.value)} placeholder="e.g. Customer requested cancellation" />
                </div>
                <div className="flex gap-2">
                  <Button className="flex-1 bg-red-600 hover:bg-red-700 text-primary-foreground" onClick={handleRefund} disabled={refunding}>
                    {refunding ? "Processing…" : "Confirm refund"}
                  </Button>
                  <Button variant="outline" className="flex-1" onClick={() => setRefundModal(null)}>Cancel</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Delete expense confirmation */}
        <AlertDialog open={!!expenseToDelete} onOpenChange={(open) => !open && setExpenseToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete this expense?</AlertDialogTitle>
              <AlertDialogDescription>
                {expenseToDelete && (
                  <>
                    You're about to delete <span className="font-medium text-foreground">{expenseToDelete.description}</span> ({inr(expenseToDelete.amount)}).
                    {" "}This will remove it from the revenue records permanently and cannot be undone.
                  </>
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={deletingExpense}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteExpense}
                disabled={deletingExpense}
                className="bg-red-600 hover:bg-red-700"
              >
                {deletingExpense ? "Deleting…" : "Delete expense"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AdminLayout>
  );
};

export default AdminRevenue;