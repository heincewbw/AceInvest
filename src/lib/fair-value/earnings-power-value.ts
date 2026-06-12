import type { StockFundamentals } from "@/types/stock";
import { WACC } from "./constants";

/** Model 14: Earnings Power Value — Adj. EBIT × (1 - tax) / WACC */
export function earningsPowerValue(f: StockFundamentals): number | null {
  const ebit = f.ebit;
  const shares = f.sharesOutstanding;
  if (!ebit || !shares || ebit <= 0 || shares <= 0) return null;

  const taxRate = f.effectiveTaxRate ?? 0.20; // default 20% tax
  const nopat = ebit * (1 - taxRate);
  const enterpriseValue = nopat / WACC;

  const totalDebt = f.totalDebt ?? 0;
  const totalCash = f.totalCash ?? 0;
  const equityValue = enterpriseValue - totalDebt + totalCash;
  const perShare = equityValue / shares;
  return perShare > 0 ? perShare : null;
}
