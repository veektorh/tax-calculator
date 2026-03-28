import React, { useMemo } from 'react';
import Decimal from 'decimal.js';
import { TaxInput, TaxComparison } from '../types';
import {
  formatNaira,
  formatPercentage,
  calculateOptimalPension,
} from '../utils/formatting';
import { createTaxInput, compareTaxLaws } from '../calculations/calculateTax';
import {
  exportToPDF,
  exportToExcel,
  generateSummaryText,
  copyToClipboard,
} from '../utils/exportUtils';
import TaxCharts from './TaxCharts';

interface OptimizationPanelProps {
  taxInput: TaxInput;
  comparison: TaxComparison | null;
  onInputChange: (input: TaxInput) => void;
}

const OptimizationPanel: React.FC<OptimizationPanelProps> = ({
  taxInput,
  comparison,
  onInputChange,
}) => {
  const handleExportPDF = () => {
    if (comparison) {
      exportToPDF(comparison, taxInput);
    }
  };

  const handleExportExcel = () => {
    if (comparison) {
      exportToExcel(comparison, taxInput);
    }
  };

  const handleCopyText = () => {
    if (comparison) {
      const summary = generateSummaryText(comparison, taxInput);
      copyToClipboard(summary);
    }
  };
  const optimizations = useMemo(() => {
    if (!comparison) return [];

    const suggestions = [];
    const currentIncome = taxInput.grossAnnualIncome;

    // Pension optimization
    const optimalPension = calculateOptimalPension(currentIncome);
    if (
      optimalPension.recommendedContribution.greaterThan(
        taxInput.pensionContribution,
      )
    ) {
      const testInput = createTaxInput({
        grossAnnualIncome: taxInput.grossAnnualIncome.toString(),
        nhfContribution: taxInput.nhfContribution.toString(),
        nhisContribution: taxInput.nhisContribution.toString(),
        pensionContribution: optimalPension.recommendedContribution.toString(),
        interestOnLoan: taxInput.interestOnLoan.toString(),
        lifeInsurancePremium: taxInput.lifeInsurancePremium.toString(),
        annualRent: taxInput.annualRent.toString(),
      });

      const testComparison = compareTaxLaws(testInput);
      const savings = comparison.newLaw.totalTax.minus(
        testComparison.newLaw.totalTax,
      );

      suggestions.push({
        title: 'Maximize Pension Contribution',
        description: `Increase your pension contribution to ${formatNaira(optimalPension.recommendedContribution)} annually (8% of salary)`,
        currentValue: formatNaira(taxInput.pensionContribution),
        suggestedValue: formatNaira(optimalPension.recommendedContribution),
        annualSavings: savings,
        monthlySavings: savings.dividedBy(12),
        priority: 'high' as const,
        action: () => {
          onInputChange(testInput);
          // Auto-calculation will trigger via useEffect
        },
      });
    }

    // Rent relief optimization (for new law)
    const maxRentRelief = new Decimal(500000);
    if (
      taxInput.annualRent.lessThan(maxRentRelief) &&
      taxInput.annualRent.greaterThan(0)
    ) {
      suggestions.push({
        title: 'Consider Higher Rent Relief',
        description: `You can claim up to ${formatNaira(maxRentRelief)} in rent relief under the new law`,
        currentValue: formatNaira(taxInput.annualRent),
        suggestedValue: formatNaira(maxRentRelief),
        annualSavings: new Decimal(0), // Would need actual calculation
        monthlySavings: new Decimal(0),
        priority: 'medium' as const,
        note: 'Only applicable if you actually pay this much in rent',
      });
    }

    return suggestions;
  }, [taxInput, comparison, onInputChange]); // Remove onCalculate dependency

  const scenarioAnalysis = useMemo(() => {
    if (!comparison) return [];

    const scenarios = [
      { name: 'Current', multiplier: 1 },
      { name: '10% Raise', multiplier: 1.1 },
      { name: '25% Raise', multiplier: 1.25 },
      { name: '50% Raise', multiplier: 1.5 },
    ];

    return scenarios.map((scenario) => {
      const income = taxInput.grossAnnualIncome.times(scenario.multiplier);
      const testInput = createTaxInput({
        grossAnnualIncome: income.toString(),
        nhfContribution: taxInput.nhfContribution.toString(),
        nhisContribution: taxInput.nhisContribution.toString(),
        pensionContribution: taxInput.pensionContribution.toString(),
        interestOnLoan: taxInput.interestOnLoan.toString(),
        lifeInsurancePremium: taxInput.lifeInsurancePremium.toString(),
        annualRent: taxInput.annualRent.toString(),
      });

      const testComparison = compareTaxLaws(testInput);

      return {
        name: scenario.name,
        income,
        oldLawTax: testComparison.oldLaw.totalTax,
        newLawTax: testComparison.newLaw.totalTax,
        difference: testComparison.differences.annualTaxDifference,
        oldEffectiveRate: testComparison.oldLaw.effectiveTaxRate,
        newEffectiveRate: testComparison.newLaw.effectiveTaxRate,
      };
    });
  }, [taxInput, comparison]);

  return (
    <div className='space-y-8'>
      <div className='text-center'>
        <h2 className='text-3xl font-bold text-gray-900'>Tax Optimization</h2>
        <p className='text-gray-600 mt-2'>
          Discover ways to minimize your tax burden legally
        </p>
      </div>

      {/* Optimization Suggestions */}
      {optimizations.length > 0 ? (
        <div className='bg-white rounded-lg shadow-lg p-6'>
          <h3 className='text-xl font-semibold mb-6'>
            Optimization Suggestions
          </h3>

          <div className='space-y-6'>
            {optimizations.map((opt, index) => (
              <div
                key={index}
                className={`p-6 rounded-lg border-l-4 ${
                  opt.priority === 'high'
                    ? 'bg-green-50 border-green-500'
                    : opt.priority === 'medium'
                      ? 'bg-yellow-50 border-yellow-500'
                      : 'bg-blue-50 border-blue-500'
                }`}
              >
                <div className='flex justify-between items-start mb-3'>
                  <div>
                    <h4 className='font-semibold text-lg'>{opt.title}</h4>
                    <p className='text-gray-600 mt-1'>{opt.description}</p>
                    {opt.note && (
                      <p className='text-sm text-gray-500 mt-2 italic'>
                        {opt.note}
                      </p>
                    )}
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      opt.priority === 'high'
                        ? 'bg-green-100 text-green-800'
                        : opt.priority === 'medium'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {opt.priority} priority
                  </span>
                </div>

                <div className='grid grid-cols-2 md:grid-cols-4 gap-4 mb-4'>
                  <div>
                    <div className='text-sm text-gray-500'>Current</div>
                    <div className='font-medium'>{opt.currentValue}</div>
                  </div>
                  <div>
                    <div className='text-sm text-gray-500'>Suggested</div>
                    <div className='font-medium text-blue-600'>
                      {opt.suggestedValue}
                    </div>
                  </div>
                  <div>
                    <div className='text-sm text-gray-500'>Annual Savings</div>
                    <div className='font-medium text-green-600'>
                      {formatNaira(opt.annualSavings)}
                    </div>
                  </div>
                  <div>
                    <div className='text-sm text-gray-500'>Monthly Savings</div>
                    <div className='font-medium text-green-600'>
                      {formatNaira(opt.monthlySavings)}
                    </div>
                  </div>
                </div>

                {opt.action && (
                  <button
                    onClick={opt.action}
                    className='bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors'
                  >
                    Apply This Optimization
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className='bg-white rounded-lg shadow-lg p-6 text-center'>
          <div className='text-gray-500'>
            <p>No optimization suggestions available.</p>
            <p className='text-sm mt-2'>
              Your current setup appears to be well optimized!
            </p>
          </div>
        </div>
      )}

      {/* Scenario Analysis */}
      <div className='bg-white rounded-lg shadow-lg p-6'>
        <h3 className='text-xl font-semibold mb-6'>Salary Scenario Analysis</h3>
        <p className='text-gray-600 mb-6'>
          See how tax changes with different salary levels
        </p>

        <div className='overflow-x-auto'>
          <table className='w-full'>
            <thead className='bg-gray-50'>
              <tr>
                <th className='px-4 py-3 text-left text-sm font-medium text-gray-500'>
                  Scenario
                </th>
                <th className='px-4 py-3 text-left text-sm font-medium text-gray-500'>
                  Annual Income
                </th>
                <th className='px-4 py-3 text-left text-sm font-medium text-gray-500'>
                  Old Law Tax
                </th>
                <th className='px-4 py-3 text-left text-sm font-medium text-gray-500'>
                  New Law Tax
                </th>
                <th className='px-4 py-3 text-left text-sm font-medium text-gray-500'>
                  Difference
                </th>
                <th className='px-4 py-3 text-left text-sm font-medium text-gray-500'>
                  Effective Rate
                </th>
              </tr>
            </thead>
            <tbody className='divide-y divide-gray-200'>
              {scenarioAnalysis.map((scenario, index) => (
                <tr key={index} className={index === 0 ? 'bg-blue-50' : ''}>
                  <td className='px-4 py-3 font-medium'>
                    {scenario.name}
                    {index === 0 && (
                      <span className='ml-2 text-xs text-blue-600'>
                        (current)
                      </span>
                    )}
                  </td>
                  <td className='px-4 py-3'>{formatNaira(scenario.income)}</td>
                  <td className='px-4 py-3 text-red-600'>
                    {formatNaira(scenario.oldLawTax)}
                  </td>
                  <td className='px-4 py-3 text-blue-600'>
                    {formatNaira(scenario.newLawTax)}
                  </td>
                  <td
                    className={`px-4 py-3 font-medium ${
                      scenario.difference.isNegative()
                        ? 'text-green-600'
                        : 'text-red-600'
                    }`}
                  >
                    {scenario.difference.isNegative() ? '-' : '+'}
                    {formatNaira(scenario.difference.abs())}
                  </td>
                  <td className='px-4 py-3'>
                    <div className='text-sm'>
                      <div className='text-red-600'>
                        {formatPercentage(scenario.oldEffectiveRate)} old
                      </div>
                      <div className='text-blue-600'>
                        {formatPercentage(scenario.newEffectiveRate)} new
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Export & Share Section */}
      {comparison && (
        <div className='bg-white p-6 rounded-lg shadow-lg'>
          <h3 className='text-lg font-semibold mb-4'>Export & Share</h3>
          <div className='flex flex-wrap gap-3 mb-4'>
            <button
              onClick={handleExportPDF}
              className='px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 flex items-center gap-2'
            >
              <span>📄</span>
              Export PDF Report
            </button>
            <button
              onClick={handleExportExcel}
              className='px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center gap-2'
            >
              <span>📊</span>
              Export Excel Data
            </button>
            <button
              onClick={handleCopyText}
              className='px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2'
            >
              <span>📋</span>
              Copy Summary
            </button>
          </div>
        </div>
      )}

      {/* Tax Analysis Charts */}
      {comparison && (
        <div className='bg-white p-6 rounded-lg shadow-lg'>
          <h3 className='text-lg font-semibold mb-6'>Tax Analysis Charts</h3>
          <TaxCharts comparison={comparison} />
        </div>
      )}

      {/* Tips */}
      <div className='bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6'>
        <h3 className='text-lg font-semibold mb-4'>💡 Tax Planning Tips</h3>
        <div className='grid md:grid-cols-2 gap-6'>
          <div>
            <h4 className='font-medium mb-2'>Maximize Deductions</h4>
            <ul className='text-sm space-y-1 text-gray-600'>
              <li>• Contribute 8% of salary to pension (tax deductible)</li>
              <li>• Keep receipts for rent, mortgage interest</li>
              <li>• Consider life insurance premiums</li>
            </ul>
          </div>
          <div>
            <h4 className='font-medium mb-2'>Plan Ahead</h4>
            <ul className='text-sm space-y-1 text-gray-600'>
              <li>• Review your tax position quarterly</li>
              <li>• Plan major purchases around tax benefits</li>
              <li>• Consult a tax professional for complex situations</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OptimizationPanel;
