import type { Metadata } from 'next'
import { DashboardPage } from '@/sections/dashboard'
import { parsePeriod } from '@/sections/dashboard/lib/period'

export const metadata: Metadata = {
  title: 'Дашборд',
}

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>
}) {
  const { period } = await searchParams
  return <DashboardPage period={parsePeriod(period)} />
}
