import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Home, Plus, Table, LogOut, User, Menu, X,
  UserRoundCog, CircleHelp, MapPinnedIcon, Wrench,
  Cake, TrendingUp, Receipt, ShieldCheck, LineChart, ChevronDown,
  LucideIcon
} from "lucide-react";
import { Button }        from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  NavigationMenu, NavigationMenuList, NavigationMenuItem,
  NavigationMenuTrigger, NavigationMenuContent,
} from "@/components/ui/navigation-menu";
import { getCurrentUser, isAuthenticated } from "@/utils/auth";
import { useLanguage }   from "@/hooks/useLanguage";
import LanguageSwitcher  from "./LanguageSwitcher";
import { cn }            from "@/lib/utils";
import siteConfig        from "@/config/siteConfig";
import { logoutCurrentUser } from "../../services/userService";

/* ─────────────────────────────────────────────
   NAV CONFIG
───────────────────────────────────────────── */

type TranslateFunction = (key: string) => string;

const getNavItems = (t: TranslateFunction) => [
  { to: "/",             label: t("home"),        icon: Home        },
  { to: "/add-record",   label: t("addRecord"),   icon: Plus        },
  { to: "/view-records", label: t("viewRecords"), icon: Table       },
];

const getNavItemsMobile = (t: TranslateFunction) => [
  { to: "/",             label: t("home"),        icon: Home        },
  { to: "/add-record",   label: t("addRecord"),   icon: Plus        },
  { to: "/view-records", label: t("viewRecords"), icon: Table       },
];

const getAdminNavItems = (t: TranslateFunction) => [
  { to: "/admin", label: "Admin Panel", icon: UserRoundCog },
];

const TOOLS = [
  { to: "/tools/age-calculator", icon: Cake, label: "Age Calculator" },
  { to: "/tools/sip-calculator", icon: TrendingUp, label: "SIP Calculator" },
  { to: "/tools/income-tax-calculator", icon: Receipt, label: "Income Tax Calculator" },
  { to: "/tools/home-loan-emi-calculator", icon: Home, label: "Home Loan EMI Calculator" },
  { to: "/tools/term-insurance-calculator", icon: ShieldCheck, label: "Term Insurance Calculator" },
  { to: "/tools/inflation-calculator", icon: LineChart, label: "Inflation Calculator" },
];

/* ─────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────── */

const initials = (name = "") =>
  name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase() || "?";

/* ─────────────────────────────────────────────
   DESKTOP NAV ITEM
───────────────────────────────────────────── */

const NavItem = ({
  to, label, icon: Icon, onClick,
}: {
  to: string; label: string; icon: LucideIcon; onClick?: () => void;
}) => {
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
      <span className="xl:inline">{label}</span>
    </Link>
  );
};

/* ─────────────────────────────────────────────
   MOBILE NAV ITEM
───────────────────────────────────────────── */

