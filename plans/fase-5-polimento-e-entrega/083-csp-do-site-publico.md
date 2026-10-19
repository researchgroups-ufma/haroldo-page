# Plano 083 — CSP do site público pela opção `security.csp` do Astro (RNF-17 parte 2, Decisão 9)

**Status:** TODO
**RFs cobertos:** **RNF-17** (CSP do site público, com o `/admin` fora dela; fecha o RNF com o 082); sabatina "Lacunas da auditoria de qualidade", Decisão 5, item 6, e Decisão 9; §12 fase 5, item "Cabeçalhos de segurança e cache" (fecha com 082 e 084)
**Depende de:** nenhum em código; o 082 traz a parte por cabeçalho do mesmo RNF
**Modelo recomendado:** sonnet
**Agente recomendado:** implementer
**Executável por:** agente + orquestrador (a medição no navegador decide o ramo da política de estilo)
**PRD:** `S:\Projetos\academic_page\haroldo\PRD.md`
**Projeto:** `S:\Projetos\academic_page\haroldo`

## Objetivo

Toda página pública sai com a `<meta http-equiv="content-security-policy">` que o Astro gera, com
hash de cada script e estilo inline; o `/admin` fica fora dela. A política de estilo (ramo A ou B,
abaixo) é escolhida pela medição no navegador, e nenhuma rota pública mostra violação de CSP no
console.

## Arquivos afetados

- `astro.config.mjs` — chave `security.csp` e cabeçalho §10.1
- `tests/dist/site-gerado.test.ts` — `describe` novo
- **Só no ramo S2** (ver abaixo): `src/layouts/BaseLayout.astro` e um arquivo novo `src/lib/page-reveal.ts`

> O executor não toca em arquivo fora desta lista. Se precisar, para e reporta. `Status:` fica `TODO`.
> Não commite. **`public/_headers` não muda** (a parte por cabeçalho é o 082).

## Contexto necessário

**Decisão 9** (`docs/sabatinas/CHANGELOG_sabatina_auditoria-qualidade.md`): CSP do site público pela
opção `security.csp` do Astro 7 (hashes dos scripts inline), com o `/admin` fora dela. Armadilha
medida na auditoria: o realce de código (Shiki) usa `style="..."`, e com hash em `style-src` o
`'unsafe-inline'` deixa de valer; **o plano mede no navegador antes de escolher**. O plano pode trocar
um valor se a medição mostrar defeito, registrando na Evidência.

**Medido em 2026-10-12:** o `dist/` tem 76 `<script type="module">` inline, 23 `<script>` inline e
blocos `<style>` inline. O Shiki (`<Code>` de `astro:components` em `src/components/ScriptPanel.astro:111`,
tema `src/lib/code-theme.ts`) emite `style="color:#…"` (42+32+10 ocorrências) e
`style="background-color:…; overflow-x: auto;"` no `<pre>`. O resto do JavaScript do site muda estilo
pela CSSOM (`el.style.x = …`, `setProperty`: `BaseLayout.astro:147`, `ScrollBar.astro:123-124`,
`course-tabs.ts:48-49`, `publications-accordion.ts:129-166`), o que a CSP não bloqueia.

**Como o Astro 7.2.10 monta a política** (`node_modules/astro/dist/runtime/server/render/csp.js`;
schema em `node_modules/astro/dist/core/config/schemas/base.js:244-259` e
`node_modules/astro/dist/core/csp/config.js`): `script-src 'self'` + hashes e `style-src 'self'` +
hashes, numa `<meta>` por página; `algorithm` padrão `SHA-256`. Um recurso com
`kind: 'attribute'` vai para `style-src-attr`, que vale só para atributo `style` e tem precedência
sobre `style-src` nele (o tipo, `node_modules/astro/dist/types/public/config.d.ts:946`, cita o Shiki
como o caso de uso). A CSP não vale em `astro dev`: meça sobre o build.

**Os dois ramos de estilo** (só estes; um terceiro é parar e reportar):
- **Ramo A:** `security: { csp: true }`. Esperado pela especificação: o atributo `style` do Shiki é
  bloqueado e o código da disciplina perde a cor.
- **Ramo B:** `security: { csp: { styleDirective: { resources: [{ resource: "'unsafe-inline'", kind: 'attribute' }] } } }`.
  Esperado: `style-src 'self' <hashes>` para `<style>` e `style-src-attr 'unsafe-inline'` para os
  atributos.

Escolha: o mais estrito que passar na medição do orquestrador. Se A passar sem violação e com o
código colorido, fica A. Se A falhar só por `style-src-attr`/atributo `style`, fica B. Se B também
mostrar violação, pare e reporte.

