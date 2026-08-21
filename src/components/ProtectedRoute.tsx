import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { getCurrentUser, isAuthenticated } from "@/utils/auth";

interface ProtectedRouteProps {
  /** Allowed roles for this route. Omit to allow any authenticated user. */
  roles?: string[];
  /**
   * A permission key from the same shape used in AdminLayout.tsx's NAV
   * array (e.g. "can_view_users"), checked against the static
   * `currentUser.permissions` object already stored in localStorage
   * (see AdminRevenue.tsx's `canManageExpenses` for the same pattern).
   * A superadmin always passes, matching AdminLayout's own
   * `role === "superadmin"` bypass. Optional — most routes only need
   * `roles`; this exists for pages that need finer-grained gating.
   *
   * Note: this is separate from AdminLayout's own live-polled permission
   * check (getMyPermissions()), which handles hiding nav items and
   * redirecting if an admin's permissions are revoked mid-session — that
   * mechanism is untouched by this component.
   */
  permission?: string;
  children: ReactNode;
}

/**
 * Centralizes the auth/role guard that used to be duplicated inline at
 * the top of every protected page (getCurrentUser()/isAuthenticated(),
 * then a useEffect + render-time `return null` while redirecting).
 * <Navigate replace> renders nothing while it performs the redirect,
 * matching that "show nothing during the redirect" behavior.
 */
const ProtectedRoute = ({ roles, permission, children }: ProtectedRouteProps) => {
  const authenticated = isAuthenticated();
  const currentUser = getCurrentUser();

  if (!authenticated || !currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(currentUser.role)) {
    return <Navigate to="/" replace />;
  }

  if (
    permission &&
    currentUser.role !== "superadmin" &&
    !currentUser.permissions?.[permission]
  ) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;