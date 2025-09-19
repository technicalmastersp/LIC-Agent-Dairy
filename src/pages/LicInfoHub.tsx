import Footer from '@/components/Footer';
import Navigation from '@/components/Navigation';
import React from 'react';

type AbbreviationItem = {
  abbreviation: string;
  full_form: string;
  description: string;
};

type LICAbbreviationsData = {
  LIC_Abbreviations: AbbreviationItem[];
  LIC_Internal_Codes: AbbreviationItem[];
  Private_Insurers: AbbreviationItem[];
};

const data: LICAbbreviationsData = {
  LIC_Abbreviations: [
    {
      abbreviation: 'LIC',
      full_form: 'Life Insurance Corporation',
      description: "India's largest government-owned life insurance company"
    },
    {
      abbreviation: 'DOC',
      full_form: 'Date of Commencement',
      description: 'Start date of the insurance policy'
    },
    {
      abbreviation: 'DLP',
      full_form: 'Date of Last Premium',
      description: 'Date when the last premium was paid'
    },
    {
      abbreviation: 'DOM',
      full_form: 'Date of Maturity',
      description: 'Date when the policy matures'
    },
    {
      abbreviation: 'DOD',
      full_form: 'Date of Death',
      description: 'Date on which the life assured dies'
    },
    {
      abbreviation: 'Maturity Date',
      full_form: '—',
      description: 'Date when the policy term ends and benefits are payable'
    },
    {
      abbreviation: 'SA',
      full_form: 'Sum Assured',
      description: 'Guaranteed amount payable on death/maturity'
    },
    {
      abbreviation: 'PA',
      full_form: 'Proposer/Policyholder Address',
      description: 'The address of the person who owns the policy'
    },
    {
      abbreviation: 'LA',
      full_form: 'Life Assured',
      description: 'The person whose life is insured'
    },
    {
      abbreviation: 'DOB',
      full_form: 'Date of Birth',
      description: 'Used for age calculation and underwriting'
    },
    {
      abbreviation: 'FUP',
      full_form: 'First Unpaid Premium',
      description: 'The first missed premium date'
    },
    {
      abbreviation: 'LUP',
      full_form: 'Last Unpaid Premium',
      description: 'The final unpaid premium before policy lapses'
    },
    {
      abbreviation: 'HPR',
      full_form: 'History of Premium Receipt',
      description: 'Record of paid premiums'
    },
    {
      abbreviation: 'NAV',
      full_form: 'Net Asset Value',
      description: 'Used in ULIPs for fund value calculation'
    },
    {
      abbreviation: 'ULIP',
      full_form: 'Unit Linked Insurance Plan',
      description: 'A mix of insurance and investment'
    },
    {
      abbreviation: 'NACH',
      full_form: 'National Automated Clearing House',
      description: 'System for auto-debiting premiums from bank accounts'
    },
    {
      abbreviation: 'NEFT',
      full_form: 'National Electronic Funds Transfer',
      description: "For direct credit of claim/maturity to policyholder's account"
    },
    {
      abbreviation: 'ECS',
      full_form: 'Electronic Clearing System',
      description: 'Used for auto payment of premiums'
    },
    {
      abbreviation: 'TPA',
      full_form: 'Third Party Administrator',
      description: 'Handles claims in health insurance'
    },
    {
      abbreviation: 'GST',
      full_form: 'Goods and Services Tax',
      description: 'Tax levied on insurance premiums'
    },
    {
      abbreviation: 'IRDAI',
      full_form: 'Insurance Regulatory and Development Authority of India',
      description: 'Regulatory body for insurance in India'
    },
    {
      abbreviation: 'TDS',
      full_form: 'Tax Deducted at Source',
      description: 'Tax deducted on certain payouts like commissions or maturity benefits'
    },
    {
      abbreviation: 'KYC',
      full_form: 'Know Your Customer',
      description: 'Verification process of identity and address'
    },
    {
      abbreviation: 'PAN',
      full_form: 'Permanent Account Number',
      description: 'Used for tax and financial transactions'
    }
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
    { abbreviation: 'DO', full_form: 'Development Officer', description: '' }
  ],
  Private_Insurers: [
    {
      abbreviation: 'SBI Life',
      full_form: 'SBI Life Insurance',
      description: 'Private life insurance company'
    },
    {
      abbreviation: 'HDFC Life',
      full_form: 'HDFC Life Insurance',
      description: 'Private life insurance company'
    },
    {
      abbreviation: 'ICICI Pru Life',
      full_form: 'ICICI Prudential Life Insurance',
      description: 'Private life insurance company'
    }
  ]
};

const Section = ({
  title,
  items
}: {
  title: string;
  items: AbbreviationItem[];
}) => (
  <div className="mb-8">
    <h2 className="text-2xl font-semibold mb-4 text-blue-700 border-b border-blue-300 pb-2">{title}</h2>
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {items.map((item, index) => (
        <div
          key={index}
          className="bg-white p-4 shadow rounded border border-gray-200 hover:shadow-lg transition"
        >
          <h3 className="text-lg font-bold text-blue-800">{item.abbreviation}</h3>
          <p className="text-gray-700"><strong>Full Form:</strong> {item.full_form}</p>
          {item.description && (
            <p className="text-gray-600 mt-1">{item.description}</p>
          )}
        </div>
      ))}
    </div>
  </div>
);

const LicInfoHub: React.FC = () => {
  return (
    <div className="min-h-screen bg-muted/30 flex flex-col">
      <Navigation />

      <main className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold text-center text-blue-900 mb-10">LIC Abbreviations & Codes</h1>
          <Section title="General LIC Abbreviations" items={data.LIC_Abbreviations} />
          <Section title="LIC Internal Codes" items={data.LIC_Internal_Codes} />
          <Section title="Private Insurers" items={data.Private_Insurers} />
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default LicInfoHub;
