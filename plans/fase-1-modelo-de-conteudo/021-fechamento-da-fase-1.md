# Plano 021 — ADRs das decisões da fase 1, verificação do `/admin` e fechamento da fase

**Status:** TODO
**RFs cobertos:** fase 1, itens "`/admin` funciona localmente e edita todas as coleções" e
"testes unitários da fase escritos e passando"; §7.2 ("cada decisão vira um ADR"); §12
**Depende de:** planos 015 a 020 **e 022** — a fila da fase mudou em 2026-09-04 e o 022 (lista
`scripts[]`) entrou antes deste; este continua sendo o último
**Modelo recomendado:** sonnet
**Agente recomendado:** implementer
**PRD:** `S:\Projetos\academic_page\haroldo\PRD.md`
**Projeto:** `S:\Projetos\academic_page\haroldo`

## Objetivo

A fase 1 fecha: o critério de conclusão do §6.2 é demonstrado na prática, as decisões
implementadas viram ADRs, o checklist §12 vai a **10/10** e o CHANGELOG registra a fase.

> **Atenção ao número.** Este plano foi escrito quando a fase tinha **9** itens na §12. A sabatina
> de 2026-09-04 acrescentou o décimo (lista `scripts[]`, RF-37, fechado pelo plano 022). Onde
> este arquivo dizia `9/9`, leia **`10/10`**; confira o checklist real da §12 antes de contar.

## Arquivos afetados

- `docs/adr/0003-*.md` a `docs/adr/0007-*.md` — criar (ver seção 1)
- `src/content.config.ts` — **uma frase só**, a correção da docstring da seção 5.1
- `docs/CHANGELOG.md` — seção da fase 1
- `PRD.md` — checklist §12 da fase 1, tabela de progresso, linha de versão em §0.1
- `plans/fase-1-modelo-de-conteudo/README.md` — **já existe** (criado durante a fase, no molde
  do README da fase 0). Atualizar para o estado final, não recriar
- `plans/README.md` — atualizar o estado da fase 1 no índice
- `README.md` — seção do painel, se o fluxo tiver mudado desde o plano 015

## Contexto necessário

**Projeto.** `haroldo-page` — site acadêmico do Prof. Haroldo C. D. Lima Junior (UFMA).

### 1. Os ADRs que a fase 1 deve

A §7.2 determina: *"Cada decisão acima deve virar um ADR curto em `docs/adr/` na fase em que for
implementada."* A fase 0 escreveu o ADR-0001 (D-01) e o ADR-0002 (overrides, hoje revertido).
A fase 1 **implementa cinco decisões** e deve um ADR para cada:

| ADR | Decisão | O que registrar |
|---|---|---|
| 0003 | **D-02** — painel por formulários, sem visual editing | O visual editing exigiria `output: 'server'`, adapter e ilhas Tina por página, contra D-01. Custo aceito: não se clica no texto para editar |
| 0004 | **D-03** — i18n por grupo `en` no mesmo arquivo | Alternativa rejeitada: pastas `pt/`/`en/` espelhadas. Motivo: editor único, sem par órfão, um formulário só. **Registre também o que o plano 018 fechou:** `publicacoes` traduz só `resumo` (RN-07 — título de artigo é dado factual); `projetos` traduz `titulo` e `descricao`; `perfil.formacao[]` traduz `grau` e `curso`, que juntos formam o "título" que a §7.3 cita sem nomear campo; todo grupo é `.strict()` para rejeitar campo factual em vez de descartá-lo em silêncio; e as listas `en` são alinhadas por índice, com o realinhamento adiado para a fase 4 |
| 0005 | **D-04** — rascunho como campo `publicado` | Editorial Workflow é pago. **Registre a consequência de 2026-09-01:** com o repositório público, `publicado: false` esconde do site, não do GitHub |
| 0006 | **D-05** — aulas, listas, materiais, bibliografia e **scripts** embutidos | São **cinco** listas embutidas, não três: a D-05 foi corrigida na v0.1.16 do PRD (`bibliografia[]` já ficava de fora da enumeração antes) e `scripts[]` entrou em 2026-09-04 pela sabatina de scripts Python (RF-37, plano 022). Consequência aceita: aula não tem página própria; se um dia precisar, migra para coleção separada |
| 0007 | **D-07** — campo de material como URL livre | Decisão do stakeholder; o Drive vira recomendação do manual, não dependência de arquitetura |

