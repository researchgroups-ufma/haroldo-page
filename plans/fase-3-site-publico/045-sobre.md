# Plano 045 — Sobre (RF-21)

**Status:** TODO
**RFs cobertos:** **RF-21**, F-08, RF-26
**Depende de:** planos 038 (`toParagraphs`), 039 (`requireSingleton`), 042 (layout), 043 (componentes)
**Modelo recomendado:** sonnet
**Agente recomendado:** implementer
**Executável por:** agente (código) + **orquestrador** (verificação no navegador)
**PRD:** `S:\Projetos\academic_page\haroldo\PRD.md`
**Projeto:** `S:\Projetos\academic_page\haroldo`

## Objetivo

`/sobre/` mostra biografia em parágrafos, formação, áreas de atuação, contato, perfis acadêmicos
(incluindo o currículo em PDF) e a foto — **apenas os campos preenchidos**, sem rótulo órfão.

## Arquivos afetados

- `src/pages/sobre.astro` — novo

> O executor não toca em arquivo fora desta lista. Se precisar, para e reporta.
> `Status:` fica `TODO`. Não commite. Outros planos da onda 3 podem estar editando `src/pages/*` em
> paralelo; não rode build ao mesmo tempo que outro executor (README da fase).

## Contexto necessário

**Especificação:** `docs/identidade-visual.md` §6.2 (Sobre), §5.4 (tag neutra em caixa normal), §5.5
(link externo) e §1 regra 2 ("campo vazio não deixa rastro"). `ref/` não existe para você.

**Regras herdadas:** "Regras de código que todo plano desta fase herda" em
`plans/fase-3-site-publico/README.md`. Link externo **só** por `ExternalLink.astro` (plano 043).

**Critério do RF-21, literal:** "vê todos os campos preenchidos **e apenas eles** — campos vazios não
deixam rótulo órfão na página".

**Dados** (`perfilSchema`, `src/content.config.ts:163-179`; real em `content/perfil/index.md`):
`bio` (obrigatório; hoje um parágrafo), `formacao?: {grau, curso, instituicao, ano}[]` (hoje 5 itens,
**do mais recente ao mais antigo**, ordem do professor — não reordene), `areas?: string[]` (4),
`email` (obrigatório), `links?: {lattes?, orcid?, scholar?, arxiv?, researchgate?, github?,
institucional?}` (hoje só `lattes` e `orcid`), `cv_url?` (ausente), `foto?` (ausente).

**Composição (§6.2):**
- `BaseLayout title={pt.about.eyebrow}`; `PageHeader eyebrow={pt.about.eyebrow} title={pt.about.title}`
  com slot `aside` = `bio` via `toParagraphs`, cada parágrafo `<p class="text-corpo max-w-medida">{p}</p>`.
- **Formação** (rubrica `pt.about.education`, `<h2>`): linhas de grade de 3 colunas — `ano` ·
  `grau — curso` · `instituicao` —, régua fina entre linhas e forte na primeira (§5.5); abaixo de
  `sm`, cada linha empilha. Lista semântica (`<ol>` não: a ordem não é sequência numerada; use `<ul>`
  com `role` padrão).
- **Faixa de quatro células**, régua fina entre elas, empilhando abaixo de `sm`:
  1. áreas (`pt.about.areas`): uma `Tag variant="neutral" normalCase` por item;
  2. contato (`pt.about.contact`): `email` como `mailto:`, sublinhado;
  3. perfis acadêmicos (`pt.about.academicProfiles`): um `ExternalLink` por chave de `links`
     preenchida, **na ordem** `lattes, orcid, scholar, arxiv, researchgate, github, institucional`,
     rótulo `pt.about.links[chave]`, e depois `cv_url` com `pt.about.links.cv`;
  4. foto: `<img src={foto} alt={nome} loading="lazy" decoding="async">` em p&b (`grayscale`).
- **Cada bloco sem dado some inteiro, com a rubrica** (RF-21): `formacao` vazia/ausente → sem seção;
  `areas` vazia → sem célula; nenhum link e sem `cv_url` → sem célula; sem `foto` → sem célula. A
  grade se recompõe (use `auto-fit` ou só renderize as células presentes com colunas derivadas do
  número delas) — nenhum espaço reservado (F-08).
- Um `<h1>` só (o do `PageHeader`); rubricas de bloco são `<h2 class="text-rotulo">`.

**Valores esperados com o conteúdo atual** (comparação, não teste): bio em 1 parágrafo; 5 linhas de
formação na ordem do arquivo; 4 tags; e-mail `haroldo.lima@ufma.br`; perfis "Currículo Lattes" e
"ORCID" apenas; nenhuma célula de foto; nenhum "Currículo em PDF".

## Passos

1. Escrever `src/pages/sobre.astro` → verify: `npx astro check` com resumo colado.
2. Build → verify: `npm run build:pipeline` colado; `ls dist/sobre/index.html` colado.
3. HTML → verify: cole `grep -c '<h1' dist/sobre/index.html` (1), `grep -o 'Currículo Lattes\|ORCID\|Google Scholar\|Currículo em PDF' dist/sobre/index.html` (só os dois primeiros), `grep -c '<img' dist/sobre/index.html` (0).
4. Canário de "rótulo órfão", sem tocar em `content/`: substitua temporariamente no componente os `links` por `{}` e `areas` por `[]`, `npx astro build`, cole `grep -c 'Perfis acadêmicos\|Áreas de atuação' dist/sobre/index.html` (esperado `0`); desfaça e cole `git diff src/pages/sobre.astro` (se o arquivo ainda não está commitado, `git status --short` mostrando `??` e a conferência visual de que a versão final não tem os valores temporários) → verify: saídas coladas.
5. Orquestrador — "Verificação no navegador" do README da fase em `/sobre/`, 360/768/1440: `[scrollWidth, clientWidth]`; formação empilhada em 360; e-mail e perfis clicáveis; perfis abrem em nova aba; Tab com foco visível; "Sobre" com `aria-current` no cabeçalho.
6. Portão → verify: `npm run lint`, `npm run format:check`, `npm run test:coverage` colados.

## Critérios de aceitação

- [ ] Bio em parágrafos, formação na ordem do arquivo, áreas como tags neutras em caixa normal, e-mail, perfis preenchidos e (se houver) `cv_url` e foto
- [ ] Bloco sem dado some com a rubrica — provado pelo canário do passo 4
- [ ] Um único `<h1>`; nenhum `<img>` e nenhum "Currículo em PDF" com o conteúdo atual
- [ ] Links externos só via `ExternalLink`
- [ ] `[scrollWidth, clientWidth]` iguais em 360/768/1440, transcritos com data e horário
- [ ] Nenhuma string de interface fora de `src/i18n/pt.ts`
- [ ] `astro check`, `lint`, `format:check`, `test:coverage`, `build:pipeline` verdes, com saída colada

## Evidência

<Preenchido pelo executor (1–4, 6) e pelo orquestrador (5). Declare o que NÃO rodou.>
