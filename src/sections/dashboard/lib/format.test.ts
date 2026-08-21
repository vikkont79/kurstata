import { describe, it, expect } from 'vitest'
import { round1, formatDayLabel, formatWeekRange } from '@/sections/dashboard/lib/format'

describe('round1', () => {
  it('округляет до десятых', () => {
    expect(round1(5.55)).toBe(5.6)
    expect(round1(5.04)).toBe(5)
  })
})

describe('formatDayLabel', () => {
  it('выводит день недели и дату', () => {
    expect(formatDayLabel('2026-08-08')).toBe('Сб 08.08')
  })
})

describe('formatWeekRange', () => {
  it('в пределах одного месяца', () => {
    expect(formatWeekRange('2026-08-03')).toBe('3-9.08.2026')
  })

  it('через границу года', () => {
    expect(formatWeekRange('2025-12-29')).toBe('29.12.2025-4.01.2026')
  })
})
