# Plano 016 — Schemas Zod das cinco coleções em `src/content.config.ts`

**Status:** DONE
**RFs cobertos:** base de RF-04 a RF-10; §7.3; D-06 (metade Zod); RN-01, RN-07
**Depende de:** plano 014 (Astro 7). **Independente do 015** — pode rodar em paralelo com ele.
**Modelo recomendado:** sonnet
**Agente recomendado:** implementer
**PRD:** `S:\Projetos\academic_page\haroldo\PRD.md`
**Projeto:** `S:\Projetos\academic_page\haroldo`

## Objetivo

`src/content.config.ts` define as cinco coleções da §7.3 com schemas Zod, usando a Content
Layer API do Astro 7. O `astro check` valida os tipos e o `astro build` reconhece as coleções.

## Arquivos afetados

- `src/content.config.ts` — criar
- `tests/content/schemas.test.ts` — criar (testes dos schemas)

> Não toque em `tina/config.ts` (planos 015 e 017) nem crie conteúdo de exemplo além do mínimo
> que os testes exigirem (o placeholder é o plano 020).

## Contexto necessário

**Projeto.** `haroldo-page` — site acadêmico do Prof. Haroldo C. D. Lima Junior (UFMA).
Astro **7.2.10**, TypeScript strict, Vitest. `content/` está vazio (só `.gitkeep`).

### ⚠️ Astro 7 mudou a API — não copie exemplo de Astro 4 ou 5

O upgrade do plano 014 trouxe mudanças que **quebram** todo tutorial mais antigo:

- **Coleções legadas foram removidas.** Use a **Content Layer API** com o loader `glob()`.
  `legacy.collections` não existe mais.
- **Zod 4.** `z.string().email()` virou `z.email()`. As mensagens de erro mudaram de estrutura.
- **Imports consolidados:** o `z` vem de **`astro/zod`**. `astro:schema` e o `z` exportado por
  `astro:content` não existem mais.
- **`schema` como função foi removido**; para schema dinâmico usa-se `createSchema()`.

O arquivo é `src/content.config.ts` (raiz de `src/`), não `src/content/config.ts`.

### As cinco coleções (§7.3 do PRD — fonte de verdade, transcreva, não invente)

**`perfil`** — singleton, `content/perfil/index.md`. `nome`✔ · `cargo`✔ · `instituicao`✔ ·
`departamento` · `foto` (imagem) · `bio`✔ (corpo) · `resumo_home`✔ · `formacao[]`
(`{grau, curso, instituicao, ano}`) · `areas[]` · `email`✔ · `links` (objeto com `lattes`,
`orcid`, `scholar`, `arxiv`, `researchgate`, `github`, `institucional`, todos opcionais) ·
`cv_url`. **Sem `publicado`** — é singleton, não coleção de listagem.

**`linhas-pesquisa`** — `content/linhas-pesquisa/*.md`. `titulo`✔ · `ordem` (número) ·
`resumo`✔ · `corpo` · `imagem` · `publicado`✔.

**`projetos`** — `content/projetos/*.md`. `titulo`✔ · `periodo` (`{inicio, fim?}`) ·
`financiador` · `status` (`em andamento` | `concluído`) · `descricao`✔ · `colaboradores[]`
(string livre) · `linha_relacionada` (referência a `linhas-pesquisa`, opcional) · `publicado`✔.

**`disciplinas`** — `content/disciplinas/*.md`. `nome`✔ · `codigo` · `semestre`✔ (livre, ex.
`2026.2`) · `status`✔ (`atual` | `anterior`) · `descricao` · `ementa` · `bibliografia[]`
(`{referencia, url?}`) · `aulas[]` (`{numero, titulo, data?, descricao?, url}`) · `listas[]`
(`{titulo, data_entrega?, url}`) · `materiais[]` (`{titulo, tipo: slides|notas|complementar,
descricao?, url}`) · `links[]` (`{titulo, url}`) · `publicado`✔.

**`publicacoes`** — `content/publicacoes/*.md`. `titulo`✔ · `autores[]`✔ (ordem preservada) ·
`ano`✔ (**validado entre 1900 e 2100**, F-09) · `veiculo` · `tipo`✔ (`artigo` | `preprint` |
`capítulo` | `livro` | `anais` | `tese` | `outro`) · `doi` · `arxiv` · `pdf_url` · `resumo` ·
`palavras_chave[]` · `destaque` · `publicado`✔.

**Não crie a coleção `noticias`.** A §7.3 a marca como v1.1, fora do MVP (NG-01).

### Regras que o schema materializa

