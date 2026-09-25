# Planos da Fase 4 — Internacionalização

> Mapa de execução dos planos atômicos. **Atualize a tabela de estado a cada plano fechado.**
> A fonte de verdade do que cada plano faz é o próprio arquivo `NNN-*.md`; a do que já foi feito
> é o campo `Status:` de cada um. Este arquivo existe para o que não cabe em nenhum dos dois: a
> ordem, as decisões de fatiamento, as questões levadas ao stakeholder e as armadilhas.

Última atualização: 2026-09-25 — **055 e 056 DONE** (trabalho em `0ebf8ed` e `d44a874`,
executados em modo de teste com `superpowers:executing-plans`, depois triage e `code-reviewer` da
casa; CI e Workers Builds verdes em `48b9a4f`). Antes, 2026-09-24: fase fatiada em 19 planos (**055–073**), a partir do PRD v0.1.58 e
da sabatina [`CHANGELOG_sabatina_fase-4-i18n.md`](../../docs/sabatinas/CHANGELOG_sabatina_fase-4-i18n.md)
(12 decisões; a 1 e a 2 substituídas pela 3). No mesmo dia, as duas questões abertas pelo fatiamento
foram respondidas (Decisões 13 e 14, PRD v0.1.59) e incorporadas aos planos 061, 065, 066, 067, 071,
072 e 073.

**Critério de conclusão da fase** (§6.2 do PRD): *M-07 atingida; fallback verificado item a item.*
Como nas fases anteriores, o critério não é "os testes passam": é abrir as rotas `/en` no navegador
nas três larguras, ler o que a tela mostra e registrar (ver "Verificação no navegador", abaixo).

**Especificação que a fase espelha:** [`docs/identidade-visual.md`](../../docs/identidade-visual.md),
revisada em 2026-09-24 para o site atual. O aviso de idioma entra nela no **065** e o seletor no **069**.

## Duas questões abertas no fatiamento — RESPONDIDAS em 2026-09-24

O fatiamento não decidiu as duas questões abaixo e as devolveu ao stakeholder. **As duas foram
respondidas em 2026-09-24** e registradas como **Decisões 13 e 14** do
[`CHANGELOG_sabatina_fase-4-i18n.md`](../../docs/sabatinas/CHANGELOG_sabatina_fase-4-i18n.md) (PRD
v0.1.59). Nenhum plano está mais bloqueado por elas. O texto da questão fica abaixo como registro do
porquê.

### Q-F4-1 — Texto livre em português que não tem campo em inglês: marca `lang="pt-BR"` e conta para o aviso?

**✅ RESPONDIDA em 2026-09-24 — Decisão 13, "`lang` sim, aviso não":** todo campo **P** da tabela
abaixo recebe `lang="pt-BR"` nas rotas `/en`, mas **não** dispara o aviso da página. O aviso fica
restrito ao fallback de campo **T** (RN-06). **Exceção:** `publicacoes.titulo` e `publicacoes.veiculo`
ficam **sem** `lang` e sem aviso, porque em geral já estão em inglês — reclassificados como **F** na
tabela. O exemplo do RF-28 foi emendado — pela **Decisão 15** (2026-09-25), que substitui a emenda da 13 —
para a linha de pesquisa sem `en.resumo` em `/en/research`: o resumo sai em português, com
`lang="pt-BR"` e o aviso. Publicações fica sem resumo. (Registro original da questão, abaixo.)

A Decisão 4 manda marcar `lang="pt-BR"` em "todo elemento cujo texto **caiu** no PT" e mostrar o
aviso "se qualquer texto de conteúdo exibido numa rota `/en` **caiu** no português". "Cair" é o
fallback da RN-06, que só existe para campo com par no grupo `en`. Mas as rotas `/en` mostram também
texto livre em português **sem** campo em inglês — e o critério do RF-28 usa justamente um desses
casos como exemplo:

> RF-28: "Dada uma publicação sem versão EN, quando o visitante abre `/en/publications`, então vê a
> entrada em português, com o elemento marcado `lang="pt-BR"` e um aviso único na página".

