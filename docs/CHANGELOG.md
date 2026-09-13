# Changelog

Todas as mudanças relevantes deste projeto são registradas aqui.
O formato segue [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/)
e o versionamento segue [SemVer](https://semver.org/lang/pt-BR/).

## [Não publicado]

### Adicionado

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

- **Astro 5.18.2 → 7.2.10**, feito antes de a fase 1 escrever os schemas de conteúdo, porque a
  migração muda a API de coleções e sobe para Zod 4 — fazê-lo depois implicaria reescrevê-los.
  O `npm audit` passa de 1 vulnerabilidade high para zero.
- **Todos os `overrides` do npm removidos.** O Astro 7 exige `vite ^8.0.13` e já pede
  nativamente as versões corrigidas de `sharp` e `esbuild`, o que dispensou os três pins. Ver
  o desfecho no ADR-0002.
