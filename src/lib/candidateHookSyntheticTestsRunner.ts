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
} {
  const recordsTable: MockRecordData[] = opts.existingRecords ? [...opts.existingRecords] : []
  let result: MockEventResult | null = null

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
function loadCandidateHandler(): (e: Record<string, unknown>) => unknown {
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

  // Avalia o código em função isolada
  const runner = new Function('routerAdd', 'Record', candidateHookSource)
  runner(mockRouterAdd, MockRecord)

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

  const handler = loadCandidateHandler()
  const suiteName = 'Candidate Hook Raw Source (.js.txt via mock harness)'

  const validBasePayload = {
    idempotencyKey: 'E2E_SYNTH_RAW_KEY_12345',
    clientName: 'E2E_SYNTH_Cliente_Valido',
    relato: 'Atendimento jurídico impecável e transparente.',
    experienceDate: '2026-10-15',
    consentGiven: true,
    termsVersion: 'v1.0-2026',
  }

  // 1. Rejeição de corpo inválido (Array, Null, Primitivo string/number)
  {
    // Array
    const mArray = createMockEvent({ body: [1, 2, 3] })
    handler(mArray.e)
    const rArray = mArray.getResult()
    assert(
      suiteName,
      'Rejeita payload tipo Array com 400',
      rArray?.statusCode === 400 && rArray.body.success === false,
    )

    // Null
    const mNull = createMockEvent({ body: null })
    handler(mNull.e)
    const rNull = mNull.getResult()
    assert(
      suiteName,
      'Rejeita payload tipo Null com 400',
      rNull?.statusCode === 400 && rNull.body.success === false,
    )

    // String primitiva
    const mStr = createMockEvent({ body: 'invalid-string-payload' })
    handler(mStr.e)
    const rStr = mStr.getResult()
    assert(
      suiteName,
      'Rejeita payload tipo Primitivo com 400',
      rStr?.statusCode === 400 && rStr.body.success === false,
    )
  }

  // 2. Consentimento estritamente true (rejeita false, ausente, truthy coercivo)
  {
    // false
    const mFalse = createMockEvent({ body: { ...validBasePayload, consentGiven: false } })
    handler(mFalse.e)
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
    handler(mUndef.e)
    const rUndef = mUndef.getResult()
    assert(
      suiteName,
      'Rejeita consentGiven ausente com 400',
      rUndef?.statusCode === 400 && rUndef.body.success === false,
    )

    // truthy coercivo (string "true" ou 1)
    const mCoercive = createMockEvent({ body: { ...validBasePayload, consentGiven: 'true' } })
    handler(mCoercive.e)
    const rCoercive = mCoercive.getResult()
    assert(
      suiteName,
      'Rejeita consentGiven truthy tipo string com 400 (exige booleano estrito true)',
      rCoercive?.statusCode === 400 && rCoercive.body.success === false,
    )
  }

  // 3. termsVersion deve pertencer à lista oficial permitida
  {
    const mBadTerms = createMockEvent({
      body: { ...validBasePayload, termsVersion: 'v9.9-inventada' },
    })
    handler(mBadTerms.e)
    const rBadTerms = mBadTerms.getResult()
    assert(
      suiteName,
      'Rejeita termsVersion fora da lista permitida com 400',
      rBadTerms?.statusCode === 400 && rBadTerms.body.success === false,
    )

    const mGoodTerms = createMockEvent({
      body: { ...validBasePayload, termsVersion: 'v1.0-2026' },
    })
    handler(mGoodTerms.e)
    const rGoodTerms = mGoodTerms.getResult()
    assert(
      suiteName,
      'Aceita termsVersion na lista permitida (v1.0-2026) com 201',
      rGoodTerms?.statusCode === 201 && rGoodTerms.body.success === true,
    )
  }

  // 4. Validação de calendário estrito (29fev em ano comum, 31abr, datas futuras)
  {
    // 29 de fev de 2025 (ano não bissexto)
    const m29Fev = createMockEvent({
      body: { ...validBasePayload, experienceDate: '2025-02-29' },
    })
    handler(m29Fev.e)
    const r29Fev = m29Fev.getResult()
    assert(
      suiteName,
      'Rejeita 2025-02-29 (fevereiro não-bissexto) com 400',
      r29Fev?.statusCode === 400 && r29Fev.body.success === false,
    )

    // 31 de abril
    const m31Abr = createMockEvent({
      body: { ...validBasePayload, experienceDate: '2026-04-31' },
    })
    handler(m31Abr.e)
    const r31Abr = m31Abr.getResult()
    assert(
      suiteName,
      'Rejeita 2026-04-31 (abril tem 30 dias) com 400',
      r31Abr?.statusCode === 400 && r31Abr.body.success === false,
    )

    // Data futura no calendário (ano 2099)
    const mFuture = createMockEvent({
      body: { ...validBasePayload, experienceDate: '2099-12-31' },
    })
    handler(mFuture.e)
    const rFuture = mFuture.getResult()
    assert(
      suiteName,
      'Rejeita data futura em relação a São Paulo com 400',
      rFuture?.statusCode === 400 && rFuture.body.success === false,
    )
  }

  // 5. Tratamento de UNIQUE seguro:
  // - Catch de UNIQUE com registro existente confirmado com a MESMA chave -> 201 canônico
  // - Catch de UNIQUE com falha de leitura ou registro não confirmado -> 500 internal_error
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
    handler(mUniqueConfirm.e)
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
    handler(mUniqueFail.e)
    const rUniqueFail = mUniqueFail.getResult()
    assert(
      suiteName,
      'Catch de UNIQUE SEM confirmação da mesma chave -> retorna 500 internal_error (NUNCA 201)',
      rUniqueFail?.statusCode === 500 &&
        rUniqueFail.body.success === false &&
        rUniqueFail.body.error === 'internal_error',
    )
  }

  // 6. Limiter fail-closed: IP inválido ou falha na consulta de taxa -> 429 rate_limited
  {
    // IP ausente ou em branco
    const mNoIp = createMockEvent({
      clientIp: '   ',
      body: validBasePayload,
    })
    handler(mNoIp.e)
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
    handler(mCrashDb.e)
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
