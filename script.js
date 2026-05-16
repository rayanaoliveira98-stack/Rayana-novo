// Saltino — Premium Familien-Salzwelt

// Nav scroll behavior
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 60);
}, { passive: true });

// Mobile burger menu
const burger = document.getElementById('burger');
const navLinks = document.querySelector('.nav__links');
if (burger && navLinks) {
  burger.addEventListener('click', () => {
    const isOpen = navLinks.style.display === 'flex';
    navLinks.style.cssText = isOpen
      ? ''
      : 'display:flex;flex-direction:column;position:fixed;top:72px;left:0;right:0;background:var(--soft-white);padding:24px;gap:20px;box-shadow:0 8px 32px rgba(44,36,24,.12);z-index:99;';
    burger.setAttribute('aria-expanded', String(!isOpen));
  });

  navLinks.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => { navLinks.style.cssText = ''; });
  });
}

// Scroll fade-in
const observer = new IntersectionObserver(
  entries => entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      observer.unobserve(e.target);
    }
  }),
  { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
);

document.querySelectorAll(
  '.pillar, .zone-card, .spot, .aq-metric, .swatch, .material-chip, .feel-word, .mascot-dino'
).forEach((el, i) => {
  el.classList.add('fade-up');
  el.style.transitionDelay = `${(i % 4) * 80}ms`;
  observer.observe(el);
});

// Color swatch tooltips (touch support)
document.querySelectorAll('.swatch').forEach(swatch => {
  swatch.addEventListener('click', () => {
    const name = swatch.getAttribute('data-name');
    const bg   = swatch.style.background;
    const tip  = document.createElement('div');
    tip.textContent = name;
    tip.style.cssText = `
      position:fixed; bottom:24px; left:50%; transform:translateX(-50%);
      background:var(--dark); color:#fff; padding:8px 20px;
      border-radius:var(--radius-pill); font-size:13px;
      opacity:0; transition:opacity .2s; pointer-events:none; z-index:200;
    `;
    document.body.appendChild(tip);
    requestAnimationFrame(() => { tip.style.opacity = '1'; });
    setTimeout(() => {
      tip.style.opacity = '0';
      setTimeout(() => tip.remove(), 200);
    }, 1800);
  });
});

// Booking form
const form = document.getElementById('bookingForm');
if (form) {
  form.addEventListener('submit', e => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    const original = btn.textContent;
    btn.textContent = '✓ Anfrage gesendet!';
    btn.style.background = 'var(--sage)';
    btn.disabled = true;
    setTimeout(() => {
      btn.textContent = original;
      btn.style.background = '';
      btn.disabled = false;
      form.reset();
    }, 3500);
  });
}

// Air quality metrics — subtle live animation
const aqValues = document.querySelectorAll('.aq-value');
setInterval(() => {
  aqValues.forEach(v => {
    const base = parseFloat(v.dataset.base || v.textContent);
    if (!v.dataset.base) v.dataset.base = base;
    const jitter = (Math.random() - 0.5) * 0.4;
    const unit = v.querySelector('span');
    const unitText = unit ? unit.outerHTML : '';
    const numStr = (base + jitter).toFixed(base > 10 ? 0 : 1);
    v.innerHTML = numStr + unitText;
  });
}, 3000);

// Smooth anchor scroll
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});
