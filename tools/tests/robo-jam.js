// Game rules of Robo Jam: the six minigames, Boot Camp playlist, buzzer input, series points.
const h=require('./_harness')(process.argv[2]);const {ev,step,tap,key,assert,sim,startPlay}=h;
step(5);tap('Enter');
const setup=(mode,extra)=>{ev('toLobby()');step(3);ev('CFG.mode='+mode+';CFG.series=1;CFG.ai=1;slots[1]=null;slots[2]=null;'+(extra||'')+';buildWorld(true)');startPlay();};
const me='players.find(c=>c.human)';
const idx=id=>ev('MODES.findIndex(m=>m.id==="'+id+'")');
assert(ev('GAMES.length')===9&&ev('MODES.length')===12,'nine minigames (6 buzzer + 3 arena) plus Boot Camp, Buzzer Rush and Arena Bash');

// ---- buzzer input: fresh presses are counted once
ev('toLobby()');step(3);
key('Enter');key('Enter','keyup');key('ArrowLeft');key('ArrowLeft','keyup');ev('flushEdges()');
key('Enter');key('Enter','keyup');key('Enter');key('Enter','keyup');key('ArrowRight');key('ArrowRight','keyup');
let i1=ev('getInput("kb0")');assert(i1.ok===2&&i1.r===1&&i1.l===0,'getInput counts fresh presses: '+JSON.stringify(i1));
assert(ev('getInput("kb0").ok')===0,'presses are consumed by the read');
tap('Enter');ev('flushEdges()');
// pad: face buttons = four coloured buttons by position, any face/shoulder = big button
const pad=h.mkPad(0);h.setPads([pad]);step(2);ev('flushEdges()');
pad.buttons[2].pressed=true;step(2);let ip=ev('getInput("pad:Test Pad#0")');assert(ip.l===1&&ip.ok===1,'pad X (left face button) = left + big button');
pad.buttons[2].pressed=false;pad.buttons[14].pressed=true;step(2);ip=ev('getInput("pad:Test Pad#0")');assert(ip.l===1,'pad d-pad left = left');
h.setPads([]);

// ---- Bolt Bash
setup(idx('bolt'));
assert(ev('G.sched.length')>10&&ev('G.sched.every(e=>e.hole>=0&&e.hole<4)'),'Bolt Bash has a schedule');
ev('G.t=0');ev('G.sched.unshift({t:0,hole:1,kind:"bot",dur:5},{t:0,hole:2,kind:"gold",dur:5},{t:0,hole:3,kind:"bomb",dur:5});'+me+'.g.done={}');
ev('G.t=.1;'+me+'.score=5');
const press=(k)=>{key(k);key(k,'keyup');sim(.05);};
press('ArrowLeft');assert(ev(me+'.score')===6,'bonking a bot (left hole) scores 1');
press('ArrowRight');assert(ev(me+'.score')===9,'bonking a gold bot scores 3');
press('ArrowDown');assert(ev(me+'.score')===7,'bonking a spiky bot costs 2');
press('ArrowLeft');assert(ev(me+'.score')===6,'pressing an empty hole costs 1');
ev(me+'.lv=0');ev(me+'.score=5');press('ArrowLeft');assert(ev(me+'.score')===5,'Tiny level: no penalty');

// ---- Power Surge
setup(idx('surge'));ev(me+'.g.e=0');
for(let i=0;i<11;i++)press("Enter");
assert(ev(me+'.score')>=1,'mashing the big button fills a battery ('+ev(me+'.score')+')');
const before=ev(me+'.g.e');sim(1);assert(ev(me+'.g.e')<=before,'charge decays when you stop');

// ---- Rocket Dash
setup(idx('dash'));
const s0=ev(me+'.g.steps');press('ArrowLeft');press('ArrowRight');press('ArrowLeft');
assert(ev(me+'.g.steps')>=s0+2.9,'alternating buttons gives full strides ('+ev(me+'.g.steps')+')');
const s1=ev(me+'.g.steps');press('ArrowLeft');press('ArrowLeft');press('ArrowLeft');
assert(ev(me+'.g.steps')-s1<1.1,'hammering one button gives only a stumble');
ev(me+'.g.steps=G.v-1;'+me+'.g.last="r"');press('ArrowLeft');
assert(ev(me+'.finished')===true&&ev('standings()[0].human'),'crossing the line finishes and ranks first');
ev('players.filter(c=>!c.human).forEach(c=>{c.finished=false;c.g.steps=3})');
assert(ev('standings()[0]===players.find(c=>c.human)'),'finished robot ranks above unfinished ones');

