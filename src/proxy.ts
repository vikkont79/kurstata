import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifySessionToken, AUTH_COOKIE_NAME } from '@/shared/lib/auth/session'

export function proxy(request: NextRequest) {
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value
  if (!token || !verifySessionToken(token)) {
    const url = new URL(request.url)
    url.pathname = '/'
    url.searchParams.set('auth', 'open')
    return NextResponse.redirect(url)
  }
  return NextResponse.next()
}

export const config = {
  matcher: '/add/:path*',
}
