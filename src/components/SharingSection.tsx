import React, { useEffect, useRef, useState } from 'react'
import QRCode from 'qrcode'
import {
  Share2,
  Copy,
  Check,
  Download,
  QrCode as QrCodeIcon,
  Code2,
  ExternalLink,
  Sparkles,
} from 'lucide-react'

export const PUBLIC_PRODUCTION_URL = 'https://ferri-ferri-relatos-e-experiencia-dbf86.goskip.app'

export default function SharingSection() {
  const [copiedLink, setCopiedLink] = useState(false)
  const [copiedEmbed, setCopiedEmbed] = useState(false)
  const [qrReady, setQrReady] = useState(false)
  const [qrError, setQrError] = useState<string | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  const embedSnippet = `<!-- Ferri & Ferri — Snippet de Embed do Mural de Avaliações -->
<div style="width: 100%; max-width: 1100px; margin: 0 auto; overflow: hidden; border-radius: 12px; box-shadow: 0 4px 20px rgba(10, 31, 51, 0.08);">
  <iframe
    src="${PUBLIC_PRODUCTION_URL}"
    title="Mural de Avaliações — Ferri & Ferri Advogados"
    width="100%"
    height="750"
    style="border: none; width: 100%; min-height: 700px; display: block;"
    loading="lazy"
    allow="camera; microphone; autoplay; encrypted-media"
  ></iframe>
</div>`

  useEffect(() => {
    if (!canvasRef.current) return
    setQrError(null)

    // Renderiza QR Code no canvas usando a lib leve qrcode (sem rede externa)
    QRCode.toCanvas(
      canvasRef.current,
      PUBLIC_PRODUCTION_URL,
      {
        width: 220,
        margin: 2,
        color: {
          dark: '#0A1F33', // Azul-marinho oficial
          light: '#FFFFFF',
        },
        errorCorrectionLevel: 'M',
      },
      (err) => {
        if (err) {
          setQrError('Não foi possível gerar o QR code no navegador.')
          setQrReady(false)
        } else {
          setQrReady(true)
        }
      },
    )
  }, [])

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(PUBLIC_PRODUCTION_URL)
      setCopiedLink(true)
      setTimeout(() => setCopiedLink(false), 2500)
    } catch {
      // Fallback
      setCopiedLink(false)
    }
  }

  const handleCopyEmbed = async () => {
    try {
      await navigator.clipboard.writeText(embedSnippet)
      setCopiedEmbed(true)
      setTimeout(() => setCopiedEmbed(false), 2500)
    } catch {
      setCopiedEmbed(false)
    }
  }

  const handleDownloadQrPng = () => {
    if (!canvasRef.current) return
    try {
      const dataUrl = canvasRef.current.toDataURL('image/png')
      const link = document.createElement('a')
      link.download = 'ferri-ferri-qrcode-mural-avaliacoes.png'
      link.href = dataUrl
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch {
      /* fallback */
    }
  }

  return (
    <section className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200/90 shadow-xs space-y-6">
      {/* Header da Seção */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#C9A227]/15 text-[#0A1F33] border border-[#C9A227]/40">
            <Share2 className="w-3 h-3 text-[#A68218]" />
            <span>Divulgação e Coleta</span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-[#0A1F33] tracking-tight">
            Compartilhar e Integrar Avaliações
          </h2>
          <p className="text-xs text-slate-600 max-w-2xl leading-relaxed">
            Disponibilize o canal de relatos para os clientes do escritório{' '}
            <strong className="text-[#0A1F33]">Ferri &amp; Ferri Advogados</strong> através do link
            direto, placa com QR Code ou embutido no site institucional.
          </p>
        </div>

        <a
          href={PUBLIC_PRODUCTION_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs font-semibold text-[#0A1F33] hover:bg-slate-100 transition-colors shrink-0"
        >
          <span>Abrir Mural Público</span>
          <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
        </a>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Coluna 1: Link Público Oficial + Instruções (7 colunas) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Card Link Copiável */}
          <div className="space-y-2 p-4 sm:p-5 rounded-xl bg-gradient-to-br from-[#0A1F33] to-[#132E4A] text-white border border-[#C9A227]/30 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#E5C048] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#C9A227]" />
                Link Oficial para Avaliação
              </span>
              <span className="text-[10px] text-slate-300 font-mono">Produção Oficial</span>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1">
              <div className="flex-1 bg-black/30 border border-white/15 rounded-lg px-3 py-2 text-xs font-mono text-slate-100 truncate select-all">
                {PUBLIC_PRODUCTION_URL}
              </div>
              <button
                type="button"
                onClick={handleCopyLink}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-gradient-to-r from-[#C9A227] to-[#E5C048] text-[#0A1F33] text-xs font-bold hover:brightness-105 active:scale-[0.98] transition-all cursor-pointer shrink-0 shadow-xs"
              >
                {copiedLink ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-[#0A1F33]" />
                    <span>Link Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-[#0A1F33]" />
                    <span>Copiar Link</span>
                  </>
                )}
              </button>
            </div>

            <p className="text-[11px] text-slate-300 leading-relaxed pt-1">
              Envie esse link diretamente para os clientes via WhatsApp, e-mail de pós-atendimento
              ou mensagens de agradecimento.
            </p>
          </div>

          {/* Card Embed Iframe */}
          <div className="space-y-2.5 p-4 sm:p-5 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Code2 className="w-4 h-4 text-[#A68218]" />
                <span className="text-xs font-bold text-[#0A1F33]">
                  Embed para o Site Institucional (Iframe)
                </span>
              </div>
              <button
                type="button"
                onClick={handleCopyEmbed}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-white border border-slate-200 text-xs font-semibold text-[#0A1F33] hover:bg-slate-100 active:scale-[0.98] transition-all cursor-pointer shadow-2xs"
              >
                {copiedEmbed ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-600" />
                    <span className="text-emerald-700">Snippet Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3 text-slate-500" />
                    <span>Copiar Código</span>
                  </>
                )}
              </button>
            </div>

            <p className="text-[11px] text-slate-600 leading-relaxed">
              Cole este código HTML diretamente em qualquer página do site do escritório (WordPress,
              Elementor ou HTML puro) para exibir o mural embutido com suporte completo a texto e
              gravação de vídeo.
            </p>

            <pre className="p-3 bg-slate-900 text-slate-100 rounded-lg text-[11px] font-mono leading-relaxed overflow-x-auto border border-slate-800">
              <code>{embedSnippet}</code>
            </pre>

            <div className="text-[11px] text-slate-500 flex items-start gap-1.5 pt-0.5">
              <span className="font-semibold text-[#0A1F33]">• Dica:</span>
              <span>
                O atributo{' '}
                <code className="text-[10px] bg-slate-200 px-1 py-0.5 rounded text-slate-800">
                  allow="camera; microphone;"
                </code>{' '}
                garante que clientes possam gravar vídeo diretamente pelo navegador caso desejem.
              </span>
            </div>
          </div>
        </div>

        {/* Coluna 2: QR Code Visualizável e Baixável em PNG (5 colunas) */}
        <div className="lg:col-span-5 flex flex-col justify-between p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <QrCodeIcon className="w-4 h-4 text-[#A68218]" />
              <h3 className="text-xs font-bold text-[#0A1F33] uppercase tracking-wide">
                QR Code para Balcão / Recepção
              </h3>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Ideal para impressão em placas de acrílico, cartões de visita ou folders da recepção
              do escritório. O cliente aponta a câmera do celular e acessa a tela de relato
              imediatamente.
            </p>
          </div>

          {/* Área do QR Code com Canvas renderizado pelo qrcode */}
          <div className="flex flex-col items-center justify-center p-4 bg-white rounded-xl border border-slate-200/90 shadow-2xs space-y-3">
            <div className="p-2 bg-white rounded-lg border border-slate-200 shadow-inner flex items-center justify-center">
              <canvas
                ref={canvasRef}
                className="max-w-[200px] max-h-[200px] w-full h-auto block"
                aria-label={`QR Code apontando para ${PUBLIC_PRODUCTION_URL}`}
              />
            </div>

            {qrError && (
              <p className="text-[11px] text-red-600 text-center font-medium">{qrError}</p>
            )}

            <div className="text-center space-y-0.5">
              <p className="text-[11px] font-bold text-[#0A1F33]">Ferri &amp; Ferri Advogados</p>
              <p className="text-[10px] text-slate-500 font-mono truncate max-w-[240px]">
                {PUBLIC_PRODUCTION_URL}
              </p>
            </div>
          </div>

          {/* Botão de Download do QR Code */}
          <button
            type="button"
            onClick={handleDownloadQrPng}
            disabled={!qrReady}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#0A1F33] text-[#E5C048] border border-[#C9A227]/40 text-xs font-bold hover:bg-[#132E4A] active:scale-[0.98] transition-all cursor-pointer shadow-xs disabled:opacity-50"
          >
            <Download className="w-4 h-4 text-[#C9A227]" />
            <span>Baixar Imagem do QR Code (PNG)</span>
          </button>
        </div>
      </div>
    </section>
  )
}
