import Decimal from 'decimal.js';
import { TaxInput, TaxComparison } from '../calculations/calculateTax';

export interface TaxFormProps {
  input: TaxInput;
  onChange: (input: TaxInput) => void;
  onCalculate: () => void;
}

export interface TaxFormData {
  grossAnnualIncome: string;
  nhfContribution: string;
  nhisContribution: string;
  pensionContribution: string;
  interestOnLoan: string;
  lifeInsurancePremium: string;
  annualRent: string;
}

export interface ComparisonViewProps {
  comparison: TaxComparison | null;
  isLoading: boolean;
}

export interface TaxScenario {
  id: string;
  name: string;
  input: TaxInput;
  comparison?: TaxComparison;
  createdAt: Date;
}

export interface OptimizationSuggestion {
  title: string;
  description: string;
  potentialSavings: Decimal;
  action: string;
  priority: 'high' | 'medium' | 'low';
}

export type {
  TaxInput,
  TaxComparison,
  TaxCalculationResult,
  TaxBracketResult,
} from '../calculations/calculateTax';
