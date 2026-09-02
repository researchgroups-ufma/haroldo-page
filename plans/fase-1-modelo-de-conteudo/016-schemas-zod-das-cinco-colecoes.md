# Plano 016 — Schemas Zod das cinco coleções em `src/content.config.ts`

**Status:** TODO
**RFs cobertos:** base de RF-04 a RF-10; §7.3; D-06 (metade Zod); RN-01, RN-07
**Depende de:** plano 014 (Astro 7). **Independente do 015** — pode rodar em paralelo com ele.
**Modelo recomendado:** sonnet
**Agente recomendado:** implementer
**PRD:** `S:\Projetos\academic_page\haroldo\PRD.md`
**Projeto:** `S:\Projetos\academic_page\haroldo`

## Objetivo

`src/content.config.ts` define as cinco coleções da §7.3 com schemas Zod, usando a Content
Layer API do Astro 7. O `astro check` valida os tipos e o `astro build` reconhece as coleções.

## Arquivos afetados

- `src/content.config.ts` — criar
- `tests/content/schemas.test.ts` — criar (testes dos schemas)

> Não toque em `tina/config.ts` (planos 015 e 017) nem crie conteúdo de exemplo além do mínimo
> que os testes exigirem (o placeholder é o plano 020).

## Contexto necessário

**Projeto.** `haroldo-page` — site acadêmico do Prof. Haroldo C. D. Lima Junior (UFMA).
Astro **7.2.10**, TypeScript strict, Vitest. `content/` está vazio (só `.gitkeep`).

### ⚠️ Astro 7 mudou a API — não copie exemplo de Astro 4 ou 5

O upgrade do plano 014 trouxe mudanças que **quebram** todo tutorial mais antigo:

- **Coleções legadas foram removidas.** Use a **Content Layer API** com o loader `glob()`.
  `legacy.collections` não existe mais.
- **Zod 4.** `z.string().email()` virou `z.email()`. As mensagens de erro mudaram de estrutura.
- **Imports consolidados:** o `z` vem de **`astro/zod`**. `astro:schema` e o `z` exportado por
  `astro:content` não existem mais.
- **`schema` como função foi removido**; para schema dinâmico usa-se `createSchema()`.

O arquivo é `src/content.config.ts` (raiz de `src/`), não `src/content/config.ts`.

### As cinco coleções (§7.3 do PRD — fonte de verdade, transcreva, não invente)

**`perfil`** — singleton, `content/perfil/index.md`. `nome`✔ · `cargo`✔ · `instituicao`✔ ·
`departamento` · `foto` (imagem) · `bio`✔ (corpo) · `resumo_home`✔ · `formacao[]`
(`{grau, curso, instituicao, ano}`) · `areas[]` · `email`✔ · `links` (objeto com `lattes`,
`orcid`, `scholar`, `arxiv`, `researchgate`, `github`, `institucional`, todos opcionais) ·
`cv_url`. **Sem `publicado`** — é singleton, não coleção de listagem.

**`linhas-pesquisa`** — `content/linhas-pesquisa/*.md`. `titulo`✔ · `ordem` (número) ·
`resumo`✔ · `corpo` · `imagem` · `publicado`✔.

**`projetos`** — `content/projetos/*.md`. `titulo`✔ · `periodo` (`{inicio, fim?}`) ·
`financiador` · `status` (`em andamento` | `concluído`) · `descricao`✔ · `colaboradores[]`
(string livre) · `linha_relacionada` (referência a `linhas-pesquisa`, opcional) · `publicado`✔.

**`disciplinas`** — `content/disciplinas/*.md`. `nome`✔ · `codigo` · `semestre`✔ (livre, ex.
`2026.2`) · `status`✔ (`atual` | `anterior`) · `descricao` · `ementa` · `bibliografia[]`
(`{referencia, url?}`) · `aulas[]` (`{numero, titulo, data?, descricao?, url}`) · `listas[]`
(`{titulo, data_entrega?, url}`) · `materiais[]` (`{titulo, tipo: slides|notas|complementar,
descricao?, url}`) · `links[]` (`{titulo, url}`) · `publicado`✔.

