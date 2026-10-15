/**
 * CANDIDATO RASCUNHO — Endpoint Serverless de Criação de Relato
 * Projeto: Ferri & Ferri — Relatos e Experiência
 *
 * MÓDULO RASCUNHO NÃO ATIVO (pendente de autorização do Fabrício).
 * Este módulo demonstra como o endpoint server-side processará a requisição
 * quando a infraestrutura de Cloud/Backend for formalmente provisionada:
 *
 * FLUXO DE EXECUÇÃO E SEGURANÇA:
 * 1. Verificação de Método (POST apenas)
 * 2. Rate Limiting com Gate Default-Deny (recusa se limiter ausente ou excedido)
 * 3. Validação do Payload e Calendário Estrito (validateCreateReportPayload)
 * 4. Deduplicação por Chave de Idempotência com Resposta Neutra (sem vazamento de metadados)
 * 5. Identificador de Registro via Gerador Injetável (crypto.randomUUID() ou UUID v4 seguro)
 * 6. Inserção Segura no Banco
 * 7. Resposta JSON estruturada
 *
 * ADVERTÊNCIA: Sem SDK de banco, sem Supabase, sem Skip Cloud nesta rodada.
 */

import { validateCreateReportPayload, CreateReportEndpointResponse } from './serverReportValidator'
import { formatDateTimeBRSaoPaulo } from './dateUtils'

/**
 * Interface injetável para rate limiter server-side.
 * Implementa controle antiabuso sem amarrar a runtime específico.
 */
export interface RateLimiter {
  /**
   * Avalia se a requisição sob a chave identificadora (ex.: hash seguro do IP/cliente)
   * é permitida na janela de tempo atual.
   * Retorna allowed: true se permitido, ou false com detalhes de bloqueio/retryAfterSeconds.
   */
  checkLimit: (identifierKey: string) => Promise<{
    allowed: boolean
    remainingRequests?: number
    retryAfterSeconds?: number
    reason?: string
  }>
}

/**
 * Interface injetável para verificação de identidade e pertinência à equipe do escritório.
 * Substitui o padrão inseguro `auth.role() = 'authenticated'`.
 * Na ausência de mecanismo real, o sistema deve operar em default-deny estrito.
 */
export interface StaffIdentityVerifier {
  /**
   * Avalia as credenciais/tokens da requisição e verifica se o operador é membro confirmado da equipe.
   */
  verifyStaffMembership: (credentials: {
    authorizationHeader?: string
    clientContext?: Record<string, unknown>
  }) => Promise<{
    isStaffMember: boolean
    staffUserId?: string
    errorReason?: string
  }>
}

/**
 * Interface para geração injetável de identificadores primários (UUID v4 do schema).
 */
export type IdGenerator = () => string

/**
 * Gerador de UUID v4 padrão coerente com o schema da tabela `reports` (id UUID PRIMARY KEY).
 * Usa crypto.randomUUID() quando disponível no ambiente ou fallback criptograficamente seguro via getRandomValues.
 */
