-- ============================================================================
-- CANDIDATO RASCUNHO (NÃO APLICADO / PENDENTE DE AUTORIZAÇÃO DO FABRÍCIO)
-- Projeto: Ferri & Ferri — Relatos e Experiência (id 9d1a62e7-f60e-4585-aecf-107d6a652a9d)
-- Tabela: reports (Relatos internos de experiência de atendimento)
--
-- ATENÇÃO DE GOVERNANÇA:
-- 1. Este arquivo é estritamente um RASCUNHO ARQUITETURAL em disco.
-- 2. NÃO deve ser executado nem aplicado sem autorização expressa do Fabrício.
-- 3. Banco de dados dedicado e isolado: NENHUMA conexão ou compartilhamento com
--    o projeto de ProvaSocial Médica ou qualquer outro cliente.
-- 4. OAB & Privacidade: Coleta voluntária interna de percepção do atendimento.
--    Campos mínimos e restritos; dados do processo, CPF e segredos são vedados.
-- 5. Timezone canônico: America/Sao_Paulo (horário oficial de Brasília).
-- ============================================================================

-- Extensão pgcrypto / uuid-ossp (se suportado no PostgreSQL alvo)
-- CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Enum para a máquina de estados do relato
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'report_status_enum') THEN
    CREATE TYPE report_status_enum AS ENUM (
      'Recebido',
      'Em Revisão',
      'Arquivado',
      'Retirada Solicitada'
    );
  END IF;
END $$;

-- 2. Tabela principal de relatos
CREATE TABLE IF NOT EXISTS reports (
  -- Identificador único primário
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Chave de idempotência (fornecida pelo cliente/frontend para evitar duplicidades em rede oscilante)
  idempotency_key VARCHAR(128) NOT NULL UNIQUE,

  -- Campos do constituinte / voluntário
  -- Nome opcional com teto estrito de 80 caracteres
  client_name VARCHAR(80) NULL,

  -- Texto do relato com teto de 2000 caracteres (opcional ou sintetizado)
  relato TEXT NULL,

  -- Data da experiência de atendimento (DATE-ONLY no formato gregoriano, sem conversão para UTC Date)
  experience_date DATE NOT NULL,

  -- Consentimento e versionamento dos termos éticos de atendimento
  consent_given BOOLEAN NOT NULL DEFAULT FALSE,
  terms_version VARCHAR(20) NOT NULL, -- ex.: 'v1.0-2025'
  consent_timestamp TIMESTAMPTZ NOT NULL DEFAULT (CURRENT_TIMESTAMP AT TIME ZONE 'America/Sao_Paulo'),

  -- Status do relato na máquina de estados interna
  status report_status_enum NOT NULL DEFAULT 'Recebido',

  -- Timestamps com fuso horário explícito
  created_at TIMESTAMPTZ NOT NULL DEFAULT (CURRENT_TIMESTAMP AT TIME ZONE 'America/Sao_Paulo'),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT (CURRENT_TIMESTAMP AT TIME ZONE 'America/Sao_Paulo'),

  -- Mecanismo de retirada e arquivamento ético
  withdrawal_requested_at TIMESTAMPTZ NULL,
  withdrawal_reason TEXT NULL,

  -- Metadados de segurança e integridade (sem expor IP público em texto claro se houver hashing)
  client_user_agent_hash VARCHAR(64) NULL,

  -- Restrições de integridade de dados (CHECK constraints)
  CONSTRAINT chk_client_name_length CHECK (client_name IS NULL OR char_length(client_name) <= 80),
  CONSTRAINT chk_relato_length CHECK (relato IS NULL OR char_length(relato) <= 2000),
  CONSTRAINT chk_consent_mandatory CHECK (consent_given = TRUE),
  CONSTRAINT chk_experience_date_bounds CHECK (experience_date >= DATE '1900-01-01' AND experience_date <= CURRENT_DATE)
);

-- 3. Tabela de histórico de auditoria e decisões humanas (imutável / append-only)
CREATE TABLE IF NOT EXISTS report_audit_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,

  -- Ação realizada (ex.: 'Relato recebido', 'Status alterado', 'Decisão humana registrada', 'Retirada solicitada')
  action VARCHAR(100) NOT NULL,

  -- Transição de status (se aplicável)
  previous_status report_status_enum NULL,
  new_status report_status_enum NULL,

  -- Nota ou justificativa ética
  note TEXT NULL,

  -- Identificação do membro da equipe autenticado responsável pela ação
  performed_by_user_id VARCHAR(64) NULL,

  -- Timestamp auditável
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT (CURRENT_TIMESTAMP AT TIME ZONE 'America/Sao_Paulo')
);

-- 4. Tabela de deliberações e decisões humanas (revisão de conformidade ética OAB)
CREATE TABLE IF NOT EXISTS report_human_decisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,

  decision_type VARCHAR(50) NOT NULL, -- ex.: 'CONFORMIDADE_ETICA_APROVADA', 'ARQUIVAMENTO_PASSIVO', 'RETIRADA_ACATADA'
  justification TEXT NOT NULL,
  reviewer_user_id VARCHAR(64) NOT NULL,
  decided_at TIMESTAMPTZ NOT NULL DEFAULT (CURRENT_TIMESTAMP AT TIME ZONE 'America/Sao_Paulo')
);

-- 5. Índices de consulta restrita à equipe
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_experience_date ON reports(experience_date);
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON reports(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_report_audit_history_report_id ON report_audit_history(report_id, recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_report_human_decisions_report_id ON report_human_decisions(report_id, decided_at DESC);

-- ============================================================================
-- COMENTÁRIOS E NOTAS DE SEGURANÇA
-- ============================================================================
COMMENT ON TABLE reports IS 'Relatos de experiência voluntários e internos da Ferri & Ferri. Acesso público bloqueado.';
COMMENT ON COLUMN reports.experience_date IS 'Data da experiência validada date-only, nunca futura em relação ao fuso America/Sao_Paulo.';
COMMENT ON COLUMN reports.consent_given IS 'Confirmação expressa de consentimento voluntário antes do envio.';
COMMENT ON COLUMN reports.status IS 'Recebido | Em Revisão | Arquivado | Retirada Solicitada.';