A **D-06** (Zod × Tina com teste de paridade) também é implementada na fase 1 — decida se ela
merece ADR próprio ou se o plano 019 já é registro suficiente, e **justifique a escolha**.

Formato, seguindo o ADR-0001: Título · Status · Data absoluta · Contexto · Decisão ·
Alternativas consideradas · Consequências · Referências. Curtos, em português, uma página.

### 2. O critério de conclusão da fase, que é o item mais importante

O §6.2 define para a fase 1:

> **O professor consegue, localmente, criar e editar item de cada coleção pelo painel.**

Isso não se demonstra rodando teste. Demonstra-se **usando o painel**: subir `/admin`, criar um
item novo em cada uma das cinco coleções e editar um existente em cada, conferindo que o arquivo
no disco mudou. Cole na Evidência o que foi criado e o `git status` correspondente.

⚠️ **Não marque este item do checklist sem ter feito isso.** É o critério de aceitação da fase
inteira; um "os testes passam" não substitui.

⚠️ **A parte "editar um existente" é exatamente onde o painel engana** (descoberto no plano 020,
depois que este arquivo foi escrito). O formulário do Tina **descarta em silêncio alteração em
campo que já tinha valor**: ao voltar de um subpainel de grupo `object` — o "Versão em inglês", o
"Período de execução", qualquer item de lista embutida — ele re-inicializa a partir do documento
carregado, a tela mostra o valor novo e o arquivo grava o antigo. Campo que estava vazio
sobrevive. `defaultItem: { publicado: false }` conta como valor inicial, então o interruptor
"Publicado" é a vítima mais provável.

Consequência para este plano: **a edição não se dá por feita porque a tela mudou.** Conferir o
arquivo gravado depois de cada save, e alterar campo que já tinha valor **por último**, depois de
sair de todo subpainel. Uma demonstração do critério da fase que não conferiu o disco não
demonstrou nada — e este é o item que declara a fase 1 concluída.

### 3. Testes da fase

O checklist pede "testes unitários da fase escritos e passando". Some o que os planos 016, 018
e 019 produziram e confira contra a §11: a meta é **≥ 80% dos módulos de `src/lib/` e
`src/i18n/`**.

**Atualização — esta pendência já foi resolvida antes deste plano.** O `vitest.config.ts` **tem**
`thresholds` em 80% (statements, branches, functions, lines) e cobre `src/lib/**`, `src/i18n/**` e
`src/content.config.ts`; o CI roda `npm run test:coverage`, então cobertura abaixo da meta
**reprova**. Não há decisão a tomar aqui — só confirmar o estado e registrar o número final de
testes da fase.

**Números de referência, não para copiar:** 81 testes depois do plano 018; **93 testes, cobertura
100%**, depois do 020 (medido em 2026-09-04). O plano 022 acrescenta os casos de `scripts[]`, então
o número final é maior — **rode a suíte e conte**, não repita nenhum destes.

Detalhe conhecido e **cosmético**, já registrado nos planos 016 e no README da fase 0: o reporter
`text` do v8 no Windows imprime a tabela por arquivo **vazia**, com só o sumário agregado. Não é
regressão nem defeito de configuração — a cobertura por arquivo se lê no relatório HTML. Não
gaste ciclo investigando isso.

### 4. Checklist §12 e nota de progresso

Os **10** itens da fase 1, cada um com o plano que o fecha: `src/content.config.ts` (016) ·
`tina/config.ts` (015+017) · campo `publicado` (016+017) · grupo `en` (018) · templates de nome
(017) · teste de paridade (019) · conteúdo placeholder (020) · **lista `scripts[]` (022)** ·
`/admin` editando tudo (021) · testes da fase (016+018+019+022).

**Só marque `[x]` o item cujo plano estiver com Evidência preenchida.** A tabela "📊 Progresso
Geral" precisa chegar a `10/10 🟢` e o número tem de bater com as caixas.

**Estado ao entrar neste plano:** a §12 da fase 1 está em **8/10** — os sete marcados até o 020
(`7/10` em 2026-09-04) mais o item de `scripts[]`, que o plano 022 fecha imediatamente antes
deste. Restam exatamente **dois**, e os dois são deste plano: `/admin` editando tudo e os testes
da fase. **Confira o estado real na §12 antes de contar; não parta de zero nem remarque o que já
está marcado.**

Acrescente a linha de versão em §0.1 — **confira qual é a próxima**, porque a numeração já
passou por v0.1.10 (fechamento do plano 018) e o plano 013 tropeçou exatamente nisso ao supor
uma versão que já existia.

