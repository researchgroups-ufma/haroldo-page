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

- [x] `<h1>` = `perfil.nome`; cargo, departamento, instituição e `resumo_home` presentes (RF-20)
- [x] Três células-link com contagem real de publicados: `02`, `01`, `05` no conteúdo atual (RN-01 provado pelo canário) — canário (a) prova RN-01 pela trilha de publicações; a mesma função `filterPublished` é usada nas três contagens (revisor confirmou linha a linha), mas a célula de Ensino não tem canário nem dado próprio que a exercite hoje — ver "Achados da revisão" e "O que não foi reproduzido"
- [x] Contagem zero mantém a célula com `00` e "nenhuma publicada ainda"
- [x] Sem foto, três colunas e nenhum `<img>` (F-08)
- [x] `[scrollWidth, clientWidth]` iguais em 360/768/1440, transcritos com data e horário
- [x] Nenhuma string de interface fora de `src/i18n/pt.ts`
- [x] `astro check`, `lint`, `format:check`, `test:coverage`, `build:pipeline` verdes, com saída colada

## Evidência

**Aviso de data, para não esconder:** o despacho original desta execução trazia
`Atualizado em: 2026-09-18` (erro de fuso do orquestrador — a data local era 2026-09-17). O
orquestrador corrigiu com `sed` só a linha 14 do cabeçalho `§10.1`, depois desta execução. As
saídas que o executor colou originalmente para os passos 1, 2 e 6 precediam essa correção,
então descreviam o arquivo com `Atualizado em: 2026-09-18` — uma linha de comentário dentro do
bloco `/** */`, que não chega ao HTML. Elas **não eram** a evidência autoritativa desses três
passos e foram substituídas abaixo pela execução do `triage-runner`, feita depois da correção,
sobre um `dist/` com saída HTML **equivalente nos pontos verificados** ao do executor (o
`triage-runner` reexecutou os greps do passo 3 sobre o `dist/index.html` de 22:39 e obteve,
linha por linha, o mesmo resultado — não é uma afirmação de identidade de bytes, que ninguém
verificou). Os greps do passo 3 e os canários do passo 4, abaixo, são os que o executor colou —
descrevem HTML gerado e comportamento de runtime, que a linha de comentário de data não altera.

### Passos 1, 2 e 6 — execução autoritativa (triage-runner, 2026-09-17 22:38)

```
Execução autoritativa — triage-runner, 2026-09-17 22:38
Rodada DEPOIS da correção de data no cabeçalho (mtime de src/pages/index.astro 22:34:29 <
triage 22:38 < dist/index.html 22:39). Substitui as saídas dos passos 1, 2 e 6, que
precediam a correção.

Higiene prévia: nenhum listener nas portas 9000 e 4321.

npm ci                          -> PASSOU. added 1515 packages, audited 1516 packages in 35s.
                                   git status --short package-lock.json -> vazio (lock intacto).
                                   warning pré-existente: prebuild-install@7.1.3 deprecated.

npm audit --audit-level=high    -> PASSOU (exit 0). 8 vulnerabilidades, todas moderate:
                                   qs 2.2.5-6.15.3 (via body-parser -> express) e
                                   react-router 6.0.0-7.17.0 (via tinacms/@tinacms/app/@tinacms/cli).
                                   Abaixo do limiar high do ADR-0010.

npm run lint                    -> PASSOU (exit 0)

npm run format:check            -> PASSOU
                                   Checking formatting...
                                   All matched files use Prettier code style!

npm run test:coverage           -> PASSOU
                                    Test Files  14 passed (14)
                                         Tests  236 passed (236)
                                      Start at  22:38:22
                                      Duration  2.44s
                                   Statements   : 100% ( 179/179 )
                                   Branches     : 98.88% ( 89/90 )
                                   Functions    : 100% ( 53/53 )
                                   Lines        : 100% ( 162/162 )
                                   Única linha não coberta: src/lib/navigation.ts:51 (pré-existente).

npm run build:pipeline          -> PASSOU
                                   vitest run tests/content: 4 arquivos, 108 testes, 1.23s
                                   Tina build complete.
                                   astro check: Result (42 files) - 0 errors, 0 warnings, 0 hints
                                   astro build: 1 page(s) built in 1.22s. Complete!

Armadilha dos planos 020/021: grep -inE "\[error\]|\[warn\]|deprecat" sobre a saída COMPLETA do
build:pipeline salva em arquivo -> zero ocorrências.

Greps sobre o dist/index.html recém-gerado:
  grep -o '<h1[^>]*>[^<]*'
    <h1 class="text-display-1 titulo-entrada lg:col-span-7" data-astro-cid-lcdefpme>Haroldo Cilas Duarte Lima Junior
  grep -o '>0[0-9]<'
    >02<  >01<  >05<        (NÃO apareceu 06 — o filtro da RN-01 está aplicado)
  grep -c '<img'
    0
  grep -o 'class="sr-only"[^>]*>[^<]*'
    class="sr-only" data-astro-cid-lcdefpme>2 linhas de pesquisa — Pesquisa
    class="sr-only" data-astro-cid-lcdefpme>1 disciplina neste semestre — Ensino
    class="sr-only" data-astro-cid-lcdefpme>5 publicações — Publicações
    class="sr-only" data-astro-cid-nns7i3if>(abre em nova aba)
    class="sr-only" data-astro-cid-nns7i3if>(abre em nova aba)
  grep -o 'href="/[a-z]*/"' | sort | uniq -c
    3 href="/ensino/"   4 href="/pesquisa/"   3 href="/publicacoes/"   2 href="/sobre/"

git status final: só os dois arquivos do plano; a verificação não tocou arquivo algum.

Comparação com a referência do plano 043: idêntica em pacotes (1515), vulnerabilidades (8
moderate), testes (14/236), cobertura (100/98,88/100/100) e arquivos do astro check (42).
Esperado — o 044 reescreve um arquivo existente e não acrescenta teste.
```

### Passo 3 — HTML gerado (`dist/index.html`, colado pelo executor; reconfirmado linha a linha pela execução autoritativa acima)

```
--- h1 ---
<h1 class="text-display-1 titulo-entrada lg:col-span-7" data-astro-cid-lcdefpme>Haroldo Cilas Duarte Lima Junior
--- numerals ---
>02<
>01<
>05<
--- img count ---
0
```

Bate com o esperado (§6.1, conteúdo atual): 02 linhas, 01 disciplina atual, 05 publicações,
nenhum `<img>` (perfil sem `foto`).

### Passo 4 — Canários

**(a) RN-01** — troquei `filterPublished(await getCollection('publicacoes')).length` por
`(await getCollection('publicacoes')).length`, `astro build`:

```
--- numerals after canary (a) ---
>02<
>01<
>06<
```

Confirma RN-01: sem o filtro de publicado, a contagem sobe para 06 (5 publicadas + 1 rascunho,
`publicado: false`).

**(b) contagem zero** — troquei `researchCount = filterPublished(...)` por `researchCount = 0`,
`astro build`:

```
<a href="/pesquisa/" class="caminho-celula hover:bg-bloco block py-8 transition-colors duration-[120ms]" data-astro-cid-lcdefpme>
  <span aria-hidden="true" class="text-numeral block" data-astro-cid-lcdefpme>00</span>
  <span aria-hidden="true" class="text-pequeno text-secundario mt-2 block" data-astro-cid-lcdefpme>nenhuma publicada ainda</span>
  <span aria-hidden="true" class="mt-4 flex items-center gap-1 text-[0.9375rem]" data-astro-cid-lcdefpme>Pesquisa <span aria-hidden="true" data-astro-cid-lcdefpme>›</span></span>
  <span class="sr-only" data-astro-cid-lcdefpme>0 nenhuma publicada ainda — Pesquisa</span>
</a>
```

