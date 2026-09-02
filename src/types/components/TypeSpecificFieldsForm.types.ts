
export interface TypeSpecificFieldsFormProps {
  insuranceType: string;
  values: Record<string, string>;
  onChange: (key: string, value: string) => void;
}
