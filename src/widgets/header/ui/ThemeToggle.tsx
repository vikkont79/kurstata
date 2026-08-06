'use client'

import { useSyncExternalStore } from 'react'
import { getButtonClassName } from '@/shared/ui/button/Button'

const THEME_EVENT = 'themechange'

const getSnapshot = (): boolean => document.documentElement.classList.contains('dark')

const getServerSnapshot = (): boolean => false

const subscribe = (onStoreChange: () => void): (() => void) => {
  window.addEventListener(THEME_EVENT, onStoreChange)
  return () => window.removeEventListener(THEME_EVENT, onStoreChange)
}

const ThemeToggle = () => {
  const isDark = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  const toggleTheme = () => {
    const next = !isDark
    document.documentElement.classList.toggle('dark', next)
    localStorage.setItem('theme', next ? 'dark' : 'light')
    window.dispatchEvent(new Event(THEME_EVENT))
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={getButtonClassName('secondary', undefined, true)}
      aria-label={isDark ? 'Переключить на светлую тему' : 'Переключить на тёмную тему'}
    >
      {isDark ? '☀️' : '🌙'}
    </button>
  )
}

export { ThemeToggle }
