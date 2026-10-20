import axios from "axios";
import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import SEO from "@/components/SEO";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { LogIn, EyeOff, Eye, User, Home } from "lucide-react";
import { setCurrentUser } from "@/utils/auth";
import { useLanguage } from "@/hooks/useLanguage";
import { useToast } from "@/hooks/use-toast";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { login, getProfile } from "../../services/userService";
import Trans from "@/components/Trans";

const Login = () => {
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [showCur, setShowCur] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { toast } = useToast();

  const [searchParams] = useSearchParams();
  const reason = searchParams.get("reason");

  const userNamelocaStorage = localStorage.getItem('userName')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // const user = validateLogin({ userId, password });
      let user = await login({ userId, password });
      
      if (user.status !== 'error') {
        user = await getProfile()
        setCurrentUser(user);
        toast({
          title: t('auth.loginSuccess'),
          description: `${t('common.welcome')}, ${user.name}!`,
        });
        navigate("/");
        window.location.reload();
      } else {
        setError(t('auth.invalidCredentials'));
      }
    } catch (err) {
      // Don't blame the password for an outage or a timeout.
      if (axios.isAxiosError(err) && (!err.response || err.response.status >= 500)) {
        setError(t('auth.loginServerError'));
      } else if (axios.isAxiosError(err) && err.response?.status === 429) {
        // Account temporarily locked after repeated wrong passwords (or the IP rate limit).
        const data = err.response.data;
        if (data?.code === "LOGIN_LOCKED" && typeof data.retryAfterSeconds === "number") {
          setError(t('auth.accountLocked', { n: Math.max(1, Math.ceil(data.retryAfterSeconds / 60)) }));
        } else {
          setError(data?.message || t('auth.accountLocked', { n: 15 }));
        }
      } else if (axios.isAxiosError(err) && err.response?.status === 403 && err.response.data?.message) {
        setError(err.response.data.message); // e.g. email not verified / account disabled
      } else {
        // Wrong password: warn when the account is about to lock (server sends attemptsLeft).
        const left = (err as { attemptsLeft?: number })?.attemptsLeft;
        const hint = typeof left === "number" && left > 0 && left <= 2
          ? ` ${t('auth.attemptsLeft', { count: left })}`
          : "";
        setError(t('auth.invalidCredentials') + hint);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const EyeToggle = ({ show, onToggle }: { show: boolean; onToggle: () => void }) => (
    <button type="button" onClick={onToggle}
      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
      {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
    </button>
  );

  return (
    <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
      <SEO
        title={t('auth.log')}
        description={t('auth.logInToYourPolicy')}
        path="/login"
      />
      <div className="w-full max-w-md space-y-6">
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
            <Home className="w-4 h-4" />{t('auth.backToHome')}
          </div>
          <div className="flex">
            <LanguageSwitcher />
          </div>
        </div>
        
        <Card>
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
              <LogIn className="w-8 h-8 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-semibold leading-none tracking-tight text-form-header">{t('auth.loginTitle')}</h1>
            <CardDescription>
              {t('common.welcome')}{' '} {userNamelocaStorage != null ? t('auth.ji', { name: userNamelocaStorage }) : ''}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {reason === "session_ended" && (
              <div className="bg-orange-50 border border-orange-200 text-orange-700 text-sm rounded-lg px-4 py-3 text-center">
                {t('auth.yourSessionWasEnded')}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="userId">{t('auth.userIdOrEmailId')}</Label>
                <Input
                  id="userId"
                  type="text"
                  placeholder={t('auth.enterUserIdOrEmailId')}
                  value={userId}
                  onChange={(e) => setUserId(e.target.value.trim())}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">{t('common.password')}</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showCur ? "text" : "password"}
                    placeholder={t('common.password')}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <EyeToggle show={showCur} onToggle={() => setShowCur(!showCur)} />
                </div>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? t('common.loading') : t('nav.login')}
              </Button>
            </form>

            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                {t('auth.dontHaveAccount')}{" "}
                <Link to="/signup" className="text-primary hover:underline">
                  {t('nav.signupFree')}
                </Link>
              </p>
              <p className="text-sm text-muted-foreground py-1">
                <Link to="/forgot-password" className="text-primary hover:underline">
                  {t('auth.forgotPassword')}
                </Link>
              </p>
              <p className="text-sm text-muted-foreground">
                <Trans i18nKey="auth.exploreOurPlans" components={{ link: <Link to="/our-plans" className="text-primary hover:underline" /> }} /></p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;