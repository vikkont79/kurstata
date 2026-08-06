'use server'

import { eq } from 'drizzle-orm'
import { db } from '@db/client'
import { users } from '@db/schema'
import { registerSchema } from '@/features/auth/types'
import { hashPassword, signSessionToken, setSessionCookie } from '@/shared/lib/auth'
import type { User } from '@/entities/user'

export async function register(input: unknown): Promise<{ success: true; user: User } | { success: false; error: string }> {
  try {
    const parsed = registerSchema.safeParse(input)
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message ?? 'Ошибка валидации' }
    }

    const { name, email, password } = parsed.data

    const [existing] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, email))
    if (existing) {
      return { success: false, error: 'Пользователь с таким email уже существует' }
    }

    const passwordHash = await hashPassword(password)

    const [created] = await db
      .insert(users)
      .values({ name, email, passwordHash })
      .returning({ id: users.id, name: users.name, email: users.email })

    const token = signSessionToken({ userId: created.id, email: created.email })
    await setSessionCookie(token)

    return { success: true, user: created }
  } catch (err) {
    console.error('register: ошибка регистрации', err)
    if (err instanceof Error) {
      return { success: false, error: err.message }
    }
    return { success: false, error: 'Неизвестная ошибка' }
  }
}