A página Publicações **não exibe** o único campo traduzível da coleção (`resumo`, §6.6 da identidade);
o que ela exibe é `titulo`, `autores` e `veiculo`, que a RN-07 e o plano 018 trataram como factuais.
Lida ao pé da letra, a Decisão 4 deixa `/en/publications` **sem** aviso e **sem** `lang="pt-BR"` — o
contrário do que o RF-28 descreve.

| Opção | O que acontece | Consequência |
|---|---|---|
| **(a)** Só o fallback da RN-06 marca e avisa | Campos da coluna "P" da tabela abaixo ficam sem `lang` e não disparam o aviso | `/en/publications` nunca tem aviso nem `lang="pt-BR"`, o que contradiz o exemplo do RF-28 (o RF-28 teria de ser emendado). Um título de aula em português é lido pelo leitor de tela com pronúncia inglesa |
| **(b)** Todo texto livre em PT marca e avisa | Campos "P" recebem `lang="pt-BR"` e disparam o aviso | `/en/teaching/<slug>/` (títulos de aula), `/en/about/` (instituições) e `/en/publications/` (títulos) mostram o aviso **sempre**, mesmo com tudo que é traduzível traduzido. Um título de artigo escrito em inglês seria marcado `pt-BR` (errado para o leitor de tela) |
| **(c)** Por campo | O stakeholder preenche a coluna "Q-F4-1" da tabela | Mais fino; a tabela vira a regra |

A resposta não foi nenhuma das três opções puras: é uma quarta, "`lang` sim, aviso não", com a exceção
das publicações. A coluna "Em `/en`" da tabela abaixo é a regra que os planos 065–067 aplicam.

### Q-F4-2 — Pares `alternate` do sitemap com segmentos de rota traduzidos

**✅ RESPONDIDA em 2026-09-24 — Decisão 14:** se a opção `i18n` do `@astrojs/sitemap` não parear os
segmentos traduzidos, o 071 usa o ramo `serialize` da mesma integração, a partir do mapa do 056. Isso
**não** reabre a Decisão 10, e o ramo está autorizado sem nova consulta. (Registro original da questão,
abaixo.)

Era técnica, mas mexia no mecanismo que a Decisão 10 nomeia, por isso ficou registrada em vez de
decidida em silêncio.

A Decisão 10 prescreve a opção `i18n` do `@astrojs/sitemap` para os pares `alternate`. Pelo que se
sabe da integração (não verificado neste fatiamento — ela ainda não está instalada), essa opção
**pareia URLs pelo caminho sem o prefixo de idioma** — `/x/` com `/en/x/`. Com os segmentos
traduzidos (RF-29: `/ensino/` ↔ `/en/teaching/`), só a Home formaria par. O plano 071 **mede
primeiro**; se a opção não parear as rotas traduzidas, o ramo previsto é preencher os `links` de cada
URL pela opção `serialize` **da mesma integração**, a partir do mapa de rotas do 056 — que a Decisão 6
já nomeia como a fonte do `hreflang`. Isso preserva a integração, o filtro das 404 e a lista de páginas
geradas pelo build; muda só o campo de configuração que produz os pares.

### Classificação dos campos exibidos em `/en` (regra das Decisões 4 e 13)

Coluna **Tipo**: **T** = traduzível, fallback da RN-06 — quando cai no PT, `lang="pt-BR"` **e** conta
para o aviso; **F** = factual (RN-07) ou, pela Decisão 13, texto que em geral já está em inglês — sem
`lang` e sem aviso; **P** = texto livre em português sem campo em inglês — pela Decisão 13, **`lang="pt-BR"`
sempre em `/en`, sem aviso**.

