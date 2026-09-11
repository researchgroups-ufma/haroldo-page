# Plano 031 — `tina/tina-lock.json` desatualizado passa a reprovar no CI

**Status:** TODO
**RFs cobertos:** RNF-09, R-02, D-06 (mesma família); **dívida 2** da fase 1
**Depende de:** nenhum plano de código. Pode rodar **em paralelo** com **030** e **033** — escopos
disjuntos, e este não toca `package.json`. **Não** rode em paralelo com 024, 032 ou 034: os quatro
editam `README.md`, em seções diferentes, e agentes simultâneos compartilham o mesmo working tree.
**Modelo recomendado:** sonnet
**Agente recomendado:** implementer
**Executável por:** **agente**
**PRD:** `S:\Projetos\academic_page\haroldo\PRD.md`
**Projeto:** `S:\Projetos\academic_page\haroldo`

## Objetivo

Um `tina/tina-lock.json` desatualizado em relação a `tina/config.ts` **reprova a suíte** — em vez
de seguir para `main` em silêncio e só aparecer como "No Tina config was found on main" no painel
do TinaCloud, dias depois, para quem não fez a mudança.

## Arquivos afetados

- `tests/content/tina-lock-coerente.test.ts` — **novo**
- `README.md` — a seção "Painel de edição" ganha uma frase dizendo que agora existe verificação
  automática do lock (o texto atual descreve o passo manual e continua correto; só a garantia
  muda)

> O executor não toca em arquivo fora desta lista. Se precisar, para e reporta.
> **Nunca rode `tinacms dev`** (servidor de longa duração) e **não regenere o lock**: se o teste
> novo reprovar contra o lock que está em `main`, isso é **achado a reportar** — significa que o
> lock versionado já está desatualizado, e a regeneração é do orquestrador, não deste plano.
> Também **não** edite `tina/config.ts`, `package.json` nem `.github/workflows/ci.yml`.

## Contexto necessário

**Projeto.** `haroldo-page` — Astro 7 + TinaCMS 3.12.1 / `@tinacms/cli` 2.6.1. Windows 11 /
PowerShell, Node 24.16.0, Vitest 4.1.11.

**A dívida, em uma frase:** `tina/tina-lock.json` é **versionado** — é o único artefato do Tina que
fica no repositório, porque o TinaCloud precisa dele em `main` para indexar a branch — e ele é
regenerado **apenas por `tinacms dev`**. `tinacms build --skip-cloud-checks` **não** o reescreve
(descoberto no plano 018, reconfirmado no 022). Ou seja: quem mudar o schema tem de subir o dev
server uma vez e commitar o lock, e **nada verifica se ele fez isso**.

O README já documenta o passo manual (seção "Painel de edição"): *"quem mudar o schema em
`tina/config.ts` precisa subir `npx tinacms dev` uma vez … e commitar o `tina/tina-lock.json`
atualizado junto com a mudança de schema."* Documentação não é portão — este plano vira o portão.

**Por que isso é da fase 2 e não ficou na 1:** a partir do plano 025 o `main` publica sozinho. Um
lock defasado não quebra o build nem o site (o site não depende do TinaCloud em runtime, §7.1,
F-03) — **quebra o `/admin`**, que é a ferramenta do professor. É exatamente a classe de falha
silenciosa que passa por todo o portão de qualidade, como a dívida 4.

### Como a verificação é possível sem rodar o `tinacms dev`

O lock é um JSON de linha única com, entre outras coisas, `schema.collections` — a **mesma árvore
declarativa** que `tina/config.ts` exporta — e uma seção `graphql`. Portanto:

- **Lado config:** importe `tina/config.ts` como o teste de paridade já faz. Ele importa `tinacms`,
  cujo bundle não carrega sob Vitest (interop CJS/ESM de `color-string`), então **copie o mesmo
  `vi.mock`** que `tests/content/paridade-schema.test.ts:78-82` usa:

  ```ts
  vi.mock('tinacms', () => ({ defineConfig: (config: unknown) => config }));
  const { default: tinaConfig } = await import('../../tina/config');
  ```

  O `defineConfig` real só valida e devolve o objeto; o mock preserva esse comportamento.

- **Lado lock:** `JSON.parse(readFileSync('tina/tina-lock.json', 'utf-8'))` e caminhe por
  `schema.collections`.

- **Compare o que é declarativo e serializável**, recursivamente: `name`, `path`, `format`,
  `type`, `required`, `list`, `options` e a árvore de `fields`. Monte, dos dois lados, o conjunto
  de caminhos qualificados (`disciplinas.scripts[].linguagem`, e assim por diante) e compare
  conjuntos, como `compareObjects` do teste de paridade já faz.

**⚠️ O que NÃO comparar:** tudo que é função ou apresentação — `ui`, `itemProps`, `defaultItem`,
`description`, `label`. Função não sobrevive à serialização JSON e a comparação daria falso
positivo permanente. Se você precisar ignorar campo por campo, a lista de chaves ignoradas fica
**explícita e comentada** no arquivo, não escondida num `try/catch`.

**Se a estrutura do lock não for a esperada** — se `schema.collections` não existir ou não bater
com a forma acima —, **pare e reporte** com o recorte real do JSON. Não invente um caminho
alternativo, e não caia em contagem de ocorrências de `"name":"x"` como aproximação: isso
detectaria adição de campo, mas não renomeação nem mudança de `required`, e daria uma sensação de
proteção que não existe.

