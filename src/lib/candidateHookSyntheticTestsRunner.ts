/**
 * SUÍTE DE TESTES SINTÉTICOS DIRETA NO CÓDIGO FONTE DO HOOK CANDIDATO (.js.txt)
 * Arquivo: src/lib/candidateHookSyntheticTestsRunner.ts
 * Projeto: Ferri & Ferri — Relatos e Experiência
 * Data real de referência: 15/10/2026
 *
 * ESCLARECIMENTO DE AMBIENTE:
 * - Distinção clara: Node.js + Mock vs Goja / PocketBase VM vs Runtime Real.
 * - Este teste NÃO importa reimplementações ou espelhos TypeScript.
 * - Ele lê O CÓDIGO FONTE EXATO DE 'docs/candidates/reports-native/reports-native-candidate.js.txt',
 *   injeta um harness de mock (routerAdd, e, e.app, Record) e avalia a função handler real.
 * - 100% isolado em memória (E2E_SYNTH_), sem rede, sem banco live, sem segredos.
 */

import candidateHookSource from '../../docs/candidates/reports-native/reports-native-candidate.js.txt?raw'

export interface CandidateHookTestResultItem {
  suite: string
  name: string
  passed: boolean
  error?: string
}

export interface CandidateHookSuiteReport {
  total: number
  passed: number
  failed: number
  results: CandidateHookTestResultItem[]
  harnessType: 'Node.js + in-memory mock harness evaluating raw candidate .js.txt source (NOT Goja VM, NOT live PB)'
  liveDatabaseTouched: false
}

type MockRecordData = Record<string, unknown>

interface MockEventOptions {
  clientIp?: string | null
  body?: unknown
  existingRecords?: MockRecordData[]
  throwOnFindRecent?: boolean
  throwOnSave?: boolean
  saveFailIsUnique?: boolean
  throwOnConfirmFind?: boolean
}

interface MockEventResult {
  statusCode: number
  body: Record<string, unknown>
}

