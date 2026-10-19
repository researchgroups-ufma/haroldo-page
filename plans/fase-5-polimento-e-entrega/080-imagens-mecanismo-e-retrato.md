# Plano 080 — Variantes WebP de `/uploads` no build, com `sharp`, e o retrato da Home e da Sobre (Decisão 3)

**Status:** TODO
**RFs cobertos:** §12 fase 5, item "Otimização de imagens" (parte 1 de 2; fecha com o 081); sabatina "Lacunas da auditoria de qualidade", Decisão 3; RNF-01; §7.2 (dependência direta nova)
**Depende de:** nenhum
**Modelo recomendado:** sonnet
**Agente recomendado:** implementer
**Executável por:** agente; a verificação no navegador e a linha da §7.2 do PRD são do orquestrador
**PRD:** `S:\Projetos\academic_page\haroldo\PRD.md`
**Projeto:** `S:\Projetos\academic_page\haroldo`

## Objetivo

O build gera variantes WebP das imagens de `public/uploads/` que as páginas exibem, e uma função lê
as dimensões do original para o `<img>` sair com `width`, `height`, `srcset` e `sizes`. O original
continua servido, e o painel e o caminho gravado no conteúdo não mudam. Neste plano, o mecanismo
entra com o retrato da Home e da Sobre; o 081 aplica o mesmo às outras oito `<img>`.

## Arquivos afetados

- `package.json`, `package-lock.json` — `sharp` 0.35.4, exata, em `dependencies`
- `src/lib/images.ts` — arquivo novo
- `tests/lib/images.test.ts` — arquivo novo
- `astro.config.mjs` — integração `uploadVariants` (gancho `astro:build:done`) e cabeçalho §10.1
- `src/views/HomeView.astro` (`<img>` da linha 110), `src/views/AboutView.astro` (`<img>` da linha 106)
- `tests/dist/site-gerado.test.ts` — `describe` novo

> O executor não toca em arquivo fora desta lista. Se precisar, para e reporta. `Status:` fica `TODO`.
> Não commite. **`public/uploads/` e `tina/config.ts` não mudam.** A linha da §7.2 do `PRD.md` é do
> orquestrador, na promoção (texto da §7.2 sobe a versão do PRD).

## Contexto necessário

**Decisão 3** (`docs/sabatinas/CHANGELOG_sabatina_auditoria-qualidade.md`): o build gera, para cada
imagem de `public/uploads/` que o site exibe, variantes WebP em poucas larguras e lê as dimensões do
original; as páginas usam `srcset`/`sizes` com `width` e `height`; o original continua servido; o
painel e o caminho no conteúdo não mudam. Descartados: transformação de imagem da Cloudflare e
gravar só as dimensões.

**Medido em 2026-10-12 (auditoria):** as imagens vêm cruas de `/uploads/*.jpg`; `profile.jpg` tem
140 KB, 960×1280, e aparece com 144–176 px no celular; `extensao-exemplo-*.jpg` têm 37–49 KB. O
Lighthouse estima ~123 KiB de economia. 33 `<img>` em produção sem `width`/`height`; só o retrato da
Home e da Sobre tem (960×1280, fixo no código). O Astro **não** otimiza arquivos de `public/`. Tina:
`media.tina.publicFolder: 'public'`, `mediaRoot: 'uploads'` (`tina/config.ts:104-107`).

**`sharp` como dependência direta.** Hoje só existe transitivo: `astro@7.2.10` o pede em
`optionalDependencies` (`^0.35.4`) e o `miniflare` do `wrangler` fixa `0.35.4` exato (ADR-0010,
"Exceções datadas"; exceção `GHSA-wq5f-xc86-pv6w` em `scripts/auditar-dependencias.mjs:46-50`).
Instale **`npm install --save-exact sharp@0.35.4`**: a `0.35.5` criaria uma segunda cópia, porque o
`miniflare` não sobe. Confira com `npm ls sharp` (uma cópia, `deduped` sob `astro` e `miniflare`) e
`git diff --stat package-lock.json`: o esperado é a entrada da raiz e a troca de marcador
`optional` dos pacotes `sharp`/`@img/*`. Pacote fora dessa cadeia é alerta: pare e reporte. **Não
rode `npm audit fix`** (já trouxe uma segunda cópia do `tinacms`). O portão de auditoria do CI é
`node scripts/auditar-dependencias.mjs` (`.github/workflows/ci.yml:30`).

**Desenho** (decisões técnicas do fatiamento):
- **URL da variante:** `/uploads/_webp/<caminho relativo a uploads>.w<largura>.webp` — ex.:
  `/uploads/profile.jpg` → `/uploads/_webp/profile.jpg.w480.webp`. Fica sob `/uploads/*` (o
  `Cache-Control` do plano 082 vale para ela) e só existe em `dist/`: o painel nunca a vê.
