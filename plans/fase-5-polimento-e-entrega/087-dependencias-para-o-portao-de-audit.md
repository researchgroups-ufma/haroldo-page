# Plano 087 — Dependências atualizadas para o portão de auditoria voltar a verde (RNF-07, RNF-08, ADR-0010)

**Status:** DONE
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

- [x] Retrato "antes" na branch colado e igual à tabela (ou tabela atualizada antes do despacho)
- [x] Degrau 1: quatro `npm update`, cada um com `npm ls` e `diff-lock.mjs` só do pacote alvo; `package.json` intacto
- [x] Degrau 2: `tinacms` 3.15.2 com uma cópia só, `@tinacms/app` ≥ 2.6.0, `vite` 8.3.8 sem segunda cópia do vite 8, `wrangler` 4.166.0 com `undici` 7.30.2 e `sharp` ≥ 0.35.5 sob o `miniflare`
- [x] O2 depois do degrau 2 e do 3: seis coleções, save no disco, alertas do 086 e da Extensão, mídia, Avisos 1–3 reobservados, sem erro novo no console
- [x] Degrau 3 ficou, com o lock regenerado e verde, **ou** o fallback executado e registrado com o erro
- [x] Degrau 4: só exceções medidas, com a prova do `npm ls`; `braces` (e `sharp`, se obsoleta) retiradas; nenhum `AVISO` no portão
- [x] Canário do portão vermelho e desfeito
- [x] ADR-0010, README, cabeçalho do teste do lock e avisos do painel atualizados
- [x] Portão final em árvore limpa (`npm ci` + a sequência do `ci.yml`), tudo verde e colado
- [x] Prévia da branch `success`; CI do PR inteiro verde
- [x] Depois do merge: CI `qualidade` verde na `main`, Workers Builds `success`, vigia verde, `/admin` de produção funcionando, tudo pelo SHA completo

## Evidência

<Preenchida pelo executor e pelo orquestrador, com saída literal capturada em arquivo (ver
`plans/DESPACHO.md`). Plano sem esta seção preenchida não é DONE.>


## Evidência — degraus 1 e 2 (executor, 2026-11-22)

Capturada pelo Git Bash, um `.txt` por bloco. Commits: degrau 1 `7ea9400`, degrau 2 `9685036`. Não rodei: degrau 3, degrau 4, passos O2 a O6, `lint`, `format:check`, `test:coverage`, `astro check` isolado, nem `wrangler deploy`/`versions upload`.

### O1 — retrato antes na branch (orquestrador)

```
71e1c24373288cf3774839664fb6e7f3653bbfad
atualiza-dependencias
npm audit: {"info":0,"low":3,"moderate":23,"high":22,"critical":2,"total":50}
exceção aceita (desde 2026-10-07, ADR-0010): GHSA-7mx3-vvmw-hjmv @graphql-tools/utils — só via @tinacms/cli; a única correção do npm é o downgrade para @tinacms/cli@0.56.5
exceção aceita (desde 2026-10-07, ADR-0010): GHSA-wq5f-xc86-pv6w sharp — miniflare (wrangler, até o 4.148.0) fixa sharp@0.35.4 exato; a corrigida é a 0.35.5
AVISO: a exceção GHSA-vfj7-8cjw-p6xm (braces) não aparece mais; retire-a daqui e do ADR-0010.
REPROVADO: high GHSA-c4qx-w738-7hr3 @graphql-tools/utils — GraphQL Tools: Prototype pollution in mergeIncrementalResult via non-primitive path segments
REPROVADO: critical GHSA-x34j-47hf-4xg7 tinacms — TinaCMS admin preview iframe loads an attacker-controlled origin from the URL fragment
REPROVADO: high GHSA-pwhx-cvv3-qj5c @tinacms/cli — Tina: Code injection via unescaped Git branch name in generated client source
REPROVADO: high GHSA-27r3-jxmh-p828 body-parser — body-parser vulnerable to Denial of Service via trailing bytes after a compressed request body
REPROVADO: high GHSA-r7fv-28h4-cvq7 markdown-it — markdown-it: Quadratic complexity in smartquotes with unmatched closing quotes
REPROVADO: high GHSA-gfr2-rv44-r23c markdown-it — markdown-it: Quadratic-time rendering of a single multi-line link reference definition with default options (regression since 14.0)
REPROVADO: high GHSA-xjj6-f33q-929c undici — undici vulnerable to Denial of Service via unhandled error on excessive content-encodings
REPROVADO: high GHSA-4w7w-5xrc-9h26 undici — undici vulnerable to cache poisoning and cross-user disclosure via cross-origin redirects
REPROVADO: high GHSA-2m5v-pch6-74hx undici — undici vulnerable to TLS certificate validation bypass via dropped tls options in Agent
REPROVADO: high GHSA-qrxm-fqhp-jwvm undici — undici vulnerable to Denial of Service via TLS 1.2 certificate-changing renegotiation
REPROVADO: high GHSA-587h-7wmj-h5pm vite — launch-editor: `fs.existsSync()` existence check can be bypassed on Windows
REPROVADO: high GHSA-mrhx-c7xc-m3w5 zod — Zod can exhaust memory while validating oversized constrained collections
Atualize a dependência ou registre exceção datada no ADR-0010 (nunca baixe o nível).
EXIT=1
```

### Ferramenta `diff-lock.mjs` (scratchpad)

```
// Lista cada pacote do lock cuja versão mudou, entrou ou saiu.
import fs from 'node:fs';
const [a, b] = process.argv.slice(2).map((f) => JSON.parse(fs.readFileSync(f, 'utf8')).packages);
for (const k of new Set([...Object.keys(a), ...Object.keys(b)])) {
  const va = a[k]?.version, vb = b[k]?.version;
  if (va !== vb) console.log(`${k || '(raiz)'}: ${va ?? '—'} → ${vb ?? '—'}`);
}
```

### Degrau 1 — `npm update body-parser`

```

added 1 package, changed 1 package, and audited 1521 packages in 9s

330 packages are looking for funding
  run `npm fund` for details

49 vulnerabilities (3 low, 23 moderate, 21 high, 2 critical)

To address issues that do not require attention, run:
  npm audit fix

To address all issues (including breaking changes), run:
  npm audit fix --force

Run `npm audit` for details.
EXIT=0
--- npm ls body-parser
haroldo-page@0.1.0 S:\Projetos\academic_page\haroldo
`-- @tinacms/cli@2.6.1
  +-- altair-express-middleware@7.3.6
  | `-- express@4.22.2
  |   `-- body-parser@1.20.9 deduped
  `-- body-parser@1.20.9

EXIT_LS=0
--- diff-lock
node_modules/body-parser: 1.20.6 → 1.20.9
node_modules/body-parser/node_modules/qs: — → 6.16.2
EXIT_DIFF=0
```

### Degrau 1 — `npm update markdown-it`

```

changed 1 package, and audited 1521 packages in 8s

330 packages are looking for funding
  run `npm fund` for details

48 vulnerabilities (3 low, 23 moderate, 20 high, 2 critical)

To address issues that do not require attention, run:
  npm audit fix

To address all issues (including breaking changes), run:
  npm audit fix --force

Run `npm audit` for details.
EXIT=0
--- npm ls markdown-it
haroldo-page@0.1.0 S:\Projetos\academic_page\haroldo
`-- @tinacms/cli@2.6.1
  `-- @tinacms/app@2.5.12
    `-- graphiql@4.1.2
      `-- @graphiql/react@0.34.1
        `-- markdown-it@14.3.3

EXIT_LS=0
--- diff-lock
node_modules/markdown-it: 14.3.1 → 14.3.3
EXIT_DIFF=0
```

### Degrau 1 — `npm update undici`

```

changed 1 package, and audited 1521 packages in 8s

330 packages are looking for funding
  run `npm fund` for details

48 vulnerabilities (3 low, 23 moderate, 20 high, 2 critical)

To address issues that do not require attention, run:
  npm audit fix

To address all issues (including breaking changes), run:
  npm audit fix --force

Run `npm audit` for details.
EXIT=0
--- npm ls undici
haroldo-page@0.1.0 S:\Projetos\academic_page\haroldo
+-- astro@7.2.10
| `-- unifont@0.7.5
|   `-- undici@8.13.1
`-- wrangler@4.145.0
  `-- miniflare@5.20260930.0-alpha
    `-- undici@7.29.1

EXIT_LS=0
--- diff-lock
node_modules/undici: 8.11.2 → 8.13.1
EXIT_DIFF=0
```

### Degrau 1 — `npm update zod`

```

changed 1 package, and audited 1521 packages in 9s

330 packages are looking for funding
  run `npm fund` for details

48 vulnerabilities (3 low, 23 moderate, 20 high, 2 critical)

To address issues that do not require attention, run:
  npm audit fix

To address all issues (including breaking changes), run:
  npm audit fix --force

Run `npm audit` for details.
EXIT=0
--- npm ls zod
haroldo-page@0.1.0 S:\Projetos\academic_page\haroldo
+-- @astrojs/sitemap@3.7.4
| `-- zod@4.6.7
+-- @tinacms/cli@2.6.1
| +-- @tinacms/app@2.5.12
| | `-- zod@3.25.76
| +-- @tinacms/schema-tools@2.9.0
| | `-- zod@3.25.76
| `-- zod@3.25.76
+-- astro@7.2.10
| `-- zod@4.6.7 deduped
`-- tinacms@3.12.1
  `-- zod@3.25.76

EXIT_LS=0
--- diff-lock
node_modules/zod: 4.5.4 → 4.6.7
EXIT_DIFF=0
```

### Degrau 1 — `npm test` (`package.json` intacto: `git diff package.json | wc -c` deu 0)

```

> haroldo-page@0.1.0 test
> vitest run


 RUN  v4.1.11 S:/Projetos/academic_page/haroldo


 Test Files  27 passed (27)
      Tests  529 passed (529)
   Start at  12:44:46
   Duration  2.46s (transform 8.56s, setup 0ms, import 16.27s, tests 731ms, environment 7ms)

EXIT=0
```

### Degrau 2a — `tinacms` 3.15.2

```
npm warn ERESOLVE overriding peer dependency

added 12 packages, removed 4 packages, changed 4 packages, and audited 1529 packages in 20s

331 packages are looking for funding
  run `npm fund` for details

48 vulnerabilities (3 low, 23 moderate, 21 high, 1 critical)

To address issues that do not require attention, run:
  npm audit fix

To address all issues (including breaking changes), run:
  npm audit fix --force

Run `npm audit` for details.
EXIT=0
--- npm ls tinacms @tinacms/app react-router-dom @tinacms/schema-tools
haroldo-page@0.1.0 S:\Projetos\academic_page\haroldo
+-- @tinacms/cli@2.6.1
| +-- @tinacms/app@2.5.12
| | +-- react-router-dom@6.30.6
| | `-- tinacms@3.15.2 deduped
| +-- @tinacms/graphql@2.4.10
| | `-- @tinacms/schema-tools@2.11.0 deduped
| +-- @tinacms/schema-tools@2.11.0
| +-- @tinacms/search@1.2.26
| | +-- @tinacms/graphql@4.1.0
| | | `-- @tinacms/schema-tools@2.11.0 deduped
| | `-- @tinacms/schema-tools@2.11.0 deduped
| `-- tinacms@3.15.2 deduped
`-- tinacms@3.15.2
  +-- @tinacms/mdx@2.4.2
  | `-- @tinacms/schema-tools@2.11.0 deduped
  +-- @tinacms/schema-tools@2.11.0 deduped
  `-- react-router-dom@7.18.6

EXIT_LS=0
--- diff-lock
node_modules/@tinacms/mdx: 2.2.1 → 2.4.2
node_modules/@tinacms/mdx/node_modules/prettier: 2.8.8 → —
node_modules/@tinacms/schema-tools: 2.9.0 → 2.11.0
node_modules/@tinacms/search: 1.2.24 → 1.2.26
node_modules/final-form-arrays: 4.0.1 → —
node_modules/react-final-form: 7.0.1 → —
node_modules/react-final-form/node_modules/@babel/runtime: 7.29.7 → —
node_modules/tinacms: 3.12.1 → 3.15.2
node_modules/@tinacms/mdx/node_modules/emoji-regex: — → 9.2.2
node_modules/@tinacms/search/node_modules/@tinacms/graphql: — → 4.1.0
node_modules/@tinacms/search/node_modules/argparse: — → 1.0.10
node_modules/@tinacms/search/node_modules/js-yaml: — → 3.15.2
node_modules/set-cookie-parser: — → 2.7.3
node_modules/tinacms/node_modules/@babel/runtime: — → 7.29.15
node_modules/tinacms/node_modules/cookie: — → 1.1.1
node_modules/tinacms/node_modules/final-form: — → 4.20.10
node_modules/tinacms/node_modules/final-form-arrays: — → 3.1.0
node_modules/tinacms/node_modules/react-final-form: — → 6.5.9
node_modules/tinacms/node_modules/react-router: — → 7.18.6
node_modules/tinacms/node_modules/react-router-dom: — → 7.18.6
```

### Degrau 2a — `npm update @tinacms/app` (o `npm install` deixou 2.5.12)

```
npm warn ERESOLVE overriding peer dependency
npm warn While resolving: react-final-form@6.5.9
npm warn Found: react@19.2.8
npm warn node_modules/react
npm warn   peer react@"^17.0.0 || ^18.0.0 || ^19.0.0" from @ariakit/react@0.4.39
npm warn   node_modules/@ariakit/react
npm warn     @ariakit/react@"^0.4.15" from tinacms@3.15.2
npm warn     node_modules/tinacms
npm warn   124 more (@ariakit/react-components, @ariakit/react-store, ...)
npm warn
npm warn Could not resolve dependency:
npm warn peer react@"^16.8.0 || ^17.0.0 || ^18.0.0" from react-final-form@6.5.9
npm warn node_modules/tinacms/node_modules/react-final-form
npm warn   react-final-form@"^6.5.9" from tinacms@3.15.2
npm warn   node_modules/tinacms
npm warn
npm warn Conflicting peer dependency: react@18.3.1
npm warn node_modules/react
npm warn   peer react@"^16.8.0 || ^17.0.0 || ^18.0.0" from react-final-form@6.5.9
npm warn   node_modules/tinacms/node_modules/react-final-form
npm warn     react-final-form@"^6.5.9" from tinacms@3.15.2
npm warn     node_modules/tinacms

added 3 packages, removed 4 packages, changed 3 packages, and audited 1528 packages in 11s

331 packages are looking for funding
  run `npm fund` for details

46 vulnerabilities (3 low, 21 moderate, 22 high)

To address issues that do not require attention, run:
  npm audit fix

To address all issues (including breaking changes), run:
  npm audit fix --force

Run `npm audit` for details.
EXIT=0
--- npm ls tinacms @tinacms/app react-router-dom @tinacms/schema-tools
haroldo-page@0.1.0 S:\Projetos\academic_page\haroldo
+-- @tinacms/cli@2.6.1
| +-- @tinacms/app@2.6.0
| | +-- react-router-dom@7.18.6 deduped
| | `-- tinacms@3.15.2 deduped
| +-- @tinacms/graphql@2.4.10
| | `-- @tinacms/schema-tools@2.11.0 deduped
| +-- @tinacms/schema-tools@2.11.0
| +-- @tinacms/search@1.2.26
| | +-- @tinacms/graphql@4.1.0
| | | `-- @tinacms/schema-tools@2.11.0 deduped
| | `-- @tinacms/schema-tools@2.11.0 deduped
| `-- tinacms@3.15.2 deduped
`-- tinacms@3.15.2
  +-- @tinacms/mdx@2.4.2
  | `-- @tinacms/schema-tools@2.11.0 deduped
  +-- @tinacms/schema-tools@2.11.0 deduped
  `-- react-router-dom@7.18.6

EXIT_LS=0
--- diff-lock
node_modules/@remix-run/router: 1.23.4 → —
node_modules/@tinacms/app: 2.5.12 → 2.6.0
node_modules/react-router: 6.30.6 → 7.18.6
node_modules/react-router-dom: 6.30.6 → 7.18.6
node_modules/tinacms/node_modules/cookie: 1.1.1 → —
node_modules/tinacms/node_modules/react-router: 7.18.6 → —
node_modules/tinacms/node_modules/react-router-dom: 7.18.6 → —
node_modules/@tinacms/app/node_modules/@babel/runtime: — → 7.29.15
node_modules/@tinacms/app/node_modules/final-form: — → 4.20.10
node_modules/react-router/node_modules/cookie: — → 1.1.1
 package.json | 2 +-
 1 file changed, 1 insertion(+), 1 deletion(-)
```

### Degrau 2b — `vite` 8.3.8

```
npm warn ERESOLVE overriding peer dependency
npm warn While resolving: react-final-form@6.5.9
npm warn Found: react@19.2.8
npm warn node_modules/react
npm warn   peer react@"^17.0.0 || ^18.0.0 || ^19.0.0" from @ariakit/react@0.4.39
npm warn   node_modules/@ariakit/react
npm warn     @ariakit/react@"^0.4.15" from tinacms@3.15.2
npm warn     node_modules/tinacms
npm warn   124 more (@ariakit/react-components, @ariakit/react-store, ...)
npm warn
npm warn Could not resolve dependency:
npm warn peer react@"^16.8.0 || ^17.0.0 || ^18.0.0" from react-final-form@6.5.9
npm warn node_modules/tinacms/node_modules/react-final-form
npm warn   react-final-form@"^6.5.9" from tinacms@3.15.2
npm warn   node_modules/tinacms
npm warn
npm warn Conflicting peer dependency: react@18.3.1
npm warn node_modules/react
npm warn   peer react@"^16.8.0 || ^17.0.0 || ^18.0.0" from react-final-form@6.5.9
npm warn   node_modules/tinacms/node_modules/react-final-form
npm warn     react-final-form@"^6.5.9" from tinacms@3.15.2
npm warn     node_modules/tinacms

