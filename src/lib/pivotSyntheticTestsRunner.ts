/**
 * SUÍTE SINTÉTICA DE TESTES DE REGRA DE NEGÓCIO DO NOVO PRODUTO (PIVOT)
 * Projeto: Ferri & Ferri — Relatos e Experiência
 *
 * RÓTULO METODOLÓGICO OBRIGATÓRIO:
 * [MOCK ≠ RUNTIME REAL]
 * Esta suíte roda inteiramente em memória e com dados sintéticos locais (fixtures/mocks).
 * Nenhum teste persistente ou gravação real na instância do Skip Cloud foi executado.
 *
 * CENÁRIOS PREPARADOS:
 * 1. Envio de texto com status pendente NÃO aparece no mural público.
 * 2. Aprovação do relato pelo painel faz com que ele apareça imediatamente no mural público.
 * 3. Envio de vídeo gravado via navegador é aceito com consentimento e exibido no mural após aprovação.
 * 4. Ocultação do relato pelo painel remove-o do mural público.
 * 5. Exclusão do relato pelo painel remove-o definitivamente de todas as visualizações.
 */

export interface PivotTestCaseResult {
  id: string
  name: string
  passed: boolean
  label: string
  details: string
}

export interface PivotTestSuiteReport {
  timestamp: string
  total: number
  passed: number
  failed: number
  results: PivotTestCaseResult[]
}

interface MockReportItem {
  id: string
  author: string
  tipo: 'texto' | 'video'
  texto?: string
  video_file?: string
  consentimento: boolean
  status_novo: 'pendente' | 'aprovado' | 'oculto'
}

class MockPivotDatabase {
  private items: MockReportItem[] = []

