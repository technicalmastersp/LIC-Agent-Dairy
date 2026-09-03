import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { getCurrentUser } from "@/utils/auth";
import {
  Save, Plus, Trash2, User, X,
  IdCard, Users, HeartPulse, ShieldCheck, History,
  LucideIcon
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { updateRecord } from "../../services/recordService";
import { convertDateToIndianFormat } from "@/utils/tools";
import InsuranceTypeSelector from "@/components/InsuranceTypeSelector";
import TypeSpecificFieldsForm from "@/components/TypeSpecificFieldsForm";
import CustomFieldsBuilder from "@/components/CustomFieldsBuilder";
import { isOtherInsuranceType, emptyTypeSpecificData } from "@/config/insuranceTypes";
import type { CustomFieldValue } from "@/types/config/insuranceTypes.types";
import { policyRecordSchema } from "@/schemas/policyRecordSchema";
import type { PolicyRecordFormValues } from "@/types/schemas/policyRecordSchema.types";
import type { Record as RecordData } from "@/types/Record";
import type { EditRecordModalProps } from "@/types/components/EditRecordModal.types";
// Small section header used across the form cards — a plain sequential
// step number (Step 1 – Step 8) through the whole form, matching AddRecord.
const SectionTitle = ({ icon: Icon, step, children }: { icon: LucideIcon; step?: string; children: React.ReactNode }) => (
  <CardTitle className="text-form-header text-lg flex items-center gap-2.5">
    <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
      <Icon className="w-3.5 h-3.5 text-primary" />
    </div>
    <span>{children}</span>
    {step && <span className="text-xs font-normal text-muted-foreground ml-1">{step}</span>}
  </CardTitle>
);

const EditRecordModal = ({ record, isOpen, onClose, onUpdate }: EditRecordModalProps) => {
  const { toast } = useToast();
  const currentUser = getCurrentUser();

  // Insurance type editing — same shape/behavior as AddRecord. Defaults to
  // Life Insurance until the record loads and overrides it in the effect below.
  const [insuranceType, setInsuranceType] = useState("Life Insurance");
  // Guards the Save button against double-click / rapid re-submits firing
  // multiple updateRecord calls for the same record.
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [customInsuranceTypeName, setCustomInsuranceTypeName] = useState("");
  const [typeSpecificData, setTypeSpecificData] = useState<Record<string, string>>({});
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
  
  const {
    register,
    handleSubmit: rhfHandleSubmit,
    reset,
    formState: { errors },
  } = useForm<PolicyRecordFormValues>({
    resolver: zodResolver(policyRecordSchema),
    defaultValues: {
      date: "", aadhaarNumber: "", panNumber: "", email: "",
      name: "", birthPlace: "", fatherName: "", motherName: "", spouseName: "",
      address: "", dateOfBirth: "", age: "", occupation: "",
      educationalQualification: "", designationOfPolicyHolder: "",
      annualIncome: "", periodOfService: "", employerName: "",
      aadhaarLinkedMobileNumber: "", nameOfNominee: "", ageOfNominee: "",
      relationName: "", lastChildBirthDate: "", height: "", weight: "",
      bankAccountNumber: "", ifscCode: "", bankName: "", branchName: "",
    },
  });

  // Policy Details Tables — same as AddRecord.tsx, no validation rules
  // exist for these today, so they stay plain useState rather than
  // joining the zod-validated form.
  const [currentPolicy, setCurrentPolicy] = useState({
    policyNumber: "", planAndTerm: "", sumAssured: "",
    modeOfPayment: "", branch: "", lastPaymentDate: "",
  });
  const [previousPolicy, setPreviousPolicy] = useState({
    policyNumber: "", planAndTerm: "", sumAssured: "",
    modeOfPayment: "", branch: "", lastPaymentDate: "",
  });

  useEffect(() => {
    if (record) {
      reset({
        date: convertDateToIndianFormat(record.date, "input"),
        aadhaarNumber: record.aadhaarNumber,
        panNumber: record.panNumber,
        email: record.email,
        name: record.name,
        birthPlace: record.birthPlace,
        fatherName: record.fatherName,
        motherName: record.motherName,
        spouseName: record.spouseName,
        address: record.address,
        dateOfBirth: convertDateToIndianFormat(record.dateOfBirth, "input"),
        age: record.age,
        occupation: record.occupation,
        educationalQualification: record.educationalQualification,
        designationOfPolicyHolder: record.designationOfPolicyHolder,
        annualIncome: record.annualIncome,
        periodOfService: record.periodOfService,
        employerName: record.employerName,
        aadhaarLinkedMobileNumber: record.aadhaarLinkedMobileNumber,
        nameOfNominee: record.nameOfNominee,
        ageOfNominee: record.ageOfNominee,
        relationName: record.relationName,
        lastChildBirthDate: convertDateToIndianFormat(record.lastChildBirthDate, "input") || "",
        height: record.height,
        weight: record.weight,
        bankAccountNumber: record.bankAccountNumber,
        ifscCode: record.ifscCode,
        bankName: record.bankName,
        branchName: record.branchName,
      });

      setPreviousPolicy({
        policyNumber: record.previousPolicy.policyNumber,
        planAndTerm: record.previousPolicy.planAndTerm,
        sumAssured: record.previousPolicy.sumAssured,
        modeOfPayment: record.previousPolicy.modeOfPayment,
        branch: record.previousPolicy.branch,
        lastPaymentDate: record.previousPolicy.lastPaymentDate,
      });

      setCurrentPolicy({
        policyNumber: record.currentPolicy.policyNumber,
        planAndTerm: record.currentPolicy.planAndTerm,
        sumAssured: record.currentPolicy.sumAssured,
        modeOfPayment: record.currentPolicy.modeOfPayment,
        branch: record.currentPolicy.branch,
        lastPaymentDate: record.currentPolicy.lastPaymentDate,
      });

      setFamilyMembers(record.familyMembers || []);

      const loadedType = record.insuranceType || "Life Insurance";
      setInsuranceType(loadedType);
      if (isOtherInsuranceType(loadedType)) {
        setCustomInsuranceTypeName(record.customInsuranceTypeName || "");
        setCustomFields(record.customFields || []);
        setTypeSpecificData({});
      } else {
        setTypeSpecificData({ ...emptyTypeSpecificData(loadedType), ...(record.typeSpecificData || {}) });
        setCustomInsuranceTypeName("");
        setCustomFields([]);
      }
    }
  }, [record, reset]);

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

  const handlePolicyChange = (
    section: "currentPolicy" | "previousPolicy",
    field: string,
    value: string
  ) => {
    if (section === "currentPolicy") {
      setCurrentPolicy(prev => ({ ...prev, [field]: value }));
    } else {
      setPreviousPolicy(prev => ({ ...prev, [field]: value }));
    }
  };

  // The Name field still needs a plain DOM ref for scrollIntoView on a
  // failed save — react-hook-form's own ref is merged onto the same
  // element (see the Name <Input> below) so both work together.
  const nameInputRef = useRef<HTMLInputElement | null>(null);
  const { ref: nameFieldRef, ...nameField } = register("name");

  // Fires when zod validation fails. Name is the only field that ever
  // blocked saving before, so it's the only one that gets the toast +
  // scroll-into-view + focus treatment, matching the exact pre-migration UX.
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
    if (!currentUser || !record) return;

    if (isOtherInsuranceType(insuranceType) && !customInsuranceTypeName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a name for this custom insurance type",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await updateRecord({
        ...formData,
        familyMembers,
        currentPolicy,
        previousPolicy,
        insuranceType,
        customInsuranceTypeName: isOtherInsuranceType(insuranceType) ? customInsuranceTypeName.trim() : null,
        typeSpecificData: isOtherInsuranceType(insuranceType) ? {} : typeSpecificData,
        customFields: isOtherInsuranceType(insuranceType) ? customFields : [],
      }, record.recordId);
      
      toast({
        title: "Success",
        description: "Record updated successfully!",
      });
      
      onUpdate();
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update record. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!record) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-form-header text-xl flex flex-wrap items-center gap-2">
            <User className="w-5 h-5 shrink-0" />
            <span className="break-words">Edit Record — {record.name}</span>
          </DialogTitle>
          <DialogDescription asChild>
            <div>
              <p>Update invoice details and save changes.</p>
              <p>* Please ensure all required fields are filled out correctly before saving.</p>
              <p>* Changes will be reflected immediately in the record list after saving.</p>
              <p>* Date fields should be in the format MM/DD/YYYY. For example, 03/26/2001.</p>
            </div>
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Insurance Type */}
          <Card>
            <CardHeader>
              <SectionTitle icon={ShieldCheck} step="Step 1">Insurance Type</SectionTitle>
            </CardHeader>
            <CardContent>
              <InsuranceTypeSelector value={insuranceType} onChange={handleInsuranceTypeChange} />
            </CardContent>
          </Card>

          {/* Type-Specific / Custom Details */}
          {isOtherInsuranceType(insuranceType) ? (
            <Card>
              <CardHeader>
                <SectionTitle icon={IdCard} step="Step 2">Custom Insurance Details</SectionTitle>
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
                <SectionTitle icon={IdCard} step="Step 2">{insuranceType} Details</SectionTitle>
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
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Input 
                    type="date"
                    {...register("date")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="aadhaarNumber">Aadhaar Number</Label>
                  <Input 
                    id="aadhaarNumber" 
                    {...register("aadhaarNumber")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="panNumber">Pan Number</Label>
                  <Input 
                    id="panNumber" 
                    {...register("panNumber")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email ID</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    {...register("email")}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Personal Information Form */}
          <Card>
            <CardHeader>
              <SectionTitle icon={User} step="Step 4">Personal Information</SectionTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">1. Name</Label>
                  <Input 
                    id="name" 
                    placeholder="Enter applicant's full name"
                    {...nameField}
                    ref={(el) => { nameFieldRef(el); nameInputRef.current = el; }}
                    className={errors.name ? "border-red-500 focus-visible:ring-red-500" : ""}
                  />
                  {errors.name && (
                    <p className="text-xs text-destructive mt-1">{errors.name.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="birthPlace">1a. Birth Place</Label>
                  <Input 
                    id="birthPlace" 
                    {...register("birthPlace")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fatherName">2. Father's Name</Label>
                  <Input 
                    id="fatherName" 
                    {...register("fatherName")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="motherName">3. Mother's Name</Label>
                  <Input 
                    id="motherName" 
                    {...register("motherName")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="spouseName">4. Spouse's Name</Label>
                  <Input 
                    id="spouseName" 
                    {...register("spouseName")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">5. Address</Label>
                  <Input 
                    id="address" 
                    {...register("address")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth">6. Date of Birth</Label>
                  <Input 
                    id="dateOfBirth" 
                    type="date"
                    {...register("dateOfBirth")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="age">6a. Age</Label>
                  <Input 
                    id="age" 
                    {...register("age")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="educationalQualification">7. Educational Qualification</Label>
                  <Input 
                    id="educationalQualification" 
                    {...register("educationalQualification")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="occupation">7a. Occupation</Label>
                  <Input 
                    id="occupation" 
                    {...register("occupation")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="designationOfPolicyHolder">7b. Designation</Label>
                  <Input 
                    id="designationOfPolicyHolder" 
                    {...register("designationOfPolicyHolder")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="annualIncome">7c. Annual Income</Label>
                  <Input 
                    id="annualIncome" 
                    {...register("annualIncome")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="periodOfService">7d. Period Of Service</Label>
                  <Input 
                    id="periodOfService" 
                    {...register("periodOfService")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="employerName">7e. Employer's Name</Label>
                  <Input 
                    id="employerName" 
                    {...register("employerName")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="aadhaarLinkedMobileNumber">7f. Aadhaar Linked Mobile Number </Label>
                  <Input 
                    id="aadhaarLinkedMobileNumber" 
                    {...register("aadhaarLinkedMobileNumber")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nameOfNominee">8. Name of Nominee</Label>
                  <Input 
                    id="nameOfNominee" 
                    {...register("nameOfNominee")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ageOfNominee">8a. Age of Nominee</Label>
                  <Input 
                    id="ageOfNominee" 
                    {...register("ageOfNominee")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="relationName">8b. Relation</Label>
                  <Input 
                    id="relationName" 
                    {...register("relationName")}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Family details */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <SectionTitle icon={Users} step="Step 5">Family Information</SectionTitle>
                <Button type="button" onClick={addFamilyMember} size="sm" variant="outline" className="text-sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Member
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {/* Mobile: stacked, editable cards (no horizontal scrolling) */}
              <div className="md:hidden space-y-3">
                {familyMembers.map((member, index) => (
                  <div key={index} className="rounded-lg border border-table-border p-3 bg-muted/20 space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-medium text-muted-foreground">Member {index + 1}</span>
                      <Button
                        type="button"
                        onClick={() => removeFamilyMember(index)}
                        variant="destructive"
                        size="sm"
                        disabled={familyMembers.length <= 1}
                        className={familyMembers.length <= 1 ? "opacity-50" : ""}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Remove
                      </Button>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Relationship</Label>
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
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label className="text-xs">Current Age</Label>
                        <Input
                          value={member.currentAge}
                          onChange={(e) => handleFamilyMemberChange(index, "currentAge", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs">Health</Label>
                        <Select value={member.health} onValueChange={(value) => handleFamilyMemberChange(index, 'health', value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select Health" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem key="Good" value="Good">Good</SelectItem>
                            <SelectItem key="Not Good" value="Not Good">Not Good</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label className="text-xs">Age at Death/Year</Label>
                        <Input
                          value={member.deathAge}
                          onChange={(e) => handleFamilyMemberChange(index, "deathAge", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs">Reason</Label>
                        <Input
                          value={member.reason}
                          onChange={(e) => handleFamilyMemberChange(index, "reason", e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop: table */}
              <div className="hidden md:block overflow-x-auto rounded-lg border border-table-border">
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
                            className="w-full border border-input bg-background focus-visible:border-primary"
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
                            className="w-full border border-input bg-background focus-visible:border-primary"
                          />
                        </TableCell>
                        <TableCell className="border border-table-border">
                          <Input 
                            value={member.reason}
                            onChange={(e) => handleFamilyMemberChange(index, "reason", e.target.value)}
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="height">10. Height</Label>
                  <Input 
                    id="height" 
                    placeholder="Height in cm"
                    {...register("height")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="weight">10a. Weight</Label>
                  <Input 
                    id="weight" 
                    placeholder="Weight in kg"
                    {...register("weight")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastChildBirthDate">11. Last Child Birth Date &#40;Only for Women&#41;</Label>
                  <Input 
                    id="lastChildBirthDate" 
                    type="date"
                    {...register("lastChildBirthDate")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bankAccountNumber">12. Bank Account Number</Label>
                  <Input 
                    id="bankAccountNumber" 
                    placeholder="Enter bank account number"
                    {...register("bankAccountNumber")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ifscCode">12a. IFSC Code</Label>
                  <Input 
                    id="ifscCode" 
                    placeholder="e.g. SBIN0001234"
                    {...register("ifscCode")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bankName">12b. Bank Name</Label>
                  <Input 
                    id="bankName" 
                    {...register("bankName")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="branchName">12c. Branch Name</Label>
                  <Input 
                    id="branchName" 
                    {...register("branchName")}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Current Policy Information */}
          <Card>
            <CardHeader>
              <SectionTitle icon={ShieldCheck} step="Step 7">Current Policy Information</SectionTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="policyNumber">Policy Number</Label>
                  <Input
                    value={currentPolicy.policyNumber}
                    onChange={(e) => handlePolicyChange("currentPolicy", "policyNumber", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="planAndTerm">Plan & Term</Label>
                  <Input
                    value={currentPolicy.planAndTerm}
                    onChange={(e) => handlePolicyChange("currentPolicy", "planAndTerm", e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="sumAssured">Sum Assured</Label>
                  <Input
                    value={currentPolicy.sumAssured}
                    onChange={(e) => handlePolicyChange("currentPolicy", "sumAssured", e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="modeOfPayment">Mode of Payment</Label>
                  <Select
                    value={currentPolicy.modeOfPayment || ""}
                    onValueChange={(value) => handlePolicyChange("currentPolicy", "modeOfPayment", value)}
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
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="branch">Branch</Label>
                  <Input
                    value={currentPolicy.branch}
                    onChange={(e) => handlePolicyChange("currentPolicy", "branch", e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="lastPaymentDate">Last Payment Date</Label>
                  <Input
                    type="date"
                    value={convertDateToIndianFormat(currentPolicy.lastPaymentDate, 'input')}
                    onChange={(e) => handlePolicyChange("currentPolicy", "lastPaymentDate", e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Previous Policy Information */}
          <Card>
            <CardHeader>
              <SectionTitle icon={History} step="Step 8">Previous Policy Information</SectionTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="policyNumber_previousPolicy">Policy Number</Label>
                  <Input
                    value={previousPolicy.policyNumber}
                    onChange={(e) => handlePolicyChange("previousPolicy", "policyNumber", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="planAndTerm_previousPolicy">Plan & Term</Label>
                  <Input
                    value={previousPolicy.planAndTerm}
                    onChange={(e) => handlePolicyChange("previousPolicy", "planAndTerm", e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="sumAssured_previousPolicy">Sum Assured</Label>
                  <Input
                    value={previousPolicy.sumAssured}
                    onChange={(e) => handlePolicyChange("previousPolicy", "sumAssured", e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="modeOfInstallment_previousPolicy">Mode of Payment</Label>
                  <Select
                    value={previousPolicy.modeOfPayment || ""}
                    onValueChange={(value) => handlePolicyChange("previousPolicy", "modeOfPayment", value)}
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
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="branch_previousPolicy">Branch</Label>
                  <Input
                    value={previousPolicy.branch}
                    onChange={(e) => handlePolicyChange("previousPolicy", "branch", e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="lastPaymentDate_previousPolicy">Last Payment Date</Label>
                  <Input
                    type="date"
                    value={convertDateToIndianFormat(previousPolicy.lastPaymentDate, 'input')}
                    onChange={(e) => handlePolicyChange("previousPolicy", "lastPaymentDate", e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button onClick={onClose} variant="outline" disabled={isSubmitting}>
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button onClick={rhfHandleSubmit(onValid, onInvalid)} className="bg-primary hover:bg-primary-light shadow-sm" disabled={isSubmitting}>
              <Save className="w-4 h-4 mr-2" />
              {isSubmitting ? "Saving…" : "Save Changes"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditRecordModal;