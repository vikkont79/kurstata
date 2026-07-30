import { getDashboardData } from '@/sections/dashboard/api/getDashboardData'
import { DashboardHeader } from '@/widgets/dashboard-header'
import { WeekList } from '@/sections/dashboard/ui/WeekList'

const DashboardPage = async () => {
  const weeks = await getDashboardData()

  return (
    <div className="flex flex-1 flex-col py-10 px-4 max-w-4xl mx-auto w-full gap-6">
      <DashboardHeader title="Дашборд" showAddButton />
      <WeekList weeks={weeks} />
    </div>
  )
}

export { DashboardPage }
