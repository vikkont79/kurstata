import 'server-only'
import { cache } from 'react'
import { eq } from 'drizzle-orm'
import { db } from '@db/client'
import { users } from '@db/schema'
import { getSessionToken, verifySessionToken } from '@/shared/lib/auth'

export const getCurrentUser = cache(async () => {
  const token = await getSessionToken()
  if (!token) return null

  const payload = verifySessionToken(token)
  if (!payload) return null

  try {
    const [user] = await db
      .select({ id: users.id, name: users.name, email: users.email, tokenVersion: users.tokenVersion })
      .from(users)
      .where(eq(users.id, payload.userId))

    if (!user) return null

    if (user.tokenVersion !== payload.tokenVersion) {
      return null
    }

    return { id: user.id, name: user.name, email: user.email }
  } catch (error) {
    console.error('getCurrentUser: ошибка загрузки пользователя', error)
    throw new Error('Ошибка загрузки авторизованного пользователя')
  }
})
