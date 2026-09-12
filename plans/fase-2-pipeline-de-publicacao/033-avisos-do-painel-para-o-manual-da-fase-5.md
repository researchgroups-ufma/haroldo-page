# Plano 033 — Avisos do painel que o manual da fase 5 é obrigado a cobrir

**Status:** DONE
**RFs cobertos:** **F-09**, **R-01**, RNF-05, RNF-09; §10.5 (`docs/manual-do-professor.md`, entrega
da fase 5); **dívidas 3 e 4** da fase 1
**Depende de:** nenhum. **Totalmente paralelizável** — não toca nenhum arquivo que outro plano da
fase 2 abra.
**Modelo recomendado:** sonnet
**Agente recomendado:** implementer
**Executável por:** **agente**
**PRD:** `S:\Projetos\academic_page\haroldo\PRD.md`
**Projeto:** `S:\Projetos\academic_page\haroldo`

## Objetivo

Existe um documento único, com origem citada arquivo por arquivo, listando **o que o painel deixa
o professor fazer de errado** e o que o manual da fase 5 é obrigado a dizer sobre cada caso. Sem
ele, essas descobertas continuam espalhadas por Evidências de sete planos e por um README de fase
— e a fase 5, meses depois, escreveria o manual sem elas.

Este plano é também onde a fase 2 **registra formalmente sua decisão sobre a dívida 4**: não há
verificação automatizável, e por isso ela vira aviso obrigatório de manual, com entrega nomeada.

## Arquivos afetados

- `docs/avisos-do-painel-para-o-manual.md` — **novo, único arquivo deste plano**

> O executor não toca em arquivo fora desta lista. Se precisar, para e reporta.
> Em especial: **não** edite `PRD.md`, **não** edite `README.md`, **não** edite os READMEs de fase
> e **não** crie `docs/manual-do-professor.md` — o manual é entregável da **fase 5** (§10.5), com
> capturas de tela e linguagem para o professor. Este documento é **insumo interno** para quem for
> escrevê-lo.

## Contexto necessário

**Projeto.** `haroldo-page` — site acadêmico do Prof. Haroldo C. D. Lima Junior (UFMA), Astro 7 +
TinaCMS 3.12.1, painel em `/admin`. O professor é **EDITOR**; edita apenas `content/` e
`public/uploads/`, sempre pelo painel (§7.5).

**Fontes — leia todas antes de escrever, e cite-as no documento:**

1. `plans/fase-1-modelo-de-conteudo/README.md`, seções "O que o 020 descobriu", "O que o 022
   descobriu", "O que o 021 descobriu" e "O que a fase 1 empurra para a fase 2" (a partir da linha
   301). **É a fonte principal.**
2. Evidências dos planos 020, 021 e 022 (`plans/fase-1-modelo-de-conteudo/0{20,21,22}-*.md`).
3. PRD: F-01, F-02, F-04, F-09, F-10, F-11, F-13; RN-01/D-04; RNF-05; R-01; §8.1 fluxo E; §8.2
   ("mensagens ao professor: português claro, sem jargão, sempre com a ação seguinte").

### Os cinco avisos que o documento tem de conter — no mínimo

**1. O painel descarta edição em silêncio ao voltar de um subpainel (dívida 4).** Causa única —
voltar de um subpainel de grupo `object` re-inicializa o formulário a partir do documento
carregado — e **duas manifestações observadas**:

- **plano 020:** gravação silenciosa do valor **antigo** com a tela mostrando o **novo**; campo que
  estava vazio sobrevive, campo que já tinha valor não. `defaultItem: { publicado: false }` conta
  como valor inicial, o que faz do interruptor "Publicado" a vítima mais provável.
- **plano 021:** perda **visível** da edição pendente — os campos voltam ao valor anterior na
  própria tela, o botão `Save` desabilita e o indicador volta a "limpo", **inclusive em campo que
  estava vazio**.

Não desmente o 020: a causa é uma só, mas o caminho até ela decide qual efeito aparece, e esse
caminho **não está mapeado**. **Contorno mais confiável, do plano 022: salvar sem sair do
subpainel** — o gatilho é a volta ao formulário-pai, não o save.

