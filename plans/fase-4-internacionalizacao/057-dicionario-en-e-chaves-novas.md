# Plano 057 — Dicionário `en.ts`, chaves novas e `strings(lang)`

**Status:** TODO
**RFs cobertos:** §10.4 (strings de interface), M-07 (parte unitária), F-07 (texto do aviso), RF-29 (texto do seletor), §8.3 (data por locale); sabatina fase 4, Decisões 4, 5, 11 e 12; dívida (d) da fase 3
**Depende de:** plano 055 (comparador)
**Modelo recomendado:** sonnet
**Agente recomendado:** implementer
**Executável por:** agente + **stakeholder** (revisão do texto em inglês — passo obrigatório antes do DONE, Decisão 11)
**PRD:** `S:\Projetos\academic_page\haroldo\PRD.md`
**Projeto:** `S:\Projetos\academic_page\haroldo`

## Objetivo

Existe `src/i18n/en.ts`, com o tipo `UiStrings` inteiro traduzido, e `strings(lang)` devolve o
dicionário do idioma. O `pt.ts` ganha, de uma vez, todas as chaves que a fase usa. Um teste reprova
valor inglês copiado do português. As páginas PT continuam **idênticas**, e o stakeholder aprovou o
inglês antes do DONE.

## Arquivos afetados

- `src/i18n/pt.ts` — chaves novas; sai `about.eyebrow`; cabeçalho atualizado
- `src/i18n/en.ts` — novo
- `src/i18n/index.ts` — novo (`strings`)
- `tests/i18n/pt.test.ts` — testes das chaves novas
- `tests/i18n/en.test.ts` — novo
- `tests/i18n/excecoes-m07.ts` — novo (lista de valores iguais nos dois idiomas; reusada pelo 072)
- `src/pages/sobre.astro` — só `BaseLayout title={pt.about.eyebrow}` → `title={pt.nav.about}`
- `src/pages/publicacoes.astro` — só `BaseLayout title={pt.publications.title}` → `title={pt.nav.publications}` (o `<h1>` continua `pt.publications.title`)

> O executor não toca em arquivo fora desta lista. Se precisar, para e reporta. `Status:` fica `TODO`.
> Não commite. **Este é o único plano da fase que edita os dicionários** (README da fase).

## Contexto necessário

**Decisão 11** (`docs/sabatinas/CHANGELOG_sabatina_fase-4-i18n.md`): o executor escreve o `en.ts`; o
**stakeholder revisa antes do DONE**, com uma tabela PT → EN de **todas** as strings anexada à
Evidência, e a revisão é um passo explícito com a aprovação registrada. **Decisão 12:** o teste da
M-07 precisa de uma lista explícita de exceções para valores iguais nos dois idiomas — ela nasce
aqui, em `tests/i18n/excecoes-m07.ts`, e o 072 a reusa.

**Estado atual** (`src/i18n/pt.ts`, 167 linhas): objeto `pt` com os grupos `site`, `nav`, `about`,
`research`, `teaching`, `course`, `script`, `publications`, `notFound`, e `export type UiStrings =
typeof pt`. Os mapas de enum usam `satisfies Record<…>` tipado pelos schemas Zod — mantenha.

**Chaves novas no `pt.ts` (fixadas no fatiamento, README da fase, decisões 4–6):**

| Chave | Valor PT | Uso |
|---|---|---|
| `site.description` | **exatamente** o valor atual de `siteConfig.description` (`src/lib/config.ts:45-46`): `'Site acadêmico do Prof. Haroldo Cilas Duarte Lima Junior, Professor Adjunto A do Departamento de Física da UFMA.'` | meta description; o 058 troca o `BaseLayout` e remove `siteConfig.description` |
| `language.code` | `'EN'` | texto visível do seletor na página PT (Decisão 5: o link mostra o idioma de **destino**) |
| `language.name` | `'English version'` | nome acessível por extenso, **no idioma de destino** (o link leva `lang="en"`, Decisão 5) |
| `fallback.notice` | `'Parte do conteúdo desta página só está disponível em português.'` | aviso da Decisão 4; só aparece em `/en`, mas o tipo exige o par |
| `date.format` | `(year: string, month: string, day: string) => \`${day}/${month}/${year}\`` | §8.3; o 059 troca `formatDate` para usá-la |

**Sai:** `about.eyebrow` (`'Sobre'`), usado só em `src/pages/sobre.astro:77` como título da aba. A
chave de `<title>` das rotas fixas passa a ser `nav[chave]` (decisão 5 do README da fase, dívida (d)
da fase 3). `pt.nav.about` e `pt.nav.publications` têm os mesmos valores (`'Sobre'`,
`'Publicações'`), então o HTML não muda — é o que o comparador prova.

**`en.ts`:** `export const en: UiStrings = { … }` — todo valor em inglês, escrito por você. Sem
tradução automática colada sem leitura. Pontos fixos:
- `language.code = 'PT'`, `language.name = 'Versão em português'` (destino é o PT).
- `fallback.notice`: a Decisão 4 dá o exemplo "Some content on this page is only available in
  Portuguese" — use-o, com ponto final.
