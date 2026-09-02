import AdminLayout from "./AdminLayout";
import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { getSupportTickets, replyToTicket, getPendingCounts } from "../../../services/adminService";
import { RefreshCw, Reply, Mail, User as UserIcon } from "lucide-react";
import type { SupportTicket } from "@/types/pages/admin/AdminSupportTickets.types";

const fmt = (d?: string) => d
  ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
  : "—";

const statusStyle: Record<string, string> = {
  open:        "bg-blue-100 text-blue-700 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-900",
  in_progress: "bg-amber-100 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900",
  resolved:    "bg-green-100 text-green-700 border border-green-200 dark:bg-green-950/40 dark:text-green-400 dark:border-green-900",
  closed:      "bg-gray-100 text-gray-600 border border-gray-200 dark:bg-muted dark:text-muted-foreground dark:border-border",
};

const STATUS_OPTIONS = ["all", "open", "in_progress", "resolved", "closed"] as const;
const AdminSupportTickets = () => {
  const { toast }     = useToast();

  const [tab, setTab]         = useState<"high" | "normal">("high");
  const [statusFilter, setStatusFilter] = useState<typeof STATUS_OPTIONS[number]>("all");
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [counts, setCounts]   = useState({ high: 0, normal: 0 });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<string | null>(null);

  const fetchCounts = useCallback(async () => {
    try {
      const data = await getPendingCounts();
      setCounts({ high: data.supportTickets ?? 0, normal: data.supportTicketsNormal ?? 0 });
    } catch { /* non-fatal */ }
  }, []);

  const fetchTickets = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) { setRefreshing(true); } else { setLoading(true); }
      const data = await getSupportTickets(tab, statusFilter === "all" ? undefined : statusFilter);
      setTickets(data);
    } catch {
      setTickets([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [tab, statusFilter]);

  useEffect(() => {
    fetchCounts();
  }, [fetchCounts]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const handleReply = async (ticketId: string, status: string) => {
    const reply = replyDrafts[ticketId]?.trim();
    setSaving(ticketId);
    try {
      await replyToTicket(ticketId, { reply: reply || undefined, status });
      toast({ title: "Updated", description: reply ? "Reply sent to the user." : "Status updated." });
      setReplyDrafts(p => ({ ...p, [ticketId]: "" }));
      fetchTickets(true);
    } catch (err: unknown) {
      const message = axios.isAxiosError(err) ? err.response?.data?.message : undefined;
      toast({ title: "Error", description: message, variant: "destructive" });
    } finally { setSaving(null); }
  };

  return (
    <AdminLayout>
      <div className="min-h-screen bg-muted/30">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto space-y-6">

            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <h1 className="text-2xl font-medium text-form-header">Support & suggestions</h1>
                <p className="text-sm text-muted-foreground mt-1">Logged-in requests are high priority; guest queries are second priority.</p>
              </div>
              <div className="flex gap-2">
                <Link to="/admin/suggestions"><Button size="sm" variant="outline">View suggestions</Button></Link>
                <Button size="sm" variant="outline" onClick={() => { fetchTickets(true); fetchCounts(); }} disabled={refreshing}>
                  <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${refreshing ? "animate-spin" : ""}`} />
                  {refreshing ? "Refreshing…" : "Refresh"}
                </Button>
              </div>
            </div>

            <div className="flex gap-2 flex-wrap">
              <Button size="sm" variant={tab === "high" ? "default" : "outline"} onClick={() => setTab("high")}>
                Logged-in users (high priority)
                {counts.high > 0 && (
                  <Badge className="ml-2 bg-white/20 text-inherit border-0 h-4 px-1.5 text-[10px]">{counts.high}</Badge>
                )}
              </Button>
              <Button size="sm" variant={tab === "normal" ? "default" : "outline"} onClick={() => setTab("normal")}>
                Guest queries (second priority)
                {counts.normal > 0 && (
                  <Badge className="ml-2 bg-white/20 text-inherit border-0 h-4 px-1.5 text-[10px]">{counts.normal}</Badge>
                )}
              </Button>
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs text-muted-foreground mr-1">Status:</span>
              {STATUS_OPTIONS.map(s => (
                <Button
                  key={s} size="sm"
                  variant={statusFilter === s ? "default" : "outline"}
                  className="h-7 text-xs capitalize px-2.5"
                  onClick={() => setStatusFilter(s)}
                >
                  {s.replace("_", " ")}
                </Button>
              ))}
            </div>

            {loading ? (
              <p className="text-center text-sm text-muted-foreground py-8">Loading…</p>
            ) : !tickets.length ? (
              <p className="text-center text-sm text-muted-foreground py-8">No tickets in this queue.</p>
            ) : (
              <div className="space-y-4">
                {tickets.map((t) => (
                  <Card key={t.ticketId} className="shadow-sm">
                    <CardHeader className="pb-2 pt-4 px-4">
                      <div className="flex items-start justify-between flex-wrap gap-2">
                        <div>
                          <CardTitle className="text-xs font-mono">{t.ticketId}</CardTitle>
                          <p className="text-[11px] text-muted-foreground mt-1 flex items-center gap-3 flex-wrap">
                            <span className="flex items-center gap-1"><UserIcon className="w-3 h-3" />{t.name}</span>
                            <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{t.email}</span>
                            <span>{fmt(t.createdAt)}</span>
                            {t.isGuest && <Badge variant="outline" className="text-[10px]">Guest</Badge>}
                            {t.isGuest && t.guestMatchedAccount && (
                              <Badge className="text-[10px] bg-primary/10 text-primary border border-primary/20">
                                Registered email
                              </Badge>
                            )}
                          </p>
                        </div>
                        <Badge className={`text-xs ${statusStyle[t.status]}`}>{t.status.replace("_", " ")}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2 px-4 pb-4">
                      <div>
                        <p className="text-[10px] uppercase text-muted-foreground mb-0.5">{t.category}</p>
                        <p className="text-xs text-foreground whitespace-pre-wrap line-clamp-3">{t.message}</p>
                      </div>

                      {t.adminReply && (
                        <div className="bg-blue-50 border-l-2 border-blue-400 rounded px-2.5 py-1.5">
                          <p className="text-[9px] uppercase text-blue-600 mb-0.5">Your reply</p>
                          <p className="text-xs text-blue-900 whitespace-pre-wrap">{t.adminReply}</p>
                        </div>
                      )}

                      <div className="space-y-1.5 pt-1">
                        <Textarea
                          placeholder="Write a reply (optional)…"
                          rows={2}
                          className="text-xs"
                          value={replyDrafts[t.ticketId] || ""}
                          onChange={(e) => setReplyDrafts(p => ({ ...p, [t.ticketId]: e.target.value }))}
                        />
                        <div className="flex flex-wrap gap-1.5">
                          {["open", "in_progress", "resolved", "closed"].map(s => {
                            const isCurrent = t.status === s;
                            const hasReply  = !!replyDrafts[t.ticketId]?.trim();
                            return (
                              <Button
                                key={s} size="sm"
                                variant={isCurrent ? "default" : "outline"}
                                className="h-6 text-[11px] px-2 capitalize"
                                disabled={saving === t.ticketId || (isCurrent && !hasReply)}
                                onClick={() => handleReply(t.ticketId, s)}
                              >
                                <Reply className="w-2.5 h-2.5 mr-1" />{s.replace("_", " ")}
                              </Button>
                            );
                          })}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminSupportTickets;