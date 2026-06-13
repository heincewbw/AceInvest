import type { StockFundamentals } from "@/types/stock";
import { REQUIRED_RETURN_DDM } from "./constants";

/** Dividends: Stable Growth — Gordon Growth Model D1 / (r - g) */
export function ddm(f: StockFundamentals): number | null {
  const dividendRate = f.dividendRate;
  if (!dividendRate || dividendRate <= 0) return null;

  // Estimate dividend growth from EPS growth, cap at 8%
  const g = f.epsGrowth != null
    ? Math.min(Math.max(f.epsGrowth, 0), 0.08)
    : 0.03;

  const r = REQUIRED_RETURN_DDM;
  if (r <= g) return null; // model invalid when r <= g

  const d1 = dividendRate * (1 + g);
  const value = d1 / (r - g);
  return value > 0 ? value : null;
}

/** Dividends: Multi-Stage — 5-year high-growth phase then stable Gordon Growth */
export function ddmMultiStage(f: StockFundamentals): number | null {
  const dividendRate = f.dividendRate;
  if (!dividendRate || dividendRate <= 0) return null;

  const r = REQUIRED_RETURN_DDM;
  const stableGrowth = 0.03;
  if (r <= stableGrowth) return null;

  // High-growth rate capped at 15%
  const highGrowth = f.epsGrowth != null
    ? Math.min(Math.max(f.epsGrowth, 0), 0.15)
    : 0.08;

  const highGrowthYears = 5;
  let pv = 0;
  let currentDiv = dividendRate;

  for (let year = 1; year <= highGrowthYears; year++) {
    currentDiv *= 1 + highGrowth;
    pv += currentDiv / Math.pow(1 + r, year);
  }

  // Terminal value at end of high-growth phase
  const d_next = currentDiv * (1 + stableGrowth);
  const terminalValue = d_next / (r - stableGrowth);
  const pvTerminal = terminalValue / Math.pow(1 + r, highGrowthYears);

  const value = pv + pvTerminal;
  return value > 0 ? value : null;
}
