import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout  from "./AdminLayout";
import { Button }   from "@/components/ui/button";
import { Input }    from "@/components/ui/input";
import { Badge }    from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { getCurrentUser, isAuthenticated } from "@/utils/auth";
import { getUsers, deactivateUser, reactivateUser } from "../../../services/adminService";
import { Search, Eye, UserX, UserCheck, ChevronLeft, ChevronRight } from "lucide-react";

const fmt = (d?: string) => d
  ? new Date(d).toLocaleDateString("en-IN", { day:"2-digit", month:"short", year:"numeric" })
  : "—";

const planColor: Record<string, string> = {
  "1month-free": "bg-gray-100 text-gray-600",
  "6months":     "bg-violet-100 text-violet-700",
  "12months":    "bg-blue-100 text-blue-700",
  "24months":    "bg-amber-100 text-amber-700",
};

const AdminUsers = () => {
  const navigate    = useNavigate();
  const { toast }   = useToast();
  const currentUser = getCurrentUser();
  const authenticated = isAuthenticated();

  const [users,   setUsers]   = useState<any[]>([]);
  const [pagination, setPagination] = useState<any>(null);
  const [search,  setSearch]  = useState("");
  const [status,  setStatus]  = useState("all");
  const [page,    setPage]    = useState(1);
  const [loading, setLoading] = useState(true);
  const [acting,  setActing]  = useState<string | null>(null);
  const [deactivateModal, setDeactivateModal] = useState<any>(null);
  const [deactivateNote,  setDeactivateNote]  = useState("");

  useEffect(() => {
    if (!authenticated || !["admin","superadmin"].includes(currentUser?.role)) {
      navigate("/"); return;
    }
    fetchUsers();
  }, [search, status, page]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await getUsers({ search, page, limit: 20, role: "user", status: status === "all" ? undefined : status });
      setUsers(data.users);
      setPagination(data.pagination);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleDeactivate = async () => {
    if (!deactivateModal) return;
    setActing(deactivateModal.userId);
    try {
      await deactivateUser(deactivateModal.userId, deactivateNote);
      toast({ title: "Deactivated", description: `${deactivateModal.name} has been deactivated.` });
      setDeactivateModal(null); setDeactivateNote(""); fetchUsers();
    } catch (err: any) {
      toast({ title: "Error", description: err.response?.data?.message, variant: "destructive" });
    } finally { setActing(null); }
  };

  const handleReactivate = async (userId: string, name: string) => {
    setActing(userId);
    try {
      await reactivateUser(userId);
      toast({ title: "Reactivated", description: `${name} has been reactivated.` });
      fetchUsers();
    } catch (err: any) {
      toast({ title: "Error", description: err.response?.data?.message, variant: "destructive" });
    } finally { setActing(null); }
  };

  return (
    <AdminLayout>
      <div className="space-y-5">
        <div>
          <h1 className="text-xl font-medium">Users</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {pagination?.total ?? 0} total users
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative max-w-xs flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input className="pl-9" placeholder="Search name, email, ID…"
              value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
          </div>
          <div className="flex gap-2">
            {["all","active","deactivated"].map(s => (
              <Button key={s} size="sm" variant={status === s ? "default" : "outline"}
                className="capitalize" onClick={() => { setStatus(s); setPage(1); }}>
                {s}
              </Button>
            ))}
          </div>
        </div>

        {/* Table */}
        <Card>
          <CardContent className="p-0">
            {loading ? (
              <p className="text-center text-sm text-muted-foreground py-10">Loading…</p>
            ) : !users.length ? (
              <p className="text-center text-sm text-muted-foreground py-10">No users found.</p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
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
                    {users.map((u, i) => (
                      <TableRow key={i} className="hover:bg-muted/50">
                        <TableCell>
                          <p className="text-sm font-medium">{u.name}</p>
                          <p className="text-xs text-muted-foreground">{u.email}</p>
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
                                onClick={() => handleReactivate(u.userId, u.name)}>
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
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between text-sm">
            <p className="text-muted-foreground">
              Page {pagination.page} of {pagination.totalPages}
            </p>
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