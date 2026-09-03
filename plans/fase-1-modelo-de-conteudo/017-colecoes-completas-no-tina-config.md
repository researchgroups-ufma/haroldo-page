# Plano 017 — As cinco coleções no `tina/config.ts`, com rótulos em português e templates de nome

**Status:** TODO
**RFs cobertos:** RF-03, RF-04, RF-05, RF-06, RF-07, RF-08, RF-09, RF-10; RN-08; D-05
**Depende de:** plano 015 (Tina instalado). Pode rodar em paralelo com o 016.
**Modelo recomendado:** sonnet
**Agente recomendado:** implementer
**PRD:** `S:\Projetos\academic_page\haroldo\PRD.md`
**Projeto:** `S:\Projetos\academic_page\haroldo`

## Objetivo

`tina/config.ts` descreve as cinco coleções da §7.3 com **vocabulário acadêmico em português**,
textos de ajuda, o interruptor Rascunho/Publicado e nomes de arquivo gerados por template — o
professor nunca digita nome de arquivo.

## Arquivos afetados

- `tina/config.ts` — expandir de uma coleção para cinco

> Não toque em `src/content.config.ts` (plano 016). Se notar divergência entre os dois, **anote
> e reporte** — reconciliar é o plano 019, que é onde o teste de paridade vive.

## Contexto necessário

**Projeto.** `haroldo-page` — site acadêmico do Prof. Haroldo C. D. Lima Junior (UFMA). O plano
015 deixou o Tina instalado com uma coleção `perfil` mínima e `/admin` funcionando.

### O ponto do plano: o painel é para um professor, não para um desenvolvedor

A **RF-03** é explícita: *"o painel apresenta as coleções em vocabulário acadêmico"* — o menu lê
"Perfil", "Linhas de pesquisa", "Projetos", "Disciplinas", "Publicações". Nunca "collections",
"entries", "slug" ou "frontmatter".

A **A-08** foi confirmada pela Q-02 em 2026-09-01: **a interface estrutural do Tina fica em
inglês mesmo** (botões "Save", "Create New") e isso é aceitável. O que tem de estar em português
é tudo que o projeto controla: nomes de coleção, rótulos de campo e textos de ajuda.

**Texto de ajuda em todo campo não óbvio.** `resumo_home` precisa dizer "1–2 frases exibidas na
Home". `status` de disciplina precisa dizer que a transição é manual (RN-03). `destaque` precisa
dizer que a publicação aparece na Home. `url` de material precisa dizer que serve qualquer link
— Drive, repositório institucional, arXiv, YouTube (D-07).

### Regras que este plano materializa

- **RN-08 — nome de arquivo por template, nunca digitado.** Disciplinas:
  `{semestre}-{slug(nome)}.md`. Publicações: `{ano}-{slug(titulo)}.md`. Para
  `linhas-pesquisa` e `projetos` o PRD não prescreve template — **escolha um, coerente com os
  dois acima, e registre a escolha na Evidência.** O projeto já tem um `slugify` em `src/lib/`
  com testes (plano 005): confira se o Tina pode reusá-lo ou se a lógica precisa ser espelhada,
  e **diga qual dos dois na Evidência**.
- **RN-01 / D-04 — interruptor Rascunho/Publicado** nas quatro coleções de listagem, com rótulo
  que um professor entenda. Não em `perfil`.
- **D-05 — aulas, listas e materiais embutidos** na disciplina, como campos de objeto repetíveis.
  O professor abre a disciplina e vê tudo num lugar só. **Não** crie coleção separada de aulas.
  Configure o rótulo de item da lista para mostrar algo útil (o título da aula, não "Item 1").
- **D-02 — sem visual editing.** Formulários, só.
- **D-07 — URL livre.** Nenhuma validação de domínio.

**O grupo "Versão em inglês" NÃO entra aqui** — é o plano 018.

**Não crie a coleção `noticias`** (v1.1, NG-01).

### Cuidado com a paridade

A **D-06** diz que o Zod é o portão de validação e o Tina é a interface de entrada, com paridade
garantida por teste. Um campo que exista só no Tina produz frontmatter que o Zod rejeita, e o
build quebra com um erro que o professor não sabe diagnosticar (F-09, RNF-09). Escreva os
campos olhando a §7.3, **não** olhando o `src/content.config.ts` — assim o teste do plano 019
compara duas leituras independentes da mesma fonte, em vez de uma cópia de si mesma.

**Ambiente.** Windows 11 / PowerShell. Node 24.16.0.

## Passos

1. Transcrever as cinco coleções da §7.3 para `tina/config.ts`, com rótulos em português.
   → verify: `npm run build` verde; `/admin` lista as cinco coleções com os nomes corretos.
2. Acrescentar texto de ajuda a todo campo não óbvio.
   → verify: liste na Evidência os campos que receberam ajuda e os que julgou óbvios.
3. Configurar os templates de nome de arquivo (RN-08) das quatro coleções de pasta.
   → verify: criar um item de cada pelo painel e conferir o nome do arquivo gerado.
4. Configurar o interruptor Rascunho/Publicado nas quatro coleções de listagem.
   → verify: visível no formulário, com rótulo em português.
5. Configurar aulas, listas e materiais como listas embutidas com rótulo de item útil.
   → verify: acrescentar uma aula pelo painel e ver o título dela na lista, não "Item 1".
6. **Verificação objetiva:** criar um item de cada coleção pelo painel e conferir os arquivos.
   → verify: `git status --short` lista os cinco arquivos, com os nomes que o template previa.
   Remova-os ao fim — o conteúdo real é o plano 020.

## Critérios de aceitação

