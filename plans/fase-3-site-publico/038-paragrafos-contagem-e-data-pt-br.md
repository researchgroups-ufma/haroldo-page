# Plano 038 — Texto corrido em parágrafos, contagem com dois dígitos e data pt-BR

**Status:** TODO
**RFs cobertos:** §8.3 (datas por locale), RF-21/RF-22/RF-24 (texto longo legível), §11 (formatação
de datas por locale, teste unitário)
**Depende de:** nenhum
**Modelo recomendado:** sonnet
**Agente recomendado:** implementer
**Executável por:** agente
**PRD:** `S:\Projetos\academic_page\haroldo\PRD.md`
**Projeto:** `S:\Projetos\academic_page\haroldo`

## Objetivo

Três funções puras e testadas que todas as páginas usam: dividir texto do professor em parágrafos,
formatar contagem com dois dígitos e formatar data ISO como `dd/mm/aaaa`.

## Arquivos afetados

- `src/lib/text.ts` — novo: `toParagraphs`, `padCount`
- `src/lib/date.ts` — novo: `formatDate`
- `tests/lib/text.test.ts` — novo
- `tests/lib/date.test.ts` — novo

> O executor não toca em arquivo fora desta lista. Se precisar, para e reporta.
> `Status:` fica `TODO`. Não commite. **Não** remova `src/lib/.gitkeep` (é do plano 037, que pode
> estar rodando em paralelo).

## Contexto necessário

**Decisão do fatiamento (README da fase, decisão 2): texto longo é texto simples, não Markdown.**
`bio`, `corpo`, `ementa`, `resumo` e todas as `descricao` são, em `tina/config.ts`, `type:
'string'` com `ui.component: 'textarea'` (ex.: `tina/config.ts:141-146` para `bio`,
`:539-542` para `ementa`). O professor não vê pré-visualização de Markdown. Exemplo real, uma linha
só, de `content/disciplinas/2026.2-relatividade-geral.md:8`:

```yaml
ementa: Variedades e tensores; conexão e curvatura; equações de campo de Einstein; soluções de Schwarzschild e Kerr; ondas gravitacionais no regime linear.
```

**`toParagraphs(text: string | undefined): string[]`**
- `undefined`, `''` ou só espaço → `[]` (quem chama usa isso para esconder o bloco inteiro — regra
  "campo vazio não deixa rastro", §1 da identidade).
- Normaliza `\r\n` → `\n` antes de dividir (conteúdo salvo no Windows).
- Divide em `/\n[ \t]*\n/` (uma ou mais linhas em branco, inclusive com espaços); `trim` em cada
  parte; descarta partes vazias.
- **Não** transforma quebra de linha simples: ela fica no texto e o HTML a colapsa em espaço.
- **Não** escapa nem interpreta nada — o escape é do Astro, na interpolação `{p}`. A docstring diz,
  com essas palavras, que o resultado **nunca** vai para `set:html`.

**`padCount(n: number): string`** — contagem da Home (`02 linhas de pesquisa`, §6.1 da identidade):
inteiro ≥ 0 com dois dígitos (`0` → `"00"`, `7` → `"07"`, `12` → `"12"`, `120` → `"120"`). Número
negativo ou não inteiro é impossível pelo caminho do produto (é `length` de array) — **não** trate
(`CLAUDE.md` §2).

**`formatDate(value: string): string`** — §8.3: `pt-BR` é `15/03/2026`.
- Se `value.trim()` casa com `^\d{4}-\d{2}-\d{2}$`, devolve `dd/mm/aaaa` **por manipulação de
  string**.
- Caso contrário devolve `value.trim()` sem alteração. O campo `data` é **texto livre** no schema
  (`aulaSchema.data: z.string().optional()`, `src/content.config.ts:299`; `tina/config.ts:575`,
  `type: 'string'`), então "10/08" digitado pelo professor tem de aparecer como ele digitou, e o
  build não pode falhar por isso (o schema não muda nesta fase).
- **Armadilha, e o motivo de não usar `Date`:** `new Date('2026-08-10')` é meia-noite **UTC**; em
  São Luís (UTC−3) `toLocaleDateString('pt-BR')` mostra **09/08/2026**, e o resultado depende do fuso
  da máquina de build. Nenhum `Date`, nenhum `Intl` nesta função.
- Não valida calendário (`2026-02-31` sai `31/02/2026`) — é o que o professor digitou.

**Testes (fixtures sintéticas; valores exatos):**
- `toParagraphs`: `undefined` → `[]`; `'  '` → `[]`; uma linha → 1 parágrafo; `'a\n\nb'` → `['a','b']`;
  `'a\n  \n\n b'` → `['a','b']`; `'a\r\n\r\nb'` → `['a','b']`; `'a\nb'` → `['a\nb']`; `'<b>x</b>'`
  → `['<b>x</b>']` (inalterado — o escape é do Astro). Um caso com o texto real da `ementa` acima →
  1 parágrafo.
- `padCount`: 0, 7, 12, 120.
- `formatDate`: `'2026-08-10'` → `'10/08/2026'`; `' 2026-08-10 '` → `'10/08/2026'`; `'10/08'` →
  `'10/08'`; `'2026-8-10'` → `'2026-8-10'`; `'2026-08-10T10:00'` → inalterado.
- Um teste de **determinismo de fuso**: com `process.env.TZ = 'America/Fortaleza'` definido no
  próprio teste (o teste roda em Node, não sob `src/`), `formatDate('2026-08-10')` continua
  `'10/08/2026'`. Restaure o `TZ` no `afterEach`.

**Cabeçalho §10.1** nos dois módulos (modelo: `src/lib/slug.ts`), TSDoc nas três funções, com a
referência ao PRD (`§8.3`) no comentário da regra de data.

## Passos

1. Escrever `src/lib/text.ts` e `tests/lib/text.test.ts` → verify: `npx vitest run tests/lib/text.test.ts` colado.
2. Escrever `src/lib/date.ts` e `tests/lib/date.test.ts` → verify: `npx vitest run tests/lib/date.test.ts` colado.
3. Canários: (a) troque o separador por `'\n'` em `toParagraphs` e mostre `'a\nb'` vermelho; (b) implemente `formatDate` com `new Date(value).toLocaleDateString('pt-BR')` **temporariamente** e mostre o teste de fuso vermelho; reverta os dois → verify: saídas vermelhas coladas; `git diff src/lib` final sem as mudanças temporárias.
4. Portão → verify: `npm run lint`, `npm run format:check`, `npm run test:coverage` colados.

## Critérios de aceitação

- [ ] `toParagraphs`, `padCount` e `formatDate` com os comportamentos listados, e nenhum uso de `Date`/`Intl` em `date.ts`
- [ ] Todos os casos de teste listados existem e passam
- [ ] Canários (a) e (b) mostrados vermelhos e revertidos
- [ ] Cobertura agregada ≥ 80%; `lint` e `format:check` verdes, com saída colada
- [ ] Cabeçalho §10.1 e TSDoc, com a docstring de `toParagraphs` proibindo `set:html`

## Evidência

<Preenchido pelo executor ao concluir. Declare também o que NÃO rodou.>
