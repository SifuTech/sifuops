import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifySessionToken, COOKIE_NAME } from '@/lib/auth'
import { sql, ensureTable, ensureLessonsTable, ensureWorkItemsTable } from '@/lib/db'
import { syncProjects } from '@/lib/sync-projects'
import { syncWorkItems } from '@/lib/sync-work-items'
import { isDemoMode } from '@/lib/demo'

async function getLastSync(): Promise<string | null> {
  try {
    const rows = await sql`SELECT MAX(synced_at) AS last_sync FROM monday_work_items`
    return (rows[0]?.last_sync as string | null) ?? null
  } catch {
    return null
  }
}

async function requireSession(request: NextRequest): Promise<boolean> {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value
  if (!token) return false
  const session = await verifySessionToken(token)
  return !!session
}

export async function GET(request: NextRequest) {
  if (!await requireSession(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  if (await isDemoMode(request)) {
    return NextResponse.json({ lastSync: new Date().toISOString() })
  }
  return NextResponse.json({ lastSync: await getLastSync() })
}

export async function POST(request: NextRequest) {
  if (!await requireSession(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  if (await isDemoMode(request)) {
    return NextResponse.json({ lastSync: new Date().toISOString(), projects: 4 })
  }

  await ensureTable()
  await ensureLessonsTable()
  await ensureWorkItemsTable()

  const projectBoards = await syncProjects()
  await syncWorkItems(projectBoards)

  return NextResponse.json({ lastSync: await getLastSync(), projects: projectBoards.length })
}
