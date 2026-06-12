import type { StockFundamentals } from "@/types/stock";
import { getSectorMultiples } from "./constants";

/** Model 8: P/S Multiple — Revenue/Share × sector median P/S */
export function psMultiple(f: StockFundamentals, sector: string | null): number | null {
  const revenuePerShare = f.revenuePerShare;
  if (!revenuePerShare || revenuePerShare <= 0) return null;

  const multiples = getSectorMultiples(sector);
  const value = revenuePerShare * multiples.ps;
  return value > 0 ? value : null;
}
