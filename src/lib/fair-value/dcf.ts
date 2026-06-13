import type { StockFundamentals } from "@/types/stock";
import { WACC, TERMINAL_GROWTH_RATE, FCF_GROWTH_RATE_DEFAULT, getSectorMultiples } from "./constants";

type DcfExitType = "terminal_growth" | "revenue" | "ebitda";

function dcfVariant(
  f: StockFundamentals,
  years: 5 | 10,
  exitType: DcfExitType,
  sector: string | null,
): number | null {
  const fcf = f.freeCashflow;
  const shares = f.sharesOutstanding;
  if (!fcf || !shares || fcf <= 0 || shares <= 0) return null;

  const growthRate = f.revenueGrowth != null
    ? Math.min(Math.max(f.revenueGrowth, -0.1), 0.25)
    : FCF_GROWTH_RATE_DEFAULT;

  let pv = 0;
  let currentFcf = fcf;
  for (let year = 1; year <= years; year++) {
    currentFcf *= 1 + growthRate;
    pv += currentFcf / Math.pow(1 + WACC, year);
  }

  let pvTerminal: number;

  if (exitType === "terminal_growth") {
    const terminalFcf = currentFcf * (1 + TERMINAL_GROWTH_RATE);
    const terminalValue = terminalFcf / (WACC - TERMINAL_GROWTH_RATE);
    pvTerminal = terminalValue / Math.pow(1 + WACC, years);
  } else if (exitType === "revenue") {
    const revenue = f.totalRevenue;
    if (!revenue || revenue <= 0) return null;
    const multiples = getSectorMultiples(sector);
    const projectedRevenue = revenue * Math.pow(1 + growthRate, years);
    const terminalEV = projectedRevenue * multiples.evRevenue;
    pvTerminal = terminalEV / Math.pow(1 + WACC, years);
  } else {
    // ebitda exit
    const ebitda = f.ebitda;
    if (!ebitda || ebitda <= 0) return null;
    const multiples = getSectorMultiples(sector);
    const projectedEbitda = ebitda * Math.pow(1 + growthRate, years);
    const terminalEV = projectedEbitda * multiples.evEbitda;
    pvTerminal = terminalEV / Math.pow(1 + WACC, years);
  }

  const intrinsicValue = (pv + pvTerminal) / shares;
  return intrinsicValue > 0 ? intrinsicValue : null;
}

/** 5Y DCF — Terminal Growth Exit */
export function dcf5yTerminalGrowth(f: StockFundamentals, sector: string | null = null): number | null {
  return dcfVariant(f, 5, "terminal_growth", sector);
}

/** 10Y DCF — Terminal Growth Exit */
export function dcf10yTerminalGrowth(f: StockFundamentals, sector: string | null = null): number | null {
  return dcfVariant(f, 10, "terminal_growth", sector);
}

/** 5Y DCF — Revenue Exit */
export function dcf5yRevenueExit(f: StockFundamentals, sector: string | null = null): number | null {
  return dcfVariant(f, 5, "revenue", sector);
}

/** 10Y DCF — Revenue Exit */
export function dcf10yRevenueExit(f: StockFundamentals, sector: string | null = null): number | null {
  return dcfVariant(f, 10, "revenue", sector);
}

/** 5Y DCF — EBITDA Exit */
export function dcf5yEbitdaExit(f: StockFundamentals, sector: string | null = null): number | null {
  return dcfVariant(f, 5, "ebitda", sector);
}

/** 10Y DCF — EBITDA Exit */
export function dcf10yEbitdaExit(f: StockFundamentals, sector: string | null = null): number | null {
  return dcfVariant(f, 10, "ebitda", sector);
}

/** Legacy alias */
export const dcf = dcf5yTerminalGrowth;
