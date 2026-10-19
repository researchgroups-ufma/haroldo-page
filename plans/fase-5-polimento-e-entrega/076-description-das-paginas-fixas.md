# Plano 076 — Meta description própria das páginas fixas (RF-30, Decisões 2 e 9)

**Status:** TODO
**RFs cobertos:** **RF-30** (description por página: as páginas fixas); sabatina "Lacunas da auditoria de qualidade", Decisões 2 e 9; §12 fase 5, item "SEO completo" (fecha com 075, 077 e 078)
**Depende de:** nenhum
**Modelo recomendado:** sonnet
**Agente recomendado:** implementer
**Executável por:** agente; a revisão dos textos é do stakeholder, pelo orquestrador, antes do DONE
**PRD:** `S:\Projetos\academic_page\haroldo\PRD.md`
**Projeto:** `S:\Projetos\academic_page\haroldo`

## Objetivo

As sete páginas fixas de cada idioma (Home, Sobre, Pesquisa, Publicações, Ensino, Extensão e 404)
passam a ter `<meta name="description">` próprio, vindo de `src/i18n/pt.ts` e `src/i18n/en.ts`,
sem repetir o de outra página fixa do mesmo idioma. O teste de `dist` prova isso e o limite de 160
caracteres em toda página.

## Arquivos afetados

- `src/i18n/pt.ts`, `src/i18n/en.ts` — seis chaves novas em cada
- `src/views/AboutView.astro`, `ResearchView.astro`, `PublicationsView.astro`, `TeachingView.astro`, `OutreachView.astro`, `NotFoundView.astro`, `HomeView.astro` — a prop `description` no `<BaseLayout>`
- `tests/dist/site-gerado.test.ts` — `describe` novo

> O executor não toca em arquivo fora desta lista. Se precisar, para e reporta. `Status:` fica `TODO`.
> Não commite. **`src/layouts/BaseLayout.astro` não muda**: a prop `description` já existe e a
> reserva `t.site.description` fica.

## Contexto necessário

**Decisão 2** (`docs/sabatinas/CHANGELOG_sabatina_auditoria-qualidade.md`): as páginas fixas
ganham texto próprio no dicionário; o schema não muda. **Decisão 9:** toda description com no
máximo 160 caracteres. Disciplina e item de Extensão são o plano 077, que usa os textos de Ensino e
de Extensão daqui como reserva.

**Hoje** as 20 rotas do sitemap têm só dois textos, `t.site.description` PT e EN; nenhuma view passa
`description` (`grep -rn "description=" src/views src/pages` vazio). O `BaseLayout.astro:61` usa
`description = t.site.description` quando a prop falta. As chamadas a mudar:

| View | Linha | Hoje |
|---|---|---|
| `HomeView.astro` | 69 | `<BaseLayout title={undefined} bare>` |
| `AboutView.astro` | 94 | `<BaseLayout title={t.nav.about}>` |
| `ResearchView.astro` | 116 | `<BaseLayout title={t.nav.research}>` |
| `PublicationsView.astro` | 61 | `<BaseLayout title={t.nav.publications}>` |
| `TeachingView.astro` | 87 | `<BaseLayout title={t.nav.teaching}>` |
| `OutreachView.astro` | 70 | `<BaseLayout title={t.nav.outreach}>` |
| `NotFoundView.astro` | 46 | `<BaseLayout title={t.notFound.title} notFound>` |

**Chaves** (proposta do fatiamento; nomes em inglês, como o resto do dicionário): a Home usa a
`site.description` que já existe; as outras seis são novas, uma por grupo, sempre `description`:
`about.description`, `research.description`, `publications.description`,
`teaching.description`, `outreach.description`, `notFound.description`. O `en.ts` é tipado por
`UiStrings`, então o `astro check` reprova chave faltando.

**Textos** — proposta do fatiamento, **o stakeholder revisa antes do DONE** (mesmo rito do `en.ts`
na fase 4, Decisão 11). Genéricos de propósito: nenhum cita tema de pesquisa nem disciplina, porque
o professor muda esse conteúdo no painel e o dicionário não acompanharia. O inglês segue o
vocabulário de David Tong (Lectures, Problem sheets, caixa de frase).

