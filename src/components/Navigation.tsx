import { Link, useLocation, useNavigate } from "react-router-dom";
import { Home, Plus, Table, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getCurrentUser, logout, isAuthenticated } from "@/utils/auth";
import { useLanguage } from "@/hooks/useLanguage";
import LanguageSwitcher from "./LanguageSwitcher";
import { cn } from "@/lib/utils";

const Navigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const currentUser = getCurrentUser();
  const authenticated = isAuthenticated();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="bg-primary shadow-lg border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary-foreground rounded-full flex items-center justify-center">
              <span className="text-primary font-bold text-sm">LIC</span>
            </div>
            <span className="text-primary-foreground font-semibold text-lg">
              Life Insurance Records
            </span>
          </Link>

          <div className="flex items-center space-x-4">
            {authenticated && (
              <div className="flex space-x-1">
                <Link
                  to="/"
                  className={cn(
                    "flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors",
                    location.pathname === "/"
                      ? "bg-primary-light text-primary-foreground"
                      : "text-primary-foreground/80 hover:bg-primary-light/50 hover:text-primary-foreground"
                  )}
                >
                  <Home className="w-4 h-4" />
                  <span>{t('home')}</span>
                </Link>
                <Link
                  to="/add-record"
                  className={cn(
                    "flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors",
                    location.pathname === "/add-record"
                      ? "bg-primary-light text-primary-foreground"
                      : "text-primary-foreground/80 hover:bg-primary-light/50 hover:text-primary-foreground"
                  )}
                >
                  <Plus className="w-4 h-4" />
                  <span>{t('addRecord')}</span>
                </Link>
                <Link
                  to="/view-records"
                  className={cn(
                    "flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors",
                    location.pathname === "/view-records"
                      ? "bg-primary-light text-primary-foreground"
                      : "text-primary-foreground/80 hover:bg-primary-light/50 hover:text-primary-foreground"
                  )}
                >
                  <Table className="w-4 h-4" />
                  <span>{t('viewRecords')}</span>
                </Link>
              </div>
            )}
            
            <LanguageSwitcher />
            
            {authenticated ? (
              <div className="flex items-center space-x-2">
                <div className="hidden md:flex items-center space-x-2 text-sm text-primary-foreground/80">
                  <User className="w-4 h-4" />
                  <span>{currentUser?.name}</span>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleLogout}
                  className="bg-primary-foreground/10 text-primary-foreground border-primary-foreground/20 hover:bg-primary-foreground/20"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  {t('logout')}
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  asChild
                  className="bg-primary-foreground/10 text-primary-foreground border-primary-foreground/20 hover:bg-primary-foreground/20"
                >
                  <Link to="/login">{t('login')}</Link>
                </Button>
                <Button 
                  size="sm" 
                  asChild
                  className="bg-primary-foreground text-primary hover:bg-primary-foreground/90"
                >
                  <Link to="/signup">{t('signup')}</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;