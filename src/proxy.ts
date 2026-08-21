import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifySessionToken } from '@/shared/lib/auth'
// Напрямую по пути файла, не через баррель — баррель тащит серверные модули в клиентскую сборку
import { AUTH_COOKIE_NAME } from '@/shared/lib/auth/constants'

export function proxy(request: NextRequest) {
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value
  if (!token || !verifySessionToken(token)) {
    const url = new URL(request.url)
    url.pathname = '/'
    url.searchParams.set('auth', 'open')
    url.searchParams.set('from', request.nextUrl.pathname + request.nextUrl.search)
    return NextResponse.redirect(url)
  }
  return NextResponse.next()
}

export const config = {
  matcher: '/add/:path*',
}
