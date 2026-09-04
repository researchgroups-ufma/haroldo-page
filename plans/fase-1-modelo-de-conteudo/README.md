# Planos da Fase 1 — Modelo de conteúdo

> Mapa de execução dos planos atômicos. **Atualize a tabela de estado a cada plano fechado.**
> A fonte de verdade do que cada plano faz é o próprio arquivo `NNN-*.md`; a do que já foi feito
> é o campo `Status:` de cada um. Este arquivo existe para o que não cabe em nenhum dos dois: a
> ordem, o paralelismo e as armadilhas.

Última atualização: 2026-09-04

**Critério de conclusão da fase** (§6.2 do PRD): *o professor consegue, localmente, criar e
editar item de cada coleção pelo painel.* Não é "os testes passam" — é usar o `/admin`.

## Estado

| Plano | Título | Status | Agente | Commits |
|---|---|---|---|---|
| 015 | Instalação do TinaCMS e `/admin` no ar localmente | ✅ DONE | implementer | `1d35c11`, `30ab365`, `475f65f` |
| 016 | Schemas Zod das cinco coleções | ✅ DONE | implementer | `462ffb4` |
| 017 | As cinco coleções no `tina/config.ts` | ✅ DONE | implementer | `8a58afb` |
| 018 | Grupo "Versão em inglês (opcional)" | ✅ DONE | implementer | `6e5cb1f` |
| 019 | Teste de paridade Zod × Tina (D-06) | ✅ DONE | implementer | `6a42330` |
| 020 | Conteúdo placeholder representativo | ✅ DONE | implementer | `aa9a7cf` |
| 022 | Lista `scripts[]` em disciplinas (schema Zod + Tina e paridade) | ⬜ TODO | implementer | — |
| 021 | ADRs, verificação do `/admin` e fechamento | ⬜ TODO | implementer | — |

**Próximo:** plano 022 — lista `scripts[]` em disciplinas. **A fila da fase mudou em
2026-09-04:** 020 (DONE) → **022** → 021. O 022 nasceu de escopo novo trazido pelo stakeholder — scripts
Python exibidos na página da disciplina com destaque de sintaxe e botão de copiar — sabatinado no
mesmo dia (`docs/sabatinas/CHANGELOG_sabatina_scripts-python.md`, 11 decisões) e emendado no PRD
(RF-37, F-13, RN-05, D-05, R-13; v0.1.16). O **schema** é fase 1 porque é aqui que campo novo
nasce barato; a **renderização** é fase 3. O 021 continua sendo o último — ele fecha a fase.

**O que o 015 descobriu** (leia antes do 019): Tina + Astro 7 funciona, mas cobrou cinco
correções depois de uma revisão que já havia aprovado. Três armadilhas que o 017 herdou:

1. **`tina/tina-lock.json` é versionado** — cumprida no 017 e de novo no 018. No 017, o lock foi
   regenerado e commitado; coerência verificada pelo revisor recompilando o config com esbuild
   (`IDENTICAL: true`, md5 `920af9a27ca48e3d97c044eb599b8e07`). No 018, o orquestrador regenerou o
   lock rodando `tinacms dev`; a coerência foi verificada comparando o lock do HEAD com o do
   working tree: acrescenta 18 tipos GraphQL, todos do grupo `en` (`PerfilEnFormacao`, `PerfilEn`,
   `Linhas_pesquisaEn`, `ProjetosEn`, `DisciplinasEn`, `PublicacoesEn` e os
   `*Filter`/`*Mutation` correspondentes), remove zero tipos e mantém os campos em português
   byte-idênticos. Detalhe operacional descoberto no 018: `tinacms build --skip-cloud-checks`
   **não** reescreve o lock — só `tinacms dev` o gera. **Continua valendo para qualquer plano
   futuro** que mude o schema.
2. **Gitignorar não esconde do ESLint.** Todo diretório gerado precisa entrar nas três listas:
   `.gitignore`, `eslint.config.js` e — quando não for gitignorado — `.prettierignore`. O 017
   não criou diretório gerado novo, então não a exercitou; **a regra continua valendo** para
   qualquer plano que crie um.
