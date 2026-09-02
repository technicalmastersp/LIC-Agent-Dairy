import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { getCurrentUser, setCurrentUser } from "@/utils/auth";
import { useToast } from "@/hooks/use-toast";
import { changePlan, createCheckoutOrder, verifyPayment, getSubscription } from "../../services/subscriptionService";
import { getReferralConfig } from "../../services/configService";
import { getProfile } from "../../services/userService";
import { getReferralDashboard } from "../../services/referralService";
import { openRazorpayCheckout } from "@/utils/razorpayCheckout";
import { Link } from "lucide-react";
import SEO from "@/components/SEO";
import type { Plan } from "@/types/pages/OurPlans.types";
const OurPlans = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
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
        "Only for new users",
        "Access to all features",
        "1 month validity",
        "Email support",
        "Regular updates"
      ]
    },
    {
      id: "1month",
      planType: "Starter",
      duration: "1 Month",
      price: 249,
      originalPrice: 299,
      features: [
        "Access to all features",
        "1 month validity",
        "Email support",
        "Regular updates"
      ]
    },
    {
      id: "6months",
      planType: "Basic",
      duration: "6 Months",
      price: 599,
      originalPrice: 899,
      features: [
        "Access to all features",
        "6 months validity",
        "Email support",
        "Regular updates"
      ]
    },
    {
      id: "12months",
      planType: "Standard",
      duration: "12 Months",
      price: 1099,
      originalPrice: 1599,
      popular: true,
      features: [
        "Access to all features",
        "12 months validity",
        "Priority email support",
        "Regular updates",
        "Extended storage"
      ]
    },
    {
      id: "24months",
      planType: "Premium",
      duration: "24 Months",
      price: 2099,
      originalPrice: 2999,
      features: [
        "Access to all features",
        "24 months validity",
        "24/7 priority support",
        "Regular updates",
        "Unlimited storage",
        "Advanced analytics"
      ]
    }
  ];

  // Free trial is signup-only in spirit — hide it entirely once someone
  // has already taken any paid plan (current planId isn't the free plan),
  // rather than only blocking re-selection after the fact.
  const hasHadPaidPlan = currentUser?.subscription && currentUser.subscription.planId !== "1month-free";
  const plans = allPlans.filter(p => p.id !== "1month-free" || !hasHadPaidPlan);

  const handleSelectPlan = async (planId: string) => {
    if (processingPlanId) return; // already checking out a plan — ignore extra clicks
    if (!currentUser) { navigate("/signup"); return; }
    if (currentUser.role === "admin" || currentUser.role === "superadmin") {
      toast({ title: "Not applicable", description: "Admin accounts don't use subscription plans." });
      return;
    }

    const plan = plans.find(p => p.id === planId);
    setProcessingPlanId(planId);

    try {
      if (!plan || plan.price === 0) {
        // Free plan — unchanged direct-activation path
        await changePlan(planId);
        toast({ title: "Plan Activated", description: "Your plan has been updated successfully." });
        navigate("/");
        return;
      }

      // Paid plan — apply wallet balance first (server clamps to real
      // balance + plan price regardless of what's requested here)
      const walletToApply = useWallet ? Number(walletAmountInput) || 0 : 0;
      const order = await createCheckoutOrder(planId, walletToApply);

      if (order.walletCovered) {
        // Fully paid from wallet — no Razorpay modal needed at all
        const freshProfile = await getProfile();
        setCurrentUser(freshProfile);
        setLocalCurrentUser(freshProfile);
        toast({ title: "Plan Activated", description: "Fully covered by your referral wallet." });
        navigate("/");
        return;
      }

      const paymentResponse = await openRazorpayCheckout({
        order,
        userName: currentUser?.name,
        userEmail: currentUser?.email,
        userContact: currentUser?.mobileNumber,
      });

      await verifyPayment(paymentResponse);

      // Refresh the cached profile so the "Active Plan" badge updates immediately
      const freshProfile = await getProfile();
      setCurrentUser(freshProfile);
      setLocalCurrentUser(freshProfile);

      toast({ title: "Payment Successful", description: "Your plan has been activated." });
      navigate("/");
    } catch (err: unknown) {
      if (err instanceof Error && err.message === "PAYMENT_CANCELLED") {
        toast({ title: "Payment Cancelled", description: "You can try again anytime." });
        return;
      }
      if (err instanceof Error && err.message === "PAYMENT_FAILED") {
        toast({ title: "Payment Failed", description: "Your payment could not be completed. Please try again.", variant: "destructive" });
        return;
      }
      const message = axios.isAxiosError(err) ? err.response?.data?.message : undefined;
      toast({ title: "Error", description: message || "Something went wrong.", variant: "destructive" });
    } finally {
      setProcessingPlanId(null);
    }
  };

  useEffect(() => {
    getReferralConfig().then(setReferralConfig).catch(() => {});
  }, []);

  useEffect(() => {
    if (!currentUser) return;
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

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Subscription Plans & Pricing"
        description="Compare Life Insurance Records subscription plans — from a free 1-month trial to 24-month options — and pick the right fit for how many client records you manage."
      />
      <Navigation />

      {reason === "expired" && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-center py-3 px-4 rounded-lg mb-6">
          ⚠️ Your subscription has expired. Please renew to continue.
        </div>
      )}
      {reason === "no-plan" && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 text-center py-3 px-4 rounded-lg mb-6">
          👋 Please choose a plan to get started.
        </div>
      )}

      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-primary mb-4">Choose Your Plan</h1>
          <p className="text-base sm:text-xl text-muted-foreground max-w-2xl mx-auto px-2">
            Choose the plan that fits your needs. Upgrade or downgrade anytime.
          </p>
        </div>

        {currentUser && walletBalance > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-8 max-w-md mx-auto">
            <label className="flex items-center gap-2 text-sm font-medium text-blue-900">
              <input
                type="checkbox"
                checked={useWallet}
                onChange={(e) => { setUseWallet(e.target.checked); setWalletAmountInput(String(walletBalance)); }}
              />
              Use my referral wallet (₹{walletBalance} available)
            </label>
            {useWallet && (
              <input
                type="number"
                min={1}
                max={walletBalance}
                value={walletAmountInput}
                onChange={(e) => setWalletAmountInput(e.target.value)}
                className="mt-2 w-full border border-blue-200 rounded-lg px-3 py-1.5 text-sm"
                placeholder="Amount to apply"
              />
            )}
          </div>
        )}

        <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center mb-8">
          <p className="text-md text-green-800 text-center">
            🎁 Have a referral code?{" "}
            <strong>Get ₹{referralConfig.SIGNUP_DISCOUNT_AMOUNT} off</strong>{" "}
            any paid plan when you sign up with a valid referral code.{" "}
            {/* <Link to="/signup" className="underline font-semibold">Sign up now →</Link> */}
          </p>
        </div>

        <div className={`grid md:grid-cols-2 ${hasHadPaidPlan ? 'lg:grid-cols-4' : 'lg:grid-cols-5'} gap-8 max-w-7xl mx-auto`}>
          {plans.map((plan) => (
            <Card 
              key={plan.id} 
              className={`relative ${plan.popular ? 'border-blue-300 shadow-lg scale-105' : ''} ${selectedPlan === plan.id ? 'ring-2 ring-primary' : ''}`}
            >
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-600 text-primary-foreground">
                  Most Popular
                </Badge>
              )}
              
              <CardHeader className="text-center">
                <CardTitle>
                  <div className="flex items-center justify-center gap-2 mt-2">
                    <div className="bg-primary text-primary-foreground px-8 py-2 mb-2 rounded-full">
                      <span className="text-1xl font-bold">{plan.planType}</span>
                    </div>
                  </div>
                </CardTitle>
                <CardDescription className="text-2xl">{plan.duration}</CardDescription>
                <CardDescription>
                  <div className="flex items-center justify-center gap-2 mt-2">
                    <span className="text-3xl font-bold text-primary">₹{plan.price}</span>
                    {plan.originalPrice && (
                      <span className="text-lg text-muted-foreground line-through">₹{plan.originalPrice}</span>
                    )}
                  </div>
                  {plan.originalPrice && (
                    <div className="text-sm text-green-600 font-medium">
                      Save ₹{plan.originalPrice - plan.price}
                    </div>
                  )}
                </CardDescription>
              </CardHeader>

              <CardContent>
                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <Check className="h-5 w-5 text-green-500" />
                      <span className="text-sm">{feature}</span>
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
                    Active Plan
                  </Button>
                ) : currentUser?.subscription?.planId === plan.id && currentUser?.subscription?.status === 'pending_payment' ? (
                  <Button
                    className="w-full"
                    variant="default"
                    onClick={() => handleSelectPlan(plan.id)}
                    disabled={!!processingPlanId}
                  >
                    {processingPlanId === plan.id ? "Processing…" : "Complete Payment"}
                  </Button>
                ) : (
                  <Button
                    className="w-full"
                    variant={plan.popular ? "default" : "outline"}
                    onClick={() => handleSelectPlan(plan.id)}
                    disabled={!!processingPlanId}
                  >
                    {processingPlanId === plan.id ? "Processing…" : "Select Plan"}
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="text-center mt-8">
          <p className="text-sm text-muted-foreground">
            All prices are in Indian Rupees (INR). Plans auto-renew unless cancelled.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default OurPlans;