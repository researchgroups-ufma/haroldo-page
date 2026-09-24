# Identidade visual do site público

Especificação do visual do site público — a que a fase 4 espelha nas rotas `/en`. Nasceu na fase 3
traduzindo o mock `ref/Site UFMA Física v2.dc.html` (resposta
da **Q-04**) para o projeto real: o schema de `src/content.config.ts`, as rotas do §6.1 e as
restrições do §8.2 e da RNF-02. As decisões de recorte estão em
[`docs/sabatinas/CHANGELOG_sabatina_identidade-visual.md`](sabatinas/CHANGELOG_sabatina_identidade-visual.md).

> **`ref/` não é versionada** (decisão do stakeholder, 2026-09-14: contém capturas de portfólios de
> terceiros e o repositório é público). Ela existe só na máquina do desenvolvedor; este documento
> tem de bastar sozinho, e nenhum plano, teste ou revisão pode depender de abrir `ref/`.

> **Precedência.** Onde este documento e o mock divergem, vale este documento — cada divergência
> está listada na seção 8 com o motivo. Onde este documento e o PRD divergem, vale o PRD e a
> divergência é reportada.

Criado em 2026-09-14. **Revisado em 2026-09-24** para descrever o site depois do redesenho em
cartão contido (`f7e7345`) e do polimento (`ffb5304`..`728a580`, spec em
`docs/superpowers/specs/2026-09-23-polimento-design.md`), ambos na branch `design`. As seções 1 a 7
descrevem o código atual; as seções 8 e 9 são o registro da tradução do mock e ficaram como estavam.

---

## 1. Princípio

O site é um **caderno de física impresso**: papel cinza, um cartão claro por cima, tinta quase
preta, nenhuma cor e réguas de 1 px. **A tipografia conduz** — o título grande e leve é a única
ousadia; todo o resto é texto pequeno e quieto.

Três regras que decidem os casos não previstos:

1. **Estrutura é informação.** Régua, rubrica e caixa só existem se disserem algo sobre o conteúdo.
   Nada de numeral decorativo nem de contagem de itens: a página mostra os títulos, não quantos são.
2. **Campo vazio não deixa rastro** (RF-21, F-05, F-08). Bloco sem dado some inteiro, com a rubrica; a
   grade se recompõe em vez de reservar espaço.
3. **O conteúdo nunca depende de JS** (RNF-02). Todo script é melhoria progressiva: sem ele, o
   conteúdo inteiro continua visível e navegável.

---

## 2. Cor

| Token          | Hex       | Uso                                                                  |
| -------------- | --------- | -------------------------------------------------------------------- |
| `--papel`      | `#EFEDEA` | Fundo da janela, em volta do cartão                                  |
| `--bloco`      | `#F7F6F4` | Fundo do cartão que contém o site e do painel de script              |
| `--tinta`      | `#111112` | Texto principal, régua forte, botão "Copiar código"                  |
| `--secundario` | `#5A5754` | Texto secundário, metadados, rubricas                                |
| `--regua`      | `#D6D3CF` | Régua fina entre linhas de lista; borda do painel de script; trilho  |
| `--tracejado`  | `#9A9691` | **Só** a barra de rolagem nativa (sem JS e no celular) — nunca texto |
| `--comentario` | `#6E6A66` | Comentários e strings no código dos scripts                          |

Contraste calculado pela fórmula de luminância relativa da WCAG 2.1 em 2026-09-14: `--tinta`
sobre `--papel` 16,15:1 e sobre `--bloco` 17,47:1; `--secundario` sobre `--papel` 6,14:1 e sobre
`--bloco` 6,65:1; `--comentario` 4,59:1 sobre `--papel` e 4,96:1 sobre `--bloco`. Todos acima de
4,5:1 (RNF-15). `--tracejado` sobre `--papel` dá 2,52:1 e por isso nunca carrega informação.

