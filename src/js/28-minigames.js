/* ---------- the six minigames (the actual game). Each one is a plain object; 30-modes.js wraps them as shell modes ----------
   id,name,blurb          menus and the how-to-play card
   lens[3] {n,v}          Short / Normal / Long (v = seconds, or strides / stamps)
   cap(v)                 time limit in seconds for length v (default: v)
   plan(R,v)              seeded schedule shared by EVERY robot, so a round is fair and replayable
   init(c)                per-robot state, stored on c.g
   step(c,inp,dt,P)       one 1/60 s step. inp = {ok,l,r,u,d} fresh presses; P = difficulty row (win, slow, pen, aid)
   ai(c,dt,P)             CPU robot: returns an input object of the same shape
   draw(c,b)              draws the robot's stage inside box b = {x,y,w,h}
   banner/status/rank/resultText/bestOf/progress/maxProgress/barEnd   optional overrides (see GAME_DEF) */
const DIRS=['u','l','r','d'];                                   // hole / pad index -> button
const DIR_COL={u:'#4cc9f0',l:'#ffd23f',r:'#3ddc84',d:'#b862e8'};  // the four coloured buttons
const DIR_GLYPH={u:'\u25B2',l:'\u25C0',r:'\u25B6',d:'\u25BC'};
const PAD_OFF={u:[0,-1],d:[0,1],l:[-1,0],r:[1,0]};
const pen=(P,n)=>Math.floor(n*P.pen+1e-6);                       // penalty points after the level's softening
function setPose(c,p,d){c.pose=p;c.poseT=d||.3;c.poseAge=0;}
function pop(c,t,col){c.fx.push({t,col:col||'#fff',a:0});}
function tri(x){x=x%2;if(x<0)x+=2;return x<1?x:2-x;}              // triangle wave 0..1..0 with period 2
function glow(x,y,r,col,a){ctx.save();ctx.globalAlpha=a;ctx.fillStyle=col;ctx.beginPath();ctx.arc(x,y,r,0,7);ctx.fill();ctx.restore();}
function drawPad(d,x,y,r,lit,dim){
  ctx.save();
  if(lit)glow(x,y,r*1.5,DIR_COL[d],.35);
  ctx.globalAlpha=dim?.45:1;
  ctx.fillStyle=lit?DIR_COL[d]:'#25304f';ctx.strokeStyle=DIR_COL[d];ctx.lineWidth=Math.max(2,r*.12);
  ctx.beginPath();ctx.arc(x,y,r,0,7);ctx.fill();ctx.stroke();
  txt(DIR_GLYPH[d],x,y+r*.36,r*1.0,lit?'#10151c':DIR_COL[d],'center',false);
  ctx.restore();
}
function drawFx(c,x,y,sz){   // floating score text
  for(const f of c.fx){ctx.globalAlpha=1-f.a*f.a;txt(f.t,x,y-f.a*sz*1.6,sz,f.col,'center');}
  ctx.globalAlpha=1;
}
function bigButton(x,y,r,down,label){   // the big red buzzer
  ctx.fillStyle='#10151c';ctx.beginPath();ctx.ellipse(x,y+r*.35,r*1.15,r*.6,0,0,7);ctx.fill();
  ctx.fillStyle=down?'#a3101c':'#e0202e';ctx.strokeStyle='#19131c';ctx.lineWidth=3;
  ctx.beginPath();ctx.ellipse(x,y+(down?r*.18:0),r,r*.78,0,0,7);ctx.fill();ctx.stroke();
  ctx.fillStyle='rgba(255,255,255,.35)';ctx.beginPath();ctx.ellipse(x-r*.3,y-r*.2+(down?r*.18:0),r*.35,r*.16,-.4,0,7);ctx.fill();
  if(label)txt(label,x,y+r*1.5,r*.5,'#fff','center');
}
function gearPath(x,y,r,teeth){ctx.beginPath();for(let k=0;k<teeth*2;k++){const a=k*Math.PI/teeth,rr=k%2?r*.78:r;ctx.lineTo(x+Math.cos(a)*rr,y+Math.sin(a)*rr);}ctx.closePath();}

