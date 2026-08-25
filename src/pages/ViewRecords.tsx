import { useState, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import RecordDetailsModal from "@/components/RecordDetailsModal";
import EditRecordModal from "@/components/EditRecordModal";
import {
  Search, Eye, Trash2, ArrowUpDown, Plus, Edit,
  FileText, IndianRupee, CalendarPlus, FolderOpen, ShieldCheck, Lock,
  Download,
} from "lucide-react";
import { getCurrentUser } from "@/utils/auth";
import { useLanguage } from "@/hooks/useLanguage";
import { useToast } from "@/hooks/use-toast";
import { getAllRecords, deleteRecord } from "../../services/recordService";
import { dedupeRecords } from "@/utils/recordDedupe";
import { convertDateToIndianFormat } from "@/utils/tools";
import { INSURANCE_TYPES, getInsuranceTypeDef } from "@/config/insuranceTypes";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Record } from "@/types/Record";

export type { Record };

// Deterministic soft color for an avatar chip, derived from the name itself
const avatarPalette = [
  "bg-blue-100 text-blue-700",
  "bg-violet-100 text-violet-700",
  "bg-emerald-100 text-emerald-700",
  "bg-amber-100 text-amber-700",
  "bg-rose-100 text-rose-700",
  "bg-cyan-100 text-cyan-700",
];
const avatarColor = (name: string) => {
  const idx = (name || "").split("").reduce((s, c) => s + c.charCodeAt(0), 0) % avatarPalette.length;
  return avatarPalette[idx];
};
const initials = (name: string) =>
  (name || "?").trim().split(/\s+/).slice(0, 2).map(p => p[0]?.toUpperCase()).join("");

// A pre-existing record with no insuranceType predates this feature and is
// treated as Life Insurance, matching the backend's default.
const recordTypeLabel = (record: Record) => {
  const type = record.insuranceType || "Life Insurance";
  if (type === "Other") return record.customInsuranceTypeName || "Custom";
  return getInsuranceTypeDef(type)?.shortLabel || type;
};

