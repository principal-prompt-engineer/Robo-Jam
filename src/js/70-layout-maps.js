/* ---------- screen layouts and cameras (skill 04) ---------- */
function camTarget(list,w,h){
  let mnx=1e9,mny=1e9,mxx=-1e9,mxy=-1e9;
  for(const c of list){mnx=Math.min(mnx,c.x);mny=Math.min(mny,c.y);mxx=Math.max(mxx,c.x);mxy=Math.max(mxy,c.y);}
  let cx=(mnx+mxx)/2,cy=(mny+mxy)/2;
  if(list.length===1){cx+=list[0].vx*.25;cy+=list[0].vy*.25;}
  const base=clamp(Math.min(w,h)/820,.4,1.3);
  const sc=Math.max(clamp(Math.min(w/(mxx-mnx+460),h/(mxy-mny+460),base),.3,1.8),w/WW,h/WH);   // never zoom out past the arena
  const hw=w/(2*sc),hh=h/(2*sc);                 // keep the view inside the arena: no black borders
  cx=hw*2>=WW?WW/2:clamp(cx,hw,WW-hw);cy=hh*2>=WH?WH/2:clamp(cy,hh,WH-hh);
  return {x:cx,y:cy,s:sc};
}
/* rows x columns for n stages. Rows may hold fewer stages than columns (e.g. 3 in a grid = 2+1): that row's stages get wider. */
function splitDims(n,screen){
  if(screen==='vertical'){const cols=n<=4?n:Math.ceil(n/2);return {cols,rows:Math.ceil(n/cols)};}       // dividers are vertical lines
  if(screen==='horizontal'){const rows=n<=4?n:Math.ceil(n/2);return {rows,cols:Math.ceil(n/rows)};}     // dividers are horizontal lines
  const cols=n===2?(VW>=VH?2:1):(n<=4?2:3);return {cols,rows:Math.ceil(n/cols)};                         // grid
}
/* Skill 04 section 7 (non-spatial): one pane per ROBOT (humans and CPUs), no camera. */
function layoutPanes(){
  const list=players;
  if(!list.length)return [{x:0,y:0,w:VW,h:VH,list:[],focus:null,c:null}];
  const one=c=>({x:0,y:0,w:VW,h:VH,list:[c],focus:c.human?c:null,c});
  if(list.length===1)return [one(list[0])];
  let scr=CFG.screen;if(scr==='vertical'&&VW<VH*.75)scr='horizontal';   // tall phone screen: columns would be too thin
  const n=list.length,d=splitDims(n,scr),ch=VH/d.rows,out=[];
  list.forEach((c,i)=>{
    const r=Math.floor(i/d.cols),inRow=Math.min(d.cols,n-r*d.cols),cw=VW/inRow;
    out.push({x:(i%d.cols)*cw,y:r*ch,w:cw,h:ch,list:[c],focus:c.human?c:null,c});
  });
  return out;
}

