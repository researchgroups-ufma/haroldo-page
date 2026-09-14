# Identidade visual do site público

Especificação que a fase 3 implementa. Traduz o mock `ref/Site UFMA Física v2.dc.html` (resposta
da **Q-04**) para o projeto real: o schema de `src/content.config.ts`, as rotas do §6.1 e as
restrições do §8.2 e da RNF-02. As decisões de recorte estão em
[`docs/sabatinas/CHANGELOG_sabatina_identidade-visual.md`](sabatinas/CHANGELOG_sabatina_identidade-visual.md).

> **`ref/` não é versionada** (decisão do stakeholder, 2026-09-14: contém capturas de portfólios de
> terceiros e o repositório é público). Ela existe só na máquina do desenvolvedor; este documento
> tem de bastar sozinho, e nenhum plano, teste ou revisão pode depender de abrir `ref/`.

> **Precedência.** Onde este documento e o mock divergem, vale este documento — cada divergência
> está listada na seção 8 com o motivo. Onde este documento e o PRD divergem, vale o PRD e a
> divergência é reportada.

Criado em 2026-09-14.

---

## 1. Princípio

O site é um **caderno de física impresso em papel cinza**: tinta quase preta, nenhuma cor, réguas
de 1 px separando colunas como as de um livro de registro, e **números finos e grandes onde o
conteúdo é de fato uma sequência ou uma contagem** — o número da aula, a ordem das linhas de
pesquisa, o ano das publicações, a quantidade de itens. Esse numeral fino é a única ousadia do
sistema; todo o resto é quieto.

Três regras que decidem os casos não previstos:

1. **Estrutura é informação.** Régua, rótulo, numeral e caixa só existem se disserem algo sobre o
   conteúdo. Numeral decorativo em algo que não é sequência nem contagem não entra.
2. **Campo vazio não deixa rastro** (RF-21, F-05, F-08). Bloco sem dado some inteiro, com o rótulo;
   a grade se recompõe em vez de reservar espaço.
3. **Zero JS por padrão** (RNF-02). Só o botão de copiar script e o menu do celular usam script,
   e os dois funcionam como melhoria progressiva.

---

## 2. Cor

| Token          | Hex       | Uso                                                                                    |
| -------------- | --------- | -------------------------------------------------------------------------------------- |
| `--papel`      | `#EFEDEA` | Fundo de todas as páginas                                                              |
| `--bloco`      | `#F7F6F4` | Fundo de destaque (publicação em destaque, painel de script) e _hover_ de linha/célula |
| `--tinta`      | `#111112` | Texto principal, régua forte, botão sólido                                             |
| `--secundario` | `#5A5754` | Texto secundário, metadados, rótulos                                                   |
| `--regua`      | `#D6D3CF` | Régua fina entre colunas e linhas; borda de tag neutra                                 |
| `--tracejado`  | `#9A9691` | **Só** borda tracejada (status "concluído", estado vazio) — nunca texto                |

Contraste calculado pela fórmula de luminância relativa da WCAG 2.1 em 2026-09-14: `--tinta`
sobre `--papel` 16,15:1 e sobre `--bloco` 17,47:1; `--secundario` sobre `--papel` 6,14:1 e sobre
`--bloco` 6,65:1; o cinza de comentário do código (`#6E6A66`) 4,59:1 sobre `--papel` e 4,96:1 sobre
`--bloco`. Todos acima de 4,5:1 (RNF-15). `--tracejado` sobre `--papel` dá 2,52:1 — abaixo de 3:1
— e por isso nunca carrega informação sozinho: o status "concluído" é dito pelo texto da tag, a
borda é redundante.

Sem modo escuro (RF-36 WONT).

---

## 3. Tipografia

**Preferência do stakeholder:** Helvetica e grotescas sem serifa como ela; **nada de monoespaçada
fora de código** (Decisão 4).

