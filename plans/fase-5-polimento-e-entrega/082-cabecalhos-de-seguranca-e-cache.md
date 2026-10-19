# Plano 082 — Cabeçalhos de segurança e cache no `_headers` (RNF-17 parte 1, RNF-18)

**Status:** TODO
**RFs cobertos:** **RNF-17** (cabeçalhos por arquivo e proteção contra moldura; a CSP é o 083); **RNF-18** (cache de `/uploads/*` e dos ícones; o `curl` dos dois ícones novos é do 084); sabatina "Lacunas da auditoria de qualidade", Decisão 5, item 6, e Decisão 9; §12 fase 5, item "Cabeçalhos de segurança e cache" (fecha com 083 e 084 — o último dos três marca a caixa)
**Depende de:** plano 075 (`parseHeadersFile` e o bloco `/admin/*`); plano 078 (`og.png` existe para o `curl`)
**Modelo recomendado:** sonnet
**Agente recomendado:** implementer
**Executável por:** agente; o `curl` em produção é do orquestrador, depois do push
**PRD:** `S:\Projetos\academic_page\haroldo\PRD.md`
**Projeto:** `S:\Projetos\academic_page\haroldo`

## Objetivo

`public/_headers` passa a mandar, em toda resposta, `X-Content-Type-Options`, `Referrer-Policy`,
`Permissions-Policy` e a proteção contra moldura (`Content-Security-Policy: frame-ancestors 'none'` e
`X-Frame-Options: DENY`, inclusive no `/admin`), e `Cache-Control: public, max-age=3600,
must-revalidate` em `/uploads/*`, nos três ícones e no `og.png`. HSTS não entra.

## Arquivos afetados

- `public/_headers` — cabeçalhos no `/*`, blocos de cache novos, comentário
- `tests/dist/site-gerado.test.ts` — `describe` novo, usando `parseHeadersFile` (075)

> O executor não toca em arquivo fora desta lista. Se precisar, para e reporta. `Status:` fica `TODO`.
> Não commite. **A linha `X-Robots-Tag: noindex` do `/*` fica** (sai no 085); o bloco `/admin/*` (075)
> e o `/_astro/*` ficam como estão.

## Contexto necessário

**Valores fixados pela Decisão 9** (`docs/sabatinas/CHANGELOG_sabatina_auditoria-qualidade.md`;
RNF-17 e RNF-18, PRD linhas 261–262), copie exatamente:

| Onde | Cabeçalho | Valor |
|---|---|---|
| `/*` | `X-Content-Type-Options` | `nosniff` |
| `/*` | `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `/*` | `Permissions-Policy` | `camera=(), microphone=(), geolocation=(), payment=(), usb=()` |
| `/*` | `Content-Security-Policy` | `frame-ancestors 'none'` |
| `/*` | `X-Frame-Options` | `DENY` |
| `/uploads/*`, `/favicon.svg`, `/favicon.ico`, `/apple-touch-icon.png`, `/og.png` | `Cache-Control` | `public, max-age=3600, must-revalidate` |

- A proteção contra moldura vai **por cabeçalho** porque `frame-ancestors` é ignorado em `<meta>`. No
  `/*` ela alcança também o `/admin/*`, como o RNF-17 pede: o painel não emoldura o site, porque não há
  edição visual (D-02).
- Este `Content-Security-Policy` só tem `frame-ancestors`; a CSP de scripts e estilos do site é a
  `<meta>` que o Astro gera no 083. As duas valem ao mesmo tempo, e esta não restringe script nem
  estilo — por isso o `/admin` continua fora da CSP de conteúdo.
- **HSTS não entra** no `*.workers.dev` (o `.dev` já está na pré-carga dos navegadores): fica para o
  domínio próprio, plano 085.
- O nome dos arquivos não tem hash: uma imagem trocada pelo professor com o mesmo nome aparece em até
  uma hora (por isso não é `immutable`). As variantes de `/uploads/_webp/` (080) caem em `/uploads/*`.
- **Nenhum `Cache-Control` no `/*`**: quando dois blocos casam e mandam o mesmo nome, a documentação
  da Cloudflare diz que os valores se unem por vírgula, e o `/uploads/*` sairia com dois valores. O
  HTML e o `/_astro/*` já estão certos hoje (auditoria de 2026-10-12): não mexa neles.

O `/favicon.ico` e o `/apple-touch-icon.png` ainda não existem (plano 084). As regras entram agora;
o `curl` deles é critério do 084.

**`public/_headers` hoje** (depois do 075): comentário do topo, `/*` com `X-Robots-Tag: noindex`,
`/admin/*` com `X-Robots-Tag: noindex`, `/_astro/*` com cache imutável. Leia o arquivo antes de editar.
O comentário do topo ganha uma linha dizendo de onde vem cada grupo (RNF-17, RNF-18, Decisão 9).

**Asserções** (`describe('cabeçalhos de segurança e cache (RNF-17, RNF-18, Decisão 9)')`), sobre
`dist/_headers` lido por `parseHeadersFile`, com o esperado copiado da tabela acima (fonte: Decisão 9):
1. o bloco `/*` tem os cinco cabeçalhos, com os valores exatos, e nenhum `Cache-Control`;
2. cada um dos cinco caminhos de cache tem um bloco com o `Cache-Control` exato;
3. nenhum bloco tem `Strict-Transport-Security`;
4. o `/admin/*` (075) e o `/_astro/*` continuam com o que tinham.

**Regras de código:** `plans/fase-5-polimento-e-entrega/README.md`, seção "Regras de código".

## Passos

1. Cabeçalhos e blocos em `public/_headers` → verify: `git diff -- public/_headers` colado.
2. Asserções 1–4 → verify: `npm run build:pipeline` e `npm run test:dist` colados.
3. Canário A: troque `DENY` por `SAMEORIGIN` em `dist/_headers` (o artefato) → a asserção 1 reprova; refaça o build → verify: saídas coladas.
4. Canário B: acrescente `Cache-Control: no-store` ao `/*` em `dist/_headers` → a asserção 1 reprova; refaça o build → verify: saídas coladas.
5. Prova local, como no passo 5 do 075: `npx wrangler dev --port 8787` com `Start-Process`, `curl.exe -sI` em `/`, `/admin/index.html`, `/uploads/profile.jpg`, `/favicon.svg` e `/og.png`; pare o processo → verify: as saídas e `Get-Process` sem `workerd` colados. Se o `wrangler dev` falhar ou ignorar o `_headers`, cole a saída e siga.
6. Portão → verify: `npm run lint`, `npm run format:check`, `npm run test:coverage` colados.

**Do orquestrador, depois do push e do Workers Builds verde:** `curl.exe -sI` em
`https://haroldo-page.and-near.workers.dev/`, `/sobre/`, `/admin/index.html`, `/uploads/profile.jpg`,
uma variante de `/uploads/_webp/`, `/favicon.svg` e `/og.png`, colados; e, no Vivaldi, numa aba de
outra origem, o console com `document.body.innerHTML = '<iframe src="https://haroldo-page.and-near.workers.dev/"></iframe>'`
mostrando a recusa por `frame-ancestors`, transcrita com data e hora. Registre
também o que vier na resposta de uma URL inexistente (`/nao-existe/`), sem ser critério: a 404 não é
rota pública.

## Critérios de aceitação

- [ ] Os cinco cabeçalhos no `/*`, valores exatos da Decisão 9, sem `Cache-Control` nele
- [ ] `Cache-Control: public, max-age=3600, must-revalidate` nos cinco caminhos
- [ ] Sem `Strict-Transport-Security`; `X-Robots-Tag` do `/*`, `/admin/*` e `/_astro/*` intactos
- [ ] Asserções 1–4 verdes; canários A e B vermelhos
- [ ] `curl` de produção colado (orquestrador): os cabeçalhos em `/`, `/sobre/` e `/admin/index.html`; o cache em `/uploads/*`, `favicon.svg` e `og.png`
- [ ] `lint`, `format:check`, `test:coverage`, `build:pipeline`, `test:dist` verdes, com saída colada

## Evidência

<Preenchida pelo executor, com saída literal capturada em arquivo (ver `plans/DESPACHO.md`). Plano
sem esta seção preenchida não é DONE.>
