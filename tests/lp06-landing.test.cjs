const test = require('node:test');
const assert = require('node:assert/strict');
const { fitHero, fitCockpit, fitScene, flowFrame, journeyFrame, STOPS, DURATION } = require('../assets/js/artech-lp03-lp06.js');

test('Cars fill the entire width; title, complete bodywork, pluses and cue fit desktop screens', () => {
  for (const [width,height] of [[1905,895],[1881,895],[1920,900],[1920,1080],[1366,768],[1440,900],[1536,730],[2560,1440],[1024,768]]) {
    const header=width<1100?80:92, copyHeight=height<=800?126:width<1500?150:174, toolsHeight=44;
    const f=fitHero({width,height,header,copyHeight,toolsHeight});
    assert.equal(f.stageWidth,width,'No lateral gutters at '+width);
    assert.equal(f.stageWidth/f.stageHeight,16/9);
    assert.equal(f.heroHeight,height,'All controls in first screen at '+width);
    assert.equal(f.flow,false);
    assert.equal(f.copyTop-header,10);
    assert.ok(f.stageTop+.4*f.stageHeight >= f.copyTop+copyHeight+(height<=800?11.99:17.99),'Clearance above first roof');
    assert.ok(f.stageTop+.79*f.stageHeight < f.stageTop+f.markerTop,'Markers below car bodies');
    assert.ok(f.stageTop+f.markerTop+44+18 < height-toolsHeight-16,'Labels before bottom cue');
  }
});

test('Touch keeps complete lineup and controls at full width without an empty full-height spacer', () => {
  for(const [width,height] of [[390,844],[375,667],[320,568],[768,1024]]) {
    const f=fitHero({width,height,header:76,copyHeight:150,toolsHeight:96,compact:true});
    assert.equal(f.stageWidth,width);
    assert.ok(f.heroHeight<height);
    assert.ok(f.stageTop+f.markerTop+44+96+16 <= f.heroHeight);
  }
});

test('Extreme aspect ratios and text zoom extend the page instead of shrinking or cropping cars', () => {
  for(const input of [
    {width:2560,height:700,header:92,copyHeight:174,toolsHeight:44},
    {width:320,height:350,header:76,copyHeight:220,toolsHeight:100,compact:true}
  ]) {
    const f=fitHero(input);
    assert.equal(f.flow,true);
    assert.equal(f.stageWidth,input.width);
    assert.ok(f.heroHeight>input.height);
    Object.values(f).filter(v=>typeof v==='number').forEach(v=>assert.ok(Number.isFinite(v)));
  }
});

test('Every chapter has a readable hold and a visible, correctly targeted control', () => {
  STOPS.forEach((p,i)=>{
    const s=journeyFrame(p);
    assert.equal(s.active,i);
    assert.equal(s.visible[i],true);
    assert.equal([s.heroCopyAlpha,s.collectionAlpha,s.atelierCopyAlpha,s.diningCopyAlpha][i],1);
  });
  assert.equal(journeyFrame(0).heroAlpha,1);
  assert.equal(journeyFrame(STOPS[1]).floorAlpha,1);
  assert.equal(journeyFrame(STOPS[1]).diningAlpha,0,'Dining must not bleed behind wheel');
  assert.equal(journeyFrame(STOPS[2]).atelierAlpha,1);
  assert.equal(journeyFrame(STOPS[3]).diningAlpha,1);
});

test('Collection fades laterally into workshop without moving, rotating or zooming the photograph', () => {
  const entry=journeyFrame(.7),rest=journeyFrame(1.65),fade=journeyFrame(2.95),atelier=journeyFrame(3.9),meal=journeyFrame(4.95),dining=journeyFrame(5.95);
  assert.ok(entry.visible[0]&&entry.visible[1]);
  assert.ok(entry.wheelY>rest.wheelY);
  assert.equal(rest.wheelY,0);
  assert.equal(fade.wheelY,0);
  assert.ok(fade.collectionEdge>0&&fade.collectionEdge<100);
  assert.equal(fade.atelierAlpha,1);
  assert.ok(!atelier.visible[1]&&atelier.visible[2]);
  assert.ok(meal.atelierEdge>0&&meal.atelierEdge<100);
  assert.equal(meal.diningAlpha,1);
  assert.equal(dining.diningCopyAlpha,1);
  assert.ok(!dining.visible[2]&&dining.visible[3]);
  [entry,rest,fade,atelier,meal,dining].forEach(frame=>{
    assert.ok(!Object.keys(frame).some(key=>/scale|rotate|wheelX|atelierX|atelierY|diningY/i.test(key)));
  });
});

