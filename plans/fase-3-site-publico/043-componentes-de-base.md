# Plano 043 — Componentes de base: cabeçalho de página, pílula, tag e link externo

**Status:** DONE
**RFs cobertos:** item "Identidade visual aplicada" do §12 (com o 036); RF-32 (movimento de
entrada), RNF-15, §8.3 (links externos identificados)
**Depende de:** planos 036 (tokens e classes de movimento), 037 (dicionário)
**Modelo recomendado:** sonnet
**Agente recomendado:** implementer
**Executável por:** agente (código) + **orquestrador** (verificação no navegador)
**PRD:** `S:\Projetos\academic_page\haroldo\PRD.md`
**Projeto:** `S:\Projetos\academic_page\haroldo`

## Objetivo

Quatro componentes reutilizados por todas as rotas, exatamente como a identidade os descreve: o
cabeçalho de página (rubrica + `<h1>` + régua forte, com o único movimento orquestrado do site), o
botão pílula, a tag e o link externo acessível.

## Arquivos afetados

- `src/components/PageHeader.astro` — novo
- `src/components/PillButton.astro` — novo
- `src/components/Tag.astro` — novo
- `src/components/ExternalLink.astro` — novo

> O executor não toca em arquivo fora desta lista. Se precisar, para e reporta.
> `Status:` fica `TODO`. Não commite. O plano 042 pode estar rodando em paralelo
> (`src/layouts/BaseLayout.astro`, `SiteHeader.astro`, `SiteFooter.astro`, `src/pages/index.astro`,
> e o `git rm` de `src/components/.gitkeep`): não edite esses arquivos.

## Contexto necessário

**Especificação:** `docs/identidade-visual.md` §5.3 (Botão pílula), §5.4 (Tag), §5.5 (Linha de
lista — a parte do link externo), §4 (réguas, raio) e §7 (Movimento). Leia inteiras. `ref/` não
existe para você.

**Regras herdadas:** seção "Regras de código que todo plano desta fase herda" em
`plans/fase-3-site-publico/README.md`.

**`PageHeader.astro`** — props: `eyebrow: string` (rubrica, `text-rotulo text-secundario`),
`title: string` (`<h1 class="text-display-1 titulo-entrada">`), slot nomeado `aside` opcional (coluna
direita a partir de `lg`, grade `7 / 5` colunas; abaixo empilha). Abaixo, a régua forte: um
elemento `<div aria-hidden="true" class="regua-entrada h-px bg-tinta">` de ponta a ponta. As classes
`regua-entrada` e `titulo-entrada` vêm do `global.css` (plano 036) e **só animam dentro de
`prefers-reduced-motion: no-preference`** — não acrescente animação aqui. Sem slot `aside`, o `<h1>`
ocupa a largura e não sobra coluna vazia.

**`PillButton.astro`** (§5.3) — props: `href: string`, `label: string`, `variant?: 'outline' |
'solid'` (default `outline`). É um `<a>`, não `<button>` (navega). Altura ≥ 48 px, borda 1 px
`--tinta`, `rounded-full`, texto à esquerda, disco de 32 px à direita com `›` (`aria-hidden`).
`outline`: fundo transparente, disco `bg-tinta text-papel`; hover `bg-bloco`. `solid`: fundo
`bg-tinta text-papel`, disco `bg-papel text-tinta` — **só** a 404 usa (§5.3). Transição de fundo
120 ms (§7).

**`Tag.astro`** (§5.4) — props: `variant: 'strong' | 'neutral' | 'solid'`, `dot?: boolean`,
`dashed?: boolean`; conteúdo por slot. `text-rotulo` com `padding: 0.4rem 0.7rem`. `strong`: borda
`--tinta`; `neutral`: borda `--regua`, texto `--secundario`; `solid`: fundo `--tinta`, texto
`--papel`. `dot`: marcador circular de 6 px `bg-tinta` antes do texto (`aria-hidden`). `dashed`:
borda tracejada `border-tracejado` — **nunca** carrega informação sozinha (2,52:1, §2 da identidade);
o texto da tag é quem diz. Mapa de uso, para a docstring: "Em andamento" = `strong` + `dot`;
"Concluído" = `neutral` + `dashed`; "Destaque" = `solid`. **Exceção de caixa:** as áreas de atuação
em Sobre são tags neutras em **caixa normal** (§6.2) — prop `normalCase?: boolean`, que troca
`text-rotulo` por `text-pequeno`.

