import type { StockData, FairValueResult, FairValueModelResult } from "@/types/stock";
import { dcf5yTerminalGrowth, dcf10yTerminalGrowth, dcf5yRevenueExit, dcf10yRevenueExit, dcf5yEbitdaExit, dcf10yEbitdaExit } from "./dcf";
import { peMultiple } from "./pe-multiple";
import { pbMultiple } from "./pb-multiple";
import { psMultiple } from "./ps-multiple";
import { evEbitda } from "./ev-ebitda";
import { evRevenue } from "./ev-revenue";
import { evEbit } from "./ev-ebit";
import { ddm, ddmMultiStage } from "./ddm";

function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0
    ? sorted[mid]
    : (sorted[mid - 1] + sorted[mid]) / 2;
}

export function calculateFairValue(data: StockData): FairValueResult {
  const { quote, fundamentals } = data;
  const sector = quote.sector;
  const f = fundamentals;

  const modelResults: FairValueModelResult[] = [
    {
      model: "5Y DCF Terminal Growth Exit",
      value: dcf5yTerminalGrowth(f, sector),
      applicable: f.freeCashflow != null && f.sharesOutstanding != null,
    },
    {
      model: "Dividends: Stable Growth",
      value: ddm(f),
      applicable: f.dividendRate != null && f.dividendRate > 0,
    },
    {
      model: "P/E Multiples",
      value: peMultiple(f, sector),
      applicable: f.trailingEps != null,
    },
    {
      model: "Revenue Multiples",
      value: evRevenue(f, sector),
      applicable: f.totalRevenue != null && f.sharesOutstanding != null,
    },
    {
      model: "Dividends: Multi-Stage",
      value: ddmMultiStage(f),
      applicable: f.dividendRate != null && f.dividendRate > 0,
    },
    {
      model: "Multiples Valuation: EBIT",
      value: evEbit(f, sector),
      applicable: f.ebit != null && f.sharesOutstanding != null,
    },
    {
      model: "Multiples Valuation: Price / Sales",
      value: psMultiple(f, sector),
      applicable: f.revenuePerShare != null,
    },
    {
      model: "EBITDA Multiples",
      value: evEbitda(f, sector),
      applicable: f.ebitda != null && f.sharesOutstanding != null,
    },
    {
      model: "Multiples Valuation: Price / Book",
      value: pbMultiple(f, sector),
      applicable: f.bookValuePerShare != null,
    },
    {
      model: "5Y DCF Revenue Exit",
      value: dcf5yRevenueExit(f, sector),
      applicable: f.freeCashflow != null && f.totalRevenue != null && f.sharesOutstanding != null,
    },
    {
      model: "10Y DCF EBITDA Exit",
      value: dcf10yEbitdaExit(f, sector),
      applicable: f.freeCashflow != null && f.ebitda != null && f.sharesOutstanding != null,
    },
    {
      model: "10Y DCF Revenue Exit",
      value: dcf10yRevenueExit(f, sector),
      applicable: f.freeCashflow != null && f.totalRevenue != null && f.sharesOutstanding != null,
    },
    {
      model: "5Y DCF EBITDA Exit",
      value: dcf5yEbitdaExit(f, sector),
      applicable: f.freeCashflow != null && f.ebitda != null && f.sharesOutstanding != null,
    },
    {
      model: "10Y DCF Terminal Growth Exit",
      value: dcf10yTerminalGrowth(f, sector),
      applicable: f.freeCashflow != null && f.sharesOutstanding != null,
    },
  ];

  const validValues = modelResults
    .map((m) => m.value)
    .filter((v): v is number => v !== null && isFinite(v) && v > 0);

  const averageFairValue = validValues.length > 0 ? median(validValues) : null;
  const currentPrice = quote.price;

  const upside =
    averageFairValue != null && currentPrice > 0
      ? ((averageFairValue - currentPrice) / currentPrice) * 100
      : null;

  return {
    ticker: quote.ticker,
    currentPrice,
    models: modelResults,
    averageFairValue,
    upside,
    modelsApplied: validValues.length,
    calculatedAt: new Date().toISOString(),
  };
}
