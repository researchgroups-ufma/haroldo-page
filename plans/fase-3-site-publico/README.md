# Planos da Fase 3 — Site público em português

> Mapa de execução dos planos atômicos. **Atualize a tabela de estado a cada plano fechado.**
> A fonte de verdade do que cada plano faz é o próprio arquivo `NNN-*.md`; a do que já foi feito
> é o campo `Status:` de cada um. Este arquivo existe para o que não cabe em nenhum dos dois: a
> ordem, o paralelismo, as decisões de fatiamento e as armadilhas.

Última atualização: 2026-09-16 (planos 036, 037 e 038 DONE)

**Critério de conclusão da fase** (§6.2 do PRD): *todas as rotas navegáveis com o conteúdo
placeholder, responsivas de 360 px a 1440 px.* Como nas fases anteriores, o critério não é "os
testes passam": é **abrir as rotas no navegador** nas três larguras e registrar o que a tela
mostrou (ver "Verificação no navegador", abaixo).

**Especificação que a fase implementa:** [`docs/identidade-visual.md`](../../docs/identidade-visual.md)
— fonte **única** do visual. As decisões de recorte estão em
[`docs/sabatinas/CHANGELOG_sabatina_identidade-visual.md`](../../docs/sabatinas/CHANGELOG_sabatina_identidade-visual.md).
**A pasta `ref/` não é versionada** (está no `.gitignore`): nenhum plano, critério, teste ou
revisão pode depender dela. Executores, revisores e o CI não a têm.

## Estado

| Plano | Título | Status | Executável por | Agente | Commits |
|---|---|---|---|---|---|
| 036 | Tokens de cor, escala tipográfica e Archivo auto-hospedada | ✅ DONE | agente | implementer (sonnet) | `fb117b6` |
| 037 | Dicionário de interface em PT e mapa de navegação | ✅ DONE | agente | implementer (sonnet) | `23d1aa0` |
| 038 | Texto corrido em parágrafos, contagem com dois dígitos e data pt-BR | ✅ DONE | agente | implementer (sonnet) | `1d0d3a5` |
| 039 | Filtro de rascunho (RN-01), singleton e ordenação de pesquisa | ⬜ TODO | agente | implementer (sonnet) | — |
| 040 | Publicações agrupadas por ano (RN-02), autor destacado e links DOI/arXiv | ⬜ TODO | agente | implementer (sonnet) | — |
| 041 | Disciplinas: slug da URL, atuais × anteriores, contagens e scripts por aula (F-13) | ⬜ TODO | agente | implementer (sonnet) | — |
| 042 | Layout base, cabeçalho com menu do celular e rodapé | ⬜ TODO | agente + orquestrador (navegador) | implementer (sonnet) | — |
| 043 | Componentes de base: cabeçalho de página, pílula, tag e link externo | ⬜ TODO | agente + orquestrador (navegador) | implementer (sonnet) | — |
| 044 | Home (RF-20) | ⬜ TODO | agente + orquestrador (navegador) | implementer (sonnet) | — |
| 045 | Sobre (RF-21) | ⬜ TODO | agente + orquestrador (navegador) | implementer (sonnet) | — |
| 046 | Pesquisa: linhas e projetos (RF-22, RF-13) | ⬜ TODO | agente + orquestrador (navegador) | implementer (sonnet) | — |
| 047 | Ensino: atuais e anteriores (RF-23) | ⬜ TODO | agente + orquestrador (navegador) | implementer (sonnet) | — |
| 048 | Página de disciplina (RF-24, F-06, RN-04) | ⬜ TODO | agente + orquestrador (navegador) | implementer (sonnet) | — |
| 049 | Painel de script: Shiki monocromático e botão copiar (RF-37, F-13) | ⬜ TODO | agente + orquestrador (navegador) | implementer (sonnet) | — |
| 050 | Publicações (RF-25, RN-02, F-05) | ⬜ TODO | agente + orquestrador (navegador) | implementer (sonnet) | — |
| 051 | Página 404 e a prova do `not_found_handling` (RF-27) | ⬜ TODO | agente + orquestrador (produção) | implementer (sonnet) | — |
| 052 | Testes de integração sobre o `dist/` e peso de JS (§11, RN-01, RNF-02) | ⬜ TODO | agente | implementer (sonnet) | — |
| 053 | Verificação transversal 360/768/1440 e fechamento da fase 3 | ⬜ TODO | orquestrador (navegador) + agente (documentos) | implementer (sonnet) | — |

