/**
 * Logo Oficial Ferri & Ferri Advogados
 *
 * REGISTRO DE ORIGEM DO ASSET:
 * - URL Oficial WordPress: https://ferriferriadv.com.br/wp-content/uploads/2026/06/Logo-FerriFerri-horizontal.png
 * - SHA256 Original: 2711c1f8d0a92ad50243c5fbed441f5c94b8d4d9ec28c973cd08e2cb8af1caa0
 * - Dimensões originais: 437 x 101 px (horizontal, para fundo escuro #0A1F33).
 * - Origem e data real: 15/10/2026.
 * - Asset servido 100% localmente pelo bundle (src/assets/eb985729968371dc-01d7c.png),
 *   sem hotlink nem chamadas de rede externas em runtime.
 * - Proporção preservada: 437:101, object-contain, alt acessível "Ferri & Ferri Advogados".
 */

import React from 'react'
import logoSrc from '@/assets/eb985729968371dc-01d7c.png'

interface LogoProps {
  className?: string
  priority?: boolean
  variant?: 'header' | 'footer' | 'mobile'
}

export function FerriFerriLogo({ className = '', variant = 'header' }: LogoProps) {
  // Proporção 437 x 101 nativa, renderizado sobre fundo escuro (#0A1F33 / #071624),
  // sem recorte ou distorção, acessível via alt text.
  return (
    <img
      src={logoSrc}
      alt="Ferri & Ferri Advogados"
      width={437}
      height={101}
      decoding="async"
      style={{ aspectRatio: '437 / 101' }}
      className={`object-contain max-w-full w-auto select-none ${
        variant === 'footer' ? 'opacity-95' : ''
      } ${className}`}
    />
  )
}
