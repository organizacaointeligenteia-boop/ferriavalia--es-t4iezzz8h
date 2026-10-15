import React, { useState } from 'react'
import {
  Lock,
  AlertTriangle,
  EyeOff,
  ShieldAlert,
  Calendar,
  Info,
  CheckCircle2,
  X,
  QrCode,
} from 'lucide-react'

interface SyntheticMuralCard {
  id: string
  clientFirstName: string
  quote: string
  experienceDate: string
  timestamp: string
}

const MURAL_SYNTHETIC_CARDS: SyntheticMuralCard[] = [
  {
    id: 'E2E_SYNTH_CARD_01',
    clientFirstName: 'E2E_SYNTH_Mariana',
    quote:
      'Atendimento respeitoso e pontual. Todas as etapas iniciais da consulta foram explicadas com calma e clareza técnica.',
    experienceDate: '15/01/2025',
    timestamp: '15/01/2025 às 14:32 (America/São Paulo, UTC-3)',
  },
  {
    id: 'E2E_SYNTH_CARD_02',
    clientFirstName: 'E2E_SYNTH_Carlos',
    quote:
      'Cordialidade por parte de toda a equipe e atenção redobrada quanto ao sigilo e à organização dos documentos.',
    experienceDate: '10/01/2025',
    timestamp: '11/01/2025 às 09:15 (America/São Paulo, UTC-3)',
  },
  {
    id: 'E2E_SYNTH_CARD_03',
    clientFirstName: 'E2E_SYNTH_Helena',
    quote:
      'Postura sóbria e transparente. Reunião conduzida com pontualidade e orientações claras sobre os limites de atuação.',
    experienceDate: '04/01/2025',
    timestamp: '05/01/2025 às 16:40 (America/São Paulo, UTC-3)',
  },
]

