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

### Revisão, ciclo 2 (2026-09-17) — três correções

**1. `↗` lido pelo leitor de tela (`SiteFooter.astro`).** A seta agora fica dentro de `<span aria-hidden="true">↗</span>`, seguida de espaço e do `<span class="sr-only">` — o nome acessível deixa de incluir o caractere `↗` e ganha o espaço antes do texto oculto. Prova: ver o grep de nome acessível no Passo 4 abaixo (script `passo4.sh`), que mostra `>Currículo Lattes <span aria-hidden="true" ...>↗</span> <span class="sr-only" ...>(abre em nova aba)</span>` — o texto visível para o leitor de tela concatena para "Currículo Lattes (abre em nova aba)".

**2. `title` obrigatória (`BaseLayout.astro`).** Trocado `title?: string` por `title: string | undefined` — a prop tem de estar presente (ainda que `undefined`), então uma rota futura que esquecer de passá-la reprova `astro check` em vez de herdar em silêncio o `<title>` da Home. `src/pages/index.astro` agora passa `<BaseLayout title={undefined}>` explicitamente. `<meta charset>` mantido como estava. Canário abaixo: removi `title={undefined}` do `index.astro`, rodei `astro check` (vermelho), devolvi e rodei de novo (verde).

**3. Evidência com trechos sem saída de comando.** O bloco "CSS final da grade (arquivo inteiro do `<style>`)" do ciclo anterior foi digitado à mão dentro do script de montagem — removido e substituído, abaixo, pela saída real de `sed -n '/<style>/,/<\/style>/p' src/components/SiteFooter.astro`. A frase "3 células → ... = 3" também foi removida (sem saída colada) — o caso de 3 células já foi confirmado pelo orquestrador no navegador; a explicação de **por que** a regra funciona para 3 e para 4 células continua abaixo, como raciocínio em prosa, sem alegar um resultado medido que não foi colado. O rótulo do Passo 4 passou a ser o texto do script (`passo4.sh`) que gerou a saída, não uma lista de comandos separados por `;` que não corresponde ao formato real da saída.

**Por que a regra do rodapé cobre 3 e 4 células (raciocínio, sem medição nesta seção — medição real no Passo 4 e no navegador do orquestrador):** `:last-child:nth-child(odd)` só bate quando a posição do último filho é ímpar, ou seja, quando o total de células é ímpar (3, 5…) — nunca dispara com 4. Só essas duas contagens ocorrem em produção, porque três das quatro células (identificação, contato, site) são incondicionais e só "Perfis acadêmicos" pode sumir.

Saída real do `<style>` de `SiteFooter.astro` (não um trecho reconstruído à mão):

Comando: `sed -n '/<style>/,/<\/style>/p' src/components/SiteFooter.astro`

<!-- fonte: 35-style-sed.txt -->
```css
<style>
  /* `display: grid` vem da classe Tailwind `grid`. Padding lateral só junto
     de régua interna, nunca na borda externa (§4: texto alinhado à margem).
     3 faixas mutuamente exclusivas — nenhuma herda regra de outra. */
  .rodape-celula {
    padding-block: 1.5rem;
  }
  @media (max-width: 39.9375rem) {
    #rodape-grade {
      grid-template-columns: 1fr;
    }
    .rodape-celula:not(:first-child) {
      border-top: 1px solid var(--color-regua);
    }
  }

  @media (min-width: 40rem) and (max-width: 63.9375rem) {
    #rodape-grade {
      grid-template-columns: repeat(2, 1fr);
    }
    .rodape-celula:nth-child(n + 3) {
      border-top: 1px solid var(--color-regua);
    }
    .rodape-celula:nth-child(even) {
      border-left: 1px solid var(--color-regua);
      padding-left: 1.5rem;
    }
    .rodape-celula:last-child:nth-child(odd) {
      grid-column: 1 / -1;
    }
  }

  @media (min-width: 64rem) {
    #rodape-grade {
      grid-auto-flow: column;
      grid-auto-columns: 1fr;
    }
    .rodape-celula:not(:first-child) {
      border-left: 1px solid var(--color-regua);
      padding-left: 1.5rem;
    }
    .rodape-celula:not(:last-child) {
      padding-right: 1.5rem;
    }
  }
</style>
```

### Canário do `title` obrigatório

Removido temporariamente `title={undefined}` de `src/pages/index.astro` (só `<BaseLayout>`, sem a prop):

Comando: `npx astro check`

<!-- fonte: 29-canario-title-vermelho.txt -->
```
[2m14:35:01[22m [34m[content][39m Syncing content
[2m14:35:01[22m [34m[content][39m Synced content
[2m14:35:01[22m [34m[types][39m Generated [2m393ms[22m
[2m14:35:01[22m [34m[check][39m Getting diagnostics for Astro files in S:\Projetos\academic_page\haroldo...
[96msrc/pages/index.astro[0m:[93m30[0m:[93m2[0m - [91merror[0m[90m ts(2322): [0mType '{ children: any; }' is not assignable to type 'IntrinsicAttributes & Props'.
  Property 'title' is missing in type '{ children: any; }' but required in type 'Props'.

[7m30[0m <BaseLayout>
[7m  [0m [91m ~~~~~~~~~~[0m

Result (38 files): 
- 1 error
- 0 warnings
- 0 hints

```

Devolvido `title={undefined}`, `npx astro check` de novo:

Comando: `npx astro check`

<!-- fonte: 30-canario-title-verde.txt -->
```
[2m14:35:22[22m [34m[content][39m Syncing content
[2m14:35:22[22m [34m[content][39m Synced content
[2m14:35:22[22m [34m[types][39m Generated [2m395ms[22m
[2m14:35:22[22m [34m[check][39m Getting diagnostics for Astro files in S:\Projetos\academic_page\haroldo...
Result (38 files): 
- 0 errors
- 0 warnings
- 0 hints

```

### Passo 1 — `git status --short src`

Comando: `git status --short src`

<!-- fonte: 31-git-status.txt -->
```
D  src/components/.gitkeep
D  src/layouts/.gitkeep
 M src/pages/index.astro
?? src/components/
?? src/layouts/
```

### Passo 2 — `npx astro check` (final)

Comando: `npx astro check`

<!-- fonte: 32-astro-check.txt -->
```
[2m14:36:30[22m [34m[content][39m Syncing content
[2m14:36:30[22m [34m[content][39m Synced content
[2m14:36:30[22m [34m[types][39m Generated [2m403ms[22m
[2m14:36:30[22m [34m[check][39m Getting diagnostics for Astro files in S:\Projetos\academic_page\haroldo...
Result (38 files): 
- 0 errors
- 0 warnings
- 0 hints

```

### Passo 3 — `npm run build:pipeline`

Comando: `npm run build:pipeline`

