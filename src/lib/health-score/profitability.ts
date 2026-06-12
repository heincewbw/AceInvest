import type { StockFundamentals, HealthScoreCategory } from "@/types/stock";

export function scoreProfitability(f: StockFundamentals): HealthScoreCategory {
  const components = [
    {
      label: "ROE > 15%",
      maxPoints: 5,
      met: f.returnOnEquity != null && f.returnOnEquity > 0.15,
    },
    {
      label: "ROA > 5%",
      maxPoints: 5,
      met: f.returnOnAssets != null && f.returnOnAssets > 0.05,
    },
    {
      label: "Net Margin > 0%",
      maxPoints: 5,
      met: f.profitMargins != null && f.profitMargins > 0,
    },
    {
      label: "FCF > Net Income (quality)",
      maxPoints: 5,
      met:
        f.freeCashflow != null &&
        f.totalRevenue != null &&
        f.profitMargins != null &&
        f.freeCashflow > f.totalRevenue * f.profitMargins * 0.9,
    },
    {
      label: "Operating Cash Flow > 0",
      maxPoints: 5,
      met: f.operatingCashflow != null && f.operatingCashflow > 0,
    },
  ];

  const scored = components.map((c) => ({ ...c, points: c.met ? c.maxPoints : 0 }));
  return {
    name: "Profitability",
    score: scored.reduce((s, c) => s + c.points, 0),
    maxScore: 25,
    components: scored,
  };
}
