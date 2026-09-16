# PRD — Site Pessoal Acadêmico de Professor de Física

> **Product Requirements Document**
> Baseado em `PRD_TEMPLATE.md` e no `briefing.md` deste diretório.
> Seções não aplicáveis estão marcadas `N/A` com justificativa — nunca removidas.

---

## 0. Metadados do Documento

| Campo | Valor |
|---|---|
| **Nome do projeto** | Site Pessoal Acadêmico — Prof. Haroldo C. D. Lima Junior (UFMA) |
| **Codinome / sigla** | `haroldo-page` |
| **Versão do PRD** | v0.1.36 |
| **Status** | 🟢 Aprovado |
| **Estado da implementação** | Fase 0 🟢 **concluída** (14 planos) · Fase 1 🟢 **concluída** em 2026-09-10 — os oito planos (015–022) DONE, o 021 promovido em `7d5b7e6` com CI verde sobre `26de58a` · Fase 2 🟢 **concluída** em 2026-09-12 — fatiada em 12 planos (023–034) em 2026-09-10; 023, 024, 025 e **026** DONE — desde `ab0d1f8` (2026-09-11) um push na `main` publica sozinho no Worker, sem intervencao, e desde o commit `7ab84da` (2026-09-11) está provado que **o painel em produção é quem origina esse push**: login do ADMIN pelo TinaCloud, edição salva no `/admin`, build automático e versão nova publicada; o checklist da fase vai a **3/5**; o **030** e o **031** também estão DONE e **não** fecham item do §12 (como o 023) — o que eles entregam são os dois portões que faltavam: arquivo inválido em `content/` e `tina/tina-lock.json` defasado passam a reprovar no CI **e no build de deploy**, suíte em 122 testes. Em **2026-09-12** o escopo foi recortado por decisão do stakeholder (sabatina `recorte-sem-professor`): **tudo que exige uma sessão com o professor passa para a fase 5** — os planos **027** e **029** e os três itens de §12 correspondentes —, e o critério de conclusão da fase 2 no §6.2 passa a ser o ciclo do **ADMIN**, já demonstrado pelo 026. O **033** fechou em **2026-09-12** (`0c2bd02`), consolidando em `docs/avisos-do-painel-para-o-manual.md` o que o painel deixa o professor fazer de errado — sem fechar item do §12, como o 023, o 030 e o 031. O **032** fechou em **2026-09-12** (`b992282`): o CI passa a auditar dependências, reprovando em `high`/`critical` e relatando `moderate`, com o portão **nascendo verde** — o `wrangler` subiu de `4.128.0` para `4.131.1` e as três `high` deixaram de existir. O **028** fechou em **2026-09-12** (`5528ad6`), levando o checklist da fase a **4/5**: como a Cloudflare não notifica falha do Workers Builds, um vigia agendado no GitHub Actions lê o resultado do build de deploy e reprova quando ele falha, gerando e-mail ao ADMIN (ADR-0011). O experimento com a `main` quebrada de propósito provou build falho nomeando arquivo e campo, site no ar na versão anterior e e-mail em menos de 1 min, com uma pendência nomeada: o caminho agendado ainda não foi observado rodando. O **034** fechou a fase em **5/5** (🟢 concluída): `README.md` ganhou a seção "Pipeline de publicação" (as cinco perguntas, com números medidos dos planos 025/026/028) e a seção "Deploy" foi reescrita — automático como caminho normal, `npm run deploy` como emergência. Execução completa; promovido a DONE em `ef7f258`, com CI e Workers Builds verdes. A revisão de integração do fechamento da fase reprovou com dois bloqueantes, corrigidos pelo **035** (`f7c31d3`): o `npm run deploy` de emergência passa a rodar o portão de conteúdo, e o vigia passa a reprovar build travado há mais de 60 min · Fase 3 🟡 **em andamento** — desbloqueada em 2026-09-14 (Q-04 respondida, visual em `docs/identidade-visual.md`), fatiada em 18 planos (036–053); **036 DONE** em 2026-09-16 (`fb117b6`, tokens, escala tipográfica e Archivo auto-hospedada) e **037 DONE** em 2026-09-16 (`23d1aa0`, dicionário de interface `src/i18n/pt.ts` e navegação), sem fechar item do §12 (pré-requisitos, como o 023) · Fases 4–5 ⬜ não iniciadas. Detalhe por item em §12; execução em `plans/README.md` |
| **Autor(es)** | Desenvolvedor (`and.near@hotmail.com`) |
| **Revisores / aprovadores** | Desenvolvedor (dono do produto); Professor (usuário-chave, valida a fase 5) |
| **Data de criação** | 2026-09-01 |
| **Última atualização** | 2026-09-16 |
| **Repositório** | <https://github.com/researchgroups-ufma/haroldo-page> — **público**, na organização `researchgroups-ufma`. Criado privado no plano 010; tornado público em 2026-09-01 por necessidade do projeto |
| **Documentos relacionados** | `briefing.md` (este diretório); `../docs/plano-i18n.md` (padrão de i18n do LaFiM, reaproveitado); projeto irmão `../grav` |

### 0.1 Histórico de Versões (Changelog)

