import { NextRequest } from 'next/server'
import { sql } from '@/lib/db'
import { isDemoMode } from '@/lib/demo'
import { DEMO_BOARDS, DEMO_LESSONS_COUNT } from '@/lib/demo-data'

export async function GET(req: NextRequest) {
  if (await isDemoMode(req)) {
    return Response.json({ projects: DEMO_BOARDS, totalLessons: DEMO_LESSONS_COUNT })
  }

  const projects = await sql`
    SELECT
      p.board_id,
      p.board_name,
      p.group_id,
      p.group_name,
      p.active,
      p.last_synced_at,
      COUNT(l.id)::int AS lessons_count
    FROM projects p
    LEFT JOIN lessons_learnt l ON l.board_id = p.board_id
    WHERE p.active = true
    GROUP BY p.board_id, p.board_name, p.group_id, p.group_name, p.active, p.last_synced_at
    ORDER BY p.board_name
  `

  const totalLessons = await sql`SELECT COUNT(*)::int AS count FROM lessons_learnt`

  return Response.json({
    projects,
    totalLessons: totalLessons[0]?.count ?? 0,
  })
}
