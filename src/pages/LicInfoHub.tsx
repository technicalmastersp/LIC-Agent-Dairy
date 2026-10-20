import Footer from '@/components/Footer';
import Navigation from '@/components/Navigation';
import React, { useMemo, useState } from 'react';
import { Input } from '@/components/ui/input';
import { BookOpenText, Search, X } from 'lucide-react';
import SEO from '@/components/SEO';
import type { AbbreviationItem, InsuranceAbbreviationsData } from "@/types/pages/LicInfoHub.types";
import { useLanguage } from "@/hooks/useLanguage";
import type { TFunction } from "@/types/i18n.types";
const buildData = (t: TFunction): InsuranceAbbreviationsData => ({
  Insurance_Abbreviations: [
    { abbreviation: 'DOC', full_form: 'Date of Commencement', description: t('hub.startDateOfTheInsurance') },
    { abbreviation: 'DLP', full_form: 'Date of Last Premium', description: t('hub.dateWhenTheLastPremium') },
    { abbreviation: 'DOM', full_form: 'Date of Maturity', description: t('hub.dateWhenThePolicyMatures') },
    { abbreviation: 'DOD', full_form: 'Date of Death', description: t('hub.dateOnWhichTheLife') },
    { abbreviation: 'Maturity Date', full_form: '—', description: t('hub.dateWhenThePolicyTerm') },
    { abbreviation: 'SA', full_form: 'Sum Assured', description: t('hub.guaranteedAmountPayableOnDeath') },
    { abbreviation: 'PA', full_form: 'Proposer/Policyholder Address', description: t('hub.theAddressOfThePerson') },
    { abbreviation: 'LA', full_form: 'Life Assured', description: t('hub.thePersonWhoseLife') },
    { abbreviation: 'DOB', full_form: 'Date of Birth', description: t('hub.usedForAgeCalculation') },
    { abbreviation: 'FUP', full_form: 'First Unpaid Premium', description: t('hub.theFirstMissedPremiumDate') },
    { abbreviation: 'LUP', full_form: 'Last Unpaid Premium', description: t('hub.theFinalUnpaidPremiumBefore') },
    { abbreviation: 'HPR', full_form: 'History of Premium Receipt', description: t('hub.recordOfPaidPremiums') },
    { abbreviation: 'NAV', full_form: 'Net Asset Value', description: t('hub.usedInUlipsForFund') },
    { abbreviation: 'ULIP', full_form: 'Unit Linked Insurance Plan', description: t('hub.aMixOfInsurance') },
    { abbreviation: 'NACH', full_form: 'National Automated Clearing House', description: t('hub.systemForAutoDebitingPremiums') },
    { abbreviation: 'NEFT', full_form: 'National Electronic Funds Transfer', description: t('hub.forDirectCreditOfClaim') },
    { abbreviation: 'ECS', full_form: 'Electronic Clearing System', description: t('hub.usedForAutoPayment') },
    { abbreviation: 'TPA', full_form: 'Third Party Administrator', description: t('hub.handlesClaimsInHealthInsurance') },
    { abbreviation: 'GST', full_form: 'Goods and Services Tax', description: t('hub.taxLeviedOnInsurancePremiums') },
    { abbreviation: 'IRDAI', full_form: 'Insurance Regulatory and Development Authority of India', description: t('hub.regulatoryBodyForInsurance') },
    { abbreviation: 'TDS', full_form: 'Tax Deducted at Source', description: t('hub.taxDeductedOnCertainPayouts') },
    { abbreviation: 'KYC', full_form: 'Know Your Customer', description: t('hub.verificationProcessOfIdentity') },
    { abbreviation: 'PAN', full_form: 'Permanent Account Number', description: t('hub.usedForTaxAndFinancial') },
    { abbreviation: 'GSV', full_form: 'Guaranteed Surrender Value', description: t('hub.theMinimumSurrenderValue') },
    { abbreviation: 'SSV', full_form: 'Special Surrender Value', description: t('hub.aDiscretionarySurrenderValue') },
    { abbreviation: 'WOP', full_form: 'Waiver of Premium', description: t('hub.aRiderThatWaivesFuture') },
    { abbreviation: 'ADB', full_form: 'Accidental Death Benefit', description: t('hub.anAdditionalPayoutIfDeath') },
    { abbreviation: 'UIN', full_form: 'Unique Identification Number', description: t('hub.theIrdaiIssuedNumber') },
    { abbreviation: 'CKYC', full_form: 'Central KYC Registry', description: t('hub.aCentralizedSystemThatStores') },
  ],
  Insurance_Internal_Codes: [
    { abbreviation: 'PWB', full_form: 'Premium Waiver Benefit', description: '' },
    { abbreviation: 'AB', full_form: 'Accidental Benefit', description: '' },
    { abbreviation: 'DAB', full_form: 'Double Accident Benefit', description: '' },
    { abbreviation: 'CIB', full_form: 'Critical Illness Benefit', description: '' },
    { abbreviation: 'GT', full_form: 'Group Term Insurance', description: '' },
    { abbreviation: 'SV', full_form: 'Surrender Value', description: '' },
    { abbreviation: 'FV', full_form: 'Face Value', description: '' },
    { abbreviation: 'Loan A/V', full_form: 'Loan Available', description: '' },
    { abbreviation: 'RPR', full_form: 'Revival of Policy Receipt', description: '' },
    { abbreviation: 'BRN', full_form: 'Branch Code', description: '' },
    { abbreviation: 'AGT', full_form: 'Agent', description: '' },
    { abbreviation: 'DO', full_form: 'Development Officer', description: '' },
    { abbreviation: 'SRB', full_form: 'Simple Reversionary Bonus', description: t('hub.annualBonusDeclared') },
    { abbreviation: 'FAB', full_form: 'Final Additional Bonus', description: t('hub.aOneTimeBonusPaid') },
    { abbreviation: 'PPT', full_form: 'Premium Paying Term', description: t('hub.theNumberOfYearsOver') },
    { abbreviation: 'PT', full_form: 'Policy Term', description: t('hub.theTotalDurationForWhich') },
  ],
  Private_Insurers: [
    { abbreviation: 'SBI Life', full_form: 'SBI Life Insurance', description: t('hub.privateLifeInsuranceCompany') },
    { abbreviation: 'HDFC Life', full_form: 'HDFC Life Insurance', description: t('hub.privateLifeInsuranceCompany') },
    { abbreviation: 'ICICI Pru Life', full_form: 'ICICI Prudential Life Insurance', description: t('hub.privateLifeInsuranceCompany') },
    { abbreviation: 'Max Life', full_form: 'Max Life Insurance', description: t('hub.privateLifeInsuranceCompany') },
    { abbreviation: 'Bajaj Allianz', full_form: 'Bajaj Allianz Life Insurance', description: t('hub.privateLifeInsuranceCompany') },
    { abbreviation: 'Tata AIA', full_form: 'Tata AIA Life Insurance', description: t('hub.privateLifeInsuranceCompany') },
  ],
  Common_Policy_Terms: [
    { abbreviation: 'Grace Period', full_form: '—', description: t('hub.theWindowAfterAMissed') },
    { abbreviation: 'Free Look Period', full_form: '—', description: t('hub.aWindowCommonly15') },
    { abbreviation: 'Paid-up Value', full_form: '—', description: t('hub.aReducedSumAssured') },
    { abbreviation: 'Nomination', full_form: '—', description: t('hub.namingAPersonToReceive') },
    { abbreviation: 'Assignment', full_form: '—', description: t('hub.legallyTransferringTheOwnershipRights') },
    { abbreviation: 'Rider', full_form: '—', description: t('hub.anOptionalAddOnBenefit') },
    { abbreviation: 'Lapse', full_form: '—', description: t('hub.whenAPolicyLosesIts') },
    { abbreviation: 'Revival', full_form: '—', description: t('hub.reinstatingALapsedPolicy') },
    { abbreviation: 'IDV', full_form: 'Insured Declared Value', description: t('hub.inMotorInsuranceTheCurrent') },
    { abbreviation: 'NCB', full_form: 'No Claim Bonus', description: t('hub.aDiscountOnMotor') },
    { abbreviation: 'Cashless Claim', full_form: '—', description: t('hub.aHealthInsuranceClaimSettled') },
    { abbreviation: 'Waiting Period', full_form: '—', description: t('hub.aDefinedPeriodAfterPolicy') },
    { abbreviation: 'Family Floater', full_form: '—', description: t('hub.aSingleHealthInsuranceSum') },
  ],
});

