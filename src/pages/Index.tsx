import React from 'react'
import { Link } from 'react-router-dom'
import {
  ShieldAlert,
  ShieldCheck,
  Scale,
  FileText,
  LayoutDashboard,
  CheckCircle2,
  Lock,
  AlertTriangle,
  ArrowRight,
  Eye,
  Info,
  PhoneOff,
} from 'lucide-react'

export default function Index() {
  return (
    <div className="space-y-12 sm:space-y-16 animate-fade-in">
      {/* Rótulo Flutuante / Identificação de DEMO local da página */}
      <div className="flex items-center justify-between bg-amber-50 border border-amber-200 text-[#8A6D1A] px-3.5 py-2 rounded-md text-xs">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 text-[#8A6D1A]" />
          <span>
            <strong>PÁGINA INSTITUCIONAL (PROTÓTIPO DEMO):</strong> Demonstração de interface para
            um único escritório.
          </span>
        </div>
        <span className="hidden sm:inline-block text-[11px] font-semibold bg-[#8A6D1A] text-white px-2 py-0.5 rounded">
          DEMO EXCLUSIVA
        </span>
      </div>

      {/* 1. Hero Section */}
      <section className="text-center space-y-5 pt-4 sm:pt-8 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-[#0B3B4F]/10 text-[#0B3B4F] border border-[#0B3B4F]/20">
          <Scale className="w-3.5 h-3.5" />
          Escritório Ferri &amp; Ferri
        </div>

        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#0B3B4F] tracking-tight leading-tight">
          Atendimento jurídico com compromisso e discrição
        </h1>

        <p className="text-base sm:text-lg text-[#52656B] leading-relaxed">
          Espaço interno e confidencial para escuta voluntária dos clientes sobre a experiência de
          acolhimento e atendimento do nosso escritório.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            to="/relatar"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-md bg-[#0B3B4F] text-white font-semibold text-sm hover:bg-[#09546B] active:scale-[0.98] transition-all shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B3B4F]"
          >
            <FileText className="w-4 h-4" />
            Relatar Experiência
            <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
          <Link
            to="/painel"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-md bg-white text-[#0B3B4F] border border-[#D8E2E0] font-semibold text-sm hover:bg-[#F5F8F7] active:scale-[0.98] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B3B4F]"
          >
            <LayoutDashboard className="w-4 h-4" />
            Conheça o Painel — DEMO
          </Link>
        </div>
      </section>

      {/* 2. Sobre o Escritório Section */}
      <section className="bg-white rounded-lg p-6 sm:p-8 border border-[#D8E2E0] shadow-xs space-y-4">
        <div className="flex items-center gap-2.5 text-[#0B3B4F]">
          <Scale className="w-5 h-5 text-[#1B6B4A]" />
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">Sobre o Escritório</h2>
        </div>
        <p className="text-sm sm:text-base text-[#1A2E33] leading-relaxed">
          A <strong>Ferri &amp; Ferri</strong> dedica-se à prestação de serviços jurídicos pautados
          pela sobriedade, transparência e pelo estrito respeito à relação de confiança estabelecida
          com cada constituinte. Valorizamos a clareza na comunicação e o atendimento atencioso em
          todas as fases do contato com a nossa equipe.
        </p>
        <p className="text-sm sm:text-base text-[#52656B] leading-relaxed">
          Nosso objetivo com este canal de escuta é exclusivamente colher percepções a respeito da
          qualidade do atendimento, da cordialidade e da pontualidade, sem qualquer finalidade de
          captação mercantil ou autopromoção desmedida.
        </p>
      </section>

      {/* 3. Compromisso com a Ética Section */}
      <section className="bg-white rounded-lg p-6 sm:p-8 border border-[#D8E2E0] shadow-xs space-y-5">
        <div className="flex items-center gap-2.5 text-[#0B3B4F]">
          <ShieldAlert className="w-5 h-5 text-[#8A6D1A]" />
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
            Compromisso com a Ética e Publicidade Jurídica
          </h2>
        </div>

        <p className="text-sm sm:text-base text-[#1A2E33] leading-relaxed">
          A atuação da advocacia rege-se pelas diretrizes do Código de Ética e Disciplina da OAB e
          pelo Provimento n.º 205/2021 do Conselho Federal da OAB. Em consonância com a disciplina
          profissional, esclarecemos expressamente:
        </p>

        {/* Banner Ético Mandatório */}
        <div className="bg-[#8A6D1A]/10 border-l-4 border-[#8A6D1A] p-4 rounded-r-md text-[#1A2E33] space-y-2">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-5 h-5 text-[#8A6D1A] shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold text-sm text-[#8A6D1A]">
                Publicação e divulgação de relatos permanecem desativadas, pendentes de revisão
                ética OAB e decisão específica do responsável.
              </p>
              <p className="text-xs text-[#52656B] leading-relaxed">
                A autorização do constituinte não basta para autorizar a publicidade jurídica. A
                coleta interna de impressões de atendimento e a veiculação publicitária constituem
                finalidades inteiramente distintas. Por prudência e conformidade deontológica,
                nenhum mural externo ou ferramenta de divulgação pública está em operação.
              </p>
            </div>
          </div>
        </div>

        <ul className="text-xs sm:text-sm text-[#52656B] space-y-2 list-disc pl-5">
          <li>Não há divulgação de nomes de clientes ou identificadores pessoais.</li>
          <li>Não há promessas de resultado, estimativas de êxito ou divulgação de valores.</li>
          <li>Não há comparações entre escritórios ou incentivo à mercantilização da profissão.</li>
          <li>
            O envio de qualquer relato é voluntário e jamais condiciona o atendimento prestado.
          </li>
        </ul>
      </section>

      {/* 4. Como Participar Section (3 passos com anti-sigilo) */}
      <section className="space-y-6">
        <div className="text-center space-y-1">
          <h2 className="text-xl sm:text-2xl font-bold text-[#0B3B4F] tracking-tight">
            Como Funciona o Canal de Experiência
          </h2>
          <p className="text-sm text-[#52656B]">
            Processo transparente, facultativo e com proteção integral do sigilo profissional.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          {/* Passo 1 */}
          <div className="bg-white p-5 sm:p-6 rounded-lg border border-[#D8E2E0] shadow-xs flex flex-col justify-between space-y-4">
            <div className="space-y-2.5">
              <div className="w-8 h-8 rounded-full bg-[#0B3B4F] text-white flex items-center justify-center font-bold text-sm">
                1
              </div>
              <h3 className="font-bold text-base text-[#0B3B4F]">
                Acesse o formulário de experiência
              </h3>
              <p className="text-xs sm:text-sm text-[#52656B] leading-relaxed">
                Leia o aviso prévio de privacidade e confirme voluntariamente o consentimento antes
                de prosseguir para a área de escrita.
              </p>
            </div>
            <div className="text-[11px] text-[#8A6D1A] bg-amber-50 p-2 rounded border border-amber-200">
              Consentimento desmarcado por padrão.
            </div>
          </div>

          {/* Passo 2 */}
          <div className="bg-white p-5 sm:p-6 rounded-lg border border-[#D8E2E0] shadow-xs flex flex-col justify-between space-y-4">
            <div className="space-y-2.5">
              <div className="w-8 h-8 rounded-full bg-[#1B6B4A] text-white flex items-center justify-center font-bold text-sm">
                2
              </div>
              <h3 className="font-bold text-base text-[#0B3B4F]">Preencha apenas campos mínimos</h3>
              <p className="text-xs sm:text-sm text-[#52656B] leading-relaxed">
                Todos os campos são opcionais. Compartilhe unicamente impressões gerais sobre a
                urbanidade, pontualidade e clareza do atendimento.
              </p>
            </div>
            <div className="text-[11px] font-semibold text-[#B3261E] bg-red-50 p-2 rounded border border-red-200">
              Não insira fatos do caso, nomes de terceiros ou informações sigilosas.
            </div>
          </div>

          {/* Passo 3 */}
          <div className="bg-white p-5 sm:p-6 rounded-lg border border-[#D8E2E0] shadow-xs flex flex-col justify-between space-y-4">
            <div className="space-y-2.5">
              <div className="w-8 h-8 rounded-full bg-[#0B3B4F] text-white flex items-center justify-center font-bold text-sm">
                3
              </div>
              <h3 className="font-bold text-base text-[#0B3B4F]">Envie voluntariamente</h3>
              <p className="text-xs sm:text-sm text-[#52656B] leading-relaxed">
                No ambiente demonstrativo, os registros são mantidos unicamente na memória da sessão
                e podem ser consultados no painel interno experimental.
              </p>
            </div>
            <div className="text-[11px] text-[#52656B] bg-[#F5F8F7] p-2 rounded border border-[#D8E2E0]">
              Direito à retirada garantido a qualquer tempo.
            </div>
          </div>
        </div>
      </section>

      {/* 5. Seção de Privacidade e Sigilo */}
      <section className="bg-white rounded-lg p-6 sm:p-8 border border-[#D8E2E0] shadow-xs space-y-4">
        <div className="flex items-center gap-2.5 text-[#0B3B4F]">
          <Lock className="w-5 h-5 text-[#1B6B4A]" />
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
            Privacidade e Sigilo Profissional
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm text-[#1A2E33]">
          <div className="space-y-2 p-4 bg-[#F5F8F7] rounded-md border border-[#D8E2E0]">
            <h3 className="font-bold text-[#0B3B4F]">Coleta Privada ≠ Não Anônima</h3>
            <p className="text-[#52656B] leading-relaxed">
              O formulário é um canal privado de acolhimento institucional, mas{' '}
              <strong>não é prometido anonimato absoluto</strong>. A coleta visa à organização
              interna do escritório para melhoria de procedimentos.
            </p>
          </div>

          <div className="space-y-2 p-4 bg-[#F5F8F7] rounded-md border border-[#D8E2E0]">
            <h3 className="font-bold text-[#0B3B4F]">Retirada a Qualquer Tempo</h3>
            <p className="text-[#52656B] leading-relaxed">
              O participante tem o direito de solicitar a exclusão ou retirada de seu registro a
              qualquer momento. O painel interno conta com simulação específica para este fluxo.
            </p>
          </div>
        </div>

        <p className="text-xs text-[#52656B] leading-relaxed pt-2">
          Não solicitamos nem armazenamos documentos, número de processo, CPF, senhas judiciais ou
          detalhes de litígios. O sigilo entre advogado e cliente permanece resguardado por lei.
        </p>
      </section>

      {/* 6. WhatsApp / Bloco de Contato (marcado expressamente como DEMO) */}
      <section className="bg-white rounded-lg p-6 border border-[#D8E2E0] space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2 text-[#0B3B4F]">
            <PhoneOff className="w-5 h-5 text-[#8A6D1A]" />
            <h3 className="font-bold text-base">Contato Institucional (DEMO)</h3>
          </div>
          <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-[#8A6D1A]/15 text-[#8A6D1A] border border-[#8A6D1A]/30">
            CONTATO DEMO
          </span>
        </div>
        <p className="text-xs sm:text-sm text-[#52656B]">
          Por se tratar de protótipo de validação de fluxo sem finalidade comercial, nenhum
          telefone, link de WhatsApp ou e-mail de captação é disponibilizado.
        </p>
        <div className="bg-[#F5F8F7] p-3 rounded text-xs text-[#8A6D1A] font-medium border border-[#D8E2E0]">
          Nota: Contato direto estará disponível na versão final após conclusão da aprovação ética
          OAB e deliberação do responsável.
        </div>
      </section>
    </div>
  )
}