- `date.format(year, month, day)`: "March 15, 2026" (§8.3 do PRD) — `${MONTHS[m-1]} ${Number(day)},
  ${year}`, com `MONTHS` constante no próprio `en.ts`. **Mês fora de `01`–`12` devolve
  `${year}-${month}-${day}`** (decisão 6 do README da fase: o PT não valida calendário e o EN não
  inventa mês). Nada de `Date`/`Intl` (fuso, ver `src/lib/date.ts`).
- Funções (`pageTitle`, `portraitAlt`, `lessonNumber`, `dueDate`, `script.eyebrow`) com o mesmo
  formato de parâmetros.

**`src/i18n/index.ts`:** `export function strings(lang: Locale): UiStrings` (`Locale` de
`src/lib/config.ts`, que já exporta `'pt' | 'en'`). Cabeçalho §10.1 e TSDoc.

**`tests/i18n/en.test.ts`** (padrão de `tests/i18n/pt.test.ts`, que já tem `collectLeafStrings`):
nenhuma folha vazia; mapas de enum com as mesmas chaves, na mesma ordem, dos schemas; `strings('pt')
=== pt` e `strings('en') === en`; `date.format` nos dois (inclusive o mês `'13'`); e o **teste de valor
copiado**: para cada folha string e cada função (avaliada com argumentos de amostra), `en !== pt`,
**exceto** as chaves listadas em `tests/i18n/excecoes-m07.ts`.

**`tests/i18n/excecoes-m07.ts`:** exporta a lista de **caminhos de chave** (ex.:
`'about.links.orcid'`) cujo valor é legitimamente igual nos dois idiomas, cada um com um comentário
de uma linha dizendo por quê (nome próprio, sigla, empréstimo usual em inglês). Candidatos prováveis
hoje: `site.menu` ("Menu"), `about.links.orcid`/`scholar`/`arxiv`/`researchgate`/`github`,
`course.links` ("Links"), `course.materialType.slides`, `script.language.python`/`r`/`matlab`/`bash`,
`publications.type.preprint`, `publications.doi`/`arxiv`/`pdf`. **A lista final é a que o seu `en.ts`
produzir**, e cada item entra na tabela de revisão.

**Tabela de revisão (Decisão 11):** gerada **por script** a partir dos dois dicionários (funções
avaliadas com argumentos de amostra — mostre os argumentos), em Markdown: `chave | PT | EN | igual?`.
Vai para a Evidência. O executor **não** marca a revisão como feita.

**Regras de código:** README da fase 4. O dicionário não recebe dado de conteúdo.

## Passos

1. Retrato "antes": `npm run build:pipeline`; `node scripts/comparar-dist.mjs retrato <scratch>\antes.json` → verify: fim do build colado.
2. `pt.ts` (chaves novas, sai `about.eyebrow`), `index.ts`, `en.ts`; as duas páginas → verify: `npx astro check` colado (o tipo `UiStrings` obriga o `en` a ter toda chave).
3. Testes (`pt.test.ts`, `en.test.ts`, `excecoes-m07.ts`) → verify: `npm test -- --reporter=verbose tests/i18n` colado.
4. Canário do teste de valor copiado: troque temporariamente `en.nav.about` por `'Sobre'` → vermelho nomeando a chave; desfaça → verify: as duas saídas coladas.
5. Comparação → verify: `npm run build:pipeline`; `retrato <scratch>\depois.json`; `comparar antes.json depois.json` colado — toda rota `IGUAL`, exit 0.
6. Tabela de revisão gerada por script → verify: tabela inteira colada na Evidência, com o comando que a gerou.
7. Portão → verify: `npm run lint`, `npm run format:check`, `npm run test:coverage` colados.
8. **Stakeholder (dependente de humano):** lê a tabela do passo 6 e aprova ou pede mudança. Mudança pedida → o executor ajusta, repete 3, 5 e 6. **O orquestrador registra na Evidência a aprovação, com data e o que mudou**; sem esse registro o plano não vai a DONE.

## Critérios de aceitação

- [ ] `en.ts` implementa `UiStrings` inteiro; `strings(lang)` devolve o dicionário do idioma
- [ ] As cinco chaves novas existem nos dois dicionários; `site.description` PT é byte a byte o valor de `siteConfig.description`; `about.eyebrow` saiu
- [ ] `en.date.format` produz "March 15, 2026" para `('2026','03','15')` e devolve ISO para mês fora de 01–12 (teste)
- [ ] Teste de valor copiado reprova (canário do passo 4) e a lista de exceções tem uma justificativa por item
- [ ] Páginas PT idênticas: comparador com toda rota `IGUAL`
- [ ] Tabela PT → EN de todas as strings na Evidência, gerada por script
- [ ] **Revisão do stakeholder registrada na Evidência, com data** (Decisão 11)
- [ ] `astro check`, `lint`, `format:check`, `test:coverage`, `build:pipeline` verdes, com saída colada

## Evidência

<Preenchido pelo executor ao concluir: saídas literais coladas, por passo; a aprovação do stakeholder é registrada pelo orquestrador. Plano sem esta seção preenchida não é DONE.>
