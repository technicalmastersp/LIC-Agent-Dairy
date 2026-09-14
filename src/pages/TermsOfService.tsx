import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  FileText,
  Info,
  BookOpen,
  ScrollText,
  UserCheck,
  ShieldAlert,
  Layers,
  CreditCard,
  Gift,
  Copyright,
  Ban,
  Link2,
  ShieldOff,
  Scale,
  Handshake,
  XOctagon,
  CloudLightning,
  Puzzle,
  BookMarked,
  RefreshCcw,
  Gavel,
  Mail,
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
  const lastUpdated = "September 2026";

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEO
        title="Terms of Service"
        description={`The terms and conditions governing use of ${siteConfig.title} — account eligibility, subscription plans, data responsibilities, intellectual property, liability, and dispute resolution.`}
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
                    <strong>Notice:</strong> This document has been prepared to reflect the
                    current functionality and operational practices of {siteConfig.companyName}{" "}
                    in professional, legally-informed language. It is intended as a
                    substantive baseline and should be reviewed by qualified legal counsel
                    prior to formal publication to confirm enforceability in your
                    jurisdiction.
                  </p>
                </CardContent>
              </Card>

              <Section icon={BookOpen} title="1. Acceptance of Terms">
                <p>
                  These Terms of Service ("Terms") constitute a legally binding agreement
                  between you and {siteConfig.companyName} ("{siteConfig.companyName}",
                  "we", "our", "us"), governing your access to and use of the web
                  application available at{" "}
                  <a href={siteConfig.productionUrl} className="text-primary hover:underline">
                    {siteConfig.productionUrl}
                  </a>{" "}
                  and all related services, features, and content (collectively, the
                  "Platform").
                </p>
                <p>
                  By creating an account, clicking to accept, or otherwise accessing or
                  using the Platform, you affirmatively acknowledge that you have read,
                  understood, and agree to be bound by these Terms and by our{" "}
                  <a href="/privacy-policy" className="text-primary hover:underline">
                    Privacy Policy
                  </a>
                  , which is incorporated herein by reference. If you do not agree to
                  these Terms in their entirety, you must not access or use the Platform.
                </p>
              </Section>

              <Section icon={ScrollText} title="2. Definitions">
                <ul className="list-disc list-inside space-y-1">
                  <li><strong>"Account"</strong> means the registered user profile created to access the Platform.</li>
                  <li><strong>"Agent"</strong> means a registered user of the Platform, typically a licensed insurance agent, who creates, edits, or manages records.</li>
                  <li><strong>"Client"</strong> means a policyholder or other individual whose personal or policy data is entered into the Platform by an Agent.</li>
                  <li><strong>"Content"</strong> means all data, text, and records submitted to, generated by, or displayed through the Platform.</li>
                  <li><strong>"Subscription"</strong> means a paid plan granting access to defined tiers of Platform functionality for a specified duration.</li>
                  <li><strong>"Referral Program"</strong> means the incentive mechanism described in Section 8 through which Agents may earn payouts for referring new subscribers.</li>
                </ul>
              </Section>

              <Section icon={UserCheck} title="3. Eligibility and Account Registration">
                <p>
                  You must be at least 18 years of age and possess the legal capacity to
                  enter into a binding contract to register for and use the Platform. By
                  registering, you represent and warrant that all information you provide
                  during account creation is accurate, current, and complete, and that you
                  will maintain the accuracy of such information.
                </p>
                <p>
                  You are solely responsible for maintaining the confidentiality of your
                  login credentials and for all activities that occur under your Account,
                  whether or not authorized by you. You agree to notify us immediately at{" "}
                  <a href={`mailto:${siteConfig.supportEmail}`} className="text-primary hover:underline">
                    {siteConfig.supportEmail}
                  </a>{" "}
                  upon becoming aware of any unauthorized use of your Account or any other
                  breach of security. We are not liable for any loss or damage arising
                  from your failure to safeguard your credentials.
                </p>
              </Section>

              <Section icon={Layers} title="4. Description of Service">
                <p>
                  The Platform provides a record-management system that allows Agents to
                  capture, organize, search, and monitor life insurance policy records,
                  including applicant details, premium due dates, upcoming and missed
                  payments, and related administrative functions, together with
                  supplementary financial calculators and reference tools. The Platform is
                  provided solely as a record-keeping and organizational aid; it does not
                  constitute insurance advice, financial advice, or a substitute for
                  official records maintained by an insurer or regulatory authority.
                </p>
                <p>
                  We reserve the right to modify, suspend, or discontinue any feature of
                  the Platform, in whole or in part, at any time, with or without notice,
                  and without liability to you for any such modification, suspension, or
                  discontinuation.
                </p>
              </Section>

              <Section icon={ShieldAlert} title="5. Client Data and Your Responsibilities as Data Fiduciary">
                <p>
                  The Platform enables you to enter personal and financial information
                  belonging to your Clients, including government identifiers (Aadhaar,
                  PAN) and bank account details. In respect of all such Client data, you
                  act as the Data Fiduciary (or equivalent controller) and are solely
                  responsible for:
                </p>
                <ul className="list-disc list-inside space-y-1">
                  <li>obtaining all necessary, lawful consent from each Client prior to entering their data into the Platform;</li>
                  <li>ensuring the accuracy and lawful basis for collection of all data you submit;</li>
                  <li>complying with all obligations applicable to you under the Digital Personal Data Protection Act, 2023, applicable insurance regulations, and any other law governing your handling of Client data; and</li>
                  <li>promptly correcting or deleting Client data upon a valid request from the Client concerned.</li>
                </ul>
                <p>
                  {siteConfig.companyName} acts solely as a processor providing the
                  technical infrastructure for storage and retrieval of the data you
                  submit, and does not independently verify, and disclaims responsibility
                  for, the lawfulness of your collection or entry of any Client data.
                </p>
              </Section>

              <Section icon={CreditCard} title="6. Subscription Plans, Fees, and Payment Terms">
                <p>
                  Access to certain Platform features is contingent on an active paid
                  Subscription. Current plan durations, pricing, and included features are
                  published on the{" "}
                  <a href="/our-plans" className="text-primary hover:underline">
                    Our Plans
                  </a>{" "}
                  page and are subject to change prospectively at our discretion; any
                  change will not affect a Subscription already purchased for its then-current term.
                </p>
                <ul className="list-disc list-inside space-y-1">
                  <li>All payments are processed through Razorpay, a third-party payment gateway; we do not receive or store your full payment card, UPI, or net-banking credentials.</li>
                  <li>Fees are billed in advance for the applicable Subscription period and, except where required by law or expressly stated otherwise, are non-refundable.</li>
                  <li>If your Subscription expires or is cancelled, your Account is downgraded to read-only access to existing records; creating, editing, or deleting records requires an active Subscription.</li>
                  <li>You are responsible for any taxes, duties, or governmental charges applicable to your purchase, other than taxes on our net income.</li>
                </ul>
              </Section>

              <Section icon={Gift} title="7. Referral Program">
                <p>
                  We may offer a Referral Program under which Agents can earn monetary
                  payouts, processed through RazorpayX, for successfully referring new
                  paying subscribers to the Platform. Participation in the Referral
                  Program is subject to any specific terms, eligibility criteria, and
                  payout thresholds published within the Platform from time to time, which
                  are incorporated into these Terms by reference. We reserve the right to
                  withhold, reverse, or reclaim any payout obtained through fraudulent,
                  abusive, or manipulative activity, and to suspend or terminate the
                  Account of any Agent found to have engaged in such activity, without
                  prejudice to any other remedy available to us.
                </p>
              </Section>

              <Section icon={Copyright} title="8. Intellectual Property Rights">
                <p>
                  The Platform, including its software, source code, design, graphics,
                  trademarks, logos, and all underlying technology, is and remains the
                  exclusive property of {siteConfig.companyName} and its licensors and is
                  protected under applicable copyright, trademark, and other intellectual
                  property laws. These Terms do not grant you any right, title, or
                  interest in the Platform other than a limited, non-exclusive,
                  non-transferable, revocable license to access and use the Platform for
                  its intended purpose during the term of your Subscription.
                </p>
                <p>
                  You retain ownership of the Content you submit to the Platform. By
                  submitting Content, you grant {siteConfig.companyName} a limited,
                  non-exclusive license to store, process, and display that Content solely
                  for the purpose of providing the Platform's functionality to you. We
                  claim no ownership interest in your Content and will not use it for any
                  purpose beyond operating the Platform.
                </p>
              </Section>

              <Section icon={Ban} title="9. Acceptable Use Policy">
                <p>You agree that you will not, and will not permit any third party to:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>use the Platform for any unlawful purpose, or to collect, store, or process data you do not have a lawful right to collect;</li>
                  <li>attempt to gain unauthorized access to another user's Account, records, or credentials, or circumvent authentication, rate-limiting, or other security controls;</li>
                  <li>reverse-engineer, decompile, disassemble, or otherwise attempt to derive the source code of the Platform, except to the extent such restriction is prohibited by applicable law;</li>
                  <li>introduce any virus, malware, or other harmful code, or engage in activity that disrupts, overburdens, or impairs the Platform's infrastructure;</li>
                  <li>scrape, harvest, or extract data from the Platform through automated means without our prior written consent;</li>
                  <li>misuse the Referral Program or withdrawal system, including through fraudulent referrals or fictitious Accounts;</li>
                  <li>impersonate any person or entity, or misrepresent your affiliation with any person or entity.</li>
                </ul>
                <p>
                  We reserve the right to investigate any suspected violation of this
                  Section and to take any action we deem appropriate, including suspension
                  or termination of the relevant Account and reporting to law enforcement
                  where warranted.
                </p>
              </Section>

              <Section icon={Link2} title="10. Third-Party Services and Links">
                <p>
                  The Platform integrates with and may link to third-party services,
                  including Razorpay and RazorpayX for payment processing. Your use of
                  such third-party services is governed by their respective terms of
                  service and privacy policies, and {siteConfig.companyName} is not
                  responsible for the acts, omissions, availability, or content of any
                  third-party service.
                </p>
              </Section>

              <Section icon={ShieldOff} title="11. Disclaimer of Warranties">
                <p>
                  THE PLATFORM IS PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS, WITHOUT
                  WARRANTIES OF ANY KIND, WHETHER EXPRESS, IMPLIED, OR STATUTORY, INCLUDING,
                  WITHOUT LIMITATION, IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
                  PARTICULAR PURPOSE, TITLE, AND NON-INFRINGEMENT. WE DO NOT WARRANT THAT
                  THE PLATFORM WILL BE UNINTERRUPTED, TIMELY, SECURE, OR ERROR-FREE, OR THAT
                  ANY DEFECTS WILL BE CORRECTED. YOU ACKNOWLEDGE THAT THE PLATFORM IS A
                  RECORD-KEEPING TOOL ONLY AND DOES NOT CONSTITUTE INSURANCE, FINANCIAL, TAX,
                  OR LEGAL ADVICE, AND YOU REMAIN SOLELY RESPONSIBLE FOR VERIFYING ALL
                  POLICY, PREMIUM, AND DUE-DATE INFORMATION AGAINST OFFICIAL INSURER RECORDS.
                </p>
              </Section>

              <Section icon={Scale} title="12. Limitation of Liability">
                <p>
                  TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT SHALL{" "}
                  {siteConfig.companyName}, ITS OFFICERS, EMPLOYEES, OR AGENTS BE LIABLE
                  FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE
                  DAMAGES, OR ANY LOSS OF PROFITS, REVENUE, DATA, OR GOODWILL, ARISING OUT
                  OF OR IN CONNECTION WITH YOUR USE OF, OR INABILITY TO USE, THE PLATFORM,
                  REGARDLESS OF THE LEGAL THEORY ON WHICH SUCH DAMAGES ARE CLAIMED AND
                  EVEN IF WE HAVE BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES. OUR
                  AGGREGATE LIABILITY ARISING OUT OF OR RELATING TO THESE TERMS OR THE
                  PLATFORM SHALL NOT EXCEED THE TOTAL SUBSCRIPTION FEES PAID BY YOU TO US
                  IN THE TWELVE (12) MONTHS PRECEDING THE EVENT GIVING RISE TO THE CLAIM.
                </p>
              </Section>

              <Section icon={Handshake} title="13. Indemnification">
                <p>
                  You agree to indemnify, defend, and hold harmless {siteConfig.companyName}{" "}
                  and its officers, employees, and agents from and against any claims,
                  liabilities, damages, losses, and expenses, including reasonable
                  attorneys' fees, arising out of or in any way connected with: (a) your
                  access to or use of the Platform; (b) your violation of these Terms; (c)
                  your violation of any applicable law, including data protection or
                  insurance regulation, in connection with Client data you submit; or (d)
                  your infringement of any third-party right, including any right of a
                  Client whose data you have entered into the Platform.
                </p>
              </Section>

              <Section icon={XOctagon} title="14. Suspension and Termination">
                <p>
                  We may suspend or terminate your Account, with or without prior notice,
                  if we determine, in our reasonable discretion, that you have violated
                  these Terms, engaged in fraudulent or abusive conduct, or posed a
                  security risk to the Platform or other users. You may terminate your
                  Account at any time by contacting us at{" "}
                  <a href={`mailto:${siteConfig.supportEmail}`} className="text-primary hover:underline">
                    {siteConfig.supportEmail}
                  </a>
                  . Upon termination, your right to access the Platform ceases
                  immediately; Sections 8, 11, 12, 13, and 16 of these Terms survive any
                  termination.
                </p>
              </Section>

              <Section icon={CloudLightning} title="15. Force Majeure">
                <p>
                  We shall not be liable for any failure or delay in performance under
                  these Terms resulting from causes beyond our reasonable control,
                  including acts of God, natural disaster, war, terrorism, riot,
                  governmental action, labor disputes, internet or telecommunications
                  failures, or failures of third-party hosting, payment, or infrastructure
                  providers.
                </p>
              </Section>

              <Section icon={Gavel} title="16. Governing Law and Dispute Resolution">
                <p>
                  These Terms and any dispute arising out of or in connection with them
                  shall be governed by and construed in accordance with the laws of India,
                  without regard to its conflict of laws principles. Subject to the
                  procedure below, the courts at Delhi, India shall have exclusive
                  jurisdiction over any dispute arising out of or relating to these Terms
                  or the Platform.
                </p>
                <p>
                  Prior to initiating formal proceedings, the parties agree to first
                  attempt to resolve any dispute through good-faith negotiation by
                  providing written notice to the other party describing the dispute in
                  reasonable detail. If the dispute is not resolved within thirty (30) days
                  of such notice, either party may pursue any remedy available at law,
                  including referring the dispute to arbitration under the Arbitration and
                  Conciliation Act, 1996, conducted by a sole arbitrator mutually
                  appointed by the parties, seated in Delhi, India, and conducted in the
                  English language.
                </p>
              </Section>

              <Section icon={Puzzle} title="17. Severability">
                <p>
                  If any provision of these Terms is held by a court or arbitral tribunal
                  of competent jurisdiction to be invalid, illegal, or unenforceable, that
                  provision shall be modified to the minimum extent necessary to make it
                  enforceable, or severed if modification is not possible, and the
                  remaining provisions of these Terms shall continue in full force and
                  effect.
                </p>
              </Section>

              <Section icon={BookMarked} title="18. Entire Agreement">
                <p>
                  These Terms, together with our Privacy Policy and any other terms
                  expressly incorporated by reference (including Referral Program or
                  Subscription-specific terms published within the Platform), constitute
                  the entire agreement between you and {siteConfig.companyName} regarding
                  the Platform, and supersede all prior or contemporaneous understandings,
                  whether written or oral, relating to that subject matter. Our failure to
                  enforce any right or provision of these Terms shall not constitute a
                  waiver of such right or provision.
                </p>
              </Section>

              <Section icon={RefreshCcw} title="19. Changes to these Terms">
                <p>
                  We may revise these Terms from time to time to reflect changes in the
                  Platform's functionality, business practices, or applicable law.
                  Material changes will be reflected by updating the "Last updated" date
                  above and, where appropriate, communicated through the Platform or by
                  email. Your continued use of the Platform after a revised version of
                  these Terms is published constitutes your acceptance of the revised
                  Terms.
                </p>
              </Section>

              <Section icon={Mail} title="20. Contact Us">
                <p>
                  Questions regarding these Terms should be directed to{" "}
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