/* ---- 1. BOLT BASH: whack-a-mole on four coloured holes ---- */
const BOLT={id:'bolt',name:'Bolt Bash',
 blurb:'Mischief-bots pop out of the holes! Press the matching coloured button to bonk them. Gold bots score 3. Leave the spiky purple ones alone!',
 lens:[{n:'20 seconds',v:20},{n:'30 seconds',v:30},{n:'45 seconds',v:45}],lenDef:1,
 plan(R,len){
  const ev=[];let t=1.2,prev=-1;
  while(t<len-.9){
    const pr=t/len;let hole=Math.floor(R()*4);if(hole===prev)hole=(hole+1+Math.floor(R()*3))%4;prev=hole;
    const r=R(),kind=(t>4&&r<.15)?'bomb':(r>.86?'gold':'bot');
    ev.push({t,hole,kind,dur:1.25-.5*pr});
    t+=.95-.4*pr+R()*.15;
  }
  return ev;},
 init(c){return {done:{},hits:[],combo:0,aiSeen:{}};},
 step(c,inp,dt,P){
  const g=c.g;
  for(let d=0;d<4;d++){
    const n=inp[DIRS[d]]|0;
    for(let k=0;k<n;k++){
      let hit=-1;
      for(let i=0;i<G.sched.length;i++){const e=G.sched[i];if(e.hole===d&&!g.done[i]&&G.t>=e.t&&G.t<e.t+e.dur*P.win){hit=i;break;}}
      if(hit>=0){
        const e=G.sched[hit];g.done[hit]=G.t;g.hits.push({hole:d,t:G.t});
        if(e.kind==='bomb'){const lose=pen(P,2);c.score=Math.max(0,c.score-lose);g.combo=0;setPose(c,'zap',.5);pop(c,lose?'-'+lose:'ZAP!','#d9a6ff');if(c.human)beep(140,.25);}
        else{const v=e.kind==='gold'?3:1;c.score+=v;g.combo++;c.lastT=G.t;setPose(c,'whack',.3);pop(c,'+'+v,e.kind==='gold'?'#ffd23f':'#9bffb0');if(c.human)beep(e.kind==='gold'?990:660,.07);}
      }else{
        const lose=pen(P,1);if(lose){c.score=Math.max(0,c.score-lose);pop(c,'-'+lose,'#ffb3c0');}
        g.combo=0;if(c.human)beep(200,.08);
      }
    }
  }
 },
 ai(c,dt,P){
  const g=c.g,o=Object.assign({},NO_INPUT),acc=clamp(c.skill-.1,.5,.9);
  for(let i=0;i<G.sched.length;i++){
    const e=G.sched[i];if(G.t<e.t||G.t>=e.t+e.dur*P.win||g.done[i])continue;
    let a=g.aiSeen[i];
    if(!a)a=g.aiSeen[i]={press:rand()<(e.kind==='bomb'?.06:acc),at:e.t+.32+(1-c.skill)*.9+rand()*.35};
    if(a.press&&!a.sent&&G.t>=a.at){a.sent=true;o[DIRS[e.hole]]++;}
  }
  return o;},
 banner(c){return c.g&&c.g.combo>=3?'COMBO x'+c.g.combo+'!':null;},
 draw(c,b){
  const g=c.g,P=prm(c),cx=b.x+b.w/2,r=Math.min(b.w*.2,b.h*.17),cy=b.y+b.h*.36;
  for(let d=0;d<4;d++){
    const o=PAD_OFF[DIRS[d]],hx=cx+o[0]*r*1.75,hy=cy+o[1]*r*1.2,rx=r*.62,ry=r*.3;
    ctx.fillStyle='#05080f';ctx.beginPath();ctx.ellipse(hx,hy,rx,ry,0,0,7);ctx.fill();
    for(let i=0;i<G.sched.length;i++){
      const e=G.sched[i];if(e.hole!==d||g.done[i])continue;
      const end=e.t+e.dur*P.win;if(G.t<e.t||G.t>=end)continue;
      const up=Math.min(1,(G.t-e.t)/.14)*Math.min(1,(end-G.t)/.14),rr=r*.5;
      ctx.save();ctx.beginPath();ctx.rect(hx-r,hy-r*3,r*2,r*3+ry*.2);ctx.clip();
      const by=hy+ry*.3-up*rr*1.3;
      const col=e.kind==='gold'?'#ffd23f':e.kind==='bomb'?'#7b2cbf':'#9fb3c8';
      ctx.strokeStyle='#19131c';ctx.lineWidth=3;ctx.fillStyle=col;
      if(e.kind==='bomb'){for(let k=0;k<8;k++){const a=k*Math.PI/4;ctx.beginPath();ctx.moveTo(hx+Math.cos(a)*rr*.8,by+Math.sin(a)*rr*.8);ctx.lineTo(hx+Math.cos(a)*rr*1.3,by+Math.sin(a)*rr*1.3);ctx.stroke();}}
      ctx.beginPath();ctx.moveTo(hx,by-rr);ctx.lineTo(hx,by-rr*1.5);ctx.stroke();ctx.beginPath();ctx.arc(hx,by-rr*1.6,rr*.18,0,7);ctx.fillStyle=e.kind==='gold'?'#fff6b0':'#4cc9f0';ctx.fill();ctx.fillStyle=col;
      ctx.beginPath();ctx.arc(hx,by,rr,0,7);ctx.fill();ctx.stroke();
      ctx.fillStyle='#fff';for(const s of[-1,1]){ctx.beginPath();ctx.arc(hx+s*rr*.38,by-rr*.1,rr*.24,0,7);ctx.fill();}
      ctx.fillStyle='#10151c';for(const s of[-1,1]){ctx.beginPath();ctx.arc(hx+s*rr*.38,by-rr*.05,rr*.11,0,7);ctx.fill();}
      if(e.kind==='bomb'){ctx.strokeStyle='#10151c';ctx.lineWidth=2.5;for(const s of[-1,1]){ctx.beginPath();ctx.moveTo(hx+s*rr*.7,by-rr*.55);ctx.lineTo(hx+s*rr*.15,by-rr*.3);ctx.stroke();}}
      ctx.restore();
    }
    ctx.strokeStyle=DIR_COL[DIRS[d]];ctx.lineWidth=3;ctx.beginPath();ctx.ellipse(hx,hy,rx,ry,0,0,Math.PI);ctx.stroke();
    txt(DIR_GLYPH[DIRS[d]],hx,hy+ry+r*.5,r*.42,DIR_COL[DIRS[d]],'center',false);
    for(const h of g.hits)if(h.hole===d&&G.t-h.t<.22){   // mallet swing + star burst
      const a=(G.t-h.t)/.22;ctx.save();ctx.translate(hx,hy-ry);ctx.rotate(-1.1+a*1.3);
      ctx.fillStyle='#8fa0b3';ctx.strokeStyle='#19131c';ctx.lineWidth=3;ctx.fillRect(-3,-r*1.1,6,r*1.1);ctx.strokeRect(-3,-r*1.1,6,r*1.1);
      ctx.fillStyle='#4cc9f0';ctx.fillRect(-r*.4,-r*1.5,r*.8,r*.45);ctx.strokeRect(-r*.4,-r*1.5,r*.8,r*.45);ctx.restore();
      ctx.globalAlpha=1-a;txt('\u2605',hx,hy-r*.6-a*r*.6,r*.6,'#fff6b0','center',false);ctx.globalAlpha=1;
    }
  }
  drawRobot(c,cx,b.y+b.h-8,Math.min(b.h*.3,b.w*.42),c.pose);
  drawFx(c,cx,b.y+b.h*.62,Math.min(30,b.w*.1));
 }};

