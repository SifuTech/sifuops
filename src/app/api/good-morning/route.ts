import { NextRequest } from 'next/server'
import { ensureTable, ensureLessonsTable } from '@/lib/db'
import { syncProjects } from '@/lib/sync-projects'
import { syncLessons } from '@/lib/sync-lessons'
import { getBoardWorkItems } from '@/lib/monday'
import { generateBriefing } from '@/lib/briefing-agent'

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

  const projectBoards = await syncProjects()
  await syncLessons()

  const projectWorkData = await Promise.all(
    projectBoards.map(async (board) => ({
      boardName: board.name,
      items: await getBoardWorkItems(board.id, board.groups),
    })),
  )

  const maskNames = request.nextUrl.searchParams.get('maskNames') === '1'
  const content = (await generateBriefing(projectWorkData, { maskNames })).slice(0, 2000)

  const res = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content }),
  })

  if (!res.ok) {
    return new Response(`Discord error: ${res.status}`, { status: 502 })
  }

  return Response.json({ ok: true, projects: projectBoards.length })
}
