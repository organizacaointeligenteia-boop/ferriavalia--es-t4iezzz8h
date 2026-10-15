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
 * Expressão regular estrita para validação de UUID v4 (RFC 4122):
 * 8-4-4-4-12 hexadecimais em caixa baixa ou alta, terceiro grupo iniciado por 4,
 * quarto grupo iniciado por 8, 9, a ou b.
 */
export const UUID_V4_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

/**
 * UUID constante reservado do antigo fallback inseguro.
 * Deve ser expressamente rejeitado para prevenir sobreposição de registros.
 */
export const LEGACY_FALLBACK_UUID = '00000000-0000-4000-8000-000000000000'

/**
 * Validador de integridade para IDs gerados (injetados ou padrão).
 * Rejeita nulos, strings vazias, qualquer valor contendo espaços (sem trim permissivo:
 * se contiver espaço em qualquer posição, início, fim ou meio, é inválido), o UUID constante
 * do fallback antigo e qualquer valor fora do formato RFC 4122 v4 estrito.
 */
export function isValidReportId(id: unknown): id is string {
  if (typeof id !== 'string') return false
  // Rejeição estrita de qualquer espaço (sem validar com trim e persistir original)
  if (/\s/.test(id)) return false
  if (id.length === 0) return false
  if (id.toLowerCase() === LEGACY_FALLBACK_UUID.toLowerCase()) return false
  return UUID_V4_REGEX.test(id)
}

/**
 * Gerador de UUID v4 padrão coerente com o schema da tabela `reports` (id UUID PRIMARY KEY).
 * Usa crypto.randomUUID() ou getRandomValues com ajuste de bits para RFC 4122 v4.
 * POLÍTICA FAIL-CLOSED: se a API Web Crypto não estiver disponível ou confiável,
 * LANÇA ERRO explícito. Nunca retorna valor constante, vazio ou pseudo-aleatório fraco.
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

  throw new Error('Web Crypto API indisponível para geração segura de identificador de relato.')
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

/**
 * Erro de conflito de chave única de idempotência simulado em concorrência.
 */
export class IdempotencyConflictError extends Error {
  constructor(message = 'Conflito de unicidade de chave de idempotência') {
    super(message)
    this.name = 'IdempotencyConflictError'
  }
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
  // Limiter AUSENTE, que LANÇA exceção ou que retorna valor MALFORMADO deve NEGAR
  // ANTES de qualquer escrita/insert; erro público CONSTANTE, sem expor reason/detalhe interno.
  if (!rateLimiter || typeof rateLimiter.checkLimit !== 'function') {
    return {
      status: 429,
      body: {
        success: false,
        error: 'rate_limited',
      },
    }
  }

  const clientIdentifier =
    request.headers?.['x-forwarded-for'] ||
    request.headers?.['x-real-ip'] ||
    request.headers?.['client-ip'] ||
    'anonymous_client'

