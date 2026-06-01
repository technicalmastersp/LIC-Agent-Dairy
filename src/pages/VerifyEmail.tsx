import { useEffect, useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle2, XCircle, Loader2, MailCheck } from "lucide-react";
import { verifyEmail, resendVerification, logoutCurrentUser } from "../../services/userService";
import { getCurrentUser } from "@/utils/auth";

type VerifyStatus = "verifying" | "success" | "expired" | "invalid" | "already" | "resendedMail";

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate       = useNavigate();

  const [verifyStatus, setVerifyStatus] = useState<VerifyStatus>("verifying"); // ← renamed to avoid clash
  const [email, setEmail]               = useState("");
  const [resendMsg, setResendMsg]       = useState("");
  const [resending, setResending]       = useState(false);

  useEffect(() => {
    const fetchAndVerify = async () => {
      try {
        const token          = searchParams.get("token");
        const tokenFromUser  = getCurrentUser()?.emailVerificationToken;

        let tokenToUse: string | null = null;

        if (token) {
          tokenToUse = token;
        } else if (tokenFromUser) {
          tokenToUse = tokenFromUser;
        } else {
          setVerifyStatus("invalid");
          setEmail(getCurrentUser()?.email || ""); // prefill email if we have user info
          logoutCurrentUser();
          return;
        }

        // ✅ await the result properly
        const result = await verifyEmail(tokenToUse);
        setVerifyStatus(result.status as VerifyStatus);

        logoutCurrentUser(); // Clear any existing session after verification attempt
      } catch (error) {
        console.error(error);
        setVerifyStatus("invalid");
        logoutCurrentUser();
      }
    };

    fetchAndVerify();
  }, []);

  const handleResend = async () => {
    if (!email) return;
    setResending(true);
    const result = await resendVerification(email);
    setResendMsg(result.resendMsg);
    setResending(result.isResendng); // false after call
    setVerifyStatus("resendedMail");
    logoutCurrentUser(); // Clear session to ensure user goes through login flow again
  };

  const states: Record<VerifyStatus, { icon: JSX.Element; bg: string; title: string; desc: string }> = {
    verifying: {
      icon:  <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />,
      bg:    "bg-blue-100",
      title: "Verifying your email…",
      desc:  "Please wait while we verify your email address.",
    },
    success: {
      icon:  <CheckCircle2 className="w-8 h-8 text-green-600" />,
      bg:    "bg-green-100",
      title: "Email verified! 🎉",
      desc:  "Your email has been verified successfully. You can now login.",
    },
    already: {
      icon:  <MailCheck className="w-8 h-8 text-blue-600" />,
      bg:    "bg-blue-100",
      title: "Already verified",
      desc:  "This email is already verified. Please login.",
    },
    expired: {
      icon:  <XCircle className="w-8 h-8 text-amber-600" />,
      bg:    "bg-amber-100",
      title: "Link expired",
      desc:  "This verification link has expired. Request a new one below.",
    },
    invalid: {
      icon:  <XCircle className="w-8 h-8 text-red-600" />,
      bg:    "bg-red-100",
      title: "Invalid link",
      desc:  "This verification link is invalid or has already been used.",
    },
    resendedMail: {
      icon:  <CheckCircle2 className="w-8 h-8 text-green-600" />,
      bg:    "bg-green-100",
        title: "Verification email sent!",
        desc:  "A new verification link has been sent to your email.",
    },
  };

  const s = states[verifyStatus]; // ← always defined now

  return (
    <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="text-center">
            <div className={`w-16 h-16 ${s.bg} rounded-full flex items-center justify-center mx-auto mb-4`}>
              {s.icon}
            </div>
            <CardTitle className="text-2xl text-form-header">{s.title}</CardTitle>
            <CardDescription>{s.desc}</CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {(verifyStatus === "success" || verifyStatus === "already" || verifyStatus === "resendedMail") && (
              <Button className="w-full" onClick={() => navigate("/login")}>
                Go to login
              </Button>
            )}

            {(verifyStatus === "expired" || verifyStatus === "invalid") && (
              <div className="space-y-3">
                <Input
                  type="email"
                  placeholder="Enter your registered email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
                <Button className="w-full" onClick={handleResend} disabled={resending || !email}>
                  {resending ? "Sending…" : "Resend verification link"}
                </Button>
                {resendMsg && (
                  <p className="text-sm text-center text-muted-foreground">{resendMsg}</p>
                )}
                <div className="text-center">
                  <Link to="/login" className="text-sm text-primary hover:underline">
                    Back to login
                  </Link>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VerifyEmail;