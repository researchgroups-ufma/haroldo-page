# Plano 028 — Notificação de falha de build ao ADMIN, demonstrada com uma falha real

**Status:** TODO
**RFs cobertos:** **F-02**, **F-09**, RNF-04, R-01; fluxo E da §8.1; fase 2, **item 4** do §12 (era o item 6 até 2026-09-12, quando três itens da fase
migraram para a fase 5)
**Depende de:** planos **025** (Workers Builds no ar) e **030** (o portão de conteúdo é o que
produz a mensagem legível que este plano demonstra)
**Emendado em 2026-09-12** pelo stakeholder: a Cloudflare não oferece notificação de falha do
Workers Builds, e o canal passa a ser um **vigia agendado no GitHub Actions**. Ver "A emenda de
2026-09-12".
**Modelo recomendado:** — (execução do orquestrador: workflow curto, caixa de e-mail, push
controlado na `main`)
**Agente recomendado:** nenhum
**Executável por:** **orquestrador**, com o ADMIN em dois passos — as configurações de notificação
da conta GitHub e a caixa de e-mail. Inclui um push deliberadamente quebrado na `main`, revertido
em seguida. **Não depende do professor.**
**PRD:** `S:\Projetos\academic_page\haroldo\PRD.md`
**Projeto:** `S:\Projetos\academic_page\haroldo`

## Objetivo

Quando um build de deploy falha, três coisas acontecem e ficam **provadas com artefato**: o site
continua no ar com a versão anterior (RNF-04), o ADMIN recebe notificação (F-02) e o log da falha
nomeia **o arquivo e o campo** que quebraram (F-09).

Não é um plano de configuração — é um plano de **experimento controlado**. A configuração sem a
falha real prova apenas que existe um formulário preenchido.

## Arquivos afetados

- `.github/workflows/vigia-do-deploy.yml` — **novo**, o único arquivo permanente (emenda de
  2026-09-12).
- `docs/adr/0011-vigia-agendado-da-falha-de-build.md` — **novo**, a decisão e as alternativas.
- `content/**` — **um** arquivo recebe conteúdo deliberadamente inválido, é empurrado para a
  `main`, e é **revertido no mesmo dia**, assim que a notificação e o log forem capturados.

> O arquivo quebrado vai para a `main` de propósito. **Planeje a reversão antes de empurrar**:
> tenha o comando de revert pronto e o commit de volta preparado. O repositório é público e o
> site fica com a versão anterior no ar durante a janela — é exatamente o comportamento que se
> quer provar, mas a janela tem de ser curta e registrada com horários.

## Contexto necessário

**Projeto.** `haroldo-page` — Astro 7 estático + TinaCMS, deploy pelo Cloudflare Workers Builds a
cada push na `main` (plano 025), rodando `npm run build:pipeline` (plano 024, ADR-0009):

```
vitest run tests/content && tinacms build --skip-cloud-checks && astro check && astro build
```

**O que o PRD exige, literalmente:**

- **F-02:** "Build falha após um salvamento do professor → a versão anterior do site permanece no
  ar; o ADMIN recebe notificação de falha; o conteúdo salvo permanece no repositório para
  correção. **Nenhuma mensagem ao professor** (o site dele continua no ar); alerta por e-mail ao
  ADMIN."
- **RNF-04:** "Um build com erro mantém a versão anterior no ar e notifica o ADMIN."
- **F-09:** "Conteúdo salvo com formato inesperado que a validação Zod rejeita → o build falha de
  forma ruidosa e **nomeia o arquivo e o campo** problemático; cai em F-02." Exemplo do PRD:
  `content/publicacoes/x.md → campo 'ano': esperado número entre 1900 e 2100`.
- **§8.2:** mensagens ao desenvolvedor (logs de build) são "específicas e rastreáveis — arquivo,
  campo e valor esperado".
- **Fluxo E da §8.1:** professor salva → build falha → site continua no ar → ADMIN é notificado →
  corrige → build volta a passar.

### O erro a injetar — use o erro **real** do professor, não um erro sintético

A dívida 3 da fase 1 documenta que o painel **deixa salvar item de lista embutida com subcampo
obrigatório vazio**, e o Zod só rejeita no build. Instâncias conhecidas: `aulas[]`, `listas[]`,
`materiais[]`, `bibliografia[]`, `scripts[].titulo`, `scripts[].codigo` e — desde o plano 021, a
primeira em lista de string simples — `publicacoes.autores[]`.

