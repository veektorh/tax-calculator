import React, { useState, useEffect } from 'react';
import { TaxInput, TaxScenario, TaxComparison } from '../types';
import {
  saveScenario,
  getScenarios,
  deleteScenario,
  getQuickScenarios,
  compareScenarios,
  exportScenarios,
  importScenarios,
} from '../utils/scenarioUtils';
import { formatNaira } from '../utils/formatting';

interface ScenarioManagerProps {
  currentInput: TaxInput;
  currentComparison: TaxComparison | null;
  onLoadScenario: (input: TaxInput) => void;
}

const ScenarioManager: React.FC<ScenarioManagerProps> = ({
  currentInput,
  currentComparison,
  onLoadScenario,
}) => {
  const [scenarios, setScenarios] = useState<TaxScenario[]>([]);
  const [showSaveForm, setShowSaveForm] = useState(false);
  const [scenarioName, setScenarioName] = useState('');
  const [selectedScenarios, setSelectedScenarios] = useState<string[]>([]);
  const [showComparison, setShowComparison] = useState(false);

  useEffect(() => {
    loadScenarios();
  }, []);

  const loadScenarios = () => {
    setScenarios(getScenarios());
  };

  const handleSave = () => {
    if (!scenarioName.trim()) {
      alert('Please enter a scenario name');
      return;
    }

    saveScenario(scenarioName, currentInput, currentComparison || undefined);
    setScenarioName('');
    setShowSaveForm(false);
    loadScenarios();
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this scenario?')) {
      deleteScenario(id);
      loadScenarios();
    }
  };

  const handleQuickScenario = (quickScenario: {
    name: string;
    input: TaxInput;
  }) => {
    onLoadScenario(quickScenario.input);
  };

  const toggleScenarioSelection = (id: string) => {
    setSelectedScenarios((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id],
    );
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      importScenarios(file)
        .then(() => {
          alert('Scenarios imported successfully!');
          loadScenarios();
        })
        .catch((error) => {
          alert(`Import failed: ${error.message}`);
        });
    }
  };

  const quickScenarios = getQuickScenarios(currentInput);
  const comparisonResults =
    selectedScenarios.length > 1
      ? compareScenarios(
          scenarios.filter((s) => selectedScenarios.includes(s.id)),
        )
      : [];

  return (
    <div className='space-y-6'>
      {/* Save Current Scenario */}
      <div className='bg-white p-6 rounded-lg shadow-lg'>
        <h3 className='text-lg font-semibold mb-4'>Save Current Scenario</h3>

        {!showSaveForm ? (
          <button
            onClick={() => setShowSaveForm(true)}
            className='px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700'
          >
            Save Current Configuration
          </button>
        ) : (
          <div className='flex gap-2'>
            <input
              type='text'
              value={scenarioName}
              onChange={(e) => setScenarioName(e.target.value)}
              placeholder='Enter scenario name'
              className='flex-1 p-2 border border-gray-300 rounded'
            />
            <button
              onClick={handleSave}
              className='px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700'
            >
              Save
            </button>
            <button
              onClick={() => {
                setShowSaveForm(false);
                setScenarioName('');
              }}
              className='px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700'
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* Quick Scenarios */}
      <div className='bg-white p-6 rounded-lg shadow-lg'>
        <h3 className='text-lg font-semibold mb-4'>Quick Scenarios</h3>
        <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-4'>
          {quickScenarios.map((quick, index) => (
            <div key={index} className='p-4 border border-gray-200 rounded-lg'>
              <h4 className='font-medium text-gray-900'>{quick.name}</h4>
              <p className='text-sm text-gray-600 mb-3'>{quick.description}</p>
              <button
                onClick={() => handleQuickScenario(quick)}
                className='text-blue-600 hover:text-blue-800 text-sm font-medium'
              >
                Load Scenario →
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Saved Scenarios */}
      <div className='bg-white p-6 rounded-lg shadow-lg'>
        <div className='flex justify-between items-center mb-4'>
          <h3 className='text-lg font-semibold'>Saved Scenarios</h3>
          <div className='flex gap-2'>
            <button
              onClick={exportScenarios}
              className='px-3 py-1 text-sm bg-gray-600 text-white rounded hover:bg-gray-700'
            >
              Export
            </button>
            <label className='px-3 py-1 text-sm bg-gray-600 text-white rounded hover:bg-gray-700 cursor-pointer'>
              Import
              <input
                type='file'
                accept='.json'
                onChange={handleImport}
                className='hidden'
              />
            </label>
            {selectedScenarios.length > 1 && (
              <button
                onClick={() => setShowComparison(!showComparison)}
                className='px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700'
              >
                {showComparison ? 'Hide' : 'Compare'} (
                {selectedScenarios.length})
              </button>
            )}
          </div>
        </div>

        {scenarios.length === 0 ? (
          <p className='text-gray-500 text-center py-8'>
            No saved scenarios yet. Save your current configuration to get
            started.
          </p>
        ) : (
          <div className='space-y-3'>
            {scenarios.map((scenario) => (
              <div
                key={scenario.id}
                className={`p-4 border rounded-lg ${
                  selectedScenarios.includes(scenario.id)
                    ? 'border-blue-300 bg-blue-50'
                    : 'border-gray-200'
                }`}
              >
                <div className='flex justify-between items-start'>
                  <div className='flex items-center gap-3'>
                    <input
                      type='checkbox'
                      checked={selectedScenarios.includes(scenario.id)}
                      onChange={() => toggleScenarioSelection(scenario.id)}
                      className='mt-1'
                    />
                    <div>
                      <h4 className='font-medium text-gray-900'>
                        {scenario.name}
                      </h4>
                      <p className='text-sm text-gray-600'>
                        Salary: {formatNaira(scenario.input.grossAnnualIncome)}
                        {scenario.comparison && (
                          <span className='ml-2'>
                            | Tax:{' '}
                            {formatNaira(scenario.comparison.newLaw.totalTax)}|
                            Rate:{' '}
                            {scenario.comparison.newLaw.effectiveTaxRate
                              .times(100)
                              .toFixed(1)}
                            %
                          </span>
                        )}
                      </p>
                      <p className='text-xs text-gray-500'>
                        Saved on {scenario.createdAt.toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className='flex gap-2'>
                    <button
                      onClick={() => onLoadScenario(scenario.input)}
                      className='text-blue-600 hover:text-blue-800 text-sm'
                    >
                      Load
                    </button>
                    <button
                      onClick={() => handleDelete(scenario.id)}
                      className='text-red-600 hover:text-red-800 text-sm'
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Scenario Comparison */}
      {showComparison && comparisonResults.length > 1 && (
        <div className='bg-white p-6 rounded-lg shadow-lg'>
          <h3 className='text-lg font-semibold mb-4'>Scenario Comparison</h3>
          <div className='overflow-x-auto'>
            <table className='w-full text-sm'>
              <thead>
                <tr className='border-b'>
                  <th className='text-left p-2'>Rank</th>
                  <th className='text-left p-2'>Scenario</th>
                  <th className='text-left p-2'>Salary</th>
                  <th className='text-left p-2'>New Law Tax</th>
                  <th className='text-left p-2'>Effective Rate</th>
                  <th className='text-left p-2'>Monthly Net</th>
                  <th className='text-left p-2'>vs Old Law</th>
                </tr>
              </thead>
              <tbody>
                {comparisonResults.map(({ scenario, comparison, rank }) => (
                  <tr key={scenario.id} className='border-b hover:bg-gray-50'>
                    <td className='p-2'>
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          rank === 1
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        #{rank}
                      </span>
                    </td>
                    <td className='p-2 font-medium'>{scenario.name}</td>
                    <td className='p-2'>
                      {formatNaira(scenario.input.grossAnnualIncome)}
                    </td>
                    <td className='p-2'>
                      {formatNaira(comparison.newLaw.totalTax)}
                    </td>
                    <td className='p-2'>
                      {comparison.newLaw.effectiveTaxRate.times(100).toFixed(1)}
                      %
                    </td>
                    <td className='p-2'>
                      {formatNaira(comparison.newLaw.netAfterTaxMonthly)}
                    </td>
                    <td className='p-2'>
                      <span
                        className={`text-sm ${
                          comparison.differences.isNewLawBetter
                            ? 'text-green-600'
                            : 'text-red-600'
                        }`}
                      >
                        {comparison.differences.isNewLawBetter
                          ? 'Better'
                          : 'Worse'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScenarioManager;