| Versão | Data | Autor | Mudanças |
|---|---|---|---|
| v0.1 | 2026-09-01 | Desenvolvedor | Versão inicial, derivada do briefing + sessão de brainstorming (decisões D-01 a D-06 da §7.2) |
| v0.1.1 | 2026-09-01 | Desenvolvedor | Q-03 resolvida (cota do Workers Builds); A-03 confirmada; R-06 rebaixado; R-12 acrescentado |
| v0.1.2 | 2026-09-01 | Desenvolvedor | Q-01 resolvida via `lattes.pdf` (Apêndice C); Q-08 dissolvida pela decisão D-07 (link agnóstico ao hospedeiro); NG-02, RN-05, A-04, R-08 e §7.4 ajustados |
| v0.1.3 | 2026-09-01 | Desenvolvedor | §12 atualizada com o progresso real da fase 0 (planos 001–004 DONE); mapa de execução dos planos em `plans/README.md` |
| v0.1.4 | 2026-09-01 | Desenvolvedor | **Fase 0 concluída:** checklist §12 fechado (10/10) com TinaCloud (plano 011) e Cloudflare (plano 012); ADR-0001 e ADR-0002 registrados; URL real do Worker reconciliada no código; §16 corrigida (Q-07 bloqueia a fase 3, não a 5) |
| v0.1.5 | 2026-09-01 | Desenvolvedor | Repositório passa de **privado a público**, por necessidade do projeto: §0, §7.4 e §12 atualizadas. Consequência registrada em D-04 e RN-01 — `publicado: false` esconde do site, não do GitHub |
| v0.1.6 | 2026-09-01 | Desenvolvedor | **Q-02 resolvida:** painel do TinaCMS em inglês é aceitável; A-08 confirmada e o TinaCMS fica. Decap deixa de ser gatilho de decisão e segue só como plano B de R-03. Nada mais bloqueia a fase 1 |
| v0.1.7 | 2026-09-01 | Desenvolvedor | Campo **Versão do PRD** em §0 corrigido — dizia `v0.1` desde a v0.1.1, divergindo do próprio histórico. A meta de cobertura da §11 passou de relatada a **imposta** (`thresholds` no Vitest, rodando no CI) |
| v0.1.8 | 2026-09-01 | Desenvolvedor | **Status** passa de `🟡 Rascunho` a `🟢 Aprovado` — o documento guia a implementação desde a fase 0. Acrescentada a linha **Estado da implementação** em §0, para que o topo do PRD responda "onde estamos" sem precisar descer até a §12 |
| v0.1.9 | 2026-09-03 | Desenvolvedor | **Fase 1 em andamento:** planos 015 (TinaCMS e `/admin` local), 016 (schemas Zod) e 017 (as cinco coleções no `tina/config.ts`) DONE. §12 passa de 0/9 a 4/9 — o item do `src/content.config.ts` estava por marcar desde o fechamento do 016. O 017 fechou a decisão que o 016 deixou aberta (`corpo`/`ementa`/`resumo` seguem em frontmatter, por incompatibilidade do `rich-text` do Tina com `z.string()`) e registrou duas divergências de paridade Zod × Tina como insumo do plano 019 |
| v0.1.10 | 2026-09-03 | Desenvolvedor | **Plano 018 DONE:** grupo "Versão em inglês (opcional)" nas cinco coleções traduzíveis (RN-06), em paridade entre `src/content.config.ts` e `tina/config.ts` (`6e5cb1f`). §12 passa de 4/9 a 5/9. `publicacoes` traduz só `resumo` (RN-07); duas decisões que o PRD não fechava ficaram registradas: `projetos` traduz `titulo`/`descricao`, `perfil.formacao[]` traduz `grau`/`curso` |
| v0.1.11 | 2026-09-03 | Desenvolvedor | **Q-07 resolvida:** o e-mail exibido publicamente é o institucional `haroldo.lima@ufma.br`, informado pelo stakeholder. O `PLACEHOLDER@ufma.br` de `content/perfil/index.md` foi substituído e o marcador em comentário YAML — risco operacional ativo desde o plano 017, apagável por qualquer save do formulário "Perfil" — deixou de existir. **A-06 confirmada**; a fase 3 não herda mais essa questão |
| v0.1.12 | 2026-09-03 | Desenvolvedor | **Plano 019 DONE:** teste de paridade Zod × Tina (D-06) escrito, passando e rodando no CI (`6a42330`), o que fecha a mitigação prevista para o risco R-02. §12 passa de 5/9 a 6/9. Corrigiu a divergência real de formato de valor em `projetos.linha_relacionada`, do lado do Zod. Registrou como consequência conhecida, para a fase 2 e para o manual da fase 5, que o painel não bloqueia o save de item de lista embutida com subcampo obrigatório vazio — o Zod rejeita, e o professor levaria um build quebrado sem saber diagnosticar (F-09, RNF-09, R-01) |
| v0.1.13 | 2026-09-03 | Desenvolvedor | **Q-06 resolvida:** o professor usará `haroldo.lima@ufma.br` — o mesmo institucional da Q-07 — como conta EDITOR no TinaCloud. Era o único bloqueio de stakeholder da fase 2, que agora depende só de a fase 1 fechar. Com isso restam duas questões abertas no §16: Q-04 (fase 3) e Q-05 (fase 5) |
| v0.1.14 | 2026-09-04 | Desenvolvedor | **CI estava vermelho havia 14 commits e ninguém tinha visto.** De `1d35c11` (plano 015) a `d832663`, todo commit falhava em `npm run build`: o `tinacms build` aborta sem `TINA_CLIENT_ID`/`TINA_TOKEN`, e o workflow não os tinha. A fase 1 inteira foi executada e fechada com o portão de qualidade satisfeito só localmente. Resolvido em `82fb4de` com secrets no GitHub — metade do item de ambiente da fase 2, antecipada. As actions `checkout`/`setup-node` também subiram de v4 (Node 20, aposentado) para v7 em `d832663`. A verificação autoritativa da fase 1 passa a incluir o `conclusion` do run do commit empurrado |
| v0.1.15 | 2026-09-04 | Desenvolvedor | **Sabatina "Scripts Python nas disciplinas"** (`docs/sabatinas/CHANGELOG_sabatina_scripts-python.md`, 11 decisões): `disciplinas` ganha a lista embutida `scripts[]` — código-fonte colado no próprio conteúdo, para ser exibido na página com destaque de sintaxe e botão de copiar. **RF-37** (MUST) e **F-13** criados; §7.3 ganha a linha `scripts[]`; **RN-05 emendada** com exceção nomeada para código-fonte (NG-02 e D-07 permanecem inalteradas, por decisão explícita da sabatina). O **schema** é da fase 1, em plano próprio — o **022**, executado antes do 021 —, e a **renderização** é da fase 3: a §12 ganha um item em cada uma dessas fases. A tabela de progresso da §12 ainda dizia `5/9` na fase 1 desde a v0.1.12, divergindo do próprio checklist (6 itens marcados); corrigida junto, para `6/10` |
| v0.1.16 | 2026-09-04 | Desenvolvedor | Duas pendências que a v0.1.15 deixou em aberto de propósito, fechadas: **D-05** passa a enumerar as cinco listas embutidas da disciplina (dizia três, e `bibliografia[]` já ficava de fora antes do `scripts[]`), e o risco técnico da sabatina vira **R-13** — código indentado que perde a indentação ao ser serializado em YAML pelo painel, com a verificação no painel como mitigação obrigatória e o retorno ao link externo como contingência |
| v0.1.17 | 2026-09-04 | Desenvolvedor | **Plano 020 DONE** (`aa9a7cf`): conteúdo placeholder representativo nas cinco coleções — 13 arquivos criados **pelo painel**, com os nomes saindo dos templates da RN-08. §12 passa de 6/10 a 7/10 na fase 1. O perfil usa os dados reais do Apêndice C; as 6 publicações são inventadas e marcadas de forma redundante (`[EXEMPLO]` no título, `[CONTEÚDO DE EXEMPLO]` no texto, `exemplo.invalid` nos URLs, `10.0000/` nos DOIs), porque o repositório é público e elas ficam atribuídas a uma pessoa real. Fechou a ponta que o 019 não conseguiu verificar: `getEntry()` resolve de fato depois de `normalizeLinhaRelacionadaId`. Dois achados novos do painel, da família F-09: o formulário descarta em silêncio alteração em campo que já tinha valor quando se volta de um subpainel; e projeto sem linha de pesquisa grava `linha_relacionada: ''`, que o Astro rejeita como referência inválida embora o `astro check` ainda encerre com `0 errors` e exit 0 — insumo para a fase 2 (F-09, RNF-09) e para o manual da fase 5 |
| v0.1.18 | 2026-09-10 | Desenvolvedor | **Plano 022 DONE** (`88f1c75`): a coleção `disciplinas` ganha a lista embutida `scripts[]` nos dois lados do modelo (RF-37). §12 passa de 7/10 a 8/10 na fase 1. `linguagem` é obrigatória dos dois lados com o padrão vindo de `ui.defaultItem`, não de `.default()` no Zod — um default faria `safeParse(undefined)` passar e quebraria a classificação de obrigatoriedade do teste de paridade. Sem validação cruzada de `aula` (F-13), sem limite de tamanho em `codigo`, sem exclusividade entre `codigo` e `url`. Suíte de 93 para 107 testes. **O R-13 não se materializou:** verificado salvando pelo `/admin` um script com bloco indentado, linha em branco e aspas — o `js-yaml` escolheu block scalar `|-` e o round-trip é byte-idêntico. Dois achados operacionais novos: `npm run dev` não sobe o painel no Astro 7 (o `astro dev` daemoniza sem TTY e leva o `tinacms dev` junto, deixando o `/admin` com "Failed loading TinaCMS assets"), e salvar sem sair do subpainel evita a armadilha do descarte silencioso que o 020 registrou |
| v0.1.19 | 2026-09-10 | Desenvolvedor | **Plano 021 fecha a fase 1** (execução completa; `Status` do plano continua `TODO` até a promoção administrativa — revisão, commit, CI). ADRs 0003 a 0008 escritos para D-02 a D-07 e D-06 — a D-06 ganhou ADR próprio por consistência com as demais, apontando para a Evidência do plano 019 em vez de duplicá-la. Corrigida a docstring de `normalizeLinhaRelacionadaId` (`src/content.config.ts`), que chamava a referência inválida de "falha silenciosa que só apareceria na fase 3"; o `astro check` já a reporta hoje, o silencioso é o exit code. Suíte da fase em **107 testes, cobertura 100%** (sem alteração de código de teste neste plano). **O critério de conclusão da fase (§6.2) foi demonstrado pelo orquestrador**: item criado e editado pelo `/admin` nas cinco coleções, com o arquivo gravado conferido a cada save — achou a segunda manifestação do descarte silencioso do plano 020 (perda visível da edição, não gravação do valor antigo) e mais uma instância da dívida de subcampo obrigatório não bloqueado (`publicacoes.autores[]`). §12 passa de 8/10 a **10/10** — **fase 1 concluída** |
| v0.1.20 | 2026-09-10 | Desenvolvedor | **Fase 1 promovida a concluída no §0:** o 021 virou DONE em `7d5b7e6` (CI verde sobre `26de58a`) e o topo do documento ainda dizia que faltava a promoção administrativa — o mesmo tipo de defasagem que a v0.1.7 já tinha corrigido uma vez. **Fase 2 fatiada** em 12 planos (023–034) em `plans/fase-2-pipeline-de-publicacao/`, com o tratamento explícito das sete dívidas que a fase 1 empurrou. Nenhum item do checklist da fase 2 foi entregue ainda; a fase passa a 🟡 em andamento em §0 e na tabela de progresso do §12 |
| v0.1.21 | 2026-09-11 | Desenvolvedor | **Plano 023 DONE** (`ae1bbc8`): primeiro plano da fase 2 fechado, com CI `conclusion: success` no run 34593469875 — todos os passos do job `qualidade` verdes, inclusive o `npm run build`. O plano não fecha item do §12 (não cobre RF), então a fase 2 continua em **0/8**; o que ele entrega é o §0 e o `plans/README.md` deixando de afirmar que faltava a promoção administrativa do 021. Os artefatos do fatiamento (024–034 e o README da fase) entraram em `1f62500`. **A promoção deste plano atualiza o topo do documento no mesmo commit** — foi exatamente pular esse passo em `7d5b7e6` que criou a defasagem que o 023 veio corrigir |
| v0.1.22 | 2026-09-11 | Desenvolvedor | **Plano 024 DONE** (`f8f416a`): os dois pipelines automáticos passam a ter um comando de build próprio, `npm run build:pipeline` (`vitest run tests/content` + `tinacms build --skip-cloud-checks` + `astro check` + `astro build`), enquanto o `npm run build` local mantém o cloud check como portão pré-push. Isso quita a **dívida 1 da fase 1**: o cloud check do TinaCloud compara o schema local com o já reindexado em `main` e, num pipeline, reprova sem haver defeito — em `push` por corrida com a reindexação assíncrona, em `pull_request` de forma determinística, porque o schema daquele branch nunca foi indexado. **ADR-0009** registra a decisão, as alternativas rejeitadas e o gatilho de revisão; o custo é explícito — os pipelines perdem o sinal automático de indexação, que passa a ser dado no `/admin` em produção (plano 026) e no `npm run build` local. Provado que a bandeira pula *validação* e não *geração*: 212 arquivos hasheados em `dist/`, `public/admin/` e `tina/__generated__/`, divergência única em `client.ts`, cujo `cacheDir` embute o epoch do processo — duas execuções de `npm run build` **sem** a bandeira divergem no mesmo campo. CI `conclusion: success` no run 34598162602, com o passo `npm run build:pipeline` no log. A fase 2 **continua em 0/8** no §12: o 024 é pré-requisito dos itens 1 e 2, não os entrega. Primeira promoção deste projeto com o GitHub CLI instalado — o log completo do run passa a ser evidência colável, o que a API pública não permitia |
| v0.1.23 | 2026-09-11 | Desenvolvedor | **Plano 025 DONE** — o deploy deixa de ser manual. Workers Builds conectado a `researchgroups-ufma/haroldo-page` na `main`, rodando `npm run build:pipeline` e `npx wrangler deploy`. O push `ab0d1f8` disparou build sozinho (`ace5b1b9`, **2m02s**, Node 24.21.0 detectado do `.nvmrc`) e publicou a versão `1132cea1-e676-4e54-9b2e-7a49be7ef9a0`; a URL responde 200. **§12 vai de 0/8 a 2/8** — itens 1 e 2 da fase 2. Dois achados de painel que o roteiro registra para quem repetir: variável de **build** não é variável de **runtime** (a plataforma recusa runtime num Worker só de assets — é a D-01 sendo cumprida), e o app `cloudflare-workers-and-pages` já estava instalado na organização desde 2026-06-02 com escopo `selected`, sem alcançar este repositório, o que o painel reportava como "disconnected from your Git account". Medições que o PRD cobrava: R-06 e R-12 com folga de duas ordens de grandeza (3 de 3.000 min/mês), RNF-14 e M-06 em **US$ 0,00**. Duas coisas explicitamente **não** provadas: o `not_found_handling` (a rota inexistente dá 404 de corpo vazio porque ainda não existe `404.html` — RF-27 é da fase 3) e a autenticação do `/admin`, que responde 200 mas é critério do plano 026 |
| v0.1.24 | 2026-09-11 | Desenvolvedor | **Plano 026 DONE** — o `/admin` em produção autentica e edita. Login da conta ADMIN pelo TinaCloud (autenticado via GitHub) funciona no site publicado (**RF-01**); sem sessão o painel expõe só quatro controles — "Log in", o menu, ocultar painel e o link de docs — e nenhum de edição, sem token no `localStorage` (**RF-02**); o menu traz as cinco coleções em vocabulário acadêmico e em português, sem menção a arquivo, pasta, commit ou branch (**RF-03**). Um item de cada coleção abriu com o conteúdo real da `main` indexada. A prova do ciclo é uma edição de verdade: o `resumo` de `linhas-pesquisa/sombras-de-buracos-negros` salvo pelo painel virou o commit `7ab84da` na `main` — atribuível ao ADMIN pelo autor e pelo `Co-authored-by` (**RNF-16**) —, que disparou o build `8aa9d0db` (`build_outcome: success`, iniciado 2 s depois do commit) e publicou a versão `4b948808`, servindo 100% do tráfego. **§12 vai de 2/8 a 3/8** (item 3 da fase 2). CI `conclusion: success` no run 34649311276, com 107 testes e cobertura 100% sobre o próprio commit do painel. Três achados **reportados e não consertados**, como o plano exige: `/admin` e `/admin/index.html` respondem **307** para `/admin/` (default `auto-trailing-slash` do Workers Static Assets, já que o `wrangler.toml` não declara `html_handling`) — nenhuma das três formas dá 404; o vocabulário de arquivo ("Filename", "Add Folder", `content/perfil/index.md`) reaparece **um clique adiante** do menu, na listagem da coleção, o que não viola o RF-03 como está escrito mas vira insumo do plano 033; e a trilha do painel trunca `2026.2-relatividade-geral` em "2026", tratando o ponto como extensão. Desvio menor do roteiro: o plano sugeria editar a `descricao` de uma linha de pesquisa, campo que **não existe** — o editado foi o `resumo`, que é o campo de texto simples fora de subpainel que o plano pretendia. Continua **não** provado que "o texto aparece no site": não há página que renderize conteúdo até a fase 3 |
| v0.1.25 | 2026-09-11 | Desenvolvedor | **Plano 030 DONE** (`4343e42`): o portão de conteúdo da §11 deixa de ser promessa. Até aqui, arquivo inválido em `content/` **não reprovava** — o `astro check` imprimia `[ERROR] [content]` e ainda assim encerrava com `0 errors` e exit 0, e o que impediu uma referência inválida de entrar no commit que fechou a fase 1, em 2026-09-10, foi **um humano ler a saída**, com `lint`, `format`, `test` e `build` todos verdes. O ponto técnico que o plano ataca é que **`safeParse` não detecta isso**: `linha_relacionada: ''` passa pelo Zod, porque `reference()` apenas transforma o valor e quem verifica existência é a content layer do Astro, em tempo de build. `tests/content/conteudo-valido.test.ts` faz a asserção de existência **explicitamente, sobre o valor bruto do frontmatter**, com dois ramos (referência vazia e referência pendente), lendo com `gray-matter` — o mesmo parser que o painel usa para gravar — e emitindo mensagens no formato de **F-09** (arquivo + campo), agregadas para não esconder falhas depois da primeira. Acrescenta ainda a comparação do `path` de cada coleção do Tina com o `base:` do `glob()` do Zod (**dívida 7a**), que reprova se a extração não achar as cinco. Suíte de **107 a 115** testes; `build:pipeline` com 101 em `tests/content` (2 + 18 + 81). **O portão vale no deploy, provado nominalmente:** o log do build `4b0d544e` na Cloudflare lista `✓ tests/content/conteudo-valido.test.ts (2 tests)` antes do `wrangler deploy`, publicando a versão `6b5cec66`. CI `conclusion: success` no run 34654789999. Dívidas da fase 1 fechadas: **5** e **7(a)/(c)**; a **7(b)** fica deliberadamente para a fase 3 e `classifyTina` não foi tocada, porque não existe hoje campo com `list: true` **e** `options` para exercitar a mudança. **O §12 não muda (fase 2 segue em 3/8)**: como o 023, este plano não fecha item do checklist. Achado registrado, correção em plano próprio: `normalizeLinhaRelacionadaId` é `const` não exportada, então o teste re-implementa suas duas regexes à mão — duplicação que pode divergir em silêncio, a mesma família da D-06 |
| v0.1.26 | 2026-09-11 | Desenvolvedor | **Plano 031 DONE** (`1de5d1d`): `tina/tina-lock.json` defasado passa a reprovar a suíte. O lock é o único artefato do Tina que fica **versionado** — o TinaCloud precisa dele em `main` para indexar a branch — e só `tinacms dev` o regenera; `tinacms build --skip-cloud-checks` não reescreve. Quem mudava schema tinha de subir o dev server e commitar o lock, e **nada verificava se tinha feito**: o README documentava o passo manual, e documentação não é portão. Ficou mais grave depois do 025, porque a `main` publica sozinha e um lock defasado **não quebra o site** (que não depende do TinaCloud em runtime, §7.1/F-03) — quebra o `/admin`, dias depois, como "No Tina config was found on main", para quem não fez a mudança. `tests/content/tina-lock-coerente.test.ts` compara a árvore declarativa de `tina/config.ts` com `schema.collections` do lock por caminho qualificado: **109 caminhos**, conferindo `type`, `required`, `list`, `options` e `collections`, sem rodar o dev server — o lock é lido como JSON e o config importado com o mesmo `vi.mock` de `defineConfig` do teste de paridade. As chaves **não** comparadas estão listadas e justificadas no cabeçalho. **Reprovado no primeiro ciclo de revisão, por dois furos que o revisor reproduziu** — nenhum deles desvio do executor, que seguiu a lista de atributos que o próprio plano deu: (a) `collections`, o alvo de um campo `reference`, ficava fora da assinatura, e trocar o alvo com o lock intocado passava verde — a única classe de defasagem estrutural que o teste existe para pegar, justamente no campo que o `/admin` usa; (b) `options` era normalizado com `.sort()` antes de comparar, então alterar um valor falhava mas **reordenar passava**, e o enfraquecimento não estava comentado em lugar nenhum. Os dois foram fechados dentro do plano, comparando na ordem declarada, com os achados registrados no próprio arquivo. Suíte de **115 a 122** testes; `build:pipeline` com 108 em `tests/content` (7 + 18 + 2 + 81). **O portão vale no deploy, provado nominalmente:** o log do build `b6da5235` lista `✓ tests/content/tina-lock-coerente.test.ts (7 tests)` antes do `wrangler deploy`, publicando a versão `043f69f3`. CI `conclusion: success` no run 34658265557. **Nenhuma alteração de workflow ou de script foi necessária** — comprovado por diff vazio em `package.json` e `ci.yml`. O lock em `main` já estava coerente: o portão nasceu verde. **Dívida 2 da fase 1 quitada**; o §12 não muda (fase 2 segue em **3/8**), porque, como o 023 e o 030, este plano não fecha item do checklist |
| v0.1.27 | 2026-09-12 | Desenvolvedor | **Recorte de escopo decidido em sabatina** (`docs/sabatinas/CHANGELOG_sabatina_recorte-sem-professor.md`, 4 decisões): tudo que exige uma sessão com o professor passa para a **fase 5**; o que não exige é executado antes. **Nenhum requisito muda — só onde ele é verificado.** O critério de conclusão da fase 2 no §6.2 era literalmente o passo do professor (*"um usuário EDITOR edita no `/admin` em produção..."*), então tirar os planos 027 e 029 da fase sem tocar no PRD deixaria uma fase incapaz de fechar pelo próprio critério. **Decisão 1:** o critério da fase 2 passa a ser o ciclo ponta a ponta do **ADMIN** — já demonstrado pelo plano 026 —, e os itens 4, 5 e 7 do §12 migram para a fase 5 junto com os planos 027 e 029; a fase 2 vai de 8 para 5 itens (3/5) e a fase 5 de 14 para 17. A fase 5 já era onde o professor aparecia no PRD (treinamento, M-01, remedição de M-02), e a habilitação do EDITOR passa a ser o primeiro passo da mesma sessão. **Decisão 2:** o plano 028 (notificação de falha de build) **fica na fase 2 e roda agora** — ele não depende do professor, e o experimento que quebra a `main` de propósito é mais barato enquanto nenhuma página renderiza conteúdo do que depois da fase 3. **Decisão 3:** o plano 029 migra inteiro, sem fatiar, e o §3.3 passa a medir **M-02 só na fase 5** — medir agora congelaria a `main` (R-12) justamente quando a fase 3 vai empurrar dezenas de commits, e mediria o build de um site sem páginas, número que a própria fase 3 invalida. **Decisão 4 (ADIADA):** a **Q-04** (referências visuais) continua aberta e **continua bloqueando a fase 3** — o stakeholder optou por fornecer as referências. Consequência operacional: o recorte **não alcança o site navegável** enquanto a Q-04 não for respondida; o executável de imediato são os planos **028**, **032**, **033** e **034**, que fecham a fase 2 em 5/5 |
| v0.1.28 | 2026-09-12 | Desenvolvedor | **Plano 033 DONE** (`0c2bd02`): as descobertas sobre o painel deixam de viver espalhadas por Evidências de sete planos e por um README de fase. `docs/avisos-do-painel-para-o-manual.md` consolida **cinco avisos**, cada um com o que acontece / como reproduzir / contorno / o que o manual tem de dizer ao professor / quando revisar / origem citada arquivo por arquivo — insumo nomeado para `docs/manual-do-professor.md` (§10.5, fase 5) e para a sessão de treinamento da RNF-05. Os dois mais graves: (1) o painel **descarta edição em silêncio ao voltar de um subpainel**, com as duas manifestações finalmente distinguidas — o plano 020 viu a gravação do valor **antigo** com a tela mostrando o novo, o 021 viu a perda **visível** da edição com o `Save` desabilitando —, e o contorno do 022 nomeado: salvar sem sair do subpainel; (2) o painel **deixa salvar item de lista com subcampo obrigatório vazio**, o que **contradiz o F-01** ("o Tina bloqueia o salvamento e destaca o campo") para lista embutida — dito com todas as letras, porque o manual não pode prometer o que o painel não faz. Registra ainda a **decisão da fase 2 sobre a dívida 4**: ela **não é automatizável** — é a única dívida da fase 1 que atravessa **todo** o portão de qualidade com build, testes, lint e CI verdes, porque o conteúdo gravado é *válido*, só não é o que o professor quis, e nenhum teste distingue intenção. **Dívidas 3 e 4 da fase 1 quitadas.** O §12 **não muda** (fase 2 segue em **3/5**): como o 023, o 030 e o 031, este plano não fecha item do checklist. **Reprovado em dois ciclos de revisão, nenhum por defeito no documento** — o revisor abriu cada fonte citada e todas as conferências passaram já no primeiro ciclo: o ciclo 1 reprovou por a Evidência do plano não ter sido preenchida, e o ciclo 2 por o bloco de saída colado nela ser o da execução anterior (`740ms`, `git status` com um arquivo) em vez do reteste que validou o estado final (`708ms`, dois arquivos) — **o bloco errado veio da mensagem de despacho do orquestrador, não foi desvio do executor**. Suíte em 122 testes, cobertura 100%, sem alteração de código. CI `conclusion: success` no run 34695465499 **e** Workers Builds `success` no build `1fb6e0dd`, os dois sobre `0c2bd02` |
| v0.1.29 | 2026-09-12 | Desenvolvedor | **Plano 032 DONE** (`b992282`, com a emenda em `fed445b`): o CI passa a **olhar** para as vulnerabilidades das dependências. Passo `npm audit --audit-level=high` entre `npm ci` e `npm run lint`, **sem `continue-on-error`** — um passo que nunca falha é decoração. Política escrita: **reprova em `high`/`critical`, relata `moderate`/`low`**, porque reprovar em `moderate` deixaria o CI vermelho para sempre por algo sem correção nossa, que é o modo de falha que já custou 14 commits a este projeto. **E o portão nasceu verde**, como o do 031: o plano foi **emendado pelo stakeholder em 2026-09-12** para subir antes o `wrangler` de `4.128.0` para `4.131.1` — não-major, `devDependency`, última publicada —, o que levou o audit de **11 vulnerabilidades (8 `moderate`, 3 `high`)** para **8 `moderate`, zero `high`**. As alternativas foram consideradas e **rejeitadas no ADR-0010**: *reprovar só em `critical`* afrouxaria o portão permanentemente por um problema com correção trivial, e *exceção nomeada e datada* criaria dívida de manutenção para algo que não precisa de exceção. **O mecanismo não era o que parecia, e a revisão obrigou a corrigi-lo:** o `sharp` **não saiu** do projeto — ele chega por `astro@7.2.10`, que é dependência de **produção** —; a cópia vulnerável era a aninhada sob `miniflare` (`0.35.2`, faixa `<0.35.4`), e o `wrangler` novo fez o `miniflare` **deduplicar** na cópia segura que já existia, removendo 27 pacotes do lock e adicionando zero. O argumento "é `devDependency`, não entra no Worker" vale para o **`wrangler`**; o que mantém o `sharp` fora do Worker é ser usado em **tempo de build** num site estático sem runtime de Node (D-01). **Falsificabilidade provada na mesma árvore:** `--audit-level=high` → exit 0, `--audit-level=moderate` → exit 1. O passo aparece **nominalmente no log do run 34705501376**, listando as moderadas com seus identificadores e passando assim mesmo — a informação não some, só deixa de reprovar. **Dívida 6 da fase 1 quitada.** O §12 **não muda** (fase 2 segue em **3/5**). **Reprovado em um ciclo de revisão, com três defeitos, todos de documentação e nenhum alcançável por teste:** o ADR não dizia o mecanismo real da correção; citava 2 advisories enquanto a Evidência **afirmava** citar 5; e o `README.md` atribuía as 8 moderadas a uma cadeia única quando são **duas** (5 via `react-router-dom`, 3 via `@tinacms/cli → altair-express-middleware`) — afirmação falsa que entrou **no mesmo parágrafo** que corrigia a afirmação falsa anterior ("`npm audit` em zero vulnerabilidades", verdadeira no plano 014 e falsa desde 2026-09-03). Correção registrada de passagem: das 8 moderadas, **5** não têm saída — o "fix" que o npm oferece é `major` **para trás**, `tinacms@1.5.5` quando o projeto está em 3.12.1 — e **3** (`qs`, `body-parser`, `express`) têm correção disponível e ficaram **deliberadamente de fora**, como pendência nomeada e datada no ADR-0010 |
| v0.1.30 | 2026-09-12 | Desenvolvedor | **Plano 028 DONE** (`5528ad6`, com a emenda em `fee4e7f` e o vigia em `86a6370`): falha de build passa a chegar ao ADMIN. **O desenho mudou no primeiro passo:** a Cloudflare **não oferece** notificação de falha do Workers Builds — `alerting/v3/available_alerts` sem nenhum tipo de Workers Builds, painel conferido pelo ADMIN, e a documentação só oferece Event Subscriptions (Queue + Worker próprio). Decisão do stakeholder, emendada no plano e registrada no **ADR-0011**: `.github/workflows/vigia-do-deploy.yml` roda **uma vez por dia** e lê o check run `Workers Builds: haroldo-page` do commit mais recente da `main`, reprovando quando o build de deploy falhou ou quando o check falta há mais de 30 min (app GitHub ↔ Cloudflare desconectado, como no plano 025). Gatilho `schedule` e não `push` porque o e-mail de workflow agendado vai para quem alterou o cron por último, o ADMIN; o de `push` iria para quem empurrou, que num save do professor é o TinaCloud. Nenhum secret novo. **Experimento com o erro real do professor** (`aulas: [ {} ]`, commit `b8e4560`): build `f9650b87` falhou em 47 s no `vitest run tests/content` com `content/disciplinas/2025.1-mecanica-classica.md → campo 'aulas.0.numero': expected number` (**F-09**); o site seguiu `200` na versão `c3d2f67f`, igual à linha de base, durante 1h33 de `main` quebrada (**RNF-04**); o arquivo inválido ficou no repositório; o vigia reprovou e o e-mail chegou ao ADMIN em menos de 1 min (**F-02**); a reversão `8a246be` publicou a versão `b1c13465`. **§12 vai de 3/5 a 4/5** (item 4 da fase 2). **Pendência nomeada, aceita pelo stakeholder na promoção:** o cron foi trocado para `*/5` na janela e o GitHub **não executou nenhuma** execução agendada em ~90 min; detecção e e-mail foram provados por `workflow_dispatch`, cujo e-mail vai para quem dispara. O caminho `schedule` é regra documentada, não observada, e fecha quando o vigia aparecer rodando pelo agendamento e a primeira falha real gerar e-mail por ele. Riscos registrados no ADR-0011: workflow agendado em repositório público **desliga sozinho após 60 dias sem atividade**, e o assunto do e-mail do GitHub (`Run failed`) não diz qual workflow falhou. CI e Workers Builds `success` sobre `5528ad6` |
| v0.1.31 | 2026-09-12 | Desenvolvedor | **Plano 034 — fecha a fase 2 em 5/5 (🟢 Concluída).** Execução completa (README.md, `plans/README.md`, `plans/fase-2-pipeline-de-publicacao/README.md` e este PRD); `Status` do plano permanece `TODO` até a promoção do orquestrador, o mesmo padrão do plano 021 ao fechar a fase 1. A seção "Deploy" do `README.md`, que ainda dizia que o deploy é **manual** e que o automático "só é ligado na fase 2", foi reescrita: automático é o caminho normal desde o plano 025, e `npm run deploy` fica documentado como caminho de emergência (`npm run build`, **com** cloud check — ADR-0009). Seção nova "Pipeline de publicação" responde cinco perguntas com números **medidos**, não estimados: (1) a cadeia painel→TinaCloud→`main`→Workers Builds→versão nova, com os tempos dos planos 025 (2m02s), 026 (2 s entre commit e início do build) e 028 (reversão em 1m59s, falha em 47s) — e a ressalva de que M-02 só é medida na fase 5; (2) CI e Workers Builds disparam em paralelo e o CI **não** é portão do deploy (ADR-0009); (3) onde vive cada variável (`.env`, secrets do GitHub Actions, *build variables* da Cloudflare — que são de build, não de runtime, achado do plano 025) e o que é segredo; (4) o comportamento medido no plano 028 quando o build falha (F-02/RNF-04) e o vigia agendado do plano 028 (ADR-0011), com os quatro avisos ao mantenedor (desligamento por 60 dias, destinatário do e-mail, assunto do e-mail que não nomeia o workflow, pendência do caminho `schedule`); (5) a ordem para mudar schema sem cloud check no pipeline, incluindo a regeneração do `tina-lock.json` e o teste do plano 031. **§12:** item 5 da fase 2 marcado; tabela de progresso da fase 2 para **5/5 · 🟢 Concluída**. O README da fase 2 ganhou a seção "O que a fase 2 empurra adiante, e as dívidas que ela criou", consolidando o que vai para a fase 3 (dívida 7b, renderização/M-02, e o achado do plano 025 de que o `not_found_handling` ainda não foi provado de fato — 404 de corpo vazio, sem `404.html`), o que vai para a fase 5 (avisos do plano 033, remedição de M-02, teste de restauração de conteúdo excluído, achados do plano 026, risco dos 60 dias do ADR-0011, assunto do e-mail que não nomeia o workflow) e as **quatro** dívidas novas sem fase atribuída (a pendência do caminho `schedule` do vigia; as três moderadas corrigíveis adiadas `qs`/`body-parser`/`express`, ADR-0010; a duplicação de `normalizeLinhaRelacionadaId`; e a imprecisão do cabeçalho de `conteudo-valido.test.ts`, as duas últimas achados do plano 030) — com **três** candidatas descartadas e o motivo escrito (o redirecionamento 307 do `/admin`; o aviso de troca de autenticação do TinaCloud; `linha_relacionada: 42` escapando do portão de conteúdo). **Divergência entre o corpo do plano e o recorte de 2026-09-12, registrada na Evidência do plano:** o corpo fala em oito itens e "onze" planos anteriores — o recorte já havia corrigido isso no cabeçalho do próprio plano para cinco itens e nove planos, e a v0.1.27 é a fonte |
| v0.1.32 | 2026-09-12 | Desenvolvedor | **Plano 034 DONE** (`ef7f258`) — promoção administrativa, e com ela a **fase 2 concluída em 5/5**. CI `conclusion: success` no run 34725633372 e Workers Builds `success` no build `ce5acda4`, os dois sobre `ef7f258`. **A revisão reprovou três ciclos e aprovou no quarto**, autorizado pelo stakeholder; nenhum defeito de código, todos de documento contra fonte. Ciclo 1, oito bloqueantes: o §0 dizia a fase 2 "em andamento" e "concluída" na mesma célula; três achados do plano 030 não absorvidos; três afirmações do `README.md` tornadas falsas pela fase (sequência do CI sem `npm audit`, estrutura sem o vigia, `npm run deploy` como "deploy manual"); gatilho de revisão sem fonte na dívida das moderadas; aviso do assunto do e-mail fora do repasse; secrets atribuídos a um commit; e diffs "colados" que não estavam na Evidência. Ciclo 2, quatro: diff do §0.1 com linhas de contexto marcadas como inserção, `--stat` velho, o assunto do e-mail do vigia chamado de "medido" quando é inferido, e contagens desta própria linha v0.1.31 desatualizadas. Ciclo 3, um: `--stat` e hunk do Passo 6 de antes da última correção. Ciclo 4: nota corrigida e blocos comparados byte a byte com `git diff`. **Lição de processo:** diff colado em Evidência tem de ser gerado por comando e inserido por script, depois da última edição dos arquivos que ele descreve — redigitado ou tirado antes, fica velho em silêncio |
| v0.1.33 | 2026-09-12 | Desenvolvedor | **Plano 035 DONE** (`f7c31d3`) — correções da revisão de integração do `/fechar-fase` da fase 2, que olhou as interações entre planos e reprovou com dois bloqueantes. (1) O `npm run deploy`, caminho manual de emergência, era descrito como "o mais estrito" mas **não rodava `tests/content`**: tinha o cloud check e pulava o portão de conteúdo, e como o `astro check` sai com exit 0 diante de referência inválida, publicaria o que o deploy automático recusa. Decisão do stakeholder: o script passa a `vitest run tests/content && npm run build && wrangler deploy` (emenda no ADR-0009, ponto 4). Provado sem publicar: `aulas: [ {} ]` reprova no `vitest run tests/content`. (2) `plans/README.md` dava a fase como concluída e o 034 como pendente no mesmo arquivo. **Não bloqueante corrigido por decisão do stakeholder:** o vigia do 028 só tinha limite para check **ausente**; um check preso em `queued`/`in_progress` fazia o vigia responder "em andamento" todo dia, sem aviso — furo do F-02. Passa a reprovar quando o commit tem mais de **60 min** (não 30: o plano gratuito tem 1 build simultâneo e saves enfileiram). ADR-0011 item 4 e Consequências emendados. Lógica exercitada com `gh` falso em seis cenários, script extraído do YAML por programa, e o revisor repetiu 59/61 min; vigia real `success` sobre `f7c31d3` (run 34732151287). **Quatro não bloqueantes viraram dívida nomeada** no README da fase: o §11 deste PRD atribui a validação de conteúdo ao `astro build` e diz "bloqueia merge" (a `main` não tem proteção de branch); a seção "Verificação autoritativa" do README da fase parou antes do 030; o `npm run build` chamado de "portão pré-push", quando para mudança de schema só passa depois do push; e o plano B do Workers Builds no §7.4 não avisa que derruba o vigia. Revisão reprovada em um ciclo (três frases de dívida contra fonte) e aprovada no segundo. CI e Workers Builds `success` sobre `f7c31d3`; suíte em 122 testes, cobertura 100% |
| v0.1.34 | 2026-09-14 | Desenvolvedor | **Q-04 resolvida — a fase 3 deixa de estar bloqueada.** O stakeholder forneceu as referências visuais em `ref/`: um documento de design (`Site UFMA Física v2.dc.html`, direção "estrutural, monocromático": papel cinza-claro, tinta quase preta, sem cor de acento, réguas finas, numerais grandes e finos) com as telas de todas as rotas em 1920 px e 360 px, e cinco capturas de portfólios que o inspiraram. **O mock foi desenhado para um professor fictício e não conhece o schema**, então a resposta virou sabatina (`docs/sabatinas/CHANGELOG_sabatina_identidade-visual.md`, 4 decisões): (1) a fase 3 segue o fluxo da casa — PRD, fatiamento, execução; (2) elementos do mock **sem campo no schema** (carga horária, horário, próxima aula, avaliação, atendimento, equação central, frase de destaque da Home, conteúdo do CV) são **cortados**, sem reabrir a fase 1; (3) **nenhuma** parte fora do §6.1 entra — sem página CV, sem página por linha de pesquisa, sem filtros de publicações; (4) escala recalibrada para 360–1440 px (corpo 16 px, rótulos 12 px) e, por preferência do stakeholder, **Helvetica e grotescas sem serifa, com monoespaçada só no código dos scripts**. A tradução em tokens, tipografia, componentes e composição por rota, com a tabela do que mudou em relação ao mock e por quê, está em `docs/identidade-visual.md`, que o §8.2 passa a apontar. O mock não traz cabeçalho nem rodapé (são componentes importados de fora do arquivo) — os dois foram desenhados no documento. Contraste da paleta calculado pela fórmula da WCAG: menor par de texto 4,59:1. **Nenhum requisito muda.** §0, §8.2, §14.1, §16 e Apêndice B atualizados |
| v0.1.35 | 2026-09-16 | Desenvolvedor | **Plano 036 DONE** (`fb117b6`) — primeiro plano da fase 3. `src/styles/global.css` passa a conter o sistema visual de `docs/identidade-visual.md` §2–§4 e §7 (tokens de cor, três famílias, nove utilitários de escala fluida, margem e medida, foco visível, movimento só com `prefers-reduced-motion: no-preference`); Archivo 200/300 latin auto-hospedada via `@fontsource/archivo` 5.3.0, versão exata. Não fecha item do §12 (pré-requisito). Revisão reprovada em um ciclo, só por redação: o critério "`dist/` sem referência a Google Fonts" é falso para `dist/admin/`, onde o painel TinaCMS carrega a Inter; **decisão do stakeholder:** emenda datada recortando o critério para o site público e dívida nomeada no README da fase. Decisão de processo do stakeholder no mesmo dia: planos executados **um por vez**, com confirmação antes do próximo. CI `qualidade` (run 35151738105) e Workers Builds `success` sobre `fb117b6`; suíte em 122 testes, cobertura 100% |
| v0.1.36 | 2026-09-16 | Desenvolvedor | **Plano 037 DONE** (`23d1aa0`) — todo texto de interface das rotas da fase 3 em `src/i18n/pt.ts` (objeto `pt`, tipo `UiStrings`; plurais e interpolações como funções), cumprindo o §10.4 desde já para não reescrever as páginas na fase 4; nada de `en`, seletor ou fallback. Os cinco mapas de enum são tipados pelos schemas Zod e testados contra os `options` reais — o plano dizia "quatro" mas nomeava cinco, contradição registrada como nota datada sem alterar o critério. `src/lib/navigation.ts`: `NAV_ITEMS` com barra final e `isActivePath`. Não fecha item do §12 (pré-requisito). Revisão aprovada no primeiro ciclo. Suíte em 148 testes, cobertura 100% statements/lines e 91,66% branches; CI `qualidade` (run 35154284081) e Workers Builds `success` sobre `23d1aa0`. Também anotada no README da fase (`ef04c1f`) a dívida do Tailwind 4 varrendo `plans/` e `docs/` |

