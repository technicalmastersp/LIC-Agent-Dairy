import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { useForm } from "react-hook-form";
import { i18nZodResolver as zodResolver } from "@/i18n/zodResolver";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Lock, Mail, ShieldCheck, Eye, EyeOff, CheckCircle2, Circle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { forgotPassword, verifyOTP, resetPassword } from "../../services/userService";
import { forgotPasswordEmailSchema, resetPasswordSchema } from "@/schemas/forgotPasswordSchema";
import type { ForgotPasswordEmailValues, ResetPasswordValues } from "@/types/schemas/forgotPasswordSchema.types";
import SEO from "@/components/SEO";
import type { Step } from "@/types/pages/ForgotPassword.types";
import { useLanguage } from "@/hooks/useLanguage";
import Trans from "@/components/Trans";
const ForgotPassword = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [step, setStep]           = useState<Step>("email");
  const [email, setEmail]         = useState("");
  const [otp, setOtp]             = useState(["", "", "", "", "", ""]);
  const [showNew, setShowNew]     = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError]         = useState("");
  const [loading, setLoading]     = useState(false);
  const [timer, setTimer]         = useState(30);
  const [canResend, setCanResend] = useState(false);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  const emailForm = useForm<ForgotPasswordEmailValues>({
    resolver: zodResolver(forgotPasswordEmailSchema),
    defaultValues: { email: "" },
  });

  const passwordForm = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { newPassword: "", confirmPassword: "" },
  });
  const newPassword = passwordForm.watch("newPassword");
  const confirmPass = passwordForm.watch("confirmPassword");

  // Countdown timer
  useEffect(() => {
    if (step !== "otp") return;
    setTimer(30); setCanResend(false);
    const interval = setInterval(() => {
      setTimer(sec => {
        if (sec <= 1) { clearInterval(interval); setCanResend(true); return 0; }
        return sec - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [step]);

  const handleOTPChange = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return;
    const updated = [...otp];
    updated[index] = value;
    setOtp(updated);
    if (value && index < 5) otpRefs.current[index + 1]?.focus();
  };

  const handleOTPKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0)
      otpRefs.current[index - 1]?.focus();
  };

  const strength = (() => {
    const hasLen   = newPassword.length >= 6;
    const hasUpper = /[A-Z]/.test(newPassword);
    const hasNum   = /\d/.test(newPassword);
    return { hasLen, hasUpper, hasNum, score: [hasLen, hasUpper, hasNum].filter(Boolean).length };
  })();

  const strengthColor = ["", "bg-red-400", "bg-yellow-400", "bg-green-500"][strength.score];

  const handleSendOTP = async (data: ForgotPasswordEmailValues) => {
    setLoading(true); setError("");
    try {
      await forgotPassword({ email: data.email });
      setEmail(data.email);
      setStep("otp");
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } catch {
      setError(t('auth.somethingWentWrongPleaseTry'));
    } finally { setLoading(false); }
  };

  // "Resend OTP" (step 2) re-sends to the already-captured email — no form
  // to (re)validate at that point, unlike the initial send in step 1.
  const handleResendOTP = async () => {
    setLoading(true); setError("");
    try {
      await forgotPassword({ email });
      setOtp(["", "", "", "", "", ""]);
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } catch {
      setError(t('auth.somethingWentWrongPleaseTry'));
    } finally { setLoading(false); }
  };

  const handleVerifyOTP = async () => {
    const otpValue = otp.join("");
    if (otpValue.length < 6) {
      setError(t('auth.pleaseEnterTheComplete6'));
      return;
    }

    setError("");
    setLoading(true);

    try {
      await verifyOTP({ email, otp: otpValue });
      // ✅ OTP valid — proceed to password step
      setStep("password");
    } catch (err: unknown) {
      const code    = axios.isAxiosError(err) ? err.response?.data?.code : undefined;
      const message = axios.isAxiosError(err) ? err.response?.data?.message : undefined;

      if (code === "OTP_EXPIRED") {
      // Clear boxes and tell user to resend
      setOtp(["", "", "", "", "", ""]);
      setError(t('auth.otpHasExpiredPleaseRequest'));
      setCanResend(true);
      } else if (code === "OTP_ATTEMPTS_EXCEEDED" || code === "NO_OTP") {
      // Too many wrong guesses: the server destroyed this OTP. A fresh one is required.
      setOtp(["", "", "", "", "", ""]);
      setError(message || t('auth.tooManyIncorrectAttemptsPlease'));
      setCanResend(true);
      } else if (code === "OTP_INVALID") {
      // Clear boxes, focus first box, let user retry
      setOtp(["", "", "", "", "", ""]);
      setTimeout(() => otpRefs.current[0]?.focus(), 50);
      const left = axios.isAxiosError(err) ? err.response?.data?.attemptsLeft : undefined;
      setError(
        typeof left === "number" && left > 0 && left <= 2
          ? t('auth.invalidOtpAttemptsLeft', { count: left })
          : t('auth.invalidOtpPleaseCheck')
      );
      } else {
      setError(message || t('auth.somethingWentWrongPleaseTry'));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (data: ResetPasswordValues) => {
    setLoading(true); setError("");
    try {
      await resetPassword({ email, otp: otp.join(""), newPassword: data.newPassword });
      setStep("success");
    } catch (err: unknown) {
      const code    = axios.isAxiosError(err) ? err.response?.data?.code : undefined;
      const message = axios.isAxiosError(err) ? err.response?.data?.message : undefined;
      if (code === "OTP_ATTEMPTS_EXCEEDED" || code === "NO_OTP" || code === "OTP_EXPIRED") {
        // This OTP can no longer be used — send the user back to get a new one instead of stranding them.
        setOtp(["", "", "", "", "", ""]);
        setStep("otp");
        setCanResend(true);
      }
      setError(message || t('auth.invalidOtpOrRequestExpired'));
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
      <SEO title={t('auth.forgotPassword2')} description={t('auth.resetYourPolicyNiketanAccount')} path="/forgot-password" noindex />
      <div className="w-full max-w-md">
        <Card>

          {/* ── STEP 1: Email ── */}
          {step === "email" && (
            <>
              <CardHeader className="text-center">
                <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Lock className="w-7 h-7 text-blue-600" />
                </div>
                <CardTitle className="text-2xl text-form-header">{t('auth.forgotPassword')}</CardTitle>
                <CardDescription>{t('auth.enterYourRegisteredEmail')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
                <form onSubmit={emailForm.handleSubmit(handleSendOTP)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">{t('auth.emailAddress')}</Label>
                    <Input id="email" type="email" placeholder="you@example.com"
                      {...emailForm.register("email")} />
                    {emailForm.formState.errors.email && (
                      <p className="text-xs text-destructive">{emailForm.formState.errors.email.message}</p>
                    )}
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? t('auth.sending') : t('auth.sendOtp')}
                  </Button>
                </form>
                <div className="text-center">
                  <Link to="/login" className="text-sm text-primary hover:underline">{t('auth.backToLogin')}</Link>
                </div>
              </CardContent>
            </>
          )}

          {/* ── STEP 2: OTP ── */}
          {step === "otp" && (
            <>
              <CardHeader className="text-center">
                <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-7 h-7 text-blue-600" />
                </div>
                <CardTitle className="text-2xl text-form-header">{t('auth.checkYourEmail')}</CardTitle>
                <CardDescription>
                  <Trans i18nKey="auth.weSentA6Digit" params={{ email }} components={{ strong: <strong className="text-foreground" /> }} /></CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
                <div className="flex gap-2 justify-center">
                  {otp.map((digit, i) => (
                    <Input key={i} ref={el => otpRefs.current[i] = el}
                      type="text" inputMode="numeric" maxLength={1}
                      value={digit}
                      onChange={e => handleOTPChange(i, e.target.value)}
                      onKeyDown={e => handleOTPKeyDown(i, e)}
                      className="w-11 h-12 text-center text-xl font-semibold p-0"
                    />
                  ))}
                </div>
                <p className="text-xs text-center text-muted-foreground">
                  {t('auth.didntReceiveIt')}{" "}
                  {canResend
                    ? <button onClick={handleResendOTP} className="text-primary hover:underline">{t('auth.resendOtp')}</button>
                    : <span>{t('auth.resendInS', { timer })}</span>
                  }
                </p>
                <Button className="w-full" onClick={handleVerifyOTP} disabled={loading}>
                  {loading ? t('auth.verifying') : t('auth.verifyOtp')}
                </Button>
                <button onClick={() => setStep("email")}
                  className="w-full text-sm text-muted-foreground hover:text-foreground text-center">
                  {t('auth.changeEmail')}
                </button>
              </CardContent>
            </>
          )}

          {/* ── STEP 3: New Password ── */}
          {step === "password" && (
            <>
              <CardHeader className="text-center">
                <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ShieldCheck className="w-7 h-7 text-blue-600" />
                </div>
                <CardTitle className="text-2xl text-form-header">{t('auth.setNewPassword')}</CardTitle>
                <CardDescription>{t('auth.chooseAStrongPassword')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}

                <form onSubmit={passwordForm.handleSubmit(handleResetPassword)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="np">{t('auth.newPassword')}</Label>
                    <div className="relative">
                      <Input id="np" type={showNew ? "text" : "password"} placeholder={t('auth.min6Characters')}
                        className="pr-10" {...passwordForm.register("newPassword")} />
                      <button type="button" onClick={() => setShowNew(!showNew)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {passwordForm.formState.errors.newPassword && (
                      <p className="text-xs text-destructive">{passwordForm.formState.errors.newPassword.message}</p>
                    )}
                    {/* Strength bar */}
                    <div className="h-1 rounded-full bg-muted overflow-hidden">
                      <div className={`h-full rounded-full transition-all ${strengthColor}`}
                        style={{ width: `${(strength.score / 3) * 100}%` }} />
                    </div>
                    {/* Requirements */}
                    <div className="space-y-1 text-xs">
                      {[
                        { ok: strength.hasLen,   label: t('auth.atLeast6Characters') },
                        { ok: strength.hasUpper, label: t('auth.oneUppercaseLetter')  },
                        { ok: strength.hasNum,   label: t('auth.oneNumber')            },
                      ].map(({ ok, label }) => (
                        <div key={label} className={`flex items-center gap-1.5 ${ok ? "text-green-600" : "text-muted-foreground"}`}>
                          {ok ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Circle className="w-3.5 h-3.5" />}
                          {label}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cp">{t('auth.confirmPassword')}</Label>
                    <div className="relative">
                      <Input id="cp" type={showConfirm ? "text" : "password"} placeholder={t('auth.reEnterPassword')}
                        className="pr-10" {...passwordForm.register("confirmPassword")} />
                      <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {passwordForm.formState.errors.confirmPassword ? (
                      <p className="text-xs text-destructive">{passwordForm.formState.errors.confirmPassword.message}</p>
                    ) : confirmPass && (
                      <p className={`text-xs ${newPassword === confirmPass ? "text-green-600" : "text-red-500"}`}>
                        {newPassword === confirmPass ? t('auth.passwordsMatch') : t('auth.passwordsDoNotMatch')}
                      </p>
                    )}
                  </div>

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? t('auth.resetting') : t('auth.resetPassword')}
                  </Button>
                </form>
              </CardContent>
            </>
          )}

          {/* ── STEP 4: Success ── */}
          {step === "success" && (
            <>
              <CardHeader className="text-center">
                <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-7 h-7 text-green-600" />
                </div>
                <CardTitle className="text-2xl text-form-header">{t('auth.passwordReset')}</CardTitle>
                <CardDescription>
                  <Trans i18nKey="auth.yourPasswordHasBeenUpdated" />
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" onClick={() => navigate("/login")}>{t('auth.goToLogin')}</Button>
              </CardContent>
            </>
          )}

        </Card>
      </div>
    </div>
  );
};

export default ForgotPassword;