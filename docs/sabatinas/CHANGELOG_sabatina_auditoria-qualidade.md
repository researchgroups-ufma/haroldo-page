# Sabatina — Lacunas da auditoria de qualidade (SEO, segurança, imagens)

Auditoria feita em 2026-10-12 contra a produção (`https://haroldo-page.and-near.workers.dev`,
`main` em `4a30abb`), com Lighthouse 13.5.0 (Edge headless, mobile e desktop, 10 rotas) e
inspeção por `curl` das 20 rotas do sitemap.

**Resultado do Lighthouse:** Performance 91–100 no mobile e 100 no desktop; Acessibilidade 100;
Boas práticas 100; SEO 66–69. A única auditoria de SEO reprovada é `is-crawlable`, efeito
deliberado do `Disallow: /` e do `X-Robots-Tag: noindex` até a Q-05. LCP mobile de 1,3 a 2,2 s,
TBT 0 ms. Uma CLS de 0,18 em `/sobre/` e `/publicacoes/` (mobile) não se repetiu em duas rodadas
novas de cada página. A 404 não é auditável pelo Lighthouse (`ERRORED_DOCUMENT_REQUEST` com
status 404, esperado).

**Lacunas medidas** (cada uma com a prova da auditoria):

| #   | Lacuna                                                                                                                          | Prova                                                                                                       |
| --- | ------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| L-1 | `/admin` sem `noindex` próprio: fica indexável quando o bloqueio global sair                                                    | `curl -sI /admin/index.html` só traz o `x-robots-tag` do bloco `/*`; o HTML não tem `<meta name="robots">`  |
| L-2 | Meta description igual em todas as 20 rotas (um texto PT, um EN)                                                                | levantamento por `curl` das rotas do sitemap                                                                |
| L-3 | Sem Open Graph nem Twitter card                                                                                                 | nenhum `og:`/`twitter:` no `<head>`; já é RF-30                                                             |
| L-4 | Sem dados estruturados (JSON-LD)                                                                                                | nenhum `application/ld+json`; a Q-01 cita JSON-LD, nenhum RF pede                                           |
| L-5 | Imagens de `/uploads` em JPEG cru, sem `srcset`; 33 `<img>` sem `width`/`height`                                                | `image-delivery-insight`: ~123 KiB; `profile.jpg` tem 140 KB (960×1280) e aparece com 144–176 px no celular |
| L-6 | Nenhum cabeçalho de segurança (HSTS, CSP, `X-Content-Type-Options`, `Referrer-Policy`, `frame-ancestors`, `Permissions-Policy`) | `curl -sI /`                                                                                                |
| L-7 | `/uploads/*` e `favicon.svg` com `Cache-Control: max-age=0, must-revalidate`                                                    | `curl -sI`                                                                                                  |
| L-8 | Sem `apple-touch-icon` e sem `favicon.ico` (404)                                                                                | `curl`                                                                                                      |
| L-9 | Conteúdo `[EXEMPLO]` de Extensão no sitemap; imagens `extensao-exemplo-*.jpg` ilustram Pesquisa e Ensino                        | sitemap de produção                                                                                         |

**Correção de um achado da auditoria:** `http://haroldo-page.and-near.workers.dev/` responde 200
pelo `curl`, mas o TLD `.dev` está na lista de pré-carga do HSTS dos navegadores, que nunca usam
`http://` nele. Não é lacuna hoje; volta a ser no domínio próprio (Q-05), onde "Always Use HTTPS" e
HSTS entram no roteiro da migração.

## Decisão 1 — `og:image` fixa para o site todo

**Data:** 2026-10-12
**Questão:** qual imagem aparece quando alguém compartilha um link do site? (pendente desde
2026-10-02, pauta da fase 5)
**Decisão:** uma imagem só, 1200×630, com nome, cargo e UFMA, gerada uma vez e versionada no
repositório. Toda página usa a mesma.
**Justificativa:** escolha do stakeholder; sem dependência nova nem custo de build. Descartados:
imagem por página gerada no build (exige gerador e alonga o build) e imagem escolhida no painel
(mexe no schema e dá trabalho ao professor).
**Impacto no PRD:** RF-30 ganha a regra da imagem fixa.

## Decisão 2 — Meta description pelo dicionário e pelo campo existente

**Data:** 2026-10-12
**Questão:** de onde vem a meta description de cada página (L-2)?
**Decisão:** as páginas fixas (Home, Sobre, Pesquisa, Publicações, Ensino, Extensão e as 404)
ganham texto próprio em `src/i18n/pt.ts` e `src/i18n/en.ts`. Disciplina e item de Extensão usam o
início do campo de texto que já existe (ementa ou resumo), cortado em cerca de 155 caracteres sem
partir palavra; sem esse campo, cai no texto da página-mãe. O schema não muda.
**Justificativa:** escolha do stakeholder; nada novo para o professor preencher. Descartado: campo
"Resumo para buscadores" no painel (mexe no schema, na paridade Tina/Zod e no manual).
**Impacto no PRD:** RF-30 ganha a regra da description por página.

