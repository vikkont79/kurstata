import { getDayByDate } from '@/entities/day/api/getDayByDate'
import { DashboardHeader } from '@/widgets/dashboard-header'
import { AddDayForm } from '@/features/add-day'

const AddPage = async ({ date }: { date?: string }) => {
  const initialData = date ? await getDayByDate(date) : undefined

  return (
    <div className="flex flex-1 flex-col items-center py-10 px-4">
      <DashboardHeader title={date ? 'Редактировать день' : 'Добавить день'} />
      <AddDayForm initialData={initialData} />
    </div>
  )
}

export { AddPage }
