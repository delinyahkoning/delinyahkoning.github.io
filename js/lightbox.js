// Lightbox with video loop/autoplay; close on ESC, backdrop click
const lb = document.getElementById('lightbox');
const frame = lb.querySelector('.lightbox__frame');
const closeBtn = lb.querySelector('.lightbox__close');
const slot = document.getElementById('lightboxMediaSlot');

function openWithMedia(mediaEl){
  slot.innerHTML = '';
  const isVideo = mediaEl.tagName.toLowerCase() === 'video';
  const clone = mediaEl.cloneNode(true);
  clone.classList.add('lightbox__media');

  if (isVideo){
    clone.loop = true; clone.controls = true; clone.autoplay = true; clone.setAttribute('playsinline','');
    const startAndPlay = () => {
      try { clone.currentTime = 0; } catch {}
      const p = clone.play(); if (p && typeof p.then === 'function') p.catch(()=>{});
    };
    clone.addEventListener('loadedmetadata', startAndPlay, { once:true });
    requestAnimationFrame(startAndPlay);
  }

  slot.appendChild(clone);
  lb.classList.add('open');
  lb.setAttribute('aria-hidden', 'false');
  closeBtn.focus();
}
function close(){
  lb.classList.remove('open');
  lb.setAttribute('aria-hidden', 'true');
  slot.innerHTML = '';
}

// bindings
document.querySelectorAll('.thumb[data-lightbox]').forEach(thumb=>{
  const media = thumb.querySelector('video, img') || thumb;
  const handleOpen = (e)=>{ openWithMedia(media); e.stopPropagation(); e.preventDefault(); };
  thumb.addEventListener('click', handleOpen);
  const btn = thumb.querySelector('.fs-btn'); if (btn){ btn.addEventListener('click', handleOpen); }
  media.addEventListener('dblclick', handleOpen);
});

closeBtn.addEventListener('click', close);
document.addEventListener('keydown', (e)=>{ if(e.key==='Escape') close(); });
lb.addEventListener('click', (e)=>{ if(!frame.contains(e.target)) close(); });
