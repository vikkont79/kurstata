import { getDashboardData } from '@/sections/dashboard/api/getDashboardData'
import { getCurrentUser } from '@/shared/api/getCurrentUser'
import { Header } from '@/widgets/header'
import { WeekList } from '@/widgets/week-list'
import { ErrorState } from '@/shared/ui'
import type { User } from '@/entities/user'
import type { WeekSummary } from '@/widgets/week-list'

const DashboardPage = async () => {
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
      weeks = await getDashboardData(user.id)
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
