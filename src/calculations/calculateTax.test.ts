import { describe, it, expect } from 'vitest';
import { createTaxInput, compareTaxLaws } from '../calculations/calculateTax';

describe('Tax Calculation Tests', () => {
  // Test data from fiscalreforms.ng example
  const testInput = createTaxInput({
    grossAnnualIncome: 60000000, // ₦60M
    nhfContribution: 0,
    nhisContribution: 0,
    pensionContribution: 0,
    interestOnLoan: 0,
    lifeInsurancePremium: 0,
    annualRent: 2500000, // ₦2.5M (should be capped at ₦500k for new law)
  });

  it('should calculate New Law tax correctly', () => {
    const comparison = compareTaxLaws(testInput);
    const newLaw = comparison.newLaw;

    // Expected: Rent Relief should be capped at ₦500,000
    expect(newLaw.deductions.rentRelief?.toNumber()).toBe(500000);

    // Expected: Taxable Income = ₦60M - ₦500K = ₦59.5M
    expect(newLaw.taxableIncome.toNumber()).toBe(59500000);

    // Expected: Total Tax = ₦12,805,000
    expect(newLaw.totalTax.toNumber()).toBe(12805000);

    // Expected: Monthly Tax = ₦1,067,083 (rounded)
    const expectedMonthlyTax = Math.round(12805000 / 12);
    const actualMonthlyTax = Math.round(newLaw.monthlyTax.toNumber());
    expect(actualMonthlyTax).toBe(expectedMonthlyTax);

    // Expected: Effective Tax Rate ≈ 21%
    const effectiveRate = newLaw.effectiveTaxRate.times(100).toNumber();
    expect(Math.round(effectiveRate)).toBe(21);
  });

  it('should calculate Old Law tax correctly', () => {
    const comparison = compareTaxLaws(testInput);
    const oldLaw = comparison.oldLaw;

    // Expected: Personal Relief = ₦12M
    expect(oldLaw.deductions.personalRelief?.toNumber()).toBe(12000000);

    // Expected: Consolidated Relief = ₦600K
    expect(oldLaw.deductions.consolidatedReliefAllowance?.toNumber()).toBe(
      600000,
    );

    // Expected: Taxable Income = ₦60M - ₦12M - ₦600K = ₦47.4M
    expect(oldLaw.taxableIncome.toNumber()).toBe(47400000);

    // Expected: Total Tax = ₦11,168,000
    expect(oldLaw.totalTax.toNumber()).toBe(11168000);

    // Expected: Monthly Tax = ₦930,667 (rounded)
    const expectedMonthlyTax = Math.round(11168000 / 12);
    const actualMonthlyTax = Math.round(oldLaw.monthlyTax.toNumber());
    expect(actualMonthlyTax).toBe(expectedMonthlyTax);

    // Expected: Effective Tax Rate ≈ 19%
    const effectiveRate = oldLaw.effectiveTaxRate.times(100).toNumber();
    expect(Math.round(effectiveRate)).toBe(19);
  });

  it('should calculate tax comparison correctly', () => {
    const comparison = compareTaxLaws(testInput);

    // Expected: New law should result in ₦1,637,000 more annually
    const annualDifference =
      comparison.differences.annualTaxDifference.toNumber();
    expect(annualDifference).toBe(1637000);

    // Expected: ₦136,417 more per month (rounded)
    const monthlyDifference = Math.round(
      comparison.differences.monthlyTaxDifference.toNumber(),
    );
    const expectedMonthlyDiff = Math.round(1637000 / 12);
    expect(monthlyDifference).toBe(expectedMonthlyDiff);

    // Expected: New law is NOT better (more tax)
    expect(comparison.differences.isNewLawBetter).toBe(false);

    // Expected: Effective tax rate difference ≈ 2-3%
    const rateDifference = comparison.differences.effectiveTaxRateDifference
      .times(100)
      .toNumber();
    expect(Math.round(rateDifference)).toBe(3); // Actual difference is closer to 3%
  });

  it('should handle edge cases correctly', () => {
    // Test with zero income
    const zeroIncomeInput = createTaxInput({
      grossAnnualIncome: 0,
      annualRent: 500000,
    });

    const zeroComparison = compareTaxLaws(zeroIncomeInput);
    expect(zeroComparison.newLaw.totalTax.toNumber()).toBe(0);
    expect(zeroComparison.oldLaw.totalTax.toNumber()).toBe(0);

    // Test with very low income (below tax threshold)
    const lowIncomeInput = createTaxInput({
      grossAnnualIncome: 500000, // ₦500K
      annualRent: 0,
    });

    const lowComparison = compareTaxLaws(lowIncomeInput);

    // New law: ₦500K is below ₦800K threshold, so no tax
    expect(lowComparison.newLaw.totalTax.toNumber()).toBe(0);

    // Old law: ₦500K - ₦12M - ₦600K = negative, so no tax
    expect(lowComparison.oldLaw.totalTax.toNumber()).toBe(0);
  });

  it('should calculate tax brackets correctly for New Law', () => {
    const comparison = compareTaxLaws(testInput);
    const brackets = comparison.newLaw.taxBracketResults;

    // Should have 6 brackets for ₦59.5M income
    expect(brackets.length).toBe(6);

    // Verify bracket calculations
    expect(brackets[0].taxableIncome.toNumber()).toBe(800000); // First ₦800K @ 0%
    expect(brackets[0].taxDue.toNumber()).toBe(0);

    expect(brackets[1].taxableIncome.toNumber()).toBe(2200000); // Next ₦2.2M @ 15%
    expect(brackets[1].taxDue.toNumber()).toBe(330000);

    expect(brackets[2].taxableIncome.toNumber()).toBe(9000000); // Next ₦9M @ 18%
    expect(brackets[2].taxDue.toNumber()).toBe(1620000);

    expect(brackets[3].taxableIncome.toNumber()).toBe(13000000); // Next ₦13M @ 21%
    expect(brackets[3].taxDue.toNumber()).toBe(2730000);

    expect(brackets[4].taxableIncome.toNumber()).toBe(25000000); // Next ₦25M @ 23%
    expect(brackets[4].taxDue.toNumber()).toBe(5750000);

    expect(brackets[5].taxableIncome.toNumber()).toBe(9500000); // Remaining ₦9.5M @ 25%
    expect(brackets[5].taxDue.toNumber()).toBe(2375000);

    // Total should equal expected tax
    const totalFromBrackets = brackets.reduce(
      (sum, bracket) => sum + bracket.taxDue.toNumber(),
      0,
    );
    expect(totalFromBrackets).toBe(12805000);
  });
});