---

## 1. Resumo Executivo

- **O que é:** site pessoal acadêmico de um professor de Física — perfil, linhas de pesquisa, disciplinas com materiais de aula e catálogo de publicações — com um painel administrativo que o próprio professor opera.
- **Problema que resolve:** professores dependem de terceiros para qualquer atualização da própria página. Publicar um artigo novo, uma lista de exercícios ou uma disciplina do semestre vira um pedido a um desenvolvedor, e o conteúdo envelhece. O objetivo é remover o desenvolvedor do caminho da atualização de conteúdo.
- **Solução proposta:** site estático em Astro, conteúdo em arquivos versionados no Git, editado por formulários em um painel TinaCMS autenticado pelo TinaCloud. O professor faz login, preenche um formulário pensado em termos acadêmicos ("Adicionar publicação", não "criar arquivo .md") e publica; o commit e o deploy acontecem sozinhos. PDFs e slides ficam no Google Drive — o site guarda apenas o link.
- **Resultado esperado:** o professor mantém a própria página sem conhecer Git, Markdown ou linha de comando, e o custo de hospedagem permanece zero enquanto o volume couber nos planos gratuitos de Cloudflare e TinaCloud.
- **Esforço estimado:** ordem de semanas; 6 fases (0 a 5).

---

## 2. Contexto e Motivação

### 2.1 Situação Atual (As-Is)

Não há site pessoal. A presença digital do professor se resume à página institucional do departamento (formato fixo, atualização por terceiros) e ao currículo Lattes. Materiais de disciplina circulam por e-mail, grupos de mensagem ou sistemas acadêmicos de acesso restrito, sem endereço público estável. Publicações estão dispersas entre Lattes, ORCID e Google Scholar, sem uma listagem própria e citável.

Quando algo precisa mudar em qualquer página institucional, o fluxo é: professor escreve o pedido → aguarda um responsável técnico → alguém edita → publica. Latência de dias a semanas, dependência total de terceiros.

### 2.2 Problemas Identificados

| ID | Problema | Impacto | Frequência | Evidência |
|---|---|---|---|---|
| P-01 | Professor não consegue atualizar a própria página sem intermediário técnico | Alto | Semanal | `briefing.md` §1 e §4 — requisito central declarado |
| P-02 | Materiais de disciplina sem endereço público estável; alunos dependem de e-mail/grupos | Alto | A cada semestre | `briefing.md` §6 e §8 |
| P-03 | Publicações dispersas entre Lattes, ORCID e Scholar, sem listagem própria | Médio | Contínua | `briefing.md` §10 |
| P-04 | Sem canal próprio para divulgar atividades acadêmicas (palestras, defesas, prêmios) | Médio | Eventual | `briefing.md` §11 |
| P-05 | Ferramentas de CMS tradicionais expõem estrutura de arquivos e vocabulário técnico ao editor não técnico | Alto | A cada edição | `briefing.md` §12 |
| P-06 | Soluções institucionais têm custo de manutenção e não permitem evolução (componentes interativos, simuladores) | Baixo | Anual | `briefing.md` §16 |

### 2.3 Por Que Agora?

A stack alvo amadureceu: o TinaCMS passou a oferecer integração oficial com Astro (`@tinacms/astro`) e o Cloudflare Workers ganhou deploy automático a partir do GitHub (Workers Builds), o que fecha o ciclo *editar → commitar → publicar* sem infraestrutura própria. Existe ainda um projeto irmão no mesmo diretório (`../grav`, site de grupo de pesquisa) com modelo de conteúdo e decisões de i18n já validados — reaproveitar reduz o custo de decisão. O custo de não fazer é a manutenção do status quo: página institucional desatualizada e materiais sem endereço.

### 2.4 Alternativas Consideradas

| Alternativa | Prós | Contras | Motivo da rejeição |
|---|---|---|---|
| WordPress hospedado | Editor familiar; ecossistema enorme | Custo mensal; superfície de segurança e manutenção (plugins, atualizações); conteúdo preso em banco de dados | Contraria "baixa manutenção" e "baixo custo" (§17 do briefing); professor herdaria um sistema que exige zelador |
| Notion / Google Sites | Zero desenvolvimento; edição trivial | Sem controle de layout, SEO fraco, domínio e identidade limitados, conteúdo não versionado | Não atende SEO, identidade visual nem versionamento |
| Markdown puro no GitHub Pages | Custo zero; versionamento nativo | Exige Git e Markdown do professor | Viola o requisito central (P-01) |
| Next.js + Decap CMS (padrão do `../grav`) | Padrão já dominado pela casa; Decap é gratuito e sem limite de usuários | Next.js é peso desnecessário para publicação majoritariamente estática; Decap exige função de OAuth própria para autenticação | Astro entrega o mesmo resultado com menos runtime; Tina oferece autenticação gerenciada sem função própria. **Ressalva registrada:** Decap continua sendo o plano B do risco R-03 |
| Backend próprio + banco de dados | Controle total | Overengineering explícito; custo, manutenção e segurança | Rejeitado pelo `briefing.md` §14 |

