import { NextRequest, NextResponse } from 'next/server'
import { DEMO_COOKIE } from '@/lib/demo'

export async function POST(req: NextRequest) {
  const isDemo = req.cookies.get(DEMO_COOKIE)?.value === '1'
  const referer = req.headers.get('referer') ?? '/'
  const res = NextResponse.redirect(new URL(referer))

  if (isDemo) {
    res.cookies.delete(DEMO_COOKIE)
  } else {
    res.cookies.set(DEMO_COOKIE, '1', { path: '/', httpOnly: true, sameSite: 'lax' })
  }

  return res
}
