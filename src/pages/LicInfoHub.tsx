import Footer from '@/components/Footer';
import Navigation from '@/components/Navigation';
import React, { useMemo, useState } from 'react';
import { Input } from '@/components/ui/input';
import { BookOpenText, Search, X } from 'lucide-react';

type AbbreviationItem = {
  abbreviation: string;
  full_form: string;
  description: string;
};

type LICAbbreviationsData = {
  LIC_Abbreviations: AbbreviationItem[];
  LIC_Internal_Codes: AbbreviationItem[];
  Private_Insurers: AbbreviationItem[];
  Common_Policy_Terms: AbbreviationItem[];
};

const data: LICAbbreviationsData = {
  LIC_Abbreviations: [
    { abbreviation: 'LIC', full_form: 'Life Insurance Corporation', description: "India's largest government-owned life insurance company" },
    { abbreviation: 'DOC', full_form: 'Date of Commencement', description: 'Start date of the insurance policy' },
    { abbreviation: 'DLP', full_form: 'Date of Last Premium', description: 'Date when the last premium was paid' },
    { abbreviation: 'DOM', full_form: 'Date of Maturity', description: 'Date when the policy matures' },
    { abbreviation: 'DOD', full_form: 'Date of Death', description: 'Date on which the life assured dies' },
    { abbreviation: 'Maturity Date', full_form: '—', description: 'Date when the policy term ends and benefits are payable' },
    { abbreviation: 'SA', full_form: 'Sum Assured', description: 'Guaranteed amount payable on death/maturity' },
    { abbreviation: 'PA', full_form: 'Proposer/Policyholder Address', description: 'The address of the person who owns the policy' },
    { abbreviation: 'LA', full_form: 'Life Assured', description: 'The person whose life is insured' },
    { abbreviation: 'DOB', full_form: 'Date of Birth', description: 'Used for age calculation and underwriting' },
    { abbreviation: 'FUP', full_form: 'First Unpaid Premium', description: 'The first missed premium date' },
    { abbreviation: 'LUP', full_form: 'Last Unpaid Premium', description: 'The final unpaid premium before policy lapses' },
    { abbreviation: 'HPR', full_form: 'History of Premium Receipt', description: 'Record of paid premiums' },
    { abbreviation: 'NAV', full_form: 'Net Asset Value', description: 'Used in ULIPs for fund value calculation' },
    { abbreviation: 'ULIP', full_form: 'Unit Linked Insurance Plan', description: 'A mix of insurance and investment' },
    { abbreviation: 'NACH', full_form: 'National Automated Clearing House', description: 'System for auto-debiting premiums from bank accounts' },
    { abbreviation: 'NEFT', full_form: 'National Electronic Funds Transfer', description: "For direct credit of claim/maturity to policyholder's account" },
    { abbreviation: 'ECS', full_form: 'Electronic Clearing System', description: 'Used for auto payment of premiums' },
    { abbreviation: 'TPA', full_form: 'Third Party Administrator', description: 'Handles claims in health insurance' },
    { abbreviation: 'GST', full_form: 'Goods and Services Tax', description: 'Tax levied on insurance premiums' },
    { abbreviation: 'IRDAI', full_form: 'Insurance Regulatory and Development Authority of India', description: 'Regulatory body for insurance in India' },
    { abbreviation: 'TDS', full_form: 'Tax Deducted at Source', description: 'Tax deducted on certain payouts like commissions or maturity benefits' },
    { abbreviation: 'KYC', full_form: 'Know Your Customer', description: 'Verification process of identity and address' },
    { abbreviation: 'PAN', full_form: 'Permanent Account Number', description: 'Used for tax and financial transactions' },
    { abbreviation: 'GSV', full_form: 'Guaranteed Surrender Value', description: 'The minimum surrender value the insurer must pay, fixed as a percentage of premiums paid' },
    { abbreviation: 'SSV', full_form: 'Special Surrender Value', description: 'A discretionary surrender value that may be higher than the GSV, based on accrued bonuses' },
    { abbreviation: 'WOP', full_form: 'Waiver of Premium', description: 'A rider that waives future premiums if the policyholder is disabled or diagnosed with a critical illness' },
    { abbreviation: 'ADB', full_form: 'Accidental Death Benefit', description: 'An additional payout if death occurs due to an accident' },
    { abbreviation: 'UIN', full_form: 'Unique Identification Number', description: 'The IRDAI-issued number that uniquely identifies an approved insurance product' },
    { abbreviation: 'CKYC', full_form: 'Central KYC Registry', description: "A centralized system that stores a customer's KYC records for reuse across financial institutions" },
  ],
  LIC_Internal_Codes: [
    { abbreviation: 'PWB', full_form: 'Premium Waiver Benefit', description: '' },
    { abbreviation: 'AB', full_form: 'Accidental Benefit', description: '' },
    { abbreviation: 'DAB', full_form: 'Double Accident Benefit', description: '' },
    { abbreviation: 'CIB', full_form: 'Critical Illness Benefit', description: '' },
    { abbreviation: 'GT', full_form: 'Group Term Insurance', description: '' },
    { abbreviation: 'JE', full_form: 'Jeevan', description: 'Used in LIC policy names, e.g., Jeevan Anand' },
    { abbreviation: 'SV', full_form: 'Surrender Value', description: '' },
    { abbreviation: 'FV', full_form: 'Face Value', description: '' },
    { abbreviation: 'Loan A/V', full_form: 'Loan Available', description: '' },
    { abbreviation: 'RPR', full_form: 'Revival of Policy Receipt', description: '' },
    { abbreviation: 'BRN', full_form: 'Branch Code', description: '' },
    { abbreviation: 'AGT', full_form: 'Agent', description: '' },
    { abbreviation: 'DO', full_form: 'Development Officer', description: '' },
    { abbreviation: 'SRB', full_form: 'Simple Reversionary Bonus', description: 'Annual bonus declared as a percentage of the sum assured, added to the policy each year' },
    { abbreviation: 'FAB', full_form: 'Final Additional Bonus', description: 'A one-time bonus paid on maturity or death, on top of accumulated reversionary bonuses' },
    { abbreviation: 'PPT', full_form: 'Premium Paying Term', description: 'The number of years over which premiums must be paid, which may be shorter than the policy term' },
    { abbreviation: 'PT', full_form: 'Policy Term', description: 'The total duration for which the policy remains in force' },
  ],
  Private_Insurers: [
    { abbreviation: 'SBI Life', full_form: 'SBI Life Insurance', description: 'Private life insurance company' },
    { abbreviation: 'HDFC Life', full_form: 'HDFC Life Insurance', description: 'Private life insurance company' },
    { abbreviation: 'ICICI Pru Life', full_form: 'ICICI Prudential Life Insurance', description: 'Private life insurance company' },
    { abbreviation: 'Max Life', full_form: 'Max Life Insurance', description: 'Private life insurance company' },
    { abbreviation: 'Bajaj Allianz', full_form: 'Bajaj Allianz Life Insurance', description: 'Private life insurance company' },
    { abbreviation: 'Tata AIA', full_form: 'Tata AIA Life Insurance', description: 'Private life insurance company' },
  ],
  Common_Policy_Terms: [
    { abbreviation: 'Grace Period', full_form: '—', description: 'The window after a missed premium due date — typically 15 or 30 days — during which the policy stays active and the premium can still be paid without penalty' },
    { abbreviation: 'Free Look Period', full_form: '—', description: 'A window (commonly 15 or 30 days) after receiving the policy document during which the policyholder can review and return the policy for a refund if unsatisfied' },
    { abbreviation: 'Paid-up Value', full_form: '—', description: 'A reduced sum assured a policy converts to if premiums stop after a minimum number of years, instead of lapsing entirely' },
    { abbreviation: 'Nomination', full_form: '—', description: 'Naming a person to receive the policy proceeds on the life assured\'s death — the nominee acts as a trustee for the legal heirs unless also a beneficial owner' },
    { abbreviation: 'Assignment', full_form: '—', description: 'Legally transferring the ownership rights of a policy to another person or entity, often used when a policy is pledged for a loan' },
    { abbreviation: 'Rider', full_form: '—', description: 'An optional add-on benefit attached to a base policy for extra premium, such as critical illness or accidental death cover' },
    { abbreviation: 'Lapse', full_form: '—', description: 'When a policy loses its benefits because a premium wasn\'t paid even after the grace period' },
    { abbreviation: 'Revival', full_form: '—', description: 'Reinstating a lapsed policy by paying overdue premiums plus interest, usually within a specified revival period' },
    { abbreviation: 'IDV', full_form: 'Insured Declared Value', description: 'In motor insurance, the current market value of the vehicle — the maximum amount payable in case of total loss or theft' },
    { abbreviation: 'NCB', full_form: 'No Claim Bonus', description: 'A discount on motor or health premium for each claim-free year, which resets if a claim is made' },
    { abbreviation: 'Cashless Claim', full_form: '—', description: 'A health insurance claim settled directly between the insurer and a network hospital, without the policyholder paying upfront' },
    { abbreviation: 'Waiting Period', full_form: '—', description: 'A defined period after policy start during which certain health conditions or claims are not covered' },
    { abbreviation: 'Family Floater', full_form: '—', description: 'A single health insurance sum assured shared across all covered family members, rather than a separate cover for each' },
  ],
};

