# Sabatina — Identidade visual e recorte do mock (Q-04)

Em 2026-09-14 o stakeholder forneceu as referências visuais que a **Q-04** aguardava desde a
v0.1 do PRD, e com elas a fase 3 deixa de estar bloqueada pela regra do §16. Estão em `ref/`:

- `ref/Site UFMA Física v2.dc.html` — um documento de design ("turno 3 · versão 2") com folha de
  estilo e as telas Início, Sobre, Pesquisa, Ensino, Disciplina, Publicações, CV e 404 em 1920 px,
  mais os quadros de celular em 360 px. Direção declarada no próprio arquivo: _papel cinza-claro,
  tinta quase preta, nenhuma cor de acento, réguas finas separando colunas, micro-rótulos em caixa
  alta e numerais grandes e finos_.
- `ref/1.jpg` a `ref/5.jpg` — cinco capturas de portfólios de terceiros que inspiraram o mock
  (nome grande em serifa/grotesca, retrato p&b, navegação por texto sublinhado, grade de colunas
  com réguas verticais).

O que torna isso uma sabatina, e não só o fechamento de uma questão: **o mock foi desenhado para
um professor fictício** ("Rafael Nunes de Castro") e não conhece o schema do projeto. Levantamento
feito comparando o arquivo, tela a tela, com `src/content.config.ts`, as rotas do §6.1 e as
restrições do §8.2. Três classes de divergência apareceram:

1. **Elementos sem campo no schema:** carga horária e créditos, horário da disciplina, "próxima
   aula", "avaliação", sala e horário de atendimento, "equação central" da disciplina, a frase de
   destaque da Home (o schema tem só `resumo_home`) e quase todo o conteúdo do CV (histórico
   profissional, "em números", orientações, idiomas).
2. **Elementos fora do escopo do MVP:** a página CV (RF-31 é SHOULD; "Página de CV completa" é
   v1.1 no §6.3), uma página por linha de pesquisa (botão "Texto completo"; rota ausente do §6.1)
   e os filtros de publicações (§6.3: v1.2).
3. **Componentes ausentes do arquivo:** o cabeçalho e o rodapé são importados de fora
   (`<dc-import name="HeaderDesk2">`, `HeaderMob2`, `FooterSite2`) e **não estão** em `ref/`.

**`ref/` não é versionada** — decisão do stakeholder na mesma sessão, registrada no `.gitignore`: a
pasta fica só na máquina do desenvolvedor, porque inclui capturas de terceiros e o repositório é
público. Os caminhos acima identificam o insumo; o conteúdo útil dele está todo em
`docs/identidade-visual.md`.

As decisões abaixo foram tomadas pelo stakeholder na mesma sessão. A tradução delas em tokens,
tipografia e composição por rota está em [`docs/identidade-visual.md`](../identidade-visual.md).

---

## Decisão 1 — A fase 3 segue o fluxo da casa

**Data:** 2026-09-14
**Questão:** implementar as páginas direto nesta sessão, fatiar e já executar o primeiro plano, ou
registrar a Q-04 no PRD, fatiar a fase e só então executar?
**Decisão:** **fluxo da casa** — Q-04 registrada como resolvida no PRD, fase 3 fatiada em planos
atômicos em `plans/fase-3-site-publico/`, execução por `/executar-plano`.
**Justificativa:** o §16 proíbe começar fase com questão aberta, e o §12 da fase 3 tem doze itens;
construir as páginas fora do fluxo repetiria a defasagem entre PRD e realidade que o plano 023
existiu para corrigir.
**Impacto no PRD:** §0, §0.1, §8.2, §14.1, §16 e Apêndice B; `plans/README.md`.

---

## Decisão 2 — Elementos do mock sem campo no schema são cortados do design

**Data:** 2026-09-14
**Questão:** estender o schema para carga horária, horário, atendimento, próxima aula, avaliação e
equação central; decidir campo a campo; ou cortá-los do design?
**Decisão:** **cortar**. A fase 3 renderiza apenas o schema atual; a composição de cada tela se
reorganiza sem esses blocos. A frase de destaque da Home é substituída pelo que o schema tem
(`nome` como título, `resumo_home` como síntese). O que é **derivável** do conteúdo existente
(contagem de aulas, listas e scripts; contagem de projetos em andamento por linha; número de
publicações) permanece, porque não exige campo novo.
**Justificativa:** estender o schema reabre a fase 1 inteira — Zod, `tina/config.ts`, teste de
paridade, `tina-lock.json`, placeholder e o portão de conteúdo —, e cada campo novo é mais um
formulário que o professor tem de entender (RNF-05, RNF-06). Nenhum dos campos cortados é
requisito do §5.1.
**Impacto no PRD:** nenhum requisito muda. Os campos cortados ficam listados em
`docs/identidade-visual.md` como candidatos, caso a Q-09 (v1.1) os traga de volta.

