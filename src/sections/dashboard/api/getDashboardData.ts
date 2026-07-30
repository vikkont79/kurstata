import { db } from '@db/client'
import { days, shifts } from '@db/schema'
import { groupIntoWeeks } from '@/sections/dashboard/lib/groupByWeeks'

function calcHours(start: string, end: string): number {
  const [h1, m1] = start.split(':').map(Number)
  const [h2, m2] = end.split(':').map(Number)
  return (h2 * 60 + m2 - h1 * 60 - m1) / 60
}

export async function getDashboardData() {
  const allDays = await db.select().from(days).orderBy(days.date)
  const allShifts = await db.select().from(shifts)

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