/* ---- 2. POWER SURGE: button mashing ---- */
const SURGE={id:'surge',name:'Power Surge',
 blurb:'Mash the big red button as fast as you can to charge the battery! Every full battery scores a point.',
 lens:[{n:'15 seconds',v:15},{n:'20 seconds',v:20},{n:'30 seconds',v:30}],lenDef:1,
 init(c){return {e:0,flash:0,mashT:0,acc:0,rate:5+(c.skill||.8)*1.6};},
 step(c,inp,dt,P){
  const g=c.g,n=inp.ok|0;
  if(n){g.e+=n*.12*P.aid;setPose(c,g.e>.8?'power':'mash',.18);g.mashT=.14;if(c.human)beep(300+Math.min(1,g.e)*500,.04);}
  g.mashT=Math.max(0,g.mashT-dt);g.e=Math.max(0,g.e-dt*.25);g.flash=Math.max(0,g.flash-dt);
  if(g.e>=1){g.e=0;c.score++;c.lastT=G.t;g.flash=.5;setPose(c,'cheer',.45);pop(c,'+1 BATTERY','#ffe66d');if(c.human)beep(880,.2);}
 },
 ai(c,dt){const g=c.g;g.acc+=dt*g.rate*(.85+.3*Math.sin(G.t*1.7+c.wob));const n=Math.floor(g.acc);g.acc-=n;return Object.assign({},NO_INPUT,{ok:n});},
 progress(c){return (c.score+(c.g?Math.min(1,c.g.e):0))*SCORE_UNIT;},
 banner(c){return G.t<3&&c.score===0?'MASH THE RED BUTTON!':null;},
 status(c){return c.score+(c.score===1?' battery':' batteries');},
 resultText(c){return c.score+(c.score===1?' battery':' batteries');},
 draw(c,b){
  const g=c.g,cx=b.x+b.w/2,tw=Math.min(b.w*.2,b.h*.2,70),th=b.h*.46,tx=cx-tw/2,ty=b.y+b.h*.1;
  for(let i=0;i<Math.min(c.score,14);i++){   // collected batteries
    const bx=b.x+8+i*Math.min(14,(b.w-16)/14);ctx.fillStyle='#ffe66d';ctx.fillRect(bx,b.y+2,Math.min(10,(b.w-16)/14-2),10);}
  if(g.flash>0)glow(cx,ty+th/2,th*.8,'#ffe66d',g.flash*.5);
  rrect(tx,ty,tw,th,10,'#0c1226','#8fa0b3',4);
  const e=Math.min(1,g.e),fh=(th-10)*e,col=e<.4?'#4cc9f0':e<.8?'#7dff9b':'#ffe66d';
  rrect(tx+5,ty+th-5-fh,tw-10,fh,6,col);
  for(let k=1;k<5;k++){ctx.fillStyle='rgba(0,0,0,.35)';ctx.fillRect(tx+5,ty+5+(th-10)*k/5,tw-10,2);}
  ctx.fillStyle='#8fa0b3';ctx.fillRect(cx-tw*.2,ty-8,tw*.4,8);
  if(e>.02)txt('\u26A1',cx,ty+th/2+tw*.25,tw*.7,'rgba(16,21,28,.55)','center',false);
  drawRobot(c,cx-b.w*.2,b.y+b.h-8,Math.min(b.h*.3,b.w*.36),c.pose);
  bigButton(cx+b.w*.22,b.y+b.h-b.h*.14,Math.min(b.w*.1,b.h*.09),g.mashT>0);
  drawFx(c,cx,ty+th*.35,Math.min(26,b.w*.09));
 }};