3. **`email: PLACEHOLDER@ufma.br`** em `content/perfil/index.md` era marcado só por comentário —
   **materializou-se no 017**. Ao pôr `email` no schema do Tina, o painel passa a reserializar o
   arquivo via `gray-matter`/`js-yaml`, que não preservam comentários YAML; qualquer save real do
   formulário "Perfil" apagaria as seis linhas de comentário que registravam Q-07. Por isso o
   Perfil foi aberto e conferido nos planos 017 e 018 **mas nunca salvo**.
   **Encerrada em 2026-09-03:** o stakeholder informou o e-mail institucional
   (`haroldo.lima@ufma.br`), ele substituiu o placeholder e o bloco de comentário foi removido —
   não há mais marcador frágil a preservar, e **o formulário "Perfil" pode ser salvo pelo painel
   sem perda de informação**. Q-07 e A-06 fechadas no PRD (v0.1.11). A lição de fundo continua
   valendo para qualquer plano futuro: **comentário em YAML não sobrevive ao painel** — o que
   precisa ser preservado vai para um arquivo que o Tina não reserializa.

**O que o 016 deixou aberto e o 017 fechou:** `corpo` (linhas-pesquisa), `ementa` (disciplinas) e
`resumo` (publicações) seguem como `string` + `textarea` (frontmatter), **não** como body Markdown,
por razão técnica verificada: o `rich-text` do Tina sem `isBody` serializa árvore de sintaxe,
incompatível com `z.string()`; com `isBody` sai do frontmatter e o Zod não o vê. A única opção
que preserva string plana é `type: 'string'` com `ui: { component: 'textarea' }` — solução já
usada para `bio` desde o 015. Migrar para corpo Markdown via `render()` é decisão explícita da
fase 3, não do 017.

**O que o 017 deixa para o 019** (insumos para teste de paridade — não peguem em teste ingênuo):

- **Divergência de formato de valor em `linha_relacionada`:** Tina grava o id como caminho
  completo com extensão (`content/linhas-pesquisa/x.md`); Astro `reference()` monta id que o
  `glob()` do Zod nunca gera (`x`). Resultado: `getEntry()` devolve `undefined` — falha
  silenciosa na fase 3. Teste de paridade por nome/tipo/obrigatoriedade não detecta isso.
- **Subcampo obrigatório de lista embutida não bloqueia save:** orquestrador gravou `aulas: [ {} ]`
  com `numero`, `titulo` e `url` (obrigatórios) vazios — Zod rejeita esse frontmatter.
- **`defaultItem` está @deprecated** em favor de `ui.defaultItem`, que não é tipada para coleção
  baseada em `fields`. O 017 usa deliberadamente — upgrade futuro pode removê-lo.
  **Precisão acrescentada em 2026-09-04:** isso vale para o `defaultItem` no nível da **coleção**.
  No nível do **campo** o `ui.defaultItem` **é** tipado — a revisão do 019 conferiu em
  `@tinacms/schema-tools/dist/types/index.d.ts:331-348` que o `ui` de um `ObjectField` com
  `fields:` é `Template['ui']`, que declara `itemProps`/`defaultItem`/`previewSrc`. O plano 022
  usa essa forma. A redação original, lida sem essa distinção, desencorajaria a solução correta.
- **Limitação genérica do Tina:** com campo obrigatório vazio, adicionar item dispara erro sem
  dizer qual campo falta.

**O que o 018 deixa para o 019 e a fase 4:**

- Os seis grupos `en` (as cinco coleções mais `formacaoEnSchema`, sub-schema de `formacao[]` em
  `perfil`) são `.strict()` no Zod, e cada um tem teste de rejeição de campo factual próprio,
  provado falsificável. As duas divergências de paridade que o 017 deixou — formato do valor de
  `linha_relacionada` e subcampo obrigatório de lista embutida que não bloqueia o save —
  continuam abertas; o 018 não as tocou.
- **Para a fase 4:** a função de fallback por campo (RN-06) não foi implementada, de propósito.
  `en.formacao[]` e `en.areas[]` do perfil são listas paralelas às listas em português, alinhadas
  por índice, não por identificador — reordenar a lista em português desalinha a tradução
  correspondente, e não há mecanismo de realinhamento.
- **Duas decisões que o PRD não fechava, agora fechadas pelo 018:** `projetos` traduz só `titulo`
  e `descricao` (os demais campos são factuais, RN-07); `perfil.formacao[]` traduz `grau` e
  `curso`, que juntos formam o "título" que a §7.3 menciona sem nomear o campo.

**O que o 019 fechou, e o que ele deixa para o 020 e o 021:**

