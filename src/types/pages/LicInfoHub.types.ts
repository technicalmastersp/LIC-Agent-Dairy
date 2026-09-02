
export type AbbreviationItem = {
  abbreviation: string;
  full_form: string;
  description: string;
};
export type LICAbbreviationsData = {
  LIC_Abbreviations: AbbreviationItem[];
  LIC_Internal_Codes: AbbreviationItem[];
  Private_Insurers: AbbreviationItem[];
  Common_Policy_Terms: AbbreviationItem[];
};
