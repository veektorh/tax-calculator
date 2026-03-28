import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';
import { TaxComparison } from '../types';
import { formatNaira } from '../utils/formatting';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
);

interface TaxChartsProps {
  comparison: TaxComparison;
}

const TaxCharts: React.FC<TaxChartsProps> = ({ comparison }) => {
  const { oldLaw, newLaw, differences } = comparison;

  // Pie chart data for tax breakdown (Old Law)
  const oldLawPieData = {
    labels: ['Tax', 'Take-home'],
    datasets: [
      {
        data: [
          oldLaw.totalTax.toNumber(),
          oldLaw.grossAnnualIncome.minus(oldLaw.totalTax).toNumber(),
        ],
        backgroundColor: ['#ef4444', '#22c55e'],
        borderColor: ['#dc2626', '#16a34a'],
        borderWidth: 2,
      },
    ],
  };

  // Pie chart data for tax breakdown (New Law)
  const newLawPieData = {
    labels: ['Tax', 'Take-home'],
    datasets: [
      {
        data: [
          newLaw.totalTax.toNumber(),
          newLaw.grossAnnualIncome.minus(newLaw.totalTax).toNumber(),
        ],
        backgroundColor: ['#3b82f6', '#22c55e'],
        borderColor: ['#2563eb', '#16a34a'],
        borderWidth: 2,
      },
    ],
  };

  // Bar chart data for comparison
  const comparisonBarData = {
    labels: ['Monthly Tax', 'Monthly Take-home', 'Effective Rate (%)'],
    datasets: [
      {
        label: 'Old Law',
        data: [
          oldLaw.monthlyTax.toNumber(),
          oldLaw.netAfterTaxMonthly.toNumber(),
          oldLaw.effectiveTaxRate.times(100).toNumber(),
        ],
        backgroundColor: '#ef4444',
        borderColor: '#dc2626',
        borderWidth: 1,
      },
      {
        label: 'New Law',
        data: [
          newLaw.monthlyTax.toNumber(),
          newLaw.netAfterTaxMonthly.toNumber(),
          newLaw.effectiveTaxRate.times(100).toNumber(),
        ],
        backgroundColor: '#3b82f6',
        borderColor: '#2563eb',
        borderWidth: 1,
      },
    ],
  };

  // Tax bracket breakdown bar chart
  const bracketLabels = oldLaw.taxBracketResults.map((bracket) =>
    bracket.bracket
      .replace('₦', '')
      .replace(',000', 'K')
      .replace(',000,000', 'M'),
  );

  const bracketBarData = {
    labels: bracketLabels,
    datasets: [
      {
        label: 'Old Law Tax by Bracket',
        data: oldLaw.taxBracketResults.map((bracket) =>
          bracket.taxDue.toNumber(),
        ),
        backgroundColor: '#ef4444',
        borderColor: '#dc2626',
        borderWidth: 1,
      },
      {
        label: 'New Law Tax by Bracket',
        data: newLaw.taxBracketResults.map((bracket) =>
          bracket.taxDue.toNumber(),
        ),
        backgroundColor: '#3b82f6',
        borderColor: '#2563eb',
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      tooltip: {
        callbacks: {
          label: function (context: any) {
            const value = context.parsed.y ?? context.raw;
            if (
              context.datasetIndex !== undefined &&
              context.label?.includes('Rate')
            ) {
              return `${context.dataset.label}: ${value.toFixed(1)}%`;
            }
            return `${context.dataset.label}: ₦${value.toLocaleString()}`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function (value: any) {
            return '₦' + value.toLocaleString();
          },
        },
      },
    },
  };

  const pieOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
      tooltip: {
        callbacks: {
          label: function (context: any) {
            const value = context.raw;
            const total = context.dataset.data.reduce(
              (a: number, b: number) => a + b,
              0,
            );
            const percentage = ((value / total) * 100).toFixed(1);
            return `${context.label}: ₦${value.toLocaleString()} (${percentage}%)`;
          },
        },
      },
    },
  };

  return (
    <div className='space-y-8'>
      {/* Tax Breakdown Pie Charts */}
      <div className='grid md:grid-cols-2 gap-8'>
        <div className='bg-white p-6 rounded-lg shadow-lg'>
          <h3 className='text-lg font-semibold mb-4 text-center text-red-600'>
            Old Law: Tax vs Take-home
          </h3>
          <div className='h-64'>
            <Pie data={oldLawPieData} options={pieOptions} />
          </div>
        </div>

        <div className='bg-white p-6 rounded-lg shadow-lg'>
          <h3 className='text-lg font-semibold mb-4 text-center text-blue-600'>
            New Law: Tax vs Take-home
          </h3>
          <div className='h-64'>
            <Pie data={newLawPieData} options={pieOptions} />
          </div>
        </div>
      </div>

      {/* Comparison Bar Chart */}
      <div className='bg-white p-6 rounded-lg shadow-lg'>
        <h3 className='text-lg font-semibold mb-4 text-center'>
          Old Law vs New Law Comparison
        </h3>
        <div className='h-80'>
          <Bar data={comparisonBarData} options={chartOptions} />
        </div>
      </div>

      {/* Tax Bracket Breakdown */}
      <div className='bg-white p-6 rounded-lg shadow-lg'>
        <h3 className='text-lg font-semibold mb-4 text-center'>
          Tax by Income Bracket
        </h3>
        <div className='h-80'>
          <Bar data={bracketBarData} options={chartOptions} />
        </div>
      </div>

      {/* Impact Summary Visual */}
      <div className='bg-white p-6 rounded-lg shadow-lg'>
        <h3 className='text-lg font-semibold mb-4 text-center'>
          Tax Impact Summary
        </h3>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-6 text-center'>
          <div className='p-4 rounded-lg bg-yellow-50 border border-yellow-200'>
            <div className='text-3xl font-bold text-yellow-600'>
              {differences.annualTaxDifference.isNegative() ? '-' : '+'}
              {formatNaira(differences.annualTaxDifference.abs(), {
                compact: true,
              })}
            </div>
            <div className='text-sm text-gray-600 mt-1'>
              Annual Tax Difference
            </div>
          </div>

          <div className='p-4 rounded-lg bg-blue-50 border border-blue-200'>
            <div className='text-3xl font-bold text-blue-600'>
              {differences.monthlyTaxDifference.isNegative() ? '-' : '+'}
              {formatNaira(differences.monthlyTaxDifference.abs(), {
                compact: true,
              })}
            </div>
            <div className='text-sm text-gray-600 mt-1'>
              Monthly Tax Difference
            </div>
          </div>

          <div
            className={`p-4 rounded-lg border ${
              differences.isNewLawBetter
                ? 'bg-green-50 border-green-200'
                : 'bg-red-50 border-red-200'
            }`}
          >
            <div
              className={`text-3xl font-bold ${
                differences.isNewLawBetter ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {differences.isNewLawBetter ? '✓ Better' : '✗ Worse'}
            </div>
            <div className='text-sm text-gray-600 mt-1'>New Law Impact</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaxCharts;
