# Blocos canônicos de despacho

Regras que **todo** despacho de agente no `/executar-plano` carrega, escritas uma vez para não
serem redigitadas a cada plano. O orquestrador referencia este arquivo pelo caminho absoluto e
escreve no prompt só o que é específico do plano.

> **Por que existe:** até o plano 048 cada despacho era redigitado do zero, com ~1500 tokens de
> regras idênticas. Isso custava tokens e, pior, produzia omissões — no 048 o orquestrador
> esqueceu de pedir a inserção da seção do navegador e depois afirmou à revisão que ela estava lá.
> O arquivo versionado remove as duas coisas: o custo e o esquecimento.

**Como usar, no prompt do agente:**

> Leia `S:\Projetos\academic_page\haroldo\plans\DESPACHO.md`, seção "Para o executor"
> (ou "Para o triage-runner" / "Para o revisor"), **inteira**, antes de começar. Ela vale como se
> estivesse escrita aqui. Abaixo vai só o que é específico deste plano.

Nenhum agente herda o contexto do orquestrador; todos leem arquivo barato.

---

## Para o executor (`implementer`)

### Escopo

1. **Toque apenas os arquivos listados em "Arquivos afetados" do plano.** Precisou de outro? **Pare
   e reporte** — ampliar escopo em execução não é decisão de executor.
2. **`git add` por caminho explícito.** Nunca `git add -A` nem `git add .`.
3. **Você não commita** e **não muda o `Status:`**, que fica `TODO`. Promoção e commit são do
   orquestrador, depois da verificação independente **e** da revisão aprovada.

### Evidência

4. **Preencha a seção `## Evidência` agora, na execução** — convenção deste projeto, diferente do
   passo 6 da skill. Os passos marcados como do orquestrador ficam para ele; diga explicitamente
   que não os rodou e por quê.
5. **Evidência é saída literal.** Nunca redigite, resuma, reformate, traduza nem anote dentro do
   bloco de código. Já reprovaram planos aqui por saída de `prettier --write` rotulada como
   `--check` e por `astro build` redigitado com horário alterado e sem os caracteres `✓`/`├─`.
6. **Capture em arquivo e insira por script.** `npm run X 2>&1 | Tee-Object -FilePath "<scratch>\x.txt"`,
   e depois um script lê o `.txt` e escreve no Markdown. Nada de copiar à mão.
7. **Ordem obrigatória:** todas as edições de código → gerar os blocos → inserir na Evidência →
   verificações finais. Um bloco colado descreve o estado **final** dos arquivos que ele descreve.
8. **Inserção na Evidência é aditiva.** Não trunque o plano no marcador `## Evidência` para
   reescrever a seção: isso apaga sem aviso qualquer seção que o orquestrador tenha inserido.
9. **Ao final, rode um verificador de fidelidade:** um script que compare cada bloco da Evidência
   com o `.txt` correspondente e imprima `OK`/`DIFERENTE` por bloco. Cole a saída no relatório.
10. **Critério de aceitação não se reescreve para caber no resultado.** Bloqueio externo → caixa
    **vazia** e bloqueio reportado. Nunca marque `[x]` o que não tem saída que demonstre.
11. **Declare, no relatório e na Evidência, tudo o que você NÃO rodou.**

### Prova

12. **Ler o código não prova comportamento neste projeto.** Critério que só se sustentaria por
    leitura exige **canário por falsificação**: quebre a regra, mostre o resultado mudando, desfaça.
13. **Reverter canário: cuidado com `git checkout --`.** Ele é o método **certo** para arquivo
    **commitado** (ex.: `content/`), e **destrutivo** para arquivo novo ainda não commitado — nesse
    caso apagaria seu trabalho inteiro. Desfaça editando o arquivo de volta.
14. **Depois de desfazer um canário, rode o build de novo** e recapture os blocos que descrevem o
    `dist/`, para nenhum bloco descrever artefato que não existe mais.

### Armadilhas medidas neste projeto

15. **`grep -c` não conta ocorrências.** O `dist/**/index.html` sai minificado em **uma linha**;
    `grep -c` conta linhas casadas e só pode devolver `0` ou `1`. Use `grep -o '<padrão>' <arq> | wc -l`.
16. **Canário de rótulo órfão escopa ao `<main>`.** O `BaseLayout` busca o perfil por conta própria
    e o rodapé renderiza em toda rota — contagem sobre a página inteira inclui cabeçalho e rodapé.
17. **`npm run dev` não sobe o painel** (Astro 7). Para ver páginas, `astro preview` sobre o build.
18. **Um build por vez no working tree.** Dois `build:pipeline` simultâneos disputam a porta 9000 do
    Tina e produzem evidência falsa. Não deixe servidor em background.
19. **No Git Bash desta máquina `python` não resolve** (alias da Microsoft Store). Use
    `~/anaconda3/python.exe`, o `.venv` do projeto, ou rode por PowerShell. PowerShell aqui é 5.1:
    **não existe** `&&`, `||`, ternário nem `??`.
20. **`plans/` e `PRD.md` estão no `.prettierignore`** (verificado por canário em 2026-09-18).
    Edição que só mexe em plano ou PRD **não** precisa de `format:check`.

### Regras de código da fase 3

