import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { useLanguage } from "@/hooks/useLanguage";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import SEO from "@/components/SEO";
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
} from "lucide-react";
import siteConfig from "@/config/siteConfig";

const About = () => {
  const { t } = useLanguage();

  const policyTypes = [
    { label: "Life", icon: ShieldCheck, rotate: "-rotate-6", offset: "translate-y-2", bg: "bg-blue-50 dark:bg-blue-950/40", accent: "text-blue-600 dark:text-blue-400", chip: "Active" },
    { label: "Health", icon: HeartPulse, rotate: "rotate-3", offset: "-translate-y-3", bg: "bg-emerald-50 dark:bg-emerald-950/40", accent: "text-emerald-600 dark:text-emerald-400", chip: "Due soon" },
    { label: "Motor", icon: Car, rotate: "-rotate-2", offset: "translate-y-4", bg: "bg-amber-50 dark:bg-amber-950/40", accent: "text-amber-600 dark:text-amber-400", chip: "Active" },
    { label: "General", icon: HomeIcon, rotate: "rotate-6", offset: "-translate-y-1", bg: "bg-violet-50 dark:bg-violet-950/40", accent: "text-violet-600 dark:text-violet-400", chip: "Renewed" },
  ];

  const trustStats = [
    { value: "Daily", label: "Data backups" },
    { value: "< few hrs", label: "Support response" },
    { value: "0", label: "Queries pending overnight" },
    { value: "Any", label: "Policy type supported" },
  ];

  const capabilities = [
    {
      icon: FileText,
      title: "End-to-end policy records",
      description:
        "Capture full policyholder details, nominee information, and both current and previous policy terms in one place — then search, sort, and update them as circumstances change. Works for life, health, motor, and general insurance policies alike.",
    },
    {
      icon: BellRing,
      title: "Due and lapse tracking",
      description:
        "Automatically surfaces policies with payments due this month and flags anyone who missed their last payment, so follow-ups happen before a policy lapses — whatever kind of policy it is.",
    },
    {
      icon: Wallet,
      title: "Referrals and withdrawals",
      description:
        "A built-in referral wallet tracks direct and second-level referrals, with an admin-reviewed withdrawal queue for approving or rejecting payouts.",
    },
    {
      icon: UserCog,
      title: "Role-based administration",
      description:
        "Admins get dedicated tools to manage user accounts, review withdrawal requests, and keep the platform running smoothly — without touching agents' day-to-day workspace.",
    },
    {
      icon: Search,
      title: "Fast, precise search",
      description:
        "Every record list — policies, due payments, users, withdrawals — supports instant search and column sorting, so finding one record among thousands takes seconds.",
    },
    {
      icon: Languages,
      title: "Built for Indian agents",
      description:
        "Full English and Hindi support, Indian date formatting, and terminology that matches how policies are actually discussed in the field.",
    },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEO
        title="About Us"
        description="Learn who builds Life Insurance Records, why we built a dedicated record-keeping tool for LIC and life insurance agents, and how we keep client data secure."
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
                  Trusted by policy agents every day
                </div>
                <h1 className="text-4xl md:text-5xl font-bold leading-tight tracking-tight">
                  One Platform For Every Policy You Manage.
                </h1>
                <p className="text-lg text-primary-foreground/80 leading-relaxed max-w-lg">
                  {siteConfig.title} replaces spreadsheets and paper registers with a single, secure
                  workspace — built for life, health, motor, and general insurance agents who want
                  their entire book of business organized, backed up, and a search away.
                </p>
                <div className="flex flex-wrap gap-3 pt-2">
                  <Link to="/view-records">
                    <Button size="lg" className="bg-white text-[hsl(195,90%,15%)] hover:bg-white/90 font-medium">
                      Manage your policies <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                  <Link to="/add-record">
                    <Button size="lg" variant="outline" className="border-primary-foreground/30 text-[hsl(195,90%,15%)] hover:bg-primary-foreground/10 hover:text-primary-foreground">
                      Add a record
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
                    <p className="text-sm font-semibold text-form-header">{label} Policy</p>
                    <p className="text-xs text-muted-foreground mt-1">Fully tracked & backed up</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ══════════ TRUST STRIP — full width stat bar ══════════ */}
        <section className="bg-form-subheader text-primary-foreground">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 divide-x divide-primary-foreground/15">
              {trustStats.map(({ value, label }) => (
                <div key={label} className="px-4 py-6 text-center">
                  <p className="text-2xl md:text-3xl font-bold">{value}</p>
                  <p className="text-xs text-primary-foreground/70 mt-1">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════ NOT JUST FOR LIC — split, icon panel right ══════════ */}
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
                      <span className="font-medium text-form-header text-sm">{label} Insurance</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-4 order-1 lg:order-2">
                <p className="text-xs font-medium uppercase tracking-wider text-primary">Built for every agent</p>
                <h2 className="text-3xl font-bold text-form-header leading-tight">
                  Not built for one insurance line. Built for all of them.
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  This platform was never designed around a single insurance category. Whether you
                  sell life, health, motor, home, or general insurance, you manage every policy,
                  every policyholder, and every due payment the same organized, dependable way.
                  If your work is tracking policies and staying on top of renewals, this is the
                  best tool to run that work from — no matter what you sell.
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
                <p className="text-xs font-medium uppercase tracking-wider text-primary mb-2">What you get</p>
                <h2 className="text-3xl font-bold text-form-header">Everything to run policy operations, day to day</h2>
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

        {/* ══════════ DATA PROTECTION — dark panel, icon medallions ══════════ */}
        <section className="bg-form-header text-primary-foreground py-16 md:py-20 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-primary/10 blur-3xl" />
          <div className="container mx-auto px-4 relative">
            <div className="max-w-6xl mx-auto">
              <div className="max-w-xl mb-14">
                <p className="text-xs font-medium uppercase tracking-wider text-primary-foreground/60 mb-2">Security & reliability</p>
                <h2 className="text-3xl font-bold mb-3">Your data is too safe to worry about.</h2>
                <p className="text-primary-foreground/70 leading-relaxed">
                  Policy and policyholder data is sensitive, and we treat it that way. Security
                  isn't an afterthought here — it's built into how the platform stores, backs up,
                  and protects every record you enter, day after day.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  {
                    icon: DatabaseBackup,
                    title: "Backed up, every single day",
                    description:
                      "Your records are backed up day by day, without exception. If anything ever goes wrong on our end, your data can be restored quickly — nothing is ever left resting on a single copy.",
                  },
                  {
                    icon: Lock,
                    title: "Locked down by default",
                    description:
                      "Every account is authenticated before it can see a single record. Sensitive fields like Aadhaar, PAN, and bank details are only ever visible to the agent who owns them, or an admin acting within their role.",
                  },
                  {
                    icon: CloudCog,
                    title: "Built for reliability",
                    description:
                      "Records, policies, and wallet balances are written and backed up in a way designed to survive the unexpected — a single failure was never meant to mean lost work.",
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
                <p className="text-xs font-medium uppercase tracking-wider text-primary">Support you can rely on</p>
                <h2 className="text-3xl font-bold text-form-header leading-tight">
                  Every query closed out — usually the same day.
                </h2>
                <div className="bg-primary/5 border-l-4 border-primary rounded-r-xl p-5 mt-6">
                  <Quote className="w-5 h-5 text-primary mb-2" />
                  <p className="text-form-header font-medium leading-relaxed">
                    We don't let queries pile up. The goal is a clean queue at the end of every day —
                    no agent waiting overnight for an answer that could've come sooner.
                  </p>
                </div>
              </div>

              <div className="lg:col-span-3 grid sm:grid-cols-2 gap-5">
                {[
                  {
                    icon: Timer,
                    title: "Resolved within hours",
                    description: "Questions and issues are typically closed out within a few hours of being raised — not days.",
                  },
                  {
                    icon: CheckCircle2,
                    title: "Nothing pending overnight",
                    description: "No agent goes to sleep waiting on an answer. Every query gets handled the same day it comes in.",
                  },
                  {
                    icon: LifeBuoy,
                    title: "People who know the product",
                    description: "Support isn't outsourced to a generic helpdesk — the team answering understands policy workflows.",
                  },
                  {
                    icon: ShieldCheck,
                    title: "A trusted platform",
                    description: "Built and supported with the reliability agents need to run their business on, every single day.",
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
                <h2 className="text-2xl md:text-3xl font-bold mb-1">Ready to bring order to your policy book?</h2>
                <p className="text-primary-foreground/90">Join agents already managing every policy type, safely, in one place.</p>
              </div>
              <Link to="/add-record" className="shrink-0">
                <Button size="lg" className="bg-white text-[hsl(195,85%,25%)] hover:bg-white/90 font-medium">
                  Add your first record <ArrowRight className="w-4 h-4 ml-2" />
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
                <h2 className="text-xl font-semibold text-form-header mb-6">Get in touch</h2>
                <div className="space-y-5">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <Mail className="w-4.5 h-4.5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-form-header">Email</p>
                      <p className="text-sm text-muted-foreground">{siteConfig.supportEmail}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <MapPin className="w-4.5 h-4.5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-form-header">Address</p>
                      <p className="text-sm text-muted-foreground">{t("officeAddress")}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <Globe className="w-4.5 h-4.5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-form-header">Website</p>
                      <p className="text-sm text-muted-foreground">{siteConfig.productionUrl}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-background rounded-2xl p-8 shadow-sm">
                <h2 className="text-xl font-semibold text-form-header mb-6">Support hours</h2>
                <div className="space-y-3 mb-6">
                  {[
                    { day: "Monday – Friday", hours: "9:00 AM – 6:00 PM" },
                    { day: "Saturday", hours: "10:00 AM – 4:00 PM" },
                    { day: "Sunday", hours: "Closed" },
                  ].map(({ day, hours }) => (
                    <div key={day} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                      <span className="text-sm text-muted-foreground flex items-center gap-2">
                        <Clock className="w-4 h-4 text-primary" /> {day}
                      </span>
                      <span className="text-sm font-medium text-form-header">{hours}</span>
                    </div>
                  ))}
                </div>
                <div className="flex items-start gap-4 bg-primary/5 rounded-xl p-4">
                  <LifeBuoy className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-form-header">Emergency support</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Available around the clock for critical account or data issues.
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