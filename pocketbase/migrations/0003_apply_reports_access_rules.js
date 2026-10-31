migrate(
  (app) => {
    const collection = app.findCollectionByNameOrId('reports')

    // Regras literais aprovadas pelo usuário para a coleção reports:
    // listRule: público lista só o que está aprovado
    collection.listRule = "status_novo = 'aprovado'"

    // viewRule: público vê só o que está aprovado
    collection.viewRule = "status_novo = 'aprovado'"

    // createRule: criação pública força pendente e impede auto-aprovação
    collection.createRule =
      "@request.body.status_novo:changed = false || @request.body.status_novo = 'pendente'"

    // updateRule: moderação só para equipe autenticada da coleção users
    collection.updateRule = "@request.auth.id != '' && @request.auth.collectionName = 'users'"

    // deleteRule: exclusão só para equipe autenticada da coleção users
    collection.deleteRule = "@request.auth.id != '' && @request.auth.collectionName = 'users'"

    app.save(collection)
  },
  (app) => {
    try {
      const collection = app.findCollectionByNameOrId('reports')
      collection.listRule = null
      collection.viewRule = null
      collection.createRule = null
      collection.updateRule = null
      collection.deleteRule = null
      app.save(collection)
    } catch (_) {}
  },
)
