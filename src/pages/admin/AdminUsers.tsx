import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { useNavigate, useSearchParams } from "react-router-dom";
import AdminLayout  from "./AdminLayout";
import { Button }   from "@/components/ui/button";
import { Input }    from "@/components/ui/input";
import { Badge }    from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { getUsers, deactivateUser, reactivateUser } from "../../../services/adminService";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Eye, UserX, UserCheck, ChevronLeft, ChevronRight, RefreshCw, ArrowUpDown } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

const initials = (name = "") =>
  name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();

const fmt = (d?: string) => d
  ? new Date(d).toLocaleDateString("en-IN", { day:"2-digit", month:"short", year:"numeric" })
  : "—";

const planColor: Record<string, string> = {
  "1month-free": "bg-gray-100 text-gray-600",
  "6months":     "bg-violet-100 text-violet-700",
  "12months":    "bg-blue-100 text-blue-700",
  "24months":    "bg-amber-100 text-amber-700",
};

const PAGE_SIZE = 20;
const STATUS_OPTIONS = ["all", "active", "deactivated", "plan expired"] as const;
type StatusFilter = typeof STATUS_OPTIONS[number];

const PLAN_SORT_OPTIONS = {
  default: { label: "Latest first", order: null },
  "0st":   { label: "Free Trial → Basic → Standard → Premium", order: ["1month-free", "6months", "12months", "24months"] },
  "1st":   { label: "Basic → Standard → Premium",  order: ["6months", "12months", "24months"] },
  "2nd":   { label: "Standard → Premium → Basic",  order: ["12months", "24months", "6months"] },
  "3rd":   { label: "Premium → Basic → Standard",  order: ["24months", "6months", "12months"] },
} as const;
type PlanSort = keyof typeof PLAN_SORT_OPTIONS;

interface UserSubscriptionInfo {
  planId?: string;
  planType?: string;
  status?: string;
}

interface AdminUserRow {
  userId: string;
  name: string;
  email: string;
  easyId?: string;
  mobileNumber?: string;
  profileImage?: string;
  isActive: boolean;
  totalRecords?: number;
  createdAt?: string;
  subscription: UserSubscriptionInfo;
}

interface ModalTarget {
  userId: string;
  name: string;
}

