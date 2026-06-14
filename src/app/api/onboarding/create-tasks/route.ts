import { NextRequest, NextResponse } from 'next/server'
import { getBoardGroups, createItem, addItemUpdate } from '@/lib/monday'
import type { AgentOutput } from '@/app/api/onboarding/analyse/route'
import { isDemoMode } from '@/lib/demo'

type Task = AgentOutput['suggested_tasks'][number]

type TaskResult = {
  title: string
  success: boolean
  itemId?: string
  error?: string
}

// Group title keywords that identify real work phases vs meta groups
const META_GROUP_KEYWORDS = [
  'lessons learnt',
  'lessons learned',
  'risks',
  'archived',
  'template',
  'reference',
]

function isMetaGroup(title: string): boolean {
  const t = title.toLowerCase()
  return META_GROUP_KEYWORDS.some((kw) => t.includes(kw))
}

// Prefer discovery/scoping group as the landing zone for onboarding tasks
const DISCOVERY_ALIASES = [
  'discovery',
  'scoping',
  'estimation',
  'planning',
  'pre-sales',
  'presales',
]

function pickGroup(groups: { id: string; title: string }[]): string | null {
  const workGroups = groups.filter((g) => !isMetaGroup(g.title))
  if (workGroups.length === 0) return groups[0]?.id ?? null

  const discovery = workGroups.find((g) =>
    DISCOVERY_ALIASES.some((a) => g.title.toLowerCase().includes(a)),
  )
  return (discovery ?? workGroups[0]).id
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { tasks, boardId } = body as { tasks: Task[]; boardId: string }

    if (!boardId) {
      return NextResponse.json({ error: 'boardId is required' }, { status: 400 })
    }
    if (!Array.isArray(tasks) || tasks.length === 0) {
      return NextResponse.json({ error: 'tasks must be a non-empty array' }, { status: 400 })
    }

    if (await isDemoMode(req)) {
      const results = tasks.map((task) => ({
        title: task.title,
        success: true,
        itemId: `demo-task-${Math.random().toString(36).slice(2, 8)}`,
      }))
      return NextResponse.json({ results })
    }

    // Resolve the group once for all tasks
    const groups = await getBoardGroups(boardId)
    const groupId = pickGroup(groups)
    if (!groupId) {
      return NextResponse.json(
        { error: 'No usable groups found on the target board' },
        { status: 422 },
      )
    }

    // Create tasks sequentially to stay well within Monday.com rate limits
    const results: TaskResult[] = []
    for (const task of tasks) {
      try {
        const itemName = `[${task.agent}] ${task.title}`
        const itemId = await createItem(boardId, groupId, itemName)

        if (task.description?.trim()) {
          await addItemUpdate(itemId, task.description.trim())
        }

        results.push({ title: task.title, success: true, itemId })
      } catch (err) {
        results.push({
          title: task.title,
          success: false,
          error: err instanceof Error ? err.message : 'Unknown error',
        })
      }
    }

    return NextResponse.json({ results })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
