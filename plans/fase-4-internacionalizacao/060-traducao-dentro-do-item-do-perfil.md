# Plano 060 — Tradução dentro do item: `formacao[]`, `atuacao[]` e `areas[]` (Decisões 7 e 8)

**Status:** TODO
**RFs cobertos:** RF-14, RN-06, RN-07, RN-09, RNF-09 (paridade), D-06; sabatina fase 4, Decisões 7 e 8; §12 fase 4, item 9
**Depende de:** plano 055 (comparador)
**Modelo recomendado:** sonnet
**Agente recomendado:** implementer
**Executável por:** agente (schema, testes, migração) + **orquestrador** (painel local, push e `npm run build` com cloud check — ordem de fechamento de plano que muda schema)
**PRD:** `S:\Projetos\academic_page\haroldo\PRD.md`
**Projeto:** `S:\Projetos\academic_page\haroldo`

## Objetivo

A tradução de cada item de lista do perfil passa a viver **dentro do próprio item**:
`formacao[i].en.{grau, curso}`, `atuacao[i].en.cargo` e `areas[i] = { nome, en?: { nome? } }`. Saem
as listas paralelas `perfil.en.formacao` e `perfil.en.areas`. Zod, Tina, lock e paridade mudam
juntos; o único conteúdo migrado é o formato de `areas`. As páginas PT continuam **idênticas**.

## Arquivos afetados

- `src/content.config.ts` — schemas de `formacao`, `atuacao`, `areas` e do grupo `en` do perfil; docstrings e cabeçalho
- `tina/config.ts` — os mesmos campos no painel
- `tina/tina-lock.json` — regenerado (não editar à mão)
- `tests/content/schemas.test.ts` — casos de `perfil` que mudam
- `tests/content/paridade-schema.test.ts` — um teste novo para o `en` dentro de item de lista
- `content/perfil/index.md` — **migração autorizada**: só `areas`, de lista de string para lista de `{ nome }`
- `src/pages/index.astro` — só `{area}` → `{area.nome}` (único consumidor de `areas`, grep de 2026-09-24; `src/lib/profile.ts` não lê `areas`)

> O executor não toca em arquivo fora desta lista. Se precisar, para e reporta. `Status:` fica `TODO`.
> Não commite. **Este é o único plano da fase que muda o schema.**

## Contexto necessário

**Decisão 7** (`docs/sabatinas/CHANGELOG_sabatina_fase-4-i18n.md`): cada item carrega a própria
tradução — reordenar no painel leva a tradução junto, e o desalinhamento deixa de ser possível por
construção. Saem `perfil.en.formacao` e `perfil.en.areas`. **Decisão 8:** `atuacao[]` traduz **só
`cargo`**; `instituicao` e `periodo` ficam únicos. **Decisão de fatiamento 11** (README da fase):
`areas[i].en` é grupo `{ nome? }`, no mesmo formato de grupo dos outros dois.

**Estado atual, `src/content.config.ts`:** `formacaoSchema` (95–100), `atuacaoSchema` (107–111),
`formacaoEnSchema` (137–142, a lista paralela), `perfilEnSchema` (153–163, com `formacao` e `areas`
paralelas), `perfilSchema` (174–191, `areas: z.array(z.string()).optional()`). Todo grupo `en` é
`.optional()` e `.strict()` (um campo factual colado dentro dele é rejeitado — RN-07), e todo campo
dentro dele é opcional (RN-09).

**Alvo (Zod):**

```ts
const formacaoEnSchema = z.object({ grau: z.string().optional(), curso: z.string().optional() }).strict();
const formacaoSchema = z.object({ grau, curso, instituicao, ano, en: formacaoEnSchema.optional() });
const atuacaoEnSchema = z.object({ cargo: z.string().optional() }).strict();
const atuacaoSchema = z.object({ cargo, instituicao, periodo, en: atuacaoEnSchema.optional() });
const areaEnSchema = z.object({ nome: z.string().optional() }).strict();
const areaSchema = z.object({ nome: z.string(), en: areaEnSchema.optional() });
// perfilEnSchema: sem `formacao` e sem `areas`; perfilSchema.areas: z.array(areaSchema).optional()
```