**`ExternalLink.astro`** (§5.5, §8.3) — props: `href: string`, `class?: string`; conteúdo por slot.
Renderiza `<a href target="_blank" rel="noopener noreferrer">`, o slot, ` ↗` com `aria-hidden="true"`
e `<span class="sr-only">{pt.site.opensInNewTab}</span>`. Todo link externo das rotas (planos 044–050) usa este
componente. O rodapé do 042 foi escrito antes dele e fica com o link inline, com as mesmas regras —
não o altere aqui.

**Nenhum JS** neste plano.

**Onde ver os componentes antes de haver página:** não crie página de demonstração. A verificação
visual acontece quando as rotas os usarem; aqui a verificação é de HTML gerado com um **uso
temporário** em `src/pages/index.astro`, revertido ao final (passo 3). Como o 042 edita esse arquivo e a
reversão é `git checkout`, **este passo só roda com o trabalho do 042 já commitado** — senão o
`checkout` apagaria o trabalho do outro plano. Confira com `git status --short src/pages/index.astro`
(tem de sair vazio antes de começar); se não estiver, pule o passo 3 e declare-o como não rodado.

## Passos

1. Escrever os quatro componentes → verify: `npx astro check` com resumo colado.
2. Build → verify: `npm run build:pipeline` com saída do `astro check` e `astro build` colada.
3. Uso temporário: acrescente em `src/pages/index.astro` um `PageHeader` com `aside`, uma `PillButton` de cada variante, as três `Tag` (com `dot` e `dashed`) e um `ExternalLink`; `npx astro build`; cole `grep -o 'target="_blank" rel="noopener noreferrer"' dist/index.html`, `grep -o 'class="sr-only">[^<]*' dist/index.html` e `grep -c 'regua-entrada' dist/index.html` → verify: saídas coladas; o orquestrador abre `npx astro preview` em 360 e 1440, confere réguas, disco da pílula, tags e a animação da régua (e, com *Emulate prefers-reduced-motion: reduce*, a ausência dela), e transcreve. Reverta com `git checkout -- src/pages/index.astro` → verify: `git status --short src/pages` colado, vazio.
4. Portão → verify: `npm run lint`, `npm run format:check`, `npm run test:coverage` colados.

## Critérios de aceitação

- [x] Quatro componentes com as props e variantes listadas, texto de interface só via `src/i18n/pt.ts`
- [x] `PageHeader` usa `regua-entrada`/`titulo-entrada` e não declara animação própria
- [x] Link externo sempre com `target="_blank"`, `rel="noopener noreferrer"`, `↗` oculto do leitor de tela e texto "(abre em nova aba)"
- [x] Observado no navegador: régua se desenha e `<h1>` sobe com movimento; com `reduce`, nada anima e tudo está visível (ou o passo 3 declarado não rodado, com motivo) — **com ressalva, ver Evidência.** O caso `no-preference` foi observado de verdade (animação nomeada, com durações certas, rodando). O caso `reduce` foi verificado desligando em runtime, via CSSOM, o único bloco `@media (prefers-reduced-motion: no-preference)` do CSS entregue e observando o estado resultante (tudo visível, sem transform/animation) — e o revisor confirmou, por leitura do `global.css` entregue, que esse CSS corresponde ao que foi auditado, incluindo um dado que a auditoria não tinha citado: existe um bloco `@media (prefers-reduced-motion: reduce)` em `global.css:174-182` zerando `animation-duration`/`transition-duration` globalmente, redundante com o desligamento do bloco `no-preference`. O que **continua não feito**: a emulação de `reduce` pelo DevTools (a extensão do Chrome não expõe essa emulação nesta máquina) — dívida nomeada para o plano 053.
- [x] Uso temporário revertido
- [x] `astro check`, `lint`, `format:check`, `test:coverage` e `build:pipeline` verdes, com saída colada
- [x] Cabeçalho §10.1 e TSDoc de props, incluindo comportamento com prop ausente

## Evidência

**Status:** `DONE` — revisão aprovada no ciclo 2 (suíte autoritativa verde). Trabalho no commit
`dfdc0a3`; promovido pelo orquestrador, que atualiza `PRD.md` (§0, §12) e os dois índices de plano.

