import React, { useState } from 'react';
import { TaxFormProps, TaxFormData } from '../types';
import { validateNumericInput, formatNumberInput } from '../utils/formatting';
import { createTaxInput } from '../calculations/calculateTax';

const TaxForm: React.FC<TaxFormProps> = ({ input, onChange }) => {
  const [formData, setFormData] = useState<TaxFormData>({
    grossAnnualIncome: formatNumberInput(input.grossAnnualIncome),
    nhfContribution: formatNumberInput(input.nhfContribution),
    nhisContribution: formatNumberInput(input.nhisContribution),
    pensionContribution: formatNumberInput(input.pensionContribution),
    interestOnLoan: formatNumberInput(input.interestOnLoan),
    lifeInsurancePremium: formatNumberInput(input.lifeInsurancePremium),
    annualRent: formatNumberInput(input.annualRent),
  });

  const [errors, setErrors] = useState<Partial<TaxFormData>>({});

  const handleChange = (field: keyof TaxFormData, value: string) => {
    // Format the input value
    const validation = validateNumericInput(value);
    const formattedValue =
      validation.isValid && validation.parsed
        ? formatNumberInput(validation.parsed)
        : value;

    // Update local form state
    const updatedFormData = { ...formData, [field]: formattedValue };
    setFormData(updatedFormData);

    // Update errors
    setErrors((prev) => ({
      ...prev,
      [field]: validation.error,
    }));

    // Convert to TaxInput and propagate changes
    if (validation.isValid && validation.parsed) {
      try {
        const newInput = createTaxInput({
          grossAnnualIncome: updatedFormData.grossAnnualIncome || '0',
          nhfContribution: updatedFormData.nhfContribution || '0',
          nhisContribution: updatedFormData.nhisContribution || '0',
          pensionContribution: updatedFormData.pensionContribution || '0',
          interestOnLoan: updatedFormData.interestOnLoan || '0',
          lifeInsurancePremium: updatedFormData.lifeInsurancePremium || '0',
          annualRent: updatedFormData.annualRent || '0',
        });

        onChange(newInput);
      } catch (error) {
        console.error('Error creating tax input:', error);
      }
    }
  };

  // No longer need handleSubmit since we auto-calculate

  return (
    <div className='bg-white rounded-lg shadow-lg p-6'>
      <h2 className='text-xl font-semibold text-gray-900 mb-6'>
        Basic Information
      </h2>

      <div className='space-y-6'>
        {/* Gross Annual Income */}
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-2'>
            Gross Annual Income (₦) *
          </label>
          <input
            type='text'
            value={formData.grossAnnualIncome}
            onChange={(e) => handleChange('grossAnnualIncome', e.target.value)}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.grossAnnualIncome ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder='Enter your annual salary'
          />
          {errors.grossAnnualIncome && (
            <p className='text-red-500 text-sm mt-1'>
              {errors.grossAnnualIncome}
            </p>
          )}
        </div>

        <h3 className='text-lg font-medium text-gray-900 mt-8 mb-4'>
          Additional Deductions (Optional)
        </h3>

        {/* Annual Rent */}
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-2'>
            Annual Rent (₦)
          </label>
          <input
            type='text'
            value={formData.annualRent}
            onChange={(e) => handleChange('annualRent', e.target.value)}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.annualRent ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder='Annual rent paid'
          />
          {errors.annualRent && (
            <p className='text-red-500 text-sm mt-1'>{errors.annualRent}</p>
          )}
          <p className='text-sm text-gray-500 mt-1'>
            Rent relief is capped at ₦500,000 under the new law
          </p>
        </div>

        {/* Pension Contribution */}
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-2'>
            Pension Contribution (Annual) (₦)
          </label>
          <input
            type='text'
            value={formData.pensionContribution}
            onChange={(e) =>
              handleChange('pensionContribution', e.target.value)
            }
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.pensionContribution ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder='Your pension contribution'
          />
          {errors.pensionContribution && (
            <p className='text-red-500 text-sm mt-1'>
              {errors.pensionContribution}
            </p>
          )}
        </div>

        {/* NHF Contribution */}
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-2'>
            NHF Contribution (Annual) (₦)
          </label>
          <input
            type='text'
            value={formData.nhfContribution}
            onChange={(e) => handleChange('nhfContribution', e.target.value)}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.nhfContribution ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder='National Housing Fund contribution'
          />
          {errors.nhfContribution && (
            <p className='text-red-500 text-sm mt-1'>
              {errors.nhfContribution}
            </p>
          )}
        </div>

        {/* NHIS Contribution */}
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-2'>
            NHIS Contribution (Annual) (₦)
          </label>
          <input
            type='text'
            value={formData.nhisContribution}
            onChange={(e) => handleChange('nhisContribution', e.target.value)}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.nhisContribution ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder='National Health Insurance contribution'
          />
          {errors.nhisContribution && (
            <p className='text-red-500 text-sm mt-1'>
              {errors.nhisContribution}
            </p>
          )}
        </div>

        {/* Interest on Loan */}
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-2'>
            Interest on Loan for Owner Occupied House (₦)
          </label>
          <input
            type='text'
            value={formData.interestOnLoan}
            onChange={(e) => handleChange('interestOnLoan', e.target.value)}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.interestOnLoan ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder='Annual interest on home loan'
          />
          {errors.interestOnLoan && (
            <p className='text-red-500 text-sm mt-1'>{errors.interestOnLoan}</p>
          )}
        </div>

        {/* Life Insurance Premium */}
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-2'>
            Life Insurance Premium (You & Spouse) (₦)
          </label>
          <input
            type='text'
            value={formData.lifeInsurancePremium}
            onChange={(e) =>
              handleChange('lifeInsurancePremium', e.target.value)
            }
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.lifeInsurancePremium ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder='Annual life insurance premium'
          />
          {errors.lifeInsurancePremium && (
            <p className='text-red-500 text-sm mt-1'>
              {errors.lifeInsurancePremium}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaxForm;
