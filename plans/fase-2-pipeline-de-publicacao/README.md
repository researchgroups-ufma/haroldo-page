# Planos da Fase 2 — Pipeline de publicação ponta a ponta

> Mapa de execução dos planos atômicos. **Atualize a tabela de estado a cada plano fechado.**
> A fonte de verdade do que cada plano faz é o próprio arquivo `NNN-*.md`; a do que já foi feito
> é o campo `Status:` de cada um. Este arquivo existe para o que não cabe em nenhum dos dois: a
> ordem, o paralelismo e as armadilhas.

Última atualização: 2026-09-12 (fase concluída — plano 034 DONE)

**Critério de conclusão da fase** (§6.2 do PRD, **reescrito em 2026-09-12**): *um usuário **ADMIN**
edita no `/admin` em produção e a mudança é publicada sozinha, com cada elo provado por artefato.*
Como na fase 1, o critério não é "os testes passam" — é exercitar o ciclo real, e ele **já foi
demonstrado pelo plano 026**. **Leia antes a ressalva da seção "O que esta fase não consegue
provar"**: não existe página que renderize conteúdo até a fase 3, e isso muda o que a palavra
"publicada" pode significar aqui.

> **O critério anterior era o do EDITOR** — *"um usuário EDITOR edita no `/admin` em produção e a
> mudança aparece no site sem intervenção do ADMIN (M-02)"* —, e **ele não desapareceu: virou o
> critério da fase 5**, junto com os planos **027** e **029** e com os itens 4, 5 e 7 do §12 desta
> fase. Decisão do stakeholder em 2026-09-12, registrada em
> `docs/sabatinas/CHANGELOG_sabatina_recorte-sem-professor.md` (4 decisões): tudo que exige uma
> sessão com o professor passa para a fase 5, que já reservava essa sessão para o treinamento e a
> validação assistida. **Nenhum requisito mudou — só onde ele é verificado.** A fase 2 passa de 8
> para 5 itens no §12.

## Estado

| Plano | Título | Status | Executável por | Agente | Commits |
|---|---|---|---|---|---|
| 023 | Abertura da fase 2: reconciliação do estado documental | ✅ DONE | agente | implementer (haiku) | `ae1bbc8` |
| 024 | Comando de build dos pipelines e o cloud check do TinaCloud | ✅ DONE | agente | implementer | `f8f416a` |
| 025 | 🧑 Workers Builds ligado ao repositório e variáveis no Cloudflare | ✅ DONE | orquestrador | nenhum | `954215c`, `ab0d1f8` |
| 026 | 🧑 `/admin` publicado e autenticando pelo TinaCloud em produção | ✅ DONE | orquestrador | nenhum | `7ab84da` (edição do painel) |
| 028 | 🧑 Notificação de falha de build ao ADMIN, com falha real | ✅ DONE | orquestrador | nenhum | `fee4e7f` (emenda), `86a6370`, `5528ad6` |
| 030 | Portão de conteúdo no CI: `content/` validado e referência resolvida | ✅ DONE | agente | implementer (sonnet) | `4343e42` |
| 031 | Coerência do `tina-lock.json` verificada no CI | ✅ DONE | agente | implementer (sonnet) | `1de5d1d` |
| 032 | `npm audit` no CI e política de severidade | ✅ DONE | agente | implementer (sonnet) | `fed445b` (emenda), `b992282` |
| 033 | Avisos do painel para o manual da fase 5 | ✅ DONE | agente | implementer (sonnet) | `0c2bd02` |
| 034 | Documentação do pipeline no README e fechamento da fase 2 | ✅ DONE | agente (+ orquestrador) | implementer (sonnet) | `ef7f258` |
| 035 | Correções da revisão de integração da fase 2 | ⬜ TODO | agente | implementer | — |

**Numeração é global e contínua e não é ordem de execução** — precedentes registrados: o plano 014
rodou depois de a fase 0 fechar, e o 022 rodou antes do 021. A ordem desta fase está abaixo.

> **Os planos 027 e 029 não estão mais nesta fase.** Estavam bloqueados no professor desde
> 2026-09-11 — o convite do TinaCloud nunca foi criado, então a segunda vaga do plano gratuito
> continua livre e nada foi alterado lá. Em **2026-09-12** o stakeholder decidiu migrá-los para
> `../fase-5-polimento-e-entrega/`, com o número preservado; os passos de orquestrador do 027 que
> não dependem do professor (8 e 9) continuam executados e registrados na Evidência do plano.
> **Nenhum plano restante nesta fase depende de gente.** O 028, o último que dependia, fechou em
> 2026-09-12.

