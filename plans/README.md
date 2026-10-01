# Planos de implementação — índice

Um diretório por fase do roadmap (§6.2 do PRD). **Cada fase tem seu próprio `README.md`** com o
estado dos planos, a ordem de execução, o grafo de dependências e as armadilhas aprendidas ali.
Este arquivo é só o mapa.

Última atualização: 2026-10-01 — **065 DONE** (`d96c659`): primeira árvore `/en` servida (`/en/` e `/en/about/`); próximo, o 066. Os eventos anteriores estão em [`docs/historico-de-implementacao.md`](../docs/historico-de-implementacao.md), §4.1.

## Fases

| Pasta | Fase | Estado | Planos |
|---|---|---|---|
| [`fase-0-setup-e-provisionamento/`](fase-0-setup-e-provisionamento/README.md) | 0 — Setup e provisionamento | 🟢 **Concluída** | 001–014, todos DONE |
| [`fase-1-modelo-de-conteudo/`](fase-1-modelo-de-conteudo/README.md) | 1 — Modelo de conteúdo | 🟢 **Concluída** (critério do §6.2 demonstrado) | 015–022, todos DONE — o 021 promovido em `7d5b7e6`, com CI verde sobre `26de58a` |
| [`fase-2-pipeline-de-publicacao/`](fase-2-pipeline-de-publicacao/README.md) | 2 — Pipeline de publicação ponta a ponta | 🟢 **Concluída (5/5)** | 023–035, todos DONE (o 027 e o 029 migraram para a fase 5) |
| [`fase-3-site-publico/`](fase-3-site-publico/README.md) | 3 — Site público em português | 🟢 **Concluída (12/12)** | 036–054, todos DONE |
| [`fase-4-internacionalizacao/`](fase-4-internacionalizacao/README.md) | 4 — Internacionalização | 🟡 **Em andamento** (4/9 no §12) — sabatinada e fatiada em 2026-09-24 ([`CHANGELOG_sabatina_fase-4-i18n.md`](../docs/sabatinas/CHANGELOG_sabatina_fase-4-i18n.md)) | 055–074; DONE: 055–065 e 074; próximo, o **066** |
| [`fase-5-polimento-e-entrega/`](fase-5-polimento-e-entrega/README.md) | 5 — Polimento e entrega | ⬜ Não iniciada | não fatiada; já contém os planos **027** e **029**, migrados da fase 2 em 2026-09-12 |

A ordem do roadmap **não** é 0→1→2→3→4→5 linear: a fase 2 vem antes do site público de
propósito. O PRD explica por quê — o maior risco do projeto é o ciclo de publicação, não o
layout, e é preferível descobrir que ele não fecha com conteúdo placeholder do que com o site
inteiro pronto. As dependências reais estão na tabela do §6.2.

**Decisão do stakeholder em 2026-09-03 — quando fatiar a fase 2.** A fase 2 só será planejada
**depois** de a fase 1 fechar integralmente (planos 019, 020 e 021 DONE), para que o fatiamento
já incorpore os problemas que a fase 1 descobriu e que só podem ser resolvidos na 2. A lista
desses itens é montada pelo plano 021, no README da fase 1 — o fatiamento começa lendo ela, não
do zero. **Cumprida em 2026-09-10:** a fase 1 fechou e a fase 2 foi fatiada em seguida, a
partir da lista dos sete itens no README da fase 1 — os 12 planos foram para
`fase-2-pipeline-de-publicacao/`, com o README da fase registrando onde cada uma das sete
dívidas caiu. **Dez continuam lá:** o 027 e o 029 mudaram de pasta em 2026-09-12, no recorte
descrito abaixo.

Vale notar, para quem for retomar: **a fase 3 depende formalmente só da fase 1**, não da 2 (ver a
coluna de dependências do §6.2). Antecipá-la é possível; o custo seria construir o site sem a
garantia de que o ciclo de publicação fecha. Não foi o caminho escolhido.

## Entre a fase 3 e a 4 — redesenho e polimento (2026-09-23 a 2026-09-24)

Trabalho fora do fluxo de planos numerados, feito na branch **`design`** (criada de `5c38a28`) por
decisão do stakeholder de aperfeiçoar o frontend antes da fase 4, e **integrado à `main` em
`00fdef9`** (fast-forward, 2026-09-24; CI `qualidade` e Workers Builds verdes, produção na versão
`44a1c293`). O trabalho volta para a `main`:

- **Redesenho** (`f7e7345`): o site num cartão contido que não rola a partir de `lg`; Home, Sobre,
  Ensino e Publicações novas; `perfil.atuacao[]` no CMS; GSAP na sanfona de Publicações; barra de
  rolagem própria. Sai o rodapé.
- **Polimento** (`ffb5304`..`f50f29f`, 10 commits): spec
  `docs/superpowers/specs/2026-09-23-polimento-design.md` e plano
  `docs/superpowers/plans/2026-09-23-polimento.md` (9 tarefas), executado em modo nativo com revisão
  final por um revisor novo. O resultado e as decisões estão no fim do spec.
- **Depois do polimento, a pedido do stakeholder:** sem contagens nem numeração (`725eca3`) e
  títulos na margem esquerda com o metadado numa linha acima (`728a580`); menu sem "Início", a volta
  à Home é o nome (`3029ccc`); seta de volta no lugar da trilha da disciplina (`408477d`); contato
  da Sobre também na Home (`b6e8a7f`); título e régua parados, só o conteúdo rola (`d601180`);
  sublinhado que segue o cursor no menu e no contato (`00fdef9`).

Não fecha nem reabre item do §12: as rotas são as mesmas, com outro visual.
`docs/identidade-visual.md` foi revisado (§1–§7) para descrever o site atual.

**Para a fase 4:**

1. ~~Integrar a `design` à `main`~~ — feito em `00fdef9`. A fase 4 espelha as páginas atuais da
   `main` e parte dela.
2. `perfil.atuacao[]` nasceu sem par no grupo `en`; o §12 da fase 4 ganhou um item para isso (9 itens).
3. O lugar do seletor de idioma (RF-29) está marcado por um comentário no `SiteHeader.astro`.
4. Cada página nova em `/en` tem de manter **no máximo um `vt-nome` e um `vt-menu`** (teste em
   `tests/dist/site-gerado.test.ts`), senão a transição entre páginas aborta em silêncio.
5. Menores adiados do polimento: ~~a linha de projeto duplicada em `pesquisa.astro`~~ — feito no 063 (`ProjectItem.astro`);
   `hover:underline` sem o afastamento único em `CourseResources`/`LessonList`; ~~páginas acima de 150
   linhas (`sobre`, `pesquisa`, `publicacoes`, `ensino/[slug]`)~~ — feito no 062–064 (páginas finas).

## Recorte de 2026-09-12 — o que anda sem o professor

Decisão do stakeholder, tomada em sabatina e registrada em
[`docs/sabatinas/CHANGELOG_sabatina_recorte-sem-professor.md`](../docs/sabatinas/CHANGELOG_sabatina_recorte-sem-professor.md)
(4 decisões): **tudo que exige uma sessão com o professor passa para a fase 5; o que não exige é
executado antes.** O motivo é de sequência, não de escopo — é preferível levar ao professor um site
navegável do que gastar a sessão dele verificando um painel sobre um site que ainda não renderiza
uma linha de conteúdo.

Só dois planos dependiam dele, e os dois mudaram de pasta com o número preservado:

| Plano | Era | É |
|---|---|---|
| **027** — usuário EDITOR e matriz de permissões | fase 2, itens 4 e 5 do §12 | fase 5, itens 11 e 12 |
| **029** — ciclo cronometrado (M-02) | fase 2, item 7 do §12 | fase 5, item 13 |

**A mudança obrigou a mexer no PRD, e não foi cosmética:** o critério de conclusão da fase 2 no §6.2
*era* o passo do professor. Ele passou a ser o ciclo do **ADMIN** — já demonstrado pelo plano 026 —
e o critério do EDITOR foi inteiro para a fase 5. O §3.3 também mudou: **M-02 é medida só na fase
5**. **Nenhum requisito mudou — só onde ele é verificado.**

**O que isto não resolve, e é a parte que importa:** o recorte **não alcança o site navegável**
enquanto a **Q-04** (referências visuais) não for respondida — ela bloqueia a fase 3 pela regra do
§16, e o responsável é o **dono do produto**, não o professor. Dos quatro planos restantes da fase
2, o **033**, o **032**, o **028** e o **034** fecharam em 2026-09-12, levando-a a 5/5.

## Convenções

**Numeração é global e contínua**, não reinicia a cada fase — e **não é ordem de execução**: o
022 rodou antes do 021, como o 014 rodou depois de a fase 0 fechar, e o 027 mudou de fase sem mudar
de número. O **033**, o **032**, o **028** e o **034** fecharam em 2026-09-12, o último fechando a
fase 2. Isso preserva as
referências já espalhadas por commits, ADRs, Evidências e pelo PRD — um "plano 007" identifica um
arquivo só, para sempre.

