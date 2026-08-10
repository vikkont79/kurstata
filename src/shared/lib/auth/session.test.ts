import { describe, it, expect, vi } from 'vitest'
import jwt from 'jsonwebtoken'

vi.mock('@/shared/lib/env', () => ({
  env: { JWT_SECRET: 'a'.repeat(32) },
}))

import { signSessionToken, verifySessionToken } from './session'

const SECRET = 'a'.repeat(32)
const user = { userId: 'user-1', tokenVersion: 3 }

describe('session', () => {
  it('подписанный токен проходит проверку и возвращает payload', () => {
    const token = signSessionToken(user)
    expect(verifySessionToken(token)).toEqual(user)
  })

  it('легаси-токен без tokenVersion отклоняется', () => {
    const legacy = jwt.sign({ userId: 'user-1' }, SECRET)
    expect(verifySessionToken(legacy)).toBeNull()
  })

  it('мусорная строка отклоняется', () => {
    expect(verifySessionToken('not-a-token')).toBeNull()
  })

  it('истёкший токен отклоняется', () => {
    const expired = jwt.sign(user, SECRET, { expiresIn: -1 })
    expect(verifySessionToken(expired)).toBeNull()
  })

  it('токен, подписанный другим секретом, отклоняется', () => {
    const forged = jwt.sign(user, 'b'.repeat(32))
    expect(verifySessionToken(forged)).toBeNull()
  })
})