  try {
    const rateCheck = await rateLimiter.checkLimit(clientIdentifier)
    // Validação estrita do retorno: deve ser objeto não-nulo com propriedade boolean 'allowed' === true
    if (
      !rateCheck ||
      typeof rateCheck !== 'object' ||
      typeof rateCheck.allowed !== 'boolean' ||
      rateCheck.allowed !== true
    ) {
      return {
        status: 429,
        body: {
          success: false,
          error: 'rate_limited',
        },
      }
    }
  } catch {
    // Se o rate limiter lançar qualquer exceção, nega por segurança sem vazar erro interno
    return {
      status: 429,
      body: {
        success: false,
        error: 'rate_limited',
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

  // 4. Verificação de Idempotência (deduplicação) com CONTRATO ATÔMICO E CANÔNICO
  // Tanto no aceite inicial quanto em replay, retorna o MESMO status (201) e MESMO corpo público canônico:
  // { success: true, received: true }. Sem flag de replay, sem reportId, sem estado interno, sem data/receivedAt.
  const existingReport = await dbClient.findReportByIdempotencyKey(payload.idempotencyKey)
  if (existingReport) {
    return {
      status: 201,
      body: {
        success: true,
        received: true,
      },
    }
  }

  // 5. Geração Segura e Validação de ID ANTES da Inserção
  // Captura qualquer falha do idGenerator (exceção ou valor inválido).
  // O UUID validado DEVE SER EXATAMENTE O MESMO usado no insert: validamos `validatedId`
  // e persistimos EXATAMENTE essa variável `validatedId` (sem trim posterior, sem outra variável).
  // Devolve erro público constante "internal_error", sem vazar stack ou detalhes internos.
  let validatedId: string
  try {
    const generated = idGenerator()
    if (!isValidReportId(generated)) {
      return {
        status: 500,
        body: {
          success: false,
          error: 'internal_error',
        },
      }
    }
    validatedId = generated
  } catch {
    return {
      status: 500,
      body: {
        success: false,
        error: 'internal_error',
      },
    }
  }

  const nowBR = formatDateTimeBRSaoPaulo(referenceNow)

  try {
    await dbClient.insertReport({
      id: validatedId, // EXATAMENTE o UUID validado
      idempotencyKey: payload.idempotencyKey,
      clientName: payload.clientName,
      relato: payload.relato,
      experienceDate: payload.experienceDate,
      consentGiven: payload.consentGiven,
      termsVersion: payload.termsVersion,
      status: 'Recebido',
      receivedAt: nowBR,
    })
  } catch (err: unknown) {
    // Tratar conflito concorrente de chave de idempotência (ex: inserção paralela com a mesma chave)
    // Devolve o mesmo corpo público canônico idêntico (status 201, { success: true, received: true })
    const isConflict =
      err instanceof IdempotencyConflictError ||
      (typeof err === 'object' &&
        err !== null &&
        (('code' in err && (err as { code?: unknown }).code === '23505') ||
          ('name' in err && (err as { name?: unknown }).name === 'IdempotencyConflictError') ||
          ('message' in err &&
            typeof (err as { message?: unknown }).message === 'string' &&
            /(idempotency|unique|conflito|duplicate)/i.test((err as { message: string }).message))))

    if (isConflict) {
      return {
        status: 201,
        body: {
          success: true,
          received: true,
        },
      }
    }

    return {
      status: 500,
      body: {
        success: false,
        error: 'internal_error',
      },
    }
  }

  return {
    status: 201,
    body: {
      success: true,
      received: true,
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
  // 1. Verificador ausente -> default-deny estrito com negação antes de qualquer operação
  if (!verifier || typeof verifier.verifyStaffMembership !== 'function') {
    return {
      allowed: false,
      reason: 'access_denied',
    }
  }

  // 2. Proteção contra exceções lançadas pelo verificador (fail-closed)
  let check: {
    isStaffMember: boolean
    staffUserId?: string
    errorReason?: string
  }
  try {
    const rawCheck = await verifier.verifyStaffMembership(credentials)
    // 3. Rejeitar retornos malformados / inválidos (objeto nulo, não-objeto, isStaffMember não-boolean)
    if (!rawCheck || typeof rawCheck !== 'object' || typeof rawCheck.isStaffMember !== 'boolean') {
      return {
        allowed: false,
        reason: 'access_denied',
      }
    }
    check = rawCheck
  } catch {
    return {
      allowed: false,
      reason: 'access_denied',
    }
  }

  if (!check.isStaffMember) {
    return {
      allowed: false,
      reason: 'access_denied',
    }
  }

  // 4. EXIGIR identidade de equipe comprovada NÃO VAZIA.
  // "authenticated" genérico ou domínio de e-mail NÃO bastam como prova de staff.
  // Rejeita undefined, null, string vazia, string só com espaços, "authenticated" genérico
  // e strings no formato de e-mail / domínio de e-mail.
  const rawId = check.staffUserId
  if (typeof rawId !== 'string') {
    return {
      allowed: false,
      reason: 'access_denied',
    }
  }

  const trimmedId = rawId.trim()
  if (trimmedId.length === 0) {
    return {
      allowed: false,
      reason: 'access_denied',
    }
  }

  // Rejeitar papéis genéricos que não constituem identidade comprovada
  if (trimmedId.toLowerCase() === 'authenticated' || trimmedId.toLowerCase() === 'user') {
    return {
      allowed: false,
      reason: 'access_denied',
    }
  }

  // Rejeitar mera indicação de domínio de e-mail ou endereço de e-mail puro como prova de staff
  // ("@ferriferriadv.com.br", "user@ferriferriadv.com.br")
  if (trimmedId.includes('@')) {
    return {
      allowed: false,
      reason: 'access_denied',
    }
  }

  return {
    allowed: true,
    staffUserId: trimmedId,
  }
}
