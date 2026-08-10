'use server'

import { eq, sql } from 'drizzle-orm'
import { db } from '@db/client'
import { users } from '@db/schema'
import { getCurrentUser } from '@/shared/api/getCurrentUser'
import { clearSessionCookie } from '@/shared/lib/auth'

export async function logout(): Promise<{ success: boolean }> {
  const user = await getCurrentUser()
  if (user) {
    try {
      await db
        .update(users)
        .set({ tokenVersion: sql`${users.tokenVersion} + 1` })
        .where(eq(users.id, user.id))
    } catch (err) {
      console.error('logout: ошибка отзыва сессий', err)
      return { success: false }
    }
  }

  try {
    await clearSessionCookie()
  } catch (err) {
    console.error('logout: ошибка очистки cookie', err)
  }

  return { success: true }
}
