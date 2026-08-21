'use server'

import { revalidatePath } from 'next/cache'
import { and, eq } from 'drizzle-orm'
import { db } from '@db/client'
import { days, shifts } from '@db/schema'
import { dayDateSchema } from '@/features/add-day/types'
import { getCurrentUser } from '@/shared/api/getCurrentUser'

export async function deleteDay(date: string): Promise<{ success: true } | { success: false; error: string }> {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { success: false, error: 'Необходимо авторизоваться' }
    }

    const parsed = dayDateSchema.safeParse(date)
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message ?? 'Ошибка валидации' }
    }

    await db.transaction(async (tx) => {
      const [day] = await tx
        .select({ id: days.id })
        .from(days)
        .where(and(eq(days.userId, user.id), eq(days.date, parsed.data)))

      if (!day) return

      await tx.delete(shifts).where(eq(shifts.dayId, day.id))
      await tx.delete(days).where(eq(days.id, day.id))
    })

    revalidatePath('/dashboard')

    return { success: true }
  } catch (err) {
    console.error('deleteDay: ошибка удаления дня', err)
    return { success: false, error: 'Не удалось удалить день. Попробуйте позже' }
  }
}
