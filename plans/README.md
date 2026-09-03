# Planos de implementação — índice

Um diretório por fase do roadmap (§6.2 do PRD). **Cada fase tem seu próprio `README.md`** com o
estado dos planos, a ordem de execução, o grafo de dependências e as armadilhas aprendidas ali.
Este arquivo é só o mapa.

Última atualização: 2026-09-03

## Fases

| Pasta | Fase | Estado | Planos |
|---|---|---|---|
| [`fase-0-setup-e-provisionamento/`](fase-0-setup-e-provisionamento/README.md) | 0 — Setup e provisionamento | 🟢 **Concluída** | 001–014, todos DONE |
| [`fase-1-modelo-de-conteudo/`](fase-1-modelo-de-conteudo/README.md) | 1 — Modelo de conteúdo | 🟡 **Em andamento** | 015, 016 e 017 DONE; 018–021 TODO |
| `fase-2-pipeline-de-publicacao/` | 2 — Pipeline de publicação ponta a ponta | ⬜ Não iniciada | — |
| `fase-3-site-publico/` | 3 — Site público em português | ⬜ Não iniciada | — |
| `fase-4-internacionalizacao/` | 4 — Internacionalização | ⬜ Não iniciada | — |
| `fase-5-polimento-e-entrega/` | 5 — Polimento e entrega | ⬜ Não iniciada | — |

A ordem do roadmap **não** é 0→1→2→3→4→5 linear: a fase 2 vem antes do site público de
propósito. O PRD explica por quê — o maior risco do projeto é o ciclo de publicação, não o
layout, e é preferível descobrir que ele não fecha com conteúdo placeholder do que com o site
inteiro pronto. As dependências reais estão na tabela do §6.2.

## Convenções

**Numeração é global e contínua**, não reinicia a cada fase. O plano 018 é o próximo, esteja em
que pasta estiver. Isso preserva as referências já espalhadas por commits, ADRs, Evidências e
pelo PRD — um "plano 007" identifica um arquivo só, para sempre.

**Onde cada plano vai:** na pasta da fase cujo checklist (§12 do PRD) ele fecha.

**Exceção registrada — o plano 014** (upgrade do Astro 5 → 7) está em
`fase-0-setup-e-provisionamento/` mesmo tendo sido executado **depois** de a fase 0 fechar. Ele
resolve dívida técnica registrada pela fase 0 e continua a numeração daquele bloco; foi
antecipado para antes da fase 1 porque o Astro v6 muda a API de coleções e sobe para Zod 4, e
a fase 1 escreve exatamente os schemas que isso quebraria.

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
