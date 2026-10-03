import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { Bell, CheckCheck, Loader2 } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  getUnreadCount,
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from "../../services/notificationService";
import type {
  AppNotification,
  NotificationBellProps,
  NotificationListResponse,
} from "@/types/components/NotificationBell.types";

const POLL_MS = 60_000;
const COUNT_KEY = ["notifications", "unread-count"] as const;
const LIST_KEY = ["notifications", "list"] as const;

// Only ever navigate to an in-app path — the backend validates this too, but
// the client shouldn't trust a stored string to be safe.
const isInternalPath = (p: string | null): p is string => !!p && p.startsWith("/") && !p.startsWith("//");

const NotificationBell = ({ variant = "default", align = "end" }: NotificationBellProps) => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // The badge. Cheap count-only endpoint, polled once a minute (and again on
  // window focus, react-query's default). Polling stops after an error so an
  // outage or offline phone doesn't toast "Network Error" every minute via
  // apiClient's global handler; it resumes on the next focus/reload.
  const { data: unread = 0 } = useQuery({
    queryKey: COUNT_KEY,
    queryFn: getUnreadCount,
    refetchInterval: (q) => (q.state.status === "error" ? false : POLL_MS),
    retry: false,
  });

  // The list is fetched only while the panel is open.
  const { data: list, isLoading } = useQuery<NotificationListResponse>({
    queryKey: LIST_KEY,
    queryFn: () => getNotifications({ limit: "20" }),
    enabled: open,
    retry: false,
  });

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: COUNT_KEY });
    queryClient.invalidateQueries({ queryKey: LIST_KEY });
  };

  const readOne = useMutation({ mutationFn: markNotificationRead, onSettled: refresh });
  const readAll = useMutation({ mutationFn: markAllNotificationsRead, onSettled: refresh });

  const handleClick = (n: AppNotification) => {
    if (!n.isRead) readOne.mutate(n.id);
    setOpen(false);
    if (isInternalPath(n.link)) navigate(n.link);
  };

  const items = list?.notifications ?? [];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={unread > 0 ? `Notifications, ${unread} unread` : "Notifications"}
          className={cn(
            "relative inline-flex items-center justify-center w-9 h-9 rounded-md transition-colors shrink-0",
            variant === "onPrimary"
              ? "text-primary-foreground/85 hover:bg-primary-light/50 hover:text-primary-foreground"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          )}
        >
          <Bell className="w-5 h-5" />
          {unread > 0 && (
            <span className="absolute top-0.5 right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-red-600 text-white text-[10px] font-semibold leading-4 text-center">
              {unread > 99 ? "99+" : unread}
            </span>
          )}
        </button>
      </PopoverTrigger>

      <PopoverContent align={align} className="p-0 w-[min(22rem,calc(100vw-1.5rem))]">
        <div className="flex items-center justify-between px-3 py-2.5 border-b border-border">
          <p className="text-sm font-semibold">Notifications</p>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs"
            disabled={unread === 0 || readAll.isPending}
            onClick={() => readAll.mutate()}
          >
            <CheckCheck className="w-3.5 h-3.5 mr-1" /> Mark all read
          </Button>
        </div>

        <div className="max-h-[26rem] overflow-y-auto">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
            </div>
          ) : items.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-muted-foreground">You're all caught up.</p>
          ) : (
            <ul>
              {items.map((n) => (
                <li key={n.id}>
                  <button
                    type="button"
                    onClick={() => handleClick(n)}
                    className={cn(
                      "w-full text-left px-3 py-2.5 border-b border-border last:border-b-0 hover:bg-muted/60 transition-colors flex gap-2.5",
                      !n.isRead && "bg-primary/5"
                    )}
                  >
                    <span
                      aria-hidden="true"
                      className={cn(
                        "mt-1.5 w-2 h-2 rounded-full shrink-0",
                        n.isRead ? "bg-transparent" : n.priority === "high" ? "bg-red-500" : "bg-primary"
                      )}
                    />
                    <span className="min-w-0 flex-1">
                      <span className={cn("block text-sm leading-snug", !n.isRead && "font-semibold")}>{n.title}</span>
                      {n.message && (
                        <span className="block text-xs text-muted-foreground mt-0.5 leading-snug break-words">
                          {n.message}
                        </span>
                      )}
                      <span className="block text-[11px] text-muted-foreground/80 mt-1">
                        {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="border-t border-border px-3 py-2">
          <button
            type="button"
            onClick={() => { setOpen(false); navigate("/notification-preferences"); }}
            className="text-xs text-primary hover:underline"
          >
            Notification settings
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationBell;
