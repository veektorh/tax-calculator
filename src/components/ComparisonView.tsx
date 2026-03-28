import React from 'react';
import { ComparisonViewProps } from '../types';
import { formatNaira, formatPercentage } from '../utils/formatting';

const ComparisonView: React.FC<ComparisonViewProps> = ({
  comparison,
  isLoading,
}) => {
  if (isLoading) {
    return (
      <div className='bg-white rounded-lg shadow-lg p-6'>
        <div className='flex items-center justify-center h-64'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600'></div>
          <span className='ml-3 text-gray-600'>Calculating taxes...</span>
        </div>
      </div>
    );
  }

  if (!comparison) {
    return (
      <div className='bg-white rounded-lg shadow-lg p-6'>
        <div className='text-center text-gray-500 py-8'>
          <p>
            Enter your income details and click calculate to see tax comparison
          </p>
        </div>
      </div>
    );
  }

  const { oldLaw, newLaw, differences } = comparison;

  return (
    <div className='space-y-6'>
      {/* Summary Cards */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        <div className='bg-red-50 border-l-4 border-red-500 p-4 rounded-lg'>
          <div className='text-sm font-medium text-red-800'>
            Old Law (Current)
          </div>
          <div className='text-2xl font-bold text-red-900'>
            {formatNaira(oldLaw.monthlyTax)}/month
          </div>
          <div className='text-sm text-red-600'>
            {formatPercentage(oldLaw.effectiveTaxRate)} effective rate
          </div>
        </div>

        <div className='bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg'>
          <div className='text-sm font-medium text-blue-800'>
            New Law (Proposed)
          </div>
          <div className='text-2xl font-bold text-blue-900'>
            {formatNaira(newLaw.monthlyTax)}/month
          </div>
          <div className='text-sm text-blue-600'>
            {formatPercentage(newLaw.effectiveTaxRate)} effective rate
          </div>
        </div>
      </div>

      {/* Impact Summary */}
      <div
        className={`p-6 rounded-lg border-l-4 ${
          differences.isNewLawBetter
            ? 'bg-green-50 border-green-500'
            : 'bg-yellow-50 border-yellow-500'
        }`}
      >
        <h3 className='font-semibold text-lg mb-3'>Tax Impact Summary</h3>
        <div className='space-y-2'>
          <div className='flex justify-between'>
            <span>Monthly Tax Difference:</span>
            <span
              className={`font-semibold ${
                differences.monthlyTaxDifference.isNegative()
                  ? 'text-green-600'
                  : 'text-red-600'
              }`}
            >
              {differences.monthlyTaxDifference.isNegative() ? '-' : '+'}
              {formatNaira(differences.monthlyTaxDifference.abs())}
            </span>
          </div>
          <div className='flex justify-between'>
            <span>Annual Tax Difference:</span>
            <span
              className={`font-semibold ${
                differences.annualTaxDifference.isNegative()
                  ? 'text-green-600'
                  : 'text-red-600'
              }`}
            >
              {differences.annualTaxDifference.isNegative() ? '-' : '+'}
              {formatNaira(differences.annualTaxDifference.abs())}
            </span>
          </div>
          <div className='flex justify-between'>
            <span>Net Take-home Change:</span>
            <span
              className={`font-semibold ${
                differences.netPayDifference.isPositive()
                  ? 'text-green-600'
                  : 'text-red-600'
              }`}
            >
              {differences.netPayDifference.isNegative() ? '-' : '+'}
              {formatNaira(differences.netPayDifference.abs())}/month
            </span>
          </div>
        </div>

        <div className='mt-4 p-3 rounded bg-white/50'>
          <p className='text-sm'>
            {differences.isNewLawBetter
              ? '✅ The new tax law would result in lower taxes for you'
              : '⚠️ The new tax law would result in higher taxes for you'}
          </p>
        </div>
      </div>

      {/* Detailed Breakdown */}
      <div className='bg-white rounded-lg shadow-lg overflow-hidden'>
        <div className='px-6 py-4 bg-gray-50 border-b'>
          <h3 className='font-semibold text-lg'>Detailed Tax Breakdown</h3>
        </div>

        <div className='overflow-x-auto'>
          <table className='w-full'>
            <thead className='bg-gray-50'>
              <tr>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Item
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Old Law
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  New Law
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Difference
                </th>
              </tr>
            </thead>
            <tbody className='bg-white divide-y divide-gray-200'>
              <tr>
                <td className='px-6 py-4 text-sm font-medium text-gray-900'>
                  Gross Annual Income
                </td>
                <td className='px-6 py-4 text-sm text-gray-900'>
                  {formatNaira(oldLaw.grossAnnualIncome)}
                </td>
                <td className='px-6 py-4 text-sm text-gray-900'>
                  {formatNaira(newLaw.grossAnnualIncome)}
                </td>
                <td className='px-6 py-4 text-sm text-gray-500'>—</td>
              </tr>
              <tr>
                <td className='px-6 py-4 text-sm font-medium text-gray-900'>
                  Total Deductions
                </td>
                <td className='px-6 py-4 text-sm text-gray-900'>
                  {formatNaira(oldLaw.totalDeductions)}
                </td>
                <td className='px-6 py-4 text-sm text-gray-900'>
                  {formatNaira(newLaw.totalDeductions)}
                </td>
                <td className='px-6 py-4 text-sm text-gray-500'>
                  {formatNaira(
                    newLaw.totalDeductions.minus(oldLaw.totalDeductions),
                  )}
                </td>
              </tr>
              <tr>
                <td className='px-6 py-4 text-sm font-medium text-gray-900'>
                  Taxable Income
                </td>
                <td className='px-6 py-4 text-sm text-gray-900'>
                  {formatNaira(oldLaw.taxableIncome)}
                </td>
                <td className='px-6 py-4 text-sm text-gray-900'>
                  {formatNaira(newLaw.taxableIncome)}
                </td>
                <td className='px-6 py-4 text-sm text-gray-500'>
                  {formatNaira(
                    newLaw.taxableIncome.minus(oldLaw.taxableIncome),
                  )}
                </td>
              </tr>
              <tr className='bg-gray-50'>
                <td className='px-6 py-4 text-sm font-bold text-gray-900'>
                  Annual Tax
                </td>
                <td className='px-6 py-4 text-sm font-bold text-red-600'>
                  {formatNaira(oldLaw.totalTax)}
                </td>
                <td className='px-6 py-4 text-sm font-bold text-blue-600'>
                  {formatNaira(newLaw.totalTax)}
                </td>
                <td
                  className={`px-6 py-4 text-sm font-bold ${
                    differences.annualTaxDifference.isNegative()
                      ? 'text-green-600'
                      : 'text-red-600'
                  }`}
                >
                  {differences.annualTaxDifference.isNegative() ? '-' : '+'}
                  {formatNaira(differences.annualTaxDifference.abs())}
                </td>
              </tr>
              <tr>
                <td className='px-6 py-4 text-sm font-medium text-gray-900'>
                  Monthly Tax
                </td>
                <td className='px-6 py-4 text-sm text-red-600'>
                  {formatNaira(oldLaw.monthlyTax)}
                </td>
                <td className='px-6 py-4 text-sm text-blue-600'>
                  {formatNaira(newLaw.monthlyTax)}
                </td>
                <td
                  className={`px-6 py-4 text-sm font-medium ${
                    differences.monthlyTaxDifference.isNegative()
                      ? 'text-green-600'
                      : 'text-red-600'
                  }`}
                >
                  {differences.monthlyTaxDifference.isNegative() ? '-' : '+'}
                  {formatNaira(differences.monthlyTaxDifference.abs())}
                </td>
              </tr>
              <tr>
                <td className='px-6 py-4 text-sm font-medium text-gray-900'>
                  Net After-Tax (Monthly)
                </td>
                <td className='px-6 py-4 text-sm text-gray-900'>
                  {formatNaira(oldLaw.netAfterTaxMonthly)}
                </td>
                <td className='px-6 py-4 text-sm text-gray-900'>
                  {formatNaira(newLaw.netAfterTaxMonthly)}
                </td>
                <td
                  className={`px-6 py-4 text-sm font-medium ${
                    differences.netPayDifference.isPositive()
                      ? 'text-green-600'
                      : 'text-red-600'
                  }`}
                >
                  {differences.netPayDifference.isNegative() ? '-' : '+'}
                  {formatNaira(differences.netPayDifference.abs())}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Tax Bracket Breakdown */}
      <div className='grid md:grid-cols-2 gap-6'>
        <TaxBracketBreakdown
          title='Old Law Tax Brackets'
          results={oldLaw.taxBracketResults}
          color='red'
        />
        <TaxBracketBreakdown
          title='New Law Tax Brackets'
          results={newLaw.taxBracketResults}
          color='blue'
        />
      </div>
    </div>
  );
};

