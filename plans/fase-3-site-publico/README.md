# Planos da Fase 3 — Site público em português

> Mapa de execução dos planos atômicos. **Atualize a tabela de estado a cada plano fechado.**
> A fonte de verdade do que cada plano faz é o próprio arquivo `NNN-*.md`; a do que já foi feito
> é o campo `Status:` de cada um. Este arquivo existe para o que não cabe em nenhum dos dois: a
> ordem, o paralelismo, as decisões de fatiamento e as armadilhas.

Última atualização: 2026-09-23 (planos 036 a 052 e 054 DONE; 053 com a verificação transversal
feita e os documentos escritos — fase 3 concluída no texto, 12/12; promoção do 053 é do
orquestrador)

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
| 039 | Filtro de rascunho (RN-01), singleton e ordenação de pesquisa | ✅ DONE | agente | implementer (sonnet) | `5705e73` |
| 040 | Publicações agrupadas por ano (RN-02), autor destacado e links DOI/arXiv | ✅ DONE | agente | implementer (sonnet) | `6bf5aa4` |
| 041 | Disciplinas: slug da URL, atuais × anteriores, contagens e scripts por aula (F-13) | ✅ DONE | agente | implementer (sonnet) | `a2e28b7` |
| 042 | Layout base, cabeçalho com menu do celular e rodapé | ✅ DONE | agente + orquestrador (navegador) | implementer (sonnet) | `db96df3` |
| 043 | Componentes de base: cabeçalho de página, pílula, tag e link externo | ✅ DONE | agente + orquestrador (navegador) | implementer (sonnet) | `dfdc0a3` |
| 044 | Home (RF-20) | ✅ DONE | agente + orquestrador (navegador) | implementer (sonnet) | `4e48ce5` |
| 045 | Sobre (RF-21) | ✅ DONE | agente + orquestrador (navegador) | implementer (sonnet) | `369637a` |
| 046 | Pesquisa: linhas e projetos (RF-22, RF-13) | ✅ DONE | agente + orquestrador (navegador) | implementer (sonnet) | `97e006d` |
| 047 | Ensino: atuais e anteriores (RF-23) | ✅ DONE | agente + orquestrador (navegador) | implementer (sonnet) | `4d90d92` |
| 048 | Página de disciplina (RF-24, F-06, RN-04) | ✅ DONE | agente + orquestrador (navegador) | implementer (sonnet) | `5eaf30e` |
| 049 | Painel de script: Shiki monocromático e botão copiar (RF-37, F-13) | ✅ DONE | agente + orquestrador (navegador) | implementer (sonnet) | `1a028ce` |
| 050 | Publicações (RF-25, RN-02, F-05) | ✅ DONE | agente + orquestrador (navegador) | implementer (sonnet) | `5b97655` |
| 051 | Página 404 e a prova do `not_found_handling` (RF-27) | ✅ DONE | agente + orquestrador (produção) | implementer (sonnet) | `8c6821c` |
| 052 | Testes de integração sobre o `dist/` e peso de JS (§11, RN-01, RNF-02) | ✅ DONE | agente | implementer (sonnet) | `9af755e` |
| 053 | Verificação transversal 360/768/1440 e fechamento da fase 3 | ⬜ TODO | orquestrador (navegador) + agente (documentos) | implementer (sonnet) | — |
| 054 | Teste de citações do PRD no código | ✅ DONE | agente | implementer (sonnet) | `23a003d` |

**Numeração é global e contínua e não é ordem de execução.** A ordem está abaixo.

### Onde cada item do §12 fecha

| Item do §12 (fase 3) | Plano |
|---|---|
| Layout base, cabeçalho, rodapé e navegação | 042 |
| Identidade visual aplicada | ✅ 036 + 043 (tokens e componentes) — marcado no §12 em 2026-09-17; conferido rota a rota em 053 sobre o `dist/` do triage (2026-09-23 14:38): 8/8 rotas com um `<h1>`, a assinatura do `PageHeader` (`titulo-entrada`/`regua-entrada` — a Home replica a marcação sem importar o componente), CSS auto-hospedado em `/_astro/` e zero `fonts.googleapis` — ver tabela na Evidência |
| Home (RF-20) | ✅ 044 — marcado no §12 em 2026-09-17 |
| Sobre (RF-21) | ✅ 045 — marcado no §12 em 2026-09-18 |
| Pesquisa (RF-22) | ✅ 046 — marcado no §12 em 2026-09-18 |
| Ensino (RF-23) | ✅ 047 — marcado no §12 em 2026-09-18 |
| Página de disciplina (RF-24) | ✅ 048 — marcado no §12 em 2026-09-18 |
| Scripts com destaque e botão copiar, por aula (RF-37, F-13) | ✅ 049 — marcado no §12 em 2026-09-21 |
| Publicações agrupadas por ano (RF-25) | ✅ 050 — marcado no §12 em 2026-09-22 |
| Página 404 (RF-27) | ✅ 051 — marcado no §12 em 2026-09-22 |
| Responsividade 360–1440 (RF-26) | ✅ 053 — 8 rotas × 3 larguras, `scrollWidth = clientWidth` nas 24 linhas, medido em 2026-09-23 |
| Animações com `prefers-reduced-motion` (RF-32); testes da fase passando | ✅ 053 (com 036, 043 e 052) — `no-preference` e "sem CSS" observados pelo orquestrador em 2026-09-23; `reduce` e a navegação por teclado (RNF-15), verificação manual do stakeholder na mesma data |

