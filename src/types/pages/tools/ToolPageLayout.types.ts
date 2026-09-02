import { ReactNode } from "react";

export interface ToolPageLayoutProps {
  icon: React.ElementType;
  title: string;
  description: string;
  children: ReactNode;
  accent?: string; // tailwind color stem, e.g. "blue", "emerald" — defaults to primary
}
