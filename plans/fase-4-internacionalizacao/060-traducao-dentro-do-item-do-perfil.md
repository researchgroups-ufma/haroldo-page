# Plano 060 — Tradução dentro do item: `formacao[]`, `atuacao[]` e `areas[]` (Decisões 7 e 8)

**Status:** DONE
**RFs cobertos:** RF-14, RN-06, RN-07, RN-09, RNF-09 (paridade), D-06; sabatina fase 4, Decisões 7 e 8; §12 fase 4, item 9
**Depende de:** plano 055 (comparador)
**Modelo recomendado:** sonnet
**Agente recomendado:** implementer
**Executável por:** agente (schema, testes, migração) + **orquestrador** (painel local, push e `npm run build` com cloud check — ordem de fechamento de plano que muda schema)
**PRD:** `S:\Projetos\academic_page\haroldo\PRD.md`
**Projeto:** `S:\Projetos\academic_page\haroldo`

## Objetivo

A tradução de cada item de lista do perfil passa a viver **dentro do próprio item**:
`formacao[i].en.{grau, curso}`, `atuacao[i].en.cargo` e `areas[i] = { nome, en?: { nome? } }`. Saem
as listas paralelas `perfil.en.formacao` e `perfil.en.areas`. Zod, Tina, lock e paridade mudam
juntos; o único conteúdo migrado é o formato de `areas`. As páginas PT continuam **idênticas**.

## Arquivos afetados

- `src/content.config.ts` — schemas de `formacao`, `atuacao`, `areas` e do grupo `en` do perfil; docstrings e cabeçalho
- `tina/config.ts` — os mesmos campos no painel
- `tina/tina-lock.json` — regenerado (não editar à mão)
- `tests/content/schemas.test.ts` — casos de `perfil` que mudam
- `tests/content/paridade-schema.test.ts` — um teste novo para o `en` dentro de item de lista
- `content/perfil/index.md` — **migração autorizada**: só `areas`, de lista de string para lista de `{ nome }`
- `src/pages/index.astro` — só `{area}` → `{area.nome}` (único consumidor de `areas`, grep de 2026-09-24; `src/lib/profile.ts` não lê `areas`)

> O executor não toca em arquivo fora desta lista. Se precisar, para e reporta. `Status:` fica `TODO`.
> Não commite. **Este é o único plano da fase que muda o schema.**

## Contexto necessário

**Decisão 7** (`docs/sabatinas/CHANGELOG_sabatina_fase-4-i18n.md`): cada item carrega a própria
tradução — reordenar no painel leva a tradução junto, e o desalinhamento deixa de ser possível por
construção. Saem `perfil.en.formacao` e `perfil.en.areas`. **Decisão 8:** `atuacao[]` traduz **só
`cargo`**; `instituicao` e `periodo` ficam únicos. **Decisão de fatiamento 11** (README da fase):
`areas[i].en` é grupo `{ nome? }`, no mesmo formato de grupo dos outros dois.

**Estado atual, `src/content.config.ts`:** `formacaoSchema` (95–100), `atuacaoSchema` (107–111),
`formacaoEnSchema` (137–142, a lista paralela), `perfilEnSchema` (153–163, com `formacao` e `areas`
paralelas), `perfilSchema` (174–191, `areas: z.array(z.string()).optional()`). Todo grupo `en` é
`.optional()` e `.strict()` (um campo factual colado dentro dele é rejeitado — RN-07), e todo campo
dentro dele é opcional (RN-09).

**Alvo (Zod):**

```ts
const formacaoEnSchema = z.object({ grau: z.string().optional(), curso: z.string().optional() }).strict();
const formacaoSchema = z.object({ grau, curso, instituicao, ano, en: formacaoEnSchema.optional() });
const atuacaoEnSchema = z.object({ cargo: z.string().optional() }).strict();
const atuacaoSchema = z.object({ cargo, instituicao, periodo, en: atuacaoEnSchema.optional() });
const areaEnSchema = z.object({ nome: z.string().optional() }).strict();
const areaSchema = z.object({ nome: z.string(), en: areaEnSchema.optional() });
// perfilEnSchema: sem `formacao` e sem `areas`; perfilSchema.areas: z.array(areaSchema).optional()
```

Os objetos de item (`formacaoSchema`, `atuacaoSchema`, `areaSchema`) **não** são `.strict()` hoje;
não mude isso.

**Alvo (Tina, `tina/config.ts`):** `formacao` (155–178) e `atuacao` (179–202) ganham, como último
subcampo, `{ type: 'object', name: 'en', label: 'Versão em inglês (opcional)', fields: [...] }` com
`grau`/`curso` (rótulos "Grau (EN)", "Curso (EN)") e `cargo` ("Cargo (EN)"), nenhum `required`.
`areas` (203–209) vira `type: 'object', list: true`, com `nome` (`required: true`, rótulo "Área") e o
mesmo grupo `en` com `nome` ("Área (EN)"); `ui.itemProps` com `label: item?.nome || 'Nova área'`
(padrão de `formacao`, linhas 161–165). Do grupo `en` do perfil (238–286) saem `formacao` (260–276) e
`areas` (277–284). `description` em vocabulário do professor (RF-03: nada de "lista paralela",
"índice", "arquivo").

