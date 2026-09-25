# Plano 065 — `/en/` e `/en/about/`, com o aviso de idioma (F-07)

**Status:** TODO
**RFs cobertos:** **RF-28**, RF-14, RN-06, RN-09, **F-07**, RF-20, RF-21, RF-26, §8.3; sabatina fase 4, Decisões 4, 6, 7 e 13; §12 fase 4, item 1
**Depende de:** planos 057 (**DONE**, com a revisão do stakeholder), 061 (fallback), 062 (views)
**Modelo recomendado:** sonnet
**Agente recomendado:** implementer
**Executável por:** agente + **orquestrador** (navegador, passo 9)
**PRD:** `S:\Projetos\academic_page\haroldo\PRD.md`
**Projeto:** `S:\Projetos\academic_page\haroldo`

## Objetivo

Existem `/en/` e `/en/about/`, com a interface em inglês e o conteúdo do perfil resolvido campo a
campo: traduzido onde há `en`, em português com `lang="pt-BR"` onde não há, e **um** aviso discreto na
página quando algo caiu no português. É a primeira árvore `/en` servida. As rotas PT não mudam.

## Arquivos afetados

- `src/pages/en/index.astro`, `src/pages/en/about.astro` — novos (páginas finas)
- `src/pages/en/.gitkeep` — removido (a pasta passa a ter arquivo)
- `src/views/HomeView.astro`, `src/views/AboutView.astro` — `localize` nos campos e o aviso
- `src/components/FallbackNotice.astro` — novo (o aviso)
- `src/components/LangText.astro` — novo (texto em linha que leva `lang` só quando caiu no PT)
- `tests/dist/site-gerado.test.ts` — rotas EN, `lang` por árvore, rótulo da navegação por idioma, aviso
- `docs/identidade-visual.md` — seção do aviso e nota das rotas `/en`

> O executor não toca em arquivo fora desta lista. Se precisar, para e reporta. `Status:` fica `TODO`.
> Não commite. **Canário em `content/` autorizado só em `content/perfil/index.md`** (passo 6),
> revertido por `git checkout -- content/perfil/index.md`.

## Contexto necessário

**Decisão 4** (`docs/sabatinas/CHANGELOG_sabatina_fase-4-i18n.md`): **um aviso por página**, não badge
por item; se qualquer texto de conteúdo exibido numa rota `/en` caiu no português, a página mostra um
único aviso discreto, texto do dicionário `en` (`t.fallback.notice`, 057); e **todo elemento cujo texto
caiu no PT recebe `lang="pt-BR"`**. **Decisão 13** (Q-F4-1, 2026-09-24, "`lang` sim, aviso não"): texto
em português **sem** campo em inglês (tipo "P") também recebe `lang="pt-BR"` em `/en`, mas **não** liga o
aviso — o aviso é só do fallback de campo "T". **Decisão 7:** a tradução de `formacao[i]`, `atuacao[i]` e
`areas[i]` vive em `item.en` (060). Tabela "Classificação dos campos exibidos em `/en`" do README da
fase: a coluna **Tipo** diz qual função cada campo usa — "T" por `localize`/`localizeOptional`, "P"
por `portugueseOnly`, "F" por nenhuma (061).

**Campos desta rota:**
- Home: `cargo`, `instituicao`, `resumo_home` → `localize(pt, perfil.en?.x, lang)`; `departamento` →
  `localizeOptional`; `formacao[i]`: `grau`/`curso` com `item.en?.grau`/`item.en?.curso`, `ano`
  factual; `areas[i].nome` com `item.en?.nome`.
- Sobre: `bio` (`localize` e depois `toParagraphs` do `text`); timeline de formação (título `grau —
  curso` como na Home; `place` = `portugueseOnly(instituicao, lang)`); atuação (`cargo` com
  `item.en?.cargo`; `instituicao` e `periodo` por `portugueseOnly`).
- Campo "P" passa por `portugueseOnly(texto, lang)` (061), **nunca** por `localize(texto, undefined,
  lang)` — este devolve `fellBack: true` e ligaria o aviso. Os `LocalizedText` de campo "P" podem entrar
  no `hasFallback([...])` sem efeito, mas não precisam.

