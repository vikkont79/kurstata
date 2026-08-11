import { randomBytes, createHash } from 'node:crypto'

const RESET_TOKEN_TTL_MS = 30 * 60 * 1000

const generateResetToken = (): string => {
  return randomBytes(32).toString('hex')
}

const hashResetToken = (token: string): string => {
  return createHash('sha256').update(token).digest('hex')
}

const isResetTokenExpired = (expiresAt: string, now = Date.now()): boolean => {
  return new Date(expiresAt).getTime() <= now
}

export { RESET_TOKEN_TTL_MS, generateResetToken, hashResetToken, isResetTokenExpired }
