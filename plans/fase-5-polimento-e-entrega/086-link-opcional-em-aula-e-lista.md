# Plano 086 — Link opcional em aula e lista, e item vazio descartado no painel (RF-07, RF-24, F-09)

**Status:** TODO
**RFs cobertos:** **RF-07** e **RF-24** (aula e lista sem link); **F-09** e **RNF-09** (o painel não grava o que o build recusa); Aviso 2 de `docs/avisos-do-painel-para-o-manual.md`, na coleção `disciplinas`. Plano transversal: não fecha item do §12.
**Depende de:** nada. É urgente: o site está sem deploy desde 2026-11-20 16:32 UTC.
**Modelo recomendado:** sonnet
**Agente recomendado:** implementer
**Executável por:** agente + orquestrador (painel no Vivaldi e produção)
**PRD:** `S:\Projetos\academic_page\haroldo\PRD.md`
**Projeto:** `S:\Projetos\academic_page\haroldo`

## Objetivo

O professor monta o cronograma do semestre antes de ter o material. Para isso, aula e lista de
exercícios passam a aceitar ficar sem link: o link em branco vale como ausente, e a página mostra
o item sem link. Na coleção de disciplinas, o painel deixa de gravar item vazio (o "+" clicado à
toa) e recusa, com alerta, o item pela metade e o link que não é endereço. Com isso, o conteúdo de
hoje passa no portão **sem nenhuma edição em `content/`**.

## Por que (diagnóstico de 2026-11-21)

O vigia do deploy falhou em 2026-11-20 e 2026-11-21. Os dois builds do Workers Builds reprovaram
no primeiro passo do `build:pipeline`, `vitest run tests/content`, com dezenas de
`content/disciplinas/… → campo 'aulas.N.url': Invalid URL`.

O mecanismo: o Tina marca o "Link" como `required: true` e aceita qualquer texto não vazio,
enquanto o Zod exige `z.url()`. Para passar o "obrigatório", o professor gravou `' '`, `'  '` e
`AAAA`. O primeiro commit quebrado foi o `204edb4`, com `url: AAAA` e seis `- {}`. O último build
verde foi o `9128f6e`.

A causa foi bissectada commit a commit e provada ligando e desligando a falha: com os brancos
trocados por URL válida, o portão dá `145 passed`.

## Decisões do dono do produto (2026-11-21)

1. **Link opcional em `aulas[]` e `listas[]`** (opção 1 do diagnóstico). `materiais[]` e
   `links[]` continuam com link obrigatório: o item é o próprio link.
2. **A "Última aula" continua sendo a última da lista (RN-04, sem mudança de texto).** Se ela não
   tiver link:
   - na lista de aulas, o selo fica e o título sai sem link;
   - na capa da disciplina, o botão "Última aula" some;
   - em Ensino, o atalho "Última aula · N. título" sai como texto, sem link;
   - as marcas de progresso não mudam.
3. **Item vazio e item pela metade são tratados no mesmo plano**, por um `beforeSubmit` na coleção
   `disciplinas`, no molde do que a coleção `extensao` já tem (`tina/config.ts:934-948`).

## Antes do despacho (orquestrador)

- O clone local divergiu de `origin/main`. Do lado local há um commit ainda não empurrado,
  `a522c38` (só `docs/` e `plans/`). Do remoto, 163 saves do Tina (só `content/`). Rode
  `git pull --rebase` e confira que não houve conflito. O executor parte desse estado, com o
  conteúdo real do professor.
- **Saída "antes" do teste de regressão:** com o `main` rebaseado, `npx vitest run tests/content`
  tem de dar `1 failed | 144 passed`, com `Invalid URL` em `aulas.N.url`. Cole a saída na
  Evidência.

## Arquivos afetados

- `src/lib/course-items.ts` — **novo**: `blankToUndefined` e `prepareCourseItems` (funções puras, sem `astro:*` nem `zod`, porque o Tina importa este módulo no navegador)
- `tests/lib/course-items.test.ts` — **novo**
- `src/content.config.ts` — `url` de `aulaSchema` (359) e `listaSchema` (366) opcionais com branco→ausente; o mesmo pré-processamento nas já opcionais `bibliografiaSchema` (345) e `scriptSchema` (403)
- `tests/content/schemas.test.ts` — casos novos em `describe('coleção disciplinas')` (326)
- `tina/config.ts` — tirar o `required: true` do `url` de `aulas` (635) e `listas` (656); `ui.beforeSubmit` na coleção `disciplinas` (ui em 531)
- `tina/tina-lock.json` — regenerado (ver passo 3)
- `tests/content/tina-disciplinas.test.ts` — **novo**, no molde de `tests/content/tina-extensao.test.ts`
- `src/components/LessonList.astro` — título com link só quando há `url` (102)
- `src/components/CourseResources.astro` — título da lista com link só quando há `url` (71)
- `src/components/CourseCover.astro` — botão "Última aula" só quando `latest.url` (105–113)
- `src/views/TeachingView.astro` — atalho da última aula como texto quando não há `url` (148–158)
- `src/styles/global.css` — hover do cartão só quando há link (237–240)
- `tests/dist/site-gerado.test.ts` — `describe` novo
- `PRD.md` — §7.3 (460–461), RF-07 (206), RF-24 (227), versão e §0.1
- `docs/avisos-do-painel-para-o-manual.md` — Aviso 2

> O executor não toca em arquivo fora desta lista, **nem em nada de `content/`**: o conteúdo atual
> tem de passar como está. Se precisar, para e reporta. O `Status:` fica `TODO`. Não commite.

## Contexto necessário

**Zod 4.5.4 (`astro/zod`), formato verificado pelo orquestrador em 2026-11-21.** Só esta forma
aceita a chave ausente e o branco, e recusa o texto que não é URL:

```ts
url: z.preprocess(blankToUndefined, z.url().optional()),
```

| entrada | `z.preprocess(f, z.url().optional())` | `z.preprocess(f, z.url()).optional()` | `z.url().optional()` (hoje) |
|---|---|---|---|
| chave ausente | ok | ok | ok |
| `''`, `' '`, `'  '` | ok, com `url: undefined` (corrigido na revisão: a chave fica, com valor `undefined`) | **erro** "expected string" | erro "Invalid URL" |
| `'AAAA'` | erro "Invalid URL" | erro | erro |
| `'https://x.test/a'` | ok | ok | ok |

`blankToUndefined(v)` devolve `undefined` quando `v` é string só de espaço em branco (`trim() === ''`)
e devolve `v` intacto nos outros casos. O teste de paridade aceita a forma: `classifyZod` decide a
obrigatoriedade por `safeParse(undefined)` e segue o `pipe` até o núcleo
(`tests/content/paridade-schema.test.ts:144-189`). O TSDoc de `aulaSchema` e `listaSchema` passa a
citar este plano e a decisão 1.

**`prepareCourseItems(values)`**, exportada, com TSDoc. Recebe os `values` do formulário e devolve
`{ values, problems }`: `values` é o objeto com as listas limpas, e `problems` é um `string[]`
vazio quando o save pode seguir. Ela percorre as seis listas embutidas:

| Lista (rótulo no painel) | Obrigatórios | Link |
|---|---|---|
| `aulas` (Aulas) | `numero`, `titulo` | opcional |
| `listas` (Listas de exercícios) | `titulo` | opcional |
| `bibliografia` (Bibliografia) | `referencia` | opcional |
| `scripts` (Scripts) | `titulo`, `linguagem`, `codigo` | opcional |
| `materiais` (Materiais complementares) | `titulo`, `tipo`, `url` | obrigatório |
| `links` (Links externos) | `titulo`, `url` | obrigatório |

As regras de cada item:

- **Valor preenchido:** número finito, ou string com algo além de espaço. `undefined`, `null`,
  `''`, só espaço e `NaN` contam como vazios.
- **Item vazio:** nenhum valor preenchido. Em `scripts`, `linguagem` não conta, porque o
  `defaultItem` já a preenche com `python` (`tina/config.ts`, `defaultItem` de `scripts`). O item
  vazio sai da lista em silêncio.
- **Item pela metade:** algum campo preenchido e algum obrigatório vazio. Gera
  `"<Rótulo>, item <posição a partir de 1>: falta <campos com o label do painel, separados por vírgula>."`
- **Link inválido:** `url` preenchida em que `URL.canParse(url.trim())` é falso. Gera
  `"<Rótulo>, item <posição>: o link \"<valor>\" não é um endereço — comece com https://."`
- **Link opcional em branco:** a chave sai do item, para o arquivo não voltar a acumular `' '`.

O wrapper no `ui.beforeSubmit` de `disciplinas` repete o da `extensao`:

1. com `problems` não vazio, junta a mensagem como `'Não salvo: ' + problems.join(' ')`;
2. chama `cms.alerts.error(mensagem)` e depois `throw new Error(mensagem)`;
3. sem problemas, devolve `values`.

Comentário curto citando F-09, a dívida do Aviso 2 e o motivo de não usar `validate` (o mesmo de
`tina/config.ts:935-938`). O `ui.filename` atual de `disciplinas` fica como está.

**`URL.canParse` × `z.url()`.** O Zod continua sendo o portão. Em `tests/lib/course-items.test.ts`,
uma tabela de amostras (`'AAAA'`, `'https://x.test/a'`, `'http://x'`, `'ftp://h/a'`, `'x y'`,
`'https://'`) confere que o veredito de `prepareCourseItems` é o mesmo de `aulaSchema.safeParse`.
Importe o schema só no teste, nunca no módulo. Se alguma amostra divergir, pare e reporte: não
afrouxe o Zod para casar.

**Lock do Tina.** Tirar o `required` muda a forma declarativa e deixa o `tina/tina-lock.json`
defasado. Segundo o cabeçalho de `tests/content/tina-lock-coerente.test.ts`, o lock só se regenera
com `npx tinacms dev`: suba o comando, espere o lock mudar em disco e encerre. Quem julga é
`npm test -- tests/content/tina-lock-coerente.test.ts`.

**Renderização** (sem string nova de i18n, sem texto de "em breve"):

- `LessonList.astro`: `aula.url` presente → `<ExternalLink href={aula.url} class="cartao-link">`
  como hoje; ausente → o título num `<span>`, sem `cartao-link`. O selo "Última aula" segue a
  RN-04, sem mudança.
- `CourseResources.astro`: o mesmo para `lista.url`, mantendo `text-titulo-item`.
- `CourseCover.astro`: o bloco de botões aparece com `latest?.url || hasProblemSets`, e o botão
  "Última aula" só com `latest?.url`.
- `TeachingView.astro`: com `latest.url`, o `ExternalLink` de hoje; sem ela, o mesmo conteúdo
  (`N. título`) num `<span>`. A data e as marcas ficam iguais.
- `global.css`: `.cartao:hover` passa a `.cartao:has(.cartao-link):hover`, e o `:focus-within`
  fica. No `LessonList`, `.aula:hover .quadrado` passa a `.aula:has(.cartao-link):hover .quadrado`.
  Sem link, o cartão não pode parecer clicável. Hoje todo `.cartao` de `src/` tem `cartao-link`
  (conferido por grep em 2026-11-21); confira de novo antes de mudar.

Com `url` opcional, o `astro check` acusa `string | undefined` nos quatro componentes. Os pontos
acima são a correção esperada. Se o `astro check` apontar outro arquivo, pare e reporte.

**Asserções em `tests/dist/site-gerado.test.ts`**
(`describe('aula e lista sem link (plano 086, RF-24)')`): o esperado sai de `content/` via
`gray-matter`, como o teste já faz, nunca do `dist/`. Em toda disciplina publicada, nas rotas PT e
EN:

1. a lista de aulas tem um `<li>` por aula, e o número de `a.cartao-link` dentro dela é igual ao de
   aulas com `url` preenchida, com os `href` na mesma ordem;
2. o mesmo vale para as listas de exercícios, dentro de `#listas`;
3. na capa, o botão "Última aula" existe se e só se a última aula tem `url`;
4. em `/ensino` e `/en/teaching`, para cada disciplina `atual`, o atalho da última aula tem `<a>`
   se e só se ela tem `url`;
5. todo laço confere ao menos uma disciplina (`expect(n).toBeGreaterThan(0)`).

O conteúdo de hoje cobre os dois ramos: Física Moderna I tem aulas com e sem link, e Mecânica
Clássica I tem só aulas e listas sem link. Não fixe esses nomes nas asserções, porque o professor
segue editando. Compare atributo decodificado: o Astro escapa `&` como `&amp;`
(`node_modules/astro/dist/runtime/server/render/util.js:14`).

**PRD (o texto de §1–§11 muda, então a versão sobe para v0.1.82):**

- §7.3, linhas 460–461:
  - `aulas[]` passa a `{ numero, titulo, data?, descricao?, url? }`;
  - `listas[]` passa a `{ titulo, data_entrega?, url? }`;
  - nota curta: link em branco vale como ausente (plano 086).
- RF-07: "…com número, título, data e, quando houver, o link do material…".
- RF-24: "…e o link, quando houver, que abre o arquivo em nova aba; sem link, o item aparece sem
  link".
- §0.1: uma linha de até 150 caracteres. Atualize também a `Última atualização`.
- RN-04 **não** muda (decisão 2).

**`docs/avisos-do-painel-para-o-manual.md`, Aviso 2:**

- registrar que, desde o plano 086, a coleção `disciplinas` descarta o item vazio e recusa o pela
  metade com alerta;
- a instância que sobra é `publicacoes.autores[]`;
- o texto ao professor perde "aula, material, script" e ganha uma frase: o alerta "Não salvo: …"
  diz qual item completar;
- `Quando revisar` ganha a data 2026-11-21.

**Regras de código:** `plans/fase-5-polimento-e-entrega/README.md`, seção "Regras de código". Os
arquivos tocados recebem o cabeçalho §10.1 (Descrição quando mudar, `Atualizado em: 2026-11-21`,
`Versão`). O módulo novo leva o cabeçalho completo. Toda regra cita o identificador (`// RN-04: …`,
`// F-09: …`).

## Passos