---

## 3. Objetivos e Métricas de Sucesso

### 3.1 Objetivos (Goals)

| ID | Objetivo | Métrica associada |
|---|---|---|
| G-01 | O professor publica uma alteração de conteúdo sozinho, do login à página no ar, sem contato com o desenvolvedor | M-01, M-02 |
| G-02 | Todo o conteúdo do MVP (perfil, pesquisa, disciplinas, publicações) é editável pelo painel, sem edição de arquivo | M-03 |
| G-03 | O site é rápido e acessível em desktop e celular | M-04, M-05 |
| G-04 | Custo de operação zero enquanto o volume couber nos planos gratuitos | M-06 |
| G-05 | O site existe em português e inglês, sem exigir que o professor traduza tudo para não deixar buracos | M-07 |
| G-06 | O conteúdo é versionado e recuperável — nenhuma edição destrói conteúdo anterior de forma irreversível | M-08 |

### 3.2 Não-Objetivos (Non-Goals)

- **NG-01:** não haverá backend próprio, banco de dados, API própria ou sistema de login customizado.
- **NG-02:** não haverá upload nem hospedagem de PDFs/slides pelo site — o professor hospeda onde preferir (Google Drive é a recomendação) e o site guarda apenas a URL (D-07).
- **NG-03:** não haverá importação automática de publicações (ORCID, Crossref, OpenAlex, arXiv, BibTeX) no MVP.
- **NG-04:** não haverá visual editing (editar clicando no texto da própria página) — decisão D-02, §7.2.
- **NG-05:** não haverá área restrita, login de aluno, entrega de trabalhos, notas ou qualquer funcionalidade de ambiente virtual de aprendizagem.
- **NG-06:** não haverá busca global, comentários, newsletter ou analytics no MVP.
- **NG-07:** não haverá fluxo de aprovação editorial por branch (indisponível no plano gratuito do TinaCloud) — substituído pelo campo `publicado`, decisão D-04.
- **NG-08:** o site não será um repositório de dados de pesquisa ou datasets.

### 3.3 Métricas de Sucesso (KPIs)

| ID | Métrica | Baseline atual | Meta | Como medir | Quando medir |
|---|---|---|---|---|---|
| M-01 | Professor conclui "adicionar uma publicação" sem ajuda | Impossível (sem site) | 100% de sucesso em teste assistido | Observação direta na validação da fase 5 | Fase 5 |
| M-02 | Tempo entre salvar no painel e conteúdo visível no site | N/A | < 5 min em 95% das publicações | Cronometragem em 10 publicações de teste | Fase 5 |
| M-03 | Cobertura do modelo de conteúdo pelo painel | 0% | 100% dos campos do MVP editáveis sem tocar em arquivo | Inspeção do schema Tina × §7.3 | Fase 1 |
| M-04 | Lighthouse Performance (mobile) | N/A | ≥ 90 | Lighthouse CI ou execução manual registrada | Fase 5 |
| M-05 | Lighthouse Accessibility + axe sem violações críticas | N/A | ≥ 95 e zero violações críticas | Lighthouse + axe-core | Fase 5 |
| M-06 | Custo mensal de hospedagem e CMS | N/A | US$ 0,00 | Painel de faturamento Cloudflare + TinaCloud | Mensal após a entrega |
| M-07 | Rotas `/en` sem string de interface em português | N/A | 0 ocorrências | Inspeção manual de todas as rotas EN + teste automatizado do dicionário | Fase 4 |
| M-08 | Edições recuperáveis via histórico do Git | N/A | 100% | Histórico do repositório | Contínua |

---

## 4. Usuários e Stakeholders

### 4.1 Personas

**Persona 1 — Professor (EDITOR)**
- **Quem é:** docente de Física, autor do conteúdo. Usa computador com fluência de usuário final (e-mail, editor de texto, navegador, Google Drive). Não programa, não usa Git, não conhece Markdown.
- **O que precisa fazer:** atualizar o próprio perfil; cadastrar disciplinas do semestre e ir acrescentando aulas, listas e materiais ao longo dele; cadastrar publicações à medida que saem; descrever linhas de pesquisa e projetos.
- **Dores atuais:** depende de terceiros para qualquer mudança; material de aula sem endereço fixo.
- **Nível de acesso:** EDITOR no TinaCloud. Sem acesso ao código, ao repositório como desenvolvedor, nem à infraestrutura.
- **Restrição de design decorrente:** todo rótulo do painel usa vocabulário acadêmico. Nenhuma tela deve mencionar arquivo, commit, branch, build ou deploy.

**Persona 2 — Desenvolvedor (ADMIN)**
- **Quem é:** autor deste PRD; responsável técnico durante e depois da entrega.
- **O que precisa fazer:** manter código, schema, estilos e infraestrutura; ser avisado quando um build falhar; ajustar o modelo de conteúdo quando o professor pedir algo novo.
- **Nível de acesso:** dono das contas GitHub, Cloudflare e TinaCloud (decisão do stakeholder na sessão de brainstorming).

**Persona 3 — Aluno (visitante)**
- **Quem é:** estudante de graduação buscando material da disciplina que cursa. Acessa majoritariamente por celular, muitas vezes em rede móvel.
- **O que precisa fazer:** achar a disciplina, a aula da semana e o PDF em poucos toques.
- **Restrição de design decorrente:** a página de disciplina é a rota mais sensível a desempenho e legibilidade em telas pequenas.

**Persona 4 — Par acadêmico (visitante)**
- **Quem é:** pesquisador, avaliador de agência de fomento, ou estudante candidato à pós-graduação — possivelmente estrangeiro.
- **O que precisa fazer:** avaliar linha de pesquisa e produção; achar DOI, arXiv e contato.
- **Restrição de design decorrente:** é esta persona que justifica o `/en` e a citabilidade das publicações.

### 4.2 Stakeholders

| Papel | Nome | Responsabilidade | Envolvimento (RACI) |
|---|---|---|---|
| Dono do produto | Desenvolvedor (`and.near@hotmail.com`) | Decisões de escopo e arquitetura | A |
| Desenvolvedor | idem | Implementação, deploy, manutenção | R |
| Usuário-chave | Professor | Fornecer conteúdo real; validar o painel na fase 5 | C |
| Alunos e pares | — | Consumidores do site | I |

---

## 5. Requisitos

> **Convenção MoSCoW:** **[MUST]** obrigatório no MVP · **[SHOULD]** importante, MVP funciona sem · **[COULD]** desejável · **[WONT]** fora desta versão.

### 5.1 Requisitos Funcionais (RF)

#### Painel administrativo (experiência do professor)

| ID | Prioridade | Requisito | Critério de aceitação | Status |
|---|---|---|---|---|
| RF-01 | MUST | O professor autentica-se em `/admin` com credenciais do TinaCloud | Dado um professor cadastrado como EDITOR, quando acessa `/admin` e faz login, então vê o painel com as coleções e nenhuma opção de alterar código ou configuração | ⬜ |
| RF-02 | MUST | Um visitante não autenticado não consegue editar nada | Dado um usuário sem sessão, quando acessa `/admin`, então recebe a tela de login e nenhuma operação de escrita é aceita pela API do TinaCloud | ⬜ |
| RF-03 | MUST | O painel apresenta as coleções em vocabulário acadêmico | Dado o painel aberto, quando o professor olha o menu, então lê "Perfil", "Linhas de pesquisa", "Projetos", "Disciplinas", "Publicações" — e nenhuma menção a arquivo, pasta, commit ou branch | ⬜ |
| RF-04 | MUST | Editar o perfil | Dado o professor no item Perfil, quando altera a biografia e salva, então a mudança é commitada e aparece no site após o deploy | ⬜ |
| RF-05 | MUST | CRUD de publicações | Dado o professor em Publicações, quando cria uma entrada com título, autores, ano, veículo e DOI e salva, então ela aparece na página pública agrupada sob o ano informado | ⬜ |
| RF-06 | MUST | CRUD de disciplinas | Dado o professor em Disciplinas, quando cria "Mecânica Clássica / 2026.2 / atual" e salva, então a disciplina aparece na listagem de disciplinas atuais | ⬜ |
| RF-07 | MUST | Gestão de aulas dentro da disciplina | Dado o professor editando uma disciplina, quando acrescenta uma aula com número, título, data e link do Drive, então a aula aparece na página da disciplina na ordem definida por ele (decisão D-05) | ⬜ |
| RF-08 | MUST | Gestão de listas de exercícios e materiais complementares dentro da disciplina | Idem RF-07, para as listas `listas[]` e `materiais[]` | ⬜ |
| RF-09 | MUST | CRUD de linhas de pesquisa | Dado o professor em Linhas de pesquisa, quando cria uma linha com título e descrição e salva, então ela aparece na página Pesquisa na ordem definida pelo campo `ordem` | ⬜ |
| RF-10 | MUST | Interruptor Rascunho/Publicado em todo conteúdo de listagem | Dado um item com `publicado = false`, quando o site é construído, então o item não aparece em nenhuma página pública nem no sitemap | ⬜ |
| RF-11 | MUST | Publicação sem intervenção do desenvolvedor | Dado o professor salvando qualquer conteúdo, quando o commit chega à branch principal, então o build e o deploy ocorrem automaticamente e o site reflete a mudança | ⬜ |
| RF-12 | MUST | Upload de imagem pelo painel (foto de perfil, imagem de linha de pesquisa) | Dado o professor no campo de imagem, quando envia um arquivo, então ele é gravado no repositório e exibido no site | ⬜ |
| RF-13 | SHOULD | CRUD de projetos de pesquisa | Dado o professor em Projetos, quando cria um projeto com título, período e financiador, então ele aparece na página Pesquisa | ⬜ |
| RF-14 | SHOULD | Campos em inglês opcionais por item (grupo recolhível "Versão em inglês") | Dado um item com o grupo EN preenchido, quando o visitante acessa a rota `/en` correspondente, então vê o conteúdo em inglês; quando o grupo está vazio, vê o conteúdo em português (decisão D-03) | ⬜ |
| RF-15 | COULD | CRUD de notícias | Dado o professor em Notícias, quando cria uma postagem com título, data, resumo e corpo, então ela aparece na listagem em ordem cronológica decrescente | ⬜ |
| RF-16 | WONT | Fluxo de aprovação por branch com preview antes de publicar | — (Editorial Workflow, plano pago do TinaCloud; ver NG-07 e R-05) | — |
| RF-17 | WONT | Importação automática de publicações (ORCID/Crossref/OpenAlex/BibTeX) | — (ver NG-03) | — |
| RF-37 | MUST | Gestão de scripts de código dentro da disciplina (lista `scripts[]`) | Dado o professor editando uma disciplina, quando acrescenta um script informando o título, colando o código no campo e escolhendo a linguagem (`python` por padrão), e salva, então o script aparece na página da disciplina com destaque de sintaxe e botão de copiar — agrupado sob a aula correspondente quando o campo `aula` casa com uma aula existente, e no grupo geral da disciplina quando `aula` está vazio ou não casa com nenhuma (F-13) | ⬜ |

#### Site público

| ID | Prioridade | Requisito | Critério de aceitação | Status |
|---|---|---|---|---|
| RF-20 | MUST | Home com identificação do professor, resumo de atuação e caminhos para Pesquisa, Ensino e Publicações | Dado um visitante na raiz, quando a página carrega, então vê nome, cargo, instituição, foto, uma síntese e links para as três seções principais | ⬜ |
| RF-21 | MUST | Página Sobre com biografia, formação, áreas de atuação, contato e links acadêmicos | Dado o perfil preenchido, quando o visitante abre Sobre, então vê todos os campos preenchidos e apenas eles — campos vazios não deixam rótulo órfão na página | ⬜ |
| RF-22 | MUST | Página Pesquisa listando linhas de pesquisa (e projetos, se houver) | Dado duas linhas publicadas, quando o visitante abre Pesquisa, então vê as duas na ordem definida | ⬜ |
| RF-23 | MUST | Página Ensino separando disciplinas atuais e anteriores | Dado disciplinas com status distintos, quando o visitante abre Ensino, então vê dois grupos rotulados, atuais primeiro | ⬜ |
| RF-24 | MUST | Página de disciplina com ementa, bibliografia, aulas, listas e materiais | Dada uma disciplina com 3 aulas e 2 listas, quando o visitante abre a página, então vê as 5 entradas com título, data (quando houver) e link que abre o arquivo no Drive em nova aba | ⬜ |
| RF-25 | MUST | Página Publicações agrupada por ano, decrescente | Dadas publicações de 2024 e 2026, quando o visitante abre a página, então vê 2026 antes de 2024, cada uma com autores, veículo e os links disponíveis (DOI, arXiv, PDF) | ⬜ |
| RF-26 | MUST | Site responsivo | Dado qualquer rota, quando aberta em 360 px de largura, então não há rolagem horizontal nem elemento cortado | ⬜ |
| RF-27 | MUST | Página 404 no idioma da rota, com caminho de volta | Dada uma URL inexistente, quando acessada, então a resposta é uma página 404 com navegação | ⬜ |
| RF-28 | MUST | Rotas em inglês sob `/en` com fallback para português por item | Dada uma publicação sem versão EN, quando o visitante abre `/en/publications`, então vê a entrada em português, com marcação discreta de idioma, e a página nunca fica vazia | ⬜ |
| RF-29 | MUST | Seletor de idioma no cabeçalho | Dado o visitante em `/ensino`, quando clica em EN, então vai para `/en/teaching` — a mesma página, não a home | ⬜ |
| RF-30 | MUST | SEO básico: `<title>`, meta description, canonical, `hreflang`, Open Graph, favicon, `sitemap.xml`, `robots.txt` | Dado o build de produção, quando se inspeciona o HTML de cada rota, então todos os elementos estão presentes e o sitemap lista todas as rotas públicas de ambos os idiomas, e nenhuma rascunho | ⬜ |
| RF-31 | SHOULD | Página CV com formação, experiência e link para o PDF do currículo | Dado o CV preenchido, quando o visitante abre a página, então vê o histórico e um link para o arquivo no Drive | ⬜ |
| RF-32 | SHOULD | Animações discretas de entrada e transição | Dadas as animações ativas, quando o visitante tem `prefers-reduced-motion` habilitado, então nenhuma animação de movimento é executada | ⬜ |
| RF-33 | COULD | Renderização de fórmulas matemáticas (LaTeX) em ementas e descrições | Dado um texto com `$E = mc^2$`, quando a página é construída, então a fórmula aparece renderizada | ⬜ |
| RF-34 | COULD | Feed RSS de notícias | — | ⬜ |
| RF-35 | WONT | Busca global no site | — (ver NG-06) | — |
| RF-36 | WONT | Modo escuro | — (avaliar após a entrega; não é requisito do MVP) | — |

### 5.2 Requisitos Não-Funcionais (RNF)

| ID | Categoria | Requisito | Meta mensurável |
|---|---|---|---|
| RNF-01 | Desempenho | Carregamento das páginas públicas | Lighthouse Performance mobile ≥ 90; LCP < 2,5 s em 4G simulado |
| RNF-02 | Desempenho | Peso de JavaScript enviado ao navegador | < 50 KB comprimido nas rotas sem animação; zero framework de UI no bundle |
| RNF-03 | Confiabilidade | Disponibilidade do site público | Depende apenas de assets estáticos na rede Cloudflare; nenhuma rota pública pode depender de execução de código em requisição |
| RNF-04 | Confiabilidade | Falha de build não derruba o site | Um build com erro mantém a versão anterior no ar e notifica o ADMIN |
| RNF-05 | Usabilidade | Curva de aprendizado do professor | Publica um item novo sozinho após uma sessão de treinamento de 30 min, apoiado pelo manual da §10.5 |
| RNF-06 | Usabilidade | Vocabulário do painel | Nenhum termo técnico de versionamento ou sistema de arquivos visível ao EDITOR |
| RNF-07 | Segurança | Controle de acesso | Escrita apenas por usuários autenticados no TinaCloud; segredos jamais no repositório (§7.6) |
| RNF-08 | Segurança | Superfície de ataque | Sem banco de dados, sem backend próprio, sem formulário público que escreva dados |
| RNF-09 | Manutenibilidade | Paridade de schema | Teste automatizado falha se o schema do Tina e o schema Zod do Astro divergirem em campos ou obrigatoriedade |
| RNF-10 | Manutenibilidade | Testes | Ver §11; suíte verde é pré-requisito de merge |
| RNF-11 | Portabilidade | Navegadores | Duas últimas versões de Chrome, Firefox, Safari e Edge; Safari iOS e Chrome Android |
| RNF-12 | Portabilidade | Ambiente de desenvolvimento | Reproduzível em Windows e Linux com Node LTS; nenhum passo manual fora do README |
| RNF-13 | Escalabilidade | Volume previsto | Até ~200 publicações, ~30 disciplinas e ~50 aulas por disciplina sem degradação perceptível de build ou navegação |
| RNF-14 | Custo | Operação | US$ 0,00/mês dentro dos planos gratuitos (Cloudflare Workers, TinaCloud Free) |
| RNF-15 | Acessibilidade | Conformidade | WCAG 2.1 AA nos itens verificáveis automaticamente; navegação completa por teclado; contraste mínimo 4.5:1 |
| RNF-16 | Versionamento | Histórico | Toda edição feita pelo painel gera um commit atribuível, com histórico completo recuperável |