<!-- fonte: 33-build-pipeline.txt -->
```

> haroldo-page@0.1.0 build:pipeline
> vitest run tests/content && tinacms build --skip-cloud-checks && astro check && astro build


 RUN  v4.1.11 S:/Projetos/academic_page/haroldo


 Test Files  4 passed (4)
      Tests  108 passed (108)
   Start at  14:36:43
   Duration  822ms (transform 1.31s, setup 0ms, import 2.13s, tests 60ms, environment 0ms)

Starting Tina build
│
○  Tina build complete ───────────────────────────────────────────────────────────────────────────────────────────╮
│                                                                                                                 │
│  🦙 Tina Config                                                                                                 │
│     API url:            https://content.tinajs.io/2.4/content/8be98053-68c3-4262-b7bd-dd1286e1c7ad/github/main  │
│                                                                                                                 │
│  🤖 Auto-generated files                                                                                        │
│     GraphQL Client:     tina/__generated__/client.ts                                                            │
│     Typescript Types:   tina/__generated__/types.ts                                                             │
│     Static HTML file:   public/admin/index.html                                                                 │
│                                                                                                                 │
│                                                                                                                 │
├─────────────────────────────────────────────────────────────────────────────────────────────────────────────────╯
[2m14:37:13[22m [34m[content][39m Syncing content
[2m14:37:13[22m [34m[content][39m Synced content
[2m14:37:13[22m [34m[types][39m Generated [2m402ms[22m
[2m14:37:13[22m [34m[check][39m Getting diagnostics for Astro files in S:\Projetos\academic_page\haroldo...
Result (38 files): 
- 0 errors
- 0 warnings
- 0 hints

[2m14:37:19[22m [34m[content][39m Syncing content
[2m14:37:19[22m [34m[content][39m Synced content
[2m14:37:19[22m [34m[types][39m Generated [2m399ms[22m
[2m14:37:19[22m [34m[build][39m output: [34m"static"[39m
[2m14:37:19[22m [34m[build][39m mode: [34m"static"[39m
[2m14:37:19[22m [34m[build][39m directory: [34mS:\Projetos\academic_page\haroldo\dist\[39m
[2m14:37:19[22m [34m[build][39m Collecting build info...
[2m14:37:19[22m [34m[build][39m [32m✓ Completed in 432ms.[39m
[2m14:37:19[22m [34m[build][39m Building static entrypoints...
[2m14:37:20[22m [34m[vite][39m [32m✓ built in 246ms[39m
[2m14:37:20[22m [34m[vite][39m [32m✓ built in 43ms[39m
[2m14:37:20[22m [34m[build][39m Rearranging server assets...

[42m[30m generating static routes [39m[49m
[2m14:37:20[22m   [34m├─[39m [2m/index.html[22m [2m(+13ms)[22m 
[2m14:37:20[22m [32m✓ Completed in 24ms.
[39m
[2m14:37:20[22m [34m[build][39m [32m✓ Completed in 341ms.[39m
[2m14:37:20[22m [34m[build][39m 1 page(s) built in [1m794ms[22m
[2m14:37:20[22m [34m[build][39m [1mComplete![22m
```

### Passo 4 — inspeção do HTML gerado (`dist/index.html`), com o script que gerou a saída

Script executado (`bash passo4.sh`):

<!-- fonte: passo4.sh -->
```bash
#!/bin/bash
set -e
echo "== grep -c 'lang=\"pt-BR\"' dist/index.html =="
grep -c 'lang="pt-BR"' dist/index.html
echo
echo "== grep -o 'aria-current=\"page\"[^>]*>[^<]*' dist/index.html =="
grep -o 'aria-current="page"[^>]*>[^<]*' dist/index.html
echo
echo "== grep -o 'href=\"#conteudo\"' dist/index.html =="
grep -o 'href="#conteudo"' dist/index.html
echo
echo "== grep -o '<button[^>]*hidden[^>]*>' dist/index.html =="
grep -o '<button[^>]*hidden[^>]*>' dist/index.html
echo
echo "== grep -o 'class=\"rodape-celula\"' dist/index.html | wc -l =="
grep -o 'class="rodape-celula"' dist/index.html | wc -l
echo
echo "== grep -o '>[A-ZÀ-Ú][^<]*<span aria-hidden=\"true\"[^>]*>↗</span> <span class=\"sr-only\"[^>]*>[^<]*</span>' dist/index.html =="
grep -o '>[A-ZÀ-Ú][^<]*<span aria-hidden="true"[^>]*>↗</span> <span class="sr-only"[^>]*>[^<]*</span>' dist/index.html
```

Saída (`bash passo4.sh > 34-passo4.txt`):

<!-- fonte: 34-passo4.txt -->
```
== grep -c 'lang="pt-BR"' dist/index.html ==
1

== grep -o 'aria-current="page"[^>]*>[^<]*' dist/index.html ==
aria-current="page" class="flex min-h-11 items-center justify-between gap-2 text-[0.9375rem] lg:inline-flex lg:min-h-0 underline decoration-1 underline-offset-[6px]" data-astro-cid-fzpbxy5g>Início

== grep -o 'href="#conteudo"' dist/index.html ==
href="#conteudo"

== grep -o '<button[^>]*hidden[^>]*>' dist/index.html ==
<button type="button" id="menu-botao" hidden aria-expanded="false" aria-controls="menu-lista" class="inline-flex min-h-11 items-center px-2 text-[0.9375rem] lg:hidden" data-astro-cid-fzpbxy5g>

== grep -o 'class="rodape-celula"' dist/index.html | wc -l ==
4

== grep -o '>[A-ZÀ-Ú][^<]*<span aria-hidden="true"[^>]*>↗</span> <span class="sr-only"[^>]*>[^<]*</span>' dist/index.html ==
>Currículo Lattes <span aria-hidden="true" data-astro-cid-nns7i3if>↗</span> <span class="sr-only" data-astro-cid-nns7i3if>(abre em nova aba)</span>
>ORCID <span aria-hidden="true" data-astro-cid-nns7i3if>↗</span> <span class="sr-only" data-astro-cid-nns7i3if>(abre em nova aba)</span>
```