## Decisão 3 — Imagens otimizadas no build, com sharp

**Data:** 2026-10-12
**Questão:** como otimizar as imagens enviadas pelo painel (L-5)?
**Decisão:** o build gera, para cada imagem de `public/uploads/` que o site exibe, variantes WebP
em poucas larguras e lê as dimensões do original. As páginas passam a usar `srcset`/`sizes` com
`width` e `height`. O original continua servido. O painel e o caminho gravado no conteúdo não mudam.
**Justificativa:** escolha do stakeholder; funciona já, sem domínio, a custo zero. Descartados: a
transformação de imagem da Cloudflare (só com domínio próprio na zona, cota mensal) e só gravar as
dimensões (resolve CLS mas não traz a economia).
**Impacto no PRD:** §12 da fase 5, item "Otimização de imagens", ganha o como; §7.2 se entrar
dependência nova (o `sharp` já está no projeto, com exceção de auditoria datada no ADR-0010).

**Nota de 2026-10-19 (decisão do dono do produto, PRD v0.1.81):** GIF enviado pelo painel tem de
continuar animado. O Tina aceita GIF (lista padrão `image/*`, sem `media.accept` no
`tina/config.ts`), e um teste local com um GIF na capa de Relatividade Geral mostrou que hoje ele
anima, porque o `<img>` serve o original. O `sharp` sem `animated: true` lê só o primeiro quadro
(medido no 0.35.4: `resize().webp()` de um WebP de dois quadros sai com um quadro), então a variante
sairia parada. Por isso imagem animada (GIF, ou WebP com `metadata().pages > 1`) fica sem variante
e é servida original. PNG animado (APNG) não é detectado pelo `sharp` e fica de fora. Detalhe nos
planos 080 e 081.

## Decisão 4 — Sem Lighthouse no CI

**Data:** 2026-10-12
**Questão:** o Lighthouse deve rodar no CI e reprovar quando a nota cair?
**Decisão:** não. M-04 e M-05 seguem medidas por **execução manual registrada**, que o §3.3 já
admite ("Lighthouse CI ou execução manual registrada").
**Justificativa:** escolha do stakeholder.
**Impacto no PRD:** nenhum.

## Decisão 5 — Escopo dos planos e o que fica de fora

**Data:** 2026-10-12
**Questão:** quais lacunas viram plano?
**Decisão:** o critério do stakeholder é "o que melhora objetivamente a qualidade". Entram, em
ordem de importância:

1. **L-1:** `/admin` fora da indexação, com `Disallow: /admin/` no `robots.txt` e
   `X-Robots-Tag: noindex` em `/admin/*` no `_headers`. Feito já, para valer quando o bloqueio
   global sair.
2. **L-2:** description por página (Decisão 2).
3. **L-3:** Open Graph e Twitter card com a imagem fixa (Decisão 1).
4. **L-4:** JSON-LD `Person` (nome, cargo, vínculo com a UFMA, `sameAs` com ORCID e Lattes) e
   `WebSite`. `ScholarlyArticle` e `Course` ficam de fora, porque não dão resultado rico para uma
   lista de links externos.
5. **L-5:** imagens (Decisão 3).
6. **L-6 e L-7:** cabeçalhos de segurança no `_headers` (`X-Content-Type-Options`,
   `Referrer-Policy`, `Permissions-Policy`, `frame-ancestors`/`X-Frame-Options` e uma CSP para o
   site público, com o `/admin` do Tina fora dela) e cache com revalidação curta para `/uploads/*`
   e ícones. HSTS fica para o domínio próprio.
7. **L-8:** `apple-touch-icon` e `favicon.ico` derivados do `favicon.svg`.
8. **Indexação no domínio próprio:** os passos 5 e 6 do roteiro do item 5 do
   `plans/fase-5-polimento-e-entrega/README.md`, mais HSTS e "Always Use HTTPS". **Bloqueado pela
   Q-05.** Pré-condição: nenhum conteúdo de exemplo publicado (L-9). A pré-condição é verificada,
   não implementada: trocar o conteúdo é trabalho do professor.

Ficam de fora: feed RSS (já é o RF-34, COULD), analytics (pede revisão da §9/LGPD e é decisão de
produto), web manifest e `security.txt` (sem ganho mensurável para este site), `<lastmod>` no
sitemap (a data teria de vir do Git, e o clone raso do Workers Builds a tornaria errada), o 307 da
barra final (comportamento da plataforma, compensado pelo canonical) e verificador de links no CI
(fora do pedido depois da Decisão 4).
**Justificativa:** decisão do orquestrador sobre o critério do stakeholder; a lista acima é
apresentada a ele junto com os planos.
**Impacto no PRD:** RF-30 emendado (L-1, L-2, L-3); RF novo para JSON-LD e outro para os
cabeçalhos de segurança, ou emenda à §9; §12 da fase 5 com os itens novos.

