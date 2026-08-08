const skeleton = 'rounded bg-zinc-200 dark:bg-zinc-700 animate-pulse'

const WeekSkeleton = () => {
  return (
    <div className="rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 overflow-hidden">
      <div className="flex items-center justify-between p-4">
        <div className={`h-4 w-32 ${skeleton}`} />
        <div className={`h-4 w-4 ${skeleton}`} />
      </div>
      <div className="px-4 py-3 grid grid-cols-3 gap-x-4 gap-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className={`h-3 ${skeleton}`} />
        ))}
      </div>
    </div>
  )
}

export default function Loading() {
  return (
    <>
      <header className="w-full max-w-4xl mx-auto px-4 pt-10 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center justify-end gap-2 md:order-1">
          <div className={`h-9 w-9 ${skeleton}`} />
          <div className={`h-9 w-28 ${skeleton}`} />
        </div>
        <div className="flex items-center justify-between gap-3 md:flex-1">
          <div className={`h-7 w-32 ${skeleton}`} />
          <div className={`h-9 w-36 ${skeleton}`} />
        </div>
      </header>
      <main className="flex flex-1 flex-col w-full max-w-4xl mx-auto px-4 pt-6 pb-10 gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <WeekSkeleton key={i} />
        ))}
      </main>
    </>
  )
}
