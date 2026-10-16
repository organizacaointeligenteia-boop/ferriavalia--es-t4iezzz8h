/**
 * HARNESS DE TESTES DO HOOK NATIVO COMPOSTO (raw .js.txt)
 * Arquivo: src/lib/nativeComposedHookHarnessTests.ts
 * Projeto: Ferri & Ferri — Relatos e Experiência
 * Data real de referência: 15/10/2026
 *
 * ESCLARECIMENTO DE AMBIENTE OBRIGATÓRIO:
 * Node.js + in-memory mock harness evaluating raw composed .js.txt source (NOT Goja VM, NOT live PocketBase runtime).
 *
 * GOVERNANÇA:
 * - Lê a fonte EXATA de 'docs/candidates/reports-native/reports-native-composed.js.txt' via ?raw.
 * - NÃO reimplementa o algoritmo em TypeScript: injeta mocks em memória de DateTime, Timezone, Record, e, e.app
 *   e do quotaProvider diretamente no motor JS, executando a função handler registrada por routerAdd.
 * - 100% isolado em memória com dados sintéticos E2E_SYNTH_, sem acesso a banco live, sem chamadas de rede,
 *   sem segredos ou credenciais.
 */

import composedHookSource from '../../docs/candidates/reports-native/reports-native-composed.js.txt?raw'

export interface ComposedHookTestResultItem {
  suite: string
  name: string
  passed: boolean
  error?: string
}

export interface ComposedHookSuiteReport {
  total: number
  passed: number
  failed: number
  results: ComposedHookTestResultItem[]
  harnessType: 'Node.js + in-memory mock harness evaluating raw composed .js.txt source (NOT Goja VM, NOT live PocketBase runtime)'
  liveDatabaseTouched: false
}

type MockRecordData = Record<string, unknown>

interface MockLocation {
  name: string
  string: () => string
}

interface MockTime {
  iso: string
  loc: MockLocation
  in: (loc: MockLocation) => MockTime
  format: (layout: string) => string
  location?: () => MockLocation | null
}

interface MockDateTime {
  time: () => MockTime
  unix: () => number
  string?: () => string
}

interface MockQuotaProvider {
  checkQuota?: (e: unknown) => { allowed: boolean } | unknown
}

interface MockEventOptions {
  clientIp?: string | null
  body?: unknown
  existingRecords?: MockRecordData[]
  throwOnSave?: boolean
  saveFailIsUnique?: boolean
  throwOnConfirmFind?: boolean
  quotaProvider?: MockQuotaProvider | null
  timeOptions?: unknown
}

interface MockEventResult {
  statusCode: number
  body: Record<string, unknown>
}

// Helpers para formatação de layout Go nas estruturas mock
function formatGoLayout(date: Date, layout: string, locName: string): string {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: locName === 'UTC' ? 'UTC' : locName,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date)

  let y = ''
  let m = ''
  let d = ''
  let h = ''
  let min = ''
  let s = ''
  for (const p of parts) {
    if (p.type === 'year') y = p.value
    if (p.type === 'month') m = p.value
    if (p.type === 'day') d = p.value
    if (p.type === 'hour') h = p.value
    if (p.type === 'minute') min = p.value
    if (p.type === 'second') s = p.value
  }

  let out = layout
  out = out.replace('2006', y)
  out = out.replace('01', m)
  out = out.replace('02', d)
  out = out.replace('15', h)
  out = out.replace('04', min)
  out = out.replace('05', s)
  if (out.includes('.000Z07:00')) {
    out = out.replace('.000Z07:00', '.000Z')
  }
  return out
}

function createMockTime(date: Date, loc: MockLocation): MockTime {
  return {
    iso: date.toISOString(),
    loc,
    in(targetLoc: MockLocation): MockTime {
      return createMockTime(date, targetLoc)
    },
    format(layout: string): string {
      return formatGoLayout(date, layout, loc.name)
    },
    location(): MockLocation {
      return loc
    },
  }
}

export function createMockDateTime(date: Date): MockDateTime {
  const utcLoc: MockLocation = {
    name: 'UTC',
    string: () => 'UTC',
  }
  return {
    time(): MockTime {
      return createMockTime(date, utcLoc)
    },
    unix(): number {
      return Math.floor(date.getTime() / 1000)
    },
    string(): string {
      return date.toISOString().replace('T', ' ').substring(0, 19) + '.000Z'
    },
  }
}

export const StandardTimezone = function (name: string): MockLocation {
  if (name === 'America/Sao_Paulo') {
    return {
      name: 'America/Sao_Paulo',
      string: () => 'America/Sao_Paulo',
    }
  }
  return {
    name: 'UTC',
    string: () => 'UTC',
  }
}

export const StandardDateTime = function (this: unknown) {
  return createMockDateTime(new Date('2026-10-15T15:30:00.000Z'))
}