| Coleção | Campo exibido | Onde | Tipo | Em `/en` (Decisões 4 e 13) |
|---|---|---|---|---|
| perfil | `cargo`, `departamento`, `instituicao`, `resumo_home`, `bio` | Home, Sobre | T | fallback: `lang` + aviso |
| perfil | `formacao[].grau`, `formacao[].curso` (`en` no item, Decisão 7) | Home, Sobre | T | fallback: `lang` + aviso |
| perfil | `atuacao[].cargo` (`en.cargo` no item, Decisão 8) | Sobre | T | fallback: `lang` + aviso |
| perfil | `areas[].nome` (`en.nome` no item, Decisão 7) | Home | T | fallback: `lang` + aviso |
| perfil | `nome`, `email`, `links.*`, `formacao[].ano` | Home, Sobre | F | sem `lang`, sem aviso |
| perfil | `formacao[].instituicao`, `atuacao[].instituicao` | Sobre | P | marca `lang`, sem aviso |
| perfil | `atuacao[].periodo` (texto livre, hoje "atual") | Sobre | P | marca `lang`, sem aviso |
| linhas-pesquisa | `titulo`, `resumo`, `corpo` | Pesquisa | T | fallback: `lang` + aviso |
| projetos | `titulo`, `descricao` | Pesquisa | T | fallback: `lang` + aviso |
| projetos | `periodo.inicio`, `periodo.fim` | Pesquisa | F | sem `lang`, sem aviso |
| projetos | `financiador`, `colaboradores[]` | Pesquisa | P | marca `lang`, sem aviso |
| disciplinas | `nome`, `descricao`, `ementa` | Ensino, Disciplina | T | fallback: `lang` + aviso |
| disciplinas | `codigo`, `semestre`, `aulas[].numero`, `aulas[].data`, `listas[].data_entrega`, todo `url`, `scripts[].codigo` | Ensino, Disciplina | F | sem `lang`, sem aviso |
| disciplinas | `aulas[].titulo`, `aulas[].descricao` (inclui "Última aula" em Ensino) | Ensino, Disciplina | P | marca `lang`, sem aviso |
| disciplinas | `listas[].titulo`, `materiais[].titulo`, `materiais[].descricao`, `bibliografia[].referencia`, `links[].titulo`, `scripts[].titulo`, `scripts[].descricao` | Disciplina | P | marca `lang`, sem aviso |
| publicacoes | `resumo` (`en.resumo`) | **não exibido** (§6.6 da identidade; Decisão 15) | T | — |
| publicacoes | `ano`, `doi`, `arxiv`, `pdf_url`, `autores[]` | Publicações | F | sem `lang`, sem aviso |
| publicacoes | `titulo`, `veiculo` | Publicações | F (Decisão 13: em geral já em inglês) | sem `lang`, sem aviso |

Datas (`aulas[].data`, `listas[].data_entrega`) são factuais no valor e formatadas pelo locale da rota
(§8.3: "March 15, 2026" em `/en`).

## Estado

| Plano | Título | Status | Executável por | Agente | Commits |
|---|---|---|---|---|---|
| 055 | Ferramenta de comparação do `dist/` normalizado | 🟢 DONE | agente | implementer (sonnet) | `0ebf8ed` (correções `efe15c8`, `9cb54f1`) |
| 056 | Mapa de rotas PT↔EN, idioma pelo caminho e navegação por idioma | 🟢 DONE | agente | implementer (sonnet) | `d44a874` |
| 057 | Dicionário `en.ts`, chaves novas e `strings(lang)` | ⬜ TODO | agente + **stakeholder** (revisão do inglês) | implementer (sonnet) | — |
| 058 | Layout e cabeçalhos escolhem o dicionário pelo caminho | ⬜ TODO | agente | implementer (sonnet) | — |
| 059 | Componentes de conteúdo e data por idioma | ⬜ TODO | agente + orquestrador (navegador) | implementer (sonnet) | — |
| 060 | Tradução dentro do item: `formacao[]`, `atuacao[]` e `areas[]` (Decisões 7 e 8) | ⬜ TODO | agente + orquestrador (painel e cloud check) | implementer (sonnet) | — |
| 061 | Fallback por campo (RN-06) | ⬜ TODO | agente | implementer (sonnet) | — |
| 062 | Views: Home, Sobre e 404 | ⬜ TODO | agente + orquestrador (navegador) | implementer (sonnet) | — |
| 063 | Views: Pesquisa e Ensino | ⬜ TODO | agente + orquestrador (navegador) | implementer (sonnet) | — |
| 064 | Views: Disciplina e Publicações | ⬜ TODO | agente + orquestrador (navegador) | implementer (sonnet) | — |
| 065 | `/en/` e `/en/about/`, com o aviso de idioma (F-07) | ⬜ TODO | agente + orquestrador (navegador) | implementer (sonnet) | — |
| 066 | `/en/research/` e `/en/publications/` | ⬜ TODO | agente + orquestrador (navegador) | implementer (sonnet) | — |
| 067 | `/en/teaching/` e `/en/teaching/<slug>/` | ⬜ TODO | agente + orquestrador (navegador) | implementer (sonnet) | — |
| 068 | 404 em inglês e a prova do Worker (RF-27, Decisão 9) | ⬜ TODO | agente + orquestrador (produção) | implementer (sonnet) | — |
| 069 | Seletor de idioma (RF-29) | ⬜ TODO | agente + orquestrador (navegador) | implementer (sonnet) | — |
| 070 | `canonical` e `hreflang` com `x-default` (RF-30) | ⬜ TODO | agente | implementer (sonnet) | — |
| 071 | Sitemap bilíngue com `@astrojs/sitemap` (RF-30, Decisão 10) | ⬜ TODO (ramo `serialize` autorizado, Decisão 14) | agente | implementer (sonnet) | — |
| 072 | Testes i18n sobre o `dist/`: par EN de toda rota PT e M-07 (Decisão 12) | ⬜ TODO | agente | implementer (sonnet) | — |
| 073 | Verificação transversal e fechamento da fase 4 | ⬜ TODO | orquestrador (navegador) + agente (documentos) | implementer (sonnet) | — |

