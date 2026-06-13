import { neon } from '@neondatabase/serverless'

export const sql = neon(process.env.DATABASE_URL!)

export async function ensureTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS projects (
      id             SERIAL PRIMARY KEY,
      board_id       TEXT NOT NULL UNIQUE,
      board_name     TEXT NOT NULL,
      group_id       TEXT NOT NULL,
      group_name     TEXT NOT NULL,
      active         BOOLEAN NOT NULL DEFAULT true,
      last_synced_at TIMESTAMPTZ,
      created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `
}

export async function ensureLessonsTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS lessons_learnt (
      id           SERIAL PRIMARY KEY,
      board_id     TEXT NOT NULL,
      board_name   TEXT NOT NULL,
      item_id      TEXT NOT NULL UNIQUE,
      item_name    TEXT NOT NULL,
      last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `
}

export async function ensureWorkItemsTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS monday_work_items (
      item_id      TEXT PRIMARY KEY,
      board_id     TEXT NOT NULL,
      board_name   TEXT,
      group_name   TEXT,
      phase_key    TEXT,
      name         TEXT NOT NULL,
      owner        TEXT,
      status       TEXT,
      priority     TEXT NOT NULL DEFAULT 'Low',
      target_date  TEXT,
      planned_date TEXT,
      effort       TEXT,
      synced_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `
  await sql`CREATE INDEX IF NOT EXISTS monday_work_items_board_id ON monday_work_items (board_id)`
  await sql`CREATE INDEX IF NOT EXISTS monday_work_items_owner ON monday_work_items (owner)`
  await sql`CREATE INDEX IF NOT EXISTS monday_work_items_phase_key ON monday_work_items (phase_key)`
}
