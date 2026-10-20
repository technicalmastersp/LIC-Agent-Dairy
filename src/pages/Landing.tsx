import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState, type ReactNode, useMemo } from "react";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/hooks/useLanguage";
import Navigation     from "@/components/Navigation";
import { isAuthenticated } from "@/utils/auth";
import {
  ShieldCheck, FileText, Search, Wallet, BellRing, Smartphone,
  DatabaseBackup, Lock, Timer, CheckCircle2, LifeBuoy,
  Sparkles, ArrowRight, UserPlus, LogIn, ClipboardList, ListChecks,
  TrendingUp, CircleDot, Bell, Languages, IdCard,
  Upload, FileDown, Layers, EyeOff, Phone, Calculator, FileSpreadsheet,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import siteConfig from "@/config/siteConfig";
import { signupPathForPlan } from "@/config/plans";
import { HOME_STATS, SITE_STATS } from "@/config/siteStats";
import { REFERRAL_PROGRAM_ENABLED } from "@/config/featureFlags";
import SEO from "@/components/SEO";
import BusinessCard, { BUSINESS_CARD_TEMPLATES } from "@/components/BusinessCard";
import type { BusinessCardTheme } from "@/types/components/BusinessCard.types";
import type { TFunction } from "@/types/i18n.types";

const buildPlans = (t: TFunction) => [
  { id: "1month-free", name: t('landing.n1MonthFree'), price: t('landing.free'), tag: t('landing.tryItOut'), color: "bg-gray-50 border-gray-200 dark:bg-muted dark:border-border", accent: "text-gray-600 dark:text-muted-foreground" },
  // The paid 1-month "Starter" plan (backend id "1month") — it was missing from this section.
  { id: "1month", name: "1 Month", price: t('landing.payMonthToMonth'), tag: "", color: "bg-emerald-50 border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-900", accent: "text-emerald-700 dark:text-emerald-400" },
  { id: "3months", name: "3 Months", price: t('landing.forStartingAgents'), tag: "", color: "bg-violet-50 border-violet-200 dark:bg-violet-950/40 dark:border-violet-900", accent: "text-violet-700 dark:text-violet-400" },
  { id: "6months", name: "6 Months", price: t('landing.mostPopular'), tag: t('landing.recommended'), color: "bg-blue-50 border-blue-300 ring-2 ring-blue-200 dark:bg-blue-950/40 dark:border-blue-800 dark:ring-blue-900", accent: "text-blue-700 dark:text-blue-400" },
  { id: "12months", name: "12 Months", price: t('landing.bestValue'), tag: "", color: "bg-amber-50 border-amber-200 dark:bg-amber-950/40 dark:border-amber-900", accent: "text-amber-700 dark:text-amber-400" },
];

// Hero copy — the three headline promises, then every major capability as a compact chip.
// Every chip maps to a feature that exists in the app today (see the FEATURES grid below).
const buildHeroPoints = (t: TFunction) => [
  t('landing.allYourClientAndPolicy'),
  t('landing.stayAheadOfRenewals'),
  t('landing.dailyBackupsToHelpProtect'),
];

const buildHeroChips = (t: TFunction) => [
  { icon: Upload, text: t('landing.importFromExcelCsv') },
  { icon: FileDown, text: t('landing.exportToPdfCsv') },
  { icon: Layers, text: t('landing.allPolicyTypesCustom') },
  { icon: BellRing, text: t('landing.bellPushEmailReminders') },
  { icon: Phone, text: t('landing.callWhatsappSms') },
  { icon: EyeOff, text: t('landing.encryptedHideMode') },
  { icon: Languages, text: t('landing.englishHindi') },
  { icon: Calculator, text: `${SITE_STATS.freeTools} free calculators` },
];

// ── FEATURES — "What you get" tiles ─────────────────────────────────────────
// Each tile = a mini visual + icon + title + one-line description, all verified against the app.
// Grid rule: the list length must be a multiple of 3 (lg = 3 columns). 9 tiles today. If the
// referral program is switched on, its tile is added and the list is trimmed back to 9 — the
// LAST tiles drop first, so keep them in priority order (most important first).
const buildFeatures = (t: TFunction): { key: string; icon: LucideIcon; title: string; description: string; visual: ReactNode }[] => [
  {
    key: "records", icon: FileText, title: t('landing.completePolicyRecords'),
    description: t('landing.policyholderDetailsNomineeInfo'),
    visual: (
      <div className="flex items-center gap-3 mb-4 bg-blue-50 dark:bg-blue-950/40 rounded-xl p-3">
        <div className="w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-700 dark:text-blue-300 text-xs font-semibold shrink-0">RS</div>
        <div className="space-y-1 flex-1">
          <div className="h-2 w-20 rounded bg-blue-200/70 dark:bg-blue-800/50" />
          <div className="h-1.5 w-14 rounded bg-blue-200/40 dark:bg-blue-800/30" />
        </div>
      </div>
    ),
  },
  {
    key: "due", icon: BellRing, title: t('landing.dueAndLapseTracking'),
    description: t('landing.seeWhatSDue'),
    visual: (
      <div className="mb-4 bg-amber-50 dark:bg-amber-950/40 rounded-xl p-3 space-y-1.5">
        {[t('landing.due3Aug'), t('landing.due9Aug')].map((d) => (
          <div key={d} className="flex items-center justify-between bg-white dark:bg-background rounded-md px-2.5 py-1.5">
            <span className="text-[10px] text-form-header font-medium">{d}</span>
            <BellRing className="w-3 h-3 text-amber-500" />
          </div>
        ))}
      </div>
    ),
  },
  // REFERRAL-PROGRAM — only while the program is enabled
  ...(REFERRAL_PROGRAM_ENABLED ? [{
    key: "referral", icon: Wallet, title: t('landing.referralWallet'),
    description: t('landing.earnAndTrackReferralRewards'),
    visual: (
      <div className="mb-4 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl p-4">
        <p className="text-[10px] text-emerald-700 dark:text-emerald-400 mb-1">{t('landing.availableBalance')}</p>
        <p className="text-lg font-bold text-emerald-700 dark:text-emerald-400">₹4,250</p>
      </div>
    ),
  }] : []),
  {
    key: "search", icon: Search, title: t('landing.instantSearchSort'),
    description: t('landing.findAnyRecordByName'),
    visual: (
      <div className="mb-4 bg-violet-50 dark:bg-violet-950/40 rounded-xl p-3">
        <div className="flex items-center gap-2 bg-white dark:bg-background rounded-md px-2.5 py-1.5 mb-2">
          <Search className="w-3 h-3 text-muted-foreground" />
          <span className="text-[10px] text-muted-foreground">{t('landing.sharma')}</span>
        </div>
        <div className="h-1.5 w-3/4 rounded bg-violet-200/60 dark:bg-violet-800/40 mb-1.5" />
        <div className="h-1.5 w-1/2 rounded bg-violet-200/40 dark:bg-violet-800/25" />
      </div>
    ),
  },
  {
    key: "import-export", icon: FileSpreadsheet, title: t('landing.importExport'),
    description: t('landing.bringYourBookInFrom'),
    visual: (
      <div className="mb-4 bg-teal-50 dark:bg-teal-950/40 rounded-xl p-3 flex items-center justify-center gap-2">
        {[".xlsx", ".csv"].map((tk) => (
          <span key={tk} className="text-[11px] font-medium bg-white dark:bg-background text-form-header rounded-md px-2.5 py-1 shadow-sm">{tk}</span>
        ))}
        <ArrowRight className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
        <span className="text-[11px] font-medium bg-teal-200/60 dark:bg-teal-800/40 text-teal-800 dark:text-teal-300 rounded-md px-2.5 py-1">PDF</span>
      </div>
    ),
  },
  {
    key: "types", icon: Layers, title: t('landing.everyKindOfPolicy'),
    description: t('landing.lifeTermHealthFamilyHealth'),
    visual: (
      <div className="mb-4 bg-indigo-50 dark:bg-indigo-950/40 rounded-xl p-3 flex flex-wrap gap-1.5">
        {[t('landing.life'), t('landing.health'), t('landing.vehicle'), t('landing.travel'), "+ Custom"].map((tk) => (
          <span key={tk} className="text-[10px] font-medium bg-white dark:bg-background text-form-header rounded-full px-2.5 py-1 shadow-sm">{tk}</span>
        ))}
      </div>
    ),
  },
  {
    key: "reminders", icon: Bell, title: t('landing.remindersThatReach'),
    description: t('landing.inAppBellPhone'),
    visual: (
      <div className="mb-4 bg-orange-50 dark:bg-orange-950/40 rounded-xl p-3 space-y-1.5">
        <div className="flex items-center gap-2 bg-white dark:bg-background rounded-md px-2.5 py-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-orange-500 shrink-0" />
          <span className="text-[10px] text-form-header font-medium">{t('landing.n3PoliciesDueIn3')}</span>
        </div>
        <div className="flex gap-1.5">
          {["In-app", t('landing.push'), t('common.email2')].map((c) => (
            <span key={c} className="text-[9px] font-medium bg-orange-200/60 dark:bg-orange-800/40 text-orange-800 dark:text-orange-300 rounded-full px-2 py-0.5">{c}</span>
          ))}
        </div>
      </div>
    ),
  },
  {
    key: "privacy", icon: Lock, title: t('landing.privateByDesign'),
    description: t('landing.aadhaarPanAndBankDetails'),
    visual: (
      <div className="mb-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl p-3 flex items-center justify-between">
        <div>
          <p className="text-[9px] text-muted-foreground mb-0.5">{t('landing.aadhaar')}</p>
          <p className="text-xs font-mono text-form-header tracking-wider">{t('landing.xxxxXxxx2291')}</p>
        </div>
        <span className="w-7 h-7 rounded-full bg-white dark:bg-background shadow-sm flex items-center justify-center">
          <EyeOff className="w-3.5 h-3.5 text-slate-500" />
        </span>
      </div>
    ),
  },
  {
    key: "language", icon: Languages, title: t('landing.englishHindi'),
    description: t('landing.useThePlatform'),
    visual: (
      <div className="mb-4 bg-rose-50 dark:bg-rose-950/40 rounded-xl p-3 flex items-center gap-2">
        <span className="text-[11px] font-medium bg-white dark:bg-background text-form-header rounded-full px-3 py-1 shadow-sm">{t('landing.english')}</span>
        <span className="text-[11px] font-medium bg-rose-200/60 dark:bg-rose-800/40 text-rose-700 dark:text-rose-300 rounded-full px-3 py-1">हिंदी</span>
      </div>
    ),
  },
  {
    key: "mobile", icon: Smartphone, title: t('landing.worksOnYourPhone'),
    description: t('landing.updateARecordBetweenClient'),
    visual: (
      <div className="mb-4 bg-cyan-50 dark:bg-cyan-950/40 rounded-xl p-3 flex justify-center">
        <div className="w-14 h-24 rounded-xl border-2 border-cyan-300 dark:border-cyan-800 bg-white dark:bg-background p-1.5 flex flex-col gap-1">
          <div className="h-1.5 w-6 mx-auto rounded-full bg-cyan-200 dark:bg-cyan-800" />
          <div className="flex-1 rounded-md bg-cyan-50 dark:bg-cyan-950/40 mt-1" />
        </div>
      </div>
    ),
  },
].slice(0, 9);

const Landing = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const HERO_CHIPS = useMemo(() => buildHeroChips(t), [t]);
  const FEATURES = useMemo(() => buildFeatures(t), [t]);
  const plans = useMemo(() => buildPlans(t), [t]);
  const HERO_POINTS = useMemo(() => buildHeroPoints(t), [t]);
  const [demoTheme, setDemoTheme] = useState<BusinessCardTheme>("classic");

  useEffect(() => {
    if (isAuthenticated()) {
      navigate("/home");
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEO
        title={t('landing.insurancePolicyRecordManagement')}
        description={t('landing.manageEveryPolicyAndNever')}
        path="/"
        jsonLd={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": t('landing.organization'),
              "@id": `${siteConfig.productionUrl}/#organization`,
              name: siteConfig.companyName,
              url: siteConfig.productionUrl,
              logo: `${siteConfig.productionUrl}${siteConfig.logo_social}`,
              email: siteConfig.supportEmail,
              contactPoint: [{ "@type": "ContactPoint", contactType: "customer support", email: siteConfig.supportEmail }],
            },
            {
              "@type": "WebSite",
              "@id": `${siteConfig.productionUrl}/#website`,
              name: siteConfig.companyName,
              url: siteConfig.productionUrl,
              inLanguage: ["en", "hi"],
              publisher: { "@id": `${siteConfig.productionUrl}/#organization` },
            },
          ],
        }}
      />

      <Navigation />

      <main className="flex-1">

        {/* ══════════ HERO — light bg, dashboard mockup (not fanned cards) ══════════ */}
        <section className="relative bg-gradient-to-b from-primary/5 via-background to-background overflow-hidden">
          <div className="absolute top-20 -left-32 w-72 h-72 rounded-full bg-primary/5 blur-3xl" />

          <div className="container mx-auto px-4 relative">
            <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center pt-8 pb-12 md:py-16">

              {/* Left: message — matches the approved reference (pill, headline, intro, 3 checks), then the full feature set */}
              <div className="space-y-5">
                <span className="inline-flex items-center text-xs font-semibold uppercase tracking-wide bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300 px-3 py-1 rounded-full">
                  {t('landing.freeForYourFirstMonth')}
                </span>
                <h1 className="text-3xl sm:text-4xl lg:text-[2.6rem] font-bold leading-[1.15] tracking-tight text-form-header">
                  {t('landing.manageEveryPolicyNeverMiss')}
                </h1>
                <p className="text-base text-muted-foreground leading-relaxed max-w-xl">
                  {t('landing.theSmarterWayForInsurance')}
                </p>

                <ul className="space-y-2">
                  {HERO_POINTS.map((point) => (
                    <li key={point} className="flex items-center gap-3 text-form-header">
                      <CheckCircle2 className="w-5 h-5 text-emerald-700 dark:text-emerald-400 shrink-0" aria-hidden="true" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>

                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-primary mb-2">{t('landing.everythingInside')}</p>
                  <ul className="flex flex-wrap gap-2">
                    {HERO_CHIPS.map(({ icon: Icon, text }) => (
                      <li key={text} className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background/80 px-3 py-1.5 text-xs sm:text-[13px] text-form-header">
                        <Icon className="w-3.5 h-3.5 text-primary shrink-0" aria-hidden="true" />
                        {text}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex flex-wrap gap-3 pt-1">
                  <Link to="/signup">
                    <Button size="lg" className="bg-primary hover:bg-primary-light font-medium">
                      <UserPlus className="w-4 h-4 mr-2" />
                      {t('landing.createFreeAccount')}
                    </Button>
                  </Link>
                  <Link to="/login">
                    <Button size="lg" variant="outline" className="bg-transparent border-primary/30 text-form-header hover:bg-primary/5">
                      <LogIn className="w-4 h-4 mr-2" />
                      {t('landing.iAlreadyHaveAnAccount')}
                    </Button>
                  </Link>
                </div>
                <p className="text-xs text-muted-foreground">{t('landing.noCreditCardRequired')}</p>
              </div>

              {/* Right: single contained dashboard mockup — badges anchored to its own box, can't drift into text */}
              <div className="relative mx-auto w-full max-w-md py-6">
                <div className="relative rounded-2xl border border-border bg-card shadow-2xl overflow-hidden">
                  <div className="overflow-hidden rounded-2xl">
                    {/* window chrome */}
                    <div className="flex items-center gap-1.5 px-4 py-3 border-b border-border bg-muted/40">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-300" />
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-300" />
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-300" />
                      <span className="ml-3 text-xs text-muted-foreground font-medium">{t('landing.policyDashboard')}</span>
                    </div>

                    <div className="p-5 space-y-4">
                      {/* mini stat row */}
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { label: t('landing.records'), val: "128", bg: "bg-blue-50 dark:bg-blue-950/40", color: "text-blue-700 dark:text-blue-400" },
                          { label: t('landing.due'), val: "12", bg: "bg-amber-50 dark:bg-amber-950/40", color: "text-amber-700 dark:text-amber-400" },
                          { label: t('landing.backedUp'), val: t('landing.today'), bg: "bg-emerald-50 dark:bg-emerald-950/40", color: "text-emerald-700 dark:text-emerald-400" },
                        ].map(({ label, val, bg, color }) => (
                          <div key={label} className={`${bg} rounded-lg p-2.5 text-center`}>
                            <p className={`text-sm font-semibold ${color}`}>{val}</p>
                            <p className="text-[10px] text-muted-foreground mt-0.5">{label}</p>
                          </div>
                        ))}
                      </div>

                      {/* mini table */}
                      <div className="rounded-lg border border-border overflow-hidden">
                        <div className="grid grid-cols-3 bg-muted/50 text-[10px] font-medium text-muted-foreground uppercase px-3 py-2">
                          <span>{t('common.name')}</span><span>{t('landing.policy')}</span><span className="text-right">{t('common.status')}</span>
                        </div>
                        {[
                          { name: "S. Sharma", policy: "XXX-2291", status: "Active", color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400" },
                          { name: "S. Verma", policy: "XXXX-8823", status: "Due", color: "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400" },
                          { name: "P. Kumar", policy: "XXXXX-4410", status: "Active", color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400" },
                        ].map((row) => (
                          <div key={row.name} className="grid grid-cols-3 items-center px-3 py-2 text-xs border-t border-border">
                            <span className="text-form-header font-medium">{row.name}</span>
                            <span className="text-muted-foreground font-mono text-[11px]">{row.policy}</span>
                            <span className="flex justify-end">
                              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${row.color}`}>{row.status}</span>
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* badge anchored to card's own top-right corner — contained, can't overlap text column */}
                  <div className="absolute -top-3 -right-3 bg-card shadow-lg border border-border rounded-full pl-1.5 pr-5 pt-3 pb-1.5 flex items-center gap-1.5 z-10">
                    <span className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950/40 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                    </span>
                    <span className="text-[11px] font-medium text-form-header">{t('landing.backedUp2mAgo')}</span>
                  </div>
                </div>

                {/* second badge sits below the card in normal flow, not absolutely positioned — zero overlap risk */}
                <div className="mt-4 mx-auto w-fit bg-card shadow-lg border border-border rounded-xl px-4 py-2.5 flex items-center gap-2.5">
                  <span className="w-7 h-7 rounded-lg bg-amber-100 dark:bg-amber-950/40 flex items-center justify-center shrink-0">
                    <Bell className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  </span>
                  <span className="text-xs text-form-header">
                    <span className="font-semibold">{t('landing.n3Payments')}</span>
                    <span className="text-muted-foreground"> {" "}{t('landing.dueThisWeek')}</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ══════════ TRUST STRIP — light pill row, not a dark bar (differs from About) ══════════ */}
        <section className="border-y border-border bg-muted/30 py-6">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-center gap-3">
              {[
                { icon: DatabaseBackup, text: t('landing.dailyBackups') },
                { icon: Timer, text: t('landing.supportInFewHrs') },
                { icon: CheckCircle2, text: t('landing.zeroPendingOvernight') },
                { icon: ShieldCheck, text: t('landing.anyPolicyType') },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-2 bg-background border border-border rounded-full px-4 py-2 text-sm text-form-header shadow-sm">
                  <Icon className="w-4 h-4 text-primary" />
                  {text}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════ STATS BAND — numbers come from src/config/siteStats.ts (single source of truth) ══════════ */}
        <section aria-label={t('landing.policyNiketanInNumbers')} className="bg-background py-12">
          <div className="container mx-auto px-4">
            <dl className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-y-8 md:gap-y-0 md:divide-x md:divide-border text-center">
              {HOME_STATS.map(({ key, value, labelKey, valueKey, valueParams }) => (
                <div key={key} className="px-4" data-testid={`home-stat-${key}`}>
                  <dt className="sr-only">{t(labelKey)}</dt>
                  <dd className="text-3xl md:text-4xl font-bold text-primary tabular-nums">{valueKey ? t(valueKey, valueParams) : value}</dd>
                  <p className="mt-1 text-sm text-muted-foreground" aria-hidden="true">{t(labelKey)}</p>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* ══════════ HOW IT WORKS — connected stepper, not giant background numbers ══════════ */}
        <section id="how-it-works" className="bg-background py-16 md:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="text-center max-w-xl mx-auto mb-16">
                <p className="text-xs font-medium uppercase tracking-wider text-primary mb-2">{t('landing.gettingStarted')}</p>
                <h2 className="text-3xl font-bold text-form-header">{t('landing.upAndRunningInThree')}</h2>
              </div>

              <div className="relative grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-6">
                {/* connecting line, precisely aligned to circle centers, hidden on mobile */}
                <div className="hidden md:block absolute top-7 left-[16.6%] right-[16.6%] h-0.5 bg-border" />

                {[
                  { icon: UserPlus, title: t('landing.createYourAccount'), description: t('landing.signUpInMinutesNo') },
                  { icon: ClipboardList, title: t('landing.addYourPolicies'), description: t('landing.bringInYourExistingBook') },
                  { icon: ListChecks, title: t('landing.neverMissADueDate'), description: t('landing.theDashboardFlagsWhatS') },
                ].map(({ icon: Icon, title, description }, i) => (
                  // <div key={title} className="relative text-center md:text-left">
                  <div key={title} className="relative text-center md:text-center md:flex md:flex-col md:items-center">
                    <div className="relative z-10 w-14 h-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto md:mx-0 mb-4 shadow-sm">
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="font-semibold text-form-header mb-2">{title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ══════════ FEATURES — bento grid, each card with its own mini mockup ══════════ */}
        <section id="features" className="bg-muted/30 py-16 md:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="text-center max-w-xl mx-auto mb-14">
                <p className="text-xs font-medium uppercase tracking-wider text-primary mb-2">{t('landing.whatYouGet')}</p>
                <h2 className="text-3xl font-bold text-form-header">{t('landing.everythingToRunYourPolicy')}</h2>
              </div>

              {/* Always a multiple of 3 so the lg grid has no orphan row (see FEATURES). */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {FEATURES.map(({ key, icon: Icon, title, description, visual }) => (
                  <div key={key} className="bg-background rounded-2xl border border-border p-6 hover:shadow-md hover:border-primary/30 transition-all">
                    {visual}
                    <Icon className="w-5 h-5 text-primary mb-2" />
                    <h3 className="font-semibold text-form-header mb-1.5">{title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ══════════ BUSINESS CARD — interactive prototype for visitors ══════════ */}
        <section className="bg-background py-16 md:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

              <div className="space-y-5 order-2 lg:order-1">
                <Badge className="bg-primary/10 text-primary border border-primary/20 w-fit">
                  <Sparkles className="w-3 h-3 mr-1" /> {" "}{t('landing.getFreeBusinessCard')}
                </Badge>
                <h2 className="text-3xl font-bold text-form-header leading-tight">
                  {t('landing.yourOwnDigitalBusinessCard')}
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  {t('landing.onceYourProfileIs100', { companyName: siteConfig.companyName })}
                </p>
                <div className="space-y-3">
                  {[
                    t('landing.n4ProfessionallyDesignedThemes'),
                    t('landing.yourNameMobileNumberEmail'),
                    t('landing.unlocksTheMomentYourProfile'),
                    t('landing.downloadAsAHighResolution'),
                    t('landing.addYourImageCustomNote'),
                  ].map((point) => (
                    <div key={point} className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                      <span className="text-sm text-form-header">{point}</span>
                    </div>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                  {BUSINESS_CARD_TEMPLATES.map((tpl) => (
                    <button
                      key={tpl.id}
                      onClick={() => setDemoTheme(tpl.id)}
                      className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                        demoTheme === tpl.id
                          ? "border-primary ring-1 ring-primary bg-primary/5"
                          : "border-border hover:border-primary/40"
                      }`}
                    >
                      <span className="w-4 h-4 rounded-full border border-border shrink-0" style={{ background: tpl.swatch }} />
                      {t(tpl.label)}
                    </button>
                  ))}
                </div>
                <Button size="lg" className="mt-2" onClick={() => navigate("/signup")}>
                  <UserPlus className="w-4 h-4 mr-2" /> {" "}{t('landing.getStartedFree')}
                </Button>
              </div>

              <div className="order-1 lg:order-2">
                <BusinessCard
                  name="Rahul Sharma"
                  roleLabel={t('landing.policyAgent')}
                  mobileNumber="+91 98765 43210"
                  email="rahul.sharma@example.com"
                  easyId="PN-10482"
                  theme={demoTheme}
                  className="w-full max-w-lg mx-auto"
                />
                <p className="text-xs text-muted-foreground text-center mt-3 flex items-center justify-center gap-1">
                  <IdCard className="w-3.5 h-3.5" /> {" "}{t('landing.livePrototypeSampleDataShown')}
                </p>
              </div>

            </div>
          </div>
        </section>

        {/* ══════════ SECURITY & SUPPORT — light two-column (differs from About's dark panel) ══════════ */}
        <section className="bg-background py-16 md:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

              <div className="space-y-6 order-2 lg:order-1">
                {[
                  { icon: DatabaseBackup, title: t('landing.backedUpDaily'), description: t('landing.everyRecordIsBackedUp') },
                  { icon: Lock, title: t('landing.lockedDownAccess'), description: t('landing.sensitiveFieldsLikeAadhaarPan') },
                  { icon: LifeBuoy, title: t('landing.fastHumanSupport'), description: t('landing.realAnswersFromATeam') },
                ].map(({ icon: Icon, title, description }) => (
                  <div key={title} className="flex gap-4">
                    <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-form-header mb-1">{title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="order-1 lg:order-2 space-y-4">
                <p className="text-xs font-medium uppercase tracking-wider text-primary">{t('landing.whyAgentsTrustUs')}</p>
                <h2 className="text-3xl font-bold text-form-header leading-tight">
                  {t('landing.secureBackedUpAndAlways')}
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  {t('landing.yourClientDataIsSensitive')}
                </p>
                <div className="rounded-2xl bg-primary/5 border border-primary/10 p-5 flex items-center gap-4">
                  <ShieldCheck className="w-8 h-8 text-primary shrink-0" />
                  <p className="text-sm text-form-header font-medium">
                    {t('landing.aPlatformBuilt')}
                  </p>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ══════════ PLANS ══════════ */}
        <section id="plans" className="bg-muted/30 py-16 md:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="text-center max-w-xl mx-auto mb-14">
                <p className="text-xs font-medium uppercase tracking-wider text-primary mb-2">{t('landing.simplePricing')}</p>
                <h2 className="text-3xl font-bold text-form-header">{t('landing.startFreeStayAsLong')}</h2>
                <p className="text-muted-foreground mt-3">
                  {t('landing.everyPlanIncludesTheFull')}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
                {plans.map(({ id, name, price, tag, color, accent }) => (
                  <div key={id} className={`rounded-2xl border p-6 ${color} relative flex flex-col bg-background`}>
                    {tag && (
                      <Badge className="absolute -top-3 left-6 bg-primary text-primary-foreground text-xs">
                        {tag}
                      </Badge>
                    )}
                    <p className={`text-sm font-medium ${accent} mb-1`}>{name}</p>
                    <p className="text-form-header font-semibold text-lg mb-4">{price}</p>
                    <ul className="space-y-2 text-xs text-muted-foreground mb-6 flex-1">
                      <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> {" "}{t('landing.unlimitedPolicyRecords')}</li>
                      <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> {" "}{t('landing.dueLapseTracking')}</li>
                      <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> {" "}{t('landing.dailyBackups')}</li>
                    </ul>
                    {/* ?plan=<id> → the signup page opens with this plan already selected */}
                    <Link to={signupPathForPlan(id)}>
                      <Button variant="outline" size="sm" className="w-full bg-background">
                        {t('landing.choosePlan')}
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
              <p className="text-center text-xs text-muted-foreground mt-6">
                <Link to="/our-plans" className="text-primary hover:underline font-medium">{t('landing.seeFullPlanComparison')}</Link>
              </p>
            </div>
          </div>
        </section>

        {/* ══════════ FINAL CTA ══════════ */}
        <section className="bg-[linear-gradient(to_bottom,#0a5b76,#0e7ca1,#0a5b76)] text-primary-foreground py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center space-y-6">
              <TrendingUp className="w-10 h-10 mx-auto text-primary-foreground/90" />
              <h2 className="text-3xl md:text-4xl font-bold">{t('landing.bringOrderToYourPolicy')}</h2>
              <p className="text-primary-foreground/90 text-lg">
                {t('landing.freeForYourFirstMonth2')}
              </p>
              <div className="flex flex-wrap justify-center gap-3 pt-2">
                <Link to="/signup">
                  <Button size="lg" className="bg-white text-[hsl(195,85%,25%)] hover:bg-white/90 font-medium">
                    <UserPlus className="w-4 h-4 mr-2" />
                    {t('landing.createYourFreeAccount')}
                  </Button>
                </Link>
                <Link to="/about">
                  <Button size="lg" variant="outline" className="bg-transparent border-white/50 text-primary-foreground hover:bg-white/10">
                    {t('landing.learnMore')}{" "} <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
};

export default Landing;