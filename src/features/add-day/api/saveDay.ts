'use server'

import { revalidatePath } from 'next/cache'
import { db } from '@db/client'
import { days, shifts } from '@db/schema'
import { eq, sql } from 'drizzle-orm'
import { formSchema } from '@/features/add-day/types'

export async function saveDay(input: unknown): Promise<{ success: true } | { success: false; error: string }> {
  try {
    const parsed = formSchema.safeParse(input)
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message ?? 'Ошибка валидации' }
    }

    const { date, dayTotal, shifts: shiftsData } = parsed.data

    await db.transaction(async (tx) => {
      const [{ id: dayId }] = await tx.insert(days)
        .values({ date, dayTotal })
        .onConflictDoUpdate({
          target: days.date,
          set: { dayTotal, updatedAt: sql`CURRENT_TIMESTAMP` },
        })
        .returning({ id: days.id })

      await tx.delete(shifts).where(eq(shifts.dayId, dayId))

      await tx.insert(shifts).values(
        shiftsData.map((shift) => ({
          id: crypto.randomUUID(),
          dayId,
          startTime: shift.startTime,
          endTime: shift.endTime,
          orders: shift.orders,
        })),
      )
    })

    revalidatePath('/')

    return { success: true }
  } catch (err) {
    console.error('saveDay: ошибка сохранения дня', err)
    if (err instanceof Error) {
      return { success: false, error: err.message }
    }
    return { success: false, error: 'Неизвестная ошибка' }
  }
}
