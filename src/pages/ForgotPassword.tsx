import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Lock, Mail, ShieldCheck, Eye, EyeOff, CheckCircle2, Circle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { forgotPassword, verifyOTP, resetPassword } from "../../services/userService";

type Step = "email" | "otp" | "password" | "success";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [step, setStep]           = useState<Step>("email");
  const [email, setEmail]         = useState("");
  const [otp, setOtp]             = useState(["", "", "", "", "", ""]);
  const [newPassword, setNew]     = useState("");
  const [confirmPass, setConfirm] = useState("");
  const [showNew, setShowNew]     = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError]         = useState("");
  const [loading, setLoading]     = useState(false);
  const [timer, setTimer]         = useState(30);
  const [canResend, setCanResend] = useState(false);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Countdown timer
  useEffect(() => {
    if (step !== "otp") return;
    setTimer(30); setCanResend(false);
    const interval = setInterval(() => {
      setTimer(t => {
        if (t <= 1) { clearInterval(interval); setCanResend(true); return 0; }
        return t - 1;
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

  const handleSendOTP = async () => {
    if (!email || !email.includes("@")) { setError("Please enter a valid email address."); return; }
    setLoading(true); setError("");
    try {
      await forgotPassword({ email });
      setStep("otp");
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally { setLoading(false); }
  };

  const handleVerifyOTP = async () => {
    const otpValue = otp.join("");
    if (otpValue.length < 6) {
      setError("Please enter the complete 6-digit OTP.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      await verifyOTP({ email, otp: otpValue });
      // ✅ OTP valid — proceed to password step
      setStep("password");
    } catch (err: any) {
      const code    = err.response?.data?.code;
      const message = err.response?.data?.message;

      if (code === "OTP_EXPIRED") {
      // Clear boxes and tell user to resend
      setOtp(["", "", "", "", "", ""]);
      setError("OTP has expired. Please request a new one.");
      setCanResend(true);
      } else if (code === "OTP_INVALID") {
      // Clear boxes, focus first box, let user retry
      setOtp(["", "", "", "", "", ""]);
      setTimeout(() => otpRefs.current[0]?.focus(), 50);
      setError("Invalid OTP. Please check and try again.");
      } else {
      setError(message || "Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (newPassword.length < 6)    { setError("Password must be at least 6 characters."); return; }
    if (newPassword !== confirmPass){ setError("Passwords do not match."); return; }
    setLoading(true); setError("");
    try {
      await resetPassword({ email, otp: otp.join(""), newPassword });
      setStep("success");
    } catch (err: any) {
      setError(err.response?.data?.message || "Invalid OTP or request expired.");
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card>

          {/* ── STEP 1: Email ── */}
          {step === "email" && (
            <>
              <CardHeader className="text-center">
                <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Lock className="w-7 h-7 text-blue-600" />
                </div>
                <CardTitle className="text-2xl text-form-header">Forgot password?</CardTitle>
                <CardDescription>Enter your registered email and we'll send you a 6-digit OTP.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
                <div className="space-y-2">
                  <Label htmlFor="email">Email address</Label>
                  <Input id="email" type="email" placeholder="you@example.com"
                    value={email} onChange={e => setEmail(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleSendOTP()} />
                </div>
                <Button className="w-full" onClick={handleSendOTP} disabled={loading}>
                  {loading ? "Sending…" : "Send OTP"}
                </Button>
                <div className="text-center">
                  <Link to="/login" className="text-sm text-primary hover:underline">Back to login</Link>
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
                <CardTitle className="text-2xl text-form-header">Check your email</CardTitle>
                <CardDescription>
                  We sent a 6-digit OTP to <strong className="text-foreground">{email}</strong>
                </CardDescription>
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
                  Didn't receive it?{" "}
                  {canResend
                    ? <button onClick={handleSendOTP} className="text-primary hover:underline">Resend OTP</button>
                    : <span>Resend in {timer}s</span>
                  }
                </p>
                <Button className="w-full" onClick={handleVerifyOTP} disabled={loading}>
                  {loading ? "Verifying…" : "Verify OTP"}
                </Button>
                <button onClick={() => setStep("email")}
                  className="w-full text-sm text-muted-foreground hover:text-foreground text-center">
                  ← Change email
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
                <CardTitle className="text-2xl text-form-header">Set new password</CardTitle>
                <CardDescription>Choose a strong password for your account.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}

                <div className="space-y-2">
                  <Label htmlFor="np">New password</Label>
                  <div className="relative">
                    <Input id="np" type={showNew ? "text" : "password"} placeholder="Min. 6 characters"
                      value={newPassword} onChange={e => setNew(e.target.value)} className="pr-10" />
                    <button type="button" onClick={() => setShowNew(!showNew)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {/* Strength bar */}
                  <div className="h-1 rounded-full bg-muted overflow-hidden">
                    <div className={`h-full rounded-full transition-all ${strengthColor}`}
                      style={{ width: `${(strength.score / 3) * 100}%` }} />
                  </div>
                  {/* Requirements */}
                  <div className="space-y-1 text-xs">
                    {[
                      { ok: strength.hasLen,   label: "At least 6 characters" },
                      { ok: strength.hasUpper, label: "One uppercase letter"  },
                      { ok: strength.hasNum,   label: "One number"            },
                    ].map(({ ok, label }) => (
                      <div key={label} className={`flex items-center gap-1.5 ${ok ? "text-green-600" : "text-muted-foreground"}`}>
                        {ok ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Circle className="w-3.5 h-3.5" />}
                        {label}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cp">Confirm password</Label>
                  <div className="relative">
                    <Input id="cp" type={showConfirm ? "text" : "password"} placeholder="Re-enter password"
                      value={confirmPass} onChange={e => setConfirm(e.target.value)} className="pr-10" />
                    <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {confirmPass && (
                    <p className={`text-xs ${newPassword === confirmPass ? "text-green-600" : "text-red-500"}`}>
                      {newPassword === confirmPass ? "✓ Passwords match" : "✗ Passwords do not match"}
                    </p>
                  )}
                </div>

                <Button className="w-full" onClick={handleResetPassword} disabled={loading}>
                  {loading ? "Resetting…" : "Reset password"}
                </Button>
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
                <CardTitle className="text-2xl text-form-header">Password reset!</CardTitle>
                <CardDescription>
                  Your password has been updated successfully.<br />
                  You can now login with your new password.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" onClick={() => navigate("/login")}>Go to login</Button>
              </CardContent>
            </>
          )}

        </Card>
      </div>
    </div>
  );
};

export default ForgotPassword;