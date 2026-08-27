import { useState, useEffect, useCallback } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { getMyActivity } from "../../services/userService";
import { ChevronLeft, ChevronRight, History } from "lucide-react";

// Same palette AdminLogs.tsx uses, plus the self-service actions this
// page can now show (PASSWORD_CHANGED, PROFILE_UPDATED, RECORD_*) that
// only ever appear in a user's own feed, never the admin one.
const ACTION_COLORS: Record<string, string> = {
  RECORD_CREATED:        "bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400",
  RECORD_UPDATED:        "bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400",
  RECORD_DELETED:        "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400",
  RECORDS_BULK_IMPORTED: "bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400",
  PASSWORD_CHANGED:      "bg-purple-100 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400",
  PROFILE_UPDATED:       "bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400",
  WITHDRAWAL_APPROVED:   "bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400",
  WITHDRAWAL_REJECTED:   "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400",
  SUBSCRIPTION_CHANGED:  "bg-purple-100 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400",
  UPI_VERIFIED:          "bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400",
  UPI_REJECTED:          "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400",
  FORCE_LOGOUT:          "bg-orange-100 text-orange-700 dark:bg-orange-950/40 dark:text-orange-400",
};

const fmt = (d?: string) => d
  ? new Date(d).toLocaleString("en-IN", {
      day: "2-digit", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit"
    })
  : "—";

// Turns e.g. { fields: ["name","email"] } into "name, email" for a short,
// readable one-liner instead of raw JSON — most entries here are simple
// enough that the full JSON dump AdminLogs.tsx uses would be overkill.
const summarize = (action: string, details: unknown): string | null => {
  if (!details || typeof details !== "object") return null;
  const d = details as Record<string, unknown>;
  switch (action) {
    case "PROFILE_UPDATED":
      return Array.isArray(d.fields) ? `Updated: ${d.fields.join(", ")}` : null;
    case "RECORD_UPDATED":
      return Array.isArray(d.fields) ? `Fields changed: ${d.fields.join(", ")}` : null;
    case "RECORD_CREATED":
    case "RECORD_DELETED":
      return typeof d.name === "string" ? `Record: ${d.name}` : null;
    case "RECORDS_BULK_IMPORTED":
      return typeof d.count === "number" ? `${d.count} records imported` : null;
    default:
      return null;
  }
};

interface ActivityLog {
  _id: string;
  action: string;
  targetUserName?: string;
  createdAt?: string;
  details?: unknown;
}

interface Pagination {
  page: number;
  totalPages: number;
  total: number;
}

const MyActivity = () => {
  const [logs,       setLogs]       = useState<ActivityLog[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading,    setLoading]    = useState(true);
  const [page,       setPage]       = useState(1);

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getMyActivity({ page });
      setLogs(data.logs);
      setPagination(data.pagination);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [page]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  return (
    <div className="min-h-screen bg-muted/30 flex flex-col">
      <Navigation />

      <main className="container mx-auto px-4 py-8 flex-1">
        <div className="max-w-3xl mx-auto space-y-5">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-primary" />
            <div>
              <h1 className="text-xl font-medium">My activity</h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                Actions on your account — {pagination?.total ?? 0} total
              </p>
            </div>
          </div>

          <Card>
            <CardContent className="p-0">
              {loading ? (
                <p className="text-center text-sm text-muted-foreground py-10">Loading…</p>
              ) : !logs.length ? (
                <p className="text-center text-sm text-muted-foreground py-10">No activity yet.</p>
              ) : (
                <div>
                  {logs.map((log) => {
                    const summary = summarize(log.action, log.details);
                    return (
                      <div key={log._id} className="p-4 border-b border-border last:border-0">
                        <div className="flex items-start gap-3">
                          <Badge className={`text-xs shrink-0 mt-0.5 ${ACTION_COLORS[log.action] || "bg-gray-100 text-gray-600 dark:bg-muted dark:text-muted-foreground"}`}>
                            {log.action.replace(/_/g, " ")}
                          </Badge>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-muted-foreground">{fmt(log.createdAt)}</p>
                            {summary && (
                              <p className="text-sm text-form-header mt-0.5">{summary}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between text-sm">
              <p className="text-muted-foreground">Page {pagination.page} of {pagination.totalPages}</p>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" disabled={page === 1}
                  onClick={() => setPage(p => p - 1)}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="outline" disabled={page === pagination.totalPages}
                  onClick={() => setPage(p => p + 1)}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default MyActivity;