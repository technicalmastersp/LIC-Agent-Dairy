export type BusinessCardTheme = "classic" | "teal" | "gold" | "gradient";

export interface BusinessCardTemplate {
  id: BusinessCardTheme;
  label: string;
  swatch: string; // small CSS gradient/color used for the theme-picker chip
}

export interface BusinessCardProps {
  name: string;
  roleLabel: string;
  mobileNumber?: string;
  email?: string;
  easyId?: string;
  profileImage?: string | null;
  /** Free-text note shown below the Agent ID. Capped at 150 characters — see Profile.tsx. */
  note?: string;
  theme: BusinessCardTheme;
  /** Visually locked/blurred preview state — used pre-100% completion and on the public demo. */
  locked?: boolean;
  className?: string;
}

export interface BusinessCardHandle {
  /** Returns a PNG data URL of the current canvas, or null if not yet rendered. */
  toDataURL: () => string | null;
}
