import { Link } from "react-router-dom";
import { Mail, MapPin, Globe } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { isAuthenticated } from "@/utils/auth";
import siteConfig from "@/config/siteConfig";

// Reusable component for a group of links
interface FooterLink {
  label: string;
  to: string;
}

interface FooterSectionProps {
  title: string;
  links?: FooterLink[];
  children?: React.ReactNode;
}

const FooterSection = ({ title, links, children }: FooterSectionProps) => (
  console.log(title),
  
  <div className={title == "About Company" || title == "कंपनी के बारे में" ? "md:max-w-44" : ""}>
    <h3 className="text-lg font-semibold mb-4 text-accent">{title}</h3>
    {links && (
      <div className="text-sm space-y-2">
        {links.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className="block hover:text-accent transition-colors"
          >
            {link.label}
          </Link>
        ))}
      </div>
    )}
    {children && <div className="text-sm mt-2">{children}</div>}
  </div>
);

const Footer = () => {
  const { t } = useLanguage();
  const authenticated = isAuthenticated();

  // Data-driven link structure
  const quickLinks: FooterLink[] = authenticated
    ? [
        { label: t("home"), to: "/" },
        { label: t("addRecord"), to: "/add-record" },
        { label: t("viewRecords"), to: "/view-records" },
        { label: t("profile"), to: "/profile" },
      ]
    : [
        { label: t("login"), to: "/login" },
        { label: t("signup"), to: "/signup" },
      ];

  const otherLinks: FooterLink[] = [
    ...(authenticated
      ? [{ label: t("currentMonthDue"), to: "/" }]
      : []),
    { label: t("ourPlans"), to: "/our-plans" },
    { label: t("bestInfoHub"), to: "/lic-info-hub" },
    { label: t("aboutUs"), to: "/about" },
    { label: t("referral"), to: "/referral-program" },
  ];

  const features = [
    t("securePolicyManagement"),
    t("multiLanguageSupport"),
    t("userAuthentication"),
    t("dataExportImport"),
    t("searchFilterRecords"),
    t("realTimeUpdates"),
  ];

  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-primary text-white mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:justify-between gap-8">
          {/* Quick Links */}
          <FooterSection title={t("quickLinks")} links={quickLinks} />

          {/* Other Links */}
          <FooterSection title={t("otherLinks")} links={otherLinks} />

          {/* Contact Info */}
          <FooterSection title={t("contactInfo")}>
            <div className="flex flex-col space-y-3">
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4" />
                <span>{siteConfig.supportEmail}</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4" />
                <span>{t("officeAddress")}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Globe className="w-4 h-4" />
                <span>{siteConfig.productionUrl}</span>
              </div>
            </div>
          </FooterSection>

          {/* Features */}
          <FooterSection title={t("features")}>
            <ul className="text-sm space-y-1">
              {features.map((feature, idx) => (
                <li key={idx}>✓ {feature}</li>
              ))}
            </ul>
          </FooterSection>

          {/* Company Info */}
          <FooterSection title={t("aboutCompany")}>
            <p className="text-sm mb-4">
              {t("companyDescription")}
            </p>
            <div className="text-xs text-gray-300">
              <p>© 2025 - {currentYear} {siteConfig.companyName}</p>
              <p>{t("allRightsReserved")}</p>
            </div>
          </FooterSection>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/20 mt-8 pt-4 text-center text-sm">
          {/* <p>{t("footerTagline")}</p> */}
          <p>{"footerTagline"}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;