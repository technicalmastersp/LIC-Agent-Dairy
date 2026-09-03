import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import Navigation from "@/components/Navigation";
import {
  Save, Plus, Trash2, User, Users, 
  HeartPulse, ShieldCheck, History, IdCard, ListChecks,
  LucideIcon,
} from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import Footer from "@/components/Footer";
import siteConfig from "@/config/siteConfig";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createRecord } from "../../services/recordService.js";
import InsuranceTypeSelector from "@/components/InsuranceTypeSelector";
import TypeSpecificFieldsForm from "@/components/TypeSpecificFieldsForm";
import CustomFieldsBuilder from "@/components/CustomFieldsBuilder";
import { isOtherInsuranceType, emptyTypeSpecificData } from "@/config/insuranceTypes";
import type { CustomFieldValue } from "@/types/config/insuranceTypes.types";
import { policyRecordSchema } from "@/schemas/policyRecordSchema";
import type { PolicyRecordFormValues } from "@/types/schemas/policyRecordSchema.types";
import type { PolicyDetail } from "@/types/pages/AddRecord.types";
// Small section header used across the form cards — a plain sequential
// step number (Step 1 – Step 8) through the whole form, not tied to any
// external document.
const SectionTitle = ({ icon: Icon, step, children }: { icon: LucideIcon; step?: string; children: React.ReactNode }) => (
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

  // Insurance type selection — drives which type-specific fields (or the
  // custom field builder, for "Other") render below the common form.
  // Defaults to "Life Insurance" since that's what this form has always been.
  const [insuranceType, setInsuranceType] = useState("Life Insurance");
  // Guards the submit button against double-click / rapid re-submits
  // firing multiple createRecord calls for the same form.
  const [isSubmitting, setIsSubmitting] = useState(false);
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
  const {
    register,
    handleSubmit: rhfHandleSubmit,
    formState: { errors },
  } = useForm<PolicyRecordFormValues>({
    resolver: zodResolver(policyRecordSchema),
    defaultValues: {
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
    },
  });

  // Policy Details Tables — no validation rules exist for these today, so
  // they stay plain useState rather than joining the zod-validated form.
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

  // The Name field still needs a plain DOM ref for scrollIntoView on a
  // failed submit — react-hook-form's own ref is merged onto the same
  // element (see the Name <Input> below) so both work together.
  // `HTMLInputElement | null` (not just `HTMLInputElement`) is required
  // here so TS picks React's MutableRefObject overload — otherwise
  // .current is read-only and the manual assignment in the merged ref
  // callback below fails under strictNullChecks.
  const nameInputRef = useRef<HTMLInputElement | null>(null);
  const { ref: nameFieldRef, ...nameField } = register("name");

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

  // Fires when zod validation fails. Name is the only field that ever
  // blocked submission before, so it's the only one that gets the
  // toast + scroll-into-view + focus treatment, matching the exact
  // pre-migration UX.
  const onInvalid = () => {
    if (errors.name) {
      toast({
        title: "Error",
        description: "Please enter the applicant's name",
        variant: "destructive",
      });
      nameInputRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      nameInputRef.current?.focus();
    }
  };

  const onValid = async (formData: PolicyRecordFormValues) => {
    if (isSubmitting) return; // already saving — ignore extra clicks

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

    setIsSubmitting(true);
    try {
      await createRecord(record);
      toast({
        title: "Success",
        description: "Record saved successfully",
      });
      navigate("/view-records");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save record",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header */}
          <Card className="bg-gradient-to-r from-form-header to-form-subheader text-primary-foreground border-0 overflow-hidden">
            <CardHeader className="text-center relative">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 ring-4 ring-white/10">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                  <img src={siteConfig.logo_icon} alt="site-logo" />
                </div>
              </div>
              <CardTitle className="text-2xl font-bold">
                {siteConfig.title}
              </CardTitle>
              <p className="text-primary-foreground/90">{t("addRecord")}</p>
              <p className="text-primary-foreground/60 text-xs mt-1">Fill in the sections below to create a new policy record</p>
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
              <SectionTitle icon={IdCard} step="Step 3">Basic Details</SectionTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="date">Date</Label>
                  <Input 
                    id="date"
                    type="date"
                    {...register("date")}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="aadhaarNumber">Aadhaar Number</Label>
                  <Input 
                    id="aadhaarNumber" 
                    placeholder="12-digit Aadhaar number"
                    {...register("aadhaarNumber")}
                    className="mt-1"
                    maxLength={12}
                  />
                  {errors.aadhaarNumber && (
                    <p className="text-xs text-destructive mt-1">{errors.aadhaarNumber.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="panNumber">Pan Number</Label>
                  <Input 
                    id="panNumber" 
                    placeholder="e.g. ABCDE1234F"
                    {...register("panNumber")}
                    className="mt-1 uppercase"
                    maxLength={10}
                  />
                  {errors.panNumber && (
                    <p className="text-xs text-destructive mt-1">{errors.panNumber.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="email">Email ID</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    {...register("email")}
                    className="mt-1"
                  />
                  {errors.email && (
                    <p className="text-xs text-destructive mt-1">{errors.email.message}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Personal Information Form */}
          <Card>
            <CardHeader>
              <SectionTitle icon={User} step="Step 4">Personal Information</SectionTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <Label htmlFor="name">1. Name</Label>
                  <Input 
                    id="name" 
                    placeholder="Enter applicant's full name"
                    {...nameField}
                    ref={(el) => { nameFieldRef(el); nameInputRef.current = el; }}
                    className={`mt-1 ${errors.name ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                  />
                  {errors.name && (
                    <p className="text-xs text-destructive mt-1">{errors.name.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="birthPlace">1a. Birth Place</Label>
                  <Input 
                    id="birthPlace" 
                    {...register("birthPlace")}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="fatherName">2. Father's Name</Label>
                  <Input 
                    id="fatherName" 
                    {...register("fatherName")}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="motherName">3. Mother's Name</Label>
                  <Input 
                    id="motherName" 
                    {...register("motherName")}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="spouseName">4. Spouse's Name</Label>
                  <Input 
                    id="spouseName" 
                    {...register("spouseName")}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="address">5. Address</Label>
                  <Input 
                    id="address" 
                    {...register("address")}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="dateOfBirth">6. Date of Birth</Label>
                  <Input 
                    id="dateOfBirth" 
                    type="date"
                    {...register("dateOfBirth")}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="age">6a. Age</Label>
                  <Input 
                    id="age" 
                    {...register("age")}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="education">7. Educational Qualification</Label>
                  <Input 
                    id="education" 
                    {...register("educationalQualification")}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="occupation">7a. Occupation</Label>
                  <Input 
                    id="occupation" 
                    {...register("occupation")}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="DesignationName">7b. Designation</Label>
                  <Input 
                    id="DesignationName" 
                    {...register("designationOfPolicyHolder")}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="income">7c. Annual Income</Label>
                  <Input 
                    id="income" 
                    {...register("annualIncome")}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="servicePeriod">7d. Period Of Service</Label>
                  <Input 
                    id="servicePeriod" 
                    {...register("periodOfService")}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="employer">7e. Employer's Name</Label>
                  <Input 
                    id="employer" 
                    {...register("employerName")}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="mobileNumberLinkedAadhaar">7f. Aadhaar Linked Mobile Number </Label>
                  <Input 
                    id="mobileNumberLinkedAadhaar" 
                    {...register("aadhaarLinkedMobileNumber")}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="nominee">8. Name of Nominee</Label>
                  <Input 
                    id="nominee" 
                    {...register("nameOfNominee")}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="nomineeAge">8a. Age of Nominee</Label>
                  <Input 
                    id="nomineeAge" 
                    {...register("ageOfNominee")}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="relation">8b. Relation</Label>
                  <Input 
                    id="relation" 
                    {...register("relationName")}
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
                <SectionTitle icon={Users} step="Step 5">Family Information</SectionTitle>
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
                            <SelectTrigger aria-label={`Relationship for family member ${index + 1}`}>
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
                            aria-label={`Current age for family member ${index + 1}`}
                            className="w-full border border-input bg-background focus-visible:border-primary"
                          />
                        </TableCell>
                        <TableCell className="border border-table-border">
                          <Select value={member.health} onValueChange={(value) => handleFamilyMemberChange(index, 'health', value)}>
                            <SelectTrigger aria-label={`Health status for family member ${index + 1}`}>
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
                            aria-label={`Age at death or year for family member ${index + 1}`}
                            className="w-full border border-input bg-background focus-visible:border-primary"
                          />
                        </TableCell>
                        <TableCell className="border border-table-border">
                          <Input 
                            value={member.reason}
                            onChange={(e) => handleFamilyMemberChange(index, "reason", e.target.value)}
                            aria-label={`Reason for family member ${index + 1}`}
                            className="w-full border border-input bg-background focus-visible:border-primary"
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
                              aria-label={`Remove family member ${index + 1}`}
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
              <SectionTitle icon={HeartPulse} step="Step 6">Physical & Banking Details</SectionTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <Label htmlFor="height">10. Height</Label>
                  <Input 
                    id="height" 
                    placeholder="Height in cm"
                    {...register("height")}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="weight">10a. Weight</Label>
                  <Input 
                    id="weight" 
                    placeholder="Weight in kg"
                    {...register("weight")}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="childrenDate">11. Children's Birth Date &#40;Only for Women&#41;</Label>
                  <Input 
                    id="childrenDate" 
                    type="date"
                    {...register("lastChildBirthDate")}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="bankAccount">12. Bank Account Number</Label>
                  <Input 
                    id="bankAccount" 
                    placeholder="Enter bank account number"
                    {...register("bankAccountNumber")}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="ifsc">12a. IFSC Code</Label>
                  <Input 
                    id="ifsc" 
                    placeholder="e.g. SBIN0001234"
                    {...register("ifscCode")}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="bankName">12b. Bank Name</Label>
                  <Input 
                    id="bankName" 
                    {...register("bankName")}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="branchName">12c. Branch Name</Label>
                  <Input 
                    id="branchName" 
                    {...register("branchName")}
                    className="mt-1"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Current Policy Details */}
          <Card>
            <CardHeader>
              <SectionTitle icon={ShieldCheck} step="Step 7">Current Policy Details</SectionTitle>
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
                          aria-label="Policy Number"
                          className="border border-input bg-background focus-visible:border-primary"
                        />
                      </TableCell>
                      <TableCell className="border border-table-border">
                        <Input 
                          value={currentPolicy.planAndTerm}
                          onChange={(e) => handlePolicyChange("current", "planAndTerm", e.target.value)}
                          aria-label="Plan and Term"
                          className="border border-input bg-background focus-visible:border-primary"
                        />
                      </TableCell>
                      <TableCell className="border border-table-border">
                        <Input 
                          value={currentPolicy.sumAssured}
                          onChange={(e) => handlePolicyChange("current", "sumAssured", e.target.value)}
                          aria-label="Sum Assured"
                          className="border border-input bg-background focus-visible:border-primary"
                        />
                      </TableCell>
                      <TableCell className="border border-table-border">
                        <Select
                          value={currentPolicy.modeOfPayment}
                          onValueChange={(value) => handlePolicyChange("current","modeOfPayment", value)}
                        >
                          <SelectTrigger aria-label="Mode of Payment">
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
                          aria-label="Branch"
                          className="border border-input bg-background focus-visible:border-primary"
                        />
                      </TableCell>
                      <TableCell className="border border-table-border">
                        <Input 
                          type="date"
                          value={currentPolicy.lastPaymentDate}
                          onChange={(e) => handlePolicyChange("current", "lastPaymentDate", e.target.value)}
                          aria-label="Last Payment Date"
                          className="border border-input bg-background focus-visible:border-primary"
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
              <SectionTitle icon={History} step="Step 8">Previous Policy Details</SectionTitle>
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
                          aria-label="Previous Policy Number"
                          className="border border-input bg-background focus-visible:border-primary"
                        />
                      </TableCell>
                      <TableCell className="border border-table-border">
                        <Input 
                          value={previousPolicy.planAndTerm}
                          onChange={(e) => handlePolicyChange("previous", "planAndTerm", e.target.value)}
                          aria-label="Previous Plan and Term"
                          className="border border-input bg-background focus-visible:border-primary"
                        />
                      </TableCell>
                      <TableCell className="border border-table-border">
                        <Input 
                          value={previousPolicy.sumAssured}
                          onChange={(e) => handlePolicyChange("previous", "sumAssured", e.target.value)}
                          aria-label="Previous Sum Assured"
                          className="border border-input bg-background focus-visible:border-primary"
                        />
                      </TableCell>
                      <TableCell className="border border-table-border">
                        <Select
                          value={previousPolicy.modeOfPayment}
                          onValueChange={(value) => handlePolicyChange("previous","modeOfPayment", value)}
                        >
                          <SelectTrigger aria-label="Previous Mode of Payment">
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
                          aria-label="Previous Branch"
                          className="border border-input bg-background focus-visible:border-primary"
                        />
                      </TableCell>
                      <TableCell className="border border-table-border">
                        <Input 
                          type="date"
                          value={previousPolicy.lastPaymentDate}
                          onChange={(e) => handlePolicyChange("previous", "lastPaymentDate", e.target.value)}
                          aria-label="Previous Last Payment Date"
                          className="border border-input bg-background focus-visible:border-primary"
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
            <Button onClick={rhfHandleSubmit(onValid, onInvalid)} className="bg-primary hover:bg-primary-light text-primary-foreground shadow-sm" disabled={isSubmitting}>
              <Save className="w-4 h-4 mr-2" />
              {isSubmitting ? "Saving…" : "Save Record"}
            </Button>
            <Button 
              variant="outline" 
              onClick={() => navigate("/")}
              className="border-primary text-primary hover:bg-primary/5"
              disabled={isSubmitting}
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