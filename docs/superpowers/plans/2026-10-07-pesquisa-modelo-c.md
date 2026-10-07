# Plano — Página Pesquisa no modelo C

**Data:** 2026-10-07 · **Branch:** `design` · **Origem:** sabatina
[`CHANGELOG_sabatina_pesquisa-modelo-c.md`](../../sabatinas/CHANGELOG_sabatina_pesquisa-modelo-c.md)
(8 decisões, PRD v0.1.76, RF-22) · **Protótipo:** `src/pages/extensao/prototipo-pesquisa-c.astro`
(sem commit; é apagado na tarefa 6).

Trabalho fora do fluxo de planos numerados, como o polimento de 2026-09-23: não fecha item do §12
(a rota `/pesquisa` já existe), só troca o desenho da página e acrescenta um campo.

## Resultado esperado

- A partir de `lg`, `/pesquisa` e `/en/research` mostram a imagem da linha parada à esquerda,
  trocando enquanto o texto rola; linha sem imagem mostra um bloco `tinta` com o número (Decisão 1).
- Cada linha mostra o rótulo "Linha 01", o título, o resumo e o corpo; depois, só se houver, os
  projetos da linha e as publicações ligadas a ela (Decisões 6 e 8). Sem palavras-chave nem
  parágrafo de abertura (Decisões 2 e 3).
- Os projetos abrem a descrição sob o cursor ou o foco; sem ponteiro fino (celular), ficam abertos.
- "Outros projetos" aparece, se houver, em largura toda, depois do ensaio (Decisão 7).
- `publicacoes` ganha `linha_relacionada` (referência única e opcional a `linhas-pesquisa`) no Zod
  e no painel (Decisões 4 e 5). Publicações listadas do ano mais recente ao mais antigo, título sem
  link.
- No celular, a imagem vai para o topo de cada linha que tiver uma.

## Tarefas

### 1. Campo `publicacoes.linha_relacionada`

- `src/content.config.ts`: em `publicacoesSchema`, `linha_relacionada` igual ao de `projetosSchema`
  (`z.preprocess(normalizeLinhaRelacionadaId, reference('linhas-pesquisa')).optional()`).
- `tina/config.ts`: na coleção `publicacoes`, depois de `destaque`, um campo `reference` com
  `collections: ['linhas_pesquisa']`, rótulo "Linha de pesquisa", descrição dizendo que a publicação
  aparece na seção da linha na página Pesquisa.
- `tina/tina-lock.json`: regenerar com `npx tinacms dev` (sobe, indexa e derruba). O
  `tinacms build` não o atualiza (README, "Painel de edição").
- Testes: `tests/content/conteudo-valido.test.ts` passa a conferir a referência também em
  `publicacoes`; `tests/content/schemas.test.ts` ganha o caso de `publicacoes` com a referência.

**Verificação:** `npm test` verde, incluindo `paridade-schema` e `tina-lock-coerente`.

### 2. Agrupar publicações por linha (TDD)

- `src/lib/research.ts`: `groupPublicationsByLine(lineIds, publications)` devolve
  `Map<id da linha, publicações>`, do ano mais recente ao mais antigo (empate por título,
  `localeCompare('pt-BR')`). Publicação sem linha, ou com linha fora de `lineIds`, não entra.
  Linha sem publicação não tem chave.
- `tests/lib/research.test.ts`: os casos acima, escritos antes da função.

**Verificação:** os testes novos falham antes e passam depois.

### 3. Textos de interface

- `src/i18n/pt.ts` e `en.ts`, em `research`: `projects` (Projetos / Projects), `publications`
  (Publicações / Publications) e `line` (`n => 'Linha 01'` / `'Line 01'`).
- Ajustar os testes de dicionário que exigirem.

### 4. `ResearchView` no modelo C

- Reescrever o corpo de `src/views/ResearchView.astro` a partir do protótipo C, sem dados
  fictícios: as linhas, projetos e publicações vêm das coleções (só publicados, RN-01), com o
  fallback por campo e o aviso F-07 de hoje.
- `src/components/ProjectItem.astro`: passa a ter o formato do protótipo (número, título, período
  com o ponto de "em andamento", descrição que abre sob o cursor ou o foco, financiador e
  colaboradores). Só a Pesquisa usa o componente.
- O script da troca de imagem (`IntersectionObserver` com `root` em `#conteudo` a partir de `lg`)
  fica na própria view, como no protótipo.
- Títulos de publicação sem `lang` em `/en`, como na página Publicações EN (sabatina fase 4,
  Decisões 13 e 15).

**Verificação:** `astro check` sem erro; `npm run test:dist` verde (o aviso F-07 em `/en/research/`
continua no máximo uma vez).

### 5. Conteúdo de exemplo

- Ligar duas ou três publicações de exemplo às linhas, para a seção aparecer; deixar ao menos uma
  linha sem publicação, para conferir que a seção some.

### 6. Limpeza e documentação

- Apagar `src/pages/extensao/prototipo-pesquisa-{a,b,c}.astro` e
  `src/pages/extensao/_prototipo-pesquisa/` (não versionados).
- `docs/identidade-visual.md`: a seção da página Pesquisa passa a descrever o modelo C.

## Verificação final

- `npx astro check`, `npm run build`, `npm test`, `npm run test:dist`, `npm run lint`,
  `npx prettier --check` nos arquivos alterados: saída colada.
- No Vivaldi, `/pesquisa/` e `/en/research/` a 1440, 768 e 360 px: troca de imagem ao rolar, bloco
  neutro (tirando a imagem de uma linha no conteúdo local, sem commit), descrição dos projetos
  abrindo, seção de publicações presente e ausente, "Outros projetos" em largura toda.
- Commit só quando o stakeholder pedir.
