import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import type { WatchlistItem } from "@/types/stock";

export async function GET() {
  const db = getDb();
  const rows = db
    .prepare("SELECT id, ticker, market, name, added_at, notes FROM watchlist ORDER BY added_at DESC")
    .all() as (Omit<WatchlistItem, "addedAt"> & { added_at: string })[];

  const items: WatchlistItem[] = rows.map((r) => ({
    id: r.id,
    ticker: r.ticker,
    market: r.market,
    name: r.name,
    addedAt: r.added_at,
    notes: r.notes,
  }));

  return NextResponse.json(items);
}

export async function POST(req: NextRequest) {
  const body = await req.json() as { ticker?: string; market?: string; name?: string; notes?: string };
  const { ticker, market, name, notes } = body;

  if (!ticker || !market) {
    return NextResponse.json({ error: "ticker and market are required" }, { status: 400 });
  }

  if (market !== "IDX" && market !== "US") {
    return NextResponse.json({ error: "market must be IDX or US" }, { status: 400 });
  }

  const db = getDb();
  try {
    db.prepare(
      "INSERT OR IGNORE INTO watchlist (ticker, market, name, notes) VALUES (?, ?, ?, ?)"
    ).run(ticker.toUpperCase(), market, name ?? null, notes ?? null);
    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const ticker = searchParams.get("ticker");

  if (!ticker) {
    return NextResponse.json({ error: "ticker query param required" }, { status: 400 });
  }

  const db = getDb();
  db.prepare("DELETE FROM watchlist WHERE ticker = ?").run(ticker.toUpperCase());
  return NextResponse.json({ success: true });
}