interface TaxBracketBreakdownProps {
  title: string;
  results: any[];
  color: 'red' | 'blue';
}

const TaxBracketBreakdown: React.FC<TaxBracketBreakdownProps> = ({
  title,
  results,
  color,
}) => {
  const colorClasses = {
    red: 'border-red-500 bg-red-50',
    blue: 'border-blue-500 bg-blue-50',
  };

  return (
    <div className='bg-white rounded-lg shadow-lg overflow-hidden'>
      <div className={`px-6 py-4 border-b border-l-4 ${colorClasses[color]}`}>
        <h4 className='font-semibold text-lg'>{title}</h4>
      </div>

      <div className='p-6'>
        <div className='space-y-3'>
          {results.map((bracket, index) => (
            <div
              key={index}
              className='flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0'
            >
              <div className='flex-1'>
                <div className='text-sm font-medium text-gray-900'>
                  {bracket.bracket}
                </div>
                <div className='text-xs text-gray-500'>
                  {formatNaira(bracket.taxableIncome)} @{' '}
                  {formatPercentage(bracket.rate)}
                </div>
              </div>
              <div className='text-sm font-semibold text-gray-900'>
                {formatNaira(bracket.taxDue)}
              </div>
            </div>
          ))}
        </div>

        <div className='mt-4 pt-3 border-t border-gray-200'>
          <div className='flex justify-between items-center font-bold'>
            <span>Total Tax:</span>
            <span
              className={color === 'red' ? 'text-red-600' : 'text-blue-600'}
            >
              {formatNaira(
                results.reduce(
                  (sum, bracket) => sum.plus(bracket.taxDue),
                  new (results[0]?.taxDue.constructor || Number)(0),
                ),
              )}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComparisonView;
