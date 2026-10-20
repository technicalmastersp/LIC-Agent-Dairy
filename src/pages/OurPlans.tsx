import { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Check, Sparkles, Star, Award, Crown, ShieldCheck, Wallet as WalletIcon, RefreshCw, Gift, AlertTriangle, Info, type LucideIcon } from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { getCurrentUser, setCurrentUser } from "@/utils/auth";
import { useToast } from "@/hooks/use-toast";
import { changePlan, createCheckoutOrder, verifyPayment, getSubscription } from "../../services/subscriptionService";
import { getReferralConfig } from "../../services/configService";
import { getProfile } from "../../services/userService";
import { getReferralDashboard } from "../../services/referralService";
import { REFERRAL_PROGRAM_ENABLED } from "@/config/featureFlags";
import { signupPathForPlan } from "@/config/plans";
import { openRazorpayCheckout } from "@/utils/razorpayCheckout";
import SEO from "@/components/SEO";
import type { Plan } from "@/types/pages/OurPlans.types";
import { useLanguage } from "@/hooks/useLanguage";
import Trans from "@/components/Trans";

const OurPlans = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedPlan, setSelectedPlan] = useState<string>("");
  // Tracks which plan's checkout is currently in flight so Select Plan /
  // Complete Payment can't be double-clicked into firing a second
  // Razorpay checkout or a second verifyPayment call.
  const [processingPlanId, setProcessingPlanId] = useState<string | null>(null);
  const [referralConfig, setReferralConfig] = useState({ SIGNUP_DISCOUNT_AMOUNT: 100 });
  const [walletBalance, setWalletBalance] = useState(0);
  const [useWallet, setUseWallet] = useState(false);
  const [walletAmountInput, setWalletAmountInput] = useState("");

  // Seeded from cache for instant paint, then overwritten below by a live
  // fetch — otherwise a page refresh never leaves the browser and a payment
  // that succeeded server-side (e.g. verify call was lost) never shows here.
  const [currentUser, setLocalCurrentUser] = useState(getCurrentUser());

  const [searchParams] = useSearchParams();
  const reason = searchParams.get("reason");

  const allPlans: Plan[] = [
    {
      id: "1month-free",
      planType: "Free",
      duration: "1 Month",
      price: 0,
      originalPrice: 299,
      features: [
        t('plans.onlyForNewUsers'),
        t('plans.accessToAllFeatures'),
        t('plans.n1MonthValidity'),
        t('plans.emailSupport'),
        t('plans.regularUpdates')
      ]
    },
    {
      id: "1month",
      planType: "Starter",
      duration: "1 Month",
      price: 249,
      originalPrice: 299,
      features: [
        t('plans.accessToAllFeatures'),
        t('plans.n1MonthValidity'),
        t('plans.emailSupport'),
        t('plans.regularUpdates')
      ]
    },
    {
      id: "3months",
      planType: "Basic",
      duration: "3 Months",
      price: 599,
      originalPrice: 899,
      features: [
        t('plans.accessToAllFeatures'),
        t('plans.n3MonthsValidity'),
        t('plans.emailSupport'),
        t('plans.regularUpdates')
      ]
    },
    {
      id: "6months",
      planType: "Standard",
      duration: "6 Months",
      price: 1099,
      originalPrice: 1599,
      popular: true,
      features: [
        t('plans.accessToAllFeatures'),
        t('plans.n6MonthsValidity'),
        t('plans.priorityEmailSupport'),
        t('plans.regularUpdates'),
        t('plans.extendedStorage')
      ]
    },
    {
      id: "12months",
      planType: "Premium",
      duration: "12 Months",
      price: 2099,
      originalPrice: 2999,
      features: [
        t('plans.accessToAllFeatures'),
        t('plans.n12MonthsValidity'),
        t('plans.n247PrioritySupport'),
        t('plans.regularUpdates'),
        t('plans.unlimitedStorage'),
        t('plans.advancedAnalytics')
      ]
    }
  ];

  // The free trial is signup-only. Hide the Free card once it can't be selected, rather than
  // blocking it after the fact: the backend refuses with 403 FREE_TRIAL_INELIGIBLE whenever the
  // account's `isFreeTrial` flag is set (it is sticky — an expired trial keeps planId
  // "1month-free"), so for those users the button could only ever show an error.
  const sub = currentUser?.subscription as { planId?: string; isFreeTrial?: boolean } | undefined;
  const hasHadPaidPlan = !!sub && (sub.planId !== "1month-free" || sub.isFreeTrial === true);
  const plans = allPlans.filter(p => p.id !== "1month-free" || !hasHadPaidPlan);

  const handleSelectPlan = async (planId: string) => {
    if (processingPlanId) return; // already checking out a plan — ignore extra clicks
    if (!currentUser) { navigate(signupPathForPlan(planId)); return; }
    if (currentUser.role === "admin" || currentUser.role === "superadmin") {
      toast({ title: t('plans.notApplicable'), description: t('plans.adminAccountsDonTUse') });
      return;
    }

    const plan = plans.find(p => p.id === planId);
    setProcessingPlanId(planId);

    try {
      if (!plan || plan.price === 0) {
        // Free plan — unchanged direct-activation path
        await changePlan(planId);
        toast({ title: t('plans.planActivated'), description: t('plans.yourPlanHasBeenUpdated') });
        navigate("/");
        return;
      }

      // Paid plan — apply wallet balance first (server clamps to real
      // balance + plan price regardless of what's requested here)
      const walletToApply = REFERRAL_PROGRAM_ENABLED && useWallet ? Number(walletAmountInput) || 0 : 0;
      const order = await createCheckoutOrder(planId, walletToApply);

      if (order.walletCovered) {
        // Fully paid from wallet — no Razorpay modal needed at all
        const freshProfile = await getProfile();
        setCurrentUser(freshProfile);
        setLocalCurrentUser(freshProfile);
        toast({ title: t('plans.planActivated'), description: t('plans.fullyCoveredByYourReferral') });
        navigate("/");
        return;
      }

      const paymentResponse = await openRazorpayCheckout({
        order,
        userName: currentUser?.name,
        userEmail: currentUser?.email,
        userContact: currentUser?.mobileNumber,
        onFailure: () =>
          toast({
            title: t('plans.paymentAttemptFailed'),
            description: t('plans.youCanRetry'),
            variant: "destructive",
          }),
      });

      await verifyPayment(paymentResponse);

      // Refresh the cached profile so the "Active Plan" badge updates immediately
      const freshProfile = await getProfile();
      setCurrentUser(freshProfile);
      setLocalCurrentUser(freshProfile);

      toast({ title: t('plans.paymentSuccessful'), description: t('plans.yourPlanHasBeenActivated') });
      navigate("/");
    } catch (err: unknown) {
      if (err instanceof Error && err.message === "PAYMENT_CANCELLED") {
        toast({ title: t('plans.paymentCancelled'), description: t('plans.youCanTryAgainAnytime') });
        return;
      }
      if (err instanceof Error && err.message === "PAYMENT_FAILED") {
        toast({ title: t('plans.paymentFailed'), description: t('plans.yourPaymentCouldNot'), variant: "destructive" });
        return;
      }
      // Every axios error has already been toasted (or redirected) by apiClient's global
      // interceptor — toasting again here showed users the same message twice.
      if (axios.isAxiosError(err)) return;
      toast({ title: t('plans.error'), description: t('plans.somethingWentWrong'), variant: "destructive" });
    } finally {
      setProcessingPlanId(null);
    }
  };

  useEffect(() => {
    if (!REFERRAL_PROGRAM_ENABLED) return;
    getReferralConfig()
      .then((c) => { if (c && typeof c === "object") setReferralConfig(c); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!REFERRAL_PROGRAM_ENABLED || !currentUser) return;
    getReferralDashboard().then(d => setWalletBalance(d.availableBalance ?? 0)).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // On every mount (including a hard refresh) — fetch subscription state
  // live from the server. If it's stuck "pending_payment", getSubscription()
  // triggers the backend's Razorpay reconciliation before returning, so a
  // payment that succeeded but never got verified client-side self-heals here.
  useEffect(() => {
    if (!currentUser) return;
    getSubscription()
      .then((sub) => {
        const merged = { ...currentUser, subscription: sub };
        setCurrentUser(merged);
        setLocalCurrentUser(merged);
      })
      .catch(() => {}); // not fatal — page still works off cached state
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const planStyle: Record<string, { icon: LucideIcon; accent: string; iconBg: string }> = {
    Free: { icon: Gift, accent: "text-emerald-600 dark:text-emerald-400", iconBg: "bg-emerald-100 dark:bg-emerald-950/40" },
    Starter: { icon: Star, accent: "text-blue-600 dark:text-blue-400", iconBg: "bg-blue-100 dark:bg-blue-950/40" },
    Basic: { icon: ShieldCheck, accent: "text-violet-600 dark:text-violet-400", iconBg: "bg-violet-100 dark:bg-violet-950/40" },
    Standard: { icon: Award, accent: "text-amber-600 dark:text-amber-400", iconBg: "bg-amber-100 dark:bg-amber-950/40" },
    Premium: { icon: Crown, accent: "text-rose-600 dark:text-rose-400", iconBg: "bg-rose-100 dark:bg-rose-950/40" },
  };

  // "Save more with longer plans" table — derived from allPlans so it can never disagree
  // with the cards above. Per-month cost = price ÷ months, rounded to the nearest rupee.
  const VALUE_PLAN_IDS = ["1month", "3months", "6months", "12months"];
  const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;
  const valueRows = allPlans
    .filter((p) => VALUE_PLAN_IDS.includes(p.id))
    .map((p) => {
      const months = parseInt(p.duration, 10) || 1;
      const original = p.originalPrice ?? p.price;
      return {
        id: p.id,
        label: `${p.duration} (${p.planType} Plan)`,
        price: p.price,
        original,
        saving: original - p.price,
        perMonth: Math.round(p.price / months),
        popular: !!p.popular,
      };
    });

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEO
        title={t('plans.subscriptionPlansPricing')}
        description={t('plans.comparePolicyNiketanSubscriptionPlans')}
        path="/our-plans"
      />
      <Navigation />

      <main className="flex-1 container mx-auto px-4 py-10 md:py-14">
        {reason === "expired" && (
          <div className="flex items-start gap-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-400 text-sm rounded-xl p-4 mb-8 max-w-3xl mx-auto">
            <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
            <p>{t('plans.yourSubscriptionHasExpiredPlease')}</p>
          </div>
        )}
        {reason === "no-plan" && (
          <div className="flex items-start gap-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 text-amber-700 dark:text-amber-400 text-sm rounded-xl p-4 mb-8 max-w-3xl mx-auto">
            <Info className="w-5 h-5 shrink-0 mt-0.5" />
            <p>{t('plans.pleaseChooseAPlan')}</p>
          </div>
        )}

        {/* Hero */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 mb-5">
            <Sparkles className="w-7 h-7 text-primary" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-form-header mb-3">{t('plans.chooseYourPlan')}</h1>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
            {t('plans.fromAFreeTrial')}
          </p>

          {/* Trust strip */}
          <div className="flex flex-wrap justify-center gap-2 mt-6">
            {[
              { icon: ShieldCheck, label: t('plans.secureRazorpayCheckout') },
              ...(REFERRAL_PROGRAM_ENABLED ? [{ icon: WalletIcon, label: t('plans.useYourReferralWallet') }] : []),
              { icon: RefreshCw, label: t('plans.upgradeOrRenewAnyTime') },
            ].map(({ icon: Icon, label }) => (
              <span
                key={label}
                className="inline-flex items-center gap-1.5 text-xs font-medium bg-muted text-muted-foreground px-3 py-1.5 rounded-full"
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </span>
            ))}
          </div>
        </div>

        {REFERRAL_PROGRAM_ENABLED && currentUser && walletBalance > 0 && (
          <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 rounded-xl p-4 mb-6 max-w-md mx-auto">
            <label className="flex items-center gap-2 text-sm font-medium text-blue-900 dark:text-blue-300">
              <input
                type="checkbox"
                checked={useWallet}
                onChange={(e) => { setUseWallet(e.target.checked); setWalletAmountInput(String(walletBalance)); }}
                className="accent-primary"
              />
              <WalletIcon className="w-4 h-4 shrink-0" />
              {t('plans.useWalletBalance', { amount: walletBalance })}
            </label>
            {useWallet && (
              <input
                type="number"
                min={1}
                max={walletBalance}
                value={walletAmountInput}
                onChange={(e) => setWalletAmountInput(e.target.value)}
                className="mt-3 w-full border border-blue-200 dark:border-blue-900/50 bg-background rounded-lg px-3 py-1.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                placeholder={t('plans.amountToApply')}
              />
            )}
            {/* WALLET-TRANSFER-PAUSED */}
            <p className="mt-2 text-xs text-blue-800/80 dark:text-blue-300/80">
              {t('plans.walletBalanceCanOnly')}
            </p>
          </div>
        )}

        {/* REFERRAL-PROGRAM — only while the program is enabled */}
        {REFERRAL_PROGRAM_ENABLED && (
        <div className="flex items-center justify-center gap-2.5 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 rounded-xl p-4 text-center mb-10 max-w-3xl mx-auto">
          <Gift className="w-5 h-5 text-emerald-700 dark:text-emerald-400 shrink-0" />
          <p className="text-sm text-emerald-800 dark:text-emerald-400">
            <Trans i18nKey="plans.haveAReferralCodeGet" params={{ value: referralConfig?.SIGNUP_DISCOUNT_AMOUNT ?? 100 }} />
          </p>
        </div>
        )}

        <div className={`grid sm:grid-cols-2 ${hasHadPaidPlan ? 'lg:grid-cols-4' : 'lg:grid-cols-5'} gap-6 lg:gap-5 max-w-7xl mx-auto items-start`}>
          {plans.map((plan) => {
            const style = planStyle[plan.planType ?? "Starter"] ?? planStyle.Starter;
            const Icon = style.icon;
            return (
              <Card
                key={plan.id}
                className={`relative h-full flex flex-col transition-shadow hover:shadow-md ${plan.popular ? 'border-primary/40 shadow-md md:scale-105' : ''} ${selectedPlan === plan.id ? 'ring-2 ring-primary' : ''}`}
              >
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground shadow-sm">
                    {t('plans.mostPopular')}
                  </Badge>
                )}

                <CardHeader className="text-center pb-2">
                  <div className={`w-12 h-12 rounded-xl ${style.iconBg} flex items-center justify-center mx-auto mb-3`}>
                    <Icon className={`w-6 h-6 ${style.accent}`} />
                  </div>
                  <CardTitle className="text-lg font-semibold text-form-header">{plan.planType}</CardTitle>
                  <CardDescription>{plan.duration}</CardDescription>
                  <div className="flex items-baseline justify-center gap-2 mt-3">
                    <span className="text-3xl font-bold text-form-header">₹{plan.price}</span>
                    {plan.originalPrice && (
                      <span className="text-sm text-muted-foreground line-through">₹{plan.originalPrice}</span>
                    )}
                  </div>
                  {plan.originalPrice && (
                    <Badge variant="outline" className="mt-2 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/50">
                      {t('plans.save', { value: plan.originalPrice - plan.price })}</Badge>
                  )}
                </CardHeader>

                <CardContent className="flex-1">
                  <ul className="space-y-2.5">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                        <span className="text-sm text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>

                <CardFooter>
                  {currentUser?.subscription?.planId === plan.id && currentUser?.subscription?.status === 'active' ? (
                    <Button
                      className="w-full"
                      variant="secondary"
                      disabled
                    >
                      <Check className="h-4 w-4 mr-2" />
                      {t('plans.activePlan')}
                    </Button>
                  ) : currentUser?.subscription?.planId === plan.id && currentUser?.subscription?.status === 'pending_payment' ? (
                    <Button
                      className="w-full"
                      variant="default"
                      onClick={() => handleSelectPlan(plan.id)}
                      disabled={!!processingPlanId}
                    >
                      {processingPlanId === plan.id ? t('plans.processing') : t('plans.completePayment')}
                    </Button>
                  ) : (
                    <Button
                      className="w-full"
                      variant={plan.popular ? "default" : "outline"}
                      onClick={() => handleSelectPlan(plan.id)}
                      disabled={!!processingPlanId}
                    >
                      {processingPlanId === plan.id ? t('plans.processing') : t('plans.selectPlan')}
                    </Button>
                  )}
                </CardFooter>
              </Card>
            );
          })}
        </div>

        {/* Value comparison — longer plans cost less per month */}
        <section className="max-w-4xl mx-auto mt-14" aria-labelledby="plan-value-heading">
          <div className="text-center mb-5">
            <h2 id="plan-value-heading" className="text-xl sm:text-2xl font-bold text-form-header">
              {t('plans.saveMoreWithLongerPlans')}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {t('plans.theLongerYouCommit')}
            </p>
          </div>

          <div className="rounded-xl border border-border bg-card overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="whitespace-nowrap">{t('plans.planDuration')}</TableHead>
                  <TableHead className="whitespace-nowrap">{t('plans.currentPrice')}</TableHead>
                  <TableHead className="whitespace-nowrap">{t('plans.totalSavings')}</TableHead>
                  <TableHead className="whitespace-nowrap text-right">{t('plans.effectiveCostPerMonth')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {valueRows.map((row) => (
                  <TableRow key={row.id} className={row.popular ? "bg-primary/5" : undefined}>
                    <TableCell className="font-medium text-form-header whitespace-nowrap">
                      {row.label}
                      {row.popular && (
                        <Badge className="ml-2 bg-primary text-primary-foreground text-[10px] align-middle">{t('plans.mostPopular')}</Badge>
                      )}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      <span className="font-semibold text-form-header">{inr(row.price)}</span>{" "}
                      <span className="text-xs text-muted-foreground">{t('plans.originally', { value: inr(row.original) })}</span>
                    </TableCell>
                    <TableCell className="whitespace-nowrap font-medium text-emerald-700 dark:text-emerald-400">
                      {t('plans.save2', { value: inr(row.saving) })}</TableCell>
                    <TableCell className="whitespace-nowrap text-right font-semibold text-form-header">
                      {t('plans.month', { value: inr(row.perMonth) })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </section>

        <div className="text-center mt-10">
          <p className="text-sm text-muted-foreground">
            <Trans i18nKey="plans.allPricesAreInIndian" components={{ link: <Link to="/refund-policy" className="text-primary hover:underline" /> }} /></p>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default OurPlans;