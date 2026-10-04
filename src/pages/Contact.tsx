import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { Card, CardContent } from "@/components/ui/card";
import { Mail, LifeBuoy, Clock, Phone, MapPin, Building2, ArrowRight } from "lucide-react";
import siteConfig from "@/config/siteConfig";

// Phone, address and legal entity name are OPTIONAL in siteConfig — each card
// below only renders when its value has been filled in, so the page never
// shows a placeholder or an empty row.
const Contact = () => {
  const { supportEmail, phone, address, legalEntityName } = siteConfig;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEO
        title="Contact Us"
        description={`Contact ${siteConfig.companyName}: email our support team, raise a support ticket, or find our business details.`}
        path="/contact"
      />
      <Navigation />

      <main className="flex-1">
        <section className="bg-gradient-to-br from-form-header via-form-header to-form-subheader text-primary-foreground">
          <div className="container mx-auto px-4 py-12 md:py-16">
            <div className="max-w-3xl mx-auto text-center">
              <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center mx-auto mb-5">
                <Mail className="w-7 h-7" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold mb-3">Contact Us</h1>
              <p className="text-primary-foreground/75">
                Questions about your account, payments, or the product? We're here to help.
              </p>
            </div>
          </div>
        </section>

        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto space-y-6">

              <div className="grid gap-4 sm:grid-cols-2">
                <Card>
                  <CardContent className="pt-6 space-y-2">
                    <div className="flex items-center gap-2.5 text-form-header font-semibold">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <Mail className="w-4 h-4 text-primary" />
                      </div>
                      Email support
                    </div>
                    <p className="text-sm text-muted-foreground">
                      For account, billing, refund and general questions.
                    </p>
                    <a
                      href={`mailto:${supportEmail}`}
                      className="text-sm font-medium text-primary hover:underline break-words"
                    >
                      {supportEmail}
                    </a>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6 space-y-2">
                    <div className="flex items-center gap-2.5 text-form-header font-semibold">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <LifeBuoy className="w-4 h-4 text-primary" />
                      </div>
                      Raise a support ticket
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Send us a message from the app and track it with a ticket ID.
                    </p>
                    <Link
                      to="/help-support"
                      className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                    >
                      Go to Help &amp; Support <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6 space-y-2">
                    <div className="flex items-center gap-2.5 text-form-header font-semibold">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <Clock className="w-4 h-4 text-primary" />
                      </div>
                      Response time
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Most queries are answered within a few hours.
                    </p>
                  </CardContent>
                </Card>

                {phone && (
                  <Card>
                    <CardContent className="pt-6 space-y-2">
                      <div className="flex items-center gap-2.5 text-form-header font-semibold">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                          <Phone className="w-4 h-4 text-primary" />
                        </div>
                        Phone
                      </div>
                      <a href={`tel:${phone.replace(/\s+/g, "")}`} className="text-sm font-medium text-primary hover:underline">
                        {phone}
                      </a>
                    </CardContent>
                  </Card>
                )}
              </div>

              <Card>
                <CardContent className="pt-6 space-y-3">
                  <div className="flex items-center gap-2.5 text-form-header font-semibold">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Building2 className="w-4 h-4 text-primary" />
                    </div>
                    About the business
                  </div>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>
                      <strong className="text-foreground">{siteConfig.companyName}</strong> is a software
                      subscription tool that helps insurance agents manage their own client records,
                      reminders, and follow-ups. Website:{" "}
                      <a href={siteConfig.productionUrl} className="text-primary hover:underline">
                        {siteConfig.productionUrl}
                      </a>
                    </p>
                    {legalEntityName && (
                      <p>
                        <strong className="text-foreground">Operated by:</strong> {legalEntityName}
                      </p>
                    )}
                    {address && (
                      <p className="flex items-start gap-1.5">
                        <MapPin className="w-4 h-4 shrink-0 mt-0.5" />
                        <span>{address}</span>
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <p className="text-xs text-muted-foreground text-center">
                See also our{" "}
                <Link to="/refund-policy" className="text-primary hover:underline">Cancellation &amp; Refund Policy</Link>,{" "}
                <Link to="/terms-of-service" className="text-primary hover:underline">Terms of Service</Link> and{" "}
                <Link to="/privacy-policy" className="text-primary hover:underline">Privacy Policy</Link>.
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Contact;
