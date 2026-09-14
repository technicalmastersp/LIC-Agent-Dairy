import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ShieldCheck,
  Database,
  Lock,
  Clock,
  Mail,
  Info,
  BookOpen,
  Globe,
  Cookie,
  Baby,
  Siren,
  Gavel,
  Fingerprint,
  Share2,
  ServerCog,
  UserCog,
  ScrollText,
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
  const lastUpdated = "September 2026";

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEO
        title="Privacy Policy"
        description={`How ${siteConfig.companyName} collects, processes, stores, and protects personal, financial, and policy data, in accordance with the Digital Personal Data Protection Act, 2023.`}
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
              <p className="text-primary-foreground/75">
                Last updated: {lastUpdated} · Effective from date of publication
              </p>
            </div>
          </div>
        </section>

        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto space-y-6">

              <Card className="border-amber-200 bg-amber-50">
                <CardContent className="pt-6 flex gap-3 text-sm text-amber-900">
                  <Info className="w-5 h-5 shrink-0 text-amber-600" />
                  <p>
                    <strong>Notice:</strong> This document has been prepared to accurately
                    reflect the data-processing architecture and operational practices of{" "}
                    {siteConfig.companyName} as they currently exist, in accordance with
                    applicable Indian data protection law, including the Digital Personal
                    Data Protection Act, 2023 ("DPDP Act") and the Information Technology
                    Act, 2000 and rules made thereunder. It is intended as a substantive
                    baseline and should be reviewed by qualified legal counsel prior to
                    formal publication to confirm jurisdiction-specific compliance.
                  </p>
                </CardContent>
              </Card>

              <Section icon={BookOpen} title="1. Introduction and Scope">
                <p>
                  This Privacy Policy ("Policy") governs the collection, use, storage,
                  disclosure, and protection of personal data by {siteConfig.companyName}{" "}
                  ("{siteConfig.companyName}", "we", "our", "us") through the web
                  application accessible at{" "}
                  <a href={siteConfig.productionUrl} className="text-primary hover:underline">
                    {siteConfig.productionUrl}
                  </a>{" "}
                  and any associated services (collectively, the "Platform"). The Platform
                  is a policy record-management tool that enables licensed insurance
                  agents ("Agents", "you", "your") to record, organize, and track
                  policyholder and policy data.
                </p>
                <p>
                  By creating an account, accessing, or using the Platform, you
                  acknowledge that you have read, understood, and agree to the collection
                  and processing practices described in this Policy. If you do not agree
                  with any provision of this Policy, you must discontinue use of the
                  Platform immediately.
                </p>
                <p>
                  This Policy applies to Data Principals whose personal data is processed
                  by the Platform, which includes (a) registered Agents who use the
                  Platform directly, and (b) policyholders and other individuals ("Clients")
                  whose data is entered into the Platform by an Agent in the course of
                  managing insurance records. Where the Platform processes personal data
                  of Clients, the Agent who enters that data acts as the Data Fiduciary
                  in respect of that data under the DPDP Act, and {siteConfig.companyName}{" "}
                  acts as a processor providing the underlying infrastructure, as further
                  described in Section 6.
                </p>
              </Section>

              <Section icon={ScrollText} title="2. Definitions">
                <ul className="list-disc list-inside space-y-1">
                  <li><strong>"Personal Data"</strong> means any data about an individual who is identifiable by or in relation to such data.</li>
                  <li><strong>"Sensitive Personal Data"</strong> means Personal Data that, under applicable law, requires a heightened standard of care, including government-issued identifiers (Aadhaar, PAN) and financial account information.</li>
                  <li><strong>"Processing"</strong> means any operation performed on Personal Data, including collection, recording, storage, retrieval, use, alignment, disclosure, or erasure.</li>
                  <li><strong>"Data Fiduciary"</strong> means the person who determines the purpose and means of processing Personal Data.</li>
                  <li><strong>"Data Processor"</strong> means a person who processes Personal Data on behalf of a Data Fiduciary.</li>
                  <li><strong>"Data Principal"</strong> means the individual to whom the Personal Data relates.</li>
                  <li><strong>"Consent"</strong> means the free, specific, informed, unconditional, and unambiguous indication of a Data Principal's agreement to the processing of their Personal Data.</li>
                </ul>
              </Section>

              <Section icon={Database} title="3. Categories of Data We Collect">
                <p>
                  In order to provide policy record-management functionality,{" "}
                  {siteConfig.title} collects and stores the following categories of
                  data, whether entered directly by you or on behalf of a Client:
                </p>
                <ul className="list-disc list-inside space-y-1">
                  <li><strong>Identity data:</strong> full name, father's/mother's/spouse's name, date of birth, gender, address, occupation</li>
                  <li><strong>Government identifiers (Sensitive Personal Data):</strong> Aadhaar number and Permanent Account Number (PAN)</li>
                  <li><strong>Financial data (Sensitive Personal Data):</strong> bank account number, IFSC code, bank and branch name</li>
                  <li><strong>Contact data:</strong> email address and Aadhaar-linked mobile number</li>
                  <li><strong>Policy data:</strong> current and previous policy numbers, plan and term, sum assured, premium mode and amount, servicing branch, due and payment history</li>
                  <li><strong>Account credentials:</strong> login email address and password, the latter stored exclusively as a salted one-way cryptographic hash (bcrypt) and never in reversible or plain-text form</li>
                  <li><strong>Transaction data:</strong> subscription plan, payment status, and payment identifiers generated by our payment processor (Razorpay) — we do not receive, process, or store full card, UPI, or net-banking credentials</li>
                  <li><strong>Technical and log data:</strong> IP address, browser/device metadata, authenticated session identifiers, and application error diagnostics captured automatically for security and reliability purposes</li>
                </ul>
              </Section>

              <Section icon={Gavel} title="4. Legal Basis and Purpose of Processing">
                <p>
                  We process Personal Data on the following legal bases recognized under
                  the DPDP Act and applicable contract law:
                </p>
                <ul className="list-disc list-inside space-y-1">
                  <li><strong>Consent:</strong> where you or your Client has provided specific, informed consent for the processing of their data for policy record-keeping purposes.</li>
                  <li><strong>Performance of a contract:</strong> processing necessary to provide the account, subscription, and record-management services you have signed up for.</li>
                  <li><strong>Legitimate use / legal obligation:</strong> processing necessary for fraud prevention, security monitoring, and compliance with applicable law, including recordkeeping obligations under insurance regulation where relevant.</li>
                </ul>
                <p>
                  We do not process Personal Data for behavioral advertising, do not sell
                  or rent Personal Data to third parties, and do not use Client data
                  collected through the Platform for any purpose other than enabling the
                  Agent's own record-management activity and the operation of the
                  Platform itself.
                </p>
              </Section>

              <Section icon={Lock} title="5. Data Storage and Security Measures">
                <p>
                  Records are stored in a MongoDB database instance provisioned for the{" "}
                  {siteConfig.companyName} backend. We implement the following technical
                  and organizational security measures, consistent with the "reasonable
                  security practices and procedures" standard under the Information
                  Technology Act, 2000 and associated rules:
                </p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Transport-layer encryption (HTTPS/TLS) for all data in transit between your browser and our servers</li>
                  <li>Stateless authentication via signed JSON Web Tokens (JWT) with defined expiry</li>
                  <li>One-way password hashing using bcrypt; passwords are never stored or logged in plain text</li>
                  <li>HTTP security headers, including a Content Security Policy, and cross-origin resource sharing (CORS) restrictions limiting which origins may interact with the API</li>
                  <li>Request rate-limiting to mitigate brute-force and denial-of-service attempts</li>
                  <li>Role-based access control distinguishing Agent, Admin, and Super-Admin privileges</li>
                  <li>Automated application error monitoring (Sentry) to detect and remediate faults, configured to avoid intentional capture of Sensitive Personal Data in error payloads</li>
                </ul>
                <p>
                  <strong>Disclosed limitation:</strong> Aadhaar, PAN, and bank account
                  fields are currently stored as plain, unencrypted text within the
                  database record, alongside other policy fields, rather than being
                  subject to separate field-level encryption at rest. Access to this data
                  is restricted to your authenticated session and, where applicable,
                  Admin/Super-Admin accounts performing platform administration. If
                  field-level encryption of Sensitive Personal Data is a requirement for
                  your use case or regulatory environment, this should be treated as an
                  open item for further engineering and legal review.
                </p>
                <p>
                  No method of electronic transmission or storage is completely secure. While
                  we implement the measures described above, we cannot guarantee absolute
                  security and are not liable for unauthorized access resulting from
                  circumstances outside our reasonable control, including compromise of
                  your own account credentials.
                </p>
              </Section>

              <Section icon={Share2} title="6. Data Processors and Third-Party Service Providers">
                <p>
                  We engage the following categories of sub-processors to operate the
                  Platform. Each processes data solely to the extent necessary to perform
                  its function and is contractually or technically restricted from using
                  the data for independent purposes:
                </p>
                <ul className="list-disc list-inside space-y-1">
                  <li><strong>Hosting — frontend:</strong> Vercel Inc., for delivery of the web application</li>
                  <li><strong>Hosting — backend:</strong> Render, for hosting the application server and API</li>
                  <li><strong>Database:</strong> MongoDB Atlas, for encrypted-at-rest cloud database infrastructure</li>
                  <li><strong>Payments:</strong> Razorpay, for processing subscription payments; RazorpayX, for processing referral payouts to Agents</li>
                  <li><strong>Transactional email:</strong> our configured SMTP provider, for account verification, password reset, and due-date reminder emails</li>
                  <li><strong>Error monitoring:</strong> Sentry, for automated capture of application exceptions and stack traces to support reliability</li>
                </ul>
                <p>
                  We do not permit any sub-processor to use Personal Data processed
                  through the Platform for advertising, profiling, or any purpose unrelated
                  to the service it provides to us.
                </p>
              </Section>

              <Section icon={Globe} title="7. Cross-Border Data Transfer">
                <p>
                  Certain sub-processors identified in Section 6 may store or process data
                  on servers located outside India, depending on their respective regional
                  hosting configuration at the time of processing. Where Personal Data is
                  transferred outside India, we take reasonable steps to ensure such
                  transfers are made only to entities that maintain a standard of
                  protection consistent with this Policy and applicable law, subject to
                  the Central Government's power under the DPDP Act to restrict transfers
                  to specific jurisdictions.
                </p>
              </Section>

              <Section icon={Clock} title="8. Data Retention">
                <p>
                  Personal Data is retained for as long as your account remains active and
                  the corresponding record has not been deleted. We do not currently apply
                  an automatic deletion schedule to inactive records; retention continues
                  until you delete a record, close your account, or submit a verified
                  erasure request as described in Section 9. Certain limited data,
                  including transaction and audit logs, may be retained for a longer
                  period where necessary to comply with legal, accounting, or fraud
                  prevention obligations.
                </p>
              </Section>

              <Section icon={Fingerprint} title="9. Your Rights as a Data Principal">
                <p>
                  Subject to applicable law, you have the right to:
                </p>
                <ul className="list-disc list-inside space-y-1">
                  <li><strong>Access</strong> a summary of the Personal Data we hold about you and the processing activities carried out</li>
                  <li><strong>Correct and update</strong> inaccurate or incomplete Personal Data through your account settings or the relevant record</li>
                  <li><strong>Erasure</strong> of Personal Data that is no longer necessary for the purpose it was collected, subject to legal retention requirements</li>
                  <li><strong>Withdraw consent</strong> at any time, without affecting the lawfulness of processing carried out prior to withdrawal, understanding that withdrawal may limit or disable your ability to use the Platform</li>
                  <li><strong>Grievance redressal</strong> through the Grievance Officer designated in Section 13, and, where unresolved, escalation to the Data Protection Board of India as constituted under the DPDP Act</li>
                  <li><strong>Nominate</strong> another individual to exercise these rights on your behalf in the event of death or incapacity, in accordance with the DPDP Act</li>
                </ul>
                <p>
                  Individual policy records can be deleted directly from the{" "}
                  <span className="font-medium text-form-header">View Records</span> page.
                  To exercise any other right listed above, including full account and
                  data deletion, contact us using the details in Section 15.
                </p>
              </Section>

              <Section icon={Cookie} title="10. Cookies and Similar Technologies">
                <p>
                  The Platform uses strictly necessary session storage and authentication
                  tokens required for you to remain logged in and for the application to
                  function securely. We do not currently deploy third-party advertising or
                  cross-site tracking cookies. Should this change, this Policy will be
                  updated to describe the categories of cookies used, their purpose, and
                  your options for managing them.
                </p>
              </Section>

              <Section icon={Baby} title="11. Children's Data">
                <p>
                  The Platform is intended for use by adults acting in a professional
                  capacity as licensed insurance agents. It is not directed at, and we do
                  not knowingly collect Personal Data from, individuals under the age of
                  18. Where Client data pertains to a minor (for example, a policy taken
                  on behalf of a minor), such data is entered and managed under the
                  responsibility and verifiable consent of the Agent acting as Data
                  Fiduciary for that record, in accordance with Section 9 of the DPDP Act.
                </p>
              </Section>

              <Section icon={Siren} title="12. Data Breach Notification">
                <p>
                  In the event of a Personal Data breach that is likely to result in a
                  risk to the rights of affected Data Principals, we will take reasonable
                  steps to contain and remediate the breach and, where required under
                  applicable law, notify the Data Protection Board of India and affected
                  Data Principals within the timelines prescribed under the DPDP Act and
                  its rules.
                </p>
              </Section>

              <Section icon={UserCog} title="13. Grievance Officer">
                <p>
                  In accordance with the Information Technology Act, 2000, the Information
                  Technology (Reasonable Security Practices and Procedures and Sensitive
                  Personal Data or Information) Rules, 2011, and the DPDP Act, we have
                  designated a Grievance Officer to address complaints or concerns
                  regarding the processing of Personal Data:
                </p>
                <p>
                  <strong>Grievance Officer:</strong> {siteConfig.author}
                  <br />
                  <strong>Email:</strong>{" "}
                  <a href={`mailto:${siteConfig.supportEmail}`} className="text-primary hover:underline">
                    {siteConfig.supportEmail}
                  </a>
                </p>
                <p>
                  We will acknowledge grievances within a reasonable time and endeavor to
                  resolve them within the period prescribed under applicable law.
                </p>
              </Section>

              <Section icon={ServerCog} title="14. Changes to this Policy">
                <p>
                  We may amend this Policy from time to time to reflect changes in our
                  data-processing practices, the Platform's functionality, or applicable
                  law. Material changes will be reflected by updating the "Last updated"
                  date above, and, where the change is significant, we will provide
                  additional notice through the Platform or by email. Continued use of the
                  Platform after a revised Policy is published constitutes acceptance of
                  the revised terms.
                </p>
              </Section>

              <Section icon={Mail} title="15. Contact Us">
                <p>
                  For questions about this Policy, to exercise a right described in
                  Section 9, or to raise a grievance, contact us at{" "}
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