| Papel                                              | Família                                                     | Pesos    | Origem                                                                       |
| -------------------------------------------------- | ----------------------------------------------------------- | -------- | ---------------------------------------------------------------------------- |
| Texto (corpo, títulos de item, navegação, rótulos) | `"Helvetica Neue", Helvetica, Arial, sans-serif`            | 400      | Sistema — zero download                                                      |
| Display (título da página, numerais, anos)         | `"Archivo", "Helvetica Neue", Helvetica, Arial, sans-serif` | 200, 300 | **Auto-hospedada** via `@fontsource/archivo`, só latin, `font-display: swap` |
| Código (bloco dos scripts, RF-37)                  | `ui-monospace, "SF Mono", Menlo, Consolas, monospace`       | 400      | Sistema — zero download                                                      |

Por que duas famílias: os numerais finos (peso 200) são a assinatura do sistema, e a Helvetica
Neue só tem pesos leves no macOS — no Windows e no Android ela cai em Arial, que não tem peso 200.
A Archivo é uma grotesca livre com pesos finos que preserva o desenho em qualquer sistema. O texto
corrido fica na Helvetica do sistema, sem custo de download. Nada vem do Google Fonts: a fonte é
servida pelo próprio Worker (RNF-01, RNF-03, e nenhuma requisição a terceiro).

### Escala (fluida entre 360 e 1440 px)

| Token         | Tamanho                                       | Linha | Espaçamento        | Família / peso | Uso                                                           |
| ------------- | --------------------------------------------- | ----- | ------------------ | -------------- | ------------------------------------------------------------- |
| `display-1`   | `clamp(2.625rem, 1.9rem + 3.2vw, 5rem)`       | 1.0   | −0.035em           | Archivo 300    | `<h1>` de página                                              |
| `display-2`   | `clamp(1.875rem, 1.5rem + 1.7vw, 2.875rem)`   | 1.05  | −0.03em            | Archivo 300    | `<h2>` de linha de pesquisa, título de publicação em destaque |
| `numeral`     | `clamp(3.5rem, 2.8rem + 3vw, 5.5rem)`         | 0.8   | −0.05em            | Archivo 200    | Ordem da linha, contagens da Home                             |
| `numeral-sm`  | `clamp(2.25rem, 2rem + 1vw, 2.75rem)`         | 1.0   | −0.04em            | Archivo 200    | Número da aula                                                |
| `ano`         | `clamp(3rem, 2.4rem + 2.6vw, 4.75rem)`        | 0.85  | −0.04em            | Archivo 200    | Ano em Publicações                                            |
| `titulo-item` | `clamp(1.125rem, 1.05rem + 0.35vw, 1.375rem)` | 1.3   | −0.015em           | Helvetica 400  | Título de aula, projeto, disciplina anterior, publicação      |
| `corpo`       | `1rem`                                        | 1.7   | 0                  | Helvetica 400  | Texto corrido; medida máxima `38rem` (~70 caracteres)         |
| `pequeno`     | `0.875rem`                                    | 1.6   | 0                  | Helvetica 400  | Descrições de item, autores, veículo                          |
| `rotulo`      | `0.75rem`                                     | 1.2   | 0.14em, caixa alta | Helvetica 400  | Rubrica de seção e tag — **nunca** abaixo de 12 px            |

Caixa alta fica restrita a duas funções: **rubrica de seção** (`Formação acadêmica`, `Aulas`) e
**tag** (`Artigo`, `Em andamento`). Metadado corrido (data, veículo, financiador) vai em caixa
normal.

---

## 4. Grade e espaçamento

- **Margem lateral:** `clamp(1.25rem, 4vw, 3.5rem)` (20 px no celular, 56 px a partir de 1400 px).
- **Largura:** as réguas horizontais correm de ponta a ponta da janela; o conteúdo fica num
  contêiner de no máximo `90rem` (1440 px) centralizado.
- **Colunas:** grade de 12 colunas a partir de `64rem` (1024 px); entre `40rem` e `64rem`, 6
  colunas; abaixo de `40rem` (640 px), coluna única. As composições "1.15fr / 1fr" do mock viram
  `7 / 5` colunas.
- **Réguas:** `1px solid var(--regua)` entre células e linhas; `1px solid var(--tinta)` só para
  **abrir** um bloco (topo de lista, cabeçalho de página). Sem sombra, sem raio — exceto o botão
  pílula e o marcador circular, que são os dois únicos elementos arredondados do sistema.