---

## Decisão 3 — Nenhuma parte fora do escopo do MVP entra na fase 3

**Data:** 2026-09-14
**Questão:** incluir a página CV resumida, uma página por linha de pesquisa, os filtros de
publicações — algum deles, todos ou nenhum?
**Decisão:** **nenhum.** A fase 3 entrega exatamente as rotas do §6.1: Home, Sobre, Pesquisa,
Ensino, página de disciplina, Publicações e 404. O item "CV" sai da navegação e da lista da 404;
o `cv_url` do perfil aparece como link na página Sobre quando preenchido. O texto `corpo` de uma
linha de pesquisa é exibido na própria página Pesquisa, sem rota própria. Publicações sem filtros.
**Justificativa:** o §6.3 já decidiu CV completo (v1.1) e filtros (v1.2); a página por linha é
rota nova que o §6.1 não prevê. Filtros exigiriam JS no cliente contra a RNF-02.
**Impacto no PRD:** nenhum — é o §6.1 sendo aplicado ao mock.

---

## Decisão 4 — Escala recalibrada para 360–1440 px, com Helvetica e grotescas no lugar de monoespaçada

**Data:** 2026-09-14
**Questão:** o mock usa um canvas de 1920 px, corpo de 13,5 px e rótulos de 10 px; o PRD pede
360–1440 px, contraste e leitura AA. Seguir os tamanhos literais ou recalibrar?
**Decisão:** **recalibrar**, mantendo paleta, réguas, numerais finos e composição — corpo em 16 px,
rótulos em 12 px, escala fluida entre 360 e 1440 px. Por pedido explícito do stakeholder, **a
preferência é Helvetica e grotescas sem serifa como ela, e não monoespaçadas**: a monoespaçada
sai de rótulos, metadados e marcadores de imagem, e fica restrita ao único lugar em que é
funcional — o bloco de código dos scripts (RF-37), onde a indentação do Python depende dela.
**Justificativa:** 10 px em caixa alta é ilegível para parte do público (alunos em celular), e o
canvas de 1920 px fica fora da faixa que o §6.2 verifica. A preferência tipográfica é do dono do
produto.
**Impacto no PRD:** §8.2 — a direção visual passa a apontar para `docs/identidade-visual.md`.

---

## Decisão 5 — Ordem das publicações dentro do mesmo ano (Q-RN02)

**Data:** 2026-09-14
**Questão:** levantada no fatiamento da fase 3. A RN-02 manda "ano decrescente; dentro do mesmo
ano, ordem de cadastro invertida", mas o schema não tem data de cadastro, o schema não muda nesta
fase (Decisão 2) e o histórico do Git não serve (checkout raso no CI, build não determinístico).
Ratificar título alfabético e emendar a RN-02, usar outro critério com campos existentes (ex.:
`destaque` primeiro), ou criar um campo de data de cadastro depois?
**Decisão:** **campo de data de cadastro futuro.** A RN-02 **não muda**. Até o campo existir, vale a
regra provisória do plano 040 — título em ordem alfabética pt-BR dentro do ano, isolada em
`compareWithinYear`.
**Justificativa:** escolha do stakeholder, sem motivo adicional declarado. O que se sabe: a RN-02 tem
origem no `briefing.md` §10 (conforme o §5.3 do PRD), e nenhuma ordem derivável dos campos atuais
equivale a "ordem de cadastro"; as opções (a) e (b) emendariam a regra para caber no schema.
**Impacto no PRD:** a RN-02 do §5.3 ganha nota de cumprimento parcial no fechamento da fase
(plano 053); a pendência vira dívida nomeada no README da fase 3, com "fecha quando: um plano de
schema criar o campo de data de cadastro e `compareWithinYear` passar a usá-lo". Não bloqueia o
fechamento da fase 3.
