# Plano 087 — Dependências atualizadas para o portão de auditoria voltar a verde (RNF-07, RNF-08, ADR-0010)

**Status:** TODO
**RFs cobertos:** **RNF-07** e **RNF-08** (portão de `npm audit` do CI, ADR-0010). Plano transversal: não fecha item do §12.
**Depende de:** plano **086** DONE e verificado em produção. O 086 mexe em `tina/config.ts` e no `tina/tina-lock.json`, que este plano regenera; a branch tem de nascer depois dele.
**Modelo recomendado:** sonnet
**Agente recomendado:** implementer
**Executável por:** agente (degraus 1 a 4, na branch) + orquestrador (branch, painel local no Edge, push, PR, merge, produção e reversão)
**PRD:** `S:\Projetos\academic_page\haroldo\PRD.md`
**Projeto:** `S:\Projetos\academic_page\haroldo`

## Objetivo

O CI `qualidade` está vermelho desde 2026-11-20 14:05 UTC no passo
`node scripts/auditar-dependencias.mjs`, por 12 alertas `high`/`critical` publicados depois do
último verde. O objetivo é deixar o CI da `main` verde **sem afrouxar o portão** (nível
`high`/`critical` intacto, ADR-0010) e **sem quebrar o painel do professor**. Para isso:

1. atualizar o que tem correção;
2. registrar exceção datada só para o que não tem saída, com o motivo medido;
3. tirar do script e do ADR as exceções que já não se aplicam.

Todo o trabalho acontece numa branch, `atualiza-dependencias`, e só entra na `main` com o CI do PR
verde e o painel verificado.

## Decisões do dono do produto (2026-11-21)

1. **A branch é `atualiza-dependencias`**, com PR para a `main` e merge só com tudo verde.
2. **O `wrangler` fixado sobe de 4.145.0 para 4.166.0**: aprovado em 2026-11-21. A memória do
   projeto exige essa aprovação para mexer no `wrangler`.
3. **Fallback do degrau 3:** se o `@tinacms/cli` 4 quebrar o painel ou o build e a causa não for
   óbvia, o degrau 3 é desfeito, o CLI fica em 2.6.1, o GHSA-pwhx vira exceção datada e o plano
   segue para o degrau 4. A subida do CLI vira plano próprio, começando por `/investigar`.

## Retrato "antes" (medido pelo orquestrador em 2026-11-21, `main` em `cec5ac4`)

`npm audit`: `{"low":3,"moderate":23,"high":22,"critical":2,"total":50}`. O portão reprova 12
alertas. A coluna "Degrau" diz quem resolve cada um:

| Alerta | Pacote e cópia | Faixa vulnerável | Saída medida | Degrau |
|---|---|---|---|---|
| GHSA-27r3-jxmh-p828 | `body-parser@1.20.6` (via `@tinacms/cli`) | `<1.20.9` | `npm update`, faixa `^1.20.3` | 1 |
| GHSA-r7fv-28h4-cvq7, GHSA-gfr2-rv44-r23c | `markdown-it@14.3.1` (via `@tinacms/app → graphiql`) | `<14.3.3` | `npm update`, faixa `^14.1.0` | 1 |
| GHSA-xjj6, -4w7w, -2m5v, -qrxm (undici) | `undici@8.11.2` (via `astro → unifont`) | `<8.12.2` | `npm update`, faixa `^8.0.0` (8.13.1) | 1 |
| (os mesmos 4 do undici) | `undici@7.29.1` (via `wrangler → miniflare`, versão exata) | `<7.30.1` | `wrangler@4.166.0` → `miniflare` fixa `undici@7.30.2` | 2 |
| GHSA-mrhx-c7xc-m3w5 | `zod@4.5.4` (via `astro`, `@astrojs/sitemap`) | `<4.6.6` | `npm update`, faixa `^4.3.6` (4.6.6) | 1 |
| GHSA-mrhx-c7xc-m3w5 | `zod@3.25.76` (via `tinacms` e `@tinacms/*`) | `<4.6.6` | **nenhuma**: 3.25.76 é a última 3.x, e até o CLI 4.0.5 pede `^3.24.2` | 4 (exceção) |
| GHSA-x34j-47hf-4xg7 (**critical**) | `tinacms@3.12.1`, `@tinacms/app@2.5.12` | `<=3.13.0` / `<=2.5.13` | `tinacms@3.15.2` + `@tinacms/app@2.6.0` (o app pede `tinacms ^3.15.0`; o CLI 2.6.1 aceita `app ^2.5.12`) | 2 |
| GHSA-587h-7wmj-h5pm | `vite@8.2.2` (direta; dev server no Windows) | `>=8.2.0 <=8.2.3` | `vite@8.3.8`, dentro do `^8.0.13` do Astro | 2 |
| GHSA-pwhx-cvv3-qj5c | `@tinacms/cli@2.6.1` | `<=2.7.0` | `@tinacms/cli@4.0.5` (major) | 3 |
| GHSA-c4qx-w738-7hr3 | `@graphql-tools/utils` 11.2.2 e 12.0.0 (via `@tinacms/cli`) | `>=10.10.1 <=12.0.1` | o CLI 4.0.5 usa `@graphql-tools/load ^8.1.21` → `utils ^12.1.0`; **medir** | 3, senão 4 |

