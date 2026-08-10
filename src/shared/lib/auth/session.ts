import jwt from 'jsonwebtoken'
import { env } from '@/shared/lib/env'

const TOKEN_EXPIRES_IN = '7d'

export const AUTH_COOKIE_NAME = 'token'

export type SessionPayload = {
  userId: string
  tokenVersion: number
}

export function signSessionToken(payload: SessionPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: TOKEN_EXPIRES_IN })
}

export function verifySessionToken(token: string): SessionPayload | null {
  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as Partial<SessionPayload>
    if (typeof payload.userId !== 'string' || typeof payload.tokenVersion !== 'number') {
      return null
    }
    return { userId: payload.userId, tokenVersion: payload.tokenVersion }
  } catch {
    return null
  }
}
