import type { StockFundamentals } from "@/types/stock";
import { WACC, TERMINAL_GROWTH_RATE, FCF_GROWTH_RATE_DEFAULT } from "./constants";

/** Model 1: Discounted Cash Flow (5-year FCF projection + terminal value) */
export function dcf(f: StockFundamentals): number | null {
  const fcf = f.freeCashflow;
  const shares = f.sharesOutstanding;
  if (!fcf || !shares || fcf <= 0 || shares <= 0) return null;

  const growthRate = f.revenueGrowth != null
    ? Math.min(Math.max(f.revenueGrowth, -0.1), 0.25)
    : FCF_GROWTH_RATE_DEFAULT;

  let pv = 0;
  let currentFcf = fcf;
  for (let year = 1; year <= 5; year++) {
    currentFcf *= 1 + growthRate;
    pv += currentFcf / Math.pow(1 + WACC, year);
  }

  // Terminal value using Gordon Growth Model
  const terminalFcf = currentFcf * (1 + TERMINAL_GROWTH_RATE);
  const terminalValue = terminalFcf / (WACC - TERMINAL_GROWTH_RATE);
  const pvTerminal = terminalValue / Math.pow(1 + WACC, 5);

  const intrinsicValue = (pv + pvTerminal) / shares;
  return intrinsicValue > 0 ? intrinsicValue : null;
}
