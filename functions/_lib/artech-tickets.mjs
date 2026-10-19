import {utf8,b64url,walletConfig,applePass,googlePass} from './artech-wallet.mjs';
const labels={collection:'Experiencia ARTECH',vip:'Experiencia VIP',private:'Experiencia privada'};
const json=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json;charset=utf-8','Cache-Control':'no-store','Referrer-Policy':'no-referrer','X-Content-Type-Options':'nosniff'}});
const fail=(code,status)=>{throw Object.assign(Error(code),{status});};
export const digest=async value=>b64url(new Uint8Array(await crypto.subtle.digest('SHA-256',utf8(value))));
export function today(now=new Date()){return new Intl.DateTimeFormat('en-CA',{timeZone:'America/Lima',year:'numeric',month:'2-digit',day:'2-digit'}).format(now);}
function validToken(token){return typeof token==='string'&&/^[A-Za-z0-9_-]{43}$/.test(token);}
export function validateRequest(body,now=new Date()){
  if(!body||!validToken(body.token)||body.consent!==true||!Object.hasOwn(labels,body.level))fail('INVALID_REQUEST',400);
  const counts=['adults','children','seniors'];if(counts.some(k=>!Number.isInteger(body[k])||body[k]<0||body[k]>20))fail('INVALID_COUNT',400);
  const guests=counts.reduce((n,k)=>n+body[k],0);if(guests<1||guests>20||(body.level==='private'&&guests<15))fail('INVALID_COUNT',400);
  const date=body.date,time=body.time,day=new Date(date+'T12:00:00Z');
  if(typeof date!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(date)||!Number.isFinite(day.getTime())||day.toISOString().slice(0,10)!==date||day.getUTCDay()===1||date<today(now)||day.getTime()>now.getTime()+366*86400000||!['10:00','12:00','15:00'].includes(time)||new Date(`${date}T${time}:00-05:00`)<=now)fail('INVALID_DATE',400);
  const name=typeof body.buyer?.name==='string'?body.buyer.name.trim():'',email=typeof body.buyer?.email==='string'?body.buyer.email.trim():'';
  if(typeof name!=='string'||name.length<2||name.length>100||typeof email!=='string'||email.length>150||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))fail('INVALID_BUYER',400);
  return {level:body.level,date,time,adults:body.adults,children:body.children,seniors:body.seniors,guests,buyer:{name,email}};
}
export class D1Store{
  constructor(db){this.db=db;}
  async get(hash){return this.db.prepare('SELECT * FROM artech_tickets WHERE token_hash = ?').bind(hash).first();}
  async create(row){return this.db.prepare('INSERT OR IGNORE INTO artech_tickets (id, token_hash, request_hash, visit_date, visit_time, level, guests, adults, children, seniors, buyer_name, buyer_email, status, created_at, client_hash) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)').bind(row.id,row.token_hash,row.request_hash,row.visit_date,row.visit_time,row.level,row.guests,row.adults,row.children,row.seniors,row.buyer_name,row.buyer_email,row.status,row.created_at,row.client_hash).run();}
  async count(client,since){const r=await this.db.prepare('SELECT COUNT(*) AS n FROM artech_tickets WHERE client_hash = ? AND created_at >= ?').bind(client,since).first();return r.n;}
  async transition(hash,from,to,at){const r=await this.db.prepare('UPDATE artech_tickets SET status = ?, updated_at = ? WHERE token_hash = ? AND status = ?').bind(to,at,hash,from).run();return r.meta.changes===1;}
}
function publicTicket(row,env,now){const status=['pending','confirmed'].includes(row.status)&&row.visit_date<today(now)?'expired':row.status;return {id:row.id,code:'ARTECH-'+row.id.replace(/-/g,'').slice(0,12).toUpperCase(),status,date:row.visit_date,time:row.visit_time,level:row.level,label:labels[row.level],guests:row.guests,wallet:walletConfig(env),local:env.ARTECH_LOCAL_TEST==='1'};}
async function bodyOf(request){
  if(!request.headers.get('Content-Type')?.startsWith('application/json'))fail('JSON_REQUIRED',415);
  if(Number(request.headers.get('Content-Length'))>8192)fail('REQUEST_TOO_LARGE',413);
  if(!request.body)fail('INVALID_JSON',400);
  const reader=request.body.getReader(),parts=[];let length=0;
  for(;;){const {done,value}=await reader.read();if(done)break;length+=value.length;if(length>8192){await reader.cancel();fail('REQUEST_TOO_LARGE',413);}parts.push(value);}
  const bytes=new Uint8Array(length);let offset=0;for(const part of parts){bytes.set(part,offset);offset+=part.length;}
  try{return JSON.parse(new TextDecoder().decode(bytes));}catch{fail('INVALID_JSON',400);}
}
function bearer(request){return request.headers.get('Authorization')?.replace(/^Bearer /,'')||'';}
async function staff(request,env){const expected=env.ARTECH_STAFF_TOKEN||'';if(expected.length<32)fail('SERVICE_NOT_CONFIGURED',503);if(await digest(bearer(request))!==await digest(expected))fail('UNAUTHORIZED',401);}
function originFor(request,env){const incoming=new URL(request.url).origin,configured=env.ARTECH_PUBLIC_ORIGIN;
  if(env.ARTECH_LOCAL_TEST==='1'&&/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(incoming))return incoming;
  if(!configured||new URL(configured).protocol!=='https:')fail('SERVICE_NOT_CONFIGURED',503);
  const canonical=new URL(configured).origin;if(incoming!==canonical)fail('ORIGIN_NOT_ALLOWED',403);return canonical;
}
export async function handleTickets(request,env,store,assets){
  try{
    const path=new URL(request.url).pathname.replace(/\/$/,''),now=new Date(),cfg=walletConfig(env);
    if(path==='/api/artech/health'&&request.method==='GET'){
      let ready=!!(store&&env.ARTECH_STAFF_TOKEN?.length>=32&&(env.ARTECH_PUBLIC_ORIGIN||env.ARTECH_LOCAL_TEST==='1'));
      if(ready){try{originFor(request,env);await store.get('__health__');}catch{ready=false;}}
      return json({ready,wallet:cfg,local:env.ARTECH_LOCAL_TEST==='1'});
    }
    const origin=originFor(request,env);
    if(!store||env.ARTECH_STAFF_TOKEN?.length<32||!env.ARTECH_STAFF_TOKEN)fail('SERVICE_NOT_CONFIGURED',503);
    if(request.method!=='GET'&&request.headers.get('Origin')!==origin)fail('ORIGIN_NOT_ALLOWED',403);
    const view=token=>`${origin}/entrada/#${token}`;
    if(path==='/api/artech/tickets'&&request.method==='POST'){
      const body=await bodyOf(request),data=validateRequest(body,now),hash=await digest(body.token),requestHash=await digest(JSON.stringify(data));
      if(utf8(view(body.token)).length>106)fail('PUBLIC_ORIGIN_TOO_LONG',503);
      const existing=await store.get(hash);if(existing){if(existing.request_hash!==requestHash)fail('REQUEST_CONFLICT',409);return json({...publicTicket(existing,env,now),url:view(body.token)});}
      const client=await digest((request.headers.get('CF-Connecting-IP')||'local')+env.ARTECH_STAFF_TOKEN+today(now));
      if(await store.count(client,new Date(now.getTime()-3600000).toISOString())>=20)fail('RATE_LIMITED',429);
      const row={id:crypto.randomUUID(),token_hash:hash,request_hash:requestHash,visit_date:data.date,visit_time:data.time,level:data.level,guests:data.guests,adults:data.adults,children:data.children,seniors:data.seniors,buyer_name:data.buyer.name,buyer_email:data.buyer.email,status:'pending',created_at:now.toISOString(),client_hash:client};
      await store.create(row);const saved=await store.get(hash);if(saved.request_hash!==requestHash)fail('REQUEST_CONFLICT',409);
      return json({...publicTicket(saved,env,now),url:view(body.token)},201);
    }
    if(path==='/api/artech/tickets/status'&&request.method==='GET'){
      const token=bearer(request);if(!validToken(token))fail('TICKET_NOT_FOUND',404);const row=await store.get(await digest(token));if(!row)fail('TICKET_NOT_FOUND',404);
      return json({...publicTicket(row,env,now),url:view(token)});
    }
    if(['/api/artech/tickets/approve','/api/artech/tickets/redeem','/api/artech/tickets/cancel'].includes(path)&&request.method==='POST'){
      await staff(request,env);const body=await bodyOf(request);if(!validToken(body.token))fail('TICKET_NOT_FOUND',404);const hash=await digest(body.token),row=await store.get(hash);if(!row)fail('TICKET_NOT_FOUND',404);
      if(path.endsWith('/approve')){if(body.confirmedByStaff!==true)fail('CONFIRMATION_REQUIRED',400);if(publicTicket(row,env,now).status!=='pending')fail('TICKET_NOT_PENDING',409);if(!await store.transition(hash,'pending','confirmed',now.toISOString()))fail('STATE_CHANGED',409);}
      else if(path.endsWith('/redeem')){if(row.visit_date!==today(now))fail('WRONG_VISIT_DATE',409);if(row.status!=='confirmed')fail('TICKET_NOT_VALID',409);if(!await store.transition(hash,'confirmed','used',now.toISOString()))fail('TICKET_ALREADY_USED',409);}
      else {if(!['pending','confirmed'].includes(row.status))fail('STATE_CHANGED',409);if(!await store.transition(hash,row.status,'cancelled',now.toISOString()))fail('STATE_CHANGED',409);}
      return json({...publicTicket(await store.get(hash),env,now),url:view(body.token)});
    }
    if(['/api/artech/wallet/apple','/api/artech/wallet/google'].includes(path)&&request.method==='POST'){
      const token=bearer(request);if(!validToken(token))fail('TICKET_NOT_FOUND',404);const row=await store.get(await digest(token));if(!row)fail('TICKET_NOT_FOUND',404);
      const ticket=publicTicket(row,env,now);if(ticket.status!=='confirmed')fail('TICKET_NOT_CONFIRMED',409);
      if(env.ARTECH_LOCAL_TEST==='1')fail('LOCAL_WALLET_UNAVAILABLE',503);
      if(path.endsWith('/google')){if(!cfg.google)fail('WALLET_NOT_CONFIGURED',503);return json({url:await googlePass(ticket,view(token),env,origin)});}
      if(!cfg.apple)fail('WALLET_NOT_CONFIGURED',503);const bytes=await applePass(ticket,view(token),env,assets,origin);
      return new Response(bytes,{headers:{'Content-Type':'application/vnd.apple.pkpass','Content-Disposition':`attachment; filename="${ticket.code}.pkpass"`,'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
    }
    return json({error:'NOT_FOUND'},404);
  }catch(error){return json({error:error.status?error.message:'SERVICE_UNAVAILABLE'},error.status||503);}
}
