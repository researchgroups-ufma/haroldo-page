# Changelog

Todas as mudanças relevantes deste projeto são registradas aqui.
O formato segue [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/)
e o versionamento segue [SemVer](https://semver.org/lang/pt-BR/).

## [Não publicado]

### Adicionado

Fase 3 — site público em português (planos 036 a 054; critério de conclusão da fase — todas as
rotas navegáveis com o conteúdo, responsivas de 360 px a 1440 px — demonstrado pelo plano 053: 8
rotas × 3 larguras, `scrollWidth = clientWidth` nas 24 medições; checklist do §12 em 12/12):

- Sistema visual de `docs/identidade-visual.md` em `src/styles/global.css`: tokens de cor, escala
  tipográfica, classes de movimento e a Archivo auto-hospedada, sem fonte de terceiro (plano 036,
  `fb117b6`).
- Dicionário de interface `src/i18n/pt.ts` (objeto `pt`, tipo `UiStrings`, plurais como funções) e
  mapa de navegação `NAV_ITEMS` com `isActivePath` (plano 037, `23d1aa0`).
- Utilitários de apresentação em `src/lib/`: `toParagraphs` e `padCount` (plano 038, `1d0d3a5`);
  `filterPublished` (RN-01) e `requireSingleton`, ordenação de linhas de pesquisa por `ordem` e
  título e de projetos (plano 039, `5705e73`); `groupByYear`, `compareWithinYear` (regra provisória
  da Q-RN02), destaque do autor e links DOI/arXiv (plano 040, `6bf5aa4`); `courseSlug` derivando a
  URL do nome do arquivo (`2026.2-relatividade-geral.md` → `2026-2-relatividade-geral`), atuais ×
  anteriores, contagens e scripts por aula (plano 041, `a2e28b7`).
- Layout base, cabeçalho com menu do celular e rodapé com os perfis acadêmicos (plano 042,
  `db96df3`); componentes `PageHeader`, `PillButton`, `Tag` e `ExternalLink` (plano 043, `dfdc0a3`).
- As rotas do site público: Home com as células-caminho contando só publicados (plano 044,
  `4e48ce5`); Sobre (plano 045, `369637a`); Pesquisa com `ProjectCard` e âncora da linha relacionada
  que não revela rascunho (plano 046, `97e006d`); Ensino com os grupos "Atuais" e "Anteriores" sempre
  rotulados (plano 047, `4d90d92`); página de disciplina gerada por `getStaticPaths`, com
  `LessonList` e `CourseResources` (plano 048, `5eaf30e`); painel de script com tema Shiki
  monocromático e botão "Copiar código" em melhoria progressiva (plano 049, `1a028ce`); Publicações
  em blocos por ano (plano 050, `5b97655`); página 404 (plano 051, `8c6821c`).
- Teste de citações do PRD (`tests/lib/citacoes-do-prd.test.ts`): toda citação de identificador do
  PRD em `src/**` existe na fonte — camada de existência apenas; a de pertinência foi refutada por
  medição (plano 054, `23a003d`).
- Testes de integração sobre o `dist/` gerado, `npm run test:dist`, no CI depois do
  `build:pipeline`: rotas geradas, nenhum rascunho no HTML, um `<h1>` e `lang="pt-BR"` por página,
  nenhuma fonte de terceiro, JS < 50 KB gzip por rota (medido: 259 a 606 bytes) e nenhum React fora
  do painel (plano 052, `9af755e`).
- Verificação transversal (plano 053, `876d89c`): responsividade 360/768/1440 nas 8 rotas; o 404
  do `wrangler dev` com SHA-256 igual ao `dist/404.html`; movimento em `no-preference` e texto
  visível sem CSS observados pelo orquestrador; estado `reduce` e navegação por teclado verificados
  à mão pelo stakeholder em 2026-09-23.
- Suíte ao fechar a fase (2026-09-23): 265 testes em 16 arquivos (`tests/lib/` × 11, `tests/i18n/`
  × 1, `tests/content/` × 4), cobertura 100% em statements, branches, funções e linhas de
  `src/lib/`, `src/i18n/` e `src/content.config.ts`; mais 9 testes em `tests/dist/`. Os 2 testes do
  ramo `href` sem barra final de `isActivePath` entraram no fechamento (`bc17746`).

**Corrigido na fase 3:**

- A rota inexistente em produção respondia `404` com corpo vazio (`Content-Length: 0`), dívida da
  fase 2 no `not_found_handling`; passa a servir a página 404, com o corpo igual byte a byte ao
  `dist/404.html` (plano 051).
- O `.gitignore` tinha `dist/` sem âncora e ignorava também `tests/dist/`; virou `/dist/` (plano 052).
- Comentários das dívidas 7(b) (`tests/content/paridade-schema.test.ts`) e 7(c)
  (`tests/content/conteudo-valido.test.ts`) corrigidos, sem mudança de lógica (plano 053).

**Pendências deliberadamente abertas da fase 3** — cada uma com destino e "fecha quando" na seção
"O que a fase 3 empurra adiante, e as dívidas que ela criou" de
`plans/fase-3-site-publico/README.md`. As principais: `F-08` com duas definições incompatíveis
(PRD §5.4 × `docs/identidade-visual.md` §1), decisão do dono do produto; ordem dentro do ano em
Publicações provisória até existir campo de data de cadastro (Q-RN02, opção c); a faixa de células
em três cópias e sem o `padding-right` uniformizado com o rodapé; páginas acima do alvo de 150
linhas (`index.astro` 181, `sobre.astro` 217, `ensino/[slug].astro` 163, `ensino.astro` 155); e as
seis observações da revisão de integração do fechamento (token `--color-comentario` sem uso, rodapé
sem `ExternalLink`, ordem dos perfis por dois caminhos, `<title>` de chaves heterogêneas, rotas
fora de `NAV_ITEMS` sem teste, citação de NG-01 anterior à fase).

Fase 2 — pipeline de publicação ponta a ponta (planos 023, 024, 025, 026, 028, 030, 031, 032, 033,
034, 035; planos 027 e 029 migrados para a fase 5 em 2026-09-12 — ver
`docs/sabatinas/CHANGELOG_sabatina_recorte-sem-professor.md`; critério de conclusão da fase — um
ADMIN edita no `/admin` em produção e a mudança é publicada sozinha, com cada elo provado por
artefato — demonstrado pelo plano 026):

- Comando de build determinístico dos dois pipelines automáticos (GitHub Actions e Cloudflare
  Workers Builds), `npm run build:pipeline`, sem acoplamento ao TinaCloud (ADR-0009, plano 024).
  Pipeline de publicação integrando `vitest run tests/content` (portão de validação de conteúdo),
  `tinacms build --skip-cloud-checks`, `astro check` e `astro build`, resolvendo o limite do
  `astro check` que sai com exit 0 diante de referência inválida.
- Workers Builds integrado ao repositório (plano 025), dispara a cada push na `main` com
  `npm run build:pipeline`, publica em `haroldo-page.and-near.workers.dev`; duração medida do
  primeiro build (incluindo clone e dependências): 2m 02s.
- `/admin` (TinaCMS) em produção (plano 026), autenticando pelo TinaCloud, editando conteúdo real
  que é commitado na `main` e publicado pelo Workers Builds automaticamente.
- Portão de conteúdo no CI (plano 030): validação via Zod de todos os arquivos em `content/` com
  resolução de referências, detectando `linha_relacionada: ''` (referência inválida que o
  `astro check` não bloqueava). Teste novo `tests/content/conteudo-valido.test.ts` e ampliação de
  `paridade-schema.test.ts` com comparação do `path` do Tina e prova de falsificabilidade contra
  artefato final. Portão roda no CI e dentro de `build:pipeline`, bloqueando conteúdo inválido do
  site publicado.
- Verificação de coerência do `tina/tina-lock.json` no CI (plano 031): teste
  `tests/content/tina-lock-coerente.test.ts` compara a árvore declarativa de `tina/config.ts`
  contra `schema.collections` do lock, 109 caminhos qualificados, sem rodar `tinacms dev`.
- Notificação de falha de build ao ADMIN (plano 028, comportamento F-02/RNF-04): workflow agendado
  `.github/workflows/vigia-do-deploy.yml` lê o check run `Workers Builds: haroldo-page` do commit
  mais recente de `main` e reprova (enviando e-mail do GitHub Actions ao ADMIN) se o build estiver
  ausente por mais de 30 minutos ou preso em `queued`/`in_progress` por mais de 60 minutos.
  Experimento controlado com conteúdo deliberadamente inválido injetado na `main`, revertido após
  captura (F-09: a mensagem de erro nomeia arquivo e campo).
- `npm audit` no CI (plano 032, ADR-0010), reprovando em `high`/`critical`, reportando `moderate`;
  8 vulnerabilidades `moderate` na árvore: 5 via `react-router` sem correção nossa (upgrade seria
  downgrade), 3 (`qs`, `body-parser`, `express`) com correção disponível e adiadas de propósito.
- `docs/adr/0009-build-de-pipeline-sem-cloud-check.md`, `docs/adr/0010-npm-audit-no-ci-e-severidade.md`,
  `docs/adr/0011-vigia-agendado-da-falha-de-build.md` — decisões arquiteturais da fase com
  alternativas rejeitadas e consequências.
- Documento `docs/avisos-do-painel-para-o-manual.md` (plano 033) compilando os cinco achados sobre
  limitações do painel que o manual da fase 5 é obrigado a cobrir.
- Seção nova "Pipeline de publicação" e reescrita da seção "Deploy" do `README.md` (plano 034)
  descrevendo o ciclo completo da edição até a publicação, os papéis (GitHub Actions para
  qualidade, Workers Builds para deploy em paralelo), variáveis de ambiente, comportamento de
  falha e diagnóstico.
- Suíte de testes da fase: 122 testes em 6 arquivos (`tests/lib/` × 2 + `tests/content/` × 4,
  incluindo 2 novos `conteudo-valido.test.ts` e `tina-lock-coerente.test.ts`), cobertura 100% de
  `src/lib/`, `src/i18n/`, `src/content.config.ts` (108 testes em `tests/content/` do portão de
  conteúdo).

**Corrigido na fase 2:**

- `npm run deploy` (plano 035) passa a rodar `vitest run tests/content` antes de `npm run build` e
  `wrangler deploy`, fechando o furo onde conteúdo inválido salvo pelo painel poderia ser publicado
  se o Workers Builds estivesse indisponível.
- Vigia do deploy (plano 035) agora reprova também quando check existe mas nunca chega a
  `completed` (`queued` ou `in_progress`) por mais de 60 minutos, evitando que build travado por
  incidente da Cloudflare receba "em andamento" indefinidamente sem aviso.

**Pendências deliberadamente abertas da fase 2** — todas nomeadas com destino e gatilho de revisão
(README da fase, ADRs 0009/0010/0011):

- **Caminho `schedule` do vigia não observado em execução (ADR-0011).** Cron diário (12:17 UTC)
  nunca foi detectado rodando: no experimento do plano 028 o GitHub não executou nenhuma vez em
  ~90 min. Detecção e e-mail foram provados por `workflow_dispatch` manual. Fecha quando: (a)
  houver ao menos uma execução `event: schedule` no histórico do workflow, e (b) falha real
  notificada por execução `schedule`.
- **Risco de desligamento do vigia por inatividade (ADR-0011).** Workflow público desliga sozinho
  sem atividade por 60 dias; o manual do ADMIN (fase 5, §10.5) tem de dizer como reativar
  (_Actions → Vigia do deploy → Enable workflow_).
- **Três vulnerabilidades `moderate` com correção disponível, adiadas de propósito (ADR-0010).**
  `qs`, `body-parser`, `express` têm `fixAvailable: true` mas não foram corrigidas: são `moderate`
  fora do portão (que reprova só em `high`/`critical`), e corrigi-las exigiria `npm audit fix` cujo
  churn o projeto manda desconfiar (lição da fase 0).
- **Normalização de `linha_relacionada` duplicada (plano 030).** `normalizeLinhaRelacionadaId`
  (`src/content.config.ts`) é constante não exportada e re-implementada no teste. Pode divergir
  silenciosamente. Fecha quando: função for exportada e importada no teste.
- **Imprecisão no cabeçalho de `conteudo-valido.test.ts` (plano 030).** Atribui dívida 7(c) a este
  arquivo, mas ela foi fechada em `paridade-schema.test.ts`. Fecha quando: frase de passagem
  corrigida no próximo plano que tocar o arquivo.
- **Quatro achados não bloqueantes da revisão de integração (2026-09-12), registrados como dívida
  pelo plano 035** (o que a mesma revisão levou a corrigir está em "Corrigido na fase 2"): o §11 do
  PRD atribui a validação de conteúdo ao `astro build` e diz "bloqueia merge", mas o portão é
  `vitest run tests/content` e a `main` não tem proteção de branch; a seção "Verificação
  autoritativa" do README da fase parou antes do plano 030; o `npm run build` é chamado de "portão
  pré-push" em três passagens, quando para mudança de schema o cloud check só passa depois do push e
  da reindexação; e o plano B do Workers Builds no §7.4 não avisa que derruba o vigia (ADR-0011).
  Cada um com "fecha quando" no README da fase.

Fase 1 — modelo de conteúdo (planos 015 a 022; critério de conclusão da fase — `/admin` criando e
editando item de cada coleção — demonstrado pelo orquestrador; pendência restante é só a promoção
administrativa do plano 021, não o critério em si):

- TinaCMS instalado e `/admin` no ar localmente, integrado ao Astro 7 (plano 015).
- Schemas Zod das cinco coleções do MVP em `src/content.config.ts` — `perfil`, `linhas-pesquisa`,
  `projetos`, `disciplinas`, `publicacoes` — e as mesmas cinco coleções em `tina/config.ts`, com
  rótulos e textos de ajuda em português, vocabulário acadêmico (planos 016 e 017).
- Campo `publicado` em toda coleção de listagem, substituindo o Editorial Workflow pago do
  TinaCloud (D-04, plano 017).
- Grupo "Versão em inglês (opcional)" nas cinco coleções traduzíveis, com fallback implícito para
  o português (D-03, RN-06, plano 018).
- Teste de paridade entre `src/content.config.ts` e `tina/config.ts` rodando no CI, provado
  falsificável nos dois sentidos (D-06, RNF-09, plano 019). Corrigiu uma divergência real de
  formato do valor de `projetos.linha_relacionada` entre o Tina e o loader `glob()` do Astro.
- Conteúdo placeholder representativo nas cinco coleções, criado pelo painel: 1 perfil com dados
  reais, 2 linhas de pesquisa, 2 projetos, 2 disciplinas e 6 publicações marcadas como exemplo
  (plano 020).
- Lista embutida `scripts[]` em `disciplinas` (RF-37), para código-fonte exibido com destaque de
  sintaxe na fase 3 — única exceção a "material é link externo" (RN-05). Verificado no painel que
  a indentação do código sobrevive à gravação via YAML (R-13, plano 022).
- `docs/adr/0003` a `0008`: as decisões D-02 a D-07 e D-06 da fase 1, cada uma com alternativa
  rejeitada e consequência aceita.
- Suíte de testes da fase: 107 testes em 4 arquivos, cobertura 100% de `src/lib/`, `src/i18n/` e
  `src/content.config.ts` — acima da meta de 80% da §11, imposta por `thresholds` no
  `vitest.config.ts`.

### Corrigido

- Docstring de `normalizeLinhaRelacionadaId` (`src/content.config.ts`): chamava a referência
  inválida a uma linha de pesquisa de "falha silenciosa que só apareceria na fase 3" — o
  `astro check` já reporta o erro hoje (`[ERROR] [content]`); o silencioso é o exit code (0), não
  o erro (achado do plano 020).

Fase 0 — setup e provisionamento (planos 001 a 013):

- Site estático em Astro 5 com TypeScript em modo `strict` e Tailwind 4, publicado em
  <https://haroldo-page.and-near.workers.dev> pelo Cloudflare Workers Static Assets. Nenhuma
  rota executa código por requisição (ADR-0001).
- Estrutura de diretórios do §7.5 do PRD, com `content/` pronto para receber as coleções.
- Ferramentas de qualidade: Prettier, ESLint (flat config, `no-explicit-any` como erro) e
  Vitest, com cobertura configurada para `src/lib/` e `src/i18n/`.
- CI no GitHub Actions rodando lint, testes e build a cada push.
- Configuração de ambiente por `.env.example`, com `src/lib/config.ts` centralizando título,
  URL canônica, idiomas e dados institucionais.
- Repositório privado, projeto no TinaCloud vinculado a ele e Worker na Cloudflare — o
  provisionamento que a fase 1 vai consumir.
- `docs/adr/`: ADR-0001 (site estático, sem adapter) e ADR-0002 (pins de `vite`, `sharp` e
  `esbuild` por `overrides`, com gatilhos de revisão).

### Alterado

Redesenho e polimento do site público (2026-09-23 a 2026-09-24, fora dos planos numerados, feito na
branch `design` e integrado à `main` em `00fdef9`; spec e resultado em
`docs/superpowers/specs/2026-09-23-polimento-design.md`):

- O site passa a viver num cartão contido; a partir de `lg` a página não rola e o conteúdo rola
  dentro do cartão, com barra de rolagem própria. Sai o rodapé (`f7e7345`).
- Cabeçalho de página compacto em todas as páginas internas, sem rubrica e sem contagem; títulos
  na margem esquerda com o metadado numa linha pequena acima; um só hover sublinhado
  (`ffb5304`, `725eca3`, `728a580`).
- Pesquisa com os projetos dentro de cada linha e "Outros projetos" no fim (`groupProjectsByLine`,
  RN-01); 404 com a lista de páginas no lugar do botão pílula (`355f34d`, `a758012`).
- Transições entre páginas por View Transitions, só CSS (`407ef82`).
- Acessibilidade: anos fechados de Publicações com `inert`, foco do "Pular para o conteúdo" dentro
  do cartão, níveis de título do painel de script, texto alternativo do retrato (`f41556a`).
- GSAP baixado só quando a sanfona roda, preload da Archivo 300, cache imutável de `/_astro/*`,
  favicon e `theme-color` (`2c4d179`).
- Removidos `PillButton`, `Tag`, `ProjectCard` e os textos e funções que ficaram sem uso
  (`6605226`, `725eca3`).
- Menu das páginas internas sem "Início": a volta à Home é o nome (`3029ccc`).
- Página de disciplina com uma seta de volta para Ensino no lugar da trilha "Ensino / código"
  (`408477d`).
- Contato da Sobre (e-mail e perfis acadêmicos, na mesma ordem) também na Home, com a lista
  montada por `profileLinks` em `src/lib/profile.ts` (`b6e8a7f`).
- Título e régua das páginas internas parados; só o conteúdo depois da régua rola. O primeiro
  bloco de Pesquisa e Publicações perde a borda que dobrava a régua (`d601180`).
- Sublinhado que segue o cursor no menu e nos links de contato, recriado da variante `link` do
  `gsap-fillable-button` da PaceUI sem React nem GSAP (`00fdef9`).
- `docs/identidade-visual.md` §1–§7 reescritas para descrever o site atual.

- **Astro 5.18.2 → 7.2.10**, feito antes de a fase 1 escrever os schemas de conteúdo, porque a
  migração muda a API de coleções e sobe para Zod 4 — fazê-lo depois implicaria reescrevê-los.
  O `npm audit` passa de 1 vulnerabilidade high para zero.
- **Todos os `overrides` do npm removidos.** O Astro 7 exige `vite ^8.0.13` e já pede
  nativamente as versões corrigidas de `sharp` e `esbuild`, o que dispensou os três pins. Ver
  o desfecho no ADR-0002.
