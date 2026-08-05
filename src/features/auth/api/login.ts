'use server'

import { eq } from 'drizzle-orm'
import { db } from '@db/client'
import { users } from '@db/schema'
import { loginSchema } from '@/features/auth/types'
import { verifyPassword, signSessionToken, setSessionCookie } from '@/shared/lib/auth'
import type { User } from '@/entities/user'

export async function login(input: unknown): Promise<{ success: true; user: User } | { success: false; error: string }> {
  try {
    const parsed = loginSchema.safeParse(input)
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message ?? 'Ошибка валидации' }
    }

    const { email, password } = parsed.data

    const [found] = await db
      .select({ id: users.id, name: users.name, email: users.email, passwordHash: users.passwordHash })
      .from(users)
      .where(eq(users.email, email))

    if (!found) {
      return { success: false, error: 'Неверный email или пароль' }
    }

    const isValid = await verifyPassword(password, found.passwordHash)
    if (!isValid) {
      return { success: false, error: 'Неверный email или пароль' }
    }

    const token = signSessionToken({ userId: found.id, email: found.email })
    await setSessionCookie(token)

    return { success: true, user: { id: found.id, name: found.name, email: found.email } }
  } catch (err) {
    console.error('login: ошибка входа', err)
    if (err instanceof Error) {
      return { success: false, error: err.message }
    }
    return { success: false, error: 'Неизвестная ошибка' }
  }
}