- **Ritmo vertical:** múltiplos de `0.5rem`; seções separadas por `clamp(2.5rem, 2rem + 2vw, 4rem)`.
- **Faixa verificada:** 360 a 1440 px, sem rolagem horizontal (RF-26). Tabelas não existem; tudo é
  grade que empilha.

---

## 5. Componentes

### 5.1 Cabeçalho (não está no mock — desenhado aqui)

O mock importa `HeaderDesk2`/`HeaderMob2` de fora do arquivo. Desenho derivado de `ref/1.jpg` e
`ref/5.jpg`:

```text
≥ 64rem
┌──────────────────────────────────────────────────────────────────────────────┐
│ Haroldo C. D. Lima Junior          Início  Sobre  Pesquisa  Ensino  Publicações │
│ Departamento de Física · UFMA              ‾‾‾‾‾‾                                │
├──────────────────────────────────────────────────────────────────────────────┤  ← régua fina

< 64rem
┌────────────────────────────────────┐
│ Haroldo C. D. Lima Junior    Menu  │
├────────────────────────────────────┤
│ Início                           › │  ← aberto: lista com réguas,
│ Sobre                            › │    como "Todas as páginas" da 404
│ ...                                │
```

- Nome em `titulo-item`, linha abaixo em `pequeno`/`--secundario`; o conjunto é link para `/`.
- Navegação em Helvetica 15 px; página ativa com sublinhado de 1 px `--tinta` deslocado 6 px
  (`ref/1.jpg`) e `aria-current="page"`. Página de disciplina marca "Ensino" como ativa.
- Celular: botão "Menu" (texto, alvo ≥ 44 px) com `aria-expanded`/`aria-controls`. Sem JS, a lista
  aparece aberta abaixo do nome (melhoria progressiva). Os "atalhos" de disciplinas do mock e o
  "Baixar CV" saem (Decisão 3).
- Reservar o espaço à direita para o seletor de idioma da **fase 4** (RF-29) sem implementá-lo.
- Link "Pular para o conteúdo" como primeiro elemento focável.

### 5.2 Rodapé (não está no mock — desenhado aqui)

Régua forte no topo; quatro células separadas por régua fina, empilhando no celular:
**identificação** (nome, departamento, instituição) · **contato** (`email`, sublinhado) · **perfis
acadêmicos** (links preenchidos de `perfil.links`, com ↗) · **site** (navegação curta e o ano
corrente). Célula sem dado some.

### 5.3 Botão pílula

Como no mock: altura ≥ 48 px, borda 1 px `--tinta`, texto à esquerda, disco `--tinta` de 32 px
com `›` à direita. Variante sólida (fundo `--tinta`, disco `--papel`) só para a ação principal da 404. Hover: fundo `--bloco`. Texto diz o destino: "Ver pesquisa", "Voltar ao início".

### 5.4 Tag

`rotulo` com `padding: 0.4rem 0.7rem`. Três variantes: **forte** (borda `--tinta`), **neutra**
(borda `--regua`, texto `--secundario`), **sólida** (fundo `--tinta`, texto `--papel`, só para
"Destaque"). Status de projeto: "Em andamento" = forte com marcador circular de 6 px; "Concluído"
= neutra com borda tracejada.

### 5.5 Linha de lista

Grade com régua no topo; a primeira linha de cada lista abre com régua forte. Toda a linha é o alvo
do link quando há um único destino; hover troca o fundo para `--bloco`. Link externo termina em
`↗` e leva `target="_blank" rel="noopener noreferrer"` com texto oculto "(abre em nova aba)"
(§8.3).

### 5.6 Painel de script (RF-37)

Fundo `--bloco`, borda `--regua`. Esquerda: rubrica "Script · Python" (linguagem legível), título
em `titulo-item`, `descricao`, botões **Copiar código** (sólido; vira "Copiado" por 2 s, com
`aria-live="polite"`) e **Abrir arquivo ↗** (só se `url`). Direita (abaixo, no celular): bloco
`<pre>` em monoespaçada do sistema, 14 px, `overflow-x: auto` **dentro** do bloco, com destaque de
sintaxe gerado **no build** pelo Shiki do Astro num tema monocromático — palavras-chave em
`--secundario`, comentários e strings em `#6E6A66` (4,59:1 sobre `--papel`), resto em `--tinta`.

---

## 6. Rotas

