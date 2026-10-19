# Ferri & Ferri — Mural de Relatos e Experiência

Aplicação web e mural público de avaliações e relatos de clientes para o escritório **Ferri & Ferri Advogados**, com possibilidade de embutir via iframe diretamente no site oficial do escritório ([https://ferriferriadv.com.br/](https://ferriferriadv.com.br/)).

---

## 1. Novo Produto — Pivot de Simplificação Radical

Conforme alinhamento e respostas de decisão do usuário:
1. **Mural Público e Embutível:** Exibe exclusivamente os relatos aprovados pela equipe.
2. **Coleta Simples e Voluntária:**
   - Botão **"Deixe seu relato"** que abre modal para a pessoa escolher **ESCREVER** (texto curto) ou **FILMAR** (gravação direta pelo navegador via API padrão `MediaRecorder`, sem upload de arquivo externo).
   - Nome opcional (pode ser "Anônimo").
   - Checkbox de consentimento obrigatório, **nunca pré-marcado**.
   - Frase curta de privacidade: *"seu relato pode ser removido a qualquer tempo mediante solicitação"*.
3. **Fluxo com Gate de Aprovação:**
   - Todo relato enviado entra com status `pendente` e **NUNCA** aparece no mural de imediato.
   - Apenas após aprovação manual da equipe o relato passa a ser exibido no mural.
4. **Painel da Equipe (`/painel`):**
   - Login por e-mail e senha de conta criada manualmente pelo usuário no painel do Skip Cloud (sem criação de contas ou credenciais por código).
   - Operações diretas: **Aprovar para o Mural**, **Ocultar** ou **Excluir**.

---

## 2. Snippet de Embed por `<iframe>` para o Site do Escritório

Para embutir o Mural de Avaliações diretamente dentro de qualquer página do site WordPress ou institucional do escritório Ferri & Ferri Advogados, utilize o código HTML responsivo abaixo:

```html
<!-- Ferri & Ferri — Snippet de Embed do Mural de Avaliações -->
<div style="width: 100%; max-width: 1100px; margin: 0 auto; overflow: hidden; border-radius: 12px; box-shadow: 0 4px 20px rgba(10, 31, 51, 0.08);">
  <iframe
    src="https://ferri-ferri-relatos-e-experiencia-dbf86.shrd01.internal.goskip.dev"
    title="Mural de Avaliações — Ferri & Ferri Advogados"
    width="100%"
    height="750"
    style="border: none; width: 100%; min-height: 700px; display: block;"
    loading="lazy"
    allow="camera; microphone; autoplay; encrypted-media"
  ></iframe>
</div>
```

> **Nota sobre permissões:** O atributo `allow="camera; microphone;"` é necessário para permitir que o cliente consiga gravar vídeo diretamente pelo navegador caso opte pela opção "Filmar".

---

## 3. Regras de Acesso (RLS) — Gate Obrigatório (Literais Propostas)

As regras de acesso abaixo estão **preparadas e listadas literalmente** para apreciação prévia do usuário. Conforme instrução expressa, **elas NÃO foram aplicadas automaticamente nesta rodada**, aguardando aprovação explícita antes de qualquer exposição ou abertura de permissão:

### Coleção `reports`:
- **`listRule` (Listagem pública):**
  ```text
  status_novo = 'aprovado'
  ```
  *(Significado: Apenas registros com status explicitamente aprovado podem ser lidos pelo público/mural. Registros pendentes ou ocultos são 100% invisíveis).*

- **`viewRule` (Visualização pública individual):**
  ```text
  status_novo = 'aprovado'
  ```
  *(Significado: Ninguém de fora consegue acessar um relato pendente ou oculto nem conhecendo o ID).*

- **`createRule` (Criação pública):**
  ```text
  @request.body.status_novo:changed = false || @request.body.status_novo = 'pendente'
  ```
  *(Significado: O público anônimo pode submeter relatos, mas é terminantemente proibido de definir qualquer status diferente de 'pendente').*

- **`updateRule` (Modificação/Moderação):**
  ```text
  @request.auth.id != '' && @request.auth.collectionName = 'users'
  ```
  *(Significado: Apenas membros autenticados da equipe logados via `/painel` podem alterar o status entre pendente, aprovado e oculto).*

- **`deleteRule` (Exclusão definitiva):**
  ```text
  @request.auth.id != '' && @request.auth.collectionName = 'users'
  ```
  *(Significado: Apenas membros autenticados da equipe podem excluir registros).*

---

## 4. Backend e Migrations Criadas

- **`0001_create_reports.js` (aplicada anteriormente):** Estrutura inicial preservada no histórico.
- **`0002_pivot_mural_reports.js` (criada nesta rodada):**
  - Adiciona o campo `tipo` (select: `texto`, `video`);
  - Adiciona o campo `author` (text, opcional, máx 80);
  - Adiciona o campo `texto` (text, opcional para permitir vídeo, máx 2000);
  - Adiciona o campo `video_file` (file, máx 50MB, mime types de vídeo para a gravação local);
  - Adiciona o campo `consentimento` (bool);
  - Adiciona o campo `status_novo` (select: `pendente`, `aprovado`, `oculto`);
  - Cria índice `idx_reports_status_novo_created` para listagem otimizada por status e data;
  - Preserva compatibilidade e histórico do banco.
- **Remoção do Loader Duplo em `pocketbase/hooks/`:**
  - O arquivo duplicado `pocketbase/hooks/reports.pb.js` foi removido;
  - Mantido **UM ÚNICO** arquivo em `pocketbase/hooks/reports.js` para evitar colisão de rotas no autodiscovery da VM Goja.

---

## 5. Suíte Sintética de Testes de Regra de Negócio

Arquivo: `src/lib/pivotSyntheticTestsRunner.ts`

> **RÓTULO OBRIGATÓRIO: [MOCK ≠ RUNTIME REAL]**
> Esta suíte foi **preparada e validada estaticamente** com simulação em memória. Nenhum teste persistente ou gravação real foi executado no Skip Cloud nesta rodada.

Cenários cobertos pela suíte:
1. **TC_01:** Envio de texto pendente **não** aparece no mural público.
2. **TC_02:** Aprovação do relato pelo painel faz com que ele apareça no mural público.
3. **TC_03:** Gravação de vídeo no navegador é aceita com consentimento e exibida no mural após aprovação.
4. **TC_04:** Ocultação do relato pelo painel remove-o do mural mantendo-o no painel.
5. **TC_05:** Exclusão do relato pelo painel remove-o definitivamente de todas as visualizações.

---

## 6. Gates Restantes para Entrada em Produção

1. **Gate 1 — Aprovação das Regras de Acesso:** Confirmação explícita do usuário sobre as regras literais listadas na Seção 3.
2. **Gate 2 — Aplicação da Migration e Regras:** Execução da migração `0002_pivot_mural_reports.js` e deploy no Skip Cloud.
3. **Gate 3 — Criação Manual da Conta da Equipe:** O usuário Fabrício cria manualmente o usuário e senha da equipe no painel do Skip Cloud (Aba *Collections > users*).
4. **Gate 4 — Teste Sintético no Runtime:** Envio e aprovação de 1 relato de teste no ambiente real.
5. **Gate 5 — URL Definitiva e Homologação do Embed:** Liberação do código iframe para inserção no site oficial.
