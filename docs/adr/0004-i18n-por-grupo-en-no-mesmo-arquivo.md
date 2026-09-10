# ADR-0004 — i18n por grupo `en` recolhível, no mesmo arquivo

- **Status:** Aceita
- **Data:** 2026-09-10
- **Decisão do PRD:** D-03 (§7.2, RN-06, RN-09)
- **Fase:** 1 (implementada no plano 018)

## Contexto

O site precisa existir em português (canônico) e inglês (opcional, G-05) sem exigir que o
professor traduza tudo — um campo vazio em inglês não pode deixar a rota `/en` com buraco. O
projeto irmão `../grav` resolve i18n com pastas `pt/` e `en/` espelhadas, padrão de
`../docs/plano-i18n.md` usado com o Decap CMS.

## Decisão

Cada coleção traduzível ganha um grupo "Versão em inglês (opcional)" recolhível, **dentro do
mesmo arquivo Markdown** do item em português, só com os campos que fazem sentido traduzir. Campo
do grupo `en` vazio faz a rota `/en` cair no valor em português (RN-06).

O plano 018 fechou o que o PRD deixava sem nomear campo por campo:

- `publicacoes` traduz só `resumo` — título e autores são dado factual (RN-07); traduzir o título
  produziria duas citações divergentes do mesmo trabalho.
- `projetos` traduz `titulo` e `descricao`; `periodo`, `financiador`, `status`, `colaboradores` e
  `linha_relacionada` ficam de fora por serem dado factual.
- `perfil.formacao[]` traduz `grau` e `curso`, que juntos formam o "título" que a §7.3 cita sem
  nomear campo.
- Todo grupo `en` (as cinco coleções, mais `formacaoEnSchema` dentro de `perfil`) é `.strict()`
  no Zod, para que um campo factual submetido dentro do grupo seja **rejeitado**, não descartado
  em silêncio.
- As listas `en.formacao[]` e `en.areas[]` do perfil são paralelas às listas em português,
  alinhadas por **índice**, não por identificador. Reordenar a lista em português desalinha a
  tradução correspondente; o realinhamento fica para a fase 4.

## Alternativas consideradas

**Pastas `pt/` e `en/` espelhadas.** Rejeitada: o professor é um único editor sem equipe de
tradução — duas pastas introduzem o risco de um item existir num idioma e não no outro (par
órfão), e o professor teria de abrir e salvar dois formulários para um único item. Um arquivo só,
com um formulário só, elimina essa classe de erro por construção.

## Consequências

- O português é sempre a fonte — todo item existe em PT; o inglês é opcional (RN-09).
- M-07 (zero strings de interface em português nas rotas `/en`) é responsabilidade da fase 4, que
  ainda implementa a função de fallback por campo (RN-06) — o plano 018 só fechou o schema.
- Subcampo factual dentro de um grupo `en` é rejeitado na validação, não descartado — o
  `.strict()` transforma um erro de conteúdo em erro de build explícito.
- Dívida explícita para a fase 4: listas `en.formacao[]`/`en.areas[]` alinhadas por índice, sem
  mecanismo de realinhamento.

## Referências

- PRD §7.2 (D-03), RN-06, RN-07, RN-09, G-05, M-07
- `../docs/plano-i18n.md` — padrão de i18n do LaFiM, avaliado e não adotado aqui
- `plans/fase-1-modelo-de-conteudo/018-grupo-versao-em-ingles.md` — Evidência
