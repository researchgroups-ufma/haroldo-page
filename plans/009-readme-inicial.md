# Plano 009 — `README.md` inicial (instalação, execução e deploy)

**Status:** TODO
**RFs cobertos:** — (Fase 0, item 8 do checklist §12; RNF-12, §10.5)
**Depende de:** plano 008
**Modelo recomendado:** sonnet
**Agente recomendado:** implementer
**PRD:** `S:\Projetos\academic_page\haroldo\PRD.md`
**Projeto:** `S:\Projetos\academic_page\haroldo`

## Objetivo

O repositório passa a ter um `README.md` capaz de levar alguém de uma máquina limpa até
`npm run build` verde **sem nenhum passo fora do documento** — que é literalmente o critério
de conclusão da fase 0 no PRD (§6.2).

## Arquivos afetados

- `README.md` — criar

> O executor não toca em arquivo fora desta lista. Se precisar, para e reporta.
> **Não** edite `PRD.md`, `briefing.md` nem código. Se descobrir que um comando documentado
> não funciona, o conserto é reportado, não improvisado — a §10 manda que "doc e código
> divergem? O código é a verdade; a divergência é reportada, não escondida".

## Contexto necessário

**Projeto.** `haroldo-page` — site pessoal acadêmico do Prof. Haroldo Cilas Duarte Lima
Junior, Professor Adjunto A do Departamento de Física da UFMA (Apêndice C do PRD). O site
tem duas fronteiras que o README precisa deixar explícitas (§7.5):

> A fronteira é explícita: **o professor altera apenas `content/` e `public/uploads/`,
> sempre pelo painel; o desenvolvedor é dono de todo o resto.**

**Critério de conclusão da fase 0 (§6.2), que este README existe para atender:**

> `npm run build` verde em máquina limpa a partir do README.

E a RNF-12: *"Reproduzível em Windows e Linux com Node LTS; **nenhum passo manual fora do
README**"*.

**Conteúdo mínimo exigido pela §10.5 do PRD:**

> `README.md` — o que é, requisitos, instalação, `npm run dev`, como rodar o painel local,
> como fazer deploy, troubleshooting. Atualizar a cada mudança de uso ou instalação.

**Estado real do projeto ao executar este plano** (planos 001–008 já concluídos):

| Existe | O quê |
|---|---|
| `.nvmrc` | versão major do Node fixada (leia o arquivo e cite o número real no README) |
| `package.json` | scripts `dev`, `build`, `preview`, `lint`, `lint:fix`, `format`, `format:check`, `test`, `test:watch`, `test:coverage`, `deploy` |
| `astro.config.mjs` | Astro 5, `output: 'static'`, Tailwind 4 via plugin Vite |
| `wrangler.toml` | Workers Static Assets, `dist/`, sem `main` |
| `.env.example` | `TINA_CLIENT_ID`, `TINA_TOKEN`, `TINA_BRANCH`, `PUBLIC_SITE_URL` |
| `.github/workflows/ci.yml` | lint + format:check + test + build |
| `content/`, `src/`, `tests/`, `docs/`, `scripts/` | estrutura da §7.5 |

**Não existe ainda, e o README deve dizer isso em vez de fingir que existe:**
- **TinaCMS / painel `/admin`** — é da **fase 1**. Na seção "como rodar o painel local",
  escreva explicitamente "ainda não disponível — entra na fase 1 do PRD" em vez de inventar
  um comando `tinacms dev`.
- **Conteúdo real** — as pastas de `content/` estão vazias; conteúdo placeholder é fase 1.
- **Deploy automático** — o Workers Builds só é conectado na **fase 2**. Documente o deploy
  **manual** (`npm run deploy`, que roda `astro build` e `wrangler deploy`) e marque
  claramente que o deploy automático a cada push chega na fase 2.

**Ambiente do desenvolvedor.** Windows 11 com PowerShell é o ambiente primário; Git Bash
também é usado. Dê os comandos de forma que funcionem nos dois (comandos `npm` são
idênticos). Onde houver diferença real (copiar `.env.example` para `.env`), mostre as duas
formas:

```powershell
Copy-Item .env.example .env    # PowerShell
```
```bash
cp .env.example .env           # bash
```

**Seções sugeridas para o README** (em português, §10.4):

1. **O que é** — uma frase sobre o site e uma sobre quem o edita.
2. **Stack** — Astro 5 estático, TypeScript, Tailwind 4, TinaCMS (fase 1), Cloudflare
   Workers Static Assets. Com o link para o PRD, que é a fonte de verdade.
3. **Requisitos** — Node na versão do `.nvmrc`, npm, Git. (Nada de Python.)
4. **Instalação** — clonar, `nvm use` (ou instalar a versão do `.nvmrc`), `npm ci`,
   copiar `.env.example` para `.env`.
5. **Comandos** — tabela com todos os scripts do `package.json` e o que cada um faz.
6. **Estrutura de pastas** — versão resumida da §7.5, com a fronteira professor × desenvolvedor.
7. **Painel de edição** — o que será, e que ainda não existe (fase 1).
8. **Deploy** — deploy manual hoje; automático a partir da fase 2; D-01 (site estático, sem
   SSR) explicada em duas linhas para evitar que alguém adicione um adapter.
9. **Variáveis de ambiente** — remissão ao `.env.example` e ao §7.6, com o aviso de que
   `TINA_TOKEN` nunca vai para o repositório.
10. **Qualidade** — lint, formatação, testes, CI; e que suíte verde é pré-requisito de merge
    (§11, RNF-10).
11. **Troubleshooting** — no mínimo: versão de Node errada; `npm ci` falhando por lock
    dessincronizado; `format:check` verde no Windows e vermelho no CI (CRLF vs LF).

**Regra de ouro deste plano:** **todo comando escrito no README tem de ter sido executado
pelo executor nesta sessão**. Nada de comando plausível não testado — a §"Evidência" das
convenções da casa proíbe declarar pronto por relato.

## Passos

1. Ler `package.json` (scripts e versões reais), `.nvmrc`, `astro.config.mjs`,
   `wrangler.toml` e `.env.example` — o README descreve **o que existe**, não o que o PRD
   planeja.
   → verify: liste na Evidência a versão do Node e a versão do Astro efetivamente instaladas.
2. Escrever `README.md` com as 11 seções acima, em português.
   → verify: todas as seções presentes; nenhuma menção a comando inexistente.
3. Executar, em sequência limpa, cada comando documentado nas seções Instalação e Comandos:
   `npm ci`, `npm run lint`, `npm run format:check`, `npm run test`, `npm run build`,
   `npm run dev` (subir e derrubar), `npm run preview`.
   → verify: cole as saídas; corrija no README qualquer comando que não tenha funcionado
   exatamente como escrito.
4. Rodar `npm run format:check` (o Prettier formata Markdown; se o README não estiver
   formatado, `npm run format` e conferir de novo).
   → verify: verde.
5. Commitar com `docs: adiciona README com instalação, comandos e deploy`.
   → verify: `git show --stat HEAD` lista apenas `README.md` (e o lock, se `npm ci` o tiver
   tocado — nesse caso investigue, `npm ci` não deveria alterá-lo).

## Critérios de aceitação

- [ ] `README.md` cobre os sete itens exigidos pela §10.5 (o que é, requisitos, instalação,
      `npm run dev`, painel local, deploy, troubleshooting)
- [ ] Todo comando citado foi executado nesta sessão, com saída registrada na Evidência
- [ ] A versão do Node citada bate exatamente com `.nvmrc`
- [ ] O README diz explicitamente que o painel `/admin` é da fase 1 e que o deploy
      automático é da fase 2 — sem prometer o que não existe
- [ ] O README explica a fronteira `content/` + `public/uploads/` (professor) × resto
      (desenvolvedor)
- [ ] `npm run format:check` verde após a escrita
- [ ] Nenhum segredo, token ou valor de `.env` real aparece no README

## Evidência

<Preenchido pelo executor: saídas de `npm ci`, `npm run lint`, `npm run format:check`,
`npm run test`, `npm run build`, `npm run preview`, versões reais de Node e Astro, e
`git show --stat HEAD`.>
