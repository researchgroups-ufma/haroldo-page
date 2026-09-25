# Plano 072 — Testes i18n sobre o `dist/`: par EN de toda rota PT e M-07 (Decisão 12)

**Status:** TODO
**RFs cobertos:** **M-07**, §10.4 (nenhuma string de interface hardcoded), §11 (integração: "toda rota PT tem par EN"; "nenhum valor do dicionário `pt` no HTML de `/en/**` fora de `lang="pt-BR"`"); sabatina fase 4, Decisão 12; dívida (e) da fase 3; §12 fase 4, item 3
**Depende de:** planos 069 (seletor, cujo texto entra na conta), 070
**Modelo recomendado:** sonnet
**Agente recomendado:** implementer
**Executável por:** agente
**PRD:** `S:\Projetos\academic_page\haroldo\PRD.md`
**Projeto:** `S:\Projetos\academic_page\haroldo`

## Objetivo

`npm run test:dist` reprova se: uma rota PT não tiver par EN (ou vice-versa); uma rota do mapa não
existir no `dist/`; um valor do dicionário `pt` aparecer no HTML de `/en/**` fora de elemento
`lang="pt-BR"`; ou um valor do dicionário `en` aparecer nas rotas PT fora de elemento `lang="en"`.

## Arquivos afetados

- `tests/dist/i18n.test.ts` — novo
- `tests/dist/html-texto.ts` — novo (extração de texto e atributos, removendo subárvores por `lang`)

> O executor não toca em arquivo fora desta lista. Se precisar, para e reporta. `Status:` fica `TODO`.
> Não commite. **Nenhuma dependência nova** (sem parser de HTML do npm). Se o extrator não for viável
> sem dependência, pare e reporte.

## Contexto necessário

**Decisão 12** (`docs/sabatinas/CHANGELOG_sabatina_fase-4-i18n.md`): teste no `test:dist` que reprova
se qualquer valor do dicionário `pt` aparecer no HTML de `/en/**` **fora** de elementos
`lang="pt-BR"`, mais a inspeção manual (073). "O fatiamento define o comprimento mínimo das strings
comparadas e as exceções para valores iguais nos dois idiomas, cada uma listada no teste." Pega o
texto PT escrito direto num componente e o `en.ts` com valor copiado.

**Parâmetros fixados** (decisão de fatiamento 12 do README da fase):
- **O que se compara:** nós de texto e valores de atributo, **exceto** os atributos `href`, `src`,
  `srcset`, `class`, `id`, `style`, `lang`, `hreflang`, `rel`, `type`, `for`, `role`, `tabindex` e
  `data-astro-*`. Blocos `<script>` e `<style>` saem inteiros. Entidades HTML decodificadas antes da
  comparação (`&amp;`, `&#39;`, `&quot;`, `&lt;`, `&gt;` — o Astro escapa com `html-escaper`, ver
  `escapeLikeAstro` em `tests/dist/site-gerado.test.ts:80-89`).
- **Subárvores removidas:** em `/en/**`, todo elemento com `lang="pt-BR"` (e o que estiver dentro);
  nas rotas PT, todo elemento com `lang="en"` — **exceto o `<html>`**.
- **Comprimento mínimo:** 4 caracteres (depois de `trim`).
- **Casamento:** sensível a maiúsculas, com fronteira de palavra Unicode —
  `new RegExp('(?<![\\p{L}\\p{N}])' + escapado + '(?![\\p{L}\\p{N}])', 'u')`.
- **Funções do dicionário** (`pageTitle`, `portraitAlt`, `lessonNumber`, `dueDate`, `script.eyebrow`,
  `date.format`): avalie com um marcador sentinela e use os trechos fixos (ex.: `pt.course.lessonNumber`
  → `"Aula "` → aparado `"Aula"`), aplicando o mesmo mínimo de 4. `date.format` do PT não tem trecho
  fixo de 4+ caracteres — fica de fora, registrado.
- **Exceções:** `tests/i18n/excecoes-m07.ts` (057), reusado — nenhuma lista nova aqui.

