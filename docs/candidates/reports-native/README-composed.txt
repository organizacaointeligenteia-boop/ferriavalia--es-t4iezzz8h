=============================================================================
DOCUMENTAÇÃO DO ARTEFATO NATIVO COMPOSTO (INATIVO)
Arquivo: docs/candidates/reports-native/README-composed.txt
Projeto: Ferri & Ferri — Relatos e Experiência
ID do Projeto: 9d1a62e7-f60e-4585-aecf-107d6a652a9d
Data real de referência: 15/10/2026
Status: CANDIDATO INATIVO (fora de autodiscovery, sem deploy nesta rodada)
=============================================================================

1. ORIGEM EXATA DOS COMPONENTES
-----------------------------------------------------------------------------
O artefato 'docs/candidates/reports-native/reports-native-composed.js.txt' é a
composição formal, sem alteração silenciosa de algoritmo, de dois blocos previamente
especificados e auditados:

a) Candidato de Coleta v0.0.17:
   - Caminho de referência: docs/candidates/reports-native/reports-native-candidate.js.txt
   - Contribuição: Hook HTTP PocketBase (routerAdd('POST', '/backend/v1/reports', ...)),
     validação de payload bruto (rejeição de null, array e tipos primitivos),
     ALLOWED_TERMS_VERSIONS dentro do escopo do callback, higienização estrita de campos,
     validação de calendário gregoriano (1900-2100, bissextos) e checagem de data futura,
     idempotência canônica preventiva ({ success: true, received: true }, status 201),
     inserção atômica via Record e tratamento seguro de erro UNIQUE com reconsulta
     obrigatória de confirmação da MESMA idempotency_key antes de devolver status 201.

b) Adapter Nativo de Tempo v0.0.19:
   - Caminho de referência: docs/candidates/reports-native/native-time-adapter.js.txt
   - Contribuição: Função resolveNativeTime posicionada DENTRO do callback do routerAdd
     (mesmo escopo de execução Goja), utilizando DateTime e Timezone nativos da JSVM Go.
     new Timezone('America/Sao_Paulo') global com verificação estrita de zone string
     ('America/Sao_Paulo' em loc.string() e goTimeSp.location().string()), neutralizando
     o risco central de fallback silencioso para UTC da engine PocketBase.
     Try/catch em todos os bindings, validação de unix() finito positivo, layout Go canônico
     ISO UTC com epoch matching idêntico, auditoria legível BRT e contrato de erro público
     exclusivo e minimalista: { success: false, statusCode: 503, error: 'timezone_unavailable' }.
     Substitui integralmente a seção Intl do v17, capturando UM ÚNICO instante por requisição.


2. MAPA DE CAMPOS E SAÍDAS DO ADAPTER
-----------------------------------------------------------------------------
As saídas do adapter v19 alimentam diretamente os campos e gates do coletor:

| Saída do Adapter       | Campo / Uso no Coletor   | Destino / Comportamento                            |
|------------------------|--------------------------|----------------------------------------------------|
| todayDateSp            | todaySpString            | Comparação com experienceDate (bloqueio data futura)|
| formattedReceivedAtSp  | formattedReceivedAtSp    | Coluna 'received_at_sp' (ex: 'DD/MM/AAAA às HH:MM:SS (America/Sao_Paulo)') |
| receivedAtIsoUtc       | receivedAtIsoUtc         | Campo 'audit_history' JSON (timestamp_iso_utc)     |
| epochSeconds           | epochSeconds             | Validação interna de integridade no adapter        |


3. ORDEM ESTRITA DO TRACE DE EXECUÇÃO
-----------------------------------------------------------------------------
A requisição segue rigorosamente a ordem canônica fail-closed:

  [1. QUOTA]  --> Gate injetável default-deny (429 rate_limited se ausente/inválido)
       |
       v
  [2. TIMEZONE] --> resolveNativeTime() nativo (503 timezone_unavailable se indisponível)
       |
       v
  [3. VALIDAÇÃO] --> Payload bruto JSON, consentGiven===true, termsVersion na lista,
                     experienceDate calendário gregoriano e <= hoje em SP (400 se inválido)
       |
       v
  [4. DEDUP]  --> Consulta preventiva de idempotencyKey (201 canônico se já existir, ZERO saves)
       |
       v
  [5. SAVE]   --> Criação de Record('reports'), save() atômico (201 canônico)
                  Tratamento de UNIQUE: reconsulta confirma a mesma chave -> 201; senão -> 500.

NOTA CRÍTICA: Qualquer falha em Quota ou Timezone encerra a requisição IMEDIATAMENTE,
com ZERO acesso a tabelas do banco de dados (zero consultas e zero gravações).


4. MECANISMO DE QUOTA / RATE LIMITING (GATE INJETÁVEL)
-----------------------------------------------------------------------------
- O antigo contador de relatos recentes da coleção 'reports' (findRecordsByFilter) foi
  REMOVIDO por não representar proteção adequada contra DoS e por não segregar tentativas.
- O artefato adota um gate de quota INJETÁVEL (e.quotaProvider / options.quotaProvider).
- Em ambiente de produção sem um provider configurado, o comportamento padrão é
  DEFAULT-DENY (fail-closed imediato com HTTP 429 { success: false, error: 'rate_limited' }).
- Se o provider lançar erro ou retornar payload diferente de { allowed: true }, nega fail-closed.
- A especificação da coleção dedicada 'rate_limit_quotas' permanece documentada em
  docs/candidates/reports-native/migration-quota.txt (NÃO aplicada nesta rodada).


5. GATES RESTANTES PARA ATIVAÇÃO DEFINITIVA
-----------------------------------------------------------------------------
Para eventual integração futura autorizada pelo cliente:

1. COMPROVAÇÃO DE TZDATA NO GOJA REAL:
   Deploy de teste isolado para verificar se o runtime Goja do Skip Cloud específico
   possui o banco IANA tzdata embutido e se new Timezone('America/Sao_Paulo') não
   aciona o fallback UTC.
2. LIMITER REAL COM PROVEDOR DE INFRAESTRUTURA:
   Definição de fonte confiável de IP de cliente no proxy de borda (ingress headers),
   segredo gerenciado ($secrets.get('RATE_LIMIT_PEPPER')) para HMAC-SHA256,
   aplicação da migração 'rate_limit_quotas' e política de expiração/retenção de janelas.
3. INTEGRAÇÃO DO HOOK ÚNICO:
   Remoção do arquivo duplicado pocketbase/hooks/reports.pb.js e consolidação exclusiva
   em pocketbase/hooks/reports.js.
4. FLAG IS_STAFF NA COLEÇÃO USERS:
   A coleção de usuários ainda não possui o campo booleano is_staff.
5. CREDENCIAIS CRIADAS PELO USUÁRIO NA UI:
   Criação manual do primeiro usuário administrador de equipe via painel.
6. URL DEFINITIVA E QR CODE:
   Geração e fixação de placas e QR codes somente após URL HTTPS permanente confirmada
   expressamente pelo Fabrício.
