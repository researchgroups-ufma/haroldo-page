# Plano 075 — `/admin` fora da indexação por um bloco próprio no `_headers` (RF-30, Decisão 8)

**Status:** TODO
**RFs cobertos:** **RF-30** (`/admin` fora da indexação); sabatina "Lacunas da auditoria de qualidade", Decisão 5, item 1, corrigida pela Decisão 8; §12 fase 5, item "SEO completo" (parte `/admin`; o item fecha com 076, 077 e 078)
**Depende de:** nenhum
**Modelo recomendado:** sonnet
**Agente recomendado:** implementer
**Executável por:** agente; o `curl` em produção é do orquestrador, depois do push
**PRD:** `S:\Projetos\academic_page\haroldo\PRD.md`
**Projeto:** `S:\Projetos\academic_page\haroldo`

## Objetivo

`public/_headers` ganha um bloco `/admin/*` com `X-Robots-Tag: noindex`, separado do bloco global
`/*`, para o painel continuar fora da indexação quando a Q-05 tirar o `noindex` provisório. O
`robots.txt` **não** ganha `Disallow: /admin/`. O teste de `dist` lê o `_headers` por blocos, com um
leitor que os planos 082 e 084 reaproveitam.

## Arquivos afetados

- `public/_headers` — bloco `/admin/*` novo e comentário do topo atualizado
- `tests/dist/site-gerado.test.ts` — função `parseHeadersFile` e um `describe` novo

> O executor não toca em arquivo fora desta lista. Se precisar, para e reporta. `Status:` fica `TODO`.
> Não commite. **`public/robots.txt` não muda** (Decisão 8).

## Contexto necessário

**Decisão 8** (`docs/sabatinas/CHANGELOG_sabatina_auditoria-qualidade.md`): o `/admin` sai da
indexação **só** pelo `X-Robots-Tag: noindex` num bloco `/admin/*` próprio, que fica depois que o
`/*` sair. Sem `Disallow: /admin/`, porque o buscador que não pode rastrear a URL não lê o `noindex`
e pode indexá-la sem conteúdo se houver link externo (recomendação documentada do Google). A
Decisão 5, item 1, pedia o `Disallow` e foi corrigida por esta.

**`public/_headers` hoje** (12 linhas; o comentário explica o provisório):

