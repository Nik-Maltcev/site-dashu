const collection = [
  {id:'wax',category:'styling',type:'МАТОВЫЙ ВОСК / 100 Г',name:'Premium Ultra Mat Wax',image:'assets/v2-image-2.jpg',price:'2 490 ₽',description:'Матовый воск для выразительной укладки и разделения прядей. Подходит для коротких и средних волос: нанесите небольшое количество на сухие волосы после разогрева в ладонях.',specs:[['Фиксация','5 / 5'],['Матовость','5 / 5'],['Объём','100 г']]},
  {id:'pomade',category:'styling',type:'ВОДНАЯ ПОМАДА / 100 Г',name:'Incredible Shine Pomade',image:'assets/v2-image-3.jpg',price:'2 890 ₽',description:'Помада на водной основе для аккуратного пробора, slick back и гладкой формы с блеском. Распределите по волосам и задайте направление расчёской.',specs:[['Фиксация','4 / 5'],['Блеск','4 / 5'],['Основа','Водная']]},
  {id:'foam',category:'care',type:'ОЧИЩАЮЩАЯ ПЕНКА / 150 МЛ',name:'Daily Fast Clean Foam',image:'assets/v2-image-4.jpg',price:'2 190 ₽',description:'Пенка с углём для ежедневного очищения кожи. Вспеньте небольшое количество с водой, мягко распределите по влажному лицу и тщательно смойте.',specs:[['Задача','Очищение'],['Активный компонент','Уголь'],['Объём','150 мл']]},
  {id:'lotion',category:'care',type:'ALL-IN-ONE ЛОСЬОН / 153 МЛ',name:'All-in-One Lotion',image:'assets/v2-image-5.jpg',price:'2 690 ₽',description:'Ежедневный лосьон All-in-One для простого ухода после очищения. Распределите небольшое количество по коже лица, избегая области вокруг глаз.',specs:[['Задача','Увлажнение'],['Формат','All-in-One'],['Объём','153 мл']]}
];
const grid = document.getElementById('products');
for(const [index,product] of collection.entries()){
  const card=document.createElement('article');
  card.className='product-card';card.dataset.category=product.category;
  card.innerHTML=`<div class="product-visual"><img src="${product.image}" alt="DASHU ${product.name}" loading="lazy"><span class="product-nr">0${index+1} / DASHU</span></div><div class="product-type">${product.type}</div><h3>${product.name}</h3><div class="product-footer"><span class="product-price">${product.price}</span><button class="product-open" data-product="${product.id}" aria-label="Подробнее о ${product.name}">Подробнее ↗</button></div>`;
  grid.append(card);
}
document.querySelectorAll('[data-filter]').forEach(button=>button.addEventListener('click',()=>{
  document.querySelectorAll('[data-filter]').forEach(item=>item.setAttribute('aria-pressed',String(item===button)));
  document.querySelectorAll('.product-card').forEach(card=>card.hidden=button.dataset.filter!=='all'&&card.dataset.category!==button.dataset.filter);
}));
const dialog=document.getElementById('product-dialog');
let lastTrigger;
grid.addEventListener('click',event=>{
  const trigger=event.target.closest('[data-product]');if(!trigger)return;
  const product=collection.find(item=>item.id===trigger.dataset.product);if(!product)return;
  lastTrigger=trigger;
  document.getElementById('dialog-image').src=product.image;
  document.getElementById('dialog-image').alt='DASHU '+product.name;
  document.getElementById('dialog-category').textContent=product.type;
  document.getElementById('dialog-title').textContent=product.name;
  document.getElementById('dialog-description').textContent=product.description;
  document.getElementById('dialog-price').textContent=product.price;
  document.getElementById('dialog-specs').innerHTML=product.specs.map(([label,value])=>`<div><span>${label}</span><span>${value}</span></div>`).join('');
  dialog.showModal();
});
dialog.querySelector('.dialog-close').addEventListener('click',()=>dialog.close());
dialog.addEventListener('click',event=>{if(event.target===dialog){const box=dialog.getBoundingClientRect();if(event.clientX<box.left||event.clientX>box.right||event.clientY<box.top||event.clientY>box.bottom)dialog.close();}});
dialog.addEventListener('close',()=>lastTrigger?.focus());
