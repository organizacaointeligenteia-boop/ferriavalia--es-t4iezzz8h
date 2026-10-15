# Ferri & Ferri — Relatos e Experiência

Protótipo frontend estático e em memória para coleta voluntária de experiência de atendimento e organização interna de relatos, desenvolvido para um **único escritório** de advocacia.

> **AVISO IMPORTANTE:** Este projeto NÃO é um SaaS, NÃO é voltado para venda a advogados ou terceiros, NÃO contém banco de dados, autenticação, storage ou integrações com a internet. Trata-se de um protótipo demonstrativo restrito para validação de fluxos e conformidade deontológica.

---

## 1. O Que É Simulado Neste Protótipo

Todo o funcionamento é executado 100% no navegador (client-side) em memória React:
- **Ausência de Backend e Banco de Dados:** Não existem chamadas `fetch`, `axios` ou conexões a APIs externas.
- **Fixtures Sintéticas (`E2E_SYNTH_`):** Todos os registros pré-carregados utilizam IDs e nomes sintéticos como `E2E_SYNTH_001`, `E2E_SYNTH_Cliente_Demo_Alpha`. Novos envios feitos no formulário recebem automaticamente o prefixo `E2E_SYNTH_`.
- **Persistência em Memória (Volátil):** Ao recarregar a página (F5 ou refresh do navegador), todos os relatos cadastrados ou status alterados são descartados e retornam ao estado inicial. Há avisos visíveis em todas as telas sobre essa volatilidade.
- **Painel Interno Sem Login:** O painel interno é acessível diretamente para avaliação da usabilidade e da máquina de estados, porém conta com banner de advertência explícito de que o ambiente **não é seguro para dados reais**.
- **Mural Público Desativado:** A tela do Mural é uma prévia estritamente privada com exemplos ilustrativos. O interruptor de ativação bloqueia o acionamento via modal ético, impossibilitando qualquer publicação.
- **QR Code e URL Pública Pendentes:** Não foi inventado domínio público e o QR code está marcado como não operacional até decisão formal e confirmação de domínio homologado.

---

## 2. Testes e Validações Executados vs. Apenas Preparados

### Realmente Executados nesta Entrega:
- **Build de Produção do Vite:** Executado com sucesso via pipeline de QA sem erros de compilação de assets.
- **Verificação Estática TypeScript (`tsc`):** Concluída com zero erros de tipagem estrita.
- **Linter Oxlint:** Concluído com zero violações de sintaxe e regras de código.
- **Validação de Rotas e Telas:**
  - `/` (Institucional): Renderização de todas as seções (Hero, Sobre, Ética OAB, Como Participar em 3 passos anti-sigilo, Privacidade e Contato marcado como DEMO).
  - `/relatar`: Fluxo em 2 etapas com consentimento obrigatório e desmarcado por padrão na etapa 1, campos opcionais com limite de caracteres e validação de data não futura na etapa 2, e painel de sucesso com ID sintético gerado.
  - `/painel`: Filtros com contadores por status, abertura de detalhe do relato, transição na máquina de estados (`Recebido` → `Em Revisão` → `Arquivado` / `Retirada Solicitada`), inclusão de decisões humanas com timestamp e botão de restauração de fixtures.
  - `/mural`: Banner de desativação ética, cards fictícios e bloqueio interativo do toggle que mantém a publicação desativada.
  - Fuso horário explícito: Exibição consistente em `America/São Paulo (UTC-3)` e formatação brasileira de datas `DD/MM/AAAA`.

### Apenas Preparados (Não Executados por Escopo e Ausência de Backend):
- **Testes de Integração com Banco de Dados:** Não executados, pois o projeto não possui e não deve possuir backend ou banco nesta fase.
- **Testes de Autenticação Real e Sessões HTTP:** Não executados, pois não há camada de autenticação real implementada.
- **Testes de Conectividade de Rede / Testes E2E Automatizados com Navegador Headless (Playwright/Cypress):** Apenas o fluxo manual e tipos foram validados nesta fase de prototipagem rápida.

---

## 3. Pendências Futuras de Infraestrutura (Caso o Escritório Decida Avançar)

Se em momento futuro o escritório deliberar pela implementação de uma versão de produção em ambiente fechado, as seguintes pendências técnicas precisarão ser implementadas separadamente:
1. **Banco de Dados Relacional Próprio:** Criação de schemas isolados com criptografia em repouso e políticas rigorosas de retenção e expurgo.
2. **Camada de Autenticação e Perfis de Acesso (RBAC):**
   - Perfil de Responsável / Sócio (deliberação ética, arquivamento e autorização).
   - Perfil de Triagem Interna (leitura e marcação de revisão).
   - Autenticação de dois fatores (2FA) e expiração forçada de sessão.
3. **Storage Seguro:** Armazenamento restrito para logs de auditoria e auditoria de decisões humanas.
4. **Trilhas de Auditoria Imutáveis:** Registro criptográfico de quando um consentimento foi prestado e quando um pedido de retirada foi solicitado.

---

## 4. Segurança, Perfis, Retenção, Retirada e Aviso de Privacidade

- **Proteção do Sigilo Profissional:** O formulário orienta expressamente: *"Não insira fatos do caso, nomes de terceiros ou informações sigilosas."* Nenhum documento processual, número de processo ou CPF é coletado.
- **Coleta Privada ≠ Não Anônima:** O sistema adota uma postura transparente. A coleta não promete anonimato absoluto aos clientes, mas garante confidencialidade interna estrita.
- **Direito à Retirada a Qualquer Tempo:** O constituinte possui o direito irrevogável de solicitar a retirada de sua manifestação. O painel prevê o status `Retirada Solicitada` para atendimento imediato.
- **Aviso Deontológico OAB:** O formulário e as telas deixam claro que o envio voluntário jamais condiciona ou interfere no atendimento jurídico prestado pelo escritório.

---

## 5. Revisão Ética OAB Obrigatória Antes de Qualquer Piloto

A publicidade na advocacia é restrita pelas diretrizes do Código de Ética e Disciplina da OAB e pelo Provimento n.º 205/2021 do Conselho Federal da OAB:
- **Autorização do Cliente Não Basta:** A concordância do cliente em avaliar o atendimento interno não autoriza a veiculação externa da manifestação como propaganda ou captação de clientela.
- **Vedação de Promessas de Resultado e Captação Mercantil:** É vedada a menção a causas ganhas, valores, comparações de capacidade técnica ou expressões persuasivas de induzimento.
- **Homologação Prévia:** Antes de qualquer disponibilização mesmo em ambiente piloto com clientes reais, é mandatória a apreciação formal da comissão de ética ou do responsável técnico do escritório Ferri & Ferri.

---

## 6. Confirmação de Integridade

- **Nenhum dado real foi coletado ou solicitado.**
- **Nenhum serviço externo (Asaas, Stripe, IA, banco de dados ou redes) foi conectado.**
- **Nenhuma publicação ou deploy público foi realizado.**
- **Nenhuma terminologia médica ou estrutura de múltiplos clientes (multi-tenant) foi introduzida.**
