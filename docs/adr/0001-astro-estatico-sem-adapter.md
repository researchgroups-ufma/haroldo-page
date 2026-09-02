# ADR-0001 — Astro estático, sem adapter e sem SSR

- **Status:** Aceita
- **Data:** 2026-09-01
- **Decisão do PRD:** D-01 (§7.2)
- **Fase:** 0

## Contexto

O site precisa ser hospedado a custo zero (RNF-14) e sobreviver a picos de acesso sem
manutenção. O Cloudflare Workers oferece dois modos: servir **assets estáticos**, que são
ilimitados no plano gratuito e não executam código por requisição, ou rodar um **Worker de
runtime** (SSR), cujas requisições consomem a cota de 100 mil/dia do plano gratuito.

O Astro suporta os dois: `output: 'static'` gera HTML no build; `output: 'server'` com o
adapter `@astrojs/cloudflare` renderiza a cada requisição.

O único recurso do projeto que pediria SSR é o **visual editing** do TinaCMS — editar o
conteúdo vendo a página real. Ele exige renderização por requisição.

## Decisão

O site é **100% estático**: `output: 'static'`, sem adapter, sem SSR.

O `wrangler.toml` não tem a chave `main` — só o bloco `[assets]` apontando para `./dist`.
A ausência de `main` é a materialização da decisão no arquivo: sem ela, não há script de
runtime a executar.

## Alternativas consideradas

**Astro em modo servidor no Workers**, com `@astrojs/cloudflare`. Rejeitada: o único ganho
concreto seria o visual editing, e ele custaria a cota de requisições, uma classe inteira de
falhas em produção (erros que só aparecem sob tráfego) e uma dependência a mais na cadeia de
build. O professor edita por formulários no painel `/admin` — o visual editing é conveniência,
não requisito.

## Consequências

- **Nenhuma rota pública executa código em requisição** (§7.1, RNF-03). As requisições ficam
  fora da cota de 100 mil/dia e uma classe inteira de falhas de produção deixa de existir.
- `@astrojs/cloudflare` **não é usado** (Apêndice A).
- O **visual editing do Tina fica indisponível** — é o custo aceito, registrado como D-02.
- Qualquer funcionalidade futura que exija render por requisição (busca no servidor, formulário
  com processamento, conteúdo personalizado) implica **revisitar este ADR**, não contorná-lo.
- Conteúdo novo só aparece no site depois de um build — o que é aceitável porque o pipeline de
  publicação (fase 2) dispara o build a cada commit do painel.

## Evidência empírica

O deploy do plano 012 publicou o site em <https://haroldo-page.and-near.workers.dev> servindo
apenas assets: `astro build` reportou `output: "static"` e o wrangler leu 7 arquivos do
diretório de assets, sem empacotar módulo de entrada. A raiz responde 200 e uma rota
inexistente responde 404.

## Referências

- PRD §7.1 (arquitetura), §7.2 (decisão D-01), RNF-03, RNF-14, Apêndice A
- `wrangler.toml` — plano 007
- `plans/012-roteiro-cloudflare-worker-e-primeiro-deploy.md` — Evidência
