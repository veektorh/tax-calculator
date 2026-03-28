import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';
import { TaxComparison } from '../types';
import { formatNaira, formatPercentage } from './formatting';

// Export to PDF
export const exportToPDF = (comparison: TaxComparison, inputData: any) => {
  const pdf = new jsPDF();
  const { oldLaw, newLaw, differences } = comparison;

  // Title
  pdf.setFontSize(20);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Nigerian Tax Calculator Report', 20, 20);

  // Date
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`Generated on: ${new Date().toLocaleDateString('en-NG')}`, 20, 30);

  // Input Summary
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Input Summary', 20, 45);

  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  let yPos = 55;

  const inputs = [
    ['Gross Annual Income:', formatNaira(inputData.grossAnnualIncome)],
    ['Annual Rent:', formatNaira(inputData.annualRent)],
    ['Pension Contribution:', formatNaira(inputData.pensionContribution)],
    ['NHF Contribution:', formatNaira(inputData.nhfContribution)],
    ['NHIS Contribution:', formatNaira(inputData.nhisContribution)],
    ['Interest on Loan:', formatNaira(inputData.interestOnLoan)],
    ['Life Insurance Premium:', formatNaira(inputData.lifeInsurancePremium)],
  ];

  inputs.forEach(([label, value]) => {
    pdf.text(label, 20, yPos);
    pdf.text(value, 120, yPos);
    yPos += 8;
  });

  // Tax Comparison
  yPos += 10;
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Tax Comparison', 20, yPos);

  yPos += 15;
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');

  const comparison_data = [
    ['', 'Old Law', 'New Law', 'Difference'],
    [
      'Taxable Income',
      formatNaira(oldLaw.taxableIncome),
      formatNaira(newLaw.taxableIncome),
      '',
    ],
    [
      'Annual Tax',
      formatNaira(oldLaw.totalTax),
      formatNaira(newLaw.totalTax),
      formatNaira(differences.annualTaxDifference),
    ],
    [
      'Monthly Tax',
      formatNaira(oldLaw.monthlyTax),
      formatNaira(newLaw.monthlyTax),
      formatNaira(differences.monthlyTaxDifference),
    ],
    [
      'Effective Rate',
      formatPercentage(oldLaw.effectiveTaxRate),
      formatPercentage(newLaw.effectiveTaxRate),
      formatPercentage(differences.effectiveTaxRateDifference),
    ],
    [
      'Net Monthly Pay',
      formatNaira(oldLaw.netAfterTaxMonthly),
      formatNaira(newLaw.netAfterTaxMonthly),
      formatNaira(differences.netPayDifference),
    ],
  ];

  comparison_data.forEach((row, index) => {
    if (index === 0) {
      pdf.setFont('helvetica', 'bold');
    } else {
      pdf.setFont('helvetica', 'normal');
    }

    pdf.text(row[0], 20, yPos);
    pdf.text(row[1], 70, yPos);
    pdf.text(row[2], 110, yPos);
    pdf.text(row[3], 150, yPos);
    yPos += 8;
  });

  // Tax Bracket Breakdown - Old Law
  yPos += 10;
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Old Law Tax Brackets', 20, yPos);

  yPos += 10;
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');

  oldLaw.taxBracketResults.forEach((bracket) => {
    pdf.text(`${bracket.bracket}: ${formatNaira(bracket.taxDue)}`, 20, yPos);
    yPos += 6;
  });

  // Add new page for New Law brackets
  pdf.addPage();
  yPos = 20;

  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.text('New Law Tax Brackets', 20, yPos);

  yPos += 10;
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');

  newLaw.taxBracketResults.forEach((bracket) => {
    pdf.text(`${bracket.bracket}: ${formatNaira(bracket.taxDue)}`, 20, yPos);
    yPos += 6;
  });

  // Summary
  yPos += 15;
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Summary:', 20, yPos);

  yPos += 10;
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');

  const summary = differences.isNewLawBetter
    ? `The new tax law would save you ${formatNaira(differences.annualTaxDifference.abs())} annually.`
    : `The new tax law would cost you an additional ${formatNaira(differences.annualTaxDifference)} annually.`;

  pdf.text(summary, 20, yPos);

  // Footer
  yPos += 20;
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'italic');
  pdf.text(
    'This report is for educational purposes. Consult a tax professional for official advice.',
    20,
    yPos,
  );

  // Save the PDF
  pdf.save(`Nigerian_Tax_Report_${new Date().toISOString().split('T')[0]}.pdf`);
};

