import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { validateUpiId, validateIfsc, validateAccountNumber } from "../../utils/bankValidators";
// import { INDIAN_BANKS } from "../../utils/indianBanks";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { getCurrentUser } from "@/utils/auth";
import { getReferralDashboard, withdrawEarnings, updatePaymentDetails, lookupIfsc } from "../../services/referralService";
import {
  Copy, Share, Users, TrendingUp, Gift, Crown,
  Wallet, GitBranch, Receipt, Route, Clock,
  Building2, Smartphone, CheckCircle2, AlertCircle,
  ArrowDownToLine, History, Edit, Save, X
} from "lucide-react";
import { getReferralConfig } from "../../services/configService";

// ── types ─────────────────────────────────────────────────────────────────────
interface PaymentDetails {
  upiId?:              string;
  upiVerified?:        boolean;
  upiRejectionReason?: string;
  accountNumber?:      string;
  ifscCode?:           string;
  accountHolder?:      string;
  bankName?:           string;
  branchName?:         string;
  bankVerified?:       boolean;
  updatedAt?:          string;
}

interface WithdrawalRecord {
  amount:        number;
  status:        "requested" | "processed" | "failed";
  requestedAt:   string;
  processedAt?:  string;
  method:        string;
  upiId?:        string;
  accountNumber?: string;
  bankName?:     string;
  adminNote?:    string;
}

interface ReferredUser {
  name:          string;
  planType:      string;
  planId:        string;
  joinedAt:      string;
  status:        "active" | "expired" | "trial" | "pending";
  level:         1 | 2;
  referredBy?:   string;
  earning:       number;
  rewardPaid:    boolean;
  rewardExpired: boolean;
  daysLeft?:     number | null;
}

interface Dashboard {
  referralCode:      string;
  totalL1:           number;
  totalL2:           number;
  totalEarned:       number;
  pendingEarnings:   number;
  availableBalance:  number;
  totalWithdrawn:    number;
  hasPaymentDetails: boolean;
  paymentDetails:    PaymentDetails | null;
  lastWithdrawal:    { amount: number; status: string; requestedAt: string; method: string } | null;
  withdrawalHistory: WithdrawalRecord[];
  referredUsers:     ReferredUser[];
  earningsHistory:   { date: string; description: string; amount: number; status: string }[];
}

// ── helpers ───────────────────────────────────────────────────────────────────
const PLANS = [
  { name: "Basic",    duration: "6 months",  price: 599  },
  { name: "Standard", duration: "12 months", price: 1099 },
  { name: "Premium",  duration: "24 months", price: 2099 },
];

const statusStyle: Record<string, string> = {
  active:  "bg-green-100 text-green-700 border border-green-200",
  expired: "bg-red-100 text-red-700 border border-red-200",
  trial:   "bg-yellow-100 text-yellow-700 border border-yellow-200",
  pending: "bg-yellow-100 text-yellow-700 border border-yellow-200",
};

const withdrawStatusStyle: Record<string, string> = {
  requested: "bg-yellow-100 text-yellow-700 border border-yellow-200",
  processed: "bg-green-100 text-green-700 border border-green-200",
  failed:    "bg-red-100 text-red-700 border border-red-200",
};

