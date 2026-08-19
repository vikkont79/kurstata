import { randomInt } from 'node:crypto'
import { redis } from '@/shared/lib/redis'
import { CONFIRM_CODE_LENGTH, PENDING_REGISTER_TTL_MS } from '@/shared/lib/auth'

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
  await redis.set(keyFor(data.email), JSON.stringify(data), {
    ex: Math.round(PENDING_REGISTER_TTL_MS / 1000),
  })
}

const getPendingRegistration = async (email: string): Promise<PendingRegistration | null> => {
  const raw = await redis.get<string>(keyFor(email))
  if (!raw) return null
  try {
    return JSON.parse(raw) as PendingRegistration
  } catch {
    return null
  }
}

const deletePendingRegistration = async (email: string): Promise<void> => {
  await redis.del(keyFor(email))
}

export { generateConfirmationCode, savePendingRegistration, getPendingRegistration, deletePendingRegistration }