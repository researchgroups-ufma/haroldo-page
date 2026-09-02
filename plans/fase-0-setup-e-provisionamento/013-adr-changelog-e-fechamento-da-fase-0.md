# Plano 013 — ADR-0001 (D-01), CHANGELOG e fechamento do checklist da fase 0

**Status:** DONE
**RFs cobertos:** — (Fase 0, fechamento; §7.2 "cada decisão vira um ADR", §10.5, Definition of Done §12)
**Depende de:** planos 010, 011 e 012 (todos os anteriores, por transitividade)
**Modelo recomendado:** sonnet
**Agente recomendado:** implementer
**PRD:** `S:\Projetos\academic_page\haroldo\PRD.md`
**Projeto:** `S:\Projetos\academic_page\haroldo`

## Objetivo

A fase 0 fica formalmente fechada: a decisão D-01 vira um ADR versionado, o CHANGELOG
registra a fase, a URL real do Worker substitui o valor provisório no código, e o checklist
§12 do PRD reflete a realidade — 10/10 itens da fase 0.

## Arquivos afetados

- `docs/adr/0001-astro-estatico-sem-adapter.md` — criar
- `docs/CHANGELOG.md` — atualizar a seção "Não publicado"
- `astro.config.mjs` — apenas o valor default de `site`, **se** a URL real divergir
- `src/lib/config.ts` — apenas o valor default de `siteUrl`, **se** a URL real divergir
- `PRD.md` — marcar os itens da fase 0 no checklist §12, atualizar o contador de progresso,
  corrigir a nota desatualizada abaixo da tabela §16 e acrescentar a linha de versão em §0.1

> O executor não toca em arquivo fora desta lista. Se precisar, para e reporta.
> As edições no `PRD.md` são **cirúrgicas**: marcar caixas, corrigir contadores e substituir
> uma frase. **Não** reescreva seções, não mude requisitos, não mexa em §5, §6, §7 nem em
> nenhum texto que não esteja explicitamente listado nos passos.

## Contexto necessário

**Projeto.** `haroldo-page` — site pessoal acadêmico do Prof. Haroldo C. D. Lima Junior
(UFMA). Os planos 001–012 já entregaram: repositório privado no GitHub com CI verde, projeto
Astro 5 estático com TypeScript e Tailwind 4, estrutura de diretórios da §7.5, Prettier,
ESLint, Vitest, `.env.example`, `wrangler.toml`, README, projeto no TinaCloud e Worker
publicado na Cloudflare.

### 1. O ADR

A §7.2 do PRD determina: *"Cada decisão acima deve virar um ADR curto em `docs/adr/` na fase
em que for implementada."* A única decisão **implementada na fase 0** é a **D-01** — as
demais (D-02 visual editing, D-03 i18n, D-04 rascunho, D-05 listas embutidas, D-06 Zod ×
Tina, D-07 URL livre) só se materializam nas fases 1 a 4. **Escreva apenas o ADR-0001.**

Texto integral da D-01, conforme a tabela de §7.2 (use-o como base, não invente motivação):

| ID | Decisão | Alternativa rejeitada | Motivo |
|---|---|---|---|
| D-01 | Astro estático (`output: 'static'`), sem adapter e sem SSR | Astro em modo servidor no Workers | Assets estáticos são ilimitados no plano gratuito e não executam código por requisição; SSR só se justificaria pelo visual editing (D-02) |

Consequências a registrar no ADR, todas rastreáveis a trechos existentes do PRD:
- §7.1: *"Nenhuma rota pública executa código em requisição (…) mantém as requisições fora da
  cota de 100 mil/dia do plano gratuito e elimina uma classe inteira de falhas em produção."*
- RNF-03: *"nenhuma rota pública pode depender de execução de código em requisição."*
- Apêndice A: `@astrojs/cloudflare` (adapter SSR) **não é usado** por D-01.
- `wrangler.toml` **sem chave `main`** (plano 007) é a materialização da decisão.
- Custo do trade-off: como não há SSR, o visual editing do Tina fica indisponível (D-02) e
  qualquer futura funcionalidade que exija render por requisição implicaria revisitar este ADR.
