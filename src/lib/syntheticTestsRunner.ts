/**
 * SUÍTE DE TESTES SINTÉTICOS UNITÁRIOS E ISOLADOS
 * Projeto: Ferri & Ferri — Relatos e Experiência
 *
 * CARACTERÍSTICAS DOS TESTES:
 * - 100% isolados da rede, sem internet, sem SMTP, sem APIs externas.
 * - Sem segredos, credenciais ou conexões a bancos de dados compartilhados.
 * - Exclusivamente fixtures com prefixo E2E_SYNTH_.
 * - Valida regras de negócio do validador server-side, idempotência neutra, rate limiter e verificação de equipe.
 * - ATENÇÃO DE GOVERNANÇA: Testes PREPARADOS NÃO EXECUTADOS contra runtime real.
 */

import { validateCreateReportPayload, CreateReportRequestPayload } from './serverReportValidator'
import {
  handleCreateReportEndpoint,
  MockDatabaseClient,
  RateLimiter,
  StaffIdentityVerifier,
  assertStaffAccessGate,
  generateDefaultReportId,
  isValidReportId,
  LEGACY_FALLBACK_UUID,
  UUID_V4_REGEX,
  IdempotencyConflictError,
} from './serverReportEndpointDraft'
import {
  validateDateOnlyString,
  isLeapYear,
  getDaysInMonth,
  isFutureDate,
  formatDateBR,
} from './dateUtils'

export interface TestResultItem {
  suite: string
  name: string
  passed: boolean
  error?: string
}

