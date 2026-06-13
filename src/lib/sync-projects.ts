import { sql } from './db'
import { listBoards } from './monday'

export async function syncProjects(): Promise<number> {
  const boards = await listBoards()

  const projectBoards = boards.filter((board) => {
    if (board.name.toLowerCase().includes('template')) return false
    return board.groups.some((g) => g.title === '---Risks---')
  })

  for (const board of projectBoards) {
    const lessonsGroup = board.groups.find((g) =>
      g.title.toLowerCase().includes('lessons learnt'),
    )

    await sql`
      INSERT INTO projects (board_id, board_name, group_id, group_name, last_synced_at)
      VALUES (
        ${board.id},
        ${board.name},
        ${lessonsGroup?.id ?? null},
        ${lessonsGroup?.title ?? null},
        NOW()
      )
      ON CONFLICT (board_id) DO UPDATE SET
        board_name     = EXCLUDED.board_name,
        group_id       = EXCLUDED.group_id,
        group_name     = EXCLUDED.group_name,
        last_synced_at = NOW(),
        updated_at     = NOW()
    `
  }

  return projectBoards.length
}
