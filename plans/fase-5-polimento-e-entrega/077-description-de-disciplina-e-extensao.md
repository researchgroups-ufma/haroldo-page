# Plano 077 — Meta description da disciplina e do item de Extensão (RF-30, Decisões 2, 6 e 9)

**Status:** TODO
**RFs cobertos:** **RF-30** (description de disciplina e de item de Extensão, limite e corte); sabatina "Lacunas da auditoria de qualidade", Decisões 2, 6 e 9 (Q-10); §12 fase 5, item "SEO completo" (fecha com 075, 076 e 078)
**Depende de:** plano 076 (textos de Ensino e de Extensão, a reserva desta regra)
**Modelo recomendado:** sonnet
**Agente recomendado:** implementer
**Executável por:** agente
**PRD:** `S:\Projetos\academic_page\haroldo\PRD.md`
**Projeto:** `S:\Projetos\academic_page\haroldo`

## Objetivo

A página de disciplina e a de item de Extensão passam a ter description vinda do próprio conteúdo,
com a regra de idioma da Decisão 6 e o corte da Decisão 9, por uma função pura testada em
`src/lib/text.ts`.

## Arquivos afetados

- `src/lib/text.ts` — função `metaDescription`
- `tests/lib/text.test.ts` — testes dela
- `src/views/CourseView.astro` — a prop `description` no `<BaseLayout>` (linha 100)
- `src/views/PostView.astro` — a prop `description` no `<BaseLayout>` (linha 65)
- `tests/dist/site-gerado.test.ts` — `describe` novo

> O executor não toca em arquivo fora desta lista. Se precisar, para e reporta. `Status:` fica `TODO`.
> Não commite. O schema não muda (Decisão 2).

## Contexto necessário

**A regra** (Decisões 2, 6 e 9 da sabatina "Lacunas da auditoria de qualidade"; RF-30):

| Página | Rota PT, em ordem | Rota EN, em ordem |
|---|---|---|
| Disciplina | `descricao`, `ementa`, `pt.teaching.description` | `en.descricao`, `en.ementa`, `en.teaching.description` |
| Item de Extensão | `corpo`, `pt.outreach.description` | `en.corpo`, `en.outreach.description` |

Vale o primeiro com texto (algo além de espaço). **Na rota EN o texto PT do item nunca entra**
(Decisão 6): por isso a regra **não** usa `localize`/`localizeOptional` de `src/i18n/fallback.ts`,
que caem no PT por desenho (RN-06). Use os campos direto. As chaves `teaching.description` e
`outreach.description` vêm do plano 076.

**Campos** (`src/content.config.ts`): disciplina `descricao` e `ementa` opcionais (linhas 431 e
433), com par `en.descricao`/`en.ementa` (409–411); extensão `corpo` obrigatório (522) e
`en.corpo` opcional (499). São `textarea` no Tina e **texto simples, não Markdown** (README da fase
3, decisão 2; `src/lib/text.ts` não interpreta nada). O "sem Markdown" da Decisão 6 fica atendido
porque o campo não tem Markdown a tirar: a função não remove `*`, `#` nem colchetes, e o texto sai
como o professor o digitou, só com os espaços normalizados. Se você achar Markdown de verdade num
`corpo` de `content/extensao/`, pare e reporte.

**`metaDescription(candidates, fallback)`** em `src/lib/text.ts`, exportada, TSDoc obrigatório:
- `candidates: readonly (string | undefined)[]`, `fallback: string`; devolve `string`;
- escolhe o primeiro candidato com algo além de espaço; sem nenhum, `fallback`;
- normaliza: toda sequência de espaço em branco (inclui `\r\n` e linha em branco entre parágrafos)
  vira um espaço; `trim` nas pontas;
- limite `MAX_DESCRIPTION_LENGTH = 160`, em `String.length` (Decisão 9). Até 160, sai inteira.
  Acima: o resultado tem no máximo 160 caracteres **com** as reticências, que são o caractere único
  `…` (U+2026). Corte em fim de palavra: se o caractere de índice 159 é espaço, a base é
  `texto.slice(0, 159)`; senão, a base vai até o último espaço dentro de `texto.slice(0, 159)`; sem
  espaço nenhum ali (uma palavra só com 160+), a base é `texto.slice(0, 159)`. Depois `trimEnd()` e
  `+ '…'`.