// Cria ambiente simulado isolado para uma chamada do handler
function createMockEvent(opts: MockEventOptions): {
  e: Record<string, unknown>
  recordsTable: MockRecordData[]
  getResult: () => MockEventResult | null
  saveCallCount: () => number
  findFirstRecordByDataCallCount: () => number
} {
  const recordsTable: MockRecordData[] = opts.existingRecords ? [...opts.existingRecords] : []
  let result: MockEventResult | null = null
  let savesCount = 0
  let findFirstCallCount = 0

  const app = {
    findFirstRecordByData: (collection: string, field: string, value: unknown) => {
      findFirstCallCount++
      if (opts.throwOnConfirmFind) {
        throw new Error('Database read error')
      }
      const match = recordsTable.find((r) => r[field] === value)
      if (!match) {
        throw new Error('sql: no rows in result set')
      }
      return match
    },
    findCollectionByNameOrId: (name: string) => {
      return { id: 'col_reports_01', name }
    },
    save: (recordInstance: { data: MockRecordData }) => {
      savesCount++
      if (opts.throwOnSave) {
        if (opts.saveFailIsUnique) {
          throw new Error('UNIQUE constraint failed: reports.idempotency_key')
        }
        throw new Error('General SQLite I/O disk failure')
      }
      recordsTable.push({ ...recordInstance.data })
      return true
    },
  }

  const e: Record<string, unknown> = {
    realIP: () => opts.clientIp ?? '127.0.0.1',
    remoteIP: () => opts.clientIp ?? '127.0.0.1',
    requestInfo: () => ({
      body: opts.body,
    }),
    app,
    json: (statusCode: number, data: Record<string, unknown>) => {
      result = { statusCode, body: data }
      return result
    },
  }

  if (opts.quotaProvider !== undefined) {
    e.quotaProvider = opts.quotaProvider
  }

  if (opts.timeOptions !== undefined) {
    e.timeOptions = opts.timeOptions
  }

  return {
    e,
    recordsTable,
    getResult: () => result,
    saveCallCount: () => savesCount,
    findFirstRecordByDataCallCount: () => findFirstCallCount,
  }
}

// Classe Record mock compatível com PocketBase jsVM
class MockRecord {
  data: MockRecordData = {}
  collection: unknown
  constructor(collection: unknown) {
    this.collection = collection
  }
  set(key: string, val: unknown) {
    this.data[key] = val
  }
  get(key: string) {
    return this.data[key]
  }
}

// Carrega o handler avaliando a fonte crua .js.txt
export function loadComposedHandler(
  customScope?: Record<string, unknown>,
): (e: Record<string, unknown>) => unknown {
  let registeredHandler: ((e: Record<string, unknown>) => unknown) | null = null

  const mockRouterAdd = (
    method: string,
    path: string,
    handler: (e: Record<string, unknown>) => unknown,
  ) => {
    if (method === 'POST' && path === '/backend/v1/reports') {
      registeredHandler = handler
    }
  }

  const baseScope: Record<string, unknown> = {
    DateTime: StandardDateTime,
    Timezone: StandardTimezone,
    ...customScope,
  }

  const scopeKeys = Object.keys(baseScope)
  const scopeValues = Object.values(baseScope)

  const runner = new Function('routerAdd', 'Record', ...scopeKeys, composedHookSource)
  runner(mockRouterAdd, MockRecord, ...scopeValues)

  if (!registeredHandler) {
    throw new Error('Artefato composto não registrou POST /backend/v1/reports')
  }

  return registeredHandler
}

