# Nigerian Tax Calculator 🇳🇬

A comprehensive tax calculation and optimization tool for comparing Nigerian PAYE tax laws (old vs new). Built with React, TypeScript, and modern web technologies.

## 🚀 Features

### 📊 **Tax Calculation Engine**

- **Dual Law Support**: Compare old vs new Nigerian PAYE tax laws side-by-side
- **Precise Calculations**: Uses Decimal.js for accurate financial computations
- **Complete Deductions**: Supports rent relief, pension, NHF, NHIS, life insurance, and loan interest
- **Real-time Results**: Instant tax calculations with detailed breakdowns

### 📈 **Interactive Visualizations**

- **Pie Charts**: Visual breakdown of tax vs take-home pay
- **Bar Charts**: Comparative analysis across different tax brackets
- **Impact Summary**: Clear indicators of tax law differences
- **Responsive Charts**: Built with Chart.js for professional presentation

### 💼 **Scenario Management**

- **Save/Load**: Store multiple tax calculation scenarios
- **Quick Scenarios**: Pre-built templates (salary increases, optimized deductions)
- **Comparison Tool**: Compare multiple scenarios side-by-side
- **Data Persistence**: Local storage with import/export capabilities

### 📤 **Export & Sharing**

- **PDF Reports**: Professional tax analysis documents
- **Excel Export**: Raw data for further analysis
- **Text Summaries**: Shareable formatted summaries
- **Professional Layout**: Nigerian Naira formatting and proper styling

### 🎯 **Tax Optimization**

- **Smart Suggestions**: AI-powered recommendations for tax savings
- **Priority System**: High/medium/low priority optimization opportunities
- **Savings Calculator**: Potential tax savings estimation
- **Action Steps**: Clear guidance for implementing optimizations

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite 4.5
- **Styling**: Custom CSS with responsive design
- **Charts**: Chart.js + react-chartjs-2
- **Calculations**: Decimal.js for financial precision
- **Exports**: jsPDF + XLSX
- **Testing**: Vitest

## 🏃‍♂️ Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/veektorh/tax-calculator.git

# Navigate to project directory
cd tax-calculator

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at `http://localhost:3000`

### Build for Production

```bash
# Create production build
npm run build

# Preview production build
npm run preview
```

## 📖 Usage

### 1. **Tax Calculator Tab**

- Enter your gross annual income
- Add deductions (rent, pension, NHF, etc.)
- Click "Calculate Tax" for instant results
- View side-by-side comparison of old vs new tax laws

### 2. **Optimization Tab**

- View interactive charts and visualizations
- Get personalized tax optimization suggestions
- Export PDF reports or Excel data
- Copy formatted summaries to share

### 3. **Scenarios Tab**

- Save your current tax configuration
- Try quick scenarios like salary increases
- Compare multiple tax scenarios side-by-side
- Import/export scenario collections

## 🧮 Tax Law Support

### Old Tax Law (Pre-2024)

- Traditional PAYE brackets and rates
- Standard deduction allowances
- Historical tax computation methods

### New Tax Law (2024+)

- Updated progressive tax brackets
- Enhanced rent relief (up to ₦500,000)
- Revised pension contribution limits
- New deduction categories

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## ⚠️ Disclaimer

This tool is for educational and informational purposes only. For official tax advice and compliance, please consult a qualified tax professional or the Federal Inland Revenue Service (FIRS).
