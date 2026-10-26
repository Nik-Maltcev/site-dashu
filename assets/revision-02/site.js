(() => {
  'use strict';
  if (document.documentElement.classList.contains('graphite-buttons')) {
    document.querySelectorAll('a[href]').forEach(link => {
      const href = link.getAttribute('href');
      if (href.startsWith('revision-02.html')) link.setAttribute('href',href.replace('revision-02.html','revision-03.html'));
      else if (href === 'stylist.html') link.setAttribute('href','stylist.html?buttons=graphite');
    });
  }
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const menu = document.querySelector('.r-menu');
  const nav = document.getElementById('revision-nav');
  function toggleMenu(open) {
    menu.setAttribute('aria-expanded',String(open));
    menu.setAttribute('aria-label',open ? 'Закрыть меню' : 'Открыть меню');
    menu.querySelector('svg').innerHTML = open ? '<path d="m6 6 12 12M6 18 18 6"/>' : '<path d="M4 7h16M4 12h16M4 17h16"/>';
    nav.classList.toggle('is-open',open);
  }
  menu.addEventListener('click',() => toggleMenu(menu.getAttribute('aria-expanded') !== 'true'));
  nav.querySelectorAll('a').forEach(a => a.addEventListener('click',() => toggleMenu(false)));
  document.addEventListener('keydown',event => {if(event.key === 'Escape' && menu.getAttribute('aria-expanded') === 'true'){toggleMenu(false);menu.focus();}});
  document.addEventListener('click',event => {
    const link = event.target.closest('a[href^="#"]');
    if (!link) return;
    const target = document.getElementById(link.getAttribute('href').slice(1));
    if (!target) return;
    event.preventDefault();
    target.scrollIntoView({behavior:reduce.matches ? 'instant' : 'smooth',block:'start'});
    history.replaceState(null,'',link.getAttribute('href'));
  });
  const ticker = document.querySelector('.r-bluebar');
  const toggle = document.querySelector('.r-ticker-toggle');
  toggle.hidden = reduce.matches;
  toggle.addEventListener('click',() => {
    const paused = ticker.classList.toggle('is-paused');
    toggle.setAttribute('aria-pressed',String(paused));
    toggle.setAttribute('aria-label',paused ? 'Запустить бегущую строку' : 'Приостановить бегущую строку');
    toggle.querySelector('svg').innerHTML = paused ? '<path d="m8 5 11 7-11 7Z"/>' : '<path d="M9 5v14M15 5v14"/>';
  });
})();
