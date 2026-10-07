# Sabatina — Página Extensão

Sessão de 2026-10-07, na branch `design`, depois do fechamento da fase 4 (PRD v0.1.73). Pedido do
stakeholder: uma página onde o professor publica os trabalhos de extensão, como postagens de blog,
com título, conteúdo e até 5 imagens em carrossel.

Ponto de partida no PRD: RF-15 (COULD, "CRUD de notícias"), RF-34 (COULD, feed RSS de notícias), a
linha "Notícias/postagens — v1.1 (schema já previsto)" no §6.3 e o schema previsto de `noticias` no
§7.3. Referência visual escolhida pelo stakeholder entre quatro protótipos descartáveis: o **modelo D**
(`src/pages/prototipo-extensao/d/`, sem commit). O índice é uma lista com data, título, começo do texto e
a primeira foto à direita; a linha inteira é link. A página da postagem tem o `PageHeader` com a seta
de volta e a data como meta, e por baixo a dobra 5/7 a partir de `lg`: texto à esquerda, foto 3:2 sem
corte e as miniaturas embaixo, à direita. O carrossel usa `scroll-snap` e funciona sem JS (RNF-02).

## Decisão 1 — Processo leve, sem fase nem planos

**Data:** 2026-10-07
**Questão:** onde a Extensão entra no roadmap — dentro da fase 5, numa fase nova ou depois da entrega.
**Decisão:** em nenhuma fase. A página é implementada direto na branch `design`, sem fatiamento em planos,
e só depois integrada à `main`, com a documentação necessária atualizada. Palavras do stakeholder: "é para
ser rápido e pontual. Não é algo complexo."
**Justificativa:** a sabatina formal, o fatiamento e a execução por planos custariam mais que a página.
Descartadas a inclusão na fase 5 e uma fase própria (ambas exigiriam `/fatiar`) e o adiamento para depois da
entrega.
**Impacto no PRD:** RF-15 deixa de ser "CRUD de notícias" e passa a descrever a Extensão; §6.3, §7.3 e §6.1
acompanham. A atualização é feita na integração com a `main`.

## Decisão 2 — Escolhas padrão, sujeitas a veto do stakeholder

**Data:** 2026-10-07
**Questão:** os detalhes que a sabatina formal perguntaria um a um.
**Decisão:** o desenvolvedor decide pelo padrão abaixo e o stakeholder veta o que não quiser.

- **Rotas:** `/extensao/` e `/extensao/<slug>/`; em inglês, `/en/outreach/` e `/en/outreach/<slug>/`, com o
  mesmo slug (como as disciplinas). Slug = nome do arquivo, gerado como `{data}-{slug(titulo)}`.
- **Menu:** "Extensão" / "Outreach" entre Ensino e Publicações, fechando o tripé ensino–pesquisa–extensão.
- **Coleção `extensao`** (substitui o `noticias` previsto): `titulo` ✔, `data` ✔, `corpo` ✔ (texto em
  parágrafos, como nas linhas de pesquisa), `fotos[]` de 0 a 5, cada uma `{ imagem ✔, alt ✔ }`,
  `publicado` ✔ e grupo `en` com `titulo` e `corpo`. Sem resumo: o índice mostra o começo do corpo.
- **Ordem:** data decrescente; empate por título.
- **Vazio:** sem postagem publicada, a página existe com "Nenhuma postagem publicada ainda."
- **Postagem sem foto:** o texto ocupa a largura toda, sem moldura vazia (F-08).
- **Imagens:** sem otimização própria; ficam no item "Otimização de imagens" da fase 5, que vale para todas.
  **Justificativa:** são as escolhas que seguem os padrões já usados no site (disciplinas, linhas de pesquisa,
  Ensino com grupo vazio explícito) e o protótipo D.
  **Impacto no PRD:** RF-15, §7.3 (`extensao` no lugar de `noticias`), §6.1 (rotas), §6.3 (sai a linha de
  notícias).

## Decisão 3 — Data escolhida num calendário em DD-MM-AAAA

**Data:** 2026-10-07
**Questão:** o professor digitava a data como `aaaa-mm-dd`; o stakeholder pediu DD-MM-AAAA.
**Decisão:** o campo `data` vira o seletor de data do painel (`datetime`, `DD-MM-YYYY`, sem hora). O
arquivo guarda o instante que o Tina grava (`2026-09-12T03:00:00.000Z`), e o Zod e o nome do arquivo o
convertem na data do calendário de São Luís (`toCalendarDate`, `src/lib/outreach.ts`). O site continua
mostrando `12/09/2026`, e a ordem e os endereços não mudam. Item novo já vem com a data do dia.
**Justificativa:** sem nada para digitar, não há formato para errar. Descartadas: digitar DD-MM-AAAA
(erro de digitação continua possível e o endereço da postagem começaria pelo dia) e mudar só a exibição
do site (não era o pedido).
**Impacto no PRD:** RF-15 (critério de aceitação) e §7.3 (`extensao.data`).
