"use client";

import type { HealthScoreResult } from "@/types/stock";
import { RadialBarChart, RadialBar, PolarAngleAxis, ResponsiveContainer } from "recharts";
import { CheckCircle2, XCircle } from "lucide-react";

function gradeColor(grade: string) {
  switch (grade) {
    case "A": return "text-green-400";
    case "B": return "text-lime-400";
    case "C": return "text-yellow-400";
    case "D": return "text-orange-400";
    default: return "text-red-400";
  }
}

function scoreToColor(score: number, max: number) {
  const pct = score / max;
  if (pct >= 0.8) return "#22c55e";
  if (pct >= 0.6) return "#84cc16";
  if (pct >= 0.4) return "#f59e0b";
  if (pct >= 0.2) return "#f97316";
  return "#ef4444";
}

interface Props {
  result: HealthScoreResult;
}

export default function HealthScoreGauge({ result }: Props) {
  const { totalScore, grade, categories } = result;

  const gaugeData = [{ value: totalScore, fill: scoreToColor(totalScore, 100) }];

  return (
    <div className="space-y-5">
      {/* Main gauge */}
      <div className="bg-slate-800 rounded-xl p-6 flex flex-col items-center">
        <div className="relative w-48 h-24">
          <ResponsiveContainer width="100%" height="100%">
            <RadialBarChart
              cx="50%"
              cy="100%"
              innerRadius="70%"
              outerRadius="100%"
              barSize={14}
              data={gaugeData}
              startAngle={180}
              endAngle={0}
            >
              <PolarAngleAxis
                type="number"
                domain={[0, 100]}
                angleAxisId={0}
                tick={false}
              />
              <RadialBar
                background={{ fill: "#334155" }}
                dataKey="value"
                angleAxisId={0}
                cornerRadius={7}
              />
            </RadialBarChart>
          </ResponsiveContainer>
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-center">
            <div className="text-3xl font-bold">{totalScore}</div>
            <div className="text-xs text-slate-400">/ 100</div>
          </div>
        </div>
        <div className={`text-5xl font-black mt-2 ${gradeColor(grade)}`}>{grade}</div>
        <div className="text-sm text-slate-400 mt-1">Overall Health Score</div>
      </div>

      {/* Category breakdown */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {categories.map((cat) => (
          <div key={cat.name} className="bg-slate-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-sm">{cat.name}</span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold" style={{ color: scoreToColor(cat.score, cat.maxScore) }}>
                  {cat.score}/{cat.maxScore}
                </span>
                <div className="w-20 h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${(cat.score / cat.maxScore) * 100}%`,
                      background: scoreToColor(cat.score, cat.maxScore),
                    }}
                  />
                </div>
              </div>
            </div>
            <div className="space-y-1.5">
              {cat.components.map((comp) => (
                <div key={comp.label} className="flex items-center gap-2 text-xs">
                  {comp.met ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-400 shrink-0" />
                  ) : (
                    <XCircle className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                  )}
                  <span className={comp.met ? "text-slate-300" : "text-slate-500"}>
                    {comp.label}
                  </span>
                  <span className="ml-auto text-slate-500">+{comp.maxPoints}pt</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
