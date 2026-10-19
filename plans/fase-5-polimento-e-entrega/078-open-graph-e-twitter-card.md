# Plano 078 — Open Graph, Twitter card e a imagem fixa `public/og.png` (RF-30, Decisões 1 e 9)

**Status:** TODO
**RFs cobertos:** **RF-30** (Open Graph e Twitter card com uma `og:image` fixa); sabatina "Lacunas da auditoria de qualidade", Decisões 1 e 9; §12 fase 5, item "SEO completo" (fecha com 075, 076 e 077 — o último dos quatro marca a caixa)
**Depende de:** nenhum em código; a ordem o põe depois do 077 para o `og:description` já sair por página
**Modelo recomendado:** sonnet
**Agente recomendado:** implementer
**Executável por:** agente; a aprovação visual da imagem (orquestrador + stakeholder) e a conferência em produção são do orquestrador
**PRD:** `S:\Projetos\academic_page\haroldo\PRD.md`
**Projeto:** `S:\Projetos\academic_page\haroldo`

## Objetivo

Toda página traz `og:title`, `og:type`, `og:url`, `og:description`, `og:image` e
`twitter:card=summary_large_image`, com o `og:image` apontando, por URL absoluta, para a mesma
`public/og.png` (PNG 1200×630 com nome, cargo e UFMA), gerada uma vez, versionada, e com o método de
geração registrado na Evidência para poder ser refeita.

## Arquivos afetados

- `public/og.png` — arquivo novo, binário
- `src/layouts/BaseLayout.astro` — as seis `<meta>` no `<head>`; cabeçalho §10.1 (a nota "só o Open Graph fica para a fase 5" sai)
- `tests/dist/site-gerado.test.ts` — `describe` novo

> O executor não toca em arquivo fora desta lista. Se precisar, para e reporta. `Status:` fica `TODO`.
> Não commite. O HTML-modelo da imagem e o comando de captura ficam no scratchpad e entram **por
> inteiro** na Evidência; não vão para o repositório.

## Contexto necessário

**Decisão 1:** uma imagem só, 1200×630, com nome, cargo e UFMA, gerada uma vez e versionada; toda
página usa a mesma, inclusive as EN (o texto da imagem fica em português). **Decisão 9:**
`twitter:card` = `summary_large_image`; imagem em `public/og.png`, PNG 1200×630.

**Os valores das tags**, no `<head>` do `BaseLayout.astro` (depois do `<meta name="description">`,
linha 86); as variáveis já existem no frontmatter:
- `<meta property="og:title" content={pageTitle} />`
- `<meta property="og:type" content="website" />` — valor técnico, igual em toda página
- `<meta property="og:url" content={canonical} />` — **só quando há canonical** (ver abaixo)
- `<meta property="og:description" content={description} />`
- `<meta property="og:image" content={absolute('/og.png')} />` — `absolute` é a função da linha 69, a
  partir de `siteConfig.siteUrl`; muda sozinha quando a Q-05 trocar o domínio
- `<meta name="twitter:card" content="summary_large_image" />` — `name`, não `property`

O Twitter/X lê `og:title`, `og:description` e `og:image` quando faltam as `twitter:*`; não
acrescente outras tags.

**Interpretação a confirmar pelo orquestrador antes do despacho — `og:url` nas 404.** O RF-30 diz
"dada qualquer rota". As duas 404 não têm canonical (decisão 9 do fatiamento da fase 4: a 404 é
servida em qualquer caminho), e o `og:url` é a URL canônica do objeto. O plano segue o precedente:
**as 404 levam as outras cinco tags e não levam `og:url`**, e o teste afirma as duas coisas. Se o
orquestrador preferir outra leitura, ele a escreve aqui antes de despachar.

**A imagem.** Conteúdo (proposta do fatiamento; o stakeholder aprova a imagem antes do DONE):
- linha 1, grande: `Haroldo Lima Junior` (`siteConfig.shortTitle`, `src/lib/config.ts:42`);
- linha 2: `Professor Adjunto A · Departamento de Física` (`content/perfil/index.md`, `cargo` e
  `departamento`);
- linha 3: `Universidade Federal do Maranhão (UFMA)`.

Visual pela identidade (`docs/identidade-visual.md` §2 e §3; tokens em `src/styles/global.css:20-32`):
fundo `#efedea` (`papel`), texto `#111112` (`tinta`), linhas 2 e 3 em `#5a5754` (`secundario`);
linha 1 em Archivo peso 300 com o espaçamento do `text-display-1` (`letter-spacing: -0.035em`,
`line-height: 1`), cerca de 96 px; linhas 2 e 3 em `'Helvetica Neue', Helvetica, Arial, sans-serif`,
cerca de 32 px; alinhado à esquerda, margem de 80 px, bloco de texto na metade de baixo.

