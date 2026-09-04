# Plano 020 — Conteúdo placeholder representativo nas cinco coleções

**Status:** DONE
**RFs cobertos:** fase 1, item "Conteúdo placeholder representativo"; base de RF-04 a RF-10
**Depende de:** planos 016, 017 e 018 (o 019 pode rodar em paralelo)
**Modelo recomendado:** sonnet
**Agente recomendado:** implementer
**PRD:** `S:\Projetos\academic_page\haroldo\PRD.md`
**Projeto:** `S:\Projetos\academic_page\haroldo`

## Objetivo

`content/` tem conteúdo suficiente para que a fase 3 construa e teste todas as rotas sem
inventar dados: 1 perfil, 2 linhas de pesquisa, 2 projetos, 2 disciplinas (uma com 5 aulas) e
6 publicações distribuídas em 3 anos.

## Arquivos afetados

- `content/perfil/index.md` — completar (o plano 015 criou uma versão mínima)
- `content/linhas-pesquisa/*.md` — 2 arquivos
- `content/projetos/*.md` — 2 arquivos
- `content/disciplinas/*.md` — 2 arquivos
- `content/publicacoes/*.md` — 6 arquivos

> Não altere schema nem configuração. Se o conteúdo não couber no schema, **pare e reporte** —
> pode ser defeito do schema, e corrigi-lo aqui furaria a paridade que o plano 019 protege.

## Contexto necessário

**Projeto.** `haroldo-page` — site acadêmico do Prof. Haroldo C. D. Lima Junior (UFMA).

### O que "representativo" quer dizer, e por que a quantidade é essa

O checklist da §12 pede exatamente: **1 perfil, 2 linhas, 2 projetos, 2 disciplinas (uma com 5
aulas), 6 publicações em 3 anos.** Os números não são arbitrários — cada um existe para exercer
algo que a fase 3 vai construir:

- **2 linhas** exercem a ordenação por `ordem`
- **2 disciplinas**, uma `atual` e uma `anterior`, exercem a RN-03 e a separação da listagem
- **5 aulas** numa delas exercem a ordenação de aulas (RN-04) e as listas embutidas da D-05
- **6 publicações em 3 anos** exercem o agrupamento por ano (RN-02) — não use 6 do mesmo ano
- Ao menos uma publicação com `destaque: true` exerce a seleção da Home

**Cubra também os casos de borda**, que é onde a fase 3 vai quebrar se o placeholder for
otimista demais: ao menos um item com `publicado: false` (RN-01), ao menos um item **sem** grupo
`en` e um **com** o grupo parcialmente preenchido (RN-06, RN-09), uma disciplina sem `codigo`,
uma publicação sem `doi`, um projeto sem `linha_relacionada`.

### Dados reais × dados inventados — a regra

O **Apêndice C** do PRD traz os dados reais do professor, extraídos do `lattes.pdf`: nome,
nome em citações (`LIMA JUNIOR, HAROLDO C. D.`), cargo (Professor Adjunto A), instituição
(UFMA, Campus São Luís), unidade (Centro Tecnológico — Departamento de Física), bolsa de
Produtividade CNPq nível C, Lattes, ORCID, e a formação completa (graduação, mestrado e
doutorado na UFPA, pós-doutorado, formação no ICTP). A área é **relatividade geral** — buracos
negros de Kerr, forças de maré, campos escalares, sombras.

**Use os dados reais no `perfil`.** Eles resolvem a Q-01 e são a fonte prevista pelo PRD.

**O Apêndice C avisa que a lista de publicações NÃO está no `lattes.pdf`** e precisará vir do
ORCID/Scholar ou ser cadastrada pelo professor. Portanto:

⚠️ **As 6 publicações do placeholder são inventadas.** Elas precisam ser **plausíveis para a
área** (títulos de relatividade geral, veículos como Physical Review D, Classical and Quantum
Gravity) mas **inequivocamente marcadas como placeholder** — nunca um DOI real, nunca um arXiv
real, nunca um trabalho existente atribuído a alguém. O site é **público**, e um placeholder que
pareça publicação real é desinformação sobre uma pessoa real.

**Como marcar:** decida um mecanismo e registre-o na Evidência — sugestão, `publicado: false`
em todas, mais um comentário no frontmatter. O importante é que exista um jeito trivial de
encontrá-las e apagá-las quando o professor cadastrar as verdadeiras.

