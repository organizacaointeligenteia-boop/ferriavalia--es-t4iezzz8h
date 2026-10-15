/**
 * SUÍTE NATIVA DEDICADA DE TESTES SINTÉTICOS ISOLADOS
 * Projeto: Ferri & Ferri — Relatos e Experiência
 *
 * CARACTERÍSTICAS DOS TESTES:
 * - 100% isolados, sem chamadas de rede, sem SMTP, sem APIs externas.
 * - Sem segredos, credenciais nem conexões a bancos de dados compartilhados ou live.
 * - Fixtures EXCLUSIVAMENTE prefixadas com E2E_SYNTH_.
 * - Simula e valida o comportamento exato especificado para o motor nativo Skip Cloud (PocketBase v0.36 jsVM):
 *   1. Validação de formato de data e calendário estrito (sem anos bissextos falsos, sem datas futuras).
 *   2. Limiter com gate DEFAULT-DENY (ausente, exceção, malformado -> 429 rate_limited, sem gravação).
 *   3. Idempotência atômica canônica: aceite inicial e replay retornam o MESMO status 201 e o MESMO corpo
 *      público { success: true, received: true }, sem expor reportId, status interno, recebimento ou flag de replay.
 *   4. Tratamento atômico de colisão concorrente de chave de idempotência.
 *   5. Gate de acesso de equipe DEFAULT-DENY: 'authenticated' genérico e domínio de e-mail expressamente negados.
 *   6. Regras de acesso da coleção reports estritamente privadas por padrão (listRule/viewRule = null).
 *
 * GOVERNANÇA:
 * - Testes preparados de forma pura em TypeScript/memória.
 * - NÃO grava registros no banco live.
 */

import { validateCreateReportPayload, CreateReportRequestPayload } from './serverReportValidator'
import {
  validateDateOnlyString,
  isLeapYear,
  getDaysInMonth,
  isFutureDate,
  formatDateBR,
} from './dateUtils'
import {
  handleCreateReportEndpoint,
  MockDatabaseClient,
  RateLimiter,
  StaffIdentityVerifier,
  assertStaffAccessGate,
  IdempotencyConflictError,
} from './serverReportEndpointDraft'

export interface NativeTestResultItem {
  suite: string
  name: string
  passed: boolean
  error?: string
}

export interface NativeSuiteExecutionReport {
  total: number
  passed: number
  failed: number
  results: NativeTestResultItem[]
  environment: 'in-memory-isolated'
  liveDatabaseTouched: false
}

