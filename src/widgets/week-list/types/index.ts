export type DaySummary = {
  date: string
  label: string
  hours: number
  orders: number
  total: number
}

export type WeekSummary = {
  weekStart: string
  label: string
  days: DaySummary[]
  hours: number
  orders: number
  ordersPerHour: number
  totalPerHour: number
  total: number
  totalPerOrder: number
}
