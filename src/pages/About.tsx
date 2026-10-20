import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { useLanguage } from "@/hooks/useLanguage";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import SEO from "@/components/SEO";
import { SITE_STATS, SOCIAL_PROOF_STATS } from "@/config/siteStats";
import {
  ShieldCheck,
  FileText,
  Search,
  Languages,
  UserCog,
  Wallet,
  BellRing,
  Smartphone,
  Mail,
  Phone,
  MapPin,
  Globe,
  Clock,
  LifeBuoy,
  DatabaseBackup,
  Lock,
  CloudCog,
  Timer,
  CheckCircle2,
  HeartPulse,
  Car,
  Home as HomeIcon,
  Sparkles,
  ArrowRight,
  Quote,
  CreditCard,
  Calculator,
  BookOpenText,
  Moon,
  Compass,
  FileSpreadsheet,
  Layers,
} from "lucide-react";
import siteConfig from "@/config/siteConfig";
import { BUSINESS_HOURS_LABELS } from "@/config/businessHours";
import { REFERRAL_PROGRAM_ENABLED } from "@/config/featureFlags";
import Trans from "@/components/Trans";

const About = () => {
  const { t } = useLanguage();

  const policyTypes = [
    { label: t('about.life'), icon: ShieldCheck, rotate: "-rotate-6", offset: "translate-y-2", bg: "bg-blue-50 dark:bg-blue-950/40", accent: "text-blue-600 dark:text-blue-400", chip: t('common.active') },
    { label: t('about.health'), icon: HeartPulse, rotate: "rotate-3", offset: "-translate-y-3", bg: "bg-emerald-50 dark:bg-emerald-950/40", accent: "text-emerald-600 dark:text-emerald-400", chip: t('landing.dueSoon') },
    { label: t('about.motor'), icon: Car, rotate: "-rotate-2", offset: "translate-y-4", bg: "bg-amber-50 dark:bg-amber-950/40", accent: "text-amber-600 dark:text-amber-400", chip: t('common.active') },
    { label: t('about.all'), icon: HomeIcon, rotate: "rotate-6", offset: "-translate-y-1", bg: "bg-violet-50 dark:bg-violet-950/40", accent: "text-violet-600 dark:text-violet-400", chip: t('landing.renewed') },
  ];

  // The first two come from src/config/siteStats.ts (single source of truth — also used on the home page).
  const trustStats = [
    ...SOCIAL_PROOF_STATS.map(({ value, labelKey }) => ({ value, label: t(labelKey) })),
    { value: "Daily", label: t('about.dataBackups') },
    { value: "< few hrs", label: t('about.supportResponse') },
    { value: "0", label: t('about.queriesPendingOvernight') },
    { value: "Any", label: t('about.policyTypeSupported') },
  ];

  const capabilities = [
    {
      icon: FileText,
      title: t('about.endToEndPolicyRecords'),
      description:
        t('about.captureFullPolicyholderDetailsNominee'),
    },
    {
      icon: BellRing,
      title: t('about.dueAndLapseTracking'),
      description:
        t('about.automaticallySurfacesPoliciesWithPayments'),
    },
    ...(REFERRAL_PROGRAM_ENABLED
      ? [
          {
            icon: Wallet,
            title: t('about.referralsAndWallet'),
            description:
              t('about.aBuiltInReferralWallet'),
          },
        ]
      : []),
    {
      icon: CreditCard,
      title: t('about.flexiblePlansSecurePayments'),
      description:
        REFERRAL_PROGRAM_ENABLED ? t('landing.planDescriptionReferral') : t('landing.planDescription'),
    },
    {
      icon: UserCog,
      title: t('about.roleBasedAdministration'),
      description:
        t('about.adminsGetDedicatedTools'),
    },
    {
      icon: Layers,
      title: t('about.everyKindOfPolicy'),
      description:
        t('about.lifeTermLifeHealthFamily'),
    },
    {
      icon: FileSpreadsheet,
      title: t('about.importAndExport'),
      description:
        t('about.movingFromSpreadsheetsImport'),
    },
    {
      icon: Search,
      title: t('about.fastPreciseSearch'),
      description:
        t('about.everyRecordListPoliciesDue'),
    },
    {
      icon: Languages,
      title: t('about.builtForIndianAgents'),
      description:
        t('about.fullEnglishAndHindiLanguage'),
    },
  ];

  const freeTools = [
    { to: "/tools/age-calculator", icon: Calculator, title: t('about.ageCalculator'), accent: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-950/40" },
    { to: "/tools/sip-calculator", icon: Calculator, title: t('about.sipCalculator'), accent: "text-violet-600 dark:text-violet-400", bg: "bg-violet-50 dark:bg-violet-950/40" },
    { to: "/tools/lumpsum-calculator", icon: Calculator, title: t('about.lumpsumCalculator'), accent: "text-indigo-600 dark:text-indigo-400", bg: "bg-indigo-50 dark:bg-indigo-950/40" },
    { to: "/tools/rd-calculator", icon: Calculator, title: t('about.rdCalculator'), accent: "text-orange-600 dark:text-orange-400", bg: "bg-orange-50 dark:bg-orange-950/40" },
    { to: "/tools/fd-calculator", icon: Calculator, title: t('about.fdCalculator'), accent: "text-green-600 dark:text-green-400", bg: "bg-green-50 dark:bg-green-950/40" },
    { to: "/tools/income-tax-calculator", icon: Calculator, title: t('about.incomeTaxCalculator'), accent: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-950/40" },
    { to: "/tools/home-loan-emi-calculator", icon: Calculator, title: t('about.homeLoanEmiCalculator'), accent: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-950/40" },
    { to: "/tools/term-insurance-calculator", icon: Calculator, title: t('about.termInsuranceCalculator'), accent: "text-rose-600 dark:text-rose-400", bg: "bg-rose-50 dark:bg-rose-950/40" },
    { to: "/tools/inflation-calculator", icon: Calculator, title: t('about.inflationCalculator'), accent: "text-cyan-600 dark:text-cyan-400", bg: "bg-cyan-50 dark:bg-cyan-950/40" },
    { to: "/policy-niketan-info-hub", icon: BookOpenText, title: t('about.policyNiketanInfoHub'), accent: "text-primary", bg: "bg-primary/10" },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEO
        title={t('about.aboutUs')}
        description={t('about.learnWhoBuildsPolicyNiketan')}
        path="/about"
      />
      <Navigation />

      <main className="flex-1">

        {/* ══════════ HERO — split layout, visual right side ══════════ */}
        <section className="relative bg-gradient-to-br from-form-header via-form-header to-form-subheader text-primary-foreground overflow-hidden">
          {/* ambient glow */}
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute bottom-0 left-1/3 w-64 h-64 rounded-full bg-primary/20 blur-3xl" />

          <div className="container mx-auto px-4 relative">
            <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center py-16 md:py-24">

              {/* Left: message */}
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-wider bg-white/10 text-primary-foreground/90 px-3 py-1.5 rounded-full backdrop-blur-sm">
                  <Sparkles className="w-3.5 h-3.5" />
                  {t('about.trustedByPolicyAgentsEvery')}
                </div>
                <h1 className="text-4xl md:text-5xl font-bold leading-tight tracking-tight">
                  {t('about.onePlatformForEveryPolicy')}
                </h1>
                <p className="text-lg text-primary-foreground/80 leading-relaxed max-w-lg">
                  {t('about.replacesSpreadsheetsAndPaperRegisters', { title: siteConfig.title })}
                </p>
                <div className="flex flex-wrap gap-2 pt-1">
                  {[
                    { icon: Moon, label: t('about.darkMode') },
                    { icon: Compass, label: t('about.guidedOnboarding') },
                    { icon: Languages, label: t('about.englishHindi') },
                  ].map(({ icon: Icon, label }) => (
                    <span
                      key={label}
                      className="inline-flex items-center gap-1.5 text-xs font-medium bg-white/10 text-primary-foreground/90 px-3 py-1.5 rounded-full backdrop-blur-sm"
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {label}
                    </span>
                  ))}
                </div>
                <div className="flex flex-wrap gap-3 pt-2">
                  <Link to="/view-records">
                    <Button size="lg" className="bg-white text-[hsl(195,90%,15%)] hover:bg-white/90 font-medium">
                      {t('about.manageYourPolicies')}{" "} <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                  <Link to="/add-record">
                    <Button size="lg" variant="outline" className="border-primary-foreground/30 text-[hsl(195,90%,15%)] hover:bg-primary-foreground/10 hover:text-primary-foreground">
                      {t('about.addARecord')}
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Right: signature visual — fanned policy cards, proves "any policy type" */}
              <div className="relative h-[340px] hidden sm:block">
                {policyTypes.map(({ label, icon: Icon, rotate, offset, bg, accent, chip }, i) => (
                  <div
                    key={label}
                    className={`absolute w-48 rounded-2xl ${bg} shadow-xl p-5 ${rotate} ${offset} hover:scale-105 hover:z-20 transition-transform duration-300`}
                    style={{
                      left: `${i * 60}px`,
                      top: `${i % 2 === 0 ? 20 : 70}px`,
                      zIndex: 10 + i,
                    }}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-9 h-9 rounded-lg bg-white dark:bg-background flex items-center justify-center shadow-sm`}>
                        <Icon className={`w-4.5 h-4.5 ${accent}`} />
                      </div>
                      <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground bg-white/70 dark:bg-background/70 px-2 py-0.5 rounded-full">
                        {chip}
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-form-header">{t('about.policy', { label })}</p>
                    <p className="text-xs text-muted-foreground mt-1">{t('about.fullyTrackedBackedUp')}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ══════════ TRUST STRIP — full width stat bar ══════════ */}
        <section className="bg-form-subheader text-primary-foreground">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 divide-x divide-primary-foreground/15">
              {trustStats.map(({ value, label }) => (
                <div key={label} className="px-4 py-6 text-center">
                  <p className="text-2xl md:text-3xl font-bold">{value}</p>
                  <p className="text-xs text-primary-foreground/70 mt-1">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════ NOT JUST FOR One Insurance Type — split, icon panel right ══════════ */}
        <section className="bg-background py-16 md:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-4 order-2 lg:order-1">
                <div className="grid grid-cols-2 gap-4">
                  {policyTypes.map(({ label, icon: Icon, bg, accent }) => (
                    <div key={label} className={`${bg} rounded-2xl p-5 flex items-center gap-3`}>
                      <div className="w-10 h-10 rounded-xl bg-white dark:bg-background flex items-center justify-center shadow-sm shrink-0">
                        <Icon className={`w-5 h-5 ${accent}`} />
                      </div>
                      <span className="font-medium text-form-header text-sm">{t('about.insurance', { label })}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-4 order-1 lg:order-2">
                <p className="text-xs font-medium uppercase tracking-wider text-primary">{t('about.builtForEveryAgent')}</p>
                <h2 className="text-3xl font-bold text-form-header leading-tight">
                  {t('about.notBuiltForOneInsurance')}
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  {t('about.thisPlatformWasNeverDesigned')}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ══════════ CAPABILITIES — alternating rows ══════════ */}
        <section className="bg-muted/40 py-16 md:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="text-center max-w-xl mx-auto mb-14">
                <p className="text-xs font-medium uppercase tracking-wider text-primary mb-2">{t('about.whatYouGet')}</p>
                <h2 className="text-3xl font-bold text-form-header">{t('about.everythingToRunPolicyOperations')}</h2>
              </div>

              <div className="space-y-10">
                {capabilities.map(({ icon: Icon, title, description }, i) => (
                  <div
                    key={title}
                    className={`flex flex-col md:flex-row items-start md:items-center gap-6 bg-background rounded-2xl p-6 md:p-8 shadow-sm hover:shadow-md transition-shadow ${
                      i % 2 === 1 ? "md:flex-row-reverse" : ""
                    }`}
                  >
                    <div className="shrink-0 w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                      <Icon className="w-7 h-7 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg text-form-header mb-1.5">{title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ══════════ FREE TOOLS — calculators + Policy Niketan Info Hub grid ══════════ */}
        <section className="bg-background py-16 md:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="text-center max-w-xl mx-auto mb-12">
                <p className="text-xs font-medium uppercase tracking-wider text-primary mb-2">{t('about.beyondRecordKeeping')}</p>
                <h2 className="text-3xl font-bold text-form-header">{t('about.freeToolsBuiltRight')}</h2>
                <p className="text-muted-foreground mt-3 leading-relaxed">
                  {t('about.financialCalculatorsAgentsActuallyNeed', { freeTools: SITE_STATS.freeTools })}
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {freeTools.map(({ to, icon: Icon, title, accent, bg }) => (
                  <Link
                    key={to}
                    to={to}
                    className="group flex flex-col items-center text-center gap-3 rounded-2xl border border-border p-5 hover:border-primary/40 hover:shadow-md transition-all"
                  >
                    <div className={`w-12 h-12 rounded-xl ${bg} flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform`}>
                      <Icon className={`w-5 h-5 ${accent}`} />
                    </div>
                    <span className="text-sm font-medium text-form-header leading-snug">{title}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ══════════ DATA PROTECTION — dark panel, icon medallions ══════════ */}
        <section className="bg-form-header text-primary-foreground py-16 md:py-20 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-primary/10 blur-3xl" />
          <div className="container mx-auto px-4 relative">
            <div className="max-w-6xl mx-auto">
              <div className="max-w-xl mb-14">
                <p className="text-xs font-medium uppercase tracking-wider text-primary-foreground/60 mb-2">{t('about.securityReliability')}</p>
                <h2 className="text-3xl font-bold mb-3">{t('about.yourDataIsTooSafe')}</h2>
                <p className="text-primary-foreground/70 leading-relaxed">
                  {t('about.policyAndPolicyholderData')}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  {
                    icon: DatabaseBackup,
                    title: t('about.backedUpEverySingleDay'),
                    description:
                      t('about.yourRecordsAreBackedUp'),
                  },
                  {
                    icon: Lock,
                    title: t('about.lockedDownByDefault'),
                    description:
                      t('about.everyAccountIsAuthenticatedBefore'),
                  },
                  {
                    icon: CloudCog,
                    title: t('about.builtForReliability'),
                    description:
                      REFERRAL_PROGRAM_ENABLED ? t('landing.reliabilityWithWallet') : t('landing.reliabilityNoWallet'),
                  },
                ].map(({ icon: Icon, title, description }) => (
                  <div key={title} className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/[0.08] transition-colors">
                    <div className="w-11 h-11 rounded-xl bg-primary/20 flex items-center justify-center mb-4">
                      <Icon className="w-5 h-5 text-primary-foreground" />
                    </div>
                    <h3 className="font-semibold mb-2">{title}</h3>
                    <p className="text-sm text-primary-foreground/70 leading-relaxed">{description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ══════════ SUPPORT PROMISE — light panel, quote-style ══════════ */}
        <section className="bg-background py-16 md:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-10 items-start">

              <div className="lg:col-span-2 space-y-4">
                <p className="text-xs font-medium uppercase tracking-wider text-primary">{t('about.supportYouCanRely')}</p>
                <h2 className="text-3xl font-bold text-form-header leading-tight">
                  {t('about.everyQueryClosedOutUsually')}
                </h2>
                <div className="bg-primary/5 border-l-4 border-primary rounded-r-xl p-5 mt-6">
                  <Quote className="w-5 h-5 text-primary mb-2" />
                  <p className="text-form-header font-medium leading-relaxed">
                    {t('about.weDonTLetQueries')}
                  </p>
                </div>
              </div>

              <div className="lg:col-span-3 grid sm:grid-cols-2 gap-5">
                {[
                  {
                    icon: Timer,
                    title: t('about.resolvedWithinHours'),
                    description: t('about.questionsAndIssuesAreTypically'),
                  },
                  {
                    icon: CheckCircle2,
                    title: t('about.nothingPendingOvernight'),
                    description: t('about.noAgentGoesToSleep'),
                  },
                  {
                    icon: LifeBuoy,
                    title: t('about.peopleWhoKnowTheProduct'),
                    description: t('about.supportIsnTOutsourced'),
                  },
                  {
                    icon: ShieldCheck,
                    title: t('about.aTrustedPlatform'),
                    description: t('about.builtAndSupported'),
                  },
                ].map(({ icon: Icon, title, description }) => (
                  <div key={title} className="rounded-2xl border border-border p-5 hover:border-primary/40 hover:shadow-sm transition-all">
                    <Icon className="w-5 h-5 text-primary mb-3" />
                    <h3 className="font-medium text-form-header mb-1.5 text-sm">{title}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
                  </div>
                ))}
              </div>

            </div>
          </div>
        </section>

        {/* ══════════ CTA BAND ══════════ */}
        <section className="bg-gradient-to-r from-primary to-primary-light text-primary-foreground py-14">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold mb-1">{t('about.readyToBringOrder')}</h2>
                <p className="text-primary-foreground/90">{t('about.joinAgentsAlreadyManagingEvery')}</p>
              </div>
              <Link to="/add-record" className="shrink-0">
                <Button size="lg" className="bg-white text-[hsl(195,85%,25%)] hover:bg-white/90 font-medium">
                  {t('about.addYourFirstRecord')}{" "} <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* ══════════ CONTACT — two column, no empty space ══════════ */}
        <section className="bg-muted/40 py-16 md:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10">

              <div className="bg-background rounded-2xl p-8 shadow-sm">
                <h2 className="text-xl font-semibold text-form-header mb-6">{t('about.getInTouch')}</h2>
                <div className="space-y-5">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <Mail className="w-4.5 h-4.5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-form-header">{t('common.email2')}</p>
                      <p className="text-sm text-muted-foreground">{siteConfig.supportEmail}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <Phone className="w-4.5 h-4.5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-form-header">{t('about.callBack')}</p>
                      <p className="text-sm text-muted-foreground">
                        <Trans i18nKey="about.preferToTalkRequest" components={{ link: <Link to="/help-support#request-call" className="text-primary hover:underline" /> }} />
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <MapPin className="w-4.5 h-4.5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-form-header">{t('about.address')}</p>
                      <p className="text-sm text-muted-foreground">{t("nav.officeAddress")}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <Globe className="w-4.5 h-4.5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-form-header">{t('about.website')}</p>
                      <p className="text-sm text-muted-foreground">{siteConfig.productionUrl}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-background rounded-2xl p-8 shadow-sm">
                <h2 className="text-xl font-semibold text-form-header mb-6">{t('about.supportHours')}</h2>
                <div className="space-y-3 mb-6">
                  {BUSINESS_HOURS_LABELS.map(({ days: day, hours }) => (
                    <div key={day} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                      <span className="text-sm text-muted-foreground flex items-center gap-2">
                        <Clock className="w-4 h-4 text-primary" /> {t(day)}
                      </span>
                      <span className="text-sm font-medium text-form-header">{t(hours)}</span>
                    </div>
                  ))}
                </div>
                <div className="flex items-start gap-4 bg-primary/5 rounded-xl p-4">
                  <LifeBuoy className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-form-header">{t('about.emergencySupport')}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {t('about.availableAroundTheClock')}
                    </p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
};

export default About;