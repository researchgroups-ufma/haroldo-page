# Plano 081 — Variantes WebP nas demais `<img>` do site (Decisão 3)

**Status:** TODO
**RFs cobertos:** §12 fase 5, item "Otimização de imagens" (parte 2 de 2; fecha o item); sabatina "Lacunas da auditoria de qualidade", Decisão 3; RNF-01
**Depende de:** plano 080 (`src/lib/images.ts` e a integração `uploadVariants`)
**Modelo recomendado:** sonnet
**Agente recomendado:** implementer
**Executável por:** agente; a verificação no navegador e o Lighthouse são do orquestrador
**PRD:** `S:\Projetos\academic_page\haroldo\PRD.md`
**Projeto:** `S:\Projetos\academic_page\haroldo`

## Objetivo

As oito `<img>` que sobraram depois do 080 passam por `responsiveImage` e saem com `width`,
`height`, `srcset` e `sizes`; o teste de `dist` passa a valer para **toda** `<img>` de `/uploads/`
do site.

## Arquivos afetados

- `src/components/CourseCover.astro` — `<img>` da linha 67
- `src/views/TeachingView.astro` — `<img>` da linha 113
- `src/views/ResearchView.astro` — `<img>` das linhas 126, 180 e 240
- `src/views/OutreachView.astro` — `<img>` da linha 100
- `src/views/PostView.astro` — `<img>` das linhas 97 e 119
- `tests/dist/site-gerado.test.ts` — o `describe` do 080 passa a varrer todas as rotas

> O executor não toca em arquivo fora desta lista. Se precisar, para e reporta. `Status:` fica `TODO`.
> Não commite. `src/lib/images.ts` não muda; se precisar mudar, pare e reporte.

## Contexto necessário

**Decisão 3** e o desenho do mecanismo estão no plano 080 (`080-imagens-mecanismo-e-retrato.md`,
"Contexto necessário"): leia a seção inteira. Resumo do que importa aqui: `responsiveImage(src)` é
assíncrona e devolve `{ src, width?, height?, srcset? }`; sem variante possível, devolve só `{ src }`
e o `<img>` sai como hoje.

**`await` só no frontmatter.** Dentro do `.map()` do JSX não dá para esperar. Resolva antes:
`CourseCover` recebe `imagem` por prop e pode chamar no próprio frontmatter; `TeachingView`
(cartões em `currentView`), `ResearchView` (`scenes`, `localizedLines` e `othersScene`),
`OutreachView` (`posts[].cover`) e `PostView` (`photos`) calculam, no frontmatter, um
`Map<string, ResponsiveImage>` com `Promise.all` sobre os caminhos únicos, e o JSX lê do mapa.

**`ResearchView.astro:100`** fixa `OTHERS_IMAGE = '/uploads/extensao-exemplo-4.jpg'` no código
(sabatina "Pesquisa modelo C", Decisão 10). Passa pelo mesmo mecanismo; **não troque a imagem** —
isso não é deste plano (ver o plano 085, pré-condição L-9).

**`sizes` de cada `<img>`**, derivados das classes (breakpoints do projeto: `sm` = 40rem e
`lg` = 64rem, `src/styles/global.css:16-18`; o conteúdo vive dentro de dois `px-margem`, cerca de
84% da largura no celular e até ~1216 px a 1440 px):

| Arquivo:linha | Classes que mandam | `sizes` |
|---|---|---|
| `CourseCover.astro:67` | coluna `minmax(0,15rem)` em `sm`, `18rem` em `lg`; largura cheia abaixo | `(min-width: 64rem) 288px, (min-width: 40rem) 240px, 100vw` |
| `TeachingView.astro:113` | cartão em 2 colunas a partir de `lg`; imagem em `2fr` de `2fr 3fr` a partir de `sm` | `(min-width: 64rem) 20vw, (min-width: 40rem) 40vw, 100vw` |
| `ResearchView.astro:126` (palco, só a partir de `lg`) | `lg:col-span-5` de 12 | `(min-width: 64rem) 40vw, 100vw` |
| `ResearchView.astro:180` e `:240` (`lg:hidden`) | `w-full` | `100vw` |
| `OutreachView.astro:100` | `w-24 sm:w-40` | `(min-width: 40rem) 160px, 96px` |
| `PostView.astro:97` (foto) | `lg:col-span-7` de 12; largura cheia abaixo | `(min-width: 64rem) 58vw, 100vw` |
| `PostView.astro:119` (miniatura) | 1/5 da largura da foto | `(min-width: 64rem) 12vw, 20vw` |

