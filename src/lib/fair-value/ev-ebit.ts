import type { StockFundamentals } from "@/types/stock";
import { getSectorMultiples } from "./constants";

/** Multiples Valuation: EBIT — EV/EBIT sector multiple */
export function evEbit(f: StockFundamentals, sector: string | null): number | null {
  const ebit = f.ebit;
  const shares = f.sharesOutstanding;
  const totalDebt = f.totalDebt ?? 0;
  const totalCash = f.totalCash ?? 0;
  if (!ebit || !shares || ebit <= 0 || shares <= 0) return null;

  const multiples = getSectorMultiples(sector);
  const impliedEV = ebit * multiples.evEbit;
  const equityValue = impliedEV - totalDebt + totalCash;
  const perShare = equityValue / shares;
  return perShare > 0 ? perShare : null;
}
