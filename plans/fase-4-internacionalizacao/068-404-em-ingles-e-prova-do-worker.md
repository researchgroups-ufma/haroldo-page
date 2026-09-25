# Plano 068 — 404 em inglês e a prova do Worker (RF-27, Decisão 9)

**Status:** TODO
**RFs cobertos:** **RF-27**, RNF-03, D-01; sabatina fase 4, Decisões 6 e 9; §12 fase 4, item 5 (fecha, com 065–067)
**Depende de:** planos 065 (árvore `/en`, testes de `dist` por idioma), 062 (`NotFoundView`)
**Modelo recomendado:** sonnet
**Agente recomendado:** implementer
**Executável por:** agente (código e prova local) + **orquestrador** (prova em produção, depois do push)
**PRD:** `S:\Projetos\academic_page\haroldo\PRD.md`
**Projeto:** `S:\Projetos\academic_page\haroldo`

## Objetivo

O build gera `dist/en/404.html`, a 404 em inglês, e fica **provado por artefato** — no `wrangler dev`
e em produção — que `/en/<inexistente>` responde `404` com esse corpo e que `/<inexistente>` continua
respondendo `404` com o `dist/404.html`. Se a prova refutar a premissa, o plano **para** e devolve a
questão ao stakeholder.

## Arquivos afetados

- `src/pages/en/404.astro` — novo (página fina: `<NotFoundView lang="en" />`)
- `astro.config.mjs` — **só se** o passo 2 mostrar `dist/en/404/index.html` (tática pré-autorizada, abaixo)
- `tests/dist/site-gerado.test.ts` — `dist/en/404.html` nas rotas fixas

> O executor não toca em arquivo fora desta lista. Se precisar, para e reporta. `Status:` fica `TODO`.
> Não commite. **Não** altere `wrangler.toml` — o que se prova é a configuração existente. **Não** rode
> `npm run deploy` nem `wrangler deploy` (publicaria o disco local em produção).

## Contexto necessário

**Decisão 9** (`docs/sabatinas/CHANGELOG_sabatina_fase-4-i18n.md`): "gerar `dist/en/404.html`… O modo
`404-page` serve o `404.html` mais próximo na árvore de pastas, então `/en/<inexistente>` deve receber
a 404 em inglês sem código no Worker. **Isso é premissa, não fato verificado:** o plano tem de provar
por artefato, no `wrangler dev` e em produção, que `/en/<inexistente>` responde `404` com corpo igual
ao `dist/en/404.html` e que `/<inexistente>` continua com o `dist/404.html`, como o plano 051 fez. Se
a prova refutar a premissa, o plano cai numa 404 bilíngue única e volta ao stakeholder para emendar o
RF-27."

**Ramo de saída, explícito:** se o `wrangler dev` **ou** a produção servirem para `/en/<inexistente>`
qualquer coisa que não seja `404` com o corpo de `dist/en/404.html` (ex.: o `dist/404.html` em
português, ou corpo vazio), **pare**, registre a saída na Evidência e devolva ao orquestrador. **Não**
implemente 404 bilíngue, lógica no Worker nem redirecionamento — isso é emenda do RF-27, decisão do
stakeholder.

**Configuração atual** (`wrangler.toml:13-18`): `[assets] directory = "./dist"`,
`not_found_handling = "404-page"`. Não declara `html_handling` (default `auto-trailing-slash`).

**Nome do arquivo gerado — confira antes de tudo.** `src/pages/404.astro` sai como `dist/404.html`
porque o Astro trata `/404` como página de status. É provável que `/en/404` **não** tenha esse
tratamento e saia como `dist/en/404/index.html` — confirme no build e leia o trecho do Astro que decide
o nome (procure `404` em `node_modules/astro/dist/core/util.js` ou `…/build/…`; cole o trecho). Se sair
`dist/en/404/index.html`, a **tática pré-autorizada** (decisão de fatiamento 14 do README da fase) é
uma integração inline em `astro.config.mjs` com o gancho `astro:build:done` que move
`<dist>/en/404/index.html` para `<dist>/en/404.html` e remove a pasta vazia — build estático, sem
código no Worker (D-01). Comentário com o porquê, e o cabeçalho §10.1 do `astro.config.mjs`
atualizado. Qualquer outra saída (mudar `build.format`, `trailingSlash`) **não** está autorizada: pare
e reporte.

