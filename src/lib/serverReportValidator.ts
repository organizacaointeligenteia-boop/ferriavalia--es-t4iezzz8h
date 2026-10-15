/**
 * CANDIDATO RASCUNHO — Validador Server-Side e Processador de Endpoint
 * Projeto: Ferri & Ferri — Relatos e Experiência
 *
 * MÓDULO RASCUNHO NÃO ATIVO (pendente de autorização do Fabrício).
 * Este módulo reúne a especificação da lógica de criação de relato:
 * 1. Validação estrita de formato de data e calendário (reutiliza dateUtils)
 * 2. Validação de teto de caracteres (nome ≤ 80, relato ≤ 2000)
 * 3. Validação de consentimento voluntário obrigatório
 * 4. Validação de chave de idempotência anti-duplicidade
 * 5. Proteções antiabuso e verificação de integridade sem rede
 */

import { validateDateOnlyString, isFutureDate, DateValidationResult } from './dateUtils'

export interface CreateReportRequestPayload {
  /** Chave de idempotência única gerada no cliente (UUID v4 ou string aleatória de 16 a 128 chars) */
  idempotencyKey: string
  /** Nome ou identificador voluntário opcional (máx 80 caracteres) */
  clientName?: string | null
  /** Relato livre sobre a experiência de acolhimento (máx 2000 caracteres) */
  relato?: string | null
  /** Data da experiência em formato estrito YYYY-MM-DD */
  experienceDate: string
  /** Consentimento obrigatório confirmado na Etapa 1 */
  consentGiven: boolean
  /** Versão dos termos éticos de atendimento aceitos */
  termsVersion: string
}

export interface ValidationErrorDetail {
  field: string
  message: string
}

export interface EndpointValidationResult {
  valid: boolean
  errors: ValidationErrorDetail[]
  sanitizedPayload?: {
    idempotencyKey: string
    clientName: string | null
    relato: string | null
    experienceDate: string
    consentGiven: true
    termsVersion: string
  }
}

/**
 * Validação server-side estrita para submissão de novos relatos.
 * Executada sem dependência de banco de dados ou rede externa.
 */
export function validateCreateReportPayload(
  payload: unknown,
  referenceNow: Date = new Date(),
): EndpointValidationResult {
  const errors: ValidationErrorDetail[] = []

  if (!payload || typeof payload !== 'object') {
    return {
      valid: false,
      errors: [{ field: 'root', message: 'Payload de requisição inválido ou ausente.' }],
    }
  }

  const p = payload as Partial<CreateReportRequestPayload>

  // 1. Chave de Idempotência
  if (typeof p.idempotencyKey !== 'string' || p.idempotencyKey.trim().length === 0) {
    errors.push({
      field: 'idempotencyKey',
      message: 'A chave de idempotência é obrigatória para prevenir submissões duplicadas.',
    })
  } else {
    const trimmedKey = p.idempotencyKey.trim()
    if (trimmedKey.length < 8 || trimmedKey.length > 128) {
      errors.push({
        field: 'idempotencyKey',
        message: 'A chave de idempotência deve conter entre 8 e 128 caracteres.',
      })
    }
  }

  // 2. Consentimento Obrigatório
  if (p.consentGiven !== true) {
    errors.push({
      field: 'consentGiven',
      message: 'O consentimento voluntário prévio e inequívoco é obrigatório (deve ser true).',
    })
  }

  // 3. Versão dos Termos
  if (typeof p.termsVersion !== 'string' || p.termsVersion.trim().length === 0) {
    errors.push({
      field: 'termsVersion',
      message: 'A versão dos termos aceitos deve ser informada.',
    })
  }

  // 4. Nome do Cliente (Opcional, máx 80)
  let cleanName: string | null = null
  if (p.clientName !== undefined && p.clientName !== null) {
    if (typeof p.clientName !== 'string') {
      errors.push({
        field: 'clientName',
        message: 'O nome informado deve ser uma sequência de caracteres válida.',
      })
    } else {
      const trimmed = p.clientName.trim()
      if (trimmed.length > 80) {
        errors.push({
          field: 'clientName',
          message: 'O nome não pode exceder 80 caracteres.',
        })
      } else {
        cleanName = trimmed.length > 0 ? trimmed : null
      }
    }
  }

  // 5. Relato da Experiência (Opcional, máx 2000)
  let cleanRelato: string | null = null
  if (p.relato !== undefined && p.relato !== null) {
    if (typeof p.relato !== 'string') {
      errors.push({
        field: 'relato',
        message: 'O relato informado deve ser uma sequência de texto válida.',
      })
    } else {
      const trimmed = p.relato.trim()
      if (trimmed.length > 2000) {
        errors.push({
          field: 'relato',
          message: 'O relato não pode exceder 2.000 caracteres.',
        })
      } else {
        cleanRelato = trimmed.length > 0 ? trimmed : null
      }
    }
  }

  // 6. Data da Experiência (Obrigatória, estritamente YYYY-MM-DD, calendário gregoriano, sem datas futuras)
  if (typeof p.experienceDate !== 'string' || p.experienceDate.trim().length === 0) {
    errors.push({
      field: 'experienceDate',
      message: 'A data em que ocorreu o atendimento é obrigatória.',
    })
  } else {
    const dateVal: DateValidationResult = validateDateOnlyString(p.experienceDate)
    if (!dateVal.valid) {
      errors.push({
        field: 'experienceDate',
        message: dateVal.error || 'Data da experiência em formato inválido.',
      })
    } else if (isFutureDate(p.experienceDate, referenceNow)) {
      errors.push({
        field: 'experienceDate',
        message: 'A data da experiência não pode ser posterior à data atual (America/Sao_Paulo).',
      })
    }
  }

  if (errors.length > 0) {
    return { valid: false, errors }
  }

  return {
    valid: true,
    errors: [],
    sanitizedPayload: {
      idempotencyKey: (p.idempotencyKey as string).trim(),
      clientName: cleanName,
      relato: cleanRelato,
      experienceDate: p.experienceDate as string,
      consentGiven: true,
      termsVersion: (p.termsVersion as string).trim(),
    },
  }
}

/**
 * Resposta do endpoint de criação de relato quando o backend estiver ativo.
 *
 * BLINDAGEM DE IDEMPOTÊNCIA (v0.0.11):
 * - Em novas criações com sucesso ('CREATED'): retorna received: true, reportId (UUID v4 do relato),
 *   status: 'Recebido', receivedAt e idempotencyStatus.
 * - Em repetições por chave existente ('IDEMPOTENT_REPLAY'): resposta NEUTRA { received: true, success: true }
 *   com idempotencyStatus: 'IDEMPOTENT_REPLAY', SEM reportId, SEM status interno e SEM receivedAt do relato original,
 *   impedindo qualquer vazamento de metadados a quem reutilizar uma chave alheia.
 */
export interface CreateReportEndpointResponse {
  success: boolean
  received?: boolean
  reportId?: string
  idempotencyStatus?: 'CREATED' | 'IDEMPOTENT_REPLAY'
  status?: 'Recebido'
  receivedAt?: string
  error?: string
  errors?: ValidationErrorDetail[]
}
