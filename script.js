// ============================================================
// LD FEST KIDS — Landing Page JS
// ============================================================

document.addEventListener('DOMContentLoaded', () => {

  // Ano dinâmico no rodapé
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // ---------- Menu mobile ----------
  const navToggle = document.getElementById('navToggle');
  const navMenu = document.getElementById('navMenu');

  if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
      const isOpen = navMenu.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', isOpen);
      navToggle.classList.toggle('is-active', isOpen);
    });

    // Fecha o menu ao clicar em um link (mobile)
    navMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('is-open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // ---------- Sombra na navbar ao rolar ----------
  const navbar = document.getElementById('navbar');
  const onScroll = () => {
    if (window.scrollY > 12) {
      navbar.style.boxShadow = '0 4px 20px rgba(74, 59, 69, 0.12)';
    } else {
      navbar.style.boxShadow = '0 2px 16px rgba(74, 59, 69, 0.06)';
    }
  };
  window.addEventListener('scroll', onScroll);
  onScroll();

  // ---------- Fade-in ao rolar a página (IntersectionObserver) ----------
  const fadeEls = document.querySelectorAll('.fade-in');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.15,
    rootMargin: '0px 0px -60px 0px'
  });

  fadeEls.forEach(el => observer.observe(el));

  // Aplica um pequeno atraso escalonado dentro de grids (efeito cascata)
  document.querySelectorAll('.services__grid, .gallery__grid, .about__list').forEach(grid => {
    Array.from(grid.children).forEach((child, index) => {
      child.style.transitionDelay = `${index * 0.08}s`;
    });
  });

});
