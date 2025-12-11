/**
 * Japan Tax Calculator (2025/Reiwa 7 Edition)
 * Implements logic for:
 * 1. Aggregate Taxation (Salary + Crypto)
 * 2. Separate Taxation (Stocks)
 * 3. Resident Tax (Income Based + Per Capita)
 */

// --- Constants & Types ---

export interface TaxInput {
  // A. 源泉徴収票 Data
  salaryRevenue: number;         // 支払金額 (Gross Salary)
  socialInsurancePaid: number;   // 社会保険料等の金額
  
  // B. Investments
  cryptoProfit: number;          // 暗号資産の利益 (Misc Income - Aggregate)
  stockProfit: number;           // 株式譲渡益 (Separate)
  stockDividends: number;        // 配当金 (Separate)
  
  // C. Deductions & Status
  dependentsCount: number;       // 扶養親族の数
  isSingle: boolean;             // 独身かどうか (Used for simplistic deduction logic if needed)
  lifeInsuranceDeduction: number; // 生命保険料控除額 (Total from certificate)
  idecoContribution: number;      // iDeCo掛金 (小規模企業共済等掛金控除)
  nisaCapitalGains: number;       // NISA口座の譲渡益 (非課税)
  nisaDividends: number;          // NISA口座の配当金 (非課税)
}

export interface TaxResult {
  // Taxable Income Bases
  taxableSalaryIncome: number;    // 給与所得金額
  aggregateTaxableIncome: number; // 課税総所得金額 (For Income Tax)
  
  // Tax Savings Insights
  idecoTaxSavings: number;        // iDeCoによる節税額 (国税+地方税)
  nisaTaxSavings: number;         // NISAによる節税額 (仮に特定口座だった場合との差)

  // Calculated Taxes
  incomeTaxAggregate: number;     // 総合課税分の所得税
  incomeTaxSeparate: number;      // 分離課税分の所得税 (Stocks)
  reconstructionTax: number;      // 復興特別所得税
  totalNationalIncomeTax: number; // 国税合計 (Before foreign tax credit)
  
  residentTaxIncomeBased: number; // 住民税 (所得割)
  residentTaxPerCapita: number;   // 住民税 (均等割)
  totalResidentTax: number;       // 住民税合計
  
  totalTax: number;               // Annual Total Tax
  effectiveTaxRate: number;       // 実効税率 (%)
  
  // Furusato Nozei
  furusatoLimit: number;          // ふるさと納税限度額 (Estimate)
}

// 2025 Configuration
const CONSTANTS = {
  BASIC_DEDUCTION_INCOME_TAX: 480000, // 基礎控除 (所得税) - assuming income <= 24M
  BASIC_DEDUCTION_RESIDENT_TAX: 430000, // 基礎控除 (住民税) - typically 50k less
  
  STOCK_TAX_RATE_NATIONAL: 0.15,      // 15%
  STOCK_TAX_RATE_RESIDENT: 0.05,      // 5%
  
  RESIDENT_TAX_RATE_AGGREGATE: 0.10,  // 10% (Prefectural + Municipal)
  RESIDENT_TAX_PER_CAPITA: 5000,      // 均等割 (Approx)
  
  RECONSTRUCTION_RATE: 0.021,         // 2.1%
  
  // Teigaku Gensei (Placeholder for 2025/R7, currently using R6 logic: 30k Income + 10k Resident per person)
  // Set to 0 if not applicable in 2025
  FIXED_REDUCTION_INCOME: 30000,
  FIXED_REDUCTION_RESIDENT: 10000,
};

// --- Helper Functions ---

/**
 * Calculates Employment Income Deduction (給与所得控除)
 * Based on Reiwa 2+ tables
 */
function calculateSalaryDeduction(gross: number): number {
  if (gross <= 550999) return 550000; // Actually income is 0 if gross < 550k, but deduction effectively zeroes it
  if (gross <= 1625000) return 550000;
  if (gross <= 1800000) return gross * 0.4 - 100000;
  if (gross <= 3600000) return gross * 0.3 + 80000;
  if (gross <= 6600000) return gross * 0.2 + 440000;
  if (gross <= 8500000) return gross * 0.1 + 1100000;
  return 1950000; // Upper limit
}