const buildSectionMeta = (t: TFunction): Record<keyof InsuranceAbbreviationsData, { title: string; accent: string; bg: string }> => ({
  Insurance_Abbreviations:   { title: t('hub.generalInsuranceAbbreviations'), accent: 'text-blue-700',   bg: 'bg-blue-50' },
  Insurance_Internal_Codes:  { title: t('hub.insuranceInternalCodes'),        accent: 'text-violet-700', bg: 'bg-violet-50' },
  Private_Insurers:    { title: t('hub.privateInsurers'),          accent: 'text-emerald-700',bg: 'bg-emerald-50' },
  Common_Policy_Terms: { title: t('hub.commonPolicyTerms'),       accent: 'text-amber-700',  bg: 'bg-amber-50' },
});

const Section = ({
  id, title, accent, bg, items,
}: { id: string; title: string; accent: string; bg: string; items: AbbreviationItem[] }) => {
  if (items.length === 0) return null;
  return (
    <div id={id} className="mb-12 scroll-mt-20">
      <h2 className="text-xl font-semibold text-form-header mb-4 flex items-center gap-2">
        <span className={`w-2 h-2 rounded-full ${bg.replace('50', '400')}`} />
        {title}
        <span className="text-xs font-normal text-muted-foreground">({items.length})</span>
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item, index) => (
          <div
            key={index}
            className="bg-background border border-border rounded-xl p-4 hover:shadow-md hover:border-primary/30 transition-all"
          >
            <div className="flex items-start justify-between gap-2 mb-1.5">
              <h3 className={`font-semibold ${accent}`}>{item.abbreviation}</h3>
              <span className={`text-[10px] font-medium uppercase tracking-wide ${accent} ${bg} px-2 py-0.5 rounded-full shrink-0`}>
                {title.split(' ')[0]}
              </span>
            </div>
            {item.full_form && item.full_form !== '—' && (
              <p className="text-sm text-form-header font-medium">{item.full_form}</p>
            )}
            {item.description && (
              <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">{item.description}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

const LicInfoHub: React.FC = () => {
  const { t } = useLanguage();
  const data = useMemo(() => buildData(t), [t]);
  const sectionMeta = useMemo(() => buildSectionMeta(t), [t]);
  const [query, setQuery] = useState("");

  const filtered = useMemo<InsuranceAbbreviationsData>(() => {
    if (!query.trim()) return data;
    const q = query.trim().toLowerCase();
    const match = (item: AbbreviationItem) =>
      item.abbreviation.toLowerCase().includes(q) ||
      item.full_form.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q);

    return {
      Insurance_Abbreviations: data.Insurance_Abbreviations.filter(match),
      Insurance_Internal_Codes: data.Insurance_Internal_Codes.filter(match),
      Private_Insurers: data.Private_Insurers.filter(match),
      Common_Policy_Terms: data.Common_Policy_Terms.filter(match),
    };
  }, [query]);

  const totalResults =
    filtered.Insurance_Abbreviations.length + filtered.Insurance_Internal_Codes.length +
    filtered.Private_Insurers.length + filtered.Common_Policy_Terms.length;
  const totalAll =
    data.Insurance_Abbreviations.length + data.Insurance_Internal_Codes.length +
    data.Private_Insurers.length + data.Common_Policy_Terms.length;

  // This page is a searchable glossary (term → full form → definition),
  // not Q&A content, so FAQPage schema would misrepresent it to Google
  // (and risks a structured-data manual action for content-mismatch).
  // DefinedTermSet/DefinedTerm is schema.org's purpose-built type for
  // exactly this shape — a curated list of terms with definitions.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "DefinedTermSet",
    name: "Policy Niketan Info Hub — Insurance Abbreviations & Terms Glossary",
    description: t('hub.glossaryOfInsuranceAbbreviationsInternal'),
    hasDefinedTerm: [
      ...data.Insurance_Abbreviations,
      ...data.Insurance_Internal_Codes,
      ...data.Private_Insurers,
      ...data.Common_Policy_Terms,
    ].map(item => ({
      "@type": "DefinedTerm",
      name: item.abbreviation,
      alternateName: item.full_form !== "—" ? item.full_form : undefined,
      description: item.description || undefined,
    })),
  };

  return (
    <div className="min-h-screen bg-muted/30 flex flex-col">
      <SEO
        title={t('hub.policyNiketanInfoHubInsurance')}
        description={t('hub.lookUpInsurancePolicyAbbreviations')}
        jsonLd={jsonLd}
        path="/policy-niketan-info-hub"
      />
      <Navigation />

      <main className="container mx-auto px-4 py-8 flex-1">
        <div className="max-w-6xl mx-auto">

          <div className="flex items-center gap-3 mb-6">
            <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <BookOpenText className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-form-header">{t('hub.insuranceAbbreviationsCodes')}</h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                {t('hub.quickReferenceForInsurancePolicy')}
              </p>
            </div>
          </div>

          <div className="relative max-w-md mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder={t('hub.searchAbbreviationFullForm')}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-9 pr-9 bg-background"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-form-header"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-2 mb-8">
            {(Object.keys(sectionMeta) as (keyof InsuranceAbbreviationsData)[]).map((key) => (
              <a
                key={key}
                href={`#${key}`}
                className={`text-xs font-medium ${sectionMeta[key].accent} ${sectionMeta[key].bg} px-3 py-1.5 rounded-full hover:opacity-80 transition-opacity`}
              >
                {sectionMeta[key].title}
              </a>
            ))}
          </div>

          {query && (
            <p className="text-sm text-muted-foreground mb-6">
              {t('hub.ofEntriesMatch', { totalResults, totalAll, query })}
            </p>
          )}

          {totalResults === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-16">
              {t('hub.noAbbreviationsMatch', { query })}
            </p>
          ) : (
            <>
              <Section id="Insurance_Abbreviations" title={sectionMeta.Insurance_Abbreviations.title} accent={sectionMeta.Insurance_Abbreviations.accent} bg={sectionMeta.Insurance_Abbreviations.bg} items={filtered.Insurance_Abbreviations} />
              <Section id="Insurance_Internal_Codes" title={sectionMeta.Insurance_Internal_Codes.title} accent={sectionMeta.Insurance_Internal_Codes.accent} bg={sectionMeta.Insurance_Internal_Codes.bg} items={filtered.Insurance_Internal_Codes} />
              <Section id="Private_Insurers" title={sectionMeta.Private_Insurers.title} accent={sectionMeta.Private_Insurers.accent} bg={sectionMeta.Private_Insurers.bg} items={filtered.Private_Insurers} />
              <Section id="Common_Policy_Terms" title={sectionMeta.Common_Policy_Terms.title} accent={sectionMeta.Common_Policy_Terms.accent} bg={sectionMeta.Common_Policy_Terms.bg} items={filtered.Common_Policy_Terms} />
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default LicInfoHub;