Os tokens vivem em `src/styles/global.css` como `--color-*` (`@theme` do Tailwind 4). O
`<meta name="theme-color">` e o `public/favicon.svg` repetem `#EFEDEA`/`#111112` à mão, porque
arquivos estáticos não leem os tokens.

Sem modo escuro (RF-36 WONT).

---

## 3. Tipografia

**Preferência do stakeholder:** Helvetica e grotescas sem serifa como ela; **nada de monoespaçada
fora de código** (Decisão 4).

| Papel                                    | Família                                                     | Pesos    | Origem                                                                       |
| ---------------------------------------- | ----------------------------------------------------------- | -------- | ---------------------------------------------------------------------------- |
| Texto (corpo, itens, navegação, rubrica) | `"Helvetica Neue", Helvetica, Arial, sans-serif`            | 400      | Sistema — zero download                                                      |
| Display (nome e títulos)                 | `"Archivo", "Helvetica Neue", Helvetica, Arial, sans-serif` | 200, 300 | **Auto-hospedada** via `@fontsource/archivo`, só latin, `font-display: swap` |
| Código (bloco dos scripts, RF-37)        | `ui-monospace, "SF Mono", Menlo, Consolas, monospace`       | 400      | Sistema — zero download                                                      |

A Archivo existe porque a Helvetica Neue só tem pesos leves no macOS; no Windows e no Android ela
cai em Arial, sem peso fino. O arquivo do peso 300 tem `<link rel="preload">` no `<head>`
(`BaseLayout.astro`), apontando o mesmo arquivo que o CSS usa. Nada vem do Google Fonts (RNF-01,
RNF-03).

### Escala (fluida entre 360 e 1440 px)

Cada token é um `@utility` em `src/styles/global.css`.

| Token         | Tamanho                                       | Linha | Espaçamento        | Família / peso | Uso                                                                                      |
| ------------- | --------------------------------------------- | ----- | ------------------ | -------------- | ---------------------------------------------------------------------------------------- |
| `display-1`   | `clamp(2.625rem, 1.9rem + 3.2vw, 5rem)`       | 1.0   | −0.035em           | Archivo 300    | Só o nome na Home                                                                        |
| `display-2`   | `clamp(1.875rem, 1.5rem + 1.7vw, 2.875rem)`   | 1.05  | −0.03em            | Archivo 300    | `<h1>` das páginas internas, nome no cabeçalho, linha de pesquisa, disciplina atual, ano |
| `titulo-item` | `clamp(1.125rem, 1.05rem + 0.35vw, 1.375rem)` | 1.3   | −0.015em           | Helvetica 400  | Aula, projeto, disciplina anterior, publicação, material, script                         |
| `corpo`       | `1rem`                                        | 1.7   | 0                  | Helvetica 400  | Texto corrido; medida máxima `38rem` (`max-w-medida`)                                    |
| `pequeno`     | `0.875rem`                                    | 1.6   | 0                  | Helvetica 400  | Metadados, descrições de item, autores, veículo                                          |
| `nav`         | `0.875rem`                                    | 1.2   | 0                  | Helvetica 400  | Navegação e botões                                                                       |
| `rotulo`      | `0.75rem`                                     | 1.2   | 0.14em, caixa alta | Helvetica 400  | Rubrica de seção — **nunca** abaixo de 12 px                                             |

Caixa alta só na **rubrica de seção** ("Atuais", "Formação acadêmica", "Outros projetos",
"Todas as páginas"). Metadado (código, semestre, período, data, veículo) vai em caixa normal.

---

## 4. Grade e espaçamento

- **Cartão contido.** O site inteiro vive num cartão `--bloco` de cantos arredondados
  (`rounded-2xl`) sobre o `--papel`, com margem `px-margem` em volta e largura máxima de `90rem`
  (1440 px). A partir de `lg` o cartão tem a altura da janela (`h-svh`), **a página nunca rola** e
  quem rola é o `<main id="conteudo">` dentro do cartão. Abaixo de `lg` a página rola normalmente.
