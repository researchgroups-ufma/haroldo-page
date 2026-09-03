# Plano 015 — Instalação do TinaCMS e `/admin` no ar localmente

**Status:** DONE
**RFs cobertos:** base de RF-01, RF-02, RF-03 (fase 1, itens "`tina/config.ts`" e "`/admin` funciona localmente")
**Depende de:** planos 011 (projeto TinaCloud) e 014 (Astro 7)
**Modelo recomendado:** sonnet
**Agente recomendado:** implementer
**PRD:** `S:\Projetos\academic_page\haroldo\PRD.md`
**Projeto:** `S:\Projetos\academic_page\haroldo`

## Objetivo

O TinaCMS está instalado, `tina/config.ts` existe com **uma** coleção (`perfil`), e
`http://localhost:4321/admin` abre o painel e edita `content/perfil/index.md` gravando no disco.
É a fatia vertical que prova a integração antes de qualquer schema completo.

## Arquivos afetados

- `package.json`, `package-lock.json` — dependências do Tina e scripts
- `tina/config.ts` — criar, mínimo
- `content/perfil/index.md` — criar, mínimo
- `.gitignore` — artefatos gerados pelo Tina
- `README.md` — seção do painel, hoje escrita como "fase 1, ainda inexistente"
- `tsconfig.json` — **escopo ampliado pelo orquestrador em 2026-09-02**: excluir
  `public/admin` (bundle de produção do painel), porque sem isso `astro check` estoura a
  heap do Node ao tipar ~9,7 MB de JS minificado que o `"include": ["**/*"]` capturava (ver
  achado na Evidência)
- `.prettierignore` — **escopo ampliado pelo orquestrador em 2026-09-02**: `content/` entra
  na lista, porque quem grava o formato ali é o TinaCMS, não o Prettier (ver Evidência)
- `eslint.config.js` — **escopo ampliado pelo orquestrador em 2026-09-02 (ciclo de
  correção)**: `tina/__generated__/**` entra no `ignores` (Correção 2) e, depois,
  `public/admin/**` também (Correção 4) — gitignorar não esconde do ESLint, e o `main` já
  empurrado ficou vermelho duas vezes pelo mesmo motivo, uma vez por diretório (ver
  Evidência)

> Não toque em `src/content.config.ts` (é o plano 016) nem em `astro.config.mjs` além do que a
> integração do Tina exigir. Se precisar de mais, pare e reporte.

## Contexto necessário

**Projeto.** `haroldo-page` — site acadêmico do Prof. Haroldo C. D. Lima Junior (UFMA). Astro
**7.2.10** estático (D-01), Tailwind 4, TypeScript strict. `content/` está **vazio** (só
`.gitkeep`). Existe uma única página, `src/pages/index.astro`.

**Estado do TinaCloud (plano 011).** O projeto existe, vinculado a
`researchgroups-ufma/haroldo-page` na branch `main`, e o painel exibe:

```
Project setup did not complete. No Tina config was found on main of researchgroups-ufma/haroldo-page.
Commit your Tina config to main and push again. Indexing will start automatically.
```

**Isto significa que o push deste plano destrava a indexação sozinho.** Não há ação manual no
painel do TinaCloud. As credenciais `TINA_CLIENT_ID` e `TINA_TOKEN` já estão no `.env` local e
foram validadas contra o content API — o `clientId` é `8be98053-68c3-4262-b7bd-dd1286e1c7ad`.

**Versões verificadas em 2026-09-01:**

| Pacote | Versão | Observação |
|---|---|---|
| `@tinacms/astro` | 0.6.1 | peer `astro: ^5.0.0 \|\| ^6.0.0 \|\| ^7.0.0` — o Astro 7 é suportado |
| `tinacms` | 3.12.1 | peer `react`/`react-dom` `>=16.14.0` |
| `@tinacms/cli` | 2.6.1 | peer `react`/`react-dom` `>=18.3.1 <20.0.0` |

⚠️ **O Tina traz React para um projeto que hoje não tem React nenhum.** Isso é esperado — o
painel é uma aplicação React; o **site público continua sem React** porque `/admin` é uma ilha
isolada. Confirme na Evidência que o build do site não passou a emitir JS de React.

**D-02 — sem visual editing.** Não configure `contextual editing`, não instale
`@tinacms/react-tina-field`, não mexa em `output`. O visual editing exigiria `output: 'server'`,
contra D-01. O painel é **por formulários**, só.

**Escopo mínimo de propósito.** Uma coleção só (`perfil`), com dois ou três campos. As cinco
coleções completas são o plano 017. O valor deste plano é descobrir cedo se a integração
Tina + Astro 7 tem atrito — e ela é território novo, porque o `@tinacms/astro` declara suporte
a Astro 7 mas o projeto é o primeiro da casa a usar essa combinação.

**Artefatos gerados.** O Tina gera arquivos derivados (tipicamente `tina/__generated__/`).
Decida entre versioná-los ou ignorá-los e **registre o motivo** — o build da fase 2 vai depender
dessa escolha. Se ignorar, o script de build precisa gerá-los antes do `astro build`.

**Ambiente.** Windows 11 / PowerShell, a partir de `S:\Projetos\academic_page\haroldo`.
Node 24.16.0.

## Passos

1. Instalar `tinacms`, `@tinacms/cli` e `@tinacms/astro` com versões **fixadas** (o projeto não
   usa faixas — veja qualquer linha de `package.json`).
   → verify: `npm ls tinacms @tinacms/cli @tinacms/astro --depth=0` sem `UNMET`; `npm audit`
   continua em 0 vulnerabilidades, ou a divergência é reportada.
2. Criar `tina/config.ts` com **uma** coleção `perfil`, apontando para `content/perfil`, com os
   campos `nome`, `cargo` e `bio` — rótulos em português.
   → verify: o arquivo compila no `astro check`.
3. Criar `content/perfil/index.md` com valores mínimos.
   → verify: o arquivo existe e o frontmatter bate com os campos da coleção.
4. Ajustar os scripts do `package.json` para que o dev suba o Tina junto (tipicamente
   `tinacms dev -c "astro dev"`) e o build gere o cliente antes do `astro build`.
   → verify: `npm run dev` sobe sem erro; `npm run build` continua verde.
5. Decidir sobre `tina/__generated__/` e refletir a decisão no `.gitignore`.
   → verify: `git status --short` não lista artefato indesejado; a decisão está na Evidência.
6. **Verificação objetiva:** abrir `http://localhost:4321/admin`, editar a bio pelo formulário,
   salvar, e confirmar que `content/perfil/index.md` mudou **no disco**.
   → verify: `git diff content/perfil/index.md` mostra a alteração feita pelo painel.
7. Atualizar a seção do painel no `README.md`, que hoje diz que ele não existe.
   → verify: o texto descreve como subir o painel de fato.

