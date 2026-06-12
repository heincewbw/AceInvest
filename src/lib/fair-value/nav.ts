import type { StockFundamentals } from "@/types/stock";

/** Model 13: NAV / Asset-Based Value — (Total Assets - Total Liabilities) / Shares */
export function nav(f: StockFundamentals): number | null {
  const totalAssets = f.totalAssets;
  const totalLiabilities = f.totalLiabilities;
  const shares = f.sharesOutstanding;
  if (!totalAssets || !totalLiabilities || !shares || shares <= 0) return null;

  const netAssets = totalAssets - totalLiabilities;
  const perShare = netAssets / shares;
  return perShare > 0 ? perShare : null;
}
