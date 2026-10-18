
export type AbbreviationItem = {
  abbreviation: string;
  full_form: string;
  description: string;
};
export type InsuranceAbbreviationsData = {
  Insurance_Abbreviations: AbbreviationItem[];
  Insurance_Internal_Codes: AbbreviationItem[];
  Private_Insurers: AbbreviationItem[];
  Common_Policy_Terms: AbbreviationItem[];
};
