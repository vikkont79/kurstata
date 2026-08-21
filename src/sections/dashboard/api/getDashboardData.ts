import { db } from '@db/client'
import { days, shifts } from '@db/schema'
import { and, eq, gte, inArray } from 'drizzle-orm'
import { groupIntoWeeks } from '@/sections/dashboard/lib/groupByWeeks'
import { calcHours } from '@/sections/dashboard/lib/calcHours'
import { getPeriodStart, type DashboardPeriod } from '@/sections/dashboard/lib/period'

export async function getDashboardData(userId: string, period: DashboardPeriod = 'month') {
  const periodStart = getPeriodStart(period)

  const allDays = await db
    .select()
    .from(days)
    .where(
      periodStart
        ? and(eq(days.userId, userId), gte(days.date, periodStart))
        : eq(days.userId, userId),
    )
    .orderBy(days.date)
  const allShifts = allDays.length
    ? await db.select().from(shifts).where(inArray(shifts.dayId, allDays.map(day => day.id)))
    : []

  const shiftsByDayId = new Map<string, typeof allShifts>()
  for (const s of allShifts) {
    const list = shiftsByDayId.get(s.dayId)
    if (list) list.push(s)
    else shiftsByDayId.set(s.dayId, [s])
  }

  const dayRows: Array<{ date: string; hours: number; orders: number; total: number }> = allDays.map(day => {
    const dayShifts = shiftsByDayId.get(day.id) ?? []
    const hours = dayShifts.reduce((sum, s) => sum + calcHours(s.startTime, s.endTime), 0)
    const orders = dayShifts.reduce((sum, s) => sum + s.orders, 0)
    return { date: day.date, hours, orders, total: day.dayTotal ?? 0 }
  })

  return groupIntoWeeks(dayRows)
}
