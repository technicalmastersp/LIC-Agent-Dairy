import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { getCurrentUser, isAuthenticated } from "@/utils/auth";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useEffect } from "react";
import {
  LifeBuoy, Mail, MessageCircle, Phone, Search, ChevronDown,
  ShieldCheck, Clock, CheckCircle2, Send, BookOpenText,
  Wallet, FileText, Lock, UserCog, Users, ArrowRight, Timer, DatabaseBackup,
  Lightbulb, Inbox,
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import SEO from "@/components/SEO";
import siteConfig from "@/config/siteConfig";
import { createTicket, getMyTickets } from "../../services/supportService";
import { createSuggestion, getMySuggestions } from "../../services/suggestionService";
import axios from "axios";

type Ticket = {
  ticketId: string;
  category: string;
  createdAt?: string;
  status: string;
  message: string;
  adminReply?: string;
};

type Suggestion = {
  _id: string;
  title: string;
  message: string;
  status: string;
};

type FaqItem = { q: string; a: string; category: string };

const faqs: FaqItem[] = [
  { category: "Account & Billing", q: "How do I upgrade or change my plan?", a: "Go to Profile → Upgrade plan, or visit the Plans page directly. Your remaining days on the current plan are handled automatically when you switch." },
  { category: "Account & Billing", q: "What happens when my plan expires?", a: "Your records stay safe and backed up, but you'll need to renew to add new records or access due/missed payment tracking again." },
  { category: "Account & Billing", q: "Can I change my registered name or Easy ID?", a: "No — your name and Easy ID are permanently assigned at signup for record integrity. Everything else on your profile (mobile number, address, email) can be updated any time." },
  { category: "Policies & Records", q: "Can I manage policies other than life insurance?", a: "Yes. The platform isn't limited to one insurance category — life, health, motor, and general insurance policies can all be tracked the same way." },
  { category: "Policies & Records", q: "How does due-date and missed-payment tracking work?", a: "Every policy with a payment due this month, or one that missed its last payment, is automatically surfaced on dedicated pages — no manual tracking spreadsheet needed." },
  { category: "Policies & Records", q: "Can I delete a policy record?", a: "Record deletion is currently disabled from the interface to prevent accidental data loss. Contact support if a record genuinely needs to be removed." },
  { category: "Payments & Referrals", q: "How does the referral wallet work?", a: "You earn rewards for direct (L1) and second-level (L2) referrals. Balances show as available or pending, and can be withdrawn once payment details are added to your profile." },
  { category: "Payments & Referrals", q: "How long does a withdrawal take to process?", a: "Withdrawal requests go into an admin-reviewed queue and are typically approved or rejected within a few business days. You'll see the status update on the Referral Program page." },
  { category: "Payments & Referrals", q: "My withdrawal was rejected — what now?", a: "A rejection always comes with a reason and refunds the amount to your wallet automatically, so you can correct the issue (e.g. bank details) and request again." },
  { category: "Security & Data", q: "Is my policyholder data backed up?", a: "Yes — records are backed up daily without exception, so a single failure never means lost work." },
  { category: "Security & Data", q: "Who can see sensitive fields like Aadhaar or PAN?", a: "Only you and admins acting within their role can view sensitive fields. Access is authenticated and scoped by design, not open by default." },
  { category: "Technical", q: "The site isn't loading properly on my phone — what should I do?", a: "Try refreshing or clearing your browser cache first. If the issue continues, reach out via the contact form below with your device and browser details so we can investigate." },
];

const categories = [
  { icon: UserCog, title: "Account & Billing", description: "Plans, upgrades, profile details, and login issues." },
  { icon: FileText, title: "Policies & Records", description: "Adding, editing, and tracking policy records of any type." },
  { icon: Wallet, title: "Payments & Referrals", description: "Referral wallet, withdrawals, and payment details." },
  { icon: Lock, title: "Security & Data", description: "How your data is protected, backed up, and accessed." },
  { icon: ShieldCheck, title: "Technical", description: "Bugs, loading issues, or anything not working as expected." },
];

const ticketStatusStyle: Record<string, string> = {
  open:        "bg-blue-100 text-blue-700 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-900",
  in_progress: "bg-amber-100 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900",
  resolved:    "bg-green-100 text-green-700 border border-green-200 dark:bg-green-950/40 dark:text-green-400 dark:border-green-900",
  closed:      "bg-gray-100 text-gray-600 border border-gray-200 dark:bg-muted dark:text-muted-foreground dark:border-border",
};

const suggestionStatusStyle: Record<string, string> = {
  new:          "bg-blue-100 text-blue-700 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-900",
  under_review: "bg-amber-100 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900",
  planned:      "bg-purple-100 text-purple-700 border border-purple-200 dark:bg-purple-950/40 dark:text-purple-400 dark:border-purple-900",
  implemented:  "bg-green-100 text-green-700 border border-green-200 dark:bg-green-950/40 dark:text-green-400 dark:border-green-900",
  declined:     "bg-gray-100 text-gray-600 border border-gray-200 dark:bg-muted dark:text-muted-foreground dark:border-border",
};

const fmt = (d?: string) => d
  ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
  : "—";

const HelpSupport = () => {
  const { toast } = useToast();
  const authenticated = isAuthenticated();
  const currentUser = getCurrentUser();

  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedValue(query, 300);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const [form, setForm] = useState({
    name: currentUser?.name ?? "",
    email: currentUser?.email ?? "",
    category: "Account & Billing",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const [myTickets, setMyTickets]     = useState<Ticket[]>([]);
  const [loadingTickets, setLoadingTickets] = useState(true);

  const [suggestForm, setSuggestForm] = useState({ title: "", message: "" });
  const [submittingSuggestion, setSubmittingSuggestion] = useState(false);
  const [mySuggestions, setMySuggestions] = useState<Suggestion[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(true);

  useEffect(() => {
    if (!authenticated) { setLoadingTickets(false); setLoadingSuggestions(false); return; }
    getMyTickets().then(setMyTickets).catch(() => {}).finally(() => setLoadingTickets(false));
    getMySuggestions().then(setMySuggestions).catch(() => {}).finally(() => setLoadingSuggestions(false));
  }, [authenticated]);

  const filteredFaqs = useMemo(() => {
    if (!debouncedQuery.trim()) return faqs;
    const q = debouncedQuery.trim().toLowerCase();
    return faqs.filter(
      (f) => f.q.toLowerCase().includes(q) || f.a.toLowerCase().includes(q) || f.category.toLowerCase().includes(q)
    );
  }, [debouncedQuery]);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  // Validate, then ask for a final confirmation before anything is actually sent —
  // this is the point where a typo'd email quietly breaks the whole follow-up loop.
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      toast({ title: "Missing details", description: "Please fill in your name, email, and message.", variant: "destructive" });
      return;
    }
    setConfirmOpen(true);
  };

  const confirmAndSend = async () => {
    setConfirmOpen(false);
    setSubmitting(true);
    try {
      const res = await createTicket(form);
      toast({ title: "Message sent", description: `Ticket ${res.data.ticketId} — our team will get back to you within a few hours.` });
      setForm({ name: currentUser?.name ?? "", email: currentUser?.email ?? "", category: "Account & Billing", message: "" });
      if (authenticated) getMyTickets().then(setMyTickets).catch(() => {});
    } catch (err: unknown) {
      const message = axios.isAxiosError(err)
        ? err.response?.data?.message || "Please try again, or email us directly."
        : "Please try again, or email us directly.";

      toast({
        title: "Something went wrong",
        description: message,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSuggestionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!suggestForm.title.trim() || !suggestForm.message.trim()) {
      toast({ title: "Missing details", description: "Please add a title and description.", variant: "destructive" });
      return;
    }
    setSubmittingSuggestion(true);
    try {
      await createSuggestion(suggestForm);
      toast({ title: "Thanks for the suggestion!", description: "Our team will review it." });
      setSuggestForm({ title: "", message: "" });
      getMySuggestions().then(setMySuggestions).catch(() => {});
    } catch (err: unknown) {
      const message = axios.isAxiosError(err)
        ? err.response?.data?.message || "Please try again."
        : "Please try again.";

      toast({
        title: "Something went wrong",
        description: message,
        variant: "destructive",
      });
    } finally {
      setSubmittingSuggestion(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEO
        title="Help & Support"
        description="Find answers to common questions, browse help topics, or contact our support team directly. Track your open tickets and suggestions in one place."
      />
      <Navigation />

      <main className="flex-1">

        {/* ══════════ HERO ══════════ */}
        <section className="relative bg-gradient-to-br from-form-header via-form-header to-form-subheader text-primary-foreground overflow-hidden">
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute bottom-0 left-1/3 w-64 h-64 rounded-full bg-primary/20 blur-3xl" />

          <div className="container mx-auto px-4 relative">
            <div className="max-w-3xl mx-auto text-center py-16 md:py-20 space-y-5">
              <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center mx-auto backdrop-blur-sm">
                <LifeBuoy className="w-7 h-7 text-primary-foreground" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold leading-tight tracking-tight">
                How can we help?
              </h1>
              <p className="text-lg text-primary-foreground/80 leading-relaxed max-w-xl mx-auto">
                Search our help articles, browse frequently asked questions, or reach the support
                team directly — most queries are answered within a few hours.
              </p>

              {/* Search */}
              <div className="relative max-w-md mx-auto pt-2">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search help articles…"
                  className="pl-11 h-12 bg-white text-[hsl(195,90%,15%)] border-0 shadow-lg"
                />
              </div>
            </div>
          </div>
        </section>

        {/* ══════════ TRUST STRIP ══════════ */}
        <section className="bg-form-subheader text-primary-foreground">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 divide-x divide-primary-foreground/15">
              {[
                { icon: Timer, value: "< few hrs", label: "Typical response time" },
                { icon: CheckCircle2, value: "0", label: "Queries pending overnight" },
                { icon: DatabaseBackup, value: "Daily", label: "Data backups" },
                { icon: ShieldCheck, value: "Any", label: "Policy type supported" },
              ].map(({ icon: Icon, value, label }) => (
                <div key={label} className="px-4 py-6 text-center">
                  <Icon className="w-4 h-4 mx-auto mb-1.5 text-primary-foreground/70" />
                  <p className="text-xl md:text-2xl font-bold">{value}</p>
                  <p className="text-xs text-primary-foreground/70 mt-1">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════ SUPPORT CHANNELS ══════════ */}
        <section className="bg-background py-16 md:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="text-center max-w-xl mx-auto mb-12">
                <p className="text-xs font-medium uppercase tracking-wider text-primary mb-2">Reach us directly</p>
                <h2 className="text-3xl font-bold text-form-header">Talk to a real person</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <a href={`mailto:${siteConfig.supportEmail}`} className="bg-muted/40 hover:bg-muted/70 rounded-2xl p-6 text-center transition-colors">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Mail className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-semibold text-form-header mb-1">Email us</h3>
                  <p className="text-sm text-muted-foreground break-words">{siteConfig.supportEmail}</p>
                </a>

                {/* NOTE: no live chat tool is wired up yet — update the href/onClick once one exists, or remove this card */}
                <div className="bg-muted/40 rounded-2xl p-6 text-center opacity-70">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <MessageCircle className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-semibold text-form-header mb-1">Live chat</h3>
                  <p className="text-sm text-muted-foreground">Coming soon</p>
                </div>

                {/* NOTE: placeholder — add a real support phone number, or remove this card */}
                <div className="bg-muted/40 rounded-2xl p-6 text-center opacity-70">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Phone className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-semibold text-form-header mb-1">Call us</h3>
                  <p className="text-sm text-muted-foreground">Number not yet published</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ══════════ QUICK HELP CATEGORIES ══════════ */}
        <section className="bg-muted/30 py-16 md:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="text-center max-w-xl mx-auto mb-12">
                <p className="text-xs font-medium uppercase tracking-wider text-primary mb-2">Browse by topic</p>
                <h2 className="text-3xl font-bold text-form-header">What do you need help with?</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {categories.map(({ icon: Icon, title, description }) => (
                  <button
                    key={title}
                    onClick={() => {
                      setQuery(title);
                      document.getElementById("faq")?.scrollIntoView({ behavior: "smooth", block: "start" });
                    }}
                    className="text-left bg-background border border-border rounded-2xl p-6 hover:shadow-md hover:border-primary/30 transition-all"
                  >
                    <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <h3 className="font-semibold text-form-header mb-1.5">{title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-primary mt-3">
                      View articles <ArrowRight className="w-3 h-3" />
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ══════════ FAQ — searchable accordion ══════════ */}
        <section id="faq" className="bg-background py-16 md:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <div className="text-center mb-10">
                <p className="text-xs font-medium uppercase tracking-wider text-primary mb-2">Frequently asked</p>
                <h2 className="text-3xl font-bold text-form-header">Common questions</h2>
                {query && (
                  <p className="text-sm text-muted-foreground mt-3">
                    {filteredFaqs.length} result{filteredFaqs.length !== 1 ? "s" : ""} for "{query}"
                    <button onClick={() => setQuery("")} className="text-primary hover:underline ml-2">Clear</button>
                  </p>
                )}
              </div>

              {filteredFaqs.length === 0 ? (
                <p className="text-center text-sm text-muted-foreground py-12">
                  No FAQs match "{query}". Try a different term, or send us a message below.
                </p>
              ) : (
                <div className="space-y-2.5">
                  {filteredFaqs.map((faq, i) => {
                    const isOpen = openFaq === i;
                    return (
                      <div key={i} className="border border-border rounded-xl overflow-hidden bg-background">
                        <button
                          onClick={() => setOpenFaq(isOpen ? null : i)}
                          className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left hover:bg-muted/40 transition-colors"
                        >
                          <div>
                            <span className="text-[10px] font-medium uppercase tracking-wide text-primary block mb-1">{faq.category}</span>
                            <span className="font-medium text-form-header text-sm">{faq.q}</span>
                          </div>
                          <ChevronDown className={`w-4 h-4 text-muted-foreground shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                        </button>
                        {isOpen && (
                          <div className="px-5 pb-4 text-sm text-muted-foreground leading-relaxed">
                            {faq.a}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ══════════ CONTACT FORM ══════════ */}
        <section className="bg-muted/30 py-16 md:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-10 items-start">

              <div className="lg:col-span-2 space-y-4">
                <p className="text-xs font-medium uppercase tracking-wider text-primary">Still stuck?</p>
                <h2 className="text-3xl font-bold text-form-header leading-tight">
                  Send us a message.
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  Tell us what's going on and we'll get back to you — usually within a few hours,
                  never left pending overnight.
                </p>
                <div className="flex items-start gap-3 bg-background rounded-xl p-4 border border-border">
                  <Clock className="w-4.5 h-4.5 text-primary mt-0.5 shrink-0" />
                  <div className="text-sm">
                    <p className="text-form-header font-medium mb-2">Support hours</p>
                    <p className="text-muted-foreground mb-1">Mon–Fri 9:00 AM – 9:00 PM</p>
                    <p className="text-muted-foreground">Sat-Sun 10:00 AM – 8:00 PM</p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Prefer email? Write to <a href={`mailto:${siteConfig.supportEmail}`} className="text-primary hover:underline">{siteConfig.supportEmail}</a> directly.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="lg:col-span-3 bg-background rounded-2xl border border-border p-6 md:p-8 space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="name" className="text-xs text-muted-foreground">Name</Label>
                    <Input id="name" name="name" value={form.name} onChange={handleFormChange} placeholder="Your name" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="email" className="text-xs text-muted-foreground">Email</Label>
                    <Input id="email" name="email" type="email" value={form.email} onChange={handleFormChange} placeholder="you@example.com" />
                    {!authenticated && (
                      <p className="text-xs text-muted-foreground">
                        Already registered on the platform? Use your registered email for faster replies and priority support.
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="category" className="text-xs text-muted-foreground">What's this about?</Label>
                  <select
                    id="category"
                    name="category"
                    value={form.category}
                    onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                  >
                    {categories.map((c) => (
                      <option key={c.title} value={c.title}>{c.title}</option>
                    ))}
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="message" className="text-xs text-muted-foreground">Message</Label>
                  <Textarea
                    id="message"
                    name="message"
                    value={form.message}
                    onChange={handleFormChange}
                    rows={5}
                    placeholder="Describe the issue or question in detail…"
                    className="resize-none"
                  />
                </div>

                <Button type="submit" disabled={submitting} className="bg-primary hover:bg-primary-light w-full sm:w-auto">
                  <Send className="w-4 h-4 mr-2" />
                  {submitting ? "Sending…" : "Send message"}
                </Button>

                {!authenticated && (
                  <p className="text-xs text-muted-foreground">
                    Already have an account? <Link to="/login" className="text-primary hover:underline">Log in</Link> to track this request from your profile.
                  </p>
                )}
              </form>

              <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Please confirm your details before sending</AlertDialogTitle>
                    <AlertDialogDescription>
                      Double-check that your email address is correct and your message is clear.
                      We reply to the email you provide — if it's mistyped or incorrect, you'll miss
                      our follow-up and we won't be able to reach you.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <div className="rounded-lg bg-muted/50 border border-border px-4 py-3 text-sm space-y-1">
                    <p><span className="text-muted-foreground">Name:</span> <span className="font-medium text-form-header">{form.name || "—"}</span></p>
                    <p><span className="text-muted-foreground">Email:</span> <span className="font-medium text-form-header">{form.email || "—"}</span></p>
                  </div>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Let me check again</AlertDialogCancel>
                    <AlertDialogAction onClick={confirmAndSend} className="bg-primary hover:bg-primary-light">
                      Looks good, send it
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </section>

        {/* ══════════ MY REQUESTS (logged-in only) ══════════ */}
        {authenticated && (
          <section className="bg-background py-16 md:py-20 border-t border-border">
            <div className="container mx-auto px-4">
              <div className="max-w-3xl mx-auto">
                <div className="text-center max-w-xl mx-auto mb-10">
                  <p className="text-xs font-medium uppercase tracking-wider text-primary mb-2">Your history</p>
                  <h2 className="text-3xl font-bold text-form-header">My requests</h2>
                  <p className="text-muted-foreground mt-2">Track every message you've sent us and its current status.</p>
                </div>

                {loadingTickets ? (
                  <p className="text-center text-sm text-muted-foreground py-8">Loading…</p>
                ) : !myTickets.length ? (
                  <p className="text-center text-sm text-muted-foreground py-8">
                    <Inbox className="w-6 h-6 mx-auto mb-2 text-muted-foreground/60" />
                    No requests yet — send us a message below if you need help.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {myTickets.map((t) => (
                      <Card key={t.ticketId}>
                        <CardHeader className="pb-2">
                          <div className="flex items-start justify-between flex-wrap gap-2">
                            <div>
                              <CardTitle className="text-sm font-mono">{t.ticketId}</CardTitle>
                              <p className="text-xs text-muted-foreground mt-1">{t.category} · {fmt(t.createdAt)}</p>
                            </div>
                            <Badge className={`text-xs ${ticketStatusStyle[t.status]}`}>{t.status.replace("_", " ")}</Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <p className="text-sm text-foreground">{t.message}</p>
                          {t.adminReply && (
                            <div className="bg-blue-50 border-l-2 border-blue-400 rounded px-3 py-2 mt-2">
                              <p className="text-[10px] uppercase text-blue-600 mb-1">Support reply</p>
                              <p className="text-sm text-blue-900 whitespace-pre-wrap">{t.adminReply}</p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* ══════════ SUGGESTIONS (logged-in users only) ══════════ */}
        {authenticated && (
          <section className="bg-muted/30 py-16 md:py-20">
            <div className="container mx-auto px-4">
              <div className="max-w-3xl mx-auto">
                <div className="text-center max-w-xl mx-auto mb-10">
                  <p className="text-xs font-medium uppercase tracking-wider text-primary mb-2">Have an idea?</p>
                  <h2 className="text-3xl font-bold text-form-header">Suggest a feature</h2>
                  <p className="text-muted-foreground mt-2">Tell us what would make the platform better for you.</p>
                </div>

                <form onSubmit={handleSuggestionSubmit} className="bg-background rounded-2xl border border-border p-6 md:p-8 space-y-4 mb-8">
                  <div className="space-y-1.5">
                    <Label htmlFor="suggestTitle" className="text-xs text-muted-foreground">Title</Label>
                    <Input
                      id="suggestTitle"
                      value={suggestForm.title}
                      onChange={(e) => setSuggestForm(p => ({ ...p, title: e.target.value }))}
                      placeholder="e.g. Dark mode for the dashboard"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="suggestMessage" className="text-xs text-muted-foreground">Details</Label>
                    <Textarea
                      id="suggestMessage"
                      rows={4}
                      value={suggestForm.message}
                      onChange={(e) => setSuggestForm(p => ({ ...p, message: e.target.value }))}
                      placeholder="What would this help you do?"
                      className="resize-none"
                    />
                  </div>
                  <Button type="submit" disabled={submittingSuggestion} className="bg-primary hover:bg-primary-light w-full sm:w-auto">
                    <Lightbulb className="w-4 h-4 mr-2" />
                    {submittingSuggestion ? "Sending…" : "Send suggestion"}
                  </Button>
                </form>

                {!loadingSuggestions && mySuggestions.length > 0 && (
                  <div className="space-y-3">
                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Your suggestions</p>
                    {mySuggestions.map((s) => (
                      <Card key={s._id}>
                        <CardHeader className="pb-2">
                          <div className="flex items-start justify-between flex-wrap gap-2">
                            <CardTitle className="text-sm">{s.title}</CardTitle>
                            <Badge className={`text-xs ${suggestionStatusStyle[s.status]}`}>{s.status.replace("_", " ")}</Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground">{s.message}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* ══════════ RESOURCES CTA ══════════ */}
        <section className="bg-[linear-gradient(to_bottom,#0a5b76,#0e7ca1,#0a5b76)] text-primary-foreground py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold mb-1">Looking for policy terms & codes?</h2>
                <p className="text-primary-foreground/90">Check the Insurance Abbreviations & Codes reference for quick lookups.</p>
              </div>
              <Link to="/lic-info-hub" className="shrink-0">
                <Button size="lg" className="bg-white text-[hsl(195,85%,25%)] hover:bg-white/90 font-medium">
                  <BookOpenText className="w-4 h-4 mr-2" />
                  Open reference
                </Button>
              </Link>
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
};

export default HelpSupport;