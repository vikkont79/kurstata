import type { Metadata } from 'next'
import { DashboardPage } from '@/sections/dashboard'

export const metadata: Metadata = {
  title: 'Дашборд',
}

export default async function Home({ searchParams }: { searchParams: Promise<{ auth?: string; from?: string }> }) {
  const { auth, from } = await searchParams
  return <DashboardPage openAuthOnMount={auth === 'open'} returnTo={from} />
}
