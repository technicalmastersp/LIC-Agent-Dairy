import { ReactNode } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Link, useLocation } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import SEO from "@/components/SEO";
import siteConfig from "@/config/siteConfig";

interface ToolPageLayoutProps {
  icon: React.ElementType;
  title: string;
  description: string;
  children: ReactNode;
  accent?: string; // tailwind color stem, e.g. "blue", "emerald" — defaults to primary
}

const ToolPageLayout = ({ icon: Icon, title, description, children, accent }: ToolPageLayoutProps) => {
  const iconBg = accent ? `bg-${accent}-100 text-${accent}-700` : "bg-primary/10 text-primary";
  const { pathname } = useLocation();

  // Every calculator tool page is a free, browser-based WebApplication —
  // this is the schema.org type Google's rich-results docs recommend for
  // that shape of page. One JSON-LD block here covers all six calculators
  // without duplicating it per page.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: title,
    description,
    url: `${siteConfig.productionUrl}${pathname}`,
    applicationCategory: "FinanceApplication",
    operatingSystem: "Any",
    isAccessibleForFree: true,
    offers: { "@type": "Offer", price: "0", priceCurrency: "INR" },
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Every tool page already passes a distinct title/description for its
          on-page heading — reused here as the SEO title/meta description too,
          so each calculator gets genuinely different search/social copy
          without duplicating it in every individual page file. */}
      <SEO title={title} description={description} jsonLd={jsonLd} />
      <Navigation />
      <main className="flex-1">
        <section className="relative bg-gradient-to-b from-primary/5 via-background to-background overflow-hidden">
          <div className="absolute top-10 -left-24 w-72 h-72 rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute top-0 -right-24 w-72 h-72 rounded-full bg-primary/5 blur-3xl" />
          <div className="container mx-auto px-4 relative py-10 md:py-14">
            <div className="max-w-3xl mx-auto text-center">
              <nav className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground mb-6">
                <Link to="/tools" className="hover:text-form-header transition-colors">Tools</Link>
                <ChevronRight className="w-3 h-3" />
                <span className="text-form-header font-medium">{title}</span>
              </nav>
              <div className={`w-14 h-14 rounded-2xl ${iconBg} flex items-center justify-center mx-auto mb-5 shadow-sm`}>
                <Icon className="w-7 h-7" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-form-header mb-3">{title}</h1>
              <p className="text-muted-foreground leading-relaxed max-w-xl mx-auto">{description}</p>
            </div>
          </div>
        </section>

        <section className="pb-16 md:pb-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto -mt-2">{children}</div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default ToolPageLayout;