### 5. Dívidas a levar adiante

**As cinco dívidas que a fase 0 deixou foram todas resolvidas em 2026-09-01** — subdomínio
provisório em `.env.example` e no comentário do `wrangler.toml`, campo `Versão do PRD`, cobertura
sem `thresholds`, e a varredura de `process.env` que ignorava `.astro`. **A fase 1 começou com a
lista limpa; o trabalho aqui é conferir que ela continua limpa, não recorrigir o que já foi.**

O que a fase 1 acrescenta à lista, e precisa ir para o README da fase 1 como herança explícita:

- **`defaultItem` de coleção está `@deprecated`** em `@tinacms/schema-tools`, em favor de
  `ui.defaultItem`. Usado deliberadamente nas quatro coleções de listagem. Um upgrade do Tina pode
  removê-lo — o sintoma de volta seria o item novo nascer com "Required" no interruptor.
  **Correção de redação, herdada do 017 e desmentida pelo 019:** o `ui.defaultItem` **é** tipado
  quando aplicado ao *campo* — a revisão do 019 conferiu em
  `node_modules/@tinacms/schema-tools/dist/types/index.d.ts:331-348` que o `ui` de um `ObjectField`
  com `fields:` é `Template['ui']`, que declara `itemProps`/`defaultItem`/`previewSrc`. O que não é
  tipado é o `defaultItem` no nível da *coleção*. O plano 022 usa a forma tipada. A redação do
  README da fase 1 recebeu essa precisão em 2026-09-04; confira que ela sobreviveu à atualização
  final do arquivo.
- **Listas `en.formacao[]` e `en.areas[]` alinhadas por índice**, sem mecanismo de realinhamento.
  Reordenar a lista em português desalinha a tradução. Assunto da fase 4.
- **Subcampo obrigatório de lista embutida não bloqueia o save** — o 019 decidiu **aceitar e
  registrar**, com a justificativa conferida contra `@tinacms/schema-tools`: na variante
  `{type:'object', fields:[...]}` o `ui` não declara `validate`. Vira dívida da fase 2 (mensagem de
  erro de build legível, F-09/RNF-09/R-01) e da fase 5 (manual do professor). O plano 022
  acrescenta **duas instâncias novas** (`scripts[].titulo` e `scripts[].codigo`) — some-as.
- **O painel descarta em silêncio alteração em campo que já tinha valor** (plano 020, reproduzido
  com A/B de uma variável duas vezes). É a dívida mais grave que a fase 1 cria, porque **não
  quebra o build** — grava conteúdo errado que passa em tudo. Alcance: qualquer edição de item
  existente pelo `/admin`, que é o modo normal de uso do professor. Vai para o manual da fase 5
  e, se houver como detectar, para a fase 2. Descreva o gatilho (voltar de subpainel de grupo
  `object`) e o contorno (alterar esses campos por último e conferir o arquivo).
- **`astro check` reporta `[ERROR] [content]` e encerra com exit 0** (plano 020). Quem fechar
  plano que crie conteúdo tem de **ler** a saída. Candidato a verificação de CI na fase 2.
- ~~**Q-07**, se o plano 020 não tiver conseguido o e-mail institucional real~~ — **sem objeto**:
  resolvida em 2026-09-03 (`0978b3f`), muito antes do 020. Não a reabra.

### 5.1 Duas divergências de documentação que este plano corrige

Não mudam comportamento, mas fazem os arquivos mentirem para quem chegar depois — e a regra da
casa é que doc e código divergindo se **reporta e corrige**, não se esconde:

1. **`src/content.config.ts:239-241`** — a docstring de `normalizeLinhaRelacionadaId` chama a
   referência inválida de "falha silenciosa que só apareceria na fase 3". O plano 020 provou que o
   `astro check` a reporta em voz alta hoje; o silencioso é o **exit code**, não o erro. Corrija a
   frase, mantendo o resto da docstring. O plano 022 foi instruído a **não** encostar nela para
   que a correção fosse deste plano — é uma linha, não um refactor.
2. **`plans/fase-1-modelo-de-conteudo/README.md`** — a redação herdada do 017 sobre `ui.defaultItem`
   não ser tipada, desmentida pela revisão do 019 no nível do campo. **Já corrigida em
   2026-09-04**; aqui é só conferir que a distinção coleção × campo continua no arquivo depois de
   ele ser atualizado para o estado final.

### 6. Questões abertas — registre o estado ao fechar a fase

