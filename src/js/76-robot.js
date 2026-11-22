/* ---------- THE ROBOT ----------
   If art/robot_master_red.png is present at build time it is used as a sprite sheet (see sprites/ for how to make it) and
   recoloured per player by shifting every red pixel to the player's hue. Without it the robot is drawn in code with the
   same poses, so the game is fully playable before any art exists. Both paths use the same pose names. */
const SPR={fw:128,fh:128,feetY:120,stand:84};   // frame size, feet row inside a frame, standing height of the robot in a frame
/* pose -> sheet cells. once:true plays from the start when the pose is set (uses c.poseAge), otherwise it loops on the animation clock */
const POSE_FRAMES={
 idle:{row:0,f:[0,1,2,3],fps:4},wave:{row:0,f:[4,5,6,7],fps:8},
 cheer:{row:1,f:[0,1,2,3],fps:9},win:{row:1,f:[4,5,6,7],fps:6},
 sad:{row:2,f:[0,1,2,3],fps:4},zap:{row:2,f:[4,5,6,7],fps:14},
 run:{row:3,f:[0,1,2,3,4,5,6,7],fps:16},
 whack:{row:4,f:[0,1,2,3],fps:14,once:true},mash:{row:4,f:[4,5,6,7],fps:16},
 catch:{row:5,f:[0,1,2,3],fps:6},catchJoy:{row:5,f:[4,5],fps:8},fumble:{row:5,f:[6,7],fps:8},
 stamp:{row:6,f:[0,1,2,3],fps:12,once:true},think:{row:6,f:[4,5,6,7],fps:4},
 lookU:{row:7,f:[0],fps:1},lookL:{row:7,f:[1],fps:1},lookR:{row:7,f:[2],fps:1},lookD:{row:7,f:[3],fps:1},
 nod:{row:7,f:[4,5],fps:6},shake:{row:7,f:[6,7],fps:8},
 dizzy:{row:8,f:[0,1,2,3],fps:6},power:{row:8,f:[4,5,6,7],fps:8}};
