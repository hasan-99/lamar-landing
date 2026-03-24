document.addEventListener('DOMContentLoaded', () => {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isMobile = window.innerWidth < 768;
  const hasGSAP = typeof gsap !== 'undefined';

  // ── Page Loader ──
  const loader = document.getElementById('pageLoader');
  function dismissLoader() {
    if (!loader) return;
    loader.classList.add('hidden');
    document.body.classList.remove('loading');
    loader.addEventListener('transitionend', () => { loader.remove(); initHeroAnimation(); }, { once: true });
    setTimeout(() => { loader && loader.remove(); initHeroAnimation(); }, 700);
  }
  if (loader) {
    document.body.classList.add('loading');
    if (document.readyState === 'complete') setTimeout(dismissLoader, 2400);
    else window.addEventListener('load', () => setTimeout(dismissLoader, 2400));
    setTimeout(dismissLoader, 4000);
  }

  // ── Hero Typing ──
  let heroOriginalText = '';
  const heroTitleEl = document.querySelector('.hero-title');
  if (heroTitleEl) {
    heroOriginalText = heroTitleEl.textContent.trim();
    heroTitleEl.textContent = '';
  }

  function typeHeroTitle() {
    const el = document.querySelector('.hero-title');
    if (!el) return;
    const text = el.getAttribute('data-typed-text') || heroOriginalText;
    if (!text) return;
    el.textContent = '';
    el.style.opacity = '1'; el.style.visibility = 'visible';
    if (reducedMotion) { el.textContent = text; return; }
    const chars = [];
    for (const ch of text) {
      if (ch === ' ') { el.appendChild(document.createTextNode(' ')); }
      else {
        const s = document.createElement('span');
        s.className = 'char'; s.textContent = ch;
        el.appendChild(s); chars.push(s);
      }
    }
    const cursor = document.createElement('span');
    cursor.className = 'typing-cursor';
    el.appendChild(cursor);
    const delay = Math.max(20, Math.min(50, 1600 / chars.length));
    chars.forEach((s, i) => setTimeout(() => s.classList.add('visible'), i * delay));
    setTimeout(() => cursor.classList.add('done'), chars.length * delay + 600);
    setTimeout(() => cursor.remove(), chars.length * delay + 1200);
  }
  window.typeHeroTitle = typeHeroTitle;

  function initHeroAnimation() {
    if (hasGSAP && !reducedMotion) {
      gsap.timeline({ onComplete: () => { window.heroAnimationDone = true; } })
        .to('.hero-title', { y: 0, autoAlpha: 1, filter: 'blur(0px)', duration: 0.9, ease: 'power3.out', onComplete: typeHeroTitle })
        .to('.hero-subtitle', { y: 0, autoAlpha: 1, duration: 0.7, ease: 'power3.out' }, '-=0.3')
        .to('.hero-actions', { y: 0, autoAlpha: 1, scale: 1, duration: 0.6, ease: 'back.out(1.5)' }, '-=0.3')
        .to('.hero-badge, .hero-price-line, .hero-free-offer, .hero-urgency', { y: 0, autoAlpha: 1, duration: 0.45, ease: 'power2.out', stagger: 0.08 }, '-=0.35')
        .to('.hero-actions', { y: 0, autoAlpha: 1, scale: 1, duration: 0.5, ease: 'back.out(1.5)' }, '-=0.2')
        .to('.hero-social-proof, .hero-micro-trust, .hero-trust-pills', { y: 0, autoAlpha: 1, duration: 0.4, ease: 'power2.out', stagger: 0.08 }, '-=0.2');
    } else {
      document.querySelectorAll('.hero-title, .hero-subtitle, .hero-badge, .hero-price-line, .hero-free-offer, .hero-urgency, .hero-actions, .hero-social-proof, .hero-micro-trust, .hero-trust-pills').forEach(el => {
        el.style.opacity = '1'; el.style.visibility = 'visible'; el.style.transform = 'none'; el.style.filter = 'none';
      });
      typeHeroTitle();
      window.heroAnimationDone = true;
    }
  }

  if (!loader) initHeroAnimation();

  // ── Scroll Progress ──
  const scrollProgress = document.getElementById('scrollProgress');
  if (scrollProgress) {
    window.addEventListener('scroll', () => {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      scrollProgress.style.width = (window.scrollY / h * 100) + '%';
    }, { passive: true });
  }

  // ── Hero Particles ──
  const heroCanvas = document.getElementById('heroCanvas');
  if (heroCanvas && !reducedMotion) {
    const ctx = heroCanvas.getContext('2d');
    let w, h, particles = [];
    let mx = -1000, my = -1000;
    const COUNT = isMobile ? 35 : 65;
    const CONN = 130, REPEL = 150;

    function resize() {
      const r = heroCanvas.parentElement.getBoundingClientRect();
      const dpr = devicePixelRatio || 1;
      w = r.width; h = r.height;
      heroCanvas.width = w * dpr; heroCanvas.height = h * dpr;
      heroCanvas.style.width = w + 'px'; heroCanvas.style.height = h + 'px';
      ctx.scale(dpr, dpr);
    }

    function mkParticle() {
      const v = Math.random();
      const [r2, g2, b2] = v > 0.6 ? [201, 168, 76] : v > 0.3 ? [226, 196, 120] : [255, 238, 190];
      return {
        x: Math.random() * w, y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.4, vy: (Math.random() - 0.5) * 0.35,
        r: Math.random() * 2 + 0.8, base: 0,
        a: Math.random() * 0.5 + 0.15,
        ps: Math.random() * 0.02 + 0.006, po: Math.random() * Math.PI * 2,
        r2, g2, b2
      };
    }

    function init() {
      resize(); particles = [];
      for (let i = 0; i < COUNT; i++) { const p = mkParticle(); p.base = p.r; particles.push(p); }
    }

    function draw(time) {
      ctx.clearRect(0, 0, w, h);
      const t = time * 0.001;

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x, dy = particles[i].y - particles[j].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < CONN) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(201,168,76,${(1 - d / CONN) * 0.1})`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      for (const p of particles) {
        p.x += p.vx; p.y += p.vy;
        const dx = p.x - mx, dy = p.y - my;
        const md = Math.sqrt(dx * dx + dy * dy);
        if (md < REPEL && md > 0) { const f = (1 - md / REPEL) * 1.5; p.x += dx / md * f; p.y += dy / md * f; }
        if (p.x < -20) p.x = w + 20; if (p.x > w + 20) p.x = -20;
        if (p.y < -20) p.y = h + 20; if (p.y > h + 20) p.y = -20;
        p.r = p.base + Math.sin(t * p.ps * 60 + p.po) * 0.5;

        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 5);
        g.addColorStop(0, `rgba(${p.r2},${p.g2},${p.b2},${p.a * 0.35})`);
        g.addColorStop(1, `rgba(${p.r2},${p.g2},${p.b2},0)`);
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r * 5, 0, Math.PI * 2); ctx.fillStyle = g; ctx.fill();
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.r2},${p.g2},${p.b2},${p.a})`; ctx.fill();
      }
      requestAnimationFrame(draw);
    }

    init(); requestAnimationFrame(draw);
    heroCanvas.parentElement.addEventListener('mousemove', e => {
      const r = heroCanvas.parentElement.getBoundingClientRect();
      mx = e.clientX - r.left; my = e.clientY - r.top;
    }, { passive: true });
    heroCanvas.parentElement.addEventListener('mouseleave', () => { mx = -1000; my = -1000; }, { passive: true });
    window.addEventListener('resize', () => init(), { passive: true });
  }

  // ── Language Toggle ──
  const langToggle = document.getElementById('langToggle');
  if (langToggle) {
    langToggle.addEventListener('click', () => setLanguage(getCurrentLang() === 'ar' ? 'en' : 'ar'));
  }
  setLanguage(getCurrentLang());

  // ── Mobile Menu ──
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');
  const mobileOverlay = document.getElementById('mobileOverlay');

  function closeMobile() {
    mobileMenu.classList.remove('active');
    mobileOverlay.classList.remove('active');
    hamburger.classList.remove('active');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }
  hamburger.addEventListener('click', () => {
    const open = mobileMenu.classList.contains('active');
    mobileMenu.classList.toggle('active');
    mobileOverlay.classList.toggle('active');
    hamburger.classList.toggle('active');
    hamburger.setAttribute('aria-expanded', String(!open));
    document.body.style.overflow = open ? '' : 'hidden';
  });
  mobileOverlay.addEventListener('click', closeMobile);
  document.querySelectorAll('.mobile-nav-link').forEach(a => a.addEventListener('click', closeMobile));

  // ── Sticky Header ──
  const header = document.getElementById('header');
  window.addEventListener('scroll', () => header.classList.toggle('scrolled', window.scrollY > 8), { passive: true });

  // ── Smooth Scroll ──
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const t = document.querySelector(a.getAttribute('href'));
      if (t) { e.preventDefault(); t.scrollIntoView({ behavior: 'smooth' }); }
    });
  });

  // ── FAQ ──
  document.querySelectorAll('.faq-question').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.faq-item');
      const answer = item.querySelector('.faq-answer');
      const isActive = item.classList.contains('active');

      document.querySelectorAll('.faq-item.active').forEach(open => {
        if (open === item) return;
        open.classList.remove('active');
        open.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
        const a = open.querySelector('.faq-answer');
        if (hasGSAP) gsap.to(a, { height: 0, duration: 0.3, ease: 'power2.inOut' });
        else a.style.height = '0';
      });

      if (!isActive) {
        item.classList.add('active');
        btn.setAttribute('aria-expanded', 'true');
        if (hasGSAP) { gsap.set(answer, { height: 'auto' }); gsap.from(answer, { height: 0, duration: 0.35, ease: 'power2.out' }); }
        else answer.style.height = 'auto';
      } else {
        item.classList.remove('active');
        btn.setAttribute('aria-expanded', 'false');
        if (hasGSAP) gsap.to(answer, { height: 0, duration: 0.3, ease: 'power2.inOut' });
        else answer.style.height = '0';
      }
    });
  });

  // ── Price Counter ──
  const priceTag = document.querySelector('.price-tag');
  if (priceTag) {
    let counted = false;
    const obs = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && !counted) {
        counted = true; obs.disconnect();
        const start = performance.now();
        const dur = 1200;
        (function tick(now) {
          const p = Math.min((now - start) / dur, 1);
          const eased = 1 - Math.pow(1 - p, 3);
          priceTag.textContent = '€' + Math.round(eased * 999);
          if (p < 1) requestAnimationFrame(tick);
        })(performance.now());
      }
    }, { threshold: 0.5 });
    obs.observe(priceTag);
  }

  // ── Tax Bars ──
  document.querySelectorAll('.tax-bar-fill').forEach(bar => {
    const target = bar.getAttribute('data-width');
    bar.style.width = '0';
    const obs = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        obs.disconnect();
        setTimeout(() => { bar.style.width = target; }, 200);
      }
    }, { threshold: 0.3 });
    obs.observe(bar);
  });

  // ── Contact Form ──
  const form = document.getElementById('contactForm');
  const formSuccess = document.getElementById('formSuccess');
  if (form) {
    form.addEventListener('submit', e => {
      e.preventDefault();
      let valid = true;
      form.querySelectorAll('[required]').forEach(f => {
        f.classList.remove('error');
        if (!f.value.trim()) { f.classList.add('error'); valid = false; }
      });
      const email = form.querySelector('#email');
      if (email && email.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
        email.classList.add('error'); valid = false;
      }
      if (valid) { form.hidden = true; formSuccess.hidden = false; }
    });
    form.querySelectorAll('input, textarea, select').forEach(f => {
      f.addEventListener('input', () => f.classList.remove('error'));
    });
  }

  // ── GSAP Scroll Animations ──
  if (hasGSAP && !reducedMotion) {
    gsap.registerPlugin(ScrollTrigger);

    // Set initial hero states
    gsap.set('.hero-title, .hero-subtitle', { autoAlpha: 0, y: 40, filter: 'blur(10px)' });
    gsap.set('.hero-actions', { autoAlpha: 0, y: 25, scale: 0.95 });
    gsap.set('.hero-badge, .hero-price-line, .hero-free-offer, .hero-urgency, .hero-social-proof, .hero-micro-trust, .hero-trust-pills', { autoAlpha: 0, y: 18 });
    gsap.set('.hero-actions', { autoAlpha: 0, y: 22, scale: 0.97 });

    function animIn(el, from, to, delay = 0) {
      gsap.set(el, from);
      new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            gsap.killTweensOf(el);
            gsap.to(el, { ...to, delay });
          } else {
            gsap.killTweensOf(el);
            gsap.set(el, from);
          }
        });
      }, { threshold: 0.08 }).observe(el);
    }

    document.querySelectorAll('.section-title').forEach(el => {
      if (el.closest('.hero')) return;
      animIn(el, { autoAlpha: 0, y: 28, filter: 'blur(6px)' }, { autoAlpha: 1, y: 0, filter: 'blur(0px)', duration: 0.75, ease: 'power2.out' });
    });

    document.querySelectorAll('.section-intro, .callout-box, .disclaimer').forEach(el => {
      if (el.closest('.hero')) return;
      animIn(el, { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: 0.65, ease: 'power3.out' });
    });

    document.querySelectorAll('.feature-card').forEach((el, i) => {
      animIn(el, { autoAlpha: 0, y: 40, rotation: 1 }, { autoAlpha: 1, y: 0, rotation: 0, duration: 0.6, ease: 'power3.out' }, (i % 3) * 0.07);
    });

    document.querySelectorAll('.package-list li').forEach((el, i) => {
      animIn(el, { autoAlpha: 0, x: document.dir === 'rtl' ? -30 : 30 }, { autoAlpha: 1, x: 0, duration: 0.5, ease: 'power2.out' }, i * 0.05);
    });

    document.querySelectorAll('.price-card').forEach(el => {
      animIn(el, { autoAlpha: 0, y: 30, scale: 0.96 }, { autoAlpha: 1, y: 0, scale: 1, duration: 0.7, ease: 'back.out(1.3)' });
    });

    document.querySelectorAll('.process-step').forEach((el, i) => {
      animIn(el, { autoAlpha: 0, y: 35, scale: 0.92 }, { autoAlpha: 1, y: 0, scale: 1, duration: 0.6, ease: 'back.out(1.2)' }, i * 0.1);
    });

    document.querySelectorAll('.testimonial-card').forEach((el, i) => {
      animIn(el, { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: 0.6, ease: 'power3.out' }, i * 0.1);
    });

    document.querySelectorAll('.proof-stat').forEach((el, i) => {
      animIn(el, { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: 0.5, ease: 'power2.out' }, i * 0.08);
    });

    document.querySelectorAll('.faq-item').forEach((el, i) => {
      const isRTL = document.documentElement.dir === 'rtl';
      animIn(el, { autoAlpha: 0, x: isRTL ? -35 : 35 }, { autoAlpha: 1, x: 0, duration: 0.5, ease: 'power2.out' }, i * 0.06);
    });

    document.querySelectorAll('.tax-stats-row, .contact-aside').forEach(el => {
      animIn(el, { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: 0.7, ease: 'power3.out' });
    });

    document.querySelectorAll('.final-cta-section .section-title, .final-cta-section p').forEach((el, i) => {
      animIn(el, { autoAlpha: 0, y: 25 }, { autoAlpha: 1, y: 0, duration: 0.6, ease: 'power3.out' }, i * 0.1);
    });
  }
});