**`publicacoes`** — `content/publicacoes/*.md`. `titulo`✔ · `autores[]`✔ (ordem preservada) ·
`ano`✔ (**validado entre 1900 e 2100**, F-09) · `veiculo` · `tipo`✔ (`artigo` | `preprint` |
`capítulo` | `livro` | `anais` | `tese` | `outro`) · `doi` · `arxiv` · `pdf_url` · `resumo` ·
`palavras_chave[]` · `destaque` · `publicado`✔.

**Não crie a coleção `noticias`.** A §7.3 a marca como v1.1, fora do MVP (NG-01).

### Regras que o schema materializa

- **RN-01 / D-04:** `publicado` existe em **toda** coleção de listagem — as quatro, não em
  `perfil`. Não invente default silencioso; decida e documente se o campo é obrigatório ou tem
  default, e qual.
- **D-05:** `aulas`, `listas` e `materiais` são **listas embutidas** no arquivo da disciplina,
  não coleções separadas.
- **D-07:** todo campo de material é **URL livre**, agnóstica ao hospedeiro. **Não** valide
  domínio do Google Drive. Valide que é URL, nada além.
- **RN-07:** campos factuais (DOI, arXiv, ano, links, imagens, e-mail) existem uma única vez.

**O grupo `en` NÃO entra aqui** — é o plano 018, que o acrescenta às coleções traduzíveis.
Escreva os schemas de modo que acrescentá-lo depois não exija reescrever tudo.

### Testes

A §11 exige teste unitário; o `vitest.config.ts` cobre `src/lib/` e `src/i18n/` — **não cobre
`src/content.config.ts`**. Ou amplie o `include` da cobertura, ou registre por que não. Teste no
mínimo: `ano` fora de 1900–2100 rejeitado; `tipo` fora do enum rejeitado; `status` de disciplina
fora do enum rejeitado; campo obrigatório ausente rejeitado com mensagem útil.

⚠️ **Prove que os testes são falsificáveis.** A lição 9 da fase 0 vale aqui: injete um valor
canário e confirme que o teste de fato falha antes de declará-lo verde.

**Ambiente.** Windows 11 / PowerShell. Node 24.16.0.

## Passos

1. Ler a §7.3 do PRD inteira e transcrever os campos — não trabalhe de memória.
   → verify: cada campo do PRD tem correspondente no schema; liste as divergências, se houver.
2. Escrever `src/content.config.ts` com as cinco coleções, loader `glob()`, `z` de `astro/zod`.
   → verify: `npm run build` com `0 errors, 0 warnings, 0 hints`.
3. Escrever os testes dos schemas.
   → verify: `npm run test` verde, com o número de testes crescendo.
4. Provar a falsificabilidade de pelo menos os testes de `ano`, `tipo` e `status`.
   → verify: cole a saída da execução com o canário, mostrando a falha esperada.
5. Decidir sobre a cobertura de `src/content.config.ts` no `vitest.config.ts`.
   → verify: decisão registrada com motivo.

## Critérios de aceitação

- [ ] `src/content.config.ts` com as **cinco** coleções da §7.3 — sem `noticias`
- [ ] Content Layer API com `glob()`; `z` importado de `astro/zod`; nada de `astro:schema`
- [ ] `publicado` nas quatro coleções de listagem; ausente em `perfil`, com o motivo escrito
- [ ] `ano` de publicação validado entre **1900 e 2100** (F-09)
- [ ] `tipo` de publicação e `status` de disciplina como enums fechados
- [ ] Campos de material como **URL livre**, sem validação de domínio (D-07)
- [ ] Aulas, listas e materiais **embutidos** na disciplina (D-05)
- [ ] Grupo `en` **não** incluído — é o plano 018
- [ ] Testes dos schemas passando **e provados falsificáveis** com canário
- [ ] `npm run lint`, `npm run format:check`, `npm run test` e `npm run build` verdes
- [ ] Cabeçalho de arquivo e docstrings conforme §10.1 e §10.2

## Evidência

<Preenchido pelo executor: saída dos quatro comandos de qualidade, contagem de testes antes e
depois, saída da execução com canário provando falsificabilidade, e a lista de divergências
entre a §7.3 e o schema, se houver.>