O §16 do PRD lista o que bloqueia cada fase adiante. Confira e registre o estado real de cada
uma no fechamento, porque é o que a fase seguinte vai ler:

- ~~**Q-06** (qual e-mail do professor será o EDITOR no TinaCloud)~~ — **resolvida em
  2026-09-03**: `haroldo.lima@ufma.br`. Era o gargalo do próximo passo; a fase 2 não tem mais
  bloqueio de stakeholder e depende só de a fase 1 fechar. Registre assim, e **não** repita que
  ela bloqueia.
- ~~**Q-07** (o e-mail exibido publicamente é institucional)~~ — **resolvida em 2026-09-03**,
  pelo mesmo e-mail. O `PLACEHOLDER@ufma.br` já saiu de `content/perfil/index.md` (`0978b3f`), e
  o plano 020 não encosta mais nela.
- **Q-04** (referências visuais) — bloqueia a fase 3, que o PRD marca como a mais sensível a
  retrabalho justamente por isso. **É a única questão que bloqueia uma fase próxima**; a Q-05
  (domínio próprio) só morde na fase 5.
- **Q-09** (notícias e CV na v1.1) — pós-entrega, não bloqueia nada desta fase.

### 7. A fase 2 não é fatiada aqui

**Decisão do stakeholder em 2026-09-03:** a fase 2 só será planejada **depois** de a fase 1
fechar integralmente, para que o fatiamento já incorpore os problemas que se descobriu que só
podem ser resolvidos nela. Este plano **não** escreve planos da fase 2 e **não** cria arquivos em
`plans/fase-2-pipeline-de-publicacao/`.

O que ele deve fazer é **deixar a lista pronta** para esse fatiamento: uma seção no README da
fase 1 enumerando o que a fase 1 descobriu e empurrou para a fase 2. Os itens 1 a 3 já se sabiam
quando este plano foi escrito; os itens 4 a 7 vieram dos planos 019, 020 e 022 e **já estão
identificados** — confira se algum outro apareceu, mas não recomece a lista:

1. **Acoplamento com o TinaCloud no build.** `tinacms build` compara o schema local com o que o
   TinaCloud indexou em `main` e reprova com `ERR_CLOUD_CHECK_FAILED` enquanto o commit não sobe.
   Isso funciona no fluxo local (revisão → commit → push → build), mas **a fase 2 precisa
   verificar o que acontece no build de produção do Workers**, onde não há humano para ordenar os
   passos.
2. **`tina/tina-lock.json` versionado e regenerado só por `tinacms dev`.** Quem mudar schema tem
   de rodar o dev server e commitar o lock. É um passo manual fácil de esquecer — a fase 2 deve
   decidir se vira verificação de CI.
3. **Mensagem de erro de build legível pelo professor (F-09, R-01).** O risco R-01 já se
   materializou em miniatura na fase 1: o painel aceita salvar lista embutida com subcampo
   obrigatório vazio, e o Zod rejeita depois. A fase 2 é quem monta a notificação de falha de
   build. Instâncias conhecidas: `aulas[]`, `listas[]`, `materiais[]`, `bibliografia[]` e — a
   partir do 022 — `scripts[].titulo` e `scripts[].codigo`.
4. **O painel grava conteúdo errado sem quebrar nada** (plano 020): alteração em campo que já
   tinha valor é descartada em silêncio ao voltar de subpainel de grupo `object`. É a única
   dívida da fase 1 que **passa por todo o portão de qualidade** — build, testes, lint e CI ficam
   verdes com o conteúdo errado no disco. A fase 2 decide se existe verificação automatizável;
   se não existir, é aviso obrigatório no manual da fase 5.
5. **`astro check` reporta `[ERROR] [content]` e sai com exit 0** (plano 020). O `npm run build`
   do CI **não reprova** por referência inválida de conteúdo. Candidato direto a passo de CI da
   fase 2 — hoje a garantia é um humano ler a saída.
6. **`npm audit` com 8 vulnerabilidades moderadas** de `react-router`, via
   `tinacms → react-router-dom` (GHSA-wrjc-x8rr-h8h6). Sem correção nossa; o site público não
   carrega React (D-01, medido no 015), então o alcance é o `/admin`. A fase 2 decide se o CI
   passa a rodar `npm audit` e em que severidade reprova.
