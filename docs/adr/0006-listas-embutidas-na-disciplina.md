# ADR-0006 — Aulas, listas, materiais, bibliografia e scripts embutidos na disciplina

- **Status:** Aceita
- **Data:** 2026-09-10
- **Decisão do PRD:** D-05 (§7.2, RF-07)
- **Fase:** 1 (implementada nos planos 016/017 e 022)

## Contexto

Uma disciplina acumula, ao longo do semestre, aulas, listas de exercícios, materiais de apoio,
bibliografia e — desde a sabatina de 2026-09-04 (RF-37) — scripts de código-fonte. Cada um desses
itens não tem existência própria fora da disciplina: não é citado, buscado ou referenciado de
outro lugar do site.

## Decisão

As **cinco** listas (`aulas[]`, `listas[]`, `materiais[]`, `bibliografia[]` e `scripts[]`) são
listas de objetos **embutidas no frontmatter da disciplina**, não coleções próprias do Astro nem
do Tina. Só `scripts[]` semeia o item novo com `ui.defaultItem` no nível do _campo_ (tipado, ao
contrário do `defaultItem` no nível da _coleção_, que é `@deprecated`) — as outras quatro
(`aulas[]`, `listas[]`, `materiais[]`, `bibliografia[]`) não têm `defaultItem` nenhum; o item novo
nasce vazio, com só o rótulo de `ui.itemProps`.

A decisão foi corrigida duas vezes depois da redação original do PRD: a enumeração dizia três
listas e já estava incompleta (`bibliografia[]` ficava de fora antes mesmo de `scripts[]`
existir), corrigida na v0.1.16; e `scripts[]` entrou em 2026-09-04 pela sabatina de scripts
Python, fechada pelo plano 022.

## Alternativas consideradas

**Coleção própria por tipo de item** (ex.: `aulas` como pasta `content/aulas/*.md`, referenciando
a disciplina). Rejeitada: nenhum desses itens precisa de URL própria, de aparecer numa listagem
independente ou de ser editado fora do contexto da disciplina — criar uma coleção para cada um
multiplicaria formulários e o schema sem ganho para o professor, que pensa "a aula 4 desta
disciplina", não "um registro na tabela de aulas".

## Consequências

- Aula, lista, material e script **não têm página própria** — só existem dentro da página da
  disciplina. Se um dia precisar de URL individual, migra para coleção separada; é retrabalho
  aceito antecipadamente.
- Subcampo obrigatório vazio dentro de uma lista embutida **não bloqueia o save** no painel: a
  variante `{ type: 'object', fields: [...] }` do Tina não tipa `validate` no nível do item de
  lista (confirmado em `@tinacms/schema-tools` pela revisão do plano 019). O Zod rejeita depois,
  no build — dívida registrada para a fase 2 (mensagem de erro legível, F-09/RNF-09/R-01) e para
  o manual da fase 5. O plano 022 acrescentou duas instâncias novas (`scripts[].titulo` e
  `scripts[].codigo`).
- `scripts[].codigo` é a única exceção a "todo material é link externo" (RN-05): o código-fonte
  fica no próprio conteúdo para poder ser exibido com destaque de sintaxe (fase 3), o que criou o
  risco R-13 (indentação perdida na serialização YAML) — mitigado e verificado sem materializar,
  ver Evidência do plano 022.

## Referências

- PRD §7.2 (D-05), §7.3 (`disciplinas.aulas[]`/`listas[]`/`materiais[]`/`bibliografia[]`/
  `scripts[]`), RF-07, RF-37, R-13
- `plans/fase-1-modelo-de-conteudo/016-schemas-zod-das-cinco-colecoes.md`
- `plans/fase-1-modelo-de-conteudo/017-colecoes-completas-no-tina-config.md`
- `plans/fase-1-modelo-de-conteudo/022-scripts-em-disciplinas.md` — Evidência e verificação de
  painel do R-13
