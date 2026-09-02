# Plano 012 — Roteiro humano: conta Cloudflare, Worker criado e primeiro deploy

**Status:** DONE
**RFs cobertos:** — (Fase 0, item 5 do checklist §12; valida D-01, RNF-03, RNF-14)
**Depende de:** planos 007 e 009
**Modelo recomendado:** — (execução humana; um agente sonnet pode assistir nos passos 1 e 7)
**Agente recomendado:** nenhum — **este plano é executado por uma pessoa, com login no navegador**
**PRD:** `S:\Projetos\academic_page\haroldo\PRD.md`
**Projeto:** `S:\Projetos\academic_page\haroldo`

> ⚠️ **Plano de provisionamento.** Envolve conta de terceiro (Cloudflare) e um `wrangler
> login` que abre o navegador para autorização. Um agente **não** executa este plano
> sozinho. Todo passo marcado 🧑 é humano.

## Objetivo

Existe um Worker chamado `haroldo-page` na conta Cloudflare do desenvolvedor, servindo o
`dist/` como assets estáticos, e a URL `https://haroldo-page.<subdominio>.workers.dev`
responde com a página placeholder do projeto. Isso fecha o último item de provisionamento da
fase 0 e **prova empiricamente a decisão D-01** — site estático publicado sem adapter e sem
SSR.

## Arquivos afetados

- Nenhum arquivo do projeto é modificado por este plano.
- `.env` **local, não versionado** — atualizar `PUBLIC_SITE_URL` com a URL real do Worker,
  se ela diferir do valor provisório.

> Se a URL real do Worker divergir de `https://haroldo-page.workers.dev` (o default usado em
> `astro.config.mjs` e `src/lib/config.ts`), **não edite o código aqui**: registre a
> divergência na Evidência e deixe o ajuste para o plano 013.

## Contexto necessário

**Projeto.** `haroldo-page` — site pessoal acadêmico do Prof. Haroldo C. D. Lima Junior
(UFMA). Astro 5 com `output: 'static'`; build em `dist/`; `wrangler.toml` já versionado
(plano 007) com:

```toml
name = "haroldo-page"
compatibility_date = "2026-09-01"

[assets]
directory = "./dist"
not_found_handling = "404-page"
```

**D-01 do PRD, que este plano valida na prática:**

> Astro estático (`output: 'static'`), sem adapter e sem SSR. Assets estáticos são
> ilimitados no plano gratuito e não executam código por requisição.

E a §7.1: *"Nenhuma rota pública executa código em requisição. (…) Isso mantém as
requisições fora da cota de 100 mil/dia do plano gratuito e elimina uma classe inteira de
falhas em produção."* Consequência verificável: o `wrangler.toml` **não tem `main`**, e o
Worker publicado deve aparecer no painel como servindo apenas assets.

**Decisões já fechadas:**

| Item | Valor | Origem |
|---|---|---|
| Nome do Worker | `haroldo-page` | `wrangler.toml`, plano 007; define o subdomínio |
| Plano Cloudflare | **Free** | §7.2, RNF-14: custo US$ 0,00/mês |
| Dono da conta | desenvolvedor (`and.near@hotmail.com`) | §4.2 |
| Domínio próprio | **não haverá no MVP** | premissa A-07; Q-05 em aberto, bloqueia a **fase 5**, não esta |

**Cotas já verificadas (Q-03 resolvida em 2026-09-01, A-03 confirmada), para conferência ao
olhar o painel:** Workers Builds no plano gratuito oferece **3.000 minutos de build/mês**,
**1 build simultâneo** e teto de **20 min por build**
(`https://developers.cloudflare.com/workers/ci-cd/builds/limits-and-pricing/`). Se o painel
mostrar números diferentes hoje, **reporte** — o PRD (§7.4, A-03, R-06, R-12) depende desses
valores.

**O que este plano NÃO faz:**