## Critérios de aceitação

- [x] `tinacms`, `@tinacms/cli` e `@tinacms/astro` instalados com versão fixada
- [x] `tina/config.ts` com a coleção `perfil` e rótulos em português
- [x] `npm run dev` sobe o painel; `/admin` carrega e autentica ou entra em modo local
- [x] **Verificação objetiva:** uma edição feita **pelo formulário** alterou
      `content/perfil/index.md` no disco — comprovada por `diff -u` contra o baseline (não por
      `git diff`; ver "Verificação objetiva (passo 6)" na Evidência para o motivo)
- [x] `npm run lint`, `npm run format:check`, `npm run test` e `npm run build` verdes —
      **fecharam os quatro**, confirmado pela verificação autoritativa final (ver
      "Verificação autoritativa final" na Evidência): `npm run build` deixou de falhar em
      `ERR_CLOUD_CHECK_FAILED` assim que `tina/tina-lock.json` foi versionado e empurrado
      (`30ab365`, Correção 1) — a verificação rodou o build **duas vezes consecutivas sem
      limpar nada** e as duas fecharam verdes, inclusive sem o estouro de heap do
      `astro check` que a correção do `tsconfig.json` (seção "Achado durante a investigação,
      e correção", acima) tinha resolvido.
- [x] O build do site público **não** passou a emitir JS de React (D-01/D-02)
- [x] Visual editing **não** configurado; `output` continua `'static'`
- [x] Decisão sobre versionar ou ignorar `tina/__generated__/` registrada com motivo — **e
      revista em 2026-09-02** para `tina/tina-lock.json`, que passou a ser versionado (ver
      "Correção 1" na Evidência)
- [x] `README.md` com a seção do painel corrigida
- [x] Após o push: o TinaCloud sai de "setup did not complete" e indexa a branch `main` —
      **indexou.** `tinacms build` fecha contra a nuvem apontando para
      `https://content.tinajs.io/2.4/content/8be98053-68c3-4262-b7bd-dd1286e1c7ad/github/main`
      (ver "Verificação autoritativa final" na Evidência)

## Evidência

### `npm ls tinacms @tinacms/cli @tinacms/astro --depth=0`

```
haroldo-page@0.1.0 S:\Projetos\academic_page\haroldo
+-- @tinacms/astro@0.6.1
+-- @tinacms/cli@2.6.1
`-- tinacms@3.12.1
```

Sem `UNMET`. `@tinacms/cli` ficou em `devDependencies` (é ferramenta de build/dev, mesma
categoria de `wrangler`, `typescript`, `vitest`); `tinacms` e `@tinacms/astro` ficaram em
`dependencies`, mesma categoria de `astro` e `@tailwindcss/vite` — convenção já em uso no
projeto para bibliotecas/plugins de framework vs. ferramentas de CLI.

### `npm audit` — diverge de 0 vulnerabilidades

```
# npm audit report

qs  2.2.5 - 6.15.3
Severity: moderate
qs array-limit bypass via bracket-key comma parsing - https://github.com/advisories/GHSA-x5fp-wj9c-mxmx
qs: Denial of Service via Attacker Controlled isBuffer - https://github.com/advisories/GHSA-4mjr-xmp4-gh2g
fix available via `npm audit fix`
node_modules/qs
  body-parser  1.20.5 - 1.20.6
  ...
  express  4.22.2
  ...
    node_modules/express

react-router  6.0.0 - 7.17.0
Severity: moderate
React Router: Open redirect via backslash in <Link> and useNavigate (CVE-2025-68470 bypass) - https://github.com/advisories/GHSA-wrjc-x8rr-h8h6
React Router: Arbitrary Constructor Injection via deserializeErrors() in React Router SSR Hydration - https://github.com/advisories/GHSA-337j-9hxr-rhxg
fix available via `npm audit fix --force`
Will install tinacms@1.5.5, which is a breaking change
node_modules/react-router
  react-router-dom  6.0.0-alpha.0 - 7.17.0
  ...
    @tinacms/app  <=0.0.0-ffbb4fa-20260624122203 || >=0.0.23
    ...
      @tinacms/cli  <=0.0.0-ffbb4fa-20260624122203 || >=0.61.24
      ...
    tinacms  <=0.0.0-ffbb4fa-20260624122203 || >=1.5.6
    ...

8 moderate severity vulnerabilities
```

**Divergência reportada, não corrigida em silêncio.** Todas as 8 vulnerabilidades moderadas
vêm de dependências transitivas do próprio `@tinacms/cli`/`tinacms` (o `express`/`qs` do
servidor GraphQL local e o `react-router` do bundle do painel) — nenhuma toca o código do
site público. O único fix automático (`npm audit fix --force`) rebaixaria `tinacms` para
`1.5.5`, contrariando a versão fixada pelo plano (`3.12.1`). Não apliquei — decisão de
downgrade de major não cabe a este plano.

### Quatro comandos de qualidade

Saída da árvore final, depois de toda correção registrada nesta Evidência (inclui a decisão
sobre `content/` no `.prettierignore`, abaixo).

**`npm run lint`** — verde, sem saída:

```
> haroldo-page@0.1.0 lint
> eslint .
```

**`npm run format:check`** — verde:

```
> haroldo-page@0.1.0 format:check
> prettier --check .

Checking formatting...
All matched files use Prettier code style!
```

**`npm run test`** — verde:

```
> haroldo-page@0.1.0 test
> vitest run


 RUN  v4.1.11 S:/Projetos/academic_page/haroldo


 Test Files  2 passed (2)
      Tests  14 passed (14)
   Start at  20:29:42
   Duration  264ms (transform 96ms, setup 0ms, import 145ms, tests 16ms, environment 0ms)
```

### Decisão (2026-09-02): `content/` fora do escopo do Prettier

Depois do passo 6, `npm run format:check` passou a reprovar `content/perfil/index.md`. Não
era um arquivo malformatado — era o serializador YAML do Tina (aspas simples, espaço à
direita preservado dentro delas) e o estilo do Prettier disputando a autoria do mesmo
arquivo. `content/` é a área de edição oficial do professor pelo painel (RF-01/RF-02); se
ela continuar sob o Prettier, todo salvamento legítimo pelo `/admin` deixa o `format:check`
(e portanto o CI) vermelho, e quem quebrou o build é justamente quem não tem como
diagnosticar isso — nem o professor teria como rodar `prettier --write` para "consertar",
nem faria sentido pedir que ele rodasse (F-09, RNF-09).

**Decisão do orquestrador em 2026-09-02:** acrescentar `content/` ao `.prettierignore`, na
mesma seção onde já vivem `PRD.md`, `PRD_TEMPLATE.md`, `briefing.md`, `plans/` e
`CLAUDE.md` — todos prosa/conteúdo com dono próprio, não código-fonte sob convenção do
Prettier:

```diff
 PRD.md
 PRD_TEMPLATE.md
 briefing.md
 plans/
 .firecrawl/
 CLAUDE.md
+
+# Dono do formato é o TinaCMS (RF-01/RF-02), não o Prettier — sem esta linha,
+# cada salvamento pelo painel deixaria o CI vermelho para o professor.
+content/
```

`content/perfil/index.md` **não foi tocado** — continua byte a byte como o painel gravou no
passo 6 (aspas simples, espaço final, newline final). Nenhum `prettier --write` rodou em
lugar nenhum; o `format:check` verde colado em "Quatro comandos de qualidade" acima já é o
resultado desta decisão.

**`npm run build`** — vermelho, bloqueado no `tinacms build` (saída da rodada final, depois
de tudo acima já corrigido):

```
> haroldo-page@0.1.0 build
> tinacms build && astro check && astro build

Starting Tina build

Checking indexing process in TinaCloud...
Attempting to index but responded with status 'failed'. To retry the indexing process, click the "Reindex" button for 'main' in the TinaCloud configuration for this project.  undefined
Error: Attempting to index but responded with status 'failed'. To retry the indexing process, click the "Reindex" button for 'main' in the TinaCloud configuration for this project.  undefined
    at BuildCommand.execute (file:///S:/Projetos/academic_page/haroldo/node_modules/@tinacms/cli/dist/index.js:4037:29)
    at process.processTicksAndRejections (node:internal/process/task_queues:104:5)
    at async BuildCommand.validateAndExecute (S:\Projetos\academic_page\haroldo\node_modules\clipanion\lib\advanced\Command.js:73:26)
    at async Cli.run (S:\Projetos\academic_page\haroldo\node_modules\clipanion\lib\advanced\Cli.js:223:24)
    at async Cli.runExit (S:\Projetos\academic_page\haroldo\node_modules\clipanion\lib\advanced\Cli.js:232:28) {
  errorCode: 'ERR_CLOUD_CHECK_FAILED'
}
```

**Isto é esperado e documentado no próprio plano**: "o push deste plano destrava a
indexação sozinho" — o `tina/config.ts` ainda não foi commitado/empurrado para `main`, então
o TinaCloud não tem o que indexar. `tinacms build` valida contra o estado indexado do
TinaCloud por padrão (é assim que o plano pediu — não usei `--skip-cloud-checks` no script
oficial, que existiria só para contornar esse mesmo alarme). Note que aqui `tinacms build`
falha **antes** de chegar em `astro check` — ele nunca regenera `public/admin/`. Este
critério só fecha depois do push + reindexação (fora do escopo do executor). A prova de que
`astro check` não crasha quando `public/admin/` já existe está na seção seguinte.

### Achado durante a investigação, e correção — `astro check` estourava a heap com o bundle do painel

**O problema.** Ao testar `tinacms build --skip-cloud-checks` (só para diagnóstico) e depois
rodar `astro check`, o processo travava com `FATAL ERROR: Ineffective mark-compacts near
heap limit — JavaScript heap out of memory`. Isolei a causa: `tsconfig.json` tinha
`"include": [".astro/types.d.ts", "**/*"]` sem excluir `public/`, `astro/tsconfigs/base.json`
(que este projeto estende) liga `"allowJs": true`, e o build de produção do Tina grava
~9,7 MB de JS minificado em `public/admin/assets/` (um arquivo sozinho,
`index-BxgbE5Zb.js`, tem 6,3 MB) — o `tsc` por trás do `astro check` tentava tipar esses
bundles como JavaScript e estourava a heap padrão do Node. Reproduzi o crash duas vezes na
primeira rodada de investigação (mover `public/admin/` para fora fazia o check passar limpo;
devolver o diretório fazia o crash voltar) — na ocasião contornei só reordenando o script
`build`, sem tocar `tsconfig.json` (fora de "Arquivos afetados" até então).

**Decisão do orquestrador em 2026-09-02:** corrigir `tsconfig.json` dentro deste plano,
ampliando "Arquivos afetados" (ver seção acima). Alterado:

```diff
-  "exclude": ["dist", "coverage"]
+  "exclude": ["dist", "coverage", "public/admin"]
```

**`tina/__generated__/` não precisou entrar no exclude — decisão tomada com evidência, não
presumida.** Com `public/admin/` já excluído e `tina/__generated__/` totalmente populado
(`client.ts`, `types.ts`, `types.js`, `schema.gql`, `config.prebuild.jsx`, `_schema.json`,
`_lookup.json`, `_graphql.json`, `static-media.json`, `.cache/`), rodei `astro check` de
novo:

```
[vite] Re-optimizing dependencies because vite config has changed
[types] Generated 160ms
[check] Getting diagnostics for Astro files in S:\Projetos\academic_page\haroldo...
Result (14 files):
- 0 errors
- 0 warnings
- 0 hints
```

Passou limpo — `tina/__generated__/` (65 KB no total, maior arquivo é `client.ts` na casa
dos KB) nunca foi o problema; o volume que estourava a heap era só o bundle do painel.

**Revalidação pedida pelo orquestrador — duas rodadas consecutivas, sem limpar nada entre
elas.** Como `tinacms build` real (sem bypass) falha no `ERR_CLOUD_CHECK_FAILED` *antes* de
chegar a gerar `public/admin/` (não há como reproduzir "o bundle já existe de um build bem-
sucedido anterior" com o comando oficial enquanto o TinaCloud não indexar `main`), usei
`tinacms build --skip-cloud-checks --skip-indexing --skip-search-index --port 4498
--datalayer-port 9498` no lugar de `tinacms build` puro nas duas rodadas abaixo — portas
alternativas para não colidir com o dev server do orquestrador, que estava ativo na porta
9000/4001/4321 durante parte deste teste (fiz backup e não toquei nos arquivos dele; a
rodada abaixo já é de depois que ele finalizou o passo 6 e as portas ficaram livres). Fora
essa substituição pontual e documentada, é a mesma sequência de `npm run build`
(`tinacms build && astro check && astro build`):

```
=== RODADA 1 ===
[types] Generated 90ms
[check] Getting diagnostics for Astro files in S:\Projetos\academic_page\haroldo...
Result (14 files):
- 0 errors
- 0 warnings
- 0 hints

Starting Tina build
○  Tina build complete
   API url: https://content.tinajs.io/2.4/content/8be98053-68c3-4262-b7bd-dd1286e1c7ad/github/main
   GraphQL Client:   tina/__generated__/client.ts
   Typescript Types: tina/__generated__/types.ts
   Static HTML file: public/admin/index.html

[types] Generated 66ms
[build] output: "static"
[build] mode: "static"
[build] directory: S:\Projetos\academic_page\haroldo\dist\
[build] Collecting build info...
[build] ✓ Completed in 109ms.
[build] Building static entrypoints...
[vite] ✓ built in 214ms
[vite] ✓ built in 73ms
[build] Rearranging server assets...
 generating static routes
   ├─ /index.html (+11ms)
 ✓ Completed in 25ms.
[build] ✓ Completed in 350ms.
[build] 1 page(s) built in 461ms
[build] Complete!
```

```
=== RODADA 2 (imediatamente depois, sem limpar dist/, public/admin/ nem tina/__generated__ da rodada 1) ===
[types] Generated 92ms
[check] Getting diagnostics for Astro files in S:\Projetos\academic_page\haroldo...
Result (14 files):
- 0 errors
- 0 warnings
- 0 hints

Starting Tina build
○  Tina build complete
   API url: https://content.tinajs.io/2.4/content/8be98053-68c3-4262-b7bd-dd1286e1c7ad/github/main
   GraphQL Client:   tina/__generated__/client.ts
   Typescript Types: tina/__generated__/types.ts
   Static HTML file: public/admin/index.html

[types] Generated 69ms
[build] output: "static"
[build] mode: "static"
[build] directory: S:\Projetos\academic_page\haroldo\dist\
[build] Collecting build info...
[build] ✓ Completed in 117ms.
[build] Building static entrypoints...
[vite] ✓ built in 278ms
[vite] ✓ built in 89ms
[build] Rearranging server assets...
 generating static routes
   ├─ /index.html (+14ms)
 ✓ Completed in 31ms.
[build] ✓ Completed in 443ms.
[build] 1 page(s) built in 574ms
[build] Complete!
```

Nas duas rodadas, `astro check` fecha com `Result (14 files): 0 errors, 0 warnings, 0
hints` mesmo com `public/admin/` (9,7 MB) já presente no disco desde a rodada anterior — o
crash não volta. **Risco residual do relato original — resolvido.** A ordem do script
`build` foi revertida para `tinacms build && astro check && astro build` (a ordem original,
antes do meu contorno): com `public/admin/` agora excluído no `tsconfig.json`, a ordem deixa
de ser necessária para evitar o crash, e a ordem "gera o cliente primeiro, depois checa
tipos" é a correta para quando algum `.astro`/`.ts` em `src/` passar a importar
`tina/__generated__/client` (fase 2+) — nessa ordem `astro check` já encontra o módulo
gerado; na ordem invertida (`check` primeiro), `astro check` falharia com "módulo não
encontrado" num checkout limpo, porque o cliente ainda não existiria. Não deixei o contorno
órfão: ele deixou de ser necessário e o motivo original (heap) agora é resolvido na raiz,
pelo `tsconfig.json`.

### Tamanho do JS do site público — antes e depois do Tina

**Antes de instalar o Tina** (`npm run build`, antes de qualquer alteração deste plano):

```
dist/index.html                  331 bytes
dist/robots.txt                  298 bytes
dist/uploads/.gitkeep              0 bytes
dist/_astro/index.CHYz_id7.css  4723 bytes
dist/_headers                    476 bytes
```

Zero arquivos `.js`.

**Depois de instalar o Tina** (`astro build`, sem o painel gerado — `tinacms build` bloqueado
pelo TinaCloud, ver acima):

```
dist/index.html                  331 bytes
dist/robots.txt                  298 bytes
dist/uploads/.gitkeep              0 bytes
dist/_astro/index.CHYz_id7.css  4723 bytes
dist/_headers                    476 bytes
```

Idêntico byte a byte (mesmo hash do CSS, `index.CHYz_id7.css`). Zero arquivos `.js` fora de
`dist/admin/`.

**Com o painel gerado** (diagnóstico só, via `tinacms build --skip-cloud-checks`, não
commitado — reproduz o que `tinacms build` vai gravar depois que o TinaCloud indexar):
`dist/admin/` isolado com 9,7 MB de JS (React + editor do Tina); a raiz do site (`dist/
index.html`, `dist/_astro/`) permaneceu idêntica à listagem acima. O JS de React fica
inteiramente confinado a `/admin`, nunca carregado pelas páginas públicas — D-01/D-02
preservados.

### Decisão: `tina/__generated__/`, `tina/tina-lock.json` e `public/admin/` — ignorados

Adicionados ao `.gitignore`. Motivo: são 100% derivados de `tina/config.ts` + `content/`,
regenerados a cada `tinacms dev`/`tinacms build`. Em especial, `public/admin/index.html`
**difere completamente** entre dev (referencia `http://localhost:4001/admin/@vite/client`,
o servidor local do Tina) e produção (bundle estático auto-contido) — versionar um dos dois
estados produziria o arquivo errado dependendo de quem rodou o quê por último. O script
`build` já gera os três antes do `astro build` (`tinacms build && astro check && astro
build`), então a fase 2 não perde nada ignorando-os. Confirmado com `git status --short`
depois de gerar os três artefatos: nenhum aparece (testado explicitamente, ver histórico de
comandos).

### Estado do TinaCloud

Não verificado após push — **o executor não commita nem empurra** (regra do despacho). O
projeto no TinaCloud segue no estado documentado no plano ("Project setup did not complete
[...] Commit your Tina config to main and push again"), porque `tina/config.ts` ainda está
só no working tree local. Este critério fecha depois do commit/push, que é do orquestrador.

### Verificação objetiva (passo 6)

Executada pelo orquestrador/usuário, não por mim — por instrução do despacho original. Eu
deixei `content/perfil/index.md` num estado inicial conhecido e commitável:

```markdown
---
nome: Haroldo Cilas Duarte Lima Junior
cargo: Professor Adjunto A
bio: Professor Adjunto A do Departamento de Física da Universidade Federal do Maranhão (UFMA).
---
```

**Comando e URL para subir o painel:** `npm run dev`, depois abrir
`http://localhost:4321/admin`. Antes da verificação do usuário, validei a cadeia HTTP (sem
navegador): com o dev server no ar, `GET http://localhost:4321/admin` responde `302` para
`/admin/index.html` (`200`), via o plugin `tinaAdminDevRedirect()` adicionado ao
`astro.config.mjs`; `POST http://localhost:4001/graphql` com `{ collections { name } }`
responde `{"data":{"collections":[{"name":"perfil"}]}}`, confirmando que o servidor GraphQL
local do Tina reconhece a coleção.

**O usuário abriu o painel, editou `nome` e `bio` pelo formulário, e salvou.** Prova:

```
=== diff -u baseline(executor) -> atual(pós-painel) ===
--- .../scratchpad/perfil-baseline.md	2026-09-02 20:21:49.503336400 -0300
+++ content/perfil/index.md	2026-09-02 20:21:10.282841600 -0300
@@ -1,5 +1,6 @@
 ---
-nome: Haroldo Cilas Duarte Lima Junior
+nome: 'Haroldo Lima '
 cargo: Professor Adjunto A
-bio: Professor Adjunto A do Departamento de Física da Universidade Federal do Maranhão (UFMA).
+bio: 'Professor do Departamento de Física da Universidade Federal do Maranhão (UFMA). '
 ---
+
(diff exit=1)
=== mtime ===
content/perfil/index.md  modificado em 2026-09-02 20:21:10.282841600 -0300
agora:            2026-09-02 20:21:49 -0300
```

**Por que `diff -u` e não `git diff`, como o passo 6 originalmente pedia:** o `git diff`
compara contra a última versão *commitada*, e `content/perfil/index.md` nunca foi commitado
— foi criado por mim nesta mesma sessão de execução do plano, então está `??` (untracked) no
`git status`. Não há blob anterior no git para comparar. É uma limitação da forma do verify
do plano para um arquivo que nasce e é editado dentro da mesma execução, não uma falha da
verificação em si: a partir do commit deste plano (quando o orquestrador integrar o
trabalho), qualquer edição futura pelo painel vai aparecer normalmente em `git diff
content/perfil/index.md`, porque aí sim vai existir uma versão anterior commitada para
comparar.

O arquivo foi reescrito ~39 s antes da coleta, com a assinatura do serializador YAML do
Tina (aspas simples introduzidas, espaço final preservado dentro delas, newline final
acrescentada) — é o painel gravando no disco, não uma edição manual. O arquivo permanece
exatamente como o painel deixou: não normalizei aspas, não removi o espaço final, não mexi
no `nome`. Isso tem um efeito colateral documentado na seção "Quatro comandos de qualidade":
`npm run format:check` passou a acusar esse arquivo.

**Achado sobre `astro dev` em ambiente de agente:** ao rodar via este executor, `astro dev`
detectou automaticamente um ambiente de agente de IA (`am-i-vibing`/`isRunByAgent()` do
Astro 7) e entrou em modo `--background` por padrão, o que quebra a premissa do `tinacms dev
-c "astro dev"` (o processo do Tina via o comando encerrar rápido — porque em background ele
retorna assim que o daemon sobe — e encerrava a si mesmo, derrubando o servidor GraphQL
junto). Contornei isso só para teste com `ASTRO_DEV_BACKGROUND=1 npm run dev`, que força o
modo foreground. **Isto não deve afetar o terminal interativo do orquestrador** — a detecção
de agente não deveria disparar numa sessão PowerShell humana normal — mas se `/admin` parecer
subir e cair sozinho, ou se `http://localhost:4001/graphql` não responder, esse é o sintoma:
rodar com `$env:ASTRO_DEV_BACKGROUND=1` antes do `npm run dev`.

## Ciclo de correção — pós-fechamento (2026-09-02)

A revisão tinha aprovado o plano e o commit `1d35c11` já estava em `main` quando dois
defeitos meus apareceram, mais um terceiro ajuste de conteúdo pedido depois. Os três estão
registrados aqui **sem apagar** o raciocínio original acima — o que muda é revisto
explicitamente, com data e motivo, porque a fase 2 vai reler isto.

### Correção 1: `tina/tina-lock.json` tinha de ser versionado, não ignorado

**Eu errei.** A seção "Decisão: `tina/__generated__/`, `tina/tina-lock.json` e
`public/admin/` — ignorados", acima, tratou os três artefatos como equivalentes (100%
derivados, regeneráveis, sem motivo para versionar). Isso é verdade para dois deles, mas
**não** para o `tina-lock.json`: é o arquivo que o TinaCloud lê em `main` para saber que o
schema existe e indexar a branch. Sem ele no repositório, a mensagem "No Tina config was
found on main" que o TinaCloud mostra é enganosa — o `tina/config.ts` está lá, publicamente
legível (`git ls-tree origin/main` lista o arquivo; a API do GitHub devolve HTTP 200 para
ele) — mas o TinaCloud não indexa sem o lock. Fonte:
<https://tina.io/docs/tinacloud/troubleshooting> — *"Ensure `tina/tina-lock.json` exists and
is committed to your repository. This is the most common cause of branches not being
indexed."* O arquivo também não é gerado por `tinacms build` (confirmado nas rodadas da
seção anterior: nenhuma delas o criou) — só por `tinacms dev`.

