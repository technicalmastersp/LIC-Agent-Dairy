import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { LogIn, User } from "lucide-react";
import { validateLogin, setCurrentUser, initializeTestUser } from "@/utils/auth";
import { useLanguage } from "@/hooks/useLanguage";
import { useToast } from "@/hooks/use-toast";
import LanguageSwitcher from "@/components/LanguageSwitcher";

const Login = () => {
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { toast } = useToast();

  // Initialize test user on component mount
  useState(() => {
    initializeTestUser();
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const user = validateLogin({ userId, password });
      
      if (user) {
        setCurrentUser(user);
        toast({
          title: t('loginSuccess'),
          description: `${t('welcome')}, ${user.name}!`,
        });
        navigate("/");
      } else {
        setError(t('invalidCredentials'));
      }
    } catch (err) {
      setError(t('invalidCredentials'));
    } finally {
      setIsLoading(false);
    }
  };

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
              {t('welcomeBack')} Sir
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="userId">{t('userId')}</Label>
                <Input
                  id="userId"
                  type="text"
                  placeholder={t('userId')}
                  value={userId}
                  onChange={(e) => setUserId(e.target.value.trim())}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">{t('password')}</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder={t('password')}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
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
              <p className="text-sm text-muted-foreground">
                {/* {t('dontHaveAccount')}{" "} */}Explore &nbsp;  
                <Link to="/our-plans" className="text-primary hover:underline">
                  {/* {t('signup')} */}
                  Our Plans
                </Link>
              </p>
            </div>

            {/* Test Credentials */}
            <Card className="bg-accent/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-form-subheader">{t('testCredentials')}</CardTitle>
              </CardHeader>
              <CardContent className="text-xs space-y-1">
                <p>{t('testUserId')}</p>
                <p>{t('testPassword')}</p>
              </CardContent>
            </Card>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;