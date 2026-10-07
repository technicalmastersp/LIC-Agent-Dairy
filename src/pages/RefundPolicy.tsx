import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  RotateCcw,
  BookOpen,
  CreditCard,
  XCircle,
  CheckCircle2,
  Send,
  Clock,
  AlertTriangle,
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

const RefundPolicy = () => {
  const lastUpdated = "October 2026";

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEO
        title="Cancellation & Refund Policy"
        description={`How cancellations, refunds, and failed or duplicate payments are handled for ${siteConfig.companyName} subscription plans.`}
        path="/refund-policy"
      />
      <Navigation />

      <main className="flex-1">
        <section className="bg-gradient-to-br from-form-header via-form-header to-form-subheader text-primary-foreground">
          <div className="container mx-auto px-4 py-12 md:py-16">
            <div className="max-w-3xl mx-auto text-center">
              <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center mx-auto mb-5">
                <RotateCcw className="w-7 h-7" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold mb-3">Cancellation &amp; Refund Policy</h1>
              <p className="text-primary-foreground/75">
                Last updated: {lastUpdated}
              </p>
            </div>
          </div>
        </section>

        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto space-y-6">

              <Section icon={BookOpen} title="1. Overview">
                <p>
                  This policy explains how cancellations and refunds work for paid
                  subscription plans on {siteConfig.companyName} (
                  <a href={siteConfig.productionUrl} className="text-primary hover:underline">
                    {siteConfig.productionUrl}
                  </a>
                  ). It forms part of our{" "}
                  <Link to="/terms-of-service" className="text-primary hover:underline">
                    Terms of Service
                  </Link>
                  . Current plans and prices are listed on the{" "}
                  <Link to="/our-plans" className="text-primary hover:underline">
                    Our Plans
                  </Link>{" "}
                  page. All prices are in Indian Rupees (INR) and payments are
                  processed by Razorpay, a third-party payment gateway.
                </p>
                <p>
                  {siteConfig.companyName} is a software subscription. We do not sell,
                  broker, or advise on any insurance or financial product, and we do not
                  collect or process premium payments on behalf of any insurer.
                </p>
              </Section>

              <Section icon={CreditCard} title="2. How plan payments work">
                <ul className="list-disc list-inside space-y-1">
                  <li>Each plan is bought with a <strong>one-time payment</strong> for a fixed period (for example, one month or one year).</li>
                  <li><strong>Plans do not renew automatically.</strong> We never charge you again unless you choose to buy or renew a plan yourself, so there is no recurring charge to stop.</li>
                  <li>The free plan has no charge, so no refund applies to it.</li>
                </ul>
              </Section>

              <Section icon={XCircle} title="3. Cancellation">
                <ul className="list-disc list-inside space-y-1">
                  <li>You may stop using the paid plan at any time simply by not renewing it when it ends. Nothing further is charged.</li>
                  <li>If you want an active plan cancelled before its end date, contact us (see Section 6). Cancelling ends paid access straight away and your account moves to read-only access to your existing records. <strong>No refund is given for the unused part of the period</strong>, except as set out in Section 4.</li>
                  <li>Cancelling a plan does not delete your records. To delete your account and data, see the{" "}
                    <Link to="/privacy-policy" className="text-primary hover:underline">Privacy Policy</Link>.
                  </li>
                </ul>
              </Section>

              <Section icon={CheckCircle2} title="4. Refunds">
                <p>
                  Because access to the plan begins as soon as payment succeeds, plan
                  fees are <strong>non-refundable once a plan has been activated</strong>,
                  except in the cases below, where we will refund the amount you paid:
                </p>
                <ul className="list-disc list-inside space-y-1">
                  <li><strong>Duplicate payment:</strong> you were charged more than once for the same plan purchase. We refund the extra charge(s).</li>
                  <li><strong>Payment taken but plan not activated:</strong> money was debited but the plan was not activated on your account and we are unable to activate it.</li>
                  <li><strong>Where the law requires it.</strong></li>
                </ul>
                <p>
                  Refund requests must be made within <strong>7 days</strong> of the
                  transaction date.
                </p>
              </Section>

              <Section icon={AlertTriangle} title="5. Failed or pending payments">
                <p>
                  If a payment fails or stays pending but the amount has left your
                  account, it is usually reversed automatically by your bank or payment
                  provider. This commonly takes several business days. If the amount has
                  not been returned after that time and your plan is not active, contact
                  us with the payment details and we will investigate.
                </p>
              </Section>

              <Section icon={Send} title="6. How to request a cancellation or refund">
                <p>
                  Email{" "}
                  <a href={`mailto:${siteConfig.supportEmail}`} className="text-primary hover:underline">
                    {siteConfig.supportEmail}
                  </a>{" "}
                  or raise a ticket from the{" "}
                  <Link to="/help-support" className="text-primary hover:underline">
                    Help &amp; Support
                  </Link>{" "}
                  page (you can also{" "}
                  <Link to="/help-support#request-call" className="text-primary hover:underline">
                    request a call back
                  </Link>
                  , but please send the details below in writing so we have a record), and include:
                </p>
                <ul className="list-disc list-inside space-y-1">
                  <li>the email address registered on your account;</li>
                  <li>the plan name, the amount, and the date of the payment;</li>
                  <li>the Razorpay payment ID or a screenshot of the payment confirmation, if you have it;</li>
                  <li>a short description of the problem.</li>
                </ul>
              </Section>

              <Section icon={Clock} title="7. Review and refund timeline">
                <ul className="list-disc list-inside space-y-1">
                  <li>We review each request and reply by email with the decision.</li>
                  <li>Approved refunds are returned to the <strong>original payment method</strong> used for the purchase.</li>
                  <li>After we approve a refund, it typically reaches your account within 5 to 7 business days, depending on your bank or payment provider.</li>
                </ul>
              </Section>

              <Section icon={Mail} title="8. Questions">
                <p>
                  If anything here is unclear, write to{" "}
                  <a href={`mailto:${siteConfig.supportEmail}`} className="text-primary hover:underline">
                    {siteConfig.supportEmail}
                  </a>{" "}
                  or visit our{" "}
                  <Link to="/contact" className="text-primary hover:underline">
                    Contact page
                  </Link>
                  , or{" "}
                  <Link to="/help-support#request-call" className="text-primary hover:underline">
                    request a call back
                  </Link>{" "}
                  (placed during business hours only).
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

export default RefundPolicy;
