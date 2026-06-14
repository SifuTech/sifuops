import { NextRequest, NextResponse } from 'next/server'
import { createPendingToken, PENDING_COOKIE, PENDING_DURATION_MS } from '@/lib/auth'
import { DEMO_COOKIE } from '@/lib/demo'

export async function POST(request: NextRequest) {
  const pendingToken = await createPendingToken('demo', '/', false)

  const response = NextResponse.redirect(new URL('/login/verify', request.url), { status: 303 })

  response.cookies.set(DEMO_COOKIE, '1', {
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
  })

  response.cookies.set(PENDING_COOKIE, pendingToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: Math.floor(PENDING_DURATION_MS / 1000),
    path: '/',
  })

  return response
}
