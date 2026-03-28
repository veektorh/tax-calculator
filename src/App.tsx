import React, { useState, useCallback, useEffect } from 'react';
import { createTaxInput, compareTaxLaws } from './calculations/calculateTax';
import { TaxInput, TaxComparison } from './types';
import TaxForm from './components/TaxForm';
import ComparisonView from './components/ComparisonView';
import Header from './components/Header';
import OptimizationPanel from './components/OptimizationPanel';
import ScenarioManager from './components/ScenarioManager';

const App: React.FC = () => {
  console.log('App component starting to render');
  
  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100'>
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h1>Nigerian Tax Calculator</h1>
        <p>App is loading successfully!</p>
      </div>
    </div>
  );
};

export default App;
