'use server'

import { db } from '@db/client'
import { days, shifts } from '@db/schema'
import { formSchema } from '@/features/add-day/types'

export async function saveDay(formData: FormData): Promise<{ success: true } | { success: false; error: string }> {
  try {
    const raw = {
      date: formData.get('date') as string,
      dayTotal: formData.get('dayTotal') as string,
      shifts: JSON.parse(formData.get('shifts') as string),
    }

    const parsed = formSchema.safeParse(raw)
    if (!parsed.success) {
      const firstError = parsed.error.issues[0]
      return { success: false, error: firstError?.message ?? 'Ошибка валидации' }
    }

    const { date, dayTotal, shifts: shiftsData } = parsed.data
    const dayId = crypto.randomUUID()

    await db.insert(days).values({
      id: dayId,
      date,
      dayTotal,
    })

    for (const shift of shiftsData) {
      await db.insert(shifts).values({
        id: crypto.randomUUID(),
        dayId,
        startTime: shift.startTime,
        endTime: shift.endTime,
        orders: shift.orders,
      })
    }

    return { success: true }
  } catch (err) {
    if (err instanceof Error) {
      if (err.message?.includes('UNIQUE')) {
        return { success: false, error: 'Дата уже существует' }
      }
      return { success: false, error: err.message }
    }
    return { success: false, error: 'Неизвестная ошибка' }
  }
}
