import { Header } from '@/widgets/header'
import { WeekList } from '@/widgets/week-list'
import { getMockWeeks } from '../lib/mockData'

const DemoPage = ({
  openAuthOnMount,
  returnTo,
  resetToken,
}: {
  openAuthOnMount?: boolean
  returnTo?: string
  resetToken?: string
}) => {
  const weeks = getMockWeeks()

  return (
    <>
      <Header
        title="Демо"
        link={{ href: '/add', label: '+ Добавить день' }}
        className="w-full max-w-4xl mx-auto px-4 pt-10"
        openAuthOnMount={openAuthOnMount}
        returnTo={returnTo}
        resetToken={resetToken}
      />
      <main className="flex flex-1 flex-col w-full max-w-4xl mx-auto px-4 pt-6 pb-10 gap-6">
        <section className="rounded-lg border border-zinc-200 bg-white p-5 text-sm dark:border-zinc-700 dark:bg-zinc-900">
          <p className="font-medium text-zinc-900 dark:text-zinc-100">
            Kurstata — учёт рабочих смен: часы, заказы и заработок по дням и неделям.
          </p>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            Ниже — примерные данные для демонстрации.{' '}
            Нажмите «Войти», чтобы зарегистрироваться и вести свой учёт, или кликните по любому дню.
          </p>
        </section>
        <WeekList weeks={weeks} />
      </main>
    </>
  )
}

export { DemoPage }
