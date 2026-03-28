import Decimal from 'decimal.js';
import { TaxInput, TaxScenario, TaxComparison } from '../types';
import { compareTaxLaws } from '../calculations/calculateTax';

// LocalStorage key for scenarios
const SCENARIOS_KEY = 'tax_calculator_scenarios';

// Save scenario to localStorage
export const saveScenario = (
  name: string,
  input: TaxInput,
  comparison?: TaxComparison,
): TaxScenario => {
  const scenario: TaxScenario = {
    id: generateId(),
    name,
    input,
    comparison,
    createdAt: new Date(),
  };

  const scenarios = getScenarios();
  scenarios.push(scenario);
  localStorage.setItem(SCENARIOS_KEY, JSON.stringify(scenarios, jsonReplacer));

  return scenario;
};

// Get all scenarios from localStorage
export const getScenarios = (): TaxScenario[] => {
  try {
    const stored = localStorage.getItem(SCENARIOS_KEY);
    if (!stored) return [];

    const scenarios = JSON.parse(stored, jsonReviver);
    return scenarios.map((scenario: any) => ({
      ...scenario,
      createdAt: new Date(scenario.createdAt),
    }));
  } catch (error) {
    console.error('Error loading scenarios:', error);
    return [];
  }
};

// Delete scenario
export const deleteScenario = (id: string): void => {
  const scenarios = getScenarios().filter((s) => s.id !== id);
  localStorage.setItem(SCENARIOS_KEY, JSON.stringify(scenarios, jsonReplacer));
};

// Update scenario
export const updateScenario = (
  id: string,
  updates: Partial<TaxScenario>,
): void => {
  const scenarios = getScenarios().map((s) =>
    s.id === id ? { ...s, ...updates } : s,
  );
  localStorage.setItem(SCENARIOS_KEY, JSON.stringify(scenarios, jsonReplacer));
};

// Get scenario by ID
export const getScenarioById = (id: string): TaxScenario | null => {
  const scenarios = getScenarios();
  return scenarios.find((s) => s.id === id) || null;
};

// Generate quick scenario suggestions
export const getQuickScenarios = (
  baseInput: TaxInput,
): Array<{ name: string; input: TaxInput; description: string }> => {
  const salary = baseInput.grossAnnualIncome;

  return [
    {
      name: '10% Salary Increase',
      description: 'See tax impact of a 10% raise',
      input: {
        ...baseInput,
        grossAnnualIncome: salary.times(1.1),
      },
    },
    {
      name: '25% Salary Increase',
      description: 'Tax impact of a significant promotion',
      input: {
        ...baseInput,
        grossAnnualIncome: salary.times(1.25),
      },
    },
    {
      name: 'Max Pension Contribution',
      description: 'With 8% pension contribution',
      input: {
        ...baseInput,
        pensionContribution: Decimal.min(
          salary.times(0.08),
          new Decimal(18000000).times(0.08),
        ),
      },
    },
    {
      name: 'Full Rent Relief',
      description: 'Claiming maximum ₦500K rent relief',
      input: {
        ...baseInput,
        annualRent: new Decimal(500000),
      },
    },
    {
      name: 'Optimized Deductions',
      description: 'With pension, rent, and NHF optimized',
      input: {
        ...baseInput,
        pensionContribution: Decimal.min(
          salary.times(0.08),
          new Decimal(18000000).times(0.08),
        ),
        annualRent: new Decimal(500000),
        nhfContribution: Decimal.min(salary.times(0.025), new Decimal(1000000)),
      },
    },
  ];
};

// Compare multiple scenarios
export const compareScenarios = (
  scenarios: TaxScenario[],
): Array<{
  scenario: TaxScenario;
  comparison: TaxComparison;
  rank: number;
}> => {
  const results = scenarios.map((scenario) => {
    const comparison = scenario.comparison || compareTaxLaws(scenario.input);
    return { scenario, comparison };
  });

  // Rank by lowest new law tax
  const sorted = results.sort((a, b) =>
    a.comparison.newLaw.totalTax.comparedTo(b.comparison.newLaw.totalTax),
  );

  return sorted.map((result, index) => ({
    ...result,
    rank: index + 1,
  }));
};

// Export scenarios to JSON
export const exportScenarios = () => {
  const scenarios = getScenarios();
  const dataStr = JSON.stringify(scenarios, jsonReplacer, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });

  const link = document.createElement('a');
  link.href = URL.createObjectURL(dataBlob);
  link.download = `tax_scenarios_${new Date().toISOString().split('T')[0]}.json`;
  link.click();
};

// Import scenarios from JSON file
export const importScenarios = (file: File): Promise<TaxScenario[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const scenarios = JSON.parse(e.target?.result as string, jsonReviver);
        if (Array.isArray(scenarios)) {
          // Merge with existing scenarios
          const existing = getScenarios();
          const merged = [
            ...existing,
            ...scenarios.map((s) => ({ ...s, id: generateId() })),
          ]; // Generate new IDs to avoid conflicts
          localStorage.setItem(
            SCENARIOS_KEY,
            JSON.stringify(merged, jsonReplacer),
          );
          resolve(scenarios);
        } else {
          reject(new Error('Invalid file format'));
        }
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
};

// Helper functions
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// JSON serializer for Decimal objects
function jsonReplacer(_key: string, value: any): any {
  if (value instanceof Decimal) {
    return { __type: 'Decimal', __value: value.toString() };
  }
  return value;
}

// JSON deserializer for Decimal objects
function jsonReviver(_key: string, value: any): any {
  if (value && typeof value === 'object' && value.__type === 'Decimal') {
    return new Decimal(value.__value);
  }
  return value;
}