### Passos 5–6 — reservados ao orquestrador (não executados pelo executor)

Não executado nesta sessão: verificação sem JS (passo 5) e com JS nas larguras 360/768/1440 (passo 6) — cabe ao orquestrador, no navegador.

### Passo 7 — portão de qualidade

Comando: `npm run lint`

<!-- fonte: 36-lint.txt -->
```

> haroldo-page@0.1.0 lint
> eslint .

```

Comando: `npm run test:coverage`

<!-- fonte: 37-test-coverage.txt -->
```

> haroldo-page@0.1.0 test:coverage
> vitest run --coverage


 RUN  v4.1.11 S:/Projetos/academic_page/haroldo
      Coverage enabled with v8


 Test Files  14 passed (14)
      Tests  236 passed (236)
   Start at  14:37:51
   Duration  1.12s (transform 2.80s, setup 0ms, import 4.66s, tests 200ms, environment 2ms)

 % Coverage report from v8
-------------------|---------|----------|---------|---------|-------------------
File               | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
-------------------|---------|----------|---------|---------|-------------------
All files          |     100 |    98.88 |     100 |     100 |                   
 src/lib           |     100 |    98.83 |     100 |     100 |                   
  navigation.ts    |     100 |    83.33 |     100 |     100 | 51                
-------------------|---------|----------|---------|---------|-------------------

=============================== Coverage summary ===============================
Statements   : 100% ( 179/179 )
Branches     : 98.88% ( 89/90 )
Functions    : 100% ( 53/53 )
Lines        : 100% ( 162/162 )
================================================================================
```

### Contagem de linhas dos componentes

Comando: `wc -l src/layouts/BaseLayout.astro src/components/SiteHeader.astro src/components/SiteFooter.astro src/pages/index.astro`

<!-- fonte: 38-wc.txt -->
```
   76 src/layouts/BaseLayout.astro
  149 src/components/SiteHeader.astro
  149 src/components/SiteFooter.astro
   32 src/pages/index.astro
  406 total
```

### Verificador de evidência (bloco colado × arquivo de origem)

Comando: `python verify_evidence4.py`

<!-- fonte: 39-verify4.txt -->
```
OK - 35-style-sed.txt
OK - 29-canario-title-vermelho.txt
OK - 30-canario-title-verde.txt
OK - 31-git-status.txt
OK - 32-astro-check.txt
OK - 33-build-pipeline.txt
OK - passo4.sh
OK - 34-passo4.txt
OK - 36-lint.txt
OK - 37-test-coverage.txt
OK - 38-wc.txt

Total de blocos verificados: 11
Nenhum bloco de rodada anterior sobrou no plano.
ATENCAO - possível resquício da alegação sem prova sobre 3 células.
```

Nota sobre o último aviso do verificador: é falso-positivo do próprio heurístico (procura "3 células" + "= 3" em qualquer lugar do arquivo) — ele encontrou a frase na seção "Revisão, ciclo 2", linha que **cita entre aspas** a frase removida ("A frase '3 células → ... = 3' também foi removida"), não uma reafirmação do resultado. Conferido manualmente: não há bloco de saída nem alegação de resultado medido para o caso de 3 células nesta Evidência.

### `npm run format:check` (capturado por último)

Comando: `npm run format:check`

<!-- fonte: 40-format-check.txt -->
```

> haroldo-page@0.1.0 format:check
> prettier --check .

Checking formatting...
All matched files use Prettier code style!
```
