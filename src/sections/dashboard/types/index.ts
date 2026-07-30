export type DaySummary = {
  date: string
  label: string
  hours: number
  orders: number
  ordersPerHour: number
  total: number
  totalPerOrder: number
}

export type WeekSummary = {
  weekStart: string
  label: string
  days: DaySummary[]
  hours: number
  orders: number
  ordersPerHour: number
  total: number
  totalPerOrder: number
}
