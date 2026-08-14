import { Link, useLocation } from "react-router-dom";
import { LifeBuoy } from "lucide-react";

const FloatingHelpButton = () => {
  const location = useLocation();
  if (location.pathname === "/help-support" || location.pathname.startsWith("/admin")) {
    return null;
  }

  return (
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
  );
};

export default FloatingHelpButton;