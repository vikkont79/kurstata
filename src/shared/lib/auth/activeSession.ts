import 'server-only'
import { eq } from 'drizzle-orm'
import { db } from '@db/client'
import { users } from '@db/schema'
import { verifySessionToken } from './session'

/**
 * Полная проверка живости сессии: не только подпись и срок JWT,
 * но и существование пользователя + совпадение tokenVersion
 * (сессии, отозванные через logout/reset пароля, отсекаются здесь).
 *
 * Fail-open: при недоступности БД пропускаем запрос — данные всё равно
 * защищены проверками getCurrentUser в страницах и actions.
 */
const isActiveSession = async (token: string): Promise<boolean> => {
  const payload = verifySessionToken(token)
  if (!payload) return false

  try {
    const [user] = await db
      .select({ tokenVersion: users.tokenVersion })
      .from(users)
      .where(eq(users.id, payload.userId))

    return !!user && user.tokenVersion === payload.tokenVersion
  } catch (err) {
    console.warn('[activeSession] БД недоступна — пропуск запроса (fail-open)', err)
    return true
  }
}

export { isActiveSession }
