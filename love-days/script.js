/* =====================================================
   Love Days Script (Dance Enhanced)
   功能：时间累计 | 星空 | 丝带 | 粒子 (❤, </>, 舞, 扇, 纱) | 音乐控制 | 舞感切换
   自定义入口：<html data-start="YYYY-MM-DD" data-dance="on|off">
   ===================================================== */
(function(){
  const root = document.documentElement;
  const startAttr = root.getAttribute('data-start');
  const START_DATE = startAttr || '2025-10-07';
  const startTime = new Date(`${START_DATE}T11:22:00+08:00`).getTime();

  const elDays = document.getElementById('days');
  const elHours = document.getElementById('hours');
  const elMinutes = document.getElementById('minutes');
  const elSeconds = document.getElementById('seconds');
  const startDateEl = document.getElementById('startDate');
  const btnMusic = document.getElementById('musicToggle');
  const btnEffects = document.getElementById('effectsToggle');
  const btnDance = document.getElementById('danceToggle');
  const audio = document.getElementById('bgm');

  if(startDateEl) startDateEl.textContent = START_DATE;

  /* ----------------- 时间更新 ----------------- */
  function updateTime(){
    const now = Date.now();
    let diff = now - startTime;
    if(diff < 0) diff = 0;
    const days = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000)/3600000);
    const minutes = Math.floor((diff % 3600000)/60000);
    const seconds = Math.floor((diff % 60000)/1000);
    elDays.textContent = days + 1;
    elHours.textContent = hours.toString().padStart(2,'0');
    elMinutes.textContent = minutes.toString().padStart(2,'0');
    elSeconds.textContent = seconds.toString().padStart(2,'0');
  }
  let lastSec = -1, timeRAF;
  function timeTick(){
    const s = Math.floor(Date.now()/1000);
    if(s !== lastSec){ updateTime(); lastSec = s; }
    timeRAF = requestAnimationFrame(timeTick);
  }
  timeTick();

  /* ----------------- 音乐自动播放 ----------------- */
  function tryAutoplay(){
    if(!audio) return;
    audio.volume = 0.85;
    const p = audio.play();
    if(p){ p.then(()=>{ btnMusic && btnMusic.setAttribute('aria-pressed','true'); }).catch(()=>{}); }
  }
  document.addEventListener('DOMContentLoaded', ()=>{
    setTimeout(tryAutoplay, 400);
    setTimeout(tryAutoplay, 1600);
  });

  /* ----------------- 控制按钮 ----------------- */
  if(btnMusic){
    btnMusic.addEventListener('click', ()=>{
      if(audio.paused){ audio.play(); btnMusic.setAttribute('aria-pressed','true'); btnMusic.textContent='音乐: 开'; }
      else { audio.pause(); btnMusic.setAttribute('aria-pressed','false'); btnMusic.textContent='音乐: 关'; }
    });
  }

  let effectsEnabled = true;
  if(btnEffects){
    btnEffects.setAttribute('aria-pressed','true');
    btnEffects.addEventListener('click', ()=>{
      effectsEnabled = !effectsEnabled;
      btnEffects.setAttribute('aria-pressed', effectsEnabled ? 'true':'false');
      btnEffects.textContent = '特效: ' + (effectsEnabled ? '开':'关');
      toggleEffects(effectsEnabled);
    });
  }

  let danceEnabled = root.getAttribute('data-dance') !== 'off';
  if(btnDance){
    btnDance.addEventListener('click', ()=>{
      danceEnabled = !danceEnabled;
      root.setAttribute('data-dance', danceEnabled ? 'on':'off');
      btnDance.setAttribute('aria-pressed', danceEnabled ? 'true':'false');
      btnDance.textContent = '舞感: ' + (danceEnabled ? '开':'关');
    });
  }

  /* ----------------- 星空背景 ----------------- */
  const starCanvas = document.getElementById('starfield');
  const starCtx = starCanvas.getContext('2d');
  const stars = [];
  const STAR_COUNT_BASE = 140;

  /* ----------------- 丝带 Canvas ----------------- */
  const ribbonCanvas = document.getElementById('ribbons');
  const ribbonCtx = ribbonCanvas.getContext('2d');
  const ribbons = [];
  const RIBBON_COUNT = 5;

  /* ----------------- 前景粒子 ----------------- */
  const particleCanvas = document.getElementById('particles');
  const pCtx = particleCanvas.getContext('2d');
  const particles = [];
  const PARTICLE_BASE = 42; // 略增多一点
  const symbols = [
    {t:'❤', c: getCSS('--particle-heart-color'), size:28},
    {t:'</>', c: getCSS('--particle-code-color'), size:24},
    {t:'舞', c: getCSS('--particle-dance-color'), size:30},
    {t:'扇', c:'#ffb677', size:26},
    {t:'纱', c:'#ff85c9', size:26}
  ];

  function getCSS(v){ return getComputedStyle(document.documentElement).getPropertyValue(v).trim(); }

  function resize(){
    starCanvas.width = ribbonCanvas.width = particleCanvas.width = window.innerWidth;
    starCanvas.height = ribbonCanvas.height = particleCanvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resize, {passive:true});
  resize();

  /* 初始化星星 */
  function initStars(){
    stars.length = 0;
    const count = Math.min(STAR_COUNT_BASE, Math.floor(window.innerWidth/8));
    for(let i=0;i<count;i++){
      stars.push({ x:Math.random()*starCanvas.width, y:Math.random()*starCanvas.height, r:Math.random()*1.2+0.2, a:Math.random(), s:Math.random()*0.4+0.05, tw:Math.random()*0.03+0.005 });
    }
  }
  initStars();

  function renderStars(){
    starCtx.clearRect(0,0,starCanvas.width, starCanvas.height);
    starCtx.save(); starCtx.fillStyle='#fff';
    for(const st of stars){
      st.a += st.tw;
      const alpha = 0.25 + Math.sin(st.a)*0.5 + 0.25;
      starCtx.globalAlpha = alpha;
      starCtx.beginPath(); starCtx.arc(st.x, st.y, st.r, 0, Math.PI*2); starCtx.fill();
      st.y += st.s * 0.2;
      if(st.y > starCanvas.height + 10){ st.y = -10; st.x = Math.random()*starCanvas.width; }
    }
    starCtx.restore();
  }

  /* 丝带：用多段贝塞尔插值 + 噪声偏移 */
  function initRibbons(){
    ribbons.length = 0;
    for(let i=0;i<RIBBON_COUNT;i++){
      ribbons.push({
        hue: Math.random()*360,
        points: new Array(6).fill(0).map(()=>({
          x: Math.random()*ribbonCanvas.width,
          y: Math.random()*ribbonCanvas.height,
          vx: (Math.random()*0.6-0.3),
          vy: (Math.random()*0.6-0.3)
        })),
        life: 0,
        speed: Math.random()*0.4 + 0.15,
        wobble: Math.random()*0.8 + 0.4
      });
    }
  }
  initRibbons();

  function renderRibbons(t){
    ribbonCtx.clearRect(0,0,ribbonCanvas.width, ribbonCanvas.height);
    if(!danceEnabled){ return; }
    for(const r of ribbons){
      r.life += r.speed;
      ribbonCtx.save();
      const grad = ribbonCtx.createLinearGradient(0,0,0,ribbonCanvas.height);
      grad.addColorStop(0, `hsla(${(r.hue + r.life*2)%360},80%,70%,0.0)`);
      grad.addColorStop(.25, `hsla(${(r.hue + r.life*4)%360},85%,65%,0.55)`);
      grad.addColorStop(.75, `hsla(${(r.hue + r.life*6)%360},90%,60%,0.45)`);
      grad.addColorStop(1, `hsla(${(r.hue + r.life*8)%360},95%,55%,0.0)`);
      ribbonCtx.lineWidth = 18;
      ribbonCtx.lineCap = 'round';
      ribbonCtx.lineJoin = 'round';
      ribbonCtx.strokeStyle = grad;
      ribbonCtx.beginPath();
      const pts = r.points;
      for(let i=0;i<pts.length;i++){
        const p = pts[i];
        p.x += p.vx + Math.sin((r.life + i*15)*0.01)*r.wobble;
        p.y += p.vy + Math.cos((r.life + i*25)*0.01)*r.wobble;
        // wrap
        if(p.x < -60) p.x = ribbonCanvas.width + 60;
        if(p.x > ribbonCanvas.width + 60) p.x = -60;
        if(p.y < -60) p.y = ribbonCanvas.height + 60;
        if(p.y > ribbonCanvas.height + 60) p.y = -60;
      }
      ribbonCtx.moveTo(pts[0].x, pts[0].y);
      for(let i=1;i<pts.length-2;i++){
        const c = (pts[i].x + pts[i+1].x)/2;
        const d = (pts[i].y + pts[i+1].y)/2;
        ribbonCtx.quadraticCurveTo(pts[i].x, pts[i].y, c, d);
      }
      const penult = pts[pts.length-2];
      const last = pts[pts.length-1];
      ribbonCtx.quadraticCurveTo(penult.x, penult.y, last.x, last.y);
      ribbonCtx.stroke();
      ribbonCtx.restore();
    }
  }

  /* 粒子 */
  function initParticles(){
    particles.length = 0;
    const density = Math.min(PARTICLE_BASE, Math.floor(window.innerWidth/28));
    for(let i=0;i<density;i++){ particles.push(spawnParticle()); }
  }
  function spawnParticle(){
    const sym = symbols[Math.floor(Math.random()*symbols.length)];
    return { sym, x:Math.random()*particleCanvas.width, y:Math.random()*particleCanvas.height, vx:(Math.random()*0.6-0.3), vy:(Math.random()*0.6-0.3), drift:Math.random()*0.2+0.05, rot:Math.random()*Math.PI*2, vr:(Math.random()*0.004-0.002), life:0, maxLife: 800+Math.random()*800, scale:0.6+Math.random()*0.9 };
  }
  initParticles();

  function renderParticles(){
    pCtx.clearRect(0,0,particleCanvas.width, particleCanvas.height);
    for(const p of particles){
      p.life++;
      if(p.life > p.maxLife){ Object.assign(p, spawnParticle()); continue; }
      p.x += p.vx + Math.sin(p.life*0.01)*p.drift;
      p.y += p.vy + Math.cos(p.life*0.012)*p.drift;
      p.rot += p.vr;
      // wrap
      if(p.x < -50) p.x = particleCanvas.width + 50;
      if(p.x > particleCanvas.width + 50) p.x = -50;
      if(p.y < -50) p.y = particleCanvas.height + 50;
      if(p.y > particleCanvas.height + 50) p.y = -50;

      pCtx.save();
      pCtx.translate(p.x, p.y); pCtx.rotate(p.rot);
      const fadeIn = Math.min(1, p.life/60);
      const fadeOut = Math.min(1, (p.maxLife - p.life)/90);
      const alpha = Math.min(fadeIn, fadeOut) * 0.9;
      pCtx.globalAlpha = alpha;
      pCtx.fillStyle = p.sym.c;
      pCtx.font = `600 ${p.sym.size * p.scale}px 'Segoe UI', system-ui, sans-serif`;
      pCtx.textAlign = 'center'; pCtx.textBaseline = 'middle';
      pCtx.fillText(p.sym.t, 0, 0);
      pCtx.restore();
    }
  }

  /* 渲染循环 */
  let lastRender = 0;
  function renderLoop(t){
    if(!effectsEnabled){ requestAnimationFrame(renderLoop); return; }
    if(t - lastRender > 33){ // ~30fps
      renderStars();
      renderRibbons(t);
      renderParticles();
      lastRender = t;
    }
    requestAnimationFrame(renderLoop);
  }
  requestAnimationFrame(renderLoop);

  function toggleEffects(on){
    if(!on){
      starCtx.clearRect(0,0,starCanvas.width,starCanvas.height);
      ribbonCtx.clearRect(0,0,ribbonCanvas.width,ribbonCanvas.height);
      pCtx.clearRect(0,0,particleCanvas.width,particleCanvas.height);
    }
  }

  /* 可见性节能 */
  document.addEventListener('visibilitychange', ()=>{
    if(document.hidden){ cancelAnimationFrame(timeRAF); }
    else { timeRAF = requestAnimationFrame(timeTick); }
  });

  /* 动态偏好 */
  if(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches){
    effectsEnabled = false;
    btnEffects && (btnEffects.textContent='特效: 关', btnEffects.setAttribute('aria-pressed','false'));
  }

  // 对外窗口
  window._LoveDays = {
    setStart(dateStr){
      root.setAttribute('data-start', dateStr);
      const ms = new Date(`${dateStr}T00:00:00+08:00`).getTime();
      if(!isNaN(ms)) startDateEl.textContent = dateStr;
    },
    toggleDance(flag){ root.setAttribute('data-dance', flag? 'on':'off'); },
    refreshParticles: initParticles,
    refreshStars: initStars,
    refreshRibbons: initRibbons
  };
})();
