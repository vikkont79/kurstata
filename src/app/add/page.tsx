import { AddPage } from '@/sections/add'

export default async function Page({ searchParams }: { searchParams: Promise<{ date?: string }> }) {
  return <AddPage date={(await searchParams).date} />
}
