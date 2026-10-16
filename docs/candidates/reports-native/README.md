# Documentação de Candidatos Nativos — Submissão de Relatos

Projeto: **Ferri & Ferri — Relatos e Experiência**  
ID do Projeto: `9d1a62e7-f60e-4585-aecf-107d6a652a9d`  
Data de referência: 15/10/2026  
Status: **CANDIDATO INATIVO (fora de autodiscovery / sem deploy nesta rodada)**

---

## 1. Contexto e Motivação do Adapter Nativo de Tempo

O candidato atual (`docs/candidates/reports-native/reports-native-candidate.js.txt`) utiliza `Intl.DateTimeFormat` com fuso IANA `America/Sao_Paulo`. No entanto, o motor Goja do PocketBase não tem suporte garantido ou completo a fusos arbitrários via `Intl` sem compilação específica no binário Go hospedeiro, o que mantém o gate de fuso ativado e aciona respostas `503 timezone_unavailable` (fail-closed).

Para destravar com segurança este gate no futuro **sem recorrer a aproximações aritméticas frágeis** (como subtrair 3 horas ou fixar `UTC-3`), foi pesquisada a API nativa da JSVM do PocketBase exposta a partir do runtime Go.

---

## 2. Diagnóstico das Fontes Oficiais do PocketBase JSVM