Os planos 036–041, 052 e 054 **não** fecham item sozinhos: são pré-requisitos, como o 023/030/031 na
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
| **`not_found_handling = "404-page"` não provado** (404 de corpo vazio, sem `404.html` em `dist/`) | ✅ **051** — quitada em 2026-09-22: em produção a rota inexistente responde `404` com o corpo byte a byte igual ao `dist/404.html` (SHA-256), versão `19c88528` do Worker | Prova local com `npx wrangler dev` sobre o `dist/` e prova em produção com `curl.exe -si` na URL do Worker depois do push, nos dois casos com status `404` **e** corpo contendo o `<h1>` da página. O 052 acrescenta a existência de `dist/404.html` ao teste de integração |
| Renderização de conteúdo (sem ela M-02 não é verificável ponta a ponta) | **044–051** | M-02 continua sendo medida só na fase 5 (§3.3) |
| Imprecisão no cabeçalho de `tests/content/conteudo-valido.test.ts` (atribui a 7(c) ao arquivo errado) | **053** | Correção de uma frase, feita de propósito no fechamento — nenhum plano de rota toca o arquivo |
| "Verificação autoritativa" do README da fase 2 parada antes do 030 | **Substituída, para esta fase, pela seção abaixo** | O README da fase 2 não é reescrito aqui (fase fechada); a dívida lá continua registrada |
| Demais dívidas sem fase (caminho `schedule` do vigia, moderadas `qs`/`body-parser`/`express`, duplicação de `normalizeLinhaRelacionadaId`, §11 do PRD, "portão pré-push", §7.4) | **Nenhum plano desta fase** | Não tocam o site público. Ficam onde estão |
| Painel `/admin` (TinaCMS) requisita a Inter em `fonts.googleapis.com` | **Nenhum plano desta fase (código de terceiro, fora do site público)** | Aceita em 2026-09-16 na revisão do 036. **Fecha quando:** o TinaCMS permitir desligar a fonte remota do painel, ou um plano da fase 5 auto-hospedá-la |
| **Teste de teclado do layout base (Tab real)** — a tecla Tab enviada pela extensão do Chrome não move o foco, então o 042 não observou: "Pular para o conteúdo" visível no 1º Tab, contorno de foco em cada link e no botão, e Tab não entrando nos links do menu fechado | ✅ **053** — fechada por **verificação manual do stakeholder em 2026-09-23**, declarada ao orquestrador: "Pular para o conteúdo" como primeiro foco, foco visível em todo elemento interativo, menu do celular, botão copiar e `<details>`, em todas as rotas. **O orquestrador não observou** (a extensão continua sem mover o foco nesta máquina) | **Acumulada em três planos seguidos: 042, 043 e 044** — e depois em 045–051. No 049, o botão "Copiar código" foi acionado por **Enter real** com o foco posto por script, mas não alcançado por Tab. Dispensado no 042 por decisão do stakeholder em 2026-09-17, depois de a revisão exigir o teste. A ordem de foco foi verificada pela ordem do DOM e pela ausência de `tabindex` positivo, e o foco visível pela regra `:focus-visible` carregada — nenhum dos dois substitui o teste manual |
| **Emulação de `prefers-reduced-motion: reduce` pelo DevTools** — a extensão do Chrome não a expõe nesta máquina, então o 043 não observou o estado `reduce` como o navegador o produz | ✅ **053** — fechada por **verificação manual do stakeholder em 2026-09-23**, declarada ao orquestrador: nada anima, e o `<h1>` e a régua do cabeçalho já aparecem no estado final. **O orquestrador não observou** (a extensão nesta máquina continua sem expor a emulação); ele observou `no-preference` (as duas animações tocando) e o texto visível sem CSS | O que foi feito no 043, e consta da Evidência: auditoria por CSSOM do CSS entregue mostrando que `opacity: 0`, `scaleX(0)` e `translateY(8px)` estão todos dentro do bloco `@media (prefers-reduced-motion: no-preference)`, mais o desligamento em runtime desse bloco com observação do estado resultante (tudo visível, sem animação). O revisor confirmou por leitura do `global.css` entregue e acrescentou que `global.css:174-182` zera duração de animação e transição sob `reduce`. O 049 acrescenta o painel de script, também sem observação no estado `reduce`: a troca "Copiar código" → "Copiado" é instantânea e o `transition-colors` do botão não tem estado que o dispare |
| **`pt.home.noneYet` é semanticamente errado para a célula de Ensino** — com zero disciplinas **atuais**, a Home diz "00 / nenhuma publicada ainda", quando pode haver várias publicadas, todas `anterior`. O dicionário já tem a frase certa (`pt.teaching.noCurrent`) | **Nenhum plano — decisão do dono do produto** | Achado da revisão do 044 em 2026-09-17. **Não é defeito de código:** o §6.1 da identidade prescreve literalmente "Contagem zero mostra `00` e o texto 'nenhuma publicada ainda'", sem distinguir célula, e o plano repete. O defeito está na **fonte única**, e emendá-la é decisão de produto, não de execução. Caminho não exercitado hoje (há 1 disciplina atual publicada). **Fecha quando:** o §6.1 for emendado para distinguir a célula de Ensino, e o plano da rota seguir a emenda |
| **Faixa de células não uniformizada com o rodapé** — falta o `padding-right: 1.5rem` em `:not(:last-child)` a partir de `lg`, então o texto pode encostar na régua seguinte. Em `index.astro` a célula ímpar também não estica pela linha inteira a 768 px (o `SiteFooter.astro:130-132` estica) | **Redirecionada, por decisão do stakeholder em 2026-09-23** — ver "O que a fase 3 empurra adiante, e as dívidas que ela criou", abaixo. O 053 não toca `src/`, então não uniformiza nada; a dívida junta-se à extração da faixa de células das três cópias | Achado da revisão do 044; **reincidente no 045**, e a revisão dele pediu que `sobre.astro` fosse citado aqui. O 045 **corrigiu** o esticamento a 768 px (`sobre.astro:205-207`, `:last-child:nth-child(odd) { grid-column: 1 / -1 }` — observado no navegador: célula 3 em `[31, 691]`), mas **não** o `padding-right`, que segue faltando nas duas rotas. Não viola o §6.1, que não legisla essa faixa |
| **Páginas acima do "alvo < 150" linhas do §10.4 do PRD:** `src/pages/index.astro` com 181, `src/pages/sobre.astro` com 217, `src/pages/ensino/[slug].astro` com 163 (era 146; a seção "Scripts da disciplina" e o cabeçalho atualizado somaram 17, desde o 049) e **`src/pages/ensino.astro` com 155, desde o 047** (medição completa das quatro feita pelo 053 em 2026-09-23, `wc -l`) | **Nenhum plano ainda** — candidato a plano próprio de extração | Julgado nas revisões do 044 e do 045 como **alvo excedido, não invariante violado**: o §10.4 escreve "Alvo", única linha daquela tabela com hedge (as demais dizem "proibido"). No 044, 29 das 181 linhas são o cabeçalho §10.1 obrigatório e 27 o `<style>`; no 045, 27 são o cabeçalho e 48 o `<style>`, restando ~142 de marcação e lógica. **Correção de numeração feita em 2026-09-18:** esta linha dizia que a faixa de células "reaparece no §6.2 (plano 046)" — o §6.2 é o **045**, já executado, e a faixa agora existe em **três cópias** (`SiteFooter.astro`, `index.astro`, `sobre.astro`). **Fecha quando:** um plano próprio extrair a faixa de células e os demais trechos repetidos das quatro rotas |
| Tailwind 4 varre `plans/` e `docs/` (detecção automática, `base` = raiz do projeto, `**/*`): classe citada em `.md` versionado entra no CSS publicado — `text-display-1` está em `dist/_astro/*.css` sem nenhum uso em `src/`. Canário "a classe aparece no bundle" não discrimina | **Nenhum plano ainda.** O 043 era o candidato e **não** a levou — o plano não listava `src/styles/global.css` em "Arquivos afetados", e ampliar o escopo em execução não é decisão de executor. Continua sem plano; candidato natural a plano próprio antes do 044 | Achado da revisão do 036, anotado em 2026-09-16 por decisão do stakeholder (seguir para o 037). Correção provável: `@import 'tailwindcss' source('../');` em `src/styles/global.css` (ou `@source not` para `plans/` e `docs/`), depois de confirmar que nada fora de `src/` usa classe. **Fecha quando:** o CSS gerado deixar de conter classe citada só em `.md`. Até lá, nenhum canário de CSS desta fase pode usar "a classe está no bundle" como prova |
| **Tag-link duplica a composição visual de `Tag.astro`** — `CourseResources.astro:52-53` monta à mão a string de classes da tag neutra (`inline-flex items-center gap-1.5 border px-[0.7rem] py-[0.4rem]` + `text-rotulo` + `border-regua` + `text-secundario`), em vez de usar o componente | **Nenhum plano ainda** | Achado da revisão do 048 e **julgado legítimo**: o §5.4 pede a aparência de tag neutra, mas `Tag.astro` renderiza `<span>` e a regra da fase exige que todo link externo saia por `ExternalLink.astro` (`<a>`). A alternativa correta — dar a `Tag.astro` uma variante de link — exigiria editar arquivo fora da lista de "Arquivos afetados" do 048, o que o plano proíbe. A cópia **bate byte a byte** com o que `Tag.astro:53-59` compõe hoje, e é isso que pode derivar. **Fecha quando:** um plano der a `Tag.astro` a variante de link e `CourseResources.astro` passar a usá-la |
| **O script que regenera a Evidência apaga inserções do orquestrador** | **Nenhum plano — é regra de processo, aplicada a partir do 049** | O padrão de executor em uso nesta fase monta a Evidência com um script que localiza o marcador `## Evidência`, **trunca o plano ali** e reescreve a seção inteira a partir dos `.txt` do scratchpad (`build_evidence2.py:149-154`, no 048), incluindo um bloco "Passo N — NÃO rodei" hardcoded. Qualquer seção que o orquestrador insira **antes** do último ciclo do executor é apagada sem aviso e sem erro. **Risco identificado por leitura do script, não incidente observado:** no 048 ele não chegou a ocorrer, porque a inserção da verificação no navegador nunca foi pedida — o despacho de correção tratou só dos obrigatórios, e a seção foi inserida depois, à mão, sobre a Evidência final. **Regra que decorre:** a seção do orquestrador entra **depois** do último ciclo do executor, ou é delegada a ele por mensagem explícita, para o script escrevê-la junto do resto (padrão do 047: um script que insere a seção lida de `navegadorNNN.md`, marca o checkbox e ajusta "O que NÃO rodei", os três de uma vez). Nunca antes. **Como detectar:** ao fim do ciclo, `grep -c '^- \[ \]' <plano>` tem de dar `0`, e `grep -n 'NÃO rodei' <plano>` não pode casar um passo que foi rodado |