// Cria o ambiente simulado isolado para uma chamada do handler
function createMockEvent(opts: MockEventOptions): {
  e: Record<string, unknown>
  recordsTable: MockRecordData[]
  getResult: () => MockEventResult | null
  saveCallCount: () => number
} {
  const recordsTable: MockRecordData[] = opts.existingRecords ? [...opts.existingRecords] : []
  let result: MockEventResult | null = null
  let savesCount = 0

  const app = {
    findRecordsByFilter: (
      collection: string,
      filter: string,
      sort: string,
      limit: number,
      offset: number,
      params?: Record<string, unknown>,
    ) => {
      if (opts.throwOnFindRecent) {
        throw new Error('Database connection failed')
      }
      return recordsTable.slice(0, limit)
    },
    findFirstRecordByData: (collection: string, field: string, value: unknown) => {
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

  const e = {
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

  return {
    e,
    recordsTable,
    getResult: () => result,
    saveCallCount: () => savesCount,
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

// Avalia a fonte exata do candidato capturando a rota registrada
function loadCandidateHandler(
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

  const scopeKeys = customScope ? Object.keys(customScope) : []
  const scopeValues = customScope ? Object.values(customScope) : []

  const runner = new Function('routerAdd', 'Record', ...scopeKeys, candidateHookSource)
  runner(mockRouterAdd, MockRecord, ...scopeValues)

  if (!registeredHandler) {
    throw new Error('Candidato não registrou POST /backend/v1/reports')
  }

  return registeredHandler
}

export async function runCandidateHookSyntheticTests(): Promise<CandidateHookSuiteReport> {
  const results: CandidateHookTestResultItem[] = []

  function assert(suite: string, name: string, condition: boolean, message?: string) {
    if (condition) {
      results.push({ suite, name, passed: true })
    } else {
      results.push({
        suite,
        name,
        passed: false,
        error: message || 'Falha na asserção contra código-fonte do candidato',
      })
    }
  }

  const defaultHandler = loadCandidateHandler()
  const suiteName = 'Candidate Hook Raw Source (.js.txt via mock harness)'

  // Instante controlado: hoje no Brasil (America/Sao_Paulo)
  // Calculamos a data de hoje corrente em SP para payload base válido
  const dtfSpToday = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
  const spParts = dtfSpToday.formatToParts(new Date())
  let spYear = ''
  let spMonth = ''
  let spDay = ''
  for (const p of spParts) {
    if (p.type === 'year') spYear = p.value
    if (p.type === 'month') spMonth = p.value
    if (p.type === 'day') spDay = p.value
  }
  const todaySpDateString = `${spYear}-${spMonth}-${spDay}`

  const validBasePayload = {
    idempotencyKey: 'E2E_SYNTH_RAW_KEY_12345',
    clientName: 'E2E_SYNTH_Cliente_Valido',
    relato: 'Atendimento jurídico impecável e transparente.',
    experienceDate: todaySpDateString,
    consentGiven: true,
    termsVersion: 'v1.0-2026',
  }

  // =========================================================================
  // G1. GATE DE FUSO E INTL: Respostas 503 fail-closed com zero inserts
  // =========================================================================

  // G1.1: Intl ausente -> 503 com zero insert
  {
    const noIntlHandler = loadCandidateHandler({ Intl: undefined })
    const mNoIntl = createMockEvent({ body: validBasePayload })
    noIntlHandler(mNoIntl.e)
    const rNoIntl = mNoIntl.getResult()
    assert(
      suiteName,
      'Intl ausente -> retorna 503 timezone_unavailable e ZERO inserts',
      rNoIntl?.statusCode === 503 &&
        rNoIntl.body.error === 'timezone_unavailable' &&
        mNoIntl.saveCallCount() === 0 &&
        mNoIntl.recordsTable.length === 0,
    )
  }

  // G1.2: Intl lança erro -> 503 com zero insert
  {
    const throwingIntl = {
      DateTimeFormat: function () {
        throw new Error('Unsupported timeZone America/Sao_Paulo')
      },
    }
    const throwingIntlHandler = loadCandidateHandler({ Intl: throwingIntl })
    const mThrowIntl = createMockEvent({ body: validBasePayload })
    throwingIntlHandler(mThrowIntl.e)
    const rThrowIntl = mThrowIntl.getResult()
    assert(
      suiteName,
      'Intl lança erro -> retorna 503 timezone_unavailable e ZERO inserts',
      rThrowIntl?.statusCode === 503 &&
        rThrowIntl.body.error === 'timezone_unavailable' &&
        mThrowIntl.saveCallCount() === 0 &&
        mThrowIntl.recordsTable.length === 0,
    )
  }

  // G1.3: formatToParts retorna parts incompletos/ruins -> 503 com zero insert
  {
    const badPartsIntl = {
      DateTimeFormat: function () {
        return {
          formatToParts: () => [
            { type: 'literal', value: '/' },
            { type: 'month', value: '10' }, // falta year e day
          ],
        }
      },
    }
    const badPartsHandler = loadCandidateHandler({ Intl: badPartsIntl })
    const mBadParts = createMockEvent({ body: validBasePayload })
    badPartsHandler(mBadParts.e)
    const rBadParts = mBadParts.getResult()
    assert(
      suiteName,
      'Intl com parts incompletos -> retorna 503 timezone_unavailable e ZERO inserts',
      rBadParts?.statusCode === 503 &&
        rBadParts.body.error === 'timezone_unavailable' &&
        mBadParts.saveCallCount() === 0 &&
        mBadParts.recordsTable.length === 0,
    )
  }

  // G1.4: Part com valor 99 em month / day / hour -> 503 timezone_unavailable e ZERO inserts
  {
    const parts99Intl = {
      DateTimeFormat: function (locale: string, opts?: { hour?: string }) {
        return {
          formatToParts: () => {
            if (opts?.hour) {
              return [
                { type: 'day', value: '15' },
                { type: 'month', value: '10' },
                { type: 'year', value: '2026' },
                { type: 'hour', value: '99' },
                { type: 'minute', value: '30' },
                { type: 'second', value: '00' },
              ]
            }
            return [
              { type: 'month', value: '99' },
              { type: 'day', value: '99' },
              { type: 'year', value: '2026' },
            ]
          },
        }
      },
    }
    const parts99Handler = loadCandidateHandler({ Intl: parts99Intl })
    const mParts99 = createMockEvent({ body: validBasePayload })
    parts99Handler(mParts99.e)
    const rParts99 = mParts99.getResult()
    assert(
      suiteName,
      'Intl com parts fora de range (month=99, day=99, hour=99) -> retorna 503 timezone_unavailable e ZERO inserts',
      rParts99?.statusCode === 503 &&
        rParts99.body.error === 'timezone_unavailable' &&
        mParts99.saveCallCount() === 0 &&
        mParts99.recordsTable.length === 0,
    )
  }

  // G1.5: Part com valor "00" em month ou day -> 503 timezone_unavailable e ZERO inserts
  {
    const parts00Intl = {
      DateTimeFormat: function () {
        return {
          formatToParts: () => [
            { type: 'year', value: '2026' },
            { type: 'month', value: '00' },
            { type: 'day', value: '00' },
          ],
        }
      },
    }
    const parts00Handler = loadCandidateHandler({ Intl: parts00Intl })
    const mParts00 = createMockEvent({ body: validBasePayload })
    parts00Handler(mParts00.e)
    const rParts00 = mParts00.getResult()
    assert(
      suiteName,
      'Intl com month=00 ou day=00 inválidos -> retorna 503 timezone_unavailable e ZERO inserts',
      rParts00?.statusCode === 503 &&
        rParts00.body.error === 'timezone_unavailable' &&
        mParts00.saveCallCount() === 0 &&
        mParts00.recordsTable.length === 0,
    )
  }

  // G1.6: 31 de abril no Intl dateParts -> 503 timezone_unavailable e ZERO inserts
  {
    const april31Intl = {
      DateTimeFormat: function () {
        return {
          formatToParts: () => [
            { type: 'year', value: '2026' },
            { type: 'month', value: '04' },
            { type: 'day', value: '31' },
          ],
        }
      },
    }
    const april31Handler = loadCandidateHandler({ Intl: april31Intl })
    const mApril31 = createMockEvent({ body: validBasePayload })
    april31Handler(mApril31.e)
    const rApril31 = mApril31.getResult()
    assert(
      suiteName,
      'Intl produz 31 de abril inválido para o mês -> retorna 503 timezone_unavailable e ZERO inserts',
      rApril31?.statusCode === 503 &&
        rApril31.body.error === 'timezone_unavailable' &&
        mApril31.saveCallCount() === 0 &&
        mApril31.recordsTable.length === 0,
    )
  }

  // G1.7: 29 de fevereiro em ano não-bissexto (2025-02-29) -> 503 timezone_unavailable e ZERO inserts
  {
    const feb29NonLeapIntl = {
      DateTimeFormat: function () {
        return {
          formatToParts: () => [
            { type: 'year', value: '2025' },
            { type: 'month', value: '02' },
            { type: 'day', value: '29' },
          ],
        }
      },
    }
    const feb29Handler = loadCandidateHandler({ Intl: feb29NonLeapIntl })
    const mFeb29 = createMockEvent({ body: validBasePayload })
    feb29Handler(mFeb29.e)
    const rFeb29 = mFeb29.getResult()
    assert(
      suiteName,
      'Intl produz 29 de fevereiro em ano não-bissexto (2025) -> retorna 503 timezone_unavailable e ZERO inserts',
      rFeb29?.statusCode === 503 &&
        rFeb29.body.error === 'timezone_unavailable' &&
        mFeb29.saveCallCount() === 0 &&
        mFeb29.recordsTable.length === 0,
    )
  }

  // G1.8: Hora "24" gerada pelo runtime (sem normalização silenciosa para 0) -> 503 timezone_unavailable
  {
    const hour24Intl = {
      DateTimeFormat: function (locale: string, opts?: { hour?: string }) {
        return {
          formatToParts: () => {
            if (opts?.hour) {
              return [
                { type: 'day', value: '15' },
                { type: 'month', value: '10' },
                { type: 'year', value: '2026' },
                { type: 'hour', value: '24' }, // Hora 24 anômala não-h23
                { type: 'minute', value: '00' },
                { type: 'second', value: '00' },
              ]
            }
            return [
              { type: 'year', value: '2026' },
              { type: 'month', value: '10' },
              { type: 'day', value: '15' },
            ]
          },
        }
      },
    }
    const hour24Handler = loadCandidateHandler({ Intl: hour24Intl })
    const mHour24 = createMockEvent({ body: validBasePayload })
    hour24Handler(mHour24.e)
    const rHour24 = mHour24.getResult()
    assert(
      suiteName,
      'Intl produz hora 24 (anomalia de hourCycle) -> nega estritamente com 503 sem normalização silenciosa',
      rHour24?.statusCode === 503 &&
        rHour24.body.error === 'timezone_unavailable' &&
        mHour24.saveCallCount() === 0 &&
        mHour24.recordsTable.length === 0,
    )
  }

  // G1.9: Part duplicada (ex: dois years em dateParts) -> 503 timezone_unavailable
  {
    const duplicatePartIntl = {
      DateTimeFormat: function () {
        return {
          formatToParts: () => [
            { type: 'year', value: '2026' },
            { type: 'year', value: '2026' }, // Duplicado!
            { type: 'month', value: '10' },
            { type: 'day', value: '15' },
          ],
        }
      },
    }
    const duplicateHandler = loadCandidateHandler({ Intl: duplicatePartIntl })
    const mDuplicate = createMockEvent({ body: validBasePayload })
    duplicateHandler(mDuplicate.e)
    const rDuplicate = mDuplicate.getResult()
    assert(
      suiteName,
      'Intl produz part duplicada (counts !== 1) -> retorna 503 timezone_unavailable e ZERO inserts',
      rDuplicate?.statusCode === 503 &&
        rDuplicate.body.error === 'timezone_unavailable' &&
        mDuplicate.saveCallCount() === 0 &&
        mDuplicate.recordsTable.length === 0,
    )
  }

  // G1.10: Part ausente (ex: falta 'second' em auditParts) -> 503 timezone_unavailable
  {
    const missingAuditPartIntl = {
      DateTimeFormat: function (locale: string, opts?: { hour?: string }) {
        return {
          formatToParts: () => {
            if (opts?.hour) {
              return [
                { type: 'day', value: '15' },
                { type: 'month', value: '10' },
                { type: 'year', value: '2026' },
                { type: 'hour', value: '14' },
                { type: 'minute', value: '30' },
                // second ausente
              ]
            }
            return [
              { type: 'year', value: '2026' },
              { type: 'month', value: '10' },
              { type: 'day', value: '15' },
            ]
          },
        }
      },
    }
    const missingHandler = loadCandidateHandler({ Intl: missingAuditPartIntl })
    const mMissing = createMockEvent({ body: validBasePayload })
    missingHandler(mMissing.e)
    const rMissing = mMissing.getResult()
    assert(
      suiteName,
      'Intl com part obrigatória ausente em auditParts -> retorna 503 timezone_unavailable',
      rMissing?.statusCode === 503 &&
        rMissing.body.error === 'timezone_unavailable' &&
        mMissing.saveCallCount() === 0 &&
        mMissing.recordsTable.length === 0,
    )
  }

  // G1.11: Divergência de YMD entre dateParts e auditParts gerados no MESMO instante -> 503 timezone_unavailable
  {
    const divergentYmdIntl = {
      DateTimeFormat: function (locale: string, opts?: { hour?: string }) {
        return {
          formatToParts: () => {
            if (opts?.hour) {
              // auditParts alega dia 16
              return [
                { type: 'day', value: '16' },
                { type: 'month', value: '10' },
                { type: 'year', value: '2026' },
                { type: 'hour', value: '00' },
                { type: 'minute', value: '05' },
                { type: 'second', value: '00' },
              ]
            }
            // dateParts alega dia 15
            return [
              { type: 'year', value: '2026' },
              { type: 'month', value: '10' },
              { type: 'day', value: '15' },
            ]
          },
        }
      },
    }
    const divergentHandler = loadCandidateHandler({ Intl: divergentYmdIntl })
    const mDivergent = createMockEvent({ body: validBasePayload })
    divergentHandler(mDivergent.e)
    const rDivergent = mDivergent.getResult()
    assert(
      suiteName,
      'Divergência de YMD entre dateParts e auditParts do mesmo instante -> nega com 503 timezone_unavailable',
      rDivergent?.statusCode === 503 &&
        rDivergent.body.error === 'timezone_unavailable' &&
        mDivergent.saveCallCount() === 0 &&
        mDivergent.recordsTable.length === 0,
    )
  }

  // G1.12: requestInstant não-finito (NaN / Infinity) -> 503 timezone_unavailable
  {
    class MockInvalidDate extends Date {
      constructor(...args: unknown[]) {
        if (args.length === 0) {
          super(NaN)
        } else {
          // @ts-expect-error repassa construtor Date
          super(...args)
        }
      }
      getTime() {
        return NaN
      }
    }
    const invalidDateHandler = loadCandidateHandler({ Date: MockInvalidDate })
    const mInvalidDate = createMockEvent({ body: validBasePayload })
    invalidDateHandler(mInvalidDate.e)
    const rInvalidDate = mInvalidDate.getResult()
    assert(
      suiteName,
      'requestInstant com timestamp não-finito (NaN) -> retorna 503 timezone_unavailable antes de qualquer uso',
      rInvalidDate?.statusCode === 503 &&
        rInvalidDate.body.error === 'timezone_unavailable' &&
        mInvalidDate.saveCallCount() === 0 &&
        mInvalidDate.recordsTable.length === 0,
    )
  }

  // G1.13: Caso positivo: Meia-noite BRT (00:00:00) válida aceita e auditada perfeitamente
  {
    class MockMidnightDate extends Date {
      constructor(...args: unknown[]) {
        if (args.length === 0) {
          // 2026-10-15 00:00:00 BRT corresponde a 2026-10-15T03:00:00.000Z
          super('2026-10-15T03:00:00.000Z')
        } else {
          // @ts-expect-error repassa construtor Date
          super(...args)
        }
      }
      static now() {
        return new Date('2026-10-15T03:00:00.000Z').getTime()
      }
    }
    const midnightHandler = loadCandidateHandler({ Date: MockMidnightDate })
    const mMidnight = createMockEvent({
      body: { ...validBasePayload, experienceDate: '2026-10-15' },
    })
    midnightHandler(mMidnight.e)
    const rMidnight = mMidnight.getResult()
    const recMidnight = mMidnight.recordsTable[0]
    assert(
      suiteName,
      'Positivo: Meia-noite BRT (00:00:00) com hourCycle h23 aceita com 201 e registrada com sucesso',
      rMidnight?.statusCode === 201 &&
        rMidnight.body.success === true &&
        recMidnight !== undefined &&
        typeof recMidnight.received_at_sp === 'string' &&
        recMidnight.received_at_sp.includes('00:00:00'),
    )
  }

  // G1.14: Caso positivo: Ano bissexto válido no instante corrente (2024-02-29 no runtime) aceito
  {
    class MockLeapDayDate extends Date {
      constructor(...args: unknown[]) {
        if (args.length === 0) {
          super('2024-02-29T15:00:00.000Z')
        } else {
          // @ts-expect-error repassa construtor Date
          super(...args)
        }
      }
      static now() {
        return new Date('2024-02-29T15:00:00.000Z').getTime()
      }
    }
    const leapDayHandler = loadCandidateHandler({ Date: MockLeapDayDate })
    const mLeapDay = createMockEvent({
      body: { ...validBasePayload, experienceDate: '2024-02-29' },
    })
    leapDayHandler(mLeapDay.e)
    const rLeapDay = mLeapDay.getResult()
    assert(
      suiteName,
      'Positivo: Ano bissexto válido (2024-02-29) validado por extractAndValidateParts sem rejeição falsa',
      rLeapDay?.statusCode === 201 && rLeapDay.body.success === true,
    )
  }

  // =========================================================================
  // G2. FRONTEIRA UTC vs SP (instante próximo à meia-noite onde UTC difere de SP)
  // =========================================================================
  {
    // Exemplo: 2026-03-15T01:30:00Z -> em UTC é 2026-03-15, mas em SP (UTC-3) são 22:30 de 2026-03-14
    class MockDateBorder extends Date {
      constructor(...args: unknown[]) {
        if (args.length === 0) {
          super('2026-03-15T01:30:00.000Z')
        } else {
          // @ts-expect-error repassa construtor Date
          super(...args)
        }
      }
      static now() {
        return new Date('2026-03-15T01:30:00.000Z').getTime()
      }
    }
    const borderHandler = loadCandidateHandler({ Date: MockDateBorder })

    // Se o cliente enviar 2026-03-15, mas em SP ainda for 2026-03-14: deve ser rejeitado como data futura!
    const mBorderFuture = createMockEvent({
      body: { ...validBasePayload, experienceDate: '2026-03-15' },
    })
    borderHandler(mBorderFuture.e)
    const rBorderFuture = mBorderFuture.getResult()
    assert(
      suiteName,
      'Fronteira UTC/SP: rejeita data que é hoje em UTC mas futura em SP (2026-03-15)',
      rBorderFuture?.statusCode === 400 && rBorderFuture.body.success === false,
    )

    // Se o cliente enviar 2026-03-14 (que é hoje em SP): aceita com 201
    const mBorderCurrent = createMockEvent({
      body: { ...validBasePayload, experienceDate: '2026-03-14' },
    })
    borderHandler(mBorderCurrent.e)
    const rBorderCurrent = mBorderCurrent.getResult()
    assert(
      suiteName,
      'Fronteira UTC/SP: aceita data corrente civil em SP (2026-03-14) com 201',
      rBorderCurrent?.statusCode === 201 && rBorderCurrent.body.success === true,
    )
  }

  // =========================================================================
  // G3. Rejeição de date-only com espaços em qualquer posição (fail-closed, sem trim)
  // =========================================================================
  {
    // Espaço no fim "2025-01-15 "
    const mSpaceEnd = createMockEvent({
      body: { ...validBasePayload, experienceDate: '2025-01-15 ' },
    })
    defaultHandler(mSpaceEnd.e)
    const rSpaceEnd = mSpaceEnd.getResult()
    assert(
      suiteName,
      'Rejeita experienceDate com espaço no final ("2025-01-15 ") com 400 sem trim permissivo',
      rSpaceEnd?.statusCode === 400 && rSpaceEnd.body.success === false,
    )

    // Espaço no início " 2025-01-15"
    const mSpaceStart = createMockEvent({
      body: { ...validBasePayload, experienceDate: ' 2025-01-15' },
    })
    defaultHandler(mSpaceStart.e)
    const rSpaceStart = mSpaceStart.getResult()
    assert(
      suiteName,
      'Rejeita experienceDate com espaço no início (" 2025-01-15") com 400',
      rSpaceStart?.statusCode === 400 && rSpaceStart.body.success === false,
    )

    // Espaço no meio "2025- 01-15"
    const mSpaceMid = createMockEvent({
      body: { ...validBasePayload, experienceDate: '2025- 01-15' },
    })
    defaultHandler(mSpaceMid.e)
    const rSpaceMid = mSpaceMid.getResult()
    assert(
      suiteName,
      'Rejeita experienceDate com espaço intermediário ("2025- 01-15") com 400',
      rSpaceMid?.statusCode === 400 && rSpaceMid.body.success === false,
    )
  }

  // =========================================================================
  // G4. termsVersion na lista vs fora da lista (v1.0-2025, v1.0-2026)
  // =========================================================================
  {
    // Fora da lista
    const mBadTerms = createMockEvent({
      body: { ...validBasePayload, termsVersion: 'v9.9-inventada' },
    })
    defaultHandler(mBadTerms.e)
    const rBadTerms = mBadTerms.getResult()
    assert(
      suiteName,
      'Rejeita termsVersion fora da lista permitida (v9.9-inventada) com 400',
      rBadTerms?.statusCode === 400 && rBadTerms.body.success === false,
    )

    // Na lista: v1.0-2025
    const mTerms2025 = createMockEvent({
      body: { ...validBasePayload, termsVersion: 'v1.0-2025' },
    })
    defaultHandler(mTerms2025.e)
    const rTerms2025 = mTerms2025.getResult()
    assert(
      suiteName,
      'Aceita termsVersion oficial v1.0-2025 com 201',
      rTerms2025?.statusCode === 201 && rTerms2025.body.success === true,
    )

    // Na lista: v1.0-2026
    const mTerms2026 = createMockEvent({
      body: { ...validBasePayload, termsVersion: 'v1.0-2026' },
    })
    defaultHandler(mTerms2026.e)
    const rTerms2026 = mTerms2026.getResult()
    assert(
      suiteName,
      'Aceita termsVersion oficial v1.0-2026 com 201',
      rTerms2026?.statusCode === 201 && rTerms2026.body.success === true,
    )
  }

  // =========================================================================
  // G5. Ausência de ReferenceError no insert (cleanTermsVersion gravado com sucesso)
  // =========================================================================
  {
    const mInsert = createMockEvent({
      body: { ...validBasePayload, termsVersion: 'v1.0-2026' },
    })
    defaultHandler(mInsert.e)
    const rInsert = mInsert.getResult()
    const insertedRecord = mInsert.recordsTable[0]
    assert(
      suiteName,
      'Insert grava terms_version com valor de cleanTermsVersion sem ReferenceError',
      rInsert?.statusCode === 201 &&
        insertedRecord !== undefined &&
        insertedRecord.terms_version === 'v1.0-2026',
    )
  }

  // =========================================================================
  // G6. Validação de calendário estrito (29fev em ano bissexto vs não-bissexto, 31abr, futuro)
  // =========================================================================
  {
    // 29 de fev de 2025 (ano não bissexto) -> 400
    const m29FevNaoBissexto = createMockEvent({
      body: { ...validBasePayload, experienceDate: '2025-02-29' },
    })
    defaultHandler(m29FevNaoBissexto.e)
    const r29FevNaoBissexto = m29FevNaoBissexto.getResult()
    assert(
      suiteName,
      'Rejeita 2025-02-29 (fevereiro em ano não-bissexto) com 400',
      r29FevNaoBissexto?.statusCode === 400 && r29FevNaoBissexto.body.success === false,
    )

    // 29 de fev de 2024 (ano bissexto válido) -> 201
    const m29FevBissexto = createMockEvent({
      body: { ...validBasePayload, experienceDate: '2024-02-29' },
    })
    defaultHandler(m29FevBissexto.e)
    const r29FevBissexto = m29FevBissexto.getResult()
    assert(
      suiteName,
      'Aceita 2024-02-29 (fevereiro em ano bissexto no passado) com 201',
      r29FevBissexto?.statusCode === 201 && r29FevBissexto.body.success === true,
    )

    // 31 de abril (mês de 30 dias) -> 400
    const m31Abr = createMockEvent({
      body: { ...validBasePayload, experienceDate: '2024-04-31' },
    })
    defaultHandler(m31Abr.e)
    const r31Abr = m31Abr.getResult()
    assert(
      suiteName,
      'Rejeita 2024-04-31 (abril tem 30 dias) com 400',
      r31Abr?.statusCode === 400 && r31Abr.body.success === false,
    )

    // Data futura no calendário (ano 2099)
    const mFuture = createMockEvent({
      body: { ...validBasePayload, experienceDate: '2099-12-31' },
    })
    defaultHandler(mFuture.e)
    const rFuture = mFuture.getResult()
    assert(
      suiteName,
      'Rejeita data futura em relação a São Paulo com 400',
      rFuture?.statusCode === 400 && rFuture.body.success === false,
    )
  }

  // =========================================================================
  // G7. Rejeição de corpo inválido (Array, Null, Primitivo string/number)
  // =========================================================================
  {
    // Array
    const mArray = createMockEvent({ body: [1, 2, 3] })
    defaultHandler(mArray.e)
    const rArray = mArray.getResult()
    assert(
      suiteName,
      'Rejeita payload tipo Array com 400',
      rArray?.statusCode === 400 && rArray.body.success === false,
    )

    // Null
    const mNull = createMockEvent({ body: null })
    defaultHandler(mNull.e)
    const rNull = mNull.getResult()
    assert(
      suiteName,
      'Rejeita payload tipo Null com 400',
      rNull?.statusCode === 400 && rNull.body.success === false,
    )

    // String primitiva
    const mStr = createMockEvent({ body: 'invalid-string-payload' })
    defaultHandler(mStr.e)
    const rStr = mStr.getResult()
    assert(
      suiteName,
      'Rejeita payload tipo Primitivo com 400',
      rStr?.statusCode === 400 && rStr.body.success === false,
    )
  }

  // =========================================================================
  // G8. Consentimento estritamente true (rejeita false, ausente, truthy coercivo)
  // =========================================================================
  {
    // false
    const mFalse = createMockEvent({ body: { ...validBasePayload, consentGiven: false } })
    defaultHandler(mFalse.e)
    const rFalse = mFalse.getResult()
    assert(
      suiteName,
      'Rejeita consentGiven = false com 400',
      rFalse?.statusCode === 400 && rFalse.body.success === false,
    )

    // ausente / undefined
    const noConsentPayload = { ...validBasePayload }
    delete (noConsentPayload as Record<string, unknown>).consentGiven
    const mUndef = createMockEvent({ body: noConsentPayload })
    defaultHandler(mUndef.e)
    const rUndef = mUndef.getResult()
    assert(
      suiteName,
      'Rejeita consentGiven ausente com 400',
      rUndef?.statusCode === 400 && rUndef.body.success === false,
    )

    // truthy coercivo (string "true" ou 1)
    const mCoercive = createMockEvent({ body: { ...validBasePayload, consentGiven: 'true' } })
    defaultHandler(mCoercive.e)
    const rCoercive = mCoercive.getResult()
    assert(
      suiteName,
      'Rejeita consentGiven truthy tipo string com 400 (exige booleano estrito true)',
      rCoercive?.statusCode === 400 && rCoercive.body.success === false,
    )
  }

  // =========================================================================
  // G9. Tratamento de UNIQUE seguro pós-conflito
  // =========================================================================
  {
    // Caso A: Save lança erro de UNIQUE, e reconsulta CONFIRMA a mesma chave existente
    const mUniqueConfirm = createMockEvent({
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
    defaultHandler(mUniqueConfirm.e)
    const rUniqueConfirm = mUniqueConfirm.getResult()
    assert(
      suiteName,
      'Catch de UNIQUE com registro confirmado da MESMA chave -> retorna 201 canônico',
      rUniqueConfirm?.statusCode === 201 &&
        rUniqueConfirm.body.success === true &&
        rUniqueConfirm.body.received === true &&
        !('error' in rUniqueConfirm.body),
    )

    // Caso B: Save lança erro de UNIQUE, mas reconsulta NÃO encontra registro ou falha
    const mUniqueFail = createMockEvent({
      body: validBasePayload,
      throwOnSave: true,
      saveFailIsUnique: true,
      throwOnConfirmFind: true, // simula falha ao reler banco
      existingRecords: [],
    })
    defaultHandler(mUniqueFail.e)
    const rUniqueFail = mUniqueFail.getResult()
    assert(
      suiteName,
      'Catch de UNIQUE SEM confirmação da mesma chave -> retorna 500 internal_error (NUNCA 201)',
      rUniqueFail?.statusCode === 500 &&
        rUniqueFail.body.success === false &&
        rUniqueFail.body.error === 'internal_error',
    )
  }

  // =========================================================================
  // G10. Limiter fail-closed
  // =========================================================================
  {
    // IP ausente ou em branco
    const mNoIp = createMockEvent({
      clientIp: '   ',
      body: validBasePayload,
    })
    defaultHandler(mNoIp.e)
    const rNoIp = mNoIp.getResult()
    assert(
      suiteName,
      'Limiter: IP ausente/em branco retorna 429 rate_limited',
      rNoIp?.statusCode === 429 && rNoIp.body.error === 'rate_limited',
    )

    // Falha / exceção no banco durante checagem de taxa
    const mCrashDb = createMockEvent({
      body: validBasePayload,
      throwOnFindRecent: true,
    })
    defaultHandler(mCrashDb.e)
    const rCrashDb = mCrashDb.getResult()
    assert(
      suiteName,
      'Limiter: Exceção na checagem de quota nega fail-closed com 429 rate_limited',
      rCrashDb?.statusCode === 429 && rCrashDb.body.error === 'rate_limited',
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
      'Node.js + in-memory mock harness evaluating raw candidate .js.txt source (NOT Goja VM, NOT live PB)',
    liveDatabaseTouched: false,
  }
}
