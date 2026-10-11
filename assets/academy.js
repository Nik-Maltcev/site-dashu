
(() => {
  const guides = {
    classic: {title:'SIDE-PART & SLICK BACK',category:'01 / КЛАССИКА',image:'assets/academy-classic.png',alt:'Барбер укладывает волосы клиента',steps:['Разотри небольшое количество помады в ладонях.','Распредели по волосам от корней к кончикам.','Задай пробор и направление укладки расчёской.']},
    texture: {title:'CROP & MESSY TEXTURE',category:'02 / ТЕКСТУРА',image:'assets/academy-texture.png',alt:'Руки формируют текстуру волос',steps:['Высуши волосы, сохраняя естественное направление прядей.','Разогрей небольшое количество матового воска в ладонях.','Выдели отдельные пряди пальцами и придай им движение.']},
    care: {title:'ТВОЁ УТРО. ТРИ МИНУТЫ.',category:'03 / УХОД',image:'assets/academy-care.png',alt:'Мужчина наносит пенку на лицо',steps:['Вспень очищающее средство в ладонях с водой.','Мягко очисти лицо, смой пенку и промокни кожу полотенцем.','Нанеси All-in-One лосьон после очищения.']}
  };
  const dialog = document.getElementById('academy-dialog');
  if (!dialog) return;
  let trigger;
  let previousOverflow;
  document.querySelectorAll('[data-guide]').forEach(button => {
    button.addEventListener('click', () => {
      const guide = guides[button.dataset.guide];
      if (!guide) return;
      trigger = button;
      document.getElementById('guide-title').textContent = guide.title;
      document.getElementById('guide-category').textContent = guide.category;
      const image = document.getElementById('guide-image');
      image.src = guide.image;
      image.alt = guide.alt;
      document.getElementById('guide-steps').replaceChildren(...guide.steps.map(text => {
        const step = document.createElement('li'); step.textContent = text; return step;
      }));
      previousOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      dialog.showModal();
    });
  });
  dialog.querySelector('.academy-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
  });
  dialog.addEventListener('close', () => {
    document.body.style.overflow = previousOverflow || '';
    trigger?.focus({preventScroll:true});
  });
  dialog.querySelector('.academy-collection-link').addEventListener('click', () => {
    dialog.close();
    location.hash = 'collection';
    document.getElementById('collection').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'});
  });
})();
