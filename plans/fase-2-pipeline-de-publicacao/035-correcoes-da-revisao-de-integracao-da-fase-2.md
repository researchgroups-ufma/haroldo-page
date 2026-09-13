# Plano 035 — Correções da revisão de integração da fase 2: deploy de emergência e vigia com build travado

**Status:** TODO
**RFs cobertos:** **F-02**, **F-09**, RNF-04, §10.5; bloqueantes da revisão de integração do
`/fechar-fase` da fase 2
**Depende de:** planos 024, 028, 030 e 034 (todos DONE)
**Modelo recomendado:** sonnet
**Agente recomendado:** implementer
**Executável por:** **agente**
**PRD:** `S:\Projetos\academic_page\haroldo\PRD.md`
**Projeto:** `S:\Projetos\academic_page\haroldo`

## Objetivo

A revisão de integração do fechamento da fase 2 (2026-09-12) reprovou com dois bloqueantes e
apontou cinco não bloqueantes. O stakeholder decidiu: **(a)** o caminho de emergência passa a rodar
o portão de conteúdo, e **o furo do vigia com build travado é corrigido agora**. Este plano faz as
duas mudanças de comportamento, corrige a contradição do `plans/README.md` e registra os outros
quatro achados como dívida nomeada.

## Arquivos afetados

- `package.json` — só o script `deploy`
- `docs/adr/0009-build-de-pipeline-sem-cloud-check.md` — ponto 4 da Decisão
- `README.md` — seção "Deploy" (e onde mais o `npm run deploy` for descrito como "mais estrito")
- `.github/workflows/vigia-do-deploy.yml` — a regra do check não concluído
- `docs/adr/0011-vigia-agendado-da-falha-de-build.md` — item 4 da Decisão
- `plans/README.md` — as duas frases que ainda dão o 034 como pendente
- `plans/fase-2-pipeline-de-publicacao/README.md` — linha do 035 na tabela de Estado e as dívidas
  novas
- este arquivo (Evidência)

> Não toque em arquivo fora desta lista. **Não** altere o `PRD.md` (a promoção é do orquestrador).
> `Status:` fica `TODO`. Não commite.

## Contexto necessário

### Bloqueante 1 — `plans/README.md` se contradiz

As linhas 7 e 15 dizem "fase 2 concluída — plano 034 DONE", mas ≈62-63 dizem "sobra o **034**,
que a leva a 5/5" e ≈69-70 dizem "o próximo é o **034**, que fecha a fase 2". Reescreva as duas no
passado. O próximo plano não pertence a nenhuma fase executável: a fase 3 está bloqueada na Q-04, e
a 5 depende do professor.

### Bloqueante 2 — `npm run deploy` pula o portão de conteúdo (decisão (a))

Hoje, `package.json`:

```
"build": "tinacms build && astro check && astro build",
"build:pipeline": "vitest run tests/content && tinacms build --skip-cloud-checks && astro check && astro build",
"deploy": "npm run build && wrangler deploy"
```

O `README.md` (seção Deploy) e o ADR-0009 (ponto 4) apresentam o `deploy` como o caminho "mais
estrito". Ele tem o cloud check, mas **não roda `tests/content`**. E o `astro check` sai com exit 0
diante de referência inválida (planos 020/021, ADR-0009 ponto 3). Cenário: o Workers Builds fica
fora do ar, a `main` tem `linha_relacionada: ''` salvo pelo painel, e `npm run deploy` publica o que
o deploy automático recusaria.

**Mudança:** `"deploy": "vitest run tests/content && npm run build && wrangler deploy"`. O ADR-0009
ponto 4 passa a dizer que o deploy de emergência roda o mesmo portão de conteúdo do pipeline **mais**
o cloud check, com data (2026-09-12) e origem (revisão de integração da fase 2). Não reescreva a
história do ADR: acrescente a emenda. O `README.md` descreve o comando como ele fica.

### Não bloqueante escolhido para corrigir agora — o vigia com build travado

`.github/workflows/vigia-do-deploy.yml`, trecho atual:

```
          if [ "$status" != "completed" ]; then
            echo "Build ainda em andamento."
            exit 0
          fi
```

A regra dos 30 minutos só vale para check **ausente**. Se o check existe e nunca chega a
`completed` (build `queued` ou preso por incidente da Cloudflare), o vigia responde "em andamento"
todo dia, e a `main` nunca publica sem que ninguém seja avisado. É um furo do F-02.

**Mudança:** com `status != completed` e o commit com mais de **60 minutos**, o vigia reprova com
`::error::` nomeando o SHA, o status e o link do build. Com menos de 60, passa como hoje. Por que 60 e
não 30: o §7.4 dá teto de 20 min por build e **1 build simultâneo** no plano gratuito, então saves em
sequência enfileiram. Um limite menor daria alarme falso numa fila legítima, e com uma execução por
dia o custo de esperar mais é nulo. Comente essa razão numa linha no workflow. Reaproveite o cálculo
de `idade` que já existe (hoje ele só é feito no ramo sem check: mova-o para antes, sem duplicar). O
limite de check ausente continua 30 min. O ADR-0011, item 4 da Decisão, passa a descrever os dois
casos.

### Não bloqueantes que viram dívida nomeada (registrar, não corrigir)

Acrescente à lista "Dívidas novas da própria fase 2" do README da fase, cada um com arquivo, cenário
e "fecha quando":

1. **PRD §11 (≈:750)** atribui a validação de conteúdo ao "`astro build` no CI" e diz "Bloqueia
   merge". O portão real é `vitest run tests/content` (CI e `build:pipeline`), e a `main` **não tem
   proteção de branch** (`gh api repos/researchgroups-ufma/haroldo-page/branches/main/protection`
   responde `Branch not protected`). O TinaCloud empurra direto na `main`.
2. **README da fase 2, "Verificação autoritativa" (≈:335-352)** parou antes do 030: não tem o
   `npm audit` nem o check `Workers Builds`, e ainda diz "Enquanto o plano 030 não fechar". A fase 3
   herda isso como roteiro.
3. **`npm run build` chamado de "portão pré-push"** (`README.md` ≈:86 e ≈:295-302; ADR-0009 ≈:58;
   README da fase ≈:117). Para mudança de schema, o cloud check só passa **depois** do push e da
   reindexação. Seguida à risca numa branch, a seção Qualidade trava com `ERR_CLOUD_CHECK_FAILED`.
   **Atenção:** este plano já edita o ADR-0009 e o `README.md`. Não corrija essas passagens de
   passagem; registre-as.
4. **PRD §7.4 (≈:492)**: o "Plano B" do Workers Builds (deploy pelo GitHub Actions) muda o nome do
   check e faz o vigia reprovar todo dia com "Nenhum check". A célula não aponta o ADR-0011.

Na tabela de Estado do README da fase, acrescente a linha do 035 (⬜ TODO, agente, implementer,
commits `—`).

### O que este plano NÃO faz

- ⛔ Não roda `npm run deploy` nem `wrangler deploy`: publicaria o disco local em produção.
- ⛔ Não muda `build` nem `build:pipeline`.
- ⛔ Não corrige os quatro não bloqueantes, só os registra.
- ⛔ Não toca no `PRD.md`.

## Passos

1. Bloqueante 1 em `plans/README.md`.
   → verify: `grep -n "sobra o\|o próximo é o" plans/README.md` colado, sem afirmação do 034 como
   pendente.
2. Script `deploy`, ADR-0009 ponto 4 e `README.md` (seção Deploy e qualquer outra descrição do
   `deploy` como "mais estrito": `grep -n "mais estrito" README.md docs/adr/0009*`).
   → verify: (a) `grep -n '"deploy"' package.json` colado; (b) **prova sem publicar** de que o
   portão de conteúdo barra antes do build: injete temporariamente `aulas:` com `  - {}` em
   `content/disciplinas/2025.1-mecanica-classica.md`, rode `npx vitest run tests/content`, cole a
   saída com exit code ≠ 0 e as mensagens `aulas.0.*`, e **reverta** (`git checkout --
   content/disciplinas/2025.1-mecanica-classica.md`), com `git status --short` colado mostrando
   `content/` limpo. Não rode `npm run deploy`.
3. Vigia: a regra do check não concluído, e o ADR-0011 item 4.
   → verify: a lógica do step exercitada **localmente, com um `gh` falso**. Crie no scratchpad
   (`C:\Users\andne\AppData\Local\Temp\claude\S--Projetos-academic-page-haroldo\61d10e59-4be4-4d8c-b962-6f7d003843e8\scratchpad`)
   um executável `gh` que devolve respostas fixas por cenário. Extraia o script do `run:` **do
   arquivo do workflow, por programa** (não redigite), e rode-o com esse `gh` à frente no `PATH`,
   `REPO` e `CHECK` definidos. Seis cenários, cada um com a saída e o exit code colados:
   - check `completed`/`success` → exit 0
   - check `completed`/`failure` → exit 1
   - check `in_progress`, commit com 10 min → exit 0
   - check `in_progress`, commit com 90 min → exit 1, com `::error::`
   - sem check, commit com 10 min → exit 0
   - sem check, commit com 90 min → exit 1

   Mostre o `gh` falso usado. Se o `date -d` do Git Bash não aceitar o formato, reporte; não mude a
   lógica para contornar.
4. Dívidas e linha do 035 no README da fase.
   → verify: as quatro dívidas coladas com "fecha quando".
5. Qualidade.
   → verify: `npx prettier --write` nos arquivos editados; depois `npm run lint`,
   `npm run format:check`, `npm run test:coverage` e `npm run build` com as saídas coladas. Leia a
   do build. `git status --short` final colado.

## Critérios de aceitação

- [x] `plans/README.md` sem frase que dê o 034 como pendente
- [x] Script `deploy` = `vitest run tests/content && npm run build && wrangler deploy`
- [x] ADR-0009 ponto 4 emendado com data e origem; `README.md` sem chamar o `deploy` de "mais estrito" sem ressalva
- [x] Portão de conteúdo provado reprovando o erro injetado, com `content/` revertido
- [x] Vigia reprova check não concluído em commit com mais de 60 min, com a razão comentada; `idade` calculada uma vez
- [x] ADR-0011 item 4 com os dois casos (ausente > 30 min; não concluído > 60 min)
- [x] Os seis cenários do vigia exercitados com `gh` falso, script extraído do workflow por programa
- [x] Quatro dívidas registradas no README da fase, com "fecha quando"; linha do 035 na tabela
- [x] `npm run lint`, `npm run format:check`, `npm run test:coverage` e `npm run build` verdes
- [x] `PRD.md` intocado; `Status:` em `TODO`
- [ ] CI e Workers Builds com `success` no commit empurrado (orquestrador) — não se aplica a este
      executor: nenhum commit foi feito nesta execução, por instrução do despacho.

## Evidência

Ambiente: Windows, Git Bash (`/s/Projetos/academic_page/haroldo`), Node/npm do projeto, sem
commit/push em nenhum momento desta execução.

### Passo 1 — `plans/README.md`

```
$ grep -n "sobra o\|o próximo é o" plans/README.md
```

(saída vazia — nenhuma das duas frases restou)

### Passo 2 — script `deploy`, ADR-0009 e `README.md`

(a) Script `deploy` em `package.json`:

```
$ grep -n '"deploy"' package.json
20:    "deploy": "vitest run tests/content && npm run build && wrangler deploy"
```

`grep -n "mais estrito" README.md docs/adr/0009*` (depois da edição) — saída vazia: nenhuma
menção ao `deploy` como "mais estrito" sem ressalva sobrou.

(b) Prova sem publicar de que o portão de conteúdo barra antes do build. `content/` estava limpo
antes da injeção (`git status --short content/` sem saída). Injetado em
`content/disciplinas/2025.1-mecanica-classica.md`:

```yaml
aulas:
  - {}
```

```
$ npx vitest run tests/content
 RUN  v4.1.11 S:/Projetos/academic_page/haroldo

 ❯ tests/content/conteudo-valido.test.ts (2 tests | 1 failed) 27ms
     × todo arquivo passa no schema Zod correspondente, com projetos.linha_relacionada resolvida 24ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  tests/content/conteudo-valido.test.ts > conteúdo real de content/ — validação Zod com referência resolvida (F-09, dívida 5) > todo arquivo passa no schema Zod correspondente, com projetos.linha_relacionada resolvida
AssertionError: expected [ …(3) ] to deeply equal []

- Expected
+ Received

- []
+ [
+   "content/disciplinas/2025.1-mecanica-classica.md → campo 'aulas.0.numero': Invalid input: expected number, received undefined",
+   "content/disciplinas/2025.1-mecanica-classica.md → campo 'aulas.0.titulo': Invalid input: expected string, received undefined",
+   "content/disciplinas/2025.1-mecanica-classica.md → campo 'aulas.0.url': Invalid input: expected string, received undefined",
+ ]

 ❯ tests/content/conteudo-valido.test.ts:161:19
    159|     }
    160|
    161|     expect(erros).toEqual([]);
       |                   ^
    162|   });
    163| });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯


 Test Files  1 failed | 3 passed (4)
      Tests  1 failed | 107 passed (108)
   Start at  22:46:14
   Duration  854ms (transform 1.34s, setup 0ms, import 2.19s, tests 64ms, environment 0ms)

EXIT_CODE=1
```

Revertido e conferido:

```
$ git checkout -- content/disciplinas/2025.1-mecanica-classica.md && git status --short
 M README.md
 M docs/adr/0009-build-de-pipeline-sem-cloud-check.md
 M package.json
 M plans/README.md
?? plans/fase-2-pipeline-de-publicacao/035-correcoes-da-revisao-de-integracao-da-fase-2.md

$ git status --short content/
```

(a segunda chamada, restrita a `content/`, não imprime nada — `content/` voltou limpo. `npm run
deploy` e `wrangler deploy` não foram executados em nenhum momento.)

### Passo 3 — vigia: regra do check não concluído

Diff do `run:` do workflow (`git diff` depois da edição):

```
$ git diff -- .github/workflows/vigia-do-deploy.yml
diff --git a/.github/workflows/vigia-do-deploy.yml b/.github/workflows/vigia-do-deploy.yml
index f27c249..9b5f61f 100644
--- a/.github/workflows/vigia-do-deploy.yml
+++ b/.github/workflows/vigia-do-deploy.yml
@@ -28,7 +28,8 @@ jobs:
           set -euo pipefail
           sha=$(gh api "repos/$REPO/commits/main" --jq .sha)
           data=$(gh api "repos/$REPO/commits/$sha" --jq .commit.committer.date)
-          echo "commit: $sha ($data)"
+          idade=$(( $(date +%s) - $(date -d "$data" +%s) ))
+          echo "commit: $sha ($data), $(( idade / 60 )) min atras"
 
           check=$(gh api --method GET "repos/$REPO/commits/$sha/check-runs" -f check_name="$CHECK" \
             --jq '.check_runs[0] // empty | [.status, (.conclusion // "-"), .details_url] | @tsv')
@@ -37,7 +38,6 @@ jobs:
           # ha mais de 30 min, o build nao foi registrado — sintoma do app GitHub <-> Cloudflare
           # desconectado (plano 025).
           if [ -z "$check" ]; then
-            idade=$(( $(date +%s) - $(date -d "$data" +%s) ))
             if [ "$idade" -gt 1800 ]; then
               echo "::error::Nenhum '$CHECK' em $sha, $(( idade / 60 )) min depois do commit."
               exit 1
@@ -50,7 +50,15 @@ jobs:
           echo "check: status=$status conclusion=$conclusao"
           echo "build: $url"
 
+          # 60 min, nao 30, para o check que nunca chega a `completed`: o §7.4 da teto de 20 min por
+          # build e so 1 build simultaneo no plano gratuito, entao saves em sequencia enfileiram — um
+          # limite menor daria alarme falso numa fila legitima, e com uma execucao por dia o custo de
+          # esperar mais e nulo.
           if [ "$status" != "completed" ]; then
+            if [ "$idade" -gt 3600 ]; then
+              echo "::error::Check '$CHECK' de $sha preso em '$status' ha $(( idade / 60 )) min. Log: $url"
+              exit 1
+            fi
             echo "Build ainda em andamento."
             exit 0
           fi
```

`idade` passou a ser calculada uma vez só, antes dos dois ramos (ausente e não concluído).
ADR-0011, item 4, reescrito com os dois casos (ausente > 30 min; não concluído > 60 min), emenda
datada de 2026-09-12.

O script do `run:` foi extraído do YAML **por programa** (não redigitado), com
`~/anaconda3/python.exe` e `yaml.safe_load`, para
`.../scratchpad/vigia-script.sh`:

```
$ ~/anaconda3/python.exe - <<'PYEOF'
import yaml
with open(".github/workflows/vigia-do-deploy.yml", encoding="utf-8") as f:
    data = yaml.safe_load(f)
run = data["jobs"]["build-de-deploy"]["steps"][0]["run"]
out_path = r"C:/Users/andne/AppData/Local/Temp/claude/S--Projetos-academic-page-haroldo/61d10e59-4be4-4d8c-b962-6f7d003843e8/scratchpad/vigia-script.sh"
with open(out_path, "w", encoding="utf-8", newline="\n") as f:
    f.write("#!/bin/bash\n")
    f.write(run)
print("extracted", len(run), "chars to", out_path)
PYEOF
extracted 1766 chars to C:/Users/andne/AppData/Local/Temp/claude/S--Projetos-academic-page-haroldo/61d10e59-4be4-4d8c-b962-6f7d003843e8/scratchpad/vigia-script.sh
```

Conteúdo extraído (idêntico ao `run:` do workflow, byte a byte, mais o shebang acrescentado pelo
script de extração):

```bash
#!/bin/bash
set -euo pipefail
sha=$(gh api "repos/$REPO/commits/main" --jq .sha)
data=$(gh api "repos/$REPO/commits/$sha" --jq .commit.committer.date)
idade=$(( $(date +%s) - $(date -d "$data" +%s) ))
echo "commit: $sha ($data), $(( idade / 60 )) min atras"

check=$(gh api --method GET "repos/$REPO/commits/$sha/check-runs" -f check_name="$CHECK" \
  --jq '.check_runs[0] // empty | [.status, (.conclusion // "-"), .details_url] | @tsv')

# O check aparece segundos depois do push, ja `in_progress` (visto no plano 028). Sem check
# ha mais de 30 min, o build nao foi registrado — sintoma do app GitHub <-> Cloudflare
# desconectado (plano 025).
if [ -z "$check" ]; then
  if [ "$idade" -gt 1800 ]; then
    echo "::error::Nenhum '$CHECK' em $sha, $(( idade / 60 )) min depois do commit."
    exit 1
  fi
  echo "Sem '$CHECK' ainda, commit com $(( idade / 60 )) min: build em andamento."
  exit 0
fi

IFS=$'\t' read -r status conclusao url <<< "$check"
echo "check: status=$status conclusion=$conclusao"
echo "build: $url"

# 60 min, nao 30, para o check que nunca chega a `completed`: o §7.4 da teto de 20 min por
# build e so 1 build simultaneo no plano gratuito, entao saves em sequencia enfileiram — um
# limite menor daria alarme falso numa fila legitima, e com uma execucao por dia o custo de
# esperar mais e nulo.
if [ "$status" != "completed" ]; then
  if [ "$idade" -gt 3600 ]; then
    echo "::error::Check '$CHECK' de $sha preso em '$status' ha $(( idade / 60 )) min. Log: $url"
    exit 1
  fi
  echo "Build ainda em andamento."
  exit 0
fi
case "$conclusao" in
  success | neutral | skipped) echo "Build de deploy verde." ;;
  *)
    echo "::error::Build de deploy de $sha terminou '$conclusao'. O site segue na versao anterior. Log: $url"
    exit 1
    ;;
esac
```

`gh` falso usado (`.../scratchpad/gh`), respostas fixas por variável de ambiente,
distinguindo as três chamadas do script pelo sufixo do endpoint (`/main`, `/check-runs`, ou nem
um nem outro → a chamada de data):

```bash
#!/bin/bash
# Fake `gh` para exercitar localmente o script `run:` extraido de
# .github/workflows/vigia-do-deploy.yml (plano 035). Respostas fixas por variavel de ambiente:
#   FAKE_SHA   - sha devolvido para "repos/$REPO/commits/main"
#   FAKE_DATE  - data devolvida para "repos/$REPO/commits/$FAKE_SHA"
#   FAKE_CHECK - tsv (status\tconclusion\turl) ou vazio, devolvido para o endpoint check-runs
if [ "$1" != "api" ]; then
  echo "fake gh: comando nao suportado: $*" >&2
  exit 2
fi
path=""
for a in "$@"; do
  case "$a" in
    repos/*) path="$a" ;;
  esac
done
case "$path" in
  */main) printf '%s' "$FAKE_SHA" ;;
  */check-runs) printf '%s' "$FAKE_CHECK" ;;
  *) printf '%s' "$FAKE_DATE" ;;
esac
```

Runner dos seis cenários (`.../scratchpad/run-cenarios.sh`), `PATH` com o `gh` falso na frente,
`REPO` e `CHECK` definidos:

```bash
#!/bin/bash
# Roda os seis cenarios do vigia contra o script extraido por programa de
# .github/workflows/vigia-do-deploy.yml, usando o `gh` falso deste diretorio.
set -u
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
export PATH="$HERE:$PATH"
export REPO="test-org/test-repo"
export CHECK="Workers Builds: haroldo-page"
export FAKE_SHA="deadbeef"

run_cenario() {
  local nome="$1" idade_min="$2" fake_check="$3"
  echo "=== $nome ==="
  export FAKE_DATE
  FAKE_DATE=$(date -u -d "-${idade_min} minutes" +"%Y-%m-%dT%H:%M:%SZ")
  export FAKE_CHECK="$fake_check"
  bash "$HERE/vigia-script.sh"
  echo "exit code: $?"
  echo
}

run_cenario "check completed/success" 5 "$(printf 'completed\tsuccess\thttps://example/build/1')"
run_cenario "check completed/failure" 5 "$(printf 'completed\tfailure\thttps://example/build/2')"
run_cenario "check in_progress, commit com 10 min" 10 "$(printf 'in_progress\t-\thttps://example/build/3')"
run_cenario "check in_progress, commit com 90 min" 90 "$(printf 'in_progress\t-\thttps://example/build/4')"
run_cenario "sem check, commit com 10 min" 10 ""
run_cenario "sem check, commit com 90 min" 90 ""
```

Saída dos seis cenários:

```
$ bash run-cenarios.sh
=== check completed/success ===
commit: deadbeef (2026-09-13T01:43:11Z), 5 min atras
check: status=completed conclusion=success
build: https://example/build/1
Build de deploy verde.
exit code: 0

=== check completed/failure ===
commit: deadbeef (2026-09-13T01:43:11Z), 5 min atras
check: status=completed conclusion=failure
build: https://example/build/2
::error::Build de deploy de deadbeef terminou 'failure'. O site segue na versao anterior. Log: https://example/build/2
exit code: 1

=== check in_progress, commit com 10 min ===
commit: deadbeef (2026-09-13T01:38:11Z), 10 min atras
check: status=in_progress conclusion=-
build: https://example/build/3
Build ainda em andamento.
exit code: 0

=== check in_progress, commit com 90 min ===
commit: deadbeef (2026-09-13T00:18:11Z), 90 min atras
check: status=in_progress conclusion=-
build: https://example/build/4
::error::Check 'Workers Builds: haroldo-page' de deadbeef preso em 'in_progress' ha 90 min. Log: https://example/build/4
exit code: 1

=== sem check, commit com 10 min ===
commit: deadbeef (2026-09-13T01:38:12Z), 10 min atras
Sem 'Workers Builds: haroldo-page' ainda, commit com 10 min: build em andamento.
exit code: 0

=== sem check, commit com 90 min ===
commit: deadbeef (2026-09-13T00:18:12Z), 90 min atras
::error::Nenhum 'Workers Builds: haroldo-page' em deadbeef, 90 min depois do commit.
exit code: 1
```

Os seis exit codes batem com o pedido pelo plano: `completed`/`success` → 0; `completed`/`failure`
→ 1; `in_progress` com 10 min → 0; `in_progress` com 90 min → 1 com `::error::`; sem check com 10
min → 0; sem check com 90 min → 1. O `date -d` do Git Bash (GNU coreutils) aceitou o formato ISO
8601 sem ajuste.

### Passo 4 — dívidas e linha do 035

```
$ grep -n "Fecha quando" plans/fase-2-pipeline-de-publicacao/README.md
236:  regra). **Fecha quando:** aparecer ao menos uma execução `event: schedule` no histórico do
256:  **Fecha quando:** alguém corrigir a frase de passagem, no próximo plano que tocar esse arquivo.
261:  `Branch not protected`. O TinaCloud empurra direto na `main`. **Fecha quando:** o §11 for corrigido
267:  herda essa seção como roteiro se ninguém atualizar antes. **Fecha quando:** a seção for reescrita
281:  passagens, por instrução explícita de registrar, não consertar. **Fecha quando:** as três
290:  rejeição. **Fecha quando:** a célula do "Plano B" no §7.4 referenciar o ADR-0011.
```

(as duas primeiras linhas, 236 e 256, são dívidas pré-existentes; 261, 267, 281 e 290 são as
quatro novas deste plano — as linhas 275/281 do ciclo 1 mudaram de número e de texto no ciclo 2,
por causa da correção dos bloqueantes 1 e 3 da revisão. A linha do 035 foi acrescentada à tabela de
Estado, `⬜ TODO`, agente, implementer, commits `—`.)

### Passo 5 — Qualidade

`npx prettier --write` nos arquivos editados fora de `plans/` (que está no `.prettierignore` do
projeto — `package.json`, `README.md`, os dois ADRs e o workflow):

```
$ npx prettier --write package.json README.md plans/README.md plans/fase-2-pipeline-de-publicacao/README.md docs/adr/0009-build-de-pipeline-sem-cloud-check.md docs/adr/0011-vigia-agendado-da-falha-de-build.md .github/workflows/vigia-do-deploy.yml plans/fase-2-pipeline-de-publicacao/035-correcoes-da-revisao-de-integracao-da-fase-2.md
package.json 11ms (unchanged)
README.md 77ms (unchanged)
docs/adr/0009-build-de-pipeline-sem-cloud-check.md 24ms (unchanged)
docs/adr/0011-vigia-agendado-da-falha-de-build.md 14ms (unchanged)
.github/workflows/vigia-do-deploy.yml 14ms (unchanged)
```

(os arquivos em `plans/` não aparecem porque `.prettierignore` exclui `plans/` inteiro — decisão
já existente no projeto, não deste plano.)

```
$ npm run lint

> haroldo-page@0.1.0 lint
> eslint .

LINT_EXIT=0
```

