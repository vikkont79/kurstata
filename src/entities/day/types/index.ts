export type Day = {
  id: string
  date: string
  dayTotal: number | null
  createdAt: string | null
  updatedAt: string | null
}

export type DayWithShifts = Day & {
  shifts: Array<{
    id: string
    startTime: string
    endTime: string
    orders: number
  }>
}