**Injete exatamente isso.** Um `aulas: [ {} ]` numa disciplina existente reproduz, byte a byte, o
que o professor consegue produzir sozinho pelo painel. Um erro inventado (YAML malformado, campo
que não existe) provaria outra coisa.

Registre na Evidência **por que** este erro e não outro.

### A emenda de 2026-09-12 — por que o plano ganhou um arquivo de código

O passo 1 original parou exatamente na condição que este plano previa ("se a Cloudflare não
oferecer notificação de build no plano gratuito, isso é um achado que muda o desenho — registre e
pare"). Medição do orquestrador em 2026-09-12, com o MCP da Cloudflare autenticado na conta
`98e35087677f329c2adbf68711ecebbf`:

- `GET /accounts/<id>/alerting/v3/available_alerts` devolve 30 grupos. **Nenhum tipo cita Workers
  Builds.** Os dois mais próximos não servem: `pages_event_alert` é do Cloudflare Pages (este
  projeto é Worker) e `workers_observability_alert` avisa de erro do Worker **em runtime**, não
  do build.
- `GET /accounts/<id>/alerting/v3/policies` devolve lista vazia.
- A documentação da Cloudflare (changelog de 2026-01-09, "Get notified when your Workers builds
  succeed or fail") oferece **só** Event Subscriptions: o Workers Builds publica eventos numa
  **Queue** e um **Worker seu** consome e envia a mensagem. Não existe "mande e-mail" nativo.
- O ADMIN conferiu o painel e confirmou: **não há opção de notificação de build**.

**Decisão do stakeholder (opção C):** um workflow **agendado** no GitHub Actions lê o check run
`Workers Builds: haroldo-page` do commit mais recente da `main` e **reprova** se o build de deploy
falhou. A reprovação gera o e-mail de falha do próprio GitHub para o ADMIN. Alternativas
rejeitadas, a registrar no ADR-0011:

- **A — Queue + Worker notificador.** Rejeitada: infraestrutura nova na conta (que é compartilhada
  com outro projeto), e e-mail saindo de Worker exige Email Routing com domínio verificado, que o
  projeto não tem.
- **B — contar com o e-mail do CI (`ci.yml`).** Rejeitada: o CI não é o build de deploy
  (ADR-0009). Os dois rodam o mesmo `build:pipeline`, mas podem divergir (ambiente, variáveis,
  falha de plataforma), e um CI verde com deploy vermelho passaria em silêncio.

**Três fatos de plataforma que decidem o desenho** — da documentação do GitHub, "Events that
trigger workflows", seção `schedule`, conferida em 2026-09-12:

1. *"Notifications for scheduled workflows are sent to the user who last modified the cron
   syntax in the workflow file."* **É por isso que o gatilho é `schedule` e não `push`.** Num
   workflow de `push`, o e-mail vai para quem empurrou — e quando o professor salva pelo painel,
   quem empurra é o TinaCloud. O F-02 é justamente esse caso. Quem escreve o cron é o ADMIN
   (`abbadrava`).
2. *"In a public repository, scheduled workflows are automatically disabled when no repository
   activity has occurred in 60 days."* O repositório é público. **Risco nomeado, não resolvido
   aqui:** se o professor passar 60 dias sem editar, o vigia desliga sozinho, e o primeiro save
   depois disso não é vigiado. Vai para o ADR-0011 e para o manual do ADMIN (§10.5).
3. *"The `schedule` event can be delayed during periods of high loads... High load times include
   the start of every hour."* O cron não roda na hora cheia.

**Fonte do resultado: o check run, não a API da Cloudflare** (decisão do stakeholder). O Workers
Builds já grava `Workers Builds: haroldo-page` em cada commit (visto nos commits `7ab84da` e
`78d5305`, app `cloudflare-workers-and-pages`). Ler pelo GitHub dispensa secret novo: basta o
`GITHUB_TOKEN` com `checks: read`. **Commit com mais de 30 minutos e sem esse check também
reprova**, porque a ausência do check é o sintoma do app GitHub ↔ Cloudflare desconectado, e isso
já aconteceu no plano 025.

**Frequência: uma vez por dia** (decisão do stakeholder: *"não será um site com atualizações
constantes. É apenas para caso um dia tenha um erro, e eu fique sabendo antes mesmo do professor
precisar perceber"*). Consequências aceitas: o aviso chega em até ~24 h, e enquanto a `main`
continuar quebrada chega **um e-mail por dia**. O vigia olha só o commit mais recente: se um save
quebrado for seguido de um save válido antes da execução, não há aviso, e é o correto, porque o
site já foi atualizado.

**Como provar o caminho agendado sem esperar 24 h.** `workflow_dispatch` prova a detecção, mas o
e-mail de uma execução manual segue outra regra (vai para quem disparou). Para exercitar o caminho
**real**, o commit quebrado do experimento muda **temporariamente** o cron para `*/5 * * * *`, e
o commit de reversão devolve o cron diário. Os dois commits são do ADMIN, então a regra do fato 1
continua apontando para ele. Custo: a janela de `main` quebrada passa a durar o atraso do agendador
(dezenas de minutos), com o site no ar na versão anterior o tempo todo, que é o que se quer provar.

### Dois canais de notificação, e só um deles importa para F-02

> **Superado pela emenda de 2026-09-12** no item 1: a Cloudflare não notifica, e o canal de F-02
> passa a ser o vigia agendado, que lê o resultado do build **de deploy**. O item 2 continua
> valendo: o e-mail do `ci.yml` é canal secundário.

1. **Cloudflare Workers Builds** — é o build **do deploy**. É ele que decide se o site atualiza.
   A notificação da Cloudflare é a que satisfaz F-02/RNF-04. Configure-a para o e-mail do ADMIN
   (`and.near@hotmail.com`, §4.2).
2. **GitHub Actions** — roda em paralelo, não é portão do deploy (ADR-0009, plano 025). O GitHub
   envia e-mail de falha ao autor do commit por padrão. Registre se chegou e em quanto tempo, mas
   **não o aceite como o canal de F-02**: um CI vermelho não impede nem provoca deploy.

Se a Cloudflare não oferecer notificação de build no plano gratuito, **isso é um achado que muda o
desenho** — registre a tela literal e pare; a alternativa (uma action de notificação no GitHub, ou
mover o deploy para o GitHub Actions, plano B da §7.4) é decisão nova, não conserto de passagem.

### Duas coisas para conferir com cuidado no log

1. **O passo que falha.** Com o portão do plano 030 na frente do build, quem deve reprovar é o
   `vitest run tests/content` — com mensagem que nomeia arquivo e campo. Se quem reprovar for o
   `astro check`/`astro build`, registre **as duas** mensagens e compare qual delas o PRD
   chamaria de legível (F-09, §8.2).
2. **O exit code não basta.** O `astro check` já foi flagrado imprimindo `[ERROR] [content]` e
   encerrando com `0 errors` e exit 0 (planos 020 e 021). **Leia o corpo do log**, não só o
   veredito do painel.

### O que este plano NÃO faz

- ⛔ **Não escreve o portão de conteúdo** — é o plano 030.
- ⛔ **Não mexe no `ci.yml`** nem em `package.json`. O vigia é workflow **separado**: tem gatilho,
  permissões e destinatário de e-mail diferentes, e misturá-lo ao portão de qualidade faria o
  e-mail do vigia seguir a regra do `push`.
- ⛔ **Não escreve o manual do professor** — os avisos consolidados são o plano 033, entrega para
  a fase 5.
- ⛔ **Não cronometra o ciclo feliz** (M-02 é o plano 029).
- ⛔ **Não expõe o professor ao erro.** F-02 é explícito: nenhuma mensagem a ele. Se o experimento
  for feito enquanto o professor tiver acesso, avise-o **antes** de que haverá uma janela de teste.

**Ambiente.** Windows 11 / PowerShell. ADMIN: desenvolvedor (`and.near@hotmail.com`).

## Passos

0. ~~Configurar no painel da Cloudflare~~ — **não existe** (emenda de 2026-09-12). A medição que
   provou isso está na emenda e é copiada para a Evidência.
1. 🧑 **Configurações de notificação do ADMIN no GitHub** (`github.com/settings/notifications`):
   em *System → Actions*, e-mail marcado e "only notify for failed workflows"; e o e-mail padrão
   de notificação da conta `abbadrava`.
   → verify: cole o que a tela mostra nos dois lugares. Sem isso, um vigia vermelho pode não gerar
   e-mail nenhum.
1a. 🤖 Escrever `.github/workflows/vigia-do-deploy.yml`: gatilhos `schedule` (diário, fora da
   hora cheia) e `workflow_dispatch`; `permissions: checks: read, contents: read`; lê o commit
   mais recente da `main` e o check run `Workers Builds: haroldo-page`; **reprova** em
   `conclusion` diferente de `success`, `neutral` ou `skipped`, e em commit com mais de 30 min sem
   o check; **passa** com o build ainda em andamento; imprime SHA, conclusão e link do build. E
   escrever o ADR-0011.
   → verify: `npm run format:check` verde; o workflow empurrado e disparado por
   `workflow_dispatch` sobre a `main` **válida** termina `success`, com o log mostrando o SHA e o
   check lidos. **Prove que ele consegue reprovar**: cole a saída de uma execução local da mesma
   lógica contra um commit cujo check falhou, ou deixe a prova para o passo 5a.
2. 🤖/🧑 Registrar a linha de base **antes** de quebrar: id da versão publicada hoje, horário, e
   `curl.exe -sI https://haroldo-page.and-near.workers.dev/` com o `etag`/status.
   → verify: os três valores colados. Sem isso não se prova que a versão anterior permaneceu.
3. 🤖/🧑 Preparar o commit quebrado **e o de reversão**, nesta ordem, antes de empurrar qualquer
   coisa. O quebrado faz **duas** mudanças: acrescenta `aulas: [ {} ]` (item com `numero`,
   `titulo` e `url` vazios) a `content/disciplinas/2025.1-mecanica-classica.md` **e** troca o cron
   do vigia para `*/5 * * * *` (emenda de 2026-09-12). A reversão desfaz as duas. Confirme
   localmente que `npx vitest run tests/content` reprova nomeando arquivo e campo.
   → verify: a saída local do vitest colada — é a mensagem que se espera ver no log do build.
4. 🧑 Empurrar o commit quebrado para a `main`, anotando o horário exato.
   → verify: SHA e horário colados.
5. 🧑 Acompanhar o build do Workers Builds até falhar.
   → verify: cole (a) o status final, (b) **o trecho do log com a mensagem de erro**, (c) qual
   passo do `build:pipeline` reprovou e (d) a duração.
6. 🧑 Provar **F-02/RNF-04** enquanto a `main` ainda está quebrada: o site continua no ar com a
   versão anterior.
   → verify: `curl.exe -sI` na raiz devolvendo 200, o id de versão publicada **igual** ao da linha
   de base do passo 2, e o horário da conferência. Confirme também que o arquivo inválido
   **permanece no repositório** (F-02: "o conteúdo salvo permanece para correção").
5a. 🤖 Acompanhar a primeira execução **agendada** do vigia depois da falha (evento `schedule`, não
   `workflow_dispatch`).
   → verify: id do run, `event: schedule`, `conclusion: failure`, horário de início, e o trecho do
   log que nomeia o SHA quebrado e o link do build da Cloudflare.
7. 🧑 Capturar a notificação: e-mail recebido pelo ADMIN **gerado pelo run agendado do passo 5a**.
   → verify: cole remetente, assunto, horário de chegada e o trecho do corpo que identifica o
   repositório e o workflow `vigia-do-deploy`. **Calcule e registre dois atrasos**: da falha do
   build (passo 5) ao início do run agendado, e do fim do run à chegada do e-mail. Registre também
   se chegou o e-mail do `ci.yml`, e em quanto tempo, como canal secundário.
8. 🧑 Reverter: empurrar o commit de reversão (conteúdo válido **e** cron diário de volta) e
   confirmar que o build volta a passar e publica.
   → verify: SHA da reversão, build verde, **id de versão novo**, horário. Cole a janela total em
   que a `main` ficou quebrada. Confirme por `git show HEAD:.github/workflows/vigia-do-deploy.yml`
   que o cron voltou a ser o diário. E dispare o vigia por `workflow_dispatch` sobre a reversão:
   tem de terminar `success`.
9. 🧑 Julgar a legibilidade da mensagem contra F-09 e §8.2 e registrar o veredito, com a mensagem
   literal.
   → verify: a mensagem nomeia **arquivo** e **campo**? Se sim, F-09 está satisfeito e a evidência
   é o texto. Se não, **registre a lacuna como pendência nomeada** — para o plano 033 (avisos do
   manual) e para a fase 5 — em vez de improvisar melhoria de mensagem aqui.

## Critérios de aceitação

- [ ] Ausência de notificação nativa na Cloudflare registrada com a medição da API e a confirmação
      do painel (emenda de 2026-09-12)
- [ ] `.github/workflows/vigia-do-deploy.yml` com gatilho `schedule` diário, `workflow_dispatch`,
      permissões mínimas, e reprovando em build falho **e** em check ausente há mais de 30 min
- [ ] ADR-0011 escrito, com as alternativas A e B rejeitadas e o **risco dos 60 dias** nomeado
- [ ] Configurações de notificação de Actions da conta do ADMIN transcritas
- [ ] **Execução agendada** (`event: schedule`) do vigia reprovando sobre o commit quebrado
- [ ] Linha de base registrada antes do experimento: id de versão, horário e resposta HTTP
- [ ] Falha injetada com o **erro real do professor** (`aulas: [ {} ]`), com a justificativa
      registrada
- [ ] Build de deploy **falhou**, com log colado, passo identificado e duração
- [ ] **RNF-04 provado:** site respondendo 200 com o **mesmo id de versão** da linha de base
      durante a janela de falha, com horário
- [ ] **F-02 provado:** e-mail de falha recebido pelo ADMIN — remetente, assunto, horário e atraso
      calculado; e o arquivo inválido permanecendo no repositório
- [ ] Canal secundário (e-mail do `ci.yml`) registrado, sem ser tratado como o canal de F-02
- [ ] Cron do vigia **de volta ao diário** na `main` depois da reversão, e vigia `success` sobre ela
- [ ] **F-09 avaliado com a mensagem literal**: veredito explícito sobre nomear arquivo e campo;
      lacuna, se houver, registrada como pendência nomeada
- [ ] Reversão empurrada, build verde e **versão nova publicada**, com a janela total de quebra
      registrada
- [ ] `git status --short` limpo ao final; `content/**` de volta ao estado válido
- [ ] §12 do PRD (item 6 da fase 2) e o README da fase 2 atualizados pelo orquestrador ao promover
      `Status: DONE`
- [ ] CI do GitHub Actions com `conclusion: success` no commit de reversão

## Evidência

> Executado pelo orquestrador em 2026-09-12, com o ADMIN nos passos de painel e caixa de e-mail.
> Horários em UTC; o ADMIN relatou em BRT (UTC−3). `Status` mantido em `TODO`: a promoção depende
> de decisão do stakeholder sobre o critério não cumprido (ver "Critério não cumprido").

### Commits

| SHA       | O que é                                                            | Push (UTC) |
| --------- | ------------------------------------------------------------------ | ---------- |
| `fee4e7f` | emenda do plano                                                    | 20:28:20Z  |
| `86a6370` | `vigia-do-deploy.yml` + ADR-0011                                   | 20:28:20Z  |
| `b8e4560` | **EXPERIMENTO**: `aulas: [ {} ]` + cron `*/5`                      | 20:34:24Z  |
| `8a246be` | reversão de `b8e4560` (conteúdo válido, cron `17 12 * * *` de volta) | 22:05:27Z  |

### Passo 0 — a Cloudflare não notifica

Medição na emenda: `available_alerts` com 30 grupos e nenhum de Workers Builds; `policies` vazia;
documentação oferece só Event Subscriptions. O ADMIN conferiu o painel: nenhuma opção.

### Passo 1 — notificações da conta do ADMIN

Relato do ADMIN: *System → Actions* com notificação **no GitHub e por e-mail**, **só para workflows
que falharem**. O e-mail padrão da conta não foi transcrito; a chegada dos e-mails abaixo na caixa
do ADMIN é a prova de que o destino está certo.

### Passo 1a — o vigia

Lógica exercitada localmente antes do push, com o mesmo script (SHA passado por variável):

```
== main atual
commit: 78d5305fb2c6491498f30d0c2cbb784738f80ca5 (2026-09-12T16:35:44Z)
check: status=completed conclusion=success
Build de deploy verde.
exit=0
== 26de58a (antes do Workers Builds)
::error::Nenhum 'Workers Builds: haroldo-page' em 26de58a55d3206bb8f578267539929e01f379697, 3281 min depois do commit.
exit=1
```

Na `main` válida: `86a6370` com Workers Builds `success` (build `cac443a6`) e `qualidade`
`success`. Vigia por `workflow_dispatch`, run 34717315883, `success`:

```
commit: 86a6370d5b3f641e94ab38676e77d630bac8dc25 (2026-09-12T20:28:17Z)
check: status=completed conclusion=success
Build de deploy verde.
```

`npm run format:check`: "All matched files use Prettier code style!"; `npm run lint` sem erro.

### Passo 2 — linha de base

- Versão publicada: `c3d2f67f-122a-453d-a48b-815710c418ee`, 100%, deploy `2bdeb078` de 20:30:36Z
- `curl.exe -sI https://haroldo-page.and-near.workers.dev/` às **20:33:42Z**: `HTTP/1.1 200 OK`. O
  Worker não devolve `etag` na raiz; a identidade da versão vem da API de deployments.

### Passo 3 — o erro injetado, e por que este

`aulas: [ {} ]` em `content/disciplinas/2025.1-mecanica-classica.md`: é o erro que o professor
produz **sozinho pelo painel** (dívida 3 da fase 1, aviso 2 de `docs/avisos-do-painel-para-o-manual.md`).
Erro sintético provaria outra coisa. Saída local de `npx vitest run tests/content`:

```
+   "content/disciplinas/2025.1-mecanica-classica.md → campo 'aulas.0.numero': Invalid input: expected number, received undefined",
+   "content/disciplinas/2025.1-mecanica-classica.md → campo 'aulas.0.titulo': Invalid input: expected string, received undefined",
+   "content/disciplinas/2025.1-mecanica-classica.md → campo 'aulas.0.url': Invalid input: expected string, received undefined",
 Test Files  1 failed | 3 passed (4)
      Tests  1 failed | 107 passed (108)
```

### Passos 4 e 5 — a falha do build de deploy

Push de `b8e4560` às **20:34:24Z**. Build `f9650b87` (`GET /accounts/<id>/builds/builds/<uuid>`):
`created_on` 20:34:25Z, `running_on` 20:34:27Z, `stopped_on` **20:35:14Z**, `build_outcome: fail`,
`commit_hash` `b8e45609…`. **Duração: 47 s.** Reprovou no **primeiro** passo do `build:pipeline`,
o `vitest run tests/content`. Log lido (`.../logs`), não só o veredito:

```
Executing user build command: npm run build:pipeline
> vitest run tests/content && tinacms build --skip-cloud-checks && astro check && astro build
 ✓ tests/content/paridade-schema.test.ts (18 tests) 22ms
 ✓ tests/content/schemas.test.ts (81 tests) 32ms
 ✓ tests/content/tina-lock-coerente.test.ts (7 tests) 7ms
 ❯ tests/content/conteudo-valido.test.ts (2 tests | 1 failed) 31ms
+   "content/disciplinas/2025.1-mecanica-classica.md → campo 'aulas.0.numero': Invalid input: expected number, received undefined",
+   "content/disciplinas/2025.1-mecanica-classica.md → campo 'aulas.0.titulo': Invalid input: expected string, received undefined",
+   "content/disciplinas/2025.1-mecanica-classica.md → campo 'aulas.0.url': Invalid input: expected string, received undefined",
 Test Files  1 failed | 3 passed (4)
      Tests  1 failed | 107 passed (108)
Failed: error occurred while running build command
```

Check runs de `b8e4560`: `Workers Builds: haroldo-page` `failure` (20:35:15Z); `qualidade`
`failure` (20:39:59Z, run 34717493871). Nem `astro check` nem `astro build` chegaram a rodar.

### Passo 6 — RNF-04 e F-02 com a `main` quebrada

- `curl.exe -sI` às **20:40:31Z**: `HTTP/1.1 200 OK`
- Deployment ativo às 20:40:29Z: ainda `2bdeb078`, versão **`c3d2f67f`** a 100%, **igual à linha
  de base**
- O arquivo inválido **permanece na `main`** (`GET contents/...?ref=main` terminando em
  `aulas:` / `  - {}`)

### Passo 5a — o vigia com a `main` quebrada

**Nenhuma execução `schedule` ocorreu.** De 20:34Z a 22:05Z (~90 min), `gh run list --event
schedule` vazio e `actions/runs?event=schedule` com `total_count: 0`. Workflow `active`
(`id 356732123`), cron `*/5 * * * *` confirmado na `main`. É o agendador do GitHub não pegando o cron
recém-alterado; a documentação só promete *"can be delayed during periods of high loads"*.

Decisão do ADMIN: rodar por `workflow_dispatch`. Run **34720806455**, disparado 21:44:31Z,
terminado 21:44:40Z, `conclusion: failure`:

```
commit: b8e45609be3f459fd61a0966ce38c86cdbb82578 (2026-09-12T20:34:22Z)
check: status=completed conclusion=failure
build: https://dash.cloudflare.com/98e35087677f329c2adbf68711ecebbf/workers/services/view/haroldo-page/production/builds/f9650b87-8b0a-4a4a-aecd-b102a286c278
##[error]Build de deploy de b8e45609be3f459fd61a0966ce38c86cdbb82578 terminou 'failure'. O site segue na versao anterior. Log: https://dash.cloudflare.com/…/builds/f9650b87-…
##[error]Process completed with exit code 1.
```

### Passo 7 — e-mails

| Canal                        | Origem                         | Chegada (relato do ADMIN) | Atraso                   | Conteúdo                                                                      |
| ---------------------------- | ------------------------------ | ------------------------- | ------------------------ | ----------------------------------------------------------------------------- |
| **Vigia** (canal de F-02)    | run 34720806455, `workflow_dispatch` | 18:45 BRT = 21:45Z        | < 1 min após o fim do run | corpo com "Vigia do deploy: All jobs have failed" e os dados do run            |
| CI (secundário)              | run 34717493871, `push`        | 17:40 BRT = 20:40Z        | ~1 min após a falha      | `GitHub <notifications@github.com>`, `[researchgroups-ufma/haroldo-page] Run failed` |

Atraso total que o experimento **mediu**, da falha do build (20:35:14Z) ao e-mail do vigia: não é
representativo, porque o disparo foi manual às 21:44Z. Em produção, o atraso é de até ~24 h, pelo
cron diário, mais o atraso do agendador.

Observação para o manual: o assunto do e-mail do GitHub **não nomeia o workflow**; o CI e o vigia
chegam com o mesmo `Run failed`, e só o corpo diz qual é.

### Passo 8 — reversão

Push de `8a246be` às **22:05:27Z**. Build `43d03ba9`: `running_on` 22:05:30Z, `stopped_on`
22:07:29Z, `success`. Deployment `4ce5ae50` às 22:07:26Z com a **versão nova
`b1c13465-a767-4cfc-8c0b-d1d31facd4f9`** a 100%. `qualidade` `success` (run 34721768721).
`curl.exe -sI` às 22:08:01Z: `200 OK`. `git show HEAD:.github/workflows/vigia-do-deploy.yml`:
`- cron: '17 12 * * *'`. Vigia por `workflow_dispatch` sobre a reversão, run 34721890077,
`success`:

```
commit: 8a246be9d7f2566ed9f4cdae70d8993510a7e443 (2026-09-12T22:05:23Z)
check: status=completed conclusion=success
Build de deploy verde.
```

**Janela total de `main` quebrada:** 20:34:24Z → 22:07:26Z, **1 h 33 min**, com o site em
`c3d2f67f` durante toda ela.

### Passo 9 — F-09

**Satisfeito.** A mensagem nomeia **arquivo** (`content/disciplinas/2025.1-mecanica-classica.md`),
**campo** (`aulas.0.numero`, `aulas.0.titulo`, `aulas.0.url`) e **o esperado** (`expected number`,
`expected string`), no formato do exemplo do PRD. O vigia acrescenta o link do log. Lacuna menor,
não bloqueante: `Invalid input` vem do Zod em inglês e `aulas.0` é índice a partir de zero; a
mensagem é para o ADMIN (§8.2), não para o professor.

### Achado lateral

O check `Workers Builds: haroldo-page` aparece `in_progress` enquanto o build roda (visto em
`86a6370`), e não só ao terminar, como o comentário do workflow e o ADR-0011 diziam na primeira
versão. Corrigidos no commit desta Evidência. O comportamento do vigia não muda, porque `status !=
completed` já passava.

### Critério não cumprido

**"Execução agendada (`event: schedule`) do vigia reprovando sobre o commit quebrado"**: não
ocorreu nenhuma execução agendada em ~90 min. Provado em seu lugar: a detecção (run manual
reprovando com a mensagem certa) e a entrega do e-mail ao ADMIN em menos de 1 min. **O que segue
não provado:** que o cron diário roda, e que o e-mail de uma execução `schedule` vai para o ADMIN
(regra documentada pelo GitHub, não observada). Registrado como pendência nomeada no ADR-0011,
com a condição de fechamento.

`git status --short` ao final da reversão: limpo.
