import { useState, useEffect, useRef }  from "react";
import axios from "axios";
import { useNavigate, Link }            from "react-router-dom";
import Navigation                        from "@/components/Navigation";
import Footer                            from "@/components/Footer";
import { useLanguage }                   from "@/hooks/useLanguage";
import { getCurrentUser, setCurrentUser, type User } from "@/utils/auth";
import { Button }    from "@/components/ui/button";
import { Input }     from "@/components/ui/input";
import { Label }     from "@/components/ui/label";
import { Textarea }  from "@/components/ui/textarea";
import { Badge }     from "@/components/ui/badge";
import { useToast }  from "@/hooks/use-toast";
import {
  Edit, Save, X, KeyRound, Users, Camera,
  Crown, CheckCircle2, XCircle, ArrowRight,
  RefreshCw, ChevronRight, UserCircle2, Wallet2, Gauge,
  FileText, PlusCircle, BellRing, Bell, ShieldCheck, History, Monitor,
} from "lucide-react";
import { getProfile, updateProfile, updateProfileImage } from "../../services/userService";
import { resizeImageToSquare } from "@/utils/imageResize";
import { getReferralDashboard }        from "../../services/referralService";
import { convertDateToIndianFormat }   from "@/utils/tools";

const initials = (name = "") =>
  name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() || "?";

const roleLabel: Record<string, string> = {
  superadmin: "Super admin",
  admin:      "Admin",
  user:       "Policy agent",
};

interface ReferralDashboardData {
  totalL1?: number;
  totalL2?: number;
  availableBalance?: number;
  pendingEarnings?: number;
  totalEarned?: number;
}