**Numeração é global e contínua e não é ordem de execução.** A ordem está abaixo.

### Onde cada item do §12 fecha

| Item do §12 (fase 3) | Plano |
|---|---|
| Layout base, cabeçalho, rodapé e navegação | 042 |
| Identidade visual aplicada | 036 + 043 (tokens e componentes); conferida rota a rota em 053 |
| Home (RF-20) | 044 |
| Sobre (RF-21) | 045 |
| Pesquisa (RF-22) | 046 |
| Ensino (RF-23) | 047 |
| Página de disciplina (RF-24) | 048 |
| Scripts com destaque e botão copiar, por aula (RF-37, F-13) | 049 |
| Publicações agrupadas por ano (RF-25) | 050 |
| Página 404 (RF-27) | 051 |
| Responsividade 360–1440 (RF-26) | 053 (com medição em cada plano de rota) |
| Animações com `prefers-reduced-motion` (RF-32); testes da fase passando | 053 (com 036, 043 e 052) |

Os planos 036–041 e 052 **não** fecham item sozinhos: são pré-requisitos, como o 023/030/031 na
fase 2. **A marcação do §12 e o §0 do PRD são feitos pelo orquestrador na promoção de cada plano**
(o commit de DONE toca o plano, este README, `plans/README.md` e o `PRD.md`); o 053 fecha a fase.

## Ordem de execução

```
Onda 1 (paralelo):   036   037   038   039   040   041
                      │     │           │     │     │
Onda 2 (paralelo):   042 ←─┴───────────┘     │     │      (042 depende de 036, 037, 039)
                     043 ← 036, 037           │     │
                      │                       │     │
Onda 3 (paralelo,    044  Home        ← 038, 039, 041, 042, 043
 edição; build       045  Sobre       ← 038, 039, 042, 043
 serial):            046  Pesquisa    ← 038, 039, 042, 043
                     047  Ensino      ← 038, 039, 041, 042, 043
                     048  Disciplina  ← 038, 041, 042, 043
                     050  Publicações ← 038, 039, 040, 042, 043
                     051  404         ← 037, 042, 043
                      │
Onda 4:              049  Scripts     ← 041, 048
Onda 5:              052  dist/ + JS  ← 041, 044–051
Onda 6:              053  fechamento  ← todos
```

### O que pode rodar em paralelo, e o que não pode

| Par / grupo | Pode? | Motivo |
|---|---|---|
| 036 ∥ 037 ∥ 038 ∥ 039 ∥ 040 ∥ 041 | ✅ | arquivos disjuntos; só o 036 toca `package.json`/`package-lock.json` |
| 036 ∥ 052 | ❌ | os dois editam `package.json` — conflito de lockfile (lição da fase 0) |
| 042 ∥ 043 | ✅ | arquivos disjuntos (`src/layouts/` + dois componentes × quatro outros componentes) |
| páginas da onda 3 entre si | ✅ **na edição**, ❌ **no build** | cada uma cria só os próprios arquivos, mas `npm run build:pipeline`, `astro preview` e `astro check` escrevem em `dist/`, `.astro/` e `tina/__generated__/` **no mesmo working tree**. Dois builds simultâneos se sobrescrevem e produzem evidência falsa. **Máximo de dois executores ao mesmo tempo, e a verificação (build + navegador) é serializada pelo orquestrador** |
| 048 ∥ 049 | ❌ | os dois editam `src/pages/ensino/[slug].astro` |
| qualquer plano ∥ 051 no passo de produção | ❌ | a prova do 404 em produção é feita sobre um push; outro push na janela confunde qual versão respondeu |
| 052 ∥ qualquer página | ❌ | o teste sobre `dist/` só faz sentido com todas as rotas prontas |
| `src/i18n/pt.ts` | ⚠️ | **só o 037 edita.** As páginas leem. Chave faltando = **para e reporta**; o orquestrador acrescenta a chave num commit próprio, serializado, antes de retomar o plano |

