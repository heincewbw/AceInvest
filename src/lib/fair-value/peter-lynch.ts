import type { StockFundamentals } from "@/types/stock";

/** Model 4: Peter Lynch Fair Value (PEG = 1) — EPS × (EPS Growth Rate % × 100) */
export function peterLynch(f: StockFundamentals): number | null {
  const eps = f.trailingEps;
  const growth = f.epsGrowth;
  if (!eps || !growth || eps <= 0 || growth <= 0) return null;

  const growthPercent = growth * 100; // convert 0.15 → 15
  const value = eps * growthPercent;
  return value > 0 ? value : null;
}
