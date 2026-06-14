import { NextRequest, NextResponse } from 'next/server'
import {
  verifyPendingToken, createSessionToken,
  PENDING_COOKIE, COOKIE_NAME,
  SESSION_DURATION_MS, SESSION_DURATION_REMEMBER_MS,
} from '@/lib/auth'
import { getTotpSecret, markTotpVerified } from '@/lib/db'
import { verifyCode } from '@/lib/totp'

export async function POST(request: NextRequest) {
  const body = await request.formData()
  const code = ((body.get('code') as string | null) ?? '').replace(/\s/g, '')

  const pendingToken = request.cookies.get(PENDING_COOKIE)?.value
  if (!pendingToken) return redirectToLogin(request)

  const pending = await verifyPendingToken(pendingToken)
  if (!pending) return redirectToLogin(request)

  const totpRow = await getTotpSecret(pending.username)
  if (!totpRow || totpRow.verified) {
    // Already verified or no pending secret — start over
    return redirectToLogin(request)
  }

  if (!verifyCode(code, totpRow.secret)) {
    const url = new URL('/setup-2fa', request.url)
    url.searchParams.set('error', '1')
    return NextResponse.redirect(url, { status: 303 })
  }

  await markTotpVerified(pending.username)

  const sessionToken = await createSessionToken(pending.username, pending.remember)
  const maxAge = Math.floor((pending.remember ? SESSION_DURATION_REMEMBER_MS : SESSION_DURATION_MS) / 1000)

  const response = NextResponse.redirect(new URL(pending.from, request.url), { status: 303 })
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

function redirectToLogin(request: NextRequest) {
  const url = new URL('/login', request.url)
  url.searchParams.set('error', '1')
  const response = NextResponse.redirect(url, { status: 303 })
  response.cookies.delete(PENDING_COOKIE)
  return response
}
