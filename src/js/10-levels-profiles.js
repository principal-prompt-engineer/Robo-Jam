/* ---------- difficulty levels (skill 06 + 07) ---------- */
/* win = hit-window multiplier (bigger = easier), slow = target speed multiplier (smaller = easier), pen = penalty multiplier, aid = power per press */
const LEVELS=[
 {name:'Tiny',win:1.8,slow:.7,pen:0,aid:1.5,desc:'Big hit windows, slower targets, no penalties and extra power on every press. Made for the youngest robots.'},
 {name:'Easy',win:1.4,slow:.85,pen:.5,aid:1.25,desc:'Wider timing windows, slightly slower targets and half penalties.'},
 {name:'Normal',win:1,slow:1,pen:1,aid:1,desc:'No help. Every challenge runs at standard speed.'},
 {name:'Pro',win:.85,slow:1.12,pen:1,aid:1,desc:'Tighter windows and faster targets. For champion robots.'},
 {name:'Adaptive',win:1,slow:1,pen:1,aid:1,desc:'Help adjusts as you play: lots when you trail the leader, none when you lead, so the group stays close.'}];
const LV_TINY=0, LV_NORMAL=2, LV_ADAPTIVE=4, LV_SHOW=[3,2,4,1,0];   // LV_SHOW = results order: strongest class first
const ADAPT={FULL_GAP:300,RATE:1.5,MODE:'relative',SPAN_CAP:1200};   // FULL_GAP in progress units (about 1 s of top speed); MODE 'relative' | 'absolute'; SPAN_CAP stops one stuck player from diluting everyone else's help
const NOP={win:1,slow:1,pen:1,aid:1};
function prm(c){
  if(c.lv===LV_ADAPTIVE){   // always lerp(Normal, Tiny, t) so retuning those two rows retunes Adaptive
    const t=c.assist,N=LEVELS[LV_NORMAL],T=LEVELS[LV_TINY];
    return {win:lerp(N.win,T.win,t),slow:lerp(N.slow,T.slow,t),pen:lerp(N.pen,T.pen,t),aid:lerp(N.aid,T.aid,t)};
  }
  if(c.lv>=0)return LEVELS[c.lv];
  return NOP;
}
function lvLabel(c){return c.lv===LV_ADAPTIVE?'Adaptive - '+Math.round(c.assist*100)+'%':(c.lv>=0?LEVELS[c.lv].name:'CPU');}
/* One tick of Adaptive. `players` already carry c.prog (progress in distance-like units) taken from a snapshot
   before anyone moved. Group = human Adaptive players still playing; the lead may be anyone. */
function adaptiveStep(players,dt){
  const live=players.filter(c=>!c.out);          // eliminated players are neither the lead nor in the group
  let lead=-1e9;for(const c of live)lead=Math.max(lead,c.prog);
  const grp=live.filter(c=>c.human&&c.lv===LV_ADAPTIVE&&!c.finished);
  let span=ADAPT.FULL_GAP;
  if(ADAPT.MODE==='relative')for(const c of grp)span=Math.max(span,Math.min(ADAPT.SPAN_CAP,lead-c.prog));
  for(const c of grp){
    const target=clamp((lead-c.prog)/span,0,1);
    c.assist+=(target-c.assist)*Math.min(1,dt*ADAPT.RATE);
  }
  return lead;
}

/* ---------- profiles (saved names, skill 09) ---------- */
let profiles=lsGet(LS_PROF,{order:[],by:{}});
if(!profiles||!Array.isArray(profiles.order)||!profiles.by)profiles={order:[],by:{}};
function saveProfiles(){lsSet(LS_PROF,profiles);}
function blankProfile(){return {v:1,rounds:0,fin:0,pts:0,overall:0,wins:{},best:{}};}
function getProf(n){   // missing fields read as 0 so old saves keep working when levels or modes are added
  let p=profiles.by[n];if(!p)p=profiles.by[n]=blankProfile();
  p.wins=p.wins||{};for(const l of LEVELS)p.wins[l.name]=p.wins[l.name]||0;
  p.best=p.best||{};['rounds','fin','pts','overall'].forEach(k=>{p[k]=p[k]||0;});p.v=1;return p;
}
profiles.order.forEach(getProf);
function addName(n){
  n=String(n).trim().toUpperCase().slice(0,8);if(!n)return '';
  getProf(n);profiles.order=[n].concat(profiles.order.filter(x=>x!==n));saveProfiles();return n;
}
function deleteName(n){
  delete profiles.by[n];profiles.order=profiles.order.filter(x=>x!==n);saveProfiles();
  for(const p of slots)if(p&&p.name===n){p.name='';p.nameSel=0;}
}
function deleteAllNames(){profiles={order:[],by:{}};saveProfiles();for(const p of slots)if(p){p.name='';p.nameSel=0;}}
const nameOptions=()=>['Guest'].concat(profiles.order,['+ New']);
