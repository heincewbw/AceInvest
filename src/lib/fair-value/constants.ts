import type { SectorKey, SectorMultiples } from "@/types/stock";

// Hardcoded sector median multiples (consensus approximations)
export const SECTOR_MULTIPLES: Record<SectorKey, SectorMultiples> = {
  technology:              { pe: 28, pb: 6,   ps: 5,   evEbitda: 20, evRevenue: 5,   evEbit: 25, pfcf: 25 },
  healthcare:              { pe: 22, pb: 4,   ps: 3,   evEbitda: 16, evRevenue: 3,   evEbit: 18, pfcf: 22 },
  financials:              { pe: 14, pb: 1.4, ps: 2.5, evEbitda: 12, evRevenue: 2.5, evEbit: 12, pfcf: 14 },
  consumer_discretionary:  { pe: 20, pb: 4,   ps: 1.2, evEbitda: 14, evRevenue: 1.2, evEbit: 16, pfcf: 18 },
  consumer_staples:        { pe: 20, pb: 4,   ps: 1.5, evEbitda: 14, evRevenue: 1.5, evEbit: 16, pfcf: 20 },
  industrials:             { pe: 18, pb: 3,   ps: 1.5, evEbitda: 13, evRevenue: 1.5, evEbit: 14, pfcf: 18 },
  energy:                  { pe: 12, pb: 1.5, ps: 1,   evEbitda: 7,  evRevenue: 1,   evEbit: 10, pfcf: 10 },
  utilities:               { pe: 18, pb: 1.8, ps: 2,   evEbitda: 10, evRevenue: 2,   evEbit: 15, pfcf: 18 },
  real_estate:             { pe: 22, pb: 1.8, ps: 5,   evEbitda: 18, evRevenue: 5,   evEbit: 20, pfcf: 20 },
  materials:               { pe: 15, pb: 2,   ps: 1.2, evEbitda: 9,  evRevenue: 1.2, evEbit: 12, pfcf: 14 },
  communication_services:  { pe: 18, pb: 3,   ps: 2.5, evEbitda: 12, evRevenue: 2.5, evEbit: 15, pfcf: 16 },
  default:                 { pe: 18, pb: 2.5, ps: 2,   evEbitda: 12, evRevenue: 2,   evEbit: 15, pfcf: 16 },
};

const SECTOR_MAP: Record<string, SectorKey> = {
  "Technology": "technology",
  "Healthcare": "healthcare",
  "Financial Services": "financials",
  "Financials": "financials",
  "Consumer Cyclical": "consumer_discretionary",
  "Consumer Defensive": "consumer_staples",
  "Industrials": "industrials",
  "Energy": "energy",
  "Utilities": "utilities",
  "Real Estate": "real_estate",
  "Basic Materials": "materials",
  "Communication Services": "communication_services",
};

export function getSectorMultiples(sector: string | null): SectorMultiples {
  if (!sector) return SECTOR_MULTIPLES.default;
  const key = SECTOR_MAP[sector];
  return SECTOR_MULTIPLES[key ?? "default"];
}

export const WACC = 0.10; // 10% default
export const RISK_FREE_RATE = 0.045; // 4.5% approximate
export const TERMINAL_GROWTH_RATE = 0.025; // 2.5% perpetuity growth
export const FCF_GROWTH_RATE_DEFAULT = 0.07; // 7% if no data
export const REQUIRED_RETURN_DDM = 0.10; // 10% required return for DDM
