# Plano 051 — Página 404 e a prova do `not_found_handling` (RF-27)

**Status:** TODO
**RFs cobertos:** **RF-27**, RNF-03; quita a dívida da fase 2 "`not_found_handling` ainda não provado"
**Depende de:** planos 037 (dicionário e `NAV_ITEMS`), 042 (layout), 043 (`PageHeader`, `PillButton`)
**Modelo recomendado:** sonnet
**Agente recomendado:** implementer
**Executável por:** agente (código e prova local) + **orquestrador** (prova em produção, depois do push)
**PRD:** `S:\Projetos\academic_page\haroldo\PRD.md`
**Projeto:** `S:\Projetos\academic_page\haroldo`

## Objetivo

O build gera `dist/404.html` com navegação de volta, e fica **provado por artefato** — localmente e
em produção — que uma URL inexistente responde status 404 **com essa página no corpo**, o que o
`not_found_handling = "404-page"` do `wrangler.toml` promete desde o plano 007 e nunca pôde mostrar.

## Arquivos afetados

- `src/pages/404.astro` — novo

> O executor não toca em arquivo fora desta lista. Se precisar, para e reporta. **Não** altere
> `wrangler.toml`: o que se prova é a configuração existente.
> `Status:` fica `TODO`. Não commite. **Não** rode `npm run deploy` nem `wrangler deploy` — publicaria
> o disco local em produção.

## Contexto necessário

**A dívida** (README da fase 2, "O que a fase 2 empurra adiante", e Evidência do plano 025): a rota
inexistente respondia 404 com **corpo vazio**, indistinguível do default `none`, porque `dist/` não
tinha `404.html`. Configuração atual, `wrangler.toml:13-18`:

```toml
[assets]
directory = "./dist"
not_found_handling = "404-page"
```

**Especificação:** `docs/identidade-visual.md` §6.7 (404) e §5.3 (pílula sólida). `ref/` não existe
para você.

**Regras herdadas:** "Regras de código que todo plano desta fase herda" em
`plans/fase-3-site-publico/README.md`.

**Composição (§6.7):** `BaseLayout title={pt.notFound.title}`; `PageHeader eyebrow={pt.notFound.eyebrow}
title={pt.notFound.title}`; parágrafo `pt.notFound.body`; `PillButton href="/" variant="solid"
label={pt.notFound.backHome}`; rubrica `<h2>` `pt.notFound.allPages` e lista com réguas dos cinco
`NAV_ITEMS` (`src/lib/navigation.ts`), rótulo `pt.nav[key]` e `›`. **Sem CV** (Decisão 3). **O
caminho digitado não é exibido** (exigiria JS). Nenhum `<script>`.

`src/pages/404.astro` gera `dist/404.html` em Astro estático. Confira no build; se sair
`dist/404/index.html`, **pare e reporte** (o Worker procura `404.html`).

**Por que o cabeçalho do site marca nada como ativo aqui:** `Astro.url.pathname` no build é `/404`,
que `isActivePath` não casa com nenhum item. Não trate.

**Prova local.** `npx wrangler dev` lê `wrangler.toml` e serve `./dist` como o Worker faria
(padrão `http://localhost:8787`). Em PowerShell 5.1 (sem `&&`):

```powershell
curl.exe -s -o NUL -w "%{http_code}`n" http://localhost:8787/rota-que-nao-existe
curl.exe -s http://localhost:8787/rota-que-nao-existe | Select-String -Pattern "Erro 404" -SimpleMatch
curl.exe -s -o NUL -w "%{http_code}`n" http://localhost:8787/sobre/
```

Se a acentuação sair corrompida no `Select-String`, busque o trecho sem acento (`Erro 404`). Encerre o
`wrangler dev` com `Ctrl+C` — não deixe em background.

**Prova em produção (orquestrador, depois do commit deste plano chegar à `main` e o Workers Builds
publicar):** confira o check `Workers Builds: haroldo-page` `success` no commit e então

```powershell
curl.exe -si https://haroldo-page.and-near.workers.dev/rota-que-nao-existe | Select-Object -First 30
```

Esperado: linha de status `HTTP/1.1 404` (ou `HTTP/2 404`) **e** o HTML com "Erro 404" e os cinco
links. Anote data, horário, SHA do commit e id da versão publicada. **Nenhum outro push** na janela
entre o commit e o `curl` (README da fase, tabela de paralelismo).

## Passos

1. `src/pages/404.astro` → verify: `npx astro check` com resumo colado.
2. Build → verify: `npm run build:pipeline` colado; `ls dist/404.html` colado; `grep -o 'href="/[a-z]*/\?"' dist/404.html` colado (cinco rotas + `/` da pílula e do cabeçalho).
3. Prova local com `npx wrangler dev` → verify: as três saídas de `curl.exe` coladas: `404`, a linha com "Erro 404", `200`.
4. Canário da prova: renomeie temporariamente `dist/404.html` para `dist/404.bak`, reinicie `wrangler dev`, cole o `curl.exe` mostrando `404` **sem** "Erro 404" no corpo (é o comportamento que a fase 2 mediu); restaure o nome → verify: saídas coladas e `ls dist/404.html` final.
5. Orquestrador — navegador em `http://localhost:8787/rota-que-nao-existe` (360 e 1440): `[scrollWidth, clientWidth]`, pílula sólida, lista navegável por Tab.
6. Portão → verify: `npm run lint`, `npm run format:check`, `npm run test:coverage` colados.
7. **Orquestrador, na promoção:** prova em produção conforme o Contexto → verify: saída do `curl.exe -si` colada com data, horário, SHA e versão.

## Critérios de aceitação

- [ ] `dist/404.html` gerado, com rubrica "Erro 404", `<h1>` "Página não encontrada", texto, pílula sólida "Voltar ao início" e as cinco rotas (sem CV)
- [ ] Nenhum `<script>` na página e nenhum caminho digitado exibido
- [ ] Local: `wrangler dev` responde `404` com a página no corpo; `/sobre/` responde `200`; canário do passo 4 mostra corpo vazio sem o arquivo
- [ ] Produção: `curl.exe -si` na URL do Worker mostra `404` e a página, com SHA e versão registrados — **quita a dívida da fase 2**
- [ ] Nenhuma string de interface fora de `src/i18n/pt.ts`
- [ ] `astro check`, `lint`, `format:check`, `test:coverage`, `build:pipeline` verdes, com saída colada

## Evidência

<Preenchido pelo executor (1–4, 6) e pelo orquestrador (5, 7). Declare o que NÃO rodou.>