## O que a fase 3 empurra adiante, e as dívidas que ela criou

Igual ao README da fase 2: destino nomeado, não conserto de passagem. Nenhum item abaixo foi
tocado por este plano — o 053 não edita `src/`.

**Para a fase 4 (Internacionalização):**

- as rotas `/en`, com `en.ts` implementando o tipo `UiStrings` que `src/i18n/pt.ts` já exporta
  (decisão do fatiamento, ver "Decisões tomadas no fatiamento" acima);
- o seletor de idioma, no espaço reservado do cabeçalho desde o 042;
- `lang` por árvore de conteúdo (RN-06), incluindo o utilitário de fallback por campo.

**Para a fase 5 (Polimento e entrega):**

- imagens sem dimensões e sem otimização — `foto` (perfil) e `imagem` (onde existir) são
  renderizadas com `<img>` cru, sem `width`/`height` nem `astro:assets`;
- SEO completo: canonical, Open Graph, favicon (RF-30), e a remoção do `noindex` que mantém o site
  fora de indexação enquanto está em construção;
- auditoria de acessibilidade com axe-core (zero violações críticas) e Lighthouse mobile (M-04,
  M-05) — nenhuma rodada nesta fase.

**Dívidas sem fase, criadas ou herdadas por este plano — cada achado abaixo foi conferido contra a
Evidência do plano que o registrou, não contra o resumo dela:**

