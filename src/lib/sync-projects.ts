import { sql } from './db'
import { listBoards } from './monday'

export async function syncProjects(): Promise<number> {
  const boards = await listBoards()

  const matches = boards.flatMap((board) => {
    if (board.name.toLowerCase().includes('template')) return []
    const group = board.groups.find((g) =>
      g.title.toLowerCase().includes('lessons learnt'),
    )
    return group ? [{ board, group }] : []
  })

  for (const { board, group } of matches) {
    await sql`
      INSERT INTO projects (board_id, board_name, group_id, group_name, last_synced_at)
      VALUES (${board.id}, ${board.name}, ${group.id}, ${group.title}, NOW())
      ON CONFLICT (board_id) DO UPDATE SET
        board_name     = EXCLUDED.board_name,
        group_id       = EXCLUDED.group_id,
        group_name     = EXCLUDED.group_name,
        last_synced_at = NOW(),
        updated_at     = NOW()
    `
  }

  return matches.length
}
