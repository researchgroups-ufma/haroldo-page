# Polimento do site público — design

- **Data:** 2026-09-23
- **Branch:** `design` (a partir de `f7e7345`)
- **Origem:** sessão de brainstorming + auditoria read-only (`/improve`) com o stakeholder
- **Natureza:** refinamento da direção já aprovada (cartão contido, Archivo leve, p&b, réguas finas). Não é redesenho.

## 1. Objetivo e critérios de sucesso

Deixar o site consistente de ponta a ponta e alinhado ao "minimalismo editorial" atual — tipografia conduz, movimento funcional, transições entre estados — sem perder o que já funciona.

Sucesso significa:

1. Toda página interna usa o mesmo cabeçalho compacto, a mesma coluna de rótulos e o mesmo hover.
2. Pesquisa e 404 falam a mesma linguagem de Ensino, Publicações e Sobre (linhas com régua, sem caixas, sem tags em caixa alta).
3. A navegação entre páginas anima o nome "Haroldo Lima" entre a Home e o cabeçalho, e troca o conteúdo com um fade curto, sem JS de roteamento.
4. Os achados de acessibilidade, desempenho e metadados da seção 6 estão corrigidos e verificados.
5. Suíte, `test:dist`, lint e `astro check` passam; o comportamento visual foi conferido no navegador (Vivaldi) a 1440/1366/360 px.

**Fora do escopo** (decidido na sessão): segunda voz tipográfica (mono), modo escuro, Lenis, Open Graph e canonical (fase 5, RF-30), migração da mídia para `astro:assets`.

## 2. Abordagem

**Fundação primeiro, depois as páginas.** Os tokens e peças compartilhadas nascem num lugar só; as páginas migram para elas; Pesquisa e 404 são refeitas já sobre a fundação; transições e robustez vêm por último, porque tocam o layout inteiro. Alternativa descartada: polir página por página — foi assim que surgiram as cinco larguras de coluna e os três tratamentos de título.

## 3. Fundação visual

- **Tokens em `src/styles/global.css`:**
  - `--coluna-rotulo: 11rem` — toda coluna de metadados à esquerda (Ensino, Publicações, Pesquisa, disciplina, timelines da Sobre) passa a usá-lo. Hoje há 11rem, 7rem, 6,5rem e 3rem.
  - utilitário `text-nav` (0,875rem) — substitui o `text-[0.9375rem]` avulso do cabeçalho, do `ScriptPanel` e afins.
  - ritmo de topo único para o conteúdo das páginas internas: `pt-6 lg:pt-8`.
- **`PageHeader` compacto:** `<h1>` em `text-display-2` à esquerda, **sem rubrica e sem contagens** (decisão do stakeholder); prop opcional `meta` para uma linha pequena de identificação **abaixo** do título (usada só pela disciplina — "FIS0000 · 2026.2 · Atual" — e pela 404 — "Erro 404"); régua de 1px **dentro** de `px-margem`. A Sobre passa a usá-lo. A Home continua única.
- **Hover único:** link de navegação e de lista sublinha no hover, `underline-offset: 6px`, igual ao item ativo do menu.
- **Limpeza:** remover `mx-auto max-w-[90rem]` redundante dentro do cartão; remover as utilidades tipográficas sem uso (`text-ano`, `text-numeral-sm`, e `text-numeral` quando a Pesquisa deixar de usá-la).

## 4. Pesquisa e 404

### Pesquisa — projetos dentro de cada linha

- `PageHeader` compacto: "Linhas e projetos".
- **Linha de pesquisa** = bloco com régua forte, grade `--coluna-rotulo`: à esquerda "01" em `text-pequeno text-secundario` (sai o numeral gigante); à direita título em `text-display-2`, `resumo` em cinza, `corpo` em parágrafos e `imagem` em p&b quando houver. O `id` âncora de cada linha permanece.
- **Projetos da linha** logo abaixo, como linhas finas na mesma grade: à esquerda período (`inicio–fim`, ou `inicio–` se em aberto) e status em texto simples; à direita título, `descricao` e, quando houver, "financiador · colaboradores".
- **"Outros projetos"** no fim: projetos sem `linha_relacionada` ou ligados a linha não publicada (RN-01). Só aparece se não vazio.
- Sai a tag "N projetos em andamento" e o contorno tracejado de "Concluído" (que tinha contraste 2,7:1).
- **Código:** nova `groupProjectsByLine(lines, projects)` em `src/lib/research.ts`, escrita em TDD, devolvendo `{ byLine: Map<lineId, Project[]>, others: Project[] }` na ordem de `sortProjects`. Saem `ProjectCard.astro` e `Tag.astro` (ficam sem uso); funções e textos órfãos saem na seção 6, respeitando testes.

### 404

