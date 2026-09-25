/**
 * ============================================================================
 *  Arquivo      : comparar-dist.mjs
 *  Projeto      : Site Pessoal Acadêmico — Prof. Haroldo
 *  Descrição    : Retrato e comparação do HTML normalizado de cada rota do
 *                 `dist/`. Prova, por artefato, que uma refatoração não mudou
 *                 as páginas geradas (sabatina fase 4, Decisão 6): a
 *                 normalização tira só o que o Astro muda por construção
 *                 quando marcação e `<style>` trocam de arquivo — o sufixo de
 *                 `data-astro-cid-*` e o hash dos nomes em `/_astro/` — e os
 *                 blocos `<style>` e `<link rel="stylesheet">`. Os `<script>`
 *                 ficam: são eles que carregam o comportamento da página.
 *  Autor        : Desenvolvedor
 *  Criado em    : 2026-09-25
 *  Atualizado em: 2026-09-25
 *  Versão       : 0.2.0
 *
 *  Dependências : node:fs, node:path, node:process, node:console
 *  Entradas     : `dist/` (ou a pasta de `--dist`); dois retratos `.json`
 *  Saídas       : retrato `.json`; relatório rota a rota no stdout; código de
 *                 saída 0 (toda rota não ignorada igual) ou 1
 *  Uso          : node scripts/comparar-dist.mjs retrato <saida.json> [--dist <pasta>]
 *                 node scripts/comparar-dist.mjs comparar <antes.json> <depois.json> [--ignorar '<regex>']
 *
 *  Notas        : ferramenta de desenvolvimento — não entra no site, no
 *                 `build:pipeline` nem na cobertura (plano 055). Os retratos
 *                 vão para uma pasta de rascunho, nunca para o repositório.
 * ============================================================================
 */
// `process` e `console` por importação explícita: o `eslint.config.js` só concede globais de Node
// a `**/*.config.{js,mjs,cjs,ts}` (mesmo padrão de `scripts/verificar-promocao.mjs`).
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import process from 'node:process';
import console from 'node:console';

const USO = `uso:
  node scripts/comparar-dist.mjs retrato <saida.json> [--dist <pasta>]
  node scripts/comparar-dist.mjs comparar <antes.json> <depois.json> [--ignorar '<regex de rota>']`;

/** Caracteres de contexto mostrados de cada lado da primeira divergência. */
const CONTEXTO = 120;

/**
 * Normaliza o HTML de uma rota. Mexe em exatamente quatro coisas, nesta ordem, e nada mais — o
 * comparador não pode esconder mudança de texto, de ordem, de outro atributo, de `<script>` ou de
 * asset (plano 055). Os `<script>` não são removidos: um script perdido numa extração de view
 * quebra a página sem mudar a marcação. Do nome em `/_astro/` só o hash de 8 caracteres vira `*`;
 * o nome-base vem do arquivo-fonte, e trocar o asset tem de aparecer. A normalização é sobre a
 * string inteira: o `dist/` sai minificado numa linha só.
 *
 * @param {string} html HTML cru da rota.
 * @returns {string} HTML normalizado.
 */
