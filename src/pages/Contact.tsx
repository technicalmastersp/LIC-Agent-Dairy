import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { Card, CardContent } from "@/components/ui/card";
import { Mail, LifeBuoy, Clock, Phone, MapPin, Building2, ArrowRight } from "lucide-react";
import { BUSINESS_HOURS_LABELS } from "@/config/businessHours";
import siteConfig from "@/config/siteConfig";
import { useLanguage } from "@/hooks/useLanguage";
import Trans from "@/components/Trans";

// Callers use the "Request a call" flow (Help & Support) instead of a public
// number. Phone, address and legal entity name are OPTIONAL in siteConfig — each card
// below only renders when its value has been filled in, so the page never
// shows a placeholder or an empty row.
const Contact = () => {
  const { t } = useLanguage();
  const { supportEmail, phone, address, legalEntityName, linkedInUrl } = siteConfig;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEO
        title={t('contact.contactUs')}
        description={t('contact.contactEmailOurSupportTeam', { companyName: siteConfig.companyName })}
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
              <h1 className="text-3xl md:text-4xl font-bold mb-3">{t('contact.contactUs')}</h1>
              <p className="text-primary-foreground/75">
                {t('contact.questionsAboutYourAccountPayments')}
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
                      {t('contact.emailSupport')}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {t('contact.forAccountBillingRefund')}
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
                      {t('contact.raiseASupportTicket')}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {t('contact.sendUsAMessageFrom')}
                    </p>
                    <Link
                      to="/help-support"
                      className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                    >
                      {t('contact.goToHelpSupport')}{" "} <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </CardContent>
                </Card>

                <Card id="request-call">
                  <CardContent className="pt-6 space-y-2">
                    <div className="flex items-center gap-2.5 text-form-header font-semibold">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <Phone className="w-4 h-4 text-primary" />
                      </div>
                      {t('common.requestACall')}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {t('contact.shareYourMobileNumber')}
                    </p>
                    <Link
                      to="/help-support#request-call"
                      className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                    >
                      {t('common.requestACall')}{" "} <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6 space-y-2">
                    <div className="flex items-center gap-2.5 text-form-header font-semibold">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <Clock className="w-4 h-4 text-primary" />
                      </div>
                      {t('contact.businessHoursResponseTime')}
                    </div>
                    <div className="text-sm text-muted-foreground space-y-0.5">
                      {BUSINESS_HOURS_LABELS.map((l) => (
                        <p key={l.days}>{t(l.days)}: {t(l.hours)} <span className="text-xs">{t('contact.ist')}</span></p>
                      ))}
                      <p className="pt-1">{t('contact.mostEmailQueriesAreAnswered')}</p>
                    </div>
                  </CardContent>
                </Card>

                {phone && (
                  <Card>
                    <CardContent className="pt-6 space-y-2">
                      <div className="flex items-center gap-2.5 text-form-header font-semibold">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                          <Phone className="w-4 h-4 text-primary" />
                        </div>
                        {t('contact.phone')}
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
                    {t('contact.aboutTheBusiness')}
                  </div>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>
                      <Trans i18nKey="contact.isASoftwareSubscriptionTool" params={{ companyName: siteConfig.companyName, productionUrl: siteConfig.productionUrl }} components={{ strong: <strong className="text-foreground" />, link: <a href={siteConfig.productionUrl} className="text-primary hover:underline" /> }} /></p>
                    {linkedInUrl && (
                      <p className="py-2">
                        <strong className="text-foreground">{t('contact.companyLinkedinPage')}</strong> <a href={linkedInUrl} target="_blank" className="text-primary hover:underline">{t('contact.linkedinPageUrl')}</a>
                      </p>
                    )}
                    {legalEntityName && (
                      <p>
                        <strong className="text-foreground">{t('contact.operated')}</strong> {legalEntityName}
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
                <Trans i18nKey="contact.seeAlsoOurCancellationRefund" components={{ link: <Link to="/refund-policy" className="text-primary hover:underline" />, link2: <Link to="/terms-of-service" className="text-primary hover:underline" />, link3: <Link to="/privacy-policy" className="text-primary hover:underline" /> }} />
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