- **`F-08` tem duas definições que não concordam** — "Imagem ausente (perfil sem foto, notícia sem
  imagem)" no §5.4 do PRD ("Casos de Borda e Cenários de Falha", linha F-08 — conferido na fonte:
  **não** é o §14, que é "Dependências e Premissas"; a citação `PRD.md:298` usada em README
  anteriores **estava certa** no commit `23a003d` (`git show 23a003d:PRD.md | sed -n '298p'` mostra
  a linha da tabela `F-08`) e ficou desatualizada porque o §0.1 do PRD ganhou linhas depois desse
  commit, deslocando F-08 para baixo — hoje `grep -n "^| F-08\|^| F-04" PRD.md` dá F-04 em 300 e
  F-08 em 304; por isso a âncora estável é "§5.4, linha F-08", não um número de linha), e "Campo
  vazio não deixa rastro" em `docs/identidade-visual.md:32`. Achado da revisão do 048 (comentário de
  `CourseResources.astro`
  citava `F-08` para uma regra que está no §6.5) e medido de novo pelo 054, que **refutou por
  medição** a tentativa de discriminar citação certa de citação trocada por sobreposição de
  vocabulário — 32 das 236 citações legítimas pontuam zero, empatando com a citação errada
  conhecida. **Contagem atual, medida em 2026-09-23** (`grep -rn "F-08" src`): **5 ocorrências** —
  `src/components/ProjectCard.astro:10`, `src/pages/index.astro:11`, `src/pages/index.astro:87`,
  `src/pages/sobre.astro:10` e `src/pages/sobre.astro:180`. **Fecha quando:** o dono do produto
  emendar um dos dois documentos para que `F-08` signifique uma coisa só, e as 5 citações acima
  forem revisadas contra a definição emendada;
- **Ausência de teste automatizado que prove `F-08` em cada uso** — o 054 entrega a camada de
  *existência* das citações (o identificador citado existe no PRD), não a de *pertinência* (a
  citação é a certa para aquele trecho); essa segunda camada foi tentada e **abandonada por
  resultado negativo**, não por falta de esforço. **Fecha quando:** existir um jeito de testar
  pertinência que não dependa de limiar de vocabulário, ou a ambiguidade do `F-08` acima for
  emendada e sobrar só uma regra por citação a conferir manualmente na revisão;
- **`pt.home.noneYet` é semanticamente errado para a célula de Ensino** — ver a tabela "Dívidas
  herdadas" acima, achado da revisão do 044. **Fecha quando:** o §6.1 da identidade for emendado
  para distinguir a célula de Ensino, e o plano da rota seguir a emenda;