- **Margem lateral** (`px-margem`): `clamp(1.25rem, 4vw, 3.5rem)`, fora e dentro do cartão.
- **Breakpoints:** só `sm` (40rem, 640 px) e `lg` (64rem, 1024 px); os padrões do Tailwind são
  removidos. Home e Sobre usam grade de 12 colunas a partir de `lg`; o resto é coluna única.
- **Um eixo esquerdo.** Nome, título da página, títulos de seção e títulos de item começam no
  mesmo x (a margem). **Metadado vai numa linha pequena em `--secundario` acima do título**, nunca
  numa coluna à esquerda. A exceção são as timelines da Sobre, que usam uma coluna de período
  (`--coluna-rotulo`: 11rem a partir de `sm`, 6,5rem abaixo).
- **Réguas:** `1px solid var(--regua)` entre linhas de lista; `1px solid var(--tinta)` só para
  **abrir** um bloco (régua do cabeçalho de página, primeira linha de uma lista, topo de cada linha
  de pesquisa). Sem sombra.
- **Ritmo:** topo do conteúdo das páginas internas `pt-6 lg:pt-8`; múltiplos de `0.5rem`.
- **Faixa verificada:** 360 a 1440 px sem rolagem horizontal (RF-26); Home e Sobre sem rolagem
  vertical a 1440×800 e a 1366×650.

---

## 5. Componentes

Todos em `src/components/`. Não existem mais botão pílula, tag nem rodapé: `PillButton`, `Tag` e
`ProjectCard` saíram no polimento, e o rodapé saiu no redesenho.

### 5.1 Cabeçalho (`SiteHeader.astro`)

- Nome de exibição (`siteConfig.displayName`, "Haroldo Lima") em `display-2`, link para `/`; à
  direita a navegação em `text-nav` (Sobre, Pesquisa, Ensino, Publicações — `NAV_ITEMS` sem
  "Início", como na Home: a volta para `/` é sempre o nome).
- Página ativa: sublinhado de 1 px deslocado 6 px e `aria-current="page"`; o hover faz o mesmo
  sublinhado (`link-sublinhado`). A página de disciplina marca "Ensino".
- Abaixo de `lg`: botão "Menu" (alvo ≥ 44 px, `aria-expanded`/`aria-controls`) que abre a lista
  com réguas; sem JS, a lista aparece aberta.
- **Fase 4:** o lugar do seletor de idioma (RF-29) está marcado por um comentário entre o nome e o
  botão "Menu".
- A Home não usa este cabeçalho (`BaseLayout` com `bare`): ela mesma mostra o nome grande e o menu.

### 5.2 Cabeçalho de página (`PageHeader.astro`)

`<h1>` em `display-2`, linha opcional `meta` em `pequeno`/`--secundario` **abaixo** do título
(disciplina: "FIS0000 · 2026.2 · Atual"; 404: "Erro 404") e a régua forte. Sem rubrica e sem
contagem. O slot `aside` ocupa a coluna direita a partir de `lg` (usado pela disciplina).

### 5.3 Linha de lista

Régua fina no topo, régua forte na primeira; metadado numa linha pequena acima do título;
descrição em `pequeno`/`--secundario`. Hover: sublinhado de 1 px deslocado 6 px no título. Link
externo sai por `ExternalLink.astro`: termina em `↗`, abre em nova aba e leva o texto oculto
"(abre em nova aba)" (§8.3).

### 5.4 Painel de script (`ScriptPanel.astro`, RF-37)

Caixa `--bloco` com borda `--regua`. Esquerda: rubrica "Script · Python", título (`h3`; `h4`
dentro de uma aula), descrição, botão **Copiar código** (sólido; vira "Copiado" por 2 s com
`aria-live="polite"`, só aparece se a Clipboard API existir) e **Abrir arquivo ↗** (se houver
`url`). Direita (abaixo, no celular): `<pre>` com destaque de sintaxe gerado **no build** pelo Shiki
num tema de três tons (`src/lib/code-theme.ts`).