const MobileNavItem = ({
  to, label, icon: Icon, onClick,
}: {
  to: string; label: string; icon: LucideIcon; onClick?: () => void;
}) => {
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

/* ─────────────────────────────────────────────
   PUBLIC MOBILE LINK
───────────────────────────────────────────── */

const PublicMobileLink = ({
  href, label, onClick,
}: {
  href: string; label: string; onClick: () => void;
}) => {
  const cls =
    "block px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors";
  return href.startsWith("#") ? (
    <a href={href} onClick={onClick} className={cls}>{label}</a>
  ) : (
    <Link to={href} onClick={onClick} className={cls}>{label}</Link>
  );
};

/* ─────────────────────────────────────────────
   TOOLS DROPDOWN (desktop, hover-triggered)
───────────────────────────────────────────── */

// NOTE: opening this dropdown logs a harmless React dev-mode warning
// ("Function components cannot be given refs") originating entirely inside
// @radix-ui/react-navigation-menu's own Presence/Viewport internals — not
// from this component. Dev-console-only noise; stripped from production
// builds. Confirmed via live audit on 2026-08-18, current version
// @radix-ui/react-navigation-menu@1.2.13. Revisit if a Radix release notes
// a fix.
const ToolsDropdown = ({ dark }: { dark?: boolean }) => (
  <NavigationMenu>
    <NavigationMenuList>
      <NavigationMenuItem>
        <NavigationMenuTrigger
          className={cn(
            "!bg-transparent h-auto px-3 py-2 text-sm font-medium",
            dark
              ? "text-primary-foreground/80 hover:!bg-primary-light/50 hover:!text-primary-foreground data-[state=open]:!bg-primary-light/50 data-[state=open]:!text-primary-foreground"
              : "text-muted-foreground hover:!bg-transparent hover:!text-form-header data-[state=open]:!text-form-header"
          )}
        >
          <Wrench className="w-4 h-4 mr-1.5" />
          Tools
        </NavigationMenuTrigger>
        <NavigationMenuContent>
          <div className="w-[280px] p-2">
            {TOOLS.map(({ to, icon: Icon, label }) => (
              <Link
                key={to}
                to={to}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-form-header hover:bg-muted transition-colors"
              >
                <Icon className="w-4 h-4 text-primary shrink-0" />
                {label}
              </Link>
            ))}
            <div className="border-t border-border mt-1 pt-1">
              <Link
                to="/tools"
                className="flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium text-primary hover:bg-muted transition-colors"
              >
                View all tools
              </Link>
            </div>
          </div>
        </NavigationMenuContent>
      </NavigationMenuItem>
    </NavigationMenuList>
  </NavigationMenu>
);

/* ─────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────── */

const Navigation = () => {
  const { t }         = useLanguage();
  const location      = useLocation();
  const navigate      = useNavigate();
  const authenticated = isAuthenticated();
  const currentUser   = getCurrentUser();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems       = getNavItems(t);
  const navItemsMobile = getNavItemsMobile(t);
  const adminNavItems  = getAdminNavItems(t);
  const isAdmin        = currentUser?.role === "admin" || currentUser?.role === "superadmin";

  const toggleMobileMenu = () => setIsMobileMenuOpen((p) => !p);
  const closeMobileMenu  = () => setIsMobileMenuOpen(false);

  const handleLogout = async () => {
    closeMobileMenu();
    await logoutCurrentUser();
    navigate("/login");
  };

  const publicLinks = [
    { href: "/our-plans",     label: "Plans"          },
    { href: "/lic-info-hub",  label: "Best Info Hub"  },
    // { href: "#Career",  label: "Career"   },
    { href: "/help-support",  label: "Help & Support" },
    { href: "/about",         label: "About"          },
  ];

  /* ═══════════════════════════════════════════
     PUBLIC HEADER — not logged in
  ═══════════════════════════════════════════ */
  if (!authenticated) {
    return (
      <header className="sticky top-0 z-40 bg-background/90 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto flex items-center justify-between h-16">

            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <img src={siteConfig.logo_medium_size} alt="logo" className="w-5 h-5" />
              </div>
              <span className="font-semibold text-form-header">{siteConfig.title}</span>
            </Link>

            {/* Desktop links */}
            <div className="hidden md:flex items-center gap-6 text-sm text-muted-foreground mx-2">
              <ToolsDropdown />
              {publicLinks.map(({ href, label }) =>
                href.startsWith("#") ? (
                  <a key={label} href={href}
                    className="hover:text-form-header transition-colors">
                    {label}
                  </a>
                ) : (
                  <Link key={label} to={href}
                    className={cn(
                      "hover:text-form-header transition-colors",
                      location.pathname === href && "text-form-header font-medium"
                    )}>
                    {label}
                  </Link>
                )
              )}
            </div>

            {/* Right — auth + mobile hamburger */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="md:hidden p-1.5 rounded-md hover:bg-muted transition-colors"
                onClick={toggleMobileMenu}
                aria-label="Toggle menu"
                aria-expanded={isMobileMenuOpen}
              >
                {isMobileMenuOpen
                  ? <X    className="w-5 h-5" />
                  : <Menu className="w-5 h-5" />}
              </button>
              
              
              <div className="hidden md:block min-w-24">
              <LanguageSwitcher />
              </div>

              <Link to="/login">
                <Button variant="ghost" size="sm">Log in</Button>
              </Link>
              <Link to="/signup">
                <Button size="sm" className="bg-primary hover:bg-primary-light">
                  Sign up free
                </Button>
              </Link>
            </div>
          </div>

          {/* Public mobile menu */}
          <div className={cn(
            "md:hidden overflow-hidden transition-all duration-300 ease-in-out",
            isMobileMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
          )}>
            <div className="space-y-1 pb-4 pt-2 border-t border-border">
              <p className="px-4 pt-1 pb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Tools</p>
              {TOOLS.map(({ to, label }) => (
                <PublicMobileLink key={to} href={to} label={label} onClick={closeMobileMenu} />
              ))}
              <p className="px-4 pt-3 pb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Menu</p>
              {publicLinks.map(({ href, label }) => (
                <PublicMobileLink
                  key={label}
                  href={href}
                  label={label}
                  onClick={closeMobileMenu}
                />
              ))}
              <div className="px-1 pt-2 flex gap-2">
                <Link to="/login" className="flex-1" onClick={closeMobileMenu}>
                  <Button variant="outline" size="sm" className="w-full">
                    Log in
                  </Button>
                </Link>
                <Link to="/signup" className="flex-1" onClick={closeMobileMenu}>
                  <Button size="sm" className="w-full bg-primary hover:bg-primary-light">
                    Sign up free
                  </Button>
                </Link>
              </div>
              <div className="px-1 pt-1">
                <LanguageSwitcher type="mobile" />
              </div>
            </div>
          </div>
        </div>
      </header>
    );
  }

  /* ═══════════════════════════════════════════
     AUTHENTICATED NAV — logged in
  ═══════════════════════════════════════════ */
  return (
    <nav className="bg-primary shadow-lg border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-4">

        {/* ── Desktop header row ── */}
        <div className="flex items-center justify-between min-h-16 py-2 gap-3">

          {/* Logo */}
          <Link
            to="/"
            onClick={closeMobileMenu}
            className="flex items-center space-x-2 shrink-0 min-w-0"
          >
            <div className="w-8 h-8 bg-primary-foreground rounded-full flex items-center justify-center overflow-hidden shrink-0">
              <img src={siteConfig.logo_medium_size} alt="logo" />
            </div>
            <span className="text-primary-foreground font-semibold text-lg sm:max-w-none">
              {siteConfig.title}
            </span>
          </Link>

          {/* Mobile hamburger */}
          <button
            type="button"
            className="lg:hidden text-primary-foreground p-1.5 -mr-1.5 rounded-md hover:bg-primary-light/50 transition-colors shrink-0"
            onClick={toggleMobileMenu}
            aria-label="Toggle menu"
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen
              ? <X    className="w-6 h-6" />
              : <Menu className="w-6 h-6" />}
          </button>

          {/* Desktop right side */}
          <div className="hidden lg:flex items-center gap-1 shrink-0">

            {/* Nav links */}
            {currentUser?.role === "user" &&
              navItems.map((item) => <NavItem key={item.to} {...item} />)}
            {isAdmin &&
              [...navItems, ...adminNavItems].map((item) => <NavItem key={item.to} {...item} />)}

            <ToolsDropdown dark />

            {/* Language switcher */}
            <div className="pl-1.5 ml-1 border-l border-primary-foreground/15 shrink-0 flex items-center">
              <div className="xl:block">
                <LanguageSwitcher />
              </div>
            </div>

            {/* User dropdown */}
            <div className="flex items-center pl-2 ml-1 border-l border-primary-foreground/15 shrink-0">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    title={currentUser?.name}
                    className="flex items-center gap-2 rounded-full pl-1 pr-1.5 xl:pr-3 py-1 text-sm font-medium text-primary-foreground/85 hover:bg-primary-light/50 hover:text-primary-foreground transition-colors shrink-0"
                  >
                    <Avatar className="w-7 h-7">
                      {currentUser?.profileImage && (
                        <AvatarImage
                          src={currentUser.profileImage}
                          alt={currentUser?.name}
                        />
                      )}
                      <AvatarFallback className="bg-primary-foreground/15 text-primary-foreground text-[10px] font-semibold">
                        {initials(currentUser?.name)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="xl:inline max-w-[140px] truncate">
                      {currentUser?.name}
                    </span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => navigate("/profile")}>
                    <User className="w-4 h-4 mr-2" /> Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/referral-program")}>
                    <User className="w-4 h-4 mr-2" /> Referral Program
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/about")}>
                    <MapPinnedIcon className="w-4 h-4 mr-2" /> About
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/help-support")}>
                    <CircleHelp className="w-4 h-4 mr-2" /> Help & Support
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="text-red-600 focus:text-red-600"
                  >
                    <LogOut className="w-4 h-4 mr-2" /> Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        {/* ── Mobile menu ── */}
        <div className={cn(
          "lg:hidden overflow-hidden transition-all duration-300 ease-in-out",
          isMobileMenuOpen ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"
        )}>
          <div className="space-y-1.5 pb-4 pt-2 border-t border-primary-foreground/10">

            {/* Nav links */}
            {currentUser?.role === "user" &&
              navItemsMobile.map((item) => (
                <MobileNavItem key={item.to} {...item} onClick={closeMobileMenu} />
              ))}
            {isAdmin &&
              [...navItemsMobile, ...adminNavItems].map((item) => (
                <MobileNavItem key={item.to} {...item} onClick={closeMobileMenu} />
              ))}

            {/* Tools */}
            {/* <p className="px-4 pt-2 pb-1 text-xs font-semibold uppercase tracking-wide text-primary-foreground/50">Tools</p>
            {TOOLS.map((tool) => (
              <MobileNavItem key={tool.to} {...tool} onClick={closeMobileMenu} />
            ))} */}

            {/* Tools */}
            <MobileNavItem
              to="/tools"
              label="Tools"
              icon={Wrench}
              onClick={closeMobileMenu}
            />

            {/* About */}
            <MobileNavItem
              to="/about"
              label="About"
              icon={MapPinnedIcon}
              onClick={closeMobileMenu}
            />

            {/* Help & support */}
            <MobileNavItem
              to="/help-support"
              label="Help & Support"
              icon={CircleHelp}
              onClick={closeMobileMenu}
            />

            {/* Profile row */}
            <button
              type="button"
              onClick={() => { navigate("/profile"); closeMobileMenu(); }}
              className={cn(
                "flex w-full items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors",
                location.pathname === "/profile"
                  ? "bg-primary-light text-primary-foreground"
                  : "text-primary-foreground hover:bg-primary-light/40"
              )}
            >
              <Avatar className="w-7 h-7">
                {currentUser?.profileImage && (
                  <AvatarImage
                    src={currentUser.profileImage}
                    alt={currentUser?.name}
                  />
                )}
                <AvatarFallback className="bg-primary-foreground/15 text-primary-foreground text-[11px] font-semibold">
                  {initials(currentUser?.name)}
                </AvatarFallback>
              </Avatar>
              <span className="truncate">{currentUser?.name}</span>
            </button>

            {/* Logout */}
            <div className="px-1 pt-1">
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="w-full bg-primary-foreground/10 text-primary-foreground border-primary-foreground/20 hover:bg-red-600 hover:border-red-600 hover:text-white"
              >
                <LogOut className="w-4 h-4 mr-2" />
                {t("logout")}
              </Button>
            </div>

            {/* Language */}
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