/**
 * ============================================================================
 *  Arquivo      : publications-accordion.ts
 *  Projeto      : Site Pessoal Acadêmico — Prof. Haroldo
 *  Descrição    : Sanfona de anos da página Publicações (RF-25), guiada pela
 *                 rolagem: a partir de `lg`, o bloco fica fixo, a rolagem
 *                 percorre os artigos do ano aberto e, ao fim deles, o ano fecha
 *                 e o seguinte abre (GSAP ScrollTrigger). O GSAP entra por
 *                 `import()` só quando a sanfona roda.
 *  Autor        : Desenvolvedor
 *  Criado em    : 2026-09-30
 *  Atualizado em: 2026-09-30
 *  Versão       : 0.1.0
 *
 *  Dependências : gsap (núcleo e ScrollTrigger, por import() dinâmico)
 *  Entradas     : DOM de `PublicationsView` (`#conteudo`, `#pub-anos`, `.pub-ano`)
 *  Saídas       : efeito colateral no DOM; nenhuma exportação
 *  Uso          : <script>import '../scripts/publications-accordion';</script>
 *
 *  Notas        : melhoria progressiva (RNF-02) — sem JS, abaixo de `lg` ou com
 *                 `prefers-reduced-motion: reduce`, todos os anos ficam abertos
 *                 e o link do ano é uma âncora comum. Lógica movida sem mudança
 *                 de `publicacoes.astro` (plano 064).
 * ============================================================================
 */

/** Rolagem (px) gasta para fechar um ano e abrir o seguinte. */
const TRANSITION = 400;

const scroller = document.getElementById('conteudo');
const wrapper = document.getElementById('pub-anos');
const sections = wrapper ? [...wrapper.querySelectorAll<HTMLElement>('.pub-ano')] : [];

/** Condição em que a sanfona roda — fora dela o GSAP nem é baixado. */
const QUERY = '(min-width: 64rem) and (prefers-reduced-motion: no-preference)';
const media = window.matchMedia(QUERY);
let started = false;

/** Baixa o GSAP e monta a sanfona, uma vez só, na primeira vez em que `QUERY` vale. */
async function startAccordion(scroller: HTMLElement, wrapper: HTMLElement) {
  if (started) return;
  started = true;
  const [{ gsap }, { ScrollTrigger }] = await Promise.all([
    import('gsap'),
    import('gsap/ScrollTrigger'),
  ]);
  gsap.registerPlugin(ScrollTrigger);

  // Cabeçalho do ano = primeiro filho da seção (o bloco do <h2> do ano).
  const headers = sections.map((section) => section.firstElementChild as HTMLElement);
  const bodies = sections.map((section) => section.querySelector('.pub-ano-corpo') as HTMLElement);
  const lists = sections.map((section) => section.querySelector('.pub-ano-lista') as HTMLElement);
  const links = sections.map(
    (section) => section.querySelector('.pub-ano-link') as HTMLAnchorElement,
  );

  // Com o bloco fixo, o corpo aberto ocupa a altura do cartão menos os cabeçalhos dos anos.
  const available = () =>
    scroller.clientHeight - headers.reduce((sum, header) => sum + header.offsetHeight, 0);
  const openHeight = (i: number) => Math.min(lists[i].offsetHeight, available());
  const overflow = (i: number) => Math.max(0, lists[i].offsetHeight - available());

  gsap.matchMedia().add(QUERY, () => {
    gsap.set(bodies, { overflow: 'hidden' });

    const timeline = gsap.timeline({ defaults: { ease: 'none' } });
    sections.forEach((_, i) => {
      timeline.addLabel(`ano-${i}`);
      const over = overflow(i);
      if (over > 0) {
        timeline.fromTo(lists[i], { y: 0 }, { y: () => -overflow(i), duration: over });
      }
      if (i < sections.length - 1) {
        // `fromTo` com funções: a cada refresh (resize, fonte carregada) as alturas são
        // medidas de novo, sem herdar o valor animado do momento.
        timeline
          .fromTo(
            bodies[i],
            { height: () => openHeight(i) },
            { height: 0, duration: TRANSITION, ease: 'power1.inOut' },
          )
          .fromTo(
            bodies[i + 1],
            { height: 0 },
            { height: () => openHeight(i + 1), duration: TRANSITION, ease: 'power1.inOut' },
            '<',
          );
      }
    });

    // Ano fechado (altura 0) sai do Tab e do leitor de tela; volta ao abrir.
    const syncInert = () => bodies.forEach((body) => (body.inert = body.offsetHeight < 1));

    const trigger = ScrollTrigger.create({
      trigger: wrapper,
      scroller,
      start: 'top top',
      end: () => `+=${timeline.duration()}`,
      pin: true,
      scrub: 0.4,
      animation: timeline,
      invalidateOnRefresh: true,
      onUpdate: syncInert,
      onRefresh: syncInert,
    });
    syncInert();

    // O link do ano leva a rolagem ao ponto em que aquele ano está aberto.
    const onClick = (event: MouseEvent) => {
      const i = links.indexOf(event.currentTarget as HTMLAnchorElement);
      event.preventDefault();
      scroller.scrollTo({
        top: trigger.start + timeline.labels[`ano-${i}`],
        behavior: 'smooth',
      });
    };
    links.forEach((link) => link.addEventListener('click', onClick));

    return () => {
      links.forEach((link) => link.removeEventListener('click', onClick));
      bodies.forEach((body) => (body.inert = false));
    };
  });
}

// Com um ano só não há o que sanfonar — a lista fica como está.
if (scroller && wrapper && sections.length > 1) {
  if (media.matches) void startAccordion(scroller, wrapper);
  media.addEventListener('change', () => {
    if (media.matches) void startAccordion(scroller, wrapper);
  });
}