## Ordem de execução

```
023  →  024  →  025  →  026            (os quatro DONE)
                 │
                 └→ 028   (depois também de 030, DONE)

030 ∥ 031 ∥ 033   (a qualquer momento depois do 024; o 030 depende dele por package.json)
032               (depois do 024, por ci.yml)

034  ←  todos
```

**A espinha era serial e não tinha atalho:** não se verifica o `/admin` em produção (026) antes de
existir build automático que o publique (025). Os dois elos que sobravam — convidar o professor
(027) e cronometrar o ciclo com ele (029) — **saíram da fase em 2026-09-12** e passaram a abrir a
fase 5, onde o 029 continua dependendo do 028 desta fase.

**Não resta nada.** O **033** (`0c2bd02`), o **032** (`b992282`), o **028** (`5528ad6`) e o **034**
(`ef7f258`) fecharam em 2026-09-12, e a fase está concluída em 5/5.

> **O 028 mudou de desenho no primeiro passo.** A Cloudflare não oferece notificação de falha do
> Workers Builds; o aviso vem de `.github/workflows/vigia-do-deploy.yml`, um workflow **agendado**
> (uma vez por dia) que lê o check run do build de deploy e reprova quando ele falha. Agendado, e
> não por `push`, porque o e-mail de um workflow agendado vai para quem alterou o cron por último;
> o de `push` iria para o TinaCloud num save do professor. **Pendência nomeada:** o GitHub não
> executou o cron na janela do experimento, e o e-mail por execução `schedule` fica por observar.
> **Risco para o 034 documentar:** o vigia desliga sozinho após 60 dias sem commit. Ver ADR-0011.

> **O bloqueio do 032 foi resolvido em 2026-09-12 e o plano fechou.** O `npm audit` reportava
> `11 vulnerabilities (8 moderate, 3 high)`, não as 8 moderadas que a fase 1 registrou, e a política
> escrita no plano — reprova em `high`/`critical` — deixaria o CI vermelho no primeiro push. O
> stakeholder escolheu **subir o `wrangler`** (`4.128.0 → 4.131.1`, não-major, `devDependency`,
> última publicada) em vez de reprovar só em `critical` ou registrar exceção datada: o portão nasce
> verde sem afrouxamento. **O mecanismo não era o que parecia** — o `sharp` não saiu do projeto; ele
> vem do `astro`, que é **produção**, e o que mudou foi o `miniflare` novo deduplicar na cópia
> `0.35.4` já presente em vez de instalar a sua, `0.35.2`, vulnerável. Ver ADR-0010.

### O que pode rodar em paralelo, e o que não pode

| Par | Pode? | Motivo |
|---|---|---|
| 030 ∥ 031 | ✅ | escopos disjuntos: o 030 mexe em `conteudo-valido.test.ts`, `paridade-schema.test.ts` e `package.json`; o 031 em `tina-lock-coerente.test.ts` e `README.md` |
| 030 ∥ 033 | ✅ | o 033 só cria `docs/avisos-do-painel-para-o-manual.md` |
| 031 ∥ 033 | ✅ | idem |
| 024 ∥ 030 | ❌ | **os dois editam `package.json`/`package-lock.json`** — conflito de lockfile, a restrição que a fase 0 aprendeu nos planos 002/004/005/007 |
| 024 ∥ 032 | ❌ | os dois editam `.github/workflows/ci.yml` |
| 031 ∥ 032 ∥ 024 ∥ 034 | ❌ entre si | **os quatro editam `README.md`**, em seções diferentes. Agentes em paralelo compartilham o mesmo working tree; serialize |
| 025/026/028 entre si | ❌ | são serial por dependência lógica, não por arquivo |
| qualquer plano ∥ 028 | ❌ | o 028 quebra a `main` de propósito; outro push durante a janela do experimento confunde qual commit derrubou o build |

**A última linha é a mais fácil de esquecer.** Enquanto o plano 028 estiver com a `main` quebrada
de propósito, ninguém mais empurra nada. A restrição equivalente do plano 029 — `main` congelada
durante as 10 medições de M-02 — **foi junto com ele para a fase 5**, e é uma das razões da
migração: congelar a `main` agora, às vésperas da fase 3, sairia caro.

