/* =====================================================================
   MY GAME: started from the game-template shell (skills 01-10).
   The game is the placeholder in 30-modes.js. Everything else is the reusable shell:
     CFG        saved settings (game, length, screen layout, map type/scope, CPU count, sound, HUD size)
     THEME      palette + fonts (the look and feel, see skill 01)
     LEVELS     per-player difficulty table incl. Adaptive (skill 07)
     MODES      game-mode plug-ins: the ONLY place game rules live (skill 08)
     devices    keyboards (4 schemes), gamepads, touch -> nav events {dev,act}
     slots[8]   lobby players (fixed slots; slot index = colour)
     players[]     players in a round (humans carry dev/slot/lv, CPUs have lv = -1)
     getInput() THE input seam: NO_INPUT-shaped object {mx,my} for a device id
     SETTINGS   live (in-game) settings: one definition feeds Settings > Display AND the pause-menu settings
   ===================================================================== */

// Maintenance: do not edit these two lines by hand. tools/build.js (or build.ps1) writes the real build time
// into the built file; here they stay as the 'unknown' placeholder.
const BUILD_STAMP='unknown'; // BUILD_STAMP
const BUILD_VERSION=1; // BUILD_VERSION
function buildLabel(){return BUILD_STAMP==='unknown'?'Build unknown (v'+BUILD_VERSION+')':'Build '+BUILD_STAMP;}

const APP_ID='roboJam', APP_TITLE='ROBO JAM', APP_TAGLINE='Four robots. Six challenges. One Robot of the Month!';
const cv=document.getElementById('c'), ctx=cv.getContext('2d');
let VW=0,VH=0,DPR=1;
function resize(){DPR=Math.min(devicePixelRatio||1,2);VW=innerWidth;VH=innerHeight;cv.width=VW*DPR;cv.height=VH*DPR;}
addEventListener('resize',resize);resize();
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
/* seeded random: ALL gameplay randomness goes through rand() so a round can be replayed (add ?seed=123 to the URL, or call setSeed in tests) */
let _rs=1;
function setSeed(n){_rs=(Math.floor(Math.abs(n))%2147483646)+1;}
function rand(){_rs=(_rs*16807)%2147483647;return (_rs-1)/2147483646;}
setSeed((typeof location!=='undefined'&&/[?&]seed=(\d+)/.exec(location.search||''))?+/[?&]seed=(\d+)/.exec(location.search)[1]:Date.now());
const lerp=(a,b,t)=>a+(b-a)*t;
const IS_TOUCH='ontouchstart' in window;
const MAX_SLOTS=4, MAX_PLAYERS=4;        // four robots like the original; CPU players fill what is left
const COLORS=['#e63946','#2a9df4','#ffd23f','#3ddc84','#ff8c42','#b862e8','#f2f2f2','#ff5fa2'];
const COLOR_NAMES=['Red','Blue','Yellow','Green','Orange','Purple','White','Pink'];
const SHAPE_NAMES=['circle','square','triangle','diamond','star','hexagon','plus','pentagon'];   // one shape per player colour (drawn by shapePath)
const IDENTS=['both','shape','num','none'], IDENT_NAMES={both:'Shape + number',shape:'Shape only',num:'Number only',none:'None'};
const GRACE_START=2.5, FIRST_FIN_TIMEOUT=6;
/* one player's input, buzzer style: mx,my = held direction; ok,l,r,u,d = FRESH presses since the last read (the big red button and the four coloured buttons) */
const NO_INPUT={mx:0,my:0,ok:0,l:0,r:0,u:0,d:0};
/* the look: dark warm backdrop, translucent black overlays, yellow titles, grey labels, white values, green = go */
const THEME={bg:'#0a1022',title:'#ffd23f',text:'#fff',label:'#aaa',dim:'#9aa7b8',hint:'#999',info:'#cfd8e3',link:'#cfe8ff',go:'#3ddc84',bad:'#ff6b6b',help:'#8fe3ff',
  floor:['#1a2748','#16213f'],frame:'#2d3d6b'};

/* ---------- storage ---------- */
const LS_PROF=APP_ID+'.profiles', LS_CFG=APP_ID+'.cfg';
function lsGet(k,d){try{const v=localStorage.getItem(k);return v?JSON.parse(v):d;}catch(e){return d;}}
function lsSet(k,v){try{localStorage.setItem(k,JSON.stringify(v));}catch(e){}}

/* ---------- configuration ---------- */
const SCREENS=['vertical','horizontal','grid'], MAPS=['off','vertical','horizontal'], SCOPES=['pane','shared'];
const MAP_POS=['auto','top-left','top','top-right','left','center','right','bottom-left','bottom','bottom-right'];
const MAP_POS_NAMES={auto:'Automatic','top-left':'Top left',top:'Top',  'top-right':'Top right',left:'Left',center:'Centre',right:'Right','bottom-left':'Bottom left',bottom:'Bottom','bottom-right':'Bottom right'};
const SERIES=[1,3,5], TOUCH_MODES=['buttons','stick'];
const SCREEN_NAMES={vertical:'Side by side (one column per robot)',horizontal:'Stacked (one row per robot)',grid:'Grid (2 x 2)'};
const MAP_NAMES={off:'No standings bar',vertical:'Vertical standings bar',horizontal:'Horizontal standings bar'};
const SCOPE_NAMES={pane:'One per player pane',shared:'One shared map'};
const CFG=Object.assign({mode:0,len:{},opt:{},series:5,ai:3,screen:'vertical',map:'off',mapScope:'pane',mapPos:'auto',mapPosPane:'auto',ident:'both',names:true,touchMode:'buttons',keys:{},debug:false,padLayout:'auto',sound:true,hud:1},lsGet(LS_CFG,{}));
if(SCREENS.indexOf(CFG.screen)<0)CFG.screen='vertical';
if(MAPS.indexOf(CFG.map)<0)CFG.map='off';
if(SCOPES.indexOf(CFG.mapScope)<0)CFG.mapScope='pane';
if(['auto','xbox','nintendo'].indexOf(CFG.padLayout)<0)CFG.padLayout='auto';
if(!CFG.len||typeof CFG.len!=='object')CFG.len={};
if(!CFG.opt||typeof CFG.opt!=='object')CFG.opt={};
if(!CFG.keys||typeof CFG.keys!=='object')CFG.keys={};
if(MAP_POS.indexOf(CFG.mapPos)<0)CFG.mapPos='auto';
if(MAP_POS.indexOf(CFG.mapPosPane)<0)CFG.mapPosPane='auto';
if(SERIES.indexOf(CFG.series)<0)CFG.series=1;
if(TOUCH_MODES.indexOf(CFG.touchMode)<0)CFG.touchMode='buttons';
if(IDENTS.indexOf(CFG.ident)<0)CFG.ident='both';
CFG.names=CFG.names!==false;CFG.debug=!!CFG.debug;
function saveCfg(){lsSet(LS_CFG,CFG);}
const isMuted=()=>!CFG.sound;
