import { useState, useEffect } from "react";
import { useNavigate }  from "react-router-dom";
import AdminLayout      from "./AdminLayout";
import { Button }       from "@/components/ui/button";
import { Input }        from "@/components/ui/input";
import { Label }        from "@/components/ui/label";
import { Select, SelectItem, SelectTrigger, SelectValue, SelectContent } from "@/components/ui/select";
import { Badge }        from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast }     from "@/hooks/use-toast";
import { getCurrentUser, isAuthenticated } from "@/utils/auth";
import { getAdmins, createAdmin, deactivateUser, reactivateUser, updateAdminPermissions, forceLogoutUser, getSuperAdmins, promoteAdmin, demoteAdmin } from "../../../services/adminService";
import { Plus, UserX, UserCheck, X, Shield, ToggleLeft, ToggleRight, LogOut, Crown, Clock } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

const fmt = (d?: string) => d
  ? new Date(d).toLocaleDateString("en-IN", { day:"2-digit", month:"short", year:"numeric" })
  : "—";

const AdminAdmins = () => {
  const navigate    = useNavigate();
  const { toast }   = useToast();
  const currentUser = getCurrentUser();
  const authenticated = isAuthenticated();

  const [admins,  setAdmins]  = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [creating,   setCreating]   = useState(false);
  const [acting,     setActing]     = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "", email: "", password: "", mobileNumber: ""
  });
  const [selectedAdmin,  setSelectedAdmin]  = useState<any>(null);
  const [savingPerms,    setSavingPerms]    = useState(false);
  const [localPerms,     setLocalPerms]     = useState<Record<string,boolean>>({});

  const [logoutModal,  setLogoutModal]  = useState<any>(null);
  const [logoutReason, setLogoutReason] = useState("");
  const [loggingOut,   setLoggingOut]   = useState(false);
  const [superadmins,     setSuperadmins]     = useState<any[]>([]);

  const [promoteModal,    setPromoteModal]     = useState<any>(null);
  const [promoteDuration, setPromoteDuration] = useState("24");
  const [promoteReason,   setPromoteReason]   = useState("");
  const [promoting,       setPromoting]        = useState(false);
  const [demoting,        setDemoting]         = useState<string | null>(null);

  const [deactivateModal, setDeactivateModal] = useState<any>(null);
  const [deactivateNote,  setDeactivateNote]  = useState("");
  const [reactivateModal, setReactivateModal] = useState<any>(null);

  const PERMISSION_DEFS = [
    { key: "can_view_users",          label: "View users",              desc: "See user list and details",                  risk: "low"    },
    { key: "can_deactivate_users",    label: "Deactivate users",        desc: "Activate or deactivate user accounts",       risk: "medium" },
    { key: "can_view_withdrawals",    label: "View withdrawals",        desc: "See all withdrawal requests",                risk: "low"    },
    { key: "can_approve_withdrawals", label: "Approve withdrawals",     desc: "Approve pending withdrawal requests",        risk: "high"   },
    { key: "can_reject_withdrawals",  label: "Reject withdrawals",      desc: "Reject and refund withdrawal requests",      risk: "high"   },
    { key: "can_view_logs",           label: "View activity logs",      desc: "See admin action logs",                      risk: "medium" },
    { key: "can_change_subscription", label: "Change subscriptions",    desc: "Modify any user's subscription plan",        risk: "high"   },
    { key: "can_delete_users",        label: "Delete users",            desc: "Permanently delete user accounts and data",  risk: "critical"},
    { key: "can_verify_payment_details", label: "Verify payment details", desc: "Approve or reject users' UPI IDs for withdrawal payouts", risk: "high" },
    { key: "can_manage_support", label: "Manage support & suggestions", desc: "View and reply to support tickets, review user suggestions", risk: "medium" },
  ];

  const riskColor: Record<string, string> = {
    low:      "text-green-600",
    medium:   "text-yellow-600",
    high:     "text-orange-600",
    critical: "text-red-600",
  };

  const handleForceLogout = async () => {
    if (!logoutModal) return;
    setLoggingOut(true);
    try {
      await forceLogoutUser(logoutModal.userId, logoutReason || "Session ended by superadmin.");
      toast({ title: "Logged out", description: `${logoutModal.name}'s session has been ended.` });
      setLogoutModal(null);
      setLogoutReason("");
    } catch (err: any) {
      toast({ title: "Error", description: err.response?.data?.message, variant: "destructive" });
    } finally { setLoggingOut(false); }
  };
  
  const handleOpenPerms = (admin: any) => {
    setSelectedAdmin(admin);
    setLocalPerms(admin.permissions || {});
  };
  
  const handleSavePerms = async () => {
    if (!selectedAdmin) return;
    setSavingPerms(true);
    try {
      await updateAdminPermissions(selectedAdmin.userId, localPerms);
      toast({ title: "Permissions saved!", description: `${selectedAdmin.name}'s permissions updated.` });
      fetchAll();
      setSelectedAdmin(null);
    } catch (err: any) {
      toast({ title: "Error", description: err.response?.data?.message, variant: "destructive" });
    } finally { setSavingPerms(false); }
  };

  useEffect(() => {
    if (!authenticated || currentUser?.role !== "superadmin") { navigate("/"); return; }
    fetchAll();
  }, []);

  // const fetchAdmins = async () => {
  //   try { setLoading(true); setAdmins(await getAdmins()); }
  //   catch (err) { console.error(err); }
  //   finally { setLoading(false); }
  // };

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [adminData, superData] = await Promise.all([getAdmins(), getSuperAdmins()]);
      setAdmins(adminData);
      setSuperadmins(superData);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleCreate = async () => {
    if (!form.name || !form.email || !form.password) {
      toast({ title: "Required", description: "Name, email, password are required.", variant: "destructive" });
      return;
    }
    setCreating(true);
    try {
      await createAdmin(form);
      toast({ title: "Admin created!", description: `${form.name} can now login.` });
      setShowCreate(false);
      setForm({ name: "", email: "", password: "", mobileNumber: "" });
      fetchAll();
    } catch (err: any) {
      toast({ title: "Error", description: err.response?.data?.message, variant: "destructive" });
    } finally { setCreating(false); }
  };

  const handleDeactivate = async () => {
    if (!deactivateModal) return;
    setActing(deactivateModal.userId);
    try {
      await deactivateUser(deactivateModal.userId, deactivateNote);
      toast({ title: "Deactivated", description: `${deactivateModal.name} deactivated.` });
      setDeactivateModal(null);
      setDeactivateNote("");
      fetchAll();
    } catch (err: any) {
      toast({ title: "Error", description: err.response?.data?.message, variant: "destructive" });
    } finally { setActing(null); }
  };

  const handleReactivate = async () => {
    if (!reactivateModal) return;
    setActing(reactivateModal.userId);
    try {
      await reactivateUser(reactivateModal.userId);
      toast({ title: "Reactivated", description: `${reactivateModal.name} reactivated.` });
      setReactivateModal(null);
      fetchAll();
    } catch (err: any) {
      toast({ title: "Error", description: err.response?.data?.message, variant: "destructive" });
    } finally { setActing(null); }
  };

  const handlePromote = async () => {
    if (!promoteModal) return;
    setPromoting(true);
    try {
      await promoteAdmin(promoteModal.userId, Number(promoteDuration), promoteReason);
      toast({ title: "Promoted!", description: `${promoteModal.name} is now a temporary superadmin. They must re-login.` });
      setPromoteModal(null); setPromoteReason(""); setPromoteDuration("24");
      fetchAll();
    } catch (err: any) {
      toast({ title: "Error", description: err.response?.data?.message, variant: "destructive" });
    } finally { setPromoting(false); }
  };

  const handleDemote = async (adminId: string, name: string) => {
    setDemoting(adminId);
    try {
      await demoteAdmin(adminId);
      toast({ title: "Demoted", description: `${name} is back to admin. They must re-login.` });
      fetchAll();
    } catch (err: any) {
      toast({ title: "Error", description: err.response?.data?.message, variant: "destructive" });
    } finally { setDemoting(null); }
  };

  return (
    <AdminLayout>
      <div className="space-y-5 max-w-4xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-medium">Admins</h1>
            <p className="text-sm text-muted-foreground mt-0.5">{admins.length} admin accounts</p>
          </div>
          <Button size="sm" onClick={() => setShowCreate(true)}>
            <Plus className="w-4 h-4 mr-1.5" /> Create admin
          </Button>
        </div>

        {/* Create form */}
        {showCreate && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center justify-between">
                New admin account
                <button onClick={() => setShowCreate(false)}><X className="w-4 h-4" /></button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  { id: "name",         label: "Full name",     placeholder: "Admin name",      type: "text"     },
                  { id: "email",        label: "Email",         placeholder: "admin@email.com", type: "email"    },
                  { id: "password",     label: "Password",      placeholder: "Min. 6 chars",    type: "password" },
                  { id: "mobileNumber", label: "Mobile (opt.)", placeholder: "Mobile number",   type: "text"     },
                ].map(({ id, label, placeholder, type }) => (
                  <div key={id} className="space-y-1.5">
                    <Label className="text-xs">{label}</Label>
                    <Input type={type} placeholder={placeholder}
                      value={(form as any)[id]}
                      onChange={e => setForm(p => ({ ...p, [id]: e.target.value }))} />
                  </div>
                ))}
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-2.5 text-xs text-yellow-800">
                Admin will receive login credentials via email. They should change their password after first login.
              </div>
              <Button className="w-full" onClick={handleCreate} disabled={creating}>
                {creating ? "Creating…" : "Create admin account"}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* SuperAdmins list */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-xs uppercase tracking-wide text-muted-foreground flex items-center gap-2">
              <Crown className="w-4 h-4 text-yellow-500" /> Superadmins ({superadmins.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {!superadmins.length ? (
              <p className="text-sm text-muted-foreground text-center py-6">No superadmins found.</p>
            ) : (
              <div>
                {superadmins.map((s, i) => {
                  const isTemp   = !!s.tempSuperadmin;
                  const expired  = isTemp && new Date(s.tempSuperadmin?.expiresAt) < new Date();
                  const timeLeft = isTemp && !expired
                    ? Math.ceil((new Date(s.tempSuperadmin.expiresAt).getTime() - Date.now()) / 3600000)
                    : null;

                  return (
                    <div key={i} className="flex items-center gap-3 p-4 border-b border-border last:border-0">
                      <Avatar className="w-9 h-9 shrink-0">
                        {s.userProfileImage && <AvatarImage src={s.userProfileImage} alt={s.name} />}
                        <AvatarFallback className="bg-blue-100 text-blue-700 text-xs font-medium">
                          {s.name.split(" ").map((w: string) => w[0]).join("").slice(0,2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-medium">{s.name}</p>
                          {isTemp && (
                            <Badge className="text-xs bg-orange-100 text-orange-700 border border-orange-200">
                              <Clock className="w-3 h-3 mr-1" />
                              Temporary {timeLeft ? `· ${timeLeft}h left` : "· Expired"}
                            </Badge>
                          )}
                          {!isTemp && (
                            <Badge className="text-xs bg-yellow-100 text-yellow-700 border border-yellow-200">
                              <Crown className="w-3 h-3 mr-1" /> Permanent
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">{s.email} · {s.easyId}</p>
                        {isTemp && s.tempSuperadmin?.reason && (
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Reason: {s.tempSuperadmin.reason}
                          </p>
                        )}
                      </div>
                      {isTemp && (
                        <Button size="sm" variant="outline"
                          className="h-7 text-xs bg-red-50 hover:bg-red-100 border-red-200 text-red-700 shrink-0"
                          disabled={demoting === s.userId}
                          onClick={() => handleDemote(s.userId, s.name)}>
                          {demoting === s.userId ? "Demoting…" : "Demote"}
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Admins list */}
        <Card>
          <CardContent className="p-0">
            {loading ? (
              <p className="text-center text-sm text-muted-foreground py-10">Loading…</p>
            ) : !admins.length ? (
              <p className="text-center text-sm text-muted-foreground py-10">No admins yet.</p>
            ) : (
              <div>
                {admins.map((a, i) => (
                  <div key={i} className="flex items-center gap-3 p-4 border-b border-border last:border-0">
                    <Avatar className="w-9 h-9 shrink-0">
                      {a.profileImage && <AvatarImage src={a.profileImage} alt={a.name} />}
                      <AvatarFallback className="bg-blue-100 text-blue-700 text-xs font-medium">
                        {a.name.split(" ").map((w: string) => w[0]).join("").slice(0,2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{a.name}</p>
                      <p className="text-xs text-muted-foreground">{a.email} · {a.easyId}</p>
                      {!a.isActive && (
                        <p className="text-xs text-red-600 mt-0.5">
                          Deactivated {fmt(a.deactivatedAt)}
                          {a.deactivationNote && ` — ${a.deactivationNote}`}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge className={a.isActive
                        ? "text-xs bg-green-100 text-green-700 border border-green-200"
                        : "text-xs bg-red-100 text-red-700 border border-red-200"}>
                        {a.isActive ? "Active" : "Deactivated"}
                      </Badge>
                      <Button size="sm" variant="outline"
                        className={`h-7 text-xs ${a.isActive
                          ? "bg-red-50 hover:bg-red-100 border-red-200 text-red-700"
                          : "bg-green-50 hover:bg-green-100 border-green-200 text-green-700"}`}
                        disabled={acting === a.userId}
                        onClick={() => a.isActive
                          ? setDeactivateModal({ userId: a.userId, name: a.name })
                          : setReactivateModal({ userId: a.userId, name: a.name })}>
                        {a.isActive
                          ? <><UserX className="w-3.5 h-3.5 mr-1" />Deactivate</>
                          : <><UserCheck className="w-3.5 h-3.5 mr-1" />Reactivate</>}
                      </Button>
                      <Button size="sm" variant="outline" className="h-7 text-xs"
                        onClick={() => handleOpenPerms(a)}>
                        <Shield className="w-3.5 h-3.5 mr-1" /> Permissions
                      </Button>
                      <Button size="sm" variant="outline"
                        className="h-7 text-xs bg-orange-50 hover:bg-orange-100 border-orange-200 text-orange-700"
                        onClick={() => setLogoutModal({ userId: a.userId, name: a.name })}>
                        <LogOut className="w-3.5 h-3.5 mr-1" /> Force logout
                      </Button>
                      <Button size="sm" variant="outline"
                        className="h-7 text-xs bg-yellow-50 hover:bg-yellow-100 border-yellow-200 text-yellow-700"
                        onClick={() => setPromoteModal({ userId: a.userId, name: a.name })}>
                        <Crown className="w-3.5 h-3.5 mr-1" /> Promote
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        {selectedAdmin && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <CardHeader className="pb-3 sticky top-0 bg-white z-10 border-b border-border">
                <CardTitle className="text-base flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-blue-600" />
                    Permissions — {selectedAdmin.name}
                  </span>
                  <button onClick={() => setSelectedAdmin(null)}>
                    <X className="w-4 h-4 text-muted-foreground" />
                  </button>
                </CardTitle>
                <p className="text-xs text-muted-foreground mt-1">
                  Toggle permissions on or off. Changes take effect immediately after saving.
                  Superadmin always has full access regardless of these settings.
                </p>
              </CardHeader>
              <CardContent className="space-y-1 pt-4">
                {PERMISSION_DEFS.map(({ key, label, desc, risk }) => {
                  const enabled = localPerms[key] ?? false;
                  return (
                    <div key={key}
                      className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                        enabled ? "bg-blue-50 border-blue-200" : "bg-muted border-border"
                      }`}>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium">{label}</p>
                          <span className={`text-xs font-medium capitalize ${riskColor[risk]}`}>
                            {risk}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
                      </div>
                      <button
                        className="ml-4 shrink-0"
                        onClick={() => setLocalPerms(p => ({ ...p, [key]: !p[key] }))}
                      >
                        {enabled
                          ? <ToggleRight className="w-8 h-8 text-blue-600" />
                          : <ToggleLeft  className="w-8 h-8 text-muted-foreground" />}
                      </button>
                    </div>
                  );
                })}
        
                {/* Preset buttons */}
                <div className="pt-3 border-t border-border space-y-2">
                  <p className="text-xs text-muted-foreground font-medium">Quick presets:</p>
                  <div className="flex gap-2 flex-wrap">
                    <Button size="sm" variant="outline" className="text-xs"
                      onClick={() => setLocalPerms({
                        can_view_users: true, can_view_withdrawals: true,
                        can_approve_withdrawals: true, can_reject_withdrawals: true,
                        can_deactivate_users: false, can_view_logs: false,
                        can_change_subscription: false, can_delete_users: false,
                      })}>
                      Withdrawal manager
                    </Button>
                    <Button size="sm" variant="outline" className="text-xs"
                      onClick={() => setLocalPerms({
                        can_view_users: true, can_deactivate_users: true,
                        can_view_withdrawals: true, can_approve_withdrawals: true,
                        can_reject_withdrawals: true, can_view_logs: true,
                        can_change_subscription: false, can_delete_users: false,
                        can_verify_payment_details: true,
                        can_manage_support: true,
                      })}>
                      Full admin
                    </Button>
                    <Button size="sm" variant="outline" className="text-xs text-red-600"
                      onClick={() => setLocalPerms(Object.fromEntries(
                        PERMISSION_DEFS.map(p => [p.key, false])
                      ))}>
                      Revoke all
                    </Button>
                  </div>
                </div>
                  
                <div className="flex gap-2 pt-2">
                  <Button className="flex-1" onClick={handleSavePerms} disabled={savingPerms}>
                    {savingPerms ? "Saving…" : "Save permissions"}
                  </Button>
                  <Button variant="outline" className="flex-1" onClick={() => setSelectedAdmin(null)}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {deactivateModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle className="text-base">Deactivate admin</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm font-medium text-red-700">{deactivateModal.name}</p>
                  <p className="text-xs text-red-600 mt-0.5">This admin will lose access immediately and won't be able to login.</p>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Reason (optional)</Label>
                  <Input
                    placeholder="e.g. Role change, leave of absence"
                    value={deactivateNote}
                    onChange={e => setDeactivateNote(e.target.value)}
                  />
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

        {reactivateModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle className="text-base">Reactivate admin</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-sm font-medium text-green-700">{reactivateModal.name}</p>
                  <p className="text-xs text-green-600 mt-0.5">This admin will be able to login again immediately.</p>
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

        {logoutModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <LogOut className="w-4 h-4 text-orange-600" /> Force logout admin
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                  <p className="text-sm font-medium text-orange-700">{logoutModal.name}</p>
                  <p className="text-xs text-orange-600 mt-0.5">
                    Their session will be immediately invalidated.
                    They'll need to login again on their next request.
                  </p>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-muted-foreground">Reason (optional)</label>
                  <Input placeholder="e.g. Permission update, security refresh…"
                    value={logoutReason} onChange={e => setLogoutReason(e.target.value)} />
                </div>
                <div className="flex gap-2">
                  <Button className="flex-1 bg-orange-500 hover:bg-orange-600 text-white"
                    onClick={handleForceLogout} disabled={loggingOut}>
                    {loggingOut ? "Logging out…" : "Confirm force logout"}
                  </Button>
                  <Button variant="outline" className="flex-1"
                    onClick={() => { setLogoutModal(null); setLogoutReason(""); }}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Promote and Demote an Admin */}
        {promoteModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Crown className="w-4 h-4 text-yellow-500" /> Promote to temporary superadmin
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-sm font-medium text-yellow-700">{promoteModal.name}</p>
                  <p className="text-xs text-yellow-600 mt-0.5">
                    They'll have full superadmin access for the selected duration.
                    Auto-demoted when time expires. They must re-login to activate the new role.
                  </p>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-muted-foreground">Duration</label>
                  <Select value={promoteDuration} onValueChange={setPromoteDuration}>
                    <SelectTrigger className="text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[
                        { val: "1",   label: "1 hour"   },
                        { val: "6",   label: "6 hours"  },
                        { val: "12",  label: "12 hours" },
                        { val: "24",  label: "24 hours (1 day)" },
                        { val: "48",  label: "48 hours (2 days)" },
                        { val: "72",  label: "72 hours (3 days)" },
                        { val: "168", label: "168 hours (1 week)" },
                      ].map(o => (
                        <SelectItem key={o.val} value={o.val}>{o.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-muted-foreground">Reason (optional)</label>
                  <Input placeholder="e.g. Covering while I'm away…"
                    value={promoteReason} onChange={e => setPromoteReason(e.target.value)} />
                </div>
                <div className="flex gap-2">
                  <Button className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white"
                    onClick={handlePromote} disabled={promoting}>
                    {promoting ? "Promoting…" : "Confirm promote"}
                  </Button>
                  <Button variant="outline" className="flex-1"
                    onClick={() => { setPromoteModal(null); setPromoteReason(""); setPromoteDuration("24"); }}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminAdmins;