// Uses Node's built-in `node:sqlite` (stable enough for this project,
// still flagged experimental by Node itself) so the project needs zero
// extra native dependencies to persist data - just Node 22+.

import { DatabaseSync } from 'node:sqlite'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DB_PATH = path.join(__dirname, '..', 'chargeback_shield.db')

export const db = new DatabaseSync(DB_PATH)

export function initSchema() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS disputes (
      id TEXT PRIMARY KEY,
      reason_code TEXT NOT NULL,
      reason_label TEXT NOT NULL,
      amount REAL NOT NULL,
      amount_display TEXT NOT NULL,
      has_delivery_proof INTEGER DEFAULT 0,
      has_customer_comm INTEGER DEFAULT 0,
      has_refund_record INTEGER DEFAULT 0,
      prior_disputes_by_customer INTEGER DEFAULT 0,
      account_age_days INTEGER DEFAULT 0,
      days_since_txn INTEGER DEFAULT 0,
      customer_verified INTEGER DEFAULT 0,
      fight_worth_it INTEGER DEFAULT 0,
      win_probability REAL DEFAULT 0,
      decision TEXT DEFAULT 'REVIEW',
      signals TEXT DEFAULT '',
      confidence_label TEXT DEFAULT '',
      explanation TEXT DEFAULT '',
      features_json TEXT DEFAULT '[]',
      included_evidence_json TEXT DEFAULT '[]',
      missing_evidence_json TEXT DEFAULT '[]',
      submittable INTEGER DEFAULT 0,
      submitted INTEGER DEFAULT 0,
      recommendation TEXT DEFAULT '',
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS settings (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      fight_threshold REAL DEFAULT 65,
      accept_threshold REAL DEFAULT 35
    );

    CREATE TABLE IF NOT EXISTS review_queues (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      reason_codes TEXT DEFAULT '',
      min_confidence REAL DEFAULT 70,
      priority TEXT DEFAULT 'Medium',
      reviewer TEXT DEFAULT '',
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      password_salt TEXT NOT NULL,
      display_name TEXT DEFAULT '',
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS sessions (
      token TEXT PRIMARY KEY,
      user_id INTEGER NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL,
      message TEXT NOT NULL,
      read INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    );
  `)

  // Migration safety net: add columns to pre-existing DBs from earlier runs.
  const disputeCols = (db.prepare("PRAGMA table_info(disputes)").all() as any[]).map((c) => c.name)
  if (!disputeCols.includes('submitted')) {
    db.exec('ALTER TABLE disputes ADD COLUMN submitted INTEGER DEFAULT 0')
  }
}
