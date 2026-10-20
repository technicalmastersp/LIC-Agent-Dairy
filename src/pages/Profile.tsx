import { useState, useEffect, useRef, useCallback } from "react";
import type { TranslationKey } from "@/types/i18n.types";
import axios from "axios";
import { useNavigate, Link }            from "react-router-dom";
import Navigation                        from "@/components/Navigation";
import Footer                            from "@/components/Footer";
import { useLanguage }                   from "@/hooks/useLanguage";
import { SensitiveValue } from "@/components/SensitiveValue";
import { useSensitiveInputClass } from "@/hooks/useSensitiveMask";
import { getCurrentUser, setCurrentUser } from "@/utils/auth";
import type { User } from "@/types/utils/auth.types";
import { Button }    from "@/components/ui/button";
import { Input }     from "@/components/ui/input";
import { Label }     from "@/components/ui/label";
import { Textarea }  from "@/components/ui/textarea";
import { Badge }     from "@/components/ui/badge";
import { Switch }    from "@/components/ui/switch";
import { useToast }  from "@/hooks/use-toast";
import {
  Edit, Save, X, KeyRound, Users, Camera,
  Crown, CheckCircle2, XCircle, ArrowRight,
  RefreshCw, ChevronRight, UserCircle2, Wallet2, Gauge,
  FileText, PlusCircle, BellRing, Bell, ShieldCheck, ShieldAlert, History, Monitor,
  Landmark, Copy, Check, CalendarClock, CreditCard, LogOut, Lock, AlertTriangle,
  Fingerprint, Download, IdCard,
} from "lucide-react";
import BusinessCard, { BUSINESS_CARD_TEMPLATES } from "@/components/BusinessCard";
import type { BusinessCardHandle, BusinessCardTheme } from "@/types/components/BusinessCard.types";
import {
  getProfile, updateProfile, updateProfileImage,
  getMySessions, revokeOtherSessions,
  getNotificationPreferences, updateNotificationPreferences,
  getMyActivity,
} from "../../services/userService";
import { resizeImageToSquare } from "@/utils/imageResize";
import { getReferralDashboard }        from "../../services/referralService";
import { REFERRAL_PROGRAM_ENABLED }   from "@/config/featureFlags";
import { convertDateToIndianFormat }   from "@/utils/tools";
import type { ReferralDashboardData } from "@/types/pages/Profile.types";
import type { Session }               from "@/types/pages/SessionManagement.types";
import type { Preferences }           from "@/types/pages/NotificationPreferences.types";
import type { ActivityLog, Pagination } from "@/types/pages/MyActivity.types";
import Trans from "@/components/Trans";

const initials = (name = "") =>
  name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() || "?";

// Values are i18n keys (module scope can't call hooks); translated where displayed.
const roleLabel: Record<string, TranslationKey> = {
  superadmin: "profile.roleSuperAdmin",
  admin:      "profile.roleAdmin",
  user:       "profile.policyAgent",
};

const DEFAULT_PREFS: Preferences = {
  policyDueReminders: true,
  subscriptionReminders: true,
};

// Same palette MyActivity.tsx/AdminLogs.tsx use — kept as a local copy
// here since this is only a 4-item preview, not worth sharing a module for.
const ACTION_COLORS: Record<string, string> = {
  RECORD_CREATED:        "bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400",
  RECORD_UPDATED:        "bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400",
  RECORD_DELETED:        "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400",
  RECORDS_BULK_IMPORTED: "bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400",
  PASSWORD_CHANGED:      "bg-purple-100 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400",
  PROFILE_UPDATED:       "bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400",
  WITHDRAWAL_APPROVED:   "bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400",
  WITHDRAWAL_REJECTED:   "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400",
  SUBSCRIPTION_CHANGED:  "bg-purple-100 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400",
  UPI_VERIFIED:          "bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400",
  UPI_REJECTED:          "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400",
  FORCE_LOGOUT:          "bg-orange-100 text-orange-700 dark:bg-orange-950/40 dark:text-orange-400",
};

// Human-readable labels for the permission keys the backend tracks — only
// the ones worth surfacing on a self-view profile card.
const PERMISSION_LABELS: Record<string, TranslationKey> = {
  can_view_users: "profile.permViewUsers",
  can_deactivate_users: "profile.permDeactivateUsers",
  can_view_withdrawals: "profile.permViewWithdrawals",
  can_approve_withdrawals: "profile.permApproveWithdrawals",
  can_reject_withdrawals: "profile.permRejectWithdrawals",
  can_verify_payment_details: "profile.permVerifyPaymentDetails",
  can_manage_support: "profile.permManageSupport",
  can_view_revenue: "profile.permViewRevenue",
  can_manage_expenses: "profile.permManageExpenses",
  can_view_logs: "profile.permViewLogs",
  can_change_subscription: "profile.permChangeSubscription",
  can_delete_users: "profile.permDeleteUsers",
};