### 5.3 Regras de Negócio (RN)

| ID | Regra | Origem/Justificativa |
|---|---|---|
| RN-01 | Conteúdo com `publicado = false` não aparece em nenhuma página pública, sitemap ou feed | Substitui o Editorial Workflow ausente no plano gratuito (D-04). A regra vale para o site — **não** para o repositório, que é público (ver D-04) |
| RN-02 | Publicações são ordenadas por ano decrescente; dentro do mesmo ano, pela ordem de cadastro invertida (mais recente primeiro) | `briefing.md` §10 |
| RN-03 | Uma disciplina é "atual" ou "anterior"; a transição é manual, feita pelo professor no campo `status` | Evita lógica de data que erraria a cada calendário acadêmico atípico |
| RN-04 | Aulas, listas e materiais são ordenados pela posição definida pelo professor na lista, não por data | Aula 12 pode ser reagendada sem virar a ordem do curso |
| RN-05 | Todo material didático é referenciado por URL externa, sem restrição de hospedeiro; o site não hospeda o arquivo — **exceto código-fonte, que fica no próprio conteúdo justamente para poder ser exibido** (`disciplinas.scripts[]`, RF-37) | NG-02, D-07 |
| RN-06 | Se um campo do grupo "Versão em inglês" estiver vazio, a rota `/en` exibe o valor em português correspondente | D-03; padrão herdado de `../docs/plano-i18n.md` |
| RN-07 | Campos factuais (DOI, arXiv, ano, links, imagens, e-mail) não são traduzíveis — existem uma única vez | Evita divergência entre idiomas em dado que não é texto |
| RN-08 | Nome de arquivo de conteúdo é gerado por template a partir de campos do formulário; nunca digitado pelo professor | RF-03 / RNF-06 |
| RN-09 | O português é o idioma canônico: todo item existe em PT; o inglês é opcional | D-03 |

### 5.4 Casos de Borda e Cenários de Falha (Fallbacks)

| ID | Cenário | Comportamento esperado | Mensagem ao usuário |
|---|---|---|---|
| F-01 | Campo obrigatório vazio no painel | O Tina bloqueia o salvamento e destaca o campo | "Este campo é obrigatório." |
| F-02 | Build falha após um salvamento do professor | A versão anterior do site permanece no ar; o ADMIN recebe notificação de falha; o conteúdo salvo permanece no repositório para correção | Nenhuma ao professor (o site dele continua no ar); alerta por e-mail ao ADMIN |
| F-03 | TinaCloud indisponível no momento da edição | O painel não abre; nada é perdido porque nada foi salvo; o site público segue no ar, pois não depende do TinaCloud | "Não foi possível conectar ao serviço de edição. Tente novamente em alguns minutos." |
| F-04 | Link do Google Drive quebrado ou sem permissão pública | O site continua exibindo o link (não há como validar em build time sem chamada externa); o manual instrui o professor a conferir o compartilhamento como "qualquer pessoa com o link" | Instrução no manual e texto de ajuda sob o campo de link |
| F-05 | Publicação sem DOI, sem arXiv e sem PDF | A entrada aparece apenas com metadados; nenhum botão de link vazio é renderizado | — |
| F-06 | Disciplina sem nenhuma aula cadastrada | A página existe com ementa e bibliografia; a seção Aulas exibe estado vazio explícito | "Nenhuma aula publicada ainda." |
| F-07 | Item sem versão em inglês na rota `/en` | Exibe o conteúdo em português com marcação discreta de idioma | Badge "in Portuguese" |
| F-08 | Imagem ausente (perfil sem foto, notícia sem imagem) | Layout degrada sem quebrar; nenhum espaço reservado vazio ou ícone de imagem quebrada | — |
| F-09 | Conteúdo salvo com formato inesperado que a validação Zod rejeita | O build falha de forma ruidosa e nomeia o arquivo e o campo problemático; cai em F-02 | Log de build: "content/publicacoes/x.md → campo `ano`: esperado número entre 1900 e 2100" |
| F-10 | Dois itens gerando o mesmo nome de arquivo | O Tina impede a criação duplicada; o template de nome inclui discriminador suficiente (ano + slug do título) | "Já existe um item com este nome." |
| F-11 | Professor exclui conteúdo por engano | O conteúdo permanece recuperável no histórico do Git pelo ADMIN | Manual: "conteúdo apagado pode ser recuperado — avise o responsável técnico" |
| F-12 | Cota do plano gratuito excedida (builds ou requisições) | O ADMIN é notificado; ver R-04 e R-06 | — |
| F-13 | Script com `aula` apontando para uma aula que não existe na disciplina | A página agrupa sob a aula os scripts cujo número casa e reúne os demais — os órfãos e os que nunca tiveram `aula` — num grupo geral da disciplina. O build não falha e nenhum script some da página; o script aparecer fora do lugar é o próprio aviso ao professor (RF-37) | — |

---

## 6. Escopo e Fases

### 6.1 Escopo do MVP

Lista fechada:

1. Site público em Astro estático com as rotas: Home, Sobre, Pesquisa, Ensino, página de disciplina, Publicações, 404.
2. Versão em inglês sob `/en` com fallback por item para o português.
3. Painel TinaCMS em `/admin`, autenticado por TinaCloud, com as coleções: Perfil, Linhas de pesquisa, Projetos, Disciplinas (com aulas, listas e materiais embutidos) e Publicações.
4. Interruptor Rascunho/Publicado em todo conteúdo de listagem.
5. Deploy automático GitHub → Cloudflare Workers a cada commit na branch principal.
6. Materiais didáticos referenciados por link do Google Drive.
7. Qualidade: responsividade, SEO básico, sitemap, Open Graph, favicon, acessibilidade básica, otimização de imagens.
8. Manual do professor (§10.5) e README de manutenção.

### 6.2 Roadmap de Fases

| Fase | Nome | Entregáveis | Critério de conclusão | Dependências |
|---|---|---|---|---|
| 0 | Setup e provisionamento | Repositório GitHub; projeto Astro + TypeScript + Tailwind; contas Cloudflare, TinaCloud e pasta no Drive; ferramentas de qualidade; README inicial | `npm run build` verde em máquina limpa a partir do README | — |
| 1 | Modelo de conteúdo | Schemas Zod (Astro) e Tina para as 5 coleções; teste de paridade; conteúdo placeholder representativo; `/admin` funcionando em desenvolvimento local | O professor consegue, localmente, criar e editar item de cada coleção pelo painel | Fase 0 |
| 2 | Pipeline de publicação ponta a ponta | Workers Builds ligado ao repositório; TinaCloud em produção; portões de conteúdo e de schema no CI e no build de deploy; notificação de falha de build | Um usuário **ADMIN** edita no `/admin` em produção e a mudança é publicada sozinha, com cada elo provado por artefato. A verificação do usuário **EDITOR** (professor) é da fase 5 | Fase 1 |
| 3 | Site público em português | Home, Sobre, Pesquisa, Ensino, disciplina, Publicações, 404; identidade visual; animações discretas | Todas as rotas navegáveis com o conteúdo placeholder, responsivas de 360 px a 1440 px | Fase 1 |
| 4 | Internacionalização | Roteamento i18n, dicionário de interface, grupo EN no schema, fallback por item, seletor de idioma, hreflang, sitemap bilíngue | M-07 atingida; fallback verificado item a item | Fase 3 |
| 5 | Polimento e entrega | SEO, Open Graph, favicon, acessibilidade, otimização de imagens, manual do professor, conta EDITOR do professor e matriz de permissões verificada, ciclo cronometrado, treinamento e validação assistida | Checklist §12 fechado; um usuário EDITOR edita no `/admin` em produção e a mudança aparece no site sem intervenção do ADMIN; M-01, M-02, M-04, M-05 atingidas | Fases 2, 3, 4 |

> **Por que a fase 2 vem antes do site público:** o maior risco do projeto não é layout, é o ciclo de publicação (TinaCloud + Workers Builds + permissões). Se ele não fechar, a arquitetura muda — e é preferível descobrir isso com conteúdo placeholder do que com o site inteiro pronto.

> **Por que a habilitação do EDITOR mudou para a fase 5 (2026-09-12).** Decisão do stakeholder, registrada em `docs/sabatinas/CHANGELOG_sabatina_recorte-sem-professor.md`: tudo que exige uma sessão com o professor passa para a fase 5, e o que não exige é executado antes. O motivo é de sequência, não de escopo — é preferível levar ao professor um site navegável do que gastar a sessão dele verificando um painel sobre um site que ainda não renderiza conteúdo. A fase 5 já era onde o professor aparecia no PRD (treinamento, M-01 e a remedição de M-02), e a habilitação do EDITOR passa a ser o primeiro passo dessa mesma sessão. **Nenhum requisito mudou — só onde ele é verificado.**

### 6.3 Fora de Escopo (desta versão)

| Item | Versão-alvo |
|---|---|
| Notícias/postagens | v1.1 (schema já previsto) |
| Página de CV completa | v1.1 |
| Importação ORCID/Crossref/OpenAlex/BibTeX; exportação BibTeX | v2 |
| Filtros e busca em publicações | v1.2 |
| Busca global no site | v2 |
| Modo escuro | a avaliar |
| Simuladores interativos, gráficos, notebooks | v2 — a arquitetura preserva a opção de ilhas React isoladas |
| Grupo de pesquisa, orientandos, colaboradores como coleções próprias | v1.2 |
| Analytics | a avaliar |
| Upload de PDFs para o próprio site | não previsto (NG-02) |

---

## 7. Arquitetura e Design Técnico

### 7.1 Visão Geral da Arquitetura

```text
┌──────────────┐
│  PROFESSOR   │
└──────┬───────┘
       │ login (OAuth TinaCloud)
       ▼
┌──────────────────────┐        ┌─────────────────┐
│  /admin              │───────▶│   TinaCloud     │
│  (SPA estática Tina, │  API   │  auth + GraphQL │
│   servida pelo site) │        └────────┬────────┘
└──────────────────────┘                 │ commit
                                         ▼
                                  ┌─────────────┐
                                  │   GitHub    │  ← única fonte de verdade do conteúdo
                                  │   (main)    │
                                  └──────┬──────┘
                                         │ push
                                         ▼
                          ┌──────────────────────────────┐
                          │  Cloudflare Workers Builds   │
                          │  astro build + tinacms build │
                          └──────────────┬───────────────┘
                                         ▼
                          ┌──────────────────────────────┐
                          │  Workers Static Assets       │
                          │  (HTML/CSS/JS/imagens)       │
                          └──────────────┬───────────────┘
                                         ▼
                                   SITE PÚBLICO

  Google Drive ──── URL do arquivo ────▶ conteúdo ────▶ link na página
```

Três propriedades desta arquitetura merecem registro explícito:

1. **Nenhuma rota pública executa código em requisição.** O site é servido como assets estáticos; o Worker não roda por página. Isso mantém as requisições fora da cota de 100 mil/dia do plano gratuito e elimina uma classe inteira de falhas em produção.
2. **O site público não depende do TinaCloud em runtime.** Se o TinaCloud cair, apenas a edição para; o site segue no ar (F-03).
3. **O conteúdo é o repositório.** Não existe estado fora do Git — o que dá versionamento, backup e recuperação de graça (M-08, RNF-16).

### 7.2 Stack Tecnológica

| Camada | Tecnologia | Versão | Justificativa da escolha |
|---|---|---|---|
| Framework | Astro | 5.x (fixar exata na fase 0) | O site é publicação, não aplicação. Astro gera HTML estático sem enviar framework de UI ao navegador; suporta ilhas isoladas se um simulador for necessário no futuro (`briefing.md` §3) |
| Linguagem | TypeScript | 5.x | Schemas de conteúdo tipados; erro de campo aparece no editor, não em produção |
| Estilos | Tailwind CSS | 4.x | Consistência com o projeto irmão `../grav`; estilo colocalizado, sem CSS morto acumulado |
| CMS | TinaCMS (`tinacms`, `@tinacms/cli`, `@tinacms/astro`) | última na fase 0 | Integração oficial com Astro; painel por formulários com vocabulário configurável; conteúdo permanece em arquivos versionados |
| Autenticação/editores | TinaCloud (plano Free) | — | 2 usuários e 2 papéis no gratuito — exatamente ADMIN + EDITOR (`briefing.md` §13). Dispensa função OAuth própria |
| Hospedagem | Cloudflare Workers (Static Assets) + Workers Builds | — | Deploy automático a partir do GitHub; assets estáticos ilimitados no plano gratuito |
| Repositório/CI | GitHub + GitHub Actions | — | Versionamento do conteúdo; Actions roda testes e paridade de schema antes do merge |
| Animações | `motion` (API vanilla) ou GSAP | a decidir na fase 3 | Movimento discreto sem introduzir React no bundle |
| Testes | Vitest + axe-core; Lighthouse na fase 5 | — | Ver §11 |
| Armazenamento de arquivos | Google Drive | — | PDFs e slides fora do repositório (`briefing.md` §6) |
| Node | LTS ativa | fixar na fase 0 (`.nvmrc`) | Fixada em `.nvmrc` e na configuração do Workers Builds |

#### Decisões arquiteturais registradas

| ID | Decisão | Alternativa rejeitada | Motivo |
|---|---|---|---|
| D-01 | Astro estático (`output: 'static'`), sem adapter e sem SSR | Astro em modo servidor no Workers | Assets estáticos são ilimitados no plano gratuito e não executam código por requisição; SSR só se justificaria pelo visual editing (D-02) |
| D-02 | Painel por formulários; **sem** visual editing | Visual editing do Tina | O visual editing exige `output: 'server'`, adapter, ilhas Tina por página e consumo de cota do Worker. O ganho — clicar no texto — não paga a complexidade e o risco. O fluxo do briefing (login → formulário → publicar) é atendido integralmente |
| D-03 | i18n por grupo "Versão em inglês" recolhível **dentro do mesmo arquivo**, com fallback por campo | Pastas `pt/` e `en/` espelhadas (padrão do LaFiM com Decap) | Um único editor: um arquivo por item elimina o risco de par órfão e mantém um formulário só. O fallback vira "campo vazio ⇒ usa PT", mais simples que merge por nome de arquivo |
| D-04 | Rascunho como campo `publicado` no schema | Editorial Workflow do TinaCloud | Indisponível no plano gratuito (apenas Team Plus, US$ 41/mês). O campo entrega o essencial: conteúdo pela metade não vaza para o site. **Consequência desde 2026-09-01:** com o repositório público, `publicado: false` esconde do *site*, não do *GitHub* — o arquivo e todo o histórico de edição ficam legíveis por qualquer pessoa |
| D-05 | Aulas, listas, materiais, bibliografia e **scripts** como listas embutidas no arquivo da disciplina | Coleção `aulas` separada com referência à disciplina | O professor abre a disciplina e vê tudo num lugar só, sem escolher a disciplina a cada aula. Consequência aceita: aula não tem página própria — se um dia precisar (texto longo, fórmulas, vídeo), migra-se para coleção separada. `scripts[]` entrou em 2026-09-04 pela sabatina de scripts Python (RF-37); é a quinta lista sob esta decisão |
| D-06 | Zod (Astro) é o portão de validação; Tina é a interface de entrada; paridade garantida por teste | Confiar apenas no schema do Tina | Dois schemas descrevem o mesmo conteúdo; divergência silenciosa produz build quebrado que o professor não sabe diagnosticar (F-09, RNF-09) |
| D-07 | Campo de material é uma **URL livre**, agnóstica ao hospedeiro | Campo acoplado ao Google Drive (validação de domínio, seletor de arquivos do Drive) | Decisão do stakeholder em 2026-09-01: o que importa é o professor ter um link, não onde ele hospedou. O Drive vira recomendação do manual, não dependência de arquitetura — o que também elimina o acoplamento a uma conta Google específica |

> Cada decisão acima deve virar um ADR curto em `docs/adr/` na fase em que for implementada.

### 7.3 Modelo de Dados

Conteúdo em arquivos Markdown com frontmatter, em `content/` na raiz do projeto. Todo item de coleção de listagem possui `publicado: boolean` (RN-01) e um grupo `en` opcional (RN-06, RN-09).

**`perfil` — singleton (`content/perfil/index.md`)**

| Campo | Tipo | Obrig. | Traduzível | Observação |
|---|---|---|---|---|
| `nome` | string | ✔ | — | |
| `cargo` | string | ✔ | ✔ | ex.: Professor Adjunto |
| `instituicao` | string | ✔ | ✔ | |
| `departamento` | string | | ✔ | |
| `foto` | imagem | | — | armazenada no repositório |
| `bio` | rich-text | ✔ | ✔ | corpo do arquivo |
| `resumo_home` | string | ✔ | ✔ | 1–2 frases exibidas na Home |
| `formacao[]` | lista de objetos | | ✔ (título) | `{ grau, curso, instituicao, ano }` |
| `areas[]` | lista de string | | ✔ | |
| `email` | string | ✔ | — | ver §9 (LGPD) |
| `links` | objeto | | — | `lattes, orcid, scholar, arxiv, researchgate, github, institucional` — todos opcionais |
| `cv_url` | url | | — | link do Drive |

**`linhas-pesquisa` — pasta (`content/linhas-pesquisa/*.md`)**

`titulo` ✔ · `ordem` (número, define a exibição) · `resumo` ✔ · `corpo` (rich-text) · `imagem` · `publicado` ✔ · grupo `en` (`titulo`, `resumo`, `corpo`).

**`projetos` — pasta (`content/projetos/*.md`)**

`titulo` ✔ · `periodo` (`{ inicio, fim? }`) · `financiador` · `status` (`em andamento` | `concluído`) · `descricao` ✔ · `colaboradores[]` (string livre no MVP) · `linha_relacionada` (referência a `linhas-pesquisa`, opcional) · `publicado` ✔ · grupo `en`.

