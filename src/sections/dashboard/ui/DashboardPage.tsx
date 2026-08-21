import { getDashboardData } from '@/sections/dashboard/api/getDashboardData'
import { getCurrentUser } from '@/shared/api/getCurrentUser'
import Link from 'next/link'
import { Header } from '@/widgets/header'
import { WeekList } from '@/widgets/week-list'
import { ErrorState } from '@/shared/ui'
import { DASHBOARD_PERIODS, type DashboardPeriod } from '@/sections/dashboard/lib/period'
import type { User } from '@/entities/user'
import type { WeekSummary } from '@/widgets/week-list'

const PERIOD_LABELS: Record<DashboardPeriod, string> = {
  week: 'Неделя',
  month: 'Месяц',
  all: 'Всё время',
}

const DashboardPage = async ({ period = 'month' }: { period?: DashboardPeriod }) => {
  let user: User | null = null
  let sessionError = false
  try {
    user = await getCurrentUser()
  } catch {
    sessionError = true
  }

  let weeks: WeekSummary[] = []
  let dashboardError = false
  if (user) {
    try {
      weeks = await getDashboardData(user.id, period)
    } catch {
      dashboardError = true
    }
  }

  return (
    <>
      <Header
        title="Дашборд"
        link={{ href: '/add', label: '+ Добавить день' }}
        className="w-full max-w-4xl mx-auto px-4 pt-10"
        user={user}
        sessionError={sessionError}
      />
      <main className="flex flex-1 flex-col w-full max-w-4xl mx-auto px-4 pt-6 pb-10 gap-6">
        <nav className="flex gap-2">
          {DASHBOARD_PERIODS.map(p => (
            <Link
              key={p}
              href={p === 'month' ? '/dashboard' : `/dashboard?period=${p}`}
              className={`rounded-lg border px-3 py-1.5 text-sm transition-colors ${
                p === period
                  ? 'border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900'
                  : 'border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800'
              }`}
            >
              {PERIOD_LABELS[p]}
            </Link>
          ))}
        </nav>
        {dashboardError ? (
          <ErrorState message="Не удалось загрузить данные. Попробуйте позже" />
        ) : (
          <WeekList weeks={weeks} />
        )}
      </main>
    </>
  )
}

export { DashboardPage }