- **RN-01 / D-04:** `publicado` existe em **toda** coleção de listagem — as quatro, não em
  `perfil`. Não invente default silencioso; decida e documente se o campo é obrigatório ou tem
  default, e qual.
- **D-05:** `aulas`, `listas` e `materiais` são **listas embutidas** no arquivo da disciplina,
  não coleções separadas.
- **D-07:** todo campo de material é **URL livre**, agnóstica ao hospedeiro. **Não** valide
  domínio do Google Drive. Valide que é URL, nada além.
- **RN-07:** campos factuais (DOI, arXiv, ano, links, imagens, e-mail) existem uma única vez.

**O grupo `en` NÃO entra aqui** — é o plano 018, que o acrescenta às coleções traduzíveis.
Escreva os schemas de modo que acrescentá-lo depois não exija reescrever tudo.

### Testes

A §11 exige teste unitário; o `vitest.config.ts` cobre `src/lib/` e `src/i18n/` — **não cobre
`src/content.config.ts`**. Ou amplie o `include` da cobertura, ou registre por que não. Teste no
mínimo: `ano` fora de 1900–2100 rejeitado; `tipo` fora do enum rejeitado; `status` de disciplina
fora do enum rejeitado; campo obrigatório ausente rejeitado com mensagem útil.

⚠️ **Prove que os testes são falsificáveis.** A lição 9 da fase 0 vale aqui: injete um valor
canário e confirme que o teste de fato falha antes de declará-lo verde.

**Ambiente.** Windows 11 / PowerShell. Node 24.16.0.

## Passos

1. Ler a §7.3 do PRD inteira e transcrever os campos — não trabalhe de memória.
   → verify: cada campo do PRD tem correspondente no schema; liste as divergências, se houver.
2. Escrever `src/content.config.ts` com as cinco coleções, loader `glob()`, `z` de `astro/zod`.
   → verify: `npm run build` com `0 errors, 0 warnings, 0 hints`.
3. Escrever os testes dos schemas.
   → verify: `npm run test` verde, com o número de testes crescendo.
4. Provar a falsificabilidade de pelo menos os testes de `ano`, `tipo` e `status`.
   → verify: cole a saída da execução com o canário, mostrando a falha esperada.
5. Decidir sobre a cobertura de `src/content.config.ts` no `vitest.config.ts`.
   → verify: decisão registrada com motivo.

## Critérios de aceitação

- [x] `src/content.config.ts` com as **cinco** coleções da §7.3 — sem `noticias`
- [x] Content Layer API com `glob()`; `z` importado de `astro/zod`; nada de `astro:schema`
- [x] `publicado` nas quatro coleções de listagem; ausente em `perfil`, com o motivo escrito
- [x] `ano` de publicação validado entre **1900 e 2100** (F-09)
- [x] `tipo` de publicação e `status` de disciplina como enums fechados
- [x] Campos de material como **URL livre**, sem validação de domínio (D-07)
- [x] Aulas, listas e materiais **embutidos** na disciplina (D-05)
- [x] Grupo `en` **não** incluído — é o plano 018
- [x] Testes dos schemas passando **e provados falsificáveis** com canário
- [x] `npm run lint`, `npm run format:check`, `npm run test` e `npm run build` verdes
- [x] Cabeçalho de arquivo e docstrings conforme §10.1 e §10.2

## Evidência

### Contagem de testes

- Antes: **14** testes (`tests/lib/slug.test.ts` + `tests/lib/config.test.ts`).
- Depois: **59** testes (14 + 45 novos em `tests/content/schemas.test.ts`).

### Divergências entre a §7.3 e o schema

Nenhuma no mapeamento de campos: as cinco coleções, os tipos, os três enums (`status` de
projeto, `status` de disciplina, `tipo` de publicação), a faixa 1900–2100 de `ano` (F-09),
`publicado` nas quatro coleções de listagem e sua ausência em `perfil`, as listas embutidas de
disciplina (D-05), a URL livre sem validação de domínio (D-07), a ausência de `noticias` e do
grupo `en` — tudo bate com a leitura literal da §7.3 (linhas 384–455 do `PRD.md`).

**Divergência de leitura assumida (decisão registrada no 2º ciclo de revisão):** os quatro
campos "rich-text" da §7.3 (`bio`, `corpo`, `ementa`, `resumo`) são modelados como campos de
frontmatter (`z.string()`), não como o corpo do arquivo Markdown. A justificativa não é a mesma
para os quatro:

- `bio` (perfil) é o único **obrigatório** (✔) e o único que a §7.3 rotula como "corpo do
  arquivo". Para ele, a razão é técnica: a Content Layer API só valida `data` (frontmatter) pelo
  schema Zod — o corpo do arquivo (`render()`) fica fora do alcance do Zod —, então
  "obrigatório" deixaria de ser verificável se `bio` fosse o corpo. Casa com o que o plano 015
  já gravou em `content/perfil/index.md`: `bio` é campo de frontmatter.
- `corpo` (linhas-pesquisa), `ementa` (disciplinas) e `resumo` (publicacoes) são **opcionais**
  na §7.3 — para campo opcional a Content Layer API valida "presente ou ausente" igualmente bem
  em `data` ou no corpo via `render()` (o padrão mais idiomático da Content Layer API para texto
  longo). Mantê-los em frontmatter é só **escolha de consistência e simplicidade** desta fase
  (os quatro tratados pelo mesmo mecanismo de leitura), não necessidade técnica. Optei por manter
  os quatro em frontmatter (opção **b** da revisão) porque `content/perfil/index.md`, já em
  `main`, tem `bio` como frontmatter, e a fase 3 — que decide como esse texto longo é renderizado
  — ainda não começou; mudar a forma de armazenamento agora seria decidir por uma fase que não
  chegou. Fica registrado para que os planos 017 (schema do Tina) e 019 (paridade Zod × Tina)
  decidam conscientemente se preservam essa escolha ou migram os três opcionais para corpo do
  arquivo. O comentário correspondente em `src/content.config.ts` (cabeçalho do arquivo, bloco
  "Notas") foi reescrito nesse sentido no 2º ciclo de revisão.

### As três provas de falsificabilidade (canário), sobre a suíte já refatorada (schemas exportados nomeadamente)

**Canário 1 — `status` de disciplina e `tipo` de publicação, juntos** (`status: z.enum(['atual',
'anterior', 'futura'])` e `tipo` com `'blog post'` acrescentado ao enum):

```
❯ tests/content/schemas.test.ts (45 tests | 2 failed) 20ms
     × rejeita `status` fora do enum `atual` | `anterior` 4ms
     × rejeita `tipo` fora do enum fechado 0ms

 FAIL  tests/content/schemas.test.ts > coleção disciplinas > rejeita `status` fora do enum `atual` | `anterior`
AssertionError: expected true to be false // Object.is equality
 ❯ tests/content/schemas.test.ts:150:31

 FAIL  tests/content/schemas.test.ts > coleção publicacoes > rejeita `tipo` fora do enum fechado
AssertionError: expected true to be false // Object.is equality
 ❯ tests/content/schemas.test.ts:233:31

 Test Files  1 failed (1)
      Tests  2 failed | 43 passed (45)
```

Revertido (`status: z.enum(['atual', 'anterior'])`; `tipo` sem `'blog post'`):

```
 Test Files  3 passed (3)
      Tests  59 passed (59)
```

**Canário 2 — `ano` de publicação** (`ano: z.number().int()`, sem `.min(1900).max(2100)`):

```
❯ tests/content/schemas.test.ts (45 tests | 4 failed) 22ms
     × rejeita `ano` fora de 1900–2100 (F-09): 1899
     × rejeita `ano` fora de 1900–2100 (F-09): 2101
     × rejeita `ano` fora de 1900–2100 (F-09): 1000
     × rejeita `ano` fora de 1900–2100 (F-09): 3000

 FAIL  tests/content/schemas.test.ts > coleção publicacoes > rejeita `ano` fora de 1900–2100 (F-09): 1899
AssertionError: expected true to be false // Object.is equality
 ❯ tests/content/schemas.test.ts:221:31

 Test Files  1 failed (1)
      Tests  4 failed | 41 passed (45)
```

Revertido (`ano: z.number().int().min(1900).max(2100)`):

```
 Test Files  3 passed (3)
      Tests  59 passed (59)
```

Todos os três canários (`ano`, `tipo`, `status`) foram provados **depois** da refatoração que
passou a expor os schemas como `const` exportados nomeadamente (`perfilSchema`,
`linhasPesquisaSchema`, `projetosSchema`, `disciplinasSchema`, `publicacoesSchema`), não
reaproveitando a prova anterior à refatoração.

### `npm run lint`

```
> haroldo-page@0.1.0 lint
> eslint .

exit code: 0
```

### `npm run format:check`

```
> haroldo-page@0.1.0 format:check
> prettier --check .

Checking formatting...
All matched files use Prettier code style!
```

### `npm run test:coverage`

