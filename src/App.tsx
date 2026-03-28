import React, { useState, useCallback, useEffect } from 'react';
import { createTaxInput, compareTaxLaws } from './calculations/calculateTax';
import { TaxInput, TaxComparison } from './types';
import TaxForm from './components/TaxForm';
import ComparisonView from './components/ComparisonView';
import Header from './components/Header';
import OptimizationPanel from './components/OptimizationPanel';
import ScenarioManager from './components/ScenarioManager';

const App: React.FC = () => {
  const [taxInput, setTaxInput] = useState<TaxInput>(() =>
    createTaxInput({
      grossAnnualIncome: 6000000, // Start with a more reasonable example
      annualRent: 2500000,
      nhfContribution: 0,
      nhisContribution: 0,
      pensionContribution: 0,
      interestOnLoan: 0,
      lifeInsurancePremium: 0,
    }),
  );

  const [comparison, setComparison] = useState<TaxComparison | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [activeTab, setActiveTab] = useState<
    'calculator' | 'optimization' | 'scenarios'
  >('calculator');

  const handleInputChange = useCallback((newInput: TaxInput) => {
    setTaxInput(newInput);
    // Clear old comparison when input changes so user doesn't see stale results
    setComparison(null);
  }, []);

  const handleCalculate = useCallback(async () => {
    if (!taxInput) {
      console.error('No tax input available');
      return;
    }

    setIsCalculating(true);

    // Add a small delay to show loading state
    setTimeout(() => {
      try {
        const result = compareTaxLaws(taxInput);
        setComparison(result);
      } catch (error) {
        console.error('Error calculating tax:', error);
        alert('Error calculating tax. Please check your inputs and try again.');
      } finally {
        setIsCalculating(false);
      }
    }, 500);
  }, [taxInput]);

  const handleLoadScenario = useCallback((newInput: TaxInput) => {
    setTaxInput(newInput);
    setActiveTab('calculator');
    // Calculate the new scenario automatically
    setTimeout(() => {
      const result = compareTaxLaws(newInput);
      setComparison(result);
    }, 100);
  }, []);

  // Calculate on mount with example data
  useEffect(() => {
    try {
      handleCalculate();
    } catch (error) {
      console.error('Initial calculation failed:', error);
    }
  }, []); // Only run on mount

  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100'>
      <Header />

      <div className='container mx-auto px-4 py-8'>
        {/* Tab Navigation */}
        <div className='flex mb-8 bg-white rounded-lg p-1 shadow-md max-w-lg mx-auto'>
          <button
            className={`flex-1 py-2 px-4 rounded-md font-medium transition-all text-sm ${
              activeTab === 'calculator'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-gray-600 hover:text-gray-800'
            }`}
            onClick={() => setActiveTab('calculator')}
          >
            Calculator
          </button>
          <button
            className={`flex-1 py-2 px-4 rounded-md font-medium transition-all text-sm ${
              activeTab === 'optimization'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-gray-600 hover:text-gray-800'
            }`}
            onClick={() => setActiveTab('optimization')}
          >
            Optimization
          </button>
          <button
            className={`flex-1 py-2 px-4 rounded-md font-medium transition-all text-sm ${
              activeTab === 'scenarios'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-gray-600 hover:text-gray-800'
            }`}
            onClick={() => setActiveTab('scenarios')}
          >
            Scenarios
          </button>
        </div>

        {activeTab === 'calculator' ? (
          <div className='grid lg:grid-cols-2 gap-8'>
            {/* Left Column - Tax Form */}
            <div className='space-y-6'>
              <TaxForm
                input={taxInput}
                onChange={handleInputChange}
                onCalculate={handleCalculate}
              />
            </div>

            {/* Right Column - Results */}
            <div className='space-y-6'>
              <ComparisonView
                comparison={comparison}
                isLoading={isCalculating}
              />
            </div>
          </div>
        ) : activeTab === 'optimization' ? (
          <div className='max-w-4xl mx-auto'>
            <OptimizationPanel
              taxInput={taxInput}
              comparison={comparison}
              onInputChange={handleInputChange}
              onCalculate={handleCalculate}
            />
          </div>
        ) : (
          <div className='max-w-4xl mx-auto'>
            <ScenarioManager
              currentInput={taxInput}
              currentComparison={comparison}
              onLoadScenario={handleLoadScenario}
            />
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className='bg-gray-800 text-white py-8 mt-16'>
        <div className='container mx-auto px-4 text-center'>
          <p className='text-gray-300'>
            Nigerian Tax Calculator - Compare Old vs New Tax Laws
          </p>
          <p className='text-sm text-gray-500 mt-2'>
            This tool is for educational purposes. Consult a tax professional
            for official advice.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
