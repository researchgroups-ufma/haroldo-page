/**
 * ============================================================================
 *  Arquivo      : course-tabs.ts
 *  Projeto      : Site Pessoal Acadêmico — Prof. Haroldo
 *  Descrição    : Script das abas da página de disciplina (RF-24): alterna os
 *                 painéis, atualiza o `#id` da URL, escolhe a aba pelo `#id`
 *                 (do painel ou de um elemento dentro dele, rolando até ele) e
 *                 trata as setas, `Home` e `End` do teclado.
 *  Autor        : Desenvolvedor
 *  Criado em    : 2026-09-30
 *  Atualizado em: 2026-10-07
 *  Versão       : 0.2.0
 *
 *  Dependências : nenhuma
 *  Entradas     : DOM de `CourseTabs` (`#curso-abas`) e dos painéis de `CourseView`
 *  Saídas       : efeito colateral no DOM; nenhuma exportação
 *  Uso          : <script>import '../scripts/course-tabs';</script> em `CourseView`
 *
 *  Notas        : melhoria progressiva (RNF-02) — sem JS, ou com uma seção só, o
 *                 `tablist` fica oculto e as seções ficam empilhadas. Lógica movida
 *                 sem mudança de `[slug].astro` (plano 064); importado no fim da
 *                 view para o script sair depois de `</main>`, como antes.
 * ============================================================================
 */
const tablist = document.getElementById('curso-abas');
const tabs = tablist ? [...tablist.querySelectorAll<HTMLButtonElement>('[role="tab"]')] : [];

// Com uma seção só não há o que alternar — ficam os títulos e a página empilhada.
if (tablist && tabs.length > 1) {
  const panels = tabs.map(
    (tab) => document.getElementById(tab.getAttribute('aria-controls') ?? '') as HTMLElement,
  );

  const select = (index: number, { focus = false, updateHash = false } = {}) => {
    tabs.forEach((tab, i) => {
      const selected = i === index;
      tab.setAttribute('aria-selected', String(selected));
      tab.tabIndex = selected ? 0 : -1;
      panels[i].hidden = !selected;
    });
    if (focus) tabs[index].focus();
    if (updateHash) history.replaceState(null, '', `#${panels[index].id}`);
  };

  panels.forEach((panel, i) => {
    panel.setAttribute('role', 'tabpanel');
    panel.setAttribute('aria-labelledby', tabs[i].id);
    panel.tabIndex = 0;
  });
  tablist.hidden = false;
  tablist.parentElement?.setAttribute('data-abas', '');

  // O `#id` escolhe a aba quando é o do painel ou o de algo dentro dele — o atalho da aula aponta
  // para o script na aba Scripts (sabatina "Ensino modelo A", Decisão 12). Nesse caso, depois de
  // mostrar a aba, rola até o alvo: antes ele estava num painel oculto e não tinha posição.
  const target = () => {
    const id = decodeURIComponent(location.hash.slice(1));
    return id ? document.getElementById(id) : null;
  };
  const fromHash = () => {
    const element = target();
    return element ? panels.findIndex((panel) => panel.contains(element)) : -1;
  };
  const reveal = () => {
    const index = fromHash();
    if (index < 0) return false;
    select(index);
    const element = target();
    if (element && element !== panels[index]) element.scrollIntoView({ block: 'start' });
    return true;
  };
  if (!reveal()) select(0);
  window.addEventListener('hashchange', reveal);

  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => select(i, { updateHash: true }));
    tab.addEventListener('keydown', (event) => {
      const last = tabs.length - 1;
      const targets: Record<string, number> = {
        ArrowRight: i === last ? 0 : i + 1,
        ArrowLeft: i === 0 ? last : i - 1,
        Home: 0,
        End: last,
      };
      const next = targets[event.key];
      if (next === undefined) return;
      event.preventDefault();
      select(next, { focus: true, updateHash: true });
    });
  });
}
