(() => {
  'use strict';
  const nav=document.querySelector('.site-nav nav');
  if(nav){
    nav.id='main-navigation';
    const toggle=document.createElement('button');
    toggle.type='button';toggle.className='refinement-menu-toggle';toggle.textContent='☰';
    toggle.setAttribute('aria-controls',nav.id);toggle.setAttribute('aria-expanded','false');toggle.setAttribute('aria-label','Открыть меню');
    nav.parentElement.append(toggle);
    const setOpen=open=>{nav.classList.toggle('mobile-open',open);toggle.setAttribute('aria-expanded',String(open));toggle.setAttribute('aria-label',open?'Закрыть меню':'Открыть меню');toggle.textContent=open?'×':'☰';};
    toggle.addEventListener('click',()=>setOpen(!nav.classList.contains('mobile-open')));
    nav.addEventListener('click',e=>{if(e.target.closest('a'))setOpen(false);});
    document.addEventListener('keydown',e=>{if(e.key==='Escape')setOpen(false);});
    document.addEventListener('click',e=>{if(!nav.parentElement.contains(e.target))setOpen(false);});
  }
  const video=document.getElementById('campaign-video'),button=document.querySelector('[data-film-toggle]');
  if(video&&button){
    const sync=()=>{button.textContent=video.paused?'▶':'Ⅱ';button.setAttribute('aria-label',video.paused?'Воспроизвести видео':'Приостановить видео');button.setAttribute('aria-pressed',String(!video.paused));};
    button.addEventListener('click',()=>{if(video.paused)video.play().catch(sync);else video.pause();});
    video.addEventListener('play',sync);video.addEventListener('pause',sync);sync();
    if(matchMedia('(prefers-reduced-motion: reduce)').matches){video.pause();video.removeAttribute('autoplay');}else video.play().catch(sync);
  }
})();
