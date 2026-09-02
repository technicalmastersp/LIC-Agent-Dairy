import type { CustomFieldValue } from "@/types/config/insuranceTypes.types";

export interface CustomFieldsBuilderProps {
  customTypeName: string;
  onCustomTypeNameChange: (name: string) => void;
  fields: CustomFieldValue[];
  onFieldsChange: (fields: CustomFieldValue[]) => void;
}
