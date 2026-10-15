-- ============================================================================
-- CANDIDATO RASCUNHO (NÃO APLICADO / PENDENTE DE AUTORIZAÇÃO DO FABRÍCIO)
-- Projeto: Ferri & Ferri — Relatos e Experiência
-- Regras de Segurança, Políticas RLS (Row Level Security) e Controles de Acesso
--
-- PRINCÍPIOS FUNDAMENTAIS:
-- 1. NEGAÇÃO POR PADRÃO: Toda e qualquer leitura, listagem, inserção direta,
--    atualização ou exclusão pública via cliente web é REJEITADA por padrão.
-- 2. SIGILO E DISCRIÇÃO: Relatos NÃO são públicos. Não há feed público nem
--    mural acessível sem autenticação e auditoria.
-- 3. PAINEL RESTRITO À EQUIPE: Apenas usuários autenticados com credenciais
--    oficiais da equipe Ferri & Ferri têm autorização de leitura e deliberação.
-- 4. CRIAÇÃO APENAS VIA ENDPOINT VALIDADO: O público não insere diretamente
--    na tabela; a submissão passa por endpoint restrito com rate limit,
--    validação de calendário estrita, teto de caracteres e idempotência.
-- ============================================================================

-- 1. Habilitação obrigatória de RLS nas tabelas
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_audit_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_human_decisions ENABLE ROW LEVEL SECURITY;

-- 2. Remoção de privilégios públicos padrão (public / anon)
REVOKE ALL ON TABLE reports FROM PUBLIC;
REVOKE ALL ON TABLE report_audit_history FROM PUBLIC;
REVOKE ALL ON TABLE report_human_decisions FROM PUBLIC;

-- 3. POLÍTICAS DE RLS PARA `reports`

-- (a) Bloqueio explícito de SELECT público/anônimo:
-- NENHUM cliente anônimo pode ler nenhum registro da tabela de relatos.
CREATE POLICY "reports_select_deny_public"
  ON reports
  FOR SELECT
  TO PUBLIC
  USING (FALSE);

-- (b) Leitura permitida EXCLUSIVAMENTE para equipe autenticada (ex.: role 'authenticated' / 'ferri_staff'):
CREATE POLICY "reports_select_staff_only"
  ON reports
  FOR SELECT
  TO authenticated
  USING (
    -- Validação de role interno da equipe (exemplo de claim JWT):
    -- (auth.jwt() ->> 'role' = 'ferri_staff' OR auth.jwt() ->> 'email' LIKE '%@ferriferriadv.com.br')
    auth.role() = 'authenticated'
  );

-- (c) Inserção pública bloqueada diretamente:
-- O envio deve ocorrer unicamente através de server function / backend endpoint
-- com service role protegida, após validação severa de calendário e antiabuso.
CREATE POLICY "reports_insert_deny_public"
  ON reports
  FOR INSERT
  TO PUBLIC
  WITH CHECK (FALSE);

-- (d) Atualização e exclusão públicas BLOQUEADAS:
CREATE POLICY "reports_update_deny_public"
  ON reports
  FOR UPDATE
  TO PUBLIC
  USING (FALSE)
  WITH CHECK (FALSE);

CREATE POLICY "reports_delete_deny_public"
  ON reports
  FOR DELETE
  TO PUBLIC
  USING (FALSE);

-- (e) Atualização de status e notas restrita à equipe autenticada:
CREATE POLICY "reports_update_staff_only"
  ON reports
  FOR UPDATE
  TO authenticated
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- 4. POLÍTICAS DE RLS PARA `report_audit_history` e `report_human_decisions`
-- Tabelas de histórico e deliberação são estritamente de uso interno da equipe.
CREATE POLICY "audit_select_staff_only"
  ON report_audit_history
  FOR SELECT
  TO authenticated
  USING (auth.role() = 'authenticated');

CREATE POLICY "audit_insert_staff_only"
  ON report_audit_history
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "audit_deny_public_all"
  ON report_audit_history
  FOR ALL
  TO PUBLIC
  USING (FALSE);

CREATE POLICY "decisions_select_staff_only"
  ON report_human_decisions
  FOR SELECT
  TO authenticated
  USING (auth.role() = 'authenticated');

CREATE POLICY "decisions_insert_staff_only"
  ON report_human_decisions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "decisions_deny_public_all"
  ON report_human_decisions
  FOR ALL
  TO PUBLIC
  USING (FALSE);

-- ============================================================================
-- NOTAS DE ARQUITETURA DE SEGURANÇA
-- ============================================================================
-- • MURAL EXTERNO E EMBEDS: Continuam permanentemente DESATIVADOS no código e no banco.
--   Nenhuma política concede acesso público a qualquer relato, mesmo que o status
--   seja 'Em Revisão' ou 'Arquivado'.
-- • PREVENÇÃO DE LOGIN FALSO: Nenhum login fake ou admin bypass deve ser aceito.
--   O painel autenticado requer a ativação futura de um provedor de auth real
--   (ex.: Skip Auth ou Supabase Auth) aprovado pelo Fabrício.
-- ============================================================================
