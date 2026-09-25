# Plano 066 — `/en/research/` e `/en/publications/`

**Status:** TODO
**RFs cobertos:** **RF-28**, RF-22, RF-13, RF-25, RN-01, RN-02, RN-06, RN-07, **F-07**, RF-26; sabatina fase 4, Decisões 4, 6, 13 e 15
**Depende de:** planos 065 (aviso, `LangText`, testes de `dist` por idioma), 063 (`ResearchView`, `ProjectItem`), 064 (`PublicationsView`)
**Modelo recomendado:** sonnet
**Agente recomendado:** implementer
**Executável por:** agente + **orquestrador** (navegador, passo 8)
**PRD:** `S:\Projetos\academic_page\haroldo\PRD.md`
**Projeto:** `S:\Projetos\academic_page\haroldo`

## Objetivo

Existem `/en/research/` e `/en/publications/`, com interface em inglês, conteúdo resolvido campo a
campo e o aviso único quando algo caiu no português. As rotas PT não mudam.

## Arquivos afetados

- `src/pages/en/research.astro`, `src/pages/en/publications.astro` — novos (páginas finas)
- `src/views/ResearchView.astro` — `localize` em `titulo`/`resumo`/`corpo` das linhas e o aviso
- `src/components/ProjectItem.astro` — `localize` em `titulo`/`descricao`; `portugueseOnly` em `financiador`/`colaboradores` (Decisão 13)
- `src/views/PublicationsView.astro` — só a interface por idioma; **sem** aviso (nenhum campo exibido é "T" nem "P")
- `tests/dist/site-gerado.test.ts` — rotas EN novas; rascunho ausente também em `/en`

> O executor não toca em arquivo fora desta lista. Se precisar, para e reporta. `Status:` fica `TODO`.
> Não commite. **Canário em `content/` autorizado só em
> `content/projetos/forcas-de-mare-em-espacos-tempos-de-kerr.md`** (passo 5), revertido por
> `git checkout --`.

## Contexto necessário