### 5.5 Barra de rolagem (`ScrollBar.astro`)

A partir de `lg`, trilho de 1 px `--regua` e cursor fino `--tinta` ao lado do `<main>`; alarga ao
rolar ou sob o ponteiro e aceita arrasto e clique no trilho. Sem JS e no celular fica a barra
nativa, fina, nas cores do site.

---

## 6. Rotas

**Negrito** = campo do schema. Toda página interna começa pelo `PageHeader` (5.2).

### 6.1 Home `/` (RF-20)

- Topo: **nome** de exibição em `display-1` (`<h1>`) à esquerda e a navegação à direita, sem
  "Início".
- Meio: **foto** em p&b, 3:4, quando houver.
- Régua forte e três blocos: **cargo** / **departamento** / **instituicao**, **resumo_home** e o
  link do Lattes; **formacao[]** (ano · grau — curso); **areas[]**.
- Sem rolagem a partir de `lg`. Os caminhos para Pesquisa, Ensino e Publicações são a navegação.

### 6.2 Sobre `/sobre` (RF-21)

- `<h1>` "Biografia e formação". Grade 6/6 a partir de `lg`.
- Esquerda: **foto** e **bio** em parágrafos; rubrica "Contato" com **email** e os perfis
  acadêmicos (**links.\***, na ordem do schema, e **cv_url** como "Currículo em PDF").
- Direita: timelines "Formação acadêmica" (**formacao[]**: **ano** · **grau** — **curso** /
  **instituicao**) e "Atuação profissional" (**atuacao[]**: **periodo** · **cargo** /
  **instituicao**).
- As **areas[]** ficam na Home, não aqui. Bloco sem dado some com a rubrica. Sem rolagem a partir
  de `lg`: a grade 6/6 e o espaçamento das timelines foram ajustados para caber a 1366×650.

### 6.3 Pesquisa `/pesquisa` (RF-22, RF-13)

- `<h1>` "Linhas e projetos".
- Um bloco por **linhas-pesquisa** publicada, na ordem de **ordem** (sem `ordem` ao fim, por
  **titulo**), aberto por régua forte e com `id` âncora: **titulo** (`<h2>`, `display-2`),
  **resumo** em cinza, **corpo** em parágrafos, **imagem** em p&b se houver (`alt=""`, porque o
  título está logo acima).
- Logo abaixo, os **projetos** daquela linha (`groupProjectsByLine`): linha pequena
  "**periodo.inicio**–**periodo.fim** · **status**", **titulo**, **descricao** em parágrafos e
  "**financiador** · **colaboradores[]**". Linha sem projetos não tem lista.
- "Outros projetos" no fim: projetos sem **linha_relacionada** ou ligados a linha não publicada
  (RN-01 — o rascunho nunca é revelado). Some se vazio.

### 6.4 Ensino `/ensino` (RF-23)

- `<h1>` "Disciplinas". Rubricas "Atuais" antes de "Anteriores", **sempre presentes**; grupo vazio
  mostra "Nenhuma disciplina neste semestre." ou "Nenhuma disciplina anterior.".
- Atual: linha pequena "**codigo** · **semestre**", **nome** em `display-2` (link), primeiro
  parágrafo da **descricao** e "Última aula · N. título ↗ · data".
- Anterior: linha pequena "**codigo** · **semestre**", **nome** em `titulo-item` e `›`; a linha
  inteira é o link.

### 6.5 Disciplina `/ensino/[slug]` (RF-24, RF-37, F-06, F-13)

- Trilha "Ensino / **codigo** (ou **nome**)"; `PageHeader` com **nome** e meta "**codigo** ·
  **semestre** · Atual/Anterior"; à direita **descricao** e **ementa**.