- **Páginas acima do "alvo < 150" linhas do §10.4** — **quatro, não três, medidas em 2026-09-23**
  (`wc -l`): `index.astro` 181, `sobre.astro` 217, `ensino/[slug].astro` 163 e **`ensino.astro`
  155**, esta última desde o 047 (a tabela "Dívidas herdadas" acima ainda listava só as três
  primeiras). **Fecha quando:** um plano próprio extrair a faixa de células e outros trechos
  repetidos das quatro rotas;
- **Faixa de células não uniformizada com o rodapé** (`padding-right` faltando em `index.astro` e
  `sobre.astro`) — redirecionada por decisão do stakeholder em 2026-09-23 para o mesmo destino do
  item acima: **fecha quando** um plano próprio extrair a faixa de células das três cópias
  (`SiteFooter.astro`, `index.astro`, `sobre.astro`) e uniformizar o `padding-right` com o rodapé;
- **Tailwind 4 varre `plans/` e `docs/`** e publica classe citada só em Markdown — ver a tabela
  "Dívidas herdadas" acima, achado da revisão do 036. **Fecha quando:** o CSS gerado deixar de
  conter classe citada só em `.md`;
- **`pt.research.eyebrow` está no dicionário (`src/i18n/pt.ts:108`) e não é usado por rota
  nenhuma** — `pesquisa.astro` passa `pt.research.summary(lines.length, projects.length)` para a
  prop `eyebrow` do `PageHeader` (plano 046), não `pt.research.eyebrow`. Confirmado por `grep`:
  zero ocorrências de `research.eyebrow` fora de `src/i18n/pt.ts`. **Fecha quando:** um plano
  decidir entre remover a chave do dicionário ou usá-la (por exemplo, como `aria-label`);
- **Tag-link duplica a composição visual de `Tag.astro`** — ver a tabela "Dívidas herdadas" acima,
  achado da revisão do 048. **Fecha quando:** um plano der a `Tag.astro` a variante de link e
  `CourseResources.astro` passar a usá-la;
- **Grade de projetos usa `auto-fill`, deixando trilhas vazias com poucos cards** — a 1440 px, com
  dois cards, a grade `repeat(auto-fill, minmax(17rem, 1fr))` ocupa ~43% da largura e o resto fica
  vazio (medido na Evidência do 046, ~425-430). **O código está certo** — o §6.3 de
  `docs/identidade-visual.md` prescreve `auto-fill` literalmente, conferido na fonte, não inferido —
  e o que falta é o dono do produto confirmar essa leitura ou emendar o §6.3 para `auto-fit` (que
  esticaria os cards em vez de deixar trilha vazia). **Fecha quando:** o dono do produto confirmar o
  `auto-fill` como decisão final ou emendar o §6.3 para `auto-fit`, e o código acompanhar a emenda;
