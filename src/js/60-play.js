/* ---------- round setup ---------- */
function startRound(next){   // next=true: another round of the same series (keeps totals)
  const hum=slots.filter(Boolean);
  if(!hum.length)return;
  if(!next){series.n=CFG.series;series.round=1;series.totals={};series.pts={};}
  buildWorld(true);
  const m=curMode(),aiN=clamp(CFG.ai,0,MAX_PLAYERS-hum.length);
  const used=new Set(hum.map(p=>p.slot)),free=[];
  for(let i=0;i<MAX_PLAYERS;i++)if(!used.has(i))free.push(i);
  const roles=[];
  for(let i=0;i<aiN;i++)roles.push({ai:true,ci:free[i%free.length],n:i+1});
  hum.forEach(p=>roles.push({ai:false,p}));
  roles.sort((a,b)=>(a.ai?a.ci:a.p.slot)-(b.ai?b.ci:b.p.slot));   // stages stay in colour order, humans and CPUs mixed
  players=[];
  roles.forEach((r,k)=>{
    const human=!r.ai,ci=human?r.p.slot:r.ci,tag=human?'P'+(r.p.slot+1):'CPU';
    players.push({human,dev:human?r.p.dev:null,slot:human?r.p.slot:-1,tag,
      label:human?(r.p.name?tag+' '+r.p.name:'Player '+(r.p.slot+1)):'CPU '+r.n,profName:human?r.p.name:'',
      lv:human?r.p.lv:-1,assist:0,ci,color:COLORS[ci%8],
      score:0,prog:0,lastT:0,finished:false,finT:0,inv:0,out:false,team:-1,
      skill:.8+rand()*.15,wob:rand()*6,pose:'idle',poseT:0,poseAge:0,fx:[],g:null,lookDir:null});
  });
  state='count';cdT=3.6;roundT=0;doneT=0;holdMsg='';firstFinT=null;results=null;roundSaved=false;set.open=false;
  m.start();for(const c of players)c.prog=m.progress(c);
  if(IS_TOUCH)document.getElementById('touch').style.visibility='visible';
}
function missingDevice(){
  for(const c of players)if(c.human&&!devAlive(c.dev))return c.label+' ('+devLabel(c.dev)+')';
  return '';
}

/* ---------- one fixed 1/60 s step ---------- */
function update(dt){
  const m=curMode();
  if(state==='count'){
    const miss=missingDevice();
    if(miss){holdMsg='Waiting for '+miss+'...';return;}   // countdown holds while a joined device is missing
    holdMsg='';flushEdges();
    const before=Math.ceil(cdT);cdT-=dt;
    if(Math.ceil(cdT)!==before&&cdT>0&&cdT<3)beep(440,.12);
    if(cdT<=0){state='play';beep(880,.4);flushEdges();}
  }else if(state==='play'){
    const miss=missingDevice();
    if(miss){openPause('kb','Controller disconnected: '+miss);return;}
  }
  if(state==='play'){m.tick(dt);roundT+=dt;}else if(state==='done')roundT+=dt;
  const humans=players.filter(c=>c.human);
  for(const c of players)c.prog=m.progress(c);       // snapshot before anyone acts, so update order never decides who gets help
  const lead=state==='play'?adaptiveStep(players,dt):Math.max.apply(null,players.filter(c=>!c.out).map(c=>c.prog).concat([0]));
  dbg.lead=lead;
  for(const c of players){
    const P=prm(c);
    c.poseAge+=dt;if(c.poseT>0){c.poseT-=dt;if(c.poseT<=0)c.pose='idle';}
    if(c.fx.length){for(const f of c.fx)f.a+=dt;c.fx=c.fx.filter(f=>f.a<1);}
    if(c.out)continue;
    if(state==='play'&&!c.finished&&doneT<=0){
      const inp=c.human?getInput(c.dev):m.ai(c,dt,P);
      const was=c.finished;m.touch(c,P,inp,dt);
      if(c.finished&&!was&&c.human&&humans.length>1&&firstFinT===null)firstFinT=roundT;
    }else if(c.human)getInput(c.dev);                 // drain presses made while waiting
  }
  if(state==='play'){
    const timedOut=firstFinT!==null&&roundT-firstFinT>=FIRST_FIN_TIMEOUT;
    if(m.over(humans)||timedOut){doneT+=dt;if(doneT>1.2||timedOut){state='done';finishRound();}}
  }
}
const standings=()=>curMode().rank(players);
const rankHumans=list=>curMode().rank(list);
function finishRound(){
  if(roundSaved)return;roundSaved=true;resAge=0;
  const m=curMode(),st=standings(),humans=players.filter(c=>c.human);
  for(const c of players)c.prog=m.progress(c);
  st.forEach((c,i)=>{   // Robot of the Month points for EVERY robot: 1st gets n, last gets 1; winner celebrates, last one sulks
    series.pts[c.ci]=(series.pts[c.ci]||0)+(st.length-i);
    c.fx=[];c.poseT=99;c.poseAge=0;c.pose=i===0?'win':(i===st.length-1&&st.length>2?'sad':'cheer');
  });
  const classes=[];
  for(const lv of LV_SHOW){
    const list=rankHumans(humans.filter(c=>c.lv===lv));
    if(list.length)classes.push({lv,list});
  }
  const hr0=rankHumans(humans);                // series points among humans: 1st human gets n, last gets 1
  hr0.forEach((c,i)=>{series.totals[c.slot]=(series.totals[c.slot]||0)+(humans.length-i);});
  const board=players.map(c=>({c,v:series.pts[c.ci]||0,last:st.indexOf(c)})).sort((a,b)=>b.v-a.v||a.last-b.last);
  results={overall:st,classes,multi:humans.length>1,summary:m.summary?m.summary():[],round:series.round,n:series.n,board,final:series.round>=series.n&&series.n>1};
  for(const c of humans){                      // saved profiles: named players only
    if(!c.profName)continue;
    const p=getProf(c.profName);
    p.rounds++;if(c.finished)p.fin++;p.pts+=c.score||0;
    const b=m.bestOf(c),bk=m.bestKey?m.bestKey():m.id;
    if(b!=null){const old=p.best[bk];if(old==null||(m.bestHigh?b>old:b<old))p.best[bk]=b;}
  }
  if(humans.length>1){
    const hr=rankHumans(humans);
    if(hr[0].profName)getProf(hr[0].profName).overall++;
    for(const cl of classes){const w=cl.list[0];if(w.profName)getProf(w.profName).wins[LEVELS[cl.lv].name]++;}
  }
  saveProfiles();
}
