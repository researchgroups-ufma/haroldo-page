# Plano 018 — Grupo "Versão em inglês (opcional)" nas coleções traduzíveis

**Status:** TODO
**RFs cobertos:** fase 1, item "Grupo 'Versão em inglês (opcional)'"; D-03; RN-06, RN-07, RN-09
**Depende de:** planos 016 (Zod) e 017 (Tina)
**Modelo recomendado:** sonnet
**Agente recomendado:** implementer
**PRD:** `S:\Projetos\academic_page\haroldo\PRD.md`
**Projeto:** `S:\Projetos\academic_page\haroldo`

## Objetivo

Cada coleção traduzível ganha um grupo `en` **opcional**, recolhível no painel, com apenas os
campos que fazem sentido traduzir — em `src/content.config.ts` e em `tina/config.ts`, em
paridade.

## Arquivos afetados

- `src/content.config.ts` — acrescentar o grupo `en`
- `tina/config.ts` — acrescentar o grupo `en`
- testes dos schemas — cobrir o grupo opcional

## Contexto necessário

**Projeto.** `haroldo-page` — site acadêmico do Prof. Haroldo C. D. Lima Junior (UFMA).

### A decisão D-03, e por que ela é assim

> i18n por grupo "Versão em inglês" recolhível **dentro do mesmo arquivo**, com fallback por
> campo. Alternativa rejeitada: pastas `pt/` e `en/` espelhadas (padrão do LaFiM com Decap).
> Motivo: um único editor — um arquivo por item elimina o risco de par órfão e mantém um
> formulário só. O fallback vira "campo vazio ⇒ usa PT".

**Consequência para este plano:** **um** arquivo por item, **um** formulário. Não crie pasta
`en/`, não duplique coleção, não crie item espelhado.

### O que é traduzível em cada coleção (§7.3 — transcreva, não deduza)

| Coleção | Campos do grupo `en` |
|---|---|
| `perfil` | `cargo`, `instituicao`, `departamento`, `bio`, `resumo_home`, `formacao[]` (só o título), `areas[]` |
| `linhas-pesquisa` | `titulo`, `resumo`, `corpo` |
| `projetos` | o PRD diz "grupo `en`" sem listar campos — **decida a partir de RN-07 e registre**: o traduzível é `titulo` e `descricao`; `periodo`, `financiador`, `status` e `colaboradores` são factuais |
| `disciplinas` | `nome`, `descricao`, `ementa` |
| `publicacoes` | **apenas `resumo`** — título e autores **não** se traduzem (RN-07) |

⚠️ **`publicacoes` é a armadilha.** A tentação é traduzir o título. A RN-07 proíbe: o título de
um artigo é dado factual, existe uma vez só. Traduzir produziria duas citações divergentes do
mesmo trabalho.

**RN-09 — o português é canônico.** Todo item existe em PT; o inglês é opcional. Portanto o
grupo `en` inteiro é opcional, **e cada campo dentro dele também**. Um item com o título em
inglês preenchido e o resumo em inglês vazio é válido.

**RN-06 — fallback por campo, não por item.** Campo vazio no `en` ⇒ a rota `/en` exibe o valor
em português correspondente. **A implementação do fallback é da fase 4**, não deste plano. Aqui
só o schema e o formulário. Não escreva a função de fallback.

**No painel, o grupo tem de ser recolhível** e vir depois dos campos em português, para não
poluir o formulário de quem só escreve em PT.

### Paridade

Os dois arquivos precisam concordar. O teste que garante isso é o plano 019 — mas ele só
consegue comparar se este plano tratar os dois lados igual. Se você acrescentar um campo ao
`en` de um lado e esquecer o outro, o 019 vai reprovar.

**Ambiente.** Windows 11 / PowerShell. Node 24.16.0.

## Passos

1. Acrescentar o grupo `en` opcional às cinco coleções em `src/content.config.ts`, com os campos
   da tabela acima.
   → verify: `npm run build` verde; um item sem `en` continua válido.
