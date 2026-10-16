# Ferri & Ferri — Relatos e Experiência

Protótipo frontend estático e em memória para coleta voluntária de experiência de atendimento e organização interna de relatos, desenvolvido para um **único escritório** de advocacia (**Ferri & Ferri Advogados**).

> **AVISO IMPORTANTE:** Este projeto NÃO é um SaaS, NÃO é voltado para venda a advogados ou terceiros, NÃO contém banco de dados, autenticação, storage ou integrações com a internet. Trata-se de um protótipo demonstrativo restrito para validação de fluxos e conformidade deontológica. **NÃO está pronto para dados reais.** Toda a interface é de demonstração pura, sem autenticação, e não oferece garantias técnicas de confidencialidade, privacidade ou restrição de acesso. O sigilo profissional é dever ético dos advogados nos termos da lei e do CED/OAB.

---

## 1. Identidade Visual Oficial e Asset do Logo

Nesta rodada de identidade visual, a interface foi completamente alinhada à identidade visual do escritório **Ferri & Ferri Advogados**, extraída diretamente de seu site oficial ([https://ferriferriadv.com.br/](https://ferriferriadv.com.br/)):

- **Paleta Oficial Aplicada:**
  - **Azul-Marinho Bem Escuro** (`#0A1F33` / `#071624` / `#132E4A`): Utilizado como cor primária no topo/header, botões de ação principal, footer e cartões de destaque.
  - **Acentos Dourados** (`#C9A227` / `#E5C048` / `#A68218`): Utilizados em ícones, bordas selecionadas, destaques, rótulos e elementos de contraste.
  - **Fundos Claros Neutros** (`#F8FAFC` / `#FFFFFF`): Fundos elegantes e sóbrios para leitura e preenchimento de formulários.
  - **Remoção Total de Verdes:** Toda a paleta verde genérica da primeira versão foi substituída, garantindo contraste AA e sobriedade jurídica.

- **Asset Oficial do Logo e Tratamento de Rede:**
  - **Origem exata:** `https://ferriferriadv.com.br/wp-content/uploads/2026/06/Logo-FerriFerri-horizontal.png` (asset público exportado legitimamente do site oficial).
  - **Dimensões nativas:** 437 × 101 px (horizontal, tipografia/escudo em branco sobre fundo escuro).
  - **SHA256 original:** `2711c1f8d0a92ad50243c5fbed441f5c94b8d4d9ec28c973cd08e2cb8af1caa0`.
  - **Origem e data real:** 15/10/2026 (substituindo comentário inventado anterior).
  - **Status do Asset e Armazenamento Local:** O arquivo oficial PNG foi incorporado como asset local do projeto (`src/assets/eb985729968371dc-01d7c.png`), servido diretamente pelo bundle do Vite. Nenhuma requisição externa ou hotlink é realizada em runtime.
  - **Aplicação no Frontend:** Servido via componente dedicado `FerriFerriLogo` (`src/components/FerriFerriLogo.tsx`) no header, footer e drawer mobile sobre fundo azul-marinho escuro (`#0A1F33` / `#071624`), preservando rigorosamente a proporção original de 437:101, com `object-contain`, dimensões explícitas e texto alternativo acessível (`alt="Ferri & Ferri Advogados"`).

---

## 2. O Que É Simulado Neste Protótipo

Todo o funcionamento é executado 100% no navegador (client-side) em memória React:
- **Ausência de Backend e Banco de Dados:** Não existem chamadas `fetch`, `axios` ou conexões a APIs externas em runtime.
- **Fixtures Sintéticas (`E2E_SYNTH_`):** Todos os registros pré-carregados utilizam IDs e nomes sintéticos como `E2E_SYNTH_001`, `E2E_SYNTH_Cliente_Demo_Alpha`. Novos envios feitos no formulário recebem automaticamente o prefixo `E2E_SYNTH_`.
- **Persistência em Memória (Volátil):** Ao recarregar a página (F5 ou refresh do navegador), todos os relatos cadastrados ou status alterados são descartados e retornam ao estado inicial. Há avisos visíveis em todas as telas sobre essa volatilidade.
- **Painel Interno Sem Login:** O painel interno é acessível diretamente para avaliação da usabilidade e da máquina de estados, porém conta com banner de advertência explícito de que o ambiente é uma demonstração sem autenticação, sem dados reais e sem garantias técnicas de confidencialidade ou restrição de acesso.
- **Mural Público Desativado:** A tela do Mural é uma prévia estritamente de demonstração com exemplos ilustrativos. O interruptor de ativação bloqueia o acionamento via modal ético, impossibilitando qualquer publicação.
- **QR Code Demonstrativo 100% Local (Sem Rede):** Gerador demonstrativo integrado na tela Mural (`/mural`), alimentado pela biblioteca npm `qrcode` (v1.5.4). A geração ocorre exclusivamente no navegador do usuário via `<canvas>`, sem contato com APIs de terceiros, Google Charts ou serviços externos. A URL padrão de teste é puramente sintética (`https://e2e-synth.example.invalid/coleta`), exigindo confirmação explícita antes de gerar, e o QR é acompanhado de avisos de destino não verificado e proibição de distribuição externa.
---

## 3. Testes e Validações Executados vs. Apenas Preparados

### (a) QA Literal e Estático Realmente Executado nesta Rodada Visual:
- **Build de Produção do Vite (`vite build`):** Executado com sucesso via pipeline de QA sem erros de bundling de CSS ou assets.
- **Verificação Estática TypeScript (`tsc`):** Concluída com zero erros de tipagem estrita em todo o repositório.
- **Linter Oxlint (`oxlint src`):** Concluído com zero violações de sintaxe e padrões de código.
- **Validação de Componentes e Telas sob a Nova Identidade:**
  - `/` (Institucional): Novo topo azul-marinho escuro, logo oficial horizontal contrastante, botões com acentos dourados, seções institucionais sóbrias.
  - `/relatar`: Fluxo em 2 etapas com consentimento obrigatório e desmarcado por padrão na etapa 1, campos opcionais com limite de caracteres e validação de data não futura na etapa 2, e painel de confirmação estilizado em azul-marinho e dourado.
  - `/painel`: Filtros com contadores por status, abertura de detalhe do relato, transição na máquina de estados (`Recebido` → `Em Revisão` → `Arquivado` / `Retirada Solicitada`), inclusão de decisões humanas com timestamp e botão de restauração de fixtures.
  - `/mural`: Banner de desativação ética, cards fictícios e bloqueio interativo do toggle que mantém a publicação desativada.
  - Fuso horário explícito: Exibição consistente em `America/São Paulo (UTC-3)` e formatação brasileira de datas `DD/MM/AAAA`.

### (b) Testes de Negócio / Infraestrutura NÃO Executados nesta Rodada:
- **Testes de Integração com Banco de Dados e Backend:** Não executados, pois o projeto não possui e não deve possuir backend ou persistência externa nesta fase.
- **Testes de Autenticação Real e Sessões HTTP:** Não executados, pois o painel é protótipo sem login.
- **Testes E2E Automatizados com Navegador Headless (Playwright/Cypress):** Não executados nesta rodada visual exclusiva.

---

## 4. Pendências Declaradas de Infraestrutura e Governança

1. **Asset do Logo / Armazenamento Local:** CONCLUÍDO. O PNG oficial do logo (437x101 px) com SHA256 `2711c1f8d0a92ad50243c5fbed441f5c94b8d4d9ec28c973cd08e2cb8af1caa0` e origem oficial `https://ferriferriadv.com.br/wp-content/uploads/2026/06/Logo-FerriFerri-horizontal.png` (data real 15/10/2026) foi salvo e incorporado como asset local em `src/assets/eb985729968371dc-01d7c.png`. O componente `FerriFerriLogo` foi atualizado para renderizá-lo com proporção 437:101, sem hotlinks ou chamadas de rede externas em runtime.
2. **QR Code e URL Pública:** O gerador demonstrativo local foi entregue na seção QR da tela Mural (`/mural`). Contudo, a definição e implantação da URL real continuam pendentes de decisão expressa do responsável técnico e de aprovação dos requisitos de infraestrutura e segurança da informação. Nenhum domínio de produção foi inventado ou colocado em operação.
3. **Revisão Ética OAB Obrigatória:** Toda veiculação externa de relatos de atendimento permanece estritamente bloqueada até deliberação do responsável técnico e parecer deontológico da OAB sobre o Provimento n.º 205/2021.
4. **Segurança e Criptografia:** Em eventual transição para produção, será necessário implementar backend autenticado com 2FA, banco de dados isolado com criptografia em repouso e trilhas de auditoria imutáveis.

---

## 5. Dependência Local Adicionada para Geração do QR Code

Para viabilizar a geração do QR code estritamente local e sem dependência de serviços remotos em runtime:
- **Pacote npm:** `qrcode` (`^1.5.4`)
- **Tipagens TypeScript:** `@types/qrcode` (`^1.5.5`) em `devDependencies`
- **Modo de Operação:** Totalmente client-side (`QRCode.toCanvas`). Não realiza chamadas de rede (`fetch`, HTTP ou WebSocket), não envia dados a serviços remotos (rejeição explícita de APIs tipo Google Chart) e não utiliza armazenamento persistente (`localStorage`, `sessionStorage`, `indexedDB`).
- **Política de Validação da URL de Entrada:**
  - Limite estrito de 512 caracteres;
  - Campo começa inicialmente vazio (sem pré-definir domínio do escritório);
  - Apenas protocolo HTTPS (`https://`) aceito; rejeição estrita de esquemas `http:`, `javascript:`, `data:`, etc.;
  - Rejeição de credenciais embutidas (`user:pass@`), espaços e caracteres de controle ASCII;
  - Validação puramente sintética local via `URL` do navegador, sem fetch, navegação ou ping;
  - Exibição do texto exato codificado sem alterações, normalizações ou parâmetros adicionais;
  - Checkbox de confirmação desmarcado por padrão;
  - Edição do campo desmarca imediatamente a confirmação e descarta o QR gerado anterior;
  - Tarjas explícitas de "DEMONSTRAÇÃO", "DESTINO NÃO VERIFICADO" e "NÃO DISTRIBUIR PARA CLIENTES". Sem botão de download.

---

## 6. Auditoria de Prontidão e Limites de Segurança (Rodada Consolidada de Candidato Inativo)

Esta seção documenta com rigor auditável o estado técnico, de governança e de segurança dos módulos candidatos após a auditoria das 20:17 e a criação do snapshot candidato inativo em `docs/candidates/reports-native/`:

1. **Snapshot Candidato Inativo e Isolamento de Autodiscovery:**
   - O candidato corrigido reside exclusivamente em `docs/candidates/reports-native/reports-native-candidate.js.txt`.
   - O plano de integração está em `docs/candidates/reports-native/integration-plan.txt`.
   - A especificação da tabela de quotas está em `docs/candidates/reports-native/migration-quota.txt`.
   - Todos foram gravados com extensão `.txt` FORA das pastas `pocketbase/hooks/` e `pocketbase/migrations/` para garantir **ZERO autodiscovery** pelo runtime Goja do Skip Cloud.
   - **Nenhum hook ativo foi alterado ou removido**. A remoção do loader duplo (`pocketbase/hooks/reports.pb.js`) está documentada no plano para o momento da integração autorizada.

2. **Idempotência Canônica sem Metadados e Reconsulta Mandatória pós-UNIQUE:**
   - Aceite inicial e replay por chave repetida devolvem rigorosamente o **MESMO status HTTP (201 Created)** e o **MESMO corpo público canônico**: `{ success: true, received: true }`.
   - Removida toda flag de replay, sem `reportId`, sem estado interno e sem data/hora no corpo público.
   - **Correção Crítica pós-Catch de UNIQUE**: Erro genérico de `UNIQUE constraint` **NÃO AUTORIZA 201**. No catch, o handler só devolve o 201 canônico **DEPOIS de reconsultar o armazenamento e confirmar que existe registro com a MESMA `idempotency_key`**. Se a verificação falhar (registro não localizado ou falha de leitura I/O), devolve erro constante `{ success: false, error: 'internal_error' }` com status 500, prevenindo falsos positivos de sucesso.

3. **Tratamento de Payload Bruto e Consentimento Estrito:**
   - Extração do corpo sem fallback permissivo `|| {}`;
   - Rejeição estrita com HTTP 400 de arrays (`Array.isArray`), valores nulos (`null`/`undefined`) e primitivos não-objeto antes de acessar qualquer propriedade;
   - `consentGiven` deve ser **estritamente `true`** (rejeita booleanos `false`, ausentes e strings/números coercivos);
   - `termsVersion` deve pertencer obrigatoriamente à lista de versões aceitas pelo fluxo do frontend atual (`v1.0-2025`, `v1.0-2026`), rejeitando versões arbitrárias. A constante `ALLOWED_TERMS_VERSIONS` foi movida para dentro do callback Goja, com comentário neutro (sem alegar aprovação formal do escritório). Variável de atribuição unificada como `cleanTermsVersion` para prevenir riscos de ReferenceError.

4. **Calendário Estrito, Remoção de Fallbacks UTC-3 e Declaração de Gate de Fuso Horário (Goja / IANA):**
   - Validação de calendário gregoriano estrito (rejeita 29 de fevereiro em anos não-bissextos como 2025 e 31 de abril);
   - Rejeição de datas contendo espaços em qualquer posição (fail-closed estrito, sem trim permissivo);
   - Rejeição de datas futuras em relação ao horário corrente civil de São Paulo;
   - **Remoção Estrita dos Fallbacks Aritméticos UTC-3**: Os fallbacks aritméticos de UTC-3 (deslocamento fixo de -3h via `getTimezoneOffset`) foram totalmente removidos tanto do cálculo da data corrente de hoje quanto da formatação do timestamp de auditoria. O handler agora captura um **único instante server-side** (`requestInstant = new Date()`) no início da execução.
   - **Gate Fail-Closed de Timezone**: Se `Intl.DateTimeFormat` com fuso IANA `America/Sao_Paulo` não estiver disponível, lançar exceção ou produzir parts incompletos/inválidos, o endpoint responde sumariamente com status HTTP **503** constante `{ success: false, error: 'timezone_unavailable' }` **ANTES** de qualquer verificação de idempotência que grave ou inserção de registro.
   - **Construção por Parts Tipados**: A extração da data e do timestamp de auditoria é realizada exclusivamente via `formatToParts`, inspecionando e validando cada part tipado individualmente (`year`, `month`, `day` e `hour`, `minute`, `second`), sem pressupor formato de string de qualquer locale (como `en-CA`).
   - **Nota de Alteração Futura de Schema (ISO UTC + Rótulo BRT)**: O schema atual da coleção `reports` possui apenas a coluna `received_at_sp`. Para não violar a política de zero alterações no banco/migrations nesta fase de candidato inativo, o timestamp ISO UTC derivado do mesmo instante é registrado dentro da trilha JSON (`audit_history.timestamp_iso_utc`). Fica formalmente documentada a **necessidade de alteração de schema futura** para adicionar o campo dedicado `received_at_utc` (tipo `text` ou `autodate`) sem perda de informação essencial.
   - **Remoção de Métodos não Oficiais**: Removida qualquer dependência ou chamada fictícia de runtime como `autodate(true)`, confiando exclusivamente nas regras nativas de `autodate` do schema da coleção (`created`/`updated`).

5. **Rate Limiting Fail-Closed e Quota de Tentativas (Sem IP Bruto):**
   - Limiter opera com política estrita default-deny (fail-closed): se a checagem falhar por indisponibilidade ou erro de banco, a requisição é sumariamente negada com HTTP 429 `{ success: false, error: 'rate_limited' }`;
   - Fica documentado que a quota temporária atual conta relatos gravados e é global;
   - No candidato e na especificação `migration-quota.txt`, está projetado o algoritmo de reserva atômica por slot de janela contando **TENTATIVAS** (e não apenas sucessos);
   - **GATES CONCRETOS DE INFRAESTRUTURA**: NUNCA salvar IP bruto; NUNCA chamar hash simples sem segredo de "anonimização" (LGPD); a definição da fonte confiável de IP pelo proxy reverso (ingress), o segredo de servidor para HMAC (`$secrets.get('RATE_LIMIT_PEPPER')`) e a política de expiração são **GATES PENDENTES**. Não se inventa segredo em código.

6. **Governança de Equipe (Staff) e Regras da Coleção `users` (Vazio vs Null):**
   - **Staff AUSENTE**: Tratado estritamente como **NÃO IMPLEMENTADO** nesta fase. Não se finge que o painel possui autenticação de equipe real.
   - **Distinção Crítica de Regras de Acesso no PocketBase (`""` vs `null`):**
     - Uma regra com valor `""` (string vazia) significa **ACESSO PÚBLICO IRRESTRITO** (qualquer requisição anônima é autorizada);
     - Uma regra com valor `null` significa **ACESSO SUPERUSER/HOOKS INTERNOS APENAS** (requisições de API são sumariamente bloqueadas).
     - **AVISO DE AUDITORIA:** No arquivo `src/lib/pocketbase/schema.json`, a coleção `users` exibe `"create": ""`. NÃO se deve afirmar levianamente que criação está negada quando o JSON literal contém string vazia (`""`). Além disso, as regras `manageRule` e `authRule` do PocketBase e as credenciais de usuários reais **NÃO FORAM CONSULTADAS NEM ALTERADAS** nesta rodada, preservando estritamente a segurança e o sigilo de contas e tokens.
   - As regras da coleção `reports` permanecem 100% privadas (`listRule: null`, `viewRule: null`, `createRule: null`, `updateRule: null`, `deleteRule: null`).

7. **Testes Sintéticos: Distinção Explícita de Executados vs. Preparados:**
   - **EXECUTADOS:** O pipeline estático da plataforma (`oxlint`, `tsc`, `vite build`).
   - **PREPARADOS / NÃO EXECUTADOS EM CI AUTOMÁTICO:**
     1. Suíte TypeScript em memória de modelos conceituais (`src/lib/nativeSyntheticTestsRunner.ts`);
     2. **NOVA Suíte Direta no Código-Fonte do Candidato** (`src/lib/candidateHookSyntheticTestsRunner.ts`): Lê o arquivo físico `reports-native-candidate.js.txt`, injeta harness isolado com mocks de `routerAdd`/`e`/`e.app`/`Record` em Node.js (distinguindo explicitamente: ambiente Node.js mockado vs motor Goja vs runtime de produção) e exercita rigorosamente:
        - Gate de fuso Intl ausente -> 503 com zero insert;
        - Gate de fuso Intl lança erro -> 503 com zero insert;
        - Gate de fuso formatToParts com parts ruins/incompletos -> 503 com zero insert;
        - Fronteira UTC/BRT: instante onde é dia X em UTC mas dia X-1 em SP (rejeição de data futura em SP);
        - Rejeição estrita de date-only com espaços em qualquer posição ("2025-01-15 ", " 2025-01-15", "2025- 01-15") com 400;
        - termsVersion fora da lista -> 400; termsVersion da lista (`v1.0-2025`, `v1.0-2026`) -> 201;
        - Ausência de ReferenceError no insert (cleanTermsVersion gravado com sucesso);
        - 29/02 bissexto (2024 -> 201) vs não-bissexto (2025 -> 400) e 31/04 -> 400;
        - Payload array/null/primitivo rejeitado com 400;
        - Consent false/ausente/coercivo rejeitado com 400;
        - UNIQUE com registro confirmado -> 201 canônico; UNIQUE sem confirmação -> 500 erro constante;
        - Limiter fail-closed (IP inválido ou erro no banco) -> 429 rate_limited.

8. **Ausência de Integração e Bloqueio de Publicação / QR de Placa:**
   - **NÃO declarar integração pronta.** Nenhuma integração com serviços externos ou nuvem existe. O sistema NÃO está apto a dados reais.
   - Nenhuma publicação, deploy, configuração de DNS ou impressão/distribuição de QR code de placa está autorizada. O QR code demonstrativo da aplicação permanece restrito à visualização local sem destino público homologado.

---

## 7. Checklist Único e Objetivo do Caminho Nativo (Pós-Ativação do Backend)

> **AVISO DE GATE EXTERNO:** Este checklist descreve as etapas técnicas sequenciais que **SÓ PODEM OCORRER APÓS** a confirmação do botão "Ativar Skip Cloud" pelo Fabrício. Atualmente, o projeto permanece 100% frontend estático em memória.

### Referência Oficial da Plataforma
- **Fonte Oficial:** Documentação oficial do Skip Cloud / Skip Developer Platform (`https://docs.skip.tools/` e especificações de backend nativo).
- **Arquitetura Oficial:**
  - **Motor de Banco de Dados:** SQLite dedicado por projeto (com isolamento estrito por sandbox de processo e volume persistente dedicado; NÃO é PostgreSQL compartilhado).
  - **Runtime de Endpoints:** JavaScript/TypeScript restrito em rota nativa montada em `/backend/v1/...` (runtime seguro com Web Crypto nativo, sem Node modules arbitrários).
  - **Autenticação:** Sistema nativo de contas com e-mail/senha integrado e emissão de tokens de sessão isolados por projeto.
  - **Isolamento e Custos:** Isolamento integral por projeto (id `9d1a62e7-f60e-4585-aecf-107d6a652a9d`), sem compartilhamento de dados com ProvaSocial Médica ou terceiros, sem custos ocultos ou cobranças não contratadas.

### Checklist de Implementação Sequencial:
- [ ] **1. Confirmação do Gate Externo na UI:** Obter resposta e autorização expressa do Fabrício para pressionar o botão "Ativar Skip Cloud".
- [ ] **2. Criação das Migrations SQLite Nativas:**
  - Criar arquivos de migração SQLite em formato nativo da plataforma, substituindo o SQL PostgreSQL genérico arquivado (`schema-draft.sql`).
  - Definir tabela `reports` com tipos SQLite (`TEXT PRIMARY KEY`, `TEXT UNIQUE` para idempotency_key, `CHECK` constraints equivalentes para teto de 80/2000 chars e consentimento).
  - Definir tabelas de auditoria e deliberações com chaves estrangeiras SQLite e índices dedicados.
- [ ] **3. Regras de Acesso Reescritas para o Motor Real:**
  - Substituir policies RLS do PostgreSQL por regras de acesso nativas do runtime SQLite/Skip Cloud, com garantia de bloqueio de leitura pública.
- [ ] **4. Endpoint Real em `/backend/v1/reports`:**
  - Transpor a lógica de `serverReportEndpointDraft.ts` para o handler nativo em rota oficial `/backend/v1/reports`.
  - Conectar ao cliente de banco nativo SQLite via transação atômica (`INSERT ... ON CONFLICT DO NOTHING`).
  - Configurar rate limiting nativo baseado no identificador do cliente.
- [ ] **5. Autenticação e Prova de Staff da Equipe:**
  - Configurar autenticação nativa de e-mail/senha para operadores do Ferri & Ferri.
  - Implementar verificação de associação comprovada de staff (tabela de membros de equipe com ID interno, não mero e-mail ou `role='authenticated'`).
- [ ] **6. Bateria de Testes de Negação de Acesso Público:**
  - Executar testes automatizados verificando negação (401/403) em requisições anônimas aos endpoints de auditoria, painel e deliberações.
  - Verificar rejeição de credenciais não pertencentes à equipe.
- [ ] **7. Teste de Envio Sintético Gravado e Relido:**
  - Executar envio de relato sintético via endpoint nativo;
  - Verificar retorno com status 201 e corpo `{ success: true, received: true }`;
  - Verificar inserção única na tabela SQLite;
  - Reenviar relato com mesma chave de idempotência e validar status 201 idêntico sem duplicação de linha;
  - Efetuar releitura autenticada da linha gravada via sessão de staff.
- [ ] **8. Consulta Restrita Autenticada no Painel Interno:**
  - Conectar o painel interno (`/painel`) ao endpoint restrito `/backend/v1/reports` utilizando token de sessão de staff autenticado.
- [ ] **9. Confirmação de URL HTTPS Estável antes do QR da Placa:**
  - Homologar domínio próprio oficial do escritório com certificado SSL/HTTPS ativo.
  - Obter validação formal por escrito do Fabrício quanto à estabilidade e perenidade da URL de coleta.
  - Somente após essa confirmação expressa, gerar e liberar a arte/QR Code definitivo para impressão de placas físicas ou materiais do escritório.

---

## 8. Confirmação de Integridade

- **Nenhum dado real foi coletado ou solicitado.**
- **Nenhum serviço externo (Asaas, Stripe, IA, banco de dados ou redes) foi conectado.**
- **Nenhuma publicação ou deploy público foi realizado.**
- **Nenhuma terminologia médica ou estrutura de múltiplos clientes (multi-tenant) foi introduzida.**
- **Nenhum dado pessoal, número de processo ou CPF é coletado pelo aplicativo.**
