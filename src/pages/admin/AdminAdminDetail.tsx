import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import AdminLayout from "./AdminLayout";
import { Button }  from "@/components/ui/button";
import { Badge }   from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input }   from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { getCurrentUser } from "@/utils/auth";
import {
  getUserDetails, getAdmins, getSuperAdmins,
  deactivateUser, reactivateUser, forceLogoutUser,
  updateAdminPermissions, promoteAdmin, demoteAdmin,
} from "../../../services/adminService";
import {
  ArrowLeft, LogOut, UserX, UserCheck, Shield, ToggleLeft, ToggleRight,
  Crown, Clock, CheckCircle2, Mail, Smartphone, Building2, CalendarClock,
} from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import type { AdminAdminDetailData } from "@/types/pages/admin/AdminAdminDetail.types";
import { formatISTDate as fmt } from "@/utils/dateFormat";
import { PERMISSION_DEFS, PERMISSION_RISK_COLOR } from "@/config/adminPermissions";

const initials = (name = "") =>
  name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();

const AdminAdminDetail = () => {
  const { userId }  = useParams();
  const navigate    = useNavigate();
  const { toast }   = useToast();
  const currentUser = getCurrentUser();
  const isSuperAdmin = currentUser?.role === "superadmin";

  const [data,    setData]    = useState<AdminAdminDetailData | null>(null);
  const [loading, setLoading] = useState(true);

  const [localPerms,  setLocalPerms]  = useState<Record<string, boolean>>({});
  const [savingPerms, setSavingPerms] = useState(false);

  const [acting, setActing] = useState(false);
  const [deactivateModal, setDeactivateModal] = useState(false);
  const [deactivateNote,  setDeactivateNote]  = useState("");

  const [logoutModal,  setLogoutModal]  = useState(false);
  const [logoutReason, setLogoutReason] = useState("");
  const [loggingOut,   setLoggingOut]   = useState(false);

  const [promoteModal,    setPromoteModal]    = useState(false);
  const [promoteDuration, setPromoteDuration] = useState("24");
  const [promoteReason,   setPromoteReason]   = useState("");
  const [promoting,       setPromoting]       = useState(false);
  const [demoting,        setDemoting]        = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [base, admins, superadmins] = await Promise.all([
        getUserDetails(userId!),
        getAdmins(),
        getSuperAdmins(),
      ]);
      const asAdmin      = admins.find((a) => a.userId === userId);
      const asSuperAdmin = superadmins.find((s) => s.userId === userId);
      const merged: AdminAdminDetailData = {
        ...base,
        permissions:    asAdmin?.permissions || {},
        tempSuperadmin: asSuperAdmin?.tempSuperadmin,
      };
      setData(merged);
      setLocalPerms(merged.permissions || {});
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [userId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSavePerms = async () => {
    setSavingPerms(true);
    try {
      await updateAdminPermissions(userId!, localPerms);
      toast({ title: "Permissions saved!", description: `${data?.name}'s permissions updated.` });
      fetchData();
    } catch (err: unknown) {
      const message = axios.isAxiosError(err) ? err.response?.data?.message : undefined;
      toast({ title: "Error", description: message, variant: "destructive" });
    } finally { setSavingPerms(false); }
  };

  const handleDeactivateToggle = async () => {
    if (!data) return;
    setActing(true);
    try {
      if (data.isActive) {
        await deactivateUser(userId!, deactivateNote);
        toast({ title: "Deactivated", description: `${data.name} deactivated.` });
      } else {
        await reactivateUser(userId!);
        toast({ title: "Reactivated", description: `${data.name} reactivated.` });
      }
      setDeactivateModal(false);
      setDeactivateNote("");
      fetchData();
    } catch (err: unknown) {
      const message = axios.isAxiosError(err) ? err.response?.data?.message : undefined;
      toast({ title: "Error", description: message, variant: "destructive" });
    } finally { setActing(false); }
  };

  const handleForceLogout = async () => {
    setLoggingOut(true);
    try {
      await forceLogoutUser(userId!, logoutReason || "Session ended by superadmin.");
      toast({ title: "Logged out", description: `${data?.name}'s session has been ended.` });
      setLogoutModal(false);
      setLogoutReason("");
    } catch (err: unknown) {
      const message = axios.isAxiosError(err) ? err.response?.data?.message : undefined;
      toast({ title: "Error", description: message, variant: "destructive" });
    } finally { setLoggingOut(false); }
  };

  const handlePromote = async () => {
    setPromoting(true);
    try {
      await promoteAdmin(userId!, Number(promoteDuration), promoteReason);
      toast({ title: "Promoted!", description: `${data?.name} is now a temporary superadmin. They must re-login.` });
      setPromoteModal(false); setPromoteReason(""); setPromoteDuration("24");
      fetchData();
    } catch (err: unknown) {
      const message = axios.isAxiosError(err) ? err.response?.data?.message : undefined;
      toast({ title: "Error", description: message, variant: "destructive" });
    } finally { setPromoting(false); }
  };

  const handleDemote = async () => {
    setDemoting(true);
    try {
      await demoteAdmin(userId!);
      toast({ title: "Demoted", description: `${data?.name} is back to admin. They must re-login.` });
      fetchData();
    } catch (err: unknown) {
      const message = axios.isAxiosError(err) ? err.response?.data?.message : undefined;
      toast({ title: "Error", description: message, variant: "destructive" });
    } finally { setDemoting(false); }
  };

  if (loading) return <AdminLayout><p className="text-sm text-muted-foreground py-10 text-center">Loading…</p></AdminLayout>;
  if (!data)   return <AdminLayout><p className="text-sm text-muted-foreground py-10 text-center">Admin not found.</p></AdminLayout>;

  const isTempSuperadmin = !!data.tempSuperadmin?.expiresAt;
  const tempExpired = data.tempSuperadmin?.expiresAt ? new Date(data.tempSuperadmin.expiresAt) < new Date() : false;
  const tempHoursLeft = data.tempSuperadmin?.expiresAt && !tempExpired
    ? Math.ceil((new Date(data.tempSuperadmin.expiresAt).getTime() - Date.now()) / 3600000)
    : null;

  return (
    <AdminLayout>
      <div className="space-y-5 max-w-4xl">

        {/* Back + header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <Button size="sm" variant="outline" onClick={() => navigate("/admin/admins")}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-xl font-medium">{data.name}</h1>
              <p className="text-xs text-muted-foreground">{data.email} · {data.easyId}</p>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Badge className={data.isActive
              ? "bg-green-100 text-green-700 border border-green-200"
              : "bg-red-100 text-red-700 border border-red-200"}>
              {data.isActive ? "Active" : "Deactivated"}
            </Badge>
            {data.role === "superadmin" && (
              isTempSuperadmin ? (
                <Badge className="bg-orange-100 text-orange-700 border border-orange-200">
                  <Clock className="w-3 h-3 mr-1" />
                  Temporary {tempHoursLeft ? `· ${tempHoursLeft}h left` : "· Expired"}
                </Badge>
              ) : (
                <Badge className="bg-yellow-100 text-yellow-700 border border-yellow-200">
                  <Crown className="w-3 h-3 mr-1" /> Permanent Superadmin
                </Badge>
              )
            )}
            {isSuperAdmin && (
              <Button size="sm" variant="outline"
                className="bg-orange-50 hover:bg-orange-100 border-orange-200 text-orange-700"
                onClick={() => setLogoutModal(true)}>
                <LogOut className="w-3.5 h-3.5 mr-1.5" /> Force logout
              </Button>
            )}
            {isSuperAdmin && data.role === "admin" && (
              <Button size="sm" variant="outline"
                className={data.isActive
                  ? "bg-red-50 hover:bg-red-100 border-red-200 text-red-700"
                  : "bg-green-50 hover:bg-green-100 border-green-200 text-green-700"}
                onClick={() => setDeactivateModal(true)}>
                {data.isActive
                  ? <><UserX className="w-3.5 h-3.5 mr-1.5" />Deactivate</>
                  : <><UserCheck className="w-3.5 h-3.5 mr-1.5" />Reactivate</>}
              </Button>
            )}
            {isSuperAdmin && data.role === "admin" && (
              <Button size="sm" variant="outline"
                className="bg-yellow-50 hover:bg-yellow-100 border-yellow-200 text-yellow-700"
                onClick={() => setPromoteModal(true)}>
                <Crown className="w-3.5 h-3.5 mr-1.5" /> Promote
              </Button>
            )}
            {isSuperAdmin && data.role === "superadmin" && isTempSuperadmin && (
              <Button size="sm" variant="outline"
                className="bg-red-50 hover:bg-red-100 border-red-200 text-red-700"
                disabled={demoting}
                onClick={handleDemote}>
                {demoting ? "Demoting…" : "Demote"}
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Profile */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-xs uppercase tracking-wide text-muted-foreground">Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-0">
              <div className="flex items-center gap-3 pb-4 mb-1 border-b border-border">
                <Avatar className="w-14 h-14">
                  {data.profileImage && <AvatarImage src={data.profileImage} alt={data.name} />}
                  <AvatarFallback className="bg-primary/10 text-primary text-base font-semibold">
                    {initials(data.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{data.name}</p>
                  <p className="text-xs text-muted-foreground truncate capitalize">{data.role}</p>
                </div>
              </div>
              {[
                { label: "Email",    val: data.email,        icon: Mail },
                { label: "Mobile",   val: data.mobileNumber || "—", icon: Smartphone },
                { label: "Address",  val: data.fullAddress || "—",  icon: Building2 },
                { label: "Joined",   val: fmt(data.createdAt),      icon: CalendarClock },
              ].map(({ label, val, icon: Icon }) => (
                <div key={label} className="flex items-center gap-2.5 py-2 border-b border-border last:border-0">
                  <Icon className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                  <span className="text-xs text-muted-foreground w-16 shrink-0">{label}</span>
                  <span className="text-xs font-medium truncate">{val}</span>
                </div>
              ))}
              {!data.isActive && (
                <div className="mt-3 bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-xs text-red-700 font-medium">Deactivated {fmt(data.deactivatedAt)}</p>
                  {data.deactivationNote && <p className="text-xs text-red-600 mt-0.5">{data.deactivationNote}</p>}
                </div>
              )}
              {isTempSuperadmin && data.tempSuperadmin?.reason && (
                <div className="mt-3 bg-orange-50 border border-orange-200 rounded-lg p-3">
                  <p className="text-xs text-orange-700 font-medium">Temporary superadmin reason</p>
                  <p className="text-xs text-orange-600 mt-0.5">{data.tempSuperadmin.reason}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Permissions — admins only; superadmins bypass permission checks entirely */}
          {data.role === "admin" ? (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-xs uppercase tracking-wide text-muted-foreground flex items-center gap-2">
                  <Shield className="w-4 h-4 text-blue-600" /> Permissions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                {PERMISSION_DEFS.map(({ key, label, desc, risk }) => {
                  const enabled = localPerms[key] ?? false;
                  return (
                    <div key={key}
                      className={`flex items-center justify-between p-2.5 rounded-lg border transition-colors ${
                        enabled ? "bg-blue-50 border-blue-200" : "bg-muted border-border"
                      }`}>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-medium">{label}</p>
                          <span className={`text-[10px] font-medium capitalize ${PERMISSION_RISK_COLOR[risk]}`}>
                            {risk}
                          </span>
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-0.5">{desc}</p>
                      </div>
                      <button className="ml-3 shrink-0" disabled={!isSuperAdmin}
                        onClick={() => setLocalPerms(p => ({ ...p, [key]: !p[key] }))}>
                        {enabled
                          ? <ToggleRight className="w-7 h-7 text-blue-600" />
                          : <ToggleLeft  className="w-7 h-7 text-muted-foreground" />}
                      </button>
                    </div>
                  );
                })}
                {isSuperAdmin && (
                  <Button className="w-full mt-2" onClick={handleSavePerms} disabled={savingPerms}>
                    {savingPerms ? "Saving…" : "Save permissions"}
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-xs uppercase tracking-wide text-muted-foreground flex items-center gap-2">
                  <Crown className="w-4 h-4 text-yellow-500" /> Access level
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-800">
                  Superadmins have full, unrestricted access to every part of the platform —
                  granular permissions don't apply to this account.
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Deactivate / Reactivate modal */}
      {deactivateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-base">{data.isActive ? "Deactivate admin" : "Reactivate admin"}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className={`rounded-lg p-3 border ${data.isActive ? "bg-red-50 border-red-200" : "bg-green-50 border-green-200"}`}>
                <p className={`text-sm font-medium ${data.isActive ? "text-red-700" : "text-green-700"}`}>{data.name}</p>
                <p className={`text-xs mt-0.5 ${data.isActive ? "text-red-600" : "text-green-600"}`}>
                  {data.isActive
                    ? "This admin will lose access immediately and won't be able to login."
                    : "This admin will be able to login again immediately."}
                </p>
              </div>
              {data.isActive && (
                <div className="space-y-1.5">
                  <label className="text-xs text-muted-foreground">Reason (optional)</label>
                  <Input placeholder="e.g. Role change, leave of absence"
                    value={deactivateNote} onChange={e => setDeactivateNote(e.target.value)} />
                </div>
              )}
              <div className="flex gap-2">
                <Button className={`flex-1 text-primary-foreground ${data.isActive ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"}`}
                  onClick={handleDeactivateToggle} disabled={acting}>
                  {acting ? "Working…" : data.isActive ? "Confirm deactivate" : "Confirm reactivate"}
                </Button>
                <Button variant="outline" className="flex-1"
                  onClick={() => { setDeactivateModal(false); setDeactivateNote(""); }}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Force logout modal */}
      {logoutModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <LogOut className="w-4 h-4 text-orange-600" /> Force logout
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                <p className="text-sm font-medium text-orange-700">{data.name}</p>
                <p className="text-xs text-orange-600 mt-0.5">
                  Their current session will be immediately invalidated.
                  They'll need to login again on their next request.
                </p>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-muted-foreground">Reason (optional)</label>
                <Input placeholder="e.g. Security update, suspicious activity…"
                  value={logoutReason} onChange={e => setLogoutReason(e.target.value)} />
              </div>
              <div className="flex gap-2">
                <Button className="flex-1 bg-orange-500 hover:bg-orange-600 text-primary-foreground"
                  onClick={handleForceLogout} disabled={loggingOut}>
                  {loggingOut ? "Logging out…" : "Confirm force logout"}
                </Button>
                <Button variant="outline" className="flex-1"
                  onClick={() => { setLogoutModal(false); setLogoutReason(""); }}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Promote modal */}
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
                <p className="text-sm font-medium text-yellow-700">{data.name}</p>
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
                <Button className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-primary-foreground"
                  onClick={handlePromote} disabled={promoting}>
                  {promoting ? "Promoting…" : "Confirm promote"}
                </Button>
                <Button variant="outline" className="flex-1"
                  onClick={() => { setPromoteModal(false); setPromoteReason(""); setPromoteDuration("24"); }}>
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

export default AdminAdminDetail;
