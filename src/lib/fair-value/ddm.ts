import type { StockFundamentals } from "@/types/stock";
import { REQUIRED_RETURN_DDM } from "./constants";

/** Model 9: DDM Gordon Growth — D1 / (r - g) */
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
