import { NextRequest, NextResponse } from 'next/server'
import { checkCredentials, createPendingToken, PENDING_COOKIE, PENDING_DURATION_MS } from '@/lib/auth'
import { getTotpSecret, ensureTotpTable } from '@/lib/db'

export async function POST(request: NextRequest) {
  const body = await request.formData()
  const username = (body.get('username') as string | null)?.trim() ?? ''
  const password = (body.get('password') as string | null) ?? ''
  const from = (body.get('from') as string | null) ?? '/'
  const remember = body.get('remember') === '1'

  if (!checkCredentials(username, password)) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('error', '1')
    loginUrl.searchParams.set('from', from)
    return NextResponse.redirect(loginUrl, { status: 303 })
  }

  await ensureTotpTable()
  const totpRow = await getTotpSecret(username)
  const hasTotpSetup = totpRow?.verified === true

  const pendingToken = await createPendingToken(username, from, remember)
  const destination = hasTotpSetup ? '/login/verify' : '/setup-2fa'
  const response = NextResponse.redirect(new URL(destination, request.url), { status: 303 })

  response.cookies.set(PENDING_COOKIE, pendingToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: Math.floor(PENDING_DURATION_MS / 1000),
    path: '/',
  })

  return response
}
