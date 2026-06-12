import type { StockData, HealthScoreResult } from "@/types/stock";
import { scoreProfitability } from "./profitability";
import { scoreSolvency } from "./solvency";
import { scoreGrowth } from "./growth";
import { scoreEfficiency } from "./efficiency";

function getGrade(score: number): "A" | "B" | "C" | "D" | "F" {
  if (score >= 80) return "A";
  if (score >= 65) return "B";
  if (score >= 50) return "C";
  if (score >= 35) return "D";
  return "F";
}

export function calculateHealthScore(data: StockData): HealthScoreResult {
  const f = data.fundamentals;

  const categories = [
    scoreProfitability(f),
    scoreSolvency(f),
    scoreGrowth(f),
    scoreEfficiency(f),
  ];

  const totalScore = categories.reduce((s, c) => s + c.score, 0);

  return {
    ticker: data.quote.ticker,
    totalScore,
    grade: getGrade(totalScore),
    categories,
    calculatedAt: new Date().toISOString(),
  };
}
