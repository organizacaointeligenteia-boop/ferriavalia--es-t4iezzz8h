import React, { useState, useRef, useEffect } from 'react'
import {
  Video,
  FileText,
  Camera,
  Square,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  X,
  Play,
  ShieldCheck,
  PlusCircle,
  Clock,
  Sparkles,
} from 'lucide-react'
import {
  listApprovedReports,
  submitReport,
  getReportVideoUrl,
  ReportRecord,
} from '@/services/reports'

// Exemplos iniciais ilustrativos caso o banco ainda esteja vazio
const INITIAL_DEMO_REPORTS: ReportRecord[] = [
  {
    id: 'demo-1',
    created: '2026-10-15T14:30:00Z',
    updated: '2026-10-15T14:30:00Z',
    author: 'Mariana S.',
    tipo: 'texto',
    texto:
      'Excelente atendimento e total pontualidade. A equipe explicou com toda a clareza e transparência os passos da nossa consulta.',
    consentimento: true,
    status_novo: 'aprovado',
    received_at_sp: '15/10/2026 às 14:30 (America/Sao_Paulo)',
  },
  {
    id: 'demo-2',
    created: '2026-10-14T10:15:00Z',
    updated: '2026-10-14T10:15:00Z',
    author: 'Anônimo',
    tipo: 'texto',
    texto:
      'Cordialidade impecável e ambiente muito acolhedor. Ficamos muito satisfeitos com a dedicação dos profissionais da Ferri & Ferri.',
    consentimento: true,
    status_novo: 'aprovado',
    received_at_sp: '14/10/2026 às 10:15 (America/Sao_Paulo)',
  },
]