- ⛔ **Não conecte o Workers Builds ao repositório GitHub.** O deploy automático a cada push
  é o primeiro item da **fase 2** (§6.2). Aqui o deploy é **manual**, via `npm run deploy`.
  Conectar agora antecipa fase e mistura os critérios de conclusão.
- ⛔ **Não configure variáveis de ambiente no painel da Cloudflare** (`TINA_TOKEN` etc.):
  fase 2.
- ⛔ **Não configure domínio próprio, DNS ou certificado:** Q-05 em aberto (fase 5).
- ⛔ **Não instale `@astrojs/cloudflare`** nem altere `astro.config.mjs` (D-01).

**Como o Worker é criado.** Não é preciso criá-lo pelo painel antes: o primeiro
`wrangler deploy` cria o Worker com o `name` do `wrangler.toml`. O que exige ação humana é o
`wrangler login` (autorização OAuth no navegador) e, antes dele, a existência da conta
Cloudflare.

**Subdomínio `workers.dev`.** Na primeira publicação, a Cloudflare pede que a conta escolha
um subdomínio (ex.: `<algo>.workers.dev`). A URL final fica
`https://haroldo-page.<algo>.workers.dev`. Se `workers.dev` estiver desabilitado para a
conta, habilite em *Workers & Pages → Settings*. **Anote a URL exata** — ela é o valor real
de `PUBLIC_SITE_URL` e do `site` do Astro até que exista domínio próprio.

**Ambiente.** Windows 11 / PowerShell, a partir de `S:\Projetos\academic_page\haroldo`.

## Passos

1. 🤖/🧑 Garantir build atualizado: `npm ci` e `npm run build`.
   → verify: `dist/index.html` existe e contém o `<h1>` da página placeholder.
2. 🧑 Ter (ou criar) uma conta Cloudflare **gratuita** em `https://dash.cloudflare.com`,
   com e-mail verificado.
   → verify: o painel abre e a seção *Workers & Pages* está acessível.
3. 🧑 Autenticar o Wrangler: `npx wrangler login` (abre o navegador para autorização).
   → verify: `npx wrangler whoami` mostra a conta correta.
4. 🧑 Se a conta ainda não tiver subdomínio `workers.dev`, escolher um em
   *Workers & Pages → Settings*.
   → verify: o subdomínio aparece no painel.
5. 🧑 Publicar: `npm run deploy` (roda `astro build` e `wrangler deploy`).
   → verify: a saída do Wrangler informa a quantidade de assets enviados e imprime a URL do
   Worker. Cole a saída na Evidência.
6. 🧑 **Verificação objetiva principal:** abrir a URL impressa no navegador.
   → verify: a página placeholder carrega, estilizada (Tailwind aplicado), com o nome do
   professor no `<h1>`. Em seguida, acessar uma URL inexistente (ex.: `/nao-existe`) e
   confirmar que a resposta é **404** — sinal de que `not_found_handling` está ativo.
7. 🧑 No painel *Workers & Pages*, abrir o Worker `haroldo-page` e conferir que ele consta
   como servindo **assets estáticos**, sem código de runtime associado (D-01).
   → verify: descreva na Evidência o que o painel mostra.
8. 🧑 Anotar a URL exata e atualizar `PUBLIC_SITE_URL` no `.env` **local** se ela divergir de
   `https://haroldo-page.workers.dev`. **Não** commite o `.env`; registre a divergência para
   o plano 013 ajustar `astro.config.mjs` e `src/lib/config.ts`.
   → verify: `git status --short` limpo.
9. 🧑 Conferir no painel de faturamento que a conta permanece no plano gratuito, com custo
   US$ 0,00 (RNF-14, M-06).
   → verify: registre o que o painel mostra.

## Critérios de aceitação

- [x] Conta Cloudflare gratuita ativa e `npx wrangler whoami` identificando-a
- [x] Worker `haroldo-page` criado pelo primeiro `wrangler deploy`
- [x] **Verificação objetiva:** a URL `https://haroldo-page.<subdominio>.workers.dev`
      responde **200** com a página placeholder estilizada, e uma rota inexistente responde
      **404**
