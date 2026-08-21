import { getWeekStart } from '@/sections/dashboard/lib/groupByWeeks'

export type DashboardPeriod = 'week' | 'month' | 'all'

const DASHBOARD_PERIODS: readonly DashboardPeriod[] = ['week', 'month', 'all'] as const

/** Безопасный разбор значения из searchParams: неизвестное/пустое → 'month'. */
const parsePeriod = (value: string | undefined): DashboardPeriod => {
  return value === 'week' || value === 'month' || value === 'all' ? value : 'month'
}

/**
 * Дата, с которой начинается период (включительно), в формате ISO.
 * 'all' → null (без нижней границы).
 */
const getPeriodStart = (period: DashboardPeriod, now: Date = new Date()): string | null => {
  switch (period) {
    case 'week':
      return getWeekStart(toIsoDate(now))
    case 'month': {
      const y = now.getFullYear()
      const m = String(now.getMonth() + 1).padStart(2, '0')
      return `${y}-${m}-01`
    }
    case 'all':
      return null
  }
}

const toIsoDate = (d: Date): string => {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${dd}`
}

export { DASHBOARD_PERIODS, parsePeriod, getPeriodStart }