## Herdado da fase 1 — onde cada uma das sete dívidas caiu

A lista de partida é a seção "O que a fase 1 empurra para a fase 2" do
[README da fase 1](../fase-1-modelo-de-conteudo/README.md), a partir da linha 301. Nenhuma das
sete ficou sem tratamento; três decisões foram tomadas no fatiamento e estão escritas nos planos
correspondentes.

| # | Dívida | Onde cai | Decisão |
|---|---|---|---|
| 1 | Acoplamento com o TinaCloud no build (`ERR_CLOUD_CHECK_FAILED` sem humano para ordenar os passos) | **024** (+ ADR-0009), verificada em **025** e **026** | Os dois pipelines automáticos rodam `tinacms build --skip-cloud-checks`; o `npm run build` local **mantém** o cloud check e continua sendo o portão pré-push de quem mexe em schema |
| 2 | `tina-lock.json` versionado, regenerado só por `tinacms dev` | **031** ✅ **quitada em 2026-09-11** (`1de5d1d`) | Virou verificação de CI: `tests/content/tina-lock-coerente.test.ts` compara a árvore declarativa do config contra `schema.collections` do lock — **109 caminhos qualificados**, com `type`, `required`, `list`, `options` e `collections` —, sem rodar o dev server. O lock em `main` já estava coerente: o portão nasceu verde |
| 3 | Mensagem de erro de build legível (F-09, R-01) e o subcampo obrigatório vazio que o painel deixa salvar | **028** (notificação + mensagem real medida) e **033** (o que o manual da fase 5 tem de dizer) | O portão do **030** é quem produz a mensagem no formato de F-09; o 028 demonstra que ela chega ao ADMIN |
| 4 | O painel grava conteúdo errado sem quebrar nada (duas manifestações) | **033** | **Não é automatizável** — o conteúdo gravado é *válido*, só não é o que o usuário quis; nenhum teste distingue intenção. Vira **aviso obrigatório do manual da fase 5**, com a entrega nomeada em `docs/avisos-do-painel-para-o-manual.md` |
| 5 | `astro check` reporta `[ERROR] [content]` e sai com exit 0 | **030** ✅ **quitada em 2026-09-11** (`4343e42`) | Virou portão de verdade: `tests/content/conteudo-valido.test.ts` valida os arquivos reais de `content/` **e resolve as referências** — porque `safeParse` sozinho aceita `linha_relacionada: ''`. Roda no CI **e dentro do build de deploy**, provado nominalmente no log do build `4b0d544e` |
| 6 | `npm audit` com 8 moderadas de `react-router`, sem correção nossa | **032** (+ ADR-0010) | O CI passa a auditar, reprovando em **`high`/`critical`** e relatando `moderate`. Reprovar em `moderate` deixaria o CI vermelho para sempre — o modo de falha que já custou 14 commits a este projeto |
| 7 | Três buracos do teste de paridade | **030** (a e c) ✅ **quitadas em 2026-09-11** (`4343e42`); **(b) não** | (a) o `path` do Tina passou a ser comparado com o `base:` do `glob()` do Zod, com extração que reprova se não achar as cinco; (c) a prova de falsificabilidade foi reproduzida contra o artefato final; **(b) fica para a fase 3**, porque não existe hoje campo com `list: true` **e** `options`, e mudar `classifyTina` sem campo real para exercitar seria alteração sem teste possível — `classifyTina` **não foi tocada** |

## Lição do plano 031 — normalização dentro de comparação enfraquece o teste em silêncio

O 031 foi **reprovado no primeiro ciclo** por dois furos, ambos na mesma família e nenhum deles
desvio do executor — o plano listava os atributos a comparar e ele seguiu à risca. Os dois foram
corrigidos dentro do próprio plano, mas a lição vale para todo teste de paridade que este projeto
ainda vai escrever:

1. **Um `.sort()` de uma linha transformou "comparo as opções" em "comparo o conjunto de
   opções".** Alterar um valor de `options` falhava; **reordenar passava**. A ordem é a do select
   que o professor vê, e o lock a preserva. O teste teria passado para sempre dando a impressão de
   cobrir algo que não cobria.
