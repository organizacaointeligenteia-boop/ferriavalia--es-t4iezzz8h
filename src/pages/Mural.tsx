import React, { useState, useRef, useEffect } from 'react'
import QRCode from 'qrcode'
import {
  AlertTriangle,
  EyeOff,
  ShieldAlert,
  Calendar,
  Info,
  CheckCircle2,
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

  // --- Estado do Gerador de QR Demonstrativo (Integralmente Local) ---
  const [urlInput, setUrlInput] = useState('')
  const [confirmed, setConfirmed] = useState(false)
  const [generatedQRUrl, setGeneratedQRUrl] = useState<string | null>(null)
  const [generationError, setGenerationError] = useState<string | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  // Validação estritamente sintática/local da URL HTTPS (sem requisição de rede)
  const validateUrl = (raw: string): { valid: boolean; reason?: string } => {
    if (!raw || raw.trim() === '') {
      return { valid: false, reason: 'Informe uma URL HTTPS.' }
    }
    if (raw.length > 512) {
      return { valid: false, reason: 'A URL excede o limite máximo de 512 caracteres.' }
    }
    // Rejeitar espaços em branco
    if (/\s/.test(raw)) {
      return { valid: false, reason: 'A URL não pode conter espaços.' }
    }
    // Rejeitar caracteres de controle
    // eslint-disable-next-line no-control-regex
    if (/[\x00-\x1F\x7F]/.test(raw)) {
      return { valid: false, reason: 'A URL contém caracteres de controle inválidos.' }
    }

    let parsed: URL
    try {
      parsed = new URL(raw)
    } catch {
      return { valid: false, reason: 'Formato de URL inválido.' }
    }

    // Apenas HTTPS é aceito (rejeitar expressamente http, javascript, data, etc.)
    if (parsed.protocol !== 'https:') {
      return { valid: false, reason: 'Apenas URLs com protocolo HTTPS (https://) são aceitas.' }
    }

    // Rejeitar credenciais na URL (user:pass@)
    if (parsed.username || parsed.password) {
      return {
        valid: false,
        reason: 'URLs com credenciais de autenticação (usuário/senha) não são permitidas.',
      }
    }

    // Rejeitar hostname vazio
    if (!parsed.hostname || parsed.hostname.length === 0) {
      return { valid: false, reason: 'O domínio da URL não pode ser vazio.' }
    }

    return { valid: true }
  }

  const validationResult = validateUrl(urlInput)
  const isUrlValid = validationResult.valid
  const canGenerate = isUrlValid && confirmed

  // Edição posterior da URL invalida a confirmação e remove o QR antigo gerado
  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nextVal = e.target.value.slice(0, 512)
    setUrlInput(nextVal)
    setConfirmed(false)
    setGeneratedQRUrl(null)
    setGenerationError(null)
  }

  const handleGenerateQR = async () => {
    if (!canGenerate) return
    try {
      setGenerationError(null)
      // Codificar EXATAMENTE o texto validado e confirmado, sem alterar ou cortar
      const textToEncode = urlInput
      setGeneratedQRUrl(textToEncode)
    } catch (err) {
      setGenerationError('Falha na geração local do QR code.')
    }
  }

  // Renderização local do QR Code via Canvas quando generatedQRUrl for definido
  useEffect(() => {
    if (generatedQRUrl && canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, generatedQRUrl, {
        width: 220,
        margin: 2,
        color: {
          dark: '#0A1F33', // Azul-marinho oficial
          light: '#FFFFFF',
        },
        errorCorrectionLevel: 'M',
      }).catch(() => {
        setGenerationError('Não foi possível renderizar o QR code localmente.')
      })
    }
  }, [generatedQRUrl])

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
      <div className="bg-white rounded-lg p-5 sm:p-6 border border-slate-200 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5 text-[#0A1F33]">
            <QrCode className="w-5 h-5 text-[#C9A227]" />
            <h3 className="font-bold text-sm sm:text-base">QR Code Demonstrativo de Coleta</h3>
          </div>
          <span className="inline-flex items-center gap-1.5 self-start sm:self-auto text-[11px] font-semibold bg-[#C9A227]/15 text-[#0A1F33] border border-[#C9A227]/40 px-2.5 py-0.5 rounded">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C9A227]" />
            GERADOR DEMONSTRATIVO LOCAL
          </span>
        </div>

        {/* Esclarecimento de Governança e Segurança */}
        <div className="bg-[#0A1F33]/5 p-3.5 rounded text-xs text-slate-700 leading-relaxed border border-[#C9A227]/30 space-y-1.5">
          <div className="flex items-start gap-2">
            <Info className="w-4 h-4 shrink-0 mt-0.5 text-[#C9A227]" />
            <span>
              <strong>Aviso de Implantação e Segurança:</strong> A URL pública real de coleta
              precisa ser formalmente escolhida e homologada pelo responsável técnico e depende de
              implantação e requisitos de segurança previamente aprovados. A coleta pública e os
              embeds permanecem <strong className="text-[#B3261E]">desativados</strong>.
            </span>
          </div>
          <p className="text-[11px] text-slate-500 pl-6">
            O gerador abaixo opera <strong>integralmente no seu navegador</strong> (renderização
            local em canvas, sem qualquer envio a servidores externos ou APIs de terceiros).
          </p>
        </div>

        {/* Formulário de Configuração Local do QR Code */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 sm:p-5 space-y-4">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <label htmlFor="qr-destination-url" className="text-xs font-bold text-[#0A1F33]">
                URL de Destino HTTPS para Teste Demonstrativo:
              </label>
              <span className="text-[10px] font-mono text-slate-500">
                {urlInput.length}/512 caracteres
              </span>
            </div>

            <input
              id="qr-destination-url"
              type="text"
              value={urlInput}
              onChange={handleUrlChange}
              maxLength={512}
              placeholder=""
              className="w-full px-3 py-2 text-xs font-mono bg-white border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-[#C9A227] focus:border-transparent text-slate-900 placeholder:text-slate-400"
              autoComplete="off"
              spellCheck={false}
            />

            {/* Texto Orientativo Curto sobre Proteção de Dados */}
            <p className="text-[11px] text-slate-500 leading-normal">
              <strong>Proteção de dados e sigilo:</strong> Não insira dados pessoais, nomes de
              clientes, tokens, credenciais ou segredos na URL. Para testes neste protótipo, utilize
              apenas o endereço sintético seguro:{' '}
              <button
                type="button"
                onClick={() => {
                  setUrlInput('https://e2e-synth.example.invalid/coleta')
                  setConfirmed(false)
                  setGeneratedQRUrl(null)
                  setGenerationError(null)
                }}
                className="font-mono text-[#0A1F33] underline decoration-[#C9A227] hover:text-[#A68218] cursor-pointer"
                title="Inserir URL sintética de teste"
              >
                https://e2e-synth.example.invalid/coleta
              </button>
            </p>

            {/* Feedback sintático da validação (se preenchido) */}
            {urlInput.length > 0 && !isUrlValid && (
              <div className="text-[11px] text-[#B3261E] font-medium flex items-center gap-1.5 pt-0.5">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                <span>{validationResult.reason}</span>
              </div>
            )}
          </div>

          {/* Exibição do Texto EXATO do Destino que será codificado */}
          <div className="space-y-1 bg-white p-3 rounded border border-slate-200">
            <span className="text-[11px] font-semibold text-slate-600 block">
              Texto exato a ser codificado no QR (sem alterações, normalizações ou parâmetros
              extras):
            </span>
            <div className="font-mono text-xs break-all bg-slate-50 p-2 rounded border border-slate-100 min-h-[32px] flex items-center text-[#0A1F33]">
              {urlInput.length > 0 ? (
                <span>{urlInput}</span>
              ) : (
                <span className="text-slate-400 italic text-[11px]">
                  (Nenhum texto informado — campo inicialmente vazio)
                </span>
              )}
            </div>
          </div>

          {/* Checkbox de Confirmação (desmarcado por padrão) */}
          <div className="flex items-start gap-2.5 pt-1">
            <input
              id="qr-confirm-checkbox"
              type="checkbox"
              checked={confirmed}
              disabled={!isUrlValid}
              onChange={(e) => setConfirmed(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-slate-300 text-[#0A1F33] focus:ring-[#C9A227] cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
            />
            <label
              htmlFor="qr-confirm-checkbox"
              className={`text-xs leading-relaxed select-none ${
                isUrlValid ? 'text-slate-700 cursor-pointer' : 'text-slate-400 cursor-not-allowed'
              }`}
            >
              Confirmo que verifiquei o texto exato da URL acima, que ela não contém dados pessoais
              ou credenciais e que se trata de uma demonstração estritamente local.
            </label>
          </div>

          {/* Botão de Geração (habilitado SOMENTE após URL válida + confirmação marcada) */}
          <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              type="button"
              onClick={handleGenerateQR}
              disabled={!canGenerate}
              className={`px-4 py-2 rounded text-xs font-semibold transition-all flex items-center justify-center gap-2 ${
                canGenerate
                  ? 'bg-[#0A1F33] text-[#E5C048] border border-[#C9A227]/40 hover:bg-[#132E4A] active:scale-[0.98] shadow-xs cursor-pointer'
                  : 'bg-slate-200 text-slate-400 border border-slate-300 cursor-not-allowed'
              }`}
            >
              <QrCode className="w-4 h-4" />
              <span>Gerar QR Code Demonstrativo</span>
            </button>

            {!canGenerate && urlInput.length > 0 && (
              <span className="text-[11px] text-slate-500 italic">
                {!isUrlValid
                  ? 'Corrija a URL para habilitar'
                  : !confirmed
                    ? 'Marque a caixa de confirmação acima'
                    : ''}
              </span>
            )}
          </div>
        </div>

        {/* Área de Exibição do QR Code Demonstrativo Gerado */}
        {generationError && (
          <div className="p-3 bg-red-50 border border-red-200 rounded text-xs text-[#B3261E]">
            {generationError}
          </div>
        )}

        {generatedQRUrl && (
          <div className="bg-white border-2 border-[#C9A227]/40 rounded-lg p-5 space-y-4 animate-fade-in shadow-xs">
            {/* Tarjas e Avisos Obrigatórios de Demonstração */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0A1F33] bg-[#C9A227]/25 px-2.5 py-1 rounded border border-[#C9A227]">
                <AlertTriangle className="w-3.5 h-3.5 text-[#0A1F33]" />
                QR CODE DEMONSTRATIVO — DESTINO NÃO VERIFICADO
              </span>
              <span className="text-[11px] font-bold text-[#B3261E] bg-red-50 border border-red-200 px-2 py-0.5 rounded">
                NÃO DISTRIBUIR PARA CLIENTES
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-6">
              {/* Canvas local */}
              <div className="bg-white p-3 rounded border border-slate-200 shadow-2xs flex flex-col items-center shrink-0">
                <canvas ref={canvasRef} className="max-w-[220px] max-h-[220px]" />
                <span className="text-[10px] text-slate-400 font-mono mt-1">
                  Renderização local (canvas)
                </span>
              </div>

              {/* Informações detalhadas do QR gerado */}
              <div className="space-y-2.5 text-xs text-slate-700 flex-1">
                <div className="flex items-center gap-1.5 text-emerald-800 font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Código gerado localmente com sucesso</span>
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] font-semibold text-slate-500">
                    Conteúdo exato codificado:
                  </span>
                  <div className="p-2 bg-slate-50 rounded border border-slate-200 font-mono text-[11px] break-all text-[#0A1F33]">
                    {generatedQRUrl}
                  </div>
                </div>

                <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded space-y-1 text-[11px] text-amber-900 leading-relaxed">
                  <p className="font-bold">Avisos Importantes de Demonstração:</p>
                  <ul className="list-disc list-inside space-y-0.5 text-slate-700">
                    <li>
                      <strong>Destino não verificado:</strong> Este código é apenas uma prévia
                      sintética.
                    </li>
                    <li>
                      <strong>NÃO distribuir para clientes:</strong> A coleta externa não está em
                      operação.
                    </li>
                    <li>
                      <strong>Sem download ou persistência:</strong> O código é volátil em memória e
                      não é gravado em disco ou storage.
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
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