| Chave | PT | EN |
|---|---|---|
| `about` | Biografia, formação acadêmica, atuação profissional e contato do Prof. Haroldo Lima Junior, do Departamento de Física da UFMA. | Biography, education, professional experience and contact details of Prof. Haroldo Lima Junior, Department of Physics, UFMA. |
| `research` | Linhas e projetos de pesquisa do Prof. Haroldo Lima Junior no Departamento de Física da UFMA, com as publicações ligadas a cada linha. | Research areas and projects of Prof. Haroldo Lima Junior at the Department of Physics, UFMA, with the publications linked to each one. |
| `publications` | Artigos, preprints e demais publicações do Prof. Haroldo Lima Junior, organizados por ano, com links para DOI, arXiv e PDF. | Papers, preprints and other publications by Prof. Haroldo Lima Junior, grouped by year, with links to DOI, arXiv and PDF. |
| `teaching` | Disciplinas do Prof. Haroldo Lima Junior na UFMA, em curso e encerradas, com ementa, aulas, listas de exercícios e materiais. | Courses taught by Prof. Haroldo Lima Junior at UFMA, ongoing and past, with syllabus, lectures, problem sheets and materials. |
| `outreach` | Atividades de extensão do Prof. Haroldo Lima Junior na UFMA, com o relato e as fotos de cada ação. | Outreach activities of Prof. Haroldo Lima Junior at UFMA, with a short report and photos of each event. |
| `notFound` | Página não encontrada no site do Prof. Haroldo Lima Junior, com a lista de todas as páginas do site. | Page not found on the website of Prof. Haroldo Lima Junior, with a list of all pages on the site. |

Todos têm menos de 160 caracteres; o teste confere. Comentário curto acima de cada chave nova
citando RF-30 e a Decisão 2.

**Armadilhas medidas neste projeto:**
- `tests/i18n/en.test.ts` reprova par `pt`/`en` igual fora de `tests/i18n/excecoes-m07.ts`, e
  `tests/dist/i18n.test.ts` (M-07) lê **valores de atributo**, inclusive `meta[content]`: um valor do
  dicionário `pt` com 4+ caracteres no HTML de `/en/**` reprova, e o simétrico também. Se reprovar,
  **não** acrescente exceção: ajuste o texto, cole a falha e reporte a troca.
- O Astro escapa atributo com `&amp;` e `&quot;` (`toAttributeString`,
  `node_modules/astro/dist/runtime/server/render/util.js:14`), não com o `escapeLikeAstro` do
  texto. Compare o `content` decodificado com o valor do dicionário.
- HTML do `dist/` sai numa linha: conte com `grep -o … | wc -l`.

**Asserções** (`describe('description das páginas fixas (RF-30, Decisões 2 e 9)')`), com o esperado
tirado do dicionário (fonte independente do `dist/`):
1. para cada idioma e cada página fixa (`routePath(key, lang)` de `src/lib/routes.ts` para as seis
   rotas; `dist/404.html` e `dist/en/404.html` para a 404), o `content` do
   `<meta name="description">` é o valor da chave da tabela (Home: `site.description`);
2. os sete textos de um idioma são distintos entre si;
3. **toda** página `.html` de `dist/` fora de `admin/` tem exatamente um `<meta name="description">`,
   com 1 a 160 caracteres (`String.length` do valor decodificado).

**Regras de código:** `plans/fase-5-polimento-e-entrega/README.md`, seção "Regras de código".
Cabeçalho §10.1 dos arquivos tocados atualizado (`Atualizado em`, `Versão`).

## Passos

1. Chaves e textos em `pt.ts` e `en.ts` → verify: `npm test -- tests/i18n` colado.
2. A prop `description` nas sete views → verify: `git diff --stat -- src/views` colado (sete arquivos).
3. Asserções 1–3 → verify: `npm run build:pipeline` e `npm run test:dist` colados.
4. Canário: tire a prop `description` da `AboutView` e refaça o build → a asserção 1 (Sobre) e a 2 reprovam, porque a Sobre volta ao texto da Home; desfaça editando de volta e refaça o build → verify: saídas coladas.
5. Saída do `<meta name="description">` das 14 páginas fixas → verify: um comando que imprima rota e `content` de cada uma, colado.
6. Portão → verify: `npm run lint`, `npm run format:check`, `npm run test:coverage` colados.

**Do orquestrador, antes do DONE:** mostrar a tabela de textos (saída do passo 5) ao stakeholder e
registrar a aprovação, ou as trocas pedidas, com data.

## Critérios de aceitação

- [ ] Seis chaves novas `description` em `pt.ts` e `en.ts`; Home com `site.description`
- [ ] As sete views passam `description`; `BaseLayout.astro` intocado
- [ ] Asserções 1–3 verdes e o canário do passo 4 vermelho
- [ ] `tests/i18n/en.test.ts` e `tests/dist/i18n.test.ts` verdes sem exceção nova
- [ ] Textos aprovados pelo stakeholder (orquestrador)
- [ ] `lint`, `format:check`, `test:coverage`, `build:pipeline`, `test:dist` verdes, com saída colada

## Evidência

<Preenchida pelo executor, com saída literal capturada em arquivo (ver `plans/DESPACHO.md`). Plano
sem esta seção preenchida não é DONE.>
