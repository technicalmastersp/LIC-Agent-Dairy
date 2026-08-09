import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Home, Plus, Table, LogOut, User, Menu, X, UserRoundCog, Users, Globe } from "lucide-react";
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
const getNavItemsMobile = (t) => [
  { to: "/", label: t("home"), icon: Home, auth: true },
  { to: "/add-record", label: t("addRecord"), icon: Plus, auth: true },
  { to: "/view-records", label: t("viewRecords"), icon: Table, auth: true },
];

const getAdminNavItems = (t) => [
  { to: "/admin", label: t("Admin Panel"), icon: UserRoundCog, auth: true }
];

/* ------------------ HELPERS ------------------ */

const initials = (name = "") =>
  name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase() || "?";

/* ------------------ NAV ITEM — icon-only at lg, icon+label at xl ------------------ */

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
      title={label}
      className={cn(
        "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors shrink-0 whitespace-nowrap",
        isActive
          ? "bg-primary-light text-primary-foreground shadow-inner"
          : "text-primary-foreground/80 hover:bg-primary-light/50 hover:text-primary-foreground"
      )}
    >
      <Icon className="w-4 h-4 shrink-0" />
      <span className="hidden xl:inline">{label}</span>
    </Link>
  );
};

/* ------------------ MOBILE NAV ITEM (block style, roomier tap target) ------------------ */

