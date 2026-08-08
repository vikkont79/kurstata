import { describe, it, expect } from 'vitest'
import { calcHours } from '@/sections/dashboard/lib/calcHours'

describe('calcHours', () => {
  it('считает обычную смену', () => {
    expect(calcHours('09:00', '17:00')).toBe(8)
  })

  it('считает смену с минутами', () => {
    expect(calcHours('09:30', '10:15')).toBe(0.75)
  })

  it('даёт ноль для смены без длительности', () => {
    expect(calcHours('10:00', '10:00')).toBe(0)
  })

  it('даёт отрицательные часы для ночной смены', () => {
    expect(calcHours('22:00', '06:00')).toBe(-16)
  })
})
