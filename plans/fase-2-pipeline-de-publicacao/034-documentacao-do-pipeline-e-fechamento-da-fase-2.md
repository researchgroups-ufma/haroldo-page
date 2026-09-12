# Plano 034 — Documentação do pipeline no README e fechamento da fase 2

**Status:** TODO
**RFs cobertos:** §10.5 (README de manutenção); fase 2, **item 5** do §12; fechamento do checklist
da fase (**5/5**) e do §0 do PRD
**Depende de:** **todos os demais planos da fase 2 em `DONE`** — 023, 024, 025, 026, 028, 030, 031,
032 e 033. Os planos **027 e 029 saíram da fase** em 2026-09-12 (ver
`docs/sabatinas/CHANGELOG_sabatina_recorte-sem-professor.md`) e **não** são mais pré-requisito. Um README que descreve um
pipeline que ainda não fechou é a mesma dívida que o plano 023 veio corrigir.
**Modelo recomendado:** sonnet
**Agente recomendado:** implementer
**Executável por:** **agente** para a redação — todos os números que ele precisa já estarão colados
nas Evidências dos planos 025, 026 e 028. **Dois passos são do orquestrador:** conferir que os onze
planos anteriores estão `DONE` e promover o `Status:` deste.
**PRD:** `S:\Projetos\academic_page\haroldo\PRD.md`
**Projeto:** `S:\Projetos\academic_page\haroldo`

## Objetivo

Quem chegar ao projeto sem contexto consegue, lendo o `README.md`, entender o caminho completo de
uma edição do professor até o site publicado — e o que fazer quando ele quebra. O checklist da
fase 2 fecha em 5/5, o §0 do PRD volta a refletir a realidade, e o que a fase 2 **não** resolveu
fica escrito com destino nomeado (fase 3, fase 5 ou dívida aberta).

## Arquivos afetados

