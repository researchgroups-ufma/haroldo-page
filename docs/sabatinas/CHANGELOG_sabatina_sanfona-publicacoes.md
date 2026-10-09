# Sabatina — Sanfona de Publicações com muitos anos

Defeito relatado pelo stakeholder em 2026-10-09: a sanfona de anos de `/publicacoes/` não abre
nenhum ano. Diagnóstico (skill `investigar`, 2026-10-09): `src/scripts/publications-accordion.ts`
mantém todos os cabeçalhos de ano dentro do cartão fixo (`#conteudo`) e dá ao ano aberto
`altura do cartão − soma dos cabeçalhos`. Com os 7 anos importados do ORCID (2020–2026), os
cabeçalhos somam 7 × 80 = 560 px num cartão de 461 px (janela de 1495 × 698): o espaço é negativo e
nenhum ano abre. Prova: no mesmo build, o iframe de 1495 × 698 deixa os 7 anos com altura 0, e o de
1495 × 1100 (cartão de 862 px) abre 2026 no início e 2024 depois do clique. Com os 3 anos de exemplo
(240 px) cabia, por isso o defeito só apareceu com a carga do ORCID.

## Decisão 1 — Cabeçalhos compactos e recuo para a lista aberta

**Data:** 2026-10-09
**Questão:** como corrigir a sanfona quando os cabeçalhos dos anos não cabem no cartão?
**Decisão:** com a sanfona ativa, os cabeçalhos dos anos ficam compactos (cerca de metade da altura).
Se mesmo assim não sobrar espaço para cerca de dois artigos no ano aberto, a página recua para a lista
com todos os anos abertos — o mesmo comportamento de abaixo de `lg` e de movimento reduzido. A decisão
é refeita quando a janela muda de tamanho.
**Justificativa:** escolha do stakeholder; funciona em qualquer altura de tela e com qualquer número
de anos. Descartados: só o recuo (a sanfona só apareceria em telas muito altas) e o redesenho com
índice lateral de anos (mudança de desenho que pediria protótipo).
**Impacto no PRD:** nenhum no RF-25; `docs/identidade-visual.md` §6.6 e §7.

## Decisão 2 — "2023 e anteriores" num grupo só

**Data:** 2026-10-09
**Questão:** (nota do stakeholder à Decisão 1) os anos antigos continuam com um bloco cada?
**Decisão:** 2026, 2025 e 2024 mantêm o bloco próprio; tudo de 2023 para trás fica num bloco
"2023 e anteriores" (EN "2023 and earlier"), com o ano de cada artigo marcado dentro dele. O corte é
fixo em 2023 até alguém mudá-lo. Ordem dentro do bloco: ano decrescente e, no mesmo ano, a ordem de
sempre (RN-02).
**Justificativa:** escolha do stakeholder; reduz os cabeçalhos de 7 para 4. Descartado: corte móvel
(os três anos mais recentes com bloco próprio, o resto agrupado).
**Impacto no PRD:** RF-25 ganha a regra do bloco "2023 e anteriores".
