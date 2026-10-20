import { useState, useEffect, useRef } from "react";
import { makeInsuranceText } from "@/i18n/insuranceText";
import axios from "axios";
import { useForm } from "react-hook-form";
import { i18nZodResolver as zodResolver } from "@/i18n/zodResolver";
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
  LucideIcon, Loader2, CheckCircle2, AlertCircle,
} from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import Footer from "@/components/Footer";
import siteConfig from "@/config/siteConfig";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createRecord } from "../../services/recordService.js";
import { validateIfsc } from "../../utils/bankValidators";
import { lookupIfsc } from "../../services/referralService";
import InsuranceTypeSelector from "@/components/InsuranceTypeSelector";
import TypeSpecificFieldsForm from "@/components/TypeSpecificFieldsForm";
import CustomFieldsBuilder from "@/components/CustomFieldsBuilder";
import { isOtherInsuranceType, emptyTypeSpecificData } from "@/config/insuranceTypes";
import type { CustomFieldValue } from "@/types/config/insuranceTypes.types";
import { policyRecordSchema } from "@/schemas/policyRecordSchema";
import type { PolicyRecordFormValues } from "@/types/schemas/policyRecordSchema.types";
import type { PolicyDetail } from "@/types/pages/AddRecord.types";
import { isValidCalendarDate } from "@/utils/dateFormat";
import { formatAadhaar, unformatAadhaar, formatIndianNumber, unformatIndianNumber, formatMobileNumber, unformatMobileNumber, digitsOnly } from "@/utils/inputValueFormats";
import { useSensitiveInputClass } from "@/hooks/useSensitiveMask";
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
  const { t, tOr } = useLanguage();
  const { typeNameById } = makeInsuranceText(tOr);
  // Hide/Show sensitive data: obscure these inputs (CSS only — value untouched) while hidden
  const aadhaarMask = useSensitiveInputClass("aadhaarNumber");
  const panMask     = useSensitiveInputClass("panNumber");
  const mobileMask  = useSensitiveInputClass("mobileNumber");
  const accountMask = useSensitiveInputClass("bankAccountNumber");
  const ifscMask    = useSensitiveInputClass("ifscCode");

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
    getValues,
    setValue,
    watch,
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

  // IFSC -> bank name / branch name auto-fill, same lookup + status pattern
  // used on the Referral Program's bank-details form. bankName/branchName
  // stay disabled inputs — they're always derived from the IFSC code, never
  // typed directly.
  const [ifscLookupState, setIfscLookupState] = useState<{
    status: "idle" | "loading" | "found" | "not_found";
    bank?: string;
    branch?: string;
  }>({ status: "idle" });

  const handleIfscBlur = async () => {
    const code = (getValues("ifscCode") || "").trim().toUpperCase();
    if (!validateIfsc(code)) {
      setIfscLookupState({ status: "idle" });
      setValue("bankName", "");
      setValue("branchName", "");
      return;
    }
    setIfscLookupState({ status: "loading" });
    try {
      const details = await lookupIfsc(code);
      setIfscLookupState({ status: "found", bank: details.bank, branch: details.branch });
      setValue("bankName", details.bank || "");
      setValue("branchName", details.branch || "");
    } catch {
      setIfscLookupState({ status: "not_found" });
      setValue("bankName", "");
      setValue("branchName", "");
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
        title: t('records.error'),
        description: t('records.pleaseEnterTheApplicantS'),
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
        title: t('records.error'),
        description: t('records.pleaseEnterAName'),
        variant: "destructive",
      });
      return;
    }

    // currentPolicy/previousPolicy are plain state, not part of the zod
    // schema above — validate their date fields the same way.
    if (currentPolicy.lastPaymentDate && !isValidCalendarDate(currentPolicy.lastPaymentDate)) {
      toast({ title: t('records.error'), description: t('records.currentPolicySLastPayment'), variant: "destructive" });
      return;
    }
    if (previousPolicy.lastPaymentDate && !isValidCalendarDate(previousPolicy.lastPaymentDate)) {
      toast({ title: t('records.error'), description: t('records.previousPolicySLastPayment'), variant: "destructive" });
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
        title: t('records.success'),
        description: t('records.recordSavedSuccessfully'),
      });
      navigate("/view-records");
    } catch (error) {
      const message = axios.isAxiosError(error) ? error.response?.data?.message : undefined;
      toast({
        title: t('records.error'),
        description: message || t('records.failedToSaveRecord'),
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
              <p className="text-primary-foreground/90">{t("nav.addRecord")}</p>
              <p className="text-primary-foreground/60 text-xs mt-1">{t('records.fillInTheSectionsBelow')}</p>
            </CardHeader>
          </Card>

          {/* Insurance Type Selection */}
          <Card>
            <CardHeader>
              <SectionTitle icon={ListChecks} step={t('common.step', { n: 1 })}>{t('records.selectInsuranceType')}</SectionTitle>
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
                <SectionTitle icon={ShieldCheck} step={t('common.step', { n: 2 })}>{t('records.customInsuranceDetails')}</SectionTitle>
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
                <SectionTitle icon={ShieldCheck} step={t('common.step', { n: 2 })}>{t('records.details', { insuranceType: typeNameById(insuranceType) })}</SectionTitle>
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
              <SectionTitle icon={IdCard} step={t('common.step', { n: 3 })}>{t('common.basicDetails')}</SectionTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="date">{t('records.n1Date')}</Label>
                  <Input 
                    id="date"
                    type="date"
                    {...register("date")}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="aadhaarNumber">{t('records.n2AadhaarNumber')}</Label>
                  <Input 
                    id="aadhaarNumber" 
                    placeholder={t('records.n12DigitAadhaarNumber')}
                    value={formatAadhaar(watch("aadhaarNumber"))}
                    onChange={(e) => setValue("aadhaarNumber", unformatAadhaar(e.target.value), { shouldValidate: true })}
                    onBlur={register("aadhaarNumber").onBlur}
                    autoComplete="off"
                    className={`mt-1 ${aadhaarMask}`}
                    maxLength={14}
                    inputMode="numeric"
                  />
                  {errors.aadhaarNumber && (
                    <p className="text-xs text-destructive mt-1">{errors.aadhaarNumber.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="panNumber">{t('records.n3PanNumber')}</Label>
                  <Input 
                    id="panNumber" 
                    placeholder={t('records.eGAbcde1234f')}
                    {...register("panNumber")}
                    autoComplete="off"
                    className={`mt-1 uppercase ${panMask}`}
                    maxLength={10}
                  />
                  {errors.panNumber && (
                    <p className="text-xs text-destructive mt-1">{errors.panNumber.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="email">{t('records.n4EmailId')}</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    {...register("email")}
                    className="mt-1"
                    maxLength={100}
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
              <SectionTitle icon={User} step={t('common.step', { n: 4 })}>{t('records.personalInformation')}</SectionTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <Label htmlFor="name">{t('records.n1Name')}</Label>
                  <Input 
                    id="name" 
                    placeholder={t('records.enterApplicantSFullName')}
                    {...nameField}
                    ref={(el) => { nameFieldRef(el); nameInputRef.current = el; }}
                    className={`mt-1 ${errors.name ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                    maxLength={100}
                  />
                  {errors.name && (
                    <p className="text-xs text-destructive mt-1">{errors.name.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="birthPlace">{t('records.n2BirthPlace')}</Label>
                  <Input 
                    id="birthPlace" 
                    {...register("birthPlace")}
                    className="mt-1"
                    maxLength={100}
                  />
                </div>
                <div>
                  <Label htmlFor="fatherName">{t('records.n3FatherSName')}</Label>
                  <Input 
                    id="fatherName" 
                    {...register("fatherName")}
                    className="mt-1"
                    maxLength={100}
                  />
                </div>
                <div>
                  <Label htmlFor="motherName">{t('records.n4MotherSName')}</Label>
                  <Input 
                    id="motherName" 
                    {...register("motherName")}
                    className="mt-1"
                    maxLength={100}
                  />
                </div>
                <div>
                  <Label htmlFor="spouseName">{t('records.n5SpouseSName')}</Label>
                  <Input 
                    id="spouseName" 
                    {...register("spouseName")}
                    className="mt-1"
                    maxLength={100}
                  />
                </div>
                <div>
                  <Label htmlFor="address">{t('records.n6Address')}</Label>
                  <Input 
                    id="address" 
                    {...register("address")}
                    className="mt-1"
                    maxLength={200}
                  />
                </div>
                <div>
                  <Label htmlFor="dateOfBirth">{t('records.n7DateOfBirth')}</Label>
                  <Input 
                    id="dateOfBirth" 
                    type="date"
                    {...register("dateOfBirth")}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="age">{t('records.n8Age')}</Label>
                  <Input 
                    id="age" 
                    value={digitsOnly(watch("age"))}
                    onChange={(e) => setValue("age", digitsOnly(e.target.value), { shouldValidate: true })}
                    onBlur={register("age").onBlur}
                    // {...register("age")}
                    className="mt-1"
                    maxLength={3}
                  />
                </div>
                <div>
                  <Label htmlFor="education">{t('records.n9EducationalQualification')}</Label>
                  <Input 
                    id="education" 
                    {...register("educationalQualification")}
                    className="mt-1"
                    maxLength={100}
                  />
                </div>
                <div>
                  <Label htmlFor="occupation">{t('records.n10Occupation')}</Label>
                  <Input 
                    id="occupation" 
                    {...register("occupation")}
                    className="mt-1"
                    maxLength={100}
                  />
                </div>
                <div>
                  <Label htmlFor="DesignationName">{t('records.n11Designation')}</Label>
                  <Input 
                    id="DesignationName" 
                    {...register("designationOfPolicyHolder")}
                    className="mt-1"
                    maxLength={100}
                  />
                </div>
                <div>
                  <Label htmlFor="income">{t('records.n12AnnualIncome')}</Label>
                  <Input 
                    id="income" 
                    {...register("annualIncome")}
                    className="mt-1"
                    maxLength={50}
                  />
                </div>
                <div>
                  <Label htmlFor="servicePeriod">{t('records.n13PeriodOfService')}</Label>
                  <Input 
                    id="servicePeriod" 
                    value={digitsOnly(watch("periodOfService"))}
                    onChange={(e) => setValue("periodOfService", digitsOnly(e.target.value), { shouldValidate: true })}
                    onBlur={register("periodOfService").onBlur}
                    // {...register("periodOfService")}
                    className="mt-1"
                    maxLength={3}
                  />
                </div>
                <div>
                  <Label htmlFor="employer">{t('records.n14EmployerSName')}</Label>
                  <Input 
                    id="employer" 
                    {...register("employerName")}
                    className="mt-1"
                    maxLength={100}
                  />
                </div>
                <div>
                  <Label htmlFor="mobileNumberLinkedAadhaar">{t('records.n15AadhaarLinkedMobileNumber')}{" "} </Label>
                  <Input 
                    id="mobileNumberLinkedAadhaar" 
                    value={formatMobileNumber(watch("aadhaarLinkedMobileNumber"))}
                    onChange={(e) => setValue("aadhaarLinkedMobileNumber", unformatMobileNumber(e.target.value), { shouldValidate: true })}
                    onBlur={register("aadhaarLinkedMobileNumber").onBlur}
                    // {...register("aadhaarLinkedMobileNumber")}
                    autoComplete="off"
                    className={`mt-1 ${mobileMask}`}
                  />
                </div>
                <div>
                  <Label htmlFor="nominee">{t('records.n16NameOfNominee')}</Label>
                  <Input 
                    id="nominee" 
                    {...register("nameOfNominee")}
                    className="mt-1"
                    maxLength={100}
                  />
                </div>
                <div>
                  <Label htmlFor="nomineeAge">{t('records.n17AgeOfNominee')}</Label>
                  <Input 
                    id="nomineeAge" 
                    value={digitsOnly(watch("ageOfNominee"))}
                    onChange={(e) => setValue("ageOfNominee", digitsOnly(e.target.value), { shouldValidate: true })}
                    onBlur={register("ageOfNominee").onBlur}
                    // {...register("ageOfNominee")}
                    className="mt-1"
                    maxLength={3}
                  />
                </div>
                <div>
                  <Label htmlFor="relation">{t('records.n18Relation')}</Label>
                  <Input 
                    id="relation" 
                    {...register("relationName")}
                    className="mt-1"
                    maxLength={100}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Family Details Table */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <SectionTitle icon={Users} step={t('common.step', { n: 5 })}>{t('records.familyInformation')}</SectionTitle>
                <Button type="button" onClick={addFamilyMember} size="sm" variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  {t('records.addMember')}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto rounded-lg border border-table-border">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-table-header">
                      <TableHead className="border border-table-border font-semibold">{t('records.n1Relationship')}</TableHead>
                      <TableHead className="border border-table-border font-semibold">{t('records.n2CurrentAge')}</TableHead>
                      <TableHead className="border border-table-border font-semibold">{t('records.n3Health')}</TableHead>
                      <TableHead className="border border-table-border font-semibold">{t('records.n4AgeAtDeathYear')}</TableHead>
                      <TableHead className="border border-table-border font-semibold">{t('records.n5Reason')}</TableHead>
                      <TableHead className="border border-table-border font-semibold">{t('common.delete')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {familyMembers.map((member, index) => (
                      <TableRow key={index} className="hover:bg-muted/40">
                        <TableCell className="border border-table-border font-medium">
                          <Select value={member.relationship || ""} onValueChange={(value) => handleFamilyMemberChange(index, 'relationship', value)}>
                            <SelectTrigger aria-label={t('records.relationshipForFamilyMember', { value: index + 1 })}>
                              <SelectValue placeholder={t('records.selectRelationship')} />
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
                            value={digitsOnly(member.currentAge)}
                            onChange={(e) => handleFamilyMemberChange(index, "currentAge", e.target.value)}
                            aria-label={t('records.currentAgeForFamilyMember', { value: index + 1 })}
                            className="w-full border border-input bg-background focus-visible:border-primary"
                            maxLength={3}
                          />
                        </TableCell>
                        <TableCell className="border border-table-border">
                          <Select value={member.health} onValueChange={(value) => handleFamilyMemberChange(index, 'health', value)}>
                            <SelectTrigger aria-label={t('records.healthStatusForFamilyMember', { value: index + 1 })}>
                              <SelectValue placeholder={t('records.selectHealth')} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem key="Good" value="Good">{t('common.good')}</SelectItem>
                                <SelectItem key="Not Good" value="Not Good">{t('common.notGood')}</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell className="border border-table-border">
                          <Input 
                            value={digitsOnly(member.deathAge)}
                            onChange={(e) => handleFamilyMemberChange(index, "deathAge", e.target.value)}
                            aria-label={t('records.ageAtDeathOrYear', { value: index + 1 })}
                            className="w-full border border-input bg-background focus-visible:border-primary"
                            maxLength={4}
                          />
                        </TableCell>
                        <TableCell className="border border-table-border">
                          <Input 
                            value={member.reason}
                            onChange={(e) => handleFamilyMemberChange(index, "reason", e.target.value)}
                            aria-label={t('records.reasonForFamilyMember', { value: index + 1 })}
                            className="w-full border border-input bg-background focus-visible:border-primary"
                            maxLength={100}
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
                              aria-label={t('records.removeFamilyMember', { value: index + 1 })}
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
              <SectionTitle icon={HeartPulse} step={t('common.step', { n: 6 })}>{t('records.physicalBankingDetails')}</SectionTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <Label htmlFor="height">{t('records.n1HeightCm')}</Label>
                  <Input 
                    id="height" 
                    placeholder={t('records.heightInCm')}
                    value={digitsOnly(watch("height"))}
                    onChange={(e) => setValue("height", digitsOnly(e.target.value), { shouldValidate: true })}
                    onBlur={register("height").onBlur}
                    // {...register("height")}
                    className="mt-1"
                    maxLength={3}
                  />
                </div>
                <div>
                  <Label htmlFor="weight">{t('records.n2WeightKg')}</Label>
                  <Input 
                    id="weight" 
                    placeholder={t('records.weightInKg')}
                    value={digitsOnly(watch("weight"))}
                    onChange={(e) => setValue("weight", digitsOnly(e.target.value), { shouldValidate: true })}
                    onBlur={register("weight").onBlur}
                    // {...register("weight")}
                    className="mt-1"
                    maxLength={3}
                  />
                </div>
                <div>
                  <Label htmlFor="childrenDate">{t('records.n3ChildrenSBirthDate')}</Label>
                  <Input 
                    id="childrenDate" 
                    type="date"
                    {...register("lastChildBirthDate")}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="bankAccount">{t('records.n4BankAccountNumber')}</Label>
                  <Input 
                    id="bankAccount" 
                    placeholder={t('records.enterBankAccountNumber')}
                    {...register("bankAccountNumber")}
                    autoComplete="off"
                    className={`mt-1 ${accountMask}`}
                    maxLength={30}
                  />
                </div>
                <div>
                  <Label htmlFor="ifsc">{t('records.n5IfscCode')}</Label>
                  <Input 
                    id="ifsc" 
                    placeholder={t('records.eGSbin0001234')}
                    {...register("ifscCode", {
                      onChange: () => setIfscLookupState({ status: "idle" }),
                    })}
                    onBlur={(e) => { register("ifscCode").onBlur(e); handleIfscBlur(); }}
                    autoComplete="off"
                    className={`mt-1 uppercase ${ifscMask}`}
                    maxLength={11}
                  />
                </div>
                <div>
                  <Label htmlFor="bankName">{t('records.n6BankName')}</Label>
                  <Input 
                    id="bankName" 
                    {...register("bankName")}
                    className="mt-1"
                    maxLength={100}
                    disabled
                    placeholder={t('records.autoFilledFromIfsc')}
                  />
                  {ifscLookupState.status === "loading" && (
                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                      <Loader2 className="w-3 h-3 animate-spin" /> {" "}{t('common.lookingUpBank')}
                    </p>
                  )}
                  {ifscLookupState.status === "not_found" && (
                    <p className="text-xs text-destructive mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {" "}{t('common.ifscNotFoundCheck')}
                    </p>
                  )}
                  {ifscLookupState.status === "found" && (
                    <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> {" "}{t('common.verified')}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="branchName">{t('records.n7BranchName')}</Label>
                  <Input 
                    id="branchName" 
                    {...register("branchName")}
                    className="mt-1"
                    maxLength={100}
                    disabled
                    placeholder={t('records.autoFilledFromIfsc')}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Current Policy Details */}
          <Card>
            <CardHeader>
              <SectionTitle icon={ShieldCheck} step={t('common.step', { n: 7 })}>{t('records.currentPolicyDetails')}</SectionTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto rounded-lg border border-table-border">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-table-header">
                      <TableHead className="border border-table-border">{t('records.n1PolicyNumber')}</TableHead>
                      <TableHead className="border border-table-border">{t('records.n2PlanTerm')}</TableHead>
                      <TableHead className="border border-table-border">{t('records.n3SumAssured')}</TableHead>
                      <TableHead className="border border-table-border">{t('records.n4ModeOfPayment')}</TableHead>
                      <TableHead className="border border-table-border">{t('records.n5Branch')}</TableHead>
                      <TableHead className="border border-table-border">{t('records.n6LastPaymentDate')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="border border-table-border">
                        <Input 
                          value={currentPolicy.policyNumber}
                          onChange={(e) => handlePolicyChange("current", "policyNumber", e.target.value)}
                          aria-label={t('common.policyNumber')}
                          className="border border-input bg-background focus-visible:border-primary"
                          maxLength={30}
                        />
                      </TableCell>
                      <TableCell className="border border-table-border">
                        <Input 
                          value={currentPolicy.planAndTerm}
                          onChange={(e) => handlePolicyChange("current", "planAndTerm", e.target.value)}
                          aria-label={t('records.planAndTerm')}
                          className="border border-input bg-background focus-visible:border-primary"
                          maxLength={100}
                        />
                      </TableCell>
                      <TableCell className="border border-table-border">
                        <Input 
                          value={formatIndianNumber(currentPolicy.sumAssured)}
                          onChange={(e) => handlePolicyChange("current", "sumAssured", unformatIndianNumber(e.target.value))}
                          aria-label={t('common.sumAssured')}
                          className="border border-input bg-background focus-visible:border-primary"
                          inputMode="numeric"
                        />
                      </TableCell>
                      <TableCell className="border border-table-border">
                        <Select
                          value={currentPolicy.modeOfPayment}
                          onValueChange={(value) => handlePolicyChange("current","modeOfPayment", value)}
                        >
                          <SelectTrigger aria-label={t('records.modeOfPayment')}>
                            <SelectValue placeholder={t('records.selectPaymentMode')} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Monthly">{t('records.monthlyOrENach')}</SelectItem>
                            <SelectItem value="Quarterly">{t('records.quarterly')}</SelectItem>
                            <SelectItem value="Half-Yearly">{t('records.halfYearly')}</SelectItem>
                            <SelectItem value="Yearly">{t('records.yearly')}</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="border border-table-border">
                        <Input 
                          value={currentPolicy.branch}
                          onChange={(e) => handlePolicyChange("current", "branch", e.target.value)}
                          aria-label={t('common.branch')}
                          className="border border-input bg-background focus-visible:border-primary"
                          maxLength={100}
                        />
                      </TableCell>
                      <TableCell className="border border-table-border">
                        <Input 
                          type="date"
                          value={currentPolicy.lastPaymentDate}
                          onChange={(e) => handlePolicyChange("current", "lastPaymentDate", e.target.value)}
                          aria-label={t('common.lastPaymentDate')}
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
              <SectionTitle icon={History} step={t('common.step', { n: 8 })}>{t('records.previousPolicyDetails')}</SectionTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto rounded-lg border border-table-border">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-table-header">
                      <TableHead className="border border-table-border">{t('records.n1PolicyNumber')}</TableHead>
                      <TableHead className="border border-table-border">{t('records.n2PlanTerm')}</TableHead>
                      <TableHead className="border border-table-border">{t('records.n3SumAssured')}</TableHead>
                      <TableHead className="border border-table-border">{t('records.n4ModeOfPayment')}</TableHead>
                      <TableHead className="border border-table-border">{t('records.n5Branch')}</TableHead>
                      <TableHead className="border border-table-border">{t('records.n6LastPaymentDate')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="border border-table-border">
                        <Input 
                          value={previousPolicy.policyNumber}
                          onChange={(e) => handlePolicyChange("previous", "policyNumber", e.target.value)}
                          aria-label={t('records.previousPolicyNumber')}
                          className="border border-input bg-background focus-visible:border-primary"
                          maxLength={30}
                        />
                      </TableCell>
                      <TableCell className="border border-table-border">
                        <Input 
                          value={previousPolicy.planAndTerm}
                          onChange={(e) => handlePolicyChange("previous", "planAndTerm", e.target.value)}
                          aria-label={t('records.previousPlanAndTerm')}
                          className="border border-input bg-background focus-visible:border-primary"
                          maxLength={100}
                        />
                      </TableCell>
                      <TableCell className="border border-table-border">
                        <Input 
                          value={formatIndianNumber(previousPolicy.sumAssured)}
                          onChange={(e) => handlePolicyChange("previous", "sumAssured", unformatIndianNumber(e.target.value))}
                          aria-label={t('records.previousSumAssured')}
                          className="border border-input bg-background focus-visible:border-primary"
                          inputMode="numeric"
                        />
                      </TableCell>
                      <TableCell className="border border-table-border">
                        <Select
                          value={previousPolicy.modeOfPayment}
                          onValueChange={(value) => handlePolicyChange("previous","modeOfPayment", value)}
                        >
                          <SelectTrigger aria-label={t('records.previousModeOfPayment')}>
                            <SelectValue placeholder={t('records.selectPaymentMode')} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Monthly">{t('records.monthlyOrENach')}</SelectItem>
                            <SelectItem value="Quarterly">{t('records.quarterly')}</SelectItem>
                            <SelectItem value="Half-Yearly">{t('records.halfYearly')}</SelectItem>
                            <SelectItem value="Yearly">{t('records.yearly')}</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="border border-table-border">
                        <Input 
                          value={previousPolicy.branch}
                          onChange={(e) => handlePolicyChange("previous", "branch", e.target.value)}
                          aria-label={t('records.previousBranch')}
                          className="border border-input bg-background focus-visible:border-primary"
                          maxLength={100}
                        />
                      </TableCell>
                      <TableCell className="border border-table-border">
                        <Input 
                          type="date"
                          value={previousPolicy.lastPaymentDate}
                          onChange={(e) => handlePolicyChange("previous", "lastPaymentDate", e.target.value)}
                          aria-label={t('records.previousLastPaymentDate')}
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
              {isSubmitting ? t('records.saving') : t('records.saveRecord')}
            </Button>
            <Button 
              variant="outline" 
              onClick={() => navigate("/")}
              className="border-primary text-primary hover:bg-primary/5"
              disabled={isSubmitting}
            >
              {t('common.cancel')}
            </Button>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default AddRecord;