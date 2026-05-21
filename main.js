// Shared scripts for all Tehillah pages

document.addEventListener('DOMContentLoaded', () => {

  // ── SCROLL NAV ──
  const nav = document.querySelector('nav');
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 60);
  });

  // ── MOBILE MENU ──
  const hamburger = document.querySelector('.hamburger');
  if (hamburger) {
    hamburger.addEventListener('click', () => {
      nav.classList.toggle('nav-open');
    });
  }

  // ── ACTIVE NAV LINK ──
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });

  // ── FADE-UP ON SCROLL ──
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.fade-up').forEach(el => observer.observe(el));

  // ── COUNTDOWN TIMER (if present) ──
  const countdownEl = document.getElementById('countdown');
  if (countdownEl) {
    const target = new Date(countdownEl.dataset.target);
    function updateCountdown() {
      const now = new Date();
      const diff = target - now;
      if (diff <= 0) { countdownEl.innerHTML = '<span class="cinzel gold">It\'s Time!</span>'; return; }
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      countdownEl.querySelector('[data-days]').textContent = String(d).padStart(2,'0');
      countdownEl.querySelector('[data-hours]').textContent = String(h).padStart(2,'0');
      countdownEl.querySelector('[data-mins]').textContent = String(m).padStart(2,'0');
      countdownEl.querySelector('[data-secs]').textContent = String(s).padStart(2,'0');
    }
    updateCountdown();
    setInterval(updateCountdown, 1000);
  }

  // ── SMOOTH CLOSE NAV ON LINK CLICK ──
  document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
      nav.classList.remove('nav-open');
    });
  });

});
