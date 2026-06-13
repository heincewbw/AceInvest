import YahooFinance from "yahoo-finance2";
const yahooFinance = new YahooFinance();
import { getCached, setCache } from "./db";
import type { StockData, StockQuote, StockFundamentals } from "@/types/stock";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRecord = Record<string, any>;

export function detectMarket(ticker: string): "IDX" | "US" {
  return ticker.toUpperCase().endsWith(".JK") ? "IDX" : "US";
}

export function normalizeTicker(ticker: string): string {
  return ticker.toUpperCase().trim();
}

export async function getStockData(rawTicker: string): Promise<StockData> {
  const ticker = normalizeTicker(rawTicker);

  const cached = getCached<StockData>(ticker);
  if (cached) return cached;

  const [quoteResult, summaryResult] = await Promise.allSettled([
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (yahooFinance.quote as any)(ticker) as Promise<AnyRecord>,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (yahooFinance.quoteSummary as any)(ticker, {
      modules: [
        "financialData",
        "defaultKeyStatistics",
        "summaryDetail",
        "incomeStatementHistory",
        "balanceSheetHistory",
        "cashflowStatementHistory",
        "incomeStatementHistoryQuarterly",
      ],
    }) as Promise<AnyRecord>,
  ]);

  if (quoteResult.status === "rejected") {
    throw new Error(`Failed to fetch quote for ${ticker}: ${quoteResult.reason}`);
  }

  const q = quoteResult.value as AnyRecord;
  const s = summaryResult.status === "fulfilled" ? summaryResult.value as AnyRecord : null;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const fd: any = s?.financialData ?? null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ks: any = s?.defaultKeyStatistics ?? null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sd: any = s?.summaryDetail ?? null;

  const incomeHistory: AnyRecord[] = s?.incomeStatementHistory?.incomeStatementHistory ?? [];
  const balanceHistory: AnyRecord[] = s?.balanceSheetHistory?.balanceSheetStatements ?? [];
  const cashflowHistory: AnyRecord[] = s?.cashflowStatementHistory?.cashflowStatements ?? [];

  const prevIncome = incomeHistory[1] ?? null;
  const prevCashflow = cashflowHistory[1] ?? null;
  const currBalance = balanceHistory[0] ?? null;
  const prevBalance = balanceHistory[1] ?? null;

  let effectiveTaxRate: number | null = null;
  if (incomeHistory[0]) {
    const taxProvision: number | null = incomeHistory[0].incomeTaxExpense ?? null;
    const preTax: number | null = incomeHistory[0].incomeBeforeTax ?? null;
    if (taxProvision != null && preTax != null && preTax !== 0) {
      effectiveTaxRate = Math.max(0, Math.min(0.5, taxProvision / preTax));
    }
  }

  const totalAssets: number | null = currBalance?.totalAssets ?? null;
  const totalLiabilities: number | null = currBalance?.totalLiab ?? null;
  const prevTotalAssets: number | null = prevBalance?.totalAssets ?? null;
  const ebitRaw: number | null = incomeHistory[0]?.ebit ?? null;
  const sharesOutstanding: number | null = ks?.sharesOutstanding ?? null;
  const prevRevenue: number | null = prevIncome?.totalRevenue ?? null;
  const prevFcf: number | null = prevCashflow?.totalCashFromOperatingActivities ?? null;
  const prevSharesOutstanding: number | null = ks?.impliedSharesOutstanding ?? sharesOutstanding;

  let prevDebtToEquity: number | null = null;
  if (prevBalance) {
    const prevDebt: number | null = prevBalance.longTermDebt ?? null;
    const prevEquity: number | null = prevBalance.totalStockholderEquity ?? null;
    if (prevDebt != null && prevEquity != null && prevEquity !== 0) {
      prevDebtToEquity = prevDebt / prevEquity;
    }
  }

  const quote: StockQuote = {
    ticker,
    name: q.longName ?? q.shortName ?? ticker,
    price: q.regularMarketPrice ?? 0,
    currency: q.currency ?? "USD",
    market: detectMarket(ticker),
    marketCap: q.marketCap ?? null,
    volume: q.regularMarketVolume ?? null,
    week52High: q.fiftyTwoWeekHigh ?? null,
    week52Low: q.fiftyTwoWeekLow ?? null,
    beta: ks?.beta ?? null,
    sector: q.sector ?? null,
    industry: q.industry ?? null,
    exchange: q.fullExchangeName ?? q.exchange ?? null,
  };

  const fundamentals: StockFundamentals = {
    trailingEps: ks?.trailingEps ?? null,
    forwardEps: ks?.forwardEps ?? null,
    epsGrowth: fd?.earningsGrowth ?? ks?.earningsQuarterlyGrowth ?? null,
    bookValuePerShare: ks?.bookValue ?? null,
    priceToBook: ks?.priceToBook ?? null,
    totalRevenue: fd?.totalRevenue ?? null,
    revenuePerShare: fd?.revenuePerShare ?? null,
    revenueGrowth: fd?.revenueGrowth ?? null,
    ebitda: fd?.ebitda ?? null,
    ebitdaMargins: fd?.ebitdaMargins ?? null,
    freeCashflow: fd?.freeCashflow ?? null,
    operatingCashflow: fd?.operatingCashflow ?? null,
    grossMargins: fd?.grossMargins ?? null,
    operatingMargins: fd?.operatingMargins ?? null,
    profitMargins: fd?.profitMargins ?? null,
    returnOnEquity: fd?.returnOnEquity ?? null,
    returnOnAssets: fd?.returnOnAssets ?? null,
    totalDebt: fd?.totalDebt ?? null,
    totalCash: fd?.totalCash ?? null,
    debtToEquity: fd?.debtToEquity != null ? (fd.debtToEquity as number) / 100 : null,
    currentRatio: fd?.currentRatio ?? null,
    quickRatio: fd?.quickRatio ?? null,
    trailingPE: sd?.trailingPE ?? null,
    forwardPE: ks?.forwardPE ?? null,
    enterpriseValue: ks?.enterpriseValue ?? null,
    enterpriseToEbitda: ks?.enterpriseToEbitda ?? null,
    enterpriseToRevenue: ks?.enterpriseToRevenue ?? null,
    pegRatio: ks?.pegRatio ?? null,
    dividendRate: sd?.dividendRate ?? null,
    dividendYield: sd?.dividendYield ?? null,
    payoutRatio: sd?.payoutRatio ?? null,
    sharesOutstanding,
    totalAssets,
    totalLiabilities,
    ebit: ebitRaw,
    effectiveTaxRate,
    previousRevenue: prevRevenue,
    previousFreeCashflow: prevFcf,
    previousGrossMargins: null,
    previousDebtToEquity: prevDebtToEquity,
    previousSharesOutstanding: prevSharesOutstanding,
    previousTotalAssets: prevTotalAssets,
  };

  const data: StockData = {
    quote,
    fundamentals,
    fetchedAt: new Date().toISOString(),
  };

  setCache(ticker, data);
  return data;
}

export async function searchStocks(query: string): Promise<{ ticker: string; name: string; exchange: string }[]> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const results = await (yahooFinance.search as any)(query, { newsCount: 0 }) as AnyRecord;
  const quotes: AnyRecord[] = results.quotes ?? [];
  return quotes
    .filter((r) => r.quoteType === "EQUITY")
    .slice(0, 10)
    .map((r) => ({
      ticker: r.symbol ?? "",
      name: r.longname ?? r.shortname ?? r.symbol ?? "",
      exchange: r.exchange ?? "",
    }));
}