- **Larguras:** `VARIANT_WIDTHS = [480, 960, 1600]`, só as menores ou iguais à largura do original;
  sem nenhuma, uma variante na largura do original. De onde saíram: retrato de 144–176 px CSS no
  celular a 2–3× (~350–530 px); capas e cartões de até 288 px CSS a 2× (~580 px); foto da postagem
  de Extensão, a partir de `lg`, ~7/12 do conteúdo (~780 px CSS, ~1560 px a 2×). O orquestrador pode
  trocar os valores se a medição mostrar defeito, registrando na Evidência (critério da Decisão 9).
- **WebP** com `quality: 80` (o padrão do `sharp`).
- **Formatos:** só `.jpg`, `.jpeg`, `.png` e `.webp` (sem distinção de caixa). Caminho fora de
  `/uploads/`, outro formato ou arquivo ausente → a função devolve só `{ src }` e o `<img>` sai como
  hoje.
- **Imagem animada não ganha variante** (pedido do stakeholder em 2026-10-19: GIF enviado pelo painel
  tem de continuar animado no site). O Tina aceita GIF (`image/*` na lista padrão de upload, sem
  `media.accept` no `tina/config.ts`), e hoje o GIF aparece animado porque o `<img>` serve o
  original. O `sharp` lê só o primeiro quadro sem `animated: true`, e a variante sairia parada.
  Por isso: **`.gif` fica fora da lista de formatos** (não acrescente) e um `.webp` animado
  (`metadata().pages > 1`) também devolve só `{ src }`. Medido em 2026-10-19 no `sharp` 0.35.4: WebP e
  GIF de dois quadros dão `pages = 2`, imagem estática dá `pages` ausente, e `resize().webp()` sem
  `animated` devolve um quadro só. PNG animado (APNG) não é detectado pelo `sharp` e fica de fora
  deste plano.
- **Orientação EXIF:** dimensões de `metadata().autoOrient.width/height`
  (`node_modules/sharp/lib/index.d.ts:1238`; `width`/`height` simples ignoram a orientação) e variantes
  geradas com `.autoOrient()` antes do `resize`.

**`src/lib/images.ts`** (cabeçalho §10.1; TSDoc em tudo que exportar; comentário citando a Decisão 3):
- `variantPath(src, width)` e `originalFromVariant(path)` — inversas, puras.
- `responsiveImage(src, publicDir = join(process.cwd(), 'public'))` →
  `Promise<{ src: string; width?: number; height?: number; srcset?: string }>`, com cache por `src`
  num `Map`. O `process.cwd()` é deliberado: no build o `import.meta.url` aponta para um pedaço
  pré-renderizado dentro de `dist/`, e os scripts npm rodam na raiz. Não é `process.env`.
- `generateUploadVariants(distDir, publicDir)` → `Promise<number>`: percorre os `.html` de `distDir`
  fora de `admin/`, acha toda URL `/uploads/_webp/…\.w(\d+)\.webp`, gera cada uma uma vez a partir de
  `publicDir/uploads/…`, e devolve quantas gerou. Variante citada sem original lança erro nomeando os
  dois caminhos.
- Sem `import` de `src/lib/config.ts`: o `astro.config.mjs` importa este módulo (mesmo cuidado de
  `src/lib/routes.ts`, README da fase 4, "Por onde isto pode dar errado", item 3).

**`astro.config.mjs`:** uma integração no formato de `english404FileName` (linhas 27–40), com
`'astro:build:done': async ({ dir }) => generateUploadVariants(fileURLToPath(dir), fileURLToPath(new URL('./public/', import.meta.url)))`,
acrescentada a `integrations` (linha 101). O `.mjs` já importa `.ts` (`./src/lib/routes.ts`, plano
071).

**As duas views.** Como o frontmatter pode usar `await`, chame `responsiveImage(perfil.foto)` lá e
espalhe `width`, `height` e `srcset` no `<img>`, no lugar do `width="960" height="1280"` fixo.
`sizes`, derivados das classes (breakpoints do projeto: só `sm` = 40rem e `lg` = 64rem,
`src/styles/global.css:16-18`):
- Home (`w-36 sm:w-44 lg:h-full lg:max-h-[24rem] lg:w-auto`, `aspect-[3/4]`):
  `(min-width: 64rem) 288px, (min-width: 40rem) 176px, 144px`;
- Sobre (`w-40 sm:w-48 lg:h-full lg:max-h-[20rem] lg:w-auto`, `aspect-[3/4]`):
  `(min-width: 64rem) 240px, (min-width: 40rem) 192px, 160px`.
