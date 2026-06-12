export interface StockQuote {
  ticker: string;
  name: string;
  price: number;
  currency: string;
  market: "IDX" | "US";
  marketCap: number | null;
  volume: number | null;
  week52High: number | null;
  week52Low: number | null;
  beta: number | null;
  sector: string | null;
  industry: string | null;
  exchange: string | null;
}

export interface StockFundamentals {
  // Earnings
  trailingEps: number | null;
  forwardEps: number | null;
  epsGrowth: number | null; // yoy %
  // Book value
  bookValuePerShare: number | null;
  priceToBook: number | null;
  // Revenue
  totalRevenue: number | null;
  revenuePerShare: number | null;
  revenueGrowth: number | null; // yoy %
  // EBITDA
  ebitda: number | null;
  ebitdaMargins: number | null;
  // Cash flow
  freeCashflow: number | null;
  operatingCashflow: number | null;
  // Margins
  grossMargins: number | null;
  operatingMargins: number | null;
  profitMargins: number | null;
  // Returns
  returnOnEquity: number | null;
  returnOnAssets: number | null;
  // Debt & liquidity
  totalDebt: number | null;
  totalCash: number | null;
  debtToEquity: number | null;
  currentRatio: number | null;
  quickRatio: number | null;
  // Valuation multiples
  trailingPE: number | null;
  forwardPE: number | null;
  enterpriseValue: number | null;
  enterpriseToEbitda: number | null;
  enterpriseToRevenue: number | null;
  pegRatio: number | null;
  // Dividends
  dividendRate: number | null;
  dividendYield: number | null;
  payoutRatio: number | null;
  // Share info
  sharesOutstanding: number | null;
  // Balance sheet
  totalAssets: number | null;
  totalLiabilities: number | null;
  // Operating income (for EPV)
  ebit: number | null;
  effectiveTaxRate: number | null;
  // YoY comparisons (from history)
  previousRevenue: number | null;
  previousFreeCashflow: number | null;
  previousGrossMargins: number | null;
  previousDebtToEquity: number | null;
  previousSharesOutstanding: number | null;
  previousTotalAssets: number | null;
}

export interface StockData {
  quote: StockQuote;
  fundamentals: StockFundamentals;
  fetchedAt: string;
}

export interface FairValueModelResult {
  model: string;
  value: number | null;
  applicable: boolean; // false if required data missing
  note?: string;
}

export interface FairValueResult {
  ticker: string;
  currentPrice: number;
  models: FairValueModelResult[];
  averageFairValue: number | null; // median of applicable models
  upside: number | null; // % upside = (fairValue - price) / price * 100
  modelsApplied: number;
  calculatedAt: string;
}

export interface HealthScoreCategory {
  name: string;
  score: number;
  maxScore: number;
  components: { label: string; points: number; maxPoints: number; met: boolean }[];
}

export interface HealthScoreResult {
  ticker: string;
  totalScore: number; // 0-100
  grade: "A" | "B" | "C" | "D" | "F";
  categories: HealthScoreCategory[];
  calculatedAt: string;
}

export interface WatchlistItem {
  id: number;
  ticker: string;
  market: "IDX" | "US";
  name: string | null;
  addedAt: string;
  notes: string | null;
}

export type SectorKey =
  | "technology"
  | "healthcare"
  | "financials"
  | "consumer_discretionary"
  | "consumer_staples"
  | "industrials"
  | "energy"
  | "utilities"
  | "real_estate"
  | "materials"
  | "communication_services"
  | "default";

export interface SectorMultiples {
  pe: number;
  pb: number;
  ps: number;
  evEbitda: number;
  evRevenue: number;
  pfcf: number;
}