export function generateDefaultReportId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }

  if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
    const bytes = new Uint8Array(16)
    crypto.getRandomValues(bytes)
    // Ajustar bits para UUID v4 (RFC 4122)
    bytes[6] = (bytes[6] & 0x0f) | 0x40 // versão 4
    bytes[8] = (bytes[8] & 0x3f) | 0x80 // variante RFC 4122
    const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`
  }

  // Fallback em caso extremo sem Web Crypto (não produtivo)
  return '00000000-0000-4000-8000-000000000000'
}

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

export interface CreateReportEndpointDependencies {
  /** Cliente de banco injetável */
  dbClient: MockDatabaseClient
  /**
   * Rate Limiter obrigatório com política default-deny:
   * se rateLimiter for undefined ou null, o endpoint RECUSA a requisição (status 503).
   */
  rateLimiter?: RateLimiter | null
  /**
   * Gerador de ID único primário (padrão: UUID v4 compatível com o schema).
   */
  idGenerator?: IdGenerator
  /**
   * Verificador opcional de equipe server-side (utilizado em rotas administrativas/revisão interna).
   */
  staffVerifier?: StaffIdentityVerifier | null
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
  dependencies: MockDatabaseClient | CreateReportEndpointDependencies,
  referenceNow: Date = new Date(),
): Promise<{ status: number; body: CreateReportEndpointResponse }> {
  // Compatibilidade com chamada passando dbClient diretamente
  const deps: CreateReportEndpointDependencies =
    typeof (dependencies as MockDatabaseClient).insertReport === 'function'
      ? { dbClient: dependencies as MockDatabaseClient }
      : (dependencies as CreateReportEndpointDependencies)

  const { dbClient, rateLimiter, idGenerator = generateDefaultReportId } = deps

  // 1. Somente POST é aceito
  if (request.method !== 'POST') {
    return {
      status: 405,
      body: {
        success: false,
        error: 'Método não permitido. Utilize POST.',
      },
    }
  }

  // 2. Rate Limiting EFETIVO com Gate DEFAULT-DENY
  // Se nenhum rateLimiter for configurado/injetado, RECUSAR a requisição por padrão de segurança
  if (!rateLimiter) {
    return {
      status: 503,
      body: {
        success: false,
        error:
          'Proteção contra abuso não configurada. Requisição recusada por política default-deny.',
      },
    }
  }

  const clientIdentifier =
    request.headers?.['x-forwarded-for'] ||
    request.headers?.['x-real-ip'] ||
    request.headers?.['client-ip'] ||
    'anonymous_client'

  const rateCheck = await rateLimiter.checkLimit(clientIdentifier)
  if (!rateCheck.allowed) {
    return {
      status: 429,
      body: {
        success: false,
        error: rateCheck.reason || 'Limite de requisições excedido. Tente novamente mais tarde.',
      },
    }
  }

  // 3. Validação rigorosa dos campos e do calendário
  const validation = validateCreateReportPayload(request.body, referenceNow)
  if (!validation.valid || !validation.sanitizedPayload) {
    return {
      status: 400,
      body: {
        success: false,
        error: 'Falha na validação dos dados enviados.',
        errors: validation.errors,
      },
    }
  }

  const payload = validation.sanitizedPayload

  // 4. Verificação de Idempotência (deduplicação) com RESPOSTA NEUTRA
  // Não retornar reportId, status interno nem receivedAt do relato original para não vazar metadados
  const existingReport = await dbClient.findReportByIdempotencyKey(payload.idempotencyKey)
  if (existingReport) {
    return {
      status: 200,
      body: {
        success: true,
        received: true,
        idempotencyStatus: 'IDEMPOTENT_REPLAY',
      },
    }
  }

  // 5. Inserção Segura com ID UUID v4 do gerador injetável
  const reportId = idGenerator()
  const nowBR = formatDateTimeBRSaoPaulo(referenceNow)

  const inserted = await dbClient.insertReport({
    id: reportId,
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
      received: true,
      reportId: inserted.id,
      idempotencyStatus: 'CREATED',
      status: 'Recebido',
      receivedAt: nowBR,
    },
  }
}

/**
 * Gate helper para verificação de equipe server-side com default-deny.
 * Rejeita imediatamente por padrão caso nenhum verificador seja fornecido.
 */
export async function assertStaffAccessGate(
  verifier: StaffIdentityVerifier | null | undefined,
  credentials: {
    authorizationHeader?: string
    clientContext?: Record<string, unknown>
  },
): Promise<{ allowed: boolean; staffUserId?: string; reason?: string }> {
  if (!verifier) {
    return {
      allowed: false,
      reason:
        'Mecanismo de verificação de equipe não configurado no servidor. Acesso negado por default-deny.',
    }
  }

  const check = await verifier.verifyStaffMembership(credentials)
  if (!check.isStaffMember) {
    return {
      allowed: false,
      reason: check.errorReason || 'Acesso negado: operador não é membro verificado da equipe.',
    }
  }

  return {
    allowed: true,
    staffUserId: check.staffUserId,
  }
}
