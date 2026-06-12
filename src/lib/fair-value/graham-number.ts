import type { StockFundamentals } from "@/types/stock";

/** Model 2: Graham Number — sqrt(22.5 × EPS × BVPS) */
export function grahamNumber(f: StockFundamentals): number | null {
  const eps = f.trailingEps;
  const bvps = f.bookValuePerShare;
  if (!eps || !bvps || eps <= 0 || bvps <= 0) return null;
  return Math.sqrt(22.5 * eps * bvps);
}
