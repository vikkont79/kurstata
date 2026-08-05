import { getDashboardData } from '@/sections/dashboard/api/getDashboardData'
import { getCurrentUser } from '@/shared/api/getCurrentUser'
import { Header } from '@/widgets/header'
import { WeekList } from '@/sections/dashboard/ui/WeekList'

const DashboardPage = async ({ openAuthOnMount }: { openAuthOnMount?: boolean }) => {
  const user = await getCurrentUser()
  const weeks = user ? await getDashboardData(user.id) : []

  return (
    <>
      <Header
        title="Дашборд"
        link={{ href: '/add', label: '+ Добавить день' }}
        className="w-full max-w-4xl mx-auto px-4 pt-10"
        user={user}
        openAuthOnMount={openAuthOnMount}
      />
      <main className="flex flex-1 flex-col w-full max-w-4xl mx-auto px-4 pt-6 pb-10 gap-6">
        <WeekList weeks={weeks} />
      </main>
    </>
  )
}

export { DashboardPage }
