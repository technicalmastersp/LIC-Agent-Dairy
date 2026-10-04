import AdminLayout from "./AdminLayout";
import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { getCallRequests, updateCallRequest } from "../../../services/adminService";
import { RefreshCw, Phone, Copy, User as UserIcon, Clock, CheckCircle2, PhoneMissed, XCircle, RotateCcw } from "lucide-react";
import { formatISTDateTime as fmt } from "@/utils/dateFormat";
import { BUSINESS_HOURS_LABELS, isTeamAvailableNow } from "@/config/businessHours";
import type { AdminCallRequest, CallRequestFilter, CallRequestStatus } from "@/types/pages/admin/AdminCallRequests.types";

const statusStyle: Record<CallRequestStatus, { label: string; cls: string }> = {
  pending:   { label: "Waiting for call",   cls: "bg-blue-100 text-blue-700 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-900" },
  no_answer: { label: "No answer",          cls: "bg-amber-100 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900" },
  completed: { label: "Called",             cls: "bg-green-100 text-green-700 border border-green-200 dark:bg-green-950/40 dark:text-green-400 dark:border-green-900" },
  cancelled: { label: "Closed / cancelled", cls: "bg-gray-100 text-gray-600 border border-gray-200 dark:bg-muted dark:text-muted-foreground dark:border-border" },
};

const FILTERS: { key: CallRequestFilter; label: string }[] = [
  { key: "open", label: "To call" },
  { key: "completed", label: "Called" },
  { key: "cancelled", label: "Closed" },
  { key: "all", label: "All" },
];

