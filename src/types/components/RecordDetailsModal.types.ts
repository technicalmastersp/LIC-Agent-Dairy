export interface FamilyMember {
  relationship?: string;
  currentAge?: string | number;
  health?: string;
  deathAge?: string | number;
  reason?: string;
}
export interface PolicyDetails {
  policyNumber?: string;
  planAndTerm?: string;
  sumAssured?: string | number;
  modeOfPayment?: string;
  branch?: string;
  lastPaymentDate?: string;
  nextDueDate?: string;
}
export interface CustomFieldValue {
  key: string;
  label: string;
  value?: string | number;
}
export interface DisplayRecord {
  name?: string;
  date?: string;
  aadhaarNumber?: string;
  panNumber?: string;
  email?: string;
  birthPlace?: string;
  fatherName?: string;
  motherName?: string;
  spouseName?: string;
  address?: string;
  dateOfBirth?: string;
  age?: string;
  aadhaarLinkedMobileNumber?: string;
  nameOfNominee?: string;
  ageOfNominee?: string;
  relationName?: string;
  educationalQualification?: string;
  occupation?: string;
  designationOfPolicyHolder?: string;
  annualIncome?: string;
  periodOfService?: string;
  employerName?: string;
  height?: string;
  weight?: string;
  lastChildBirthDate?: string;
  bankAccountNumber?: string;
  ifscCode?: string;
  bankName?: string;
  branchName?: string;
  createdAt?: string;
  insuranceType?: string;
  customInsuranceTypeName?: string;
  customFields?: CustomFieldValue[];
  typeSpecificData?: Record<string, string>;
  familyMembers?: FamilyMember[];
  currentPolicy?: PolicyDetails;
  previousPolicy?: PolicyDetails;
}
export interface RecordDetailsModalProps {
  record: DisplayRecord | null;
  isOpen: boolean;
  onClose: () => void;
}
export type IconType = React.ComponentType<{ className?: string }>;