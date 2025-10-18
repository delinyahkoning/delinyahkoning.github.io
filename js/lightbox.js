// Lightbox with video loop/autoplay; close on ESC, backdrop click
const lb    = document.getElementById('lightbox');
const frame = lb.querySelector('.lightbox__frame');
const closeBtn = lb.querySelector('.lightbox__close');
const slot  = document.getElementById('lightboxMediaSlot');

// Refs for "See more" inside popup (if page provides them)
const lbMoreWrap = document.getElementById('lightboxMore');
const lbMoreLink = document.getElementById('lightboxSeeMore');

// track which tile opened the lightbox
let lastSourceThumb = null;

/* =================== Open / Close =================== */
function openWithMedia(mediaEl, meta = {}){
  slot.innerHTML = '';
  const isVideo = mediaEl.tagName.toLowerCase() === 'video';
  const clone = mediaEl.cloneNode(true);
  clone.classList.add('lightbox__media');

  /* === Minimal addition: clear fixed attributes so CSS can size naturally === */
  try {
    if (clone.removeAttribute) {
      clone.removeAttribute('width');
      clone.removeAttribute('height');
    }
    // Do NOT force inline styles; let CSS (lightbox.css) control sizing entirely.
  } catch {}

  if (isVideo){
    clone.loop = true;
    clone.controls = true;
    clone.autoplay = true;
    clone.setAttribute('playsinline','');
    const startAndPlay = () => {
      try { clone.currentTime = 0; } catch {}
      const p = clone.play();
      if (p && typeof p.then === 'function') p.catch(()=>{});
    };
    clone.addEventListener('loadedmetadata', startAndPlay, { once:true });
    requestAnimationFrame(startAndPlay);
  }

  slot.appendChild(clone);
  lb.classList.add('open');
  lb.setAttribute('aria-hidden', 'false');
  closeBtn.focus();

  // Show "See more" in popup if source card provides data-more
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
    placeMore();
    setTimeout(() => { placeClose(); placeMore(); }, 50);
    setTimeout(() => { placeClose(); placeMore(); }, 250);
    setTimeout(() => { placeClose(); placeMore(); }, 500);
  });

  // watch the specific media for size changes (images/videos)
  if (window.ResizeObserver){
    try {
      if (openWithMedia._ro) openWithMedia._ro.disconnect();
      const ro = new ResizeObserver(() => { placeClose(); placeMore(); });
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

/* ============ Bindings (open, allow links inside .thumb) ============ */
function bindThumb(thumb){
  const media = thumb.querySelector('video, img') || thumb;
  const card  = thumb.closest('article.card');

  const handleOpen = (e)=>{
    // Allow anchor clicks inside the thumb to navigate normally
    const anchor = e.target.closest('a[href]');
    if (anchor && thumb.contains(anchor)) return;

    const on3DOverview = location.pathname.replace(/\/+$/,'') === '/tabs/3d';
    const hasMore = !!(card && card.hasAttribute('data-more'));
    const isFSBtn = e.target.closest('.fs-btn');

    // On /tabs/3d/ page: clicking the card (not the FS button) goes directly to project
    if (on3DOverview && hasMore && !isFSBtn){
      const href = card.getAttribute('data-more');
      if (href) { location.href = href; }
      e.stopPropagation();
      e.preventDefault();
      return;
    }

    // Default behavior: open the popup
    openWithMedia(media, { sourceThumb: thumb });
    e.stopPropagation();
    e.preventDefault();
  };

  // open by clicking blank space in .thumb
  thumb.addEventListener('click', handleOpen);

  // explicit FS button opens popup always
  const btn = thumb.querySelector('.fs-btn');
  if (btn){
    btn.addEventListener('click', (e)=>{
      openWithMedia(media, { sourceThumb: thumb });
      e.stopPropagation();
      e.preventDefault();
    });
  }

  // double-click media opens too
  media.addEventListener('dblclick', (e)=>{
    openWithMedia(media, { sourceThumb: thumb });
    e.stopPropagation();
    e.preventDefault();
  });
}

// bind all current thumbs
document.querySelectorAll('.thumb[data-lightbox]').forEach(bindThumb);

closeBtn.addEventListener('click', close);
document.addEventListener('keydown', (e)=>{ if(e.key==='Escape') close(); });
lb.addEventListener('click', (e)=>{ if(!frame.contains(e.target)) close(); });

/* ===== Precise placements (viewport coords -> fixed elements) ===== */
const PADDING = 8; // positive = inside corner; negative = float outside

function currentMedia(){
  return lb.querySelector('.lightbox__media') || slot.firstElementChild || null;
}

function placeClose(){
  if (!lb.classList.contains('open')) return;
  const m = currentMedia();
  if (!m) return;

  const r = m.getBoundingClientRect();
  const top  = Math.round(r.top + PADDING);
  const left = Math.round(r.right - closeBtn.offsetWidth - PADDING);

  // closeBtn is position: fixed; these are viewport coords
  closeBtn.style.top  = top + 'px';
  closeBtn.style.left = left + 'px';
}

function placeMore(){
  if (!lb.classList.contains('open') || !lbMoreWrap || lbMoreWrap.hidden) return;
  const m = currentMedia();
  if (!m) return;

  const r = m.getBoundingClientRect();
  // position fixed at media bottom-right, slightly below
  const top  = Math.round(r.bottom + 8);
  const left = Math.round(r.right - lbMoreWrap.offsetWidth - 8);

  lbMoreWrap.style.top  = top + 'px';
  lbMoreWrap.style.left = left + 'px';
}

window.addEventListener('resize', () => { placeClose(); placeMore(); });
slot.addEventListener('load', () => { placeClose(); placeMore(); }, true);
slot.addEventListener('loadedmetadata', () => { placeClose(); placeMore(); }, true);

/* ============ Auto-inject "See more →" for any card with data-more ============ */
function ensureSeeMoreOverlays(){
  document.querySelectorAll('article.card[data-more]').forEach(card=>{
    const href = card.getAttribute('data-more');
    const thumb = card.querySelector('.thumb[data-lightbox]');
    if (!thumb || !href) return;

    // already has a see-more?
    if (thumb.querySelector('.see-more-btn')) return;

    // position the thumb if needed
    const cs = window.getComputedStyle(thumb).position;
    if (cs === 'static') thumb.style.position = 'relative';

    // create the link
    const a = document.createElement('a');
    a.className = 'see-more-btn';
    a.href = href;
    a.textContent = 'See more →';
    a.setAttribute('aria-label', 'See more');
    thumb.appendChild(a);
  });
}

// run once on load (covers Home, 3D tab, etc.)
if (document.readyState === 'loading'){
  document.addEventListener('DOMContentLoaded', ensureSeeMoreOverlays, { once:true });
} else {
  ensureSeeMoreOverlays();
}