Os objetos de item (`formacaoSchema`, `atuacaoSchema`, `areaSchema`) **não** são `.strict()` hoje;
não mude isso.

**Alvo (Tina, `tina/config.ts`):** `formacao` (155–178) e `atuacao` (179–202) ganham, como último
subcampo, `{ type: 'object', name: 'en', label: 'Versão em inglês (opcional)', fields: [...] }` com
`grau`/`curso` (rótulos "Grau (EN)", "Curso (EN)") e `cargo` ("Cargo (EN)"), nenhum `required`.
`areas` (203–209) vira `type: 'object', list: true`, com `nome` (`required: true`, rótulo "Área") e o
mesmo grupo `en` com `nome` ("Área (EN)"); `ui.itemProps` com `label: item?.nome || 'Nova área'`
(padrão de `formacao`, linhas 161–165). Do grupo `en` do perfil (238–286) saem `formacao` (260–276) e
`areas` (277–284). `description` em vocabulário do professor (RF-03: nada de "lista paralela",
"índice", "arquivo").

**Lock:** só se regenera por `tinacms dev`. Precedente (plano 017): `npx tinacms dev -c "echo ready"`,
com a porta 9000 livre; se o processo sobreviver, mate o `node` do `tinacms` (plano 022: "Datalayer
server is busy" trava o build seguinte). `tests/content/tina-lock-coerente.test.ts` reprova lock
defasado — é o portão do CI e do `build:pipeline`.

**Paridade:** `tests/content/paridade-schema.test.ts` já desce recursivamente em objeto e em lista de
objeto (`classifyZod`/`classifyTina`, linhas 187–259), então os campos novos entram na comparação sem
mudar o normalizador. Acrescente um teste explícito, no bloco "três falsos positivos…" ou num
`describe` próprio: o `en` de **item** de `formacao`, `atuacao` e `areas` existe dos dois lados e
nenhum subcampo é obrigatório (espelho do teste das linhas 455–469, que só olha o `en` da coleção).

**`tests/content/schemas.test.ts`:** os casos que usam `en.formacao` (linhas 128 e 142–145) passam a
exercitar `formacao[i].en`; acrescente: `perfil.en.formacao` e `perfil.en.areas` agora **rejeitados**
(`.strict()`); `areas: ['texto']` rejeitado (formato antigo); `areas: [{ nome }]` aceito;
`formacao[i].en.instituicao` rejeitado (RN-07); `atuacao[i].en.cargo` aceito e
`atuacao[i].en.instituicao` rejeitado (Decisão 8).

**Migração autorizada — `content/perfil/index.md`, só as linhas 33–37:**

```yaml
areas:
  - nome: Teoria da Relatividade Geral e teorias alternativas de gravitação
  - nome: Perturbações lineares em espaços-tempos curvos
  - nome: Forças de maré
  - nome: Sombras de buracos negros
```

Nenhum outro campo do arquivo muda. Nenhum perfil tem `en` hoje, então não há tradução a mover.

**Ordem de fechamento (plano que muda schema — README da fase 1, "A ordem de fechamento não é
livre"):** `revisão APROVADO → commit → push → TinaCloud reindexa → npm run build verde → Status:
DONE`. O executor valida com `npm run build:pipeline` (que usa `--skip-cloud-checks`, ADR-0009) e
**não** roda `npm run build`; o critério do `npm run build` com cloud check fica desmarcado até o
orquestrador fazê-lo depois do push. Trocar `areas` de string para objeto é mudança **incompatível**
para o TinaCloud; o conteúdo migra no mesmo commit.

**Verificação no painel (orquestrador, antes do DONE):** memória do projeto, "Verificar no painel,
não no código". Subir o painel como no plano 022 (Evidência do orquestrador): `npx astro dev
--background --force` e `npx tinacms dev` separados (`npm run dev` não serve no Astro 7). No Perfil:
(1) cada item de Formação, Atuação e Áreas tem o grupo "Versão em inglês (opcional)", recolhido; (2)
preencher `en.grau` do 2º item de formação, **reordenar** o item para o 1º lugar e salvar; (3) abrir o
`.md` gravado e colar o frontmatter: a tradução está **dentro** do item que foi movido. Armadilha do
plano 020: o formulário do Tina descarta alteração em campo que já tinha valor ao voltar de um
subpainel — confira o arquivo campo a campo. **Reverter** com `git checkout -- content/perfil/index.md`
**depois** do commit deste plano (antes dele, o checkout desfaria a migração): o painel roda sobre o
working tree do commit já feito. Encerrar `astro dev stop` e matar os `node` do `tinacms`.

**Regras de código:** README da fase 4. Cite **RN-07** nos `.strict()` e **RN-06/RN-09** no `en`
opcional; a Decisão 7 se cita como "sabatina fase 4, Decisão 7".

## Passos

1. Retrato "antes": `npm run build:pipeline`; `node scripts/comparar-dist.mjs retrato <scratch>\antes.json` → verify: fim do build colado.
2. `src/content.config.ts` e `tests/content/schemas.test.ts` → verify: `npm test -- --reporter=verbose tests/content/schemas.test.ts` colado.
3. `tina/config.ts` e o teste novo de paridade → verify: `npm test -- --reporter=verbose tests/content/paridade-schema.test.ts` colado.
4. Canário da paridade: tire temporariamente o `en` do item de `atuacao` só no Tina → a paridade reprova nomeando `perfil.atuacao[].en`; desfaça → verify: saídas coladas.
5. Migração de `content/perfil/index.md` e `src/pages/index.astro` → verify: `npm test -- --reporter=verbose tests/content` colado (inclui `conteudo-valido`).
6. Regenerar o lock → verify: saída do `tinacms dev` colada e `npm test -- tests/content/tina-lock-coerente.test.ts` verde; `git diff --stat tina/tina-lock.json` colado.
7. Comparação → verify: `npm run build:pipeline`; `retrato <scratch>\depois.json`; `comparar antes.json depois.json` colado — toda rota `IGUAL`, exit 0 (as áreas da Home saem iguais).
8. Portão → verify: `npm run lint`, `npm run format:check`, `npm run test:coverage`, `npm run test:dist` colados; `git diff -- content/` colado mostrando **só** as linhas de `areas`.
9. **Orquestrador — painel local** (Contexto) → verify: frontmatter gravado colado; reversão provada.
10. **Orquestrador — depois do push:** TinaCloud reindexa; `npm run build` **com** cloud check → verify: saída colada; CI e Workers Builds verdes no commit.

## Critérios de aceitação

- [ ] Zod e Tina com `formacao[i].en.{grau,curso}`, `atuacao[i].en.cargo` e `areas[i] = { nome, en?: { nome? } }`; sem `perfil.en.formacao` nem `perfil.en.areas`
- [ ] Paridade verde, com o teste novo do `en` de item e o canário do passo 4 vermelho
- [ ] `schemas.test.ts` cobre os formatos novos e rejeita os antigos e os campos factuais no `en` do item
- [ ] `tina/tina-lock.json` regenerado; `tina-lock-coerente` verde
- [ ] Só `areas` mudou em `content/perfil/index.md`; `conteudo-valido` verde
- [ ] Páginas PT idênticas: comparador com toda rota `IGUAL`
- [ ] Painel: grupo "Versão em inglês" dentro de cada item, e a tradução acompanha o item reordenado (orquestrador)
- [ ] `npm run build` **com cloud check** verde depois do push (orquestrador)
- [ ] `astro check`, `lint`, `format:check`, `test:coverage`, `build:pipeline`, `test:dist` verdes, com saída colada

## Evidência

<Preenchido pelo executor ao concluir: saídas literais coladas, por passo; os passos 9 e 10 são do orquestrador. Plano sem esta seção preenchida não é DONE.>
