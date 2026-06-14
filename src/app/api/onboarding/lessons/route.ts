import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'

// Keywords associated with each project type — used for relevance scoring
const PROJECT_TYPE_KEYWORDS: Record<string, string[]> = {
  'new-build':    ['new build', 'new client', 'onboarding', 'setup', 'configuration', 'full build'],
  'new-module':   ['new module', 'module', 'add-on', 'extension', 'rollout'],
  'enhancement':  ['enhancement', 'improve', 'update', 'change request', 'upgrade', 'existing'],
  'task-delivery':['bulk', 'import', 'export', 'migration', 'deletion', 'data', 'task'],
  'development':  ['development', 'custom', 'bespoke', 'integration', 'api', 'build'],
  'other':        [],
}

type RawLesson = {
  board_id: string
  board_name: string
  item_name: string
}

export type LessonGroup = {
  projectName: string
  boardId: string
  lessons: string[]
}

function scoreLesson(itemName: string, modules: string[], typeKeywords: string[]): number {
  const text = itemName.toLowerCase()
  let score = 0

  for (const mod of modules) {
    if (text.includes(mod.toLowerCase())) score += 2
  }

  for (const kw of typeKeywords) {
    if (text.includes(kw.toLowerCase())) score += 1
  }

  return score
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { projectType, modules } = body as {
      projectType: string
      modules: string[]
    }

    const typeKeywords = PROJECT_TYPE_KEYWORDS[projectType] ?? []

    let rows: RawLesson[] = []
    try {
      rows = (await sql`
        SELECT ll.board_id, ll.board_name, ll.item_name
        FROM lessons_learnt ll
        INNER JOIN projects p ON p.board_id = ll.board_id
        WHERE p.active = true
        ORDER BY ll.board_name, ll.item_name
      `) as RawLesson[]
    } catch {
      // Table may not exist yet — return empty
      return NextResponse.json({ lessons: [] })
    }

    if (rows.length === 0) {
      return NextResponse.json({ lessons: [] })
    }

    // Group by board, score each lesson, filter out zero-score lessons,
    // keep up to 10 lessons per project
    const byBoard = new Map<string, { boardName: string; scored: { text: string; score: number }[] }>()

    for (const row of rows) {
      if (!byBoard.has(row.board_id)) {
        byBoard.set(row.board_id, { boardName: row.board_name, scored: [] })
      }
      const score = scoreLesson(row.item_name, modules ?? [], typeKeywords)
      byBoard.get(row.board_id)!.scored.push({ text: row.item_name, score })
    }

    const lessons: LessonGroup[] = []

    for (const [boardId, { boardName, scored }] of byBoard.entries()) {
      const relevant = scored
        .filter((s) => s.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 10)
        .map((s) => s.text)

      if (relevant.length > 0) {
        lessons.push({ projectName: boardName, boardId, lessons: relevant })
      }
    }

    // Sort groups: most relevant first (most total lessons = most hits)
    lessons.sort((a, b) => b.lessons.length - a.lessons.length)

    return NextResponse.json({ lessons })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