## Decisões tomadas no fatiamento (não se renegociam no plano)

Cada uma está escrita, com o detalhe, no "Contexto necessário" do plano que a implementa.

1. **Strings de interface centralizadas desde já em `src/i18n/pt.ts` (plano 037).** O §10.4 do PRD
   é normativo ("Strings de interface — proibidas hardcoded em componente — sempre pelo dicionário
   `src/i18n/`") e o §12 da fase 4 exige os dicionários. Escrever as páginas com texto no
   componente e extrair na fase 4 seria reescrever as nove rotas duas vezes. **O que a fase 3 não
   faz:** `en.ts`, seletor de idioma, rotas `/en`, função de fallback por campo (RN-06). O
   dicionário exporta o objeto `pt` e o tipo `UiStrings`; a fase 4 acrescenta `en: UiStrings` e
   troca o `import` nos componentes. Dados que vêm do conteúdo **não** vão para o dicionário.
2. **Texto longo é texto simples, em parágrafos por linha em branco — não Markdown (plano 038).**
   `bio`, `corpo`, `ementa`, `resumo` e as `descricao` são `type: 'string'` com
   `ui.component: 'textarea'` em `tina/config.ts`: o professor não vê pré-visualização de Markdown,
   e um `*` ou `_` de fórmula viraria itálico sem aviso. Separador: `/\n\s*\n/` (o plano 038 implementou `/\n[ \t]*\n/`, com o mesmo resultado depois de `trim` e filtro — nota de 2026-09-16); quebra simples
   vira espaço (colapso normal do HTML). Renderizado **sempre** por interpolação `{p}` (escapada
   pelo Astro), **nunca** `set:html`. Markdown/LaTeX é RF-33 (COULD), fora desta fase.
3. **Slug da disciplina = `slugify` do nome do arquivo, sem a extensão (plano 041).**
   `content/disciplinas/2026.2-relatividade-geral.md` → `/ensino/2026-2-relatividade-geral/`. O
   `slugify` é o de `src/lib/slug.ts` — o mesmo que o Tina usa no template de nome. **Rejeitado o
   `entry.id` do Astro:** o loader `glob()` passa cada segmento por `githubSlug`
   (`node_modules/astro/dist/content/utils.js:272`), que **remove** o ponto — o id vira
   `20262-relatividade-geral`, confundindo 2026.2 com 20262. **Rejeitado slug por `semestre` +
   `nome`:** corrigir um erro de digitação no nome mudaria a URL que os alunos guardaram; o nome do
   arquivo é gerado na criação (RN-08) e não muda com a edição. Dois arquivos que caiam no mesmo
   slug (`2026.2-x` e `2026-2-x`) **reprovam o build** nomeando os dois caminhos.
4. **RN-02, "ordem de cadastro invertida" dentro do ano, é inimplementável sem campo novo, e o
   schema não muda nesta fase (Decisão 2 da sabatina).** O schema não tem data de cadastro; o
   histórico do Git não serve (o `actions/checkout` clona com profundidade 1 e todos os arquivos
   teriam a mesma data; o build ficaria não determinístico). **Regra provisória, isolada numa única
   função comparadora (plano 040):** dentro do ano, `titulo` em ordem alfabética `pt-BR`. O RF-25
   (ano decrescente) é cumprido integralmente; a segunda metade da RN-02 **fica pendente de
   ratificação do stakeholder** — ver "Questão para o stakeholder" abaixo. Trocar a regra depois é
   uma função e o teste dela.
5. **Destaque de sintaxe no build, com `<Code>` de `astro:components` e tema Shiki próprio (plano
   049).** Zero JS de destaque no navegador. As cores do tema são só as do §5.6 da identidade.
6. **Testes: lógica pura em `src/lib/` com Vitest, fixtures sintéticas para valores exatos, conteúdo
   real só para invariantes.** O §11 pede fixtures reais para *testes de conteúdo*; os de `src/lib/`
   são unitários. Um teste que afirme "5 publicações publicadas" lendo `content/` ficaria vermelho
   no primeiro save do professor — o modo de falha que já custou 14 commits a este projeto. Onde
   um plano usa `content/` real, a asserção é invariante (nenhum rascunho aparece; a soma dos
   grupos é igual ao total publicado).
7. **Links internos com barra final** (`/sobre/`, `/ensino/2026-2-relatividade-geral/`). O
   `wrangler.toml` não declara `html_handling`, o default é `auto-trailing-slash` e sem a barra
   cada clique custa um 307 (achado do plano 026).
8. **Cabeçalho do site:** nome = `siteConfig.shortTitle` (`src/lib/config.ts`); segunda linha =
   `perfil.departamento` quando houver, oculta abaixo de `40rem`. O esboço do §5.1 da identidade
   ("Departamento de Física · UFMA") não corresponde a campo algum; esta é a leitura com os campos
   que existem.
9. **Integração sobre `dist/` roda no CI depois do `build:pipeline`, com config Vitest própria, e
   não entra no `build:pipeline`** (plano 052). O `build:pipeline` é território do ADR-0009; mexer
   nele para acrescentar portão que não protege conteúdo do professor é escopo que a fase não pede.

## Dívidas herdadas — onde cada uma cai

Da seção "O que a fase 2 empurra adiante" do [README da fase 2](../fase-2-pipeline-de-publicacao/README.md):

| Dívida | Onde cai | Decisão |
|---|---|---|
| **7(b)** — `classifyTina` não detecta enum depois do ramo `campo.list` (`tests/content/paridade-schema.test.ts:239`) | **Continua aberta, sem fase.** O comentário do teste corrigido no **053** | O motivo do adiamento era "não existe campo com `list: true` **e** `options`". Como **o schema não muda nesta fase** (Decisão 2 da sabatina), esse campo continua sem existir e a mudança continua sem teste possível. **Fecha quando:** nascer um campo com `list: true` e `options`. O 053 troca a frase "Fica como guarda para a fase 3" do cabeçalho do teste por essa condição |
| **`not_found_handling = "404-page"` não provado** (404 de corpo vazio, sem `404.html` em `dist/`) | **051** | Prova local com `npx wrangler dev` sobre o `dist/` e prova em produção com `curl.exe -si` na URL do Worker depois do push, nos dois casos com status `404` **e** corpo contendo o `<h1>` da página. O 052 acrescenta a existência de `dist/404.html` ao teste de integração |
| Renderização de conteúdo (sem ela M-02 não é verificável ponta a ponta) | **044–051** | M-02 continua sendo medida só na fase 5 (§3.3) |
| Imprecisão no cabeçalho de `tests/content/conteudo-valido.test.ts` (atribui a 7(c) ao arquivo errado) | **053** | Correção de uma frase, feita de propósito no fechamento — nenhum plano de rota toca o arquivo |
| "Verificação autoritativa" do README da fase 2 parada antes do 030 | **Substituída, para esta fase, pela seção abaixo** | O README da fase 2 não é reescrito aqui (fase fechada); a dívida lá continua registrada |
| Demais dívidas sem fase (caminho `schedule` do vigia, moderadas `qs`/`body-parser`/`express`, duplicação de `normalizeLinhaRelacionadaId`, §11 do PRD, "portão pré-push", §7.4) | **Nenhum plano desta fase** | Não tocam o site público. Ficam onde estão |
| Painel `/admin` (TinaCMS) requisita a Inter em `fonts.googleapis.com` | **Nenhum plano desta fase (código de terceiro, fora do site público)** | Aceita em 2026-09-16 na revisão do 036. **Fecha quando:** o TinaCMS permitir desligar a fonte remota do painel, ou um plano da fase 5 auto-hospedá-la |
| Tailwind 4 varre `plans/` e `docs/` (detecção automática, `base` = raiz do projeto, `**/*`): classe citada em `.md` versionado entra no CSS publicado — `text-display-1` está em `dist/_astro/*.css` sem nenhum uso em `src/`. Canário "a classe aparece no bundle" não discrimina | **Nenhum plano ainda** — candidato a passo do **043** ou plano próprio antes dele | Achado da revisão do 036, anotado em 2026-09-16 por decisão do stakeholder (seguir para o 037). Correção provável: `@import 'tailwindcss' source('../');` em `src/styles/global.css` (ou `@source not` para `plans/` e `docs/`), depois de confirmar que nada fora de `src/` usa classe. **Fecha quando:** o CSS gerado deixar de conter classe citada só em `.md`. Até lá, nenhum canário de CSS desta fase pode usar "a classe está no bundle" como prova |

## Questão para o stakeholder

**Q-RN02 — ordem dentro do ano em Publicações. Respondida em 2026-09-14: opção (c).** A RN-02 manda
"ordem de cadastro invertida" e o schema não tem data de cadastro. As opções eram (a) ratificar a
regra provisória, título em ordem alfabética, e emendar a RN-02; (b) outro critério com os campos
existentes; (c) acrescentar um campo de data de cadastro numa fase que possa mudar o schema. **O
stakeholder escolheu (c):** a RN-02 não muda, a regra provisória do 040 (título alfabético pt-BR,
isolada em `compareWithinYear`) vale até o campo existir, e a pendência é dívida nomeada desta fase
— **fecha quando** um plano de schema criar o campo e `compareWithinYear` passar a usá-lo. Não
bloqueia mais nenhum plano, nem o 053. Registro em
`docs/sabatinas/CHANGELOG_sabatina_identidade-visual.md`, Decisão 5.

## Verificação no navegador (vale para todo plano marcado "orquestrador (navegador)")

A memória do projeto é explícita: comportamento de UI se prova **exercitando a interface**, não
lendo código. Leitura de `.astro` não aprova rota.

```
npm run build:pipeline        (precisa de TINA_CLIENT_ID/TINA_TOKEN no .env)
npx astro preview             →  http://localhost:4321
```

Chrome → DevTools → *Toggle device toolbar* → largura **360**, **768** e **1440** px. Em cada
largura e em cada rota do plano, cole no console e transcreva o resultado:

```js
[document.documentElement.scrollWidth, document.documentElement.clientWidth]
```

Os dois números têm de ser **iguais** (RF-26: sem rolagem horizontal). Registre ainda, por
largura: elemento cortado (sim/não, qual) e, uma vez por rota, a navegação por **Tab** (o foco é
visível em todo elemento interativo e a ordem segue a leitura). Transcreva data e horário. Sem
isso o plano não fecha.

**Encerramento:** `Ctrl+C` no `astro preview`. Não deixe servidor em background — sem teto de saída.

## Verificação autoritativa

```
npm ci                    →  não reescreve o lock
npm audit --audit-level=high  →  exit 0 (ADR-0010)
npm run lint              →  exit 0
npm run format:check      →  All matched files use Prettier code style!
npm run test:coverage     →  testes verdes E cobertura ≥ 80% (threshold imposto; medido hoje em 100%)
npm run build:pipeline    →  vitest tests/content verde; astro check 0 errors, 0 warnings, 0 hints; Complete!
npm run test:dist         →  (a partir do 052) verde sobre o dist/ recém-gerado
CI do GitHub Actions      →  conclusion "success" no commit empurrado
Workers Builds            →  check "Workers Builds: haroldo-page" success no mesmo commit
```

**Leia a saída do `astro check`.** Ele já encerrou com `0 errors` e exit 0 imprimindo
`[ERROR] [content]` (planos 020/021). O portão de conteúdo é o `vitest run tests/content`, mas uma
página que chama `getCollection` sobre referência quebrada ainda pode imprimir o erro sem reprovar.

**"Os comandos locais passam" não é o mesmo que "o CI passa".** Só o `conclusion` do run é
evidência de DONE.

## Portão de qualidade

Vale integralmente o da fase 0: um plano só vira `DONE` com **verificação independente com saída
real** *e* **revisão de código aprovada**. As "Instruções que todo despacho de executor deve
conter" do [README da fase 0](../fase-0-setup-e-provisionamento/README.md) (seção de mesmo nome)
valem aqui. As que mais importam nesta fase:

1. **`git add` por caminho explícito.** Nunca `git add -A` nem `git add .`.
2. **`Status:` fica em `TODO`** e o executor **não commita** — promoção e commit são do orquestrador.
3. **Evidência é saída literal, colada**, da sessão. Diff colado é gerado por comando depois da
   última edição (lição da v0.1.32 do PRD).
4. **Critério de aceitação não se reescreve para caber no resultado.**
5. **Listar no despacho os arquivos que outro executor está tocando** — ver a tabela de paralelismo.
6. **Mandar o executor declarar o que NÃO rodou** — em especial a verificação no navegador, que é
   do orquestrador.
7. **Teste novo tem de ser provado falsificável** (canário: quebre a regra, mostre o teste vermelho,
   reverta).
8. **Desconfiar de churn grande no lockfile** — vale para o `@fontsource/archivo` do 036.
9. **O revisor reproduz, não aceita** (memória do projeto): confere cada alegação contra a fonte
   citada, inclusive a seção de `docs/identidade-visual.md` que o plano diz implementar.

## Regras de código que todo plano desta fase herda

- **Cabeçalho obrigatório do §10.1** do PRD em todo `.ts` e `.astro` novo (o bloco
  `/** ==== Arquivo / Projeto / Descrição / Autor / Criado em / Atualizado em / Versão /
  Dependências / Entradas / Saídas / Uso / Notas ==== */`). Em `.astro`, dentro do frontmatter
  `---`, como em `src/pages/index.astro`. Autor: `Desenvolvedor`. Datas absolutas.
- **TSDoc** em toda função exportada e todo componente (props e comportamento com prop ausente, §10.2).
- **Comentário com o identificador do PRD** em toda regra de negócio (`// RN-04: ordem do professor`).
- **Identificadores em inglês**; campos de frontmatter em português (§10.4). Componentes < 150 linhas.
- **Nenhum `process.env` sob `src/`** — `tests/lib/config.test.ts` varre `.ts` e `.astro`.
- **Nenhum `any`** (`eslint.config.js` força `error`).
- **Nenhuma requisição a terceiro** no HTML/CSS: sem Google Fonts, sem CDN.
- **Nenhum `set:html`** com conteúdo do professor.
- **O schema não muda.** `src/content.config.ts`, `tina/config.ts` e `tina/tina-lock.json` são
  intocáveis nesta fase. Se um plano precisar, **para e reporta** (e a ordem de fechamento de plano
  que mude schema da fase 2 volta a valer).

## Por onde isto pode dar errado

1. **`new Date('2026-08-10')` é meia-noite UTC.** Em São Luís (UTC−3), `toLocaleDateString` mostra
   **09/08/2026**. A formatação do 038 é por string, sem `Date`.
2. **`entry.filePath` é opcional no tipo** (`node_modules/astro/dist/content/data-store.d.ts:22`).
   O 041 lança erro nomeado se faltar, em vez de gerar rota `undefined`.
3. **`linha_relacionada` depois do `reference()` é `{ collection, id }`, não string**, e pode
   apontar para linha com `publicado: false`. Projeto nunca pode linkar âncora de linha que não
   está na página (RN-01) — o 039 resolve.
4. **Existe conteúdo real com `publicado: false`**
   (`content/publicacoes/2023-exemplo-notas-sobre-geodesicas-nulas-em-metricas-estacionarias.md`):
   é a prova viva da RN-01. A página Publicações mostra **5** itens, não 6, enquanto esse arquivo
   estiver assim.
5. **Dois builds no mesmo working tree se sobrescrevem** — ver a tabela de paralelismo.
6. **Animação que começa invisível esconde texto se o CSS falhar.** O estado inicial oculto só
   existe dentro de `@media (prefers-reduced-motion: no-preference)` (§7 da identidade).
7. **O `npm run dev` não sobe o painel no Astro 7** (plano 022). Nenhum plano desta fase precisa do
   painel; para ver páginas use `astro preview` sobre o build, que é o que vai para produção.
