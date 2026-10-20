import { Check, ChevronDown, Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLanguage } from "@/hooks/useLanguage";
import { LANGUAGES, getLanguageConfig, isSupportedLanguage } from "@/i18n/languages";
import { cn } from "@/lib/utils";
import type { LanguageSwitcherProps } from "@/types/components/LanguageSwitcher.types";

/**
 * Lists every language in the registry (src/i18n/languages.ts), so a new
 * language shows up here with zero UI changes. Each option is labelled in its
 * OWN script (so a Hindi speaker can find "हिन्दी" even while the UI is in
 * English) and carries a `lang` attribute so screen readers pronounce it.
 */
const LanguageSwitcher = ({ type }: LanguageSwitcherProps) => {
  const { language, setLanguage, t } = useLanguage();
  const current = getLanguageConfig(language);
  const label = t("common.language.change");

  // Mobile menu: all options visible at once — fewer taps than a dropdown
  // inside an already-open drawer, and comfortably thumb-sized.
  if (type === "mobile") {
    return (
      <div role="group" aria-label={label} className="grid w-full grid-flow-col auto-cols-fr gap-2">
        {LANGUAGES.map((l) => (
          <Button
            key={l.code}
            type="button"
            variant={l.code === language ? "default" : "outline"}
            size="sm"
            lang={l.code}
            aria-pressed={l.code === language}
            onClick={() => setLanguage(l.code)}
            className="min-h-10 gap-1.5"
          >
            {l.code === language && <Check className="w-4 h-4" aria-hidden />}
            {l.nativeName}
          </Button>
        ))}
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          aria-label={label}
          title={label}
          className={cn("flex items-center gap-2", type === "icon" && "justify-center")}
        >
          <Languages className="w-4 h-4" aria-hidden />
          {type !== "icon" && (
            <>
              <span lang={current.code}>{current.nativeName}</span>
              <ChevronDown className="w-3.5 h-3.5 opacity-60" aria-hidden />
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[10rem]">
        <DropdownMenuRadioGroup
          value={language}
          onValueChange={(v) => isSupportedLanguage(v) && setLanguage(v)}
        >
          {LANGUAGES.map((l) => (
            <DropdownMenuRadioItem key={l.code} value={l.code} lang={l.code} className="cursor-pointer">
              {l.nativeName}
              {l.nativeName !== l.name && (
                <span className="ml-2 text-xs text-muted-foreground" lang="en">
                  {l.name}
                </span>
              )}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSwitcher;
