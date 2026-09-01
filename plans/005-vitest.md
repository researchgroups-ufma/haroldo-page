# Plano 005 — Vitest configurado com o primeiro teste real

**Status:** TODO
**RFs cobertos:** — (Fase 0, item 9 parcial do checklist §12; §11 do PRD, RNF-10)
**Depende de:** planos 003 e 004
**Modelo recomendado:** sonnet
**Agente recomendado:** implementer
**PRD:** `S:\Projetos\academic_page\haroldo\PRD.md`
**Projeto:** `S:\Projetos\academic_page\haroldo`

## Objetivo

O projeto passa a ter suíte de testes executável por `npm run test`, com Vitest integrado à
configuração Vite do Astro e relatório de cobertura disponível — pronto para receber, na
fase 1, os testes de paridade de schema e as regras RN-01/RN-02/RN-04/RN-06.

## Arquivos afetados

- `package.json` — devDependencies (`vitest`, `@vitest/coverage-v8`) e scripts
  `test`, `test:watch`, `test:coverage`
- `vitest.config.ts` — criar
- `src/lib/slug.ts` — criar (função `slugify`, primeira lógica pura testável)
- `tests/lib/slug.test.ts` — criar (teste da função acima)

> O executor não toca em arquivo fora desta lista. Se precisar, para e reporta.

## Contexto necessário

**Projeto.** `haroldo-page` — site pessoal acadêmico do Prof. Haroldo C. D. Lima Junior
(UFMA). Astro 5 estático + TypeScript strict + Tailwind 4 (plano 002); Prettier e ESLint
já configurados (plano 004); pasta `tests/` já existe com `.gitkeep` (plano 003).

**Estratégia de testes do PRD §11 — o que este plano precisa habilitar (não implementar):**

| Nível | Escopo | Ferramenta | Meta |
|---|---|---|---|
| Unitário | lógica pura de `src/lib/` e `src/i18n/` (RN-01, RN-02, RN-04, RN-06, datas, slug) | Vitest | ≥ 80% |
| Contrato de schema | paridade `tina/config.ts` × `src/content.config.ts` (D-06, RNF-09) | Vitest | 100% das coleções |
| Integração | rotas geradas, sobre o `dist/` do build | Vitest | fluxos principais |

Tudo isso é **fase 1 ou posterior**. Aqui só se monta o arcabouço e se prova que ele roda,
com **um** teste de verdade — não um `expect(true).toBe(true)`.

**Regras do §11 que a configuração precisa respeitar desde já:**
- Testes **determinísticos**: nada de data corrente, rede real ou dependência de ordem.
  Funções que envolvem "semestre atual" recebem a data por parâmetro. Não habilite nada que
  dependa de relógio.
- `tests/` **espelha `src/`** — por isso o teste vai em `tests/lib/slug.test.ts`, não solto
  na raiz de `tests/`.

**Integração Vitest × Astro.** O Astro expõe `getViteConfig` para que o Vitest herde os
aliases e plugins do projeto (inclusive o plugin do Tailwind). Use exatamente este padrão:

```ts
import { getViteConfig } from 'astro/config';

export default getViteConfig({
  test: {
    include: ['tests/**/*.test.ts'],
    environment: 'node',
    coverage: {
      provider: 'v8',
      include: ['src/lib/**', 'src/i18n/**'],
      reporter: ['text', 'html'],
    },
  },
});
```

`environment: 'node'` é o certo: o site é estático e não há DOM a testar na fase 0
(acessibilidade com axe-core é fase 5). **Não instale `jsdom`/`happy-dom` agora.**

**Por que `slugify` como primeiro teste, e não outra coisa.** A RN-08 do PRD manda que o
nome do arquivo de conteúdo seja **gerado por template**, nunca digitado pelo professor:
`{ano}-{slug(titulo)}.md` para publicações e `{semestre}-{slug(nome)}.md` para disciplinas
(§7.3). O slug é a única peça de lógica pura já definida sem ambiguidade nesta fase — e é
justamente onde acentuação portuguesa quebra silenciosamente.

**Especificação fechada de `slugify(input: string): string`:**

1. Normalizar Unicode com `input.normalize('NFD')` e remover as marcas diacríticas com
   `.replace(/[\u0300-\u036f]/g, '')` — `"Mecânica Clássica"` → `"Mecanica Classica"`.