- [x] As cinco coleções em `tina/config.ts`, sem `noticias`
- [x] Nomes de coleção e **rótulos de todos os campos em português** (RF-03)
- [x] Texto de ajuda em todo campo não óbvio, com a lista dos que ficaram sem e o motivo
- [x] Templates de nome de arquivo nas quatro coleções de pasta (RN-08); escolha registrada
      para `linhas-pesquisa` e `projetos`, que o PRD não prescreve
- [x] Registrado se o `slugify` de `src/lib/` é reusado ou espelhado
- [x] Interruptor Rascunho/Publicado nas quatro de listagem; ausente em `perfil`
- [x] Aulas, listas e materiais **embutidos**, com rótulo de item útil (D-05)
- [x] Grupo "Versão em inglês" **não** incluído — é o plano 018
- [x] Visual editing **não** configurado (D-02)
- [x] **Verificação objetiva:** um item de cada coleção criado pelo painel, com o nome de
      arquivo previsto pelo template, e removido depois
- [ ] `npm run lint`, `npm run format:check`, `npm run test` e `npm run build` verdes
- [x] Divergências percebidas em relação ao `src/content.config.ts` **anotadas e reportadas**,
      não corrigidas aqui

> **Nota sobre o critério não marcado** (texto original da linha acima preservado,
> esclarecimento aqui fora da linha do critério, a pedido da revisão):
> - De `npm run lint`, `npm run format:check`, `npm run test` e `npm run build`: os três
>   primeiros (`lint`, `format:check`, `test:coverage`) fecharam verdes. `npm run build`
>   ficou vermelho, bloqueado em `ERR_CLOUD_CHECK_FAILED` — a mesma armadilha #1 do README da
>   fase (herdada do plano 015): o TinaCloud só reindexa depois de commit + push, fora do
>   escopo deste plano. A revisão julgou esse vermelho **não bloqueante** para o plano 017;
>   o orquestrador roda `npm run build` de novo depois do push. Ver seção correspondente na
>   Evidência para a saída literal.
>
> **Nota sobre o critério marcado "Verificação objetiva"**: cumprido pelo orquestrador, não pelo
> executor (implementer, sem ferramenta de navegador) — precisão pedida pela revisão, sem
> arredondar para "um item de cada uma das cinco coleções": o orquestrador **criou e removeu**
> um item nas **quatro coleções de pasta** (`linhas-pesquisa`, `disciplinas`, `publicacoes`,
> `projetos`), com os nomes de arquivo batendo com o template. Em `perfil` (singleton, sem
> template de nome de arquivo) ele **abriu** o `index.md` existente pelo painel e conferiu os 12
> campos e a ausência do interruptor "Publicado" — **sem salvar**, de propósito, para não
> disparar a reserialização que apaga o comentário da Q-07 (ver seção "Armadilha #3 do README
> da fase (Q-07)" na Evidência). Detalhe completo na seção "Verificação objetiva" da Evidência.

## Evidência

### Decisão registrada — `corpo`, `ementa`, `resumo`: frontmatter (string), não corpo Markdown

Confirmo a escolha do plano 016, mas por um motivo técnico descoberto **neste** plano, não por
inércia: consultei o tipo `RichTextField` de `@tinacms/schema-tools`
(`node_modules/@tinacms/schema-tools/dist/types/index.d.ts`, campo `isBody`) e confirmei que:

- `type: 'rich-text'` sem `isBody: true` serializa o campo no frontmatter como uma árvore de
  sintaxe (`{ type: 'root', children: [...] }`), **não** como string — incompatível com o
  `z.string()` do schema Zod atual (`corpo`, `ementa`, `resumo` são `z.string().optional()`).
- `type: 'rich-text'` com `isBody: true` tira o campo do frontmatter e o transforma no corpo
  Markdown do arquivo — o que o Zod (que só valida `data`, via Content Layer API) deixaria de
  enxergar, quebrando a paridade D-06 sem tocar em `src/content.config.ts` (fora do escopo
  deste plano — reconciliar é o 019).

A única opção que preserva string plana em frontmatter dos dois lados é `type: 'string'` com
`ui: { component: 'textarea' }` — a mesma solução já usada para `bio` desde o plano 015. Os
três campos (`corpo`, `ementa`, `resumo`) foram modelados assim. Migrar para corpo Markdown via
`render()` fica para quando a fase 3 decidir como o texto longo será renderizado (nota já
registrada no cabeçalho de `src/content.config.ts` e repetida no cabeçalho de `tina/config.ts`).

### Escolha de template de nome de arquivo — `linhas-pesquisa` e `projetos`

O PRD não prescreve template para essas duas coleções. Escolhi `{slug(titulo)}.md` para as
duas, pelo mesmo raciocínio: `titulo` é o único campo sempre presente e estável nas duas — ao
contrário de `disciplinas` (`semestre` sempre presente) e `publicacoes` (`ano` sempre presente),
nem `linhas-pesquisa` nem `projetos` têm um segundo campo obrigatório e estável para compor o
prefixo. Cogitei usar `periodo.inicio` como prefixo do nome de `projetos` (espelhando o padrão
"prefixo-slug" de `disciplinas`/`publicacoes`), mas `periodo` é **opcional** na §7.3 — um
projeto sem período ainda precisa de nome de arquivo previsível, e "undefined-slug-do-titulo"
seria pior que simplesmente omitir o prefixo. `{slug(titulo)}.md` sozinho é coerente e sempre
gerável.

### `slugify` — reusado, não espelhado

`tina/config.ts` importa `slugify` de `../src/lib/slug` diretamente (linha 73). Confirmado
empiricamente rodando `tinacms dev`, que empacota `tina/config.ts` com esbuild (via
`@tinacms/cli`) e resolve o import relativo para o módulo TypeScript do projeto sem nenhuma
configuração adicional — não precisei espelhar a função. `npx tsc --noEmit` (saída abaixo)
também não acusou nenhum erro de tipo nesse import.

### Descoberta não prevista no plano — `name` da coleção não aceita hífen

Ao rodar `npm run build` pela primeira vez com o schema completo, a CLI do Tina rejeitou
`name: 'linhas-pesquisa'`:

```
TinaSchemaValidationError: name, "linhas-pesquisa" must be alphanumeric and can only contain underscores. (No spaces, dashes, special characters, etc.)
```

`name` é o identificador GraphQL interno da coleção — diferente de `label` (o que o professor
vê) e de `path` (a pasta real em `content/`), que não têm essa restrição. Corrigido para
`name: 'linhas_pesquisa'` (mantendo `label: 'Linhas de pesquisa'` e
`path: 'content/linhas-pesquisa'` com hífen) e propagado para
`projetos.linha_relacionada.collections: ['linhas_pesquisa']`. Documentado no cabeçalho de
`tina/config.ts` e como divergência de nome interno para o plano 019 (ver seção abaixo) — o
identificador Tina (`linhas_pesquisa`) difere da chave de coleção do Astro/Zod
(`'linhas-pesquisa'`, em `src/content.config.ts`), embora a pasta em disco seja a mesma.

### Campos com texto de ajuda e campos sem — com o motivo

**`perfil`** — com ajuda: `cargo`, `foto`, `bio`, `resumo_home`, `ano` (dentro de `formacao`),
`areas`, `email`, `links` (grupo), `cv_url`. Sem ajuda (autoevidentes pelo rótulo): `nome`,
`instituicao`, `departamento`, `grau`/`curso`/`instituicao` (dentro de `formacao` — o rótulo já
diz o que preencher), os sete subcampos de `links` (`lattes`, `orcid`, `scholar`, `arxiv`,
`researchgate`, `github`, `institucional` — cada um é o nome da própria plataforma).

**`linhas-pesquisa`** — com ajuda: `publicado`, `ordem`, `resumo`, `corpo`. Sem ajuda: `titulo`,
`imagem` (autoevidentes).

**`projetos`** — com ajuda: `publicado`, `fim` (dentro de `periodo`), `colaboradores`,
`linha_relacionada`. Sem ajuda: `titulo`, `inicio` (dentro de `periodo`), `financiador`,
`status` (opções já são o rótulo), `descricao` (campo de texto livre, rótulo já basta).

**`disciplinas`** — com ajuda: `publicado`, `nome`, `codigo`, `semestre`, `status`, `descricao`,
`url` (dentro de `bibliografia`), grupo `aulas`, `url` (dentro de `aulas`), `url` (dentro de
`listas`), grupo `materiais`, `url` (dentro de `materiais`), grupo `links`. Sem ajuda: `ementa`
(termo acadêmico padrão, autoevidente), `referencia` (dentro de `bibliografia`), `numero`/
`titulo`/`data`/`descricao` (dentro de `aulas`), `titulo`/`data_entrega` (dentro de `listas`),
`titulo`/`tipo`/`descricao` (dentro de `materiais`), `titulo`/`url` (dentro de `links` — a ajuda
já está no grupo).

**`publicacoes`** — com ajuda: `publicado`, `autores`, `ano`, `veiculo`, `pdf_url`, `resumo`,
`palavras_chave`, `destaque`. Sem ajuda: `titulo`, `tipo` (opções já são o rótulo), `doi`,
`arxiv` (nomes de identificador padrão, autoevidentes).

### Divergências percebidas em relação a `src/content.config.ts` (não corrigidas — reportadas)

1. **Divergência real de paridade — formato do valor de `projetos.linha_relacionada` (achada
   pela revisão, não por mim).** O campo `reference` do Tina grava, como valor, o **id do
   documento referenciado — o caminho completo com extensão**:
   `content/linhas-pesquisa/minha-linha.md` (fonte:
   `node_modules/@tinacms/graphql/dist/index.js:4931`, `id: fullPath`; e
   `node_modules/tinacms/dist/index.js:6058-6069`). Do outro lado, `reference('linhas-pesquisa')`
   do Astro (`node_modules/astro/dist/content/runtime.js:508-534`) monta a entrada como
   `{ id: 'content/linhas-pesquisa/minha-linha.md', collection }` **sem validar existência**, e o
   `glob({ base: './content/linhas-pesquisa' })` do `content.config.ts` gera ids como
   `minha-linha` (sem `content/linhas-pesquisa/` nem `.md`). Os dois formatos concretos,
   lado a lado:
   - **Tina grava:** `"content/linhas-pesquisa/minha-linha.md"`
   - **Astro/Zod espera (id do `glob` loader):** `"minha-linha"`

   Nada quebra no build — `getEntry()` simplesmente devolve `undefined` na fase 3. É falha
   **silenciosa**, não um erro que apareça em `npm run build` ou `npm run test`. Um teste de
   paridade que compare só nome/tipo/obrigatoriedade de campo (o eixo que eu tinha comparado
   antes desta revisão) **não detecta isso** — o 019 precisa de uma asserção específica sobre o
   **formato do valor** de campos `reference`, não só sobre a forma do schema. Confirmado
   empiricamente pelo orquestrador pelo painel: um projeto salvo sem tocar no campo gravou
   `linha_relacionada: ''`; um projeto salvo apontando para uma linha de pesquisa grava o
   caminho completo, que o `reference()` do Zod aceita sintaticamente mas que não resolve a
   nenhum documento real. Aviso equivalente deixado como `// NOTE:` junto ao campo em
   `tina/config.ts`. Não corrigido aqui — reconciliar é o plano 019.
2. **Identificador interno da coleção `linhas-pesquisa`.** O Tina exige `name` alfanumérico/
   underscore; usei `linhas_pesquisa`. O Zod usa a chave `'linhas-pesquisa'` (com hífen) no
   objeto `collections` de `src/content.config.ts`, que também é o nome da pasta em `content/`.
   A pasta em disco é idêntica nos dois lados — só o identificador GraphQL interno do Tina
   diverge. Sinalizo isso para o plano 019: um teste de paridade ingênuo que compare `name` de
   coleção do Tina com a chave do Zod por igualdade de string vai falhar aqui por um motivo que
   não é um bug de schema.
3. **Correção à minha própria alegação anterior.** Eu havia escrito aqui "nenhuma divergência de
   campo, obrigatoriedade ou tipo encontrada", com base em comparação manual de nome, tipo e
   obrigatoriedade dos campos das cinco coleções. Essa comparação continua correta **no eixo que
   eu cobri** — mas a revisão (item 1 acima e item 4 abaixo) achou duas divergências reais que
   esse eixo não captura: formato do valor de campo `reference`, e imposição de campo obrigatório
   dentro de objeto de lista aninhada. Ou seja: a comparação manual de "nome/tipo/obrigatoriedade
   no nível do campo" não é suficiente para garantir paridade — exatamente o aviso do README da
   fase ("é esperado que o 019 encontre divergências reais; se não encontrar nenhuma, desconfie
   do teste antes de comemorar"), confirmado agora com casos concretos.
4. **Objeto obrigatório dentro de lista aninhada não é imposto no save do Tina (achado do
   orquestrador, passo 6).** Uma `aula` nova, adicionada sem preencher `numero`, `titulo` nem
   `url` (os três `required: true` no objeto `aulas[]`), foi salva no documento pai como
   `aulas: [ {} ]` — o Tina não bloqueou o save do documento por causa de um subcampo obrigatório
   vazio dentro de uma lista de objetos. O Zod rejeitaria esse frontmatter (`numero: z.number()`,
   `titulo: z.string()`, `url: z.url()`, nenhum opcional) — o professor levaria um build quebrado
   sem saber diagnosticar (F-09, RNF-09). Registrado como divergência de paridade para o 019;
   nada corrigido aqui — não há mudança de schema que resolva isso do lado do Tina sem lógica de
   validação customizada, fora do escopo deste plano.
5. **Restrições finas do Zod não replicadas no Tina — intencional, por D-06.** `publicacoes.ano`
   (Zod: `1900 ≤ ano ≤ 2100`), `publicacoes.autores` (Zod: mínimo 1 item), `perfil.email` (Zod:
   `z.email()`), e todos os campos `z.url()` (`links.*`, `cv_url`, `pdf_url`, `aulas[].url`,
   `listas[].url`, `materiais[].url`, `links[].url` em disciplinas) não têm validação
   equivalente no Tina — o Tina não tem tipo nativo de URL nem validação de faixa numérica sem
   função customizada. Isso é o ponto de D-06 (Zod é o portão, Tina é a interface de entrada),
   não uma omissão; registro para não ser confundido com uma lacuna de paridade pelo plano 019.

### Armadilha #3 do README da fase (Q-07) — materializada

O README avisava: *"Quando o 017 puser `email` no schema do Tina, o painel passa a poder
reserializar o arquivo e o comentário some."* Este plano pôs `email` como campo obrigatório no
schema (`perfil.email`). O Tina reserializa o frontmatter com `gray-matter` + `js-yaml`
(`node_modules/@tinacms/graphql/dist/index.js:3418-3419` e `:3619`, `matter.stringify`), que
**não preserva comentários YAML**. Consequência operacional: o primeiro save do formulário
"Perfil" pelo painel apaga as seis linhas de comentário em `content/perfil/index.md` que marcam
`email: PLACEHOLDER@ufma.br` como fictício e registram a Q-07 como aberta até a fase 3. Nada foi
corrigido no código por causa disso — o mecanismo é do Tina, não deste schema, e reescrever o
schema não evita a reserialização em si. O orquestrador confirmou pelo painel que abriu o
formulário "Perfil" e **não salvou**, exatamente para preservar o marcador; o md5 de
`content/perfil/index.md` permanece intacto. Fica registrado como aviso operacional: **qualquer
save real do Perfil pelo painel, a partir de agora, apaga o comentário da Q-07** — quem for
tocar nisso (plano 020 ou fase 3) precisa substituir o e-mail placeholder por um institucional
real antes do primeiro save, não depois.

### Achado empírico — `publicado: required` bloqueava o formulário de item novo (ciclo 2 — `ui.defaultValue` refutado, `defaultItem` corrige, verificado pelo orquestrador)

**Ciclo 1 (revertido).** Eu havia aplicado `ui: { defaultValue: false }` no campo `publicado`
das quatro coleções de listagem, com um comentário afirmando que isso "resolve sem mudar `type`
nem `required`". **O orquestrador testou no painel (`astro dev` + `tinacms dev` no ar) e refutou
essa afirmação:** o formulário carrega limpo (sem "Required"), mas depois de preencher os
campos de texto obrigatórios sem tocar no interruptor, "Required" aparece sob "Publicado" e o
Save fica desabilitado — confirmado por screenshot e pelo texto acessível da página
(`Publicado / Quando desmarcado... / Required` antes de `Nome`). Ou seja: `ui.defaultValue` só
adia a validação até a primeira interação do usuário com **qualquer** campo do formulário; ele
não semeia o valor `false` no documento novo. O comentário no código estava errado — divergência
entre doc e código que o CLAUDE.md manda reportar, não esconder. **Removido**: os quatro
`ui: { defaultValue: false }` e os comentários correspondentes, revertidos ao estado sem essa
tentativa.

**Ciclo 2 (verificado pelo orquestrador em 2026-09-03 — funciona).** Usei `defaultItem` no
**nível da coleção** (`BaseCollection.defaultItem`,
`node_modules/@tinacms/schema-tools/dist/types/index.d.ts:811-814`) para semear o valor inicial
do documento novo, não `ui.defaultValue` no campo. **Correção sobre a fonte, apontada pela
segunda revisão:** eu havia chamado isso de "o mecanismo documentado do Tina" — impreciso. A
linha citada está marcada `@deprecated` no próprio tipo:

```
811     /**
812      * @deprecated - use `ui.defaultItem` on the each `template` instead
813      */
814     defaultItem?: DefaultItem<Record<string, any>>;
```

O JSDoc recomenda `ui.defaultItem` em `template`, não `defaultItem` na coleção. Mas essa
alternativa **não é utilizável aqui**: o tipo `UICollection`
(`node_modules/@tinacms/schema-tools/dist/types/index.d.ts:868`) não declara `defaultItem` — o
próprio runtime do Tina acessa essa propriedade recorrendo a
`// @ts-ignore internal types aren't up to date`
(`node_modules/tinacms/dist/index.js:75157-75159`), e nossas cinco coleções usam `fields`
diretamente, não `templates` (onde `ui.defaultItem` seria tipado). `BaseCollection.defaultItem`
depreciado é, portanto, a única forma **type-safe** disponível para uma coleção baseada em
`fields`, e é escolha deliberada, não desconhecimento da depreciação. **Risco sinalizado para a
fase 3:** um upgrade do Tina pode remover `BaseCollection.defaultItem` sem aviso — se isso
acontecer, o sintoma volta a ser o do ciclo 1 (formulário nasce válido, fica "Required" na
primeira interação). `npx tsc --noEmit` e o diagnóstico `tinacms build --skip-cloud-checks`
(saídas abaixo) confirmaram que o schema com `defaultItem` compila sem erro — mas isso só
provava que a sintaxe era aceita, não que o formulário nascia com `publicado: false`; deixei o
comentário no código como "pendente de verificação pelo painel" e não marquei nada como resolvido
até essa prova vir.

O orquestrador reiniciou `tinacms dev` do zero, recarregou o formulário de disciplina novo
(`#/collections/new/disciplinas/~/`) e reportou:

1. **O "Required" espúrio sumiu do interruptor.** Com `Semestre` e `Status` preenchidos e o
   interruptor nunca tocado, "Publicado" aparece sem erro; o único "Required" da tela ficou sob
   "Nome" (campo de fato vazio no teste). No ciclo 1, com `ui.defaultValue`, o erro ficava sob
   "Publicado" nessa mesma situação.
2. **O valor chega ao arquivo.** Preencheu só `nome`, `semestre` e `status`, salvou **sem tocar
   no interruptor**, e o arquivo gerado (removido depois do teste, `git status --short` mostra
   só os três arquivos deste plano) saiu assim:

```
S:\Projetos\academic_page\haroldo\content\disciplinas\2027.1-rascunho-sem-tocar.md

---
publicado: false
nome: Rascunho Sem Tocar
codigo: ent
semestre: '2027.1'
status: anterior
---
```

`publicado: false` no frontmatter sem qualquer interação com o campo — a prova pedida. (`codigo:
ent` é resíduo da automação do orquestrador, não do schema — não indica nenhum problema em
`tina/config.ts`.)

Comentário no código atualizado (`tina/config.ts`, nas quatro coleções de listagem) trocando
"PENDENTE DE VERIFICAÇÃO PELO PAINEL" por "Verificado pelo orquestrador no painel em
2026-09-03: documento novo salvo sem tocar no interruptor gravou `publicado: false` no
frontmatter".

**O que continua sem solução — limitação genérica do Tina, não deste schema, registrada para a
fase 3.** Com qualquer campo obrigatório de uma lista embutida ainda vazio (ex.: `aulas[]`,
`listas[]`, `materiais[]`), adicionar um novo item de lista ainda dispara o modal "Cannot
navigate away from an invalid form", sem indicar qual campo está faltando. `defaultItem` no
nível da coleção só semeia os campos de topo do documento (aqui, só `publicado`); não alcança
subcampos obrigatórios dentro de listas de objeto, que nascem vazios a cada novo item
adicionado. Isso não é um defeito deste plano nem tem correção de schema — é comportamento do
Tina em qualquer lista de objeto com campo obrigatório. Fica registrado como um ponto que o
professor vai encontrar na prática (ex.: ao tentar sair de uma aula recém-adicionada sem
preencher `numero`/`titulo`/`url`) e que a fase 3 precisa saber, ao lado do achado já registrado
de que o Tina também **não bloqueia o save do documento pai** quando esse mesmo subcampo
obrigatório fica vazio (ver "Achado empírico — objeto obrigatório em lista aninhada não bloqueia
o save", abaixo) — os dois comportamentos são inconsistentes entre si (bloqueia navegação dentro
do item, mas não bloqueia o save do documento pai) e nenhum dos dois identifica o campo.

### Achado empírico — objeto obrigatório em lista aninhada não bloqueia o save (registrado, não corrigido)

Ver item 4 da seção "Divergências percebidas" acima — o orquestrador salvou uma `aula` vazia
(`aulas: [ {} ]`) apesar de `numero`, `titulo` e `url` serem `required: true` no objeto. Não há
mudança de schema do lado do Tina que resolva isso sem lógica de validação customizada; fica
registrado para o 019/fase 3.

### Achado empírico — texto de ajuda descrevia um widget que não existe (corrigido, três de três)

`autores` (publicações), `areas` (perfil) e `palavras_chave` (publicações) diziam "Um nome por
linha" / "Uma área por linha" / "Uma palavra-chave por linha", mas os três campos são listas com
botão "+" — um item por entrada, não uma quebra de linha dentro de um textarea. Corrigidos os
três (no ciclo 1, `autores` e `areas`; no ciclo 2, `palavras_chave` — resíduo apontado pela
revisão, mesmo padrão dos outros dois):

- `autores`: `'Um autor por item, na ordem da citação — toque em "+" para adicionar outro; o nome do professor é destacado automaticamente na exibição.'`
- `areas`: `'Uma área por item — toque em "+" para adicionar outra.'`
- `palavras_chave`: `'Uma palavra-chave por item — toque em "+" para adicionar outra.'`

### `npm run lint`

```
> haroldo-page@0.1.0 lint
> eslint .

LINT_EXIT=0
```

### `npm run format:check`

```
> haroldo-page@0.1.0 format:check
> prettier --check .

Checking formatting...
All matched files use Prettier code style!
```

### `npm run test:coverage`

```
> haroldo-page@0.1.0 test:coverage
> vitest run --coverage


 RUN  v4.1.11 S:/Projetos/academic_page/haroldo
      Coverage enabled with v8


 Test Files  3 passed (3)
      Tests  59 passed (59)
   Start at  14:05:22
   Duration  1.29s (transform 530ms, setup 0ms, import 824ms, tests 30ms, environment 0ms)

 % Coverage report from v8
-------------------|---------|----------|---------|---------|-------------------
File               | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
-------------------|---------|----------|---------|---------|-------------------
-------------------|---------|----------|---------|---------|-------------------

=============================== Coverage summary ===============================
Statements   : 100% ( 21/21 )
Branches     : 100% ( 2/2 )
Functions    : 100% ( 1/1 )
Lines        : 100% ( 21/21 )
================================================================================
```

Este plano não criou módulo novo em `src/` — a cobertura relatada é a pré-existente do projeto,
inalterada por este plano.

**Re-executado depois das correções da revisão, ciclo 1** (comentário `// NOTE:` em
`linha_relacionada`, `ui.defaultValue: false` nos quatro `publicado` — revertido no ciclo 2, ver
seção "Achado empírico — `publicado: required`..." acima —, textos de `autores`/`areas`) — mesmo
resultado:

```
> haroldo-page@0.1.0 lint
> eslint .

(sem saída — exit 0)

> haroldo-page@0.1.0 format:check
> prettier --check .

Checking formatting...
All matched files use Prettier code style!

> haroldo-page@0.1.0 test:coverage
> vitest run --coverage

 RUN  v4.1.11 S:/Projetos/academic_page/haroldo
      Coverage enabled with v8

 Test Files  3 passed (3)
      Tests  59 passed (59)
   Start at  14:29:04
   Duration  831ms (transform 492ms, setup 0ms, import 753ms, tests 29ms, environment 0ms)

 % Coverage report from v8
-------------------|---------|----------|---------|---------|-------------------
File               | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s
-------------------|---------|----------|---------|---------|-------------------
-------------------|---------|----------|---------|---------|-------------------

=============================== Coverage summary ===============================
Statements   : 100% ( 21/21 )
Branches     : 100% ( 2/2 )
Functions    : 100% ( 1/1 )
Lines        : 100% ( 21/21 )
================================================================================

$ npx tsc --noEmit
(sem saída — 0 erros)
```

### `npx tsc --noEmit` (checagem de tipos de `tina/config.ts` — `astro check` não cobre `tina/`)

```
(sem saída — 0 erros)
```

`astro check` (também rodado, abaixo) só varre arquivos `.astro`; `tina/config.ts` é `.ts` fora
de `src/`, então a checagem de tipo dele passa por `tsc --noEmit` direto, coberto pelo
`tsconfig.json` (`include: [".astro/types.d.ts", "**/*"]`).

### `npx astro check`

```
[content] Syncing content
[WARN] [glob-loader] No files found matching "**/*.md" in directory "content\publicacoes"
[WARN] [glob-loader] No files found matching "**/*.md" in directory "content\linhas-pesquisa"
[WARN] [glob-loader] No files found matching "**/*.md" in directory "content\projetos"
[WARN] [glob-loader] No files found matching "**/*.md" in directory "content\disciplinas"
[content] Synced content
[types] Generated 555ms
[check] Getting diagnostics for Astro files in S:\Projetos\academic_page\haroldo...
Result (16 files):
- 0 errors
- 0 warnings
- 0 hints
```

Os avisos `No files found matching` são esperados: as quatro coleções de pasta ainda não têm
conteúdo (o placeholder é o plano 020) — não são erro deste plano.

**Re-executado depois das correções da revisão**, mesmo resultado:

```
[vite] Re-optimizing dependencies because vite config has changed
[content] Syncing content
[WARN] [glob-loader] No files found matching "**/*.md" in directory "content\linhas-pesquisa"
[WARN] [glob-loader] No files found matching "**/*.md" in directory "content\projetos"
[WARN] [glob-loader] No files found matching "**/*.md" in directory "content\disciplinas"
[WARN] [glob-loader] No files found matching "**/*.md" in directory "content\publicacoes"
[content] Synced content
[types] Generated 463ms
[check] Getting diagnostics for Astro files in S:\Projetos\academic_page\haroldo...
Result (16 files):
- 0 errors
- 0 warnings
- 0 hints
```

### `npm run build` — bloqueado no mesmo ponto documentado pelo plano 015

Rodando o comando autoritativo tal como o despacho pede (`tinacms build && astro check && astro
build`):

```
> haroldo-page@0.1.0 build
> tinacms build && astro check && astro build

Starting Tina build

Checking indexing process in TinaCloud...

The local GraphQL schema doesn't match the remote GraphQL schema. Please push up your changes to GitHub to update your remote GraphQL schema. null

Additional info:

	Branch: main, Client ID: 8be98053-68c3-4262-b7bd-dd1286e1c7ad
	Local GraphQL version: 2.4.10 / Remote GraphQL version: 2.4.10
	Last indexed at: Thu, 03 Sep 2026 00:13:45 GMT
	Reason: [NON_BREAKING - TYPE_ADDED] Type 'PerfilFormacao' was added

Error: The local GraphQL schema doesn't match the remote GraphQL schema. Please push up your changes to GitHub to update your remote GraphQL schema. null
...
  errorCode: 'ERR_CLOUD_CHECK_FAILED'
```

Isto é a mesma armadilha #1 do README da fase (herdada do plano 015): `tinacms build` valida o
schema local contra o que o TinaCloud já indexou em `main`. Como este plano muda o schema e eu
não commito nem faço push (regra da casa), o TinaCloud continua indexando o schema anterior —
o erro é esperado e só se resolve depois que o orquestrador commitar, empurrar e o TinaCloud
reindexar. Não é um defeito deste plano; **não** contornei isso enfraquecendo o comando ou
reescrevendo a asserção — deixei o critério de aceitação correspondente sem marcar.

Para validar a parte que **não** depende do TinaCloud (o schema em si e a integração com o
Astro), rodei o mesmo diagnóstico que o plano 015 documentou, sem substituir o comando oficial:

```
$ npx tinacms build --skip-cloud-checks --skip-indexing --skip-search-index --port 4498 --datalayer-port 9498
Starting Tina build
○  Tina build complete ──────────────────────────────────────
│  🦙 Tina Config
│     API url:            https://content.tinajs.io/2.4/content/8be98053-68c3-4262-b7bd-dd1286e1c7ad/github/main
│  🤖 Auto-generated files
│     GraphQL Client:     tina/__generated__/client.ts
│     Typescript Types:   tina/__generated__/types.ts
│     Static HTML file:   public/admin/index.html
```

```
$ npx astro build
[build] output: "static"
[build] mode: "static"
[build] Rearranging server assets...
 generating static routes 
  ├─ /index.html (+9ms) 
 ✓ Completed in 20ms.
[build] ✓ Completed in 384ms.
[build] 1 page(s) built in 812ms
[build] Complete!
```

**Diagnóstico re-executado depois das correções da revisão** (`--skip-cloud-checks`, mesmo
resultado, confirmando que o schema com as correções ainda compila):

```
$ npx tinacms build --skip-cloud-checks --skip-indexing --skip-search-index --port 4498 --datalayer-port 9498
Starting Tina build
○  Tina build complete ──────────────────────────────────────
│  🦙 Tina Config
│     API url:            https://content.tinajs.io/2.4/content/8be98053-68c3-4262-b7bd-dd1286e1c7ad/github/main
│  🤖 Auto-generated files
│     GraphQL Client:     tina/__generated__/client.ts
│     Typescript Types:   tina/__generated__/types.ts
│     Static HTML file:   public/admin/index.html
```

### Ciclo 2 — suíte re-executada depois de reverter `ui.defaultValue`, aplicar `defaultItem` e corrigir `palavras_chave`

```
$ npm run format:check
> haroldo-page@0.1.0 format:check
> prettier --check .

Checking formatting...
All matched files use Prettier code style!

$ npm run lint
> haroldo-page@0.1.0 lint
> eslint .

(sem saída — exit 0)

$ npx tsc --noEmit
(sem saída — 0 erros)

$ npx tinacms build --skip-cloud-checks --skip-indexing --skip-search-index --port 4498 --datalayer-port 9498
Starting Tina build
○  Tina build complete ──────────────────────────────────────
│  🦙 Tina Config
│     API url:            https://content.tinajs.io/2.4/content/8be98053-68c3-4262-b7bd-dd1286e1c7ad/github/main
│  🤖 Auto-generated files
│     GraphQL Client:     tina/__generated__/client.ts
│     Typescript Types:   tina/__generated__/types.ts
│     Static HTML file:   public/admin/index.html

$ npm run test:coverage
> haroldo-page@0.1.0 test:coverage
> vitest run --coverage

 RUN  v4.1.11 S:/Projetos/academic_page/haroldo
      Coverage enabled with v8

 Test Files  3 passed (3)
      Tests  59 passed (59)
   Start at  14:38:12
   Duration  882ms (transform 531ms, setup 0ms, import 811ms, tests 33ms, environment 0ms)

 % Coverage report from v8
-------------------|---------|----------|---------|---------|-------------------
File               | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s
-------------------|---------|----------|---------|---------|-------------------
-------------------|---------|----------|---------|---------|-------------------

=============================== Coverage summary ===============================
Statements   : 100% ( 21/21 )
Branches     : 100% ( 2/2 )
Functions    : 100% ( 1/1 )
Lines        : 100% ( 21/21 )
================================================================================
```

### `tina/tina-lock.json` — regenerado e verificado (três rodadas)

**Rodada 1** (schema inicial das cinco coleções): rodei `npx tinacms dev -c "echo ready"` uma vez
(o comando filho termina imediatamente, o que encerra o processo do Tina sozinho — confirmado
sem processo `node.exe` residual depois). O hash do arquivo mudou (`50e07246...` →
`ec16573905...`) e o conteúdo passou a listar as cinco coleções:

```
$ grep -o '"linhas_pesquisa"\|"projetos"\|"disciplinas"\|"publicacoes"\|"perfil"' tina/tina-lock.json | sort -u
disciplinas
linhas_pesquisa
perfil
projetos
publicacoes
```

**Rodada 2** (depois das correções da revisão — `ui.defaultValue` nos quatro `publicado`): o
schema mudou de novo, então regenerei o lock outra vez com o mesmo procedimento. Hash mudou de
novo (`ec16573905...` → `f95fc6b7c7...`), sem processo `node.exe` residual depois:

```
$ md5sum tina/tina-lock.json
f95fc6b7c7976aae02617cb7e6b99841 *tina/tina-lock.json
$ git status --short tina/tina-lock.json
 M tina/tina-lock.json
```

**Rodada 3 (ciclo 2 — reverter `ui.defaultValue`, aplicar `defaultItem`, corrigir
`palavras_chave`): verificada pelo orquestrador, não mais inferência.** Minha tentativa de
regenerar rodando `npx tinacms dev -c "echo ready"` falhou (porta 9000 já em uso por um
`tinacms dev` em execução):

```
🦙 TinaCMS Dev Server is initializing...
Error: Tina Dev server is already in use. Datalayer server is busy on port 9000
```

Eu havia registrado como hipótese, por comparação de `mtime` (`tina/tina-lock.json` às
`14:37:11`, ~2s depois do meu último edit em `tina/config.ts` às `14:37:09`), que o dev server já
ativo tinha captado a mudança por file-watch e regenerado o lock sozinho — mas sem confirmação
direta. **O orquestrador verificou e confirmou**: matou o `tinacms dev` antigo, subiu um novo do
zero, e o md5 de `tina/tina-lock.json` permaneceu `920af9a27ca48e3d97c044eb599b8e07` — idêntico
ao de antes do reinício. O lock contém `defaultItem` e as cinco coleções
(`perfil`, `linhas_pesquisa`, `projetos`, `disciplinas`, `publicacoes`). Ou seja: o lock estava
atualizado e é reprodutível a partir de um reinício limpo — não uma coincidência de timestamp.
Depois desta rodada eu ainda troquei os comentários do código (de "PENDENTE DE VERIFICAÇÃO" para
"verificado em 2026-09-03") — mudança que não altera o schema (comentários TS não sobrevivem à
avaliação do `esbuild`), e o md5 local continua `920af9a27ca48e3d97c044eb599b8e07`, consistente
com essa expectativa; conferido depois da edição dos comentários, sem precisar de nova rodada de
`tinacms dev`.

`git status --short`, recolado depois da segunda revisão (três arquivos esperados alterados —
o plano entrou na lista a partir do primeiro ciclo de correção; nenhum commit feito, por regra
da casa):

```
 M plans/fase-1-modelo-de-conteudo/017-colecoes-completas-no-tina-config.md
 M tina/config.ts
 M tina/tina-lock.json
```

### Verificação objetiva (passo 6 / critério correspondente)

**Não executada por mim** — delegada ao orquestrador, que tem ferramenta de navegador Chrome. O
executor (implementer) não tem acesso a navegador (regra da casa: quem verifica pelo painel
registra o resultado, o executor não inventa essa verificação). O orquestrador cumpriu a
verificação e reportou o resultado abaixo; o critério correspondente está marcado com base
nesse relato dele, não numa execução minha.

**Resultado relatado pelo orquestrador** — precisão pedida pela segunda revisão, sem arredondar
para "um item de cada uma das cinco coleções": criou e removeu um item em cada uma das
**quatro coleções de pasta** (`linhas-pesquisa`, `disciplinas`, `publicacoes`, `projetos`), com
os nomes de arquivo batendo com o template. Em **`perfil`** (singleton, sem template de nome de
arquivo) ele **abriu** o `index.md` existente pelo painel e conferiu os 12 campos e a ausência
do interruptor "Publicado" — **sem salvar**, de propósito, para não disparar a reserialização
que apaga o comentário da Q-07 (ver "Armadilha #3 do README da fase (Q-07)" acima).

- Nomes de arquivo gerados pelo template, batendo com o previsto: `teste-verificacao-017.md`
  (`linhas-pesquisa`), `2026.2-mecanica-classica-teste.md` (`disciplinas`),
  `2025-um-titulo-de-publicacao-de-teste.md` (`publicacoes`), `projeto-de-teste-017.md`
  (`projetos`).
- Rótulo de item de `aulas` mostrou "1 — Cinemática do ponto material" no lugar de "Item 1"
  (D-05 confirmado pelo painel, não só pela leitura do schema).
- Três achados adicionais durante a verificação, tratados nas seções correspondentes acima:
  `publicado: required` bloqueando formulário de item novo (corrigido com `defaultItem:
  { publicado: false }` no nível da coleção, ver "Achado empírico — `publicado: required`..."
  acima), objeto obrigatório em lista aninhada não bloqueando o save (registrado, não corrigido
  — divergência de paridade para o 019), e texto de ajuda de `autores`, `areas` e
  `palavras_chave` descrevendo um widget que não existe (corrigido nos três).