O mesmo vale para disciplinas, linhas e projetos: plausíveis para a área, marcados como
placeholder. As disciplinas podem usar nomes reais de disciplinas de Física (Mecânica Clássica,
Relatividade Geral) — o exemplo do PRD na RF-06 é "Mecânica Clássica / 2026.2 / atual".

### Links de material

Todo `url` é **URL livre** (D-07). Use URLs que não apontem para lugar nenhum de verdade — não
invente link de Drive que possa colidir com um real.

### Nomes de arquivo

Os templates do plano 017 governam (RN-08): `{semestre}-{slug(nome)}.md` para disciplinas,
`{ano}-{slug(titulo)}.md` para publicações. **Crie o conteúdo pelo painel sempre que possível**,
para que os nomes saiam do template e não da sua mão — e para exercer o caminho que o professor
vai usar.

### 🚨 A armadilha da Q-07 detona neste plano — leia antes de abrir o Perfil

`content/perfil/index.md` tem hoje `email: PLACEHOLDER@ufma.br`, e o que marca esse valor como
fictício são **seis linhas de comentário YAML** no próprio arquivo, que registram a Q-07 como
aberta até a fase 3.

O Tina reserializa o frontmatter com `gray-matter`/`js-yaml`
(`node_modules/@tinacms/graphql/dist/index.js:3418-3419` e `:3619`), que **não preservam
comentário YAML**. Portanto: **o primeiro save do formulário "Perfil" pelo painel apaga essas
seis linhas.** Os planos 017 e 018 evitaram isso não abrindo o Perfil — este plano precisa
preenchê-lo, então não tem como evitar.

**Ordem obrigatória, antes de qualquer save do Perfil:**

1. Obtenha o e-mail institucional real do professor. Se ele não estiver disponível, **pare e
   reporte** — não invente, não mantenha o placeholder, não apague o comentário "para depois".
2. Substitua o `PLACEHOLDER@ufma.br` pelo valor real **editando o arquivo diretamente**, junto
   com a remoção do bloco de comentário da Q-07.
3. Só então use o painel.

Se o e-mail real não vier a tempo, a alternativa é preencher o Perfil **editando o arquivo à
mão**, sem abrir o formulário — o placeholder e o comentário sobrevivem, e a Q-07 segue aberta
para a fase 3. Registre na Evidência qual dos dois caminhos foi seguido e por quê. O repositório
é público: um e-mail errado exposto é pior que um placeholder marcado como tal.

### Duas armadilhas do painel que você vai encontrar ao criar o conteúdo

**1. Lista embutida com campo obrigatório vazio.** Ao adicionar uma aula (ou lista, ou material)
e tentar sair dela antes de preencher `numero`, `titulo` e `url`, o Tina dispara
`Cannot navigate away from an invalid form` **sem dizer qual campo falta**. É limitação genérica
do produto, não defeito do schema. Preencha os três campos de cada item antes de adicionar o
próximo. A disciplina de 5 aulas é onde isso mais aparece.

**Pior ainda:** o Tina **não bloqueia o save do documento pai** com o subcampo vazio — ele grava
`aulas: [ {} ]`, que o Zod rejeita e o build recusa. Confira o frontmatter gravado depois de
salvar, não só a tela.

**2. Item novo nasce `publicado: false`.** As quatro coleções de listagem têm
`defaultItem: { publicado: false }`, para o interruptor não nascer inválido. Isso é proposital —
mas significa que **todo item que você criar pelo painel nasce despublicado**. O plano pede ao
menos um `publicado: false` (RN-01); os demais precisam ser marcados explicitamente, ou o
placeholder inteiro fica invisível para a fase 3.

### Ordem em relação ao plano 019

**O 019 fechou primeiro (DONE em 2026-09-03), então a ressalva original caducou** — e virou
tarefa. A divergência de formato de valor de `projetos.linha_relacionada` foi corrigida do lado
do Zod: `normalizeLinhaRelacionadaId` em `src/content.config.ts` tira o prefixo
`content/linhas-pesquisa/` e a extensão `.md` antes do `reference()`. Não crie mais os projetos
com o campo vazio — **preencha `linha_relacionada` em pelo menos um dos dois**.

