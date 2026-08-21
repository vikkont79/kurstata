import { describe, it, expect } from 'vitest'
import { formatHours, formatRate, formatSum } from '@/widgets/week-list/lib/format'

describe('formatHours', () => {
  it('не выводит дробную часть у целых часов', () => {
    expect(formatHours(8)).toBe('8 ч')
  })

  it('выводит одну десятую у дробных часов', () => {
    expect(formatHours(8.5)).toBe('8.5 ч')
  })
})

describe('formatRate', () => {
  it('не выводит дробную часть у целых', () => {
    expect(formatRate(2)).toBe('2')
  })

  it('округляет дробные до десятых', () => {
    expect(formatRate(2.35)).toBe('2.4')
  })
})

describe('formatSum', () => {
  it('форматирует с разделителями тысяч', () => {
    expect(formatSum(1000)).toBe('1\u00A0000 ₽')
  })
})
