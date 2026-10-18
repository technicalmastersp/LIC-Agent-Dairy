import { Lock } from "lucide-react";
import { isEncryptedValue } from "@/utils/inputValueFormats";
import { maskValue } from "@/utils/maskSensitive";
import { useSensitiveMask } from "@/hooks/useSensitiveMask";
import type { SensitiveFieldKey } from "@/config/sensitiveDataRegistry";

type SensitiveValueProps = {
  /** The raw value from the API — either the real (decrypted) value, or our
   * backend's ciphertext format ("v1:iv:authTag:ciphertext") when the
   * viewer doesn't have permission to see it decrypted. */
  value: string | number | null | undefined;
  /** Which registered sensitive field this is (config/sensitiveDataRegistry.ts).
   * When set, the value is hidden whenever the Hide/Show button is in its
   * "hidden" state. Omit for values that only need the ciphertext handling. */
  field?: SensitiveFieldKey;
  /** How to render the real value when it's NOT encrypted and NOT hidden.
   * Defaults to showing it as plain text. */
  render?: (value: string) => React.ReactNode;
  /** Visible characters of ciphertext to show before truncating with "…". */
  maxCipherChars?: number;
  /** Shown when value is null/empty. */
  placeholder?: string;
  className?: string;
};

/**
 * Renders a field that may be (a) ciphertext, because the viewer lacks
 * permission to see it decrypted (see backend utils/sensitiveFields.js —
 * canViewSensitiveData), or (b) hidden by the user's Hide/Show choice.
 *
 * Real values render however the caller wants; ciphertext is truncated and
 * visually marked as encrypted instead of being dumped in full or run through a
 * formatter that would garble it into something that looks like a plausible
 * real value. The full ciphertext is still available via the title tooltip.
 * When the user has chosen to hide sensitive data and `field` is given, a real
 * value is replaced by its masked form (see utils/maskSensitive.ts) — the raw
 * value is not placed in the DOM at all, so it can't be read via copy or
 * inspect-element on the page.
 */
export function SensitiveValue({
  value,
  field,
  render,
  maxCipherChars = 22,
  placeholder = "—",
  className,
}: SensitiveValueProps) {
  const { hidden } = useSensitiveMask();
  const text = value === null || value === undefined ? "" : String(value);

  if (!text) return <span className={className}>{placeholder}</span>;

  if (!isEncryptedValue(text)) {
    if (field && hidden) {
      return (
        <span className={className} data-sensitive-hidden="true" title="Hidden — use the eye button to show">
          {maskValue(field, text)}
        </span>
      );
    }
    return <span className={className}>{render ? render(text) : text}</span>;
  }

  const truncated = text.length > maxCipherChars ? `${text.slice(0, maxCipherChars)}…` : text;
  return (
    <span
      className={`inline-flex items-center gap-1 font-mono text-xs opacity-70 ${className || ""}`}
      title={text}
    >
      <Lock className="h-3 w-3 shrink-0" />
      {truncated}
    </span>
  );
}
