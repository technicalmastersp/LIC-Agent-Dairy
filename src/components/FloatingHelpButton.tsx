import { Link, useLocation } from "react-router-dom";
import { LifeBuoy } from "lucide-react";

const FloatingHelpButton = () => {
  const location = useLocation();
  if (location.pathname === "/help-support" || location.pathname.startsWith("/admin")) {
    return null;
  }

  return (
    // This button is mounted at the App.tsx level, outside any page's own
    // <main>/<nav>/<footer> — without its own landmark it fails axe's
    // "region" rule (moderate) on every page. `nav` is appropriate since
    // it's genuinely a persistent navigation shortcut, not page content.
    <nav aria-label="Quick help">
      <Link
        to="/help-support"
        title="Help & Support"
        className="fixed bottom-5 right-5 z-50 flex items-center gap-2 bg-primary hover:bg-primary-light text-primary-foreground rounded-full shadow-lg hover:shadow-xl transition-all px-4 py-3 group"
      >
        <LifeBuoy className="w-5 h-5" />
        <span className="max-w-0 overflow-hidden group-hover:max-w-[100px] transition-all duration-300 whitespace-nowrap text-sm font-medium">
          Need help?
        </span>
      </Link>
    </nav>
  );
};

export default FloatingHelpButton;