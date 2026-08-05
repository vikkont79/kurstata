import 'server-only'
import { cache } from 'react'
import { eq } from 'drizzle-orm'
import { db } from '@db/client'
import { users } from '@db/schema'
import { getSessionToken, verifySessionToken } from '@/shared/lib/auth'

export const getCurrentUser = cache(async () => {
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    return null
  }

  const token = await getSessionToken()
  if (!token) return null

  const payload = verifySessionToken(token)
  if (!payload) return null

  try {
    const [user] = await db
      .select({ id: users.id, name: users.name, email: users.email, createdAt: users.createdAt })
      .from(users)
      .where(eq(users.id, payload.userId))

    return user ?? null
  } catch (error) {
    console.error('getCurrentUser: ошибка загрузки пользователя', error)
    throw new Error('Ошибка загрузки авторизованного пользователя')
  }
})
