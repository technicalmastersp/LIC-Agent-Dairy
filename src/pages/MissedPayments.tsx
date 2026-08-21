import { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import RecordDetailsModal from "@/components/RecordDetailsModal";
import EditRecordModal from "@/components/EditRecordModal";
import { Search, Eye, Trash2, ArrowUpDown, ReceiptText, AlertTriangle, FolderOpen, Ban, Edit } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { useToast } from "@/hooks/use-toast";
import { getRecordsWithoutLastPayment, deleteRecord } from "../../services/recordService";

interface Record {
  id: string;
  date: string;
  aadhaarNumber: string;
  panNumber: string;
  email: string;
  name: string;
  birthPlace: string;
  fatherName: string;
  motherName: string;
  spouseName: string;
  address: string;
  dateOfBirth: string;
  age: string;
  occupation: string;
  educationalQualification: string;
  designationOfPolicyHolder: string;
  annualIncome: string;
  periodOfService: string;
  employerName: string;
  aadhaarLinkedMobileNumber: string;
  nameOfNominee: string;
  ageOfNominee: string;
  relationName: string;
  lastChildBirthDate: string;
  height: string;
  weight: string;
  bankAccountNumber: string;
  ifscCode: string;
  bankName: string;
  branchName: string;
  recordId?: string;

  currentPolicy : {
    policyNumber: string;
    planAndTerm: string;
    sumAssured: string;
    modeOfPayment: string;
    branch: string;
    lastPaymentDate: string;
  }

  previousPolicy : {
    policyNumber: string;
    planAndTerm: string;
    sumAssured: string;
    modeOfPayment: string;
    branch: string;
    lastPaymentDate: string;
  }
  createdAt: string;
}

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

const MissedPayments = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<keyof Record>("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [selectedRecord, setSelectedRecord] = useState<Record | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<Record | null>(null);
  const [records, setRecords] = useState<Record[]>([]);
  const [currentMonth, setCurrentMonth] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const fetchRecords = async () => {
    try {
      setIsLoading(true);
      const recordsWithoutLastPayment = await getRecordsWithoutLastPayment();
      setRecords(recordsWithoutLastPayment.records ?? []);
      setCurrentMonth("" + new Date().toLocaleString('default', { month: 'long' }) + " " + new Date().getFullYear());
    } catch (error) {
      console.error(error);
      setRecords([]);
      setCurrentMonth("");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const filteredAndSortedRecords = useMemo(() => {
    if (!records || records.length === 0) return [];

    const filtered = records.filter(record =>
      record.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.occupation.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.aadhaarLinkedMobileNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.currentPolicy.policyNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.currentPolicy.modeOfPayment.toLowerCase().includes(searchTerm.toLowerCase())
    );

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
  }, [records, searchTerm, sortField, sortDirection]);

  // ── Derived stats ──
  const summaryStats = useMemo(() => {
    const neverPaid = records.filter(r => !r.currentPolicy?.lastPaymentDate).length;
    const branches = new Set(records.map(r => r.currentPolicy?.branch).filter(Boolean)).size;
    const totalSumAssured = records.reduce((sum, r) => sum + (Number(r.currentPolicy?.sumAssured) || 0), 0);
    return { neverPaid, branches, totalSumAssured };
  }, [records]);

  const handleSort = (field: keyof Record) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const handleViewRecord = (record: Record) => {
    setSelectedRecord(record);
    setIsModalOpen(true);
  };

  const handleDeleteRecord = async (recordId: string) => {
    const success = await deleteRecord( recordId);
    if (success) {
      setRecords(await getRecordsWithoutLastPayment());
      toast({
        title: "Success", 
        description: "Record deleted successfully",
      });
    }
  };

  const handleEditRecord = (record: Record) => {
    setEditingRecord(record);
    setIsEditModalOpen(true);
  };

  const handleUpdateRecord = async () => {
    await fetchRecords();
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
          {/* Hero header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
                <ReceiptText className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-form-header">Missed Last Payment</h1>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Records that missed their last payment. Stay on top of your policies and follow up on time.
                </p>
              </div>
            </div>
            <Badge className="bg-primary text-primary-foreground text-sm px-3 py-1.5 rounded-full">
              {currentMonth}
            </Badge>
          </div>

          {/* Stat row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "Total missed", val: records.length, icon: <AlertTriangle className="w-4 h-4" />, sub: "Need follow-up", bg: "bg-red-50", color: "text-red-600" },
              { label: "Never paid", val: summaryStats.neverPaid, icon: <Ban className="w-4 h-4" />, sub: "No payment on record", bg: "bg-rose-50", color: "text-rose-700" },
              { label: "At-risk value", val: `₹${summaryStats.totalSumAssured.toLocaleString("en-IN")}`, icon: <ReceiptText className="w-4 h-4" />, sub: "Sum assured", bg: "bg-amber-50", color: "text-amber-700" },
              { label: "Branches", val: summaryStats.branches, icon: <FolderOpen className="w-4 h-4" />, sub: "Affected branches", bg: "bg-violet-50", color: "text-violet-700" },
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

          {/* Search and Stats */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search by name, policy number, occupation..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 focus-visible:ring-primary/40"
                  />
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
              <CardTitle className="text-form-header text-base">All Unpaid Records</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {filteredAndSortedRecords.length === 0 ? (
                <div className="text-center py-16 px-4">
                  <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                    {isLoading
                      ? <div className="w-5 h-5 border-2 border-primary/40 border-t-primary rounded-full animate-spin" />
                      : <ReceiptText className="w-6 h-6 text-muted-foreground" />}
                  </div>
                  <div className="text-muted-foreground text-base mb-4">
                    {isLoading ? (
                      <span>{t("loadingRecords")}</span>
                    ) : records.length === 0 ? (
                      <span>{t("missedPaymentNoRecordNote")}</span>
                    ) : (
                      <span>No records match your search</span>
                    )}
                  </div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-table-header">
                        <SortableHeader field="name">Name</SortableHeader>
                        <TableHead className="border border-table-border text-xs font-medium uppercase tracking-wide text-muted-foreground">Mobile Number</TableHead>
                        <SortableHeader field="age">Age</SortableHeader>
                        <TableHead className="border border-table-border text-xs font-medium uppercase tracking-wide text-muted-foreground">Policy Number</TableHead>
                        <TableHead className="border border-table-border text-xs font-medium uppercase tracking-wide text-muted-foreground">Mode Of Payment</TableHead>
                        <TableHead className="border border-table-border text-xs font-medium uppercase tracking-wide text-muted-foreground">Branch</TableHead>
                        <TableHead className="border border-table-border text-xs font-medium uppercase tracking-wide text-muted-foreground">Last Payment Date</TableHead>
                        <TableHead className="border border-table-border text-xs font-medium uppercase tracking-wide text-muted-foreground">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredAndSortedRecords.map((record) => (
                        <TableRow key={record.recordId} className="hover:bg-muted/50 transition-colors">
                          <TableCell className="border border-table-border font-medium">
                            <div className="flex items-center gap-2.5">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 ${avatarColor(record.name)}`}>
                                {initials(record.name)}
                              </div>
                              <span>{record.name}</span>
                            </div>
                          </TableCell>
                          <TableCell className="border border-table-border text-muted-foreground">
                            {record.aadhaarLinkedMobileNumber}
                          </TableCell>
                          <TableCell className="border border-table-border">
                            {record.age}
                          </TableCell>
                          <TableCell className="border border-table-border">
                            <Badge variant="outline" className="font-mono text-xs">
                              {record.currentPolicy.policyNumber || "N/A"}
                            </Badge>
                          </TableCell>
                          <TableCell className="border border-table-border text-muted-foreground">
                            {record.currentPolicy.modeOfPayment || "-"}
                          </TableCell>
                          <TableCell className="border border-table-border text-muted-foreground">
                            {record.currentPolicy.branch || "-"}
                          </TableCell>
                          <TableCell className="border border-table-border text-sm">
                            {record.currentPolicy.lastPaymentDate
                              ? <span className="text-muted-foreground">{record.currentPolicy.lastPaymentDate}</span>
                              : <Badge className="bg-red-100 text-red-700 border border-red-200 text-xs">No payments</Badge>}
                          </TableCell>
                          <TableCell className="border border-table-border">
                            <div className="flex items-center space-x-2">
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
                                className="h-8 w-8 p-0"
                                title="Edit Record"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
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

      <RecordDetailsModal
        record={selectedRecord}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

      <EditRecordModal
        record={editingRecord}
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          fetchRecords();
        }}
        onUpdate={handleUpdateRecord}
      />

      <Footer />
    </div>
  );
};

export default MissedPayments;