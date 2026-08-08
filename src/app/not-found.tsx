import Link from 'next/link'
import { getButtonClassName } from '@/shared/ui/button/Button'

export default function NotFound() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center w-full max-w-4xl mx-auto px-4 py-16 gap-2 text-center">
      <p className="text-5xl font-bold text-zinc-300 dark:text-zinc-700">404</p>
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">Страница не найдена</h1>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">Такой страницы нет или она была удалена</p>
      <Link href="/" className={`${getButtonClassName('primary')} mt-2`}>
        На главную
      </Link>
    </main>
  )
}
