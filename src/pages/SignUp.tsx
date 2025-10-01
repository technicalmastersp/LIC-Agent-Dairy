import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { UserPlus } from "lucide-react";
import { generateAutoUserId, generateEasyUserId, generateReferralCode, saveUser, User } from "@/utils/auth";
import { useLanguage } from "@/hooks/useLanguage";
import { useToast } from "@/hooks/use-toast";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

const SignUp = () => {
  const [formData, setFormData] = useState({
    name: "",
    fullAddress: "",
    mobileNumber: "",
    designation: "",
    email: "",
    password: "",
    confirmPassword: "",
    selectedPlan: "",
    referralCode: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [generatedIds, setGeneratedIds] = useState<{autoId: string, easyId: string} | null>(null);
  const [isValidReferralCode, setIsValidReferralCode] = useState(false);
  
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { toast } = useToast();

  const plans = [
    { id: '6months', name: '6 Months Plan', price: 599, originalPrice: 899 },
    { id: '12months', name: '12 Months Plan', price: 1099, originalPrice: 1599 },
    { id: '24months', name: '24 Months Plan', price: 2099, originalPrice: 2999 }
  ];

  const validateReferralCode = (code: string): boolean => {
    if (!code) return false;
    let users = JSON.parse(localStorage.getItem('customers-list') || '[]');

    const referrerUser = users.find((user: any) => user.referralCode === code);
    if (referrerUser) {
      // Store referral details for processing during signup
      localStorage.setItem('pendingReferral', JSON.stringify({
        referrerUserId: referrerUser.id,
        referralCode: code,
        referrerName: referrerUser.name
      }));
      return true;
    }
    return false;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Validate referral code
    if (name === 'referralCode') {
      setIsValidReferralCode(validateReferralCode(value));
    }
    
    // Generate preview IDs when user types name, mobile, or address
    if ((name === 'name' || name === 'mobileNumber' || name === 'fullAddress') && 
        formData.name && formData.mobileNumber && formData.fullAddress) {
      const autoId = generateAutoUserId();
      const easyId = generateEasyUserId(
        name === 'name' ? value : formData.name,
        name === 'mobileNumber' ? value : formData.mobileNumber,
        name === 'fullAddress' ? value : formData.fullAddress
      );
      setGeneratedIds({ autoId, easyId });
    }
  };

  const getSelectedPlan = () => {
    return plans.find(plan => plan.id === formData.selectedPlan);
  };

  const calculateFinalPrice = () => {
    const selectedPlan = getSelectedPlan();
    if (!selectedPlan) return 0;
    
    const discount = isValidReferralCode && formData.referralCode ? 100 : 0;
    return Math.max(0, selectedPlan.price - discount);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    if (formData.mobileNumber.length !== 10) {
      setError("Mobile number must be 10 digits");
      setIsLoading(false);
      return;
    }

    if (!formData.selectedPlan) {
      setError("Please select a subscription plan");
      setIsLoading(false);
      return;
    }

    try {
      const autoId = generateAutoUserId();
      const easyId = generateEasyUserId(formData.name, formData.mobileNumber, formData.fullAddress);
      const userReferralCode = generateReferralCode(formData.name, autoId);

      const selectedPlanData = plans.find(plan => plan.id === formData.selectedPlan);
      const planDurationMonths = parseInt(formData.selectedPlan.replace('months', ''));
      
      const newUser: User = {
        id: autoId,
        easyId: easyId,
        name: formData.name,
        fullAddress: formData.fullAddress,
        mobileNumber: formData.mobileNumber,
        designation: formData.designation,
        email: formData.email,
        password: formData.password,
        createdAt: new Date().toISOString(),
        referralCode: userReferralCode,
        referredBy: formData.referralCode || undefined,
        subscription: selectedPlanData ? {
          planId: selectedPlanData.id,
          duration: selectedPlanData.name,
          price: selectedPlanData.price,
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + (planDurationMonths * 30 * 24 * 60 * 60 * 1000)).toISOString(),
          status: 'active' as const
        } : undefined
      };

      const success = saveUser(newUser);
      
      if (success) {
        toast({
          title: t('signupSuccess'),
          description: `${t('autoGeneratedId')}: ${autoId}\n${t('easyRememberId')}: ${easyId}\nReferral Code: ${userReferralCode}`,
        });
        navigate("/login");
      } else {
        setError(t('userExists'));
      }
    } catch (err) {
      setError("Failed to create account. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-6">
        <div className="flex justify-end">
          <LanguageSwitcher />
        </div>
        
        <Card>
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
              <UserPlus className="w-8 h-8 text-primary-foreground" />
            </div>
            <CardTitle className="text-2xl text-form-header">{t('signupTitle')}</CardTitle>
            <CardDescription>
              {t('welcome')} Sir - {t('createAccount')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">{t('name')} <span className="text-[#ff0000]">*</span></Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    placeholder={t('name')}
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="mobileNumber">{t('mobileNumber')} <span className="text-[#ff0000]">*</span></Label>
                  <Input
                    id="mobileNumber"
                    name="mobileNumber"
                    type="tel"
                    placeholder="10-digit mobile number"
                    value={formData.mobileNumber}
                    onChange={handleInputChange}
                    pattern="[0-9]{10}"
                    maxLength={10}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fullAddress">{t('fullAddress')} <span className="text-[#ff0000]">*</span></Label>
                <Input
                  id="fullAddress"
                  name="fullAddress"
                  type="text"
                  placeholder={t('fullAddress')}
                  value={formData.fullAddress}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="designation">{t('designation')} <span className="text-[#ff0000]">*</span></Label>
                  <Input
                    id="designation"
                    name="designation"
                    type="text"
                    placeholder={t('designation')}
                    value={formData.designation}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">{t('email')} <span className="text-[#ff0000]">*</span></Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder={t('email')}
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="password">{t('password')} <span className="text-[#ff0000]">*</span></Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder={t('password')}
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">{t('confirmPassword')} <span className="text-[#ff0000]">*</span></Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    placeholder={t('confirmPassword')}
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="selectedPlan">{t('SelectSubscriptionPlan')} <span className="text-[#ff0000]">*</span></Label>
                  <Select 
                    value={formData.selectedPlan} 
                    onValueChange={(value) => setFormData({ ...formData, selectedPlan: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t('SelectSubscriptionPlan')} />
                    </SelectTrigger>
                    <SelectContent>
                      {plans.map((plan) => (
                        <SelectItem key={plan.id} value={plan.id}>
                          <div className="flex items-center justify-between w-full">
                            <span>{plan.name}</span>
                            <div className="flex items-center gap-2 ml-4">
                              <Badge variant="outline">₹{plan.price}</Badge>
                              {plan.originalPrice && (
                                <span className="text-xs text-muted-foreground line-through">₹{plan.originalPrice}</span>
                              )}
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="referralCode">{t('ReferralCode')+' ('+t('Optional')+')'}</Label>
                  <div className="flex gap-2">
                    <Input
                      id="referralCode"
                      name="referralCode"
                      type="text"
                      placeholder={t('ReferralCode')+' ('+t('Optional')+')'}
                      value={formData.referralCode}
                      onChange={(e) => {
                        const value = e.target.value.toUpperCase();
                        setFormData({ ...formData, referralCode: value });
                        setIsValidReferralCode(false); // Reset validation when typing
                      }}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const isValid = validateReferralCode(formData.referralCode);
                        setIsValidReferralCode(isValid);
                        if (isValid) {
                          const pendingReferral = JSON.parse(localStorage.getItem('pendingReferral') || '{}');
                          toast({
                            title: "Referral Code Validated!",
                            description: `Valid referral from ${pendingReferral.referrerName}. You'll receive ₹100 discount!`,
                          });
                        } else {
                          toast({
                            title: "Invalid Referral Code",
                            description: "Please check your referral code and try again.",
                            variant: "destructive"
                          });
                        }
                      }}
                      disabled={!formData.referralCode}
                      className="whitespace-nowrap"
                    >
                      {t('validate')}
                    </Button>
                  </div>
                  {formData.referralCode && !isValidReferralCode && (
                    <p className="text-xs text-muted-foreground">
                      Click 'Validate' to check your referral code
                    </p>
                  )}
                </div>
              </div>

              <div className="grid lg:grid-cols-2 gap-4">
                {formData.selectedPlan && (
                  <div className="lg:col-span-2">
                    <Card className="bg-gradient-to-br from-primary/5 to-accent/10 border-primary/20 shadow-lg">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg text-primary flex items-center gap-2">
                          💳 Payment Summary
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex justify-between items-center py-2 border-b border-border/50">
                          <span className="text-sm font-medium">Selected Plan:</span>
                          <span className="font-semibold">{getSelectedPlan()?.name}</span>
                        </div>
                        
                        <div className="flex justify-between items-center py-2 border-b border-border/50">
                          <span className="text-sm font-medium">Plan Price:</span>
                          <div className="text-right">
                            <span className="font-semibold">₹{getSelectedPlan()?.price}</span>
                            {getSelectedPlan()?.originalPrice && (
                              <div className="text-xs text-muted-foreground line-through">
                                MRP: ₹{getSelectedPlan()?.originalPrice}
                              </div>
                            )}
                          </div>
                        </div>

                        {!isValidReferralCode && !formData.referralCode && (
                          <div className="bg-accent/90 border border-accent/60 rounded-lg p-3">
                            <p className="text-sm text-foreground/80 flex items-center gap-2">
                              💡 <span><strong>Pro Tip:</strong> Enter a valid referral code to get an instant ₹100 discount!</span>
                            </p>
                          </div>
                        )}

                        {isValidReferralCode && formData.referralCode && (
                          <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-sm font-medium text-green-800 dark:text-green-300">Referral Discount:</span>
                              <span className="font-semibold text-green-800 dark:text-green-300">-₹100</span>
                            </div>
                            <p className="text-xs text-green-700 dark:text-green-400 flex items-center gap-1">
                              🎉 <span>Congratulations! You've received ₹100 discount with referral code: <strong>{formData.referralCode}</strong></span>
                            </p>
                            {(() => {
                              const pendingReferral = JSON.parse(localStorage.getItem('pendingReferral') || '{}');
                              return pendingReferral.referrerName && (
                                <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                                  Referred by: <strong>{pendingReferral.referrerName}</strong>
                                </p>
                              );
                            })()}
                          </div>
                        )}

                        <div className="border-t-2 border-primary/20 pt-4 bg-primary/5 -mx-6 -mb-6 px-6 pb-6 rounded-b-lg">
                          <div className="flex justify-between items-center">
                            <span className="text-lg font-semibold">Total Amount:</span>
                            <span className="text-2xl font-bold text-primary">₹{calculateFinalPrice()}</span>
                          </div>
                          {isValidReferralCode && formData.referralCode && (
                            <div className="text-xs text-muted-foreground mt-1 text-right">
                              You saved ₹100!
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>

              {/* Preview Generated IDs */}
              {generatedIds && (
                <Card className="bg-accent/50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-form-subheader">Generated User IDs (Preview)</CardTitle>
                  </CardHeader>
                  <CardContent className="text-xs space-y-1">
                    <p><strong>{t('autoGeneratedId')}:</strong> {generatedIds.autoId}</p>
                    <p><strong>{t('easyRememberId')}:</strong> {generatedIds.easyId}</p>
                  </CardContent>
                </Card>
              )}

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? t('loading') : t('createAccount')}
              </Button>
            </form>

            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                {t('alreadyHaveAccount')}{" "}
                <Link to="/login" className="text-primary hover:underline">
                  {t('login')}
                </Link>
              </p>
              <p className="text-sm text-muted-foreground">
                {/* {t('dontHaveAccount')}{" "} */}Explore &nbsp;  
                <Link to="/our-plans" className="text-primary hover:underline">
                  {/* {t('signup')} */}
                  Our Plans
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SignUp;