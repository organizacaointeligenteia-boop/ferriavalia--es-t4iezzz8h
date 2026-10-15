-- ============================================================================
-- CANDIDATO RASCUNHO (NÃO APLICADO / PENDENTE DE AUTORIZAÇÃO DO FABRÍCIO)
-- Projeto: Ferri & Ferri — Relatos e Experiência
-- Regras de Segurança, Políticas RLS (Row Level Security) e Controles de Acesso
--
-- ADVERTÊNCIAS E LIMITES ESTRITOS DESTE RASCUNHO:
-- 1. SQL POSTGRESQL GENÉRICO NÃO CONFIRMADO como compatível com Skip Cloud e
--    NÃO APLICÁVEL / NÃO ATIVAR até que o motor e os papéis/roles reais sejam comprovados.
-- 2. LIMITES DO MOTOR DE BANCO DE DADOS:
--    Políticas RLS em PostgreSQL padrão NÃO impedem o superusuário de banco, o
--    proprietário das tabelas (table owner) ou conexões com atributo BYPASSRLS /
--    service_role administrativa de ler/escrever diretamente. Este rascunho
--    NÃO promete e NÃO garante bloqueio de owner/service_role/BYPASSRLS — tais
--    controles dependem da configuração de privilégios de conexão e infraestrutura
--    do motor real e devem ser verificados na plataforma quando e se homologada.
-- 3. AUDITORIA DE COMBINAÇÕES PERMISSIVAS (SEMÁNTICA 'OR' DO POSTGRESQL):
--    No PostgreSQL, múltiplas políticas PERMISSIVE aplicadas ao mesmo comando
--    e papel são combinadas via operador lógico OR. Uma política com FALSE
--    NÃO cancela outra política permissiva que avalie para TRUE.
--    Portanto, TODAS as policies executáveis candidatas deste rascunho são
--    estritamente FAIL-CLOSED (USING FALSE / WITH CHECK FALSE), sem nenhuma
--    policy permissiva residual.
-- 4. AUSÊNCIA DE MECANISMO DE EQUIPE COMPROVADO:
--    A condição `auth.role() = 'authenticated'` NÃO É VERIFICAÇÃO DE STAFF, pois
--    autorizaria indistintamente qualquer conta logada. Na ausência de mecanismo
--    de equipe homologado (claims JWT, roles dedicados), o acesso de 'authenticated'
--    está CONFIGURADO COMO FAIL-CLOSED (FALSE) para todas as tabelas.
--    Nenhum claim, role ou GRANT foi inventado ou assumido.
-- 5. NENHUMA ATIVAÇÃO / SEM PROVISIONAMENTO:
--    Este arquivo é texto de especificação em repouso. Nada foi executado ou ativado.
-- ============================================================================

-- 1. Habilitação mandatória de RLS nas tabelas
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_audit_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_human_decisions ENABLE ROW LEVEL SECURITY;

-- 2. Remoção de privilégios públicos padrão (public / anon)
-- Preservado: sem concessão de novos GRANTs nesta rodada.
REVOKE ALL ON TABLE reports FROM PUBLIC;
REVOKE ALL ON TABLE report_audit_history FROM PUBLIC;
REVOKE ALL ON TABLE report_human_decisions FROM PUBLIC;

-- ============================================================================
-- 3. POLÍTICAS DE RLS PARA `reports` (FAIL-CLOSED INTEGRAL)
-- ============================================================================
-- Em PostgreSQL, para evitar qualquer vazamento por combinação 'OR' entre
-- policies permissivas, NENHUMA policy avalia para TRUE.
--
-- Intenção futura quando homologado provedor real de auth/equipe:
--   - Leitura/deliberação restrita à equipe via claim verificado pelo backend/auth.
--   - Inserção de novos relatos restrita a endpoint de backend autenticado via
--     mecanismo seguro de aplicação, sem permissão direta do cliente web.
--
-- Estado atual executável: FAIL-CLOSED para PUBLIC e para authenticated.

CREATE POLICY "reports_select_deny_all"
  ON reports
  FOR SELECT
  TO PUBLIC
  USING (FALSE);

CREATE POLICY "reports_insert_deny_all"
  ON reports
  FOR INSERT
  TO PUBLIC
  WITH CHECK (FALSE);

CREATE POLICY "reports_update_deny_all"
  ON reports
  FOR UPDATE
  TO PUBLIC
  USING (FALSE)
  WITH CHECK (FALSE);

CREATE POLICY "reports_delete_deny_all"
  ON reports
  FOR DELETE
  TO PUBLIC
  USING (FALSE);

-- ============================================================================
-- 4. POLÍTICAS DE RLS PARA `report_audit_history` (FAIL-CLOSED INTEGRAL)
-- ============================================================================
-- Tabelas de histórico e auditoria: fail-closed para todas as operações e papéis.
-- Nenhuma policy residual permite acesso (evitando combinação OR permissiva).

CREATE POLICY "audit_select_deny_all"
  ON report_audit_history
  FOR SELECT
  TO PUBLIC
  USING (FALSE);

CREATE POLICY "audit_insert_deny_all"
  ON report_audit_history
  FOR INSERT
  TO PUBLIC
  WITH CHECK (FALSE);

CREATE POLICY "audit_update_deny_all"
  ON report_audit_history
  FOR UPDATE
  TO PUBLIC
  USING (FALSE)
  WITH CHECK (FALSE);

CREATE POLICY "audit_delete_deny_all"
  ON report_audit_history
  FOR DELETE
  TO PUBLIC
  USING (FALSE);

-- ============================================================================
-- 5. POLÍTICAS DE RLS PARA `report_human_decisions` (FAIL-CLOSED INTEGRAL)
-- ============================================================================
-- Tabelas de decisões humanas: fail-closed para todas as operações e papéis.
-- Nenhuma policy residual permite acesso (evitando combinação OR permissiva).

CREATE POLICY "decisions_select_deny_all"
  ON report_human_decisions
  FOR SELECT
  TO PUBLIC
  USING (FALSE);

CREATE POLICY "decisions_insert_deny_all"
  ON report_human_decisions
  FOR INSERT
  TO PUBLIC
  WITH CHECK (FALSE);

CREATE POLICY "decisions_update_deny_all"
  ON report_human_decisions
  FOR UPDATE
  TO PUBLIC
  USING (FALSE)
  WITH CHECK (FALSE);

CREATE POLICY "decisions_delete_deny_all"
  ON report_human_decisions
  FOR DELETE
  TO PUBLIC
  USING (FALSE);

-- ============================================================================
-- NOTAS DE ARQUITETURA DE SEGURANÇA E LIMITES TÉCNICOS
-- ============================================================================
-- • LIMITES DE MOTOR REAL:
--   RLS é mecanismo interno do PostgreSQL e NÃO bloqueia papéis com BYPASSRLS
--   ou superusuário/owner. A segurança do cluster dependerá da segregação de
--   credenciais de conexão a ser definida na infraestrutura se autorizada.
-- • POLÍTICA DE EQUIPE PENDENTE:
--   `auth.role() = 'authenticated'` NÃO verifica se o usuário pertence ao escritório.
--   Qualquer ativação de acesso de leitura para operadores do escritório dependerá
--   de mecanismo comprovado de autorização (ex.: RBAC com claims ou tabela de
--   membros autorizados verificada no servidor), o qual NÃO foi inventado aqui.
-- • MURAL EXTERNO E EMBEDS:
--   Permanecem permanentemente DESATIVADOS. Nenhuma política concede acesso
--   público a qualquer relato.
-- ============================================================================
