import { NextRequest, NextResponse } from 'next/server'
import { verifySessionToken, COOKIE_NAME } from '@/lib/auth'

const PUBLIC_PATHS = ['/login', '/api/auth/login', '/api/auth/logout']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow public paths and Next.js internals
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p)) || pathname.startsWith('/_next')) {
    return NextResponse.next()
  }

  const token = request.cookies.get(COOKIE_NAME)?.value
  const session = token ? await verifySessionToken(token) : null

  if (!session) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('from', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
