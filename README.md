# haroldo-page

Site pessoal acadêmico do Prof. Haroldo Cilas Duarte Lima Junior, Professor Adjunto A do
Departamento de Física da UFMA. O conteúdo (perfil, linhas de pesquisa, projetos,
disciplinas e publicações) é editado pelo professor por um painel próprio; todo o resto do
projeto — código, layout, integrações e infraestrutura — é de responsabilidade do
desenvolvedor.

A fonte de verdade sobre requisitos, arquitetura e decisões é o `PRD.md`.

## Stack

- **Astro 7** — site 100% estático (`output: 'static'`), sem servidor por requisição.
- **TypeScript** — em modo estrito, para os schemas de conteúdo e o código de `src/`.
- **Tailwind CSS 4** — via plugin Vite (`@tailwindcss/vite`).
- **TinaCMS** — painel de edição em `/admin`. **Ainda não existe neste repositório** —
  entra na fase 1 do PRD.
- **Cloudflare Workers (Static Assets)** — hospedagem dos arquivos gerados pelo build.

## Requisitos

- **Node** na versão fixada em `.nvmrc` (major `24`; testado com `v24.16.0`).
- **npm** (vem com o Node; testado com `11.13.0`).
- **Git**.

Não é necessário Python nem nenhuma outra linguagem — o projeto é inteiramente
JavaScript/TypeScript.

## Instalação

```bash
git clone https://github.com/researchgroups-ufma/haroldo-page.git
cd haroldo-page
```

O requisito real é **Node 24.x** — o `nvm` é só uma forma conveniente de chegar lá, não é
obrigatório. Se tiver `nvm` instalado:

```bash
nvm use
```

No Windows, o `nvm-windows` historicamente **não lê o `.nvmrc`** — `nvm use` sem argumento
pode não trocar de versão nenhuma, em silêncio. Se for o seu caso, rode com a versão
explícita:

```bash
nvm use 24
```

Depois, confirme que deu certo:

```bash
node --version   # precisa responder v24.x
```

Instale as dependências a partir do `package-lock.json`:

```bash
npm ci
```

Copie o arquivo de variáveis de ambiente de exemplo:

```powershell
Copy-Item .env.example .env    # PowerShell
```

```bash
cp .env.example .env           # bash
```

O `.env` não é necessário para `npm run build`, `npm run test` ou `npm run lint` hoje — só
passa a ser exigido quando o TinaCMS for integrado (fase 1). Ver a seção
[Variáveis de ambiente](#variáveis-de-ambiente).

## Comandos

| Comando                 | O que faz                                                                                   |
| ----------------------- | ------------------------------------------------------------------------------------------- |
| `npm run dev`           | Sobe o servidor de desenvolvimento do Astro em `http://localhost:4321`                      |
| `npm run start`         | Alias de `npm run dev`                                                                      |
| `npm run build`         | `astro check` (checagem de tipos) seguido de `astro build`; gera `dist/`                    |
| `npm run preview`       | Serve localmente o conteúdo já buildado em `dist/`                                          |
| `npm run astro`         | Passthrough para a CLI do Astro (`npm run astro -- <comando>`, ex.: `npm run astro -- add`) |
| `npm run lint`          | ESLint sobre todo o projeto                                                                 |
| `npm run lint:fix`      | ESLint com correção automática                                                              |
| `npm run format`        | Formata todo o projeto com Prettier                                                         |
| `npm run format:check`  | Verifica formatação sem alterar arquivos (usado no CI)                                      |
| `npm run test`          | Roda a suíte de testes (Vitest) uma vez                                                     |
| `npm run test:watch`    | Roda a suíte em modo watch                                                                  |
| `npm run test:coverage` | Roda a suíte com relatório de cobertura                                                     |
| `npm run deploy`        | `npm run build` seguido de `wrangler deploy` (deploy manual)                                |

## Estrutura de pastas

```text
haroldo-page/
├── README.md            # este arquivo
├── PRD.md                # fonte de verdade de requisitos e arquitetura
├── astro.config.mjs
├── wrangler.toml
├── package.json
├── .nvmrc
├── .env.example
├── .github/workflows/    # CI: lint, format:check, test, build
├── content/              # ← domínio do PROFESSOR (via painel, quando existir)
│   ├── perfil/
│   ├── linhas-pesquisa/
│   ├── projetos/
│   ├── disciplinas/
│   └── publicacoes/
├── public/
│   └── uploads/          # imagens enviadas pelo painel
├── src/                  # ← domínio do DESENVOLVEDOR
├── tests/                # espelha src/ — Vitest
├── docs/
│   ├── adr/               # decisões de arquitetura (D-01..D-06 e futuras)
│   └── CHANGELOG.md
└── scripts/               # utilitários de manutenção
```

A fronteira é explícita: **o professor altera apenas `content/` e `public/uploads/`, sempre
pelo painel; o desenvolvedor é dono de todo o resto** (§7.5 do PRD).

## Painel de edição

O painel TinaCMS, em `/admin`, ainda **não está implementado neste repositório**. Ele entra
na fase 1 do PRD (modelo de conteúdo) e, quando existir, este README será atualizado com o
comando para rodá-lo localmente.

## Deploy

Hoje o deploy é **manual**:

```bash
npm run deploy
```

Isso roda `astro build` (gera `dist/`) e em seguida `wrangler deploy`, que publica o
conteúdo de `dist/` no Cloudflare Workers (Static Assets), conforme `wrangler.toml`.

O deploy automático a cada push na branch principal (Cloudflare Workers Builds conectado ao
repositório) só é ligado na **fase 2** do PRD.

O site é servido inteiramente como assets estáticos, sem SSR e sem adapter (decisão D-01 do
PRD): não há código rodando por requisição, então **nunca adicione um `adapter` ao
`astro.config.mjs`** — isso mudaria a natureza do deploy e da hospedagem.

## Variáveis de ambiente

Todas as variáveis estão documentadas com comentários em `.env.example`: `TINA_CLIENT_ID`,
`TINA_TOKEN`, `TINA_BRANCH` e `PUBLIC_SITE_URL` (ver §7.6 do PRD para o detalhamento de cada
uma).

**`TINA_TOKEN` nunca vai para o repositório.** É um segredo — vive apenas no `.env` local
(fora do versionamento, listado no `.gitignore`) e, em produção, nas variáveis de ambiente do
Cloudflare Workers Builds e do GitHub Actions.

## Qualidade

Antes de abrir um PR, rode localmente:

```bash
npm run lint
npm run format:check
npm run test
npm run build
```

O CI (`.github/workflows/ci.yml`) roda exatamente essa sequência (`npm ci` → `lint` →
`format:check` → `test` → `build`) em todo push e pull request para `main`. Suíte verde é
pré-requisito de merge (§11 do PRD, RNF-10).

## Troubleshooting

**Versão de Node errada.** Se `npm run build` ou `npm run test` falharem de forma estranha,
confira `node -v` contra o major fixado em `.nvmrc`. Com `nvm`, rode `nvm use` na raiz do
projeto.

**`npm ci` falhando por lock dessincronizado.** `npm ci` exige que `package-lock.json` esteja
em sincronia com `package.json`; se falhar com erro de integridade, alguém alterou uma
dependência sem regenerar o lock — rode `npm install` uma vez para atualizar o lock e
commite o resultado.

**`format:check` verde no Windows e vermelho no CI (CRLF vs LF).** O `.gitattributes` do
projeto normaliza os finais de linha; se ainda assim divergir, rode `npm run format`
localmente antes de commitar em vez de editar o Prettier.

**Tutorial de Astro 4 ou 5 não serve para este projeto.** O upgrade para o Astro 7
(2026-09-01) trouxe mudanças que quebram exemplos antigos, e elas atingem exatamente o
código de conteúdo: as coleções legadas foram removidas — usa-se a **Content Layer API** com
o loader `glob()` —, o Zod subiu para a **versão 4** (`z.string().email()` virou `z.email()`)
e o `z` agora vem de **`astro/zod`**; `astro:schema` e o `z` exportado por `astro:content`
não existem mais. O arquivo de schemas é `src/content.config.ts`.

**O `package.json` não tem `overrides` — e não deve voltar a ter sem motivo escrito.** Houve
três (`vite`, `sharp`, `esbuild`), removidos no upgrade do Astro: o 7 exige `vite ^8.0.13` e
já pede nativamente as versões corrigidas de `sharp` e `esbuild`. `npm audit` está em **zero
vulnerabilidades**. A história completa, com o que motivou cada pin e por que cada um caiu,
está em `docs/adr/0002-pin-do-vite-via-overrides.md`.
