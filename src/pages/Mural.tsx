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
      <div className="flex items-center justify-between bg-amber-50 border border-amber-200 text-[#8A6D1A] px-3.5 py-2 rounded-md text-xs">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 text-[#8A6D1A]" />
          <span>
            <strong>PRÉVIA FICTÍCIA E PRIVADA:</strong> O mural externo NÃO está ativo e não é
            público.
          </span>
        </div>
        <span className="text-[11px] font-semibold bg-[#8A6D1A] text-white px-2 py-0.5 rounded">
          DESATIVADO
        </span>
      </div>

      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#8A6D1A] uppercase tracking-wider">
            <EyeOff className="w-4 h-4" />
            Visualização Interna Experimental
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#0B3B4F] tracking-tight">
            Mural — Prévia Fictícia e Privada
          </h1>
          <p className="text-xs sm:text-sm text-[#52656B]">
            Exemplo visual de formato de relatos, rigorosamente restrito a amostras simuladas e
            mantido inoperante.
          </p>
        </div>

        {/* Toggle de ativação (Sempre desativado por design ético) */}
        <div className="flex items-center gap-3 bg-white p-2.5 rounded-lg border border-[#D8E2E0] shadow-2xs self-start sm:self-auto">
          <span className="text-xs font-semibold text-[#1A2E33]">Publicação Pública:</span>
          <button
            type="button"
            role="switch"
            aria-checked={toggleActive}
            onClick={handleToggleClick}
            className="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-stone-300 transition-colors duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B3B4F]"
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
      <div className="bg-[#8A6D1A]/10 border-2 border-[#8A6D1A]/40 rounded-lg p-5 sm:p-6 text-[#1A2E33] space-y-3">
        <div className="flex items-start gap-3">
          <ShieldAlert className="w-6 h-6 text-[#8A6D1A] shrink-0 mt-0.5" />
          <div className="space-y-2">
            <h2 className="font-bold text-base text-[#8A6D1A] tracking-tight">
              Este mural está DESATIVADO.
            </h2>
            <p className="text-xs sm:text-sm text-[#1A2E33] leading-relaxed">
              Publicação e embeds pendentes de revisão ética OAB e decisão específica do
              responsável. Não divulgue nomes, resultados, promessas, comparações ou testemunhos de
              êxito.
            </p>
            <div className="p-3 bg-white/80 rounded border border-[#8A6D1A]/30 text-xs text-[#52656B] leading-relaxed">
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
        <div className="flex items-center justify-between text-xs font-semibold text-[#52656B]">
          <span>
            Exemplos Fictícios de Relato (
            <code className="font-mono text-[#0B3B4F]">E2E_SYNTH_</code>)
          </span>
          <span className="text-[#8A6D1A]">Sem promessas ou alegações de êxito</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {MURAL_SYNTHETIC_CARDS.map((card) => (
            <div
              key={card.id}
              className="bg-white rounded-lg p-5 border border-[#D8E2E0] shadow-xs flex flex-col justify-between space-y-4 hover:shadow-subtle transition-all"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-sm text-[#0B3B4F]">
                    {card.clientFirstName}
                  </span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-[#8A6D1A]/15 text-[#8A6D1A] border border-[#8A6D1A]/30">
                    Fictício
                  </span>
                </div>

                <p className="text-xs text-[#1A2E33] italic leading-relaxed">"{card.quote}"</p>
              </div>

              <div className="pt-3 border-t border-[#D8E2E0]/60 space-y-1 text-[11px] text-[#52656B]">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3 h-3 text-[#52656B]" />
                  <span>Data: {card.experienceDate}</span>
                </div>
                <div className="text-[10px] text-[#52656B] font-mono">{card.timestamp}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Seção sobre QR Code / Divulgação Externa */}
      <div className="bg-white rounded-lg p-5 sm:p-6 border border-[#D8E2E0] space-y-3">
        <div className="flex items-center gap-2.5 text-[#0B3B4F]">
          <QrCode className="w-5 h-5 text-[#8A6D1A]" />
          <h3 className="font-bold text-sm sm:text-base">QR Code e Endereço Público de Coleta</h3>
        </div>
        <p className="text-xs sm:text-sm text-[#52656B] leading-relaxed">
          Nenhum QR code operacional é gerado sem uma URL pública institucional formalmente
          confirmada pela administração do escritório.
        </p>
        <div className="bg-[#F5F8F7] p-3 rounded text-xs text-[#8A6D1A] font-medium border border-[#D8E2E0] flex items-start gap-2">
          <Info className="w-4 h-4 shrink-0 mt-0.5 text-[#8A6D1A]" />
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
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-ethics-title"
        >
          <div className="bg-white rounded-lg max-w-lg w-full p-6 shadow-2xl border-2 border-[#8A6D1A] space-y-5 animate-scale-up">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                <ShieldAlert className="w-6 h-6 text-[#8A6D1A]" />
              </div>
              <div className="space-y-1">
                <h3 id="modal-ethics-title" className="font-bold text-base text-[#0B3B4F]">
                  Publicação Bloqueada — Conformidade Ética OAB
                </h3>
                <p className="text-xs text-[#8A6D1A] font-semibold">
                  Ação não autorizada pelo protocolo deontológico
                </p>
              </div>
            </div>

            <div className="text-xs sm:text-sm text-[#1A2E33] leading-relaxed bg-[#F5F8F7] p-4 rounded-md border border-[#D8E2E0] space-y-2">
              <p>
                <strong>Aviso Deontológico:</strong> Publicação e divulgação dos relatos exigem
                autorização prévia específica do cliente, revisão ética OAB e decisão do
                responsável.
              </p>
              <p className="text-[#B3261E] font-medium">Autorização do cliente não basta.</p>
              <p className="text-xs text-[#52656B]">Deseja manter a publicação desativada?</p>
            </div>

            {/* Botões do Modal: Sempre mantém desativada */}
            <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={handleModalBack}
                className="w-full sm:w-auto px-4 py-2 rounded-md border border-[#D8E2E0] text-xs font-semibold text-[#52656B] hover:bg-[#F5F8F7] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B3B4F]"
              >
                Voltar
              </button>
              <button
                type="button"
                onClick={handleModalKeepDisabled}
                className="w-full sm:w-auto px-5 py-2 rounded-md bg-[#0B3B4F] text-white text-xs font-semibold hover:bg-[#09546B] active:scale-[0.98] transition-all shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B3B4F]"
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