const AdminCallRequests = () => {
  const { toast } = useToast();
  const [filter, setFilter] = useState<CallRequestFilter>("open");
  const [rows, setRows] = useState<AdminCallRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<string | null>(null);

  const load = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true); else setLoading(true);
      setRows(await getCallRequests(filter));
    } catch {
      setRows([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filter]);

  useEffect(() => { load(); }, [load]);

  const act = async (r: AdminCallRequest, status?: CallRequestStatus) => {
    const note = notes[r.requestId]?.trim();
    setSaving(r.requestId);
    try {
      await updateCallRequest(r.requestId, {
        ...(status ? { status } : {}),
        ...(note !== undefined && note !== (r.adminNote ?? "") ? { adminNote: note } : {}),
      });
      toast({ title: "Updated", description: status ? `Marked as ${statusStyle[status].label.toLowerCase()}.` : "Note saved." });
      setNotes((p) => { const n = { ...p }; delete n[r.requestId]; return n; });
      load(true);
    } catch (err: unknown) {
      const message = axios.isAxiosError(err) ? err.response?.data?.message : undefined;
      toast({ title: "Error", description: message || "Could not update.", variant: "destructive" });
    } finally {
      setSaving(null);
    }
  };

  const copy = async (phone: string) => {
    try {
      await navigator.clipboard.writeText(phone);
      toast({ title: "Number copied" });
    } catch {
      toast({ title: "Couldn't copy", description: phone, variant: "destructive" });
    }
  };

  const open = isTeamAvailableNow();

  return (
    <AdminLayout>
      <div className="min-h-screen bg-muted/30">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto space-y-6">

            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <h1 className="text-2xl font-medium text-form-header">Call requests</h1>
                <p className="text-sm text-muted-foreground mt-1">
                  People who asked us to call them back. Call only within business hours; registered users are listed first.
                </p>
              </div>
              <Button size="sm" variant="outline" onClick={() => load(true)} disabled={refreshing}>
                <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${refreshing ? "animate-spin" : ""}`} />
                {refreshing ? "Refreshing…" : "Refresh"}
              </Button>
            </div>

            <div className={`flex items-start gap-2.5 rounded-lg border px-3 py-2.5 text-xs ${open ? "border-green-200 bg-green-50 dark:bg-green-950/30 dark:border-green-900" : "border-border bg-background"}`}>
              <Clock className="w-4 h-4 mt-0.5 shrink-0 text-primary" />
              <div>
                <p className="font-medium text-form-header">{open ? "Call window is open now" : "Outside call hours — calls start at the next opening"}</p>
                <p className="text-muted-foreground">
                  {BUSINESS_HOURS_LABELS.map((l) => `${l.days}: ${l.hours}`).join(" · ")} (IST)
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              {FILTERS.map((f) => (
                <Button key={f.key} size="sm" variant={filter === f.key ? "default" : "outline"} className="h-8 text-xs" onClick={() => setFilter(f.key)}>
                  {f.label}
                </Button>
              ))}
            </div>

            {loading ? (
              <p className="text-center text-sm text-muted-foreground py-8">Loading…</p>
            ) : !rows.length ? (
              <p className="text-center text-sm text-muted-foreground py-8">No call requests here.</p>
            ) : (
              <div className="space-y-4">
                {rows.map((r) => {
                  const busy = saving === r.requestId;
                  const draft = notes[r.requestId];
                  return (
                    <Card key={r.requestId} className="shadow-sm">
                      <CardHeader className="pb-2 pt-4 px-4">
                        <div className="flex items-start justify-between flex-wrap gap-2">
                          <div className="space-y-1">
                            <CardTitle className="text-xs font-mono">{r.requestId}</CardTitle>
                            <p className="text-[11px] text-muted-foreground flex items-center gap-3 flex-wrap">
                              <span className="flex items-center gap-1"><UserIcon className="w-3 h-3" />{r.name}</span>
                              <span>Requested {fmt(r.createdAt)}</span>
                              {r.isOpen && <span className="flex items-center gap-1"><Clock className="w-3 h-3" />Call from {fmt(r.expectedCallFrom)}</span>}
                              {r.isGuest ? <Badge variant="outline" className="text-[10px]">Guest</Badge>
                                : <Badge className="text-[10px] bg-primary/10 text-primary border border-primary/20">Registered user</Badge>}
                              {!r.submittedDuringHours && <Badge variant="outline" className="text-[10px]">After hours</Badge>}
                              {r.callAttempts > 0 && <Badge variant="outline" className="text-[10px]">{r.callAttempts} attempt{r.callAttempts > 1 ? "s" : ""}</Badge>}
                            </p>
                          </div>
                          <Badge className={`text-xs ${statusStyle[r.status].cls}`}>{statusStyle[r.status].label}</Badge>
                        </div>
                      </CardHeader>

                      <CardContent className="space-y-3 px-4 pb-4">
                        <div className="flex items-center gap-2 flex-wrap">
                          <a
                            href={`tel:+91${r.phone}`}
                            className="inline-flex items-center gap-1.5 rounded-md bg-primary text-primary-foreground px-3 py-1.5 text-sm font-medium hover:bg-primary-light"
                          >
                            <Phone className="w-3.5 h-3.5" /> +91 {r.phone}
                          </a>
                          <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => copy(r.phone)}>
                            <Copy className="w-3 h-3 mr-1.5" /> Copy
                          </Button>
                        </div>

                        <div>
                          <p className="text-[10px] uppercase text-muted-foreground mb-0.5">{r.category}</p>
                          <p className="text-xs text-foreground whitespace-pre-wrap">{r.reason}</p>
                        </div>

                        <Textarea
                          rows={2}
                          className="text-xs"
                          placeholder="Internal note (not shown to the caller)…"
                          value={draft ?? r.adminNote ?? ""}
                          maxLength={500}
                          onChange={(e) => setNotes((p) => ({ ...p, [r.requestId]: e.target.value }))}
                        />

                        <div className="flex flex-wrap gap-1.5">
                          {r.isOpen ? (
                            <>
                              <Button size="sm" className="h-7 text-[11px] px-2.5" disabled={busy} onClick={() => act(r, "completed")}>
                                <CheckCircle2 className="w-3 h-3 mr-1" /> Called
                              </Button>
                              <Button size="sm" variant="outline" className="h-7 text-[11px] px-2.5" disabled={busy} onClick={() => act(r, "no_answer")}>
                                <PhoneMissed className="w-3 h-3 mr-1" /> No answer
                              </Button>
                              <Button size="sm" variant="outline" className="h-7 text-[11px] px-2.5" disabled={busy} onClick={() => act(r, "cancelled")}>
                                <XCircle className="w-3 h-3 mr-1" /> Close
                              </Button>
                            </>
                          ) : (
                            <Button size="sm" variant="outline" className="h-7 text-[11px] px-2.5" disabled={busy} onClick={() => act(r, "pending")}>
                              <RotateCcw className="w-3 h-3 mr-1" /> Reopen
                            </Button>
                          )}
                          {draft !== undefined && draft.trim() !== (r.adminNote ?? "") && (
                            <Button size="sm" variant="secondary" className="h-7 text-[11px] px-2.5" disabled={busy} onClick={() => act(r)}>
                              Save note
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminCallRequests;