/* ---- 3. ROCKET DASH: alternate left / right to run ---- */
const DASH={id:'dash',name:'Rocket Dash',
 blurb:'Race to the finish line! Tap the LEFT and RIGHT buttons one after the other to run. Hammering one button just makes you stumble.',
 lens:[{n:'Short track',v:60},{n:'Normal track',v:80},{n:'Long track',v:110}],lenDef:1,cap:()=>45,bestHigh:false,
 init(c){return {steps:0,last:'',stepT:-9,acc:0,rate:5.3+(c.skill||.8)*1.8,aiLast:'',stumble:0,rate2:0};},
 step(c,inp,dt,P){
  const g=c.g;let nl=inp.l|0,nr=inp.r|0;
  while(nl+nr>0){
    let k;if(g.last==='l')k=nr>0?'r':'l';else if(g.last==='r')k=nl>0?'l':'r';else k=nl>0?'l':'r';
    if(k==='l')nl--;else nr--;
    if(k!==g.last){g.steps+=P.aid;g.stepT=G.t;if(c.human)beep(220+(g.steps%8)*40,.03);}else{g.steps+=.2;g.stumble=.2;setPose(c,'dizzy',.25);}
    g.last=k;
  }
  g.stumble=Math.max(0,g.stumble-dt);
  if(g.steps>=G.v){g.steps=G.v;c.finished=true;c.finT=G.t;c.lastT=G.t;setPose(c,'cheer',3);if(c.human)beep(880,.3);return;}
  if(G.t-g.stepT<.3)setPose(c,'run',.3);
 },
 ai(c,dt){
  const g=c.g;g.acc+=dt*g.rate*(.9+.2*Math.sin(G.t*1.3+c.wob));const n=Math.floor(g.acc);g.acc-=n;
  const o=Object.assign({},NO_INPUT);
  for(let i=0;i<n;i++){let k=g.aiLast==='l'?'r':'l';if(rand()<.04)k=g.aiLast||'l';o[k]++;g.aiLast=k;}
  return o;},
 progress(c){return c.g?c.g.steps/G.v*1000:0;},
 maxProgress(){return 1000;},barEnd(){return '\u2605';},
 rank(a,b){
  if(a.finished!==b.finished)return a.finished?-1:1;
  if(a.finished)return a.finT-b.finT||a.ci-b.ci;
  return (b.g?b.g.steps:0)-(a.g?a.g.steps:0)||a.ci-b.ci;},
 status(c){return c.finished?c.finT.toFixed(1)+' s':Math.round(100*(c.g?c.g.steps:0)/G.v)+'%';},
 resultText(c){return c.finished?c.finT.toFixed(2)+' s':Math.round(100*(c.g?c.g.steps:0)/G.v)+'%';},
 bestOf(c){return c.finished?c.finT:null;},
 banner(c){return G.t<3.5&&c.g&&c.g.steps<2?'TAP \u25C0 \u25B6 ONE AFTER THE OTHER!':null;},
 draw(c,b){
  const g=c.g,px=18,gy=b.y+b.h*.74,rx=b.x+b.w*.3,off=g.steps*px;
  for(let i=0;i<24;i++){const sx=b.x+((i*97+13)%100)/100*b.w-(off*.08)%b.w,sy=b.y+((i*53)%60)/100*b.h;ctx.fillStyle='rgba(255,255,255,.55)';ctx.fillRect(((sx-b.x)%b.w+b.w)%b.w+b.x,sy,2,2);}
  const px2=((b.x+b.w*.78-off*.25)%(b.w*1.6)+b.w*1.6)%(b.w*1.6)-b.w*.3;
  glow(px2,b.y+b.h*.3,b.h*.12,'#5b6fd6',.55);glow(px2-b.h*.03,b.y+b.h*.28,b.h*.05,'#9aa8ff',.5);
  ctx.fillStyle='#16213f';ctx.fillRect(b.x,gy,b.w,b.y+b.h-gy);ctx.fillStyle='#2d3d6b';ctx.fillRect(b.x,gy,b.w,5);
  ctx.fillStyle='#223059';for(let i=-1;i<b.w/60+2;i++){const mx=b.x+i*60-off%60;ctx.fillRect(mx,gy+16,30,6);}
  const fx=rx+(G.v-g.steps)*px;
  if(fx<b.x+b.w+40){ctx.fillStyle='#e8eef7';ctx.fillRect(fx-3,gy-b.h*.34,6,b.h*.34);
    for(let k=0;k<6;k++)for(let j=0;j<2;j++){ctx.fillStyle=(k+j)%2?'#10151c':'#fff';ctx.fillRect(fx+j*10,gy-b.h*.34+k*10,10,10);}
    ctx.fillStyle='rgba(255,255,255,.25)';ctx.fillRect(fx-2,gy,4,b.h*.1);}
  const running=G.t-g.stepT<.3,S=Math.min(b.h*.32,b.w*.34);
  if(running){ctx.fillStyle='#ffe66d';for(let k=0;k<3;k++){const l=S*(.18+.1*Math.sin(animClock*40+k));ctx.beginPath();ctx.moveTo(rx-S*.14,gy-S*.08-k*3);ctx.lineTo(rx-S*.14-l,gy-S*.06-k*3);ctx.lineTo(rx-S*.14,gy-S*.02-k*3);ctx.fill();}
    ctx.strokeStyle='rgba(255,255,255,.35)';ctx.lineWidth=2;for(let k=0;k<4;k++){const yy=gy-S*(.2+k*.2);ctx.beginPath();ctx.moveTo(rx-S*.6-k*8,yy);ctx.lineTo(rx-S*.3-k*8,yy);ctx.stroke();}}
  drawRobot(c,rx,gy+6,S,c.finished?'cheer':(running?'run':'idle'));
  const bx=b.x+10,bw=b.w-20,by=b.y+8;                  // race ribbon: everybody's position
  ctx.fillStyle='rgba(255,255,255,.25)';ctx.fillRect(bx,by+4,bw,3);
  for(const q of players)drawBadge(bx+clamp(q.prog/1000,0,1)*bw,by+5,q===c?7:5,q,{map:true});
  txt('\u2605',bx+bw+2,by+10,10,'#ffd23f','center',false);
  const nx=g.last==='l'?'r':'l',pr=Math.min(b.w*.07,b.h*.07);
  drawPad('l',b.x+b.w*.38,b.y+b.h-pr*1.2,pr,g.last!=='l'&&G.t<30&&nx==='l'&&G.t-g.stepT>.25,true);
  drawPad('r',b.x+b.w*.62,b.y+b.h-pr*1.2,pr,g.last!=='r'&&nx==='r'&&G.t-g.stepT>.25,true);
 }};