**Correção:** removido `tina/tina-lock.json` do `.gitignore` (`tina/__generated__/` e
`public/admin/` continuam ignorados — para esses dois a decisão original segue correta, o
`tina-lock.json` era o único caso especial):

```diff
 tina/__generated__/
-tina/tina-lock.json
 public/admin/
```

Gerado rodando `tinacms dev` (via `npm run dev`, com `$env:ASTRO_DEV_BACKGROUND = "1"` para
não cair no modo `--background` de detecção de agente — mesmo achado da seção anterior).
Subiu, o arquivo apareceu, derrubei o servidor. Confirmado:

```
$ git status --short -uall
...
?? tina/tina-lock.json
...
```

Agora `??` (novo, pronto para ser versionado), em vez de ausente do `git status` por estar
gitignorado.

### Correção 2: o ESLint lintava `tina/__generated__/`

**Eu errei de novo, no mesmo commit.** Gitignorar um diretório não o esconde do ESLint —
são mecanismos independentes. O `eslint.config.js` tinha `ignores: ['dist/**', '.astro/**',
'node_modules/**', 'coverage/**', '.wrangler/**']`, sem `tina/__generated__/**`. Resultado
real, `npm run lint` no `main` já empurrado:

```
S:\Projetos\academic_page\haroldo\tina\__generated__\types.ts
    1:1   error  Do not use "@ts-nocheck" because it alters compilation errors  @typescript-eslint/ban-ts-comment
   24:23  error  Unexpected any. Specify a different type                       @typescript-eslint/no-explicit-any
   ...
✖ 9 problems (9 errors, 0 warnings)
```