**2. O painel deixa salvar item de lista com subcampo obrigatório vazio (dívida 3).** Instâncias
conhecidas: `aulas[]`, `listas[]`, `materiais[]`, `bibliografia[]`, `scripts[].titulo`,
`scripts[].codigo` e — desde o plano 021, a primeira em lista de **string simples**, não de
objetos — `publicacoes.autores[]`. Causa conferida contra `node_modules/@tinacms/schema-tools`: na
variante de lista, o `ui` é `Template['ui']` e **não declara `validate`**. O Zod rejeita só depois,
no build. **Isto contradiz o F-01 do PRD** ("o Tina bloqueia o salvamento e destaca o campo") para
o caso de lista embutida — diga isso com todas as letras: o manual não pode prometer o que o
painel não faz.

**3. Projeto sem linha de pesquisa grava `linha_relacionada: ''`.** Não omite o campo — grava
string vazia, que é referência inválida. Materializou-se em 2026-09-10 editando **apenas a
`descricao`** de um projeto. Contraste registrado: `codigo` vazio numa disciplina é **omitido**; o
problema é específico do tipo `reference`.

**4. O que acontece quando o professor quebra o build.** F-02: o site continua no ar com a versão
anterior, **nenhuma mensagem chega a ele**, o ADMIN é notificado. Consequência prática que o
manual precisa dizer em linguagem de professor: *"se o que você salvou não aparecer no site depois
de alguns minutos, o conteúdo não se perdeu — avise o responsável técnico"*. Ligue isso a F-11
(conteúdo apagado é recuperável pelo Git) e ao fluxo E da §8.1.

**5. O repositório é público (D-04).** `publicado: false` esconde do **site**, não do **GitHub** —
o arquivo e todo o histórico de edição ficam legíveis por qualquer pessoa. Rascunho não é privado.

### Duas coisas que o documento também tem de dizer, e que não são "aviso"

- **A decisão da fase 2 sobre a dívida 4, explícita:** *não existe verificação automatizável*. É a
  única dívida da fase 1 que passa por **todo** o portão de qualidade — build, testes, lint e CI
  ficam verdes com o conteúdo errado no disco —, porque o conteúdo gravado é **válido**, só não é o
  que o usuário quis. Nenhum teste do repositório pode distinguir "o professor quis isto" de "o
  formulário reverteu". **Entrega correspondente: aviso obrigatório no manual da fase 5 e na
  sessão de treinamento**, nomeada aqui para que a fase 5 não precise redescobri-la.
- **O que muda quando o painel for corrigido pelo TinaCMS.** Cada aviso ganha uma linha "quando
  revisar": versão do `tinacms` em que a instância foi observada (3.12.1) e o que se espera que
  faça o aviso perder o objeto.

### Forma do documento

- **Português (pt-BR)**, datas absolutas (`2026-09-10`), nunca relativas.
- Um aviso por seção, e cada seção com: **o que acontece** · **como reproduzir** · **contorno** ·
  **o que o manual tem de dizer ao professor** (uma frase, em linguagem de professor, no espírito
  da §8.2) · **origem** (plano e arquivo).
- **Não repita a Evidência** dos planos — aponte para ela. O documento é um índice acionável, não
  um arquivo morto.
- Cabeçalho no espírito da §10.1, adaptado a documento Markdown (o §10.1 é normativo para código;
  para documento, um bloco de metadados curto com propósito, origem e data basta — siga o que os
  ADRs de `docs/adr/` fazem).

### O que este plano NÃO faz

- ⛔ **Não conserta nada.** Nenhum aviso vira validação, `superRefine` ou componente React.
- ⛔ **Não escreve o manual do professor** (fase 5) nem cria capturas de tela.
- ⛔ **Não abre o painel.** Todo o material já foi produzido exercitando o `/admin` nos planos 020,
  021 e 022; este plano consolida — e é por isso que ele é executável por agente.
- ⛔ **Não inventa aviso.** Cada afirmação tem de rastrear até um plano ou até o PRD. Se algo
  parecer verdadeiro mas não tiver fonte, **deixe fora e reporte** — inventar risco é tão ruim
  quanto esconder um.

## Passos

1. Ler as três fontes listadas em "Contexto necessário" — o README da fase 1 **inteiro** na parte
   por plano, as Evidências dos planos 020, 021 e 022, e os itens do PRD citados.
   → verify: você consegue enunciar a diferença entre as duas manifestações da dívida 4 sem
   consultar.
2. Escrever `docs/avisos-do-painel-para-o-manual.md` com os cinco avisos, no formato descrito, mais
   as duas seções de decisão/revisão.
   → verify: cada afirmação do documento tem origem citada (plano ou item do PRD); nenhuma frase
   sem fonte.
3. Conferir a rastreabilidade item a item: abra cada fonte citada e confirme que ela diz o que o
   documento afirma que ela diz.
   → verify: liste na Evidência as citações conferidas — é o passo que a lição "revisão reproduz,
   não aceita" existe para forçar. Quatro defeitos já escaparam neste projeto de uma revisão que
   aprovou sem conferir a fonte.