- **A divergência de `linha_relacionada` foi corrigida do lado do Zod**, não do Tina:
  `normalizeLinhaRelacionadaId` em `src/content.config.ts` tira o prefixo
  `content/linhas-pesquisa/` e a extensão `.md` antes do `reference()`, e é idempotente. O
  `// NOTE:` de `tina/config.ts` foi substituído por um comentário curto apontando para lá. A
  escolha do lado Zod foi deliberada: correção do lado do Tina só se prova exercitando o painel,
  e é exatamente onde este projeto já aprovou uma correção que não funcionava. **Consequência
  boa:** o schema do Tina não mudou, então não houve `ERR_CLOUD_CHECK_FAILED` nem lock a
  regenerar — pela primeira vez desde o 017, o `npm run build` fechou verde sem depender de push.
- **A segunda divergência herdada — subcampo obrigatório de lista embutida não bloqueia o save —
  foi decidida como "aceitar e registrar"**, sem mudança de schema. Justificativa conferida na
  revisão contra `node_modules/@tinacms/schema-tools`: na variante `{type:'object', fields:[...]}`,
  o `ui` é tipado como `Template['ui']`, que declara só `itemProps`/`defaultItem`/`previewSrc` —
  **não existe `validate`** ali (ele existe só em `UIField<Type,List>`). **Consequência a carregar
  adiante:** a fase 2 precisa de mensagem de erro de build que o professor consiga interpretar, e
  o manual da fase 5 precisa avisar que o painel deixa salvar item de lista com campo obrigatório
  vazio, e que isso quebra o build (F-09, RNF-09, risco R-01).
- **Ponta que o 019 não conseguiu verificar e passou ao 020:** `getEntry()` resolvendo de fato
  depois da normalização. A premissa (o Tina grava o caminho completo) já foi verificada no painel
  no plano 017 — não é leitura de `node_modules` —, mas a resolução final exige conteúdo, e as
  quatro pastas de coleção estão vazias. Virou item de aceitação do 020, com o valor literal
  gravado a ser colado na Evidência.
- **Três buracos latentes que a revisão do 019 encontrou** e que nenhum plano fecha ainda —
  insumo para o 021 e para as fases seguintes:
  1. O teste compara o `name` da coleção mas **nunca o `path` do Tina contra a pasta que o
     `glob()` do Zod lê**. Trocar `path: 'content/linhas-pesquisa'` passaria despercebido —
     divergência silenciosa da mesma família que o D-06 combate.
  2. Em `tests/content/paridade-schema.test.ts:235`, a detecção de enum do lado Tina vem depois
     do ramo `campo.list`: um campo futuro com `list: true` **e** `options: [...]` teria os
     valores de enum não comparados. Não existe campo assim hoje.
  3. A prova de falsificabilidade foi produzida com 11 testes; o 12º, acrescentado depois por
     cobertura, não toca em `compareFields` — a prova segue válida, mas não é contra o artefato
     final.
- **O que a revisão descartou conferindo contra a fonte** (vale como precedente, porque são as
  três suspeitas que um revisor apressado teria confirmado no chute): a recursão de
  `compareFields` **não** pula ramo em silêncio — os guardas `&&` são estreitamento de tipo, e
  canário aninhado em `aulas[]` ou dentro de `en` faria o teste falhar; o `.optional()` externo
  **não** anula o `preprocess` (`ZodOptional` curto-circuita em `undefined`, que é o desejado); e
  os 100% de cobertura **não** são ocos — a aritmética entre planos (016: 21/2/1 · 018: 27/2/1 ·
  019: 31/4/2) mostra que a segunda função e as duas branches novas só podem ser de
  `normalizeLinhaRelacionadaId`. A tabela de cobertura por arquivo sair vazia é defeito de
  reporter registrado desde o plano 015.

**O que o 020 descobriu, e que o 022 vai encontrar** (ele também exercita o painel):

