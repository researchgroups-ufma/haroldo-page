# Plano 074 — Enxugar o PRD: histórico de implementação em documento próprio

**Status:** TODO
**RFs cobertos:** nenhum — documentação e convenção de promoção. Sabatina "enxugar o PRD", Decisões 1 a 4 (`docs/sabatinas/CHANGELOG_sabatina_enxugar-prd.md`, PRD v0.1.69)
**Depende de:** nada; intercalado entre o 064 e o 065, sem ser pré-requisito de nenhum plano
**Modelo recomendado:** —
**Agente recomendado:** orquestrador (a triagem das versões e as linhas curtas pedem o contexto da sabatina)
**Executável por:** orquestrador + `code-reviewer`
**PRD:** `S:\Projetos\academic_page\haroldo\PRD.md`
**Projeto:** `S:\Projetos\academic_page\haroldo`

## Objetivo

O `PRD.md` (v0.1.69, 204 KB, 54% no §0) volta a ser o documento do produto. O histórico de execução
sai, **movido sem reescrita**, para `docs/historico-de-implementacao.md`, e a convenção de promoção
muda para não voltar a inchar o PRD: plano DONE não sobe a versão, e os índices de `plans/` guardam só
o último evento.

## Arquivos afetados

- `docs/historico-de-implementacao.md` — novo
- `PRD.md` — §0 ("Estado da implementação", "Documentos relacionados"), §0.1 e §12
- `plans/README.md` — "Última atualização", células longas da tabela de fases (fases 2, 3 e 4), seção
  da convenção de promoção, exceção de pasta do 054/074
- `plans/fase-4-internacionalizacao/README.md` — "Última atualização", linha do 074 na tabela, nota na
  ordem de execução
- `scripts/verificar-promocao.mjs` — lista de arquivos da promoção e ponteiro da mensagem
- `plans/fase-4-internacionalizacao/073-verificacao-transversal-e-fechamento-da-fase-4.md` — o ponteiro
  para a seção renomeada de `plans/README.md` (achado da revisão, ciclo 1)
- `.prettierignore` — `docs/historico-de-implementacao.md` (texto movido de arquivos que já estão fora do
  Prettier; formatar reescreveria as tabelas e quebraria a prova de identidade)
- `docs/sabatinas/CHANGELOG_sabatina_enxugar-prd.md` — já criado na sabatina; entra no commit de trabalho
- este plano

Fora do repositório (não vão no commit): memórias `promocao-de-plano-atualiza-o-topo`,
`prd-status-sempre-atualizado`, `enxugar-prd-proposta`, `haroldo-page-estado-atual` e o `MEMORY.md`.
As skills globais (`fechar-fase`, `sabatina`) **não** mudam: pedem linha no §0.1 ao fechar fase e ao
sabatinar, o que continua valendo pela regra abaixo.

## Contexto necessário

**Regra de versão (Decisão 2, detalhada aqui).** A `Versão do PRD` sobe, com uma linha curta no §0.1,
quando: (a) muda texto de §1–§11, §13–§17 ou dos apêndices; (b) muda o `Status` do documento; (c) uma
sabatina, um recorte ou um **fechamento de fase** muda escopo, fase ou a convenção do próprio PRD.
Promoção de plano, sozinha, não sobe a versão.

**Triagem do §0.1 (Decisão 4).** Critério mecânico: a versão fica no PRD se o commit que a criou
alterou texto fora do §0 e do §12 (medido por diff de cada commit que tocou `PRD.md`, script
`classificar.py` na Evidência). Resultado: **v0.1, v0.1.1, v0.1.2, v0.1.4, v0.1.5, v0.1.6, v0.1.11,
v0.1.13, v0.1.15, v0.1.16, v0.1.19, v0.1.20, v0.1.27, v0.1.34, v0.1.53, v0.1.56, v0.1.58, v0.1.59,
v0.1.66**, mais as das regras (b) e (c): **v0.1.8** (`Status` a Aprovado), **v0.1.69** (esta
sabatina) e os fechamentos de fase — a versão que leva o §12 da fase ao total e a do `/fechar-fase`,
quando houve: v0.1.4 e v0.1.19 (já no critério mecânico), **v0.1.31** (fase 2), v0.1.53 (já no
critério) e **v0.1.55** (fase 3). As promoções que só confirmam o fechamento (v0.1.20 fica pelo
critério mecânico; v0.1.32 e v0.1.54 saem) não entram — 23 linhas. O campo "Mudanças" de cada uma tem
no máximo 150 caracteres (o "~150" da Decisão 4 como teto) e cita as seções ou identificadores
alterados; quando a linha original não nomeia a seção, a curta cita a que o diff do commit mostra. As
69 linhas originais (v0.1 a v0.1.68) vão inteiras para o histórico, em ordem de versão. A v0.1.69 é
exceção declarada da prova de identidade: o texto longo escrito na sabatina nunca foi commitado, o
`mover.py` o reescreve curto, e a versão longa não é preservada — as decisões estão no CHANGELOG da
sabatina.

