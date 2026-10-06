/**
 * STACKLY / NEXI — Admin Dashboard Controller
 * Pure Vanilla JavaScript · User Directory, Revenue Analytics, System Health & Audit Logs
 */

(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', function () {
    // 1. Guard & Bind Admin Session
    const currentAdmin = window.Auth ? window.Auth.requireAuth('admin') : {
      name: 'Admin',
      email: 'admin@nexi.tech',
      role: 'admin',
      plan: 'Enterprise Master Access',
      initials: 'AD'
    };

    // 2. Sidebar Mobile Drawer Toggle
    const sidebar = document.getElementById('dashSidebar');
    const sidebarToggle = document.getElementById('dashSidebarToggle');
    if (sidebarToggle && sidebar) {
      sidebarToggle.addEventListener('click', () => {
        sidebar.classList.toggle('is-open');
      });

      document.addEventListener('click', (e) => {
        if (window.innerWidth <= 768 && sidebar.classList.contains('is-open')) {
          if (!sidebar.contains(e.target) && !sidebarToggle.contains(e.target)) {
            sidebar.classList.remove('is-open');
          }
        }
      });
    }

    // 3. User & Notif Dropdowns
    const userBtn = document.getElementById('dashUserBtn');
    const userDropdown = document.getElementById('dashUserDropdown');
    const notifBtn = document.getElementById('dashNotifBtn');
    const notifPopover = document.getElementById('dashNotifPopover');

    if (userBtn && userDropdown) {
      userBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        userDropdown.classList.toggle('is-open');
        if (notifPopover) notifPopover.classList.remove('is-open');
      });
    }

    if (notifBtn && notifPopover) {
      notifBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        notifPopover.classList.toggle('is-open');
        if (userDropdown) userDropdown.classList.remove('is-open');
      });
    }

    document.addEventListener('click', () => {
      if (userDropdown) userDropdown.classList.remove('is-open');
      if (notifPopover) notifPopover.classList.remove('is-open');
    });

    // 4. Toast System
    const toastContainer = document.getElementById('dashToastContainer') || createToastContainer();
    function showToast(message, icon = 'verified_user') {
      const toast = document.createElement('div');
      toast.className = 'dash-toast';
      toast.innerHTML = `
        <span class="material-symbols-outlined" style="color:var(--bronze-400); font-size:1.25rem;">${icon}</span>
        <span>${message}</span>
      `;
      toastContainer.appendChild(toast);
      setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(10px)';
        toast.style.transition = 'all 0.3s ease';
        setTimeout(() => toast.remove(), 300);
      }, 3500);
    }
    function createToastContainer() {
      const cont = document.createElement('div');
      cont.id = 'dashToastContainer';
      cont.className = 'dash-toast-container';
      document.body.appendChild(cont);
      return cont;
    }

    // 5. Interactive Revenue Analytics Chart
    initRevenueChart();

    function initRevenueChart() {
      const chartSvg = document.getElementById('revenueChartSvg');
      if (!chartSvg) return;

      const datasets = {
        '6M': [64, 82, 105, 128, 142, 184],
        '1Y': [45, 52, 64, 78, 88, 102, 118, 134, 148, 162, 175, 184],
        'ALL': [22, 38, 55, 78, 110, 145, 184]
      };

      const months6 = ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'];

      function renderChart(period = '6M') {
        const data = datasets[period] || datasets['6M'];
        const width = 680;
        const height = 250;
        const padding = 40;
        const chartW = width - padding * 2;
        const chartH = height - padding * 2;
        const maxVal = 200; // in thousands ($k)
        const stepX = chartW / (data.length - 1);

        let points = [];
        let areaPoints = [`${padding},${height - padding}`];

        data.forEach((val, i) => {
          const x = padding + i * stepX;
          const y = height - padding - (val / maxVal * chartH);
          points.push(`${x},${y}`);
          areaPoints.push(`${x},${y}`);
        });

        areaPoints.push(`${padding + (data.length - 1) * stepX},${height - padding}`);

        let svgHtml = `
          <defs>
            <linearGradient id="revAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#CCA072" stop-opacity="0.35" />
              <stop offset="100%" stop-color="#CCA072" stop-opacity="0.0" />
            </linearGradient>
            <linearGradient id="revLineGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stop-color="#E2C4A2" />
              <stop offset="100%" stop-color="#B8824F" />
            </linearGradient>
          </defs>

          <!-- Grid Lines -->
          <line x1="${padding}" y1="${padding}" x2="${width - padding}" y2="${padding}" class="chart-grid-line" />
          <line x1="${padding}" y1="${padding + chartH * 0.5}" x2="${width - padding}" y2="${padding + chartH * 0.5}" class="chart-grid-line" />
          <line x1="${padding}" y1="${height - padding}" x2="${width - padding}" y2="${height - padding}" class="chart-grid-line" />

          <!-- Axis Labels -->
          <text x="${padding - 10}" y="${padding + 4}" text-anchor="end" class="chart-axis-label">$200k</text>
          <text x="${padding - 10}" y="${padding + chartH * 0.5 + 4}" text-anchor="end" class="chart-axis-label">$100k</text>
          <text x="${padding - 10}" y="${height - padding + 4}" text-anchor="end" class="chart-axis-label">$0</text>

          <!-- Area fill -->
          <polygon fill="url(#revAreaGrad)" points="${areaPoints.join(' ')}" />

          <!-- Curve Line -->
          <polyline fill="none" stroke="url(#revLineGrad)" stroke-width="3" points="${points.join(' ')}" />
        `;

        // Points
        points.forEach((pt, idx) => {
          const [cx, cy] = pt.split(',');
          svgHtml += `
            <circle cx="${cx}" cy="${cy}" r="5" fill="#ffffff" stroke="#B8824F" stroke-width="2.5" style="cursor:pointer;" />
            <text x="${cx}" y="${height - padding + 18}" text-anchor="middle" class="chart-axis-label">
              ${period === '6M' ? months6[idx] : `M${idx + 1}`}
            </text>
          `;
        });

        chartSvg.innerHTML = svgHtml;
      }

      document.querySelectorAll('.rev-filter-btn').forEach(btn => {
        btn.addEventListener('click', function () {
          document.querySelectorAll('.rev-filter-btn').forEach(b => b.classList.remove('is-active'));
          this.classList.add('is-active');
          const p = this.getAttribute('data-period') || '6M';
          renderChart(p);
          showToast(`Displaying revenue telemetry for ${p}`);
        });
      });

      renderChart('6M');
    }

    // 6. User Management: Search, Filter, Pagination & Actions
    initUserManagement();

    function initUserManagement() {
      const searchInput = document.getElementById('userSearchInput');
      const filterPills = document.querySelectorAll('.user-filter-pill');
      const userRows = document.querySelectorAll('.user-table-row');

      function filterUsers() {
        const query = searchInput ? searchInput.value.toLowerCase().trim() : '';
        const activePill = document.querySelector('.user-filter-pill.is-active');
        const filterStatus = activePill ? activePill.getAttribute('data-status') : 'all';

        let count = 0;

        userRows.forEach(row => {
          const name = row.querySelector('.user-cell-name')?.textContent.toLowerCase() || '';
          const email = row.querySelector('.user-cell-email')?.textContent.toLowerCase() || '';
          const status = row.getAttribute('data-status') || '';

          const matchesQuery = !query || name.includes(query) || email.includes(query);
          const matchesStatus = filterStatus === 'all' || status === filterStatus;

          if (matchesQuery && matchesStatus) {
            row.style.display = '';
            count++;
          } else {
            row.style.display = 'none';
          }
        });

        const countLabel = document.getElementById('userMatchCount');
        if (countLabel) countLabel.textContent = `${count} accounts shown`;
      }

      if (searchInput) {
        searchInput.addEventListener('input', filterUsers);
      }

      filterPills.forEach(pill => {
        pill.addEventListener('click', function () {
          filterPills.forEach(p => p.classList.remove('is-active'));
          this.classList.add('is-active');
          filterUsers();
        });
      });

      // Actions: Suspend / Delete / Edit
      document.querySelectorAll('[data-user-action]').forEach(btn => {
        btn.addEventListener('click', function () {
          const action = this.getAttribute('data-user-action');
          const row = this.closest('tr');
          const userName = row.querySelector('.user-cell-name')?.textContent || 'User';
          const badge = row.querySelector('.user-status-badge');

          if (action === 'suspend') {
            const isCurrentlyActive = row.getAttribute('data-status') === 'active';
            if (isCurrentlyActive) {
              row.setAttribute('data-status', 'suspended');
              if (badge) {
                badge.className = 'status-badge suspended user-status-badge';
                badge.textContent = 'Suspended';
              }
              this.textContent = 'Activate';
              showToast(`Account suspended: ${userName}`, 'block');
            } else {
              row.setAttribute('data-status', 'active');
              if (badge) {
                badge.className = 'status-badge active user-status-badge';
                badge.textContent = 'Active';
              }
              this.textContent = 'Suspend';
              showToast(`Account re-activated: ${userName}`, 'check_circle');
            }
          } else if (action === 'delete') {
            if (confirm(`Are you sure you want to delete account for ${userName}?`)) {
              row.style.opacity = '0';
              setTimeout(() => {
                row.remove();
                filterUsers();
                showToast(`Deleted account: ${userName}`, 'delete');
              }, 250);
            }
          } else if (action === 'edit') {
            const newName = prompt('Update user full name:', userName);
            if (newName && newName.trim()) {
              const nameEl = row.querySelector('.user-cell-name');
              if (nameEl) nameEl.textContent = newName.trim();
              showToast(`Updated user profile: ${newName.trim()}`, 'edit');
            }
          }
        });
      });
    }

    // 7. System Health Refresh Simulation
    const refreshHealthBtn = document.getElementById('refreshHealthBtn');
    if (refreshHealthBtn) {
      refreshHealthBtn.addEventListener('click', function () {
        this.disabled = true;
        this.innerHTML = '<span class="material-symbols-outlined" style="animation:spin 0.8s linear infinite;">sync</span> Refreshing...';
        setTimeout(() => {
          this.disabled = false;
          this.innerHTML = '<span class="material-symbols-outlined">sync</span> Refresh Cluster Posture';
          // Simulate slight jitter in CPU / memory metrics
          const cpuVal = Math.floor(Math.random() * 15) + 25;
          const memVal = Math.floor(Math.random() * 10) + 52;
          const latVal = (Math.random() * 4 + 11).toFixed(1);

          document.querySelectorAll('[data-health-cpu]').forEach(el => el.textContent = `${cpuVal}%`);
          document.querySelectorAll('[data-health-mem]').forEach(el => el.textContent = `${memVal}%`);
          document.querySelectorAll('[data-health-lat]').forEach(el => el.textContent = `${latVal}ms`);

          showToast('Live Kubernetes node cluster telemetry synchronized', 'dns');
        }, 800);
      });
    }

    // 8. System Logs Live Search
    const logSearchInput = document.getElementById('logSearchInput');
    if (logSearchInput) {
      logSearchInput.addEventListener('input', function () {
        const q = this.value.toLowerCase().trim();
        document.querySelectorAll('.system-log-row').forEach(row => {
          const text = row.textContent.toLowerCase();
          row.style.display = (!q || text.includes(q)) ? '' : 'none';
        });
      });
    }

    // 9. Support Ticket Actions
    document.querySelectorAll('[data-ticket-action]').forEach(btn => {
      btn.addEventListener('click', function () {
        const row = this.closest('tr');
        const badge = row.querySelector('.ticket-status-badge');
        if (badge) {
          badge.className = 'status-badge completed ticket-status-badge';
          badge.textContent = 'Resolved';
        }
        this.textContent = 'Reopen';
        showToast('Ticket marked as resolved and closed', 'task_alt');
      });
    });

    // 10. Initial Welcome Toast
    setTimeout(() => {
      showToast(`Logged in as Administrator (${currentAdmin.email})`, 'admin_panel_settings');
    }, 800);
  });
})();
