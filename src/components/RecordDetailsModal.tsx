import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { makeInsuranceText } from "@/i18n/insuranceText";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import PaymentHistoryModal from "@/components/PaymentHistoryModal";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import {
  Calendar, User, MapPin, Briefcase, Phone, CreditCard, HomeIcon,
  IdCard, HeartPulse, Users, ShieldCheck, History, Receipt,
} from "lucide-react";
import siteConfig from "@/config/siteConfig";
import { convertDateToIndianFormat } from "@/utils/tools";
import { formatAadhaar, formatIndianNumber, formatMobileNumber } from "@/utils/inputValueFormats";
import { SensitiveValue } from "@/components/SensitiveValue";
import { getInsuranceTypeDef, isOtherInsuranceType } from "@/config/insuranceTypes";
import type { FamilyMember, CustomFieldValue, RecordDetailsModalProps, IconType } from "@/types/components/RecordDetailsModal.types";
import { useLanguage } from "@/hooks/useLanguage";
const SectionTitle = ({ icon: Icon, children }: { icon: IconType; children: React.ReactNode }) => (
  <CardTitle className="text-form-header flex items-center gap-2.5">
    <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
      <Icon className="w-3.5 h-3.5 text-primary" />
    </div>
    <span>{children}</span>
  </CardTitle>
);