2. `toLowerCase()`.
3. Trocar tudo que não for `[a-z0-9]` por hífen.
4. Colapsar hífens repetidos e remover hífens das pontas.
5. String vazia ou só de símbolos devolve `''` (não lance exceção).

**Casos de teste obrigatórios** (com dados reais do domínio deste projeto — Apêndice C do PRD
e §7.3):

| Entrada | Saída esperada |
|---|---|
| `"Mecânica Clássica"` | `mecanica-classica` |
| `"Tidal Forces in Kerr Spacetime"` | `tidal-forces-in-kerr-spacetime` |
| `"Sombras de buracos negros"` | `sombras-de-buracos-negros` |
| `"Relatividade   Geral -- e teorias alternativas"` | `relatividade-geral-e-teorias-alternativas` |
| `"  Física  "` | `fisica` |
| `""` | `""` |
| `"---"` | `""` |

**Armadilha real:** `String.prototype.normalize('NFD')` é o único jeito confiável de tratar
acento em Node sem dependência externa; `replace(/[^\w]/g, '-')` sozinho transformaria
"Mecânica" em `mec-nica`. Escreva o teste com as strings acentuadas literalmente e garanta
que o arquivo é salvo em **UTF-8 sem BOM** (o `.editorconfig` do plano 001 já manda UTF-8).

**§10 do PRD é normativa** e vale para `src/lib/slug.ts`:
- cabeçalho de arquivo obrigatório (o bloco `Arquivo / Projeto / Descrição / Autor / Criado
  em / Atualizado em / Versão / Dependências / Entradas / Saídas / Uso / Notas` da §10.1);
- TSDoc na função exportada, com `@param` e `@returns`;
- comentário citando o identificador da regra: `// RN-08: nome de arquivo gerado por
  template, nunca digitado pelo professor`;
- **código e identificadores em inglês** (`slugify`, `input`), textos de interface em
  português — aqui não há texto de interface;
- `any` proibido.

**Scripts npm** (nomes exatos — o CI do plano 008 os chama assim):

```json
"test": "vitest run",
"test:watch": "vitest",
"test:coverage": "vitest run --coverage"
```

`vitest run` (e não `vitest`) é o que o CI precisa: o modo padrão fica em watch e travaria o
job. Versões exatas no `package.json`, sem `^`/`~` (convenção do plano 002).

**Ambiente.** Windows 11 / PowerShell, a partir de `S:\Projetos\academic_page\haroldo`.

## Passos

1. Instalar `vitest` e `@vitest/coverage-v8` como devDependencies, com versão exata.
   → verify: `npm ls vitest --depth=0`.
2. Criar `vitest.config.ts` com o conteúdo acima.
   → verify: `npx vitest run` executa (e informa "no test files found" antes do passo 3).
3. Criar `src/lib/slug.ts` com `slugify` conforme a especificação, cabeçalho §10.1 e TSDoc.
   → verify: `npx tsc --noEmit` (ou `npx astro check`) sem erro de tipo.
4. Criar `tests/lib/slug.test.ts` cobrindo os sete casos da tabela.
   → verify: `npm run test` verde, 7 asserções.
5. Acrescentar os três scripts npm.
   → verify: `npm run test` e `npm run test:coverage` executam.
6. Rodar `npm run lint` e `npm run format:check` para garantir que os arquivos novos
   passam nas regras do plano 004.
   → verify: ambos verdes (rode `npm run format` se preciso).
7. Commitar com `test: configura Vitest e adiciona slugify com testes de acentuação`.
   → verify: `git show --stat HEAD` lista `vitest.config.ts`, `src/lib/slug.ts` e
   `tests/lib/slug.test.ts`.

## Critérios de aceitação

- [ ] `npm run test` verde, com os 7 casos de `slugify` nomeados individualmente
- [ ] O caso `"Mecânica Clássica"` → `mecanica-classica` passa (prova o tratamento de acento)
- [ ] `npm run test:coverage` gera relatório sem erro
- [ ] `npm run lint` e `npm run format:check` continuam verdes
- [ ] `npm run build` continua verde
- [ ] `src/lib/slug.ts` tem cabeçalho §10.1 e TSDoc na função exportada
- [ ] Nenhum teste depende de data corrente, rede ou ordem de execução

## Evidência

<Preenchido pelo executor: saída de `npm run test` com os números reais de arquivos/testes,
saída de `npm run test:coverage` e `git show --stat HEAD`.>