Os valores são aproximações para cima; o orquestrador confere o `currentSrc` no navegador e pode
ajustá-los, registrando na Evidência.

**`width`/`height` não podem mudar o layout.** Em todas as oito, o CSS já fixa o tamanho
(`w-full h-full`, `aspect-[…]`, `.cena { width: 100%; height: 100% }` em `ResearchView.astro:270-275`),
e CSS vence o atributo. `loading`, `decoding`, `alt`, `lang`, `class` e `data-*` ficam como estão.

**Asserções de `dist`:** o `describe` do 080 deixa de olhar só o retrato. Para **todo** `.html` fora de
`admin/` e **toda** `<img>` cujo `src` começa com `/uploads/`, termina num dos quatro formatos e não é
animada (`metadata().pages` ausente ou 1; GIF e WebP animado ficam sem variante, plano 080, "Imagem
animada não ganha variante"):
`width`/`height` = `autoOrient` do original em `public/` (via `sharp`); `srcset` presente, com toda URL
existente em `dist/` e a largura declarada igual à do arquivo; `sizes` presente. Contagem de `<img>`
conferidas maior que zero, e o número impresso no log (sem afirmar um total exato: o conteúdo é do
professor, README da fase 3, decisão 6).

**Regras de código:** `plans/fase-5-polimento-e-entrega/README.md`, seção "Regras de código".
Registre a contagem de linhas das views que passarem de 150 (aceito desde a v0.1.71 do PRD).

## Passos

1. As oito `<img>`, arquivo por arquivo → verify: `npm run build:pipeline` colado; `Get-ChildItem -Recurse dist/uploads/_webp` colado.
2. Asserções de `dist` para todas as rotas → verify: `npm run test:dist` colado, com a contagem de `<img>` conferidas.
3. Canário: tire o `srcset` do `<img>` do `OutreachView` e refaça o build → a asserção reprova nomeando `/extensao/`; desfaça e refaça → verify: saídas coladas.
4. `grep -o '<img[^>]*>' dist/ensino/index.html dist/pesquisa/index.html` (e uma postagem de Extensão) → verify: saída colada, com `width`, `height`, `srcset` e `sizes` visíveis.
5. Portão → verify: `npm run lint`, `npm run format:check`, `npm run test:coverage` colados; `wc -l` das cinco views/componentes.

**Do orquestrador:** no Vivaldi, com `astro preview`, Ensino, uma disciplina, Pesquisa, Extensão e
uma postagem em 360, 768 e 1440 px (método do iframe): nada mudou de lugar nem de proporção em
relação à produção; `currentSrc` de cada imagem numa variante `.webp` coerente com o tamanho
mostrado; a troca de imagem do palco de Pesquisa e o carrossel da postagem continuam funcionando.
Depois do push: Lighthouse mobile manual (Decisão 4) em `/ensino/` e numa postagem, com o
`image-delivery-insight` antes e depois, registrado com data.

## Critérios de aceitação

- [ ] As oito `<img>` com `width`, `height`, `srcset` e `sizes`; `OTHERS_IMAGE` intocada
- [ ] Asserção sobre toda `<img>` de `/uploads/` verde; canário vermelho
- [ ] Verificação no navegador e Lighthouse registrados (orquestrador)
- [ ] `lint`, `format:check`, `test:coverage`, `build:pipeline`, `test:dist` verdes, com saída colada

## Evidência

<Preenchida pelo executor, com saída literal capturada em arquivo (ver `plans/DESPACHO.md`). Plano
sem esta seção preenchida não é DONE.>
