# Planos de implementação — índice

Um diretório por fase do roadmap (§6.2 do PRD). **Cada fase tem seu próprio `README.md`** com o
estado dos planos, a ordem de execução, o grafo de dependências e as armadilhas aprendidas ali.
Este arquivo é só o mapa.

Última atualização: 2026-09-23 (fase 3 concluída — 12/12; planos 036 a 054 todos DONE, o 053 em
`876d89c` com CI e Workers Builds verdes)

## Fases

| Pasta | Fase | Estado | Planos |
|---|---|---|---|
| [`fase-0-setup-e-provisionamento/`](fase-0-setup-e-provisionamento/README.md) | 0 — Setup e provisionamento | 🟢 **Concluída** | 001–014, todos DONE |
| [`fase-1-modelo-de-conteudo/`](fase-1-modelo-de-conteudo/README.md) | 1 — Modelo de conteúdo | 🟢 **Concluída** (critério do §6.2 demonstrado) | 015–022, todos DONE — o 021 promovido em `7d5b7e6`, com CI verde sobre `26de58a` |
| [`fase-2-pipeline-de-publicacao/`](fase-2-pipeline-de-publicacao/README.md) | 2 — Pipeline de publicação ponta a ponta | 🟢 **Concluída (5/5)** | 023, 024, 025, 026, 030 e 031 DONE — o pipeline publica sozinho desde `ab0d1f8`, desde `7ab84da` está provado que o `/admin` em produção é quem origina o push, e desde `4343e42`/`1de5d1d` conteúdo inválido e `tina-lock.json` defasado reprovam no CI e no build de deploy. o **033** fechou em `0c2bd02` e o **032** em `b992282`, os dois com os pipelines verdes — o CI passa a auditar dependências, reprovando em `high`/`critical`. O **028** fechou em `5528ad6`: falha do build de deploy chega ao ADMIN por um vigia agendado no GitHub Actions (ADR-0011), com uma pendência nomeada. **O 034 documentou o pipeline no README e fechou o checklist da fase em 5/5** — promovido a DONE, trabalho em `ef7f258`, com CI e Workers Builds verdes |
| [`fase-3-site-publico/`](fase-3-site-publico/README.md) | 3 — Site público em português | 🟢 **Concluída (12/12)** | **fatiada em 2026-09-14** em 18 planos, **036–053**, mais o **054** (teste de citações do PRD, acrescentado e **DONE** em 2026-09-18, `23a003d` — portão de qualidade, não fecha item do §12). O 054 entregou a camada de **existência** — toda citação de identificador do PRD em `src/**` é conferida contra a fonte — e **refutou por medição** a camada de pertinência que ele próprio propunha: 32 das 236 citações reais pontuam zero na sobreposição de vocabulário, entre elas um `// RN-01` sozinho numa linha, de modo que nenhum limiar escalar separa citação certa de citação trocada. A questão que sobrou é do dono do produto: `F-08` é "Imagem ausente" no `PRD.md:298` e "Campo vazio não deixa rastro" no `docs/identidade-visual.md:32`. **18/18 DONE:** 036 (`fb117b6`), 037 (`23d1aa0`), 038 (`1d0d3a5`), 039 (`5705e73`), 040 (`6bf5aa4`), 041 (`a2e28b7`), 042 (`db96df3`), 043 (`dfdc0a3`), 044 (`4e48ce5`), 045 (`369637a`), 046 (`97e006d`), 047 (`4d90d92`), 048 (`5eaf30e`), 049 (`1a028ce`), 050 (`5b97655`), 051 (`8c6821c`), 052 (`9af755e`), 053 (`876d89c`). O 043 fecha, com o 036, o item "Identidade visual aplicada" do §12 — em 2026-09-17, quando fechou, nenhuma rota ainda usava os componentes; o 053 conferiu rota a rota sobre o `dist/` do triage e confirmou a assinatura do `PageHeader` (ou markup equivalente, na Home) nas 8 rotas. O **044** fechou o item "Home (RF-20)" do §12 e é a primeira rota com conteúdo real do professor. O **045** fechou o item "Sobre (RF-21)" do §12 e é a segunda rota de conteúdo real — biografia, formação na ordem do professor, áreas, contato e perfis acadêmicos, com cada bloco sem dado sumindo junto com a rubrica (RF-21). O **046** fechou o item "Pesquisa (RF-22)" do §12 e é a primeira rota com **componente extraído** (`ProjectCard.astro`), a primeira da onda a ficar abaixo do alvo de 150 linhas do §10.4. O **047** fechou o item "Ensino (RF-23)" do §12: os dois grupos sempre rotulados, "Atuais" antes de "Anteriores", com o estado vazio provado por falsificação — com `current = []` a caixa tracejada aparece e o `<h2>` "Atuais" **permanece**, que é o que o RF-23 exige. O **048** fechou o item "Página de disciplina (RF-24)" do §12 e é a **primeira rota dinâmica** da fase (`getStaticPaths`, uma página por disciplina publicada): trilha, cabeçalho com tags e "Nesta página", ementa, aulas na ordem do professor (RN-04), listas, materiais, bibliografia e links, com estado vazio explícito quando não há aula (F-06). Foi o primeiro plano da fase a **exigir dois ciclos de revisão**, e o segundo obrigatório do ciclo 1 gerou uma decisão de orquestração: autorizar um canário que toca `content/` — fora da lista de "Arquivos afetados" — para provar por comportamento que rascunho não gera página. O **049** fechou o item "Scripts da disciplina" (RF-37, F-13) do §12: destaque de sintaxe gerado no build pelo `<Code>` do Astro num tema de três tons de cinza, botão "Copiar código" como melhoria progressiva que anuncia "Copiado" por `aria-live`, e scripts sob a aula correspondente, com os órfãos numa seção geral — provado por canário com `aula: 99` em `content/`. O **050** fechou o item "Publicações agrupadas por ano" (RF-25) do §12: blocos por ano em ordem decrescente, o nome do professor destacado por cor e `<strong>`, links DOI/arXiv/PDF só quando preenchidos (F-05) e resumo recolhido em `<details>`. O **051** fechou o item "Página 404" (RF-27) do §12 e quitou a dívida da fase 2 do `not_found_handling`: em produção a rota inexistente responde `404` com o corpo byte a byte igual ao `dist/404.html` (versão `19c88528` do Worker), onde antes vinha `Content-Length: 0`. O **052** põe um teste Vitest sobre o `dist/` gerado (`npm run test:dist`, no CI depois do `build:pipeline`): rotas, rascunho ausente de todo HTML, um `<h1>` e `lang` por página, nenhuma fonte de terceiro e JS < 50 KB gzip por rota (hoje 259 a 606 bytes). Não fecha item do §12 sozinho. Execução um plano por vez; o **053** (verificação transversal e fechamento da fase) mediu as 8 rotas × 3 larguras sem rolagem horizontal (RF-26), confirmou o movimento e o texto visível sem CSS em `no-preference` (RF-32), corrigiu os comentários das dívidas 7(b) e 7(c), e levou o §12 do PRD a 12/12 — promovido a DONE, trabalho em `876d89c`, com CI e Workers Builds verdes. A Q-04 foi respondida e adaptada ao projeto em [`docs/identidade-visual.md`](../docs/identidade-visual.md), fonte única do visual, com os recortes da sabatina `identidade-visual`. A Q-RN02 (ordem dentro do ano em Publicações) foi respondida em 2026-09-14 com a opção (c) e não bloqueia mais nenhum plano |
| `fase-4-internacionalizacao/` | 4 — Internacionalização | ⬜ Não iniciada | — |
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

## O topo do PRD tem de refletir a realidade

Ao fechar um plano, uma fase ou qualquer marco, **atualize o cabeçalho §0 do `PRD.md` junto**:
o `Status` do documento, a linha `Estado da implementação`, a `Última atualização`, a
`Versão do PRD` e a linha correspondente no histórico §0.1.

É o arquivo que responde "onde estamos" para quem chega sem contexto, e um topo desatualizado
faz o documento mentir justamente para essa pessoa. Durante toda a fase 0 ele ficou em
`🟡 Rascunho` com `Versão do PRD: v0.1`, enquanto o histórico já ia na v0.1.7.

O vocabulário do `Status` vem do `PRD_TEMPLATE.md` e é **fechado**:
`🟡 Rascunho · 🔵 Em revisão · 🟢 Aprovado · ⚫ Arquivado`. O progresso da implementação **não**
vai nele — vai na linha `Estado da implementação`, que resume fase a fase e aponta para a §12
(detalhe por item) e para este índice (execução).

## Fluxo

`/novo-prd` → `/sabatina` → `/fatiar` → `/executar-plano` → `/fechar-fase`.

Um plano só vira `DONE` com **verificação independente com saída real** *e* **revisão de código
aprovada**. O README de cada fase detalha o portão de qualidade e o que todo despacho de
executor precisa conter — a lista da fase 0 foi aprendida a duras penas ao longo de 14 planos e
vale para as fases seguintes.