// Export to Excel
export const exportToExcel = (comparison: TaxComparison, inputData: any) => {
  const { oldLaw, newLaw, differences } = comparison;

  // Create workbook
  const wb = XLSX.utils.book_new();

  // Input Data Sheet
  const inputSheet = XLSX.utils.json_to_sheet([
    {
      Field: 'Gross Annual Income',
      Value: inputData.grossAnnualIncome.toString(),
    },
    { Field: 'Annual Rent', Value: inputData.annualRent.toString() },
    {
      Field: 'Pension Contribution',
      Value: inputData.pensionContribution.toString(),
    },
    { Field: 'NHF Contribution', Value: inputData.nhfContribution.toString() },
    {
      Field: 'NHIS Contribution',
      Value: inputData.nhisContribution.toString(),
    },
    { Field: 'Interest on Loan', Value: inputData.interestOnLoan.toString() },
    {
      Field: 'Life Insurance Premium',
      Value: inputData.lifeInsurancePremium.toString(),
    },
  ]);

  XLSX.utils.book_append_sheet(wb, inputSheet, 'Input Data');

  // Comparison Sheet
  const comparisonSheet = XLSX.utils.json_to_sheet([
    {
      Metric: 'Gross Annual Income',
      'Old Law': oldLaw.grossAnnualIncome.toString(),
      'New Law': newLaw.grossAnnualIncome.toString(),
      Difference: '0',
    },
    {
      Metric: 'Total Deductions',
      'Old Law': oldLaw.totalDeductions.toString(),
      'New Law': newLaw.totalDeductions.toString(),
      Difference: newLaw.totalDeductions
        .minus(oldLaw.totalDeductions)
        .toString(),
    },
    {
      Metric: 'Taxable Income',
      'Old Law': oldLaw.taxableIncome.toString(),
      'New Law': newLaw.taxableIncome.toString(),
      Difference: newLaw.taxableIncome.minus(oldLaw.taxableIncome).toString(),
    },
    {
      Metric: 'Annual Tax',
      'Old Law': oldLaw.totalTax.toString(),
      'New Law': newLaw.totalTax.toString(),
      Difference: differences.annualTaxDifference.toString(),
    },
    {
      Metric: 'Monthly Tax',
      'Old Law': oldLaw.monthlyTax.toString(),
      'New Law': newLaw.monthlyTax.toString(),
      Difference: differences.monthlyTaxDifference.toString(),
    },
    {
      Metric: 'Effective Tax Rate',
      'Old Law': oldLaw.effectiveTaxRate.toString(),
      'New Law': newLaw.effectiveTaxRate.toString(),
      Difference: differences.effectiveTaxRateDifference.toString(),
    },
    {
      Metric: 'Net Monthly Pay',
      'Old Law': oldLaw.netAfterTaxMonthly.toString(),
      'New Law': newLaw.netAfterTaxMonthly.toString(),
      Difference: differences.netPayDifference.toString(),
    },
  ]);

  XLSX.utils.book_append_sheet(wb, comparisonSheet, 'Tax Comparison');

  // Old Law Brackets Sheet
  const oldBracketsSheet = XLSX.utils.json_to_sheet(
    oldLaw.taxBracketResults.map((bracket) => ({
      Bracket: bracket.bracket,
      'Taxable Income': bracket.taxableIncome.toString(),
      'Tax Rate': bracket.rate.toString(),
      'Tax Due': bracket.taxDue.toString(),
    })),
  );

  XLSX.utils.book_append_sheet(wb, oldBracketsSheet, 'Old Law Brackets');

  // New Law Brackets Sheet
  const newBracketsSheet = XLSX.utils.json_to_sheet(
    newLaw.taxBracketResults.map((bracket) => ({
      Bracket: bracket.bracket,
      'Taxable Income': bracket.taxableIncome.toString(),
      'Tax Rate': bracket.rate.toString(),
      'Tax Due': bracket.taxDue.toString(),
    })),
  );

  XLSX.utils.book_append_sheet(wb, newBracketsSheet, 'New Law Brackets');

  // Save the Excel file
  XLSX.writeFile(
    wb,
    `Nigerian_Tax_Analysis_${new Date().toISOString().split('T')[0]}.xlsx`,
  );
};

// Create shareable summary text
export const generateSummaryText = (
  comparison: TaxComparison,
  inputData: any,
): string => {
  const { oldLaw, newLaw, differences } = comparison;

  return `
🇳🇬 NIGERIAN TAX COMPARISON RESULTS

💰 Annual Salary: ${formatNaira(inputData.grossAnnualIncome)}

📊 TAX BREAKDOWN:
• Old Law: ${formatNaira(oldLaw.totalTax)} annually (${formatPercentage(oldLaw.effectiveTaxRate)})
• New Law: ${formatNaira(newLaw.totalTax)} annually (${formatPercentage(newLaw.effectiveTaxRate)})

💸 IMPACT:
• Monthly difference: ${differences.monthlyTaxDifference.isNegative() ? '-' : '+'}${formatNaira(differences.monthlyTaxDifference.abs())}
• Annual difference: ${differences.annualTaxDifference.isNegative() ? '-' : '+'}${formatNaira(differences.annualTaxDifference.abs())}
• Take-home change: ${differences.netPayDifference.isNegative() ? '-' : '+'}${formatNaira(differences.netPayDifference.abs())}/month

${differences.isNewLawBetter ? '✅ New law is BETTER for you' : '⚠️ New law will cost MORE'}

Generated by Nigerian Tax Calculator
  `;
};

// Copy to clipboard
export const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text).then(
    () => {
      alert('Tax summary copied to clipboard!');
    },
    (err) => {
      console.error('Could not copy text: ', err);
      alert('Could not copy to clipboard. Please try again.');
    },
  );
};
