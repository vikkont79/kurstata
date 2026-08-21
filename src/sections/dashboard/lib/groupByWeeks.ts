import type { WeekSummary, DaySummary } from '@/widgets/week-list'
import { formatDayLabel, formatWeekRange, round1 } from '@/sections/dashboard/lib/format'

export function getWeekStart(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00')
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  d.setDate(diff)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${dd}`
}

export function groupIntoWeeks(
  rows: Array<{ date: string; hours: number; orders: number; total: number }>
): WeekSummary[] {
  const weeksMap = new Map<string, typeof rows>()

  for (const row of rows) {
    const weekStart = getWeekStart(row.date)
    const list = weeksMap.get(weekStart)
    if (list) list.push(row)
    else weeksMap.set(weekStart, [row])
  }

  const result: WeekSummary[] = []

  for (const [weekStart, weekRows] of weeksMap) {
    const weekTotalHours = weekRows.reduce((s, r) => s + r.hours, 0)
    const weekTotalOrders = weekRows.reduce((s, r) => s + r.orders, 0)
    const weekTotalSum = weekRows.reduce((s, r) => s + r.total, 0)

    const days: DaySummary[] = weekRows.map(r => ({
      date: r.date,
      label: formatDayLabel(r.date),
      hours: round1(r.hours),
      orders: r.orders,
      total: r.total,
    }))

    result.push({
      weekStart,
      label: formatWeekRange(weekStart),
      days,
      hours: round1(weekTotalHours),
      orders: weekTotalOrders,
      ordersPerHour: weekTotalHours > 0 ? round1(weekTotalOrders / weekTotalHours) : 0,
      totalPerHour: weekTotalHours > 0 ? weekTotalSum / weekTotalHours : 0,
      total: weekTotalSum,
      totalPerOrder: weekTotalOrders > 0 ? weekTotalSum / weekTotalOrders : 0,
    })
  }

  result.sort((a, b) => b.weekStart.localeCompare(a.weekStart))

  return result
}
