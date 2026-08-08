import jwt from 'jsonwebtoken'
import { env } from '@/shared/lib/env'

const TOKEN_EXPIRES_IN = '7d'

export const AUTH_COOKIE_NAME = 'token'

export type SessionPayload = {
  userId: string
}

export function signSessionToken(payload: SessionPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: TOKEN_EXPIRES_IN })
}

export function verifySessionToken(token: string): SessionPayload | null {
  try {
    return jwt.verify(token, env.JWT_SECRET) as SessionPayload
  } catch {
    return null
  }
}