/* ---- 4. STAMP PRESS: stop the marker in the green zone ---- */
const STAMP={id:'stamp',name:'Stamp Press',
 blurb:'Stop the glowing marker inside the green zone and STAMP! Press the big red button at just the right moment. The middle is worth 3 points.',
 lens:[{n:'6 stamps',v:6},{n:'8 stamps',v:8},{n:'12 stamps',v:12}],lenDef:1,cap:()=>70,
 plan(R,v){const a=[];for(let i=0;i<v;i++)a.push({ph:R()*2,sp:.75+.09*i});return a;},
 init(c){const ph=G.sched[0].ph;return {k:0,ph,pos:tri(ph),state:'run',t:0,res:null,results:[],aim:.5+(rand()-.5)*2*(1-(c.skill||.85)+.06)*.45};},
 step(c,inp,dt,P){
  const g=c.g;g.t+=dt;
  if(g.state==='run'){
    g.ph+=dt*G.sched[g.k].sp*P.slow;g.pos=tri(g.ph);
    if((inp.ok|0)>0&&g.t>.2){
      const d=Math.abs(g.pos-.5),w=P.win;let pts=0;
      if(d<=.045*w)pts=3;else if(d<=.11*w)pts=2;else if(d<=.2*w)pts=1;
      g.res={pts,pos:g.pos};g.results.push(pts);c.score+=pts;if(pts)c.lastT=G.t;
      g.state='hit';g.t=0;setPose(c,pts?'stamp':'sad',.6);
      pop(c,['MISS','OK +1','GOOD +2','PERFECT +3'][pts],['#ffb3c0','#ffd9a0','#ffe66d','#9bffb0'][pts]);
      if(c.human)beep([160,440,660,990][pts],.12);
    }
  }else if(g.t>.8){
    g.k++;
    if(g.k>=G.v){c.finished=true;c.finT=G.t;g.state='done';}
    else{g.state='run';g.t=0;g.ph=G.sched[g.k].ph;g.pos=tri(g.ph);g.aim=.5+(rand()-.5)*2*(1-c.skill+.06)*.45;}
  }
 },
 ai(c,dt,P){
  const g=c.g,o=Object.assign({},NO_INPUT);
  if(g.state==='run'&&g.t>.25){const np=tri(g.ph+dt*G.sched[g.k].sp*P.slow);if((g.pos-g.aim)*(np-g.aim)<=0&&g.pos!==np)o.ok=1;}
  return o;},
 maxProgress(){return Math.max(1,G.v)*300;},barEnd(){return String(G.v*3);},
 banner(c){return null;},
 draw(c,b){
  const g=c.g,P=prm(c),bw=b.w*.84,bx=b.x+(b.w-bw)/2,by=b.y+b.h*.2,bh=Math.max(18,b.h*.07);
  rrect(bx,by,bw,bh,bh/2,'#0c1226','#8fa0b3',3);
  const zone=(hw,col)=>{const w=Math.min(1,hw*2*P.win)*bw;ctx.fillStyle=col;ctx.fillRect(bx+bw/2-w/2,by+3,w,bh-6);};
  zone(.2,'#c9884a');zone(.11,'#ffd23f');zone(.045,'#3ddc84');
  const pos=g.state==='run'?g.pos:(g.res?g.res.pos:g.pos),mx=bx+pos*bw;
  glow(mx,by+bh/2,bh*.9,'#fff',g.state==='run'?.25:.1);
  ctx.fillStyle='#fff';ctx.strokeStyle='#19131c';ctx.lineWidth=2;ctx.fillRect(mx-3,by-8,6,bh+16);ctx.strokeRect(mx-3,by-8,6,bh+16);
  const crateY=b.y+b.h*.55,cw=Math.min(b.w*.34,b.h*.3),cx=b.x+b.w/2,drop=g.state==='hit'?Math.sin(clamp(g.t/.3,0,1)*Math.PI):0;
  ctx.fillStyle='#4a5a85';ctx.strokeStyle='#19131c';ctx.lineWidth=3;ctx.fillRect(cx-cw/2,crateY,cw,cw*.45);ctx.strokeRect(cx-cw/2,crateY,cw,cw*.45);
  ctx.fillStyle='#e8eef7';ctx.fillRect(cx-cw*.38,crateY-4,cw*.76,6);
  if(g.res&&g.state!=='run'&&g.res.pts>0)txt(['','\u2022','\u2605','\u2605\u2605\u2605'][g.res.pts],cx,crateY+cw*.3,cw*.3,['','#ffd9a0','#ffe66d','#9bffb0'][g.res.pts],'center',false);
  const sy=by+bh+10+drop*(crateY-by-bh-cw*.45);
  ctx.fillStyle='#8fa0b3';ctx.fillRect(cx-5,by+bh+4,10,Math.max(4,sy-by-bh-4));
  ctx.fillStyle='#4cc9f0';ctx.fillRect(cx-cw*.3,sy,cw*.6,cw*.22);ctx.strokeRect(cx-cw*.3,sy,cw*.6,cw*.22);
  for(let i=0;i<G.v;i++){const x=b.x+b.w/2+(i-(G.v-1)/2)*Math.min(18,(b.w-20)/G.v),r=Math.min(6,b.w/G.v/3);   // stamp results
    ctx.fillStyle=i<g.results.length?['#ff8fa3','#ffd9a0','#ffe66d','#3ddc84'][g.results[i]]:'#25304f';ctx.beginPath();ctx.arc(x,b.y+b.h*.12,r,0,7);ctx.fill();}
  drawRobot(c,cx-b.w*.3,b.y+b.h-8,Math.min(b.h*.3,b.w*.34),c.pose);
  bigButton(cx+b.w*.26,b.y+b.h-b.h*.14,Math.min(b.w*.09,b.h*.085),g.state==='hit'&&g.t<.15);
  drawFx(c,cx,crateY-cw*.1,Math.min(26,b.w*.09));
 }};

