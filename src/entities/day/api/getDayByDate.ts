import { db } from '@db/client'
import { days, shifts } from '@db/schema'
import { and, eq } from 'drizzle-orm'

export async function getDayByDate(userId: string, date: string) {
  const day = await db
    .select()
    .from(days)
    .where(and(eq(days.userId, userId), eq(days.date, date)))
    .limit(1)
    .then(r => r[0])
  if (!day) return undefined

  const dayShifts = await db.select().from(shifts).where(eq(shifts.dayId, day.id))

  return {
    ...day,
    shifts: dayShifts,
  }
}
