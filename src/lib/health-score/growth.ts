import type { StockFundamentals, HealthScoreCategory } from "@/types/stock";

export function scoreGrowth(f: StockFundamentals): HealthScoreCategory {
  const revenueGrowth = f.revenueGrowth;
  const epsGrowth = f.epsGrowth;

  // FCF growth: compare current vs previous
  let fcfGrowth: boolean | null = null;
  if (f.freeCashflow != null && f.previousFreeCashflow != null) {
    fcfGrowth = f.freeCashflow > f.previousFreeCashflow;
  }

  // Revenue acceleration: current growth vs implied previous
  // We use revenueGrowth as a proxy for current YoY growth (Yahoo provides)
  const revenueAccelerating = revenueGrowth != null && revenueGrowth > 0.05;

  const components = [
    {
      label: "Revenue Growth > 10% YoY",
      maxPoints: 7,
      met: revenueGrowth != null && revenueGrowth > 0.10,
    },
    {
      label: "EPS Growth > 10% YoY",
      maxPoints: 6,
      met: epsGrowth != null && epsGrowth > 0.10,
    },
    {
      label: "FCF Growth > 0 YoY",
      maxPoints: 6,
      met: fcfGrowth === true,
    },
    {
      label: "Revenue Growing > 5% (momentum)",
      maxPoints: 6,
      met: revenueAccelerating,
    },
  ];

  const scored = components.map((c) => ({ ...c, points: c.met ? c.maxPoints : 0 }));
  return {
    name: "Growth",
    score: scored.reduce((s, c) => s + c.points, 0),
    maxScore: 25,
    components: scored,
  };
}
