import { randomBytes, createHash } from 'node:crypto'

const generateResetToken = (): string => {
  return randomBytes(32).toString('hex')
}

const hashResetToken = (token: string): string => {
  return createHash('sha256').update(token).digest('hex')
}

const isResetTokenExpired = (expiresAt: string, now = Date.now()): boolean => {
  return new Date(expiresAt).getTime() <= now
}

export { generateResetToken, hashResetToken, isResetTokenExpired }
