import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Home, Plus, Table, LogOut, User, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getCurrentUser, isAuthenticated } from "@/utils/auth";
import { useLanguage } from "@/hooks/useLanguage";
import LanguageSwitcher from "./LanguageSwitcher";
import { cn } from "@/lib/utils";
import siteConfig from "@/config/siteConfig";
import { logoutCurrentUser } from "../../services/userService";

/* ------------------ NAV CONFIG ------------------ */

const getNavItems = (t) => [
  { to: "/", label: t("home"), icon: Home, auth: true },
  { to: "/add-record", label: t("addRecord"), icon: Plus, auth: true },
  { to: "/view-records", label: t("viewRecords"), icon: Table, auth: true },
];

/* ------------------ NAV ITEM ------------------ */

const NavItem = ({ to, label, icon: Icon, onClick,
  }: {
    to: string;
    label: any;
    icon: any;
    onClick?: () => void;
  }
) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      onClick={onClick}
      className={cn(
        "flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors",
        isActive
          ? "bg-primary-light text-primary-foreground"
          : "text-primary-foreground/80 hover:bg-primary-light/50 hover:text-primary-foreground"
      )}
    >
      <Icon className="w-4 h-4" />
      <span>{label}</span>
    </Link>
  );
};

/* ------------------ MAIN COMPONENT ------------------ */

const Navigation = () => {
  const { t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();

  const authenticated = isAuthenticated();
  const currentUser = getCurrentUser();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = getNavItems(t);

  const toggleMobileMenu = () => setIsMobileMenuOpen((prev) => !prev);

  const handleLogout = async () => {
    await logoutCurrentUser();
    navigate("/login");
  };

  return (
    <nav className="bg-primary shadow-lg border-b border-border">
      <div className="container mx-auto px-4">
        {/* HEADER */}
        <div className="flex items-center justify-between h-16">
          {/* LOGO */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary-foreground rounded-full flex items-center justify-center">
              <img src={siteConfig.logo_medium_size} alt="site-logo" />
            </div>
            <span className="text-primary-foreground font-semibold text-lg">
              {siteConfig.title}
            </span>
          </Link>

          {/* MOBILE MENU BUTTON */}
          <button
            type="button"
            className="md:hidden text-primary-foreground"
            onClick={toggleMobileMenu}
            aria-label="Toggle menu"
          >
            <Menu className="w-6 h-6" />
          </button>

          {/* DESKTOP MENU */}
          <div className="hidden md:flex items-center space-x-4">
            {authenticated &&
              navItems.map((item) => (
                <NavItem key={item.to} {...item} />
              ))}

            <LanguageSwitcher />

            {authenticated ? (
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => navigate("/profile")}
                  className={cn(
                    "flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors",
                    location.pathname === "/profile"
                      ? "bg-primary-light text-primary-foreground"
                      : "text-primary-foreground/80 hover:bg-primary-light/50 hover:text-primary-foreground"
                  )}
                >
                  <User className="w-4 h-4" />
                  <span>{currentUser?.name}</span>
                </button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="bg-primary-foreground/10 text-primary-foreground border-primary-foreground/20 hover:bg-red-600 hover:text-primary-foreground"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  {t("logout")}
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" asChild>
                  <Link to="/referral-program">Referral</Link>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <Link to="/login">{t("login")}</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link to="/signup">{t("signup")}</Link>
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* MOBILE MENU */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 space-y-2 pb-4">
            {authenticated &&
              navItems.map((item) => (
                <NavItem
                  key={item.to}
                  {...item}
                  onClick={toggleMobileMenu}
                />
              ))}

            {authenticated ? (
              <>
                <button
                  type="button"
                  onClick={() => {
                    navigate("/profile");
                    toggleMobileMenu();
                  }}
                  className="flex w-full items-center space-x-2 px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary-light/50 rounded-md"
                >
                  <User className="w-4 h-4" />
                  <span>{currentUser?.name}</span>
                </button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    handleLogout();
                    toggleMobileMenu();
                  }}
                  className="w-full"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  {t("logout")}
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" size="sm" asChild className="w-full">
                  <Link to="/referral-program" onClick={toggleMobileMenu}>
                    Referral
                  </Link>
                </Button>
                <Button variant="outline" size="sm" asChild className="w-full">
                  <Link to="/login" onClick={toggleMobileMenu}>
                    {t("login")}
                  </Link>
                </Button>
                <Button size="sm" asChild className="w-full">
                  <Link to="/signup" onClick={toggleMobileMenu}>
                    {t("signup")}
                  </Link>
                </Button>
              </>
            )}

            <LanguageSwitcher type="mobile" />
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;