export default function Mural() {
  // Modal de bloqueio de ativação
  const [blockingModalOpen, setBlockingModalOpen] = useState(false)
  const [toggleActive, setToggleActive] = useState(false)

  // Manipulador da tentativa de ativação: abre o modal de bloqueio e NUNCA ativa
  const handleToggleClick = () => {
    setBlockingModalOpen(true)
  }

  const handleModalKeepDisabled = () => {
    setToggleActive(false)
    setBlockingModalOpen(false)
  }

  const handleModalBack = () => {
    setToggleActive(false)
    setBlockingModalOpen(false)
  }

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in">
      {/* Rótulo de Demonstração */}
      <div className="flex items-center justify-between bg-[#0A1F33]/5 border border-[#C9A227]/30 text-[#0A1F33] px-3.5 py-2 rounded-md text-xs">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 text-[#C9A227]" />
          <span>
            <strong>PRÉVIA FICTÍCIA DE DEMONSTRAÇÃO:</strong> O mural externo NÃO está ativo e não é
            público.
          </span>
        </div>
        <span className="text-[11px] font-semibold bg-[#C9A227] text-[#0A1F33] px-2 py-0.5 rounded shadow-2xs">
          DESATIVADO
        </span>
      </div>

      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#A68218] uppercase tracking-wider">
            <EyeOff className="w-4 h-4 text-[#C9A227]" />
            Visualização Interna Experimental
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#0A1F33] tracking-tight">
            Mural — Prévia Fictícia de Demonstração
          </h1>
          <p className="text-xs sm:text-sm text-slate-600">
            Exemplo visual de formato de relatos, restrito a amostras simuladas de demonstração e
            mantido inoperante.
          </p>
        </div>

        {/* Toggle de ativação (Sempre desativado por design ético) */}
        <div className="flex items-center gap-3 bg-white p-2.5 rounded-lg border border-slate-200 shadow-2xs self-start sm:self-auto">
          <span className="text-xs font-semibold text-slate-900">Publicação Pública:</span>
          <button
            type="button"
            role="switch"
            aria-checked={toggleActive}
            onClick={handleToggleClick}
            className="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-slate-300 transition-colors duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A227]"
            title="Publicação desativada por razões éticas OAB"
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                toggleActive ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
          <span className="text-xs font-bold text-[#B3261E]">Desativada</span>
        </div>
      </div>

      {/* Banner Destacado Obrigatório */}
      <div className="bg-[#0A1F33]/5 border-2 border-[#C9A227]/40 rounded-lg p-5 sm:p-6 text-slate-800 space-y-3">
        <div className="flex items-start gap-3">
          <ShieldAlert className="w-6 h-6 text-[#C9A227] shrink-0 mt-0.5" />
          <div className="space-y-2">
            <h2 className="font-bold text-base text-[#0A1F33] tracking-tight">
              Este mural está DESATIVADO.
            </h2>
            <p className="text-xs sm:text-sm text-slate-800 leading-relaxed">
              Publicação e embeds pendentes de revisão ética OAB e decisão específica do
              responsável. Não divulgue nomes, resultados, promessas, comparações ou testemunhos de
              êxito.
            </p>
            <div className="p-3 bg-white rounded border border-[#C9A227]/30 text-xs text-slate-600 leading-relaxed">
              <strong>Finalidade distinta:</strong> A coleta voluntária interna de impressões visa
              exclusivamente à autoavaliação da qualidade do atendimento prestado. O consentimento
              do cliente para responder à pesquisa interna <em>não autoriza</em> publicidade ou
              divulgação aberta na internet.
            </div>
          </div>
        </div>
      </div>

      {/* Grade de Cards Fictícios E2E_SYNTH_ */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
          <span>
            Exemplos Fictícios de Relato (
            <code className="font-mono text-[#0A1F33] bg-slate-100 px-1 py-0.5 rounded">
              E2E_SYNTH_
            </code>
            )
          </span>
          <span className="text-[#A68218]">Sem promessas ou alegações de êxito</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {MURAL_SYNTHETIC_CARDS.map((card) => (
            <div
              key={card.id}
              className="bg-white rounded-lg p-5 border border-slate-200 shadow-xs flex flex-col justify-between space-y-4 hover:shadow-subtle transition-all"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-sm text-[#0A1F33]">
                    {card.clientFirstName}
                  </span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-[#C9A227]/20 text-[#0A1F33] border border-[#C9A227]/30">
                    Fictício
                  </span>
                </div>

                <p className="text-xs text-slate-800 italic leading-relaxed">"{card.quote}"</p>
              </div>

              <div className="pt-3 border-t border-slate-100 space-y-1 text-[11px] text-slate-500">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3 h-3 text-[#C9A227]" />
                  <span>Data: {card.experienceDate}</span>
                </div>
                <div className="text-[10px] text-slate-400 font-mono">{card.timestamp}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Seção sobre QR Code / Divulgação Externa */}
      <div className="bg-white rounded-lg p-5 sm:p-6 border border-slate-200 space-y-3">
        <div className="flex items-center gap-2.5 text-[#0A1F33]">
          <QrCode className="w-5 h-5 text-[#C9A227]" />
          <h3 className="font-bold text-sm sm:text-base">QR Code e Endereço Público de Coleta</h3>
        </div>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          Nenhum QR code operacional é gerado sem uma URL pública institucional formalmente
          confirmada pela administração do escritório.
        </p>
        <div className="bg-slate-50 p-3 rounded text-xs text-slate-700 font-medium border border-slate-200 flex items-start gap-2">
          <Info className="w-4 h-4 shrink-0 mt-0.5 text-[#C9A227]" />
          <span>
            <strong>Status de Operação:</strong> QR Code e URL pública estão{' '}
            <strong>pendentes de confirmação</strong>. Nenhum domínio externo foi inventado e nenhum
            gerador de QR code operará sem homologação ética prévia.
          </span>
        </div>
      </div>

      {/* MODAL BLOQUEANTE DE ATIVAÇÃO DE PUBLICAÇÃO */}
      {blockingModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-ethics-title"
        >
          <div className="bg-white rounded-lg max-w-lg w-full p-6 shadow-2xl border-2 border-[#0A1F33] space-y-5 animate-scale-up">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-[#0A1F33] flex items-center justify-center shrink-0 border border-[#C9A227]/40">
                <ShieldAlert className="w-6 h-6 text-[#C9A227]" />
              </div>
              <div className="space-y-1">
                <h3 id="modal-ethics-title" className="font-bold text-base text-[#0A1F33]">
                  Publicação Bloqueada — Conformidade Ética OAB
                </h3>
                <p className="text-xs text-[#A68218] font-semibold">
                  Ação não autorizada pelo protocolo deontológico
                </p>
              </div>
            </div>

            <div className="text-xs sm:text-sm text-slate-800 leading-relaxed bg-slate-50 p-4 rounded-md border border-slate-200 space-y-2">
              <p>
                <strong>Aviso Deontológico:</strong> Publicação e divulgação dos relatos exigem
                autorização prévia específica do cliente, revisão ética OAB e decisão do
                responsável.
              </p>
              <p className="text-[#B3261E] font-medium">Autorização do cliente não basta.</p>
              <p className="text-xs text-slate-500">Deseja manter a publicação desativada?</p>
            </div>

            {/* Botões do Modal: Sempre mantém desativada */}
            <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={handleModalBack}
                className="w-full sm:w-auto px-4 py-2 rounded-md border border-slate-300 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A227]"
              >
                Voltar
              </button>
              <button
                type="button"
                onClick={handleModalKeepDisabled}
                className="w-full sm:w-auto px-5 py-2 rounded-md bg-[#0A1F33] text-[#E5C048] border border-[#C9A227]/40 text-xs font-semibold hover:bg-[#132E4A] active:scale-[0.98] transition-all shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A227]"
              >
                Manter Desativada
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