**Método de geração** (o `sharp`/librsvg usaria fontes do sistema, não a Archivo do `@fontsource`;
por isso a captura é feita por navegador headless):
1. Um HTML no scratchpad, 1200×630, `margin: 0`, com a Archivo 300 **embutida em base64** num
   `@font-face` (`src: url(data:font/woff2;base64,…)`), lida de
   `node_modules/@fontsource/archivo/files/archivo-latin-300-normal.woff2`. Não aponte para
   `file:///`: o Chromium bloqueia fonte de `file://` por CORS e cairia em Arial sem avisar.
2. Captura com o Edge headless desta máquina (`C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe`,
   que existe; o executor roda o comando, isto não é verificação de navegador):
   `& $edge --headless=new --disable-gpu --hide-scrollbars --force-device-scale-factor=1 --window-size=1200,630 --virtual-time-budget=5000 --screenshot="<scratch>\og.png" "file:///<scratch>/og.html"`
3. Confira as dimensões lendo o cabeçalho PNG (bytes 16–23 do IHDR, largura e altura big-endian) e
   copie para `public/og.png`. Se não sair 1200×630, pare e reporte.
4. Na Evidência: o HTML inteiro (com o base64 abreviado para os 40 primeiros caracteres e a
   indicação do arquivo de origem), o comando exato, a saída das dimensões e o tamanho em bytes.

**Armadilhas:**
- O `robots.txt` está em `Disallow: /` até a Q-05, e o robô do X/Twitter respeita o `robots.txt`: a
  prévia de compartilhamento em validadores de terceiros **pode não aparecer** enquanto isso. A
  conferência deste plano é a das tags e a da imagem servida; a prévia real fica para o plano 085.
- `tests/dist/i18n.test.ts` (M-07) lê `meta[content]`: o `og:title` e o `og:description` das rotas
  EN não podem trazer valor do dicionário `pt`. Hoje eles repetem `<title>` e description, que já
  passam.
- O Astro escapa atributo com `&amp;`/`&quot;` (`node_modules/astro/dist/runtime/server/render/util.js:14`).

**Asserções** (`describe('Open Graph e Twitter card (RF-30, Decisões 1 e 9)')`), sobre todo `.html`
fora de `admin/`, com o esperado vindo do próprio `<head>` só para os valores que espelham outra tag,
e de `siteConfig` para a imagem:
1. exatamente uma de cada: `og:title`, `og:type`, `og:description`, `og:image`, `twitter:card`;
2. `og:title` = texto do `<title>`; `og:description` = `content` do `<meta name="description">`;
   `og:type` = `website`; `twitter:card` = `summary_large_image`;
3. `og:image` = `new URL('/og.png', siteConfig.siteUrl).href` em todas;
4. fora das 404, exatamente um `og:url`, igual ao `href` do canonical; nas duas 404, nenhum `og:url`;
5. `dist/og.png` existe, começa pela assinatura PNG e o IHDR diz 1200×630.

**Regras de código:** `plans/fase-5-polimento-e-entrega/README.md`, seção "Regras de código".

## Passos

1. HTML-modelo, captura e conferência das dimensões; cópia para `public/og.png` → verify: comando e saída das dimensões colados.
2. As seis tags no `BaseLayout.astro` → verify: `npm run build:pipeline` colado.
3. Asserções 1–5 → verify: `npm run test:dist` colado.
4. Canário A: troque `og:image` por `absolute('/og.jpg')` e refaça o build → a asserção 3 reprova; desfaça e refaça → verify: saídas coladas.
5. Canário B: emita `og:url` também quando não há canonical (`canonical ?? ''`) e refaça o build → a asserção 4 reprova nas 404; desfaça e refaça → verify: saídas coladas.
6. O `<head>` de `/`, `/en/teaching/` e `/404.html` com as tags novas → verify: trecho colado.
7. Portão → verify: `npm run lint`, `npm run format:check`, `npm run test:coverage` colados.

**Do orquestrador:** antes do DONE, abrir `public/og.png` e mostrá-la ao stakeholder, registrando a
aprovação (ou as trocas pedidas, que reabrem o passo 1). Depois do push e do Workers Builds verde:
`curl.exe -sI https://haroldo-page.and-near.workers.dev/og.png` (200, `content-type: image/png`) e o
`<head>` de uma rota em produção, colados.

## Critérios de aceitação

- [ ] `public/og.png` PNG 1200×630, com método de geração completo na Evidência
- [ ] As seis tags no `<head>`, com os valores da lista; 404 sem `og:url` (interpretação confirmada pelo orquestrador)
- [ ] Asserções 1–5 verdes; canários A e B vermelhos
- [ ] Imagem aprovada pelo stakeholder (orquestrador)
- [ ] `og.png` servida em produção com 200 (orquestrador)
- [ ] `lint`, `format:check`, `test:coverage`, `build:pipeline`, `test:dist` verdes, com saída colada

## Evidência

<Preenchida pelo executor, com saída literal capturada em arquivo (ver `plans/DESPACHO.md`). Plano
sem esta seção preenchida não é DONE.>
