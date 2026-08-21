function formatHours(v: number): string {
  const rounded = Math.round(v * 10) / 10
  return Number.isInteger(rounded) ? `${rounded} ч` : `${rounded.toFixed(1)} ч`
}

function formatRate(v: number): string {
  const rounded = Math.round(v * 10) / 10
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1)
}

function formatSum(v: number): string {
  return `${Math.round(v).toLocaleString('ru-RU')} ₽`
}

export { formatHours, formatRate, formatSum }