**Numeração é global e contínua e não é ordem de execução.** A ordem está abaixo.

### Onde cada item do §12 fecha

| Item do §12 (fase 4) | Plano |
|---|---|
| Roteamento i18n configurado (PT na raiz, EN em `/en`) | **065** — primeira árvore `/en` servida, com o mapa de rotas do 056 |
| Dicionários `src/i18n/` com todas as strings de interface, `en.ts` revisado pelo stakeholder (Decisão 11) | **057** |
| Nenhuma string de interface hardcoded em componente (§10.4) | **072** — teste nos dois sentidos (valor `pt` em `/en/**`, valor `en` nas rotas PT); inspeção no 073 |
| Utilitário de fallback por campo implementado e testado (RN-06) | **061** |
| Rotas EN espelhando as rotas PT, inclusive a 404 em `/en` (RF-27) | **068**, com 065, 066 e 067 — o 072 acrescenta o teste "toda rota PT tem par EN" |
| Seletor de idioma preservando a página atual (RF-29) | **069** |
| `hreflang`, canonical e sitemap bilíngue (RF-30) | **071**, com o 070 |
| M-07 verificada: zero strings PT de interface nas rotas EN | **073** — teste do 072 mais a inspeção manual de todas as rotas EN |
| Grupo `en` do `perfil` cobre `atuacao[]` (cargo), no Zod e no Tina, com o teste de paridade | **060** |

Os planos 055, 056, 058, 059, 062, 063 e 064 **não** fecham item sozinhos: são pré-requisitos. **A
marcação do §12 e o §0 do PRD são do orquestrador na promoção de cada plano**; o 073 fecha a fase.

## Ordem de execução

Execução **um plano por vez**, com confirmação do usuário antes de cada um (memória do projeto).

```
055 ferramenta de comparação
 └─ 056 mapa de rotas ──┐
057 dicionário en ──────┼─ 058 layout e cabeçalhos ─┐
                        └─ 059 componentes e data ──┤
060 schema (Decisões 7 e 8) ────────────────────────┤
061 fallback (RN-06) ← 056                          │
                                                    ├─ 062 views Home/Sobre/404 (← 060)
                                                    ├─ 063 views Pesquisa/Ensino
                                                    └─ 064 views Disciplina/Publicações
065 /en/ e /en/about/ ← 057 DONE, 061, 062
066 /en/research/ e /en/publications/ ← 065, 063, 064
067 /en/teaching/ e /en/teaching/<slug>/ ← 065, 063, 064
068 404 EN + Worker ← 065, 062
069 seletor ← 066, 067, 068
070 canonical e hreflang ← 066, 067, 068
071 sitemap ← 070
072 testes i18n do dist/ ← 069, 070
073 fechamento ← todos
```

