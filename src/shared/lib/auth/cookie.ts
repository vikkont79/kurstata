import { cookies } from 'next/headers'
import { AUTH_COOKIE_NAME, COOKIE_MAX_AGE } from './constants'

export async function setSessionCookie(token: string) {
  const store = await cookies()
  store.set(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: COOKIE_MAX_AGE,
  })
}

export async function clearSessionCookie() {
  const store = await cookies()
  store.delete(AUTH_COOKIE_NAME)
}

export async function getSessionToken(): Promise<string | null> {
  const store = await cookies()
  return store.get(AUTH_COOKIE_NAME)?.value ?? null
}
