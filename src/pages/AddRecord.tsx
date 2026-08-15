import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import Navigation from "@/components/Navigation";
import {
  Save, Plus, Trash2, Minus,
  User, Users, HeartPulse, Landmark, ShieldCheck, History, IdCard, ListChecks,
} from "lucide-react";
import { getCurrentUser, isAuthenticated } from "@/utils/auth";
import { useLanguage } from "@/hooks/useLanguage";
import Footer from "@/components/Footer";
import siteConfig from "@/config/siteConfig";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createRecord } from "../../services/recordService.js";
import InsuranceTypeSelector from "@/components/InsuranceTypeSelector";
import TypeSpecificFieldsForm from "@/components/TypeSpecificFieldsForm";
import CustomFieldsBuilder from "@/components/CustomFieldsBuilder";
import {
  isOtherInsuranceType, emptyTypeSpecificData, type CustomFieldValue,
} from "@/config/insuranceTypes";

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

// Small section header used across the form cards — encodes the actual step
// number from the intake sheet, so it's real sequence info, not decoration.
const SectionTitle = ({ icon: Icon, step, children }: { icon: any; step?: string; children: React.ReactNode }) => (
  <CardTitle className="text-form-header flex items-center gap-2.5">
    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
      <Icon className="w-4 h-4 text-primary" />
    </div>
    <span>{children}</span>
    {step && <span className="text-xs font-normal text-muted-foreground ml-1">{step}</span>}
  </CardTitle>
);

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

  // Insurance type selection — drives which type-specific fields (or the
  // custom field builder, for "Other") render below the common form.
  // Defaults to "Life Insurance" since that's what this form has always been.
  const [insuranceType, setInsuranceType] = useState("Life Insurance");
  const [customInsuranceTypeName, setCustomInsuranceTypeName] = useState("");
  const [typeSpecificData, setTypeSpecificData] = useState<Record<string, string>>(
    emptyTypeSpecificData("Life Insurance")
  );
  const [customFields, setCustomFields] = useState<CustomFieldValue[]>([]);

  const handleInsuranceTypeChange = (id: string) => {
    setInsuranceType(id);
    if (isOtherInsuranceType(id)) {
      setTypeSpecificData({});
    } else {
      setTypeSpecificData(emptyTypeSpecificData(id));
      setCustomInsuranceTypeName("");
      setCustomFields([]);
    }
  };

  const handleTypeSpecificChange = (key: string, value: string) => {
    setTypeSpecificData((prev) => ({ ...prev, [key]: value }));
  };

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
    lastChildBirthDate: "",
    height: "",
    weight: "",
    bankAccountNumber: "",
    ifscCode: "",
    bankName: "",
    branchName: "",
  });

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

  const handlePolicyChange = (type: 'current' | 'previous', field: keyof PolicyDetail, value: string) => {
    if (type === 'current') {
      setCurrentPolicy(prev => ({ ...prev, [field]: value }));
    } else {
      setPreviousPolicy(prev => ({ ...prev, [field]: value }));
    }
  };

  const [familyMembers, setFamilyMembers] = useState([
    { relationship: "Father", currentAge: "", health: "", deathAge: "", reason: "" },
  ]);

  const relationOptions = [
    "Spouse", "Son", "Daughter", "Father", "Mother", "Brother", "Sister", "Grandfather", "Grandmother"
  ];

  const addFamilyMember = () => {
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

  const handleSubmit = () => {
    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description: "Please enter the applicant's name",
        variant: "destructive",
      });
      return;
    }

    if (isOtherInsuranceType(insuranceType) && !customInsuranceTypeName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a name for this custom insurance type",
        variant: "destructive",
      });
      return;
    }

    const record = {
      ...formData,
      familyMembers,
      currentPolicy,
      previousPolicy,
      insuranceType,
      customInsuranceTypeName: isOtherInsuranceType(insuranceType) ? customInsuranceTypeName.trim() : null,
      typeSpecificData: isOtherInsuranceType(insuranceType) ? {} : typeSpecificData,
      customFields: isOtherInsuranceType(insuranceType) ? customFields : [],
    };

    const success = createRecord(record).then((success)=> {
      toast({
        title: "Success",
        description: "Record saved successfully",
      });
      navigate("/view-records");
    }).then( (error) => {
      if (error !== null && error !== undefined) {
        toast({
          title: "Error",
          description: "Failed to save record",
          variant: "destructive",
        });
      }
    });
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header */}
          <Card className="bg-gradient-to-r from-form-header to-form-subheader text-white border-0 overflow-hidden">
            <CardHeader className="text-center relative">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 ring-4 ring-white/10">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                  <img src={siteConfig.logo_medium_size} alt="site-logo" />
                </div>
              </div>
              <CardTitle className="text-2xl font-bold">
                {siteConfig.title}
              </CardTitle>
              <p className="text-white/90">{t("addRecord")}</p>
              <p className="text-white/60 text-xs mt-1">Fill in the sections below to create a new policy record</p>
            </CardHeader>
          </Card>

          {/* Insurance Type Selection */}
          <Card>
            <CardHeader>
              <SectionTitle icon={ListChecks} step="Step 1">Select Insurance Type</SectionTitle>
            </CardHeader>
            <CardContent>
              <InsuranceTypeSelector value={insuranceType} onChange={handleInsuranceTypeChange} />
            </CardContent>
          </Card>

          {/* Type-Specific Details — dynamic fields per built-in type, or the
              custom field builder when "Other (Custom)" is selected */}
          {isOtherInsuranceType(insuranceType) ? (
            <Card>
              <CardHeader>
                <SectionTitle icon={ShieldCheck} step="Step 2">Custom Insurance Details</SectionTitle>
              </CardHeader>
              <CardContent>
                <CustomFieldsBuilder
                  customTypeName={customInsuranceTypeName}
                  onCustomTypeNameChange={setCustomInsuranceTypeName}
                  fields={customFields}
                  onFieldsChange={setCustomFields}
                />
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <SectionTitle icon={ShieldCheck} step="Step 2">{insuranceType} Details</SectionTitle>
              </CardHeader>
              <CardContent>
                <TypeSpecificFieldsForm
                  insuranceType={insuranceType}
                  values={typeSpecificData}
                  onChange={handleTypeSpecificChange}
                />
              </CardContent>
            </Card>
          )}

          {/* Basic Information Form */}
          <Card>
            <CardHeader>
              <SectionTitle icon={IdCard}>Basic Details</SectionTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="date">Date</Label>
                  <Input 
                    type="date"
                    value={formData.date}
                    onChange={(e) => handleInputChange("date", e.target.value)}
                    className="mt-1"
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
              <SectionTitle icon={User}>Personal Information</SectionTitle>
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
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <SectionTitle icon={Users}>9. Family Information</SectionTitle>
                <Button type="button" onClick={addFamilyMember} size="sm" variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Member
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto rounded-lg border border-table-border">
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
                      <TableRow key={index} className="hover:bg-muted/40">
                        <TableCell className="border border-table-border font-medium">
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
                          <Select value={member.health} onValueChange={(value) => handleFamilyMemberChange(index, 'health', value)}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select Health" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem key="Good" value="Good">Good</SelectItem>
                                <SelectItem key="Not Good" value="Not Good">Not Good</SelectItem>
                            </SelectContent>
                          </Select>
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
                          <div className="flex items-end">
                            <Button 
                              type="button" 
                              onClick={() => removeFamilyMember(index)} 
                              variant="destructive" 
                              size="sm"
                              disabled={familyMembers.length <= 1}
                              className={familyMembers.length <= 1 ? "opacity-50" : ""}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                            </Button>
                          </div>
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
            <CardHeader>
              <SectionTitle icon={HeartPulse}>Physical & Banking Details</SectionTitle>
            </CardHeader>
            <CardContent className="pt-0">
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
              <SectionTitle icon={ShieldCheck}>11. Current Policy Details</SectionTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto rounded-lg border border-table-border">
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
                        <Select
                          value={currentPolicy.modeOfPayment}
                          onValueChange={(value) => handlePolicyChange("current","modeOfPayment", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select Payment Mode" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Monthly">Monthly or e-NACH</SelectItem>
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
              </div>
            </CardContent>
          </Card>

          {/* Previous Policy Details */}
          <Card>
            <CardHeader>
              <SectionTitle icon={History}>12. Previous Policy Details</SectionTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto rounded-lg border border-table-border">
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
                        <Select
                          value={previousPolicy.modeOfPayment}
                          onValueChange={(value) => handlePolicyChange("previous","modeOfPayment", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select Payment Mode" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Monthly">Monthly or e-NACH</SelectItem>
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
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-center space-x-4 pt-2 pb-8">
            <Button onClick={handleSubmit} className="bg-primary hover:bg-primary-light text-primary-foreground shadow-sm">
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