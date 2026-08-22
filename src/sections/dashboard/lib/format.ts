const DAY_NAMES = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб']

function round1(v: number): number {
  return Math.round(v * 10) / 10
}

function formatDayLabel(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00')
  return `${DAY_NAMES[d.getDay()]} ${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}`
}

function formatWeekRange(weekStart: string): string {
  const start = new Date(weekStart + 'T00:00:00')
  const end = new Date(start)
  end.setDate(start.getDate() + 6)

  const day = (d: Date) => String(d.getDate())
  const month = (d: Date) => String(d.getMonth() + 1).padStart(2, '0')
  const year = (d: Date) => String(d.getFullYear())

  if (start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear()) {
    return `${day(start)} - ${day(end)}.${month(end)}.${year(end)}`
  }
  if (start.getFullYear() === end.getFullYear()) {
    return `${day(start)}.${month(start)} - ${day(end)}.${month(end)}.${year(end)}`
  }
  return `${day(start)}.${month(start)}.${year(start)} - ${day(end)}.${month(end)}.${year(end)}`
}

export { DAY_NAMES, round1, formatDayLabel, formatWeekRange }
