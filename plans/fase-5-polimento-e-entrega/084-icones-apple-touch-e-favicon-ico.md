# Plano 084 — `apple-touch-icon.png` e `favicon.ico` derivados do `favicon.svg` (Decisões 5 e 9)

**Status:** TODO
**RFs cobertos:** §12 fase 5, item "Ícones" (fecha); **RNF-18** (o `curl` do cache dos dois ícones novos; as regras são do 082); sabatina "Lacunas da auditoria de qualidade", Decisão 5, item 7, e Decisão 9; RF-30 (favicon); §12 fase 5, item "Cabeçalhos de segurança e cache" (fecha com 082 e 083)
**Depende de:** plano 082 (as regras de `Cache-Control` de `/favicon.ico` e `/apple-touch-icon.png`)
**Modelo recomendado:** sonnet
**Agente recomendado:** implementer
**Executável por:** agente; o `curl` em produção é do orquestrador, depois do push
**PRD:** `S:\Projetos\academic_page\haroldo\PRD.md`
**Projeto:** `S:\Projetos\academic_page\haroldo`

## Objetivo

`public/apple-touch-icon.png` (180×180) e `public/favicon.ico` (32×32 e 16×16) existem, derivados do
`favicon.svg`, gerados uma vez, versionados, com o método na Evidência; o `<head>` ganha
`<link rel="apple-touch-icon">`. Hoje o `favicon.ico` dá 404.

## Arquivos afetados

- `public/apple-touch-icon.png`, `public/favicon.ico` — arquivos novos, binários
- `src/layouts/BaseLayout.astro` — `<link rel="apple-touch-icon" href="/apple-touch-icon.png" />` depois do `<link rel="icon">` (linha 94)
- `tests/dist/site-gerado.test.ts` — o `it('dist/favicon.svg existe e toda página o declara')` (linha 669) ganha os dois arquivos novos, e um `it` novo para as dimensões

> O executor não toca em arquivo fora desta lista. Se precisar, para e reporta. `Status:` fica `TODO`.
> Não commite. **`public/favicon.svg` não muda.** O script de geração fica no scratchpad e entra
> inteiro na Evidência; não vai para o repositório. Não há `<link>` para o `favicon.ico`: os
> navegadores o pedem sozinhos na raiz.

## Contexto necessário

**Decisão 9:** `public/apple-touch-icon.png` 180×180 e `public/favicon.ico` com 32×32 e 16×16,
derivados do `favicon.svg`; o `<head>` ganha `<link rel="apple-touch-icon">`. O RNF-18 pede
`Cache-Control: public, max-age=3600, must-revalidate` nos dois, regra que o 082 já escreveu.

**`public/favicon.svg`** (uma linha):

```
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="6" fill="#efedea"/><text x="16" y="21" text-anchor="middle" font-family="Helvetica Neue, Helvetica, Arial, sans-serif" font-size="13" letter-spacing="-0.4" fill="#111112">HL</text></svg>
```

**Método** (técnico, do fatiamento):
- Rasterização com o `sharp` do projeto (dependência direta desde o 080; antes dele, a cópia
  transitiva do `astro`, a mesma 0.35.4). O librsvg do `sharp` desenha o `<text>` com fonte do
  sistema: no Windows, Arial, a mesma em que o navegador cai, porque a pilha do SVG não acha Helvetica.
  Registre isso na Evidência.
- O script fica no scratchpad, então `import 'sharp'` não resolve de lá: use
  `createRequire('S:/Projetos/academic_page/haroldo/package.json')('sharp')`.
- `sharp(svg, { density })` com densidade suficiente para 180 px (o SVG tem 32 unidades:
  `density = 72 * 180 / 32`), `.resize(180, 180)`.
- **`apple-touch-icon.png` sem transparência:** o iOS preenche a transparência de preto, e os cantos
  do `rx="6"` ficariam pretos. `.flatten({ background: '#efedea' })` (a cor do próprio retângulo); o
  iOS aplica a máscara arredondada dele.
- **`favicon.ico`:** o `sharp` não grava ICO. Gere dois PNG (32 e 16, com transparência) e monte o
  contêiner à mão: cabeçalho `ICONDIR` de 6 bytes (`0, 1, quantidade`, little-endian), uma entrada
  `ICONDIRENTRY` de 16 bytes por imagem (largura, altura, 0, 0, planos 1, 32 bits por pixel, tamanho do
  PNG, deslocamento) e os PNG em seguida. PNG dentro de ICO é aceito por todo navegador da RNF-11.

**Asserções de `dist`:**
1. o `it` da linha 669 passa a conferir `dist/favicon.ico` e `dist/apple-touch-icon.png` e o
   `href="/apple-touch-icon.png"` em toda página;
2. `it` novo: `dist/apple-touch-icon.png` começa pela assinatura PNG e o IHDR diz 180×180;
   `dist/favicon.ico` tem `ICONDIR` com tipo 1 e duas entradas, 32×32 e 16×16, cada uma apontando para
   dados que começam pela assinatura PNG. Leitura de bytes com `Buffer`, sem biblioteca.

**Regras de código:** `plans/fase-5-polimento-e-entrega/README.md`, seção "Regras de código".
Cabeçalho §10.1 do `BaseLayout.astro` (Notas: "favicon, apple-touch-icon").

## Passos

1. Script de geração no scratchpad e os dois arquivos em `public/` → verify: saída do script (dimensões e bytes de cada arquivo) colada.
2. `<link rel="apple-touch-icon">` no `BaseLayout` → verify: `npm run build:pipeline` colado.
3. Asserções 1–2 → verify: `npm run test:dist` colado.
4. Canário: troque, no `dist/favicon.ico`, o byte da contagem de imagens para 1 → a asserção 2 reprova; refaça o build → verify: saídas coladas.
5. Portão → verify: `npm run lint`, `npm run format:check`, `npm run test:coverage` colados.

**Do orquestrador:** abrir os dois arquivos e conferir que reproduzem o `favicon.svg` (mostrar ao
stakeholder junto). Depois do push e do Workers Builds verde: `curl.exe -sI` em
`https://haroldo-page.and-near.workers.dev/favicon.ico` e em `/apple-touch-icon.png` — 200 e
`Cache-Control: public, max-age=3600, must-revalidate` — colados. Com isso o RNF-18 fica todo
verificado.

## Critérios de aceitação

- [ ] `apple-touch-icon.png` 180×180 sem transparência e `favicon.ico` com 32×32 e 16×16, método completo na Evidência
- [ ] `<link rel="apple-touch-icon">` em toda página
- [ ] Asserções 1–2 verdes; canário vermelho
- [ ] `curl` de produção nos dois: 200 e o `Cache-Control` do RNF-18 (orquestrador)
- [ ] `lint`, `format:check`, `test:coverage`, `build:pipeline`, `test:dist` verdes, com saída colada

## Evidência

<Preenchida pelo executor, com saída literal capturada em arquivo (ver `plans/DESPACHO.md`). Plano
sem esta seção preenchida não é DONE.>
