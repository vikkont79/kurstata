import { describe, it, expect } from 'vitest'
import { parsePeriod, getPeriodStart } from './period'

describe('parsePeriod', () => {
  it('принимает валидные значения', () => {
    expect(parsePeriod('week')).toBe('week')
    expect(parsePeriod('month')).toBe('month')
    expect(parsePeriod('all')).toBe('all')
  })

  it('неизвестное и пустое → month', () => {
    expect(parsePeriod(undefined)).toBe('month')
    expect(parsePeriod('year')).toBe('month')
    expect(parsePeriod('')).toBe('month')
  })
})

describe('getPeriodStart', () => {
  it('week: пятница → понедельник той же недели', () => {
    expect(getPeriodStart('week', new Date('2026-08-21T12:00:00'))).toBe('2026-08-17')
  })

  it('week: понедельник → тот же день', () => {
    expect(getPeriodStart('week', new Date('2026-08-17T12:00:00'))).toBe('2026-08-17')
  })

  it('week: воскресенье → понедельник предыдущей недели', () => {
    expect(getPeriodStart('week', new Date('2026-08-16T12:00:00'))).toBe('2026-08-10')
  })

  it('week: через границу года', () => {
    expect(getPeriodStart('week', new Date('2026-01-04T12:00:00'))).toBe('2025-12-29')
  })

  it('month: первое число месяца', () => {
    expect(getPeriodStart('month', new Date('2026-08-21T12:00:00'))).toBe('2026-08-01')
  })

  it('all: без нижней границы', () => {
    expect(getPeriodStart('all', new Date('2026-08-21T12:00:00'))).toBeNull()
  })
})