- **O formulário do Tina descarta em silêncio alteração em campo que já tinha valor.** Ao voltar
  de um subpainel de grupo `object` (o "Versão em inglês", o "Período de execução", um item de
  lista embutida), o formulário re-inicializa a partir do documento carregado: alteração em campo
  com valor inicial é perdida — **a tela mostra o valor novo e o arquivo grava o antigo** —,
  enquanto campo que estava vazio sobrevive. O `defaultItem: { publicado: false }` conta como
  valor inicial, então o interruptor "Publicado" é a vítima mais provável. Reproduzido com A/B de
  uma variável duas vezes: uma linha de pesquisa gravou `publicado: false` com o interruptor
  ligado na tela, e no Perfil `nome` e `bio` reverteram enquanto `departamento` (vazio antes)
  gravou o valor novo. **Contorno:** altere esses campos **por último**, depois de sair de
  qualquer subpainel, e confira o arquivo gravado a cada save. Isto é mais grave que a armadilha
  do `aulas: [ {} ]` que o 017 registrou, porque não quebra o build — grava conteúdo errado que
  passa em tudo.
  **Onde ela cai no 022:** `ui.defaultItem: { linguagem: 'python' }` conta como valor inicial, e
  acrescentar item a `scripts[]` é entrar e sair de subpainel. `linguagem` é o `publicado` desta
  vez. Como a verificação de painel do 022 é a prova do R-13, conferir só o bloco de `codigo`
  aprovaria o plano com a prova pela metade — o item gravado se confere **campo a campo**.
  **E no 021:** o critério de conclusão da fase pede *editar* um item existente em cada coleção,
  que é literalmente o gatilho. A tela não é prova; o arquivo é.
- **Projeto sem linha de pesquisa grava `linha_relacionada: ''`, não omite o campo,** e o Astro
  rejeita: `Invalid content reference: ... references "" in collection "linhas-pesquisa", but
  that entry does not exist`. Note o contraste: `codigo` vazio numa disciplina é **omitido** do
  frontmatter — o problema é específico do tipo `reference`. **E o `astro check` registra esse
  `[ERROR] [content]` e ainda assim encerra com `0 errors` e exit 0**, ou seja, a linha
  `npm run build` da verificação autoritativa não reprova por isso. Quem fechar plano que crie
  conteúdo precisa **ler** a saída, não só o exit code.
- **A ponta herdada do 019 fechou.** O painel gravou
  `linha_relacionada: content/linhas-pesquisa/sombras-de-buracos-negros.md` — a premissa da
  correção estava certa — e `getEntry()` resolveu de fato depois de `normalizeLinhaRelacionadaId`,
  devolvendo a entrada, não `undefined`. Detalhe que quase produziu falso negativo: a content
  layer tinha cache de quando as pastas estavam vazias, e só depois de `astro dev --force` a prova
  valeu. **Toda verificação de conteúdo em dev server que já estava no ar precisa desse `--force`.**
- **Restrição passada à fase 3:** título de linha, projeto e disciplina **não** carrega marca de
  placeholder — só a `descricao` carrega. Uma listagem que renderize apenas o título exibiria
  conteúdo inventado sobre uma pessoa real sem marcador, num repositório público. Decisão do
  stakeholder em 2026-09-04: fica assim, porque os placeholders serão substituídos por conteúdo
  real. A fase 3 tem de mostrar a descrição junto do título, ou marcar de outro jeito.
- **Divergência de documentação a corrigir em plano futuro:** a docstring de
  `src/content.config.ts:239-241` chama a referência inválida de "falha silenciosa que só
  apareceria na fase 3". O 020 provou que o `astro check` a reporta em voz alta hoje — o
  silencioso é o *exit code*, não o erro.

## Grafo de dependências

```
014 ─┬→ 015 ─→ 017 ─┬→ 018 ─┬→ 019 ─┬──────────→ 021
     │              │       │       │            ↑
     └→ 016 ────────┴───────┴→ 020 ─┴→ 022 ──────┘
```

- **015 ∥ 016** — o 015 mexe em `package.json` e `tina/config.ts`; o 016 em
  `src/content.config.ts`. Escopos disjuntos. **Mas o 015 mexe no lockfile**, então serialize se
  o 016 precisar instalar qualquer coisa.
- **019 ∥ 020** — não se materializou: o 019 rodou sozinho e fechou primeiro, o que na prática
  foi melhor. Ele alterou `src/content.config.ts` (a normalização de `linha_relacionada`), e o
  020 agora cria conteúdo contra o schema já corrigido, podendo preencher o campo em vez de
  deixá-lo vazio.
