import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
};

export default OurPlans;