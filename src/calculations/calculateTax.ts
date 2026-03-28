import Decimal from 'decimal.js';
import { NEW_TAX_BRACKETS, NEW_TAX_RELIEFS } from './newTaxBrackets';
import { OLD_TAX_BRACKETS, OLD_TAX_RELIEFS } from './oldTaxBrackets';

// Input interface for tax calculations
export interface TaxInput {
  grossAnnualIncome: Decimal;
  nhfContribution: Decimal;
  nhisContribution: Decimal;
  pensionContribution: Decimal;
  interestOnLoan: Decimal;
  lifeInsurancePremium: Decimal;
  annualRent: Decimal;
}

// Tax bracket calculation result
export interface TaxBracketResult {
  bracket: string;
  taxableIncome: Decimal;
  taxDue: Decimal;
  rate: Decimal;
  description: string;
}

// Complete tax calculation result
export interface TaxCalculationResult {
  // Income breakdown
  grossAnnualIncome: Decimal;
  totalDeductions: Decimal;
  taxableIncome: Decimal;

  // Tax calculation details
  taxBracketResults: TaxBracketResult[];
  totalTax: Decimal;

  // Summary
  monthlySalary: Decimal;
  monthlyTax: Decimal;
  effectiveTaxRate: Decimal;
  netAfterTaxMonthly: Decimal;

  // Breakdown of deductions
  deductions: {
    personalRelief?: Decimal;
    consolidatedReliefAllowance?: Decimal;
    rentRelief?: Decimal;
    nhfContribution: Decimal;
    nhisContribution: Decimal;
    pensionContribution: Decimal;
    interestOnLoan: Decimal;
    lifeInsurancePremium: Decimal;
  };
}

// Calculate tax using brackets (generic function)
function calculateTaxFromBrackets(
  taxableIncome: Decimal,
  brackets: Array<{
    min: Decimal;
    max: Decimal | null;
    rate: Decimal;
    description: string;
  }>,
): TaxBracketResult[] {
  const results: TaxBracketResult[] = [];
  let remainingIncome = taxableIncome;

  for (const bracket of brackets) {
    if (remainingIncome.isZero() || remainingIncome.isNegative()) {
      break;
    }

    const bracketMin = bracket.min;
    const bracketMax = bracket.max;

    // Calculate the income portion that falls in this bracket
    let incomeInBracket: Decimal;

    if (bracketMax === null) {
      // Unlimited bracket
      incomeInBracket = remainingIncome;
    } else {
      const bracketSize = bracketMax.minus(bracketMin);
      incomeInBracket = Decimal.min(remainingIncome, bracketSize);
    }

    if (incomeInBracket.greaterThan(0)) {
      const taxDue = incomeInBracket.times(bracket.rate);

      results.push({
        bracket: bracket.description,
        taxableIncome: incomeInBracket,
        taxDue: taxDue,
        rate: bracket.rate,
        description: `${bracket.description} @ ${bracket.rate.times(100).toFixed(0)}%`,
      });

      remainingIncome = remainingIncome.minus(incomeInBracket);
    }
  }

  return results;
}

// Calculate PAYE tax under NEW tax law
export function calculateNewLawTax(input: TaxInput): TaxCalculationResult {
  const {
    grossAnnualIncome,
    nhfContribution,
    nhisContribution,
    pensionContribution,
    interestOnLoan,
    lifeInsurancePremium,
    annualRent,
  } = input;

  // Calculate rent relief (capped at ₦500,000)
  const rentRelief = Decimal.min(
    annualRent,
    NEW_TAX_RELIEFS.rentRelief.maxAmount,
  );

  // Calculate total deductions
  const totalDeductions = nhfContribution
    .plus(nhisContribution)
    .plus(pensionContribution)
    .plus(interestOnLoan)
    .plus(lifeInsurancePremium)
    .plus(rentRelief);

  // Calculate taxable income
  const taxableIncome = Decimal.max(
    grossAnnualIncome.minus(totalDeductions),
    new Decimal(0),
  );

  // Calculate tax using new law brackets
  const taxBracketResults = calculateTaxFromBrackets(
    taxableIncome,
    NEW_TAX_BRACKETS,
  );
  const totalTax = taxBracketResults.reduce(
    (sum, bracket) => sum.plus(bracket.taxDue),
    new Decimal(0),
  );

  // Calculate summary values
  const monthlySalary = grossAnnualIncome.dividedBy(12);
  const monthlyTax = totalTax.dividedBy(12);
  const effectiveTaxRate = grossAnnualIncome.isZero()
    ? new Decimal(0)
    : totalTax.dividedBy(grossAnnualIncome);
  const netAfterTaxMonthly = monthlySalary.minus(monthlyTax);

  return {
    grossAnnualIncome,
    totalDeductions,
    taxableIncome,
    taxBracketResults,
    totalTax,
    monthlySalary,
    monthlyTax,
    effectiveTaxRate,
    netAfterTaxMonthly,
    deductions: {
      rentRelief,
      nhfContribution,
      nhisContribution,
      pensionContribution,
      interestOnLoan,
      lifeInsurancePremium,
    },
  };
}