const sectionMeta: Record<keyof LICAbbreviationsData, { title: string; accent: string; bg: string }> = {
  LIC_Abbreviations:   { title: 'General LIC Abbreviations', accent: 'text-blue-700',   bg: 'bg-blue-50' },
  LIC_Internal_Codes:  { title: 'LIC Internal Codes',        accent: 'text-violet-700', bg: 'bg-violet-50' },
  Private_Insurers:    { title: 'Private Insurers',          accent: 'text-emerald-700',bg: 'bg-emerald-50' },
  Common_Policy_Terms: { title: 'Common Policy Terms',       accent: 'text-amber-700',  bg: 'bg-amber-50' },
};

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
  const [query, setQuery] = useState("");

  const filtered = useMemo<LICAbbreviationsData>(() => {
    if (!query.trim()) return data;
    const q = query.trim().toLowerCase();
    const match = (item: AbbreviationItem) =>
      item.abbreviation.toLowerCase().includes(q) ||
      item.full_form.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q);

    return {
      LIC_Abbreviations: data.LIC_Abbreviations.filter(match),
      LIC_Internal_Codes: data.LIC_Internal_Codes.filter(match),
      Private_Insurers: data.Private_Insurers.filter(match),
      Common_Policy_Terms: data.Common_Policy_Terms.filter(match),
    };
  }, [query]);

  const totalResults =
    filtered.LIC_Abbreviations.length + filtered.LIC_Internal_Codes.length +
    filtered.Private_Insurers.length + filtered.Common_Policy_Terms.length;
  const totalAll =
    data.LIC_Abbreviations.length + data.LIC_Internal_Codes.length +
    data.Private_Insurers.length + data.Common_Policy_Terms.length;

  return (
    <div className="min-h-screen bg-muted/30 flex flex-col">
      <Navigation />

      <main className="container mx-auto px-4 py-8 flex-1">
        <div className="max-w-6xl mx-auto">

          <div className="flex items-center gap-3 mb-6">
            <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <BookOpenText className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-form-header">Insurance Abbreviations & Codes</h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                Quick reference for LIC terminology, internal codes, private insurers, and common policy terms
              </p>
            </div>
          </div>

          <div className="relative max-w-md mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search abbreviation, full form, or description…"
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
            {(Object.keys(sectionMeta) as (keyof LICAbbreviationsData)[]).map((key) => (
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
              {totalResults} of {totalAll} entries match "{query}"
            </p>
          )}

          {totalResults === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-16">
              No abbreviations match "{query}".
            </p>
          ) : (
            <>
              <Section id="LIC_Abbreviations" title={sectionMeta.LIC_Abbreviations.title} accent={sectionMeta.LIC_Abbreviations.accent} bg={sectionMeta.LIC_Abbreviations.bg} items={filtered.LIC_Abbreviations} />
              <Section id="LIC_Internal_Codes" title={sectionMeta.LIC_Internal_Codes.title} accent={sectionMeta.LIC_Internal_Codes.accent} bg={sectionMeta.LIC_Internal_Codes.bg} items={filtered.LIC_Internal_Codes} />
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