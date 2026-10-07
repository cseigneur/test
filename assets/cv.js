(function () {
  var root = document.documentElement;
  var nav = document.getElementById('nav');

  // Theme toggle
  var toggle = document.getElementById('theme-toggle');
  if (toggle) toggle.addEventListener('click', function () {
    var current = root.dataset.theme || (matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
    root.dataset.theme = current === 'dark' ? 'light' : 'dark';
    try { localStorage.setItem('cv-theme', root.dataset.theme); } catch (e) {}
  });

  // Copy buttons
  document.querySelectorAll('.copy').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var text = btn.getAttribute('data-copy');
      var done = function () {
        btn.textContent = 'Copié';
        setTimeout(function () { btn.textContent = 'Copier'; }, 1800);
      };
      var fallback = function () {
        var el = document.getElementById(btn.getAttribute('data-target'));
        if (!el) return;
        var range = document.createRange(); range.selectNodeContents(el);
        var sel = window.getSelection(); sel.removeAllRanges(); sel.addRange(range);
        btn.textContent = 'Sélectionné';
        setTimeout(function () { btn.textContent = 'Copier'; }, 1800);
      };
      try {
        navigator.clipboard.writeText(text).then(done, fallback);
      } catch (e) { fallback(); }
    });
  });

  // Nav: background after the hero starts scrolling, hide on scroll down
  var lastY = window.scrollY;
  window.addEventListener('scroll', function () {
    var y = window.scrollY;
    nav.classList.toggle('is-scrolled', y > 24);
    nav.classList.toggle('is-hidden', y > 320 && y > lastY);
    lastY = y;
  }, { passive: true });

  // Split the manifesto into words (kept readable without JS)
  var manifesto = document.querySelector('[data-words]');
  if (manifesto) {
    var words = manifesto.textContent.trim().split(/\s+/);
    manifesto.textContent = '';
    words.forEach(function (w, i) {
      var s = document.createElement('span'); s.className = 'w'; s.textContent = w;
      manifesto.appendChild(s);
      if (i < words.length - 1) manifesto.appendChild(document.createTextNode(' '));
    });
  }

  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce || !window.gsap || !window.ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);

  // Intro sequence
  var intro = gsap.timeline({ defaults: { ease: 'expo.out' } });
  intro
    .from('.hero-eyebrow', { y: 16, opacity: 0, duration: 0.8 })
    .from('.hero-line > span', { yPercent: 105, duration: 1.3, stagger: 0.12 }, 0.1)
    .from('.hero-portrait', { clipPath: 'inset(100% 0% 0% 0%)', duration: 1.5, ease: 'expo.inOut' }, 0.15)
    .from('.hero-portrait img', { scale: 1.15, duration: 1.8 }, 0.15)
    .from('.hero-bottom > *', { y: 28, opacity: 0, duration: 1, stagger: 0.08 }, 0.55)
    .from('.gantt-axis .gantt-year', { opacity: 0, duration: 0.6, stagger: 0.04 }, 0.7)
    .from('.gantt-bar', { scaleX: 0, duration: 1.1, stagger: 0.07, ease: 'power3.inOut' }, 0.8)
    .from('.gantt-text', { opacity: 0, y: 6, duration: 0.6, stagger: 0.05 }, 1.3);

  // Portrait and name drift as the hero scrolls away
  gsap.to('.hero-portrait img', {
    yPercent: 12, ease: 'none',
    scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true }
  });
  gsap.to('.hero-name', {
    xPercent: -4, ease: 'none',
    scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true }
  });

  // Reveals start from a dim, visible state
  gsap.utils.toArray('[data-reveal]').forEach(function (el) {
    gsap.from(el, {
      y: 40, opacity: 0.2, duration: 1.1, ease: 'expo.out',
      scrollTrigger: { trigger: el, start: 'top 90%', once: true }
    });
  });

  // Manifesto lights up word by word
  if (manifesto) {
    gsap.fromTo(manifesto.querySelectorAll('.w'), { opacity: 0.22 }, {
      opacity: 1, stagger: 0.05, ease: 'none',
      scrollTrigger: { trigger: manifesto, start: 'top 80%', end: 'bottom 50%', scrub: true }
    });
  }

  // Counters
  document.querySelectorAll('.count').forEach(function (el) {
    var target = parseFloat(el.getAttribute('data-count'));
    var obj = { v: 0 };
    gsap.to(obj, {
      v: target, duration: 1.6, ease: 'power2.out',
      scrollTrigger: { trigger: el, start: 'top 90%', once: true },
      onUpdate: function () { el.textContent = Math.round(obj.v); }
    });
  });

  // Progress rail next to the jobs
  gsap.fromTo('.rail-fill', { scaleY: 0 }, {
    scaleY: 1, ease: 'none',
    scrollTrigger: { trigger: '.jobs', start: 'top 60%', end: 'bottom 60%', scrub: true }
  });

  // Contact title slides in from the side
  gsap.from('.contact-title', {
    xPercent: 8, ease: 'none',
    scrollTrigger: { trigger: '.contact', start: 'top bottom', end: 'center center', scrub: true }
  });

  // Magnetic buttons (mouse only)
  if (matchMedia('(pointer: fine)').matches) {
    document.querySelectorAll('.magnetic').forEach(function (btn) {
      btn.addEventListener('pointermove', function (e) {
        var r = btn.getBoundingClientRect();
        gsap.to(btn, { x: (e.clientX - r.left - r.width / 2) * 0.25, y: (e.clientY - r.top - r.height / 2) * 0.35, duration: 0.4, ease: 'power3.out' });
      });
      btn.addEventListener('pointerleave', function () {
        gsap.to(btn, { x: 0, y: 0, duration: 0.7, ease: 'elastic.out(1, 0.4)' });
      });
    });
  }
})();