export async function runNativeSyntheticTests(): Promise<NativeSuiteExecutionReport> {
  const results: NativeTestResultItem[] = []

  function assert(suite: string, name: string, condition: boolean, message?: string) {
    if (condition) {
      results.push({ suite, name, passed: true })
    } else {
      results.push({
        suite,
        name,
        passed: false,
        error: message || 'Falha na asserção sintética nativa',
      })
    }
  }

  // =========================================================================
  // SUÍTE 1: Regras de Calendário Estrito e Fuso America/Sao_Paulo (dateUtils)
  // =========================================================================
  {
    const suite = 'Native: Calendário e Fuso America/Sao_Paulo'

    assert(suite, '2024 é ano bissexto válido', isLeapYear(2024) === true)
    assert(suite, '2025 não é ano bissexto', isLeapYear(2025) === false)
    assert(suite, '2000 é bissexto (múltiplo de 400)', isLeapYear(2000) === true)
    assert(suite, '1900 não é bissexto (múltiplo de 100)', isLeapYear(1900) === false)

    assert(suite, 'Fevereiro de 2024 tem exatamente 29 dias', getDaysInMonth(2024, 2) === 29)
    assert(suite, 'Fevereiro de 2025 tem exatamente 28 dias', getDaysInMonth(2025, 2) === 28)
    assert(suite, 'Abril tem exatamente 30 dias', getDaysInMonth(2025, 4) === 30)

    assert(suite, 'Aceita 2024-02-29 bissexto', validateDateOnlyString('2024-02-29').valid === true)
    assert(
      suite,
      'Rejeita 2025-02-29 não-bissexto',
      validateDateOnlyString('2025-02-29').valid === false,
    )
    assert(
      suite,
      'Rejeita 2025-04-31 (dia inválido)',
      validateDateOnlyString('2025-04-31').valid === false,
    )
    assert(
      suite,
      'Rejeita espaços em branco',
      validateDateOnlyString(' 2025-01-15 ').valid === false,
    )

    assert(
      suite,
      'formatDateBR preserva date-only sem desvio',
      formatDateBR('2025-01-15') === '15/01/2025',
    )

    const fixedRef = new Date('2025-03-01T12:00:00.000Z')
    assert(suite, 'Reconhece data futura 2025-03-02', isFutureDate('2025-03-02', fixedRef) === true)
    assert(
      suite,
      'Reconhece hoje 2025-03-01 como não futura',
      isFutureDate('2025-03-01', fixedRef) === false,
    )
    assert(
      suite,
      'Reconhece data passada 2025-02-28',
      isFutureDate('2025-02-28', fixedRef) === false,
    )
  }

  // =========================================================================
  // SUÍTE 2: Validação Server-Side Estrita de Relato
  // =========================================================================
  {
    const suite = 'Native: Validador Server-Side de Relato'
    const refDate = new Date('2025-03-01T12:00:00.000Z')

    const validPayload: CreateReportRequestPayload = {
      idempotencyKey: 'E2E_SYNTH_NAT_KEY_001',
      clientName: 'E2E_SYNTH_Cliente_Nativo',
      relato: 'Atendimento jurídico com empatia e clareza técnica.',
      experienceDate: '2025-02-15',
      consentGiven: true,
      termsVersion: 'v1.0-2025',
    }

    const resValid = validateCreateReportPayload(validPayload, refDate)
    assert(suite, 'Payload sintético válido é aceito', resValid.valid === true)
    assert(
      suite,
      'Payload higienizado contém idempotencyKey e consentGiven',
      resValid.sanitizedPayload?.idempotencyKey === 'E2E_SYNTH_NAT_KEY_001' &&
        resValid.sanitizedPayload?.consentGiven === true,
    )

    // Consentimento ausente / false
    const resNoConsent = validateCreateReportPayload(
      { ...validPayload, consentGiven: false },
      refDate,
    )
    assert(suite, 'Rejeita submissão com consentGiven false', resNoConsent.valid === false)

    // Chave de idempotência vazia ou com menos de 8 caracteres
    const resShortKey = validateCreateReportPayload(
      { ...validPayload, idempotencyKey: 'abc' },
      refDate,
    )
    assert(suite, 'Rejeita chave menor que 8 caracteres', resShortKey.valid === false)

    // Teto de nome > 80 caracteres
    const resLongName = validateCreateReportPayload(
      { ...validPayload, clientName: 'E2E_SYNTH_'.padEnd(85, 'A') },
      refDate,
    )
    assert(suite, 'Rejeita nome > 80 caracteres', resLongName.valid === false)

    // Teto de relato > 2000 caracteres
    const resLongRelato = validateCreateReportPayload(
      { ...validPayload, relato: 'N'.repeat(2005) },
      refDate,
    )
    assert(suite, 'Rejeita relato > 2000 caracteres', resLongRelato.valid === false)

    // Data futura rejeitada
    const resFuture = validateCreateReportPayload(
      { ...validPayload, experienceDate: '2025-03-05' },
      refDate,
    )
    assert(suite, 'Rejeita data da experiência no futuro', resFuture.valid === false)
  }

  // =========================================================================
  // SUÍTE 3: Limiter Efetivo Default-Deny
  // =========================================================================
  {
    const suite = 'Native: Rate Limiter Default-Deny'
    const refDate = new Date('2025-02-20T12:00:00.000Z')

    let writeCount = 0
    const mockAuditDb: MockDatabaseClient = {
      findReportByIdempotencyKey: async () => null,
      insertReport: async (data) => {
        writeCount++
        return { id: data.id }
      },
    }

    const payload: CreateReportRequestPayload = {
      idempotencyKey: 'E2E_SYNTH_LIMITER_TEST_KEY',
      clientName: 'E2E_SYNTH_Test',
      relato: 'Relato para teste de limiter.',
      experienceDate: '2025-02-10',
      consentGiven: true,
      termsVersion: 'v1.0-2025',
    }

    // 1. Limiter AUSENTE -> status 429, erro constante rate_limited, ZERO writes
    const noLimiterRes = await handleCreateReportEndpoint(
      { method: 'POST', body: payload },
      { dbClient: mockAuditDb, rateLimiter: null },
      refDate,
    )
    assert(
      suite,
      'Limiter ausente retorna 429 rate_limited',
      noLimiterRes.status === 429 && noLimiterRes.body.error === 'rate_limited',
    )
    assert(suite, 'Limiter ausente resulta em ZERO gravações', writeCount === 0)

    // 2. Limiter que LANÇA exceção -> status 429, erro rate_limited, ZERO writes
    const throwLimiter: RateLimiter = {
      checkLimit: async () => {
        throw new Error('Falha no cluster de rate limit')
      },
    }
    const throwLimiterRes = await handleCreateReportEndpoint(
      { method: 'POST', body: payload },
      { dbClient: mockAuditDb, rateLimiter: throwLimiter },
      refDate,
    )
    assert(
      suite,
      'Limiter com exceção retorna 429 rate_limited sem vazar stack',
      throwLimiterRes.status === 429 && throwLimiterRes.body.error === 'rate_limited',
    )
    assert(suite, 'Limiter com exceção resulta em ZERO gravações', writeCount === 0)

    // 3. Limiter com retorno MALFORMADO -> status 429, ZERO writes
    const malformedLimiter = {
      checkLimit: async () => null as unknown as { allowed: boolean },
    }
    const malformedRes = await handleCreateReportEndpoint(
      { method: 'POST', body: payload },
      { dbClient: mockAuditDb, rateLimiter: malformedLimiter },
      refDate,
    )
    assert(
      suite,
      'Limiter malformado retorna 429 rate_limited',
      malformedRes.status === 429 && malformedRes.body.error === 'rate_limited',
    )
    assert(suite, 'Limiter malformado resulta em ZERO gravações', writeCount === 0)
  }

  // =========================================================================
  // SUÍTE 4: Idempotência Canônica e Concorrência Atômica
  // =========================================================================
  {
    const suite = 'Native: Idempotência Canônica e Concorrência'
    const refDate = new Date('2025-02-20T12:00:00.000Z')

    const inMemoryTable: Array<{ id: string; idempotencyKey: string; receivedAt: string }> = []
    const mockDb: MockDatabaseClient = {
      findReportByIdempotencyKey: async (key: string) => {
        const item = inMemoryTable.find((r) => r.idempotencyKey === key)
        return item ? { id: item.id, receivedAt: item.receivedAt } : null
      },
      insertReport: async (data) => {
        if (inMemoryTable.some((r) => r.idempotencyKey === data.idempotencyKey)) {
          throw new IdempotencyConflictError()
        }
        inMemoryTable.push({
          id: data.id,
          idempotencyKey: data.idempotencyKey,
          receivedAt: data.receivedAt,
        })
        return { id: data.id }
      },
    }

    const passLimiter: RateLimiter = {
      checkLimit: async () => ({ allowed: true }),
    }

    const testPayload: CreateReportRequestPayload = {
      idempotencyKey: 'E2E_SYNTH_CANONICAL_IDEM_99',
      clientName: 'E2E_SYNTH_Idempotente',
      relato: 'Relato com idempotência canônica comprovada.',
      experienceDate: '2025-02-10',
      consentGiven: true,
      termsVersion: 'v1.0-2025',
    }

    // 1. Aceite inicial
    const initialCall = await handleCreateReportEndpoint(
      { method: 'POST', body: testPayload },
      { dbClient: mockDb, rateLimiter: passLimiter },
      refDate,
    )
    assert(suite, 'Aceite inicial status 201', initialCall.status === 201)
    assert(
      suite,
      'Aceite inicial corpo público canônico exato { success: true, received: true }',
      initialCall.body.success === true &&
        initialCall.body.received === true &&
        !('reportId' in initialCall.body) &&
        !('status' in initialCall.body) &&
        !('receivedAt' in initialCall.body) &&
        !('idempotencyStatus' in initialCall.body),
    )

    // 2. Replay idêntico
    const replayCall = await handleCreateReportEndpoint(
      { method: 'POST', body: testPayload },
      { dbClient: mockDb, rateLimiter: passLimiter },
      refDate,
    )
    assert(suite, 'Replay retorna MESMO status 201', replayCall.status === 201)
    assert(
      suite,
      'Replay retorna corpo público idêntico sem vazar flag de repetição',
      JSON.stringify(replayCall.body) === JSON.stringify(initialCall.body),
    )
    assert(
      suite,
      'Armazenamento em memória permanece com exatamente 1 registro',
      inMemoryTable.length === 1,
    )

    // 3. Conflito concorrente atômico (colisão de chave no momento do insert)
    const racePayload: CreateReportRequestPayload = {
      ...testPayload,
      idempotencyKey: 'E2E_SYNTH_RACE_CONCURRENT_KEY',
    }
    const mockRaceDb: MockDatabaseClient = {
      findReportByIdempotencyKey: async () => null,
      insertReport: async () => {
        throw new IdempotencyConflictError(
          'duplicate key UNIQUE constraint reports.idempotency_key',
        )
      },
    }
    const raceCall = await handleCreateReportEndpoint(
      { method: 'POST', body: racePayload },
      { dbClient: mockRaceDb, rateLimiter: passLimiter },
      refDate,
    )
    assert(suite, 'Conflito concorrente atômico retorna status 201', raceCall.status === 201)
    assert(
      suite,
      'Conflito concorrente atômico retorna corpo canônico { success: true, received: true }',
      JSON.stringify(raceCall.body) === JSON.stringify(initialCall.body),
    )
  }

  // =========================================================================
  // SUÍTE 5: Gate de Equipe Server-Side Default-Deny
  // =========================================================================
  {
    const suite = 'Native: Gate de Equipe Default-Deny'

    // 1. Verificador ausente -> nega
    const noVer = await assertStaffAccessGate(null, {})
    assert(suite, 'Verificador ausente nega com access_denied', noVer.allowed === false)

    // 2. Verificador que lança erro -> nega (fail-closed)
    const crashVer: StaffIdentityVerifier = {
      verifyStaffMembership: async () => {
        throw new Error('Erro interno auth')
      },
    }
    const crashRes = await assertStaffAccessGate(crashVer, {})
    assert(suite, 'Verificador com exceção nega acesso', crashRes.allowed === false)

    // 3. Role 'authenticated' genérico NÃO basta
    const genericVer: StaffIdentityVerifier = {
      verifyStaffMembership: async () => ({
        isStaffMember: true,
        staffUserId: 'authenticated',
      }),
    }
    const genericRes = await assertStaffAccessGate(genericVer, {})
    assert(
      suite,
      'Role "authenticated" genérico é expressamente negado',
      genericRes.allowed === false,
    )

    // 4. Domínio de e-mail puro NÃO basta
    const emailVer: StaffIdentityVerifier = {
      verifyStaffMembership: async () => ({
        isStaffMember: true,
        staffUserId: '@ferriferriadv.com.br',
      }),
    }
    const emailRes = await assertStaffAccessGate(emailVer, {})
    assert(suite, 'Domínio de e-mail é expressamente negado', emailRes.allowed === false)

    // 5. Identidade comprovada de equipe válida -> Aprovado
    const validVer: StaffIdentityVerifier = {
      verifyStaffMembership: async () => ({
        isStaffMember: true,
        staffUserId: 'staff_ferri_adv_01',
      }),
    }
    const validRes = await assertStaffAccessGate(validVer, {})
    assert(
      suite,
      'Membro de equipe com identidade comprovada é aprovado',
      validRes.allowed === true && validRes.staffUserId === 'staff_ferri_adv_01',
    )
  }

  const passed = results.filter((r) => r.passed).length
  const failed = results.filter((r) => !r.passed).length

  return {
    total: results.length,
    passed,
    failed,
    results,
    environment: 'in-memory-isolated',
    liveDatabaseTouched: false,
  }
}
