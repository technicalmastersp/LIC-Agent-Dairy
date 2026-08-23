import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { UserPlus, EyeOff, Eye, Check, Home, CheckCircle2, Circle } from "lucide-react";
import { User } from "@/utils/auth";
import { useLanguage } from "@/hooks/useLanguage";
import { useToast } from "@/hooks/use-toast";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { createUser, checkReferralCode, getProfile } from "../../services/userService";
import { getReferralConfig } from "../../services/configService";
import { createCheckoutOrder, verifyPayment } from "../../services/subscriptionService";
import { setToken } from "../../utils/localStorageHelper";
import { setCurrentUser } from "@/utils/auth";
import { openRazorpayCheckout } from "@/utils/razorpayCheckout";
import { signUpSchema, type SignUpFormValues } from "@/schemas/signUpSchema";

const SignUp = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [generatedIds, setGeneratedIds] = useState<{autoId: string, easyId: string} | null>(null);
  const [isValidReferralCode, setIsValidReferralCode] = useState(false);
  const [showNew, setShowNew]     = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [referralConfig, setReferralConfig] = useState({
    SIGNUP_DISCOUNT_AMOUNT: 100,
    L1_COMMISSION_PCT:      5,
    L2_COMMISSION_PCT:      2,
  });

  const navigate = useNavigate();
  const { t } = useLanguage();
  const { toast } = useToast();

  const {
    register,
    control,
    handleSubmit,
    watch,
    getValues,
    formState: { errors },
  } = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: "",
      fullAddress: "",
      mobileNumber: "",
      email: "",
      password: "",
      confirmPassword: "",
      selectedPlan: "",
      referralCode: "",
    },
  });

  const password = watch("password");
  const selectedPlanId = watch("selectedPlan");
  const referralCodeValue = watch("referralCode") || "";

  // Same standard used on the Change Password page: 6+ chars, one uppercase, one number.
  const passwordStrength = {
    hasLen:   password.length >= 6,
    hasUpper: /[A-Z]/.test(password),
    hasNum:   /\d/.test(password),
    get score() { return [this.hasLen, this.hasUpper, this.hasNum].filter(Boolean).length; },
  };
  const strengthColor = ["", "bg-red-400", "bg-yellow-400", "bg-green-500"][passwordStrength.score];
  const strengthWidth = ["0%", "33%", "66%", "100%"][passwordStrength.score];

  const plans = [
    { id: '1month-free', planType: "Free", name: '1 Month Free Plan', price: 0, originalPrice: 299 },
    { id: "1month", planType: "Starter", name: "1 Month Plan", price: 249, originalPrice: 299 },
    { id: '6months', planType: "Basic", name: '6 Months Plan', price: 599, originalPrice: 899 },
    { id: '12months', planType: "Standard", name: '12 Months Plan', price: 1099, originalPrice: 1599 },
    { id: '24months', planType: "Premium", name: '24 Months Plan', price: 2099, originalPrice: 2999 }
  ];

  useEffect(() => {
    getReferralConfig().then(setReferralConfig).catch(() => {});
  }, []);

  const getSelectedPlan = () => {
    return plans.find(plan => plan.id === selectedPlanId);
  };

  const calculateFinalPrice = () => {
    const selectedPlan = getSelectedPlan();
    if (!selectedPlan) return 0;

    const discount = isValidReferralCode && referralCodeValue ? referralConfig.SIGNUP_DISCOUNT_AMOUNT : 0;
    return Math.max(0, selectedPlan.price - discount);
  };

  const onSubmit = async (formData: SignUpFormValues) => {
    setIsLoading(true);
    setError("");

    // Everything zod could check statically (password rules, match,
    // 10-digit mobile, plan selected) has already passed by the time
    // react-hook-form calls this. The one thing that still needs a
    // manual guard is referral-code *validity*, since that's an async
    // backend check tied to the separate "Validate" button, not
    // something a sync schema can express.
    if (formData.referralCode && !isValidReferralCode) {
      setError("Invalid Referral Code, Please Re-Validate and Try Again");
      setIsLoading(false);
      return;
    }

    try {
      const selectedPlanData = plans.find(plan => plan.id === formData.selectedPlan);
      const planDurationMonths = parseInt(formData.selectedPlan.replace('months', ''));

      const newUser: User = {
        name: formData.name,
        fullAddress: formData.fullAddress,
        mobileNumber: formData.mobileNumber,
        email: formData.email,
        password: formData.password,
        createdAt: new Date().toISOString(),
        isActive: true,
        referredBy: formData.referralCode || undefined,
        subscription: selectedPlanData ? {
          planId: selectedPlanData.id,
          planType: selectedPlanData.planType,
          duration: selectedPlanData.name,
          price: selectedPlanData.price,
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + (planDurationMonths * 30 * 24 * 60 * 60 * 1000)).toISOString(),
          status: 'active' as const
        } : undefined,
        profileImage: ""
      };

      const success = await createUser(newUser);

      if (success) {
        const registeredUser = success.user;
        const needsPayment = registeredUser?.subscription?.status === "pending_payment";

        if (needsPayment && registeredUser?.token) {
          // Paid plan chosen at signup — log the user in with the token already
          // issued at registration, then continue straight into checkout.
          setToken(registeredUser.token);

          try {
            const order = await createCheckoutOrder(formData.selectedPlan);
            const paymentResponse = await openRazorpayCheckout({
              order,
              userName: formData.name,
              userEmail: formData.email,
              userContact: formData.mobileNumber,
            });

            await verifyPayment(paymentResponse);

            const freshProfile = await getProfile();
            setCurrentUser(freshProfile);

            toast({ title: "Payment Successful", description: "Your account and plan are ready." });
            navigate("/");
          } catch (err: unknown) {
            // Account exists but payment wasn't completed — send them to login;
            // they can finish payment from Our Plans afterwards.
            if (err instanceof Error && err.message === "PAYMENT_CANCELLED") {
              toast({
                title: "Payment Cancelled",
                description: "Your account was created. You can complete payment anytime from Our Plans.",
              });
            } else {
              toast({
                title: "Payment Failed",
                description: "Your account was created but payment didn't go through. Please complete it from Our Plans.",
                variant: "destructive",
              });
            }
            navigate("/login");
          }
        } else {
          toast({ title: t('signupSuccess') });
          navigate("/login");
        }
      } else {
        setError(t('userExists'));
      }
    } catch (err: unknown) {
      const message = axios.isAxiosError(err) ? err.response?.data?.message : undefined;
      setError(message || "Failed to create account. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-6">
        <div className="flex w-full items-center justify-between">
          <div 
            className="
              justify-center
              whitespace-nowrap
              text-sm
              font-medium
              cursor-pointer
              ring-offset-background
              transition-colors
              focus-visible:outline-none
              focus-visible:ring-2
              focus-visible:ring-ring
              focus-visible:ring-offset-2
              disabled:pointer-events-none
              disabled:opacity-50
              [&_svg]:pointer-events-none
              [&_svg]:size-4
              [&_svg]:shrink-0
              border
              border-input
              bg-background
              hover:bg-accent
              hover:text-accent-foreground
              h-9
              rounded-md
              px-3
              flex
              items-center
              gap-2
            "
            onClick={()=>{
              navigate("/");
            }}
          >
            <Home className="w-4 h-4" />Back to Home
          </div>
          <div className="flex">
            <LanguageSwitcher />
          </div>
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
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">{t('name')} <span className="text-[#ff0000]">*</span></Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder={t('name')}
                    {...register("name")}
                  />
                  {errors.name && (
                    <p className="text-xs text-destructive">{errors.name.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="mobileNumber">{t('mobileNumber')} <span className="text-[#ff0000]">*</span></Label>
                  <Input
                    id="mobileNumber"
                    type="tel"
                    placeholder="10-digit mobile number"
                    pattern="[0-9]{10}"
                    maxLength={10}
                    {...register("mobileNumber")}
                  />
                  {errors.mobileNumber && (
                    <p className="text-xs text-destructive">{errors.mobileNumber.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fullAddress">{t('fullAddress')} <span className="text-[#ff0000]">*</span></Label>
                <Input
                  id="fullAddress"
                  type="text"
                  placeholder={t('fullAddress')}
                  {...register("fullAddress")}
                />
                {errors.fullAddress && (
                  <p className="text-xs text-destructive">{errors.fullAddress.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">{t('email')} <span className="text-[#ff0000]">*</span></Label>
                <Input
                  id="email"
                  type="email"
                  placeholder={t('email')}
                  {...register("email")}
                />
                {errors.email && (
                  <p className="text-xs text-destructive">{errors.email.message}</p>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="password">{t('password')} <span className="text-[#ff0000]">*</span></Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showNew ? "text" : "password"}
                      placeholder={t('password')}
                      {...register("password")}
                    />
                    <button type="button" onClick={() => setShowNew(!showNew)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-xs text-destructive">{errors.password.message}</p>
                  )}
                  {/* Strength bar */}
                  <div className="h-1 rounded-full bg-muted overflow-hidden">
                    <div className={`h-full rounded-full transition-all ${strengthColor}`}
                      style={{ width: strengthWidth }} />
                  </div>
                  {/* Requirements */}
                  <div className="space-y-1">
                    {[
                      { ok: passwordStrength.hasLen,   label: "At least 6 characters" },
                      { ok: passwordStrength.hasUpper, label: "One uppercase letter"  },
                      { ok: passwordStrength.hasNum,   label: "One number"            },
                    ].map(({ ok, label }) => (
                      <div key={label}
                        className={`flex items-center gap-1.5 text-xs transition-colors ${ok ? "text-green-600" : "text-muted-foreground"}`}>
                        {ok
                          ? <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                          : <Circle       className="w-3.5 h-3.5 shrink-0" />}
                        {label}
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">{t('confirmPassword')} <span className="text-[#ff0000]">*</span></Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirm ? "text" : "password"}
                      placeholder={t('confirmPassword')}
                      {...register("confirmPassword")}
                    />
                    <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>
                  )}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="selectedPlan">{t('SelectSubscriptionPlan')} <span className="text-[#ff0000]">*</span></Label>
                  <Controller
                    name="selectedPlan"
                    control={control}
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger id="selectedPlan">
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
                    )}
                  />
                  {errors.selectedPlan && (
                    <p className="text-xs text-destructive">{errors.selectedPlan.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="referralCode">{t('ReferralCode')+' ('+t('Optional')+')'}</Label>
                  <div className="flex gap-2">
                    <Input
                      id="referralCode"
                      type="text"
                      placeholder={t('ReferralCode') + ' (' + t('Optional') + ')'}
                      className="flex-1"
                      maxLength={7}
                      disabled={isValidReferralCode}
                      {...register("referralCode", {
                        onChange: (e) => {
                          e.target.value = e.target.value.toUpperCase();
                          setIsValidReferralCode(false);
                        },
                      })}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={async () => {
                        const code = getValues("referralCode") || "";
                        const isValid = await checkReferralCode(code);
                        setIsValidReferralCode(isValid);

                        if (isValid) {
                          const pendingReferral = JSON.parse(
                            localStorage.getItem("pendingReferral") || "{}"
                          );

                          toast({
                            title: "Referral Code Validated!",
                            description: `Valid referral from ${pendingReferral.referrerName}. You'll receive ₹100 discount!`,
                          });
                        } else {
                          toast({
                            title: "Invalid Referral Code",
                            description: "Please check your referral code and try again.",
                            variant: "destructive",
                          });
                        }
                      }}
                      disabled={!referralCodeValue || isValidReferralCode}
                      className={`whitespace-nowrap transition-colors ${
                        isValidReferralCode
                          ? "bg-green-100 text-green-700 border-green-500 hover:bg-green-100"
                          : ""
                      }`}
                    >
                      {isValidReferralCode ? (
                        <span className="flex items-center gap-1">
                          Validated
                          <Check className="h-4 w-4" />
                        </span>
                      ) : (
                        t("validate")
                      )}
                    </Button>
                  </div>
                  {errors.referralCode && (
                    <p className="text-xs text-destructive">{errors.referralCode.message}</p>
                  )}
                  {referralCodeValue && !isValidReferralCode && (
                    <p className="text-xs text-muted-foreground">
                      Click 'Validate' to check your referral code
                    </p>
                  )}
                </div>
              </div>

              <div className="grid lg:grid-cols-2 gap-4">
                {selectedPlanId && selectedPlanId !== '1month-free' && (
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

                        {!isValidReferralCode && !referralCodeValue && (
                          <div className="bg-accent/90 border border-accent/60 rounded-lg p-3">
                            <p className="text-sm text-foreground/80 flex items-center gap-2">
                              💡 <span><strong>Pro Tip:</strong> Enter a valid referral code to get an instant ₹{referralConfig.SIGNUP_DISCOUNT_AMOUNT} discount!</span>
                            </p>
                          </div>
                        )}

                        {isValidReferralCode && referralCodeValue && (
                          <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-sm font-medium text-green-800 dark:text-green-300">Referral Discount:</span>
                              <span className="font-semibold text-green-800 dark:text-green-300">-₹{referralConfig.SIGNUP_DISCOUNT_AMOUNT}</span>
                            </div>
                            <p className="text-xs text-green-700 dark:text-green-400 flex items-center gap-1">
                              🎉 <span>Congratulations! You've received ₹100 discount with referral code: <strong>{referralCodeValue}</strong></span>
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
                          {isValidReferralCode && referralCodeValue && (
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

              <div
                className={`rounded-lg border p-3 text-sm ${
                  isValidReferralCode
                    ? "border-green-300 bg-green-50 text-green-700"
                    : "border-blue-200 bg-blue-50 text-blue-700"
                }`}
              >
                {isValidReferralCode ? (
                  <p>
                    🎉 <strong>Congratulations!</strong> You got a{" "}
                    <strong>₹{referralConfig.SIGNUP_DISCOUNT_AMOUNT} discount</strong>. Pick any paid subscription plan to
                    receive your discount.
                  </p>
                ) : (
                  <p>
                    💰 Enter a valid <strong>Referral Code</strong> and get an instant{" "}
                    <strong>₹{referralConfig.SIGNUP_DISCOUNT_AMOUNT} discount</strong> on any paid subscription plan.
                  </p>
                )}
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? t('loading') : selectedPlanId !== '1month-free' && selectedPlanId?.trim() !== ''  ? t('makePaymentCreateAccount') : t('createAccount')}
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
                Explore &nbsp;  
                <Link to="/our-plans" className="text-primary hover:underline">
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
