import { useState, useEffect }   from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { getCurrentUser }         from "@/utils/auth";
import { getMyPermissions }       from "../../../services/adminService";
import {
  Users, ShieldCheck, ArrowDownToLine,
  ScrollText, LayoutDashboard, LogOut, ChevronRight, Loader2
} from "lucide-react";

// Nav items with required permission
const NAV = [
  {
    path:       "/admin",
    label:      "Dashboard",
    icon:       LayoutDashboard,
    roles:      ["admin","superadmin"],
    permission: null,                       // always visible to any admin
  },
  {
    path:       "/admin/users",
    label:      "Users",
    icon:       Users,
    roles:      ["admin","superadmin"],
    permission: "can_view_users",
  },
  {
    path:       "/admin/withdrawals",
    label:      "Withdrawals",
    icon:       ArrowDownToLine,
    roles:      ["admin","superadmin"],
    permission: "can_view_withdrawals",
  },
  {
    path:       "/admin/admins",
    label:      "Admins",
    icon:       ShieldCheck,
    roles:      ["superadmin"],
    permission: null,
  },
  {
    path:       "/admin/logs",
    label:      "Activity logs",
    icon:       ScrollText,
    roles:      ["superadmin"],
    permission: "can_view_logs",
  },
];

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  const location    = useLocation();
  const navigate    = useNavigate();
  const currentUser = getCurrentUser();
  const role        = currentUser?.role;

  const [permissions, setPermissions] = useState<Record<string, boolean> | null>(null);
  const [loadingPerms, setLoadingPerms] = useState(true);

  useEffect(() => {
    fetchPermissions();

    // ✅ Poll every 30 seconds so permission changes reflect without logout
    // const interval = setInterval(fetchPermissions, 30_000);
    // return () => clearInterval(interval);
  }, []);

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
  const visibleNav = NAV.filter(n => {
    if (!n.roles.includes(role)) return false;
    if (role === "superadmin") return true;          // superadmin sees everything
    if (!n.permission) return true;                  // no permission required
    return permissions?.[n.permission] === true;     // check live permission
  });

  // If admin is on a page they no longer have access to, redirect to dashboard
  useEffect(() => {
    if (!permissions || role === "superadmin") return;
    const currentNav = NAV.find(n => location.pathname.startsWith(n.path) && n.path !== "/admin");
    if (currentNav?.permission && !permissions[currentNav.permission]) {
      navigate("/admin");
    }
  }, [permissions, location.pathname]);

  return (
    <div className="min-h-screen flex bg-muted/30">
      {/* Sidebar */}
      <aside className="w-56 bg-white border-r border-border flex flex-col shrink-0">
        <div className="p-4 border-b border-border">
          <p className="text-sm font-medium">Admin Panel</p>
          <p className="text-xs text-muted-foreground mt-0.5 capitalize">{role}</p>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {loadingPerms ? (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
            </div>
          ) : (
            visibleNav.map(({ path, label, icon: Icon }) => {
              const active = location.pathname === path ||
                (path !== "/admin" && location.pathname.startsWith(path));
              return (
                <Link key={path} to={path}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                    active
                      ? "bg-blue-50 text-blue-700 font-medium"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}>
                  <Icon className="w-4 h-4 shrink-0" />
                  {label}
                  {active && <ChevronRight className="w-3.5 h-3.5 ml-auto" />}
                </Link>
              );
            })
          )}
        </nav>

        <div className="p-3 border-t border-border">
          <button
            onClick={() => { localStorage.clear(); navigate("/login"); }}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-muted w-full"
          >
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto p-6">{children}</main>
    </div>
  );
};

export default AdminLayout;