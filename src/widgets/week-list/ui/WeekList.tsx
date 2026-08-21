'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { MetricCell } from '@/shared/ui'
import { formatHours, formatRate, formatSum } from '@/widgets/week-list/lib/format'
import type { WeekSummary } from '@/widgets/week-list/types'

type WeekListProps = {
  weeks: WeekSummary[]
}

const WeekList = ({ weeks }: WeekListProps) => {
  const [expandedWeeks, setExpandedWeeks] = useState<Set<string>>(new Set())
  const router = useRouter()

  const toggleWeek = (weekStart: string) => {
    setExpandedWeeks(prev => {
      const next = new Set(prev)
      if (next.has(weekStart)) next.delete(weekStart)
      else next.add(weekStart)
      return next
    })
  }

  return (
    <>
      <ul className="flex flex-col gap-4">
        {weeks.map(week => (
          <li
            key={week.weekStart}
            className="px-4 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 overflow-hidden"
          >
            <button
              onClick={() => toggleWeek(week.weekStart)}
              className="w-full flex items-center justify-between p-4 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
            >
              <span className="font-semibold text-zinc-900 dark:text-zinc-100">{week.label}</span>
              <span className="text-zinc-400 select-none text-lg">
                {expandedWeeks.has(week.weekStart) ? '▾' : '▸'}
              </span>
            </button>

            <div className="py-3 grid grid-cols-3 gap-x-4 gap-y-2 text-sm">
              <MetricCell label="Часы" value={formatHours(week.hours)} />
              <MetricCell label="Заказы" value={String(week.orders)} />
              <MetricCell label="Заказы/час" value={formatRate(week.ordersPerHour)} />
              <MetricCell label="Сумма/час" value={formatSum(week.totalPerHour)} />
              <MetricCell label="Сумма/зак" value={formatSum(week.totalPerOrder)} />
              <MetricCell label="Сумма" value={formatSum(week.total)} />
            </div>

            {expandedWeeks.has(week.weekStart) && (
              <ul className="py-4 border-t border-zinc-100 dark:border-zinc-800">
                {week.days.map(day => (
                  <li
                    key={day.date}
                    className="border-b border-zinc-50 dark:border-zinc-800 last:border-b-0"
                  >
                    <button
                      onClick={() => router.push(`/add?date=${day.date}`)}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                    >
                      <span className="w-24 text-left text-zinc-600 dark:text-zinc-400 font-medium shrink-0">
                        {day.label}
                      </span>
                      <span className="flex gap-2 flex-1">
                        <span className="flex-1 text-zinc-800 dark:text-zinc-200">{formatHours(day.hours)}</span>
                        <span className="flex-1 text-zinc-800 dark:text-zinc-200">{day.orders}</span>
                        <span className="flex-1 text-zinc-800 dark:text-zinc-200">{formatSum(day.total)}</span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>

      {weeks.length === 0 && (
        <p className="text-center text-zinc-500 py-10">Нет данных</p>
      )}
    </>
  )
}

export { WeekList }