**Tarefa herdada do 019, que só este plano pode executar.** A correção está provada por teste
unitário com a string literal que o Tina grava, e a premissa (o Tina grava o caminho completo)
foi verificada no painel no plano 017. O que **nunca foi exercitado** é a ponta final:
`getEntry()` resolvendo de fato depois da normalização. Ela não era verificável no 019 porque as
pastas de coleção estavam vazias — `[WARN] [glob-loader] No files found matching "**/*.md"` nas
quatro. Com o conteúdo que este plano cria, passa a ser. Portanto:

1. Crie a linha de pesquisa **pelo painel**, e o projeto **pelo painel**, selecionando a linha no
   campo de referência e salvando.
2. Abra o arquivo `.md` gravado e **cole na Evidência o valor literal** de `linha_relacionada`.
   Se não for `content/linhas-pesquisa/<slug>.md`, a premissa da correção do 019 está errada e
   isso é um achado — reporte, não conserte aqui.
3. Prove que resolve: com o conteúdo no lugar, `getEntry('linhas-pesquisa', ...)` a partir do
   projeto deve devolver a entrada, **não** `undefined`. Cole a saída.

Vale a lição da casa: **comportamento de UI de terceiro se prova exercitando a interface**, não
lendo `node_modules`.

**Ambiente.** Windows 11 / PowerShell. Node 24.16.0.

## Passos

1. Preencher `content/perfil/index.md` com os dados reais do Apêndice C.
   → verify: `npm run build` verde; nenhum campo obrigatório vazio.
2. Criar 2 linhas de pesquisa com `ordem` distinta, 2 projetos (um sem `linha_relacionada`).
   → verify: arquivos válidos pelo schema.
3. Criar 2 disciplinas — uma `atual` com 5 aulas, listas e materiais; uma `anterior`, sem
   `codigo`.
   → verify: a de 5 aulas exercita as três listas embutidas da D-05.
4. Criar 6 publicações **inventadas e marcadas como placeholder**, em 3 anos distintos, ao menos
   uma com `destaque: true` e uma sem `doi`.
   → verify: nenhum DOI ou arXiv real; mecanismo de marcação registrado.
5. Garantir os casos de borda: um item `publicado: false`, um sem grupo `en`, um com `en`
   parcial.
   → verify: liste na Evidência qual item cobre cada caso.
6. Rodar a sequência de qualidade.
   → verify: os quatro verdes, com o build reconhecendo todas as entradas.

## Critérios de aceitação

- [x] 1 perfil com os **dados reais** do Apêndice C
- [x] 2 linhas de pesquisa com `ordem` distinta
- [x] 2 projetos, um deles sem `linha_relacionada`
- [x] 2 disciplinas — uma `atual` com **5 aulas**, listas e materiais; uma `anterior` sem `codigo`
- [x] 6 publicações em **3 anos distintos**, ao menos uma com `destaque` e uma sem `doi`
- [x] **Nenhum DOI, arXiv ou trabalho real** entre as publicações inventadas
- [x] Mecanismo de marcação do placeholder definido e registrado — o repositório é **público**
- [x] Casos de borda cobertos: `publicado: false`, item sem `en`, item com `en` parcial
- [x] Nomes de arquivo gerados pelos templates (RN-08), não digitados
- [x] **Q-07 tratada antes do primeiro save do Perfil:** e-mail institucional real no lugar do
      placeholder, ou Perfil preenchido à mão preservando o comentário — o caminho escolhido
      registrado na Evidência, com o motivo
- [x] **Frontmatter conferido depois de cada save**, não só a tela — nenhuma lista embutida
      gravada com item vazio (`aulas: [ {} ]`)
- [x] `publicado` explicitamente marcado nos itens que devem aparecer — o padrão do painel é
      `false`
- [x] ~~`projetos.linha_relacionada` só preenchido se o plano 019 já tiver corrigido o formato
      do valor~~ — **o 019 fechou antes; o campo deve ser preenchido**
- [x] `linha_relacionada` preenchido pelo painel em pelo menos um projeto, com o valor literal
      gravado colado na Evidência e `getEntry()` provado resolvendo (tarefa herdada do 019)
- [x] `npm run lint`, `npm run format:check`, `npm run test` e `npm run build` verdes
- [x] Nenhuma alteração em schema ou configuração

## Evidência

### O conteúdo foi criado pelo painel `/admin`, não à mão

