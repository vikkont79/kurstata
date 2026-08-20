import { randomInt } from 'node:crypto'
import { redis } from '@/shared/lib/redis'
import { CONFIRM_CODE_LENGTH, PENDING_REGISTER_TTL_MS, RESEND_COOLDOWN_MS } from '@/shared/lib/auth'

export type PendingRegistration = {
  name: string
  email: string
  passwordHash: string
  code: string
}

const keyFor = (email: string): string => `kurstata:pending:${email.toLowerCase()}`

const generateConfirmationCode = (length = CONFIRM_CODE_LENGTH): string => {
  return String(randomInt(0, 10 ** length)).padStart(length, '0')
}

const savePendingRegistration = async (data: PendingRegistration): Promise<void> => {
  await redis.set(keyFor(data.email), data, {
    ex: Math.round(PENDING_REGISTER_TTL_MS / 1000),
  })
}

const getPendingRegistration = async (email: string): Promise<PendingRegistration | null> => {
  return await redis.get<PendingRegistration>(keyFor(email))
}

const deletePendingRegistration = async (email: string): Promise<void> => {
  await redis.del(keyFor(email))
}

const lastSentKeyFor = (email: string): string => `kurstata:pending:last-sent:${email.toLowerCase()}`

const getLastSentMs = async (email: string): Promise<number> => {
  const raw = await redis.get<number>(lastSentKeyFor(email))
  return raw ?? 0
}

const setLastSentMs = async (email: string): Promise<void> => {
  const ttlSeconds = Math.ceil(RESEND_COOLDOWN_MS / 1000)
  await redis.set(lastSentKeyFor(email), Date.now(), { ex: ttlSeconds })
}

const getResendCooldownRemainingMs = (lastSentMs: number, nowMs: number = Date.now()): number => {
  return Math.max(0, lastSentMs + RESEND_COOLDOWN_MS - nowMs)
}

export {
  generateConfirmationCode,
  savePendingRegistration,
  getPendingRegistration,
  deletePendingRegistration,
  getLastSentMs,
  setLastSentMs,
  getResendCooldownRemainingMs,
}