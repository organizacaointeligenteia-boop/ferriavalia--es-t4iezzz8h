/**
 * Helpers para formatação de data e hora com timezone explícito America/São Paulo (UTC-3)
 */

export function formatDateTimeBRSaoPaulo(date: Date = new Date()): string {
  // Obter partes na timezone America/São Paulo
  const formatter = new Intl.DateTimeFormat('pt-BR', {
    timeZone: 'America/São Paulo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })

  const parts = formatter.formatToParts(date)
  const map: Record<string, string> = {}
  parts.forEach((p) => {
    map[p.type] = p.value
  })

  return `${map.day}/${map.month}/${map.year} às ${map.hour}:${map.minute} (America/São Paulo, UTC-3)`
}

export function formatDateBR(dateOnlyString: string): string {
  // dateOnlyString no formato YYYY-MM-DD
  if (!dateOnlyString) return ''
  const parts = dateOnlyString.split('-')
  if (parts.length !== 3) return dateOnlyString
  const [year, month, day] = parts
  return `${day}/${month}/${year}`
}

export function isFutureDate(dateOnlyString: string): boolean {
  if (!dateOnlyString) return false
  const [year, month, day] = dateOnlyString.split('-').map(Number)
  if (!year || !month || !day) return false

  // Obter hoje na timezone America/São Paulo
  const todayFormatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/São Paulo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
  const todayIso = todayFormatter.format(new Date()) // YYYY-MM-DD
  return dateOnlyString > todayIso
}

export function getTodayDateInputValue(): string {
  const todayFormatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/São Paulo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
  return todayFormatter.format(new Date()) // YYYY-MM-DD
}