2. Acrescentar o mesmo grupo em `tina/config.ts`, recolhível e depois dos campos em PT.
   → verify: no `/admin`, o grupo aparece recolhido e não atrapalha o formulário em PT.
3. Registrar a decisão sobre os campos traduzíveis de `projetos`, que o PRD não lista.
   → verify: decisão e justificativa por RN-07 na Evidência.
4. Escrever testes: item sem `en` é válido; item com `en` parcial é válido; campo factual **não**
   aceito dentro de `en`.
   → verify: `npm run test` verde, com canário provando falsificabilidade.
5. **Verificação objetiva:** preencher o `en` de um item pelo painel e conferir o frontmatter.
   → verify: `git diff` mostra o grupo `en` aninhado no mesmo arquivo, não em arquivo novo.

## Critérios de aceitação

- [x] Grupo `en` **opcional** nas cinco coleções, nos dois arquivos, em paridade
- [x] Campos traduzíveis conforme a tabela; decisão de `projetos` registrada
- [x] **`publicacoes` traduz apenas `resumo`** — título e autores fora do grupo (RN-07)
- [x] Cada campo dentro de `en` é individualmente opcional (RN-09)
- [x] Um item **sem** grupo `en` continua válido
- [x] Grupo recolhível no painel, depois dos campos em português
- [x] **Um arquivo por item** — nenhuma pasta `en/`, nenhum item espelhado (D-03)
- [x] Função de fallback **não** implementada — é fase 4
- [x] Testes cobrindo grupo ausente, parcial e campo factual recusado, provados falsificáveis
- [ ] `npm run lint`, `npm run format:check`, `npm run test` e `npm run build` verdes

## Evidência

**Arquivos alterados:** `src/content.config.ts`, `tina/config.ts`, `tests/content/schemas.test.ts`,
`plans/fase-1-modelo-de-conteudo/018-grupo-versao-em-ingles.md` e `tina/tina-lock.json`. O lock foi
regenerado pelo orquestrador rodando `tinacms dev` em 2026-09-03 — armadilha nº 1 do README da
fase 1, que exige regenerar o lock a cada mudança de schema. Não fui eu quem regenerou (não rodei
`tinacms dev`, por instrução): a afirmação de que o lock estava intacto, na primeira versão desta
Evidência, era verdadeira no momento em que a escrevi (`npx tinacms build --skip-cloud-checks` não
mexe no lock — só `tinacms dev` o faz) e ficou desatualizada quando o orquestrador rodou `tinacms
dev` depois. Verificação de coerência do lock regenerado, feita pelo revisor comparando o lock do
HEAD com o do working tree: passa a conter o grupo `en` nas cinco coleções; acrescenta 18 tipos
GraphQL, todos do grupo `en` (`PerfilEnFormacao`, `PerfilEn`, `Linhas_pesquisaEn`, `ProjetosEn`,
`DisciplinasEn`, `PublicacoesEn` e os `*Filter`/`*Mutation` correspondentes); remove zero tipos;
mantém os campos em português de todas as coleções byte-idênticos ao HEAD.

### Decisão 1 — campos traduzíveis de `projetos` (a §7.3 não lista)

A §7.3 diz apenas "grupo `en`" para `projetos`, sem listar campos. Implementado: `titulo` e
`descricao` entram no grupo `en`; `periodo`, `financiador`, `status`, `colaboradores` e
`linha_relacionada` ficam fora. Justificativa (RN-07): esses cinco campos são dados factuais —
datas de execução, valor/fonte de financiamento, status corrente e nomes de colaboradores não
mudam de idioma, só de representação; traduzi-los não faz sentido e um `status` traduzido
("ongoing"/"em andamento") criaria duas fontes de verdade para o mesmo fato.

### Decisão 2 — `perfil.formacao[]`: `en` leva `grau` e `curso`, não um campo `titulo`

