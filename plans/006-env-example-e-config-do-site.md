# Plano 006 — `.env.example` documentado e `src/lib/config.ts`

**Status:** TODO
**RFs cobertos:** — (Fase 0, item 7 do checklist §12; §7.6, RNF-07, §10.4)
**Depende de:** plano 003
**Modelo recomendado:** sonnet
**Agente recomendado:** implementer
**PRD:** `S:\Projetos\academic_page\haroldo\PRD.md`
**Projeto:** `S:\Projetos\academic_page\haroldo`

## Objetivo

As quatro variáveis de ambiente do projeto passam a estar documentadas em `.env.example`, e
os valores de configuração do site (título, URL canônica, idiomas, dados institucionais)
passam a viver num único módulo tipado `src/lib/config.ts` — em vez de espalhados pelos
componentes, o que a §7.6 e a §10.4 proíbem.

## Arquivos afetados

- `.env.example` — criar
- `src/lib/config.ts` — criar
- `tests/lib/config.test.ts` — criar (garante que a configuração é coerente)

> O executor não toca em arquivo fora desta lista. Se precisar, para e reporta.
> **Jamais** crie, edite ou commite um `.env` real. Se um `.env` já existir no disco, não o
> abra e não o cite em lugar nenhum.

## Contexto necessário

**Projeto.** `haroldo-page` — site pessoal acadêmico do Prof. Haroldo C. D. Lima Junior
(UFMA). Astro 5 estático, TypeScript strict, Tailwind 4. Planos 001–005 já entregaram
repositório, scaffolding, estrutura de diretórios, lint e Vitest.

**§7.6 do PRD, transcrita (é a especificação deste plano):**

> - **Variáveis de ambiente** (documentadas em `.env.example`): `TINA_CLIENT_ID` (público),
>   `TINA_TOKEN` (token de leitura do TinaCloud), `TINA_BRANCH`, `PUBLIC_SITE_URL`.
> - `TINA_TOKEN` vive exclusivamente em variável de ambiente — no `.env` local (fora do
>   versionamento) e nas variáveis do Cloudflare Workers Builds e do GitHub Actions. Nunca em
>   arquivo commitado.
> - Valores de configuração do site (título, idiomas, rótulos de navegação, URL canônica)
>   ficam em `src/lib/config.ts` e nos dicionários de `src/i18n/` — nunca espalhados pelos
>   componentes.
> - Nenhum segredo é necessário no navegador: o site público é estático e não faz chamada
>   autenticada.

**Origem dos valores de cada variável** (o executor não precisa provisionar nada — os
valores reais saem dos planos 011 e 012, que são roteiros humanos):

| Variável | De onde vem o valor real | Vai no bundle do navegador? |
|---|---|---|
| `TINA_CLIENT_ID` | painel do TinaCloud, ao criar o projeto (plano 011) | é público, mas **não** prefixe com `PUBLIC_` — quem o injeta é o build do Tina, na fase 1 |
| `TINA_TOKEN` | TinaCloud → token de leitura (plano 011) | **NUNCA.** É segredo |
| `TINA_BRANCH` | nome da branch principal do repositório: `main` | não |
| `PUBLIC_SITE_URL` | URL do Worker, confirmada no plano 012 | sim — o prefixo `PUBLIC_` do Astro expõe ao cliente |

**Armadilha do Astro que precisa estar clara no `.env.example`:** no Astro, **apenas**
variáveis com prefixo `PUBLIC_` chegam ao navegador; todas as outras ficam restritas ao
build. Portanto **nunca** renomeie `TINA_TOKEN` para `PUBLIC_TINA_TOKEN` — isso vazaria o
segredo no HTML gerado (violaria RNF-07 e a §9).

**Valor provisório de `PUBLIC_SITE_URL`:** `https://haroldo-page.workers.dev`. Não há domínio
próprio (premissa A-07; Q-05 em aberto, bloqueia a fase 5 e **não** a fase 0). O plano 002
já usou esse mesmo default em `astro.config.mjs` — os dois devem continuar coerentes.

**Dados institucionais fechados (Apêndice C do PRD, extraídos do Lattes, Q-01 resolvida em
2026-09-01)** — use exatamente estes, e nada além:

| Campo | Valor |
|---|---|
| Nome | Haroldo Cilas Duarte Lima Junior |
| Nome em citações | LIMA JUNIOR, HAROLDO C. D. |
| Cargo | Professor Adjunto A |
| Instituição | Universidade Federal do Maranhão (UFMA) |
| Unidade | Centro Tecnológico — Departamento de Física |

**Fronteira importante:** esses dados aparecem em `config.ts` apenas como **metadados do
site** (título das páginas, autor do Open Graph, JSON-LD futuro). Os mesmos dados como
**conteúdo** (biografia, formação, links do Lattes/ORCID) são da coleção `perfil`, editável
pelo professor, e entram na **fase 1** — não os duplique aqui. Regra prática: se o professor
deve poder mudar pelo painel, **não** vai em `config.ts`.

**Não coloque e-mail em `config.ts`.** A Q-07 (o e-mail exibido publicamente é
institucional?) está **em aberto** e bloqueia a fase 3. O e-mail é campo obrigatório da
coleção `perfil` (§7.3) e entra pelo painel, com a restrição de LGPD da §9 (institucional,
nunca pessoal).

**Idiomas.** Português é o idioma canônico, na raiz; inglês em `/en` (D-03, RN-09). A
configuração de i18n completa — dicionários, fallback por campo, roteamento — é **fase 4**.
Aqui, apenas a lista de locales e o locale padrão, para que `astro.config.mjs` e os
dicionários futuros bebam da mesma fonte:
`locales: ['pt', 'en'] as const`, `defaultLocale: 'pt'`.

**§10 do PRD é normativa** para `src/lib/config.ts`:
- cabeçalho de arquivo obrigatório (bloco da §10.1, o mesmo já usado em `src/lib/slug.ts`);
- TSDoc em tudo que for exportado;
- **`any` proibido**; use `as const` e tipos derivados (`export type Locale = (typeof
  siteConfig.locales)[number];`);
- código e identificadores **em inglês**; os *valores* de texto ficam em português.

**Ambiente.** Windows 11 / PowerShell, a partir de `S:\Projetos\academic_page\haroldo`.

## Passos

1. Criar `.env.example` com as quatro variáveis, cada uma precedida de um comentário de uma
   linha em português dizendo o que é, de onde vem o valor e se é segredo. Incluir aviso no
   topo: "copie para `.env` e preencha; o `.env` está no `.gitignore` e nunca deve ser
   commitado (§7.6)". Deixe `TINA_CLIENT_ID` e `TINA_TOKEN` com valor vazio,
   `TINA_BRANCH=main` e `PUBLIC_SITE_URL=https://haroldo-page.workers.dev`.
   → verify: `Get-Content .env.example` mostra as 4 variáveis; `git check-ignore -v .env`
   confirma que o `.env` real seguiria ignorado.
2. Criar `src/lib/config.ts` exportando um `siteConfig` `as const` com, no mínimo:
   `siteUrl` (lendo `import.meta.env.PUBLIC_SITE_URL` com fallback para o valor provisório),
   `title`, `shortTitle`, `description`, `author` (nome + nome em citações), `institution`,
   `department`, `role`, `locales`, `defaultLocale`. Mais o tipo `Locale` derivado.
   → verify: `npx astro check` sem erro de tipo.
3. Criar `tests/lib/config.test.ts` verificando: (a) `siteUrl` é uma URL absoluta válida e
   **sem barra final** (`new URL(siteConfig.siteUrl)` não lança; não termina em `/`);
   (b) `defaultLocale` está contido em `locales`; (c) `locales` é exatamente `['pt', 'en']`;
   (d) `author.name` é `'Haroldo Cilas Duarte Lima Junior'`.
   → verify: `npm run test` verde, com os testes novos somando aos de `slug`.
4. Rodar `npm run lint`, `npm run format:check` e `npm run build`.
   → verify: os três verdes.
5. Commitar com `feat: adiciona .env.example e configuração central do site`.
   → verify: `git show --stat HEAD` lista `.env.example`, `src/lib/config.ts` e o teste —
   **e nenhum arquivo `.env`**.

## Critérios de aceitação

- [ ] `.env.example` documenta `TINA_CLIENT_ID`, `TINA_TOKEN`, `TINA_BRANCH`, `PUBLIC_SITE_URL`
- [ ] Nenhuma variável de segredo recebeu prefixo `PUBLIC_`
- [ ] Nenhum `.env` real foi criado nem commitado (`git show --stat HEAD` comprova)
- [ ] `src/lib/config.ts` sem `any`, com cabeçalho §10.1 e TSDoc
- [ ] `tests/lib/config.test.ts` passa com as quatro asserções descritas
- [ ] `config.ts` **não** contém e-mail (Q-07 em aberto) nem dados que o professor deva
      editar pelo painel
- [ ] `npm run lint`, `npm run format:check`, `npm run test` e `npm run build` verdes

## Evidência

<Preenchido pelo executor: saída de `npm run test`, `npm run build` e `git show --stat HEAD`.>

---

## Nota do orquestrador — 2026-09-01 (pendência P-2, vinda da revisão do plano 002)

**Verifique empiricamente antes de documentar `PUBLIC_SITE_URL` como variável de `.env`.**

O `astro.config.mjs` criado pelo plano 002 lê `process.env.PUBLIC_SITE_URL`. O arquivo de
configuração do Astro é carregado **antes** de o `.env` ser aplicado ao processo — o caminho
suportado para ler `.env` ali é o `loadEnv` do Vite. Ou seja, há risco concreto de alguém pôr
`PUBLIC_SITE_URL` no `.env` local, buildar, e o `site` continuar no default sem nenhum aviso.

**O que fazer:** defina `PUBLIC_SITE_URL` no `.env`, rode `npm run build` e inspecione o
canonical/`site` no `dist/`. Conforme o resultado:

- se **não** for lido do `.env`: documente isso explicitamente no `.env.example`
  ("esta variável vem do ambiente real — shell, GitHub Actions, Cloudflare — não do `.env`"); **ou**
- troque `process.env` por `loadEnv` no `astro.config.mjs` (acrescente o arquivo à lista de
  "Arquivos afetados" ao fazê-lo).

Cole a evidência da verificação na seção `## Evidência` deste plano, seja qual for o resultado.