**Como o `lang` chega ao HTML, sem mudar as páginas PT:** em elemento de bloco, `lang={x.lang}` no
próprio elemento (`<p lang={cargo.lang}>`) — em PT `x.lang` é `undefined` e o Astro não renderiza o
atributo. Texto **em linha** que divide elemento com outro texto (ex.: `{ano} · {grau} — {curso}`) usa
`LangText.astro`: prop `value: LocalizedText`; renderiza só o texto quando `value.lang` é ausente e
`<span lang={value.lang}>{value.text}</span>` quando não é — assim o HTML PT fica idêntico (o
comparador prova). Parágrafos da `bio`: o `lang` vai no contêiner dos parágrafos.

**Aviso (`FallbackNotice.astro`):** prop `show: boolean`; renderiza `<p class="text-pequeno
text-secundario">{t.fallback.notice}</p>` (idioma pelo caminho) **só** quando `show` e o idioma do
caminho é `en`; caso contrário, nada. A view calcula `show = hasFallback([...todos os LocalizedText
exibidos])` (061). **Lugar (decisão de fatiamento 7):** nas páginas internas, primeiro filho do
conteúdo (slot padrão do `BaseLayout`, logo abaixo da régua do cabeçalho), com o mesmo recuo
(`px-margem`) e `pt-4`; na Home, primeira linha sob a régua (`regua-entrada`), na largura toda da
grade. **Home e Sobre não podem ganhar rolagem vertical a 1440×800 nem a 1366×650** (§4 da
identidade): se o aviso quebrar isso, pare e reporte — não mude layout para caber.

**Páginas finas:** `src/pages/en/index.astro` → `<HomeView lang="en" />`; `src/pages/en/about.astro` →
`<AboutView lang="en" />`. Cabeçalho §10.1 completo.

**`tests/dist/site-gerado.test.ts` (461 linhas) — o que quebra com a primeira rota EN e tem de mudar
aqui:**
- 184–201: afirma `<html lang="pt-BR">` em **todo** `.html` → passa a exigir `HTML_LANG[localeFromPath(rota)]`
  (`lang="en"` sob `dist/en/`).
- 376–387 e 441–449: procuram `<nav aria-label="Navegação principal"` → o rótulo vem de
  `strings(localeFromPath(rota)).site.mainNavLabel`.
- 425–435: pula só `dist/index.html` como Home → pular também `dist/en/index.html`.
- 100–114 (rotas fixas): acrescentar `en/index.html` e `en/about/index.html`.
- 409–423 (contato da Home igual ao da Sobre): acrescentar o par EN.
- Novo: em `dist/en/index.html` e `dist/en/about/index.html`, o texto de `en.fallback.notice` aparece
  **no máximo uma vez** dentro do `<main>` (`grep -o`-equivalente), e em nenhuma rota PT.
A lógica de rota → idioma usa `localeFromPath` de `src/lib/routes.ts` (o teste já importa de `src/lib`).

**`docs/identidade-visual.md`:** acrescente em §5 uma subseção "Aviso de idioma (F-07)" (o quê, onde,
estilo, quando aparece, que o `lang="pt-BR"` do elemento é independente do aviso), e no começo do §6
um parágrafo "Rotas em inglês": `/en/…` repetem o layout da rota PT; texto de interface do `en.ts`;
conteúdo campo a campo com fallback; data como "March 15, 2026". `docs/` está no `format:check`.

**Regras de código:** README da fase 4. Cite **F-07** no aviso, **RN-06** no fallback, **RF-28** na
rota EN.

## Passos

