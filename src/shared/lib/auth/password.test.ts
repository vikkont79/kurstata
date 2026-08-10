import { describe, it, expect } from 'vitest'
import { hashPassword, verifyPassword } from './password'

describe('password', () => {
  it('hashPassword и verifyPassword работают в паре', async () => {
    const hash = await hashPassword('supersecret')
    expect(await verifyPassword('supersecret', hash)).toBe(true)
  })

  it('неверный пароль не проходит', async () => {
    const hash = await hashPassword('supersecret')
    expect(await verifyPassword('wrong', hash)).toBe(false)
  })
})