- **Ramo `noPrevious` da página Ensino sem canário** — achado da revisão do 047: o passo 4 do plano
  pedia canário de estado vazio no singular, e só o ramo `current = []` ("Nenhuma disciplina neste
  semestre.") foi exercitado; o ramo `previous = []` ("Nenhuma disciplina anterior.") nunca foi
  provado por falsificação, só por leitura do componente. Não é critério afrouxado — o critério
  pedia um canário, no singular, e foi cumprido; é lacuna de cobertura registrada como dívida.
  **Fecha quando:** um teste ou canário exercitar `previous = []` e mostrar a caixa tracejada de
  "Nenhuma disciplina anterior." aparecendo, com o `<h2>` "Anteriores" preservado;
- **Dívida 7(b)** (`tests/content/paridade-schema.test.ts`) — o comentário foi corrigido neste
  plano (053) para não citar mais "fase 3" como o guarda. **Fecha quando:** nascer um campo com
  `list: true` **e** `options`;
- **Q-RN02, opção (c)** — o stakeholder decidiu, em 2026-09-14, criar um campo de data de cadastro
  numa fase que possa mudar o schema; até lá vale a ordenação alfabética provisória de
  `compareWithinYear` (plano 040). Nota registrada na RN-02 do §5.3 do PRD por este plano. **Fecha
  quando:** um plano de schema criar o campo e `compareWithinYear` passar a usá-lo;
- **Workers Builds não disparou para o commit `db719f4`** (docs-only, promoção do 052) — o único
  *check run* do commit é `qualidade` (CI), `success`; não existe *check run* de Workers Builds
  para ele (confirmado via `gh api .../commits/db719f4.../check-runs`). **A hipótese óbvia — a
  Cloudflare pula o build quando o diff é só documentação — está refutada:** o commit seguinte,
  `c1ca1c1` (também docs-only, só `README.md`), **disparou** o Workers Builds normalmente, com
  `success` (mesmo `gh api`, conferido em 2026-09-23). Fato: dois commits docs-only consecutivos, um
  disparou e o outro não. Causa **desconhecida** — não é filtro por caminho, e não foi investigada
  além disso. **Fecha quando:** a causa for identificada (por exemplo, lendo a documentação da
  Cloudflare sobre concorrência ou *debounce* de builds) ou o fenômeno se repetir e alguém
  investigar na hora.

**Achado do 053 que não é dívida** — a 360 px, na página de disciplina, o código do painel de
script (`<pre>` do `<Code>` do Shiki) rola **dentro de si mesmo** (`overflow-x: auto`,
`tabindex="0"`), não a página: `document.documentElement.scrollWidth` continua igual ao
`clientWidth`. É o comportamento medido também no 049 ("a 360 px quem rola é o bloco de código, não
a página") e é o que o RF-26 exige — registrado aqui só para não parecer que a tabela do passo 2
escondeu um caso de rolagem horizontal.

## Armadilha de canário achada no 045 — `grep -c` não conta ocorrências

O `dist/**/index.html` deste projeto sai **minificado em uma única linha**. `grep -c` conta *linhas
que casam*, não ocorrências, então **só pode devolver `0` ou `1`** em qualquer cenário — inclusive
com rótulo órfão de verdade na página. Medido em 2026-09-18 sobre `dist/sobre/index.html`:
`grep -c` → `1`, `grep -o ... | wc -l` → `3`.

Pior: o canário de rótulo órfão sobre a **página inteira** é inatingível por construção. O
`BaseLayout.astro:53` faz a própria chamada a `getCollection('perfil')` e passa o resultado ao
`SiteFooter`, que renderiza `pt.footer.academicProfiles` (= `'Perfis acadêmicos'`) em **toda** rota,
fora do alcance de qualquer variável zerada na página.

**Regra para os planos 046–051:** o canário de rótulo órfão escopa o `grep` ao `<main>` **e** usa
`grep -o ... | wc -l`. Nunca `grep -c` sobre HTML minificado.

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

**Os blocos que todo despacho carrega estão em [`plans/DESPACHO.md`](../DESPACHO.md)** — escritos uma
vez, lidos pelos próprios agentes, em vez de redigitados a cada plano. O orquestrador referencia o
arquivo pelo caminho absoluto e escreve no prompt só o que é específico do plano. Lá também está a
lista do que é do orquestrador, que ninguém mais confere.

**Antes do commit de promoção**, rode `node scripts/verificar-promocao.mjs <caminho do plano>`: ele
reprova critério de aceitação em branco, plano que se contradiz declarando "NÃO rodei" um passo cuja
seção existe na Evidência, `Status:` fora do vocabulário e texto de preenchimento do fatiamento
esquecido. Plano ainda sem Evidência executada é pulado, não reprovado.

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
- **Canário que toca `content/` é pré-autorizado**, e o executor pode fazê-lo sem perguntar,
  desde que: seja temporário, sirva para provar um critério que de outro modo só se sustentaria por
  leitura de código, seja revertido com `git checkout -- <arquivo>` (seguro aqui, porque os arquivos
  de `content/` **estão** commitados) e a reversão seja **provada** na Evidência com
  `git status --short` sem `content/` e `git diff -- content/` vazio. Depois de reverter, rode o build
  de novo e recapture os blocos que descrevem o `dist/`. Decidido em 2026-09-18, depois que o 048
  gastou um ciclo inteiro esperando essa autorização para provar que rascunho não gera página.
  **O schema continua intocável** — isto vale só para o valor de campos em arquivos de conteúdo.
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
