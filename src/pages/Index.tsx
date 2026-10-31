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
  Quote,
  User,
  HeartHandshake,
  MessageSquareHeart,
} from 'lucide-react'
import {
  listApprovedReports,
  submitReport,
  getReportVideoUrl,
  ReportRecord,
} from '@/services/reports'

// Extrai até 2 iniciais do nome para o avatar elegante
function getInitials(name?: string): string {
  if (!name || name.trim().toLowerCase() === 'anônimo') return ''
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

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
  const [cameraLoading, setCameraLoading] = useState(false)
  const [cameraActive, setCameraActive] = useState(false)

  const videoPreviewRef = useRef<HTMLVideoElement | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<number | null>(null)

  // Carrega relatos aprovados ao montar a página (somente dados reais do banco)
  const loadReports = async () => {
    setLoading(true)
    try {
      const data = await listApprovedReports()
      setReports(data || [])
    } catch (_) {
      setReports([])
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
    if (videoPreviewRef.current) {
      videoPreviewRef.current.srcObject = null
    }
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    setIsRecording(false)
    setCameraActive(false)
    setCameraLoading(false)
  }

  // Abre câmera com tratamento resiliente (áudio/vídeo e fallback)
  const startCamera = async () => {
    setCameraError(null)
    setCameraLoading(true)

    // Se já havia stream anterior, encerra
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError('Seu navegador não suporta captura direta de vídeo da câmera.')
      setCameraLoading(false)
      return
    }

    try {
      let stream: MediaStream
      try {
        // Tenta câmera frontal/usuário com áudio
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'user',
            width: { ideal: 1280, max: 1920 },
            height: { ideal: 720, max: 1080 },
          },
          audio: true,
        })
      } catch (audioOrConstraintsErr) {
        // Fallback: se falhar por restrição ou áudio, tenta só vídeo ou genérico
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true,
          })
        } catch (_) {
          // Último recurso: somente vídeo
          stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false,
          })
        }
      }

      streamRef.current = stream
      setCameraActive(true)

      // Vincula ao elemento <video> caso já esteja montado
      if (videoPreviewRef.current) {
        videoPreviewRef.current.srcObject = stream
        try {
          await videoPreviewRef.current.play()
        } catch (_) {
          // Autoplay policy pode ser silencioso em muted
        }
      }
    } catch (err: unknown) {
      const errorObj = err as { name?: string; message?: string }
      if (errorObj?.name === 'NotAllowedError' || errorObj?.name === 'PermissionDeniedError') {
        setCameraError(
          'Permissão de câmera ou microfone negada. Autorize o acesso no ícone de cadeado do seu navegador para filmar seu relato.',
        )
      } else if (errorObj?.name === 'NotFoundError' || errorObj?.name === 'DevicesNotFoundError') {
        setCameraError('Nenhuma câmera ou microfone foi detectado no seu dispositivo.')
      } else if (errorObj?.name === 'NotReadableError' || errorObj?.name === 'TrackStartError') {
        setCameraError(
          'A câmera já está sendo usada por outro aplicativo ou aba do navegador. Feche o outro programa e tente novamente.',
        )
      } else {
        setCameraError(
          'Não foi possível inicializar a câmera. Verifique as permissões de vídeo e microfone do seu navegador.',
        )
      }
      setCameraActive(false)
    } finally {
      setCameraLoading(false)
    }
  }

  // Quando o modo vídeo estiver ativo no modal e não houver vídeo gravado pronto, garante que a câmera abra e se conecte ao <video>
  useEffect(() => {
    if (
      modalOpen &&
      mode === 'video' &&
      !recordedVideoUrl &&
      !streamRef.current &&
      !cameraLoading &&
      !cameraError
    ) {
      startCamera()
    }
  }, [modalOpen, mode, recordedVideoUrl, cameraLoading, cameraError])

  // Vincula stream ativo ao videoPreviewRef sempre que ele for montado ou o stream mudar
  useEffect(() => {
    if (videoPreviewRef.current && streamRef.current && !recordedVideoUrl) {
      if (videoPreviewRef.current.srcObject !== streamRef.current) {
        videoPreviewRef.current.srcObject = streamRef.current
        videoPreviewRef.current.play().catch(() => {})
      }
    }
  })

  // Inicia gravação
  const startRecording = () => {
    if (!streamRef.current) {
      startCamera()
      return
    }
    chunksRef.current = []
    try {
      // Determina o melhor mimeType suportado no navegador (Chrome, Safari, Firefox, Edge)
      const mimeTypes = [
        'video/webm;codecs=vp9,opus',
        'video/webm;codecs=vp8,opus',
        'video/webm',
        'video/mp4;codecs=avc1,mp4a.40.2',
        'video/mp4',
      ]
      let selectedMime = ''
      if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported) {
        for (const m of mimeTypes) {
          if (MediaRecorder.isTypeSupported(m)) {
            selectedMime = m
            break
          }
        }
      }

      const options: MediaRecorderOptions = selectedMime ? { mimeType: selectedMime } : {}
      const recorder = new MediaRecorder(streamRef.current, options)

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          chunksRef.current.push(e.data)
        }
      }

      recorder.onstop = () => {
        const finalType = recorder.mimeType || selectedMime || 'video/webm'
        const blob = new Blob(chunksRef.current, { type: finalType })
        setRecordedBlob(blob)
        const objectUrl = URL.createObjectURL(blob)
        setRecordedVideoUrl(objectUrl)
        // Libera a câmera física após concluir a gravação
        stopCameraStream()
      }

      recorder.start(250)
      mediaRecorderRef.current = recorder
      setIsRecording(true)
      setRecordingTime(0)

      timerRef.current = window.setInterval(() => {
        setRecordingTime((prev) => {
          if (prev >= 60) {
            stopRecording()
            return 60
          }
          return prev + 1
        })
      }, 1000)
    } catch (e) {
      setCameraError('Erro ao iniciar a gravação do vídeo. Tente novamente.')
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

  // Reset do vídeo para regravar (descartar gravação atual e reabrir a câmera)
  const handleRetakeVideo = () => {
    if (recordedVideoUrl) {
      URL.revokeObjectURL(recordedVideoUrl)
    }
    setRecordedBlob(null)
    setRecordedVideoUrl(null)
    setCameraError(null)
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
    setRecordedBlob(null)
    setRecordedVideoUrl(null)
    setModalOpen(false)
  }

  // Troca para modo vídeo
  const handleSwitchToVideo = () => {
    setMode('video')
    if (!recordedVideoUrl && !streamRef.current) {
      startCamera()
    }
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
      {/* Cabeçalho Elegante do Mural — Identidade Ferri & Ferri (Azul-Marinho #0A1F33 + Dourado #C9A227) */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0A1F33] via-[#0D253E] to-[#071624] text-white p-6 sm:p-9 border border-[#C9A227]/30 shadow-md">
        {/* Detalhe sutil de iluminação dourada no fundo */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 -right-24 w-80 h-80 rounded-full bg-[#C9A227]/10 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-[#132E4A]/40 blur-3xl"
        />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-[#C9A227]/15 text-[#E5C048] border border-[#C9A227]/40 shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-[#C9A227]" />
              <span>Mural de Experiência do Cliente</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white leading-tight">
              O que nossos clientes dizem
            </h1>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
              Um espaço transparente e seguro dedicado a relatos sobre o acolhimento, dedicação e
              pontualidade do escritório{' '}
              <strong className="text-white font-semibold">Ferri &amp; Ferri Advogados</strong>.
            </p>
          </div>

          {/* Botão Convidativo e Destacado "Deixe seu relato" */}
          <button
            type="button"
            onClick={handleOpenModal}
            className="group relative inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#C9A227] to-[#E5C048] text-[#0A1F33] font-bold text-sm tracking-wide shadow-lg shadow-[#C9A227]/20 hover:shadow-xl hover:shadow-[#C9A227]/30 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer shrink-0 border border-[#F3E5A5]/60"
          >
            <PlusCircle className="w-5 h-5 text-[#0A1F33] group-hover:rotate-90 transition-transform duration-300" />
            <span>Deixe seu relato</span>
          </button>
        </div>
      </section>

      {/* Grade de Relatos Aprovados */}
      <section className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1 border-b border-slate-200/80">
          <div className="flex items-center gap-2.5">
            <h2 className="text-lg font-bold text-[#0A1F33] tracking-tight">Relatos Aprovados</h2>
            <span className="text-xs font-semibold text-[#0A1F33] bg-[#C9A227]/15 border border-[#C9A227]/30 px-2.5 py-0.5 rounded-full">
              {reports.length}
            </span>
          </div>
          <span className="text-xs text-slate-500 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-[#C9A227]" />
            Publicação moderada pela equipe do escritório
          </span>
        </div>

        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-[#C9A227]" />
            <p className="text-xs font-medium text-slate-500">Carregando relatos aprovados...</p>
          </div>
        ) : reports.length === 0 ? (
          /* Estado Vazio Amigável */
          <div className="bg-white rounded-2xl p-10 sm:p-14 border border-slate-200 text-center space-y-4 shadow-xs">
            <div className="w-14 h-14 rounded-full bg-[#0A1F33]/5 border border-[#C9A227]/30 flex items-center justify-center mx-auto text-[#0A1F33]">
              <MessageSquareHeart className="w-7 h-7 text-[#C9A227]" />
            </div>
            <div className="max-w-md mx-auto space-y-1.5">
              <h3 className="text-base font-bold text-[#0A1F33]">
                Ainda não há relatos aprovados em exibição
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Sua experiência é fundamental para nós. Compartilhe como foi o seu acolhimento e a
                dedicação dos profissionais da Ferri &amp; Ferri.
              </p>
            </div>
            <button
              type="button"
              onClick={handleOpenModal}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#0A1F33] text-[#E5C048] border border-[#C9A227]/40 text-xs font-semibold hover:bg-[#132E4A] transition-all cursor-pointer shadow-xs"
            >
              <PlusCircle className="w-4 h-4 text-[#C9A227]" />
              Seja o primeiro a deixar seu relato
            </button>
          </div>
        ) : (
          /* Grid Responsivo de Cards Refinados */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {reports.map((item) => {
              const isAnon = !item.author || item.author.trim().toLowerCase() === 'anônimo'
              const initials = getInitials(item.author)

              return (
                <article
                  key={item.id}
                  className="group bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-xs hover:shadow-md hover:border-[#C9A227]/40 transition-all duration-200 flex flex-col justify-between space-y-4 relative"
                >
                  <div className="space-y-3.5">
                    {/* Header do Card: Avatar / Iniciais + Nome + Tipo */}
                    <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-100">
                      <div className="flex items-center gap-2.5 min-w-0">
                        {isAnon ? (
                          <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 text-slate-500">
                            <User className="w-4 h-4" />
                          </div>
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-[#0A1F33] border border-[#C9A227]/40 flex items-center justify-center shrink-0 text-[#E5C048] text-xs font-bold tracking-wider">
                            {initials}
                          </div>
                        )}

                        <div className="min-w-0">
                          {isAnon ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
                              Anônimo
                            </span>
                          ) : (
                            <h3 className="font-bold text-sm text-[#0A1F33] truncate">
                              {item.author}
                            </h3>
                          )}
                        </div>
                      </div>

                      {/* Badge de tipo de relato */}
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-[#0A1F33]/5 text-[#0A1F33] border border-[#C9A227]/30 shrink-0">
                        {item.tipo === 'video' ? (
                          <>
                            <Video className="w-3 h-3 text-[#A68218]" />
                            <span>Vídeo</span>
                          </>
                        ) : (
                          <>
                            <FileText className="w-3 h-3 text-[#A68218]" />
                            <span>Texto</span>
                          </>
                        )}
                      </span>
                    </div>

                    {/* Player de Vídeo com Aparência Limpa */}
                    {item.tipo === 'video' && item.video_file ? (
                      <div className="rounded-xl overflow-hidden bg-slate-950 border border-slate-200 aspect-video flex items-center justify-center shadow-inner relative group/video">
                        <video
                          src={getReportVideoUrl(item)}
                          controls
                          className="w-full h-full object-cover"
                          preload="metadata"
                        />
                      </div>
                    ) : null}

                    {/* Texto do Relato */}
                    {item.texto ? (
                      <div className="relative pt-1">
                        <Quote className="w-4 h-4 text-[#C9A227]/40 mb-1" />
                        <p className="text-xs sm:text-[13px] text-slate-700 leading-relaxed font-normal italic pl-2 border-l-2 border-[#C9A227]/40 whitespace-pre-line">
                          "{item.texto}"
                        </p>
                      </div>
                    ) : null}
                  </div>

                  {/* Rodapé do Card: Data formatada + Selo Aprovado */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                    <span className="truncate max-w-[180px]">
                      {item.received_at_sp || 'Recentemente'}
                    </span>
                    <span className="inline-flex items-center gap-1 font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 shrink-0">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>Aprovado</span>
                    </span>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </section>

      {/* MODAL "DEIXE SEU RELATO" (Escrever / Filmar) — Design Elegante */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0A1F33]/70 backdrop-blur-xs animate-fade-in"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-5 animate-scale-up max-h-[92vh] overflow-y-auto">
            {/* Cabeçalho do Modal */}
            <div className="flex items-start justify-between pb-4 border-b border-slate-200">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#0A1F33]/5 text-[#0A1F33] border border-[#C9A227]/30">
                  <HeartHandshake className="w-3 h-3 text-[#C9A227]" />
                  <span>Sua Opinião Importa</span>
                </div>
                <h3 className="font-bold text-lg sm:text-xl text-[#0A1F33] tracking-tight">
                  Deixe seu relato
                </h3>
                <p className="text-xs text-slate-500 leading-normal">
                  Conte como foi sua experiência com a equipe do escritório.
                </p>
              </div>
              <button
                type="button"
                onClick={handleCloseModal}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                aria-label="Fechar formulário"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Alternador Elegante: Escrever vs Filmar */}
            <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 rounded-xl text-xs font-semibold">
              <button
                type="button"
                onClick={handleSwitchToTexto}
                className={`flex items-center justify-center gap-2 py-2.5 rounded-lg transition-all cursor-pointer ${
                  mode === 'texto'
                    ? 'bg-[#0A1F33] text-white shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <FileText
                  className={`w-4 h-4 ${mode === 'texto' ? 'text-[#C9A227]' : 'text-slate-500'}`}
                />
                <span>Escrever</span>
              </button>
              <button
                type="button"
                onClick={handleSwitchToVideo}
                className={`flex items-center justify-center gap-2 py-2.5 rounded-lg transition-all cursor-pointer ${
                  mode === 'video'
                    ? 'bg-[#0A1F33] text-white shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Video
                  className={`w-4 h-4 ${mode === 'video' ? 'text-[#C9A227]' : 'text-slate-500'}`}
                />
                <span>Filmar</span>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Campo Nome (Opcional) */}
              <div className="space-y-1.5">
                <label
                  htmlFor="input-author"
                  className="text-xs font-semibold text-slate-700 flex items-center justify-between"
                >
                  <span>Seu Nome</span>
                  <span className="text-slate-400 font-normal text-[11px]">
                    Opcional (ou em branco para "Anônimo")
                  </span>
                </label>
                <input
                  id="input-author"
                  type="text"
                  maxLength={80}
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  placeholder="Ex: Mariana Silva ou deixe em branco"
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0A1F33] focus:border-[#0A1F33] text-slate-900 placeholder:text-slate-400"
                />
              </div>

              {/* MODO TEXTO: Textarea com contador */}
              {mode === 'texto' && (
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <label htmlFor="input-texto" className="font-semibold text-slate-700">
                      Seu Relato <span className="text-red-600">*</span>
                    </label>
                    <span className="text-slate-400 text-[10px] font-mono">
                      {texto.length}/2000
                    </span>
                  </div>
                  <textarea
                    id="input-texto"
                    rows={4}
                    maxLength={2000}
                    value={texto}
                    onChange={(e) => setTexto(e.target.value)}
                    placeholder="Conte como foi sua experiência com o acolhimento, pontualidade e transparência da equipe Ferri & Ferri..."
                    className="w-full p-3 text-xs sm:text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0A1F33] focus:border-[#0A1F33] text-slate-900 placeholder:text-slate-400 leading-relaxed"
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
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                      <span>{cameraError}</span>
                    </div>
                  )}

                  {/* Preview da Câmera ou Reprodução do Vídeo Gravado */}
                  <div className="relative bg-slate-950 rounded-xl overflow-hidden aspect-video flex items-center justify-center border border-slate-300 shadow-inner group/viewer">
                    {recordedVideoUrl ? (
                      /* Vídeo gravado pronto para revisão do usuário */
                      <div className="relative w-full h-full flex flex-col justify-center bg-black">
                        <video
                          key={recordedVideoUrl}
                          src={recordedVideoUrl}
                          controls
                          playsInline
                          autoPlay
                          className="w-full h-full object-contain"
                        />
                        <div className="absolute top-2.5 left-2.5 pointer-events-none bg-emerald-600/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm backdrop-blur-xs">
                          <CheckCircle2 className="w-3 h-3 text-white" />
                          <span>Pré-visualização do vídeo</span>
                        </div>
                      </div>
                    ) : (
                      /* Feed ao vivo da webcam */
                      <div className="relative w-full h-full flex items-center justify-center bg-slate-950">
                        <video
                          ref={videoPreviewRef}
                          muted
                          autoPlay
                          playsInline
                          className="w-full h-full object-cover scale-x-[-1]"
                        />

                        {/* Estado de carregamento ou sem stream */}
                        {cameraLoading && (
                          <div className="absolute inset-0 bg-slate-950/80 flex flex-col items-center justify-center text-white gap-2 z-10">
                            <Loader2 className="w-6 h-6 animate-spin text-[#C9A227]" />
                            <span className="text-xs text-slate-300">Conectando sua câmera...</span>
                          </div>
                        )}

                        {!cameraLoading && !cameraActive && !cameraError && (
                          <div className="absolute inset-0 bg-slate-950 flex flex-col items-center justify-center text-slate-400 gap-2 p-4 text-center">
                            <Camera className="w-8 h-8 text-slate-500" />
                            <p className="text-xs text-slate-400 max-w-xs">
                              Clique em "Ativar Câmera" para se ver na tela antes de iniciar.
                            </p>
                            <button
                              type="button"
                              onClick={startCamera}
                              className="mt-1 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#0A1F33] text-[#E5C048] border border-[#C9A227]/40 text-xs font-semibold hover:bg-[#132E4A] cursor-pointer"
                            >
                              <Camera className="w-3.5 h-3.5 text-[#C9A227]" />
                              <span>Ativar Câmera</span>
                            </button>
                          </div>
                        )}

                        {/* Indicador ao vivo */}
                        {cameraActive && !isRecording && (
                          <div className="absolute top-2.5 left-2.5 bg-black/60 text-emerald-400 text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1.5 shadow-xs border border-emerald-500/30 backdrop-blur-xs">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            <span>Câmera conectada • Você está se vendo</span>
                          </div>
                        )}

                        {/* Contador de tempo de gravação em andamento */}
                        {isRecording && (
                          <div className="absolute top-3 left-3 bg-red-600 text-white text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-md animate-pulse z-10">
                            <span className="w-2 h-2 rounded-full bg-white" />
                            <span>
                              Gravando 00:{String(recordingTime).padStart(2, '0')} / 01:00
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Controles de Gravação e Revisão */}
                  <div className="flex flex-col items-center justify-center gap-2 pt-1">
                    {!recordedVideoUrl ? (
                      !isRecording ? (
                        <div className="flex flex-wrap items-center justify-center gap-2.5">
                          <button
                            type="button"
                            onClick={startRecording}
                            disabled={cameraLoading || (!!cameraError && !cameraActive)}
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-red-600 text-white text-xs font-bold hover:bg-red-700 transition-colors cursor-pointer disabled:opacity-50 shadow-xs active:scale-[0.98]"
                          >
                            <Camera className="w-4 h-4" />
                            <span>{cameraActive ? 'Gravar Vídeo' : 'Ativar e Gravar'}</span>
                          </button>
                          {!cameraActive && (
                            <button
                              type="button"
                              onClick={startCamera}
                              disabled={cameraLoading}
                              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-lg border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors cursor-pointer"
                            >
                              <Camera className="w-3.5 h-3.5 text-slate-500" />
                              <span>Testar Câmera</span>
                            </button>
                          )}
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={stopRecording}
                          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-slate-900 text-white text-xs font-bold hover:bg-black transition-colors cursor-pointer shadow-xs active:scale-[0.98]"
                        >
                          <Square className="w-3.5 h-3.5 fill-white" />
                          <span>Concluir Gravação</span>
                        </button>
                      )
                    ) : (
                      /* Painel de Ações pós-gravação: Regravar (descartar) ou Confirmar para salvar */
                      <div className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 flex flex-col sm:flex-row items-center justify-between gap-2.5">
                        <div className="text-left w-full sm:w-auto">
                          <p className="text-xs font-bold text-[#0A1F33] flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span>Vídeo pronto para envio!</span>
                          </p>
                          <p className="text-[11px] text-slate-500">
                            Assista à gravação acima. Se não gostar, pode regravar.
                          </p>
                        </div>
                        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                          <button
                            type="button"
                            onClick={handleRetakeVideo}
                            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-300 bg-white text-slate-700 text-xs font-semibold hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer shadow-2xs"
                          >
                            <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
                            <span>Regravar (descartar)</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Campo de comentário opcional para acompanhar o vídeo */}
                  <div className="space-y-1 pt-1">
                    <label
                      htmlFor="input-video-comment"
                      className="text-[11px] font-medium text-slate-600"
                    >
                      Legenda ou comentário curto (Opcional):
                    </label>
                    <input
                      id="input-video-comment"
                      type="text"
                      maxLength={300}
                      value={texto}
                      onChange={(e) => setTexto(e.target.value)}
                      placeholder="Ex: Gravado após a consulta presencial"
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 text-slate-900"
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
                    Autorizo a exibição pública do meu relato no mural de avaliações do escritório{' '}
                    <strong className="text-slate-900">Ferri &amp; Ferri Advogados</strong> após a
                    devida aprovação.
                  </span>
                </label>
              </div>

              {/* Frase curta de privacidade */}
              <div className="text-[11px] text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-200 flex items-start gap-2 leading-relaxed">
                <ShieldCheck className="w-4 h-4 text-[#C9A227] shrink-0 mt-0.5" />
                <span>
                  <strong>Privacidade garantida:</strong> Seu relato passa por aprovação prévia e
                  pode ser retirado a qualquer momento mediante solicitação ao escritório.
                </span>
              </div>

              {/* Mensagem de Feedback */}
              {feedback && (
                <div
                  className={`p-3.5 rounded-lg text-xs flex items-start gap-2.5 ${
                    feedback.type === 'success'
                      ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                      : 'bg-red-50 text-red-900 border border-red-200'
                  }`}
                >
                  {feedback.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  )}
                  <span className="leading-relaxed">{feedback.message}</span>
                </div>
              )}

              {/* Botões do Modal */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting || !consentimento || (mode === 'video' && !recordedBlob)}
                  className="px-6 py-2.5 rounded-lg bg-[#0A1F33] text-[#E5C048] border border-[#C9A227]/40 text-xs font-bold hover:bg-[#132E4A] hover:shadow-md active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer shadow-xs"
                >
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>
                    {mode === 'video' && recordedBlob ? 'Salvar e Enviar Vídeo' : 'Enviar Relato'}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
