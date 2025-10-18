// Lightbox with video loop/autoplay; close on ESC, backdrop click
const lb = document.getElementById('lightbox');
const frame = lb.querySelector('.lightbox__frame');
const closeBtn = lb.querySelector('.lightbox__close');
const slot = document.getElementById('lightboxMediaSlot');

// ADDED: refs for "See more" inside popup (if page provides them)
const lbMoreWrap = document.getElementById('lightboxMore');
const lbMoreLink = document.getElementById('lightboxSeeMore');

// track which tile opened the lightbox
let lastSourceThumb = null;

function openWithMedia(mediaEl, meta = {}){
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

  // ADDED: compute and show "See more" based on the source card's data-more
  lastSourceThumb = meta.sourceThumb || lastSourceThumb || null;
  if (lbMoreWrap && lbMoreLink){
    let moreHref = null;
    if (lastSourceThumb){
      const card = lastSourceThumb.closest('article.card');
      if (card && card.hasAttribute('data-more')){
        moreHref = card.getAttribute('data-more');
      }
    }
    if (moreHref){
      lbMoreLink.href = moreHref;
      lbMoreWrap.hidden = false;
    } else {
      lbMoreWrap.hidden = true;
    }
  }

  // precise placement after open (layout may still settle)
  requestAnimationFrame(() => {
    placeClose();
    setTimeout(placeClose, 50);
    setTimeout(placeClose, 250);
    setTimeout(placeClose, 500);
  });

  // watch the specific media for size changes (images/videos)
  if (window.ResizeObserver){
    try {
      // Disconnect previous observer if we had one
      if (openWithMedia._ro) openWithMedia._ro.disconnect();
      const ro = new ResizeObserver(placeClose);
      ro.observe(clone);
      openWithMedia._ro = ro;
    } catch {}
  }
}

function close(){
  lb.classList.remove('open');
  lb.setAttribute('aria-hidden', 'true');
  slot.innerHTML = '';
}

// bindings
document.querySelectorAll('.thumb[data-lightbox]').forEach(thumb=>{
  const media = thumb.querySelector('video, img') || thumb;
  const handleOpen = (e)=>{
    openWithMedia(media, { sourceThumb: thumb }); // ADDED meta
    e.stopPropagation(); e.preventDefault();
  };
  thumb.addEventListener('click', handleOpen);
  const btn = thumb.querySelector('.fs-btn'); if (btn){ btn.addEventListener('click', handleOpen); }
  media.addEventListener('dblclick', handleOpen);
});

closeBtn.addEventListener('click', close);
document.addEventListener('keydown', (e)=>{ if(e.key==='Escape') close(); });
lb.addEventListener('click', (e)=>{ if(!frame.contains(e.target)) close(); });

/* ===== Precise close-button placement (top-right of the MEDIA) ===== */

const PADDING = 8; // positive = inside corner; negative = float outside

function currentMedia(){
  // Prefer explicit class, otherwise first element in the slot
  return lb.querySelector('.lightbox__media') || slot.firstElementChild || null;
}

function placeClose(){
  if (!lb.classList.contains('open')) return;
  const m = currentMedia();
  if (!m) return;

  const r = m.getBoundingClientRect();
  const top  = Math.round(r.top + PADDING);
  const left = Math.round(r.right - closeBtn.offsetWidth - PADDING);

  closeBtn.style.top  = top + 'px';
  closeBtn.style.left = left + 'px';
}

// keep position correct on resize/rotate and when media loads
window.addEventListener('resize', placeClose);
slot.addEventListener('load', placeClose, true);
slot.addEventListener('loadedmetadata', placeClose, true);