A §7.3 marca `formacao[]` como "✔ (título)", mas o objeto é `{grau, curso, instituicao, ano}` — não
tem campo `titulo`. Implementado: o grupo `en` de cada item de `formacao[]` tem `grau` e `curso`
(ambos opcionais, `.strict()`), que juntos formam o título da formação (ex.: "Doutorado em Física"
→ grau "PhD", curso "Physics", exibidos concatenados como "PhD in Physics" pela camada de
apresentação). Traduzir só `curso` produziria "Doutorado in Physics" na rota `/en`. `instituicao` e
`ano` ficam fora do `en` — são factuais (RN-07), e a §7.3 restringe a tradução ao título.

### Nota registrada no código e aqui — alinhamento por índice

`en.formacao[]` (perfil) e `en.areas[]` (perfil) são listas paralelas às listas em português,
alinhadas por posição/índice, não por identificador. **Consequência:** reordenar a lista em
português desalinha as traduções correspondentes. Nenhum mecanismo de realinhamento foi
implementado — está fora do escopo deste plano (é trabalho da fase 4, junto do fallback). A nota
está no docstring de `formacaoEnSchema` em `src/content.config.ts` e nas `description` dos campos
correspondentes em `tina/config.ts`.

### Comentário desatualizado corrigido

Em `tina/config.ts`, o comentário do bloco `publicacoes` dizia "sem grupo `en` aqui" — desatualizado
por este plano. Corrigido para "o grupo `en` abaixo (plano 018) só tem `resumo`".

### `npm run lint`

```
> haroldo-page@0.1.0 lint
> eslint .

```
(saída vazia, exit 0)

### `npm run format:check`

Primeira execução acusou `tina/config.ts` fora do padrão Prettier (import novo formatado
manualmente); corrigido com `npx prettier --write tina/config.ts` (só reformatação — quebra de
linha de strings longas — nenhuma mudança de conteúdo, conferida linha a linha). Execução final:

```
> haroldo-page@0.1.0 format:check
> prettier --check .

Checking formatting...
All matched files use Prettier code style!
```

### `npm run lint` (após a Correção 2)

```
> haroldo-page@0.1.0 lint
> eslint .

```
(saída vazia, exit 0)

### `npm run format:check` (após a Correção 2)

```
> haroldo-page@0.1.0 format:check
> prettier --check .

Checking formatting...
All matched files use Prettier code style!
```

### `npm run test` (após a Correção 2 — inclui o teste novo de `en.formacao[]`)

```
> haroldo-page@0.1.0 test
> vitest run


 RUN  v4.1.11 S:/Projetos/academic_page/haroldo


 Test Files  3 passed (3)
      Tests  81 passed (81)
   Start at  16:43:16
   Duration  844ms (transform 569ms, setup 0ms, import 832ms, tests 31ms, environment 0ms)
```

### `npm run test:coverage` (após a Correção 2)

```
> haroldo-page@0.1.0 test:coverage
> vitest run --coverage


 RUN  v4.1.11 S:/Projetos/academic_page/haroldo
      Coverage enabled with v8


 Test Files  3 passed (3)
      Tests  81 passed (81)
   Start at  16:43:20
   Duration  900ms (transform 561ms, setup 0ms, import 840ms, tests 35ms, environment 0ms)

 % Coverage report from v8
-------------------|---------|----------|---------|---------|-------------------
File               | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
-------------------|---------|----------|---------|---------|-------------------
-------------------|---------|----------|---------|---------|-------------------

=============================== Coverage summary ===============================
Statements   : 100% ( 27/27 )
Branches     : 100% ( 2/2 )
Functions    : 100% ( 1/1 )
Lines        : 100% ( 27/27 )
================================================================================
```

### Canário — prova de falsificabilidade