1. **Teste vermelho primeiro.** Em `tests/content/schemas.test.ts`, aula e lista com `url` ausente,
   `''`, `' '` e `'  '` passam, `'AAAA'` reprova e a URL válida passa. O caso de bibliografia e
   script com `' '` também passa. Rode e cole a saída **vermelha** → depois o pré-processamento em
   `content.config.ts` → verify: a mesma saída verde, mais `npx vitest run tests/content` verde
   sobre o conteúdo real (a saída "depois" do teste de regressão).
2. `src/lib/course-items.ts` e seus testes. Cubra a tabela das seis listas (vazio sai, pela metade
   recusa com a mensagem exata, link inválido recusa, link opcional em branco perde a chave,
   `scripts` com só `linguagem` é vazio, lista ausente não quebra) e a paridade com `z.url()` →
   verify: `npm test -- tests/lib/course-items.test.ts` colado.
3. Tina: tirar os dois `required`, ligar o `beforeSubmit`, regenerar o lock;
   `tests/content/tina-disciplinas.test.ts` chama o `beforeSubmit` com um `cms` falso (descarta o
   vazio sem alerta; recusa o pela metade com o alerta e o `throw`; disciplina sem listas salva) →
   verify: `npm test -- tests/content` colado (paridade, lock e o teste novo verdes).
4. Renderização e CSS → verify: `npm run build:pipeline` colado.
5. Asserções 1–5 → verify: `npm run test:dist` colado.
6. **Canário A:** no `LessonList`, volte a sempre renderizar `<ExternalLink href={aula.url ?? ''}>`
   e refaça o build → a asserção 1 reprova. Desfaça e refaça o build → verify: as duas saídas
   coladas.
7. **Canário B:** em `aulaSchema`, troque o `url` por `z.url().optional()` (sem pré-processamento)
   → `npx vitest run tests/content` reprova com `Invalid URL` sobre o conteúdo real. Desfaça →
   verify: as duas saídas coladas.
8. **Canário C:** em `prepareCourseItems`, deixe de descartar o item vazio → os testes do passo 2 e
   do passo 3 reprovam. Desfaça → verify: as saídas coladas.
9. PRD e Aviso 2 → verify: `git diff --stat` e `npm test -- tests/lib/citacoes-do-prd.test.ts`
   (o teste do plano 054: toda citação de RF/RN/F/§ em `src/**` existe no PRD) colados.
10. Portão → verify: `npm run lint`, `npm run format:check`, `npm run test:coverage` colados.

### Orquestrador, depois do executor