Ordem sugerida: **055 → 056 → 057 → 058 → 059 → 060 → 061 → 062 → 063 → 064 → 065 → 066 → 067 → 068
→ 069 → 070 → 071 → 072 → 073.** A revisão do inglês pelo stakeholder (057) é um portão de DONE, não
de início: enquanto ela não sai, 060 e 061 podem ser executados, porque não dependem do `en.ts`.

**Entre o 065 e o 068 a árvore `/en` fica incompleta** (a Home em inglês aponta para rotas que ainda
não existem), e **até o 069 ela não tem link de entrada** vindo das páginas PT. Aceito no fatiamento:
nenhum visitante chega a `/en` sem digitar o endereço, e o produto só expõe a árvore quando o seletor
entra.

### Paralelismo (registro; a execução é sequencial)

| Par / grupo | Poderia? | Motivo |
|---|---|---|
| 060 ∥ 061 | ✅ na edição | arquivos disjuntos; ❌ no build (um `build:pipeline` por vez no working tree) |
| 062 ∥ 063 ∥ 064 | ❌ | os três rodam o comparador sobre o mesmo `dist/` e o retrato "antes" de um é invalidado pelo outro |
| 071 ∥ qualquer plano | ❌ | edita `package.json`/`package-lock.json` |
| 068 ∥ qualquer plano, no passo de produção | ❌ | a prova do 404 é feita sobre um push; outro push na janela confunde a versão que respondeu |
| `src/i18n/pt.ts`, `src/i18n/en.ts` | ⚠️ | **só o 057 edita.** Chave faltando em outro plano = **para e reporta**; o orquestrador acrescenta a chave num commit próprio, com a mesma revisão do stakeholder para o texto em inglês |
| `src/content.config.ts`, `tina/config.ts`, `tina/tina-lock.json` | ⚠️ | **só o 060 edita** |

## Decisões tomadas no fatiamento (não se renegociam no plano)

Cada uma está, com o detalhe, no "Contexto necessário" do plano que a implementa. As marcadas com
**(produto)** tocam aparência ou modelagem; o orquestrador pode levá-las ao stakeholder antes do
plano correspondente, mas elas não bloqueiam.

1. **Sem a configuração `i18n` do Astro.** O roteamento é a árvore `src/pages/en/` mais o mapa de
   rotas de `src/lib/routes.ts` (056). Os segmentos são traduzidos (`/sobre/` ↔ `/en/about/`), e os
   utilitários de URL do Astro (`getRelativeLocaleUrl`) só trocam o prefixo; o idioma já corre como
   prop (Decisão 6) e o sitemap tem configuração própria (071). Acrescentar a configuração sem uso
   seria só superfície nova.
2. **Quem sabe o idioma.** Cada página fina declara `lang` e o passa à view (Decisão 6). Abaixo da
   view, os componentes compartilhados (`BaseLayout`, `SiteHeader`, `ExternalLink`, …) **derivam o
   idioma do caminho** com `localeFromPath(Astro.url.pathname)` (056), em vez de receber prop: são
   usados em dezenas de pontos e uma prop esquecida cairia em português sem erro. O teste de `lang`
   por árvore (065) pega página no lugar errado.
3. **Views em `src/views/`**, com sufixo `View.astro` (`HomeView.astro`, `AboutView.astro`, …). O
   §7.5 do PRD ganha a pasta na promoção do 062 (orquestrador).
4. **Só o 057 edita os dicionários.** Ele acrescenta de uma vez todas as chaves que a fase usa:
   `site.description` (a meta description sai de `siteConfig.description`, que é texto em português
   fora do dicionário e furaria a M-07 sem nenhum teste ver), `language.code`/`language.name`
   (seletor), `fallback.notice` (aviso da Decisão 4) e `date.format` (data por locale, §8.3).
5. **Chave de `<title>` por rota (dívida (d) da fase 3):** rotas fixas usam `t.nav[chave]`; a 404 usa
   `t.notFound.title`; a disciplina usa o nome. `about.eyebrow` sai do dicionário (057).
6. **Data em `/en`:** "March 15, 2026" (§8.3), montada por `en.date.format` com os meses no próprio
   `en.ts` — sem `Date` nem `Intl`, pela mesma razão de fuso do `date.ts` atual. Mês fora de 01–12
   devolve o valor como digitado (o PT de hoje não valida calendário; o EN não inventa mês).