/* ---------- standings bars (skill 05 section 7): kind = vertical | horizontal, scope = pane | shared ---------- */
function mapDims(kind,w,h){
  if(kind==='vertical')return {w:36,h:clamp(h*.5,120,240)};
  if(kind==='horizontal')return {w:clamp(w*.5,160,320),h:36};
  return {w:36,h:clamp(h*.5,120,240)};
}
/* anchor a w x h box inside `box` at one of the nine named positions (MAP_POS); bottom positions keep clear of the touch buttons */
function anchorRect(d,box,pos,m){
  m=m||10;const L=pos.indexOf('left')>=0,R=pos.indexOf('right')>=0,T=pos.indexOf('top')===0,B=pos.indexOf('bottom')===0;
  const x=L?box.x+m:R?box.x+box.w-d.w-m:box.x+(box.w-d.w)/2;
  const y=T?box.y+m:B?box.y+box.h-d.h-(IS_TOUCH?130:m):box.y+(box.h-d.h)/2;
  return {x,y,w:d.w,h:d.h};
}
function paneMapRect(kind,p){             // anchored inside one pane
  const d=mapDims(kind,p.w,p.h);
  if(CFG.mapPosPane!=='auto')return anchorRect(d,p,CFG.mapPosPane);
  if(kind==='vertical')return {x:p.x+p.w-d.w-10,y:p.y+(p.h-d.h)/2,w:d.w,h:d.h};
  if(kind==='horizontal')return {x:p.x+(p.w-d.w)/2,y:p.y+p.h-d.h-(IS_TOUCH?130:16),w:d.w,h:d.h};
  return {x:p.x+p.w-d.w-10,y:p.y+(p.h-d.h)/2,w:d.w,h:d.h};
}
function sharedMapRect(kind,panes){       // one map for everybody: settable (CFG.mapPos) or, when Automatic, on the dividers
  const d=mapDims(kind,VW,VH),split=panes.length>1,scr=CFG.screen;
  if(CFG.mapPos!=='auto')return anchorRect(d,{x:0,y:0,w:VW,h:VH},CFG.mapPos);
  const vDiv=split&&(scr==='vertical'||scr==='grid'),hDiv=split&&(scr==='horizontal'||scr==='grid');
  if(kind==='vertical')return {x:vDiv?VW/2-d.w/2:VW-d.w-10,y:(VH-d.h)/2,w:d.w,h:d.h};
  if(kind==='horizontal')return {x:(VW-d.w)/2,y:hDiv?VH/2-d.h/2:VH-d.h-(IS_TOUCH?130:16),w:d.w,h:d.h};
  return {x:VW-d.w-10,y:(VH-d.h)/2,w:d.w,h:d.h};
}
/* player marker on maps: the same badge (colour + shape per colour) as everywhere else, plus a white ring for the focused player */
function drawMark(x,y,r,c,focus){
  drawBadge(x,y,r,c,{map:true});
  if(focus){shapePath(x,y,r+3,identShape()?c.ci:0);ctx.strokeStyle='#fff';ctx.lineWidth=1.5;ctx.stroke();}
}
function mapJobs(panes){                  // [{kind,rect,focus,clip}] to draw this frame
  const kind=CFG.map;if(kind==='off')return [];
  if(CFG.mapScope==='shared'&&panes.length>1)return [{kind,rect:sharedMapRect(kind,panes),focus:null,clip:null}];
  return panes.map(p=>({kind,rect:paneMapRect(kind,p),focus:p.focus,clip:p}));
}
function drawMap(job){
  const {kind,rect:r,focus}=job,m=curMode();
  ctx.save();
  if(job.clip){ctx.beginPath();ctx.rect(job.clip.x,job.clip.y,job.clip.w,job.clip.h);ctx.clip();}
  rrect(r.x,r.y,r.w,r.h,10,'rgba(0,0,0,.45)');
  {
    const vert=kind==='vertical',max=Math.max(1,m.maxProgress()),pad=14;
    const len=(vert?r.h:r.w)-pad*2,pos=f=>vert?{x:r.x+r.w/2,y:r.y+r.h-pad-f*len}:{x:r.x+pad+f*len,y:r.y+r.h/2};
    const a=pos(0),b=pos(1);
    ctx.strokeStyle='rgba(255,255,255,.35)';ctx.lineWidth=4;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();ctx.lineCap='butt';
    const be=m.barEnd();txt(be,b.x+(vert?0:(be==='★'?0:6)),b.y+(vert?-4:(be==='★'?6:4)),be==='★'?14:11,be==='★'?'#ffd23f':THEME.dim,vert||be==='★'?'center':'left',false);   // label at the far end of the bar
    const placed=[];
    for(const c of players.slice().sort((p,q)=>p.prog-q.prog)){
      const f=clamp(c.prog/max,0,1),p=pos(f);let lane=0;
      for(const q of placed)if(Math.abs((vert?q.y-p.y:q.x-p.x))<13)lane++;
      const off=lane?(lane%2?1:-1)*Math.ceil(lane/2)*9:0;placed.push(p);
      const mx=vert?p.x+off:p.x,my=vert?p.y:p.y+off;
      drawMark(mx,my,c.human?6.5:4.5,c,c===focus);
    }
  }
  ctx.restore();
}