`fetchpriority`, `decoding`, `alt` e `class` ficam como estão.

**Testes unitários** (`tests/lib/images.test.ts`), com imagens criadas pelo próprio `sharp`
(`sharp({ create: … })`) num diretório de `os.tmpdir()`: `variantPath`/`originalFromVariant`
inversas; larguras filtradas (2000 → 480, 960, 1600; 1000 → 480, 960; 300 → 300); EXIF orientação 6
(`.withMetadata({ orientation: 6 })`) devolve largura e altura trocadas; caminho fora de `/uploads/`,
`.svg`, `.gif` e arquivo ausente devolvem só `{ src }`; WebP animado de dois quadros
(`sharp([a, b], { join: { animated: true } }).webp()`) devolve só `{ src }`, e o mesmo arquivo
estático (um quadro) ganha `srcset`; `generateUploadVariants` gera só as variantes citadas
num `.html` de teste, com a largura certa, ignora `admin/` e lança com variante sem original.

**Asserções de `dist`** (`describe('imagens de /uploads (Decisão 3)')`), com o esperado vindo do
`sharp` sobre `public/uploads/` (fonte independente do `dist/`): em `/`, `/sobre/`, `/en/` e
`/en/about/`, o retrato tem `src` `/uploads/profile.jpg`, `width`/`height` iguais a
`autoOrient` do original, e `srcset` cujas URLs existem em `dist/` com a largura declarada;
`dist/uploads/profile.jpg` continua existindo; `public/uploads/_webp` não existe. Todo laço com
`expect` de ao menos um item.

**Armadilha:** o `sharp` nunca rodou no Workers Builds (Linux). O primeiro build depois do push é a
prova; o orquestrador confere o log.

**Regras de código:** `plans/fase-5-polimento-e-entrega/README.md`, seção "Regras de código".

## Passos

1. Instalação → verify: `npm install --save-exact sharp@0.35.4`, `npm ls sharp`, `git diff package.json` e `git diff --stat package-lock.json` colados.
2. `src/lib/images.ts` e os testes unitários → verify: `npm test -- tests/lib/images.test.ts` colado.
3. Integração no `astro.config.mjs` e as duas views → verify: `npm run build:pipeline` colado; `Get-ChildItem dist/uploads/_webp` e o `<img>` do retrato de `dist/index.html` colados.
4. Asserções de `dist` → verify: `npm run test:dist` colado.
5. Canário A: faça `generateUploadVariants` devolver `0` sem gerar e refaça o build → as asserções de existência reprovam; desfaça e refaça → verify: saídas coladas.
6. Canário B: troque `autoOrient.width/height` por `width/height` → o teste da orientação 6 reprova; desfaça. Canário C: tire a checagem de `pages` → o teste do WebP animado reprova; desfaça → verify: saídas coladas.
7. Tamanho: `Get-Item` de `dist/uploads/profile.jpg` e das variantes, com `Length` → verify: saída colada.
8. Portão → verify: `npm ci` (lock sem mudança: hash SHA-256 antes e depois), `node scripts/auditar-dependencias.mjs` (exit 0), `npm run lint`, `npm run format:check`, `npm run test:coverage` colados.

**Do orquestrador:** no Vivaldi, com `astro preview`, Home e Sobre em 360, 768 e 1440 px (método do
iframe): retrato igual ao de produção, `currentSrc` numa variante `.webp`, sem deslocamento de
layout. Depois do push: log do Workers Builds com o build verde. Na promoção: linha da §7.2 do PRD
(`| Imagens | \`sharp\` | 0.35.4 (fixada na fase 5, plano 080) | Variantes WebP de \`public/uploads/\` no build (sabatina "Lacunas da auditoria de qualidade", Decisão 3) |`) e a versão do PRD.

## Critérios de aceitação

- [ ] `sharp` 0.35.4 exata, uma cópia só (`npm ls sharp`), churn do lock conferido
- [ ] `src/lib/images.ts` com TSDoc e os testes da lista verdes
- [ ] Retrato da Home e da Sobre com `width`/`height` do original, `srcset` e `sizes`; variantes em `dist/uploads/_webp/`
- [ ] `.gif` e `.webp` animado saem só com `{ src }` (imagem animada continua animada)
- [ ] Canários A, B e C vermelhos
- [ ] `node scripts/auditar-dependencias.mjs` exit 0
- [ ] Verificação no navegador (orquestrador)
- [ ] `lint`, `format:check`, `test:coverage`, `build:pipeline`, `test:dist` verdes, com saída colada

## Evidência

<Preenchida pelo executor, com saída literal capturada em arquivo (ver `plans/DESPACHO.md`). Plano
sem esta seção preenchida não é DONE.>