2. **O que fica fora da assinatura comparada tem de ser justificado um a um.** `collections` — o
   alvo de um campo `reference` — ficou de fora, e trocar o alvo com o lock intocado passava
   verde: exatamente a classe de defasagem que o teste existe para pegar.

**Duas regras práticas que saem daqui.** Primeira: qualquer normalização aplicada aos dois lados
antes de comparar (`sort`, `trim`, `toLowerCase`, `filter`) **enfraquece a comparação** e tem de
estar comentada na linha **e** na lista de limitações do cabeçalho — senão quem lê não tem como
saber. Segunda: provar os dois sentidos de **conjunto** (item a mais, item a menos) **não prova**
a comparação de **atributo** nos itens em comum; são canários diferentes, e uma aproximação por
contagem de ocorrências passaria nos primeiros.

## Achados do plano 030 que o 034 tem de absorver

Dois, nenhum corrigível dentro do escopo do 030:

1. **A normalização de `linha_relacionada` está duplicada.** `normalizeLinhaRelacionadaId`
   (`src/content.config.ts:247`) é `const` **não exportada**, então `conteudo-valido.test.ts`
   re-implementa suas duas regexes à mão. São idênticas hoje, mas podem divergir em silêncio — e
   é **a mesma família de defeito que a D-06 combate**, que este plano fecha em outro lugar (a
   dívida 7a). Se alguém mudar a normalização real, o portão segue verde validando pela regra
   velha. **Correção é plano próprio, de dois passos:** exportar a função e importá-la no teste.
   O 030 proibia editar `src/content.config.ts`, então não havia caminho interno; o revisor
   considerou inverter o mapeamento no teste e concluiu que só muda a duplicação de lugar.
2. **Valor não-textual em `linha_relacionada` escapa do portão.** Verificado empiricamente pelo
   revisor: com `linha_relacionada: 42` o teste **passa**, porque o `typeof bruto === 'string'`
   pula em silêncio. Descartado como defeito porque o campo é `reference` no Tina, que só grava
   string — inalcançável pelo caminho do produto, e o §2 do `CLAUDE.md` proíbe tratar cenário
   impossível. Fica registrado para quem for reavaliar.

**Imprecisão a corrigir de passagem** no próximo toque em `tests/content/conteudo-valido.test.ts`:
o cabeçalho diz "Fecha a dívida 5 e a dívida 7(c)", mas a 7(c) foi fechada em
`paridade-schema.test.ts`. A dívida **foi** fechada por este plano; errada é a atribuição de qual
arquivo a fecha.

## Achados do plano 026 que o 033 tem de absorver

O 026 exercitou o painel **em produção** pela primeira vez e trouxe três coisas que nenhum plano
anterior tinha visto. Nenhuma foi consertada — o 026 proíbe consertar configuração durante a
verificação —, e as três são insumo do manual da fase 5:

1. **O vocabulário de arquivo reaparece um clique adiante do menu.** O RF-03 é satisfeito no menu,
   mas a tela de listagem de qualquer coleção mostra `Filename`, `Extension`, `Template`, o caminho
   `content/perfil/index.md` e os botões `Add Folder` / `Add File`. É mobiliário fixo do TinaCMS,
   não sai de `tina/config.ts`, e é a primeira tela que o professor vê depois de clicar numa
   coleção. O manual tem de antecipar isso em vez de deixar a surpresa para ele.
2. **A trilha de navegação trunca nomes no primeiro ponto.** `2026.2-relatividade-geral` aparece
   como "Disciplinas / 2026" — o painel lê o `.2` como extensão. O item certo abre e grava certo;
   o defeito é de exibição, mas confunde exatamente na coleção cujo padrão de nome (RN-08) usa
   ponto.
3. **O TinaCloud anunciou troca do sistema de autenticação para outubro**, exigindo TinaCMS ≥ 3.12.
   O projeto está em 3.12.1 e **não precisa de ação agora** — mas é o risco R-03 se materializando
   como aviso, e o painel também sinaliza a 3.13.0. Vale vigiar antes da fase 5.

**Achado de infraestrutura, fora do escopo do 033:** `/admin` e `/admin/index.html` respondem
**307** para `/admin/`, porque o `wrangler.toml` não declara `html_handling` e o default do Workers
Static Assets é `auto-trailing-slash`. Nenhuma das três formas dá 404 e o navegador segue o
redirecionamento, então **não há defeito a corrigir** — fica registrado para que ninguém volte a
gastar tempo investigando o salto extra.

