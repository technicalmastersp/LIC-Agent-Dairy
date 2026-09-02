import { useTheme } from "next-themes";
import { Moon, Sun, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import type { ThemeToggleProps } from "@/types/components/ThemeToggle.types";
const ThemeToggle = ({ type }: ThemeToggleProps) => {
  const { setTheme } = useTheme();

  const items = (
    <>
      <DropdownMenuItem onClick={() => setTheme("light")}>
        <Sun className="w-4 h-4 mr-2" /> Light
      </DropdownMenuItem>
      <DropdownMenuItem onClick={() => setTheme("dark")}>
        <Moon className="w-4 h-4 mr-2" /> Dark
      </DropdownMenuItem>
      <DropdownMenuItem onClick={() => setTheme("system")}>
        <Monitor className="w-4 h-4 mr-2" /> System
      </DropdownMenuItem>
    </>
  );

  if (type === "mobile") {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="w-full flex items-center gap-2">
            <Sun className="w-4 h-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute w-4 h-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span>Theme</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">{items}</DropdownMenuContent>
      </DropdownMenu>
    );
  }

  // Default / "icon" — same compact trigger, kept as one variant since
  // there's no text-label form needed on desktop the way LanguageSwitcher
  // has (theme has 3 states, not a single toggle).
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="relative flex items-center justify-center"
          aria-label="Toggle theme"
        >
          <Sun className="w-4 h-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute w-4 h-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">{items}</DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ThemeToggle;