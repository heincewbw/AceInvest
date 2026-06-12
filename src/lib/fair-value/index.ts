import type { StockData, FairValueResult, FairValueModelResult } from "@/types/stock";
import { dcf } from "./dcf";
import { grahamNumber } from "./graham-number";
import { grahamFormula } from "./graham-formula";
import { peterLynch } from "./peter-lynch";
import { evEbitda } from "./ev-ebitda";
import { peMultiple } from "./pe-multiple";
import { pbMultiple } from "./pb-multiple";
import { psMultiple } from "./ps-multiple";
import { ddm } from "./ddm";
import { pfcfMultiple } from "./pfcf";
import { evRevenue } from "./ev-revenue";
import { residualIncome } from "./residual-income";
import { nav } from "./nav";
import { earningsPowerValue } from "./earnings-power-value";

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
      model: "DCF (5Y)",
      value: dcf(f),
      applicable: f.freeCashflow != null && f.sharesOutstanding != null,
    },
    {
      model: "Graham Number",
      value: grahamNumber(f),
      applicable: f.trailingEps != null && f.bookValuePerShare != null,
    },
    {
      model: "Graham Formula",
      value: grahamFormula(f),
      applicable: f.trailingEps != null,
    },
    {
      model: "Peter Lynch (PEG=1)",
      value: peterLynch(f),
      applicable: f.trailingEps != null && f.epsGrowth != null,
    },
    {
      model: "EV/EBITDA Multiple",
      value: evEbitda(f, sector),
      applicable: f.ebitda != null && f.sharesOutstanding != null,
    },
    {
      model: "P/E Multiple",
      value: peMultiple(f, sector),
      applicable: f.trailingEps != null,
    },
    {
      model: "P/B Multiple",
      value: pbMultiple(f, sector),
      applicable: f.bookValuePerShare != null,
    },
    {
      model: "P/S Multiple",
      value: psMultiple(f, sector),
      applicable: f.revenuePerShare != null,
    },
    {
      model: "DDM Gordon Growth",
      value: ddm(f),
      applicable: f.dividendRate != null && f.dividendRate > 0,
    },
    {
      model: "P/FCF Multiple",
      value: pfcfMultiple(f, sector),
      applicable: f.freeCashflow != null && f.sharesOutstanding != null,
    },
    {
      model: "EV/Revenue Multiple",
      value: evRevenue(f, sector),
      applicable: f.totalRevenue != null && f.sharesOutstanding != null,
    },
    {
      model: "Residual Income",
      value: residualIncome(f),
      applicable: f.bookValuePerShare != null && f.returnOnEquity != null,
    },
    {
      model: "NAV (Asset-Based)",
      value: nav(f),
      applicable: f.totalAssets != null && f.totalLiabilities != null && f.sharesOutstanding != null,
    },
    {
      model: "Earnings Power Value",
      value: earningsPowerValue(f),
      applicable: f.ebit != null && f.sharesOutstanding != null,
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