Quebrado deliberadamente: removido `.strict()` de `publicacoesEnSchema` em
`src/content.config.ts`. Rodado `npm run test -- tests/content/schemas.test.ts`:

```
 ❯ tests/content/schemas.test.ts (66 tests | 2 failed) 22ms
     × rejeita `en.titulo` — título de artigo é dado factual, não se traduz (RN-07) 3ms
     × rejeita `en.autores` — autoria é dado factual, não se traduz (RN-07) 0ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 2 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  tests/content/schemas.test.ts > coleção publicacoes > rejeita `en.titulo` — título de artigo é dado factual, não se traduz (RN-07)
AssertionError: expected true to be false // Object.is equality

- Expected
+ Received

- false
+ true

 ❯ tests/content/schemas.test.ts:374:31
    372|       en: { titulo: 'Translated title' },
    373|     });
    374|     expect(resultado.success).toBe(false);
       |                               ^
    375|   });
    376|

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/2]⎯

 FAIL  tests/content/schemas.test.ts > coleção publicacoes > rejeita `en.autores` — autoria é dado factual, não se traduz (RN-07)
AssertionError: expected true to be false // Object.is equality

- Expected
+ Received

- false
+ true

 ❯ tests/content/schemas.test.ts:382:31
    380|       en: { autores: ['Lima Junior, H. C. D.'] },
    381|     });
    382|     expect(resultado.success).toBe(false);
       |                               ^
    383|   });
    384| });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/2]⎯


 Test Files  1 failed (1)
      Tests  2 failed | 64 passed (66)
   Start at  16:24:33
   Duration  836ms (transform 443ms, setup 0ms, import 682ms, tests 22ms, environment 0ms)
```

Exatamente os dois testes do RN-07 falharam (os outros 64, inclusive os outros de `en`, seguiram
verdes — o canário aponta o teste certo, não qualquer teste). Restaurado o `.strict()` e rodado de
novo:

```
 RUN  v4.1.11 S:/Projetos/academic_page/haroldo


 Test Files  1 passed (1)
      Tests  66 passed (66)
   Start at  16:24:42
   Duration  837ms (transform 444ms, setup 0ms, import 691ms, tests 17ms, environment 0ms)
```

### Canário 2 — `formacaoEnSchema` (Correção 2 exigida pela revisão)

A revisão apontou que os cinco grupos `en` de coleção tinham teste de rejeição de campo factual,
mas o sexto schema estrito do arquivo, `formacaoEnSchema` (`src/content.config.ts:126-131`, o
sub-objeto de `en.formacao[]` em `perfil`), não tinha nenhum — sem esse teste, removê-lo não
derrubava a suíte. Acrescentado em `describe('coleção perfil')`:

```ts
it('rejeita campo factual dentro de `en.formacao[]` — `instituicao` e `ano` não são traduzíveis (RN-07, `.strict()`)', () => {
  const resultado = perfilSchema.safeParse({
    ...valido,
    en: { formacao: [{ instituicao: 'UFMA' }] },
  });
  expect(resultado.success).toBe(false);
});
```

Quebrado deliberadamente: removido `.strict()` de `formacaoEnSchema` (`src/content.config.ts:131`).
Rodado `npm run test -- tests/content/schemas.test.ts`:

```
 ❯ tests/content/schemas.test.ts (67 tests | 1 failed) 22ms
     × rejeita campo factual dentro de `en.formacao[]` — `instituicao` e `ano` não são traduzíveis (RN-07, `.strict()`) 3ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  tests/content/schemas.test.ts > coleção perfil > rejeita campo factual dentro de `en.formacao[]` — `instituicao` e `ano` não são traduzíveis (RN-07, `.strict()`)
AssertionError: expected true to be false // Object.is equality

- Expected
+ Received

- false
+ true

 ❯ tests/content/schemas.test.ts:130:31
    128|       en: { formacao: [{ instituicao: 'UFMA' }] },
    129|     });
    130|     expect(resultado.success).toBe(false);
       |                               ^
    131|   });
    132| });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯


 Test Files  1 failed (1)
      Tests  1 failed | 66 passed (67)
   Start at  16:42:53
   Duration  835ms (transform 443ms, setup 0ms, import 681ms, tests 22ms, environment 0ms)
```

