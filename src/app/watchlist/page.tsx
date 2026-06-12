import { getDb } from "@/lib/db";
import type { WatchlistItem } from "@/types/stock";
import WatchlistClient from "./WatchlistClient";

export const dynamic = "force-dynamic";

export default function WatchlistPage() {
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

  return <WatchlistClient initialItems={items} />;
}
