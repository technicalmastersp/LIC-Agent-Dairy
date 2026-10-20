import { Link } from "react-router-dom";
import { Mail, MapPin, Globe, Compass, Link2, Sparkles, Building2, Calculator, Phone, Linkedin } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { isAuthenticated } from "@/utils/auth";
import siteConfig from "@/config/siteConfig";
import type { FooterLink, FooterSectionProps } from "@/types/components/Footer.types";
const FooterSection = ({ title, icon: Icon, links, children }: FooterSectionProps) => (
  <div>
    <h3 className="text-sm font-semibold mb-4 text-primary-foreground flex items-center gap-2">
      {Icon && <Icon className="w-4 h-4 text-accent" />}
      {title}
    </h3>
    {links && (
      <div className="text-sm space-y-2.5">
        {links.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className="block text-primary-foreground/75 hover:text-accent transition-colors"
          >
            {link.label}
          </Link>
        ))}
      </div>
    )}
    {children && <div className="text-sm mt-1 text-primary-foreground/75">{children}</div>}
  </div>
);

const Footer = () => {
  const { t } = useLanguage();
  const authenticated = isAuthenticated();

  const quickLinks: FooterLink[] = authenticated
    ? [
        { label: t("nav.home"), to: "/" },
        { label: t("nav.addRecord"), to: "/add-record" },
        { label: t("nav.viewRecords"), to: "/view-records" },
        { label: t("nav.currentMonthDue"), to: "/view-due-policies" },
        { label: t("nav.nextMonthDue"), to: "/view-upcoming-due" },
        { label: t("nav.missedPayments"), to: "/view-missed-payments" }
      ]
    : [
        { label: t("nav.home"), to: "/" },
        { label: t("nav.login"), to: "/login" },
        { label: t("nav.signupFree"), to: "/signup" },
        { label: ("Help & Support"), to: "/help-support" },
        { label: ("Contact Us"), to: "/contact" }
      ];

  const otherLinks: FooterLink[] = [
    ...(authenticated
      ? [
          { label: t("nav.profile"), to: "/profile" },
          { label: t("nav.ourPlans"), to: "/our-plans" },
          { label: t("nav.bestInfoHub"), to: "/policy-niketan-info-hub" },
          { label: t("nav.aboutUs"), to: "/about" },
          { label: ("Help & Support"), to: "/help-support" },
          { label: ("Contact Us"), to: "/contact" },
        ]
      : [
          { label: t("nav.ourPlans"), to: "/our-plans" },
          { label: t("nav.bestInfoHub"), to: "/policy-niketan-info-hub" },
          { label: t("nav.aboutUs"), to: "/about" },
      ]),
    // { label: t("nav.referral"), to: "/referral-program" },
  ];

  // Free financial calculators from ToolsHub.tsx — public, so shown
  // regardless of auth state, same as the hub page itself.
  const toolLinks: FooterLink[] = [
    { label: t('nav.allTools'),                    to: "/tools" },
    { label: t('nav.ageCalculator'),               to: "/tools/age-calculator" },
    { label: t('nav.sipCalculator'),                to: "/tools/sip-calculator" },
    { label: t('nav.lumpsumCalculator'),            to: "/tools/lumpsum-calculator" },
    { label: t('nav.rdCalculator'),                 to: "/tools/rd-calculator" },
    { label: t('nav.fdCalculator'),                 to: "/tools/fd-calculator" },
    { label: t('nav.incomeTaxCalculator'),         to: "/tools/income-tax-calculator" },
    { label: t('nav.homeLoanEmiCalculator'),      to: "/tools/home-loan-emi-calculator" },
    { label: t('nav.termInsuranceCalculator'),     to: "/tools/term-insurance-calculator" },
    { label: t('nav.inflationCalculator'),          to: "/tools/inflation-calculator" },
  ];

  const features = [
    t("nav.securePolicyManagement"),
    t("nav.multiLanguageSupport"),
    t("nav.userAuthentication"),
    t("nav.dataExportImport"),
    t("nav.searchFilterRecords"),
    t("nav.realTimeUpdates"),
  ];

  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-primary text-primary-foreground mt-auto">
      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-x-6 gap-y-10">
          <FooterSection title={t("nav.quickLinks")} icon={Compass} links={quickLinks} />
          <FooterSection title={t('common.tools')} icon={Calculator} links={toolLinks} />
          <FooterSection title={t("nav.otherLinks")} icon={Link2} links={otherLinks} />

          <FooterSection title={t("nav.contactInfo")} icon={MapPin}>
            <div className="flex flex-col space-y-2.5">
              <div className="flex items-start gap-2">
                <Mail className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                <span className="break-all">{siteConfig.supportEmail}</span>
              </div>
              <div className="flex items-start gap-2">
                <Phone className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                <span>
                  <Link to="/help-support#request-call" className="hover:text-accent transition-colors underline-offset-2 hover:underline">
                    {t('nav.requestACallBack')}
                  </Link>
                  <span className="block text-xs text-primary-foreground/60">{t('nav.businessHoursOnly')}</span>
                </span>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                <span>{t("nav.officeAddress")}</span>
              </div>
              <div className="flex items-start gap-2">
                <Globe className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                <span className="break-all">{siteConfig.productionUrl}</span>
              </div>
              <div className="flex items-start gap-2 hover:text-accent transition-colors">
                <Linkedin className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                <span className="break-all"><a href={siteConfig.linkedInUrl} target="_blank">{t('nav.linkedinPage')}</a></span>
              </div>
            </div>
          </FooterSection>

          <FooterSection title={t("nav.features")} icon={Sparkles}>
            <ul className="space-y-1.5">
              {features.map((feature, idx) => (
                <li key={idx} className="flex items-start gap-1.5">
                  <span className="text-accent shrink-0">✓</span> {feature}
                </li>
              ))}
            </ul>
          </FooterSection>

          <FooterSection title={t("nav.aboutCompany")} icon={Building2}>
            <p className="mb-4 leading-relaxed">
              {t("nav.companyDescription")}
            </p>
            <p>{t("nav.footerTagline")}</p>
          </FooterSection>
        </div>

        <div className="border-t border-primary-foreground/15 mt-8 pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-primary-foreground/70">
          <div className="text-xs text-primary-foreground/70">
            <p>© {currentYear} {siteConfig.companyName} - {t("nav.allRightsReserved")}</p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
            <Link to="/privacy-policy" className="hover:text-primary-foreground transition-colors">
              {t('common.privacyPolicy')}
            </Link>
            <Link to="/terms-of-service" className="hover:text-primary-foreground transition-colors">
              {t('common.termsOfService')}
            </Link>
            <Link to="/refund-policy" className="hover:text-primary-foreground transition-colors">
              {t('nav.cancellationRefunds')}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;