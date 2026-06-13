import { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 })
  }

  const webhookUrl = process.env.DISCORD_WEBHOOK_URL
  if (!webhookUrl) {
    return new Response('DISCORD_WEBHOOK_URL not configured', { status: 500 })
  }

  const res = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content: 'Good morning! ☀️' }),
  })

  if (!res.ok) {
    return new Response(`Discord error: ${res.status}`, { status: 502 })
  }

  return new Response('OK', { status: 200 })
}