**Reversão** — desfeita à mão nos dois casos (nunca `git checkout`, o arquivo commitado é o
placeholder do plano 042, não a Home), comprovada por:

```
$ git diff src/pages/index.astro | grep -n "researchCount\|currentCoursesCount\|publicationsCount"
58:+const researchCount = filterPublished(await getCollection('linhas-pesquisa')).length;
59:+const currentCoursesCount = splitCourses(filterPublished(await getCollection('disciplinas')))
61:+const publicationsCount = filterPublished(await getCollection('publicacoes')).length;
```

As três contagens finais usam `filterPublished`.

### Passo 5 — Orquestrador, verificação no navegador

```
Verificação no navegador — plano 044 (Home)
Orquestrador, 2026-09-17 22:34 (horário local, São Luís UTC-3)
Método: iframes de 360, 768 e 1440 px sobre http://localhost:4321/ (astro preview sobre o
dist/ do passo 2). O resize_window da extensão não muda o viewport nesta máquina.
devicePixelRatio = 1.25.

RF-26 — sem rolagem horizontal [scrollWidth, clientWidth]:
   360 px -> [360, 360]     iguais
   768 px -> [768, 768]     iguais
  1440 px -> [1440, 1440]   iguais
  Nota de método: na primeira medição a 360 px o par saiu [345, 345] — iguais, portanto sem
  rolagem horizontal, mas 345 e não 360 porque a barra de rolagem vertical comia 15 px do
  viewport (a Home a 360 px é mais alta que o iframe de 1500 px). Repetida com iframe de
  3000 px de altura, o par deu [360, 360]. Registrado para que o 345 não seja lido como
  defeito de layout.

Conteúdo (RF-20), observado no DOM renderizado:
  <h1> = "Haroldo Cilas Duarte Lima Junior" (perfil.nome)
    font-size 1440 px: 76.48px (text-display-1)   360 px: 42px
  coluna direita: "Professor Adjunto A — Centro Tecnológico — Departamento de Física";
    "Universidade Federal do Maranhão (UFMA), Campus São Luís";
    parágrafo de resumo_home; PillButton "Ver pesquisa" -> /pesquisa/
  régua .regua-entrada: 1 ocorrência, abaixo do bloco superior
  <img>: 0 ocorrências (F-08, perfil sem campo `foto`)

Grade, por largura:
   360 px -> faixa de células em 1 coluna  (grid-template-columns: 320px)
   768 px -> 2 colunas (353.288px 353.288px); a terceira célula cai sozinha na 2ª linha
  1440 px -> 3 colunas (442.663px cada)
  bloco superior a 1440 px: 12 colunas, com o <h1> ocupando 7 (divisão 7/5 confirmada)

Células-caminho — contagens e acessibilidade (RN-01):
  /pesquisa/     numeral "02"  aria-hidden="true"   sr-only: "2 linhas de pesquisa — Pesquisa"
  /ensino/       numeral "01"  aria-hidden="true"   sr-only: "1 disciplina neste semestre — Ensino"
  /publicacoes/  numeral "05"  aria-hidden="true"   sr-only: "5 publicações — Publicações"
  Em cada célula os TRÊS blocos visuais estão aria-hidden="true" (numeral, rótulo, seção + ›)
  e só o <span class="sr-only"> fica exposto, com o numeral REAL (2, 1, 5), não o padCount.
  Conferido filho a filho no DOM das três células.
  Contagens batem com o esperado: 02 linhas, 01 disciplina atual, 05 publicações.

Destino dos links — as três rotas respondem 404 no preview:
  /pesquisa/    -> 404
  /ensino/      -> 404
  /publicacoes/ -> 404
  /sobre/       -> 404
  dist/ contém apenas dist/index.html e dist/admin/index.html.
  ESPERADO, não é defeito: essas rotas nascem nos planos 045-050, ainda TODO. O href de cada
  célula está correto e com barra final. Registrado conforme o passo 5 do plano pede.

Navegação por Tab: NÃO verificada. A tecla Tab enviada pela extensão não move o foco nesta
máquina (limitação já registrada no README da fase e na memória do projeto). Fica para o 053,
junto com as dívidas equivalentes do 042 e do 043.

Árvore de acessibilidade do DevTools: não usada. A verificação de nome acessível foi feita
lendo aria-hidden e o sr-only no DOM, elemento por elemento, não pela árvore — o passo 5 marca
esse item como opcional.
```