// Suíte de testes sintéticos do harness composto
export async function runNativeComposedHookHarnessTests(): Promise<ComposedHookSuiteReport> {
  const results: ComposedHookTestResultItem[] = []
  const suiteName =
    'Native Composed Hook Harness Tests (Node.js + in-memory mock harness evaluating raw composed .js.txt source)'

  function assert(name: string, condition: boolean, message?: string) {
    if (condition) {
      results.push({ suite: suiteName, name, passed: true })
    } else {
      results.push({
        suite: suiteName,
        name,
        passed: false,
        error: message || 'Falha na asserção contra o artefato composto cru',
      })
    }
  }

  const defaultHandler = loadComposedHandler()

  const allowedQuotaProvider: MockQuotaProvider = {
    checkQuota: () => ({ allowed: true }),
  }

  const validBasePayload = {
    idempotencyKey: 'E2E_SYNTH_COMPOSED_KEY_001',
    clientName: 'E2E_SYNTH_Cliente_Composto',
    relato: 'Atendimento corporativo e civil com excelência.',
    experienceDate: '2026-10-15',
    consentGiven: true,
    termsVersion: 'v1.0-2026',
  }

  // -------------------------------------------------------------------------
  // C1: Trace Completo Feliz: Quota → Timezone → Validação → Dedup → Save
  // -------------------------------------------------------------------------
  {
    const m = createMockEvent({
      quotaProvider: allowedQuotaProvider,
      body: validBasePayload,
    })
    defaultHandler(m.e)
    const res = m.getResult()
    const rec = m.recordsTable[0]

    const hasExpectedAudit =
      rec &&
      typeof rec.audit_history === 'string' &&
      rec.audit_history.includes('15/10/2026 às 12:30:00 (America/Sao_Paulo)') &&
      rec.audit_history.includes('2026-10-15T15:30:00.000Z')

    assert(
      'C1. Trace completo feliz: timezone→quota→validação→dedup→save (201 canônico com dados sintéticos gravados)',
      res?.statusCode === 201 &&
        res.body.success === true &&
        res.body.received === true &&
        m.saveCallCount() === 1 &&
        m.recordsTable.length === 1 &&
        rec.idempotency_key === validBasePayload.idempotencyKey &&
        rec.received_at_sp === '15/10/2026 às 12:30:00 (America/Sao_Paulo)' &&
        rec.terms_version === 'v1.0-2026' &&
        hasExpectedAudit,
    )
  }

  // -------------------------------------------------------------------------
  // C2: Replay confirmando a MESMA chave (idempotência preventiva antes do save)
  // -------------------------------------------------------------------------
  {
    const existing = {
      idempotency_key: validBasePayload.idempotencyKey,
      client_name: validBasePayload.clientName,
      status: 'recebido',
    }
    const m = createMockEvent({
      quotaProvider: allowedQuotaProvider,
      body: validBasePayload,
      existingRecords: [existing],
    })
    defaultHandler(m.e)
    const res = m.getResult()

    assert(
      'C2. Replay preventivo: chave existente retorna 201 canônico com ZERO chamadas a save()',
      res?.statusCode === 201 &&
        res.body.success === true &&
        res.body.received === true &&
        !('id' in res.body) &&
        !('status' in res.body) &&
        m.saveCallCount() === 0,
    )
  }

  // -------------------------------------------------------------------------
  // C3: Conflito UNIQUE seguido de reconsulta confirmando a MESMA chave -> 201 canônico
  // -------------------------------------------------------------------------
  {
    const m = createMockEvent({
      quotaProvider: allowedQuotaProvider,
      body: validBasePayload,
      throwOnSave: true,
      saveFailIsUnique: true,
      existingRecords: [
        {
          idempotency_key: validBasePayload.idempotencyKey,
          client_name: validBasePayload.clientName,
        },
      ],
    })
    defaultHandler(m.e)
    const res = m.getResult()

    assert(
      'C3. Conflito UNIQUE no save seguido de reconsulta confirmando a MESMA chave -> 201 canônico',
      res?.statusCode === 201 &&
        res.body.success === true &&
        res.body.received === true &&
        !('error' in res.body) &&
        m.saveCallCount() === 1,
    )
  }

  // -------------------------------------------------------------------------
  // C4: Conflito UNIQUE SEM confirmação da mesma chave -> 500 internal_error
  // -------------------------------------------------------------------------
  {
    const m = createMockEvent({
      quotaProvider: allowedQuotaProvider,
      body: validBasePayload,
      throwOnSave: true,
      saveFailIsUnique: true,
      throwOnConfirmFind: true, // reconsulta falha
      existingRecords: [],
    })
    defaultHandler(m.e)
    const res = m.getResult()

    assert(
      'C4. Conflito UNIQUE sem confirmação da mesma chave -> 500 internal_error (NUNCA 201)',
      res?.statusCode === 500 && res.body.success === false && res.body.error === 'internal_error',
    )
  }

  // -------------------------------------------------------------------------
  // C5: Falha de timezone -> 503 com ZERO acesso ao banco (zero save, zero find)
  // -------------------------------------------------------------------------
  {
    const FallbackUtcTimezone = function () {
      return {
        name: 'UTC',
        string: () => 'UTC',
      }
    }
    const noTzHandler = loadComposedHandler({
      Timezone: FallbackUtcTimezone,
    })
    const m = createMockEvent({
      quotaProvider: allowedQuotaProvider,
      body: validBasePayload,
    })
    noTzHandler(m.e)
    const res = m.getResult()

    assert(
      'C5. Falha de timezone (fallback UTC ou tz indisponível) -> 503 estrito com ZERO consultas e ZERO saves',
      res?.statusCode === 503 &&
        res.body.success === false &&
        res.body.error === 'timezone_unavailable' &&
        m.saveCallCount() === 0 &&
        m.findFirstRecordByDataCallCount() === 0,
    )
  }

  // -------------------------------------------------------------------------
  // C6: Quota default-deny (sem quotaProvider) -> 429 ANTES de qualquer acesso a DB
  // -------------------------------------------------------------------------
  {
    const m = createMockEvent({
      quotaProvider: undefined, // sem provider de quota
      body: validBasePayload,
    })
    defaultHandler(m.e)
    const res = m.getResult()

    assert(
      'C6. Quota default-deny (sem provider) -> 429 rate_limited ANTES de timezone e de qualquer DB access',
      res?.statusCode === 429 &&
        res.body.success === false &&
        res.body.error === 'rate_limited' &&
        m.saveCallCount() === 0 &&
        m.findFirstRecordByDataCallCount() === 0,
    )
  }

  // -------------------------------------------------------------------------
  // C7: Quota com provider que lança erro ou retorna malformado -> 429 fail-closed
  // -------------------------------------------------------------------------
  {
    // Provedor que lança
    const throwingQuotaProvider: MockQuotaProvider = {
      checkQuota: () => {
        throw new Error('Quota connection failure')
      },
    }
    const mThrow = createMockEvent({
      quotaProvider: throwingQuotaProvider,
      body: validBasePayload,
    })
    defaultHandler(mThrow.e)
    const resThrow = mThrow.getResult()

    // Provedor que retorna malformado (não-objeto ou allowed: false)
    const malformedQuotaProvider: MockQuotaProvider = {
      checkQuota: () => 'malformed-result',
    }
    const mMalformed = createMockEvent({
      quotaProvider: malformedQuotaProvider,
      body: validBasePayload,
    })
    defaultHandler(mMalformed.e)
    const resMalformed = mMalformed.getResult()

    assert(
      'C7. Quota com provider que lança exceção ou devolve malformado -> 429 fail-closed com zero DB access',
      resThrow?.statusCode === 429 &&
        resThrow.body.error === 'rate_limited' &&
        resMalformed?.statusCode === 429 &&
        resMalformed.body.error === 'rate_limited' &&
        mThrow.saveCallCount() === 0 &&
        mMalformed.saveCallCount() === 0,
    )
  }

  // -------------------------------------------------------------------------
  // C8: Data futura em relação a São Paulo -> 400 estruturado
  // -------------------------------------------------------------------------
  {
    const m = createMockEvent({
      quotaProvider: allowedQuotaProvider,
      body: {
        ...validBasePayload,
        experienceDate: '2026-10-16', // Futura em relação a 2026-10-15
      },
    })
    defaultHandler(m.e)
    const res = m.getResult()

    assert(
      'C8. Data futura em relação ao calendário de São Paulo (2026-10-16) -> 400 estruturado com zero save',
      res?.statusCode === 400 &&
        res.body.success === false &&
        Array.isArray(res.body.errors) &&
        m.saveCallCount() === 0,
    )
  }

  // -------------------------------------------------------------------------
  // C9: Versão de termos inválida (não pertencente à lista) -> 400 estruturado
  // -------------------------------------------------------------------------
  {
    const m = createMockEvent({
      quotaProvider: allowedQuotaProvider,
      body: {
        ...validBasePayload,
        termsVersion: 'v9.9-nao-autorizada',
      },
    })
    defaultHandler(m.e)
    const res = m.getResult()

    assert(
      'C9. Versão de termos inválida (v9.9-nao-autorizada) -> 400 estruturado com zero save',
      res?.statusCode === 400 &&
        res.body.success === false &&
        Array.isArray(res.body.errors) &&
        m.saveCallCount() === 0,
    )
  }

  // -------------------------------------------------------------------------
  // C10: Payload inválido (Array, Null, Primitivo) -> 400 antes de validação interna
  // -------------------------------------------------------------------------
  {
    const mArray = createMockEvent({
      quotaProvider: allowedQuotaProvider,
      body: [1, 2, 3],
    })
    defaultHandler(mArray.e)
    const resArray = mArray.getResult()

    const mNull = createMockEvent({
      quotaProvider: allowedQuotaProvider,
      body: null,
    })
    defaultHandler(mNull.e)
    const resNull = mNull.getResult()

    assert(
      'C10. Payload inválido (Array ou Null) -> 400 estruturado imediato',
      resArray?.statusCode === 400 &&
        resArray.body.success === false &&
        resNull?.statusCode === 400 &&
        resNull.body.success === false &&
        mArray.saveCallCount() === 0 &&
        mNull.saveCallCount() === 0,
    )
  }

  const passed = results.filter((r) => r.passed).length
  const failed = results.filter((r) => !r.passed).length

  return {
    total: results.length,
    passed,
    failed,
    results,
    harnessType:
      'Node.js + in-memory mock harness evaluating raw composed .js.txt source (NOT Goja VM, NOT live PocketBase runtime)',
    liveDatabaseTouched: false,
  }
}
