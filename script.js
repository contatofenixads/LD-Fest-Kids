// ============================================================
// LD FEST KIDS — Site institucional
// ============================================================

document.addEventListener('DOMContentLoaded', () => {

  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  initNavbar();
  initMobileMenu();
  initScrollReveal();
  initAccordion();
  initShowAllThemes();
  document.querySelectorAll('.carousel').forEach(el => new Carousel(el));

});

// ---------- Navbar: muda de aparência ao rolar ----------
function initNavbar() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  const update = () => navbar.classList.toggle('is-scrolled', window.scrollY > 10);
  update();
  window.addEventListener('scroll', update, { passive: true });
}

// ---------- Menu mobile ----------
function initMobileMenu() {
  const toggle = document.getElementById('navToggle');
  const menu = document.getElementById('navMenu');
  if (!toggle || !menu) return;

  toggle.addEventListener('click', () => {
    const isOpen = menu.classList.toggle('is-open');
    toggle.classList.toggle('is-active', isOpen);
    toggle.setAttribute('aria-expanded', String(isOpen));
  });

  menu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      menu.classList.remove('is-open');
      toggle.classList.remove('is-active');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });
}

// ---------- Scroll Reveal (fade up) ----------
function initScrollReveal() {
  const items = document.querySelectorAll('[data-reveal]');
  if (!items.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });

  items.forEach(el => observer.observe(el));
}

// ---------- FAQ Accordion ----------
function initAccordion() {
  const items = document.querySelectorAll('.accordion__item');
  if (!items.length) return;

  items.forEach(item => {
    const trigger = item.querySelector('.accordion__trigger');
    const panel = item.querySelector('.accordion__panel');

    trigger.addEventListener('click', () => {
      const isOpen = item.classList.contains('is-open');

      items.forEach(other => {
        other.classList.remove('is-open');
        other.querySelector('.accordion__trigger').setAttribute('aria-expanded', 'false');
        other.querySelector('.accordion__panel').style.maxHeight = '';
      });

      if (!isOpen) {
        item.classList.add('is-open');
        trigger.setAttribute('aria-expanded', 'true');
        panel.style.maxHeight = panel.scrollHeight + 'px';
      }
    });
  });
}

// ---------- Temas: "Ver todos" ----------
function initShowAllThemes() {
  const btn = document.getElementById('showAllThemesBtn');
  const grid = document.getElementById('themesGrid');
  if (!btn || !grid) return;

  const extras = Array.from(grid.querySelectorAll('.theme-card.is-extra'));
  let expanded = false;

  btn.addEventListener('click', () => {
    expanded = !expanded;

    if (expanded) {
      extras.forEach(card => card.hidden = false);
      requestAnimationFrame(() => extras.forEach(card => card.classList.add('is-shown')));
      btn.textContent = 'Ver menos temas';
    } else {
      extras.forEach(card => card.classList.remove('is-shown'));
      setTimeout(() => extras.forEach(card => card.hidden = true), 400);
      btn.textContent = 'Ver todos os temas';
    }
  });
}

// ---------- Carrossel genérico (galeria e depoimentos) ----------
class Carousel {
  constructor(root) {
    this.root = root;
    this.viewport = root.querySelector('.carousel__viewport');
    this.track = root.querySelector('.carousel__track');
    this.prevBtn = root.querySelector('.carousel__arrow--prev');
    this.nextBtn = root.querySelector('.carousel__arrow--next');
    this.dotsWrap = root.querySelector('.carousel__dots');
    this.autoplayMs = parseInt(root.dataset.autoplay, 10) || 0;

    this.originals = Array.from(this.track.children);
    this.count = this.originals.length;
    if (!this.count) return;

    this.buildClones();
    this.index = this.count; // primeiro slide real
    this.slideWidth = 0;
    this.timer = null;

    this.buildDots();
    this.bindEvents();

    // aguarda o layout estabilizar antes de medir
    requestAnimationFrame(() => {
      this.measure();
      this.goTo(this.index, { instant: true });
      this.startAutoplay();
    });
  }

  buildClones() {
    const appendFrag = document.createDocumentFragment();
    const prependFrag = document.createDocumentFragment();

    this.originals.forEach(slide => appendFrag.appendChild(slide.cloneNode(true)));
    this.originals.forEach(slide => prependFrag.appendChild(slide.cloneNode(true)));

    this.track.appendChild(appendFrag);
    this.track.insertBefore(prependFrag, this.track.firstChild);
  }

  buildDots() {
    if (!this.dotsWrap) return;
    this.dots = this.originals.map((_, i) => {
      const dot = document.createElement('button');
      dot.className = 'carousel__dot';
      dot.setAttribute('role', 'tab');
      dot.setAttribute('aria-label', `Ir para o item ${i + 1}`);
      dot.addEventListener('click', () => {
        this.goTo(this.count + i);
        this.restartAutoplay();
      });
      this.dotsWrap.appendChild(dot);
      return dot;
    });
  }

  measure() {
    // offsetWidth ignora transforms (scale) e reflete a largura real de layout
    this.slideWidth = this.track.children[0].offsetWidth;
  }

  updateDots() {
    if (!this.dots) return;
    const active = ((this.index - this.count) % this.count + this.count) % this.count;
    this.dots.forEach((dot, i) => dot.classList.toggle('is-active', i === active));
  }

  goTo(index, { instant = false } = {}) {
    this.index = index;
    this.track.style.transition = instant ? 'none' : '';
    const centerOffset = (this.viewport.clientWidth - this.slideWidth) / 2;
    this.track.style.transform = `translateX(${-this.index * this.slideWidth + centerOffset}px)`;
    this.updateDots();
    this.updateCenter();
  }

  updateCenter() {
    Array.from(this.track.children).forEach((slide, i) => {
      slide.classList.toggle('is-center', i === this.index);
    });
  }

  next() { this.goTo(this.index + 1); }
  prev() { this.goTo(this.index - 1); }

  handleTransitionEnd() {
    if (this.index >= this.count * 2) {
      this.goTo(this.index - this.count, { instant: true });
    } else if (this.index < this.count) {
      this.goTo(this.index + this.count, { instant: true });
    }
  }

  bindEvents() {
    if (this.prevBtn) this.prevBtn.addEventListener('click', () => { this.prev(); this.restartAutoplay(); });
    if (this.nextBtn) this.nextBtn.addEventListener('click', () => { this.next(); this.restartAutoplay(); });

    this.track.addEventListener('transitionend', () => this.handleTransitionEnd());

    this.root.addEventListener('mouseenter', () => this.stopAutoplay());
    this.root.addEventListener('mouseleave', () => this.startAutoplay());

    // Swipe no celular
    let touchStartX = 0;
    this.root.addEventListener('touchstart', (e) => {
      this.stopAutoplay();
      touchStartX = e.touches[0].clientX;
    }, { passive: true });
    this.root.addEventListener('touchend', (e) => {
      const dx = e.changedTouches[0].clientX - touchStartX;
      if (Math.abs(dx) > 40) {
        if (dx < 0) { this.next(); } else { this.prev(); }
      }
      this.startAutoplay();
    }, { passive: true });

    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        this.measure();
        this.goTo(this.index, { instant: true });
      }, 150);
    });
  }

  startAutoplay() {
    if (!this.autoplayMs) return;
    this.stopAutoplay();
    this.timer = setInterval(() => this.next(), this.autoplayMs);
  }

  stopAutoplay() {
    if (this.timer) clearInterval(this.timer);
  }

  restartAutoplay() {
    this.stopAutoplay();
    this.startAutoplay();
  }
}