```
> haroldo-page@0.1.0 test:coverage
> vitest run --coverage

 Test Files  3 passed (3)
      Tests  59 passed (59)

 % Coverage report from v8
Statements   : 100% ( 21/21 )
Branches     : 100% ( 2/2 )
Functions    : 100% ( 1/1 )
Lines        : 100% ( 21/21 )
```

O reporter `text` sai com a tabela por arquivo vazia (defeito cosmético conhecido do v8 no
Windows, já registrado no README da fase 0). Cobertura por arquivo lida do relatório HTML em
`coverage/src/*.html`: `content.config.ts` — 100% statements/branches/functions/lines;
`lib/config.ts` — 100%; `lib/slug.ts` — 100%.

### `npm run build` — duas rodadas consecutivas

O bloqueio `ERR_CLOUD_CHECK_FAILED` do plano 015 foi resolvido (indexação do TinaCloud); o
`content/perfil/index.md` incompleto também foi corrigido fora deste plano. As duas rodadas
completam de ponta a ponta (`tinacms build` → `astro check` → `astro build`):

**Rodada 1:**
```
Tina build complete — GraphQL Client, Typescript Types e public/admin/index.html gerados.
[check] Getting diagnostics for Astro files...
Result (16 files):
- 0 errors
- 0 warnings
- 0 hints
[build] output: "static"
[build] ✓ Completed in 401ms.
[build] 1 page(s) built in 1.08s
[build] Complete!
```

**Rodada 2:**
```
Tina build complete — GraphQL Client, Typescript Types e public/admin/index.html gerados.
[check] Getting diagnostics for Astro files...
Result (16 files):
- 0 errors
- 0 warnings
- 0 hints
[build] output: "static"
[build] ✓ Completed in 395ms.
[build] 1 page(s) built in 1.09s
[build] Complete!
```

### Decisão sobre a cobertura (vitest.config.ts)

Ampliado o `include` de `vitest.config.ts` para incluir `src/content.config.ts`, com o motivo
registrado em comentário no próprio arquivo: antes da ampliação a cobertura relatava 100% de 3
statements sem medir nada (`src/content.config.ts` não existia ainda) — rede de proteção falsa
por omissão, apontada na revisão do plano 015. Com os 45 testes novos, a cobertura de
`content.config.ts` passou a ser uma medição real (100% de 21 statements na versão final, após a
extração dos schemas nomeados), e o threshold de 80% imposto pelo `vitest.config.ts` continua
sendo cumprido de verdade.

### Verificação autoritativa (execução independente, `triage-runner`)

Rodada separada da do executor, itens referentes a este plano:

```
npm ci
→ lockfile não reescrito.

npm run lint
→ exit 0.

npm run format:check
→ All matched files use Prettier code style!

npm run test:coverage
→ Test Files  3 passed (3)
   Tests  59 passed (59)
   Statements   : 100% ( 21/21 )
   Branches     : 100% ( 2/2 )
   Functions    : 100% ( 1/1 )
   Lines        : 100% ( 21/21 )
   Por arquivo (reporter HTML): src/content.config.ts 100% (18/18);
   src/lib/config.ts 100% (2/2); src/lib/slug.ts 100% (1/1) — prova de que
   a ampliação do `include` no vitest.config.ts mede o arquivo de verdade:
   18 dos 21 statements medidos são dele.

npm run build
→ verde nas duas rodadas consecutivas; astro check 0 errors, 0 warnings, 0 hints.

src/content.config.ts
→ cinco coleções, sem `noticias`, sem grupo `en`.

grep por `as any`, `@ts-ignore`, `@ts-expect-error` e non-null assertion
em src/content.config.ts e tests/content/schemas.test.ts
→ nenhuma ocorrência.
```

### Nota de fechamento — o que fica em aberto para os próximos planos

- A decisão dos três campos rich-text **opcionais** (`corpo`, `ementa`, `resumo`) — mantidos em
  frontmatter por consistência/simplicidade desta fase, não por necessidade técnica — fica para
  os planos **017** (schema do Tina) e **019** (paridade Zod × Tina) confirmarem ou migrarem para
  corpo do arquivo via `render()`, quando a fase 3 definir como esse texto longo é renderizado.
  `bio` (perfil) não entra nessa reabertura: é obrigatório e a razão de estar em frontmatter é
  técnica, não de preferência.
- O plano **019** vai comparar este schema (`src/content.config.ts`) com o `tina/config.ts` do
  plano **017** — é exatamente por isso que os dois transcrevem a §7.3 de forma independente, em
  vez de um copiar do outro: para que a comparação de paridade tenha algum poder de detectar
  divergência real, em vez de comparar uma cópia consigo mesma.
