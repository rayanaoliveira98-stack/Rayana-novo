// FITARY — Train Smarter. Live Better.

// Nav scroll effect
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 40);
}, { passive: true });

// Mobile menu
const burger = document.getElementById('burger');
let mobileMenu = null;

function buildMobileMenu() {
  const menu = document.createElement('nav');
  menu.className = 'nav__mobile-menu';
  menu.innerHTML = `
    <a href="#programs" onclick="closeMobile()">Programs</a>
    <a href="#features" onclick="closeMobile()">Features</a>
    <a href="#trainers" onclick="closeMobile()">Trainers</a>
    <a href="#pricing" onclick="closeMobile()">Pricing</a>
    <a href="#join" class="nav__cta" onclick="closeMobile()">Start Free Trial</a>
  `;
  document.body.appendChild(menu);
  return menu;
}

function closeMobile() {
  if (mobileMenu) {
    mobileMenu.classList.remove('open');
    document.body.style.overflow = '';
  }
}

window.closeMobile = closeMobile;

if (burger) {
  burger.addEventListener('click', () => {
    if (!mobileMenu) mobileMenu = buildMobileMenu();
    const open = mobileMenu.classList.toggle('open');
    document.body.style.overflow = open ? 'hidden' : '';
  });
}

// Program filters
const filterBtns = document.querySelectorAll('.filter-btn');
const programCards = document.querySelectorAll('.program-card');

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('filter-btn--active'));
    btn.classList.add('filter-btn--active');

    const filter = btn.dataset.filter;
    programCards.forEach(card => {
      const match = filter === 'all' || card.dataset.type === filter;
      card.style.display = match ? '' : 'none';
    });
  });
});

// Pricing toggle — annual / monthly
const billingToggle = document.getElementById('billingToggle');
const toggleLabels  = document.querySelectorAll('.toggle-label');
const priceAmounts  = document.querySelectorAll('.price-amount[data-monthly]');

if (billingToggle) {
  billingToggle.addEventListener('change', () => {
    const isAnnual = billingToggle.checked;
    toggleLabels[0].classList.toggle('toggle-label--active', !isAnnual);
    toggleLabels[1].classList.toggle('toggle-label--active', isAnnual);
    priceAmounts.forEach(el => {
      el.textContent = isAnnual ? el.dataset.annual : el.dataset.monthly;
    });
  });
}

// Scroll-triggered reveal
const revealEls = document.querySelectorAll(
  '.feature-card, .program-card, .trainer-card, .testimonial-card, .pricing-card'
);

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

revealEls.forEach((el, i) => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(28px)';
  el.style.transition = `opacity .5s ease ${(i % 4) * 0.08}s, transform .5s ease ${(i % 4) * 0.08}s`;
  observer.observe(el);
});

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