7. **(produto) Lugar do aviso de idioma (065):** nas páginas internas, primeira linha da área de
   conteúdo, logo abaixo da régua do cabeçalho, em `text-pequeno`/`--secundario`; na Home, primeira
   linha sob a régua, na largura toda. Home e Sobre continuam sem rolagem vertical a 1440×800 e
   1366×650 (§4 da identidade) — se o aviso quebrar isso, o plano para e reporta.
8. **(produto) Lugar do seletor (069):** no `SiteHeader`, no comentário reservado, entre o nome e o
   botão "Menu" (fora do menu recolhível); na Home, que não usa o `SiteHeader`, como último item da
   linha da navegação. Na 404, o seletor aponta para a **Home** do outro idioma — a 404 é servida em
   qualquer caminho e "a mesma página" não existe.
9. **404 sem `canonical` nem `hreflang`**, e fora do sitemap (Decisão 10 já tira as duas do sitemap).
10. **(produto) Campo opcional vazio em PT e preenchido em EN:** em `/en` mostra o inglês; em PT não
    mostra nada (RF-21, campo vazio não deixa rastro). A RN-06 só define o caso contrário.
11. **(produto) `areas[].en` é grupo, não texto:** `areas[i] = { nome, en?: { nome? } }`, com o mesmo
    formato de grupo "Versão em inglês" de `formacao[i].en` e `atuacao[i].en` — o fallback lê
    `item.en?.campo` da mesma forma nos três.
12. **Parâmetros do teste da M-07 (Decisão 12), no 072:** compara texto visível **e** valores de
    atributo (exceto `href`, `src`, `srcset`, `class`, `id`, `style`, `lang`, `hreflang`, `rel`,
    `type`, `for`, `role`, `tabindex`, `data-astro-*`), depois de remover as subárvores com
    `lang="pt-BR"` e os blocos `<script>`/`<style>`; comprimento mínimo **4 caracteres** (abaixo disso
    todo valor atual é sigla igual nos dois idiomas: `EN`, `PT`, `DOI`, `PDF`, `R`); casamento
    **sensível a maiúsculas e com fronteira de palavra Unicode**; valores que são função entram pelos
    trechos fixos (`pt.course.lessonNumber` → `"Aula "`); a lista de exceções (valores iguais nos dois
    idiomas) vive em `tests/i18n/excecoes-m07.ts`, criada no 057 e reusada no 072.
13. **Prova de "sem mudança de comportamento" (Decisão 6):** `scripts/comparar-dist.mjs` (055) —
    retrato do HTML normalizado de cada rota antes e depois. A normalização tira o que muda por
    construção quando marcação muda de arquivo: atributos `data-astro-cid-*`, nomes com hash em
    `/_astro/`, e os blocos `<script>`/`<style>`/`<link rel="stylesheet">`. O que ela tira é conferido
    no navegador, não pelo comparador.
14. **404 em inglês com nome de arquivo garantido (068):** se o Astro gerar `dist/en/404/index.html` em
    vez de `dist/en/404.html` (o caso especial do Astro vale para `/404`, não para `/en/404` — a
    confirmar no build), o plano está pré-autorizado a renomear o arquivo num gancho
    `astro:build:done` de `astro.config.mjs`. É tática de build, estática (D-01); não muda o RF-27.

## Dívidas herdadas — onde cada uma cai

Da seção "Entre a fase 3 e a 4" de [`plans/README.md`](../README.md) e do
[README da fase 3](../fase-3-site-publico/README.md):

