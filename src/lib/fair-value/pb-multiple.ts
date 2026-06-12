import type { StockFundamentals } from "@/types/stock";
import { getSectorMultiples } from "./constants";

/** Model 7: P/B Multiple — BVPS × sector median P/B */
export function pbMultiple(f: StockFundamentals, sector: string | null): number | null {
  const bvps = f.bookValuePerShare;
  if (!bvps || bvps <= 0) return null;

  const multiples = getSectorMultiples(sector);
  const value = bvps * multiples.pb;
  return value > 0 ? value : null;
}
