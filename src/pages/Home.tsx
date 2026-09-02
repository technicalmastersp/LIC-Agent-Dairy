import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button }     from "@/components/ui/button";
import { Badge }      from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Navigation     from "@/components/Navigation";
import Footer         from "@/components/Footer";
import OnboardingTour from "@/components/OnboardingTour";
import { getCurrentUser, setCurrentUser } from "@/utils/auth";
import { useLanguage } from "@/hooks/useLanguage";
import { dueThisMonth, dueNextMonth, getMonthlyTrend, getRecordsWithoutLastPayment } from "../../services/recordService";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { getProfile }  from "../../services/userService";
import {
  Plus, Eye, FileClock, ReceiptText,
  Crown, Wallet, User, Lock, BarChart3,
  ArrowRight, AlertTriangle, TrendingUp,
  FileText, Users,
} from "lucide-react";
import { getReferralDashboard } from "../../services/referralService";
import type { MonthlyTrendPoint, ReferralDashboardData } from "@/types/pages/Home.types";

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
};

const fmt = (d?: string) =>
  d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";
const Home = () => {
  const navigate      = useNavigate();
  const { t }         = useLanguage();
  const currentUser   = getCurrentUser();

  const [dueCount,        setDueCount]        = useState(0);
  const [upcomingDueCount, setUpcomingDueCount] = useState(0);
  const [missedCount,     setMissedCount]     = useState(0);
  const [trendData, setTrendData] = useState<MonthlyTrendPoint[]>([]);
  const [currentMonth, setCurrentMonth] = useState("");
  const [referralData, setReferralData] = useState<ReferralDashboardData | null>(null);
  const [loading,      setLoading]      = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [user, due, upcoming, missed, referral, trend] = await Promise.all([
          getProfile(),
          dueThisMonth(),
          dueNextMonth(),
          getRecordsWithoutLastPayment(),
          getReferralDashboard().catch(() => null),
          getMonthlyTrend(),
        ]);
        setTrendData(trend);
        setCurrentUser(user);
        setReferralData(referral);
        setDueCount(due.totalDue ?? 0);
        setUpcomingDueCount(upcoming.totalDue ?? 0);
        setMissedCount(missed.total ?? 0);
        setCurrentMonth(due.month ?? "");
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (!currentUser) return null;

  const isFirstTimeUser = !loading && (currentUser.totalRecords ?? 0) === 0;

  const sub        = currentUser.subscription;
  const daysLeft   = sub?.endDate
    ? Math.max(0, Math.ceil((new Date(sub.endDate).getTime() - Date.now()) / 86400000))
    : 0;
  const totalDays  = sub?.planId === "6months"  ? 180
                   : sub?.planId === "12months" ? 365
                   : sub?.planId === "24months" ? 730
                   : 30;
  const progressPct = Math.round((daysLeft / totalDays) * 100);
  const progressColor = progressPct > 50 ? "bg-blue-500"
                      : progressPct > 20 ? "bg-yellow-500"
                      : "bg-red-500";

  const stats = [
    {
      label: "Total records",
      val:   currentUser.totalRecords ?? 0,
      icon:  <FileText  className="w-4 h-4" />,
      color: "text-foreground",
      sub:   "All policy records",
      link:  "/view-records",
      bg: "bg-blue-50"
    },
    {
      label: "Due this month",
      val:   dueCount,
      icon:  <FileClock className="w-4 h-4" />,
      color: dueCount   > 0 ? "text-yellow-600" : "text-foreground",
      sub:   currentMonth || "Payments pending",
      link:  "/view-due-policies",
      bg: "bg-green-50"
    },
    {
      label: "Missed payments",
      val:   missedCount,
      icon:  <ReceiptText className="w-4 h-4" />,
      color: missedCount > 0 ? "text-red-600" : "text-foreground",
      sub:   "Last month unpaid",
      link:  "/view-missed-payments",
      bg: "bg-purple-50"
    },
    {
      label: "Upcoming due",
      val:   upcomingDueCount,
      icon:  <FileClock className="w-4 h-4" />,
      color: upcomingDueCount > 0 ? "text-emerald-600" : "text-foreground",
      sub:   "Due next month",
      link:  "/view-upcoming-due",
      bg: "bg-emerald-50",
      tourId: "tour-upcoming-due",
    },
    {
      label: "Referrals",
      val:   (referralData?.totalL1 ?? 0) + (referralData?.totalL2 ?? 0),
      icon:  <Users className="w-5 h-5" />,
      color: "text-green-600",
      sub:   `₹${referralData?.availableBalance ?? 0} in wallet`,
      link:  "/referral-program",
      bg: "bg-amber-50"
    },
  ];

  const actions = [
    {
      title: "Add record",
      icon:  <Plus className="w-4 h-4" />,
      desc:  "Create a new policy record with full details — holder info, nominee, bank, and policy terms.",
      label: "Add new record",
      link:  "/add-record",
      badge: <Badge className="text-xs bg-blue-100 text-blue-700 border border-blue-200">New</Badge>,
      tourId: "tour-add-record",
    },
    {
      title: "All records",
      icon:  <Eye className="w-4 h-4" />,
      desc:  "Browse, search, and manage all your existing policy records. Edit or view full details.",
      label: "View all records",
      link:  "/view-records",
      badge: <Badge variant="secondary" className="text-xs">{currentUser.totalRecords ?? 0} total</Badge>,
      tourId: "tour-view-records",
    },
    {
      title: "Due this month",
      icon:  <FileClock className="w-4 h-4" />,
      desc:  "See all policies with payment due this month. Track mode of payment and last payment date.",
      label: "View due policies",
      link:  "/view-due-policies",
      badge: dueCount > 0
        ? <Badge className="text-xs bg-yellow-100 text-yellow-700 border border-yellow-200">{dueCount} due</Badge>
        : null,
      tourId: "tour-due-this-month",
    },
    {
      title: "Missed payments",
      icon:  <ReceiptText className="w-4 h-4" />,
      desc:  "Policies that missed last month's payment. Take action before lapse notices are issued.",
      label: "View missed payments",
      link:  "/view-missed-payments",
      badge: missedCount > 0
        ? <Badge variant="destructive" className="text-xs">{missedCount} missed</Badge>
        : null,
      tourId: "tour-missed-payments",
    },
  ];

  const quickLinks = [
    { label: "Profile",         icon: <User       className="w-5 h-5" />, link: "/profile"          },
    { label: "Change password", icon: <Lock       className="w-5 h-5" />, link: "/change-password"   },
    { label: "Our plans",       icon: <BarChart3  className="w-5 h-5" />, link: "/our-plans"         },
  ];

  return (
    <div className="min-h-screen bg-muted/30 flex flex-col">
      <OnboardingTour />
      <Navigation />

      <main className="container mx-auto px-4 py-8 flex-1">
        <div className="max-w-5xl mx-auto space-y-5">

          {/* ── Greeting ── */}
          <div>
            <h1 className="text-2xl font-medium text-form-header">
              {getGreeting()}, {currentUser.name}
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {new Date().toLocaleDateString("en-IN", { weekday:"long", day:"2-digit", month:"long", year:"numeric" })}
              {sub && ` · ${sub.planType} plan · ${daysLeft} days left`}
            </p>
          </div>

          {/* ── First-time welcome banner ── */}
          {isFirstTimeUser && (
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 bg-gradient-to-r from-blue-50 to-form-header/5 border border-blue-200 rounded-lg px-5 py-5">
              <div className="flex-1">
                <p className="text-base font-medium text-form-header">Welcome to your policy diary 👋</p>
                <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                  You haven't added any policy records yet. Add your first one to start tracking due dates,
                  payments, and everything else on this dashboard.
                </p>
              </div>
              <Link to="/add-record" className="shrink-0">
                <Button data-tour="tour-add-record-banner">
                  <Plus className="w-4 h-4 mr-2" />
                  Add your first record
                </Button>
              </Link>
            </div>
          )}

          {/* ── Alert banner ── */}
          {!isFirstTimeUser && missedCount > 0 && (
            <div className="flex items-start gap-3 bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-3">
              <AlertTriangle className="w-4 h-4 text-yellow-600 shrink-0 mt-0.5" />
              <p className="text-sm text-yellow-800">
                <strong>{missedCount} {missedCount === 1 ? "policy" : "policies"}</strong> missed last month's payment.
                Review them before lapse notices are issued.{" "}
                <Link to="/view-missed-payments" className="underline font-medium">View now →</Link>
              </p>
            </div>
          )}

          {/* ── Stat cards ── */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {stats.map(({ label, val, icon, color, sub, link, bg, tourId }) => (
              <Card key={label}
                data-tour={tourId}
                className={`cursor-pointer ${bg} hover:border-blue-300 transition-colors`}
                onClick={() => navigate(link)}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-muted-foreground mb-2 text-xs">
                    {icon} {label}
                  </div>
                  <p className={`text-3xl font-medium ${color}`}>{val}</p>
                  <p className="text-xs text-muted-foreground mt-1">{sub}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-xs uppercase tracking-wide text-muted-foreground">Last 6 months</CardTitle>
            </CardHeader>
            <CardContent>
              {isFirstTimeUser ? (
                <div className="flex flex-col items-center justify-center text-center py-14 px-4">
                  <TrendingUp className="w-8 h-8 text-muted-foreground/50 mb-3" />
                  <p className="text-sm text-muted-foreground">
                    Your activity trend will show up here once you've added a few records.
                  </p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={260}>
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="recordsAdded" stroke="#2563eb" name="Records added" strokeWidth={2} />
                    <Line type="monotone" dataKey="duePolicies" stroke="#f97316" name="Policies due" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* ── Action cards ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {actions.map(({ title, icon, desc, label, link, badge, tourId }) => (
              <Card key={title} data-tour={tourId} className="hover:border-blue-300 transition-colors">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 font-medium text-sm">
                      {icon} {title}
                    </div>
                    {badge}
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed mb-4">{desc}</p>
                  <Link to={link}>
                    <Button size="sm" variant="outline" className="w-full text-xs">
                      {label} <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* ── Subscription + Referral ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">

            {/* Subscription */}
            <Card data-tour="tour-your-plan">
              <CardHeader className="pb-3">
                <CardTitle className="text-xs uppercase tracking-wide text-muted-foreground flex items-center gap-2">
                  <Crown className="w-4 h-4" /> Your plan
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-0 pt-0">
                {[
                  { label: "Plan",    val: `${sub?.planType} · ${sub?.duration}` },
                  { label: "Status",  val: sub?.status === "active"
                      ? <Badge className="text-xs bg-green-100 text-green-700 border border-green-200">Active</Badge>
                      : <Badge variant="destructive" className="text-xs">Expired</Badge> },
                  { label: "Expires", val: fmt(sub?.endDate) },
                ].map(({ label, val }) => (
                  <div key={label} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                    <span className="text-xs text-muted-foreground">{label}</span>
                    <span className="text-xs font-medium">{val}</span>
                  </div>
                ))}
                {/* Progress bar */}
                <div className="pt-3">
                  <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                    <span>Time remaining</span>
                    <span>{daysLeft} / {totalDays} days</span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all ${progressColor}`}
                      style={{ width: `${progressPct}%` }} />
                  </div>
                </div>
                <div className="pt-3">
                  <Link to="/our-plans" className="text-xs font-medium text-blue-600 hover:underline">
                    Upgrade plan →
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Referral wallet */}
            <Card data-tour="tour-referral-wallet">
              <CardHeader className="pb-3">
                <CardTitle className="text-xs uppercase tracking-wide text-muted-foreground flex items-center gap-2">
                  <Wallet className="w-4 h-4" /> Referral wallet
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-0 pt-0">
                {[
                  { label: "Available balance", val: <span className="text-green-600 font-medium text-xs">₹{referralData?.availableBalance ?? 0}</span> },
                  { label: "Pending rewards",   val: <span className="text-yellow-600 font-medium text-xs">₹{referralData?.pendingEarnings ?? 0}</span> },
                  { label: "Total earned",      val: `₹${referralData?.totalEarned ?? 0}` },
                  { label: "Direct referrals",  val: referralData?.totalL1 ?? 0 },
                  { label: "Level 2 referrals", val: referralData?.totalL2 ?? 0 },
                ].map(({ label, val }) => (
                  <div key={label} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                    <span className="text-xs text-muted-foreground">{label}</span>
                    <span className="text-xs font-medium">{val}</span>
                  </div>
                ))}
                <div className="pt-3 flex gap-4">
                  <Link to="/referral-program" className="text-xs font-medium text-blue-600 hover:underline">
                    View referrals →
                  </Link>
                  {(referralData?.availableBalance ?? 0) >= 100 && (
                    <>
                      <span className="text-muted-foreground text-xs">·</span>
                      <Link to="/referral-program" className="text-xs font-medium text-green-600 hover:underline">
                        Withdraw →
                      </Link>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* ── Quick links ── */}
          <div className="grid grid-cols-3 gap-3">
            {quickLinks.map(({ label, icon, link }) => (
              <Card key={label}
                className="cursor-pointer hover:border-blue-300 transition-colors"
                onClick={() => navigate(link)}>
                <CardContent className="p-4 flex flex-col items-center gap-2 text-center">
                  <div className="text-muted-foreground">{icon}</div>
                  <p className="text-xs text-muted-foreground">{label}</p>
                </CardContent>
              </Card>
            ))}
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Home;