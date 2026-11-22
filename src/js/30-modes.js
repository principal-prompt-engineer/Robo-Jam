/* ---------- game modes: plug-ins (skill 08). The shell never knows the rules, it only calls these hooks ----------
   Robo Jam has seven modes: BOOT CAMP (a playlist of different minigames, one per round) and one mode per minigame.
   The minigames themselves live in 28-minigames.js; this file only wraps them in the hook contract:
   plan(R)        picks the minigame and builds its seeded schedule (G.game, G.sched)
   fill(R)        nothing to place
   spawn(k,n)     robots have no position: returns {x:0,y:0}
   start()        round begins: every robot gets its per-game state c.g
   tick(dt)       advance the round clock
   touch(c,P,inp,dt)  one step for one robot (P = its difficulty row, inp = its buzzer input, human or CPU)
   over(humans)   true when the round should end (plus a 1.2 s delay in the shell)
   ai(c,dt,P)     CPU robot: returns an input object; aiTarget stays as a null no-op for the shell test
   progress(c)    DISTANCE-LIKE units used by Adaptive and the standings bars (100 = one point)
   status/top/banner/rank/resultText/bestOf   HUD and results;   drawItems/marks/options/summary   unused here */
const SCORE_UNIT=100;   // one point counts as this many "distance" units for Adaptive and the standings bars
function opt(m,k,d){const o=CFG.opt[m.id];return o&&o[k]!=null?o[k]:d;}
function setOpt(m,k,v){(CFG.opt[m.id]=CFG.opt[m.id]||{})[k]=v;saveCfg();}
function lenIdx(m){return clamp(CFG.len[m.id]!=null?CFG.len[m.id]:m.lenDef,0,m.lens.length-1);}
let bcOrder=[];   // the Boot Camp playlist: indexes into GAMES, shuffled once per series
function shuffled(n,R){const a=[];for(let i=0;i<n;i++)a.push(i);for(let i=n-1;i>0;i--){const j=Math.floor(R()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
function nextGameName(){return bcOrder.length&&series.round<series.n?GAMES[bcOrder[series.round%GAMES.length]].name:'';}

function mkMode(id,name,desc,lens,lenDef,pick){
  return {id,name,desc,lens,lenDef,
  plan(R){
    const g=pick(R);G.game=g;G.zones=[];
    G.v=g.lens[lenIdx(this)].v;G.len=g.cap(G.v);G.sched=g.plan(R,G.v);
  },
  fill(R){},
  spawn(k,n){return {x:0,y:0};},
  start(){
    G.t=0;
    for(const c of players){c.score=0;c.lastT=0;c.finished=false;c.pose='idle';c.poseT=0;c.poseAge=0;c.fx=[];c.g=G.game.init(c);}
    flushEdges();
  },
  tick(dt){G.t+=dt;},
  touch(c,P,inp,dt){G.game.step(c,inp,dt,P);},
  over(humans){
    if(G.t>=G.len)return true;
    if(players.every(c=>c.finished||c.out))return true;
    const h=players.filter(c=>c.human);
    if(h.length&&h.every(c=>c.finished)){let t=0;for(const c of h)t=Math.max(t,c.finT);return G.t-t>5;}   // CPUs get a moment more
    return false;
  },
  aiTarget(c){return null;},
  ai(c,dt,P){return G.game.ai(c,dt,P);},
  progress(c){return G.game.progress(c);},
  maxProgress(){return G.game.maxProgress();},
  barEnd(){return G.game.barEnd();},
  status(c){return G.game.status(c);},
  top(){return state==='count'?G.game.name:Math.max(0,Math.ceil(G.len-G.t))+' s';},
  banner(c){return G.game.banner(c);},
  rank(list){return list.slice().sort((a,b)=>G.game.rank(a,b));},
  resultText(c){return G.game.resultText(c);},
  bestOf(c){return G.game.bestOf(c);},
  get bestHigh(){return G.game?G.game.bestHigh!==false:true;},
  bestKey(){return G.game?G.game.id:id;},
  options(){return [];},
  summary(){
    const l=[G.game.name+(series.n>1?'  ('+series.round+' of '+series.n+')':'')];
    const nx=id==='bootcamp'?nextGameName():'';if(nx)l.push('Next up: '+nx);
    return l;},
  marks(){return [];},
  drawItems(x){}};
}
const MODES=[
 mkMode('bootcamp','Boot Camp: all games','A different robot challenge every round. Win the most points over the whole series to become Robot of the Month!',
  [{n:'Short',v:0},{n:'Normal',v:1},{n:'Long',v:2}],1,
  R=>{if(series.round<=1||!bcOrder.length)bcOrder=shuffled(GAMES.length,R);return GAMES[bcOrder[(series.round-1)%GAMES.length]];})
].concat(GAMES.map(g=>mkMode(g.id,g.name,g.blurb,g.lens,g.lenDef,()=>g)));
CFG.mode=clamp(CFG.mode|0,0,MODES.length-1);
