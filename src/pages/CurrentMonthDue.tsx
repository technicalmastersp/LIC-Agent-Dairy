import { useState, useMemo, useEffect } from "react";
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
import { Search, Eye, Trash2, ArrowUpDown, Plus, Edit } from "lucide-react";
import { getCurrentUser, isAuthenticated } from "@/utils/auth";
import { useLanguage } from "@/hooks/useLanguage";
import { dueThisMonth } from "../../services/recordService";
import { convertDateToIndianFormat } from "@/utils/tools";

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
    nextDueDate: string;
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

const CurrentMonthDue = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const currentUser = getCurrentUser();
  const authenticated = isAuthenticated();
  
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

  // Move this OUT of useEffect, make it a standalone function in the component
  const fetchRecords = async () => {
    try {
      setIsLoading(true);
      const userRecords = await dueThisMonth();
      setRecords(userRecords.records);
      setCurrentMonth(userRecords.month)
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!authenticated || !currentUser) {
      navigate("/login");
      return;
    }
    fetchRecords();
  }, []);

  if (!authenticated || !currentUser) {
    return null;
  }

  const filteredAndSortedRecords = useMemo(() => {
    let filtered = records.filter(record =>
      record.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.fatherName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.occupation.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.currentPolicy.policyNumber.toLowerCase().includes(searchTerm.toLowerCase())
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

  const handleEditRecord = (record: Record) => {
    setEditingRecord(record);
    setIsEditModalOpen(true);
  };

  const handleUpdateRecord = async () => {
    await fetchRecords();
  };

  const SortableHeader = ({ field, children }: { field: keyof Record; children: React.ReactNode }) => (
    <TableHead 
      className="cursor-pointer hover:bg-table-header/50 border border-table-border"
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center space-x-1">
        <span>{children}</span>
        <ArrowUpDown className="w-4 h-4" />
      </div>
    </TableHead>
  );

  return (
    <div className="min-h-screen bg-muted/30 flex flex-col">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8 flex-1">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-form-header">Current Month Due</h1>
              <p className="text-muted-foreground">
                View all policies that have payments due this month and take necessary actions
              </p>
            </div>
            <Button className="bg-primary hover:bg-primary-light cursor-default">
              {currentMonth}
            </Button>
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
                    className="pl-10"
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
          <Card>
            <CardHeader>
              <CardTitle className="text-form-header">All Due Records</CardTitle>
            </CardHeader>
            <CardContent>
              {filteredAndSortedRecords.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-muted-foreground text-lg mb-4">
                    {isLoading ? (
                      <span>{t("loadingRecords")}</span>
                    ) : records.length === 0 ? (
                        <span>{t("duePaymentNoRecordNote")}</span>
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
                        <SortableHeader field="fatherName">Father's Name</SortableHeader>
                        <TableHead className="border border-table-border">Policy Number</TableHead>
                        <TableHead className="border border-table-border">Mode Of Payment</TableHead>
                        <TableHead className="border border-table-border">Branch</TableHead>
                        <TableHead className="border border-table-border">Last Payment Date</TableHead>
                        <TableHead className="border border-table-border">Due Date</TableHead>
                        <TableHead className="border border-table-border">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredAndSortedRecords.map((record) => (
                        <TableRow key={record.recordId} className="hover:bg-muted/50">
                          <TableCell className="border border-table-border font-medium">
                            {record.name}
                          </TableCell>
                          <TableCell className="border border-table-border">
                            {record.fatherName}
                          </TableCell>
                          <TableCell className="border border-table-border">
                            <Badge variant="outline" className="font-mono text-xs">
                              {record.currentPolicy.policyNumber || "N/A"}
                            </Badge>
                          </TableCell>
                          <TableCell className="border border-table-border">
                            {record.currentPolicy.modeOfPayment || "-"}
                          </TableCell>
                          <TableCell className="border border-table-border">
                            {record.currentPolicy.branch || "-"}
                          </TableCell>
                          <TableCell className="border border-table-border text-sm text-muted-foreground">
                            {convertDateToIndianFormat(record.currentPolicy.lastPaymentDate)}
                          </TableCell>
                          <TableCell className="border border-table-border text-sm text-muted-foreground">
                            {convertDateToIndianFormat(record.currentPolicy.nextDueDate) || <span className="italic text-red-400">No due date</span>}
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
                              <Badge variant="destructive" className="ml-2 cursor-pointer" title="Add Payment Details" onClick={() => handleEditRecord(record)}>Pay</Badge>
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
          fetchRecords(); // ← refresh on close too
        }}
        onUpdate={handleUpdateRecord}
      />

      <Footer />
    </div>
  );
};

export default CurrentMonthDue;