**Caminho sem par:** `counterpartPath('/en/404')` → `'/'` (056); a 404 EN não tem `canonical` nem
`hreflang` (decisão de fatiamento 9; o 070 implementa). A lista "All pages" vem de `navItems('en')`
(062), "Home" primeiro. Nenhum `<script>` no `<main>` (051). Nenhum aviso: a 404 não exibe conteúdo.

**Prova local** (padrão do 051, PowerShell 5.1, sem `&&`):

```powershell
npx wrangler dev   # http://localhost:8787 ; encerrar com Ctrl+C ou taskkill /T /F, porta conferida livre
curl.exe -s -o NUL -w "%{http_code}`n" http://localhost:8787/en/rota-que-nao-existe
curl.exe -s http://localhost:8787/en/rota-que-nao-existe -o <scratch>\en404.html ; Get-FileHash <scratch>\en404.html ; Get-FileHash dist\en\404.html
curl.exe -s -o NUL -w "%{http_code}`n" http://localhost:8787/rota-que-nao-existe
curl.exe -s http://localhost:8787/rota-que-nao-existe -o <scratch>\pt404.html ; Get-FileHash <scratch>\pt404.html ; Get-FileHash dist\404.html
curl.exe -s -o NUL -w "%{http_code}`n" http://localhost:8787/en/about/
```

Esperado: `404`, hashes iguais (EN); `404`, hashes iguais (PT); `200`.

**Canário da prova:** renomeie `dist/en/404.html` para `dist/en/404.bak`, reinicie o `wrangler dev` e
mostre o que `/en/rota-que-nao-existe` recebe (o esperado é o `dist/404.html` em português — o "mais
próximo" subindo a árvore); restaure e confira o hash.

**Prova em produção (orquestrador, depois do push e do check `Workers Builds: haroldo-page`
`success`):** os mesmos `curl.exe -sSi` contra `https://haroldo-page.and-near.workers.dev`, com
SHA-256 do corpo comparado ao `dist/en/404.html` e ao `dist/404.html` do build revisado; data, horário,
SHA do commit e id da versão. **Nenhum outro push na janela.** Linha de base antes do push: o que
`/en/rota-que-nao-existe` responde hoje (esperado: `404` com o `dist/404.html` em português).

**Testes de `dist`:** `en/404.html` nas rotas fixas; o `lang="en"`, o `<h1>` único e o vt-nome/vt-menu
já valem para ele pelos testes gerais.

**Regras de código:** README da fase 4. Cite **RF-27**.

## Passos

1. Página fina `src/pages/en/404.astro` → verify: `npx astro check` colado.
2. Build → verify: `npm run build:pipeline` colado; `ls dist/en` colado; trecho do Astro que decide o nome do arquivo colado. Se `dist/en/404/index.html`: aplicar a tática pré-autorizada, rebuild, e colar `ls dist/en` com `404.html` e sem a pasta `404`.
3. Prova local → verify: as saídas dos `curl.exe` e `Get-FileHash` do Contexto coladas; servidor encerrado e porta 8787 livre.
4. Canário da prova → verify: saídas coladas; hash de `dist/en/404.html` igual antes e depois.
5. Testes de `dist` → verify: `npm run test:dist` colado.
6. Portão → verify: `npm run lint`, `npm run format:check`, `npm run test:coverage` colados.
7. **Orquestrador — navegador** em `http://localhost:8787/en/rota-que-nao-existe` a 360/768/1440: `[scrollWidth, clientWidth]`, lista "All pages" com as cinco rotas EN, texto em inglês.
8. **Orquestrador — produção** (Contexto) → verify: linha de base, checks do commit e as respostas com SHA-256 coladas.

## Critérios de aceitação

- [ ] `dist/en/404.html` gerado (diretamente ou pela tática pré-autorizada, com o trecho do Astro colado)
- [ ] Local: `/en/<inexistente>` → `404` com corpo igual a `dist/en/404.html`; `/<inexistente>` → `404` com corpo igual a `dist/404.html`; `/en/about/` → `200`
- [ ] Canário: sem `dist/en/404.html`, `/en/<inexistente>` cai no que o Worker achar mais próximo (saída colada)
- [ ] Produção: as mesmas duas respostas, com SHA-256, data, commit e versão (orquestrador)
- [ ] Se a premissa cair: plano parado e devolvido, sem 404 bilíngue improvisada
- [ ] `astro check`, `lint`, `format:check`, `test:coverage`, `build:pipeline`, `test:dist` verdes, com saída colada

## Evidência

<Preenchido pelo executor ao concluir: saídas literais coladas, por passo; os passos 7 e 8 são do orquestrador. Plano sem esta seção preenchida não é DONE.>