Isso não apareceu na verificação autoritativa da minha própria execução porque
`tina/__generated__/` foi regenerado depois daquela rodada (o `mtime` dos arquivos é
posterior) — não é falha do verificador, é o artefato mudando depois de checado.

**Correção:** acrescentado `'tina/__generated__/**'` ao `ignores` do `eslint.config.js`,
com comentário explicando por quê (mesmo raciocínio do `.prettierignore` para `content/`:
código gerado por ferramenta externa, não código deste projeto para o ESLint avaliar).

**`tina/__generated__/` também precisa entrar no `.prettierignore`? Avaliei — não é
necessário, e não é sorte.** Testei empiricamente antes de decidir: coloquei um arquivo
`.ts` deliberadamente malformatado dentro de `tina/__generated__/` (que está no
`.gitignore`, mas não estava no `.prettierignore`) e rodei `npm run format:check` — o
arquivo malformatado **não foi sinalizado**. O Prettier deste projeto respeita o
`.gitignore` automaticamente (confirmei também o inverso: apontar o `prettier --check`
diretamente para arquivos dentro de `tina/__generated__/` funciona e eles passam no estilo,
então não é que o Prettier ignore o diretório inteiro por engano — é que `prettier --check
.`, o comando do script, nunca entra lá enquanto o diretório estiver gitignorado). Ou seja:
não é que o gerador do Tina "calhe" de emitir no estilo do Prettier — **o `format:check`
simplesmente nunca chega a examinar esses arquivos**, hoje. Não acrescentei
`tina/__generated__/` ao `.prettierignore` porque seria redundante enquanto ele continuar no
`.gitignore`. Registro para quem ler isto depois: se algum dia `tina/__generated__/` sair do
`.gitignore` (não há motivo previsto para isso), a mesma pessoa precisa lembrar de
acrescentá-lo ao `.prettierignore` no mesmo commit — exatamente o que aconteceu agora com o
`tina-lock.json` na Correção 1, e é por isso que ele também entrou no `.prettierignore`
nesta correção (arquivo agora versionado, então visível ao Prettier; formato é do
serializador do Tina, não deste projeto):

