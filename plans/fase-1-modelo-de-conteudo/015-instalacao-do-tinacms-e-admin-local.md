# Plano 015 — Instalação do TinaCMS e `/admin` no ar localmente

**Status:** TODO
**RFs cobertos:** base de RF-01, RF-02, RF-03 (fase 1, itens "`tina/config.ts`" e "`/admin` funciona localmente")
**Depende de:** planos 011 (projeto TinaCloud) e 014 (Astro 7)
**Modelo recomendado:** sonnet
**Agente recomendado:** implementer
**PRD:** `S:\Projetos\academic_page\haroldo\PRD.md`
**Projeto:** `S:\Projetos\academic_page\haroldo`

## Objetivo

O TinaCMS está instalado, `tina/config.ts` existe com **uma** coleção (`perfil`), e
`http://localhost:4321/admin` abre o painel e edita `content/perfil/index.md` gravando no disco.
É a fatia vertical que prova a integração antes de qualquer schema completo.

## Arquivos afetados

- `package.json`, `package-lock.json` — dependências do Tina e scripts
- `tina/config.ts` — criar, mínimo
- `content/perfil/index.md` — criar, mínimo
- `.gitignore` — artefatos gerados pelo Tina
- `README.md` — seção do painel, hoje escrita como "fase 1, ainda inexistente"

> Não toque em `src/content.config.ts` (é o plano 016) nem em `astro.config.mjs` além do que a
> integração do Tina exigir. Se precisar de mais, pare e reporte.

## Contexto necessário

**Projeto.** `haroldo-page` — site acadêmico do Prof. Haroldo C. D. Lima Junior (UFMA). Astro
**7.2.10** estático (D-01), Tailwind 4, TypeScript strict. `content/` está **vazio** (só
`.gitkeep`). Existe uma única página, `src/pages/index.astro`.

**Estado do TinaCloud (plano 011).** O projeto existe, vinculado a
`researchgroups-ufma/haroldo-page` na branch `main`, e o painel exibe:

```
Project setup did not complete. No Tina config was found on main of researchgroups-ufma/haroldo-page.
Commit your Tina config to main and push again. Indexing will start automatically.
```

**Isto significa que o push deste plano destrava a indexação sozinho.** Não há ação manual no
painel do TinaCloud. As credenciais `TINA_CLIENT_ID` e `TINA_TOKEN` já estão no `.env` local e
foram validadas contra o content API — o `clientId` é `8be98053-68c3-4262-b7bd-dd1286e1c7ad`.

**Versões verificadas em 2026-09-01:**

| Pacote | Versão | Observação |
|---|---|---|
| `@tinacms/astro` | 0.6.1 | peer `astro: ^5.0.0 \|\| ^6.0.0 \|\| ^7.0.0` — o Astro 7 é suportado |
| `tinacms` | 3.12.1 | peer `react`/`react-dom` `>=16.14.0` |
| `@tinacms/cli` | 2.6.1 | peer `react`/`react-dom` `>=18.3.1 <20.0.0` |

⚠️ **O Tina traz React para um projeto que hoje não tem React nenhum.** Isso é esperado — o
painel é uma aplicação React; o **site público continua sem React** porque `/admin` é uma ilha
isolada. Confirme na Evidência que o build do site não passou a emitir JS de React.

**D-02 — sem visual editing.** Não configure `contextual editing`, não instale
`@tinacms/react-tina-field`, não mexa em `output`. O visual editing exigiria `output: 'server'`,
contra D-01. O painel é **por formulários**, só.

**Escopo mínimo de propósito.** Uma coleção só (`perfil`), com dois ou três campos. As cinco
coleções completas são o plano 017. O valor deste plano é descobrir cedo se a integração
Tina + Astro 7 tem atrito — e ela é território novo, porque o `@tinacms/astro` declara suporte
a Astro 7 mas o projeto é o primeiro da casa a usar essa combinação.

**Artefatos gerados.** O Tina gera arquivos derivados (tipicamente `tina/__generated__/`).
Decida entre versioná-los ou ignorá-los e **registre o motivo** — o build da fase 2 vai depender
dessa escolha. Se ignorar, o script de build precisa gerá-los antes do `astro build`.

**Ambiente.** Windows 11 / PowerShell, a partir de `S:\Projetos\academic_page\haroldo`.
Node 24.16.0.

## Passos

1. Instalar `tinacms`, `@tinacms/cli` e `@tinacms/astro` com versões **fixadas** (o projeto não
   usa faixas — veja qualquer linha de `package.json`).
   → verify: `npm ls tinacms @tinacms/cli @tinacms/astro --depth=0` sem `UNMET`; `npm audit`
   continua em 0 vulnerabilidades, ou a divergência é reportada.
2. Criar `tina/config.ts` com **uma** coleção `perfil`, apontando para `content/perfil`, com os
   campos `nome`, `cargo` e `bio` — rótulos em português.
   → verify: o arquivo compila no `astro check`.
3. Criar `content/perfil/index.md` com valores mínimos.
   → verify: o arquivo existe e o frontmatter bate com os campos da coleção.
4. Ajustar os scripts do `package.json` para que o dev suba o Tina junto (tipicamente
   `tinacms dev -c "astro dev"`) e o build gere o cliente antes do `astro build`.
   → verify: `npm run dev` sobe sem erro; `npm run build` continua verde.
5. Decidir sobre `tina/__generated__/` e refletir a decisão no `.gitignore`.
   → verify: `git status --short` não lista artefato indesejado; a decisão está na Evidência.
6. **Verificação objetiva:** abrir `http://localhost:4321/admin`, editar a bio pelo formulário,
   salvar, e confirmar que `content/perfil/index.md` mudou **no disco**.
   → verify: `git diff content/perfil/index.md` mostra a alteração feita pelo painel.
7. Atualizar a seção do painel no `README.md`, que hoje diz que ele não existe.
   → verify: o texto descreve como subir o painel de fato.

## Critérios de aceitação

- [ ] `tinacms`, `@tinacms/cli` e `@tinacms/astro` instalados com versão fixada
- [ ] `tina/config.ts` com a coleção `perfil` e rótulos em português
- [ ] `npm run dev` sobe o painel; `/admin` carrega e autentica ou entra em modo local
- [ ] **Verificação objetiva:** uma edição feita **pelo formulário** alterou
      `content/perfil/index.md` no disco, comprovada por `git diff`
- [ ] `npm run lint`, `npm run format:check`, `npm run test` e `npm run build` verdes
- [ ] O build do site público **não** passou a emitir JS de React (D-01/D-02)
- [ ] Visual editing **não** configurado; `output` continua `'static'`
- [ ] Decisão sobre versionar ou ignorar `tina/__generated__/` registrada com motivo
- [ ] `README.md` com a seção do painel corrigida
- [ ] Após o push: o TinaCloud sai de "setup did not complete" e indexa a branch `main`

## Evidência

<Preenchido pelo executor: saída de `npm ls`, `npm audit`, os quatro comandos de qualidade,
`git diff` provando a edição pelo painel, tamanho do JS do site público antes e depois, decisão
sobre os artefatos gerados e o estado do painel do TinaCloud após o push.>
