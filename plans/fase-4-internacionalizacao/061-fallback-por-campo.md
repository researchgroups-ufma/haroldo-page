# Plano 061 — Fallback por campo (RN-06)

**Status:** TODO
**RFs cobertos:** **RN-06**, RN-09, F-07 (sinal para o aviso), RF-28; §8.3 (`lang` correto); sabatina fase 4, Decisões 4 e 13; §12 fase 4, item 4
**Depende de:** plano 056 (`HTML_LANG`, tipo `Locale`)
**Modelo recomendado:** sonnet
**Agente recomendado:** implementer
**Executável por:** agente
**PRD:** `S:\Projetos\academic_page\haroldo\PRD.md`
**Projeto:** `S:\Projetos\academic_page\haroldo`

## Objetivo

Existe `src/i18n/fallback.ts`, função pura e testada que resolve um campo traduzível para o idioma
da rota: devolve o texto a exibir, o `lang` que o elemento tem de levar quando o texto caiu no
português, e se houve queda — o sinal que as views usam para decidir o aviso único da página.

## Arquivos afetados

- `src/i18n/fallback.ts` — novo
- `tests/i18n/fallback.test.ts` — novo

> O executor não toca em arquivo fora desta lista. Se precisar, para e reporta. `Status:` fica `TODO`.
> Não commite. Nenhuma view usa o módulo ainda — isso é dos planos 065–067.

## Contexto necessário

**RN-06:** "Se um campo do grupo 'Versão em inglês' estiver vazio, a rota `/en` exibe o valor em
português correspondente." **Decisão 4** (`docs/sabatinas/CHANGELOG_sabatina_fase-4-i18n.md`): todo
elemento cujo texto caiu no PT recebe `lang="pt-BR"`, e a página mostra **um** aviso se qualquer texto
caiu. O §10.2 do PRD já traz o esboço da docstring desta função ("Resolve um campo traduzível com
fallback para o português…").

**API (fixada no fatiamento):**

```ts
export interface LocalizedText {
  /** Texto a exibir. */
  text: string;
  /** `'pt-BR'` quando o texto exibido numa rota EN é o português; ausente caso contrário. */
  lang?: 'pt-BR';
  /** `true` quando a rota é EN e o texto exibido é o português. */
  fellBack: boolean;
}
export function localize(ptValue: string, enValue: string | undefined, lang: Locale): LocalizedText;
export function localizeOptional(
  ptValue: string | undefined, enValue: string | undefined, lang: Locale,
): LocalizedText | undefined;
export function portugueseOnly(ptValue: string, lang: Locale): LocalizedText;
export function hasFallback(values: readonly (LocalizedText | undefined)[]): boolean;
```

Regras:

| Chamada | Resultado |
|---|---|
| `localize(pt, qualquer, 'pt')` | `{ text: pt, fellBack: false }` (sem `lang`) |
| `localize(pt, en, 'en')`, `en` com texto | `{ text: en, fellBack: false }` |
| `localize(pt, undefined \| '' \| '   ', 'en')` | `{ text: pt, lang: 'pt-BR', fellBack: true }` |
| `localizeOptional(undefined \| '', undefined \| '', lang)` | `undefined` (campo vazio não deixa rastro, RF-21) |
| `localizeOptional(pt vazio, en com texto, 'en')` | `{ text: en, fellBack: false }` — decisão de fatiamento 10 |
| `localizeOptional(pt vazio, en com texto, 'pt')` | `undefined` |
| `localizeOptional(pt com texto, en, lang)` | igual a `localize` |
| `portugueseOnly(pt, 'pt')` | `{ text: pt, fellBack: false }` (sem `lang`) |
| `portugueseOnly(pt, 'en')` | `{ text: pt, lang: 'pt-BR', fellBack: false }` — marca o idioma, **não** liga o aviso (Decisão 13) |
| `hasFallback([...])` | `true` se algum item definido tiver `fellBack` |
| `hasFallback([portugueseOnly(x, 'en')])` | `false` — campo "P" nunca liga o aviso (Decisão 13) |

"Vazio" é `undefined` ou `trim() === ''`. O `text` devolvido é o valor **como está** (sem `trim`) —
quem divide em parágrafos é `toParagraphs` (`src/lib/text.ts`), que já apara. O valor `'pt-BR'` sai
de `HTML_LANG.pt` (056), não de literal solto.

**Texto em português sem campo em inglês** (tipo "P" da tabela do README da fase) — **Decisão 13**
(sabatina fase 4, 2026-09-24, "`lang` sim, aviso não"): em `/en` ele recebe `lang="pt-BR"`, mas
**não** dispara o aviso da página, que fica restrito ao fallback de campo traduzível (RN-06). Por isso
existe `portugueseOnly`: mesmo `lang` do fallback, `fellBack: false`. **Não** use
`localize(texto, undefined, lang)` para campo "P" — ele devolve `fellBack: true` e ligaria o aviso.
Campos factuais (tipo "F", inclusive `publicacoes.titulo`/`veiculo` pela exceção da Decisão 13) não
passam por nenhuma das funções.

**Cobertura:** `src/i18n/**` está no `include` do `vitest.config.ts`; mire 100% de linhas e ramos.

**Regras de código:** README da fase 4. Cite **RN-06** no fallback, **RN-09** no PT canônico e
**F-07** no `fellBack` (sinal do aviso). Não cite F-08.

## Passos

1. `src/i18n/fallback.ts` e `tests/i18n/fallback.test.ts`, com uma linha de teste por linha da tabela das Regras → verify: `npm test -- --reporter=verbose tests/i18n/fallback.test.ts` colado.
2. Canários: (a) faça `localize` tratar `'   '` como preenchido (troque o `trim()` por comparação crua) → o teste do espaço reprova; (b) faça `portugueseOnly` devolver `fellBack: true` → o teste de `hasFallback` com campo "P" reprova; desfaça cada um → verify: saídas vermelhas e verde coladas.
3. Portão → verify: `npx astro check`, `npm run lint`, `npm run format:check`, `npm run test:coverage` colados (linha de `fallback.ts` na tabela de cobertura).

## Critérios de aceitação

- [ ] `localize`, `localizeOptional`, `portugueseOnly` e `hasFallback` com a API e as regras do Contexto, uma asserção por linha da tabela
- [ ] `portugueseOnly` em `/en` marca `lang="pt-BR"` e **não** faz `hasFallback` devolver `true` (Decisão 13)
- [ ] Espaço em branco no `en` conta como vazio, e campo "P" não liga o aviso (canários do passo 2)
- [ ] `lang` vem de `HTML_LANG`; nenhuma view alterada
- [ ] Cobertura de `fallback.ts` em 100% de linhas e ramos
- [ ] `astro check`, `lint`, `format:check`, `test:coverage` verdes, com saída colada

## Evidência

<Preenchido pelo executor ao concluir: saídas literais coladas, por passo. Plano sem esta seção preenchida não é DONE.>
