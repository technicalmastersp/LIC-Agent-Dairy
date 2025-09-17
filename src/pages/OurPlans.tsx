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

interface Plan {
  id: string;
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
      id: "6months",
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

  const handleSelectPlan = (planId: string) => {
    if (!currentUser) {
      toast({
        title: "Login Required",
        description: "Please login to select a plan",
        variant: "destructive"
      });
      navigate("/login");
      return;
    }

    const selectedPlanData = plans.find(plan => plan.id === planId);
    if (selectedPlanData) {
      const success = updateUserSubscription(currentUser.id, {
        planId: selectedPlanData.id,
        duration: selectedPlanData.duration,
        price: selectedPlanData.price,
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + (parseInt(selectedPlanData.duration) * 30 * 24 * 60 * 60 * 1000)).toISOString(),
        status: "active"
      });

      if (success) {
        toast({
          title: "Plan Selected",
          description: `Successfully selected ${selectedPlanData.duration} plan for ₹${selectedPlanData.price}`,
        });
        navigate("/");
      } else {
        toast({
          title: "Error",
          description: "Failed to update subscription plan",
          variant: "destructive"
        });
      }
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary mb-4">Choose Your Plan</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Select the perfect plan for your needs. All plans include full access to our features.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => (
            <Card 
              key={plan.id} 
              className={`relative ${plan.popular ? 'border-primary shadow-lg scale-105' : ''} ${selectedPlan === plan.id ? 'ring-2 ring-primary' : ''}`}
            >
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground">
                  Most Popular
                </Badge>
              )}
              
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">{plan.duration}</CardTitle>
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
                    // onClick={() => handleSelectPlan(plan.id)}
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