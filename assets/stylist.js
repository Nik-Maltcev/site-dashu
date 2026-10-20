(() => {
  'use strict';
  const log=document.getElementById('stylist-messages'),form=document.getElementById('stylist-form'),input=document.getElementById('stylist-input'),options=document.getElementById('stylist-options'),send=document.getElementById('stylist-send'),errorBox=document.getElementById('stylist-error'),status=document.getElementById('stylist-status');
  if (!form)return;
  const apiEndpoint=form.dataset.apiEndpoint||'/api/stylist';
  let history=[],photo=null,pendingPhoto=false,busy=false,available=false,accessRequired=false,accessCode='',failed=false,controller,session=0;
  const safe=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const money=n=>new Intl.NumberFormat('ru-RU').format(n)+' ₽';
  const preview=document.getElementById('photo-preview'),consent=document.getElementById('photo-consent'),consentLabel=document.getElementById('photo-consent-label');
  const initial=log.innerHTML;
  const selection=document.getElementById('stylist-selection');
  function scrollLog(){log.scrollTop=log.scrollHeight;}
  function message(role,text,image){
    const div=document.createElement('div');div.className='stylist-message '+(role==='user'?'stylist-user':'stylist-answer');
    div.innerHTML='<span class="message-label">'+(role==='user'?'ТВОЙ ОТВЕТ':'DASHU / ТВОЙ СТИЛИСТ')+'</span>'+(image?'<img src="'+image+'" alt="Фото волос для подбора">':'')+'<p>'+safe(text)+'</p>';
    log.append(div);scrollLog();
  }
  function setBusy(value){busy=value;send.disabled=!available||busy||accessRequired;input.disabled=busy;document.getElementById('stylist-photo').disabled=busy;options.querySelectorAll('button').forEach(b=>b.disabled=busy||!available||accessRequired);form.setAttribute('aria-busy',String(value));status.textContent=value?'Подбираем твою форму…':available?'Персональный подбор / DASHU':'Консультация скоро откроется';}
  function showError(text,retry=false){errorBox.hidden=false;errorBox.querySelector('p').textContent=text;document.getElementById('stylist-retry').hidden=!retry;}
  function showOptions(labels){options.replaceChildren();labels.forEach(label=>{const b=document.createElement('button');b.type='button';b.textContent=label;b.disabled=!available||accessRequired;b.addEventListener('click',()=>submit(label));options.append(b);});}
  function renderRecommendations(items){
    const valid=items.filter(r=>(window.DASHU_PRODUCTS||[]).some(p=>p.id===r.id));if(!valid.length)return;
    document.getElementById('stylist-products').innerHTML=valid.map((r,index)=>{
      const p=window.DASHU_PRODUCTS.find(p=>p.id===r.id),v=p.variants[0],url='product.html?id='+encodeURIComponent(p.id);
      return `<article class="stylist-recommendation"><a href="${url}" aria-label="Открыть ${safe(p.name)}"><img src="${safe(v.image)}" alt="DASHU ${safe(p.name)}"></a><div class="recommendation-copy"><span class="eyebrow">${index===0?'ТВОЁ ОСНОВНОЕ СРЕДСТВО':'ДОПОЛНИ ТВОЙ РИТУАЛ'}</span><h3><a href="${url}">${safe(p.name)}</a></h3><p>${safe(r.reason)}</p>${r.howToUse?'<div class="recommendation-how"><span>КАК ИСПОЛЬЗОВАТЬ</span><p>'+safe(r.howToUse)+'</p></div>':''}<div class="product-footer"><span class="product-price">${money(v.price)}</span><button class="quick-add" data-add="${safe(p.id)}" aria-label="Добавить ${safe(p.name)} в корзину">В корзину <span aria-hidden="true">+</span></button></div><a class="recommendation-detail" href="${url}">О СРЕДСТВЕ / ${safe(v.label)} ↗</a></div></article>`;
    }).join('');selection.hidden=false;
    message('assistant','Подбор готов. Ниже — средства для твоего ритуала с объяснением и советами по применению.');
    const link=document.createElement('a');link.className='line-link';link.href='#stylist-selection';link.textContent='ПОСМОТРЕТЬ МОЙ ПОДБОР ↗';log.lastElementChild.append(link);scrollLog();
  }
  async function submit(text,retry=false){
    if(busy)return;
    if(!available){showError('Консультация пока не подключена. Можно посмотреть коллекцию в каталоге.');return;}
    if(accessRequired){showError('Введи код для просмотра консультации.');return;}
    if(photo&&!consent.checked){showError('Разреши использовать фото для подбора или удали снимок.');consent.focus();return;}
    if(!retry){
      if(failed){showError('Повтори последний запрос или начни новый подбор.',true);return;}
      text=text.trim();if(!text&&pendingPhoto)text='Помоги подобрать средство по моим волосам на фото. Уточни, какой результат я хочу.';
      if(!text)return;if(history.length>=23){showError('Начни новый подбор, чтобы продолжить консультацию.');return;}
      history.push({role:'user',content:text});message('user',text,pendingPhoto?photo:null);input.value='';input.style.height='auto';pendingPhoto=false;
    }
    errorBox.hidden=true;setBusy(true);const active=session;
    const loading=document.createElement('div');loading.className='stylist-busy';loading.textContent='Уточняем детали';loading.setAttribute('role','status');log.append(loading);scrollLog();
    controller=new AbortController();const timer=setTimeout(()=>controller.abort(),50000);
    try{
      const response=await fetch(apiEndpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({messages:history,image:photo,photoConsent:!photo||consent.checked,accessCode}),signal:controller.signal});
      const data=await response.json();if(active!==session)return;
      if(!response.ok){if(response.status===401){accessRequired=true;document.getElementById('stylist-access').hidden=false;}throw Error(data.error||'Не получилось продолжить подбор.');}
      if(typeof data.message!=='string'||!Array.isArray(data.options)||!Array.isArray(data.recommendations))throw Error('Не удалось прочитать ответ. Попробуй ещё раз.');
      failed=false;history.push({role:'assistant',content:JSON.stringify(data)});message('assistant',data.message);showOptions(data.options);renderRecommendations(data.recommendations);
    }catch(error){if(active===session){failed=true;showError(error.name==='AbortError'?'Ответ задерживается. Попробуй ещё раз.':error.message,true);}}
    finally{clearTimeout(timer);loading.remove();if(active===session){setBusy(false);scrollLog();}}
  }
  form.addEventListener('submit',e=>{e.preventDefault();submit(input.value);});
  input.addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();form.requestSubmit();}});
  input.addEventListener('input',()=>{input.style.height='auto';input.style.height=Math.min(input.scrollHeight,95)+'px';});
  document.getElementById('stylist-retry').addEventListener('click',()=>submit('',true));
  function clearPhoto(){photo=null;pendingPhoto=false;preview.hidden=true;document.getElementById('photo-thumbnail').removeAttribute('src');consent.checked=false;consentLabel.hidden=true;document.getElementById('stylist-photo').value='';log.querySelectorAll('.stylist-user img').forEach(img=>img.remove());}
  document.getElementById('remove-photo').addEventListener('click',clearPhoto);
  document.getElementById('stylist-photo').addEventListener('change',async e=>{
    const file=e.target.files[0];if(!file)return;const active=session;
    if(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>15*1024*1024){showError('Выбери JPEG, PNG или WebP до 15 МБ.');e.target.value='';return;}
    try{
      const bitmap=await createImageBitmap(file);const scale=Math.min(1,1400/Math.max(bitmap.width,bitmap.height));
      const canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(bitmap.width*scale));canvas.height=Math.max(1,Math.round(bitmap.height*scale));canvas.getContext('2d').drawImage(bitmap,0,0,canvas.width,canvas.height);bitmap.close();
      const encoded=canvas.toDataURL('image/jpeg',0.82);if(encoded.length>2200000)throw Error('Фото слишком большое. Попробуй другой снимок.');if(active!==session)return;
      photo=encoded;pendingPhoto=true;document.getElementById('photo-thumbnail').src=photo;preview.hidden=false;consentLabel.hidden=false;consent.checked=false;errorBox.hidden=true;
    }catch(error){showError(error.message.startsWith('Фото')?error.message:'Не удалось открыть фото. Попробуй другой файл.');e.target.value='';}
  });
  document.getElementById('stylist-reset').addEventListener('click',()=>{
    session++;controller?.abort();history=[];failed=false;clearPhoto();selection.hidden=true;document.getElementById('stylist-products').replaceChildren();log.innerHTML=initial;input.value='';errorBox.hidden=true;setBusy(false);showOptions(['Матовая текстура','Больше объёма','Гладкая укладка','Пока не знаю']);input.focus({preventScroll:true});
  });
  document.getElementById('stylist-unlock').addEventListener('click',()=>{accessCode=document.getElementById('stylist-access-code').value.trim();if(!accessCode)return;accessRequired=false;document.getElementById('stylist-access').hidden=true;errorBox.hidden=true;setBusy(false);showOptions(['Матовая текстура','Больше объёма','Гладкая укладка','Пока не знаю']);});
  async function connect(){
    try{const response=await fetch(apiEndpoint,{signal:AbortSignal.timeout(10000)});if(!response.ok)throw Error();const config=await response.json();available=config.available===true;accessRequired=config.accessRequired===true;if(!available)showError('Консультация пока не подключена. Скоро здесь можно будет подобрать средство по фото и пожеланиям.');document.getElementById('stylist-access').hidden=!accessRequired;}
    catch(_){showError('Консультация недоступна. Попробуй открыть сайт позже.');}
    setBusy(false);showOptions(['Матовая текстура','Больше объёма','Гладкая укладка','Пока не знаю']);
  }
  connect();
})();
