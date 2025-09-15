import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { Calendar, User, MapPin, Briefcase, Phone, CreditCard } from "lucide-react";

interface RecordDetailsModalProps {
  record: any;
  isOpen: boolean;
  onClose: () => void;
}

const RecordDetailsModal = ({ record, isOpen, onClose }: RecordDetailsModalProps) => {
  if (!record) return null;

  const InfoItem = ({ icon: Icon, label, value }: { icon: any; label: string; value: string }) => (
    <div className="flex items-start space-x-3 p-3 rounded-lg bg-muted/30">
      <Icon className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <p className="text-sm break-words">{value || "Not provided"}</p>
      </div>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2 text-form-header">
            <User className="w-5 h-5" />
            <span>Record Details - {record.name}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header Card */}
          <Card className="bg-gradient-to-r from-primary/10 to-accent/20">
            <CardHeader>
              <CardTitle className="text-lg text-form-header flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-sm">LIC</span>
                </div>
                <span>Bharatiya Jeevan Bima Nigam</span>
              </CardTitle>
              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                <span>Record ID: {record.id}</span>
                <span>Created: {new Date(record.createdAt).toLocaleDateString()}</span>
              </div>
            </CardHeader>
          </Card>

          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-form-header">Personal Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoItem icon={User} label="Full Name" value={record.name} />
                <InfoItem icon={Calendar} label="Date of Birth" value={record.dateOfBirth} />
                <InfoItem icon={MapPin} label="Birth Place" value={record.birthPlace} />
                <InfoItem icon={User} label="Age" value={record.age} />
                <InfoItem icon={User} label="Father's Name" value={record.fatherName} />
                <InfoItem icon={User} label="Mother's Name" value={record.motherName} />
                <InfoItem icon={User} label="Spouse's Name" value={record.spouseName} />
                <InfoItem icon={Briefcase} label="Occupation" value={record.occupation} />
              </div>
            </CardContent>
          </Card>

          {/* Contact & Address */}
          <Card>
            <CardHeader>
              <CardTitle className="text-form-header">Contact & Address</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoItem icon={MapPin} label="Address" value={record.address} />
                <InfoItem icon={Briefcase} label="Educational Qualification" value={record.educationalQualification} />
                <InfoItem icon={Briefcase} label="Service Details" value={record.serviceDetails} />
                <InfoItem icon={Briefcase} label="Employer Name" value={record.employerName} />
              </div>
            </CardContent>
          </Card>

          {/* Physical Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-form-header">Physical Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <InfoItem icon={User} label="Height" value={record.height} />
                <InfoItem icon={User} label="Weight" value={record.weight} />
                <InfoItem icon={Calendar} label="Children's Birth Date" value={record.childrenBirthDate} />
              </div>
            </CardContent>
          </Card>

          {/* Banking Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-form-header">Banking Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoItem icon={CreditCard} label="Bank Account Number" value={record.bankAccountNumber} />
                <InfoItem icon={CreditCard} label="IFSC Code" value={record.ifscCode} />
                <InfoItem icon={CreditCard} label="Bank Name/Branch" value={record.bankName} />
              </div>
            </CardContent>
          </Card>

          {/* Family Details */}
          {record.familyMembers && record.familyMembers.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-form-header">Family Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-table-header">
                        <TableHead className="border border-table-border">Relationship</TableHead>
                        <TableHead className="border border-table-border">Current Age</TableHead>
                        <TableHead className="border border-table-border">Health Status</TableHead>
                        <TableHead className="border border-table-border">Age at Death</TableHead>
                        <TableHead className="border border-table-border">Reason</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {record.familyMembers.map((member: any, index: number) => (
                        <TableRow key={index}>
                          <TableCell className="border border-table-border font-medium">
                            {member.relationship}
                          </TableCell>
                          <TableCell className="border border-table-border">
                            {member.currentAge || "-"}
                          </TableCell>
                          <TableCell className="border border-table-border">
                            {member.health || "-"}
                          </TableCell>
                          <TableCell className="border border-table-border">
                            {member.deathAge || "-"}
                          </TableCell>
                          <TableCell className="border border-table-border">
                            {member.reason || "-"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Current Policy Details */}
          {record.currentPolicy && (
            <Card>
              <CardHeader>
                <CardTitle className="text-form-header">Current Policy Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-table-header">
                        <TableHead className="border border-table-border">Policy Number</TableHead>
                        <TableHead className="border border-table-border">Issue Date</TableHead>
                        <TableHead className="border border-table-border">Premium</TableHead>
                        <TableHead className="border border-table-border">Installment Date</TableHead>
                        <TableHead className="border border-table-border">Amount</TableHead>
                        <TableHead className="border border-table-border">Last Payment</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell className="border border-table-border">
                          <Badge variant="outline" className="font-mono">
                            {record.currentPolicy.policyNumber || "N/A"}
                          </Badge>
                        </TableCell>
                        <TableCell className="border border-table-border">
                          {record.currentPolicy.issueDate || "-"}
                        </TableCell>
                        <TableCell className="border border-table-border">
                          ₹{record.currentPolicy.premium || "0"}
                        </TableCell>
                        <TableCell className="border border-table-border">
                          {record.currentPolicy.installmentDate || "-"}
                        </TableCell>
                        <TableCell className="border border-table-border">
                          ₹{record.currentPolicy.amount || "0"}
                        </TableCell>
                        <TableCell className="border border-table-border">
                          {record.currentPolicy.lastPaymentDate || "-"}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Previous Policy Details */}
          {record.previousPolicy && (
            <Card>
              <CardHeader>
                <CardTitle className="text-form-header">Previous Policy Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-table-header">
                        <TableHead className="border border-table-border">Policy Number</TableHead>
                        <TableHead className="border border-table-border">Issue Date</TableHead>
                        <TableHead className="border border-table-border">Premium</TableHead>
                        <TableHead className="border border-table-border">Installment Date</TableHead>
                        <TableHead className="border border-table-border">Amount</TableHead>
                        <TableHead className="border border-table-border">Last Payment</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell className="border border-table-border">
                          <Badge variant="outline" className="font-mono">
                            {record.previousPolicy.policyNumber || "N/A"}
                          </Badge>
                        </TableCell>
                        <TableCell className="border border-table-border">
                          {record.previousPolicy.issueDate || "-"}
                        </TableCell>
                        <TableCell className="border border-table-border">
                          ₹{record.previousPolicy.premium || "0"}
                        </TableCell>
                        <TableCell className="border border-table-border">
                          {record.previousPolicy.installmentDate || "-"}
                        </TableCell>
                        <TableCell className="border border-table-border">
                          ₹{record.previousPolicy.amount || "0"}
                        </TableCell>
                        <TableCell className="border border-table-border">
                          {record.previousPolicy.lastPaymentDate || "-"}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RecordDetailsModal;