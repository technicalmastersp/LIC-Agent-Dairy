import { Link } from "react-router-dom";
import { Mail, MapPin, Globe, Compass, Link2, Sparkles, Building2 } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { isAuthenticated } from "@/utils/auth";
import siteConfig from "@/config/siteConfig";

interface FooterLink {
  label: string;
  to: string;
}

interface FooterSectionProps {
  title: string;
  icon?: React.ElementType;
  links?: FooterLink[];
  children?: React.ReactNode;
}

const FooterSection = ({ title, icon: Icon, links, children }: FooterSectionProps) => (
  <div>
    <h3 className="text-sm font-semibold mb-4 text-white flex items-center gap-2">
      {Icon && <Icon className="w-4 h-4 text-accent" />}
      {title}
    </h3>
    {links && (
      <div className="text-sm space-y-2.5">
        {links.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className="block text-white/75 hover:text-accent transition-colors"
          >
            {link.label}
          </Link>
        ))}
      </div>
    )}
    {children && <div className="text-sm mt-1 text-white/75">{children}</div>}
  </div>
);

const Footer = () => {
  const { t } = useLanguage();
  const authenticated = isAuthenticated();

  const quickLinks: FooterLink[] = authenticated
    ? [
        { label: t("home"), to: "/" },
        { label: t("addRecord"), to: "/add-record" },
        { label: t("viewRecords"), to: "/view-records" },
        { label: t("currentMonthDue"), to: "/view-due-policies" },
        { label: t("nextMonthDue"), to: "/view-upcoming-due" },
        { label: t("missedPayments"), to: "/view-missed-payments" }
      ]
    : [
        { label: t("login"), to: "/login" },
        { label: t("signupFree"), to: "/signup" },
        { label: ("Help & Support"), to: "/help-support" }
      ];

  const otherLinks: FooterLink[] = [
    ...(authenticated
      ? [
          { label: t("profile"), to: "/profile" },
          { label: t("ourPlans"), to: "/our-plans" },
          { label: t("bestInfoHub"), to: "/lic-info-hub" },
          { label: t("aboutUs"), to: "/about" },
          { label: ("Help & Support"), to: "/help-support" },
        ]
      : [
          { label: t("ourPlans"), to: "/our-plans" },
          { label: t("bestInfoHub"), to: "/lic-info-hub" },
          { label: t("aboutUs"), to: "/about" },
      ]),
    // { label: t("referral"), to: "/referral-program" },
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
      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-8">
          <FooterSection title={t("quickLinks")} icon={Compass} links={quickLinks} />
          <FooterSection title={t("otherLinks")} icon={Link2} links={otherLinks} />

          <FooterSection title={t("contactInfo")} icon={MapPin}>
            <div className="flex flex-col space-y-2.5">
              <div className="flex items-start gap-2">
                <Mail className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                <span className="break-words">{siteConfig.supportEmail}</span>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                <span>{t("officeAddress")}</span>
              </div>
              <div className="flex items-start gap-2">
                <Globe className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                <span className="break-words">{siteConfig.productionUrl}</span>
              </div>
            </div>
          </FooterSection>

          <FooterSection title={t("features")} icon={Sparkles}>
            <ul className="space-y-1.5">
              {features.map((feature, idx) => (
                <li key={idx} className="flex items-start gap-1.5">
                  <span className="text-accent shrink-0">✓</span> {feature}
                </li>
              ))}
            </ul>
          </FooterSection>

          <FooterSection title={t("aboutCompany")} icon={Building2}>
            <p className="mb-4 leading-relaxed">
              {t("companyDescription")}
            </p>
            <div className="text-xs text-white/50">
              <p>© 2025 - {currentYear} {siteConfig.companyName}</p>
              <p>{t("allRightsReserved")}</p>
            </div>
          </FooterSection>
        </div>

        <div className="border-t border-white/15 mt-8 pt-4 text-center text-sm text-white/70">
          <p>{t("footerTagline")}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;