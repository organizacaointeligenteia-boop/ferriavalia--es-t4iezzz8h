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

## 6. Auditoria de Prontidão e Limites de Segurança (Consolidação das 4 Correções Internas)

Esta seção documenta o estado estrito de prontidão técnica, de governança e de segurança dos módulos candidatos após a rodada consolidada de correções internas:

1. **Idempotência Canônica sem Metadados:**
   - Aceite inicial e replay por chave repetida devolvem rigorosamente o **MESMO status HTTP (201 Created)** e o **MESMO corpo público canônico**: `{ success: true, received: true }`.
   - Removida toda flag de replay (`idempotencyStatus: 'IDEMPOTENT_REPLAY'`), sem `reportId`, sem estado interno e sem `receivedAt`/data no corpo público.
   - Tratamento seguro de colisão atômica concorrente (ex.: violação de constraint única em inserção paralela com a mesma chave) devolvendo o mesmo corpo canônico idêntico, prevenindo vazamento de temporização e de metadados.

2. **Rate Limiter com Default-Deny Efetivo e Erro Constante:**
   - Limiter AUSENTE (`null`/`undefined`), que LANÇA exceção ou que retorna valor MALFORMADO (objeto inválido, sem campo boolean `allowed` ou `allowed !== true`) é sumariamente **NEGADO ANTES de qualquer escrita/insert no banco**.
   - Erro público **CONSTANTE** (`{ success: false, error: 'rate_limited' }`, status 429), sem expor `reason`, contadores ou qualquer detalhe interno de infraestrutura.

3. **Gate de Equipe (Staff) com Identidade Comprovada Não-Vazia:**
   - Verificador de equipe com default-deny estrito: nega exceções (fail-closed) e retornos malformados com erro constante `access_denied`.
   - **Exigência mandatória de identidade comprovada NÃO-VAZIA**: `"authenticated"` genérico, strings em branco e meros domínios de e-mail (ex.: `@ferriferriadv.com.br`) ou endereços de e-mail puros **NÃO BASTAM** e são sumariamente recusados como prova de staff. Exige identificador de membro auditável.

4. **UUID Validado Idêntico ao Persistido e Rejeição de Espaços:**
   - O valor UUID validado pelo validador RFC 4122 v4 é **EXATAMENTE o mesmo persistido no insert** (garantia de variável única validada, sem recriação ou substituição posterior).
   - Rejeição estrita de qualquer espaço: se contiver espaço em qualquer posição (início, meio ou fim), o valor é **INVÁLIDO** (sem trim permissivo seguido de persistência de valor não-sanitizado).
   - Preservação da política **fail-closed** quando a Web Crypto API estiver indisponível (lança erro explícito, zero fallback constante).

5. **SQL PostgreSQL Genérico Arquivado (NÃO APLICÁVEL ao Motor Real):**
   - Os arquivos SQL legados (`schema-draft.sql` e `security-rules-draft.sql`) representam SQL PostgreSQL genérico arquivado **NÃO COMPATÍVEL / NÃO APLICÁVEL** ao motor real da plataforma Skip Cloud (que adota SQLite dedicado por projeto).
   - **Nenhum novo SQL PostgreSQL genérico foi gerado**. Nenhuma migração ou função de banco foi criada ou aplicada.

6. **Adapter e Endpoint Continuam Mocks Puros em Memória:**
   - O endpoint e a camada de persistência utilizam a interface em memória `MockDatabaseClient` (`src/lib/serverReportEndpointDraft.ts`), sem qualquer conexão a bancos reais, sem SDK de banco, sem Supabase e sem Skip Cloud.

7. **Testes Sintéticos: Distinção Explícita de Executados vs. Preparados:**
   - **EXECUTADOS:** Apenas o pipeline estático da plataforma (`oxlint`, `tsc`, `vite build`).
   - **PREPARADOS / NÃO EXECUTADOS:** A suíte de testes sintéticos unitários em memória (`src/lib/syntheticTestsRunner.ts`), disponibilizada integralmente em código auditável e independente de rede, cobrindo todos os caminhos das 4 correções.

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