const Profile = () => {
  const navigate      = useNavigate();
  const { t }         = useLanguage();
  // Hide/Show sensitive data: obscure these inputs (CSS only) while hidden
  const mobileMask  = useSensitiveInputClass("mobileNumber");
  const emailMask   = useSensitiveInputClass("email");
  const addressMask = useSensitiveInputClass("address");
  const { toast }     = useToast();
  const fileRef       = useRef<HTMLInputElement>(null);

  const [user,       setUser]       = useState<User | null>(getCurrentUser());
  const [referral,   setReferral]   = useState<ReferralDashboardData | null>(null);
  const [isEditing,  setIsEditing]  = useState(false);
  const [saving,     setSaving]     = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [avatar,     setAvatar]     = useState<string | null>(null);

  // ── New: sessions, notification prefs, recent activity ──
  const [sessions,         setSessions]         = useState<Session[] | null>(null);
  const [prefs,            setPrefs]            = useState<Preferences>(DEFAULT_PREFS);
  const [prefSaving,       setPrefSaving]       = useState<keyof Preferences | null>(null);
  const [activity,         setActivity]         = useState<ActivityLog[]>([]);
  const [activityTotal,    setActivityTotal]    = useState<Pagination | null>(null);
  const [signingOutOthers, setSigningOutOthers] = useState(false);
  const [copied,           setCopied]           = useState<"easyId" | "referral" | null>(null);
  const [cardTheme,        setCardTheme]        = useState<BusinessCardTheme>("classic");
  const cardRef = useRef<BusinessCardHandle>(null);

  const [form, setForm] = useState({
    name: "", fullAddress: "", mobileNumber: "", email: "", businessCardNote: ""
  });

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const [u, ref, sess, np, act] = await Promise.all([
        getProfile(),
        REFERRAL_PROGRAM_ENABLED ? getReferralDashboard().catch(() => null) : Promise.resolve(null),
        getMySessions().catch(() => null),
        getNotificationPreferences().catch(() => null),
        getMyActivity({ page: 1 }).catch(() => null),
      ]);
      setCurrentUser(u);
      setUser(u);
      setReferral(ref);
      setSessions(sess);
      if (np) setPrefs({ ...DEFAULT_PREFS, ...np });
      if (act) {
        setActivity((act.logs ?? []).slice(0, 4));
        setActivityTotal(act.pagination ?? null);
      }
      setForm({
        name:             u.name             ?? "",
        fullAddress:      u.fullAddress      ?? "",
        mobileNumber:     u.mobileNumber     ?? "",
        email:            u.email            ?? "",
        businessCardNote: u.businessCardNote ?? "",
      });
      if (u.profileImage) setAvatar(u.profileImage);
    } catch (err) {
      console.error(err);
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (!user) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(p => ({ ...p, [name]: value }));
  };

  const MAX_NOTE_CHARS = 150;
  const noteCharCount = form.businessCardNote.length;

  const handleNoteChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const raw = e.target.value.slice(0, MAX_NOTE_CHARS);
    setForm(p => ({ ...p, businessCardNote: raw }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await updateProfile(form);
      const updated = res.userInfo ?? res; // keep compatible if updateProfile's return shape changes

      if (res.emailChanged) {
        toast({
          title: t('profile.verifyYourNewEmail'),
          description: t('profile.weVeSentAVerification'),
        });
      }

      setCurrentUser(updated);
      setUser(updated);
      setIsEditing(false);
      toast({ title: t('profile.profileUpdated'), description: t('profile.yourChangesHaveBeenSaved') });
    } catch (error: unknown) {
      const message = axios.isAxiosError(error) ? error.response?.data?.message : undefined;
      toast({ title: t('profile.error'), description: message || t('profile.failedToUpdateProfile'), variant: "destructive" });
    } finally { setSaving(false); }
  };

  const handleCancel = () => {
    setForm({
      name:             user.name             ?? "",
      fullAddress:      user.fullAddress      ?? "",
      mobileNumber:     user.mobileNumber     ?? "",
      email:            user.email            ?? "",
      businessCardNote: user.businessCardNote ?? "",
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
      toast({ title: t('profile.photoUpdated'), description: t('profile.profilePhotoSaved') });
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response?.data?.code === "EMAIL_ALREADY_IN_USE") {
        toast({ title: t('profile.emailAlreadyInUse'), description: t('profile.thatEmailBelongsToAnother'), variant: "destructive" });
        return;
      }
      const message = axios.isAxiosError(err) ? err.response?.data?.message : undefined;
      toast({ title: t('profile.error'), description: message || t('profile.somethingWentWrong'), variant: "destructive" });
    }
  };

  const handleCopy = async (value: string, key: "easyId" | "referral") => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(key);
      setTimeout(() => setCopied(c => (c === key ? null : c)), 1500);
    } catch {
      toast({ title: t('profile.couldnTCopy'), description: t('profile.copyItManuallyInstead'), variant: "destructive" });
    }
  };

  const handlePrefToggle = async (key: keyof Preferences, value: boolean) => {
    const previous = prefs[key];
    setPrefs(p => ({ ...p, [key]: value })); // optimistic
    setPrefSaving(key);
    try {
      await updateNotificationPreferences({ [key]: value });
    } catch (error: unknown) {
      setPrefs(p => ({ ...p, [key]: previous })); // roll back
      const message = axios.isAxiosError(error) ? error.response?.data?.message : undefined;
      toast({ title: t('profile.error'), description: message || t('profile.couldnTSaveThatChange'), variant: "destructive" });
    } finally {
      setPrefSaving(null);
    }
  };

  const handleSignOutOthers = async () => {
    setSigningOutOthers(true);
    try {
      await revokeOtherSessions();
      const sess = await getMySessions().catch(() => null);
      setSessions(sess);
      toast({ title: t('profile.otherDevicesSignedOut') });
    } catch (error: unknown) {
      const message = axios.isAxiosError(error) ? error.response?.data?.message : undefined;
      toast({ title: t('profile.error'), description: message || t('profile.couldnTSignOutOther'), variant: "destructive" });
    } finally {
      setSigningOutOthers(false);
    }
  };

  const handleDownloadCard = () => {
    const dataUrl = cardRef.current?.toDataURL();
    if (!dataUrl) return;
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `${(user.name || "business-card").trim().toLowerCase().replace(/\s+/g, "-")}-business-card.png`;
    a.click();
  };

  const sub        = user.subscription;
  const daysLeft   = sub?.endDate
    ? Math.max(0, Math.ceil((new Date(sub.endDate).getTime() - Date.now()) / 86400000))
    : 0;
  const totalDays  = sub?.planId === "3months" ? 90
                   : sub?.planId === "6months" ? 180
                   : sub?.planId === "12months" ? 365 : 30;
  const planPct    = Math.min(100, Math.round((daysLeft / totalDays) * 100));
  const planColor  = planPct > 50 ? "bg-blue-500" : planPct > 20 ? "bg-yellow-500" : "bg-red-500";

  const payment        = user.paymentDetails;
  const hasPayout       = !!(payment?.upiId || payment?.accountNumber);
  const payoutVerified = !!(
    (payment?.upiId && payment?.upiVerified) ||
    (payment?.accountNumber && payment?.bankVerified)
  );

  // WALLET-TRANSFER-PAUSED — payout details only matter when wallet→bank/UPI
  // transfers are on, so they don't count toward profile completion otherwise.
  const withdrawalsEnabled = referral?.withdrawalsEnabled === true;

  const completionItems = [
    { label: t('common.name'),            done: !!user.name           },
    { label: t('profile.emailVerified'),  done: !!user.isEmailVerified },
    { label: t('profile.mobileNumber'),   done: !!user.mobileNumber   },
    { label: t('profile.fullAddress'),    done: !!user.fullAddress     },
    { label: t('profile.profilePhoto'),   done: !!avatar              },
    ...(withdrawalsEnabled ? [{ label: t('profile.payoutDetails'), done: hasPayout }] : []),
  ];
  const completionPct  = Math.round((completionItems.filter(i => i.done).length / completionItems.length) * 100);
  const completionColor = completionPct === 100 ? "bg-green-500"
                        : completionPct >= 60  ? "bg-yellow-500"
                        : "bg-red-500";

  const quickActions = [
    { icon: FileText,   label: t('profile.viewRecords'),      to: "/view-records" },
    { icon: PlusCircle, label: t('profile.addRecord'),         to: "/add-record" },
    { icon: BellRing,   label: t('profile.dueThisMonth'),     to: "/view-due-policies" },
    { icon: Crown,      label: t('profile.plansBilling'),    to: "/our-plans" },
    { icon: History,    label: t('profile.myActivity'),        to: "/my-activity" },
    { icon: Monitor,    label: t('profile.sessionsDevices'),  to: "/sessions" },
    { icon: Bell,       label: t('profile.notifications'),       to: "/notification-preferences" },
  ];

  const grantedPermissions = Object.entries(user.permissions ?? {})
    .filter(([, v]) => v === true)
    .map(([k]) => (PERMISSION_LABELS[k] ? t(PERMISSION_LABELS[k]) : k));

  const isAccountDeactivated = user.isActive === false;

  return (
    <div className="min-h-screen bg-muted/30 flex flex-col">
      <Navigation />

      <main className="container mx-auto px-4 py-8 flex-1">
        <div className="max-w-6xl mx-auto space-y-4">

          {/* ── Deactivated account banner ── */}
          {isAccountDeactivated && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium text-red-700">{t('profile.yourAccountIsDeactivated')}</p>
                <p className="text-xs text-red-600 mt-0.5">
                  {user.deactivationNote || t('profile.contactSupportIfYouBelieve')}
                </p>
              </div>
            </div>
          )}

          {/* ── Cover + Hero ── */}
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="h-20 sm:h-24 bg-gradient-to-r from-form-header via-form-header to-primary relative">
              <div className="absolute -bottom-8 left-4 sm:left-6">
                <div className="relative shrink-0 cursor-pointer" onClick={() => fileRef.current?.click()}>
                  <div className="w-[102px] h-[102px] rounded-full ring-4 ring-white overflow-hidden bg-blue-100 flex items-center justify-center text-blue-700 text-xl font-medium select-none shadow-md">
                    {avatar
                      ? <img src={avatar} alt={t('profile.profile')} className="w-full h-full object-cover" />
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
                  <ShieldCheck className="w-3 h-3 mr-1" /> {" "}{t('profile.activeMember')}
                </Badge>
              )}
            </div>

            <div className="pt-10 pb-4 px-4 sm:px-6">
              <div className="flex items-start justify-between gap-2 flex-wrap">
                <div>
                  <h1 className="text-xl font-medium leading-tight">{form.name || "—"}</h1>
                  <div className="flex items-center gap-2 flex-wrap mt-1 text-sm text-muted-foreground">
                    <span>{t(roleLabel[user.role ?? "user"] ?? 'profile.policyAgent')}</span>
                    <button
                      onClick={() => user.easyId && handleCopy(user.easyId, "easyId")}
                      className="font-mono text-xs bg-muted border border-border rounded px-1.5 py-0.5 flex items-center gap-1 hover:border-primary/40 transition-colors"
                      title={t('profile.copyUserId')}
                    >
                      {t('profile.userIdLabel', { id: user.easyId })}
                      {copied === "easyId"
                        ? <Check className="w-2.5 h-2.5 text-green-600" />
                        : <Copy className="w-2.5 h-2.5 text-muted-foreground/70" />}
                    </button>
                    {user.isEmailVerified
                      ? <span className="flex items-center gap-1 text-xs text-green-700 bg-green-50 border border-green-200 rounded px-1.5 py-0.5">
                          <CheckCircle2 className="w-3 h-3" /> {" "}{t('profile.emailVerified')}
                        </span>
                      : <button onClick={() => navigate("/verify-email")}
                          className="flex items-center gap-1 text-xs text-red-700 bg-red-50 border border-red-200 rounded px-1.5 py-0.5 hover:bg-red-100 transition-colors">
                          <XCircle className="w-3 h-3" /> {" "}{t('profile.notVerifiedClickToVerify')}
                        </button>
                    }
                  </div>
                  {user.referredBy && (
                    <p className="text-xs text-muted-foreground mt-1.5"><Trans i18nKey="profile.referred" params={{ referredBy: user.referredBy }} components={{ span: <span className="font-medium text-form-header" /> }} /></p>
                  )}
                </div>

                <div className="text-right hidden sm:block">
                  <p className="text-[11px] text-muted-foreground">{t('profile.memberSince')}</p>
                  <p className="text-sm font-medium text-form-header">{convertDateToIndianFormat(user.createdAt) || "—"}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mt-3">
                {!isEditing ? (
                  <Button size="sm" onClick={() => setIsEditing(true)}>
                    <Edit className="w-3.5 h-3.5 mr-1.5" /> {" "}{t('profile.editProfile')}
                  </Button>
                ) : (
                  <>
                    <Button size="sm" onClick={handleSave} disabled={saving}>
                      <Save className="w-3.5 h-3.5 mr-1.5" />
                      {saving ? t('profile.saving') : t('profile.saveChanges')}
                    </Button>
                    <Button size="sm" variant="outline" onClick={handleCancel}>
                      <X className="w-3.5 h-3.5 mr-1.5" /> {" "}{t('common.cancel')}
                    </Button>
                  </>
                )}
                {REFERRAL_PROGRAM_ENABLED && (
                <Button size="sm" variant="outline" asChild>
                  <Link to="/referral-program">
                    <Users className="w-3.5 h-3.5 mr-1.5" /> {" "}{t('profile.referralProgram')}
                  </Link>
                </Button>
                )}
                <Button size="sm" variant="outline"
                  className="bg-red-50 hover:bg-red-100 border-red-200 text-red-700"
                  onClick={() => navigate("/change-password")}>
                  <KeyRound className="w-3.5 h-3.5 mr-1.5" /> {" "}{t('profile.changePassword')}
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
                <Gauge className="w-4 h-4 text-primary" /> {" "}{t('profile.profileCompletion')}
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

          {/* ── Digital business card ── */}
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
              <p className="text-sm font-medium flex items-center gap-1.5">
                <IdCard className="w-4 h-4 text-primary" /> {" "}{t('profile.yourDigitalBusinessCard')}
              </p>
              {completionPct === 100 ? (
                <Button size="sm" onClick={handleDownloadCard}>
                  <Download className="w-3.5 h-3.5 mr-1.5" /> {" "}{t('profile.downloadYourCard')}
                </Button>
              ) : (
                <Badge variant="secondary" className="text-xs">
                  {t('profile.completeUnlocksAt100', { completionPct })}
                </Badge>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-4 items-start">
              <BusinessCard
                ref={cardRef}
                name={form.name}
                roleLabel={t(roleLabel[user.role?.toLocaleUpperCase() ?? "user"] ?? 'profile.policyAgent2')}
                mobileNumber={form.mobileNumber}
                email={form.email}
                easyId={user.easyId}
                profileImage={avatar}
                note={form.businessCardNote}
                theme={cardTheme}
                locked={completionPct < 100}
                className="max-w-xl"
              />
              <div className="flex md:flex-col gap-2 flex-wrap md:w-40">
                {BUSINESS_CARD_TEMPLATES.map((tk) => (
                  <button
                    key={tk.id}
                    onClick={() => setCardTheme(tk.id)}
                    className={`flex items-center gap-2 rounded-lg border px-2.5 py-2 text-xs font-medium transition-colors ${
                      cardTheme === tk.id
                        ? "border-primary ring-1 ring-primary"
                        : "border-border hover:border-primary/40"
                    }`}
                  >
                    <span className="w-6 h-6 rounded-full border border-border shrink-0" style={{ background: tk.swatch }} />
                    {t(tk.label)}
                  </button>
                ))}
              </div>
            </div>

            {completionPct < 100 && (
              <p className="text-xs text-muted-foreground mt-3">
                {t('profile.finishYourProfileToUnlock', { completionItems: completionItems.filter(i => !i.done).map(i => i.label).join(", ") })}
              </p>
            )}
          </div>

          {/* ── Main layout: sidebar + content ── */}
          <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-4 items-start">

            {/* ══ Sidebar ══ */}
            <div className="space-y-4">

              {/* Account & subscription */}
              <div className="bg-card border border-border rounded-xl p-4">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-1.5">
                  <Crown className="w-3.5 h-3.5 text-primary" /> {" "}{t('profile.account')}
                </p>

                {[
                  { label: t('common.status'),
                    val: sub?.status === "active"
                      ? <Badge className="text-xs bg-green-100 text-green-700 border border-green-200">{t('common.active')}</Badge>
                      : <Badge variant="destructive" className="text-xs">{sub?.status ?? t('common.expired')}</Badge>
                  },
                  { label: t('profile.plan'),     val: `${sub?.planType ?? "—"} · ₹${sub?.price ?? 0}` },
                  { label: t('profile.duration'), val: sub?.duration || "—"                      },
                  { label: t('profile.expires'),  val: convertDateToIndianFormat(sub?.endDate)    },
                  { label: t('profile.daysLeft'),
                    val: <Badge className="text-xs bg-blue-100 text-blue-700 border border-blue-200">
                      {daysLeft}d
                    </Badge>
                  },
                  { label: t('profile.records'),      val: <span className="text-blue-600 font-medium text-xs">{user.totalRecords ?? 0}</span> },
                  ...(REFERRAL_PROGRAM_ENABLED ? [
                  { label: t('profile.referralCode'),
                    val: <button
                      onClick={() => user.referralCode && handleCopy(user.referralCode, "referral")}
                      className="font-mono text-xs bg-muted border border-border rounded px-1.5 py-0.5 flex items-center gap-1 hover:border-primary/40 transition-colors"
                    >
                      {user.referralCode || "N/A"}
                      {copied === "referral"
                        ? <Check className="w-2.5 h-2.5 text-green-600" />
                        : <Copy className="w-2.5 h-2.5 text-muted-foreground/70" />}
                    </button>
                  },
                  ] : []),
                ].map(({ label, val }) => (
                  <div key={label} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                    <span className="text-xs text-muted-foreground">{label}</span>
                    <span className="text-xs font-medium">{val}</span>
                  </div>
                ))}

                <div className="mt-3">
                  <div className="flex justify-between text-xs text-muted-foreground mb-1">
                    <span>{t('profile.timeLeft')}</span><span>{daysLeft}/{totalDays}d</span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${planColor}`} style={{ width: `${planPct}%` }} />
                  </div>
                </div>

                <button
                  onClick={() => navigate("/our-plans")}
                  className="mt-3 w-full flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 hover:bg-blue-100 transition-colors">
                  <span className="text-xs font-medium text-blue-700 flex items-center gap-1">
                    <Crown className="w-3 h-3" /> {" "}{t('profile.upgradePlan')}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-blue-600" />
                </button>
              </div>

              {/* Payment & payout details — WALLET-TRANSFER-PAUSED: hidden while withdrawals are off */}
              {withdrawalsEnabled && (
              <div className="bg-card border border-border rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
                    <Landmark className="w-3.5 h-3.5 text-primary" /> {" "}{t('profile.payoutDetails')}
                  </p>
                  {hasPayout && (
                    payoutVerified
                      ? <span className="flex items-center gap-1 text-[11px] text-green-700"><CheckCircle2 className="w-3 h-3" /> {" "}{t('common.verified')}</span>
                      : <span className="flex items-center gap-1 text-[11px] text-yellow-700"><AlertTriangle className="w-3 h-3" /> {" "}{t('common.pending')}</span>
                  )}
                </div>

                {!hasPayout ? (
                  <button
                    onClick={() => navigate("/referral-program")}
                    className="w-full flex items-center justify-between bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2 hover:bg-yellow-100 transition-colors">
                    <span className="text-xs font-medium text-yellow-700 text-left">
                      {t('profile.addPayoutDetailsToWithdraw')}
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 text-yellow-600 shrink-0" />
                  </button>
                ) : (
                  <div className="space-y-2">
                    {payment?.upiId && (
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground flex items-center gap-1.5">
                          <CreditCard className="w-3.5 h-3.5" /> UPI
                        </span>
                        <SensitiveValue field="upiId" value={payment.upiId} render={(v) => `••••••${v.slice(6)}`} className="font-mono" />
                      </div>
                    )}
                    {payment?.accountNumber && (
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground flex items-center gap-1.5">
                          <Landmark className="w-3.5 h-3.5" /> {payment.bankName || t('profile.bank')}
                        </span>
                        <SensitiveValue field="bankAccountNumber" value={payment.accountNumber} render={(v) => `••••${v.slice(-4)}`} className="font-mono" />
                      </div>
                    )}
                    {payment?.upiRejectionReason && (
                      <p className="text-[11px] text-red-600 bg-red-50 border border-red-200 rounded px-2 py-1">
                        {payment.upiRejectionReason}
                      </p>
                    )}
                    <button
                      onClick={() => navigate("/referral-program")}
                      className="w-full flex items-center justify-between text-xs text-primary hover:underline pt-1"
                    >
                      {t('profile.managePayoutDetails')}{" "} <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
              )}

              {/* Security & sessions */}
              <div className="bg-card border border-border rounded-xl p-4">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-1.5">
                  <Fingerprint className="w-3.5 h-3.5 text-primary" /> {" "}{t('profile.security')}
                </p>
                <div className="flex items-center justify-between py-1.5 border-b border-border">
                  <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <Monitor className="w-3.5 h-3.5" /> {" "}{t('profile.activeSessions')}
                  </span>
                  <Badge variant="secondary" className="text-xs">
                    {sessions === null ? "…" : sessions.length}
                  </Badge>
                </div>
                <div className="flex items-center justify-between py-1.5 border-b border-border last:border-0">
                  <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5" /> {" "}{t('common.password')}
                  </span>
                  <button onClick={() => navigate("/change-password")} className="text-xs text-primary hover:underline">
                    {t('profile.change')}
                  </button>
                </div>

                <div className="flex flex-col gap-2 mt-3">
                  <Button size="sm" variant="outline" className="w-full justify-center text-xs h-8" asChild>
                    <Link to="/sessions">
                      <Monitor className="w-3.5 h-3.5 mr-1.5" /> {" "}{t('profile.manageDevices')}
                    </Link>
                  </Button>
                  {sessions && sessions.length > 1 && (
                    <Button
                      size="sm" variant="outline"
                      className="w-full justify-center text-xs h-8 bg-red-50 hover:bg-red-100 border-red-200 text-red-700"
                      onClick={handleSignOutOthers} disabled={signingOutOthers}
                    >
                      <LogOut className="w-3.5 h-3.5 mr-1.5" />
                      {signingOutOthers ? t('profile.signingOut') : t('profile.signOutOtherDevices')}
                    </Button>
                  )}
                </div>
              </div>

              {/* Notification preferences — inline quick toggles */}
              <div className="bg-card border border-border rounded-xl p-4">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-1.5">
                  <BellRing className="w-3.5 h-3.5 text-primary" /> {" "}{t('profile.notifications')}
                </p>
                <div className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div className="flex items-start gap-2 pr-2">
                    <CalendarClock className="w-3.5 h-3.5 text-muted-foreground mt-0.5 shrink-0" />
                    <span className="text-xs">{t('profile.paymentDueReminders')}</span>
                  </div>
                  <Switch
                    checked={prefs.policyDueReminders}
                    disabled={prefSaving === "policyDueReminders"}
                    onCheckedChange={(v) => handlePrefToggle("policyDueReminders", v)}
                  />
                </div>
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-start gap-2 pr-2">
                    <CreditCard className="w-3.5 h-3.5 text-muted-foreground mt-0.5 shrink-0" />
                    <span className="text-xs">{t('profile.subscriptionReminders')}</span>
                  </div>
                  <Switch
                    checked={prefs.subscriptionReminders}
                    disabled={prefSaving === "subscriptionReminders"}
                    onCheckedChange={(v) => handlePrefToggle("subscriptionReminders", v)}
                  />
                </div>
                <Link to="/notification-preferences" className="text-xs text-primary hover:underline flex items-center gap-1 mt-1">
                  {t('profile.allNotificationSettings')}{" "} <ChevronRight className="w-3 h-3" />
                </Link>
              </div>

              {/* Permissions — admins/superadmins only */}
              {user.role !== "user" && grantedPermissions.length > 0 && (
                <div className="bg-card border border-border rounded-xl p-4">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5 text-primary" /> {" "}{t('common.permissions')}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {grantedPermissions.map((p) => (
                      <Badge key={p} variant="secondary" className="text-[10px] font-normal">{p}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* ══ Main content ══ */}
            <div className="space-y-4">

              <div className="bg-card border border-border rounded-xl p-4 relative">
                <div className="absolute top-1 right-1">
                  {!isEditing ? (
                    <Button size="icon" variant={"ghost"} onClick={() => setIsEditing(true)}>
                      <Edit className="w-3.5 h-3.5 mr-1.5" />
                    </Button>
                  ) : (
                    <>
                      <Button size="sm" onClick={handleSave} disabled={saving} className="mr-2">
                        <Save className="w-3.5 h-3.5 mr-1.5" />
                        {saving ? "…" : ""}
                      </Button>
                      <Button size="sm" variant="outline" onClick={handleCancel}>
                        <X className="w-3.5 h-3.5 mr-1.5" />
                      </Button>
                    </>
                  )}
                </div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-1.5">
                  <UserCircle2 className="w-3.5 h-3.5 text-primary" /> {" "}{t('profile.profileInformation2')}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">
                      <Trans i18nKey="profile.nameCannotChange" components={{ span: <span className="text-muted-foreground/60" /> }} /></Label>
                    <Input value={form.name} disabled
                      className="bg-muted text-muted-foreground text-sm h-9" />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">{t('profile.mobileNumber')}</Label>
                    <Input name="mobileNumber" value={form.mobileNumber}
                      onChange={handleChange} disabled={!isEditing}
                      autoComplete="off"
                      className={`text-sm h-9 ${!isEditing ? "bg-muted text-muted-foreground" : ""} ${mobileMask}`} />
                  </div>

                  <div className="space-y-1.5 md:col-span-2">
                    <div className="flex items-center gap-2">
                      <Label className="text-xs text-muted-foreground">{t('profile.emailAddress')}</Label>
                      {user.isEmailVerified
                        ? <span className="text-xs text-green-700 flex items-center gap-0.5">
                            <CheckCircle2 className="w-3 h-3" /> {" "}{t('common.verified')}
                          </span>
                        : <span className="text-xs text-red-600 flex items-center gap-0.5">
                            <XCircle className="w-3 h-3" /> {" "}{t('profile.notVerified')}
                          </span>}
                    </div>
                    <div className="relative">
                      <Input name="email" type="email" value={form.email}
                        onChange={handleChange} disabled={!isEditing}
                        className={`text-sm h-9 ${!isEditing ? "bg-muted text-muted-foreground" : ""} ${!user.isEmailVerified ? "pr-24" : ""} ${emailMask}`} />
                      {!user.isEmailVerified && (
                        <Button size="sm" variant="outline"
                          className="absolute right-1.5 top-1/2 -translate-y-1/2 h-7 text-xs bg-red-50 hover:bg-red-100 border-red-200 text-red-700 px-2"
                          onClick={() => navigate("/verify-email")}>
                          {t('profile.verifyNow')}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">{t('profile.fullAddress')}</Label>
                  <Textarea name="fullAddress" value={form.fullAddress}
                    onChange={handleChange} disabled={!isEditing} rows={3} autoComplete="off"
                    className={`text-sm resize-none ${!isEditing ? "bg-muted text-muted-foreground" : ""} ${addressMask}`} />
                </div>

                <div className="space-y-1.5 mt-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs text-muted-foreground">
                      <Trans i18nKey="profile.businessCardNoteOptional" components={{ span: <span className="text-muted-foreground/60" /> }} /></Label>
                    <span hidden={!isEditing} className={`text-[11px] ${noteCharCount >= MAX_NOTE_CHARS ? "text-red-600 font-medium" : "text-muted-foreground"}`}>
                      {noteCharCount}/{MAX_NOTE_CHARS} {" "}{t('profile.characters')}
                    </span>
                  </div>
                  <Textarea name="businessCardNote" value={form.businessCardNote}
                    onChange={handleNoteChange} disabled={!isEditing} rows={4}
                    maxLength={MAX_NOTE_CHARS}
                    placeholder={t('profile.aShortLineAboutYourself')}
                    className={`text-sm resize-none ${!isEditing ? "bg-muted text-muted-foreground" : ""}`} />
                </div>

                {isEditing && (
                  <p className="text-xs text-blue-700 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 mt-3">
                    {t('profile.nameAndEasyId')}
                  </p>
                )}
              </div>

              {/* Recent activity preview */}
              <div className="bg-card border border-border rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
                    <History className="w-3.5 h-3.5 text-primary" /> {" "}{t('profile.recentActivity')}
                  </p>
                  <Link to="/my-activity" className="text-xs text-primary hover:underline">
                    {activityTotal ? t('profile.viewAllCount', { total: activityTotal.total }) : t('profile.viewAll')}
                  </Link>
                </div>

                {activity.length === 0 ? (
                  <p className="text-xs text-muted-foreground py-4 text-center">{t('common.noActivityYet')}</p>
                ) : (
                  <div className="space-y-0">
                    {activity.map((log) => (
                      <div key={log._id} className="flex items-start gap-2.5 py-2 border-b border-border last:border-0">
                        <Badge className={`text-[10px] shrink-0 mt-0.5 ${ACTION_COLORS[log.action] || "bg-gray-100 text-gray-600 dark:bg-muted dark:text-muted-foreground"}`}>
                          {log.action.replace(/_/g, " ")}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {convertDateToIndianFormat(log.createdAt)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Referral summary — REFERRAL-PROGRAM only */}
              {REFERRAL_PROGRAM_ENABLED && referral && (
                <div className="bg-card border border-border rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
                      <Wallet2 className="w-3.5 h-3.5 text-primary" /> {" "}{t('profile.referralSummary')}
                    </p>
                    <Link to="/referral-program" className="text-xs text-blue-600 hover:underline">
                      {t('profile.viewFullDashboard')}
                    </Link>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    {[
                      { label: t('profile.directL1'),   val: referral.totalL1 ?? 0,               color: "text-blue-600"   },
                      { label: t('profile.indirectL2'), val: referral.totalL2 ?? 0,               color: "text-purple-600" },
                      { label: t('profile.totalEarned'),  val: <SensitiveValue field="walletAmount" value={referral.totalEarned ?? 0} render={(v) => `₹${v}`} />, color: "text-green-600"  },
                      { label: t('profile.wallet'),        val: <SensitiveValue field="walletAmount" value={referral.availableBalance ?? 0} render={(v) => `₹${v}`} />, color: "text-green-600"  },
                      { label: t('common.pending'),       val: <SensitiveValue field="walletAmount" value={referral.pendingEarnings ?? 0} render={(v) => `₹${v}`} />, color: "text-yellow-600" },
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
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Profile;