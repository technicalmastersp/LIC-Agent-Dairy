import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSensitiveMask } from "@/hooks/useSensitiveMask";

/**
 * The Hide/Show sensitive-data button (Home page + Admin panel).
 * Open eye  = sensitive data is visible  (press to hide)
 * Closed eye = sensitive data is hidden  (press to show)
 * Renders nothing when the backend master switch is off. What gets masked is
 * defined in config/sensitiveDataRegistry.ts; the choice is saved in the DB.
 *
 *  variant "labelled" — outline button with a text label (Home)
 *  variant "icon"     — compact icon-only button (admin mobile header)
 */
const PrivacyToggleButton = ({ variant = "labelled", className = "" }: { variant?: "labelled" | "icon"; className?: string }) => {
  const { enabled, hidden, saving, toggle } = useSensitiveMask();
  if (!enabled) return null;

  const action = hidden ? "Show sensitive data" : "Hide sensitive data";
  const Icon = hidden ? EyeOff : Eye;

  if (variant === "icon") {
    return (
      <Button
        type="button" variant="ghost" size="icon" onClick={toggle} disabled={saving}
        aria-pressed={hidden} aria-label={action} title={action}
        data-testid="privacy-toggle"
        className={`h-9 w-9 ${className}`}
      >
        <Icon className="w-5 h-5" aria-hidden="true" />
      </Button>
    );
  }

  return (
    <Button
      type="button" variant="outline" size="sm" onClick={toggle} disabled={saving}
      aria-pressed={hidden} aria-label={action} title={action}
      data-testid="privacy-toggle"
      className={`gap-2 shrink-0 ${className}`}
    >
      <Icon className="w-4 h-4" aria-hidden="true" />
      <span className="text-xs">{hidden ? "Show data" : "Hide data"}</span>
    </Button>
  );
};

export default PrivacyToggleButton;