const AdminUsers = () => {
  const navigate    = useNavigate();
  const { toast }   = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  // ---- data (fetched once) ----
  const [allUsers, setAllUsers] = useState<AdminUserRow[]>([]);
  const [loading, setLoading]   = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // ---- client-side filter/search/pagination state ----
  const initialStatus = STATUS_OPTIONS.includes(searchParams.get("status") as StatusFilter)
    ? (searchParams.get("status") as StatusFilter)
    : "all";

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<StatusFilter>(initialStatus);
  const [page,   setPage]   = useState(1);
  const [acting, setActing] = useState<string | null>(null);
  const [deactivateModal, setDeactivateModal] = useState<ModalTarget | null>(null);
  const [deactivateNote,  setDeactivateNote]  = useState("");
  const [reactivateModal, setReactivateModal] = useState<ModalTarget | null>(null);
  const initialPlanSort = (searchParams.get("planSort") as PlanSort) in PLAN_SORT_OPTIONS
    ? (searchParams.get("planSort") as PlanSort)
    : "default";
  const [planSort, setPlanSort] = useState<PlanSort>(initialPlanSort);

  // One-time fetch of ALL users
  useEffect(() => {
    fetchAllUsers();
  }, []);

  // Keep status in sync with the URL (?status=active) without refetching
  useEffect(() => {
    const urlStatus = searchParams.get("status");
    if (urlStatus && STATUS_OPTIONS.includes(urlStatus as StatusFilter) && urlStatus !== status) {
      setStatus(urlStatus as StatusFilter);
      setPage(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const fetchAllUsers = async (isRefresh = false) => {
    try {
      if (isRefresh) { setRefreshing(true); } else { setLoading(true); }
      // Fetch everything once (large limit, no search/status params) —
      // filtering/searching from here on happens client-side.
      const data = await getUsers({ role: "user", limit: 100000, page: 1 });
      setAllUsers(data.users ?? []);
    } catch (err) {
      console.error(err);
      setAllUsers([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleStatusChange = (s: StatusFilter) => {
    setStatus(s);
    setPage(1);
    const next = new URLSearchParams(searchParams);
    if (s === "all") next.delete("status");
    else next.set("status", s);
    setSearchParams(next, { replace: true });
  };

  const handlePlanSortChange = (s: PlanSort) => {
    setPlanSort(s);
    setPage(1);
    const next = new URLSearchParams(searchParams);
    if (s === "default") next.delete("planSort");
    else next.set("planSort", s);
    setSearchParams(next, { replace: true });
  };

  // ---- client-side filtering + searching (no API calls) ----
  const filteredUsers = useMemo(() => {
    let result = allUsers;

    if (status !== "all") {
      console.log("status : ", status);
      
      const wantActive = status === "active";
      if(status === "plan expired") {
        result = result.filter(u => u.subscription.status === "expired");
      } else result = result.filter(u => !!u.isActive === wantActive);
    }

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(u =>
        u.name?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        u.easyId?.toLowerCase().includes(q) ||
        u.subscription.planType?.toLowerCase().includes(q) ||
        u.mobileNumber?.toLowerCase().includes(q) 
      );
    }

    if (planSort !== "default") {
      const order = PLAN_SORT_OPTIONS[planSort].order as readonly string[];
      result = [...result].sort((a, b) => {
        const rankA = order.indexOf(a.subscription?.planId);
        const rankB = order.indexOf(b.subscription?.planId);
        return (rankA === -1 ? 99 : rankA) - (rankB === -1 ? 99 : rankB);
      });
    }

    return result;
  }, [allUsers, search, status, planSort]);

  // ---- client-side pagination over the filtered set ----
  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / PAGE_SIZE));
  const pagedUsers = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredUsers.slice(start, start + PAGE_SIZE);
  }, [filteredUsers, page]);

  // Clamp page if filtering shrinks the result set below the current page
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [totalPages, page]);

  const handleDeactivate = async () => {
    if (!deactivateModal) return;
    setActing(deactivateModal.userId);
    try {
      await deactivateUser(deactivateModal.userId, deactivateNote);
      toast({ title: "Deactivated", description: `${deactivateModal.name} has been deactivated.` });
      setDeactivateModal(null); setDeactivateNote("");
      // Update local state instead of refetching
      setAllUsers(prev => prev.map(u =>
        u.userId === deactivateModal.userId ? { ...u, isActive: false } : u
      ));
    } catch (err: unknown) {
      const message = axios.isAxiosError(err) ? err.response?.data?.message : undefined;
      toast({ title: "Error", description: message, variant: "destructive" });
    } finally { setActing(null); }
  };

  const handleReactivate = async () => {
    if (!reactivateModal) return;
    setActing(reactivateModal.userId);
    try {
      await reactivateUser(reactivateModal.userId);
      toast({ title: "Reactivated", description: `${reactivateModal.name} has been reactivated.` });
      setAllUsers(prev => prev.map(u =>
        u.userId === reactivateModal.userId ? { ...u, isActive: true } : u
      ));
      setReactivateModal(null);
    } catch (err: unknown) {
      const message = axios.isAxiosError(err) ? err.response?.data?.message : undefined;
      toast({ title: "Error", description: message, variant: "destructive" });
    } finally { setActing(null); }
  };

  return (
    <AdminLayout>
      <div className="space-y-5">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-xl font-medium">Users</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {filteredUsers.length} of {allUsers.length} users
            </p>
          </div>
          <Button size="sm" variant="outline" onClick={() => fetchAllUsers(true)} disabled={refreshing}>
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${refreshing ? "animate-spin" : ""}`} />
            {refreshing ? "Refreshing…" : "Refresh"}
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative max-w-xs flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input className="pl-9" placeholder="Search name, email, ID…"
              value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
          </div>
          <div className="flex gap-2">
            {STATUS_OPTIONS.map(s => (
              <Button key={s} size="sm" variant={status === s ? "default" : "outline"}
                className="capitalize" onClick={() => handleStatusChange(s)}>
                {s}
              </Button>
            ))}
          </div>
          <div className="flex items-center gap-1.5">
            <ArrowUpDown className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            <Select value={planSort} onValueChange={(v) => handlePlanSortChange(v as PlanSort)}>
              <SelectTrigger className="h-9 w-[220px] text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(PLAN_SORT_OPTIONS).map(([key, { label }]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Table */}
        <Card>
          <CardContent className="p-0">
            {loading ? (
              <p className="text-center text-sm text-muted-foreground py-10">Loading…</p>
            ) : !pagedUsers.length ? (
              <p className="text-center text-sm text-muted-foreground py-10">No users found.</p>
            ) : (
              <div className="overflow-x-auto">
                <Table className="min-w-[890px]">
                  <TableHeader>
                    <TableRow className="bg-muted">
                      <TableHead className="text-xs">User</TableHead>
                      <TableHead className="text-xs">Easy ID</TableHead>
                      <TableHead className="text-xs">Plan</TableHead>
                      <TableHead className="text-xs">Records</TableHead>
                      <TableHead className="text-xs">Status</TableHead>
                      <TableHead className="text-xs">Joined</TableHead>
                      <TableHead className="text-xs">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pagedUsers.map((u, i) => (
                      <TableRow key={u.userId ?? i} className="hover:bg-muted/50">
                        <TableCell>
                          <div className="flex items-center gap-2.5">
                            <Avatar className="w-8 h-8 shrink-0">
                              {u.profileImage && <AvatarImage src={u.profileImage} alt={u.name} />}
                              <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                                {initials(u.name)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                              <p className="text-sm font-medium truncate">{u.name}</p>
                              <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">{u.easyId}</span>
                        </TableCell>
                        <TableCell>
                          <Badge className={`text-xs ${planColor[u.subscription?.planId] || "bg-gray-100 text-gray-600"}`}>
                            {u.subscription?.planType || "—"}
                          </Badge>
                          {u.subscription?.status === "expired" && (
                            <Badge className="text-xs bg-red-100 text-red-700 ml-1">Expired</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-sm">{u.totalRecords}</TableCell>
                        <TableCell>
                          {u.isActive
                            ? <Badge className="text-xs bg-green-100 text-green-700 border border-green-200">Active</Badge>
                            : <Badge className="text-xs bg-red-100 text-red-700 border border-red-200">Deactivated</Badge>}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">{fmt(u.createdAt)}</TableCell>
                        <TableCell>
                          <div className="flex gap-1.5">
                            <Button size="sm" variant="outline" className="h-7 w-7 p-0"
                              onClick={() => navigate(`/admin/users/${u.userId}`)}>
                              <Eye className="w-3.5 h-3.5" />
                            </Button>
                            {u.isActive ? (
                              <Button size="sm" variant="outline"
                                className="h-7 text-xs bg-red-50 hover:bg-red-100 border-red-200 text-red-700"
                                disabled={acting === u.userId}
                                onClick={() => setDeactivateModal({ userId: u.userId, name: u.name })}>
                                <UserX className="w-3.5 h-3.5" />
                              </Button>
                            ) : (
                              <Button size="sm" variant="outline"
                                className="h-7 text-xs bg-green-50 hover:bg-green-100 border-green-200 text-green-700"
                                disabled={acting === u.userId}
                                onClick={() => setReactivateModal({ userId: u.userId, name: u.name })}>
                                <UserCheck className="w-3.5 h-3.5" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between text-sm">
            <p className="text-muted-foreground">
              Page {page} of {totalPages}
            </p>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" disabled={page === 1}
                onClick={() => setPage(p => p - 1)}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button size="sm" variant="outline" disabled={page === totalPages}
                onClick={() => setPage(p => p + 1)}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Reactivate modal */}
      {reactivateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-base">Reactivate account</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-sm font-medium text-green-700">{reactivateModal.name}</p>
                <p className="text-xs text-green-600 mt-0.5">User will be able to login again after this.</p>
              </div>
              <div className="flex gap-2">
                <Button className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                  onClick={handleReactivate} disabled={!!acting}>
                  {acting ? "Reactivating…" : "Confirm reactivate"}
                </Button>
                <Button variant="outline" className="flex-1"
                  onClick={() => setReactivateModal(null)}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Deactivate modal */}
      {deactivateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-base">Deactivate account</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm font-medium text-red-700">{deactivateModal.name}</p>
                <p className="text-xs text-red-600 mt-0.5">User will not be able to login after this.</p>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-muted-foreground">Note (optional)</label>
                <Input placeholder="Reason for deactivation…"
                  value={deactivateNote} onChange={e => setDeactivateNote(e.target.value)} />
              </div>
              <div className="flex gap-2">
                <Button className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                  onClick={handleDeactivate} disabled={!!acting}>
                  {acting ? "Deactivating…" : "Confirm deactivate"}
                </Button>
                <Button variant="outline" className="flex-1"
                  onClick={() => { setDeactivateModal(null); setDeactivateNote(""); }}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminUsers;