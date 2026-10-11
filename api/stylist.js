const {validateInput,consult}=require('../lib/stylist.cjs');
const rateWindows=new Map();
function send(res,status,data) {res.statusCode=status;res.setHeader('Content-Type','application/json; charset=utf-8');res.setHeader('Cache-Control','no-store');res.end(JSON.stringify(data));}
module.exports=async (req,res)=>{
  const key=process.env.DEEPSEEK_API_KEY;
  if (req.method==='GET') return send(res,200,{available:!!key,accessRequired:!!process.env.STYLIST_ACCESS_CODE});
  if (req.method!=='POST') {res.setHeader('Allow','GET, POST');return send(res,405,{error:'Метод не поддерживается.'});}
  if (!key) return send(res,503,{error:'Консультация пока не подключена. Загляни чуть позже.'});
  try {
    const origin=req.headers.origin;
    if (!origin || new URL(origin).host!==req.headers.host) return send(res,403,{error:'Открой консультацию на сайте DASHU.'});
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
