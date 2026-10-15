import React, { useState } from 'react'
import { Outlet, NavLink, Link, useLocation } from 'react-router-dom'
import {
  AlertTriangle,
  Menu,
  X,
  Scale,
  ShieldCheck,
  FileText,
  LayoutDashboard,
  Eye,
  Info,
} from 'lucide-react'

export default function Layout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const location = useLocation()

  const navLinks = [
    { to: '/', label: 'Institucional', icon: Scale },
    { to: '/relatar', label: 'Relatar Experiência', icon: FileText },
    { to: '/painel', label: 'Painel Interno — DEMO', icon: LayoutDashboard },
    { to: '/mural', label: 'Mural (Prévia)', icon: Eye },
  ]

  const closeMenu = () => setMobileMenuOpen(false)

  return (
    <div className="flex flex-col min-h-screen bg-[#F5F8F7] text-[#1A2E33] font-sans antialiased selection:bg-[#0B3B4F] selection:text-white">
      {/* Top Banner de Demonstração Permanente */}
      <div className="bg-[#8A6D1A] text-[#FFF8E6] px-4 py-1.5 text-xs font-medium text-center flex items-center justify-center gap-2 border-b border-[#735914]">
        <AlertTriangle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
        <span>
          <strong>AMBIENTE DE DEMONSTRAÇÃO</strong> — Protótipo estático em memória (dados fictícios{' '}
          <code className="bg-[#735914]/60 px-1 py-0.5 rounded text-[11px]">E2E_SYNTH_</code>). Nada
          é enviado a servidor algum.
        </span>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-[#D8E2E0] transition-shadow">
        <div className="max-w-[1000px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Logo / Nome do Escritório */}
          <Link
            to="/"
            onClick={closeMenu}
            className="flex items-center gap-2.5 text-left group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B3B4F] rounded-sm py-1"
          >
            <div className="w-9 h-9 rounded bg-[#0B3B4F] text-white flex items-center justify-center font-bold text-sm tracking-tight shadow-sm transition-transform group-hover:scale-105">
              F&amp;F
            </div>
            <div>
              <div className="font-bold text-[#0B3B4F] text-base leading-tight tracking-tight">
                Ferri &amp; Ferri
              </div>
              <div className="text-[11px] text-[#52656B] leading-none font-medium">
                Relatos e Experiência
              </div>
            </div>
          </Link>

          {/* Badge Central / Desktop */}
          <div className="hidden md:flex items-center">
            <span
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#8A6D1A]/15 text-[#8A6D1A] border border-[#8A6D1A]/30"
              title="Este sistema é um protótipo estático sem persistência externa"
            >
              <AlertTriangle className="w-3 h-3" aria-hidden="true" />
              DEMONSTRAÇÃO
            </span>
          </div>

          {/* Navegação Desktop */}
          <nav
            className="hidden md:flex items-center gap-1 lg:gap-2"
            aria-label="Navegação principal"
          >
            {navLinks.map((link) => {
              const Icon = link.icon
              const isActive = location.pathname === link.to
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B3B4F] ${
                    isActive
                      ? 'bg-[#0B3B4F] text-white shadow-xs'
                      : 'text-[#52656B] hover:text-[#0B3B4F] hover:bg-[#F5F8F7]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" aria-hidden="true" />
                  {link.label}
                </NavLink>
              )
            })}
          </nav>

          {/* Botão Mobile Hamburger */}
          <div className="flex items-center gap-2 md:hidden">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-[#8A6D1A]/15 text-[#8A6D1A] border border-[#8A6D1A]/30">
              DEMO
            </span>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md text-[#1A2E33] hover:bg-[#F5F8F7] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B3B4F]"
              aria-expanded={mobileMenuOpen}
              aria-label={mobileMenuOpen ? 'Fechar menu de navegação' : 'Abrir menu de navegação'}
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" aria-hidden="true" />
              ) : (
                <Menu className="w-5 h-5" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>

        {/* Drawer Mobile (Slide-in) */}
        {mobileMenuOpen && (
          <div
            className="md:hidden fixed inset-x-0 top-[calc(4rem+29px)] bottom-0 bg-black/40 backdrop-blur-xs z-50 flex justify-end animate-fade-in"
            onClick={closeMenu}
          >
            <div
              className="w-4/5 max-w-xs bg-white h-full shadow-2xl p-6 flex flex-col justify-between border-l border-[#D8E2E0] animate-slide-left"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="space-y-4">
                <div className="pb-3 border-b border-[#D8E2E0]">
                  <div className="text-xs font-bold text-[#8A6D1A] uppercase tracking-wider flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Protótipo Demo
                  </div>
                  <p className="text-xs text-[#52656B] mt-1">
                    Ferri &amp; Ferri — Advocacia individual / escritório único.
                  </p>
                </div>

                <nav className="flex flex-col gap-2" aria-label="Navegação móvel">
                  {navLinks.map((link) => {
                    const Icon = link.icon
                    const isActive = location.pathname === link.to
                    return (
                      <NavLink
                        key={link.to}
                        to={link.to}
                        onClick={closeMenu}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                          isActive ? 'bg-[#0B3B4F] text-white' : 'text-[#1A2E33] hover:bg-[#F5F8F7]'
                        }`}
                      >
                        <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
                        {link.label}
                      </NavLink>
                    )
                  })}
                </nav>
              </div>

              <div className="pt-4 border-t border-[#D8E2E0] text-xs text-[#52656B] space-y-2">
                <div className="flex items-start gap-1.5 text-[11px] leading-tight">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#1B6B4A] shrink-0 mt-0.5" />
                  <span>Ambiente sem backend, sem banco e sem tráfego de rede.</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Main Container */}
      <main className="flex-1 w-full max-w-[1000px] mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-[#D8E2E0] bg-white py-8 text-[#52656B] text-xs">
        <div className="max-w-[1000px] mx-auto px-4 sm:px-6 space-y-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-[#D8E2E0]/60">
            <div className="font-semibold text-[#0B3B4F] text-sm">
              Ferri &amp; Ferri — Relatos e Experiência
            </div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-semibold bg-[#8A6D1A]/10 text-[#8A6D1A] border border-[#8A6D1A]/30">
              <AlertTriangle className="w-3 h-3" />
              DEMONSTRAÇÃO — sem envio de dados reais
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-[11px] leading-relaxed text-[#52656B]">
            <p>
              <strong>Publicidade jurídica e ética:</strong> Publicação e divulgação desativadas,
              pendentes de revisão ética OAB e decisão do responsável.
            </p>
            <p className="shrink-0 text-[#52656B]">Coleta privada ≠ Divulgação pública</p>
          </div>

          <div className="pt-2 text-[11px] text-[#52656B]/80 flex flex-wrap gap-x-4 gap-y-1">
            <span>• Único escritório (não é SaaS / sem venda a advogados)</span>
            <span>• Sem cadastro de CPF, processo ou documentos</span>
            <span>• Dados fictícios voláteis (em memória, descartados ao recarregar)</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
