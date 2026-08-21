import { groupIntoWeeks } from '@/sections/dashboard/lib/groupByWeeks'
import type { WeekSummary } from '@/widgets/week-list'

/**
 * Детерминированные демо-данные: одна и та же дата всегда даёт одинаковый набор,
 * чтобы SSR и клиент были согласованы и демо выглядело правдоподобно.
 */

const MOCK_WEEKS_COUNT = 4

const AVG_CHECK_RUB = 270

/** Ритм недели курьера: часы и средняя интенсивность заказов по дням (null — выходной). */
const WEEKDAY_PATTERN: Record<number, { hours: number; ordersPerHour: number } | null> = {
  0: null,
  1: { hours: 9, ordersPerHour: 1.4 },
  2: { hours: 8, ordersPerHour: 1.2 },
  3: null,
  4: { hours: 10, ordersPerHour: 1.5 },
  5: { hours: 9.5, ordersPerHour: 1.3 },
  6: { hours: 7, ordersPerHour: 1.8 },
}

const toIsoDate = (d: Date): string => {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${dd}`
}

const getMonday = (d: Date): Date => {
  const copy = new Date(d)
  copy.setHours(0, 0, 0, 0)
  const day = copy.getDay()
  copy.setDate(copy.getDate() - (day === 0 ? 6 : day - 1))
  return copy
}

/** Небольшая детерминированная вариация, чтобы недели не выглядели клонами. */
const weekFactor = (weekOffset: number, weekday: number): number => {
  return 1 + (((weekOffset * 5 + weekday * 3) % 7) - 3) * 0.04
}

const buildMockRows = (now: Date): Array<{ date: string; hours: number; orders: number; total: number }> => {
  const rows: Array<{ date: string; hours: number; orders: number; total: number }> = []
  const monday = getMonday(now)

  for (let weekOffset = MOCK_WEEKS_COUNT - 1; weekOffset >= 0; weekOffset--) {
    for (let weekday = 1; weekday <= 7; weekday++) {
      const d = new Date(monday)
      d.setDate(monday.getDate() - weekOffset * 7 + (weekday - 1))
      if (d > now) continue

      const shift = WEEKDAY_PATTERN[d.getDay()]
      if (!shift) continue

      const factor = weekFactor(weekOffset, weekday)
      const hours = Math.round(shift.hours * factor * 2) / 2
      const orders = Math.round(shift.hours * factor * shift.ordersPerHour)
      const total = Math.round(orders * AVG_CHECK_RUB * factor)

      rows.push({ date: toIsoDate(d), hours, orders, total })
    }
  }

  return rows
}

const getMockWeeks = (now: Date = new Date()): WeekSummary[] => {
  return groupIntoWeeks(buildMockRows(now))
}

export { getMockWeeks }