**Observações para a revisão decidir (nenhuma corrigida em código):**

1. A 768 px a terceira célula fica sozinha na segunda linha, deixando a metade direita vazia.
   Conforme o plano ("entre `sm` e `lg`, 2+"), não é violação de especificação — mas
   `SiteFooter.astro` (plano 042) resolve o caso ímpar esticando a célula pela linha inteira
   (`grid-column: 1 / -1` na última célula ímpar), e a Home não faz isso. É inconsistência de
   padrão entre dois componentes do mesmo site, registrada para a revisão avaliar se vale
   uniformizar.
2. O texto do `sr-only` na contagem zero sai "0 nenhuma publicada ainda — Pesquisa", redundante
   (`pt.home.noneYet` já é frase completa, e o "0" na frente soa estranho). O executor seguiu o
   plano à risca ("`{n}` `{rótulo}` — `{seção}`", numeral real), que é o comportamento correto
   dado o texto do plano — registrado para a revisão decidir se isso vira correção de código
   (ex.: omitir o numeral quando `count === 0`) ou emenda no texto do plano/identidade.

O passo 6 (portão de qualidade — `lint`, `format:check`, `test:coverage`) está coberto pela
execução autoritativa acima ("Passos 1, 2 e 6"); o bloco que o executor colou originalmente foi
substituído por ela, pelo mesmo motivo do aviso de data.

### Achados da revisão

**Achado principal — vai para emenda da fonte, não é defeito deste código.** `pt.home.noneYet`
("nenhuma publicada ainda") está semanticamente errado para a célula de Ensino: com zero
disciplinas **atuais**, a Home diria "00 / nenhuma publicada ainda", quando pode haver várias
disciplinas publicadas, todas com `status: anterior`. O dicionário já tem a frase correta
(`pt.teaching.noCurrent: 'Nenhuma disciplina neste semestre.'`, `src/i18n/pt.ts:126`). O código
está certo: o §6.1 da identidade diz, literalmente, "Contagem zero mostra `00` e o texto
'nenhuma publicada ainda'", sem distinguir célula, e o plano repete. O defeito está na fonte
única. O revisor conferiu as três coisas contra os arquivos. Caminho não exercitado hoje (há 1
disciplina atual publicada). Destino: decisão do dono do produto sobre emendar o §6.1 —
registrada pelo revisor, não resolvida aqui.

**Para o 053** — uniformizar a faixa de células, com o rodapé como referência. São dois sintomas
do mesmo item: (a) a 768 px a terceira célula fica sozinha na 2ª linha, enquanto
`SiteFooter.astro:130-132` estica a célula ímpar pela linha inteira; (b) o rodapé tem
`padding-right: 1.5rem` em `:not(:last-child)` a partir de `lg` e a Home não (`index.astro:175-180`),
então o texto da célula pode encostar na régua seguinte. Nenhum viola o §6.1, que não legisla
essa faixa.

**Anotação para a próxima edição do arquivo:** `id="caminhos-grade"` (`index.astro:111`) é
órfão — zero referências em `src/` e `tests/`, conferido por grep. Diferente do rodapé, que usa
`#rodape-grade` porque o CSS depende do id; aqui as colunas vêm das classes Tailwind. Não
corrigido agora (mudança fora do que a revisão exigiu); fica registrado.

