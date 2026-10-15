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

## 6. Auditoria de Prontidão e Limites de Segurança (v0.0.8 / Microcorreção Inativa)

Esta seção documenta o estado estrito de prontidão técnica, de governança e de segurança apurado na auditoria:

1. **SQL PostgreSQL Genérico Não Confirmado e Não Aplicável:**
   - O arquivo `security-rules-draft.sql` (assim como `schema-draft.sql`) é SQL PostgreSQL genérico **NÃO CONFIRMADO** como compatível com Skip Cloud e **NÃO APLICÁVEL / NÃO ATIVAR** até que o motor de banco de dados e os papéis/roles reais sejam formalmente comprovados.
   - **NADA FOI PROVISIONADO, ATIVADO OU APLICADO**: não há banco provisionado, nem migração executada, nem conexão aberta.

2. **Limites do Motor de Banco de Dados (BYPASSRLS / Owner / Service Role):**
   - Políticas de RLS em PostgreSQL padrão **NÃO BLOQUEIAM** superusuários de banco, o proprietário da tabela (*table owner*) ou conexões com atributo `BYPASSRLS` / conexões administrativas de serviço (*service_role*).
   - O rascunho de segurança **NÃO promete nem garante** bloqueio a esses níveis administrativos. Esses limites devem ser verificados e isolados na configuração do cluster e do provedor quando e se houver infraestrutura homologada.

3. **Equipe Ainda Sem Acesso Implementado / `auth.role()` NÃO é Verificação de Staff:**
   - A cláusula candidata anterior `auth.role() = 'authenticated'` autorizaria indistintamente **qualquer usuário autenticado**, não comprovando pertinência à equipe do escritório.
   - Como não há mecanismo de equipe comprovado (claims JWT assinados, catálogo interno de operadores ou RBAC), **todas as policies de leitura, inserção, atualização e exclusão foram configuradas como FAIL-CLOSED (`USING (FALSE)` / `WITH CHECK (FALSE)`)**.
   - Nenhuma policy permissiva residual foi mantida, eliminando brechas decorrentes do operador lógico `OR` que o PostgreSQL emprega entre múltiplas políticas permissivas.

4. **Rate-Limit NÃO Implementado no Endpoint:**
   - O controle de taxa (*rate-limit*) **NÃO ESTÁ IMPLEMENTADO** em runtime. Existe unicamente como comentário arquitetural descritivo no arquivo de rascunho `src/lib/serverReportEndpointDraft.ts`.

5. **Adapter e Endpoint São Mocks Puros:**
   - O endpoint e a camada de persistência demonstrativa utilizam a classe em memória `MockDatabaseClient` (`src/lib/serverReportEndpointDraft.ts`), sem qualquer conexão a bancos reais ou drivers de rede.

6. **Idempotência Atual Expõe Metadados a Chaves Reutilizadas:**
   - A implementação atual de validação de duplicidade na classe `MockDatabaseClient` retorna os metadados do relato já existente (`reportId`, `status`, `receivedAt`) a qualquer cliente que submeta a mesma `idempotency_key`.
   - Essa abordagem **EXPÕE** dados a quem reusa uma chave alheia e está **PENDENTE DE BLINDAGEM** antes de qualquer uso produtivo.

7. **21 Testes Sintéticos Preparados e NÃO Executados:**
   - Os 21 casos de teste sintéticos estruturados no módulo `src/lib/syntheticTestsRunner.ts` foram **PREPARADOS** para aferição da lógica de validação em memória, mas **NÃO FORAM EXECUTADOS** nesta rodada de microcorreção inativa.
   - **Nenhum teste foi executado contra banco de dados real.**

8. **Ausência de Integração e Bloqueio de Publicação / QR de Placa:**
   - **NÃO declarar integração pronta.** Nenhuma integração com serviços externos ou nuvem existe.
   - Nenhuma publicação, deploy, configuração de DNS ou impressão/distribuição de QR code de placa está autorizada. O QR code demonstrativo da aplicação permanece restrito à visualização local sem destino público homologado.

---

## 7. Próximos Passos Seguros (Planejamento da Próxima Rodada — NÃO Implementado Nesta Rodada)

Para futura rodada que venha a tratar da camada de backend e resiliência (sujeita a prévia autorização e sem código novo adicionado nesta rodada):

1. **Blindagem de Idempotência contra Vazamento de Metadados:**
   - Reformular a resposta de chave duplicada para que ela **NÃO revele** metadados de relato (`reportId`, status ou data de recepção) a quem submeter uma chave preexistente pertencente a outro remetente.
   - Avaliar emissão de resposta canônica neutra de aceitação sem eco de detalhes internos, ou vinculação criptográfica da chave de idempotência ao remetente/sessão legítima.

2. **Rate Limiter Injetado com Default-Deny:**
   - Especificar componente de controle de taxa (*rate limiter*) desacoplado, com mecanismo de bloqueio preventivo (*default-deny*), permitindo configuração de teto de requisições por janela temporal antes do processamento de carga.
   - Operar via gate configurável em memória para testes sintéticos, sem dependência de serviços externos de rede nesta fase.

---

## 8. Confirmação de Integridade

- **Nenhum dado real foi coletado ou solicitado.**
- **Nenhum serviço externo (Asaas, Stripe, IA, banco de dados ou redes) foi conectado.**
- **Nenhuma publicação ou deploy público foi realizado.**
- **Nenhuma terminologia médica ou estrutura de múltiplos clientes (multi-tenant) foi introduzida.**
- **Nenhum dado pessoal, número de processo ou CPF é coletado pelo aplicativo.**