function normalizar(html) {
  return html
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<link\b[^>]*\brel=(?:"stylesheet"|'stylesheet'|stylesheet)[^>]*>/gi, '')
    .replace(/\s+data-astro-cid-[a-z0-9]+(?:=(?:"[^"]*"|'[^']*'|[^\s>]*))?/g, '')
    .replace(/(\/_astro\/[^"'\s)]*?)\.[A-Za-z0-9_-]{8}(\.[a-z0-9]+)/g, '$1.*$2');
}

/**
 * Lista os `.html` de uma pasta, recursivamente, fora de `admin/` na raiz (painel do Tina).
 *
 * @param {string} raiz Pasta do build.
 * @param {string} [pasta] Pasta corrente da recursão.
 * @returns {string[]} Caminhos absolutos dos `.html`.
 */
function listarHtml(raiz, pasta = raiz) {
  const achados = [];
  for (const entrada of readdirSync(pasta, { withFileTypes: true })) {
    const caminho = join(pasta, entrada.name);
    if (entrada.isDirectory()) {
      if (pasta === raiz && entrada.name === 'admin') continue;
      achados.push(...listarHtml(raiz, caminho));
    } else if (entrada.name.endsWith('.html')) {
      achados.push(caminho);
    }
  }
  return achados;
}

/**
 * Grava o retrato `{ "<rota>": "<html normalizado>" }`, com a rota relativa ao build e
 * separador `/`, em ordem alfabética — o retrato do mesmo build é igual byte a byte.
 *
 * @param {string} saida Caminho do `.json` a gravar.
 * @param {string} dist Pasta do build.
 * @returns {number} Código de saída.
 */
function retrato(saida, dist) {
  if (!existsSync(dist)) {
    console.error(`erro: a pasta do build não existe: ${dist} (rode npm run build:pipeline)`);
    return 1;
  }
  const rotas = listarHtml(dist)
    .map((caminho) => [relative(dist, caminho).split(sep).join('/'), caminho])
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));
  const mapa = Object.fromEntries(
    rotas.map(([rota, caminho]) => [rota, normalizar(readFileSync(caminho, 'utf8'))]),
  );
  writeFileSync(saida, JSON.stringify(mapa, null, 2) + '\n');
  console.log(`retrato: ${rotas.length} rota(s) de ${dist} em ${saida}`);
  return 0;
}

/**
 * Índice do primeiro caractere em que duas strings divergem (o menor comprimento, se uma é
 * prefixo da outra).
 *
 * @param {string} a
 * @param {string} b
 * @returns {number}
 */
function primeiraDivergencia(a, b) {
  const limite = Math.min(a.length, b.length);
  for (let i = 0; i < limite; i++) if (a[i] !== b[i]) return i;
  return limite;
}

/**
 * Compara dois retratos rota a rota e imprime `IGUAL`, `DIFERENTE`, `SÓ ANTES`, `SÓ DEPOIS` ou
 * `IGNORADA`, com um resumo na última linha.
 *
 * @param {string} antesArq Retrato de antes.
 * @param {string} depoisArq Retrato de depois.
 * @param {RegExp|null} ignorar Rotas que casam não contam para o resultado.
 * @returns {number} 0 se toda rota não ignorada for `IGUAL`; 1 caso contrário.
 */
function comparar(antesArq, depoisArq, ignorar) {
  const antes = JSON.parse(readFileSync(antesArq, 'utf8'));
  const depois = JSON.parse(readFileSync(depoisArq, 'utf8'));
  const rotas = [...new Set([...Object.keys(antes), ...Object.keys(depois)])].sort();
  const contagem = { IGUAL: 0, DIFERENTE: 0, 'SÓ ANTES': 0, 'SÓ DEPOIS': 0, IGNORADA: 0 };

  for (const rota of rotas) {
    let estado;
    if (ignorar?.test(rota)) estado = 'IGNORADA';
    else if (!(rota in depois)) estado = 'SÓ ANTES';
    else if (!(rota in antes)) estado = 'SÓ DEPOIS';
    else estado = antes[rota] === depois[rota] ? 'IGUAL' : 'DIFERENTE';
    contagem[estado]++;
    console.log(`${estado.padEnd(9)}  ${rota}`);

    if (estado === 'DIFERENTE') {
      const i = primeiraDivergencia(antes[rota], depois[rota]);
      const trecho = (html) => html.slice(Math.max(0, i - CONTEXTO), i + CONTEXTO);
      console.log(`           primeira divergência no caractere ${i}`);
      console.log(`           antes : …${trecho(antes[rota])}…`);
      console.log(`           depois: …${trecho(depois[rota])}…`);
    }
  }

  console.log(
    'resumo: ' +
      Object.entries(contagem)
        .map(([estado, n]) => `${estado} ${n}`)
        .join(' · '),
  );
  return contagem.DIFERENTE + contagem['SÓ ANTES'] + contagem['SÓ DEPOIS'] === 0 ? 0 : 1;
}

/**
 * Lê o valor de uma opção `--nome valor` e a remove da lista de argumentos.
 *
 * @param {string[]} args Argumentos (alterados no lugar).
 * @param {string} nome Nome da opção, com os dois hífens.
 * @returns {string|undefined}
 */
function opcao(args, nome) {
  const i = args.indexOf(nome);
  if (i < 0) return undefined;
  const [, valor] = args.splice(i, 2);
  return valor;
}

const args = process.argv.slice(2);
const dist = opcao(args, '--dist') ?? 'dist';
const ignorar = opcao(args, '--ignorar');
const [comando, ...posicionais] = args;

if (comando === 'retrato' && posicionais.length === 1) {
  process.exit(retrato(posicionais[0], dist));
} else if (comando === 'comparar' && posicionais.length === 2) {
  process.exit(comparar(posicionais[0], posicionais[1], ignorar ? new RegExp(ignorar) : null));
} else {
  console.error(USO);
  process.exit(2);
}