1. Retrato "antes": `npm run build:pipeline`; `node scripts/comparar-dist.mjs retrato <scratch>\antes.json` → verify: fim do build colado.
2. `LangText.astro`, `FallbackNotice.astro` e o `localize` nas duas views → verify: `npx astro check` colado.
3. Páginas finas EN; remover `src/pages/en/.gitkeep` → verify: `npm run build:pipeline` colado, com `/en/index.html` e `/en/about/index.html` na lista de rotas geradas.
4. PT idêntico → verify: `retrato <scratch>\depois.json`; `comparar antes.json depois.json --ignorar '^en/'` colado — toda rota PT `IGUAL`, as EN `SÓ DEPOIS`/`IGNORADA`, exit 0.
5. HTML EN com o conteúdo real → verify: cole, escopado ao `<main>` de cada uma (`grep -o … | wc -l`): contagem de `lang="pt-BR"`, contagem do texto do aviso (esperado 1 nas duas), `<html lang="en"`, e o `<title>`.
6. Canários **em `content/perfil/index.md`** (autorizado): (a) **Home toda traduzida** — preencha `en.cargo`, `en.instituicao`, `en.departamento`, `en.resumo_home`, `en` de todos os itens de `formacao` e de `areas` → build → no `<main>` de `dist/en/index.html`: zero `lang="pt-BR"` e zero aviso; (b) **tradução parcial** — só `formacao[0].en.grau` → o grau sai em inglês sem `lang`, o curso do mesmo item sai com `lang="pt-BR"` e o aviso aparece uma vez; (c) **Sobre com todo campo "T" traduzido** — além do (a), preencha `en.bio` e `en.cargo` de todos os itens de `atuacao` → build → no `<main>` de `dist/en/about/index.html`: **zero** aviso e contagem de `lang="pt-BR"` igual ao número de campos "P" exibidos (instituições de formação e atuação, e `periodo`) — prova de que campo "P" marca o idioma sem ligar o aviso (Decisão 13); (d) com o conteúdo do (c) ainda aplicado, troque **temporariamente** o `portugueseOnly` da `instituicao` da formação por `localize(instituicao, undefined, lang)` na `AboutView` → build → o aviso aparece (1) — desfaça a troca; reverter com `git checkout -- content/perfil/index.md`; rebuild → verify: saídas de (a) a (d), `git status --short` sem `content/` e `git diff -- content/` vazio colados.
7. `tests/dist/site-gerado.test.ts` atualizado → verify: `npm run test:dist` colado (depois do rebuild do passo 6).
8. Portão → verify: `npm run lint`, `npm run format:check`, `npm run test:coverage` colados.
9. **Orquestrador — navegador:** `/en/` e `/en/about/` a 360/768/1440 — `[scrollWidth, clientWidth]`; a 1440×800 e 1366×650, `[scrollHeight, clientHeight]` do documento iguais (sem rolagem vertical); aviso visível uma vez, abaixo da régua; `document.querySelectorAll('main [lang="pt-BR"]').length` transcrito; transição entre `/en/` e `/en/about/`; interface toda em inglês (listar qualquer texto em português **fora** de elemento `lang="pt-BR"` — esperado nenhum).

## Critérios de aceitação

- [ ] `/en/` e `/en/about/` gerados com `<html lang="en">` e interface do `en.ts`
- [ ] Campo traduzido sai em inglês sem `lang`; campo sem tradução sai em português com `lang="pt-BR"` (conteúdo real e canário (b))
- [ ] Aviso aparece uma vez quando algo caiu no PT e **não aparece** com a Home toda traduzida (canário (a))
- [ ] Campos "P" (instituições e `periodo`) com `lang="pt-BR"` em `/en` e **sem** ligar o aviso (Decisão 13; canários (c) e (d))
- [ ] Rotas PT idênticas (comparador com `--ignorar '^en/'`)
- [ ] `tests/dist/site-gerado.test.ts` com `lang` por árvore, rótulo de navegação por idioma, Home EN, rotas EN e o aviso
- [ ] `docs/identidade-visual.md` descreve o aviso e as rotas `/en`
- [ ] Navegador: sem rolagem horizontal; Home e Sobre sem rolagem vertical nas duas alturas; aviso único (orquestrador)
- [ ] `astro check`, `lint`, `format:check`, `test:coverage`, `build:pipeline`, `test:dist` verdes, com saída colada

## Evidência

<Preenchido pelo executor ao concluir: saídas literais coladas, por passo; o passo 9 é do orquestrador. Plano sem esta seção preenchida não é DONE.>
