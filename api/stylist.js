const {validateInput,consult}=require('../lib/stylist.cjs');
const rateWindows=new Map();
const corsOrigins=new Set(['https://dashurussia.ru']);
function send(res,status,data) {res.statusCode=status;res.setHeader('Content-Type','application/json; charset=utf-8');res.setHeader('Cache-Control','no-store');res.end(JSON.stringify(data));}
module.exports=async (req,res)=>{
  const key=process.env.DEEPSEEK_API_KEY;
  const origin=req.headers.origin;
  let sameOrigin=false;
  try {const url=new URL(origin);sameOrigin=['http:','https:'].includes(url.protocol)&&url.origin===origin&&url.host===req.headers.host;}catch(_){}
  const trustedOrigin=sameOrigin||corsOrigins.has(origin);
  res.setHeader('Vary','Origin');
  if (corsOrigins.has(origin)) {
    res.setHeader('Access-Control-Allow-Origin',origin);
    res.setHeader('Access-Control-Expose-Headers','Retry-After');
  }
  if (req.method==='OPTIONS') {
    if (!trustedOrigin) return send(res,403,{error:'Открой консультацию на сайте DASHU.'});
    if (!['GET','POST'].includes(req.headers['access-control-request-method'])) return send(res,405,{error:'Метод не поддерживается.'});
    const requestedHeaders=String(req.headers['access-control-request-headers']||'').toLowerCase().split(',').map(h=>h.trim()).filter(Boolean);
    if (requestedHeaders.some(h=>h!=='content-type')) return send(res,403,{error:'Заголовки не поддерживаются.'});
    res.setHeader('Access-Control-Allow-Methods','GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers','Content-Type');
    res.setHeader('Access-Control-Max-Age','600');
    res.setHeader('Cache-Control','no-store');
    res.statusCode=204;return res.end();
  }
  if (req.method==='GET') return send(res,200,{available:!!key,accessRequired:!!process.env.STYLIST_ACCESS_CODE});
  if (req.method!=='POST') {res.setHeader('Allow','GET, POST, OPTIONS');return send(res,405,{error:'Метод не поддерживается.'});}
  if (!key) return send(res,503,{error:'Консультация пока не подключена. Загляни чуть позже.'});
  try {
    if (!trustedOrigin) return send(res,403,{error:'Открой консультацию на сайте DASHU.'});
    if (!String(req.headers['content-type']||'').startsWith('application/json')) return send(res,415,{error:'Нужен JSON-запрос.'});
    if (Number(req.headers['content-length']||0)>2400000) return send(res,413,{error:'Фото слишком большое. Попробуй другой снимок.'});
    let body;
    try{body=typeof req.body==='string'?JSON.parse(req.body):req.body;}catch(_){return send(res,400,{error:'Не удалось прочитать запрос.'});}
    if (Buffer.byteLength(JSON.stringify(body||{}))>2400000) return send(res,413,{error:'Фото слишком большое.'});
    if (process.env.STYLIST_ACCESS_CODE && body?.accessCode!==process.env.STYLIST_ACCESS_CODE) return send(res,401,{error:'Введи код доступа к консультации.'});
    const input=validateInput(body);
    const ip=String(req.headers['x-forwarded-for']||req.socket?.remoteAddress||'unknown').split(',')[0].trim();
    const now=Date.now();
    for(const [id,value] of rateWindows)if(value.reset<now)rateWindows.delete(id);
    const window=rateWindows.get(ip)||{count:0,reset:now+600000};
    if(window.count>=30) {res.setHeader('Retry-After','600');return send(res,429,{error:'Небольшая пауза. Продолжи подбор через несколько минут.'});}
    window.count++;rateWindows.set(ip,window);
    return send(res,200,await consult(input,key));
  }catch(error){
    // Never log photos, conversations, provider response bodies or credentials.
    if (error.message.startsWith('Некорректная')||error.message.startsWith('Сообщение')||error.message.startsWith('Последнее')||error.message.startsWith('Не удалось')||error.message.startsWith('Файл')) return send(res,400,{error:error.message});
    return send(res,502,{error:'Стилист сейчас не отвечает. Попробуй ещё раз — твой вопрос сохранён.'});
  }
};