**§12 (Decisão 3).** Caixa `- [x] <item> — plano **NNN** (`hash`)`; vários planos, `planos **A**
(`h`) e **B** (`h`)`; item fechado sem plano, `— sem plano: <identificador do PRD>`. O texto do item
(o requisito) não muda; sai a anotação. O hash é o do commit de trabalho, tirado da coluna "Commits"
do README da fase (primeiro hash listado; no 028, o `5528ad6` que a v0.1.30 cita). Caixa `[ ]` que
já citava plano previsto (027, 029): `— plano **NNN**`, sem hash; as outras caixas `[ ]` não mudam. A nota de recorte da fase 2 vira uma linha com ponteiro.
Toda linha retirada ou reescrita vai para o histórico, com as linhas de continuação.

**§0.** "Estado da implementação" vira uma linha: fase, contagem do §12, data de conclusão ou
`próximo: plano NNN`, e ponteiros para §12, `plans/README.md` e o histórico. "Documentos
relacionados" ganha o histórico. `Versão do PRD` fica v0.1.69 e `Última atualização` 2026-09-30.

**Índices de `plans/`.** "Última atualização" passa a guardar **só o último evento** (substitui, não
acumula). As células de fase com narrativa ficam com faixa de planos, DONE e próximo. O texto retirado
vai para o histórico, idêntico. Links relativos do texto movido não são reescritos (o histórico diz
isso no topo).

