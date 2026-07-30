import { db } from '@db/client'
import { days, shifts } from '@db/schema'
import { eq } from 'drizzle-orm'

export async function getDayByDate(date: string) {
  const day = await db.select().from(days).where(eq(days.date, date)).limit(1).then(r => r[0])
  if (!day) return undefined

  const dayShifts = await db.select().from(shifts).where(eq(shifts.dayId, day.id))

  return {
    ...day,
    shifts: dayShifts,
  }
}