// Calculate PAYE tax under OLD tax law
export function calculateOldLawTax(input: TaxInput): TaxCalculationResult {
  const {
    grossAnnualIncome,
    nhfContribution,
    nhisContribution,
    pensionContribution,
    interestOnLoan,
    lifeInsurancePremium,
  } = input;

  // Statutory deductions reduce assessable income first
  const statutoryDeductions = nhfContribution
    .plus(nhisContribution)
    .plus(pensionContribution)
    .plus(interestOnLoan)
    .plus(lifeInsurancePremium);

  // Assessable income = gross minus statutory deductions
  const assessableIncome = Decimal.max(
    grossAnnualIncome.minus(statutoryDeductions),
    new Decimal(0),
  );

  // Personal relief and CRA are computed on assessable income (not gross)
  const personalRelief = assessableIncome.times(OLD_TAX_RELIEFS.personalRelief.rate);
  const consolidatedReliefAllowance = Decimal.max(
    OLD_TAX_RELIEFS.consolidatedReliefAllowance.minAmount,
    assessableIncome.times(OLD_TAX_RELIEFS.consolidatedReliefAllowance.rate),
  );

  // Total deductions for display purposes
  const totalDeductions = statutoryDeductions
    .plus(personalRelief)
    .plus(consolidatedReliefAllowance);

  // Taxable income = assessable income minus personal relief and CRA
  const taxableIncome = Decimal.max(
    assessableIncome.minus(personalRelief).minus(consolidatedReliefAllowance),
    new Decimal(0),
  );

  // Calculate tax using old law brackets
  const taxBracketResults = calculateTaxFromBrackets(
    taxableIncome,
    OLD_TAX_BRACKETS,
  );
  const totalTax = taxBracketResults.reduce(
    (sum, bracket) => sum.plus(bracket.taxDue),
    new Decimal(0),
  );

  // Calculate summary values
  const monthlySalary = grossAnnualIncome.dividedBy(12);
  const monthlyTax = totalTax.dividedBy(12);
  const effectiveTaxRate = grossAnnualIncome.isZero()
    ? new Decimal(0)
    : totalTax.dividedBy(grossAnnualIncome);
  const netAfterTaxMonthly = monthlySalary.minus(monthlyTax);

  return {
    grossAnnualIncome,
    totalDeductions,
    taxableIncome,
    taxBracketResults,
    totalTax,
    monthlySalary,
    monthlyTax,
    effectiveTaxRate,
    netAfterTaxMonthly,
    deductions: {
      personalRelief,
      consolidatedReliefAllowance,
      nhfContribution,
      nhisContribution,
      pensionContribution,
      interestOnLoan,
      lifeInsurancePremium,
    },
  };
}

// Compare old law vs new law
export interface TaxComparison {
  oldLaw: TaxCalculationResult;
  newLaw: TaxCalculationResult;
  differences: {
    annualTaxDifference: Decimal;
    monthlyTaxDifference: Decimal;
    effectiveTaxRateDifference: Decimal;
    netPayDifference: Decimal;
    isNewLawBetter: boolean;
  };
}

export function compareTaxLaws(input: TaxInput): TaxComparison {
  const oldLaw = calculateOldLawTax(input);
  const newLaw = calculateNewLawTax(input);

  const annualTaxDifference = newLaw.totalTax.minus(oldLaw.totalTax);
  const monthlyTaxDifference = newLaw.monthlyTax.minus(oldLaw.monthlyTax);
  const effectiveTaxRateDifference = newLaw.effectiveTaxRate.minus(
    oldLaw.effectiveTaxRate,
  );
  const netPayDifference = newLaw.netAfterTaxMonthly.minus(
    oldLaw.netAfterTaxMonthly,
  );
  const isNewLawBetter = annualTaxDifference.isNegative();

  return {
    oldLaw,
    newLaw,
    differences: {
      annualTaxDifference,
      monthlyTaxDifference,
      effectiveTaxRateDifference,
      netPayDifference,
      isNewLawBetter,
    },
  };
}

// Utility function to create TaxInput from plain numbers
export function createTaxInput(params: {
  grossAnnualIncome: number | string;
  nhfContribution?: number | string;
  nhisContribution?: number | string;
  pensionContribution?: number | string;
  interestOnLoan?: number | string;
  lifeInsurancePremium?: number | string;
  annualRent?: number | string;
}): TaxInput {
  return {
    grossAnnualIncome: new Decimal(params.grossAnnualIncome),
    nhfContribution: new Decimal(params.nhfContribution || 0),
    nhisContribution: new Decimal(params.nhisContribution || 0),
    pensionContribution: new Decimal(params.pensionContribution || 0),
    interestOnLoan: new Decimal(params.interestOnLoan || 0),
    lifeInsurancePremium: new Decimal(params.lifeInsurancePremium || 0),
    annualRent: new Decimal(params.annualRent || 0),
  };
}
