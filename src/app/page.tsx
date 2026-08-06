import { DashboardPage } from '@/sections/dashboard'

export default async function Home({ searchParams }: { searchParams: Promise<{ auth?: string; from?: string }> }) {
  const { auth, from } = await searchParams
  return <DashboardPage openAuthOnMount={auth === 'open'} returnTo={from} />
}