**Convenção nova de promoção** (vai para `plans/README.md`, no lugar de "O topo do PRD tem de refletir
a realidade"): o commit `docs: NNN DONE -- …` toca (1) o plano; (2) o README da fase, linha da tabela e
"Última atualização"; (3) `plans/README.md`, "Última atualização" e célula da fase; (4)
`docs/historico-de-implementacao.md`, uma entrada nova no fim da seção de registro; (5) `PRD.md`, a
linha da fase no "Estado da implementação" e a `Última atualização` — mais a caixa e a contagem do §12
se o plano fechar item. Sem `Versão do PRD` e sem §0.1. O `verificar-promocao.mjs` passa a avisar pelos
três de caminho fixo: `PRD.md`, `plans/README.md` e o histórico.

**Estrutura do histórico:** topo (o que é, origem, regra de texto movido); §1 versões v0.1–v0.1.68;
§2 célula "Estado da implementação" como estava na v0.1.69; §3 anotações do §12 por fase; §4 textos
retirados de `plans/README.md` (4.1) e do README da fase 4 (4.2); §5 registro de promoções a partir do
074, uma entrada por plano (`- **AAAA-MM-DD — NNN DONE** (`hash`): 1 a 3 frases`), novas no fim.

**Fins de linha:** `PRD.md` e os dois READMEs são CRLF na cópia de trabalho (o repositório normaliza
para LF, `.gitattributes`); preserve o fim de linha de cada arquivo. O histórico nasce LF.

## Passos

1. Linha de base → verify: `npx vitest run tests/lib/citacoes-do-prd.test.ts` colado (antes);
   `wc -c -l` do `PRD.md` e dos dois READMEs colado.
2. Triagem → verify: saída do `classificar.py` colada.
3. Script `mover.py` escreve o histórico e o PRD/READMEs novos → verify: saída do script colada.
4. Prova de identidade: `provar.py` confere que **toda** linha removida de `PRD.md`, `plans/README.md`
   e do README da fase 4 (diff contra o `HEAD`) aparece idêntica no histórico, e que nenhuma linha do
   §1–§11 e §13–§17 do PRD mudou → verify: saída colada, `FALTANDO 0`.
5. Convenção: `plans/README.md`, README da fase 4, `verificar-promocao.mjs`, `.prettierignore` →
   verify: `git diff --stat` colado.
6. Portão → verify: `npm run lint`, `npm run format:check`, `npm run test:coverage` colados; o teste de
   citações passa (depois); `wc -c -l` final colado; contagem de U+FEFF e de mojibake nos arquivos tocados.
7. Revisão pelo `code-reviewer`; CI no commit empurrado.

## Critérios de aceitação

- [x] `docs/historico-de-implementacao.md` com as seções 1 a 5; as 69 versões antigas, a célula de
      estado, as anotações do §12 e os textos dos índices idênticos à origem (`provar.py`, `FALTANDO 0`)
- [x] §0.1 com as 23 versões da triagem, "Mudanças" ≤ 150 caracteres, e a nota sobre as ausentes
- [x] §0 "Estado da implementação" em uma linha curta; §12 no formato da Decisão 3
- [x] Nenhuma linha de §1–§11 e §13–§17 do PRD alterada
- [x] `plans/README.md` e README da fase 4 com "Última atualização" de um evento e a convenção nova
- [x] `verificar-promocao.mjs` avisa pelos três arquivos; `.prettierignore` com o histórico
- [x] Teste de citações verde antes e depois; `lint`, `format:check` e `test:coverage` verdes
- [x] PRD abaixo de 100 KB

## Evidência

**Ciclo 2 (2026-09-30).** A revisão do ciclo 1 reprovou com quatro obrigatórios de documento:

1. Os fechamentos das fases 2 e 3 estavam fora do §0.1. Entram a v0.1.31 e a v0.1.55; são 23 linhas.
2. O formato do commit de trabalho na convenção nova foi trocado para `<tipo>: … (plano NNN)`.
3. O ponteiro do 073 apontava para a seção renomeada; o 073 entrou nos arquivos afetados.
4. A frase sobre a v0.1.69 foi corrigida.

Duas observações também foram aplicadas: a v0.1.19 passa a dizer "reposicionada", e o teto do campo "Mudanças" é 150 caracteres. A Evidência abaixo foi regerada inteira pelo `evidencia.py`, a partir das capturas refeitas depois da última edição. O `mover.py` rodou de novo sobre as cópias de `<scratch>\bak`.

Execução do orquestrador em 2026-09-30. Scripts e capturas em `<scratch>` = `C:\Users\andne\AppData\Local\Temp\claude\S--Projetos-academic-page-haroldo\8941f624-9668-4a87-8f59-aeb3ae8f7c47\scratchpad\074`: `classificar.py`, `mover.py` (com `conv_nova.md` e `topo.md`), `provar.py` e `evidencia.py`; cópia de antes do `mover.py` em `<scratch>\bak`. Capturas pelo Git Bash (`{ cmd; echo "EXIT=$?"; } > x.txt`), sem BOM.

### Passo 1 — linha de base: teste de citações antes (`citacoes-antes.txt`)

```

 RUN  v4.1.11 S:/Projetos/academic_page/haroldo


 Test Files  1 passed (1)
      Tests  22 passed (22)
   Start at  14:18:51
   Duration  216ms (transform 41ms, setup 0ms, import 73ms, tests 7ms, environment 0ms)

EXIT=0
```

### Passo 1 — tamanhos antes (o `HEAD:PRD.md` é LF; a cópia de trabalho é CRLF e já tem a v0.1.69) (`tamanho-antes.txt`)

```
   1092  203318
(HEAD:PRD.md)
  1093 204806 PRD.md
   147  16870 plans/README.md
   397  32864 plans/fase-4-internacionalizacao/README.md
  1637 254540 total
```

### Passo 2 — triagem por diff de cada commit que tocou o PRD (`classificar.py`) (`classificar.txt`)

```
78759a9 2026-09-01 born=v0.1,v0.1.1,v0.1.2 prod=1,10,11,13,14,15,16,17,2,3,4,5,6,7,8,9,Ap | chore: inicializa repositório com documentos do projeto e configuração
93136ef 2026-09-01 born=v0.1.3 prod=- | docs: registra progresso da fase 0 no PRD e cria mapa de execução dos 
2a5bdbf 2026-09-01 born=- prod=- | docs: registra Vitest pronto no checklist da fase 0 do PRD
363d41a 2026-09-01 born=- prod=- | docs: registra planos 006 e 007 no checklist da fase 0 do PRD
af72c49 2026-09-01 born=- prod=- | docs: registra workflow de CI no checklist da fase 0 do PRD
ac6e52d 2026-09-01 born=- prod=- | docs: fecha plano 010 e a pendencia de verificacao do plano 008
b2dcf2b 2026-09-01 born=- prod=- | docs: fecha plano 009 e atualiza o estado da fase 0
9150233 2026-09-01 born=v0.1.4 prod=16 | docs: registra ADR-0001 e fecha o checklist da fase 0
b1cc6c1 2026-09-01 born=v0.1.5 prod=5,7 | docs: fecha o plano 013 e a fase 0; registra o repositorio publico
6e29875 2026-09-01 born=v0.1.6 prod=14,16 | docs: resolve a Q-02 — TinaCMS fica, painel em ingles e aceitavel
9a14ce2 2026-09-01 born=v0.1.7 prod=- | chore: resolve as tres dividas herdadas da fase 0
1a0d6e6 2026-09-01 born=v0.1.8 prod=- | docs: PRD passa a Aprovado e ganha a linha de estado da implementacao
b92c3d7 2026-09-03 born=v0.1.9 prod=- | docs: fase 1 registra o 017 como DONE e os insumos herdados pelo 019
62363a0 2026-09-03 born=v0.1.10 prod=- | docs: fase 1 registra o 018 como DONE e o desfecho das armadilhas herd
0978b3f 2026-09-03 born=v0.1.11 prod=14,16 | Q-07 resolvida: e-mail institucional real substitui o PLACEHOLDER
6a42330 2026-09-03 born=v0.1.12 prod=- | plano 019: teste de paridade Zod x Tina (D-06, F-09, RNF-09)
f6d3a36 2026-09-03 born=- prod=- | docs: registra o hash do plano 019 no PRD, no README da fase e no plan
c20a495 2026-09-03 born=v0.1.13 prod=16 | Q-06 resolvida: o EDITOR do TinaCloud e o mesmo e-mail institucional
c0e1bb1 2026-09-03 born=v0.1.14 prod=- | docs: registra que o CI esteve vermelho a fase 1 inteira, e por que
edfc822 2026-09-04 born=v0.1.15,v0.1.16 prod=13,5,7 | docs: sabatina dos scripts Python, RF-37 no PRD e o plano 022
2fbbead 2026-09-04 born=v0.1.17 prod=- | docs: fase 1 registra o 020 como DONE e as duas armadilhas novas do pa
634290f 2026-09-10 born=v0.1.18 prod=- | docs: fase 1 registra o 022 como DONE e o que o painel ensinou sobre o
26de58a 2026-09-10 born=v0.1.19 prod=7 | plano 021: ADRs da fase 1, criterio do /admin demonstrado e fechamento
ae1bbc8 2026-09-11 born=v0.1.20 prod=16 | plano 023: reconciliacao do estado documental (PRD §0 e plans/README)
4ffaab2 2026-09-11 born=v0.1.21 prod=- | docs: 023 DONE com CI verde sobre ae1bbc8, e o topo do PRD junto
2557532 2026-09-11 born=v0.1.22 prod=- | docs: 024 DONE com CI verde sobre f8f416a, e o topo do PRD junto
25396cf 2026-09-11 born=v0.1.23 prod=- | docs: 025 DONE — o deploy deixa de ser manual, e a fase 2 sai do 0/8
5bbd1d1 2026-09-11 born=v0.1.24 prod=- | plano 026: /admin em producao autentica e edita pelo TinaCloud (RF-01,
798b7d2 2026-09-11 born=v0.1.25 prod=- | docs: 030 DONE -- o portao de conteudo roda tambem no build que public
b01e267 2026-09-11 born=v0.1.26 prod=- | docs: 031 DONE -- o portao do tina-lock nasceu verde, depois de dois f
edf2620 2026-09-12 born=v0.1.27 prod=3,6 | docs: recorte sem o professor -- 027 e 029 vao para a fase 5
7bd1e62 2026-09-12 born=v0.1.28 prod=- | docs: 033 DONE -- os avisos do painel deixam de viver espalhados por s
78d5305 2026-09-12 born=v0.1.29 prod=- | docs: 032 DONE -- o CI passa a auditar dependencias, e o portao nasceu
f6c79a9 2026-09-12 born=v0.1.30 prod=- | docs: 028 DONE -- falha do build de deploy chega ao ADMIN, com uma pen
ef7f258 2026-09-12 born=v0.1.31 prod=- | plano 034: pipeline documentado no README e checklist da fase 2 em 5/5
3fafd36 2026-09-12 born=v0.1.32 prod=- | docs: 034 DONE -- fase 2 concluida em 5/5, o pipeline de publicacao do
8ce0eb9 2026-09-12 born=v0.1.33 prod=- | docs: 035 DONE -- deploy de emergencia com portao de conteudo e vigia 
e06bf59 2026-09-14 born=v0.1.34 prod=14,15,16,8,Ap | docs: Q-04 resolvida e fase 3 fatiada em 18 planos (036-053)
48d75f6 2026-09-16 born=v0.1.35 prod=- | docs: 036 DONE -- tokens, escala tipografica e Archivo auto-hospedada
7d753b7 2026-09-16 born=v0.1.36 prod=- | docs: 037 DONE -- dicionario de interface em PT e navegacao
d6bb58d 2026-09-16 born=v0.1.37 prod=- | docs: 038 DONE -- paragrafos, contagem e data pt-BR
022c1de 2026-09-16 born=v0.1.38 prod=- | docs: 039 DONE -- filtro de rascunho, singleton e ordenacao de pesquis
469b9ff 2026-09-16 born=v0.1.39 prod=- | docs: 040 DONE -- publicacoes por ano, autor destacado e links DOI/arX
269149d 2026-09-17 born=v0.1.40 prod=- | docs: 041 DONE -- slug de disciplina, atuais x anteriores, contagens e
8ce4a72 2026-09-17 born=v0.1.41 prod=- | docs: 042 DONE -- layout base, cabecalho com menu do celular e rodape
e9486bd 2026-09-17 born=v0.1.42 prod=- | docs: 043 DONE -- componentes de base, cabecalho de pagina, pilula, ta
933150a 2026-09-17 born=v0.1.43 prod=- | docs: 044 DONE -- home com perfil, sintese e celulas-caminho
f5195e7 2026-09-18 born=v0.1.44 prod=- | docs: 045 DONE -- sobre com biografia, formacao, areas, contato e perf
92de929 2026-09-18 born=v0.1.45 prod=- | docs: 046 DONE -- pesquisa com linhas, projetos e ancora da linha rela
791c575 2026-09-18 born=v0.1.46 prod=- | docs: 047 DONE -- ensino com atuais, anteriores e estado vazio
39f7425 2026-09-18 born=v0.1.47 prod=- | docs: 048 DONE -- pagina de disciplina com aulas, recursos e estado va
677df6a 2026-09-18 born=v0.1.48 prod=- | docs: 054 DONE -- teste de citacoes do PRD, camada de existencia
a0b76ec 2026-09-21 born=v0.1.49 prod=- | docs: 049 DONE -- painel de script com Shiki monocromatico e botao cop
370ffb1 2026-09-22 born=v0.1.50 prod=- | docs: 050 DONE -- publicacoes por ano, autor destacado e links so quan
2978844 2026-09-22 born=v0.1.51 prod=- | docs: 051 DONE -- pagina 404 e not_found_handling provado em producao
db719f4 2026-09-23 born=v0.1.52 prod=- | docs: 052 DONE -- testes de integracao sobre o dist e peso de JS no CI
876d89c 2026-09-23 born=v0.1.53 prod=5 | plano 053: verificacao transversal 360/768/1440 e fechamento da fase 3
ae2b668 2026-09-23 born=v0.1.54 prod=- | docs: 053 DONE -- verificacao transversal e fase 3 concluida (12/12)
5c38a28 2026-09-23 born=v0.1.55 prod=- | docs: CHANGELOG da fase 3 -- site publico, correcoes e pendencias do f
b0c9a6e 2026-09-24 born=v0.1.56 prod=5,7,8 | docs: atualiza PRD, identidade visual e indices para o site redesenhad
10edff8 2026-09-24 born=v0.1.57 prod=- | docs: registra a integracao da branch design na main (PRD v0.1.57)
c736e0b 2026-09-24 born=v0.1.58 prod=11,3,5,7 | docs: sabatina da fase 4 (i18n), 12 decisoes no PRD v0.1.58
42bae79 2026-09-25 born=v0.1.59 prod=5 | docs: fatia a fase 4 em 19 planos (055-073) e registra as decisoes 13 
53c057b 2026-09-25 born=v0.1.60 prod=- | docs: 055 e 056 DONE -- comparador do dist e mapa de rotas PT/EN
1c3d4f9 2026-09-28 born=v0.1.61 prod=- | docs: 057 DONE -- dicionario en.ts e strings(lang), ingles aprovado (P
515da7d 2026-09-28 born=v0.1.62 prod=- | docs: 058 DONE -- layout e cabecalhos por idioma (PRD v0.1.62)
61e551e 2026-09-28 born=v0.1.63 prod=- | docs: 059 DONE -- componentes de conteudo e data por idioma (PRD v0.1.
2f66626 2026-09-28 born=v0.1.64 prod=- | docs: 060 DONE -- traducao dentro do item do perfil (PRD v0.1.64, fase
a59d261 2026-09-29 born=v0.1.65 prod=- | docs: 061 DONE -- fallback por campo (PRD v0.1.65, fase 4 em 3/9)
b233c33 2026-09-30 born=v0.1.66 prod=7 | docs: 062 DONE -- views de Home, Sobre e 404 (PRD v0.1.66, fase 4 em 3
44cc311 2026-09-30 born=v0.1.67 prod=- | docs: 063 DONE -- views de Pesquisa e Ensino (PRD v0.1.67, fase 4 em 3
164652f 2026-09-30 born=v0.1.68 prod=- | docs: 064 DONE -- views de Disciplina e Publicacoes (PRD v0.1.68, fase
EXIT=0
```

### Passo 3 — `mover.py` (`mover.txt`)

```
PRD: versões lidas 70, no §0.1 novo 23, no histórico 69
PRD: §12 96 -> 77 linhas; linhas levadas ao histórico §3: 53
plans/README.md: Última atualização 4 linha(s), 3 linhas de fase, convenção 12 linha(s)
README fase 4: Última atualização 15 linha(s)
maior 'Mudanças' no §0.1 novo: 132 caracteres
EXIT=0
```

### Passo 4 — prova de identidade (`provar.py`) (`provar.txt`)

```
PRD.md: removidas 125, no histórico 123, exceção 2, FALTANDO 0
  exceção: | **Documentos relacionados** | `briefing.md` (este diretóri
  exceção: | v0.1.69 | 2026-09-30 | Desenvolvedor | **Sabatina "enxugar
plans/README.md: removidas 18, no histórico 17, exceção 1, FALTANDO 0
  exceção: ## O topo do PRD tem de refletir a realidade
plans/fase-4-internacionalizacao/README.md: removidas 15, no histórico 15, exceção 0, FALTANDO 0
READMEs antes do mover.py iguais ao HEAD (linha a linha): True
PRD §1–§11 e §13+: 872 linhas antes, 872 depois, idênticas: True
FALTANDO 0
EXIT=0
```

### Passo 4 — canário da prova: um caractere trocado no histórico reprova (`canario.txt`)

```
== canário: troca 'aa9a7cf' por 'aa9a7cX' numa linha do histórico
1
PRD.md: removidas 125, no histórico 122, exceção 2, FALTANDO 1
  FALTA: | v0.1.17 | 2026-09-04 | Desenvolvedor | **Plano 020 DONE** (`aa9a7cf`): conteúdo placeholder repres
plans/README.md: removidas 18, no histórico 17, exceção 1, FALTANDO 0
plans/fase-4-internacionalizacao/README.md: removidas 15, no histórico 15, exceção 0, FALTANDO 0
READMEs antes do mover.py iguais ao HEAD (linha a linha): True
PRD §1–§11 e §13+: 872 linhas antes, 872 depois, idênticas: True
FALTANDO 1
EXIT=1
== desfeito
histórico igual à cópia
FALTANDO 0
```

### Passo 5 — `git diff --stat` e linhas dos não rastreados (tirado antes de regerar esta Evidência) (`diffstat.txt`)

```
warning: in the working copy of 'PRD.md', CRLF will be replaced by LF the next time Git touches it
warning: in the working copy of 'plans/README.md', CRLF will be replaced by LF the next time Git touches it
warning: in the working copy of 'plans/fase-4-internacionalizacao/README.md', CRLF will be replaced by LF the next time Git touches it
 .prettierignore                                    |   2 +
 PRD.md                                             | 189 +++++++--------------
 plans/README.md                                    |  61 ++++---
 ...rificacao-transversal-e-fechamento-da-fase-4.md |   4 +-
 plans/fase-4-internacionalizacao/README.md         |  19 +--
 scripts/verificar-promocao.mjs                     |  21 ++-
 6 files changed, 124 insertions(+), 172 deletions(-)
== não rastreados
   221 docs/historico-de-implementacao.md
    38 docs/sabatinas/CHANGELOG_sabatina_enxugar-prd.md
   567 plans/fase-4-internacionalizacao/074-enxugar-o-prd.md
   826 total
```

### Passo 5 — canário do `verificar-promocao.mjs` (`promocao-canario.txt`)

```
== canário: Status trocado para DONE só durante este teste (arquivos novos sem git add -N)
**Status:** DONE
== (a) os três arquivos de caminho fixo tocados
3
OK      plans/fase-4-internacionalizacao/074-enxugar-o-prd.md: pronto para promoção (0 aviso(s))
EXIT=0
== (b) histórico retirado da árvore
0
AVISO   promoção a DONE normalmente toca também: docs/historico-de-implementacao.md (ver plans/README.md, "Promoção de plano e o topo do PRD")
OK      plans/fase-4-internacionalizacao/074-enxugar-o-prd.md: pronto para promoção (1 aviso(s))
EXIT=0
== desfeito
histórico igual à cópia
plano igual à cópia
**Status:** TODO
```

### Passo 6 — `npm run lint` (`lint.txt`)

```

> haroldo-page@0.1.0 lint
> eslint .

EXIT=0
```

### Passo 6 — `npm run format:check` (`format.txt`)

```

> haroldo-page@0.1.0 format:check
> prettier --check .

Checking formatting...
All matched files use Prettier code style!
EXIT=0
```

### Passo 6 — canário do `.prettierignore` (`prettier-canario.txt`)

```
== prettier com o .prettierignore do projeto
Checking formatting...
All matched files use Prettier code style!
EXIT=0
== canário: mesmo arquivo sem ignore (--ignore-path vazio)
Checking formatting...
[warn] docs/historico-de-implementacao.md
[warn] Code style issues found in the above file. Run Prettier with --write to fix.
EXIT=1
```

### Passo 6 — `npm run test:coverage` (`coverage.txt`)

```

> haroldo-page@0.1.0 test:coverage
> vitest run --coverage


 RUN  v4.1.11 S:/Projetos/academic_page/haroldo
      Coverage enabled with v8


 Test Files  20 passed (20)
      Tests  355 passed (355)
   Start at  14:39:41
   Duration  1.97s (transform 6.12s, setup 0ms, import 10.96s, tests 392ms, environment 3ms)

 % Coverage report from v8
-------------------|---------|----------|---------|---------|-------------------
File               | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
-------------------|---------|----------|---------|---------|-------------------
-------------------|---------|----------|---------|---------|-------------------

=============================== Coverage summary ===============================
Statements   : 100% ( 295/295 )
Branches     : 100% ( 148/148 )
Functions    : 100% ( 79/79 )
Lines        : 100% ( 263/263 )
================================================================================
EXIT=0
```

### Passo 6 — teste de citações depois (`citacoes-depois.txt`)

```

 RUN  v4.1.11 S:/Projetos/academic_page/haroldo


 Test Files  1 passed (1)
      Tests  22 passed (22)
   Start at  14:39:45
   Duration  238ms (transform 43ms, setup 0ms, import 76ms, tests 9ms, environment 0ms)

EXIT=0
```

### Passo 6 — `npm run build:pipeline` (com o carimbo do `dist/` e do `PRD.md`) (`build.txt`)

```

> haroldo-page@0.1.0 build:pipeline
> vitest run tests/content && tinacms build --skip-cloud-checks && astro check && astro build


 RUN  v4.1.11 S:/Projetos/academic_page/haroldo


 Test Files  4 passed (4)
      Tests  124 passed (124)
   Start at  14:39:50
   Duration  1.24s (transform 1.97s, setup 0ms, import 3.24s, tests 78ms, environment 0ms)

Starting Tina build
│
○  Tina build complete ───────────────────────────────────────────────────────────────────────────────────────────╮
│                                                                                                                 │
│  🦙 Tina Config                                                                                                 │
│     API url:            https://content.tinajs.io/2.4/content/8be98053-68c3-4262-b7bd-dd1286e1c7ad/github/main  │
│                                                                                                                 │
│  🤖 Auto-generated files                                                                                        │
│     GraphQL Client:     tina/__generated__/client.ts                                                            │
│     Typescript Types:   tina/__generated__/types.ts                                                             │
│     Static HTML file:   public/admin/index.html                                                                 │
│                                                                                                                 │
│                                                                                                                 │
├─────────────────────────────────────────────────────────────────────────────────────────────────────────────────╯
[2m14:40:26[22m [34m[content][39m Syncing content
[2m14:40:26[22m [34m[content][39m Synced content
[2m14:40:26[22m [34m[types][39m Generated [2m582ms[22m
[2m14:40:26[22m [34m[check][39m Getting diagnostics for Astro files in S:\Projetos\academic_page\haroldo...
Result (81 files): 
- 0 errors
- 0 warnings
- 0 hints

[2m14:40:37[22m [34m[content][39m Syncing content
[2m14:40:37[22m [34m[content][39m Synced content
[2m14:40:37[22m [34m[types][39m Generated [2m600ms[22m
[2m14:40:37[22m [34m[build][39m output: [34m"static"[39m
[2m14:40:37[22m [34m[build][39m mode: [34m"static"[39m
[2m14:40:37[22m [34m[build][39m directory: [34mS:\Projetos\academic_page\haroldo\dist\[39m
[2m14:40:37[22m [34m[build][39m Collecting build info...
[2m14:40:37[22m [34m[build][39m [32m✓ Completed in 650ms.[39m
[2m14:40:37[22m [34m[build][39m Building static entrypoints...
[2m14:40:37[22m [34m[vite][39m [32m✓ built in 425ms[39m
[2m14:40:37[22m [34m[vite][39m [32m✓ built in 106ms[39m
[2m14:40:37[22m [34m[build][39m Rearranging server assets...

[42m[30m generating static routes [39m[49m
[2m14:40:37[22m   [34m├─[39m [2m/404.html[22m [2m(+19ms)[22m 
[2m14:40:37[22m   [34m├─[39m [2m/ensino/2025-1-mecanica-classica/index.html[22m [2m(+6ms)[22m 
[2m14:40:37[22m   [34m├─[39m [2m/ensino/2026-2-relatividade-geral/index.html[22m [2m(+127ms)[22m 
[2m14:40:37[22m   [34m├─[39m [2m/ensino/index.html[22m [2m(+7ms)[22m 
[2m14:40:37[22m   [34m├─[39m [2m/pesquisa/index.html[22m [2m(+7ms)[22m 
[2m14:40:37[22m   [34m├─[39m [2m/publicacoes/index.html[22m [2m(+6ms)[22m 
[2m14:40:38[22m   [34m├─[39m [2m/sobre/index.html[22m [2m(+7ms)[22m 
[2m14:40:38[22m   [34m├─[39m [2m/index.html[22m [2m(+4ms)[22m 
[2m14:40:38[22m [32m✓ Completed in 222ms.
[39m
[2m14:40:38[22m [34m[build][39m [32m✓ Completed in 797ms.[39m
[2m14:40:38[22m [34m[build][39m 8 page(s) built in [1m1.50s[22m
[2m14:40:38[22m [34m[build][39m [1mComplete![22m
EXIT=0
-rw-r--r-- 1 andne 197609 91656 14:39:16 PRD.md
-rw-r--r-- 1 andne 197609  6266 14:40:38 dist/index.html
```

### Passo 6 — `npm run test:dist` (`test-dist.txt`)

```

> haroldo-page@0.1.0 test:dist
> vitest run -c vitest.dist.config.ts


 RUN  v4.1.11 S:/Projetos/academic_page/haroldo


 Test Files  1 passed (1)
      Tests  18 passed (18)
   Start at  14:40:39
   Duration  340ms (transform 63ms, setup 0ms, import 127ms, tests 66ms, environment 0ms)

EXIT=0
```

### Passo 6 — `npm audit --audit-level=high` (`audit.txt`)

```
# npm audit report

qs  2.2.5 - 6.15.3
Severity: moderate
qs array-limit bypass via bracket-key comma parsing - https://github.com/advisories/GHSA-x5fp-wj9c-mxmx
qs: Denial of Service via Attacker Controlled isBuffer - https://github.com/advisories/GHSA-4mjr-xmp4-gh2g
fix available via `npm audit fix`
node_modules/qs
  body-parser  1.20.5 - 1.20.6
  Depends on vulnerable versions of qs
  node_modules/body-parser
  express  4.22.2
  Depends on vulnerable versions of qs
  node_modules/express

react-router  6.0.0 - 7.17.0
Severity: moderate
React Router: Open redirect via backslash in <Link> and useNavigate (CVE-2025-68470 bypass) - https://github.com/advisories/GHSA-wrjc-x8rr-h8h6
React Router: Arbitrary Constructor Injection via deserializeErrors() in React Router SSR Hydration - https://github.com/advisories/GHSA-337j-9hxr-rhxg
fix available via `npm audit fix --force`
Will install tinacms@1.5.5, which is a breaking change
node_modules/react-router
  react-router-dom  6.0.0-alpha.0 - 7.17.0
  Depends on vulnerable versions of react-router
  node_modules/react-router-dom
    @tinacms/app  <=0.0.0-ffbb4fa-20260624122203 || >=0.0.23
    Depends on vulnerable versions of react-router-dom
    Depends on vulnerable versions of tinacms
    node_modules/@tinacms/app
      @tinacms/cli  <=0.0.0-ffbb4fa-20260624122203 || >=0.61.24
      Depends on vulnerable versions of @tinacms/app
      Depends on vulnerable versions of tinacms
      node_modules/@tinacms/cli
    tinacms  <=0.0.0-ffbb4fa-20260624122203 || >=1.5.6
    Depends on vulnerable versions of react-router-dom
    node_modules/tinacms

8 moderate severity vulnerabilities

To address issues that do not require attention, run:
  npm audit fix

To address all issues (including breaking changes), run:
  npm audit fix --force
EXIT=0
```

### Passo 6 — tamanhos depois (`tamanho-depois.txt`)

```
  1029  91656 PRD.md
   221 133754 docs/historico-de-implementacao.md
   166  11829 plans/README.md
   386  30738 plans/fase-4-internacionalizacao/README.md
  1802 267977 total
```

### Passo 6 — codificação dos arquivos tocados (o BOM deste plano sai do `evidencia.py conferir`) (`encoding.txt`)

```
PRD.md: Unicode text, UTF-8 text | BOM=0 | mojibake=0
docs/historico-de-implementacao.md: Unicode text, UTF-8 text | BOM=0 | mojibake=0
plans/README.md: Unicode text, UTF-8 text | BOM=0 | mojibake=0
plans/fase-4-internacionalizacao/README.md: Unicode text, UTF-8 text | BOM=0 | mojibake=0
plans/fase-4-internacionalizacao/073-verificacao-transversal-e-fechamento-da-fase-4.md: Unicode text, UTF-8 text | BOM=0 | mojibake=0
scripts/verificar-promocao.mjs: JavaScript source, Unicode text | BOM=0 | mojibake=4
.prettierignore: Unicode text, UTF-8 text | BOM=0 | mojibake=0
docs/sabatinas/CHANGELOG_sabatina_enxugar-prd.md: Unicode text, UTF-8 text | BOM=0 | mojibake=0
== HEAD: scripts/verificar-promocao.mjs
4
== as 4 linhas (NÃO legítimo)
8: *                 branco, passo declarado "NÃO rodei" com seção preenchida,
102:  // 2. "NÃO rodei"/"NÃO foi rodado" sobre um passo cuja seção existe na Evidência é contr
110:    const m = linhas[i].match(/-\s*Passo\s+(\d+)\b[^\n]*N[ÃA]O\s+(?:rodei|foi rodado)/i);
115:          `foi a execução em vez de "NÃO rodei" (defeito do plano 048)`,
```

### O que esta execução não cobre

O CI não rodou: ele vem depois da revisão, no commit de trabalho empurrado (passo 7). O
`verificar-promocao.mjs` rodou só no canário acima, com o `Status:` trocado e desfeito; a rodada de
verdade é a da promoção, na qual ele deve **avisar** que o `PRD.md` não foi tocado. É o esperado neste
plano, porque ele é intercalado: o "próximo" continua sendo o 065 e a data não muda. Não é defeito da
convenção. As memórias fora do repositório (lista em "Arquivos afetados") são atualizadas pelo
orquestrador depois da promoção.
