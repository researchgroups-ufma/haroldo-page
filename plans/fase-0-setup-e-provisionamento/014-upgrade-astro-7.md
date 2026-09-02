# Plano 014 — Upgrade do Astro 5 → 7 antes da fase 1

**Status:** DONE
**RFs cobertos:** — (dívida técnica registrada em `plans/README.md` §"Segurança"; RNF-12)
**Depende de:** plano 013 (fase 0 fechada)
**Modelo recomendado:** sonnet
**Agente recomendado:** implementer
**PRD:** `S:\Projetos\academic_page\haroldo\PRD.md`
**Projeto:** `S:\Projetos\academic_page\haroldo`

## Objetivo

O projeto roda em `astro@7.2.10`, o `npm audit` sai de 1 vulnerabilidade high para zero, e o
override do `vite` desaparece — tudo isso **antes** de a fase 1 escrever os schemas Zod das
cinco coleções, que a migração quebraria.

## Arquivos afetados

- `package.json` — versão do `astro`, remoção do override do `vite`, possivelmente `sharp` e
  `esbuild`
- `package-lock.json` — consequência do acima
- `docs/adr/0002-pin-do-vite-via-overrides.md` — registrar que o gatilho de revisão disparou
- `docs/CHANGELOG.md` — entrada em "Não publicado → Alterado"
- `astro.config.mjs` — **só se** o guia de migração exigir
- `src/pages/index.astro` — **só se** o compilador Rust reclamar
- `plans/README.md` — remover a dívida do upgrade da seção "Segurança"

> Não toque em `wrangler.toml`, `.env.example`, `PRD.md` nem em `src/lib/`. Se precisar, pare
> e reporte.

## Contexto necessário

**Por que agora e não depois.** O motivo **não** é a vulnerabilidade. A análise de 2026-09-01
(em `plans/README.md`) verificou que os 8 advisories do Astro ou exigem SSR — impossível aqui
por D-01, o `wrangler.toml` não tem `main` — ou dependem de recursos que o site não usa
(`define:vars`, spread props, `transition:*`, slots), com grep confirmando zero ocorrências.

O motivo é a **API de conteúdo**. O Astro v6 remove as coleções legadas, exige Content Layer
API com `glob()`, sobe para **Zod 4** (`z.string().email()` vira `z.email()`) e consolida os
imports (`astro:schema` e o `z` de `astro:content` passam a `astro/zod`). O primeiro item do
checklist da fase 1 é `src/content.config.ts` com os schemas Zod das cinco coleções. Migrar
depois significaria reescrevê-los, junto com o teste de paridade da D-06.

**Custo hoje é o menor possível:** `content/` está vazio, existe **um** arquivo `.astro`
(`src/pages/index.astro`), 2 arquivos de teste e 12 testes.

**Auditoria de superfície já feita em 2026-09-01** — não precisa refazer, mas confirme:

| Mudança quebradora | Situação neste projeto |
|---|---|
| Node ≥ 22.12 (v6) | Node 24.16.0, `.nvmrc` em 24 — ok |
| Vite 7 (v6) → Vite 8 (v7) | `astro@7.2.10` exige `vite: ^8.0.13`; `@tailwindcss/vite@4.3.3` aceita peer `^8` |
| Coleções legadas removidas, Zod 4 (v6) | `src/content.config.ts` ainda não existe — nada a migrar |
| Compilador Rust mais estrito com HTML (v7) | um único `.astro`, tags fechadas e aninhamento válido |
| `src/fetch.ts` reservado (v7) | não existe |
| Sätteri no lugar de remark/rehype (v7) | `astro.config.mjs` não configura markdown nem plugins |
| `compressHTML: 'jsx'` por default (v7) | uma página; conferir espaçamento no HTML gerado |
| `@astrojs/db`, `astro:transitions` internos, `Astro.glob`, `ViewTransitions` removidos | grep confirmou zero uso |
| `.cjs`/`.cts` de config (v6) | a config é `.mjs` |

**O override do `vite` tem de sair.** O ADR-0002 registrou o gatilho: *"Remover este override
quando o `astro` passar a exigir vite ≥ 7. Validar com `npm ls vite --all` mostrando uma única
cópia."* O `astro@7.2.10` exige `^8.0.13` — o gatilho disparou. Manter `vite: 6.4.3` fixado
**quebraria** a instalação.

**Os overrides de `sharp` e `esbuild` podem ter ficado desnecessários.** Confira o que o
`astro@7` já traz e remova o que for redundante; mantenha o que ainda for preciso, com o
motivo atualizado no ADR-0002.

**Compatibilidade do Tina, já verificada:** `@tinacms/astro@0.6.1` declara peer
`astro: ^5.0.0 || ^6.0.0 || ^7.0.0`. O upgrade não bloqueia a fase 1.

