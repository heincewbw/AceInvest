import type { StockFundamentals } from "@/types/stock";
import { getSectorMultiples } from "./constants";

/** Model 6: P/E Multiple — EPS × sector median P/E */
export function peMultiple(f: StockFundamentals, sector: string | null): number | null {
  const eps = f.trailingEps;
  if (!eps || eps <= 0) return null;

  const multiples = getSectorMultiples(sector);
  const value = eps * multiples.pe;
  return value > 0 ? value : null;
}