- **020 → 022, serial, não paralelo.** O 022 altera os dois schemas; o 020 cria conteúdo contra
  eles. Rodar juntos repetiria exatamente o risco que a nota do 019 ∥ 020 levantava. O 022
  depois do 020 também é melhor para a verificação de painel que ele exige: já existe uma
  disciplina de verdade onde acrescentar o script, em vez de criar uma só para o teste.

## Por onde isto pode dar errado

**1. Tina + Astro 7 é território novo.** O `@tinacms/astro@0.6.1` declara peer
`astro: ^5 || ^6 || ^7`, mas este é o primeiro projeto da casa nessa combinação. Por isso o 015
existe separado e mínimo: descobrir atrito com uma coleção só é barato; descobrir com cinco,
não.

**2. O Tina traz React para um projeto que não tem React.** Esperado — o painel é React. O que
**não** pode acontecer é o site público passar a carregar React. O plano 015 exige medir isso.

**3. A paridade Zod × Tina é a rede de proteção do professor, não burocracia.** Um campo que
exista só num lado produz build quebrado que ele não sabe diagnosticar (F-09, RNF-09). Os planos
016 e 017 transcrevem a §7.3 **independentemente** de propósito, para que o teste do 019 compare
duas leituras da mesma fonte em vez de uma cópia de si mesma. **É esperado que o 019 encontre
divergências reais** — se não encontrar nenhuma, desconfie do teste antes de comemorar.

**4. O repositório é público.** As 6 publicações do placeholder são inventadas e ficam legíveis
por qualquer pessoa, atribuídas a um professor real. Nunca use DOI ou arXiv real, e marque-as de
um jeito trivial de encontrar e apagar. Pela mesma razão, `publicado: false` esconde do site mas
**não** do GitHub (D-04, consequência registrada em 2026-09-01).

**5. `publicacoes` não traduz título nem autores** (RN-07). É a armadilha mais provável do 018:
título de artigo é dado factual e traduzi-lo produziria duas citações divergentes do mesmo
trabalho. **Não se materializou:** o grupo `en` de `publicacoes` implementado no 018 tem só
`resumo`, confirmado pela revisão contra a §7.3.

## Herdado da fase 0

- **Lições de despacho** — a lista das 10 lições no README da fase 0 vale integralmente aqui.
  As que mais importam nesta fase: `git add` por caminho explícito; `Status:` só o orquestrador
  promove; Evidência é saída literal colada; **teste novo tem de ser provado falsificável**.
- **Portão de qualidade** — um plano só vira `DONE` com verificação independente com saída real
  **e** revisão de código aprovada.
- **Dívidas herdadas: nenhuma.** As cinco que a fase 0 deixou foram resolvidas em 2026-09-01 —
  URL provisória em `.env.example` e no comentário do `wrangler.toml`, campo `Versão do PRD`,
  cobertura sem `thresholds` e a varredura de `process.env` que ignorava `.astro`. Em 2026-09-03
  as duas últimas pendências de fora do fluxo também saíram: `vite` passou a ser declarado no
  `package.json` (era importado em `astro.config.mjs` e existia só como transitiva — funcionava
  por acidente do hoisting) e `plans/.idea/` deixou de existir. O README da fase 0 foi corrigido:
  quatro linhas ainda descreviam como abertas pendências já resolvidas ou sem objeto.

