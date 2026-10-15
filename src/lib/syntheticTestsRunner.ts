/**
 * SUÍTE DE TESTES SINTÉTICOS UNITÁRIOS E ISOLADOS
 * Projeto: Ferri & Ferri — Relatos e Experiência
 *
 * CARACTERÍSTICAS DOS TESTES:
 * - 100% isolados da rede, sem internet, sem SMTP, sem APIs externas.
 * - Sem segredos, credenciais ou conexões a bancos de dados compartilhados.
 * - Exclusivamente fixtures com prefixo E2E_SYNTH_.
 * - Valida regras de negócio do validador server-side, idempotência e calendário date-only.
 * - Pode ser executado em runtime Node/tsx/Vite ou importado programaticamente.
 */

import { validateCreateReportPayload, CreateReportRequestPayload } from './serverReportValidator'
import { handleCreateReportEndpoint, MockDatabaseClient } from './serverReportEndpointDraft'
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
  // SUÍTE 3: Endpoint Serverless — Idempotência e Gravação Simulada
  // =========================================================================
  {
    const suite = 'serverReportEndpointDraft — Idempotência e Execução'
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
        memoryStore.push({
          id: data.id,
          idempotencyKey: data.idempotencyKey,
          receivedAt: data.receivedAt,
        })
        return { id: data.id }
      },
    }

    const testPayload: CreateReportRequestPayload = {
      idempotencyKey: 'E2E_SYNTH_UNIQUE_KEY_999',
      clientName: 'E2E_SYNTH_Constituinte_Voluntario',
      relato: 'Excelente clareza sobre os prazos.',
      experienceDate: '2025-02-10',
      consentGiven: true,
      termsVersion: 'v1.0-2025',
    }

    // 1º Envio -> Deve criar (201, status CREATED)
    const firstCall = await handleCreateReportEndpoint(
      { method: 'POST', body: testPayload },
      mockDb,
      referenceDate,
    )
    assert(suite, 'Primeiro envio retorna status 201 Created', firstCall.status === 201)
    assert(
      suite,
      'Primeiro envio tem idempotencyStatus CREATED',
      firstCall.body.idempotencyStatus === 'CREATED',
    )
    assert(
      suite,
      'Registro recebeu id sintético prefixado',
      typeof firstCall.body.reportId === 'string' &&
        firstCall.body.reportId.startsWith('E2E_SYNTH_'),
    )

    const createdId = firstCall.body.reportId

    // 2º Envio idêntico (mesma idempotencyKey) -> Deve reexibir sem duplicar (200, IDEMPOTENT_REPLAY)
    const secondCall = await handleCreateReportEndpoint(
      { method: 'POST', body: testPayload },
      mockDb,
      referenceDate,
    )
    assert(suite, 'Segundo envio idêntico retorna status 200 OK', secondCall.status === 200)
    assert(
      suite,
      'Segundo envio tem idempotencyStatus IDEMPOTENT_REPLAY',
      secondCall.body.idempotencyStatus === 'IDEMPOTENT_REPLAY',
    )
    assert(
      suite,
      'Segundo envio retorna o mesmo reportId do primeiro',
      secondCall.body.reportId === createdId,
    )
    assert(
      suite,
      'Banco em memória não foi duplicado (apenas 1 registro gravado)',
      memoryStore.length === 1,
    )

    // Envio com Método Não Permitido (GET)
    const getCall = await handleCreateReportEndpoint(
      { method: 'GET', body: null },
      mockDb,
      referenceDate,
    )
    assert(suite, 'Requisição GET retorna status 405 Method Not Allowed', getCall.status === 405)
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