**Onde cada plano vai:** na pasta da fase cujo checklist (§12 do PRD) ele fecha.

**Exceção registrada — o plano 014** (upgrade do Astro 5 → 7) está em
`fase-0-setup-e-provisionamento/` mesmo tendo sido executado **depois** de a fase 0 fechar. Ele
resolve dívida técnica registrada pela fase 0 e continua a numeração daquele bloco; foi
antecipado para antes da fase 1 porque o Astro v6 muda a API de coleções e sobe para Zod 4, e
a fase 1 escreve exatamente os schemas que isso quebraria.

**Segunda exceção registrada — os planos 027 e 029.** Foram escritos para a fase 2, fatiados com
ela em 2026-09-10, e **mudaram de pasta em 2026-09-12** sem mudar de número, porque mudou o
checklist que eles fecham: os itens correspondentes do §12 migraram para a fase 5 junto. É a regra
"onde cada plano vai" sendo aplicada depois do fatiamento, não uma exceção a ela.

**Terceira exceção registrada — planos transversais.** Plano que não fecha item do §12 fica na pasta da fase em curso quando foi escrito: o 054 (teste de citações do PRD) na fase 3 e o 074 (enxugar o PRD) na fase 4.

## Promoção de plano e o topo do PRD

O `PRD.md` responde "onde estamos" para quem chega sem contexto; como se chegou lá fica em
[`docs/historico-de-implementacao.md`](../docs/historico-de-implementacao.md). Convenção em vigor
desde 2026-09-30 (sabatina
[`CHANGELOG_sabatina_enxugar-prd.md`](../docs/sabatinas/CHANGELOG_sabatina_enxugar-prd.md), plano
074).

A promoção a DONE são dois commits: o de trabalho (`<tipo>: … (plano NNN)`, com tipo da lista da
casa e o `Status:` ainda `TODO`) e o de promoção (`docs: NNN DONE -- …`). O hash citado nos índices
e no §12 é o do commit de trabalho. O commit de promoção toca:

1. o plano — `Status: DONE` e a Evidência completa;
2. o README da fase — a linha do plano na tabela (`Status` e `Commits`) e a `Última atualização`,
   que guarda **só o último evento** (substitui, não acumula);
3. este arquivo — a `Última atualização` (só o último evento) e a célula da fase na tabela acima
   (faixa de planos, DONE, próximo);
4. `docs/historico-de-implementacao.md` — uma entrada nova no fim da §5: data, plano, hash e de uma a
   três frases;
5. o `PRD.md` — a linha da fase no `Estado da implementação` e a `Última atualização`; se o plano
   fechar item do §12, também a caixa (`- [x] item — plano **NNN** (`hash`)`) e a contagem da tabela
   de progresso.

A promoção **não** sobe a `Versão do PRD` nem acrescenta linha no §0.1. A versão sobe, com uma linha
de até 150 caracteres no §0.1, quando muda texto de §1–§11, §13–§17 ou dos apêndices, quando muda o
`Status` do documento, ou quando uma sabatina, um recorte ou o fechamento de uma fase muda escopo,
fase ou convenção. `node scripts/verificar-promocao.mjs <plano>` avisa quando a promoção não toca os
três arquivos de caminho fixo: `PRD.md`, este e o histórico.

O vocabulário do `Status` do PRD vem do `PRD_TEMPLATE.md` e é **fechado**:
`🟡 Rascunho · 🔵 Em revisão · 🟢 Aprovado · ⚫ Arquivado`. O progresso da implementação **não** vai
nele — vai no `Estado da implementação`. Durante toda a fase 0 ele ficou em `🟡 Rascunho` com
`Versão do PRD: v0.1`, enquanto o histórico já ia na v0.1.7: topo desatualizado faz o documento mentir
justamente para quem mais depende dele.

## Fluxo

`/novo-prd` → `/sabatina` → `/fatiar` → `/executar-plano` → `/fechar-fase`.

Um plano só vira `DONE` com **verificação independente com saída real** *e* **revisão de código
aprovada**. O README de cada fase detalha o portão de qualidade e o que todo despacho de
executor precisa conter — a lista da fase 0 foi aprendida a duras penas ao longo de 14 planos e
vale para as fases seguintes.
