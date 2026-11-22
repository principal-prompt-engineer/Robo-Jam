/* ---------- main loop and start-up (keep start-up calls here, last) ---------- */
function frame(ts){
  const dt0=Math.min(.1,(ts-last)/1000||0);last=ts;animClock+=dt0;
  pollPads();processNav();
  if(set.confirmT>0){set.confirmT-=dt0;if(set.confirmT<=0)set.confirm=null;}
  if(state==='done')resAge+=dt0;
  if(state==='lobby')lobbyTick(dt0);
  else if(state==='count'||state==='play'||state==='done'){
    acc+=dt0;let n=0;
    while(acc>=1/60&&n<5){update(1/60);acc-=1/60;n++;if(state==='paused'||state==='lobby')break;}
    if(n===5)acc=0;
  }
  drawFrameWorld();
  if(state==='lobby'){if(set.open)drawSettings();else drawLobby();}
  else if(state==='paused')drawPause();
  else if(state==='done')drawResults();
  else hits.length=0;
  requestAnimationFrame(frame);
}
buildWorld(true);
loadRobotSheet();
if(IS_TOUCH)joinDevice('touch');
requestAnimationFrame(frame);
