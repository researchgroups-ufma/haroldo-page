# Plano 028 — Notificação de falha de build ao ADMIN, demonstrada com uma falha real

**Status:** TODO
**RFs cobertos:** **F-02**, **F-09**, RNF-04, R-01; fluxo E da §8.1; fase 2, **item 6** do §12
**Depende de:** planos **025** (Workers Builds no ar) e **030** (o portão de conteúdo é o que
produz a mensagem legível que este plano demonstra)
**Modelo recomendado:** — (execução humana: painel da Cloudflare, caixa de e-mail, push
controlado na `main`)
**Agente recomendado:** nenhum
**Executável por:** **orquestrador** — exige configuração de notificação no painel da Cloudflare,
acesso à caixa de e-mail do ADMIN e um push deliberadamente quebrado na `main`, revertido em
seguida. **Não depende do professor.**
**PRD:** `S:\Projetos\academic_page\haroldo\PRD.md`
**Projeto:** `S:\Projetos\academic_page\haroldo`

## Objetivo

Quando um build de deploy falha, três coisas acontecem e ficam **provadas com artefato**: o site
continua no ar com a versão anterior (RNF-04), o ADMIN recebe notificação (F-02) e o log da falha
nomeia **o arquivo e o campo** que quebraram (F-09).

Não é um plano de configuração — é um plano de **experimento controlado**. A configuração sem a
falha real prova apenas que existe um formulário preenchido.

## Arquivos afetados

- **Nenhum arquivo de código permanente.**
- `content/**` — **um** arquivo recebe conteúdo deliberadamente inválido, é empurrado para a
  `main`, e é **revertido no mesmo dia**, assim que a notificação e o log forem capturados.

> O arquivo quebrado vai para a `main` de propósito. **Planeje a reversão antes de empurrar**:
> tenha o comando de revert pronto e o commit de volta preparado. O repositório é público e o
> site fica com a versão anterior no ar durante a janela — é exatamente o comportamento que se
> quer provar, mas a janela tem de ser curta e registrada com horários.

## Contexto necessário

**Projeto.** `haroldo-page` — Astro 7 estático + TinaCMS, deploy pelo Cloudflare Workers Builds a
cada push na `main` (plano 025), rodando `npm run build:pipeline` (plano 024, ADR-0009):

```
vitest run tests/content && tinacms build --skip-cloud-checks && astro check && astro build
```

**O que o PRD exige, literalmente:**

- **F-02:** "Build falha após um salvamento do professor → a versão anterior do site permanece no
  ar; o ADMIN recebe notificação de falha; o conteúdo salvo permanece no repositório para
  correção. **Nenhuma mensagem ao professor** (o site dele continua no ar); alerta por e-mail ao
  ADMIN."
- **RNF-04:** "Um build com erro mantém a versão anterior no ar e notifica o ADMIN."
- **F-09:** "Conteúdo salvo com formato inesperado que a validação Zod rejeita → o build falha de
  forma ruidosa e **nomeia o arquivo e o campo** problemático; cai em F-02." Exemplo do PRD:
  `content/publicacoes/x.md → campo 'ano': esperado número entre 1900 e 2100`.
- **§8.2:** mensagens ao desenvolvedor (logs de build) são "específicas e rastreáveis — arquivo,
  campo e valor esperado".
- **Fluxo E da §8.1:** professor salva → build falha → site continua no ar → ADMIN é notificado →
  corrige → build volta a passar.

### O erro a injetar — use o erro **real** do professor, não um erro sintético

A dívida 3 da fase 1 documenta que o painel **deixa salvar item de lista embutida com subcampo
obrigatório vazio**, e o Zod só rejeita no build. Instâncias conhecidas: `aulas[]`, `listas[]`,
`materiais[]`, `bibliografia[]`, `scripts[].titulo`, `scripts[].codigo` e — desde o plano 021, a
primeira em lista de string simples — `publicacoes.autores[]`.

**Injete exatamente isso.** Um `aulas: [ {} ]` numa disciplina existente reproduz, byte a byte, o
que o professor consegue produzir sozinho pelo painel. Um erro inventado (YAML malformado, campo
que não existe) provaria outra coisa.

Registre na Evidência **por que** este erro e não outro.

### Dois canais de notificação, e só um deles importa para F-02

1. **Cloudflare Workers Builds** — é o build **do deploy**. É ele que decide se o site atualiza.
   A notificação da Cloudflare é a que satisfaz F-02/RNF-04. Configure-a para o e-mail do ADMIN
   (`and.near@hotmail.com`, §4.2).
2. **GitHub Actions** — roda em paralelo, não é portão do deploy (ADR-0009, plano 025). O GitHub
   envia e-mail de falha ao autor do commit por padrão. Registre se chegou e em quanto tempo, mas
   **não o aceite como o canal de F-02**: um CI vermelho não impede nem provoca deploy.

Se a Cloudflare não oferecer notificação de build no plano gratuito, **isso é um achado que muda o
desenho** — registre a tela literal e pare; a alternativa (uma action de notificação no GitHub, ou
mover o deploy para o GitHub Actions, plano B da §7.4) é decisão nova, não conserto de passagem.

### Duas coisas para conferir com cuidado no log

1. **O passo que falha.** Com o portão do plano 030 na frente do build, quem deve reprovar é o
   `vitest run tests/content` — com mensagem que nomeia arquivo e campo. Se quem reprovar for o
   `astro check`/`astro build`, registre **as duas** mensagens e compare qual delas o PRD
   chamaria de legível (F-09, §8.2).