```diff
 content/

+tina/tina-lock.json
```

**Pré-condição de versão deste argumento, apontada pela revisão e confirmada:** o
comportamento de `prettier --check .` respeitar `.gitignore` automaticamente depende da
versão do Prettier — o default de `--ignore-path` inclui `.gitignore` só a partir do
Prettier 3.0; versões anteriores ignoravam só o que estivesse em `.prettierignore`. Este
projeto está fixado em `prettier@3.9.6` (`package.json`), acima do piso. Isto não é
garantia permanente: um upgrade futuro de major do Prettier precisa reconferir esta
premissa antes de continuar contando com ela — é exatamente o tipo de acoplamento implícito
que envenena upgrades se não ficar escrito em algum lugar.

### Correção 3 (2026-09-02, decisão do usuário): `content/perfil/index.md` ganhou `instituicao`, `resumo_home` e `email`

O schema Zod do plano 016 (em execução em paralelo, já escrito na árvore em
`src/content.config.ts` — não toquei nele) marca `instituicao`, `resumo_home` e `email`
como obrigatórios para a coleção `perfil`, conforme a §7.3 do PRD. Sem eles,
`astro check` reprovava a sincronização de conteúdo com `InvalidContentEntryDataError`
(`instituicao: Required`, `resumo_home: Required`, `email: Required`). O dado estava
incompleto, não o schema.