Os 13 arquivos de `content/` já existiam quando este executor entrou, criados pelo orquestrador
operando o painel TinaCMS — exatamente como o plano pede ("crie o conteúdo pelo painel sempre
que possível"). Este executor conferiu cada critério de aceitação contra os arquivos reais,
corrigiu nada (nenhum critério estava descumprido) e rodou a sequência de qualidade.

### `git status` — os 13 arquivos

```
On branch main
Your branch is ahead of 'origin/main' by 1 commit.

Changes not staged for commit:
	modified:   content/perfil/index.md

Untracked files:
	content/disciplinas/2025.1-mecanica-classica.md
	content/disciplinas/2026.2-relatividade-geral.md
	content/linhas-pesquisa/relatividade-geral-e-teorias-alternativas-de-gravitacao.md
	content/linhas-pesquisa/sombras-de-buracos-negros.md
	content/projetos/forcas-de-mare-em-espacos-tempos-de-kerr.md
	content/projetos/sombras-de-buracos-negros-em-gravitacao-modificada.md
	content/publicacoes/2023-exemplo-notas-sobre-geodesicas-nulas-em-metricas-estacionarias.md
	content/publicacoes/2023-exemplo-perturbacoes-lineares-de-buracos-negros-com-cabelo-escalar.md
	content/publicacoes/2024-exemplo-desvios-da-hipotese-de-kerr-em-imagens-de-horizonte-de-eventos.md
	content/publicacoes/2024-exemplo-modos-quasinormais-de-campos-escalares-em-espacos-tempos-de-kerr.md
	content/publicacoes/2025-exemplo-forcas-de-mare-proximas-ao-horizonte-de-buracos-negros-em-rotacao.md
	content/publicacoes/2025-exemplo-sombras-de-buracos-negros-de-kerr-em-gravitacao-de-gauss-bonnet.md
```

`find content -type f` confirma as quatro pastas de coleção com um `.gitkeep` cada, mais os 13
arquivos acima e `content/perfil/index.md`.

### Critérios de aceitação × arquivo real

| Critério | Onde está cumprido |
|---|---|
| 1 perfil com dados reais do Apêndice C | `content/perfil/index.md`: nome, cargo ("Professor Adjunto A"), instituição ("Universidade Federal do Maranhão (UFMA), Campus São Luís"), departamento ("Centro Tecnológico — Departamento de Física"), `email: haroldo.lima@ufma.br`, `links.lattes`/`links.orcid` — todos conferidos linha a linha contra a tabela do Apêndice C (PRD.md:976-985). As 5 `formacao[]` (complementar ICTP, pós-doc, doutorado, mestrado, graduação) batem com a tabela de formação (PRD.md:991-997). As 4 `areas[]` são cópia literal da lista "Áreas de atuação" (PRD.md:1008-1011) |
| 2 linhas de pesquisa, `ordem` distinta | `relatividade-geral-e-teorias-alternativas-de-gravitacao.md` (`ordem: 1`), `sombras-de-buracos-negros.md` (`ordem: 2`) |
| 2 projetos, um sem `linha_relacionada` | `forcas-de-mare-em-espacos-tempos-de-kerr.md` — sem o campo; `sombras-de-buracos-negros-em-gravitacao-modificada.md` — com o campo preenchido |
| 2 disciplinas — uma `atual` com 5 aulas/listas/materiais, uma `anterior` sem `codigo` | `2026.2-relatividade-geral.md`: `status: atual`, 5 `aulas[]`, 2 `listas[]`, 2 `materiais[]`, 1 `links[]`, 2 `bibliografia[]`; `2025.1-mecanica-classica.md`: `status: anterior`, sem campo `codigo` |
| 6 publicações em 3 anos distintos, ao menos uma `destaque`, uma sem `doi` | anos 2023/2023/2024/2024/2025/2025 (3 distintos); `destaque: true` em `2025-exemplo-sombras-de-buracos-negros-de-kerr-em-gravitacao-de-gauss-bonnet.md`; sem `doi` em `2023-exemplo-notas-...`, `2024-exemplo-desvios-...` e `2025-exemplo-forcas-de-mare-...` |
| Nenhum DOI/arXiv/trabalho real | todo `doi` usa o prefixo não registrado `10.0000/`; `grep -rni "arxiv" content/` tem um único acerto (ver seção "Mecanismo de marcação" abaixo, é inofensivo); nenhum título corresponde a trabalho publicado |
| Mecanismo de marcação registrado | ver seção dedicada abaixo |
| Nomes de arquivo pelos templates (RN-08) | conferido contra `tina/config.ts`: `linhas-pesquisa`/`projetos` usam `slugify(titulo)` (linhas 299, 384); `disciplinas` usa `` `${semestre}-${slugify(nome)}` `` (linha 486-489); `publicacoes` usa `` `${ano}-${slugify(titulo)}` `` (linha 697-700) — todos os 12 nomes de arquivo (fora `perfil/index.md`, que é singleton) batem com o template correspondente |
| Q-07 tratada antes do primeiro save do Perfil | ver seção dedicada abaixo |
| Frontmatter conferido depois de cada save, sem lista embutida vazia | lido cada um dos 13 arquivos; nenhuma entrada de `aulas`, `listas`, `materiais`, `links`, `bibliografia` ou `formacao` está vazia — todos os campos obrigatórios de cada item de lista embutida (`numero`/`titulo`/`url` em `aulas`; `titulo`/`url` em `listas`; `titulo`/`tipo`/`url` em `materiais`) estão preenchidos |
| `publicado` explícito nos itens que devem aparecer | todos os itens das 4 coleções de listagem têm `publicado: true`, exceto o único caso de borda `publicado: false` (ver tabela de casos de borda) |
| `linha_relacionada` preenchido pelo painel, valor literal + `getEntry()` provado | ver seção "Tarefa herdada do 019" abaixo |
| `npm run lint`, `format:check`, `test`, `build` verdes | ver seção "Sequência de qualidade" abaixo |
| Nenhuma alteração em schema ou configuração | `git status --porcelain tina/ src/` não retorna nada — só `content/` foi tocado |

### Mecanismo de marcação do placeholder (decidido e registrado)

O repositório é público e as 6 publicações são inventadas. Mecanismo:

1. **`[EXEMPLO]`** como prefixo do `titulo` de toda publicação inventada — visível na página e no
   nome do arquivo (`{ano}-{slug(titulo)}` gera `2025-exemplo-...`).
2. **`[CONTEÚDO DE EXEMPLO]`** no fim do primeiro campo de texto livre (`resumo`/`descricao`) de
   todo item inventado, nas **quatro coleções de listagem** (`perfil` fica de fora: tem dados
   reais, não é placeholder).
3. **Todo URL usa o domínio `exemplo.invalid`** — TLD reservado pela RFC 2606, garantidamente não
   resolvível. Exceção deliberada: `content/perfil/index.md` tem `links.lattes` e `links.orcid`
   reais e corretos, porque o perfil não é placeholder.
4. **Todo DOI usa o prefixo `10.0000/`**, não registrado como prefixo DOI real. O campo `arxiv`
   está vazio nas 6 publicações — nenhum identificador arXiv foi preenchido.

Varredura, saída literal — total de ocorrências:

```
$ grep -rno "EXEMPLO\|exemplo.invalid\|10.0000/" content/ | wc -l
37
```

Distribuição por arquivo (`grep -c` conta linhas com pelo menos um acerto, não ocorrências —
por isso a disciplina de Relatividade Geral aparece com `12`, não `13`: 11 URLs marcadas mais a
`descricao`, cada uma em sua própria linha):

```
$ grep -rc "EXEMPLO\|exemplo.invalid\|10.0000/" content/*/*.md
content/disciplinas/2025.1-mecanica-classica.md:1
content/disciplinas/2026.2-relatividade-geral.md:12
content/linhas-pesquisa/relatividade-geral-e-teorias-alternativas-de-gravitacao.md:1
content/linhas-pesquisa/sombras-de-buracos-negros.md:1
content/perfil/index.md:0
content/projetos/forcas-de-mare-em-espacos-tempos-de-kerr.md:1
content/projetos/sombras-de-buracos-negros-em-gravitacao-modificada.md:1
content/publicacoes/2023-exemplo-notas-sobre-geodesicas-nulas-em-metricas-estacionarias.md:2
content/publicacoes/2023-exemplo-perturbacoes-lineares-de-buracos-negros-com-cabelo-escalar.md:4
content/publicacoes/2024-exemplo-desvios-da-hipotese-de-kerr-em-imagens-de-horizonte-de-eventos.md:2
content/publicacoes/2024-exemplo-modos-quasinormais-de-campos-escalares-em-espacos-tempos-de-kerr.md:5
content/publicacoes/2025-exemplo-forcas-de-mare-proximas-ao-horizonte-de-buracos-negros-em-rotacao.md:2
content/publicacoes/2025-exemplo-sombras-de-buracos-negros-de-kerr-em-gravitacao-de-gauss-bonnet.md:5
```

Soma por coleção: 2 nas linhas de pesquisa, 2 nos projetos, 13 nas disciplinas (1 + 12), 20 nas
publicações (2+4+2+5+2+5) — bate com as 37 do total. A confirmação independente de que a
disciplina de Relatividade Geral tem exatamente 11 URLs:

```
$ grep -c "url:" content/disciplinas/2026.2-relatividade-geral.md
11
```

(1 bibliografia + 5 aulas + 2 listas + 2 materiais + 1 link — as 11 URLs mais a marca na
`descricao` somam os 12 acertos por linha do arquivo.)

Varredura de `arxiv`, sem sensibilidade a maiúsculas:

```
$ grep -rni "arxiv" content/
content/publicacoes/2024-exemplo-desvios-da-hipotese-de-kerr-em-imagens-de-horizonte-de-eventos.md:8:resumo: 'Preprint fictício criado como conteúdo de exemplo para a fase 1 do site. Não corresponde a nenhum trabalho real e não tem DOI nem identificador arXiv. [CONTEÚDO DE EXEMPLO]'
```

Único acerto, dentro do `resumo` — é a frase dizendo que a publicação não tem identificador
arXiv, não um campo `arxiv` preenchido. O campo `arxiv` do schema está de fato vazio nas 6
publicações (confirmado lendo os 6 arquivos: nenhum tem a chave `arxiv:` no frontmatter).

### Tabela de casos de borda

| Caso de borda exigido (Passo 5) | Item que cobre |
|---|---|
| `publicado: false` (RN-01) | `content/publicacoes/2023-exemplo-notas-sobre-geodesicas-nulas-em-metricas-estacionarias.md` |
| Item **sem** grupo `en` | `content/linhas-pesquisa/sombras-de-buracos-negros.md` (e, por padrão, todos os demais itens exceto o citado abaixo — nenhuma publicação, projeto ou disciplina recebeu `en`) |
| Item **com** `en` parcialmente preenchido (RN-06, RN-09) | `content/linhas-pesquisa/relatividade-geral-e-teorias-alternativas-de-gravitacao.md`: `en: { titulo: '...' }` — `linhasPesquisaEnSchema` (`src/content.config.ts:187-193`) também aceita `resumo` e `corpo`, ambos ausentes aqui, confirmando que é parcial e não um `en` completo |
| Disciplina sem `codigo` | `content/disciplinas/2025.1-mecanica-classica.md` |
| Projeto sem `linha_relacionada` | `content/projetos/forcas-de-mare-em-espacos-tempos-de-kerr.md` |
| Publicação sem `doi` | `content/publicacoes/2023-exemplo-notas-sobre-geodesicas-nulas-em-metricas-estacionarias.md` (também sem `veiculo`, tipo `outro`) |

### Q-07 — já estava resolvida antes deste plano

O bloco 🚨 do plano sobre obter o e-mail institucional ou "parar e reportar" está **caduco**: foi
resolvido em 2026-09-03 (commit `0978b3f`, PRD v0.1.11). `content/perfil/index.md` já chegou a
este executor com `email: haroldo.lima@ufma.br` (e-mail real) e sem o bloco de comentário YAML da
Q-07 — o Perfil foi preenchido pelo painel sem perda de informação, confirmado lendo o arquivo:
não há vestígio de `PLACEHOLDER@ufma.br` nem de comentário. Nenhuma ação deste plano foi
necessária aqui além de conferir que o valor bate com o Apêndice C.

### Tarefa herdada do plano 019 — confirmada

Valor literal gravado pelo painel em
`content/projetos/sombras-de-buracos-negros-em-gravitacao-modificada.md`:

```
linha_relacionada: content/linhas-pesquisa/sombras-de-buracos-negros.md
```

É exatamente `content/linhas-pesquisa/<slug>.md` — confirma a premissa da correção do 019.

Prova independente de que `getEntry()` resolve depois da normalização (`normalizeLinhaRelacionadaId`
em `src/content.config.ts`): este executor reexercitou a prova criando uma página Astro temporária
(`src/pages/tmp-getentry-check.astro`, apagada depois — `git status --porcelain src/` não retorna
nada), servida por `astro dev --force` (necessário porque a content layer tem cache de quando as
pastas de coleção estavam vazias). Saída real de `curl http://localhost:4322/tmp-getentry-check`:

```json
{
  "projeto_id": "sombras-de-buracos-negros-em-gravitacao-modificada",
  "linha_relacionada_apos_normalizacao": {
    "id": "sombras-de-buracos-negros",
    "collection": "linhas-pesquisa"
  },
  "getEntry_resolveu": true,
  "linha_id": "sombras-de-buracos-negros",
  "linha_titulo": "Sombras de buracos negros"
}
```

Corroboração independente, reproduzível sem depender de relato: com
`sombras-de-buracos-negros-em-gravitacao-modificada.md` tendo `linha_relacionada` preenchido,
`astro check`/`npm run build` **não** emite `[ERROR] [content] Invalid content reference` para
essa entrada — em contraste direto com o Achado 2 abaixo, onde o mesmo comando emite esse erro
exato para o outro projeto (`forcas-de-mare-em-espacos-tempos-de-kerr`) enquanto o campo estava
vazio.

### Sequência de qualidade — saída real

Ambiente: Windows 11, PowerShell/Git Bash, Node 24.16.0.

**Achado operacional:** ao rodar `npm run build`, o comando falhou de imediato com
`Error: Tina Dev server is already in use. Datalayer server is busy on port 9000`. Um processo
`node ... @tinacms/cli/bin/tinacms dev` (PID 1556) ficara em execução desde 04/09/2026 09:33 —
resquício da sessão do painel `/admin` usada para criar os 13 arquivos. Encerrado
(`Stop-Process -Id 1556 -Force`) antes de repetir o build; nenhum conteúdo foi perdido porque já
estava gravado em disco.

```
$ npm run lint
> haroldo-page@0.1.0 lint
> eslint .

(sem saída — exit 0)
```

```
$ npm run format:check
> haroldo-page@0.1.0 format:check
> prettier --check .

Checking formatting...
All matched files use Prettier code style!
```

```
$ npm run test
> haroldo-page@0.1.0 test
> vitest run

 RUN  v4.1.11 S:/Projetos/academic_page/haroldo

 Test Files  4 passed (4)
      Tests  93 passed (93)
   Start at  10:05:31
   Duration  826ms (transform 984ms, setup 0ms, import 1.51s, tests 41ms, environment 0ms)
```

```
$ npm run build
> haroldo-page@0.1.0 build
> tinacms build && astro check && astro build

Starting Tina build
...
○  Tina build complete ─────────────────────────────
   API url: https://content.tinajs.io/2.4/content/8be98053-68c3-4262-b7bd-dd1286e1c7ad/github/main
...
[content] Syncing content
[content] Synced content
[types] Generated 475ms
[check] Getting diagnostics for Astro files in S:\Projetos\academic_page\haroldo...
Result (17 files):
- 0 errors
- 0 warnings
- 0 hints

[content] Syncing content
[content] Synced content
[types] Generated 426ms
[build] output: "static"
[build] mode: "static"
[build] directory: S:\Projetos\academic_page\haroldo\dist\
[build] Collecting build info...
[build] ✓ Completed in 463ms.
[build] Building static entrypoints...
[vite] ✓ built in 182ms
[vite] ✓ built in 48ms
[build] Rearranging server assets...
 generating static routes
  ├─ /index.html (+9ms)
 ✓ Completed in 20ms.
[build] ✓ Completed in 279ms.
[build] 1 page(s) built in 753ms
[build] Complete!
```

Nenhum `ERR_CLOUD_CHECK_FAILED` — esperado, já que este plano não tocou schema. Não houve
regeneração de `tina/tina-lock.json` (`git status --porcelain tina/` vazio antes e depois do
build).

### Achado 1 — o formulário do Tina descarta alterações ao voltar de um subpainel

Reproduzido duas vezes pelo orquestrador, com A/B de uma variável:

- Criando uma linha de pesquisa: interruptor `Publicado` ligado, depois entrei no subpainel
  "Versão em inglês" e voltei pelo breadcrumb; a tela mostrava ligado e o arquivo gravou
  `publicado: false`. A mesma criação **sem** visitar subpainel gravou `publicado: true`.
- Editando o Perfil: alterei `nome` e `bio` (que já tinham valor), depois visitei os subpainéis
  de `formacao` e `links`; ao salvar, `nome` e `bio` **reverteram aos valores antigos**, enquanto
  `departamento` (que estava vazio) gravou o valor novo.

Regra que explica os dois casos: ao voltar de um subpainel, o formulário re-inicializa a partir
do documento carregado — alteração em campo que **já tinha valor inicial** (inclusive o
`defaultItem: { publicado: false }`) é perdida em silêncio; campo que estava vazio sobrevive.
Contorno usado: **alterar esses campos por último, depois de sair de qualquer subpainel, e
conferir o arquivo gravado a cada save.**

### Achado 2 — projeto criado sem escolher linha de pesquisa grava string vazia, e o Astro rejeita

O painel gravou `linha_relacionada: ''` (não omitiu o campo). Saída literal de
`npx astro check`:

```
[ERROR] [content] Invalid content reference: entry "forcas-de-mare-em-espacos-tempos-de-kerr" in collection "projetos" (field: linha_relacionada) references "" in collection "linhas-pesquisa", but that entry does not exist.
```

O `astro check` ainda encerrou com `0 errors` e exit 0 — o erro de conteúdo é registrado mas não
reprova o comando. Corrigido **no conteúdo, pelo orquestrador, antes deste executor entrar** (a
linha foi removida do arquivo à mão), não no schema — o arquivo final de
`forcas-de-mare-em-espacos-tempos-de-kerr.md` já chegou a este executor sem o campo
`linha_relacionada`; nenhuma correção deste executor foi necessária aqui. É insumo direto para a
fase 2 (F-09, RNF-09: mensagem de erro de build que o professor consiga interpretar) e para o
manual da fase 5. Contraste registrado: `codigo` vazio numa disciplina foi **omitido** do
frontmatter pelo painel — o problema de gravar string vazia é específico do campo `reference`.

**Divergência com a docstring de `normalizeLinhaRelacionadaId`** (`src/content.config.ts:239-241`):
o comentário lá afirma que uma referência inválida produz "falha silenciosa que só apareceria na
fase 3" — pressupondo que nada reporta o problema antes de uma página tentar renderizar o dado.
Este Achado 2 mostra o contrário: `astro check` **já reporta em voz alta**, hoje, na fase 1 —
`[ERROR] [content] Invalid content reference: ...` sai no terminal a cada `npm run build`. O que
de fato é silencioso não é o erro em si, mas o **exit code**: o comando termina com `0 errors` e
sucesso mesmo tendo acabado de imprimir esse `[ERROR]` uma linha antes. Registro apenas — corrigir
o texto da docstring é de outro plano, não deste.

**Restrição para a fase 3:** nenhum item de `linhas-pesquisa`, `projetos` ou `disciplinas` carrega
a marca de placeholder no `titulo`/`nome` — só a `descricao` (ou `resumo`, em linhas de pesquisa)
tem `[CONTEÚDO DE EXEMPLO]`. Só `publicacoes` marca o próprio `titulo` (`[EXEMPLO]`). Uma listagem
da fase 3 que renderize apenas o título de uma linha de pesquisa, projeto ou disciplina — sem
mostrar a descrição — exibiria conteúdo inventado atribuído a uma pessoa real sem marcador visível
nenhum. Hoje isso não é defeito deste plano: o build gera 1 página (`/index.html`) e nada desse
conteúdo está publicado nem renderizado ainda. Mas a fase 3 precisa garantir que toda superfície
que liste esses itens (mesmo um card curto) mostre a descrição, ou aceite o risco.

### `.gitkeep` agora redundantes

`content/linhas-pesquisa/.gitkeep`, `content/projetos/.gitkeep`, `content/disciplinas/.gitkeep` e
`content/publicacoes/.gitkeep` existem só para as quatro pastas não ficarem vazias no Git. Com o
conteúdo real presente em cada uma, os quatro arquivos ficaram redundantes. Não removidos por este
executor — está fora de "Arquivos afetados" do plano, e removê-los é decisão de limpeza, não de
conteúdo.

### O que não foi cumprido

Nenhum critério de aceitação ficou descumprido.
