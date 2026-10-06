/**
 * STACKLY / NEXI — User Dashboard Controller
 * Pure Vanilla JavaScript · Interactive Metrics, Tasks, Charts & Integrations
 */

(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', function () {
    // 1. Guard & Bind User Session
    const currentUser = window.Auth ? window.Auth.requireAuth('user') : {
      name: 'Shobitha',
      email: 'shobitha@gmail.com',
      role: 'user',
      plan: 'Professional Tier',
      initials: 'SH'
    };

    // 2. Sidebar Mobile Drawer Toggle
    const sidebar = document.getElementById('dashSidebar');
    const sidebarToggle = document.getElementById('dashSidebarToggle');
    if (sidebarToggle && sidebar) {
      sidebarToggle.addEventListener('click', () => {
        sidebar.classList.toggle('is-open');
      });

      // Close on clicking outside on mobile
      document.addEventListener('click', (e) => {
        if (window.innerWidth <= 768 && sidebar.classList.contains('is-open')) {
          if (!sidebar.contains(e.target) && !sidebarToggle.contains(e.target)) {
            sidebar.classList.remove('is-open');
          }
        }
      });
    }

    // 3. User Dropdown Menu
    const userBtn = document.getElementById('dashUserBtn');
    const userDropdown = document.getElementById('dashUserDropdown');
    if (userBtn && userDropdown) {
      userBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        userDropdown.classList.toggle('is-open');
        if (notifPopover) notifPopover.classList.remove('is-open');
      });
    }

    // 4. Notifications Popover
    const notifBtn = document.getElementById('dashNotifBtn');
    const notifPopover = document.getElementById('dashNotifPopover');
    if (notifBtn && notifPopover) {
      notifBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        notifPopover.classList.toggle('is-open');
        if (userDropdown) userDropdown.classList.remove('is-open');
      });
    }

    // Close popovers on body click
    document.addEventListener('click', () => {
      if (userDropdown) userDropdown.classList.remove('is-open');
      if (notifPopover) notifPopover.classList.remove('is-open');
    });

    // 5. Toast System
    const toastContainer = document.getElementById('dashToastContainer') || createToastContainer();
    function showToast(message, icon = 'check_circle') {
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

    // 6. Notifications "Mark All Read"
    const markAllReadBtn = document.getElementById('markAllReadBtn');
    if (markAllReadBtn) {
      markAllReadBtn.addEventListener('click', () => {
        document.querySelectorAll('.dash-notif-item.is-unread').forEach(item => {
          item.classList.remove('is-unread');
        });
        const badge = document.querySelector('.dash-badge-dot');
        if (badge) badge.style.display = 'none';
        showToast('All notifications marked as read', 'done_all');
      });
    }

    // 7. Interactive Productivity Chart (SVG Bar & Trend Line)
    initProductivityChart();

    function initProductivityChart() {
      const chartSvg = document.getElementById('productivityChartSvg');
      if (!chartSvg) return;

      const datasets = {
        '7D': [42, 65, 88, 72, 95, 60, 84],
        '30D': [55, 70, 62, 85, 91, 78, 88, 92, 68, 74, 85, 94],
        '90D': [48, 52, 66, 75, 80, 85, 90, 88, 92, 95, 89, 98]
      };

      const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

      function renderChart(period = '7D') {
        const data = datasets[period] || datasets['7D'];
        const width = 640;
        const height = 240;
        const padding = 35;
        const chartW = width - padding * 2;
        const chartH = height - padding * 2;
        const maxVal = 100;
        const barWidth = chartW / data.length * 0.45;
        const stepX = chartW / data.length;

        let svgHtml = `
          <!-- Grid lines -->
          <line x1="${padding}" y1="${padding}" x2="${width - padding}" y2="${padding}" class="chart-grid-line" />
          <line x1="${padding}" y1="${padding + chartH * 0.5}" x2="${width - padding}" y2="${padding + chartH * 0.5}" class="chart-grid-line" />
          <line x1="${padding}" y1="${height - padding}" x2="${width - padding}" y2="${height - padding}" class="chart-grid-line" />
          
          <!-- Axis Labels -->
          <text x="${padding - 10}" y="${padding + 4}" text-anchor="end" class="chart-axis-label">100%</text>
          <text x="${padding - 10}" y="${padding + chartH * 0.5 + 4}" text-anchor="end" class="chart-axis-label">50%</text>
          <text x="${padding - 10}" y="${height - padding + 4}" text-anchor="end" class="chart-axis-label">0%</text>
        `;

        // Bar and line points
        let linePoints = [];

        data.forEach((val, idx) => {
          const x = padding + idx * stepX + stepX * 0.5;
          const y = height - padding - (val / maxVal * chartH);
          const barH = val / maxVal * chartH;
          linePoints.push(`${x},${y}`);

          // Animated Bar
          svgHtml += `
            <rect x="${x - barWidth / 2}" y="${y}" width="${barWidth}" height="${barH}" rx="4"
                  fill="url(#bronzeBarGrad)" opacity="0.85" style="cursor:pointer;" data-tip="Score: ${val}%">
              <animate attributeName="height" from="0" to="${barH}" dur="0.6s" fill="freeze" />
              <animate attributeName="y" from="${height - padding}" to="${y}" dur="0.6s" fill="freeze" />
            </rect>
            <text x="${x}" y="${height - padding + 18}" text-anchor="middle" class="chart-axis-label">
              ${period === '7D' ? days[idx] : `W${idx + 1}`}
            </text>
          `;
        });

        // Gradient Definition + Trend Curve
        svgHtml = `
          <defs>
            <linearGradient id="bronzeBarGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#CCA072" />
              <stop offset="100%" stop-color="#9E6939" />
            </linearGradient>
            <linearGradient id="trendLineGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stop-color="#E2C4A2" />
              <stop offset="100%" stop-color="#B8824F" />
            </linearGradient>
          </defs>
        ` + svgHtml;

        // Overlay spline
        svgHtml += `
          <polyline fill="none" stroke="url(#trendLineGrad)" stroke-width="2.5" points="${linePoints.join(' ')}" />
        `;

        linePoints.forEach((pt, i) => {
          const [cx, cy] = pt.split(',');
          svgHtml += `<circle cx="${cx}" cy="${cy}" r="4" fill="#ffffff" stroke="#B8824F" stroke-width="2" />`;
        });

        chartSvg.innerHTML = svgHtml;
      }

      // Filter Buttons
      document.querySelectorAll('.time-filter-btn').forEach(btn => {
        btn.addEventListener('click', function () {
          document.querySelectorAll('.time-filter-btn').forEach(b => b.classList.remove('is-active'));
          this.classList.add('is-active');
          const period = this.getAttribute('data-period') || '7D';
          renderChart(period);
          showToast(`Displaying telemetry for past ${period}`);
        });
      });

      renderChart('7D');
    }

    // 8. Task Management: Live Search & Category Filtering
    initTaskManager();

    function initTaskManager() {
      const searchInput = document.getElementById('taskSearchInput');
      const filterPills = document.querySelectorAll('.task-filter-pill');
      const taskRows = document.querySelectorAll('.task-table-row');

      function filterTasks() {
        const query = searchInput ? searchInput.value.toLowerCase().trim() : '';
        const activePill = document.querySelector('.task-filter-pill.is-active');
        const filterVal = activePill ? activePill.getAttribute('data-status') : 'all';

        let visibleCount = 0;

        taskRows.forEach(row => {
          const title = row.querySelector('.task-title')?.textContent.toLowerCase() || '';
          const project = row.querySelector('.task-project')?.textContent.toLowerCase() || '';
          const status = row.getAttribute('data-status') || '';

          const matchesQuery = !query || title.includes(query) || project.includes(query);
          const matchesStatus = filterVal === 'all' || status === filterVal;

          if (matchesQuery && matchesStatus) {
            row.style.display = '';
            visibleCount++;
          } else {
            row.style.display = 'none';
          }
        });

        const countEl = document.getElementById('taskResultsCount');
        if (countEl) countEl.textContent = `${visibleCount} tasks found`;
      }

      if (searchInput) {
        searchInput.addEventListener('input', filterTasks);
      }

      filterPills.forEach(pill => {
        pill.addEventListener('click', function () {
          filterPills.forEach(p => p.classList.remove('is-active'));
          this.classList.add('is-active');
          filterTasks();
        });
      });

      // Complete Task Checkbox click
      document.querySelectorAll('.task-checkbox').forEach(cb => {
        cb.addEventListener('change', function () {
          const row = this.closest('tr');
          const titleEl = row.querySelector('.task-title');
          const badgeEl = row.querySelector('.status-badge');

          if (this.checked) {
            if (titleEl) titleEl.style.textDecoration = 'line-through';
            row.setAttribute('data-status', 'completed');
            if (badgeEl) {
              badgeEl.className = 'status-badge completed';
              badgeEl.textContent = 'Completed';
            }
            showToast('Task marked as completed', 'check');
          } else {
            if (titleEl) titleEl.style.textDecoration = 'none';
            row.setAttribute('data-status', 'in-progress');
            if (badgeEl) {
              badgeEl.className = 'status-badge in-progress';
              badgeEl.textContent = 'In Progress';
            }
          }
        });
      });
    }

    // 9. Integration Toggles
    document.querySelectorAll('.integ-toggle-input').forEach(toggle => {
      toggle.addEventListener('change', function () {
        const card = this.closest('.integration-card');
        const name = card.querySelector('h3')?.textContent || 'Integration';
        const statusBadge = card.querySelector('.integ-status-badge');

        if (this.checked) {
          if (statusBadge) {
            statusBadge.className = 'status-badge active integ-status-badge';
            statusBadge.textContent = 'Connected';
          }
          showToast(`Connected ${name} to cluster mesh`, 'hub');
        } else {
          if (statusBadge) {
            statusBadge.className = 'status-badge paused integ-status-badge';
            statusBadge.textContent = 'Disconnected';
          }
          showToast(`Disconnected ${name}`, 'link_off');
        }
      });
    });

    // 10. Modals: Create Project & Submit Ticket
    initModals();

    function initModals() {
      // Open triggers
      document.querySelectorAll('[data-modal-target]').forEach(btn => {
        btn.addEventListener('click', function () {
          const targetId = this.getAttribute('data-modal-target');
          const modal = document.getElementById(targetId);
          if (modal) modal.classList.add('is-open');
        });
      });

      // Close triggers
      document.querySelectorAll('[data-modal-close]').forEach(btn => {
        btn.addEventListener('click', function () {
          const modal = this.closest('.dash-modal');
          if (modal) modal.classList.remove('is-open');
        });
      });

      // Close on backdrop click
      document.querySelectorAll('.dash-modal').forEach(modal => {
        modal.addEventListener('click', function (e) {
          if (e.target === this) this.classList.remove('is-open');
        });
      });

      // Project Create Form submission
      const newProjectForm = document.getElementById('newProjectForm');
      if (newProjectForm) {
        newProjectForm.addEventListener('submit', function (e) {
          e.preventDefault();
          const name = document.getElementById('projNameInput')?.value || 'New Cluster Pipeline';
          showToast(`Created project: "${name}" successfully`, 'rocket_launch');
          newProjectForm.closest('.dash-modal')?.classList.remove('is-open');
          newProjectForm.reset();
        });
      }

      // Ticket Form submission
      const ticketForm = document.getElementById('ticketModalForm');
      if (ticketForm) {
        ticketForm.addEventListener('submit', function (e) {
          e.preventDefault();
          showToast('Support ticket dispatched to Cloud Architects. SLA: <15m', 'support_agent');
          ticketForm.closest('.dash-modal')?.classList.remove('is-open');
          ticketForm.reset();
        });
      }
    }

    // 11. Initial Welcome Toast
    setTimeout(() => {
      showToast(`Welcome back, ${currentUser.name}! Session initialized.`, 'verified_user');
    }, 800);
  });
})();
