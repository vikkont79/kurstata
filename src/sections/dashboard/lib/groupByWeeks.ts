import type { WeekSummary, DaySummary } from '@/sections/dashboard/types'

const DAY_NAMES = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб']
const MONTH_GENITIVE = [
  'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
  'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря',
]

function getWeekStart(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00')
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  d.setDate(diff)
  return d.toISOString().split('T')[0]
}

function formatDayLabel(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00')
  return `${DAY_NAMES[d.getDay()]} ${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}`
}

function formatWeekLabel(weekStart: string): string {
  const d = new Date(weekStart + 'T00:00:00')
  return `Неделя с ${d.getDate()} ${MONTH_GENITIVE[d.getMonth()]} ${d.getFullYear()}`
}

function round1(v: number): number {
  return Math.round(v * 10) / 10
}

function round2(v: number): number {
  return Math.round(v * 100) / 100
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

    const days: DaySummary[] = weekRows.map(r => {
      const hours = round1(r.hours)
      const orders = r.orders
      return {
        date: r.date,
        label: formatDayLabel(r.date),
        hours,
        orders,
        ordersPerHour: hours > 0 ? round1(orders / hours) : 0,
        total: round2(r.total),
        totalPerOrder: orders > 0 ? round2(r.total / orders) : 0,
      }
    })

    result.push({
      weekStart,
      label: formatWeekLabel(weekStart),
      days,
      hours: round1(weekTotalHours),
      orders: weekTotalOrders,
      ordersPerHour: weekTotalHours > 0 ? round1(weekTotalOrders / weekTotalHours) : 0,
      total: round2(weekTotalSum),
      totalPerOrder: weekTotalOrders > 0 ? round2(weekTotalSum / weekTotalOrders) : 0,
    })
  }

  result.sort((a, b) => b.weekStart.localeCompare(a.weekStart))

  return result
}
