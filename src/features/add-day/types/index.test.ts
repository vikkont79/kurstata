import { describe, it, expect } from 'vitest'
import { addDaySchema } from '@/features/add-day/types'

const validDay = {
  date: '2026-08-08',
  dayTotal: 0,
  shifts: [{ startTime: '09:00', endTime: '17:00', orders: 10 }],
}

describe('addDaySchema', () => {
  it('принимает валидный день', () => {
    expect(addDaySchema.safeParse(validDay).success).toBe(true)
  })

  it('отклоняет мусорную дату', () => {
    expect(addDaySchema.safeParse({ ...validDay, date: 'не-дата' }).success).toBe(false)
  })

  it('отклоняет несуществующую дату', () => {
    expect(addDaySchema.safeParse({ ...validDay, date: '2026-13-45' }).success).toBe(false)
  })

  it('отклоняет время вне формата HH:MM', () => {
    expect(addDaySchema.safeParse({
      ...validDay,
      shifts: [{ startTime: '9:00', endTime: '17:00', orders: 0 }],
    }).success).toBe(false)
  })

  it('отклоняет смену, где начало позже конца', () => {
    expect(addDaySchema.safeParse({
      ...validDay,
      shifts: [{ startTime: '17:00', endTime: '09:00', orders: 0 }],
    }).success).toBe(false)
  })

  it('принимает ровно 20 смен', () => {
    const shifts = Array.from({ length: 20 }, () => ({ startTime: '09:00', endTime: '10:00', orders: 0 }))
    expect(addDaySchema.safeParse({ ...validDay, shifts }).success).toBe(true)
  })

  it('отклоняет больше 20 смен', () => {
    const shifts = Array.from({ length: 21 }, () => ({ startTime: '09:00', endTime: '10:00', orders: 0 }))
    expect(addDaySchema.safeParse({ ...validDay, shifts }).success).toBe(false)
  })

  it('отклоняет заказы больше 1000', () => {
    expect(addDaySchema.safeParse({
      ...validDay,
      shifts: [{ startTime: '09:00', endTime: '10:00', orders: 1001 }],
    }).success).toBe(false)
  })

  it('отклоняет отрицательную сумму', () => {
    expect(addDaySchema.safeParse({ ...validDay, dayTotal: -1 }).success).toBe(false)
  })
})
