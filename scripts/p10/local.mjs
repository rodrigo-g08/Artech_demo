// Optional Node 20+ local server. Test data are kept OUTSIDE the repository.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {webcrypto,randomBytes} from 'node:crypto';
import {handleTickets} from '../../functions/_lib/artech-tickets.mjs';
if(!globalThis.crypto)globalThis.crypto=webcrypto;
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const dataDir=path.join(path.dirname(root),'ARTECH_P10_local');fs.mkdirSync(dataDir,{recursive:true});
const file=path.join(dataDir,'tickets.json');let rows=fs.existsSync(file)?JSON.parse(fs.readFileSync(file,'utf8')):[];
const save=()=>{fs.writeFileSync(file+'.tmp',JSON.stringify(rows),{mode:0o600});fs.renameSync(file+'.tmp',file);};
const store={get:async hash=>rows.find(r=>r.token_hash===hash)||null,count:async (client,since)=>rows.filter(r=>r.client_hash===client&&r.created_at>=since).length,create:async row=>{if(!rows.some(r=>r.token_hash===row.token_hash)){rows.push(row);save();}},transition:async(hash,from,to,at)=>{const r=rows.find(r=>r.token_hash===hash);if(!r||r.status!==from)return false;r.status=to;r.updated_at=at;save();return true;}};
const port=Number(process.env.ARTECH_LOCAL_PORT||8788),key=randomBytes(32).toString('base64url'),origin=`http://localhost:${port}`,env={ARTECH_LOCAL_TEST:'1',ARTECH_STAFF_TOKEN:key};
const types={'.html':'text/html;charset=utf-8','.js':'text/javascript;charset=utf-8','.css':'text/css;charset=utf-8','.json':'application/json','.png':'image/png','.webp':'image/webp','.jpg':'image/jpeg','.svg':'image/svg+xml','.woff2':'font/woff2','.mp4':'video/mp4'};
async function staticFile(url){let pathname;try{pathname=decodeURIComponent(new URL(url).pathname);}catch{return new Response('Bad request',{status:400});}
  if(pathname.split('/').some(x=>x.startsWith('.'))||/^\/(functions|scripts|node_modules)\//.test(pathname))return new Response('Not found',{status:404});
  let p=path.resolve(root,'.'+pathname);if(!p.startsWith(root+path.sep)&&p!==root)return new Response('Not found',{status:404});
  if(fs.existsSync(p)&&fs.statSync(p).isDirectory())p=path.join(p,'index.html');
  if(!fs.existsSync(p))return new Response('Not found',{status:404});
  return new Response(fs.readFileSync(p),{headers:{'Content-Type':types[path.extname(p)]||'application/octet-stream','Cache-Control':'no-store','Referrer-Policy':'no-referrer'}});
}
http.createServer(async(req,res)=>{try{
  const host=req.headers.host;if(![`localhost:${port}`,`127.0.0.1:${port}`].includes(host)){res.writeHead(403);res.end();return;}
  const url=`http://${host}${req.url}`,chunks=[];let total=0;for await(const chunk of req){total+=chunk.length;if(total>8192){res.writeHead(413);res.end();return;}chunks.push(chunk);}
  const options={method:req.method,headers:req.headers};if(!['GET','HEAD'].includes(req.method))options.body=Buffer.concat(chunks);
  const request=new Request(url,options),response=new URL(url).pathname.startsWith('/api/artech/')?await handleTickets(request,env,store,{fetch:r=>staticFile(r.url)}):await staticFile(url);
  res.writeHead(response.status,Object.fromEntries(response.headers));res.end(Buffer.from(await response.arrayBuffer()));
}catch{res.writeHead(500);res.end('Local server error');}}).listen(port,'127.0.0.1',()=>{
  console.log(`ARTECH P10 local: ${origin}/#p-tickets\nControl de prueba: abre el enlace de tu entrada y despliega Control de acceso.\nClave temporal del equipo: ${key}\nLos registros locales no son entradas del museo. No se realizan cobros.\nCtrl+C para detener.`);
});
