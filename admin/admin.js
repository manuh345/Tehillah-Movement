// ── SHARED ADMIN JS ──

// Sidebar inject
const SIDEBAR_HTML = `
<aside class="sidebar" id="sidebar">
  <a href="index.html" class="sidebar-logo">
    <div class="sidebar-logo-icon"></div>
    <div>
      <span class="sidebar-logo-text">TEHILLAH</span>
      <span class="sidebar-logo-sub">Admin Dashboard</span>
    </div>
  </a>

  <div class="sidebar-section-label">Overview</div>
  <ul class="sidebar-nav">
    <li><a href="index.html" id="nav-dashboard"><span class="nav-icon">📊</span> Dashboard</a></li>
  </ul>

  <div class="sidebar-section-label">Events & Bookings</div>
  <ul class="sidebar-nav">
    <li><a href="bookings.html" id="nav-bookings"><span class="nav-icon">🎟</span> Session Bookings <span class="nav-badge">12</span></a></li>
    <li><a href="events.html" id="nav-events"><span class="nav-icon">📅</span> Events Manager</a></li>
  </ul>

  <div class="sidebar-section-label">People</div>
  <ul class="sidebar-nav">
    <li><a href="volunteers.html" id="nav-volunteers"><span class="nav-icon">🙌</span> Volunteers <span class="nav-badge gold">5</span></a></li>
    <li><a href="users.html" id="nav-users"><span class="nav-icon">👥</span> Users & Members</a></li>
    <li><a href="messages.html" id="nav-messages"><span class="nav-icon">✉</span> Messages & Invites <span class="nav-badge">3</span></a></li>
  </ul>

  <div class="sidebar-section-label">Ministry</div>
  <ul class="sidebar-nav">
    <li><a href="donations.html" id="nav-donations"><span class="nav-icon">♦</span> Donations & Giving</a></li>
    <li><a href="prayer.html" id="nav-prayer"><span class="nav-icon">🙏</span> Prayer Requests <span class="nav-badge">8</span></a></li>
    <li><a href="media.html" id="nav-media"><span class="nav-icon">🎬</span> Media Library</a></li>
  </ul>

  <div class="sidebar-divider"></div>
  <ul class="sidebar-nav">
    <li><a href="../index.html"><span class="nav-icon">🌐</span> View Public Site</a></li>
    <li><a href="settings.html" id="nav-settings"><span class="nav-icon">⚙️</span> Settings</a></li>
  </ul>

  <div class="sidebar-footer">
    <div class="sidebar-user-avatar">A</div>
    <div>
      <div class="sidebar-user-name">Admin</div>
      <div class="sidebar-user-role">Super Admin</div>
    </div>
    <button class="sidebar-logout" onclick="confirmLogout()" title="Logout">⏻</button>
  </div>
</aside>`;

// Header inject
function buildHeader(title, breadcrumb) {
  return `
  <header class="admin-header">
    <div class="admin-header-left">
      <button class="sidebar-toggle" onclick="toggleSidebar()">☰</button>
      <div>
        <div class="admin-page-title">${title}</div>
        <div class="breadcrumb"><a href="index.html">Dashboard</a> › ${breadcrumb}</div>
      </div>
    </div>
    <div class="admin-header-right">
      <div class="header-search">
        <span style="color:var(--white-dim)">🔍</span>
        <input type="text" placeholder="Search…"/>
      </div>
      <button class="header-icon-btn" onclick="toggleNotif()" title="Notifications">
        🔔<span class="notif-dot"></span>
      </button>
      <button class="header-icon-btn" title="Profile">👤</button>
    </div>
  </header>`;
}

// ── INIT ──
document.addEventListener('DOMContentLoaded', () => {
  // inject sidebar
  const layout = document.querySelector('.admin-layout');
  if (layout) {
    layout.insertAdjacentHTML('afterbegin', SIDEBAR_HTML);
  }

  // set active nav link
  const page = window.location.pathname.split('/').pop() || 'index.html';
  const navId = 'nav-' + page.replace('.html','');
  const activeLink = document.getElementById(navId);
  if (activeLink) activeLink.classList.add('active');

  // sidebar toggle (mobile)
  window.toggleSidebar = () => {
    document.getElementById('sidebar').classList.toggle('open');
  };

  // close sidebar on outside click
  document.addEventListener('click', (e) => {
    const sidebar = document.getElementById('sidebar');
    if (sidebar && sidebar.classList.contains('open')) {
      if (!sidebar.contains(e.target) && !e.target.classList.contains('sidebar-toggle')) {
        sidebar.classList.remove('open');
      }
    }
  });

  // animate stat numbers
  document.querySelectorAll('.stat-value[data-count]').forEach(el => {
    const target = parseInt(el.dataset.count);
    let current = 0;
    const step = Math.ceil(target / 40);
    const timer = setInterval(() => {
      current = Math.min(current + step, target);
      el.textContent = current.toLocaleString();
      if (current >= target) clearInterval(timer);
    }, 30);
  });
});

// ── TOAST ──
window.showToast = (msg, type = 'success') => {
  let toast = document.getElementById('global-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'global-toast';
    toast.className = 'toast';
    toast.innerHTML = `<span class="toast-icon">✓</span><span class="toast-msg"></span>`;
    document.body.appendChild(toast);
  }
  const colors = { success: 'var(--success)', danger: 'var(--danger)', warning: 'var(--warning)' };
  const icons  = { success: '✓', danger: '✕', warning: '⚠' };
  toast.style.borderColor = colors[type] || colors.success;
  toast.querySelector('.toast-icon').textContent = icons[type] || '✓';
  toast.querySelector('.toast-icon').style.color = colors[type] || colors.success;
  toast.querySelector('.toast-msg').textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3500);
};

// ── MODAL ──
window.openModal = (id) => document.getElementById(id)?.classList.add('open');
window.closeModal = (id) => document.getElementById(id)?.classList.remove('open');
document.addEventListener('click', e => {
  if (e.target.classList.contains('modal-overlay')) e.target.classList.remove('open');
});

// ── LOGOUT ──
window.confirmLogout = () => {
  if (confirm('Log out of the admin panel?')) {
    window.location.href = 'login.html';
  }
};

// ── NOTIFICATION PANEL (stub) ──
window.toggleNotif = () => showToast('No new notifications', 'success');

// ── TABLE ROW ACTIONS ──
window.deleteRow = (btn, label) => {
  if (confirm(`Delete "${label}"?`)) {
    const row = btn.closest('tr');
    row.style.opacity = '0';
    row.style.transition = 'opacity 0.3s';
    setTimeout(() => row.remove(), 300);
    showToast(`"${label}" deleted`, 'danger');
  }
};

// ── MINI BAR CHART ──
window.renderBarChart = (containerId, values) => {
  const el = document.getElementById(containerId);
  if (!el) return;
  const max = Math.max(...values);
  el.innerHTML = values.map((v, i) =>
    `<div class="chart-bar" style="height:${Math.max(4, (v/max)*100)}%" title="${v}"></div>`
  ).join('');
};

// ── EXPORT CSV ──
window.exportCSV = (tableId, filename) => {
  const table = document.getElementById(tableId);
  if (!table) return;
  const rows = [...table.querySelectorAll('tr')].map(tr =>
    [...tr.querySelectorAll('th,td')].map(td => `"${td.innerText.trim().replace(/"/g,'""')}"`).join(',')
  );
  const blob = new Blob([rows.join('\n')], { type: 'text/csv' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename || 'export.csv';
  a.click();
  showToast('CSV exported successfully', 'success');
};
