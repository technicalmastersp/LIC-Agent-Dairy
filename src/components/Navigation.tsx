import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Home, Plus, Table, LogOut, User, Menu } from "lucide-react";
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(prev => !prev);
  };

  return (
    <nav className="bg-primary shadow-lg border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary-foreground rounded-full flex items-center justify-center">
              <span className="text-primary font-bold text-sm">LIC</span>
            </div>
            <span className="text-primary-foreground font-semibold text-lg">
              Life Insurance Records
            </span>
          </Link>

          {/* Hamburger Icon (Mobile) */}
          <button
            className="md:hidden text-primary-foreground"
            onClick={toggleMobileMenu}
            aria-label="Toggle Menu"
          >
            <Menu className="w-6 h-6" />
          </button>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
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
                  <span>{t("home")}</span>
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
                  <span>{t("addRecord")}</span>
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
                  <span>{t("viewRecords")}</span>
                </Link>
              </div>
            )}

            <LanguageSwitcher />

            {authenticated ? (
              <div className="flex items-center space-x-2">
                <div
                  className={cn(
                    "flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors",
                    location.pathname === "/profile"
                      ? "bg-primary-light text-primary-foreground"
                      : "text-primary-foreground/80 hover:bg-primary-light/50 hover:text-primary-foreground"
                  )}
                  onClick={() => navigate("/profile")}
                  style={{ cursor: "pointer" }}
                >
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
                  {t("logout")}
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
                  <Link to="/login">{t("login")}</Link>
                </Button>
                <Button
                  size="sm"
                  asChild
                  className="bg-primary-foreground text-primary hover:bg-primary-foreground/90"
                >
                  <Link to="/signup">{t("signup")}</Link>
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 space-y-2 pb-3">
            {authenticated && (
              <div className="flex flex-col space-y-1">
                <Link
                  to="/"
                  className={cn(
                    "flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors",
                    location.pathname === "/"
                      ? "bg-primary-light text-primary-foreground"
                      : "text-primary-foreground/80 hover:bg-primary-light/50 hover:text-primary-foreground"
                  )}
                  onClick={toggleMobileMenu}
                >
                  <Home className="w-4 h-4" />
                  <span>{t("home")}</span>
                </Link>
                <Link
                  to="/add-record"
                  className={cn(
                    "flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors",
                    location.pathname === "/add-record"
                      ? "bg-primary-light text-primary-foreground"
                      : "text-primary-foreground/80 hover:bg-primary-light/50 hover:text-primary-foreground"
                  )}
                  onClick={toggleMobileMenu}
                >
                  <Plus className="w-4 h-4" />
                  <span>{t("addRecord")}</span>
                </Link>
                <Link
                  to="/view-records"
                  className={cn(
                    "flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors",
                    location.pathname === "/view-records"
                      ? "bg-primary-light text-primary-foreground"
                      : "text-primary-foreground/80 hover:bg-primary-light/50 hover:text-primary-foreground"
                  )}
                  onClick={toggleMobileMenu}
                >
                  <Table className="w-4 h-4" />
                  <span>{t("viewRecords")}</span>
                </Link>
              </div>
            )}

            <LanguageSwitcher />

            {authenticated ? (
              <div className="flex flex-col space-y-2 mt-2">
                <div
                  onClick={() => {
                    navigate("/profile");
                    toggleMobileMenu();
                  }}
                  className="flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium text-primary-foreground hover:bg-primary-light/50 transition-colors"
                >
                  <User className="w-4 h-4" />
                  <span>{currentUser?.name}</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    handleLogout();
                    toggleMobileMenu();
                  }}
                  className="w-full bg-primary-foreground/10 text-primary-foreground border-primary-foreground/20 hover:bg-primary-foreground/20"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  {t("logout")}
                </Button>
              </div>
            ) : (
              <div className="flex flex-col space-y-2 mt-2">
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className="w-full bg-primary-foreground/10 text-primary-foreground border-primary-foreground/20 hover:bg-primary-foreground/20"
                >
                  <Link to="/login" onClick={toggleMobileMenu}>
                    {t("login")}
                  </Link>
                </Button>
                <Button
                  size="sm"
                  asChild
                  className="w-full bg-primary-foreground text-primary hover:bg-primary-foreground/90"
                >
                  <Link to="/signup" onClick={toggleMobileMenu}>
                    {t("signup")}
                  </Link>
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;