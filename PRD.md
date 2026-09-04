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
| **Versão do PRD** | v0.1.16 |
| **Status** | 🟢 Aprovado |
| **Estado da implementação** | Fase 0 🟢 **concluída** (14 planos) · Fase 1 🟡 **em andamento** (015–019 DONE; pendentes 020, **022** e 021 — o 022 é o plano da lista `scripts[]`, criado pela sabatina de 2026-09-04, e executa **antes** do 021, que fecha a fase) · Fases 2–5 ⬜ não iniciadas. Detalhe por item em §12; execução em `plans/README.md` |
| **Autor(es)** | Desenvolvedor (`and.near@hotmail.com`) |
| **Revisores / aprovadores** | Desenvolvedor (dono do produto); Professor (usuário-chave, valida a fase 5) |
| **Data de criação** | 2026-09-01 |
| **Última atualização** | 2026-09-04 |
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
| M-02 | Tempo entre salvar no painel e conteúdo visível no site | N/A | < 5 min em 95% das publicações | Cronometragem em 10 publicações de teste | Fases 2 e 5 |
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
| 2 | Pipeline de publicação ponta a ponta | Workers Builds ligado ao repositório; TinaCloud em produção; conta EDITOR do professor; notificação de falha de build | Um usuário EDITOR edita no `/admin` em produção e a mudança aparece no site sem intervenção do ADMIN (M-02) | Fase 1 |
| 3 | Site público em português | Home, Sobre, Pesquisa, Ensino, disciplina, Publicações, 404; identidade visual; animações discretas | Todas as rotas navegáveis com o conteúdo placeholder, responsivas de 360 px a 1440 px | Fase 1 |
| 4 | Internacionalização | Roteamento i18n, dicionário de interface, grupo EN no schema, fallback por item, seletor de idioma, hreflang, sitemap bilíngue | M-07 atingida; fallback verificado item a item | Fase 3 |
| 5 | Polimento e entrega | SEO, Open Graph, favicon, acessibilidade, otimização de imagens, manual do professor, treinamento e validação assistida | Checklist §12 fechado; M-01, M-04, M-05 atingidas | Fases 2, 3, 4 |

> **Por que a fase 2 vem antes do site público:** o maior risco do projeto não é layout, é o ciclo de publicação (TinaCloud + Workers Builds + permissões). Se ele não fechar, a arquitetura muda — e é preferível descobrir isso com conteúdo placeholder do que com o site inteiro pronto.

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
| `scripts[]` | lista de objetos | | `{ titulo, descricao?, linguagem (python/r/matlab/bash/outro), codigo, aula?, url? }` — `codigo` é o código-fonte colado no próprio conteúdo (RN-05, RF-37); `linguagem` tem `python` como padrão; `aula` é o número da aula correspondente, sem integridade referencial (F-13); `url` aponta o arquivo original, se houver |
| `links[]` | lista de objetos | | `{ titulo, url }` — simulações, vídeos, páginas externas |
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

**Site público.** Direção visual: minimalista e moderno, tipografia forte como elemento principal, movimento discreto com `motion`/GSAP — nunca decorativo a ponto de atrasar a leitura. Referências visuais específicas serão fornecidas pelo stakeholder antes da fase 3 (Q-04). Restrições que a identidade deve respeitar, independentemente da referência escolhida: contraste AA, `prefers-reduced-motion` honrado (RF-32), leitura confortável em 360 px, e nenhuma animação bloqueando a exibição do conteúdo.

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
| Fase 1 — Modelo de conteúdo | 6/10 | 🟡 Em andamento |
| Fase 2 — Pipeline de publicação | 0/8 | ⬜ Não iniciada |
| Fase 3 — Site público (PT) | 0/12 | ⬜ Não iniciada |
| Fase 4 — Internacionalização | 0/8 | ⬜ Não iniciada |
| Fase 5 — Polimento e entrega | 0/14 | ⬜ Não iniciada |

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
- [ ] Conteúdo placeholder representativo: 1 perfil, 2 linhas, 2 projetos, 2 disciplinas (uma com 5 aulas), 6 publicações em 3 anos
- [ ] `/admin` funciona localmente e edita todas as coleções
- [ ] Testes unitários da fase escritos e passando
- [ ] Lista `scripts[]` em `disciplinas` (RF-37): schema Zod + Tina e paridade entre os dois — plano 022, executado **antes** do 021

### Fase 2 — Pipeline de Publicação
- [ ] Workers Builds conectado ao repositório, build automático no push
- [ ] Variáveis de ambiente configuradas no Cloudflare e no GitHub — **metade do GitHub feita em 2026-09-04**, antecipada por necessidade: `TINA_CLIENT_ID` e `TINA_TOKEN` viraram secrets e o workflow passou a injetá-los no passo de build (`82fb4de`). Sem isso o CI estava vermelho desde o plano 015. A metade do Cloudflare continua desta fase
- [ ] `/admin` publicado e autenticando pelo TinaCloud em produção
- [ ] Usuário EDITOR do professor criado, com permissões verificadas contra a matriz da §9
- [ ] Verificado que o EDITOR **não** consegue alterar schema, código ou configuração
- [ ] Notificação de falha de build chegando ao ADMIN (F-02)
- [ ] Ciclo ponta a ponta cronometrado: edição do EDITOR visível no site (M-02)
- [ ] Documentação do pipeline no README

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
- Referências visuais do stakeholder antes da fase 3 (Q-04).

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

