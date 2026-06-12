import type { StockFundamentals } from "@/types/stock";
import { RISK_FREE_RATE } from "./constants";

/** Model 3: Ben Graham Formula — EPS × (8.5 + 2g) × (4.4 / RF) */
export function grahamFormula(f: StockFundamentals): number | null {
  const eps = f.trailingEps;
  if (!eps || eps <= 0) return null;

  const g = f.epsGrowth != null
    ? Math.min(Math.max(f.epsGrowth * 100, 0), 20) // cap growth 0-20%
    : 7; // default 7% growth assumption

  const rfPercent = RISK_FREE_RATE * 100;
  const value = eps * (8.5 + 2 * g) * (4.4 / rfPercent);
  return value > 0 ? value : null;
}
