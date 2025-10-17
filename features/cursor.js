(function(){
  const body = document.body;
  const dotCursor   = document.querySelector('.cursor--dot');
  const solarCursor = document.querySelector('.cursor--solar');
  const switchEl    = document.getElementById('cursorSwitch');

  function apply(mode){
    body.classList.remove('cursor-hide','cursor-mode-dot','cursor-mode-solar');
    if(mode === 'dot'){
      body.classList.add('cursor-hide','cursor-mode-dot');
      if (switchEl){ switchEl.dataset.state='dot'; switchEl.setAttribute('aria-checked','true'); switchEl.title='Cursor: Simple'; }
    }else if(mode === 'solar'){
      body.classList.add('cursor-hide','cursor-mode-solar');
      if (switchEl){ switchEl.dataset.state='solar'; switchEl.setAttribute('aria-checked','true'); switchEl.title='Cursor: Solar'; }
    }else{
      if (switchEl){ switchEl.dataset.state='native'; switchEl.setAttribute('aria-checked','false'); switchEl.title='Cursor: Native'; }
    }
    localStorage.setItem('cursorMode', mode);
  }

  // follow
  function handleMove(e){
    const x = e.clientX + 'px', y = e.clientY + 'px';
    if (dotCursor){ dotCursor.style.left = x; dotCursor.style.top = y; }
    if (solarCursor){ solarCursor.style.left = x; solarCursor.style.top = y; }
  }
  document.addEventListener('mousemove', handleMove);

  // hover/press affordances
  function onEnter(){ dotCursor?.classList.add('cursor--hover'); solarCursor?.classList.add('cursor--hover'); }
  function onLeave(){ dotCursor?.classList.remove('cursor--hover'); solarCursor?.classList.remove('cursor--hover'); }
  document.querySelectorAll('a,button,[data-lightbox],.tab,.tri-switch').forEach(el=>{
    el.addEventListener('mouseenter', onEnter); el.addEventListener('mouseleave', onLeave);
  });
  document.addEventListener('mousedown', ()=>{ dotCursor?.classList.add('cursor--down'); solarCursor?.classList.add('cursor--down'); });
  document.addEventListener('mouseup',   ()=>{ dotCursor?.classList.remove('cursor--down'); solarCursor?.classList.remove('cursor--down'); });

  // switch cycles
  if (switchEl){
    switchEl.addEventListener('click', ()=>{
      const current = localStorage.getItem('cursorMode') || 'dot';
      const MODES = ['dot','solar','native'];
      const next = MODES[(MODES.indexOf(current)+1)%MODES.length];
      apply(next);
    });
    switchEl.addEventListener('keydown', (e)=>{
      const current = localStorage.getItem('cursorMode') || 'dot';
      const MODES = ['dot','solar','native']; const idx = MODES.indexOf(current);
      if(e.key === 'ArrowRight'){ e.preventDefault(); apply(MODES[(idx+1)%MODES.length]); }
      else if(e.key === 'ArrowLeft'){ e.preventDefault(); apply(MODES[(idx+MODES.length-1)%MODES.length]); }
      else if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); apply(MODES[(idx+1)%MODES.length]); }
    });
  }

  // init (allow config/site.js to override default before this fires)
  function init(){ apply(localStorage.getItem('cursorMode') || 'dot'); }
  init();
  document.addEventListener('cursor:apply-default', init);
})();
