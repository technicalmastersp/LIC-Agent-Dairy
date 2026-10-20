import { useState, useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
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
  Wallet, FileText, Lock, UserCog, ArrowRight, Timer, DatabaseBackup,
  Lightbulb, Inbox, Calculator,
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import SEO from "@/components/SEO";
import RequestCallDialog from "@/components/RequestCallDialog";
import { BUSINESS_HOURS_LABELS } from "@/config/businessHours";
import siteConfig from "@/config/siteConfig";
import { REFERRAL_PROGRAM_ENABLED } from "@/config/featureFlags";
import { createTicket, getMyTickets } from "../../services/supportService";
import { createSuggestion, getMySuggestions } from "../../services/suggestionService";
import { getMyCallRequests } from "../../services/callRequestService";
import axios from "axios";
import type { TranslationKey } from "@/types/i18n.types";
import type { Ticket, Suggestion, FaqItem } from "@/types/pages/HelpSupport.types";
import type { CallRequestSummary } from "@/types/components/RequestCallDialog.types";
import { formatISTDate as fmt, formatISTDateTime } from "@/utils/dateFormat";
import { SensitiveValue } from "@/components/SensitiveValue";
import { useLanguage } from "@/hooks/useLanguage";
import Trans from "@/components/Trans";
import type { TFunction } from "@/types/i18n.types";
const buildAllFaqs = (t: TFunction): FaqItem[] => [
  { category: "Account & Billing", q: t('help.howDoIUpgrade'), a: REFERRAL_PROGRAM_ENABLED ? t('help.upgradeAnswerReferral') : t('help.upgradeAnswer') },
  { category: "Account & Billing", q: t('help.whatHappensWhenMyPlan'), a: t('help.yourRecordsStaySafe') },
  { category: "Account & Billing", q: t('help.whatIsYourCancellation'), a: t('help.plansAreOneTimePayments') },
  { category: "Account & Billing", q: t('help.canIChangeMyRegistered'), a: t('help.noYourNameAndEasy') },
  { category: "Account & Billing", q: t('help.canISwitchBetweenLight'), a: t('help.yesUseTheThemeToggle') },
  { category: "Account & Billing", q: t('help.canISeeMyAccount'), a: t('help.yesMyActivityShows') },
  { category: "Policies & Records", q: t('help.canIManagePoliciesOther'), a: t('help.yesThePlatformIsnT') },
  { category: "Policies & Records", q: t('help.howDoesDueDate'), a: t('help.everyPolicyWithAPayment') },
  { category: "Policies & Records", q: t('help.canIDeleteAPolicy'), a: t('help.recordDeletionIsCurrentlyDisabled') },
  { category: "Policies & Records", q: t('help.canICallOrWhatsapp'), a: t('help.yesOpenARecordFrom') },
  { category: "Policies & Records", q: t('help.canIUpdateAPayment'), a: t('help.yesFromTheMissedDue') },
  { category: "Payments & Referrals", q: t('help.howDoesTheReferralWallet'), a: t('help.youEarnRewardsForDirect') },
  { category: "Payments & Referrals", q: t('help.canIWithdrawMyReferral'), a: t('help.notAtTheMomentWithdrawals') },
  { category: "Payments & Referrals", q: t('help.iRequestedAWithdrawalBefore'), a: t('help.requestsMadeBeforeWithdrawalsWere') },
  { category: "Tools & Calculators", q: t('help.whatFreeCalculatorsAreAvailable'), a: t('help.nineCalculatorsAreAvailableFrom') },
  { category: "Tools & Calculators", q: t('help.whatSThePolicyNiketan'), a: t('help.itSASearchableReference') },
  { category: "Policies & Records", q: t('help.canIImportMyExisting'), a: t('help.yesOpenImportRecordsThen') },
  { category: "Policies & Records", q: t('help.canIExportMyRecords'), a: t('help.yesViewRecordsCanExport') },
  { category: "Policies & Records", q: t('help.whichInsuranceTypesCanI'), a: t('help.lifeTermLifeHealthFamily') },
  { category: "Policies & Records", q: t('help.canIReachAPolicyholder'), a: t('help.yesTheContactAction') },
  { category: "Security & Data", q: t('help.howAreAadhaarPan'), a: t('help.thoseFieldsAreEncryptedBefore') },
  { category: "Account & Billing", q: t('help.whatRemindersWillIGet'), a: t('help.theBellIconShows') },
  { category: "Technical", q: t('help.canIInstall'), a: t('help.yesItIsAnInstallable') },
  { category: "Security & Data", q: t('help.isThereProtectionAgainstSomeone'), a: t('help.yesAfterSeveralWrongPasswords') },
  { category: "Security & Data", q: t('help.isMyPolicyholderDataBacked'), a: t('help.yesRecordsAreBackedUp') },
  { category: "Security & Data", q: t('help.whoCanSeeSensitiveFields'), a: t('help.onlyYouAndAdminsActing') },
  { category: "Account & Billing", q: t('help.canITalkToSomeone'), a: t('help.yesUseRequestACall') },
  { category: "Account & Billing", q: t('help.whenWillIGet'), a: t('help.ifYouRequestDuringBusiness') },
  { category: "Technical", q: t('help.theSiteIsnTLoading'), a: t('help.tryRefreshingOrClearing') },
  { category: "Technical", q: t('help.iSawAShortWalkthrough'), a: t('help.aShortGuidedTourAppears') },
];

// While the referral program is off, its FAQs and category are hidden and a
// single explanatory entry is shown instead (existing users may still have
// a balance and wonder what happened to it).
const REFERRAL_CATEGORY = "Payments & Referrals";
const buildReferralOffFaq = (t: TFunction): FaqItem => ({
  category: "Account & Billing",
  q: t('help.isThereAReferralProgram'),
  a: t('help.notAtTheMomentReferral'),
});

// `id` values are identifiers (stored on support tickets, compared with REFERRAL_CATEGORY): they stay
// English in every language. Only the labels shown to the user are translated, via this map.
const CATEGORY_LABEL: Record<string, TranslationKey> = {
  "Account & Billing": "help.topicAccountBilling",
  "Policies & Records": "help.topicPoliciesRecords",
  "Payments & Referrals": "help.topicPaymentsReferrals",
  "Tools & Calculators": "help.topicToolsCalculators",
  "Security & Data": "help.topicSecurityData",
  "Technical": "help.topicTechnical",
};

const buildAllCategories = (t: TFunction) => [
  { icon: UserCog, id: "Account & Billing", description: t('help.plansUpgradesProfileDetails') },
  { icon: FileText, id: "Policies & Records", description: t('help.addingEditingAndTrackingPolicy') },
  { icon: Wallet, id: "Payments & Referrals", description: t('help.referralWalletRewardsAndPlan') },
  { icon: Calculator, id: "Tools & Calculators", description: t('help.freeCalculatorsAndTheInsurance') },
  { icon: Lock, id: "Security & Data", description: t('help.howYourDataIsProtected') },
  { icon: ShieldCheck, id: "Technical", description: t('help.bugsLoadingIssuesOrAnything') },
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

const buildCallStatusStyle = (t: TFunction): Record<CallRequestSummary["status"], { label: string; cls: string }> => ({
  pending:   { label: t('help.queued'),             cls: "bg-blue-100 text-blue-700 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-900" },
  no_answer: { label: t('help.triedNoAnswer'),  cls: "bg-amber-100 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900" },
  completed: { label: t('help.called'),             cls: "bg-green-100 text-green-700 border border-green-200 dark:bg-green-950/40 dark:text-green-400 dark:border-green-900" },
  cancelled: { label: t('help.closed'),             cls: "bg-gray-100 text-gray-600 border border-gray-200 dark:bg-muted dark:text-muted-foreground dark:border-border" },
});

// (date formatting now imported from dateFormat.ts as `fmt`)

const HelpSupport = () => {
  const { t } = useLanguage();
  const ALL_FAQS = useMemo(() => buildAllFaqs(t), [t]);
  const REFERRAL_OFF_FAQ = useMemo(() => buildReferralOffFaq(t), [t]);
  const ALL_CATEGORIES = useMemo(() => buildAllCategories(t), [t]);
  const catLabel = (id: string) => (CATEGORY_LABEL[id] ? t(CATEGORY_LABEL[id]) : id);
  // While the referral program is off, its FAQs and category are hidden and a single explanatory
  // entry is shown instead (existing users may still have a balance and wonder what happened to it).
  const faqs: FaqItem[] = useMemo(() => [
    ...ALL_FAQS.filter((f) => REFERRAL_PROGRAM_ENABLED || f.category !== REFERRAL_CATEGORY),
    ...(REFERRAL_PROGRAM_ENABLED ? [] : [REFERRAL_OFF_FAQ]),
  ], [ALL_FAQS, REFERRAL_OFF_FAQ]);
  const categories = useMemo(
    () => ALL_CATEGORIES.filter((c) => REFERRAL_PROGRAM_ENABLED || c.id !== REFERRAL_CATEGORY),
    [ALL_CATEGORIES],
  );
  const callStatusStyle = useMemo(() => buildCallStatusStyle(t), [t]);
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

  // "Request a call" dialog. Opening /help-support#request-call (linked from the
  // footer, Contact, About and the legal pages) opens it straight away.
  const location = useLocation();
  const [callOpen, setCallOpen] = useState(false);
  const [myCalls, setMyCalls] = useState<CallRequestSummary[]>([]);
  const refreshMyCalls = () => { if (authenticated) getMyCallRequests().then(setMyCalls).catch(() => {}); };

  useEffect(() => {
    if (location.hash === "#request-call") {
      document.getElementById("request-call")?.scrollIntoView({ behavior: "smooth", block: "center" });
      setCallOpen(true);
    }
  }, [location.hash]);

  useEffect(() => {
    if (!authenticated) { setLoadingTickets(false); setLoadingSuggestions(false); return; }
    getMyTickets().then(setMyTickets).catch(() => {}).finally(() => setLoadingTickets(false));
    getMySuggestions().then(setMySuggestions).catch(() => {}).finally(() => setLoadingSuggestions(false));
    refreshMyCalls();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authenticated]);

  const filteredFaqs = useMemo(() => {
    if (!debouncedQuery.trim()) return faqs;
    const q = debouncedQuery.trim().toLowerCase();
    return faqs.filter(
      (f) => f.q.toLowerCase().includes(q) || f.a.toLowerCase().includes(q) || f.category.toLowerCase().includes(q) || catLabel(f.category).toLowerCase().includes(q)
    );
  }, [debouncedQuery, faqs, t]);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  // Validate, then ask for a final confirmation before anything is actually sent —
  // this is the point where a typo'd email quietly breaks the whole follow-up loop.
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      toast({ title: t('help.missingDetails'), description: t('help.pleaseFillInYourName'), variant: "destructive" });
      return;
    }
    setConfirmOpen(true);
  };

  const confirmAndSend = async () => {
    setConfirmOpen(false);
    setSubmitting(true);
    try {
      const res = await createTicket(form);
      toast({ title: t('help.messageSent'), description: t('help.ticketOurTeamWillGet', { ticketId: res.data.ticketId }) });
      setForm({ name: currentUser?.name ?? "", email: currentUser?.email ?? "", category: "Account & Billing", message: "" });
      if (authenticated) getMyTickets().then(setMyTickets).catch(() => {});
    } catch (err: unknown) {
      const message = axios.isAxiosError(err)
        ? err.response?.data?.message || t('help.pleaseTryAgainOrEmail')
        : t('help.pleaseTryAgainOrEmail');

      toast({
        title: t('help.somethingWentWrong'),
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
      toast({ title: t('help.missingDetails'), description: t('help.pleaseAddATitle'), variant: "destructive" });
      return;
    }
    setSubmittingSuggestion(true);
    try {
      await createSuggestion(suggestForm);
      toast({ title: t('help.thanksForTheSuggestion'), description: t('help.ourTeamWillReview') });
      setSuggestForm({ title: "", message: "" });
      getMySuggestions().then(setMySuggestions).catch(() => {});
    } catch (err: unknown) {
      const message = axios.isAxiosError(err)
        ? err.response?.data?.message || t('help.pleaseTryAgain')
        : t('help.pleaseTryAgain');

      toast({
        title: t('help.somethingWentWrong'),
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
        title={t('common.helpSupport')}
        description={t('help.findAnswersToCommonQuestions')}
        path="/help-support"
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
                {t('help.howCanWeHelp')}
              </h1>
              <p className="text-lg text-primary-foreground/80 leading-relaxed max-w-xl mx-auto">
                {t('help.searchOurHelpArticlesBrowse')}
              </p>

              {/* Search */}
              <div className="relative max-w-md mx-auto pt-2">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={t('help.searchHelpArticles')}
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
                { icon: Timer, value: "< few hrs", label: t('help.typicalResponseTime') },
                { icon: CheckCircle2, value: "0", label: t('help.queriesPendingOvernight') },
                { icon: DatabaseBackup, value: "Daily", label: t('help.dataBackups') },
                { icon: ShieldCheck, value: "Any", label: t('help.policyTypeSupported') },
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
                <p className="text-xs font-medium uppercase tracking-wider text-primary mb-2">{t('help.reachUsDirectly')}</p>
                <h2 className="text-3xl font-bold text-form-header">{t('help.talkToARealPerson')}</h2>
              </div>

              <div className={`grid grid-cols-1 gap-5 ${siteConfig.features.liveChat ? "sm:grid-cols-3" : "sm:grid-cols-2 max-w-3xl mx-auto"}`}>
                <a href={`mailto:${siteConfig.supportEmail}`} className="bg-muted/40 hover:bg-muted/70 rounded-2xl p-6 text-center transition-colors">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Mail className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-semibold text-form-header mb-1">{t('help.emailUs')}</h3>
                  <p className="text-sm text-muted-foreground break-words">{siteConfig.supportEmail}</p>
                </a>

                {/* Request a call — no public number; the team calls back in business hours */}
                <RequestCallDialog
                  open={callOpen}
                  onOpenChange={setCallOpen}
                  onSubmitted={refreshMyCalls}
                  trigger={
                    <button
                      id="request-call"
                      type="button"
                      className="bg-muted/40 hover:bg-muted/70 rounded-2xl p-6 text-center transition-colors w-full"
                    >
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                        <Phone className="w-5 h-5 text-primary" />
                      </div>
                      <h3 className="font-semibold text-form-header mb-1">{t('common.requestACall')}</h3>
                      <p className="text-sm text-muted-foreground">{t('help.weLlCallYouBack')}</p>
                    </button>
                  }
                />

                {/* Live chat is hidden for now — set siteConfig.features.liveChat = true
                    (and wire a real chat tool into this card) to bring it back. */}
                {siteConfig.features.liveChat && (
                  <div className="bg-muted/40 rounded-2xl p-6 text-center opacity-70">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <MessageCircle className="w-5 h-5 text-primary" />
                    </div>
                    <h3 className="font-semibold text-form-header mb-1">{t('help.liveChat')}</h3>
                    <p className="text-sm text-muted-foreground">{t('help.comingSoon')}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ══════════ QUICK HELP CATEGORIES ══════════ */}
        <section className="bg-muted/30 py-16 md:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="text-center max-w-xl mx-auto mb-12">
                <p className="text-xs font-medium uppercase tracking-wider text-primary mb-2">{t('help.browseByTopic')}</p>
                <h2 className="text-3xl font-bold text-form-header">{t('help.whatDoYouNeedHelp')}</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {categories.map(({ icon: Icon, id, description }) => (
                  <button
                    key={id}
                    onClick={() => {
                      setQuery(catLabel(id));
                      document.getElementById("faq")?.scrollIntoView({ behavior: "smooth", block: "start" });
                    }}
                    className="text-left bg-background border border-border rounded-2xl p-6 hover:shadow-md hover:border-primary/30 transition-all"
                  >
                    <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <h3 className="font-semibold text-form-header mb-1.5">{catLabel(id)}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-primary mt-3">
                      {t('help.viewArticles')}{" "} <ArrowRight className="w-3 h-3" />
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
                <p className="text-xs font-medium uppercase tracking-wider text-primary mb-2">{t('help.frequentlyAsked')}</p>
                <h2 className="text-3xl font-bold text-form-header">{t('help.commonQuestions')}</h2>
                {query && (
                  <p className="text-sm text-muted-foreground mt-3">
                    <Trans i18nKey="help.resultForClear" params={{ count: filteredFaqs.length, query }} components={{ button: <button onClick={() => setQuery("")} className="text-primary hover:underline ml-2" /> }} /></p>
                )}
              </div>

              {filteredFaqs.length === 0 ? (
                <p className="text-center text-sm text-muted-foreground py-12">
                  {t('help.noFaqsMatchTry', { query })}
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
                            <span className="text-[10px] font-medium uppercase tracking-wide text-primary block mb-1">{catLabel(faq.category)}</span>
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
                <p className="text-xs font-medium uppercase tracking-wider text-primary">{t('help.stillStuck')}</p>
                <h2 className="text-3xl font-bold text-form-header leading-tight">
                  {t('help.sendUsAMessage')}
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  {t('help.tellUsWhatSGoing')}
                </p>
                <div className="flex items-start gap-3 bg-background rounded-xl p-4 border border-border">
                  <Clock className="w-4.5 h-4.5 text-primary mt-0.5 shrink-0" />
                  <div className="text-sm">
                    <p className="text-form-header font-medium mb-2">{t('help.supportHours')}</p>
                    {BUSINESS_HOURS_LABELS.map((l) => (
                      <p key={l.days} className="text-muted-foreground mb-1 last:mb-0">{t(l.days)} {t(l.hours)}</p>
                    ))}
                    <p className="text-xs text-muted-foreground mt-2">{t('help.allTimesIstCallbacks')}</p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  <Trans i18nKey="help.preferEmailWriteToDirectly" params={{ supportEmail: siteConfig.supportEmail }} components={{ link: <a href={`mailto:${siteConfig.supportEmail}`} className="text-primary hover:underline" /> }} />
                </p>
                <p className="text-xs text-muted-foreground">
                  <Trans i18nKey="help.ratherTalkItThroughRequest" components={{ button: <button type="button" onClick={() => setCallOpen(true)} className="text-primary hover:underline" /> }} />
                </p>
              </div>

              <form onSubmit={handleSubmit} className="lg:col-span-3 bg-background rounded-2xl border border-border p-6 md:p-8 space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="name" className="text-xs text-muted-foreground">{t('common.name')}</Label>
                    <Input id="name" name="name" value={form.name} onChange={handleFormChange} placeholder={t('help.yourName')} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="email" className="text-xs text-muted-foreground">{t('common.email2')}</Label>
                    <Input id="email" name="email" type="email" value={form.email} onChange={handleFormChange} placeholder="you@example.com" />
                    {!authenticated && (
                      <p className="text-xs text-muted-foreground">
                        {t('help.alreadyRegisteredOnThePlatform')}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="category" className="text-xs text-muted-foreground">{t('help.whatSThisAbout')}</Label>
                  <select
                    id="category"
                    name="category"
                    value={form.category}
                    onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{catLabel(c.id)}</option>
                    ))}
                    <option value="Other">{t('help.topicOther')}</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="message" className="text-xs text-muted-foreground">{t('help.message')}</Label>
                  <Textarea
                    id="message"
                    name="message"
                    value={form.message}
                    onChange={handleFormChange}
                    rows={5}
                    placeholder={t('help.describeTheIssueOrQuestion')}
                    className="resize-none"
                  />
                </div>

                <Button type="submit" disabled={submitting} className="bg-primary hover:bg-primary-light w-full sm:w-auto">
                  <Send className="w-4 h-4 mr-2" />
                  {submitting ? t('help.sending') : t('help.sendMessage')}
                </Button>

                {!authenticated && (
                  <p className="text-xs text-muted-foreground">
                    <Trans i18nKey="help.alreadyHaveAnAccountLog" components={{ link: <Link to="/login" className="text-primary hover:underline" /> }} />
                  </p>
                )}
              </form>

              <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>{t('help.pleaseConfirmYourDetailsBefore')}</AlertDialogTitle>
                    <AlertDialogDescription>
                      {t('help.doubleCheckThatYourEmail')}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <div className="rounded-lg bg-muted/50 border border-border px-4 py-3 text-sm space-y-1">
                    <p><span className="text-muted-foreground">{t('help.name')}</span> <span className="font-medium text-form-header">{form.name || "—"}</span></p>
                    <p><span className="text-muted-foreground">{t('help.email')}</span> <span className="font-medium text-form-header"><SensitiveValue field="email" value={form.email} /></span></p>
                  </div>
                  <AlertDialogFooter>
                    <AlertDialogCancel>{t('help.letMeCheckAgain')}</AlertDialogCancel>
                    <AlertDialogAction onClick={confirmAndSend} className="bg-primary hover:bg-primary-light">
                      {t('help.looksGoodSend')}
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
                  <p className="text-xs font-medium uppercase tracking-wider text-primary mb-2">{t('help.yourHistory')}</p>
                  <h2 className="text-3xl font-bold text-form-header">{t('help.myRequests')}</h2>
                  <p className="text-muted-foreground mt-2">{t('help.trackEveryMessageYouVe')}</p>
                </div>

                {loadingTickets ? (
                  <p className="text-center text-sm text-muted-foreground py-8">{t('common.loading2')}</p>
                ) : !myTickets.length ? (
                  <p className="text-center text-sm text-muted-foreground py-8">
                    <Inbox className="w-6 h-6 mx-auto mb-2 text-muted-foreground/60" />
                    {t('help.noRequestsYetSendUs')}
                  </p>
                ) : (
                  <div className="space-y-3">
                    {myTickets.map((tk) => (
                      <Card key={tk.ticketId}>
                        <CardHeader className="pb-2">
                          <div className="flex items-start justify-between flex-wrap gap-2">
                            <div>
                              <CardTitle className="text-sm font-mono">{tk.ticketId}</CardTitle>
                              <p className="text-xs text-muted-foreground mt-1">{tk.category} · {fmt(tk.createdAt)}</p>
                            </div>
                            <Badge className={`text-xs ${ticketStatusStyle[tk.status]}`}>{tk.status.replace("_", " ")}</Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <p className="text-sm text-foreground">{tk.message}</p>
                          {tk.adminReply && (
                            <div className="bg-blue-50 border-l-2 border-blue-400 rounded px-3 py-2 mt-2">
                              <p className="text-[10px] uppercase text-blue-600 mb-1">{t('help.supportReply')}</p>
                              <p className="text-sm text-blue-900 whitespace-pre-wrap">{tk.adminReply}</p>
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

        {/* ══════════ MY CALL REQUESTS (logged-in only, when any exist) ══════════ */}
        {authenticated && myCalls.length > 0 && (
          <section className="bg-background py-12 border-t border-border">
            <div className="container mx-auto px-4">
              <div className="max-w-3xl mx-auto">
                <div className="text-center max-w-xl mx-auto mb-8">
                  <p className="text-xs font-medium uppercase tracking-wider text-primary mb-2">{t('help.callbacks')}</p>
                  <h2 className="text-2xl font-bold text-form-header">{t('help.myCallRequests')}</h2>
                </div>
                <div className="space-y-3">
                  {myCalls.map((c) => (
                    <Card key={c.requestId}>
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between flex-wrap gap-2">
                          <div>
                            <CardTitle className="text-sm font-mono">{c.requestId}</CardTitle>
                            <p className="text-xs text-muted-foreground mt-1">
                              {c.category} · {fmt(c.createdAt)} · +91 <SensitiveValue field="mobileNumber" value={c.phone} />
                            </p>
                          </div>
                          <Badge className={`text-xs ${callStatusStyle[c.status].cls}`}>{callStatusStyle[c.status].label}</Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-1">
                        <p className="text-sm text-foreground">{c.reason}</p>
                        {(c.status === "pending" || c.status === "no_answer") && c.expectedCallFrom && (
                          <p className="text-xs text-muted-foreground">
                            {t('help.expectedCallFromDuringBusiness', { value: formatISTDateTime(c.expectedCallFrom) })}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
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
                  <p className="text-xs font-medium uppercase tracking-wider text-primary mb-2">{t('help.haveAnIdea')}</p>
                  <h2 className="text-3xl font-bold text-form-header">{t('help.suggestAFeature')}</h2>
                  <p className="text-muted-foreground mt-2">{t('help.tellUsWhatWouldMake')}</p>
                </div>

                <form onSubmit={handleSuggestionSubmit} className="bg-background rounded-2xl border border-border p-6 md:p-8 space-y-4 mb-8">
                  <div className="space-y-1.5">
                    <Label htmlFor="suggestTitle" className="text-xs text-muted-foreground">{t('help.title')}</Label>
                    <Input
                      id="suggestTitle"
                      value={suggestForm.title}
                      onChange={(e) => setSuggestForm(p => ({ ...p, title: e.target.value }))}
                      placeholder={t('help.eGDarkMode')}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="suggestMessage" className="text-xs text-muted-foreground">{t('common.details')}</Label>
                    <Textarea
                      id="suggestMessage"
                      rows={4}
                      value={suggestForm.message}
                      onChange={(e) => setSuggestForm(p => ({ ...p, message: e.target.value }))}
                      placeholder={t('help.whatWouldThisHelp')}
                      className="resize-none"
                    />
                  </div>
                  <Button type="submit" disabled={submittingSuggestion} className="bg-primary hover:bg-primary-light w-full sm:w-auto">
                    <Lightbulb className="w-4 h-4 mr-2" />
                    {submittingSuggestion ? t('help.sending') : t('help.sendSuggestion')}
                  </Button>
                </form>

                {!loadingSuggestions && mySuggestions.length > 0 && (
                  <div className="space-y-3">
                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{t('help.yourSuggestions')}</p>
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
                <h2 className="text-2xl md:text-3xl font-bold mb-1">{t('help.lookingForPolicyTermsCodes')}</h2>
                <p className="text-primary-foreground/90">{t('help.checkTheInsuranceAbbreviationsCodes')}</p>
              </div>
              <Link to="/policy-niketan-info-hub" className="shrink-0">
                <Button size="lg" className="bg-white text-[hsl(195,85%,25%)] hover:bg-white/90 font-medium">
                  <BookOpenText className="w-4 h-4 mr-2" />
                  {t('help.openReference')}
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