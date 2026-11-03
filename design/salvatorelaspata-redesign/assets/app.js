/* =====================================================================
   salvatorelaspata.net — interazioni del prototipo
   Ogni blocco corrisponde a uno <script> di un componente Astro.
   Tutto è progressive enhancement: senza JS il contenuto è completo.
   ===================================================================== */
(() => {
  const root = document.documentElement;
  const reduceMQ = window.matchMedia('(prefers-reduced-motion: reduce)');
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch { /* storage bloccato */ } },
  };

  /* ---------- Tema (Header.astro / ThemeToggle.astro) ---------- */
  const themeButtons = document.querySelectorAll('[data-theme-toggle]');
  const syncThemeButtons = () => {
    const dark = root.classList.contains('dark');
    themeButtons.forEach((b) => b.setAttribute('aria-pressed', String(dark)));
  };
  const applyTheme = (t) => { root.classList.toggle('dark', t === 'dark'); syncThemeButtons(); };
  themeButtons.forEach((b) => b.addEventListener('click', () => {
    const next = root.classList.contains('dark') ? 'light' : 'dark';
    applyTheme(next); store.set('theme', next);
  }));
  // le anteprime in iframe della board seguono il tema scelto
  window.addEventListener('storage', (e) => { if (e.key === 'theme' && e.newValue) applyTheme(e.newValue); });
  syncThemeButtons();

  /* ---------- Menu mobile (MobileNav.astro) ---------- */
  const menuBtn = document.querySelector('[data-menu-toggle]');
  const menu = menuBtn && document.getElementById(menuBtn.getAttribute('aria-controls'));
  if (menuBtn && menu) {
    const setOpen = (open) => {
      menuBtn.setAttribute('aria-expanded', String(open));
      menuBtn.setAttribute('aria-label', open ? menuBtn.dataset.labelClose : menuBtn.dataset.labelOpen);
      menu.hidden = !open;
      menuBtn.querySelector('[data-icon-open]').hidden = open;
      menuBtn.querySelector('[data-icon-close]').hidden = !open;
      if (open) menu.querySelector('a, button')?.focus();
    };
    menuBtn.addEventListener('click', () => setOpen(menuBtn.getAttribute('aria-expanded') !== 'true'));
    menu.addEventListener('click', (e) => { if (e.target.closest('a')) setOpen(false); });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && menuBtn.getAttribute('aria-expanded') === 'true') { setOpen(false); menuBtn.focus(); }
    });
    window.matchMedia('(min-width: 1024px)').addEventListener('change', (e) => { if (e.matches) setOpen(false); });
  }

  /* ---------- Header: bordo pieno dopo lo scroll ---------- */
  const header = document.querySelector('.site-header');
  const toTop = document.querySelector('.to-top');
  const onScroll = () => {
    const y = window.scrollY;
    header?.setAttribute('data-scrolled', String(y > 8));
    toTop?.setAttribute('data-visible', String(y > window.innerHeight * 1.2));
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Back to top (BackToTop.astro) ---------- */
  toTop?.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: reduceMQ.matches ? 'auto' : 'smooth' });
    document.getElementById('main')?.focus({ preventScroll: true });
  });

  /* ---------- Filtri (ProjectFilter.astro, BlogFilter.astro) ----------
     <div data-filter-group="projects"> con <button class="chip" data-filter="sap" aria-pressed>
     elementi: [data-filter-item="projects"][data-tags="sap npm ..."]                  */
  document.querySelectorAll('[data-filter-group]').forEach((group) => {
    const name = group.dataset.filterGroup;
    const items = document.querySelectorAll(`[data-filter-item="${name}"]`);
    const status = document.querySelector(`[data-filter-status="${name}"]`);
    const empty = document.querySelector(`[data-filter-empty="${name}"]`);
    const buttons = group.querySelectorAll('[data-filter]');
    const apply = (value) => {
      let n = 0;
      items.forEach((el) => {
        const show = value === 'all' || el.dataset.tags.split(' ').includes(value);
        el.hidden = !show; if (show) n++;
      });
      buttons.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.filter === value)));
      if (status) status.textContent = status.dataset.template.replace('{n}', n);
      if (empty) empty.hidden = n !== 0;
    };
    buttons.forEach((b) => b.addEventListener('click', () => apply(b.dataset.filter)));
  });

  /* ---------- Copia negli appunti ---------- */
  document.querySelectorAll('[data-copy]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const src = btn.dataset.copy.startsWith('#') ? document.querySelector(btn.dataset.copy)?.innerText : btn.dataset.copy;
      const label = btn.querySelector('[data-copy-label]');
      const original = label?.textContent;
      try { await navigator.clipboard.writeText(src || ''); if (label) label.textContent = btn.dataset.copied || 'Copiato'; }
      catch { if (label) label.textContent = 'Seleziona e copia'; }
      setTimeout(() => { if (label) label.textContent = original; }, 1800);
    });
  });

  /* ---------- Indice articolo: sezione attiva (Toc.astro) ---------- */
  const tocLinks = document.querySelectorAll('[data-toc] a[href^="#"]');
  if (tocLinks.length && 'IntersectionObserver' in window) {
    const map = new Map([...tocLinks].map((a) => [a.getAttribute('href').slice(1), a]));
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        tocLinks.forEach((a) => a.removeAttribute('aria-current'));
        map.get(en.target.id)?.setAttribute('aria-current', 'true');
      });
    }, { rootMargin: '-20% 0px -70% 0px' });
    map.forEach((_, id) => { const el = document.getElementById(id); if (el) io.observe(el); });
  }

  /* ---------- Spark al click (Spark.astro) ----------
     Solo con puntatore preciso e motion consentito; mai su elementi di testo. */
  const fine = window.matchMedia('(pointer: fine)');
  document.addEventListener('pointerdown', (e) => {
    if (reduceMQ.matches || !fine.matches || e.button !== 0) return;
    const s = document.createElement('div');
    s.className = 'spark'; s.setAttribute('aria-hidden', 'true');
    s.style.left = `${e.clientX}px`; s.style.top = `${e.clientY}px`;
    const n = 8;
    for (let i = 0; i < n; i++) {
      const p = document.createElement('i');
      const a = (360 / n) * i;
      p.style.transform = `rotate(${a}deg) translateY(4px)`;
      p.animate(
        [{ transform: `rotate(${a}deg) translateY(4px) scaleY(1)`, opacity: 1 },
         { transform: `rotate(${a}deg) translateY(18px) scaleY(0.2)`, opacity: 0 }],
        { duration: 380, easing: 'cubic-bezier(.2,.7,.2,1)', fill: 'forwards' }
      );
      s.appendChild(p);
    }
    document.body.appendChild(s);
    setTimeout(() => s.remove(), 420);
  });

  /* =====================================================================
     Motion (GSAP + ScrollTrigger)
     gsap.matchMedia() garantisce che con reduced-motion NULLA venga
     animato e che tutto torni allo stato finale se l'utente cambia
     preferenza a pagina aperta.
     ===================================================================== */
  if (!window.gsap) return;
  if (window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);
  const mm = gsap.matchMedia();

  mm.add('(prefers-reduced-motion: no-preference)', () => {
    const ease = 'power3.out';

    // 1) Hero: un solo momento orchestrato. Testo in entrata, poi lo "stack"
    //    architetturale si costruisce dal basso (on-premise → cloud → side).
    const hero = document.querySelector('[data-hero]');
    if (hero) {
      const tl = gsap.timeline({ defaults: { ease, duration: 0.6 } });
      tl.from(hero.querySelectorAll('[data-hero-text]'), { y: 18, autoAlpha: 0, stagger: 0.08 })
        .from(hero.querySelectorAll('[data-layer]'), {
          y: 24, autoAlpha: 0, stagger: { each: 0.12, from: 'end' }, duration: 0.5,
        }, '-=0.3')
        .from(hero.querySelectorAll('[data-stat]'), { y: 10, autoAlpha: 0, stagger: 0.05, duration: 0.4 }, '-=0.2');
    }

    if (!window.ScrollTrigger) return;

    // 2) Reveal di sezione: piccolo, una volta sola, mai su testo già visibile al load
    gsap.utils.toArray('[data-reveal]').forEach((el) => {
      gsap.from(el, {
        y: 20, autoAlpha: 0, duration: 0.55, ease,
        scrollTrigger: { trigger: el, start: 'top 88%', once: true },
      });
    });

    // 3) Gruppi (card, righe): stagger breve
    gsap.utils.toArray('[data-reveal-group]').forEach((group) => {
      gsap.from(group.children, {
        y: 16, autoAlpha: 0, duration: 0.45, ease, stagger: 0.06,
        scrollTrigger: { trigger: group, start: 'top 85%', once: true },
      });
    });

    // 4) Timeline: la linea si "disegna" seguendo lo scroll (scrub = legata al gesto)
    const prog = document.querySelector('.timeline-progress');
    if (prog) {
      gsap.fromTo(prog, { scaleY: 0 }, {
        scaleY: 1, ease: 'none',
        scrollTrigger: { trigger: '.timeline', start: 'top 70%', end: 'bottom 60%', scrub: 0.4 },
      });
    }

    // 5) Barra di lettura articolo
    const bar = document.querySelector('[data-reading-progress]');
    if (bar) {
      gsap.fromTo(bar, { scaleX: 0 }, {
        scaleX: 1, ease: 'none',
        scrollTrigger: { trigger: '[data-article]', start: 'top top', end: 'bottom bottom', scrub: true },
      });
    }
  });
})();
