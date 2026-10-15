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
      <div className="p-4 rounded-lg bg-amber-50 border-2 border-[#8A6D1A]/50 text-[#8A6D1A] space-y-2 shadow-xs">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-[#8A6D1A] shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="font-bold text-sm tracking-tight text-[#8A6D1A] uppercase">
              PAINEL DE DEMONSTRAÇÃO — NÃO USE DADOS REAIS
            </div>
            <p className="text-xs text-[#1A2E33] leading-relaxed">
              Sem autenticação real;{' '}
              <strong>não é seguro para informações confidenciais ou reais</strong>. Este painel
              ilustra exclusivamente a organização interna de relatos e a máquina de estados para
              deliberação do responsável.
            </p>
          </div>
        </div>
      </div>

      {/* Cabeçalho da Página do Painel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#0B3B4F] tracking-tight">
            Painel Interno de Relatos — DEMO
          </h1>
          <p className="text-xs sm:text-sm text-[#52656B]">
            Organização restrita para conferência de atendimento e registro de decisões humanas.
          </p>
        </div>

        {/* Botão de reset de fixtures */}
        <button
          type="button"
          onClick={resetToInitial}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-[#D8E2E0] bg-white text-xs font-medium text-[#52656B] hover:bg-[#F5F8F7] active:scale-[0.98] transition-all self-start sm:self-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B3B4F]"
          title="Restaura os dados fictícios originais"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Restaurar Fixtures Iniciais
        </button>
      </div>

      {/* Nota constante de dados voláteis */}
      <div className="text-xs text-[#52656B] bg-white px-3.5 py-2 rounded border border-[#D8E2E0] flex items-center justify-between flex-wrap gap-2">
        <span className="flex items-center gap-2">
          <Lock className="w-3.5 h-3.5 text-[#1B6B4A]" />
          <span>
            Os dados são fictícios (
            <code className="bg-[#F5F8F7] px-1 py-0.5 rounded font-mono text-[11px]">
              E2E_SYNTH_
            </code>
            ) e em memória. <strong>Ao recarregar, tudo é perdido.</strong>
          </span>
        </span>
        <span className="text-[11px] text-[#8A6D1A] font-semibold">
          Fuso oficial: America/São Paulo (UTC-3)
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
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md font-medium whitespace-nowrap transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B3B4F] ${
                  active
                    ? 'bg-[#0B3B4F] text-white shadow-xs'
                    : 'bg-white text-[#52656B] border border-[#D8E2E0] hover:bg-[#F5F8F7]'
                }`}
              >
                <span>{statusName}</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                    active ? 'bg-white/20 text-white' : 'bg-[#F5F8F7] text-[#1A2E33]'
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
          <div className="text-xs font-semibold text-[#52656B] flex items-center justify-between px-1">
            <span>Listagem de Relatos ({filteredReports.length})</span>
            <span>Máquina de Estados: Recebido → Revisão → Arquivado / Retirada</span>
          </div>

          {filteredReports.length === 0 ? (
            <div className="bg-white p-8 rounded-lg border border-[#D8E2E0] text-center text-sm text-[#52656B] space-y-2">
              <Filter className="w-8 h-8 mx-auto text-[#D8E2E0]" />
              <p>Nenhum relato encontrado com o filtro "{statusFilter}".</p>
              <button
                type="button"
                onClick={() => setStatusFilter('Todos')}
                className="text-xs text-[#0B3B4F] underline font-semibold"
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
                        ? 'border-[#0B3B4F] ring-1 ring-[#0B3B4F] bg-blue-50/20'
                        : 'border-[#D8E2E0] hover:border-[#0B3B4F]/40'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-[#D8E2E0]/60">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-[#0B3B4F] bg-[#F5F8F7] px-2 py-0.5 rounded border border-[#D8E2E0]">
                          {report.id}
                        </span>
                        <span className="font-semibold text-sm text-[#1A2E33]">
                          {report.clientName}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">{getStatusBadge(report.status)}</div>
                    </div>

                    <p className="text-xs text-[#52656B] line-clamp-2 my-2.5 leading-relaxed">
                      "{report.relato}"
                    </p>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-[#52656B] pt-1">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-[#52656B]" />
                        <span>Exp.: {report.experienceDate}</span>
                        <span className="text-[#D8E2E0]">|</span>
                        <span>Recebido: {report.receivedAt}</span>
                      </div>

                      <button
                        type="button"
                        onClick={() => setSelectedReportId(report.id)}
                        className={`inline-flex items-center justify-center gap-1 px-3 py-1 rounded text-xs font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B3B4F] ${
                          isSelected
                            ? 'bg-[#0B3B4F] text-white'
                            : 'bg-[#F5F8F7] text-[#0B3B4F] hover:bg-[#0B3B4F] hover:text-white border border-[#D8E2E0]'
                        }`}
                      >
                        <Eye className="w-3.5 h-3.5" />
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
          <div className="lg:col-span-5 bg-white rounded-lg p-5 sm:p-6 border border-[#0B3B4F] shadow-lg space-y-5 sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto animate-fade-in">
            {/* Header do Detalhe */}
            <div className="flex items-start justify-between gap-2 pb-3 border-b border-[#D8E2E0]">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-[#0B3B4F] bg-[#F5F8F7] px-2 py-0.5 rounded border border-[#D8E2E0]">
                    {selectedReport.id}
                  </span>
                  {getStatusBadge(selectedReport.status)}
                </div>
                <h3 className="font-bold text-base text-[#1A2E33] mt-1">
                  {selectedReport.clientName}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedReportId(null)}
                className="p-1 rounded text-[#52656B] hover:text-[#1A2E33] hover:bg-[#F5F8F7] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B3B4F]"
                aria-label="Fechar painel de detalhes"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Metadados e Relato Completo */}
            <div className="space-y-3 text-xs">
              <div className="p-3 bg-[#F5F8F7] rounded border border-[#D8E2E0] space-y-1.5 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-[#52656B]">Data da Experiência:</span>
                  <span className="font-medium text-[#1A2E33]">
                    {selectedReport.experienceDate}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#52656B]">Recebimento:</span>
                  <span className="font-medium text-[#1A2E33]">{selectedReport.receivedAt}</span>
                </div>
              </div>

              <div>
                <label className="font-semibold text-[#1A2E33] block mb-1">
                  Texto Integral do Relato:
                </label>
                <div className="p-3 rounded-md bg-stone-50 border border-stone-200 text-[#1A2E33] text-xs leading-relaxed italic whitespace-pre-wrap">
                  "{selectedReport.relato}"
                </div>
              </div>
            </div>

            {/* Botões de Transição de Estado */}
            <div className="space-y-2 pt-2 border-t border-[#D8E2E0]">
              <label className="font-semibold text-xs text-[#0B3B4F] block">
                Transição de Status (Máquina de Estados):
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {selectedReport.status === 'Recebido' && (
                  <button
                    type="button"
                    onClick={() => handleStatusChange('Em Revisão')}
                    className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-md bg-amber-600 text-white font-medium hover:bg-amber-700 active:scale-[0.98] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-600"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Marcar como Em Revisão
                  </button>
                )}

                {selectedReport.status === 'Em Revisão' && (
                  <button
                    type="button"
                    onClick={() => handleStatusChange('Arquivado')}
                    className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-md bg-stone-700 text-white font-medium hover:bg-stone-800 active:scale-[0.98] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-700"
                  >
                    <Archive className="w-3.5 h-3.5" />
                    Marcar como Arquivado
                  </button>
                )}

                {selectedReport.status === 'Arquivado' && (
                  <button
                    type="button"
                    onClick={() => handleStatusChange('Em Revisão')}
                    className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-md border border-[#D8E2E0] text-[#52656B] font-medium hover:bg-[#F5F8F7] active:scale-[0.98] transition-all"
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
            <div className="space-y-2 pt-3 border-t border-[#D8E2E0]">
              <label className="font-semibold text-xs text-[#0B3B4F] flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-[#1B6B4A]" />
                Registro de decisão humana (simulado)
              </label>
              <form onSubmit={handleAddDecision} className="space-y-2">
                <textarea
                  rows={2}
                  value={decisionInput}
                  onChange={(e) => setDecisionInput(e.target.value)}
                  placeholder="Insira a justificativa ou nota ética do responsável..."
                  className="w-full p-2.5 text-xs rounded-md border border-[#D8E2E0] bg-[#F5F8F7] text-[#1A2E33] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B3B4F] transition-all"
                />
                <button
                  type="submit"
                  disabled={!decisionInput.trim()}
                  className={`w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-md text-xs font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B3B4F] ${
                    decisionInput.trim()
                      ? 'bg-[#0B3B4F] text-white hover:bg-[#09546B] active:scale-[0.98] cursor-pointer'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <Send className="w-3.5 h-3.5" />
                  Registrar Decisão
                </button>
              </form>

              {decisionFeedback && (
                <p className="text-xs text-[#2E7D5B] font-medium p-2 bg-emerald-50 rounded border border-emerald-200 animate-fade-in">
                  {decisionFeedback}
                </p>
              )}
            </div>

            {/* 6. Histórico de Mudanças e Decisões com Timestamps */}
            <div className="space-y-2 pt-3 border-t border-[#D8E2E0]">
              <label className="font-semibold text-xs text-[#52656B] flex items-center gap-1.5">
                <History className="w-3.5 h-3.5" />
                Histórico de Ações e Timestamps
              </label>

              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {selectedReport.history.map((hist, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded bg-[#F5F8F7] border border-[#D8E2E0]/80 text-[11px] space-y-1"
                  >
                    <div className="flex items-center justify-between text-[#52656B]">
                      <span className="font-semibold text-[#0B3B4F]">{hist.action}</span>
                    </div>
                    <div className="text-[10px] text-[#52656B] font-mono">{hist.timestamp}</div>
                    {hist.note && (
                      <p className="text-[#1A2E33] italic pt-0.5 leading-tight">"{hist.note}"</p>
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