2. **O exit code não basta.** O `astro check` já foi flagrado imprimindo `[ERROR] [content]` e
   encerrando com `0 errors` e exit 0 (planos 020 e 021). **Leia o corpo do log**, não só o
   veredito do painel.

### O que este plano NÃO faz

- ⛔ **Não escreve o portão de conteúdo** — é o plano 030.
- ⛔ **Não mexe no `ci.yml`** nem em `package.json`.
- ⛔ **Não escreve o manual do professor** — os avisos consolidados são o plano 033, entrega para
  a fase 5.
- ⛔ **Não cronometra o ciclo feliz** (M-02 é o plano 029).
- ⛔ **Não expõe o professor ao erro.** F-02 é explícito: nenhuma mensagem a ele. Se o experimento
  for feito enquanto o professor tiver acesso, avise-o **antes** de que haverá uma janela de teste.

**Ambiente.** Windows 11 / PowerShell. ADMIN: desenvolvedor (`and.near@hotmail.com`).

## Passos

1. 🧑 Configurar, no painel da Cloudflare, a notificação de **falha de build** do Workers Builds
   para o e-mail do ADMIN.
   → verify: cole o que o painel mostra na notificação criada — evento, destino, estado.
2. 🤖/🧑 Registrar a linha de base **antes** de quebrar: id da versão publicada hoje, horário, e
   `curl.exe -sI https://haroldo-page.and-near.workers.dev/` com o `etag`/status.
   → verify: os três valores colados. Sem isso não se prova que a versão anterior permaneceu.
3. 🤖/🧑 Preparar o commit quebrado **e o de reversão**, nesta ordem, antes de empurrar qualquer
   coisa: acrescentar `aulas: [ {} ]` (item com `numero`, `titulo` e `url` vazios) a
   `content/disciplinas/2025.1-mecanica-classica.md`, e confirmar localmente que
   `npx vitest run tests/content` reprova nomeando arquivo e campo.
   → verify: a saída local do vitest colada — é a mensagem que se espera ver no log do build.
4. 🧑 Empurrar o commit quebrado para a `main`, anotando o horário exato.
   → verify: SHA e horário colados.
5. 🧑 Acompanhar o build do Workers Builds até falhar.
   → verify: cole (a) o status final, (b) **o trecho do log com a mensagem de erro**, (c) qual
   passo do `build:pipeline` reprovou e (d) a duração.
6. 🧑 Provar **F-02/RNF-04** enquanto a `main` ainda está quebrada: o site continua no ar com a
   versão anterior.
   → verify: `curl.exe -sI` na raiz devolvendo 200, o id de versão publicada **igual** ao da linha
   de base do passo 2, e o horário da conferência. Confirme também que o arquivo inválido
   **permanece no repositório** (F-02: "o conteúdo salvo permanece para correção").
7. 🧑 Capturar a notificação: e-mail recebido pelo ADMIN.
   → verify: cole remetente, assunto, horário de chegada e o trecho do corpo que identifica o
   projeto e o build. **Calcule e registre o atraso** entre a falha (passo 5) e a chegada. Registre
   também se chegou e-mail do GitHub Actions, e em quanto tempo — como canal secundário.
8. 🧑 Reverter: empurrar o commit de reversão e confirmar que o build volta a passar e publica.
   → verify: SHA da reversão, build verde, **id de versão novo**, horário. Cole a janela total em
   que a `main` ficou quebrada.
9. 🧑 Julgar a legibilidade da mensagem contra F-09 e §8.2 e registrar o veredito, com a mensagem
   literal.
   → verify: a mensagem nomeia **arquivo** e **campo**? Se sim, F-09 está satisfeito e a evidência
   é o texto. Se não, **registre a lacuna como pendência nomeada** — para o plano 033 (avisos do
   manual) e para a fase 5 — em vez de improvisar melhoria de mensagem aqui.

## Critérios de aceitação

- [ ] Notificação de falha de build configurada na Cloudflare para o e-mail do ADMIN, com a tela
      do painel transcrita
- [ ] Linha de base registrada antes do experimento: id de versão, horário e resposta HTTP
- [ ] Falha injetada com o **erro real do professor** (`aulas: [ {} ]`), com a justificativa
      registrada
- [ ] Build de deploy **falhou**, com log colado, passo identificado e duração
- [ ] **RNF-04 provado:** site respondendo 200 com o **mesmo id de versão** da linha de base
      durante a janela de falha, com horário
- [ ] **F-02 provado:** e-mail de falha recebido pelo ADMIN — remetente, assunto, horário e atraso
      calculado; e o arquivo inválido permanecendo no repositório
- [ ] Canal secundário (GitHub Actions) registrado, sem ser tratado como o canal de F-02
- [ ] **F-09 avaliado com a mensagem literal**: veredito explícito sobre nomear arquivo e campo;
      lacuna, se houver, registrada como pendência nomeada
- [ ] Reversão empurrada, build verde e **versão nova publicada**, com a janela total de quebra
      registrada
- [ ] `git status --short` limpo ao final; `content/**` de volta ao estado válido
- [ ] §12 do PRD (item 6 da fase 2) e o README da fase 2 atualizados pelo orquestrador ao promover
      `Status: DONE`
- [ ] CI do GitHub Actions com `conclusion: success` no commit de reversão

## Evidência

<Preenchida por quem executar. O experimento sem os horários não prova F-02: "a notificação
chegou" precisa de quando falhou e quando chegou. E o log lido, não só o exit code — o `astro
check` deste projeto já imprimiu `[ERROR]` com exit 0 duas vezes.>
