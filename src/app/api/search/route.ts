import { NextRequest, NextResponse } from "next/server";
import { searchStocks } from "@/lib/yahoo-finance";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q");
  if (!q || q.trim().length < 1) {
    return NextResponse.json([]);
  }
  try {
    const results = await searchStocks(q.trim());
    return NextResponse.json(results);
  } catch {
    return NextResponse.json([]);
  }
}
