import { NextRequest } from 'next/server'
import { ensureTable, ensureLessonsTable, ensureWorkItemsTable } from '@/lib/db'
import { syncProjects } from '@/lib/sync-projects'
import { syncLessons } from '@/lib/sync-lessons'
import { syncWorkItems } from '@/lib/sync-work-items'
import { getBoardGroups, getBoardWorkItems } from '@/lib/monday'
import { generateBriefing } from '@/lib/briefing-agent'

const BAU_BOARD_ID = '1329135113'

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 })
  }

  const webhookUrl = process.env.DISCORD_WEBHOOK_URL
  if (!webhookUrl) {
    return new Response('DISCORD_WEBHOOK_URL not configured', { status: 500 })
  }

  await ensureTable()
  await ensureLessonsTable()
  await ensureWorkItemsTable()

  const projectBoards = await syncProjects()
  await syncLessons()
  await syncWorkItems(projectBoards)

  const [projectWorkData, bauGroups] = await Promise.all([
    Promise.all(
      projectBoards.map(async (board) => ({
        boardName: board.name,
        items: await getBoardWorkItems(board.id, board.groups),
      })),
    ),
    getBoardGroups(BAU_BOARD_ID),
  ])

  const activeBauGroups = bauGroups.filter((g) => !g.title.toLowerCase().includes('complete') && !g.title.toLowerCase().includes('archive'))
  const bauItems = await getBoardWorkItems(BAU_BOARD_ID, activeBauGroups, { filterGroups: false })
  const allWorkData = [...projectWorkData, { boardName: 'BAU', items: bauItems }]

  // Only run Mon–Fri (1–5) and Sunday (0). Skip Saturday (6).
  const dayUTC = new Date().getUTCDay()
  if (dayUTC === 6) {
    return Response.json({ ok: true, skipped: 'Saturday' })
  }
  const isSunday = dayUTC === 0

  const maskNames = request.nextUrl.searchParams.get('maskNames') === '1'
  const content = (await generateBriefing(allWorkData, { maskNames, isSunday })).slice(0, 2000)

  const res = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content }),
  })

  if (!res.ok) {
    return new Response(`Discord error: ${res.status}`, { status: 502 })
  }

  return Response.json({ ok: true, projects: allWorkData.length })
}
