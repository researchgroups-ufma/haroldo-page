# Plano 073 — Verificação transversal e fechamento da fase 4

**Status:** TODO
**RFs cobertos:** **M-07** (inspeção manual), critério de conclusão da fase 4 no §6.2 ("M-07 atingida; fallback verificado item a item"), RF-26, RF-28, RF-29; §12 fase 4, item 8
**Depende de:** **todos os planos 055–072 em `DONE`** (Q-F4-1 e Q-F4-2 já respondidas: Decisões 13 e 14)
**Modelo recomendado:** sonnet
**Agente recomendado:** implementer
**Executável por:** **orquestrador** (navegador, passos 1–5) + **agente** (documentos, passos 6–8)
**PRD:** `S:\Projetos\academic_page\haroldo\PRD.md`
**Projeto:** `S:\Projetos\academic_page\haroldo`

## Objetivo

Fica demonstrado, sobre a `main` atualizada, o critério de conclusão da fase: todas as rotas EN nas
três larguras sem rolagem horizontal, **nenhuma** string de interface em português nelas (inspeção
manual, além do teste do 072), e o **fallback verificado item a item** — cada item de conteúdo, na sua
rota EN, sai em inglês ou em português marcado conforme o seu grupo `en`. O §12 da fase 4 chega a 9/9.

## Arquivos afetados

- `plans/fase-4-internacionalizacao/README.md` — estado, "Onde cada item do §12 fecha", seção nova "O que a fase 4 empurra adiante, e as dívidas que ela criou"
- `plans/README.md` — linha da fase 4 e "Última atualização"
- `PRD.md` — §0, §0.1, §6.2 se preciso, §7.2 (versão do `@astrojs/sitemap`), §7.5 (`src/views/`, se o 062 não registrou), §12 (item 8 e a contagem)
- `plans/DESPACHO.md` — a seção "Regras de código da fase 3" passa a apontar para o README da fase vigente

> O executor (passos 6–8) não toca em `src/`, `tests/` nem `content/`. Se a verificação dos passos 1–5
> achar defeito, ele vira correção **em plano próprio** antes deste fechar.

## Contexto necessário

**Critério da fase** (§6.2): "M-07 atingida; fallback verificado item a item." **M-07** (§3.3): "Rotas
`/en` sem string de interface em português — 0 ocorrências — Inspeção manual de todas as rotas EN +
teste sobre o `dist/`… (Decisão 12)". O teste é do 072; **a inspeção manual é deste plano** e não é
substituída pelo teste (o teste não vê texto hardcoded que não coincide com valor de dicionário).

**Procedimento de navegador:** seção "Verificação no navegador" do README da fase (Vivaldi, aba
visível, iframe a 360/768/1440, Tab não move o foco nesta máquina). Rotas EN: `/en/`, `/en/about/`,
`/en/research/`, `/en/teaching/`, `/en/teaching/2026-2-relatividade-geral/`,
`/en/teaching/2025-1-mecanica-classica/`, `/en/publications/` (no `astro preview`) e
`/en/rota-inexistente` (no `wrangler dev`) — **8 rotas × 3 larguras = 24 linhas**.

**Inspeção M-07 (passo 3):** em cada rota EN, a 1440, ler o texto visível e os nomes acessíveis
(árvore de acessibilidade da extensão) e listar **todo** trecho em português que **não** esteja dentro
de elemento `lang="pt-BR"` (um script no console que percorre os nós de texto fora de
`[lang="pt-BR"]` ajuda, mas a leitura é o método — transcreva os dois). Esperado: nenhum. Qualquer
ocorrência reprova e vira plano de correção.

**Fallback item a item (passo 4):** tabela com uma linha por item de conteúdo **publicado** (perfil e
seus itens de `formacao`/`atuacao`/`areas`; cada linha de pesquisa; cada projeto; cada disciplina;
cada publicação) × campo traduzível exibido: valor do `en` no arquivo (vazio/preenchido), o que a rota
EN mostrou, e o `lang` do elemento. Gerada por script a partir de `content/` e do `dist/`, **conferida
por amostra no navegador** (ao menos a linha de pesquisa com `en.titulo`, uma disciplina e o perfil).
Campos "P" entram na tabela numa seção à parte: `lang="pt-BR"` em `/en` e **nenhum** efeito sobre o
aviso (Decisão 13).

**Seletor em todas as rotas (passo 5):** de cada rota PT, o seletor leva à EN correspondente e volta
(ida e volta nas 8 rotas); a transição entre páginas não aborta.

**§0 do PRD:** vocabulário fechado do `Status` (`plans/README.md`, "O topo do PRD tem de refletir a
realidade"); o progresso vai na linha "Estado da implementação". A tabela "Progresso Geral" do §12
passa a "Fase 4 — 9/9 — 🟢 Concluída".

**"O que a fase 4 empurra adiante"** (no README da fase, padrão do README da fase 3): no mínimo — o
`robots.txt` apontando o `sitemap-index.xml` e a retirada do `X-Robots-Tag: noindex` (fase 5, Q-05);
Open Graph (fase 5, RF-30); o manual do professor explicando o grupo "Versão em inglês" dentro de cada
item (fase 5, §10.5); e toda dívida nova que os planos 055–072 registraram, cada uma com "fecha
quando".

## Passos

1. Orquestrador: `npm ci`, `npm run build:pipeline`, `npm run test:dist` sobre a `main` atualizada → verify: saídas com o SHA (`git rev-parse HEAD`).
2. Orquestrador: tabela 8 rotas EN × 3 larguras, `[scrollWidth, clientWidth]` e elemento cortado → verify: tabela com data e horário; qualquer desigualdade reprova.
3. Orquestrador: inspeção M-07, rota a rota → verify: transcrição por rota (texto em português fora de `lang="pt-BR"`: nenhum).
4. Orquestrador + script: tabela do fallback item a item e as amostras no navegador → verify: tabela colada e as amostras transcritas.
5. Orquestrador: seletor ida e volta nas 8 rotas → verify: transcrição.
6. Agente: README da fase e `plans/README.md` → verify: `git diff --stat` colado.
7. Agente: PRD §0, §0.1, §7.2, §7.5, §12 → verify: `grep -n "Fase 4" PRD.md` colado mostrando `9/9` e `🟢 Concluída`, e o §0 sem contradição.
8. Agente: `plans/DESPACHO.md` → verify: `git diff plans/DESPACHO.md` colado.
9. Portão → verify: `npm run lint`, `npm run format:check`, `npm run test:coverage`, `npm run build:pipeline`, `npm run test:dist` colados; **orquestrador**: CI `success` e Workers Builds `success` no commit de fechamento, com ids.

## Critérios de aceitação

- [ ] 8 rotas EN × 3 larguras sem rolagem horizontal nem elemento cortado (RF-26)
- [ ] Inspeção M-07: zero texto de interface em português fora de `lang="pt-BR"` nas 8 rotas EN
- [ ] Fallback verificado item a item, com a tabela e as amostras no navegador
- [ ] Seletor ida e volta nas 8 rotas (RF-29)
- [ ] README da fase com o estado final e o que a fase empurra adiante, cada item com "fecha quando"
- [ ] §12 da fase 4 em 9/9; §0, §0.1, §7.2 e §7.5 atualizados; `plans/README.md` com a fase 4 concluída
- [ ] Portão local completo, CI e Workers Builds verdes no commit de fechamento, com saída colada

## Evidência

<Preenchido pelo executor ao concluir: saídas literais coladas, por passo; os passos 1–5 são do orquestrador. Plano sem esta seção preenchida não é DONE.>
