# Plano 012 — Roteiro humano: conta Cloudflare, Worker criado e primeiro deploy

**Status:** TODO
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

- [ ] Conta Cloudflare gratuita ativa e `npx wrangler whoami` identificando-a
- [ ] Worker `haroldo-page` criado pelo primeiro `wrangler deploy`
- [ ] **Verificação objetiva:** a URL `https://haroldo-page.<subdominio>.workers.dev`
      responde **200** com a página placeholder estilizada, e uma rota inexistente responde
      **404**
- [ ] O Worker serve assets estáticos, sem código de runtime (D-01 validada na prática)
- [ ] URL exata do Worker registrada na Evidência
- [ ] Workers Builds **não** foi conectado ao GitHub (é fase 2)
- [ ] Nenhuma variável de ambiente nem segredo configurado no painel da Cloudflare
- [ ] Custo permanece US$ 0,00 (RNF-14)
- [ ] Cotas do plano gratuito conferem com Q-03/A-03 (3.000 min/mês, 1 build simultâneo,
      20 min por build) — ou divergência reportada

## Evidência

<Preenchido por quem executou: saída completa de `npm run deploy`, `npx wrangler whoami`,
URL exata do Worker, código HTTP da raiz e de uma rota inexistente, descrição do que o
painel Workers & Pages mostra sobre o Worker, e confirmação do plano gratuito.>