Fontes pesquisadas:
1. `https://pocketbase.io/jsvm/classes/DateTime.html`
2. `https://pocketbase.io/jsvm/classes/Timezone.html`
3. `https://pocketbase.io/jsvm/interfaces/time.Time.html`
4. `https://pocketbase.io/jsvm/interfaces/time.Location.html`
5. Discussões e Changelog oficiais do repositório `pocketbase/pocketbase` (PRs #6219, #6688, CHANGELOG v0.25.0).

### Lista de Confirmação por Fonte vs. NÃO CONFIRMADO

| Elemento / API | Situação nas Fontes | Notas e Versão do Host |
|---|---|---|
| Construtor `new DateTime()` | **CONFIRMADO POR FONTE** | Presente na JSVM desde v0.16+. Construtor sem parâmetros cria o instante corrente UTC. |
| Método `DateTime.time()` | **CONFIRMADO POR FONTE** | Retorna a interface subjacente do tipo `time.Time` do Go. |
| Construtor global `new Timezone(name)` | **CONFIRMADO POR FONTE** | Adicionado no PocketBase **v0.25.0** (Issue #6219). Mapeia para o Go `time.LoadLocation(name)`. |
| Comportamento de fallback silencioso `UTC` do `Timezone(name)` | **CONFIRMADO POR FONTE** | A documentação oficial explicita: *"If the name is '', invalid or 'UTC', returns UTC."* Este é o **risco central** neutralizado pelo adapter. |
| Namespace `$timezone.newTimezone()` | **NÃO CONFIRMADO** | A sintaxe da documentação oficial e do types.go do PocketBase é o construtor global `new Timezone(name)` e não um namespace `$timezone`. |
| Método `Time.in(loc)` | **CONFIRMADO POR FONTE** | Converte a interpretação visual/calendárica do instante para a `Location` fornecida. |
| Método `Time.format(layout)` | **CONFIRMADO POR FONTE** | Formata usando a data de referência canônica do Go (`2006-01-02 15:04:05`). |
| Métodos `Time.location()` e `Location.string()` | **CONFIRMADO POR FONTE** | Retornam o objeto `Location` e o nome descritivo do fuso registrado (ex.: `'America/Sao_Paulo'`). |
| Disponibilidade das tabelas de zona IANA no Skip Cloud específico | **NÃO CONFIRMADO NO RUNTIME ATIVO** | A disponibilidade dos dados do tzdata no host do Skip Cloud (PocketBase v0.36) só é atestada se o binário foi compilado com `time/tzdata` embutido ou se o contêiner possui `/usr/share/zoneinfo`. Como nenhuma execução de runtime/Goja ocorreu nesta rodada, permanece **NÃO CONFIRMADO**. |

---

## 3. Arquitetura do Adapter (`native-time-adapter.js.txt`)

O arquivo foi criado em `docs/candidates/reports-native/native-time-adapter.js.txt` (.js.txt para não ser autodescoberto nem executado pelo PocketBase).

### Princípios Rigorosos Implementados:
1. **Captura de UM ÚNICO `DateTime` de agora:**
   Um único instante é instanciado no início e compartilhado para a data civil "hoje" (`AAAA-MM-DD`), a formatação de auditoria legível (`DD/MM/AAAA às HH:mm:ss (America/Sao_Paulo)`) e o ISO UTC (`receivedAtIsoUtc`).
2. **Neutralização do Risco Central do PocketBase:**
   Quando `new Timezone('America/Sao_Paulo')` é executado, se o nome for desconhecido ou a base IANA estiver ausente no host, o PocketBase retorna silenciosamente `UTC`.
   O adapter verifica estritamente se `loc.string() === 'America/Sao_Paulo'` e se `goTimeSp.location().string() === 'America/Sao_Paulo'`. Se for qualquer outro valor (incluindo `'UTC'`), o adapter rejeita sumariamente com status 503 e erro `timezone_unavailable`.
3. **Sem Aritmética Nem Offset Fixo:**
   Nenhum cálculo de `-3h` ou `UTC-3` é realizado. As regras de transição histórica (como horário de verão em 2018 ou datas civis) são delegadas ao motor de timezone nativo.
4. **Validação Estrita de Calendário nas Saídas:**
   O date-only de saída passa por validação regex, checagem de intervalo gregoriano (1900-2100) e contagem exata de dias de cada mês incluindo bissextos gregorianos.

---

## 4. Como o Adapter se Conectaria ao Candidato Atual (Sem Integrar)

**IMPORTANTE:** Nesta rodada, o candidato atual (`reports-native-candidate.js.txt`) **NÃO FOI ALTERADO NEM INTEGRADO**.

Quando houver autorização expressa para a substituição:

1. **Localização do ponto de injeção:**
   No arquivo `reports-native-candidate.js.txt`, a Seção 1 (linhas 55 a 235) que hoje tenta resolver `Intl.DateTimeFormat` e extrair parts tipados seria substituída pela chamada da função do adapter:
   ```javascript
   // Resolução nativa de fuso e data civil via PocketBase JSVM
   var timeResult = resolveNativeTime();
   if (!timeResult || !timeResult.success) {
     return e.json(503, {
       success: false,
       error: 'timezone_unavailable'
     });
   }

   var todaySpString = timeResult.todayDateSp;
   var formattedReceivedAtSp = timeResult.formattedReceivedAtSp;
   var receivedAtIsoUtc = timeResult.receivedAtIsoUtc;
   ```

2. **Benefício da conexão:**
   O restante do fluxo do hook (rate limiting atômico, validação de payload, higienização estrita, teste de data futura, idempotência canônica com status 201 e tratamento seguro de conflito unique) permanece 100% inalterado e compatível, pois o contrato de saída do adapter provê exatamente as mesmas 3 variáveis que a seção de `Intl` provia.

---

## 5. Suíte de Testes Mock Preparada

Em `src/lib/nativeTimeAdapterMockTests.ts`, foi implementada a suíte mock rotulada:
> **Node.js + in-memory mock harness ≠ Goja VM ≠ Runtime Real do PocketBase / Skip Cloud**

Esta suíte avalia diretamente o código-fonte cru do `.js.txt` via mock de injeção global e exercita os cenários:
- Conversão de horário civil normal UTC/BRT em 2026;
- Virada de dia civil entre UTC e São Paulo;
- Instante histórico em 2018 com horário de verão (UTC-2);
- Falha por binding ausente (`DateTime` ou `Timezone` inexistentes);
- **Detecção e rejeição do risco central (fallback UTC silencioso)**;
- Exceção durante `Time.format()` ou criação de `Timezone`;
- Reuso estrito do mesmo `DateTime` de agora em todas as saídas.
