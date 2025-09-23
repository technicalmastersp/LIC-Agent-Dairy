import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { getCurrentUser, isAuthenticated } from "@/utils/auth";
import { Copy, Share, Users, TrendingUp, Gift, Crown } from "lucide-react";

const ReferralProgram = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const currentUser = getCurrentUser();
  const authenticated = isAuthenticated();
  const [referralStats, setReferralStats] = useState({
    totalReferrals: 0,
    totalEarnings: 0,
    pendingRewards: 0,
    level1Referrals: 0,
    level2Referrals: 0
  });

  useEffect(() => {
    if (!authenticated || !currentUser) {
      navigate("/login");
      return;
    }
    loadReferralStats();
  }, [authenticated, currentUser, navigate]);

  const loadReferralStats = () => {
    const stats = localStorage.getItem(`referral_stats_${currentUser?.id}`);
    if (stats) {
      setReferralStats(JSON.parse(stats));
    }
  };

  const generateReferralUrl = () => {
    const referralCode = currentUser?.referralCode || `REF${currentUser?.id}`;
    const baseUrl = window.location.origin;
    return `${baseUrl}?ref=${referralCode}`;
  };

  const copyReferralUrl = async () => {
    try {
      const url = generateReferralUrl();
      await navigator.clipboard.writeText(url);
      toast({
        title: "Success!",
        description: "Referral URL copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy URL",
        variant: "destructive",
      });
    }
  };

  const shareReferralUrl = async () => {
    const url = generateReferralUrl();
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Join our Life Insurance Platform",
          text: "Get the best life insurance plans with exclusive offers!",
          url: url,
        });
      } catch (error) {
        copyReferralUrl();
      }
    } else {
      copyReferralUrl();
    }
  };

  if (!authenticated || !currentUser) {
    return null;
  }

  const plans = [
    { name: "Basic Plan", price: 599, duration: "6 months" },
    { name: "Standard Plan", price: 1099, duration: "12 months" },
    { name: "Premium Plan", price: 2099, duration: "24 months" }
  ];

  return (
    <div className="min-h-screen bg-muted/30 flex flex-col">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8 flex-1">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold text-primary flex items-center justify-center gap-2">
              <Crown className="h-8 w-8" />
              Referral Program
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Invite friends and earn rewards! Get 5% commission on direct referrals and 2% on second-level referrals.
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6 text-center">
                <Users className="h-8 w-8 mx-auto mb-2 text-primary" />
                <div className="text-2xl font-bold">{referralStats.totalReferrals}</div>
                <div className="text-sm text-muted-foreground">Total Referrals</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 text-center">
                <TrendingUp className="h-8 w-8 mx-auto mb-2 text-green-600" />
                <div className="text-2xl font-bold">₹{referralStats.totalEarnings}</div>
                <div className="text-sm text-muted-foreground">Total Earnings</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 text-center">
                <Gift className="h-8 w-8 mx-auto mb-2 text-orange-600" />
                <div className="text-2xl font-bold">₹{referralStats.pendingRewards}</div>
                <div className="text-sm text-muted-foreground">Pending Rewards</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 text-center">
                <Crown className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                <div className="text-2xl font-bold">{referralStats.level2Referrals}</div>
                <div className="text-sm text-muted-foreground">Level 2 Referrals</div>
              </CardContent>
            </Card>
          </div>

          {/* Share Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Share className="h-5 w-5" />
                Share Your Referral Link
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm font-medium mb-2">Your Referral Code:</p>
                <p className="text-lg font-mono text-primary">{currentUser.referralCode || `REF${currentUser.id}`}</p>
              </div>
              
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm font-medium mb-2">Your Referral URL:</p>
                <p className="text-sm font-mono text-muted-foreground break-all">{generateReferralUrl()}</p>
              </div>
              
              <div className="flex gap-3">
                <Button onClick={copyReferralUrl} className="flex-1">
                  <Copy className="h-4 w-4 mr-2" />
                  Copy URL
                </Button>
                <Button onClick={shareReferralUrl} variant="outline" className="flex-1">
                  <Share className="h-4 w-4 mr-2" />
                  Share
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* How It Works */}
          <Card>
            <CardHeader>
              <CardTitle>How It Works</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center space-y-2">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                    <span className="text-primary font-bold">1</span>
                  </div>
                  <h3 className="font-semibold">Share Your Link</h3>
                  <p className="text-sm text-muted-foreground">Share your unique referral URL with friends and family</p>
                </div>
                
                <div className="text-center space-y-2">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                    <span className="text-primary font-bold">2</span>
                  </div>
                  <h3 className="font-semibold">They Sign Up</h3>
                  <p className="text-sm text-muted-foreground">Your friends join using your referral link</p>
                </div>
                
                <div className="text-center space-y-2">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                    <span className="text-primary font-bold">3</span>
                  </div>
                  <h3 className="font-semibold">Earn Rewards</h3>
                  <p className="text-sm text-muted-foreground">Get 5% commission when they purchase a plan</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Reward Structure */}
          <Card>
            <CardHeader>
              <CardTitle>Reward Structure</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <Badge variant="default">Level 1</Badge>
                    Direct Referrals (5% Commission)
                  </h3>
                  <div className="space-y-3">
                    {plans.map((plan, index) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-muted rounded-lg">
                        <div>
                          <div className="font-medium">{plan.name}</div>
                          <div className="text-sm text-muted-foreground">{plan.duration}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-green-600">₹{(plan.price * 0.05).toFixed(0)}</div>
                          <div className="text-sm text-muted-foreground">from ₹{plan.price}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <Badge variant="secondary">Level 2</Badge>
                    Indirect Referrals (2% Commission)
                  </h3>
                  <div className="space-y-3">
                    {plans.map((plan, index) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-muted rounded-lg">
                        <div>
                          <div className="font-medium">{plan.name}</div>
                          <div className="text-sm text-muted-foreground">{plan.duration}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-orange-600">₹{(plan.price * 0.02).toFixed(0)}</div>
                          <div className="text-sm text-muted-foreground">from ₹{plan.price}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> Level 2 referrals are earned when someone referred by your direct referral makes a purchase. 
                  This creates a multi-level earning opportunity for active referrers.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ReferralProgram;