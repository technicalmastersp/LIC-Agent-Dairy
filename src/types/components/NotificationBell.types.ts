export type AppNotification = {
  id: string;
  type: string;
  title: string;
  message: string;
  link: string | null;
  priority: "normal" | "high";
  isRead: boolean;
  createdAt: string;
  data?: Record<string, unknown>;
};

export type NotificationListResponse = {
  notifications: AppNotification[];
  unreadCount: number;
  hasMore: boolean;
  nextBefore: string | null;
};

export type NotificationBellProps = {
  // "onPrimary": white icon for the blue agent navbar. "default": themed icon
  // for the admin sidebar / mobile header.
  variant?: "onPrimary" | "default";
  // Which edge of the bell the popover aligns to (use "start" inside a left sidebar).
  align?: "start" | "center" | "end";
};