**`disciplinas` — pasta (`content/disciplinas/*.md`)**

| Campo | Tipo | Obrig. | Observação |
|---|---|---|---|
| `nome` | string | ✔ | ex.: Mecânica Clássica |
| `codigo` | string | | ex.: FIS0123 |
| `semestre` | string | ✔ | formato livre, ex.: 2026.2 |
| `status` | enum `atual` \| `anterior` | ✔ | transição manual (RN-03) |
| `descricao` | string | | resumo curto para a listagem |
| `ementa` | rich-text | | |
| `bibliografia[]` | lista de objetos | | `{ referencia, url? }` |
| `aulas[]` | lista de objetos | | `{ numero, titulo, data?, descricao?, url }` |
| `listas[]` | lista de objetos | | `{ titulo, data_entrega?, url }` |
| `materiais[]` | lista de objetos | | `{ titulo, tipo (slides/notas/complementar), descricao?, url }` |
| `links[]` | lista de objetos | | `{ titulo, url }` — simulações, vídeos, páginas externas |
| `scripts[]` | lista de objetos | | `{ titulo, descricao?, linguagem (python/r/matlab/bash/outro), codigo, aula?, url? }` — `codigo` é o código-fonte colado no próprio conteúdo (RN-05, RF-37); `linguagem` tem `python` como padrão; `aula` é o número da aula correspondente, sem integridade referencial (F-13); `url` aponta o arquivo original, se houver |
| `publicado` | boolean | ✔ | |
| `en` | grupo | | `nome`, `descricao`, `ementa` |

Nome de arquivo gerado por template: `{semestre}-{slug(nome)}.md` (RN-08).

**`publicacoes` — pasta (`content/publicacoes/*.md`)**

| Campo | Tipo | Obrig. | Observação |
|---|---|---|---|
| `titulo` | string | ✔ | |
| `autores[]` | lista de string | ✔ | ordem preservada; o nome do professor é destacado na exibição |
| `ano` | número | ✔ | validado entre 1900 e 2100 (F-09) |
| `veiculo` | string | | periódico, conferência ou editora |
| `tipo` | enum | ✔ | `artigo` \| `preprint` \| `capítulo` \| `livro` \| `anais` \| `tese` \| `outro` |
| `doi` | string | | |
| `arxiv` | string | | |
| `pdf_url` | url | | link do Drive ou repositório institucional |
| `resumo` | rich-text | | |
| `palavras_chave[]` | lista de string | | |
| `destaque` | boolean | | exibida na Home |
| `publicado` | boolean | ✔ | |
| `en` | grupo | | `resumo` (título e autores não se traduzem — RN-07) |

Nome de arquivo: `{ano}-{slug(titulo)}.md`.

**`noticias` — pasta (v1.1, schema previsto):** `titulo` · `data` · `imagem` · `resumo` · `corpo` · `tags[]` · `publicado` · grupo `en`.

**Ciclo de vida dos dados:** criação pelo painel → commit no GitHub → build → publicação. Exclusão remove o arquivo da branch principal, mas o conteúdo permanece no histórico do Git indefinidamente (F-11, M-08). Não há arquivamento automático: disciplinas antigas mudam para `status: anterior` e continuam públicas — é justamente o acervo que se quer preservar.

### 7.4 Integrações e APIs Externas

| Serviço | Finalidade | Autenticação | Limites/custos | Plano B se falhar |
|---|---|---|---|---|
| TinaCloud | Autenticação dos editores e API de conteúdo do painel | OAuth do TinaCloud; `clientId` público + token de leitura em variável de ambiente | Free: 2 usuários, 2 papéis, assets ≤ 100 MB, sem Editorial Workflow | Migrar para Decap CMS (gratuito, sem limite de usuários) mantendo o mesmo conteúdo em arquivos — o modelo de dados é agnóstico ao CMS (R-03) |
| GitHub | Repositório e histórico do conteúdo | App do TinaCloud com acesso ao repositório | Gratuito — o repositório é público desde 2026-09-01 | Nenhum — é a fonte de verdade |
| Cloudflare Workers Builds | Build e deploy automático | Integração GitHub ↔ Cloudflare | Free: 3.000 min de build/mês, 1 build simultâneo, teto de 20 min por build (verificado 2026-09-01) | Trocar por GitHub Actions + `wrangler deploy` (mesma conta, sem custo) |
| Hospedeiro de arquivos (Google Drive recomendado) | Armazenamento de PDFs, slides e listas | Do próprio hospedeiro; exige link público | Cota da conta usada pelo professor | Nenhum acoplamento a mitigar: o campo é uma URL livre (D-07), qualquer hospedeiro serve |

### 7.5 Estrutura de Diretórios do Projeto

```text
haroldo/
├── README.md               # Visão geral, instalação, como rodar, como fazer deploy
├── PRD.md                  # Este documento
├── briefing.md             # Documento de origem
├── astro.config.mjs        # Astro: i18n, integrações, sitemap
├── tina/
│   └── config.ts           # Schema do painel (rótulos em pt-BR, vocabulário acadêmico)
├── wrangler.toml           # Configuração do Cloudflare Workers (assets estáticos)
├── package.json
├── tsconfig.json
├── .nvmrc                  # Versão do Node fixada
├── .env.example            # Variáveis documentadas (NUNCA commitar .env real)
├── .github/workflows/      # CI: lint, testes, paridade de schema, build
├── content/                # ← domínio do PROFESSOR (via painel)
│   ├── perfil/
│   ├── linhas-pesquisa/
│   ├── projetos/
│   ├── disciplinas/
│   └── publicacoes/
├── public/
│   ├── uploads/            # Imagens enviadas pelo painel
│   ├── favicon.svg
│   └── robots.txt
├── src/                    # ← domínio do DESENVOLVEDOR
│   ├── content.config.ts   # Schemas Zod — portão de validação (D-06)
│   ├── components/
│   ├── layouts/
│   ├── pages/
│   │   ├── index.astro, sobre.astro, pesquisa.astro, ensino.astro,
│   │   ├── ensino/[slug].astro, publicacoes.astro, 404.astro
│   │   └── en/            # espelho das rotas em inglês
│   ├── i18n/               # dicionários pt/en + utilitários de fallback
│   ├── lib/
│   └── styles/
├── tests/                  # Espelha src/ — Vitest
├── docs/
│   ├── adr/                # Decisões D-01..D-06 e futuras
│   ├── CHANGELOG.md
│   └── manual-do-professor.md
└── scripts/                # Utilitários (paridade de schema, sitemap se necessário)
```

A fronteira é explícita: o professor altera apenas `content/` e `public/uploads/`, sempre pelo painel; o desenvolvedor é dono de todo o resto (`briefing.md` §15).

### 7.6 Configuração e Segredos

- **Variáveis de ambiente** (documentadas em `.env.example`): `TINA_CLIENT_ID` (público), `TINA_TOKEN` (token de leitura do TinaCloud), `TINA_BRANCH`, `PUBLIC_SITE_URL`.
- `TINA_TOKEN` vive exclusivamente em variável de ambiente — no `.env` local (fora do versionamento) e nas variáveis do Cloudflare Workers Builds e do GitHub Actions. Nunca em arquivo commitado.
- Valores de configuração do site (título, idiomas, rótulos de navegação, URL canônica) ficam em `src/lib/config.ts` e nos dicionários de `src/i18n/` — nunca espalhados pelos componentes.
- Nenhum segredo é necessário no navegador: o site público é estático e não faz chamada autenticada.

---

## 8. Experiência do Usuário (UX)

### 8.1 Fluxos Principais

**Fluxo A — Professor publica uma aula nova (o caso mais frequente)**

```text
1. Faz upload do PDF no Google Drive e copia o link de compartilhamento
2. Acessa site/admin → login TinaCloud
3. Disciplinas → "Mecânica Clássica — 2026.2"
4. Seção "Aulas" → [+ Adicionar aula]
5. Preenche: número, título, data, link
6. Salvar
7. Em poucos minutos a aula aparece na página da disciplina
```

Sete passos, nenhum termo técnico, nenhuma decisão sobre arquivo ou pasta.

**Fluxo B — Professor cadastra uma publicação**

```text
Publicações → [Adicionar publicação] → título, autores, ano, veículo, tipo,
DOI/arXiv/PDF (opcionais) → publicado ✔ → Salvar
→ entra automaticamente sob o ano correto na página pública
```

**Fluxo C — Professor prepara conteúdo sem publicar**

```text
Cria o item → deixa "Publicado" desmarcado → salva quantas vezes quiser
→ nada aparece no site → quando pronto, marca "Publicado" → vai ao ar
```

**Fluxo D — Aluno busca a lista de exercícios (celular)**

```text
Home → Ensino → disciplina do semestre → seção "Listas" → toca em "Lista 03"
→ abre o PDF no Drive
```

Meta: quatro toques da home ao arquivo.

**Fluxo E — Falha de build após uma edição**

```text
Professor salva → build falha → site continua no ar com a versão anterior
→ ADMIN recebe notificação → corrige o conteúdo ou o schema → build volta a passar
```

O professor não é exposto ao erro; ver F-02.

### 8.2 Interface

**Painel (`/admin`).** Menu lateral com as coleções nomeadas em vocabulário acadêmico:

```text
Olá, Professor.

  👤 Perfil                  [Editar]
  🔬 Linhas de pesquisa      3 linhas          [Gerenciar]
  🧪 Projetos                2 projetos        [Gerenciar]
  📚 Disciplinas             4 disciplinas     [Gerenciar]
  📄 Publicações            37 artigos         [Gerenciar]
```

Regras de composição dos formulários:
- Todo campo tem rótulo em português e, quando não for autoevidente, um texto de ajuda de uma linha (ex.: no campo de link: *"Cole aqui o link do Google Drive. Confira se o compartilhamento está como 'qualquer pessoa com o link'."*).
- Campos opcionais são visivelmente opcionais; o formulário nunca exige preencher o que não existe.
- O grupo "Versão em inglês (opcional)" fica recolhido por padrão, ao final do formulário — quem não vai traduzir não é obrigado a olhar para ele.
- O interruptor "Publicado" fica no topo do formulário, não escondido no rodapé.

**Site público.** Direção visual: minimalista e moderno, tipografia forte como elemento principal, movimento discreto com `motion`/GSAP — nunca decorativo a ponto de atrasar a leitura. Referências visuais fornecidas pelo stakeholder em 2026-09-14 (Q-04, `ref/`) e adaptadas ao projeto em **`docs/identidade-visual.md`** — paleta monocromática, Helvetica no texto e Archivo auto-hospedada nos títulos e numerais, réguas de 1 px, numeral fino só em sequência ou contagem, movimento só em CSS; é a especificação que a fase 3 implementa. Restrições que a identidade deve respeitar, independentemente da referência escolhida: contraste AA, `prefers-reduced-motion` honrado (RF-32), leitura confortável em 360 px, e nenhuma animação bloqueando a exibição do conteúdo.

**Mensagens de erro.** Ao professor: português claro, sem jargão, sempre com a ação seguinte ("Tente novamente em alguns minutos"). Ao desenvolvedor (logs de build): específicas e rastreáveis — arquivo, campo e valor esperado (F-09).

### 8.3 Acessibilidade e Idioma

- **Idiomas:** português (canônico, na raiz) e inglês (`/en`), com fallback por item (RN-06). Sem detecção automática de idioma — a troca é explícita pelo seletor, como no padrão do LaFiM.
- **Datas:** formatadas conforme o locale da rota (`pt-BR`: 15/03/2026; `en`: March 15, 2026). Em conteúdo estruturado e no frontmatter, sempre ISO (`2026-03-15`).
- **Acessibilidade:** HTML semântico; um `<h1>` por página com hierarquia consistente; foco visível; navegação completa por teclado; texto alternativo obrigatório em imagens de conteúdo; contraste ≥ 4.5:1; `lang` correto no elemento raiz de cada árvore de idioma; links externos identificados como tal.

---

## 9. Segurança, Privacidade e Conformidade

| Aspecto | Definição |
|---|---|
| **Controle de acesso** | Matriz abaixo. Dois papéis, conforme o limite do plano gratuito do TinaCloud |
| **Dados sensíveis** | O site publica dados profissionais deliberadamente públicos (nome, cargo, e-mail institucional, produção acadêmica). Nenhum dado de terceiros é coletado: não há formulário, comentário, cadastro, cookie de sessão ou analytics no MVP |
| **Retenção de dados** | Conteúdo permanece indefinidamente; o histórico do Git preserva versões anteriores mesmo após exclusão |
| **Logs e auditoria** | Cada edição é um commit atribuível no GitHub — quem, o quê, quando. Logs de build ficam no painel do Cloudflare |
| **Conformidade (LGPD)** | O e-mail exibido deve ser institucional, nunca pessoal. Nomes de colaboradores e orientandos só entram no site com anuência — registrar essa instrução no manual do professor. Sem coleta de dados de visitantes, não há base legal a documentar nem política de privacidade obrigatória; se analytics for adicionado depois, esta seção precisa ser revista |
| **Backup e recuperação** | O repositório GitHub é o backup do conteúdo (clonável, com histórico completo). Restauração = `git revert` ou recuperação de arquivo por um ADMIN. **Teste de restauração obrigatório na fase 5**: apagar um item pelo painel e recuperá-lo do histórico |

**Matriz papel × permissão**

| Ação | ADMIN (desenvolvedor) | EDITOR (professor) |
|---|---|---|
| Editar conteúdo pelo painel | ✔ | ✔ |
| Publicar / despublicar conteúdo | ✔ | ✔ |
| Enviar imagens | ✔ | ✔ |
| Alterar schema do painel | ✔ | ✘ |
| Alterar código, estilos, layout | ✔ | ✘ |
| Acessar o repositório GitHub | ✔ | ✘ |
| Gerenciar contas e infraestrutura | ✔ | ✘ |
| Configurar deploy | ✔ | ✘ |

---

## 10. Padrões de Qualidade de Código e Documentação

> **Esta seção é normativa.** Código que não a segue não vai para a branch principal.
> O template original pressupõe Python; abaixo, a tradução das mesmas exigências para TypeScript/Astro.

### 10.1 Cabeçalho Obrigatório de Arquivos

Todo módulo `.ts` e componente `.astro` começa com:

```ts
/**
 * ============================================================================
 *  Arquivo      : publications.ts
 *  Projeto      : Site Pessoal Acadêmico — Prof. Haroldo
 *  Descrição    : Agrupa e ordena publicações por ano para a página pública.
 *                 Isola a regra RN-02 do PRD do componente que a renderiza.
 *  Autor        : [Nome]
 *  Criado em    : AAAA-MM-DD
 *  Atualizado em: AAAA-MM-DD
 *  Versão       : 0.1.0
 *
 *  Dependências : astro:content
 *  Entradas     : coleção `publicacoes` já validada pelo Zod
 *  Saídas       : lista de grupos { ano, itens[] } em ordem decrescente
 *  Uso          : const grupos = agruparPorAno(await getCollection('publicacoes'))
 *
 *  Notas        : itens com `publicado: false` são filtrados antes (RN-01)
 * ============================================================================
 */
```

### 10.2 Docstrings de Funções e Componentes

- Toda função exportada e todo componente `.astro` público tem TSDoc: o que faz, `@param`, `@returns`, `@throws` quando aplicável.
- Componentes documentam suas props e o comportamento com props ausentes.
- Funções privadas triviais (< 5 linhas, nome autoexplicativo) podem omitir.

```ts
/**
 * Resolve um campo traduzível com fallback para o português.
 *
 * Implementa a RN-06: se o valor em inglês estiver ausente ou vazio,
 * devolve o valor em português — a rota /en nunca fica sem conteúdo.
 *
 * @param item Item da coleção, com o grupo opcional `en`.
 * @param campo Nome do campo a resolver.
 * @param locale Locale da rota atual.
 * @returns O valor no idioma pedido, ou o valor em português.
 */
```

### 10.3 Comentários no Código

- Comentário explica **por quê**, não **o quê**.
- Toda regra de negócio implementada referencia o identificador do PRD (`// RN-04: ordem definida pelo professor, não por data`). Isso mantém código e PRD rastreáveis um ao outro.
- Marcadores: `// TODO(autor):`, `// FIXME(autor):`, `// HACK(autor):`, `// NOTE:`.
- Proibido código comentado morto na branch principal.

### 10.4 Convenções Gerais

| Item | Padrão |
|---|---|
| Estilo | Prettier (com plugin Astro); lint com ESLint + `eslint-plugin-astro` |
| Type hints | `strict: true` no `tsconfig`; `any` proibido em código de produção |
| Idioma dos identificadores | **Código em inglês**; **conteúdo, rótulos de painel e textos de interface em português**. Campos de frontmatter em português, para casar com o vocabulário do painel. Não misturar dentro de uma mesma camada |
| Tamanho de componentes | Alvo < 150 linhas; acima disso, extrair |
| Constantes mágicas | Proibidas — extrair para `src/lib/config.ts` ou dicionário i18n |
| Strings de interface | Proibidas hardcoded em componente — sempre pelo dicionário `src/i18n/` (pré-requisito de M-07) |
| Commits | Conventional Commits (`feat:`, `fix:`, `docs:`, `test:`, `refactor:`, `chore:`) |
| Commits do painel | Gerados pelo Tina, sem esse padrão — aceitável e esperado; não são commits de código |

### 10.5 Documentação do Projeto

