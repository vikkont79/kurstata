import { getDayByDate } from '@/entities/day/api/getDayByDate'
import { getCurrentUser } from '@/shared/api/getCurrentUser'
import { Header } from '@/widgets/header'
import { AddDayForm } from '@/features/add-day'
import { ErrorState } from '@/shared/ui'
import type { User } from '@/entities/user'
import type { DayWithShifts } from '@/entities/day/types'

const AddPage = async ({ date }: { date?: string }) => {
  let user: User | null = null
  let sessionError = false
  try {
    user = await getCurrentUser()
  } catch {
    sessionError = true
  }

  let initialData: DayWithShifts | undefined
  let dayError = false
  if (date && user) {
    try {
      initialData = await getDayByDate(user.id, date)
    } catch {
      dayError = true
    }
  }

  return (
    <>
      <Header
        title={date ? 'Редактировать' : 'Добавить день'}
        link={{ href: '/dashboard', label: '← К дашборду' }}
        className="w-full max-w-4xl mx-auto px-4 pt-10"
        user={user}
        sessionError={sessionError}
      />
      <main className="flex flex-1 flex-col items-center w-full max-w-4xl mx-auto px-4 pt-6 pb-10">
        {dayError ? (
          <ErrorState message="Не удалось загрузить данные за эту дату. Попробуйте позже" />
        ) : (
          <AddDayForm initialData={initialData} />
        )}
      </main>
    </>
  )
}

export { AddPage }
