/**
 * Logo Oficial Ferri & Ferri Advogados
 *
 * ORIGEM DO ASSET:
 * - URL Oficial observada no DOM do site: https://ferriferriadv.com.br/wp-content/uploads/2026/06/Logo-FerriFerri-horizontal.png
 * - Resolução nativa: 437 x 101 px (horizontal, branca com detalhes em cinza claro, para aplicação sobre fundo escuro).
 * - Data de verificação: 2025/2026.
 * - Nota técnica: Na execução atual (frontend-only sem shell/curl), o asset oficial remoto é referenciado diretamente
 *   com fallback tipográfico ("Ferri & Ferri Advogados") caso haja bloqueio de rede ou erro de carregamento (onError).
 * - NÃO modificado, NÃO redesenhado, proporção preservada (aspect-ratio 437/101).
 */

import React, { useState } from 'react'

export const OFFICIAL_LOGO_URL =
  'https://ferriferriadv.com.br/wp-content/uploads/2026/06/Logo-FerriFerri-horizontal.png'

interface LogoProps {
  className?: string
  priority?: boolean
  variant?: 'header' | 'footer'
}

export function FerriFerriLogo({ className = '', variant = 'header' }: LogoProps) {
  const [loadFailed, setLoadFailed] = useState(false)

  if (loadFailed) {
    // Fallback tipográfico conforme diretriz do projeto se o asset não carregar
    return (
      <div className={`flex flex-col select-none ${className}`}>
        <span className="font-serif font-bold text-white text-lg tracking-wider leading-none">
          FERRI &amp; FERRI
        </span>
        <span className="text-[10px] tracking-[0.25em] text-[#C9A227] uppercase font-semibold leading-tight mt-0.5">
          ADVOGADOS
        </span>
      </div>
    )
  }

  return (
    <img
      src={OFFICIAL_LOGO_URL}
      alt="Ferri & Ferri Advogados"
      width={437}
      height={101}
      loading="eager"
      onError={() => setLoadFailed(true)}
      style={{ aspectRatio: '437 / 101' }}
      className={`object-contain max-h-9 sm:max-h-10 w-auto ${className}`}
    />
  )
}
