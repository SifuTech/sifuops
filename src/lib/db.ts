import { sql } from '@vercel/postgres'

export { sql }

export async function ensureTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS projects (
      id            SERIAL PRIMARY KEY,
      board_id      TEXT NOT NULL UNIQUE,
      board_name    TEXT NOT NULL,
      group_id      TEXT NOT NULL,
      group_name    TEXT NOT NULL,
      active        BOOLEAN NOT NULL DEFAULT true,
      last_synced_at TIMESTAMPTZ,
      created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `
}
