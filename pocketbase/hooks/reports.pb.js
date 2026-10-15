/**
 * CANDIDATO NATIVO EXCLUSIVO — Endpoint de Criação de Relatos
 * Rota: POST /backend/v1/reports
 * Projeto: Ferri & Ferri — Relatos e Experiência
 *
 * Motor/Runtime: Skip Cloud (PocketBase v0.36 jsVM / Goja).
 *
 * FLUXO DE SEGURANÇA E EXECUÇÃO:
 * 1. Somente método POST é aceito.
 * 2. Rate Limiting EFETIVO com Gate DEFAULT-DENY:
 *    - Rejeita com status 429 e erro constante 'rate_limited' sem vazar motivos internos.
 * 3. Validação estrita de campos, tamanho de caracteres e calendário (date-only, ano bissexto, sem datas futuras).
 * 4. Idempotência atômica canônica:
 *    - Aceite inicial e replay retornam o MESMO status (201) e o MESMO corpo canônico:
 *      { "success": true, "received": true }
 *    - Sem vazamento de reportId, status interno, timestamp de criação ou flag de replay.
 *    - Tratamento atômico de colisão em concorrência.
 * 5. Identificador gerado server-side com $security.randomString(15) padrão do PocketBase.
 * 6. Gate de acesso de equipe DEFAULT-DENY:
 *    - Avaliações são estritamente privadas por padrão (listRule/viewRule = null).
 *    - Usuários genéricos autenticados (@request.auth.id != '') e domínios de e-mail NÃO bastam.
 */

// Armazenamento em memória do limiter server-side com expiração por janela
var _rateLimitStore = {}
var RATE_LIMIT_WINDOW_MS = 60000 // 1 minuto
var RATE_LIMIT_MAX_REQUESTS = 10 // 10 requisições por janela

function checkRateLimit(clientIp) {
  if (!clientIp || typeof clientIp !== 'string') {
    return false // default-deny se identificador for inválido
  }

  var now = Date.now()
  var entry = _rateLimitStore[clientIp]

  if (!entry || now - entry.windowStart > RATE_LIMIT_WINDOW_MS) {
    _rateLimitStore[clientIp] = {
      windowStart: now,
      count: 1,
    }
    return true
  }

  if (entry.count >= RATE_LIMIT_MAX_REQUESTS) {
    return false
  }

  entry.count++
  return true
}

function isLeapYear(year) {
  if (year <= 0) return false
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0
}