changed 7 packages, and audited 1528 packages in 20s

331 packages are looking for funding
  run `npm fund` for details

46 vulnerabilities (3 low, 21 moderate, 22 high)

To address issues that do not require attention, run:
  npm audit fix

To address all issues (including breaking changes), run:
  npm audit fix --force

Run `npm audit` for details.
EXIT=0
--- npm ls vite
haroldo-page@0.1.0 S:\Projetos\academic_page\haroldo
+-- @tailwindcss/vite@4.3.3
| `-- vite@8.3.8 deduped
+-- @tinacms/cli@2.6.1
| +-- @vitejs/plugin-react@4.7.0
| | `-- vite@6.4.3 deduped
| `-- vite@6.4.3
+-- astro@7.2.10
| +-- vite@8.3.8 deduped
| `-- vitefu@1.1.3
|   `-- vite@8.3.8 deduped
+-- vite@8.3.8
`-- vitest@4.1.11
  +-- @vitest/mocker@4.1.11
  | `-- vite@8.3.8 deduped
  `-- vite@8.3.8 deduped

EXIT_LS=0
--- diff-lock
node_modules/@napi-rs/wasm-runtime: 1.2.3 → 1.2.6
node_modules/@oxc-project/types: 0.147.0 → 0.156.0
node_modules/@rolldown/binding-android-arm-eabi: 1.2.6 → 1.2.19
node_modules/@rolldown/binding-android-arm64: 1.2.6 → 1.2.19
node_modules/@rolldown/binding-darwin-arm64: 1.2.6 → 1.2.19
node_modules/@rolldown/binding-darwin-x64: 1.2.6 → 1.2.19
node_modules/@rolldown/binding-freebsd-x64: 1.2.6 → 1.2.19
node_modules/@rolldown/binding-linux-arm-gnueabihf: 1.2.6 → 1.2.19
node_modules/@rolldown/binding-linux-arm64-gnu: 1.2.6 → 1.2.19
node_modules/@rolldown/binding-linux-arm64-musl: 1.2.6 → 1.2.19
node_modules/@rolldown/binding-linux-ppc64-gnu: 1.2.6 → 1.2.19
node_modules/@rolldown/binding-linux-s390x-gnu: 1.2.6 → 1.2.19
node_modules/@rolldown/binding-linux-x64-gnu: 1.2.6 → 1.2.19
node_modules/@rolldown/binding-linux-x64-musl: 1.2.6 → 1.2.19
node_modules/@rolldown/binding-openharmony-arm64: 1.2.6 → 1.2.19
node_modules/@rolldown/binding-win32-arm64-msvc: 1.2.6 → 1.2.19
node_modules/@rolldown/binding-win32-x64-msvc: 1.2.6 → 1.2.19
node_modules/@rolldown/pluginutils: 1.0.1 → 1.1.1
node_modules/nanoid: 3.3.18 → 3.3.20
node_modules/postcss: 8.5.26 → 8.5.33
node_modules/rolldown: 1.2.6 → 1.2.19
node_modules/vite: 8.2.2 → 8.3.8
node_modules/@rolldown/binding-wasm32-wasi: — → 1.2.19
node_modules/@rolldown/binding-wasm32-wasi/node_modules/@emnapi/core: — → 2.0.0-beta.2
node_modules/@rolldown/binding-wasm32-wasi/node_modules/@emnapi/runtime: — → 2.0.0-beta.2
node_modules/@rolldown/binding-wasm32-wasi/node_modules/@emnapi/wasi-threads: — → 2.2.0
```

### Degrau 2c — `wrangler` 4.166.0

```

added 27 packages, removed 3 packages, changed 8 packages, and audited 1552 packages in 34s

334 packages are looking for funding
  run `npm fund` for details

42 vulnerabilities (3 low, 20 moderate, 19 high)

To address issues that do not require attention, run:
  npm audit fix

To address all issues (including breaking changes), run:
  npm audit fix --force

Run `npm audit` for details.
EXIT=0
--- npm ls miniflare undici sharp wrangler
haroldo-page@0.1.0 S:\Projetos\academic_page\haroldo
+-- astro@7.2.10
| +-- sharp@0.35.5
| `-- unifont@0.7.5
|   `-- undici@8.13.1
`-- wrangler@4.166.0
  +-- @cloudflare/workers-utils@0.56.0
  | `-- undici@7.30.2
  +-- miniflare@5.20261119.0-beta
  | +-- sharp@0.35.5 deduped
  | `-- undici@7.30.2
  `-- undici@7.30.2

EXIT_LS=0
--- diff-lock
node_modules/@cloudflare/kv-asset-handler: 0.5.0 → 0.5.1
node_modules/@cloudflare/workerd-darwin-64: 1.20260930.2 → 1.20261119.1
node_modules/@cloudflare/workerd-darwin-arm64: 1.20260930.2 → 1.20261119.1
node_modules/@cloudflare/workerd-linux-64: 1.20260930.2 → 1.20261119.1
node_modules/@cloudflare/workerd-linux-arm64: 1.20260930.2 → 1.20261119.1
node_modules/@cloudflare/workerd-windows-64: 1.20260930.2 → 1.20261119.1
node_modules/@img/sharp-darwin-arm64: 0.35.4 → 0.35.5
node_modules/@img/sharp-darwin-x64: 0.35.4 → 0.35.5
node_modules/@img/sharp-freebsd-wasm32: 0.35.4 → 0.35.5
node_modules/@img/sharp-libvips-darwin-arm64: 1.3.3 → 1.3.4
node_modules/@img/sharp-libvips-darwin-x64: 1.3.3 → 1.3.4
node_modules/@img/sharp-libvips-linux-arm: 1.3.3 → 1.3.4
node_modules/@img/sharp-libvips-linux-arm64: 1.3.3 → 1.3.4
node_modules/@img/sharp-libvips-linux-ppc64: 1.3.3 → 1.3.4
node_modules/@img/sharp-libvips-linux-riscv64: 1.3.3 → 1.3.4
node_modules/@img/sharp-libvips-linux-s390x: 1.3.3 → 1.3.4
node_modules/@img/sharp-libvips-linux-x64: 1.3.3 → 1.3.4
node_modules/@img/sharp-libvips-linuxmusl-arm64: 1.3.3 → 1.3.4
node_modules/@img/sharp-libvips-linuxmusl-x64: 1.3.3 → 1.3.4
node_modules/@img/sharp-linux-arm: 0.35.4 → 0.35.5
node_modules/@img/sharp-linux-arm64: 0.35.4 → 0.35.5
node_modules/@img/sharp-linux-ppc64: 0.35.4 → 0.35.5
node_modules/@img/sharp-linux-riscv64: 0.35.4 → 0.35.5
node_modules/@img/sharp-linux-s390x: 0.35.4 → 0.35.5
node_modules/@img/sharp-linux-x64: 0.35.4 → 0.35.5
node_modules/@img/sharp-linuxmusl-arm64: 0.35.4 → 0.35.5
node_modules/@img/sharp-linuxmusl-x64: 0.35.4 → 0.35.5
node_modules/@img/sharp-wasm32: 0.35.4 → 0.35.5
node_modules/@img/sharp-webcontainers-wasm32: 0.35.4 → 0.35.5
node_modules/@img/sharp-win32-arm64: 0.35.4 → 0.35.5
node_modules/@img/sharp-win32-ia32: 0.35.4 → 0.35.5
node_modules/@img/sharp-win32-x64: 0.35.4 → 0.35.5
node_modules/blake3-wasm: 2.1.5 → —
node_modules/miniflare: 5.20260930.0-alpha → 5.20261119.0-beta
node_modules/miniflare/node_modules/undici: 7.29.1 → 7.30.2
node_modules/sharp: 0.35.4 → 0.35.5
node_modules/workerd: 1.20260930.2 → 1.20261119.1
node_modules/wrangler: 4.145.0 → 4.166.0
node_modules/wrangler/node_modules/@esbuild/aix-ppc64: 0.28.1 → —
node_modules/wrangler/node_modules/@esbuild/android-arm: 0.28.1 → —
node_modules/wrangler/node_modules/@esbuild/android-arm64: 0.28.1 → —
node_modules/wrangler/node_modules/@esbuild/android-x64: 0.28.1 → —
node_modules/wrangler/node_modules/@esbuild/darwin-arm64: 0.28.1 → —
node_modules/wrangler/node_modules/@esbuild/darwin-x64: 0.28.1 → —
node_modules/wrangler/node_modules/@esbuild/freebsd-arm64: 0.28.1 → —
node_modules/wrangler/node_modules/@esbuild/freebsd-x64: 0.28.1 → —
node_modules/wrangler/node_modules/@esbuild/linux-arm: 0.28.1 → —
node_modules/wrangler/node_modules/@esbuild/linux-arm64: 0.28.1 → —
node_modules/wrangler/node_modules/@esbuild/linux-ia32: 0.28.1 → —
node_modules/wrangler/node_modules/@esbuild/linux-loong64: 0.28.1 → —
node_modules/wrangler/node_modules/@esbuild/linux-mips64el: 0.28.1 → —
node_modules/wrangler/node_modules/@esbuild/linux-ppc64: 0.28.1 → —
node_modules/wrangler/node_modules/@esbuild/linux-riscv64: 0.28.1 → —
node_modules/wrangler/node_modules/@esbuild/linux-s390x: 0.28.1 → —
node_modules/wrangler/node_modules/@esbuild/linux-x64: 0.28.1 → —
node_modules/wrangler/node_modules/@esbuild/netbsd-arm64: 0.28.1 → —
node_modules/wrangler/node_modules/@esbuild/netbsd-x64: 0.28.1 → —
node_modules/wrangler/node_modules/@esbuild/openbsd-arm64: 0.28.1 → —
node_modules/wrangler/node_modules/@esbuild/openbsd-x64: 0.28.1 → —
node_modules/wrangler/node_modules/@esbuild/openharmony-arm64: 0.28.1 → —
node_modules/wrangler/node_modules/@esbuild/sunos-x64: 0.28.1 → —
node_modules/wrangler/node_modules/@esbuild/win32-arm64: 0.28.1 → —
node_modules/wrangler/node_modules/@esbuild/win32-ia32: 0.28.1 → —
node_modules/wrangler/node_modules/@esbuild/win32-x64: 0.28.1 → —
node_modules/wrangler/node_modules/esbuild: 0.28.1 → —
node_modules/@cloudflare/workers-utils: — → 0.56.0
node_modules/@cloudflare/workers-utils/node_modules/chalk: — → 5.3.0
node_modules/@cloudflare/workers-utils/node_modules/dotenv: — → 16.3.1
node_modules/@cloudflare/workers-utils/node_modules/undici: — → 7.30.2
node_modules/@types/node-fetch: — → 2.6.13
node_modules/@types/yargs: — → 17.0.24
node_modules/@types/yargs-parser: — → 21.0.3
node_modules/agentkeepalive: — → 4.6.0
node_modules/asynckit: — → 0.4.0
node_modules/cloudflare: — → 5.2.0
node_modules/cloudflare/node_modules/@types/node: — → 18.19.130
node_modules/cloudflare/node_modules/undici-types: — → 5.26.5
node_modules/combined-stream: — → 1.0.8
node_modules/delayed-stream: — → 1.0.0
node_modules/devtools-protocol: — → 0.0.1182435
node_modules/es-set-tostringtag: — → 2.1.0
node_modules/form-data: — → 4.0.6
node_modules/form-data-encoder: — → 1.7.2
node_modules/formdata-node: — → 4.4.1
node_modules/humanize-ms: — → 1.2.1
node_modules/node-domexception: — → 1.0.0
node_modules/node-fetch: — → 2.7.0
node_modules/tr46: — → 0.0.3
node_modules/web-streams-polyfill: — → 4.0.0-beta.3
node_modules/webidl-conversions: — → 3.0.1
node_modules/whatwg-url: — → 5.0.0
node_modules/wrangler/node_modules/undici: — → 7.30.2
```

### Degrau 2 — `npm test`

```

> haroldo-page@0.1.0 test
> vitest run


 RUN  v4.1.11 S:/Projetos/academic_page/haroldo


 Test Files  27 passed (27)
      Tests  529 passed (529)
   Start at  12:46:53
   Duration  2.34s (transform 8.47s, setup 0ms, import 15.45s, tests 620ms, environment 6ms)

EXIT=0
```

### Degrau 2 — `npm run build:pipeline`

```

> haroldo-page@0.1.0 build:pipeline
> vitest run tests/content && tinacms build --skip-cloud-checks && astro check && astro build


 RUN  v4.1.11 S:/Projetos/academic_page/haroldo


 Test Files  7 passed (7)
      Tests  166 passed (166)
   Start at  12:46:58
   Duration  1.66s (transform 2.84s, setup 0ms, import 4.81s, tests 183ms, environment 1ms)