// ---- Stamp Press
setup(idx('stamp'));
ev(me+'.g.ph=0.5;'+me+'.g.pos=.5;'+me+'.g.t=1;');sim(.02);
ev(me+'.g.ph=0.5;'+me+'.g.t=1;');   // marker dead centre
ev('(()=>{const g='+me+'.g;g.ph=1.0;g.state="run";g.t=1;})()');   // tri(1.0)=1 -> edge: a miss
press('Enter');assert(ev(me+'.g.results.length')===1&&ev(me+'.g.results[0]')===0,'stamping at the far end of the bar is a miss');
sim(1);ev('(()=>{const g='+me+'.g;g.state="run";g.t=1;g.ph=.5;})()');
ev('G.sched[1].sp=0.0001');press('Enter');
assert(ev(me+'.g.results[1]')===3,'stamping in the middle is PERFECT (3 points)');
assert(ev(me+'.score')===3,'score is the sum of stamp points');

// ---- Copy Circuit
setup(idx('copy'));
sim(4);assert(ev(me+'.g.phase')==='input','after the pattern is shown it is the player\'s turn');
const want=ev('G.sched.slice(0,2)'),keyOf={u:'ArrowUp',l:'ArrowLeft',r:'ArrowRight',d:'ArrowDown'};
press(keyOf[want[0]]);press(keyOf[want[1]]);
assert(ev(me+'.score')===2&&ev(me+'.g.n')===3,'copying the whole pattern scores its length and grows it');
sim(2);ev('(()=>{const g='+me+'.g;g.phase="input";g.inIdx=0;})()');
const wrong=['u','l','r','d'].find(d=>d!==ev('G.sched[0]'));press(keyOf[wrong]);
assert(ev(me+'.g.phase')==='bad'&&ev(me+'.score')===1,'a wrong button costs a point and replays the pattern');

// ---- Cargo Catch
setup(idx('catch'));
ev('G.sched.unshift({t:0,lane:2,kind:"bolt",fall:.2},{t:0,lane:0,kind:"gear",fall:.2},{t:0,lane:2,kind:"spark",fall:.2});'+me+'.g.done={};'+me+'.g.lane=2;'+me+'.g.pos=2;'+me+'.score=5;');
ev('G.t=.05');sim(.5);
assert(ev(me+'.score')===5+1-2,'caught the bolt (+1), missed the gear in lane 0, zapped by the spark in lane 2 (-2)');