**Descartados pelo revisor, com motivo:**
- `aria-hidden` aninhado redundante (`index.astro:129-130`) — inócuo.
- F-08 sem teste automatizado — não há harness de `.astro` no projeto; 042 e 043 passaram na
  mesma condição; destino é o plano de E2E.
- Literais `—` e `›` — pontuação, não string de interface.
- `text-[0.9375rem]` — casa com `PillButton` e `SiteHeader`, precedente aprovado.

### Julgamento das 181 linhas (§10.4)

O revisor julgou com a fonte aberta: o §10.4 do PRD diz "**Alvo** < 150 linhas" — é a única
linha daquela tabela escrita com hedge, contra "proibido"/"proibidas" das demais. A regra
alcança páginas (no Astro uma página é componente, e o README da fase usa
`src/pages/index.astro` como exemplo de onde vai o cabeçalho §10.1). Portanto: **alvo excedido,
não invariante violado**. Das 181 linhas, 29 são o bloco obrigatório do §10.1 e 27 o `<style>`
com escopo — lógica e template dão ~125.

Extrair não é correção deste plano: exigiria criar arquivo, que o 044 proíbe ("Arquivos
afetados" lista só `src/pages/index.astro`); a faixa de células não é exclusiva da Home (o §6.2
tem faixa de quatro células, no plano 046), então um componente inventado agora nasceria com a
API errada; e a extração certa é a da faixa inteira, hoje duplicada entre `SiteFooter.astro` e
`index.astro`. Registrado como **dívida para plano próprio**, não para o 053.

Ressalva de processo, sobre o trabalho deste executor: o conflito entre o alvo de 150 linhas e a
cerca de um arquivo só do plano **não apareceu na Evidência** original — o revisor o encontrou
sozinho. O plano manda "Se precisar, para e reporta". Não muda o artefato entregue, por isso não
bloqueou a aprovação, mas é a tensão que devia ter sido nomeada nesta execução e não foi.

### O que não foi reproduzido / NÃO rodou

- `npm ci`, `npm audit --audit-level=high` — o executor não rodou; cobertos pela execução
  autoritativa do `triage-runner` acima.
- CI do GitHub Actions, Workers Builds — fora do escopo de qualquer execução local; dependem do
  push que o orquestrador faz depois de commitar.
- **Canários do passo 4**: o `triage-runner` não pôde reexecutá-los (exigem `astro build` fora
  do escopo dele). Verificação indireta: `content/publicacoes/` tem 6 arquivos, 5 com
  `publicado: true` e 1 com `false`, o que torna o `06` do canário (a) aritmeticamente
  obrigatório.
- **RN-01 na célula de Ensino não está provada por canário nem por dado**: as duas disciplinas
  do conteúdo são `publicado: true`, então remover `filterPublished` de `disciplinas` não
  mudaria número algum hoje. O canário (a) provou só a trilha das publicações. A leitura do
  código está correta e `tests/lib/published.test.ts` cobre a função isoladamente. Cobertura de
  evidência, não defeito.
- **Medidas do navegador (passo 5)**: o `triage-runner` não tem navegador; confirmou coerência
  com o código (`lg:grid-cols-12` + `col-span-7/5` produz o 7/5; `grid-cols-1 sm:grid-cols-2
  lg:grid-cols-3` com `sm=40rem`/`lg=64rem` produz 1/2/3 em 360/768/1440), sem reexecutar a
  medição em si.
- **Tab**: não verificada por ninguém. Três planos seguidos (042, 043, 044) acumulam a mesma
  dívida; o 053 precisa fechá-la com harness próprio, não com a extensão do Chrome desta
  máquina.

### Estado final

`Status:` mantido em `TODO` pelo executor; a promoção a `DONE` é do orquestrador, no commit de promoção.
Nada commitado por este executor — o orquestrador commita em seguida, e o hash do commit entra
no `PRD.md` e nos índices da fase (`plans/README.md`, `plans/fase-3-site-publico/README.md`),
que são responsabilidade dele, não deste plano.
