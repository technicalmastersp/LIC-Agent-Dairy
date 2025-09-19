import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import Navigation from "@/components/Navigation";
import { Save, Plus, Trash2, Minus  } from "lucide-react";
import { getCurrentUser, isAuthenticated, saveUserRecord } from "@/utils/auth";
import { useLanguage } from "@/hooks/useLanguage";
import Footer from "@/components/Footer";
import siteConfig from "@/config/siteConfig";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface FamilyMember {
  relationship: string;
  currentAge: string;
  health: string;
  deathAge: string;
  reason: string;
}

interface PolicyDetail {
  policyNumber: string;
  planAndTerm: string;
  sumAssured: string;
  modeOfPayment: string;
  branch: string;
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
    date: new Date().toISOString(),
    aadhaarNumber: "",
    panNumber: "",
    email: "",

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
    designationOfPolicyHolder: "",
    annualIncome: "",
    periodOfService: "",
    employerName: "",
    aadhaarLinkedMobileNumber: "",
    nameOfNominee: "",
    ageOfNominee: "",
    relationName: "",
    // relationship: "",
    lastChildBirthDate: "",
    height: "",
    weight: "",
    bankAccountNumber: "",
    ifscCode: "",
    bankName: "",
    branchName: "",
  });

  // Family Details Table
  // const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([
  //   { relationship: "Father", currentAge: "", health: "", deathAge: "", reason: "" },
  //   { relationship: "Mother", currentAge: "", health: "", deathAge: "", reason: "" },
  //   { relationship: "Brother", currentAge: "", health: "", deathAge: "", reason: "" },
  //   { relationship: "Sister", currentAge: "", health: "", deathAge: "", reason: "" },
  //   { relationship: "Children", currentAge: "", health: "", deathAge: "", reason: "" },
  // ]);

  // Policy Details Tables
  const [currentPolicy, setCurrentPolicy] = useState<PolicyDetail>({
    policyNumber: "",
    planAndTerm: "",
    sumAssured: "",
    modeOfPayment: "",
    branch: "",
    lastPaymentDate: "",
  });

  const [previousPolicy, setPreviousPolicy] = useState<PolicyDetail>({
    policyNumber: "",
    planAndTerm: "",
    sumAssured: "",
    modeOfPayment: "",
    branch: "",
    lastPaymentDate: "",
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  /* const handleFamilyMemberChange = (index: number, field: keyof FamilyMember, value: string) => {
    setFamilyMembers(prev => 
      prev.map((member, i) => 
        i === index ? { ...member, [field]: value } : member
      )
    );
  }; */

  const handlePolicyChange = (type: 'current' | 'previous', field: keyof PolicyDetail, value: string) => {
    if (type === 'current') {
      setCurrentPolicy(prev => ({ ...prev, [field]: value }));
    } else {
      setPreviousPolicy(prev => ({ ...prev, [field]: value }));
    }
  };


  // -----------------------------------------------------------------------------------------------------------------------------------------------

  const [familyMembers, setFamilyMembers] = useState([
    // { name: "", relation: "spouse" }
    { relationship: "Father", currentAge: "", health: "", deathAge: "", reason: "" },
  ]);

  const relationOptions = [
    // "spouse", "son", "daughter", "father", "mother", "brother", "sister", "grandfather", "grandmother", "uncle", "aunt", "cousin", "nephew", "niece", "son-in-law", "daughter-in-law", "father-in-law", "mother-in-law", "brother-in-law", "sister-in-law"
    "Spouse", "Son", "Daughter", "Father", "Bother", "Brother", "Sister", "Grandfather", "Grandmother"
  ];

  const addFamilyMember = () => {
    // setFamilyMembers([...familyMembers, { name: "", relation: "spouse" }]);
    setFamilyMembers([...familyMembers, { relationship: "father", currentAge: "", health: "", deathAge: "", reason: "" }]);
  };

  const removeFamilyMember = (index: number) => {
    if (familyMembers.length > 1) {
      setFamilyMembers(familyMembers.filter((_, i) => i !== index));
    }
  };

  const handleFamilyMemberChange = (index: number, field: string, value: string) => {
    const updatedMembers = [...familyMembers];
    updatedMembers[index] = { ...updatedMembers[index], [field]: value };
    setFamilyMembers(updatedMembers);
  };

  /* const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  }; */

  // -----------------------------------------------------------------------------------------------------------------------------------------------



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
                  {/* <span className="text-form-header font-bold">LIC</span> */}
                  <img src={siteConfig.logo_medium_size} alt="site-logo" />
                </div>
              </div>
              <CardTitle className="text-2xl font-bold">
                {siteConfig.title}
              </CardTitle>
              <p className="text-white/90">{t("addRecord")}</p>
              {/* <p className="text-white/80 text-sm">Mobile: 9123456789</p> */}
            </CardHeader>
          </Card>

          {/* Basic Information Form */}
          <Card>
            <CardHeader>
              <CardTitle className="text-form-header">Basic Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="date">Date</Label>
                  <Input 
                    type="date"
                    value={formData.date}
                    onChange={(e) => handleInputChange("date", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="aadhaarNumber">Aadhaar Number</Label>
                  <Input 
                    id="aadhaarNumber" 
                    value={formData.aadhaarNumber}
                    onChange={(e) => handleInputChange("aadhaarNumber", e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="panNumber">Pan Number</Label>
                  <Input 
                    id="panNumber" 
                    value={formData.panNumber}
                    onChange={(e) => handleInputChange("panNumber", e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email ID</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Personal Information Form */}
          <Card>
            <CardHeader>
              <CardTitle className="text-form-header">Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                  <Label htmlFor="birthPlace">1a. Birth Place</Label>
                  <Input 
                    id="birthPlace" 
                    value={formData.birthPlace}
                    onChange={(e) => handleInputChange("birthPlace", e.target.value)}
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
                <div>
                  <Label htmlFor="address">5. Address</Label>
                  <Input 
                    id="address" 
                    value={formData.address}
                    onChange={(e) => handleInputChange("address", e.target.value)}
                    className="mt-1"
                  />
                </div>
                {/* <div>
                  <Label htmlFor="baseNumber">Base No.</Label>
                  <Input id="baseNumber" className="mt-1" />
                </div> */}
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
                  <Label htmlFor="age">6a. Age</Label>
                  <Input 
                    id="age" 
                    value={formData.age}
                    onChange={(e) => handleInputChange("age", e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="education">7. Educational Qualification</Label>
                  <Input 
                    id="education" 
                    value={formData.educationalQualification}
                    onChange={(e) => handleInputChange("educationalQualification", e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="occupation">7a. Occupation</Label>
                  <Input 
                    id="occupation" 
                    value={formData.occupation || ""}
                    onChange={(e) => handleInputChange("occupation", e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="DesignationName">7b. Designation</Label>
                  <Input 
                    id="DesignationName" 
                    value={formData.designationOfPolicyHolder}
                    onChange={(e) => handleInputChange("designationOfPolicyHolder", e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="income">7c. Annual Income</Label>
                  <Input 
                    id="income" 
                    value={formData.annualIncome || ""}
                    onChange={(e) => handleInputChange("annualIncome", e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="servicePeriod">7d. Period Of Service</Label>
                  <Input 
                    id="servicePeriod" 
                    value={formData.periodOfService}
                    onChange={(e) => handleInputChange("periodOfService", e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="employer">7e. Employer's Name</Label>
                  <Input 
                    id="employer" 
                    value={formData.employerName}
                    onChange={(e) => handleInputChange("employerName", e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="mobileNumberLinkedAadhaar">7f. Aadhaar Linked Mobile Number </Label>
                  <Input 
                    id="mobileNumberLinkedAadhaar" 
                    value={formData.aadhaarLinkedMobileNumber || ""}
                    onChange={(e) => handleInputChange("aadhaarLinkedMobileNumber", e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="nominee">8. Name of Nominee</Label>
                  <Input 
                    id="nominee" 
                    value={formData.nameOfNominee}
                    onChange={(e) => handleInputChange("nameOfNominee", e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="nomineeAge">8a. Age of Nominee</Label>
                  <Input 
                    id="nomineeAge" 
                    value={formData.ageOfNominee}
                    onChange={(e) => handleInputChange("ageOfNominee", e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="relation">8b. Relation</Label>
                  <Input 
                    id="relation" 
                    value={formData.relationName}
                    onChange={(e) => handleInputChange("relationName", e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Family Details Table */}
          {<Card>
            <CardHeader>
              {/* <CardTitle className="text-form-header">9. Family Details</CardTitle> */}
              <CardTitle className="text-form-header flex items-center justify-between">
                  9. Family Information
                  <Button type="button" onClick={addFamilyMember} size="sm" variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Member
                  </Button>
                </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-table-header">
                      <TableHead className="border border-table-border font-semibold">Relationship</TableHead>
                      <TableHead className="border border-table-border font-semibold">Current Age</TableHead>
                      <TableHead className="border border-table-border font-semibold">Health</TableHead>
                      <TableHead className="border border-table-border font-semibold">Age at Death/Year</TableHead>
                      <TableHead className="border border-table-border font-semibold">Reason</TableHead>
                      <TableHead className="border border-table-border font-semibold">Delete</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {familyMembers.map((member, index) => (
                      <TableRow key={index}>
                        <TableCell className="border border-table-border font-medium">
                          {/* {member.relationship} */}
                          <Select value={member.relationship || ""} onValueChange={(value) => handleFamilyMemberChange(index, 'relationship', value)}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select relationship" />
                            </SelectTrigger>
                            <SelectContent>
                              {relationOptions.map((relationship) => (
                                <SelectItem key={relationship} value={relationship || ""}>
                                  {relationship.charAt(0).toUpperCase() + relationship.slice(1)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell className="border border-table-border">
                          <Input 
                            value={member.currentAge}
                            onChange={(e) => handleFamilyMemberChange(index, "currentAge", e.target.value)}
                            className="w-full border-0 bg-transparent"
                          />
                        </TableCell>
                        <TableCell className="border border-table-border">
                          {/* <Input 
                            value={member.health}
                            onChange={(e) => handleFamilyMemberChange(index, "health", e.target.value)}
                            className="w-full border-0 bg-transparent"
                          /> */}
                          {<Select value={member.health} onValueChange={(value) => handleFamilyMemberChange(index, 'health', value)}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select Health" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem key="Good" value="Good">Good</SelectItem>
                                <SelectItem key="Not Good" value="Not Good">Not Good</SelectItem>
                            </SelectContent>
                          </Select>}
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
                        <TableCell className="border border-table-border">
                          {familyMembers.length > 1 && (
                            <div className="flex items-end">
                              <Button 
                                type="button" 
                                onClick={() => removeFamilyMember(index)} 
                                variant="destructive" 
                                size="sm"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                              </Button>
                            </div>
                          )}
                          {familyMembers.length <= 1 && (
                            <div className="flex items-end">
                              <Button 
                                type="button" 
                                onClick={() => removeFamilyMember(index)} 
                                variant="destructive" 
                                size="sm"
                                disabled={true}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                              </Button>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>}

          {/* Family Information */}
          {/* <Card>
            <CardHeader>
              <CardTitle className="text-form-header flex items-center justify-between">
                Family Information
                <Button type="button" onClick={addFamilyMember} size="sm" variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Member
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {familyMembers.map((member, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-lg relative">
                  <div className="space-y-2">
                    <Label htmlFor={`familyName${index}`}>Name</Label>
                    <Input 
                      id={`familyName${index}`} 
                      value={member.name} 
                      onChange={(e) => handleFamilyMemberChange(index, 'name', e.target.value)}
                      placeholder="Enter family member name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`relation${index}`}>Relation</Label>
                    <Select value={member.relation} onValueChange={(value) => handleFamilyMemberChange(index, 'relation', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select relation" />
                      </SelectTrigger>
                      <SelectContent>
                        {relationOptions.map((relation) => (
                          <SelectItem key={relation} value={relation}>
                            {relation.charAt(0).toUpperCase() + relation.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {familyMembers.length > 1 && (
                    <div className="flex items-end">
                      <Button 
                        type="button" 
                        onClick={() => removeFamilyMember(index)} 
                        variant="destructive" 
                        size="sm"
                      >
                        <Minus className="h-4 w-4 mr-2" />
                        Remove
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card> */}

          {/* Additional Fields */}
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <Label htmlFor="height">10. Height</Label>
                  <Input 
                    id="height" 
                    value={formData.height}
                    onChange={(e) => handleInputChange("height", e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="weight">10a. Weight</Label>
                  <Input 
                    id="weight" 
                    value={formData.weight}
                    onChange={(e) => handleInputChange("weight", e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="childrenDate">11. Children's Birth Date &#40;Only for Women&#41;</Label>
                  <Input 
                    id="childrenDate" 
                    type="date"
                    value={formData.lastChildBirthDate}
                    onChange={(e) => handleInputChange("lastChildBirthDate", e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="bankAccount">12. Bank Account Number</Label>
                  <Input 
                    id="bankAccount" 
                    value={formData.bankAccountNumber}
                    onChange={(e) => handleInputChange("bankAccountNumber", e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="ifsc">12a. IFSC Code</Label>
                  <Input 
                    id="ifsc" 
                    value={formData.ifscCode}
                    onChange={(e) => handleInputChange("ifscCode", e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="bankName">12b. Bank Name</Label>
                  <Input 
                    id="bankName" 
                    value={formData.bankName}
                    onChange={(e) => handleInputChange("bankName", e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="branchName">12c. Branch Name</Label>
                  <Input 
                    id="branchName" 
                    value={formData.branchName}
                    onChange={(e) => handleInputChange("branchName", e.target.value)}
                    className="mt-1"
                  />
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
                    <TableHead className="border border-table-border">Plan & Term</TableHead>
                    <TableHead className="border border-table-border">Sum Assured</TableHead>
                    <TableHead className="border border-table-border">Mode of Payment</TableHead>
                    <TableHead className="border border-table-border">Branch</TableHead>
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
                        value={currentPolicy.planAndTerm}
                        onChange={(e) => handlePolicyChange("current", "planAndTerm", e.target.value)}
                        className="border-0 bg-transparent"
                      />
                    </TableCell>
                    <TableCell className="border border-table-border">
                      <Input 
                        value={currentPolicy.sumAssured}
                        onChange={(e) => handlePolicyChange("current", "sumAssured", e.target.value)}
                        className="border-0 bg-transparent"
                      />
                    </TableCell>
                    <TableCell className="border border-table-border">
                      {/* <Input 
                        value={currentPolicy.modeOfPayment}
                        onChange={(e) => handlePolicyChange("current", "modeOfPayment", e.target.value)}
                        className="border-0 bg-transparent"
                      /> */}
                      <Select
                        value={currentPolicy.modeOfPayment}
                        onValueChange={(value) => handlePolicyChange("current","modeOfPayment", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select Payment Mode" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Monthly or e-NACH">Monthly or e-NACH</SelectItem>
                          <SelectItem value="Quarterly">Quarterly</SelectItem>
                          <SelectItem value="Half-Yearly">Half-Yearly</SelectItem>
                          <SelectItem value="Yearly">Yearly</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="border border-table-border">
                      <Input 
                        value={currentPolicy.branch}
                        onChange={(e) => handlePolicyChange("current", "branch", e.target.value)}
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
                    <TableHead className="border border-table-border">Plan & Term</TableHead>
                    <TableHead className="border border-table-border">Sum Assured</TableHead>
                    <TableHead className="border border-table-border">Mode of Payment</TableHead>
                    <TableHead className="border border-table-border">Branch</TableHead>
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
                        value={previousPolicy.planAndTerm}
                        onChange={(e) => handlePolicyChange("previous", "planAndTerm", e.target.value)}
                        className="border-0 bg-transparent"
                      />
                    </TableCell>
                    <TableCell className="border border-table-border">
                      <Input 
                        value={previousPolicy.sumAssured}
                        onChange={(e) => handlePolicyChange("previous", "sumAssured", e.target.value)}
                        className="border-0 bg-transparent"
                      />
                    </TableCell>
                    <TableCell className="border border-table-border">
                      {/* <Input 
                        value={previousPolicy.modeOfPayment}
                        onChange={(e) => handlePolicyChange("previous", "modeOfPayment", e.target.value)}
                        className="border-0 bg-transparent"
                      /> */}
                      <Select
                        value={previousPolicy.modeOfPayment}
                        onValueChange={(value) => handlePolicyChange("previous","modeOfPayment", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select Payment Mode" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Monthly or e-NACH">Monthly or e-NACH</SelectItem>
                          <SelectItem value="Quarterly">Quarterly</SelectItem>
                          <SelectItem value="Half-Yearly">Half-Yearly</SelectItem>
                          <SelectItem value="Yearly">Yearly</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="border border-table-border">
                      <Input 
                        value={previousPolicy.branch}
                        onChange={(e) => handlePolicyChange("previous", "branch", e.target.value)}
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