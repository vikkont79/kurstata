import { DashboardPage } from '@/sections/dashboard'

export default async function Home({ searchParams }: { searchParams: Promise<{ auth?: string }> }) {
  const { auth } = await searchParams
  return <DashboardPage openAuthOnMount={auth === 'open'} />
}
