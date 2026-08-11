import type { Metadata } from 'next'
import { DashboardPage } from '@/sections/dashboard'

export const metadata: Metadata = {
  title: 'Дашборд',
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ auth?: string; from?: string; reset?: string }>
}) {
  const { auth, from, reset } = await searchParams
  return <DashboardPage openAuthOnMount={auth === 'open'} returnTo={from} resetToken={reset} />
}