Preenchi lendo o PRD, não de memória:

- **`instituicao`** — valor do Apêndice C do PRD (dados extraídos do Lattes):
  `Universidade Federal do Maranhão (UFMA), Campus São Luís`.
- **`resumo_home`** — frase curta coerente com a `bio` já presente no arquivo (que cita o
  Departamento de Física da UFMA), usando as áreas de atuação também do Apêndice C
  (Relatividade Geral, teorias alternativas de gravitação, sombras de buracos negros):
  `Pesquisa Relatividade Geral, teorias alternativas de gravitação e sombras de buracos negros.`
- **`email`** — **placeholder deliberadamente falso**, decisão do usuário em 2026-09-02, não
  meu julgamento: `PLACEHOLDER@ufma.br`. Não deduzi nem inventei o e-mail real do professor.
  O motivo, também registrado como comentário no próprio arquivo, logo acima do campo: o PRD
  §9 (LGPD) exige e-mail institucional, nunca pessoal, e a **Q-07** ("o e-mail exibido
  publicamente é institucional?") continua **aberta até a fase 3** — o repositório é
  público, e um e-mail real de pessoa real ali seria irreversível. O comentário está
  redigido para ser impossível de não notar por quem tocar o plano 020 (conteúdo
  placeholder) ou a fase 3.

**Risco registrado, apontado pela revisão — não é mecanismo, é comentário.** Nada em
`lint`, `test` ou `build` falha hoje se `PLACEHOLDER@ufma.br` sobreviver até a publicação;
o comentário de frontmatter é só texto, sem validação que o imponha. Aceitável **agora**
porque `email` ainda não está no schema do `tina/config.ts` deste plano (só `nome`, `cargo`,
`bio`) — o painel não tem como sequer editar ou reserializar esse campo ainda. Isso muda no
**plano 017**, quando `email` entrar no `tina/config.ts` real: a partir daí, qualquer
salvamento pelo painel reserializa o frontmatter inteiro, e comentários YAML tipicamente
**não sobrevivem** a essa reserialização — o aviso pode desaparecer do arquivo sem que
ninguém tenha decidido apagá-lo. O plano 017 (ou quem escrever o campo `email` no schema do
Tina) precisa decidir ali, de novo e por mecanismo — validação, valor default óbvio, ou
revisão manual antes do primeiro deploy —, não confiar que o comentário atual ainda vai
estar lá.

Os campos que já existiam (`nome`, `cargo`, `bio`) **não foram tocados** — continuam byte a
byte como o painel do Tina gravou (aspas simples, espaço à direita dentro delas). Só
acrescentei linhas novas ao frontmatter.

`npx astro check`, depois da correção:

```
[content] Syncing content
[WARN] [glob-loader] No files found matching "**/*.md" in directory "content\linhas-pesquisa"
[WARN] [glob-loader] No files found matching "**/*.md" in directory "content\projetos"
[WARN] [glob-loader] No files found matching "**/*.md" in directory "content\publicacoes"
[WARN] [glob-loader] No files found matching "**/*.md" in directory "content\disciplinas"
[content] Synced content
[types] Generated 526ms
[check] Getting diagnostics for Astro files in S:\Projetos\academic_page\haroldo...
...
Result (16 files):
- 61 errors
- 0 warnings
- 0 hints
```

**Não fecha em `0 errors`, e não deveria fechar por uma correção minha aqui.** Os 61 erros
são **todos** em `tests/content/schemas.test.ts` (conferido isolando os arquivos com erro —
nenhum é `content/perfil/index.md`, nenhum é meu). É TypeScript reclamando que
`collections.perfil.schema` (e `collections.publicacoes.schema`) são tipos union sem
`.safeParse` garantido — problema de tipagem no arquivo de teste do plano 016, que está em
execução em paralelo com alterações não commitadas na árvore agora. Não toquei nele, como
instruído. O `[content] Synced content` sem `InvalidContentEntryDataError` já confirma que o
problema relatado — o dado incompleto de `perfil` — está resolvido.

### Saída final das três verificações pedidas (depois das Correções 1 e 2), mais `git status`

```
=== npm run lint ===
> haroldo-page@0.1.0 lint
> eslint .

=== npm run format:check ===
> haroldo-page@0.1.0 format:check
> prettier --check .

Checking formatting...
All matched files use Prettier code style!

=== npm run test ===
> haroldo-page@0.1.0 test
> vitest run


 RUN  v4.1.11 S:/Projetos/academic_page/haroldo


 Test Files  3 passed (3)
      Tests  59 passed (59)
   Start at  21:09:01
   Duration  1.19s (transform 778ms, setup 0ms, import 1.15s, tests 36ms, environment 0ms)

=== git status --short -uall ===
 M .gitignore
 M .prettierignore
 M content/perfil/index.md
 M eslint.config.js
 M vitest.config.ts
?? src/content.config.ts
?? tests/content/schemas.test.ts
?? tina/tina-lock.json
```

`npm run build` **não foi rodado** nesta rodada final, por instrução — continua bloqueado no
`tinacms build`/TinaCloud até o `tina/tina-lock.json` ir para `main`, o que é a próxima
etapa, do orquestrador. `vitest.config.ts` modificado e os dois arquivos `??` de
`src/content.config.ts`/`tests/content/schemas.test.ts` são do plano 016, em execução
paralela — não são meus e não os toquei.

### Correção 4 (2026-09-02): o ESLint também lintava `public/admin/`

**Mesma classe de erro da Correção 2, no outro diretório.** A Correção 2 tinha acrescentado
`tina/__generated__/**` ao `ignores` do `eslint.config.js`, mas não `public/admin/**` — e eu
não fiz a varredura na ocasião para conferir se havia mais algum caso igual. Com
`tina/tina-lock.json` versionado (Correção 1), o TinaCloud passou a indexar `main` de
verdade, `tinacms build` passou a fechar verde, e o bundle de produção do painel
(`public/admin/assets/*.js`, JS minificado de React/mermaid/codemirror) passou a existir de
verdade no disco durante a verificação — coisa que, nas minhas rodadas anteriores, só tinha
acontecido via `--skip-cloud-checks` (diagnóstico, sempre limpo depois). Resultado real,
antes da correção:

```
✖ 20758 problems (20758 errors, 0 warnings)
  10 errors and 0 warnings potentially fixable with the `--fix` option.
```

Todos os erros nos arquivos de `public/admin/assets/`. `public/admin/` já estava no
`.gitignore` (linha 51), mas gitignorar não esconde do ESLint — é o mesmo raciocínio da
Correção 2, só que eu tinha aplicado num diretório gerado e esquecido do outro.

**Correção:** acrescentado `'public/admin/**'` ao mesmo array `ignores`:

```diff
       'tina/__generated__/**',
+      // Mesmo raciocínio, para o bundle de produção do painel (`tinacms build`): gitignorado,
+      // mas o ESLint não herda o gitignore. É JS minificado de terceiros (React, mermaid,
+      // codemirror etc. empacotados pelo Tina) — nunca é código deste projeto para lintar.
+      'public/admin/**',
     ],
```

**Varredura pedida pelo orquestrador — as três listas, lado a lado, para não haver uma quinta
rodada desta classe:**

| Pasta/arquivo gerado | `.gitignore` | `eslint.config.js` (`ignores`) | `.prettierignore` |
|---|---|---|---|
| `node_modules/` | ✔ | ✔ (também padrão implícito do ESLint) | ✔ |
| `dist/` | ✔ | ✔ | ✔ |
| `.astro/` | ✔ | ✔ | ✔ |
| `.wrangler/` | ✔ | ✔ | — |
| `coverage/` | ✔ | ✔ | ✔ |
| `tina/__generated__/` | ✔ | ✔ (Correção 2) | — |
| `public/admin/` | ✔ | ✔ (Correção 4, agora) | — |
| `tina/tina-lock.json` | — (revisto na Correção 1: precisa ser versionado) | n/a (é `.json`, ESLint não linta) | ✔ (formato é do Tina) |
| `content/` | não é gerado, é editado pelo painel | n/a (não é código) | ✔ (formato é do Tina) |

As três células com "—" (`.wrangler/`, `tina/__generated__/`, `public/admin/` fora do
`.prettierignore`) **não são gaps** — são omissões seguras. Testei isto na Correção 2 e
revalidei agora: o Prettier deste projeto respeita o `.gitignore` automaticamente (plantei
um arquivo malformatado dentro de `tina/__generated__/`, gitignorado e fora do
`.prettierignore`, e `format:check` não o sinalizou; com `public/admin/` real de 9,7 MB no
disco nesta própria rodada, `format:check` também fechou verde sem precisar de entrada
própria — colado abaixo). O ESLint **não** tem esse comportamento — daí as Correções 2 e 4
serem necessárias e o Prettier não precisar do equivalente. Conferi célula por célula; não
sobrou nenhuma outra pasta gerada num arquivo faltando no outro. (Este comportamento do
Prettier depende de versão — ver a nota de pré-condição na Correção 2, logo acima.)

Saída literal, depois da correção:

```
=== npm run lint ===
> haroldo-page@0.1.0 lint
> eslint .

=== npm run format:check ===
> haroldo-page@0.1.0 format:check
> prettier --check .

Checking formatting...
All matched files use Prettier code style!

=== npm run test ===
> haroldo-page@0.1.0 test
> vitest run


 RUN  v4.1.11 S:/Projetos/academic_page/haroldo


 Test Files  3 passed (3)
      Tests  59 passed (59)
   Start at  21:21:30
   Duration  1.35s (transform 902ms, setup 0ms, import 1.32s, tests 40ms, environment 0ms)
```

Nada em `tests/content/schemas.test.ts` (plano 016) acusou problema nesta rodada. Não toquei
em `src/content.config.ts`, `tests/content/schemas.test.ts` nem `vitest.config.ts`.

### Correção 5 (2026-09-02): o comentário do `.gitignore` remetia a um README que não dizia nada

**Reprovação da revisão, com um item só, e justo.** O comentário que escrevi no `.gitignore`
(commit `30ab365`) dizia "ver README" para a explicação de por que `tina/tina-lock.json`
fica versionado — mas a string `tina-lock` não aparecia em lugar nenhum do `README.md`. Pior:
o README explicava corretamente que `tina/__generated__/` e `public/admin/` ficam **fora**
do versionamento, sem mencionar que o terceiro artefato do Tina é diferente — o que tornava
a omissão mais enganosa, não neutra. É a mesma classe de erro das Correções 1, 2 e 4: uma
afirmação (aqui, uma referência) não verificada contra a fonte que ela mesma cita.

**Correção, na seção "Painel de edição" do `README.md`:** novo parágrafo dizendo que
`tina/tina-lock.json` é a exceção — o único artefato do Tina que fica versionado —, com os
dois fatos que importam: (1) por que — o TinaCloud exige o arquivo em `main` para indexar a
branch; sem ele o painel mostra "No Tina config was found on main" mesmo com o
`tina/config.ts` presente, exatamente o que travou este plano (Correção 1); (2) que ele é
gerado por `tinacms dev`, não por `tinacms build` — então quem mudar o schema precisa subir
o dev uma vez e commitar o lock atualizado. Mantido o contraste explícito com
`tina/__generated__/` e `public/admin/`, que continuam fora do versionamento — o parágrafo
novo começa dizendo que este é "a exceção" aos dois anteriores.

Também encurtei o comentário do `.gitignore`: ele parava de duplicar a explicação inteira
(o raciocínio completo, incluindo a citação do doc do TinaCloud, já estava lá desde a
Correção 1) e passou só a apontar para a seção certa do README, mantendo a citação da fonte
oficial:

```diff
-# `tina/tina-lock.json` NÃO entra aqui (revisto em 2026-09-02) — é o único dos
-# três que o TinaCloud precisa encontrar em `main` para indexar a branch. Sem
-# ele versionado, o TinaCloud nunca sai de "No Tina config was found on main"
-# mesmo com `tina/config.ts` publicamente legível no repositório. Fonte:
-# https://tina.io/docs/tinacloud/troubleshooting — "Ensure tina/tina-lock.json
-# exists and is committed to your repository. This is the most common cause
-# of branches not being indexed." Também não é gerado por `tinacms build`, só
-# por `tinacms dev` — ver README.
+# `tina/tina-lock.json` NÃO entra aqui (revisto em 2026-09-02) — é o único dos
+# três que fica versionado. Motivo e implicação (é gerado por `tinacms dev`,
+# não por `tinacms build`) estão no README, seção "Painel de edição". Fonte da
+# exigência do TinaCloud: https://tina.io/docs/tinacloud/troubleshooting.
```

Confirmado com `grep -n "tina-lock" README.md .gitignore`: a string aparece nas duas linhas
novas do README (o título do parágrafo e a frase sobre commitar o lock atualizado) e na
linha do `.gitignore` que agora aponta para lá — "ver README" deixou de ser uma referência
morta.

**As duas observações da revisão que não são correções — registradas, não implementadas:**

1. **Dependência de versão do argumento "Prettier respeita `.gitignore`".** Nota acrescentada
   na Correção 2 (acima): o comportamento depende do Prettier ≥ 3.0 (`--ignore-path` default
   passou a incluir `.gitignore` a partir daí); este projeto está em `prettier@3.9.6`. Um
   upgrade de major do Prettier precisa reconferir essa premissa antes de continuar contando
   com ela.
2. **`email: PLACEHOLDER@ufma.br` é comentário, não mecanismo.** Nota acrescentada na
   Correção 3 (acima): aceitável agora porque `email` não está no `tina/config.ts` deste
   plano, mas o plano 017 (quando `email` entrar no schema real do Tina) precisa resolver
   isto por mecanismo — o comentário de frontmatter não sobrevive de forma garantida a uma
   reserialização do painel.

Saída literal depois desta correção:

```
=== npm run format:check ===
> haroldo-page@0.1.0 format:check
> prettier --check .

Checking formatting...
All matched files use Prettier code style!

=== npm run lint ===
> haroldo-page@0.1.0 lint
> eslint .
```

## Verificação autoritativa final

Execução independente, distinta das rodadas do executor acima — 12/12 itens OK, na árvore
final (depois das cinco correções). Aprovada pela revisão.

1. **`npm ci`** — 1516 pacotes instalados; `git status --short package-lock.json` sem saída
   — o lock **não** foi reescrito.
2. **`npm run lint`** — exit 0, sem saída.
3. **`npm run format:check`** — `All matched files use Prettier code style!`.
4. **`npm run test:coverage`** — `Test Files 3 passed (3)`, `Tests 59 passed (59)`;
   cobertura agregada `Statements 100% (21/21)`, `Branches 100% (2/2)`,
   `Functions 100% (1/1)`, `Lines 100% (21/21)`. Por arquivo (via reporter HTML — a tabela
   do reporter `text` sai vazia neste Windows, defeito cosmético já registrado na fase 0):
   `src/content.config.ts` 100% (18/18), `src/lib/config.ts` 100% (2/2),
   `src/lib/slug.ts` 100% (1/1).
5. **`npm run build`, 1ª rodada** — VERDE. `tinacms build` fechou contra o TinaCloud pela
   primeira vez (indexação real, não mais bloqueada); `astro check`
   `0 errors, 0 warnings, 0 hints`; `astro build` `Complete!`.
6. **`npm run build`, 2ª rodada consecutiva, sem limpar nada da 1ª** — verde de novo, sem
   estouro de heap no `astro check` com `public/admin/` (9,7 MB) já em disco. Confirma que a
   correção do `tsconfig.json` (seção "Achado durante a investigação, e correção") resolve o
   problema também fora do meu ambiente de execução.
7. **`git status --short -uall`** — `tina/__generated__/` e `public/admin/` não aparecem
   (continuam ignorados corretamente); `git ls-files tina/tina-lock.json` confirma que o
   arquivo está tracked.
8. **`dist/`** — 94 arquivos; `find dist -name "*.js" -not -path "dist/admin/*"` sem saída:
   **zero arquivos `.js` fora de `dist/admin/`** — confirma D-01/D-02 na árvore final, não só
   no diagnóstico do executor.
9. **`content/perfil/index.md`** — `nome: 'Haroldo Lima '` e
   `bio: '...(UFMA). '`, aspas simples e espaço antes do fechamento preservados — o arquivo
   segue exatamente como o painel gravou no passo 6, sem normalização.
10. **`astro.config.mjs:45`** — `output: 'static'`.
11. **`src/content.config.ts`** — cinco coleções, sem `noticias`, sem `en` (item do plano
    016, conferido na mesma rodada por ser dependência direta do que este plano valida).
12. **`grep` por `as any`, `@ts-ignore`, `@ts-expect-error`, non-null assertion** — nenhuma
    ocorrência.

## Nota de fechamento

Este plano precisou de **cinco correções pós-aprovação** (documentadas acima como Correção 1
a 5, mais o achado do `tsconfig.json` durante a execução original). A mais grave — o
`tina/tina-lock.json` gitignorado, que impedia o TinaCloud de indexar `main` mesmo com
`tina/config.ts` publicamente legível no repositório — só apareceu porque a primeira revisão
aceitou a decisão documentada ("ignorar os três artefatos derivados do Tina, são todos
regeneráveis") sem conferi-la contra a documentação oficial do TinaCMS, que diz o oposto para
esse arquivo específico. Isto não é autoflagelo — é para quem executar os planos 017
(`email` entra de verdade no `tina/config.ts` — ver o risco registrado na Correção 3) e 021
(fechamento da fase 1, ADRs e verificação final do `/admin`): qualquer decisão sobre
artefato gerado por ferramenta externa merece checar a doc oficial da ferramenta antes de
generalizar "é derivado, então pode ignorar" — nem todo artefato derivado é dispensável.
