import type { StockFundamentals } from "@/types/stock";
import { WACC } from "./constants";

/** Model 12: Residual Income Model (RIM) — BVPS + PV(excess earnings over 5 years) */
export function residualIncome(f: StockFundamentals): number | null {
  const bvps = f.bookValuePerShare;
  const roe = f.returnOnEquity;
  if (!bvps || !roe || bvps <= 0) return null;

  // Excess return per year = (ROE - required return) × BVPS
  const excessReturn = (roe - WACC) * bvps;

  // PV of 5-year excess earnings (simplified, constant excess return)
  let pvExcess = 0;
  for (let year = 1; year <= 5; year++) {
    pvExcess += excessReturn / Math.pow(1 + WACC, year);
  }

  const value = bvps + pvExcess;
  return value > 0 ? value : null;
}