Exceções já existentes em `scripts/auditar-dependencias.mjs`:
- `GHSA-7mx3-vvmw-hjmv` (`@graphql-tools/utils`, `<=12.0.0`): aceita hoje. Medir de novo depois do
  degrau 3.
- `GHSA-wq5f-xc86-pv6w` (`sharp`): aceita hoje. O `miniflare` do `wrangler@4.166.0` fixa
  `sharp@0.35.5`, a versão corrigida, então deve ficar obsoleta no degrau 2.
- `GHSA-vfj7-8cjw-p6xm` (`braces`): **já obsoleta**. O portão imprime hoje
  `AVISO: a exceção GHSA-vfj7-8cjw-p6xm (braces) não aparece mais`.

**Fatos do CLI 4 conferidos pelo orquestrador** (CHANGELOG oficial de `packages/@tinacms/cli` no
repositório `tinacms/tinacms`, e o pacote 4.0.5 baixado e lido, nunca executado):

- **3.0.0:** os campos rich-text passam do escalar `JSON` para o novo `RichText` no GraphQL, e o
  tipo gerado vira `TinaMarkdownContent`. O schema tem 3 ocorrências de `rich-text`, e nenhum
  arquivo fora de `tina/` importa `tina/__generated__` (que é ignorado no `.gitignore`). O Astro lê
  os `.md` direto do disco. O efeito esperado é só no `tina-lock.json` e na indexação do TinaCloud.
- **3.1.0:** o binário recusa Node < 22. O `.nvmrc` é 24, o Workers Builds usa `nodejs@24.22.3`
  (log do build `9c1f6078`), e a máquina local roda v24.16.0. O `engines` do 4.0.5 é
  `"22.x || 24.x"`.
- **4.0.0:** a mudança incompatível é só no `tinacms init` (sai a migração do Forestry e o
  prettier), que não usamos.
- **4.0.2:** o `tinacms build` passa a regenerar o `tina/tina-lock.json`. Até aqui só o
  `tinacms dev` regenerava, e o README e o cabeçalho de `tests/content/tina-lock-coerente.test.ts`
  dizem isso.
- As opções `--skip-cloud-checks` (ADR-0009) e `-c,--command` (`npm run dev`) existem no
  `dist/index.js` do 4.0.5. A telemetria PostHog já existia no 2.6.1, então nada muda nesse ponto.
- O `@tinacms/graphql` sobe de 2.4.10 para `^4.1.0`. O TinaCloud compara a versão do GraphQL local
  com a da indexação (ADR-0009). Depois do merge, a `main` é reindexada com o lock novo, e o
  `/admin` de produção só se prova depois disso (passo O7).

**Prévia da branch na Cloudflare.** O gatilho "Deploy non-production branches" (todo branch menos a
`main`) roda `npm run build:pipeline` e `npx wrangler versions upload`. Isso gera uma versão sem
publicar, e a prévia usa o `wrangler` novo. **Perigo:** o `/admin` da prévia usa `TINA_BRANCH`,
que cai em `'main'` (`branch: process.env.TINA_BRANCH || 'main'`, em `tina/config.ts`). Salvar nele grava no conteúdo real do professor.
**Ninguém salva no `/admin` de prévia.**

## Regras invioláveis

- **Nunca `npm audit fix`**, nem `--force`: ele já trouxe uma segunda cópia do `tinacms` e
  ameaçou o `/admin` (memória do projeto; `e918303`).