- [x] O Worker serve assets estáticos, sem código de runtime (D-01 validada na prática)
- [x] URL exata do Worker registrada na Evidência
- [x] Workers Builds **não** foi conectado ao GitHub (é fase 2)
- [x] Nenhuma variável de ambiente nem segredo configurado no painel da Cloudflare
- [x] Custo permanece US$ 0,00 (RNF-14)
- [x] Cotas do plano gratuito conferem com Q-03/A-03 (3.000 min/mês, 1 build simultâneo,
      20 min por build) — ou divergência reportada

## Evidência

Executado por: usuário (conta, `wrangler login` e `npm run deploy`), em 2026-09-01.
Verificação independente por CLI e HTTP: sessão de orquestração, 2026-09-01.

### URL real do Worker

```
https://haroldo-page.and-near.workers.dev
```

**Divergiu** do provisório `https://haroldo-page.workers.dev` usado nos planos 002 e 006 — o
subdomínio da conta é `and-near`. Conforme a instrução deste plano, **nenhum arquivo
versionado foi alterado aqui**; o ajuste de `astro.config.mjs`, `src/lib/config.ts` e da linha
comentada do `Sitemap` em `public/robots.txt` é do **plano 013**. O `.env` local já recebeu
`PUBLIC_SITE_URL=https://haroldo-page.and-near.workers.dev` (sem barra final, como exige
`tests/lib/config.test.ts`).

### Conta autenticada

```
$ npx wrangler whoami
 ⛅️ wrangler 4.128.0
👋 You are logged in with an OAuth Token, associated with the email and.near@hotmail.com.
┌────────────────────────────────┬──────────────────────────────────┐
│ Account Name                   │ Account ID                       │
├────────────────────────────────┼──────────────────────────────────┤
│ And.near@hotmail.com's Account │ 98e35087677f329c2adbf68711ecebbf │
└────────────────────────────────┴──────────────────────────────────┘
```

### `npm run deploy`

```
> haroldo-page@0.1.0 deploy
> npm run build && wrangler deploy

> haroldo-page@0.1.0 build
> astro check && astro build

22:26:51 [content] Syncing content
22:26:51 [types] Generated 40ms
22:26:51 [check] Getting diagnostics for Astro files in S:\Projetos\academic_page\haroldo...
eslint.config.js:16:25 - warning ts(6387): The signature '(...configs: InfiniteDepthConfigWithExtends[]): ConfigArray' of 'tseslint.config' is deprecated.

Result (10 files):
- 0 errors
- 0 warnings
- 1 hint

22:26:54 [build] output: "static"
22:26:54 [build] mode: "static"
22:26:54 [build] directory: S:\Projetos\academic_page\haroldo\dist\
22:26:54 [build] Building static entrypoints...
22:26:54 [vite] ✓ built in 417ms
 generating static routes
22:26:54 ▶ src/pages/index.astro
22:26:54   └─ /index.html (+12ms)
22:26:54 [build] 1 page(s) built in 527ms
22:26:54 [build] Complete!

 ⛅️ wrangler 4.128.0
🌀 Building list of assets...
✨ Read 7 files from the assets directory S:\Projetos\academic_page\haroldo\dist
🌀 Starting asset upload...
No updated asset files to upload. Proceeding with deployment...
Total Upload: 0.31 KiB / gzip: 0.22 KiB
Uploaded haroldo-page (9.90 sec)
Deployed haroldo-page triggers (5.15 sec)
  https://haroldo-page.and-near.workers.dev
Current Version ID: 85adc91c-8c40-4414-8e9c-d6daff99e4d7
```

`No updated asset files to upload` porque esta execução é a segunda — o Worker já havia sido
criado. O `1 hint` do `tseslint.config` é a pendência **P-2**, que o plano 013 resolve.

### Implantações e versão no ar