**Extrator (`tests/dist/html-texto.ts`):** tokenizador mínimo sobre o HTML minificado (tags por regex,
pilha de elementos, lista dos elementos vazios do HTML — `area base br col embed hr img input link
meta source track wbr`), que devolve os textos e os atributos comparáveis, pulando as subárvores com o
`lang` pedido. O HTML do Astro é bem-formado; se um caso real quebrar a pilha, lance erro com a rota,
não engula. Teste o extrator dentro de `tests/dist/i18n.test.ts` com duas ou três strings pequenas
(aninhamento, elemento vazio, `lang` aninhado).

**Os testes:**
1. **Par EN/PT:** para cada `.html` de `dist/` fora de `admin/`, `counterpartPath(rota)` (056) aponta
   para um `.html` que existe; e toda rota EN tem par PT. As 404 pareiam com a Home do outro idioma
   (decisão de fatiamento 8) — trate-as pelo mapa, não por exceção solta.
2. **Mapa × `dist/` (dívida (e) da fase 3):** para cada `RouteKey` e cada idioma,
   `routePath(key, lang)` existe em `dist/`.
3. **M-07:** `pt` em `/en/**` fora de `lang="pt-BR"` → reprova nomeando rota, chave e trecho.
4. **Simétrico (§10.4):** `en` nas rotas PT fora de `lang="en"` → reprova. É o que pega texto de
   interface **em inglês** escrito direto num componente das rotas PT.

**Falso positivo possível, e o que fazer:** conteúdo do professor que **não** leva `lang` (os campos
"F" da tabela do README da fase — inclusive título e veículo de publicação, pela exceção da Decisão
13; os "P" levam `lang="pt-BR"` e saem da varredura) pode conter, por coincidência, uma palavra igual
a um valor do dicionário (ex.: um título de publicação começando por "Notas"). Se o teste reprovar por isso com o conteúdo real, **pare e reporte** com a rota e o trecho —
não acrescente exceção nem suba o mínimo para fazer passar; a saída é decisão do orquestrador.

**Por que isso fecha o item "Nenhuma string de interface hardcoded (§10.4)" do §12:** texto de
interface hardcoded em PT aparece em `/en` (teste 3), e em inglês aparece nas rotas PT (teste 4). O
limite — texto hardcoded que não coincide com nenhum valor de dicionário — fica para a inspeção manual
do 073; registre isso no cabeçalho do teste.

**Regras de código:** README da fase 4. Cabeçalho §10.1 nos dois arquivos, citando **M-07** e §10.4.

## Passos

1. Extrator e seus testes → verify: `npm run build:pipeline`; `npm run test:dist -- --reporter=verbose` colado (os testes do extrator verdes).
2. Os quatro testes → verify: `npm run test:dist -- --reporter=verbose` colado, com a lista de testes.
3. Canários, cada um revertido (arquivos commitados: `git checkout -- <arquivo>`), com rebuild quando mexer em `src/`: (a) `en.nav.about = 'Sobre'` em `src/i18n/en.ts` → teste 3 reprova (e o `en.test.ts` do 057 também); (b) texto `Publicações` escrito à mão num `<p>` do `PublicationsView` → teste 3 reprova em `/en/publications/`; (c) texto `Teaching` escrito à mão no `TeachingView` → teste 4 reprova em `/ensino/`; (d) apagar `dist/en/about/index.html` → teste 1 reprova → verify: as quatro saídas vermelhas, as reversões (`git status --short` limpo em `src/`) e o verde final colados.
4. Portão → verify: `npm run lint`, `npm run format:check`, `npm run test:coverage` colados.

## Critérios de aceitação

- [ ] Toda rota PT tem par EN e vice-versa; toda rota do mapa existe no `dist/`
- [ ] M-07 (valor `pt` em `/en/**` fora de `lang="pt-BR"`) e o simétrico (valor `en` nas rotas PT fora de `lang="en"`) com os parâmetros do Contexto
- [ ] Exceções só de `tests/i18n/excecoes-m07.ts`; mínimo de 4 caracteres; fronteira de palavra
- [ ] Extrator sem dependência nova, testado
- [ ] Os quatro canários do passo 3 vermelhos, revertidos, e a suíte verde no fim
- [ ] `lint`, `format:check`, `test:coverage`, `build:pipeline`, `test:dist` verdes, com saída colada

## Evidência

<Preenchido pelo executor ao concluir: saídas literais coladas, por passo. Plano sem esta seção preenchida não é DONE.>
