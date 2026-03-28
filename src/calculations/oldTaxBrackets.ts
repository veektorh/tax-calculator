import Decimal from 'decimal.js';

// Nigerian PAYE Tax Brackets - Old Tax Law (Pre-2024)
export interface OldTaxBracket {
  min: Decimal;
  max: Decimal | null; // null means unlimited
  rate: Decimal;
  description: string;
}

export interface OldTaxReliefs {
  personalRelief: {
    rate: Decimal; // percentage of gross income
    description: string;
  };
  consolidatedReliefAllowance: {
    minAmount: Decimal;
    rate: Decimal; // percentage of gross income; CRA = max(minAmount, rate * gross)
    description: string;
  };
}

// Old Tax Law Brackets (Current/Previous system)
export const OLD_TAX_BRACKETS: OldTaxBracket[] = [
  {
    min: new Decimal(0),
    max: new Decimal(300000),
    rate: new Decimal(0.07), // 7%
    description: 'First ₦300,000',
  },
  {
    min: new Decimal(300000),
    max: new Decimal(600000), // 300k + 300k = 600k
    rate: new Decimal(0.11), // 11%
    description: 'Next ₦300,000',
  },
  {
    min: new Decimal(600000),
    max: new Decimal(1100000), // 600k + 500k = 1.1M
    rate: new Decimal(0.15), // 15%
    description: 'Next ₦500,000',
  },
  {
    min: new Decimal(1100000),
    max: new Decimal(1600000), // 1.1M + 500k = 1.6M
    rate: new Decimal(0.19), // 19%
    description: 'Next ₦500,000',
  },
  {
    min: new Decimal(1600000),
    max: new Decimal(3200000), // 1.6M + 1.6M = 3.2M
    rate: new Decimal(0.21), // 21%
    description: 'Next ₦1,600,000',
  },
  {
    min: new Decimal(3200000),
    max: null, // Unlimited
    rate: new Decimal(0.24), // 24%
    description: 'Above ₦3,200,000',
  },
];

// Old Tax Law Reliefs
export const OLD_TAX_RELIEFS: OldTaxReliefs = {
  personalRelief: {
    rate: new Decimal(0.20), // 20% of gross income
    description: 'Personal relief allowance',
  },
  consolidatedReliefAllowance: {
    minAmount: new Decimal(200000), // ₦200k minimum
    rate: new Decimal(0.01),        // 1% of gross income
    description: 'Consolidated relief allowance',
  },
};

export default {
  OLD_TAX_BRACKETS,
  OLD_TAX_RELIEFS,
};
