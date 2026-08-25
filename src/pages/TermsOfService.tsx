import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  FileText, UserCheck, ShieldAlert, CreditCard, Ban, RefreshCcw, Mail, AlertTriangle,
} from "lucide-react";
import siteConfig from "@/config/siteConfig";

const Section = ({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
}) => (
  <Card>
    <CardHeader>
      <CardTitle className="text-lg text-form-header flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
          <Icon className="w-4 h-4 text-primary" />
        </div>
        {title}
      </CardTitle>
    </CardHeader>
    <CardContent className="text-sm text-muted-foreground leading-relaxed space-y-3">
      {children}
    </CardContent>
  </Card>
);

const TermsOfService = () => {
  const lastUpdated = "August 2026";

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEO
        title="Terms of Service"
        description="The terms that govern use of Life Insurance Records — your account, subscription plans, data responsibilities, and acceptable use."
      />
      <Navigation />

      <main className="flex-1">
        <section className="bg-gradient-to-br from-form-header via-form-header to-form-subheader text-primary-foreground">
          <div className="container mx-auto px-4 py-12 md:py-16">
            <div className="max-w-3xl mx-auto text-center">
              <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center mx-auto mb-5">
                <FileText className="w-7 h-7" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold mb-3">Terms of Service</h1>
              <p className="text-primary-foreground/75">Last updated: {lastUpdated}</p>
            </div>
          </div>
        </section>

        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto space-y-6">

              <Card className="border-amber-200 bg-amber-50">
                <CardContent className="pt-6 flex gap-3 text-sm text-amber-900">
                  <AlertTriangle className="w-5 h-5 shrink-0 text-amber-600" />
                  <p>
                    <strong>This is a starting draft, not a final legal document.</strong> It
                    has not been reviewed by a lawyer. Please have it reviewed by someone
                    with legal expertise before treating it as binding.
                  </p>
                </CardContent>
              </Card>

              <Section icon={UserCheck} title="Your account">
                <p>
                  You need an account to use {siteConfig.title}. You're responsible for
                  keeping your login credentials confidential and for all activity that
                  happens under your account. Tell us right away if you suspect
                  unauthorized access.
                </p>
              </Section>

              <Section icon={ShieldAlert} title="Your responsibility for the data you enter">
                <p>
                  {siteConfig.title} is a record-keeping tool for insurance agents. The
                  personal and financial details you enter for your clients — including
                  Aadhaar, PAN, and bank account information — are entered by you, and you're
                  responsible for having the right to collect, store, and manage that data
                  on their behalf, and for handling it in line with any obligations you have
                  toward your clients under applicable law.
                </p>
              </Section>

              <Section icon={CreditCard} title="Subscription plans">
                <p>
                  Access to record management features depends on an active subscription
                  plan. Plan durations, pricing, and what's included are shown on the{" "}
                  <a href="/our-plans" className="text-primary hover:underline">
                    Our Plans
                  </a>{" "}
                  page at the time of purchase. If your subscription expires or is
                  cancelled, you retain read-only access to your existing records, but
                  adding, editing, or deleting records requires an active plan.
                </p>
              </Section>

              <Section icon={Ban} title="Acceptable use">
                <p>You agree not to:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Use the service for anything unlawful, or to store data you don't have the right to collect</li>
                  <li>Attempt to access another user's account or records without authorization</li>
                  <li>Interfere with or disrupt the service, including attempting to bypass authentication or rate limits</li>
                  <li>Use the referral or withdrawal system fraudulently</li>
                </ul>
              </Section>

              <Section icon={RefreshCcw} title="Changes to these terms">
                <p>
                  We may update these terms as the app evolves. Continued use of{" "}
                  {siteConfig.title} after a change is posted means you accept the updated
                  terms. Significant changes will be reflected in the "Last updated" date
                  above.
                </p>
              </Section>

              <Section icon={Mail} title="Contact">
                <p>
                  Questions about these terms can be sent to{" "}
                  <a
                    href={`mailto:${siteConfig.supportEmail}`}
                    className="text-primary hover:underline"
                  >
                    {siteConfig.supportEmail}
                  </a>
                  , or through the{" "}
                  <a href="/help-support" className="text-primary hover:underline">
                    Help &amp; Support
                  </a>{" "}
                  page.
                </p>
              </Section>

            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default TermsOfService;