```
$ npm run format:check

> haroldo-page@0.1.0 format:check
> prettier --check .

Checking formatting...
All matched files use Prettier code style!
FORMAT_EXIT=0
```

```
$ npm run test:coverage

> haroldo-page@0.1.0 test:coverage
> vitest run --coverage


 RUN  v4.1.11 S:/Projetos/academic_page/haroldo
      Coverage enabled with v8


 Test Files  6 passed (6)
      Tests  122 passed (122)
   Start at  22:49:32
   Duration  960ms (transform 1.55s, setup 0ms, import 2.51s, tests 81ms, environment 0ms)

 % Coverage report from v8
-------------------|---------|----------|---------|---------|-------------------
File               | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s
-------------------|---------|----------|---------|---------|-------------------
-------------------|---------|----------|---------|---------|-------------------

=============================== Coverage summary ===============================
Statements   : 100% ( 32/32 )
Branches     : 100% ( 4/4 )
Functions    : 100% ( 2/2 )
Lines        : 100% ( 31/31 )
================================================================================
TEST_COVERAGE_EXIT=0
```

```
$ npm run build

> haroldo-page@0.1.0 build
> tinacms build && astro check && astro build

Starting Tina build
...
○  Tina build complete
...
[content] Syncing content
[content] Synced content
[types] Generated 426ms
[check] Getting diagnostics for Astro files in S:\Projetos\academic_page\haroldo...
Result (19 files):
- 0 errors
- 0 warnings
- 0 hints

[content] Syncing content
[content] Synced content
[types] Generated 401ms
[build] output: "static"
[build] mode: "static"
[build] directory: S:\Projetos\academic_page\haroldo\dist\
[build] Collecting build info...
[build] ✓ Completed in 434ms.
[build] Building static entrypoints...
[vite] ✓ built in 173ms
[vite] ✓ built in 40ms
[build] Rearranging server assets...
 generating static routes
  ├─ /index.html (+8ms)
✓ Completed in 18ms.
[build] ✓ Completed in 260ms.
[build] 1 page(s) built in 703ms
[build] Complete!
BUILD_EXIT=0
```

`git status --short` final:

```
$ git status --short
 M .github/workflows/vigia-do-deploy.yml
 M README.md
 M docs/adr/0009-build-de-pipeline-sem-cloud-check.md
 M docs/adr/0011-vigia-agendado-da-falha-de-build.md
 M package.json
 M plans/README.md
 M plans/fase-2-pipeline-de-publicacao/README.md
?? plans/fase-2-pipeline-de-publicacao/035-correcoes-da-revisao-de-integracao-da-fase-2.md
```

Nenhum outro arquivo fora da lista "Arquivos afetados" foi tocado. `PRD.md` não aparece —
intocado. `dist/`, `tina/__generated__/` e `public/admin/index.html`, gerados pelo `npm run
build`, não aparecem porque já estão no `.gitignore` do projeto (nada deste plano mudou isso).

### O que NÃO foi rodado

`npm run deploy` e `wrangler deploy` **não foram executados em nenhum momento** desta execução,
por proibição explícita do plano (publicaria o disco local em produção). Nenhum commit ou push
foi feito; `Status:` continua `TODO`.

### Correções da revisão de integração — ciclo 2 (2026-09-12)

A revisão reprovou só por texto (código do vigia e do deploy aprovados, com script extraído e
cenários repetidos pelo próprio revisor). Cinco itens corrigidos, todos dentro dos arquivos já
listados em "Arquivos afetados":

**1 (bloqueante) — README da fase, dívida do §7.4.** Removido "que decide contra esse caminho
justamente por isso": o ADR-0011 rejeita mover o deploy para o GitHub Actions porque isso "desfaz o
plano 025 para resolver um problema de notificação" (Alternativas consideradas), não pela mudança
de nome do check — essa aparece só em "Gatilhos de revisão". O texto agora cita a razão real e
separa a menção ao nome do check como gatilho, não como motivo da rejeição.

**2 (bloqueante) — Evidência do 035, Passo 4.** "as três primeiras linhas, 236 e 256" corrigido
para "as duas primeiras linhas, 236 e 256" — só duas linhas foram listadas ali. O bloco de saída do
`grep` também foi regerado (os números das quatro dívidas novas mudaram por causa dos itens 1 e 3
abaixo).

**3 (bloqueante) — README da fase, dívida do "portão pré-push".** Separado em dois casos: as três
passagens que usam o nome (confirmadas por grep) e a seção Qualidade do `README.md` (que descreve o
mesmo `npm run build` como passo anterior ao PR sem usar o rótulo). O "fecha quando" passou a cobrir
os dois. Grep usado, rodado antes de escrever o texto novo:

```
$ grep -n "pré-push" README.md docs/adr/0009-build-de-pipeline-sem-cloud-check.md plans/fase-2-pipeline-de-publicacao/README.md
README.md:86:| `npm run build:pipeline` | Usado pelos pipelines automáticos (GitHub Actions e, a partir do plano 025, Cloudflare Workers Builds). Tem a mais `vitest run tests/content` antes do build, e a menos o cloud check do TinaCloud (`tinacms build --skip-cloud-checks` em vez de `tinacms build`) — ver `docs/adr/0009-build-de-pipeline-sem-cloud-check.md`. **Não substitui** `npm run build` como portão pré-push local |
docs/adr/0009-build-de-pipeline-sem-cloud-check.md:58:   muda — continua o portão pré-push obrigatório de todo plano que mexa em schema, na mesma ordem
plans/fase-2-pipeline-de-publicacao/README.md:118:| 1 | Acoplamento com o TinaCloud no build (`ERR_CLOUD_CHECK_FAILED` sem humano para ordenar os passos) | **024** (+ ADR-0009), verificada em **025** e **026** | Os dois pipelines automáticos rodam `tinacms build --skip-cloud-checks`; o `npm run build` local **mantém** o cloud check e continua sendo o portão pré-push de quem mexe em schema |
```

Só três passagens usam o nome "portão pré-push" — nenhuma quarta apareceu. A seção Qualidade do
`README.md` (linhas 294-303, "Antes de abrir um PR, rode…") foi conferida separadamente por leitura
direta: não usa o rótulo, mas descreve o mesmo `npm run build` como passo anterior ao PR.

**4 (não bloqueante) — README da fase, dívida da "Verificação autoritativa".** Apontamento
recalculado por grep **depois** das correções dos itens 1 e 3 acima, que voltaram a deslocar as
linhas:

```
$ grep -n "^## Verificação autoritativa" -A 25 plans/fase-2-pipeline-de-publicacao/README.md
368:## Verificação autoritativa
...
386:fase 1. Enquanto o plano 030 não fechar, quem lê a saída é você. Depois dele, o portão passa a ser
...
392:## Portão de qualidade
```

Apontamento trocado de `≈:335-352` (defasado pelas edições do ciclo 1) para `≈:368-386`.

**5 (não bloqueante) — ADR-0011, Consequências.** Acrescentado ao item "Falso alarme improvável,
mas possível" o caso do limite de 60 min: um commit feito mais de 60 min antes do push, com o
build ainda `queued`/`in_progress` às 12:17 UTC (fila legítima do plano gratuito), também reprova
sem que o build tenha de fato falhado.

**Qualidade, depois das cinco correções:**

```
$ npx prettier --write docs/adr/0011-vigia-agendado-da-falha-de-build.md plans/fase-2-pipeline-de-publicacao/README.md plans/fase-2-pipeline-de-publicacao/035-correcoes-da-revisao-de-integracao-da-fase-2.md
docs/adr/0011-vigia-agendado-da-falha-de-build.md 47ms (unchanged)
```

(os dois arquivos em `plans/` não aparecem — `.prettierignore` exclui `plans/` inteiro, decisão
já existente no projeto.)

```
$ npm run format:check

> haroldo-page@0.1.0 format:check
> prettier --check .

Checking formatting...
All matched files use Prettier code style!
FORMAT_EXIT=0
```

Como só texto mudou (nenhum código de `package.json` ou do workflow foi tocado neste ciclo), a
suíte completa (`lint`, `test:coverage`, `build`) não foi rerodada — instrução do despacho do ciclo
2. O comentário de 4 linhas do workflow e a tabela de Estado não foram tocados, por instrução
explícita: ficam com o orquestrador na promoção.

`git status --short` depois do ciclo 2 (mesmos sete arquivos do ciclo 1, nenhum novo):

```
$ git status --short
 M .github/workflows/vigia-do-deploy.yml
 M README.md
 M docs/adr/0009-build-de-pipeline-sem-cloud-check.md
 M docs/adr/0011-vigia-agendado-da-falha-de-build.md
 M package.json
 M plans/README.md
 M plans/fase-2-pipeline-de-publicacao/README.md
?? plans/fase-2-pipeline-de-publicacao/035-correcoes-da-revisao-de-integracao-da-fase-2.md
```

Nenhum commit, nenhum push, `npm run deploy`/`wrangler deploy` não rodados, `Status:` continua
`TODO`.