**Padrão do 065** (leia `plans/fase-4-internacionalizacao/065-en-home-e-about-com-aviso.md`, "Contexto
necessário"): `localize`/`localizeOptional` para campo "T" e `portugueseOnly` para campo "P" (061), `lang` direto no elemento de bloco, `LangText` para
texto em linha, `FallbackNotice` com `show = hasFallback([...])` como primeiro filho do conteúdo, e o
HTML PT idêntico provado pelo comparador com `--ignorar '^en/'`.

**Campos** (tabela "Classificação dos campos exibidos em `/en`" do README da fase):
- Linhas de pesquisa: `titulo`, `resumo`, `corpo` → `line.data.en?.x` (T). **Conteúdo real:**
  `content/linhas-pesquisa/relatividade-geral-e-teorias-alternativas-de-gravitacao.md` tem só
  `en.titulo` — é o único caso real de tradução parcial da fase: título em inglês sem `lang`, `resumo`
  e `corpo` em português com `lang="pt-BR"`. A outra linha não tem `en`.
- Projetos: `titulo`, `descricao` (T); `periodo` (F); `financiador`, `colaboradores` (P: `lang="pt-BR"` em `/en`, **sem** aviso — Decisão 13). Status
  (`t.research.status`) é dicionário. Nenhum projeto tem `en` hoje.
- Publicações: o único campo traduzível, `resumo`, **não é exibido** (§6.6 da identidade; Decisão 15:
  a página fica só com título, ano, autores, veículo e links). `titulo` e
  `veiculo` são "F" pela exceção da Decisão 13 (em geral já estão em inglês); `autores`, `ano`, `doi`,
  `arxiv`, `pdf_url` são factuais (RN-07). **Portanto `/en/publications/` não tem aviso nem
  `lang="pt-BR"` no `<main>`** — é o comportamento esperado, e o `PublicationItem.astro` não muda. Ordem e
  agrupamento (RN-02) não mudam por idioma (`groupByYear`, `compareWithinYear` em `pt-BR`).
- Âncoras (`id` das linhas, `ano-2026`) continuam iguais nos dois idiomas; não são texto visível.

**RN-01 em `/en`:** existe publicação real com `publicado: false`
(`content/publicacoes/2023-exemplo-notas-sobre-geodesicas-nulas-em-metricas-estacionarias.md`). O
teste "rascunho nunca aparece em HTML algum" já percorre todo `.html` — confirme que ele pega os
arquivos de `dist/en/` (a função `listSiteHtmlFiles` é recursiva) e cole a saída.

**Páginas finas:** `<ResearchView lang="en" />` e `<PublicationsView lang="en" />`.

**Testes de `dist`:** acrescentar `en/research/index.html` e `en/publications/index.html` às rotas
fixas; a asserção do aviso (065) passa a valer para as rotas novas; o teste do GSAP sob demanda
(348–366) passa a checar também `en/publications/index.html`.

**Regras de código:** README da fase 4.

## Passos

1. Retrato "antes": `npm run build:pipeline`; `node scripts/comparar-dist.mjs retrato <scratch>\antes.json` → verify: fim do build colado.
2. `localize` em `ResearchView` e `ProjectItem`, `portugueseOnly` em `financiador`/`colaboradores`; `PublicationsView` por idioma; páginas finas → verify: `npx astro check` colado.
3. Build e PT idêntico → verify: `npm run build:pipeline` colado; `retrato <scratch>\depois.json`; `comparar antes.json depois.json --ignorar '^en/'` colado — toda rota PT `IGUAL`.
4. HTML EN real → verify: no `<main>` de `dist/en/research/index.html`, o título da linha traduzida sem `lang` e o `resumo` dela com `lang="pt-BR"` (trechos colados); contagens de `lang="pt-BR"` e do aviso nas duas rotas (em `/en/publications/`: 0 e 0).
5. Canário **em `content/projetos/forcas-de-mare-em-espacos-tempos-de-kerr.md`** (autorizado): acrescente `en: { titulo, descricao }` → build → o projeto sai em inglês sem `lang` em `/en/research/` e **igual** em `/pesquisa/`; no mesmo build, `financiador`/`colaboradores` do projeto saem com `lang="pt-BR"` em `/en/research/` e sem `lang` em `/pesquisa/` (trechos colados). Que campo "P" não liga o aviso já está provado pelo teste do 061 e pelos canários (c)/(d) do 065 — aqui o aviso segue ligado pela linha real parcialmente traduzida; reverter com `git checkout --`; rebuild → verify: trechos antes/depois, `git status --short` sem `content/` e `git diff -- content/` vazio colados.
6. Testes de `dist` → verify: `npm run test:dist` colado.
7. Portão → verify: `npm run lint`, `npm run format:check`, `npm run test:coverage` colados.
8. **Orquestrador — navegador:** `/en/research/` e `/en/publications/` a 360/768/1440 — `[scrollWidth, clientWidth]`; aviso (se houver) uma vez; sanfona de `/en/publications/` a 1440; interface toda em inglês fora dos elementos `lang="pt-BR"`; o rascunho ausente.

## Critérios de aceitação

- [ ] `/en/research/` e `/en/publications/` gerados, com `<html lang="en">` e interface do `en.ts`
- [ ] A linha com `en.titulo` mostra o título em inglês e o resumo em português marcado, com o aviso uma vez — tradução parcial real e o exemplo do RF-28 (Decisão 15)
- [ ] Projeto traduzido sai em inglês e o PT não muda (canário do passo 5)
- [ ] `financiador`/`colaboradores` por `portugueseOnly`, com `lang="pt-BR"` em `/en` (Decisão 13); aviso uma vez em `/en/research/` quando campo "T" caiu no PT
- [ ] `/en/publications/` sem aviso e sem `lang="pt-BR"` no `<main>` (título e veículo são "F", Decisão 13)
- [ ] Rascunho ausente de `dist/en/**` (teste de `dist`)
- [ ] Rotas PT idênticas (comparador com `--ignorar '^en/'`)
- [ ] Navegador: sem rolagem horizontal; sanfona funcionando em `/en/publications/` (orquestrador)
- [ ] `astro check`, `lint`, `format:check`, `test:coverage`, `build:pipeline`, `test:dist` verdes, com saída colada

## Evidência

<Preenchido pelo executor ao concluir: saídas literais coladas, por passo; o passo 8 é do orquestrador. Plano sem esta seção preenchida não é DONE.>
