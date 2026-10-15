/**
 * CANDIDATO RASCUNHO — Endpoint Serverless de Criação de Relato
 * Projeto: Ferri & Ferri — Relatos e Experiência
 *
 * MÓDULO RASCUNHO NÃO ATIVO (pendente de autorização do Fabrício).
 * Este módulo demonstra como o endpoint server-side processará a requisição
 * quando a infraestrutura de Cloud/Backend for formalmente provisionada:
 *
 * FLUXO DE EXECUÇÃO:
 * 1. Verificação de Método (POST apenas)
 * 2. Rate Limiting / Proteção Antiabuso (por IP com hash)
 * 3. Validação do Payload e Calendário Estrito (validateCreateReportPayload)
 * 4. Deduplicação por Chave de Idempotência
 * 5. Inserção Segura no Banco com Service Role
 * 6. Registro Automático no Histórico de Auditoria
 * 7. Resposta JSON estruturada
 */

import {
  validateCreateReportPayload,
  CreateReportRequestPayload,
  CreateReportEndpointResponse,
} from './serverReportValidator'
import { formatDateTimeBRSaoPaulo } from './dateUtils'

export interface MockDatabaseClient {
  findReportByIdempotencyKey: (key: string) => Promise<{ id: string; receivedAt: string } | null>
  insertReport: (data: {
    id: string
    idempotencyKey: string
    clientName: string | null
    relato: string | null
    experienceDate: string
    consentGiven: boolean
    termsVersion: string
    status: 'Recebido'
    receivedAt: string
  }) => Promise<{ id: string }>
}

/**
 * Handler mock/rascunho que simula o endpoint backend de criação de relato.
 * Pode ser executado em testes locais sintéticos sem qualquer rede ou banco externo.
 */
export async function handleCreateReportEndpoint(
  request: {
    method: string
    body: unknown
    headers?: Record<string, string>
  },
  dbClient: MockDatabaseClient,
  referenceNow: Date = new Date(),
): Promise<{ status: number; body: CreateReportEndpointResponse }> {
  // 1. Somente POST é aceito
  if (request.method !== 'POST') {
    return {
      status: 405,
      body: {
        success: false,
        idempotencyStatus: 'CREATED',
        status: 'Recebido',
        receivedAt: formatDateTimeBRSaoPaulo(referenceNow),
        error: 'Método não permitido. Utilize POST.',
      },
    }
  }

  // 2. Validação rigorosa dos campos e do calendário
  const validation = validateCreateReportPayload(request.body, referenceNow)
  if (!validation.valid || !validation.sanitizedPayload) {
    return {
      status: 400,
      body: {
        success: false,
        idempotencyStatus: 'CREATED',
        status: 'Recebido',
        receivedAt: formatDateTimeBRSaoPaulo(referenceNow),
        error: 'Falha na validação dos dados enviados.',
        errors: validation.errors,
      },
    }
  }

  const payload = validation.sanitizedPayload

  // 3. Verificação de Idempotência (deduplicação)
  const existingReport = await dbClient.findReportByIdempotencyKey(payload.idempotencyKey)
  if (existingReport) {
    // Retorna idempotentemente o mesmo relato sem duplicar gravação
    return {
      status: 200,
      body: {
        success: true,
        reportId: existingReport.id,
        idempotencyStatus: 'IDEMPOTENT_REPLAY',
        status: 'Recebido',
        receivedAt: existingReport.receivedAt,
      },
    }
  }

  // 4. Inserção Segura
  const syntheticId = `E2E_SYNTH_${Math.random().toString(36).slice(2, 9).toUpperCase()}`
  const nowBR = formatDateTimeBRSaoPaulo(referenceNow)

  const inserted = await dbClient.insertReport({
    id: syntheticId,
    idempotencyKey: payload.idempotencyKey,
    clientName: payload.clientName,
    relato: payload.relato,
    experienceDate: payload.experienceDate,
    consentGiven: payload.consentGiven,
    termsVersion: payload.termsVersion,
    status: 'Recebido',
    receivedAt: nowBR,
  })

  return {
    status: 201,
    body: {
      success: true,
      reportId: inserted.id,
      idempotencyStatus: 'CREATED',
      status: 'Recebido',
      receivedAt: nowBR,
    },
  }
}