## O que a fase 2 empurra adiante, e as dívidas que ela criou

Além das sete dívidas herdadas da fase 1 (tabela acima), a própria fase 2 gerou pendências. Nenhuma
foi consertada aqui — a regra deste README é destino nomeado, não conserto de passagem.

**Para a fase 3:**

- a dívida **7(b)** do teste de paridade (ver tabela acima) — ganha teste quando existir campo com
  `list: true` **e** `options`;
- a renderização de conteúdo, sem a qual M-02 não é verificável de ponta a ponta (ver seção
  seguinte);
- **`not_found_handling` (`wrangler.toml`) ainda não provado de fato.** Medido no plano 025: a rota
  inexistente responde 404 (o critério do plano estava cumprido), mas com **corpo vazio**,
  indistinguível do default `none` — porque `dist/` só tem `index.html` (`src/pages/` ainda não tem
  uma página 404). A configuração só se prova quando existir `404.html` no build, o que é a **RF-27
  da fase 3**.

**Para a fase 5:**

- `docs/avisos-do-painel-para-o-manual.md` (plano 033) como insumo obrigatório de
  `docs/manual-do-professor.md` (§10.5) — os cinco avisos, mais a decisão de que a dívida 4 não é
  automatizável;
- a remedição de M-02 e o próprio ciclo do EDITOR (planos 027 e 029, migrados em 2026-09-12);
- o teste de restauração de conteúdo excluído (§9);
- os dois achados do plano 026 (vocabulário de arquivo um clique adiante do menu; trilha de
  navegação truncada no ponto) — ver seção "Achados do plano 026 que o 033 tem de absorver";
- **o risco dos 60 dias de inatividade do vigia** (ADR-0011): workflow agendado em repositório
  público desliga sozinho sem atividade por 60 dias, e o manual do ADMIN precisa dizer como
  reativar (*Actions → Vigia do deploy → Enable workflow*);
- **o assunto do e-mail de falha não nomeia o workflow** (plano 028): o assunto `Run failed` foi
  transcrito para o e-mail do CI; para o do vigia, só horário e corpo foram transcritos, e o mesmo
  assunto é **inferido** pela forma do e-mail do CI, não medido — de um jeito ou de outro, só o
  corpo distingue os dois. O manual do ADMIN precisa dizer onde olhar para saber qual dos dois
  falhou.

**Dívidas novas da própria fase 2, sem fase específica atribuída:**

- **A pendência do caminho `schedule` do vigia (ADR-0011).** O cron diário nunca foi observado
  rodando: no experimento do plano 028 o GitHub não executou nenhuma execução `event: schedule` em
  ~90 min, e a detecção/e-mail foram provados só por `workflow_dispatch` (cujo e-mail segue outra
  regra). **Fecha quando:** aparecer ao menos uma execução `event: schedule` no histórico do
  workflow, seguida de uma falha real notificada por ela — condição escrita no próprio ADR-0011.
  Não bloqueia nada além de si mesma; é pendência de observação, não de código.
- **Três moderadas com correção disponível, ficaram de fora de propósito** (`qs`, `body-parser`,
  `express` — ADR-0010, 2026-09-12). Têm `fixAvailable: true` no `npm audit`, mas não foram
  corrigidas: são `moderate` e não afetam o portão (que só reprova em `high`/`critical`), e
  corrigi-las exigiria rodar `npm audit fix`, cujo churn de lockfile esta fase manda desconfiar
  (lição da fase 0, planos 002/004/005/007) — seria escopo especulativo dentro de um plano (o 032)
  que já mexia em dependência (ADR-0010, "Contexto"). Pendência nomeada no próprio ADR-0010; o ADR
  não atribui gatilho de revisão específico a ela.
- **A normalização de `linha_relacionada` está duplicada** (achado do plano 030).
  `normalizeLinhaRelacionadaId` (`src/content.config.ts:247`) é `const` **não exportada**, então
  `tests/content/conteudo-valido.test.ts` re-implementa suas duas regexes à mão. São idênticas
  hoje, mas podem divergir em silêncio — a mesma família de defeito que a D-06 combate. **Fecha
  quando:** a função for exportada de `src/content.config.ts` e importada no teste, em vez de
  reimplementada — correção de plano próprio, de dois passos, que o 030 não podia fazer porque
  estava proibido de editar `src/content.config.ts`.