11. **Painel, no Vivaldi**, em `http://localhost:4321/admin`, numa disciplina de teste e não nas
    do professor. **Não use `npm run dev`:** no Astro 7, ele deixa o servidor do Tina morto ("Failed
    loading TinaCMS assets", README, seção "Painel de edição"). Suba os dois servidores
    separadamente, com `npx astro dev --background --force` e `npx tinacms dev`. Ao fim, rode
    `npx astro dev stop` e encerre os processos `node` do `tinacms dev`. O painel local grava
    direto no disco, então descarte a disciplina de teste com `git status` e `git clean`/`git
    checkout` só nos arquivos dela. Verifique:
    - um "+" em Aulas sem preencher e Save → salva, e o arquivo gravado não tem o item;
    - uma aula com título e sem número → aparece o alerta "Não salvo: Aulas, item N: falta Número."
      e o arquivo não muda;
    - uma aula sem link → salva, sem chave `url`;
    - um link `AAAA` → alerta.

    Abra o arquivo gravado depois de cada save, não só a tela (memória: verificar no painel).
12. **Produção**, depois do push. O push depende de autorização do dono do produto. Verifique:
    - o check `Workers Builds: haroldo-page` do SHA **completo** do commit termina `success`;
    - a página de Física Moderna em produção mostra as aulas 7 em diante;
    - `gh workflow run vigia-do-deploy.yml` fica verde.

    **O CI `qualidade` vai continuar vermelho** pelo portão de `npm audit` (12 avisos publicados
    desde 2026-11-20, um deles `critical` no `tinacms`), que é um plano à parte. Confirme pelo log
    que o único passo reprovado é `node scripts/auditar-dependencias.mjs` e registre isso na
    Evidência. Um vermelho em qualquer outro passo é falha deste plano.

## Critérios de aceitação

- [x] Saída "antes" (portão de conteúdo vermelho sobre o conteúdo real) e "depois" (verde), coladas, sem nenhuma mudança em `content/`
- [x] Aula e lista aceitam link ausente ou em branco; `AAAA` reprova; bibliografia e script aceitam branco (passo 1)
- [x] `prepareCourseItems` com TSDoc e os testes das seis listas, verdes, incluindo a paridade com `z.url()`
- [x] `beforeSubmit` de `disciplinas` descarta o vazio e recusa o pela metade e o link inválido, com alerta (passo 3 e passo 11)
- [x] Item sem link renderiza sem link; "Última aula" segue a RN-04, com botão e atalho só quando há link (asserções 1–4, canários a–d)
- [x] Cartão sem link sem hover de clicável (navegador, passo 11; medido no Edge) — critério dividido pelo orquestrador no ciclo 2 da revisão: o hover é CSS e nenhuma asserção o cobre
- [x] Canários A, B e C vermelhos e desfeitos
- [x] PRD em v0.1.82 com §7.3, RF-07, RF-24 e §0.1; Aviso 2 atualizado
- [x] `lint`, `format:check`, `test:coverage`, `build:pipeline`, `test:dist` verdes, com saída colada
- [ ] Workers Builds `success` no SHA completo, vigia verde, e o CI vermelho só no passo de auditoria

## Evidência

<Preenchida pelo executor e pelo orquestrador, com saída literal capturada em arquivo (ver
`plans/DESPACHO.md`). Plano sem esta seção preenchida não é DONE.>


### Escopo desta execução
Executado pelo implementer em 2026-11-21. `Status:` continua `TODO`, sem commit. **Nada em `content/` foi tocado**, nem por canário (ver o bloco "Estado da árvore", no fim).

### Saída "antes" (capturada pelo orquestrador em 2026-11-21, `ec6025e`)

`npx vitest run tests/content` sobre o conteúdo real, antes de qualquer edição (arquivo `antes-portao-conteudo.txt`, inserido por script, sem edição). A última linha (`EXIT=1`) foi gravada pelo orquestrador na própria captura.

```

 RUN  v4.1.11 S:/Projetos/academic_page/haroldo

 ❯ tests/content/conteudo-valido.test.ts (2 tests | 1 failed) 79ms
     × todo arquivo passa no schema Zod correspondente, com projetos.linha_relacionada resolvida 72ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  tests/content/conteudo-valido.test.ts > conteúdo real de content/ — validação Zod com referência resolvida (F-09, dívida 5) > todo arquivo passa no schema Zod correspondente, com projetos.linha_relacionada resolvida
AssertionError: expected [ …(64) ] to deeply equal []

- Expected
+ Received

- []
+ [
+   "content/disciplinas/Fisica-Moderna.md → campo 'aulas.6.url': Invalid URL",
+   "content/disciplinas/Fisica-Moderna.md → campo 'aulas.7.url': Invalid URL",
+   "content/disciplinas/Fisica-Moderna.md → campo 'aulas.8.url': Invalid URL",
+   "content/disciplinas/Fisica-Moderna.md → campo 'aulas.9.url': Invalid URL",
+   "content/disciplinas/Fisica-Moderna.md → campo 'aulas.10.url': Invalid URL",
+   "content/disciplinas/Fisica-Moderna.md → campo 'aulas.11.url': Invalid URL",
+   "content/disciplinas/Fisica-Moderna.md → campo 'aulas.12.url': Invalid URL",
+   "content/disciplinas/Fisica-Moderna.md → campo 'aulas.13.url': Invalid URL",
+   "content/disciplinas/Fisica-Moderna.md → campo 'aulas.14.url': Invalid URL",
+   "content/disciplinas/Fisica-Moderna.md → campo 'aulas.15.url': Invalid URL",
+   "content/disciplinas/Fisica-Moderna.md → campo 'aulas.16.url': Invalid URL",
+   "content/disciplinas/Fisica-Moderna.md → campo 'aulas.17.url': Invalid URL",
+   "content/disciplinas/Fisica-Moderna.md → campo 'aulas.18.url': Invalid URL",
+   "content/disciplinas/Fisica-Moderna.md → campo 'aulas.19.url': Invalid URL",
+   "content/disciplinas/Fisica-Moderna.md → campo 'aulas.20.url': Invalid URL",
+   "content/disciplinas/Fisica-Moderna.md → campo 'aulas.21.url': Invalid URL",
+   "content/disciplinas/Fisica-Moderna.md → campo 'aulas.22.url': Invalid URL",
+   "content/disciplinas/Fisica-Moderna.md → campo 'aulas.23.url': Invalid URL",
+   "content/disciplinas/Fisica-Moderna.md → campo 'aulas.24.url': Invalid URL",
+   "content/disciplinas/Fisica-Moderna.md → campo 'aulas.25.url': Invalid URL",
+   "content/disciplinas/Fisica-Moderna.md → campo 'aulas.26.url': Invalid URL",
+   "content/disciplinas/mecanica-classica.md → campo 'aulas.0.url': Invalid URL",
+   "content/disciplinas/mecanica-classica.md → campo 'aulas.1.url': Invalid URL",
+   "content/disciplinas/mecanica-classica.md → campo 'aulas.2.url': Invalid URL",
+   "content/disciplinas/mecanica-classica.md → campo 'aulas.3.url': Invalid URL",
+   "content/disciplinas/mecanica-classica.md → campo 'aulas.4.url': Invalid URL",
+   "content/disciplinas/mecanica-classica.md → campo 'aulas.5.url': Invalid URL",
+   "content/disciplinas/mecanica-classica.md → campo 'aulas.6.url': Invalid URL",
+   "content/disciplinas/mecanica-classica.md → campo 'aulas.7.url': Invalid URL",
+   "content/disciplinas/mecanica-classica.md → campo 'aulas.8.url': Invalid URL",
+   "content/disciplinas/mecanica-classica.md → campo 'aulas.9.url': Invalid URL",
+   "content/disciplinas/mecanica-classica.md → campo 'aulas.10.url': Invalid URL",
+   "content/disciplinas/mecanica-classica.md → campo 'aulas.11.url': Invalid URL",
+   "content/disciplinas/mecanica-classica.md → campo 'aulas.12.url': Invalid URL",
+   "content/disciplinas/mecanica-classica.md → campo 'aulas.13.url': Invalid URL",
+   "content/disciplinas/mecanica-classica.md → campo 'aulas.14.url': Invalid URL",
+   "content/disciplinas/mecanica-classica.md → campo 'aulas.15.url': Invalid URL",
+   "content/disciplinas/mecanica-classica.md → campo 'aulas.16.url': Invalid URL",
+   "content/disciplinas/mecanica-classica.md → campo 'aulas.17.url': Invalid URL",
+   "content/disciplinas/mecanica-classica.md → campo 'aulas.18.url': Invalid URL",
+   "content/disciplinas/mecanica-classica.md → campo 'aulas.19.url': Invalid URL",
+   "content/disciplinas/mecanica-classica.md → campo 'aulas.20.url': Invalid URL",
+   "content/disciplinas/mecanica-classica.md → campo 'aulas.21.url': Invalid URL",
+   "content/disciplinas/mecanica-classica.md → campo 'aulas.22.url': Invalid URL",
+   "content/disciplinas/mecanica-classica.md → campo 'aulas.23.url': Invalid URL",
+   "content/disciplinas/mecanica-classica.md → campo 'aulas.24.url': Invalid URL",
+   "content/disciplinas/mecanica-classica.md → campo 'aulas.25.url': Invalid URL",
+   "content/disciplinas/mecanica-classica.md → campo 'aulas.26.url': Invalid URL",
+   "content/disciplinas/mecanica-classica.md → campo 'aulas.27.url': Invalid URL",
+   "content/disciplinas/mecanica-classica.md → campo 'aulas.28.url': Invalid URL",
+   "content/disciplinas/mecanica-classica.md → campo 'aulas.29.url': Invalid URL",
+   "content/disciplinas/mecanica-classica.md → campo 'aulas.30.url': Invalid URL",
+   "content/disciplinas/mecanica-classica.md → campo 'aulas.31.url': Invalid URL",
+   "content/disciplinas/mecanica-classica.md → campo 'aulas.32.url': Invalid URL",
+   "content/disciplinas/mecanica-classica.md → campo 'aulas.33.url': Invalid URL",
+   "content/disciplinas/mecanica-classica.md → campo 'aulas.34.url': Invalid URL",
+   "content/disciplinas/mecanica-classica.md → campo 'aulas.35.url': Invalid URL",
+   "content/disciplinas/mecanica-classica.md → campo 'aulas.36.url': Invalid URL",
+   "content/disciplinas/mecanica-classica.md → campo 'aulas.37.url': Invalid URL",
+   "content/disciplinas/mecanica-classica.md → campo 'aulas.38.url': Invalid URL",
+   "content/disciplinas/mecanica-classica.md → campo 'listas.0.url': Invalid URL",
+   "content/disciplinas/mecanica-classica.md → campo 'listas.1.url': Invalid URL",
+   "content/disciplinas/mecanica-classica.md → campo 'listas.2.url': Invalid URL",
+   "content/disciplinas/mecanica-classica.md → campo 'listas.3.url': Invalid URL",
+ ]

 ❯ tests/content/conteudo-valido.test.ts:167:19
    165|     }
    166|
    167|     expect(erros).toEqual([]);
       |                   ^
    168|   });
    169| });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯


 Test Files  1 failed | 5 passed (6)
      Tests  1 failed | 144 passed (145)
   Start at  17:17:45
   Duration  1.75s (transform 3.05s, setup 0ms, import 5.01s, tests 185ms, environment 1ms)

EXIT=1
```

### Passo 1 — teste vermelho primeiro (`tests/content/schemas.test.ts`)

Recapturado sobre o estado final do teste: os quatro `url` de `content.config.ts` voltam temporariamente à forma anterior (aula e lista `z.url()`, bibliografia e script `z.url().optional()`), `npx vitest run tests/content/schemas.test.ts`, e a edição é desfeita (`cmp` igual ao backup).

```

 RUN  v4.1.11 S:/Projetos/academic_page/haroldo

 ❯ tests/content/schemas.test.ts (120 tests | 10 failed) 48ms
       × aula com `url` ausente passa 4ms
       × aula com `url` vazio passa 1ms
       × aula com `url` um espaço passa 0ms
       × aula com `url` dois espaços passa 0ms
       × lista com `url` ausente passa 0ms
       × lista com `url` vazio passa 0ms
       × lista com `url` um espaço passa 0ms
       × lista com `url` dois espaços passa 0ms
       × `url` em branco sai do item parseado como `undefined` (vale como ausente) 0ms
       × bibliografia e script com `url` em branco passam; `AAAA` reprova 1ms
node.exe : 
No linha:1 caractere:1
+ & "C:\Program Files\nodejs/node.exe" "C:\Program Files\nodejs/node_mo ...
+ ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    + CategoryInfo          : NotSpecified: (:String) [], RemoteException
    + FullyQualifiedErrorId : NativeCommandError
 
⎯⎯⎯⎯⎯⎯ Failed Tests 10 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  tests/content/schemas.test.ts > coleção disciplinas > link opcional em aula e lista (plano 086, RF-07, RF-24) > 
aula com `url` ausente passa
 FAIL  tests/content/schemas.test.ts > coleção disciplinas > link opcional em aula e lista (plano 086, RF-07, RF-24) > 
aula com `url` vazio passa
 FAIL  tests/content/schemas.test.ts > coleção disciplinas > link opcional em aula e lista (plano 086, RF-07, RF-24) > 
aula com `url` um espaço passa
 FAIL  tests/content/schemas.test.ts > coleção disciplinas > link opcional em aula e lista (plano 086, RF-07, RF-24) > 
aula com `url` dois espaços passa
AssertionError: expected false to be true // Object.is equality

- Expected
+ Received

- true
+ false

 ❯ tests/content/schemas.test.ts:417:33
    415|         aulas: [{ numero: 1, titulo: 'Aula', ...extra }],
    416|       });
    417|       expect(resultado.success).toBe(true);
       |                                 ^
    418|     });
    419|

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/10]⎯

 FAIL  tests/content/schemas.test.ts > coleção disciplinas > link opcional em aula e lista (plano 086, RF-07, RF-24) > 
lista com `url` ausente passa
 FAIL  tests/content/schemas.test.ts > coleção disciplinas > link opcional em aula e lista (plano 086, RF-07, RF-24) > 
lista com `url` vazio passa
 FAIL  tests/content/schemas.test.ts > coleção disciplinas > link opcional em aula e lista (plano 086, RF-07, RF-24) > 
lista com `url` um espaço passa
 FAIL  tests/content/schemas.test.ts > coleção disciplinas > link opcional em aula e lista (plano 086, RF-07, RF-24) > 
lista com `url` dois espaços passa
AssertionError: expected false to be true // Object.is equality

- Expected
+ Received

- true
+ false

 ❯ tests/content/schemas.test.ts:425:33
    423|         listas: [{ titulo: 'Lista', ...extra }],
    424|       });
    425|       expect(resultado.success).toBe(true);
       |                                 ^
    426|     });
    427|

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/10]⎯

 FAIL  tests/content/schemas.test.ts > coleção disciplinas > link opcional em aula e lista (plano 086, RF-07, RF-24) > 
`url` em branco sai do item parseado como `undefined` (vale como ausente)
AssertionError: expected false to be true // Object.is equality

- Expected
+ Received

- true
+ false

 ❯ tests/content/schemas.test.ts:433:33
    431|         aulas: [{ numero: 1, titulo: 'Aula', url: ' ' }],
    432|       });
    433|       expect(resultado.success).toBe(true);
       |                                 ^
    434|       expect(resultado.success && resultado.data.aulas?.[0]?.url).toBe…
    435|     });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[3/10]⎯

 FAIL  tests/content/schemas.test.ts > coleção disciplinas > link opcional em aula e lista (plano 086, RF-07, RF-24) > 
bibliografia e script com `url` em branco passam; `AAAA` reprova
AssertionError: expected false to be true // Object.is equality

- Expected
+ Received

- true
+ false

 ❯ tests/content/schemas.test.ts:465:11
    463|           disciplinasSchema.safeParse({ ...valido, bibliografia: [{ re…
    464|             .success,
    465|         ).toBe(true);
       |           ^
    466|         expect(
    467|           disciplinasSchema.safeParse({ ...valido, scripts: [{ ...scri…

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[4/10]⎯


 Test Files  1 failed (1)
      Tests  10 failed | 110 passed (120)
   Start at  17:55:40
   Duration  1.27s (transform 647ms, setup 0ms, import 995ms, tests 48ms, environment 0ms)

EXIT=1
```

### Passo 1 — a mesma suíte verde, depois do pré-processamento em `content.config.ts`

Com o código final.

```

 RUN  v4.1.11 S:/Projetos/academic_page/haroldo


 Test Files  1 passed (1)
      Tests  120 passed (120)
   Start at  17:55:50
   Duration  1.19s (transform 645ms, setup 0ms, import 993ms, tests 44ms, environment 0ms)

EXIT=0
```

### Passo 1 — saída "depois": `npx vitest run tests/content` sobre o conteúdo real, sem nenhuma mudança em `content/`

O bloco "Estado da árvore", no fim, não lista nada em `content/`. Capturada depois do passo 3 (a paridade com o Tina só fica verde depois de tirar os dois `required`).

```

 RUN  v4.1.11 S:/Projetos/academic_page/haroldo


 Test Files  7 passed (7)
      Tests  166 passed (166)
   Start at  17:55:54
   Duration  1.41s (transform 2.33s, setup 0ms, import 4.05s, tests 168ms, environment 1ms)

EXIT=0
```

### Passo 2 — `npm test -- tests/lib/course-items.test.ts`

O módulo e o teste saíram no mesmo passo, e a suíte já nasceu verde; a prova de que os testes reprovam sem a regra é o canário C (abaixo).

```

 RUN  v4.1.11 S:/Projetos/academic_page/haroldo


 Test Files  1 passed (1)
      Tests  41 passed (41)
   Start at  18:02:24
   Duration  1.15s (transform 633ms, setup 0ms, import 976ms, tests 15ms, environment 0ms)

EXIT=0
```

### Passo 3 — lock do Tina regenerado (`npx tinacms dev -c "echo ready"`)

Forma do README da fase 4 (item 5 de "Por onde isto pode dar errado"): o comando regenera o lock e termina sozinho. `tina/tina-lock.json` mudou de 2026-10-07 17:06:34 para 2026-11-21 17:21:13 (1 linha). Depois, as portas 9000 e 4001 estavam livres e nenhum `node` do Tina permaneceu.

```
🦙 TinaCMS Dev Server is initializing...

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
Running web application with command: echo ready
node.exe : [2K[1GIndexing local files ⠋[2K[1GIndexing local files ⠙(node:4688) [DEP0190] DeprecationWarning: 
Passing args to a child process with shell option true can lead to security vulnerabilities, as the arguments are not 
escaped, only concatenated.
No linha:1 caractere:1
+ & "C:\Program Files\nodejs/node.exe" "C:\Program Files\nodejs/node_mo ...
+ ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    + CategoryInfo          : NotSpecified: ([2K[1GIndexin...y concatenated.:String) [], RemoteException
    + FullyQualifiedErrorId : NativeCommandError
 
(Use `node --trace-deprecation ...` to show where the warning was created)
ready
child process exited with code 0
EXIT=0
```

### Passo 3 — `npm test -- tests/content` (paridade, lock e `tina-disciplinas` verdes)

```

> haroldo-page@0.1.0 test
> vitest run tests/content


 RUN  v4.1.11 S:/Projetos/academic_page/haroldo


 Test Files  7 passed (7)
      Tests  166 passed (166)
   Start at  18:02:27
   Duration  1.45s (transform 2.55s, setup 0ms, import 4.38s, tests 155ms, environment 1ms)

EXIT=0
```

### Passo 4 — `npm run build:pipeline` (build final, depois de desfeito o canário A)

O primeiro build do passo 4 (17:23, antes dos canários) saiu com `EXIT=0`; este é o build que descreve o `dist/` final, refeito depois de desfazer o canário A (item 14 do DESPACHO). O `LessonList.astro` desfeito é byte a byte igual ao de antes do canário (`cmp`). O `astro check` do build imprime `0 errors`.

```

> haroldo-page@0.1.0 build:pipeline
> vitest run tests/content && tinacms build --skip-cloud-checks && astro check && astro build


 RUN  v4.1.11 S:/Projetos/academic_page/haroldo


 Test Files  7 passed (7)
      Tests  166 passed (166)
   Start at  18:02:43
   Duration  1.42s (transform 2.39s, setup 0ms, import 4.20s, tests 150ms, environment 1ms)

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
18:03:13 [content] Syncing content
18:03:13 [content] Synced content
18:03:13 [types] Generated 584ms
18:03:13 [check] Getting diagnostics for Astro files in S:\Projetos\academic_page\haroldo...
Result (116 files): 
- 0 errors
- 0 warnings
- 0 hints

18:03:24 [content] Syncing content
18:03:24 [content] Synced content
18:03:24 [types] Generated 583ms
18:03:24 [build] output: "static"
18:03:24 [build] mode: "static"
18:03:24 [build] directory: S:\Projetos\academic_page\haroldo\dist\
18:03:24 [build] Collecting build info...
18:03:24 [build] ✓ Completed in 618ms.
18:03:24 [build] Building static entrypoints...
18:03:24 [WARN] [vite] [lightningcss minify] 'global' is not recognized as a valid pseudo-class. Did you mean '::global' (pseudo-element) or is this a typo?
25 |  }
26 |  
27 |  .carrossel[data-astro-cid-bkddzv6o]:not(:global(.pronto)) .miniatura[data-astro-cid-bkddzv6o] {
   |                                                  ^
28 |    opacity: 1;
29 |  }
18:03:24 [vite] ✓ built in 454ms
18:03:24 [vite] ✓ built in 108ms
18:03:24 [build] Rearranging server assets...

 generating static routes 
18:03:24   ├─ /404.html (+12ms) 
18:03:24   ├─ /en/404/index.html (+4ms) 
18:03:24   ├─ /en/about/index.html (+7ms) 
18:03:24   ├─ /en/outreach/ifma-pedreiras/index.html (+3ms) 
18:03:24   ├─ /en/outreach/ufma-bacabal/index.html (+2ms) 
18:03:24   ├─ /en/outreach/index.html (+5ms) 
18:03:24   ├─ /en/publications/index.html (+8ms) 
18:03:24   ├─ /en/research/index.html (+7ms) 
18:03:24   ├─ /en/teaching/fisica-moderna/index.html (+80ms) 
18:03:25   ├─ /en/teaching/mecanica-classica/index.html (+4ms) 
18:03:25   ├─ /en/teaching/index.html (+8ms) 
18:03:25   ├─ /en/index.html (+16ms) 
18:03:25   ├─ /ensino/fisica-moderna/index.html (+16ms) 
18:03:25   ├─ /ensino/mecanica-classica/index.html (+2ms) 
18:03:25   ├─ /ensino/index.html (+3ms) 
18:03:25   ├─ /extensao/ifma-pedreiras/index.html (+3ms) 
18:03:25   ├─ /extensao/ufma-bacabal/index.html (+1ms) 
18:03:25   ├─ /extensao/index.html (+4ms) 
18:03:25   ├─ /pesquisa/index.html (+4ms) 
18:03:25   ├─ /publicacoes/index.html (+13ms) 
18:03:25   ├─ /sobre/index.html (+5ms) 
18:03:25   ├─ /index.html (+3ms) 
18:03:25 ✓ Completed in 263ms.

18:03:25 [build] ✓ Completed in 907ms.
18:03:25 [@astrojs/sitemap] `sitemap-index.xml` created at `dist`
18:03:25 [build] 22 page(s) built in 1.56s
18:03:25 [build] Complete!
EXIT=0
```

### Passo 5 — `npm run test:dist` (asserções 1 a 5 em `describe('aula e lista sem link (plano 086, RF-24)')`)

Capturado depois da última edição do arquivo de teste.

```

> haroldo-page@0.1.0 test:dist
> vitest run -c vitest.dist.config.ts


 RUN  v4.1.11 S:/Projetos/academic_page/haroldo


 Test Files  2 passed (2)
      Tests  59 passed (59)
   Start at  18:03:27
   Duration  686ms (transform 185ms, setup 0ms, import 350ms, tests 474ms, environment 0ms)

EXIT=0
```

### Passo 6 — canário A: `LessonList` sempre renderiza `<ExternalLink href={aula.url ?? ''}>`

Build com o canário (EXIT=0; o Astro grava `<a href class="cartao-link">`, sem valor, para `href=""`), e `test:dist` reprovando a asserção 1.

```

> haroldo-page@0.1.0 build:pipeline
> vitest run tests/content && tinacms build --skip-cloud-checks && astro check && astro build


 RUN  v4.1.11 S:/Projetos/academic_page/haroldo


 Test Files  7 passed (7)
      Tests  166 passed (166)
   Start at  18:01:28
   Duration  1.41s (transform 2.47s, setup 0ms, import 4.19s, tests 149ms, environment 1ms)

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
18:01:59 [content] Syncing content
18:01:59 [content] Synced content
18:01:59 [types] Generated 575ms
18:01:59 [check] Getting diagnostics for Astro files in S:\Projetos\academic_page\haroldo...
Result (116 files): 
- 0 errors
- 0 warnings
- 0 hints

18:02:09 [content] Syncing content
18:02:09 [content] Synced content
18:02:09 [types] Generated 559ms
18:02:09 [build] output: "static"
18:02:09 [build] mode: "static"
18:02:09 [build] directory: S:\Projetos\academic_page\haroldo\dist\
18:02:09 [build] Collecting build info...
18:02:09 [build] ✓ Completed in 605ms.
18:02:09 [build] Building static entrypoints...
18:02:10 [WARN] [vite] [lightningcss minify] 'global' is not recognized as a valid pseudo-class. Did you mean '::global' (pseudo-element) or is this a typo?
25 |  }
26 |  
27 |  .carrossel[data-astro-cid-bkddzv6o]:not(:global(.pronto)) .miniatura[data-astro-cid-bkddzv6o] {
   |                                                  ^
28 |    opacity: 1;
29 |  }
18:02:10 [vite] ✓ built in 477ms
18:02:10 [vite] ✓ built in 95ms
18:02:10 [build] Rearranging server assets...

 generating static routes 
18:02:10   ├─ /404.html (+13ms) 
18:02:10   ├─ /en/404/index.html (+5ms) 
18:02:10   ├─ /en/about/index.html (+7ms) 
18:02:10   ├─ /en/outreach/ifma-pedreiras/index.html (+3ms) 
18:02:10   ├─ /en/outreach/ufma-bacabal/index.html (+2ms) 
18:02:10   ├─ /en/outreach/index.html (+5ms) 
18:02:10   ├─ /en/publications/index.html (+8ms) 
18:02:10   ├─ /en/research/index.html (+7ms) 
18:02:10   ├─ /en/teaching/fisica-moderna/index.html (+78ms) 
18:02:10   ├─ /en/teaching/mecanica-classica/index.html (+15ms) 
18:02:10   ├─ /en/teaching/index.html (+8ms) 
18:02:10   ├─ /en/index.html (+16ms) 
18:02:10   ├─ /ensino/fisica-moderna/index.html (+15ms) 
18:02:10   ├─ /ensino/mecanica-classica/index.html (+3ms) 
18:02:10   ├─ /ensino/index.html (+4ms) 
18:02:10   ├─ /extensao/ifma-pedreiras/index.html (+2ms) 
18:02:10   ├─ /extensao/ufma-bacabal/index.html (+1ms) 
18:02:10   ├─ /extensao/index.html (+3ms) 
18:02:10   ├─ /pesquisa/index.html (+3ms) 
18:02:10   ├─ /publicacoes/index.html (+5ms) 
18:02:10   ├─ /sobre/index.html (+3ms) 
18:02:10   ├─ /index.html (+2ms) 
18:02:10 ✓ Completed in 263ms.

18:02:10 [build] ✓ Completed in 923ms.
18:02:10 [@astrojs/sitemap] `sitemap-index.xml` created at `dist`
18:02:10 [build] 22 page(s) built in 1.59s
18:02:10 [build] Complete!
EXIT=0
```

```

> haroldo-page@0.1.0 test:dist
> vitest run -c vitest.dist.config.ts


 RUN  v4.1.11 S:/Projetos/academic_page/haroldo

 ❯ tests/dist/site-gerado.test.ts (49 tests | 1 failed) 268ms
     × aulas: um <li> por item e um link só nos que têm url, na mesma ordem 8ms
node.exe : 
No linha:1 caractere:1
+ & "C:\Program Files\nodejs/node.exe" "C:\Program Files\nodejs/node_mo ...
+ ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    + CategoryInfo          : NotSpecified: (:String) [], RemoteException
    + FullyQualifiedErrorId : NativeCommandError
 
⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  tests/dist/site-gerado.test.ts > aula e lista sem link (plano 086, RF-24) > aulas: um <li> por item e um link 
só nos que têm url, na mesma ordem
AssertionError: pt/fisica-moderna aulas: links: expected [ …(27) ] to deeply equal [ …(6) ]

- Expected
+ Received

@@ -3,6 +3,27 @@
    "https://exemplo.invalid/rg-2026-2/aula-02",
    "https://exemplo.invalid/rg-2026-2/aula-03",
    "https://exemplo.invalid/rg-2026-2/aula-04",
    "https://exemplo.invalid/rg-2026-2/aula-05",
    "https://exemplo.invalid/rg-2026-2/aula-06",
+   "",
+   "",
+   "",
+   "",
+   "",
+   "",
+   "",
+   "",
+   "",
+   "",
+   "",
+   "",
+   "",
+   "",
+   "",
+   "",
+   "",
+   "",
+   "",
+   "",
+   "",
  ]

 ❯ tests/dist/site-gerado.test.ts:849:90
    847|         const itemCount = section.split(`<li class="${cls}`).length - …
    848|         expect(itemCount, `${locale}/${course.slug} ${id}: <li>`).toBe…
    849|         expect(linksOf(section, 'cartao-link'), `${locale}/${course.sl…
       |                                                                                          ^
    850|           items.filter(hasUrl).map((item) => item.url?.trim()),
    851|         );

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯


 Test Files  1 failed | 1 passed (2)
      Tests  1 failed | 58 passed (59)
   Start at  18:02:12
   Duration  664ms (transform 177ms, setup 0ms, import 338ms, tests 459ms, environment 0ms)

EXIT=1
```

### Passo 6 — canário A desfeito (edição de volta, sem `git checkout`), build refeito e `test:dist` verde

O build refeito é o bloco do passo 4; abaixo, o `test:dist` sobre ele.

```

> haroldo-page@0.1.0 test:dist
> vitest run -c vitest.dist.config.ts


 RUN  v4.1.11 S:/Projetos/academic_page/haroldo


 Test Files  2 passed (2)
      Tests  59 passed (59)
   Start at  18:03:27
   Duration  686ms (transform 185ms, setup 0ms, import 350ms, tests 474ms, environment 0ms)

EXIT=0
```

### Passo 7 — canário B: `url` de `aulaSchema` como `z.url().optional()`

`npx vitest run tests/content` reprova com `Invalid URL` sobre o conteúdo real (e 4 casos de `schemas.test.ts`).

```

 RUN  v4.1.11 S:/Projetos/academic_page/haroldo

 ❯ tests/content/schemas.test.ts (120 tests | 4 failed) 53ms
       × aula com `url` vazio passa 4ms
       × aula com `url` um espaço passa 1ms
       × aula com `url` dois espaços passa 0ms
       × `url` em branco sai do item parseado como `undefined` (vale como ausente) 0ms
 ❯ tests/content/conteudo-valido.test.ts (2 tests | 1 failed) 63ms
     × todo arquivo passa no schema Zod correspondente, com projetos.linha_relacionada resolvida 59ms
node.exe : 
No linha:1 caractere:1
+ & "C:\Program Files\nodejs/node.exe" "C:\Program Files\nodejs/node_mo ...
+ ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    + CategoryInfo          : NotSpecified: (:String) [], RemoteException
    + FullyQualifiedErrorId : NativeCommandError
 
⎯⎯⎯⎯⎯⎯⎯ Failed Tests 5 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  tests/content/conteudo-valido.test.ts > conteúdo real de content/ — validação Zod com referência resolvida 
(F-09, dívida 5) > todo arquivo passa no schema Zod correspondente, com projetos.linha_relacionada resolvida
AssertionError: expected [ …(60) ] to deeply equal []

- Expected
+ Received

- []
+ [
+   "content/disciplinas/Fisica-Moderna.md → campo 'aulas.6.url': Invalid URL",
+   "content/disciplinas/Fisica-Moderna.md → campo 'aulas.7.url': Invalid URL",
+   "content/disciplinas/Fisica-Moderna.md → campo 'aulas.8.url': Invalid URL",
+   "content/disciplinas/Fisica-Moderna.md → campo 'aulas.9.url': Invalid URL",
+   "content/disciplinas/Fisica-Moderna.md → campo 'aulas.10.url': Invalid URL",
+   "content/disciplinas/Fisica-Moderna.md → campo 'aulas.11.url': Invalid URL",
+   "content/disciplinas/Fisica-Moderna.md → campo 'aulas.12.url': Invalid URL",
+   "content/disciplinas/Fisica-Moderna.md → campo 'aulas.13.url': Invalid URL",
+   "content/disciplinas/Fisica-Moderna.md → campo 'aulas.14.url': Invalid URL",
+   "content/disciplinas/Fisica-Moderna.md → campo 'aulas.15.url': Invalid URL",
+   "content/disciplinas/Fisica-Moderna.md → campo 'aulas.16.url': Invalid URL",
+   "content/disciplinas/Fisica-Moderna.md → campo 'aulas.17.url': Invalid URL",
+   "content/disciplinas/Fisica-Moderna.md → campo 'aulas.18.url': Invalid URL",
+   "content/disciplinas/Fisica-Moderna.md → campo 'aulas.19.url': Invalid URL",
+   "content/disciplinas/Fisica-Moderna.md → campo 'aulas.20.url': Invalid URL",
+   "content/disciplinas/Fisica-Moderna.md → campo 'aulas.21.url': Invalid URL",
+   "content/disciplinas/Fisica-Moderna.md → campo 'aulas.22.url': Invalid URL",
+   "content/disciplinas/Fisica-Moderna.md → campo 'aulas.23.url': Invalid URL",
+   "content/disciplinas/Fisica-Moderna.md → campo 'aulas.24.url': Invalid URL",
+   "content/disciplinas/Fisica-Moderna.md → campo 'aulas.25.url': Invalid URL",
+   "content/disciplinas/Fisica-Moderna.md → campo 'aulas.26.url': Invalid URL",
+   "content/disciplinas/mecanica-classica.md → campo 'aulas.0.url': Invalid URL",
+   "content/disciplinas/mecanica-classica.md → campo 'aulas.1.url': Invalid URL",
+   "content/disciplinas/mecanica-classica.md → campo 'aulas.2.url': Invalid URL",
+   "content/disciplinas/mecanica-classica.md → campo 'aulas.3.url': Invalid URL",
+   "content/disciplinas/mecanica-classica.md → campo 'aulas.4.url': Invalid URL",
+   "content/disciplinas/mecanica-classica.md → campo 'aulas.5.url': Invalid URL",
+   "content/disciplinas/mecanica-classica.md → campo 'aulas.6.url': Invalid URL",
+   "content/disciplinas/mecanica-classica.md → campo 'aulas.7.url': Invalid URL",
+   "content/disciplinas/mecanica-classica.md → campo 'aulas.8.url': Invalid URL",
+   "content/disciplinas/mecanica-classica.md → campo 'aulas.9.url': Invalid URL",
+   "content/disciplinas/mecanica-classica.md → campo 'aulas.10.url': Invalid URL",
+   "content/disciplinas/mecanica-classica.md → campo 'aulas.11.url': Invalid URL",
+   "content/disciplinas/mecanica-classica.md → campo 'aulas.12.url': Invalid URL",
+   "content/disciplinas/mecanica-classica.md → campo 'aulas.13.url': Invalid URL",
+   "content/disciplinas/mecanica-classica.md → campo 'aulas.14.url': Invalid URL",
+   "content/disciplinas/mecanica-classica.md → campo 'aulas.15.url': Invalid URL",
+   "content/disciplinas/mecanica-classica.md → campo 'aulas.16.url': Invalid URL",
+   "content/disciplinas/mecanica-classica.md → campo 'aulas.17.url': Invalid URL",
+   "content/disciplinas/mecanica-classica.md → campo 'aulas.18.url': Invalid URL",
+   "content/disciplinas/mecanica-classica.md → campo 'aulas.19.url': Invalid URL",
+   "content/disciplinas/mecanica-classica.md → campo 'aulas.20.url': Invalid URL",
+   "content/disciplinas/mecanica-classica.md → campo 'aulas.21.url': Invalid URL",
+   "content/disciplinas/mecanica-classica.md → campo 'aulas.22.url': Invalid URL",
+   "content/disciplinas/mecanica-classica.md → campo 'aulas.23.url': Invalid URL",
+   "content/disciplinas/mecanica-classica.md → campo 'aulas.24.url': Invalid URL",
+   "content/disciplinas/mecanica-classica.md → campo 'aulas.25.url': Invalid URL",
+   "content/disciplinas/mecanica-classica.md → campo 'aulas.26.url': Invalid URL",
+   "content/disciplinas/mecanica-classica.md → campo 'aulas.27.url': Invalid URL",
+   "content/disciplinas/mecanica-classica.md → campo 'aulas.28.url': Invalid URL",
+   "content/disciplinas/mecanica-classica.md → campo 'aulas.29.url': Invalid URL",
+   "content/disciplinas/mecanica-classica.md → campo 'aulas.30.url': Invalid URL",
+   "content/disciplinas/mecanica-classica.md → campo 'aulas.31.url': Invalid URL",
+   "content/disciplinas/mecanica-classica.md → campo 'aulas.32.url': Invalid URL",
+   "content/disciplinas/mecanica-classica.md → campo 'aulas.33.url': Invalid URL",
+   "content/disciplinas/mecanica-classica.md → campo 'aulas.34.url': Invalid URL",
+   "content/disciplinas/mecanica-classica.md → campo 'aulas.35.url': Invalid URL",
+   "content/disciplinas/mecanica-classica.md → campo 'aulas.36.url': Invalid URL",
+   "content/disciplinas/mecanica-classica.md → campo 'aulas.37.url': Invalid URL",
+   "content/disciplinas/mecanica-classica.md → campo 'aulas.38.url': Invalid URL",
+ ]

 ❯ tests/content/conteudo-valido.test.ts:167:19
    165|     }
    166|
    167|     expect(erros).toEqual([]);
       |                   ^
    168|   });
    169| });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/5]⎯

 FAIL  tests/content/schemas.test.ts > coleção disciplinas > link opcional em aula e lista (plano 086, RF-07, RF-24) > 
aula com `url` vazio passa
 FAIL  tests/content/schemas.test.ts > coleção disciplinas > link opcional em aula e lista (plano 086, RF-07, RF-24) > 
aula com `url` um espaço passa
 FAIL  tests/content/schemas.test.ts > coleção disciplinas > link opcional em aula e lista (plano 086, RF-07, RF-24) > 
aula com `url` dois espaços passa
AssertionError: expected false to be true // Object.is equality

- Expected
+ Received

- true
+ false

 ❯ tests/content/schemas.test.ts:417:33
    415|         aulas: [{ numero: 1, titulo: 'Aula', ...extra }],
    416|       });
    417|       expect(resultado.success).toBe(true);
       |                                 ^
    418|     });
    419|

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/5]⎯

 FAIL  tests/content/schemas.test.ts > coleção disciplinas > link opcional em aula e lista (plano 086, RF-07, RF-24) > 
`url` em branco sai do item parseado como `undefined` (vale como ausente)
AssertionError: expected false to be true // Object.is equality

- Expected
+ Received

- true
+ false

 ❯ tests/content/schemas.test.ts:433:33
    431|         aulas: [{ numero: 1, titulo: 'Aula', url: ' ' }],
    432|       });
    433|       expect(resultado.success).toBe(true);
       |                                 ^
    434|       expect(resultado.success && resultado.data.aulas?.[0]?.url).toBe…
    435|     });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[3/5]⎯


 Test Files  2 failed | 5 passed (7)
      Tests  5 failed | 161 passed (166)
   Start at  18:03:40
   Duration  1.44s (transform 2.37s, setup 0ms, import 4.17s, tests 159ms, environment 1ms)

EXIT=1
```

### Passo 7 — canário B desfeito

`src/content.config.ts` igual ao de antes do canário (`cmp`).

```

 RUN  v4.1.11 S:/Projetos/academic_page/haroldo


 Test Files  7 passed (7)
      Tests  166 passed (166)
   Start at  18:03:45
   Duration  1.45s (transform 2.43s, setup 0ms, import 4.30s, tests 166ms, environment 1ms)

EXIT=0
```

### Passo 8 — canário C: `prepareCourseItems` deixa de descartar o item vazio

`npx vitest run tests/lib/course-items.test.ts tests/content/tina-disciplinas.test.ts`.

```

 RUN  v4.1.11 S:/Projetos/academic_page/haroldo

 ❯ tests/content/tina-disciplinas.test.ts (6 tests | 1 failed) 13ms
     × descarta em silêncio o item vazio (o "+" clicado à toa) e mantém os completos 8ms
 ❯ tests/lib/course-items.test.ts (41 tests | 10 failed) 22ms
     × aulas: {} é descartado sem problema 4ms
     × listas: {"titulo":"","url":" "} é descartado sem problema 1ms
     × bibliografia: {"referencia":"  "} é descartado sem problema 1ms
     × materiais: {"titulo":"","tipo":null} é descartado sem problema 1ms
     × links: {"titulo":"","url":""} é descartado sem problema 1ms
     × scripts: {"linguagem":"python"} é descartado sem problema 0ms
     × aulas: {"numero":null} é descartado sem problema 1ms
     × mantém os itens completos e só tira os vazios 2ms
     × a posição conta os itens vazios que saíram, a partir de 1 0ms
     × lista que não é array e item nulo não quebram 0ms
node.exe : 
No linha:1 caractere:1
+ & "C:\Program Files\nodejs/node.exe" "C:\Program Files\nodejs/node_mo ...
+ ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    + CategoryInfo          : NotSpecified: (:String) [], RemoteException
    + FullyQualifiedErrorId : NativeCommandError
 
⎯⎯⎯⎯⎯⎯ Failed Tests 11 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  tests/content/tina-disciplinas.test.ts > disciplinas — beforeSubmit do painel (F-09, Aviso 2, plano 086) > 
descarta em silêncio o item vazio (o "+" clicado à toa) e mantém os completos
AssertionError: promise rejected "Error: Não salvo: Aulas, item 2: falta Nú…" instead of resolving
 ❯ tests/content/tina-disciplinas.test.ts:51:25
     49|   it('descarta em silêncio o item vazio (o "+" clicado à toa) e mantém…
     50|     const { result, alerts } = submit({ aulas: [aula, {}, { titulo: ''…
     51|     await expect(result).resolves.toMatchObject({ nome: 'D', aulas: [a…
       |                         ^
     52|     expect(alerts).toEqual([]);
     53|   });

Caused by: Error: Não salvo: Aulas, item 2: falta Número, Título. Aulas, item 3: falta Número, Título.
 ❯ Object.beforeSubmit tina/config.ts:551:21
 ❯ submit tests/content/tina-disciplinas.test.ts:42:33
 ❯ tests/content/tina-disciplinas.test.ts:50:32

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/11]⎯

 FAIL  tests/lib/course-items.test.ts > prepareCourseItems — item vazio sai em silêncio (F-09) > aulas: {} é 
descartado sem problema
AssertionError: expected [ {} ] to deeply equal []

- Expected
+ Received

- []
+ [
+   {},
+ ]

 ❯ tests/lib/course-items.test.ts:63:27
     61|   it.each(vazios)('%s: %j é descartado sem problema', (lista, item) =>…
     62|     const { values, problems } = prepareCourseItems({ [lista]: [item] …
     63|     expect(values[lista]).toEqual([]);
       |                           ^
     64|     expect(problems).toEqual([]);
     65|   });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/11]⎯

 FAIL  tests/lib/course-items.test.ts > prepareCourseItems — item vazio sai em silêncio (F-09) > listas: 
{"titulo":"","url":" "} é descartado sem problema
AssertionError: expected [ { titulo: '' } ] to deeply equal []

- Expected
+ Received

- []
+ [
+   {
+     "titulo": "",
+   },
+ ]

 ❯ tests/lib/course-items.test.ts:63:27
     61|   it.each(vazios)('%s: %j é descartado sem problema', (lista, item) =>…
     62|     const { values, problems } = prepareCourseItems({ [lista]: [item] …
     63|     expect(values[lista]).toEqual([]);
       |                           ^
     64|     expect(problems).toEqual([]);
     65|   });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[3/11]⎯

 FAIL  tests/lib/course-items.test.ts > prepareCourseItems — item vazio sai em silêncio (F-09) > bibliografia: 
{"referencia":"  "} é descartado sem problema
AssertionError: expected [ { referencia: '  ' } ] to deeply equal []

- Expected
+ Received

- []
+ [
+   {
+     "referencia": "  ",
+   },
+ ]

 ❯ tests/lib/course-items.test.ts:63:27
     61|   it.each(vazios)('%s: %j é descartado sem problema', (lista, item) =>…
     62|     const { values, problems } = prepareCourseItems({ [lista]: [item] …
     63|     expect(values[lista]).toEqual([]);
       |                           ^
     64|     expect(problems).toEqual([]);
     65|   });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[4/11]⎯

 FAIL  tests/lib/course-items.test.ts > prepareCourseItems — item vazio sai em silêncio (F-09) > materiais: 
{"titulo":"","tipo":null} é descartado sem problema
AssertionError: expected [ { titulo: '', tipo: null, …(1) } ] to deeply equal []

- Expected
+ Received

- []
+ [
+   {
+     "tipo": null,
+     "titulo": "",
+     "url": undefined,
+   },
+ ]

 ❯ tests/lib/course-items.test.ts:63:27
     61|   it.each(vazios)('%s: %j é descartado sem problema', (lista, item) =>…
     62|     const { values, problems } = prepareCourseItems({ [lista]: [item] …
     63|     expect(values[lista]).toEqual([]);
       |                           ^
     64|     expect(problems).toEqual([]);
     65|   });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[5/11]⎯

 FAIL  tests/lib/course-items.test.ts > prepareCourseItems — item vazio sai em silêncio (F-09) > links: 
{"titulo":"","url":""} é descartado sem problema
AssertionError: expected [ { titulo: '', url: '' } ] to deeply equal []

- Expected
+ Received

- []
+ [
+   {
+     "titulo": "",
+     "url": "",
+   },
+ ]

 ❯ tests/lib/course-items.test.ts:63:27
     61|   it.each(vazios)('%s: %j é descartado sem problema', (lista, item) =>…
     62|     const { values, problems } = prepareCourseItems({ [lista]: [item] …
     63|     expect(values[lista]).toEqual([]);

 Test Files  2 failed (2)
      Tests  11 failed | 36 passed (47)
   Start at  17:55:20
   Duration  1.29s (transform 793ms, setup 0ms, import 1.19s, tests 35ms, environment 0ms)

       |                           ^
     64|     expect(problems).toEqual([]);
     65|   });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[6/11]⎯

 FAIL  tests/lib/course-items.test.ts > prepareCourseItems — item vazio sai em silêncio (F-09) > scripts: 
{"linguagem":"python"} é descartado sem problema
AssertionError: expected [ { linguagem: 'python' } ] to deeply equal []

- Expected
+ Received

- []
+ [
+   {
+     "linguagem": "python",
+   },
+ ]

 ❯ tests/lib/course-items.test.ts:63:27
     61|   it.each(vazios)('%s: %j é descartado sem problema', (lista, item) =>…
     62|     const { values, problems } = prepareCourseItems({ [lista]: [item] …
     63|     expect(values[lista]).toEqual([]);
       |                           ^
     64|     expect(problems).toEqual([]);
     65|   });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[7/11]⎯

 FAIL  tests/lib/course-items.test.ts > prepareCourseItems — item vazio sai em silêncio (F-09) > aulas: 
{"numero":null} é descartado sem problema
AssertionError: expected [ { numero: NaN } ] to deeply equal []

- Expected
+ Received

- []
+ [
+   {
+     "numero": NaN,
+   },
+ ]

 ❯ tests/lib/course-items.test.ts:63:27
     61|   it.each(vazios)('%s: %j é descartado sem problema', (lista, item) =>…
     62|     const { values, problems } = prepareCourseItems({ [lista]: [item] …
     63|     expect(values[lista]).toEqual([]);
       |                           ^
     64|     expect(problems).toEqual([]);
     65|   });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[8/11]⎯

 FAIL  tests/lib/course-items.test.ts > prepareCourseItems — item vazio sai em silêncio (F-09) > mantém os itens 
completos e só tira os vazios
AssertionError: expected { Object (nome, aulas) } to deeply equal { Object (nome, aulas) }

- Expected
+ Received

@@ -3,10 +3,11 @@
      {
        "numero": 1,
        "titulo": "Introdução",
        "url": "https://x.test/a",
      },
+     {},
      {
        "numero": 2,
        "titulo": "Introdução",
        "url": "https://x.test/a",
      },

 ❯ tests/lib/course-items.test.ts:73:20
     71|       aulas: [aula, {}, { ...aula, numero: 2 }],
     72|     });
     73|     expect(values).toEqual({ nome: 'X', aulas: [aula, { ...aula, numer…
       |                    ^
     74|     expect(problems).toEqual([]);
     75|   });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[9/11]⎯

 FAIL  tests/lib/course-items.test.ts > prepareCourseItems — item pela metade recusa com a mensagem exata (F-09) > a 
posição conta os itens vazios que saíram, a partir de 1
AssertionError: expected [ …(2) ] to deeply equal [ 'Aulas, item 3: falta Número.' ]

- Expected
+ Received

  [
+   "Aulas, item 2: falta Número, Título.",
    "Aulas, item 3: falta Número.",
  ]

 ❯ tests/lib/course-items.test.ts:107:22
    105|       aulas: [{ numero: 1, titulo: 'A' }, {}, { titulo: 'Sem número' }…
    106|     });
    107|     expect(problems).toEqual(['Aulas, item 3: falta Número.']);
       |                      ^
    108|   });
    109| });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[10/11]⎯

 FAIL  tests/lib/course-items.test.ts > prepareCourseItems — entrada atípica > lista que não é array e item nulo não 
quebram
AssertionError: expected [ {} ] to deeply equal []

- Expected
+ Received

- []
+ [
+   {},
+ ]

 ❯ tests/lib/course-items.test.ts:174:27
    172|     const { values, problems } = prepareCourseItems({ aulas: 'x', list…
    173|     expect(values.aulas).toBe('x');
    174|     expect(values.listas).toEqual([]);
       |                           ^
    175|     expect(problems).toEqual([]);
    176|   });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[11/11]⎯

EXIT=1
```

### Passo 8 — canário C desfeito

`src/lib/course-items.ts` igual ao de antes do canário (`cmp`).

```

 RUN  v4.1.11 S:/Projetos/academic_page/haroldo


 Test Files  2 passed (2)
      Tests  47 passed (47)
   Start at  17:55:29
   Duration  1.21s (transform 748ms, setup 0ms, import 1.15s, tests 20ms, environment 0ms)

EXIT=0
```

### Canário (a) — `CourseResources`: a lista sempre renderiza o `ExternalLink` (asserção 2)

Build com o canário e `test:dist`: a asserção 2 reprova. Desfeito editando; `cmp` contra o backup feito antes do canário deu igual.

```

> haroldo-page@0.1.0 build:pipeline
> vitest run tests/content && tinacms build --skip-cloud-checks && astro check && astro build


 RUN  v4.1.11 S:/Projetos/academic_page/haroldo


 Test Files  7 passed (7)
      Tests  166 passed (166)
   Start at  17:56:05
   Duration  1.51s (transform 2.55s, setup 0ms, import 4.45s, tests 178ms, environment 1ms)

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
17:56:38 [content] Syncing content
17:56:38 [content] Synced content
17:56:38 [types] Generated 623ms
17:56:38 [check] Getting diagnostics for Astro files in S:\Projetos\academic_page\haroldo...
Result (116 files): 
- 0 errors
- 0 warnings
- 0 hints

17:56:49 [content] Syncing content
17:56:49 [content] Synced content
17:56:49 [types] Generated 580ms
17:56:49 [build] output: "static"
17:56:49 [build] mode: "static"
17:56:49 [build] directory: S:\Projetos\academic_page\haroldo\dist\
17:56:49 [build] Collecting build info...
17:56:49 [build] ✓ Completed in 624ms.
17:56:49 [build] Building static entrypoints...
17:56:50 [WARN] [vite] [lightningcss minify] 'global' is not recognized as a valid pseudo-class. Did you mean '::global' (pseudo-element) or is this a typo?
25 |  }
26 |  
27 |  .carrossel[data-astro-cid-bkddzv6o]:not(:global(.pronto)) .miniatura[data-astro-cid-bkddzv6o] {
   |                                                  ^
28 |    opacity: 1;
29 |  }
17:56:50 [vite] ✓ built in 592ms
17:56:50 [vite] ✓ built in 104ms
17:56:50 [build] Rearranging server assets...

 generating static routes 
17:56:50   ├─ /404.html (+14ms) 
17:56:50   ├─ /en/404/index.html (+4ms) 
17:56:50   ├─ /en/about/index.html (+10ms) 
17:56:50   ├─ /en/outreach/ifma-pedreiras/index.html (+3ms) 
17:56:50   ├─ /en/outreach/ufma-bacabal/index.html (+2ms) 
17:56:50   ├─ /en/outreach/index.html (+7ms) 
17:56:50   ├─ /en/publications/index.html (+8ms) 
17:56:50   ├─ /en/research/index.html (+7ms) 
17:56:50   ├─ /en/teaching/fisica-moderna/index.html (+80ms) 
17:56:50   ├─ /en/teaching/mecanica-classica/index.html (+4ms) 
17:56:50   ├─ /en/teaching/index.html (+9ms) 
17:56:50   ├─ /en/index.html (+8ms) 
17:56:50   ├─ /ensino/fisica-moderna/index.html (+15ms) 
17:56:50   ├─ /ensino/mecanica-classica/index.html (+3ms) 
17:56:50   ├─ /ensino/index.html (+4ms) 
17:56:50   ├─ /extensao/ifma-pedreiras/index.html (+2ms) 
17:56:50   ├─ /extensao/ufma-bacabal/index.html (+2ms) 
17:56:50   ├─ /extensao/index.html (+5ms) 
17:56:50   ├─ /pesquisa/index.html (+3ms) 
17:56:50   ├─ /publicacoes/index.html (+5ms) 
17:56:50   ├─ /sobre/index.html (+3ms) 
17:56:50   ├─ /index.html (+3ms) 
17:56:50 ✓ Completed in 258ms.

17:56:50 [build] ✓ Completed in 1.02s.
17:56:50 [@astrojs/sitemap] `sitemap-index.xml` created at `dist`
17:56:50 [build] 22 page(s) built in 1.68s
17:56:50 [build] Complete!
EXIT=0
```

```

> haroldo-page@0.1.0 test:dist
> vitest run -c vitest.dist.config.ts


 RUN  v4.1.11 S:/Projetos/academic_page/haroldo

 ❯ tests/dist/site-gerado.test.ts (49 tests | 1 failed) 279ms
     × listas: um <li> por item e um link só nos que têm url, na mesma ordem 8ms
node.exe : 
No linha:1 caractere:1
+ & "C:\Program Files\nodejs/node.exe" "C:\Program Files\nodejs/node_mo ...
+ ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    + CategoryInfo          : NotSpecified: (:String) [], RemoteException
    + FullyQualifiedErrorId : NativeCommandError
 
⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  tests/dist/site-gerado.test.ts > aula e lista sem link (plano 086, RF-24) > listas: um <li> por item e um link 
só nos que têm url, na mesma ordem
AssertionError: pt/mecanica-classica listas: links: expected [ '', '', '', '' ] to deeply equal []

- Expected
+ Received

- []
+ [
+   "",
+   "",
+   "",
+   "",
+ ]

 ❯ tests/dist/site-gerado.test.ts:849:90
    847|         const itemCount = section.split(`<li class="${cls}`).length - …
    848|         expect(itemCount, `${locale}/${course.slug} ${id}: <li>`).toBe…
    849|         expect(linksOf(section, 'cartao-link'), `${locale}/${course.sl…
       |                                                                                          ^
    850|           items.filter(hasUrl).map((item) => item.url?.trim()),
    851|         );

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯


 Test Files  1 failed | 1 passed (2)
      Tests  1 failed | 58 passed (59)
   Start at  17:56:54
   Duration  683ms (transform 173ms, setup 0ms, import 335ms, tests 462ms, environment 0ms)

EXIT=1
```

### Canário (b) — `CourseCover`: botão condicionado a `latest &&` (asserção 3)

Idem. A condição do bloco de botões também volta a `latest || hasProblemSets`.

```

> haroldo-page@0.1.0 build:pipeline
> vitest run tests/content && tinacms build --skip-cloud-checks && astro check && astro build


 RUN  v4.1.11 S:/Projetos/academic_page/haroldo


 Test Files  7 passed (7)
      Tests  166 passed (166)
   Start at  17:57:05
   Duration  1.47s (transform 2.55s, setup 0ms, import 4.43s, tests 160ms, environment 1ms)

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
17:57:35 [content] Syncing content
17:57:35 [content] Synced content
17:57:35 [types] Generated 582ms
17:57:35 [check] Getting diagnostics for Astro files in S:\Projetos\academic_page\haroldo...
Result (116 files): 
- 0 errors
- 0 warnings
- 0 hints

17:57:46 [content] Syncing content
17:57:46 [content] Synced content
17:57:46 [types] Generated 624ms
17:57:46 [build] output: "static"
17:57:46 [build] mode: "static"
17:57:46 [build] directory: S:\Projetos\academic_page\haroldo\dist\
17:57:46 [build] Collecting build info...
17:57:46 [build] ✓ Completed in 672ms.
17:57:46 [build] Building static entrypoints...
17:57:46 [WARN] [vite] [lightningcss minify] 'global' is not recognized as a valid pseudo-class. Did you mean '::global' (pseudo-element) or is this a typo?
25 |  }
26 |  
27 |  .carrossel[data-astro-cid-bkddzv6o]:not(:global(.pronto)) .miniatura[data-astro-cid-bkddzv6o] {
   |                                                  ^
28 |    opacity: 1;
29 |  }
17:57:46 [vite] ✓ built in 512ms
17:57:46 [vite] ✓ built in 104ms
17:57:46 [build] Rearranging server assets...

 generating static routes 
17:57:46   ├─ /404.html (+15ms) 
17:57:46   ├─ /en/404/index.html (+5ms) 
17:57:46   ├─ /en/about/index.html (+8ms) 
17:57:46   ├─ /en/outreach/ifma-pedreiras/index.html (+4ms) 
17:57:47   ├─ /en/outreach/ufma-bacabal/index.html (+2ms) 
17:57:47   ├─ /en/outreach/index.html (+6ms) 
17:57:47   ├─ /en/publications/index.html (+10ms) 
17:57:47   ├─ /en/research/index.html (+7ms) 
17:57:47   ├─ /en/teaching/fisica-moderna/index.html (+130ms) 
17:57:47   ├─ /en/teaching/mecanica-classica/index.html (+4ms) 
17:57:47   ├─ /en/teaching/index.html (+7ms) 
17:57:47   ├─ /en/index.html (+5ms) 
17:57:47   ├─ /ensino/fisica-moderna/index.html (+15ms) 
17:57:47   ├─ /ensino/mecanica-classica/index.html (+3ms) 
17:57:47   ├─ /ensino/index.html (+4ms) 
17:57:47   ├─ /extensao/ifma-pedreiras/index.html (+2ms) 
17:57:47   ├─ /extensao/ufma-bacabal/index.html (+2ms) 
17:57:47   ├─ /extensao/index.html (+4ms) 
17:57:47   ├─ /pesquisa/index.html (+3ms) 
17:57:47   ├─ /publicacoes/index.html (+4ms) 
17:57:47   ├─ /sobre/index.html (+3ms) 
17:57:47   ├─ /index.html (+3ms) 
17:57:47 ✓ Completed in 297ms.

17:57:47 [build] ✓ Completed in 991ms.
17:57:47 [@astrojs/sitemap] `sitemap-index.xml` created at `dist`
17:57:47 [build] 22 page(s) built in 1.69s
17:57:47 [build] Complete!
EXIT=0
```

```

> haroldo-page@0.1.0 test:dist
> vitest run -c vitest.dist.config.ts


 RUN  v4.1.11 S:/Projetos/academic_page/haroldo

 ❯ tests/dist/site-gerado.test.ts (49 tests | 1 failed) 287ms
     × capa: o botão "Última aula" existe se e só se a última aula tem url 7ms
node.exe : 
No linha:1 caractere:1
+ & "C:\Program Files\nodejs/node.exe" "C:\Program Files\nodejs/node_mo ...
+ ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    + CategoryInfo          : NotSpecified: (:String) [], RemoteException
    + FullyQualifiedErrorId : NativeCommandError
 
⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  tests/dist/site-gerado.test.ts > aula e lista sem link (plano 086, RF-24) > capa: o botão "Última aula" existe 
se e só se a última aula tem url
AssertionError: pt/fisica-moderna: botão: expected [ '' ] to deeply equal []

- Expected
+ Received

- []
+ [
+   "",
+ ]

 ❯ tests/dist/site-gerado.test.ts:864:60
    862|       for (const locale of locales) {
    863|         const buttons = linksOf(pageOf(course.slug, locale), 'botao bo…
    864|         expect(buttons, `${locale}/${course.slug}: botão`).toEqual(has…
       |                                                            ^
    865|         checked += 1;
    866|       }

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯


 Test Files  1 failed | 1 passed (2)
      Tests  1 failed | 58 passed (59)
   Start at  17:57:49
   Duration  687ms (transform 179ms, setup 0ms, import 343ms, tests 478ms, environment 0ms)

EXIT=1
```

### Canário (d) — `CourseCover`: `latest &&` com `href={latest.url ?? 'https://canario.invalid/'}` (ramo com link do botão)

A asserção 3 reprova **mostrando** o `href` do canário: o botão sai com o link e a asserção o enxerga. Desfeito, `cmp` igual ao backup do passo (b).

```

> haroldo-page@0.1.0 build:pipeline
> vitest run tests/content && tinacms build --skip-cloud-checks && astro check && astro build


 RUN  v4.1.11 S:/Projetos/academic_page/haroldo


 Test Files  7 passed (7)
      Tests  166 passed (166)
   Start at  17:57:58
   Duration  1.42s (transform 2.39s, setup 0ms, import 4.15s, tests 145ms, environment 1ms)

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
17:58:28 [content] Syncing content
17:58:28 [content] Synced content
17:58:28 [types] Generated 578ms
17:58:28 [check] Getting diagnostics for Astro files in S:\Projetos\academic_page\haroldo...
Result (116 files): 
- 0 errors
- 0 warnings
- 0 hints

17:58:39 [content] Syncing content
17:58:39 [content] Synced content
17:58:39 [types] Generated 587ms
17:58:39 [build] output: "static"
17:58:39 [build] mode: "static"
17:58:39 [build] directory: S:\Projetos\academic_page\haroldo\dist\
17:58:39 [build] Collecting build info...
17:58:39 [build] ✓ Completed in 631ms.
17:58:39 [build] Building static entrypoints...
17:58:39 [WARN] [vite] [lightningcss minify] 'global' is not recognized as a valid pseudo-class. Did you mean '::global' (pseudo-element) or is this a typo?
25 |  }
26 |  
27 |  .carrossel[data-astro-cid-bkddzv6o]:not(:global(.pronto)) .miniatura[data-astro-cid-bkddzv6o] {
   |                                                  ^
28 |    opacity: 1;
29 |  }
17:58:39 [vite] ✓ built in 470ms
17:58:39 [vite] ✓ built in 99ms
17:58:39 [build] Rearranging server assets...

 generating static routes 
17:58:39   ├─ /404.html (+14ms) 
17:58:39   ├─ /en/404/index.html (+4ms) 
17:58:39   ├─ /en/about/index.html (+9ms) 
17:58:39   ├─ /en/outreach/ifma-pedreiras/index.html (+4ms) 
17:58:39   ├─ /en/outreach/ufma-bacabal/index.html (+2ms) 
17:58:39   ├─ /en/outreach/index.html (+5ms) 
17:58:39   ├─ /en/publications/index.html (+8ms) 
17:58:39   ├─ /en/research/index.html (+6ms) 
17:58:39   ├─ /en/teaching/fisica-moderna/index.html (+112ms) 
17:58:40   ├─ /en/teaching/mecanica-classica/index.html (+3ms) 
17:58:40   ├─ /en/teaching/index.html (+7ms) 
17:58:40   ├─ /en/index.html (+15ms) 
17:58:40   ├─ /ensino/fisica-moderna/index.html (+16ms) 
17:58:40   ├─ /ensino/mecanica-classica/index.html (+3ms) 
17:58:40   ├─ /ensino/index.html (+4ms) 
17:58:40   ├─ /extensao/ifma-pedreiras/index.html (+2ms) 
17:58:40   ├─ /extensao/ufma-bacabal/index.html (+1ms) 
17:58:40   ├─ /extensao/index.html (+3ms) 
17:58:40   ├─ /pesquisa/index.html (+3ms) 
17:58:40   ├─ /publicacoes/index.html (+4ms) 
17:58:40   ├─ /sobre/index.html (+3ms) 
17:58:40   ├─ /index.html (+2ms) 
17:58:40 ✓ Completed in 274ms.

17:58:40 [build] ✓ Completed in 928ms.
17:58:40 [@astrojs/sitemap] `sitemap-index.xml` created at `dist`
17:58:40 [build] 22 page(s) built in 1.63s
17:58:40 [build] Complete!
EXIT=0
```

```

> haroldo-page@0.1.0 test:dist
> vitest run -c vitest.dist.config.ts


 RUN  v4.1.11 S:/Projetos/academic_page/haroldo

 ❯ tests/dist/site-gerado.test.ts (49 tests | 1 failed) 273ms
     × capa: o botão "Última aula" existe se e só se a última aula tem url 7ms
node.exe : 
No linha:1 caractere:1
+ & "C:\Program Files\nodejs/node.exe" "C:\Program Files\nodejs/node_mo ...
+ ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    + CategoryInfo          : NotSpecified: (:String) [], RemoteException
    + FullyQualifiedErrorId : NativeCommandError
 
⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  tests/dist/site-gerado.test.ts > aula e lista sem link (plano 086, RF-24) > capa: o botão "Última aula" existe 
se e só se a última aula tem url
AssertionError: pt/fisica-moderna: botão: expected [ 'https://canario.invalid/' ] to deeply equal []

- Expected
+ Received

- []
+ [
+   "https://canario.invalid/",
+ ]

 ❯ tests/dist/site-gerado.test.ts:864:60
    862|       for (const locale of locales) {
    863|         const buttons = linksOf(pageOf(course.slug, locale), 'botao bo…
    864|         expect(buttons, `${locale}/${course.slug}: botão`).toEqual(has…
       |                                                            ^
    865|         checked += 1;
    866|       }

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯


 Test Files  1 failed | 1 passed (2)
      Tests  1 failed | 58 passed (59)
   Start at  17:58:42
   Duration  673ms (transform 185ms, setup 0ms, import 347ms, tests 460ms, environment 0ms)

EXIT=1
```

### Canário (c) — `TeachingView`: o atalho da última aula sempre renderiza o `ExternalLink` (asserção 4)

A condição foi escrita como `Boolean(latest.url) || aulas.length > 0` porque `true` fazia o `astro check` reprovar o build (`latest` vira `never` no ramo `else`). A asserção 4 reprova esperando `span` e recebendo `a`. A variante com `href` do canário não se aplica: a asserção 4 olha só o tipo da tag. Desfeito, `cmp` igual ao backup.

```

> haroldo-page@0.1.0 build:pipeline
> vitest run tests/content && tinacms build --skip-cloud-checks && astro check && astro build


 RUN  v4.1.11 S:/Projetos/academic_page/haroldo


 Test Files  7 passed (7)
      Tests  166 passed (166)
   Start at  18:00:35
   Duration  1.46s (transform 2.46s, setup 0ms, import 4.29s, tests 162ms, environment 1ms)

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
18:01:05 [content] Syncing content
18:01:05 [content] Synced content
18:01:05 [types] Generated 626ms
18:01:05 [check] Getting diagnostics for Astro files in S:\Projetos\academic_page\haroldo...
Result (116 files): 
- 0 errors
- 0 warnings
- 0 hints

18:01:16 [content] Syncing content
18:01:16 [content] Synced content
18:01:16 [types] Generated 630ms
18:01:16 [build] output: "static"
18:01:16 [build] mode: "static"
18:01:16 [build] directory: S:\Projetos\academic_page\haroldo\dist\
18:01:16 [build] Collecting build info...
18:01:16 [build] ✓ Completed in 682ms.
18:01:16 [build] Building static entrypoints...
18:01:16 [WARN] [vite] [lightningcss minify] 'global' is not recognized as a valid pseudo-class. Did you mean '::global' (pseudo-element) or is this a typo?
25 |  }
26 |  
27 |  .carrossel[data-astro-cid-bkddzv6o]:not(:global(.pronto)) .miniatura[data-astro-cid-bkddzv6o] {
   |                                                  ^
28 |    opacity: 1;
29 |  }
18:01:16 [vite] ✓ built in 510ms
18:01:17 [vite] ✓ built in 105ms
18:01:17 [build] Rearranging server assets...

 generating static routes 
18:01:17   ├─ /404.html (+14ms) 
18:01:17   ├─ /en/404/index.html (+4ms) 
18:01:17   ├─ /en/about/index.html (+8ms) 
18:01:17   ├─ /en/outreach/ifma-pedreiras/index.html (+4ms) 
18:01:17   ├─ /en/outreach/ufma-bacabal/index.html (+2ms) 
18:01:17   ├─ /en/outreach/index.html (+6ms) 
18:01:17   ├─ /en/publications/index.html (+20ms) 
18:01:17   ├─ /en/research/index.html (+7ms) 
18:01:17   ├─ /en/teaching/fisica-moderna/index.html (+85ms) 
18:01:17   ├─ /en/teaching/mecanica-classica/index.html (+6ms) 
18:01:17   ├─ /en/teaching/index.html (+6ms) 
18:01:17   ├─ /en/index.html (+17ms) 
18:01:17   ├─ /ensino/fisica-moderna/index.html (+18ms) 
18:01:17   ├─ /ensino/mecanica-classica/index.html (+3ms) 
18:01:17   ├─ /ensino/index.html (+4ms) 
18:01:17   ├─ /extensao/ifma-pedreiras/index.html (+2ms) 
18:01:17   ├─ /extensao/ufma-bacabal/index.html (+2ms) 
18:01:17   ├─ /extensao/index.html (+4ms) 
18:01:17   ├─ /pesquisa/index.html (+4ms) 
18:01:17   ├─ /publicacoes/index.html (+4ms) 
18:01:17   ├─ /sobre/index.html (+4ms) 
18:01:17   ├─ /index.html (+3ms) 
18:01:17 ✓ Completed in 284ms.

18:01:17 [build] ✓ Completed in 970ms.
18:01:17 [@astrojs/sitemap] `sitemap-index.xml` created at `dist`
18:01:17 [build] 22 page(s) built in 1.69s
18:01:17 [build] Complete!
EXIT=0
```

```

> haroldo-page@0.1.0 test:dist
> vitest run -c vitest.dist.config.ts


 RUN  v4.1.11 S:/Projetos/academic_page/haroldo

 ❯ tests/dist/site-gerado.test.ts (49 tests | 1 failed) 289ms
     × Ensino: o atalho da última aula tem <a> se e só se ela tem url 6ms
node.exe : 
No linha:1 caractere:1
+ & "C:\Program Files\nodejs/node.exe" "C:\Program Files\nodejs/node_mo ...
+ ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    + CategoryInfo          : NotSpecified: (:String) [], RemoteException
    + FullyQualifiedErrorId : NativeCommandError
 
⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  tests/dist/site-gerado.test.ts > aula e lista sem link (plano 086, RF-24) > Ensino: o atalho da última aula tem 
<a> se e só se ela tem url
AssertionError: pt/fisica-moderna: atalho: expected 'a' to be 'span' // Object.is equality

Expected: "span"
Received: "a"

 ❯ tests/dist/site-gerado.test.ts:883:62
    881|         expect(card, `${locale}/${course.slug}: cartão em Ensino`).toB…
    882|         const shortcut = card?.match(/·<\/span>\s*<(a|span)\b/)?.[1];
    883|         expect(shortcut, `${locale}/${course.slug}: atalho`).toBe(hasU…
       |                                                              ^
    884|         checked += 1;
    885|       }

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯


 Test Files  1 failed | 1 passed (2)
      Tests  1 failed | 58 passed (59)
   Start at  18:01:19
   Duration  686ms (transform 161ms, setup 0ms, import 325ms, tests 478ms, environment 0ms)

EXIT=1
```

### Canário da chave — `prepareCourseItems` troca `delete item.url` por `item.url = undefined`

Reprovam os testes que exigem que a chave saia do item (`toStrictEqual` e `'url' in item`). Desfeito, `cmp` igual ao backup.

```

 RUN  v4.1.11 S:/Projetos/academic_page/haroldo

 ❯ tests/content/tina-disciplinas.test.ts (6 tests | 1 failed) 13ms
     × aula sem link salva, sem a chave `url` 6ms
 ❯ tests/lib/course-items.test.ts (41 tests | 4 failed) 18ms
     × aulas: link opcional em branco perde a chave (RF-24) 4ms
     × listas: link opcional em branco perde a chave (RF-24) 1ms
     × bibliografia: link opcional em branco perde a chave (RF-24) 1ms
     × scripts: link opcional em branco perde a chave 1ms
node.exe : 
No linha:1 caractere:1
+ & "C:\Program Files\nodejs/node.exe" "C:\Program Files\nodejs/node_mo ...
+ ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    + CategoryInfo          : NotSpecified: (:String) [], RemoteException
    + FullyQualifiedErrorId : NativeCommandError
 
⎯⎯⎯⎯⎯⎯⎯ Failed Tests 5 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  tests/content/tina-disciplinas.test.ts > disciplinas — beforeSubmit do painel (F-09, Aviso 2, plano 086) > aula 
sem link salva, sem a chave `url`
AssertionError: expected [ { numero: 2, …(2) } ] to strictly equal [ { numero: 2, titulo: 'Sem link' } ]

- Expected
+ Received

  [
    {
      "numero": 2,
      "titulo": "Sem link",
+     "url": undefined,
    },
  ]

 ❯ tests/content/tina-disciplinas.test.ts:58:25
     56|     const { result, alerts } = submit({ aulas: [{ numero: 2, titulo: '…
     57|     const saved = (await result) as { aulas: Record<string, unknown>[]…
     58|     expect(saved.aulas).toStrictEqual([{ numero: 2, titulo: 'Sem link'…
       |                         ^
     59|     expect('url' in saved.aulas[0]).toBe(false);
     60|     expect(alerts).toEqual([]);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/5]⎯

 FAIL  tests/lib/course-items.test.ts > prepareCourseItems — link > aulas: link opcional em branco perde a chave 
(RF-24)
AssertionError: expected [ { numero: 1, titulo: 'T', …(1) } ] to strictly equal [ { numero: 1, titulo: 'T' } ]

- Expected
+ Received

  [
    {
      "numero": 1,
      "titulo": "T",
+     "url": undefined,
    },
  ]

 ❯ tests/lib/course-items.test.ts:123:31
    121|       for (const url of ['', ' ', '  ']) {
    122|         const { values, problems } = prepareCourseItems({ [lista]: [{ …
    123|         expect(values[lista]).toStrictEqual([base]);
       |                               ^
    124|         expect('url' in (values[lista] as object[])[0]).toBe(false);
    125|         expect(problems).toEqual([]);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/5]⎯

 FAIL  tests/lib/course-items.test.ts > prepareCourseItems — link > listas: link opcional em branco perde a chave 
(RF-24)
AssertionError: expected [ { titulo: 'T', url: undefined } ] to strictly equal [ { titulo: 'T' } ]

- Expected
+ Received

  [
    {
      "titulo": "T",
+     "url": undefined,
    },
  ]

 ❯ tests/lib/course-items.test.ts:123:31
    121|       for (const url of ['', ' ', '  ']) {
    122|         const { values, problems } = prepareCourseItems({ [lista]: [{ …
    123|         expect(values[lista]).toStrictEqual([base]);
       |                               ^
    124|         expect('url' in (values[lista] as object[])[0]).toBe(false);
    125|         expect(problems).toEqual([]);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[3/5]⎯

 FAIL  tests/lib/course-items.test.ts > prepareCourseItems — link > bibliografia: link opcional em branco perde a 
chave (RF-24)
AssertionError: expected [ { referencia: 'R', url: undefined } ] to strictly equal [ { referencia: 'R' } ]

- Expected
+ Received

  [
    {
      "referencia": "R",
+     "url": undefined,
    },
  ]

 ❯ tests/lib/course-items.test.ts:123:31
    121|       for (const url of ['', ' ', '  ']) {
    122|         const { values, problems } = prepareCourseItems({ [lista]: [{ …
    123|         expect(values[lista]).toStrictEqual([base]);
       |                               ^
    124|         expect('url' in (values[lista] as object[])[0]).toBe(false);
    125|         expect(problems).toEqual([]);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[4/5]⎯

 FAIL  tests/lib/course-items.test.ts > prepareCourseItems — link > scripts: link opcional em branco perde a chave
AssertionError: expected [ { titulo: 'S', …(3) } ] to strictly equal [ { titulo: 'S', …(2) } ]

- Expected
+ Received

  [
    {
      "codigo": "x = 1",
      "linguagem": "python",
      "titulo": "S",
+     "url": undefined,
    },
  ]

 ❯ tests/lib/course-items.test.ts:133:28
    131|     const script = { titulo: 'S', linguagem: 'python', codigo: 'x = 1'…
    132|     const { values, problems } = prepareCourseItems({ scripts: [{ ...s…
    133|     expect(values.scripts).toStrictEqual([script]);
       |                            ^
    134|     expect('url' in (values.scripts as object[])[0]).toBe(false);
    135|     expect(problems).toEqual([]);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[5/5]⎯


 Test Files  2 failed (2)
      Tests  5 failed | 42 passed (47)
   Start at  17:55:10
   Duration  1.23s (transform 760ms, setup 0ms, import 1.15s, tests 31ms, environment 0ms)

EXIT=1
```

### Passo 9 — `git diff --stat` e `npm test -- tests/lib/citacoes-do-prd.test.ts`

O diff é de depois de todas as edições; `PRD.md` e o Aviso 2 estão nele.

```
 PRD.md                                             |   13 +-
 docs/avisos-do-painel-para-o-manual.md             |   25 +-
 .../086-link-opcional-em-aula-e-lista.md           | 1342 +++++++++++++++++++-
 src/components/CourseCover.astro                   |   19 +-
 src/components/CourseResources.astro               |   17 +-
 src/components/LessonList.astro                    |   23 +-
 src/content.config.ts                              |   25 +-
 src/styles/global.css                              |    3 +-
 src/views/TeachingView.astro                       |   19 +-
 tests/content/schemas.test.ts                      |   95 +-
 tests/dist/site-gerado.test.ts                     |  115 +-
 tina/config.ts                                     |   26 +-
 tina/tina-lock.json                                |    2 +-
 13 files changed, 1657 insertions(+), 67 deletions(-)
EXIT=0
```

```

> haroldo-page@0.1.0 test
> vitest run tests/lib/citacoes-do-prd.test.ts


 RUN  v4.1.11 S:/Projetos/academic_page/haroldo


 Test Files  1 passed (1)
      Tests  22 passed (22)
   Start at  18:03:49
   Duration  238ms (transform 37ms, setup 0ms, import 71ms, tests 8ms, environment 0ms)

EXIT=0
```

### Passo 10 — `npm run lint`, `npm run format:check`, `npm run test:coverage`

O `format:check` reprovou uma vez, só por `tests/lib/course-items.test.ts` (arquivo novo deste plano); rodei `npx prettier --write` nele e refiz as três capturas depois da última edição.

```

> haroldo-page@0.1.0 lint
> eslint .

EXIT=0
```

```

> haroldo-page@0.1.0 format:check
> prettier --check .

Checking formatting...
All matched files use Prettier code style!
EXIT=0
```

```

> haroldo-page@0.1.0 test:coverage
> vitest run --coverage


 RUN  v4.1.11 S:/Projetos/academic_page/haroldo
      Coverage enabled with v8


 Test Files  27 passed (27)
      Tests  529 passed (529)
   Start at  18:02:39
   Duration  2.24s (transform 6.67s, setup 0ms, import 13.10s, tests 599ms, environment 5ms)

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

### Linhas dos componentes (limite de 150 aceito sem extração, PRD v0.1.71)

```
  170 src/components/LessonList.astro
  145 src/components/CourseResources.astro
  164 src/components/CourseCover.astro
  336 src/views/TeachingView.astro
  160 src/lib/course-items.ts
  975 total
EXIT=0
```

### Fim de linha do `PRD.md`

O despacho dizia que a cópia de trabalho do `PRD.md` é CRLF. Não é: nem o `HEAD` nem a cópia de trabalho têm `\r` (`core.autocrlf=true` aqui). A edição manteve LF, e o diff tem 7 inserções e 6 deleções.

```
$ git show HEAD:PRD.md | tr -cd "\r" | wc -c
0
$ tr -cd "\r" < PRD.md | wc -c
0
$ git diff --stat PRD.md
 PRD.md | 13 +++++++------
 1 file changed, 7 insertions(+), 6 deletions(-)
EXIT=0
```

### Codificação (itens 21 e 22 do DESPACHO)

`file` sem "with BOM" e zero ocorrências de mojibake em todos os arquivos tocados.

```
PRD.md: Unicode text, UTF-8 text, with very long lines (2333)
  mojibake (grep -c 'Ã\|â€\|Â'): 0
docs/avisos-do-painel-para-o-manual.md: Unicode text, UTF-8 text
  mojibake (grep -c 'Ã\|â€\|Â'): 0
src/components/CourseCover.astro: JavaScript source, Unicode text, UTF-8 text
  mojibake (grep -c 'Ã\|â€\|Â'): 0
src/components/CourseResources.astro: JavaScript source, Unicode text, UTF-8 text
  mojibake (grep -c 'Ã\|â€\|Â'): 0
src/components/LessonList.astro: JavaScript source, Unicode text, UTF-8 text
  mojibake (grep -c 'Ã\|â€\|Â'): 0
src/content.config.ts: JavaScript source, Unicode text, UTF-8 text
  mojibake (grep -c 'Ã\|â€\|Â'): 0
src/styles/global.css: Unicode text, UTF-8 text
  mojibake (grep -c 'Ã\|â€\|Â'): 0
src/views/TeachingView.astro: JavaScript source, Unicode text, UTF-8 text
  mojibake (grep -c 'Ã\|â€\|Â'): 0
tests/content/schemas.test.ts: JavaScript source, Unicode text, UTF-8 text
  mojibake (grep -c 'Ã\|â€\|Â'): 0
tests/dist/site-gerado.test.ts: JavaScript source, Unicode text, UTF-8 text
  mojibake (grep -c 'Ã\|â€\|Â'): 0
tina/config.ts: JavaScript source, Unicode text, UTF-8 text
  mojibake (grep -c 'Ã\|â€\|Â'): 0
tina/tina-lock.json: JSON text data
  mojibake (grep -c 'Ã\|â€\|Â'): 0
src/lib/course-items.ts: JavaScript source, Unicode text, UTF-8 text
  mojibake (grep -c 'Ã\|â€\|Â'): 0
tests/content/tina-disciplinas.test.ts: JavaScript source, Unicode text, UTF-8 text
  mojibake (grep -c 'Ã\|â€\|Â'): 0
tests/lib/course-items.test.ts: JavaScript source, Unicode text, UTF-8 text
  mojibake (grep -c 'Ã\|â€\|Â'): 0
EXIT=0
```

### Correções do ciclo 1 da revisão

Blocos recapturados sobre o estado final: passo 1 (vermelho e verde), passos 2, 3, 4, 5, 9 e 10, canários A, B e C. Blocos novos: canários (a), (b), (c), (d) e o da chave.
1. Canários das asserções 2, 3 e 4 e do ramo com link do botão: blocos "Canário (a)" a "(d)".
2. A chave sai do item: `toStrictEqual` e `'url' in item` em `course-items.test.ts` e `tina-disciplinas.test.ts`; bloco "Canário da chave".
3. Esperado das asserções 1 e 3 com `trim()`; caso unitário em `schemas.test.ts` (URL com espaço nas pontas sai aparada). Fixture de `content/` não foi usada.
4. Cabeçalho de `schemas.test.ts` (2026-11-21, 0.4.0), descrição de `CourseCover.astro` e cabeçalho §10.1 de `tina-disciplinas.test.ts`.
5. PRD: RF-07 e RF-24 sem "Drive". Aviso 2: sem data de fim do build reprovado, e o "Como reproduzir" na instância `publicacoes.autores[]`.

### O que NÃO foi rodado

- **Passo 11 (painel no Vivaldi):** é do orquestrador. A caixa do `beforeSubmit` fica vazia. O que os testes do passo 3 provam: a função chamada com um `cms` falso descarta o item vazio sem alerta, recusa o item pela metade e o link `AAAA` com `cms.alerts.error` e `throw`, e deixa salvar disciplina sem listas. O que eles **não** provam: que o Tina do painel chama esse `beforeSubmit` ao clicar em Save, e o texto do alerta na tela.
- **Passo 12 (push, Workers Builds, vigia):** é do orquestrador e depende de autorização para o push. Caixa vazia. Não rodei `git push`, `git pull` nem `git checkout` de branch.
- **Verificação oficial (`triage-runner`) e revisão:** não rodadas. As saídas acima são o feedback do executor.
- **`npm audit`:** não rodei (o plano não pede; o portão de audit é do plano 087).
- **Navegador:** nada foi visto numa tela. O hover de "não clicável" foi implementado em CSS e não foi verificado visualmente.

### Divergências entre o plano (ou o despacho) e o código

1. **O Zod deixa a chave `url: undefined` no item parseado**, em vez de omiti-la. A tabela do plano diz "ok, sem a chave"; o `safeParse` de `' '` devolve o item com `url` igual a `undefined`. Para a página dá no mesmo (`aula.url` falso). O teste do passo 1 afirma `url` igual a `undefined`, não a ausência da chave. Já o `prepareCourseItems` (painel) remove a chave de verdade.
2. **O `PRD.md` está em LF**, não em CRLF (bloco "Fim de linha do `PRD.md`").
3. **`aulaSchema` e `listaSchema` não são exportados** de `content.config.ts`; o teste de paridade com `z.url()` usa `disciplinasSchema` (exportado) com uma aula dentro. A tabela de amostras do plano foi usada inteira.
4. **A forma `-c "echo ready"` regenerou o lock sozinha**, sem subir o `tinacms dev` e matá-lo à mão.
5. **A primeira versão da asserção 1 não detectava o canário A**: o regex exigia `href="..."`, e o Astro grava `<a href class=...>` para `href=""`. Corrigi o helper `linksOf` para contar toda âncora `cartao-link`, com `href` ausente contado como `''`, e só então o canário ficou vermelho (bloco do canário A).
6. **A última aula das duas disciplinas em curso, hoje, não tem link**, então o `dist/` real só exercita o ramo "sem link" do botão e do atalho. O ramo com link do botão foi provado pelo canário (d), que mostra o `href` do canário saindo no botão. No atalho de Ensino a asserção 4 olha só o tipo da tag; o ramo `<a>` aparece no canário (c) (esperado `span`, recebido `a`).
7. **`prepareCourseItems` mantém `url` com espaços nas pontas** e valida com `trim()`. O `z.url()` do Zod apara as pontas (caso unitário em `schemas.test.ts`), e as asserções 1 e 3 esperam `trim()`.
8. O hook de UX do ambiente reclamou de 18 valores literais em `src/styles/global.css`; são pré-existentes (a minha mudança em `global.css` foram um seletor e um comentário).

### Estado da árvore (`git status --short`, sem nada em `content/`)

```
$ git status --short
 M PRD.md
 M docs/avisos-do-painel-para-o-manual.md
 M plans/fase-5-polimento-e-entrega/086-link-opcional-em-aula-e-lista.md
 M src/components/CourseCover.astro
 M src/components/CourseResources.astro
 M src/components/LessonList.astro
 M src/content.config.ts
 M src/styles/global.css
 M src/views/TeachingView.astro
 M tests/content/schemas.test.ts
 M tests/dist/site-gerado.test.ts
 M tina/config.ts
 M tina/tina-lock.json
?? src/lib/course-items.ts
?? tests/content/tina-disciplinas.test.ts
?? tests/lib/course-items.test.ts
EXIT=0
$ git status --short -- content/ | wc -l
0
$ git diff --stat -- content/ | wc -l
0
```

### BOM no plano (item 22 do DESPACHO)

```
$ grep -o $'\xEF\xBB\xBF' <plano> | wc -l
0
EXIT=0
```

### Passo 11 — painel local e hover (orquestrador, 2026-11-21, 18:19–18:31)

Rodado pelo orquestrador **depois** do último ciclo do executor e da suíte autoritativa do ciclo 2 (`triage2`), sem nenhuma edição de código no meio. O que muda nesta seção são só o plano e a lista de verificação.

**Como:** `npx astro dev --background --force` e `npx tinacms dev` separados (README, "Painel de edição"); `http://localhost:4321/admin` em modo local ("When you save, changes will be saved to the local filesystem"). Disciplina de teste criada à mão como rascunho, `content/disciplinas/teste-086.md` (`publicado: false`, `nome: Teste 086`, `status: atual`). **Navegador: Microsoft Edge.** No Vivaldi, a extensão não conseguiu agir: a aba criada saía do grupo da extensão no mesmo instante, inclusive depois de reinstalar a extensão e de mudar o empilhamento de abas. O dono do produto instalou a extensão no Edge, e o teste rodou lá.

Arquivo gravado lido com `cat` depois de cada Save:

1. **Item vazio:** "+" em Aulas, nada preenchido, Save → toast "Document updated!". Arquivo (mtime 18:21:03):
   ```
   ---
   publicado: false
   nome: Teste 086
   status: atual
   aulas: []
   ---
   ```
   O item vazio foi descartado, sem `- {}`. O painel continua mostrando "Nova aula" até recarregar, comportamento do Tina já registrado na memória do projeto.
2. **Item pela metade.** Primeira tentativa, com o campo **vazio**: com o subpainel aberto, o próprio Tina marca Número e Título como "Required", e o Save fica desabilitado enquanto falta o Número. Sair do subpainel, pelo breadcrumb ou pela seta, descartou a edição. **Repetição (ciclo 3 da revisão), com o campo só com espaço, que é o caso do incidente:** disciplina de teste recriada, `npx astro dev` e `npx tinacms dev` de novo. Aula com Número `1` e Título `" "` (um espaço). Lido pelo DOM antes do Save: `{"campos":["\"1\"","\" \"","\"\"","\"\"","\"\""],"saveDesabilitado":false,"required":0}`. O Tina **aceita** o espaço, sem nenhum "Required" e com o Save habilitado. Save → diálogo com o texto `"Não salvo: Aulas, item 1: falta Título."` (lido pelo DOM, porque a captura de tela travou com a janela sem foco). Arquivo antes (`painel-antes.txt`) e depois (`painel-depois-titulo-branco.txt`), capturados no scratchpad, com o `diff` entre os dois vazio:
   ```
   $ date -r content/disciplinas/teste-086.md '+%H:%M:%S'
   18:27:55
   $ cat content/disciplinas/teste-086.md
   ---
   publicado: false
   nome: Teste 086
   status: atual
   ---
   ```
   ```
   $ date -r content/disciplinas/teste-086.md '+%H:%M:%S'
   18:27:55
   $ cat content/disciplinas/teste-086.md
   ---
   publicado: false
   nome: Teste 086
   status: atual
   ---
   ```
   O Tina barra o obrigatório **vazio**, e o `beforeSubmit` barra o obrigatório **em branco**, como observado.
3. **Aula sem link:** número 1, título "Aula sem link", Link vazio (o campo não mostra mais "Required"), Save de dentro do subpainel → "Document updated!". Arquivo (mtime 18:23:15):
   ```
   ---
   publicado: false
   nome: Teste 086
   status: atual
   aulas:
     - numero: 1
       titulo: Aula sem link
   ---
   ```
   A aula foi salva, sem chave `url`.
4. **Link `AAAA`:** no mesmo item, Link `AAAA`, Save → diálogo "Error" do Tina com o texto *Não salvo: Aulas, item 1: o link "AAAA" não é um endereço — comece com https://.* O Tina transforma o "https://." do fim da mensagem em link, o que é só cosmético. O arquivo **não mudou** (mtime continua 18:23:15, mesmo conteúdo do item 3).
5. **Hover** (no `astro dev`, `getComputedStyle` lido com o mouse parado sobre o cartão pela ferramenta `hover` e `li.matches(':hover') === true`):
   - Mecânica Clássica I, primeira aula, **sem link**: `{"hoverNoCartao":true,"borda":"rgba(0, 0, 0, 0)","quadrado":"none"}`. A borda e o quadrado não reagem.
   - Controle: Física Moderna I, primeira aula **com link** ("Aula Inaugural…"): `{"hoverNoCartao":true,"borda":"rgb(17, 17, 18)","quadrado":"matrix(1.05419, -0.1108, 0.1108, 1.05419, 0, 0)"}`. A borda vira tinta, e o quadrado gira e aumenta.

**Limpeza:** aba fechada; `npx astro dev stop` ("Stopped dev server (pid 2708)"); processos `node` do `tinacms` e do `astro` encerrados; portas 9000, 4001 e 4321 livres. `teste-086.md` apagado, e `git status --short -- content/ | wc -l` deu `0`. O `tina/tina-lock.json` continua com a mesma linha de diferença do executor (`git diff --stat`: `1 file changed, 1 insertion(+), 1 deletion(-)`).

**Critérios marcados por esta seção:**
- O do `beforeSubmit`, pelos itens 1, 2 (repetição), 3 e 4: o Tina chama o hook no Save, descarta o vazio e recusa o pela metade e o link inválido com alerta, sem gravar.
- O do hover, pelo item 5.

**Lock regravado pelo `tinacms dev`:** o `tina/tina-lock.json` foi regravado pelo `tinacms dev` do painel, com mtime posterior ao `triage2` (o revisor apontou no ciclo 3). O conteúdo segue com a mesma diferença do executor. `git diff --stat tina/tina-lock.json` dá `1 file changed, 1 insertion(+), 1 deletion(-)`. Depois da segunda sessão, `npx vitest run tests/content/tina-lock-coerente.test.ts tests/content/paridade-schema.test.ts tests/content/tina-disciplinas.test.ts` deu `Test Files  3 passed (3)` e `Tests  38 passed (38)`. Limpeza da segunda sessão: aba fechada, `astro dev stop`, processos encerrados, portas 9000, 4001 e 4321 livres, `teste-086.md` apagado e `git status --short -- content/ | wc -l` = `0`.
