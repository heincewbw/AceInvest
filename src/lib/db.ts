import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

const DB_DIR = process.env.DATA_DIR
  ? path.resolve(process.env.DATA_DIR)
  : path.join(process.cwd(), "data");
const DB_PATH = path.join(DB_DIR, "aceinvest.db");

let _db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (_db) return _db;

  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }

  _db = new Database(DB_PATH);
  _db.pragma("journal_mode = WAL");
  _db.pragma("foreign_keys = ON");

  initSchema(_db);
  return _db;
}

function initSchema(db: Database.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS watchlist (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ticker TEXT NOT NULL UNIQUE,
      market TEXT NOT NULL CHECK(market IN ('IDX', 'US')),
      name TEXT,
      added_at TEXT DEFAULT (datetime('now')),
      notes TEXT
    );

    CREATE TABLE IF NOT EXISTS stock_cache (
      ticker TEXT PRIMARY KEY,
      data TEXT NOT NULL,
      cached_at TEXT DEFAULT (datetime('now'))
    );
  `);
}

const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

export function getCached<T>(ticker: string): T | null {
  const db = getDb();
  const row = db
    .prepare("SELECT data, cached_at FROM stock_cache WHERE ticker = ?")
    .get(ticker.toUpperCase()) as { data: string; cached_at: string } | undefined;

  if (!row) return null;

  const cachedAt = new Date(row.cached_at).getTime();
  if (Date.now() - cachedAt > CACHE_TTL_MS) {
    db.prepare("DELETE FROM stock_cache WHERE ticker = ?").run(ticker.toUpperCase());
    return null;
  }

  return JSON.parse(row.data) as T;
}

export function setCache(ticker: string, data: unknown): void {
  const db = getDb();
  db.prepare(
    "INSERT OR REPLACE INTO stock_cache (ticker, data, cached_at) VALUES (?, ?, datetime('now'))"
  ).run(ticker.toUpperCase(), JSON.stringify(data));
}

export function clearCache(ticker: string): void {
  const db = getDb();
  db.prepare("DELETE FROM stock_cache WHERE ticker = ?").run(ticker.toUpperCase());
}
