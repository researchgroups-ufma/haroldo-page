# Plano 079 — JSON-LD `Person` + `WebSite` na Home PT e EN (RF-38, Decisões 5 e 7)

**Status:** TODO
**RFs cobertos:** **RF-38**; sabatina "Lacunas da auditoria de qualidade", Decisão 5, item 4, e Decisão 7 (Q-11); RN-06; §12 fase 5, item "Dados estruturados JSON-LD" (fecha)
**Depende de:** nenhum
**Modelo recomendado:** sonnet
**Agente recomendado:** implementer
**Executável por:** agente; a validação no `validator.schema.org` é do orquestrador
**PRD:** `S:\Projetos\academic_page\haroldo\PRD.md`
**Projeto:** `S:\Projetos\academic_page\haroldo`

## Objetivo

A Home PT (`/`) e a EN (`/en/`) trazem um `<script type="application/ld+json">` com um `Person`
(nome, cargo, vínculo com a UFMA, `sameAs` com ORCID e Lattes) e um `WebSite` (URL do site), num
`@graph`. Nenhuma outra rota traz JSON-LD. O objeto é montado e serializado por funções puras
testadas.

## Arquivos afetados

- `src/lib/structured-data.ts` — arquivo novo: `homeJsonLd` e `serializeJsonLd`
- `tests/lib/structured-data.test.ts` — arquivo novo
- `src/views/HomeView.astro` — o `<script type="application/ld+json">`
- `tests/dist/site-gerado.test.ts` — `describe` novo

> O executor não toca em arquivo fora desta lista. Se precisar, para e reporta. `Status:` fica `TODO`.
> Não commite. `BaseLayout.astro` não muda: o JSON-LD no `<body>` é válido.

## Contexto necessário

**RF-38** (PRD, linha 239) e **Decisão 7**: só na Home, PT e EN, os dois tipos juntos; na Home EN,
cargo e instituição do grupo `en` do perfil quando houver e, sem ele, os do PT (RN-06).
`ScholarlyArticle` e `Course` ficam de fora (Decisão 5, item 4).

