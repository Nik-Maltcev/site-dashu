(() => {
  'use strict';
  const products = window.DASHU_PRODUCTS || [];
  const rail = document.getElementById('revision-products');
  const count = document.getElementById('revision-rail-count');
  const progress = document.querySelector('.r-rail-progress');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  const arrow = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M5 19 19 5M5 5h14v14"/></svg>';
  const safe = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const money = value => new Intl.NumberFormat('ru-RU').format(value) + ' ₽';
  const essentials = ['super-mat-wax','shine-pomade','foam-cleansing','all-in-one-lotion'];
  const arrows = [...document.querySelectorAll('[data-rail-direction]')];
  function updatePosition() {
    const max = rail.scrollWidth - rail.clientWidth;
    const position = max > 1 ? Math.max(0,Math.min(100,100 * rail.scrollLeft / max)) : 100;
    progress.style.setProperty('--position', position + '%');
    progress.setAttribute('aria-valuenow', String(Math.round(position)));
    arrows[0].disabled = rail.scrollLeft <= 2;
    arrows[1].disabled = max <= 1 || rail.scrollLeft >= max - 2;
  }
  function render(category) {
    const selection = category === 'essentials' ? essentials.map(id => products.find(p => p.id === id)).filter(Boolean) : products.filter(p => category === 'all' || p.group === category);
    rail.innerHTML = selection.map((p,index) => {
      const v = p.variants[0];
      return `<article class="r-product"><a href="product.html?id=${encodeURIComponent(p.id)}" class="r-product-image" aria-label="Открыть ${safe(p.name)}"><span class="r-product-index">${String(index+1).padStart(2,'0')} / DASHU</span><img src="${safe(p.image)}" alt="DASHU ${safe(p.name)}"${window.DASHU_IMAGE_ATTRS(p,'(max-width:760px) 70vw, (max-width:1100px) 32vw, 24vw')}><span class="r-product-open">${arrow}</span></a><div class="r-product-copy"><p>${safe(p.subtitle)}</p><h3><a href="product.html?id=${encodeURIComponent(p.id)}">${safe(p.name)}</a></h3><span class="r-product-size">${safe(v.label)}</span><strong class="r-product-price">${money(v.price)}</strong><button data-add="${safe(p.id)}" aria-label="Добавить ${safe(p.name)} в корзину">В корзину ${arrow}</button></div></article>`;
    }).join('');
    count.textContent = selection.length + ' ' + (selection.length === 1 ? 'средство' : selection.length < 5 ? 'средства' : 'средств');
    rail.scrollLeft = 0;
    updatePosition();
  }
  document.querySelectorAll('[data-rail-filter]').forEach(button => button.addEventListener('click', () => {
    document.querySelectorAll('[data-rail-filter]').forEach(b => b.setAttribute('aria-pressed',String(b === button)));
    render(button.dataset.railFilter);
  }));
  arrows.forEach(b => b.addEventListener('click', () => {
    const card = rail.querySelector('.r-product');
    const distance = card ? card.getBoundingClientRect().width + 20 : rail.clientWidth * .8;
    rail.scrollBy({left:Number(b.dataset.railDirection) * distance,behavior:reduce.matches ? 'instant' : 'smooth'});
  }));
  rail.addEventListener('scroll',updatePosition,{passive:true});
  rail.addEventListener('keydown',event => {
    if (event.target !== rail || !['ArrowLeft','ArrowRight','Home','End'].includes(event.key)) return;
    event.preventDefault();
    if (event.key === 'Home' || event.key === 'End') rail.scrollTo({left:event.key === 'Home' ? 0 : rail.scrollWidth,behavior:reduce.matches ? 'instant' : 'smooth'});
    else rail.scrollBy({left:(event.key === 'ArrowLeft' ? -1 : 1) * rail.clientWidth * .8,behavior:reduce.matches ? 'instant' : 'smooth'});
  });
  new ResizeObserver(updatePosition).observe(rail);
  render('essentials');

  const menu = document.querySelector('.r-menu');
  const nav = document.getElementById('revision-nav');
  const menuIcon = '<path d="M4 7h16M4 12h16M4 17h16"/>';
  function toggleMenu(open) {
    menu.setAttribute('aria-expanded',String(open));
    menu.setAttribute('aria-label',open ? 'Закрыть меню' : 'Открыть меню');
    menu.querySelector('svg').innerHTML = open ? '<path d="m6 6 12 12M6 18 18 6"/>' : menuIcon;
    nav.classList.toggle('is-open',open);
  }
  menu.addEventListener('click',() => toggleMenu(menu.getAttribute('aria-expanded') !== 'true'));
  nav.querySelectorAll('a').forEach(a => a.addEventListener('click',() => toggleMenu(false)));
  document.querySelectorAll('a[href^="#"]').forEach(link => link.addEventListener('click',event => {
    const target = document.getElementById(link.getAttribute('href').slice(1));
    if (!target) return;
    event.preventDefault();
    target.scrollIntoView({behavior:reduce.matches ? 'instant' : 'smooth',block:'start'});
    history.replaceState(null,'',link.getAttribute('href'));
  }));
  document.addEventListener('keydown',event => {if(event.key === 'Escape' && menu.getAttribute('aria-expanded') === 'true'){toggleMenu(false);menu.focus();}});

  const video = document.getElementById('revision-film');
  const toggle = document.getElementById('revision-film-toggle');
  const playIcon = '<path d="m8 5 11 7-11 7Z"/>';
  const pauseIcon = '<path d="M9 5v14M15 5v14"/>';
  function videoState() {
    toggle.querySelector('svg').innerHTML = video.paused ? playIcon : pauseIcon;
    toggle.setAttribute('aria-label',video.paused ? 'Включить видео' : 'Приостановить видео');
    toggle.setAttribute('aria-pressed',String(!video.paused));
  }
  video.addEventListener('play',videoState);
  video.addEventListener('pause',videoState);
  video.addEventListener('error',() => {toggle.hidden = true;});
  toggle.addEventListener('click',() => {if(video.paused)video.play().catch(videoState);else video.pause();});
  if (reduce.matches) {video.autoplay = false;video.pause();}
  else video.play().catch(videoState);
  videoState();
})();