4. Rodar a sequência de qualidade local.
   → verify: `npm run lint`, `npm run format:check` (o Prettier formata Markdown — o arquivo novo
   precisa passar) e `npm run test:coverage` verdes, saídas coladas. `npm run build` também, com a
   saída lida.

## Critérios de aceitação

- [x] `docs/avisos-do-painel-para-o-manual.md` criado, em pt-BR, com datas absolutas
- [x] Os **cinco** avisos presentes, cada um com o que acontece / como reproduzir / contorno / o
      que o manual tem de dizer / origem
- [x] A dívida 4 com as **duas manifestações** distinguidas (020: gravação silenciosa do valor
      antigo; 021: perda visível da edição pendente), e o contorno do 022 nomeado
- [x] A dívida 3 com **todas as instâncias conhecidas**, inclusive `publicacoes.autores[]` como a
      primeira em lista de string simples, e a contradição com **F-01** dita explicitamente
- [x] **Decisão da fase 2 sobre a dívida 4 registrada**: não automatizável, com o motivo, e a
      entrega para a **fase 5** nomeada como tal
- [x] Linha "quando revisar" em cada aviso, com a versão do `tinacms` observada
- [x] Toda afirmação rastreável a um plano ou item do PRD; a conferência das citações registrada
      na Evidência
- [x] Nenhum outro arquivo modificado — `git status --short` mostrando apenas o arquivo novo
- [x] `npm run lint`, `npm run format:check`, `npm run test:coverage` e `npm run build` verdes
- [x] CI do GitHub Actions com `conclusion: success` no commit empurrado

## Evidência

Executado em 2026-09-12. **`Status:` permanece `TODO`** — a promoção é do orquestrador, depois da
revisão de código e do CI. Este executor não fez `git add`, commit nem push.

Primeira rodada de revisão: **REPROVADA por um único ponto** — esta seção `## Evidência` estava
com o placeholder original, sem a tabela de citações conferidas nem as saídas de qualidade
coladas. O revisor conferiu o conteúdo de `docs/avisos-do-painel-para-o-manual.md` linha por linha
contra as fontes citadas e não encontrou nenhum defeito no documento em si — inclusive validou como
correta e necessária a ressalva acrescentada por conta própria no Aviso 4 (a notificação ao ADMIN
de F-02 ainda está pendente no checklist do PRD). A correção desta rodada é só esta seção.

**Ajuste adicional feito nesta rodada**, por sugestão não bloqueante do revisor: a frase do
cabeçalho do documento — "Versão do TinaCMS observada em todos os avisos abaixo: 3.12.1" — foi
reduzida ao que de fato é comportamento do painel. Os Avisos 4 e 5 não são defeito do TinaCMS (são
o pipeline de build e a decisão de arquitetura D-04); a linha "Quando revisar" de cada um já dizia
isso, mas o cabeçalho era amplo demais. Corrigido para: "vale para os Avisos 1 a 3, que são
comportamento do painel. Os Avisos 4 e 5 não são defeito do TinaCMS (...); a linha 'Quando
revisar' de cada um já deixa isso explícito." `npm run format:check` foi reexecutado depois do
ajuste, sobre o estado final dos arquivos (Evidência já preenchida, cabeçalho já ajustado) — ver o
bloco do ciclo 2 na seção de qualidade abaixo, não a execução inicial.

**Ciclo 2 de revisão:** os dois achados do ciclo 1 (Evidência ausente; cabeçalho do documento amplo
demais) foram conferidos como corrigidos pelo revisor e não voltam à lista. A tabela de 14 citações
abaixo passou: o revisor reproduziu uma amostra contra as fontes e bateu. **Achado do ciclo 2, já
corrigido nesta seção:** o bloco de saída de qualidade colado anteriormente aqui era da execução do
ciclo 1 (antes das edições da Evidência e do cabeçalho), não um reteste sobre o estado final dos
arquivos — sinalizado pelo `[build] 1 page(s) built in 740ms` (o reteste deu 708ms) e por
`git status --short` mostrando só o arquivo novo (a árvore atual também tem o próprio plano
modificado). Substituído pelo bloco correto abaixo.

### 1. Citações conferidas contra a fonte, uma a uma

