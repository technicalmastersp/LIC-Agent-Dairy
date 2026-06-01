import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { getCurrentUser, updateUserSubscription } from "@/utils/auth";
import { useToast } from "@/hooks/use-toast";
import { changePlan } from "../../services/subscriptionService";

interface Plan {
  id: string;
  planType?: string;
  duration: string;
  price: number;
  originalPrice?: number;
  features: string[];
  popular?: boolean;
}

const OurPlans = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { toast } = useToast();
  const [selectedPlan, setSelectedPlan] = useState<string>("");
  
  const currentUser = getCurrentUser();

  const [searchParams] = useSearchParams();
  const reason = searchParams.get("reason");

  const plans: Plan[] = [
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

  const handleSelectPlan = async (planId: string) => {
    if (!currentUser) { navigate("/login"); return; }
    try {
      await changePlan(planId);
      toast({ title: "Plan Activated", description: "Your plan has been updated successfully." });
      navigate("/");
    } catch (err: any) {
      toast({ title: "Error", description: err.response?.data?.message || "Something went wrong.", variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-background">
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
          <h1 className="text-4xl font-bold text-primary mb-4">Choose Your Plan</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Choose the plan that fits your needs. Upgrade or downgrade anytime.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
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
                ) : (
                  <Button
                    className="w-full"
                    variant={plan.popular ? "default" : "outline"}
                    onClick={() => handleSelectPlan(plan.id)}
                  >
                    Select Plan
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


  
  // return (
  //   <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
  //     <Navigation />

  //     <main className="container mx-auto px-4 py-12">
  //       {/* Header */}
  //       <div className="text-center mb-14">
  //         <span className="inline-block bg-blue-100 text-blue-700 text-sm font-semibold px-4 py-1 rounded-full mb-4 tracking-wide uppercase">
  //           Pricing Plans
  //         </span>
  //         <h1 className="text-5xl font-extrabold text-gray-900 mb-4">
  //           Simple, Transparent Pricing
  //         </h1>
  //         <p className="text-lg text-gray-500 max-w-2xl mx-auto">
  //           Choose the plan that fits your needs. Upgrade or downgrade anytime.
  //         </p>
  //       </div>

  //       {/* Cards Grid — 2 cols on md, 4 on xl */}
  //       <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 max-w-7xl mx-auto items-start">
  //         {plans.map((plan) => {
  //           const isActive =
  //             currentUser?.subscription?.planId === plan.id &&
  //             currentUser?.subscription?.status === "active";

  //           const isFree = plan.id === "1month-free";
  //           const isPopular = plan.popular;

  //           // Per-plan color themes
  //           const theme = isFree
  //             ? {
  //                 badge: "bg-emerald-100 text-emerald-700 border border-emerald-200",
  //                 headerBg: "bg-gradient-to-br from-emerald-500 to-teal-600",
  //                 accent: "text-emerald-600",
  //                 checkColor: "text-emerald-500",
  //                 button: "bg-emerald-500 hover:bg-emerald-600 text-white",
  //                 saveBadge: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  //                 card: "border-emerald-200 shadow-emerald-100",
  //               }
  //             : isPopular
  //             ? {
  //                 badge: "bg-blue-600 text-white",
  //                 headerBg: "bg-gradient-to-br from-blue-600 to-indigo-700",
  //                 accent: "text-blue-600",
  //                 checkColor: "text-blue-500",
  //                 button: "bg-blue-600 hover:bg-blue-700 text-white",
  //                 saveBadge: "bg-blue-50 text-blue-700 border border-blue-200",
  //                 card: "border-blue-400 shadow-blue-100 scale-105",
  //               }
  //             : plan.id === "6months"
  //             ? {
  //                 badge: "bg-violet-100 text-violet-700 border border-violet-200",
  //                 headerBg: "bg-gradient-to-br from-violet-500 to-purple-600",
  //                 accent: "text-violet-600",
  //                 checkColor: "text-violet-500",
  //                 button: "border border-violet-400 text-violet-700 hover:bg-violet-50",
  //                 saveBadge: "bg-violet-50 text-violet-700 border border-violet-200",
  //                 card: "border-violet-200 shadow-violet-100",
  //               }
  //             : {
  //                 badge: "bg-amber-100 text-amber-700 border border-amber-200",
  //                 headerBg: "bg-gradient-to-br from-amber-500 to-orange-600",
  //                 accent: "text-amber-600",
  //                 checkColor: "text-amber-500",
  //                 button: "border border-amber-400 text-amber-700 hover:bg-amber-50",
  //                 saveBadge: "bg-amber-50 text-amber-700 border border-amber-200",
  //                 card: "border-amber-200 shadow-amber-100",
  //               };

  //           return (
  //             <div
  //               key={plan.id}
  //               className={`relative rounded-2xl border-2 bg-white shadow-lg transition-transform hover:-translate-y-1 hover:shadow-xl ${theme.card}`}
  //             >
  //               {/* Popular badge */}
  //               {isPopular && (
  //                 <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
  //                   <span className={`text-xs font-bold px-4 py-1.5 rounded-full shadow ${theme.badge}`}>
  //                     ⭐ Most Popular
  //                   </span>
  //                 </div>
  //               )}

  //               {/* Free badge */}
  //               {isFree && (
  //                 <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
  //                   <span className={`text-xs font-bold px-4 py-1.5 rounded-full shadow ${theme.badge}`}>
  //                     🎁 Free Trial
  //                   </span>
  //                 </div>
  //               )}

  //               {/* Coloured header strip */}
  //               <div className={`${theme.headerBg} rounded-t-xl px-6 pt-8 pb-6 text-center text-white`}>
  //                 <p className="text-sm font-semibold uppercase tracking-widest opacity-80 mb-1">
  //                   {plan.planType}
  //                 </p>
  //                 <p className="text-lg font-medium opacity-90">{plan.duration}</p>
  //                 <div className="mt-3 flex items-end justify-center gap-2">
  //                   <span className="text-4xl font-extrabold">
  //                     {plan.price === 0 ? "Free" : `₹${plan.price}`}
  //                   </span>
  //                   {plan.originalPrice && plan.price > 0 && (
  //                     <span className="text-base line-through opacity-60 mb-1">
  //                       ₹{plan.originalPrice}
  //                     </span>
  //                   )}
  //                 </div>
  //                 {plan.originalPrice && (
  //                   <span className={`inline-block mt-2 text-xs font-semibold px-3 py-1 rounded-full ${theme.saveBadge}`}>
  //                     {plan.price === 0
  //                       ? `Worth ₹${plan.originalPrice} — Free!`
  //                       : `Save ₹${plan.originalPrice - plan.price}`}
  //                   </span>
  //                 )}
  //               </div>

  //               {/* Features */}
  //               <div className="px-6 py-5">
  //                 <ul className="space-y-3">
  //                   {plan.features.map((feature, i) => (
  //                     <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
  //                       <Check className={`h-4 w-4 mt-0.5 shrink-0 ${theme.checkColor}`} />
  //                       {feature}
  //                     </li>
  //                   ))}
  //                 </ul>
  //               </div>

  //               {/* CTA */}
  //               <div className="px-6 pb-6">
  //                 {isActive ? (
  //                   <button
  //                     disabled
  //                     className="w-full py-2.5 rounded-xl text-sm font-semibold bg-gray-100 text-gray-400 cursor-not-allowed flex items-center justify-center gap-2"
  //                   >
  //                     <Check className="h-4 w-4" /> Active Plan
  //                   </button>
  //                 ) : (
  //                   <button
  //                     onClick={() => handleSelectPlan(plan.id)}
  //                     className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-colors ${theme.button}`}
  //                   >
  //                     {isFree ? "Start Free Trial" : "Get Started"}
  //                   </button>
  //                 )}
  //               </div>
  //             </div>
  //           );
  //         })}
  //       </div>

  //       <p className="text-center text-xs text-gray-400 mt-10">
  //         All prices are in Indian Rupees (INR) · Plans auto-renew unless cancelled · Free plan is one-time per account
  //       </p>
  //     </main>

  //     <Footer />
  //   </div>
  // );
};

export default OurPlans;