| Documento | Conteúdo mínimo | Quando atualizar |
|---|---|---|
| `README.md` | O que é, requisitos, instalação, `npm run dev`, como rodar o painel local, como fazer deploy, troubleshooting | A cada mudança de uso ou instalação |
| `PRD.md` | Este documento | A cada mudança de escopo ou requisito |
| `docs/manual-do-professor.md` | **Entregável da fase 5.** Em português, com capturas de tela, sem jargão: como entrar, como adicionar publicação, como adicionar aula, como usar o Google Drive corretamente, o que significa "Publicado", o que fazer quando algo não aparece | A cada mudança no painel |
| `docs/CHANGELOG.md` | Keep a Changelog | A cada release |
| `docs/adr/` | Decisões D-01..D-06 e futuras | A cada decisão significativa |
| `.env.example` | Todas as variáveis com descrição | A cada nova variável |

---

## 11. Estratégia de Testes

| Nível | Escopo | Ferramenta | Meta de cobertura |
|---|---|---|---|
| Unitário | Lógica pura: agrupamento e ordenação de publicações (RN-02), ordenação de aulas (RN-04), filtro de rascunhos (RN-01), fallback i18n (RN-06), formatação de datas por locale, geração de slug | Vitest | ≥ 80% dos módulos de `src/lib/` e `src/i18n/` |
| Contrato de schema | Paridade entre `tina/config.ts` e `src/content.config.ts`: mesmos campos, mesma obrigatoriedade, mesmos enums | Vitest (script de paridade, D-06/RNF-09) | 100% das coleções |
| Validação de conteúdo | Todo arquivo em `content/` passa pelo Zod | `astro build` no CI | Bloqueia merge |
| Integração | Rotas geradas: cada disciplina publicada gera página; nenhuma rascunho aparece no sitemap; toda rota PT tem par EN | Vitest sobre o `dist/` do build | Fluxos principais |
| Acessibilidade | Violações críticas em todas as rotas | axe-core | Zero críticas |
| End-to-end (manual, roteirizado) | Fluxos A, B, C e E da §8.1 executados em produção pelo usuário EDITOR | Roteiro em `docs/` com resultado registrado | Casos de uso do MVP |
| Desempenho | Lighthouse mobile nas rotas Home, Disciplina e Publicações | Lighthouse | M-04, M-05 |

**Regras:**
- Todo bug corrigido ganha um teste que o reproduz.
- Testes determinísticos: nada de dependência de data corrente, rede real ou ordem de execução. Testes que envolvem "semestre atual" recebem a data por parâmetro.
- Cada cenário de falha da §5.4 que seja verificável em código (F-01, F-05, F-06, F-07, F-08, F-09, F-10) tem teste correspondente.
- **Fixtures reais:** os testes de conteúdo usam arquivos de `content/` de verdade, não frontmatter sintético inventado no teste.

---

## 12. Checklist de Implementação

### 📊 Progresso Geral

| Fase | Itens concluídos | Status |
|---|---|---|
| Fase 0 — Setup e provisionamento | 10/10 | 🟢 Concluída |
| Fase 1 — Modelo de conteúdo | 10/10 | 🟢 Concluída |
| Fase 2 — Pipeline de publicação | 5/5 | 🟢 Concluída |
| Fase 3 — Site público (PT) | 0/12 | 🟡 Em andamento |
| Fase 4 — Internacionalização | 0/8 | ⬜ Não iniciada |
| Fase 5 — Polimento e entrega | 0/17 | ⬜ Não iniciada |

Legenda: ⬜ Não iniciada · 🟡 Em andamento · 🟢 Concluída · 🔴 Bloqueada

### Fase 0 — Setup e Provisionamento
- [x] Repositório GitHub criado com `.gitignore` adequado — plano 010 (`researchgroups-ufma/haroldo-page`; criado privado, **tornado público em 2026-09-01** por necessidade do projeto). Varredura de exposição na virada: nenhum `.env`, `lattes.pdf`, chave ou token em qualquer commit da história; `.env.example` versionado com os campos vazios
- [x] Projeto Astro + TypeScript + Tailwind inicializado; versões fixadas em `package.json` e `.nvmrc` — plano 002 (`astro@5.18.2`, `tailwindcss@4.3.3`, `typescript@5.9.3`, Node 24)
- [x] Estrutura de diretórios criada conforme §7.5 — plano 003 (14 `.gitkeep` versionados)
- [x] Conta/projeto TinaCloud criado e vinculado ao repositório — plano 011 (plano Free, vinculado a `researchgroups-ufma/haroldo-page` na `main`, GitHub App restrito a esse repositório; credenciais validadas contra o content API com canários de falsificabilidade; 1 de 2 usuários ocupados)
- [x] Conta Cloudflare com Worker criado — `wrangler.toml` no plano 007; Worker publicado no plano 012 em <https://haroldo-page.and-near.workers.dev> (versão `85adc91c`, raiz 200, rota inexistente 404, custo US$ 0,00)
- [x] Convenção de link de material definida — URL livre (D-07); Drive recomendado no manual, sem dependência de conta
- [x] `.env.example` criado e documentado — plano 006 (`TINA_CLIENT_ID`, `TINA_TOKEN`, `TINA_BRANCH`, `PUBLIC_SITE_URL`)
- [x] `README.md` inicial (instalação + como rodar) — plano 009 (`9dc42c7`, 205 linhas; 17 pontos verificados sem afirmação falsa; revisão final do usuário)
- [x] Prettier, ESLint e Vitest configurados; CI do GitHub Actions rodando — Prettier e ESLint (plano 004), Vitest (plano 005), workflow (plano 008); primeira execução verde em 2026-09-01, `Success` em 48s sobre `9dc42c7` (plano 010)
- [x] Q-03 respondida (limite de minutos de build do plano gratuito) e registrada — 3.000 min/mês, verificado 2026-09-01

### Fase 1 — Modelo de Conteúdo
- [x] `src/content.config.ts` com schemas Zod das 5 coleções (§7.3) — plano 016 (`462ffb4`)
- [x] `tina/config.ts` com as 5 coleções, rótulos em português e textos de ajuda — plano 017 (`8a58afb`); vocabulário acadêmico verificado no painel (RF-03), ajuda em todo campo não óbvio
- [x] Campo `publicado` em todas as coleções de listagem (RN-01) — plano 017; ausente em `perfil`, que é singleton. `defaultItem: { publicado: false }` para o item novo não nascer inválido
- [x] Grupo "Versão em inglês (opcional)" nas coleções traduzíveis (RN-06) — plano 018 (`6e5cb1f`); grupo `en` opcional nas cinco coleções, em paridade entre `src/content.config.ts` e `tina/config.ts`; `publicacoes` traduz só `resumo` (RN-07); decisões de `projetos` (`titulo`/`descricao`) e de `perfil.formacao[]` (`grau`/`curso`) registradas na Evidência do plano
- [x] Templates de nome de arquivo configurados (RN-08) — plano 017; `{semestre}-{slug(nome)}.md` e `{ano}-{slug(titulo)}.md` conforme o PRD, `{slug(titulo)}.md` para `linhas-pesquisa` e `projetos`, que o PRD não prescreve. Verificado criando um item de cada coleção pelo painel
- [x] Teste de paridade de schema passando (D-06) — plano 019 (`6a42330`); `tests/content/paridade-schema.test.ts` compara campos, obrigatoriedade, enums, grupo `en` e listas embutidas por introspecção do Zod 4 contra a árvore `fields` do Tina, provado falsificável nos dois sentidos. Roda no CI (`npm run test:coverage`), o que fecha a mitigação do risco R-02. Corrigiu a divergência real de `projetos.linha_relacionada` (o Tina grava o id com pasta e extensão; o `glob()` do Astro espera sem) do lado do Zod, por `normalizeLinhaRelacionadaId`
- [x] Conteúdo placeholder representativo: 1 perfil, 2 linhas, 2 projetos, 2 disciplinas (uma com 5 aulas), 6 publicações em 3 anos — plano 020 (`aa9a7cf`); os 13 arquivos criados **pelo painel**, com os nomes saindo dos templates da RN-08. Perfil com os dados reais do Apêndice C; as 6 publicações inventadas e marcadas de forma redundante (`[EXEMPLO]` no título, `[CONTEÚDO DE EXEMPLO]` no texto, `exemplo.invalid` nos URLs, `10.0000/` nos DOIs), porque o repositório é público e elas ficam atribuídas a uma pessoa real. Fechou a ponta herdada do 019: `getEntry()` resolve de fato depois de `normalizeLinhaRelacionadaId`
- [x] `/admin` funciona localmente e edita todas as coleções — plano 021, critério de conclusão
      da fase (§6.2) demonstrado pelo orquestrador: item criado **e** editado pelo painel em
      cada uma das cinco coleções, com o arquivo gravado conferido a cada save. Os quatro itens
      criados (fora o singleton `perfil`) foram removidos depois da verificação por serem
      duplicatas descartáveis num repositório público; as quatro edições em item existente
      permanecem, e o `perfil` voltou ao estado do HEAD depois de editado e revertido pelo
      próprio painel. Ver Evidência do plano 021
- [x] Testes unitários da fase escritos e passando — soma dos planos 016, 018, 019 e 022: suíte
      em **107 testes, 4 arquivos, cobertura 100%** (`npm run test:coverage`, medido no plano
      021), acima da meta de 80% da §11; `thresholds` impostos no `vitest.config.ts` desde antes
      deste plano
- [x] Lista `scripts[]` em `disciplinas` (RF-37): schema Zod + Tina e paridade entre os dois — plano 022 (`88f1c75`); seis campos conforme a sabatina, `linguagem` obrigatória dos dois lados com `ui.defaultItem` em vez de `.default()` no Zod, para não afrouxar a classificação de obrigatoriedade do teste de paridade. **R-13 verificado exercitando o painel:** o `js-yaml` grava `codigo` como block scalar `|-` e o round-trip é byte-idêntico (323 bytes, indentação preservada linha a linha, linha em branco e aspas intactas). A renderização continua na fase 3

### Fase 2 — Pipeline de Publicação
- [x] Workers Builds conectado ao repositório, build automático no push — **2026-09-11**, plano 025: push `ab0d1f8` disparou build sozinho (`ace5b1b9`, 2m02s), publicando a versão `1132cea1`
- [x] Variáveis de ambiente configuradas no Cloudflare e no GitHub — **metade do Cloudflare feita em 2026-09-11** (plano 025): `TINA_CLIENT_ID` e `PUBLIC_SITE_URL` como variáveis e `TINA_TOKEN` como segredo, em *Settings → Build → Build variables and secrets* — a seção de **build**, não a de runtime, que a plataforma recusa num Worker só de assets. **Metade do GitHub feita em 2026-09-04**, antecipada por necessidade: `TINA_CLIENT_ID` e `TINA_TOKEN` viraram secrets e o workflow passou a injetá-los no passo de build (`82fb4de`). Sem isso o CI estava vermelho desde o plano 015. A metade do Cloudflare continua desta fase
- [x] `/admin` publicado e autenticando pelo TinaCloud em produção — **2026-09-11**, plano 026: login da conta ADMIN pelo TinaCloud (via GitHub) funciona em produção (RF-01); sem sessão o painel mostra só o modal de login e mais nada (RF-02); menu com as cinco coleções em vocabulário acadêmico (RF-03). Uma edição real salva pelo painel virou o commit `7ab84da` na `main`, que disparou o build `8aa9d0db` (`build_outcome: success`) e publicou a versão `4b948808`
- [x] Notificação de falha de build chegando ao ADMIN (F-02) — **2026-09-12**, plano 028: a Cloudflare não notifica falha do Workers Builds, e o aviso vem de um vigia agendado no GitHub Actions (`vigia-do-deploy.yml`, ADR-0011). Experimento com o erro real do professor (`aulas: [ {} ]`, commit `b8e4560`): build `f9650b87` falhou nomeando arquivo e campo (F-09), o site seguiu na versão anterior durante 1h33 (RNF-04), o vigia reprovou e o e-mail chegou ao ADMIN em menos de 1 min. **Pendência nomeada:** a detecção foi exercitada por `workflow_dispatch`, porque o GitHub não executou o cron agendado na janela; o e-mail por execução `schedule` fica por observar (ADR-0011)
- [x] Documentação do pipeline no README — plano 034: `README.md` ganha a seção "Pipeline de
      publicação", respondendo cinco perguntas (o que acontece ao salvar, com os tempos medidos
      nos planos 025/026/028; quem roda o quê e por que o CI não é portão do deploy, ADR-0009; onde
      vive cada variável de ambiente; o que acontece quando o build falha, com o vigia do plano 028
      e o ADR-0011; e como mudar o schema sem o cloud check do pipeline, ADR-0009/plano 031); a
      seção "Deploy" reescrita — automático como caminho normal, `npm run deploy` como emergência,
      com a diferença de comando registrada. Plano 034 promovido a DONE, trabalho em `ef7f258`

> **Três itens migraram para a fase 5 em 2026-09-12** — usuário EDITOR criado e verificado contra a
> matriz da §9 (dois itens, plano 027) e ciclo ponta a ponta cronometrado com o EDITOR (M-02, plano
> 029). Os três exigem uma sessão com o professor, que a fase 5 já reservava para o treinamento e a
> validação assistida. A fase passa de 8 para 5 itens. Ver
> `docs/sabatinas/CHANGELOG_sabatina_recorte-sem-professor.md`, Decisões 1 e 3.

### Fase 3 — Site Público (PT)
- [ ] Layout base, cabeçalho, rodapé e navegação
- [ ] Identidade visual aplicada (após as referências de Q-04)
- [ ] Home (RF-20)
- [ ] Sobre (RF-21)
- [ ] Pesquisa (RF-22)
- [ ] Ensino (RF-23)
- [ ] Página de disciplina (RF-24)
- [ ] Scripts da disciplina renderizados com destaque de sintaxe e botão de copiar, agrupados por aula (RF-37, F-13)
- [ ] Publicações agrupadas por ano (RF-25)
- [ ] Página 404 (RF-27)
- [ ] Responsividade verificada de 360 px a 1440 px (RF-26)
- [ ] Animações com `prefers-reduced-motion` honrado (RF-32); testes da fase passando

### Fase 4 — Internacionalização
- [ ] Roteamento i18n configurado (PT na raiz, EN em `/en`)
- [ ] Dicionários `src/i18n/` com todas as strings de interface
- [ ] Nenhuma string de interface hardcoded em componente (§10.4)
- [ ] Utilitário de fallback por campo implementado e testado (RN-06)
- [ ] Rotas EN espelhando as rotas PT
- [ ] Seletor de idioma preservando a página atual (RF-29)
- [ ] `hreflang`, canonical e sitemap bilíngue (RF-30)
- [ ] M-07 verificada: zero strings PT de interface nas rotas EN

### Fase 5 — Polimento e Entrega
- [ ] Todos os requisitos [MUST] da §5.1 implementados e verificados
- [ ] Todos os cenários de falha (§5.4) tratados; os verificáveis, testados
- [ ] SEO completo: title, description, canonical, Open Graph, favicon, `robots.txt`, sitemap
- [ ] Otimização de imagens (formatos modernos, dimensões corretas, lazy loading)
- [ ] Acessibilidade: axe sem violações críticas; navegação por teclado verificada
- [ ] Lighthouse mobile ≥ 90 performance, ≥ 95 acessibilidade (M-04, M-05)
- [ ] Suíte completa de testes verde, com saída registrada
- [ ] Cobertura ≥ meta da §11
- [ ] Teste de restauração de conteúdo excluído executado (§9)
- [ ] `docs/manual-do-professor.md` escrito, com capturas de tela
- [ ] Usuário EDITOR do professor criado, com permissões verificadas contra a matriz da §9 — plano 027, **migrado da fase 2 em 2026-09-12**
- [ ] Verificado que o EDITOR **não** consegue alterar schema, código ou configuração — plano 027, **migrado da fase 2 em 2026-09-12**
- [ ] Ciclo ponta a ponta cronometrado: edição do EDITOR visível no site (M-02) — plano 029, **migrado da fase 2 em 2026-09-12**; é também o critério de conclusão que a fase 2 tinha no §6.2 até esta data
- [ ] Sessão de treinamento com o professor realizada
- [ ] Validação assistida: o professor publica um item sozinho (M-01)
- [ ] `README.md` e `docs/CHANGELOG.md` completos; ADRs D-01..D-06 escritos
- [ ] Tag `v1.0.0` criada no repositório

### ✅ Definition of Done (por item de trabalho)
1. Código implementado e funcionando localmente;
2. Testes escritos e passando, com saída real do comando registrada;
3. TSDoc e cabeçalhos conforme §10;
4. Sem warnings novos de linter;
5. Documentação afetada atualizada;
6. Checklist desta seção atualizado.

---

## 13. Riscos e Mitigações