| Afirmação do documento | Fonte (arquivo e seção) | O que a fonte diz |
|---|---|---|
| Aviso 1 — causa (re-inicialização ao sair de subpainel `object`) e manifestação do 020 (valor antigo gravado, tela mostra o novo; `defaultItem` é a vítima mais provável) | Evidência do plano 020, seção "Achado 1 — o formulário do Tina descarta alterações ao voltar de um subpainel" | Confirmado literalmente: reproduzido 2x com A/B; `nome`/`bio` reverteram e `departamento` (vazio) gravou o valor novo |
| Aviso 1 — manifestação do 021 (perda visível, campos voltam na tela, botão `Save` desabilita, indicador volta a "limpo") | Evidência do plano 021, seção 7 ("Achado corrigido no README da fase 1 por esta verificação"); README da fase 1, linhas 180-193 | Confirmado: "perda visível da edição pendente... o botão Save desabilitou e o indicador de estado voltou a 'limpo'" |
| Aviso 1 — contorno "salvar sem sair do subpainel" (022) | Evidência do plano 022, seção "Os seis campos conferidos um a um contra o que a tela mostrava" | Confirmado: "o save foi feito de dentro do subpainel do item, sem voltar ao formulário-pai" |
| Aviso 2 — causa técnica (variante de lista com `ui: Template['ui']`, sem `validate`) | README da fase 1, linhas 126-130; Evidência do plano 022, "Dívida herdada do plano 019, duas instâncias novas" | Confirmado contra a redação dos planos 019/022 |
| Aviso 2 — instâncias, incluindo `publicacoes.autores[]` como primeira em lista de string simples | README da fase 1, linhas 294-299; Evidência do plano 021, linhas 553-556 | Confirmado literalmente, inclusive a distinção "lista de objetos" × "lista de string simples" |
| Aviso 2 — contradição com F-01 | `PRD.md:271`, tabela F-01 ("O Tina bloqueia o salvamento e destaca o campo") | Confirmado — é exatamente o texto contradito pelo caso de lista embutida |
| Aviso 3 — `linha_relacionada: ''` gravado ao editar só a `descricao`, em 2026-09-10 | Evidência do plano 021, seção 6, parágrafo "O que produziu essa saída, com precisão..." | Confirmado literalmente, inclusive a data e o nome do arquivo (`forcas-de-mare-em-espacos-tempos-de-kerr.md`) |
| Aviso 3 — contraste: `codigo` vazio numa disciplina é omitido, não gravado como string vazia | README da fase 1, linha 196; Evidência do plano 020, "Achado 2" | Confirmado |
| **Verificação factual do despacho:** o campo `descricao` do Aviso 3 pertence à coleção `projetos`, não a `linhas_pesquisa` | Evidência do plano 021, seção 6 ("editar só a `descricao` de `content/projetos/forcas-de-mare...`") | Confirmado — é `projetos.descricao`; o documento não cita `descricao` em `linhas_pesquisa` em lugar nenhum |
| Aviso 4 — F-02, RNF-04, Fluxo E (§8.1), F-11 | `PRD.md`, linhas 239, 272, 281, 588-595 | Todos conferidos linha a linha; texto reproduzido fielmente |
| Aviso 4 — ressalva de que a notificação ao ADMIN ainda não foi implementada | `PRD.md:811` — "- [ ] Notificação de falha de build chegando ao ADMIN (F-02)" | Confirmado como item **não marcado** no checklist da fase 2; a ressalva evita prometer o que ainda não existe |
| Aviso 5 — D-04/RN-01 (`publicado: false` esconde do site, não do GitHub) | `PRD.md`, linhas 257, 400 | Confirmado, inclusive a frase "a regra vale para o site — não para o repositório, que é público" |
| Versão do TinaCMS 3.12.1 | Evidência do plano 022, linha 50 ("TinaCMS 3.12.1"); `package.json` | Confirmado nas duas fontes |
| Decisão da fase 2 sobre a dívida 4 (não automatizável) | README da fase 1, item 4 de "O que a fase 1 empurra para a fase 2" | Confirmado: "A fase 2 decide se existe verificação automatizável; se não existir, é aviso obrigatório no manual da fase 5" |

Nenhuma afirmação sem fonte foi incluída no documento. Nenhum aviso além dos cinco do plano foi
inventado.

### 2. Saída literal dos comandos de qualidade — `triage-runner` (reteste do ciclo 2, 2026-09-12,
rodado sobre o estado final dos arquivos: Evidência já preenchida, cabeçalho do documento já
ajustado)