- `PageHeader` compacto "Página não encontrada", `meta` "Erro 404".
- Texto explicativo, depois as rotas de `NAV_ITEMS` como linhas com régua e "›" (padrão das disciplinas anteriores); "Início" é a primeira. Sai o botão pílula → `PillButton.astro` é removido.
- Hover pelo sublinhado único (hoje `hover:bg-bloco` sobre um cartão já `bloco` é invisível).

## 5. Transições entre páginas

- **Mecanismo:** View Transitions entre documentos, só CSS — `@view-transition { navigation: auto; }` em `global.css`. Sem `<ClientRouter>`: ele exigiria reinicializar GSAP, abas e barra de rolagem a cada navegação e acrescentaria JS. Navegadores sem suporte (Firefox) navegam normalmente.
- **Nomes de transição:**
  - `view-transition-name: nome` no nome da Home (`h1`) e no nome do `SiteHeader` — o navegador anima o nome grande "encolhendo" para o cabeçalho e vice-versa.
  - `view-transition-name: menu` na navegação da Home e do `SiteHeader`.
  - Conteúdo (`root`): antigo sai em ~120 ms (opacidade), novo entra em ~220 ms (opacidade + 6px de subida).
- **Sem animação dupla:** script inline mínimo no `<head>` ouve `pagereveal`; se `event.viewTransition` existir, marca `<html data-vt>` e o CSS desliga `titulo-entrada`/`regua-entrada` nessa carga. Carga direta mantém a animação de entrada.
- **Movimento reduzido:** sob `prefers-reduced-motion: reduce`, `::view-transition-*` sem animação.

## 6. Robustez

Cada achado é **reproduzido antes de corrigido** (a auditoria indicou onde olhar; não é prova).

**Acessibilidade**

1. Publicações: corpos de ano fechados com `inert` (atualizado no `onUpdate` da timeline pela altura > 0); Tab não cai em links invisíveis.
2. `<main id="conteudo" tabindex="-1">`, sem contorno ao receber foco — o "Pular para o conteúdo" leva o foco para dentro do cartão e setas/PageDown rolam o conteúdo.
3. `ScriptPanel` recebe o nível do título por prop (`h4` dentro de aula, `h3` na aba Scripts). Em Publicações, a contagem do ano sai de dentro do `<h2>`.
4. `alt` da foto: `pt.site.portraitAlt(nome)` → "Retrato de Haroldo Lima" (Home e Sobre).
5. Clique no trilho da barra de rolagem e no ano em Publicações: `behavior: 'auto'` quando `prefers-reduced-motion: reduce`.

**Desempenho**

6. Foto com `width`/`height` (960×1280) e `fetchpriority="high"` na Home.
7. GSAP por `import()` dinâmico dentro da condição `(min-width: 64rem) and (prefers-reduced-motion: no-preference)` — celular não baixa.
8. `<link rel="preload">` do Archivo 300 (woff2, latin) no `<head>`.
9. `public/_headers`: `/_astro/*` com `Cache-Control: public, max-age=31536000, immutable`.

**Metadados**

10. Favicon SVG (monograma "HL", tinta sobre papel) e `<meta name="theme-color">`. Open Graph/canonical ficam para a fase 5 (RF-30).

**Limpeza**

11. Remover chaves órfãs de `pt` e os testes que existiam só para elas: `home.*`, `research.eyebrow/summary/activeProjects` (as que ficarem sem uso após a seção 4, Pesquisa), `teaching.lessons/problemSets/scripts/open`, `course.onThisPage/open`, `publications.featured/abstractAndKeywords/keywords`, `about.academicProfiles`.
12. Remover `countCourseItems` e as funções de `lib/research.ts` sem uso após a seção 4 (Pesquisa), com seus testes.
13. **Exceção a decidir no plano:** `pt.publications.type` tem teste de paridade com o enum do schema. Se o tipo não voltar a aparecer na lista de publicações, apresentar o caso ao stakeholder em vez de remover.

## 7. Verificação

- `npm test`, `npm run lint`, `npm run build:pipeline` (inclui `astro check`), `npm run test:dist` — saída colada em cada etapa.
- Navegador (Vivaldi), com medição e não só olho:
  - 1440×800, 1366×650 e 360 px: sem rolagem horizontal; Home e Sobre sem rolagem vertical a partir de `lg`.
  - Transições: Home → Sobre → Ensino → disciplina → Home, nome animando; Publicações, abas e barra de rolagem funcionando depois de chegar por transição.
  - Tab em Publicações não entra em ano fechado; skip link leva o teclado para dentro do cartão.
  - Rede: nenhum `/favicon.ico` 404; GSAP ausente a 360 px.
- Pendência documental a registrar no fim: PRD (RF-20, RF-21, RF-23, RF-24, RF-25, §7.3) e `docs/identidade-visual.md` (§5, §6) ainda descrevem o layout anterior.
