import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { LogIn, EyeOff, Eye, User } from "lucide-react";
import { setCurrentUser } from "@/utils/auth";
import { useLanguage } from "@/hooks/useLanguage";
import { useToast } from "@/hooks/use-toast";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { login, getProfile } from "../../services/userService";

const Login = () => {
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [showCur, setShowCur] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { toast } = useToast();

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
          title: t('loginSuccess'),
          description: `${t('welcome')}, ${user.name}!`,
        });
        navigate("/");
        window.location.reload();
      } else {
        setError(t('invalidCredentials'));
      }
    } catch (err) {
      setError(t('invalidCredentials'));
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
      <div className="w-full max-w-md space-y-6">
        <div className="flex justify-end">
          <LanguageSwitcher />
        </div>
        
        <Card>
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
              <LogIn className="w-8 h-8 text-primary-foreground" />
            </div>
            <CardTitle className="text-2xl text-form-header">{t('loginTitle')}</CardTitle>
            <CardDescription>
              {t('welcome')} {userNamelocaStorage != 'undefined' ? `${userNamelocaStorage} Ji` : ''}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="userId">{t('userId')}</Label>
                <Input
                  id="userId"
                  type="text"
                  // placeholder={t('userId')}
                  placeholder='Enter User ID or Email ID'
                  value={userId}
                  onChange={(e) => setUserId(e.target.value.trim())}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">{t('password')}</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showCur ? "text" : "password"}
                    placeholder={t('password')}
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
                {isLoading ? t('loading') : t('login')}
              </Button>
            </form>

            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                {t('dontHaveAccount')}{" "}
                <Link to="/signup" className="text-primary hover:underline">
                  {t('signup')}
                </Link>
              </p>
              <p className="text-sm text-muted-foreground py-1">
                <Link to="/forgot-password" className="text-primary hover:underline">
                  Forgot password?
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

            {/* Test Credentials */}
            {/* <Card className="bg-accent/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-form-subheader">{t('testCredentials')}</CardTitle>
              </CardHeader>
              <CardContent className="text-xs space-y-1">
                <p>{t('testUserId')}</p>
                <p>{t('testPassword')}</p>
              </CardContent>
            </Card> */}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;