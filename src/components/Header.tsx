import React from 'react';

const Header: React.FC = () => {
  return (
    <header className='bg-white shadow-lg'>
      <div className='container mx-auto px-4 py-6'>
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-3xl font-bold text-gray-900'>
              Nigerian Tax Calculator
            </h1>
            <p className='text-gray-600 mt-1'>
              Compare PAYE tax under old and new Nigerian tax laws
            </p>
          </div>

          <div className='hidden md:flex items-center space-x-6'>
            <div className='text-center'>
              <div className='text-sm text-gray-500'>Old Law</div>
              <div className='text-lg font-semibold text-red-600'>
                Current System
              </div>
            </div>
            <div className='text-2xl text-gray-300'>vs</div>
            <div className='text-center'>
              <div className='text-sm text-gray-500'>New Law</div>
              <div className='text-lg font-semibold text-blue-600'>
                Proposed 2024+
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
