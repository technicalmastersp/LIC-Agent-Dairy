import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ShieldCheck, Database, Lock, Clock, Trash2, Mail, AlertTriangle,
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

const PrivacyPolicy = () => {
  const lastUpdated = "August 2026";

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEO
        title="Privacy Policy"
        description="How Life Insurance Records collects, stores, and protects the personal and policy data you enter, including Aadhaar, PAN, and bank details."
      />
      <Navigation />

      <main className="flex-1">
        <section className="bg-gradient-to-br from-form-header via-form-header to-form-subheader text-primary-foreground">
          <div className="container mx-auto px-4 py-12 md:py-16">
            <div className="max-w-3xl mx-auto text-center">
              <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center mx-auto mb-5">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold mb-3">Privacy Policy</h1>
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
                    describes what {siteConfig.companyName} actually does today, in plain
                    language, but it has not been reviewed by a lawyer. Please have it
                    reviewed by someone with legal expertise before relying on it as a
                    binding privacy policy.
                  </p>
                </CardContent>
              </Card>

              <Section icon={Database} title="What data we collect">
                <p>
                  To manage insurance policy records, {siteConfig.title} collects and
                  stores personal and financial details you enter for yourself and for
                  the clients whose policies you manage, including:
                </p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Identity details: name, father's/mother's/spouse's name, date of birth, address, occupation</li>
                  <li>Government ID numbers: Aadhaar number and PAN number</li>
                  <li>Bank details: bank account number, IFSC code, and bank/branch name</li>
                  <li>Contact details: email address and Aadhaar-linked mobile number</li>
                  <li>Policy records: current and previous policy numbers, plan and term, sum assured, mode of payment, and branch</li>
                  <li>Account details: your login email and password (stored as a one-way hash, never in plain text)</li>
                </ul>
              </Section>

              <Section icon={ShieldCheck} title="Why we collect it">
                <p>
                  Every field above exists to support the core purpose of this app: letting
                  agents keep accurate, organized policy records for their clients — adding
                  and searching records, tracking due and missed payments, and generating
                  reminders. We don't collect this data for advertising or sell it to third
                  parties.
                </p>
              </Section>

              <Section icon={Lock} title="How it's stored and secured">
                <p>
                  Records are stored in a MongoDB database on the {siteConfig.companyName}{" "}
                  backend. Account access is protected by JSON Web Token (JWT)
                  authentication, and passwords are hashed with bcrypt before storage — we
                  never store your password in plain text and can't look it up. The API
                  applies standard security middleware (HTTP security headers and request
                  rate limiting) and CORS restrictions to control which sites can talk to
                  it.
                </p>
                <p>
                  Being direct about a current limitation: Aadhaar, PAN, and bank account
                  fields are stored as plain text in the database (not separately encrypted
                  at the field level) alongside the rest of a record. Access to that data is
                  restricted to your authenticated account and, where applicable, admin
                  accounts reviewing platform activity — but if additional encryption at
                  rest for these specific fields matters to how you use this app, that's a
                  gap worth flagging to whoever maintains this deployment.
                </p>
              </Section>

              <Section icon={Clock} title="Data retention">
                <p>
                  Records remain in the database for as long as your account is active and
                  you keep them. There is currently no automatic deletion schedule — a
                  record persists until you delete it yourself or your account is removed.
                </p>
              </Section>

              <Section icon={Trash2} title="Deleting your data">
                <p>
                  You can delete individual policy records at any time from the{" "}
                  <span className="font-medium text-form-header">View Records</span> page.
                  To request deletion of your account and all associated records, contact
                  us using the details below.
                </p>
              </Section>

              <Section icon={Mail} title="Contact">
                <p>
                  Questions about this policy or your data can be sent to{" "}
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

export default PrivacyPolicy;