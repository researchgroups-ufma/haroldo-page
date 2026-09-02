# ADR-0002 — Fixar `vite`, `sharp` e `esbuild` por `overrides` do npm

- **Status:** **Revertida em 2026-09-01** — os gatilhos de revisão dispararam e os três
  overrides foram removidos. Ver "Desfecho" ao fim. A decisão fica registrada porque explica
  por que os overrides existiram entre 2026-09-01 e o upgrade do Astro
- **Data:** 2026-09-01
- **Decisão do PRD:** fora da tabela D — a §10.5 define `docs/adr/` como "Decisões D-01..D-06
  **e futuras**", o que autoriza registrar decisões técnicas como esta
- **Fase:** 0 (planos 002 e commit `07521cd`)

## Contexto

O `package.json` carrega três `overrides`, cada um por um motivo diferente. Sem este ADR o
motivo vive só em mensagens de commit e na Evidência de planos.

**`vite`: 6.4.3.** `astro@5.18.2` depende de `vite@^6.4.1` como dependência dura, enquanto
`@tailwindcss/vite@4.3.3` declara vite como _peer_ `^5.2.0 || ^6 || ^7 || ^8`. Sem o override,
o npm iça o vite 8 para a raiz e aninha o 6 sob `astro` — **duas cópias na árvore**. O tipo
`Plugin` de uma não é atribuível ao da outra, e o `astro check` quebra com `ts(2322)`.

**`sharp`: 0.35.4** (de 0.34.5) e **`esbuild`: 0.28.2** (de 0.27.7). O `npm audit` acusava
três vulnerabilidades vindas de `astro@5.18.2`: sharp (high — CVEs de libvips
2026-33327/33328/35590/35591), esbuild (low — leitura arbitrária de arquivo no dev server em
Windows) e os advisories do próprio núcleo do Astro.

## Decisão

```json
"overrides": {
  "vite": "6.4.3",
  "sharp": "0.35.4",
  "esbuild": "0.28.2"
}
```

## Alternativas consideradas

- **Declarar `vite` como devDependency direta.** Rejeitada: acrescenta ao `package.json` uma
  dependência que o projeto não usa diretamente, para resolver um problema de resolução de
  árvore. O override é o mecanismo próprio para isso.
- **Afrouxar o `astro check`** para tolerar o `ts(2322)`. Rejeitada: é regressão — desliga uma
  verificação que pega erro real para acomodar um defeito de árvore de dependências.
- **Subir para `astro@7.2.10`**, que resolveria os advisories restantes do núcleo. Adiada: são
  **dois majors**. A análise de 2026-09-01 mostrou que os 8 advisories do Astro ou exigem SSR
  (impossível aqui por D-01: o `wrangler.toml` não tem `main`) ou dependem de recursos que o
  site não usa (`define:vars`, spread props, `transition:*`, slots — grep confirmou zero
  ocorrências em `src/`). Passa a importar na fase 1, quando o `sharp` processar imagens reais.

## Consequências

- O `npm audit` sai de 3 vulnerabilidades para **1 high**, no núcleo do `astro`, sem correção
  possível abaixo de dois majors.
- O override do `sharp` **cruza a faixa que o astro declara** (`^0.34.0`). Por isso a
  verificação não parou no `npm audit`: uma página temporária com `astro:assets` foi construída
  de ponta a ponta, confirmando `generating optimized images` com WebP redimensionado, e depois
  removida. A validação usou imagem sintética — **reconferir com imagens reais na fase 1**.
- Overrides são invisíveis para quem lê só o `package.json` de cima. Este ADR é o registro.

## Gatilhos de revisão

- **`vite`:** remover o override quando o `astro` passar a exigir vite ≥ 7. Validar com
  `npm ls vite --all` mostrando **uma única cópia**.
- **`sharp` e `esbuild`:** remover quando o `astro` passar a depender de versões já corrigidas.
  Validar com `npm audit` e reconstruindo uma página `astro:assets`.
- **Upgrade do Astro:** recomendado **plano dedicado antes de a fase 1 entregar conteúdo**.

## Referências

- PRD §10.5, RNF-12
- `plans/fase-0-setup-e-provisionamento/002-scaffolding-astro-typescript-tailwind.md` — Evidência (justificativa do vite)
- Commit `07521cd` — overrides de `sharp` e `esbuild`
- `plans/fase-0-setup-e-provisionamento/README.md` — seção "Segurança — `npm audit`"

---

## Desfecho — 2026-09-01 (plano 014)

**Os três overrides foram removidos.** O upgrade do Astro 5.18.2 → 7.2.10 tornou os três
desnecessários de uma vez:

- **`vite`:** o gatilho previsto (_"remover quando o `astro` passar a exigir vite ≥ 7"_)
  disparou — `astro@7.2.10` depende de `vite: ^8.0.13`. Manter o pin em `6.4.3` **quebraria**
  a instalação. Validação prescrita executada: `npm ls vite --all` mostra uma única versão,
  `vite@8.2.2`, sem `overridden`. O conflito de duas cópias que motivou o pin deixou de
  existir, porque o peer do `@tailwindcss/vite@4.3.3` (`^5.2.0 || ^6 || ^7 || ^8`) e a
  dependência do Astro passaram a se encontrar no 8.
- **`sharp` e `esbuild`:** ficaram redundantes. O `astro@7.2.10` já pede nativamente
  `optionalDependencies.sharp: ^0.35.4` e `dependencies.esbuild: ^0.28.0` — exatamente as
  faixas corrigidas que os overrides forçavam. O override do `sharp`, que cruzava a faixa
  `^0.34.0` declarada pelo Astro 5, deixou de cruzar coisa alguma.

`npm audit` passou de **1 vulnerabilidade high** (núcleo do `astro`) para **0**.

Restam no `package-lock.json` cópias mais antigas de `sharp@0.35.2` e `esbuild@0.28.1` sob
`wrangler` → `miniflare`. São ferramenta de desenvolvimento, fora do build do site, e o
`npm audit` não as acusa. Nenhum override foi reintroduzido por causa delas.

A validação de imagem que o override do `sharp` exigia foi refeita sob o Astro 7 e continua
verde — ver Evidência do `plans/fase-0-setup-e-provisionamento/014-upgrade-astro-7.md`.
