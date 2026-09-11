# Plano 030 — Portão de conteúdo: todo arquivo de `content/` validado, com referência resolvida

**Status:** TODO
**RFs cobertos:** **F-09**, RNF-09, R-01, R-02, D-06; §11 ("Validação de conteúdo: todo arquivo em
`content/` passa pelo Zod — bloqueia merge"); **dívida 5** e **dívida 7(a)/(c)** da fase 1
**Depende de:** plano **024** (o `build:pipeline` já chama `vitest run tests/content`; este plano
põe o portão dentro dessa pasta e ele passa a valer no deploy sem alterar o script). **Conflita em
`package.json` com o 024** — serialize.
**Modelo recomendado:** sonnet
**Agente recomendado:** implementer
**Executável por:** **agente**
**PRD:** `S:\Projetos\academic_page\haroldo\PRD.md`
**Projeto:** `S:\Projetos\academic_page\haroldo`

## Objetivo

Conteúdo inválido em `content/` **reprova** — no CI e no build de deploy —, com mensagem que
nomeia o arquivo e o campo, como F-09 exige. Hoje não reprova: o `astro check` imprime
`[ERROR] [content]` e ainda assim encerra com `0 errors` e **exit 0**, e a única coisa que impediu
uma referência inválida de entrar no commit que fechou a fase 1 foi **um humano ler a saída**.

## Arquivos afetados

- `tests/content/conteudo-valido.test.ts` — **novo**: valida os arquivos reais de `content/`
  contra os schemas Zod e resolve as referências
- `tests/content/paridade-schema.test.ts` — **acréscimo**: comparação do `path` da coleção no Tina
  contra a pasta que o `glob()` do Zod lê (dívida 7a) e reprodução da prova de falsificabilidade
  contra o artefato final (dívida 7c)
- `package.json` / `package-lock.json` — `gray-matter` declarado como devDependency

> O executor não toca em arquivo fora desta lista. Se precisar, para e reporta.
> Em especial: **não** edite `content/**` (fora dos canários temporários do passo 5, revertidos no
> mesmo passo), **não** edite `src/content.config.ts` nem `tina/config.ts` — se o portão novo
> apontar defeito real em algum arquivo de conteúdo ou em algum schema, isso é **achado a
> reportar**, e a correção é plano próprio.

## Contexto necessário

**Projeto.** `haroldo-page` — Astro 7 + TinaCMS. `src/content.config.ts` é o portão de validação
(Zod 4 via `astro/zod`); `tina/config.ts` é a interface de entrada. Windows 11 / PowerShell, Node
24.16.0, Vitest 4.1.11. Suíte atual: **107 testes, 4 arquivos, cobertura 100%**, `thresholds` de
80% impostos em `vitest.config.ts`.

**Conteúdo real hoje — 13 arquivos** criados pelo painel no plano 020:

```
content/perfil/index.md
content/linhas-pesquisa/*.md          (2)
content/projetos/*.md                 (2)
content/disciplinas/*.md              (2)
content/publicacoes/*.md              (6)
```

### A dívida que este plano fecha, com o artefato que a materializou

Em 2026-09-10, durante a demonstração do critério da fase 1 (plano 021), **editar apenas a
`descricao`** de `content/projetos/forcas-de-mare-em-espacos-tempos-de-kerr.md` pelo painel fez o
Tina acrescentar `linha_relacionada: ''` a um arquivo que o plano 020 tinha criado **sem** esse
campo. O Astro rejeita:

```
Invalid content reference: ... references "" in collection "linhas-pesquisa", but that entry does not exist
```

…e mesmo assim o `npm run build` daquela tentativa **encerrou com exit 0**. A linha foi removida à
mão antes da verificação autoritativa. **Sem essa leitura humana, o commit que fecha a fase 1 teria
ido com `lint`, `format`, `test` e `build` verdes e uma referência inválida no repositório.**

Note o contraste que o plano 020 registrou: `codigo` vazio numa disciplina é **omitido** do
frontmatter; o problema é específico do tipo `reference`.

### O que o teste tem de fazer — e uma armadilha que ele não pode cair

1. **Descobrir os arquivos**, não listá-los à mão: varra as pastas de coleção. Precedente de
   varredura de arquivos em teste neste projeto: `tests/lib/config.test.ts`, que usa
   `readdirSync`/`readFileSync` do `node:fs` para varrer `src/` — siga esse estilo.
2. **Ler o frontmatter com `gray-matter`** — o **mesmo** parser que o painel usa para gravar. Ler
   com outro parser testaria outra coisa.
3. **Validar contra os schemas exportados** de `src/content.config.ts`: `perfilSchema`,
   `linhasPesquisaSchema`, `projetosSchema`, `disciplinasSchema`, `publicacoesSchema` — os cinco
   já são exportados e já são importados assim por `tests/content/paridade-schema.test.ts`.
4. **⚠️ `safeParse` NÃO cobre a referência inválida.** `projetos.linha_relacionada` passa por
   `normalizeLinhaRelacionadaId` e por `reference()`, que apenas **transforma** o valor em
   `{ id, collection }` — quem verifica se a entrada existe é a content layer do Astro, em tempo de
   build, não o Zod. `linha_relacionada: ''` faz `safeParse` **passar**. Portanto o teste precisa
   de uma asserção **explícita** de existência: para cada projeto com `linha_relacionada`
   presente, o id normalizado tem de corresponder a um arquivo existente em
   `content/linhas-pesquisa/`, e string vazia é rejeitada com mensagem própria. **Este é o coração
   do plano** — um teste que só chame `safeParse` fecha o plano sem fechar a dívida.
5. **Mensagem no formato de F-09.** O PRD dá o gabarito: `content/publicacoes/x.md → campo 'ano':
   esperado número entre 1900 e 2100`. Toda falha deste teste tem de conter **o caminho do arquivo
   relativo à raiz** e **o caminho do campo**. Isso não é estética: o plano 028 vai demonstrar essa
   mensagem chegando ao ADMIN por notificação de build, e é ela que decide se F-09 está satisfeito.
   Agregue as falhas numa lista e compare com `[]`, como `paridade-schema.test.ts` já faz — uma
   asserção que morre no primeiro erro esconde os demais.

### `gray-matter` — declarar, não herdar por acidente

`gray-matter@4.0.3` **já está na árvore** (transitiva do TinaCMS). Este projeto já pagou o preço de
depender de transitiva: o `vite` era importado por `astro.config.mjs` sem estar declarado e
funcionava "por acidente do hoisting" (resolvido em 2026-09-03). Declare-o em `devDependencies`
**na versão exata que já está instalada**, para não mexer na árvore:

- confira antes com `npm ls gray-matter`;
- declare `"gray-matter": "4.0.3"` (versão exata, como as demais do projeto);
- depois de `npm install`, **confira o churn do lockfile**: nenhuma versão fixada de outro pacote
  pode mudar. Precedente da lição 10 da fase 0 — 5677 linhas de diff no lock que não mudavam
  versão nenhuma. Verifique, não suponha.

Se o `npm ls` mostrar mais de uma versão de `gray-matter` na árvore, **pare e reporte**.

### Dívida 7(a) — o `path` do Tina nunca foi comparado com a pasta do Zod

A revisão do plano 019 registrou: o teste de paridade compara o `name` da coleção, mas **nunca o
`path` do Tina contra a pasta que o `glob()` do Zod lê**. Trocar `path: 'content/linhas-pesquisa'`
por outra pasta passaria despercebido — divergência silenciosa da mesma família que a D-06
combate, e agora com uma consequência concreta: o painel gravaria numa pasta que o portão de
conteúdo deste plano nem varre.

Os dois lados, hoje:

| Coleção | `path` em `tina/config.ts` | `base:` do `glob()` em `src/content.config.ts` |
|---|---|---|
| `perfil` | `content/perfil` | `./content/perfil` (pattern `index.md`) |
| `linhas_pesquisa` | `content/linhas-pesquisa` | `./content/linhas-pesquisa` |
| `projetos` | `content/projetos` | `./content/projetos` |
| `disciplinas` | `content/disciplinas` | `./content/disciplinas` |
| `publicacoes` | `content/publicacoes` | `./content/publicacoes` |

**Como comparar, já que o `base:` não é introspectável em runtime:** `glob()` devolve um objeto
`Loader` que guarda o `base` em closure — `defineCollection` não o expõe. Extraia o valor **do
texto-fonte** de `src/content.config.ts` (o arquivo é lido com `readFileSync` e o `base:` casado
por regex), que é exatamente o que `tests/lib/config.test.ts` já faz para varrer `process.env`.
Normalize o `./` inicial antes de comparar. Se a extração por regex não achar as cinco coleções,
**falhe o teste** — extração silenciosamente vazia é rede de proteção falsa (foi a crítica que a
revisão do plano 015 fez à cobertura).

### Dívida 7(c) — a prova de falsificabilidade contra o artefato final

A prova de falsificabilidade do teste de paridade foi produzida com **11 testes**; o 12º foi
acrescentado depois e a prova nunca foi refeita contra o artefato final. Este plano acrescenta
mais testes ao mesmo arquivo — então **reproduza a prova do `compareFields` contra a suíte final**
(canário aninhado dentro de `aulas[]` ou dentro do grupo `en`, mostrando a falha e o retorno ao
verde). Custa dois comandos e fecha a dívida.

### Dívida 7(b) — deliberadamente NÃO resolvida aqui

A detecção de enum do lado Tina vem **depois** do ramo `campo.list` em `classifyTina`
(`tests/content/paridade-schema.test.ts:222-238`): um campo futuro com `list: true` **e**
`options: [...]` teria os valores de enum não comparados. **Não existe campo assim hoje**, e
mudá-lo agora seria alteração sem teste possível contra o schema real — o oposto do que este
projeto exige. Fica registrado como guarda para a **fase 3**, que é onde campo novo nasce. **Não
mexa em `classifyTina`.**

### Padrões da casa

- **Cabeçalho obrigatório de arquivo** (§10.1) e docstring em toda função nova (§10.2). Siga o
  cabeçalho de `tests/content/paridade-schema.test.ts`, que é o mais completo do projeto.
- **Teste novo tem de ser provado falsificável** (lição 9 da fase 0). Aqui são **três** canários
  distintos — ver passo 5.
- **Fixtures reais** (§11): o teste usa os arquivos verdadeiros de `content/`, não frontmatter
  sintético. Consequência aceita e que o cabeçalho do arquivo tem de registrar: a suíte passa a
  depender do conteúdo do repositório — é o ponto.
- **`git add` por caminho explícito.** `Status:` fica em `TODO`. Evidência é saída literal colada.
- Este plano **não muda schema**, então `npm run build` deve fechar verde sem depender de push.

## Passos

1. Ler `src/content.config.ts` (os cinco `defineCollection`, o `normalizeLinhaRelacionadaId` e sua
   docstring), `tests/content/paridade-schema.test.ts` inteiro e `tests/lib/config.test.ts` (o
   estilo de varredura de arquivos).
   → verify: você consegue explicar por que `safeParse` aceita `linha_relacionada: ''`.
2. Declarar `gray-matter` em `devDependencies` na versão exata já instalada.
   → verify: `npm ls gray-matter` colado (uma única instância); diff do `package-lock.json`
   conferido — nenhuma versão fixada de outro pacote alterada; `npm ci` não reescreve o lock.
3. Escrever `tests/content/conteudo-valido.test.ts`: varredura das cinco pastas, leitura com
   `gray-matter`, `safeParse` contra o schema correspondente e **verificação explícita de
   existência de `projetos.linha_relacionada`**, com mensagens no formato de F-09 agregadas numa
   lista.
   → verify: `npx vitest run tests/content/conteudo-valido.test.ts` verde sobre os 13 arquivos
   reais; cole a saída **e** o número de arquivos varridos (o teste deve afirmar que varreu > 0 em
   cada coleção — varredura vazia que "passa" é rede falsa).
4. Acrescentar a `tests/content/paridade-schema.test.ts` a comparação `path` (Tina) × `base:`
   (Zod), extraindo o `base:` do texto-fonte.
   → verify: `npx vitest run tests/content/paridade-schema.test.ts` verde, com as cinco coleções
   comparadas; cole a saída.
5. **Provar falsificabilidade — três canários, um de cada vez, cada um revertido antes do
   seguinte:**
   a. `linha_relacionada: ''` em `content/projetos/forcas-de-mare-em-espacos-tempos-de-kerr.md`
      — reproduz o artefato real de 2026-09-10;
   b. um campo obrigatório removido de um arquivo de `content/publicacoes/` (ex.: `ano`);
   c. `path` de uma coleção alterado só em `tina/config.ts`.
   → verify: para cada um, a saída da falha **com a mensagem que nomeia arquivo e campo**, seguida
   do verde após a reversão. Ao final, `git status --short` limpo e
   `git diff -- content tina/config.ts` **vazio**, colados.
6. Reproduzir a prova de falsificabilidade do `compareFields` contra o artefato final (dívida 7c):
   canário aninhado dentro de `aulas[]` ou do grupo `en`.
   → verify: falha e verde colados, com o total de testes do arquivo declarado nas duas execuções.
7. Rodar a sequência de qualidade local.
   → verify: `npm run lint`, `npm run format:check`, `npm run test:coverage` (cobertura ≥ 80%,
   com o total de testes novo) e `npm run build` verdes, saídas coladas; a do `build` **lida**.
8. Confirmar que o portão vale no deploy sem tocar no script: `npm run build:pipeline` roda
   `vitest run tests/content`, que agora inclui o portão novo.
   → verify: cole o trecho da saída de `npm run build:pipeline` mostrando o arquivo novo entre os
   testes executados.

## Critérios de aceitação

- [ ] `tests/content/conteudo-valido.test.ts` valida os **13 arquivos reais** de `content/` contra
      os cinco schemas Zod, descobrindo os arquivos por varredura
- [ ] O teste **falha** com `linha_relacionada: ''` — a asserção de existência é explícita, não
      delegada ao `safeParse`
- [ ] Toda mensagem de falha nomeia **o arquivo** (caminho relativo à raiz) **e o campo**,
      conforme F-09 e §8.2
- [ ] O teste afirma que varreu ao menos um arquivo por coleção — varredura vazia reprova
- [ ] `paridade-schema.test.ts` compara o `path` de cada coleção do Tina com o `base:` do `glob()`
      do Zod (dívida 7a), com extração que falha se não encontrar as cinco
- [ ] **Três canários de falsificabilidade** colados, com falha e verde, e `git diff` provando que
      nenhum sobrou
- [ ] Prova de falsificabilidade do `compareFields` reproduzida contra o artefato final
      (dívida 7c), com o total de testes declarado
- [ ] `classifyTina` **não modificada** — a dívida 7(b) fica registrada para a fase 3, não
      resolvida às cegas
- [ ] `gray-matter` declarado em `devDependencies` na versão exata; `npm ls gray-matter` com
      instância única; lockfile sem mudança de versão fixada de outro pacote
- [ ] `content/**`, `src/content.config.ts` e `tina/config.ts` **inalterados** no estado final
- [ ] Cabeçalho §10.1 e docstrings §10.2 no arquivo novo
- [ ] `npm run lint`, `npm run format:check`, `npm run test:coverage` (≥ 80%) e `npm run build`
      verdes, com a saída do build lida
- [ ] `npm run build:pipeline` executando o portão novo, com o trecho colado
- [ ] CI do GitHub Actions com `conclusion: success` no commit empurrado

## Evidência

<Preenchida pelo executor. Um teste que passa sem ter sido provado falsificável não é evidência de
nada — são três canários, mais o do `compareFields`.>
