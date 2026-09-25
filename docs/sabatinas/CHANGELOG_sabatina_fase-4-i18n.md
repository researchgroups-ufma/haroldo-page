# Sabatina — Fase 4: Internacionalização

Sabatina de 2026-09-24, antes do `/fatiar` da fase 4. Levantamento sobre `PRD.md` (RF-14,
RF-27–RF-30, RN-06/07/09, F-07, §7.3, §8.3, §12 fase 4, M-07), `src/content.config.ts` (grupos
`en` do plano 018), `tina/config.ts`, `src/i18n/pt.ts`, `src/pages/**` e `plans/README.md` (seção
"Entre a fase 3 e a 4").

Já decidido antes desta sabatina e **não** reaberto aqui: PT canônico na raiz e EN em `/en`
(RN-09, §8.3); fallback por campo (RN-06); campos factuais não traduzem (RN-07); `/ensino` →
`/en/teaching` (RF-29, o que fixa slugs de rota traduzidos); sem detecção automática de idioma
(§8.3); datas no formato do locale da rota (§8.3).

---

## Decisão 1 — Slug da disciplina em `/en` vem de `en.nome` — **SUBSTITUÍDA pela Decisão 3**

**Data:** 2026-09-24
**Questão:** as rotas fixas já são traduzidas (RF-29), mas o slug da disciplina vem do nome do
arquivo em PT (RN-08, `{semestre}-{slug(nome)}`). Em `/en`, a disciplina usa o mesmo slug PT ou um
slug derivado de `en.nome`?
**Decisão:** **slug derivado de `en.nome`** quando ele estiver preenchido
(`/en/teaching/2026-2-classical-mechanics`); sem `en.nome`, o slug PT (fallback RN-06 aplicado
também ao slug).
**Justificativa:** URL inteiramente em inglês na árvore `/en`. Alternativa descartada: manter o
slug PT em `/en` — estável e sem mapa, mas deixa palavra em português na URL inglesa. Custos
aceitos, e que o fatiamento tem de cobrir: (a) o seletor de idioma e o `hreflang` precisam de um
mapa PT↔EN por disciplina, não de troca de prefixo; (b) o slug EN muda quando o professor traduz
o nome, e o link antigo deixa de existir (tratamento na Decisão 2); (c) duas disciplinas podem
colidir no slug EN.
**Impacto no PRD:** RF-28 e RF-29 (critério ganha o caso da disciplina com slug traduzido); §7.3
(`disciplinas`: nota sobre o slug EN derivado); RN-08 (vale para o arquivo e o slug PT).

## Decisão 2 — O endereço EN com slug PT redireciona para o slug EN — **SUBSTITUÍDA pela Decisão 3**

**Data:** 2026-09-24
**Questão:** com a Decisão 1, quando o professor preenche `en.nome`, `/en/teaching/<slug-pt>` deixa
de existir. O que recebe quem abre o endereço antigo?
**Decisão:** **redirecionamento.** Para toda disciplina com slug EN diferente do slug PT, o build
gera também `/en/teaching/<slug-pt>` como página de redirecionamento para `/en/teaching/<slug-en>`
(site estático: meta refresh + `<link rel="canonical">`). Essa página fica **fora do sitemap** e
não recebe `hreflang`.
**Justificativa:** link compartilhado com aluno não quebra quando o nome é traduzido. Alternativa
descartada: aceitar o 404 — mais simples e com poucos links externos hoje (robots `Disallow`, Q-05
aberta), mas o custo recai no visitante. Limite aceito: só o slug PT redireciona; se `en.nome`
mudar uma segunda vez, o slug EN intermediário não é preservado (o build não tem memória de
slugs anteriores).
**Impacto no PRD:** RF-28 (critério do redirecionamento); RF-30 (sitemap exclui as páginas de
redirecionamento).

## Decisão 3 — A disciplina usa em `/en` o mesmo slug PT (revisa as Decisões 1 e 2)

