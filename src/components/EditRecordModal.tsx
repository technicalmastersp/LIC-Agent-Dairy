import { useState, useEffect, useRef } from "react";
import { makeInsuranceText } from "@/i18n/insuranceText";
import axios from "axios";
import { useForm } from "react-hook-form";
import { i18nZodResolver as zodResolver } from "@/i18n/zodResolver";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { getCurrentUser } from "@/utils/auth";
import { useSensitiveInputClass } from "@/hooks/useSensitiveMask";
import {
  Save, Plus, Trash2, User, X,
  IdCard, Users, HeartPulse, ShieldCheck, History,
  LucideIcon, Loader2, CheckCircle2, AlertCircle,
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { updateRecord } from "../../services/recordService";
import { validateIfsc } from "../../utils/bankValidators";
import { lookupIfsc } from "../../services/referralService";
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
import { isValidCalendarDate } from "@/utils/dateFormat";
import { formatAadhaar, unformatAadhaar, formatIndianNumber, unformatIndianNumber, formatMobileNumber, unformatMobileNumber, digitsOnly } from "@/utils/inputValueFormats";
import { useLanguage } from "@/hooks/useLanguage";
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
  const { t, tOr } = useLanguage();
  const { typeNameById } = makeInsuranceText(tOr);
  const { toast } = useToast();
  const currentUser = getCurrentUser();
  // Hide/Show sensitive data: obscure these inputs (CSS only — value untouched) while hidden
  const aadhaarMask = useSensitiveInputClass("aadhaarNumber");
  const panMask     = useSensitiveInputClass("panNumber");
  const mobileMask  = useSensitiveInputClass("mobileNumber");
  const accountMask = useSensitiveInputClass("bankAccountNumber");
  const ifscMask    = useSensitiveInputClass("ifscCode");

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
    getValues,
    setValue,
    watch,
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

      // If this record already has a resolved bank name (saved previously,
      // whether via lookup or the older free-text field), show it as
      // "found" immediately instead of demanding a redundant IFSC re-lookup
      // before the agent can save again.
      if (record.ifscCode && record.bankName) {
        setIfscLookupState({ status: "found", bank: record.bankName, branch: record.branchName });
      } else {
        setIfscLookupState({ status: "idle" });
      }

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

  // IFSC -> bank name / branch name auto-fill, same lookup + status pattern
  // used on AddRecord and the Referral Program's bank-details form.
  // bankName/branchName stay disabled inputs — always derived from the
  // IFSC code, never typed directly.
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
    if (!currentUser || !record) return;

    if (isOtherInsuranceType(insuranceType) && !customInsuranceTypeName.trim()) {
      toast({
        title: t('records.error'),
        description: t('records.pleaseEnterAName'),
        variant: "destructive",
      });
      return;
    }

    // currentPolicy/previousPolicy are plain state, not part of the zod
    // schema — validate their date fields the same way.
    if (currentPolicy.lastPaymentDate && !isValidCalendarDate(currentPolicy.lastPaymentDate)) {
      toast({ title: t('records.error'), description: t('records.currentPolicySLastPayment'), variant: "destructive" });
      return;
    }
    if (previousPolicy.lastPaymentDate && !isValidCalendarDate(previousPolicy.lastPaymentDate)) {
      toast({ title: t('records.error'), description: t('records.previousPolicySLastPayment'), variant: "destructive" });
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
        title: t('records.success'),
        description: t('records.recordUpdatedSuccessfully'),
      });
      
      onUpdate();
      onClose();
    } catch (error) {
      const message = axios.isAxiosError(error) ? error.response?.data?.message : undefined;
      toast({
        title: t('records.error'),
        description: message || t('records.failedToUpdateRecordPlease'),
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
            <span className="break-words">{t('records.editRecord2', { name: record.name })}</span>
          </DialogTitle>
          <DialogDescription asChild>
            <div>
              <p>{t('records.updateInvoiceDetailsAndSave')}</p>
              <p>{t('records.pleaseEnsureAllRequiredFields')}</p>
              <p>{t('records.changesWillBeReflectedImmediately')}</p>
              <p>{t('records.dateFieldsShould')}</p>
              <p>{t('records.allTypeOfAgeFields')}</p>
            </div>
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Insurance Type */}
          <Card>
            <CardHeader>
              <SectionTitle icon={ShieldCheck} step={t('common.step', { n: 1 })}>{t('records.insuranceType')}</SectionTitle>
            </CardHeader>
            <CardContent>
              <InsuranceTypeSelector value={insuranceType} onChange={handleInsuranceTypeChange} />
            </CardContent>
          </Card>

          {/* Type-Specific / Custom Details */}
          {isOtherInsuranceType(insuranceType) ? (
            <Card>
              <CardHeader>
                <SectionTitle icon={IdCard} step={t('common.step', { n: 2 })}>{t('records.customInsuranceDetails')}</SectionTitle>
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
                <SectionTitle icon={IdCard} step={t('common.step', { n: 2 })}>{t('records.details', { insuranceType: typeNameById(insuranceType) })}</SectionTitle>
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
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">{t('records.n1Date')}</Label>
                  <Input 
                    type="date"
                    {...register("date")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="aadhaarNumber">{t('records.n2AadhaarNumber')}</Label>
                  <Input 
                    id="aadhaarNumber" 
                    value={formatAadhaar(watch("aadhaarNumber"))}
                    onChange={(e) => setValue("aadhaarNumber", unformatAadhaar(e.target.value), { shouldValidate: true })}
                    onBlur={register("aadhaarNumber").onBlur}
                    maxLength={14}
                    inputMode="numeric"
                    autoComplete="off"
                    className={aadhaarMask}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="panNumber">{t('records.n3PanNumber')}</Label>
                  <Input 
                    id="panNumber" 
                    {...register("panNumber")}
                    autoComplete="off"
                    className={`uppercase ${panMask}`}
                    maxLength={10}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">{t('records.n4EmailId')}</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    {...register("email")}
                    maxLength={100}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Personal Information Form */}
          <Card>
            <CardHeader>
              <SectionTitle icon={User} step={t('common.step', { n: 4 })}>{t('records.personalInformation')}</SectionTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">{t('records.n1Name')}</Label>
                  <Input 
                    id="name" 
                    placeholder={t('records.enterApplicantSFullName')}
                    {...nameField}
                    ref={(el) => { nameFieldRef(el); nameInputRef.current = el; }}
                    className={errors.name ? "border-red-500 focus-visible:ring-red-500" : ""}
                    maxLength={100}
                  />
                  {errors.name && (
                    <p className="text-xs text-destructive mt-1">{errors.name.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="birthPlace">{t('records.n2BirthPlace')}</Label>
                  <Input 
                    id="birthPlace" 
                    {...register("birthPlace")}
                    maxLength={100}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fatherName">{t('records.n3FatherSName')}</Label>
                  <Input 
                    id="fatherName" 
                    {...register("fatherName")}
                    maxLength={100}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="motherName">{t('records.n4MotherSName')}</Label>
                  <Input 
                    id="motherName" 
                    {...register("motherName")}
                    maxLength={100}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="spouseName">{t('records.n5SpouseSName')}</Label>
                  <Input 
                    id="spouseName" 
                    {...register("spouseName")}
                    maxLength={100}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">{t('records.n6Address')}</Label>
                  <Input 
                    id="address" 
                    {...register("address")}
                    maxLength={200}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth">{t('records.n7DateOfBirth')}</Label>
                  <Input 
                    id="dateOfBirth" 
                    type="date"
                    {...register("dateOfBirth")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="age">{t('records.n8Age')}</Label>
                  <Input 
                    id="age" 
                    value={digitsOnly(watch("age"))}
                    onChange={(e) => setValue("age", digitsOnly(e.target.value), { shouldValidate: true })}
                    onBlur={register("age").onBlur}
                    // {...register("age")}
                    maxLength={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="educationalQualification">{t('records.n9EducationalQualification')}</Label>
                  <Input 
                    id="educationalQualification" 
                    {...register("educationalQualification")}
                    maxLength={100}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="occupation">{t('records.n10Occupation')}</Label>
                  <Input 
                    id="occupation" 
                    {...register("occupation")}
                    maxLength={100}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="designationOfPolicyHolder">{t('records.n11Designation')}</Label>
                  <Input 
                    id="designationOfPolicyHolder" 
                    {...register("designationOfPolicyHolder")}
                    maxLength={100}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="annualIncome">{t('records.n12AnnualIncome')}</Label>
                  <Input 
                    id="annualIncome" 
                    {...register("annualIncome")}
                    maxLength={50}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="periodOfService">{t('records.n13PeriodOfService')}</Label>
                  <Input 
                    id="periodOfService" 
                    value={digitsOnly(watch("periodOfService"))}
                    onChange={(e) => setValue("periodOfService", digitsOnly(e.target.value), { shouldValidate: true })}
                    onBlur={register("periodOfService").onBlur}
                    // {...register("periodOfService")}
                    maxLength={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="employerName">{t('records.n14EmployerSName')}</Label>
                  <Input 
                    id="employerName" 
                    {...register("employerName")}
                    maxLength={100}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="aadhaarLinkedMobileNumber">{t('records.n15AadhaarLinkedMobileNumber')}{" "} </Label>
                  <Input 
                    id="aadhaarLinkedMobileNumber" 
                    value={formatMobileNumber(watch("aadhaarLinkedMobileNumber"))}
                    onChange={(e) => setValue("aadhaarLinkedMobileNumber", unformatMobileNumber(e.target.value), { shouldValidate: true })}
                    onBlur={register("aadhaarLinkedMobileNumber").onBlur}
                    autoComplete="off"
                    className={mobileMask}
                    // {...register("aadhaarLinkedMobileNumber")}
                    // maxLength={10}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nameOfNominee">{t('records.n16NameOfNominee')}</Label>
                  <Input 
                    id="nameOfNominee" 
                    {...register("nameOfNominee")}
                    maxLength={100}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ageOfNominee">{t('records.n17AgeOfNominee')}</Label>
                  <Input 
                    id="ageOfNominee" 
                    value={digitsOnly(watch("ageOfNominee"))}
                    onChange={(e) => setValue("ageOfNominee", digitsOnly(e.target.value), { shouldValidate: true })}
                    onBlur={register("ageOfNominee").onBlur}
                    // {...register("ageOfNominee")}
                    maxLength={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="relationName">{t('records.n18Relation')}</Label>
                  <Input 
                    id="relationName" 
                    {...register("relationName")}
                    maxLength={100}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Family details */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <SectionTitle icon={Users} step={t('common.step', { n: 5 })}>{t('records.familyInformation')}</SectionTitle>
                <Button type="button" onClick={addFamilyMember} size="sm" variant="outline" className="text-sm">
                  <Plus className="h-4 w-4 mr-2" />
                  {t('records.addMember')}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {/* Mobile: stacked, editable cards (no horizontal scrolling) */}
              <div className="md:hidden space-y-3">
                {familyMembers.map((member, index) => (
                  <div key={index} className="rounded-lg border border-table-border p-3 bg-muted/20 space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-medium text-muted-foreground">{t('records.member', { value: index + 1 })}</span>
                      <Button
                        type="button"
                        onClick={() => removeFamilyMember(index)}
                        variant="destructive"
                        size="sm"
                        disabled={familyMembers.length <= 1}
                        className={familyMembers.length <= 1 ? "opacity-50" : ""}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        {t('records.remove')}
                      </Button>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">{t('records.n1Relationship')}</Label>
                      <Select value={member.relationship || ""} onValueChange={(value) => handleFamilyMemberChange(index, 'relationship', value)}>
                        <SelectTrigger>
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
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label className="text-xs">{t('records.n2CurrentAge')}</Label>
                        <Input
                          value={digitsOnly(member.currentAge)}
                          onChange={(e) => handleFamilyMemberChange(index, "currentAge", e.target.value)}
                          maxLength={3}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs">{t('records.n3Health')}</Label>
                        <Select value={member.health} onValueChange={(value) => handleFamilyMemberChange(index, 'health', value)}>
                          <SelectTrigger>
                            <SelectValue placeholder={t('records.selectHealth')} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem key="Good" value="Good">{t('common.good')}</SelectItem>
                            <SelectItem key="Not Good" value="Not Good">{t('common.notGood')}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label className="text-xs">{t('records.n4AgeAtDeathYear')}</Label>
                        <Input
                          value={digitsOnly(member.deathAge)}
                          onChange={(e) => handleFamilyMemberChange(index, "deathAge", e.target.value)}
                          maxLength={4}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs">{t('records.n5Reason')}</Label>
                        <Input
                          value={member.reason}
                          onChange={(e) => handleFamilyMemberChange(index, "reason", e.target.value)}
                          maxLength={100}
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
                            <SelectTrigger>
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
                            className="w-full border border-input bg-background focus-visible:border-primary"
                            maxLength={3}
                          />
                        </TableCell>
                        <TableCell className="border border-table-border">
                          <Select value={member.health} onValueChange={(value) => handleFamilyMemberChange(index, 'health', value)}>
                            <SelectTrigger>
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
                            className="w-full border border-input bg-background focus-visible:border-primary"
                            maxLength={4}
                          />
                        </TableCell>
                        <TableCell className="border border-table-border">
                          <Input 
                            value={member.reason}
                            onChange={(e) => handleFamilyMemberChange(index, "reason", e.target.value)}
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="height">{t('records.n1HeightCm')}</Label>
                  <Input 
                    id="height" 
                    placeholder={t('records.heightInCm')}
                    value={digitsOnly(watch("height"))}
                    onChange={(e) => setValue("height", digitsOnly(e.target.value), { shouldValidate: true })}
                    onBlur={register("height").onBlur}
                    // {...register("height")}
                    maxLength={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="weight">{t('records.n2WeightKg')}</Label>
                  <Input 
                    id="weight" 
                    placeholder={t('records.weightInKg')}
                    value={digitsOnly(watch("weight"))}
                    onChange={(e) => setValue("weight", digitsOnly(e.target.value), { shouldValidate: true })}
                    onBlur={register("weight").onBlur}
                    // {...register("weight")}
                    maxLength={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastChildBirthDate">{t('records.n3LastChildBirthDate')}</Label>
                  <Input 
                    id="lastChildBirthDate" 
                    type="date"
                    {...register("lastChildBirthDate")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bankAccountNumber">{t('records.n4BankAccountNumber')}</Label>
                  <Input 
                    id="bankAccountNumber" 
                    placeholder={t('records.enterBankAccountNumber')}
                    {...register("bankAccountNumber")}
                    autoComplete="off"
                    className={accountMask}
                    maxLength={30}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ifscCode">{t('records.n5IfscCode')}</Label>
                  <Input 
                    id="ifscCode" 
                    placeholder={t('records.eGSbin0001234')}
                    {...register("ifscCode", {
                      onChange: () => setIfscLookupState({ status: "idle" }),
                    })}
                    onBlur={(e) => { register("ifscCode").onBlur(e); handleIfscBlur(); }}
                    autoComplete="off"
                    className={`uppercase ${ifscMask}`}
                    maxLength={11}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bankName">{t('records.n6BankName')}</Label>
                  <Input 
                    id="bankName" 
                    {...register("bankName")}
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
                <div className="space-y-2">
                  <Label htmlFor="branchName">{t('records.n7BranchName')}</Label>
                  <Input 
                    id="branchName" 
                    {...register("branchName")}
                    maxLength={100}
                    disabled
                    placeholder={t('records.autoFilledFromIfsc')}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Current Policy Information */}
          <Card>
            <CardHeader>
              <SectionTitle icon={ShieldCheck} step={t('common.step', { n: 7 })}>{t('records.currentPolicyInformation')}</SectionTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="policyNumber">{t('records.n1PolicyNumber')}</Label>
                  <Input
                    value={currentPolicy.policyNumber}
                    onChange={(e) => handlePolicyChange("currentPolicy", "policyNumber", e.target.value)}
                    maxLength={30}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="planAndTerm">{t('records.n2PlanTerm')}</Label>
                  <Input
                    value={currentPolicy.planAndTerm}
                    onChange={(e) => handlePolicyChange("currentPolicy", "planAndTerm", e.target.value)}
                    maxLength={100}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="sumAssured">{t('records.n3SumAssured')}</Label>
                  <Input
                    value={currentPolicy.sumAssured}
                    onChange={(e) => handlePolicyChange("currentPolicy", "sumAssured", e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="modeOfPayment">{t('records.n4ModeOfPayment')}</Label>
                  <Select
                    value={currentPolicy.modeOfPayment || ""}
                    onValueChange={(value) => handlePolicyChange("currentPolicy", "modeOfPayment", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t('records.selectPaymentMode')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Monthly">{t('records.monthlyOrENach')}</SelectItem>
                      <SelectItem value="Quarterly">{t('records.quarterly')}</SelectItem>
                      <SelectItem value="Half-Yearly">{t('records.halfYearly')}</SelectItem>
                      <SelectItem value="Yearly">{t('records.yearly')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="branch">{t('records.n5Branch')}</Label>
                  <Input
                    value={currentPolicy.branch}
                    onChange={(e) => handlePolicyChange("currentPolicy", "branch", e.target.value)}
                    maxLength={100}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="lastPaymentDate">{t('records.n6LastPaymentDate')}</Label>
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
              <SectionTitle icon={History} step={t('common.step', { n: 8 })}>{t('records.previousPolicyInformation')}</SectionTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="policyNumber_previousPolicy">{t('records.n1PolicyNumber')}</Label>
                  <Input
                    value={previousPolicy.policyNumber}
                    onChange={(e) => handlePolicyChange("previousPolicy", "policyNumber", e.target.value)}
                    maxLength={30}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="planAndTerm_previousPolicy">{t('records.n2PlanTerm')}</Label>
                  <Input
                    value={previousPolicy.planAndTerm}
                    onChange={(e) => handlePolicyChange("previousPolicy", "planAndTerm", e.target.value)}
                    maxLength={100}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="sumAssured_previousPolicy">{t('records.n3SumAssured')}</Label>
                  <Input
                    value={previousPolicy.sumAssured}
                    onChange={(e) => handlePolicyChange("previousPolicy", "sumAssured", e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="modeOfInstallment_previousPolicy">{t('records.n4ModeOfPayment')}</Label>
                  <Select
                    value={previousPolicy.modeOfPayment || ""}
                    onValueChange={(value) => handlePolicyChange("previousPolicy", "modeOfPayment", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t('records.selectPaymentMode')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Monthly">{t('records.monthlyOrENach')}</SelectItem>
                      <SelectItem value="Quarterly">{t('records.quarterly')}</SelectItem>
                      <SelectItem value="Half-Yearly">{t('records.halfYearly')}</SelectItem>
                      <SelectItem value="Yearly">{t('records.yearly')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="branch_previousPolicy">{t('records.n5Branch')}</Label>
                  <Input
                    value={previousPolicy.branch}
                    onChange={(e) => handlePolicyChange("previousPolicy", "branch", e.target.value)}
                    maxLength={100}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="lastPaymentDate_previousPolicy">{t('records.n6LastPaymentDate')}</Label>
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
              {t('common.cancel')}
            </Button>
            <Button onClick={rhfHandleSubmit(onValid, onInvalid)} className="bg-primary hover:bg-primary-light shadow-sm" disabled={isSubmitting}>
              <Save className="w-4 h-4 mr-2" />
              {isSubmitting ? t('records.saving') : t('records.saveChanges')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditRecordModal;