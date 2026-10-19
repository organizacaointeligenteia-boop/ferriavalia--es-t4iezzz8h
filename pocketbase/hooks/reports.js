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
 * residem inline dentro do corpo do callback para prevenir ReferenceError.
 */

routerAdd('POST', '/backend/v1/reports', function (e) {
  var requestInstant = new Date()

  // Validação estrita inicial: requestInstant deve ser uma data válida e finita
  if (
    !(requestInstant instanceof Date) ||
    typeof requestInstant.getTime !== 'function' ||
    !isFinite(requestInstant.getTime())
  ) {
    return e.json(503, {
      success: false,
      error: 'timezone_unavailable',
    })
  }

  // 1. Resolução de Fuso America/Sao_Paulo (UTC-3)
  var formattedReceivedAtSp = ''
  try {
    var nowUtc = requestInstant.getTime()
    var spOffsetMin = -3 * 60
    var nowSp = new Date(nowUtc + spOffsetMin * 60000)

    formattedReceivedAtSp =
      String(nowSp.getDate()).padStart(2, '0') +
      '/' +
      String(nowSp.getMonth() + 1).padStart(2, '0') +
      '/' +
      nowSp.getFullYear() +
      ' às ' +
      String(nowSp.getHours()).padStart(2, '0') +
      ':' +
      String(nowSp.getMinutes()).padStart(2, '0') +
      ':' +
      String(nowSp.getSeconds()).padStart(2, '0') +
      ' (America/Sao_Paulo)'
  } catch (_) {
    return e.json(503, {
      success: false,
      error: 'timezone_unavailable',
    })
  }

  // 2. Rate Limiting Fail-Closed
  try {
    var rawIp = e.realIP() || e.remoteIP()
    if (!rawIp || typeof rawIp !== 'string' || rawIp.trim().length === 0) {
      return e.json(429, {
        success: false,
        error: 'rate_limited',
      })
    }

    var oneMinuteAgo = new Date(requestInstant.getTime() - 60000)
      .toISOString()
      .replace('T', ' ')
      .substring(0, 19)

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
    return e.json(429, {
      success: false,
      error: 'rate_limited',
    })
  }

  // 3. Extração e validação do payload
  var rawBody = null
  try {
    var reqInfo = e.requestInfo()
    rawBody = reqInfo ? reqInfo.body : null
  } catch (_) {
    rawBody = null
  }

  if (
    rawBody === null ||
    rawBody === undefined ||
    typeof rawBody !== 'object' ||
    Array.isArray(rawBody)
  ) {
    return e.json(400, {
      success: false,
      error: 'Payload inválido. Esperado objeto JSON não-nulo.',
    })
  }

  var author = rawBody.author
  var tipo = rawBody.tipo // 'texto' ou 'video'
  var texto = rawBody.texto
  var consentimento = rawBody.consentimento

  var validationErrors = []

  // Validação do consentimento obrigatório (deve ser true)
  if (consentimento !== true) {
    validationErrors.push({
      field: 'consentimento',
      message: 'O consentimento é obrigatório para registrar o relato.',
    })
  }

  // Validação do tipo (texto ou video)
  var cleanTipo = 'texto'
  if (tipo !== undefined && tipo !== null) {
    if (tipo !== 'texto' && tipo !== 'video') {
      validationErrors.push({
        field: 'tipo',
        message: 'Tipo de relato inválido. Permitido: texto ou video.',
      })
    } else {
      cleanTipo = tipo
    }
  }

  // Validação do autor (opcional, máx 80 caracteres)
  var cleanAuthor = null
  if (author !== undefined && author !== null) {
    if (typeof author !== 'string') {
      validationErrors.push({
        field: 'author',
        message: 'Autor deve ser texto válido.',
      })
    } else {
      var tAuthor = author.trim()
      if (tAuthor.length > 80) {
        validationErrors.push({
          field: 'author',
          message: 'Autor não pode exceder 80 caracteres.',
        })
      } else if (tAuthor.length > 0) {
        cleanAuthor = tAuthor
      }
    }
  }

  // Validação do texto
  var cleanTexto = null
  if (cleanTipo === 'texto') {
    if (!texto || typeof texto !== 'string' || texto.trim().length === 0) {
      validationErrors.push({
        field: 'texto',
        message: 'O texto do relato é obrigatório para relatos em texto.',
      })
    } else {
      var tTexto = texto.trim()
      if (tTexto.length > 2000) {
        validationErrors.push({
          field: 'texto',
          message: 'O texto do relato não pode exceder 2.000 caracteres.',
        })
      } else {
        cleanTexto = tTexto
      }
    }
  } else if (cleanTipo === 'video') {
    // Para vídeo, o texto é opcional (pode ser comentário ou transcrição futura)
    if (texto !== undefined && texto !== null && typeof texto === 'string') {
      cleanTexto = texto.trim().substring(0, 2000)
    }
  }

  if (validationErrors.length > 0) {
    return e.json(400, {
      success: false,
      error: 'Falha na validação dos dados enviados.',
      errors: validationErrors,
    })
  }

  // 4. Inserção com status pendente padrão
  try {
    var reportsCollection = e.app.findCollectionByNameOrId('reports')
    var newRecord = new Record(reportsCollection)

    newRecord.set('author', cleanAuthor)
    newRecord.set('tipo', cleanTipo)
    newRecord.set('texto', cleanTexto)
    newRecord.set('consentimento', true)
    newRecord.set('status', 'pendente')
    newRecord.set('received_at_sp', formattedReceivedAtSp)

    e.app.save(newRecord)

    return e.json(201, {
      success: true,
      received: true,
      message: 'Relato recebido com sucesso. Aguardando aprovação.',
    })
  } catch (err) {
    return e.json(500, {
      success: false,
      error: 'internal_error',
    })
  }
})
