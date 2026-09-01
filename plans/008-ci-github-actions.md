# Plano 008 — CI no GitHub Actions (lint, testes e build)

**Status:** DONE
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
| `build` | `astro check && astro build` | 002 |
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

- [x] `.github/workflows/ci.yml` dispara em `push` e `pull_request` na `main`
- [x] Usa `node-version-file: '.nvmrc'` (nenhuma versão de Node escrita à mão)
- [x] Usa `npm ci` (não `npm install`)
- [x] Roda, nesta ordem: `lint`, `format:check`, `test`, `build`
- [x] Nenhum job de deploy e nenhum secret referenciado
- [x] A sequência completa do CI reproduzida localmente com sucesso (evidência colada)
- [ ] **Verificação final adiada:** a primeira execução real do workflow só pode ser
      conferida depois do plano 010 (repositório no GitHub). Registre isso como pendência
      no campo Evidência e feche-a no plano 013.

## Evidência

Verificação independente pelo `triage-runner` nesta sessão (2026-09-01), reproduzindo a
sequência exata do CI em ordem, numa mesma sessão local (Windows). Saídas reais abaixo,
copiadas da triagem autoritativa.

### Sequência exata do CI — os 5 comandos, em ordem, todos com exit 0

**1. `npm ci` — exit 0**
```
added 518 packages, and audited 519 packages in 10s
(aviso de deprecated tsconfck@3.1.6; reportou "3 vulnerabilities (1 low, 2 high)" —
ver pendência de vulnerabilidades abaixo)
```

`git status --porcelain package-lock.json` → **saída vazia**. Confirmado: `npm ci` não
alterou o lock. Sem dessincronização entre `package.json` e `package-lock.json`.

**2. `npm run lint` — exit 0**
```
> eslint .
(sem saída)
```

**3. `npm run format:check` — exit 0**
```
Checking formatting...
All matched files use Prettier code style!
```

**4. `npm run test` — exit 0**
```
 RUN  v4.1.11 S:/Projetos/academic_page/haroldo
 Test Files  2 passed (2)
      Tests  12 passed (12)
   Duration  679ms
```

**5. `npm run build` — exit 0**
```
astro check: 0 errors, 0 warnings, 1 hint (deprecação de tseslint.config em
eslint.config.js, pré-existente, não relacionada a este plano)
astro build: 1 página construída, "Complete!"
```

### Estado do repositório (pré-commit — o commit ainda não existe; é do orquestrador)

`git status --short`:
```
 M plans/008-ci-github-actions.md
?? .github/
```

`git diff --stat`:
```
 plans/008-ci-github-actions.md | 2 +-
 1 file changed, 1 insertion(+), 1 deletion(-)
```

Não há `HEAD` com `.github/workflows/ci.yml` ainda — o arquivo está untracked, aguardando o
commit do orquestrador. Este registro substitui o `git show --stat HEAD` previsto no passo 5,
que só fará sentido depois do commit.

### Verificações estruturais do workflow

- `node-version-file: '.nvmrc'` presente (linha 16 do YAML); `grep -nE "node-version:
  *['\"]?[0-9]"` → nenhum match (exit 1) — nenhuma versão de Node escrita à mão.
- `npm ci` presente (linha 18); nenhuma ocorrência de `npm install` no arquivo.
- Ordem observada dos steps: `checkout` → `setup-node` → `npm ci` → `lint` → `format:check`
  → `test` → `build`. A ordem exigida (`lint` → `format:check` → `test` → `build`) confere.
- `grep -niE "wrangler|deploy|CLOUDFLARE|TINA|secrets\."` sobre o `ci.yml` → **nenhum match**
  (exit 1), nem em comentário. Nenhum job de deploy, nenhum secret referenciado.
- `.nvmrc` → `24`.
- `git ls-files package-lock.json` → versionado; `cache: 'npm'` tem o que precisa.

### Verificação de CRLF/LF

`git ls-files --eol` → 55 arquivos rastreados, **nenhum** com `crlf` ou `mixed`. Todos os
arquivos de texto aparecem como `i/lf w/lf attr/text=auto eol=lf` (os `.gitkeep` vazios
aparecem como `i/none w/none`, sem conteúdo a normalizar).

Ressalva: no momento dessa checagem, `.github/workflows/ci.yml` ainda estava **untracked**,
então não aparece na listagem de `git ls-files --eol` (o `.gitattributes` só normaliza no
`git add`). O arquivo foi conferido byte a byte: `cat -A .github/workflows/ci.yml | grep -c
'^M'` → `0`. O arquivo está em LF puro no disco. A reverificação pós-commit (`git ls-files
--eol -- .github/workflows/ci.yml`) fica a cargo do orquestrador, que vai rodá-la depois do
`git add`/commit e reportar se o resultado for diferente de `i/lf w/lf`.

### Pendência explícita — o workflow nunca rodou de verdade

**Tudo que foi provado aqui é que a sequência de comandos do CI passa localmente, no
Windows, nesta sessão.** O workflow do GitHub Actions em si **nunca foi executado** — nem
localmente (não há como rodar um workflow do Actions fora do GitHub) nem no GitHub, porque
o repositório remoto ainda não existe (depende do plano 010). A primeira execução real,
em Linux, só pode ser conferida depois que o plano 010 criar o repositório remoto e o push
disparar o workflow pela primeira vez. Essa verificação fica pendente e é fechada pelo
plano 013 — não considere o CI "verde no GitHub" a partir desta evidência.

### Achados da revisão — pendências NÃO bloqueantes, fora do escopo deste plano

1. **Cobertura de testes não é imposta.** O CI não roda `test:coverage`, e o
   `vitest.config.ts` não define `thresholds`. A meta de ≥80% da §11 é hoje apenas relatada
   (quando alguém roda `test:coverage` manualmente), não imposta em lugar nenhum — nada
   trava merge por cobertura baixa. Configurar `thresholds` faz sentido quando houver
   código de fato a cobrir, na fase 1; é trabalho de plano futuro.
2. **`npm audit` acusa 3 vulnerabilidades (1 low, 2 high)**, vindas de `astro@5.18.2`, que é
   dependência de **produção** (`npm audit --omit=dev` produz a mesma saída). O fix sugerido
   pelo npm é `astro@7.2.10`, classificado pelo próprio npm como **breaking change** (o
   projeto está fixado em `astro@5.18.2` pelo plano 002). Nada foi corrigido aqui; fica
   registrado para decisão do usuário, levada a ele separadamente — fora do escopo deste
   plano de CI.

---

## Nota do orquestrador — 2026-09-01 (pendência P-3, vinda da revisão do plano 002)

**A tabela de "Scripts npm que já existem" deste plano está desatualizada.** O plano 002
entregou `build` como `astro check && astro build`, não `astro build`.

Consequências, ambas boas — não "corrija" o script:

- O nome do script (`build`) é o que este plano verifica, então nada quebra.
- A checagem de tipos passa a rodar dentro do `build` do CI. Sem ela, o workflow da fase 0
  (`npm ci → lint → format:check → test → build`) **não teria checagem de tipos nenhuma**,
  porque `format:check` é Prettier. Não há duplicação a eliminar.

Atualize a tabela para refletir o script real antes de executar.
