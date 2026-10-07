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
     3. INTERSECTION OBSERVER FOR SCROLL REVEALS (RE-TRIGGERS EVERY TIME)
     -------------------------------------------------------------------------- */
  function initScrollReveals() {
    const revealElements = document.querySelectorAll(
      '.reveal, .slide-up, .slide-left, .slide-right, .smooth-fade-up, .smooth-slide-left, .smooth-slide-right, .smooth-scale-in'
    );
    if (!revealElements.length) return;

    if (prefersReducedMotion) {
      revealElements.forEach(el => el.classList.add('is-visible'));
      return;
    }

    const observerOptions = {
      root: null,
      rootMargin: '0px 0px -6% 0px',
      threshold: 0.12
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
        } else {
          // Re-trigger every time: remove is-visible when element leaves viewport
          const rect = entry.target.getBoundingClientRect();
          if (rect.top > window.innerHeight || rect.bottom < 0) {
            entry.target.classList.remove('is-visible');
          }
        }
      });
    }, observerOptions);

    revealElements.forEach(el => observer.observe(el));
  }

  /* --------------------------------------------------------------------------
     4. ANIMATED METRIC COUNTERS (RE-TRIGGERS EVERY TIME SECTION APPEARS)
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

    function runCounter(el) {
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
    }

    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          runCounter(entry.target);
        } else {
          // Reset to 0 so counter animates freshly every time section reappears
          const decimals = parseInt(entry.target.getAttribute('data-counter-decimals') || '0', 10);
          entry.target.textContent = (0).toFixed(decimals);
        }
      });
    }, { threshold: 0.18 });

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
        } else {
          stage.classList.remove('is-animated');
        }
      });
    }, { threshold: 0.25 });

    observer.observe(stage);
  }

  /* --------------------------------------------------------------------------
     10. ARCHITECTURAL CODE: HORIZONTAL CARD STACK ANIMATION (STICKY SCROLL)
     -------------------------------------------------------------------------- */
  function initPrinciplesCardStack() {
    const section = document.getElementById('engineeringPrinciples');
    const stickyViewport = document.getElementById('principlesStickyViewport');
    const stage = document.getElementById('principlesStackStage');
    const deck = document.getElementById('principlesDeck');
    if (!section || !stage || !deck) return;

    const cards = Array.from(deck.querySelectorAll('.horizontal-stack-card'));
    if (!cards.length) return;

    const prevBtn = document.getElementById('principlesPrevBtn');
    const nextBtn = document.getElementById('principlesNextBtn');
    const currentNumEl = document.getElementById('principlesCurrentIndex');
    const totalNumEl = document.querySelector('.principles-counter__total');
    const progressFill = document.getElementById('principlesProgressFill');
    const tabs = Array.from(document.querySelectorAll('[data-principle-tab]'));

    let currentIndex = 0;
    const totalCards = cards.length;
    let isNavigating = false;

    if (totalNumEl) {
      totalNumEl.textContent = String(totalCards).padStart(2, '0');
    }

    // Dynamic deck height calculation so no card gets clipped on any screen size
    function updateDeckHeight() {
      let maxHeight = 0;
      cards.forEach(card => {
        const inner = card.querySelector('.principle-card');
        if (inner) {
          const h = inner.offsetHeight;
          if (h > maxHeight) maxHeight = h;
        }
      });
      if (maxHeight > 0) {
        deck.style.minHeight = `${maxHeight + 20}px`;
        stage.style.minHeight = `${maxHeight + 40}px`;
      }
    }

    function updateStack(newIndex, animate = true) {
      if (newIndex < 0) newIndex = totalCards - 1;
      if (newIndex >= totalCards) newIndex = 0;

      currentIndex = newIndex;

      const isReduced = prefersReducedMotion;
      const isMobile = window.innerWidth <= 768;
      const isTablet = window.innerWidth <= 1024 && !isMobile;

      const stepX = isMobile ? 14 : (isTablet ? 38 : 56);
      const stepY = isMobile ? 2 : 4;
      const stepScale = isMobile ? 0.03 : 0.045;
      const stepRotate = isMobile ? 0.4 : 0.8;

      cards.forEach((card, i) => {
        const offset = i - currentIndex;
        const inner = card.querySelector('.principle-card');

        card.classList.remove('is-active', 'is-passed', 'is-upcoming');

        if (isReduced) {
          if (offset === 0) {
            card.classList.add('is-active');
            card.setAttribute('aria-hidden', 'false');
            card.style.transform = 'none';
            card.style.opacity = '1';
            card.style.zIndex = '30';
            card.style.pointerEvents = 'auto';
            card.style.visibility = 'visible';
          } else {
            card.setAttribute('aria-hidden', 'true');
            card.style.transform = 'none';
            card.style.opacity = '0';
            card.style.zIndex = '1';
            card.style.pointerEvents = 'none';
            card.style.visibility = 'hidden';
          }
          return;
        }

        if (offset === 0) {
          // ACTIVE FRONT CARD
          card.classList.add('is-active');
          card.setAttribute('aria-hidden', 'false');
          card.style.transform = `translate3d(0px, 0px, 0px) scale(1) rotate(0deg)`;
          card.style.opacity = '1';
          card.style.zIndex = '30';
          card.style.pointerEvents = 'auto';
          card.style.visibility = 'visible';
          card.style.filter = 'drop-shadow(0 20px 30px rgba(184, 130, 79, 0.16))';
          if (inner) inner.style.cursor = 'default';
        } else if (offset > 0) {
          // UPCOMING STACKED TO THE RIGHT
          card.classList.add('is-upcoming');
          card.setAttribute('aria-hidden', 'true');
          const tx = offset * stepX;
          const ty = offset * stepY;
          const sc = Math.max(0.82, 1 - (offset * stepScale));
          const rot = offset * stepRotate;
          const op = Math.max(0.42, 1 - (offset * 0.18));
          const z = 25 - offset;

          card.style.transform = `translate3d(${tx}px, ${ty}px, -${offset * 20}px) scale(${sc}) rotate(${rot}deg)`;
          card.style.opacity = String(op);
          card.style.zIndex = String(z);
          card.style.pointerEvents = 'auto';
          card.style.visibility = 'visible';
          card.style.filter = 'none';
          if (inner) inner.style.cursor = 'pointer';
        } else {
          // PASSED TO THE LEFT
          card.classList.add('is-passed');
          card.setAttribute('aria-hidden', 'true');
          const exitDist = isMobile ? -108 : -115;
          card.style.transform = `translate3d(${exitDist}%, -10px, -50px) scale(0.92) rotate(-3.5deg)`;
          card.style.opacity = '0';
          card.style.zIndex = String(10 + offset);
          card.style.pointerEvents = 'none';
          card.style.visibility = 'hidden';
          card.style.filter = 'none';
          if (inner) inner.style.cursor = 'default';
        }
      });

      // Update counter
      if (currentNumEl) {
        currentNumEl.textContent = String(currentIndex + 1).padStart(2, '0');
      }

      // Update progress bar fill
      if (progressFill) {
        const pct = ((currentIndex + 1) / totalCards) * 100;
        progressFill.style.width = `${pct}%`;
      }

      // Update tab buttons
      tabs.forEach((tab, idx) => {
        const isActive = (idx === currentIndex);
        tab.classList.toggle('is-active', isActive);
        tab.setAttribute('aria-selected', isActive ? 'true' : 'false');
      });
    }

    // Scroll-Linked Sticky Pinning: section stays pinned until all cards complete
    function handleStickyScroll() {
      const rect = section.getBoundingClientRect();
      const scrollableDistance = section.offsetHeight - window.innerHeight;
      if (scrollableDistance <= 0) return;

      const currentScroll = -rect.top;
      const progress = Math.max(0, Math.min(1, currentScroll / scrollableDistance));

      // Dual Pinning Controller: Enforce fixed pin to guarantee section NEVER scrolls away prematurely
      if (stickyViewport) {
        if (rect.top <= 0 && rect.bottom >= window.innerHeight) {
          // Inside sticky zone: securely pinned to viewport
          stickyViewport.style.position = 'fixed';
          stickyViewport.style.top = '0px';
          stickyViewport.style.left = '0px';
          stickyViewport.style.width = '100%';
          stickyViewport.style.height = '100vh';
          stickyViewport.style.zIndex = '35';
        } else if (rect.bottom < window.innerHeight) {
          // Fully scrolled through: unpin and anchor at bottom of section
          stickyViewport.style.position = 'absolute';
          stickyViewport.style.top = 'auto';
          stickyViewport.style.bottom = '0px';
          stickyViewport.style.left = '0px';
          stickyViewport.style.width = '100%';
          stickyViewport.style.height = '100vh';
          stickyViewport.style.zIndex = '10';
        } else {
          // Above section: rest at the top of section
          stickyViewport.style.position = 'absolute';
          stickyViewport.style.top = '0px';
          stickyViewport.style.bottom = 'auto';
          stickyViewport.style.left = '0px';
          stickyViewport.style.width = '100%';
          stickyViewport.style.height = '100vh';
          stickyViewport.style.zIndex = '10';
        }
      }

      if (isNavigating) return;

      if (rect.top <= 10 && rect.bottom >= window.innerHeight - 10) {
        // Step smoothly through cards based on scroll progress
        let targetIdx = Math.floor(progress * totalCards);
        if (targetIdx >= totalCards) targetIdx = totalCards - 1;

        if (targetIdx !== currentIndex) {
          updateStack(targetIdx, true);
        }
      } else if (rect.top > 10) {
        if (currentIndex !== 0) updateStack(0, false);
      } else if (rect.bottom < window.innerHeight - 10) {
        if (currentIndex !== totalCards - 1) updateStack(totalCards - 1, false);
      }
    }

    window.addEventListener('scroll', handleStickyScroll, { passive: true });
    if (window.__lenis) {
      window.__lenis.on('scroll', handleStickyScroll);
    }

    // Programmatic navigation to card (syncs scroll position within sticky section)
    function navigateToCard(targetIdx) {
      if (targetIdx < 0) targetIdx = 0;
      if (targetIdx >= totalCards) targetIdx = totalCards - 1;

      updateStack(targetIdx, true);

      const rect = section.getBoundingClientRect();
      const scrollableDistance = section.offsetHeight - window.innerHeight;
      if (scrollableDistance > 0) {
        const sectionScrollTop = window.scrollY + rect.top;
        const segmentProgress = targetIdx / (totalCards - 1);
        const targetScrollY = sectionScrollTop + (segmentProgress * scrollableDistance);

        isNavigating = true;
        if (window.__lenis && typeof window.__lenis.scrollTo === 'function') {
          window.__lenis.scrollTo(targetScrollY, {
            duration: 0.85,
            onComplete: () => { isNavigating = false; }
          });
          setTimeout(() => { isNavigating = false; }, 900);
        } else {
          window.scrollTo({ top: targetScrollY, behavior: 'smooth' });
          setTimeout(() => { isNavigating = false; }, 850);
        }
      }
    }

    // Tab navigation
    tabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        const targetIdx = parseInt(tab.getAttribute('data-principle-tab'), 10);
        if (!isNaN(targetIdx)) {
          navigateToCard(targetIdx);
        }
      });
    });

    // Arrow button navigation
    if (prevBtn) {
      prevBtn.addEventListener('click', () => navigateToCard(currentIndex - 1));
    }
    if (nextBtn) {
      nextBtn.addEventListener('click', () => navigateToCard(currentIndex + 1));
    }

    // Direct card click: clicking any stacked upcoming card brings it to the front!
    cards.forEach((card, i) => {
      card.addEventListener('click', (e) => {
        if (i !== currentIndex) {
          e.preventDefault();
          navigateToCard(i);
        }
      });
    });

    // Keyboard Arrow navigation when stage is focused
    stage.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        navigateToCard(currentIndex + 1);
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        navigateToCard(currentIndex - 1);
      }
    });

    // Touch Swipe gestures (Mobile & Tablet)
    let touchStartX = 0;
    let touchStartY = 0;
    let isSwiping = false;

    stage.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
      touchStartY = e.changedTouches[0].screenY;
      isSwiping = true;
    }, { passive: true });

    stage.addEventListener('touchend', (e) => {
      if (!isSwiping) return;
      isSwiping = false;
      const touchEndX = e.changedTouches[0].screenX;
      const touchEndY = e.changedTouches[0].screenY;
      const diffX = touchEndX - touchStartX;
      const diffY = touchEndY - touchStartY;

      if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 36) {
        if (diffX < 0) {
          navigateToCard(currentIndex + 1); // Swipe left -> Next
        } else {
          navigateToCard(currentIndex - 1); // Swipe right -> Prev
        }
      }
    }, { passive: true });

    // Recalculate on window resize
    let resizeTimer = null;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        updateDeckHeight();
        updateStack(currentIndex, false);
      }, 100);
    });

    // Initial render
    setTimeout(updateDeckHeight, 100);
    updateStack(0, false);
  }

  /* --------------------------------------------------------------------------
     11. EXECUTION METHODOLOGY: 3D HOLOGRAPHIC PARALLAX & HUD TELEMETRY ANIMATION
     -------------------------------------------------------------------------- */
  function initMethodologyHologramDepth() {
    const cards = document.querySelectorAll('[data-method-card]');
    if (!cards.length || prefersReducedMotion) return;

    cards.forEach(card => {
      const img = card.querySelector('.method-img');
      const hudMetric = card.querySelector('.method-hud-metric');
      const telemetryEl = card.querySelector('.method-hud-telemetry');
      let rafId = null;

      card.addEventListener('mousemove', (e) => {
        if (window.innerWidth <= 768) return;
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotX = -((y - centerY) / centerY) * 9;
        const rotY = ((x - centerX) / centerX) * 9;

        if (rafId) cancelAnimationFrame(rafId);
        rafId = requestAnimationFrame(() => {
          card.style.transform = `perspective(850px) rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg) translateY(-8px)`;
          if (img) {
            img.style.transform = `scale(1.1) translate3d(${(-rotY * 0.85).toFixed(1)}px, ${(-rotX * 0.85).toFixed(1)}px, -10px)`;
          }
          if (hudMetric) {
            hudMetric.style.transform = `translate3d(${(rotY * 1.1).toFixed(1)}px, ${(rotX * 1.1).toFixed(1)}px, 20px)`;
          }
          if (telemetryEl) {
            telemetryEl.style.transform = `translate3d(${(rotY * 0.8).toFixed(1)}px, ${(rotX * 0.8).toFixed(1)}px, 15px)`;
          }
        });
      });

      card.addEventListener('mouseleave', () => {
        if (rafId) cancelAnimationFrame(rafId);
        card.style.transition = 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.5s ease, border-color 0.35s ease';
        card.style.transform = '';
        if (img) {
          img.style.transition = 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)';
          img.style.transform = '';
        }
        if (hudMetric) {
          hudMetric.style.transition = 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)';
          hudMetric.style.transform = '';
        }
        if (telemetryEl) {
          telemetryEl.style.transition = 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)';
          telemetryEl.style.transform = '';
        }
        setTimeout(() => {
          card.style.transition = '';
          if (img) img.style.transition = '';
          if (hudMetric) hudMetric.style.transition = '';
          if (telemetryEl) telemetryEl.style.transition = '';
        }, 500);
      });
    });
  }

  /* --------------------------------------------------------------------------
     12. SYSTEMS BLOG: PODCAST AUDIO WAVEFORM PLAYER & PLAYLIST CONTROLLER
     -------------------------------------------------------------------------- */
  function initPodcastAudioPlayer() {
    const playBtn = document.getElementById('podcastPlayBtn');
    const playIcon = document.getElementById('podcastPlayIcon');
    const waveform = document.getElementById('audioWaveformVisualizer');
    const scrubTrack = document.getElementById('podcastScrubTrack');
    const scrubFill = document.getElementById('podcastScrubFill');
    const timeDisplay = document.getElementById('podcastCurrentTime');
    const playlistItems = document.querySelectorAll('.playlist-item');
    const speedBtns = document.querySelectorAll('.speed-btn');

    if (!playBtn) return;

    let isPlaying = false;
    let timerInterval = null;
    let currentSeconds = 14 * 60 + 28; // Start at 14:28
    const totalSeconds = 42 * 60 + 15; // 42:15

    function formatTime(secs) {
      const m = Math.floor(secs / 60);
      const s = Math.floor(secs % 60);
      return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    }

    function togglePlayback(state) {
      isPlaying = (typeof state === 'boolean') ? state : !isPlaying;

      if (isPlaying) {
        if (playIcon) playIcon.textContent = 'pause';
        playBtn.classList.add('is-playing');
        if (waveform) {
          waveform.querySelectorAll('.waveform-bar').forEach(b => {
            b.style.animationPlayState = 'running';
          });
        }

        clearInterval(timerInterval);
        timerInterval = setInterval(() => {
          if (currentSeconds < totalSeconds) {
            currentSeconds++;
            if (timeDisplay) timeDisplay.textContent = formatTime(currentSeconds);
            if (scrubFill) {
              const pct = (currentSeconds / totalSeconds) * 100;
              scrubFill.style.width = `${pct.toFixed(2)}%`;
            }
          } else {
            togglePlayback(false);
          }
        }, 1000);
      } else {
        if (playIcon) playIcon.textContent = 'play_arrow';
        playBtn.classList.remove('is-playing');
        if (waveform) {
          waveform.querySelectorAll('.waveform-bar').forEach(b => {
            b.style.animationPlayState = 'paused';
          });
        }
        clearInterval(timerInterval);
      }
    }

    // Set initial paused state
    if (waveform) {
      waveform.querySelectorAll('.waveform-bar').forEach(b => {
        b.style.animationPlayState = 'paused';
      });
    }

    playBtn.addEventListener('click', () => togglePlayback());

    // Interactive scrub seek
    if (scrubTrack) {
      scrubTrack.addEventListener('click', (e) => {
        const rect = scrubTrack.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const pct = Math.max(0, Math.min(1, clickX / rect.width));
        currentSeconds = Math.floor(pct * totalSeconds);
        if (timeDisplay) timeDisplay.textContent = formatTime(currentSeconds);
        if (scrubFill) scrubFill.style.width = `${(pct * 100).toFixed(2)}%`;
      });
    }

    // Playback speed buttons
    speedBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        speedBtns.forEach(b => b.classList.remove('is-active'));
        btn.classList.add('is-active');
      });
    });

    // Playlist selector
    playlistItems.forEach(item => {
      item.addEventListener('click', () => {
        playlistItems.forEach(p => {
          p.classList.remove('is-playing');
          const icon = p.querySelector('.playlist-action-icon');
          if (icon) icon.textContent = 'play_circle';
        });
        item.classList.add('is-playing');
        const activeIcon = item.querySelector('.playlist-action-icon');
        if (activeIcon) activeIcon.textContent = 'graphic_eq';
        currentSeconds = 0;
        togglePlayback(true);
      });
    });
  }

  /* --------------------------------------------------------------------------
     13. SYSTEMS BLOG: WHITEPAPER HUD PARALLAX TRACKING
     -------------------------------------------------------------------------- */
  function initWhitepaperHudTracking() {
    const cards = document.querySelectorAll('[data-whitepaper-card]');
    if (!cards.length || prefersReducedMotion) return;

    cards.forEach(card => {
      const coords = card.querySelector('.whitepaper-coords');
      card.addEventListener('mousemove', (e) => {
        if (coords) {
          const rect = card.getBoundingClientRect();
          const relX = Math.round((e.clientX - rect.left) / 10);
          const relY = Math.round((e.clientY - rect.top) / 10);
          coords.textContent = `HEX ${relX.toString(16).toUpperCase()}:${relY.toString(16).toUpperCase()} · LIVE`;
        }
      });
      card.addEventListener('mouseleave', () => {
        if (coords && coords.hasAttribute('data-default')) {
          coords.textContent = coords.getAttribute('data-default');
        }
      });
    });
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
    initPrinciplesCardStack();
    initMethodologyHologramDepth();
    initPodcastAudioPlayer();
    initWhitepaperHudTracking();
  });

})();


