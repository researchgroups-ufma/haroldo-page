# Plano 044 — Home (RF-20)

**Status:** TODO
**RFs cobertos:** **RF-20**, RN-01 (contagens só de publicados), F-08 (sem foto), RF-26
**Depende de:** planos 038 (`padCount`, `toParagraphs`), 039 (`filterPublished`, `requireSingleton`),
041 (`splitCourses`), 042 (layout), 043 (componentes)
**Modelo recomendado:** sonnet
**Agente recomendado:** implementer
**Executável por:** agente (código) + **orquestrador** (verificação no navegador)
**PRD:** `S:\Projetos\academic_page\haroldo\PRD.md`
**Projeto:** `S:\Projetos\academic_page\haroldo`

## Objetivo

A raiz do site mostra nome, cargo, departamento, instituição, a síntese `resumo_home`, a foto quando
houver e três células-caminho — Pesquisa, Ensino, Publicações — com a contagem real de itens
publicados.

## Arquivos afetados

- `src/pages/index.astro` — reescrito (hoje é o placeholder envolvido no layout pelo plano 042)

> O executor não toca em arquivo fora desta lista. Se precisar, para e reporta.
> `Status:` fica `TODO`. Não commite. Outros planos da onda 3 (045–048, 050, 051) podem estar
> editando `src/pages/*` em paralelo: não edite as páginas deles. **Não rode build ao mesmo tempo que
> outro executor** — combine com o orquestrador (README da fase, tabela de paralelismo).

## Contexto necessário

**Especificação:** `docs/identidade-visual.md` §6.1 (Home), §8 (primeira linha da tabela: `<h1>` =
nome) e §1 (regras). `ref/` não existe para você.

**Regras herdadas:** "Regras de código que todo plano desta fase herda" em
`plans/fase-3-site-publico/README.md`.

**Composição (§6.1):**
- `BaseLayout` sem `title` (a Home usa `siteConfig.title` como `<title>`).
- Bloco superior em duas colunas a partir de `lg` (`7 / 5`): esquerda `<h1 class="text-display-1
  titulo-entrada">` com `perfil.nome`; direita `cargo — departamento` (o `— departamento` só se
  houver), `instituicao`, `resumo_home` (por `toParagraphs`, parágrafos `text-corpo max-w-medida`) e
  `PillButton` `href="/pesquisa/"` com `pt.home.seeResearch`. Aqui não se usa `PageHeader`: a Home
  não tem rubrica; a régua forte abaixo do bloco usa a mesma `regua-entrada` (div `h-px bg-tinta`).
- Faixa de células: três links (a célula inteira é o `<a>`), cada um com numeral `text-numeral`
  (`padCount(n)`, `aria-hidden="true"`), rótulo com o que se conta e o nome da seção com `›`. Para
  leitor de tela, o texto acessível do link é "`{n}` `{rótulo}` — `{seção}`" (numeral real, não o
  `padCount`) num `<span class="sr-only">`, e as partes visuais ficam `aria-hidden`.
- Contagens (`// RN-01`):
  - linhas: `filterPublished(await getCollection('linhas-pesquisa')).length`, rótulo
    `pt.home.countResearchLines(n)`, destino `/pesquisa/`, nome `pt.nav.research`;
  - disciplinas: `splitCourses(filterPublished(await getCollection('disciplinas'))).current.length`,
    rótulo `pt.home.countCurrentCourses(n)`, destino `/ensino/`, nome `pt.nav.teaching`;
  - publicações: `filterPublished(await getCollection('publicacoes')).length`, rótulo
    `pt.home.countPublications(n)`, destino `/publicacoes/`, nome `pt.nav.publications`.
- **Contagem zero** mostra `00` e, no lugar do rótulo, `pt.home.noneYet`; a célula **não some** —
  é caminho de navegação (§6.1).
- **Foto (F-08):** se `perfil.foto`, quarta célula com `<img src={perfil.foto} alt={perfil.nome}
  loading="lazy" decoding="async">`, `object-cover`, `aspect-[4/5]`, filtro `grayscale` (§6.1 "p&b").
  Sem foto, a faixa vira **três** colunas — sem espaço reservado, sem ícone. O valor gravado pelo
  painel é caminho público (`media.tina.publicFolder: 'public'`, `mediaRoot: 'uploads'`,
  `tina/config.ts:92-96`), ex.: `/uploads/foto.jpg`. Otimização de imagem é fase 5.
- Grade: 1 coluna abaixo de `sm`; 3 (ou 4 com foto) a partir de `lg`; entre `sm` e `lg`, 2+.

**Valores esperados com o conteúdo atual** (conferidos em 2026-09-14, para você comparar, **não**
para escrever em teste): 2 linhas publicadas → `02`; 1 disciplina `atual` publicada → `01` com
"disciplina neste semestre"; 5 publicações publicadas (há 1 com `publicado: false`) → `05`; perfil
sem `foto` → três colunas. Se o build mostrar outro número, **pare e investigue** antes de ajustar.

**Nada de string de interface no componente** (`pt` para tudo). Os dados do perfil vêm do conteúdo.

## Passos

1. Reescrever `src/pages/index.astro` (cabeçalho §10.1 atualizado: descrição real, `Atualizado em: <data>`, versão) → verify: `npx astro check` com resumo colado.
2. Build → verify: `npm run build:pipeline` com saída colada.
3. HTML gerado → verify: cole `grep -o '<h1[^>]*>[^<]*' dist/index.html`, e as três ocorrências dos numerais (`grep -o '>0[0-9]<' dist/index.html`), e `grep -c '<img' dist/index.html` (esperado 0).
4. Canários (sem tocar em `content/`): (a) RN-01 — troque temporariamente `filterPublished(...)` das publicações por `(...)` sem filtro, `npx astro build`, cole o numeral `06`; (b) contagem zero — force temporariamente a contagem de linhas para `0`, `npx astro build`, cole o trecho do HTML da célula com `00` e "nenhuma publicada ainda"; reverta com `git checkout -- src/pages/index.astro` **somente se o arquivo estiver commitado**; caso contrário, desfaça a edição à mão e cole `git diff src/pages/index.astro` mostrando a versão final com `filterPublished` → verify: saídas coladas.
5. Orquestrador — "Verificação no navegador" do README da fase em `/`, larguras 360/768/1440: `[scrollWidth, clientWidth]`, elementos cortados, as três células clicáveis levando às rotas certas (as rotas podem ainda dar 404 se os planos delas não fecharam — registre), Tab percorrendo pílula e células com foco visível, leitor de tela (opcional; *Accessibility tree* do DevTools) mostrando o texto do `sr-only`.
6. Portão → verify: `npm run lint`, `npm run format:check`, `npm run test:coverage` colados.

## Critérios de aceitação

- [ ] `<h1>` = `perfil.nome`; cargo, departamento, instituição e `resumo_home` presentes (RF-20)
- [ ] Três células-link com contagem real de publicados: `02`, `01`, `05` no conteúdo atual (RN-01 provado pelo canário)
- [ ] Contagem zero mantém a célula com `00` e "nenhuma publicada ainda"
- [ ] Sem foto, três colunas e nenhum `<img>` (F-08)
- [ ] `[scrollWidth, clientWidth]` iguais em 360/768/1440, transcritos com data e horário
- [ ] Nenhuma string de interface fora de `src/i18n/pt.ts`
- [ ] `astro check`, `lint`, `format:check`, `test:coverage`, `build:pipeline` verdes, com saída colada

## Evidência

<Preenchido pelo executor (1–4, 6) e pelo orquestrador (5). Declare o que NÃO rodou.>
