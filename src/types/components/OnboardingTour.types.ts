import type { TranslationKey } from "@/types/i18n.types";

export interface TourStep {
  target: string;
  /** i18n keys, translated at render time (config lives at module scope, where hooks cannot run). */
  title: TranslationKey;
  body: TranslationKey;
}
export interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}
