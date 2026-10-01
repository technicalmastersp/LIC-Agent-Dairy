import { Lock } from "lucide-react";
import { isEncryptedValue } from "@/utils/inputValueFormats";

type SensitiveValueProps = {
  /** The raw value from the API — either the real (decrypted) value, or our
   * backend's ciphertext format ("v1:iv:authTag:ciphertext") when the
   * viewer doesn't have permission to see it decrypted. */
  value: string | null | undefined;
  /** How to render the real value when it's NOT encrypted. Defaults to
   * showing it as plain text. */
  render?: (value: string) => React.ReactNode;
  /** Visible characters of ciphertext to show before truncating with "…". */
  maxCipherChars?: number;
  /** Shown when value is null/empty. */
  placeholder?: string;
  className?: string;
};

/**
 * Renders a field that may or may not be encrypted ciphertext, depending on
 * whether the viewer has permission to see it decrypted (see backend
 * utils/sensitiveFields.js — canViewSensitiveData). Real values render
 * however the caller wants; ciphertext is truncated and visually marked as
 * encrypted instead of being dumped in full or run through a formatter that
 * would garble it into something that looks like a plausible real value.
 * The full ciphertext is still available via the title tooltip.
 */
export function SensitiveValue({
  value,
  render,
  maxCipherChars = 22,
  placeholder = "—",
  className,
}: SensitiveValueProps) {
  if (!value) return <span className={className}>{placeholder}</span>;

  if (!isEncryptedValue(value)) {
    return <span className={className}>{render ? render(value) : value}</span>;
  }

  const truncated = value.length > maxCipherChars ? `${value.slice(0, maxCipherChars)}…` : value;
  return (
    <span
      className={`inline-flex items-center gap-1 font-mono text-xs opacity-70 ${className || ""}`}
      title={value}
    >
      <Lock className="h-3 w-3 shrink-0" />
      {truncated}
    </span>
  );
}