const RecordDetailsModal = ({ record, isOpen, onClose, hidePaymentHistory = false, onPaymentsChanged }: RecordDetailsModalProps) => {
  const { t, tOr } = useLanguage();
  const ins = makeInsuranceText(tOr);
  const [paymentHistoryOpen, setPaymentHistoryOpen] = useState(false);
  if (!record) return null;

  const InfoItem = ({ icon: Icon, label, value }: { icon: IconType; label: string; value?: React.ReactNode }) => (
    <div className="flex items-start space-x-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
      <Icon className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</p>
        <p className="text-sm break-words mt-0.5">{value || "-"}</p>
      </div>
    </div>
  );

  return (
    <>
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="flex flex-wrap items-center gap-2 text-form-header">
            <User className="w-5 h-5 shrink-0" />
            <span className="break-words">{t('records.recordDetails2', { name: record.name })}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header Card */}
          <Card className="bg-gradient-to-r from-primary/10 to-accent/20 border-primary/10">
            <CardHeader>
              <CardTitle className="text-lg text-form-header flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <img src={siteConfig.logo_icon} alt="site-logo" />
                </div>
                &nbsp;{siteConfig.title}
              </CardTitle>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                <Badge variant="outline" className="bg-background/60 border-primary/30 text-form-header font-medium">
                  {isOtherInsuranceType(record.insuranceType)
                    ? (record.customInsuranceTypeName || t('records.customInsurance'))
                    : (ins.typeNameById(record.insuranceType ?? "", record.insuranceType ?? "") || t('records.lifeInsurance'))}
                </Badge>
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  {t('records.createdOn', { date: convertDateToIndianFormat(record.createdAt) })}
                </span>
                {record.currentPolicy?.nextDueDate && (
                  <Badge className="bg-amber-100 text-amber-700 border border-amber-200">
                    {t('records.paymentDue', { value: convertDateToIndianFormat(record.currentPolicy?.nextDueDate) })}</Badge>
                )}
              </div>
            </CardHeader>
          </Card>

          {/* Basic Details */}
          <Card>
            <CardHeader>
              <SectionTitle icon={IdCard}>{t('common.basicDetails')}</SectionTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <InfoItem icon={User} label={t('records.date')} value={convertDateToIndianFormat(record.date)} />
                <InfoItem icon={Calendar} label={t('records.aadhaarNumber')} value={<SensitiveValue field="aadhaarNumber" value={record.aadhaarNumber} render={formatAadhaar} />} />
                <InfoItem icon={MapPin} label={t('records.panNumber')} value={<SensitiveValue field="panNumber" value={record.panNumber} />} />
                <InfoItem icon={User} label={t('records.eMail')} value={<SensitiveValue field="email" value={record.email} />} />
              </div>
            </CardContent>
          </Card>

          {/* Type-Specific / Custom Details */}
          {isOtherInsuranceType(record.insuranceType) ? (
            record.customFields && record.customFields.length > 0 && (
              <Card>
                <CardHeader>
                  <SectionTitle icon={ShieldCheck}>
                    {t('records.details2', { value: record.customInsuranceTypeName || "Custom" })}
                  </SectionTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {record.customFields.map((f: CustomFieldValue) => (
                      <InfoItem key={f.key} icon={IdCard} label={f.label} value={String(f.value ?? "")} />
                    ))}
                  </div>
                </CardContent>
              </Card>
            )
          ) : (
            (getInsuranceTypeDef(record.insuranceType)?.fields.length ?? 0) > 0 && (
              <Card>
                <CardHeader>
                  <SectionTitle icon={ShieldCheck}>
                    {t('records.details2', { value: getInsuranceTypeDef(record.insuranceType) ? ins.typeLabel(getInsuranceTypeDef(record.insuranceType)!) : record.insuranceType })}
                  </SectionTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {(getInsuranceTypeDef(record.insuranceType)?.fields || []).map((field) => (
                      <InfoItem
                        key={field.key}
                        icon={IdCard}
                        label={ins.fieldLabel(record.insuranceType ?? "", field)}
                        value={record.typeSpecificData?.[field.key] ? (field.type === "select" ? ins.option(String(record.typeSpecificData[field.key])) : String(record.typeSpecificData[field.key])) : undefined}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            )
          )}

          {/* Personal Information */}
          <Card>
            <CardHeader>
              <SectionTitle icon={User}>{t('records.personalInformation')}</SectionTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <InfoItem icon={User} label={t('records.fullName')} value={record.name || ""} />
                <InfoItem icon={MapPin} label={t('records.birthPlace')} value={record.birthPlace || ""} />
                <InfoItem icon={User} label={t('records.fatherSName')} value={record.fatherName || ""} />
                <InfoItem icon={User} label={t('records.motherSName')} value={record.motherName || ""} />
                <InfoItem icon={User} label={t('records.spouseSName')} value={record.spouseName || ""} />
                <InfoItem icon={MapPin} label={t('records.address')} value={<SensitiveValue field="address" value={record.address} />} />
                <InfoItem icon={Calendar} label={t('records.dateOfBirth')} value={<SensitiveValue field="dateOfBirth" value={convertDateToIndianFormat(record.dateOfBirth)} />} />
                <InfoItem icon={User} label={t('common.age')} value={record.age || ""} />
                <InfoItem icon={Phone} label={t('records.aadhaarLinkedMobileNumber')} value={<SensitiveValue field="mobileNumber" value={record.aadhaarLinkedMobileNumber} render={formatMobileNumber} />} />
                <InfoItem icon={User} label={t('records.nameOfNominee')} value={record.nameOfNominee || ""} />
                <InfoItem icon={User} label={t('records.ageOfNominee')} value={record.ageOfNominee || ""} />
                <InfoItem icon={User} label={t('records.relationName')} value={record.relationName || ""} />
              </div>
            </CardContent>
          </Card>

          {/* Education & Occupation */}
          <Card>
            <CardHeader>
              <SectionTitle icon={Briefcase}>{t('records.educationOccupation')}</SectionTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <InfoItem icon={Briefcase} label={t('records.educationalQualification')} value={record.educationalQualification || ""} />
                <InfoItem icon={Briefcase} label={t('records.occupation')} value={record.occupation || ""} />
                <InfoItem icon={Briefcase} label={t('records.designation')} value={record.designationOfPolicyHolder || ""} />
                <InfoItem icon={Briefcase} label={t('records.annualIncome')} value={<SensitiveValue field="annualIncome" value={record.annualIncome} render={(v) => formatIndianNumber(v)} />} />
                <InfoItem icon={Briefcase} label={t('records.periodOfService')} value={record.periodOfService || ""} />
                <InfoItem icon={Briefcase} label={t('records.employerName')} value={record.employerName || ""} />
              </div>
            </CardContent>
          </Card>

          {/* Physical Details */}
          <Card>
            <CardHeader>
              <SectionTitle icon={HeartPulse}>{t('records.physicalDetails')}</SectionTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <InfoItem icon={User} label={t('records.height')} value={record.height} />
                <InfoItem icon={User} label={t('records.weight')} value={record.weight} />
                <InfoItem icon={Calendar} label={t('records.lastChildBirthDateOnly')} value={convertDateToIndianFormat(record.lastChildBirthDate) || ""} />
              </div>
            </CardContent>
          </Card>

          {/* Banking Details */}
          <Card>
            <CardHeader>
              <SectionTitle icon={CreditCard}>{t('records.bankingInformation')}</SectionTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <InfoItem icon={CreditCard} label={t('records.bankAccountNumber')} value={<SensitiveValue field="bankAccountNumber" value={record.bankAccountNumber} />} />
                <InfoItem icon={CreditCard} label={t('records.ifscCode')} value={<SensitiveValue field="ifscCode" value={record.ifscCode} />} />
                <InfoItem icon={HomeIcon} label={t('records.bankName')} value={record.bankName} />
                <InfoItem icon={MapPin} label={t('records.branchName')} value={record.branchName} />
              </div>
            </CardContent>
          </Card>

          {/* Family Details */}
          {record.familyMembers && record.familyMembers.length > 0 && (
            <Card>
              <CardHeader>
                <SectionTitle icon={Users}>{t('records.familyDetails')}</SectionTitle>
              </CardHeader>
              <CardContent>
                {/* Mobile: stacked cards (no horizontal scrolling) */}
                <div className="md:hidden space-y-3">
                  {record.familyMembers.map((member: FamilyMember, index: number) => (
                    <div key={index} className="rounded-lg border border-table-border p-3 bg-muted/20 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-medium">{member.relationship || t('records.member', { value: index + 1 })}</span>
                        {member.health === "Good" ? (
                          <Badge className="bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs">{t('common.good')}</Badge>
                        ) : member.health === "Not Good" ? (
                          <Badge className="bg-red-100 text-red-700 border border-red-200 text-xs">{t('common.notGood')}</Badge>
                        ) : null}
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{t('records.currentAge')}</p>
                          <p className="mt-0.5">{member.currentAge || "-"}</p>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{t('records.ageAtDeathYear')}</p>
                          <p className="mt-0.5">{member.deathAge || "-"}</p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{t('records.reason')}</p>
                          <p className="mt-0.5 break-words">{member.reason || "-"}</p>
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
                        <TableHead className="border border-table-border">{t('records.relationship')}</TableHead>
                        <TableHead className="border border-table-border">{t('records.currentAge')}</TableHead>
                        <TableHead className="border border-table-border">{t('records.healthStatus')}</TableHead>
                        <TableHead className="border border-table-border">{t('records.ageAtDeathYear')}</TableHead>
                        <TableHead className="border border-table-border">{t('records.reason')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {record.familyMembers.map((member: FamilyMember, index: number) => (
                        <TableRow key={index} className="hover:bg-muted/40">
                          <TableCell className="border border-table-border font-medium">
                            {member.relationship}
                          </TableCell>
                          <TableCell className="border border-table-border">
                            {member.currentAge || "-"}
                          </TableCell>
                          <TableCell className="border border-table-border">
                            {member.health === "Good" ? (
                              <Badge className="bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs">{t('common.good')}</Badge>
                            ) : member.health === "Not Good" ? (
                              <Badge className="bg-red-100 text-red-700 border border-red-200 text-xs">{t('common.notGood')}</Badge>
                            ) : "-"}
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
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <SectionTitle icon={ShieldCheck}>{t('records.currentPolicyDetails')}</SectionTitle>
                  {!hidePaymentHistory && record.recordId && (
                    <Button variant="outline" size="sm" onClick={() => setPaymentHistoryOpen(true)}>
                      <Receipt className="w-4 h-4 mr-1.5" /> {" "}{t('records.paymentHistory')}
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {/* Mobile: stacked card */}
                <div className="md:hidden rounded-lg border border-table-border p-3 bg-muted/20 space-y-3">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <Badge variant="outline" className="font-mono">
                      <SensitiveValue field="policyNumber" value={record.currentPolicy.policyNumber} placeholder="N/A" />
                    </Badge>
                    <span className="text-sm font-medium text-emerald-700">
                      <SensitiveValue field="sumAssured" value={record.currentPolicy.sumAssured} placeholder="₹0" render={(v) => `₹${formatIndianNumber(v) || "0"}`} />
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{t('records.planTerm')}</p>
                      <p className="mt-0.5 break-words">{record.currentPolicy.planAndTerm || "-"}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{t('records.modeOfPayment')}</p>
                      <p className="mt-0.5">{record.currentPolicy.modeOfPayment || "-"}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{t('common.branch')}</p>
                      <p className="mt-0.5 break-words">{record.currentPolicy.branch || "-"}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{t('records.lastPayment')}</p>
                      <p className="mt-0.5">{convertDateToIndianFormat(record.currentPolicy.lastPaymentDate) || "-"}</p>
                    </div>
                  </div>
                </div>

                {/* Desktop: table */}
                <div className="hidden md:block overflow-x-auto rounded-lg border border-table-border">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-table-header">
                        <TableHead className="border border-table-border">{t('common.policyNumber')}</TableHead>
                        <TableHead className="border border-table-border">{t('records.planTerm')}</TableHead>
                        <TableHead className="border border-table-border">{t('common.sumAssured')}</TableHead>
                        <TableHead className="border border-table-border">{t('records.modeOfPayment')}</TableHead>
                        <TableHead className="border border-table-border">{t('common.branch')}</TableHead>
                        <TableHead className="border border-table-border">{t('records.lastPayment')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow className="hover:bg-muted/40">
                        <TableCell className="border border-table-border">
                          <Badge variant="outline" className="font-mono">
                            <SensitiveValue field="policyNumber" value={record.currentPolicy.policyNumber} placeholder="N/A" />
                          </Badge>
                        </TableCell>
                        <TableCell className="border border-table-border">
                          {record.currentPolicy.planAndTerm || "-"}
                        </TableCell>
                        <TableCell className="border border-table-border font-medium text-emerald-700">
                          <SensitiveValue field="sumAssured" value={record.currentPolicy.sumAssured} placeholder="₹0" render={(v) => `₹${formatIndianNumber(v) || "0"}`} />
                        </TableCell>
                        <TableCell className="border border-table-border">
                          {record.currentPolicy.modeOfPayment || "-"}
                        </TableCell>
                        <TableCell className="border border-table-border">
                          {record.currentPolicy.branch || "-"}
                        </TableCell>
                        <TableCell className="border border-table-border">
                          {convertDateToIndianFormat(record.currentPolicy.lastPaymentDate) || "-"}
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
                <SectionTitle icon={History}>{t('records.previousPolicyDetails')}</SectionTitle>
              </CardHeader>
              <CardContent>
                {/* Mobile: stacked card */}
                <div className="md:hidden rounded-lg border border-table-border p-3 bg-muted/20 space-y-3">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <Badge variant="outline" className="font-mono">
                      <SensitiveValue field="policyNumber" value={record.previousPolicy.policyNumber} placeholder="N/A" />
                    </Badge>
                    <span className="text-sm font-medium text-emerald-700">
                      <SensitiveValue field="sumAssured" value={record.previousPolicy.sumAssured} placeholder="₹0" render={(v) => `₹${formatIndianNumber(v) || "0"}`} />
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{t('records.planTerm')}</p>
                      <p className="mt-0.5 break-words">{record.previousPolicy.planAndTerm || "-"}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{t('records.modeOfPayment')}</p>
                      <p className="mt-0.5">{record.previousPolicy.modeOfPayment || "-"}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{t('common.branch')}</p>
                      <p className="mt-0.5 break-words">{record.previousPolicy.branch || "-"}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{t('records.lastPayment')}</p>
                      <p className="mt-0.5">{convertDateToIndianFormat(record.previousPolicy.lastPaymentDate) || "-"}</p>
                    </div>
                  </div>
                </div>

                {/* Desktop: table */}
                <div className="hidden md:block overflow-x-auto rounded-lg border border-table-border">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-table-header">
                        <TableHead className="border border-table-border">{t('common.policyNumber')}</TableHead>
                        <TableHead className="border border-table-border">{t('records.issueDate')}</TableHead>
                        <TableHead className="border border-table-border">{t('common.sumAssured')}</TableHead>
                        <TableHead className="border border-table-border">{t('records.modeOfPayment')}</TableHead>
                        <TableHead className="border border-table-border">{t('common.branch')}</TableHead>
                        <TableHead className="border border-table-border">{t('records.lastPayment')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow className="hover:bg-muted/40">
                        <TableCell className="border border-table-border">
                          <Badge variant="outline" className="font-mono">
                            <SensitiveValue field="policyNumber" value={record.previousPolicy.policyNumber} placeholder="N/A" />
                          </Badge>
                        </TableCell>
                        <TableCell className="border border-table-border">
                          {record.previousPolicy.planAndTerm || "-"}
                        </TableCell>
                        <TableCell className="border border-table-border font-medium text-emerald-700">
                          <SensitiveValue field="sumAssured" value={record.previousPolicy.sumAssured} placeholder="₹0" render={(v) => `₹${formatIndianNumber(v) || "0"}`} />
                        </TableCell>
                        <TableCell className="border border-table-border">
                          {record.previousPolicy.modeOfPayment || "-"}
                        </TableCell>
                        <TableCell className="border border-table-border">
                          {record.previousPolicy.branch || "-"}
                        </TableCell>
                        <TableCell className="border border-table-border">
                          {convertDateToIndianFormat(record.previousPolicy.lastPaymentDate) || "-"}
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

    {/* Payments for the current policy — hidden where the viewer isn't the record's owner (admin) */}
    {!hidePaymentHistory && record.recordId && (
      <PaymentHistoryModal
        record={record}
        isOpen={paymentHistoryOpen}
        onClose={() => setPaymentHistoryOpen(false)}
        onChanged={onPaymentsChanged}
      />
    )}
    </>
  );
};

export default RecordDetailsModal;