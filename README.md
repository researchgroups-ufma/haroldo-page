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
- **TinaCMS** — painel de edição em `/admin` (ver [Painel de edição](#painel-de-edição)).
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

O `.env` **é exigido por `npm run build`** (e por `npm run deploy`, que o inclui): o script
começa por `tinacms build`, que precisa de `TINA_CLIENT_ID`/`TINA_TOKEN` para falar com o
TinaCloud — sem eles o comando aborta com `Client not configured properly`, a mesma falha que
deixou o CI vermelho por 14 commits antes de os secrets serem configurados. `npm run test` e
`npm run lint` rodam sem `.env`. Ver a seção
[Variáveis de ambiente](#variáveis-de-ambiente).

## Comandos

| Comando                  | O que faz                                                                                                                                                                                                                                                                                                                                                                                   |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm run dev`            | `tinacms dev -c "astro dev"` — sobe o servidor do Tina e encadeia o `astro dev`. **Não serve para rodar o painel no Astro 7** (ver [Painel de edição](#painel-de-edição))                                                                                                                                                                                                                   |
| `npm run start`          | `astro dev` puro, sem o servidor do Tina — só o site, sem `/admin` funcional                                                                                                                                                                                                                                                                                                                |
| `npm run build`          | `tinacms build` (regenera o schema derivado do Tina) seguido de `astro check` (checagem de tipos) e `astro build`; gera `dist/`                                                                                                                                                                                                                                                             |
| `npm run build:pipeline` | Usado pelos pipelines automáticos (GitHub Actions e, a partir do plano 025, Cloudflare Workers Builds). Tem a mais `vitest run tests/content` antes do build, e a menos o cloud check do TinaCloud (`tinacms build --skip-cloud-checks` em vez de `tinacms build`) — ver `docs/adr/0009-build-de-pipeline-sem-cloud-check.md`. **Não substitui** `npm run build` como portão pré-push local |
| `npm run preview`        | Serve localmente o conteúdo já buildado em `dist/`                                                                                                                                                                                                                                                                                                                                          |
| `npm run astro`          | Passthrough para a CLI do Astro (`npm run astro -- <comando>`, ex.: `npm run astro -- add`)                                                                                                                                                                                                                                                                                                 |
| `npm run lint`           | ESLint sobre todo o projeto                                                                                                                                                                                                                                                                                                                                                                 |
| `npm run lint:fix`       | ESLint com correção automática                                                                                                                                                                                                                                                                                                                                                              |
| `npm run format`         | Formata todo o projeto com Prettier                                                                                                                                                                                                                                                                                                                                                         |
| `npm run format:check`   | Verifica formatação sem alterar arquivos (usado no CI)                                                                                                                                                                                                                                                                                                                                      |
| `npm run test`           | Roda a suíte de testes (Vitest) uma vez                                                                                                                                                                                                                                                                                                                                                     |
| `npm run test:watch`     | Roda a suíte em modo watch                                                                                                                                                                                                                                                                                                                                                                  |
| `npm run test:coverage`  | Roda a suíte com relatório de cobertura                                                                                                                                                                                                                                                                                                                                                     |
| `npm run deploy`         | `npm run build` seguido de `wrangler deploy` — caminho manual de emergência (com cloud check — ver [Deploy](#deploy))                                                                                                                                                                                                                                                                       |

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
├── .github/workflows/    # ci.yml (audit, lint, format:check, test:coverage, build:pipeline) e vigia-do-deploy.yml (notifica o ADMIN)
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

O painel TinaCMS mora em `/admin`. **`npm run dev` não sobe o painel no Astro 7** — é um engano
conhecido, não um erro de configuração: sem TTY, o `astro dev` daemoniza (`Dev server running at
http://localhost:4321 (pid N)` / `Stop: astro dev stop`), o processo em primeiro plano encerra
imediatamente e o `tinacms dev -c "astro dev"` morre junto (`child process exited with code 0`).
A porta 4321 continua respondendo `200` e o `/admin` abre, mas o servidor do Tina (porta 4001)
está morto, e a tela mostra **"Failed loading TinaCMS assets"**.

O que funciona é subir os dois servidores separadamente:

```bash
npx astro dev --background --force
npx tinacms dev
```

Com os dois no ar, abra <http://localhost:4321/admin> — o painel edita os arquivos das cinco
coleções de `content/` (`perfil`, `linhas-pesquisa`, `projetos`, `disciplinas`, `publicacoes`)
diretamente no disco, por formulário. Exige o `.env` preenchido (`TINA_CLIENT_ID`, `TINA_TOKEN`,
`TINA_BRANCH` — ver [Variáveis de ambiente](#variáveis-de-ambiente)).

Ao terminar, `npx astro dev stop` e finalizar manualmente os processos `node` do `tinacms dev`
(ele costuma deixar mais de um processo pendente).

O painel é só por formulários — sem edição visual/contextual (D-02), que exigiria
`output: 'server'` e contradiria D-01. `tina/config.ts` define o schema; `tina/__generated__/`
e `public/admin/` são artefatos derivados dele, gerados por `tinacms dev`/`tinacms build` e
fora do versionamento (ver `.gitignore`) — `npm run build` os regenera antes do `astro build`.

**`tina/tina-lock.json` é a exceção — o único artefato do Tina que fica versionado.**
Diferente dos dois acima, ele precisa estar em `main` para o TinaCloud indexar a branch; sem
ele, o painel de administração do TinaCloud mostra "No Tina config was found on main" mesmo
com o `tina/config.ts` presente e legível no repositório — foi exatamente o que travou este
projeto até o arquivo ser versionado. Ele também não é gerado por `tinacms build` (que roda
no `npm run build`) — só por `tinacms dev`. Na prática: quem mudar o schema em
`tina/config.ts` precisa subir `npx tinacms dev` uma vez (mesmo que só para deixá-lo indexar e
derrubar em seguida) e commitar o `tina/tina-lock.json` atualizado junto com a mudança de
schema. A coerência entre os dois arquivos é verificada automaticamente por
`tests/content/tina-lock-coerente.test.ts`, que reprova a suíte se o lock ficar defasado.

## Pipeline de publicação

Desde 2026-09-11 (fase 2, planos 025 e 026) o deploy é **automático**: todo push na `main`
dispara, ao mesmo tempo, dois pipelines independentes — o CI (`.github/workflows/ci.yml`, o
portão de qualidade) e o Cloudflare Workers Builds (o build que de fato publica). Esta seção
responde às cinco perguntas que quem chega sem contexto precisa fazer. Os números vêm das
Evidências dos planos citados — nada aqui é estimado.

**1. O que acontece quando o professor clica em Salvar.** A cadeia inteira é: painel (`/admin`) →
TinaCloud (grava o commit) → `main` no GitHub → Cloudflare Workers Builds dispara → roda
`npm run build:pipeline` → `npx wrangler deploy` → versão nova no Worker. Tempos **medidos**, não
estimados: o primeiro build automático da fase levou **2m02s**, do início ao fim (plano 025, build
`ace5b1b9`); uma edição real salva pelo painel disparou o build seguinte **2 s** depois do commit
(plano 026, build `8aa9d0db`); e no experimento do plano 028, um build de reversão bem-sucedido
levou **1m59s** (`43d03ba9`, 22:05:30Z→22:07:29Z) e um build que falhou por conteúdo inválido levou
**47 s** (`f9650b87`, 20:34:27Z→20:35:14Z — falha rápida porque o portão de conteúdo roda primeiro).
**O que isto não mede:** o ciclo ponta a ponta do professor até uma página exibindo o texto novo
(M-02). Não existe página que renderize conteúdo até a fase 3 — o que está medido acima é a cadeia
até a versão nova publicada no Worker. M-02 é medida (e remedida) só na **fase 5** (plano 029),
com o site público já existindo.

**2. Quem roda o quê.** O GitHub Actions (job `qualidade`) e o Cloudflare Workers Builds disparam
no **mesmo push** e **correm em paralelo** — a Cloudflare não espera o `conclusion` do CI antes de
publicar (confirmado nos planos 025, 026, 030 e 031: os dois check runs aparecem juntos no mesmo
commit, cada um com seu próprio resultado). **O CI não é portão do deploy.** O que protege o site
de conteúdo inválido é o próprio `build:pipeline` **do build de deploy**: ele roda
`vitest run tests/content` antes de qualquer outra coisa, e é esse portão (arquivo inválido em
`content/`, plano 030; `tina/tina-lock.json` defasado, plano 031) que aborta o deploy se o
conteúdo não validar. Isso é deliberado —
[`docs/adr/0009-build-de-pipeline-sem-cloud-check.md`](docs/adr/0009-build-de-pipeline-sem-cloud-check.md) —
e contraria a expectativa comum de que "CI verde" implica "seguro para publicar": aqui os dois são
independentes.

**3. Onde vive cada variável de ambiente.** Três lugares, e nenhum deles é o mesmo tipo de coisa:
`.env` local (máquina do desenvolvedor, fora do versionamento); secrets do GitHub Actions
(`TINA_CLIENT_ID` e `TINA_TOKEN`, injetados no passo de build do `ci.yml` desde `82fb4de`); e as variáveis de **build** do Cloudflare Workers Builds (`TINA_CLIENT_ID`,
`PUBLIC_SITE_URL` e `TINA_TOKEN`, em _Settings → Build → Build variables and secrets_ — **não** em
_Settings → Variables & Secrets_, que é para variáveis de **runtime** e que a própria plataforma
recusa aqui: _"Variables cannot be added to a Worker that only has static assets"_, achado do
plano 025, e é a D-01 sendo cumprida pela plataforma). Só **`TINA_TOKEN`** é segredo — mascarado em
todo painel e nunca colado em nenhuma Evidência. `TINA_CLIENT_ID` e `PUBLIC_SITE_URL` não são:
o primeiro fica embutido em texto claro no bundle do painel (verificado no plano 026), o segundo é
prefixado `PUBLIC_` de propósito. Ver [Variáveis de ambiente](#variáveis-de-ambiente) e §7.6 do
PRD para o detalhamento de cada uma. `TINA_BRANCH` não é necessária nos pipelines automáticos:
`tina/config.ts` já cai em `'main'` por padrão.

**4. O que acontece quando o build falha.** Comportamento medido no experimento controlado do
plano 028 (erro real do professor — um item de lista salvo com subcampo obrigatório vazio):
o site **continua no ar com a versão anterior** (RNF-04 — a versão publicada não mudou durante
1h33 de `main` quebrada), o conteúdo inválido **permanece no repositório** para correção (F-02), e
o log do build nomeia **o arquivo e o campo** que quebraram, no formato de F-09 (ex.:
`content/disciplinas/2025.1-mecanica-classica.md → campo 'aulas.0.numero': expected number`).
**Como o ADMIN fica sabendo:** a Cloudflare **não** oferece notificação nativa de falha do Workers
Builds (medido no plano 028: `alerting/v3/available_alerts` sem nenhum tipo para Workers Builds, e
o painel confirma a ausência da opção). O aviso vem de
[`.github/workflows/vigia-do-deploy.yml`](.github/workflows/vigia-do-deploy.yml) — um workflow
**agendado uma vez por dia** (12:17 UTC) mais `workflow_dispatch`, que lê o check run
`Workers Builds: haroldo-page` do commit mais recente da `main` e **reprova** se esse build falhou,
ou se o check está ausente há mais de 30 min (sintoma do app GitHub↔Cloudflare desconectado, como
no plano 025). A reprovação do workflow é o que gera o e-mail de falha do GitHub ao ADMIN — decisão
e alternativas rejeitadas em
[`docs/adr/0011-vigia-agendado-da-falha-de-build.md`](docs/adr/0011-vigia-agendado-da-falha-de-build.md).
**Para diagnosticar:** o link do build da Cloudflare vem no próprio log do vigia (ex.: run de
`workflow_dispatch`, plano 028); o log do build lá mostra a mesma mensagem de arquivo e campo.
Quatro coisas que quem mantém o projeto precisa saber:

- **O vigia desliga sozinho.** _"In a public repository, scheduled workflows are automatically
  disabled when no repository activity has occurred in 60 days."_ Se passarem 60 dias sem
  atividade neste repositório público, o vigia para de rodar sozinho — reative em
  _Actions → Vigia do deploy → Enable workflow_.
- **O destinatário do e-mail é quem alterou o cron por último**, não um endereço fixo — é assim
  que o GitHub trata notificação de workflow agendado. Trocar de ADMIN implica essa pessoa
  commitar a linha `cron:` do arquivo.
- **O assunto do e-mail não diz qual workflow falhou.** O assunto `Run failed` foi transcrito para
  o e-mail do CI (plano 028); para o do vigia, só o horário e o trecho do corpo
  ("Vigia do deploy: All jobs have failed") foram transcritos, e o mesmo assunto `Run failed` é
  **inferido** pela forma do e-mail do CI, não medido diretamente. De um jeito ou de outro, só o
  corpo do e-mail diz qual dos dois workflows falhou.
- **Pendência nomeada, ainda aberta:** o caminho `schedule` (o cron diário) nunca foi observado
  rodando de fato — o plano 028 provou a detecção e o e-mail só via `workflow_dispatch` disparado
  manualmente, cujo e-mail segue outra regra (vai para quem disparou). Fecha quando aparecer ao
  menos uma execução `event: schedule` no histórico do workflow, seguida de uma falha real
  notificada por ela (condição escrita no ADR-0011).

**5. O que fazer para mudar o schema**, agora que os pipelines automáticos não rodam o cloud check
do TinaCloud (ADR-0009): a ordem continua sendo revisão → commit → push → TinaCloud reindexa a
`main` → `npm run build` **local, com cloud check**, verde. Além disso, quem mudar
`tina/config.ts` precisa subir `npx tinacms dev` uma vez (só para deixá-lo indexar e derrubar em
seguida) e commitar o `tina/tina-lock.json` atualizado junto — é o único artefato do Tina que fica
versionado, e é dele que o TinaCloud depende para indexar a branch. Desde o plano 031, essa
coerência deixou de ser só documentação: `tests/content/tina-lock-coerente.test.ts` compara a
árvore declarativa dos dois arquivos e reprova a suíte (no CI e no `build:pipeline`) se o lock
ficar defasado — ver [Painel de edição](#painel-de-edição).

## Deploy

`npm run deploy` continua existindo, mas como **caminho manual de emergência** — não é o caminho
normal desde que o Workers Builds foi ligado ao repositório (plano 025, 2026-09-11). Desde a
emenda de 2026-09-12 (revisão de integração da fase 2, ADR-0009 ponto 4), ele roda
`vitest run tests/content && npm run build && wrangler deploy`: o mesmo portão de conteúdo que os
pipelines automáticos rodam em `build:pipeline`, **mais** o cloud check do TinaCloud que
`npm run build` já tinha. Use-o só se o Workers Builds estiver indisponível:

```bash
npm run deploy
```

Isso roda `vitest run tests/content` (recusa conteúdo inválido salvo pelo painel), depois
`npm run build` (gera `dist/`) e em seguida `wrangler deploy`, que publica o conteúdo de `dist/`
no Cloudflare Workers (Static Assets), conforme `wrangler.toml`.

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

O CI (`.github/workflows/ci.yml`) roda `npm ci` → `npm audit --audit-level=high` → `lint` →
`format:check` → `test:coverage` → `build:pipeline` em todo push e pull request para `main`. O
passo de audit reprova em `high`/`critical` e só relata `moderate`/`low` (`docs/adr/0010-npm-audit-no-ci-e-severidade.md`).
O último passo troca `npm run build`
por `npm run build:pipeline` porque o cloud check do TinaCloud não é sinal de defeito do pipeline
em nenhum dos dois gatilhos: em push para `main` o commit já está lá por construção e o que
resta é uma corrida contra a reindexação assíncrona, e em pull request o schema do branch nunca
foi indexado (só `main` é indexado), então o cloud check falharia de forma determinística (ver
`docs/adr/0009-build-de-pipeline-sem-cloud-check.md`). Suíte verde é
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
já pede nativamente as versões corrigidas de `sharp` e `esbuild`. A história completa, com o
que motivou cada pin e por que cada um caiu, está em
`docs/adr/0002-pin-do-vite-via-overrides.md`. `npm audit` **não** está em zero vulnerabilidades:
são **8 moderadas**, de duas origens por trás do TinaCMS — 5 via
`tinacms@3.12.1 → react-router-dom → react-router` e 3 via
`@tinacms/cli@2.6.1 → altair-express-middleware → express`/`body-parser → qs` —, alcançando só
o painel `/admin` (React, autenticado, uma pessoa) — o site público não carrega React (D-01).
O CI reprova a partir de `high`/`critical`; a política, os números medidos e as
alternativas rejeitadas estão em `docs/adr/0010-npm-audit-no-ci-e-severidade.md`.