Starting Tina build
│
○  Tina build complete ───────────────────────────────────────────────────────────────────────────────────────────╮
│                                                                                                                 │
│  🦙 Tina Config                                                                                                 │
│     API url:            https://content.tinajs.io/2.4/content/8be98053-68c3-4262-b7bd-dd1286e1c7ad/github/main  │
│                                                                                                                 │
│  🤖 Auto-generated files                                                                                        │
│     GraphQL Client:     tina/__generated__/client.ts                                                            │
│     Typescript Types:   tina/__generated__/types.ts                                                             │
│     Static HTML file:   public/admin/index.html                                                                 │
│                                                                                                                 │
│                                                                                                                 │
├─────────────────────────────────────────────────────────────────────────────────────────────────────────────────╯
[2m12:47:45[22m [34m[content][39m Syncing content
[2m12:47:45[22m [34m[content][39m Synced content
[2m12:47:45[22m [34m[types][39m Generated [2m941ms[22m
[2m12:47:45[22m [34m[check][39m Getting diagnostics for Astro files in S:\Projetos\academic_page\haroldo...
Result (116 files): 
- 0 errors
- 0 warnings
- 0 hints

[2m12:47:58[22m [34m[content][39m Syncing content
[2m12:47:58[22m [34m[content][39m Synced content
[2m12:47:58[22m [34m[types][39m Generated [2m596ms[22m
[2m12:47:58[22m [34m[build][39m output: [34m"static"[39m
[2m12:47:58[22m [34m[build][39m mode: [34m"static"[39m
[2m12:47:58[22m [34m[build][39m directory: [34mS:\Projetos\academic_page\haroldo\dist\[39m
[2m12:47:58[22m [34m[build][39m Collecting build info...
[2m12:47:58[22m [34m[build][39m [32m✓ Completed in 645ms.[39m
[2m12:47:58[22m [34m[build][39m Building static entrypoints...
[33m[1m12:47:59[22m [WARN] [vite][39m [33m[lightningcss minify] 'global' is not recognized as a valid pseudo-class. Did you mean '::global' (pseudo-element) or is this a typo?
25 |  }
26 |  
27 |  .carrossel[data-astro-cid-bkddzv6o]:not(:global(.pronto)) .miniatura[data-astro-cid-bkddzv6o] {
   |                                                  ^
28 |    opacity: 1;
29 |  }[39m
[2m12:47:59[22m [34m[vite][39m [32m✓ built in 678ms[39m
[2m12:47:59[22m [34m[vite][39m [32m✓ built in 119ms[39m
[2m12:47:59[22m [34m[build][39m Rearranging server assets...

[42m[30m generating static routes [39m[49m
[2m12:47:59[22m   [34m├─[39m [2m/404.html[22m [2m(+16ms)[22m 
[2m12:47:59[22m   [34m├─[39m [2m/en/404/index.html[22m [2m(+5ms)[22m 
[2m12:47:59[22m   [34m├─[39m [2m/en/about/index.html[22m [2m(+7ms)[22m 
[2m12:47:59[22m   [34m├─[39m [2m/en/outreach/ifma-pedreiras/index.html[22m [2m(+4ms)[22m 
[2m12:47:59[22m   [34m├─[39m [2m/en/outreach/ufma-bacabal/index.html[22m [2m(+2ms)[22m 
[2m12:47:59[22m   [34m├─[39m [2m/en/outreach/index.html[22m [2m(+5ms)[22m 
[2m12:47:59[22m   [34m├─[39m [2m/en/publications/index.html[22m [2m(+8ms)[22m 
[2m12:47:59[22m   [34m├─[39m [2m/en/research/index.html[22m [2m(+6ms)[22m 
[2m12:47:59[22m   [34m├─[39m [2m/en/teaching/fisica-moderna/index.html[22m [2m(+159ms)[22m 
[2m12:47:59[22m   [34m├─[39m [2m/en/teaching/mecanica-classica/index.html[22m [2m(+4ms)[22m 
[2m12:47:59[22m   [34m├─[39m [2m/en/teaching/index.html[22m [2m(+6ms)[22m 
[2m12:47:59[22m   [34m├─[39m [2m/en/index.html[22m [2m(+4ms)[22m 
[2m12:47:59[22m   [34m├─[39m [2m/ensino/fisica-moderna/index.html[22m [2m(+18ms)[22m 
[2m12:47:59[22m   [34m├─[39m [2m/ensino/mecanica-classica/index.html[22m [2m(+3ms)[22m 
[2m12:47:59[22m   [34m├─[39m [2m/ensino/index.html[22m [2m(+3ms)[22m 
[2m12:47:59[22m   [34m├─[39m [2m/extensao/ifma-pedreiras/index.html[22m [2m(+4ms)[22m 
[2m12:47:59[22m   [34m├─[39m [2m/extensao/ufma-bacabal/index.html[22m [2m(+1ms)[22m 
[2m12:47:59[22m   [34m├─[39m [2m/extensao/index.html[22m [2m(+4ms)[22m 
[2m12:47:59[22m   [34m├─[39m [2m/pesquisa/index.html[22m [2m(+3ms)[22m 
[2m12:47:59[22m   [34m├─[39m [2m/publicacoes/index.html[22m [2m(+4ms)[22m 
[2m12:47:59[22m   [34m├─[39m [2m/sobre/index.html[22m [2m(+3ms)[22m 
[2m12:47:59[22m   [34m├─[39m [2m/index.html[22m [2m(+2ms)[22m 
[2m12:47:59[22m [32m✓ Completed in 325ms.
[39m
[2m12:47:59[22m [34m[build][39m [32m✓ Completed in 1.21s.[39m
[2m12:48:00[22m [34m[@astrojs/sitemap][39m `sitemap-index.xml` created at `dist`
[2m12:48:00[22m [34m[build][39m 22 page(s) built in [1m1.91s[22m
[2m12:48:00[22m [34m[build][39m [1mComplete![22m
EXIT=0
```

### Degrau 2 — `npm run test:dist`

```

> haroldo-page@0.1.0 test:dist
> vitest run -c vitest.dist.config.ts


 RUN  v4.1.11 S:/Projetos/academic_page/haroldo


 Test Files  2 passed (2)
      Tests  59 passed (59)
   Start at  12:48:07
   Duration  780ms (transform 180ms, setup 0ms, import 381ms, tests 547ms, environment 0ms)

EXIT=0
```

### Degrau 2 — `npx wrangler --version`

```
4.166.0
EXIT=0
```

### Degrau 2 — diff final do `package.json`, `npm ls zod` e SHA

```
SHA=9685036a699e283d9cafaa90f4a5b1458afb181c
diff --git a/package.json b/package.json
index e126d3f..6026afd 100644
--- a/package.json
+++ b/package.json
@@ -29,7 +29,7 @@
     "astro": "7.2.10",
     "gsap": "3.15.0",
     "tailwindcss": "4.3.3",
-    "tinacms": "3.12.1"
+    "tinacms": "3.15.2"
   },
   "devDependencies": {
     "@astrojs/check": "0.9.10",
@@ -47,8 +47,8 @@
     "prettier-plugin-tailwindcss": "0.8.1",
     "typescript": "5.9.3",
     "typescript-eslint": "8.69.0",
-    "vite": "8.2.2",
+    "vite": "8.3.8",
     "vitest": "4.1.11",
-    "wrangler": "4.145.0"
+    "wrangler": "4.166.0"
   }
 }
haroldo-page@0.1.0 S:\Projetos\academic_page\haroldo
+-- @astrojs/sitemap@3.7.4
| `-- zod@4.6.7
+-- @tinacms/cli@2.6.1
| +-- @tinacms/app@2.6.0
| | `-- zod@3.25.76
| +-- @tinacms/schema-tools@2.11.0
| | `-- zod@3.25.76
| `-- zod@3.25.76
+-- astro@7.2.10
| `-- zod@4.6.7 deduped
`-- tinacms@3.15.2
  `-- zod@3.25.76

EXIT=0
```

### Degrau 2 — portão de auditoria (informativo, depois do degrau 2)

```
npm audit: {"info":0,"low":3,"moderate":20,"high":19,"critical":0,"total":42}
exceção aceita (desde 2026-10-07, ADR-0010): GHSA-7mx3-vvmw-hjmv @graphql-tools/utils — só via @tinacms/cli; a única correção do npm é o downgrade para @tinacms/cli@0.56.5
AVISO: a exceção GHSA-vfj7-8cjw-p6xm (braces) não aparece mais; retire-a daqui e do ADR-0010.
AVISO: a exceção GHSA-wq5f-xc86-pv6w (sharp) não aparece mais; retire-a daqui e do ADR-0010.
REPROVADO: high GHSA-c4qx-w738-7hr3 @graphql-tools/utils — GraphQL Tools: Prototype pollution in mergeIncrementalResult via non-primitive path segments
REPROVADO: high GHSA-pwhx-cvv3-qj5c @tinacms/cli — Tina: Code injection via unescaped Git branch name in generated client source
REPROVADO: high GHSA-587h-7wmj-h5pm vite — launch-editor: `fs.existsSync()` existence check can be bypassed on Windows
REPROVADO: high GHSA-mrhx-c7xc-m3w5 zod — Zod can exhaust memory while validating oversized constrained collections
Atualize a dependência ou registre exceção datada no ADR-0010 (nunca baixe o nível).
EXIT=1
```

### Degrau 2 — o que resta de `vite` e `zod` no `npm audit`

```
vite {"range":"<=6.4.3","nodes":["node_modules/@tinacms/cli/node_modules/vite"],"fix":true,"via":[1242622,1242651,1242658,1242724,1242730]}
zod {"range":"<4.6.6","nodes":["node_modules/@tinacms/app/node_modules/zod","node_modules/@tinacms/cli/node_modules/zod","node_modules/@tinacms/schema-tools/node_modules/zod","node_modules/tinacms/node_modules/zod"],"fix":{"name":"@tinacms/cli","version":"4.0.5","isSemVerMajor":true},"via":[1243066]}
```


## O2 depois do degrau 2 (orquestrador)

Passos feitos pelo orquestrador no Edge, em 2026-11-22, e não pelo executor. Os blocos abaixo são os `.txt` literais; o primeiro é o resumo e o mapa dos demais. O checkbox do O2 fica vazio: só fecha depois do O2 do degrau 3.

### O2 — `o2-resumo.txt`

```
O2 depois do degrau 2 — orquestrador, Edge, 2026-11-22 (branch atualiza-dependencias em 9685036: tinacms 3.15.2, @tinacms/cli 2.6.1)
Servidores: npx tinacms dev + npx astro dev --background --force; http://localhost:4321/admin. Rascunhos de teste criados à mão
(content/{disciplinas,extensao,projetos,publicacoes}/teste-087.md, publicado: false) e apagados no fim; git status final só com o plano.
Linha de base no main: worktree em 71e1c24 (tinacms 3.12.1), arquivo o2-base-main.txt.

1. Seis coleções listam: perfil 1, linhas_pesquisa 2, projetos 2, disciplinas 3 (2 + teste-087), publicacoes 23, extensao 3 — iguais ao main (disciplinas +1 pelo rascunho).
2. Save no disco: Semestre "T087" na disciplina de teste → "Document updated!", arquivo ganhou `semestre: T087`, mtime novo (o2-item2-antes.txt / o2-item2-depois.txt).
3. Alertas do beforeSubmit, arquivo intacto (md5 e mtime iguais):
   a. Aula Número 1, Título " " (só espaço; 0 "Required", Save habilitado) → "Não salvo: Aulas, item 1: falta Título." (o2-item3a-*.txt)
   b. Aula com Link "AAAA" → "Não salvo: Aulas, item 1: o link "AAAA" não é um endereço — comece com https://." (o2-item3b-depois.txt)
   c. Extensão, foto só com descrição, Save pelo formulário da postagem → "Não salvo: cada foto precisa de uma imagem e de uma descrição." (o2-item3c.txt)
      Dentro do subpainel da foto o próprio Tina já desabilita o Save (1 "Required"), então o hook só é exercido pelo formulário-pai.
4. Media Manager (#/screens/media_manager) lista .gitkeep e os 6 arquivos de public/uploads.
5. Avisos de docs/avisos-do-painel-para-o-manual.md, em 3.15.2:
   - Aviso 1: MUDOU no caminho testado. Nome "Teste 087"→"Teste 087 B", abrir "Versão em inglês (opcional)", voltar pelo breadcrumb, Save no pai:
     3.15.2 gravou `nome: Teste 087 B` (o2-aviso-disciplinas-depois.txt). No 3.12.1, mesmo caminho, a edição reverteu na tela e o Save
     desabilitou ao voltar (o2-aviso1-main.txt). Só este caminho foi testado (não o do plano 020, com interruptor "Publicado").
   - Aviso 2: CONTINUA. "+" em publicacoes.autores[] deixando o item vazio: 0 "Required", Save habilitado, arquivo gravou `- ''` (o2-aviso-publicacoes-depois.txt).
   - Aviso 3: CONTINUA. Projeto sem linha_relacionada, só a descrição editada → arquivo ganhou `linha_relacionada: ''` (o2-aviso-projetos-depois.txt).
     Também apareceu em publicacoes (`linha_relacionada: ''` no save do Aviso 2), coleção que o Aviso 3 não lista.
Console: read_console_messages com rastreio desde a carga, percurso das 6 coleções + edição de disciplina e publicação:
   main: 0 erros, 2 avisos React Router 6 (future flags). Branch: 0 erros, 0 avisos.
```

### O2 — `o2-base-main.txt`

```
O2 linha de base — painel local do main (worktree em 71e1c24, tinacms 3.12.1), Edge, 2026-11-22
Listagem (javascript_tool, linhas por coleção em #/collections/<c>/~):
{"perfil":{"n":1,"primeiro":"index"},"linhas_pesquisa":{"n":2},"projetos":{"n":2},"disciplinas":{"n":2,"primeiro":"Fisica-Moderna"},"publicacoes":{"n":23},"extensao":{"n":3}}
Console depois de recarregar e percorrer as 6 coleções + editar disciplinas/Fisica-Moderna + uma publicação:
- read_console_messages onlyErrors: "No console errors or exceptions found for this tab."
- avisos: 2 tipos (cada um 2x), React Router Future Flag Warning v7_startTransition e v7_relativeSplatPath (react-router 6).
```

### O2 — `o2-item2-antes.txt`

```
== antes do save (item 2)
2026-11-22 12:59:41
2026-11-22 12:58:09.383363800 -0300 58
---
publicado: false
nome: Teste 087
status: anterior
---
```

### O2 — `o2-item2-depois.txt`

```
== depois do save (item 2): Semestre=T087, toast 'Document updated!'
2026-11-22 13:00:05
2026-11-22 12:59:54.645571800 -0300 74
---
publicado: false
nome: Teste 087
semestre: T087
status: anterior
---
```

### O2 — `o2-item3a-antes.txt`

```
== antes do save (item 3a: aula numero 1, titulo ' ')
2026-11-22 13:01:04
2026-11-22 12:59:54.645571800 -0300 74
0e67cf772cb72565a14de1d9d8c03c69 *content/disciplinas/teste-087.md
```

### O2 — `o2-item3a-depois.txt`

```
== depois do save (item 3a). Alerta capturado por MutationObserver: ["133602 Error\n\nNão salvo: Aulas, item 1: falta Título.\n\nClose"]
2026-11-22 13:01:14
2026-11-22 12:59:54.645571800 -0300 74
0e67cf772cb72565a14de1d9d8c03c69 *content/disciplinas/teste-087.md
```

### O2 — `o2-item3b-depois.txt`

```
== depois do save (item 3b: aula 1 'Aula teste', url 'AAAA')
2026-11-22 13:01:44
2026-11-22 12:59:54.645571800 -0300 74
0e67cf772cb72565a14de1d9d8c03c69 *content/disciplinas/teste-087.md
Alerta capturado (MutationObserver): ["168687 Error\n\nNão salvo: Aulas, item 1: o link \"AAAA\" não é um endereço — comece com https://.\n\nClose"]
```

### O2 — `o2-item3c.txt`

```
== antes do save (item 3c: extensao teste-087, foto com alt 'Foto sem imagem' e sem imagem; save pelo formulario da postagem)
2026-11-22 13:02:51
2026-11-22 13:01:57.352420200 -0300 123
b3b6948ca50169adf828864229b20227 *content/extensao/teste-087.md
Alerta capturado (MutationObserver): ["240690 Error\n\nNão salvo: cada foto precisa de uma imagem e de uma descrição.\n\nClose"]
== depois do save (item 3c)
2026-11-22 13:03:02
2026-11-22 13:01:57.352420200 -0300 123
b3b6948ca50169adf828864229b20227 *content/extensao/teste-087.md
```

### O2 — `o2-aviso-disciplinas-antes.txt`

```
== antes (aviso, disciplinas/teste-087.md)
2026-11-22 13:03:37
2026-11-22 12:59:54.645571800 -0300 74
---
publicado: false
nome: Teste 087
semestre: T087
status: anterior
---
```

### O2 — `o2-aviso-disciplinas-depois.txt`

```
== depois (Aviso 1): Nome 'Teste 087' -> 'Teste 087 B'; abri 'Versão em inglês (opcional)' (indicador verde, Save desabilitado no subpainel); voltei pelo breadcrumb (tela: nome='Teste 087 B', Save habilitado); Save no formulário-pai
2026-11-22 13:05:35
2026-11-22 13:05:32.272361500 -0300 76
---
publicado: false
nome: Teste 087 B
semestre: T087
status: anterior
---

MutationObserver: ["399982 Document updated!"]; nome na tela depois do save: "Teste 087 B"
```

### O2 — `o2-aviso1-main.txt`

```
== Aviso 1 no main (worktree 71e1c24, tinacms 3.12.1), mesmo caminho
Nome 'Teste 087' -> 'Teste 087 B' (DOM: "Teste 087 B"); abri 'Versão em inglês (opcional)': Save continuou habilitado (saveDisabled:false)
voltei pelo breadcrumb 'teste-087': DOM {"nome":"Teste 087","saveDisabled":true} — a edição reverteu na tela, Save desabilitado (manifestação do plano 021)
2026-11-22 13:07:28
2026-11-22 13:06:10.090178100 -0300 73
---
publicado: false
nome: Teste 087
semestre: T087
status: anterior
---
```

### O2 — `o2-aviso-publicacoes-antes.txt`

```
== antes (aviso, publicacoes/teste-087.md)
2026-11-22 13:03:37
2026-11-22 13:03:37.056888300 -0300 93
---
publicado: false
titulo: Teste 087
autores:
  - 'Autor Teste'
ano: 2026
tipo: artigo
---
```

### O2 — `o2-aviso-publicacoes-depois.txt`

```
== depois (Aviso 2): '+' em Autores deixando o item 2 vazio (autores.1 = "", 0 'Required', Save habilitado), Save
2026-11-22 13:04:42
2026-11-22 13:04:39.066781600 -0300 121
---
publicado: false
titulo: Teste 087
autores:
  - Autor Teste
  - ''
ano: 2026
tipo: artigo
linha_relacionada: ''
---

MutationObserver: ["346780 Document updated!"]
```

### O2 — `o2-aviso-projetos-antes.txt`

```
== antes (aviso, projetos/teste-087.md)
2026-11-22 13:03:37
2026-11-22 13:03:37.056888300 -0300 113
---
publicado: false
titulo: Teste 087
periodo:
  inicio: '2026.2'
descricao: Projeto de teste do plano 087.
---
```

### O2 — `o2-aviso-projetos-depois.txt`

```
== depois (Aviso 3): só a descricao editada (+ " Editado."), Save; MutationObserver: ["308240 Document updated!"]
2026-11-22 13:04:03
2026-11-22 13:04:00.534291000 -0300 145
---
publicado: false
titulo: Teste 087
periodo:
  inicio: '2026.2'
descricao: Projeto de teste do plano 087. Editado.
linha_relacionada: ''
---
```


## Evidência — degrau 3 (executor, 2026-11-22)

Commit do degrau 3: `f7ec0c6`. Não rodei: degrau 4, O2 do degrau 3, `lint`, `format:check`, `test:coverage`, `npm ci` em árvore limpa, fallback. O `tina-lock.json` foi mudado só pelo `tinacms build`.

### Degrau 3 — `@tinacms/cli` 4.0.5: `npm install`, `npm ls` e `diff-lock.mjs`

```

added 10 packages, removed 9 packages, changed 14 packages, and audited 1553 packages in 19s

333 packages are looking for funding
  run `npm fund` for details

36 vulnerabilities (3 low, 20 moderate, 13 high)

To address issues that do not require attention, run:
  npm audit fix

To address all issues (including breaking changes), run:
  npm audit fix --force

Run `npm audit` for details.
EXIT=0
--- npm ls
haroldo-page@0.1.0 S:\Projetos\academic_page\haroldo
+-- @tinacms/cli@4.0.5
| +-- @graphql-codegen/core@6.2.0
| | +-- @graphql-tools/schema@10.1.5
| | | +-- @graphql-tools/merge@9.2.8
| | | | `-- @graphql-tools/utils@12.1.0
| | | `-- @graphql-tools/utils@12.1.0
| | `-- @graphql-tools/utils@11.2.2
| +-- @graphql-codegen/plugin-helpers@7.3.0
| | `-- @graphql-tools/utils@11.2.2 deduped
| +-- @graphql-codegen/typescript-operations@6.1.6
| | `-- @graphql-codegen/schema-ast@6.1.0
| |   `-- @graphql-tools/utils@11.2.2 deduped
| +-- @graphql-codegen/visitor-plugin-common@7.2.5
| | +-- @graphql-tools/relay-operation-optimizer@7.1.9
| | | `-- @graphql-tools/utils@12.0.0
| | `-- @graphql-tools/utils@11.2.2 deduped
| +-- @graphql-tools/graphql-file-loader@8.1.24
| | +-- @graphql-tools/import@7.2.4
| | | `-- @graphql-tools/utils@12.1.0
| | `-- @graphql-tools/utils@12.1.0
| +-- @graphql-tools/load@8.1.21
| | `-- @graphql-tools/utils@12.1.0
| +-- @tinacms/app@2.6.0
| | `-- tinacms@3.15.2 deduped
| +-- @tinacms/graphql@4.1.0
| | `-- @tinacms/schema-tools@2.11.0 deduped
| +-- @tinacms/schema-tools@2.11.0
| +-- @tinacms/search@1.2.26
| | +-- @tinacms/graphql@4.1.0 deduped
| | `-- @tinacms/schema-tools@2.11.0 deduped
| `-- tinacms@3.15.2 deduped
`-- tinacms@3.15.2
  +-- @tinacms/mdx@2.4.2
  | `-- @tinacms/schema-tools@2.11.0 deduped
  `-- @tinacms/schema-tools@2.11.0 deduped

EXIT_LS=0
--- diff-lock
node_modules/@graphql-tools/graphql-file-loader: 7.5.17 → 8.1.24
node_modules/@graphql-tools/graphql-file-loader/node_modules/@graphql-tools/utils: 9.2.1 → 12.1.0
node_modules/@graphql-tools/import: 6.7.18 → 7.2.4
node_modules/@graphql-tools/import/node_modules/@graphql-tools/utils: 9.2.1 → 12.1.0
node_modules/@graphql-tools/load: 7.8.14 → 8.1.21
node_modules/@graphql-tools/load/node_modules/@graphql-tools/merge: 8.4.2 → —
node_modules/@graphql-tools/load/node_modules/@graphql-tools/schema: 9.0.19 → —
node_modules/@graphql-tools/load/node_modules/@graphql-tools/utils: 9.2.1 → 12.1.0
node_modules/@graphql-tools/merge: 9.2.3 → 9.2.8
node_modules/@graphql-tools/merge/node_modules/@graphql-tools/utils: 12.0.0 → 12.1.0
node_modules/@graphql-tools/schema: 10.1.0 → 10.1.5
node_modules/@graphql-tools/schema/node_modules/@graphql-tools/utils: 12.0.0 → 12.1.0
node_modules/@tinacms/cli: 2.6.1 → 4.0.5
node_modules/@tinacms/cli/node_modules/@esbuild/aix-ppc64: 0.25.12 → —
node_modules/@tinacms/cli/node_modules/@esbuild/android-arm: 0.25.12 → —
node_modules/@tinacms/cli/node_modules/@esbuild/android-arm64: 0.25.12 → —
node_modules/@tinacms/cli/node_modules/@esbuild/android-x64: 0.25.12 → —
node_modules/@tinacms/cli/node_modules/@esbuild/darwin-arm64: 0.25.12 → —
node_modules/@tinacms/cli/node_modules/@esbuild/darwin-x64: 0.25.12 → —
node_modules/@tinacms/cli/node_modules/@esbuild/freebsd-arm64: 0.25.12 → —
node_modules/@tinacms/cli/node_modules/@esbuild/freebsd-x64: 0.25.12 → —
node_modules/@tinacms/cli/node_modules/@esbuild/linux-arm: 0.25.12 → —
node_modules/@tinacms/cli/node_modules/@esbuild/linux-arm64: 0.25.12 → —
node_modules/@tinacms/cli/node_modules/@esbuild/linux-ia32: 0.25.12 → —
node_modules/@tinacms/cli/node_modules/@esbuild/linux-loong64: 0.25.12 → —
node_modules/@tinacms/cli/node_modules/@esbuild/linux-mips64el: 0.25.12 → —
node_modules/@tinacms/cli/node_modules/@esbuild/linux-ppc64: 0.25.12 → —
node_modules/@tinacms/cli/node_modules/@esbuild/linux-riscv64: 0.25.12 → —
node_modules/@tinacms/cli/node_modules/@esbuild/linux-s390x: 0.25.12 → —
node_modules/@tinacms/cli/node_modules/@esbuild/linux-x64: 0.25.12 → —
node_modules/@tinacms/cli/node_modules/@esbuild/netbsd-arm64: 0.25.12 → —
node_modules/@tinacms/cli/node_modules/@esbuild/netbsd-x64: 0.25.12 → —
node_modules/@tinacms/cli/node_modules/@esbuild/openbsd-arm64: 0.25.12 → —
node_modules/@tinacms/cli/node_modules/@esbuild/openbsd-x64: 0.25.12 → —
node_modules/@tinacms/cli/node_modules/@esbuild/openharmony-arm64: 0.25.12 → —
node_modules/@tinacms/cli/node_modules/@esbuild/sunos-x64: 0.25.12 → —
node_modules/@tinacms/cli/node_modules/@esbuild/win32-arm64: 0.25.12 → —
node_modules/@tinacms/cli/node_modules/@esbuild/win32-ia32: 0.25.12 → —
node_modules/@tinacms/cli/node_modules/@esbuild/win32-x64: 0.25.12 → —
node_modules/@tinacms/cli/node_modules/prettier: 2.8.8 → —
node_modules/@tinacms/cli/node_modules/vite: 6.4.3 → 7.3.8
node_modules/@tinacms/cli/node_modules/vite/node_modules/esbuild: 0.25.12 → —
node_modules/@tinacms/graphql: 2.4.10 → 4.1.0
node_modules/@tinacms/metrics: 2.1.2 → 2.1.4
node_modules/@tinacms/search/node_modules/@tinacms/graphql: 4.1.0 → —
node_modules/@tinacms/search/node_modules/argparse: 1.0.10 → —
node_modules/@tinacms/search/node_modules/js-yaml: 3.15.2 → —
node_modules/value-or-promise: 1.0.12 → —
node_modules/@graphql-tools/graphql-file-loader/node_modules/@whatwg-node/promise-helpers: — → 2.0.2
node_modules/@graphql-tools/graphql-file-loader/node_modules/tslib: — → 2.9.1
node_modules/@graphql-tools/import/node_modules/@whatwg-node/promise-helpers: — → 2.0.2
node_modules/@graphql-tools/import/node_modules/tslib: — → 2.9.1
node_modules/@graphql-tools/load/node_modules/@whatwg-node/promise-helpers: — → 2.0.2
node_modules/@graphql-tools/load/node_modules/tslib: — → 2.9.1
node_modules/@graphql-tools/merge/node_modules/@whatwg-node/promise-helpers: — → 2.0.2
node_modules/@graphql-tools/merge/node_modules/tslib: — → 2.9.1
node_modules/@graphql-tools/schema/node_modules/@whatwg-node/promise-helpers: — → 2.0.2
node_modules/@graphql-tools/schema/node_modules/tslib: — → 2.9.1
```

### Degrau 3 — `npm run build:pipeline` (derivados apagados antes)

```

> haroldo-page@0.1.0 build:pipeline
> vitest run tests/content && tinacms build --skip-cloud-checks && astro check && astro build


 RUN  v4.1.11 S:/Projetos/academic_page/haroldo


 Test Files  7 passed (7)
      Tests  166 passed (166)
   Start at  13:09:23
   Duration  1.59s (transform 2.42s, setup 0ms, import 4.05s, tests 160ms, environment 1ms)

Starting Tina build
│
○  Tina build complete ───────────────────────────────────────────────────────────────────────────────────────────╮
│                                                                                                                 │
│  🦙 Tina Config                                                                                                 │
│     API url:            https://content.tinajs.io/4.1/content/8be98053-68c3-4262-b7bd-dd1286e1c7ad/github/main  │
│                                                                                                                 │
│  🤖 Auto-generated files                                                                                        │
│     GraphQL Client:     tina/__generated__/client.ts                                                            │
│     Typescript Types:   tina/__generated__/types.ts                                                             │
│     Static HTML file:   public/admin/index.html                                                                 │
│                                                                                                                 │
│                                                                                                                 │
├─────────────────────────────────────────────────────────────────────────────────────────────────────────────────╯
[2m13:09:52[22m [34m[vite][39m Re-optimizing dependencies because lockfile has changed
[2m13:09:52[22m [34m[content][39m Syncing content
[2m13:09:52[22m [34m[content][39m Synced content
[2m13:09:52[22m [34m[types][39m Generated [2m679ms[22m
[2m13:09:52[22m [34m[check][39m Getting diagnostics for Astro files in S:\Projetos\academic_page\haroldo...
Result (116 files): 
- 0 errors
- 0 warnings
- 0 hints

[2m13:10:03[22m [34m[content][39m Syncing content
[2m13:10:03[22m [34m[content][39m Synced content
[2m13:10:03[22m [34m[types][39m Generated [2m534ms[22m
[2m13:10:03[22m [34m[build][39m output: [34m"static"[39m
[2m13:10:03[22m [34m[build][39m mode: [34m"static"[39m
[2m13:10:03[22m [34m[build][39m directory: [34mS:\Projetos\academic_page\haroldo\dist\[39m
[2m13:10:03[22m [34m[build][39m Collecting build info...
[2m13:10:03[22m [34m[build][39m [32m✓ Completed in 583ms.[39m
[2m13:10:03[22m [34m[build][39m Building static entrypoints...
[33m[1m13:10:03[22m [WARN] [vite][39m [33m[lightningcss minify] 'global' is not recognized as a valid pseudo-class. Did you mean '::global' (pseudo-element) or is this a typo?
25 |  }
26 |  
27 |  .carrossel[data-astro-cid-bkddzv6o]:not(:global(.pronto)) .miniatura[data-astro-cid-bkddzv6o] {
   |                                                  ^
28 |    opacity: 1;
29 |  }[39m
[2m13:10:03[22m [34m[vite][39m [32m✓ built in 513ms[39m
[2m13:10:03[22m [34m[vite][39m [32m✓ built in 111ms[39m
[2m13:10:03[22m [34m[build][39m Rearranging server assets...

[42m[30m generating static routes [39m[49m
[2m13:10:03[22m   [34m├─[39m [2m/404.html[22m [2m(+12ms)[22m 
[2m13:10:03[22m   [34m├─[39m [2m/en/404/index.html[22m [2m(+4ms)[22m 
[2m13:10:04[22m   [34m├─[39m [2m/en/about/index.html[22m [2m(+8ms)[22m 
[2m13:10:04[22m   [34m├─[39m [2m/en/outreach/ifma-pedreiras/index.html[22m [2m(+3ms)[22m 
[2m13:10:04[22m   [34m├─[39m [2m/en/outreach/ufma-bacabal/index.html[22m [2m(+2ms)[22m 
[2m13:10:04[22m   [34m├─[39m [2m/en/outreach/index.html[22m [2m(+5ms)[22m 
[2m13:10:04[22m   [34m├─[39m [2m/en/publications/index.html[22m [2m(+7ms)[22m 
[2m13:10:04[22m   [34m├─[39m [2m/en/research/index.html[22m [2m(+6ms)[22m 
[2m13:10:04[22m   [34m├─[39m [2m/en/teaching/fisica-moderna/index.html[22m [2m(+87ms)[22m 
[2m13:10:04[22m   [34m├─[39m [2m/en/teaching/mecanica-classica/index.html[22m [2m(+3ms)[22m 
[2m13:10:04[22m   [34m├─[39m [2m/en/teaching/index.html[22m [2m(+6ms)[22m 
[2m13:10:04[22m   [34m├─[39m [2m/en/index.html[22m [2m(+7ms)[22m 
[2m13:10:04[22m   [34m├─[39m [2m/ensino/fisica-moderna/index.html[22m [2m(+13ms)[22m 
[2m13:10:04[22m   [34m├─[39m [2m/ensino/mecanica-classica/index.html[22m [2m(+3ms)[22m 
[2m13:10:04[22m   [34m├─[39m [2m/ensino/index.html[22m [2m(+3ms)[22m 
[2m13:10:04[22m   [34m├─[39m [2m/extensao/ifma-pedreiras/index.html[22m [2m(+2ms)[22m 
[2m13:10:04[22m   [34m├─[39m [2m/extensao/ufma-bacabal/index.html[22m [2m(+1ms)[22m 
[2m13:10:04[22m   [34m├─[39m [2m/extensao/index.html[22m [2m(+3ms)[22m 
[2m13:10:04[22m   [34m├─[39m [2m/pesquisa/index.html[22m [2m(+3ms)[22m 
[2m13:10:04[22m   [34m├─[39m [2m/publicacoes/index.html[22m [2m(+4ms)[22m 
[2m13:10:04[22m   [34m├─[39m [2m/sobre/index.html[22m [2m(+3ms)[22m 
[2m13:10:04[22m   [34m├─[39m [2m/index.html[22m [2m(+2ms)[22m 
[2m13:10:04[22m [32m✓ Completed in 232ms.
[39m
[2m13:10:04[22m [34m[build][39m [32m✓ Completed in 935ms.[39m
[2m13:10:04[22m [34m[@astrojs/sitemap][39m `sitemap-index.xml` created at `dist`
[2m13:10:04[22m [34m[build][39m 22 page(s) built in [1m1.59s[22m
[2m13:10:04[22m [34m[build][39m [1mComplete![22m
EXIT=0
```

### Degrau 3 — `tina/tina-lock.json` depois do build (resumo; o diff é de uma linha de 144 KB)

```
 M tina/tina-lock.json
--- diff --stat
 tina/tina-lock.json | 2 +-
 1 file changed, 1 insertion(+), 1 deletion(-)
--- resumo (resumo-tinalock.mjs antes depois)
antes bytes=144483 chaves=schema,lookup,graphql version=undefined RichText=0 "JSON"=0
depois bytes=144667 chaves=schema,lookup,graphql version=undefined RichText=1 "JSON"=0
EXIT=0
--- resumo2.mjs antes depois
schema igual=false
lookup igual=true
graphql igual=false
graphql RichText contexto: ,"directives":[]},{"kind":"ScalarTypeDefinition","name":{"kind":"Name","value":"RichText"},"description":{"kind":"StringValue","value":"A rich-text document, renderable by TinaMarkdown"},"directives":
schema.version? { fullVersion: '2.4.10', major: '2', minor: '4', patch: '10' } { fullVersion: '4.1.0', major: '4', minor: '1', patch: '0' }
EXIT=0
```

### Degrau 3 — `npx tinacms dev` (saída limitada a 200000 bytes)

```
🦙 TinaCMS Dev Server is initializing...
[2K[1GIndexing local files ⠋[2K[1GIndexing local files ⠙
│
○  ✅ 🦙 TinaCMS Dev Server is active: ─────────────────────────────────────╮
│                                                                          │
│  🦙 TinaCMS URLs                                                         │
│     CMS:                <your-dev-server-url>/admin/index.html           │
│     API playground:     <your-dev-server-url>/admin/index.html#/graphql  │
│     API url:            http://localhost:4001/graphql                    │
│                                                                          │
│  🤖 Auto-generated files                                                 │
│     GraphQL Client:     tina/__generated__/client.ts                     │
│     Typescript Types:   tina/__generated__/types.ts                      │
│                                                                          │
│                                                                          │
├──────────────────────────────────────────────────────────────────────────╯
```

### Degrau 3 — lock depois do `tinacms dev`

```
 tina/tina-lock.json | 2 +-
 1 file changed, 1 insertion(+), 1 deletion(-)
lock identico ao pos-build
 M package-lock.json
 M package.json
 M plans/fase-5-polimento-e-entrega/087-dependencias-para-o-portao-de-audit.md
 M tina/tina-lock.json
```

### Degrau 3 — `npm test`

```

> haroldo-page@0.1.0 test
> vitest run


 RUN  v4.1.11 S:/Projetos/academic_page/haroldo


 Test Files  27 passed (27)
      Tests  529 passed (529)
   Start at  13:10:46
   Duration  2.07s (transform 7.30s, setup 0ms, import 13.72s, tests 613ms, environment 4ms)

EXIT=0
```

### Degrau 3 — `npm run test:dist`

```

> haroldo-page@0.1.0 test:dist
> vitest run -c vitest.dist.config.ts


 RUN  v4.1.11 S:/Projetos/academic_page/haroldo


 Test Files  2 passed (2)
      Tests  59 passed (59)
   Start at  13:10:50
   Duration  660ms (transform 167ms, setup 0ms, import 349ms, tests 428ms, environment 0ms)

EXIT=0
```

### Degrau 3 — portão de auditoria

```
npm audit: {"info":0,"low":3,"moderate":20,"high":13,"critical":0,"total":36}
exceção aceita (desde 2026-10-07, ADR-0010): GHSA-7mx3-vvmw-hjmv @graphql-tools/utils — só via @tinacms/cli; a única correção do npm é o downgrade para @tinacms/cli@0.56.5
AVISO: a exceção GHSA-vfj7-8cjw-p6xm (braces) não aparece mais; retire-a daqui e do ADR-0010.
AVISO: a exceção GHSA-wq5f-xc86-pv6w (sharp) não aparece mais; retire-a daqui e do ADR-0010.
REPROVADO: high GHSA-c4qx-w738-7hr3 @graphql-tools/utils — GraphQL Tools: Prototype pollution in mergeIncrementalResult via non-primitive path segments
REPROVADO: high GHSA-mrhx-c7xc-m3w5 zod — Zod can exhaust memory while validating oversized constrained collections
Atualize a dependência ou registre exceção datada no ADR-0010 (nunca baixe o nível).
EXIT=1
```

### Degrau 3 — `npm ls vite zod @graphql-tools/utils` e `npm audit --json` filtrado

```
--- npm ls vite
haroldo-page@0.1.0 S:\Projetos\academic_page\haroldo
+-- @tailwindcss/vite@4.3.3
| `-- vite@8.3.8 deduped
+-- @tinacms/cli@4.0.5
| +-- @vitejs/plugin-react@4.7.0
| | `-- vite@7.3.8 deduped
| `-- vite@7.3.8
+-- astro@7.2.10
| +-- vite@8.3.8 deduped
| `-- vitefu@1.1.3
|   `-- vite@8.3.8 deduped
+-- vite@8.3.8
`-- vitest@4.1.11
  +-- @vitest/mocker@4.1.11
  | `-- vite@8.3.8 deduped
  `-- vite@8.3.8 deduped

--- npm ls zod
haroldo-page@0.1.0 S:\Projetos\academic_page\haroldo
+-- @astrojs/sitemap@3.7.4
| `-- zod@4.6.7
+-- @tinacms/cli@4.0.5
| +-- @tinacms/app@2.6.0
| | `-- zod@3.25.76
| +-- @tinacms/schema-tools@2.11.0
| | `-- zod@3.25.76
| `-- zod@3.25.76
+-- astro@7.2.10
| `-- zod@4.6.7 deduped
`-- tinacms@3.15.2
  `-- zod@3.25.76

--- npm ls @graphql-tools/utils
haroldo-page@0.1.0 S:\Projetos\academic_page\haroldo
`-- @tinacms/cli@4.0.5
  +-- @graphql-codegen/core@6.2.0
  | +-- @graphql-tools/schema@10.1.5
  | | +-- @graphql-tools/merge@9.2.8
  | | | `-- @graphql-tools/utils@12.1.0
  | | `-- @graphql-tools/utils@12.1.0
  | `-- @graphql-tools/utils@11.2.2
  +-- @graphql-codegen/plugin-helpers@7.3.0
  | `-- @graphql-tools/utils@11.2.2 deduped
  +-- @graphql-codegen/typescript-operations@6.1.6
  | `-- @graphql-codegen/schema-ast@6.1.0
  |   `-- @graphql-tools/utils@11.2.2 deduped
  +-- @graphql-codegen/visitor-plugin-common@7.2.5
  | +-- @graphql-tools/relay-operation-optimizer@7.1.9
  | | `-- @graphql-tools/utils@12.0.0
  | `-- @graphql-tools/utils@11.2.2 deduped
  +-- @graphql-tools/graphql-file-loader@8.1.24
  | +-- @graphql-tools/import@7.2.4
  | | `-- @graphql-tools/utils@12.1.0
  | `-- @graphql-tools/utils@12.1.0
  `-- @graphql-tools/load@8.1.21
    `-- @graphql-tools/utils@12.1.0

--- npm audit --json filtrado
vite null
zod {"severity":"high","range":"<4.6.6","nodes":["node_modules/@tinacms/app/node_modules/zod","node_modules/@tinacms/cli/node_modules/zod","node_modules/@tinacms/schema-tools/node_modules/zod","node_modules/tinacms/node_modules/zod"],"fixAvailable":{"name":"tinacms","version":"1.2.1","isSemVerMajor":true},"via":["https://github.com/advisories/GHSA-mrhx-c7xc-m3w5"]}
@graphql-tools/utils {"severity":"high","range":"<=12.0.1","nodes":["node_modules/@graphql-tools/relay-operation-optimizer/node_modules/@graphql-tools/utils","node_modules/@graphql-tools/utils"],"fixAvailable":true,"via":["https://github.com/advisories/GHSA-7mx3-vvmw-hjmv","https://github.com/advisories/GHSA-c4qx-w738-7hr3"]}
@tinacms/cli {"severity":"high","range":"<=0.0.0-ffbb4fa-20260624122203 || >=0.60.12","nodes":["node_modules/@tinacms/cli"],"fixAvailable":{"name":"@tinacms/cli","version":"1.0.4","isSemVerMajor":true},"via":["@tailwindcss/typography","@tinacms/app","@tinacms/graphql","@tinacms/schema-tools","@tinacms/search","altair-express-middleware","tinacms","zod"]}
```


## O2 depois do degrau 3 (orquestrador)

Passos feitos pelo orquestrador no Edge, em 2026-11-22, e não pelo executor. Blocos literais dos `.txt`; o primeiro é o resumo e o mapa dos demais. Decisão da PARADA B: o degrau 3 fica.

### O2b — `o2b-resumo.txt`

```
O2 depois do degrau 3 — orquestrador, Edge, 2026-11-22 (branch atualiza-dependencias em f7ec0c6: tinacms 3.15.2, @tinacms/cli 4.0.5)
Servidores: npx tinacms dev + npx astro dev --background --force; o tina/tina-lock.json não mudou com o tinacms dev (git status).
Mesmos rascunhos teste-087 do O2 anterior, recriados à mão (o2b-antes.txt) e apagados no fim; git status final só com o plano.

1. Seis coleções listam: perfil 1, linhas_pesquisa 2, projetos 3, disciplinas 3, publicacoes 24, extensao 4 (= main + 1 rascunho em cada uma das quatro).
   Formulários abrem: disciplinas/Fisica-Moderna (nome "Física Moderna I") e uma publicação (título "4D Einstein-Gauss-Bonnet gravity: ...").
2. Save no disco: Semestre T087 → "Document updated!", arquivo com `semestre: T087`, mtime novo (o2b-item2.txt).
3. Alertas do beforeSubmit, arquivo intacto (md5 e mtime iguais):
   a. Aula Número 1, Título " " (0 "Required", Save habilitado) → "Não salvo: Aulas, item 1: falta Título." (o2b-item3a.txt)
   b. Link "AAAA" → "Não salvo: Aulas, item 1: o link "AAAA" não é um endereço — comece com https://." (o2b-item3b.txt)
   c. Extensão, foto só com descrição, Save pela postagem → "Não salvo: cada foto precisa de uma imagem e de uma descrição." (o2b-item3c.txt)
4. Media Manager lista .gitkeep e os 6 arquivos de public/uploads.
5. Avisos, iguais ao O2 do degrau 2:
   - Aviso 1: não reproduziu no mesmo caminho; gravou `nome: Teste 087 B` (o2b-aviso1.txt).
   - Aviso 2: continua; gravou `- ''` em autores (o2b-aviso2.txt).
   - Aviso 3: continua; projeto ganhou `linha_relacionada: ''` (o2b-aviso3.txt), e a publicação também (o2b-aviso2.txt).
Console: rastreio desde a carga, percurso das 6 coleções + todos os passos acima: 0 erros, 0 avisos.
Decisão do orquestrador na PARADA B: o degrau 3 FICA (sem fallback).
```

### O2b — `o2b-antes.txt`

```
== O2b antes: rascunhos criados
2026-11-22 13:12:19
content/disciplinas/teste-087.md 2026-11-22 13:12:19.303103500 -0300 58
bcafc285635dd8b4fe136e4da81c8ae4 *content/disciplinas/teste-087.md
content/extensao/teste-087.md 2026-11-22 13:12:19.303103500 -0300 123
b3b6948ca50169adf828864229b20227 *content/extensao/teste-087.md
content/projetos/teste-087.md 2026-11-22 13:12:19.303103500 -0300 113
897d413f74bd0444da8ef6f012cd852a *content/projetos/teste-087.md
content/publicacoes/teste-087.md 2026-11-22 13:12:19.303103500 -0300 93
935b08254fca7b761a850b9e34abbd42 *content/publicacoes/teste-087.md
```

### O2b — `o2b-item2.txt`

```
== O2b item 2 depois: Semestre T087, Save; MutationObserver: ["59846 Document updated!"]
2026-11-22 13:13:52
2026-11-22 13:13:49.185007800 -0300 74
---
publicado: false
nome: Teste 087
semestre: T087
status: anterior
---
```

### O2b — `o2b-item3a.txt`

```
== O2b item 3a: aula numero 1, titulo ' ' (DOM: titulo=" ", 0 Required, Save habilitado); Save no subpainel
2026-11-22 13:14:26
2026-11-22 13:13:49.185007800 -0300 74
0e67cf772cb72565a14de1d9d8c03c69 *content/disciplinas/teste-087.md
MutationObserver: ["93577 Error\n\nNão salvo: Aulas, item 1: falta Título.\n\nClose"] (md5 e mtime iguais ao depois do item 2)
```

### O2b — `o2b-item3b.txt`

```
== O2b item 3b: aula 1 'Aula teste', url 'AAAA'; Save no subpainel
2026-11-22 13:14:54
2026-11-22 13:13:49.185007800 -0300 74
0e67cf772cb72565a14de1d9d8c03c69 *content/disciplinas/teste-087.md
MutationObserver: ["121943 Error\n\nNão salvo: Aulas, item 1: o link \"AAAA\" não é um endereço — comece com https://.\n\nClose"] (md5 e mtime iguais)
```

### O2b — `o2b-item3c.txt`

```
== O2b item 3c: extensao teste-087, foto só com alt 'Foto sem imagem', Save pelo formulário da postagem
2026-11-22 13:15:55
2026-11-22 13:12:19.303103500 -0300 123
b3b6948ca50169adf828864229b20227 *content/extensao/teste-087.md
content/extensao/teste-087.md 2026-11-22 13:12:19.303103500 -0300 123
b3b6948ca50169adf828864229b20227 *content/extensao/teste-087.md
MutationObserver: ["182366 Error\n\nNão salvo: cada foto precisa de uma imagem e de uma descrição.\n\nClose"] (md5 e mtime iguais aos de o2b-antes.txt)
```

### O2b — `o2b-aviso1.txt`

```
== O2b Aviso 1: Nome 'Teste 087' -> 'Teste 087 B'; abri 'Versão em inglês (opcional)' (DOM saveDisabled:true); voltei pelo breadcrumb (DOM {"nome":"Teste 087 B","saveDisabled":false}); Save no pai
2026-11-22 13:17:54
2026-11-22 13:17:50.778370100 -0300 76
---
publicado: false
nome: Teste 087 B
semestre: T087
status: anterior
---

MutationObserver: ["301436 Document updated!","301436 Document updated!"] (dois observadores)
```

### O2b — `o2b-aviso2.txt`

```
== O2b Aviso 2: '+' em Autores deixando o item 2 vazio, Save
2026-11-22 13:17:10
2026-11-22 13:17:06.781500000 -0300 121
---
publicado: false
titulo: Teste 087
autores:
  - Autor Teste
  - ''
ano: 2026
tipo: artigo
linha_relacionada: ''
---

DOM antes do Save: {"autores":[["autores.0","Autor Teste"],["autores.1",""]],"required":0,"saveDisabled":false}; MutationObserver: ["257444 Document updated!","257444 Document updated!"] (dois observadores)
```

### O2b — `o2b-aviso3.txt`

```
== O2b Aviso 3: projeto sem linha_relacionada, só a descricao editada (+ ' Editado.'), Save
2026-11-22 13:16:34
2026-11-22 13:16:31.297244300 -0300 145
---
publicado: false
titulo: Teste 087
periodo:
  inicio: '2026.2'
descricao: Projeto de teste do plano 087. Editado.
linha_relacionada: ''
---

MutationObserver: ["221954 Document updated!","221954 Document updated!"] (entrada dupla: dois observadores ativos na mesma janela, um de antes da navegação por hash)
```


## Evidência — degrau 4 (executor, 2026-11-22)

Commits: `npm update` do `@graphql-tools/utils` `48139bc`; docs e exceções do degrau 4 no commit seguinte (ver `git log`). A sequência final é a do `ci.yml`, em árvore limpa depois de `npm ci`. Não rodei: O3 a O6, `astro check` isolado, `wrangler deploy` ou `versions upload`, push.

### Degrau 4 — `npm update @graphql-tools/utils` (commit `48139bc`)

```
--- npm view @graphql-tools/utils@11 version (últimas)
@graphql-tools/utils@11.2.0 '11.2.0'
@graphql-tools/utils@11.2.1 '11.2.1'
@graphql-tools/utils@11.2.2 '11.2.2'
--- npm view @graphql-tools/relay-operation-optimizer@7.1.9 dependencies
{
  tslib: '^2.4.0',
  '@graphql-tools/utils': '^12.0.0',
  '@ardatan/relay-compiler': '^13.0.2'
}
--- npm update

added 2 packages, changed 1 package, and audited 1555 packages in 14s

333 packages are looking for funding
  run `npm fund` for details

36 vulnerabilities (3 low, 20 moderate, 13 high)

To address issues that do not require attention, run:
  npm audit fix

To address all issues (including breaking changes), run:
  npm audit fix --force

Run `npm audit` for details.
EXIT=0
--- diff-lock
node_modules/@graphql-tools/relay-operation-optimizer/node_modules/@graphql-tools/utils: 12.0.0 → 12.1.0
node_modules/@graphql-tools/relay-operation-optimizer/node_modules/@whatwg-node/promise-helpers: — → 2.0.2
node_modules/@graphql-tools/relay-operation-optimizer/node_modules/tslib: — → 2.9.1
--- git diff package.json
0
--- npm ls
haroldo-page@0.1.0 S:\Projetos\academic_page\haroldo
`-- @tinacms/cli@4.0.5
  +-- @graphql-codegen/core@6.2.0
  | +-- @graphql-tools/schema@10.1.5
  | | +-- @graphql-tools/merge@9.2.8
  | | | `-- @graphql-tools/utils@12.1.0
  | | `-- @graphql-tools/utils@12.1.0
  | `-- @graphql-tools/utils@11.2.2
  +-- @graphql-codegen/plugin-helpers@7.3.0
  | `-- @graphql-tools/utils@11.2.2 deduped
  +-- @graphql-codegen/typescript-operations@6.1.6
  | `-- @graphql-codegen/schema-ast@6.1.0
  |   `-- @graphql-tools/utils@11.2.2 deduped
  +-- @graphql-codegen/visitor-plugin-common@7.2.5
  | +-- @graphql-tools/relay-operation-optimizer@7.1.9
  | | `-- @graphql-tools/utils@12.1.0
  | `-- @graphql-tools/utils@11.2.2 deduped
  +-- @graphql-tools/graphql-file-loader@8.1.24
  | +-- @graphql-tools/import@7.2.4
  | | `-- @graphql-tools/utils@12.1.0
  | `-- @graphql-tools/utils@12.1.0
  `-- @graphql-tools/load@8.1.21
    `-- @graphql-tools/utils@12.1.0
```

### Degrau 4 — `npm explain`, `npm ls zod`, `npm audit` high/critical e portão ANTES de editar as exceções

```
--- npm explain @graphql-tools/utils@11.2.2
@graphql-tools/utils@11.2.2 dev
node_modules/@graphql-tools/utils
  @graphql-tools/utils@"^11.2.0" from @graphql-codegen/core@6.2.0
  node_modules/@graphql-codegen/core
    @graphql-codegen/core@"^6.2.0" from @tinacms/cli@4.0.5
    node_modules/@tinacms/cli
      dev @tinacms/cli@"4.0.5" from the root project
  @graphql-tools/utils@"^11.2.0" from @graphql-codegen/plugin-helpers@7.3.0
  node_modules/@graphql-codegen/plugin-helpers
    @graphql-codegen/plugin-helpers@"^7.1.0" from @graphql-codegen/core@6.2.0
    node_modules/@graphql-codegen/core
      @graphql-codegen/core@"^6.2.0" from @tinacms/cli@4.0.5
      node_modules/@tinacms/cli
        dev @tinacms/cli@"4.0.5" from the root project
    @graphql-codegen/plugin-helpers@"^7.1.0" from @graphql-codegen/schema-ast@6.1.0
    node_modules/@graphql-codegen/schema-ast
      @graphql-codegen/schema-ast@"^6.1.0" from @graphql-codegen/typescript@6.1.0
      node_modules/@graphql-codegen/typescript
        @graphql-codegen/typescript@"^6.1.0" from @tinacms/cli@4.0.5
        node_modules/@tinacms/cli
          dev @tinacms/cli@"4.0.5" from the root project
      @graphql-codegen/schema-ast@"^6.1.0" from @graphql-codegen/typescript-operations@6.1.6
      node_modules/@graphql-codegen/typescript-operations
        @graphql-codegen/typescript-operations@"^6.1.0" from @tinacms/cli@4.0.5
        node_modules/@tinacms/cli
          dev @tinacms/cli@"4.0.5" from the root project
    @graphql-codegen/plugin-helpers@"^7.1.0" from @graphql-codegen/typescript@6.1.0
    node_modules/@graphql-codegen/typescript
      @graphql-codegen/typescript@"^6.1.0" from @tinacms/cli@4.0.5
      node_modules/@tinacms/cli
        dev @tinacms/cli@"4.0.5" from the root project
    @graphql-codegen/plugin-helpers@"^7.1.0" from @graphql-codegen/typescript-operations@6.1.6
    node_modules/@graphql-codegen/typescript-operations
      @graphql-codegen/typescript-operations@"^6.1.0" from @tinacms/cli@4.0.5
      node_modules/@tinacms/cli
        dev @tinacms/cli@"4.0.5" from the root project
    @graphql-codegen/plugin-helpers@"^7.1.0" from @graphql-codegen/visitor-plugin-common@7.2.5
    node_modules/@graphql-codegen/visitor-plugin-common
      @graphql-codegen/visitor-plugin-common@"^7.2.0" from @graphql-codegen/typescript@6.1.0
      node_modules/@graphql-codegen/typescript
        @graphql-codegen/typescript@"^6.1.0" from @tinacms/cli@4.0.5
        node_modules/@tinacms/cli
          dev @tinacms/cli@"4.0.5" from the root project
      @graphql-codegen/visitor-plugin-common@"^7.2.5" from @graphql-codegen/typescript-operations@6.1.6
      node_modules/@graphql-codegen/typescript-operations
        @graphql-codegen/typescript-operations@"^6.1.0" from @tinacms/cli@4.0.5
        node_modules/@tinacms/cli
          dev @tinacms/cli@"4.0.5" from the root project
      @graphql-codegen/visitor-plugin-common@"^7.2.0" from @tinacms/cli@4.0.5
      node_modules/@tinacms/cli
        dev @tinacms/cli@"4.0.5" from the root project
    @graphql-codegen/plugin-helpers@"^7.1.0" from @tinacms/cli@4.0.5
    node_modules/@tinacms/cli
      dev @tinacms/cli@"4.0.5" from the root project
  @graphql-tools/utils@"^11.2.0" from @graphql-codegen/schema-ast@6.1.0
  node_modules/@graphql-codegen/schema-ast
    @graphql-codegen/schema-ast@"^6.1.0" from @graphql-codegen/typescript@6.1.0
    node_modules/@graphql-codegen/typescript
      @graphql-codegen/typescript@"^6.1.0" from @tinacms/cli@4.0.5
      node_modules/@tinacms/cli
        dev @tinacms/cli@"4.0.5" from the root project
    @graphql-codegen/schema-ast@"^6.1.0" from @graphql-codegen/typescript-operations@6.1.6
    node_modules/@graphql-codegen/typescript-operations
      @graphql-codegen/typescript-operations@"^6.1.0" from @tinacms/cli@4.0.5
      node_modules/@tinacms/cli
        dev @tinacms/cli@"4.0.5" from the root project
  @graphql-tools/utils@"^11.2.0" from @graphql-codegen/visitor-plugin-common@7.2.5
  node_modules/@graphql-codegen/visitor-plugin-common
    @graphql-codegen/visitor-plugin-common@"^7.2.0" from @graphql-codegen/typescript@6.1.0
    node_modules/@graphql-codegen/typescript
      @graphql-codegen/typescript@"^6.1.0" from @tinacms/cli@4.0.5
      node_modules/@tinacms/cli
        dev @tinacms/cli@"4.0.5" from the root project
    @graphql-codegen/visitor-plugin-common@"^7.2.5" from @graphql-codegen/typescript-operations@6.1.6
    node_modules/@graphql-codegen/typescript-operations
      @graphql-codegen/typescript-operations@"^6.1.0" from @tinacms/cli@4.0.5
      node_modules/@tinacms/cli
        dev @tinacms/cli@"4.0.5" from the root project
    @graphql-codegen/visitor-plugin-common@"^7.2.0" from @tinacms/cli@4.0.5
    node_modules/@tinacms/cli
      dev @tinacms/cli@"4.0.5" from the root project
--- npm ls zod
haroldo-page@0.1.0 S:\Projetos\academic_page\haroldo
+-- @astrojs/sitemap@3.7.4
| `-- zod@4.6.7
+-- @tinacms/cli@4.0.5
| +-- @tinacms/app@2.6.0
| | `-- zod@3.25.76
| +-- @tinacms/schema-tools@2.11.0
| | `-- zod@3.25.76
| `-- zod@3.25.76
+-- astro@7.2.10
| `-- zod@4.6.7 deduped
`-- tinacms@3.15.2
  `-- zod@3.25.76

--- npm audit --json (high/critical)
high @graphql-codegen/core {"range":"1.13.6-alpha-01e83c2c.25 - 1.13.6-alpha-e05b7bda.36 || 1.14.1-alpha-02e7bdc6.12 - 6.2.1","nodes":["node_modules/@graphql-codegen/core"],"fixAvailable":true}
high @graphql-codegen/plugin-helpers {"range":"1.13.6-alpha-01e83c2c.25 - 1.13.6-alpha-e05b7bda.36 || 1.14.1-alpha-02e7bdc6.12 - 7.4.1","nodes":["node_modules/@graphql-codegen/plugin-helpers"],"fixAvailable":true}
high @graphql-codegen/schema-ast {"range":"1.13.6-alpha-01e83c2c.25 - 1.13.6-alpha-e05b7bda.36 || 1.14.1-alpha-02e7bdc6.12 - 6.1.0","nodes":["node_modules/@graphql-codegen/schema-ast"],"fixAvailable":true}
high @graphql-codegen/visitor-plugin-common {"range":"2.1.2-alpha-4c7432d34.0 - 7.2.9-alpha-20261008113150-6f952a000a92677bc734a0094218c0a510ecc3ce || 7.3.0-alpha-20260930101424-b690e1a9bbb7bc65f39b67112cbeca529460e183 - 7.3.0-alpha-20261012105234-33471d80f2bfd12d5b21cec6ef384bdfd57907b1","nodes":["node_modules/@graphql-codegen/visitor-plugin-common"],"fixAvailable":true}
high @graphql-tools/utils {"range":"<=12.0.1","nodes":["node_modules/@graphql-tools/utils"],"fixAvailable":true}
high @tinacms/app {"range":"<=0.0.0-ffbb4fa-20260624122203 || >=1.2.0","nodes":["node_modules/@tinacms/app"],"fixAvailable":{"name":"@tinacms/cli","version":"1.0.4","isSemVerMajor":true}}
high @tinacms/cli {"range":"<=0.0.0-ffbb4fa-20260624122203 || >=0.60.12","nodes":["node_modules/@tinacms/cli"],"fixAvailable":{"name":"@tinacms/cli","version":"1.0.4","isSemVerMajor":true}}
high @tinacms/graphql {"range":">=0.60.8","nodes":["node_modules/@tinacms/graphql"],"fixAvailable":{"name":"@tinacms/cli","version":"1.0.4","isSemVerMajor":true}}
high @tinacms/mdx {"range":"*","nodes":["node_modules/@tinacms/mdx"],"fixAvailable":{"name":"tinacms","version":"1.2.1","isSemVerMajor":true}}
high @tinacms/schema-tools {"range":"<=0.0.0-fff7c61-20260805010007 || >=0.0.3","nodes":["node_modules/@tinacms/schema-tools"],"fixAvailable":{"name":"tinacms","version":"1.2.1","isSemVerMajor":true}}
high @tinacms/search {"range":"*","nodes":["node_modules/@tinacms/search"],"fixAvailable":{"name":"@tinacms/cli","version":"1.0.4","isSemVerMajor":true}}
high tinacms {"range":"<=0.0.0-ffbb4fa-20260624122203 || >=0.67.1","nodes":["node_modules/tinacms"],"fixAvailable":{"name":"tinacms","version":"1.2.1","isSemVerMajor":true}}
high zod {"range":"<4.6.6","nodes":["node_modules/@tinacms/app/node_modules/zod","node_modules/@tinacms/cli/node_modules/zod","node_modules/@tinacms/schema-tools/node_modules/zod","node_modules/tinacms/node_modules/zod"],"fixAvailable":{"name":"@tinacms/cli","version":"1.0.4","isSemVerMajor":true}}
{"info":0,"low":3,"moderate":20,"high":13,"critical":0,"total":36}
--- portão
npm audit: {"info":0,"low":3,"moderate":20,"high":13,"critical":0,"total":36}
exceção aceita (desde 2026-10-07, ADR-0010): GHSA-7mx3-vvmw-hjmv @graphql-tools/utils — só via @tinacms/cli; a única correção do npm é o downgrade para @tinacms/cli@0.56.5
AVISO: a exceção GHSA-vfj7-8cjw-p6xm (braces) não aparece mais; retire-a daqui e do ADR-0010.
AVISO: a exceção GHSA-wq5f-xc86-pv6w (sharp) não aparece mais; retire-a daqui e do ADR-0010.
REPROVADO: high GHSA-c4qx-w738-7hr3 @graphql-tools/utils — GraphQL Tools: Prototype pollution in mergeIncrementalResult via non-primitive path segments
REPROVADO: high GHSA-mrhx-c7xc-m3w5 zod — Zod can exhaust memory while validating oversized constrained collections
Atualize a dependência ou registre exceção datada no ADR-0010 (nunca baixe o nível).
EXIT=1
```

### Degrau 4 — portão com as exceções novas

```
npm audit: {"info":0,"low":3,"moderate":20,"high":13,"critical":0,"total":36}
exceção aceita (desde 2026-10-07, ADR-0010): GHSA-7mx3-vvmw-hjmv @graphql-tools/utils — só a cópia 11.2.2 sob @tinacms/cli@4.0.5; é a última 11.x e os @graphql-codegen/* do CLI pedem ^11.2.0
exceção aceita (desde 2026-11-22, ADR-0010): GHSA-c4qx-w738-7hr3 @graphql-tools/utils — só a cópia 11.2.2 sob @tinacms/cli@4.0.5; é a última 11.x e os @graphql-codegen/* do CLI pedem ^11.2.0
exceção aceita (desde 2026-11-22, ADR-0010): GHSA-mrhx-c7xc-m3w5 zod — só as cópias zod@3.25.76 de tinacms/@tinacms/*; a linha 3 não tem correção (3.25.76 é a última 3.x) e o Tina pede ^3.24.2 até o CLI 4.0.5
aprovado: nenhum aviso high/critical fora das exceções.
EXIT=0
```

### Degrau 4 — canário do portão (exceção do `zod` retirada e devolvida)

```
--- canário: exceção do zod retirada
npm audit: {"info":0,"low":3,"moderate":20,"high":13,"critical":0,"total":36}
exceção aceita (desde 2026-10-07, ADR-0010): GHSA-7mx3-vvmw-hjmv @graphql-tools/utils — só a cópia 11.2.2 sob @tinacms/cli@4.0.5; é a última 11.x e os @graphql-codegen/* do CLI pedem ^11.2.0
exceção aceita (desde 2026-11-22, ADR-0010): GHSA-c4qx-w738-7hr3 @graphql-tools/utils — só a cópia 11.2.2 sob @tinacms/cli@4.0.5; é a última 11.x e os @graphql-codegen/* do CLI pedem ^11.2.0
REPROVADO: high GHSA-mrhx-c7xc-m3w5 zod — Zod can exhaust memory while validating oversized constrained collections
Atualize a dependência ou registre exceção datada no ADR-0010 (nunca baixe o nível).
EXIT=1
--- exceção devolvida
 scripts/auditar-dependencias.mjs | 23 +++++++++++++----------
 1 file changed, 13 insertions(+), 10 deletions(-)
npm audit: {"info":0,"low":3,"moderate":20,"high":13,"critical":0,"total":36}
exceção aceita (desde 2026-10-07, ADR-0010): GHSA-7mx3-vvmw-hjmv @graphql-tools/utils — só a cópia 11.2.2 sob @tinacms/cli@4.0.5; é a última 11.x e os @graphql-codegen/* do CLI pedem ^11.2.0
exceção aceita (desde 2026-11-22, ADR-0010): GHSA-c4qx-w738-7hr3 @graphql-tools/utils — só a cópia 11.2.2 sob @tinacms/cli@4.0.5; é a última 11.x e os @graphql-codegen/* do CLI pedem ^11.2.0
exceção aceita (desde 2026-11-22, ADR-0010): GHSA-mrhx-c7xc-m3w5 zod — só as cópias zod@3.25.76 de tinacms/@tinacms/*; a linha 3 não tem correção (3.25.76 é a última 3.x) e o Tina pede ^3.24.2 até o CLI 4.0.5
aprovado: nenhum aviso high/critical fora das exceções.
EXIT=0
```

### Degrau 4 — final: `npm ci`

```
npm warn ERESOLVE overriding peer dependency
npm warn While resolving: react-final-form@6.5.9
npm warn Found: react@19.2.8
npm warn node_modules/react
npm warn   peer react@"^17.0.0 || ^18.0.0 || ^19.0.0" from @ariakit/react@0.4.39
npm warn   node_modules/@ariakit/react
npm warn     @ariakit/react@"^0.4.15" from tinacms@3.15.2
npm warn     node_modules/tinacms
npm warn   124 more (@ariakit/react-components, @ariakit/react-store, ...)
npm warn
npm warn Could not resolve dependency:
npm warn peer react@"^16.8.0 || ^17.0.0 || ^18.0.0" from react-final-form@6.5.9
npm warn node_modules/tinacms/node_modules/react-final-form
npm warn   react-final-form@"^6.5.9" from tinacms@3.15.2
npm warn   node_modules/tinacms
npm warn
npm warn Conflicting peer dependency: react@18.3.1
npm warn node_modules/react
npm warn   peer react@"^16.8.0 || ^17.0.0 || ^18.0.0" from react-final-form@6.5.9
npm warn   node_modules/tinacms/node_modules/react-final-form
npm warn     react-final-form@"^6.5.9" from tinacms@3.15.2
npm warn     node_modules/tinacms
npm warn deprecated prebuild-install@7.1.3: No longer maintained. Please contact the author of the relevant native addon; alternatives are available.
npm warn deprecated node-domexception@1.0.0: Use your platform's native DOMException instead

added 1554 packages, and audited 1555 packages in 38s

333 packages are looking for funding
  run `npm fund` for details

36 vulnerabilities (3 low, 20 moderate, 13 high)

To address issues that do not require attention, run:
  npm audit fix

To address all issues (including breaking changes), run:
  npm audit fix --force

Run `npm audit` for details.
EXIT=0
```

### Degrau 4 — final: portão

```
npm audit: {"info":0,"low":3,"moderate":20,"high":13,"critical":0,"total":36}
exceção aceita (desde 2026-10-07, ADR-0010): GHSA-7mx3-vvmw-hjmv @graphql-tools/utils — só a cópia 11.2.2 sob @tinacms/cli@4.0.5; é a última 11.x e os @graphql-codegen/* do CLI pedem ^11.2.0
exceção aceita (desde 2026-11-22, ADR-0010): GHSA-c4qx-w738-7hr3 @graphql-tools/utils — só a cópia 11.2.2 sob @tinacms/cli@4.0.5; é a última 11.x e os @graphql-codegen/* do CLI pedem ^11.2.0
exceção aceita (desde 2026-11-22, ADR-0010): GHSA-mrhx-c7xc-m3w5 zod — só as cópias zod@3.25.76 de tinacms/@tinacms/*; a linha 3 não tem correção (3.25.76 é a última 3.x) e o Tina pede ^3.24.2 até o CLI 4.0.5
aprovado: nenhum aviso high/critical fora das exceções.
EXIT=0
```

### Degrau 4 — final: `npm run lint`

```

> haroldo-page@0.1.0 lint
> eslint .

EXIT=0
```

### Degrau 4 — final: `npm run format:check`

```

> haroldo-page@0.1.0 format:check
> prettier --check .

Checking formatting...
All matched files use Prettier code style!
EXIT=0
```

### Degrau 4 — final: `npm run test:coverage`

```

> haroldo-page@0.1.0 test:coverage
> vitest run --coverage


 RUN  v4.1.11 S:/Projetos/academic_page/haroldo
      Coverage enabled with v8


 Test Files  27 passed (27)
      Tests  529 passed (529)
   Start at  13:22:38
   Duration  2.23s (transform 6.80s, setup 0ms, import 13.68s, tests 622ms, environment 5ms)

 % Coverage report from v8
-------------------|---------|----------|---------|---------|-------------------
File               | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
-------------------|---------|----------|---------|---------|-------------------
All files          |     100 |    99.62 |     100 |     100 |                   
 src/lib           |     100 |    99.59 |     100 |     100 |                   
  orcid.ts         |     100 |    98.41 |     100 |     100 | 147               
-------------------|---------|----------|---------|---------|-------------------

=============================== Coverage summary ===============================
Statements   : 100% ( 448/448 )
Branches     : 99.62% ( 268/269 )
Functions    : 100% ( 131/131 )
Lines        : 100% ( 392/392 )
================================================================================
EXIT=0
```

### Degrau 4 — final: `npm run build:pipeline`

```

> haroldo-page@0.1.0 build:pipeline
> vitest run tests/content && tinacms build --skip-cloud-checks && astro check && astro build


 RUN  v4.1.11 S:/Projetos/academic_page/haroldo


 Test Files  7 passed (7)
      Tests  166 passed (166)
   Start at  13:22:42
   Duration  1.38s (transform 2.44s, setup 0ms, import 4.08s, tests 157ms, environment 1ms)

Starting Tina build
│
○  Tina build complete ───────────────────────────────────────────────────────────────────────────────────────────╮
│                                                                                                                 │
│  🦙 Tina Config                                                                                                 │
│     API url:            https://content.tinajs.io/4.1/content/8be98053-68c3-4262-b7bd-dd1286e1c7ad/github/main  │
│                                                                                                                 │
│  🤖 Auto-generated files                                                                                        │
│     GraphQL Client:     tina/__generated__/client.ts                                                            │
│     Typescript Types:   tina/__generated__/types.ts                                                             │
│     Static HTML file:   public/admin/index.html                                                                 │
│                                                                                                                 │
│                                                                                                                 │
├─────────────────────────────────────────────────────────────────────────────────────────────────────────────────╯
[2m13:23:16[22m [34m[content][39m Syncing content
[2m13:23:16[22m [34m[content][39m Synced content
[2m13:23:16[22m [34m[types][39m Generated [2m800ms[22m
[2m13:23:16[22m [34m[check][39m Getting diagnostics for Astro files in S:\Projetos\academic_page\haroldo...
Result (116 files): 
- 0 errors
- 0 warnings
- 0 hints

[2m13:23:27[22m [34m[content][39m Syncing content
[2m13:23:27[22m [34m[content][39m Synced content
[2m13:23:27[22m [34m[types][39m Generated [2m608ms[22m
[2m13:23:27[22m [34m[build][39m output: [34m"static"[39m
[2m13:23:27[22m [34m[build][39m mode: [34m"static"[39m
[2m13:23:27[22m [34m[build][39m directory: [34mS:\Projetos\academic_page\haroldo\dist\[39m
[2m13:23:27[22m [34m[build][39m Collecting build info...
[2m13:23:27[22m [34m[build][39m [32m✓ Completed in 659ms.[39m
[2m13:23:27[22m [34m[build][39m Building static entrypoints...
[33m[1m13:23:27[22m [WARN] [vite][39m [33m[lightningcss minify] 'global' is not recognized as a valid pseudo-class. Did you mean '::global' (pseudo-element) or is this a typo?
25 |  }
26 |  
27 |  .carrossel[data-astro-cid-bkddzv6o]:not(:global(.pronto)) .miniatura[data-astro-cid-bkddzv6o] {
   |                                                  ^
28 |    opacity: 1;
29 |  }[39m
[2m13:23:27[22m [34m[vite][39m [32m✓ built in 543ms[39m
[2m13:23:27[22m [34m[vite][39m [32m✓ built in 102ms[39m
[2m13:23:27[22m [34m[build][39m Rearranging server assets...

[42m[30m generating static routes [39m[49m
[2m13:23:27[22m   [34m├─[39m [2m/404.html[22m [2m(+13ms)[22m 
[2m13:23:27[22m   [34m├─[39m [2m/en/404/index.html[22m [2m(+4ms)[22m 
[2m13:23:28[22m   [34m├─[39m [2m/en/about/index.html[22m [2m(+7ms)[22m 
[2m13:23:28[22m   [34m├─[39m [2m/en/outreach/ifma-pedreiras/index.html[22m [2m(+3ms)[22m 
[2m13:23:28[22m   [34m├─[39m [2m/en/outreach/ufma-bacabal/index.html[22m [2m(+2ms)[22m 
[2m13:23:28[22m   [34m├─[39m [2m/en/outreach/index.html[22m [2m(+4ms)[22m 
[2m13:23:28[22m   [34m├─[39m [2m/en/publications/index.html[22m [2m(+7ms)[22m 
[2m13:23:28[22m   [34m├─[39m [2m/en/research/index.html[22m [2m(+5ms)[22m 
[2m13:23:28[22m   [34m├─[39m [2m/en/teaching/fisica-moderna/index.html[22m [2m(+87ms)[22m 
[2m13:23:28[22m   [34m├─[39m [2m/en/teaching/mecanica-classica/index.html[22m [2m(+3ms)[22m 
[2m13:23:28[22m   [34m├─[39m [2m/en/teaching/index.html[22m [2m(+8ms)[22m 
[2m13:23:28[22m   [34m├─[39m [2m/en/index.html[22m [2m(+16ms)[22m 
[2m13:23:28[22m   [34m├─[39m [2m/ensino/fisica-moderna/index.html[22m [2m(+16ms)[22m 
[2m13:23:28[22m   [34m├─[39m [2m/ensino/mecanica-classica/index.html[22m [2m(+2ms)[22m 
[2m13:23:28[22m   [34m├─[39m [2m/ensino/index.html[22m [2m(+4ms)[22m 
[2m13:23:28[22m   [34m├─[39m [2m/extensao/ifma-pedreiras/index.html[22m [2m(+1ms)[22m 
[2m13:23:28[22m   [34m├─[39m [2m/extensao/ufma-bacabal/index.html[22m [2m(+1ms)[22m 
[2m13:23:28[22m   [34m├─[39m [2m/extensao/index.html[22m [2m(+3ms)[22m 
[2m13:23:28[22m   [34m├─[39m [2m/pesquisa/index.html[22m [2m(+3ms)[22m 
[2m13:23:28[22m   [34m├─[39m [2m/publicacoes/index.html[22m [2m(+4ms)[22m 
[2m13:23:28[22m   [34m├─[39m [2m/sobre/index.html[22m [2m(+3ms)[22m 
[2m13:23:28[22m   [34m├─[39m [2m/index.html[22m [2m(+3ms)[22m 
[2m13:23:28[22m [32m✓ Completed in 250ms.
[39m
[2m13:23:28[22m [34m[build][39m [32m✓ Completed in 975ms.[39m
[2m13:23:28[22m [34m[@astrojs/sitemap][39m `sitemap-index.xml` created at `dist`
[2m13:23:28[22m [34m[build][39m 22 page(s) built in [1m1.66s[22m
[2m13:23:28[22m [34m[build][39m [1mComplete![22m
EXIT=0
```

### Degrau 4 — final: `npm run test:dist`

```

> haroldo-page@0.1.0 test:dist
> vitest run -c vitest.dist.config.ts


 RUN  v4.1.11 S:/Projetos/academic_page/haroldo


 Test Files  2 passed (2)
      Tests  59 passed (59)
   Start at  13:23:30
   Duration  672ms (transform 179ms, setup 0ms, import 346ms, tests 438ms, environment 0ms)

EXIT=0
```


## Correções do ciclo 1 (executor, 2026-11-22)

Atualizados os `@graphql-codegen/*` dentro das faixas do CLI (`17364aa`): o `@graphql-tools/utils` ficou só em 12.1.0, e as exceções GHSA-c4qx e GHSA-7mx3 saíram de `EXCECOES`. ADR, README e avisos corrigidos conforme os itens da revisão (commit de docs seguinte). Os blocos do degrau 4 acima que mostram as exceções antigas descrevem os commits `48139bc` e `e3aef7f`, não o estado final; os blocos abaixo descrevem o final.

### Ciclo 1 — `npm update @graphql-codegen/*` (commit `17364aa`), `diff-lock.mjs` e `npm ls @graphql-tools/utils`

```

added 1 package, removed 13 packages, changed 12 packages, and audited 1543 packages in 17s

333 packages are looking for funding
  run `npm fund` for details

31 vulnerabilities (3 low, 20 moderate, 8 high)

To address issues that do not require attention, run:
  npm audit fix

To address all issues (including breaking changes), run:
  npm audit fix --force

Run `npm audit` for details.
EXIT=0
--- diff-lock
node_modules/@ardatan/relay-compiler: 13.0.2 → 13.0.3
node_modules/@babel/runtime: 8.0.0 → 8.1.3
node_modules/@graphql-codegen/core: 6.2.0 → 6.2.2
node_modules/@graphql-codegen/plugin-helpers: 7.3.0 → 7.4.2
node_modules/@graphql-codegen/schema-ast: 6.1.0 → 6.1.1
node_modules/@graphql-codegen/typescript: 6.1.0 → 6.1.2
node_modules/@graphql-codegen/typescript-operations: 6.1.6 → 6.2.0
node_modules/@graphql-codegen/visitor-plugin-common: 7.2.5 → 7.5.0
node_modules/@graphql-tools/graphql-file-loader/node_modules/@graphql-tools/utils: 12.1.0 → —
node_modules/@graphql-tools/graphql-file-loader/node_modules/@whatwg-node/promise-helpers: 2.0.2 → —
node_modules/@graphql-tools/import/node_modules/@graphql-tools/utils: 12.1.0 → —
node_modules/@graphql-tools/import/node_modules/@whatwg-node/promise-helpers: 2.0.2 → —
node_modules/@graphql-tools/load/node_modules/@graphql-tools/utils: 12.1.0 → —
node_modules/@graphql-tools/load/node_modules/@whatwg-node/promise-helpers: 2.0.2 → —
node_modules/@graphql-tools/merge/node_modules/@graphql-tools/utils: 12.1.0 → —
node_modules/@graphql-tools/merge/node_modules/@whatwg-node/promise-helpers: 2.0.2 → —
node_modules/@graphql-tools/relay-operation-optimizer: 7.1.9 → 7.1.14
node_modules/@graphql-tools/relay-operation-optimizer/node_modules/@graphql-tools/utils: 12.1.0 → —
node_modules/@graphql-tools/relay-operation-optimizer/node_modules/@whatwg-node/promise-helpers: 2.0.2 → —
node_modules/@graphql-tools/relay-operation-optimizer/node_modules/tslib: 2.9.1 → —
node_modules/@graphql-tools/schema/node_modules/@graphql-tools/utils: 12.1.0 → —
node_modules/@graphql-tools/schema/node_modules/@whatwg-node/promise-helpers: 2.0.2 → —
node_modules/@graphql-tools/utils: 11.2.2 → 12.1.0
node_modules/@whatwg-node/promise-helpers: 1.3.2 → 2.0.2
node_modules/immutable: 5.1.9 → 5.2.1
node_modules/@whatwg-node/promise-helpers/node_modules/tslib: — → 2.9.1
--- git diff package.json bytes: 0
--- npm ls @graphql-tools/utils
haroldo-page@0.1.0 S:\Projetos\academic_page\haroldo
`-- @tinacms/cli@4.0.5
  +-- @graphql-codegen/core@6.2.2
  | +-- @graphql-tools/schema@10.1.5
  | | +-- @graphql-tools/merge@9.2.8
  | | | `-- @graphql-tools/utils@12.1.0 deduped
  | | `-- @graphql-tools/utils@12.1.0 deduped
  | `-- @graphql-tools/utils@12.1.0
  +-- @graphql-codegen/plugin-helpers@7.4.2
  | `-- @graphql-tools/utils@12.1.0 deduped
  +-- @graphql-codegen/typescript-operations@6.2.0
  | `-- @graphql-codegen/schema-ast@6.1.1
  |   `-- @graphql-tools/utils@12.1.0 deduped
  +-- @graphql-codegen/visitor-plugin-common@7.5.0
  | +-- @graphql-tools/relay-operation-optimizer@7.1.14
  | | `-- @graphql-tools/utils@12.1.0 deduped
  | `-- @graphql-tools/utils@12.1.0 deduped
  +-- @graphql-tools/graphql-file-loader@8.1.24
  | +-- @graphql-tools/import@7.2.4
  | | `-- @graphql-tools/utils@12.1.0 deduped
  | `-- @graphql-tools/utils@12.1.0 deduped
  `-- @graphql-tools/load@8.1.21
    `-- @graphql-tools/utils@12.1.0 deduped
```

### Ciclo 1 — `npm audit` depois do `17364aa` (contagem e pacotes não-high)

```
{"info":0,"low":3,"moderate":20,"high":8,"critical":0,"total":31}
moderate @eslint/config-array node_modules/@eslint/config-array
moderate @tailwindcss/typography node_modules/@tailwindcss/typography
moderate @typescript-eslint/eslint-plugin node_modules/@typescript-eslint/eslint-plugin
moderate @typescript-eslint/parser node_modules/@typescript-eslint/parser
moderate @typescript-eslint/type-utils node_modules/@typescript-eslint/type-utils
moderate @typescript-eslint/typescript-estree node_modules/@typescript-eslint/typescript-estree
moderate @typescript-eslint/utils node_modules/@typescript-eslint/utils
moderate @vitest/coverage-v8 node_modules/@vitest/coverage-v8
moderate @vitest/mocker node_modules/@vitest/mocker
moderate altair-express-middleware node_modules/altair-express-middleware
moderate altair-static node_modules/altair-static
moderate astro node_modules/astro
low dompurify node_modules/dompurify
moderate eslint node_modules/eslint
moderate fast-uri node_modules/fast-uri
low katex node_modules/katex
low mermaid node_modules/mermaid
moderate minimatch node_modules/minimatch
moderate postcss-selector-parser node_modules/@tailwindcss/typography/node_modules/postcss-selector-parser,node_modules/@tinacms/cli/node_modules/postcss-selector-parser,node_modules/postcss-nested/node_modules/postcss-selector-parser,node_modules/postcss-selector-parser
moderate qs node_modules/qs
moderate smol-toml node_modules/smol-toml
moderate typescript-eslint node_modules/typescript-eslint
moderate vitest node_modules/vitest
zod {"name":"@tinacms/cli","version":"1.0.4","isSemVerMajor":true} node_modules/@tinacms/app/node_modules/zod,node_modules/@tinacms/cli/node_modules/zod,node_modules/@tinacms/schema-tools/node_modules/zod,node_modules/tinacms/node_modules/zod
```

### Ciclo 1 — origens das baixas e moderadas, e advisories do `astro`

```
### dompurify
`-- tinacms@3.15.2
### katex
`-- tinacms@3.15.2
### mermaid
`-- tinacms@3.15.2
### qs
`-- @tinacms/cli@4.0.5
### @tailwindcss/typography
`-- @tinacms/cli@4.0.5
### postcss-selector-parser
+-- @tinacms/cli@4.0.5
`-- eslint-plugin-astro@3.1.0
### fast-uri
`-- @astrojs/check@0.9.10
### smol-toml
`-- astro@7.2.10
### minimatch
+-- @tinacms/cli@4.0.5
+-- eslint@10.9.1
`-- typescript-eslint@8.69.0
### astro advisory
[["https://github.com/advisories/GHSA-98hj-9722-w3j8","Astro: Reflected/Stored XSS via unescaped <script>/<style> tag content in JSX/MDX rendering","<7.3.2"],["https://github.com/advisories/GHSA-mpr7-6m5w-76rw","Astro: Arbitrary CSS injection in Astro View Transitions",">=7.1.0 <=7.3.2"],["https://github.com/advisories/GHSA-mh32-jxcr-mh9f","Astro: XSS via attribute injection in dynamic tag names","<=7.4.4"],["https://github.com/advisories/GHSA-r3h5-4585-7x3w","Astro: Image endpoint in @astrojs/node can read files from a case-variant sibling of the output directory on case-sensitive filesystems",">=5.14.3 <=7.4.6"]]
```

### Ciclo 1 — canário do `zod`

```
--- canário: exceção do zod retirada
npm audit: {"info":0,"low":3,"moderate":20,"high":8,"critical":0,"total":31}
REPROVADO: high GHSA-mrhx-c7xc-m3w5 zod — Zod can exhaust memory while validating oversized constrained collections
Atualize a dependência ou registre exceção datada no ADR-0010 (nunca baixe o nível).
EXIT=1
--- exceção devolvida
npm audit: {"info":0,"low":3,"moderate":20,"high":8,"critical":0,"total":31}
exceção aceita (desde 2026-11-22, ADR-0010): GHSA-mrhx-c7xc-m3w5 zod — só as cópias zod@3.25.76 de tinacms/@tinacms/*; a linha 3 não tem correção (3.25.76 é a última 3.x) e o Tina pede ^3.24.2 até o CLI 4.0.5
aprovado: nenhum aviso high/critical fora das exceções.
EXIT=0
```

### Ciclo 1 — `npm ci`

```
npm warn ERESOLVE overriding peer dependency
npm warn While resolving: react-final-form@6.5.9
npm warn Found: react@19.2.8
npm warn node_modules/react
npm warn   peer react@"^17.0.0 || ^18.0.0 || ^19.0.0" from @ariakit/react@0.4.39
npm warn   node_modules/@ariakit/react
npm warn     @ariakit/react@"^0.4.15" from tinacms@3.15.2
npm warn     node_modules/tinacms
npm warn   124 more (@ariakit/react-components, @ariakit/react-store, ...)
npm warn
npm warn Could not resolve dependency:
npm warn peer react@"^16.8.0 || ^17.0.0 || ^18.0.0" from react-final-form@6.5.9
npm warn node_modules/tinacms/node_modules/react-final-form
npm warn   react-final-form@"^6.5.9" from tinacms@3.15.2
npm warn   node_modules/tinacms
npm warn
npm warn Conflicting peer dependency: react@18.3.1
npm warn node_modules/react
npm warn   peer react@"^16.8.0 || ^17.0.0 || ^18.0.0" from react-final-form@6.5.9
npm warn   node_modules/tinacms/node_modules/react-final-form
npm warn     react-final-form@"^6.5.9" from tinacms@3.15.2
npm warn     node_modules/tinacms
npm warn deprecated prebuild-install@7.1.3: No longer maintained. Please contact the author of the relevant native addon; alternatives are available.
npm warn deprecated node-domexception@1.0.0: Use your platform's native DOMException instead

added 1542 packages, and audited 1543 packages in 36s

333 packages are looking for funding
  run `npm fund` for details

31 vulnerabilities (3 low, 20 moderate, 8 high)

To address issues that do not require attention, run:
  npm audit fix

To address all issues (including breaking changes), run:
  npm audit fix --force

Run `npm audit` for details.
EXIT=0
```

### Ciclo 1 — portão

```
npm audit: {"info":0,"low":3,"moderate":20,"high":8,"critical":0,"total":31}
exceção aceita (desde 2026-11-22, ADR-0010): GHSA-mrhx-c7xc-m3w5 zod — só as cópias zod@3.25.76 de tinacms/@tinacms/*; a linha 3 não tem correção (3.25.76 é a última 3.x) e o Tina pede ^3.24.2 até o CLI 4.0.5
aprovado: nenhum aviso high/critical fora das exceções.
EXIT=0
```

### Ciclo 1 — `npm run lint`

```

> haroldo-page@0.1.0 lint
> eslint .

EXIT=0
```

### Ciclo 1 — `npm run format:check`

```

> haroldo-page@0.1.0 format:check
> prettier --check .

Checking formatting...
All matched files use Prettier code style!
EXIT=0
```

### Ciclo 1 — `npm run test:coverage`

```

> haroldo-page@0.1.0 test:coverage
> vitest run --coverage


 RUN  v4.1.11 S:/Projetos/academic_page/haroldo
      Coverage enabled with v8


 Test Files  27 passed (27)
      Tests  529 passed (529)
   Start at  13:38:53
   Duration  2.17s (transform 6.65s, setup 0ms, import 13.43s, tests 614ms, environment 5ms)

 % Coverage report from v8
-------------------|---------|----------|---------|---------|-------------------
File               | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
-------------------|---------|----------|---------|---------|-------------------
All files          |     100 |    99.62 |     100 |     100 |                   
 src/lib           |     100 |    99.59 |     100 |     100 |                   
  orcid.ts         |     100 |    98.41 |     100 |     100 | 147               
-------------------|---------|----------|---------|---------|-------------------

=============================== Coverage summary ===============================
Statements   : 100% ( 448/448 )
Branches     : 99.62% ( 268/269 )
Functions    : 100% ( 131/131 )
Lines        : 100% ( 392/392 )
================================================================================
EXIT=0
```

### Ciclo 1 — `npm run build:pipeline`

```

> haroldo-page@0.1.0 build:pipeline
> vitest run tests/content && tinacms build --skip-cloud-checks && astro check && astro build


 RUN  v4.1.11 S:/Projetos/academic_page/haroldo


 Test Files  7 passed (7)
      Tests  166 passed (166)
   Start at  13:38:58
   Duration  1.39s (transform 2.42s, setup 0ms, import 4.14s, tests 153ms, environment 1ms)

Starting Tina build
│
○  Tina build complete ───────────────────────────────────────────────────────────────────────────────────────────╮
│                                                                                                                 │
│  🦙 Tina Config                                                                                                 │
│     API url:            https://content.tinajs.io/4.1/content/8be98053-68c3-4262-b7bd-dd1286e1c7ad/github/main  │
│                                                                                                                 │
│  🤖 Auto-generated files                                                                                        │
│     GraphQL Client:     tina/__generated__/client.ts                                                            │
│     Typescript Types:   tina/__generated__/types.ts                                                             │
│     Static HTML file:   public/admin/index.html                                                                 │
│                                                                                                                 │
│                                                                                                                 │
├─────────────────────────────────────────────────────────────────────────────────────────────────────────────────╯
[2m13:39:32[22m [34m[content][39m Syncing content
[2m13:39:32[22m [34m[content][39m Synced content
[2m13:39:32[22m [34m[types][39m Generated [2m726ms[22m
[2m13:39:32[22m [34m[check][39m Getting diagnostics for Astro files in S:\Projetos\academic_page\haroldo...
Result (116 files): 
- 0 errors
- 0 warnings
- 0 hints

[2m13:39:42[22m [34m[content][39m Syncing content
[2m13:39:42[22m [34m[content][39m Synced content
[2m13:39:42[22m [34m[types][39m Generated [2m518ms[22m
[2m13:39:42[22m [34m[build][39m output: [34m"static"[39m
[2m13:39:42[22m [34m[build][39m mode: [34m"static"[39m
[2m13:39:42[22m [34m[build][39m directory: [34mS:\Projetos\academic_page\haroldo\dist\[39m
[2m13:39:42[22m [34m[build][39m Collecting build info...
[2m13:39:42[22m [34m[build][39m [32m✓ Completed in 550ms.[39m
[2m13:39:42[22m [34m[build][39m Building static entrypoints...
[33m[1m13:39:43[22m [WARN] [vite][39m [33m[lightningcss minify] 'global' is not recognized as a valid pseudo-class. Did you mean '::global' (pseudo-element) or is this a typo?
25 |  }
26 |  
27 |  .carrossel[data-astro-cid-bkddzv6o]:not(:global(.pronto)) .miniatura[data-astro-cid-bkddzv6o] {
   |                                                  ^
28 |    opacity: 1;
29 |  }[39m
[2m13:39:43[22m [34m[vite][39m [32m✓ built in 502ms[39m
[2m13:39:43[22m [34m[vite][39m [32m✓ built in 115ms[39m
[2m13:39:43[22m [34m[build][39m Rearranging server assets...

[42m[30m generating static routes [39m[49m
[2m13:39:43[22m   [34m├─[39m [2m/404.html[22m [2m(+18ms)[22m 
[2m13:39:43[22m   [34m├─[39m [2m/en/404/index.html[22m [2m(+4ms)[22m 
[2m13:39:43[22m   [34m├─[39m [2m/en/about/index.html[22m [2m(+8ms)[22m 
[2m13:39:43[22m   [34m├─[39m [2m/en/outreach/ifma-pedreiras/index.html[22m [2m(+3ms)[22m 
[2m13:39:43[22m   [34m├─[39m [2m/en/outreach/ufma-bacabal/index.html[22m [2m(+2ms)[22m 
[2m13:39:43[22m   [34m├─[39m [2m/en/outreach/index.html[22m [2m(+4ms)[22m 
[2m13:39:43[22m   [34m├─[39m [2m/en/publications/index.html[22m [2m(+23ms)[22m 
[2m13:39:43[22m   [34m├─[39m [2m/en/research/index.html[22m [2m(+7ms)[22m 
[2m13:39:43[22m   [34m├─[39m [2m/en/teaching/fisica-moderna/index.html[22m [2m(+80ms)[22m 
[2m13:39:43[22m   [34m├─[39m [2m/en/teaching/mecanica-classica/index.html[22m [2m(+4ms)[22m 
[2m13:39:43[22m   [34m├─[39m [2m/en/teaching/index.html[22m [2m(+7ms)[22m 
[2m13:39:43[22m   [34m├─[39m [2m/en/index.html[22m [2m(+14ms)[22m 
[2m13:39:43[22m   [34m├─[39m [2m/ensino/fisica-moderna/index.html[22m [2m(+13ms)[22m 
[2m13:39:43[22m   [34m├─[39m [2m/ensino/mecanica-classica/index.html[22m [2m(+3ms)[22m 
[2m13:39:43[22m   [34m├─[39m [2m/ensino/index.html[22m [2m(+3ms)[22m 
[2m13:39:43[22m   [34m├─[39m [2m/extensao/ifma-pedreiras/index.html[22m [2m(+2ms)[22m 
[2m13:39:43[22m   [34m├─[39m [2m/extensao/ufma-bacabal/index.html[22m [2m(+2ms)[22m 
[2m13:39:43[22m   [34m├─[39m [2m/extensao/index.html[22m [2m(+3ms)[22m 
[2m13:39:43[22m   [34m├─[39m [2m/pesquisa/index.html[22m [2m(+3ms)[22m 
[2m13:39:43[22m   [34m├─[39m [2m/publicacoes/index.html[22m [2m(+4ms)[22m 
[2m13:39:43[22m   [34m├─[39m [2m/sobre/index.html[22m [2m(+3ms)[22m 
[2m13:39:43[22m   [34m├─[39m [2m/index.html[22m [2m(+2ms)[22m 
[2m13:39:43[22m [32m✓ Completed in 266ms.
[39m
[2m13:39:43[22m [34m[build][39m [32m✓ Completed in 964ms.[39m
[2m13:39:43[22m [34m[@astrojs/sitemap][39m `sitemap-index.xml` created at `dist`
[2m13:39:43[22m [34m[build][39m 22 page(s) built in [1m1.55s[22m
[2m13:39:43[22m [34m[build][39m [1mComplete![22m
EXIT=0
```

### Ciclo 1 — `npm run test:dist`

```

> haroldo-page@0.1.0 test:dist
> vitest run -c vitest.dist.config.ts


 RUN  v4.1.11 S:/Projetos/academic_page/haroldo


 Test Files  2 passed (2)
      Tests  59 passed (59)
   Start at  13:39:45
   Duration  695ms (transform 154ms, setup 0ms, import 334ms, tests 497ms, environment 0ms)

EXIT=0
```


## O2 curto depois do ciclo 1 (orquestrador)

Feito pelo orquestrador no Edge, com o `@graphql-codegen` novo.

### O2c — `o2c-resumo.txt`

```
O2 curto depois do ciclo 1 — orquestrador, Edge, 2026-11-22 (branch em ad857f4: @graphql-codegen atualizados em 17364aa, @graphql-tools/utils só 12.1.0)
Servidores: npx tinacms dev + npx astro dev --background --force. Rascunho content/disciplinas/teste-087.md (publicado: false), apagado no fim.
1. Listagem (#/collections/<c>/~): perfil 1, linhas_pesquisa 2, projetos 2, disciplinas 3 (2 + teste-087), publicacoes 23, extensao 3.
2. Semestre "T087" na disciplina de teste, Save → MutationObserver: ["49146 Document updated!"]; arquivo depois:
2026-11-22 13:41:47
2026-11-22 13:41:44.469990800 -0300 74
---
publicado: false
nome: Teste 087
semestre: T087
status: anterior
---
Console com rastreio desde a carga: read_console_messages onlyErrors → nenhum erro; avisos → nenhum.
```


## Correções do ciclo 2 (executor, 2026-11-22)

ADR-0010: `GHSA-7mx3` entra em "Retiradas nesta data"; "Alcance de todas" vira "Alcance da exceção"; ADR e README dizem "pacotes do Tina" em vez de `@tinacms/*`. Só texto.

### Ciclo 2 — `npm run format:check`

```

> haroldo-page@0.1.0 format:check
> prettier --check .

Checking formatting...
All matched files use Prettier code style!
EXIT=0
```


## O3 a O5 (orquestrador)

Feito pelo orquestrador, com push e merge autorizados pelo dono do produto. O fallback do degrau 3 e a reversão (O6) não foram necessários: o degrau 3 ficou e a produção passou.

### o3.txt

```
O3 — orquestrador, 2026-11-22
Revisão: code-reviewer APROVADO no ciclo 2 (reprovações: ciclo 0 com 4 obrigatórios, ciclo 1 com 1 obrigatório).
Push autorizado pelo dono do produto: git push -u origin atualiza-dependencias → * [new branch], HEAD bed5038a2a93a2f7a325a33dc73f2b9c2289438f
PR: https://github.com/researchgroups-ufma/haroldo-page/pull/1
Check-runs do SHA completo bed5038a2a93a2f7a325a33dc73f2b9c2289438f: "Workers Builds: haroldo-page: completed success;qualidade: completed success;"
CI qualidade (run 45047447944, pull_request): npm ci, auditar-dependencias, lint, format:check, test:coverage, build:pipeline, test:dist — todos success.
Workers Builds (build bcef1966-c2ea-43eb-bbe4-a93f846a957f), log pela API /builds/builds/{uuid}/logs:
  "Installing project dependencies: npm clean-install --progress=false" / "added 1543 packages, and audited 1544 packages in 1m"
  "Tests  166 passed (166)" / "- 0 errors" / "[build] Complete!" / "Success: Build command completed"
  "Executing user deploy command: npx wrangler versions upload" / " ⛅️ wrangler 4.166.0" / "Worker Version ID: 9393f43f-1d24-4646-a6e3-55de75d7b75e" / "✨ Success! Build completed."
Prévia (alias https://atualiza-dependencias-haroldo-page.and-near.workers.dev), SHA-256 (16 hex) do corpo servido = dist/ local:
  / 15a13014d348ae43 = 15a13014d348ae43 "Prof. Haroldo C. D. Lima Junior"
  /ensino/fisica-moderna/ fea5dc07b54be937 = fea5dc07b54be937 "Física Moderna I — Haroldo Lima Junior"
  /extensao/ufma-bacabal/ 5bba0a591312d4f1 = 5bba0a591312d4f1
  /admin/ HTTP 200 "TinaCMS" (não aberto para edição; nada salvo na prévia)
```

### o4.txt

```
O4 — orquestrador, 2026-11-22 23:39:54 -0300 (pergunta feita às 14:09; merge autorizado pelo dono do produto na resposta, recebida perto das 23:39)
origin/main antes: 71e1c24373288cf3774839664fb6e7f3653bbfad
commits do plano (main..HEAD):
bed5038 docs: evidência dos degraus 1 a 4 e dos O2 do plano 087
a018b50 docs: lista a retirada do GHSA-7mx3 no ADR-0010 (plano 087, degrau 4)
ad857f4 docs: corrige exceções e textos apontados na revisão (plano 087, degrau 4)
17364aa chore: atualiza @graphql-codegen dentro da faixa (plano 087, degrau 4)
e3aef7f docs: exceções datadas e ADR-0010 depois da atualização (plano 087, degrau 4)
48139bc chore: atualiza @graphql-tools/utils dentro da faixa (plano 087, degrau 4)
f7ec0c6 chore: sobe @tinacms/cli para 4.0.5 (plano 087, degrau 3)
9685036 chore: sobe tinacms, vite e wrangler para as versões corrigidas (plano 087, degrau 2)
7ea9400 chore: atualiza dependências compatíveis do audit (plano 087, degrau 1)
Reversão (O6), do mais novo ao mais antigo:
git revert --no-edit bed5038 a018b50 ad857f4 17364aa e3aef7f 48139bc f7ec0c6 9685036 7ea9400 && git push origin main
Linha de base da produção antes do push:
/ prod=15a13014d348ae43 dist-branch=15a13014d348ae43
/ensino/fisica-moderna/ prod=fea5dc07b54be937 dist-branch=fea5dc07b54be937
Switched to branch 'main'
Your branch is up to date with 'origin/main'.
 tina/tina-lock.json                                |    2 +-
 9 files changed, 4745 insertions(+), 2944 deletions(-)
To https://github.com/researchgroups-ufma/haroldo-page.git
   71e1c24..bed5038  main -> main
main local=bed5038a2a93a2f7a325a33dc73f2b9c2289438f remota=bed5038a2a93a2f7a325a33dc73f2b9c2289438f
```

### o4-npm-test.txt

```

 Test Files  27 passed (27)
      Tests  529 passed (529)
   Start at  23:40:26
   Duration  2.16s (transform 7.57s, setup 0ms, import 13.99s, tests 653ms, environment 5ms)

EXIT=0
```

### o5.txt

```
O5 — orquestrador, 2026-11-22 (noite) / 2026-11-23 UTC
main = bed5038a2a93a2f7a325a33dc73f2b9c2289438f (push 71e1c24..bed5038)
Check-runs novos do SHA completo na main: "Workers Builds: haroldo-page: completed success;qualidade: completed success;"
  → CI qualidade verde na main, o primeiro desde 2026-11-20.
Workers Builds de produção: build 2124c1ef-1d70-4ebe-85e6-0a45c24c966e, log pela API:
  "Installing project dependencies: npm clean-install --progress=false" / "added 1543 packages, and audited 1544 packages in 2m"
  "Tests  166 passed (166)" / "- 0 errors" / "02:43:36 [build] Complete!"
  "Executing user deploy command: npx wrangler deploy" / " ⛅️ wrangler 4.166.0" / "Current Version ID: dd2ddc11-ca67-49e5-b9b5-04e46fcf1853" / "✨ Success! Build completed."
Deployment ativo (API /workers/scripts/haroldo-page/deployments): created_on 2026-11-23T02:43:41Z, versions [{"version_id":"dd2ddc11-ca67-49e5-b9b5-04e46fcf1853","percentage":100}]
Vigia do deploy: gh workflow run vigia-do-deploy.yml → run 45101888556, "success bed5038a2a93a2f7a325a33dc73f2b9c2289438f workflow_dispatch"
Produção x dist/ (SHA-256, 16 hex):
  / 15a13014d348ae43 = 15a13014d348ae43 (HTTP 200, 6891 bytes; uma primeira leitura veio vazia por falha momentânea de rede, repetida 3x com HTTP 200)
  /ensino/fisica-moderna/ fea5dc07b54be937 = fea5dc07b54be937
  /extensao/ufma-bacabal/ 5bba0a591312d4f1 = 5bba0a591312d4f1
  /admin/ HTTP 200
/admin de produção no Edge, 2026-11-23 00:04:10 -0300, logado no TinaCloud pelo dono do produto:
  coleções (#/collections/<c>/~): {"perfil":{"n":1},"linhas_pesquisa":{"n":2},"projetos":{"n":2},"disciplinas":{"n":2},"publicacoes":{"n":23},"extensao":{"n":3}} (= main), nenhuma tela de erro
  disciplinas/Fisica-Moderna abre: {"nome":"Física Moderna I","aulas":34}; Save desabilitado; nada salvo
  console do painel (rastreio desde a abertura): "No console errors or exceptions found for this tab."
  TinaCloud, projeto haroldo-page, Configuration → Branches: "atualiza-dependencias | 10 hours ago | design | 2 months ago | main | 23 minutes ago" (main reindexada depois do merge, push às 23:41)
```
