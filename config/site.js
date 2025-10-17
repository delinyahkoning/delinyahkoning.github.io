(async function(){
  // helper: qs
  const $ = (s, sc=document) => sc.querySelector(s);

  // 1) fetch config (relative path so it works in subfolders like GitHub Pages)
  let cfg = null;
  try {
    const res = await fetch('config/config.json', { cache: 'no-store' });
    if (res.ok) cfg = await res.json();
  } catch (e) {}
  if (!cfg) {
    // still set the year so footer isn't blank
    const y = $('#y'); if (y) y.textContent = new Date().getFullYear();
    return;
  }

  // 2) meta + brand/footer
  if (cfg.site?.title) document.title = cfg.site.title;
  if (cfg.site?.description) {
    let m = document.querySelector('meta[name="description"]');
    if (!m) { m = document.createElement('meta'); m.name = 'description'; document.head.appendChild(m); }
    m.content = cfg.site.description;
  }
  if (cfg.site?.brand) { const b = document.querySelector('.brand'); if (b) b.textContent = cfg.site.brand; }
  const y = $('#y'); if (y) y.textContent = new Date().getFullYear();
  if (cfg.site?.footer_brand) { const bf = $('#brandFooter'); if (bf) bf.textContent = cfg.site.footer_brand; }

  // 3) theme overrides (JSON wins over theme.css)
  if (cfg.theme && typeof cfg.theme === 'object') {
    const root = document.documentElement;
    Object.entries(cfg.theme).forEach(([k,v])=>{ if (k.startsWith('--')) root.style.setProperty(k, v); });
  }

  // 4) hero text + poem
  const [l1, l2] = cfg.site?.hero_lines || ["", ""];
  const hl1 = $('#heroLine1'), hl2 = $('#heroLine2');
  if (hl1) hl1.textContent = l1 || '';
  if (hl2) hl2.textContent = l2 || '';
  const poem = cfg.site?.poem || [];
  const ps = [$('#poem1'), $('#poem2'), $('#poem3')];
  ps.forEach((el, i)=>{ if (el) el.textContent = poem[i] || ''; });

  // 5) about panel
  if (cfg.site?.about) { const a = $('#aboutText'); if (a) a.textContent = cfg.site.about; }
  if (cfg.site?.email) { const e = $('#emailLink'); if (e){ e.href = `mailto:${cfg.site.email}`; e.textContent = cfg.site.email; } }
  if (cfg.site?.resume_url) { const r = $('#resumeLink'); if (r){ r.href = cfg.site.resume_url; r.textContent = 'resume'; } }

  // 6) nav (tabs)
  if (Array.isArray(cfg.nav)) {
    const tabs = document.querySelector('nav.tabs');
    if (tabs) {
      // preserve the tri-switch sitting next to the tabs
      const switchWrap = document.querySelector('.tri-switch-wrap');
      const frag = document.createDocumentFragment();
      cfg.nav.forEach(item=>{
        const a = document.createElement('a');
        a.className = 'tab' + (item.active ? ' active' : '');
        a.href = item.href || '#';
        a.textContent = item.label || 'Item';
        frag.appendChild(a);
      });
      tabs.innerHTML = '';
      tabs.appendChild(frag);
      if (switchWrap) tabs.parentElement.appendChild(switchWrap);
    }
  }

  // 7) cards (grid)
  if (Array.isArray(cfg.cards)) {
    const grid = $('#cardsGrid');
    if (grid) {
      grid.innerHTML = '';
      cfg.cards.forEach(card=>{
        const article = document.createElement('article'); article.className = 'card';
        const thumb = document.createElement('div'); thumb.className='thumb'; thumb.dataset.lightbox='';
        const btn = document.createElement('button'); btn.className='fs-btn'; btn.type='button'; btn.setAttribute('aria-label','Open'); btn.textContent='⤢';
        let media;
        if (card.type === 'video') {
          media = document.createElement('video');
          media.src = card.src; media.autoplay = true; media.muted = true; media.loop = true; media.setAttribute('playsinline','');
        } else {
          media = document.createElement('img');
          media.src = card.src; media.alt = card.title || ''; media.loading = 'lazy';
        }
        thumb.append(btn, media);
        const title = document.createElement('strong'); title.textContent = card.title || 'Untitled';
        const sub = document.createElement('div'); sub.className='sub'; sub.textContent = card.sub || '';
        article.append(thumb, title, sub);
        grid.appendChild(article);
      });
      // let the lightbox rebind to the new thumbs
      document.dispatchEvent(new CustomEvent('cards:hydrated'));
    }
  }

  // 8) features/toggles
  // cursor default
  if (cfg.features?.cursor_default) {
    localStorage.setItem('cursorMode', cfg.features.cursor_default);
    document.dispatchEvent(new Event('cursor:apply-default'));
  }
  // liquify on/off
  if (cfg.features?.hero_liquify === false) {
    document.body.classList.add('liquify-disabled');
    document.dispatchEvent(new CustomEvent('liquify:disable'));
  } else {
    document.dispatchEvent(new CustomEvent('liquify:enable'));
  }
})();