**Ambiente.** Windows 11 / PowerShell, a partir de `S:\Projetos\academic_page\haroldo`.

## Passos

1. Registrar o estado de partida: `npm ls astro vite --depth=0`, `npm audit` e a saída dos
   cinco comandos de qualidade.
   → verify: saídas coladas na Evidência, para comparação depois.
2. Subir o `astro` para `7.2.10` e **remover o override do `vite`** do `package.json`.
   → verify: `npm ls vite --all` mostra **uma única cópia**, sem `overridden`.
3. Reavaliar os overrides de `sharp` e `esbuild`: remover os que ficaram redundantes.
   → verify: `npm audit` e o motivo de cada override remanescente registrado.
4. Rodar `npm run build` e corrigir o que o compilador Rust apontar em `src/pages/index.astro`.
   → verify: `0 errors, 0 warnings, 0 hints`.
5. Rodar a sequência completa: `npm ci; npm run lint; npm run format:check; npm run test;
   npm run build`.
   → verify: os cinco verdes; cole as saídas.
6. **Validar a otimização de imagem de ponta a ponta**, como o commit `07521cd` fez: página
   temporária com `astro:assets`, confirmar `generating optimized images` com WebP
   redimensionado, e removê-la depois. O v6 mudou os defaults de imagem (corta por padrão, não
   faz upscale) — isto é o que prova que o `sharp` continua funcionando.
   → verify: saída do build mostrando a imagem otimizada; página removida ao fim.
7. **Deploy real** com `npm run deploy` e conferir HTTP: raiz 200 com a página estilizada,
   rota inexistente 404, `x-robots-tag: noindex` presente.
   → verify: os três, com saída de `curl.exe`.
8. Atualizar o ADR-0002 (gatilho disparado), o CHANGELOG e a seção "Segurança" do
   `plans/README.md`.
   → verify: o ADR diz o que aconteceu com cada um dos três overrides.
9. Commitar e empurrar; confirmar CI verde.
   → verify: `git show --stat HEAD` e o resultado da execução do CI.

## Critérios de aceitação

- [x] `astro@7.2.10` instalado; `npm ls astro --depth=0` confirma
- [x] Override do `vite` **removido**; `npm ls vite --all` mostra uma única cópia
- [x] Overrides de `sharp` e `esbuild` reavaliados — removidos se redundantes, ou mantidos com
      motivo atualizado no ADR-0002
- [x] `npm audit` sem vulnerabilidade **high**; qualquer restante analisada e registrada
- [x] `npm run lint`, `npm run format:check`, `npm run test` e `npm run build` verdes, com
      `0 errors, 0 warnings, 0 hints`
- [x] Otimização de imagem validada de ponta a ponta com página temporária, depois removida
- [x] Deploy real verificado: raiz **200**, rota inexistente **404**, `x-robots-tag: noindex`
- [x] ADR-0002 atualizado registrando que o gatilho de revisão disparou e o que foi feito
- [x] `docs/CHANGELOG.md` com entrada em "Alterado"
- [x] `plans/README.md` sem a dívida do upgrade do Astro
- [x] CI verde após o push

## Evidência

Executado na sessão de orquestração em 2026-09-01. A decisão de subir agora, em vez de esperar
a vulnerabilidade importar, foi do usuário, depois de a análise mostrar que o motivo real era a
API de conteúdo e não o CVE.

### Antes

```
$ npm ls astro --depth=0
`-- astro@5.18.2

$ npm ls vite --all
`-- vite@6.4.3 overridden   (+ 4 deduped)

$ npm audit
1 high severity vulnerability

overrides: { "vite": "6.4.3", "sharp": "0.35.4", "esbuild": "0.28.2" }
```

### Depois

```
$ npm ls astro --depth=0
`-- astro@7.2.10

$ npm audit
found 0 vulnerabilities

overrides: (nenhum — a chave saiu do package.json)
```

### Os três overrides caíram

`astro@7.2.10` declara `dependencies.vite: ^8.0.13` — o gatilho do ADR-0002 disparou, e manter
o pin em `6.4.3` **quebraria** a instalação. Validação prescrita pelo próprio ADR:

```
$ npm ls vite --all   (contagem por versão, descontado o pacote @tailwindcss/vite)
      5 vite@8.2.2
