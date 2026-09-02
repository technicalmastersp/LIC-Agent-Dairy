import { ReactNode } from "react";

export interface ProtectedRouteProps {
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
