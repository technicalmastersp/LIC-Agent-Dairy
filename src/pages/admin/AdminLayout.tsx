import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { getCurrentUser } from "@/utils/auth";
import { getMyPermissions, getPendingCounts } from "../../../services/adminService";
import {
  Users,
  ShieldCheck,
  ArrowDownToLine,
  ScrollText,
  LayoutDashboard,
  LogOut,
  ChevronRight,
  Loader2,
  Menu,
  X,
  Home,
  BadgeCheck,
} from "lucide-react";

// Nav items with required permission
const NAV = [
  {
    path: "/admin",
    label: "Dashboard",
    icon: LayoutDashboard,
    roles: ["admin", "superadmin"],
    permission: null,
  },
  {
    path: "/admin/users",
    label: "Users",
    icon: Users,
    roles: ["admin", "superadmin"],
    permission: "can_view_users",
  },
  {
    path: "/admin/withdrawals",
    label: "Withdrawals",
    icon: ArrowDownToLine,
    roles: ["admin", "superadmin"],
    permission: "can_view_withdrawals",
    countKey: "withdrawals",
  },
  {
    path: "/admin/payment-verifications",
    label: "UPI Verifications",
    icon: BadgeCheck,
    roles: ["admin", "superadmin"],
    permission: "can_verify_payment_details",
    countKey: "upiVerifications",
  },
  {
    path: "/admin/admins",
    label: "Admins",
    icon: ShieldCheck,
    roles: ["superadmin"],
    permission: null,
  },
  {
    path: "/admin/logs",
    label: "Activity logs",
    icon: ScrollText,
    roles: ["admin", "superadmin"],
    permission: "can_view_logs",
  },
];

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const currentUser = getCurrentUser();
  const role = currentUser?.role;

  const [permissions, setPermissions] = useState<Record<string, boolean> | null>(null);
  const [loadingPerms, setLoadingPerms] = useState(true);
  const [counts, setCounts] = useState<{ withdrawals: number; upiVerifications: number }>({ withdrawals: 0, upiVerifications: 0 });

  // Mobile sidebar state
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    fetchPermissions();
    fetchCounts();

    // ✅ Poll every 30 seconds so permission changes reflect without logout
    // const interval = setInterval(fetchPermissions, 30_000);
    // return () => clearInterval(interval);
  }, []);

  const fetchCounts = async () => {
    try {
      const data = await getPendingCounts();
      setCounts(data);
    } catch {
      // non-fatal — sidebar just shows no badge
    }
  };

  const fetchPermissions = async () => {
    try {
      const data = await getMyPermissions();
      setPermissions(data.permissions);
    } catch (err: any) {
      // If 403 ACCOUNT_DEACTIVATED — force logout
      if (err.response?.data?.code === "ACCOUNT_DEACTIVATED") {
        localStorage.clear();
        navigate("/login");
      }
    } finally {
      setLoadingPerms(false);
    }
  };

  // Filter nav based on role AND live permissions
  const visibleNav = NAV.filter((n) => {
    if (!n.roles.includes(role)) return false;
    if (role === "superadmin") return true;          // superadmin sees everything
    if (!n.permission) return true;                  // no permission required
    return permissions?.[n.permission] === true;     // check live permission
  });

  // If admin is on a page they no longer have access to,
  // redirect to dashboard
  useEffect(() => {
    if (!permissions || role === "superadmin") return;
    const currentNav = NAV.find((n) => location.pathname.startsWith(n.path) && n.path !== "/admin");
    if (currentNav?.permission && !permissions[currentNav.permission]) {
      navigate("/admin");
    }
  }, [permissions, location.pathname, role, navigate]);

  // Close sidebar whenever route changes
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  // Go to root website
  const goToHome = () => {
    setSidebarOpen(false);
    navigate("/");
  };

  // Logout
  const handleLogout = () => {
    localStorage.clear();
    setSidebarOpen(false);
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex bg-muted/30">

      {/* ====================== MOBILE TOP HEADER, Hidden on desktop ====================== */}
      <header
        className="fixed top-0 left-0 right-0 z-40 h-14 border-b border-border bg-background flex items-center justify-between px-3 md:hidden"
      >
        {/* Burger */}
        <button
          type="button"
          onClick={() => setSidebarOpen(true)}
          aria-label="Open admin menu"
          className="inline-flex items-center justify-center w-9 h-9 rounded-md hover:bg-muted transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Mobile title */}
        <div className="text-sm font-semibold">Admin Panel</div>

        {/* Root/Home */}
        <button
          type="button"
          onClick={goToHome}
          aria-label="Go to website"
          className="inline-flex items-center justify-center w-9 h-9 rounded-md hover:bg-muted transition-colors"
        >
          <Home className="w-5 h-5" />
        </button>
      </header>

      {/* ====================== MOBILE BACKDROP ====================== */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ====================== SIDEBAR ====================== */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-background border-r border-border flex flex-col transition-transform duration-200 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0
        `}
      >
        {/* Sidebar Header */}
        <div className="h-14 shrink-0 border-b border-border flex items-center justify-between px-4">
          <button
            type="button"
            onClick={goToHome}
            className="flex items-center gap-2 text-sm font-semibold hover:text-blue-600 transition-colors"
          >
            <Home className="w-4 h-4" /> Admin Panel
          </button>

          {/* Mobile close button */}
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close admin menu"
            className="w-8 h-8 rounded-md flex items-center justify-center hover:bg-muted md:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Role */}
        <div className="px-4 py-3 border-b border-border">
          <p className="text-xs text-muted-foreground">
            Signed in as
          </p>

          <p className="text-sm font-medium capitalize mt-0.5">
            {role}
          </p>
        </div>

        {/* ====================== NAVIGATION ====================== */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {loadingPerms ? (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
            </div>
          ) : (
            visibleNav.map(({ path, label, icon: Icon, countKey }: any) => {
              const active = location.pathname === path ||
                (path !== "/admin" && location.pathname.startsWith(path));
              const badgeCount = countKey ? counts[countKey as keyof typeof counts] : 0;

              return (
                <Link key={path} to={path} onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                    active
                      ? "bg-blue-50 text-blue-700 font-medium"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}>
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{label}</span>
                  {badgeCount > 0 && (
                    <span className="ml-auto bg-amber-500 text-white text-[10px] font-medium rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                      {badgeCount > 99 ? "99+" : badgeCount}
                    </span>
                  )}
                  {active && !badgeCount && (<ChevronRight className="w-3.5 h-3.5 ml-auto" />)}
                </Link>
              );
            })
          )}

          {/* ====================== ROOT WEBSITE BUTTON ====================== */}
          <button
            type="button"
            onClick={goToHome}
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors w-full text-left mt-2"
          >
            <Home className="w-4 h-4 shrink-0" /> <span>Go to website</span>
          </button>
        </nav>

        {/* ====================== LOGOUT ====================== */}
        <div className="p-3 border-t border-border">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-muted hover:text-foreground w-full transition-colors"
          >
            <LogOut className="w-4 h-4" /> <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* ====================== MAIN CONTENT ====================== */}
      <main className="flex-1 min-w-0 overflow-auto pt-16 md:pt-1 md:ml-64 p-4 sm:p-5 sm:pt-16 md:p-6">{children}</main>
    </div>
  );
};

export default AdminLayout;