```
git status --short (antes e depois da suíte, idêntico)
 M plans/fase-2-pipeline-de-publicacao/033-avisos-do-painel-para-o-manual-da-fase-5.md
?? docs/avisos-do-painel-para-o-manual.md

npm run lint          -> exit 0
> haroldo-page@0.1.0 lint
> eslint .
(sem saída)

npm run format:check  -> exit 0
> haroldo-page@0.1.0 format:check
> prettier --check .
Checking formatting...
All matched files use Prettier code style!

npm run test:coverage -> exit 0
 RUN  v4.1.11 S:/Projetos/academic_page/haroldo
      Coverage enabled with v8

 Test Files  6 passed (6)
      Tests  122 passed (122)
   Start at  09:58:58
   Duration  950ms (transform 1.52s, setup 0ms, import 2.50s, tests 81ms, environment 0ms)

Statements   : 100% ( 32/32 )
Branches     : 100% ( 4/4 )
Functions    : 100% ( 2/2 )
Lines        : 100% ( 31/31 )

npm run build         -> exit 0
09:59:30 [check] Getting diagnostics for Astro files in S:\Projetos\academic_page\haroldo...
Result (19 files):
- 0 errors
- 0 warnings
- 0 hints

09:59:36 [build] 1 page(s) built in 708ms
09:59:36 [build] Complete!
(cloud check do TinaCloud conectou, sem erro de credencial)
```

**Observação registrada, não é defeito deste plano:** a tabela por-arquivo do relatório de
cobertura do `test:coverage` vem vazia (só cabeçalho e separadores), embora o sumário mostre 100%
em todas as métricas. Já acontecia antes desta execução — é o comportamento conhecido do reporter
`text` do v8 no Windows com `skipFull`, registrado desde os planos 015/016/021 do projeto.

### 3. Revisão de código

**APROVADO no terceiro ciclo.** Reprovado nos dois primeiros, nenhum deles por defeito no documento
entregue — o revisor abriu cada fonte citada e todas as conferências passaram já no primeiro ciclo:

1. **Ciclo 1 — a seção `## Evidência` deste arquivo não tinha sido preenchida.** O passo 3 e o
   último critério de aceitação exigem a conferência das citações registrada aqui; o placeholder
   continuava no lugar. Corrigido. Achado não bloqueante aceito no mesmo ciclo: o cabeçalho do
   documento dizia que a versão 3.12.1 do TinaCMS valia para "todos os avisos", mas os Avisos 4 e 5
   não são comportamento do painel — a frase passou a delimitar os Avisos 1 a 3.
2. **Ciclo 2 — o bloco de saída colado na seção 2 era o do ciclo 1, não o do reteste.** Dois
   indícios: `740ms` em vez de `708ms`, e um `git status --short` com um arquivo só, quando a
   árvore já tinha dois. **O bloco errado veio da mensagem de despacho do orquestrador; não foi
   desvio do executor**, que colou o que lhe foi dado. Corrigido com a saída do reteste real.
3. **Ciclo 3 — APROVADO**, sem ressalva. O revisor concordou explicitamente com não disparar uma
   quarta execução completa da suíte: a única mudança daquele ciclo era texto dentro desta
   Evidência, que nenhum teste importa e que o build do Astro não lê; exigir um run novo geraria um
   número de milissegundos que a própria edição da Evidência tornaria velho no instante seguinte —
   regressão infinita. O `lint` e o `format:check` rodados pelo orquestrador sobre a árvore final
   fecharam o risco residual, que era o Markdown novo formatar certo.

### 4. CI e build de deploy sobre o commit empurrado

Commit do trabalho: **`0c2bd02`**, empurrado em 2026-09-12 (`b01e267..0c2bd02`). Os **dois**
pipelines dispararam no mesmo push e os dois fecharam verdes:

```
gh api repos/researchgroups-ufma/haroldo-page/commits/0c2bd02/check-runs

Workers Builds: haroldo-page :: conclusion=success :: 2026-09-12T13:07:50Z
  https://dash.cloudflare.com/98e35087677f329c2adbf68711ecebbf/workers/services/view/haroldo-page/production/builds/1fb6e0dd-cbc9-44bb-87bf-3c67d50469e5
qualidade                    :: conclusion=success :: 13:06:06Z -> 13:07:23Z
  https://github.com/researchgroups-ufma/haroldo-page/actions/runs/34695465499

gh run view 34695465499
run 34695465499 | completed | success | 0c2bd02 | plano 033: avisos do painel para o manual...
```

**A segunda linha não é formalidade.** Durante a fase 1 inteira o CI esteve vermelho por 14 commits
seguidos porque a verificação era só de comandos locais e ninguém olhava para o run.
