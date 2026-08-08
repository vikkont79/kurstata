import type { Metadata } from 'next'
import { AddPage } from '@/sections/add'

export const metadata: Metadata = {
  title: 'Добавить день',
}

export default async function Page({ searchParams }: { searchParams: Promise<{ date?: string }> }) {
  return <AddPage date={(await searchParams).date} />
}
