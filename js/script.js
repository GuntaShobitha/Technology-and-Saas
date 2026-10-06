/**
 * STACKLY Technology & SaaS — Global Interaction Script
 * Clean Vanilla JavaScript · Zero Dependencies · Accessible
 */

(function () {
  'use strict';

  /* --------------------------------------------------------------------------
     1. PRELOADER CONTROLLER (Guaranteed 1.2s - 1.6s, max 2.0s failsafe)
     -------------------------------------------------------------------------- */
  function initPreloader() {
    const preloader = document.getElementById('sitePreloader');
    if (!preloader) return;

    const progressBar = preloader.querySelector('.preloader-progress');
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      preloader.classList.add('is-hidden');
      document.body.classList.remove('is-locked');
      return;
    }

    let progress = 10;
    const startTime = performance.now();
    const targetDuration = 1350; // 1.35 seconds target

    const interval = setInterval(() => {
      const elapsed = performance.now() - startTime;
      const pct = Math.min(100, Math.floor((elapsed / targetDuration) * 100));
      progress = Math.max(progress, pct);

      if (progressBar) {
        progressBar.style.width = progress + '%';
      }

      if (progress >= 100) {
        clearInterval(interval);
        setTimeout(dismissPreloader, 180);
      }
    }, 40);

    function dismissPreloader() {
      preloader.classList.add('is-hidden');
      document.body.classList.remove('is-locked');
      setTimeout(() => {
        if (preloader.parentNode) {
          preloader.style.display = 'none';
        }
      }, 500);
    }

    // Absolute fallback: maximum 2000ms
    setTimeout(() => {
      clearInterval(interval);
      dismissPreloader();
    }, 2000);
  }

  /* --------------------------------------------------------------------------
     2. STICKY HEADER WITH COMPACT-ON-SCROLL
     -------------------------------------------------------------------------- */
  function initStickyHeader() {
    const header = document.querySelector('.site-header');
    if (!header) return;

    let lastScrollY = window.scrollY;

    function handleScroll() {
      const currentScrollY = window.scrollY;
      if (currentScrollY > 30) {
        header.classList.add('is-compact');
      } else {
        header.classList.remove('is-compact');
      }
      lastScrollY = currentScrollY;
    }

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
  }

  /* --------------------------------------------------------------------------
     3. MOBILE NAVIGATION DRAWER
     -------------------------------------------------------------------------- */
  function initMobileMenu() {
    const menuBtn = document.getElementById('menuToggle');
    const drawer = document.getElementById('mobileDrawer');
    const closeBtn = document.getElementById('drawerClose');
    const drawerLinks = drawer ? drawer.querySelectorAll('a') : [];

    if (!menuBtn || !drawer) return;

    function openMenu() {
      drawer.classList.add('is-open');
      drawer.setAttribute('aria-hidden', 'false');
      menuBtn.setAttribute('aria-expanded', 'true');
      document.body.classList.add('is-locked');
    }

    function closeMenu() {
      drawer.classList.remove('is-open');
      drawer.setAttribute('aria-hidden', 'true');
      menuBtn.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('is-locked');
    }

    menuBtn.addEventListener('click', openMenu);

    if (closeBtn) {
      closeBtn.addEventListener('click', closeMenu);
    }

    drawerLinks.forEach(link => {
      link.addEventListener('click', closeMenu);
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && drawer.classList.contains('is-open')) {
        closeMenu();
      }
    });
  }

  /* --------------------------------------------------------------------------
     4. FAQ ACCORDION (Contact page & Inner sections)
     -------------------------------------------------------------------------- */
  function initAccordions() {
    const accordionTriggers = document.querySelectorAll('.faq-trigger');

    accordionTriggers.forEach(trigger => {
      trigger.addEventListener('click', () => {
        const item = trigger.closest('.faq-item');
        const content = item.querySelector('.faq-content');
        const isOpen = item.classList.contains('is-open');

        // Close siblings if in accordion group
        const group = trigger.closest('.faq-list');
        if (group) {
          group.querySelectorAll('.faq-item').forEach(sibling => {
            if (sibling !== item) {
              sibling.classList.remove('is-open');
              const sibTrigger = sibling.querySelector('.faq-trigger');
              const sibContent = sibling.querySelector('.faq-content');
              if (sibTrigger) sibTrigger.setAttribute('aria-expanded', 'false');
              if (sibContent) sibContent.style.maxHeight = null;
            }
          });
        }

        if (isOpen) {
          item.classList.remove('is-open');
          trigger.setAttribute('aria-expanded', 'false');
          if (content) content.style.maxHeight = null;
        } else {
          item.classList.add('is-open');
          trigger.setAttribute('aria-expanded', 'true');
          if (content) content.style.maxHeight = content.scrollHeight + 'px';
        }
      });
    });
  }

  /* --------------------------------------------------------------------------
     5. BLOG CATEGORY FILTERS
     -------------------------------------------------------------------------- */
  function initBlogFilters() {
    const filterPills = document.querySelectorAll('.blog-filter-btn');
    const blogCards = document.querySelectorAll('.blog-card-item');

    if (!filterPills.length || !blogCards.length) return;

    filterPills.forEach(btn => {
      btn.addEventListener('click', () => {
        filterPills.forEach(b => b.classList.remove('is-active'));
        btn.classList.add('is-active');

        const category = btn.getAttribute('data-category');

        blogCards.forEach(card => {
          const cardCat = card.getAttribute('data-category');
          if (category === 'all' || cardCat === category) {
            card.style.display = 'flex';
          } else {
            card.style.display = 'none';
          }
        });
      });
    });
  }

  /* --------------------------------------------------------------------------
     6. CONTACT FORM VALIDATION & INTERACTION
     -------------------------------------------------------------------------- */
  function initContactForm() {
    const form = document.getElementById('contactForm');
    if (!form) return;

    const successBox = document.getElementById('formSuccessMessage');

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      let isValid = true;
      const inputs = form.querySelectorAll('input[required], select[required], textarea[required]');

      inputs.forEach(input => {
        const errorEl = form.querySelector(`#error-${input.name}`);
        if (!input.value.trim()) {
          isValid = false;
          input.classList.add('has-error');
          if (errorEl) errorEl.style.display = 'block';
        } else {
          input.classList.remove('has-error');
          if (errorEl) errorEl.style.display = 'none';
        }

        // Email validation
        if (input.type === 'email' && input.value.trim()) {
          const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailPattern.test(input.value.trim())) {
            isValid = false;
            input.classList.add('has-error');
            if (errorEl) {
              errorEl.textContent = 'Please enter a valid business email address.';
              errorEl.style.display = 'block';
            }
          }
        }
      });

      const consentBox = form.querySelector('input[name="consent"]');
      if (consentBox && !consentBox.checked) {
        isValid = false;
        const consentError = form.querySelector('#error-consent');
        if (consentError) consentError.style.display = 'block';
      }

      if (isValid) {
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn ? submitBtn.innerHTML : '';
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.innerHTML = '<span class="material-symbols-outlined">sync</span> Processing...';
        }

        setTimeout(() => {
          form.reset();
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
          }
          if (successBox) {
            successBox.style.display = 'block';
            successBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }
        }, 900);
      }
    });
  }

  /* --------------------------------------------------------------------------
     7. PASSWORD VISIBILITY TOGGLE (Login page)
     -------------------------------------------------------------------------- */
  function initPasswordToggles() {
    const toggles = document.querySelectorAll('.toggle-password-btn');

    toggles.forEach(toggle => {
      toggle.addEventListener('click', () => {
        const targetId = toggle.getAttribute('data-target');
        const input = document.getElementById(targetId);
        const icon = toggle.querySelector('.material-symbols-outlined');

        if (input) {
          if (input.type === 'password') {
            input.type = 'text';
            if (icon) icon.textContent = 'visibility_off';
          } else {
            input.type = 'password';
            if (icon) icon.textContent = 'visibility';
          }
        }
      });
    });
  }

  /* --------------------------------------------------------------------------
     8. BACK TO TOP BUTTON
     -------------------------------------------------------------------------- */
  function initBackToTop() {
    const btn = document.getElementById('backToTopBtn');
    if (!btn) return;

    window.addEventListener('scroll', () => {
      if (window.scrollY > 400) {
        btn.classList.add('is-visible');
      } else {
        btn.classList.remove('is-visible');
      }
    }, { passive: true });

    btn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* --------------------------------------------------------------------------
     9. AUTH ROLE SWITCHER & DEMO FILL (Login & Register)
     -------------------------------------------------------------------------- */
  function initAuthRoleSwitcher() {
    const roleBtns = document.querySelectorAll('.role-switcher-btn');
    const roleNotice = document.getElementById('roleNotice');
    const roleBadge = document.getElementById('roleBadge');
    const roleDesc = document.getElementById('roleDesc');
    const roleVisualImg = document.getElementById('roleVisualImg');
    const roleVisualTitle = document.getElementById('roleVisualTitle');
    const roleVisualText = document.getElementById('roleVisualText');
    const roleFeaturesList = document.getElementById('roleFeaturesList');
    const emailInput = document.getElementById('authEmail');
    const passInput = document.getElementById('authPassword');
    const roleHiddenInput = document.getElementById('authRole');
    const quickFillBtn = document.getElementById('quickFillDemo');

    if (!roleBtns.length) return;

    const roleConfig = {
      user: {
        badge: 'Developer Workspace',
        badgeClass: 'role-badge--user',
        title: 'User & Developer Portal',
        desc: 'Log in to manage your microservices, view workspace logs, test APIs, and collaborate with your team.',
        visualTitle: 'Empower Your Engineering Workflow',
        visualText: 'Seamless access to cloud clusters, CI/CD telemetry, and personal developer API keys.',
        imgSrc: './assets/images/auth-user.webp',
        demoEmail: 'shobitha@gmail.com',
        demoPass: 'user123',
        features: [
          'Personal Cloud Sandbox with 99.9% uptime SLA',
          'Automated API Token Management & Webhook Triggers',
          'Real-time Team Collaboration & Microservice Debugging'
        ]
      },
      admin: {
        badge: 'Enterprise Administrator',
        badgeClass: 'role-badge--admin',
        title: 'Executive Admin Console',
        desc: 'Elevated zero-trust access for multi-cluster operations, RBAC policies, security posture audits, and billing governance.',
        visualTitle: 'Root Level Cluster Governance',
        visualText: 'Real-time threat telemetry, enterprise SSO, automated compliance reporting, and global infrastructure scaling.',
        imgSrc: './assets/images/auth-admin.webp',
        demoEmail: 'admin@nexi.tech',
        demoPass: 'admin123',
        features: [
          'Full Organization & Multi-Tenant RBAC Permissions',
          'SOC-2 / ISO-27001 Security Audit Log Streaming',
          'Global Infrastructure Autoscaling & Rate Control'
        ]
      }
    };

    function setRole(role) {
      const config = roleConfig[role];
      if (!config) return;

      roleBtns.forEach(btn => {
        if (btn.getAttribute('data-role') === role) {
          btn.classList.add('active');
        } else {
          btn.classList.remove('active');
        }
      });

      if (roleHiddenInput) roleHiddenInput.value = role;

      if (roleBadge) {
        roleBadge.textContent = config.badge;
        roleBadge.className = `role-badge ${config.badgeClass}`;
      }
      if (roleNotice) roleNotice.textContent = config.title;
      if (roleDesc) roleDesc.textContent = config.desc;
      if (roleVisualTitle) roleVisualTitle.textContent = config.visualTitle;
      if (roleVisualText) roleVisualText.textContent = config.visualText;
      if (roleVisualImg) {
        roleVisualImg.style.transition = 'opacity 0.2s ease';
        roleVisualImg.style.opacity = '0.3';
        setTimeout(() => {
          roleVisualImg.src = config.imgSrc;
          roleVisualImg.style.opacity = '1';
        }, 150);
      }

      if (roleFeaturesList) {
        roleFeaturesList.innerHTML = config.features.map(f => `
          <li style="display: flex; align-items: center; gap: 0.65rem; margin-bottom: 0.65rem; font-size: 0.88rem; color: var(--paper-sand);">
            <span class="pulse-dot ${role === 'admin' ? 'pulse-dot--amber' : 'pulse-dot--cyan'}"></span>
            <span>${f}</span>
          </li>
        `).join('');
      }
    }

    roleBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const role = btn.getAttribute('data-role');
        setRole(role);
      });
    });

    if (quickFillBtn) {
      quickFillBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const activeBtn = document.querySelector('.role-switcher-btn.active');
        const currentRole = activeBtn ? activeBtn.getAttribute('data-role') : 'user';
        const cfg = roleConfig[currentRole];
        if (emailInput) emailInput.value = cfg.demoEmail;
        if (passInput) passInput.value = cfg.demoPass;
      });
    }

    // Auth Form Submit Feedback with direct toast & auto-redirect (NO intermediate modal)
    const authForm = document.getElementById('authLoginForm');
    if (authForm) {
      authForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = emailInput && emailInput.value.trim() ? emailInput.value.trim() : 'shobitha@gmail.com';
        const activeBtn = document.querySelector('.role-switcher-btn.active');
        const currentRole = activeBtn ? activeBtn.getAttribute('data-role') : 'user';
        const submitBtn = authForm.querySelector('button[type="submit"]');
        const origText = submitBtn ? submitBtn.innerHTML : 'Sign In';

        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.innerHTML = '<span class="material-symbols-outlined" style="display:inline-block; animation: spin 1s linear infinite;">sync</span> Authenticating...';
        }

        // Save dynamically into localStorage
        if (window.Auth) {
          window.Auth.login(email, currentRole);
        } else {
          localStorage.setItem('userEmail', email);
          localStorage.setItem('userRole', currentRole);
          const rawName = email.split('@')[0].replace(/[._\-+]/g, ' ');
          const formattedName = rawName.charAt(0).toUpperCase() + rawName.slice(1);
          localStorage.setItem('userName', formattedName);
        }

        const resolvedUser = window.Auth ? window.Auth.getUser() : { name: email.split('@')[0] };

        // Show small success toast
        let toast = document.getElementById('authDirectToast');
        if (!toast) {
          toast = document.createElement('div');
          toast.id = 'authDirectToast';
          toast.style.position = 'fixed';
          toast.style.bottom = '2rem';
          toast.style.right = '2rem';
          toast.style.backgroundColor = '#13171d';
          toast.style.border = '1px solid #cca072';
          toast.style.color = '#ffffff';
          toast.style.padding = '0.9rem 1.4rem';
          toast.style.borderRadius = '8px';
          toast.style.boxShadow = '0 12px 36px rgba(0,0,0,0.6)';
          toast.style.display = 'flex';
          toast.style.alignItems = 'center';
          toast.style.gap = '0.75rem';
          toast.style.zIndex = '99999';
          toast.style.fontFamily = 'var(--font-body, sans-serif)';
          toast.style.fontSize = '0.92rem';
          document.body.appendChild(toast);
        }
        toast.innerHTML = `<span class="material-symbols-outlined" style="color:#4ade80; font-size:20px;">check_circle</span><span>Login successful. Welcome back, <strong>${resolvedUser.name}</strong>!</span>`;
        toast.style.opacity = '1';

        const targetUrl = currentRole === 'admin' ? './admin-dashboard.html' : './user-dashboard.html';

        // Keep message visible for 1–1.2 seconds, then automatically redirect
        setTimeout(() => {
          window.location.href = targetUrl;
        }, 1100);
      });
    }
  }

  /* --------------------------------------------------------------------------
     10. FOOTER NEWSLETTER DISPATCH HANDLER
     -------------------------------------------------------------------------- */
  function initNewsletterForms() {
    const forms = document.querySelectorAll('.newsletter-form');
    forms.forEach(form => {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const input = form.querySelector('.newsletter-input');
        const btn = form.querySelector('.newsletter-submit-btn');
        if (!input || !input.value.trim()) return;

        const origHtml = btn ? btn.innerHTML : 'Subscribe';
        if (btn) {
          btn.disabled = true;
          btn.innerHTML = '<span class="material-symbols-outlined" style="animation: spin 1s linear infinite;">sync</span>';
        }

        setTimeout(() => {
          if (btn) {
            btn.disabled = false;
            btn.innerHTML = '<span class="material-symbols-outlined">check</span>';
          }
          input.value = '';
          input.placeholder = 'Subscribed successfully!';
          setTimeout(() => {
            if (btn) btn.innerHTML = origHtml;
            input.placeholder = 'your.work@company.com';
          }, 2500);
        }, 600);
      });
    });
  }

  /* --------------------------------------------------------------------------
     11. INTERACTIVE FALLING PILLS / BALLS SHOWCASE (SCREENSHOT FEATURE)
     -------------------------------------------------------------------------- */
  function initFallingPillsShowcase() {
    const section = document.querySelector('.falling-pills-section');
    if (!section) return;

    // Trigger falling bounce on scroll
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          section.classList.add('is-in-view');
          observer.unobserve(section);
        }
      });
    }, { threshold: 0.15 });

    observer.observe(section);

    // Pill Data Registry
    const pillData = {
      integration: {
        title: 'Continuous Ecosystem Integration',
        badge: 'Unified Data Mesh',
        desc: 'Connect, synchronize, and orchestrate third-party SaaS services, microservices, and private enterprise endpoints into a single resilient pipeline.',
        img: './assets/images/service-api.webp',
        alt: 'High Throughput API Mesh Integration',
        m1Val: '99.99%', m1Lbl: 'Gateway SLA',
        m2Val: '250+', m2Lbl: 'Native Connectors',
        m3Val: '< 15ms', m3Lbl: 'Median Latency'
      },
      monitoring: {
        title: 'Real-Time Observability & Monitoring',
        badge: 'Distributed Telemetry',
        desc: 'End-to-end distributed system tracing, predictive cluster health telemetry, and autonomous anomaly detection across multi-region cloud infrastructures.',
        img: './assets/images/about-datacenter.webp',
        alt: 'Global Datacenter Monitoring Engine',
        m1Val: '24/7', m1Lbl: 'Autonomous Radar',
        m2Val: '12ms', m2Lbl: 'Anomaly Alert Speed',
        m3Val: '99.98%', m3Lbl: 'Cluster Health'
      },
      analytics: {
        title: 'Predictive Intelligence & Deep Analytics',
        badge: 'Neural Analytics Engine',
        desc: 'Convert petabytes of raw system events and telemetry into actionable engineering and revenue intelligence with self-optimizing analytical pipelines.',
        img: './assets/images/service-analytics.webp',
        alt: 'Predictive SaaS Analytics Dashboard',
        m1Val: '14.8M', m1Lbl: 'Inferences Daily',
        m2Val: '+38.4%', m2Lbl: 'Optimization Rate',
        m3Val: 'Sub-Sec', m3Lbl: 'Query Aggregation'
      },
      collaboration: {
        title: 'High-Performance Team Collaboration',
        badge: 'Synchronous Workspace',
        desc: 'Unify engineering, product, and leadership workflows with collaborative real-time canvases, granular role-based permissions, and immutable audit logs.',
        img: './assets/images/about-office.webp',
        alt: 'Team Collaborative Engineering Session',
        m1Val: '100%', m1Lbl: 'Audit Coverage',
        m2Val: 'RBAC', m2Lbl: 'Security Matrix',
        m3Val: 'Real-time', m3Lbl: 'State Sync'
      },
      optimization: {
        title: 'Algorithmic Resource Optimization',
        badge: 'Automated Cost Engine',
        desc: 'Dynamically scale serverless compute, database caches, and cloud clusters to achieve peak throughput with minimal cloud infrastructure overhead.',
        img: './assets/images/service-cloud.webp',
        alt: 'Cloud Cluster Auto-Optimization',
        m1Val: '-42%', m1Lbl: 'Cloud Spend',
        m2Val: 'Zero', m2Lbl: 'Cold Start Drift',
        m3Val: 'Auto', m3Lbl: 'Cluster Rebalance'
      },
      automation: {
        title: 'Autonomous Workflow Orchestration',
        badge: 'Event-Driven Core',
        desc: 'Deploy resilient event-driven triggers, zero-downtime CI/CD auto-deployments, and self-healing worker jobs without writing repetitive boilerplate.',
        img: './assets/images/service-automation.webp',
        alt: 'Autonomous Automation System',
        m1Val: '1.8M', m1Lbl: 'Executions / Day',
        m2Val: '99.99%', m2Lbl: 'Task Reliability',
        m3Val: '0.04s', m3Lbl: 'Trigger Dispatch'
      },
      security: {
        title: 'Zero-Trust Enterprise Security',
        badge: 'Hardware Root of Trust',
        desc: 'Bank-grade encryption at rest and in transit, continuous SOC-2 Type II audit logging, adaptive threat quarantine, and biometric session governance.',
        img: './assets/images/service-security.webp',
        alt: 'Zero-Trust Enterprise Defense',
        m1Val: 'AES-256', m1Lbl: 'GCM Encryption',
        m2Val: 'SOC-2', m2Lbl: 'Type II Certified',
        m3Val: 'Zero-Trust', m3Lbl: 'Edge Defense'
      }
    };

    const pills = section.querySelectorAll('.falling-pill-btn');
    const mediaContainer = section.querySelector('.falling-showcase-media');
    const imgEl = section.querySelector('.falling-showcase-img');
    const badgeEl = section.querySelector('.falling-showcase-badge-text');
    const titleEl = section.querySelector('.falling-showcase-title');
    const descEl = section.querySelector('.falling-showcase-desc');
    const m1ValEl = section.querySelector('#fMetricVal1');
    const m1LblEl = section.querySelector('#fMetricLbl1');
    const m2ValEl = section.querySelector('#fMetricVal2');
    const m2LblEl = section.querySelector('#fMetricLbl2');
    const m3ValEl = section.querySelector('#fMetricVal3');
    const m3LblEl = section.querySelector('#fMetricLbl3');

    pills.forEach(pill => {
      pill.addEventListener('click', () => {
        const key = pill.getAttribute('data-theme');
        const data = pillData[key];
        if (!data) return;

        // Toggle active pill state
        pills.forEach(p => p.classList.remove('is-active'));
        pill.classList.add('is-active');

        // Transition image
        if (mediaContainer && imgEl) {
          mediaContainer.classList.add('is-fading');
          setTimeout(() => {
            imgEl.src = data.img;
            imgEl.alt = data.alt;
            if (badgeEl) badgeEl.textContent = data.badge;
            if (titleEl) titleEl.textContent = data.title;
            if (descEl) descEl.textContent = data.desc;
            if (m1ValEl) m1ValEl.textContent = data.m1Val;
            if (m1LblEl) m1LblEl.textContent = data.m1Lbl;
            if (m2ValEl) m2ValEl.textContent = data.m2Val;
            if (m2LblEl) m2LblEl.textContent = data.m2Lbl;
            if (m3ValEl) m3ValEl.textContent = data.m3Val;
            if (m3LblEl) m3LblEl.textContent = data.m3Lbl;
            mediaContainer.classList.remove('is-fading');
          }, 240);
        }
      });
    });
  }

  /* --------------------------------------------------------------------------
     INITIALIZATION
     -------------------------------------------------------------------------- */
  document.addEventListener('DOMContentLoaded', () => {
    initPreloader();
    initStickyHeader();
    initMobileMenu();
    initAccordions();
    initBlogFilters();
    initContactForm();
    initPasswordToggles();
    initBackToTop();
    initAuthRoleSwitcher();
    initNewsletterForms();
    initFallingPillsShowcase();
  });

})();


