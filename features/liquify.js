(function(){
  const svg  = document.getElementById('heroSVG');
  if (!svg) return;

  // allow config to disable at runtime
  let enabled = true;
  document.addEventListener('liquify:disable', ()=>{ enabled = false; });
  document.addEventListener('liquify:enable',  ()=>{ enabled = true; });

  const nmEl = document.getElementById('nm');
  const offR = document.getElementById('offR');
  const offG = document.getElementById('offG');
  const offB = document.getElementById('offB');
  if (!nmEl || !offR || !offG || !offB) return;

  const vb = svg.viewBox.baseVal;
  const c = document.createElement('canvas');
  const ctx = c.getContext('2d');
  c.width = vb.width; c.height = vb.height;

  const MAX_IMPRINTS = 150, LIFE = 9000, BASE = 128, BASE_RADIUS = 110, STRETCH = 3.0, TWIRL = 1.8, POWER = 1.5;

  const imprints = []; let last = {x: vb.width/2, y: vb.height/2}; let vX = 0, vY = 0;
  let lastDirX = 1, lastDirY = 0;

  function toVB(e){
    const r = svg.getBoundingClientRect();
    return { x: (e.clientX - r.left) / r.width  * vb.width,
             y: (e.clientY - r.top)  / r.height * vb.height };
  }

  svg.addEventListener('mousemove', (e)=>{
    if (!enabled) return;
    const p = toVB(e); vX = p.x - last.x; vY = p.y - last.y; last = p;
    const vlen = Math.hypot(vX, vY);
    if (vlen > 0.001) { lastDirX = vX / vlen; lastDirY = vY / vlen; }
    imprints.unshift({x:p.x, y:p.y, vx:vX, vy:vY, t: performance.now()});
    if (imprints.length > MAX_IMPRINTS) imprints.pop();
  });

  const clamp = v => Math.max(0, Math.min(255, v));
  const mix = (a,b,t) => a*(1-t)+b*t;

  function drawNormalMap(){
    ctx.clearRect(0,0,c.width,c.height);
    ctx.fillStyle = 'rgb(128,128,0)'; ctx.fillRect(0,0,c.width,c.height);
    const now = performance.now();

    for (let i=imprints.length-1;i>=0;i--){
      const it = imprints[i], age = now - it.t;
      if (age > LIFE){ imprints.splice(i,1); continue; }
      const t = age / LIFE, ease = Math.pow(1 - t, 1.6), grow = 1 + 0.9*t;
      const vlen = Math.hypot(it.vx, it.vy) || 1, ux = it.vx / vlen, uy = it.vy / vlen;
      const disp = POWER * Math.min(1.2, vlen/14) * ease * 110;
      const cx = it.x, cy = it.y, rx = BASE_RADIUS * STRETCH * grow, ry = BASE_RADIUS * 0.85 * grow;

      ctx.save(); ctx.translate(cx,cy); ctx.rotate(Math.atan2(uy,ux)); ctx.scale(rx, ry);

      const pushX = BASE + (ux * disp * 0.6), pushY = BASE + (uy * disp * 0.6);
      const spinX = BASE + ((-uy) * disp * TWIRL * 0.6), spinY = BASE + (( ux) * disp * TWIRL * 0.6);

      const g = ctx.createRadialGradient(0,0,0, 0,0,1);
      g.addColorStop(0.00, `rgb(${clamp(pushX)},${clamp(pushY)},0)`);
      g.addColorStop(0.45, `rgb(${clamp(mix(pushX,spinX,0.5))},${clamp(mix(pushY,spinY,0.5))},0)`);
      g.addColorStop(0.85, `rgb(128,128,0)`);
      g.addColorStop(1.00, `rgb(128,128,0)`);

      ctx.beginPath(); ctx.arc(0,0,1,0,Math.PI*2); ctx.fillStyle = g; ctx.fill();
      ctx.restore();
    }

    const url = c.toDataURL('image/png');
    nmEl.setAttribute('href', url);
    nmEl.setAttributeNS('http://www.w3.org/1999/xlink','href', url);
  }

  let smoothAmt = 0, lastTime  = performance.now(), prevTarget = 0;
  const ATTACK_MS  = 700, RELEASE_MS = 500;

  function animate(){
    if (enabled) drawNormalMap();
    const active = Math.min(1, imprints.length / MAX_IMPRINTS), target = 4 * active;
    const now = performance.now(), dt  = now - lastTime; lastTime  = now;
    const rising = target > prevTarget, tauMs  = rising ? ATTACK_MS : RELEASE_MS;
    const alpha  = 1 - Math.exp(-dt / Math.max(1, tauMs));
    smoothAmt += (target - smoothAmt) * alpha; prevTarget = target;
    const amt = smoothAmt, dirX = lastDirX, dirY = lastDirY;
    offR.setAttribute('dx', (-amt * 1.30 * dirX).toFixed(2)); offR.setAttribute('dy', (-amt * 1.30 * dirY).toFixed(2));
    offG.setAttribute('dx', ( amt * 0.95 * dirX).toFixed(2)); offG.setAttribute('dy', ( amt * 0.95 * dirY).toFixed(2));
    offB.setAttribute('dx', ( amt * 1.45 * (-dirY)).toFixed(2)); offB.setAttribute('dy', ( amt * 1.45 * ( dirX)).toFixed(2));
    requestAnimationFrame(animate);
  }
  animate();
})();