- `README.md` — a seção "Deploy" (hoje descreve deploy **manual** e diz que o automático "só é
  ligado na fase 2") e uma seção nova de pipeline
- `PRD.md` — §0 (`Estado da implementação`, `Versão do PRD`, `Última atualização`), §0.1 (linha
  nova) e §12 (checklist da fase 2 e a tabela de progresso)
- `plans/README.md` — a linha da fase 2 na tabela
- `plans/fase-2-pipeline-de-publicacao/README.md` — tabela de estado, o que a fase deixou aberto e
  o que ela empurra para as fases 3 e 5

> O executor não toca em arquivo fora desta lista. Se precisar, para e reporta.
> **Não** altere o `Status` do PRD (`🟢 Aprovado`) e **não** marque item de checklist de outra
> fase. **Não** promova `Status:` de plano nenhum — nem o deste.

## Contexto necessário

**Projeto.** `haroldo-page` — site acadêmico do Prof. Haroldo C. D. Lima Junior (UFMA). Astro 7
estático (D-01) + TinaCMS, deploy no Cloudflare Workers, conteúdo em `content/` versionado no
GitHub.

**Onde estão os números.** Não reproduza de cabeça e não estime: cada valor vem colado de uma
Evidência de plano desta fase.

| O que documentar | Onde está |
|---|---|
| Comando de build dos pipelines e por que sem cloud check | plano 024 + `docs/adr/0009-build-de-pipeline-sem-cloud-check.md` |
| Configuração do Workers Builds, variáveis e duração do primeiro build | Evidência do plano 025 |
| `/admin` em produção: URLs que funcionam, como se autentica | Evidência do plano 026 |
| Papéis, vagas do plano gratuito e o que o EDITOR não pode | Evidência do plano 027 |
| Notificação de falha, comportamento F-02/RNF-04 e a mensagem de erro real | Evidência do plano 028 |
| M-02: os 10 ΔT, mediana, e o que **não** foi provado | Evidência do plano 029 |
| Portão de conteúdo e o que ele reprova | plano 030 |
| Verificação do `tina-lock.json` | plano 031 |
| Política de `npm audit` | plano 032 + `docs/adr/0010-npm-audit-no-ci-e-severidade.md` |
| Avisos do painel para a fase 5 | `docs/avisos-do-painel-para-o-manual.md` (plano 033) |

### O que a seção nova do README tem de responder

Escreva para quem **não** acompanhou a fase. Cinco perguntas, nesta ordem:

1. **O que acontece quando o professor clica em Salvar?** A cadeia inteira: painel → TinaCloud →
   commit na `main` → Workers Builds → `npm run build:pipeline` → `wrangler deploy` → versão nova
   no Worker. Com o tempo típico medido no plano 029, não com "poucos minutos".
2. **Quem roda o quê.** GitHub Actions (portão de qualidade) e Workers Builds (deploy) disparam no
   mesmo push e **correm em paralelo** — o CI **não** é portão do deploy. O que protege o site de
   conteúdo inválido é o próprio `build:pipeline`, que roda `vitest run tests/content` antes de
   tudo. Isso é deliberado (ADR-0009) e precisa estar dito, porque contraria a expectativa normal.
3. **Onde vive cada variável de ambiente:** `.env` local, secrets do GitHub Actions, variáveis do
   Workers Builds — e o que é segredo (`TINA_TOKEN`) e o que não é. Ver §7.6.
4. **O que acontece quando o build falha** — F-02/RNF-04, com o comportamento medido no plano 028:
   site no ar com a versão anterior, ADMIN notificado, conteúdo preservado no repositório para
   correção. E **como diagnosticar**: onde está o log, o que a mensagem nomeia.
5. **O que fazer para mudar o schema**, agora que o pipeline não roda cloud check: a ordem
   `revisão → commit → push → TinaCloud reindexa → npm run build (local, com cloud check) verde` e
   a regeneração do `tina/tina-lock.json` por `tinacms dev` — com a nota de que o plano 031 fez
   disso um teste.

**A seção "Deploy" atual fica falsa** assim que o plano 025 fecha: ela diz "hoje o deploy é
**manual**" e "o deploy automático … só é ligado na fase 2". Reescreva-a; mantenha `npm run deploy`
documentado como **caminho manual de emergência**, com a diferença registrada (ele usa
`npm run build`, com cloud check — decisão do ADR-0009).

### O fechamento da fase — o que precisa estar escrito, e o que não pode ser inventado

**Checklist §12 da fase 2, os oito itens.** Marque `- [x]` apenas os que tiverem Evidência, e
anexe a cada um o plano e o artefato que o fecha, no estilo das fases 0 e 1 (que citam plano e
commit em cada linha). **Item sem Evidência fica desmarcado** — critério de aceitação não se
reescreve para caber no resultado (lição 5 da fase 0).

**O item 7 exige cuidado redobrado.** O texto do checklist diz "Ciclo ponta a ponta cronometrado:
edição do EDITOR **visível no site** (M-02)". A fase 2 **não tem página que renderize conteúdo** —
o site público é a fase 3. O que o plano 029 mede é a cadeia até a publicação da versão nova. Ao
marcar o item, **escreva a ressalva na própria linha**: o que foi medido, o que não foi, e que
M-02 é remedida na fase 5 (o PRD já agenda as duas medições em §3.3). Marcar o item sem essa
ressalva seria transformar uma limitação declarada em afirmação falsa.

**§0 do PRD:** `Versão do PRD` para `v0.1.21`, `Estado da implementação` com a fase 2 concluída na
data real, `Última atualização` na data real e linha nova em §0.1. `Status` **não muda**.

**Tabela de progresso do §12:** fase 2 para `8/8 · 🟢 Concluída` (ou o número real, se algum item
tiver ficado aberto — e nesse caso a fase **não** é declarada concluída).

**README da fase 2:** tabela de estado com os doze planos, seus commits e o agente; a seção "o que
a fase 2 empurra para as fases seguintes", montada a partir do que os planos registraram — no
mesmo espírito com que o plano 021 montou a lista das sete dívidas para esta fase. Registre em
especial:

- o que ficou para a **fase 3**: a renderização que torna M-02 verificável de ponta a ponta; a
  dívida 7(b) do teste de paridade (enum depois do ramo `campo.list`), que só ganha teste quando
  existir campo com `list: true` **e** `options`;
- o que ficou para a **fase 5**: `docs/avisos-do-painel-para-o-manual.md` como insumo obrigatório
  do manual; a remedição de M-02; o teste de restauração de conteúdo excluído (§9);
- **dívidas novas que a própria fase 2 criou**, se houver. Se não houver nenhuma, diga isso
  explicitamente — "nenhuma" é uma afirmação, e o leitor precisa saber que ela foi feita de
  propósito, não por esquecimento.

### O que este plano NÃO faz

- ⛔ **Não escreve o manual do professor** (fase 5).
- ⛔ **Não constrói página** nem antecipa fase 3.
- ⛔ **Não conserta nada que os planos anteriores tenham deixado aberto.** Achado aberto vira
  linha no README da fase, com destino — não conserto de passagem no plano de fechamento.
- ⛔ **Não cria ADR novo**, a menos que a fase tenha tomado uma decisão arquitetural que não esteja
  nos ADRs 0009 e 0010. Se tiver, ele é o **0011** e o plano para e reporta antes de escrever, para
  que a decisão passe pelo caminho certo.

### Padrões da casa

- Datas absolutas. Português. `git add` por caminho explícito. `Status:` fica em `TODO`.
- **Nada se declara pronto por relato:** toda linha marcada no §12 aponta para a Evidência que a
  sustenta.
- A verificação autoritativa inclui o `conclusion` do run do GitHub Actions sobre o commit
  empurrado.

## Passos

1. 🧑 **(orquestrador)** Conferir que os planos 023 a 033 estão todos `Status: DONE`, com Evidência
   preenchida.
   → verify: a lista dos onze, com o `Status:` de cada um, colada. Qualquer um em `TODO` **para
   este plano** — o fechamento não antecede o que fecha.
2. Ler as Evidências dos planos 024 a 033 e extrair a tabela de números do "Contexto necessário".
   → verify: uma tabela na Evidência com cada número e o plano de origem. Número sem origem não
   entra no README.
3. Reescrever a seção "Deploy" do `README.md` e escrever a seção nova do pipeline, respondendo às
   cinco perguntas.
   → verify: releia o `README.md` **inteiro** e liste as afirmações que a fase 2 tornou falsas —
   inclusive fora das seções tocadas. Corrija as que estiverem no escopo deste plano; **reporte** as
   que não estiverem.
4. Marcar o checklist da fase 2 no §12 do PRD, item a item, com plano e artefato; e a ressalva do
   item 7.
   → verify: cada `- [x]` com a origem citada; itens sem Evidência desmarcados e o motivo escrito.
5. Atualizar o §0 e o §0.1 do PRD e a linha da fase 2 em `plans/README.md`.
   → verify: `git diff -- PRD.md plans/README.md` sem alteração fora do previsto; `Status`
   inalterado em `🟢 Aprovado`.
6. Atualizar `plans/fase-2-pipeline-de-publicacao/README.md`: tabela de estado com commits, e a
   seção do que a fase empurra para as fases 3 e 5, mais as dívidas novas (ou a afirmação de que
   não há).
   → verify: os doze planos na tabela, cada um com commit; a seção de repasse escrita.
7. Rodar a sequência de qualidade local.
   → verify: `npm run lint`, `npm run format:check`, `npm run test:coverage` e `npm run build`
   verdes, saídas coladas; a do `build` **lida**, não só o exit code.

## Critérios de aceitação

- [x] Planos 023–033 conferidos em `DONE` antes de qualquer escrita
- [x] `README.md` com a seção de pipeline respondendo às cinco perguntas, com **números vindos das
      Evidências**, não estimados
- [x] Seção "Deploy" reescrita: automático como caminho normal, `npm run deploy` como emergência,
      com a diferença de comando registrada
- [x] Distinção CI × deploy escrita explicitamente (o CI **não** é portão do deploy)
- [x] §12 do PRD com os itens da fase 2 marcados **só onde há Evidência**, cada um citando
      plano e artefato (o texto deste critério ainda diz "os oito itens" — desatualizado pelo
      recorte de 2026-09-12, ver "Divergências do plano com o recorte" na Evidência: são **cinco**)
- [ ] **Ressalva do item 7 escrita na própria linha** — **não aplicável**: não existe item 7 nesta
      fase desde o recorte de 2026-09-12 (migrou para a fase 5 com o plano 029). Ver "Divergências"
- [x] Tabela de progresso do §12 com o número real da fase 2; `🟢 Concluída` (o critério ainda diz
      "apenas se 8/8" — desatualizado pelo recorte; o total real da fase é 5, e o resultado é 5/5)
- [x] §0 do PRD com `Estado da implementação` e `Última atualização` reais; `Status`
      inalterado (o critério ainda diz "em `v0.1.21`" — desatualizado; a versão correta, por
      instrução do despacho, é **v0.1.31**, porque v0.1.21–v0.1.30 já foram usadas pelos planos
      023–028/030–033)
- [x] Linha nova em §0.1
- [x] `plans/README.md` com a linha da fase 2 atualizada
- [x] README da fase 2 com a tabela de estado e a seção de repasse para as fases 3 e 5, incluindo a
      dívida 7(b) e os avisos do plano 033 (o critério ainda diz "tabela dos doze planos" —
      desatualizado; são **dez**: os nove pré-requisitos mais o 034. A tabela já existia, completa e
      correta, antes deste plano — este plano não alterou nenhuma linha dela)
- [x] Dívidas novas criadas pela fase 2 listadas — ou a afirmação explícita de que não há
- [x] Nenhum ADR novo escrito sem que a decisão correspondente tenha sido reportada antes
- [x] Afirmações do `README.md` que a fase 2 tornou falsas: corrigidas (se no escopo) ou
      **reportadas** (se fora)
- [x] `npm run lint`, `npm run format:check`, `npm run test:coverage` e `npm run build` verdes
- [ ] CI do GitHub Actions com `conclusion: success` no commit empurrado — nada foi commitado nem
      empurrado nesta sessão (regra de despacho); caixa fica vazia de propósito

## Evidência

Executado pelo `implementer` em 2026-09-12. `Status:` deliberadamente mantido em `TODO` — a
promoção é do orquestrador. Nenhum `git add`, commit ou push foi feito nesta sessão.

### Divergências do plano com o recorte de 2026-09-12

O corpo deste plano foi escrito **antes** da sabatina de recorte de escopo
(`docs/sabatinas/CHANGELOG_sabatina_recorte-sem-professor.md`, PRD v0.1.27) e ficou desatualizado
em pontos que o cabeçalho do próprio plano já corrige, mas o corpo (Objetivo, Contexto, Passos,
Critérios de aceitação) não foi reescrito. Onde divergiram, usei os valores corretos, listados
aqui como o despacho exigiu:

1. **A fase 2 tem 5 itens no §12, não 8.** Antes deste plano estava em 4/5; o item que faltava era
   o item 5 ("Documentação do pipeline no README"), que este plano fecha. Resultado: **5/5 · 🟢
   Concluída**.
2. **Não existe "item 7" nem ressalva de M-02 nesta fase.** Esse item (ciclo cronometrado com o
   EDITOR) migrou para a fase 5 com o plano 029 em 2026-09-12. Não marquei nada da fase 5.
3. **Pré-requisitos são 9 planos** (023, 024, 025, 026, 028, 030, 031, 032, 033), não "onze". A
   tabela de estado do README da fase 2 tem **10 linhas** (os 9 + o 034), não "doze" — 027 e 029
   estão em `plans/fase-5-polimento-e-entrega/`. Essa tabela já existia, completa e correta, antes
   deste plano; eu não alterei nenhuma linha dela (só acrescentei uma seção nova depois dela).
4. **Versão do PRD:** a versão anterior a este plano era **v0.1.30**; este plano leva a **v0.1.31**
   (não "v0.1.21" — essa faixa de versões já foi consumida pelos planos 023 a 033).
5. **Não há número de M-02 nem tempo do plano 029** — o 029 não rodou (está na fase 5). Para a
   pergunta 1 da seção "Pipeline de publicação" do README ("tempo típico"), usei durações de build
   **medidas e citadas**: plano 025 (primeiro build automático, `ace5b1b9`, 2m02s), plano 026
   (build `8aa9d0db` iniciado 2 s depois do commit do painel) e plano 028 (build de reversão
   `43d03ba9`, `running_on` 22:05:30Z → `stopped_on` 22:07:29Z, 1m59s; build falho `f9650b87`,
   20:34:27Z → 20:35:14Z, 47 s). Registrei explicitamente que o ciclo ponta a ponta com o professor
   (M-02) só é medido na fase 5.
6. **Não usei as Evidências dos planos 027 e 029 como fonte de número** — o 027 ficou bloqueado e
   o 029 não rodou. Não precisei citar papéis/vagas do TinaCloud (§7.4, A-01/R-04) porque nenhuma
   das cinco perguntas do README exigia esse dado.
7. **O ADR-0011 já existe** (criado pelo plano 028, `docs/adr/0011-vigia-agendado-da-falha-de-build.md`).
   Não criei ADR nenhum — a seção "Pipeline de publicação" só referencia os ADRs 0009, 0010 e 0011
   existentes.

### Passo 1 (do orquestrador) — planos 023–033 conferidos em `DONE`

Colado tal como recebido no despacho:

```
plans/fase-2-pipeline-de-publicacao/023-reconciliacao-do-estado-documental.md:**Status:** DONE
plans/fase-2-pipeline-de-publicacao/024-build-de-pipeline-e-o-cloud-check-do-tinacloud.md:**Status:** DONE
plans/fase-2-pipeline-de-publicacao/025-roteiro-workers-builds-e-variaveis-no-cloudflare.md:**Status:** DONE
plans/fase-2-pipeline-de-publicacao/026-admin-em-producao-autenticando-pelo-tinacloud.md:**Status:** DONE
plans/fase-2-pipeline-de-publicacao/028-notificacao-de-falha-de-build-ao-admin.md:**Status:** DONE
plans/fase-2-pipeline-de-publicacao/030-portao-de-conteudo-no-ci.md:**Status:** DONE
plans/fase-2-pipeline-de-publicacao/031-coerencia-do-tina-lock-no-ci.md:**Status:** DONE
plans/fase-2-pipeline-de-publicacao/032-npm-audit-no-ci-e-politica-de-severidade.md:**Status:** DONE
plans/fase-2-pipeline-de-publicacao/033-avisos-do-painel-para-o-manual-da-fase-5.md:**Status:** DONE
```

Conferi eu mesmo, lendo cada um dos nove arquivos por inteiro (não só o cabeçalho `Status:`) antes
de escrever qualquer linha de documentação — inclusive as seções de Evidência, de onde vêm todos
os números usados abaixo.

### Passo 2 — tabela "número → plano de origem"

| Número / afirmação usada no README | Plano de origem (Evidência) |
|---|---|
| Comando `build:pipeline` e por que sem cloud check (`vitest run tests/content && tinacms build --skip-cloud-checks && astro check && astro build`) | Plano 024, "Contexto necessário" e passo 3 |
| Distinção push/pull_request no cloud check (por que o pipeline não pode usar `npm run build`) | Plano 024, passo 6 (`ci.yml`) |
| Primeiro build automático: `ace5b1b9`, duração **2m02s** (`2026-09-11T12:48:13.213Z` → `12:50:15.644Z`) | Plano 025, "Passos 3, 5 e 6" |
| Node detectado pelo Workers Builds: `nodejs@24.21.0`, major 24 = `.nvmrc` | Plano 025, "Passos 3, 5 e 6" |
| Os dois pipelines correm em paralelo, no mesmo push, sem a Cloudflare esperar o `conclusion` do CI | Plano 025, "Propriedade do desenho" e Plano 026, passo 7 |
| `TINA_CLIENT_ID`/`PUBLIC_SITE_URL` são variáveis de **build**, não runtime — achado "Variables cannot be added to a Worker that only has static assets" | Plano 025, "Achado do passo 4" |
| `TINA_TOKEN` é segredo mascarado; `TINA_CLIENT_ID` embutido em texto claro no bundle do painel | Plano 026, "O painel em produção é o de produção" |
| Edição real do painel → commit `7ab84da` → build `8aa9d0db` iniciado **2 s** depois do commit (`21:25:28` → `21:25:30.552Z`) | Plano 026, passo 7 |
| `/admin`, `/admin/` e `/admin/index.html`: só `/admin/` responde 200 direto, as outras duas 307 (`html_handling` default) | Plano 026, passo 2 (registrado como achado descartado no README da fase, não corrigido) |
| Comportamento do build falho — F-02/RNF-04: site seguiu 200 na versão `c3d2f67f` (igual à linha de base) durante 1h33 de `main` quebrada; arquivo inválido permaneceu no repositório | Plano 028, passos 2 e 6 |
| Mensagem de erro real, nomeando arquivo e campo (`content/disciplinas/2025.1-mecanica-classica.md → campo 'aulas.0.numero': ...`) | Plano 028, passos 3–5 |
| Build de reversão `43d03ba9`: `running_on` 22:05:30Z → `stopped_on` 22:07:29Z (**1m59s**) | Plano 028, passo 8 |
| Build falho `f9650b87`: **47 s**, reprovando no `vitest run tests/content` (primeiro passo do `build:pipeline`) | Plano 028, passos 4–5 |
| A Cloudflare não oferece notificação nativa de build (`available_alerts`, 30 grupos, nenhum de Workers Builds) | Plano 028, "Passo 0" e ADR-0011 |
| `.github/workflows/vigia-do-deploy.yml`: `schedule` diário (12:17 UTC) + `workflow_dispatch`, lê o check run `Workers Builds: haroldo-page`, reprova em falha ou check ausente >30 min | Arquivo `.github/workflows/vigia-do-deploy.yml` (lido diretamente) + ADR-0011 |
| E-mail do vigia chegou ao ADMIN em **menos de 1 min** (via `workflow_dispatch`) | Plano 028, passo 7 |
| Risco dos 60 dias de inatividade e como reativar (`Actions → Vigia do deploy → Enable workflow`) | ADR-0011, "Consequências" |
| Pendência do caminho `schedule` (nunca observado rodando; só `workflow_dispatch` provou detecção e e-mail) | Plano 028, "Critério não cumprido" e ADR-0011 |
| Portão de conteúdo (`tests/content/conteudo-valido.test.ts`) roda dentro do `build:pipeline`, antes do `wrangler deploy` | Plano 030, passo 9 (log do build `4b0d544e`) |
| `tina/tina-lock.json` — só `tinacms dev` o regenera; coerência agora verificada por `tests/content/tina-lock-coerente.test.ts` | Plano 031, "Contexto necessário" e passo 2 |
| `npm audit`: 8 moderadas restantes (5 via `react-router-dom`, 3 via `altair-express-middleware`), 0 `high` após subir o `wrangler` | Plano 032, passos 1, 2 e 4 |
| As 3 moderadas corrigíveis adiadas (`qs`, `body-parser`, `express`, `fixAvailable: true`) não corrigidas de propósito | Plano 032, "Achado da mesma medição" e ADR-0010 |
| `not_found_handling` não provado de fato: 404 de corpo vazio, sem `404.html` em `dist/` | Plano 025, "Duas coisas que NAO sao provadas por essas respostas", item 1 |
| Cinco avisos do painel consolidados em `docs/avisos-do-painel-para-o-manual.md` | Plano 033 |

Nenhum número usado no README ou nos READMEs de plano veio de estimativa ou de memória — todos
rastreiam à tabela acima.

### Passo 3 — `README.md`: seção "Deploy" reescrita e seção "Pipeline de publicação" nova

`--stat` do diff (após `npx prettier --write`):

```
$ git diff HEAD --stat -- README.md
 README.md | 116 +++++++++++++++++++++++++++++++++++++++++++++++++++++++++-----
 1 file changed, 107 insertions(+), 9 deletions(-)
```

A seção "Deploy" antiga dizia "Hoje o deploy é **manual**" e "o deploy automático ... só é ligado
na fase 2" — falso desde o plano 025 (2026-09-11). Reescrita: automático é o caminho normal,
`npm run deploy` fica como caminho manual de **emergência**, com a diferença de comando registrada
(`npm run build`, com cloud check, contra `npm run build:pipeline`, sem — ADR-0009). Seção nova
"Pipeline de publicação" responde às cinco perguntas do despacho, cada uma com número(s) da tabela
do passo 2, e inclui explicitamente a distinção CI × deploy (pergunta 2) e as quatro notas para
quem mantém o vigia (pergunta 4: desligamento por 60 dias, destinatário do e-mail, assunto do
e-mail que não nomeia o workflow, pendência do `schedule`).

**Releitura do `README.md` inteiro (verify do passo 3): afirmações que a fase 2 tornou falsas —
lista corrigida no ciclo 1 de revisão (ver seção própria abaixo).**

- **Seção "Deploy" (antiga)** — corrigida, dentro do escopo original deste plano.
- **Seção "Comandos", linha `npm run deploy`** — o revisor julgou que o `README.md` **inteiro**
  está em "Arquivos afetados" deste plano (não só as duas seções citadas no texto do Objetivo), e
  que a linha ficou defasada pela seção "Deploy" nova. Corrigida para
  `... — caminho manual de emergência (com cloud check — ver Deploy)`.
- **Seção "Qualidade"** — a sequência do CI citada (`npm ci → lint → format:check → test:coverage
  → build:pipeline`) **omitia o passo `npm audit --audit-level=high`** que o plano 032 acrescentou
  entre `npm ci` e `lint` (conferido contra `.github/workflows/ci.yml`). Falsa por omissão desde
  2026-09-12. Corrigida.
- **Seção "Estrutura de pastas"** — o comentário de `.github/workflows/` listava só os passos do
  `ci.yml` (e sem o audit). Hoje há **dois** workflows (`ci.yml` e `vigia-do-deploy.yml`, plano
  028) e o `ci.yml` ganhou o passo de audit (plano 032). Corrigida para citar os dois arquivos.
- **Seção "Estrutura de pastas", linha `content/ ← domínio do PROFESSOR (via painel, quando
  existir)`** — a frase "quando existir" é anterior à fase 2 (já estava assim desde antes do plano
  024) e não foi tornada falsa por esta fase: o painel já existe desde a fase 1, mas a conta
  EDITOR do professor ainda não (plano 027, migrado para a fase 5) — a ambiguidade é sobre *quem*
  usa o painel, não sobre a fase 2. **Reportado, não corrigido.**
- Nenhuma outra seção (Stack, Requisitos, Instalação, Painel de edição, Variáveis de ambiente,
  Troubleshooting) contém afirmação que a fase 2 tenha tornado falsa.

**Nota sobre esta lista:** na primeira passagem por este plano, os três achados marcados acima
como "corrigidos no ciclo 1" não tinham sido encontrados — a releitura do passo 3 tinha sido
parcial. O revisor os pegou e eles foram corrigidos nesta rodada; ver "Correções do ciclo 1 de
revisão" ao final desta Evidência.

### Passo 4 — §12 do PRD

Hunk real do `git diff -- PRD.md` para o checklist da fase 2 (item 5 marcado; itens 1–4
inalterados por este plano):

```diff
@@ -812,7 +813,14 @@ Legenda: ⬜ Não iniciada · 🟡 Em andamento · 🟢 Concluída · 🔴 Bloqu
 - [x] Variáveis de ambiente configuradas no Cloudflare e no GitHub — **metade do Cloudflare feita em 2026-09-11** (plano 025): `TINA_CLIENT_ID` e `PUBLIC_SITE_URL` como variáveis e `TINA_TOKEN` como segredo, em *Settings → Build → Build variables and secrets* — a seção de **build**, não a de runtime, que a plataforma recusa num Worker só de assets. **Metade do GitHub feita em 2026-09-04**, antecipada por necessidade: `TINA_CLIENT_ID` e `TINA_TOKEN` viraram secrets e o workflow passou a injetá-los no passo de build (`82fb4de`). Sem isso o CI estava vermelho desde o plano 015. A metade do Cloudflare continua desta fase
 - [x] `/admin` publicado e autenticando pelo TinaCloud em produção — **2026-09-11**, plano 026: login da conta ADMIN pelo TinaCloud (via GitHub) funciona em produção (RF-01); sem sessão o painel mostra só o modal de login e mais nada (RF-02); menu com as cinco coleções em vocabulário acadêmico (RF-03). Uma edição real salva pelo painel virou o commit `7ab84da` na `main`, que disparou o build `8aa9d0db` (`build_outcome: success`) e publicou a versão `4b948808`
 - [x] Notificação de falha de build chegando ao ADMIN (F-02) — **2026-09-12**, plano 028: a Cloudflare não notifica falha do Workers Builds, e o aviso vem de um vigia agendado no GitHub Actions (`vigia-do-deploy.yml`, ADR-0011). Experimento com o erro real do professor (`aulas: [ {} ]`, commit `b8e4560`): build `f9650b87` falhou nomeando arquivo e campo (F-09), o site seguiu na versão anterior durante 1h33 (RNF-04), o vigia reprovou e o e-mail chegou ao ADMIN em menos de 1 min. **Pendência nomeada:** a detecção foi exercitada por `workflow_dispatch`, porque o GitHub não executou o cron agendado na janela; o e-mail por execução `schedule` fica por observar (ADR-0011)
-- [ ] Documentação do pipeline no README
+- [x] Documentação do pipeline no README — plano 034: `README.md` ganha a seção "Pipeline de
+      publicação", respondendo cinco perguntas (o que acontece ao salvar, com os tempos medidos
+      nos planos 025/026/028; quem roda o quê e por que o CI não é portão do deploy, ADR-0009; onde
+      vive cada variável de ambiente; o que acontece quando o build falha, com o vigia do plano 028
+      e o ADR-0011; e como mudar o schema sem o cloud check do pipeline, ADR-0009/plano 031); a
+      seção "Deploy" reescrita — automático como caminho normal, `npm run deploy` como emergência,
+      com a diferença de comando registrada. `Status` do plano 034 permanece `TODO` até a promoção
+      do orquestrador
 
 > **Três itens migraram para a fase 5 em 2026-09-12** — usuário EDITOR criado e verificado contra a
 > matriz da §9 (dois itens, plano 027) e ciclo ponta a ponta cronometrado com o EDITOR (M-02, plano
```

Os itens 1–4 já estavam marcados por promoções anteriores (planos 025, 026, 028) — não toquei
neles, como o hunk mostra (linhas de contexto sem `+`/`-`). **Não há item 7 nesta fase** (ver
"Divergências", item 2) — nenhuma ressalva foi escrita porque não há linha para escrevê-la.

### Passo 5 — §0, §0.1 do PRD e a linha da fase 2 em `plans/README.md`

`git diff -- PRD.md plans/README.md`, completo (não só o `--stat`), colado nesta sessão:

```diff
diff --git a/PRD.md b/PRD.md
index c7fe9ca..c0cba29 100644
--- a/PRD.md
+++ b/PRD.md
@@ -12,9 +12,9 @@
 |---|---|
 | **Nome do projeto** | Site Pessoal Acadêmico — Prof. Haroldo C. D. Lima Junior (UFMA) |
 | **Codinome / sigla** | `haroldo-page` |
-| **Versão do PRD** | v0.1.30 |
+| **Versão do PRD** | v0.1.31 |
 | **Status** | 🟢 Aprovado |
-| **Estado da implementação** | Fase 0 🟢 **concluída** (14 planos) · Fase 1 🟢 **concluída** em 2026-09-10 — os oito planos (015–022) DONE, o 021 promovido em `7d5b7e6` com CI verde sobre `26de58a` · Fase 2 🟡 **em andamento** — fatiada em 12 planos (023–034) em 2026-09-10; 023, 024, 025 e **026** DONE — desde `ab0d1f8` (2026-09-11) um push na `main` publica sozinho no Worker, sem intervencao, e desde o commit `7ab84da` (2026-09-11) está provado que **o painel em produção é quem origina esse push**: login do ADMIN pelo TinaCloud, edição salva no `/admin`, build automático e versão nova publicada; o checklist da fase vai a **3/5**; o **030** e o **031** também estão DONE e **não** fecham item do §12 (como o 023) — o que eles entregam são os dois portões que faltavam: arquivo inválido em `content/` e `tina/tina-lock.json` defasado passam a reprovar no CI **e no build de deploy**, suíte em 122 testes. Em **2026-09-12** o escopo foi recortado por decisão do stakeholder (sabatina `recorte-sem-professor`): **tudo que exige uma sessão com o professor passa para a fase 5** — os planos **027** e **029** e os três itens de §12 correspondentes —, e o critério de conclusão da fase 2 no §6.2 passa a ser o ciclo do **ADMIN**, já demonstrado pelo 026. O **033** fechou em **2026-09-12** (`0c2bd02`), consolidando em `docs/avisos-do-painel-para-o-manual.md` o que o painel deixa o professor fazer de errado — sem fechar item do §12, como o 023, o 030 e o 031. O **032** fechou em **2026-09-12** (`b992282`): o CI passa a auditar dependências, reprovando em `high`/`critical` e relatando `moderate`, com o portão **nascendo verde** — o `wrangler` subiu de `4.128.0` para `4.131.1` e as três `high` deixaram de existir. O **028** fechou em **2026-09-12** (`5528ad6`), levando o checklist da fase a **4/5**: como a Cloudflare não notifica falha do Workers Builds, um vigia agendado no GitHub Actions lê o resultado do build de deploy e reprova quando ele falha, gerando e-mail ao ADMIN (ADR-0011). O experimento com a `main` quebrada de propósito provou build falho nomeando arquivo e campo, site no ar na versão anterior e e-mail em menos de 1 min, com uma pendência nomeada: o caminho agendado ainda não foi observado rodando. Resta na fase 2 o **034** · Fase 3 ⬜ **não iniciada e bloqueada na Q-04** (referências visuais, a fornecer pelo stakeholder) · Fases 4–5 ⬜ não iniciadas. Detalhe por item em §12; execução em `plans/README.md` |
+| **Estado da implementação** | Fase 0 🟢 **concluída** (14 planos) · Fase 1 🟢 **concluída** em 2026-09-10 — os oito planos (015–022) DONE, o 021 promovido em `7d5b7e6` com CI verde sobre `26de58a` · Fase 2 🟢 **concluída** em 2026-09-12 — fatiada em 12 planos (023–034) em 2026-09-10; 023, 024, 025 e **026** DONE — desde `ab0d1f8` (2026-09-11) um push na `main` publica sozinho no Worker, sem intervencao, e desde o commit `7ab84da` (2026-09-11) está provado que **o painel em produção é quem origina esse push**: login do ADMIN pelo TinaCloud, edição salva no `/admin`, build automático e versão nova publicada; o checklist da fase vai a **3/5**; o **030** e o **031** também estão DONE e **não** fecham item do §12 (como o 023) — o que eles entregam são os dois portões que faltavam: arquivo inválido em `content/` e `tina/tina-lock.json` defasado passam a reprovar no CI **e no build de deploy**, suíte em 122 testes. Em **2026-09-12** o escopo foi recortado por decisão do stakeholder (sabatina `recorte-sem-professor`): **tudo que exige uma sessão com o professor passa para a fase 5** — os planos **027** e **029** e os três itens de §12 correspondentes —, e o critério de conclusão da fase 2 no §6.2 passa a ser o ciclo do **ADMIN**, já demonstrado pelo 026. O **033** fechou em **2026-09-12** (`0c2bd02`), consolidando em `docs/avisos-do-painel-para-o-manual.md` o que o painel deixa o professor fazer de errado — sem fechar item do §12, como o 023, o 030 e o 031. O **032** fechou em **2026-09-12** (`b992282`): o CI passa a auditar dependências, reprovando em `high`/`critical` e relatando `moderate`, com o portão **nascendo verde** — o `wrangler` subiu de `4.128.0` para `4.131.1` e as três `high` deixaram de existir. O **028** fechou em **2026-09-12** (`5528ad6`), levando o checklist da fase a **4/5**: como a Cloudflare não notifica falha do Workers Builds, um vigia agendado no GitHub Actions lê o resultado do build de deploy e reprova quando ele falha, gerando e-mail ao ADMIN (ADR-0011). O experimento com a `main` quebrada de propósito provou build falho nomeando arquivo e campo, site no ar na versão anterior e e-mail em menos de 1 min, com uma pendência nomeada: o caminho agendado ainda não foi observado rodando. O **034** fechou a fase em **5/5** (🟢 concluída): `README.md` ganhou a seção "Pipeline de publicação" (as cinco perguntas, com números medidos dos planos 025/026/028) e a seção "Deploy" foi reescrita — automático como caminho normal, `npm run deploy` como emergência. Execução completa; `Status` do plano continua `TODO` até a promoção do orquestrador (mesmo padrão do plano 021 ao fechar a fase 1) · Fase 3 ⬜ **não iniciada e bloqueada na Q-04** (referências visuais, a fornecer pelo stakeholder) · Fases 4–5 ⬜ não iniciadas. Detalhe por item em §12; execução em `plans/README.md` |
 | **Autor(es)** | Desenvolvedor (`and.near@hotmail.com`) |
 | **Revisores / aprovadores** | Desenvolvedor (dono do produto); Professor (usuário-chave, valida a fase 5) |
 | **Data de criação** | 2026-09-01 |
@@ -57,6 +57,7 @@
 | v0.1.28 | 2026-09-12 | Desenvolvedor | **Plano 033 DONE** (`0c2bd02`): as descobertas sobre o painel deixam de viver espalhadas por Evidências de sete planos e por um README de fase. `docs/avisos-do-painel-para-o-manual.md` consolida **cinco avisos**, cada um com o que acontece / como reproduzir / contorno / o que o manual tem de dizer ao professor / quando revisar / origem citada arquivo por arquivo — insumo nomeado para `docs/manual-do-professor.md` (§10.5, fase 5) e para a sessão de treinamento da RNF-05. Os dois mais graves: (1) o painel **descarta edição em silêncio ao voltar de um subpainel**, com as duas manifestações finalmente distinguidas — o plano 020 viu a gravação do valor **antigo** com a tela mostrando o novo, o 021 viu a perda **visível** da edição com o `Save` desabilitando —, e o contorno do 022 nomeado: salvar sem sair do subpainel; (2) o painel **deixa salvar item de lista com subcampo obrigatório vazio**, o que **contradiz o F-01** ("o Tina bloqueia o salvamento e destaca o campo") para lista embutida — dito com todas as letras, porque o manual não pode prometer o que o painel não faz. Registra ainda a **decisão da fase 2 sobre a dívida 4**: ela **não é automatizável** — é a única dívida da fase 1 que atravessa **todo** o portão de qualidade com build, testes, lint e CI verdes, porque o conteúdo gravado é *válido*, só não é o que o professor quis, e nenhum teste distingue intenção. **Dívidas 3 e 4 da fase 1 quitadas.** O §12 **não muda** (fase 2 segue em **3/5**): como o 023, o 030 e o 031, este plano não fecha item do checklist. **Reprovado em dois ciclos de revisão, nenhum por defeito no documento** — o revisor abriu cada fonte citada e todas as conferências passaram já no primeiro ciclo: o ciclo 1 reprovou por a Evidência do plano não ter sido preenchida, e o ciclo 2 por o bloco de saída colado nela ser o da execução anterior (`740ms`, `git status` com um arquivo) em vez do reteste que validou o estado final (`708ms`, dois arquivos) — **o bloco errado veio da mensagem de despacho do orquestrador, não foi desvio do executor**. Suíte em 122 testes, cobertura 100%, sem alteração de código. CI `conclusion: success` no run 34695465499 **e** Workers Builds `success` no build `1fb6e0dd`, os dois sobre `0c2bd02` |
 | v0.1.29 | 2026-09-12 | Desenvolvedor | **Plano 032 DONE** (`b992282`, com a emenda em `fed445b`): o CI passa a **olhar** para as vulnerabilidades das dependências. Passo `npm audit --audit-level=high` entre `npm ci` e `npm run lint`, **sem `continue-on-error`** — um passo que nunca falha é decoração. Política escrita: **reprova em `high`/`critical`, relata `moderate`/`low`**, porque reprovar em `moderate` deixaria o CI vermelho para sempre por algo sem correção nossa, que é o modo de falha que já custou 14 commits a este projeto. **E o portão nasceu verde**, como o do 031: o plano foi **emendado pelo stakeholder em 2026-09-12** para subir antes o `wrangler` de `4.128.0` para `4.131.1` — não-major, `devDependency`, última publicada —, o que levou o audit de **11 vulnerabilidades (8 `moderate`, 3 `high`)** para **8 `moderate`, zero `high`**. As alternativas foram consideradas e **rejeitadas no ADR-0010**: *reprovar só em `critical`* afrouxaria o portão permanentemente por um problema com correção trivial, e *exceção nomeada e datada* criaria dívida de manutenção para algo que não precisa de exceção. **O mecanismo não era o que parecia, e a revisão obrigou a corrigi-lo:** o `sharp` **não saiu** do projeto — ele chega por `astro@7.2.10`, que é dependência de **produção** —; a cópia vulnerável era a aninhada sob `miniflare` (`0.35.2`, faixa `<0.35.4`), e o `wrangler` novo fez o `miniflare` **deduplicar** na cópia segura que já existia, removendo 27 pacotes do lock e adicionando zero. O argumento "é `devDependency`, não entra no Worker" vale para o **`wrangler`**; o que mantém o `sharp` fora do Worker é ser usado em **tempo de build** num site estático sem runtime de Node (D-01). **Falsificabilidade provada na mesma árvore:** `--audit-level=high` → exit 0, `--audit-level=moderate` → exit 1. O passo aparece **nominalmente no log do run 34705501376**, listando as moderadas com seus identificadores e passando assim mesmo — a informação não some, só deixa de reprovar. **Dívida 6 da fase 1 quitada.** O §12 **não muda** (fase 2 segue em **3/5**). **Reprovado em um ciclo de revisão, com três defeitos, todos de documentação e nenhum alcançável por teste:** o ADR não dizia o mecanismo real da correção; citava 2 advisories enquanto a Evidência **afirmava** citar 5; e o `README.md` atribuía as 8 moderadas a uma cadeia única quando são **duas** (5 via `react-router-dom`, 3 via `@tinacms/cli → altair-express-middleware`) — afirmação falsa que entrou **no mesmo parágrafo** que corrigia a afirmação falsa anterior ("`npm audit` em zero vulnerabilidades", verdadeira no plano 014 e falsa desde 2026-09-03). Correção registrada de passagem: das 8 moderadas, **5** não têm saída — o "fix" que o npm oferece é `major` **para trás**, `tinacms@1.5.5` quando o projeto está em 3.12.1 — e **3** (`qs`, `body-parser`, `express`) têm correção disponível e ficaram **deliberadamente de fora**, como pendência nomeada e datada no ADR-0010 |
 | v0.1.30 | 2026-09-12 | Desenvolvedor | **Plano 028 DONE** (`5528ad6`, com a emenda em `fee4e7f` e o vigia em `86a6370`): falha de build passa a chegar ao ADMIN. **O desenho mudou no primeiro passo:** a Cloudflare **não oferece** notificação de falha do Workers Builds — `alerting/v3/available_alerts` sem nenhum tipo de Workers Builds, painel conferido pelo ADMIN, e a documentação só oferece Event Subscriptions (Queue + Worker próprio). Decisão do stakeholder, emendada no plano e registrada no **ADR-0011**: `.github/workflows/vigia-do-deploy.yml` roda **uma vez por dia** e lê o check run `Workers Builds: haroldo-page` do commit mais recente da `main`, reprovando quando o build de deploy falhou ou quando o check falta há mais de 30 min (app GitHub ↔ Cloudflare desconectado, como no plano 025). Gatilho `schedule` e não `push` porque o e-mail de workflow agendado vai para quem alterou o cron por último, o ADMIN; o de `push` iria para quem empurrou, que num save do professor é o TinaCloud. Nenhum secret novo. **Experimento com o erro real do professor** (`aulas: [ {} ]`, commit `b8e4560`): build `f9650b87` falhou em 47 s no `vitest run tests/content` com `content/disciplinas/2025.1-mecanica-classica.md → campo 'aulas.0.numero': expected number` (**F-09**); o site seguiu `200` na versão `c3d2f67f`, igual à linha de base, durante 1h33 de `main` quebrada (**RNF-04**); o arquivo inválido ficou no repositório; o vigia reprovou e o e-mail chegou ao ADMIN em menos de 1 min (**F-02**); a reversão `8a246be` publicou a versão `b1c13465`. **§12 vai de 3/5 a 4/5** (item 4 da fase 2). **Pendência nomeada, aceita pelo stakeholder na promoção:** o cron foi trocado para `*/5` na janela e o GitHub **não executou nenhuma** execução agendada em ~90 min; detecção e e-mail foram provados por `workflow_dispatch`, cujo e-mail vai para quem dispara. O caminho `schedule` é regra documentada, não observada, e fecha quando o vigia aparecer rodando pelo agendamento e a primeira falha real gerar e-mail por ele. Riscos registrados no ADR-0011: workflow agendado em repositório público **desliga sozinho após 60 dias sem atividade**, e o assunto do e-mail do GitHub (`Run failed`) não diz qual workflow falhou. CI e Workers Builds `success` sobre `5528ad6` |
+| v0.1.31 | 2026-09-12 | Desenvolvedor | **Plano 034 — fecha a fase 2 em 5/5 (🟢 Concluída).** Execução completa (README.md, `plans/README.md`, `plans/fase-2-pipeline-de-publicacao/README.md` e este PRD); `Status` do plano permanece `TODO` até a promoção do orquestrador, o mesmo padrão do plano 021 ao fechar a fase 1. A seção "Deploy" do `README.md`, que ainda dizia que o deploy é **manual** e que o automático "só é ligado na fase 2", foi reescrita: automático é o caminho normal desde o plano 025, e `npm run deploy` fica documentado como caminho de emergência (`npm run build`, **com** cloud check — ADR-0009). Seção nova "Pipeline de publicação" responde cinco perguntas com números **medidos**, não estimados: (1) a cadeia painel→TinaCloud→`main`→Workers Builds→versão nova, com os tempos dos planos 025 (2m02s), 026 (2 s entre commit e início do build) e 028 (reversão em 1m59s, falha em 47s) — e a ressalva de que M-02 só é medida na fase 5; (2) CI e Workers Builds disparam em paralelo e o CI **não** é portão do deploy (ADR-0009); (3) onde vive cada variável (`.env`, secrets do GitHub Actions, *build variables* da Cloudflare — que são de build, não de runtime, achado do plano 025) e o que é segredo; (4) o comportamento medido no plano 028 quando o build falha (F-02/RNF-04) e o vigia agendado do plano 028 (ADR-0011), com os quatro avisos ao mantenedor (desligamento por 60 dias, destinatário do e-mail, assunto do e-mail que não nomeia o workflow, pendência do caminho `schedule`); (5) a ordem para mudar schema sem cloud check no pipeline, incluindo a regeneração do `tina-lock.json` e o teste do plano 031. **§12:** item 5 da fase 2 marcado; tabela de progresso da fase 2 para **5/5 · 🟢 Concluída**. O README da fase 2 ganhou a seção "O que a fase 2 empurra adiante, e as dívidas que ela criou", consolidando o que vai para a fase 3 (dívida 7b, renderização/M-02, e o achado do plano 025 de que o `not_found_handling` ainda não foi provado de fato — 404 de corpo vazio, sem `404.html`), o que vai para a fase 5 (avisos do plano 033, remedição de M-02, teste de restauração de conteúdo excluído, achados do plano 026, risco dos 60 dias do ADR-0011, assunto do e-mail que não nomeia o workflow) e as **quatro** dívidas novas sem fase atribuída (a pendência do caminho `schedule` do vigia; as três moderadas corrigíveis adiadas `qs`/`body-parser`/`express`, ADR-0010; a duplicação de `normalizeLinhaRelacionadaId`; e a imprecisão do cabeçalho de `conteudo-valido.test.ts`, as duas últimas achados do plano 030) — com **três** candidatas descartadas e o motivo escrito (o redirecionamento 307 do `/admin`; o aviso de troca de autenticação do TinaCloud; `linha_relacionada: 42` escapando do portão de conteúdo). **Divergência entre o corpo do plano e o recorte de 2026-09-12, registrada na Evidência do plano:** o corpo fala em oito itens e "onze" planos anteriores — o recorte já havia corrigido isso no cabeçalho do próprio plano para cinco itens e nove planos, e a v0.1.27 é a fonte |
 
 ---
 
@@ -767,7 +768,7 @@ Todo módulo `.ts` e componente `.astro` começa com:
 |---|---|---|
 | Fase 0 — Setup e provisionamento | 10/10 | 🟢 Concluída |
 | Fase 1 — Modelo de conteúdo | 10/10 | 🟢 Concluída |
-| Fase 2 — Pipeline de publicação | 4/5 | 🟡 Em andamento |
+| Fase 2 — Pipeline de publicação | 5/5 | 🟢 Concluída |
 | Fase 3 — Site público (PT) | 0/12 | ⬜ Não iniciada |
 | Fase 4 — Internacionalização | 0/8 | ⬜ Não iniciada |
 | Fase 5 — Polimento e entrega | 0/17 | ⬜ Não iniciada |
@@ -812,7 +813,14 @@ Legenda: ⬜ Não iniciada · 🟡 Em andamento · 🟢 Concluída · 🔴 Bloqu
 - [x] Variáveis de ambiente configuradas no Cloudflare e no GitHub — **metade do Cloudflare feita em 2026-09-11** (plano 025): `TINA_CLIENT_ID` e `PUBLIC_SITE_URL` como variáveis e `TINA_TOKEN` como segredo, em *Settings → Build → Build variables and secrets* — a seção de **build**, não a de runtime, que a plataforma recusa num Worker só de assets. **Metade do GitHub feita em 2026-09-04**, antecipada por necessidade: `TINA_CLIENT_ID` e `TINA_TOKEN` viraram secrets e o workflow passou a injetá-los no passo de build (`82fb4de`). Sem isso o CI estava vermelho desde o plano 015. A metade do Cloudflare continua desta fase
 - [x] `/admin` publicado e autenticando pelo TinaCloud em produção — **2026-09-11**, plano 026: login da conta ADMIN pelo TinaCloud (via GitHub) funciona em produção (RF-01); sem sessão o painel mostra só o modal de login e mais nada (RF-02); menu com as cinco coleções em vocabulário acadêmico (RF-03). Uma edição real salva pelo painel virou o commit `7ab84da` na `main`, que disparou o build `8aa9d0db` (`build_outcome: success`) e publicou a versão `4b948808`
 - [x] Notificação de falha de build chegando ao ADMIN (F-02) — **2026-09-12**, plano 028: a Cloudflare não notifica falha do Workers Builds, e o aviso vem de um vigia agendado no GitHub Actions (`vigia-do-deploy.yml`, ADR-0011). Experimento com o erro real do professor (`aulas: [ {} ]`, commit `b8e4560`): build `f9650b87` falhou nomeando arquivo e campo (F-09), o site seguiu na versão anterior durante 1h33 (RNF-04), o vigia reprovou e o e-mail chegou ao ADMIN em menos de 1 min. **Pendência nomeada:** a detecção foi exercitada por `workflow_dispatch`, porque o GitHub não executou o cron agendado na janela; o e-mail por execução `schedule` fica por observar (ADR-0011)
-- [ ] Documentação do pipeline no README
+- [x] Documentação do pipeline no README — plano 034: `README.md` ganha a seção "Pipeline de
+      publicação", respondendo cinco perguntas (o que acontece ao salvar, com os tempos medidos
+      nos planos 025/026/028; quem roda o quê e por que o CI não é portão do deploy, ADR-0009; onde
+      vive cada variável de ambiente; o que acontece quando o build falha, com o vigia do plano 028
+      e o ADR-0011; e como mudar o schema sem o cloud check do pipeline, ADR-0009/plano 031); a
+      seção "Deploy" reescrita — automático como caminho normal, `npm run deploy` como emergência,
+      com a diferença de comando registrada. `Status` do plano 034 permanece `TODO` até a promoção
+      do orquestrador
 
 > **Três itens migraram para a fase 5 em 2026-09-12** — usuário EDITOR criado e verificado contra a
 > matriz da §9 (dois itens, plano 027) e ciclo ponta a ponta cronometrado com o EDITOR (M-02, plano
```

```diff
diff --git a/plans/README.md b/plans/README.md
index a342ec7..8a654d7 100644
--- a/plans/README.md
+++ b/plans/README.md
@@ -12,7 +12,7 @@ Este arquivo é só o mapa.
 |---|---|---|---|
 | [`fase-0-setup-e-provisionamento/`](fase-0-setup-e-provisionamento/README.md) | 0 — Setup e provisionamento | 🟢 **Concluída** | 001–014, todos DONE |
 | [`fase-1-modelo-de-conteudo/`](fase-1-modelo-de-conteudo/README.md) | 1 — Modelo de conteúdo | 🟢 **Concluída** (critério do §6.2 demonstrado) | 015–022, todos DONE — o 021 promovido em `7d5b7e6`, com CI verde sobre `26de58a` |
-| [`fase-2-pipeline-de-publicacao/`](fase-2-pipeline-de-publicacao/README.md) | 2 — Pipeline de publicação ponta a ponta | 🟡 **Em andamento** | 023, 024, 025, 026, 030 e 031 DONE — o pipeline publica sozinho desde `ab0d1f8`, desde `7ab84da` está provado que o `/admin` em produção é quem origina o push, e desde `4343e42`/`1de5d1d` conteúdo inválido e `tina-lock.json` defasado reprovam no CI e no build de deploy. o **033** fechou em `0c2bd02` e o **032** em `b992282`, os dois com os pipelines verdes — o CI passa a auditar dependências, reprovando em `high`/`critical`. O **028** fechou em `5528ad6`: falha do build de deploy chega ao ADMIN por um vigia agendado no GitHub Actions (ADR-0011), com uma pendência nomeada. **Resta o 034**, que fecha a fase em 5/5 |
+| [`fase-2-pipeline-de-publicacao/`](fase-2-pipeline-de-publicacao/README.md) | 2 — Pipeline de publicação ponta a ponta | 🟢 **Concluída (5/5)** | 023, 024, 025, 026, 030 e 031 DONE — o pipeline publica sozinho desde `ab0d1f8`, desde `7ab84da` está provado que o `/admin` em produção é quem origina o push, e desde `4343e42`/`1de5d1d` conteúdo inválido e `tina-lock.json` defasado reprovam no CI e no build de deploy. o **033** fechou em `0c2bd02` e o **032** em `b992282`, os dois com os pipelines verdes — o CI passa a auditar dependências, reprovando em `high`/`critical`. O **028** fechou em `5528ad6`: falha do build de deploy chega ao ADMIN por um vigia agendado no GitHub Actions (ADR-0011), com uma pendência nomeada. **O 034 documentou o pipeline no README e fechou o checklist da fase em 5/5** — execução completa; `Status` do plano continua `TODO` até a promoção do orquestrador |
 | `fase-3-site-publico/` | 3 — Site público em português | 🔴 **Bloqueada** | não fatiada — **a Q-04 (referências visuais) continua aberta** e o §16 proíbe começar fase que dependa de questão aberta. O stakeholder fornecerá as referências |
 | `fase-4-internacionalizacao/` | 4 — Internacionalização | ⬜ Não iniciada | — |
 | [`fase-5-polimento-e-entrega/`](fase-5-polimento-e-entrega/README.md) | 5 — Polimento e entrega | ⬜ Não iniciada | não fatiada; já contém os planos **027** e **029**, migrados da fase 2 em 2026-09-12 |
```

Sem alteração fora do previsto: as únicas mudanças em `PRD.md` são a `Versão do PRD` (v0.1.30 →
v0.1.31), a linha `Estado da implementação`, a linha nova de `§0.1` (v0.1.31), a tabela de
progresso do §12 (4/5 🟡 → 5/5 🟢) e o item 5 do checklist da fase 2 (hunk do passo 4). `Status`
continua `🟢 Aprovado` — confirmado no diff (a linha `| **Status** | 🟢 Aprovado |` não aparece no
diff, prova de que não mudou). Em `plans/README.md`, só a linha da fase 2 na tabela de fases mudou.

### Passo 6 — `plans/fase-2-pipeline-de-publicacao/README.md`

`git diff HEAD --stat -- plans/fase-2-pipeline-de-publicacao/README.md`, rodado agora, no ciclo 4, depois de todas as correções dos ciclos 1 e 2 (inclusive a A1 do ciclo 2, que acrescentou duas linhas ao primeiro hunk abaixo, deslocando o cabeçalho do segundo):

```
$ git diff HEAD --stat -- plans/fase-2-pipeline-de-publicacao/README.md
 plans/fase-2-pipeline-de-publicacao/README.md | 83 ++++++++++++++++++++++++++-
 1 file changed, 80 insertions(+), 3 deletions(-)
```

Dois hunks, e é isso — nada além do que segue foi tocado neste arquivo:

1. **Um hunk de inserção pura** (76 linhas, `@@ -192,6 +192,82 @@`), antes da seção "O que esta fase não consegue provar":
   a seção nova **"O que a fase 2 empurra adiante, e as dívidas que ela criou"**, consolidando:

   - **Para a fase 3:** a dívida 7(b) (já na tabela "Herdado da fase 1"), a renderização que falta
     para M-02 ser verificável, e o achado **`not_found_handling`** do plano 025 (404 de corpo
     vazio, sem `404.html`).
   - **Para a fase 5:** os avisos do plano 033 como insumo do manual, a remedição de M-02, o teste
     de restauração de conteúdo excluído (§9), os dois achados do plano 026 e o risco dos 60 dias
     do ADR-0011, mais **o assunto do e-mail que não nomeia o workflow** (achado do plano 028,
     acrescentado no ciclo 1 de revisão — ver abaixo).
   - **Dívidas novas sem fase específica**, agora com os **três achados do plano 030 absorvidos**
     (não estavam na primeira passagem por este plano — o revisor pegou a omissão no ciclo 1):
     a pendência do caminho `schedule` do vigia (ADR-0011); as três moderadas `qs`/`body-parser`/
     `express` (ADR-0010, sem gatilho de revisão específico — corrigido no ciclo 1, ver abaixo); a
     **duplicação de `normalizeLinhaRelacionadaId`** (`src/content.config.ts` não a exporta, o
     teste reimplementa as regexes), com destino "exportar e importar no teste"; e a **imprecisão
     do cabeçalho de `conteudo-valido.test.ts`** (atribui a dívida 7c ao arquivo errado), com
     destino "corrigir de passagem no próximo toque".
   - **Consideradas e descartadas, com o motivo** — agora com um terceiro item absorvido do plano
     030: `linha_relacionada: 42` escapando do portão, descartado porque o campo é `reference` no
     Tina e só grava string (inalcançável pelo caminho do produto).

   A tabela de estado (nove planos + o 034) **não foi tocada** — não está nas linhas `+`/`-` do
   diff.

2. **Um segundo hunk, dentro da seção "O que esta fase não consegue provar"** — que na primeira
   passagem por este plano eu **não tinha tocado** (a Evidência anterior dizia que sim; era falso,
   o revisor conferiu contra o diff e pegou). Corrigido agora, de fato:

   ```diff
   @@ -207,9 +283,10 @@ save no /admin  →  commit na main  →  build automático  →  versão nova p
    
    com cada elo provado por artefato (SHA do commit do painel, o mesmo SHA no log da Cloudflare, id
    da versão publicada, resposta HTTP). **O último elo — "o texto novo aparece na página" — fica para
   -a fase 3**, e M-02 é remedida na fase 5, como o próprio PRD agenda em §3.3 ("quando medir: fases 2
   -e 5"). Isso é uma limitação **declarada**, não um atalho: os planos 029 e 034 são obrigados a
   -escrevê-la, e o item 7 do §12 só pode ser marcado com a ressalva na própria linha.
   +a fase 3**, e M-02 é medida só na **fase 5** (PRD, §3.3, coluna "Quando medir": `Fase 5`, desde o
   +recorte de 2026-09-12) — não mais nesta fase. Isso é uma limitação **declarada**, não um atalho:
   +este README e o plano 034 são obrigados a escrevê-la; a medição em si é do plano 029, migrado
   +inteiro para a fase 5 junto com o item correspondente do §12 (que deixou de existir nesta fase).
    
    ## Por onde isto pode dar errado
    
   ```
   O parágrafo antigo citava "fases 2 e 5" (o PRD, §3.3, diz hoje só `Fase 5`), "os planos 029 e
   034 são obrigados a escrevê-la" (só o 034 documenta a limitação; quem mede é o 029) e "o item 7
   do §12" (não existe mais nesta fase desde o recorte de 2026-09-12). As três desatualizadas pelo
   recorte, corrigidas.

**Correção da afirmação anterior desta Evidência:** eu tinha escrito que "não encontrei nenhuma
outra dívida nova além das listadas" e que tinha "acrescentado ao final da seção 'O que esta fase
não consegue provar' uma frase apontando para a nova seção" — as duas frases eram falsas. A
primeira porque os três achados do plano 030 (duplicação, valor não-textual, imprecisão de
cabeçalho) não tinham sido absorvidos; a segunda porque o diff da sessão anterior não tocava
aquela seção — eu descrevi uma edição que não fiz. Ambas corrigidas nesta rodada: os três achados
do 030 estão listados acima, e a seção "não consegue provar" foi de fato reescrita (hunk colado
acima), não só "apontada".

**Nota do ciclo 4:** o `--stat` e o cabeçalho do segundo hunk colados acima estavam desatualizados — eram de antes da correção A1 do ciclo 2, que reescreveu o item do assunto do e-mail em "Para a fase 5", **dentro do primeiro hunk** (a seção "O que a fase 2 empurra adiante"), não do segundo. Esse acréscimo mudou o `--stat` e deslocou o cabeçalho do segundo hunk de `+281` para `+283`, sem mudar o conteúdo dele. Regenerados agora por comando (`git diff HEAD --stat` / `git diff HEAD`, ambos sobre `plans/fase-2-pipeline-de-publicacao/README.md`), não digitados: **83 linhas, 80 inserções, 3 remoções**; primeiro hunk `@@ -192,6 +192,82 @@` (76 linhas inseridas); segundo hunk `@@ -207,9 +283,10 @@`, conteúdo idêntico ao que já estava colado.

### Correções do ciclo 1 de revisão (2026-09-12)

Reprovado no ciclo 1 com **oito correções bloqueantes**, todas de documento contra fonte. Aplicadas
nesta mesma sessão, sem tocar em arquivo fora da lista original; nada commitado.

1. **PRD.md, §0 "Estado da implementação"** — abria com "Fase 2 🟡 **em andamento**" e fechava
   dizendo que o 034 tinha fechado a fase em 5/5. Corrigido para "Fase 2 🟢 **concluída** em
   2026-09-12", como o precedente do plano 021 fez para a fase 1.
2. **README da fase, "Achados do plano 030 que o 034 tem de absorver"** — os três achados não
   tinham sido absorvidos na seção nova. Os três agora estão lá, com destino: (a) a duplicação de
   `normalizeLinhaRelacionadaId` vai para "Dívidas novas sem fase específica"; (b)
   `linha_relacionada: 42` vai para "Consideradas e descartadas", com o motivo (campo `reference`,
   só grava string); (c) a imprecisão do cabeçalho de `conteudo-valido.test.ts` vai para "Dívidas
   novas", com destino "corrigir de passagem". Ver Passo 6.
3. **README da fase, "O que esta fase não consegue provar"** — citava "fases 2 e 5" (PRD:138 hoje
   diz só `Fase 5`), "os planos 029 e 034 são obrigados a escrevê-la" e "o item 7 do §12". Reescrito
   refletindo o recorte — hunk colado no Passo 6. **Correção adicional:** a Evidência anterior
   afirmava ter feito essa edição e não tinha; corrigida para descrever só o que o diff mostra.
4. **README.md, três afirmações que a fase 2 tornou falsas, deixadas para trás:** a sequência de
   CI em "Qualidade" omitia `npm audit --audit-level=high`; o comentário de `.github/workflows/`
   em "Estrutura de pastas" só citava o `ci.yml` (hoje há também `vigia-do-deploy.yml`); a linha
   `npm run deploy` da tabela "Comandos" ficou defasada pela seção "Deploy" nova. As três
   corrigidas — ver Passo 3.
5. **README da fase, dívida das 3 moderadas** — o gatilho "revisitar se a severidade subir..." não
   existe no ADR-0010; substituído pelo motivo real do ADR-0010 (churn de lockfile do
   `npm audit fix`, escopo especulativo dentro de um plano que já mexia em dependência), e "datada"
   trocado pela data real (2026-09-12).
6. **README da fase, lista "Para a fase 5"** — acrescentado o achado do plano 028 de que o assunto
   do e-mail do GitHub não nomeia o workflow (CI e vigia chegam com o mesmo `Run failed`); também
   acrescentado como quarto item da lista de diagnóstico da pergunta 4 em `README.md`.
7. **Evidência do 034** — Passo 4 dizia "`git diff` já mostrado acima" sem ter mostrado; colado o
   hunk real. Passo 5 dizia "íntegro, colado" tendo colado só o `--stat`; colados os dois diffs
   completos. `git status --short` final rerrodado depois de todas as correções (ver abaixo — 5
   arquivos, não 4, porque o próprio plano também está modificado).
8. **README.md, pergunta 3 da seção "Pipeline de publicação"** — "`TINA_CLIENT_ID` e `TINA_TOKEN`,
   configurados em `82fb4de`" dava a entender que o secret se configura por commit. Corrigido para
   "injetados no passo de build do `ci.yml` desde `82fb4de`", como o PRD (§12) já descrevia.

### Correções do ciclo 2 de revisão (2026-09-12)

Reprovado no ciclo 2 com **quatro correções bloqueantes**. Seis dos oito itens do ciclo 1 foram
confirmados como corrigidos. Ordem seguida: primeiro as edições de conteúdo (A1–A3), depois os
blocos de diff da Evidência, gerados a partir da saída real dos comandos (B1–B3), nunca digitados
à mão.

**A1 — `README.md`, pergunta 4, item do assunto do e-mail.** Dizia "medido no plano 028" para os
dois e-mails (CI e vigia). A ressalva de promoção do plano 028 diz que remetente e assunto exatos
só foram transcritos para o e-mail do **CI**; para o do vigia, o ADMIN transcreveu horário e o
trecho do corpo ("Vigia do deploy: All jobs have failed"), e o assunto `Run failed` é **inferido**
pela forma do e-mail do CI, não medido. Reescrito nos dois lugares — `README.md` (lista de
diagnóstico da pergunta 4) e o item equivalente em "Para a fase 5" do README da fase — para dizer
isso com essa distinção, sem "medido".

**A2 — `PRD.md`, linha v0.1.31 do §0.1.** Recontei os dois READMEs no estado atual, não confiei nos
números do despacho nem nos meus:

- avisos ao mantenedor em `README.md` (lista da pergunta 4): **4** (desligamento por 60 dias,
  destinatário do e-mail, assunto do e-mail — corrigido por A1 —, pendência do `schedule`). A linha
  dizia "três avisos".
- dívidas novas sem fase atribuída no README da fase: **4** (pendência do `schedule`, ADR-0011; as
  três moderadas, ADR-0010; a duplicação de `normalizeLinhaRelacionadaId`; a imprecisão do
  cabeçalho de `conteudo-valido.test.ts`). A linha dizia "a pendência ... e as três moderadas", ou
  seja, contava só 2.
- candidatas descartadas: **3** (redirecionamento 307; anúncio de autenticação do TinaCloud;
  `linha_relacionada: 42`). A linha dizia "duas".
- a lista da fase 5 na linha do changelog agora inclui o assunto do e-mail que não nomeia o
  workflow.

Os quatro números corrigidos na linha `v0.1.31` do §0.1 (ver o diff do Passo 5 — a linha inteira é
uma inserção, então o diff mostra o texto corrigido por inteiro, não um trecho isolado).

**A3 — Evidência, Passo 3.** "as três notas para quem mantém o vigia" corrigido para "as quatro
notas", com o item do assunto do e-mail nomeado.

**B1 — Passo 5.** Os dois blocos de diff foram gerados por
`git diff HEAD -- PRD.md plans/README.md`, redirecionado para um arquivo em
`C:\Users\andne\AppData\Local\Temp\claude\S--Projetos-academic-page-haroldo\61d10e59-4be4-4d8c-b962-6f7d003843e8\scratchpad\passo5.diff`,
e inserido no arquivo do plano por um script Python
(`~/anaconda3/python.exe`, mesmo diretório, `patch_plan034.py`) que leu o `.md`, localizou os dois
blocos antigos por âncora de texto e os substituiu pelo conteúdo do arquivo gerado — sem
redigitação. Conferido depois: `git diff HEAD -- PRD.md plans/README.md` rodado de novo
(`passo5_recheck.diff`) e comparado byte a byte com o `passo5.diff` original — `diff` entre os dois
não imprimiu nenhuma linha, confirmando que o bloco colado é idêntico à saída real e que nada
mudou entre a geração e a conferência.

**B2 — Passo 3.** O `--stat` antigo (102/97/5) era de antes das correções dos dois ciclos. Gerado
de novo por `git diff HEAD --stat -- README.md` (mesmo script), depois de A1 e de todas as outras
edições em `README.md`: **116 linhas, 107 inserções, 9 remoções**.

**B3 — Passo 4.** O hunk do §12 foi extraído programaticamente do mesmo `git diff HEAD -- PRD.md`
que alimenta o Passo 5 (isolado por regex no script, procurando o trecho que começa em
`@@ -812,`), não copiado à mão — por isso os dois hunks (o do Passo 4 isolado e o embutido no diff
completo do Passo 5) são idênticos.

### Passo 7 — sequência de qualidade local (reteste do ciclo 2, depois de A1–A3 e B1–B3)

`npm run lint`:

```
> haroldo-page@0.1.0 lint
> eslint .
```

(sem saída — sem erros)

`npm run format:check`:

```
> haroldo-page@0.1.0 format:check
> prettier --check .

Checking formatting...
All matched files use Prettier code style!
```

`npm run test:coverage`:

```
> haroldo-page@0.1.0 test:coverage
> vitest run --coverage


 RUN  v4.1.11 S:/Projetos/academic_page/haroldo
      Coverage enabled with v8


 Test Files  6 passed (6)
      Tests  122 passed (122)
   Start at  20:16:14
   Duration  933ms (transform 1.45s, setup 0ms, import 2.44s, tests 81ms, environment 0ms)

 % Coverage report from v8
-------------------|---------|----------|---------|---------|-------------------
File               | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s
-------------------|---------|----------|---------|---------|-------------------
-------------------|---------|----------|---------|---------|-------------------

=============================== Coverage summary ===============================
Statements   : 100% ( 32/32 )
Branches     : 100% ( 4/4 )
Functions    : 100% ( 2/2 )
Lines        : 100% ( 31/31 )
================================================================================
```

Sem mudança de código nesta sessão — 122 testes, 6 arquivos, cobertura 100%, idêntico ao estado
herdado do plano 033. (Duração e horário divergem dos blocos das rodadas anteriores desta
Evidência, como esperado de um reteste — 933ms/20:16:14 aqui.)

`npm run build` (lido por inteiro — nenhuma linha `[ERROR]` no corpo, `astro check` com 0
erros/0 avisos/0 hints; este plano não muda schema, então fecha verde sem depender de push):

```
> haroldo-page@0.1.0 build
> tinacms build && astro check && astro build

Starting Tina build

Checking indexing process in TinaCloud...

○  Tina build complete
│  🦙 Tina Config
│     API url:            https://content.tinajs.io/2.4/content/8be98053-68c3-4262-b7bd-dd1286e1c7ad/github/main
│  🤖 Auto-generated files
│     GraphQL Client:     tina/__generated__/client.ts
│     Typescript Types:   tina/__generated__/types.ts
│     Static HTML file:   public/admin/index.html
├────────────────────────────────────────────────────────────────
20:16:46 [content] Syncing content
20:16:46 [content] Synced content
20:16:46 [types] Generated 398ms
20:16:46 [check] Getting diagnostics for Astro files in S:\Projetos\academic_page\haroldo...
Result (19 files):
- 0 errors
- 0 warnings
- 0 hints

20:16:52 [content] Syncing content
20:16:52 [content] Synced content
20:16:52 [types] Generated 410ms
20:16:52 [build] output: "static"
20:16:52 [build] mode: "static"
20:16:52 [build] directory: S:\Projetos\academic_page\haroldo\dist\
20:16:52 [build] Collecting build info...
20:16:52 [build] ✓ Completed in 443ms.
20:16:52 [build] Building static entrypoints...
20:16:52 [vite] ✓ built in 170ms
20:16:52 [vite] ✓ built in 42ms
20:16:52 [build] Rearranging server assets...

 generating static routes
20:16:52   ├─ /index.html (+8ms)
20:16:52 ✓ Completed in 18ms.

20:16:52 [build] ✓ Completed in 261ms.
20:16:52 [build] 1 page(s) built in 712ms
20:16:52 [build] Complete!
```

### `git status --short` ao final (antes de qualquer `git add`, depois do ciclo 2 de correções)

```
 M PRD.md
 M README.md
 M plans/README.md
 M plans/fase-2-pipeline-de-publicacao/034-documentacao-do-pipeline-e-fechamento-da-fase-2.md
 M plans/fase-2-pipeline-de-publicacao/README.md
```

Cinco arquivos: os quatro da lista de "Arquivos afetados" do plano, mais o próprio arquivo do
plano (recebendo esta Evidência e os checkboxes) — o mesmo padrão que os planos 024 e 032
registraram ao final das suas Evidências. Nenhum arquivo de código, teste, schema ou workflow foi
tocado.

### O que não foi rodado nesta sessão

- **CI do GitHub Actions** — nada foi commitado nem empurrado (regra de despacho: quem commita é o
  orquestrador). O critério correspondente fica com a caixa vazia, de propósito.
