import { getDayByDate } from '@/entities/day/api/getDayByDate'
import { Header } from '@/widgets/header'
import { AddDayForm } from '@/features/add-day'

const AddPage = async ({ date }: { date?: string }) => {
  const initialData = date ? await getDayByDate(date) : undefined

  return (
    <>
      <Header
        title={date ? 'Редактировать день' : 'Добавить день'}
        link={{ href: '/', label: '← На главную' }}
        className="w-full max-w-4xl mx-auto px-4 pt-10"
      />
      <main className="flex flex-1 flex-col items-center w-full max-w-4xl mx-auto px-4 pt-6 pb-10">
        <AddDayForm initialData={initialData} />
      </main>
    </>
  )
}

export { AddPage }
