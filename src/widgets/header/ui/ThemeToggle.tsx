'use client'

import { useEffect, useState } from 'react'
import { getButtonClassName } from '@/shared/ui/button/Button'

const ThemeToggle = () => {
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'))
  }, [])

  const toggleTheme = () => {
    const next = !isDark
    setIsDark(next)
    document.documentElement.classList.toggle('dark', next)
    localStorage.setItem('theme', next ? 'dark' : 'light')
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={getButtonClassName('secondary')}
      aria-label={isDark ? 'Переключить на светлую тему' : 'Переключить на тёмную тему'}
    >
      {isDark ? 'Светлая' : 'Тёмная'}
    </button>
  )
}

export { ThemeToggle }
