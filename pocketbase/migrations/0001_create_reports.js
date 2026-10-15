migrate(
  (app) => {
    // Verificação defensiva de idempotência caso a coleção já exista
    if (app.hasTable('reports')) {
      return
    }

    const collection = new Collection({
      name: 'reports',
      type: 'base',
      // REGRAS DE ACESSO DEFAULT-DENY:
      // Avaliações estritamente privadas por padrão.
      // Leitura, listagem e mutação pública NEGADAS (null = Superusers/Hooks internos apenas).
      // authenticated genérico, domínios de e-mail e claims autocontroláveis NÃO têm acesso.
      listRule: null,
      viewRule: null,
      createRule: null,
      updateRule: null,
      deleteRule: null,
      fields: [
        {
          name: 'idempotency_key',
          type: 'text',
          required: true,
          min: 8,
          max: 128,
        },
        {
          name: 'client_name',
          type: 'text',
          required: false,
          max: 80,
        },
        {
          name: 'relato',
          type: 'text',
          required: false,
          max: 2000,
        },
        {
          name: 'experience_date',
          type: 'text',
          required: true,
          min: 10,
          max: 10,
          pattern: '^\\d{4}-\\d{2}-\\d{2}$',
        },
        {
          name: 'consent_given',
          type: 'bool',
          required: false,
        },
        {
          name: 'terms_version',
          type: 'text',
          required: true,
          min: 1,
          max: 64,
        },
        {
          name: 'status',
          type: 'select',
          required: true,
          values: ['recebido', 'em_revisao', 'arquivado', 'retirada_solicitada'],
          maxSelect: 1,
        },
        {
          name: 'received_at_sp',
          type: 'text',
          required: true,
          max: 80,
        },
        {
          name: 'withdrawal_requested_at',
          type: 'text',
          required: false,
          max: 80,
        },
        {
          name: 'withdrawal_reason',
          type: 'text',
          required: false,
          max: 500,
        },
        {
          name: 'audit_history',
          type: 'json',
          required: false,
          maxSize: 65536,
        },
        {
          name: 'created',
          type: 'autodate',
          onCreate: true,
          onUpdate: false,
        },
        {
          name: 'updated',
          type: 'autodate',
          onCreate: true,
          onUpdate: true,
        },
      ],
      indexes: [
        'CREATE UNIQUE INDEX idx_reports_idempotency_key ON reports (idempotency_key)',
        'CREATE INDEX idx_reports_status_created ON reports (status, created DESC)',
        'CREATE INDEX idx_reports_experience_date ON reports (experience_date DESC)',
      ],
    })

    app.save(collection)
  },
  (app) => {
    try {
      const collection = app.findCollectionByNameOrId('reports')
      app.delete(collection)
    } catch (_) {
      // Silencioso se não existir no rollback
    }
  },
)
