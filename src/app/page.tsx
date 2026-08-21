import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { DemoSection } from '@/sections/demo'
import { getCurrentUser } from '@/shared/api/getCurrentUser'

export const metadata: Metadata = {
  title: 'Kurstata — учёт рабочих смен',
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ auth?: string; from?: string; reset?: string }>
}) {
  const { auth, from, reset } = await searchParams

  let user = null
  try {
    user = await getCurrentUser()
  } catch {
    user = null
  }
  if (user) {
    redirect('/dashboard')
  }

  return <DemoSection openAuthOnMount={auth === 'open'} returnTo={from} resetToken={reset} />
}