const ROBOT={img:null,ready:false,cache:{}};
function loadRobotSheet(){
  if(typeof EMBEDDED_ART==='undefined'||!EMBEDDED_ART.robot||typeof Image==='undefined')return;
  const im=new Image();im.onload=()=>{ROBOT.ready=true;for(let i=0;i<MAX_PLAYERS;i++)robotSheet({color:COLORS[i]});};
  im.src=EMBEDDED_ART.robot;ROBOT.img=im;
}
function hsvOf(r,g,b){
  r/=255;g/=255;b/=255;const mx=Math.max(r,g,b),mn=Math.min(r,g,b),d=mx-mn;let h=0;
  if(d){if(mx===r)h=60*(((g-b)/d+6)%6);else if(mx===g)h=60*((b-r)/d+2);else h=60*((r-g)/d+4);}
  return [h,mx?d/mx:0,mx];
}
function rgbOf(h,s,v){
  const k=n=>(n+h/60)%6,f=n=>v-v*s*Math.max(0,Math.min(k(n),4-k(n),1));
  return [f(5)*255,f(3)*255,f(1)*255];
}
const SRC_HUE=356;   // the hue of the red on the sheet (#B60D18)
function robotSheet(c){   // the sheet recoloured for this player colour (cached), or null while there is no usable sheet
  if(!ROBOT.ready||!ROBOT.img)return null;
  if(ROBOT.cache[c.color])return ROBOT.cache[c.color];
  const cv=document.createElement('canvas');cv.width=ROBOT.img.width;cv.height=ROBOT.img.height;
  const x=cv.getContext('2d');x.drawImage(ROBOT.img,0,0);
  const hex=c.color,tr=parseInt(hex.slice(1,3),16),tg=parseInt(hex.slice(3,5),16),tb=parseInt(hex.slice(5,7),16),th=hsvOf(tr,tg,tb);
  const same=Math.abs(((th[0]-SRC_HUE+540)%360)-180)<4;
  if(!same){
    const im=x.getImageData(0,0,cv.width,cv.height),d=im.data,vmul=th[2]/.72;
    for(let i=0;i<d.length;i+=4){
      if(d[i+3]===0)continue;
      const h=hsvOf(d[i],d[i+1],d[i+2]),off=((h[0]-SRC_HUE+540)%360)-180;
      if(Math.abs(off)<=18&&h[1]>.45){const o=rgbOf((th[0]+off+360)%360,h[1],Math.min(1,h[2]*vmul));d[i]=o[0];d[i+1]=o[1];d[i+2]=o[2];}
    }
    x.putImageData(im,0,0);
  }
  return ROBOT.cache[c.color]=cv;
}
function poseKey(c,pose){
  if(pose==='look'){return {u:'lookU',l:'lookL',r:'lookR',d:'lookD'}[c.lookDir]||'think';}
  return POSE_FRAMES[pose]?pose:'idle';
}
function drawRobot(c,x,by,S,pose,o){
  pose=pose||c.pose||'idle';o=o||{};
  ctx.save();
  if(c.out)ctx.globalAlpha=.3;
  ctx.fillStyle='rgba(0,0,0,.32)';ctx.beginPath();ctx.ellipse(x,by,S*.34,S*.07,0,0,7);ctx.fill();
  if(c.lv===LV_ADAPTIVE&&c.assist>.03){ctx.strokeStyle=THEME.help;ctx.globalAlpha=.25+.55*c.assist;ctx.lineWidth=3;ctx.beginPath();ctx.ellipse(x,by-S*.48,S*.5,S*.58,0,0,7);ctx.stroke();ctx.globalAlpha=c.out?.3:1;}
  const sheet=robotSheet(c);
  if(sheet){
    const pf=POSE_FRAMES[poseKey(c,pose)],n=pf.f.length;
    const i=pf.once?Math.min(n-1,Math.floor(c.poseAge*pf.fps)):Math.floor(animClock*pf.fps+(c.wob||0))%n,k=S/SPR.stand,cell=pf.f[i];
    if(o.flip){ctx.translate(x,0);ctx.scale(-1,1);ctx.translate(-x,0);}
    ctx.drawImage(sheet,cell*SPR.fw,pf.row*SPR.fh,SPR.fw,SPR.fh,x-SPR.fw/2*k,by-SPR.feetY*k,SPR.fw*k,SPR.fh*k);
  }else procRobot(c,x,by,S,pose);
  ctx.restore();
}
/* the code-drawn robot: u = S/100, origin at the feet, up is negative y. Arm angles: 0 = hanging down, 90 = out sideways, 180 = straight up. */
function procRobot(c,x,by,S,pose){
  const u=S/100,t=animClock+(c.wob||0),col=c.color,OUT='#19131c',METAL='#c3ccd6',DARK='#1b1f2e',EYE='#7fe8ff';
  let aL=12,aR=12,bob=Math.sin(t*3)*1.2,tilt=0,eye='open',mouth='smile',leg=0,lean=0,jump=0,fx=null,lx=0,ly=0,wob=0;
  const age=c.poseAge||0;
  switch(pose){
    case 'wave':aR=150+Math.sin(t*12)*22;break;
    case 'cheer':aL=aR=165+Math.sin(t*14)*8;jump=Math.abs(Math.sin(t*7))*9;eye='happy';mouth='open';break;
    case 'win':aL=aR=172;jump=Math.abs(Math.sin(t*5))*7;eye='happy';mouth='open';fx='stars';break;
    case 'sad':aL=aR=4;bob=-3;tilt=-4;eye='sad';mouth='frown';break;
    case 'zap':aL=aR=95+Math.sin(t*40)*25;eye='x';mouth='o';fx='zap';wob=Math.sin(t*50)*3;break;
    case 'run':{const p=t*14;aL=40+Math.sin(p)*50;aR=40-Math.sin(p)*50;leg=Math.sin(p);lean=6;jump=Math.abs(Math.sin(p))*3;mouth='open';break;}
    case 'whack':{const a=Math.min(1,age/.25);aR=175-150*a*a;aL=25;eye='happy';mouth='open';break;}
    case 'mash':{const p=t*18;aL=50+Math.sin(p)*45;aR=50-Math.sin(p)*45;mouth='flat';jump=-2;break;}
    case 'catch':aL=aR=155;mouth='open';break;
    case 'catchJoy':aL=aR=160;eye='happy';mouth='open';jump=Math.abs(Math.sin(t*12))*3;break;
    case 'nod':aL=aR=12;tilt=0;ly=Math.sin(t*14)*.8;eye='happy';break;
    case 'shake':tilt=Math.sin(t*20)*9;lx=Math.sin(t*20);eye='sad';mouth='flat';break;
    case 'fumble':aL=aR=100+Math.sin(t*20)*20;eye='x';mouth='o';break;
    case 'stamp':{const a=Math.min(1,age/.15);aR=170-135*a;aL=15;eye='happy';break;}
    case 'think':aR=125;aL=12;lx=.5;ly=-.7;mouth='flat';tilt=8;break;
    case 'look':{const d=c.lookDir;lx=d==='l'?-1:d==='r'?1:0;ly=d==='u'?-1:d==='d'?1:0;tilt=lx*10;break;}
    case 'dizzy':eye='spiral';tilt=Math.sin(t*5)*10;aL=aR=40+Math.sin(t*5)*15;mouth='o';fx='stars';break;
    case 'power':aL=aR=70;fx='glow';eye='happy';break;
  }
  ctx.save();ctx.translate(x+wob*u,by-jump*u);ctx.rotate(lean*Math.PI/180*.3);
  ctx.lineJoin='round';ctx.lineCap='round';
  const stroke=(w)=>{ctx.lineWidth=w*u;ctx.strokeStyle=OUT;};
  // legs
  for(const s of[-1,1]){
    const lift=leg*s*5,ly0=-14+Math.max(0,-lift)*-1;
    ctx.fillStyle='#8895a6';stroke(3);ctx.beginPath();ctx.roundRect((s*11-4.5)*u,(-14-Math.max(0,lift))*u,9*u,14*u,3*u);ctx.fill();ctx.stroke();
    ctx.fillStyle=DARK;ctx.beginPath();ctx.ellipse((s*11+s*2)*u,(-2-Math.max(0,lift))*u,9*u,4.5*u,0,0,7);ctx.fill();ctx.stroke();
  }
  // arms (behind body)
  const arm=(s,ang)=>{
    const sx=s*21*u,sy=-39*u,a=ang*Math.PI/180,ex=sx+Math.sin(a)*s*22*u,ey=sy+Math.cos(a)*22*u;
    stroke(11);ctx.beginPath();ctx.moveTo(sx,sy);ctx.lineTo(ex,ey);ctx.stroke();
    ctx.strokeStyle=METAL;ctx.lineWidth=7*u;ctx.beginPath();ctx.moveTo(sx,sy);ctx.lineTo(ex,ey);ctx.stroke();
    ctx.fillStyle=DARK;stroke(3);ctx.beginPath();ctx.arc(ex,ey,6.5*u,0,7);ctx.fill();ctx.stroke();
  };
  arm(-1,aL);arm(1,aR);
  // body
  ctx.fillStyle=col;stroke(3.2);ctx.beginPath();ctx.roundRect(-20*u,-46*u,40*u,32*u,9*u);ctx.fill();ctx.stroke();
  ctx.fillStyle='rgba(0,0,0,.22)';ctx.beginPath();ctx.roundRect(-20*u,-24*u,40*u,10*u,[0,0,9*u,9*u]);ctx.fill();
  ctx.fillStyle='rgba(255,255,255,.25)';ctx.beginPath();ctx.roundRect(-16*u,-43*u,14*u,4*u,2*u);ctx.fill();
  ctx.fillStyle=DARK;stroke(2);ctx.beginPath();ctx.roundRect(-11*u,-39*u,22*u,14*u,4*u);ctx.fill();ctx.stroke();
  const L=['#7fe8ff','#ffe66d','#7dff9b'];for(let i=0;i<3;i++){ctx.fillStyle=L[i];ctx.globalAlpha=.6+.4*Math.sin(t*6+i*2);ctx.beginPath();ctx.arc((-6+i*6)*u,-32*u,2.2*u,0,7);ctx.fill();}ctx.globalAlpha=1;
  // head
  ctx.save();ctx.translate(0,(-46+bob)*u);ctx.rotate(tilt*Math.PI/180);
  ctx.fillStyle='#8895a6';stroke(3);ctx.fillRect(-4*u,-3*u,8*u,5*u);
  ctx.fillStyle=col;stroke(3);for(const s of[-1,1]){ctx.beginPath();ctx.roundRect((s*24-3.5)*u,-26*u,7*u,16*u,3*u);ctx.fill();ctx.stroke();}   // ear bolts
  ctx.strokeStyle=OUT;ctx.lineWidth=2.5*u;ctx.beginPath();ctx.moveTo(0,-36*u);ctx.lineTo(0,-45*u);ctx.stroke();
  ctx.fillStyle=col;stroke(2.5);ctx.beginPath();ctx.arc(0,-47*u+Math.sin(t*8)*.8*u,4*u,0,7);ctx.fill();ctx.stroke();
  ctx.fillStyle=METAL;stroke(3.2);ctx.beginPath();ctx.roundRect(-23*u,-38*u,46*u,38*u,11*u);ctx.fill();ctx.stroke();
  ctx.fillStyle=col;ctx.beginPath();ctx.roundRect(-23*u,-38*u,46*u,9*u,[11*u,11*u,0,0]);ctx.fill();ctx.strokeStyle=OUT;ctx.lineWidth=3.2*u;ctx.beginPath();ctx.roundRect(-23*u,-38*u,46*u,38*u,11*u);ctx.stroke();
  ctx.fillStyle=DARK;stroke(2);ctx.beginPath();ctx.roundRect(-18*u,-27*u,36*u,23*u,7*u);ctx.fill();ctx.stroke();
  // face: eyes + mouth in glowing cyan
  ctx.strokeStyle=EYE;ctx.fillStyle=EYE;ctx.lineWidth=2.6*u;
  for(const s of[-1,1]){
    const ex=(s*8+lx*3)*u,ey=(-19+ly*2.5)*u;
    if(eye==='open'||eye==='sad'){ctx.beginPath();ctx.arc(ex,ey,4.4*u,0,7);ctx.fill();if(eye==='sad'){ctx.beginPath();ctx.moveTo(ex-s*5*u,ey-8*u+s*0);ctx.lineTo(ex+s*3*u,ey-5*u);ctx.stroke();}}
    else if(eye==='happy'){ctx.beginPath();ctx.arc(ex,ey+2*u,4.2*u,Math.PI*1.1,Math.PI*1.9);ctx.stroke();}
    else if(eye==='x'){ctx.beginPath();ctx.moveTo(ex-3.5*u,ey-3.5*u);ctx.lineTo(ex+3.5*u,ey+3.5*u);ctx.moveTo(ex+3.5*u,ey-3.5*u);ctx.lineTo(ex-3.5*u,ey+3.5*u);ctx.stroke();}
    else{ctx.beginPath();for(let k=0;k<20;k++){const a=k*.6+t*9,r=k*.22*u;ctx.lineTo(ex+Math.cos(a)*r,ey+Math.sin(a)*r);}ctx.stroke();}
  }
  const my=-9*u;
  if(mouth==='smile'){ctx.beginPath();ctx.arc(0,my-2*u,5*u,.2,Math.PI-.2);ctx.stroke();}
  else if(mouth==='open'){ctx.beginPath();ctx.ellipse(0,my,4.5*u,3.5*u,0,0,7);ctx.fill();}
  else if(mouth==='frown'){ctx.beginPath();ctx.arc(0,my+4*u,5*u,Math.PI+.3,-.3);ctx.stroke();}
  else if(mouth==='o'){ctx.beginPath();ctx.arc(0,my,3*u,0,7);ctx.stroke();}
  else{ctx.beginPath();ctx.moveTo(-4*u,my);ctx.lineTo(4*u,my);ctx.stroke();}
  ctx.restore();
  // effects
  if(fx==='stars'){ctx.fillStyle='#ffe66d';for(let i=0;i<4;i++){const a=t*3+i*1.57;ctx.beginPath();ctx.arc(Math.cos(a)*34*u,(-70+Math.sin(a)*14)*u,2.6*u,0,7);ctx.fill();}}
  else if(fx==='zap'){ctx.strokeStyle='#fff6b0';ctx.lineWidth=2.5*u;for(let i=0;i<5;i++){const a=i*1.26+Math.floor(t*20)*.7,r1=30*u,r2=46*u;ctx.beginPath();ctx.moveTo(Math.cos(a)*r1,-48*u+Math.sin(a)*r1);ctx.lineTo(Math.cos(a+.2)*(r1+r2)/2,-48*u+Math.sin(a+.2)*(r1+r2)/2);ctx.lineTo(Math.cos(a)*r2,-48*u+Math.sin(a)*r2);ctx.stroke();}}
  else if(fx==='glow'){ctx.strokeStyle='#7fe8ff';ctx.globalAlpha=.4+.3*Math.sin(t*10);ctx.lineWidth=4*u;ctx.beginPath();ctx.ellipse(0,-48*u,34*u,58*u,0,0,7);ctx.stroke();ctx.globalAlpha=1;}
  ctx.restore();
}