- **Nunca `overrides`** no `package.json` (ADR-0002, e alternativa rejeitada no ADR-0010).
- **Nunca `--legacy-peer-deps`**, nem editar o `package-lock.json` à mão.
- **Versões diretas continuam exatas**, sem `^`, no estilo do `package.json`.
- **Nada de dependência fora da tabela acima.** As moderadas ficam fora do escopo: registre só
  a contagem.
- **Nenhum arquivo de `src/`, `content/` ou `tina/config.ts` muda.** Se o CLI ou o `tinacms` novo
  exigirem mudança de código, pare e reporte (ver degrau 3).
- **Uma árvore só do Tina:** depois de cada degrau, `npm ls tinacms` mostra **uma** versão, e
  `npm ls @tinacms/schema-tools` não pode ter cópia aninhada sob `tinacms` diferente da de cima.
- **O executor só commita na branch `atualiza-dependencias`, e nunca dá push.** Esta é uma
  exceção à regra geral do despacho, para cada degrau virar um commit e permitir bisseção. As
  mensagens estão nos degraus.
- **Medição antes de exceção.** Exceção só entra para alerta cuja saída foi medida e não
  existe, com o `npm ls` e o `fixAvailable` colados na Evidência. Os únicos candidatos previstos:
  - GHSA-mrhx, só pela cópia `zod@3.x` do Tina;
  - GHSA-7mx3 e GHSA-c4qx, se sobrar cópia vulnerável de `@graphql-tools/utils` só sob
    `@tinacms/*`;
  - GHSA-pwhx (e GHSA-c4qx), só no fallback do degrau 3.

  Qualquer outro `high`/`critical` que sobrar → pare e reporte.

## Arquivos afetados

- `package.json` — `tinacms`, `vite`, `wrangler` (degrau 2) e `@tinacms/cli` (degrau 3)
- `package-lock.json` — só pelos comandos `npm update`/`npm install` dos degraus
- `tina/tina-lock.json` — regenerado no degrau 3
- `scripts/auditar-dependencias.mjs` — `EXCECOES` e cabeçalho §10.1 (degrau 4)
- `docs/adr/0010-npm-audit-no-ci-e-severidade.md` — seção nova "Exceções datadas (2026-11-…)" e a tabela de 2026-10-07 atualizada (degrau 4)
- `README.md` — o parágrafo da seção "Painel de edição" sobre o `tina-lock.json` (linhas 159–168; só se o degrau 3 ficar) e o parágrafo que começa com "**O `package.json` não tem `overrides`**" (linha 367; as "8 moderadas" e as "três exceções")
- `tests/content/tina-lock-coerente.test.ts` — só o comentário do cabeçalho ("O lock só é regenerado por `npx tinacms dev`"), se o degrau 3 ficar
- `docs/avisos-do-painel-para-o-manual.md` — "Versão do TinaCMS observada" e o "Quando revisar" de cada aviso, com o resultado do passo O2

> Fora desta lista, nada muda. Os arquivos derivados `tina/__generated__/` e `public/admin/` são
> ignorados no `.gitignore` e podem ser apagados para regenerar. O `Status:` fica `TODO`.

## Ferramenta de medição (scratchpad, vai inteira para a Evidência)

Em cada passo que mexe no lock, guarde uma cópia do lock antes e compare as duas depois com este
script (`<scratchpad>/diff-lock.mjs`, rodado como `node <scratchpad>/diff-lock.mjs antes.json
package-lock.json`):

```js
// Lista cada pacote do lock cuja versão mudou, entrou ou saiu.
import fs from 'node:fs';
const [a, b] = process.argv.slice(2).map((f) => JSON.parse(fs.readFileSync(f, 'utf8')).packages);
for (const k of new Set([...Object.keys(a), ...Object.keys(b)])) {
  const va = a[k]?.version, vb = b[k]?.version;
  if (va !== vb) console.log(`${k || '(raiz)'}: ${va ?? '—'} → ${vb ?? '—'}`);
}
```

A saída de cada passo só pode conter o pacote alvo e as dependências que vêm com ele. Qualquer
outra linha → pare e reporte.

## Passos

### O1 — Orquestrador: abrir a branch

