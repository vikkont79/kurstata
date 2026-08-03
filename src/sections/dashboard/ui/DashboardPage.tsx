import { getDashboardData } from '@/sections/dashboard/api/getDashboardData'
import { Header } from '@/widgets/header'
import { WeekList } from '@/sections/dashboard/ui/WeekList'

const DashboardPage = async () => {
  const weeks = await getDashboardData()

  return (
    <>
      <Header
        title="Дашборд"
        link={{ href: '/add', label: '+ Добавить день' }}
        className="w-full max-w-4xl mx-auto px-4 pt-10"
      />
      <main className="flex flex-1 flex-col w-full max-w-4xl mx-auto px-4 pt-6 pb-10 gap-6">
        <WeekList weeks={weeks} />
      </main>
    </>
  )
}

export { DashboardPage }
