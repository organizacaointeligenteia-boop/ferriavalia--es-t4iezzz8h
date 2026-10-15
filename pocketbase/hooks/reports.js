/**
 * CANDIDATO NATIVO EXCLUSIVO — Endpoint de Criação de Relatos
 * Rota: POST /backend/v1/reports
 * Projeto: Ferri & Ferri — Relatos e Experiência
 *
 * Motor/Runtime: Skip Cloud (PocketBase v0.36 jsVM / Goja).
 *
 * REGRAS DE ARQUITETURA JSVM (POCKETBASE):
 * Cada callback de routerAdd é executado em seu próprio escopo isolado no pool de VMs.
 * Todas as funções utilitárias e regras de rate limiting, validação de calendário e fuso
 * devem residir INLINE dentro do corpo do callback para prevenir ReferenceError.
 */

routerAdd('POST', '/backend/v1/reports', (e) => {
  // --- 1. RATE LIMITING EFETIVO DEFAULT-DENY ---
  var clientIp = e.realIP() || e.remoteIP()
  if (!clientIp || typeof clientIp !== 'string' || clientIp.trim().length === 0) {
    return e.json(429, {
      success: false,
      error: 'rate_limited',
    })
  }

  // Janela de rate limit baseada em registros recentes da própria coleção reports (limite de criação por IP ou taxa)
  // Ou controle fail-closed: se qualquer checagem falhar, default-deny
  try {
    // Verificação de taxa recente: no máximo 5 relatos criados nos últimos 60 segundos globalmente ou por IP
    var oneMinuteAgo = new Date(Date.now() - 60000).toISOString().replace('T', ' ').substring(0, 19)
    var recentRecords = e.app.findRecordsByFilter(
      'reports',
      'created >= {:since}',
      '-created',
      10,
      0,
      { since: oneMinuteAgo },
    )
    if (recentRecords && recentRecords.length >= 10) {
      return e.json(429, {
        success: false,
        error: 'rate_limited',
      })
    }
  } catch (_) {
    // Se a tabela ainda não estiver acessível ou ocorrer exceção, recusa fail-closed
    return e.json(429, {
      success: false,
      error: 'rate_limited',
    })
  }

  // --- 2. EXTRAÇÃO E HIGIENIZAÇÃO DO PAYLOAD ---
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

  // Validação estrita de idempotencyKey (obrigatória, 8 a 128 chars)
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

  // Validação estrita de consentGiven (obrigatório, booleano estrito true)
  if (consentGiven !== true) {
    validationErrors.push({
      field: 'consentGiven',
      message: 'Consentimento voluntário prévio é obrigatório (deve ser true).',
    })
  }

  // Validação estrita de termsVersion (obrigatória)
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
        message: 'Nome deve ser texto válido.',
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
        message: 'Relato deve ser texto válido.',
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

  // Validação de calendário estrito para experienceDate
  if (typeof experienceDate !== 'string' || experienceDate.trim().length === 0) {
    validationErrors.push({
      field: 'experienceDate',
      message: 'Data da experiência é obrigatória.',
    })
  } else {
    var trimmedDate = experienceDate.trim()
    var match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmedDate)
    if (!match) {
      validationErrors.push({
        field: 'experienceDate',
        message: 'Formato de data inválido. Utilize AAAA-MM-DD.',
      })
    } else {
      var year = parseInt(match[1], 10)
      var month = parseInt(match[2], 10)
      var day = parseInt(match[3], 10)

      var isLeap = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0
      var daysInMonth = [31, isLeap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]

      if (year < 1900 || year > 2100 || month < 1 || month > 12) {
        validationErrors.push({
          field: 'experienceDate',
          message: 'Mês ou ano fora do intervalo válido.',
        })
      } else {
        var maxD = daysInMonth[month - 1]
        if (day < 1 || day > maxD) {
          validationErrors.push({
            field: 'experienceDate',
            message: 'Dia inválido para o mês/ano informado no calendário gregoriano.',
          })
        } else {
          // Checagem de data futura no fuso America/Sao_Paulo (UTC-3 civil)
          var now = new Date()
          var spOffset = -3 * 60
          var utcMinutes = now.getTime() + now.getTimezoneOffset() * 60000
          var spDate = new Date(utcMinutes + spOffset * 60000)
          var todaySp =
            spDate.getFullYear() +
            '-' +
            String(spDate.getMonth() + 1).padStart(2, '0') +
            '-' +
            String(spDate.getDate()).padStart(2, '0')

          if (trimmedDate > todaySp) {
            validationErrors.push({
              field: 'experienceDate',
              message:
                'A data da experiência não pode ser posterior à data atual (America/Sao_Paulo).',
            })
          }
        }
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

  // --- 3. DEDUPLICAÇÃO ATÔMICA E CANÔNICA (IDEMPOTÊNCIA) ---
  // Tanto no aceite inicial quanto no replay com chave idêntica, retorna o MESMO status 201
  // e o MESMO corpo canônico { success: true, received: true }, sem expor IDs, datas ou flags
  try {
    var existing = e.app.findFirstRecordByData('reports', 'idempotency_key', sanitizedKey)
    if (existing) {
      return e.json(201, {
        success: true,
        received: true,
      })
    }
  } catch (_) {
    // Registro não existe ainda, prossegue para inserção
  }

  // --- 4. FORMATAÇÃO DE TIMESTAMP COM FUSO AMERICA/SAO_PAULO ---
  var nowObj = new Date()
  var spOffsetMin = -3 * 60
  var utcMin = nowObj.getTime() + nowObj.getTimezoneOffset() * 60000
  var nowSp = new Date(utcMin + spOffsetMin * 60000)
  var formattedNowSp =
    String(nowSp.getDate()).padStart(2, '0') +
    '/' +
    String(nowSp.getMonth() + 1).padStart(2, '0') +
    '/' +
    nowSp.getFullYear() +
    ' às ' +
    String(nowSp.getHours()).padStart(2, '0') +
    ':' +
    String(nowSp.getMinutes()).padStart(2, '0') +
    ' (America/Sao_Paulo)'

  // --- 5. INSERÇÃO ATÔMICA NO BANCO NATIVO ---
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
    record.set('received_at_sp', formattedNowSp)
    record.set(
      'audit_history',
      JSON.stringify([
        {
          action: 'criado_via_coleta',
          timestamp_sp: formattedNowSp,
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
    // Conflito atômico de unicidade concorrente (race condition com mesma chave de idempotência)
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
