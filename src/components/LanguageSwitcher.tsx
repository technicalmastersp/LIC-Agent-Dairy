import { Button } from "@/components/ui/button";
import { useLanguage } from "@/hooks/useLanguage";
import { Languages } from "lucide-react";

type LanguageSwitcherProps = {
  type?: "icon" | "mobile";
};
const LanguageSwitcher = ({ type }: LanguageSwitcherProps) => {
  const { language, setLanguage } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'hi' : 'en');
  };

  if (type === 'icon') {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={toggleLanguage}
        className="flex items-center justify-center"
      >
        <Languages className="w-4 h-4" />
      </Button>
    );
  } 
  if (type === 'mobile') {
    return (
      <Button
        variant="outline" size="sm"
        onClick={toggleLanguage}
        className="w-full flex items-center gap-2"
      >
        <Languages className="w-4 h-4" />
        {language === 'en' ? 'हिन्दी' : 'English'}
      </Button>
    );
  }
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggleLanguage}
      className="flex items-center gap-2"
    >
      <Languages className="w-4 h-4" />
      {language === 'en' ? 'हिन्दी' : 'English'}
    </Button>
  );
};

export default LanguageSwitcher;