**Fora do escopo:** diretivas além de `script-src`/`style-src` (`default-src`, `object-src`,
`base-uri`) — a sabatina não as fixou; não acrescente. **Não** ponha `frame-ancestors` em
`security.csp.directives`: na `<meta>` ele é ignorado com aviso no console, e já está no cabeçalho
(082).

**Ramo S2, só se um script inline ficar sem hash.** O `<script is:inline>` do `pagereveal`
(`BaseLayout.astro:96-101`) é o candidato: se a asserção 2 abaixo mostrar o hash dele ausente da
`<meta>`, mova o texto do script para uma constante exportada de `src/lib/page-reveal.ts`, emita-o no
`BaseLayout` com `<script is:inline set:html={PAGE_REVEAL_SCRIPT} />` (constante do código, não
conteúdo do professor) e some o hash calculado com `node:crypto` (`sha256`, base64) a
`security.csp.scriptDirective.hashes` no `astro.config.mjs` (que já importa `.ts` de `src/lib/`; o
arquivo novo não pode importar `src/lib/config.ts`). Qualquer outro script sem hash: pare e reporte.

**Asserções** (`describe('CSP do site público (RNF-17, Decisão 9)')`):
1. todo `.html` de `dist/` fora de `admin/` tem exatamente uma
   `<meta http-equiv="content-security-policy">`; `dist/admin/index.html` não tem nenhuma;
2. para cada `<script>` inline executável (sem `src`; sem `type` ou com `type="module"` —
   `application/ld+json` do plano 079 fica de fora) e cada `<style>` inline, o
   `sha256-<base64>` do conteúdo exato entre as tags, calculado pelo teste com `node:crypto`, aparece
   na `<meta>` da mesma página (fonte independente: o próprio texto do script, não a política);
3. a política não contém `'unsafe-inline'` em `script-src` nem em `style-src`; no ramo B,
   contém `style-src-attr 'unsafe-inline'`;
4. a política não contém `frame-ancestors`.

## Passos

1. Ramo A no `astro.config.mjs` → verify: `npm run build:pipeline` colado; o `content` da `<meta>` de `dist/ensino/<slug>/index.html` colado.
2. Asserções 1–4 sobre o ramo A → verify: `npm run test:dist` colado. Se a 2 reprovar, aplique o ramo S2 e repita.
3. Copie o `dist/` do ramo A para `<scratch>\083\ramo-a\dist` (para a medição do orquestrador) → verify: `Get-ChildItem` colado.
4. Ramo B no `astro.config.mjs` → verify: `npm run build:pipeline` e `npm run test:dist` colados; o `content` da mesma `<meta>` colado.
5. Canário: no `dist/` do ramo B, acrescente um caractere dentro do `<script is:inline>` de `dist/index.html` → a asserção 2 reprova; refaça o build → verify: saídas coladas.
6. Portão com o ramo B → verify: `npm run lint`, `npm run format:check`, `npm run test:coverage` colados.

O executor entrega **no ramo B**, com a cópia do ramo A no scratchpad, e diz na Evidência que a
escolha final é do orquestrador.

**Do orquestrador — a medição que escolhe o ramo** (Vivaldi, DevTools aberto, console limpo):
1. Sirva o ramo A: `~/anaconda3/python.exe -m http.server 4322 -d <scratch>\083\ramo-a\dist`; o ramo B
   por `npx astro preview`. Um servidor por vez, e nenhum build enquanto servir.
2. Em cada um, abra: `/`, `/sobre/`, `/pesquisa/`, `/publicacoes/` (sanfona), `/ensino/`, uma
   disciplina com script (abas, botão copiar, código), `/extensao/`, uma postagem (carrossel), a 404
   (`/404.html` direto: o `http.server` não serve a 404 do site em URL inexistente) e
   `/en/teaching/<slug>/`. Navegue entre duas páginas para disparar a transição.
3. Registre, por ramo: as mensagens de CSP do console (texto transcrito) e se o código da disciplina
   está colorido. Escolha pela regra acima; se for A, devolva ao executor para trocar a configuração e
   repetir os passos 2, 5 e 6.
4. Depois do push: o mesmo roteiro curto em produção (`/`, uma disciplina, uma postagem), console sem
   violação.

## Critérios de aceitação

- [ ] `security.csp` no `astro.config.mjs`, no ramo escolhido pela medição, com a medição dos dois ramos transcrita
- [ ] Asserções 1–4 verdes no ramo final; canário vermelho
- [ ] `/admin/index.html` sem CSP de conteúdo
- [ ] Nenhuma violação de CSP no console nas rotas da lista, em local e em produção; código da disciplina colorido (orquestrador)
- [ ] `lint`, `format:check`, `test:coverage`, `build:pipeline`, `test:dist` verdes, com saída colada

## Evidência

<Preenchida pelo executor, com saída literal capturada em arquivo (ver `plans/DESPACHO.md`). Plano
sem esta seção preenchida não é DONE.>