**Referência do que uma mudança de schema produz no lock**, medida no plano 022 (Evidência do
orquestrador): acrescentar `scripts[]` a `disciplinas` acrescentou os nomes `scripts`, `linguagem`
e `aula`, três tipos GraphQL (`DisciplinasScripts`, `DisciplinasScriptsFilter`,
`DisciplinasScriptsMutation`), removeu zero, e o arquivo passou de 117.676 para 123.004 bytes.

### O que este plano NÃO faz

- ⛔ **Não regenera o lock**, não roda `tinacms dev`, não muda schema.
- ⛔ **Não acrescenta passo ao `ci.yml`.** O teste roda no `npm run test:coverage` que o CI já
  executa, e no `vitest run tests/content` que o `build:pipeline` (plano 024) já executa. Nenhum
  arquivo de workflow precisa mudar — confirme isso na Evidência em vez de presumir.
- ⛔ **Não tenta validar a seção `graphql`** do lock contra o SDL. Comparar a árvore declarativa
  basta para detectar lock defasado, e o SDL é derivado dela.
- ⛔ **Não mexe em `tests/content/paridade-schema.test.ts`** — o plano 030 está nele.

### Padrões da casa

- Cabeçalho §10.1 e docstrings §10.2. Use `tests/content/paridade-schema.test.ts` como modelo,
  inclusive na seção "Notas" do cabeçalho, onde a limitação assumida tem de ficar escrita: o teste
  compara a **forma declarativa**, não a validade do GraphQL gerado.
- **Teste novo tem de ser provado falsificável** — nos **dois sentidos** (campo só no config,
  campo só no lock).
- `git add` por caminho explícito; `Status:` fica em `TODO`; Evidência é saída literal colada.
- Este plano **não muda schema**, então `npm run build` fecha verde sem depender de push. Se
  aparecer `ERR_CLOUD_CHECK_FAILED`, é achado.

## Passos

1. Ler `tests/content/paridade-schema.test.ts` (o `vi.mock`, `compareObjects` e o cabeçalho), a
   seção "Painel de edição" do `README.md` e o recorte de `schema.collections` do
   `tina/tina-lock.json`.
   → verify: descreva na Evidência a estrutura real encontrada no lock — nome dos campos do
   primeiro nível de uma coleção —, colada do arquivo.
2. Escrever `tests/content/tina-lock-coerente.test.ts`: conjunto de caminhos qualificados dos dois
   lados, comparação de conjuntos e, para os caminhos em comum, comparação de `type`, `required`,
   `list` e `options`. Lista de chaves ignoradas explícita e comentada.
   → verify: `npx vitest run tests/content/tina-lock-coerente.test.ts` verde contra o lock em
   `main`; cole a saída **e** o número de caminhos comparados (se for zero ou suspeito de baixo,
   o teste tem de falhar por si — varredura vazia que passa é rede falsa).
3. Provar falsificabilidade nos dois sentidos, um canário de cada vez, revertido antes do
   seguinte:
   a. campo novo só em `tina/config.ts` → o teste falha nomeando o caminho ausente no lock;
   b. um campo removido do config, presente no lock → o teste falha no sentido oposto.
   → verify: as quatro execuções coladas (falha e verde de cada); ao final,
   `git diff -- tina/config.ts tina/tina-lock.json` **vazio**, colado.
4. Acrescentar ao `README.md`, na seção "Painel de edição", a frase de que a coerência do lock
   agora é verificada pela suíte, nomeando o arquivo de teste. **Não** reescreva o parágrafo do
   passo manual — ele continua sendo o procedimento correto.
   → verify: releia a seção inteira e confirme que nenhuma afirmação ficou falsa.
5. Confirmar que o teste roda nos dois lugares sem alterar workflow ou script.
   → verify: cole o trecho de `npm run test:coverage` e o de `npm run build:pipeline` mostrando o
   arquivo novo entre os testes executados.
6. Rodar a sequência de qualidade local.
   → verify: `npm run lint`, `npm run format:check`, `npm run test:coverage` (≥ 80%, com o total
   de testes novo) e `npm run build` verdes, saídas coladas; a do `build` **lida**.

## Critérios de aceitação

- [ ] `tests/content/tina-lock-coerente.test.ts` compara a árvore declarativa de `tina/config.ts`
      com `schema.collections` de `tina/tina-lock.json`, por caminhos qualificados
- [ ] `type`, `required`, `list` e `options` comparados nos caminhos em comum
- [ ] Chaves ignoradas (`ui`, `label`, `description`, funções) **listadas explicitamente e
      comentadas** no arquivo
- [ ] Número de caminhos comparados registrado; varredura vazia reprova
- [ ] **Falsificabilidade provada nos dois sentidos**, com as quatro saídas coladas e `git diff`
      vazio ao final
- [ ] O teste roda no `npm run test:coverage` (CI) **e** no `vitest run tests/content` do
      `build:pipeline`, sem alteração de workflow ou de script — comprovado por trecho de saída
- [ ] `tina/config.ts`, `tina/tina-lock.json`, `package.json` e `.github/workflows/ci.yml`
      **inalterados**
- [ ] `README.md` com a frase nova na seção "Painel de edição", sem invalidar o procedimento
      manual descrito ali
- [ ] Cabeçalho §10.1 e docstrings §10.2, com a limitação assumida escrita nas "Notas"
- [ ] `npm run lint`, `npm run format:check`, `npm run test:coverage` e `npm run build` verdes,
      com a saída do build lida
- [ ] CI do GitHub Actions com `conclusion: success` no commit empurrado

## Evidência

<Preenchida pelo executor. Se o teste reprovar contra o lock que está em `main`, **não regenere o
lock** — pare e reporte: é achado, e a regeneração é do orquestrador.>
