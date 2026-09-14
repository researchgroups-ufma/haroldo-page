# Plano 053 — Verificação transversal 360/768/1440 e fechamento da fase 3

**Status:** TODO
**RFs cobertos:** **RF-26**, **RF-32**, RNF-15 (teclado e foco), critério de conclusão da fase 3 no
§6.2; itens 2, 11 e 12 do §12 da fase 3; fechamento do checklist (12/12) e do §0 do PRD
**Depende de:** **todos os planos 036–052 em `DONE`** (a Q-RN02 foi respondida em 2026-09-14 — opção (c); ver README da
fase, "Questão para o stakeholder")
**Modelo recomendado:** sonnet
**Agente recomendado:** implementer
**Executável por:** **orquestrador** (verificação no navegador, passos 1–4) + **agente** (documentos,
passos 5–8)
**PRD:** `S:\Projetos\academic_page\haroldo\PRD.md`
**Projeto:** `S:\Projetos\academic_page\haroldo`

## Objetivo

Com todas as rotas prontas, uma única passada no navegador, com o mesmo build, prova o critério da
fase — as sete rotas navegáveis com o conteúdo placeholder, sem rolagem horizontal de 360 a 1440 px,
com movimento que respeita `prefers-reduced-motion` e navegação completa por teclado. Os documentos
passam a dizer que a fase 3 está concluída, e o que ela não resolveu fica com destino nomeado.

## Arquivos afetados

- `PRD.md` — §0 (`Estado da implementação`, `Versão do PRD`, `Última atualização`), §0.1 (linha
  nova), §12 (itens da fase 3 e a tabela de progresso) e, **se** a Q-RN02 mudar a regra, a RN-02 do §5.3
- `plans/README.md` — linha da fase 3
- `plans/fase-3-site-publico/README.md` — tabela de estado, dívidas que a fase cria e empurra
- `tests/content/paridade-schema.test.ts` — **só** as linhas 77–81 do cabeçalho (dívida 7(b))
- `tests/content/conteudo-valido.test.ts` — **só** a frase do cabeçalho que atribui a dívida 7(c) a
  este arquivo

> O executor não toca em arquivo fora desta lista. Se precisar, para e reporta.
> **Não** altere o `Status` do PRD (`🟢 Aprovado`). **Não** promova `Status:` de plano nenhum.
> **Não** altere lógica de teste — só comentário de cabeçalho. Não commite.

## Contexto necessário

**Critério da fase** (§6.2): "Todas as rotas navegáveis com o conteúdo placeholder, responsivas de
360 px a 1440 px." Cada plano de rota já mediu a sua página; este plano mede **todas juntas, sobre o
mesmo build**, porque correções posteriores (ex.: 049 mexeu na disciplina depois do 048) invalidam
medições antigas.

**Procedimento:** seção "Verificação no navegador" de `plans/fase-3-site-publico/README.md`. Rotas:
`/`, `/sobre/`, `/pesquisa/`, `/ensino/`, `/ensino/2026-2-relatividade-geral/`,
`/ensino/2025-1-mecanica-classica/`, `/publicacoes/` e uma inexistente (via `npx wrangler dev`, porque
o `astro preview` não aplica o `not_found_handling`).

**Tabela a preencher (passo 2)** — uma linha por rota × largura (8 rotas × 3 larguras = 24 linhas):

| Rota | Largura | scrollWidth | clientWidth | Cortado? | Observação |
|---|---|---|---|---|---|