Testes mínimos em `tests/lib/text.test.ts`: primeiro candidato vazio ou só espaço é pulado; todos
vazios → `fallback`; quebra de linha e parágrafos viram um espaço; 160 exatos saem sem corte; 161
cortam em fim de palavra e terminam em `…` com no máximo 160; palavra que termina exatamente no
índice 158 (espaço no 159) fica inteira; palavra única de 200 caracteres sai com 160. O
`fallback` passa pela mesma normalização e corte.

**Nas views:** `CourseView` já tem `data` (linha 70) e `lang`; `PostView` também (linhas 50–52).
Monte os candidatos pela tabela acima e passe `description={...}` ao `<BaseLayout>`. Comentário
citando RF-30 e a sabatina, Decisão 6.

**Conteúdo de hoje** (para o canário; não conte com ele nas asserções): `relatividade-geral.md` tem
`descricao` e `ementa`, sem grupo `en`; os três `content/extensao/*exemplo*` têm `corpo` curto, e um
deles é rascunho (`publicado: false`).

**Asserções** (`describe('description da disciplina e da Extensão (RF-30, Decisão 6)')`), com o
esperado calculado de `content/` (via `gray-matter`, como o teste já faz) e de `metaDescription`,
nunca do `dist/`:
1. para toda disciplina publicada, `dist/ensino/<slug>/index.html` e
   `dist/en/teaching/<slug>/index.html` têm o `content` da regra; o mesmo para todo item de Extensão
   publicado em `dist/extensao/<slug>/` e `dist/en/outreach/<slug>/` (slug por `courseSlug` sobre o
   caminho do arquivo, como `src/views/outreach-paths.ts` faz);
2. em toda rota EN de disciplina ou de Extensão cujo item não tem o campo `en` correspondente, o
   `content` é o texto em inglês da página-mãe, e nunca contém o início (40 primeiros caracteres)
   do texto PT do item;
3. todo laço confere ao menos um item (`expect(n).toBeGreaterThan(0)`).

O limite de 160 em toda página já é a asserção 3 do plano 076.

**Armadilhas:** o Astro escapa atributo com `&amp;`/`&quot;`
(`node_modules/astro/dist/runtime/server/render/util.js:14`): compare decodificado. `tests/dist/i18n.test.ts`
(M-07) lê `meta[content]` — se a rota EN mostrar texto PT, ele reprova também.

**Regras de código:** `plans/fase-5-polimento-e-entrega/README.md`, seção "Regras de código".
Cabeçalho §10.1 de `text.ts` (Descrição, `Atualizado em`, `Versão`) e das views.

## Passos

1. `metaDescription` e seus testes → verify: `npm test -- tests/lib/text.test.ts` colado.
2. A prop `description` em `CourseView` e `PostView` → verify: `npm run build:pipeline` colado.
3. Asserções 1–3 → verify: `npm run test:dist` colado.
4. Canário A: em `CourseView`, troque os candidatos EN pelos campos PT (`data.descricao`) e refaça o build → a asserção 2 reprova; desfaça e refaça o build → verify: saídas coladas.
5. Canário B: em `metaDescription`, troque o limite para 200 → os testes de corte reprovam; desfaça → verify: saída colada.
6. Saída do `<meta name="description">` de cada rota de disciplina e de Extensão, nos dois idiomas → verify: comando e saída colados.
7. Portão → verify: `npm run lint`, `npm run format:check`, `npm run test:coverage` colados.

## Critérios de aceitação

- [ ] `metaDescription` exportada, com TSDoc e os testes da lista, verdes
- [ ] Disciplina e Extensão com a description da regra nos dois idiomas (asserção 1)
- [ ] Rota EN sem campo `en` usa o texto em inglês da página-mãe, nunca o PT do item (asserção 2 e canário A)
- [ ] Canário B vermelho
- [ ] `lint`, `format:check`, `test:coverage`, `build:pipeline`, `test:dist` verdes, com saída colada

## Evidência

<Preenchida pelo executor, com saída literal capturada em arquivo (ver `plans/DESPACHO.md`). Plano
sem esta seção preenchida não é DONE.>
