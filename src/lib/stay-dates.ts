export function stayDay(value: string): string | null {
  const day = value.slice(0, 10)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) return null
  if (value.length > 10 && !/^[T ]\d{2}:\d{2}/.test(value.slice(10))) return null
  const midnight = new Date(`${day}T00:00:00.000Z`)
  if (Number.isNaN(Date.parse(value)) || Number.isNaN(midnight.getTime())) return null
  return midnight.toISOString().slice(0, 10) === day ? day : null
}

export function matchesStayDateRange(value: string, from: string, to: string): boolean {
  if (!from && !to) return true
  const day = stayDay(value)
  return day !== null && (!from || day >= from) && (!to || day <= to)
}
