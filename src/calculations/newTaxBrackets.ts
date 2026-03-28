import Decimal from 'decimal.js';

// Nigerian PAYE Tax Brackets - New Tax Law (2024+)
export interface TaxBracket {
  min: Decimal;
  max: Decimal | null; // null means unlimited
  rate: Decimal;
  description: string;
}

export interface TaxReliefs {
  rentRelief: {
    maxAmount: Decimal;
    description: string;
  };
}

// New Tax Law Brackets (as per the proposed Nigeria Tax Bill)
export const NEW_TAX_BRACKETS: TaxBracket[] = [
  {
    min: new Decimal(0),
    max: new Decimal(800000),
    rate: new Decimal(0), // 0%
    description: 'First ₦800,000',
  },
  {
    min: new Decimal(800000),
    max: new Decimal(3000000), // 800k + 2.2M = 3M
    rate: new Decimal(0.15), // 15%
    description: 'Next ₦2,200,000',
  },
  {
    min: new Decimal(3000000),
    max: new Decimal(12000000), // 3M + 9M = 12M
    rate: new Decimal(0.18), // 18%
    description: 'Next ₦9,000,000',
  },
  {
    min: new Decimal(12000000),
    max: new Decimal(25000000), // 12M + 13M = 25M
    rate: new Decimal(0.21), // 21%
    description: 'Next ₦13,000,000',
  },
  {
    min: new Decimal(25000000),
    max: new Decimal(50000000), // 25M + 25M = 50M
    rate: new Decimal(0.23), // 23%
    description: 'Next ₦25,000,000',
  },
  {
    min: new Decimal(50000000),
    max: null, // Unlimited
    rate: new Decimal(0.25), // 25%
    description: 'Above ₦50,000,000',
  },
];

// New Tax Law Reliefs
export const NEW_TAX_RELIEFS: TaxReliefs = {
  rentRelief: {
    maxAmount: new Decimal(500000), // Maximum rent relief of ₦500,000
    description: 'Annual rent relief (capped at ₦500,000)',
  },
};

export default {
  NEW_TAX_BRACKETS,
  NEW_TAX_RELIEFS,
};
