# Plano 020 — Conteúdo placeholder representativo nas cinco coleções

**Status:** TODO
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

- [ ] 1 perfil com os **dados reais** do Apêndice C
- [ ] 2 linhas de pesquisa com `ordem` distinta
- [ ] 2 projetos, um deles sem `linha_relacionada`
- [ ] 2 disciplinas — uma `atual` com **5 aulas**, listas e materiais; uma `anterior` sem `codigo`
- [ ] 6 publicações em **3 anos distintos**, ao menos uma com `destaque` e uma sem `doi`
- [ ] **Nenhum DOI, arXiv ou trabalho real** entre as publicações inventadas
- [ ] Mecanismo de marcação do placeholder definido e registrado — o repositório é **público**
- [ ] Casos de borda cobertos: `publicado: false`, item sem `en`, item com `en` parcial
- [ ] Nomes de arquivo gerados pelos templates (RN-08), não digitados
- [ ] `npm run lint`, `npm run format:check`, `npm run test` e `npm run build` verdes
- [ ] Nenhuma alteração em schema ou configuração

## Evidência

<Preenchido pelo executor: `ls` de `content/` com os 13 arquivos, saída dos quatro comandos,
mecanismo de marcação do placeholder, e a tabela de qual item cobre qual caso de borda.>
