import { Link, useNavigate } from "react-router-dom";
import { useEffect } from "react";
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
  TrendingUp, CircleDot, Bell, Languages,
} from "lucide-react";
import siteConfig from "@/config/siteConfig";
import SEO from "@/components/SEO";

const plans = [
  { id: "1month-free", name: "1 Month", price: "Free", tag: "Try it out", color: "bg-gray-50 border-gray-200", accent: "text-gray-600" },
  { id: "6months", name: "6 Months", price: "For starting agents", tag: "", color: "bg-violet-50 border-violet-200", accent: "text-violet-700" },
  { id: "12months", name: "12 Months", price: "Most popular", tag: "Recommended", color: "bg-blue-50 border-blue-300 ring-2 ring-blue-200", accent: "text-blue-700" },
  { id: "24months", name: "24 Months", price: "Best value", tag: "", color: "bg-amber-50 border-amber-200", accent: "text-amber-700" },
];

const Landing = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  useEffect(() => {
    if (isAuthenticated()) {
      navigate("/home");
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEO
        title="Life Insurance Policy Record Management for Agents"
        description="Track every client's policy, due date, and payment status in one place. Add records in seconds, search instantly, and never miss a renewal — built for LIC and life insurance agents."
      />

      <Navigation />

      <main className="flex-1">

        {/* ══════════ HERO — light bg, dashboard mockup (not fanned cards) ══════════ */}
        <section className="relative bg-gradient-to-b from-primary/5 via-background to-background overflow-hidden">
          <div className="absolute top-20 -left-32 w-72 h-72 rounded-full bg-primary/5 blur-3xl" />

          <div className="container mx-auto px-4 relative">
            <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center pt-[2rem] pb-16 md:py-24">

              {/* Left: message */}
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-wider bg-primary/10 text-primary px-3 py-1.5 rounded-full">
                  <Sparkles className="w-3.5 h-3.5" />
                  Free for your first month
                </div>
                <h1 className="text-4xl md:text-5xl font-bold leading-tight tracking-tight text-form-header">
                  Stop Chasing Policies Across Spreadsheets.
                </h1>
                <p className="text-lg text-muted-foreground leading-relaxed max-w-lg">
                  {siteConfig.title} is where policy agents — life, health, motor, or general
                  insurance — keep every record, every due date, and every client organized,
                  backed up daily, and a search away.
                </p>
                <div className="flex flex-wrap gap-3 pt-2">
                  <Link to="/signup">
                    <Button size="lg" className="bg-primary hover:bg-primary-light font-medium">
                      <UserPlus className="w-4 h-4 mr-2" />
                      Create free account
                    </Button>
                  </Link>
                  <Link to="/login">
                    <Button size="lg" variant="outline" className="bg-transparent border-primary/30 text-form-header hover:bg-primary/5">
                      <LogIn className="w-4 h-4 mr-2" />
                      I already have an account
                    </Button>
                  </Link>
                </div>
                <p className="text-xs text-muted-foreground pt-1">No credit card required for your first month.</p>
              </div>

              {/* Right: single contained dashboard mockup — badges anchored to its own box, can't drift into text */}
              <div className="relative mx-auto w-full max-w-md py-6">
                <div className="relative rounded-2xl border border-border bg-white shadow-2xl overflow-hidden">
                  {/* window chrome */}
                  <div className="flex items-center gap-1.5 px-4 py-3 border-b border-border bg-muted/40">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-300" />
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-300" />
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-300" />
                    <span className="ml-3 text-xs text-muted-foreground font-medium">Policy Dashboard</span>
                  </div>

                  <div className="p-5 space-y-4">
                    {/* mini stat row */}
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { label: "Records", val: "128", bg: "bg-blue-50", color: "text-blue-700" },
                        { label: "Due", val: "12", bg: "bg-amber-50", color: "text-amber-700" },
                        { label: "Backed up", val: "Today", bg: "bg-emerald-50", color: "text-emerald-700" },
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
                        <span>Name</span><span>Policy</span><span className="text-right">Status</span>
                      </div>
                      {[
                        { name: "R. Sharma", policy: "LIC-2291", status: "Active", color: "bg-emerald-100 text-emerald-700" },
                        { name: "A. Verma", policy: "HDFC-8823", status: "Due", color: "bg-amber-100 text-amber-700" },
                        { name: "S. Iyer", policy: "ICICI-4410", status: "Active", color: "bg-emerald-100 text-emerald-700" },
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

                  {/* badge anchored to card's own top-right corner — contained, can't overlap text column */}
                  <div className="absolute -top-3 -right-3 bg-white shadow-lg border border-border rounded-full pl-1.5 pr-5 pt-3 pb-1.5 flex items-center gap-1.5 z-10">
                    <span className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    </span>
                    <span className="text-[11px] font-medium text-form-header">Backed up 2m ago</span>
                  </div>
                </div>

                {/* second badge sits below the card in normal flow, not absolutely positioned — zero overlap risk */}
                <div className="mt-4 mx-auto w-fit bg-white shadow-lg border border-border rounded-xl px-4 py-2.5 flex items-center gap-2.5">
                  <span className="w-7 h-7 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
                    <Bell className="w-3.5 h-3.5 text-amber-600" />
                  </span>
                  <span className="text-xs text-form-header">
                    <span className="font-semibold">3 payments</span>
                    <span className="text-muted-foreground"> due this week</span>
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
                { icon: DatabaseBackup, text: "Daily backups" },
                { icon: Timer, text: "Support in < few hrs" },
                { icon: CheckCircle2, text: "Zero pending overnight" },
                { icon: ShieldCheck, text: "Any policy type" },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-2 bg-background border border-border rounded-full px-4 py-2 text-sm text-form-header shadow-sm">
                  <Icon className="w-4 h-4 text-primary" />
                  {text}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════ HOW IT WORKS — connected stepper, not giant background numbers ══════════ */}
        <section id="how-it-works" className="bg-background py-16 md:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="text-center max-w-xl mx-auto mb-16">
                <p className="text-xs font-medium uppercase tracking-wider text-primary mb-2">Getting started</p>
                <h2 className="text-3xl font-bold text-form-header">Up and running in three steps</h2>
              </div>

              <div className="relative grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-6">
                {/* connecting line, precisely aligned to circle centers, hidden on mobile */}
                <div className="hidden md:block absolute top-7 left-[16.6%] right-[16.6%] h-0.5 bg-border" />

                {[
                  { icon: UserPlus, title: "Create your account", description: "Sign up in minutes — no paperwork, no waiting for approval. Your first month is free." },
                  { icon: ClipboardList, title: "Add your policies", description: "Bring in your existing book of clients, one record or many, with full policyholder and policy details." },
                  { icon: ListChecks, title: "Never miss a due date", description: "The dashboard flags what's due this month and what's lapsed — so follow-ups happen on time." },
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
                <p className="text-xs font-medium uppercase tracking-wider text-primary mb-2">What you get</p>
                <h2 className="text-3xl font-bold text-form-header">Everything to run your policy book</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">

                {/* Complete records */}
                <div className="bg-background rounded-2xl border border-border p-6 hover:shadow-md hover:border-primary/30 transition-all">
                  <div className="flex items-center gap-3 mb-4 bg-blue-50 rounded-xl p-3">
                    <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-xs font-semibold shrink-0">RS</div>
                    <div className="space-y-1 flex-1">
                      <div className="h-2 w-20 rounded bg-blue-200/70" />
                      <div className="h-1.5 w-14 rounded bg-blue-200/40" />
                    </div>
                  </div>
                  <FileText className="w-5 h-5 text-primary mb-2" />
                  <h3 className="font-semibold text-form-header mb-1.5">Complete policy records</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">Policyholder details, nominee info, and current & previous policy terms — all in one place.</p>
                </div>

                {/* Due tracking */}
                <div className="bg-background rounded-2xl border border-border p-6 hover:shadow-md hover:border-primary/30 transition-all">
                  <div className="mb-4 bg-amber-50 rounded-xl p-3 space-y-1.5">
                    {["Due 3 Aug", "Due 9 Aug"].map((d) => (
                      <div key={d} className="flex items-center justify-between bg-white rounded-md px-2.5 py-1.5">
                        <span className="text-[10px] text-form-header font-medium">{d}</span>
                        <BellRing className="w-3 h-3 text-amber-500" />
                      </div>
                    ))}
                  </div>
                  <BellRing className="w-5 h-5 text-primary mb-2" />
                  <h3 className="font-semibold text-form-header mb-1.5">Due and lapse tracking</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">See what's due this month and who missed a payment — before it lapses.</p>
                </div>

                {/* Referral wallet */}
                <div className="bg-background rounded-2xl border border-border p-6 hover:shadow-md hover:border-primary/30 transition-all">
                  <div className="mb-4 bg-emerald-50 rounded-xl p-4">
                    <p className="text-[10px] text-emerald-700 mb-1">Available balance</p>
                    <p className="text-lg font-bold text-emerald-700">₹4,250</p>
                  </div>
                  <Wallet className="w-5 h-5 text-primary mb-2" />
                  <h3 className="font-semibold text-form-header mb-1.5">Referral wallet</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">Earn and track referral rewards, with a simple, admin-reviewed withdrawal process.</p>
                </div>

                {/* Search */}
                <div className="bg-background rounded-2xl border border-border p-6 hover:shadow-md hover:border-primary/30 transition-all">
                  <div className="mb-4 bg-violet-50 rounded-xl p-3">
                    <div className="flex items-center gap-2 bg-white rounded-md px-2.5 py-1.5 mb-2">
                      <Search className="w-3 h-3 text-muted-foreground" />
                      <span className="text-[10px] text-muted-foreground">Sharma...</span>
                    </div>
                    <div className="h-1.5 w-3/4 rounded bg-violet-200/60 mb-1.5" />
                    <div className="h-1.5 w-1/2 rounded bg-violet-200/40" />
                  </div>
                  <Search className="w-5 h-5 text-primary mb-2" />
                  <h3 className="font-semibold text-form-header mb-1.5">Instant search & sort</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">Find any record by name, policy number, or occupation, in seconds.</p>
                </div>

                {/* Multi-language */}
                <div className="bg-background rounded-2xl border border-border p-6 hover:shadow-md hover:border-primary/30 transition-all">
                  <div className="mb-4 bg-rose-50 rounded-xl p-3 flex items-center gap-2">
                    <span className="text-[11px] font-medium bg-white text-form-header rounded-full px-3 py-1 shadow-sm">English</span>
                    <span className="text-[11px] font-medium bg-rose-200/60 text-rose-700 rounded-full px-3 py-1">हिंदी</span>
                  </div>
                  <Languages className="w-5 h-5 text-primary mb-2" />
                  <h3 className="font-semibold text-form-header mb-1.5">English & Hindi</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">Use the platform in the language you're comfortable with, with Indian date formats throughout.</p>
                </div>

                {/* Mobile */}
                <div className="bg-background rounded-2xl border border-border p-6 hover:shadow-md hover:border-primary/30 transition-all">
                  <div className="mb-4 bg-cyan-50 rounded-xl p-3 flex justify-center">
                    <div className="w-14 h-24 rounded-xl border-2 border-cyan-300 bg-white p-1.5 flex flex-col gap-1">
                      <div className="h-1.5 w-6 mx-auto rounded-full bg-cyan-200" />
                      <div className="flex-1 rounded-md bg-cyan-50 mt-1" />
                    </div>
                  </div>
                  <Smartphone className="w-5 h-5 text-primary mb-2" />
                  <h3 className="font-semibold text-form-header mb-1.5">Works on your phone</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">Update a record between client visits — smooth on mobile, same as desktop.</p>
                </div>

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
                  { icon: DatabaseBackup, title: "Backed up daily", description: "Every record is backed up day by day, without exception — nothing rests on a single copy." },
                  { icon: Lock, title: "Locked down access", description: "Sensitive fields like Aadhaar, PAN, and bank details are visible only to you and authorized admins." },
                  { icon: LifeBuoy, title: "Fast, human support", description: "Real answers from a team that understands policy workflows — typically within a few hours, nothing left pending overnight." },
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
                <p className="text-xs font-medium uppercase tracking-wider text-primary">Why agents trust us</p>
                <h2 className="text-3xl font-bold text-form-header leading-tight">
                  Secure, backed up, and always answered.
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  Your client data is sensitive, and it's treated that way from day one — backed up
                  daily, access locked down by default, and support that closes out your questions
                  the same day they're raised.
                </p>
                <div className="rounded-2xl bg-primary/5 border border-primary/10 p-5 flex items-center gap-4">
                  <ShieldCheck className="w-8 h-8 text-primary shrink-0" />
                  <p className="text-sm text-form-header font-medium">
                    A platform built to be the last one you need for policy management.
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
                <p className="text-xs font-medium uppercase tracking-wider text-primary mb-2">Simple pricing</p>
                <h2 className="text-3xl font-bold text-form-header">Start free, stay as long as you need</h2>
                <p className="text-muted-foreground mt-3">
                  Every plan includes the full platform — no feature is locked behind a higher tier.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
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
                      <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> Unlimited policy records</li>
                      <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> Due & lapse tracking</li>
                      <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> Daily backups</li>
                    </ul>
                    <Link to="/signup">
                      <Button variant="outline" size="sm" className="w-full bg-background">
                        Choose plan
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
              <p className="text-center text-xs text-muted-foreground mt-6">
                <Link to="/our-plans" className="text-primary hover:underline font-medium">See full plan comparison →</Link>
              </p>
            </div>
          </div>
        </section>

        {/* ══════════ FINAL CTA ══════════ */}
        <section className="bg-[linear-gradient(to_bottom,#0a5b76,#0e7ca1,#0a5b76)] text-primary-foreground py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center space-y-6">
              <TrendingUp className="w-10 h-10 mx-auto text-white/90" />
              <h2 className="text-3xl md:text-4xl font-bold">Bring order to your policy book today.</h2>
              <p className="text-white/90 text-lg">
                Free for your first month. No setup fees, no long-term commitment required.
              </p>
              <div className="flex flex-wrap justify-center gap-3 pt-2">
                <Link to="/signup">
                  <Button size="lg" className="bg-white text-primary hover:bg-white/90 font-medium">
                    <UserPlus className="w-4 h-4 mr-2" />
                    Create your free account
                  </Button>
                </Link>
                <Link to="/about">
                  <Button size="lg" variant="outline" className="bg-transparent border-white/50 text-white hover:bg-white/10">
                    Learn more <ArrowRight className="w-4 h-4 ml-2" />
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