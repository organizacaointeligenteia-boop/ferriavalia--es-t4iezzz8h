import React, { useState, useEffect } from 'react'
import {
  ShieldCheck,
  Lock,
  LogOut,
  CheckCircle2,
  EyeOff,
  Trash2,
  Clock,
  Filter,
  Video,
  FileText,
  AlertTriangle,
  Loader2,
  User,
  RefreshCw,
} from 'lucide-react'
import pb from '@/lib/pocketbase/client'
import {
  listAllReportsForStaff,
  updateReportStatusByStaff,
  deleteReportByStaff,
  getReportVideoUrl,
  ReportRecord,
  ReportPivotStatus,
} from '@/services/reports'

export default function Painel() {
  const [isAuthenticated, setIsAuthenticated] = useState(pb.authStore.isValid)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loginLoading, setLoginLoading] = useState(false)
  const [loginError, setLoginError] = useState<string | null>(null)

  // Lista de relatos
  const [reports, setReports] = useState<ReportRecord[]>([])
  const [loadingReports, setLoadingReports] = useState(false)
  const [filter, setFilter] = useState<'todos' | ReportPivotStatus>('todos')
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null)

  // Sincroniza estado de autenticação com authStore
  useEffect(() => {
    const unsub = pb.authStore.onChange(() => {
      setIsAuthenticated(pb.authStore.isValid)
    })
    return () => {
      unsub()
    }
  }, [])

  // Carrega relatos para a equipe
  const fetchReports = async () => {
    if (!pb.authStore.isValid) return
    setLoadingReports(true)
    try {
      const data = await listAllReportsForStaff()
      setReports(data)
    } catch (err: unknown) {
      // Se falhar ou não houver permissão ainda
      setReports([])
    } finally {
      setLoadingReports(false)
    }
  }

  useEffect(() => {
    if (isAuthenticated) {
      fetchReports()
    }
  }, [isAuthenticated])

  // Login da equipe
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginError(null)
    setLoginLoading(true)
    try {
      await pb.collection('users').authWithPassword(email.trim(), password)
      setIsAuthenticated(true)
      setEmail('')
      setPassword('')
    } catch (err: unknown) {
      setLoginError(
        'Falha no login. Verifique seu e-mail e senha. As contas de equipe devem ser criadas previamente no Skip Cloud.',
      )
    } finally {
      setLoginLoading(false)
    }
  }

  // Logout
  const handleLogout = () => {
    pb.authStore.clear()
    setIsAuthenticated(false)
    setReports([])
  }

  // Ações de moderação: aprovar, ocultar
  const handleStatusChange = async (id: string, newStatus: ReportPivotStatus) => {
    setActionLoadingId(id)
    try {
      await updateReportStatusByStaff(id, newStatus)
      setReports((prev) => prev.map((r) => (r.id === id ? { ...r, status_novo: newStatus } : r)))
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Falha ao atualizar status'
      alert(`Erro: ${msg}`)
    } finally {
      setActionLoadingId(null)
    }
  }

  // Ação de moderação: excluir
  const handleDelete = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este relato permanentemente?')) {
      return
    }
    setActionLoadingId(id)
    try {
      await deleteReportByStaff(id)
      setReports((prev) => prev.filter((r) => r.id !== id))
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Falha ao excluir relato'
      alert(`Erro: ${msg}`)
    } finally {
      setActionLoadingId(null)
    }
  }

  // Filtra itens
  const filteredReports =
    filter === 'todos' ? reports : reports.filter((r) => r.status_novo === filter)

  const counts = {
    todos: reports.length,
    pendente: reports.filter((r) => r.status_novo === 'pendente').length,
    aprovado: reports.filter((r) => r.status_novo === 'aprovado').length,
    oculto: reports.filter((r) => r.status_novo === 'oculto').length,
  }

  // TELA 1: LOGIN (Se não autenticado)
  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto py-12 px-4 space-y-6 animate-fade-in">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#0A1F33] text-[#E5C048] border border-[#C9A227]/40">
            <Lock className="w-5 h-5 text-[#C9A227]" />
          </div>
          <h1 className="text-2xl font-bold text-[#0A1F33] tracking-tight">Painel da Equipe</h1>
          <p className="text-xs text-slate-600">
            Acesso restrito para aprovação e moderação de relatos.
          </p>
        </div>

        <div className="bg-white p-6 sm:p-8 rounded-xl border border-slate-200 shadow-sm space-y-5">
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="login-email" className="text-xs font-semibold text-slate-700">
                E-mail institucional
              </label>
              <input
                id="login-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu.email@ferriferriadv.com.br"
                className="w-full px-3 py-2 text-sm rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0A1F33] text-slate-900"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="login-password" className="text-xs font-semibold text-slate-700">
                Senha
              </label>
              <input
                id="login-password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2 text-sm rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0A1F33] text-slate-900"
              />
            </div>

            {loginError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded text-xs text-red-700 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <span>{loginError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full py-2.5 rounded-md bg-[#0A1F33] text-[#E5C048] border border-[#C9A227]/40 font-semibold text-sm hover:bg-[#132E4A] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs disabled:opacity-50"
            >
              {loginLoading && <Loader2 className="w-4 h-4 animate-spin text-[#C9A227]" />}
              Entrar no Painel
            </button>
          </form>

          <div className="p-3 bg-[#0A1F33]/5 rounded-md border border-[#C9A227]/30 text-[11px] text-slate-600 space-y-1">
            <span className="font-semibold text-[#0A1F33] block">Contas de acesso:</span>
            <span>
              Por segurança, as contas e senhas são gerenciadas manualmente pelo responsável na aba{' '}
              <em>Collections &gt; users</em> do Skip Cloud.
            </span>
          </div>
        </div>
      </div>
    )
  }

  // TELA 2: GESTÃO DE RELATOS (Autenticado)
  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Top Header do Painel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-[#0A1F33] tracking-tight">Moderação de Relatos</h1>
          <p className="text-xs text-slate-600">
            Aprove, oculte ou exclua relatos enviados pelos clientes.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchReports}
            disabled={loadingReports}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-slate-200 bg-white text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingReports ? 'animate-spin' : ''}`} />
            Atualizar
          </button>
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-red-200 bg-red-50 text-xs font-semibold text-red-700 hover:bg-red-100 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sair
          </button>
        </div>
      </div>

      {/* Filtros com Contadores */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        {(['todos', 'pendente', 'aprovado', 'oculto'] as const).map((status) => {
          const active = filter === status
          const labels: Record<string, string> = {
            todos: 'Todos',
            pendente: 'Pendentes',
            aprovado: 'Aprovados',
            oculto: 'Ocultos',
          }
          return (
            <button
              key={status}
              type="button"
              onClick={() => setFilter(status)}
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md font-medium transition-all ${
                active
                  ? 'bg-[#0A1F33] text-[#E5C048] border border-[#C9A227]/40 shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <span>{labels[status]}</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                  active ? 'bg-[#132E4A] text-[#E5C048]' : 'bg-slate-100 text-slate-700'
                }`}
              >
                {counts[status]}
              </span>
            </button>
          )
        })}
      </div>

      {/* Lista de Relatos */}
      {loadingReports ? (
        <div className="py-16 flex flex-col items-center justify-center text-slate-400 gap-3">
          <Loader2 className="w-7 h-7 animate-spin text-[#C9A227]" />
          <p className="text-xs">Carregando relatos...</p>
        </div>
      ) : filteredReports.length === 0 ? (
        <div className="bg-white rounded-lg p-10 border border-slate-200 text-center text-sm text-slate-500 space-y-1">
          <p>Nenhum relato encontrado com o filtro selecionado.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredReports.map((report) => {
            const isLoading = actionLoadingId === report.id
            const isPendente = report.status_novo === 'pendente'
            const isAprovado = report.status_novo === 'aprovado'
            const isOculto = report.status_novo === 'oculto'

            return (
              <div
                key={report.id}
                className="bg-white rounded-lg p-4 sm:p-5 border border-slate-200 shadow-2xs space-y-3"
              >
                {/* Header do Card */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-slate-400" />
                    <span className="font-bold text-sm text-[#0A1F33]">
                      {report.author || 'Anônimo'}
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700">
                      {report.tipo === 'video' ? (
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

                  <div className="flex items-center gap-2 text-xs">
                    {isPendente && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-semibold bg-amber-100 text-amber-900 border border-amber-300">
                        <Clock className="w-3 h-3" /> Pendente
                      </span>
                    )}
                    {isAprovado && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
                        <CheckCircle2 className="w-3 h-3" /> Aprovado (No Mural)
                      </span>
                    )}
                    {isOculto && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-semibold bg-slate-100 text-slate-700 border border-slate-300">
                        <EyeOff className="w-3 h-3" /> Oculto
                      </span>
                    )}
                    <span className="text-slate-400 text-[11px] font-mono">
                      {report.received_at_sp || report.created.substring(0, 10)}
                    </span>
                  </div>
                </div>

                {/* Conteúdo: Vídeo ou Texto */}
                {report.tipo === 'video' && report.video_file && (
                  <div className="max-w-md rounded-lg overflow-hidden bg-slate-900 border border-slate-200 aspect-video flex items-center justify-center">
                    <video
                      src={getReportVideoUrl(report)}
                      controls
                      className="w-full h-full object-cover"
                      preload="metadata"
                    />
                  </div>
                )}

                {report.texto && (
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line bg-slate-50 p-3 rounded border border-slate-100">
                    "{report.texto}"
                  </p>
                )}

                {/* Botões de Ação de Moderação */}
                <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-slate-100">
                  {/* Botão Aprovar */}
                  {!isAprovado && (
                    <button
                      type="button"
                      disabled={isLoading}
                      onClick={() => handleStatusChange(report.id, 'aprovado')}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Aprovar para o Mural
                    </button>
                  )}

                  {/* Botão Ocultar */}
                  {!isOculto && (
                    <button
                      type="button"
                      disabled={isLoading}
                      onClick={() => handleStatusChange(report.id, 'oculto')}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-slate-600 text-white text-xs font-semibold hover:bg-slate-700 active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer"
                    >
                      <EyeOff className="w-3.5 h-3.5" />
                      Ocultar
                    </button>
                  )}

                  {/* Botão Voltar para Pendente */}
                  {isOculto && (
                    <button
                      type="button"
                      disabled={isLoading}
                      onClick={() => handleStatusChange(report.id, 'pendente')}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer"
                    >
                      <Clock className="w-3.5 h-3.5" />
                      Mover para Pendente
                    </button>
                  )}

                  {/* Botão Excluir */}
                  <button
                    type="button"
                    disabled={isLoading}
                    onClick={() => handleDelete(report.id)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md border border-red-200 text-red-700 bg-red-50 text-xs font-semibold hover:bg-red-100 active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Excluir
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
