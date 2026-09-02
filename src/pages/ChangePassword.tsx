import { useState } from "react";
import axios from "axios";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Lock, Eye, EyeOff, CheckCircle2, Circle, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { changePassword } from "../../services/userService";
import { changePasswordSchema } from "@/schemas/changePasswordSchema";
import type { ChangePasswordFormValues } from "@/types/schemas/changePasswordSchema.types";

const ChangePassword = () => {
  const navigate   = useNavigate();
  const { toast }  = useToast();

  const [step, setStep]       = useState<"form" | "success">("form");
  const [showCur, setShowCur] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showCon, setShowCon] = useState(false);
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
  });

  const newPass = watch("newPassword");
  const confirmPass = watch("confirmPassword");

  const strength = {
    hasLen:   newPass.length >= 6,
    hasUpper: /[A-Z]/.test(newPass),
    hasNum:   /\d/.test(newPass),
    get score() { return [this.hasLen, this.hasUpper, this.hasNum].filter(Boolean).length; },
  };

  const strengthColor = ["", "bg-red-400", "bg-yellow-400", "bg-green-500"][strength.score];
  const strengthWidth = ["0%", "33%", "66%", "100%"][strength.score];

  const onSubmit = async (data: ChangePasswordFormValues) => {
    setError("");
    setLoading(true);
    try {
      await changePassword({ currentPassword: data.currentPassword, newPassword: data.newPassword });
      setStep("success");
    } catch (err: unknown) {
      const message = axios.isAxiosError(err)
        ? err.response?.data?.message || "Something went wrong. Please try again."
        : "Something went wrong. Please try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const EyeToggle = ({ show, onToggle }: { show: boolean; onToggle: () => void }) => (
    <button type="button" onClick={onToggle}
      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
      {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
    </button>
  );

  return (
    <div className="min-h-screen bg-muted/30 flex flex-col">
      <Navigation />
      <main className="container mx-auto px-4 py-8 flex-1 flex items-center justify-center">
        <div className="w-full max-w-md">
          <Card>

            {/* ── Form ── */}
            {step === "form" && (
              <>
                <CardHeader className="text-center">
                  <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Lock className="w-7 h-7 text-blue-600" />
                  </div>
                  <CardTitle className="text-2xl text-form-header">Change password</CardTitle>
                  <CardDescription>Enter your current password, then choose a new one.</CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    {/* Current password */}
                    <div className="space-y-2">
                      <Label htmlFor="cur">Current password</Label>
                      <div className="relative">
                        <Input id="cur" type={showCur ? "text" : "password"}
                          placeholder="Your current password" className="pr-10"
                          {...register("currentPassword")} />
                        <EyeToggle show={showCur} onToggle={() => setShowCur(!showCur)} />
                      </div>
                      {errors.currentPassword && (
                        <p className="text-xs text-destructive">{errors.currentPassword.message}</p>
                      )}
                    </div>

                    {/* New password */}
                    <div className="space-y-2">
                      <Label htmlFor="np">New password</Label>
                      <div className="relative">
                        <Input id="np" type={showNew ? "text" : "password"}
                          placeholder="Min. 6 characters" className="pr-10"
                          {...register("newPassword")} />
                        <EyeToggle show={showNew} onToggle={() => setShowNew(!showNew)} />
                      </div>
                      {errors.newPassword && (
                        <p className="text-xs text-destructive">{errors.newPassword.message}</p>
                      )}
                      {/* Strength bar */}
                      <div className="h-1 rounded-full bg-muted overflow-hidden">
                        <div className={`h-full rounded-full transition-all ${strengthColor}`}
                          style={{ width: strengthWidth }} />
                      </div>
                      {/* Requirements */}
                      <div className="space-y-1">
                        {[
                          { ok: strength.hasLen,   label: "At least 6 characters" },
                          { ok: strength.hasUpper, label: "One uppercase letter"  },
                          { ok: strength.hasNum,   label: "One number"            },
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

                    {/* Confirm password */}
                    <div className="space-y-2">
                      <Label htmlFor="cp">Confirm new password</Label>
                      <div className="relative">
                        <Input id="cp" type={showCon ? "text" : "password"}
                          placeholder="Re-enter new password" className="pr-10"
                          {...register("confirmPassword")} />
                        <EyeToggle show={showCon} onToggle={() => setShowCon(!showCon)} />
                      </div>
                      {errors.confirmPassword ? (
                        <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>
                      ) : confirmPass && (
                        <p className={`text-xs ${newPass === confirmPass ? "text-green-600" : "text-red-500"}`}>
                          {newPass === confirmPass ? "✓ Passwords match" : "✗ Passwords do not match"}
                        </p>
                      )}
                    </div>

                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? "Updating…" : "Update password"}
                    </Button>
                    <Button type="button" variant="outline" className="w-full" onClick={() => navigate("/profile")}>
                      Cancel
                    </Button>
                  </form>
                </CardContent>
              </>
            )}

            {/* ── Success ── */}
            {step === "success" && (
              <>
                <CardHeader className="text-center">
                  <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Check className="w-7 h-7 text-green-600" />
                  </div>
                  <CardTitle className="text-2xl text-form-header">Password updated!</CardTitle>
                  <CardDescription>
                    Your password has been changed successfully.<br />
                    Use your new password next time you log in.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full" onClick={() => navigate("/profile")}>
                    Back to profile
                  </Button>
                </CardContent>
              </>
            )}

          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ChangePassword;
