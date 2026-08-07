import { useState, useEffect } from "react";
import { useNavigate }  from "react-router-dom";
import AdminLayout      from "./AdminLayout";
import { Button }       from "@/components/ui/button";
import { Input }        from "@/components/ui/input";
import { Badge }        from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getCurrentUser, isAuthenticated } from "@/utils/auth";
import { getActivityLogs } from "../../../services/adminService";
import { ChevronLeft, ChevronRight } from "lucide-react";

const ACTION_COLORS: Record<string, string> = {
  WITHDRAWAL_APPROVED: "bg-green-100 text-green-700",
  WITHDRAWAL_REJECTED: "bg-red-100 text-red-700",
  USER_DEACTIVATED:    "bg-orange-100 text-orange-700",
  USER_REACTIVATED:    "bg-blue-100 text-blue-700",
  USER_DELETED:        "bg-red-100 text-red-700",
  SUBSCRIPTION_CHANGED:"bg-purple-100 text-purple-700",
  ADMIN_CREATED:       "bg-blue-100 text-blue-700",
  ADMIN_DEACTIVATED:   "bg-orange-100 text-orange-700",
  RECORD_DELETED:      "bg-red-100 text-red-700",
  ADMIN_PERMISSIONS_UPDATED: "bg-indigo-100 text-indigo-700",
};

const ACTIONS = Object.keys(ACTION_COLORS);

const fmt = (d?: string) => d
  ? new Date(d).toLocaleString("en-IN", {
      day:"2-digit", month:"short", year:"numeric",
      hour:"2-digit", minute:"2-digit"
    })
  : "—";

const AdminLogs = () => {
  const navigate    = useNavigate();
  const currentUser = getCurrentUser();
  const authenticated = isAuthenticated();

  const [logs,       setLogs]       = useState<any[]>([]);
  const [pagination, setPagination] = useState<any>(null);
  const [loading,    setLoading]    = useState(true);
  const [action,     setAction]     = useState("all");
  const [from,       setFrom]       = useState("");
  const [to,         setTo]         = useState("");
  const [page,       setPage]       = useState(1);
  const [expanded,   setExpanded]   = useState<string | null>(null);

  useEffect(() => {
    if (!authenticated || currentUser?.role !== "superadmin") { navigate("/"); return; }
    fetchLogs();
  }, [action, from, to, page]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const data = await getActivityLogs({
        action: action === "all" ? undefined : action,
        from:   from || undefined,
        to:     to   || undefined,
        page,
      });
      setLogs(data.logs);
      setPagination(data.pagination);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  return (
    <AdminLayout>
      <div className="space-y-5">
        <div>
          <h1 className="text-xl font-medium">Activity logs</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            All admin and superadmin actions — {pagination?.total ?? 0} total
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 items-center">
          <Select value={action} onValueChange={v => { setAction(v); setPage(1); }}>
            <SelectTrigger className="w-52 text-sm">
              <SelectValue placeholder="Filter by action" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All actions</SelectItem>
              {ACTIONS.map(a => (
                <SelectItem key={a} value={a}>{a.replace(/_/g, " ")}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input type="date" className="w-40 text-sm" value={from}
            onChange={e => { setFrom(e.target.value); setPage(1); }} placeholder="From" />
          <Input type="date" className="w-40 text-sm" value={to}
            onChange={e => { setTo(e.target.value); setPage(1); }} placeholder="To" />
          {(action !== "all" || from || to) && (
            <Button size="sm" variant="outline" onClick={() => { setAction("all"); setFrom(""); setTo(""); setPage(1); }}>
              Clear filters
            </Button>
          )}
        </div>

        {/* Logs */}
        <Card>
          <CardContent className="p-0">
            {loading ? (
              <p className="text-center text-sm text-muted-foreground py-10">Loading…</p>
            ) : !logs.length ? (
              <p className="text-center text-sm text-muted-foreground py-10">No logs found.</p>
            ) : (
              <div>
                {logs.map((log, i) => (
                  <div key={i}
                    className="p-4 border-b border-border last:border-0 hover:bg-muted/30 cursor-pointer"
                    onClick={() => setExpanded(expanded === log._id ? null : log._id)}>
                    <div className="flex items-start gap-3">
                      {/* Action badge */}
                      <Badge className={`text-xs shrink-0 mt-0.5 ${ACTION_COLORS[log.action] || "bg-gray-100 text-gray-600"}`}>
                        {log.action.replace(/_/g," ")}
                      </Badge>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-medium">{log.adminName}</span>
                          <span className="text-xs text-muted-foreground capitalize">({log.adminRole})</span>
                          {log.targetUserName && (
                            <span className="text-xs text-muted-foreground">→ {log.targetUserName}</span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">{fmt(log.createdAt)}</p>

                        {/* Expanded details */}
                        {expanded === log._id && log.details && (
                          <div className="mt-2 bg-muted rounded-lg p-2.5 text-xs font-mono text-muted-foreground overflow-auto">
                            {JSON.stringify(log.details, null, 2)}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pagination */}
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
    </AdminLayout>
  );
};

export default AdminLogs;