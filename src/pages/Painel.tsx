import React, { useState } from 'react'
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Archive,
  UserX,
  FileText,
  Filter,
  Eye,
  X,
  RotateCcw,
  MessageSquare,
  ShieldCheck,
  Send,
  Calendar,
  User,
  History,
  Lock,
} from 'lucide-react'
import { useReports } from '@/context/ReportsContext'
import { ReportStatus, SyntheticReport } from '@/data/mockReports'

export default function Painel() {
  const { reports, updateReportStatus, addReportDecision, resetToInitial } = useReports()

  const [statusFilter, setStatusFilter] = useState<'Todos' | ReportStatus>('Todos')
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null)

  // Decisão Humana formulário local
  const [decisionInput, setDecisionInput] = useState('')
  const [decisionFeedback, setDecisionFeedback] = useState<string | null>(null)

  // Contadores por status
  const counts = {
    Todos: reports.length,
    Recebido: reports.filter((r) => r.status === 'Recebido').length,
    'Em Revisão': reports.filter((r) => r.status === 'Em Revisão').length,
    Arquivado: reports.filter((r) => r.status === 'Arquivado').length,
    'Retirada Solicitada': reports.filter((r) => r.status === 'Retirada Solicitada').length,
  }

  // Filtragem
  const filteredReports =
    statusFilter === 'Todos' ? reports : reports.filter((r) => r.status === statusFilter)

  const selectedReport = reports.find((r) => r.id === selectedReportId) || null

  const handleStatusChange = (newStatus: ReportStatus) => {
    if (!selectedReport) return
    let note = ''
    if (newStatus === 'Em Revisão') {
      note = 'Iniciada análise interna de conformidade ética e conferência anti-sigilo.'
    } else if (newStatus === 'Arquivado') {
      note = 'Relato arquivado internamente para arquivo passivo do escritório.'
    } else if (newStatus === 'Retirada Solicitada') {
      note = 'Cliente requereu revogação voluntária do envio. Status atualizado imediatamente.'
    }
    updateReportStatus(selectedReport.id, newStatus, note)
  }

  const handleAddDecision = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedReport || !decisionInput.trim()) return

    addReportDecision(selectedReport.id, decisionInput.trim())
    setDecisionInput('')
    setDecisionFeedback('Decisão humana anexada com sucesso ao histórico deste relato!')
    setTimeout(() => {
      setDecisionFeedback(null)
    }, 4000)
  }

  const getStatusBadge = (status: ReportStatus) => {
    switch (status) {
      case 'Recebido':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-100 text-sky-800 border border-sky-300">
            <Clock className="w-3 h-3" />
            Recebido
          </span>
        )
      case 'Em Revisão':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-900 border border-amber-300">
            <Eye className="w-3 h-3" />
            Em Revisão
          </span>
        )
      case 'Arquivado':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-stone-100 text-stone-700 border border-stone-300">
            <Archive className="w-3 h-3" />
            Arquivado
          </span>
        )
      case 'Retirada Solicitada':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800 border border-red-300">
            <UserX className="w-3 h-3" />
            Retirada Solicitada
          </span>
        )
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* 1. Banner Superior de Demonstração e Insegurança */}
      <div className="p-4 rounded-lg bg-[#0A1F33]/5 border-2 border-[#C9A227]/40 text-[#0A1F33] space-y-2 shadow-xs">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-[#C9A227] shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="font-bold text-sm tracking-tight text-[#0A1F33] uppercase">
              PAINEL DE DEMONSTRAÇÃO — SEM AUTENTICAÇÃO E SEM DADOS REAIS
            </div>
            <p className="text-xs text-slate-700 leading-relaxed">
              Espaço de demonstração sem autenticação e sem dados reais. Protótipo em memória;{' '}
              <strong>não há garantia técnica de confidencialidade ou restrição de acesso</strong>.
              Este painel ilustra exclusivamente a organização de relatos simulados e a máquina de
              estados para deliberação do responsável.
            </p>
          </div>
        </div>
      </div>

      {/* Cabeçalho da Página do Painel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#0A1F33] tracking-tight">
            Painel Interno de Relatos — DEMO
          </h1>
          <p className="text-xs sm:text-sm text-slate-600">
            Demonstração de conferência de atendimento e registro simulado de decisões humanas.
          </p>
        </div>

        {/* Botão de reset de fixtures */}
        <button
          type="button"
          onClick={resetToInitial}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-slate-300 bg-white text-xs font-medium text-slate-700 hover:bg-slate-50 active:scale-[0.98] transition-all self-start sm:self-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A227]"
          title="Restaura os dados fictícios originais"
        >
          <RotateCcw className="w-3.5 h-3.5 text-[#C9A227]" />
          Restaurar Fixtures Iniciais
        </button>
      </div>

      {/* Nota constante de dados voláteis */}
      <div className="text-xs text-slate-600 bg-white px-3.5 py-2 rounded border border-slate-200 flex items-center justify-between flex-wrap gap-2">
        <span className="flex items-center gap-2">
          <Lock className="w-3.5 h-3.5 text-[#C9A227]" />
          <span>
            Os dados são fictícios (
            <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-[11px] text-[#0A1F33]">
              E2E_SYNTH_
            </code>
            ) e em memória. <strong>Ao recarregar, tudo é perdido.</strong>
          </span>
        </span>
        <span className="text-[11px] text-[#A68218] font-semibold">
          Fuso oficial: America/Sao_Paulo (Horário de Brasília)
        </span>
      </div>

      {/* 2. Filtros por Status com Contadores */}
      <div
        className="flex items-center gap-1.5 overflow-x-auto pb-2 text-xs"
        aria-label="Filtro por status"
      >
        {(['Todos', 'Recebido', 'Em Revisão', 'Arquivado', 'Retirada Solicitada'] as const).map(
          (statusName) => {
            const count = counts[statusName]
            const active = statusFilter === statusName
            return (
              <button
                key={statusName}
                type="button"
                onClick={() => setStatusFilter(statusName)}
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md font-medium whitespace-nowrap transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A227] ${
                  active
                    ? 'bg-[#0A1F33] text-[#E5C048] border border-[#C9A227]/40 shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                <span>{statusName}</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                    active ? 'bg-[#132E4A] text-[#E5C048]' : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {count}
                </span>
              </button>
            )
          },
        )}
      </div>

      {/* 3. Grade / Lista de Relatos + Painel Lateral de Detalhes no Desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Coluna da Lista de Relatos */}
        <div className={`space-y-3 ${selectedReport ? 'lg:col-span-7' : 'lg:col-span-12'}`}>
          <div className="text-xs font-semibold text-slate-500 flex items-center justify-between px-1">
            <span>Listagem de Relatos ({filteredReports.length})</span>
            <span>Máquina de Estados: Recebido → Revisão → Arquivado / Retirada</span>
          </div>

          {filteredReports.length === 0 ? (
            <div className="bg-white p-8 rounded-lg border border-slate-200 text-center text-sm text-slate-500 space-y-2">
              <Filter className="w-8 h-8 mx-auto text-slate-300" />
              <p>Nenhum relato encontrado com o filtro "{statusFilter}".</p>
              <button
                type="button"
                onClick={() => setStatusFilter('Todos')}
                className="text-xs text-[#0A1F33] underline font-semibold"
              >
                Ver todos os relatos
              </button>
            </div>
          ) : (
            <div className="space-y-2.5">
              {filteredReports.map((report) => {
                const isSelected = selectedReportId === report.id
                return (
                  <div
                    key={report.id}
                    className={`bg-white rounded-lg p-4 sm:p-5 border transition-all text-left shadow-2xs hover:shadow-subtle ${
                      isSelected
                        ? 'border-[#0A1F33] ring-2 ring-[#C9A227]/40 bg-[#0A1F33]/2'
                        : 'border-slate-200 hover:border-[#0A1F33]/30'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-[#0A1F33] bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                          {report.id}
                        </span>
                        <span className="font-semibold text-sm text-slate-900">
                          {report.clientName}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">{getStatusBadge(report.status)}</div>
                    </div>

                    <p className="text-xs text-slate-600 line-clamp-2 my-2.5 leading-relaxed">
                      "{report.relato}"
                    </p>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-slate-500 pt-1">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>Exp.: {report.experienceDate}</span>
                        <span className="text-slate-300">|</span>
                        <span>Recebido: {report.receivedAt}</span>
                      </div>

                      <button
                        type="button"
                        onClick={() => setSelectedReportId(report.id)}
                        className={`inline-flex items-center justify-center gap-1 px-3 py-1 rounded text-xs font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A227] ${
                          isSelected
                            ? 'bg-[#0A1F33] text-[#E5C048]'
                            : 'bg-slate-50 text-[#0A1F33] hover:bg-[#0A1F33] hover:text-white border border-slate-200'
                        }`}
                      >
                        <Eye className="w-3.5 h-3.5 text-[#C9A227]" />
                        Ver Detalhes
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* 4. Coluna / Drawer de Detalhe (Desktop lateral ou Mobile tela cheia / sobreposto) */}
        {selectedReport && (
          <div className="lg:col-span-5 bg-white rounded-lg p-5 sm:p-6 border-2 border-[#0A1F33] shadow-lg space-y-5 sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto animate-fade-in">
            {/* Header do Detalhe */}
            <div className="flex items-start justify-between gap-2 pb-3 border-b border-slate-200">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-[#0A1F33] bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                    {selectedReport.id}
                  </span>
                  {getStatusBadge(selectedReport.status)}
                </div>
                <h3 className="font-bold text-base text-slate-900 mt-1">
                  {selectedReport.clientName}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedReportId(null)}
                className="p-1 rounded text-slate-500 hover:text-slate-900 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A227]"
                aria-label="Fechar painel de detalhes"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Metadados e Relato Completo */}
            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded border border-slate-200 space-y-1.5 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-slate-500">Data da Experiência:</span>
                  <span className="font-medium text-slate-900">
                    {selectedReport.experienceDate}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Recebimento:</span>
                  <span className="font-medium text-slate-900">{selectedReport.receivedAt}</span>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-800 block mb-1">
                  Texto Integral do Relato:
                </label>
                <div className="p-3 rounded-md bg-stone-50 border border-stone-200 text-slate-900 text-xs leading-relaxed italic whitespace-pre-wrap">
                  "{selectedReport.relato}"
                </div>
              </div>
            </div>

            {/* Botões de Transição de Estado */}
            <div className="space-y-2 pt-2 border-t border-slate-200">
              <label className="font-semibold text-xs text-[#0A1F33] block">
                Transição de Status (Máquina de Estados):
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {selectedReport.status === 'Recebido' && (
                  <button
                    type="button"
                    onClick={() => handleStatusChange('Em Revisão')}
                    className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-md bg-[#C9A227] text-[#0A1F33] font-semibold hover:bg-[#A68218] hover:text-white active:scale-[0.98] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A227]"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Marcar como Em Revisão
                  </button>
                )}

                {selectedReport.status === 'Em Revisão' && (
                  <button
                    type="button"
                    onClick={() => handleStatusChange('Arquivado')}
                    className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-md bg-slate-700 text-white font-medium hover:bg-slate-800 active:scale-[0.98] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-700"
                  >
                    <Archive className="w-3.5 h-3.5" />
                    Marcar como Arquivado
                  </button>
                )}

                {selectedReport.status === 'Arquivado' && (
                  <button
                    type="button"
                    onClick={() => handleStatusChange('Em Revisão')}
                    className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-md border border-slate-300 text-slate-700 font-medium hover:bg-slate-50 active:scale-[0.98] transition-all"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Reabrir para Revisão
                  </button>
                )}

                {/* Qualquer estado pode ter retirada solicitada */}
                {selectedReport.status !== 'Retirada Solicitada' && (
                  <button
                    type="button"
                    onClick={() => handleStatusChange('Retirada Solicitada')}
                    className="w-full sm:col-span-2 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-md bg-red-50 text-[#B3261E] border border-red-200 font-medium hover:bg-red-100 active:scale-[0.98] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B3261E]"
                  >
                    <UserX className="w-3.5 h-3.5" />
                    Registrar Pedido de Retirada (Simulado)
                  </button>
                )}
              </div>
            </div>

            {/* 5. Área de Registro de Decisão Humana (Simulado) */}
            <div className="space-y-2 pt-3 border-t border-slate-200">
              <label className="font-semibold text-xs text-[#0A1F33] flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-[#C9A227]" />
                Registro de decisão humana (simulado)
              </label>
              <form onSubmit={handleAddDecision} className="space-y-2">
                <textarea
                  rows={2}
                  value={decisionInput}
                  onChange={(e) => setDecisionInput(e.target.value)}
                  placeholder="Insira a justificativa ou nota ética do responsável..."
                  className="w-full p-2.5 text-xs rounded-md border border-slate-200 bg-slate-50 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0A1F33] transition-all"
                />
                <button
                  type="submit"
                  disabled={!decisionInput.trim()}
                  className={`w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-md text-xs font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A227] ${
                    decisionInput.trim()
                      ? 'bg-[#0A1F33] text-[#E5C048] hover:bg-[#132E4A] active:scale-[0.98] cursor-pointer'
                      : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <Send className="w-3.5 h-3.5 text-[#C9A227]" />
                  Registrar Decisão
                </button>
              </form>

              {decisionFeedback && (
                <p className="text-xs text-[#0A1F33] font-medium p-2 bg-[#C9A227]/15 rounded border border-[#C9A227]/40 animate-fade-in">
                  {decisionFeedback}
                </p>
              )}
            </div>

            {/* 6. Histórico de Mudanças e Decisões com Timestamps */}
            <div className="space-y-2 pt-3 border-t border-slate-200">
              <label className="font-semibold text-xs text-slate-500 flex items-center gap-1.5">
                <History className="w-3.5 h-3.5 text-[#C9A227]" />
                Histórico de Ações e Timestamps
              </label>

              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {selectedReport.history.map((hist, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded bg-slate-50 border border-slate-200 text-[11px] space-y-1"
                  >
                    <div className="flex items-center justify-between text-slate-500">
                      <span className="font-semibold text-[#0A1F33]">{hist.action}</span>
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">{hist.timestamp}</div>
                    {hist.note && (
                      <p className="text-slate-800 italic pt-0.5 leading-tight">"{hist.note}"</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
