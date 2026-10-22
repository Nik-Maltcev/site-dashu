// Local development only. Secrets and server source are never served as static files.
const http=require('node:http'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const handler=require('../api/stylist.js');
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp','.mp4':'video/mp4','.ttf':'font/ttf','.woff2':'font/woff2','.svg':'image/svg+xml'};
function loadKey(){
  const env=path.join(root,'.env.local');if(!fs.existsSync(env))return;
  for(const line of fs.readFileSync(env,'utf8').split(/\r?\n/)){
    const match=line.match(/^(DEEPSEEK_API_KEY|STYLIST_ACCESS_CODE)=(.*)$/);if(match)process.env[match[1]]=match[2].trim().replace(/^['"]|['"]$/g,'');
  }
}
http.createServer(async(req,res)=>{
  const pathname=new URL(req.url,'http://localhost').pathname;
  if(pathname==='/api/stylist'){
    loadKey();let size=0,chunks=[];
    try{
      for await(const chunk of req){size+=chunk.length;if(size>2400000){res.writeHead(413,{'Content-Type':'application/json'});res.end(JSON.stringify({error:'Фото слишком большое.'}));return;}chunks.push(chunk);}
      if(chunks.length)req.body=Buffer.concat(chunks).toString('utf8');await handler(req,res);
    }catch(_){res.writeHead(400,{'Content-Type':'application/json'});res.end(JSON.stringify({error:'Некорректный запрос.'}));}return;
  }
  let relative;
  try{relative=decodeURIComponent(pathname).replace(/^\/+/, '')||'index.html';}catch(_){res.writeHead(400);res.end();return;}
  if(!/^(?:index|catalog|product|cart|checkout|about|stylist|font-01|font-02)\.html$/.test(relative)&&!relative.startsWith('assets/')){res.writeHead(404);res.end();return;}
  const file=path.resolve(root,relative);
  if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404);res.end();return;}
  res.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store'});fs.createReadStream(file).pipe(res);
}).listen(8766,'127.0.0.1',()=>console.log('DASHU preview: http://127.0.0.1:8766 (key stays on the server)'));
