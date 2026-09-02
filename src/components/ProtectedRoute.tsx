import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { getCurrentUser, isAuthenticated } from "@/utils/auth";
import type { ProtectedRouteProps } from "@/types/components/ProtectedRoute.types";
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

  if (roles && !roles.includes(currentUser.role ?? "user")) {
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