const ViewRecords = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { toast } = useToast();
  const currentUser = getCurrentUser();

  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebouncedValue(searchTerm, 300);
  const [typeFilter, setTypeFilter] = useState("all");
  const [sortField, setSortField] = useState<keyof Record>("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [selectedRecord, setSelectedRecord] = useState<Record | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<Record | null>(null);

  // Mirrors the backend: an expired/cancelled plan still gets full read access
  // to this list (requireSubscriptionForViewing), but add/edit/delete stay
  // gated behind requireActiveSubscription — so we disable those controls
  // here too rather than let the user hit a confusing 403 after the fact.
  const subStatus = currentUser?.subscription?.status;
  const isReadOnly = subStatus === "expired" || subStatus === "cancelled";

  const queryClient = useQueryClient();

  const {
    data: records = [],
    isLoading,
  } = useQuery<Record[]>({
    queryKey: ["records"],
    queryFn: getAllRecords,
    // The dedupe step is pure post-processing of whatever the API returns —
    // `select` keeps the cached data itself as the API shape, and only
    // transforms it for this component, same as the old
    // setRecords(dedupeRecords(...)) did.
    select: (data) => dedupeRecords(data ?? []),
  });

  const filteredAndSortedRecords = useMemo(() => {
    if (!records || records.length === 0) return [];

    let filtered = records.filter(record =>
      record.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
      record.fatherName.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
      record.occupation.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
      record.aadhaarLinkedMobileNumber.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
      record.currentPolicy.policyNumber.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
      record.currentPolicy.modeOfPayment.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
      record.currentPolicy.branch.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
      recordTypeLabel(record).toLowerCase().includes(debouncedSearchTerm.toLowerCase())
    );

    if (typeFilter !== "all") {
      filtered = filtered.filter(record => (record.insuranceType || "Life Insurance") === typeFilter);
    }

    return filtered.sort((a, b) => {
      let aValue = a[sortField] as string;
      let bValue = b[sortField] as string;

      if (sortField === "currentPolicy") {
        aValue = a.currentPolicy.policyNumber;
        bValue = b.currentPolicy.policyNumber;
      }

      if (sortDirection === "asc") {
        return aValue.localeCompare(bValue);
      } else {
        return bValue.localeCompare(aValue);
      }
    });
  }, [records, debouncedSearchTerm, typeFilter, sortField, sortDirection]);

  // ── Derived summary stats (real numbers from the data, styled like Home's stat row) ──
  const summaryStats = useMemo(() => {
    const totalSumAssured = records.reduce(
      (sum, r) => sum + (Number(r.currentPolicy?.sumAssured) || 0), 0
    );
    const now = new Date();
    const addedThisMonth = records.filter(r => {
      if (!r.createdAt) return false;
      const d = new Date(r.createdAt);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).length;
    const branches = new Set(records.map(r => r.currentPolicy?.branch).filter(Boolean)).size;

    return { totalSumAssured, addedThisMonth, branches };
  }, [records]);

  const handleSort = (field: keyof Record) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // ── CSV export of the currently filtered/searched records ──
  // A cell can legitimately contain a comma, quote, or newline (names,
  // branch names, etc.), so quote every field and escape embedded quotes
  // by doubling them, per the standard CSV quoting rule.
  const csvEscape = (value: string) => `"${String(value ?? "").replace(/"/g, '""')}"`;

  const handleExportCsv = () => {
    const headers = [
      "Name", "Type", "Father's Name", "Age", "Policy Number",
      "Sum Assured", "Branch", "Created Date",
    ];

    const rows = filteredAndSortedRecords.map((record) => [
      record.name,
      recordTypeLabel(record),
      record.fatherName,
      record.age,
      record.currentPolicy?.policyNumber,
      record.currentPolicy?.sumAssured,
      record.currentPolicy?.branch,
      convertDateToIndianFormat(record.createdAt),
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.map(csvEscape).join(","))
      .join("\r\n");

    // Leading BOM so Excel opens the file as UTF-8 instead of guessing
    // wrong and mangling non-ASCII names.
    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const dateStamp = new Date().toISOString().slice(0, 10);
    link.href = url;
    link.download = `policy-records-${dateStamp}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      title: "Export complete",
      description: `${filteredAndSortedRecords.length} record${filteredAndSortedRecords.length !== 1 ? "s" : ""} exported to CSV.`,
    });
  };

  const handleViewRecord = (record: Record) => {
    setSelectedRecord(record);
    setIsModalOpen(true);
  };

  const handleDeleteRecord = async (recordId: string) => {
    const success = await deleteRecord(recordId);
    if (success) {
      queryClient.invalidateQueries({ queryKey: ["records"] });
      toast({
        title: "Success",
        description: "Record deleted successfully",
      });
    }
  };

  const handleEditRecord = (record: Record) => {
    if (isReadOnly) {
      toast({
        title: "Subscription expired",
        description: "Renew your plan to edit records. You can still view everything below.",
        variant: "destructive",
      });
      return;
    }
    setEditingRecord(record);
    setIsEditModalOpen(true);
  };

  const handleUpdateRecord = async () => {
    queryClient.invalidateQueries({ queryKey: ["records"] });
  };

  const SortableHeader = ({ field, children }: { field: keyof Record; children: React.ReactNode }) => (
    <TableHead
      className="cursor-pointer select-none hover:bg-table-header/70 transition-colors border border-table-border text-xs font-medium uppercase tracking-wide text-muted-foreground"
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center gap-1.5">
        <span>{children}</span>
        <ArrowUpDown className={`w-3.5 h-3.5 ${sortField === field ? "text-form-header" : "text-muted-foreground/40"}`} />
      </div>
    </TableHead>
  );

  return (
    <div className="min-h-screen bg-muted/30 flex flex-col">
      <Navigation />

      <main className="container mx-auto px-4 py-8 flex-1">
        <div className="max-w-7xl mx-auto space-y-6">

          {/* ── Expired subscription notice: view stays open, add/edit is disabled ── */}
          {isReadOnly && (
            <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4">
              <Lock className="w-4.5 h-4.5 text-amber-600 mt-0.5 shrink-0" />
              <div className="text-sm">
                <p className="text-amber-900 font-medium">Your subscription has expired</p>
                <p className="text-amber-800/90 mt-0.5">
                  You can still view all your saved records here, but adding new policies or editing
                  existing ones is paused until you renew.{" "}
                  <Link to="/our-plans" className="text-amber-900 font-medium underline underline-offset-2">
                    Renew your plan
                  </Link>
                </p>
              </div>
            </div>
          )}

          {/* ── Hero header ── */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-form-header">Policy Records</h1>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Manage and view all life insurance policy records
                </p>
              </div>
            </div>
            {isReadOnly ? (
              <Button
                variant="outline"
                className="border-amber-300 text-amber-800 hover:bg-amber-50"
                onClick={() => navigate("/our-plans")}
              >
                <Lock className="w-4 h-4 mr-2" />
                Renew to add records
              </Button>
            ) : (
              <Link to="/add-record">
                <Button className="bg-primary hover:bg-primary-light shadow-sm">
                  <Plus className="w-4 h-4 mr-2" />
                  {t("addNewRecord")}
                </Button>
              </Link>
            )}
          </div>

          {/* ── Stat row (Home-style summary cards) ── */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              {
                label: "Total records",
                val: records.length,
                icon: <FileText className="w-4 h-4" />,
                sub: "All policy records",
                bg: "bg-blue-50",
                color: "text-form-header",
              },
              {
                label: "Total sum assured",
                val: `₹${summaryStats.totalSumAssured.toLocaleString("en-IN")}`,
                icon: <IndianRupee className="w-4 h-4" />,
                sub: "Across all policies",
                bg: "bg-emerald-50",
                color: "text-emerald-700",
              },
              {
                label: "Added this month",
                val: summaryStats.addedThisMonth,
                icon: <CalendarPlus className="w-4 h-4" />,
                sub: "New records",
                bg: "bg-amber-50",
                color: "text-amber-700",
              },
              {
                label: "Branches",
                val: summaryStats.branches,
                icon: <FolderOpen className="w-4 h-4" />,
                sub: "Distinct branches",
                bg: "bg-violet-50",
                color: "text-violet-700",
              },
            ].map(({ label, val, icon, sub, bg, color }) => (
              <Card key={label} className={`${bg} border-transparent hover:shadow-sm transition-shadow`}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-muted-foreground mb-2 text-xs">
                    {icon} {label}
                  </div>
                  <p className={`text-2xl font-semibold ${color}`}>{val}</p>
                  <p className="text-xs text-muted-foreground mt-1">{sub}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Search bar */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex flex-col sm:flex-row gap-3 flex-1 w-full sm:max-w-2xl">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      placeholder="Search by name, policy number, occupation..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 focus-visible:ring-primary/40"
                    />
                  </div>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="sm:w-56 shrink-0">
                      <SelectValue placeholder="All insurance types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All insurance types</SelectItem>
                      {INSURANCE_TYPES.filter(t => t.id !== "Other").map((t) => (
                        <SelectItem key={t.id} value={t.id}>{t.label}</SelectItem>
                      ))}
                      <SelectItem value="Other">Other (Custom)</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    variant="outline"
                    onClick={handleExportCsv}
                    disabled={filteredAndSortedRecords.length === 0}
                    className="shrink-0"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export CSV
                  </Button>
                </div>
                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                  <span>{t("totalRecords")}: <Badge variant="secondary">{records.length}</Badge></span>
                  <span>{t("filteredRecords")}: <Badge variant="outline">{filteredAndSortedRecords.length}</Badge></span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Records Table */}
          <Card className="overflow-hidden">
            <CardHeader className="border-b border-table-border bg-table-header/40">
              <CardTitle className="text-form-header text-base">{t("allRecord")}</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {filteredAndSortedRecords.length === 0 ? (
                <div className="text-center py-16 px-4">
                  <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                    {isLoading
                      ? <div className="w-5 h-5 border-2 border-primary/40 border-t-primary rounded-full animate-spin" />
                      : <FolderOpen className="w-6 h-6 text-muted-foreground" />}
                  </div>
                  <div className="text-muted-foreground text-base mb-4">
                    {isLoading ? (
                      <span>{t("loadingRecords")}</span>
                    ) : records.length === 0 ? (
                      <span>No records yet</span>
                    ) : (
                      <span>No records match your search</span>
                    )}
                  </div>
                  {records.length === 0 && !isLoading && (
                    isReadOnly ? (
                      <Button variant="outline" className="border-amber-300 text-amber-800 hover:bg-amber-50" onClick={() => navigate("/our-plans")}>
                        <Lock className="w-4 h-4 mr-2" />
                        Renew to add records
                      </Button>
                    ) : (
                      <Link to="/add-record">
                        <Button>
                          <Plus className="w-4 h-4 mr-2" />
                          Add First Record
                        </Button>
                      </Link>
                    )
                  )}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-table-header">
                        <TableHead className="border border-table-border text-xs font-medium uppercase tracking-wide text-muted-foreground w-12">
                          No.
                        </TableHead>
                        <SortableHeader field="name">Name</SortableHeader>
                        <TableHead className="border border-table-border text-xs font-medium uppercase tracking-wide text-muted-foreground">Type</TableHead>
                        <SortableHeader field="fatherName">Father's Name</SortableHeader>
                        <SortableHeader field="age">Age</SortableHeader>
                        <TableHead className="border border-table-border text-xs font-medium uppercase tracking-wide text-muted-foreground">Policy Number</TableHead>
                        <TableHead className="border border-table-border text-xs font-medium uppercase tracking-wide text-muted-foreground">Sum Assured</TableHead>
                        <TableHead className="border border-table-border text-xs font-medium uppercase tracking-wide text-muted-foreground">Branch</TableHead>
                        <SortableHeader field="createdAt">Created</SortableHeader>
                        <TableHead className="border border-table-border text-xs font-medium uppercase tracking-wide text-muted-foreground">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredAndSortedRecords.map((record, idx) => (
                        <TableRow key={record.recordId || record._id || record.id} className="hover:bg-muted/50 transition-colors group">
                          <TableCell className="border border-table-border">
                            <span className="font-mono text-xs text-muted-foreground">
                              {String(idx + 1).padStart(3, "0")}
                            </span>
                          </TableCell>
                          <TableCell className="border border-table-border font-medium">
                            <div className="flex items-center gap-2.5">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 ${avatarColor(record.name)}`}>
                                {initials(record.name)}
                              </div>
                              <span>{record.name}</span>
                            </div>
                          </TableCell>
                          <TableCell className="border border-table-border">
                            <Badge variant="outline" className="text-xs font-normal whitespace-nowrap">
                              {recordTypeLabel(record)}
                            </Badge>
                          </TableCell>
                          <TableCell className="border border-table-border text-muted-foreground">
                            {record.fatherName}
                          </TableCell>
                          <TableCell className="border border-table-border">
                            {record.age}
                          </TableCell>
                          <TableCell className="border border-table-border">
                            <Badge variant="outline" className="font-mono text-xs">
                              {record.currentPolicy.policyNumber || "N/A"}
                            </Badge>
                          </TableCell>
                          <TableCell className="border border-table-border font-medium text-emerald-700">
                            ₹{record.currentPolicy.sumAssured || "0"}
                          </TableCell>
                          <TableCell className="border border-table-border text-muted-foreground">
                            {record.currentPolicy.branch || "-"}
                          </TableCell>
                          <TableCell className="border border-table-border text-sm text-muted-foreground">
                            {convertDateToIndianFormat(record.createdAt)}
                          </TableCell>
                          <TableCell className="border border-table-border">
                            <div className="flex items-center gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleViewRecord(record)}
                                className="h-8 w-8 p-0"
                                title="View Record"
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEditRecord(record)}
                                className={`h-8 w-8 p-0 ${isReadOnly ? "opacity-50 cursor-not-allowed" : ""}`}
                                title={isReadOnly ? "Edit disabled — subscription expired" : "Edit Record"}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDeleteRecord(record.recordId ?? record._id ?? record.id)}
                                disabled
                                className="h-8 w-8 p-0 opacity-50 cursor-not-allowed"
                                title="Delete Record (Disabled)"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
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
        </div>
      </main>

      {/* Record Details Modal */}
      <RecordDetailsModal
        record={selectedRecord}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

      {/* Edit Record Modal */}
      <EditRecordModal
        record={editingRecord}
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          queryClient.invalidateQueries({ queryKey: ["records"] });
        }}
        onUpdate={handleUpdateRecord}
      />

      <Footer />
    </div>
  );
};

export default ViewRecords;