- As seções viram **abas** (melhoria progressiva: sem JS ficam empilhadas com os títulos; o `#id`
  da URL escolhe a aba): Aulas, Scripts da disciplina, Listas de exercícios, Materiais
  complementares, Bibliografia, Links — só as presentes, **sem contagem** no rótulo.
- **Aulas**, na ordem do professor (RN-04): linha pequena "**numero** · **data**" (o leitor de
  tela ouve "Aula N"), **titulo** ↗, **descricao** e os **scripts** cuja **aula** casa (5.4). Sem
  aulas: "Nenhuma aula publicada ainda." (F-06).
- **Scripts da disciplina**: os sem **aula** ou com aula inexistente (F-13).
- **Listas**: **titulo** ↗ e "Entrega dd/mm/aaaa"; **Materiais**: linha pequena com o **tipo**
  ("Slides", "Notas", "Complementar") acima do **titulo** ↗; **Bibliografia**; **Links**.
- Toda seção exceto Aulas some quando vazia.

### 6.6 Publicações `/publicacoes` (RF-25, RN-02, F-05)

- `<h1>` "Publicações". Um bloco por **ano**, decrescente, com o ano em `display-2` (`<h2>`, link
  para a âncora do ano), sem contagem.
- Item: **titulo** (`titulo-item`); numa linha, **autores** com o nome do professor em `--tinta` e
  `<strong>` (casamento por `siteConfig.author.citationName`), **veiculo** em itálico e os links
  **DOI ↗**, **arXiv ↗**, **PDF ↗** que estiverem preenchidos (F-05).
- **Não aparecem** hoje: **tipo** (o texto `pt.publications.type` e o teste de paridade ficam, por
  decisão do stakeholder), **destaque**, **resumo** e **palavras_chave[]**.
- A partir de `lg`, sem movimento reduzido, os anos viram uma **sanfona guiada pela rolagem**
  (seção 7). Nos outros casos todos os anos ficam abertos.

### 6.7 404 (RF-27)

`PageHeader` "Página não encontrada" com meta "Erro 404", o texto "O endereço pode ter mudado de
semestre. Materiais de disciplinas anteriores continuam na página de Ensino." e a lista "Todas as
páginas" com as cinco rotas de `NAV_ITEMS`, "Início" primeiro. Gerado como `404.html` para o
`not_found_handling = "404-page"` do `wrangler.toml`.

---

## 7. Movimento (RF-32)

- **Entrada da página (CSS):** a régua forte do cabeçalho se desenha da esquerda para a direita
  (`scaleX`, 500 ms) enquanto o `<h1>` sobe 8 px e aparece (400 ms, 100 ms de atraso). O estado
  inicial oculto só existe dentro de `prefers-reduced-motion: no-preference`, para que falha de CSS
  nunca esconda texto.
- **Transição entre páginas (View Transitions entre documentos, só CSS):**
  `@view-transition { navigation: auto }`. O cartão fica parado, o nome (`vt-nome`) e o menu
  (`vt-menu`) migram entre a Home e o cabeçalho, e o conteúdo troca com um fade curto (sai em
  120 ms; entra em 220 ms, subindo 6 px). Um script inline no `<head>` marca `html[data-vt]` quando
  a página chega por transição, e a animação de entrada não repete. **No máximo um `vt-nome` e um
  `vt-menu` por página** — nome duplicado aborta a transição em silêncio, e
  `tests/dist/site-gerado.test.ts` confere. Navegador sem suporte navega normalmente.
- **Sanfona de Publicações (GSAP + ScrollTrigger):** a partir de `lg`, o bloco fica fixo e a
  rolagem percorre os itens do ano aberto; ao fim, o ano fecha e o seguinte abre. O GSAP é baixado
  por `import()` **só** quando `(min-width: 64rem) and (prefers-reduced-motion: no-preference)`
  vale. Ano fechado recebe `inert`: sai do Tab e do leitor de tela.
