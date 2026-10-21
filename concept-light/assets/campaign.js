(() => {
  'use strict';
  const nav = document.querySelector('.site-nav nav');
  if (nav) {
    nav.id = 'main-navigation';
    const toggle = document.createElement('button');
    toggle.type = 'button'; toggle.className = 'mobile-menu-toggle';
    toggle.setAttribute('aria-controls',nav.id); toggle.setAttribute('aria-expanded','false');
    toggle.setAttribute('aria-label','Открыть меню'); toggle.textContent = '☰';
    nav.parentElement.append(toggle);
    const close = () => {nav.classList.remove('mobile-open');toggle.setAttribute('aria-expanded','false');toggle.setAttribute('aria-label','Открыть меню');toggle.textContent='☰';};
    toggle.addEventListener('click', () => {
      const open = !nav.classList.contains('mobile-open'); nav.classList.toggle('mobile-open',open);
      toggle.setAttribute('aria-expanded',String(open));toggle.setAttribute('aria-label',open?'Закрыть меню':'Открыть меню');toggle.textContent=open?'×':'☰';
    });
    nav.addEventListener('click',e => {if(e.target.closest('a'))close();});
    document.addEventListener('keydown',e => {if(e.key==='Escape'){close();}});
    document.addEventListener('click',e => {if(!nav.parentElement.contains(e.target))close();});
  }
  const video = document.getElementById('campaign-video');
  const play = document.querySelector('[data-film-toggle]');
  if (video && play) {
    const sync = () => {play.textContent=video.paused?'▶':'Ⅱ';play.setAttribute('aria-label',video.paused?'Воспроизвести видео':'Приостановить видео');play.setAttribute('aria-pressed',String(!video.paused));};
    play.addEventListener('click',() => {if(video.paused)video.play().catch(sync);else video.pause();});
    video.addEventListener('play',sync);video.addEventListener('pause',sync);sync();
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    if(reduced.matches){video.pause();video.removeAttribute('autoplay');}else video.play().catch(sync);
  }
  const mood = document.getElementById('mood-result');
  const products = window.DASHU_PRODUCTS || [];
  const choices = {
    natural:{id:'super-mat-wax',title:'Естественная текстура',text:'Матовый финиш и пластичная форма. Для укладки, которая остаётся твоей.'},
    smooth:{id:'shine-pomade',title:'Гладкая укладка',text:'Выразительный блеск, аккуратный пробор и форма с характером.'},
    volume:{id:'volume-tonic',title:'Лёгкий объём',text:'Движение прядей и форма у корней. Подготовь волосы тоником перед укладкой.'}
  };
  const esc = s => String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function showMood(key){
    const choice=choices[key],p=products.find(p=>p.id===choice?.id);if(!p||!mood)return;
    mood.innerHTML=`<img src="${esc(p.image)}" alt="DASHU ${esc(p.name)}"${window.DASHU_IMAGE_ATTRS?.(p,'100px')||' loading="lazy"'}><div><strong>${esc(choice.title)}</strong><p>${esc(choice.text)}</p><a href="product.html?id=${encodeURIComponent(p.id)}">${esc(p.name)} ↗</a></div>`;
    document.querySelectorAll('[data-mood]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.mood===key)));
  }
  if(mood){document.querySelectorAll('[data-mood]').forEach(b=>b.addEventListener('click',()=>showMood(b.dataset.mood)));showMood('natural');}
})();
