
export interface FooterLink {
  label: string;
  to: string;
}
export interface FooterSectionProps {
  title: string;
  icon?: React.ElementType;
  links?: FooterLink[];
  children?: React.ReactNode;
}