Exatamente e só esse teste falhou — os outros 66, inclusive os cinco outros de rejeição de campo
factual em `en`, seguiram verdes. Restaurado o `.strict()` e rodado de novo:

```
 RUN  v4.1.11 S:/Projetos/academic_page/haroldo


 Test Files  1 passed (1)
      Tests  67 passed (67)
   Start at  16:43:02
   Duration  848ms (transform 459ms, setup 0ms, import 703ms, tests 19ms, environment 0ms)
```

### `npm run build` — bloqueado externamente até o push

```
> haroldo-page@0.1.0 build
> tinacms build && astro check && astro build

Starting Tina build

The local GraphQL schema doesn't match the remote GraphQL schema. Please push up your changes to GitHub to update your remote GraphQL schema. null

Additional info:

	Branch: main, Client ID: 8be98053-68c3-4262-b7bd-dd1286e1c7ad
	Local GraphQL version: 2.4.10 / Remote GraphQL version: 2.4.10
	Last indexed at: Thu, 03 Sep 2026 18:50:22 GMT
	Reason: [NON_BREAKING - TYPE_ADDED] Type 'PerfilEnFormacao' was added

Error: The local GraphQL schema doesn't match the remote GraphQL schema. Please push up your changes to GitHub to update your remote GraphQL schema. null
...
  errorCode: 'ERR_CLOUD_CHECK_FAILED'
```

Bloqueio esperado (README da fase 1): o TinaCloud só reindexa depois do push em `main`. Diagnóstico
separado, rodado só para provar que a falha é exclusivamente do cloud-check (não usado como
substituto do `npm run build` oficial):

```
$ npx tinacms build --skip-cloud-checks
Starting Tina build
│
○  Tina build complete ─────────────────────────────────────────────
│  🦙 Tina Config
│     API url: https://content.tinajs.io/2.4/content/8be98053-68c3-4262-b7bd-dd1286e1c7ad/github/main
│  🤖 Auto-generated files
│     GraphQL Client:   tina/__generated__/client.ts
│     Typescript Types: tina/__generated__/types.ts
│     Static HTML file: public/admin/index.html
├─────────────────────────────────────────────────────────────────

$ npx astro check
16:26:36 [content] Syncing content
16:26:36 [content] Content config changed
16:26:36 [content] Clearing content store
[WARN] [glob-loader] No files found matching "**/*.md" in directory "content\disciplinas"
[WARN] [glob-loader] No files found matching "**/*.md" in directory "content\projetos"
[WARN] [glob-loader] No files found matching "**/*.md" in directory "content\linhas-pesquisa"
[WARN] [glob-loader] No files found matching "**/*.md" in directory "content\publicacoes"
16:26:36 [content] Synced content
16:26:36 [types] Generated 445ms
16:26:36 [check] Getting diagnostics for Astro files in S:\Projetos\academic_page\haroldo...
Result (16 files):
- 0 errors
- 0 warnings
- 0 hints

$ npx astro build
16:26:45 [content] Syncing content
[WARN] [glob-loader] No files found matching "**/*.md" in directory "content\linhas-pesquisa"
[WARN] [glob-loader] No files found matching "**/*.md" in directory "content\projetos"
[WARN] [glob-loader] No files found matching "**/*.md" in directory "content\disciplinas"
[WARN] [glob-loader] No files found matching "**/*.md" in directory "content\publicacoes"
16:26:45 [content] Synced content
16:26:45 [types] Generated 394ms
16:26:45 [build] output: "static"
16:26:45 [build] mode: "static"
16:26:45 [build] directory: S:\Projetos\academic_page\haroldo\dist\
16:26:45 [build] Collecting build info...
16:26:45 [build] ✓ Completed in 427ms.
16:26:45 [build] Building static entrypoints...
[vite] ✓ built in 163ms
[vite] ✓ built in 45ms
16:26:45 [build] Rearranging server assets...
 generating static routes
16:26:45   ├─ /index.html (+9ms)
16:26:45 ✓ Completed in 19ms.
16:26:45 [build] ✓ Completed in 257ms.
16:26:45 [build] 1 page(s) built in 694ms
16:26:45 [build] Complete!
```

