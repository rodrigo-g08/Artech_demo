// Native Wallet signing. Private keys are supplied only through server secrets.
const te=new TextEncoder();
export const utf8=s=>te.encode(s);
export const concat=(...parts)=>{const out=new Uint8Array(parts.reduce((n,p)=>n+p.length,0));let at=0;for(const p of parts){out.set(p,at);at+=p.length;}return out;};
export const b64url=b=>btoa(String.fromCharCode(...b)).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
const pemBytes=p=>Uint8Array.from(atob(p.replace(/-----[^-]+-----|\s/g,'')),c=>c.charCodeAt(0));
const hash=async(name,b)=>new Uint8Array(await crypto.subtle.digest(name,b));
const hex=b=>Array.from(b,x=>x.toString(16).padStart(2,'0')).join('');
async function sign(data,keyPem){const key=await crypto.subtle.importKey('pkcs8',pemBytes(keyPem),{name:'RSASSA-PKCS1-v1_5',hash:'SHA-256'},false,['sign']);return new Uint8Array(await crypto.subtle.sign('RSASSA-PKCS1-v1_5',key,data));}
export function walletConfig(env){return {
  apple:!!(env.APPLE_PASS_TYPE_ID&&env.APPLE_TEAM_ID&&env.APPLE_PASS_CERT_PEM&&env.APPLE_PASS_KEY_PEM&&env.APPLE_WWDR_CERT_PEM),
  google:!!(env.GOOGLE_WALLET_ISSUER_ID&&env.GOOGLE_WALLET_CLASS_ID&&env.GOOGLE_WALLET_SERVICE_EMAIL&&env.GOOGLE_WALLET_PRIVATE_KEY_PEM)
};}
export async function googlePass(ticket,url,env,origin){
  const payload={iss:env.GOOGLE_WALLET_SERVICE_EMAIL,aud:'google',typ:'savetowallet',iat:Math.floor(Date.now()/1000),origins:[new URL(origin).hostname],payload:{genericObjects:[{
    id:`${env.GOOGLE_WALLET_ISSUER_ID}.${ticket.id.replace(/-/g,'')}`,classId:env.GOOGLE_WALLET_CLASS_ID,state:'ACTIVE',hexBackgroundColor:'#13110e',
    cardTitle:{defaultValue:{language:'es',value:'ARTECH'}},header:{defaultValue:{language:'es',value:ticket.label}},
    subheader:{defaultValue:{language:'es',value:`${ticket.date} · ${ticket.time} Lima`}},
    barcode:{type:'QR_CODE',value:url,alternateText:ticket.code},
    textModulesData:[{id:'group',header:'VISITANTES',body:String(ticket.guests)},{id:'use',header:'ACCESO',body:'Un ingreso para todo el grupo. Estado actualizado al escanear.'}]
  }]}};
  const unsigned=b64url(utf8(JSON.stringify({alg:'RS256',typ:'JWT'})))+'.'+b64url(utf8(JSON.stringify(payload)));
  return 'https://pay.google.com/gp/v/save/'+unsigned+'.'+b64url(await sign(utf8(unsigned),env.GOOGLE_WALLET_PRIVATE_KEY_PEM));
}
function der(tag,body){let n=body.length,bytes=[];if(n<128)bytes=[n];else{while(n){bytes.unshift(n&255);n>>>=8;}bytes.unshift(128|bytes.length);}return concat(Uint8Array.of(tag,...bytes),body);}
const seq=(...v)=>der(48,concat(...v));
const set=(...v)=>der(49,concat(...v.sort((a,b)=>{for(let i=0;i<Math.min(a.length,b.length);i++)if(a[i]!==b[i])return a[i]-b[i];return a.length-b.length;})));
function oid(s){const p=s.split('.').map(Number),a=[p[0]*40+p[1]];for(const n0 of p.slice(2)){let n=n0,b=[n&127];while((n=Math.floor(n/128)))b.unshift(128|(n&127));a.push(...b);}return der(6,Uint8Array.from(a));}
const integer=n=>der(2,Uint8Array.of(n)),nil=Uint8Array.of(5,0);
function readTLV(bytes,start=0){let end=start+2,n=bytes[start+1];if(n&128){const len=n&127;n=0;for(let i=0;i<len;i++)n=n*256+bytes[end++];}return {start,body:end,end:end+n,tag:bytes[start]};}
function children(bytes,parent){const out=[];for(let i=parent.body;i<parent.end;){const item=readTLV(bytes,i);out.push(item);i=item.end;}return out;}
function issuerSerial(cert){const tbs=children(cert,readTLV(cert))[0],parts=children(cert,tbs),i=parts[0].tag===160?1:0;return seq(cert.slice(parts[i+2].start,parts[i+2].end),cert.slice(parts[i].start,parts[i].end));}
export async function cmsSignature(data,env){
  const cert=pemBytes(env.APPLE_PASS_CERT_PEM),wwdr=pemBytes(env.APPLE_WWDR_CERT_PEM),sha=seq(oid('2.16.840.1.101.3.4.2.1'),nil),dataOid=oid('1.2.840.113549.1.7.1');
  const time=new Date().toISOString().replace(/[-:T]/g,'').replace(/\.\d{3}Z$/,'Z').slice(2);
  const attrs=set(seq(oid('1.2.840.113549.1.9.3'),set(dataOid)),seq(oid('1.2.840.113549.1.9.4'),set(der(4,await hash('SHA-256',data)))),seq(oid('1.2.840.113549.1.9.5'),set(der(23,utf8(time)))));
  const implicit=attrs.slice();implicit[0]=160;
  const signer=seq(integer(1),issuerSerial(cert),sha,implicit,seq(oid('1.2.840.113549.1.1.1'),nil),der(4,await sign(attrs,env.APPLE_PASS_KEY_PEM)));
  return seq(oid('1.2.840.113549.1.7.2'),der(160,seq(integer(1),set(sha),seq(dataOid),der(160,concat(cert,wwdr)),set(signer))));
}
function crc32(bytes){let c=0xffffffff;for(const b of bytes){c^=b;for(let k=0;k<8;k++)c=(c>>>1)^((c&1)?0xedb88320:0);}return (c^0xffffffff)>>>0;}
function header(n){const b=new Uint8Array(n),v=new DataView(b.buffer);return {b,u16:(p,x)=>v.setUint16(p,x,true),u32:(p,x)=>v.setUint32(p,x,true)};}
export function zipStore(files){const chunks=[],central=[];let offset=0;
  for(const [name,bytes] of Object.entries(files)){const n=utf8(name),crc=crc32(bytes),h=header(30);h.u32(0,0x04034b50);h.u16(4,20);h.u16(12,33);h.u32(14,crc);h.u32(18,bytes.length);h.u32(22,bytes.length);h.u16(26,n.length);chunks.push(h.b,n,bytes);
    const c=header(46);c.u32(0,0x02014b50);c.u16(4,20);c.u16(6,20);c.u16(14,33);c.u32(16,crc);c.u32(20,bytes.length);c.u32(24,bytes.length);c.u16(28,n.length);c.u32(42,offset);central.push(c.b,n);offset+=30+n.length+bytes.length;}
  const directory=concat(...central),end=header(22),count=Object.keys(files).length;end.u32(0,0x06054b50);end.u16(8,count);end.u16(10,count);end.u32(12,directory.length);end.u32(16,offset);return concat(...chunks,directory,end.b);
}
export async function applePass(ticket,url,env,assets,origin){
  const logo=await assets.fetch(new Request(new URL('/assets/logo.png',origin)));
  if(!logo.ok)throw Error('PASS_LOGO_MISSING');const bytes=new Uint8Array(await logo.arrayBuffer());
  if(bytes[0]!==137||bytes[1]!==80||bytes[2]!==78||bytes[3]!==71)throw Error('PASS_LOGO_NOT_PNG');
  const pass={formatVersion:1,passTypeIdentifier:env.APPLE_PASS_TYPE_ID,teamIdentifier:env.APPLE_TEAM_ID,serialNumber:ticket.id,organizationName:'ARTECH',description:`Entrada ARTECH · ${ticket.date}`,logoText:'ARTECH',
    foregroundColor:'rgb(245,243,239)',backgroundColor:'rgb(19,17,14)',labelColor:'rgb(194,172,141)',relevantDate:`${ticket.date}T${ticket.time}:00-05:00`,expirationDate:`${ticket.date}T23:59:59-05:00`,
    eventTicket:{primaryFields:[{key:'experience',label:'EXPERIENCIA',value:ticket.label}],secondaryFields:[{key:'date',label:'FECHA',value:ticket.date},{key:'time',label:'HORA · LIMA',value:ticket.time}],auxiliaryFields:[{key:'guests',label:'VISITANTES',value:ticket.guests}],backFields:[{key:'code',label:'CÓDIGO',value:ticket.code},{key:'status',label:'ESTADO DE LA ENTRADA',value:url},{key:'admission',label:'INGRESO',value:'Un ingreso para todo el grupo. El estado válido se consulta al escanear.'}]},
    barcodes:[{format:'PKBarcodeFormatQR',message:url,messageEncoding:'iso-8859-1',altText:ticket.code}]};
  // Keep the original ARTECH wordmark. Optional pass-specific icons may be supplied as server secrets.
  const icon=env.APPLE_PASS_ICON_BASE64?Uint8Array.from(atob(env.APPLE_PASS_ICON_BASE64),c=>c.charCodeAt(0)):bytes;
  const files={'pass.json':utf8(JSON.stringify(pass)),'icon.png':icon,'logo.png':bytes};
  if(env.APPLE_PASS_ICON_2X_BASE64)files['icon@2x.png']=Uint8Array.from(atob(env.APPLE_PASS_ICON_2X_BASE64),c=>c.charCodeAt(0));
  const manifest={};for(const [name,data] of Object.entries(files))manifest[name]=hex(await hash('SHA-1',data));
  files['manifest.json']=utf8(JSON.stringify(manifest));files.signature=await cmsSignature(files['manifest.json'],env);return zipStore(files);
}
