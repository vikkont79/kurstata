'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { WeekSummary } from '@/sections/dashboard/types'

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
    <div className="flex flex-col gap-4">
      {weeks.map(week => (
        <div
          key={week.weekStart}
          className="rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 overflow-hidden"
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

          <div className="px-4 pb-3">
            <div className="flex gap-4 text-sm">
              <MetricCell label="Часы" value={formatHours(week.hours)} />
              <MetricCell label="Заказы" value={String(week.orders)} />
              <MetricCell label="З/ч" value={week.ordersPerHour.toFixed(1)} />
              <MetricCell label="Сумма" value={formatSum(week.total)} />
              <MetricCell label="Сумма/з" value={formatPerOrder(week.totalPerOrder)} />
            </div>
          </div>

          {expandedWeeks.has(week.weekStart) && (
            <div className="border-t border-zinc-100 dark:border-zinc-800">
              {week.days.map(day => (
                <button
                  key={day.date}
                  onClick={() => router.push(`/add?date=${day.date}`)}
                  className="w-full flex items-center gap-4 px-4 py-2.5 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors border-b border-zinc-50 dark:border-zinc-800 last:border-b-0"
                >
                  <span className="w-24 text-left text-zinc-600 dark:text-zinc-400 font-medium shrink-0">
                    {day.label}
                  </span>
                  <span className="flex gap-4 flex-1">
                    <span className="flex-1 text-zinc-800 dark:text-zinc-200">{formatHours(day.hours)}</span>
                    <span className="flex-1 text-zinc-800 dark:text-zinc-200">{day.orders}</span>
                    <span className="flex-1 text-zinc-800 dark:text-zinc-200">{day.ordersPerHour.toFixed(1)}</span>
                    <span className="flex-1 text-zinc-800 dark:text-zinc-200">{formatSum(day.total)}</span>
                    <span className="flex-1 text-zinc-800 dark:text-zinc-200">{formatPerOrder(day.totalPerOrder)}</span>
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      ))}

      {weeks.length === 0 && (
        <p className="text-center text-zinc-500 py-10">Нет данных</p>
      )}
    </div>
  )
}

const MetricCell = ({ label, value }: { label: string; value: string }) => (
  <div className="flex-1 flex flex-col">
    <span className="text-xs text-zinc-400">{label}</span>
    <span className="font-medium text-zinc-800 dark:text-zinc-200">{value}</span>
  </div>
)

const formatHours = (v: number): string => {
  const rounded = Math.round(v * 10) / 10
  return Number.isInteger(rounded) ? `${rounded} ч` : `${rounded.toFixed(1)} ч`
}

const formatSum = (v: number): string => {
  return `${Math.round(v).toLocaleString('ru-RU')} ₽`
}

const formatPerOrder = (v: number): string => {
  return `${v.toFixed(1)} ₽`
}

export { WeekList }
