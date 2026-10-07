/**
 * Nexi SaaS & Technology — Animation & Motion Engine
 * Powered by Lenis Smooth Scroll, 3D Tilt, Cursor Spotlights & Micro-Interactions
 * Pure Vanilla JavaScript · Zero External Framework Bloat · 60fps GPU Accelerated
 */

(function () {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* --------------------------------------------------------------------------
     1. LENIS SMOOTH SCROLL INITIALIZATION
     -------------------------------------------------------------------------- */
  let lenisInstance = null;

  function initLenis() {
    if (prefersReducedMotion) return;

    if (typeof window.Lenis === 'function') {
      try {
        lenisInstance = new window.Lenis({
          duration: 1.2,
          easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
          direction: 'vertical',
          gestureDirection: 'vertical',
          smooth: true,
          smoothTouch: false,
          touchMultiplier: 2,
        });

        function raf(time) {
          lenisInstance.raf(time);
          requestAnimationFrame(raf);
        }
        requestAnimationFrame(raf);

        // Expose globally for interactive scrolling/nav
        window.__lenis = lenisInstance;
        document.documentElement.classList.add('lenis', 'lenis-smooth');
      } catch (e) {
        console.warn('Lenis initialized with fallback', e);
      }
    }
  }

  /* --------------------------------------------------------------------------
     2. 3D TILT & MOUSE SPOTLIGHT GLOW ON CARDS
     -------------------------------------------------------------------------- */
  function init3DTiltAndGlow() {
    if (prefersReducedMotion) return;

    const cards = document.querySelectorAll('.glow-card, .feature-card, .service-card, .blog-card, .pricing-card, [data-tilt]');
    if (!cards.length) return;

    cards.forEach(card => {
      let bounds;

      function onMouseEnter(e) {
        bounds = card.getBoundingClientRect();
      }

      function onMouseMove(e) {
        if (!bounds) bounds = card.getBoundingClientRect();
        const x = e.clientX - bounds.left;
        const y = e.clientY - bounds.top;

        // Set spotlight coordinates for CSS radial-gradient
        card.style.setProperty('--mouse-x', `${x}px`);
        card.style.setProperty('--mouse-y', `${y}px`);

        // Compute 3D tilt angles
        const centerX = bounds.width / 2;
        const centerY = bounds.height / 2;
        const rotateX = ((y - centerY) / centerY) * -5; // max 5 deg
        const rotateY = ((x - centerX) / centerX) * 5;  // max 5 deg

        card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-4px)`;
      }

      function onMouseLeave() {
        card.style.transform = '';
      }

      card.addEventListener('mouseenter', onMouseEnter, { passive: true });
      card.addEventListener('mousemove', onMouseMove, { passive: true });
      card.addEventListener('mouseleave', onMouseLeave, { passive: true });
    });
  }

  /* --------------------------------------------------------------------------
     3. INTERSECTION OBSERVER FOR SCROLL REVEALS
     -------------------------------------------------------------------------- */
  function initScrollReveals() {
    const revealElements = document.querySelectorAll('.reveal, .slide-up, .slide-left, .slide-right, .smooth-fade-up, .smooth-slide-left, .smooth-slide-right, .smooth-scale-in');
    if (!revealElements.length) return;

    if (prefersReducedMotion) {
      revealElements.forEach(el => el.classList.add('is-visible'));
      return;
    }

    const observerOptions = {
      root: null,
      rootMargin: '0px 0px -8% 0px',
      threshold: 0.12
    };

    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        }
      });
    }, observerOptions);

    revealElements.forEach(el => observer.observe(el));
  }

  /* --------------------------------------------------------------------------
     4. ANIMATED METRIC COUNTERS
     -------------------------------------------------------------------------- */
  function initCounters() {
    const counterElements = document.querySelectorAll('[data-counter-target]');
    if (!counterElements.length) return;

    if (prefersReducedMotion) {
      counterElements.forEach(el => {
        el.textContent = el.getAttribute('data-counter-target');
      });
      return;
    }

    const counterObserver = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const target = parseFloat(el.getAttribute('data-counter-target'));
          const decimals = parseInt(el.getAttribute('data-counter-decimals') || '0', 10);
          const duration = 1600; // ms
          const startTimestamp = performance.now();

          function step(now) {
            const progress = Math.min((now - startTimestamp) / duration, 1);
            const easeOut = 1 - Math.pow(1 - progress, 3);
            const current = (target * easeOut).toFixed(decimals);
            el.textContent = current;

            if (progress < 1) {
              requestAnimationFrame(step);
            } else {
              el.textContent = target.toFixed(decimals);
            }
          }

          requestAnimationFrame(step);
          obs.unobserve(el);
        }
      });
    }, { threshold: 0.2 });

    counterElements.forEach(el => counterObserver.observe(el));
  }

  /* --------------------------------------------------------------------------
     5. TESTIMONIALS CAROUSEL
     -------------------------------------------------------------------------- */
  function initTestimonialsCarousel() {
    const slider = document.querySelector('.testimonials-carousel-wrap');
    if (!slider) return;

    const track = slider.querySelector('.testimonial-track');
    const prevBtn = slider.querySelector('.carousel-btn-prev');
    const nextBtn = slider.querySelector('.carousel-btn-next');
    const cards = slider.querySelectorAll('.testimonial-card');

    if (!track || !cards.length || !prevBtn || !nextBtn) return;

    let currentIndex = 0;
    const totalCards = cards.length;

    function updateCarousel() {
      const cardWidth = cards[0].offsetWidth + 32;
      track.scrollTo({
        left: currentIndex * cardWidth,
        behavior: 'smooth'
      });
    }

    prevBtn.addEventListener('click', () => {
      currentIndex = Math.max(0, currentIndex - 1);
      updateCarousel();
    });

    nextBtn.addEventListener('click', () => {
      currentIndex = Math.min(totalCards - 1, currentIndex + 1);
      updateCarousel();
    });
  }

  /* --------------------------------------------------------------------------
     6. TAB SWITCHER ANIMATIONS
     -------------------------------------------------------------------------- */
  function initTabs() {
    const tabContainers = document.querySelectorAll('[data-tabs]');
    tabContainers.forEach(container => {
      const buttons = container.querySelectorAll('[data-tab-target]');
      const panes = container.querySelectorAll('[data-tab-pane]');

      buttons.forEach(btn => {
        btn.addEventListener('click', () => {
          const target = btn.getAttribute('data-tab-target');

          buttons.forEach(b => b.classList.remove('is-active', 'active'));
          panes.forEach(p => {
            p.classList.remove('is-active', 'active');
            p.style.display = 'none';
          });

          btn.classList.add('is-active', 'active');
          const activePane = container.querySelector(`[data-tab-pane="${target}"]`);
          if (activePane) {
            activePane.style.display = 'block';
            activePane.classList.add('is-active', 'active');
          }
        });
      });
    });
  }

  /* --------------------------------------------------------------------------
     7. SCREENSHOT 2: PERSPECTIVE COVERFLOW SHOWCASE WITH ZOOM & ACTIVE CONTENT
     -------------------------------------------------------------------------- */
  function initPerspectiveShowcase() {
    const section = document.querySelector('.perspective-showcase-section');
    if (!section) return;

    const cards = Array.from(section.querySelectorAll('.perspective-card-item'));
    const cardsRow = section.querySelector('.perspective-cards-row');
    const detailsWrap = section.querySelector('.perspective-active-details');
    const prevBtn = section.querySelector('.perspective-ctrl-btn--prev');
    const nextBtn = section.querySelector('.perspective-ctrl-btn--next');

    if (!cards.length) return;

    // Start with middle item active (index 2 for 5 cards)
    let activeIdx = Math.floor(cards.length / 2);

    function updateShowcase(newIndex) {
      if (newIndex < 0) newIndex = 0;
      if (newIndex >= cards.length) newIndex = cards.length - 1;
      activeIdx = newIndex;

      // Translate row so active item glides smoothly into the center
      if (cardsRow && cards[activeIdx]) {
        const defaultCenterIdx = Math.floor(cards.length / 2);
        const shiftFactor = defaultCenterIdx - activeIdx;
        const gap = window.innerWidth <= 768 ? 12 : 20;
        const cardStep = cards[activeIdx].offsetWidth + gap;
        cardsRow.style.transform = `translateX(${shiftFactor * cardStep}px)`;
      }

      cards.forEach((card, i) => {
        const offset = i - activeIdx;
        const absOffset = Math.abs(offset);

        card.classList.remove('is-active');

        if (offset === 0) {
          card.classList.add('is-active');
          card.style.transform = 'scale(1.08) translateZ(0)';
          card.style.opacity = '1';
          card.style.zIndex = '10';
        } else if (absOffset === 1) {
          card.style.transform = `scale(0.88) translateX(${offset * 10}px)`;
          card.style.opacity = '0.55';
          card.style.zIndex = '5';
        } else {
          card.style.transform = `scale(0.72) translateX(${offset * 15}px)`;
          card.style.opacity = '0.28';
          card.style.zIndex = '1';
        }
      });

      // Update Active Content Details Box (Display only for center item)
      if (detailsWrap) {
        const activeCard = cards[activeIdx];
        const badgeText = activeCard.getAttribute('data-badge') || 'PLATFORM CAPABILITY';
        const titleText = activeCard.getAttribute('data-title') || 'Next-Gen Cloud Architecture';
        const descText = activeCard.getAttribute('data-desc') || 'Architected for enterprise scale with surgical reliability and real-time observability.';
        const linkUrl = activeCard.getAttribute('data-link') || './services.html';

        detailsWrap.style.opacity = '0';
        detailsWrap.style.transform = 'translateY(8px)';

        setTimeout(() => {
          const badgeEl = detailsWrap.querySelector('.badge span:last-child');
          const titleEl = detailsWrap.querySelector('h3');
          const descEl = detailsWrap.querySelector('p');
          const linkEl = detailsWrap.querySelector('a');

          if (badgeEl) badgeEl.textContent = badgeText;
          if (titleEl) titleEl.textContent = titleText;
          if (descEl) descEl.textContent = descText;
          if (linkEl) linkEl.href = linkUrl;

          detailsWrap.style.opacity = '1';
          detailsWrap.style.transform = 'translateY(0)';
        }, 180);
      }
    }

    // Click to select
    cards.forEach((card, i) => {
      card.addEventListener('click', () => updateShowcase(i));
    });

    if (prevBtn) {
      prevBtn.addEventListener('click', () => updateShowcase(activeIdx - 1));
    }
    if (nextBtn) {
      nextBtn.addEventListener('click', () => updateShowcase(activeIdx + 1));
    }

    // Scroll-triggered Coverflow Zoom & Slide
    let lastWheelTime = 0;
    section.addEventListener('wheel', (e) => {
      const now = Date.now();
      if (now - lastWheelTime > 450) {
        if (Math.abs(e.deltaY) > 25 || Math.abs(e.deltaX) > 25) {
          const delta = e.deltaY > 0 || e.deltaX > 0 ? 1 : -1;
          const target = activeIdx + delta;
          if (target >= 0 && target < cards.length) {
            updateShowcase(target);
            lastWheelTime = now;
          }
        }
      }
    }, { passive: true });

    // Touch swipe support for mobile
    let touchStartX = 0;
    let touchEndX = 0;
    section.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    section.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      const swipeDiff = touchEndX - touchStartX;
      if (Math.abs(swipeDiff) > 40) {
        if (swipeDiff < 0) {
          updateShowcase(activeIdx + 1); // Swipe left -> next
        } else {
          updateShowcase(activeIdx - 1); // Swipe right -> prev
        }
      }
    }, { passive: true });

    // Recalculate on window resize
    window.addEventListener('resize', () => {
      updateShowcase(activeIdx);
    });

    // Initial render
    updateShowcase(activeIdx);
  }

  /* --------------------------------------------------------------------------
     8. SCREENSHOT 3: FULL-WIDTH PARALLAX STATEMENT BANNER
     -------------------------------------------------------------------------- */
  function initParallaxStatement() {
    const banner = document.querySelector('.statement-banner-section');
    if (!banner || prefersReducedMotion) return;

    const bg = banner.querySelector('.statement-banner-bg');
    if (!bg) return;

    function handleScroll() {
      const rect = banner.getBoundingClientRect();
      const winHeight = window.innerHeight;

      if (rect.top <= winHeight && rect.bottom >= 0) {
        const progress = (winHeight - rect.top) / (winHeight + rect.height);
        const translateY = (progress - 0.5) * 60; // Parallax translate
        const scale = 1.05 + progress * 0.08;     // Parallax zoom
        bg.style.transform = `translate3d(0, ${translateY.toFixed(1)}px, 0) scale(${scale.toFixed(3)})`;
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
  }

  /* --------------------------------------------------------------------------
     9. SCREENSHOT 4: CONCENTRIC ORBIT RINGS & POPPING OUT BALLS
     -------------------------------------------------------------------------- */
  function initOrbitBallsAnimation() {
    const stage = document.querySelector('.orbit-stage-container');
    if (!stage) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          stage.classList.add('is-animated');
        }
      });
    }, { threshold: 0.25 });

    observer.observe(stage);
  }

  /* --------------------------------------------------------------------------
     INITIALIZE ON DOM READY
     -------------------------------------------------------------------------- */
  document.addEventListener('DOMContentLoaded', () => {
    initLenis();
    init3DTiltAndGlow();
    initScrollReveals();
    initCounters();
    initTestimonialsCarousel();
    initTabs();
    initPerspectiveShowcase();
    initParallaxStatement();
    initOrbitBallsAnimation();
  });

})();


