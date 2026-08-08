import { describe, it, expect } from 'vitest'
import { groupIntoWeeks } from '@/sections/dashboard/lib/groupByWeeks'

describe('groupIntoWeeks', () => {
  it('группирует дни одной недели в одну запись с суммой метрик', () => {
    const result = groupIntoWeeks([
      { date: '2026-08-03', hours: 8, orders: 10, total: 500 },
      { date: '2026-08-05', hours: 6, orders: 8, total: 400 },
      { date: '2026-08-09', hours: 4, orders: 2, total: 100 },
    ])
    expect(result).toHaveLength(1)
    expect(result[0].weekStart).toBe('2026-08-03')
    expect(result[0].hours).toBe(18)
    expect(result[0].orders).toBe(20)
    expect(result[0].total).toBe(1000)
    expect(result[0].days).toHaveLength(3)
  })

  it('разделяет дни разных недель и сортирует по убыванию', () => {
    const result = groupIntoWeeks([
      { date: '2026-07-27', hours: 5, orders: 3, total: 150 },
      { date: '2026-08-03', hours: 8, orders: 10, total: 500 },
    ])
    expect(result.map(w => w.weekStart)).toEqual(['2026-08-03', '2026-07-27'])
  })

  it('определяет неделю с переходом через год', () => {
    const result = groupIntoWeeks([
      { date: '2026-01-01', hours: 8, orders: 1, total: 100 },
    ])
    expect(result[0].weekStart).toBe('2025-12-29')
  })

  it('считает метрики на час и заказ', () => {
    const result = groupIntoWeeks([
      { date: '2026-08-03', hours: 10, orders: 20, total: 1000 },
    ])
    expect(result[0].ordersPerHour).toBe(2)
    expect(result[0].totalPerHour).toBe(100)
    expect(result[0].totalPerOrder).toBe(50)
  })

  it('обнуляет метрики при нуле часов', () => {
    const result = groupIntoWeeks([
      { date: '2026-08-03', hours: 0, orders: 0, total: 0 },
    ])
    expect(result[0].ordersPerHour).toBe(0)
    expect(result[0].totalPerHour).toBe(0)
    expect(result[0].totalPerOrder).toBe(0)
  })
})