/* ---- 5. COPY CIRCUIT: Simon says with four pads ---- */
const COPY={id:'copy',name:'Copy Circuit',
 blurb:'Watch the pads light up, then copy the pattern in the same order with the coloured buttons. Every pattern is one longer!',
 lens:[{n:'30 seconds',v:30},{n:'45 seconds',v:45},{n:'60 seconds',v:60}],lenDef:1,
 plan(R){const s=[];for(let i=0;i<40;i++)s.push(DIRS[Math.floor(R()*4)]);return s;},
 init(c){return {n:2,phase:'show',t:-.7,k:-1,lit:null,inIdx:0,idle:0,aiT:0,flash:{u:0,l:0,r:0,d:0},errs:0};},
 step(c,inp,dt,P){
  const g=c.g;for(const d of DIRS)g.flash[d]=Math.max(0,g.flash[d]-dt);
  if(g.phase==='show'){
    g.t+=dt;const per=.62/P.slow,on=per*.65,k=Math.floor(g.t/per);
    if(g.t<0||k>=g.n){g.lit=null;if(g.t>=0&&k>=g.n){g.phase='input';g.inIdx=0;g.idle=0;g.aiT=.7;}}
    else{g.lit=(g.t-k*per)<on?G.sched[k]:null;if(k!==g.k&&g.lit){g.k=k;if(c.human)beep({u:520,l:440,r:660,d:350}[g.lit],.18);}}
    if(g.lit){c.pose='look';c.lookDir=g.lit;c.poseT=.15;}else if(c.pose==='idle'||c.pose==='think'){setPose(c,'think',.15);}
  }else if(g.phase==='input'){
    g.idle+=dt;
    for(const d of DIRS){
      let n=inp[d]|0;
      while(n-->0&&g.phase==='input'){
        g.flash[d]=.22;g.idle=0;
        if(d===G.sched[g.inIdx]){
          g.inIdx++;if(c.human)beep({u:520,l:440,r:660,d:350}[d],.1);
          if(g.inIdx>=g.n){c.score+=g.n;c.lastT=G.t;pop(c,'+'+g.n,'#9bffb0');setPose(c,'nod',.7);g.n=Math.min(40,g.n+1);g.phase='good';g.t=0;if(c.human)beep(880,.2);}
        }else{
          const lose=pen(P,1);if(lose)c.score=Math.max(0,c.score-lose);
          pop(c,lose?'OOPS -'+lose:'OOPS','#ffb3c0');setPose(c,'shake',.6);g.phase='bad';g.t=0;g.errs++;if(c.human)beep(140,.3);
        }
      }
    }
    if(g.phase==='input'&&g.idle>6){g.phase='show';g.t=-.4;g.k=-1;}
    if(g.phase==='input'&&c.pose==='idle')setPose(c,'think',.15);
  }else{g.t+=dt;if(g.t>.8){g.phase='show';g.t=-.4;g.k=-1;g.inIdx=0;}}
 },
 ai(c,dt){
  const g=c.g,o=Object.assign({},NO_INPUT);
  if(g.phase!=='input')return o;
  g.aiT-=dt;
  if(g.aiT<=0){
    const ok=rand()<clamp(c.skill+.12-g.n*.045,.4,.97),want=G.sched[g.inIdx];
    let d=want;if(!ok){do{d=DIRS[Math.floor(rand()*4)];}while(d===want);}
    o[d]++;g.aiT=.42+rand()*.3+(1-c.skill)*.6;
  }
  return o;},
 banner(c){const g=c.g;return !g?null:g.phase==='show'?'WATCH!':g.phase==='input'?'YOUR TURN!':g.phase==='good'?'NICE!':'TRY AGAIN';},
 draw(c,b){
  const g=c.g,cx=b.x+b.w/2,r=Math.min(b.w*.15,b.h*.13),cy=b.y+b.h*.37;
  for(const d of DIRS){const o=PAD_OFF[d];drawPad(d,cx+o[0]*r*2.3,cy+o[1]*r*1.8,r,g.lit===d||g.flash[d]>0,false);}
  const dots=Math.min(g.n,12),dw=Math.min(16,(b.w-20)/dots);
  for(let i=0;i<dots;i++){ctx.fillStyle=(g.phase==='input'&&i<g.inIdx)||g.phase==='good'?'#3ddc84':'#25304f';ctx.strokeStyle='#8fa0b3';ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(cx+(i-(dots-1)/2)*dw,b.y+b.h*.08,Math.min(5,dw*.35),0,7);ctx.fill();ctx.stroke();}
  drawRobot(c,cx,b.y+b.h-8,Math.min(b.h*.28,b.w*.38),c.pose);
  drawFx(c,cx,cy+r*2.4,Math.min(28,b.w*.09));
 }};