Os três (`tinacms build --skip-cloud-checks`, `astro check`, `astro build`) fecharam verdes — o
schema em si está correto; só o cloud-check (que compara com o que o TinaCloud indexou em `main`)
está pendente do push. **Correção da leitura do `git status --porcelain` na primeira versão desta
Evidência:** naquele momento (antes de o orquestrador rodar `tinacms dev`) o `git status
--porcelain` mostrava só os três arquivos de código deste plano — `tina/tina-lock.json` e os
diretórios gerados (`tina/__generated__`, `dist/`, `public/admin`) não estavam no diff. Isso deixou
de valer: o orquestrador regenerou `tina/tina-lock.json` depois (ver "Arquivos alterados" acima), e
o commit final vai incluir esse arquivo — `git status --porcelain` no estado atual mostra:

```
 M plans/fase-1-modelo-de-conteudo/018-grupo-versao-em-ingles.md
 M src/content.config.ts
 M tests/content/schemas.test.ts
 M tina/config.ts
 M tina/tina-lock.json
```

`tina/__generated__`, `dist/` e `public/admin` continuam fora do diff versionado (gitignorados).
Nota para o próximo plano que mexer em schema: `tinacms build --skip-cloud-checks` **não**
regenera o lock — só `tinacms dev` o faz. É o que produziu a leitura equivocada acima.

### Verificação pelo painel (passo 5 do plano) — feita pelo orquestrador

> Verificado pelo orquestrador no painel em 2026-09-03 (`tinacms dev` + `astro dev`, coleção
> "Linhas de pesquisa", documento novo): o grupo aparece como painel recolhido rotulado "Versão em
> inglês (opcional)", com a descrição em português, posicionado depois de todos os campos em PT.
> Abrindo-o, o subpainel mostra "Título (EN)", "Resumo (EN)" e "Texto completo (EN)", nenhum
> marcado como obrigatório. Preenchendo só "Título (EN)" e "Texto completo (EN)" e deixando
> "Resumo (EN)" vazio, o save gravou:
>
> ```
> ---
> publicado: false
> titulo: Buracos Negros e Gravitacao
> resumo: Estudo de solucoes de buracos negros em teorias de gravitacao modificada.
> en:
>   titulo: Black Holes and Gravitation
>   corpo: Full English text of the research line.
> ---
> ```
>
> `en` aninhado no mesmo arquivo (D-03), `en.resumo` ausente por estar vazio (RN-09), nenhum
> arquivo espelhado criado. `npx astro check` com esse arquivo presente sincronizou o conteúdo com
> 0 erros — o Zod aceita o frontmatter que o painel escreve. O arquivo de teste foi removido em
> seguida. `content/perfil/index.md` não foi aberto nem salvo, de propósito, para preservar o
> comentário da Q-07.

Essa verificação confirma, no painel real, os dois critérios que dependiam dele: o grupo `en`
recolhível posicionado depois dos campos em PT, e o arquivo único por item (D-03, sem par
espelhado).

### Pendente — não é meu

- **`npm run build` completo:** bloqueado externamente até o push (`ERR_CLOUD_CHECK_FAILED`, ver
  acima). Caixa deixada vazia, não reescrita para caber no resultado.
- **`Status:` continua `TODO`** — a promoção para `DONE` é do orquestrador, depois de verificação
  independente e nova revisão aprovada.