Com o 086 DONE e a `main` local igual à remota (`git fetch` e `git status`), crie a branch com
`git switch -c atualiza-dependencias`. Rode `npm ci` e o portão
`node scripts/auditar-dependencias.mjs`, e cole a saída como **retrato "antes" na branch**. Ela tem
de bater com a tabela acima, salvo alerta publicado depois de 2026-11-21. Se aparecer alerta novo,
pare e atualize esta tabela antes de despachar.

### Degrau 1 — Executor: atualizações compatíveis (sem mexer no `package.json`)

Um pacote por vez, nesta ordem: `body-parser`, `markdown-it`, `undici` e `zod`. Para cada um:

1. copie o lock para o scratchpad;
2. rode `npm update <pacote>`;
3. rode `npm ls <pacote>`;
4. rode o `diff-lock.mjs`.

Resultado esperado:
- `body-parser` em 1.20.9 ou mais;
- `markdown-it` em 14.3.3 ou mais;
- a cópia de `undici` sob `unifont` em 8.12.2 ou mais (a de `miniflare` **continua** 7.29.1, e é
  o degrau 2 que resolve);
- as cópias de `zod` sob `astro` e `@astrojs/sitemap` em 4.6.6 ou mais (a `zod@3.25.76` do Tina
  **continua**).

`git diff package.json` tem de sair vazio. → verify: `npm test` colado; depois o commit
`chore: atualiza dependências compatíveis do audit (plano 087, degrau 1)`.

### Degrau 2 — Executor: versões menores fixadas (`tinacms`, `vite`, `wrangler`)

Três subpassos, nesta ordem, cada um com a cópia do lock, `npm install`, `npm ls` e o
`diff-lock.mjs`:

- **2a.** No `package.json`, `tinacms` passa de `3.12.1` a `3.15.2`; rode `npm install`. Esperado:
  - `npm ls tinacms` com **uma** cópia, 3.15.2;
  - `npm ls @tinacms/app` em 2.6.0 ou mais (se não vier, `npm update @tinacms/app`);
  - `react-router-dom` em 7.18 ou mais. O `tinacms` 3.15.0 sobe de 6 para 7 e fecha as
    moderadas antigas do ADR-0010; confira e registre.
- **2b.** `vite` passa de `8.2.2` a `8.3.8`; rode `npm install`. Esperado: `npm ls vite` sem
  segunda cópia do vite 8 no topo. As cópias aninhadas do `@tinacms/cli` (vite 6) existem hoje e
  são esperadas. **Uma segunda cópia do vite 8 quebra o `astro check` com `ts(2322)`** (ADR-0002).
- **2c.** `wrangler` passa de `4.145.0` a `4.166.0`; rode `npm install`. Esperado:
  `npm ls miniflare undici sharp` com o `miniflare` em `5.20261119.0-beta`, o `undici` dele em
  7.30.2 e o `sharp` em 0.35.5 ou mais.

→ verify:
- `npm test`;
- `npm run build:pipeline` (com `.env`; no CI as variáveis vêm de segredos);
- `npm run test:dist`;
- `npx wrangler --version`.

Depois, o commit `chore: sobe tinacms, vite e wrangler para as versões corrigidas (plano 087, degrau 2)`.

**PARADA A.** Reporte ao orquestrador e espere o passo O2 antes do degrau 3.

### O2 — Orquestrador: painel local no Edge (depois do degrau 2, e de novo depois do 3)

