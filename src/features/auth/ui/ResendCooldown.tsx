'use client'

import { useEffect, useState } from 'react'

type ResendCooldownProps = Readonly<{
  endsAt: number
  onEnd: () => void
}>

const ResendCooldown = ({ endsAt, onEnd }: ResendCooldownProps) => {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    if (endsAt <= 0) return
    const timer = window.setInterval(() => {
      if (Date.now() >= endsAt) {
        setNow(endsAt)
        onEnd()
      } else {
        setNow(Date.now())
      }
    }, 1000)
    return () => window.clearInterval(timer)
  }, [endsAt, onEnd])

  const seconds = Math.max(0, Math.ceil((endsAt - now) / 1000))
  if (seconds <= 0) return null

  return (
    <p className="-mt-2 text-center text-xs text-zinc-500 dark:text-zinc-500">
      Новый код можно запросить через {seconds} с
    </p>
  )
}

export { ResendCooldown }
