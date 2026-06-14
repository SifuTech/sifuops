import { NextRequest, NextResponse } from 'next/server'
import {
  verifyPendingToken, createSessionToken,
  PENDING_COOKIE, COOKIE_NAME,
  SESSION_DURATION_MS, SESSION_DURATION_REMEMBER_MS,
} from '@/lib/auth'
import { getTotpSecret } from '@/lib/db'
import { verifyCode } from '@/lib/totp'
import { DEMO_COOKIE } from '@/lib/demo'

export async function POST(request: NextRequest) {
  const body = await request.formData()
  const code = ((body.get('code') as string | null) ?? '').replace(/\s/g, '')

  const pendingToken = request.cookies.get(PENDING_COOKIE)?.value
  if (!pendingToken) return redirectToLogin(request, 'Session expired. Please sign in again.')

  const pending = await verifyPendingToken(pendingToken)
  if (!pending) return redirectToLogin(request, 'Session expired. Please sign in again.')

  // Demo mode: accept 123456 without real TOTP verification
  const isDemo = request.cookies.get(DEMO_COOKIE)?.value === '1'
  if (isDemo && code === '123456') {
    return issueSession(request, pending.username, pending.remember, pending.from)
  }

  const totpRow = await getTotpSecret(pending.username)
  if (!totpRow?.verified) return redirectToLogin(request, '2FA not configured.')

  if (!verifyCode(code, totpRow.secret)) {
    const url = new URL('/login/verify', request.url)
    url.searchParams.set('error', '1')
    return NextResponse.redirect(url, { status: 303 })
  }

  return issueSession(request, pending.username, pending.remember, pending.from)
}

async function issueSession(request: NextRequest, username: string, remember: boolean, destination: string) {
  const sessionToken = await createSessionToken(username, remember)
  const maxAge = Math.floor((remember ? SESSION_DURATION_REMEMBER_MS : SESSION_DURATION_MS) / 1000)

  const response = NextResponse.redirect(new URL(destination, request.url), { status: 303 })
  response.cookies.set(COOKIE_NAME, sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge,
    path: '/',
  })
  response.cookies.delete(PENDING_COOKIE)
  return response
}

function redirectToLogin(request: NextRequest, _reason: string) {
  const url = new URL('/login', request.url)
  url.searchParams.set('error', '1')
  const response = NextResponse.redirect(url, { status: 303 })
  response.cookies.delete(PENDING_COOKIE)
  return response
}