- **Imprecisão no cabeçalho de `tests/content/conteudo-valido.test.ts`** (achado do plano 030): o
  cabeçalho atribui a dívida 7(c) a esse arquivo, mas ela foi fechada em `paridade-schema.test.ts`.
  A dívida **foi** fechada pelo plano 030; errada é só a atribuição de qual arquivo a fecha.
  **Fecha quando:** alguém corrigir a frase de passagem, no próximo plano que tocar esse arquivo.
- **`PRD.md` §11 (≈:750) atribui a validação de conteúdo ao `astro build` no CI e diz "Bloqueia
  merge"** (achado da revisão de integração da fase 2, 2026-09-12). O portão real é
  `vitest run tests/content` (CI e `build:pipeline`), e a `main` **não tem proteção de branch** —
  `gh api repos/researchgroups-ufma/haroldo-page/branches/main/protection` responde
  `Branch not protected`. O TinaCloud empurra direto na `main`. **Fecha quando:** o §11 for corrigido
  para nomear `vitest run tests/content` como o portão, e a célula "Bloqueia merge" refletir a
  ausência de proteção de branch — ou a proteção for criada.
- **README da fase 2, "Verificação autoritativa" (≈:368-386), parou antes do plano 030** (achado da
  revisão de integração da fase 2, 2026-09-12). Não lista o `npm audit` nem o check `Workers
  Builds`, e ainda diz "Enquanto o plano 030 não fechar" — o 030 fechou em 2026-09-11. A fase 3
  herda essa seção como roteiro se ninguém atualizar antes. **Fecha quando:** a seção for reescrita
  com os passos atuais (incluindo `npm audit` e o check `Workers Builds`) e sem a frase condicional
  ao 030.
