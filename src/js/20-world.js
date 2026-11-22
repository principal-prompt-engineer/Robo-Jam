/* ---------- round state G (no scrolling world: every robot has its own stage, see skill 04 section 7) ---------- */
const G={parts:[],pops:[],shake:0,arenaR:380,tiles:[],batts:[],nextSpawn:0,t:0,len:0,v:0,game:null,sched:null,items:[],rocks:[],zones:[],route:[],legLen:[],cum:[],total:0};
let seed=1;
function rnd(s){let a=s;return()=>{a=(a*16807)%2147483647;return(a-1)/2147483646;};}
const curMode=()=>MODES[CFG.mode]||MODES[0];
function lenOf(m){const i=clamp(CFG.len[m.id]!=null?CFG.len[m.id]:m.lenDef,0,m.lens.length-1);return m.lens[i];}
const obstacles=()=>G.rocks;   // nothing blocks anything here; kept because the shell asks for it
function buildWorld(fresh){    // builds the round plan: which minigame, and its seeded schedule of targets
  if(fresh||!seed)seed=1+Math.floor(rand()*2e9);
  const R=rnd(seed),m=curMode();
  G.items=[];G.rocks=[];G.zones=[];G.route=[];G.legLen=[];G.cum=[];G.total=0;G.t=0;G.len=lenOf(m).v;G.sched=null;
  m.plan(R);m.fill(R);
}
