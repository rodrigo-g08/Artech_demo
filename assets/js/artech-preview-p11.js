/* P11: presentation-only ticket preview. Never an admission credential.
   No names, emails, card details, credentials, or payment authority in the QR. */
(function () {
  'use strict';
  const en = () => document.documentElement.lang === 'en';
  const t = (es, english) => en() ? english : es;
  const labels = {collection:['Experiencia ARTECH','ARTECH Experience'],vip:['Experiencia VIP','VIP Experience'],private:['Experiencia privada','Private Experience']};
  const letters = {collection:'c',vip:'v',private:'p'};
  const esc = value => String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function create(visit) {
    const id = Array.from(crypto.getRandomValues(new Uint8Array(6)),n=>n.toString(16).padStart(2,'0')).join('').toUpperCase();
    const fragment = [visit.date.replaceAll('-',''),visit.time.replace(':',''),letters[visit.level],visit.adults,visit.children,visit.seniors,id].join('.');
    return {id,code:'ARTECH-'+id,url:location.origin+'/entrada/vista.html#'+fragment};
  }
  function parse(fragment) {
    const m = /^#?(\d{8})\.(1000|1200|1500)\.([cvp])\.(\d{1,2})\.(\d{1,2})\.(\d{1,2})\.([A-F0-9]{12})$/.exec(fragment);
    if (!m) return null;
    const date=m[1].slice(0,4)+'-'+m[1].slice(4,6)+'-'+m[1].slice(6),time=m[2].slice(0,2)+':'+m[2].slice(2),level=Object.keys(letters).find(k=>letters[k]===m[3]);
    const adults=Number(m[4]),children=Number(m[5]),seniors=Number(m[6]),guests=adults+children+seniors;
    const d=new Date(date+'T12:00:00Z');
    if (!Number.isFinite(+d)||d.toISOString().slice(0,10)!==date||guests<1||guests>20||(level==='private'&&guests<15)) return null;
    return {id:m[7],code:'ARTECH-'+m[7],date,time,level,adults,children,seniors,guests,url:location.origin+'/entrada/vista.html#'+m[0].replace(/^#/,'')};
  }
  function badges(apple,google,note) {
    if (!apple||!google) return;
    const a=apple.querySelector('img'),g=google.querySelector('img');
    a.src='/assets/media/wallet-p11/apple-wallet.png';
    a.alt=t('Agregar a Apple Wallet','Add to Apple Wallet');
    g.src='/assets/media/wallet-p11/google-wallet-'+(en()?'en':'es')+'.svg';
    g.alt=t('Agregar a la Billetera de Google','Add to Google Wallet');
    apple.setAttribute('aria-label',a.alt);google.setAttribute('aria-label',g.alt);
    note.textContent=t('Disponible próximamente.','Coming soon.');
  }
  function download(receipt) {
    const title=labels[receipt.level][en()?1:0],guests=receipt.adults+receipt.children+receipt.seniors;
    const qr=window.ArtechQR.svg(receipt.url);
    const html=`<!doctype html><html lang="${en()?'en':'es'}"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="referrer" content="no-referrer"><title>ARTECH · ${esc(receipt.code)}</title><style>*{box-sizing:border-box}body{margin:0;background:#080808;color:#f4f3f0;font:14px/1.6 Arial,sans-serif;padding:32px}article{max-width:850px;margin:auto;border:1px solid #8b806e;border-radius:22px;display:grid;grid-template-columns:1fr 180px;overflow:hidden}section{padding:30px}h1{font-size:26px;font-weight:400}aside{padding:20px;align-self:center;border-left:1px dashed #8b806e}aside svg{width:100%;height:auto}small{display:block;margin-top:16px;font-size:11px}a{color:inherit}@media(max-width:540px){article{grid-template-columns:1fr}aside{border:0;max-width:220px}body{padding:16px}}@media print{body{color:#111;background:white}article{color:#111}}</style><article><section><strong>ARTECH</strong><h1>${esc(title)}</h1><p>${esc(receipt.date)} · ${esc(receipt.time)} · Lima</p><p>${guests} ${t('visitantes','visitors')}</p><p>${esc(receipt.buyer?.name||'')}</p><p>${esc(receipt.code)}</p><small>${t('Pago de prueba aprobado. Vista previa sin cobro ni validez para ingresar.','Test payment approved. Preview only: no charge or admission validity.')}</small><p><a href="${esc(receipt.url)}">${t('Ver entrada','View ticket')}</a></p></section><aside>${qr}</aside></article></html>`;
    const url=URL.createObjectURL(new Blob([html],{type:'text/html;charset=utf-8'})),a=document.createElement('a');
    a.href=url;a.download=receipt.code+'.html';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),30000);
  }
  window.ArtechPreview=Object.freeze({create,parse,badges,download});
  const page=document.getElementById('p11Preview');
  if (!page) return;
  const $=id=>document.getElementById(id);
  function render() {
    const ticket=parse(location.hash);
    $('p11TicketContent').hidden=!ticket;$('p11Invalid').hidden=!!ticket;
    if(!ticket) return;
    $('p11VisitName').textContent=labels[ticket.level][en()?1:0];
    $('p11VisitDate').textContent=ticket.date+' · '+ticket.time+' · Lima';
    $('p11VisitCount').textContent=ticket.guests+' '+t('visitantes','visitors');
    $('p11VisitCode').textContent=ticket.code;
    $('p11QR').innerHTML=window.ArtechQR.svg(ticket.url);
    badges($('p11Apple'),$('p11Google'),$('p11WalletNote'));
  }
  [['p11Apple','Apple Wallet'],['p11Google','Google Wallet']].forEach(([id,name])=>$(id).addEventListener('click',()=>{
    $('p11WalletNote').textContent=t(`${name} estará disponible próximamente.`,`${name} will be available soon.`);
  }));
  addEventListener('hashchange',render);render();
})();