test('The entire cockpit source fits below the header without negative offsets or oversizing', () => {
  for(const [width,height] of [[1897,897],[1905,895],[1366,768],[1536,730],[1920,1080],[2560,1080]]) {
    const f=fitCockpit({width,height,header:92});
    assert.equal(f.left,0);
    assert.ok(f.top>=108);
    assert.ok(f.top+f.height<=height-15.99);
    assert.ok(f.width<=width*.68);
    assert.equal(f.width/f.height,1.5);
  }
});

test('Restored photographs preserve full width and aspect ratio, using natural height when the screen is short', () => {
  const media=require('../assets/data/lp06-media.json');
  const scenes=media.media.filter(item=>/\/(atelier|dining)-2560\.webp$/.test(item.file));
  assert.equal(scenes.length,2);
  for(const scene of scenes) {
    for(const [width,height] of [[1897,897],[1905,895],[1366,768],[1536,730],[1920,1080],[1440,900]]) {
      const f=fitScene({width,height,imageWidth:scene.width,imageHeight:scene.height});
      assert.equal(f.width,width);
      assert.ok(f.sceneHeight>=height && f.sceneHeight>=f.photoHeight);
      assert.ok(f.top>=0 && f.top+f.photoHeight<=f.sceneHeight+.01);
      assert.ok(Math.abs(f.width/f.photoHeight-scene.width/scene.height)<.00001);
    }
    assert.equal(fitScene({width:1920,height:1080,imageWidth:scene.width,imageHeight:scene.height}).fits,true);
    const wide=fitScene({width:1905,height:895,imageWidth:scene.width,imageHeight:scene.height});
    assert.equal(wide.fits,false);
    assert.equal(wide.sceneHeight,wide.photoHeight);
  }
});

test('Tall restored photos retain lateral fades in native flow, with a fully visible reading interval', () => {
  const geometry={height:1072,viewportHeight:895};
  assert.equal(flowFrame({...geometry,top:895}).edge,-40);
  assert.equal(flowFrame({...geometry,top:200}).edge,140);
  assert.equal(flowFrame({...geometry,top:0}).edge,140);
  assert.equal(flowFrame({...geometry,top:-400}).edge,140);
  assert.ok(flowFrame({...geometry,top:500}).edge > -40);
  assert.ok(flowFrame({...geometry,top:-700}).edge < 140);
  assert.equal(flowFrame({...geometry,top:-1072}).edge,-40);
  assert.equal(flowFrame({...geometry,top:500}).direction,'to left');
  assert.equal(flowFrame({...geometry,top:-700}).direction,'to right');
});

test('Camera is continuous, reversible and clamped across fast forward/back scrolling', () => {
  let previous=journeyFrame(0);
  const frames=[];
  for(let i=0;i<=DURATION*1000;i++) {
    const p=i/1000,s=journeyFrame(p); frames.push([p,s]);
    assert.ok(s.visible.some(Boolean),'A photographic layer is always present');
    for(const [key,value] of Object.entries(s)) {
      if(typeof value!=='number' || key==='active') continue;
      assert.ok(Number.isFinite(value));
      assert.ok(Math.abs(value-previous[key])<.5,key+' cannot jump');
    }
    previous=s;
  }
  frames.reverse().forEach(([p,s])=>assert.deepEqual(journeyFrame(p),s));
  assert.deepEqual(journeyFrame(-100),journeyFrame(0));
  assert.deepEqual(journeyFrame(100),journeyFrame(DURATION));
});