Mapeamento de cada tela do mock para os campos reais. **Negrito** = campo do schema. O que o mock
tinha e saiu está na seção 8.

### 6.1 Home `/` (RF-20)

```text
┌ cabeçalho ───────────────────────────────────────────────────────────────┐
│ Haroldo Cilas Duarte            │ **cargo** — **departamento**            │
│ Lima Junior          (display-1)│ **instituicao**                         │
│                                 │ **resumo_home**                         │
│                                 │ ( Ver pesquisa  ● )                     │
├─────────────── régua forte ──────────────────────────────────────────────┤
│ 02              │ 02             │ 06              │ [ **foto** p&b ]    │
│ linhas de       │ disciplinas    │ publicações     │                     │
│ pesquisa        │ neste semestre │                 │                     │
│ Pesquisa      › │ Ensino       › │ Publicações   › │                     │
└──────────────────────────────────────────────────────────────────────────┘
```

- `<h1>` = **nome**. A frase de destaque do mock sai (Decisão 2).
- As três células são links; o numeral é a **contagem real** de itens publicados (`publicado:
true`), com dois dígitos. Rótulo abaixo diz o que se conta. Contagem zero mostra `00` e o texto
  "nenhuma publicada ainda" — a célula não some, porque é caminho de navegação (RF-20).
- Sem **foto**, a grade vira três colunas (F-08).

### 6.2 Sobre `/sobre` (RF-21)

- Topo: rubrica "Sobre", `<h1>` "Biografia e formação"; à direita **bio**, dividida em parágrafos
  por linha em branco.
- **formacao[]**: linhas de 3 colunas — **ano** · **grau** — **curso** · **instituicao**; no
  celular empilham.
- Faixa de quatro células: **areas[]** (tags neutras em caixa normal) · contato (**email**) ·
  perfis acadêmicos (**links.\***, rótulos "Currículo Lattes", "ORCID", "Google Scholar", "arXiv",
  "ResearchGate", "GitHub", "Página institucional", e **cv_url** como "Currículo em PDF") ·
  **foto**.
- Cada bloco sem dado some inteiro, com a rubrica (RF-21).

### 6.3 Pesquisa `/pesquisa` (RF-22, RF-13)

- Topo: rubrica com contagens derivadas ("2 linhas · 2 projetos"), `<h1>` "Linhas e projetos".
- Uma linha de grade por **linhas-pesquisa** publicada, ordenada por **ordem** (sem `ordem` vão
  ao fim, por **titulo**): numeral da posição (01, 02…) · `<h2>` **titulo** e tag "N projetos em
  andamento" (derivada de **projetos.linha_relacionada** + **status**; some se zero) · **resumo**,
  **corpo** em parágrafos, **imagem** se houver. Cada linha tem `id` âncora. O botão "Texto
  completo" sai (Decisão 3).
- Rubrica "Projetos" e grade `repeat(auto-fill, minmax(17rem, 1fr))`: tag de **status** ·
  **titulo** · **periodo.inicio**–**periodo.fim** e **financiador** entre réguas · **descricao** ·
  **colaboradores[]** · link para a âncora da **linha_relacionada**. Concluídos depois dos em
  andamento. Sem projetos publicados, a seção some.

### 6.4 Ensino `/ensino` (RF-23)

- Topo: rubrica "Ensino", `<h1>` "Disciplinas".
- Grupo "Atuais" (**status** = `atual`) antes de "Anteriores" (RF-23). Grupo vazio mostra
  estado vazio tracejado ("Nenhuma disciplina neste semestre.") em vez de sumir, para os dois
  grupos rotulados existirem sempre.
- Atuais: células de 2 colunas — **codigo** e **semestre** em `pequeno` · **nome** em `display-2`
  · **descricao** · rodapé com contagens derivadas (N aulas, N listas, N scripts — só as não nulas)
  e "Abrir ›". **Sem numeral** (disciplinas atuais não são sequência).
- Anteriores: linhas **codigo** · **nome** · **descricao** · **semestre** ›, ordenadas por
  semestre decrescente.

### 6.5 Disciplina `/ensino/[slug]` (RF-24, RF-37, F-06, F-13)