- Evidência empírica: o deploy do plano 012 serviu o site como assets estáticos.

**Formato do ADR** (curto, em português, uma página): Título · Status (Aceita) · Data
(2026-09-01) · Contexto · Decisão · Alternativas consideradas · Consequências · Referências
(§7.1, §7.2 D-01, RNF-03, Apêndice A, `wrangler.toml`).

Nome do arquivo: `docs/adr/0001-astro-estatico-sem-adapter.md` — numeração de quatro dígitos,
para que os próximos ADRs sigam `0002-…`.

### 2. Reconciliação da URL do site

Os planos 002 e 006 usaram o valor **provisório** `https://haroldo-page.workers.dev`. O plano
012 anotou a **URL real** do Worker — tipicamente
`https://haroldo-page.<subdominio-da-conta>.workers.dev`.

- Leia a Evidência do plano 012 (`plans/fase-0-setup-e-provisionamento/012-*.md`) para obter a URL real.
- Se ela **divergir** do provisório, substitua o default nos dois lugares
  (`astro.config.mjs` → `site`; `src/lib/config.ts` → `siteUrl`) e em
  `public/robots.txt` (linha `Sitemap:`), mantendo a leitura de `PUBLIC_SITE_URL` como
  sobrescrita. O teste `tests/lib/config.test.ts` já exige URL absoluta sem barra final —
  ele deve continuar verde.
- Se **não** divergir, não altere nada e registre isso.
- ⚠️ Este ajuste é provisório por natureza: a **Q-05** (domínio próprio) está **em aberto** e
  bloqueia a **fase 5**. Não tente resolvê-la aqui.

### 3. Checklist §12 do PRD — estado alvo da fase 0

Os 10 itens, com o plano que fecha cada um:

| Item do checklist §12 | Fechado por |
|---|---|
| Repositório GitHub criado (privado) com `.gitignore` adequado | 001 + 010 |
| Projeto Astro + TypeScript + Tailwind inicializado; versões fixadas em `package.json` e `.nvmrc` | 001 + 002 |
| Estrutura de diretórios criada conforme §7.5 | 003 |
| Conta/projeto TinaCloud criado e vinculado ao repositório | 011 |
| Conta Cloudflare com Worker criado | 007 + 012 |
| Convenção de link de material definida — URL livre (D-07) | já marcado `[x]` |
| `.env.example` criado e documentado | 006 |
| `README.md` inicial (instalação + como rodar) | 009 |
| Prettier, ESLint e Vitest configurados; CI do GitHub Actions rodando | 004 + 005 + 008 + 010 |
| Q-03 respondida (limite de minutos de build) | já marcado `[x]` |

**Só marque `[x]` o item cujo plano correspondente estiver com Evidência preenchida.** Se
algum não estiver, deixe `[ ]`, não feche a fase e **reporte quais faltam**. A tabela
"📊 Progresso Geral" (§12) precisa passar de `2/10 🟡 Em andamento` para `10/10 🟢 Concluída`
— e o número tem de bater com as caixas efetivamente marcadas.

### 4. Correção de nota desatualizada no PRD

Ao final da §16 (Questões em Aberto), logo abaixo da tabela, há esta frase:

> Nenhuma fase que dependa de uma questão aberta deve começar antes de resolvê-la. Restam
> bloqueando a fase 0: Q-01 (identificação do professor) e Q-08 (conta do Google Drive).
> Q-03 foi resolvida em 2026-09-01.

Ela **contradiz a própria tabela acima dela**: Q-01, Q-03 e Q-08 estão todas marcadas como
resolvidas (`~~Q-01~~`, `~~Q-03~~`, `~~Q-08~~`) na versão v0.1.2. É resíduo da versão v0.1.
Substitua por:

> Nenhuma fase que dependa de uma questão aberta deve começar antes de resolvê-la. Q-01, Q-03
> e Q-08 foram resolvidas em 2026-09-01 e **nenhuma questão aberta bloqueia a fase 0**. As
> pendências restantes bloqueiam fases posteriores: Q-02 (fase 2), Q-04 (fase 3), Q-06 (fase
> 2), Q-05 e Q-07 (fases 3 e 5), Q-09 (pós-entrega).

### 5. Registro de versão do PRD

Acrescente uma linha à tabela §0.1 (Histórico de Versões):

| v0.1.3 | 2026-09-01 | Desenvolvedor | Fase 0 concluída: checklist §12 fechado (10/10); nota residual da §16 corrigida (Q-01/Q-03/Q-08 já resolvidas não bloqueiam a fase 0) |

E atualize o campo **Última atualização** em §0 para a data real da execução, além de
`Repositório` — hoje diz "A criar na fase 0 (GitHub, conta do desenvolvedor)" e deve passar a
citar a URL real do repositório privado criado no plano 010.

### 6. CHANGELOG

`docs/CHANGELOG.md` (criado no plano 003, formato Keep a Changelog, em português) deve
descrever a fase 0 sob "Não publicado → Adicionado", em linguagem de mudança e não de tarefa:
repositório e CI, projeto Astro 5 estático com TypeScript e Tailwind 4, estrutura de
diretórios, ferramentas de qualidade, configuração de ambiente, hospedagem em Workers Static
Assets e ADR-0001. **Não** crie tag nem versão `1.0.0` — a tag `v1.0.0` é entregável da
**fase 5** (checklist §12).

**Convenções da casa aplicáveis:** datas sempre absolutas (`2026-09-01`), nunca "hoje";
documentação em português; Conventional Commits.

**Ambiente.** Windows 11 / PowerShell, a partir de `S:\Projetos\academic_page\haroldo`.
Os arquivos são UTF-8 — preserve os acentos ao editar `PRD.md` (não reescreva o arquivo
inteiro; use edição pontual).

## Passos

1. Ler a seção **Evidência** dos planos 001–012 em `plans/` e montar a lista do que está
   comprovadamente concluído.
   → verify: liste na Evidência quais planos têm Evidência preenchida e quais não têm.
2. Escrever `docs/adr/0001-astro-estatico-sem-adapter.md` no formato descrito.
   → verify: o ADR cita `output: 'static'`, a ausência de `main` no `wrangler.toml`, RNF-03 e
   a rejeição de `@astrojs/cloudflare`.
3. Reconciliar a URL do site conforme a seção 2 do contexto (ou registrar que não houve
   divergência).
   → verify: `npm run test` verde, incluindo `tests/lib/config.test.ts`;
   `Select-String -Path astro.config.mjs,src/lib/config.ts,public/robots.txt -Pattern "workers.dev"`
   mostra a mesma URL nos três.
4. Atualizar `docs/CHANGELOG.md`.
   → verify: a seção "Não publicado → Adicionado" descreve a fase 0; nenhuma tag criada.
5. Marcar no `PRD.md` §12 os itens da fase 0 comprovados e atualizar a linha da tabela de
   progresso para `10/10 🟢 Concluída`.
   → verify: contagem de `- [x]` na seção "Fase 0" do PRD é igual ao número da tabela.
6. Substituir a nota residual da §16 pelo texto da seção 4 do contexto; acrescentar a linha
   v0.1.3 em §0.1; atualizar "Última atualização" e "Repositório" em §0.
   → verify: `Select-String -Path PRD.md -Pattern "Restam bloqueando a fase 0"` não retorna
   nada.
7. Rodar a sequência completa de qualidade: `npm ci; npm run lint; npm run format:check;
   npm run test; npm run build`.
   → verify: os cinco verdes; cole as saídas.
8. Commitar com `docs: registra ADR-0001 e fecha o checklist da fase 0` e fazer push.
   → verify: `git show --stat HEAD` lista os arquivos esperados; a execução do CI no GitHub
   fica **verde** (é também a verificação pendente deixada em aberto pelo plano 008).

## Critérios de aceitação

- [x] `docs/adr/0001-astro-estatico-sem-adapter.md` existe, curto, em português, com Status
      "Aceita" e data absoluta
- [x] Apenas o ADR da D-01 foi escrito (D-02..D-07 são de fases posteriores)
- [x] URL do site coerente entre `astro.config.mjs`, `src/lib/config.ts`, `public/robots.txt`
      e a Evidência do plano 012
- [x] `docs/CHANGELOG.md` descreve a fase 0; nenhuma tag `v1.0.0` criada
- [x] §12 do PRD: os 10 itens da fase 0 marcados e a tabela de progresso em `10/10 🟢`,
      **com as caixas batendo com o contador**
- [x] A frase "Restam bloqueando a fase 0: Q-01 (…) e Q-08 (…)" não existe mais no PRD
- [x] Linha v0.1.3 acrescentada ao histórico §0.1; §0 com data e repositório reais
- [x] `npm run lint`, `npm run format:check`, `npm run test` e `npm run build` verdes
- [x] CI verde no GitHub após o push (fecha a pendência registrada no plano 008)
- [x] Nenhum item do checklist marcado sem Evidência correspondente no plano de origem

## Evidência

Executado na sessão de orquestração em 2026-09-01, sem subagente executor, por decisão do
usuário. Revisão independente por `code-reviewer` sobre o diff.

### 1. Planos 001–012 — Evidência conferida

Auditoria automática de `Status:` e do conteúdo da seção `## Evidência` de cada arquivo:

```
001 | DONE | linhas de evidencia: 40  | placeholder: 0
002 | DONE | linhas de evidencia: 171 | placeholder: 0
003 | DONE | linhas de evidencia: 134 | placeholder: 0
004 | DONE | linhas de evidencia: 121 | placeholder: 0
005 | DONE | linhas de evidencia: 131 | placeholder: 0
006 | DONE | linhas de evidencia: 145 | placeholder: 0
007 | DONE | linhas de evidencia: 91  | placeholder: 0
008 | DONE | linhas de evidencia: 124 | placeholder: 0
009 | DONE | linhas de evidencia: 87  | placeholder: 0
010 | DONE | linhas de evidencia: 83  | placeholder: 0
011 | DONE | linhas de evidencia: 77  | placeholder: 0
012 | DONE | linhas de evidencia: 125 | placeholder: 0
```

Os 12 estão `DONE` e nenhum manteve o placeholder `<Preenchido por quem executou…>`. Nenhum
item do checklist §12 foi marcado sem Evidência no plano de origem.

### 2. ADRs

- `docs/adr/0001-astro-estatico-sem-adapter.md` (59 linhas). Cita `output: 'static'`, a
  ausência de `main` no `wrangler.toml`, RNF-03 e a rejeição de `@astrojs/cloudflare`, com a
  evidência empírica do deploy do plano 012.
- `docs/adr/0002-pin-do-vite-via-overrides.md` (70 linhas), conforme a pendência **P-1**:
  cobre os **três** overrides (`vite` 6.4.3, `sharp` 0.35.4, `esbuild` 0.28.2), com as
  alternativas descartadas e **gatilhos de revisão** por override, incluindo
  `npm ls vite --all` mostrando uma única cópia.

Nenhum ADR foi escrito para D-02..D-07 — são de fases posteriores.

### 3. Pendência P-2 — `tseslint.config` depreciado

`eslint.config.js` migrou de `tseslint.config(...)` para `defineConfig([...])` importado de
`eslint/config` (disponível no `eslint@10.9.1` do projeto). O hint sumiu:

```
antes:  eslint.config.js:16:25 - warning ts(6387): The signature '(...configs:
        InfiniteDepthConfigWithExtends[]): ConfigArray' of 'tseslint.config' is deprecated.
        Result (10 files): 0 errors, 0 warnings, 1 hint

depois: Result (10 files):
        - 0 errors
        - 0 warnings
        - 0 hints
```

### 4. Reconciliação da URL — divergiu

A URL real do Worker (`https://haroldo-page.and-near.workers.dev`, Evidência do plano 012)
**divergiu** do provisório `https://haroldo-page.workers.dev`. Substituída nos três arquivos:

```
astro.config.mjs:40:  site: PUBLIC_SITE_URL ?? 'https://haroldo-page.and-near.workers.dev',
src/lib/config.ts:31:const DEFAULT_SITE_URL = 'https://haroldo-page.and-near.workers.dev';
public/robots.txt:6:# Sitemap: https://haroldo-page.and-near.workers.dev/sitemap-index.xml  (fase 5, RF-30)
```

Conforme a pendência **P-3**, a linha do `Sitemap` **permanece comentada** — reativá-la é da
fase 5 (RF-30). A leitura de `PUBLIC_SITE_URL` como sobrescrita foi preservada nos dois
primeiros. `tests/lib/config.test.ts` segue verde.

### 5. Sequência de qualidade

```
$ npm ci
(sem reescrita do lock — `git status --short package-lock.json` vazio depois)

$ npm run lint
> eslint .
(exit 0, sem saída)

$ npm run format:check
Checking formatting...
All matched files use Prettier code style!

$ npm run test
 Test Files  2 passed (2)
      Tests  12 passed (12)
   Duration  661ms

$ npm run build
Result (10 files):
- 0 errors
- 0 warnings
- 0 hints
[build] 1 page(s) built in 558ms
[build] Complete!
```

### 6. Desvios do plano, registrados

**A linha `v0.1.3` já existia.** O plano manda acrescentar `v0.1.3` ao histórico §0.1, mas
essa versão foi consumida antes, para "§12 atualizada com o progresso real da fase 0 (planos
001–004 DONE)". Acrescentada **`v0.1.4`** no lugar, com o conteúdo que o plano descreve. O
critério de aceitação correspondente foi marcado por equivalência de intenção — a intenção era
registrar o fechamento da fase no histórico, e ela foi cumprida.

**A nota residual da §16 já estava corrigida.** A frase "Restam bloqueando a fase 0: Q-01
(identificação do professor) e Q-08 (conta do Google Drive)" **não existia mais** no PRD; o
texto atual já dizia que nenhuma questão bloqueia a fase 0. Nenhuma substituição foi
necessária. Mas a nota trazia um erro próprio: listava **Q-07 na fase 5**, enquanto a tabela
logo acima diz **fase 3**. Corrigido para "Q-04 e Q-07 (fase 3), Q-05 (fase 5)" — edição
dentro do escopo que o plano autoriza para essa nota.

### 7. Checklist §12

```
marcados: 10 | abertos: 0
| Fase 0 — Setup e provisionamento | 10/10 | 🟢 Concluída |
```

As caixas batem com o contador. Os dois itens que faltavam receberam texto de evidência:
TinaCloud remete ao plano 011 e Cloudflare ao 012, com a URL e a versão do Worker.

`Select-String -Path PRD.md -Pattern "Restam bloqueando a fase 0"` não retorna nada.

### 8. CHANGELOG

`docs/CHANGELOG.md`, seção "Não publicado → Adicionado", reescrita em linguagem de mudança:
site estático publicado, estrutura de diretórios, ferramentas de qualidade, CI, configuração
de ambiente, provisionamento e os dois ADRs. **Nenhuma tag criada** — `v1.0.0` é entregável
da fase 5.

### 9. CI no GitHub Actions

Commit `9150233` empurrado para `origin/main` em 2026-09-01:

```
$ git push origin main
To https://github.com/researchgroups-ufma/haroldo-page.git
   b2dcf2b..9150233  main -> main
```

**Execução verde confirmada pelo usuário** na aba Actions do repositório. A procedência é essa
— o `gh` não está instalado nesta máquina (`gh: command not found`) e a API anônima não servia
para consultar o run enquanto o repositório era privado. Isso fecha também a pendência de
verificação herdada do plano 008.

### 10. O que NÃO foi verificado

- **`Versão do PRD` em §0 continua `v0.1`**, enquanto o histórico §0.1 já vai em `v0.1.4`. É
  inconsistência preexistente e o campo **não está na lista de "Arquivos afetados"** deste
  plano, que manda parar e reportar em vez de estender o escopo. **Reportado, não corrigido.**
- `plans/.idea/` segue untracked, sem decisão sobre entrar no `.gitignore` (dívida registrada
  em `plans/README.md`).

**Divergências doc/código criadas por este próprio plano.** A reconciliação da URL deixou dois
arquivos versionados afirmando o valor provisório. Nenhum dos dois está em "Arquivos afetados",
então **foram reportados, não corrigidos** — mas ambos precisam de correção:

- **`wrangler.toml:5-6`** — o comentário diz que `name` "define o subdomínio
  `haroldo-page.workers.dev`, já usado como `PUBLIC_SITE_URL` provisório nos planos 002 e
  006". As duas metades ficaram falsas: o subdomínio real é `haroldo-page.and-near.workers.dev`
  e nenhum arquivo de código usa mais o provisório.
- **`.env.example:23`** — ainda traz `PUBLIC_SITE_URL=https://haroldo-page.workers.dev`. É o
  mais consequente dos dois: o README manda copiar este arquivo para criar o `.env`, e o valor
  copiado **sobrescreve** o default correto de `astro.config.mjs` e `src/lib/config.ts`. Quem
  seguir a instalação hoje gera um `.env` que aponta para um subdomínio que não existe.

As demais ocorrências de `haroldo-page.workers.dev` estão em Evidências e textos dos planos
002, 003, 006, 007, 012 e neste — são registro histórico do que era verdade na execução e
**não devem ser reescritas**.


---

## Nota do orquestrador — 2026-09-01 (pendência P-1, vinda da revisão do plano 002)

**O critério de aceitação "apenas o ADR da D-01" deste plano fica ampliado: escreva também um
segundo ADR.**

`docs/adr/0002-pin-do-vite-via-overrides.md` — registra o campo `overrides: { vite: "6.4.3" }`
introduzido pelo plano 002. A §10.5 do PRD define `docs/adr/` como "Decisões D-01..D-06 **e
futuras**", o que autoriza um ADR fora da tabela de decisões D.

Contexto técnico já apurado (não precisa reinvestigar): `astro@5.18.2` depende de `vite@^6.4.1`
como dependência dura; `@tailwindcss/vite@4.3.3` declara vite como *peer* `^5.2.0 || ^6 || ^7 || ^8`.
Sem o override o npm iça vite 8 para a raiz e aninha o 6 sob `astro` — duas cópias, e o `Plugin`
de uma não é atribuível ao da outra, quebrando `astro check` com `ts(2322)`. Alternativas
descartadas: declarar `vite` como devDependency direta (acrescenta dependência que o projeto não
usa) e afrouxar o `astro check` (regressão).

**O ADR precisa conter o gatilho de revisão** — é a parte que hoje não existe em lugar nenhum:

> Remover este override quando o `astro` passar a exigir vite ≥ 7.
> Validar com `npm ls vite --all` mostrando uma única cópia.

A justificativa completa está na seção `## Evidência` de `plans/fase-0-setup-e-provisionamento/002-scaffolding-astro-typescript-tailwind.md`.

---

## Nota do orquestrador — 2026-09-01 (pendências P-2 e P-3, vindas da revisão dos planos 003 e 004)

**P-2 — API depreciada do `tseslint.config`.** Todo `npm run build` emite um hint do `astro check`
sobre uso de API depreciada em `eslint.config.js`. Não é erro nem warning (o `astro check` só
falha com erros), mas a fase 0 fecha com "build verde" como critério e o hint aparece em toda
execução daqui em diante. A migração é de uma linha: trocar `tseslint.config(...)` por
`defineConfig([...])` importado de `eslint/config`. Faça a troca e confirme que `npm run lint`,
`npm run format:check` e `npm run build` seguem verdes.

**P-3 — reconciliação da URL e do `robots.txt`.** O passo 3 e o critério "URL do site coerente
entre `astro.config.mjs`, `src/lib/config.ts` e `public/robots.txt`" precisam ser reescritos:
a linha do `Sitemap` no `robots.txt` está **comentada** desde a revisão do plano 003, e assim
deve permanecer até a fase 5. O `Select-String` por `workers.dev` continua funcionando (a linha
comentada preserva a string), mas o critério não pode exigir um `Sitemap` ativo.

A fase 5 (RF-30) herda a obrigação de reativar a linha do `Sitemap`, remover o `Disallow: /`
e remover o `X-Robots-Tag: noindex` do `public/_headers` (plano 007) — registre isso no
fechamento da fase 0 para não se perder.