7. **Três buracos do teste de paridade**, encontrados pela revisão do 019 e ainda abertos: o
   `path` da coleção no Tina nunca é comparado contra a pasta que o `glob()` do Zod lê; a
   detecção de enum do lado Tina vem depois do ramo `campo.list`, então um campo com `list: true`
   **e** `options` teria os valores não comparados (não existe campo assim hoje, e o 022 foi
   instruído a não criar um); e a prova de falsificabilidade foi produzida contra 11 testes, não
   contra o artefato final. Nenhum é defeito ativo — são o próximo lugar onde a D-06 vaza.

**Ambiente.** Windows 11 / PowerShell. Node 24.16.0.

## Passos

1. Conferir a Evidência dos planos 015 a 020.
   → verify: liste quais têm Evidência preenchida e quais não.
2. Escrever os ADRs 0003 a 0007; decidir e justificar o caso da D-06.
   → verify: cada ADR cita a alternativa rejeitada e a consequência aceita.
3. **Demonstrar o critério de conclusão da fase** criando e editando um item em cada uma das
   cinco coleções pelo `/admin`.
   → verify: `git status --short` e a descrição do que foi feito em cada coleção.
4. Somar os testes da fase e decidir sobre `thresholds` de cobertura.
   → verify: número de testes antes e depois da fase; decisão registrada.
5. Atualizar o checklist §12, a tabela de progresso, §0.1 e o CHANGELOG.
   → verify: contagem de `- [x]` na Fase 1 igual ao número da tabela.
6. Criar o `README.md` da fase 1 e atualizar o índice `plans/README.md`.
   → verify: o índice reflete a fase 1 como concluída.
7. Rodar a sequência de qualidade, commitar, empurrar e confirmar CI verde.
   → verify: os quatro verdes, `git show --stat HEAD` e o resultado do CI.

## Critérios de aceitação

- [ ] ADRs 0003 a 0007 escritos, curtos, em português, com data absoluta
- [ ] Caso da D-06 decidido e justificado
- [ ] **Critério de conclusão da fase demonstrado**: item criado **e** editado em cada uma das
      cinco coleções pelo `/admin`, com prova no `git status` **e o arquivo gravado conferido em
      cada save** — a tela não é prova (armadilha do descarte silencioso, seção 2)
- [ ] Testes da fase somados e conferidos contra a meta da §11; decisão sobre `thresholds`
      registrada
- [ ] §12: os **10** itens da fase 1 marcados e a tabela em `10/10 🟢`, com as caixas batendo
- [ ] Linha de versão acrescentada em §0.1, **com o número correto** — confira o histórico
- [ ] **Cabeçalho §0 do PRD atualizado**: `Status`, `Estado da implementação` e
      `Última atualização`. O `Status` só aceita o vocabulário fechado do `PRD_TEMPLATE.md`
      (`🟡 Rascunho · 🔵 Em revisão · 🟢 Aprovado · ⚫ Arquivado`); o progresso da fase vai na
      linha `Estado da implementação`
- [ ] `docs/CHANGELOG.md` com a fase 1; nenhuma tag criada
- [ ] `README.md` da fase 1 **atualizado** para o estado final (ele já existe); índice
      `plans/README.md` atualizado
- [ ] Dívidas revisadas: as cinco da fase 0 continuam resolvidas, e as novas da fase 1
      registradas no README da fase
- [ ] Estado das questões abertas registrado — Q-06 e Q-07 **resolvidas em 2026-09-03**
      (`haroldo.lima@ufma.br` para as duas); Q-04 nomeada como a única que bloqueia uma fase
      próxima (a 3)
- [ ] Seção "o que a fase 1 empurra para a fase 2" escrita no README da fase, com no mínimo os
      **sete** itens já conhecidos (seção 7)
- [ ] **Divergências de documentação da seção 5.1 corrigidas**: a frase da docstring de
      `src/content.config.ts:239-241` e a redação sobre `ui.defaultItem` no README da fase 1
- [ ] Evidência do plano 022 conferida junto das dos planos 015–020, incluindo a verificação de
      painel do R-13 (frontmatter literal gravado)
- [ ] **Nenhum arquivo criado em `plans/fase-2-pipeline-de-publicacao/`** — o fatiamento da fase 2
      é decisão posterior ao fechamento desta
- [ ] `npm run lint`, `npm run format:check`, `npm run test` e `npm run build` verdes
- [ ] CI verde após o push
- [ ] Nenhum item do checklist marcado sem Evidência no plano de origem

## Evidência

<Preenchido pelo executor: lista dos planos 015–020 com Evidência conferida, descrição da
demonstração do critério de conclusão coleção por coleção, contagem de testes, saída dos quatro
comandos, `git show --stat HEAD` e resultado do CI.>
