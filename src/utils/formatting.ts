import Decimal from 'decimal.js';

// Nigerian currency formatter
export const formatNaira = (
  amount: Decimal | number | string,
  options: {
    showSymbol?: boolean;
    decimalPlaces?: number;
    compact?: boolean;
  } = {},
): string => {
  const { showSymbol = true, decimalPlaces = 0, compact = false } = options;

  let value: Decimal;

  try {
    if (amount instanceof Decimal) {
      value = amount;
    } else if (amount === null || amount === undefined || amount === '') {
      value = new Decimal(0);
    } else if (
      typeof amount === 'number' &&
      (isNaN(amount) || !isFinite(amount))
    ) {
      value = new Decimal(0);
    } else {
      // Clean the string value
      const cleanAmount =
        typeof amount === 'string'
          ? amount.replace(/[₦,\s]/g, '').trim()
          : String(amount);

      if (
        cleanAmount === '' ||
        cleanAmount === 'undefined' ||
        cleanAmount === 'null'
      ) {
        value = new Decimal(0);
      } else {
        value = new Decimal(cleanAmount);
      }
    }
  } catch (error) {
    console.warn('formatNaira: Invalid amount:', amount, 'Using 0 as fallback');
    value = new Decimal(0);
  }

  // Format with Nigerian locale
  const formatter = new Intl.NumberFormat('en-NG', {
    style: showSymbol ? 'currency' : 'decimal',
    currency: 'NGN',
    minimumFractionDigits: decimalPlaces,
    maximumFractionDigits: decimalPlaces,
    notation: compact ? 'compact' : 'standard',
  });

  return formatter.format(value.toNumber());
};

// Parse Nigerian currency string to Decimal
export const parseNaira = (value: string): Decimal => {
  // Remove currency symbol, spaces, and commas
  const cleanValue = value
    .replace(/₦/g, '')
    .replace(/,/g, '')
    .replace(/\s/g, '')
    .trim();

  // Validate that it's a valid number
  if (!/^\d*\.?\d*$/.test(cleanValue)) {
    throw new Error('Invalid currency format');
  }

  return new Decimal(cleanValue || '0');
};

// Format percentage
export const formatPercentage = (
  rate: Decimal | number,
  decimalPlaces: number = 0,
): string => {
  const value = rate instanceof Decimal ? rate : new Decimal(rate);
  const percentage = value.times(100);

  return `${percentage.toFixed(decimalPlaces)}%`;
};

// Validate numeric input
export const validateNumericInput = (
  value: string,
): {
  isValid: boolean;
  error?: string;
  parsed?: Decimal;
} => {
  try {
    const cleaned = value.replace(/[₦,\s]/g, '');

    if (cleaned === '') {
      return { isValid: true, parsed: new Decimal(0) };
    }

    if (!/^\d*\.?\d*$/.test(cleaned)) {
      return {
        isValid: false,
        error: 'Please enter a valid number',
      };
    }

    const parsed = new Decimal(cleaned);

    if (parsed.isNegative()) {
      return {
        isValid: false,
        error: 'Amount cannot be negative',
      };
    }

    if (parsed.greaterThan('999999999999')) {
      return {
        isValid: false,
        error: 'Amount is too large',
      };
    }

    return {
      isValid: true,
      parsed,
    };
  } catch (error) {
    return {
      isValid: false,
      error: 'Invalid number format',
    };
  }
};

// Format number for input (with commas but no currency symbol)
export const formatNumberInput = (value: Decimal | number | string): string => {
  const decimal = value instanceof Decimal ? value : new Decimal(value);

  if (decimal.isZero()) {
    return '';
  }

  return new Intl.NumberFormat('en-US', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(decimal.toNumber());
};

// Calculate optimal pension contribution for tax savings
export const calculateOptimalPension = (
  grossIncome: Decimal,
  maxRate: Decimal = new Decimal(0.08),
): {
  recommendedContribution: Decimal;
  taxSavings: Decimal;
  netBenefit: Decimal;
} => {
  const maxPensionableIncome = new Decimal(18000000); // ₦18M cap
  const pensionableIncome = Decimal.min(grossIncome, maxPensionableIncome);
  const recommendedContribution = pensionableIncome.times(maxRate);

  // Estimate tax savings (simplified - assumes marginal tax rate)
  const marginalTaxRate = grossIncome.greaterThan(50000000)
    ? new Decimal(0.25)
    : grossIncome.greaterThan(25000000)
      ? new Decimal(0.23)
      : grossIncome.greaterThan(12000000)
        ? new Decimal(0.21)
        : grossIncome.greaterThan(3000000)
          ? new Decimal(0.18)
          : grossIncome.greaterThan(800000)
            ? new Decimal(0.15)
            : new Decimal(0);

  const taxSavings = recommendedContribution.times(marginalTaxRate);
  const netBenefit = taxSavings; // Simplified - actual benefit includes pension value

  return {
    recommendedContribution,
    taxSavings,
    netBenefit,
  };
};

// Constants for common validation
export const VALIDATION_LIMITS = {
  MIN_SALARY: new Decimal(0),
  MAX_SALARY: new Decimal(1000000000), // ₦1B max
  MAX_DEDUCTION_PERCENTAGE: new Decimal(0.9), // 90% of salary max for all deductions
};

// Helper to check if deductions are reasonable
export const validateDeductions = (
  grossIncome: Decimal,
  totalDeductions: Decimal,
): {
  isValid: boolean;
  warning?: string;
} => {
  const deductionPercentage = grossIncome.isZero()
    ? new Decimal(0)
    : totalDeductions.dividedBy(grossIncome);

  if (
    deductionPercentage.greaterThan(VALIDATION_LIMITS.MAX_DEDUCTION_PERCENTAGE)
  ) {
    return {
      isValid: false,
      warning:
        'Deductions exceed 90% of gross income. Please verify your inputs.',
    };
  }

  if (deductionPercentage.greaterThan(0.5)) {
    return {
      isValid: true,
      warning:
        'Deductions are high (over 50% of income). Please verify this is correct.',
    };
  }

  return { isValid: true };
};

// Generate quick scenario suggestions
export const getScenarioSuggestions = (currentIncome: Decimal) => {
  const base = currentIncome.toNumber();

  return [
    {
      name: 'Current Salary',
      income: base,
      description: 'Your current salary configuration',
    },
    {
      name: '10% Salary Increase',
      income: base * 1.1,
      description: 'How would a 10% raise affect your tax?',
    },
    {
      name: '25% Salary Increase',
      income: base * 1.25,
      description: 'Tax impact of a significant promotion',
    },
    {
      name: 'With Max Pension',
      income: base,
      description: 'Maximum pension contribution (8% of income)',
      pensionContribution: Math.min(base * 0.08, 18000000 * 0.08),
    },
  ];
};