**Data:** 2026-09-24
**Questão:** ao discutir a colisão de slug EN que a Decisão 1 abria (duas disciplinas com o mesmo
`en.nome`, ou um slug EN igual ao slug PT de outra), o stakeholder pediu a forma mais simples de
evitá-la, sugerindo um sufixo `-en` no slug PT.
**Decisão:** **mesmo slug PT** em `/en`: `/en/teaching/2026-2-mecanica-classica`. As Decisões 1 e
2 ficam substituídas; não há slug derivado de `en.nome` nem página de redirecionamento.
**Justificativa:** o slug PT já é único, porque vem do nome do arquivo (RN-08). Por isso, qualquer
slug EN derivado dele é livre de colisão, e o link não muda quando o professor traduz o nome.
Alternativas descartadas: (a) sufixo `-en` (`…-mecanica-classica-en`), também livre de colisão,
mas redundante com o prefixo `/en/`, e o seletor precisaria de uma regra a mais; (b) manter o slug
de `en.nome` (Decisão 1), que exigiria mapa PT↔EN, redirecionamento (Decisão 2) e uma regra de
colisão. Custo aceito: uma palavra em português na URL da página em inglês. O seletor de idioma e
o `hreflang` só trocam o prefixo, com o segmento traduzido da rota fixa (`ensino` ↔ `teaching`).
**Impacto no PRD:** RF-29 (o critério ganha a página de disciplina: `/ensino/<slug>` ↔
`/en/teaching/<slug>`); §7.3 (`disciplinas`: o slug é o mesmo nos dois idiomas).

## Decisão 4 — Marcação de idioma: um aviso por página, não um badge por item

