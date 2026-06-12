import type { StockFundamentals, HealthScoreCategory } from "@/types/stock";

export function scoreEfficiency(f: StockFundamentals): HealthScoreCategory {
  // Asset turnover = Revenue / Total Assets
  let assetTurnoverImproving = false;
  if (
    f.totalRevenue != null &&
    f.totalAssets != null &&
    f.totalAssets > 0 &&
    f.previousRevenue != null &&
    f.previousTotalAssets != null &&
    f.previousTotalAssets > 0
  ) {
    const current = f.totalRevenue / f.totalAssets;
    const previous = f.previousRevenue / f.previousTotalAssets;
    assetTurnoverImproving = current > previous;
  }

  // Gross margin improving
  const grossMarginImproving =
    f.grossMargins != null &&
    f.previousGrossMargins != null &&
    f.grossMargins > f.previousGrossMargins;

  // ROIC = NOPAT / Invested Capital (approximate: EBIT*(1-tax) / (totalAssets - totalCash - nonInterestLiabilities))
  // Simplified: use ROE as proxy if ROIC not directly available
  const roicAbove10 =
    f.returnOnEquity != null && f.returnOnEquity > 0.10;

  // No share dilution: shares outstanding not increased
  const noShareDilution =
    f.sharesOutstanding != null &&
    f.previousSharesOutstanding != null &&
    f.sharesOutstanding <= f.previousSharesOutstanding * 1.02; // allow 2% buffer

  const components = [
    {
      label: "Asset Turnover improving YoY",
      maxPoints: 7,
      met: assetTurnoverImproving,
    },
    {
      label: "Gross Margin improving YoY",
      maxPoints: 6,
      met: grossMarginImproving,
    },
    {
      label: "ROIC/ROE > 10%",
      maxPoints: 6,
      met: roicAbove10,
    },
    {
      label: "No significant share dilution",
      maxPoints: 6,
      met: noShareDilution,
    },
  ];

  const scored = components.map((c) => ({ ...c, points: c.met ? c.maxPoints : 0 }));
  return {
    name: "Efficiency",
    score: scored.reduce((s, c) => s + c.points, 0),
    maxScore: 25,
    components: scored,
  };
}
