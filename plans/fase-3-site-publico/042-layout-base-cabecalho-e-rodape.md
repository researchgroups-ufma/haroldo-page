# Plano 042 — Layout base, cabeçalho com menu do celular e rodapé

**Status:** TODO
**RFs cobertos:** item "Layout base, cabeçalho, rodapé e navegação" do §12 da fase 3; RF-26, RNF-02,
RNF-15, §8.3 (HTML semântico, `lang`, foco, "pular para o conteúdo")
**Depende de:** planos 036 (tokens), 037 (dicionário e navegação), 039 (`requireSingleton`)
**Modelo recomendado:** sonnet
**Agente recomendado:** implementer
**Executável por:** agente (código) + **orquestrador** (verificação no navegador)
**PRD:** `S:\Projetos\academic_page\haroldo\PRD.md`
**Projeto:** `S:\Projetos\academic_page\haroldo`

## Objetivo

Existe um layout que toda rota usa: `<html lang="pt-BR">`, `<title>` por página, link "Pular para o
conteúdo", cabeçalho com navegação (menu recolhível no celular, que funciona sem JS) e rodapé com
identificação, contato e perfis acadêmicos vindos do `perfil`.

## Arquivos afetados

- `src/layouts/BaseLayout.astro` — novo
- `src/components/SiteHeader.astro` — novo (inclui o `<script>` do menu)
- `src/components/SiteFooter.astro` — novo
- `src/pages/index.astro` — **só** para envolver o placeholder atual no `BaseLayout` (a Home real é
  do plano 044), permitindo ver o layout no navegador
- `src/layouts/.gitkeep`, `src/components/.gitkeep` — **removidos** com `git rm`

> O executor não toca em arquivo fora desta lista. Se precisar, para e reporta.
> `Status:` fica `TODO`. Não commite. O plano 043 pode estar rodando em paralelo em
> `src/components/` (`PageHeader`, `PillButton`, `Tag`, `ExternalLink`): não edite esses arquivos.

## Contexto necessário

**Especificação:** `docs/identidade-visual.md` §5.1 (Cabeçalho), §5.2 (Rodapé), §4 (Grade) e §7
(foco visível). Leia as quatro. `ref/` não existe para você.

**Regras herdadas:** seção "Regras de código que todo plano desta fase herda" em
`plans/fase-3-site-publico/README.md` (cabeçalho §10.1, TSDoc de props, sem `process.env`, sem
`any`, sem `set:html`, **todo texto de interface vem de `pt` em `src/i18n/pt.ts`** — chave faltando
= para e reporta).

**`BaseLayout.astro`** — props: `title: string` (nome da página; a Home passa `undefined` e o
`<title>` vira só `siteConfig.title`), `description?: string` (default
`siteConfig.description`). Monta `<title>` com `pt.site.pageTitle(title, siteConfig.shortTitle)`,
`<meta name="description">`, `<meta name="viewport" content="width=device-width, initial-scale=1">`,
importa `../styles/global.css`, e o `<body>` com: link "Pular para o conteúdo" (primeiro elemento
focável; visível só com foco — `sr-only focus:not-sr-only`), `<SiteHeader />`, `<main
id="conteudo">` com `<slot />`, `<SiteFooter />`. Canonical, Open Graph e favicon são **fase 5**
(RF-30) — não crie. O `public/_headers` com `noindex` fica como está.

**Dados do perfil.** `BaseLayout` faz `const perfil = requireSingleton(await
getCollection('perfil'), 'perfil')` (de `src/lib/published.ts`, plano 039) e passa `perfil.data`
para header e footer. **Por que não `getEntry`:** ver Contexto do plano 039. Conteúdo real
(`content/perfil/index.md`): tem `departamento`, `email`, `links.lattes` e `links.orcid`; **não**
tem `foto`, `cv_url` nem os outros links.

**`SiteHeader.astro`** (§5.1):
- Nome = `siteConfig.shortTitle` (`src/lib/config.ts:42`, "Haroldo Lima Junior"), link para `/`;
  segunda linha = `departamento` em `text-pequeno text-secundario`, **só se houver** e oculta
  abaixo de `sm` (40rem). Decisão do fatiamento, README da fase, decisão 8 — o esboço da identidade
  mostra um texto que não é campo nenhum.
- Navegação: `<nav aria-label={pt.site.mainNavLabel}>` com `NAV_ITEMS` (`src/lib/navigation.ts`),
  rótulo `pt.nav[item.key]`, `aria-current="page"` e sublinhado de 1 px `--tinta` deslocado 6 px
  (`underline decoration-1 underline-offset-[6px]`) quando `isActivePath(item.href,
  Astro.url.pathname)`. Fonte 15 px (`text-[0.9375rem]`).
- A partir de `lg` (64rem): navegação em linha à direita. Abaixo: botão "Menu" (`<button
  type="button">`, alvo ≥ 44 px, `aria-expanded`, `aria-controls` apontando o `id` da lista) e a
  lista vertical com régua entre itens e `›` à direita.
