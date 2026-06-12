import type { StockFundamentals } from "@/types/stock";
import { getSectorMultiples } from "./constants";

/** Model 11: EV/Revenue Multiple */
export function evRevenue(f: StockFundamentals, sector: string | null): number | null {
  const revenue = f.totalRevenue;
  const shares = f.sharesOutstanding;
  const totalDebt = f.totalDebt ?? 0;
  const totalCash = f.totalCash ?? 0;
  if (!revenue || !shares || revenue <= 0 || shares <= 0) return null;

  const multiples = getSectorMultiples(sector);
  const impliedEV = revenue * multiples.evRevenue;
  const equityValue = impliedEV - totalDebt + totalCash;
  const perShare = equityValue / shares;
  return perShare > 0 ? perShare : null;
}
