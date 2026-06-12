import type { StockFundamentals, HealthScoreCategory } from "@/types/stock";

export function scoreSolvency(f: StockFundamentals): HealthScoreCategory {
  const de = f.debtToEquity;
  const prevDe = f.previousDebtToEquity;

  // Interest coverage: EBIT / interest expense
  // Approximate: EBITDA / totalDebt * 0.05 (assuming ~5% avg interest)
  let interestCoverage: number | null = null;
  if (f.ebit != null && f.totalDebt != null && f.totalDebt > 0) {
    const estimatedInterest = f.totalDebt * 0.05;
    interestCoverage = f.ebit / estimatedInterest;
  }

  const components = [
    {
      label: "Debt/Equity < 1",
      maxPoints: 7,
      met: de != null && de < 1,
    },
    {
      label: "D/E decreasing YoY",
      maxPoints: 6,
      met: de != null && prevDe != null && de < prevDe,
    },
    {
      label: "Current Ratio > 1.5",
      maxPoints: 6,
      met: f.currentRatio != null && f.currentRatio > 1.5,
    },
    {
      label: "Interest Coverage > 3×",
      maxPoints: 6,
      met: interestCoverage != null && interestCoverage > 3,
    },
  ];

  const scored = components.map((c) => ({ ...c, points: c.met ? c.maxPoints : 0 }));
  return {
    name: "Solvency",
    score: scored.reduce((s, c) => s + c.points, 0),
    maxScore: 25,
    components: scored,
  };
}