**De onde vem cada campo** (`content/perfil/index.md` hoje: `nome`, `cargo: Professor Adjunto A`,
`instituicao: 'Universidade Federal do Maranhão (UFMA), Campus São Luís'`,
`links.lattes: 'http://lattes.cnpq.br/8115459874963916'`, `links.orcid: 'https://orcid.org/0000-0002-3702-7683'`,
sem grupo `en`; schema em `src/content.config.ts:220-237`, `perfilEnSchema` em 179–187):

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Person",
      "name": "<perfil.nome>",
      "jobTitle": "<en.cargo ou cargo>",
      "worksFor": { "@type": "CollegeOrUniversity", "name": "<en.instituicao ou instituicao>" },
      "sameAs": ["<links.orcid>", "<links.lattes>"]
    },
    { "@type": "WebSite", "url": "<new URL('/', siteConfig.siteUrl).href>", "name": "<siteConfig.title>" }
  ]
}
```

- Cargo e instituição: `localize(perfil.cargo, perfil.en?.cargo, lang).text`, o mesmo que a
  `HomeView.astro` já faz nas linhas 53 e 55 — aqui o PT na rota EN é o que a Decisão 7 manda.
- `sameAs`: ORCID e Lattes nessa ordem, só os preenchidos; sem nenhum, a chave sai. Nenhum outro
  link entra (RF-38 nomeia só os dois).
- `CollegeOrUniversity` é subtipo de `Organization` no schema.org: é o vínculo com a UFMA que o RF
  pede. Departamento não entra.
- `WebSite.url` é a raiz do site nas duas Homes (um site só); `name` é `siteConfig.title`.

**`src/lib/structured-data.ts`** (cabeçalho §10.1, TSDoc em tudo que exportar):
- `homeJsonLd(perfil, lang, site)` — `perfil` tipado por `z.infer<typeof perfilSchema>`
  (`import type`, como `src/i18n/pt.ts:33` faz), `lang: Locale`, `site: { url: string; name: string }`;
  devolve o objeto acima. Sem `import` de valor de `src/lib/config.ts` (quem chama passa `siteConfig`).
- `serializeJsonLd(value)` — `JSON.stringify` e depois troca `<` por `\u003c`, `>` por `\u003e`, `&`
  por `\u0026`, U+2028 por `\u2028` e U+2029 por `\u2029`. O resultado continua JSON válido e não
  fecha o `<script>` mesmo que o professor digite `</script>` no nome.

**Exceção à regra "sem `set:html` com conteúdo do professor"** (README da fase 4, "Regras de
código"), **registrada pelo fatiamento e a confirmar pelo orquestrador antes do despacho**: um
`<script>` com `type` não é processado pelo Astro e não interpola `{expressão}`; o único jeito de
emitir o JSON é `<script type="application/ld+json" set:html={serializeJsonLd(...)} />`. A exceção
vale só aqui, só sobre a saída de `serializeJsonLd`, e o teste de `</script>` abaixo é a garantia.
Comentário no ponto de uso citando RF-38 e esta exceção.

Na `HomeView.astro` (hoje 150 linhas; passar de 150 é aceito, registre a contagem), o `<script>`
vai dentro do `<BaseLayout>`, antes do `<section>`.

**Testes unitários** (`tests/lib/structured-data.test.ts`): PT com perfil completo; EN sem grupo
`en` (cargo e instituição PT); EN com `en.cargo` e `en.instituicao` (os do EN); `sameAs` só com
ORCID, só com Lattes, sem nenhum (chave ausente); `serializeJsonLd` de um nome
`</script><script>alert(1)</script>` não contém `</script` e `JSON.parse` devolve o nome intacto.

**Asserções de `dist`** (`describe('JSON-LD na Home (RF-38, Decisão 7)')`), esperado a partir de
`content/perfil/index.md` lido por `gray-matter` e de `siteConfig`:
1. `dist/index.html` e `dist/en/index.html` têm exatamente um `<script type="application/ld+json">`,
   cujo conteúdo faz `JSON.parse`, com um `Person` e um `WebSite` no `@graph`;
2. `Person.name` = `perfil.nome`; `Person.jobTitle` = cargo do idioma (EN: `en.cargo` ou o PT);
   `worksFor.name` = instituição do idioma; `sameAs` contém `links.orcid` e `links.lattes` quando
   preenchidos; `WebSite.url` = `new URL('/', siteConfig.siteUrl).href`;
3. nenhum outro `.html` de `dist/` fora de `admin/` tem `application/ld+json`;
4. nenhum `.html` contém `ScholarlyArticle` nem `"@type":"Course"`.

**Armadilha:** a M-07 (`tests/dist/i18n.test.ts`) pula o conteúdo de `<script>`, então o cargo PT
na Home EN não a reprova — e é o comportamento pedido.

**Regras de código:** `plans/fase-5-polimento-e-entrega/README.md`, seção "Regras de código".

## Passos

1. `structured-data.ts` e os testes unitários → verify: `npm test -- tests/lib/structured-data.test.ts` colado.
2. O `<script>` na `HomeView` → verify: `npm run build:pipeline` colado; o bloco JSON-LD de `dist/index.html` e de `dist/en/index.html` impresso e colado.
3. Asserções 1–4 → verify: `npm run test:dist` colado.
4. Canário A: tire a troca de `<` em `serializeJsonLd` → o teste do `</script>` reprova; desfaça → verify: saída colada.
5. Canário B: acrescente um `en.cargo` temporário a `content/perfil/index.md` (**autorizado**; reversão com `git checkout -- content/perfil/index.md`) e passe `lang` fixo `'pt'` a `homeJsonLd` na `HomeView`; refaça o build → a asserção 2 reprova na Home EN. Desfaça a `HomeView` editando de volta, reverta o `content/`, prove com `git status --short` sem `content/` e refaça o build → verify: saídas coladas.
6. Portão → verify: `npm run lint`, `npm run format:check`, `npm run test:coverage` colados.

**Do orquestrador:** colar o bloco JSON-LD de `dist/en/index.html` no `https://validator.schema.org/`
(aba "Code snippet") e registrar o resultado (zero erros; avisos transcritos), com data e hora.

## Critérios de aceitação

- [ ] `homeJsonLd` e `serializeJsonLd` exportadas, com TSDoc e testes verdes
- [ ] Home PT e EN com um JSON-LD `Person` + `WebSite`, valores do perfil e fallback RN-06 (asserções 1–2)
- [ ] Nenhuma outra rota com JSON-LD; nenhum `ScholarlyArticle` nem `Course` (asserções 3–4)
- [ ] Canários A e B vermelhos; `content/` revertido
- [ ] Exceção do `set:html` confirmada pelo orquestrador e comentada no código
- [ ] `validator.schema.org` sem erro (orquestrador)
- [ ] `lint`, `format:check`, `test:coverage`, `build:pipeline`, `test:dist` verdes, com saída colada

## Evidência

<Preenchida pelo executor, com saída literal capturada em arquivo (ver `plans/DESPACHO.md`). Plano
sem esta seção preenchida não é DONE.>