```
$ npx wrangler deployments list
Created:     2026-09-02T00:57:11.312Z
Author:      and.near@hotmail.com
Source:      Upload
Message:     Automatic deployment on upload.
Version(s):  (100%) 5689b7e5-b24d-4d4e-88ee-21115168b4a1

Created:     2026-09-02T01:27:05.690Z
Author:      and.near@hotmail.com
Source:      Unknown (deployment)
Version(s):  (100%) 85adc91c-8c40-4414-8e9c-d6daff99e4d7

$ npx wrangler versions view 85adc91c-8c40-4414-8e9c-d6daff99e4d7
Version ID:  85adc91c-8c40-4414-8e9c-d6daff99e4d7
Created:     2026-09-02T01:27:03.983Z
Author:      and.near@hotmail.com
Source:      Unknown (version_upload)
Compatibility Date:  2026-09-01
```

Horários em UTC; `00:57Z` e `01:27Z` correspondem a 21:57 e 22:27 de 2026-09-01 no horário
local. A primeira implantação é a que criou o Worker. Ambas têm `Source: Upload` — nenhuma
veio de build disparado por push.

### Verificação objetiva HTTP

```
$ curl.exe -s -o /dev/null -w 'raiz: %{http_code}\n' https://haroldo-page.and-near.workers.dev/
raiz: 200
$ curl.exe -s -o /dev/null -w '404:  %{http_code}\n' https://haroldo-page.and-near.workers.dev/nao-existe
404:  404

$ curl.exe -s https://haroldo-page.and-near.workers.dev/ | grep -o "<h1[^>]*>[^<]*</h1>"
<h1 class="text-3xl font-semibold">Prof. Haroldo C. D. Lima Junior</h1>

$ curl.exe -sI https://haroldo-page.and-near.workers.dev/
HTTP/1.1 200 OK
Content-Type: text/html
CF-Cache-Status: HIT
Cache-Control: public, max-age=0, must-revalidate
x-robots-tag: noindex
Server: cloudflare
```

O `<h1>` prova que a página servida é a placeholder do projeto, com Tailwind aplicado
(`text-3xl font-semibold`). O `x-robots-tag: noindex` fecha a pendência que o
`plans/README.md` havia registrado para este plano: o `public/_headers` chega mesmo à
resposta HTTP.

### D-01 validada na prática

Base da afirmação, em ordem de força:

1. `wrangler.toml` **não tem `main`** (arquivo versionado, plano 007)
2. `astro build` reporta `output: "static"` e `mode: "static"`
3. o wrangler leu **7 arquivos do diretório de assets** e não empacotou módulo de entrada
4. não existe código de runtime no repositório para ser executado
5. `wrangler versions view` não lista bindings nem entrypoint — **corroboração, não prova**:
   ausência de campo na saída não é o mesmo que ausência de código

### Confirmações de painel (reportadas pelo usuário)

- Custo **US$ 0,00**, conta no plano **gratuito** (RNF-14, M-06).
- Cotas do Workers Builds conferem com Q-03/A-03: **3.000 min/mês**, **1 build simultâneo**,
  **20 min por build**. Nenhuma divergência a reportar ao PRD.
- **Workers Builds não conectado ao repositório** — o deploy automático a cada push é fase 2.
- **Nenhuma variável de ambiente nem segredo** configurado no Worker.

### O que NÃO foi verificado

- **`not_found_handling = "404-page"` não é distinguível de `none` hoje.** Não existe
  `src/pages/404.astro`, então o build não gera `dist/404.html` e a Cloudflare devolve um 404
  de corpo vazio — exatamente o que o default `none` devolveria. O **status 404 está
  confirmado** e o critério de aceitação se satisfaz; o que não se pode afirmar é a inferência
  do passo 6 de que a chave está ativa. A página 404 própria é RF-27, de fase posterior, e é
  ela que tornará a chave verificável.
- Descrição textual do painel *Workers & Pages* sobre o Worker: substituída pela evidência de
  CLI acima, mais forte e reproduzível.