- Topo: trilha "Ensino / **codigo** (ou **nome**)", `<h1>` **nome**, tags **codigo** (forte),
  **semestre** e "Atual"/"Anterior" (neutras); à direita **descricao** e "Nesta página" — âncoras
  só para as seções presentes, com contagem.
- **Ementa** (`corpo`, parágrafos).
- **Aulas**, na ordem do professor (RN-04): numeral-sm **numero** · **titulo** · **descricao** ·
  **data** em `dd/mm/aaaa` (§8.3) · "Abrir ↗". Logo abaixo de cada aula, os **scripts** cujo
  **aula** casa com o **numero** (painel 5.6). Sem aulas: "Nenhuma aula publicada ainda." (F-06).
- **Scripts da disciplina**: os que não têm **aula** ou apontam para aula inexistente (F-13).
  Seção some se vazia.
- **Listas de exercícios**: **titulo** · "Entrega dd/mm/aaaa" (se **data_entrega**) · "Abrir ↗".
- **Materiais complementares**: células com rubrica do **tipo** ("Slides", "Notas",
  "Complementar") · **titulo** · **descricao** · "Abrir ↗".
- **Bibliografia**: lista ordenada, **referencia** e "Acessar ↗" se **url**.
- **Links**: tags-link com **titulo** ↗.
- Toda seção exceto Aulas some quando vazia.

### 6.6 Publicações `/publicacoes` (RF-25, RN-02, F-05)

- Topo: rubrica com a contagem ("6 itens"), `<h1>` "Publicações" — não "Artigos e preprints"
  como no mock, porque o enum **tipo** tem também capítulo, livro, anais, tese e outro. Sem
  filtros (Decisão 3).
- Um bloco por **ano**, decrescente: `ano` fino na coluna esquerda (no topo, no celular); itens à
  direita separados por régua.
- Item: tags ("Destaque" sólida se **destaque**; **tipo** legível) · **titulo** (`display-2` se
  destaque, com fundo `--bloco`; senão `titulo-item`) · **autores** separados por `; `, com o nome
  do professor em `--tinta` e os demais em `--secundario` (convenção acadêmica; casamento por
  `siteConfig.author.citationName`) · **veiculo** em itálico · links **DOI ↗**
  (`https://doi.org/`), **arXiv ↗** (`https://arxiv.org/abs/`), **PDF ↗** — só os preenchidos
  (F-05) · `<details>` "Resumo e palavras-chave" com **resumo** e **palavras_chave[]**, fechado
  por padrão, só se houver ao menos um dos dois.
- Ordem dentro do ano (RN-02, "ordem de cadastro invertida"): **o schema não tem data de
  cadastro** — o plano da rota tem de decidir a regra e registrá-la.

### 6.7 404 (RF-27)

Como o mock: rubrica "Erro 404", `<h1>` "Página não encontrada", texto "O endereço pode ter mudado
de semestre. Materiais de disciplinas anteriores continuam na página de Ensino.", pílula sólida
"Voltar ao início" e lista "Todas as páginas" com as cinco rotas (sem CV). O caminho digitado **não**
é exibido (exigiria JS). Gerado como `404.html` para o `not_found_handling = "404-page"` do
`wrangler.toml`.

---

## 7. Movimento (RF-32)

**Um único momento orquestrado, só em CSS, sem GSAP nem `motion`** (RNF-02: a identidade não
precisa de biblioteca). Ao carregar a página, a régua forte sob o cabeçalho da página se desenha
da esquerda para a direita (`transform: scaleX`, 500 ms) enquanto o `<h1>` sobe 8 px e aparece
(400 ms, 100 ms de atraso). Nada mais anima sozinho.

Movimento que responde a ação: troca de fundo no hover (120 ms), abertura do `<details>` e do menu
do celular (conteúdo aparece em 150 ms), confirmação "Copiado".

`@media (prefers-reduced-motion: reduce)`: todas as transições e animações zeradas; o conteúdo
aparece no estado final. **Nenhuma animação começa com o conteúdo invisível sem CSS** — o estado
inicial oculto só se aplica dentro de `@media (prefers-reduced-motion: no-preference)`, para que
falha de CSS nunca esconda texto (§8.2).

Foco visível em tudo: `outline: 2px solid var(--tinta); outline-offset: 3px`.

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