export async function runSyntheticTests(): Promise<{
  total: number
  passed: number
  failed: number
  results: TestResultItem[]
}> {
  const results: TestResultItem[] = []

  function assert(suite: string, name: string, condition: boolean, message?: string) {
    if (condition) {
      results.push({ suite, name, passed: true })
    } else {
      results.push({
        suite,
        name,
        passed: false,
        error: message || 'Falha na asserção',
      })
    }
  }

  // =========================================================================
  // SUÍTE 1: dateUtils e Regras de Calendário Estrito
  // =========================================================================
  {
    const suite = 'dateUtils — Calendário e Timezone'

    // Bissextos
    assert(suite, '2024 é bissexto', isLeapYear(2024) === true)
    assert(suite, '2025 não é bissexto', isLeapYear(2025) === false)
    assert(suite, '2000 é bissexto (múltiplo de 400)', isLeapYear(2000) === true)
    assert(suite, '1900 não é bissexto (múltiplo de 100 não de 400)', isLeapYear(1900) === false)

    // Dias no mês
    assert(suite, 'Fevereiro de 2024 tem 29 dias', getDaysInMonth(2024, 2) === 29)
    assert(suite, 'Fevereiro de 2025 tem 28 dias', getDaysInMonth(2025, 2) === 28)
    assert(suite, 'Abril tem 30 dias', getDaysInMonth(2025, 4) === 30)
    assert(suite, 'Janeiro tem 31 dias', getDaysInMonth(2025, 1) === 31)

    // Validação estrita de formato YYYY-MM-DD
    assert(suite, 'Aceita 2025-01-15 válido', validateDateOnlyString('2025-01-15').valid === true)
    assert(suite, 'Aceita 2024-02-29 bissexto', validateDateOnlyString('2024-02-29').valid === true)
    assert(
      suite,
      'Rejeita 2025-02-29 em ano não-bissexto',
      validateDateOnlyString('2025-02-29').valid === false,
    )
    assert(
      suite,
      'Rejeita 2025-04-31 (abril tem 30)',
      validateDateOnlyString('2025-04-31').valid === false,
    )
    assert(
      suite,
      'Rejeita formato BR no input date-only (15/01/2025)',
      validateDateOnlyString('15/01/2025').valid === false,
    )
    assert(
      suite,
      'Rejeita string com espaços (" 2025-01-15 ")',
      validateDateOnlyString(' 2025-01-15 ').valid === false,
    )

    // Conversão sem deslocamento de fuso (date-only puro)
    assert(
      suite,
      'formatDateBR converte 2025-01-15 para 15/01/2025',
      formatDateBR('2025-01-15') === '15/01/2025',
    )

    // Data futura relativa a um now fixo (ex: 2025-03-01 12:00 UTC)
    const fixedNow = new Date('2025-03-01T12:00:00.000Z')
    assert(
      suite,
      'isFutureDate identifica 2025-03-02 como futura',
      isFutureDate('2025-03-02', fixedNow) === true,
    )
    assert(
      suite,
      'isFutureDate identifica 2025-03-01 como não-futura (hoje)',
      isFutureDate('2025-03-01', fixedNow) === false,
    )
    assert(
      suite,
      'isFutureDate identifica 2025-02-28 como passada',
      isFutureDate('2025-02-28', fixedNow) === false,
    )
  }

  // =========================================================================
  // SUÍTE 2: Validação Server-Side de Relatos
  // =========================================================================
  {
    const suite = 'serverReportValidator — Regras de Negócio'
    const referenceDate = new Date('2025-03-01T15:00:00.000Z')

    // Cenário Válido Completo com Fixture Sintética
    const validPayload: CreateReportRequestPayload = {
      idempotencyKey: 'E2E_SYNTH_KEY_001_ABCXYZ',
      clientName: 'E2E_SYNTH_Cliente_Teste_Alfa',
      relato: 'Atendimento pontual e esclarecedor.',
      experienceDate: '2025-02-20',
      consentGiven: true,
      termsVersion: 'v1.0-2025',
    }

    const resValid = validateCreateReportPayload(validPayload, referenceDate)
    assert(suite, 'Payload sintético válido aceito', resValid.valid === true)
    assert(
      suite,
      'Sanitized payload preserva campos essenciais',
      resValid.sanitizedPayload?.idempotencyKey === 'E2E_SYNTH_KEY_001_ABCXYZ' &&
        resValid.sanitizedPayload?.consentGiven === true,
    )

    // Rejeição de Consentimento Ausente/Falso
    const noConsentPayload = { ...validPayload, consentGiven: false }
    const resNoConsent = validateCreateReportPayload(noConsentPayload, referenceDate)
    assert(suite, 'Rejeita submissão sem consentimento', resNoConsent.valid === false)
    assert(
      suite,
      'Erro aponta campo consentGiven',
      resNoConsent.errors.some((e) => e.field === 'consentGiven'),
    )

    // Rejeição de Chave de Idempotência Vazia
    const noIdemPayload = { ...validPayload, idempotencyKey: '   ' }
    const resNoIdem = validateCreateReportPayload(noIdemPayload, referenceDate)
    assert(suite, 'Rejeita chave de idempotência em branco', resNoIdem.valid === false)

    // Rejeição de Nome Excedendo 80 Caracteres
    const longNamePayload = {
      ...validPayload,
      clientName: 'E2E_SYNTH_'.padEnd(85, 'A'),
    }
    const resLongName = validateCreateReportPayload(longNamePayload, referenceDate)
    assert(suite, 'Rejeita nome com mais de 80 caracteres', resLongName.valid === false)
    assert(
      suite,
      'Erro aponta campo clientName',
      resLongName.errors.some((e) => e.field === 'clientName'),
    )

    // Rejeição de Relato Excedendo 2000 Caracteres
    const longRelatoPayload = {
      ...validPayload,
      relato: 'X'.repeat(2005),
    }
    const resLongRelato = validateCreateReportPayload(longRelatoPayload, referenceDate)
    assert(suite, 'Rejeita relato com mais de 2000 caracteres', resLongRelato.valid === false)
    assert(
      suite,
      'Erro aponta campo relato',
      resLongRelato.errors.some((e) => e.field === 'relato'),
    )

    // Rejeição de Data Futura
    const futureDatePayload = {
      ...validPayload,
      experienceDate: '2025-03-05',
    }
    const resFuture = validateCreateReportPayload(futureDatePayload, referenceDate)
    assert(suite, 'Rejeita data da experiência no futuro', resFuture.valid === false)
    assert(
      suite,
      'Erro aponta campo experienceDate',
      resFuture.errors.some((e) => e.field === 'experienceDate'),
    )
  }

  // =========================================================================
  // SUÍTE 3: Endpoint Serverless — Idempotência Canônica e Rate Limiting Robusto
  // =========================================================================
  {
    const suite = 'serverReportEndpointDraft — Idempotência e Rate Limiting'
    const referenceDate = new Date('2025-02-15T14:30:00.000Z')

    // Banco de Dados em Memória Isolado para o Teste
    const memoryStore: Array<{
      id: string
      idempotencyKey: string
      receivedAt: string
    }> = []

    const mockDb: MockDatabaseClient = {
      findReportByIdempotencyKey: async (key: string) => {
        const found = memoryStore.find((r) => r.idempotencyKey === key)
        return found ? { id: found.id, receivedAt: found.receivedAt } : null
      },
      insertReport: async (data) => {
        // Se a chave já existir no insert (simulando restrição unique do banco em concorrência), lança IdempotencyConflictError
        if (memoryStore.some((r) => r.idempotencyKey === data.idempotencyKey)) {
          throw new IdempotencyConflictError()
        }
        memoryStore.push({
          id: data.id,
          idempotencyKey: data.idempotencyKey,
          receivedAt: data.receivedAt,
        })
        return { id: data.id }
      },
    }

    // Rate Limiter Permissivo para o teste de criação
    const mockRateLimiterPass: RateLimiter = {
      checkLimit: async () => ({ allowed: true, remainingRequests: 10 }),
    }

    const testPayload: CreateReportRequestPayload = {
      idempotencyKey: 'E2E_SYNTH_UNIQUE_KEY_999',
      clientName: 'E2E_SYNTH_Constituinte_Voluntario',
      relato: 'Excelente clareza sobre os prazos.',
      experienceDate: '2025-02-10',
      consentGiven: true,
      termsVersion: 'v1.0-2025',
    }

    // -------------------------------------------------------------
    // TESTES DO RATE LIMITER: ausente, lança exceção ou malformado -> NEGA sem insert (429, 'rate_limited')
    // -------------------------------------------------------------
    let writeAttemptsOnLimiterFailure = 0
    const mockDbAuditWrites: MockDatabaseClient = {
      findReportByIdempotencyKey: async () => null,
      insertReport: async (data) => {
        writeAttemptsOnLimiterFailure++
        return { id: data.id }
      },
    }

    // 1. Limiter AUSENTE (undefined/null) -> recusa 429 'rate_limited' ANTES de qualquer escrita
    const callWithoutLimiter = await handleCreateReportEndpoint(
      { method: 'POST', body: testPayload },
      { dbClient: mockDbAuditWrites, rateLimiter: null },
      referenceDate,
    )
    assert(
      suite,
      'Rate limiter AUSENTE: recusa com status 429 e erro constante rate_limited',
      callWithoutLimiter.status === 429 && callWithoutLimiter.body.error === 'rate_limited',
    )
    assert(
      suite,
      'Rate limiter AUSENTE: ZERO inserts tentados',
      writeAttemptsOnLimiterFailure === 0,
    )

    // 2. Limiter que LANÇA exceção -> recusa 429 'rate_limited' sem insert
    const mockRateLimiterThrows: RateLimiter = {
      checkLimit: async () => {
        throw new Error('Falha de conexão com Redis ou cluster de rate limiting')
      },
    }
    const callLimiterThrows = await handleCreateReportEndpoint(
      { method: 'POST', body: testPayload },
      { dbClient: mockDbAuditWrites, rateLimiter: mockRateLimiterThrows },
      referenceDate,
    )
    assert(
      suite,
      'Rate limiter que LANÇA exceção: recusa com 429 e erro constante rate_limited sem vazar stack',
      callLimiterThrows.status === 429 && callLimiterThrows.body.error === 'rate_limited',
    )
    assert(
      suite,
      'Rate limiter com exceção: ZERO inserts tentados',
      writeAttemptsOnLimiterFailure === 0,
    )

    // 3. Limiter que retorna MALFORMADO (objeto nulo, sem boolean allowed ou tipo inválido)
    const mockRateLimiterMalformedA = {
      checkLimit: async () => null as unknown as { allowed: boolean },
    }
    const callLimiterMalformedA = await handleCreateReportEndpoint(
      { method: 'POST', body: testPayload },
      { dbClient: mockDbAuditWrites, rateLimiter: mockRateLimiterMalformedA },
      referenceDate,
    )
    assert(
      suite,
      'Rate limiter malformado (retorna nulo): recusa com status 429 e erro rate_limited',
      callLimiterMalformedA.status === 429 && callLimiterMalformedA.body.error === 'rate_limited',
    )

    const mockRateLimiterMalformedB = {
      checkLimit: async () => ({ allowed: 'yes' }) as unknown as { allowed: boolean },
    }
    const callLimiterMalformedB = await handleCreateReportEndpoint(
      { method: 'POST', body: testPayload },
      { dbClient: mockDbAuditWrites, rateLimiter: mockRateLimiterMalformedB },
      referenceDate,
    )
    assert(
      suite,
      'Rate limiter malformado (allowed não é boolean): recusa com status 429 e erro rate_limited',
      callLimiterMalformedB.status === 429 && callLimiterMalformedB.body.error === 'rate_limited',
    )
    assert(
      suite,
      'Rate limiter malformado: ZERO inserts tentados acumulados',
      writeAttemptsOnLimiterFailure === 0,
    )

    // 4. Rate limiter recusando explicitamente ({ allowed: false }) -> 429 rate_limited
    const mockRateLimiterBlock: RateLimiter = {
      checkLimit: async () => ({ allowed: false, remainingRequests: 0 }),
    }
    const callLimiterDenied = await handleCreateReportEndpoint(
      { method: 'POST', body: testPayload },
      { dbClient: mockDbAuditWrites, rateLimiter: mockRateLimiterBlock },
      referenceDate,
    )
    assert(
      suite,
      'Rate limiter recusado: retorna 429 e erro constante rate_limited sem expor reason interna',
      callLimiterDenied.status === 429 && callLimiterDenied.body.error === 'rate_limited',
    )
    assert(
      suite,
      'Rate limiter recusado: ZERO inserts tentados',
      writeAttemptsOnLimiterFailure === 0,
    )

    // -------------------------------------------------------------
    // TESTES DE IDEMPOTÊNCIA CANÔNICA E CONCORRÊNCIA ATÔMICA
    // -------------------------------------------------------------
    // 5. Aceite inicial com sucesso -> Deve retornar status 201 e corpo canônico { success: true, received: true }
    const firstCall = await handleCreateReportEndpoint(
      { method: 'POST', body: testPayload },
      { dbClient: mockDb, rateLimiter: mockRateLimiterPass },
      referenceDate,
    )
    assert(suite, 'Aceite inicial retorna status 201 Created', firstCall.status === 201)
    assert(
      suite,
      'Aceite inicial corpo público canônico é exatamente { success: true, received: true }',
      firstCall.body.success === true &&
        firstCall.body.received === true &&
        // Nenhuma flag de replay, reportId, status interno ou data
        !('idempotencyStatus' in firstCall.body) &&
        !('reportId' in firstCall.body) &&
        !('status' in firstCall.body) &&
        !('receivedAt' in firstCall.body),
    )

    // 6. Replay com chave idêntica existente -> MESMO status (201) e MESMO corpo canônico idêntico
    const replayCall = await handleCreateReportEndpoint(
      { method: 'POST', body: testPayload },
      { dbClient: mockDb, rateLimiter: mockRateLimiterPass },
      referenceDate,
    )
    assert(
      suite,
      'Replay subsequente devolve o MESMO status 201 que o aceite inicial',
      replayCall.status === 201 && replayCall.status === firstCall.status,
    )
    assert(
      suite,
      'Replay devolve corpo público canônico idêntico ao aceite inicial',
      JSON.stringify(replayCall.body) === JSON.stringify(firstCall.body) &&
        replayCall.body.success === true &&
        replayCall.body.received === true &&
        !('idempotencyStatus' in replayCall.body) &&
        !('reportId' in replayCall.body) &&
        !('status' in replayCall.body) &&
        !('receivedAt' in replayCall.body),
    )
    assert(
      suite,
      'Persistência em memória preservada em exatamente 1 registro gravado',
      memoryStore.length === 1,
    )

    // 7. Conflito de unicidade de idempotência em concorrência atômica (insert simulado com colisão única)
    const concurrentPayload: CreateReportRequestPayload = {
      ...testPayload,
      idempotencyKey: 'E2E_SYNTH_CONCURRENT_RACE_KEY',
    }
    // Mock db onde o find não acha (race condition onde duas threads chegam juntas), mas o insert colide
    const mockDbConcurrentRace: MockDatabaseClient = {
      findReportByIdempotencyKey: async () => null, // primeira thread ainda não terminou quando segunda faz find
      insertReport: async () => {
        // Banco real levantaria violação de constraint de unicidade (código 23505)
        throw new IdempotencyConflictError('duplicate key value violates unique constraint')
      },
    }
    const raceCall = await handleCreateReportEndpoint(
      { method: 'POST', body: concurrentPayload },
      { dbClient: mockDbConcurrentRace, rateLimiter: mockRateLimiterPass },
      referenceDate,
    )
    assert(
      suite,
      'Conflito concorrente na inserção atômica devolve o MESMO status 201',
      raceCall.status === 201,
    )
    assert(
      suite,
      'Conflito concorrente devolve o MESMO corpo público canônico { success: true, received: true }',
      JSON.stringify(raceCall.body) === JSON.stringify(firstCall.body),
    )

    // 8. Método não permitido (GET)
    const getCall = await handleCreateReportEndpoint(
      { method: 'GET', body: null },
      { dbClient: mockDb, rateLimiter: mockRateLimiterPass },
      referenceDate,
    )
    assert(suite, 'Requisição GET retorna status 405 Method Not Allowed', getCall.status === 405)
  }

  // =========================================================================
  // SUÍTE 4: Geração e Validação de ID de Relato (UUID Exato no Insert, Rejeição de Espaços, Fail-Closed)
  // =========================================================================
  {
    const suite = 'serverReportEndpointDraft — Geração e Validação de ID'
    const referenceDate = new Date('2025-02-15T14:30:00.000Z')

    const mockRateLimiterPass: RateLimiter = {
      checkLimit: async () => ({ allowed: true, remainingRequests: 10 }),
    }

    const testPayload: CreateReportRequestPayload = {
      idempotencyKey: 'E2E_SYNTH_IDGEN_TEST_001',
      clientName: 'E2E_SYNTH_Cliente_Validador_ID',
      relato: 'Verificação da integridade de geração de UUID.',
      experienceDate: '2025-02-10',
      consentGiven: true,
      termsVersion: 'v1.0-2025',
    }

    // Asserções unitárias do helper isValidReportId
    assert(
      suite,
      'isValidReportId aceita UUID v4 minúsculo válido',
      isValidReportId('a1b2c3d4-e5f6-4a1b-8c2d-3e4f5a6b7c8d') === true,
    )
    assert(
      suite,
      'isValidReportId aceita UUID v4 maiúsculo válido',
      isValidReportId('A1B2C3D4-E5F6-4A1B-8C2D-3E4F5A6B7C8D') === true,
    )
    assert(
      suite,
      'isValidReportId rejeita LEGACY_FALLBACK_UUID constante',
      isValidReportId(LEGACY_FALLBACK_UUID) === false,
    )
    assert(suite, 'isValidReportId rejeita string vazia', isValidReportId('') === false)
    assert(
      suite,
      'isValidReportId rejeita UUID com versão não-4 (ex.: v1)',
      isValidReportId('a1b2c3d4-e5f6-1a1b-8c2d-3e4f5a6b7c8d') === false,
    )
    assert(
      suite,
      'isValidReportId rejeita formato não-hexadecimal / quebrado',
      isValidReportId('invalid-uuid-v4-format-string') === false,
    )

    // REJEIÇÃO ESTRITA DE VALORES COM ESPAÇO (início, fim ou meio) — SEM trim permissivo
    assert(
      suite,
      'isValidReportId REJEITA espaço no início (" a1b2c3d4...")',
      isValidReportId(' a1b2c3d4-e5f6-4a1b-8c2d-3e4f5a6b7c8d') === false,
    )
    assert(
      suite,
      'isValidReportId REJEITA espaço no fim ("...3e4f5a6b7c8d ")',
      isValidReportId('a1b2c3d4-e5f6-4a1b-8c2d-3e4f5a6b7c8d ') === false,
    )
    assert(
      suite,
      'isValidReportId REJEITA espaço no meio ("a1b2 c3d4...")',
      isValidReportId('a1b2 c3d4-e5f6-4a1b-8c2d-3e4f5a6b7c8d') === false,
    )

    // Endpoint com gerador retornando UUID com espaços -> rejeita e ZERO inserts
    let insertsWithSpaces = 0
    const mockDbSpaces: MockDatabaseClient = {
      findReportByIdempotencyKey: async () => null,
      insertReport: async (data) => {
        insertsWithSpaces++
        return { id: data.id }
      },
    }

    const resWithSpaceInUuid = await handleCreateReportEndpoint(
      { method: 'POST', body: testPayload },
      {
        dbClient: mockDbSpaces,
        rateLimiter: mockRateLimiterPass,
        idGenerator: () => ' a1b2c3d4-e5f6-4a1b-8c2d-3e4f5a6b7c8d ',
      },
      referenceDate,
    )
    assert(
      suite,
      'Gerador retornando UUID com espaço: endpoint rejeita com status 500 e erro internal_error',
      resWithSpaceInUuid.status === 500 && resWithSpaceInUuid.body.error === 'internal_error',
    )
    assert(suite, 'Gerador com espaço: ZERO inserts efetuados no banco', insertsWithSpaces === 0)

    // (a) crypto ausente simulado -> generateDefaultReportId lança exceção, zero inserts, erro público constante
    let insertsCountA = 0
    const mockDbA: MockDatabaseClient = {
      findReportByIdempotencyKey: async () => null,
      insertReport: async (data) => {
        insertsCountA++
        return { id: data.id }
      },
    }

    const generatorCryptoAbsent = () => {
      throw new Error('Web Crypto API indisponível para geração segura de identificador de relato.')
    }

    const resCryptoAbsent = await handleCreateReportEndpoint(
      { method: 'POST', body: testPayload },
      { dbClient: mockDbA, rateLimiter: mockRateLimiterPass, idGenerator: generatorCryptoAbsent },
      referenceDate,
    )

    assert(suite, 'Cenário (a): Crypto ausente -> status 500', resCryptoAbsent.status === 500)
    assert(
      suite,
      'Cenário (a): Crypto ausente -> erro público constante "internal_error" sem vazar stack',
      resCryptoAbsent.body.success === false && resCryptoAbsent.body.error === 'internal_error',
    )
    assert(suite, 'Cenário (a): Crypto ausente -> ZERO inserts no banco', insertsCountA === 0)

    // (b) gerador injetado lança exceção arbitrária -> zero inserts, erro público constante
    let insertsCountB = 0
    const mockDbB: MockDatabaseClient = {
      findReportByIdempotencyKey: async () => null,
      insertReport: async (data) => {
        insertsCountB++
        return { id: data.id }
      },
    }

    const generatorThrows = () => {
      throw new TypeError('Simulated unexpected entropy source crash / out of memory')
    }

    const resThrows = await handleCreateReportEndpoint(
      { method: 'POST', body: testPayload },
      { dbClient: mockDbB, rateLimiter: mockRateLimiterPass, idGenerator: generatorThrows },
      referenceDate,
    )

    assert(suite, 'Cenário (b): Gerador lança exceção -> status 500', resThrows.status === 500)
    assert(
      suite,
      'Cenário (b): Gerador lança exceção -> erro público constante "internal_error"',
      resThrows.body.success === false && resThrows.body.error === 'internal_error',
    )
    assert(
      suite,
      'Cenário (b): Gerador lança exceção -> ZERO inserts no banco',
      insertsCountB === 0,
    )

    // (c) gerador injetado retorna saída inválida (vazio, constante antigo, formato errado) -> zero inserts, erro público constante
    let insertsCountC = 0
    const mockDbC: MockDatabaseClient = {
      findReportByIdempotencyKey: async () => null,
      insertReport: async (data) => {
        insertsCountC++
        return { id: data.id }
      },
    }

    // Subcenário c1: string vazia
    const resEmpty = await handleCreateReportEndpoint(
      { method: 'POST', body: testPayload },
      { dbClient: mockDbC, rateLimiter: mockRateLimiterPass, idGenerator: () => '' },
      referenceDate,
    )
    assert(
      suite,
      'Cenário (c1): Gerador retorna string vazia -> status 500 e erro internal_error',
      resEmpty.status === 500 && resEmpty.body.error === 'internal_error',
    )

    // Subcenário c2: constante antigo do fallback inseguro
    const resLegacyConstant = await handleCreateReportEndpoint(
      { method: 'POST', body: testPayload },
      {
        dbClient: mockDbC,
        rateLimiter: mockRateLimiterPass,
        idGenerator: () => LEGACY_FALLBACK_UUID,
      },
      referenceDate,
    )
    assert(
      suite,
      'Cenário (c2): Gerador retorna antigo UUID constante -> status 500 e erro internal_error',
      resLegacyConstant.status === 500 && resLegacyConstant.body.error === 'internal_error',
    )

    // Subcenário c3: formato incorreto (não UUID)
    const resBadFormat = await handleCreateReportEndpoint(
      { method: 'POST', body: testPayload },
      {
        dbClient: mockDbC,
        rateLimiter: mockRateLimiterPass,
        idGenerator: () => 'not-a-valid-uuid-v4',
      },
      referenceDate,
    )
    assert(
      suite,
      'Cenário (c3): Gerador retorna formato errado -> status 500 e erro internal_error',
      resBadFormat.status === 500 && resBadFormat.body.error === 'internal_error',
    )

    // Subcenário c4: versão não-4 (ex: v1)
    const resBadVersion = await handleCreateReportEndpoint(
      { method: 'POST', body: testPayload },
      {
        dbClient: mockDbC,
        rateLimiter: mockRateLimiterPass,
        idGenerator: () => '11111111-2222-1333-8444-555555555555',
      },
      referenceDate,
    )
    assert(
      suite,
      'Cenário (c4): Gerador retorna UUID v1 -> status 500 e erro internal_error',
      resBadVersion.status === 500 && resBadVersion.body.error === 'internal_error',
    )

    assert(
      suite,
      'Cenário (c): Saídas inválidas -> ZERO inserts no banco acumulados',
      insertsCountC === 0,
    )

    // (d) gerador seguro -> fluxo normal com insert e UUID gravado EXATAMENTE igual ao validado
    let insertsCountD = 0
    let insertedRecordId = ''
    const mockDbD: MockDatabaseClient = {
      findReportByIdempotencyKey: async () => null,
      insertReport: async (data) => {
        insertsCountD++
        insertedRecordId = data.id
        return { id: data.id }
      },
    }

    const validUuidV4Sample = 'f47ac10b-58cc-4372-a567-0e02b2c3d479'
    const resSafe = await handleCreateReportEndpoint(
      { method: 'POST', body: testPayload },
      { dbClient: mockDbD, rateLimiter: mockRateLimiterPass, idGenerator: () => validUuidV4Sample },
      referenceDate,
    )

    assert(
      suite,
      'Cenário (d): Gerador seguro -> status 201 Created',
      resSafe.status === 201 && resSafe.body.success === true,
    )
    assert(suite, 'Cenário (d): Gerador seguro -> 1 insert executado', insertsCountD === 1)
    assert(
      suite,
      'Cenário (d): UUID gravado no banco é EXATAMENTE o validado do gerador',
      insertedRecordId === validUuidV4Sample,
    )
    assert(
      suite,
      'Cenário (d): Corpo de resposta público não expõe reportId nem metadados internos',
      !('reportId' in resSafe.body),
    )

    // Testa generateDefaultReportId no ambiente atual
    try {
      const generatedDefault = generateDefaultReportId()
      assert(
        suite,
        'Cenário (d2): generateDefaultReportId() em runtime produz UUID v4 válido RFC 4122 sem espaços',
        isValidReportId(generatedDefault) &&
          UUID_V4_REGEX.test(generatedDefault) &&
          !/\s/.test(generatedDefault),
      )
    } catch {
      assert(
        suite,
        'Cenário (d2): generateDefaultReportId sem crypto lança erro em conformidade fail-closed',
        true,
      )
    }
  }

  // =========================================================================
  // SUÍTE 5: Gate de Equipe (Staff) Server-Side — Exceções, Retornos Inválidos e Identidade Comprovada
  // =========================================================================
  {
    const suite = 'assertStaffAccessGate — Gate de Equipe Server-Side'

    // 1. Verificador ausente -> Nega (default-deny)
    const noVerifierRes = await assertStaffAccessGate(null, {
      authorizationHeader: 'Bearer fake_token',
    })
    assert(
      suite,
      'Verificador ausente: acesso negado com reason access_denied',
      noVerifierRes.allowed === false && noVerifierRes.reason === 'access_denied',
    )

    // 2. Verificador que LANÇA exceção -> Nega por segurança (fail-closed)
    const crashingVerifier: StaffIdentityVerifier = {
      verifyStaffMembership: async () => {
        throw new Error('Falha de RPC ou timeout no diretório LDAP/Auth')
      },
    }
    const crashRes = await assertStaffAccessGate(crashingVerifier, {
      authorizationHeader: 'Bearer crashing_token',
    })
    assert(
      suite,
      'Verificador que lança exceção: acesso negado sem vazar erro',
      crashRes.allowed === false && crashRes.reason === 'access_denied',
    )

    // 3. Verificador que retorna valor MALFORMADO / INVÁLIDO
    const malformedVerifierA = {
      verifyStaffMembership: async () => null as unknown as { isStaffMember: boolean },
    }
    const malformedResA = await assertStaffAccessGate(malformedVerifierA, {})
    assert(
      suite,
      'Verificador com retorno nulo: negado por retorno inválido',
      malformedResA.allowed === false && malformedResA.reason === 'access_denied',
    )

    const malformedVerifierB = {
      verifyStaffMembership: async () =>
        ({ isStaffMember: 'true' }) as unknown as { isStaffMember: boolean },
    }
    const malformedResB = await assertStaffAccessGate(malformedVerifierB, {})
    assert(
      suite,
      'Verificador com isStaffMember não-boolean: negado',
      malformedResB.allowed === false && malformedResB.reason === 'access_denied',
    )

    // 4. Verificador que retorna isStaffMember: false
    const rejectingVerifier: StaffIdentityVerifier = {
      verifyStaffMembership: async () => ({
        isStaffMember: false,
        errorReason: 'Operador não pertence à equipe',
      }),
    }
    const rejectedRes = await assertStaffAccessGate(rejectingVerifier, {})
    assert(
      suite,
      'Verificador com isStaffMember: false: negado com access_denied',
      rejectedRes.allowed === false && rejectedRes.reason === 'access_denied',
    )

    // 5. EXIGÊNCIA DE IDENTIDADE COMPROVADA NÃO VAZIA
    // 5a. isStaffMember: true mas staffUserId AUSENTE (undefined)
    const noIdVerifier: StaffIdentityVerifier = {
      verifyStaffMembership: async () => ({
        isStaffMember: true,
      }),
    }
    const noIdRes = await assertStaffAccessGate(noIdVerifier, {})
    assert(
      suite,
      'Staff sem staffUserId informado: negado (exige identidade não-vazia)',
      noIdRes.allowed === false && noIdRes.reason === 'access_denied',
    )

    // 5b. staffUserId é string VAZIA ou apenas espaços
    const emptyIdVerifier: StaffIdentityVerifier = {
      verifyStaffMembership: async () => ({
        isStaffMember: true,
        staffUserId: '   ',
      }),
    }
    const emptyIdRes = await assertStaffAccessGate(emptyIdVerifier, {})
    assert(
      suite,
      'Staff com staffUserId vazio/em branco: negado',
      emptyIdRes.allowed === false && emptyIdRes.reason === 'access_denied',
    )

    // 5c. "authenticated" genérico NÃO basta como prova de staff
    const genericAuthVerifier: StaffIdentityVerifier = {
      verifyStaffMembership: async () => ({
        isStaffMember: true,
        staffUserId: 'authenticated',
      }),
    }
    const genericAuthRes = await assertStaffAccessGate(genericAuthVerifier, {})
    assert(
      suite,
      '"authenticated" genérico: expressamente rejeitado como prova de staff',
      genericAuthRes.allowed === false && genericAuthRes.reason === 'access_denied',
    )

    // 5d. Domínio de e-mail / e-mail puro NÃO basta como prova de staff
    const emailDomainVerifier: StaffIdentityVerifier = {
      verifyStaffMembership: async () => ({
        isStaffMember: true,
        staffUserId: '@ferriferriadv.com.br',
      }),
    }
    const emailDomainRes = await assertStaffAccessGate(emailDomainVerifier, {})
    assert(
      suite,
      'Domínio de e-mail puro: expressamente rejeitado como prova de staff',
      emailDomainRes.allowed === false && emailDomainRes.reason === 'access_denied',
    )

    const fullEmailVerifier: StaffIdentityVerifier = {
      verifyStaffMembership: async () => ({
        isStaffMember: true,
        staffUserId: 'operador@ferriferriadv.com.br',
      }),
    }
    const fullEmailRes = await assertStaffAccessGate(fullEmailVerifier, {})
    assert(
      suite,
      'E-mail não basta como identidade de staff comprovada',
      fullEmailRes.allowed === false && fullEmailRes.reason === 'access_denied',
    )

    // 6. Identidade de equipe legítima comprovada e não-vazia -> APROVADO
    const validStaffVerifier: StaffIdentityVerifier = {
      verifyStaffMembership: async () => ({
        isStaffMember: true,
        staffUserId: 'staff_ferri_adv_01',
      }),
    }
    const approvedRes = await assertStaffAccessGate(validStaffVerifier, {
      authorizationHeader: 'Bearer valid_ferri_staff_jwt',
    })
    assert(
      suite,
      'Membro de equipe com identidade comprovada válida: aprovado com ID',
      approvedRes.allowed === true && approvedRes.staffUserId === 'staff_ferri_adv_01',
    )
  }

  const passed = results.filter((r) => r.passed).length
  const failed = results.filter((r) => !r.passed).length

  return {
    total: results.length,
    passed,
    failed,
    results,
  }
}
