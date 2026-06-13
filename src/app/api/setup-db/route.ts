import { NextRequest } from 'next/server'
import { ensureTable } from '@/lib/db'

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 })
  }

  await ensureTable()
  return Response.json({ ok: true, message: 'projects table ready' })
}