function getDaysInMonth(year, month) {
  if (month < 1 || month > 12) return 0
  var days = [31, isLeapYear(year) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
  return days[month - 1]
}

function validateDateOnlyString(str) {
  if (typeof str !== 'string') return false
  var regex = /^(\d{4})-(\d{2})-(\d{2})$/
  var match = regex.exec(str)
  if (!match) return false

  var year = parseInt(match[1], 10)
  var month = parseInt(match[2], 10)
  var day = parseInt(match[3], 10)

  if (year < 1900 || year > 2100) return false
  if (month < 1 || month > 12) return false

  var maxDays = getDaysInMonth(year, month)
  if (day < 1 || day > maxDays) return false

  return true
}

function getTodaySaoPauloString() {
  // Ajuste explícito para UTC-3 (America/Sao_Paulo padrão civil sem DST)
  var now = new Date()
  var spOffset = -3 * 60 // minutos
  var utcMinutes = now.getTime() + now.getTimezoneOffset() * 60000
  var spDate = new Date(utcMinutes + spOffset * 60000)

  var y = spDate.getFullYear()
  var m = String(spDate.getMonth() + 1).padStart(2, '0')
  var d = String(spDate.getDate()).padStart(2, '0')
  return y + '-' + m + '-' + d
}

function formatNowSaoPauloString() {
  var now = new Date()
  var spOffset = -3 * 60
  var utcMinutes = now.getTime() + now.getTimezoneOffset() * 60000
  var spDate = new Date(utcMinutes + spOffset * 60000)

  var y = spDate.getFullYear()
  var m = String(spDate.getMonth() + 1).padStart(2, '0')
  var d = String(spDate.getDate()).padStart(2, '0')
  var h = String(spDate.getHours()).padStart(2, '0')
  var min = String(spDate.getMinutes()).padStart(2, '0')
  return d + '/' + m + '/' + y + ' às ' + h + ':' + min + ' (America/Sao_Paulo)'
}

routerAdd('POST', '/backend/v1/reports', (e) => {
  // 1. Limiter efetivo com default-deny
  var clientIp = e.realIP() || e.remoteIP()
  try {
    if (!checkRateLimit(clientIp)) {
      return e.json(429, {
        success: false,
        error: 'rate_limited',
      })
    }
  } catch (_) {
    return e.json(429, {
      success: false,
      error: 'rate_limited',
    })
  }

  // 2. Extração do corpo
  var body = {}
  try {
    body = e.requestInfo().body || {}
  } catch (_) {
    body = {}
  }

  var idempotencyKey = body.idempotencyKey
  var consentGiven = body.consentGiven
  var termsVersion = body.termsVersion
  var experienceDate = body.experienceDate
  var clientName = body.clientName
  var relato = body.relato

  var validationErrors = []

  // Validação de chave de idempotência
  if (typeof idempotencyKey !== 'string' || idempotencyKey.trim().length === 0) {
    validationErrors.push({
      field: 'idempotencyKey',
      message: 'Chave de idempotência é obrigatória.',
    })
  } else {
    var trimmedKey = idempotencyKey.trim()
    if (trimmedKey.length < 8 || trimmedKey.length > 128) {
      validationErrors.push({
        field: 'idempotencyKey',
        message: 'Chave de idempotência deve ter entre 8 e 128 caracteres.',
      })
    }
  }

  // Validação de consentimento
  if (consentGiven !== true) {
    validationErrors.push({
      field: 'consentGiven',
      message: 'Consentimento voluntário obrigatório (deve ser true).',
    })
  }

  // Validação de termos
  if (typeof termsVersion !== 'string' || termsVersion.trim().length === 0) {
    validationErrors.push({
      field: 'termsVersion',
      message: 'Versão dos termos é obrigatória.',
    })
  }

  // Validação de clientName (opcional, máx 80)
  var cleanName = null
  if (clientName !== undefined && clientName !== null) {
    if (typeof clientName !== 'string') {
      validationErrors.push({
        field: 'clientName',
        message: 'Nome deve ser texto.',
      })
    } else {
      var tName = clientName.trim()
      if (tName.length > 80) {
        validationErrors.push({
          field: 'clientName',
          message: 'Nome não pode exceder 80 caracteres.',
        })
      } else if (tName.length > 0) {
        cleanName = tName
      }
    }
  }

  // Validação de relato (opcional, máx 2000)
  var cleanRelato = null
  if (relato !== undefined && relato !== null) {
    if (typeof relato !== 'string') {
      validationErrors.push({
        field: 'relato',
        message: 'Relato deve ser texto.',
      })
    } else {
      var tRelato = relato.trim()
      if (tRelato.length > 2000) {
        validationErrors.push({
          field: 'relato',
          message: 'Relato não pode exceder 2.000 caracteres.',
        })
      } else if (tRelato.length > 0) {
        cleanRelato = tRelato
      }
    }
  }

  // Validação de data da experiência
  if (typeof experienceDate !== 'string' || experienceDate.trim().length === 0) {
    validationErrors.push({
      field: 'experienceDate',
      message: 'Data da experiência é obrigatória.',
    })
  } else {
    var trimmedDate = experienceDate.trim()
    if (!validateDateOnlyString(trimmedDate)) {
      validationErrors.push({
        field: 'experienceDate',
        message: 'Data em formato de calendário inválido (use AAAA-MM-DD).',
      })
    } else {
      var todaySp = getTodaySaoPauloString()
      if (trimmedDate > todaySp) {
        validationErrors.push({
          field: 'experienceDate',
          message: 'A data da experiência não pode ser posterior à data atual (America/Sao_Paulo).',
        })
      }
    }
  }

  if (validationErrors.length > 0) {
    return e.json(400, {
      success: false,
      error: 'Falha na validação dos dados enviados.',
      errors: validationErrors,
    })
  }

  var sanitizedKey = idempotencyKey.trim()

  // 3. Verificação de replay de idempotência
  try {
    var existing = e.app.findFirstRecordByData('reports', 'idempotency_key', sanitizedKey)
    if (existing) {
      // Replay canônico idêntico: 201 Created com { success: true, received: true }
      return e.json(201, {
        success: true,
        received: true,
      })
    }
  } catch (_) {
    // Record não existe, continua para inserção
  }

  // 4. Inserção atômica
  try {
    var collection = e.app.findCollectionByNameOrId('reports')
    var record = new Record(collection)

    record.set('idempotency_key', sanitizedKey)
    record.set('client_name', cleanName)
    record.set('relato', cleanRelato)
    record.set('experience_date', experienceDate.trim())
    record.set('consent_given', true)
    record.set('terms_version', termsVersion.trim())
    record.set('status', 'recebido')
    record.set('received_at_sp', formatNowSaoPauloString())
    record.set(
      'audit_history',
      JSON.stringify([
        {
          action: 'criado_via_coleta',
          timestamp_sp: formatNowSaoPauloString(),
          actor: 'public_submission',
        },
      ]),
    )

    e.app.save(record)

    return e.json(201, {
      success: true,
      received: true,
    })
  } catch (err) {
    // Conflito atômico de unicidade concorrente
    var errMsg = err ? err.message || String(err) : ''
    if (errMsg.indexOf('UNIQUE') !== -1 || errMsg.indexOf('idempotency_key') !== -1) {
      return e.json(201, {
        success: true,
        received: true,
      })
    }

    return e.json(500, {
      success: false,
      error: 'internal_error',
    })
  }
})
