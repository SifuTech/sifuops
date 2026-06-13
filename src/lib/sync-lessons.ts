import { sql } from './db'
import { getGroupItems } from './monday'

export async function syncLessons(): Promise<void> {
  const projects = await sql`
    SELECT board_id, board_name, group_id
    FROM projects
    WHERE active = true AND group_id IS NOT NULL
  `

  for (const project of projects) {
    const items = await getGroupItems(project.board_id, project.group_id)

    for (const item of items) {
      await sql`
        INSERT INTO lessons_learnt (board_id, board_name, item_id, item_name, last_seen_at)
        VALUES (${project.board_id}, ${project.board_name}, ${item.id}, ${item.name}, NOW())
        ON CONFLICT (item_id) DO UPDATE SET
          item_name    = EXCLUDED.item_name,
          board_name   = EXCLUDED.board_name,
          last_seen_at = NOW()
      `
    }
  }
}
