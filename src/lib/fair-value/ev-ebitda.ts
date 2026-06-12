import type { StockFundamentals } from "@/types/stock";
import { getSectorMultiples } from "./constants";

/** Model 5: EV/EBITDA Multiple */
export function evEbitda(f: StockFundamentals, sector: string | null): number | null {
  const ebitda = f.ebitda;
  const shares = f.sharesOutstanding;
  const totalDebt = f.totalDebt ?? 0;
  const totalCash = f.totalCash ?? 0;
  if (!ebitda || !shares || ebitda <= 0 || shares <= 0) return null;

  const multiples = getSectorMultiples(sector);
  const impliedEV = ebitda * multiples.evEbitda;
  const equityValue = impliedEV - totalDebt + totalCash;
  const perShare = equityValue / shares;
  return perShare > 0 ? perShare : null;
}