- **Dívida de dependência que esta fase criou.** Era "a única" quando esta linha foi escrita; a
  contagem envelheceu — os planos 019 e 020 acrescentaram outras (subcampo obrigatório que não
  bloqueia o save, descarte silencioso no formulário, `astro check` com exit 0), listadas nas
  seções por plano acima e consolidadas pelo 021 na seção "o que a fase 1 empurra para a fase 2".
  O plano 015 trouxe o TinaCMS, e com ele o React:
  `npm audit` passou de 0 para **8 vulnerabilidades moderadas** em 2026-09-03, todas de
  `react-router@6.30.6`, cuja única origem é `tinacms@3.12.1 → react-router-dom` (confirmado por
  `npm ls react-router`). Advisory [GHSA-wrjc-x8rr-h8h6](https://github.com/advisories/GHSA-wrjc-x8rr-h8h6):
  open redirect via barra invertida em `<Link>`/`useNavigate`. **Não há correção nossa** — sai
  quando o TinaCMS subir a dependência. Alcance: o painel `/admin`, autenticado e usado por uma
  pessoa; **o site público não carrega React** (D-01, medido no 015), então visitante nenhum é
  exposto. Decisão a tomar na fase 2: se o CI passa a rodar `npm audit` e reprovar, e em que
  nível de severidade — hoje ele não roda.
- **A cobertura agora reprova.** O `vitest.config.ts` tem `thresholds` em 80% e o CI roda
  `npm run test:coverage`. Módulo novo em `src/lib/` ou `src/i18n/` sem teste **quebra o CI** —
  o que é o ponto, mas é bom saber antes de abrir o PR.

## Verificação autoritativa

```
npm ci                →  não reescreve o lock
npm run lint          →  exit 0
npm run format:check  →  All matched files use Prettier code style!
npm run test:coverage →  testes verdes E cobertura ≥ 80% (threshold imposto)
npm run build         →  0 errors, 0 warnings, 0 hints; Complete!
CI do GitHub Actions  →  conclusion "success" no commit empurrado
```

**A última linha foi acrescentada em 2026-09-04, e o motivo dói.** Esta lista era só de
comandos locais, e por isso ninguém olhou para o CI durante a fase inteira: **ele esteve
vermelho em 14 commits seguidos**, de `1d35c11` (plano 015) a `d832663`. Os planos 015 a 019
foram executados, revisados e fechados com o portão de qualidade da casa satisfeito — porque o
portão só enxergava a máquina de quem desenvolve.

Causa única, reproduzida movendo o `.env` para fora e rodando o comando: `npm run build` começa
por `tinacms build`, que aborta com `Client not configured properly. Missing clientId, token`
sem `TINA_CLIENT_ID`/`TINA_TOKEN`, e o workflow não tinha bloco `env:` nem secrets.
`--skip-cloud-checks` não contorna — a falha é anterior ao cloud check, na construção do
cliente. O PRD previa a configuração, mas como item da **fase 2**: o plano 015 antecipou a
dependência sem antecipar a credencial. Resolvido em 2026-09-04 (`82fb4de`), com os secrets
criados pelo stakeholder; primeiro verde desde `1a0d6e6`, de 2026-09-02.

No caminho saiu também um warning que ninguém tinha lido: `actions/checkout@v4` e
`actions/setup-node@v4` têm como alvo o Node 20, aposentado, e o runner já as forçava para o
Node 24 — viraria falha dura. Subidas para `v7` (`d832663`), com as breaking changes de cada
major conferidas contra as notas de release. O run seguinte passou de duas anotações para uma,
e o verde final tem **zero**.

**Lição para as próximas fases: "os comandos locais passam" não é o mesmo que "o CI passa", e
só o segundo é evidência.** Todo fechamento de plano confere o `conclusion` do run do commit
empurrado.

**Consequência nova para o fatiamento da fase 2.** Com o `tinacms build` agora rodando no CI, o
acoplamento com o TinaCloud ganhou uma aresta: o comando compara o schema local com o que o
TinaCloud indexou em `main`, e num push que **altere o schema** o CI pode correr antes da
reindexação e falhar com `ERR_CLOUD_CHECK_FAILED` sem haver defeito. Localmente havia um humano
para esperar e repetir — nos planos 017 e 018 foi exatamente isso; no CI não há.

**A ordem de fechamento não é livre — descoberta no 017 e vale para todo plano que mude o
schema.** O `npm run build` começa por `tinacms build`, que compara o schema local com o que o
TinaCloud indexou em `main`. Enquanto o commit não subir, ele para em `ERR_CLOUD_CHECK_FAILED`
(`Reason: [NON_BREAKING - TYPE_ADDED] ...`) e nem chega ao `astro check`. Não é defeito do
plano, e **não** se contorna com `--skip-cloud-checks` no comando oficial — o contorno serve só
como diagnóstico separado, para provar que a falha é só do cloud-check. A sequência que funciona:

```
revisão APROVADO → commit → push → TinaCloud reindexa → npm run build verde → Status: DONE
```

No 017 o build fechou na primeira tentativa logo após o push. Planeje o fechamento assim: o
critério do `npm run build` fica desmarcado até o push, com o bloqueio registrado — nunca
reescrito para caber no resultado.

O 018 confirmou o mesmo padrão: `ERR_CLOUD_CHECK_FAILED` com `Reason: [NON_BREAKING - TYPE_ADDED]
Type 'PerfilEnFormacao' was added` enquanto o commit não tinha subido, e `npm run build` fechou
verde depois do push de `6e5cb1f`.
