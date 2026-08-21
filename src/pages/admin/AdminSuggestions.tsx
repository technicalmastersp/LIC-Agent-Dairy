import AdminLayout from "./AdminLayout";
import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { getAllSuggestions, updateSuggestionStatus } from "../../../services/adminService";
import { RefreshCw, User as UserIcon } from "lucide-react";

const fmt = (d?: string) => d
  ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
  : "—";

const statusStyle: Record<string, string> = {
  new:            "bg-blue-100 text-blue-700 border border-blue-200",
  under_review:   "bg-amber-100 text-amber-700 border border-amber-200",
  planned:        "bg-purple-100 text-purple-700 border border-purple-200",
  implemented:    "bg-green-100 text-green-700 border border-green-200",
  declined:       "bg-gray-100 text-gray-600 border border-gray-200",
};

interface Suggestion {
  _id: string;
  title: string;
  name: string;
  email: string;
  createdAt?: string;
  status: string;
  message: string;
}

const AdminSuggestions = () => {
  const { toast }     = useToast();

  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState<string | null>(null);

  const fetchAll = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) { setRefreshing(true); } else { setLoading(true); }
      const data = await getAllSuggestions();
      setSuggestions(data);
    } catch {
      setSuggestions([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const handleStatusChange = async (id: string, status: string) => {
    setSaving(id);
    try {
      await updateSuggestionStatus(id, { status });
      toast({ title: "Updated" });
      setSuggestions(prev => prev.map(s => s._id === id ? { ...s, status } : s));
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
                <h1 className="text-2xl font-medium text-form-header">User suggestions</h1>
                <p className="text-sm text-muted-foreground mt-1">Feedback and feature requests from your registered users.</p>
              </div>
              <div className="flex gap-2">
                <Link to="/admin/support"><Button size="sm" variant="outline">View support tickets</Button></Link>
                <Button size="sm" variant="outline" onClick={() => fetchAll(true)} disabled={refreshing}>
                  <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${refreshing ? "animate-spin" : ""}`} />
                  {refreshing ? "Refreshing…" : "Refresh"}
                </Button>
              </div>
            </div>

            {loading ? (
              <p className="text-center text-sm text-muted-foreground py-8">Loading…</p>
            ) : !suggestions.length ? (
              <p className="text-center text-sm text-muted-foreground py-8">No suggestions yet.</p>
            ) : (
              <div className="space-y-4">
                {suggestions.map((s) => (
                  <Card key={s._id}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between flex-wrap gap-2">
                        <div>
                          <CardTitle className="text-sm">{s.title}</CardTitle>
                          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-3 flex-wrap">
                            <span className="flex items-center gap-1"><UserIcon className="w-3 h-3" />{s.name}</span>
                            <span>{s.email}</span>
                            <span>{fmt(s.createdAt)}</span>
                          </p>
                        </div>
                        <Badge className={`text-xs ${statusStyle[s.status]}`}>{s.status.replace("_", " ")}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="text-sm text-foreground whitespace-pre-wrap">{s.message}</p>
                      <Select value={s.status} onValueChange={(v) => handleStatusChange(s._id, v)} disabled={saving === s._id}>
                        <SelectTrigger className="h-8 w-[180px] text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {["new", "under_review", "planned", "implemented", "declined"].map(st => (
                            <SelectItem key={st} value={st} className="capitalize">{st.replace("_", " ")}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
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

export default AdminSuggestions;