/* ---- 6. CARGO CATCH: slide along five lanes and catch the falling parts ---- */
const CATCH={id:'catch',name:'Cargo Catch',
 blurb:'Parts are falling off the cargo ship! Press LEFT and RIGHT to slide along and catch the bolts and gold gears. Dodge the zappy sparks!',
 lens:[{n:'20 seconds',v:20},{n:'30 seconds',v:30},{n:'45 seconds',v:45}],lenDef:1,
 plan(R,len){
  const ev=[];let t=1.3;
  while(t<len-.5){const pr=t/len,r=R(),kind=(r<.16&&t>3)?'spark':(r>.88?'gear':'bolt');ev.push({t,lane:Math.floor(R()*5),kind,fall:1.9-.6*pr});t+=.8-.32*pr+R()*.1;}
  return ev;},
 init(c){return {lane:2,pos:2,done:{},aiT:0,aiGoal:{},got:[]};},
 step(c,inp,dt,P){
  const g=c.g;
  g.lane=clamp(g.lane-(inp.l|0)+(inp.r|0),0,4);
  g.pos+=(g.lane-g.pos)*Math.min(1,dt*16);
  if(c.pose==='idle'||c.pose==='catch')setPose(c,'catch',.15);
  for(let i=0;i<G.sched.length;i++){
    const e=G.sched[i];if(g.done[i])continue;
    if(G.t>=e.t+e.fall/P.slow){
      g.done[i]=1;
      if(Math.abs(g.pos-e.lane)<.55*P.win){
        if(e.kind==='spark'){const lose=pen(P,2);c.score=Math.max(0,c.score-lose);setPose(c,'fumble',.5);pop(c,lose?'-'+lose:'ZAP!','#d9a6ff');if(c.human)beep(140,.25);}
        else{const v=e.kind==='gear'?3:1;c.score+=v;c.lastT=G.t;setPose(c,'catchJoy',.25);pop(c,'+'+v,e.kind==='gear'?'#ffd23f':'#9bffb0');if(c.human)beep(e.kind==='gear'?990:620,.06);}
      }
    }
  }
 },
 ai(c,dt,P){
  const g=c.g,o=Object.assign({},NO_INPUT);g.aiT-=dt;if(g.aiT>0)return o;
  let best=-1,bt=1e9;
  for(let i=0;i<G.sched.length;i++){const e=G.sched[i];if(g.done[i]||e.kind==='spark'||G.t<e.t)continue;const at=e.t+e.fall/P.slow;if(at<bt){bt=at;best=i;}}
  if(best<0)return o;
  const e=G.sched[best];let goal=g.aiGoal[best];
  if(goal==null)goal=g.aiGoal[best]=rand()<clamp(c.skill-.08,.5,.92)?e.lane:clamp(e.lane+(rand()<.5?-1:1),0,4);
  if(bt-G.t<1.2){if(g.lane<goal){o.r=1;g.aiT=.1+(1-c.skill)*.6*rand();}else if(g.lane>goal){o.l=1;g.aiT=.1+(1-c.skill)*.6*rand();}}
  return o;},
 draw(c,b){
  const g=c.g,P=prm(c),lw=Math.min(b.w*.17,b.h*.2),x0=b.x+b.w/2-lw*2.5,top=b.y+b.h*.08,S=Math.min(b.h*.28,lw*2.3),by=b.y+b.h-8-S*1.02;
  for(let l=0;l<5;l++){ctx.fillStyle=l%2?'rgba(255,255,255,.05)':'rgba(255,255,255,.09)';ctx.fillRect(x0+l*lw,top,lw,by-top+lw*.4);}
  ctx.fillStyle='#4a5a85';ctx.strokeStyle='#19131c';ctx.lineWidth=3;ctx.fillRect(x0-lw*.3,top-lw*.35,lw*5.6,lw*.35);ctx.strokeRect(x0-lw*.3,top-lw*.35,lw*5.6,lw*.35);
  for(let i=0;i<G.sched.length;i++){
    const e=G.sched[i];if(g.done[i]||G.t<e.t)continue;
    const p=(G.t-e.t)/(e.fall/P.slow),x=x0+(e.lane+.5)*lw,y=top+(by-top)*p,s=lw*.3;
    if(e.kind==='bolt'){ctx.fillStyle='#b9c6d6';ctx.strokeStyle='#19131c';ctx.lineWidth=2.5;ctx.beginPath();for(let k=0;k<6;k++){const a=k*Math.PI/3;ctx.lineTo(x+Math.cos(a)*s,y+Math.sin(a)*s);}ctx.closePath();ctx.fill();ctx.stroke();ctx.fillStyle='#16213f';ctx.beginPath();ctx.arc(x,y,s*.38,0,7);ctx.fill();}
    else if(e.kind==='gear'){glow(x,y,s*1.6,'#ffd23f',.3);ctx.fillStyle='#ffd23f';ctx.strokeStyle='#19131c';ctx.lineWidth=2.5;gearPath(x,y,s*1.15,8);ctx.fill();ctx.stroke();ctx.fillStyle='#16213f';ctx.beginPath();ctx.arc(x,y,s*.35,0,7);ctx.fill();}
    else{glow(x,y,s*1.5,'#b862e8',.35);ctx.fillStyle='#7b2cbf';ctx.strokeStyle='#19131c';ctx.lineWidth=2.5;ctx.beginPath();ctx.arc(x,y,s,0,7);ctx.fill();ctx.stroke();txt('\u26A1',x,y+s*.45,s*1.2,'#fff6b0','center',false);}
  }
  const rx=x0+(g.pos+.5)*lw;
  drawRobot(c,rx,b.y+b.h-8,S,c.pose);
  ctx.fillStyle='#c9d3de';ctx.strokeStyle='#19131c';ctx.lineWidth=3;   // basket held up high
  ctx.beginPath();ctx.moveTo(rx-lw*.42,by);ctx.lineTo(rx+lw*.42,by);ctx.lineTo(rx+lw*.3,by+lw*.34);ctx.lineTo(rx-lw*.3,by+lw*.34);ctx.closePath();ctx.fill();ctx.stroke();
  drawFx(c,rx,by-lw*.3,Math.min(26,b.w*.09));
 }};

/* ---- shared defaults so a game only has to define what is special ---- */
const GAME_DEF={cap:v=>v,bestHigh:true,plan:()=>null,
 status(c){return c.score+(c.score===1?' pt':' pts');},
 banner(c){return null;},
 rank(a,b){return b.score-a.score||a.lastT-b.lastT||a.ci-b.ci;},
 resultText(c){return c.score+(c.score===1?' pt':' pts');},
 bestOf(c){return c.score;},
 progress(c){return c.score*SCORE_UNIT;},
 maxProgress(){let m=8*SCORE_UNIT;for(const c of players)m=Math.max(m,c.prog*1.15);return m;},
 barEnd(){return String(Math.round(this.maxProgress()/SCORE_UNIT));}};
const GAMES=[BOLT,SURGE,DASH,STAMP,COPY,CATCH].map(g=>Object.assign({},GAME_DEF,g));
