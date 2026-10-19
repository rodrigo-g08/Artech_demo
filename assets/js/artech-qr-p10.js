/* ARTECH P10: QR Model 2, byte mode, version 5-L (106 UTF-8 bytes), local only. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.ArtechQR=api;})(typeof globalThis==='undefined'?this:globalThis,function(){
  'use strict';
  const size=37, capacity=108, ecLength=26;
  function multiply(a,b){let r=0;for(let i=7;i>=0;i--){r=(r<<1)^((r>>>7)*0x11d);r^=((b>>>i)&1)*a;}return r;}
  function ecc(data){
    const divisor=Array(ecLength).fill(0);divisor[ecLength-1]=1;let root=1;
    for(let i=0;i<ecLength;i++){for(let j=0;j<ecLength;j++){divisor[j]=multiply(divisor[j],root);if(j+1<ecLength)divisor[j]^=divisor[j+1];}root=multiply(root,2);}
    const rem=Array(ecLength).fill(0);
    for(const b of data){const factor=b^rem.shift();rem.push(0);for(let j=0;j<ecLength;j++)rem[j]^=multiply(divisor[j],factor);}return rem;
  }
  function matrix(text){
    const bytes=new TextEncoder().encode(text);if(bytes.length>106)throw Error('QR_URL_TOO_LONG');
    const bits=[];const add=(v,n)=>{for(let i=n-1;i>=0;i--)bits.push((v>>>i)&1);};
    add(4,4);add(bytes.length,8);bytes.forEach(b=>add(b,8));add(0,Math.min(4,capacity*8-bits.length));while(bits.length%8)bits.push(0);
    const data=[];for(let i=0;i<bits.length;i+=8)data.push(bits.slice(i,i+8).reduce((n,b)=>n*2+b,0));
    for(let pad=0;data.length<capacity;pad++)data.push(pad%2?0x11:0xec);
    const code=data.concat(ecc(data)),cells=Array.from({length:size},()=>Array(size).fill(false)),fixed=Array.from({length:size},()=>Array(size).fill(false));
    function set(x,y,value){if(x>=0&&y>=0&&x<size&&y<size){cells[y][x]=!!value;fixed[y][x]=true;}}
    for(let i=0;i<size;i++){set(6,i,i%2===0);set(i,6,i%2===0);}
    for(const [cx,cy] of [[3,3],[size-4,3],[3,size-4]])for(let dy=-4;dy<=4;dy++)for(let dx=-4;dx<=4;dx++){const d=Math.max(Math.abs(dx),Math.abs(dy));set(cx+dx,cy+dy,d!==2&&d!==4);}
    for(let dy=-2;dy<=2;dy++)for(let dx=-2;dx<=2;dx++)set(30+dx,30+dy,Math.max(Math.abs(dx),Math.abs(dy))!==1);
    function format(mask){const d=(1<<3)|mask;let r=d;for(let i=0;i<10;i++)r=(r<<1)^((r>>>9)*0x537);const f=((d<<10)|r)^0x5412;const bit=i=>(f>>>i)&1;
      for(let i=0;i<=5;i++)set(8,i,bit(i));set(8,7,bit(6));set(8,8,bit(7));set(7,8,bit(8));for(let i=9;i<15;i++)set(14-i,8,bit(i));
      for(let i=0;i<8;i++)set(size-1-i,8,bit(i));for(let i=8;i<15;i++)set(8,size-15+i,bit(i));set(8,size-8,true);
    }
    format(0);let k=0;
    for(let right=size-1;right>=1;right-=2){if(right===6)right=5;for(let vert=0;vert<size;vert++){const y=((right+1)&2)===0?size-1-vert:vert;for(let j=0;j<2;j++){const x=right-j;if(!fixed[y][x]){const value=k<code.length*8?((code[k>>>3]>>>(7-(k&7)))&1):0;cells[y][x]=!!(value^((x+y)%2===0?1:0));k++;}}}}
    return cells;
  }
  function svg(text){const m=matrix(text);let path='';m.forEach((row,y)=>row.forEach((on,x)=>{if(on)path+=`M${x+4} ${y+4}h1v1h-1z`;}));return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45" role="img" aria-label="QR ARTECH" shape-rendering="crispEdges"><rect width="45" height="45" fill="#fff"/><path d="${path}" fill="#000"/></svg>`;}
  return Object.freeze({matrix,svg});
});