const Profile = () => {
  const navigate      = useNavigate();
  const { t }         = useLanguage();
  const { toast }     = useToast();
  const fileRef       = useRef<HTMLInputElement>(null);

  const [user,       setUser]       = useState<User | null>(getCurrentUser());
  const [referral,   setReferral]   = useState<ReferralDashboardData | null>(null);
  const [isEditing,  setIsEditing]  = useState(false);
  const [saving,     setSaving]     = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [avatar,     setAvatar]     = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "", fullAddress: "", mobileNumber: "", email: ""
  });

  useEffect(() => {
    load();
  }, []);

  const load = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const [u, ref] = await Promise.all([
        getProfile(),
        getReferralDashboard().catch(() => null),
      ]);
      setCurrentUser(u);
      setUser(u);
      setReferral(ref);
      setForm({
        name:         u.name         ?? "",
        fullAddress:  u.fullAddress  ?? "",
        mobileNumber: u.mobileNumber ?? "",
        email:        u.email        ?? "",
      });
      if (u.profileImage) setAvatar(u.profileImage);
    } catch (err) {
      console.error(err);
    } finally {
      setRefreshing(false);
    }
  };

  if (!user) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(p => ({ ...p, [name]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await updateProfile(form);
      const updated = res.userInfo ?? res; // keep compatible if updateProfile's return shape changes

      if (res.emailChanged) {
        toast({
          title: "Verify your new email",
          description: "We've sent a verification link to your new email address.",
        });
      }

      setCurrentUser(updated);
      setUser(updated);
      setIsEditing(false);
      toast({ title: "Profile updated", description: "Your changes have been saved." });
    } catch {
      toast({ title: "Error", description: "Failed to update profile.", variant: "destructive" });
    } finally { setSaving(false); }
  };

  const handleCancel = () => {
    setForm({
      name:         user.name         ?? "",
      fullAddress:  user.fullAddress  ?? "",
      mobileNumber: user.mobileNumber ?? "",
      email:        user.email        ?? "",
    });
    setIsEditing(false);
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const resized = await resizeImageToSquare(file, 256, 0.6);
      setAvatar(resized);
      await updateProfileImage(resized);
      toast({ title: "Photo updated", description: "Profile photo saved." });
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response?.data?.code === "EMAIL_ALREADY_IN_USE") {
        toast({ title: "Email already in use", description: "That email belongs to another account. Try a different one.", variant: "destructive" });
        return;
      }
      const message = axios.isAxiosError(err) ? err.response?.data?.message : undefined;
      toast({ title: "Error", description: message || "Something went wrong.", variant: "destructive" });
    }
  };

  const sub        = user.subscription;
  const daysLeft   = sub?.endDate
    ? Math.max(0, Math.ceil((new Date(sub.endDate).getTime() - Date.now()) / 86400000))
    : 0;
  const totalDays  = sub?.planId === "6months" ? 180
                   : sub?.planId === "12months" ? 365
                   : sub?.planId === "24months" ? 730 : 30;
  const planPct    = Math.min(100, Math.round((daysLeft / totalDays) * 100));
  const planColor  = planPct > 50 ? "bg-blue-500" : planPct > 20 ? "bg-yellow-500" : "bg-red-500";

  const completionItems = [
    { label: "Name",            done: !!user.name           },
    { label: "Email verified",  done: !!user.isEmailVerified },
    { label: "Mobile number",   done: !!user.mobileNumber   },
    { label: "Full address",    done: !!user.fullAddress     },
    { label: "Profile photo",   done: !!avatar              },
    { label: "Payment details", done: !!(user.paymentDetails?.upiId || user.paymentDetails?.accountNumber) },
  ];
  const completionPct  = Math.round((completionItems.filter(i => i.done).length / completionItems.length) * 100);
  const completionColor = completionPct === 100 ? "bg-green-500"
                        : completionPct >= 60  ? "bg-yellow-500"
                        : "bg-red-500";

  const quickActions = [
    { icon: FileText,   label: "View records",      to: "/view-records" },
    { icon: PlusCircle, label: "Add record",         to: "/add-record" },
    { icon: BellRing,   label: "Due this month",     to: "/view-due-policies" },
    { icon: Crown,      label: "Plans & billing",    to: "/our-plans" },
    { icon: History,    label: "My activity",        to: "/my-activity" },
    { icon: Monitor,    label: "Sessions & devices",  to: "/sessions" },
    { icon: Bell,       label: "Notifications",       to: "/notification-preferences" },
  ];

  return (
    <div className="min-h-screen bg-muted/30 flex flex-col">
      <Navigation />

      <main className="container mx-auto px-4 py-8 flex-1">
        <div className="max-w-5xl mx-auto space-y-4">

          {/* ── Cover + Hero ── */}
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="h-20 sm:h-24 bg-gradient-to-r from-form-header via-form-header to-primary relative">
              <div className="absolute -bottom-8 left-4 sm:left-6">
                <div className="relative shrink-0 cursor-pointer" onClick={() => fileRef.current?.click()}>
                  <div className="w-[102px] h-[102px] rounded-full ring-4 ring-white overflow-hidden bg-blue-100 flex items-center justify-center text-blue-700 text-xl font-medium select-none shadow-md">
                    {avatar
                      ? <img src={avatar} alt="Profile" className="w-full h-full object-cover" />
                      : <span>{initials(form.name)}</span>
                    }
                  </div>
                  <div className="absolute bottom-0 right-0 w-[22px] h-[22px] rounded-full bg-primary border-2 border-white flex items-center justify-center">
                    <Camera className="w-3 h-3 text-primary-foreground" />
                  </div>
                  <input ref={fileRef} type="file" accept="image/*" className="hidden"
                    onChange={handleAvatarChange} />
                </div>
              </div>
              {sub?.status === "active" && (
                <Badge className="absolute top-3 right-3 bg-primary-foreground/15 text-primary-foreground border border-primary-foreground/25 text-[10px] backdrop-blur-sm">
                  <ShieldCheck className="w-3 h-3 mr-1" /> Active member
                </Badge>
              )}
            </div>

            <div className="pt-10 pb-4 px-4 sm:px-6">
              <h1 className="text-xl font-medium leading-tight">{form.name || "—"}</h1>
              <div className="flex items-center gap-2 flex-wrap mt-1 text-sm text-muted-foreground">
                <span>{roleLabel[user.role ?? "user"] ?? "Policy agent"}</span>
                <span className="font-mono text-xs bg-muted border border-border rounded px-1.5 py-0.5">
                  {user.easyId}
                </span>
                {user.isEmailVerified
                  ? <span className="flex items-center gap-1 text-xs text-green-700 bg-green-50 border border-green-200 rounded px-1.5 py-0.5">
                      <CheckCircle2 className="w-3 h-3" /> Email verified
                    </span>
                  : <button onClick={() => navigate("/verify-email")}
                      className="flex items-center gap-1 text-xs text-red-700 bg-red-50 border border-red-200 rounded px-1.5 py-0.5 hover:bg-red-100 transition-colors">
                      <XCircle className="w-3 h-3" /> Not verified — click to verify
                    </button>
                }
              </div>

              <div className="flex flex-wrap gap-2 mt-3">
                {!isEditing ? (
                  <Button size="sm" onClick={() => setIsEditing(true)}>
                    <Edit className="w-3.5 h-3.5 mr-1.5" /> Edit profile
                  </Button>
                ) : (
                  <>
                    <Button size="sm" onClick={handleSave} disabled={saving}>
                      <Save className="w-3.5 h-3.5 mr-1.5" />
                      {saving ? "Saving…" : "Save changes"}
                    </Button>
                    <Button size="sm" variant="outline" onClick={handleCancel}>
                      <X className="w-3.5 h-3.5 mr-1.5" /> Cancel
                    </Button>
                  </>
                )}
                <Button size="sm" variant="outline" asChild>
                  <Link to="/referral-program">
                    <Users className="w-3.5 h-3.5 mr-1.5" /> Referral program
                  </Link>
                </Button>
                <Button size="sm" variant="outline"
                  className="bg-red-50 hover:bg-red-100 border-red-200 text-red-700"
                  onClick={() => navigate("/change-password")}>
                  <KeyRound className="w-3.5 h-3.5 mr-1.5" /> Change password
                </Button>
                <Button size="sm" variant="ghost" onClick={() => load(true)} disabled={refreshing}>
                  <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
                </Button>
              </div>
            </div>
          </div>

          {/* ── Quick actions — compact bento row ── */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {quickActions.map(({ icon: Icon, label, to }) => (
              <Link
                key={label}
                to={to}
                className="bg-card border border-border rounded-xl p-3 flex flex-col items-center text-center gap-1.5 hover:border-primary/40 hover:shadow-sm transition-all"
              >
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Icon className="w-4 h-4 text-primary" />
                </div>
                <span className="text-[11px] font-medium text-form-header leading-tight">{label}</span>
              </Link>
            ))}
          </div>

          {/* ── Profile completion bar ── */}
          <div className="bg-card border border-border rounded-xl px-4 py-3.5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium flex items-center gap-1.5">
                <Gauge className="w-4 h-4 text-primary" /> Profile Completion
              </p>
              <p className={`text-sm font-medium ${
                completionPct === 100 ? "text-green-600"
                : completionPct >= 60 ? "text-yellow-600"
                : "text-red-600"
              }`}>{completionPct}%</p>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden mb-2.5">
              <div className={`h-full rounded-full transition-all duration-500 ${completionColor}`}
                style={{ width: `${completionPct}%` }} />
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1">
              {completionItems.map(({ label, done }) => (
                <span key={label} className={`flex items-center gap-1 text-xs ${done ? "text-green-600" : "text-red-500"}`}>
                  {done
                    ? <CheckCircle2 className="w-3 h-3 shrink-0" />
                    : <XCircle      className="w-3 h-3 shrink-0" />}
                  {label}
                </span>
              ))}
            </div>
          </div>

          {/* ── Main two-column ── */}
          <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-4">

            <div className="bg-card border border-border rounded-xl p-4">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-1.5">
                <Crown className="w-3.5 h-3.5 text-primary" /> Account
              </p>

              {[
                { label: "Status",
                  val: sub?.status === "active"
                    ? <Badge className="text-xs bg-green-100 text-green-700 border border-green-200">Active</Badge>
                    : <Badge variant="destructive" className="text-xs">Expired</Badge>
                },
                { label: "Plan",     val: `${sub?.planType} · ₹${sub?.price ?? 0}` },
                { label: "Duration", val: sub?.duration || "—"                      },
                { label: "Expires",  val: convertDateToIndianFormat(sub?.endDate)    },
                { label: "Days left",
                  val: <Badge className="text-xs bg-blue-100 text-blue-700 border border-blue-200">
                    {daysLeft}d
                  </Badge>
                },
                { label: "Records",      val: <span className="text-blue-600 font-medium text-xs">{user.totalRecords ?? 0}</span> },
                { label: "Member since", val: convertDateToIndianFormat(user.createdAt) },
                { label: "Referral code",
                  val: <span className="font-mono text-xs bg-muted border border-border rounded px-1.5 py-0.5">
                    {user.referralCode || "N/A"}
                  </span>
                },
              ].map(({ label, val }) => (
                <div key={label} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <span className="text-xs text-muted-foreground">{label}</span>
                  <span className="text-xs font-medium">{val}</span>
                </div>
              ))}

              <div className="mt-3">
                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                  <span>Time left</span><span>{daysLeft}/{totalDays}d</span>
                </div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${planColor}`} style={{ width: `${planPct}%` }} />
                </div>
              </div>

              <button
                onClick={() => navigate("/our-plans")}
                className="mt-3 w-full flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 hover:bg-blue-100 transition-colors">
                <span className="text-xs font-medium text-blue-700 flex items-center gap-1">
                  <Crown className="w-3 h-3" /> Upgrade plan
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-blue-600" />
              </button>
            </div>

            <div className="bg-card border border-border rounded-xl p-4">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-1.5">
                <UserCircle2 className="w-3.5 h-3.5 text-primary" /> Profile information
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">
                    Name <span className="text-muted-foreground/60">(cannot change)</span>
                  </Label>
                  <Input value={form.name} disabled
                    className="bg-muted text-muted-foreground text-sm h-9" />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Mobile number</Label>
                  <Input name="mobileNumber" value={form.mobileNumber}
                    onChange={handleChange} disabled={!isEditing}
                    className={`text-sm h-9 ${!isEditing ? "bg-muted text-muted-foreground" : ""}`} />
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <div className="flex items-center gap-2">
                    <Label className="text-xs text-muted-foreground">Email address</Label>
                    {user.isEmailVerified
                      ? <span className="text-xs text-green-700 flex items-center gap-0.5">
                          <CheckCircle2 className="w-3 h-3" /> Verified
                        </span>
                      : <span className="text-xs text-red-600 flex items-center gap-0.5">
                          <XCircle className="w-3 h-3" /> Not verified
                        </span>}
                  </div>
                  <div className="relative">
                    <Input name="email" type="email" value={form.email}
                      onChange={handleChange} disabled={!isEditing}
                      className={`text-sm h-9 ${!isEditing ? "bg-muted text-muted-foreground" : ""} ${!user.isEmailVerified ? "pr-24" : ""}`} />
                    {!user.isEmailVerified && (
                      <Button size="sm" variant="outline"
                        className="absolute right-1.5 top-1/2 -translate-y-1/2 h-7 text-xs bg-red-50 hover:bg-red-100 border-red-200 text-red-700 px-2"
                        onClick={() => navigate("/verify-email")}>
                        Verify now
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Full address</Label>
                <Textarea name="fullAddress" value={form.fullAddress}
                  onChange={handleChange} disabled={!isEditing} rows={3}
                  className={`text-sm resize-none ${!isEditing ? "bg-muted text-muted-foreground" : ""}`} />
              </div>

              {isEditing && (
                <p className="text-xs text-blue-700 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 mt-3">
                  Name and Easy ID are permanently assigned and cannot be changed.
                </p>
              )}

              {!user.paymentDetails?.upiId && !user.paymentDetails?.accountNumber && (
                <button
                  onClick={() => navigate("/referral-program")}
                  className="mt-3 w-full flex items-center justify-between bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2 hover:bg-yellow-100 transition-colors">
                  <span className="text-xs font-medium text-yellow-700">
                    Add payment details to enable withdrawals
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-yellow-600" />
                </button>
              )}
            </div>
          </div>

          {/* ── Referral summary ── */}
          {referral && (
            <div className="bg-card border border-border rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
                  <Wallet2 className="w-3.5 h-3.5 text-primary" /> Referral summary
                </p>
                <Link to="/referral-program" className="text-xs text-blue-600 hover:underline">
                  View full dashboard →
                </Link>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {[
                  { label: "Direct (L1)",   val: referral.totalL1 ?? 0,               color: "text-blue-600"   },
                  { label: "Indirect (L2)", val: referral.totalL2 ?? 0,               color: "text-purple-600" },
                  { label: "Total earned",  val: `₹${referral.totalEarned ?? 0}`,     color: "text-green-600"  },
                  { label: "Wallet",        val: `₹${referral.availableBalance ?? 0}`,color: "text-green-600"  },
                  { label: "Pending",       val: `₹${referral.pendingEarnings ?? 0}`, color: "text-yellow-600" },
                ].map(({ label, val, color }) => (
                  <div key={label} className="text-center bg-muted rounded-lg p-3">
                    <p className={`text-lg font-medium ${color}`}>{val}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Profile;