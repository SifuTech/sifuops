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
