'use client'

import { useCallback, useRef, useState } from 'react'
import type { FormInput } from '@/features/add-day/types'

const DRAFT_KEY_PREFIX = 'kurstata:day-draft:'
const SAVE_DEBOUNCE_MS = 500

const loadDraft = (key: string): FormInput | null => {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as FormInput) : null
  } catch {
    return null
  }
}

const useDayDraft = (identity: string) => {
  const key = `${DRAFT_KEY_PREFIX}${identity}`
  const [draft] = useState<FormInput | null>(() => loadDraft(key))
  const pendingRef = useRef<FormInput | null>(null)
  const timerRef = useRef<number | null>(null)

  const flush = useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
    if (pendingRef.current !== null) {
      localStorage.setItem(key, JSON.stringify(pendingRef.current))
      pendingRef.current = null
    }
  }, [key])

  const scheduleSave = useCallback((data: FormInput) => {
    pendingRef.current = data
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current)
    }
    timerRef.current = window.setTimeout(flush, SAVE_DEBOUNCE_MS)
  }, [flush])

  const clearDraft = useCallback(() => {
    pendingRef.current = null
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
    localStorage.removeItem(key)
  }, [key])

  return { draft, scheduleSave, flush, clearDraft }
}

export { useDayDraft }
