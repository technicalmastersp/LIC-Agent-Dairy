import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import Navigation from "@/components/Navigation";
import { Save, Plus, Trash2 } from "lucide-react";
import { getCurrentUser, isAuthenticated, saveUserRecord } from "@/utils/auth";
import { useLanguage } from "@/hooks/useLanguage";
import Footer from "@/components/Footer";

interface FamilyMember {
  relationship: string;
  currentAge: string;
  health: string;
  deathAge: string;
  reason: string;
}

interface PolicyDetail {
  policyNumber: string;
  issueDate: string;
  premium: string;
  installmentDate: string;
  amount: string;
  lastPaymentDate: string;
}

const AddRecord = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useLanguage();
  const currentUser = getCurrentUser();
  const authenticated = isAuthenticated();

  useEffect(() => {
    if (!authenticated || !currentUser) {
      navigate("/login");
    }
  }, [authenticated, currentUser, navigate]);

  if (!authenticated || !currentUser) {
    return null;
  }

  // Basic Information
  const [formData, setFormData] = useState({
    name: "",
    birthPlace: "",
    fatherName: "",
    motherName: "",
    spouseName: "",
    address: "",
    dateOfBirth: "",
    age: "",
    occupation: "",
    educationalQualification: "",
    serviceDetails: "",
    employerName: "",
    employerAge: "",
    relationship: "",
    childrenBirthDate: "",
    height: "",
    weight: "",
    bankAccountNumber: "",
    ifscCode: "",
    bankName: "",
  });

  // Family Details Table
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([
    { relationship: "Father", currentAge: "", health: "", deathAge: "", reason: "" },
    { relationship: "Mother", currentAge: "", health: "", deathAge: "", reason: "" },
    { relationship: "Brother", currentAge: "", health: "", deathAge: "", reason: "" },
    { relationship: "Sister", currentAge: "", health: "", deathAge: "", reason: "" },
    { relationship: "Children", currentAge: "", health: "", deathAge: "", reason: "" },
  ]);

  // Policy Details Tables
  const [currentPolicy, setCurrentPolicy] = useState<PolicyDetail>({
    policyNumber: "",
    issueDate: "",
    premium: "",
    installmentDate: "",
    amount: "",
    lastPaymentDate: "",
  });

  const [previousPolicy, setPreviousPolicy] = useState<PolicyDetail>({
    policyNumber: "",
    issueDate: "",
    premium: "",
    installmentDate: "",
    amount: "",
    lastPaymentDate: "",
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFamilyMemberChange = (index: number, field: keyof FamilyMember, value: string) => {
    setFamilyMembers(prev => 
      prev.map((member, i) => 
        i === index ? { ...member, [field]: value } : member
      )
    );
  };

  const handlePolicyChange = (type: 'current' | 'previous', field: keyof PolicyDetail, value: string) => {
    if (type === 'current') {
      setCurrentPolicy(prev => ({ ...prev, [field]: value }));
    } else {
      setPreviousPolicy(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleSubmit = () => {
    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description: "Please enter the applicant's name",
        variant: "destructive",
      });
      return;
    }

    const record = {
      ...formData,
      familyMembers,
      currentPolicy,
      previousPolicy,
    };

    const success = saveUserRecord(currentUser.id, record);

    if (success) {
      toast({
        title: "Success",
        description: "Record saved successfully",
      });
      navigate("/view-records");
    } else {
      toast({
        title: "Error",
        description: "Failed to save record",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header */}
          <Card className="bg-gradient-to-r from-form-header to-form-subheader text-white">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                  <span className="text-form-header font-bold">LIC</span>
                </div>
              </div>
              <CardTitle className="text-2xl font-bold">
                Bharatiya Jeevan Bima Nigam
              </CardTitle>
              <p className="text-white/90">Development Officer</p>
              <p className="text-white/80 text-sm">Mobile: 9123456789</p>
            </CardHeader>
          </Card>

          {/* Basic Information Form */}
          <Card>
            <CardHeader>
              <CardTitle className="text-form-header">Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Column 1 */}
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="date">Date</Label>
                    <Input 
                      id="date" 
                      type="date"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="name">1. Name</Label>
                    <Input 
                      id="name" 
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="fatherName">2. Father's Name</Label>
                    <Input 
                      id="fatherName" 
                      value={formData.fatherName}
                      onChange={(e) => handleInputChange("fatherName", e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="motherName">3. Mother's Name</Label>
                    <Input 
                      id="motherName" 
                      value={formData.motherName}
                      onChange={(e) => handleInputChange("motherName", e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="spouseName">4. Spouse's Name</Label>
                    <Input 
                      id="spouseName" 
                      value={formData.spouseName}
                      onChange={(e) => handleInputChange("spouseName", e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </div>

                {/* Column 2 */}
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="baseNumber">Base No.</Label>
                    <Input id="baseNumber" className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="email">Email ID</Label>
                    <Input id="email" type="email" className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="birthPlace">Birth Place</Label>
                    <Input 
                      id="birthPlace" 
                      value={formData.birthPlace}
                      onChange={(e) => handleInputChange("birthPlace", e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="dateOfBirth">6. Date of Birth</Label>
                    <Input 
                      id="dateOfBirth" 
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="age">Age</Label>
                    <Input 
                      id="age" 
                      value={formData.age}
                      onChange={(e) => handleInputChange("age", e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </div>

                {/* Column 3 */}
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="address">5. Address</Label>
                    <Input 
                      id="address" 
                      value={formData.address}
                      onChange={(e) => handleInputChange("address", e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="occupation">7. Occupation</Label>
                    <Input 
                      id="occupation" 
                      value={formData.occupation}
                      onChange={(e) => handleInputChange("occupation", e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="education">Educational Qualification</Label>
                    <Input 
                      id="education" 
                      value={formData.educationalQualification}
                      onChange={(e) => handleInputChange("educationalQualification", e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="service">Service Details</Label>
                    <Input 
                      id="service" 
                      value={formData.serviceDetails}
                      onChange={(e) => handleInputChange("serviceDetails", e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="employer">8. Employer's Name</Label>
                    <Input 
                      id="employer" 
                      value={formData.employerName}
                      onChange={(e) => handleInputChange("employerName", e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Family Details Table */}
          <Card>
            <CardHeader>
              <CardTitle className="text-form-header">9. Family Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-table-header">
                      <TableHead className="border border-table-border font-semibold">Relationship</TableHead>
                      <TableHead className="border border-table-border font-semibold">Current Age</TableHead>
                      <TableHead className="border border-table-border font-semibold">Health</TableHead>
                      <TableHead className="border border-table-border font-semibold">Age at Death/Cause</TableHead>
                      <TableHead className="border border-table-border font-semibold">Reason</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {familyMembers.map((member, index) => (
                      <TableRow key={index}>
                        <TableCell className="border border-table-border font-medium">
                          {member.relationship}
                        </TableCell>
                        <TableCell className="border border-table-border">
                          <Input 
                            value={member.currentAge}
                            onChange={(e) => handleFamilyMemberChange(index, "currentAge", e.target.value)}
                            className="w-full border-0 bg-transparent"
                          />
                        </TableCell>
                        <TableCell className="border border-table-border">
                          <Input 
                            value={member.health}
                            onChange={(e) => handleFamilyMemberChange(index, "health", e.target.value)}
                            className="w-full border-0 bg-transparent"
                          />
                        </TableCell>
                        <TableCell className="border border-table-border">
                          <Input 
                            value={member.deathAge}
                            onChange={(e) => handleFamilyMemberChange(index, "deathAge", e.target.value)}
                            className="w-full border-0 bg-transparent"
                          />
                        </TableCell>
                        <TableCell className="border border-table-border">
                          <Input 
                            value={member.reason}
                            onChange={(e) => handleFamilyMemberChange(index, "reason", e.target.value)}
                            className="w-full border-0 bg-transparent"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Additional Fields */}
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="height">Height</Label>
                    <Input 
                      id="height" 
                      value={formData.height}
                      onChange={(e) => handleInputChange("height", e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="weight">Weight</Label>
                    <Input 
                      id="weight" 
                      value={formData.weight}
                      onChange={(e) => handleInputChange("weight", e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="bankAccount">10. Bank Account Number</Label>
                    <Input 
                      id="bankAccount" 
                      value={formData.bankAccountNumber}
                      onChange={(e) => handleInputChange("bankAccountNumber", e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="childrenDate">9. Children's Birth Date</Label>
                    <Input 
                      id="childrenDate" 
                      type="date"
                      value={formData.childrenBirthDate}
                      onChange={(e) => handleInputChange("childrenBirthDate", e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="ifsc">IFSC Code</Label>
                    <Input 
                      id="ifsc" 
                      value={formData.ifscCode}
                      onChange={(e) => handleInputChange("ifscCode", e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="bankName">Bank Name/Branch</Label>
                    <Input 
                      id="bankName" 
                      value={formData.bankName}
                      onChange={(e) => handleInputChange("bankName", e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Current Policy Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-form-header">11. Current Policy Details</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="bg-table-header">
                    <TableHead className="border border-table-border">Policy Number</TableHead>
                    <TableHead className="border border-table-border">Issue Date</TableHead>
                    <TableHead className="border border-table-border">Premium</TableHead>
                    <TableHead className="border border-table-border">Installment Date</TableHead>
                    <TableHead className="border border-table-border">Amount</TableHead>
                    <TableHead className="border border-table-border">Last Payment Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="border border-table-border">
                      <Input 
                        value={currentPolicy.policyNumber}
                        onChange={(e) => handlePolicyChange("current", "policyNumber", e.target.value)}
                        className="border-0 bg-transparent"
                      />
                    </TableCell>
                    <TableCell className="border border-table-border">
                      <Input 
                        type="date"
                        value={currentPolicy.issueDate}
                        onChange={(e) => handlePolicyChange("current", "issueDate", e.target.value)}
                        className="border-0 bg-transparent"
                      />
                    </TableCell>
                    <TableCell className="border border-table-border">
                      <Input 
                        value={currentPolicy.premium}
                        onChange={(e) => handlePolicyChange("current", "premium", e.target.value)}
                        className="border-0 bg-transparent"
                      />
                    </TableCell>
                    <TableCell className="border border-table-border">
                      <Input 
                        type="date"
                        value={currentPolicy.installmentDate}
                        onChange={(e) => handlePolicyChange("current", "installmentDate", e.target.value)}
                        className="border-0 bg-transparent"
                      />
                    </TableCell>
                    <TableCell className="border border-table-border">
                      <Input 
                        value={currentPolicy.amount}
                        onChange={(e) => handlePolicyChange("current", "amount", e.target.value)}
                        className="border-0 bg-transparent"
                      />
                    </TableCell>
                    <TableCell className="border border-table-border">
                      <Input 
                        type="date"
                        value={currentPolicy.lastPaymentDate}
                        onChange={(e) => handlePolicyChange("current", "lastPaymentDate", e.target.value)}
                        className="border-0 bg-transparent"
                      />
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Previous Policy Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-form-header">12. Previous Policy Details</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="bg-table-header">
                    <TableHead className="border border-table-border">Policy Number</TableHead>
                    <TableHead className="border border-table-border">Issue Date</TableHead>
                    <TableHead className="border border-table-border">Premium</TableHead>
                    <TableHead className="border border-table-border">Installment Date</TableHead>
                    <TableHead className="border border-table-border">Amount</TableHead>
                    <TableHead className="border border-table-border">Last Payment Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="border border-table-border">
                      <Input 
                        value={previousPolicy.policyNumber}
                        onChange={(e) => handlePolicyChange("previous", "policyNumber", e.target.value)}
                        className="border-0 bg-transparent"
                      />
                    </TableCell>
                    <TableCell className="border border-table-border">
                      <Input 
                        type="date"
                        value={previousPolicy.issueDate}
                        onChange={(e) => handlePolicyChange("previous", "issueDate", e.target.value)}
                        className="border-0 bg-transparent"
                      />
                    </TableCell>
                    <TableCell className="border border-table-border">
                      <Input 
                        value={previousPolicy.premium}
                        onChange={(e) => handlePolicyChange("previous", "premium", e.target.value)}
                        className="border-0 bg-transparent"
                      />
                    </TableCell>
                    <TableCell className="border border-table-border">
                      <Input 
                        type="date"
                        value={previousPolicy.installmentDate}
                        onChange={(e) => handlePolicyChange("previous", "installmentDate", e.target.value)}
                        className="border-0 bg-transparent"
                      />
                    </TableCell>
                    <TableCell className="border border-table-border">
                      <Input 
                        value={previousPolicy.amount}
                        onChange={(e) => handlePolicyChange("previous", "amount", e.target.value)}
                        className="border-0 bg-transparent"
                      />
                    </TableCell>
                    <TableCell className="border border-table-border">
                      <Input 
                        type="date"
                        value={previousPolicy.lastPaymentDate}
                        onChange={(e) => handlePolicyChange("previous", "lastPaymentDate", e.target.value)}
                        className="border-0 bg-transparent"
                      />
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-center space-x-4 pt-6">
            <Button onClick={handleSubmit} className="bg-primary hover:bg-primary-light text-primary-foreground">
              <Save className="w-4 h-4 mr-2" />
              Save Record
            </Button>
            <Button 
              variant="outline" 
              onClick={() => navigate("/")}
              className="border-primary text-primary hover:bg-primary/5"
            >
              Cancel
            </Button>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default AddRecord;