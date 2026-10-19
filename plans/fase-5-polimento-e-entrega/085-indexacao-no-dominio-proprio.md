# Plano 085 — 🧑 Indexação no domínio próprio, HSTS e "Always Use HTTPS" (RF-30, Decisão 5, item 8)

**Status:** TODO — **BLOQUEADO pela Q-05** (domínio próprio) e por decisões ainda não sabatinadas (abaixo)
**RFs cobertos:** **RF-30** (`robots.txt` e sitemap definitivos); A-07; sabatina "Lacunas da auditoria de qualidade", Decisão 5, item 8; §12 fase 5, item "Indexação no domínio próprio" (fecha)
**Depende de:** **Q-05** respondida; a migração do domínio (passos 1–4 do roteiro do item 5 do README desta fase, que vira plano próprio com sabatina curta); plano **075** (obrigatório: sem o bloco `/admin/*`, tirar o `noindex` global expõe o painel); recomendados antes: 076–084
**Modelo recomendado:** — (sem executor de código)
**Agente recomendado:** nenhum
**Executável por:** orquestrador + **stakeholder** (painel da Cloudflare e Search Console)
**PRD:** `S:\Projetos\academic_page\haroldo\PRD.md`
**Projeto:** `S:\Projetos\academic_page\haroldo`

## Objetivo

Com o site no domínio próprio, ele passa a ser indexável: sai o bloqueio provisório, o
`robots.txt` aponta o sitemap, o domínio é cadastrado no Search Console, e a zona ganha HSTS e
"Always Use HTTPS". Antes de abrir, o plano **verifica** (não implementa) que nenhum conteúdo de
exemplo está publicado.

## Arquivos afetados

- `public/robots.txt` — sai `Disallow: /`; a linha `Sitemap` volta, com o domínio novo; **sem** `Disallow: /admin/` (Decisão 8)
- `public/_headers` — sai **só** a linha `X-Robots-Tag: noindex` do `/*`; o `/admin/*` (075) e os cabeçalhos do 082 ficam; HSTS aqui ou na zona, conforme a decisão pendente
- `tests/dist/site-gerado.test.ts` — asserções do novo estado (robots com `Sitemap`, `/*` sem `X-Robots-Tag`, `/admin/*` com ele)
- `wrangler.toml` — só se a decisão sobre o `*.workers.dev` for desligá-lo (`workers_dev = false`)

> Painel da Cloudflare (zona: HSTS, "Always Use HTTPS") e Search Console são passos do stakeholder,
> com o orquestrador transcrevendo o que a interface mostrou, com data e hora.

## Contexto necessário

**Decisão 5, item 8:** os passos 5 e 6 do roteiro do item 5 de
`plans/fase-5-polimento-e-entrega/README.md`, mais HSTS e "Always Use HTTPS". Bloqueado pela Q-05.
Pré-condição: nenhum conteúdo de exemplo publicado (L-9), **verificada, não implementada**: trocar o
conteúdo é trabalho do professor.

**Roteiro, passos 5 e 6** (README desta fase, item 5):
- 5. Indexação: tirar `Disallow: /` do `public/robots.txt` e o `X-Robots-Tag: noindex` do
  `public/_headers`, reativar a linha `Sitemap` (RF-30); cadastrar no Search Console.
- 6. `*.workers.dev`: Worker só de assets não redireciona; desligar (`workers_dev = false`, conferir
  antes o efeito nas prévias da `design`) ou mantê-lo com `noindex`.

Desde os planos 075 e 082, "tirar o `X-Robots-Tag`" é tirar **a linha** do `/*`, não o bloco.

**Decisões pendentes — sem elas este plano não roda** (vão para a sabatina curta da migração; não se
decidem aqui):
1. `www` ou raiz como canônico (roteiro, "Decisões a sabatinar").
2. Destino do `*.workers.dev`: desligar ou manter com `noindex` (passo 6). Se mantido, o `noindex` dele
   precisa de um mecanismo que não alcance o domínio próprio — o `_headers` vale para os dois
   hostnames do mesmo Worker. Hoje não há desenho para isso.
3. HSTS: valor de `max-age`, `includeSubDomains` e `preload`, e se vai pela zona (painel) ou pelo
   `_headers`. A Decisão 9 não fixou esses valores.

