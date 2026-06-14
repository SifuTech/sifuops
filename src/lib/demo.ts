import { cookies } from 'next/headers'
import type { NextRequest } from 'next/server'

export const DEMO_COOKIE = 'sifu_demo'

export async function isDemoMode(req?: NextRequest): Promise<boolean> {
  if (req) return req.cookies.get(DEMO_COOKIE)?.value === '1'
  const store = await cookies()
  return store.get(DEMO_COOKIE)?.value === '1'
}