export default function Index() {
  const [reports, setReports] = useState<ReportRecord[]>([])
  const [loading, setLoading] = useState(true)

  // Modal "Deixe seu relato"
  const [modalOpen, setModalOpen] = useState(false)
  const [mode, setMode] = useState<'texto' | 'video'>('texto')

  // Campos do formulário
  const [author, setAuthor] = useState('')
  const [texto, setTexto] = useState('')
  const [consentimento, setConsentimento] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null,
  )

  // Gravação de Vídeo via MediaRecorder
  const [isRecording, setIsRecording] = useState(false)
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null)
  const [recordedVideoUrl, setRecordedVideoUrl] = useState<string | null>(null)
  const [recordingTime, setRecordingTime] = useState(0)
  const [cameraError, setCameraError] = useState<string | null>(null)

  const videoPreviewRef = useRef<HTMLVideoElement | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<number | null>(null)

  // Carrega relatos aprovados ao montar a página
  const loadReports = async () => {
    setLoading(true)
    try {
      const data = await listApprovedReports()
      if (data && data.length > 0) {
        setReports(data)
      } else {
        setReports(INITIAL_DEMO_REPORTS)
      }
    } catch (_) {
      setReports(INITIAL_DEMO_REPORTS)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadReports()
  }, [])

  // Limpeza de stream de câmera
  const stopCameraStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    setIsRecording(false)
  }

  // Abre câmera
  const startCamera = async () => {
    setCameraError(null)
    setRecordedBlob(null)
    setRecordedVideoUrl(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
        audio: true,
      })
      streamRef.current = stream
      if (videoPreviewRef.current) {
        videoPreviewRef.current.srcObject = stream
        videoPreviewRef.current.play()
      }
    } catch (err) {
      setCameraError(
        'Não foi possível acessar a câmera ou microfone. Verifique as permissões do seu navegador.',
      )
    }
  }

  // Inicia gravação
  const startRecording = () => {
    if (!streamRef.current) return
    chunksRef.current = []
    try {
      const mime = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
        ? 'video/webm;codecs=vp9'
        : 'video/webm'
      const recorder = new MediaRecorder(streamRef.current, { mimeType: mime })

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          chunksRef.current.push(e.data)
        }
      }

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' })
        setRecordedBlob(blob)
        setRecordedVideoUrl(URL.createObjectURL(blob))
        // Para a câmera após a gravação
        stopCameraStream()
      }

      recorder.start(250)
      mediaRecorderRef.current = recorder
      setIsRecording(true)
      setRecordingTime(0)

      timerRef.current = window.setInterval(() => {
        setRecordingTime((prev) => {
          if (prev >= 60) {
            // Limite de 60 segundos
            stopRecording()
            return 60
          }
          return prev + 1
        })
      }, 1000)
    } catch (e) {
      setCameraError('Erro ao iniciar a gravação do vídeo.')
    }
  }

  // Para gravação
  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop()
    }
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    setIsRecording(false)
  }

  // Reset do vídeo para regravar
  const handleRetakeVideo = () => {
    if (recordedVideoUrl) {
      URL.revokeObjectURL(recordedVideoUrl)
    }
    setRecordedBlob(null)
    setRecordedVideoUrl(null)
    startCamera()
  }

  // Abre modal
  const handleOpenModal = () => {
    setModalOpen(true)
    setFeedback(null)
    setAuthor('')
    setTexto('')
    setConsentimento(false)
    setMode('texto')
    setRecordedBlob(null)
    setRecordedVideoUrl(null)
    setCameraError(null)
  }

  // Fecha modal
  const handleCloseModal = () => {
    stopCameraStream()
    if (recordedVideoUrl) {
      URL.revokeObjectURL(recordedVideoUrl)
    }
    setModalOpen(false)
  }

  // Troca para modo vídeo
  const handleSwitchToVideo = () => {
    setMode('video')
    setTimeout(() => {
      startCamera()
    }, 100)
  }

  // Troca para modo texto
  const handleSwitchToTexto = () => {
    stopCameraStream()
    setMode('texto')
  }

  // Envio do formulário
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!consentimento) {
      setFeedback({
        type: 'error',
        message: 'Você precisa marcar a caixa de consentimento para enviar seu relato.',
      })
      return
    }

    if (mode === 'texto' && !texto.trim()) {
      setFeedback({
        type: 'error',
        message: 'Por favor, escreva uma breve mensagem sobre o seu atendimento.',
      })
      return
    }

    if (mode === 'video' && !recordedBlob) {
      setFeedback({
        type: 'error',
        message: 'Por favor, grave o seu vídeo antes de enviar.',
      })
      return
    }

    setSubmitting(true)
    setFeedback(null)

    try {
      const res = await submitReport({
        author: author.trim() || 'Anônimo',
        tipo: mode,
        texto: texto.trim(),
        videoBlob: recordedBlob || undefined,
        consentimento: true,
      })

      setFeedback({
        type: 'success',
        message:
          res.message ||
          'Relato enviado com sucesso! Ele aparecerá no mural após a aprovação da nossa equipe.',
      })

      // Limpa os campos
      setAuthor('')
      setTexto('')
      setConsentimento(false)
      setRecordedBlob(null)
      setRecordedVideoUrl(null)
      stopCameraStream()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Ocorreu um erro ao enviar seu relato.'
      setFeedback({
        type: 'error',
        message: msg,
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Top Banner de Apresentação */}
      <section className="bg-white rounded-xl p-6 sm:p-8 border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#0A1F33]/10 text-[#0A1F33] border border-[#C9A227]/40">
            <Sparkles className="w-3.5 h-3.5 text-[#C9A227]" />
            Mural de Avaliações &amp; Experiência
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#0A1F33] tracking-tight">
            O que nossos clientes dizem
          </h1>
          <p className="text-sm text-slate-600 leading-relaxed">
            Espaço aberto para compartilhar percepções sobre o acolhimento, dedicação e pontualidade
            do escritório Ferri &amp; Ferri Advogados.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenModal}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-[#0A1F33] text-[#E5C048] border border-[#C9A227]/40 font-semibold text-sm hover:bg-[#132E4A] hover:shadow-md active:scale-[0.98] transition-all cursor-pointer shrink-0 shadow-xs"
        >
          <PlusCircle className="w-4 h-4 text-[#C9A227]" />
          Deixe seu relato
        </button>
      </section>

      {/* Grade de Relatos Aprovados */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-[#0A1F33] flex items-center gap-2">
            <span>Relatos Aprovados</span>
            <span className="text-xs font-normal text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
              {reports.length}
            </span>
          </h2>
          <span className="text-xs text-slate-500 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-[#C9A227]" />
            Publicação mediante aprovação da equipe
          </span>
        </div>

        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center text-slate-400 gap-3">
            <Loader2 className="w-7 h-7 animate-spin text-[#C9A227]" />
            <p className="text-xs">Carregando relatos aprovados...</p>
          </div>
        ) : reports.length === 0 ? (
          <div className="bg-white rounded-lg p-10 border border-slate-200 text-center space-y-3">
            <p className="text-sm text-slate-600">
              Ainda não há relatos aprovados em exibição no momento.
            </p>
            <button
              type="button"
              onClick={handleOpenModal}
              className="text-xs font-semibold text-[#0A1F33] underline decoration-[#C9A227] hover:text-[#A68218]"
            >
              Seja o primeiro a deixar um relato
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {reports.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-xl p-5 border border-slate-200 shadow-2xs hover:shadow-subtle transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2">
                    <span className="font-semibold text-sm text-[#0A1F33]">
                      {item.author || 'Anônimo'}
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-[#C9A227]/15 text-[#0A1F33] border border-[#C9A227]/30">
                      {item.tipo === 'video' ? (
                        <>
                          <Video className="w-3 h-3 text-[#A68218]" /> Vídeo
                        </>
                      ) : (
                        <>
                          <FileText className="w-3 h-3 text-[#A68218]" /> Texto
                        </>
                      )}
                    </span>
                  </div>

                  {item.tipo === 'video' && item.video_file ? (
                    <div className="rounded-lg overflow-hidden bg-slate-900 border border-slate-200 aspect-video flex items-center justify-center">
                      <video
                        src={getReportVideoUrl(item)}
                        controls
                        className="w-full h-full object-cover"
                        preload="metadata"
                      />
                    </div>
                  ) : null}

                  {item.texto ? (
                    <p className="text-xs text-slate-700 italic leading-relaxed whitespace-pre-line">
                      "{item.texto}"
                    </p>
                  ) : null}
                </div>

                <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span>{item.received_at_sp || 'Recentemente'}</span>
                  <span className="flex items-center gap-1 text-emerald-700 font-medium">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Aprovado
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* MODAL "DEIXE SEU RELATO" */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-scale-up max-h-[90vh] overflow-y-auto">
            {/* Cabeçalho do Modal */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="space-y-0.5">
                <h3 className="font-bold text-lg text-[#0A1F33]">Deixe seu relato</h3>
                <p className="text-xs text-slate-500">
                  Escolha como prefere compartilhar sua experiência.
                </p>
              </div>
              <button
                type="button"
                onClick={handleCloseModal}
                className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Alternador: Escrever vs Filmar */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-lg text-xs font-semibold">
              <button
                type="button"
                onClick={handleSwitchToTexto}
                className={`flex items-center justify-center gap-2 py-2 rounded-md transition-all ${
                  mode === 'texto'
                    ? 'bg-white text-[#0A1F33] shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <FileText className="w-3.5 h-3.5 text-[#C9A227]" />
                Escrever
              </button>
              <button
                type="button"
                onClick={handleSwitchToVideo}
                className={`flex items-center justify-center gap-2 py-2 rounded-md transition-all ${
                  mode === 'video'
                    ? 'bg-white text-[#0A1F33] shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Video className="w-3.5 h-3.5 text-[#C9A227]" />
                Filmar
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Campo Nome (Opcional) */}
              <div className="space-y-1">
                <label htmlFor="input-author" className="text-xs font-semibold text-slate-700">
                  Seu Nome{' '}
                  <span className="text-slate-400 font-normal">(Opcional ou "Anônimo")</span>
                </label>
                <input
                  id="input-author"
                  type="text"
                  maxLength={80}
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  placeholder="Ex: João Silva ou deixe em branco para Anônimo"
                  className="w-full px-3 py-2 text-xs rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0A1F33] text-slate-900"
                />
              </div>

              {/* MODO TEXTO: Textarea curta */}
              {mode === 'texto' && (
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <label htmlFor="input-texto" className="font-semibold text-slate-700">
                      Seu Relato <span className="text-red-600">*</span>
                    </label>
                    <span className="text-slate-400 text-[10px]">{texto.length}/2000</span>
                  </div>
                  <textarea
                    id="input-texto"
                    rows={4}
                    maxLength={2000}
                    value={texto}
                    onChange={(e) => setTexto(e.target.value)}
                    placeholder="Conte como foi sua experiência com a equipe Ferri & Ferri..."
                    className="w-full p-2.5 text-xs rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0A1F33] text-slate-900"
                  />
                </div>
              )}

              {/* MODO FILMAR: Gravação no navegador via MediaRecorder */}
              {mode === 'video' && (
                <div className="space-y-3">
                  <label className="text-xs font-semibold text-slate-700 block">
                    Gravação no Navegador <span className="text-red-600">*</span>
                  </label>

                  {cameraError && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-md text-xs text-red-700 flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                      <span>{cameraError}</span>
                    </div>
                  )}

                  {/* Preview da Câmera ou Reprodução do Vídeo Gravado */}
                  <div className="relative bg-black rounded-lg overflow-hidden aspect-video flex items-center justify-center border border-slate-300">
                    {recordedVideoUrl ? (
                      <video
                        src={recordedVideoUrl}
                        controls
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <video
                        ref={videoPreviewRef}
                        muted
                        playsInline
                        className="w-full h-full object-cover"
                      />
                    )}

                    {/* Contador de tempo de gravação */}
                    {isRecording && (
                      <div className="absolute top-3 left-3 bg-red-600 text-white text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1.5 animate-pulse">
                        <span className="w-2 h-2 rounded-full bg-white" />
                        00:{String(recordingTime).padStart(2, '0')} / 01:00
                      </div>
                    )}
                  </div>

                  {/* Controles de Gravação */}
                  <div className="flex items-center justify-center gap-3 pt-1">
                    {!recordedVideoUrl ? (
                      !isRecording ? (
                        <button
                          type="button"
                          onClick={startRecording}
                          disabled={!!cameraError}
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-red-600 text-white text-xs font-semibold hover:bg-red-700 transition-colors cursor-pointer disabled:opacity-50"
                        >
                          <Camera className="w-4 h-4" />
                          Iniciar Gravação
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={stopRecording}
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-slate-900 text-white text-xs font-semibold hover:bg-black transition-colors cursor-pointer"
                        >
                          <Square className="w-3.5 h-3.5 fill-white" />
                          Concluir Gravação
                        </button>
                      )
                    ) : (
                      <button
                        type="button"
                        onClick={handleRetakeVideo}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-slate-300 text-slate-700 text-xs font-medium hover:bg-slate-50 transition-colors"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        Gravar Novamente
                      </button>
                    )}
                  </div>

                  {/* Campo de comentário opcional para acompanhar o vídeo */}
                  <div className="space-y-1 pt-1">
                    <label
                      htmlFor="input-video-comment"
                      className="text-[11px] font-medium text-slate-600"
                    >
                      Comentário ou legenda curta (Opcional):
                    </label>
                    <input
                      id="input-video-comment"
                      type="text"
                      maxLength={300}
                      value={texto}
                      onChange={(e) => setTexto(e.target.value)}
                      placeholder="Ex: Vídeo gravado na consulta inicial"
                      className="w-full px-3 py-1.5 text-xs rounded border border-slate-300 text-slate-900"
                    />
                  </div>
                </div>
              )}

              {/* Checkbox de consentimento obrigatório — NUNCA pré-marcado */}
              <div className="pt-2 border-t border-slate-200">
                <label className="flex items-start gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={consentimento}
                    onChange={(e) => setConsentimento(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-slate-300 text-[#0A1F33] focus:ring-[#C9A227] cursor-pointer"
                  />
                  <span className="text-xs text-slate-700 leading-snug">
                    Autorizo a exibição pública do meu relato no mural de avaliações do escritório
                    Ferri &amp; Ferri Advogados após a devida aprovação.
                  </span>
                </label>
              </div>

              {/* Frase curta de privacidade */}
              <p className="text-[11px] text-slate-500 italic bg-slate-50 p-2.5 rounded border border-slate-200">
                Privacidade: seu relato pode ser removido a qualquer tempo mediante solicitação.
              </p>

              {/* Mensagem de Feedback */}
              {feedback && (
                <div
                  className={`p-3 rounded-md text-xs flex items-start gap-2 ${
                    feedback.type === 'success'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-red-50 text-red-800 border border-red-200'
                  }`}
                >
                  {feedback.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  )}
                  <span>{feedback.message}</span>
                </div>
              )}

              {/* Botões do Modal */}
              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 rounded-md border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting || !consentimento}
                  className="px-5 py-2 rounded-md bg-[#0A1F33] text-[#E5C048] border border-[#C9A227]/40 text-xs font-semibold hover:bg-[#132E4A] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 shadow-xs"
                >
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Enviar Relato
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