- **Melhoria progressiva (§1 regra 3 da identidade):** sem JS a lista aparece **aberta** e o botão
  fica **oculto** (atributo `hidden` no HTML). O `<script>` do componente: remove `hidden` do botão,
  marca a lista como recolhida (`data-open="false"` + CSS que esconde abaixo de `lg`), alterna ao
  clicar, atualiza `aria-expanded`, fecha com `Esc` devolvendo o foco ao botão. Abertura aparece em
  150 ms (§7), zerada por `prefers-reduced-motion` (já no `global.css`).
- Reserve à direita, antes do botão/nav, **um espaço vazio** para o seletor de idioma da fase 4
  (RF-29) — um comentário `<!-- fase 4: seletor de idioma (RF-29) -->` e nada renderizado.
- Régua fina (`border-b border-regua`) abaixo do cabeçalho, de ponta a ponta; conteúdo em contêiner
  `max-w-[90rem] mx-auto px-margem`.

**`SiteFooter.astro`** (§5.2): régua forte no topo (`border-t border-tinta`); quatro células
separadas por régua fina, empilhando abaixo de `sm`:
1. identificação: `nome`, `departamento?`, `instituicao`;
2. contato (`pt.footer.contact`): `email` como `mailto:`, sublinhado;
3. perfis acadêmicos (`pt.footer.academicProfiles`): cada `links.*` preenchido, rótulo de
   `pt.about.links[chave]`, `↗`, `target="_blank" rel="noopener noreferrer"` e `<span
   class="sr-only">{pt.site.opensInNewTab}</span>`; **célula some** se nenhum link;
4. site (`pt.footer.site`): os cinco `NAV_ITEMS` e o ano corrente (`new Date().getFullYear()`, no
   build).

A grade se recompõe quando uma célula some (use `grid` com `auto-fit`/`grid-flow`, não colunas fixas
que deixem buraco). **O plano 043 cria `ExternalLink.astro`** — não o use aqui (pode não existir
ainda); o link externo do rodapé é escrito inline com as mesmas regras.

**JS.** O único `<script>` deste plano é o do menu. Sem framework, sem dependência. Astro empacota e
deduplica `<script>` de componente — não use `is:inline`.

**Tamanho:** cada componente < 150 linhas (§10.4).

## Passos

1. `git rm src/layouts/.gitkeep src/components/.gitkeep` → verify: `git status --short src` colado.
2. `BaseLayout.astro`, `SiteHeader.astro`, `SiteFooter.astro` → verify: `npx astro check` com resumo colado.
3. Envolver o placeholder de `src/pages/index.astro` no `BaseLayout` (o `<h1>` atual vira o conteúdo do slot; remova o `<html>` próprio e o import de CSS; atualize `Atualizado em` do cabeçalho) → verify: `npm run build:pipeline` com saída do `astro check` e do `astro build` colada.
4. Inspeção do HTML gerado → verify: cole `grep -c 'lang="pt-BR"' dist/index.html`, `grep -o 'aria-current="page"[^>]*>[^<]*' dist/index.html`, `grep -o 'href="#conteudo"' dist/index.html` e `grep -o '<button[^>]*hidden[^>]*>' dist/index.html`.
5. **Sem JS:** `grep` não prova. Orquestrador: `npx astro preview`, DevTools → *Settings → Debugger → Disable JavaScript*, largura 360 → a lista de navegação está visível e o botão "Menu" não aparece. Transcreva.
6. **Com JS** (orquestrador), larguras 360, 768 e 1440, conforme "Verificação no navegador" do README da fase: `[scrollWidth, clientWidth]` iguais; em 360 e 768 o botão abre/fecha, `aria-expanded` alterna (cole o valor lido no painel *Elements*), `Esc` fecha e o foco volta ao botão; Tab começa pelo "Pular para o conteúdo"; foco visível em todos os links. Em 1440, "Início" com sublinhado. Com *Rendering → Emulate CSS prefers-reduced-motion: reduce*, o menu abre sem transição.
7. Portão → verify: `npm run lint`, `npm run format:check`, `npm run test:coverage` colados.

## Critérios de aceitação

- [ ] `BaseLayout` com `lang="pt-BR"`, `<title>` pelo dicionário, "Pular para o conteúdo" e `<main id="conteudo">`
- [ ] Cabeçalho com `aria-current="page"` na rota ativa e espaço reservado (vazio) para o seletor da fase 4
- [ ] Menu do celular: sem JS, lista aberta e botão oculto (observado no navegador); com JS, abre/fecha, `aria-expanded` alterna, `Esc` fecha
- [ ] Rodapé com as quatro células; perfis mostram só Lattes e ORCID com o conteúdo atual; célula sem dado some sem deixar buraco
- [ ] Nenhuma string de interface fora de `src/i18n/pt.ts`
- [ ] `[scrollWidth, clientWidth]` iguais em 360/768/1440, transcritos com data e horário
- [ ] `astro check`, `lint`, `format:check`, `test:coverage` e `build:pipeline` verdes, com saída colada
- [ ] Cabeçalho §10.1 e TSDoc de props nos três componentes; cada um < 150 linhas

## Evidência

<Preenchido pelo executor (passos 1–4, 7) e pelo orquestrador (5–6). Declare o que NÃO rodou.>
