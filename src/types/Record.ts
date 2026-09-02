import type { CustomFieldValue } from "@/types/config/insuranceTypes.types";
interface FamilyMember {
  relationship: string;
  currentAge: string;
  health: string;
  deathAge: string;
  reason: string;
}

export interface Record {
  id: string;
  _id?: string;
  date: string;
  aadhaarNumber: string;
  panNumber: string;
  email: string;
  name: string;
  birthPlace: string;
  fatherName: string;
  motherName: string;
  spouseName: string;
  address: string;
  dateOfBirth: string;
  age: string;
  occupation: string;
  educationalQualification: string;
  designationOfPolicyHolder: string;
  annualIncome: string;
  periodOfService: string;
  employerName: string;
  aadhaarLinkedMobileNumber: string;
  nameOfNominee: string;
  ageOfNominee: string;
  relationName: string;
  lastChildBirthDate: string;
  height: string;
  weight: string;
  bankAccountNumber: string;
  ifscCode: string;
  bankName: string;
  branchName: string;
  recordId?: string;
  familyMembers?: FamilyMember[];

  currentPolicy : {
    policyNumber: string;
    planAndTerm: string;
    sumAssured: string;
    modeOfPayment: string;
    branch: string;
    lastPaymentDate: string;
  }

  previousPolicy : {
    policyNumber: string;
    planAndTerm: string;
    sumAssured: string;
    modeOfPayment: string;
    branch: string;
    lastPaymentDate: string;
  }
  createdAt: string;

  insuranceType?: string;
  customInsuranceTypeName?: string;
  typeSpecificData?: globalThis.Record<string, string>;
  customFields?: CustomFieldValue[];
}