- **Resposta a ação:** sublinhado no hover, troca de aba e menu do celular (150 ms), "Copiado".
- `@media (prefers-reduced-motion: reduce)`: animações, transições e `::view-transition-*`
  zeradas; o clique no trilho da barra de rolagem vai direto, sem rolagem suave.

Foco visível em tudo: `outline: 2px solid var(--tinta); outline-offset: 3px`. A exceção é o
`<main tabindex="-1">`, que recebe o foco do "Pular para o conteúdo" sem contorno.

---

## 8. O que mudou em relação ao mock, e por quê

| No mock                                                                        | Aqui                                                  | Motivo                                                                   |
| ------------------------------------------------------------------------------ | ----------------------------------------------------- | ------------------------------------------------------------------------ |
| Frase de destaque como `<h1>` da Home                                          | `<h1>` = **nome**                                     | Sem campo no schema (Decisão 2); RF-20 pede o nome                       |
| Numerais 01/02/03 nas células da Home e nas disciplinas atuais                 | Contagem real na Home; nenhum numeral nas disciplinas | Numeral só em sequência ou contagem (seção 1)                            |
| Carga horária, créditos, horário, próxima aula, avaliação, dúvidas/atendimento | Removidos                                             | Sem campo no schema (Decisão 2)                                          |
| "Equação central" e fórmula na linha de pesquisa                               | Removidas                                             | Sem campo; LaTeX é RF-33 COULD, fora desta fase                          |
| Sala e horário de atendimento em Sobre                                         | Removidos                                             | Sem campo (Decisão 2)                                                    |
| Página CV, item "CV" na navegação e na 404, "Baixar CV"                        | Removidos; **cv_url** vira link em Sobre              | Fora do §6.1 (Decisão 3)                                                 |
| Botão "Texto completo" da linha de pesquisa                                    | **corpo** inline na página Pesquisa                   | Rota fora do §6.1 (Decisão 3)                                            |
| Chips de filtro em Publicações                                                 | Removidos                                             | §6.3: v1.2 (Decisão 3)                                                   |
| Atalhos de disciplinas no menu do celular                                      | Removidos                                             | Duplicam a página Ensino; manter o menu só com navegação                 |
| "Baixar .py"                                                                   | "Abrir arquivo ↗"                                     | **url** do script é URL livre (D-07), não necessariamente um `.py`       |
| "PDF ↗" nas aulas e listas                                                     | "Abrir ↗"                                             | **url** é agnóstica ao hospedeiro (D-07) — pode ser vídeo, pasta, página |
| Caminho digitado na 404                                                        | Não exibido                                           | Exigiria JS                                                              |
| Corpo 13,5 px, rótulos 10 px, canvas 1920 px                                   | Corpo 16 px, rótulos 12 px, escala fluida 360–1440    | Decisão 4; RNF-15                                                        |
| JetBrains Mono em rótulos, marcadores de imagem e fórmulas                     | Monoespaçada só em código, e do sistema               | Decisão 4                                                                |
| Archivo pelo Google Fonts                                                      | Archivo auto-hospedada; texto na Helvetica do sistema | Sem requisição a terceiro; peso fino garantido fora do macOS             |
| Placeholders listrados "retrato do professor"                                  | Somem quando não há imagem                            | F-08                                                                     |
| Marcador "ÍNDICE" e "/CAMINHOS" na Home                                        | Removidos                                             | Decoração sem informação                                                 |
| Rótulos com barra ("/ATUAIS", "/AULAS")                                        | Rubricas sem barra ("Atuais", "Aulas")                | A barra imita caminho de URL sem ser um                                  |

---

## 9. Candidatos para depois (não são desta fase)

Campos que o mock mostrou úteis e que só voltam com decisão de schema (Q-09 / v1.1): carga
horária e créditos, horário e local da disciplina, critérios de avaliação, horário de atendimento
do professor, fórmula em LaTeX (RF-33), histórico profissional e orientações para uma página CV.