/**
 * Calculates Income Tax based on progressive brackets
 * Brackets: 1.95M, 3.3M, 6.95M, 9M, 18M, 40M
 */
function calculateProgressiveTax(taxableIncome: number): number {
  if (taxableIncome <= 0) return 0;
  
  // Simple bracket logic
  if (taxableIncome <= 1950000) return taxableIncome * 0.05;
  if (taxableIncome <= 3300000) return taxableIncome * 0.10 - 97500;
  if (taxableIncome <= 6950000) return taxableIncome * 0.20 - 427500;
  if (taxableIncome <= 8999000) return taxableIncome * 0.23 - 636000;
  if (taxableIncome <= 17999000) return taxableIncome * 0.33 - 1536000;
  if (taxableIncome <= 39999000) return taxableIncome * 0.40 - 2796000;
  return taxableIncome * 0.45 - 4796000;
}

// --- Main Calculator ---

export function calculateTax(input: TaxInput): TaxResult {
  // 1. Calculate Employment Income (給与所得)
  const salaryDeduction = calculateSalaryDeduction(input.salaryRevenue);
  const salaryIncome = Math.max(0, input.salaryRevenue - salaryDeduction);

  // 2. Aggregate Income (総所得金額)
  // Note: Crypto losses (Misc income) cannot offset Salary income.
  // We assume cryptoProfit passed in is Net. If it's negative, it treats as 0 for aggregation.
  const miscIncome = Math.max(0, input.cryptoProfit);
  const totalAggregateIncome = salaryIncome + miscIncome;

  // 3. Deductions (所得控除)
  // Simplified for MVP. Real world adds Earthquake, Medical, etc.
  // Difference: Basic Deduction is 480k for Income Tax, 430k for Resident Tax.
  
  const commonDeductions = 
    input.socialInsurancePaid + 
    input.lifeInsuranceDeduction +
    input.idecoContribution + // iDeCo is fully deductible
    (input.dependentsCount * 380000); // Specific dependent logic omitted for brevity

  const incomeTaxDeductions = commonDeductions + CONSTANTS.BASIC_DEDUCTION_INCOME_TAX;
  const residentTaxDeductions = commonDeductions + CONSTANTS.BASIC_DEDUCTION_RESIDENT_TAX;

  // 4. Taxable Income (課税所得)
  // Round down to nearest 1,000 JPY for National Tax
  const taxableIncomeAggregate = Math.max(0, Math.floor((totalAggregateIncome - incomeTaxDeductions) / 1000) * 1000);
  
  // For Resident Tax (typically rounded to nearest 1,000 JPY as well)
  const taxableIncomeResident = Math.max(0, Math.floor((totalAggregateIncome - residentTaxDeductions) / 1000) * 1000);

  // 5. Calculate Income Tax (National)
  // A. Aggregate
  const incomeTaxAgg = calculateProgressiveTax(taxableIncomeAggregate);
  
  // B. Separate (Stocks) - Flat 15%
  // Stock losses cannot offset aggregate income, but can offset dividends (assuming input is already netted)
  const stockTaxable = Math.max(0, input.stockProfit + input.stockDividends);
  const incomeTaxSeparate = Math.floor(stockTaxable * CONSTANTS.STOCK_TAX_RATE_NATIONAL);
  
  // C. Reconstruction Tax
  const baseIncomeTax = incomeTaxAgg + incomeTaxSeparate;
  const reconstructionTax = Math.floor(baseIncomeTax * CONSTANTS.RECONSTRUCTION_RATE);
  
  // D. Fixed Tax Reduction (定額減税) Logic
  const fixedReductionIncome = (1 + input.dependentsCount) * CONSTANTS.FIXED_REDUCTION_INCOME;
  
  const totalNationalIncomeTax = Math.max(0, baseIncomeTax + reconstructionTax - fixedReductionIncome);

  // 6. Calculate Resident Tax (Local)
  // A. Income Based (所得割) - Flat 10% on Aggregate + 5% on Stocks
  const residentAgg = Math.floor(taxableIncomeResident * CONSTANTS.RESIDENT_TAX_RATE_AGGREGATE);
  const residentSeparate = Math.floor(stockTaxable * CONSTANTS.STOCK_TAX_RATE_RESIDENT);
  
  // B. Per Capita (均等割)
  const residentPerCapita = CONSTANTS.RESIDENT_TAX_PER_CAPITA;
  
  // C. Fixed Tax Reduction (定額減税) Logic for Resident Tax
  const fixedReductionResident = (1 + input.dependentsCount) * CONSTANTS.FIXED_REDUCTION_RESIDENT;
  
  const totalResidentTax = Math.max(0, (residentAgg + residentSeparate + residentPerCapita) - fixedReductionResident);

  // 7. Final Totals
  const totalTax = totalNationalIncomeTax + totalResidentTax;
  // NISA gains are non-taxable, but we track them for user insights or total revenue
  const totalRevenue = input.salaryRevenue + miscIncome + stockTaxable + (input.nisaCapitalGains || 0) + (input.nisaDividends || 0); 
  const effectiveTaxRate = totalRevenue > 0 ? (totalTax / totalRevenue) * 100 : 0;

  // 8. Furusato Nozei Limit Calculation (Simulation)
  // Formula: (ResidentTaxIncomeBased * 20%) / (100% - ResidentTaxBasic(10%) - IncomeTaxRate x 1.021) + 2000
  // Note: We need the Marginal Tax Rate of the Aggregate portion for the denominator.
  
  // Helper to find marginal rate
  let marginalRate = 0;
  if (taxableIncomeAggregate <= 1950000) marginalRate = 0.05;
  else if (taxableIncomeAggregate <= 3300000) marginalRate = 0.10;
  else if (taxableIncomeAggregate <= 6950000) marginalRate = 0.20;
  else if (taxableIncomeAggregate <= 8999000) marginalRate = 0.23;
  else if (taxableIncomeAggregate <= 17999000) marginalRate = 0.33;
  else if (taxableIncomeAggregate <= 39999000) marginalRate = 0.40;
  else marginalRate = 0.45;

  // --- Savings Calculation ---
  // iDeCo Savings: Contribution * (Marginal Income Tax Rate + Resident Tax Rate 10%)
  // Note: Technically reconstruction tax applies to income tax portion.
  const idecoSavings = Math.floor(input.idecoContribution * (marginalRate * 1.021 + 0.10));

  // NISA Savings: (Gains + Dividends) * 20.315%
  const nisaTotalIncome = (input.nisaCapitalGains || 0) + (input.nisaDividends || 0);
  const nisaSavings = Math.floor(nisaTotalIncome * 0.20315);

  // Denominator: 1 - 0.10 - (marginalRate * 1.021)
  const furusatoDenominator = 1 - 0.10 - (marginalRate * 1.021);
  let furusatoLimit = 0;
  
  if (furusatoDenominator > 0) {
    // We use the Aggregate portion of Resident Tax for the base usually
    furusatoLimit = ((residentAgg * 0.2) / furusatoDenominator) + 2000;
  }

  return {
    taxableSalaryIncome: salaryIncome,
    aggregateTaxableIncome: taxableIncomeAggregate,
    incomeTaxAggregate: incomeTaxAgg,
    incomeTaxSeparate: incomeTaxSeparate,
    reconstructionTax,
    totalNationalIncomeTax,
    residentTaxIncomeBased: residentAgg + residentSeparate,
    residentTaxPerCapita: residentPerCapita,
    totalResidentTax,
    totalTax,
    effectiveTaxRate,
    furusatoLimit: Math.floor(furusatoLimit / 1000) * 1000, // Round to nice number
    idecoTaxSavings: idecoSavings,
    nisaTaxSavings: nisaSavings
  };
}

