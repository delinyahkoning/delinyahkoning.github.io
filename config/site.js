(async function(){
  let cfg = null;
  try {
    const res = await fetch('/assets/config.json', {cache:'no-store'});
    if (res.ok) cfg = await res.json();
  } catch (e) {}
  if (!cfg) return;

  // meta
  if (cfg.site?.title) document.title = cfg.site.title;
  if (cfg.site?.description){
    let m = document.querySelector('meta[name="description"]');
    if (!m){ m = document.createElement('meta'); m.name = 'description'; document.head.appendChild(m); }
    m.content = cfg.site.description;
  }

  // theme vars
  if (cfg.theme){
    const root = document.documentElement;
    Object.entries(cfg.theme).forEach(([k,v])=>{ if(k.startsWith('--')) root.style.setProperty(k,v); });
  }

  // brand/footer/email/resume
  if (cfg.site?.footer_brand){
    const brandEls = document.querySelectorAll('.brand, footer');
    brandEls.forEach(el=>{
      if (el.classList?.contains('brand')) el.textContent = cfg.site.footer_brand;
      if (el.tagName === 'FOOTER'){
        el.innerHTML = `© <span id="y">${new Date().getFullYear()}</span>${cfg.site.footer_brand}`;
      }
    });
  }
  if (cfg.site?.email){
    const emailLink = document.querySelector('a[href^="mailto:"]');
    if (emailLink){ emailLink.href = `mailto:${cfg.site.email}`; emailLink.textContent = cfg.site.email; }
  }
  if (cfg.site?.resume_url){
    const resume = document.querySelector('a[href$="resume.pdf"]');
    if (resume) resume.href = cfg.site.resume_url;
  }

  // nav rebuild
  if (Array.isArray(cfg.nav)){
    const tabs = document.querySelector('nav.tabs');
    if (tabs){
      const switchWrap = tabs.querySelector('.tri-switch-wrap');
      const frag = document.createDocumentFragment();
      cfg.nav.forEach(item=>{
        const a = document.createElement('a');
        a.className = 'tab';
        if (item.active) a.classList.add('active');
        a.href = item.href || '#';
        a.textContent = item.label || 'Item';
        frag.appendChild(a);
      });
      tabs.innerHTML = '';
      tabs.appendChild(frag);
      if (switchWrap) tabs.appendChild(switchWrap);
    }
  }

  // cards hydrate
  if (Array.isArray(cfg.cards) && cfg.cards.length){
    const grid = document.querySelector('.grid.cards');
    if (grid){
      grid.innerHTML = '';
      cfg.cards.forEach(card=>{
        const article = document.createElement('article');
        article.className = 'card';

        const thumb = document.createElement('div');
        thumb.className = 'thumb';
        thumb.dataset.lightbox = '';

        const btn = document.createElement('button');
        btn.className = 'fs-btn';
        btn.type = 'button';
        btn.setAttribute('aria-label','Open');
        btn.textContent = '⤢';

        let media;
        if (card.type === 'video'){
          media = document.createElement('video');
          media.src = card.src;
          media.autoplay = true; media.muted = true; media.loop = true;
          media.setAttribute('playsinline','');
        } else {
          media = document.createElement('img');
          media.src = card.src;
          media.alt = card.title || '';
          media.loading = 'lazy';
        }

        thumb.appendChild(btn);
        thumb.appendChild(media);

        const title = document.createElement('strong');
        title.textContent = card.title || 'Untitled';

        const sub = document.createElement('div');
        sub.className = 'sub';
        sub.style.fontSize = '13px';
        sub.textContent = card.sub || '';

        article.appendChild(thumb);
        article.appendChild(title);
        article.appendChild(sub);
        grid.appendChild(article);
      });

      document.dispatchEvent(new CustomEvent('cards:hydrated'));
    }
  }
})();
