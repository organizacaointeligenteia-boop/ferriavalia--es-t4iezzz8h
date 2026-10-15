import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  FileText,
  ShieldAlert,
  Info,
  Calendar,
  User,
  LayoutDashboard,
} from 'lucide-react'
import { useReports } from '@/context/ReportsContext'
import {
  isFutureDate,
  getTodayDateInputValue,
  formatDateBR,
  validateDateOnlyString,
} from '@/lib/dateUtils'
import { SyntheticReport } from '@/data/mockReports'

export default function Relatar() {
  const { addReport } = useReports()

  // Etapa: 1 = Consentimento, 2 = Campos, 3 = Sucesso
  const [step, setStep] = useState<1 | 2 | 3>(1)

  // Etapa 1: Consentimento (sempre desmarcado por padrão)
  const [consentChecked, setConsentChecked] = useState(false)

  // Etapa 2: Campos
  const [name, setName] = useState('')
  const [relato, setRelato] = useState('')
  const [experienceDate, setExperienceDate] = useState(() => getTodayDateInputValue())

  // Inline errors
  const [errors, setErrors] = useState<{
    name?: string
    relato?: string
    experienceDate?: string
  }>({})

  // Registro recém criado para exibir na tela de sucesso
  const [createdReport, setCreatedReport] = useState<SyntheticReport | null>(null)

  const handleConsentContinue = () => {
    if (!consentChecked) return
    setStep(2)
  }

  const validateFields = (): boolean => {
    const newErrors: {
      name?: string
      relato?: string
      experienceDate?: string
    } = {}

    if (name.length > 80) {
      newErrors.name = 'O nome não pode exceder 80 caracteres.'
    }

    if (relato.length > 2000) {
      newErrors.relato = 'O relato não pode exceder 2.000 caracteres.'
    }

    if (!experienceDate) {
      newErrors.experienceDate = 'Informe a data em que ocorreu a experiência de atendimento.'
    } else {
      const dateVal = validateDateOnlyString(experienceDate)
      if (!dateVal.valid) {
        newErrors.experienceDate = dateVal.error || 'Data inválida.'
      } else if (isFutureDate(experienceDate)) {
        newErrors.experienceDate = 'A data da experiência não pode ser futura.'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateFields()) {
      return
    }

    // Cria o relato in-memory
    const report = addReport({
      clientName: name,
      relato: relato || '(Relato sintetizado sem detalhamento textual registrado)',
      experienceDate,
    })

    setCreatedReport(report)
    setStep(3)
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      {/* Rótulo de Demonstração */}
      <div className="flex items-center justify-between bg-[#0A1F33]/5 border border-[#C9A227]/30 text-[#0A1F33] px-3.5 py-2 rounded-md text-xs">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 text-[#C9A227]" />
          <span>
            <strong>COLETA VOLUNTÁRIA DEMO:</strong> Nada é transmitido via internet. Dados voláteis
            em memória.
          </span>
        </div>
        <span className="text-[11px] font-semibold bg-[#C9A227] text-[#0A1F33] px-2 py-0.5 rounded shadow-2xs">
          DEMO
        </span>
      </div>

      {/* Cabeçalho da Página */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs font-semibold text-[#C9A227] uppercase tracking-wider">
          <FileText className="w-4 h-4" />
          Canal Interno de Acolhimento
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#0A1F33] tracking-tight">
          Relatar Experiência de Atendimento
        </h1>
        <p className="text-sm text-slate-600 leading-relaxed">
          Sua percepção é voluntária e nos ajuda a aperfeiçoar nossos padrões de atenção, urbanidade
          e pontualidade.
        </p>
      </div>

      {/* Indicador de Passos */}
      {step !== 3 && (
        <div className="flex items-center gap-2 text-xs font-medium text-slate-500 pb-2 border-b border-slate-200">
          <span
            className={`flex items-center justify-center w-5 h-5 rounded-full text-[11px] font-bold ${
              step === 1 ? 'bg-[#0A1F33] text-[#E5C048]' : 'bg-[#C9A227] text-[#0A1F33]'
            }`}
          >
            1
          </span>
          <span className={step === 1 ? 'font-bold text-[#0A1F33]' : 'text-[#A68218]'}>
            Consentimento e Diretrizes
          </span>
          <span className="text-slate-300 mx-1">/</span>
          <span
            className={`flex items-center justify-center w-5 h-5 rounded-full text-[11px] font-bold ${
              step === 2 ? 'bg-[#0A1F33] text-[#E5C048]' : 'bg-slate-200 text-slate-600'
            }`}
          >
            2
          </span>
          <span className={step === 2 ? 'font-bold text-[#0A1F33]' : 'text-slate-400'}>
            Campos do Relato (Opcionais)
          </span>
        </div>
      )}

      {/* ETAPA 1: Consentimento (sem pre-check) */}
      {step === 1 && (
        <div className="bg-white rounded-lg p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6 animate-fade-in">
          {/* Caixa de aviso sobre sigilo e ausência de condicionamento */}
          <div className="p-4 rounded-md bg-[#0A1F33]/5 border border-[#C9A227]/30 text-xs text-slate-800 space-y-2">
            <div className="flex items-start gap-2 text-[#0A1F33]">
              <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-[#C9A227]" />
              <div className="font-semibold text-sm">
                Aviso de Demonstração e Dever Ético de Sigilo
              </div>
            </div>
            <p className="leading-relaxed text-slate-700 pl-6">
              Este formulário é de <strong>demonstração sem autenticação</strong> e{' '}
              <strong>não condiciona o atendimento</strong>. O sigilo profissional é um dever ético
              do escritório (art. 35 do CED/OAB). Como este protótipo não possui garantias técnicas
              nem persistência externa, orientamos expressamente:
            </p>
            <div className="bg-white p-3 rounded border border-red-200 text-[#B3261E] font-medium text-xs pl-3">
              Não insira fatos do caso, números de processo, nomes de terceiros ou informações
              reais/sigilosas.
            </div>
            <p className="text-[11px] text-slate-500 pl-6">
              Canal de demonstração sem autenticação. Não solicitamos nem guardamos CPF ou
              documentos pessoais. Protótipo em memória; nada é enviado ou armazenado.
            </p>
          </div>

          {/* Checkbox de consentimento - desmarcado por padrão */}
          <div className="pt-2">
            <label className="flex items-start gap-3 cursor-pointer group select-none">
              <input
                type="checkbox"
                checked={consentChecked}
                onChange={(e) => setConsentChecked(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-slate-300 text-[#0A1F33] focus:ring-[#C9A227] focus:ring-2 cursor-pointer"
              />
              <span className="text-xs sm:text-sm text-slate-800 group-hover:text-[#0A1F33] transition-colors leading-relaxed">
                Li e compreendo o aviso de demonstração (sem autenticação nem envio de dados reais)
                e concordo em simular o relato.
              </span>
            </label>
            {!consentChecked && (
              <p className="text-[11px] text-slate-500 mt-2 pl-7">
                * É necessário marcar a confirmação voluntária para avançar ao formulário.
              </p>
            )}
          </div>

          {/* Botão Continuar */}
          <div className="pt-4 border-t border-slate-200 space-y-3">
            <button
              type="button"
              disabled={!consentChecked}
              onClick={handleConsentContinue}
              className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-md font-semibold text-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A227] ${
                consentChecked
                  ? 'bg-[#0A1F33] text-white hover:bg-[#132E4A] active:scale-[0.98] shadow-xs cursor-pointer border border-[#0A1F33]'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              Continuar
              <ArrowRight className="w-4 h-4 text-[#C9A227]" />
            </button>

            {/* Nota de Demonstração */}
            <p className="text-xs text-slate-700 bg-[#0A1F33]/5 p-2.5 rounded border border-[#C9A227]/30 leading-relaxed">
              <strong className="text-[#0A1F33]">DEMONSTRAÇÃO</strong> — nada será enviado. Dados
              fictícios (prefixo{' '}
              <code className="font-mono bg-white px-1 py-0.5 rounded text-[11px] border border-slate-200">
                E2E_SYNTH_
              </code>
              ) são apagados ao recarregar a página.
            </p>
          </div>
        </div>
      )}

      {/* ETAPA 2: Campos (opcionais e mínimos) */}
      {step === 2 && (
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-lg p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6 animate-fade-in"
        >
          {/* Aviso inline dos campos */}
          <div className="bg-slate-50 p-3 rounded text-xs text-slate-600 border border-slate-200 flex items-center gap-2">
            <Info className="w-4 h-4 text-[#0A1F33] shrink-0" />
            <span>
              Nome e relato são <strong>opcionais</strong>; a data da experiência é necessária para
              contexto cronológico do atendimento. Sem perguntas sobre processo, CPF ou diagnóstico.
            </span>
          </div>

          {/* Campo: Nome (opcional, máx 80) */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <label
                htmlFor="field-name"
                className="font-semibold text-slate-800 flex items-center gap-1.5"
              >
                <User className="w-3.5 h-3.5 text-slate-500" />
                Nome ou identificador (Opcional)
              </label>
              <span className="text-slate-500">{name.length}/80</span>
            </div>
            <input
              id="field-name"
              type="text"
              value={name}
              maxLength={85}
              onChange={(e) => {
                setName(e.target.value)
                if (errors.name) validateFields()
              }}
              placeholder="Ex.: E2E_SYNTH_Cliente_Exemplo ou deixe em branco"
              className={`w-full px-3 py-2 text-sm rounded-md border bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-colors ${
                errors.name
                  ? 'border-[#B3261E] focus:ring-[#B3261E]'
                  : 'border-slate-300 focus:ring-[#0A1F33] focus:border-[#0A1F33]'
              }`}
            />
            {errors.name ? (
              <p className="text-xs text-[#B3261E] font-medium animate-fade-in">{errors.name}</p>
            ) : (
              <p className="text-[11px] text-slate-500">
                Se preenchido, será salvo com o prefixo{' '}
                <code className="bg-slate-100 px-1 py-0.5 rounded">E2E_SYNTH_</code>.
              </p>
            )}
          </div>

          {/* Campo: Relato (opcional, máx 2000, com contador) */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <label htmlFor="field-relato" className="font-semibold text-slate-800">
                Relato da Experiência (Opcional)
              </label>
              <span
                className={`font-mono ${relato.length > 2000 ? 'text-[#B3261E] font-bold' : 'text-slate-500'}`}
              >
                {relato.length}/2000
              </span>
            </div>
            <textarea
              id="field-relato"
              rows={5}
              value={relato}
              maxLength={2100}
              onChange={(e) => {
                setRelato(e.target.value)
                if (errors.relato) validateFields()
              }}
              placeholder="Descreva exclusivamente aspectos sobre cordialidade, pontualidade, clareza e atendimento geral. Não insira dados de processos judiciais."
              className={`w-full p-3 text-sm rounded-md border bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-colors ${
                errors.relato
                  ? 'border-[#B3261E] focus:ring-[#B3261E]'
                  : 'border-slate-300 focus:ring-[#0A1F33] focus:border-[#0A1F33]'
              }`}
            />
            {errors.relato ? (
              <p className="text-xs text-[#B3261E] font-medium animate-fade-in">{errors.relato}</p>
            ) : (
              <p className="text-[11px] text-slate-500">
                Lembrete: não compartilhe detalhes de causas ou dados de terceiros.
              </p>
            )}
          </div>

          {/* Campo: Data da Experiência (DD/MM/AAAA, não futura) */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <label
                htmlFor="field-date"
                className="font-semibold text-slate-800 flex items-center gap-1.5"
              >
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                Data da Experiência (Obrigatória)
              </label>
              <span className="text-slate-500">
                Formato BR: {experienceDate ? formatDateBR(experienceDate) : 'DD/MM/AAAA'}
              </span>
            </div>
            <input
              id="field-date"
              type="date"
              max={getTodayDateInputValue()}
              value={experienceDate}
              onChange={(e) => {
                const nextVal = e.target.value
                setExperienceDate(nextVal)
                if (errors.experienceDate) {
                  // Revalida inline
                  const nextErrors = { ...errors }
                  if (!nextVal) {
                    nextErrors.experienceDate =
                      'Informe a data em que ocorreu a experiência de atendimento.'
                  } else {
                    const dateVal = validateDateOnlyString(nextVal)
                    if (!dateVal.valid) {
                      nextErrors.experienceDate = dateVal.error || 'Data inválida.'
                    } else if (isFutureDate(nextVal)) {
                      nextErrors.experienceDate = 'A data da experiência não pode ser futura.'
                    } else {
                      delete nextErrors.experienceDate
                    }
                  }
                  setErrors(nextErrors)
                }
              }}
              className={`w-full sm:w-60 px-3 py-2 text-sm rounded-md border bg-white text-slate-900 focus:outline-none focus:ring-2 transition-colors ${
                errors.experienceDate
                  ? 'border-[#B3261E] focus:ring-[#B3261E]'
                  : 'border-slate-300 focus:ring-[#0A1F33] focus:border-[#0A1F33]'
              }`}
            />
            {errors.experienceDate ? (
              <p className="text-xs text-[#B3261E] font-medium animate-fade-in">
                {errors.experienceDate}
              </p>
            ) : (
              <p className="text-[11px] text-slate-500">
                Data do atendimento presencial ou virtual (preenchimento automático com a data de
                hoje; não pode ser futura).
              </p>
            )}
          </div>

          {/* Linha de confirmação de consentimento acima do botão */}
          <div className="pt-2 p-3 bg-slate-50 rounded border border-slate-200 text-xs text-slate-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#C9A227] shrink-0" />
            <span>
              Ao enviar, você confirma o consentimento voluntário marcado na etapa anterior.
            </span>
          </div>

          {/* Botões Voltar e Enviar */}
          <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 rounded-md border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 active:scale-[0.98] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A227]"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Voltar à Etapa 1
            </button>

            <button
              type="submit"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-md bg-[#0A1F33] text-white text-sm font-semibold hover:bg-[#132E4A] active:scale-[0.98] transition-all shadow-xs border border-[#0A1F33] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A227]"
            >
              Enviar Relato (DEMO)
              <ArrowRight className="w-4 h-4 text-[#C9A227]" />
            </button>
          </div>
        </form>
      )}

      {/* ETAPA 3: Painel de Sucesso Real */}
      {step === 3 && createdReport && (
        <div className="bg-white rounded-lg p-6 sm:p-8 border-2 border-[#C9A227]/40 shadow-md space-y-6 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#0A1F33] text-[#E5C048] flex items-center justify-center border border-[#C9A227]/40">
              <CheckCircle2 className="w-6 h-6 text-[#C9A227]" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#0A1F33]">
                Relato registrado na DEMONSTRAÇÃO
              </h2>
              <p className="text-xs text-slate-600 font-medium">
                Nada foi enviado via rede externa. Registro mantido em memória do navegador.
              </p>
            </div>
          </div>

          {/* Dados do Relato Fictício Gerado */}
          <div className="p-4 rounded-md bg-slate-50 border border-slate-200 space-y-2.5 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <span className="text-slate-500">Identificador Fictício:</span>
              <span className="font-mono font-bold text-[#0A1F33] bg-white px-2 py-0.5 rounded border border-slate-200">
                {createdReport.id}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Identificador/Nome:</span>
              <span className="font-semibold text-slate-800">{createdReport.clientName}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Data da Experiência:</span>
              <span className="text-slate-800">{createdReport.experienceDate}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Horário de Entrada (Timestamp):</span>
              <span className="text-slate-800">{createdReport.receivedAt}</span>
            </div>
            <div className="pt-2 border-t border-slate-200 text-slate-600 leading-relaxed">
              <div className="font-medium text-slate-800 mb-1">Texto Registrado:</div>
              <div className="italic bg-white p-2.5 rounded border border-slate-200">
                "{createdReport.relato}"
              </div>
            </div>
          </div>

          <div className="p-3 rounded bg-[#0A1F33]/5 border border-[#C9A227]/30 text-xs text-slate-700 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-[#C9A227]" />
            <div>
              <strong className="text-[#0A1F33]">Atenção de demonstração:</strong> Ao recarregar ou
              fechar a aba do navegador, todos os dados adicionados nesta sessão serão reiniciados
              para as fixtures padrão.
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <Link
              to="/painel"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-md bg-[#0A1F33] text-white text-sm font-semibold hover:bg-[#132E4A] active:scale-[0.98] transition-all shadow-xs border border-[#0A1F33] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A227]"
            >
              <LayoutDashboard className="w-4 h-4 text-[#C9A227]" />
              Ver Painel — DEMO
            </Link>

            <button
              type="button"
              onClick={() => {
                setStep(1)
                setConsentChecked(false)
                setName('')
                setRelato('')
                setCreatedReport(null)
              }}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-md border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 active:scale-[0.98] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A227]"
            >
              Registrar Outro Relato de Demonstração
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
