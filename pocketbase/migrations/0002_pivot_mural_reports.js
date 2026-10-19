migrate(
  (app) => {
    // 1. Atualizar campos da coleção 'reports' para o novo formato simplificado
    const collection = app.findCollectionByNameOrId('reports')

    // Adiciona campo 'tipo' (select: texto, video)
    if (!collection.fields.getByName('tipo')) {
      collection.fields.add(
        new SelectField({
          name: 'tipo',
          required: true,
          values: ['texto', 'video'],
          maxSelect: 1,
        }),
      )
    }

    // Adiciona campo 'author' (text, opcional, máx 80)
    if (!collection.fields.getByName('author')) {
      collection.fields.add(
        new TextField({
          name: 'author',
          required: false,
          max: 80,
        }),
      )
    }

    // Adiciona campo 'texto' (text, opcional para suportar vídeo sem texto, máx 2000)
    if (!collection.fields.getByName('texto')) {
      collection.fields.add(
        new TextField({
          name: 'texto',
          required: false,
          max: 2000,
        }),
      )
    }

    // Adiciona campo 'video_file' (file, para gravação do navegador, máx 50MB, mime types de vídeo)
    if (!collection.fields.getByName('video_file')) {
      collection.fields.add(
        new FileField({
          name: 'video_file',
          required: false,
          maxSelect: 1,
          maxSize: 52428800, // 50MB
          mimeTypes: ['video/webm', 'video/mp4', 'video/quicktime', 'video/ogg'],
        }),
      )
    }

    // Adiciona campo 'consentimento' (bool, flag obrigatória no envio)
    if (!collection.fields.getByName('consentimento')) {
      collection.fields.add(
        new BoolField({
          name: 'consentimento',
          required: false,
        }),
      )
    }

    // Adiciona novo campo 'status_novo' com valores ['pendente', 'aprovado', 'oculto']
    if (!collection.fields.getByName('status_novo')) {
      collection.fields.add(
        new SelectField({
          name: 'status_novo',
          required: true,
          values: ['pendente', 'aprovado', 'oculto'],
          maxSelect: 1,
        }),
      )
    }

    app.save(collection)

    // Backfill defensivo: mapear dados antigos se houverem
    try {
      app
        .db()
        .newQuery(`
        UPDATE reports
        SET
          tipo = 'texto',
          author = COALESCE(client_name, ''),
          texto = COALESCE(relato, ''),
          consentimento = COALESCE(consent_given, 1),
          status_novo = CASE
            WHEN status = 'recebido' THEN 'pendente'
            WHEN status = 'em_revisao' THEN 'pendente'
            ELSE 'oculto'
          END
        WHERE status_novo IS NULL OR status_novo = ''
      `)
        .execute()
    } catch (_) {}

    // Agora adiciona índice para consulta rápida do mural público por status_novo e created
    collection.addIndex('idx_reports_status_novo_created', false, 'status_novo, created DESC', '')
    app.save(collection)
  },
  (app) => {
    try {
      const collection = app.findCollectionByNameOrId('reports')
      collection.removeIndex('idx_reports_status_novo_created')
      collection.fields.removeByName('video_file')
      collection.fields.removeByName('tipo')
      collection.fields.removeByName('author')
      collection.fields.removeByName('texto')
      collection.fields.removeByName('consentimento')
      collection.fields.removeByName('status_novo')
      app.save(collection)
    } catch (_) {}
  },
)
