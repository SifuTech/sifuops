import { NextRequest } from 'next/server'
import { sql, ensureTable } from '@/lib/db'
import { syncProjects } from '@/lib/sync-projects'
import { getGroupItems } from '@/lib/monday'

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
  await syncProjects()

  const projects = await sql`
    SELECT board_id, board_name, group_id, group_name
    FROM projects
    WHERE active = true
    ORDER BY board_name
  `

  const lines: string[] = ['Good morning! ☀️']

  for (const project of projects) {
    if (!project.group_id) continue
    const items = await getGroupItems(project.board_id, project.group_id)
    if (items.length === 0) continue
    lines.push(`\n**${project.board_name}**`)
    for (const item of items) {
      lines.push(`• ${item.name}`)
    }
  }

  const content = lines.join('\n').slice(0, 2000)

  const res = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content }),
  })

  if (!res.ok) {
    return new Response(`Discord error: ${res.status}`, { status: 502 })
  }

  return Response.json({ ok: true, projects: projects.length })
}