// ---- shared-screen games: one pane for everybody, world step once per tick
const stand=(id)=>{setup(idx(id),'CFG.ai=2');};
const setPos=(i,x,y)=>ev('(()=>{const g=players['+i+'].g;g.x='+x+';g.y='+y+';g.vx=g.vy=0;})()');
stand('bump');
assert(ev('layoutPanes().length')===1&&ev('layoutPanes()[0].shared')===true&&ev('layoutPanes()[0].list.length')===3,'a shared game has ONE pane with every robot');
assert(ev('mapJobs(layoutPanes()).length')===0,'no per-pane standings bars on a shared screen');
setPos(0,800,450);setPos(1,1000,450);setPos(2,600,450);ev('players.forEach(c=>c.g.inv=0)');
ev('players.forEach(c=>{c.score=0;c.g.fall=0})');setPos(0,800+420,450);ev('players[0].g.hitBy=players[1];players[0].g.hitT=3');sim(.05);
assert(ev('players[0].g.fall')>0&&ev('players[1].score')===2,'bumper: falling off the platform gives the last robot that hit you +2');
sim(1.4);assert(ev('players[0].g.fall')<=0&&ev('Math.hypot(players[0].g.x-800,players[0].g.y-450)')<380,'a robot that fell respawns on the platform');
setPos(0,800,450);setPos(1,700,300);setPos(2,860,450);ev('players[0].g.cd=0;players[0].g.face=1;players[2].g.cd=9;players[0].g.stun=0;players[2].g.hitBy=null');
press('Enter');sim(.3);
assert(ev('players[2].g.x')>880||ev('players[2].g.stun')>0||ev('players[2].g.vx')>50,'a dash shoves the robot next to you');
assert(ev('(()=>{const a=players.map(c=>[c.g.x,c.g.y]);sim=1;return a.every(p=>isFinite(p[0])&&isFinite(p[1]))})()'),'positions stay finite');
stand('paint');
assert(ev('G.tiles.length')===144,'paint: 16 x 9 tiles');
setPos(0,150,150);ev('players[0].score=0;G.tiles.fill(-1)');sim(.1);
assert(ev('players[0].score')>=1&&ev('G.tiles.filter(t=>t===players[0].ci).length')===ev('players[0].score'),'driving over a tile paints it, score = tiles owned');
const ci1=ev('players[1].ci');setPos(1,150,150);ev('players[1].g.cd=0');sim(.1);
assert(ev('players[0].score')===0||ev('G.tiles[0]')===ci1||ev('players[1].score')>=1,'painting over a rival takes the tile');
ev('G.tiles.fill(-1);players.forEach(c=>c.score=0)');setPos(0,800,450);ev('players[0].g.cd=0');press('Enter');sim(.05);
assert(ev('players[0].score')>=6,'paint bomb covers a patch ('+ev('players[0].score')+')');
assert(ev('players[0].g.cd')>3,'the bomb recharges');
stand('rush');
setPos(0,400,300);ev('G.batts=[{x:400,y:300,v:3,ign:null,ignT:0}]');sim(.1);
assert(ev('players[0].g.carry.join()')==='3','rush: walking over a battery picks it up (gold = 3)');
const B=ev('players[0].g.base');setPos(0,B.x+130,B.y+130);sim(.1);
assert(ev('players[0].score')===3&&ev('players[0].g.carry.length')===0,'banking at your own base scores the carried value');
ev('players[1].g.carry=[1,1];players[0].g.cd=0');setPos(1,900,450);setPos(0,850,450);ev('players[0].g.face=1');
press('Enter');sim(.12);
assert(ev('players[1].g.carry.length')===0&&ev('G.batts.length')>=2,'dashing into a carrier makes them drop the batteries');
ev('G.batts=[];players[0].g.carry=[1,1,1];');setPos(0,400,300);ev('G.batts=[{x:400,y:300,v:1,ign:null,ignT:0}]');sim(.1);
assert(ev('players[0].g.carry.length')===3,'carry limit is 3');
// ---- AI robots play every arena game without freezing
for(const id of ['bump','paint','rush']){setup(idx(id),'CFG.ai=3');startPlay();sim(20);assert(ev('players.filter(c=>!c.human).every(c=>isFinite(c.g.x)&&isFinite(c.g.y))')&&ev('players.some(c=>c.score>0)'),id+': CPU robots move and score on their own');}
// ---- pools
setup(idx('arena'),'CFG.series=3;CFG.ai=1');startPlay();
{const ids=[ev('G.game.id')];for(let r=2;r<=3;r++){ev("state='done';finishRound();resAge=9;");tap('Enter');ids.push(ev('G.game.id'));}
 assert(new Set(ids).size===3&&ids.every(i=>['bump','paint','rush'].includes(i)),'Arena Bash plays the three arena games once each: '+ids.join());}
setup(idx('buzzer'),'CFG.series=5;CFG.ai=1');startPlay();
{const ids=[ev('G.game.id')];for(let r=2;r<=5;r++){ev("state='done';finishRound();resAge=9;");tap('Enter');ids.push(ev('G.game.id'));}
 assert(ids.every(i=>!['bump','paint','rush'].includes(i)),'Buzzer Rush never picks an arena game: '+ids.join());}

// ---- Boot Camp playlist: every game once per series, then repeat
ev('toLobby()');step(3);ev('CFG.mode=0;CFG.series=5;CFG.ai=1;slots[1]=null;slots[2]=null;');
startPlay();const seen=[ev('G.game.id')];
for(let r=2;r<=5;r++){ev("state='done';finishRound();resAge=9;");tap('Enter');seen.push(ev('G.game.id'));}
assert(new Set(seen).size===5,'Boot Camp plays 5 different games in a 5-round series: '+seen.join(','));
ev("state='done';finishRound();");
assert(ev('results.final')===true&&ev('results.board.length')===2,'last round: final board lists every robot');
// ---- series points for every robot
assert(ev('Object.values(series.pts).reduce((a,b)=>a+b,0)')===5*3,'each round hands out 2+1 points for 2 robots over 5 rounds');
// ---- all robots can be drawn in every pose
ev('toLobby()');step(3);ev('CFG.mode=1;CFG.series=1;CFG.ai=3;');startPlay();
ev('Object.keys(POSE_FRAMES).concat(["look"]).forEach(p=>{players.forEach(c=>{c.lookDir="l";drawRobot(c,100,100,90,p);procRobot(c,100,100,90,p);});})');
assert(true,'every pose draws for every robot');
console.log('done');
