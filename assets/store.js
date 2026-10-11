(() => {
  'use strict';
  const products = window.DASHU_PRODUCTS || [];
  const categories = {
    'hair-clean':'Шампуни',prestyling:'Престайлинг',styling:'Воски, помады и кремы',finish:'Финишный стайлинг',correction:'Коррекция и густота','skin-clean':'Очищение лица и тела','skin-care':'Уход за кожей'
  };
  const money = value => new Intl.NumberFormat('ru-RU').format(value) + ' ₽';
  const safe = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const find = id => products.find(p => p.id === id);
  const storageKey = 'dashu-demo-cart-v1';
  let cart = [];
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) || '[]');
    if (Array.isArray(saved)) cart = saved.filter(item => find(item.id)?.variants[item.variant] && Number.isInteger(item.qty) && item.qty > 0 && item.qty <= 99);
  } catch (_) {}
  const count = () => cart.reduce((sum,item) => sum + item.qty,0);
  const subtotal = () => cart.reduce((sum,item) => sum + find(item.id).variants[item.variant].price * item.qty,0);
  const save = () => {
    try { localStorage.setItem(storageKey, JSON.stringify(cart)); } catch (_) {}
    document.querySelectorAll('[data-cart-count]').forEach(el => el.textContent = count());
  };
  const toast = document.getElementById('store-toast');
  let toastTimer;
  function notify(text) {
    if (!toast) return;
    toast.textContent = text; toast.hidden = false;
    clearTimeout(toastTimer); toastTimer = setTimeout(() => toast.hidden = true, 3000);
  }
  function add(id, variant = 0, qty = 1) {
    const product = find(id); if (!product?.variants[variant]) return;
    qty = Math.max(1,Math.min(99,Math.floor(Number(qty) || 1)));
    const item = cart.find(i => i.id === id && i.variant === variant);
    if (item) item.qty = Math.min(99,item.qty + qty); else cart.push({id,variant,qty});
    save(); notify('Добавлено в корзину · ' + product.name);
  }
  const productUrl = id => 'product.html?id=' + encodeURIComponent(id);
  function card(product) {
    const variant = product.variants[0];
    return `<article class="product-card" data-home-category="${product.group === 'hair' ? 'styling' : 'care'}"><a class="product-visual shop-visual" href="${productUrl(product.id)}" aria-label="Открыть ${safe(product.name)}"><img src="${safe(product.image)}" alt="DASHU ${safe(product.name)}" loading="lazy"><span class="product-nr">${safe(variant.label)}</span></a><div class="product-type">${safe(categories[product.category])}</div><h3><a href="${productUrl(product.id)}">${safe(product.name)}</a></h3><p class="shop-product-subtitle">${safe(product.subtitle)}</p><div class="product-footer"><span class="product-price">${money(variant.price)}</span><button class="quick-add" data-add="${product.id}" aria-label="Добавить ${safe(product.name)} в корзину">В корзину <span aria-hidden="true">+</span></button></div></article>`;
  }
  document.addEventListener('click', event => {
    const button = event.target.closest('[data-add]');
    if (button) add(button.dataset.add);
  });
  save();

  const featured = document.getElementById('products');
  if (featured) {
    featured.innerHTML = ['super-mat-wax','shine-pomade','foam-cleansing','all-in-one-lotion'].map(id => card(find(id))).join('');
    document.querySelectorAll('[data-filter]').forEach(button => button.addEventListener('click', () => {
      document.querySelectorAll('[data-filter]').forEach(item => item.setAttribute('aria-pressed',String(item === button)));
      featured.querySelectorAll('.product-card').forEach(item => item.hidden = button.dataset.filter !== 'all' && item.dataset.homeCategory !== button.dataset.filter);
    }));
  }

  const catalogue = document.getElementById('catalog-grid');
  if (catalogue) {
    const params = new URLSearchParams(location.search);
    const state = {group: ['hair','skin'].includes(params.get('group')) ? params.get('group') : 'all', category:categories[params.get('category')] ? params.get('category') : 'all'};
    const search = document.getElementById('catalog-search');
    const sort = document.getElementById('catalog-sort');
    const price = document.getElementById('catalog-price');
    const hold = document.getElementById('catalog-hold');
    document.getElementById('category-list').innerHTML = `<button data-category="all">Все средства <span>${products.length}</span></button>` + Object.entries(categories).map(([id,label]) => `<button data-category="${id}">${label}<span>${products.filter(p => p.category === id).length}</span></button>`).join('');
    function render() {
      const term = search.value.trim().toLocaleLowerCase('ru');
      let result = products.filter(p => (state.group === 'all' || p.group === state.group) && (state.category === 'all' || p.category === state.category) && [p.name,p.subtitle,p.description,categories[p.category]].join(' ').toLocaleLowerCase('ru').includes(term));
      result = result.filter(p => {
        const amount = p.variants[0].price;
        return (price.value === 'all' || (price.value === 'low' && amount < 3000) || (price.value === 'mid' && amount >= 3000 && amount < 4000) || (price.value === 'high' && amount >= 4000)) && (hold.value === 'all' || (hold.value === 'light' && p.hold >= 1 && p.hold <= 3) || (hold.value === 'strong' && p.hold >= 6));
      });
      if (sort.value === 'price-up') result.sort((a,b) => a.variants[0].price-b.variants[0].price);
      if (sort.value === 'price-down') result.sort((a,b) => b.variants[0].price-a.variants[0].price);
      if (sort.value === 'name') result.sort((a,b) => a.name.localeCompare(b.name));
      catalogue.innerHTML = result.map(card).join('');
      document.getElementById('catalog-count').textContent = `Найдено: ${result.length} из ${products.length}`;
      document.getElementById('catalog-empty').hidden = result.length > 0;
      document.querySelectorAll('[data-category]').forEach(b => b.setAttribute('aria-pressed',String(b.dataset.category === state.category)));
      document.querySelectorAll('[data-group]').forEach(b => b.setAttribute('aria-pressed',String(b.dataset.group === state.group)));
      const query = new URLSearchParams();
      if (state.group !== 'all') query.set('group',state.group);
      if (state.category !== 'all') query.set('category',state.category);
      history.replaceState(null,'',location.pathname+(query.size ? '?' + query : ''));
    }
    document.querySelectorAll('[data-group]').forEach(b => b.addEventListener('click', () => {state.group = b.dataset.group; state.category = 'all';render();}));
    document.getElementById('category-list').addEventListener('click', event => {
      const b = event.target.closest('[data-category]');if (!b) return;
      state.category = b.dataset.category;state.group = 'all';render();
    });
    [search,sort,price,hold].forEach(el => el.addEventListener(el === search ? 'input' : 'change',render));
    document.querySelectorAll('[data-reset-filters]').forEach(b => b.addEventListener('click', () => {state.group='all';state.category='all';search.value='';sort.value='default';price.value='all';hold.value='all';render();}));
    render();
  }

  const detail = document.getElementById('product-detail');
  if (detail) {
    const product = find(new URLSearchParams(location.search).get('id'));
    if (!product) {
      detail.innerHTML = '<div class="empty-state"><span class="eyebrow quiet">DASHU / COLLECTION</span><h1>Средство не найдено.</h1><p>Выбери своё средство в коллекции DASHU.</p><a href="catalog.html" class="solid-link">В КАТАЛОГ ↗</a></div>';
    } else {
      document.title = product.name + ' — DASHU';
      document.getElementById('product-breadcrumb').textContent = product.subtitle;
      let variant = 0;
      detail.innerHTML = `<div class="detail-photo"><img id="detail-image" src="${safe(product.image)}" alt="DASHU ${safe(product.name)}"><span class="detail-photo-note">DASHU / ${product.group === 'hair' ? 'HAIR' : 'SKIN'} COLLECTION</span></div><div class="detail-copy"><a class="eyebrow quiet" href="catalog.html?category=${product.category}">${safe(categories[product.category])} ↗</a><h1>${safe(product.name)}</h1><p class="detail-subtitle">${safe(product.subtitle)}</p><div class="detail-price" id="detail-price">${money(product.variants[0].price)}</div><p class="price-note">Ориентировочная цена для демонстрации</p><fieldset class="variant-picker"><legend>Объём</legend>${product.variants.map((v,i) => `<button type="button" data-variant="${i}" aria-pressed="${i===0}">${safe(v.label)}</button>`).join('')}</fieldset><form id="product-add-form" class="detail-actions"><div class="quantity-control"><button type="button" data-detail-minus aria-label="Уменьшить количество">−</button><input id="detail-quantity" type="number" min="1" max="99" value="1" required aria-label="Количество товара"><button type="button" data-detail-plus aria-label="Увеличить количество">+</button></div><button type="submit" class="solid-link">ДОБАВИТЬ В КОРЗИНУ <span aria-hidden="true">+</span></button></form><a class="detail-cart-link" href="cart.html">ПЕРЕЙТИ В КОРЗИНУ ↗</a><details open><summary>О средстве</summary><p>${safe(product.description)}</p></details><details><summary>Характеристики</summary><dl class="detail-specs">${product.specs.map(([label,value]) => `<div><dt>${safe(label)}</dt><dd>${safe(value)}</dd></div>`).join('')}</dl></details><details><summary>Доставка и оплата</summary><p>Курьерская доставка и пункты выдачи. В демонстрации стоимость доставки — 390 ₽, при заказе от 6 000 ₽ — бесплатно. На этапе оформления можно выбрать способ получения. Заказы и платежи в этом макете не отправляются.</p></details></div>`;
      const qty = document.getElementById('detail-quantity');
      detail.querySelectorAll('[data-variant]').forEach(b => b.addEventListener('click', () => {
        variant = Number(b.dataset.variant);
        detail.querySelectorAll('[data-variant]').forEach(el => el.setAttribute('aria-pressed',String(el===b)));
        document.getElementById('detail-price').textContent = money(product.variants[variant].price);
        document.getElementById('detail-image').src = product.variants[variant].image;
      }));
      detail.querySelector('[data-detail-minus]').addEventListener('click', () => qty.value = Math.max(1,(Number(qty.value)||1)-1));
      detail.querySelector('[data-detail-plus]').addEventListener('click', () => qty.value = Math.min(99,(Number(qty.value)||1)+1));
      document.getElementById('product-add-form').addEventListener('submit', event => {event.preventDefault();add(product.id,variant,Number(qty.value));});
      const related = products.filter(p => p.id !== product.id && p.group === product.group).slice(0,4);
      document.getElementById('related-products').innerHTML = related.map(card).join('');
    }
  }

  function cartRows() {
    return cart.map((item,index) => {
      const product = find(item.id), variant = product.variants[item.variant];
      return `<article class="cart-row"><a class="cart-photo" href="${productUrl(product.id)}"><img src="${safe(variant.image)}" alt="${safe(product.name)}"></a><div class="cart-item-copy"><span class="eyebrow quiet">${safe(variant.label)}</span><h2><a href="${productUrl(product.id)}">${safe(product.name)}</a></h2><p>${safe(product.subtitle)}</p><button class="remove-item" data-remove="${index}">Удалить</button></div><div class="quantity-control"><button data-cart-change="${index}" data-delta="-1" aria-label="Уменьшить количество ${safe(product.name)}" ${item.qty===1?'disabled':''}>−</button><span aria-live="polite">${item.qty}</span><button data-cart-change="${index}" data-delta="1" aria-label="Увеличить количество ${safe(product.name)}" ${item.qty===99?'disabled':''}>+</button></div><strong class="cart-line-price">${money(variant.price*item.qty)}</strong></article>`;
    }).join('');
  }
  const cartPage = document.getElementById('cart-content');
  const shippingCost = method => method === 'pickup' || subtotal() >= 6000 ? 0 : 390;
  function summaryMarkup(method='courier') {
    const shipping = shippingCost(method);
    return `<div class="summary-row"><span>Товары (${count()})</span><span>${money(subtotal())}</span></div><div class="summary-row"><span>Доставка</span><span>${shipping ? money(shipping) : 'Бесплатно'}</span></div><div class="summary-row summary-total"><span>Итого</span><strong>${money(subtotal()+shipping)}</strong></div>`;
  }
  function renderCart() {
    if (!cartPage) return;
    document.getElementById('cart-heading-count').textContent = count() ? ' / ' + count() : '';
    cartPage.innerHTML = cart.length ? `<div class="cart-layout"><div><div class="cart-list">${cartRows()}</div><a href="catalog.html" class="line-link">ПРОДОЛЖИТЬ ВЫБОР ↗</a></div><aside class="order-summary"><span class="eyebrow quiet">ТВОЙ РИТУАЛ / ЗАКАЗ</span><h2>Всё начинается<br>с выбора.</h2>${summaryMarkup()}<p class="shipping-note">${subtotal()>=6000?'Доставка в подарок.':'До бесплатной доставки — '+money(6000-subtotal())}</p><a href="checkout.html" class="solid-link">К ОФОРМЛЕНИЮ <span aria-hidden="true">↗</span></a><p class="demo-note">Демонстрационный заказ. Оплата не списывается.</p></aside></div>` : `<div class="empty-state"><span class="eyebrow quiet">YOUR RITUAL STARTS HERE</span><h2>Здесь будет<br><em>твой выбор.</em></h2><p>Добавь первое средство — и собери свой ритуал.</p><a href="catalog.html" class="solid-link">ВЫБРАТЬ СРЕДСТВО ↗</a></div>`;
  }
  if (cartPage) {
    renderCart();
    cartPage.addEventListener('click', event => {
      const change = event.target.closest('[data-cart-change]'), remove = event.target.closest('[data-remove]');
      if (change) {const item=cart[Number(change.dataset.cartChange)];if(item)item.qty=Math.max(1,Math.min(99,item.qty+Number(change.dataset.delta)));}
      else if (remove) cart.splice(Number(remove.dataset.remove),1);else return;
      save();renderCart();
    });
  }

  const checkout = document.getElementById('checkout-content');
  if (checkout) {
    if (!cart.length) checkout.innerHTML = '<div class="empty-state"><h2>Сначала — твой выбор.</h2><p>Добавь средства в корзину, чтобы перейти к оформлению.</p><a class="solid-link" href="catalog.html">В КАТАЛОГ ↗</a></div>';
    else {
      checkout.innerHTML = `<div class="checkout-layout"><form id="checkout-form"><div class="checkout-step"><span class="eyebrow quiet">01 / КОНТАКТЫ</span><h2>Познакомимся.</h2><div class="form-grid"><label>Имя<input name="name" autocomplete="given-name" placeholder="Как к тебе обращаться" required maxlength="80"></label><label>Телефон<input name="phone" type="tel" autocomplete="tel" placeholder="+7 999 123-45-67" required pattern="[+0-9() \\-]{10,20}" title="Введите телефон: не менее 10 символов"></label><label class="span-two">Email<input name="email" type="email" autocomplete="email" placeholder="you@example.com" required maxlength="150"></label></div></div><div class="checkout-step"><span class="eyebrow quiet">02 / ДОСТАВКА</span><h2>В твоём ритме.</h2><div class="choice-grid"><label class="choice"><input type="radio" name="delivery" value="courier" checked><span>Курьером<small>До двери · 390 ₽<br>Бесплатно от 6 000 ₽</small></span></label><label class="choice"><input type="radio" name="delivery" value="pickup"><span>Пункт выдачи<small>Демонстрационный пункт<br>Самовывоз · бесплатно</small></span></label></div><div class="form-grid"><label>Город<input name="city" autocomplete="address-level2" placeholder="Москва" required maxlength="100"></label><label id="address-label">Адрес<input name="address" autocomplete="street-address" placeholder="Улица, дом, квартира" required maxlength="200"></label></div></div><div class="checkout-step"><span class="eyebrow quiet">03 / ОПЛАТА</span><h2>Удобно тебе.</h2><div class="choice-grid"><label class="choice"><input type="radio" name="payment" value="online" checked><span>Картой онлайн<small>Демонстрация оплаты</small></span></label><label class="choice"><input type="radio" name="payment" value="receiving"><span>При получении<small>Картой или наличными</small></span></label></div></div><label class="form-consent"><input type="checkbox" required>Я понимаю, что это демонстрация: заказ не отправляется, деньги не списываются.</label><button class="solid-link checkout-submit" type="submit">ЗАВЕРШИТЬ ДЕМО-ЗАКАЗ <span aria-hidden="true">↗</span></button><p class="demo-note">Форма работает только в этом браузере. Данные не отправляются и не сохраняются.</p></form><aside class="order-summary checkout-summary"><span class="eyebrow quiet">ТВОЙ ВЫБОР</span><div class="checkout-items">${cart.map(item=>{const p=find(item.id),v=p.variants[item.variant];return `<div><img src="${safe(v.image)}" alt=""><span>${safe(p.name)}<small>${safe(v.label)} / ${item.qty} шт.</small></span><strong>${money(v.price*item.qty)}</strong></div>`;}).join('')}</div><div id="checkout-totals">${summaryMarkup()}</div><a href="cart.html" class="detail-cart-link">ИЗМЕНИТЬ КОРЗИНУ ↗</a></aside></div>`;
      const form = document.getElementById('checkout-form');
      form.querySelectorAll('[name="delivery"]').forEach(radio=>radio.addEventListener('change',()=>{
        const pickup=form.elements.delivery.value==='pickup';
        document.getElementById('address-label').hidden=pickup;
        form.elements.address.required=!pickup;
        document.getElementById('checkout-totals').innerHTML=summaryMarkup(form.elements.delivery.value);
      }));
      form.addEventListener('submit',event=>{
        event.preventDefault();
        const delivery=form.elements.delivery.value, total=subtotal()+shippingCost(delivery);
        const name=form.elements.name.value.trim();
        cart=[];save();
        checkout.innerHTML=`<div class="order-success"><span class="success-mark" aria-hidden="true">✓</span><span class="eyebrow quiet">DASHU / YOUR RITUAL</span><h2>Твой выбор.<br><em>Хорошее начало.</em></h2><p>${safe(name)}, демонстрационный заказ оформлен.</p><div class="success-total">${money(total)}</div><p class="demo-note">Реальный заказ не создан, данные никуда не отправлены и деньги не списаны.</p><a href="catalog.html" class="solid-link">ВЕРНУТЬСЯ К КОЛЛЕКЦИИ ↗</a></div>`;
        document.getElementById('checkout-title').textContent='ГОТОВО.';
        document.getElementById('checkout-title').scrollIntoView({behavior:'auto'});
        checkout.querySelector('h2').setAttribute('tabindex','-1');checkout.querySelector('h2').focus({preventScroll:true});
      });
    }
  }

  const partner = document.getElementById('partner-dialog');
  if (partner) {
    let opener;
    document.querySelectorAll('[data-partner]').forEach(b=>b.addEventListener('click',()=>{opener=b;partner.querySelector("form").hidden=false;partner.querySelector(".partner-success").hidden=true;partner.querySelector("form").reset();partner.showModal();}));
    partner.querySelector('[data-close-partner]').addEventListener('click',()=>partner.close());
    partner.addEventListener('close',()=>opener?.focus({preventScroll:true}));
    partner.querySelector('form').addEventListener('submit',event=>{
      event.preventDefault();partner.querySelector('form').hidden=true;partner.querySelector('.partner-success').hidden=false;
    });
  }
  window.addEventListener('storage',event=>{
    if(event.key !== storageKey)return;
    try{const saved=JSON.parse(event.newValue||'[]');cart=Array.isArray(saved)?saved.filter(i=>find(i.id)?.variants[i.variant]&&Number.isInteger(i.qty)&&i.qty>0&&i.qty<=99):[];}catch(_){cart=[];}
    save();if(cartPage)renderCart();if(checkout)location.reload();
  });
})();