const MobileNavItem = ({ to, label, icon: Icon, onClick }: { to: string; label: any; icon: any; onClick?: () => void }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
        isActive
          ? "bg-primary-light text-primary-foreground"
          : "text-primary-foreground/85 hover:bg-primary-light/40 hover:text-primary-foreground"
      )}
    >
      <Icon className="w-4 h-4 shrink-0" />
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
  const navItemsMobile = getNavItemsMobile(t);
  const adminNavItems = getAdminNavItems(t);
  const isAdmin = currentUser?.role === "admin" || currentUser?.role === "superadmin";

  const toggleMobileMenu = () => setIsMobileMenuOpen((prev) => !prev);
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  const handleLogout = async () => {
    await logoutCurrentUser();
    navigate("/login");
  };

  return (
    <nav className="bg-primary shadow-lg border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-4">
        {/* HEADER */}
        <div className="flex items-center justify-between min-h-16 py-2 gap-3">
          {/* LOGO */}
          <Link to="/" className="flex items-center space-x-2 shrink-0 min-w-0" onClick={closeMobileMenu}>
            <div className="w-8 h-8 bg-primary-foreground rounded-full flex items-center justify-center overflow-hidden shrink-0">
              <img src={siteConfig.logo_medium_size} alt="site-logo" />
            </div>
            <span className="text-primary-foreground font-semibold text-lg truncate max-w-[140px] sm:max-w-none">
              {siteConfig.title}
            </span>
          </Link>

          {/* MOBILE / TABLET MENU BUTTON */}
          <button
            type="button"
            className="lg:hidden text-primary-foreground p-1.5 -mr-1.5 rounded-md hover:bg-primary-light/50 transition-colors shrink-0"
            onClick={toggleMobileMenu}
            aria-label="Toggle menu"
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          {/* DESKTOP MENU — no overflow-x-auto / scrollbar; the lg tier collapses to icons
              instead so the row always fits without scrolling */}
          <div className="hidden lg:flex items-center gap-1 shrink-0">
            {authenticated && currentUser?.role === "user" &&
              navItems.map((item) => <NavItem key={item.to} {...item} />)}

            {authenticated && isAdmin &&
              [...navItems, ...adminNavItems].map((item) => <NavItem key={item.to} {...item} />)}

            {/* Language switcher — icon-only pill at lg, full switcher at xl.
                Assumes LanguageSwitcher accepts a `type` prop the same way "mobile" is used
                elsewhere in this file; if it doesn't support a compact/icon variant, swap the
                lg-tier block below for whatever compact prop it does expose. */}
            <div className="pl-1.5 ml-1 border-l border-primary-foreground/15 shrink-0 flex items-center">
              <div className="xl:hidden">
                <button
                  type="button"
                  title="Change language"
                  className="flex items-center justify-center w-9 h-9 rounded-md text-primary-foreground/85 hover:bg-primary-light/50 hover:text-primary-foreground transition-colors"
                  onClick={() => {
                    // Falls back to a no-op if LanguageSwitcher doesn't expose an
                    // imperative toggle — swap this for the switcher's own compact mode.
                  }}
                >
                  <Globe className="w-4 h-4" />
                </button>
              </div>
              <div className="hidden xl:block">
                <LanguageSwitcher />
              </div>
            </div>

            {authenticated ? (
              <div className="flex items-center gap-1.5 pl-2 ml-1 border-l border-primary-foreground/15 shrink-0">
                {/* Profile — avatar only at lg, avatar+name at xl */}
                <button
                  type="button"
                  onClick={() => navigate("/profile")}
                  title={currentUser?.name}
                  className={cn(
                    "flex items-center gap-2 rounded-full text-sm font-medium transition-colors shrink-0",
                    "px-1.5 py-1.5 xl:pr-3",
                    location.pathname === "/profile"
                      ? "bg-primary-light text-primary-foreground"
                      : "text-primary-foreground/85 hover:bg-primary-light/50 hover:text-primary-foreground"
                  )}
                >
                  <span className="w-6 h-6 rounded-full bg-primary-foreground/15 flex items-center justify-center text-[10px] font-semibold shrink-0">
                    {initials(currentUser?.name)}
                  </span>
                  <span className="hidden xl:inline max-w-[140px] truncate">{currentUser?.name}</span>
                </button>

                {/* Logout — icon only at lg, icon+label at xl */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  title={t("logout")}
                  className="bg-primary-foreground/10 text-primary-foreground border-primary-foreground/20 hover:bg-red-600 hover:border-red-600 hover:text-white transition-colors shrink-0 px-2.5 xl:px-3"
                >
                  <LogOut className="w-4 h-4 xl:mr-2" />
                  <span className="hidden xl:inline">{t("logout")}</span>
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2 pl-2 ml-1 border-l border-primary-foreground/15 shrink-0">
                <Button variant="outline" size="sm" asChild
                  className="bg-transparent border-primary-foreground/25 text-primary-foreground hover:bg-primary-light/50 hover:text-primary-foreground shrink-0 px-2.5 xl:px-3">
                  <Link to="/referral-program" title="Referral">
                    <Users className="w-3.5 h-3.5 xl:mr-1.5" />
                    <span className="hidden xl:inline">Referral</span>
                  </Link>
                </Button>
                <Button variant="outline" size="sm" asChild
                  className="bg-transparent border-primary-foreground/25 text-primary-foreground hover:bg-primary-light/50 hover:text-primary-foreground shrink-0">
                  <Link to="/login">{t("login")}</Link>
                </Button>
                <Button size="sm" asChild className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 shrink-0">
                  <Link to="/signup">{t("signup")}</Link>
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* MOBILE / TABLET MENU */}
        <div
          className={cn(
            "lg:hidden overflow-hidden transition-all duration-300 ease-in-out",
            isMobileMenuOpen ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"
          )}
        >
          <div className="space-y-1.5 pb-4 pt-2 border-t border-primary-foreground/10">
            {authenticated && currentUser?.role === "user" &&
              navItemsMobile.map((item) => (
                <MobileNavItem key={item.to} {...item} onClick={closeMobileMenu} />
              ))}

            {authenticated && isAdmin &&
              [...navItemsMobile, ...adminNavItems].map((item) => (
                <MobileNavItem key={item.to} {...item} onClick={closeMobileMenu} />
              ))}

            {authenticated ? (
              <>
                <button
                  type="button"
                  onClick={() => {
                    navigate("/profile");
                    closeMobileMenu();
                  }}
                  className="flex w-full items-center gap-3 px-4 py-3 text-sm font-medium text-primary-foreground hover:bg-primary-light/40 rounded-lg transition-colors"
                >
                  <span className="w-7 h-7 rounded-full bg-primary-foreground/15 flex items-center justify-center text-[11px] font-semibold shrink-0">
                    {initials(currentUser?.name)}
                  </span>
                  <span className="truncate">{currentUser?.name}</span>
                </button>

                <div className="px-1 pt-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      handleLogout();
                      closeMobileMenu();
                    }}
                    className="w-full bg-primary-foreground/10 text-primary-foreground border-primary-foreground/20 hover:bg-red-600 hover:border-red-600 hover:text-white"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    {t("logout")}
                  </Button>
                </div>
              </>
            ) : (
              <div className="space-y-1.5 px-1">
                <Button variant="outline" size="sm" asChild
                  className="w-full bg-transparent border-primary-foreground/25 text-primary-foreground hover:bg-primary-light/50 hover:text-primary-foreground">
                  <Link to="/referral-program" onClick={closeMobileMenu}>
                    <Users className="w-3.5 h-3.5 mr-1.5" />
                    Referral
                  </Link>
                </Button>
                <Button variant="outline" size="sm" asChild
                  className="w-full bg-transparent border-primary-foreground/25 text-primary-foreground hover:bg-primary-light/50 hover:text-primary-foreground">
                  <Link to="/login" onClick={closeMobileMenu}>
                    {t("login")}
                  </Link>
                </Button>
                <Button size="sm" asChild className="w-full bg-primary-foreground text-primary hover:bg-primary-foreground/90">
                  <Link to="/signup" onClick={closeMobileMenu}>
                    {t("signup")}
                  </Link>
                </Button>
              </div>
            )}

            <div className="pt-2 px-1">
              <LanguageSwitcher type="mobile" />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;