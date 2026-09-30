# Sabatina — Enxugar o PRD

Sessão de 2026-09-30, antes do plano 065. Medição de partida (PRD v0.1.68): 204 KB / 1092
linhas; o §0 ocupa 110 KB (54%), sendo 23 KB só na célula "Estado da implementação" e ~85 KB
nas 69 linhas do §0.1; o §12 tem 14 KB de caixas anotadas. Causa: a convenção de promoção de
plano sobe a versão do PRD e acrescenta narrativa em três lugares por plano.

## Decisão 1 — Destino do histórico de implementação

**Data:** 2026-09-30
**Questão:** para onde vão as linhas de plano do §0.1 e a narrativa do "Estado da implementação" quando saírem do PRD.
**Decisão:** arquivo novo e único, `docs/historico-de-implementacao.md`, em ordem cronológica. O texto é movido sem reescrita (a tabela guarda data, plano, hash e texto original), e a narrativa do "Estado" fica numa seção à parte.
**Justificativa:** um arquivo só preserva a leitura cronológica. As alternativas descartadas: `plans/HISTORICO.md`, porque criaria uma segunda fonte narrativa ao lado dos READMEs de fase; um arquivo por fase, porque espalharia versões que cruzam fases; `docs/CHANGELOG.md`, porque misturaria mudança de produto com execução de plano.
**Impacto no PRD:** §0 ("Estado da implementação") e §0.1 perdem a narrativa, que passa a ser apontada para o arquivo novo. §0 "Documentos relacionados" ganha o ponteiro.

## Decisão 2 — Plano DONE não sobe a versão do PRD

**Data:** 2026-09-30
**Questão:** a promoção de um plano a DONE continua subindo a `Versão do PRD` e acrescentando uma linha no §0.1?
**Decisão:** não. A versão do PRD sobe só quando muda o produto: requisito, escopo, fase ou decisão (sabatina, recorte, ADR que altera RF). A promoção de um plano toca o histórico novo e os READMEs de `plans/`. No PRD, toca apenas a linha curta da fase no "Estado da implementação" e a `Última atualização`, mais a caixa e a contagem do §12 quando o plano fecha um item.
**Justificativa:** a versão volta a significar "o conteúdo do PRD mudou", e o PRD segue respondendo "onde estamos", como pede a instrução de 2026-09-01 que manda manter o topo atualizado. Duas alternativas foram descartadas. Subir a versão sem linha no §0.1 manteria o número como relógio de execução, desligado do conteúdo. Não tocar o PRD nunca deixaria o topo e o §12 mentindo.
**Impacto no PRD:** §0.1 volta a registrar só mudanças de produto, e o PRD ganha uma nota sobre a convenção. Fora do PRD, mudam `scripts/verificar-promocao.mjs`, as memórias de promoção e a skill `/fechar-fase` onde citam a regra antiga.

## Decisão 3 — §12 só com item, plano e hash

**Data:** 2026-09-30
**Questão:** quanto das anotações das caixas do §12 fica no PRD? São 63 caixas e 11 KB; 17 passam de 200 caracteres.
**Decisão:** cada caixa fica no formato `- [x] <item> — plano **NNN** (`hash`)`. As anotações longas vão para `docs/historico-de-implementacao.md` sem reescrita, ancoradas pelo número do plano. As notas de recorte, que registram itens que migraram de fase, ficam no §12 porque mudam o escopo, mas reduzidas a uma linha com ponteiro para a sabatina.
**Justificativa:** a regra é objetiva e não volta a crescer. As alternativas descartadas: aparar só as caixas longas, porque a regra ficaria subjetiva; não mexer no §12, porque deixaria 11 KB de narrativa duplicada com os planos.
**Impacto no PRD:** o §12 inteiro é reformatado. O texto das caixas (o item) não muda, só a anotação sai.

## Decisão 4 — Triagem do §0.1

**Data:** 2026-09-30
**Questão:** das 69 linhas do §0.1, quais ficam no PRD? 42 começam com "Plano NNN DONE" e 27 são de outro tipo, mas a divisão não é limpa: 18 das 42 também registram decisão ou sabatina, e algumas das 27 só relatam progresso (v0.1.3, v0.1.9).
**Decisão:** as 69 linhas vão para `docs/historico-de-implementacao.md` como estão, e um script prova que cada linha removida aparece idêntica no destino. O §0.1 guarda uma linha curta nova, de até ~150 caracteres e com ponteiro para o histórico, **só** para as versões que mudaram texto de §1–§11 ou §13–§17: RF, RNF, RN, Q, D, ADR, fase ou escopo. Uma nota no topo do §0.1 explica que as versões ausentes foram promoções de plano ou progresso e estão no histórico. A numeração existente não é renumerada.
**Justificativa:** o critério "mudou texto fora do §0 e do §12" é verificável contra o diff de cada versão, e o §0.1 fica em torno de 5 KB. As alternativas descartadas: resumir todas as versões, porque manteria promoção de plano no §0.1, contra a Decisão 2; mover só o progresso puro, porque deixaria ~40 KB de linhas longas.
**Impacto no PRD:** o §0.1 é reescrito como índice curto. O texto original de cada versão é preservado no histórico.
