/**
 * Helpers para formatação de data e hora com timezone IANA America/Sao_Paulo
 *
 * Regras:
 * - Identificador de fuso IANA válido: 'America/Sao_Paulo' (sem acento, com underscore).
 * - Sem fixação universal de UTC-3: Intl resolve o offset histórico e horário de verão.
 * - Tratamento date-only estrito: 'YYYY-MM-DD' não é convertido para UTC Date nem sofre deslocamento de dia.
 * - Validação de calendário estrita: rejeita formato inválido, mês fora de 1-12, dia 0 ou além do limite
 *   do mês, e valida 29 de fevereiro exclusivamente em anos bissextos.
 * - Testabilidade: aceita parâmetro opcional 'now' (Date) para execução determinística.
 */

export const IANA_TIME_ZONE_SAO_PAULO = 'America/Sao_Paulo'

/**
 * Verifica se um ano gregoriano é bissexto.
 */
export function isLeapYear(year: number): boolean {
  if (!Number.isInteger(year) || year <= 0) return false
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0
}

/**
 * Retorna o número de dias de um dado mês e ano (calendário gregoriano).
 * Retorna 0 se o mês for inválido.
 */
export function getDaysInMonth(year: number, month: number): number {
  if (month < 1 || month > 12) return 0
  const daysPerMonth = [31, isLeapYear(year) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
  return daysPerMonth[month - 1]
}

export interface DateValidationResult {
  valid: boolean
  error?: string
  year?: number
  month?: number
  day?: number
}

/**
 * Validação de calendário ESTRITA para strings de data no formato 'YYYY-MM-DD'.
 * Rejeita:
 * - formato diferente de exatamente YYYY-MM-DD (4 dígitos de ano, 2 de mês, 2 de dia)
 * - espaços em branco
 * - mês < 1 ou > 12
 * - dia < 1 ou dia > dias no mês (ex.: 31/04, 29/02 em não-bissextos como 2025)
 */
export function validateDateOnlyString(dateOnlyString: string): DateValidationResult {
  if (typeof dateOnlyString !== 'string') {
    return { valid: false, error: 'Data não informada.' }
  }

  const trimmed = dateOnlyString.trim()
  if (trimmed !== dateOnlyString) {
    return { valid: false, error: 'A data não pode conter espaços.' }
  }

  // Exige exatamente 4 dígitos para ano, 2 dígitos para mês, 2 dígitos para dia
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateOnlyString)
  if (!match) {
    return { valid: false, error: 'Formato de data inválido. Utilize o formato AAAA-MM-DD.' }
  }

  const year = parseInt(match[1], 10)
  const month = parseInt(match[2], 10)
  const day = parseInt(match[3], 10)

  if (year < 1900 || year > 2100) {
    return { valid: false, error: 'Ano fora do intervalo permitido (1900-2100).' }
  }

  if (month < 1 || month > 12) {
    return { valid: false, error: 'Mês inválido (deve estar entre 01 e 12).' }
  }

  const maxDays = getDaysInMonth(year, month)
  if (day < 1 || day > maxDays) {
    if (month === 2 && day === 29 && !isLeapYear(year)) {
      return { valid: false, error: `29 de fevereiro é inválido em ${year} (não é ano bissexto).` }
    }
    return {
      valid: false,
      error: `Dia ${String(day).padStart(2, '0')} inválido para o mês ${String(month).padStart(2, '0')}/${year} (máximo: ${maxDays} dias).`,
    }
  }

  return { valid: true, year, month, day }
}

/**
 * Obtém os componentes de data (ano, mês, dia) no fuso America/Sao_Paulo
 * utilizando formatToParts, sem pressupor formato de en-CA ou qualquer locale específico.
 */
export function getSaoPauloDateParts(now: Date = new Date()): {
  year: string
  month: string
  day: string
} {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: IANA_TIME_ZONE_SAO_PAULO,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })

  const parts = formatter.formatToParts(now)
  let year = ''
  let month = ''
  let day = ''

  for (const p of parts) {
    if (p.type === 'year') year = p.value
    if (p.type === 'month') month = p.value
    if (p.type === 'day') day = p.value
  }

  return { year, month, day }
}

/**
 * Retorna a string YYYY-MM-DD correspondente a "hoje" no fuso America/Sao_Paulo.
 * Montada via formatToParts, determinística através do parâmetro opcional 'now'.
 */
export function getTodayDateInputValue(now: Date = new Date()): string {
  const { year, month, day } = getSaoPauloDateParts(now)
  return `${year}-${month}-${day}`
}

/**
 * Formata um Date em string legível brasileira com fuso IANA resolvido.
 * Exemplo de retorno: "15/01/2025 às 14:32 (Horário de Brasília)"
 */
export function formatDateTimeBRSaoPaulo(date: Date = new Date()): string {
  const formatter = new Intl.DateTimeFormat('pt-BR', {
    timeZone: IANA_TIME_ZONE_SAO_PAULO,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: undefined,
    hour12: false,
  })

  const parts = formatter.formatToParts(date)
  const map: Record<string, string> = {}
  for (const p of parts) {
    map[p.type] = p.value
  }

  return `${map.day}/${map.month}/${map.year} às ${map.hour}:${map.minute} (America/Sao_Paulo)`
}

/**
 * Converte 'YYYY-MM-DD' em 'DD/MM/AAAA' SEM conversão para objeto Date
 * e SEM qualquer deslocamento de dia (date-only puro).
 * Se for inválido, retorna a string original ou string vazia.
 */
export function formatDateBR(dateOnlyString: string): string {
  if (!dateOnlyString) return ''
  const val = validateDateOnlyString(dateOnlyString)
  if (!val.valid || !val.year || !val.month || !val.day) {
    return dateOnlyString
  }
  const dd = String(val.day).padStart(2, '0')
  const mm = String(val.month).padStart(2, '0')
  const yyyy = String(val.year).padStart(4, '0')
  return `${dd}/${mm}/${yyyy}`
}

/**
 * Verifica se a data 'YYYY-MM-DD' é estritamente futura em relação a "hoje"
 * no fuso America/Sao_Paulo.
 * Parâmetro 'now' opcional para testes determinísticos.
 */
export function isFutureDate(dateOnlyString: string, now: Date = new Date()): boolean {
  const val = validateDateOnlyString(dateOnlyString)
  if (!val.valid) return false

  const todayIso = getTodayDateInputValue(now)
  return dateOnlyString > todayIso
}