**Data:** 2026-09-24
**Questão:** a F-07 prevê um badge "in Portuguese" por item sem versão EN, mas o fallback é por
campo (RN-06): uma disciplina pode ter `en.nome` e não ter `en.ementa`. Onde fica a marcação:
por bloco de texto, por item ou por página?
**Decisão:** **um aviso por página.** Se qualquer texto de conteúdo exibido numa rota `/en` caiu no
português, a página mostra um único aviso discreto (texto do dicionário `en`, ex.: "Some content
on this page is only available in Portuguese"). Independentemente do aviso, **todo elemento cujo
texto caiu no PT recebe `lang="pt-BR"`** (§8.3: `lang` correto, leitor de tela pronuncia certo).
**Justificativa:** menos ruído visual. Numa página quase toda sem tradução, que é o caso mais
provável no início (RN-09: o inglês é opcional), badges por bloco ou por item se repetiriam em
toda a página. Alternativas descartadas: badge por bloco de texto (preciso, mas repetitivo) e
badge por item (não diz qual parte está em PT numa tradução parcial). Custo aceito: o aviso não
diz _qual_ parte está em português; o `lang` por elemento mantém essa informação para
tecnologia assistiva.
**Impacto no PRD:** F-07 (comportamento e mensagem: aviso por página, não badge por item); RF-28
(critério: "com marcação discreta de idioma" passa a ser o aviso da página + `lang="pt-BR"` no
elemento).

## Decisão 5 — Seletor de idioma: um link só, para o outro idioma

**Data:** 2026-09-24
**Questão:** forma do seletor (RF-29) no lugar reservado do `SiteHeader.astro`: link único para o
idioma de destino ou par "PT · EN" com o atual marcado?
**Decisão:** **link único** com o idioma de destino: "EN" nas páginas PT, "PT" nas páginas EN.
O link leva `hreflang` e `lang` do destino, e um nome acessível por extenso vindo do dicionário
("English version" / "Versão em português" — texto final no dicionário). Fica visível também no
celular, fora do menu recolhível. Aponta para a mesma página no outro idioma (RF-29, Decisão 3).
**Justificativa:** um elemento, cabe no cabeçalho do celular sem ir para dentro do menu, e não há
estado ativo a desenhar. Alternativa descartada: o par "PT · EN", que mostra o idioma atual mas
ocupa mais espaço e, no celular, iria para dentro do menu (dois toques para trocar).
**Impacto no PRD:** RF-29 (forma do seletor no critério); `docs/identidade-visual.md` (o seletor
no cabeçalho).

## Decisão 6 — Rotas EN: página fina + componente de view por rota

**Data:** 2026-09-24
**Questão:** os segmentos de rota são traduzidos (`/sobre` ↔ `/en/about`), então não há um arquivo
por rota com parâmetro de idioma "de graça". Como organizar as rotas EN sem duplicar as páginas
(137 a 260 linhas hoje)?
**Decisão:** **o corpo de cada página vira um componente de view que recebe `lang`**; cada rota
tem dois arquivos finos em `src/pages/` e `src/pages/en/` (ex.: `sobre.astro` e `en/about.astro`),
que só chamam a view. A disciplina segue o mesmo padrão com `getStaticPaths` nos dois arquivos
(slug igual, Decisão 3). O mapa de segmentos PT↔EN fica num único módulo em `src/lib/`, usado pelo
menu, pelo seletor e pelo `hreflang`.
**Justificativa:** sem duplicação de marcação, e as páginas ficam abaixo do alvo de 150 linhas do
§10.4 — quita a dívida "páginas acima de 150 linhas" herdada do polimento (`sobre`, `pesquisa`,
`publicacoes`, `ensino/[slug]`). Alternativas descartadas: rota `[...lang]` com mapa (menos
arquivos, mas `getStaticPaths` até nas páginas fixas e estrutura menos óbvia) e cópia das páginas
em `src/pages/en` (duas cópias a sincronizar).
**Impacto no PRD:** §7.5 (estrutura de diretórios: pasta das views e `src/pages/en/`).

## Decisão 7 — A tradução de item de lista vive dentro do próprio item

**Data:** 2026-09-24
**Questão:** `en.formacao[]` e `en.areas[]` (plano 018) são listas paralelas às listas PT,
alinhadas por posição. Reordenar ou apagar um item em PT põe a tradução de outro item no lugar
errado, sem erro. O `content.config.ts` deixou o realinhamento "para a fase 4".
**Decisão:** **cada item carrega a própria tradução**: `formacao[i].en.{grau, curso}`,
`atuacao[i].en.{…}` (campos na Decisão 8) e `areas[]` passa de lista de string a lista de objetos
`{ nome, en? }`. Saem `perfil.en.formacao` e `perfil.en.areas`. Mudam juntos o schema Zod, o
`tina/config.ts` e o teste de paridade.
**Justificativa:** reordenar no painel leva a tradução junto, e o desalinhamento deixa de ser
possível por construção. Nenhum perfil tem dados `en` hoje (só uma linha de pesquisa tem grupo
`en`), então a mudança não exige migração de conteúdo. Alternativas descartadas: manter paralela
com checagem de tamanho no build (não pega reordenação, que mantém o tamanho) e manter paralela
só com aviso no manual (o erro continua silencioso).
**Impacto no PRD:** §7.3 (`perfil`: `formacao[]`, `areas[]` e `atuacao[]` com `en` por item; `areas`
vira lista de objetos); RF-14 (o grupo "Versão em inglês" também existe dentro de item de lista).

## Decisão 8 — `atuacao[]` traduz só o `cargo`

**Data:** 2026-09-24
**Questão:** quais campos de `atuacao[]` (`{ cargo, instituicao, periodo }`) entram no `en` do item?
`perfil.instituicao` é traduzível, mas `formacao[].instituicao` foi tratada como factual no plano 018.
**Decisão:** **só `cargo`**: `atuacao[i].en.cargo`. `instituicao` e `periodo` ficam únicos, em PT,
como a instituição da formação.
**Justificativa:** o nome institucional em português é o nome oficial e é aceitável na página em
inglês. Fica coerente com `formacao[]` e com o texto já escrito no §12, e é um campo a menos para o
professor. Alternativa descartada: `cargo` + `instituicao`, coerente com `perfil.instituicao`,
mas que obrigaria `formacao[].en` a ganhar `instituicao` também.
**Impacto no PRD:** §7.3 (`atuacao[]`: "✔ (cargo)"); §12 fase 4 (item de `atuacao[]` inalterado).

## Decisão 9 — 404 em inglês em `/en/404.html`

**Data:** 2026-09-24
**Questão:** o RF-27 pede a 404 "no idioma da rota". Hoje há um só `dist/404.html`, servido pelo
Worker com `not_found_handling = "404-page"`.
**Decisão:** **gerar `dist/en/404.html`** (página fina + view, Decisão 6). O modo `404-page`
serve o `404.html` mais próximo na árvore de pastas, então `/en/<inexistente>` deve receber a 404
em inglês sem código no Worker. **Isso é premissa, não fato verificado:** o plano tem de provar
por artefato, no `wrangler dev` e em produção, que `/en/<inexistente>` responde `404` com corpo
igual ao `dist/en/404.html` e que `/<inexistente>` continua com o `dist/404.html`, como o plano 051
fez. Se a prova refutar a premissa, o plano cai numa 404 bilíngue única e volta ao stakeholder
para emendar o RF-27.
**Justificativa:** cumpre o RF-27 ao pé da letra sem lógica no Worker (D-01, site estático).
Alternativa descartada como primeira opção: uma 404 bilíngue, que independe do comportamento do
Worker mas não está "no idioma da rota".
**Impacto no PRD:** RF-27 (critério ganha o caso `/en`).

## Decisão 10 — Sitemap pela integração `@astrojs/sitemap`

**Data:** 2026-09-24
**Questão:** o sitemap bilíngue da fase 4 (RF-30) sai da integração oficial ou de um endpoint
próprio?
**Decisão:** **`@astrojs/sitemap`**, com a opção `i18n` (`pt-BR` na raiz, `en` em `/en`) para os
pares `alternate`, e filtro que tira as duas 404. O `robots.txt` **continua `Disallow`** até a Q-05
(fase 5); só então ele passa a apontar o `sitemap-index.xml`, como o comentário atual já prevê.
O `hreflang` do `<head>` inclui `x-default` apontando para a versão PT (RN-09, idioma canônico).
**Justificativa:** rascunho não gera página, então fica fora do sitemap sem lógica extra (RN-01,
RF-10). A integração lista as páginas que o build de fato gerou, e uma rota nova não fica
esquecida. Alternativa descartada: endpoint próprio a partir do mapa de rotas (sem dependência,
mas mais código e uma lista a manter em sincronia). Custo aceito: uma dependência nova, sujeita
ao `npm audit` do CI (plano 032).
**Impacto no PRD:** RF-30 (como o sitemap é gerado); §7.2 (dependência nova); §12 fase 4 (item de
sitemap).

## Decisão 11 — O executor escreve o `en.ts`; o stakeholder revisa antes do DONE

**Data:** 2026-09-24
**Questão:** quem escreve e valida o texto em inglês da interface (`src/i18n/en.ts`: menu,
rótulos, estados vazios, o aviso da Decisão 4, `<title>` e descrições)?
**Decisão:** **o executor do plano escreve**, e **o stakeholder revisa antes do DONE**. Uma tabela
PT → EN com todas as strings vai anexada à Evidência do plano, e a revisão é um passo explícito,
com a aprovação registrada.
**Justificativa:** não depende do professor (recorte de 2026-09-12) e não publica texto sem
revisão humana. Alternativas descartadas: deixar a validação para a sessão com o professor na
fase 5 (texto em produção sem revisão até lá) e só a revisão de código (confere a cobertura de
chaves pelo tipo `UiStrings`, não a qualidade do inglês).
**Impacto no PRD:** §12 fase 4 (item do dicionário: "revisado pelo stakeholder").

## Decisão 12 — M-07 provada por teste sobre o `dist/` e inspeção manual

**Data:** 2026-09-24
**Questão:** como provar a M-07 ("zero strings PT de interface nas rotas EN"), se o conteúdo que
cai no PT (RN-06) aparece legitimamente nessas rotas?
**Decisão:** **teste no `test:dist`** que reprova se qualquer valor do dicionário `pt` aparecer no
HTML de `/en/**` **fora** de elementos `lang="pt-BR"` (o conteúdo em fallback, Decisão 4), **mais**
a inspeção manual no navegador que a M-07 já prevê. O fatiamento define o comprimento mínimo das
strings comparadas e as exceções para valores iguais nos dois idiomas (ex.: "PT", "E-mail"), cada
uma listada no teste.
**Justificativa:** pega o texto PT escrito direto num componente e o `en.ts` com valor copiado do
`pt`, coisas que o tipo `UiStrings` não pega. Alternativa descartada: só a paridade de chaves pelo
tipo, mais a inspeção.
**Impacto no PRD:** M-07 (método de medição); §11 (teste de integração sobre o `dist/`).

## Decisão 13 — Texto em PT sem campo em inglês recebe `lang="pt-BR"`, mas não liga o aviso

**Data:** 2026-09-24
**Questão:** (Q-F4-1, levantada no fatiamento) as rotas `/en` exibem texto livre em português que
não tem par no grupo `en`: títulos e descrições de aula, lista, material, link e script;
bibliografia; instituições da formação e da atuação; `atuacao[].periodo`; financiador e
colaboradores de projeto; título e veículo de publicação. A Decisão 4 só cobre o fallback de
campo traduzível (RN-06), e o exemplo do RF-28 (publicação em `/en/publications`) usava justamente
um desses casos.
**Decisão:** esses campos **recebem `lang="pt-BR"`, mas não disparam o aviso da página**. O aviso
fica restrito ao fallback de campo traduzível (Decisão 4). **Exceção:** `publicacoes.titulo` e
`publicacoes.veiculo` ficam **sem** `lang` e sem aviso, porque em geral já estão em inglês. O
exemplo do RF-28 passa a ser a publicação sem `en.resumo` (substituído pela Decisão 15).
**Justificativa:** o leitor de tela pronuncia certo o texto em português, e o aviso continua
significando "o professor poderia ter traduzido isto e não traduziu", em vez de aparecer sempre
em Disciplina, Sobre e Publicações. Alternativas descartadas: (a) só o fallback recebe `lang` (o
título de aula em PT seria lido com pronúncia inglesa); (b) todo texto sem campo EN marca e avisa
(aviso permanente em três páginas, e título de artigo em inglês marcado como `pt-BR`).
**Impacto no PRD:** RF-28 (exemplo e critério); F-07 (o aviso é só para o fallback; `lang` também
em texto sem campo EN).

## Decisão 14 — Pares do sitemap por `serialize` se a opção `i18n` não parear rotas traduzidas

**Data:** 2026-09-24
**Questão:** (Q-F4-2, levantada no fatiamento) a opção `i18n` do `@astrojs/sitemap`
provavelmente pareia URLs pelo caminho sem prefixo (`/x` ↔ `/en/x`). Com segmentos traduzidos
(`/ensino` ↔ `/en/teaching`), só a Home formaria par. Premissa não verificada; o plano 071 mede
antes.
**Decisão:** se a opção não parear, os pares `alternate` são preenchidos pela opção `serialize`
**da mesma integração**, a partir do mapa de rotas PT↔EN (Decisão 6). **Não reabre a Decisão
10**: a integração, o filtro das 404 e a lista de páginas geradas continuam os mesmos.
**Justificativa:** uma única fonte de pares para o seletor, o `hreflang` e o sitemap. Alternativa
descartada: sitemap sem pares, com os pares só no `hreflang` do `<head>` (menos código, mas o
sitemap bilíngue do RF-30 ficaria incompleto).
**Impacto no PRD:** RF-30 (os pares do sitemap vêm do mapa de rotas quando a opção `i18n` não
bastar).

## Decisão 15 — Publicações sem resumo; o exemplo do RF-28 passa para a Pesquisa

**Data:** 2026-09-25
**Questão:** a Decisão 13 emendou o exemplo do RF-28 para "publicação sem `en.resumo`", mas o §6.6 de
`docs/identidade-visual.md` (redesenho, `f7e7345`) já tinha tirado o resumo da página Publicações. O
exemplo descrevia um caso que o site não produz.
**Decisão:** Publicações fica **sem resumo**, como na maioria dos sites acadêmicos: título, ano,
autores, veículo e links. O exemplo do RF-28 passa a ser a linha de pesquisa com `en.titulo` e sem
`en.resumo`: em `/en/research`, título em inglês e resumo em português com `lang="pt-BR"` e o aviso —
caso que já existe no conteúdo real. `/en/publications` não tem aviso nem `lang="pt-BR"`. O campo
`resumo` (e `en.resumo`) continua no esquema e no painel, sem uso no site.
**Justificativa:** decisão do stakeholder, 2026-09-25: a página deve ser simples. Alternativas
descartadas: manter o exemplo (critério indemonstrável na fase 4); voltar a exibir o resumo.
**Impacto no PRD:** RF-28 (exemplo e critério).