| Dívida | Onde cai |
|---|---|
| No máximo um `vt-nome` e um `vt-menu` por página | O teste de `tests/dist/site-gerado.test.ts` já percorre todo `.html`; cada plano de rota EN o roda (065–068) e o seletor (069) não pode levar classe `vt-*` |
| Lugar do seletor marcado por comentário no `SiteHeader.astro` | **069** |
| Linha de projeto duplicada em `pesquisa.astro` | **063** (`ProjectItem.astro`) |
| `hover:underline` sem o afastamento único em `CourseResources`/`LessonList` | **059** (diferença esperada e listada) |
| Páginas acima de 150 linhas (`sobre`, `pesquisa`, `publicacoes`, `ensino/[slug]`) | **062–064**: páginas finas e views abaixo de 150 |
| (d) `<title>` de chaves heterogêneas | **057** (decisão 5 acima) |
| (e) Rotas escritas à mão fora de `NAV_ITEMS` | **056** + **062–064** (todo `href` interno sai de `routePath`/`coursePath`); o teste de cruzamento com o `dist/` entra no **072** |
| `perfil.atuacao[]` sem par no grupo `en` | **060** |
| Demais dívidas da fase 3 (F-08 com duas definições, Tailwind varrendo `plans/`, tag-link, `noPrevious` sem canário, …) | **Nenhum plano desta fase.** Continuam onde estão |

## Verificação no navegador (vale para todo plano marcado "orquestrador (navegador)")

Comportamento de UI se prova exercitando a interface (memória do projeto). O navegador com a
extensão nesta máquina é o **Vivaldi**; a **aba precisa estar visível** para as View Transitions.

```
npm run build:pipeline        (precisa de TINA_CLIENT_ID/TINA_TOKEN no .env)
npx astro preview             →  http://localhost:4321   (a 404 se verifica no `npx wrangler dev`, 068)
```

Em cada rota do plano, carregue a página num `<iframe>` de **360**, **768** e **1440** px
(`box-sizing: content-box`, `innerWidth` conferido igual à largura) e transcreva:

```js
[document.documentElement.scrollWidth, document.documentElement.clientWidth]
```

Os dois números têm de ser **iguais** (RF-26). Registre também, por largura, elemento cortado
(sim/não), e o que o plano pedir (aviso, `lang`, seletor). A tecla Tab enviada pela extensão **não
move o foco** nesta máquina: foco por teclado é verificação manual do stakeholder, declarada, nunca
"observado" pelo orquestrador. Transcreva data e horário. Encerramento: `Ctrl+C` no servidor — nada em
background.

## Verificação autoritativa

```
npm ci                         →  não reescreve o lock (071: lock novo, conferir o churn)
npm audit --audit-level=high   →  exit 0 (ADR-0010)
npm run lint                   →  exit 0
npm run format:check           →  All matched files use Prettier code style!  (cobre docs/*.md)
npm run test:coverage          →  verde, thresholds impostos
npm run build:pipeline         →  vitest tests/content verde; astro check 0/0/0; Complete!
npm run test:dist              →  verde sobre o dist/ recém-gerado
CI do GitHub Actions           →  conclusion "success" no commit empurrado
Workers Builds                 →  check "Workers Builds: haroldo-page" success no mesmo commit
```

**Leia a saída do `astro check`**: ele já encerrou com `0 errors` imprimindo `[ERROR] [content]`.
Vitest com `CLAUDECODE` no ambiente troca para o reporter `agent`; quando a lista de testes aprovados
importar para a Evidência, rode `npm test -- --reporter=verbose`. Python no Git Bash:
`~/anaconda3/python.exe`.

## Portão de qualidade

**Os blocos que todo despacho carrega estão em [`plans/DESPACHO.md`](../DESPACHO.md).** A seção
"Regras de código da fase 3" daquele arquivo aponta para o README da fase 3; **nesta fase valem as
regras abaixo**, que o despacho deve citar pelo caminho deste README.

Antes do commit de promoção: `node scripts/verificar-promocao.mjs <plano>`. Um plano só vira `DONE`
com verificação independente com saída real **e** revisão de código aprovada **e** CI verde no commit
empurrado.

## Regras de código que todo plano desta fase herda

- **Cabeçalho obrigatório do §10.1** em todo `.ts`, `.mjs` e `.astro` novo (em `.astro`, dentro do
  frontmatter). Autor `Desenvolvedor`, datas absolutas. **TSDoc** em toda função exportada e todo
  componente, com o comportamento de prop ausente (§10.2).
