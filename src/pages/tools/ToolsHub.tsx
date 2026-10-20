import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Link } from "react-router-dom";
import SEO from "@/components/SEO";
import {
  Cake, TrendingUp, Receipt, Home, ShieldCheck, LineChart, ArrowRight, Banknote, Landmark, PiggyBank,
} from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import type { TFunction } from "@/types/i18n.types";
import { useMemo } from "react";

const buildTools = (t: TFunction) => [
  { to: "/tools/age-calculator", icon: Cake, title: t('tools.ageCalculator'), desc: t('tools.exactAgeInYearsMonths'), accent: "blue" },
  { to: "/tools/sip-calculator", icon: TrendingUp, title: t('tools.sipCalculator'), desc: t('tools.projectTheFutureValue'), accent: "violet" },
  { to: "/tools/lumpsum-calculator", icon: Banknote, title: t('tools.lumpsumCalculator'), desc: t('tools.seeWhatAOneTime'), accent: "indigo" },
  { to: "/tools/rd-calculator", icon: PiggyBank, title: t('tools.rdCalculator'), desc: t('tools.maturityValueAndInterest'), accent: "orange" },
  { to: "/tools/fd-calculator", icon: Landmark, title: t('tools.fdCalculator'), desc: t('tools.maturityValueAndInterest2'), accent: "green" },
  { to: "/tools/income-tax-calculator", icon: Receipt, title: t('tools.incomeTaxCalculator'), desc: t('tools.estimateYourTaxUnder'), accent: "amber" },
  { to: "/tools/home-loan-emi-calculator", icon: Home, title: t('tools.homeLoanEmiCalculator'), desc: t('tools.monthlyEmiTotalInterest'), accent: "emerald" },
  { to: "/tools/term-insurance-calculator", icon: ShieldCheck, title: t('tools.termInsuranceCalculator'), desc: t('tools.estimateHowMuchLifeCover2'), accent: "rose" },
  { to: "/tools/inflation-calculator", icon: LineChart, title: t('tools.inflationCalculator'), desc: t('tools.seeHowInflationAffects'), accent: "cyan" },
];

const ToolsHub = () => {
  const { t } = useLanguage();
  const TOOLS = useMemo(() => buildTools(t), [t]);
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEO
        title={t('tools.freeFinancialCalculators')}
        description={t('tools.freeCalculatorsForAgeSip')}
        path="/tools"
      />
      <Navigation />
      <main className="flex-1">
        <section className="relative bg-gradient-to-b from-primary/5 via-background to-background overflow-hidden">
          <div className="absolute top-10 -left-24 w-72 h-72 rounded-full bg-primary/5 blur-3xl" />
          <div className="container mx-auto px-4 relative py-14 md:py-20">
            <div className="max-w-2xl mx-auto text-center">
              <p className="text-xs font-medium uppercase tracking-wider text-primary mb-2">{t('tools.freeTools')}</p>
              <h1 className="text-3xl md:text-4xl font-bold text-form-header mb-3">{t('tools.financialCalculatorsForEveryone')}</h1>
              <p className="text-muted-foreground leading-relaxed">
                {t('tools.quickFreeCalculatorsToPlan')}
              </p>
            </div>
          </div>
        </section>

        <section className="pb-16 md:pb-20">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {TOOLS.map(({ to, icon: Icon, title, desc, accent }) => (
                <Link
                  key={to}
                  to={to}
                  className="group bg-background rounded-2xl border border-border p-6 hover:shadow-md hover:border-primary/30 transition-all"
                >
                  <div className={`w-11 h-11 rounded-xl bg-${accent}-100 text-${accent}-700 flex items-center justify-center mb-4`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-semibold text-form-header mb-1.5 flex items-center gap-1.5">
                    {title}
                    <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default ToolsHub;