| ID | Risco | Prob. | Impacto | Mitigação | Plano de contingência | Dono |
|---|---|---|---|---|---|---|
| R-01 | Build quebra por conteúdo salvo pelo professor, e ele não tem como diagnosticar nem corrigir | Média | Alto | Zod tolerante em campos opcionais; validações no schema do Tina que impedem o dado inválido de ser salvo; mensagens de erro de build nomeando arquivo e campo (F-09); notificação ao ADMIN | ADMIN corrige e faz revert; site permanece no ar com a versão anterior | Desenvolvedor |
| R-02 | Divergência silenciosa entre o schema do Tina e o Zod do Astro | Média | Alto | Teste de paridade obrigatório no CI (D-06, RNF-09) | Corrigir o schema divergente antes de qualquer deploy | Desenvolvedor |
| R-03 | TinaCloud muda preço, limites ou descontinua o plano gratuito | Baixa | Alto | Conteúdo em arquivos Markdown no Git, agnóstico ao CMS; nenhum dado preso na plataforma | Migrar para Decap CMS (gratuito, sem limite de usuários), reescrevendo apenas a camada de configuração do painel | Desenvolvedor |
| R-04 | Limite de 2 usuários do TinaCloud gratuito impede incluir um terceiro editor (bolsista, secretaria) | Média | Médio | Deixar explícito ao stakeholder desde já | Plano Team (US$ 24/mês) ou migração para Decap (R-03) | Desenvolvedor |
| R-05 | Ausência de preview de rascunho frustra o professor ("não vejo como vai ficar") | Média | Médio | Campo `publicado` + explicação no manual; painel mostra o texto formatado ao editar | Publicar num horário de baixo tráfego e ajustar; ou avaliar Team Plus (US$ 41/mês) | Desenvolvedor |
| R-06 | Cota de minutos de build do plano gratuito insuficiente para a frequência de edição | Muito baixa | Médio | Cota verificada: 3.000 min/mês ÷ ~2 min por build ≈ 1.500 publicações/mês, ordens de grandeza acima do uso previsto. Medir a duração real do build na fase 2 | Agrupar publicações (rascunho + publicação em lote) ou migrar o build para GitHub Actions | Desenvolvedor |
| R-12 | Build simultâneo único: salvamentos em sequência rápida enfileiram builds | Média | Baixo | Comportamento aceito — a fila resolve sozinha; afeta apenas a latência de M-02 quando o professor salva várias vezes seguidas | Nenhum; se incomodar, plano pago permite 6 builds paralelos | Desenvolvedor |
| R-13 | Código-fonte indentado perde a indentação ao ser gravado no frontmatter: em Python a indentação é sintaxe, e o script chega quebrado ao aluno sem erro em lugar nenhum | Média | Alto | O painel grava via `gray-matter`/`js-yaml`; o campo tem de ser serializado como *block scalar* (`\|`) e relido sem alteração de espaçamento. **Verificação obrigatória exercitando o painel** — salvar script com bloco indentado, linha em branco e aspas, e conferir o `.md` gravado (plano 022); leitura de `node_modules` não prova (RF-37, D-05) | Se a serialização não preservar, o campo volta a ser link externo e o snippet sai do MVP — a RN-05 retoma a forma anterior | Desenvolvedor |
| R-07 | Professor não adota a ferramenta e o site envelhece — o problema original volta | Média | Alto | Painel em vocabulário acadêmico; manual com capturas; treinamento assistido; validação M-01 antes da entrega | Sessão de acompanhamento 30 dias após a entrega, ajustando os campos que atrapalharam | Desenvolvedor |
| R-08 | Links de material quebram ou perdem permissão pública sem que ninguém perceba | Média | Médio | Texto de ajuda no campo; instrução no manual sobre compartilhamento público; convenção de organização recomendada (não imposta) | Verificador periódico de links (script, v1.2) | Professor |
| R-09 | Falta de conteúdo real atrasa a validação e o site é entregue com placeholder | Alta | Médio | Placeholder realista desde a fase 1; entrega técnica não depende do conteúdo | Entregar o site funcional e treinar o professor para popular; conteúdo é responsabilidade dele após a entrega | Desenvolvedor |
| R-10 | Conteúdo em inglês nunca é preenchido e o `/en` fica inteiramente em português | Alta | Baixo | O fallback é intencional: a rota EN nunca quebra; a interface fica traduzida ainda que o conteúdo não esteja | Aceitar; traduzir prioritariamente Perfil e Publicações, que é o que a persona 4 lê | Professor |
| R-11 | Escopo cresce durante a implementação (notícias, CV, filtros, busca) | Alta | Médio | §3.2 e §6.3 são a linha de corte; toda adição exige nova versão do PRD | Registrar em §6.3 e agendar para v1.1+ | Desenvolvedor |

---

## 14. Dependências e Premissas

### 14.1 Dependências Externas

- Conta GitHub do desenvolvedor com repositório disponível.
- Conta Cloudflare (plano gratuito) com Workers habilitado.
- Conta TinaCloud (plano gratuito) e um e-mail do professor para o convite de EDITOR.
- Um hospedeiro de arquivos à escolha do professor, com link público (Google Drive recomendado — sem acoplamento, ver D-07).
- Conteúdo real do professor (biografia, foto, lista de publicações, disciplinas) — necessário apenas para a fase 5.
- Disponibilidade do professor para a sessão de treinamento e validação (fase 5).
- ~~Referências visuais do stakeholder antes da fase 3 (Q-04).~~ Fornecidas em 2026-09-14 (`ref/`, `docs/identidade-visual.md`).

### 14.2 Premissas (Assumptions)

| ID | Premissa | Impacto se for falsa |
|---|---|---|
| A-01 | O professor é o único editor do conteúdo | Estoura o limite de 2 usuários do TinaCloud gratuito → R-04 |
| A-02 | O plano gratuito do TinaCloud continua oferecendo 2 usuários e 2 papéis | Custo mensal passa a existir → R-03 |
| A-03 | ✅ **Confirmada em 2026-09-01:** o Workers Builds gratuito oferece 3.000 min de build/mês, o que comporta com folga a frequência de edição prevista | Migração do build para GitHub Actions → R-06 |
| A-04 | Materiais em link público externo são aceitáveis para os alunos e para a instituição | Seria preciso hospedar arquivos no próprio site, contrariando NG-02 e mudando a arquitetura |
| A-05 | O volume de conteúdo permanece na ordem de grandeza da RNF-13 | Build lento; paginação e filtros passam de COULD a MUST |
| A-06 | ✅ **Confirmada em 2026-09-03:** o professor tem e-mail institucional publicável (`haroldo.lima@ufma.br`, Q-07) | Revisar §9 (LGPD) e usar formulário de contato — o que exigiria serviço externo |
| A-07 | Não haverá domínio próprio no MVP (subdomínio `*.workers.dev`) | Configurar DNS e certificado; URLs canônicas e sitemap precisam ser refeitos antes da indexação |
| A-08 | O painel do TinaCMS em inglês é aceitável para o professor (a interface do produto não é traduzível; apenas os rótulos dos campos, que serão em português) — **confirmada em 2026-09-01 pelo stakeholder (Q-02)** | Migração para Decap CMS, que tem `locale: pt` → R-03 |

> **A-08 é a premissa mais frágil deste PRD** e precisa ser confirmada com o professor antes da fase 2 (Q-02). Rótulos de campo, coleções e textos de ajuda ficam em português, mas os botões estruturais do painel (Save, Delete, Add) permanecem em inglês.

---

## 15. Cronograma e Estimativas

| Fase | Estimativa | Início previsto | Fim previsto | Real |
|---|---|---|---|---|
| 0 — Setup e provisionamento | 1 dia | | | |
| 1 — Modelo de conteúdo | 2–3 dias | | | |
| 2 — Pipeline de publicação | 1–2 dias | | | |
| 3 — Site público (PT) | 4–6 dias | | | |
| 4 — Internacionalização | 2 dias | | | |
| 5 — Polimento e entrega | 3–4 dias | | | |
| **Total** | **~13–18 dias úteis de trabalho** | | | |

> Estimativas são ordens de grandeza, não promessas. Revisar ao fim de cada fase e registrar desvios com causa. A fase 3 é a mais sensível a retrabalho, porque depende de referências visuais — fornecidas em 2026-09-14 (Q-04), mas desenhadas para outro conteúdo e recortadas em `docs/identidade-visual.md`; a fase 5 depende de disponibilidade do professor, que está fora do controle do projeto.

---

## 16. Questões em Aberto

| ID | Questão | Bloqueia o quê | Responsável | Prazo | Resolução |
|---|---|---|---|---|---|
| ~~Q-01~~ | ~~Nome completo, cargo, instituição e departamento do professor~~ | Metadados do site, `<title>`, JSON-LD, conteúdo do perfil | Stakeholder | Fase 1 | ✅ **2026-09-01:** extraídos de `lattes.pdf` (currículo de 2026-08-04). Ver Apêndice C |
| ~~Q-02~~ | ~~O professor aceita um painel cuja interface estrutural está em inglês (A-08)?~~ | Fase 2 — decidia entre manter TinaCMS ou migrar para Decap | Stakeholder + Professor | Antes da fase 2 | ✅ **2026-09-01:** sim, o painel em inglês é aceitável. **A-08 confirmada**; o TinaCMS fica. A migração para Decap deixa de ser gatilho de decisão e permanece apenas como plano B do risco R-03 |
| ~~Q-03~~ | ~~Qual o limite de minutos de build do Workers Builds no plano gratuito?~~ | Confirma A-03 e o risco R-06 | Desenvolvedor | Fase 0 | ✅ **2026-09-01:** 3.000 min/mês, 1 build simultâneo, teto de 20 min por build ([doc](https://developers.cloudflare.com/workers/ci-cd/builds/limits-and-pricing/)). A-03 confirmada; R-06 rebaixado para "muito baixa"; novo risco R-12 (fila de builds) registrado |
| ~~Q-04~~ | ~~Referências visuais do site~~ | Fase 3 (identidade visual) | Stakeholder | Antes da fase 3 | ✅ **2026-09-14:** mock `ref/Site UFMA Física v2.dc.html` e cinco capturas em `ref/`. Adaptado ao schema e ao §6.1 em `docs/identidade-visual.md`; recortes decididos em `docs/sabatinas/CHANGELOG_sabatina_identidade-visual.md` |
| Q-05 | Haverá domínio próprio ou institucional? Se sim, quando? | URLs canônicas, sitemap, indexação (A-07) | Stakeholder | Antes da fase 5 | |
| ~~Q-06~~ | ~~Qual e-mail do professor será usado como EDITOR no TinaCloud?~~ | Fase 2 | Stakeholder | Fase 2 | ✅ **2026-09-03:** `haroldo.lima@ufma.br` — o mesmo e-mail institucional publicado no site (Q-07). O professor entra no TinaCloud com ele, e a fase 2 deixa de ter bloqueio de stakeholder |
| ~~Q-07~~ | ~~O e-mail exibido publicamente é institucional? (§9, LGPD)~~ | Fase 3 | Professor | Fase 3 | ✅ **2026-09-03:** sim — `haroldo.lima@ufma.br`, e-mail institucional da UFMA, informado pelo stakeholder. Substituiu o `PLACEHOLDER@ufma.br` em `content/perfil/index.md`. **A-06 confirmada**; a §9 (LGPD) fica satisfeita sem formulário de contato |
| ~~Q-08~~ | ~~A conta Google do Drive é do professor ou institucional?~~ | R-08 e a convenção de pastas | Stakeholder | Fase 0 | ✅ **2026-09-01:** questão dissolvida. O campo de material é uma **URL livre** — o professor cola o link de onde tiver hospedado (Drive, repositório institucional, arXiv, YouTube). O Google Drive passa de dependência a recomendação do manual. Ver D-07 |
| Q-09 | Notícias e CV entram na v1.1 logo após a entrega, ou ficam indefinidos? | Planejamento pós-entrega | Stakeholder | Após a fase 5 | |

> Nenhuma fase que dependa de uma questão aberta deve começar antes de resolvê-la. **Nenhuma questão bloqueia a fase 0** — Q-01, Q-03 e Q-08 foram resolvidas em 2026-09-01. Bloqueia adiante: Q-05 (fase 5). **Q-04 foi resolvida em 2026-09-14** — a fase 3 não tem mais bloqueio de stakeholder. **Q-06 e Q-07 foram resolvidas em 2026-09-03**, ambas pelo mesmo e-mail institucional `haroldo.lima@ufma.br`: ele é o que o site publica (Q-07, já gravado em `content/perfil/index.md`) e também a conta com que o professor entra no TinaCloud (Q-06). **A fase 2 não tem mais bloqueio de stakeholder** — a fase 1 fechou em 2026-09-10 e a fase 2 começou. **Q-02 foi resolvida em 2026-09-01** — o painel em inglês é aceitável, o TinaCMS fica, e a fase 1 pode construir `tina/config.ts` sem risco de descarte.

---

## 17. Glossário

| Termo | Definição |
|---|---|
| MVP | Minimum Viable Product — menor versão que entrega valor real |
| ADR | Architecture Decision Record — registro de decisão arquitetural |
| MoSCoW | Priorização: Must / Should / Could / Won't |
| SSG / site estático | Páginas geradas no build; o servidor apenas entrega arquivos prontos |
| SSR | Server-Side Rendering — HTML gerado a cada requisição |
| Ilha (island) | Componente interativo isolado numa página estática — o resto da página não carrega JavaScript |
| Frontmatter | Bloco de metadados no topo de um arquivo Markdown |
| Coleção | Conjunto de conteúdos do mesmo tipo (ex.: publicações) |
| Singleton | Coleção com um único item (ex.: perfil) |
| Fallback (i18n) | Exibir o conteúdo em português quando não há versão em inglês |
| Editorial Workflow | Recurso pago do TinaCloud com rascunho e aprovação por branch — **não usado** (NG-07) |
| Workers Builds | Serviço da Cloudflare que constrói e publica a cada push no GitHub |
| Static Assets (Workers) | Modo do Cloudflare Workers que serve arquivos estáticos sem executar código por requisição |
| EDITOR / ADMIN | Os dois papéis do TinaCloud usados neste projeto (§9) |
| Lattes / ORCID / arXiv / DOI | Identificadores e plataformas do ecossistema acadêmico |

---

## Apêndice A — Referências

- `briefing.md` — documento de origem, neste diretório.
- `../docs/plano-i18n.md` — plano de i18n do LaFiM; origem do padrão de fallback adotado (RN-06).
- `../grav` — projeto irmão (Next.js + Decap): referência de modelo de conteúdo acadêmico.
- [TinaCMS — Astro](https://tina.io/docs/frameworks/astro) — integração oficial; visual editing exige `output: 'server'` (base de D-01/D-02).
- [Astro — Tina CMS](https://docs.astro.build/en/guides/cms/tina-cms/)
- [TinaCloud — planos](https://tina.io/pricing) — Free: 2 usuários, 2 papéis, assets ≤ 100 MB, sem Editorial Workflow (base de D-04, R-04).
- [Astro — deploy na Cloudflare](https://docs.astro.build/en/guides/deploy/cloudflare/)
- [Cloudflare Workers Builds](https://developers.cloudflare.com/workers/ci-cd/builds/) — deploy automático a partir do GitHub.
- [`@astrojs/cloudflare`](https://www.npmjs.com/package/@astrojs/cloudflare) — adapter SSR; **não usado** por D-01.

> Verificações da §19 do briefing realizadas em 2026-09-01. Antes da fase 0, reconferir preços e limites — planos mudam.

## Apêndice B — Anexos

- Esquemas completos das coleções: §7.3.
- Diagrama de arquitetura: §7.1.
- Fluxos do professor: §8.1.
- A produzir: capturas de tela do painel (fase 5, para o manual do professor); referências visuais (Q-04) — fornecidas em `ref/` em 2026-09-14.

## Apêndice C — Dados do Professor

> Extraídos de `lattes.pdf` (currículo Lattes atualizado em 2026-08-04) em 2026-09-01. Resolvem a Q-01.
> **Fonte para o conteúdo inicial do perfil (fase 1).** O PDF contém apenas identificação, formação e atuação — a lista de publicações **não** está nele e precisará ser obtida à parte (ORCID/Scholar) ou cadastrada pelo professor.

| Campo | Valor |
|---|---|
| Nome | Haroldo Cilas Duarte Lima Junior |
| Nome em citações | LIMA JUNIOR, HAROLDO C. D. |
| Cargo | Professor Adjunto A |
| Instituição | Universidade Federal do Maranhão (UFMA), Campus São Luís |
| Unidade | Centro Tecnológico — Departamento de Física |
| Bolsa | Produtividade em Pesquisa do CNPq — Nível C |
| Lattes | http://lattes.cnpq.br/8115459874963916 |
| ORCID | https://orcid.org/0000-0002-3702-7683 |
| Endereço | Av. dos Portugueses, Vila Bacanga, 65080-805 — São Luís, MA |
| Telefone institucional | (98) 3272-8200 |

**Formação**

| Período | Titulação | Instituição | Observação |
|---|---|---|---|
| 2014–2018 | Graduação em Física (Bacharelado) | UFPA | Láurea Acadêmica; orientador Luís Carlos Bassalo Crispino |
| 2018–2019 | Mestrado em Física | UFPA | *Tidal Forces in Kerr Spacetime*; orientador L. C. B. Crispino |
| 2019–2023 | Doutorado em Física | UFPA | *Challenging the Kerr hypothesis with scalar fields, tidal forces and shadows*; sanduíche na Universidade de Aveiro (Carlos A. R. Herdeiro); orientador L. C. B. Crispino |
| 2023 | Pós-doutorado | UFPA | Bolsa FAPESPA |
| 2023–2024 | Quantum Field Theory (formação complementar) | ICTP — Trieste, Itália | |

**Prêmios**

- Prêmio SBF de Tese de Doutorado 2023 — área de Partículas e Campos
- Prêmio José Leite Lopes de melhor tese de doutoramento de 2024
- Prêmio Observatório Nacional de Melhor Tese de Doutorado 2024
- Menção honrosa — ICTP-SAIFR Prize in Classical Gravity and Applications 2024

**Áreas de atuação** (candidatas a virar as linhas de pesquisa da fase 1)

- Teoria da Relatividade Geral e teorias alternativas de gravitação
- Perturbações lineares em espaços-tempos curvos
- Forças de maré
- Sombras de buracos negros

> **Nota de contexto:** a área de atuação coincide com a do projeto irmão `../grav` (grupo de gravitação da UFMA) — vale verificar se há conteúdo, fotos ou publicações reaproveitáveis entre os dois sites.