**Lock:** só se regenera por `tinacms dev`. Precedente (plano 017): `npx tinacms dev -c "echo ready"`,
com a porta 9000 livre; se o processo sobreviver, mate o `node` do `tinacms` (plano 022: "Datalayer
server is busy" trava o build seguinte). `tests/content/tina-lock-coerente.test.ts` reprova lock
defasado — é o portão do CI e do `build:pipeline`.

**Paridade:** `tests/content/paridade-schema.test.ts` já desce recursivamente em objeto e em lista de
objeto (`classifyZod`/`classifyTina`, linhas 187–259), então os campos novos entram na comparação sem
mudar o normalizador. Acrescente um teste explícito, no bloco "três falsos positivos…" ou num
`describe` próprio: o `en` de **item** de `formacao`, `atuacao` e `areas` existe dos dois lados e
nenhum subcampo é obrigatório (espelho do teste das linhas 455–469, que só olha o `en` da coleção).

**`tests/content/schemas.test.ts`:** os casos que usam `en.formacao` (linhas 128 e 142–145) passam a
exercitar `formacao[i].en`; acrescente: `perfil.en.formacao` e `perfil.en.areas` agora **rejeitados**
(`.strict()`); `areas: ['texto']` rejeitado (formato antigo); `areas: [{ nome }]` aceito;
`formacao[i].en.instituicao` rejeitado (RN-07); `atuacao[i].en.cargo` aceito e
`atuacao[i].en.instituicao` rejeitado (Decisão 8).

**Migração autorizada — `content/perfil/index.md`, só as linhas 33–37:**

```yaml
areas:
  - nome: Teoria da Relatividade Geral e teorias alternativas de gravitação
  - nome: Perturbações lineares em espaços-tempos curvos
  - nome: Forças de maré
  - nome: Sombras de buracos negros
```

Nenhum outro campo do arquivo muda. Nenhum perfil tem `en` hoje, então não há tradução a mover.

**Ordem de fechamento (plano que muda schema — README da fase 1, "A ordem de fechamento não é
livre"):** `revisão APROVADO → commit → push → TinaCloud reindexa → npm run build verde → Status:
DONE`. O executor valida com `npm run build:pipeline` (que usa `--skip-cloud-checks`, ADR-0009) e
**não** roda `npm run build`; o critério do `npm run build` com cloud check fica desmarcado até o
orquestrador fazê-lo depois do push. Trocar `areas` de string para objeto é mudança **incompatível**
para o TinaCloud; o conteúdo migra no mesmo commit.

**Verificação no painel (orquestrador, antes do DONE):** memória do projeto, "Verificar no painel,
não no código". Subir o painel como no plano 022 (Evidência do orquestrador): `npx astro dev
--background --force` e `npx tinacms dev` separados (`npm run dev` não serve no Astro 7). No Perfil:
(1) cada item de Formação, Atuação e Áreas tem o grupo "Versão em inglês (opcional)", recolhido; (2)
preencher `en.grau` do 2º item de formação, **reordenar** o item para o 1º lugar e salvar; (3) abrir o
`.md` gravado e colar o frontmatter: a tradução está **dentro** do item que foi movido. Armadilha do
plano 020: o formulário do Tina descarta alteração em campo que já tinha valor ao voltar de um
subpainel — confira o arquivo campo a campo. **Reverter** com `git checkout -- content/perfil/index.md`
**depois** do commit deste plano (antes dele, o checkout desfaria a migração): o painel roda sobre o
working tree do commit já feito. Encerrar `astro dev stop` e matar os `node` do `tinacms`.

**Regras de código:** README da fase 4. Cite **RN-07** nos `.strict()` e **RN-06/RN-09** no `en`
opcional; a Decisão 7 se cita como "sabatina fase 4, Decisão 7".

## Passos

1. Retrato "antes": `npm run build:pipeline`; `node scripts/comparar-dist.mjs retrato <scratch>\antes.json` → verify: fim do build colado.
2. `src/content.config.ts` e `tests/content/schemas.test.ts` → verify: `npm test -- --reporter=verbose tests/content/schemas.test.ts` colado.
3. `tina/config.ts` e o teste novo de paridade → verify: `npm test -- --reporter=verbose tests/content/paridade-schema.test.ts` colado.
4. Canário da paridade: tire temporariamente o `en` do item de `atuacao` só no Tina → a paridade reprova nomeando `perfil.atuacao[].en`; desfaça → verify: saídas coladas.
5. Migração de `content/perfil/index.md` e `src/pages/index.astro` → verify: `npm test -- --reporter=verbose tests/content` colado (inclui `conteudo-valido`).
6. Regenerar o lock → verify: saída do `tinacms dev` colada e `npm test -- tests/content/tina-lock-coerente.test.ts` verde; `git diff --stat tina/tina-lock.json` colado.
7. Comparação → verify: `npm run build:pipeline`; `retrato <scratch>\depois.json`; `comparar antes.json depois.json` colado — toda rota `IGUAL`, exit 0 (as áreas da Home saem iguais).
8. Portão → verify: `npm run lint`, `npm run format:check`, `npm run test:coverage`, `npm run test:dist` colados; `git diff -- content/` colado mostrando **só** as linhas de `areas`.
9. **Orquestrador — painel local** (Contexto) → verify: frontmatter gravado colado; reversão provada.
10. **Orquestrador — depois do push:** TinaCloud reindexa; `npm run build` **com** cloud check → verify: saída colada; CI e Workers Builds verdes no commit.

## Critérios de aceitação

- [x] Zod e Tina com `formacao[i].en.{grau,curso}`, `atuacao[i].en.cargo` e `areas[i] = { nome, en?: { nome? } }`; sem `perfil.en.formacao` nem `perfil.en.areas`
- [x] Paridade verde, com o teste novo do `en` de item e o canário do passo 4 vermelho
- [x] `schemas.test.ts` cobre os formatos novos e rejeita os antigos e os campos factuais no `en` do item
- [x] `tina/tina-lock.json` regenerado; `tina-lock-coerente` verde
- [x] Só `areas` mudou em `content/perfil/index.md`; `conteudo-valido` verde
- [x] Páginas PT idênticas: comparador com toda rota `IGUAL`
- [x] Painel: grupo "Versão em inglês" dentro de cada item, e a tradução acompanha o item reordenado (orquestrador)
- [x] `npm run build` **com cloud check** verde depois do push (orquestrador)
- [x] `astro check`, `lint`, `format:check`, `test:coverage`, `build:pipeline`, `test:dist` verdes, com saída colada

## Evidência

### Correções dos ciclos de revisão 1, 2 e 3 (REPROVADO)

A revisão reprovou por citação trocada: `src/content.config.ts:188-189` e `:201`, e
`tests/content/schemas.test.ts:216` e `:224` diziam "(sabatina fase 4, Decisão de fatiamento
11)". Na sabatina, a Decisão 11 é outra ("O executor escreve o `en.ts`…",
`docs/sabatinas/CHANGELOG_sabatina_fase-4-i18n.md:186`); a de `areas[].en` como grupo é a
**decisão 11 do fatiamento**, do README da fase 4, e a forma já usada no projeto é "decisão N do
fatiamento da fase 4" (`src/components/SiteHeader.astro:31`, `src/i18n/en.ts:79`). Corrigidos os
quatro pontos, mais `tina/config.ts:82` (mesma forma, mantendo "sabatina fase 4, Decisões 7 e 8"
como estava):

- `src/content.config.ts` (docstring de `areaEnSchema`): "dentro do item de lista (decisão 11 do
  fatiamento da fase 4 — README da fase 4)."
- `src/content.config.ts` (docstring de `areaSchema`): "para carregar a tradução dentro do
  próprio item (decisão 11 do fatiamento da fase 4), no mesmo formato de `en`..."
- `tina/config.ts` (nota do cabeçalho): "(sabatina fase 4, Decisões 7 e 8; decisão 11 do
  fatiamento da fase 4 — README da fase 4, plano 060)..."
- `tests/content/schemas.test.ts` (dois nomes de teste): "...(decisão 11 do fatiamento da fase
  4)", sem o prefixo "sabatina".

Acrescentado também o caso pedido: `areas[i].en` com campo desconhecido rejeitado (`.strict()`
de `areaEnSchema`), citando a decisão 11 do fatiamento da fase 4 — sem RN-07, que não se aplica
aqui (`areas` não tem campo factual dentro do item).

Comando: `grep -rn "Decisão de fatiamento" src tina tests`

```
EXIT=1
```

Depois das edições, `tina/config.ts` mudou só em comentário (nenhum campo, rótulo ou descrição de
formulário) — conferido que isso não altera o `tina-lock.json`:

Comando: `npm test -- tests/content/tina-lock-coerente.test.ts  (depois de corrigir o comentário de tina/config.ts, antes do rebuild)`

```
﻿
> haroldo-page@0.1.0 test
> vitest run tests/content/tina-lock-coerente.test.ts


 RUN  v4.1.11 S:/Projetos/academic_page/haroldo


 Test Files  1 passed (1)
      Tests  7 passed (7)
   Start at  16:16:16
   Duration  207ms (transform 59ms, setup 0ms, import 80ms, tests 4ms, environment 0ms)

EXIT=0
```

Comando: `git diff --stat tina/tina-lock.json` (capturado no ciclo 3, depois de todas as edições)

```
 tina/tina-lock.json | 2 +-
 1 file changed, 1 insertion(+), 1 deletion(-)
EXIT=0
```

Os blocos dos passos 2, 3, 7 e 8, abaixo, são recapturas feitas depois das correções (`.txt` com
sufixo `-v2` ou `-v3`). Os blocos dos passos 1, 4, 5 e 6 são as capturas originais, anteriores às
correções: o do passo 5 mostra os nomes antigos dos dois testes de `areas` ("rejeita `areas` como
lista de string…" e "aceita `areas` como lista de `{ nome, en? }`…"), e os dos passos 4 e 6 leram
`tina/config.ts` antes de o comentário da linha 82 mudar. O estado posterior às correções está nos
blocos do `tina-lock-coerente` e do `git diff --stat` logo acima e no bloco do passo 3.

**Ciclo 2:** a revisão seguinte apontou que o nome do teste novo citava RN-09 sem relação com a
regra testada — RN-09 (PRD, "o português é o idioma canônico; o inglês é opcional") não tem
relação com rejeitar chave desconhecida por `.strict()`. Corrigido para terminar em "(decisão 11
do fatiamento da fase 4, `.strict()`)", sem o "RN-09, " inicial, no padrão já usado no teste de
`linhas-pesquisa` ("rejeita campo factual dentro de `en` — `publicado` não é traduzível
(`.strict()`)"). Nome do teste como está agora no arquivo:

> rejeita campo desconhecido dentro de `areas[i].en` — só `nome` existe no grupo (decisão 11 do
> fatiamento da fase 4, `.strict()`)

Comando: `grep -n "RN-09" tests/content/schemas.test.ts`

```
30: *                 O grupo `en` (RN-06, RN-09, plano 018) é coberto nas cinco
123:  it('aceita item sem o grupo `en` (RN-09 — português é canônico)', () => {
127:  it('aceita `en` parcial — só um campo preenchido (RN-09)', () => {
259:  it('aceita item sem o grupo `en` (RN-09 — português é canônico)', () => {
263:  it('aceita `en` parcial — só um campo preenchido (RN-09)', () => {
306:  it('aceita item sem o grupo `en` (RN-09 — português é canônico)', () => {
310:  it('aceita `en` parcial — só um campo preenchido (RN-09)', () => {
389:  it('aceita item sem o grupo `en` (RN-09 — português é canônico)', () => {
393:  it('aceita `en` parcial — só um campo preenchido (RN-09)', () => {
566:  it('aceita item sem o grupo `en` (RN-09 — português é canônico)', () => {
570:  it('aceita `en` parcial — só `resumo` preenchido (RN-09)', () => {
EXIT=0
```

No ciclo 2, além deste plano, só `tests/content/schemas.test.ts` mudou — `tina/config.ts` e
`paridade-schema.test.ts` não foram tocados. Por isso só os passos 2, 7 e 8 foram refeitos
(sufixo `-v3`, retrato novo em `depois3.json`); o passo 3 mantém a captura do ciclo 1
(sufixo `-v2`), que continua válida.

**Ciclo 3:** a revisão apontou três frases desta subseção sem base em saída colada; o parágrafo
sobre os passos 1, 4, 5 e 6 foi reescrito (acima) e o `git diff --stat` do lock passou a ter saída
capturada. Nenhum arquivo de código, teste ou conteúdo mudou no ciclo 3.

### Passo 1 — retrato "antes" (árvore limpa, HEAD `61e551e`, antes de qualquer edição)

Comando: `npm run build:pipeline`

```
﻿
> haroldo-page@0.1.0 build:pipeline
> vitest run tests/content && tinacms build --skip-cloud-checks && astro check && astro build


 RUN  v4.1.11 S:/Projetos/academic_page/haroldo


 Test Files  4 passed (4)
      Tests  112 passed (112)
   Start at  15:54:48
   Duration  984ms (transform 1.52s, setup 0ms, import 2.56s, tests 58ms, environment 0ms)

Starting Tina build
│
○  Tina build complete ───────────────────────────────────────────────────────────────────────────────────────────╮
│                                                                                                                 │
│  🦙 Tina Config                                                                                                 │
│     API url:            https://content.tinajs.io/2.4/content/8be98053-68c3-4262-b7bd-dd1286e1c7ad/github/main  │
│                                                                                                                 │
│  🤖 Auto-generated files                                                                                        │
│     GraphQL Client:     tina/__generated__/client.ts                                                            │
│     Typescript Types:   tina/__generated__/types.ts                                                             │
│     Static HTML file:   public/admin/index.html                                                                 │
│                                                                                                                 │
│                                                                                                                 │
├─────────────────────────────────────────────────────────────────────────────────────────────────────────────────╯
15:55:20 [content] Syncing content
15:55:20 [content] Synced content
15:55:20 [types] Generated 473ms
15:55:20 [check] Getting diagnostics for Astro files in S:\Projetos\academic_page\haroldo...
Result (67 files): 
- 0 errors
- 0 warnings
- 0 hints

15:55:29 [content] Syncing content
15:55:29 [content] Synced content
15:55:29 [types] Generated 425ms
15:55:29 [build] output: "static"
15:55:29 [build] mode: "static"
15:55:29 [build] directory: S:\Projetos\academic_page\haroldo\dist\
15:55:29 [build] Collecting build info...
15:55:29 [build] ✓ Completed in 460ms.
15:55:29 [build] Building static entrypoints...
15:55:29 [vite] ✓ built in 325ms
15:55:29 [vite] ✓ built in 79ms
15:55:29 [build] Rearranging server assets...

 generating static routes 
15:55:29   ├─ /404.html (+10ms) 
15:55:29   ├─ /ensino/2025-1-mecanica-classica/index.html (+3ms) 
15:55:29   ├─ /ensino/2026-2-relatividade-geral/index.html (+85ms) 
15:55:30   ├─ /ensino/index.html (+4ms) 
15:55:30   ├─ /pesquisa/index.html (+4ms) 
15:55:30   ├─ /publicacoes/index.html (+4ms) 
15:55:30   ├─ /sobre/index.html (+4ms) 
15:55:30   ├─ /index.html (+3ms) 
15:55:30 ✓ Completed in 146ms.

15:55:30 [build] ✓ Completed in 634ms.
15:55:30 [build] 8 page(s) built in 1.15s
15:55:30 [build] Complete!
EXIT=0
```

Comando: `node scripts/comparar-dist.mjs retrato <scratch>\antes.json`

```
﻿retrato: 8 rota(s) de dist em C:\Users\andne\AppData\Local\Temp\claude\S--Projetos-academic-page-haroldo\53cca4d5-8b1a-44f1-b616-f47fe760fbbb\scratchpad\060\antes.json
EXIT=0
```

### Passo 2 — `src/content.config.ts` e `tests/content/schemas.test.ts`

Comando: `npm test -- --reporter=verbose tests/content/schemas.test.ts`

```
﻿
> haroldo-page@0.1.0 test
> vitest run --reporter=verbose tests/content/schemas.test.ts


 RUN  v4.1.11 S:/Projetos/academic_page/haroldo

 ✓ tests/content/schemas.test.ts > coleção perfil > aceita o conjunto mínimo de campos obrigatórios do §7.3 3ms
 ✓ tests/content/schemas.test.ts > coleção perfil > não exige `publicado` — é singleton, não coleção de listagem (RN-01) 1ms
 ✓ tests/content/schemas.test.ts > coleção perfil > rejeita quando falta o campo obrigatório `nome` 1ms
 ✓ tests/content/schemas.test.ts > coleção perfil > rejeita quando falta o campo obrigatório `cargo` 0ms
 ✓ tests/content/schemas.test.ts > coleção perfil > rejeita quando falta o campo obrigatório `instituicao` 0ms
 ✓ tests/content/schemas.test.ts > coleção perfil > rejeita quando falta o campo obrigatório `bio` 0ms
 ✓ tests/content/schemas.test.ts > coleção perfil > rejeita quando falta o campo obrigatório `resumo_home` 0ms
 ✓ tests/content/schemas.test.ts > coleção perfil > rejeita quando falta o campo obrigatório `email` 0ms
 ✓ tests/content/schemas.test.ts > coleção perfil > rejeita e-mail em formato inválido 0ms
 ✓ tests/content/schemas.test.ts > coleção perfil > aceita `links` com URLs válidas e todos os campos opcionais ausentes 1ms
 ✓ tests/content/schemas.test.ts > coleção perfil > aceita `atuacao` com cargo, instituição e período em texto livre 1ms
 ✓ tests/content/schemas.test.ts > coleção perfil > rejeita item de `atuacao` sem o campo obrigatório `cargo` 0ms
 ✓ tests/content/schemas.test.ts > coleção perfil > rejeita item de `atuacao` sem o campo obrigatório `instituicao` 0ms
 ✓ tests/content/schemas.test.ts > coleção perfil > rejeita item de `atuacao` sem o campo obrigatório `periodo` 0ms
 ✓ tests/content/schemas.test.ts > coleção perfil > aceita item sem o grupo `en` (RN-09 — português é canônico) 0ms
 ✓ tests/content/schemas.test.ts > coleção perfil > aceita `en` parcial — só um campo preenchido (RN-09) 0ms
 ✓ tests/content/schemas.test.ts > coleção perfil > aceita `en` vazio (`{}`) 0ms
 ✓ tests/content/schemas.test.ts > coleção perfil > rejeita campo factual dentro de `en` — `nome` não é traduzível (RN-07, `.strict()`) 0ms
 ✓ tests/content/schemas.test.ts > coleção perfil > rejeita `en.formacao` — a lista paralela saiu; a tradução vive dentro do item (sabatina fase 4, Decisão 7, `.strict()`) 0ms
 ✓ tests/content/schemas.test.ts > coleção perfil > rejeita `en.areas` — a lista paralela saiu; a tradução vive dentro do item (sabatina fase 4, Decisão 7, `.strict()`) 0ms
 ✓ tests/content/schemas.test.ts > coleção perfil > aceita `formacao[i].en.{grau,curso}` — tradução dentro do próprio item (sabatina fase 4, Decisão 7) 1ms
 ✓ tests/content/schemas.test.ts > coleção perfil > rejeita campo factual dentro de `formacao[i].en` — `instituicao` não é traduzível (RN-07, `.strict()`) 0ms
 ✓ tests/content/schemas.test.ts > coleção perfil > aceita `atuacao[i].en.cargo` — só `cargo` traduz (sabatina fase 4, Decisão 8) 0ms
 ✓ tests/content/schemas.test.ts > coleção perfil > rejeita `atuacao[i].en.instituicao` — só `cargo` traduz (sabatina fase 4, Decisão 8, `.strict()`) 0ms
 ✓ tests/content/schemas.test.ts > coleção perfil > rejeita `areas` como lista de string — formato antigo, substituído por lista de objeto (decisão 11 do fatiamento da fase 4) 0ms
 ✓ tests/content/schemas.test.ts > coleção perfil > aceita `areas` como lista de `{ nome, en? }` (decisão 11 do fatiamento da fase 4) 0ms
 ✓ tests/content/schemas.test.ts > coleção perfil > rejeita campo desconhecido dentro de `areas[i].en` — só `nome` existe no grupo (decisão 11 do fatiamento da fase 4, `.strict()`) 0ms
 ✓ tests/content/schemas.test.ts > coleção linhas-pesquisa > aceita o conjunto mínimo de campos obrigatórios do §7.3 1ms
 ✓ tests/content/schemas.test.ts > coleção linhas-pesquisa > rejeita quando falta `publicado` (RN-01) 0ms
 ✓ tests/content/schemas.test.ts > coleção linhas-pesquisa > aceita `ordem` numérica opcional 0ms
 ✓ tests/content/schemas.test.ts > coleção linhas-pesquisa > aceita item sem o grupo `en` (RN-09 — português é canônico) 0ms
 ✓ tests/content/schemas.test.ts > coleção linhas-pesquisa > aceita `en` parcial — só um campo preenchido (RN-09) 0ms
 ✓ tests/content/schemas.test.ts > coleção linhas-pesquisa > aceita `en` vazio (`{}`) 0ms
 ✓ tests/content/schemas.test.ts > coleção linhas-pesquisa > rejeita campo factual dentro de `en` — `publicado` não é traduzível (`.strict()`) 0ms
 ✓ tests/content/schemas.test.ts > coleção projetos > aceita o conjunto mínimo de campos obrigatórios do §7.3 1ms
 ✓ tests/content/schemas.test.ts > coleção projetos > rejeita `status` fora do enum `em andamento` | `concluído` 0ms
 ✓ tests/content/schemas.test.ts > coleção projetos > aceita `status` dentro do enum 0ms
 ✓ tests/content/schemas.test.ts > coleção projetos > aceita `linha_relacionada` como referência à coleção linhas-pesquisa 0ms
 ✓ tests/content/schemas.test.ts > coleção projetos > aceita item sem o grupo `en` (RN-09 — português é canônico) 0ms
 ✓ tests/content/schemas.test.ts > coleção projetos > aceita `en` parcial — só um campo preenchido (RN-09) 0ms
 ✓ tests/content/schemas.test.ts > coleção projetos > aceita `en` vazio (`{}`) 0ms
 ✓ tests/content/schemas.test.ts > coleção projetos > rejeita campo factual dentro de `en` — `status` não é traduzível (RN-07, `.strict()`) 0ms
 ✓ tests/content/schemas.test.ts > coleção disciplinas > aceita o conjunto mínimo de campos obrigatórios do §7.3 1ms
 ✓ tests/content/schemas.test.ts > coleção disciplinas > rejeita `status` fora do enum `atual` | `anterior` 0ms
 ✓ tests/content/schemas.test.ts > coleção disciplinas > aceita `status` dentro do enum 0ms
 ✓ tests/content/schemas.test.ts > coleção disciplinas > rejeita quando falta `publicado` (RN-01) 0ms
 ✓ tests/content/schemas.test.ts > coleção disciplinas > aceita aulas, listas e materiais como listas embutidas (D-05) 1ms
 ✓ tests/content/schemas.test.ts > coleção disciplinas > rejeita `tipo` de material fora do enum slides|notas|complementar 0ms
 ✓ tests/content/schemas.test.ts > coleção disciplinas > aceita URL de material em qualquer hospedeiro, sem restrição de domínio (D-07) 0ms
 ✓ tests/content/schemas.test.ts > coleção disciplinas > rejeita quando a URL de uma aula não é uma URL válida 0ms
 ✓ tests/content/schemas.test.ts > coleção disciplinas > aceita item sem o grupo `en` (RN-09 — português é canônico) 0ms
 ✓ tests/content/schemas.test.ts > coleção disciplinas > aceita `en` parcial — só um campo preenchido (RN-09) 0ms
 ✓ tests/content/schemas.test.ts > coleção disciplinas > aceita `en` vazio (`{}`) 0ms
 ✓ tests/content/schemas.test.ts > coleção disciplinas > rejeita campo factual dentro de `en` — `semestre` não é traduzível (RN-07, `.strict()`) 0ms
 ✓ tests/content/schemas.test.ts > coleção disciplinas > scripts[] (RF-37, D-05) > aceita o item mínimo válido — `titulo`, `linguagem` e `codigo` 0ms
 ✓ tests/content/schemas.test.ts > coleção disciplinas > scripts[] (RF-37, D-05) > rejeita item sem `codigo` (obrigatório) 0ms
 ✓ tests/content/schemas.test.ts > coleção disciplinas > scripts[] (RF-37, D-05) > rejeita item sem `titulo` (obrigatório) 0ms
 ✓ tests/content/schemas.test.ts > coleção disciplinas > scripts[] (RF-37, D-05) > rejeita `linguagem` fora do enum python|r|matlab|bash|outro 0ms
 ✓ tests/content/schemas.test.ts > coleção disciplinas > scripts[] (RF-37, D-05) > aceita `linguagem` = python 0ms
 ✓ tests/content/schemas.test.ts > coleção disciplinas > scripts[] (RF-37, D-05) > aceita `linguagem` = r 0ms
 ✓ tests/content/schemas.test.ts > coleção disciplinas > scripts[] (RF-37, D-05) > aceita `linguagem` = matlab 0ms
 ✓ tests/content/schemas.test.ts > coleção disciplinas > scripts[] (RF-37, D-05) > aceita `linguagem` = bash 0ms
 ✓ tests/content/schemas.test.ts > coleção disciplinas > scripts[] (RF-37, D-05) > aceita `linguagem` = outro 0ms
 ✓ tests/content/schemas.test.ts > coleção disciplinas > scripts[] (RF-37, D-05) > aceita item sem `descricao`, `aula` e `url` — os três são opcionais 0ms
 ✓ tests/content/schemas.test.ts > coleção disciplinas > scripts[] (RF-37, D-05) > aceita `aula` sem correspondência em `aulas[]` — sem integridade referencial (F-13, Decisões 9 e 10) 0ms
 ✓ tests/content/schemas.test.ts > coleção disciplinas > scripts[] (RF-37, D-05) > rejeita `url` inválida 0ms
 ✓ tests/content/schemas.test.ts > coleção disciplinas > scripts[] (RF-37, D-05) > preserva `codigo` com quebras de linha e indentação literalmente 0ms
 ✓ tests/content/schemas.test.ts > coleção disciplinas > scripts[] (RF-37, D-05) > rejeita `en: { scripts: [...] }` — `scripts` não entra no grupo `en` (.strict(), Decisão 5) 0ms
 ✓ tests/content/schemas.test.ts > coleção publicacoes > aceita o conjunto mínimo de campos obrigatórios do §7.3 1ms
 ✓ tests/content/schemas.test.ts > coleção publicacoes > rejeita `ano` fora de 1900–2100 (F-09): 1899 0ms
 ✓ tests/content/schemas.test.ts > coleção publicacoes > rejeita `ano` fora de 1900–2100 (F-09): 2101 0ms
 ✓ tests/content/schemas.test.ts > coleção publicacoes > rejeita `ano` fora de 1900–2100 (F-09): 1000 0ms
 ✓ tests/content/schemas.test.ts > coleção publicacoes > rejeita `ano` fora de 1900–2100 (F-09): 3000 0ms
 ✓ tests/content/schemas.test.ts > coleção publicacoes > aceita `ano` dentro de 1900–2100 (F-09): 1900 0ms
 ✓ tests/content/schemas.test.ts > coleção publicacoes > aceita `ano` dentro de 1900–2100 (F-09): 2100 0ms
 ✓ tests/content/schemas.test.ts > coleção publicacoes > aceita `ano` dentro de 1900–2100 (F-09): 2024 0ms
 ✓ tests/content/schemas.test.ts > coleção publicacoes > rejeita `tipo` fora do enum fechado 0ms
 ✓ tests/content/schemas.test.ts > coleção publicacoes > aceita `tipo` = artigo 0ms
 ✓ tests/content/schemas.test.ts > coleção publicacoes > aceita `tipo` = preprint 0ms
 ✓ tests/content/schemas.test.ts > coleção publicacoes > aceita `tipo` = capítulo 0ms
 ✓ tests/content/schemas.test.ts > coleção publicacoes > aceita `tipo` = livro 0ms
 ✓ tests/content/schemas.test.ts > coleção publicacoes > aceita `tipo` = anais 0ms
 ✓ tests/content/schemas.test.ts > coleção publicacoes > aceita `tipo` = tese 0ms
 ✓ tests/content/schemas.test.ts > coleção publicacoes > aceita `tipo` = outro 0ms
 ✓ tests/content/schemas.test.ts > coleção publicacoes > rejeita `autores` vazio — ao menos um autor é exigido 0ms
 ✓ tests/content/schemas.test.ts > coleção publicacoes > preserva a ordem dos autores informada 1ms
 ✓ tests/content/schemas.test.ts > coleção publicacoes > rejeita quando falta `publicado` (RN-01) 0ms
 ✓ tests/content/schemas.test.ts > coleção publicacoes > aceita item sem o grupo `en` (RN-09 — português é canônico) 0ms
 ✓ tests/content/schemas.test.ts > coleção publicacoes > aceita `en` parcial — só `resumo` preenchido (RN-09) 0ms
 ✓ tests/content/schemas.test.ts > coleção publicacoes > aceita `en` vazio (`{}`) 0ms
 ✓ tests/content/schemas.test.ts > coleção publicacoes > rejeita `en.titulo` — título de artigo é dado factual, não se traduz (RN-07) 0ms
 ✓ tests/content/schemas.test.ts > coleção publicacoes > rejeita `en.autores` — autoria é dado factual, não se traduz (RN-07) 0ms
 ✓ tests/content/schemas.test.ts > coleção noticias > não existe no schema — v1.1, fora do MVP (NG-01) 1ms

 Test Files  1 passed (1)
      Tests  93 passed (93)
   Start at  16:25:55
   Duration  821ms (transform 437ms, setup 0ms, import 669ms, tests 24ms, environment 0ms)

EXIT=0
```

### Passo 3 — `tina/config.ts` e o teste novo de paridade

Comando: `npm test -- --reporter=verbose tests/content/paridade-schema.test.ts`

```
﻿
> haroldo-page@0.1.0 test
> vitest run --reporter=verbose tests/content/paridade-schema.test.ts


 RUN  v4.1.11 S:/Projetos/academic_page/haroldo

 ✓ tests/content/paridade-schema.test.ts > paridade de schema — Zod (src/content.config.ts) × Tina (tina/config.ts) > as cinco coleções existem dos dois lados, com o mesmo mapeamento de nome 2ms
 ✓ tests/content/paridade-schema.test.ts > paridade de schema — Zod (src/content.config.ts) × Tina (tina/config.ts) > coleção perfil: mesmos campos, obrigatoriedade, enums, grupo en e listas embutidas 0ms
 ✓ tests/content/paridade-schema.test.ts > paridade de schema — Zod (src/content.config.ts) × Tina (tina/config.ts) > coleção linhas-pesquisa: mesmos campos, obrigatoriedade, enums, grupo en e listas embutidas 0ms
 ✓ tests/content/paridade-schema.test.ts > paridade de schema — Zod (src/content.config.ts) × Tina (tina/config.ts) > coleção projetos: mesmos campos, obrigatoriedade, enums, grupo en e listas embutidas 0ms
 ✓ tests/content/paridade-schema.test.ts > paridade de schema — Zod (src/content.config.ts) × Tina (tina/config.ts) > coleção disciplinas: mesmos campos, obrigatoriedade, enums, grupo en e listas embutidas 1ms
 ✓ tests/content/paridade-schema.test.ts > paridade de schema — Zod (src/content.config.ts) × Tina (tina/config.ts) > coleção publicacoes: mesmos campos, obrigatoriedade, enums, grupo en e listas embutidas 0ms
 ✓ tests/content/paridade-schema.test.ts > dívida 7(a): path do Tina × base: do glob() do Zod, por coleção > a extração por regex encontra o base: das cinco coleções em content.config.ts 0ms
 ✓ tests/content/paridade-schema.test.ts > dívida 7(a): path do Tina × base: do glob() do Zod, por coleção > coleção perfil: path do Tina bate com a pasta que o glob() do Zod lê 0ms
 ✓ tests/content/paridade-schema.test.ts > dívida 7(a): path do Tina × base: do glob() do Zod, por coleção > coleção linhas-pesquisa: path do Tina bate com a pasta que o glob() do Zod lê 0ms
 ✓ tests/content/paridade-schema.test.ts > dívida 7(a): path do Tina × base: do glob() do Zod, por coleção > coleção projetos: path do Tina bate com a pasta que o glob() do Zod lê 0ms
 ✓ tests/content/paridade-schema.test.ts > dívida 7(a): path do Tina × base: do glob() do Zod, por coleção > coleção disciplinas: path do Tina bate com a pasta que o glob() do Zod lê 0ms
 ✓ tests/content/paridade-schema.test.ts > dívida 7(a): path do Tina × base: do glob() do Zod, por coleção > coleção publicacoes: path do Tina bate com a pasta que o glob() do Zod lê 0ms
 ✓ tests/content/paridade-schema.test.ts > formato do valor de projetos.linha_relacionada (divergência real corrigida) > normaliza o id completo que o Tina grava para o formato que o loader glob() do Astro espera 1ms
 ✓ tests/content/paridade-schema.test.ts > formato do valor de projetos.linha_relacionada (divergência real corrigida) > continua aceitando o id já normalizado, sem pasta nem extensão 0ms
 ✓ tests/content/paridade-schema.test.ts > formato do valor de projetos.linha_relacionada (divergência real corrigida) > não mexe em valores que já não são string — forma `{id, collection}` do próprio `reference()` passa intacta 0ms
 ✓ tests/content/paridade-schema.test.ts > três falsos positivos que um teste ingênuo reprovaria sem haver divergência real > `linhas_pesquisa` (Tina) normaliza para `linhas-pesquisa` (Zod/pasta) — só o identificador interno diverge 0ms
 ✓ tests/content/paridade-schema.test.ts > três falsos positivos que um teste ingênuo reprovaria sem haver divergência real > restrições finas do Zod sem equivalente no Tina (faixa de `ano`, mínimo de `autores`, `z.email()`, `z.url()`) não reprovam a paridade — é o próprio D-06 0ms
 ✓ tests/content/paridade-schema.test.ts > três falsos positivos que um teste ingênuo reprovaria sem haver divergência real > grupo `en`: nenhum subcampo é obrigatório dos dois lados — não é assimetria de paridade (RN-09) 0ms
 ✓ tests/content/paridade-schema.test.ts > grupo `en` dentro de item de lista — formacao[], atuacao[] e areas[] do perfil (sabatina fase 4, Decisões 7 e 8; plano 060) > item de `formacao`: o grupo `en` existe dos dois lados, opcional, com todo subcampo opcional 0ms
 ✓ tests/content/paridade-schema.test.ts > grupo `en` dentro de item de lista — formacao[], atuacao[] e areas[] do perfil (sabatina fase 4, Decisões 7 e 8; plano 060) > item de `atuacao`: o grupo `en` existe dos dois lados, opcional, com todo subcampo opcional 0ms
 ✓ tests/content/paridade-schema.test.ts > grupo `en` dentro de item de lista — formacao[], atuacao[] e areas[] do perfil (sabatina fase 4, Decisões 7 e 8; plano 060) > item de `areas`: o grupo `en` existe dos dois lados, opcional, com todo subcampo opcional 0ms
 ✓ tests/content/paridade-schema.test.ts > grupo `en` dentro de item de lista — formacao[], atuacao[] e areas[] do perfil (sabatina fase 4, Decisões 7 e 8; plano 060) > `perfil.en` (grupo de topo) não tem mais `formacao` nem `areas` — a tradução saiu para dentro do item 0ms

 Test Files  1 passed (1)
      Tests  22 passed (22)
   Start at  16:16:07
   Duration  845ms (transform 468ms, setup 0ms, import 709ms, tests 11ms, environment 0ms)

EXIT=0
```

### Passo 4 — canário da paridade

O `en` do item de `atuacao` foi retirado temporariamente só do lado do Tina
(`tina/config.ts`); a paridade reprovou nomeando `perfil.atuacao[].en` (e a asserção-espelho do
teste novo do passo 3). Desfeito em seguida — o `en` de `atuacao` voltou ao arquivo — e a
paridade voltou a verde.

Comando: `npm test -- --reporter=verbose tests/content/paridade-schema.test.ts  (com o en de atuacao[] removido só no Tina)`

```
﻿
> haroldo-page@0.1.0 test
> vitest run --reporter=verbose tests/content/paridade-schema.test.ts


 RUN  v4.1.11 S:/Projetos/academic_page/haroldo

 ✓ tests/content/paridade-schema.test.ts > paridade de schema — Zod (src/content.config.ts) × Tina (tina/config.ts) > as cinco coleções existem dos dois lados, com o mesmo mapeamento de nome 2ms
 × tests/content/paridade-schema.test.ts > paridade de schema — Zod (src/content.config.ts) × Tina (tina/config.ts) > coleção perfil: mesmos campos, obrigatoriedade, enums, grupo en e listas embutidas 4ms
   → expected [ Array(1) ] to deeply equal []
 ✓ tests/content/paridade-schema.test.ts > paridade de schema — Zod (src/content.config.ts) × Tina (tina/config.ts) > coleção linhas-pesquisa: mesmos campos, obrigatoriedade, enums, grupo en e listas embutidas 0ms
 ✓ tests/content/paridade-schema.test.ts > paridade de schema — Zod (src/content.config.ts) × Tina (tina/config.ts) > coleção projetos: mesmos campos, obrigatoriedade, enums, grupo en e listas embutidas 0ms
 ✓ tests/content/paridade-schema.test.ts > paridade de schema — Zod (src/content.config.ts) × Tina (tina/config.ts) > coleção disciplinas: mesmos campos, obrigatoriedade, enums, grupo en e listas embutidas 1ms
 ✓ tests/content/paridade-schema.test.ts > paridade de schema — Zod (src/content.config.ts) × Tina (tina/config.ts) > coleção publicacoes: mesmos campos, obrigatoriedade, enums, grupo en e listas embutidas 0ms
 ✓ tests/content/paridade-schema.test.ts > dívida 7(a): path do Tina × base: do glob() do Zod, por coleção > a extração por regex encontra o base: das cinco coleções em content.config.ts 1ms
 ✓ tests/content/paridade-schema.test.ts > dívida 7(a): path do Tina × base: do glob() do Zod, por coleção > coleção perfil: path do Tina bate com a pasta que o glob() do Zod lê 0ms
 ✓ tests/content/paridade-schema.test.ts > dívida 7(a): path do Tina × base: do glob() do Zod, por coleção > coleção linhas-pesquisa: path do Tina bate com a pasta que o glob() do Zod lê 0ms
 ✓ tests/content/paridade-schema.test.ts > dívida 7(a): path do Tina × base: do glob() do Zod, por coleção > coleção projetos: path do Tina bate com a pasta que o glob() do Zod lê 0ms
 ✓ tests/content/paridade-schema.test.ts > dívida 7(a): path do Tina × base: do glob() do Zod, por coleção > coleção disciplinas: path do Tina bate com a pasta que o glob() do Zod lê 0ms
 ✓ tests/content/paridade-schema.test.ts > dívida 7(a): path do Tina × base: do glob() do Zod, por coleção > coleção publicacoes: path do Tina bate com a pasta que o glob() do Zod lê 0ms
 ✓ tests/content/paridade-schema.test.ts > formato do valor de projetos.linha_relacionada (divergência real corrigida) > normaliza o id completo que o Tina grava para o formato que o loader glob() do Astro espera 1ms
 ✓ tests/content/paridade-schema.test.ts > formato do valor de projetos.linha_relacionada (divergência real corrigida) > continua aceitando o id já normalizado, sem pasta nem extensão 0ms
 ✓ tests/content/paridade-schema.test.ts > formato do valor de projetos.linha_relacionada (divergência real corrigida) > não mexe em valores que já não são string — forma `{id, collection}` do próprio `reference()` passa intacta 0ms
 ✓ tests/content/paridade-schema.test.ts > três falsos positivos que um teste ingênuo reprovaria sem haver divergência real > `linhas_pesquisa` (Tina) normaliza para `linhas-pesquisa` (Zod/pasta) — só o identificador interno diverge 0ms
 ✓ tests/content/paridade-schema.test.ts > três falsos positivos que um teste ingênuo reprovaria sem haver divergência real > restrições finas do Zod sem equivalente no Tina (faixa de `ano`, mínimo de `autores`, `z.email()`, `z.url()`) não reprovam a paridade — é o próprio D-06 0ms
 ✓ tests/content/paridade-schema.test.ts > três falsos positivos que um teste ingênuo reprovaria sem haver divergência real > grupo `en`: nenhum subcampo é obrigatório dos dois lados — não é assimetria de paridade (RN-09) 0ms
 ✓ tests/content/paridade-schema.test.ts > grupo `en` dentro de item de lista — formacao[], atuacao[] e areas[] do perfil (sabatina fase 4, Decisões 7 e 8; plano 060) > item de `formacao`: o grupo `en` existe dos dois lados, opcional, com todo subcampo opcional 0ms
 × tests/content/paridade-schema.test.ts > grupo `en` dentro de item de lista — formacao[], atuacao[] e areas[] do perfil (sabatina fase 4, Decisões 7 e 8; plano 060) > item de `atuacao`: o grupo `en` existe dos dois lados, opcional, com todo subcampo opcional 0ms
   → expected undefined to be defined
 ✓ tests/content/paridade-schema.test.ts > grupo `en` dentro de item de lista — formacao[], atuacao[] e areas[] do perfil (sabatina fase 4, Decisões 7 e 8; plano 060) > item de `areas`: o grupo `en` existe dos dois lados, opcional, com todo subcampo opcional 0ms
 ✓ tests/content/paridade-schema.test.ts > grupo `en` dentro de item de lista — formacao[], atuacao[] e areas[] do perfil (sabatina fase 4, Decisões 7 e 8; plano 060) > `perfil.en` (grupo de topo) não tem mais `formacao` nem `areas` — a tradução saiu para dentro do item 0ms
node.exe : 
No linha:1 caractere:1
+ & "C:\Program Files\nodejs/node.exe" "C:\Program Files\nodejs/node_mo ...
+ ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    + CategoryInfo          : NotSpecified: (:String) [], RemoteException
    + FullyQualifiedErrorId : NativeCommandError
 
⎯⎯⎯⎯⎯⎯⎯ Failed Tests 2 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  tests/content/paridade-schema.test.ts > paridade de schema — Zod (src/content.config.ts) × Tina 
(tina/config.ts) > coleção perfil: mesmos campos, obrigatoriedade, enums, grupo en e listas embutidas
AssertionError: expected [ Array(1) ] to deeply equal []

- Expected
+ Received

- []
+ [
+   "perfil.atuacao[].en: existe só no Zod",
+ ]

 ❯ tests/content/paridade-schema.test.ts:380:21
    378|       const erros: string[] = [];
    379|       compareFields(nome, zodNorm, tinaNorm, erros);
    380|       expect(erros).toEqual([]);
       |                     ^
    381|     });
    382|   }

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/2]⎯

 FAIL  tests/content/paridade-schema.test.ts > grupo `en` dentro de item de lista — formacao[], atuacao[] e areas[] do 
perfil (sabatina fase 4, Decisões 7 e 8; plano 060) > item de `atuacao`: o grupo `en` existe dos dois lados, opcional, 
com todo subcampo opcional
AssertionError: expected undefined to be defined
 ❯ tests/content/paridade-schema.test.ts:488:22
    486|
    487|       expect(zodEn).toBeDefined();
    488|       expect(tinaEn).toBeDefined();
       |                      ^
    489|       expect(zodEn?.required).toBe(false);
    490|       expect(tinaEn?.required).toBe(false);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/2]⎯


 Test Files  1 failed (1)
      Tests  2 failed | 20 passed (22)
   Start at  16:00:05
   Duration  839ms (transform 452ms, setup 0ms, import 689ms, tests 14ms, environment 0ms)

EXIT=1
```

Comando: `npm test -- --reporter=verbose tests/content/paridade-schema.test.ts  (depois de desfazer o canário)`

```
﻿
> haroldo-page@0.1.0 test
> vitest run --reporter=verbose tests/content/paridade-schema.test.ts


 RUN  v4.1.11 S:/Projetos/academic_page/haroldo

 ✓ tests/content/paridade-schema.test.ts > paridade de schema — Zod (src/content.config.ts) × Tina (tina/config.ts) > as cinco coleções existem dos dois lados, com o mesmo mapeamento de nome 2ms
 ✓ tests/content/paridade-schema.test.ts > paridade de schema — Zod (src/content.config.ts) × Tina (tina/config.ts) > coleção perfil: mesmos campos, obrigatoriedade, enums, grupo en e listas embutidas 0ms
 ✓ tests/content/paridade-schema.test.ts > paridade de schema — Zod (src/content.config.ts) × Tina (tina/config.ts) > coleção linhas-pesquisa: mesmos campos, obrigatoriedade, enums, grupo en e listas embutidas 0ms
 ✓ tests/content/paridade-schema.test.ts > paridade de schema — Zod (src/content.config.ts) × Tina (tina/config.ts) > coleção projetos: mesmos campos, obrigatoriedade, enums, grupo en e listas embutidas 0ms
 ✓ tests/content/paridade-schema.test.ts > paridade de schema — Zod (src/content.config.ts) × Tina (tina/config.ts) > coleção disciplinas: mesmos campos, obrigatoriedade, enums, grupo en e listas embutidas 1ms
 ✓ tests/content/paridade-schema.test.ts > paridade de schema — Zod (src/content.config.ts) × Tina (tina/config.ts) > coleção publicacoes: mesmos campos, obrigatoriedade, enums, grupo en e listas embutidas 0ms
 ✓ tests/content/paridade-schema.test.ts > dívida 7(a): path do Tina × base: do glob() do Zod, por coleção > a extração por regex encontra o base: das cinco coleções em content.config.ts 0ms
 ✓ tests/content/paridade-schema.test.ts > dívida 7(a): path do Tina × base: do glob() do Zod, por coleção > coleção perfil: path do Tina bate com a pasta que o glob() do Zod lê 0ms
 ✓ tests/content/paridade-schema.test.ts > dívida 7(a): path do Tina × base: do glob() do Zod, por coleção > coleção linhas-pesquisa: path do Tina bate com a pasta que o glob() do Zod lê 0ms
 ✓ tests/content/paridade-schema.test.ts > dívida 7(a): path do Tina × base: do glob() do Zod, por coleção > coleção projetos: path do Tina bate com a pasta que o glob() do Zod lê 0ms
 ✓ tests/content/paridade-schema.test.ts > dívida 7(a): path do Tina × base: do glob() do Zod, por coleção > coleção disciplinas: path do Tina bate com a pasta que o glob() do Zod lê 0ms
 ✓ tests/content/paridade-schema.test.ts > dívida 7(a): path do Tina × base: do glob() do Zod, por coleção > coleção publicacoes: path do Tina bate com a pasta que o glob() do Zod lê 0ms
 ✓ tests/content/paridade-schema.test.ts > formato do valor de projetos.linha_relacionada (divergência real corrigida) > normaliza o id completo que o Tina grava para o formato que o loader glob() do Astro espera 1ms
 ✓ tests/content/paridade-schema.test.ts > formato do valor de projetos.linha_relacionada (divergência real corrigida) > continua aceitando o id já normalizado, sem pasta nem extensão 0ms
 ✓ tests/content/paridade-schema.test.ts > formato do valor de projetos.linha_relacionada (divergência real corrigida) > não mexe em valores que já não são string — forma `{id, collection}` do próprio `reference()` passa intacta 0ms
 ✓ tests/content/paridade-schema.test.ts > três falsos positivos que um teste ingênuo reprovaria sem haver divergência real > `linhas_pesquisa` (Tina) normaliza para `linhas-pesquisa` (Zod/pasta) — só o identificador interno diverge 0ms
 ✓ tests/content/paridade-schema.test.ts > três falsos positivos que um teste ingênuo reprovaria sem haver divergência real > restrições finas do Zod sem equivalente no Tina (faixa de `ano`, mínimo de `autores`, `z.email()`, `z.url()`) não reprovam a paridade — é o próprio D-06 0ms
 ✓ tests/content/paridade-schema.test.ts > três falsos positivos que um teste ingênuo reprovaria sem haver divergência real > grupo `en`: nenhum subcampo é obrigatório dos dois lados — não é assimetria de paridade (RN-09) 0ms
 ✓ tests/content/paridade-schema.test.ts > grupo `en` dentro de item de lista — formacao[], atuacao[] e areas[] do perfil (sabatina fase 4, Decisões 7 e 8; plano 060) > item de `formacao`: o grupo `en` existe dos dois lados, opcional, com todo subcampo opcional 0ms
 ✓ tests/content/paridade-schema.test.ts > grupo `en` dentro de item de lista — formacao[], atuacao[] e areas[] do perfil (sabatina fase 4, Decisões 7 e 8; plano 060) > item de `atuacao`: o grupo `en` existe dos dois lados, opcional, com todo subcampo opcional 0ms
 ✓ tests/content/paridade-schema.test.ts > grupo `en` dentro de item de lista — formacao[], atuacao[] e areas[] do perfil (sabatina fase 4, Decisões 7 e 8; plano 060) > item de `areas`: o grupo `en` existe dos dois lados, opcional, com todo subcampo opcional 0ms
 ✓ tests/content/paridade-schema.test.ts > grupo `en` dentro de item de lista — formacao[], atuacao[] e areas[] do perfil (sabatina fase 4, Decisões 7 e 8; plano 060) > `perfil.en` (grupo de topo) não tem mais `formacao` nem `areas` — a tradução saiu para dentro do item 0ms

 Test Files  1 passed (1)
      Tests  22 passed (22)
   Start at  16:00:19
   Duration  836ms (transform 463ms, setup 0ms, import 699ms, tests 11ms, environment 0ms)

EXIT=0
```

### Passo 5 — migração de `content/perfil/index.md` e `src/pages/index.astro`

`tina/tina-lock.json` ainda não tinha sido regenerado neste ponto (isso é o passo 6) — por isso
`tests/content/tina-lock-coerente.test.ts` aparece reprovado abaixo, com a divergência esperada
(`perfil.areas`, `formacao[].en`, `atuacao[].en`, `areas[].en` só no config; `perfil.en.formacao`
e `perfil.en.areas` só no lock). `conteudo-valido` e os demais arquivos de `tests/content`
passaram.

Comando: `npm test -- --reporter=verbose tests/content`

```
﻿
> haroldo-page@0.1.0 test
> vitest run --reporter=verbose tests/content


 RUN  v4.1.11 S:/Projetos/academic_page/haroldo

 ✓ tests/content/tina-lock-coerente.test.ts > coerência entre tina/config.ts e tina/tina-lock.json (RNF-09, dívida 2 da fase 1) > as cinco coleções existem nos dois lados, com os mesmos nomes 2ms
 ✓ tests/content/tina-lock-coerente.test.ts > coerência entre tina/config.ts e tina/tina-lock.json (RNF-09, dívida 2 da fase 1) > coleção perfil: path e format do lock batem com o config 0ms
 ✓ tests/content/tina-lock-coerente.test.ts > coerência entre tina/config.ts e tina/tina-lock.json (RNF-09, dívida 2 da fase 1) > coleção linhas_pesquisa: path e format do lock batem com o config 0ms
 ✓ tests/content/tina-lock-coerente.test.ts > coerência entre tina/config.ts e tina/tina-lock.json (RNF-09, dívida 2 da fase 1) > coleção projetos: path e format do lock batem com o config 0ms
 ✓ tests/content/tina-lock-coerente.test.ts > coerência entre tina/config.ts e tina/tina-lock.json (RNF-09, dívida 2 da fase 1) > coleção disciplinas: path e format do lock batem com o config 0ms
 ✓ tests/content/tina-lock-coerente.test.ts > coerência entre tina/config.ts e tina/tina-lock.json (RNF-09, dívida 2 da fase 1) > coleção publicacoes: path e format do lock batem com o config 0ms
 × tests/content/tina-lock-coerente.test.ts > coerência entre tina/config.ts e tina/tina-lock.json (RNF-09, dívida 2 da fase 1) > árvore de campos declarativos bate por caminho qualificado — type, required, list, options e collections 7ms
   → expected [ …(13) ] to deeply equal []
 ✓ tests/content/conteudo-valido.test.ts > conteúdo real de content/ — validação Zod com referência resolvida (F-09, dívida 5) > varreu ao menos um arquivo por coleção — varredura vazia não pode "passar" como válida 2ms
 ✓ tests/content/conteudo-valido.test.ts > conteúdo real de content/ — validação Zod com referência resolvida (F-09, dívida 5) > todo arquivo passa no schema Zod correspondente, com projetos.linha_relacionada resolvida 15ms
 ✓ tests/content/paridade-schema.test.ts > paridade de schema — Zod (src/content.config.ts) × Tina (tina/config.ts) > as cinco coleções existem dos dois lados, com o mesmo mapeamento de nome 2ms
 ✓ tests/content/paridade-schema.test.ts > paridade de schema — Zod (src/content.config.ts) × Tina (tina/config.ts) > coleção perfil: mesmos campos, obrigatoriedade, enums, grupo en e listas embutidas 0ms
 ✓ tests/content/paridade-schema.test.ts > paridade de schema — Zod (src/content.config.ts) × Tina (tina/config.ts) > coleção linhas-pesquisa: mesmos campos, obrigatoriedade, enums, grupo en e listas embutidas 0ms
 ✓ tests/content/paridade-schema.test.ts > paridade de schema — Zod (src/content.config.ts) × Tina (tina/config.ts) > coleção projetos: mesmos campos, obrigatoriedade, enums, grupo en e listas embutidas 0ms
 ✓ tests/content/paridade-schema.test.ts > paridade de schema — Zod (src/content.config.ts) × Tina (tina/config.ts) > coleção disciplinas: mesmos campos, obrigatoriedade, enums, grupo en e listas embutidas 1ms
 ✓ tests/content/paridade-schema.test.ts > paridade de schema — Zod (src/content.config.ts) × Tina (tina/config.ts) > coleção publicacoes: mesmos campos, obrigatoriedade, enums, grupo en e listas embutidas 0ms
 ✓ tests/content/paridade-schema.test.ts > dívida 7(a): path do Tina × base: do glob() do Zod, por coleção > a extração por regex encontra o base: das cinco coleções em content.config.ts 1ms
 ✓ tests/content/paridade-schema.test.ts > dívida 7(a): path do Tina × base: do glob() do Zod, por coleção > coleção perfil: path do Tina bate com a pasta que o glob() do Zod lê 0ms
 ✓ tests/content/paridade-schema.test.ts > dívida 7(a): path do Tina × base: do glob() do Zod, por coleção > coleção linhas-pesquisa: path do Tina bate com a pasta que o glob() do Zod lê 0ms
 ✓ tests/content/paridade-schema.test.ts > dívida 7(a): path do Tina × base: do glob() do Zod, por coleção > coleção projetos: path do Tina bate com a pasta que o glob() do Zod lê 0ms
 ✓ tests/content/paridade-schema.test.ts > dívida 7(a): path do Tina × base: do glob() do Zod, por coleção > coleção disciplinas: path do Tina bate com a pasta que o glob() do Zod lê 0ms
 ✓ tests/content/paridade-schema.test.ts > dívida 7(a): path do Tina × base: do glob() do Zod, por coleção > coleção publicacoes: path do Tina bate com a pasta que o glob() do Zod lê 0ms
 ✓ tests/content/paridade-schema.test.ts > formato do valor de projetos.linha_relacionada (divergência real corrigida) > normaliza o id completo que o Tina grava para o formato que o loader glob() do Astro espera 1ms
 ✓ tests/content/paridade-schema.test.ts > formato do valor de projetos.linha_relacionada (divergência real corrigida) > continua aceitando o id já normalizado, sem pasta nem extensão 0ms
 ✓ tests/content/paridade-schema.test.ts > formato do valor de projetos.linha_relacionada (divergência real corrigida) > não mexe em valores que já não são string — forma `{id, collection}` do próprio `reference()` passa intacta 0ms
 ✓ tests/content/paridade-schema.test.ts > três falsos positivos que um teste ingênuo reprovaria sem haver divergência real > `linhas_pesquisa` (Tina) normaliza para `linhas-pesquisa` (Zod/pasta) — só o identificador interno diverge 0ms
 ✓ tests/content/paridade-schema.test.ts > três falsos positivos que um teste ingênuo reprovaria sem haver divergência real > restrições finas do Zod sem equivalente no Tina (faixa de `ano`, mínimo de `autores`, `z.email()`, `z.url()`) não reprovam a paridade — é o próprio D-06 0ms
 ✓ tests/content/paridade-schema.test.ts > três falsos positivos que um teste ingênuo reprovaria sem haver divergência real > grupo `en`: nenhum subcampo é obrigatório dos dois lados — não é assimetria de paridade (RN-09) 1ms
 ✓ tests/content/paridade-schema.test.ts > grupo `en` dentro de item de lista — formacao[], atuacao[] e areas[] do perfil (sabatina fase 4, Decisões 7 e 8; plano 060) > item de `formacao`: o grupo `en` existe dos dois lados, opcional, com todo subcampo opcional 0ms
 ✓ tests/content/paridade-schema.test.ts > grupo `en` dentro de item de lista — formacao[], atuacao[] e areas[] do perfil (sabatina fase 4, Decisões 7 e 8; plano 060) > item de `atuacao`: o grupo `en` existe dos dois lados, opcional, com todo subcampo opcional 0ms
 ✓ tests/content/paridade-schema.test.ts > grupo `en` dentro de item de lista — formacao[], atuacao[] e areas[] do perfil (sabatina fase 4, Decisões 7 e 8; plano 060) > item de `areas`: o grupo `en` existe dos dois lados, opcional, com todo subcampo opcional 0ms
 ✓ tests/content/paridade-schema.test.ts > grupo `en` dentro de item de lista — formacao[], atuacao[] e areas[] do perfil (sabatina fase 4, Decisões 7 e 8; plano 060) > `perfil.en` (grupo de topo) não tem mais `formacao` nem `areas` — a tradução saiu para dentro do item 1ms
 ✓ tests/content/schemas.test.ts > coleção perfil > aceita o conjunto mínimo de campos obrigatórios do §7.3 3ms
 ✓ tests/content/schemas.test.ts > coleção perfil > não exige `publicado` — é singleton, não coleção de listagem (RN-01) 1ms
 ✓ tests/content/schemas.test.ts > coleção perfil > rejeita quando falta o campo obrigatório `nome` 1ms
 ✓ tests/content/schemas.test.ts > coleção perfil > rejeita quando falta o campo obrigatório `cargo` 0ms
 ✓ tests/content/schemas.test.ts > coleção perfil > rejeita quando falta o campo obrigatório `instituicao` 0ms
 ✓ tests/content/schemas.test.ts > coleção perfil > rejeita quando falta o campo obrigatório `bio` 0ms
 ✓ tests/content/schemas.test.ts > coleção perfil > rejeita quando falta o campo obrigatório `resumo_home` 0ms
 ✓ tests/content/schemas.test.ts > coleção perfil > rejeita quando falta o campo obrigatório `email` 0ms
 ✓ tests/content/schemas.test.ts > coleção perfil > rejeita e-mail em formato inválido 0ms
 ✓ tests/content/schemas.test.ts > coleção perfil > aceita `links` com URLs válidas e todos os campos opcionais ausentes 1ms
 ✓ tests/content/schemas.test.ts > coleção perfil > aceita `atuacao` com cargo, instituição e período em texto livre 0ms
 ✓ tests/content/schemas.test.ts > coleção perfil > rejeita item de `atuacao` sem o campo obrigatório `cargo` 0ms
 ✓ tests/content/schemas.test.ts > coleção perfil > rejeita item de `atuacao` sem o campo obrigatório `instituicao` 0ms
 ✓ tests/content/schemas.test.ts > coleção perfil > rejeita item de `atuacao` sem o campo obrigatório `periodo` 0ms
 ✓ tests/content/schemas.test.ts > coleção perfil > aceita item sem o grupo `en` (RN-09 — português é canônico) 0ms
 ✓ tests/content/schemas.test.ts > coleção perfil > aceita `en` parcial — só um campo preenchido (RN-09) 0ms
 ✓ tests/content/schemas.test.ts > coleção perfil > aceita `en` vazio (`{}`) 0ms
 ✓ tests/content/schemas.test.ts > coleção perfil > rejeita campo factual dentro de `en` — `nome` não é traduzível (RN-07, `.strict()`) 0ms
 ✓ tests/content/schemas.test.ts > coleção perfil > rejeita `en.formacao` — a lista paralela saiu; a tradução vive dentro do item (sabatina fase 4, Decisão 7, `.strict()`) 0ms
 ✓ tests/content/schemas.test.ts > coleção perfil > rejeita `en.areas` — a lista paralela saiu; a tradução vive dentro do item (sabatina fase 4, Decisão 7, `.strict()`) 0ms
 ✓ tests/content/schemas.test.ts > coleção perfil > aceita `formacao[i].en.{grau,curso}` — tradução dentro do próprio item (sabatina fase 4, Decisão 7) 1ms
 ✓ tests/content/schemas.test.ts > coleção perfil > rejeita campo factual dentro de `formacao[i].en` — `instituicao` não é traduzível (RN-07, `.strict()`) 0ms
 ✓ tests/content/schemas.test.ts > coleção perfil > aceita `atuacao[i].en.cargo` — só `cargo` traduz (sabatina fase 4, Decisão 8) 0ms
 ✓ tests/content/schemas.test.ts > coleção perfil > rejeita `atuacao[i].en.instituicao` — só `cargo` traduz (sabatina fase 4, Decisão 8, `.strict()`) 0ms
 ✓ tests/content/schemas.test.ts > coleção perfil > rejeita `areas` como lista de string — formato antigo, substituído por lista de objeto (sabatina fase 4, Decisão de fatiamento 11) 0ms
 ✓ tests/content/schemas.test.ts > coleção perfil > aceita `areas` como lista de `{ nome, en? }` (sabatina fase 4, Decisão de fatiamento 11) 0ms
 ✓ tests/content/schemas.test.ts > coleção linhas-pesquisa > aceita o conjunto mínimo de campos obrigatórios do §7.3 1ms
 ✓ tests/content/schemas.test.ts > coleção linhas-pesquisa > rejeita quando falta `publicado` (RN-01) 0ms
 ✓ tests/content/schemas.test.ts > coleção linhas-pesquisa > aceita `ordem` numérica opcional 0ms
 ✓ tests/content/schemas.test.ts > coleção linhas-pesquisa > aceita item sem o grupo `en` (RN-09 — português é canônico) 0ms
 ✓ tests/content/schemas.test.ts > coleção linhas-pesquisa > aceita `en` parcial — só um campo preenchido (RN-09) 0ms
 ✓ tests/content/schemas.test.ts > coleção linhas-pesquisa > aceita `en` vazio (`{}`) 0ms
 ✓ tests/content/schemas.test.ts > coleção linhas-pesquisa > rejeita campo factual dentro de `en` — `publicado` não é traduzível (`.strict()`) 0ms
 ✓ tests/content/schemas.test.ts > coleção projetos > aceita o conjunto mínimo de campos obrigatórios do §7.3 1ms
 ✓ tests/content/schemas.test.ts > coleção projetos > rejeita `status` fora do enum `em andamento` | `concluído` 0ms
 ✓ tests/content/schemas.test.ts > coleção projetos > aceita `status` dentro do enum 0ms
 ✓ tests/content/schemas.test.ts > coleção projetos > aceita `linha_relacionada` como referência à coleção linhas-pesquisa 0ms
 ✓ tests/content/schemas.test.ts > coleção projetos > aceita item sem o grupo `en` (RN-09 — português é canônico) 0ms
 ✓ tests/content/schemas.test.ts > coleção projetos > aceita `en` parcial — só um campo preenchido (RN-09) 0ms
 ✓ tests/content/schemas.test.ts > coleção projetos > aceita `en` vazio (`{}`) 0ms
 ✓ tests/content/schemas.test.ts > coleção projetos > rejeita campo factual dentro de `en` — `status` não é traduzível (RN-07, `.strict()`) 0ms
 ✓ tests/content/schemas.test.ts > coleção disciplinas > aceita o conjunto mínimo de campos obrigatórios do §7.3 1ms
 ✓ tests/content/schemas.test.ts > coleção disciplinas > rejeita `status` fora do enum `atual` | `anterior` 0ms
 ✓ tests/content/schemas.test.ts > coleção disciplinas > aceita `status` dentro do enum 0ms
 ✓ tests/content/schemas.test.ts > coleção disciplinas > rejeita quando falta `publicado` (RN-01) 0ms
 ✓ tests/content/schemas.test.ts > coleção disciplinas > aceita aulas, listas e materiais como listas embutidas (D-05) 1ms
 ✓ tests/content/schemas.test.ts > coleção disciplinas > rejeita `tipo` de material fora do enum slides|notas|complementar 0ms
 ✓ tests/content/schemas.test.ts > coleção disciplinas > aceita URL de material em qualquer hospedeiro, sem restrição de domínio (D-07) 0ms
 ✓ tests/content/schemas.test.ts > coleção disciplinas > rejeita quando a URL de uma aula não é uma URL válida 0ms
 ✓ tests/content/schemas.test.ts > coleção disciplinas > aceita item sem o grupo `en` (RN-09 — português é canônico) 0ms
 ✓ tests/content/schemas.test.ts > coleção disciplinas > aceita `en` parcial — só um campo preenchido (RN-09) 0ms
 ✓ tests/content/schemas.test.ts > coleção disciplinas > aceita `en` vazio (`{}`) 0ms
 ✓ tests/content/schemas.test.ts > coleção disciplinas > rejeita campo factual dentro de `en` — `semestre` não é traduzível (RN-07, `.strict()`) 0ms
 ✓ tests/content/schemas.test.ts > coleção disciplinas > scripts[] (RF-37, D-05) > aceita o item mínimo válido — `titulo`, `linguagem` e `codigo` 1ms
 ✓ tests/content/schemas.test.ts > coleção disciplinas > scripts[] (RF-37, D-05) > rejeita item sem `codigo` (obrigatório) 0ms
 ✓ tests/content/schemas.test.ts > coleção disciplinas > scripts[] (RF-37, D-05) > rejeita item sem `titulo` (obrigatório) 0ms
 ✓ tests/content/schemas.test.ts > coleção disciplinas > scripts[] (RF-37, D-05) > rejeita `linguagem` fora do enum python|r|matlab|bash|outro 0ms
 ✓ tests/content/schemas.test.ts > coleção disciplinas > scripts[] (RF-37, D-05) > aceita `linguagem` = python 0ms
 ✓ tests/content/schemas.test.ts > coleção disciplinas > scripts[] (RF-37, D-05) > aceita `linguagem` = r 0ms
 ✓ tests/content/schemas.test.ts > coleção disciplinas > scripts[] (RF-37, D-05) > aceita `linguagem` = matlab 0ms
 ✓ tests/content/schemas.test.ts > coleção disciplinas > scripts[] (RF-37, D-05) > aceita `linguagem` = bash 0ms
 ✓ tests/content/schemas.test.ts > coleção disciplinas > scripts[] (RF-37, D-05) > aceita `linguagem` = outro 0ms
 ✓ tests/content/schemas.test.ts > coleção disciplinas > scripts[] (RF-37, D-05) > aceita item sem `descricao`, `aula` e `url` — os três são opcionais 0ms
 ✓ tests/content/schemas.test.ts > coleção disciplinas > scripts[] (RF-37, D-05) > aceita `aula` sem correspondência em `aulas[]` — sem integridade referencial (F-13, Decisões 9 e 10) 0ms
 ✓ tests/content/schemas.test.ts > coleção disciplinas > scripts[] (RF-37, D-05) > rejeita `url` inválida 0ms
 ✓ tests/content/schemas.test.ts > coleção disciplinas > scripts[] (RF-37, D-05) > preserva `codigo` com quebras de linha e indentação literalmente 0ms
 ✓ tests/content/schemas.test.ts > coleção disciplinas > scripts[] (RF-37, D-05) > rejeita `en: { scripts: [...] }` — `scripts` não entra no grupo `en` (.strict(), Decisão 5) 0ms
 ✓ tests/content/schemas.test.ts > coleção publicacoes > aceita o conjunto mínimo de campos obrigatórios do §7.3 1ms
 ✓ tests/content/schemas.test.ts > coleção publicacoes > rejeita `ano` fora de 1900–2100 (F-09): 1899 0ms
 ✓ tests/content/schemas.test.ts > coleção publicacoes > rejeita `ano` fora de 1900–2100 (F-09): 2101 0ms
 ✓ tests/content/schemas.test.ts > coleção publicacoes > rejeita `ano` fora de 1900–2100 (F-09): 1000 0ms
 ✓ tests/content/schemas.test.ts > coleção publicacoes > rejeita `ano` fora de 1900–2100 (F-09): 3000 0ms
 ✓ tests/content/schemas.test.ts > coleção publicacoes > aceita `ano` dentro de 1900–2100 (F-09): 1900 0ms
 ✓ tests/content/schemas.test.ts > coleção publicacoes > aceita `ano` dentro de 1900–2100 (F-09): 2100 0ms
 ✓ tests/content/schemas.test.ts > coleção publicacoes > aceita `ano` dentro de 1900–2100 (F-09): 2024 0ms
 ✓ tests/content/schemas.test.ts > coleção publicacoes > rejeita `tipo` fora do enum fechado 0ms
 ✓ tests/content/schemas.test.ts > coleção publicacoes > aceita `tipo` = artigo 0ms
 ✓ tests/content/schemas.test.ts > coleção publicacoes > aceita `tipo` = preprint 0ms
 ✓ tests/content/schemas.test.ts > coleção publicacoes > aceita `tipo` = capítulo 0ms
 ✓ tests/content/schemas.test.ts > coleção publicacoes > aceita `tipo` = livro 0ms
 ✓ tests/content/schemas.test.ts > coleção publicacoes > aceita `tipo` = anais 0ms
 ✓ tests/content/schemas.test.ts > coleção publicacoes > aceita `tipo` = tese 0ms
 ✓ tests/content/schemas.test.ts > coleção publicacoes > aceita `tipo` = outro 0ms
 ✓ tests/content/schemas.test.ts > coleção publicacoes > rejeita `autores` vazio — ao menos um autor é exigido 0ms
 ✓ tests/content/schemas.test.ts > coleção publicacoes > preserva a ordem dos autores informada 1ms
 ✓ tests/content/schemas.test.ts > coleção publicacoes > rejeita quando falta `publicado` (RN-01) 0ms
 ✓ tests/content/schemas.test.ts > coleção publicacoes > aceita item sem o grupo `en` (RN-09 — português é canônico) 0ms
 ✓ tests/content/schemas.test.ts > coleção publicacoes > aceita `en` parcial — só `resumo` preenchido (RN-09) 0ms
 ✓ tests/content/schemas.test.ts > coleção publicacoes > aceita `en` vazio (`{}`) 0ms
 ✓ tests/content/schemas.test.ts > coleção publicacoes > rejeita `en.titulo` — título de artigo é dado factual, não se traduz (RN-07) 0ms
 ✓ tests/content/schemas.test.ts > coleção publicacoes > rejeita `en.autores` — autoria é dado factual, não se traduz (RN-07) 0ms
 ✓ tests/content/schemas.test.ts > coleção noticias > não existe no schema — v1.1, fora do MVP (NG-01) 1ms
node.exe : 
No linha:1 caractere:1
+ & "C:\Program Files\nodejs/node.exe" "C:\Program Files\nodejs/node_mo ...
+ ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    + CategoryInfo          : NotSpecified: (:String) [], RemoteException
    + FullyQualifiedErrorId : NativeCommandError
 
⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  tests/content/tina-lock-coerente.test.ts > coerência entre tina/config.ts e tina/tina-lock.json (RNF-09, dívida 
2 da fase 1) > árvore de campos declarativos bate por caminho qualificado — type, required, list, options e collections
AssertionError: expected [ …(13) ] to deeply equal []

- Expected
+ Received

- []
+ [
+   "perfil.formacao[].en: existe só no config",
+   "perfil.formacao[].en.grau: existe só no config",
+   "perfil.formacao[].en.curso: existe só no config",
+   "perfil.atuacao[].en: existe só no config",
+   "perfil.atuacao[].en.cargo: existe só no config",
+   "perfil.areas: type diverge — config=\"object\", lock=\"string\"",
+   "perfil.areas[].nome: existe só no config",
+   "perfil.areas[].en: existe só no config",
+   "perfil.areas[].en.nome: existe só no config",
+   "perfil.en.formacao: existe só no lock",
+   "perfil.en.formacao[].grau: existe só no lock",
+   "perfil.en.formacao[].curso: existe só no lock",
+   "perfil.en.areas: existe só no lock",
+ ]

 ❯ tests/content/tina-lock-coerente.test.ts:254:19
    252|     // Varredura vazia (zero caminhos comuns) passaria por vacuidade —…
    253|     expect(caminhosComuns).toBeGreaterThan(50);
    254|     expect(erros).toEqual([]);
       |                   ^
    255|   });
    256| });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯


 Test Files  1 failed | 3 passed (4)
      Tests  1 failed | 122 passed (123)
   Start at  16:00:37
   Duration  917ms (transform 1.43s, setup 0ms, import 2.37s, tests 65ms, environment 0ms)

EXIT=1
```

### Passo 6 — regeneração do `tina/tina-lock.json`

Porta 9000 livre antes (`Get-NetTCPConnection -LocalPort 9000 -State Listen` sem saída) e depois
do `tinacms dev` (idem — nenhum `node` sobrou escutando).

Comando: `npx tinacms dev -c "echo ready"`

```
﻿🦙 TinaCMS Dev Server is initializing...

│
○  ✅ 🦙 TinaCMS Dev Server is active: ─────────────────────────────────────╮
│                                                                          │
│  🦙 TinaCMS URLs                                                         │
│     CMS:                <your-dev-server-url>/admin/index.html           │
│     API playground:     <your-dev-server-url>/admin/index.html#/graphql  │
│     API url:            http://localhost:4001/graphql                    │
│                                                                          │
│  🤖 Auto-generated files                                                 │
│     GraphQL Client:     tina/__generated__/client.ts                     │
│     Typescript Types:   tina/__generated__/types.ts                      │
│                                                                          │
│                                                                          │
├──────────────────────────────────────────────────────────────────────────╯
Running web application with command: echo ready
node.exe : [2K[1GIndexing local files ⠋[2K[1GIndexing local files ⠙(node:20452) [DEP0190] DeprecationWarning: 
Passing args to a child process with shell option true can lead to security vulnerabilities, as the arguments are not 
escaped, only concatenated.
No linha:1 caractere:1
+ & "C:\Program Files\nodejs/node.exe" "C:\Program Files\nodejs/node_mo ...
+ ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    + CategoryInfo          : NotSpecified: ([2K[1GIndexin...y concatenated.:String) [], RemoteException
    + FullyQualifiedErrorId : NativeCommandError
 
(Use `node --trace-deprecation ...` to show where the warning was created)
ready
child process exited with code 0
EXIT=0
```

Comando: `git diff --stat tina/tina-lock.json`

```
﻿ tina/tina-lock.json | 2 +-
 1 file changed, 1 insertion(+), 1 deletion(-)
EXIT=0
```

Comando: `npm test -- tests/content/tina-lock-coerente.test.ts`

```
﻿
> haroldo-page@0.1.0 test
> vitest run tests/content/tina-lock-coerente.test.ts


 RUN  v4.1.11 S:/Projetos/academic_page/haroldo


 Test Files  1 passed (1)
      Tests  7 passed (7)
   Start at  16:01:18
   Duration  211ms (transform 63ms, setup 0ms, import 88ms, tests 4ms, environment 0ms)

EXIT=0
```

### Passo 7 — comparação do `dist/` antes × depois

Comando: `npm run build:pipeline`

```
﻿
> haroldo-page@0.1.0 build:pipeline
> vitest run tests/content && tinacms build --skip-cloud-checks && astro check && astro build


 RUN  v4.1.11 S:/Projetos/academic_page/haroldo


 Test Files  4 passed (4)
      Tests  124 passed (124)
   Start at  16:26:03
   Duration  931ms (transform 1.49s, setup 0ms, import 2.44s, tests 62ms, environment 0ms)

Starting Tina build
│
○  Tina build complete ───────────────────────────────────────────────────────────────────────────────────────────╮
│                                                                                                                 │
│  🦙 Tina Config                                                                                                 │
│     API url:            https://content.tinajs.io/2.4/content/8be98053-68c3-4262-b7bd-dd1286e1c7ad/github/main  │
│                                                                                                                 │
│  🤖 Auto-generated files                                                                                        │
│     GraphQL Client:     tina/__generated__/client.ts                                                            │
│     Typescript Types:   tina/__generated__/types.ts                                                             │
│     Static HTML file:   public/admin/index.html                                                                 │
│                                                                                                                 │
│                                                                                                                 │
├─────────────────────────────────────────────────────────────────────────────────────────────────────────────────╯
16:26:35 [content] Syncing content
16:26:35 [content] Synced content
16:26:35 [types] Generated 447ms
16:26:35 [check] Getting diagnostics for Astro files in S:\Projetos\academic_page\haroldo...
Result (67 files): 
- 0 errors
- 0 warnings
- 0 hints

16:26:43 [content] Syncing content
16:26:43 [content] Synced content
16:26:43 [types] Generated 443ms
16:26:43 [build] output: "static"
16:26:43 [build] mode: "static"
16:26:43 [build] directory: S:\Projetos\academic_page\haroldo\dist\
16:26:43 [build] Collecting build info...
16:26:43 [build] ✓ Completed in 481ms.
16:26:43 [build] Building static entrypoints...
16:26:44 [vite] ✓ built in 333ms
16:26:44 [vite] ✓ built in 75ms
16:26:44 [build] Rearranging server assets...

 generating static routes 
16:26:44   ├─ /404.html (+11ms) 
16:26:44   ├─ /ensino/2025-1-mecanica-classica/index.html (+3ms) 
16:26:44   ├─ /ensino/2026-2-relatividade-geral/index.html (+86ms) 
16:26:44   ├─ /ensino/index.html (+4ms) 
16:26:44   ├─ /pesquisa/index.html (+5ms) 
16:26:44   ├─ /publicacoes/index.html (+4ms) 
16:26:44   ├─ /sobre/index.html (+5ms) 
16:26:44   ├─ /index.html (+3ms) 
16:26:44 ✓ Completed in 148ms.

16:26:44 [build] ✓ Completed in 617ms.
16:26:44 [build] 8 page(s) built in 1.12s
16:26:44 [build] Complete!
EXIT=0
```

Comando: `node scripts/comparar-dist.mjs retrato <scratch>\depois3.json`

```
﻿retrato: 8 rota(s) de dist em C:\Users\andne\AppData\Local\Temp\claude\S--Projetos-academic-page-haroldo\53cca4d5-8b1a-44f1-b616-f47fe760fbbb\scratchpad\060\depois3.json
EXIT=0
```

Comando: `node scripts/comparar-dist.mjs comparar <scratch>\antes.json <scratch>\depois3.json`

```
﻿IGUAL      404.html
IGUAL      ensino/2025-1-mecanica-classica/index.html
IGUAL      ensino/2026-2-relatividade-geral/index.html
IGUAL      ensino/index.html
IGUAL      index.html
IGUAL      pesquisa/index.html
IGUAL      publicacoes/index.html
IGUAL      sobre/index.html
resumo: IGUAL 8 · DIFERENTE 0 · SÓ ANTES 0 · SÓ DEPOIS 0 · IGNORADA 0
EXIT=0
```

### Passo 8 — portão de qualidade

Comando: `npm run lint`

```
﻿
> haroldo-page@0.1.0 lint
> eslint .

EXIT=0
```

Comando: `npm run format:check`

```
﻿
> haroldo-page@0.1.0 format:check
> prettier --check .

Checking formatting...
All matched files use Prettier code style!
EXIT=0
```

Comando: `npm run test:coverage`

```
﻿
> haroldo-page@0.1.0 test:coverage
> vitest run --coverage


 RUN  v4.1.11 S:/Projetos/academic_page/haroldo
      Coverage enabled with v8


 Test Files  19 passed (19)
      Tests  336 passed (336)
   Start at  16:27:14
   Duration  1.37s (transform 3.98s, setup 0ms, import 7.20s, tests 276ms, environment 2ms)

 % Coverage report from v8
-------------------|---------|----------|---------|---------|-------------------
File               | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
-------------------|---------|----------|---------|---------|-------------------
-------------------|---------|----------|---------|---------|-------------------

=============================== Coverage summary ===============================
Statements   : 100% ( 279/279 )
Branches     : 100% ( 134/134 )
Functions    : 100% ( 73/73 )
Lines        : 100% ( 253/253 )
================================================================================
EXIT=0
```

Comando: `npm run test:dist`

```
﻿
> haroldo-page@0.1.0 test:dist
> vitest run -c vitest.dist.config.ts


 RUN  v4.1.11 S:/Projetos/academic_page/haroldo


 Test Files  1 passed (1)
      Tests  18 passed (18)
   Start at  16:27:23
   Duration  299ms (transform 48ms, setup 0ms, import 107ms, tests 63ms, environment 0ms)

EXIT=0
```

Comando: `git diff -- content/`

```
﻿diff --git a/content/perfil/index.md b/content/perfil/index.md
index b391758..87e7580 100644
--- a/content/perfil/index.md
+++ b/content/perfil/index.md
@@ -31,10 +31,10 @@ atuacao:
     instituicao: Universidade Federal do Maranhão (UFMA) — Departamento de Física
     periodo: atual
 areas:
-  - Teoria da Relatividade Geral e teorias alternativas de gravitação
-  - Perturbações lineares em espaços-tempos curvos
-  - Forças de maré
-  - Sombras de buracos negros
+  - nome: Teoria da Relatividade Geral e teorias alternativas de gravitação
+  - nome: Perturbações lineares em espaços-tempos curvos
+  - nome: Forças de maré
+  - nome: Sombras de buracos negros
 email: haroldo.lima@ufma.br
 foto: /uploads/profile.jpg
 links:
EXIT=0
```

### Passo 9 — painel local (orquestrador)

Rodado pelo orquestrador em 2026-09-28, 16:35–16:52, sobre o commit de trabalho `122df25` já
empurrado, com `npx astro dev --background --force` e `npx tinacms dev` separados, no Vivaldi com a
extensão ("You are in local mode").

- No Perfil, os itens de Formação acadêmica, Atuação profissional e Áreas de atuação aparecem
  rotulados; dentro do item de Formação aberto, o grupo "Versão em inglês (opcional)" aparece
  recolhido, com "Grau (EN)" e "Curso (EN)" no subpainel. O `name` do campo no DOM é
  `formacao.1.en.grau`.
- Preenchi "Grau (EN)" do 2º item ("Pós-doutorado") com `Postdoctoral fellowship` e salvei. A
  reordenação **não** saiu pela extensão: o arrasto (duas tentativas), o teclado (Espaço/seta — as
  teclas chegaram à página, conferido por ouvinte de `keydown`, mas a lista não se moveu) e eventos
  de ponteiro disparados por JS não moveram o item. **O stakeholder arrastou o item à mão** para o
  1º lugar e salvou; o arquivo abaixo é o gravado depois disso.
- Observado, não confirmado como defeito do Tina: um valor digitado no subpainel se perdeu ao voltar
  ao formulário pelo breadcrumb "index" antes de salvar (o campo voltou vazio e o Save voltou a
  ficar desabilitado). Salvar de dentro do subpainel gravou. Pode ser efeito da automação.

Frontmatter gravado — a tradução está **dentro** do item que foi movido (o `foto` mudou de lugar
pela ordem dos campos do Tina, sem mudar de valor):

```
$ git diff -- content/perfil/index.md
diff --git a/content/perfil/index.md b/content/perfil/index.md
index 87e7580..66ebc4e 100644
--- a/content/perfil/index.md
+++ b/content/perfil/index.md
@@ -3,17 +3,20 @@ nome: Haroldo Cilas Duarte Lima Junior
 cargo: Professor Adjunto A
 instituicao: 'Universidade Federal do Maranhão (UFMA), Campus São Luís'
 departamento: Centro Tecnológico — Departamento de Física
+foto: /uploads/profile.jpg
 bio: 'Professor Adjunto A no Departamento de Física do Centro Tecnológico da Universidade Federal do Maranhão (UFMA), Campus São Luís, e bolsista de Produtividade em Pesquisa do CNPq — Nível C. Doutor em Física pela UFPA (2023), com período sanduíche na Universidade de Aveiro. Pesquisa relatividade geral e teorias alternativas de gravitação, com ênfase em buracos negros de Kerr, forças de maré, campos escalares e sombras de buracos negros.'
 resumo_home: 'Pesquisa Relatividade Geral, teorias alternativas de gravitação e sombras de buracos negros.'
 formacao:
-  - grau: Formação complementar
-    curso: Quantum Field Theory
-    instituicao: 'ICTP — Trieste, Itália'
-    ano: 2023–2024
   - grau: Pós-doutorado
     curso: Física
     instituicao: Universidade Federal do Pará (UFPA)
     ano: '2023'
+    en:
+      grau: Postdoctoral fellowship
+  - grau: Formação complementar
+    curso: Quantum Field Theory
+    instituicao: 'ICTP — Trieste, Itália'
+    ano: 2023–2024
   - grau: Doutorado
     curso: Física
     instituicao: Universidade Federal do Pará (UFPA)
@@ -36,7 +39,6 @@ areas:
   - nome: Forças de maré
   - nome: Sombras de buracos negros
 email: haroldo.lima@ufma.br
-foto: /uploads/profile.jpg
 links:
   lattes: 'http://lattes.cnpq.br/8115459874963916'
   orcid: 'https://orcid.org/0000-0002-3702-7683'
EXIT=0
```

Reversão, depois do commit de trabalho, com `git checkout -- content/perfil/index.md`:

```
$ git status --short
EXIT=0
$ git diff -- content/
EXIT=0
```

Servidores encerrados com `npx astro dev stop` e `Stop-Process` no processo que escutava 4001 e
9000; as três portas (4321, 4001, 9000) ficaram sem escuta.

### Passo 10 — depois do push (orquestrador)

`npm run build` com cloud check (sem `--skip-cloud-checks`), sobre a árvore limpa em `122df25`,
depois de o TinaCloud reindexar. O `NativeCommandError` no topo é o PowerShell 5.1 embrulhando a
saída de erro do `node`; o código de saída é o da última linha.

```

> haroldo-page@0.1.0 build
> tinacms build && astro check && astro build

Starting Tina build
node.exe : 
No linha:1 caractere:1
+ & "C:\Program Files\nodejs/node.exe" "C:\Program Files\nodejs/node_mo ...
+ ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    + CategoryInfo          : NotSpecified: (:String) [], RemoteException
    + FullyQualifiedErrorId : NativeCommandError
 

[2K[1GChecking indexing process in TinaCloud... ⠋[2K[1GChecking indexing process in TinaCloud... ⠙[2K[1GChecking 
indexing process in TinaCloud... ⠹[2K[1GChecking indexing process in TinaCloud... ⠸[2K[1GChecking indexing process 
in TinaCloud... ⠼[2K[1GChecking indexing process in TinaCloud... ⠴



│
○  Tina build complete ───────────────────────────────────────────────────────────────────────────────────────────╮
│                                                                                                                 │
│  🦙 Tina Config                                                                                                 │
│     API url:            https://content.tinajs.io/2.4/content/8be98053-68c3-4262-b7bd-dd1286e1c7ad/github/main  │
│                                                                                                                 │
│  🤖 Auto-generated files                                                                                        │
│     GraphQL Client:     tina/__generated__/client.ts                                                            │
│     Typescript Types:   tina/__generated__/types.ts                                                             │
│     Static HTML file:   public/admin/index.html                                                                 │
│                                                                                                                 │
│                                                                                                                 │
├─────────────────────────────────────────────────────────────────────────────────────────────────────────────────╯
16:54:05 [vite] Re-optimizing dependencies because vite config has changed
16:54:05 [content] Syncing content
16:54:05 [content] Synced content
16:54:05 [types] Generated 475ms
16:54:05 [check] Getting diagnostics for Astro files in S:\Projetos\academic_page\haroldo...
Result (67 files): 
- 0 errors
- 0 warnings
- 0 hints

16:54:13 [content] Syncing content
16:54:13 [content] Synced content
16:54:13 [types] Generated 415ms
16:54:13 [build] output: "static"
16:54:13 [build] mode: "static"
16:54:13 [build] directory: S:\Projetos\academic_page\haroldo\dist\
16:54:13 [build] Collecting build info...
16:54:13 [build] ✓ Completed in 450ms.
16:54:13 [build] Building static entrypoints...
16:54:13 [vite] ✓ built in 318ms
16:54:13 [vite] ✓ built in 79ms
16:54:13 [build] Rearranging server assets...

 generating static routes 
16:54:13   ├─ /404.html (+11ms) 
16:54:13   ├─ /ensino/2025-1-mecanica-classica/index.html (+4ms) 
16:54:13   ├─ /ensino/2026-2-relatividade-geral/index.html (+85ms) 
16:54:13   ├─ /ensino/index.html (+5ms) 
16:54:13   ├─ /pesquisa/index.html (+3ms) 
16:54:13   ├─ /publicacoes/index.html (+4ms) 
16:54:13   ├─ /sobre/index.html (+5ms) 
16:54:13   ├─ /index.html (+3ms) 
16:54:13 ✓ Completed in 147ms.

16:54:13 [build] ✓ Completed in 610ms.
16:54:13 [build] 8 page(s) built in 1.12s
16:54:13 [build] Complete!
EXIT=0
```

CI e Workers Builds no commit de trabalho, check-runs pelo SHA completo:

```
$ gh api repos/researchgroups-ufma/haroldo-page/commits/122df25060ed65ff0ba182f0f9baa97b38f4f6d9/check-runs --jq '.check_runs[] | "\(.name)|\(.status)|\(.conclusion)|\(.completed_at)|\(.html_url)"'
Workers Builds: haroldo-page|completed|success|2026-09-28T19:47:04Z|https://github.com/researchgroups-ufma/haroldo-page/runs/109105075307
qualidade|completed|success|2026-09-28T19:46:33Z|https://github.com/researchgroups-ufma/haroldo-page/actions/runs/36474390115/job/109104329655
```