  insert(item: Omit<MockReportItem, 'id' | 'status_novo'> & { id?: string }): MockReportItem {
    const record: MockReportItem = {
      id: item.id || `rec_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      author: item.author || 'Anônimo',
      tipo: item.tipo,
      texto: item.texto,
      video_file: item.video_file,
      consentimento: item.consentimento,
      status_novo: 'pendente', // Regra rígida do produto: sempre nasce pendente
    }
    this.items.push(record)
    return record
  }

  updateStatus(id: string, status: 'pendente' | 'aprovado' | 'oculto'): MockReportItem | null {
    const found = this.items.find((r) => r.id === id)
    if (!found) return null
    found.status_novo = status
    return found
  }

  delete(id: string): boolean {
    const initialLen = this.items.length
    this.items = this.items.filter((r) => r.id !== id)
    return this.items.length < initialLen
  }

  listMuralPublico(): MockReportItem[] {
    // Regra rígida do mural público: SOMENTE status_novo = 'aprovado'
    return this.items.filter((r) => r.status_novo === 'aprovado')
  }

  listPainelStaff(): MockReportItem[] {
    // Equipe enxerga todos (pendentes, aprovados, ocultos)
    return [...this.items]
  }
}

export function runPivotSyntheticTests(): PivotTestSuiteReport {
  const results: PivotTestCaseResult[] = []
  const db = new MockPivotDatabase()

  // Teste 1: Envio de texto pendente não aparece no mural
  {
    const reportTexto = db.insert({
      author: 'Cliente Teste 1',
      tipo: 'texto',
      texto: 'Atendimento muito atencioso e pontual.',
      consentimento: true,
    })

    const mural = db.listMuralPublico()
    const apareceNoMural = mural.some((r) => r.id === reportTexto.id)
    const noPainel = db.listPainelStaff().some((r) => r.id === reportTexto.id)

    results.push({
      id: 'TC_01_PENDENTE_NAO_APARECE_NO_MURAL',
      name: 'Envio de texto pendente não aparece no mural público',
      passed: !apareceNoMural && noPainel && reportTexto.status_novo === 'pendente',
      label: 'MOCK ≠ RUNTIME REAL',
      details:
        'O relato inserido permaneceu estritamente com status_novo=pendente e foi filtrado do mural público.',
    })
  }

  // Teste 2: Aprovação faz aparecer no mural
  {
    const reportParaAprovar = db.insert({
      author: 'Cliente Teste 2',
      tipo: 'texto',
      texto: 'Explicações claras e ambiente muito agradável.',
      consentimento: true,
    })

    // Equipe aprova
    db.updateStatus(reportParaAprovar.id, 'aprovado')

    const muralAposAprovacao = db.listMuralPublico()
    const agoraAparece = muralAposAprovacao.some((r) => r.id === reportParaAprovar.id)

    results.push({
      id: 'TC_02_APROVACAO_FAZ_APARECER',
      name: 'Aprovação pelo painel faz o relato aparecer no mural público',
      passed: agoraAparece,
      label: 'MOCK ≠ RUNTIME REAL',
      details:
        'Após a transição para status_novo=aprovado, o relato passou a ser retornado na consulta pública do mural.',
    })
  }

  // Teste 3: Vídeo gravado no navegador é aceito e exibido após aprovação
  {
    const reportVideo = db.insert({
      author: 'Anônimo',
      tipo: 'video',
      video_file: 'video_gravado_navegador_12345.webm',
      texto: 'Depoimento em vídeo gravado via MediaRecorder',
      consentimento: true,
    })

    const muralAntes = db.listMuralPublico().some((r) => r.id === reportVideo.id)
    db.updateStatus(reportVideo.id, 'aprovado')
    const muralDepois = db.listMuralPublico().some((r) => r.id === reportVideo.id)

    results.push({
      id: 'TC_03_VIDEO_GRAVADO_ACEITO_E_APROVADO',
      name: 'Vídeo gravado no navegador é aceito com consentimento e exibido após aprovação',
      passed: !muralAntes && muralDepois && reportVideo.video_file !== undefined,
      label: 'MOCK ≠ RUNTIME REAL',
      details:
        'Relato do tipo vídeo com gravação do navegador foi aceito pendente e exibido no mural apenas pós-aprovação.',
    })
  }

  // Teste 4: Ocultar remove do mural público
  {
    const reportOcultar = db.insert({
      author: 'Cliente Teste 4',
      tipo: 'texto',
      texto: 'Mensagem para teste de ocultação.',
      consentimento: true,
    })

    db.updateStatus(reportOcultar.id, 'aprovado')
    const noMuralAprovado = db.listMuralPublico().some((r) => r.id === reportOcultar.id)

    // Equipe oculta
    db.updateStatus(reportOcultar.id, 'oculto')
    const noMuralOculto = db.listMuralPublico().some((r) => r.id === reportOcultar.id)
    const aindaNoPainel = db.listPainelStaff().some((r) => r.id === reportOcultar.id)

    results.push({
      id: 'TC_04_OCULTAR_REMOVE_DO_MURAL',
      name: 'Ocultação do relato remove do mural mas mantém no painel',
      passed: noMuralAprovado && !noMuralOculto && aindaNoPainel,
      label: 'MOCK ≠ RUNTIME REAL',
      details:
        'Ao transitar para status_novo=oculto, o registro deixa de ser retornado no mural público mas permanece no painel.',
    })
  }

  // Teste 5: Excluir remove de todas as visualizações
  {
    const reportExcluir = db.insert({
      author: 'Cliente Teste 5',
      tipo: 'texto',
      texto: 'Mensagem a ser excluída permanentemente.',
      consentimento: true,
    })

    db.updateStatus(reportExcluir.id, 'aprovado')
    const deletado = db.delete(reportExcluir.id)
    const noMural = db.listMuralPublico().some((r) => r.id === reportExcluir.id)
    const noPainel = db.listPainelStaff().some((r) => r.id === reportExcluir.id)

    results.push({
      id: 'TC_05_EXCLUIR_REMOVE_DEFINITIVAMENTE',
      name: 'Exclusão do relato pelo painel remove-o de todas as visualizações',
      passed: deletado && !noMural && !noPainel,
      label: 'MOCK ≠ RUNTIME REAL',
      details:
        'A exclusão remove o registro do banco de dados em conformidade com o direito de retirada voluntária.',
    })
  }

  const passed = results.filter((r) => r.passed).length
  const failed = results.filter((r) => !r.passed).length

  return {
    timestamp: '2026-10-15T15:00:00Z',
    total: results.length,
    passed,
    failed,
    results,
  }
}
