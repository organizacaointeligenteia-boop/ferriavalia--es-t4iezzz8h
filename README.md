# Ferri & Ferri — Relatos e Experiência

Protótipo frontend estático e em memória para coleta voluntária de experiência de atendimento e organização interna de relatos, desenvolvido para um **único escritório** de advocacia (**Ferri & Ferri Advogados**).

> **AVISO IMPORTANTE:** Este projeto NÃO é um SaaS, NÃO é voltado para venda a advogados ou terceiros, NÃO contém banco de dados, autenticação, storage ou integrações com a internet. Trata-se de um protótipo demonstrativo restrito para validação de fluxos e conformidade deontológica. **NÃO está pronto para dados reais.**

---

## 1. Identidade Visual Oficial e Asset do Logo

Nesta rodada de identidade visual, a interface foi completamente alinhada à identidade visual do escritório **Ferri & Ferri Advogados**, extraída diretamente de seu site oficial ([https://ferriferriadv.com.br/](https://ferriferriadv.com.br/)):

- **Paleta Oficial Aplicada:**
  - **Azul-Marinho Bem Escuro** (`#0A1F33` / `#071624` / `#132E4A`): Utilizado como cor primária no topo/header, botões de ação principal, footer e cartões de destaque.
  - **Acentos Dourados** (`#C9A227` / `#E5C048` / `#A68218`): Utilizados em ícones, bordas selecionadas, destaques, rótulos e elementos de contraste.
  - **Fundos Claros Neutros** (`#F8FAFC` / `#FFFFFF`): Fundos elegantes e sóbrios para leitura e preenchimento de formulários.
  - **Remoção Total de Verdes:** Toda a paleta verde genérica da primeira versão foi substituída, garantindo contraste AA e sobriedade jurídica.

- **Asset Oficial do Logo e Tratamento de Rede:**
  - **Origem exata:** `https://ferriferriadv.com.br/wp-content/uploads/2026/06/Logo-FerriFerri-horizontal.png` (observado diretamente no DOM do cabeçalho do WordPress oficial).
  - **Dimensões nativas:** 437 × 101 px (horizontal, tipografia branca sobre fundo escuro).
  - **Data da tentativa de download / verificação:** Fevereiro/2025.
  - **Status do Asset e Regra de Contingência:** Na rodada v0.0.2, o componente realizava chamada remota direta em runtime, violando o princípio de zero chamadas de rede externas. O ambiente de execução frontend-only isolado não dispõe de ferramentas de download de binários (.png). Em estrita conformidade com a instrução do projeto (*"Se o download do arquivo falhar na sua execução, NÃO fabricar logo: mantenha o fallback tipográfico 'Ferri & Ferri' e declare a pendência claramente no README e no seu relatório"*), a URL externa em runtime foi inteiramente removida e o componente passou a exibir o fallback tipográfico homologado `"FERRI & FERRI ADVOGADOS"`.
  - **Aplicação no Frontend:** Servido via componente dedicado `FerriFerriLogo` (`src/components/FerriFerriLogo.tsx`) sobre fundo azul-marinho escuro (`#0A1F33`), preservando proporção original estrita sem distorção (`aspectRatio: 437/101`), acessibilidade (`aria-label="Ferri & Ferri Advogados"` e `role="img"`), com zero requisições externas em runtime.

---

## 2. O Que É Simulado Neste Protótipo

Todo o funcionamento é executado 100% no navegador (client-side) em memória React:
- **Ausência de Backend e Banco de Dados:** Não existem chamadas `fetch`, `axios` ou conexões a APIs externas em runtime.
- **Fixtures Sintéticas (`E2E_SYNTH_`):** Todos os registros pré-carregados utilizam IDs e nomes sintéticos como `E2E_SYNTH_001`, `E2E_SYNTH_Cliente_Demo_Alpha`. Novos envios feitos no formulário recebem automaticamente o prefixo `E2E_SYNTH_`.
- **Persistência em Memória (Volátil):** Ao recarregar a página (F5 ou refresh do navegador), todos os relatos cadastrados ou status alterados são descartados e retornam ao estado inicial. Há avisos visíveis em todas as telas sobre essa volatilidade.
- **Painel Interno Sem Login:** O painel interno é acessível diretamente para avaliação da usabilidade e da máquina de estados, porém conta com banner de advertência explícito de que o ambiente **não é seguro para dados reais nem informações confidenciais**.
- **Mural Público Desativado:** A tela do Mural é uma prévia estritamente privada com exemplos ilustrativos. O interruptor de ativação bloqueia o acionamento via modal ético, impossibilitando qualquer publicação.
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

1. **Asset do Logo / Armazenamento Local:** Conforme diretriz estrita, nenhuma URL externa é requisitada em runtime. A origem oficial é `https://ferriferriadv.com.br/wp-content/uploads/2026/06/Logo-FerriFerri-horizontal.png` (verificada em Fevereiro/2025). Como o ambiente de compilação isolado não possui utilitário de download de binário para salvar o arquivo `.png` localmente em `public/` ou `src/assets/`, o sistema opera em conformidade via fallback tipográfico homologado `"FERRI & FERRI ADVOGADOS"`. Para substituir pelo arquivo gráfico real em momento posterior, basta copiar o arquivo `Logo-FerriFerri-horizontal.png` diretamente para a pasta `public/` ou `src/assets/` do repositório sem modificar outras partes do código.
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
