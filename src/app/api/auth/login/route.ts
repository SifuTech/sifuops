import { NextRequest, NextResponse } from 'next/server'
import { checkCredentials, createSessionToken, COOKIE_NAME } from '@/lib/auth'

export async function POST(request: NextRequest) {
  const body = await request.formData()
  const username = (body.get('username') as string | null)?.trim() ?? ''
  const password = (body.get('password') as string | null) ?? ''
  const from = (body.get('from') as string | null) ?? '/'

  if (!checkCredentials(username, password)) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('error', '1')
    loginUrl.searchParams.set('from', from)
    return NextResponse.redirect(loginUrl, { status: 303 })
  }

  const token = await createSessionToken(username)
  const response = NextResponse.redirect(new URL(from, request.url), { status: 303 })

  response.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60,
    path: '/',
  })

  return response
}