**Pré-condição L-9** (`docs/sabatinas/CHANGELOG_sabatina_auditoria-qualidade.md`, tabela de lacunas;
PRD §12): sem item `[EXEMPLO]` no sitemap e sem imagem `extensao-exemplo-*.jpg` em página. Medido em
2026-10-12: três `content/extensao/*exemplo*` (dois no sitemap); `extensao-exemplo-*.jpg` ilustrando
linhas de Pesquisa e capa de Ensino; links `https://exemplo.invalid` em `dist/ensino/index.html`,
`dist/ensino/relatividade-geral/` e nos pares EN. Duas armadilhas medidas no fatiamento:
- **O critério do PRD é mais estreito que a Decisão.** "Nenhum conteúdo de exemplo publicado" também
  pega o marcador `[CONTEÚDO DE EXEMPLO]` (em `content/disciplinas/`, `content/linhas-pesquisa/` e
  `content/projetos/`) e os links `exemplo.invalid`. A verificação abaixo procura os quatro e relata
  todos; o critério do §12 é o dos dois primeiros.
- **Uma das imagens está no código, não no conteúdo:** `src/views/ResearchView.astro:100` fixa
  `OTHERS_IMAGE = '/uploads/extensao-exemplo-4.jpg'` para "Outros projetos" (sabatina "Pesquisa modelo
  C", Decisão 10: "não há campo no painel para ela"). O professor não consegue trocá-la pelo painel.
  Enquanto houver projeto sem linha, a pré-condição reprova em `/pesquisa/` por causa do código. A
  saída (outra imagem fixa, ou outro nome de arquivo) é decisão de produto pendente.

**Verificação** (comandos do orquestrador, sobre o build da `main` e sobre a produção):
`grep -o '\[EXEMPLO\][^<]*' dist/**/*.html`, `grep -o 'extensao-exemplo-[0-9]*\.jpg' dist/**/*.html`,
`grep -o 'CONTEÚDO DE EXEMPLO' dist/**/*.html` e `grep -o 'exemplo\.invalid[^"]*' dist/**/*.html`,
cada um com `| sort | uniq -c`, e os `<loc>` do sitemap cujas páginas têm `[EXEMPLO]` no `<title>`.

**Armadilha de prévia:** com `Disallow: /` o robô do X/Twitter não lê a página; a prévia de
compartilhamento do Open Graph (078) só se confere de verdade depois deste plano.

## Passos

1. Pré-condição L-9 → verify: os quatro `grep` colados; resultado zero nos dois do critério, ou o plano para aqui com a lista entregue ao professor.
2. Decisões pendentes 1–3 registradas na sabatina da migração → verify: link para o changelog.
3. `robots.txt`, `_headers` (e `wrangler.toml`, se for o caso) e o teste de `dist` → verify: `git diff` e `npm run build:pipeline`/`npm run test:dist` colados; `dist/robots.txt` sem `Disallow: /` e sem `Disallow: /admin`.
4. Depois do push: `curl.exe -sI` em `/`, `/sobre/` (sem `x-robots-tag`) e `/admin/index.html` (com `x-robots-tag: noindex`) no domínio novo; `curl.exe -s /robots.txt` → verify: saídas coladas.
5. Zona (stakeholder): "Always Use HTTPS" ligado e HSTS com os valores da decisão 3 → verify: `curl.exe -sI http://<domínio>/` (redireciona para `https://`) e `curl.exe -sI https://<domínio>/` com `strict-transport-security`, colados; o que o painel mostrou transcrito.
6. Search Console (stakeholder): propriedade do domínio verificada e `sitemap-index.xml` enviado → verify: estado transcrito com data e hora.
7. Prévia de compartilhamento numa rota (validador do X ou do LinkedIn) → verify: resultado transcrito.

## Critérios de aceitação

- [ ] Pré-condição L-9 verificada: sem `[EXEMPLO]` no sitemap e sem `extensao-exemplo-*.jpg` em página (os dois outros achados relatados)
- [ ] Decisões pendentes 1–3 tomadas em sabatina
- [ ] `robots.txt` com `Sitemap` e sem `Disallow`; `/*` sem `X-Robots-Tag`; `/admin/*` com ele (teste e `curl`)
- [ ] "Always Use HTTPS" e HSTS ativos no domínio próprio (`curl`)
- [ ] Search Console com o sitemap enviado
- [ ] Prévia de compartilhamento conferida

## Evidência

<Preenchida pelo orquestrador, com a saída real dos comandos e a transcrição do que cada painel
mostrou, com data e hora. Plano sem esta seção preenchida não é DONE.>
