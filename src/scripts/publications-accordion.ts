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
 *                 de `publicacoes.astro` (plano 064). Desde 2026-10-09 os
 *                 cabeçalhos ficam compactos com a sanfona, e ela recua para a
 *                 lista aberta quando não sobra espaço para o ano aberto
 *                 (sabatina "Sanfona de Publicações", Decisão 1).
 * ============================================================================
 */

/** Rolagem (px) gasta para fechar um ano e abrir o seguinte. */
const TRANSITION = 400;

/** Altura mínima (px) do ano aberto, cerca de dois artigos; abaixo dela, lista aberta. */
const MIN_OPEN = 160;

/** Classe que deixa os cabeçalhos dos anos compactos enquanto a sanfona roda. */
const COMPACT = 'sanfona-compacta';

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

  // Mede com os cabeçalhos compactos, que é como a sanfona os mostra. Com muitos anos numa janela
  // baixa, a soma deles passava da altura do cartão e nenhum ano abria (diagnóstico de 2026-10-09).
  const fits = () => {
    const compact = wrapper.classList.contains(COMPACT);
    wrapper.classList.add(COMPACT);
    const ok = available() >= MIN_OPEN;
    if (!compact) wrapper.classList.remove(COMPACT);
    return ok;
  };

  let active = false;
  let mm: ReturnType<typeof gsap.matchMedia> | undefined;
  const setup = () => {
    mm = gsap.matchMedia();
    mm.add(QUERY, () => {
      active = fits();
      if (!active) return;
      wrapper.classList.add(COMPACT);
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
          // medidas de novo, sem herdar o valor animado do momento. Só o primeiro ano aplica a
          // altura aberta já na criação; nos outros, o `immediateRender` padrão abria o ano antes
          // da hora e o texto dele cobria os cabeçalhos (diagnóstico de 2026-10-09).
          timeline
            .fromTo(
              bodies[i],
              { height: () => openHeight(i) },
              { height: 0, duration: TRANSITION, ease: 'power1.inOut', immediateRender: i === 0 },
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

      // O bloco fica fixo por `position: sticky` (CSS da view), na altura do cartão, e o pai dele
      // (o trilho) ganha a altura do cartão mais a rolagem do timeline — altura, não padding, porque
      // o sticky só desliza dentro da caixa de conteúdo do pai. O `pin` do ScrollTrigger num scroller
      // próprio é do tipo `transform`, corrigido no evento `scroll` depois que o compositor já
      // rolou: na rolagem rápida o texto passava por cima dos anos e abria faixa em branco; e o
      // `pinType: 'fixed'` tira a roda do mouse do `#conteudo` (diagnóstico de 2026-10-09).
      const track = wrapper.parentElement as HTMLElement;
      track.style.height = `calc(var(--altura-cartao) + ${timeline.duration()}px)`;
      const setCardHeight = () =>
        scroller.style.setProperty('--altura-cartao', `${scroller.clientHeight}px`);
      // Já na montagem: o primeiro refresh do ScrollTrigger pode esperar o `load` da página, e até
      // lá o bloco e o trilho ficariam sem altura.
      setCardHeight();

      // Gatilho é o pai, que não se move: o bloco grudado mudaria o `start` medido num refresh.
      const trigger = ScrollTrigger.create({
        trigger: track,
        scroller,
        start: 'top top',
        end: () => `+=${timeline.duration()}`,
        scrub: 0.4,
        animation: timeline,
        invalidateOnRefresh: true,
        onRefreshInit: setCardHeight,
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
        wrapper.classList.remove(COMPACT);
        track.style.height = '';
      };
    });
  };
  setup();

  // A altura da janela decide se a sanfona cabe: ao mudar, monta ou desmonta.
  let timer: number | undefined;
  window.addEventListener('resize', () => {
    window.clearTimeout(timer);
    timer = window.setTimeout(() => {
      if (media.matches && fits() !== active) {
        mm?.revert();
        setup();
      }
    }, 200);
  });
}

// Com um ano só não há o que sanfonar — a lista fica como está.
if (scroller && wrapper && sections.length > 1) {
  if (media.matches) void startAccordion(scroller, wrapper);
  media.addEventListener('change', () => {
    if (media.matches) void startAccordion(scroller, wrapper);
  });
}
