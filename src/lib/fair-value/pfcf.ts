import type { StockFundamentals } from "@/types/stock";
import { getSectorMultiples } from "./constants";

/** Model 10: P/FCF Multiple — FCF/Share × sector median P/FCF */
export function pfcfMultiple(f: StockFundamentals, sector: string | null): number | null {
  const fcf = f.freeCashflow;
  const shares = f.sharesOutstanding;
  if (!fcf || !shares || fcf <= 0 || shares <= 0) return null;

  const fcfPerShare = fcf / shares;
  const multiples = getSectorMultiples(sector);
  const value = fcfPerShare * multiples.pfcf;
  return value > 0 ? value : null;
}
