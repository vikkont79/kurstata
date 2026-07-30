'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/shared/ui/button/Button'

type DashboardHeaderProps = {
  title: string
  showAddButton?: boolean
}

const DashboardHeader = ({ title, showAddButton }: DashboardHeaderProps) => {
  const router = useRouter()

  return (
    <div className="flex items-center justify-between">
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{title}</h1>
      {showAddButton && (
        <Button onClick={() => router.push('/add')}>+ Добавить день</Button>
      )}
    </div>
  )
}

export { DashboardHeader }
