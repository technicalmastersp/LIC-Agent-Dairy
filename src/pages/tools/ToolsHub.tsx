import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Link } from "react-router-dom";
import {
  Cake, TrendingUp, Receipt, Home, ShieldCheck, LineChart, ArrowRight,
} from "lucide-react";

const TOOLS = [
  { to: "/tools/age-calculator", icon: Cake, title: "Age Calculator", desc: "Exact age in years, months, and days from a date of birth.", accent: "blue" },
  { to: "/tools/sip-calculator", icon: TrendingUp, title: "SIP Calculator", desc: "Project the future value of your monthly mutual fund investments.", accent: "violet" },
  { to: "/tools/income-tax-calculator", icon: Receipt, title: "Income Tax Calculator", desc: "Estimate your tax under the old and new regimes.", accent: "amber" },
  { to: "/tools/home-loan-emi-calculator", icon: Home, title: "Home Loan EMI Calculator", desc: "Monthly EMI, total interest, and total payment on a home loan.", accent: "emerald" },
  { to: "/tools/term-insurance-calculator", icon: ShieldCheck, title: "Term Insurance Calculator", desc: "Estimate how much life cover you actually need.", accent: "rose" },
  { to: "/tools/inflation-calculator", icon: LineChart, title: "Inflation Calculator", desc: "See how inflation affects the value of money over time.", accent: "cyan" },
];

const ToolsHub = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation />
      <main className="flex-1">
        <section className="relative bg-gradient-to-b from-primary/5 via-background to-background overflow-hidden">
          <div className="absolute top-10 -left-24 w-72 h-72 rounded-full bg-primary/5 blur-3xl" />
          <div className="container mx-auto px-4 relative py-14 md:py-20">
            <div className="max-w-2xl mx-auto text-center">
              <p className="text-xs font-medium uppercase tracking-wider text-primary mb-2">Free tools</p>
              <h1 className="text-3xl md:text-4xl font-bold text-form-header mb-3">Financial calculators for everyone</h1>
              <p className="text-muted-foreground leading-relaxed">
                Quick, free calculators to plan your finances — no account needed.
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