> Estimativas são ordens de grandeza, não promessas. Revisar ao fim de cada fase e registrar desvios com causa. A fase 3 é a mais sensível a retrabalho, porque depende de referências visuais ainda não fornecidas (Q-04); a fase 5 depende de disponibilidade do professor, que está fora do controle do projeto.

---

## 16. Questões em Aberto

| ID | Questão | Bloqueia o quê | Responsável | Prazo | Resolução |
|---|---|---|---|---|---|
| ~~Q-01~~ | ~~Nome completo, cargo, instituição e departamento do professor~~ | Metadados do site, `<title>`, JSON-LD, conteúdo do perfil | Stakeholder | Fase 1 | ✅ **2026-09-01:** extraídos de `lattes.pdf` (currículo de 2026-08-04). Ver Apêndice C |
| ~~Q-02~~ | ~~O professor aceita um painel cuja interface estrutural está em inglês (A-08)?~~ | Fase 2 — decidia entre manter TinaCMS ou migrar para Decap | Stakeholder + Professor | Antes da fase 2 | ✅ **2026-09-01:** sim, o painel em inglês é aceitável. **A-08 confirmada**; o TinaCMS fica. A migração para Decap deixa de ser gatilho de decisão e permanece apenas como plano B do risco R-03 |
| ~~Q-03~~ | ~~Qual o limite de minutos de build do Workers Builds no plano gratuito?~~ | Confirma A-03 e o risco R-06 | Desenvolvedor | Fase 0 | ✅ **2026-09-01:** 3.000 min/mês, 1 build simultâneo, teto de 20 min por build ([doc](https://developers.cloudflare.com/workers/ci-cd/builds/limits-and-pricing/)). A-03 confirmada; R-06 rebaixado para "muito baixa"; novo risco R-12 (fila de builds) registrado |
| Q-04 | Referências visuais do site | Fase 3 (identidade visual) | Stakeholder | Antes da fase 3 | |
| Q-05 | Haverá domínio próprio ou institucional? Se sim, quando? | URLs canônicas, sitemap, indexação (A-07) | Stakeholder | Antes da fase 5 | |
| ~~Q-06~~ | ~~Qual e-mail do professor será usado como EDITOR no TinaCloud?~~ | Fase 2 | Stakeholder | Fase 2 | ✅ **2026-09-03:** `haroldo.lima@ufma.br` — o mesmo e-mail institucional publicado no site (Q-07). O professor entra no TinaCloud com ele, e a fase 2 deixa de ter bloqueio de stakeholder |
| ~~Q-07~~ | ~~O e-mail exibido publicamente é institucional? (§9, LGPD)~~ | Fase 3 | Professor | Fase 3 | ✅ **2026-09-03:** sim — `haroldo.lima@ufma.br`, e-mail institucional da UFMA, informado pelo stakeholder. Substituiu o `PLACEHOLDER@ufma.br` em `content/perfil/index.md`. **A-06 confirmada**; a §9 (LGPD) fica satisfeita sem formulário de contato |
| ~~Q-08~~ | ~~A conta Google do Drive é do professor ou institucional?~~ | R-08 e a convenção de pastas | Stakeholder | Fase 0 | ✅ **2026-09-01:** questão dissolvida. O campo de material é uma **URL livre** — o professor cola o link de onde tiver hospedado (Drive, repositório institucional, arXiv, YouTube). O Google Drive passa de dependência a recomendação do manual. Ver D-07 |
| Q-09 | Notícias e CV entram na v1.1 logo após a entrega, ou ficam indefinidos? | Planejamento pós-entrega | Stakeholder | Após a fase 5 | |

> Nenhuma fase que dependa de uma questão aberta deve começar antes de resolvê-la. **Nenhuma questão bloqueia a fase 0** — Q-01, Q-03 e Q-08 foram resolvidas em 2026-09-01. Bloqueiam adiante: Q-04 (fase 3), Q-05 (fase 5). **Q-06 e Q-07 foram resolvidas em 2026-09-03**, ambas pelo mesmo e-mail institucional `haroldo.lima@ufma.br`: ele é o que o site publica (Q-07, já gravado em `content/perfil/index.md`) e também a conta com que o professor entra no TinaCloud (Q-06). **A fase 2 não tem mais bloqueio de stakeholder** — o que falta para ela é a fase 1 fechar. **Q-02 foi resolvida em 2026-09-01** — o painel em inglês é aceitável, o TinaCMS fica, e a fase 1 pode construir `tina/config.ts` sem risco de descarte.

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
- A produzir: capturas de tela do painel (fase 5, para o manual do professor); referências visuais (Q-04).

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
