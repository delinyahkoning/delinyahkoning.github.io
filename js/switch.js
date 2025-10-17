// Tri-position cursor switch
const MODES = (window.APP?.cursorModes) || ['dot','solar','native'];
const DEFAULT = (window.APP?.defaultCursorMode) || 'dot';

const body = document.body;
const switchEl = document.getElementById('cursorSwitch');

function apply(mode){
  body.classList.remove('cursor-hide','cursor-mode-dot','cursor-mode-solar');

  if(mode === 'dot'){
    body.classList.add('cursor-hide','cursor-mode-dot');
    switchEl.dataset.state = 'dot';
    switchEl.setAttribute('aria-checked','true');
    switchEl.title = 'Cursor: Simple';
  }else if(mode === 'solar'){
    body.classList.add('cursor-hide','cursor-mode-solar');
    switchEl.dataset.state = 'solar';
    switchEl.setAttribute('aria-checked','true');
    switchEl.title = 'Cursor: Solar';
  }else{
    switchEl.dataset.state = 'native';
    switchEl.setAttribute('aria-checked','false');
    switchEl.title = 'Cursor: Native';
  }
  localStorage.setItem('cursorMode', mode);
}

// init
const saved = localStorage.getItem('cursorMode') || DEFAULT;
apply(saved);

// click cycles
switchEl.addEventListener('click', ()=>{
  const current = localStorage.getItem('cursorMode') || DEFAULT;
  const idx = MODES.indexOf(current);
  const next = MODES[(idx+1)%MODES.length];
  apply(next);
});

// keyboard ← →
switchEl.addEventListener('keydown', (e)=>{
  const current = localStorage.getItem('cursorMode') || DEFAULT;
  const idx = MODES.indexOf(current);
  if(e.key === 'ArrowRight'){ e.preventDefault(); apply(MODES[(idx+1)%MODES.length]); }
  else if(e.key === 'ArrowLeft'){ e.preventDefault(); apply(MODES[(idx+MODES.length-1)%MODES.length]); }
  else if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); apply(MODES[(idx+1)%MODES.length]); }
});
