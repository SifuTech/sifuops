import { sql } from '@/lib/db'
import { getBoardWorkItems, type Board } from '@/lib/monday'

const PHASE_ALIASES: Array<{ key: string; aliases: string[] }> = [
  { key: 'presales', aliases: ['pre-sales', 'technical discovery', 'pre sales'] },
  { key: 'discovery', aliases: ['discovery', 'scoping', 'estimation & planning'] },
  { key: 'build', aliases: ['build', 'demo', 'refine', 'development'] },
  { key: 'test', aliases: ['test', 'testing', 'uat', 'user acceptance'] },
  { key: 'handhold', aliases: ['handhold', 'go live', 'post go-live', 'post go live', 'closure', 'prepare for go live'] },
]

function getPhaseKey(groupName: string): string | null {
  const normalized = groupName.toLowerCase()
  for (const phase of PHASE_ALIASES) {
    if (phase.aliases.some((a) => normalized.includes(a))) {
      return phase.key
    }
  }
  return null
}

export async function syncWorkItems(boards: Board[]): Promise<number> {
  let count = 0
  for (const board of boards) {
    const items = await getBoardWorkItems(board.id, board.groups)

    // Delete stale items for this board before re-inserting
    await sql`DELETE FROM monday_work_items WHERE board_id = ${board.id}`

    for (const item of items) {
      const phaseKey = getPhaseKey(item.group)
      await sql`
        INSERT INTO monday_work_items (
          item_id, board_id, board_name, group_name, phase_key,
          name, owner, status, priority, target_date, planned_date, effort, synced_at
        )
        VALUES (
          ${item.id}, ${board.id}, ${board.name}, ${item.group}, ${phaseKey},
          ${item.name}, ${item.owner}, ${item.status}, ${item.priority},
          ${item.targetDate}, ${item.plannedDate}, ${item.effort}, NOW()
        )
        ON CONFLICT (item_id) DO UPDATE SET
          board_name   = EXCLUDED.board_name,
          group_name   = EXCLUDED.group_name,
          phase_key    = EXCLUDED.phase_key,
          name         = EXCLUDED.name,
          owner        = EXCLUDED.owner,
          status       = EXCLUDED.status,
          priority     = EXCLUDED.priority,
          target_date  = EXCLUDED.target_date,
          planned_date = EXCLUDED.planned_date,
          effort       = EXCLUDED.effort,
          synced_at    = NOW()
      `
      count++
    }
  }
  return count
}