- **Comentário com o identificador do PRD** em toda regra de negócio (§10.3) — e **o identificador
  certo**: `tests/lib/citacoes-do-prd.test.ts` confere que o identificador existe, **não** que é o
  certo, e a fase 3 teve cinco citações trocadas. Nesta fase: fallback é **RN-06**; campo factual é
  **RN-07**; PT canônico é **RN-09**; aviso de idioma é **F-07** (não F-08, que é imagem ausente);
  404 é **RF-27**; rotas EN com fallback **RF-28**; seletor **RF-29**; SEO/sitemap **RF-30**; strings
  PT em `/en` é **M-07**; rascunho **RN-01**. Decisão de sabatina se cita como "sabatina fase 4,
  Decisão N", não como identificador do PRD.
- **Nenhuma string de interface fora de `src/i18n/`** (§10.4). Chave faltando: para e reporta.
- **Todo `href` interno sai de `routePath`/`coursePath`** (056), com barra final (`auto-trailing-slash`
  do Worker responde 307 sem ela).
- **Identificadores em inglês**; campos de frontmatter em português. Sem `any`, sem `process.env` sob
  `src/`, sem `set:html` com conteúdo do professor, sem requisição a terceiro.
- **Componentes e views < 150 linhas** (§10.4, "alvo"). Arquivo de teste não entra.
- **O schema só muda no 060.** Qualquer outro plano que precise, para e reporta.
- **Canário que toca `content/` só com autorização no próprio plano**, listando o arquivo; revertido
  com `git checkout -- <arquivo>` (seguro: `content/` está commitado), reversão provada por
  `git status --short` sem `content/` e `git diff -- content/` vazio, e build refeito depois para os
  blocos que descrevem o `dist/`. **Nunca** `git checkout --` em arquivo novo ainda não commitado.
- **HTML do `dist/` sai minificado numa linha:** `grep -c` só devolve 0 ou 1. Conte com
  `grep -o … | wc -l`, e escope ao `<main>` quando cabeçalho e menu repetem o texto.
- **Rota EN nova atualiza `tests/dist/site-gerado.test.ts` no mesmo plano** — ele afirma hoje
  `lang="pt-BR"` em todo `.html`, procura `aria-label="Navegação principal"` e trata só
  `dist/index.html` como a Home (ver 065).

## Por onde isto pode dar errado

1. **`isActivePath` trata `/` como caso especial, e só ele.** A Home EN (`/en/`) é prefixo de toda
   rota EN; sem generalizar a regra, "Início" ficaria ativo em toda página `/en` (056).
2. **`Astro.url.pathname` no build** pode vir com ou sem barra final (`/sobre` × `/sobre/`) e é `/404`
   na 404. `localeFromPath` e `counterpartPath` aceitam as formas (056).
3. **O `astro.config.mjs` importa TypeScript de `src/lib/`** a partir do 071. `src/lib/routes.ts` não
   pode ter import de valor de `src/lib/config.ts` (que lê `import.meta.env`) — só `import type`.
4. **Mudar `areas` de string para objeto é mudança incompatível para o TinaCloud** — o conteúdo migra
   no mesmo commit, e a ordem de fechamento de plano que muda schema vale (060).
5. **`tina/tina-lock.json` só se regenera por `tinacms dev`** (`npx tinacms dev -c "echo ready"`,
   plano 017), com a porta 9000 livre. `tests/content/tina-lock-coerente.test.ts` reprova lock defasado.
6. **Mover `<style>` e `<script>` de arquivo muda o hash** dos atributos `data-astro-cid-*` e dos
   arquivos em `/_astro/` — daí a normalização do comparador (055) e a verificação no navegador.
7. **A 404 em inglês pode sair como `dist/en/404/index.html`** (decisão 14) e o Worker procura
   `404.html`.
8. **Existe conteúdo real com `publicado: false`**
   (`content/publicacoes/2023-exemplo-notas-sobre-geodesicas-nulas-em-metricas-estacionarias.md`) — é
   a prova viva da RN-01 também em `/en`.
9. **Só uma linha de pesquisa tem grupo `en`** (`relatividade-geral-e-teorias-alternativas-de-gravitacao.md`,
   só `en.titulo`): é o único caso real de tradução parcial. Os demais ramos (item traduzido por
   inteiro, página toda traduzida sem aviso) só se provam por canário.