```

Uma única versão, sem `overridden`. Os de `sharp` e `esbuild` ficaram redundantes:

```
$ npm view astro@7.2.10 optionalDependencies.sharp dependencies.esbuild
{ "optionalDependencies.sharp": "^0.35.4", "dependencies.esbuild": "^0.28.0" }
```

O Astro 7 já pede nativamente as faixas corrigidas. Removidos os três, `npm audit` continua em
zero. Restam cópias antigas sob `wrangler` → `miniflare` (`sharp@0.35.2`, `esbuild@0.28.1`),
ferramenta de desenvolvimento fora do build do site e não acusadas pelo audit.

### Superfície de migração — auditada antes de mexer

Guias v6 e v7 lidos. Nada exigiu alteração de código:

| Mudança quebradora | Situação |
|---|---|
| Node ≥ 22.12 (v6) | Node 24.16.0 — ok |
| Vite 7 (v6) → Vite 8 (v7) | resolvido pela remoção do override |
| Coleções legadas, Zod 4, `astro:schema` → `astro/zod` (v6) | `src/content.config.ts` não existe — **é exatamente por isso que o upgrade veio antes da fase 1** |
| Compilador Rust estrito com HTML (v7) | um único `.astro`, tags fechadas, aninhamento válido — build passou sem reclamar |
| `src/fetch.ts` reservado (v7) | não existe |
| Sätteri no lugar de remark/rehype (v7) | `astro.config.mjs` não configura markdown nem plugins |
| `@astrojs/db`, `astro:transitions` internos, `Astro.glob`, `ViewTransitions`, `define:vars` | grep em `src/`: zero ocorrências |
| `.cjs`/`.cts` de config (v6) | a config é `.mjs` |

Nenhuma linha de `astro.config.mjs` ou `src/pages/index.astro` precisou mudar. O diff é
`package.json` + `package-lock.json` e documentação.

### Sequência de qualidade

```
$ npm ci
found 0 vulnerabilities

$ npm run lint
> eslint .
(exit 0, sem saída)

$ npm run format:check
All matched files use Prettier code style!

$ npm run test
 Test Files  2 passed (2)
      Tests  12 passed (12)

$ npm run build
Result (10 files):
- 0 errors
- 0 warnings
- 0 hints
[build] output: "static"
[build] mode: "static"
[build] 1 page(s) built in 322ms
[build] Complete!
```

`output: "static"` preservado — D-01 continua valendo sob o Astro 7.

### Otimização de imagem validada de ponta a ponta

O v6 mudou os defaults de imagem (corta por padrão, não faz upscale), então o log não bastava.
Página temporária com `astro:assets` sobre um PNG sintético 800×600:

```
 generating optimized images
  ▶ /_astro/__probe.QmwJdwfn_Z1QbjL.webp (before: 8kB, after: 0kB) (+75ms) (1/1)

$ node -e "sharp(f).metadata()"
formato: webp | dimensoes: 320x240 | bytes: 218

$ grep -o '<img[^>]*>' dist/probe-tmp/index.html
<img src="/_astro/__probe.QmwJdwfn_Z1QbjL.webp" alt="probe" loading="lazy"
     decoding="async" width="320" height="240">
```

Conferido no arquivo gerado, não só no log: formato WebP, redimensionado para 320×240
preservando a proporção, `width`/`height` corretos no HTML. Sonda e imagem removidas em
seguida; `git status --short` voltou a listar só `package.json` e `package-lock.json`.

**Nota de execução:** a primeira sonda se chamava `src/pages/__probe.astro` e **não gerou nada**
— o Astro exclui de `src/pages/` os arquivos com prefixo `_`. Renomeada para `probe-tmp.astro`,
funcionou. Registrado porque um "build passou, sem imagem otimizada" teria sido lido como
sucesso.

### Deploy real

```
$ npm run deploy
🌀 Found 3 new or modified static assets to upload. Proceeding with upload...
+ /robots.txt
+ /index.html
+ /_astro/index.CHYz_id7.css
✨ Success! Uploaded 3 files (1 already uploaded) (1.72 sec)
Deployed haroldo-page triggers (5.03 sec)
  https://haroldo-page.and-near.workers.dev
Current Version ID: 6ec874d4-0857-43c1-ad8d-ead7cf1e55fc

$ curl.exe verificações
raiz: 200
404:  404
<h1 class="text-3xl font-semibold">Prof. Haroldo C. D. Lima Junior</h1>
x-robots-tag: noindex
```

### O que NÃO foi verificado

- **A otimização de imagem usou imagem sintética**, como na validação original do `07521cd`. A
  pendência de reconferir com imagem real segue aberta para a fase 1, quando houver a foto do
  perfil.
- ~~CI verde após o push~~ — **confirmado pelo usuário** em 2026-09-01 na aba Actions, sobre o
  commit `68b5daa`. É a primeira execução do CI com Astro 7. A procedência é o relato do
  usuário: `gh` não está instalado nesta máquina e não houve como ler o run daqui.
- Nenhum ADR próprio foi escrito para o upgrade. A pendência do `plans/README.md` admitia "ADR
  do upgrade do Astro **ou plano próprio**"; este plano é o registro.
