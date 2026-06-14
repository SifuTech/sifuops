import { NextRequest, NextResponse } from 'next/server'
import { checkCredentials, createPendingToken, PENDING_COOKIE, PENDING_DURATION_MS } from '@/lib/auth'
import { getTotpSecret, ensureTotpTable } from '@/lib/db'
import { DEMO_COOKIE } from '@/lib/demo'

const DEMO_USERNAME = 'sifutechgaming'
const DEMO_PASSWORD = 'sifutechgaming'

export async function POST(request: NextRequest) {
  const body = await request.formData()
  const username = (body.get('username') as string | null)?.trim() ?? ''
  const password = (body.get('password') as string | null) ?? ''
  const from = (body.get('from') as string | null) ?? '/'
  const remember = body.get('remember') === '1'

  const isDemo = request.cookies.get(DEMO_COOKIE)?.value === '1'
  const demoCredentials = isDemo && username === DEMO_USERNAME && password === DEMO_PASSWORD

  if (!demoCredentials && !checkCredentials(username, password)) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('error', '1')
    loginUrl.searchParams.set('from', from)
    return NextResponse.redirect(loginUrl, { status: 303 })
  }

  // Demo users always go to 2FA (accepted with 123456 in verify-totp)
  const hasTotpSetup = demoCredentials ? true : await (async () => {
    await ensureTotpTable()
    const totpRow = await getTotpSecret(username)
    return totpRow?.verified === true
  })()

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