Estão em `plans/fase-3-site-publico/README.md`, seção "Regras de código que todo plano desta fase
herda". Leia-a também. Em resumo: cabeçalho §10.1 do PRD em todo arquivo novo; TSDoc com o
comportamento de prop ausente; comentário com o identificador do PRD em toda regra de negócio —
**citando a cláusula que de fato descreve a regra** (a exigência está no **§10.3**,
"Comentários no Código", não no §10.4 — defeito já reincidente aqui, quatro vezes); identificadores em
inglês; sem `any`, `process.env` sob `src/`, `set:html` ou requisição a terceiro; strings de
interface só em `src/i18n/pt.ts`; links internos com barra final; **componentes** < 150 linhas
(é o que o §10.4 legisla, e como "Alvo", não invariante — arquivo de teste não entra:
`tests/lib/courses.test.ts` tem 256 linhas e `tests/content/schemas.test.ts` 503, os dois aprovados).

---

## Para o `triage-runner` (verificação autoritativa)

Você roda a suíte e **não corrige nada, não edita, não commita**.

1. **Capture cada comando em arquivo**, um de cada vez, na ordem:

   ```
   npm run lint          2>&1 | Tee-Object -FilePath "<scratch>\lint.txt"
   npm run format:check  2>&1 | Tee-Object -FilePath "<scratch>\format.txt"
   npm run test:coverage 2>&1 | Tee-Object -FilePath "<scratch>\coverage.txt"
   & { npm run build:pipeline 2>&1; Get-ChildItem <artefatos> | Select-Object FullName,Length,LastWriteTime | Out-String } | Tee-Object -FilePath "<scratch>\build.txt"
   npm audit --audit-level=high 2>&1 | Tee-Object -FilePath "<scratch>\audit.txt"
   ```

   O `Get-ChildItem` dos carimbos vai **no mesmo comando** do build: é o cruzamento que prova que o
   build veio depois da última edição do código.

2. **Não cole a saída no relatório.** Os `.txt` são a evidência e o orquestrador os lê. Devolva
   apenas: o comando, o **exit code** (`$LASTEXITCODE`), a listagem `Get-ChildItem` confirmando que
   os arquivos existem, e o veredito. *(Mudança de 2026-09-18: pedir saída colada gerava resumo em
   vez de cópia, três planos seguidos, e round-trips inúteis.)*
3. **Destaque separadamente** qualquer linha `[ERROR]` impressa pelo `astro check`, mesmo que ele
   termine com `0 errors` — já aconteceu aqui.
4. **Não é problema, não reporte como falha:** `Status: TODO` no plano (esperado nesta etapa),
   árvore com alterações não commitadas (esperado), e vulnerabilidades `moderate` no `npm audit`
   (o portão é `--audit-level=high`; o que importa é o exit code).
5. **Timeout de 600000 ms** no `build:pipeline`. Um build por vez; nada em background.
6. Veredito final: **VERDE** ou **VERMELHO**, com base só nos exit codes, nomeando o que falhou.

---

## Para o revisor (`code-reviewer`)

1. **Reproduza, não aceite.** Cada alegação da Evidência é conferida contra a fonte citada —
   inclusive a seção de `docs/identidade-visual.md` que o plano diz implementar. Quatro defeitos já
   escaparam de uma revisão que aprovou por leitura.
2. **Duvide também do próprio despacho.** O que o orquestrador afirma no prompt é **alegação a
   conferir**, não fato dado: em 2026-09-18 um despacho afirmou que uma seção estava no plano e ela
   não estava. Separe sempre "medi X" de "de X deduzo Y", e não relate dedução como observação.
3. **Não rode a suíte.** Ela já rodou, depois da última edição; leia os `.txt` capturados, não o
   resumo de quem a rodou. **Não rode nada que escreva em `dist/`** (`build`, `build:pipeline`,
   `astro check`, `astro preview`, `tinacms`) — invalida o artefato e disputa a porta 9000.
   Comandos de leitura à vontade.
4. **Conte com `grep -o ... | wc -l`**, nunca `grep -c`, sobre HTML minificado.
5. **Confira cada critério de aceitação um a um**, e diga se algum foi marcado sem prova
   suficiente. Critérios reservados ao orquestrador (navegador) ficam vazios até ele preencher —
   isso **não** é motivo de reprovação.
6. **`Status: TODO` e ausência de commit são o comportamento correto**, não defeito.
7. **Confirme o escopo pelo diff:** nada fora de "Arquivos afetados", exceto a `## Evidência` e os
   checkboxes do próprio plano.
8. **Veredito:** **APROVADO** ou **REPROVADO**. Se reprovado, lista numerada com arquivo, linha, o
   que está errado, **a fonte** (plano, §X da identidade, regra do README, item do PRD) e o que
   fazer — separando **Obrigatório** de **Observação (não bloqueia)**.

---

## Para o orquestrador (não vai em despacho — é a sua própria lista)

1. **Confirme a data local com `date`** antes de escrever o prompt; não use horário UTC de CI.
2. **Leia os passos do plano procurando comando destrutivo** antes de despachar, e diga no prompt
   qual não rodar e o que fazer no lugar. O plano foi escrito antes de o trabalho existir.
3. **Confira o corpo do plano contra as decisões mais recentes** — plano fatiado antes de uma
   sabatina fica velho mesmo com o cabeçalho atualizado.
4. **Não rode nada que escreva em `dist/` enquanto um agente estiver rodando.**
5. **A seção do orquestrador entra no plano DEPOIS do último ciclo do executor** — ou é delegada a
   ele por mensagem explícita. Nunca antes.
6. **Nunca afirme num despacho que algo está num arquivo sem abrir o arquivo.**
7. **Ao devolver correção por `SendMessage`, não cole saída de execução anterior.** Redispare o
   `triage-runner` e use a saída nova.
8. **Antes de commitar a promoção**, rode `node scripts/verificar-promocao.mjs <plano>`.
9. **Só declare DONE** com suíte verde confirmada pelo `triage-runner` **e** revisão APROVADO **e**
   CI verde no commit empurrado. As três.
