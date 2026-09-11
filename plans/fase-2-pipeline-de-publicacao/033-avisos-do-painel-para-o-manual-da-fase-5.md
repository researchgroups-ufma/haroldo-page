# Plano 033 — Avisos do painel que o manual da fase 5 é obrigado a cobrir

**Status:** TODO
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

- [ ] `docs/avisos-do-painel-para-o-manual.md` criado, em pt-BR, com datas absolutas
- [ ] Os **cinco** avisos presentes, cada um com o que acontece / como reproduzir / contorno / o
      que o manual tem de dizer / origem
- [ ] A dívida 4 com as **duas manifestações** distinguidas (020: gravação silenciosa do valor
      antigo; 021: perda visível da edição pendente), e o contorno do 022 nomeado
- [ ] A dívida 3 com **todas as instâncias conhecidas**, inclusive `publicacoes.autores[]` como a
      primeira em lista de string simples, e a contradição com **F-01** dita explicitamente
- [ ] **Decisão da fase 2 sobre a dívida 4 registrada**: não automatizável, com o motivo, e a
      entrega para a **fase 5** nomeada como tal
- [ ] Linha "quando revisar" em cada aviso, com a versão do `tinacms` observada
- [ ] Toda afirmação rastreável a um plano ou item do PRD; a conferência das citações registrada
      na Evidência
- [ ] Nenhum outro arquivo modificado — `git status --short` mostrando apenas o arquivo novo
- [ ] `npm run lint`, `npm run format:check`, `npm run test:coverage` e `npm run build` verdes
- [ ] CI do GitHub Actions com `conclusion: success` no commit empurrado

## Evidência

<Preenchida pelo executor, com a lista das citações conferidas contra a fonte — não basta dizer
que foram conferidas.>
