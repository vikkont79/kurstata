'use server'

import { clearSessionCookie } from '@/shared/lib/auth'

export async function logout(): Promise<{ success: true }> {
  await clearSessionCookie()
  return { success: true }
}
