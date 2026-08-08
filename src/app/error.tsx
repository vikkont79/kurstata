'use client'

import { useEffect } from 'react'
import { Button } from '@/shared/ui'

export default function Error({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string }
  unstable_retry: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <main className="flex flex-1 flex-col items-center justify-center w-full max-w-4xl mx-auto px-4 py-16 gap-4 text-center">
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">Что-то пошло не так</h1>
      <p className="text-sm text-zinc-600 dark:text-zinc-400 max-w-lg break-words">
        {error.message}
        {error.digest ? <span className="text-zinc-400 dark:text-zinc-500"> ({error.digest})</span> : null}
      </p>
      <Button onClick={() => unstable_retry()}>Попробовать снова</Button>
    </main>
  )
}
