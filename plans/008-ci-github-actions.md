# Plano 008 — CI no GitHub Actions (lint, testes e build)

**Status:** TODO
**RFs cobertos:** — (Fase 0, item 9 do checklist §12; RNF-09, RNF-10, R-02)
**Depende de:** planos 005, 006 e 007
**Modelo recomendado:** sonnet
**Agente recomendado:** implementer
**PRD:** `S:\Projetos\academic_page\haroldo\PRD.md`
**Projeto:** `S:\Projetos\academic_page\haroldo`

## Objetivo

O repositório passa a ter um workflow de integração contínua que, a cada push e a cada pull
request na `main`, instala as dependências de forma reprodutível, roda lint, testes e build,
e falha ruidosamente se qualquer um deles quebrar — o portão que a §11 exige antes de
qualquer merge.

## Arquivos afetados

- `.github/workflows/ci.yml` — criar

> O executor não toca em arquivo fora desta lista. Se precisar, para e reporta.
> Em especial, **não** altere scripts do `package.json`: o workflow tem de se adaptar aos
> scripts existentes, não o contrário. Se um script esperado não existir, pare e reporte.

## Contexto necessário

**Projeto.** `haroldo-page` — site pessoal acadêmico do Prof. Haroldo C. D. Lima Junior
(UFMA). Astro 5 estático + TypeScript + Tailwind 4 + Vitest. Stack Node/TypeScript pura —
**nenhum passo usa Python**.

**Scripts npm que já existem** (criados pelos planos 002, 004, 005 e 007) e que o workflow
deve chamar, com estes nomes exatos:

| Script | Comando | Plano de origem |
|---|---|---|
| `build` | `astro build` | 002 |
| `lint` | `eslint .` | 004 |
| `format:check` | `prettier --check .` | 004 |
| `test` | `vitest run` | 005 |
| `deploy` | `npm run build && wrangler deploy` | 007 — **nunca chamar no CI** |

**O CI não faz deploy.** Quem publica é o **Cloudflare Workers Builds**, conectado
diretamente ao repositório — e essa conexão é da **fase 2**, não desta (§6.2, checklist da
fase 2: "Workers Builds conectado ao repositório, build automático no push"). Se o workflow
chamar `wrangler deploy`, ele vai falhar por falta de credencial e vai duplicar o pipeline
de publicação. **Não crie job de deploy, não adicione secrets da Cloudflare.**

**Versão do Node.** O `.nvmrc` criado no plano 001 é a fonte única da verdade. Use
`actions/setup-node` com `node-version-file: '.nvmrc'` — **nunca** um número escrito à mão
no YAML, que dessincronizaria do ambiente local e do Workers Builds (RNF-12: "reproduzível
em Windows e Linux com Node LTS").

**`npm ci`, não `npm install`.** O `package-lock.json` está versionado (plano 002) e
`npm ci` é o que garante instalação reprodutível e falha se o lock estiver dessincronizado
do `package.json` — exatamente o erro que se quer pegar no CI.

**Nenhum segredo é necessário neste workflow.** O build do Astro na fase 0 não consulta o
TinaCloud (o Tina entra na fase 1). `TINA_TOKEN` **jamais** aparece no YAML como valor
literal (§7.6, RNF-07). Quando a fase 1/2 precisar dele, virá de
`${{ secrets.TINA_TOKEN }}` — mas **não o adicione agora**, nem como placeholder comentado
com valor falso.

**Esqueleto alvo do workflow:**

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  qualidade:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version-file: '.nvmrc'
          cache: 'npm'
      - run: npm ci
      - run: npm run lint
      - run: npm run format:check
      - run: npm run test
      - run: npm run build
```

**Por que esta ordem de passos:** lint e formatação são baratos e falham rápido; os testes
vêm antes do build porque, a partir da fase 1, o teste de paridade de schema (D-06, RNF-09,
risco R-02) precisa reprovar **antes** de se gastar tempo construindo o site. O
`npm run build` fica por último porque é ele que roda a validação Zod de todo o conteúdo
(§11, nível "Validação de conteúdo": *"Todo arquivo em `content/` passa pelo Zod —
`astro build` no CI — bloqueia merge"*).

**Nomes em português nos rótulos visíveis** (nome do workflow e do job), conforme §10.4 —
mas as chaves do YAML e os nomes de action são do GitHub e ficam como estão.

**Armadilhas conhecidas:**
- `cache: 'npm'` exige `package-lock.json` no repositório; se ele não estiver commitado, o
  step falha com mensagem confusa. Confirme com `git ls-files package-lock.json` antes.
- Fim de linha: o `.gitattributes` do plano 001 força LF. Se o `format:check` falhar no CI
  (Linux) e passar no Windows, a causa é CRLF vazando — resolva no `.gitattributes`/Prettier,
  **não** afrouxando o `format:check`.
- Este workflow só será executado depois que o repositório existir no GitHub (plano 010).
  Não é possível verificar a execução real antes disso — ver "Critérios de aceitação".

**Ambiente local.** Windows 11 / PowerShell, a partir de `S:\Projetos\academic_page\haroldo`.

## Passos

1. Conferir que os scripts `lint`, `format:check`, `test` e `build` existem no
   `package.json`. Se algum faltar, **pare e reporte** — não invente o script.
   → verify: `npm run` lista os quatro.
2. Criar `.github/workflows/ci.yml` com o esqueleto acima.
   → verify: o arquivo existe; `Select-String -Path .github/workflows/ci.yml -Pattern
   "node-version-file|npm ci"` acha as duas linhas.
3. Conferir que o YAML não contém nenhuma menção a `wrangler`, `deploy`, `CLOUDFLARE_` ou
   `TINA_TOKEN`.
   → verify: `Select-String -Path .github/workflows/ci.yml -Pattern
   "wrangler|deploy|CLOUDFLARE|TINA"` não retorna nada.
4. Reproduzir localmente a sequência exata do CI:
   `npm ci; npm run lint; npm run format:check; npm run test; npm run build`.
   → verify: os cinco comandos verdes, em sequência, numa mesma sessão. Cole a saída.
5. Commitar com `ci: adiciona workflow de lint, testes e build no GitHub Actions`.
   → verify: `git show --stat HEAD` lista `.github/workflows/ci.yml`.

## Critérios de aceitação

- [ ] `.github/workflows/ci.yml` dispara em `push` e `pull_request` na `main`
- [ ] Usa `node-version-file: '.nvmrc'` (nenhuma versão de Node escrita à mão)
- [ ] Usa `npm ci` (não `npm install`)
- [ ] Roda, nesta ordem: `lint`, `format:check`, `test`, `build`
- [ ] Nenhum job de deploy e nenhum secret referenciado
- [ ] A sequência completa do CI reproduzida localmente com sucesso (evidência colada)
- [ ] **Verificação final adiada:** a primeira execução real do workflow só pode ser
      conferida depois do plano 010 (repositório no GitHub). Registre isso como pendência
      no campo Evidência e feche-a no plano 013.

## Evidência

<Preenchido pelo executor: saída dos cinco comandos rodados em sequência local, e
`git show --stat HEAD`. Depois do plano 010, acrescentar o link/resultado da primeira
execução do workflow no GitHub.>
