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
} from 'lucide-react'
import { FerriFerriLogo } from '@/components/FerriFerriLogo'

export default function Layout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const location = useLocation()

  const navLinks = [
    { to: '/', label: 'Mural de Avaliações', icon: Eye },
    { to: '/painel', label: 'Painel da Equipe', icon: LayoutDashboard },
  ]

  const closeMenu = () => setMobileMenuOpen(false)

  return (
    <div className="flex flex-col min-h-screen bg-[#F8FAFC] text-[#0F172A] font-sans antialiased selection:bg-[#C9A227] selection:text-[#0A1F33]">
      {/* Top Banner Oficial */}
      <div className="bg-[#071624] text-[#E5C048] px-4 py-1.5 text-xs font-medium text-center flex items-center justify-center gap-2 border-b border-[#C9A227]/30">
        <Scale className="w-3.5 h-3.5 shrink-0 text-[#C9A227]" aria-hidden="true" />
        <span className="text-white/90">
          <strong className="text-[#C9A227]">Ferri &amp; Ferri Advogados</strong> — Mural de
          Avaliações e Relatos de Clientes. Publicação exclusiva após aprovação.
        </span>
      </div>

      {/* Header Oficial: Topo Azul-Marinho Escuro (#0A1F33) com acentos Dourados (#C9A227) */}
      <header className="sticky top-0 z-40 bg-[#0A1F33] border-b border-[#132E4A] shadow-md transition-shadow">
        <div className="max-w-[1040px] mx-auto px-4 sm:px-6 h-18 sm:h-20 flex items-center justify-between gap-4">
          {/* Logo Oficial Horizontal (Asset Branco sobre Azul-Marinho) + Nome do Canal */}
          <Link
            to="/"
            onClick={closeMenu}
            className="flex items-center gap-3 text-left group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A227] rounded-sm py-1"
            aria-label="Ferri & Ferri Advogados — Página Inicial"
          >
            <div className="flex items-center">
              <FerriFerriLogo className="h-8 sm:h-9" />
            </div>
            <div className="hidden lg:block border-l border-white/20 pl-3">
              <div className="text-[11px] text-[#C9A227] leading-none font-semibold uppercase tracking-wider">
                Relatos &amp; Experiência
              </div>
              <div className="text-[10px] text-slate-300 leading-tight mt-0.5">
                Canal Interno de Acolhimento
              </div>
            </div>
          </Link>

          {/* Badge Central / Desktop */}
          <div className="hidden md:flex items-center">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#C9A227]/15 text-[#E5C048] border border-[#C9A227]/40 shadow-xs">
              <ShieldCheck className="w-3 h-3 text-[#C9A227]" aria-hidden="true" />
              MURAL OFICIAL
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
                  className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-md transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A227] ${
                    isActive
                      ? 'bg-[#132E4A] text-[#E5C048] border border-[#C9A227]/40 shadow-xs font-semibold'
                      : 'text-slate-200 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Icon
                    className={`w-3.5 h-3.5 ${isActive ? 'text-[#C9A227]' : 'text-slate-300'}`}
                    aria-hidden="true"
                  />
                  {link.label}
                </NavLink>
              )
            })}
          </nav>

          {/* Botão Mobile Hamburger */}
          <div className="flex items-center gap-2 md:hidden">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-[#C9A227]/20 text-[#E5C048] border border-[#C9A227]/40">
              MURAL
            </span>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md text-white hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A227]"
              aria-expanded={mobileMenuOpen}
              aria-label={mobileMenuOpen ? 'Fechar menu de navegação' : 'Abrir menu de navegação'}
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5 text-white" aria-hidden="true" />
              ) : (
                <Menu className="w-5 h-5 text-white" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>

        {/* Drawer Mobile (Slide-in) */}
        {mobileMenuOpen && (
          <div
            className="md:hidden fixed inset-x-0 top-[calc(4.5rem+29px)] sm:top-[calc(5rem+29px)] bottom-0 bg-black/60 backdrop-blur-xs z-50 flex justify-end animate-fade-in"
            onClick={closeMenu}
          >
            <div
              className="w-4/5 max-w-xs bg-[#0A1F33] text-white h-full shadow-2xl p-6 flex flex-col justify-between border-l border-[#132E4A] animate-slide-left"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="space-y-4">
                <div className="pb-3 border-b border-white/15">
                  <div className="mb-2">
                    <FerriFerriLogo variant="mobile" className="h-7" />
                  </div>
                  <div className="text-xs font-bold text-[#C9A227] uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Ferri &amp; Ferri
                  </div>
                  <p className="text-xs text-slate-300 mt-1">Mural de Avaliações e Relatos.</p>
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
                          isActive
                            ? 'bg-[#132E4A] text-[#E5C048] border border-[#C9A227]/40 font-semibold'
                            : 'text-slate-200 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        <Icon
                          className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#C9A227]' : 'text-slate-300'}`}
                          aria-hidden="true"
                        />
                        {link.label}
                      </NavLink>
                    )
                  })}
                </nav>
              </div>

              <div className="pt-4 border-t border-white/15 text-xs text-slate-300 space-y-2">
                <div className="flex items-start gap-1.5 text-[11px] leading-tight">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#C9A227] shrink-0 mt-0.5" />
                  <span>Mural público embutível no site do escritório.</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Main Container */}
      <main className="flex-1 w-full max-w-[1040px] mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <Outlet />
      </main>

      {/* Footer Oficial com Fundo Escuro / Sobriedade Jurídica */}
      <footer className="mt-auto border-t border-[#132E4A] bg-[#071624] py-8 text-slate-300 text-xs">
        <div className="max-w-[1040px] mx-auto px-4 sm:px-6 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <FerriFerriLogo className="h-7 sm:h-8" />
              <div className="border-l border-white/20 pl-3">
                <div className="font-semibold text-white text-xs">
                  Relatos e Experiência do Cliente
                </div>
                <div className="text-[10px] text-slate-400">
                  Canal de demonstração, sem dados reais
                </div>
              </div>
            </div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold bg-[#C9A227]/15 text-[#E5C048] border border-[#C9A227]/30">
              <ShieldCheck className="w-3.5 h-3.5 text-[#C9A227]" />
              Mural Público de Avaliações
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-[11px] leading-relaxed text-slate-300">
            <p>
              <strong className="text-[#E5C048]">Privacidade:</strong> Seu relato pode ser removido
              a qualquer tempo mediante solicitação ao escritório.
            </p>
            <p className="shrink-0 text-slate-400">Ferri &amp; Ferri Advogados © 2026</p>
          </div>
          <div className="pt-2 text-[11px] text-slate-400 flex flex-wrap gap-x-4 gap-y-1">
            <span>• Exclusivo para o escritório Ferri &amp; Ferri Advogados</span>
            <span>• Envio em texto ou gravação de vídeo no navegador</span>
            <span>• Exibição no mural somente após aprovação da equipe</span>
          </div>{' '}
        </div>
      </footer>
    </div>
  )
}