**Movimento (RF-32; §7 da identidade):** em `/sobre/` e `/publicacoes/`, com DevTools *Rendering →
Emulate CSS media feature prefers-reduced-motion*:
- `no-preference`: a régua do cabeçalho se desenha e o `<h1>` sobe ao carregar; transcreva.
- `reduce`: nada anima; `<h1>` e régua já no estado final; `<details>` e menu abrem sem transição.
- Em `no-preference` com *Network → Disable cache* e o CSS bloqueado (*Network request blocking* do
  arquivo `/_astro/*.css`): o texto continua visível (§7: "Nenhuma animação começa com o conteúdo
  invisível sem CSS").

**Teclado (RNF-15):** em cada rota, só com Tab/Shift+Tab/Enter/Esc: "Pular para o conteúdo" é o
primeiro foco e leva ao `<main>`; todo link e botão recebe foco visível; menu do celular (360 px) abre
e fecha; botão copiar funciona; `<details>` abre.

**Q-RN02 — respondida em 2026-09-14, opção (c).** O stakeholder manteve a RN-02 como está ("ordem
de cadastro invertida") e decidiu que ela será cumprida por um **campo de data de cadastro** criado
numa fase que possa mudar o schema. Até lá vale a regra provisória do 040 (título alfabético pt-BR
dentro do ano). O que este plano escreve: a RN-02 do §5.3 ganha a nota "parcial — dentro do ano, a
ordem é alfabética por título até existir campo de data de cadastro (Q-RN02, 2026-09-14)", e a
pendência entra na lista de dívidas do README da fase com "fecha quando: um plano de schema criar
o campo de data de cadastro e `compareWithinYear` passar a usá-lo".

**Dívida 7(b)** (`tests/content/paridade-schema.test.ts:77-81`), texto atual: "…Fica como guarda para a
fase 3, quando campo novo nascer." A fase 3 não criou campo (schema congelado, Decisão 2 da sabatina
de identidade visual). Troque a última frase por: "Continua aberta depois da fase 3, que não mudou
schema. Fecha quando existir campo com `list: true` e `options`." Mais nada no arquivo.

**Imprecisão do cabeçalho de `conteudo-valido.test.ts`** (README da fase 2, "Dívidas novas"): o
cabeçalho diz que o arquivo fecha a dívida 5 **e** a 7(c); a 7(c) foi fechada em
`paridade-schema.test.ts`. Corrija só essa atribuição.

**§0 do PRD** — vocabulário e regras em `plans/README.md`, seção "O topo do PRD tem de refletir a
realidade". A linha da fase 3 em `Estado da implementação` passa a 🟢 concluída com a data, os planos
036–053 e o número da suíte medido (não estimado). Versão: próxima de `v0.1.34` na sequência que
estiver no §0.1 no momento — confira, não suponha.

**README da fase — seção nova "O que a fase 3 empurra adiante, e as dívidas que ela criou"**, no
padrão do README da fase 2: para a fase 4 (rotas `/en`, `en.ts` com o tipo `UiStrings`, seletor no
espaço reservado do cabeçalho, `lang` por árvore); para a fase 5 (imagens sem dimensões e sem
otimização — `foto`/`imagem` renderizadas com `<img>` cru; canonical/OG/favicon; axe e Lighthouse; a
remoção do `noindex`); dívidas sem fase (7(b); Q-RN02 se ficou na opção (c); qualquer achado dos planos
036–052 registrado nas Evidências — **leia as Evidências**, não o resumo delas). Cada item com "fecha
quando".

## Passos

1. Orquestrador: `npm ci`, `npm run build:pipeline`, `npm run test:dist` sobre a `main` atualizada → verify: saídas coladas com o SHA (`git rev-parse HEAD`).
2. Orquestrador: `npx astro preview` e `npx wrangler dev` (um de cada vez), tabela das 24 linhas preenchida → verify: tabela com data e horário; qualquer `scrollWidth ≠ clientWidth` **reprova** e vira correção em plano próprio antes de seguir.
3. Orquestrador: movimento nas três condições → verify: transcrição.
4. Orquestrador: teclado em todas as rotas → verify: transcrição por rota.
5. Agente: comentários dos dois testes → verify: `git diff tests/content` colado, só linhas de comentário; `npm run test:coverage` colado (mesma contagem de testes de antes).
6. Agente: README da fase e `plans/README.md` → verify: `git diff --stat` colado.
7. Agente: PRD §0, §0.1, §12 (marcar itens 2, 11 e 12 com a referência a este plano; os demais já marcados nas promoções) e nota de RN-02 parcial conforme a Q-RN02 (opção c) → verify: `grep -n "Fase 3" PRD.md` colado mostrando `12/12` e `🟢 Concluída`, e o §0 sem contradição ("não iniciada" e "concluída" na mesma célula foi motivo de reprovação no 034).
8. Portão → verify: `npm run lint`, `npm run format:check`, `npm run test:coverage`, `npm run build:pipeline`, `npm run test:dist` colados; **orquestrador**: CI `conclusion: success` e Workers Builds `success` no commit de fechamento, com ids.

## Critérios de aceitação

- [ ] Tabela 8 rotas × 3 larguras com `scrollWidth = clientWidth` em todas as 24 linhas e nenhum elemento cortado (RF-26)
- [ ] Movimento observado em `no-preference`, ausente em `reduce`, e texto visível com CSS bloqueado (RF-32)
- [ ] Navegação completa por teclado registrada rota a rota (RNF-15)
- [ ] 404 servido pelo `wrangler dev` com a página no corpo, dentro da mesma passada
- [ ] RN-02 do §5.3 com a nota de "parcial" da Q-RN02 (opção c) e a pendência na lista de dívidas com "fecha quando"
- [ ] Comentários de 7(b) e 7(c) corrigidos, sem mudança de lógica (mesma contagem de testes)
- [ ] §12 da fase 3 em 12/12, §0 e §0.1 atualizados; `plans/README.md` com a fase 3 concluída
- [ ] README da fase com o que ela empurra adiante e as dívidas criadas, cada uma com "fecha quando"
- [ ] Portão local completo, CI e Workers Builds verdes no commit de fechamento, com saída colada

## Evidência

<Preenchido pelo orquestrador (1–4, 8 parte remota) e pelo executor (5–8). Declare o que NÃO rodou.>