```
# Provisório: enquanto o site vive no subdomínio *.workers.dev (A-07, Q-05 em aberto),
# `Disallow: /` no robots.txt bloqueia rastreamento, mas não garante não indexação — uma
# URL descoberta por link externo pode ser indexada mesmo assim. Este header garante a
# não indexação de fato. A fase 5 (RF-30) remove o bloco `/*` abaixo junto com a reativação
# da linha `Sitemap` no robots.txt, quando o domínio próprio (Q-05) estiver definido. O
# bloco `/_astro/*` (cache imutável dos arquivos com hash no nome) fica.
/*
  X-Robots-Tag: noindex

/_astro/*
  Cache-Control: public, max-age=31536000, immutable
```

O comentário tem de mudar em dois pontos: (1) quando a Q-05 chegar, sai **só a linha
`X-Robots-Tag` do `/*`**, não o bloco (o plano 082 põe cabeçalhos de segurança nele); (2) o bloco
`/admin/*` fica para sempre, com a citação da Decisão 8 e do RF-30. Não reescreva o resto.

**Formato do `_headers`** (Cloudflare Workers Static Assets): linha sem recuo = padrão de caminho
(`*` casa qualquer sequência); linhas recuadas abaixo dele = `Nome: valor`; `#` é comentário;
linha em branco separa blocos. Quando vários blocos casam a mesma URL, os cabeçalhos se somam; a
documentação da Cloudflare diz que o mesmo nome em dois blocos sai com os valores unidos por
vírgula — **não medido neste projeto**. Hoje `/admin/index.html` casa `/*` e passará a casar
`/admin/*`: em produção o valor pode sair `noindex` ou `noindex, noindex`. Os dois valem; registre o
que sair.

O painel é `public/admin/` (gerado pelo `tinacms build`, no `.gitignore`), copiado para
`dist/admin/` pelo build. O `_headers` também é copiado para `dist/_headers`.

**`parseHeadersFile(text)`**, no topo do teste, ao lado de `listFiles`: devolve
`{ pattern: string; headers: [string, string][] }[]` na ordem do arquivo; ignora comentário e linha
em branco; linha recuada antes de qualquer padrão lança erro com o número da linha. Os planos 082
e 084 vão usá-la, então nada de asserção dentro dela. TSDoc obrigatório.

**Asserções** (`describe('/admin fora da indexação (RF-30, Decisão 8)')`), todas sobre
`dist/_headers` e `dist/robots.txt`:
1. existe um bloco de padrão **exatamente** `/admin/*` com `X-Robots-Tag: noindex`;
2. o `noindex` do `/admin/*` não depende do `/*`: o teste remove, numa cópia em memória da lista de
   blocos, toda linha `X-Robots-Tag` do `/*` e confere que o `/admin/*` continua com ela;
3. `dist/robots.txt` não tem linha que case `/^Disallow:\s*\/admin/im`.

Sem asserção sobre o `Disallow: /` global: ele sai no plano 085.

**Regras de código:** `plans/fase-5-polimento-e-entrega/README.md`, seção "Regras de código".
Atualize o cabeçalho §10.1 do teste (Descrição, `Atualizado em`, `Versão`).

## Passos

1. Bloco `/admin/*` e comentário em `public/_headers` → verify: `git diff -- public/_headers` colado.
2. `parseHeadersFile` e as três asserções → verify: `npm run build:pipeline` e `npm run test:dist` colados.
3. Canário A: apague o bloco `/admin/*` de `dist/_headers` (o artefato, não a fonte) e rode `npm run test:dist` → a asserção 1 reprova; refaça o build → verify: saídas coladas.
4. Canário B: acrescente `Disallow: /admin/` a `dist/robots.txt` e rode `npm run test:dist` → a asserção 3 reprova; refaça o build → verify: saídas coladas.
5. Prova local de que o bloco vale sem o `/*`: com o `dist/` do build final, apague a linha `X-Robots-Tag` do `/*` **só em `dist/_headers`**, suba `npx wrangler dev --port 8787` com `Start-Process` (sem deixá-lo rodando no fim), e rode `curl.exe -sI http://localhost:8787/admin/index.html` e `curl.exe -sI http://localhost:8787/sobre/`. Esperado: `x-robots-tag: noindex` no primeiro e ausente no segundo. Pare o processo e refaça o build → verify: as duas saídas do `curl` coladas e `Get-Process` sem `workerd`. Se o `wrangler dev` pedir login ou ignorar o `_headers`, cole a saída e siga: a prova fica para o `curl` de produção.
6. Portão → verify: `npm run lint`, `npm run format:check`, `npm run test:coverage` colados; `git diff --stat -- public/robots.txt` vazio.

**Do orquestrador, depois do push e do Workers Builds verde:** `curl.exe -sI https://haroldo-page.and-near.workers.dev/admin/index.html` e o mesmo em `/admin/`, colados na Evidência.

## Critérios de aceitação

- [ ] `public/_headers` com bloco `/admin/*` e `X-Robots-Tag: noindex`; comentário diz que sai só a linha do `/*`
- [ ] Teste "o noindex do /admin/* não depende do /*" verde, e os canários A e B vermelhos
- [ ] `robots.txt` intocado, sem `Disallow: /admin/`
- [ ] Prova local do passo 5 colada, ou o bloqueio dela registrado
- [ ] `curl` de produção em `/admin/index.html` com `x-robots-tag` (orquestrador)
- [ ] `lint`, `format:check`, `test:coverage`, `build:pipeline`, `test:dist` verdes, com saída colada
- [ ] TSDoc em `parseHeadersFile`

## Evidência

<Preenchida pelo executor, com saída literal capturada em arquivo (ver `plans/DESPACHO.md`). Plano
sem esta seção preenchida não é DONE.>