Não use `npm run dev`: no Astro 7 ele deixa o servidor do Tina morto (README, seção "Painel de
edição"). Suba os dois servidores com `npx astro dev --background --force` e `npx tinacms dev`, e
abra `http://localhost:4321/admin`. O painel local grava no disco: tudo o que for salvo se desfaz
com `git checkout -- content/` e `git clean` só nos arquivos criados, conferidos um a um no `git
status`. Faça os testes de escrita numa **disciplina de teste** criada como rascunho
(`content/disciplinas/teste-087.md`, com `publicado: false`, `nome` e `status`), nunca nas do
professor, e apague-a no fim.

**Navegador desde 2026-11-21: Edge.** No Vivaldi a extensão parou de agir: a aba sai do grupo da
extensão. Com a janela sem foco, a captura de tela pode dar timeout de CDP. Leia o estado pelo DOM
(`javascript_tool`, `find`, `read_page`). Antes e depois de cada Save, grave o `cat` e o mtime do
arquivo de teste num `.txt` do scratchpad: a Evidência cola esses arquivos, não a lembrança.
Verifique:

1. as seis coleções listam os documentos: perfil, linhas de pesquisa, projetos, disciplinas,
   publicações e extensão;
2. editar um campo da disciplina de teste e salvar → o arquivo muda no disco com o valor;
3. os alertas do `beforeSubmit` aparecem e o arquivo não muda:
   - 086, aula com Número `1` e Título `" "` (só espaço): o Tina aceita, sem "Required", e o hook
     tem de responder "Não salvo: Aulas, item 1: falta Título.". **Campo vazio não serve para este
     teste:** o `required` do próprio Tina já barra, e o hook nem é chamado (o ciclo 3 do 086
     reprovou por isso);
   - 086, link `AAAA`;
   - Extensão, foto pela metade;
4. o gerenciador de mídia abre e lista `public/uploads`;
5. **Avisos 1, 2 (instância `publicacoes.autores[]`) e 3** de
   `docs/avisos-do-painel-para-o-manual.md`: repita o "Como reproduzir" de cada um e anote se o
   comportamento continua. É o insumo do manual do professor.

O console do navegador não pode mostrar erro novo em relação ao `main`. Para comparar, abra o
painel antes da branch, no `main`, e registre os erros que já existiam. Ao fim, rode
`npx astro dev stop` e encerre os processos `node` do `tinacms dev`. Registre tudo na Evidência.

### Degrau 3 — Executor: `@tinacms/cli` 2.6.1 → 4.0.5 (major)

1. Copie o lock e o `tina/tina-lock.json` para o scratchpad. No `package.json`, `@tinacms/cli`
   passa a `4.0.5`; rode `npm install`, depois `npm ls @tinacms/cli @tinacms/graphql
   @tinacms/schema-tools @graphql-tools/utils tinacms` e o `diff-lock.mjs`. Esperado:
   - `@tinacms/graphql` 4.1 ou mais;
   - **uma** cópia de `tinacms` (3.15.2);
   - `@tinacms/schema-tools` 2.11 ou mais, sem duplicata.
2. Apague `tina/__generated__/` e `public/admin/` (derivados) e rode `npm run build:pipeline`. Desde
   o 4.0.2, o `tinacms build` regenera o `tina/tina-lock.json`: cole o `git diff --stat
   tina/tina-lock.json` e um resumo do que mudou (versão do GraphQL, escalar `RichText`). Rode também
   `npx tinacms dev` uma vez e confira que o lock não muda de novo.
3. → verify: `npm test` (inclui `tina-lock-coerente` e `paridade-schema`), `npm run test:dist`, e o
   portão `node scripts/auditar-dependencias.mjs` colado. Esperado: sem GHSA-pwhx, e GHSA-c4qx
   e GHSA-7mx3 só se ainda houver `@graphql-tools/utils` 12.0.1 ou menor. Nesse caso, cole o
   `npm ls @graphql-tools/utils` e diga sob quem está cada cópia.
4. Commit `chore: sobe @tinacms/cli para 4.0.5 (plano 087, degrau 3)`.

**Correções permitidas neste degrau:** regenerar o lock e apagar os derivados. **Qualquer outra**
(mudar `tina/config.ts`, `src/`, um script do `package.json`, um teste) → não faça. Pare e
reporte com a saída do erro.

**PARADA B.** O orquestrador repete o passo O2 com o CLI 4. Ele decide:

- **Ficou:** segue para o degrau 4.
- **Quebrou, e a causa é óbvia e cabe nas correções permitidas:** o executor corrige e o O2 se
  repete.
- **Quebrou, e a causa não é óbvia, ou exige mudança fora das permitidas → fallback (decisão 3):**
  1. `git revert --no-edit HEAD` (o commit do degrau 3) e `npm ci`;
  2. confira que `npm ls @tinacms/cli` mostra 2.6.1 e que o `tina/tina-lock.json` voltou ao do
     degrau 2;
  3. registre na Evidência o erro e o que foi tentado, e siga para o degrau 4 com a exceção do
     GHSA-pwhx.

### Degrau 4 — Executor: exceções e documentação

1. Rode `npm audit --json` e `node scripts/auditar-dependencias.mjs` e cole as duas saídas. Para
   **cada** `high`/`critical` que sobrar, cole o `npm ls <pacote>` e o `fixAvailable`.
   - Só os candidatos das "Regras invioláveis" podem virar exceção.
   - Para o GHSA-mrhx, prove com `npm ls zod` que **toda** cópia abaixo de 4.6.6 é a 3.x sob
     `tinacms`/`@tinacms/*`. A exceção vale por id do alerta e também esconderia uma cópia do
     Astro: por isso a prova é obrigatória.
2. Em `EXCECOES` (`scripts/auditar-dependencias.mjs`):
   - retire `GHSA-vfj7-8cjw-p6xm` (`braces`) e, se o portão a der como obsoleta,
     `GHSA-wq5f-xc86-pv6w` (`sharp`);
   - acrescente as exceções medidas, com `desde` na data do degrau e o `motivo` em uma linha com o
     fato medido. Modelo do `zod`: `'só a cópia zod@3.25.76 de tinacms/@tinacms/*; a linha 3 não
     tem correção (3.25.76 é a última 3.x) e o Tina pede ^3.24.2 até o CLI 4.0.5'`;
   - se o `GHSA-7mx3` continuar, reescreva o `motivo`, porque "o downgrade para
     `@tinacms/cli@0.56.5`" não descreve mais a medição.

   O teste `tests/lib/auditar-dependencias.test.ts` ("toda exceção real tem data, pacote e motivo")
   tem de continuar verde.
3. **ADR-0010:** crie a seção nova "Exceções datadas (<data>)", no formato da de 2026-10-07:
   - o retrato antes e depois do `npm audit`;
   - a tabela do que foi corrigido (pacote, antes → depois, degrau);
   - a tabela de exceções (advisory, pacote, por que não há saída hoje, alcance, gatilho de
     retirada);
   - as decisões 2 e 3 deste plano.

   Na tabela de 2026-10-07, marque como retiradas as exceções que saíram, com a data. Não
   reescreva o histórico de 2026-09-12. Alcance que vale para todas as exceções do Tina: o painel
   `/admin`, autenticado e usado por uma pessoa, e o build. O site publicado é HTML estático, sem
   React nem Node em execução (D-01).
4. **README:**
   - no parágrafo do `overrides` (linha 367), troque as "8 moderadas" com a cadeia antiga pela
     contagem medida e as "três exceções datadas desde 2026-10-07" pela lista atual;
   - se o degrau 3 ficou, reescreva o parágrafo do `tina-lock.json` (linhas 159–168): o `tinacms
     build` também regenera o lock desde o CLI 4.0.2, mas o build do CI não commita, então quem
     muda o schema ainda tem de commitar o lock;
   - o mesmo ajuste vai no comentário do cabeçalho de `tests/content/tina-lock-coerente.test.ts`.
5. **`docs/avisos-do-painel-para-o-manual.md`:**
   - "Versão do TinaCMS observada" passa a 3.15.2, com a data;
   - em cada "Quando revisar", o resultado do passo O2.5: o comportamento continua, ou mudou e
     como.

   Aviso que o O2 não reproduziu fica marcado como "não reverificado em 3.15.2". Nunca se apaga
   aviso sem observação.
6. **Canário do portão:** retire temporariamente a exceção do `zod` (ou a primeira da lista) →
   `node scripts/auditar-dependencias.mjs` reprova com o alerta dela. Devolva → aprova. Cole as
   duas saídas.
7. **Portão final, com a árvore limpa:** rode `npm ci`, depois `node scripts/auditar-dependencias.mjs`
   (`aprovado`, sem nenhuma linha `AVISO`), `npm run lint`, `npm run format:check`,
   `npm run test:coverage`, `npm run build:pipeline` e `npm run test:dist`, e cole as saídas. É a
   sequência exata do `ci.yml`.
8. Commit `docs: exceções datadas e ADR-0010 depois da atualização (plano 087, degrau 4)`. Pare
   e reporte.

### O3 — Orquestrador: revisão, push da branch, prévia e PR

1. **Revisão:** o `code-reviewer` revisa o `git diff main...atualiza-dependencias` contra este
   plano, reproduzindo as alegações da Evidência, e não só lendo-as (memória: revisão reproduz).
2. **Push da branch** (só com autorização do dono do produto): `git push -u origin
   atualiza-dependencias`. Isso dispara o gatilho de prévia da Cloudflare. Confira:
   - o check-run `Workers Builds: haroldo-page` do SHA **completo** da ponta da branch, que tem de
     terminar `success`;
   - no log do build, pela API `/builds/builds/{uuid}/logs`, o `npm clean-install` e o
     `wrangler versions upload` sem erro;
   - se o log der uma URL de prévia, abra a Home e uma disciplina. **Não salve nada no `/admin` da
     prévia** (aponta para a `main`).
3. **PR:** `gh pr create --base main --head atualiza-dependencias`, com o resumo dos degraus e o
   link do plano. O `ci.yml` roda em `pull_request`. O job `qualidade` do PR tem de sair
   **inteiro verde**, e esse é o objetivo do plano.

### O4 — Orquestrador: merge

1. **Janela:** combine com o dono do produto um horário em que o professor não esteja editando.
   Os saves de 2026-11-20 e 2026-11-21 foram entre 14:00 e 17:00 UTC. Logo depois do merge, o
   TinaCloud reindexa a `main` com o lock novo.
2. **Anote antes, na Evidência, o comando de reversão** com os SHAs dos commits da branch (passo
   O6).
3. `git fetch` e `git rebase origin/main` na branch. A `main` só deve ter saves do Tina em
   `content/`: se houver outra coisa, pare. Depois, `npm test`, `git push --force-with-lease`, e
   espere o CI do PR verde de novo.
4. Merge: `git switch main`, `git merge --ff-only atualiza-dependencias` e `git push origin main`.

### O5 — Orquestrador: produção

1. CI `qualidade` **verde** no SHA completo da `main`. É o primeiro verde desde 2026-11-20.
2. `Workers Builds: haroldo-page` `success` no mesmo SHA, e `gh workflow run vigia-do-deploy.yml`
   verde.
3. Abra a Home e uma disciplina em `https://haroldo-page.and-near.workers.dev`.
4. `/admin` de produção, no Edge, logado como ADMIN:
   - o TinaCloud mostra a `main` indexada depois do merge;
   - as seis coleções listam;
   - uma disciplina abre.

   Não salve conteúdo do professor: o salvamento já foi provado no O2. Erro de schema ou de
   indexação que não some depois da reindexação → O6.
5. Apague a branch, local e remota, só com autorização.

### O6 — Reversão (se o O5 falhar)

1. `git revert --no-edit <SHA do degrau 4> <SHA do degrau 3> <SHA do degrau 2> <SHA do degrau 1>`
   (do mais novo ao mais antigo; o degrau 3 fica de fora se tiver sido revertido no fallback) e
   `git push origin main`.
2. Confira o Workers Builds verde, o TinaCloud reindexado com o lock antigo e o `/admin` de volta.
3. O CI volta ao vermelho do audit, que é o estado anterior e conhecido. Registre o que falhou e
   abra `/investigar` antes de tentar de novo.

## Critérios de aceitação

- [ ] Retrato "antes" na branch colado e igual à tabela (ou tabela atualizada antes do despacho)
- [ ] Degrau 1: quatro `npm update`, cada um com `npm ls` e `diff-lock.mjs` só do pacote alvo; `package.json` intacto
- [ ] Degrau 2: `tinacms` 3.15.2 com uma cópia só, `@tinacms/app` ≥ 2.6.0, `vite` 8.3.8 sem segunda cópia do vite 8, `wrangler` 4.166.0 com `undici` 7.30.2 e `sharp` ≥ 0.35.5 sob o `miniflare`
- [ ] O2 depois do degrau 2 e do 3: seis coleções, save no disco, alertas do 086 e da Extensão, mídia, Avisos 1–3 reobservados, sem erro novo no console
- [ ] Degrau 3 ficou, com o lock regenerado e verde, **ou** o fallback executado e registrado com o erro
- [ ] Degrau 4: só exceções medidas, com a prova do `npm ls`; `braces` (e `sharp`, se obsoleta) retiradas; nenhum `AVISO` no portão
- [ ] Canário do portão vermelho e desfeito
- [ ] ADR-0010, README, cabeçalho do teste do lock e avisos do painel atualizados
- [ ] Portão final em árvore limpa (`npm ci` + a sequência do `ci.yml`), tudo verde e colado
- [ ] Prévia da branch `success`; CI do PR inteiro verde
- [ ] Depois do merge: CI `qualidade` verde na `main`, Workers Builds `success`, vigia verde, `/admin` de produção funcionando, tudo pelo SHA completo

## Evidência

<Preenchida pelo executor e pelo orquestrador, com saída literal capturada em arquivo (ver
`plans/DESPACHO.md`). Plano sem esta seção preenchida não é DONE.>
