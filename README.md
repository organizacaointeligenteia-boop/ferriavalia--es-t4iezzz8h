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
- **QR Code e URL Pública Pendentes:** Não foi inventado domínio público e o QR code está marcado como não operacional até decisão formal e confirmação de domínio homologado.

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
2. **QR Code e URL Pública:** Pendente de homologação de domínio próprio pelo escritório. Nenhum domínio falso foi introduzido.
3. **Revisão Ética OAB Obrigatória:** Toda veiculação externa de relatos de atendimento permanece estritamente bloqueada até deliberação do responsável técnico e parecer deontológico da OAB sobre o Provimento n.º 205/2021.
4. **Segurança e Criptografia:** Em eventual transição para produção, será necessário implementar backend autenticado com 2FA, banco de dados isolado com criptografia em repouso e trilhas de auditoria imutáveis.

---

## 5. Confirmação de Integridade

- **Nenhum dado real foi coletado ou solicitado.**
- **Nenhum serviço externo (Asaas, Stripe, IA, banco de dados ou redes) foi conectado.**
- **Nenhuma publicação ou deploy público foi realizado.**
- **Nenhuma terminologia médica ou estrutura de múltiplos clientes (multi-tenant) foi introduzida.**
- **Nenhum dado pessoal, número de processo ou CPF é coletado pelo aplicativo.**