### Passos 1 e 2 — substituídos pela execução autoritativa

As saídas originalmente coladas aqui (`npx astro check` e `npm run build:pipeline`, rodadas em
2026-09-17 21:05) descreviam a versão dos quatro componentes **anterior** ao `npx prettier --write`
do passo 4 (o `prettier-plugin-tailwindcss` reordena classes no atributo `class`/`class:list` —
sem efeito de cascata, mas o arquivo mudou). Colar aquelas saídas como evidência dos arquivos
entregues violaria a regra 3 do portão da fase ("diff/saída colado é gerado por comando depois da
última edição dos arquivos que ele descreve"). Substituídas pela execução autoritativa abaixo, que
roda sobre os quatro arquivos já formatados:

```
Execução autoritativa — triage-runner, 2026-09-17 21:43
Rodada POSTERIOR às três correções de citação do ciclo 1, sobre os bytes efetivamente
entregues. Substitui tanto as saídas dos passos 1 e 2 (pré-formatação) quanto a rodada
autoritativa de 21:27 (pré-correção de citações).

Higiene prévia: portas 9000 e 4321 livres (Get-NetTCPConnection). Dois processos node
efêmeros (PIDs 13732, 14684) sumiram antes da inspeção; não seguravam porta alguma.

npm ci                          -> PASSOU. added 1515 packages, audited 1516 packages in 31s.
                                   git status --short package-lock.json -> vazio (lock intacto).
                                   warning pré-existente: prebuild-install@7.1.3 deprecated.

npm audit --audit-level=high    -> PASSOU (exit 0). 8 vulnerabilidades, todas moderate:
                                   qs 2.2.5-6.15.3 (via body-parser -> express) e
                                   react-router 6.0.0-7.17.0 (via tinacms/@tinacms/app/@tinacms/cli).
                                   Abaixo do limiar high do ADR-0010.

npm run lint                    -> PASSOU (exit 0, sem saída)

npm run format:check            -> PASSOU
                                   Checking formatting...
                                   All matched files use Prettier code style!

npm run test:coverage           -> PASSOU
                                    RUN  v4.1.11 S:/Projetos/academic_page/haroldo
                                         Coverage enabled with v8

                                    Test Files  14 passed (14)
                                         Tests  236 passed (236)
                                      Start at  21:43:01
                                      Duration  2.32s

                                    % Coverage report from v8
                                   -------------------|---------|----------|---------|---------|
                                   File               | % Stmts | % Branch | % Funcs | % Lines |
                                   -------------------|---------|----------|---------|---------|
                                   All files          |     100 |    98.88 |     100 |     100 |
                                    src/lib           |     100 |    98.83 |     100 |     100 |
                                     navigation.ts    |     100 |    83.33 |     100 |     100 |
                                   -------------------|---------|----------|---------|---------|
                                   Statements   : 100% ( 179/179 )
                                   Branches     : 98.88% ( 89/90 )
                                   Functions    : 100% ( 53/53 )
                                   Lines        : 100% ( 162/162 )
                                   Única linha não coberta: src/lib/navigation.ts:51, pré-existente
                                   de plano anterior. Componentes .astro de marcação não entram na
                                   cobertura do Vitest.

npm run build:pipeline          -> PASSOU
                                   vitest run tests/content:
                                    Test Files  4 passed (4)
                                         Tests  108 passed (108)
                                      Start at  21:43:10
                                      Duration  1.18s
                                   Tina build complete.
                                   astro check: Result (42 files) - 0 errors, 0 warnings, 0 hints
                                   astro build: 1 page(s) built in 1.26s. Complete!

Armadilha dos planos 020/021 verificada: grep -iE "\[error\]|\[warn\]|deprecat" sobre a saída
COMPLETA do build:pipeline salva em arquivo -> nenhuma ocorrência (grep exit 1).

git status final idêntico ao inicial: a verificação não tocou arquivo algum.

Comparação com a rodada de 21:27 (pré-correção): IDÊNTICA item a item — mesma contagem de
pacotes (1515), mesmas 8 moderate, mesmos 14/236 testes com a mesma cobertura e a mesma linha
descoberta, mesmos 4/108 de conteúdo, mesmos 42 arquivos no astro check com 0/0/0. Esperado:
as três edições são linhas de comentário dentro de bloco /** */ no frontmatter — nenhum arquivo
novo, nenhum .ts, nenhum conteúdo, nenhuma dependência.
```

Depois da rodada de 21:27, o revisor pediu três correções de citação de seção em três componentes
(nenhuma mudança de comportamento — ver "Correções da revisão, ciclo 1" abaixo; `PillButton.astro`
não foi tocado). Eu tinha rodado `npx astro check`, `npm run lint` e `npm run format:check` sobre
os bytes já corrigidos e narrado o resultado aqui, sem colar — o registro da revisão do ciclo 2 é
que nada se declara pronto por relato. **A narrativa foi substituída** pela rodada autoritativa de
**21:43** colada acima, que roda sobre os mesmos bytes corrigidos (posterior às três correções) e
é idêntica item a item à de 21:27 — esperado, já que as correções são só três linhas de comentário
no frontmatter. É essa rodada de 21:43, não a narrativa, que vale como evidência.

### Passo 3 — uso temporário, `npx astro build` e greps

`git status --short src/pages/index.astro` saiu vazio antes de editar (plano 042 já commitado em
`8ce4a72`). Acrescentei em `src/pages/index.astro`, entre comentários
`<!-- USO TEMPORÁRIO (plano 043, passo 3) -->`/`<!-- FIM DO USO TEMPORÁRIO -->`: `PageHeader` com
slot `aside`, duas `PillButton` (`outline` e `solid`), três `Tag` (`strong`+`dot`, `neutral`+`dashed`,
`solid`), uma `ExternalLink`. `npx astro build` terminou com `1 page(s) built`, `Complete!`, sem erros.

```
$ grep -o 'target="_blank" rel="noopener noreferrer"' dist/index.html
target="_blank" rel="noopener noreferrer"
target="_blank" rel="noopener noreferrer"
target="_blank" rel="noopener noreferrer"
```
(1 do `ExternalLink` temporário + 2 de links reais preenchidos em `perfil.links` no rodapé —
Lattes e ORCID.)

```
$ grep -o 'class="sr-only">[^<]*' dist/index.html
class="sr-only">(abre em nova aba)
```
(Só 1: os dois spans do rodapé, escrito no plano 042, carregam `data-astro-cid-nns7i3if` entre
`class="sr-only"` e `>` — estilo `scoped` do `SiteFooter.astro` — e por isso não casam com o
padrão exato pedido pelo plano. O orquestrador reproduziu o grep e confirmou esta explicação
contra o artefato: `grep -o 'class="sr-only"[^>]*>[^<]*' dist/index.html` dá as 3 ocorrências.)

```
$ grep -c 'regua-entrada' dist/index.html
1
```

Revertido com `git checkout -- src/pages/index.astro`. `git status --short src/pages` depois:
saída vazia (confirmado duas vezes — antes da verificação no navegador do orquestrador e de novo
depois, ao retomar).

### Verificação no navegador (orquestrador)

**Nota sobre o momento da captura, acrescentada na correção do ciclo 1 da revisão:** a transcrição
abaixo precede o `npx prettier --write` do passo 4. O passo 3 e esta verificação foram feitos sobre
um `dist/` construído a partir das fontes pré-formatação e de um `src/pages/index.astro` que já foi
revertido — não é re-derivável sem repetir o uso temporário. A única diferença conhecida entre o
artefato observado e os arquivos entregues é a ordenação de classes pelo `prettier-plugin-tailwindcss`
(reordena o atributo `class`/`class:list`, sem efeito na cascata — quem decide a cascata é a ordem
na folha de estilo, não no atributo). Exemplo do par observado: `class="regua-entrada h-px bg-tinta"`
(transcrito abaixo) × `class="regua-entrada bg-tinta h-px"` (arquivo entregue, `PageHeader.astro:54`).
As observações de navegador continuam válidas em substância.

```
Verificação no navegador — plano 043
Orquestrador, 2026-09-17 21:22:05 (horário local, São Luís UTC-3)
Método: iframes de 360 px e 1440 px sobre http://localhost:4321/ (astro preview sobre o
dist/ construído com o uso temporário). O resize_window da extensão não muda o viewport
nesta máquina — método registrado na memória do projeto. devicePixelRatio = 1.25.

RF-26 — sem rolagem horizontal [scrollWidth, clientWidth]:
  360 px  -> [360, 360]    iguais
  1440 px -> [1440, 1440]  iguais

PageHeader:
  rubrica renderizada: "VERIFICAÇÃO" (text-rotulo, maiúsculas, letter-spacing 1.68px)
  <h1 class="text-display-1 titulo-entrada lg:col-span-7">, texto "Componentes de base"
    font-size 1440 px: 76.48px
    font-size  360 px: 42px
  régua forte: <div aria-hidden="true" class="regua-entrada h-px bg-tinta">
    height computada: 1px   background: rgb(17, 17, 18) (--color-tinta #111112)
    largura a 1440: 1440 px — de ponta a ponta, sem recuo de margem
  slot aside: a 1440 ocupa a coluna direita (grade 7/5 confirmada visualmente);
    a 360 empilha abaixo do <h1>. Sem aside o <h1> ocupa a largura (não exercitado:
    o uso temporário instanciou apenas o caso COM aside).

Movimento (RF-32), com prefers-reduced-motion: no-preference (estado da máquina):
  .titulo-entrada -> animation-name "titulo-entrada", duration 0.4s
  .regua-entrada  -> animation-name "regua-entrada",  duration 0.5s
  Nenhuma animação declarada pelo próprio PageHeader; ambas vêm do global.css (036).

Movimento sob prefers-reduced-motion: reduce:
  A extensão do Chrome não expõe a emulação do DevTools. O que foi feito no lugar,
  em execução e não por leitura de código: auditei o CSS entregue em dist/ pelo CSSOM e
  desliguei em runtime o único bloco @media (prefers-reduced-motion: no-preference)
  (mediaText := 'not all'), que é exatamente o que o navegador faz sob reduce.
  Contexto de mídia de cada declaração, lido do CSS entregue:
    .regua-entrada { transform-origin: 0px center }            -> fora de @media (inócua)
    .regua-entrada { animation: ...; transform: scaleX(0) }    -> dentro de no-preference
    .titulo-entrada { opacity: 0; animation: ...;
                      transform: translateY(8px) }             -> dentro de no-preference
    @keyframes regua-entrada, @keyframes titulo-entrada        -> dentro de no-preference
  Estado observado com o bloco desligado (1 bloco desligado):
    h1:    opacity 1, transform none, animation-name none, caixa visível 761x76 px
    régua: opacity 1, transform none, animation-name none, caixa visível 1440x1 px
  Conclusão: nenhum estado inicial invisível existe fora de no-preference — a armadilha
  nº 6 do README da fase ("animação que começa invisível esconde texto") está evitada.
  RESSALVA REGISTRADA: isto é observação do artefato entregue com o bloco desligado em
  runtime, não emulação de reduce pelo DevTools. A emulação não rodou.

PillButton (§5.3):
  outline: altura 48 px; background rgba(0,0,0,0) (transparente);
           borda solid rgb(17,17,18); disco 32x32, bg rgb(17,17,18), texto rgb(239,237,234)
  solid:   altura 48 px; background rgb(17,17,18);
           disco 32x32 com as cores invertidas (fundo claro)
  transition-duration 0.12s sobre background-color (§7 — 120 ms)
  glifo "›" presente nos dois discos (conferido por ampliação da captura)
  Nota: border-top-width computa 0.8px porque devicePixelRatio = 1.25 (escala 125% do
  Windows); a classe declarada é `border`, ou seja 1 px. Não é defeito.

Tag (§5.4) — padding 6.4px/11.2px (0.4rem/0.7rem), text-rotulo 12px, border-radius 0px:
  strong + dot: borda solid rgb(17,17,18), fundo transparente, texto rgb(17,17,18)
                ponto: 6x6 px, rounded-full, bg rgb(17,17,18), aria-hidden="true"
  neutral + dashed: borda dashed rgb(154,150,145) (--color-tracejado),
                texto rgb(90,87,84) (--color-secundario)
  solid: fundo rgb(17,17,18), texto rgb(239,237,234)
  Não exercitados pelo uso temporário: neutral SEM dashed (que pela especificação usa
  --color-regua #d6d3cf na borda) e a prop normalCase.

ExternalLink (§5.5, §8.3) — HTML renderizado, literal:
  <a href="https://example.com" target="_blank" rel="noopener noreferrer">
    Exemplo <span aria-hidden="true">↗</span> <span class="sr-only">(abre em nova aba)</span>
  </a>

Greps do passo 3, reproduzidos pelo orquestrador sobre o mesmo dist/:
  grep -o 'target="_blank" rel="noopener noreferrer"' dist/index.html | wc -l  -> 3
  grep -o '(abre em nova aba)' dist/index.html | wc -l                        -> 3
  grep -o 'class="sr-only">[^<]*' dist/index.html                             -> 1 ocorrência
  grep -o 'class="sr-only"[^>]*>[^<]*' dist/index.html                        -> 3 ocorrências:
    class="sr-only">(abre em nova aba)
    class="sr-only" data-astro-cid-nns7i3if>(abre em nova aba)
    class="sr-only" data-astro-cid-nns7i3if>(abre em nova aba)
  A explicação do executor para o grep do plano ter retornado 1 em vez de 3 foi conferida
  contra o artefato e está correta: os dois spans do rodapé (SiteFooter, plano 042) carregam
  data-astro-cid-nns7i3if entre `class="sr-only"` e `>`, e por isso não casam com o padrão
  exato do plano. Os três links externos têm o texto alternativo.

Navegação por Tab: NÃO verificada. A tecla Tab enviada pela extensão não move o foco nesta
máquina (limitação já registrada no README da fase e na memória do projeto); fica para o
plano 053, junto com a dívida equivalente do 042.
```

**Não observado no navegador** (uso temporário não instanciou esses casos): `PageHeader` **sem**
slot `aside`; `Tag` `neutral` **sem** `dashed`; `Tag` com prop `normalCase`. Nenhum dos três tem
prova de navegador — só a leitura do código (que não é aceita como prova de UI neste projeto).

### Passo 4 — portão

Antes do portão, `npm run format:check` reprovou os quatro arquivos novos (formatação, não lógica:
quebra de linha do `class:list` do `Tag.astro`/`PillButton.astro` e do atributo `class` do
`ExternalLink.astro`/`PageHeader.astro`). Rodei `npx prettier --write` só nesses quatro arquivos
(nenhum outro tocado) e conferi de novo — sem mudança de comportamento, só formatação.

```
$ npm run lint

> haroldo-page@0.1.0 lint
> eslint .

(sem saída — exit 0)
```

```
$ npm run format:check

> haroldo-page@0.1.0 format:check
> prettier --check .

Checking formatting...
All matched files use Prettier code style!
```

```
$ npm run test:coverage

> haroldo-page@0.1.0 test:coverage
> vitest run --coverage

 RUN  v4.1.11 S:/Projetos/academic_page/haroldo
      Coverage enabled with v8

 Test Files  14 passed (14)
      Tests  236 passed (236)
   Start at  21:24:27
   Duration  2.10s (transform 3.52s, setup 0ms, import 8.89s, tests 278ms, environment 2ms)

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

A linha não coberta de `navigation.ts:51` é pré-existente, de um plano anterior — nenhum arquivo
deste plano tem lógica testável por Vitest (são só marcação/props Astro); componentes `.astro` não
entram na cobertura do Vitest.

### O que NÃO rodou

- **`git ci` / `npm audit` / CI do GitHub Actions / Workers Builds** — verificação autoritativa fora
  do escopo deste executor; cabe à promoção do plano pelo orquestrador.
- **Emulação de `prefers-reduced-motion: reduce` pelo DevTools** — não rodou (limitação da extensão
  do Chrome nesta máquina); o orquestrador fez uma auditoria equivalente por CSSOM, registrada acima
  com a ressalva explícita.
- **Navegação por Tab** — não verificada (tecla Tab da extensão não move o foco nesta máquina);
  dívida explicitamente empurrada para o plano 053, igual ao 042.
- **`PageHeader` sem `aside`, `Tag` `neutral` sem `dashed`, `Tag` com `normalCase`** — não
  instanciados no uso temporário, portanto sem prova de navegador.

### Decisões tomadas por ambiguidade do plano

1. **Espaçamento vertical do `PageHeader`** (`pt-10 pb-8 lg:pt-14`, `mt-4` antes do título/grade): o
   plano descreve a estrutura (rubrica, `<h1>`, `aside`, régua) mas não dá números de espaçamento
   próprios do componente. Usei valores conservadores de ritmo vertical (múltiplos de `0.5rem`,
   coerentes com §4) em vez de inventar um `clamp()` novo não pedido pelo plano.
2. **Padding/gap do `PillButton`** (`py-1 pr-1 pl-5`, `gap-3`, texto em `text-[0.9375rem]` — mesmo
   tamanho da navegação do `SiteHeader`): o plano fixa altura ≥48px e disco de 32px, mas não o
   padding interno exato.
3. **Hover do `PillButton` variante `solid`:** o §5.3 diz "Hover: fundo `--bloco`" no contexto da
   variante padrão (outline); não repete a regra para `solid`, exclusiva da 404. Implementei hover
   `bg-bloco` só para `outline`; `solid` não muda no hover.
4. **`Tag` com `dashed`:** interpretei "borda tracejada `border-tracejado`" como a cor de borda
   passar a ser sempre `--tracejado` quando `dashed=true`, sobrepondo a cor da variante. Conferido
   pelo orquestrador contra o texto do plano — é a leitura correta; a combinação observada no
   navegador foi `neutral + dashed`, e `neutral` sozinho (borda `--regua`) não foi exercitado.
5. **`ExternalLink` href de teste** (`https://example.com`) e **`PillButton` solid href** (`/`) no
   uso temporário: arbitrários, só para o build; removidos no `git checkout` do passo 3.

Nenhuma chave nova foi necessária em `src/i18n/pt.ts` — usei só `pt.site.opensInNewTab`, já
existente. Nenhum arquivo fora da lista "Arquivos afetados" foi tocado, além do uso temporário
(revertido) em `src/pages/index.astro`.

### Correções da revisão, ciclo 1

Revisão REPROVADA com duas correções, ambas textuais — nenhuma mudou comportamento de código.

1. **Evidência descrevia versão anterior dos arquivos.** Os blocos dos passos 1 e 2 foram colados
   antes do `npx prettier --write` do passo 4; o `prettier-plugin-tailwindcss` reordenou classes no
   atributo `class`/`class:list` (sem efeito de cascata — a ordem que importa é a da folha de
   estilo, não do atributo). Corrigido: os dois blocos foram substituídos pela execução autoritativa
   do triage-runner (rodada sobre os arquivos já formatados) e a verificação no navegador ganhou uma
   nota explícita sobre o descompasso de momento, com o par de classes citado como exemplo
   (`regua-entrada h-px bg-tinta` transcrito × `regua-entrada bg-tinta h-px` entregue) — ver acima.
2. **Três citações de seção erradas**, implementação certa em todas:
   - `PageHeader.astro`: `(§8.2 da identidade)` → `(§7 da identidade / §8.2 do PRD)` — a
     identidade não tem §8.2 (seu §8 é "O que mudou em relação ao mock", sem subseções); a regra
     de `prefers-reduced-motion` está no §7 da identidade, que remete ao §8.2 do PRD.
   - `ExternalLink.astro`: `(§5.5, §8.3 do PRD)` → `(§5.5 da identidade, §8.3 do PRD)` — o PRD só
     vai até §5.4; §5.5 é da identidade.
   - `Tag.astro`: `(§5.4)` → `(§2 da identidade)`, no comentário sobre `dashed` sempre usar
     `--tracejado` — o §5.4 diz que "Concluído" é neutra com borda tracejada, mas não nomeia a cor;
     quem reserva `--tracejado` para borda tracejada é o §2.
   Conferi as demais citações dos quatro arquivos (`grep -n '§'`) contra `docs/identidade-visual.md`
   e o `PRD.md`: nenhuma outra errada.

Duas observações não bloqueantes que o revisor pediu para registrar, sem corrigir agora:
`text-[0.9375rem]` em `PillButton.astro` é literal repetido (mesmo precedente aceito no plano 042;
candidato a virar `@utility` num plano próprio); `lg:items-end` em `PageHeader.astro` é uma escolha
de composição não pedida pelo plano, mas inócua.

### Dívida para o plano 053

Emulação de `prefers-reduced-motion: reduce` pelo DevTools e navegação por Tab (foco visível, ordem
do DOM) — as duas por limitação da extensão do Chrome nesta máquina (não expõe a emulação de
`reduce`; a tecla Tab enviada por ela não move o foco). Mesma dívida equivalente já registrada no
plano 042.