const fmt = (date?: string) =>
  date
    ? new Date(date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
    : "—";

const initials = (name: string) =>
  name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();

interface WithdrawalRowProps {
  w: WithdrawalRecord;
  fmt: (date?: string) => string;
  withdrawStatusStyle: Record<string, string>;
}

const WithdrawalRow = ({ w, fmt, withdrawStatusStyle }: WithdrawalRowProps) => (
  <div className="flex items-center gap-3 py-2.5 border-b border-border last:border-0">
    <div className="flex-1">
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-sm font-medium">₹{w.amount}</span>
        <Badge className={`text-xs ${withdrawStatusStyle[w.status]}`}>
          {w.status.charAt(0).toUpperCase() + w.status.slice(1)}
        </Badge>
        <span className="text-xs text-muted-foreground">via {w.method}</span>
      </div>
      <p className="text-xs text-muted-foreground mt-0.5">
        Requested: {fmt(w.requestedAt)}
        {w.processedAt && ` · Processed: ${fmt(w.processedAt)}`}
      </p>
      {w.upiId && <p className="text-xs text-muted-foreground">{w.upiId}</p>}
      {w.accountNumber && (
        <p className="text-xs text-muted-foreground">
          {w.bankName} ••••{w.accountNumber.slice(-4)}
        </p>
      )}
      {(w.status === "failed") && (
        <p className="text-xs text-red-700 mt-0.5">
          Note : {w.adminNote || "No reason provided."}
        </p>
      )}
    </div>
  </div>
);

interface ReferralRowProps {
  u: ReferredUser;
  fmt: (date?: string) => string;
  initials: (name: string) => string;
  statusStyle: Record<string, string>;
}

const ReferralRow = ({ u, fmt, initials, statusStyle }: ReferralRowProps) => (
  <div className="flex items-center gap-3 py-2.5 border-b border-border last:border-0">
    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-medium shrink-0 ${
      u.level === 1 ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700"
    }`}>
      {initials(u.name)}
    </div>
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-sm font-medium">{u.name}</span>
        <Badge className={`text-xs px-1.5 py-0 ${
          u.level === 1
            ? "bg-blue-100 text-blue-700 border border-blue-200"
            : "bg-purple-100 text-purple-700 border border-purple-200"
        }`}>L{u.level}</Badge>
      </div>
      <p className="text-xs text-muted-foreground mt-0.5">
        {u.planType} · Joined {fmt(u.joinedAt)}
        {u.level === 2 && u.referredBy && ` · via ${u.referredBy}`}
      </p>
    </div>
    <div className="flex items-center gap-3 py-1">
      <span className={`text-sm font-medium ${u.earning > 0 ? "text-green-600" : "text-muted-foreground"}`}>
        {u.earning > 0 ? `+₹${u.earning}` : "₹0"}
      </span>
      {u.rewardPaid && (<Badge className="text-xs bg-green-100 text-green-700 border border-green-200">Paid</Badge>)}
      {u.rewardExpired && !u.rewardPaid && (<Badge className="text-xs bg-red-100 text-red-700 border border-red-200">Expired</Badge>)}
      {!u.rewardPaid && !u.rewardExpired && u.daysLeft !== null && u.daysLeft !== undefined && (
        <Badge className="text-xs bg-yellow-100 text-yellow-700 border border-yellow-200">{u.daysLeft}d left</Badge>
      )}
    </div>
    <Badge className={`text-xs shrink-0 ${statusStyle[u.rewardExpired ? "expired" : u.status]}`}>
      {u.rewardExpired ? "Expired" : u.status}
    </Badge>
  </div>
);


// ── component ─────────────────────────────────────────────────────────────────
const ReferralProgram = () => {
  const navigate      = useNavigate();
  const { toast }     = useToast();
  const currentUser   = getCurrentUser();

  const [dashboard,   setDashboard]   = useState<Dashboard | null>(null);
  const [loading,     setLoading]     = useState(true);
  const [withdrawing, setWithdrawing] = useState(false);
  const [editingBank, setEditingBank] = useState(false);
  const [savingBank, setSavingBank] = useState(false);
  const [ifscLookupState, setIfscLookupState] = useState<{
    status: "idle" | "loading" | "found" | "not_found";
    bank?: string;
    branch?: string;
  }>({ status: "idle" });

  const [config, setConfig] = useState({ SIGNUP_DISCOUNT_AMOUNT: 100, L1_COMMISSION_PCT: 5, L2_COMMISSION_PCT: 2, MIN_WITHDRAWAL: 100, REWARD_WINDOW_DAYS: 15 });
  const [showAllReferrals, setShowAllReferrals] = useState(false);
  const [showAllEarnings, setShowAllEarnings] = useState(false);
  const [showAllWithdrawals, setShowAllWithdrawals] = useState(false);

  const [bankForm, setBankForm] = useState({
    upiId:         "",
    accountNumber: "",
    ifscCode:      "",
    accountHolder: "",
    bankName:      "",
  });

  useEffect(() => {
    getReferralConfig().then(setConfig).catch(() => {});
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const data = await getReferralDashboard();
      setDashboard(data);
      if (data.paymentDetails) {
        setBankForm({
          upiId:         data.paymentDetails.upiId         || "",
          accountNumber: data.paymentDetails.accountNumber || "",
          ifscCode:      data.paymentDetails.ifscCode      || "",
          accountHolder: data.paymentDetails.accountHolder || "",
          bankName:      data.paymentDetails.bankName      || "",
        });
        // If the bank account was already IFSC-verified, seed the lookup
        // state as "found" too — otherwise editing only the UPI field
        // wrongly demanded a redundant IFSC re-lookup before Save.
        if (data.paymentDetails.accountNumber && data.paymentDetails.bankVerified) {
          setIfscLookupState({
            status: "found",
            bank:   data.paymentDetails.bankName,
            branch: data.paymentDetails.branchName,
          });
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const referralUrl = `${window.location.origin}?ref=${currentUser?.referralCode}`;

  const copyCode = async () => {
    await navigator.clipboard.writeText(currentUser?.referralCode);
    toast({ title: "Code Copied!", description: "Referral code copied." });
  };
  const copyLink = async () => {
    await navigator.clipboard.writeText(referralUrl);
    toast({ title: "Link Copied!", description: "Referral link copied." });
  };

  const shareLink = async () => {
    if (navigator.share) {
      try { await navigator.share({ title: "Join LIC Agent Diary", url: referralUrl }); }
      catch { copyLink(); }
    } else { copyLink(); }
  };

  const shareWhatsApp = () => {
    const msg = encodeURIComponent(`Join LIC Agent Diary!\n${referralUrl}`);
    window.open(`https://wa.me/?text=${msg}`, "_blank");
  };

  const handleIfscBlur = async () => {
    const code = bankForm.ifscCode.trim().toUpperCase();
    if (!validateIfsc(code)) {
      setIfscLookupState({ status: "idle" });
      return;
    }
    setIfscLookupState({ status: "loading" });
    try {
      const details = await lookupIfsc(code);
      setIfscLookupState({ status: "found", bank: details.bank, branch: details.branch });
      setBankForm(p => ({ ...p, bankName: details.bank }));
    } catch {
      setIfscLookupState({ status: "not_found" });
      setBankForm(p => ({ ...p, bankName: "" }));
    }
  };

  const handleSaveBank = async () => {
    if (!bankForm.upiId && !bankForm.accountNumber) {
      toast({ title: "Required", description: "Add at least a UPI ID or bank account.", variant: "destructive" });
      return;
    }
    if (bankForm.upiId && !validateUpiId(bankForm.upiId)) {
      toast({ title: "Invalid UPI ID", description: "Expected a format like name@bank.", variant: "destructive" });
      return;
    }
    if (bankForm.accountNumber && (!bankForm.ifscCode || !bankForm.accountHolder)) {
      toast({ title: "Incomplete", description: "Fill account number, IFSC, and account holder name.", variant: "destructive" });
      return;
    }
    if (bankForm.accountNumber && !validateAccountNumber(bankForm.accountNumber)) {
      toast({ title: "Invalid account number", description: "Expected 9–18 digits.", variant: "destructive" });
      return;
    }
    if (bankForm.accountNumber && ifscLookupState.status !== "found") {
      toast({ title: "Verify IFSC first", description: "Enter a valid IFSC code and let it resolve to a bank before saving.", variant: "destructive" });
      return;
    }
    setSavingBank(true);
    try {
      // bankName is resolved server-side from IFSC too — sending it here is
      // just for optimistic UI; the backend derives its own authoritative value.
      await updatePaymentDetails(bankForm);
      toast({ title: "Saved!", description: "Payment details updated." });
      setEditingBank(false);
      fetchDashboard();
    } catch (err: unknown) {
      const message = axios.isAxiosError(err) ? err.response?.data?.message : undefined;
      toast({ title: "Error", description: message, variant: "destructive" });
    } finally { setSavingBank(false); }
  };

  const handleWithdraw = async () => {
    if (!dashboard?.hasPaymentDetails) {
      toast({
        title:       "Bank details required",
        description: "Please add your UPI ID or bank account before withdrawing.",
        variant:     "destructive",
      });
      setEditingBank(true);
      return;
    }
    if ((dashboard?.availableBalance ?? 0) < config.MIN_WITHDRAWAL) {
      toast({ title: "Minimum not met", description: `You need at least ₹${config.MIN_WITHDRAWAL} to withdraw.`, variant: "destructive" });
      return;
    }
    setWithdrawing(true);
    try {
      await withdrawEarnings();
      toast({ title: "Requested!", description: "Withdrawal will be processed in 3–5 business days." });
      fetchDashboard();
    } catch (err: unknown) {
      const message = axios.isAxiosError(err) ? err.response?.data?.message : undefined;
      toast({ title: "Failed", description: message, variant: "destructive" });
    } finally { setWithdrawing(false); }
  };

  if (!currentUser) return null;

  if (loading) return (
    <div className="min-h-screen bg-muted/30 flex flex-col">
      <Navigation />
      <main className="flex-1 flex items-center justify-center">
        <p className="text-muted-foreground text-sm">Loading referral dashboard…</p>
      </main>
      <Footer />
    </div>
  );

  const d = dashboard!;

  return (
    <div className="min-h-screen bg-muted/30 flex flex-col">
      <Navigation />
      <main className="container mx-auto px-4 py-8 flex-1">
        <div className="max-w-4xl mx-auto space-y-5">

          {/* Header */}
          <div>
            <h1 className="text-2xl font-medium text-form-header flex items-center gap-2">
              <Crown className="w-6 h-6 text-yellow-500" /> Referral program
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Earn {config.L1_COMMISSION_PCT}% on direct referrals and {config.L2_COMMISSION_PCT}% on their referrals — one-time per user, within {config.REWARD_WINDOW_DAYS} days
            </p>
          </div>

          {/* ── Stats ── */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { icon: <Users className="w-5 h-5 text-blue-600" />,       label: "Direct referrals",  val: d.totalL1,                    color: "text-blue-600"   },
              { icon: <Gift  className="w-5 h-5 text-purple-600" />,     label: "Level 2 referrals", val: d.totalL2,                    color: "text-purple-600" },
              { icon: <TrendingUp className="w-5 h-5 text-green-600" />, label: "Total earned",      val: `₹${d.totalEarned}`,          color: "text-green-600"  },
              { icon: <Clock className="w-5 h-5 text-yellow-600" />,     label: "Pending",           val: `₹${d.pendingEarnings}`,      color: "text-yellow-600" },
            ].map(({ icon, label, val, color }) => (
              <Card key={label}>
                <CardContent className="p-4 text-center">
                  <div className="flex justify-center mb-2">{icon}</div>
                  <p className={`text-2xl font-medium ${color}`}>{val}</p>
                  <p className="text-xs text-muted-foreground mt-1">{label}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* ── Wallet ── */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                <Wallet className="w-4 h-4" /> Wallet
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-xs font-medium text-green-700 mb-1">Available balance</p>
                  <p className="text-3xl font-medium text-green-700">₹{d.availableBalance}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Withdrawn: ₹{d.totalWithdrawn} · Min: ₹{config.MIN_WITHDRAWAL}
                  </p>
                  {/* Bank details warning */}
                  {!d.hasPaymentDetails && (
                    <div className="flex items-center gap-1.5 mt-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded px-2 py-1.5">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      Add bank details to withdraw
                    </div>
                  )}
                  <Button
                    size="sm"
                    className="mt-3 bg-green-600 hover:bg-green-700 text-primary-foreground text-xs w-full"
                    onClick={handleWithdraw}
                    disabled={withdrawing || d.availableBalance < config.MIN_WITHDRAWAL}
                  >
                    <ArrowDownToLine className="w-3.5 h-3.5 mr-1.5" />
                    {withdrawing ? "Processing…" : "Withdraw earnings"}
                  </Button>
                </div>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-xs font-medium text-yellow-700 mb-1">Pending rewards</p>
                  <p className="text-3xl font-medium text-yellow-700">₹{d.pendingEarnings}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Credited when referral activates a paid plan within {config.REWARD_WINDOW_DAYS} days
                  </p>
                  {/* Last withdrawal summary */}
                  {d.lastWithdrawal && (
                    <div className="mt-3 text-xs text-muted-foreground border-t border-yellow-200 pt-2">
                      Last: ₹{d.lastWithdrawal.amount} ·{" "}
                      <Badge className={`text-xs ${withdrawStatusStyle[d.lastWithdrawal.status]}`}>
                        {d.lastWithdrawal.status}
                      </Badge>
                      {" · "}{fmt(d.lastWithdrawal.requestedAt)}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ── Bank / Payment Details ── */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Building2 className="w-4 h-4" /> Payment details
                  {d.hasPaymentDetails
                    ? <Badge className="text-xs bg-green-100 text-green-700 border border-green-200 ml-1"><CheckCircle2 className="w-3 h-3 mr-1" />Added</Badge>
                    : <Badge className="text-xs bg-red-100 text-red-700 border border-red-200 ml-1"><AlertCircle className="w-3 h-3 mr-1" />Required for withdrawal</Badge>
                  }
                </span>
                <Button
                  size="sm" variant="outline"
                  className="text-xs h-7"
                  onClick={() => setEditingBank(!editingBank)}
                >
                  {editingBank
                    ? <><X className="w-3 h-3 mr-1" />Cancel</>
                    : <><Edit className="w-3 h-3 mr-1" />{d.hasPaymentDetails ? "Edit" : "Add"}</>
                  }
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* View mode */}
              {/* View mode — debit-card style */}
              {!editingBank && d.hasPaymentDetails && (
                <div className="space-y-4">
                  {d.paymentDetails?.accountNumber && (
                    <div className="relative rounded-2xl p-5 text-primary-foreground overflow-hidden shadow-lg"
                      style={{ background: "linear-gradient(135deg, #1e3a8a 0%, #1e40af 45%, #2563eb 100%)" }}>
                      <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-white/10" />
                      <div className="absolute -right-2 top-12 w-20 h-20 rounded-full bg-white/5" />
                      <div className="relative flex items-center justify-between mb-6">
                        <Building2 className="w-7 h-7 opacity-90" />
                        {d.paymentDetails.bankVerified ? (
                          <Badge className="bg-white/15 text-primary-foreground border-0 text-[10px] backdrop-blur-sm">
                            <CheckCircle2 className="w-3 h-3 mr-1" /> Verified
                          </Badge>
                        ) : (
                          <Badge className="bg-amber-400/90 text-amber-950 border-0 text-[10px]">
                            <Clock className="w-3 h-3 mr-1" /> Pending
                          </Badge>
                        )}
                      </div>
                      <p className="font-mono text-lg tracking-[0.2em] mb-4">
                        •••• •••• •••• {d.paymentDetails.accountNumber.slice(-4)}
                      </p>
                      <div className="flex items-end justify-between">
                        <div>
                          <p className="text-[10px] uppercase tracking-wide text-primary-foreground/60 mb-0.5">Account holder</p>
                          <p className="text-sm font-medium uppercase">{d.paymentDetails.accountHolder || "—"}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] uppercase tracking-wide text-primary-foreground/60 mb-0.5">{d.paymentDetails.bankName || "Bank"}</p>
                          <p className="text-xs text-primary-foreground/80">{d.paymentDetails.ifscCode}</p>
                        </div>
                      </div>
                      {d.paymentDetails.branchName && (
                        <p className="text-[10px] text-primary-foreground/50 mt-2">{d.paymentDetails.branchName} branch</p>
                      )}
                    </div>
                  )}

                  {d.paymentDetails?.upiId && (
                    <div className="relative rounded-2xl p-5 text-primary-foreground overflow-hidden shadow-lg"
                      style={{ background: "linear-gradient(135deg, #065f46 0%, #059669 50%, #10b981 100%)" }}>
                      <div className="absolute -right-6 -bottom-6 w-28 h-28 rounded-full bg-white/10" />
                      <div className="relative flex items-center justify-between mb-6">
                        <Smartphone className="w-7 h-7 opacity-90" />
                        {d.paymentDetails.upiVerified ? (
                          <Badge className="bg-white/15 text-primary-foreground border-0 text-[10px] backdrop-blur-sm">
                            <CheckCircle2 className="w-3 h-3 mr-1" /> Verified
                          </Badge>
                        ) : d.paymentDetails.upiRejectionReason ? (
                          <Badge className="bg-red-400/90 text-red-950 border-0 text-[10px]">
                            <AlertCircle className="w-3 h-3 mr-1" /> Rejected
                          </Badge>
                        ) : (
                          <Badge className="bg-amber-400/90 text-amber-950 border-0 text-[10px]">
                            <Clock className="w-3 h-3 mr-1" /> Under review
                          </Badge>
                        )}
                      </div>
                      <p className="font-mono text-lg mb-1">••••••{d.paymentDetails.upiId.slice(6)}</p>
                      <p className="text-[10px] uppercase tracking-wide text-primary-foreground/60">UPI ID</p>
                      {d.paymentDetails.upiRejectionReason && (
                        <p className="text-xs text-red-100 mt-2 bg-red-950/30 rounded px-2 py-1">
                          {d.paymentDetails.upiRejectionReason}
                        </p>
                      )}
                      {!d.paymentDetails.upiVerified && !d.paymentDetails.upiRejectionReason && (
                        <p className="text-[10px] text-primary-foreground/60 mt-2">
                          Validated within 24 hours by admin. Must be your own UPI ID.
                        </p>
                      )}
                    </div>
                  )}

                  <p className="text-[11px] text-muted-foreground text-right">
                    Last updated {fmt(d.paymentDetails?.updatedAt)}
                  </p>
                </div>
              )}

              {/* Empty state */}
              {!editingBank && !d.hasPaymentDetails && (
                <div className="text-center py-6">
                  <AlertCircle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground mb-3">
                    No payment details added yet. Add your UPI ID or bank account to receive withdrawals.
                  </p>
                  <Button size="sm" onClick={() => setEditingBank(true)}>
                    <Building2 className="w-3.5 h-3.5 mr-1.5" /> Add payment details
                  </Button>
                </div>
              )}

              {/* Edit / Add form */}
              {editingBank && (
                <div className="space-y-4">
                  {/* UPI */}
                  <div className="bg-muted rounded-lg p-4 space-y-3">
                    <p className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                      <Smartphone className="w-3.5 h-3.5" /> UPI ID
                    </p>
                    <div className="space-y-1.5">
                      <Label className="text-xs">UPI ID</Label>
                      <Input
                        placeholder="yourname@upi"
                        value={bankForm.upiId}
                        onChange={e => setBankForm(p => ({ ...p, upiId: e.target.value }))}
                      />
                      <p className="text-xs text-muted-foreground">
                        This UPI ID will be validated within 24 hours by admin. Must use your own UPI ID.
                      </p>
                      <p className="text-xs text-muted-foreground">Pending manual verification before first withdrawal.</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-px bg-border" />
                    <span className="text-xs text-muted-foreground">OR</span>
                    <div className="flex-1 h-px bg-border" />
                  </div>

                  {/* Bank account */}
                  <div className="bg-muted rounded-lg p-4 space-y-3">
                    <p className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5" /> Bank account
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label className="text-xs">Account holder name</Label>
                        <Input
                          placeholder="Full name as per bank"
                          value={bankForm.accountHolder}
                          onChange={e => setBankForm(p => ({ ...p, accountHolder: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs">Account number</Label>
                        <Input
                          placeholder="Account number"
                          value={bankForm.accountNumber}
                          onChange={e => setBankForm(p => ({ ...p, accountNumber: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs">IFSC code</Label>
                        <Input
                          placeholder="SBIN0001234"
                          value={bankForm.ifscCode}
                          onChange={e => {
                            setBankForm(p => ({ ...p, ifscCode: e.target.value.toUpperCase() }));
                            setIfscLookupState({ status: "idle" });
                          }}
                          onBlur={handleIfscBlur}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs">Bank name</Label>
                        {ifscLookupState.status === "loading" && (
                          <p className="text-xs text-muted-foreground py-2">Looking up bank…</p>
                        )}
                        {ifscLookupState.status === "found" && (
                          <div className="flex items-center gap-1.5 text-sm py-2">
                            <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                            <span>{ifscLookupState.bank}{ifscLookupState.branch ? ` · ${ifscLookupState.branch}` : ""}</span>
                          </div>
                        )}
                        {ifscLookupState.status === "not_found" && (
                          <div className="flex items-center gap-1.5 text-sm text-destructive py-2">
                            <AlertCircle className="w-3.5 h-3.5" />
                            <span>IFSC not found — check the code</span>
                          </div>
                        )}
                        {ifscLookupState.status === "idle" && (
                          <p className="text-xs text-muted-foreground py-2">Enter a valid IFSC above to auto-fill</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <Button className="w-full" onClick={handleSaveBank} disabled={savingBank}>
                    <Save className="w-4 h-4 mr-1.5" />
                    {savingBank ? "Saving…" : "Save payment details"}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* ── Share link ── */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                <Share className="w-4 h-4" /> Your referral link
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="bg-muted rounded-lg p-3">
                <p className="text-xs text-muted-foreground mb-1">Referral code</p>
                <p className="text-xl font-mono font-medium text-blue-600 tracking-widest flex items-center justify-between gap-2">
                  {currentUser.referralCode}
                  <Button size="sm" className="border bottom-1 bg-transparent text-foreground" onClick={copyCode}><Copy className="w-3.5 h-3.5 mr-1.5" />Copy</Button>
                </p>
              </div>
              <div className="bg-muted rounded-lg p-3">
                <p className="text-xs text-muted-foreground mb-1">Referral URL</p>
                <p className="text-xs font-mono text-muted-foreground break-all">{referralUrl}</p>
              </div>
              <div className="flex gap-2 flex-wrap">
                <Button size="sm" onClick={copyLink}><Copy className="w-3.5 h-3.5 mr-1.5" />Copy URL</Button>
                <Button size="sm" variant="outline" onClick={shareLink}><Share className="w-3.5 h-3.5 mr-1.5" />Share</Button>
                <Button size="sm" variant="outline"
                  className="bg-green-50 hover:bg-green-100 border-green-200 text-green-700"
                  onClick={shareWhatsApp}>WhatsApp</Button>
              </div>
            </CardContent>
          </Card>

          {/* ── Reward structure ── */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                <Crown className="w-4 h-4" /> Reward structure
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { level: "Level 1 — direct",   pct: config.L1_COMMISSION_PCT, color: "text-green-600",  pctColor: "bg-green-100 text-green-700 border-green-200"   },
                  { level: "Level 2 — indirect",  pct: config.L2_COMMISSION_PCT, color: "text-purple-600", pctColor: "bg-purple-100 text-purple-700 border-purple-200" },
                ].map(({ level, pct, color, pctColor }) => (
                  <div key={level} className="bg-muted rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium">{level}</span>
                      <Badge className={`text-base font-medium px-2 border ${pctColor}`}>{pct}%</Badge>
                    </div>
                    {PLANS.map(plan => (
                      <div key={plan.name} className="flex justify-between items-center py-2 border-b border-border last:border-0">
                        <div>
                          <p className="text-xs font-medium">{plan.name}</p>
                          <p className="text-xs text-muted-foreground">{plan.duration}</p>
                        </div>
                        <span className={`text-sm font-medium ${color}`}>
                          ₹{Math.round(plan.price * pct / 100)}
                        </span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-800">
                Referred users get ₹{config.SIGNUP_DISCOUNT_AMOUNT} off at signup.
                You earn {config.L1_COMMISSION_PCT}% on their plan (L1) and {config.L2_COMMISSION_PCT}% on their referrals (L2).
                One-time reward per user within {config.REWARD_WINDOW_DAYS} days. Min withdrawal ₹{config.MIN_WITHDRAWAL || 100}.
              </div>
            </CardContent>
          </Card>

          {/* ── How it works ── */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                <Route className="w-4 h-4" /> How it works
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { step: "1", title: "Share your link",  desc: "Send your referral URL to agents or friends" },
                  { step: "2", title: "They sign up",     desc: `They register with your link and get ₹${config.SIGNUP_DISCOUNT_AMOUNT} off any paid plan` },
                  { step: "3", title: "Earn commission",  desc: `Get ${config.L1_COMMISSION_PCT}% on their plan once, ${config.L2_COMMISSION_PCT}% on their referrals once` },
                ].map(({ step, title, desc }) => (
                  <div key={step} className="text-center p-4 bg-muted rounded-lg">
                    <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-medium text-sm mx-auto mb-3">
                      {step}
                    </div>
                    <p className="text-sm font-medium mb-1">{title}</p>
                    <p className="text-xs text-muted-foreground">{desc}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* ── Referral chain ── */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                <GitBranch className="w-4 h-4" /> Referral chain
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!d.referredUsers?.length ? (
                <p className="text-center text-sm text-muted-foreground py-8">
                  No referrals yet. Share your link to get started.
                </p>
              ) : (
                <div>
                  {d.referredUsers.slice(0, 5).map((u, i) => (
                    <ReferralRow key={i} u={u} fmt={fmt} initials={initials} statusStyle={statusStyle} />
                  ))}
                  {d.referredUsers.length > 5 && (
                    <Button variant="outline" size="sm" className="w-full mt-3"
                      onClick={() => setShowAllReferrals(true)}>
                      See all {d.referredUsers.length} referrals
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <Dialog open={showAllReferrals} onOpenChange={setShowAllReferrals}>
            <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
              <DialogHeader><DialogTitle>All referrals ({d.referredUsers?.length ?? 0})</DialogTitle></DialogHeader>
              <div>
                {d.referredUsers?.map((u, i) => (
                  <ReferralRow key={i} u={u} fmt={fmt} initials={initials} statusStyle={statusStyle} />
                ))}
              </div>
            </DialogContent>
          </Dialog>

          {/* ── Earnings history ── */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                <Receipt className="w-4 h-4" /> Earnings history
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!d.earningsHistory?.length ? (
                <p className="text-center text-sm text-muted-foreground py-8">No earnings yet.</p>
              ) : (
                <div>
                  {d.earningsHistory.slice(0, 5).map((e, i) => (
                    <div key={i} className="grid grid-cols-[80px_1fr_80px] items-center gap-3 py-2.5 border-b border-border last:border-0">
                      <span className="text-xs text-muted-foreground">{fmt(e.date)}</span>
                      <span className="text-xs text-foreground">{e.description}</span>
                      <span className={`text-sm font-medium text-right ${e.status === "credited" ? "text-green-600" : "text-yellow-600"}`}>
                        +₹{e.amount}
                      </span>
                    </div>
                  ))}
                  {d.earningsHistory.length > 5 && (
                    <Button variant="outline" size="sm" className="w-full mt-3"
                      onClick={() => setShowAllEarnings(true)}>
                      See all {d.earningsHistory.length} entries
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <Dialog open={showAllEarnings} onOpenChange={setShowAllEarnings}>
            <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
              <DialogHeader><DialogTitle>All earnings ({d.earningsHistory?.length ?? 0})</DialogTitle></DialogHeader>
              <div>
                {d.earningsHistory?.map((e, i) => (
                  <div key={i} className="grid grid-cols-[80px_1fr_80px] items-center gap-3 py-2.5 border-b border-border last:border-0">
                    <span className="text-xs text-muted-foreground">{fmt(e.date)}</span>
                    <span className="text-xs text-foreground">{e.description}</span>
                    <span className={`text-sm font-medium text-right ${e.status === "credited" ? "text-green-600" : "text-yellow-600"}`}>
                      +₹{e.amount}
                    </span>
                  </div>
                ))}
              </div>
            </DialogContent>
          </Dialog>

          {/* ── Withdrawal history ── */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                <History className="w-4 h-4" /> Withdrawal history
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!d.withdrawalHistory?.length ? (
                <p className="text-center text-sm text-muted-foreground py-6">No withdrawals yet.</p>
              ) : (
                <div>
                  {d.withdrawalHistory.slice(0, 5).map((w, i) => (
                    <WithdrawalRow key={i} w={w} fmt={fmt} withdrawStatusStyle={withdrawStatusStyle} />
                  ))}
                  {d.withdrawalHistory.length > 5 && (
                    <Button variant="outline" size="sm" className="w-full mt-3"
                      onClick={() => setShowAllWithdrawals(true)}>
                      See all {d.withdrawalHistory.length} withdrawals
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <Dialog open={showAllWithdrawals} onOpenChange={setShowAllWithdrawals}>
            <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
              <DialogHeader><DialogTitle>All withdrawals ({d.withdrawalHistory?.length ?? 0})</DialogTitle></DialogHeader>
              <div>
                {d.withdrawalHistory?.map((w, i) => (
                  <WithdrawalRow key={i} w={w} fmt={fmt} withdrawStatusStyle={withdrawStatusStyle} />
                ))}
              </div>
            </DialogContent>
          </Dialog>

        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ReferralProgram;