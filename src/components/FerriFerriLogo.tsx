/**
 * Logo Oficial Ferri & Ferri Advogados
 *
 * REGISTRO DE ORIGEM DO ASSET:
 * - URL Oficial WordPress: https://ferriferriadv.com.br/wp-content/uploads/2026/06/Logo-FerriFerri-horizontal.png
 * - Dimensões originais: 437 x 101 px (horizontal, para fundo escuro).
 * - Data da tentativa de download / verificação: Fevereiro/2025.
 * - Status de download: O ambiente de execução frontend-only isolado não dispõe de ferramenta de download
 *   de arquivo binário (.png) no build. Conforme diretriz estrita do usuário ("Se o download do arquivo falhar
 *   na sua execução, NÃO fabricar logo: mantenha o fallback tipográfico 'Ferri & Ferri' e declare a pendência
 *   claramente no README e no seu relatório"), o componente renderiza o fallback tipográfico homologado
 *   sem realizar nenhuma requisição de rede externa em runtime.
 * - Zero requisições externas em runtime.
 */

import React from 'react'

interface LogoProps {
  className?: string
  priority?: boolean
  variant?: 'header' | 'footer'
}

export function FerriFerriLogo({ className = '', variant = 'header' }: LogoProps) {
  // Renderização 100% local via fallback tipográfico sem chamadas de rede externas em runtime.
  // Proporção original (aspect-ratio 437/101) preservada, tipografia contrastante sobre fundo escuro.
  return (
    <div
      role="img"
      aria-label="Ferri & Ferri Advogados"
      style={{ aspectRatio: '437 / 101' }}
      className={`flex flex-col justify-center select-none ${variant === 'footer' ? 'opacity-95' : ''} ${className}`}
    >
      <span className="font-serif font-bold text-white text-base sm:text-lg tracking-wider leading-none">
        FERRI &amp; FERRI
      </span>
      <span className="text-[9px] sm:text-[10px] tracking-[0.25em] text-[#C9A227] uppercase font-semibold leading-tight mt-0.5">
        ADVOGADOS
      </span>
    </div>
  )
}
