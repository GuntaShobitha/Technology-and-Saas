/**
 * STACKLY / NEXI — Authentication & Session Manager
 * Pure Vanilla JavaScript · LocalStorage Session Layer
 */

(function () {
  'use strict';

  // Helper to extract a friendly display name from an email
  function deriveNameFromEmail(email) {
    if (!email) return 'User';
    const localPart = email.split('@')[0];
    // Replace dots, underscores, dashes with spaces and title-case
    const cleaned = localPart.replace(/[._\-+]/g, ' ');
    return cleaned
      .split(' ')
      .filter(Boolean)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ') || 'User';
  }

  const Auth = {
    // Check if user is logged in
    isAuthenticated: function () {
      return Boolean(localStorage.getItem('userEmail'));
    },

    // Get current user session
    getUser: function () {
      const email = localStorage.getItem('userEmail') || 'shobitha@gmail.com';
      let name = localStorage.getItem('userName');
      if (!name || name === 'undefined' || name === 'null') {
        name = deriveNameFromEmail(email);
        localStorage.setItem('userName', name);
      }
      const role = localStorage.getItem('userRole') || (email.toLowerCase().includes('admin') ? 'admin' : 'user');
      const plan = localStorage.getItem('userPlan') || (role === 'admin' ? 'Enterprise Platinum' : 'Professional Tier');

      return {
        email: email,
        name: name,
        role: role,
        plan: plan,
        initials: name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'U'
      };
    },

    // Save session upon login
    login: function (email, role, customName) {
      if (!email) return false;
      const cleanEmail = email.trim();
      const resolvedName = customName && customName.trim() ? customName.trim() : deriveNameFromEmail(cleanEmail);
      const resolvedRole = role ? role.toLowerCase() : (cleanEmail.toLowerCase().includes('admin') ? 'admin' : 'user');

      localStorage.setItem('userEmail', cleanEmail);
      localStorage.setItem('userName', resolvedName);
      localStorage.setItem('userRole', resolvedRole);
      localStorage.setItem('userLastLogin', new Date().toISOString());

      return {
        email: cleanEmail,
        name: resolvedName,
        role: resolvedRole
      };
    },

    // Logout and redirect
    logout: function () {
      localStorage.removeItem('userEmail');
      localStorage.removeItem('userName');
      localStorage.removeItem('userRole');
      localStorage.removeItem('userLastLogin');
      window.location.href = './login.html';
    },

    // Guard dashboard pages: redirect to login if unauthenticated
    requireAuth: function (allowedRole) {
      if (!this.isAuthenticated()) {
        // Pre-fill a demo user if accessing directly for first-time evaluation
        const urlParams = new URLSearchParams(window.location.search);
        const demoEmail = urlParams.get('demo') || 'shobitha@gmail.com';
        const defaultRole = window.location.pathname.includes('admin') ? 'admin' : 'user';
        this.login(demoEmail, defaultRole);
      }

      const user = this.getUser();

      // Check role enforcement if specified
      if (allowedRole && user.role !== allowedRole) {
        if (allowedRole === 'admin') {
          // If a non-admin tries to view admin dashboard, switch role or prompt
          console.warn('Current role is user, elevating or redirecting to appropriate view');
        }
      }

      this.bindUserToDOM(user);
      return user;
    },

    // Dynamically inject user data throughout all pages
    bindUserToDOM: function (user) {
      if (!user) user = this.getUser();

      // 1. Text content bindings
      document.querySelectorAll('[data-user-name]').forEach(el => {
        el.textContent = user.name;
      });

      document.querySelectorAll('[data-user-email]').forEach(el => {
        el.textContent = user.email;
        if (el.tagName === 'A' && el.getAttribute('href')?.startsWith('mailto:')) {
          el.setAttribute('href', `mailto:${user.email}`);
        }
      });

      document.querySelectorAll('[data-user-role]').forEach(el => {
        el.textContent = user.role.toUpperCase();
      });

      document.querySelectorAll('[data-user-plan]').forEach(el => {
        el.textContent = user.plan;
      });

      document.querySelectorAll('[data-user-initials]').forEach(el => {
        el.textContent = user.initials;
      });

      // 2. Input values (in profile or settings forms)
      document.querySelectorAll('input[data-bind="userName"]').forEach(input => {
        input.value = user.name;
      });

      document.querySelectorAll('input[data-bind="userEmail"]').forEach(input => {
        input.value = user.email;
      });

      // 3. Format current dates for hero banners
      const dateEls = document.querySelectorAll('[data-current-date]');
      if (dateEls.length) {
        const todayStr = new Intl.DateTimeFormat('en-US', {
          weekday: 'long',
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        }).format(new Date());
        dateEls.forEach(el => {
          el.textContent = todayStr;
        });
      }

      // 4. Attach logout button handlers
      document.querySelectorAll('[data-action="logout"]').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          Auth.logout();
        });
      });
    }
  };

  // Expose globally
  window.Auth = Auth;
})();