## Decisão 6 — Origem da description da disciplina e da Extensão (Q-10)

**Data:** 2026-10-12
**Questão:** a Decisão 2 fala em "ementa ou resumo", mas `extensao` não tem `resumo` (só `corpo`,
obrigatório) e a disciplina tem dois campos possíveis, `descricao` e `ementa`, ambos opcionais.
De onde sai a description, e o que vale na rota EN?
**Decisão:** disciplina pela `descricao` e, sem ela, pela `ementa`; item de Extensão pelo início do
`corpo`, sem Markdown. Sem nenhum desses, vale o texto da página-mãe. Na rota EN, vale o campo do
grupo `en` quando existir; sem ele, o texto **em inglês** da página-mãe, nunca o texto PT do item.
**Justificativa:** escolha do stakeholder; a `descricao` já é o resumo curto escrito para a listagem,
e um snippet em português numa página `lang="en"` seria pior que um genérico em inglês.
**Impacto no PRD:** resolve a Q-10; RF-30.

## Decisão 7 — JSON-LD só na Home (Q-11)

**Data:** 2026-10-12
**Questão:** em que rotas entra o JSON-LD `Person` + `WebSite`?
**Decisão:** só na Home, PT (`/`) e EN (`/en/`), os dois tipos juntos. Cargo e instituição vêm do
grupo `en` do perfil quando houver; sem ele, do PT (RN-06).
**Justificativa:** escolha do stakeholder; num site pessoal a Home é a página da pessoa.
Descartados: `Person` na Sobre como `ProfilePage` e os dois em todas as rotas (redundante).
**Impacto no PRD:** resolve a Q-11; RF-38.

## Decisão 8 — `/admin` só com `noindex`, sem `Disallow` (corrige a Decisão 5, item 1)

**Data:** 2026-10-12
**Questão:** levantada pela revisão do PRD: `Disallow: /admin/` impede o buscador de ler o
`X-Robots-Tag: noindex`, e a URL pode ser indexada sem conteúdo se houver link externo para ela.
**Decisão:** o `/admin` sai da indexação **só** pelo `X-Robots-Tag: noindex` num bloco `/admin/*`
próprio do `_headers`, que fica depois que o `/*` sair. O `robots.txt` não ganha `Disallow: /admin/`.
**Justificativa:** decisão do orquestrador; é a recomendação documentada do Google (o `noindex`
precisa ser rastreável para valer). O item 1 da Decisão 5 estava errado.
**Impacto no PRD:** RF-30 e §12 da fase 5.

## Decisão 9 — Valores técnicos que a sabatina não fixou

**Data:** 2026-10-12
**Questão:** a revisão do PRD listou valores em aberto que não são de produto.
**Decisão** (do orquestrador, valores-padrão de mercado; o plano pode trocá-los se a medição
mostrar defeito, registrando na Evidência):

- `twitter:card` = `summary_large_image`.
- Imagem fixa em `public/og.png`, 1200×630, PNG.
- `Referrer-Policy: strict-origin-when-cross-origin`.
- `Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=(), usb=()`.
- Proteção contra moldura: `Content-Security-Policy: frame-ancestors 'none'` **e**
  `X-Frame-Options: DENY`, por cabeçalho (o `frame-ancestors` é ignorado em `<meta>`). Vale para o
  site público e para o `/admin`: o painel não emoldura o site, porque não há edição visual (D-02).
- CSP do site público pela opção `security.csp` do Astro 7 (hashes dos scripts inline), com o
  `/admin` fora dela. Armadilha medida na auditoria: o realce de código (Shiki) usa `style="..."`, e
  com hash em `style-src` o `'unsafe-inline'` deixa de valer; o plano mede no navegador antes de
  escolher.
- `X-Content-Type-Options: nosniff`.
- `/uploads/*`, `favicon.svg`, `favicon.ico`, `apple-touch-icon.png` e `og.png`:
  `Cache-Control: public, max-age=3600, must-revalidate` (o nome não tem hash: uma imagem trocada
  pelo professor com o mesmo nome aparece em até uma hora).
- `public/apple-touch-icon.png` 180×180 e `public/favicon.ico` com 32×32 e 16×16, derivados do
  `favicon.svg`; o `<head>` ganha `<link rel="apple-touch-icon">`.
- Description com no máximo 160 caracteres, cortada em fim de palavra, com reticências quando
  cortada.
  **Justificativa:** são escolhas técnicas sem efeito de produto.
  **Impacto no PRD:** RF-30, RNF-17 e RNF-18 podem citar estes valores.
