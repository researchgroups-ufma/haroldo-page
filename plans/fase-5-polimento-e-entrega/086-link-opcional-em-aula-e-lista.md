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
| `''`, `' '`, `'  '` | ok, sem a chave | **erro** "expected string" | erro "Invalid URL" |
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

11. **Painel, no Vivaldi**, com `npm run dev`, em `http://localhost:4321/admin`, numa disciplina de
    teste e não nas do professor. Verifique:
    - um "+" em Aulas sem preencher e Save → salva, e o arquivo gravado não tem o item;
    - uma aula com título e sem número → aparece o alerta "Não salvo: Aulas, item N: falta Número."
      e o arquivo não muda;
    - uma aula sem link → salva, sem chave `url`;
    - um link `AAAA` → alerta.

    Abra o arquivo gravado depois de cada save, não só a tela (memória: verificar no painel).
    Descarte a disciplina de teste ao fim.
12. **Produção**, depois do push. O push depende de autorização do dono do produto. Verifique:
    - o check `Workers Builds: haroldo-page` do SHA **completo** do commit termina `success`;
    - a página de Física Moderna em produção mostra as aulas 7 em diante;
    - `gh workflow run vigia-do-deploy.yml` fica verde.

    **O CI `qualidade` vai continuar vermelho** pelo portão de `npm audit` (12 avisos publicados
    desde 2026-11-20, um deles `critical` no `tinacms`), que é um plano à parte. Confirme pelo log
    que o único passo reprovado é `node scripts/auditar-dependencias.mjs` e registre isso na
    Evidência. Um vermelho em qualquer outro passo é falha deste plano.

## Critérios de aceitação

- [ ] Saída "antes" (portão de conteúdo vermelho sobre o conteúdo real) e "depois" (verde), coladas, sem nenhuma mudança em `content/`
- [ ] Aula e lista aceitam link ausente ou em branco; `AAAA` reprova; bibliografia e script aceitam branco (passo 1)
- [ ] `prepareCourseItems` com TSDoc e os testes das seis listas, verdes, incluindo a paridade com `z.url()`
- [ ] `beforeSubmit` de `disciplinas` descarta o vazio e recusa o pela metade e o link inválido, com alerta (passo 3 e passo 11)
- [ ] Item sem link renderiza sem link nem hover de clicável; "Última aula" segue a RN-04, com botão e atalho só quando há link (asserções 1–4)
- [ ] Canários A, B e C vermelhos e desfeitos
- [ ] PRD em v0.1.82 com §7.3, RF-07, RF-24 e §0.1; Aviso 2 atualizado
- [ ] `lint`, `format:check`, `test:coverage`, `build:pipeline`, `test:dist` verdes, com saída colada
- [ ] Workers Builds `success` no SHA completo, vigia verde, e o CI vermelho só no passo de auditoria

## Evidência

<Preenchida pelo executor e pelo orquestrador, com saída literal capturada em arquivo (ver
`plans/DESPACHO.md`). Plano sem esta seção preenchida não é DONE.>