- **`npm run build` chamado de "portão pré-push"** — achado da revisão de integração da fase 2,
  2026-09-12. `grep -n "pré-push" README.md docs/adr/0009-build-de-pipeline-sem-cloud-check.md
  plans/fase-2-pipeline-de-publicacao/README.md` acha três passagens com esse nome: `README.md:86`,
  `ADR-0009:58` e este README (linha 1 da tabela "Herdado da fase 1", "onde cada uma das sete
  dívidas caiu"). Para mudança de schema, o cloud check só passa **depois** do
  push e da reindexação do TinaCloud; seguida à risca numa branch, `npm run build` local reprova
  com `ERR_CLOUD_CHECK_FAILED` até a reindexação acontecer — a ordem certa é publicada logo abaixo,
  na seção "Ordem de fechamento de plano que mude schema". **A seção Qualidade do `README.md`
  (≈:294-303, "Antes de abrir um PR, rode…") não usa o nome "portão pré-push"**, mas descreve o
  mesmo `npm run build` como passo anterior ao PR, e a mesma trava vale para ela — é um segundo
  caso, sem o rótulo. O plano 035 editou o ADR-0009 e o `README.md` sem corrigir nenhuma das duas
  passagens, por instrução explícita de registrar, não consertar. **Fecha quando:** as três
  passagens nomeadas forem reescritas para descrever a ordem real (revisão → commit → push →
  TinaCloud reindexa → `npm run build` verde) em vez de chamar o comando de "portão pré-push", **e**
  a seção Qualidade do `README.md` ganhar a mesma ressalva sobre schema.
- **PRD §7.4 (≈:492): o "Plano B" do Workers Builds (deploy pelo GitHub Actions) muda o nome do
  check e faz o vigia reprovar todo dia com "Nenhum check"** (achado da revisão de integração da
  fase 2, 2026-09-12). A célula não aponta o ADR-0011. O ADR rejeita esse caminho porque ele
  "desfaz o plano 025 para resolver um problema de notificação" (Alternativas consideradas); a
  mudança de nome do check aparece só entre os "Gatilhos de revisão" do ADR, não como motivo da
  rejeição. **Fecha quando:** a célula do "Plano B" no §7.4 referenciar o ADR-0011.

**Consideradas e descartadas como dívida, com o motivo:**

- **`/admin` e `/admin/index.html` respondendo 307 para `/admin/`** (plano 026, `html_handling`
  default do Workers Static Assets): nenhuma das três formas dá 404, o navegador segue o
  redirecionamento sozinho, e o próprio plano registrou "não há defeito a corrigir" — é
  comportamento aceito, não pendência.
- **O anúncio do TinaCloud sobre a troca de autenticação em outubro** (plano 026): o projeto está
  em TinaCMS 3.12.1, acima do corte 3.11, e não exige ação agora — é risco a vigiar (R-03), não
  dívida.
- **Valor não-textual em `linha_relacionada` (ex.: `42`) escapa do portão de conteúdo** (achado do
  plano 030): o teste checa `typeof bruto === 'string'` e pula em silêncio valores que não são
  string. Descartado como defeito porque o campo é `reference` no Tina, que só grava string —
  inalcançável pelo caminho do produto, e o §2 do `CLAUDE.md` proíbe tratar cenário impossível.

## O que esta fase não consegue provar

**Não existe página que renderize conteúdo.** `src/` tem apenas `content.config.ts`, `env.d.ts`,
`lib/config.ts`, `lib/slug.ts`, `pages/index.astro` e `styles/global.css` — o site público é a
**fase 3**, e nenhum plano desta fase constrói página. Editar uma `descricao` pelo painel não muda
um byte do HTML publicado.

Consequência direta para o critério do §6.2 e para M-02: o que a fase 2 mede é

```
save no /admin  →  commit na main  →  build automático  →  versão nova publicada no Worker
```

com cada elo provado por artefato (SHA do commit do painel, o mesmo SHA no log da Cloudflare, id
da versão publicada, resposta HTTP). **O último elo — "o texto novo aparece na página" — fica para
a fase 3**, e M-02 é medida só na **fase 5** (PRD, §3.3, coluna "Quando medir": `Fase 5`, desde o
recorte de 2026-09-12) — não mais nesta fase. Isso é uma limitação **declarada**, não um atalho:
este README e o plano 034 são obrigados a escrevê-la; a medição em si é do plano 029, migrado
inteiro para a fase 5 junto com o item correspondente do §12 (que deixou de existir nesta fase).

## Por onde isto pode dar errado

**1. Prova de painel de terceiro é a interface, não o código.** Metade desta fase acontece em
painéis da Cloudflare, do TinaCloud e do GitHub. Este projeto já aprovou uma correção que não
funcionava porque a prova foi leitura de `node_modules` em vez de exercício da interface. **A
prova é o que a tela respondeu**, transcrita ou capturada — inclusive nas linhas "✘" da matriz da
§9, onde ausência de botão só conta se estiver descrita.

**2. Um plano ainda depende de gente — e a gente é você.** 025, 026 e **028** exigem o orquestrador
logado em painéis; os dois que exigiam **o professor** (027 e 029) saíram da fase em 2026-09-12.
A regra que eles levaram junto continua valendo lá: não substitua a sessão do EDITOR pela do ADMIN
"porque deve dar igual" — é literalmente o que o critério pede. Se o professor não estiver
disponível, o plano fica **bloqueado e registrado**; critério de aceitação não se reescreve para
caber no resultado (lição 5 da fase 0). **O que mudou em 2026-09-12 não foi o critério ser
afrouxado — foi ele ser transferido de fase, por inteiro, com a exigência intacta.**

**3. O CI não é portão do deploy.** Os dois pipelines disparam no mesmo push e correm em paralelo;
a Cloudflare não espera o `conclusion` do GitHub Actions. Quem impede conteúdo inválido de ir ao
ar é o próprio `build:pipeline`, que roda `vitest run tests/content` antes de tudo. Quem assumir o
contrário vai desenhar a proteção no lugar errado.

**4. O experimento do plano 028 quebra a `main` de propósito.** É o que prova F-02/RNF-04. Tenha o
commit de reversão pronto **antes** de empurrar o quebrado, registre os horários e feche a janela
no mesmo dia. O repositório é público.

**5. As armadilhas do painel continuam valendo em produção.** A alteração descartada em silêncio
ao voltar de um subpainel (planos 020 e 021), o item de lista salvo com subcampo obrigatório vazio
e o `linha_relacionada: ''` não sumiram — nenhum deles é defeito nosso a consertar nesta fase. Em
qualquer plano que salve pelo painel: **salve sem sair do subpainel** e **confira o arquivo
gravado, campo a campo**. A tela não é prova.

**6. Duas vagas, uma livre — e ela some na fase 5.** O plano gratuito do TinaCloud tem duas vagas,
e hoje **só a do ADMIN está ocupada**: o convite do professor nunca chegou a ser criado. Ao fim do
plano 027, já na fase 5, o plano fica cheio (A-01) e um terceiro editor passa a exigir plano pago
ou Decap (R-03, R-04).

**7. O `npm run dev` não sobe o painel no Astro 7.** Se algum plano precisar do painel **local**,
o caminho é `npx astro dev --background --force` + `npx tinacms dev`, e o encerramento é
`npx astro dev stop` **mais** matar os processos `node` do `tinacms`. O `--force` é obrigatório
por causa do cache da content layer. Nesta fase, porém, quase tudo acontece em **produção** — e lá
o modo de falha é outro; não transporte o diagnóstico do plano 022 para o `/admin` publicado.

## Verificação autoritativa

```
npm ci                →  não reescreve o lock
npm run lint          →  exit 0
npm run format:check  →  All matched files use Prettier code style!
npm run test:coverage →  testes verdes E cobertura ≥ 80% (threshold imposto)
npm run build         →  0 errors, 0 warnings, 0 hints; Complete!  ← LEIA A SAÍDA
CI do GitHub Actions  →  conclusion "success" no commit empurrado
```

**A última linha não é formalidade.** Durante a fase 1 inteira o CI esteve vermelho por 14 commits
seguidos, porque a lista era só de comandos locais e ninguém olhava para o run. "Os comandos
locais passam" **não** é o mesmo que "o CI passa", e só o segundo é evidência.

**A quinta linha também não.** O `astro check` já foi flagrado duas vezes imprimindo
`[ERROR] [content]` e encerrando com `0 errors` e exit 0 (planos 020 e 021) — a segunda vez com
uma referência inválida que **um humano lendo a saída** impediu de entrar no commit que fechou a
fase 1. Enquanto o plano 030 não fechar, quem lê a saída é você. Depois dele, o portão passa a ser
o `vitest run tests/content`, que roda no CI **e** no build de deploy.

**Planos com passo em painel de terceiro acrescentam uma linha própria:** o que a interface
mostrou, transcrito ou capturado, com data e horário. Sem isso, o plano não fecha.

## Portão de qualidade

Vale integralmente o da fase 0 (seção "Portão de qualidade", linha 113 daquele README): um plano
só vira `DONE` com **verificação independente com saída real** *e* **revisão de código aprovada**.
Relato do executor dizendo "funcionou" não substitui nenhuma das duas.

As **"Instruções que todo despacho de executor deve conter"** (fase 0, linha 82) valem
integralmente aqui; as que mais importam nesta fase:

1. **`git add` por caminho explícito.** Nunca `git add -A` nem `git add .`.
2. **`Status:` fica em `TODO`** — a promoção é do orquestrador.
3. **Evidência é saída literal, colada**, da sessão. Nada de saída de um comando rotulada como de
   outro.
4. **Critério de aceitação não se reescreve para caber no resultado.** Bloqueio externo deixa a
   caixa vazia e é reportado.
5. **Listar os arquivos que outro agente está tocando naquele momento**, com instrução de não
   editá-los mesmo que uma verificação falhe por causa deles — ver a tabela de paralelismo.
6. **Mandar o executor declarar o que NÃO rodou.**
7. **Teste novo tem de ser provado falsificável.** Os planos 030, 031 e 032 exigem canário, e o
   030 exige quatro.
8. **Desconfiar de churn grande no lockfile** — vale para o `gray-matter` do plano 030.

A seção **"Segurança — `npm audit`"** da fase 0 (linha 137) é a origem da dívida 6 e o contexto do
plano 032. Leia-a antes de despachá-lo.

## Ordem de fechamento de plano que mude schema

**Nenhum plano desta fase muda schema** — nem `src/content.config.ts` nem `tina/config.ts`. Se
algum precisar mudar, ele **para e reporta**, e a regra da fase 1 volta a valer:

```
revisão APROVADO → commit → push → TinaCloud reindexa → npm run build verde → Status: DONE
```

`--skip-cloud-checks` no comando **local** serve só como diagnóstico separado. A partir do plano
024 ele passa a existir no `build:pipeline`, que é o comando dos pipelines automáticos — e essa é
uma decisão registrada em ADR-0009, não uma licença para usá-lo no fechamento de plano.
