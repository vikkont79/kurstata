import { describe, it, expect } from 'vitest'
import { getMockWeeks } from './mockData'

describe('getMockWeeks', () => {
  it('возвращает недели в порядке убывания без дат из будущего', () => {
    const now = new Date('2026-08-21T12:00:00')
    const weeks = getMockWeeks(now)

    expect(weeks.length).toBeGreaterThan(1)
    for (let i = 1; i < weeks.length; i++) {
      expect(weeks[i - 1].weekStart > weeks[i].weekStart).toBe(true)
    }
    for (const week of weeks) {
      for (const day of week.days) {
        expect(day.date <= '2026-08-21').toBe(true)
      }
    }
  })

  it('детерминирован: одна и та же дата даёт одинаковый результат', () => {
    const now = new Date('2026-08-21T12:00:00')
    expect(getMockWeeks(now)).toEqual(getMockWeeks(now))
  })

  it('у всех дней положительные метрики', () => {
    const weeks = getMockWeeks(new Date('2026-08-21T12:00:00'))
    for (const week of weeks) {
      expect(week.hours).toBeGreaterThan(0)
      expect(week.orders).toBeGreaterThan(0)
      expect(week.total).toBeGreaterThan(0)
      for (const day of week.days) {
        expect(day.hours).toBeGreaterThan(0)
        expect(day.orders).toBeGreaterThan(0)
        expect(day.total).toBeGreaterThan(0)
      }
    }
  })
})
