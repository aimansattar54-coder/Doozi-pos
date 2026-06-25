/* ============================================================
   Doozi POS — App Logic v4
   ============================================================ */

// ── Demo users ──────────────────────────────────────────────
const USERS = [
  { email: 'admin@doozipos.com',   password: 'admin123',   name: 'Admin User',    role: 'Owner',         initials: 'AS' },
  { email: 'manager@doozipos.com', password: 'manager123', name: 'Store Manager', role: 'Store Manager',  initials: 'SM' },
  { email: 'cashier@doozipos.com', password: 'cashier123', name: 'John Cashier',  role: 'Cashier',        initials: 'JC' },
];

// ── App state ────────────────────────────────────────────────
const App = {
  currentPage:      'dashboard',
  cart:             [],
  activeCategory:   'All',
  posSearch:        '',
  discount:         0,
  discountType:     'percent',
  discountLabel:    '',          // human label for an applied promo/tier discount
  promoCode:        null,        // applied promo code (recorded on the sale)
  orderType:        'pickup',    // 'pickup' | 'delivery' for the current sale/order
  deliveryLocation: '',          // required when orderType==='delivery'
  deliveryContact:  '',          // required when orderType==='delivery'
  selectedCustomer: null,
  payMethod:        'cash',
  cashEntered:      '',
  reportTab:        'sales',
  reportYear:       null,
  reportMonth:      'all',
  reportDay:        'all',
  adIndex:          0,
  settingsTab:      'general',
  invFilter:        'all',
  invSearch:        '',
  salesSearch:      '',
  salesTab:         'history',
  custSearch:       '',
  stockFilter:      'all',
  viewMode:         'auto',
  user:             null,
  dropdownOpen:     false,
  orderDateFilter:   'today',   // Orders hub: 'today' | 'week' | 'all'
  orderTypeFilter:   'all',     // Orders hub: 'all' | 'delivery' | 'pickup'
  orderStatusFilter: 'all',     // Orders hub: 'all' | 'pending' | 'delivered'
  ordersTab:         'orders',  // Merged Orders screen sub-tab: 'orders' | 'preorders'
};

/* ══════════════════════════════════════════════════════════
   AUTH
   ══════════════════════════════════════════════════════════ */
function doLogin() {
  const email = document.getElementById('loginEmail').value.trim().toLowerCase();
  const pwd   = document.getElementById('loginPassword').value;
  const err   = document.getElementById('loginError');
  const user  = USERS.find(u => u.email === email && u.password === pwd);
  if (!user) {
    err.classList.add('show');
    document.getElementById('loginPassword').value = '';
    return;
  }
  err.classList.remove('show');
  App.user = user;
  playLoginAnimation();
}

function playLoginAnimation() {
  const loginOverlay = document.getElementById('loginOverlay');
  const splash       = document.getElementById('splashOverlay');
  const video        = document.getElementById('splashVideo');
  const fallback     = document.getElementById('splashFallback');

  // Step 1: bring splash fully visible first, then hide login — no gap
  splash.style.transition = '';
  splash.style.opacity = '1';
  splash.style.display = 'flex';

  loginOverlay.style.display = 'none';
  loginOverlay.classList.add('hidden');

  // Step 3: after animation ends, fade splash out then go to dashboard
  function goToDashboard() {
    splash.style.transition = 'opacity 0.5s ease';
    splash.style.opacity = '0';
    setTimeout(() => {
      splash.style.display = 'none';
      splash.style.opacity = '1';
      splash.style.transition = '';
      updateUserUI();
      navigate('dashboard');
    }, 500);
  }

  if (video) {
    video.currentTime = 0;
    const onEnded = () => { video.removeEventListener('ended', onEnded); goToDashboard(); };
    video.addEventListener('ended', onEnded);

    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        video.style.display = 'none';
        if (fallback) fallback.style.display = 'flex';
        setTimeout(goToDashboard, 2500);
      });
    }

    setTimeout(() => {
      video.removeEventListener('ended', onEnded);
      if (splash.style.display !== 'none') goToDashboard();
    }, 8000);
  } else {
    if (fallback) fallback.style.display = 'flex';
    setTimeout(goToDashboard, 2500);
  }
}

function doLogout() {
  closeDropdown();
  closeMoreDrawer();
  App.user = null;
  App.cart = [];
  App.currentPage = 'dashboard';
  const lo = document.getElementById('loginOverlay');
  lo.classList.remove('hidden');
  lo.style.display = 'flex';
  const email = document.getElementById('loginEmail');
  const pwd   = document.getElementById('loginPassword');
  if (email) email.value = '';
  if (pwd)   pwd.value   = '';
  const err = document.getElementById('loginError');
  if (err) err.classList.remove('show');
  const pc = document.getElementById('pageContent');
  if (pc) pc.innerHTML = '';
}

function fillCred(email, pwd) {
  document.getElementById('loginEmail').value    = email;
  document.getElementById('loginPassword').value = pwd;
  document.getElementById('loginEmail').focus();
}

function togglePwd() {
  const inp = document.getElementById('loginPassword');
  inp.type = inp.type === 'password' ? 'text' : 'password';
}

function doGoogleLogin() {
  // Simulate Google OAuth — auto-login as admin for demo
  const overlay = document.createElement('div');
  overlay.style.cssText = 'position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center';
  overlay.innerHTML = `<div style="background:#fff;border-radius:16px;padding:32px 28px;width:min(340px,92vw);box-shadow:0 20px 60px rgba(0,0,0,0.2);text-align:center">
    <svg viewBox="0 0 24 24" width="40" height="40" style="margin-bottom:12px"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
    <div style="font-size:18px;font-weight:700;margin-bottom:6px">Sign in with Google</div>
    <div style="font-size:13px;color:#666;margin-bottom:20px">Connecting to your Google account…</div>
    <div style="display:flex;flex-direction:column;gap:10px">
      <div style="padding:12px 16px;border:1.5px solid #ddd;border-radius:10px;cursor:pointer;display:flex;align-items:center;gap:10px;text-align:left" onclick="selectGoogleAcc('admin@doozipos.com','Admin User','AS','Owner')">
        <div style="width:36px;height:36px;border-radius:50%;background:#0D6B5E;display:grid;place-items:center;color:#fff;font-weight:700;font-size:13px;flex-shrink:0">AS</div>
        <div><div style="font-size:13.5px;font-weight:600">Admin User</div><div style="font-size:12px;color:#666">admin@doozipos.com</div></div>
      </div>
      <div style="padding:12px 16px;border:1.5px solid #ddd;border-radius:10px;cursor:pointer;display:flex;align-items:center;gap:10px;text-align:left" onclick="selectGoogleAcc('manager@doozipos.com','Store Manager','SM','Store Manager')">
        <div style="width:36px;height:36px;border-radius:50%;background:#2BB5A0;display:grid;place-items:center;color:#fff;font-weight:700;font-size:13px;flex-shrink:0">SM</div>
        <div><div style="font-size:13.5px;font-weight:600">Store Manager</div><div style="font-size:12px;color:#666">manager@doozipos.com</div></div>
      </div>
    </div>
    <button onclick="this.closest('div[style]').remove()" style="margin-top:14px;width:100%;padding:10px;border:none;background:none;color:#888;font-size:13px;cursor:pointer">Cancel</button>
  </div>`;
  document.body.appendChild(overlay);
  window.selectGoogleAcc = (email, name, initials, role) => {
    overlay.remove();
    App.user = { email, name, initials, role, password: 'google' };
    playLoginAnimation();
  };
}

function updateUserUI() {
  const u = App.user;
  if (!u) return;
  const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  set('topbarAvatar',   u.initials);
  set('dropdownAvatar', u.initials);
  set('dropdownName',   u.name);
  set('dropdownEmail',  u.email);
  set('dropdownRole',   u.role);
}

document.addEventListener('keydown', e => {
  if (e.key === 'Enter') {
    const overlay = document.getElementById('loginOverlay');
    if (overlay && !overlay.classList.contains('hidden')) doLogin();
  }
});

/* ══════════════════════════════════════════════════════════
   AVATAR DROPDOWN
   ══════════════════════════════════════════════════════════ */
function toggleAvatarDropdown() {
  App.dropdownOpen ? closeDropdown() : openDropdown();
}
function openDropdown() {
  const dd = document.getElementById('avatarDropdown');
  if (dd) { dd.style.display = 'block'; App.dropdownOpen = true; }
}
function closeDropdown() {
  const dd = document.getElementById('avatarDropdown');
  if (dd) { dd.style.display = 'none'; App.dropdownOpen = false; }
}

function toggleMoreDrawer() {
  const d = document.getElementById('moreDrawer');
  const b = document.getElementById('moreDrawerBackdrop');
  const btn = document.getElementById('moreNavBtn');
  const open = d.style.display !== 'none';
  d.style.display = open ? 'none' : 'block';
  b.style.display = open ? 'none' : 'block';
  if (btn) btn.classList.toggle('active', !open);
}
function closeMoreDrawer() {
  const d = document.getElementById('moreDrawer');
  const b = document.getElementById('moreDrawerBackdrop');
  const btn = document.getElementById('moreNavBtn');
  if (d) d.style.display = 'none';
  if (b) b.style.display = 'none';
  if (btn) btn.classList.remove('active');
}
document.addEventListener('click', e => {
  if (!document.getElementById('topbarAvatarBtn')?.contains(e.target)) closeDropdown();
});


/* ══════════════════════════════════════════════════════════
   NAVIGATION
   ══════════════════════════════════════════════════════════ */
function navigate(page) {
  App.currentPage = page;
  // The app re-renders the whole page on navigate. When a search/number field
  // drives that re-render via oninput, the recreated field would lose focus
  // (cursor drops after every keystroke). Capture focus + caret, restore after.
  const ae = document.activeElement;
  const keepId = ae && ae.id && (ae.tagName === 'INPUT' || ae.tagName === 'TEXTAREA') ? ae.id : null;
  let selStart = null, selEnd = null;
  if (keepId) { try { selStart = ae.selectionStart; selEnd = ae.selectionEnd; } catch (_) {} }
  document.querySelectorAll('.nav-item[data-page]').forEach(a => { const on = a.dataset.page === page; a.classList.toggle('active', on); a.setAttribute('aria-current', on ? 'page' : 'false'); });
  document.querySelectorAll('.bottom-nav-item[data-page]').forEach(a => { const on = a.dataset.page === page; a.classList.toggle('active', on); a.setAttribute('aria-current', on ? 'page' : 'false'); });
  const el = document.getElementById('pageContent');
  el.innerHTML = '';
  renderPage(page, el);
  if (keepId) {
    const again = document.getElementById(keepId);
    if (again) { again.focus(); if (selStart != null) { try { again.setSelectionRange(selStart, selEnd); } catch (_) {} } }
  }
  DB.save();   // persist business data after any change that triggers a re-render
}

function renderPage(page, el) {
  const fns = {
    dashboard: renderDashboard, pos: renderPOS, sales: renderSales,
    invoices: renderInvoices, inventory: renderInventory,
    customers: renderCustomers, reports: renderReports,
    costing: renderCosting, settings: renderSettings,
    expenses: renderExpenses,
    'supplier-invoices': renderSupplierInvoices,
    quotations: renderQuotations, returns: renderReturns,
    marketing: renderMarketing,
    preorders: (e) => { App.ordersTab = 'preorders'; renderOrders(e); },
    orders: renderOrders,
  };
  (fns[page] || renderDashboard)(el);
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-page]').forEach(el => {
    el.addEventListener('click', e => { e.preventDefault(); navigate(el.dataset.page); });
  });
  document.getElementById('loginOverlay').classList.remove('hidden');
  adsInit();   // load saved ads (IndexedDB) and refresh the box when ready
});

// Global safety net — surface errors instead of silently breaking the UI.
window.addEventListener('error', () => { try { showToast('Something went wrong — please try again', 'error'); } catch (_) {} });
window.addEventListener('unhandledrejection', () => { try { showToast('Action failed — please retry', 'error'); } catch (_) {} });

/* ══════════════════════════════════════════════════════════
   ICONS
   ══════════════════════════════════════════════════════════ */
const iconDollar  = () => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>`;
const iconReceipt = () => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16l3-3 3 3 3-3 3 3V4a2 2 0 0 0-2-2z"/></svg>`;
const iconChart   = () => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>`;
const iconBox     = () => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>`;
const iconPeople  = () => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`;
const iconCash    = () => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2"/><path d="M6 12h.01M18 12h.01"/></svg>`;
const iconCard    = () => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>`;
const iconSplit   = () => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>`;
const iconArrowUp = () => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="width:14px;height:14px"><polyline points="18 15 12 9 6 15"/></svg>`;
const iconCopy     = () => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:14px;height:14px"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>`;
const iconWhatsApp = () => `<svg viewBox="0 0 24 24" fill="currentColor" style="width:15px;height:15px"><path d="M.057 24l1.687-6.163a11.867 11.867 0 0 1-1.587-5.945C.16 5.335 5.495 0 12.05 0a11.817 11.817 0 0 1 8.413 3.488 11.824 11.824 0 0 1 3.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 0 1-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>`;

/* ══════════════════════════════════════════════════════════
   HELPERS
   ══════════════════════════════════════════════════════════ */
function miniKPI(label, value, sub, dir, bg) {
  const color = dir === 'up' ? 'var(--success)' : dir === 'down' ? 'var(--danger)' : 'var(--gray-400)';
  const arrow = dir === 'up' ? '↑' : dir === 'down' ? '↓' : '';
  return `<div class="kpi-card" style="background:${bg||'var(--surface)'}">
    <div class="kpi-label">${label}</div>
    <div class="kpi-value">${value}</div>
    <div class="kpi-change" style="color:${color}">${arrow} ${sub}</div>
  </div>`;
}

function txnCard(t) {
  const colors = ['var(--pastel-blue)','var(--pastel-purple)','var(--pastel-pink)','var(--pastel-green)','var(--pastel-yellow)','var(--pastel-orange)','var(--pastel-teal)'];
  const textColors = ['#1D4ED8','#5B21B6','#9D174D','#065F46','#92400E','#C2410C','#0F766E'];
  const i = (parseInt(String(t.id).replace(/\D/g,'')) || 0) % 7;
  const pm = (t.method || t.payment || '').toLowerCase();
  const badge = pm === 'card'  ? `<span class="badge-pill badge-info">Card</span>` :
                pm === 'split' ? `<span class="badge-pill badge-warning">Split</span>` :
                `<span class="badge-pill badge-success">Cash</span>`;
  const statusBadge = t.status === 'refunded'
    ? `<span class="badge-pill badge-danger" style="font-size:10px">Refunded</span>`
    : t.status === 'partial-refund'
    ? `<span class="badge-pill badge-warning" style="font-size:10px">Part. refund</span>`
    : `<span class="badge-pill badge-success" style="font-size:10px">Paid</span>`;
  return `<div class="txn-card" onclick="viewTransaction('${t.id}')" style="cursor:pointer">
    <div class="txn-icon" style="background:${colors[i]};color:${textColors[i]}">${iconReceipt()}</div>
    <div class="txn-info">
      <div class="txn-name">${esc(t.customerName || t.customer || 'Walk-in Customer')}</div>
      <div class="txn-meta">${t.date} · ${t.items} item${t.items !== 1 ? 's' : ''} · ${badge} ${orderTypeBadge(t)} ${deliveryStatusBadge(t)}</div>
    </div>
    <div class="txn-right">
      <div class="txn-amount">${DB.fmt(t.total)}</div>
      ${statusBadge}
    </div>
  </div>`;
}

// Small Pickup/Delivery indicator for list rows (only shown when known).
function orderTypeBadge(t) {
  if (!t || !t.orderType) return '';
  return t.orderType === 'delivery'
    ? `<span class="badge-pill" style="font-size:9.5px;background:var(--pastel-purple);color:#6D28D9;font-weight:700">Delivery</span>`
    : `<span class="badge-pill" style="font-size:9.5px;background:var(--pastel-teal);color:#0F766E;font-weight:700">Pickup</span>`;
}

// Delivery fulfillment indicator (only for delivery orders).
function deliveryStatusBadge(t) {
  if (!t || t.orderType !== 'delivery') return '';
  return t.deliveryStatus === 'delivered'
    ? `<span class="badge-pill" style="font-size:9.5px;background:var(--pastel-green);color:#065F46;font-weight:700">Delivered ✓</span>`
    : `<span class="badge-pill" style="font-size:9.5px;background:var(--pastel-orange);color:#C2410C;font-weight:700">Pending</span>`;
}

// Format an ISO timestamp like "Jun 18, 2026 · 4:40 PM" for delivered-at display.
function formatDateTime(iso) {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleString('en-US', { month:'short', day:'numeric', year:'numeric', hour:'numeric', minute:'2-digit' });
  } catch (_) { return String(iso); }
}

function formatDate(d) {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// Neutralize HTML in user-entered text (prevents injection when rendered into innerHTML).
function cleanText(s) { return String(s == null ? '' : s).replace(/[<>]/g, '').trim(); }

// HTML-escape for SAFE output of user-controlled data into innerHTML — covers
// both text and attribute contexts (quotes/backtick close attributes even when
// '<' '>' are stripped). Use esc() at every point a name/note/address/etc. is
// interpolated into rendered markup. cleanText() sanitizes on input; esc() is
// the defense-in-depth on output.
function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;').replace(/`/g, '&#96;');
}

// Basic email shape check (empty is allowed — caller decides if required).
function isValidEmail(s) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(s||'').trim()); }
// Loose phone check: digits/spaces/+()- only, 6–20 chars (empty allowed).
function isValidPhone(s) { const v = String(s||'').trim(); return v === '' || /^[\d+\-\s()]{6,20}$/.test(v); }
// Parse a non-negative number from a field; returns NaN when blank/invalid.
function posNum(v) { const n = parseFloat(v); return isNaN(n) ? NaN : Math.max(0, n); }

// Trigger a client-side file download (CSV/text).
function downloadFile(filename, content, mime) {
  const blob = new Blob([content], { type: (mime || 'text/plain') + ';charset=utf-8' });
  const url  = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click();
  setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 100);
}

function downloadSalesCSV() {
  const rows = App._salesRows || [];
  if (!rows.length) { showToast('Nothing to download', 'warning'); return; }
  const total = rows.reduce((s,r)=>s+r.revenue,0);
  const tTxns = rows.reduce((s,r)=>s+r.txns,0);
  const lines = [
    `Sales Report,${App._salesLabel || ''}`,
    `Business,${DB.settings.businessName}`,
    '',
    'Date,Transactions,Revenue',
    ...rows.map(r => `${r.date},${r.txns},${DB.money(r.revenue).toFixed(2)}`),
    `Total,${tTxns},${DB.money(total).toFixed(2)}`,
  ];
  downloadFile(`sales-report-${(App._salesLabel||'').replace(/[ ,]+/g,'-')}.csv`, lines.join('\n'), 'text/csv');
  showToast('Report downloaded', 'success');
}

// CSV-safe cell: quote/escape if it contains commas, quotes or newlines.
function csvCell(v) { const s = String(v == null ? '' : v); return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; }

function downloadInventoryCSV() {
  const prods = DB.products || [];
  if (!prods.length) { showToast('Nothing to download', 'warning'); return; }
  const rows = [];
  prods.forEach(p => {
    if (DB.hasVariants(p)) {
      p.variants.forEach(v => rows.push([`${p.name} — ${v.name}`, v.sku, p.category, v.stock, p.minStock,
        DB.money(v.cost).toFixed(2), DB.money(v.price).toFixed(2), DB.money((v.cost||0)*(v.stock||0)).toFixed(2),
        v.stock===0?'Out':v.stock<=p.minStock?'Low':'OK']));
    } else {
      const st = DB.productStock(p);
      rows.push([p.name, p.sku, p.category, st, p.minStock, DB.money(p.cost).toFixed(2), DB.money(p.price).toFixed(2),
        DB.money(DB.stockValue(p)).toFixed(2), st===0?'Out':st<=p.minStock?'Low':'OK']);
    }
  });
  const lines = [
    `Inventory,${DB.settings.businessName}`, '',
    'Product,SKU,Category,Stock,Min Stock,Unit Cost,Price,Stock Value,Status',
    ...rows.map(r => r.map(csvCell).join(',')),
  ];
  downloadFile('inventory.csv', lines.join('\n'), 'text/csv');
  showToast('Inventory exported', 'success');
}

function downloadStockMovesCSV() {
  const moves = DB.stockMoves || [];
  if (!moves.length) { showToast('Nothing to download', 'warning'); return; }
  const lines = [
    `Stock Movements,${DB.settings.businessName}`, '',
    'Date,Time,Product,Type,Change,Balance,Reason,User',
    ...moves.map(m => [m.date, m.time, m.productName, m.type, m.delta, m.balance == null ? '' : m.balance, m.reason, m.user].map(csvCell).join(',')),
  ];
  downloadFile('stock-movements.csv', lines.join('\n'), 'text/csv');
  showToast('Stock movements downloaded', 'success');
}

// Generic report export — each report tab stashes { name, headers, rows } in App._reportExport.
function exportReportCSV() {
  const ex = App._reportExport;
  if (!ex || !ex.rows || !ex.rows.length) { showToast('Nothing to download', 'warning'); return; }
  const lines = [
    `${ex.name},${DB.settings.businessName}`, '',
    ex.headers.map(csvCell).join(','),
    ...ex.rows.map(r => r.map(csvCell).join(',')),
  ];
  downloadFile(`${ex.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.csv`, lines.join('\n'), 'text/csv');
  showToast('Report downloaded', 'success');
}

/* ══════════════════════════════════════════════════════════
   ADVERTISEMENTS (owner-managed dashboard ad box)
   ══════════════════════════════════════════════════════════ */
function adIsOwner() { return !!(App.user && App.user.role === 'Owner'); }
// Role-based access: Owner & Store Manager can manage settings; Cashier cannot.
function canManage() { const r = App.user && App.user.role; return r === 'Owner' || r === 'Store Manager'; }

function adEmbedUrl(url) {
  const yt = url.match(/(?:youtube\.com\/.*[?&]v=|youtu\.be\/|youtube\.com\/embed\/)([\w-]{6,})/);
  if (yt) return 'https://www.youtube.com/embed/' + yt[1] + '?rel=0';
  const vm = url.match(/vimeo\.com\/(\d+)/);
  if (vm) return 'https://player.vimeo.com/video/' + vm[1];
  return null;
}

// Browsers (esp. Chrome) won't play data: video/quicktime, but .mov shares the
// mp4/ISO-BMFF container, so relabel it as mp4 to make typical (H.264) clips play.
function adVideoSrc(ad) {
  let s = (ad && (ad.live || ad.src)) || '';
  s = s.replace(/^data:video\/(quicktime|x-m4v|x-quicktime)/i, 'data:video/mp4');
  return s;
}

function adMediaHTML(ad) {
  if (!ad) return '';
  if (ad.type === 'video') return `<video src="${adVideoSrc(ad)}" autoplay muted loop playsinline preload="auto" style="width:100%;height:100%;object-fit:cover;display:block"></video>`;
  if (ad.type === 'embed') return `<iframe src="${ad.src}" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen style="width:100%;height:100%;border:0;display:block"></iframe>`;
  return `<img src="${ad.src}" alt="${(ad.name||'Ad').replace(/"/g,'')}" style="width:100%;height:100%;object-fit:cover;display:block"/>`;
}

// Make sure any video currently in the ad box is actually playing.
function _playAdVideo() {
  const v = document.querySelector('#adMedia video');
  if (v) { v.muted = true; const p = v.play(); if (p && p.catch) p.catch(() => {}); }
}

function renderAdBox() {
  const owner = adIsOwner();
  const ads = DB.ads || [];
  if (App.adIndex == null || App.adIndex >= ads.length) App.adIndex = 0;

  const header = `<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">
    <span style="font-size:15px;font-weight:700;color:var(--text-primary)">Promotions</span>
    ${owner ? `<span onclick="openManageAdsModal()" style="font-size:12px;color:var(--primary);font-weight:600;cursor:pointer">Manage</span>` : ''}
  </div>`;

  if (!ads.length) {
    return header + `<div class="card" style="overflow:hidden">
      <div style="aspect-ratio:16/9;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;background:var(--surface-2);text-align:center;padding:16px">
        <svg viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" stroke-width="1.6" style="width:34px;height:34px;opacity:.6"><path d="m3 11 18-5v12L3 14v-3z"/><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/></svg>
        <div style="font-size:13px;font-weight:600;color:var(--text-secondary)">No ads yet</div>
        ${owner ? `<button class="btn btn-primary btn-sm" onclick="openManageAdsModal()">+ Add Ad</button>` : `<div style="font-size:12px;color:var(--text-muted)">Check back soon</div>`}
      </div></div>`;
  }

  const cur  = ads[App.adIndex];
  const dots = ads.length > 1
    ? `<div id="adDots" style="display:flex;justify-content:center;gap:6px;margin-top:10px">${ads.map((a,i)=>`<span onclick="window._showAd(${i})" style="width:7px;height:7px;border-radius:50%;background:${i===App.adIndex?'var(--primary)':'var(--border-md)'};cursor:pointer;transition:var(--t)"></span>`).join('')}</div>`
    : '';

  return header + `<div class="card" style="overflow:hidden;position:relative">
      <span style="position:absolute;top:8px;left:8px;z-index:2;background:rgba(0,0,0,0.45);color:#fff;font-size:9px;font-weight:700;letter-spacing:0.5px;text-transform:uppercase;padding:2px 8px;border-radius:99px">Ad</span>
      <div id="adMedia" style="aspect-ratio:16/9;background:#000">${adMediaHTML(cur)}</div>
    </div>${dots}`;
}

function startAdRotation() {
  clearInterval(App._adTimer);
  setTimeout(_playAdVideo, 60);   // ensure the current video plays after render
  App._adTimer = setInterval(() => {
    const box = document.getElementById('adMedia');
    if (!box) { clearInterval(App._adTimer); return; }   // left the dashboard
    const ads = DB.ads || [];
    if (ads.length < 2) return;
    window._showAd(App.adIndex + 1);
  }, 8000);
}

window._showAd = (i) => {
  const ads = DB.ads || [];
  if (!ads.length) return;
  App.adIndex = ((i % ads.length) + ads.length) % ads.length;
  const m = document.getElementById('adMedia');
  if (m) { m.innerHTML = adMediaHTML(ads[App.adIndex]); _playAdVideo(); }
  document.querySelectorAll('#adDots span').forEach((d, idx) => {
    d.style.background = idx === App.adIndex ? 'var(--primary)' : 'var(--border-md)';
  });
};

function openManageAdsModal() {
  if (!adIsOwner()) { showToast('Only the owner can manage ads', 'warning'); return; }
  function body() {
    const ads = DB.ads || [];
    const list = ads.length ? ads.map(a => `
      <div style="display:flex;align-items:center;gap:10px;padding:8px;border:1px solid var(--border);border-radius:12px;margin-bottom:8px">
        <div style="width:58px;height:38px;border-radius:7px;overflow:hidden;background:#000;flex-shrink:0;display:flex;align-items:center;justify-content:center">
          ${a.type==='image' ? `<img src="${a.src}" style="width:100%;height:100%;object-fit:cover">` : `<svg viewBox="0 0 24 24" fill="#fff" style="width:18px;height:18px"><path d="M8 5v14l11-7z"/></svg>`}
        </div>
        <div style="flex:1;min-width:0">
          <div style="font-size:13px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${a.name || a.type}</div>
          <div style="font-size:11px;color:var(--text-muted);text-transform:capitalize">${a.type}</div>
        </div>
        <button class="btn btn-danger btn-sm" onclick="removeAd('${a.id}')">Delete</button>
      </div>`).join('') : `<div style="padding:18px;text-align:center;color:var(--text-muted);font-size:13px">No ads yet</div>`;
    return `
      <div style="margin-bottom:16px">${list}</div>
      <div style="border-top:1px solid var(--border);padding-top:16px">
        <div style="font-size:13px;font-weight:700;margin-bottom:10px">Add New Ad</div>
        <label class="btn btn-secondary" style="width:100%;margin-bottom:12px;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:16px;height:16px"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
          Upload image or video
          <input type="file" accept="image/*,video/*" style="display:none" onchange="addUploadedAd(this)" />
        </label>
        <div style="font-size:11px;color:var(--text-muted);text-align:center;margin-bottom:10px">— or paste a link —</div>
        <div style="display:flex;gap:8px">
          <input type="text" id="adUrlInput" class="form-control" placeholder="Image, video, or YouTube URL" />
          <button class="btn btn-primary" onclick="addUrlAd()">Add</button>
        </div>
      </div>`;
  }
  window._adModalRefresh = () => { const b = document.getElementById('adModalBody'); if (b) b.innerHTML = body(); };
  openModal('Manage Ads', `<div id="adModalBody">${body()}</div>`,
    `<button class="btn btn-secondary" onclick="closeModal();navigate('dashboard')">Done</button>`);
}

/* ── IndexedDB ad persistence — stores the actual file blob, so any size can
   be saved permanently (localStorage's ~5MB limit doesn't apply here). ── */
let _adsDBPromise = null;
function adsDB() {
  if (!_adsDBPromise) _adsDBPromise = new Promise((resolve, reject) => {
    const r = indexedDB.open('dooziAds', 1);
    r.onupgradeneeded = e => { const db = e.target.result; if (!db.objectStoreNames.contains('ads')) db.createObjectStore('ads', { keyPath: 'id' }); };
    r.onsuccess = () => resolve(r.result);
    r.onerror   = () => reject(r.error);
  });
  return _adsDBPromise;
}
function adsPut(rec)   { return adsDB().then(db => new Promise((res,rej)=>{ const tx=db.transaction('ads','readwrite'); tx.objectStore('ads').put(rec); tx.oncomplete=()=>res(); tx.onerror=()=>rej(tx.error); })); }
function adsRemove(id) { return adsDB().then(db => new Promise((res,rej)=>{ const tx=db.transaction('ads','readwrite'); tx.objectStore('ads').delete(id); tx.oncomplete=()=>res(); tx.onerror=()=>rej(tx.error); })); }
function adsGetAll()   { return adsDB().then(db => new Promise((res,rej)=>{ const tx=db.transaction('ads','readonly'); const q=tx.objectStore('ads').getAll(); q.onsuccess=()=>res(q.result||[]); q.onerror=()=>rej(q.error); })); }

async function adsInit() {
  try {
    const recs = await adsGetAll();
    recs.sort((a,b) => (parseInt(String(a.id).replace(/\D/g,''))||0) - (parseInt(String(b.id).replace(/\D/g,''))||0));
    DB.ads = recs.map(r => {
      if (r.blob) { const url = URL.createObjectURL(r.blob); return { id:r.id, type:r.type, name:r.name, src:url, live:url }; }
      return { id:r.id, type:r.type, name:r.name, src:r.url };
    });
    DB.nextAdId = recs.reduce((m,r)=>Math.max(m, parseInt(String(r.id).replace(/\D/g,''))||0), 0) + 1;
    if (App.currentPage === 'dashboard') navigate('dashboard');   // refresh box once loaded
  } catch (e) { /* IndexedDB unavailable — ads stay in-memory for the session */ }
}

function addUploadedAd(input) {
  const file = input.files && input.files[0];
  if (!file) return;
  const type = file.type.startsWith('video') ? 'video' : 'image';
  // Force mp4 MIME for videos so QuickTime (.mov) H.264 clips play in Chrome.
  const blob = (type === 'video') ? new Blob([file], { type: 'video/mp4' }) : file;
  const url  = URL.createObjectURL(blob);
  const rec  = DB.addAd({ type, name: file.name, src: url, live: url });
  App.adIndex = DB.ads.length - 1;
  adsPut({ id: rec.id, type, name: file.name, blob })
    .then(() => showToast('Ad saved permanently', 'success'))
    .catch(() => showToast('Saved for this session only (storage unavailable)', 'warning'));
  window._adModalRefresh && window._adModalRefresh();
}

function addUrlAd() {
  const el = document.getElementById('adUrlInput');
  const v  = (el && el.value || '').trim();
  if (!v) { showToast('Enter a link first', 'warning'); return; }
  const embed = adEmbedUrl(v);
  let type = 'image', src = v;
  if (embed) { type = 'embed'; src = embed; }
  else if (/\.(mp4|webm|ogg|mov|m4v)(\?|#|$)/i.test(v)) { type = 'video'; }
  const name = v.replace(/^https?:\/\//, '').slice(0, 40);
  const rec = DB.addAd({ type, src, name });
  App.adIndex = DB.ads.length - 1;
  adsPut({ id: rec.id, type, name, url: src }).catch(()=>{});
  showToast('Ad added', 'success');
  window._adModalRefresh && window._adModalRefresh();
}

function removeAd(id) {
  DB.deleteAd(id);
  App.adIndex = 0;
  adsRemove(id).catch(()=>{});
  showToast('Ad deleted', 'info');
  window._adModalRefresh && window._adModalRefresh();
}

/* ══════════════════════════════════════════════════════════
   DASHBOARD
   ══════════════════════════════════════════════════════════ */
/* ── Part 5: Daily pending-delivery reminder (dashboard banner) ── */
function deliveryReminderBannerHTML() {
  const today = new Date().toISOString().split('T')[0];
  const n = DB.pendingDeliveriesOn(today).length;
  if (!n) return '';
  return `<div class="reminder-banner" onclick="goToPendingDeliveries()" role="button" tabindex="0"
      onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();goToPendingDeliveries()}">
    <div class="rb-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:20px;height:20px"><rect x="1" y="3" width="15" height="13"/><path d="M16 8h4l3 3v5h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg></div>
    <div style="flex:1;min-width:0">
      <div class="rb-title">${n} pending ${n===1?'delivery':'deliveries'} today</div>
      <div class="rb-sub">Tap to view and mark them delivered.</div>
    </div>
    <svg viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" stroke-width="2" style="width:18px;height:18px;flex-shrink:0" aria-hidden="true"><polyline points="9 18 15 12 9 6"/></svg>
  </div>`;
}
// Jump to the Orders hub pre-filtered to today's pending deliveries.
function goToPendingDeliveries() {
  App.orderDateFilter   = 'today';
  App.orderTypeFilter   = 'delivery';
  App.orderStatusFilter = 'pending';
  navigate('orders');
}

function renderDashboard(el) {
  const _nd = new Date(); const today = `${_nd.getFullYear()}-${String(_nd.getMonth()+1).padStart(2,'0')}-${String(_nd.getDate()).padStart(2,'0')}`;
  // Revenue figures count completed sales only — refunds are excluded.
  const sales      = DB.transactions.filter(t => t.status !== 'refunded');
  const todayTxn   = sales.filter(t => t.date === today);
  const todayRev   = DB.money(todayTxn.reduce((s,t) => s + DB.saleCollected(t), 0));   // collected incl tax, net of refunds (drives payment-split pie)
  const todayNet   = DB.money(todayTxn.reduce((s,t) => s + DB.saleNet(t), 0)); // net sales ex-tax (headline)
  const orders     = sales.length;
  const avgTicket  = orders ? DB.money(sales.reduce((s,t) => s + DB.saleCollected(t), 0) / orders) : 0;
  const grossP     = DB.money(sales.reduce((s,t) => s + (DB.saleNet(t) - DB.saleCost(t)), 0));
  const lowStock   = DB.products.filter(p => p.stock > 0 && p.stock <= p.minStock);

  // Daily pie data
  const cashToday  = DB.money(todayTxn.filter(t => t.method==='cash').reduce((s,t) => s+DB.saleCollected(t), 0));
  const bankToday  = DB.money(todayTxn.filter(t => t.method==='bank').reduce((s,t) => s+DB.saleCollected(t), 0));
  const cardToday  = DB.money(todayTxn.filter(t => t.method==='card').reduce((s,t) => s+DB.saleCollected(t), 0));
  const otherToday = DB.money(todayRev - cashToday - bankToday - cardToday);

  function pieSlice(cx, cy, r, startDeg, endDeg, color) {
    if (endDeg - startDeg >= 360) endDeg = 359.99;
    const toRad = d => (d - 90) * Math.PI / 180;
    const x1 = cx + r * Math.cos(toRad(startDeg));
    const y1 = cy + r * Math.sin(toRad(startDeg));
    const x2 = cx + r * Math.cos(toRad(endDeg));
    const y2 = cy + r * Math.sin(toRad(endDeg));
    const large = endDeg - startDeg > 180 ? 1 : 0;
    return `<path d="M${cx},${cy} L${x1.toFixed(1)},${y1.toFixed(1)} A${r},${r} 0 ${large} 1 ${x2.toFixed(1)},${y2.toFixed(1)} Z" fill="${color}"/>`;
  }

  const pieData = [];
  if (cashToday  > 0) pieData.push({label:'Cash',  val:cashToday,  color:'#4ECDC4'});
  if (cardToday  > 0) pieData.push({label:'Card',  val:cardToday,  color:'#5B8DEF'});
  if (bankToday  > 0) pieData.push({label:'Bank',  val:bankToday,  color:'#FFE66D'});
  if (otherToday > 0.005) pieData.push({label:'Other', val:otherToday, color:'#14877A'});

  let pieSVG = '';
  if (!pieData.length || todayRev === 0) {
    pieSVG = `<circle cx="60" cy="60" r="52" fill="var(--border)"/>
      <text x="60" y="64" text-anchor="middle" font-size="9" fill="var(--text-muted)" font-family="sans-serif">No sales</text>`;
  } else {
    let cumDeg = 0;
    pieData.forEach(d => {
      const deg = (d.val / todayRev) * 360;
      pieSVG += pieSlice(60, 60, 52, cumDeg, cumDeg + deg, d.color);
      cumDeg += deg;
    });
  }

  const pieLegend = pieData.map(d =>
    `<div style="display:flex;align-items:center;gap:4px;font-size:10px;color:var(--text-secondary)">
      <div style="width:8px;height:8px;border-radius:2px;background:${d.color};flex-shrink:0"></div>
      <span>${d.label}</span>
    </div>`
  ).join('') || `<div style="font-size:10px;color:var(--text-muted)">No data yet</div>`;

  // Monthly bar chart — last 6 months
  const monthlyData = {};
  const now = new Date();
  const localMoKey = d => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
  const currentMoKey = localMoKey(now);
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    monthlyData[localMoKey(d)] = 0;
  }
  sales.forEach(t => {
    const mo = (t.date||'').slice(0,7);
    if (monthlyData.hasOwnProperty(mo)) monthlyData[mo] += t.total;
  });
  const moEntries = Object.entries(monthlyData);
  const moMax = Math.max(...moEntries.map(([,v]) => v), 1);
  const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  // Compact money label for above-bar values (e.g. 25600 → "25.6k").
  const compactNum = v => v>=1000 ? (v/1000).toFixed(v>=10000?0:1).replace(/\.0$/,'')+'k' : String(Math.round(v||0));
  const barChart = `
    <div class="bar-chart">
      <div class="bar-chart-grid"><span></span><span></span><span></span><span></span><span></span></div>
      <div class="bar-chart-bars">
        ${moEntries.map(([key, val], i) => {
          const pct = Math.max(val/moMax*100, val>0?4:0);
          const mo = parseInt(key.slice(5,7)) - 1;
          const isCurrent = key === currentMoKey;
          return `<div class="bar-col">
            <div class="bar-val${isCurrent?' current':''}">${val>0?compactNum(val):''}</div>
            <div class="bar-track"><div class="bar-fill${isCurrent?' current':''}" style="height:${pct}%;animation-delay:${i*45}ms" title="${monthNames[mo]}: ${DB.fmt(val)}"></div></div>
            <div class="bar-x${isCurrent?' current':''}">${monthNames[mo]}</div>
          </div>`;
        }).join('')}
      </div>
    </div>`;

  const lowStockItems = lowStock.slice(0, 4).map(p => `
    <div class="low-stock-item">
      <div class="low-stock-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg></div>
      <div style="flex:1;min-width:0">
        <div class="low-stock-name">${p.name}</div>
        <div class="low-stock-count">${p.stock} left · Min ${p.minStock}</div>
      </div>
      <div class="low-stock-plus" onclick="openRestockModal('${p.id}')">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
      </div>
    </div>`).join('') || `<div style="padding:20px;text-align:center;color:var(--text-muted);font-size:13px">All stock healthy ✓</div>`;

  const biz = DB.settings;

  // This-month figures. Revenue is recognized NET OF TAX (GST is a liability,
  // not income); Net Profit subtracts both cost of goods and operating expenses.
  const monthSales = sales.filter(t => (t.date||'').startsWith(currentMoKey));
  const monthRev = DB.money(monthSales.reduce((s,t)=>s+DB.saleNet(t),0));   // net sales (ex-tax)
  const monthCOGS= DB.money(monthSales.reduce((s,t)=>s+DB.saleCost(t),0));
  const monthExp = DB.money(DB.expenses.filter(e => (e.date||'').startsWith(currentMoKey)).reduce((s,e)=>s+e.amount,0));
  const monthNet = DB.money(monthRev - monthCOGS - monthExp);

  // Top products this month (by revenue) — from itemized sales.
  const prodMap = {};
  sales.filter(t => (t.date||'').startsWith(currentMoKey)).forEach(t => {
    (t.cartItems||[]).forEach(i => {
      const key = i.id || i.name;
      if (!prodMap[key]) prodMap[key] = { name:i.name, qty:0, revenue:0 };
      prodMap[key].qty     += i.qty;
      prodMap[key].revenue += i.price * i.qty;
    });
  });
  const topProducts = Object.values(prodMap).sort((a,b)=>b.revenue-a.revenue).slice(0,5);
  const topMax = Math.max(...topProducts.map(p=>p.revenue), 1);
  const topBarColors = ['var(--primary)','var(--teal-bright)','#4ECDC4','#7FD8C8','#B5E8DF'];
  const topProductsChart = topProducts.length ? topProducts.map((p,i)=>`
    <div style="margin-bottom:${i===topProducts.length-1?0:11}px">
      <div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:4px">
        <span style="font-weight:600;color:var(--text-primary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:62%">${p.name}</span>
        <span style="font-weight:700;color:var(--text-secondary)">${DB.fmt(p.revenue)}</span>
      </div>
      <div style="height:8px;border-radius:99px;background:var(--bg);overflow:hidden">
        <div style="height:100%;width:${Math.max(p.revenue/topMax*100,4)}%;border-radius:99px;background:${topBarColors[i]||'var(--primary)'}"></div>
      </div>
    </div>`).join('') : `<div style="padding:14px 0;text-align:center;color:var(--text-muted);font-size:12.5px">No itemized sales this month yet.</div>`;

  const quickActions = [
    { label:'New Sale',  action:"openQuickOrder()",       icon:'<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>' },
    { label:'Reports',   action:"navigate('reports')",     icon:'<line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>' },
    { label:'Inventory', action:"navigate('inventory')",   icon:'<path d="M20 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>' },
    { label:'Settings',  action:"navigate('settings')",    icon:'<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>' },
  ];
  const statsGrid = [
    { label:'Today Orders', value:todayTxn.length,    icon:'<path d="M14 2H6a2 2 0 0 0-2 2v16l3-3 3 3 3-3 3 3V4a2 2 0 0 0-2-2z"/>',                   bg:'var(--pastel-teal)',   stroke:'var(--primary)' },
    { label:'Cash Today',   value:DB.fmt(cashToday),  icon:'<line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>',  bg:'var(--pastel-green)',  stroke:'#059669' },
    { label:'Bank Today',   value:DB.fmt(bankToday),  icon:'<rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/>',              bg:'var(--pastel-yellow)', stroke:'#D97706' },
    { label:'Gross Profit', value:DB.fmt(grossP),     icon:'<polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>',                bg:'var(--pastel-blue)',   stroke:'#2563EB' },
    { label:'Avg Ticket',   value:DB.fmt(avgTicket),  icon:'<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>', bg:'var(--pastel-purple)', stroke:'#7C3AED' },
    { label:'All Orders',   value:orders,             icon:'<circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>',  bg:'var(--pastel-pink)',  stroke:'#DB2777' },
  ];

  el.innerHTML = `
      <!-- ═══ HEADER (on the global teal band) ═══ -->
      <div style="position:relative;z-index:1;padding:18px 16px 2px">
        <div style="margin-bottom:18px">
          <div style="font-size:12px;color:rgba(255,255,255,0.78);font-weight:500">Welcome back</div>
          <div style="font-size:18px;font-weight:800;color:#fff;letter-spacing:-0.3px;text-shadow:0 1px 3px rgba(0,0,0,0.12)">${esc(biz.businessName)}</div>
        </div>
        <div style="text-align:center;margin-bottom:4px">
          <div style="font-size:11.5px;color:rgba(255,255,255,0.82);font-weight:700;text-transform:uppercase;letter-spacing:1.2px;margin-bottom:8px">Today's Sales <span style="font-weight:600;opacity:.8">· ex-tax</span></div>
          <div style="font-size:42px;font-weight:900;color:#fff;letter-spacing:-2px;line-height:1;text-shadow:0 2px 10px rgba(0,0,0,0.15)">${DB.fmt(todayNet)}</div>
          <div style="display:flex;justify-content:center;gap:10px;margin-top:14px">
            <div style="background:rgba(255,255,255,0.92);border-radius:20px;padding:5px 14px;box-shadow:var(--shadow-sm)"><span style="font-size:11.5px;color:var(--text-secondary);font-weight:600">${todayTxn.length} orders</span></div>
            <div style="background:rgba(255,255,255,0.92);border-radius:20px;padding:5px 14px;box-shadow:var(--shadow-sm)"><span style="font-size:11.5px;color:var(--text-secondary);font-weight:600">Avg ${DB.fmt(avgTicket)}</span></div>
          </div>
        </div>
      </div>

      <!-- ═══ CONTENT ═══ -->
      <div style="position:relative;z-index:1;padding:18px 14px 0">

      ${deliveryReminderBannerHTML()}

      <!-- ═══ THIS MONTH — Income / Expense ═══ -->
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">
        <span style="font-size:15px;font-weight:700;color:var(--text-primary)">This Month</span>
        <span onclick="navigate('reports')" style="font-size:12px;color:var(--primary);font-weight:600;cursor:pointer">Analytics</span>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:14px">
        <div class="card" style="padding:16px">
          <div style="display:flex;align-items:center;gap:9px;margin-bottom:12px">
            <div style="width:38px;height:38px;border-radius:12px;background:var(--primary-light);display:flex;align-items:center;justify-content:center">
              <svg viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2.2" style="width:18px;height:18px"><line x1="7" y1="17" x2="17" y2="7"/><polyline points="8 7 17 7 17 16"/></svg>
            </div>
            <span style="font-size:12.5px;color:var(--text-secondary);font-weight:600">Sales <span style="font-weight:500;color:var(--text-muted);font-size:11px">(ex-tax)</span></span>
          </div>
          <div style="font-size:20px;font-weight:900;color:var(--text-primary);letter-spacing:-0.5px">${DB.fmt(monthRev)}</div>
        </div>
        <div class="card" style="padding:16px">
          <div style="display:flex;align-items:center;gap:9px;margin-bottom:12px">
            <div style="width:38px;height:38px;border-radius:12px;background:var(--accent-light);display:flex;align-items:center;justify-content:center">
              <svg viewBox="0 0 24 24" fill="none" stroke="var(--accent-dark)" stroke-width="2.2" style="width:18px;height:18px"><line x1="7" y1="7" x2="17" y2="17"/><polyline points="17 8 17 17 8 17"/></svg>
            </div>
            <span style="font-size:12.5px;color:var(--text-secondary);font-weight:600">Expense</span>
          </div>
          <div style="font-size:20px;font-weight:900;color:var(--text-primary);letter-spacing:-0.5px">${DB.fmt(monthExp)}</div>
        </div>
      </div>

      <!-- ═══ SALES TREND (6 months) ═══ -->
      <div class="card" style="padding:16px;margin-bottom:14px">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px">
          <span style="font-size:13.5px;font-weight:700;color:var(--text-primary)">Sales Trend</span>
          <span style="font-size:11px;color:var(--text-muted);font-weight:600">Last 6 months</span>
        </div>
        ${barChart}
      </div>

      <!-- ═══ ADS / PROMOTIONS (above Top Products) ═══ -->
      <div style="margin-bottom:14px">${renderAdBox()}</div>

      <!-- ═══ TOP PRODUCTS (this month) ═══ -->
      <div class="card" style="padding:16px;margin-bottom:20px">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px">
          <span style="font-size:13.5px;font-weight:700;color:var(--text-primary)">Top Products</span>
          <span onclick="navigate('reports')" style="font-size:11px;color:var(--primary);font-weight:600;cursor:pointer">Details</span>
        </div>
        ${topProductsChart}
      </div>

      <div class="card" style="padding:13px 16px;margin-bottom:20px;display:flex;align-items:center;justify-content:space-between">
        <div>
          <span style="font-size:12.5px;color:var(--text-secondary);font-weight:600">Net Profit</span>
          <div style="font-size:10.5px;color:var(--text-muted);margin-top:1px">After cost of goods &amp; expenses</div>
        </div>
        <span style="font-size:16px;font-weight:900;letter-spacing:-0.4px;color:${monthNet>=0?'var(--success)':'var(--danger)'}">${monthNet>=0?'+':''}${DB.fmt(monthNet)}</span>
      </div>

      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">
        <span style="font-size:15px;font-weight:700;color:var(--text-primary)">Today's Split</span>
      </div>
      <div class="card" style="padding:14px;margin-bottom:20px;display:flex;align-items:center;gap:16px">
        <svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" style="width:100px;height:100px;flex-shrink:0">${pieSVG}</svg>
        <div style="flex:1">
          <div style="font-size:12px;font-weight:700;color:var(--text-muted);margin-bottom:10px;text-transform:uppercase;letter-spacing:0.5px">Payment Methods</div>
          <div style="display:flex;flex-direction:column;gap:8px">
            ${pieData.length ? pieData.map(d=>`
              <div style="display:flex;align-items:center;justify-content:space-between">
                <div style="display:flex;align-items:center;gap:7px">
                  <div style="width:10px;height:10px;border-radius:3px;background:${d.color};flex-shrink:0"></div>
                  <span style="font-size:13px;font-weight:600;color:var(--text-primary)">${d.label}</span>
                </div>
                <span style="font-size:13px;font-weight:700;color:var(--text-primary)">${DB.fmt(d.val)}</span>
              </div>`).join('') :
              `<div style="font-size:13px;color:var(--text-muted)">No sales today</div>`}
          </div>
        </div>
      </div>

      <!-- ═══ STATS GRID (Payment List style) ═══ -->
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">
        <span style="font-size:15px;font-weight:700;color:var(--text-primary)">Today's Summary</span>
        <span onclick="navigate('sales')" style="font-size:12px;color:var(--primary);font-weight:600;cursor:pointer">See more</span>
      </div>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:20px">
        ${statsGrid.map(s=>`
          <div style="background:var(--surface);border-radius:14px;padding:12px 10px;border:1px solid var(--border);box-shadow:var(--shadow-xs)">
            <div style="width:34px;height:34px;border-radius:10px;background:${s.bg};display:flex;align-items:center;justify-content:center;margin-bottom:8px">
              <svg viewBox="0 0 24 24" fill="none" stroke="${s.stroke}" stroke-width="2" style="width:16px;height:16px">${s.icon}</svg>
            </div>
            <div style="font-size:13px;font-weight:800;color:var(--text-primary);line-height:1.2">${s.value}</div>
            <div style="font-size:10px;color:var(--text-muted);font-weight:500;margin-top:3px">${s.label}</div>
          </div>`).join('')}
      </div>

      <!-- ═══ LOW STOCK — horizontal scroll (Promo style) ═══ -->
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">
        <span style="font-size:15px;font-weight:700;color:var(--text-primary)">Low Stock Alerts</span>
        <span onclick="navigate('inventory')" style="font-size:12px;color:var(--primary);font-weight:600;cursor:pointer">See more</span>
      </div>
      <div style="display:flex;gap:10px;overflow-x:auto;padding-bottom:8px;margin-bottom:20px;-webkit-overflow-scrolling:touch;scrollbar-width:none">
        ${lowStock.length ? lowStock.map(p=>`
          <div style="flex-shrink:0;width:130px;background:var(--surface);border-radius:16px;padding:14px 12px;border:1px solid var(--border);box-shadow:var(--shadow-xs)">
            <div style="font-size:30px;margin-bottom:8px">${p.emoji}</div>
            <div style="font-size:12px;font-weight:700;color:var(--text-primary);margin-bottom:3px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${p.name}</div>
            <div style="font-size:11px;color:var(--danger);font-weight:600;margin-bottom:8px">${p.stock} left · Min ${p.minStock}</div>
            <button onclick="openRestockModal('${p.id}')" style="width:100%;background:#FFE66D;color:#0D2E2C;border:none;border-radius:8px;padding:5px 4px;font-size:11px;font-weight:700;cursor:pointer">+ Restock</button>
          </div>`).join('') :
          `<div style="padding:16px 0;color:var(--text-muted);font-size:13px">✓ All stock levels healthy</div>`}
      </div>

      <!-- ═══ RECENT TRANSACTIONS ═══ -->
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">
        <span style="font-size:15px;font-weight:700;color:var(--text-primary)">Recent Transactions</span>
        <span onclick="navigate('sales')" style="font-size:12px;color:var(--primary);font-weight:600;cursor:pointer">View History</span>
      </div>
      <div class="card" style="margin-bottom:16px">
        <div class="txn-list">${DB.transactions.slice(0,5).map(txnCard).join('')}</div>
      </div>
    </div>`;
  startAdRotation();
}

/* ══════════════════════════════════════════════════════════
   POS TERMINAL
   ══════════════════════════════════════════════════════════ */
function renderPOS(el) {
  const cats = ['All', ...new Set(DB.products.map(p => p.category))];
  const filtered = DB.products.filter(p => {
    const catOk = App.activeCategory === 'All' || p.category === App.activeCategory;
    const srOk  = p.name.toLowerCase().includes(App.posSearch.toLowerCase());
    return catOk && srOk;
  });

  const catPills = cats.map(c =>
    `<div class="cat-pill${c===App.activeCategory?' active':''}" onclick="App.activeCategory='${c}';navigate('pos')">${c}</div>`
  ).join('');

  const productBgs = ['var(--pastel-blue)','var(--pastel-purple)','var(--pastel-pink)','var(--pastel-green)','var(--pastel-yellow)','var(--pastel-orange)','var(--pastel-teal)'];
  const products = filtered.map((p,i) => {
    const oos = p.stock === 0;
    return `<div class="product-card${oos?' out-of-stock':''}" onclick="addToCart('${p.id}')" style="position:relative">
      ${p.stock<=p.minStock&&p.stock>0?'<div class="product-low-badge">Low</div>':''}
      <div class="product-img" style="background:${productBgs[i%7]}">${p.emoji}</div>
      <div class="product-card-body">
        <div class="product-card-name">${p.name}</div>
        <div class="product-card-footer">
          <div class="product-card-price">${DB.fmt(p.price)}</div>
          <div class="product-add-btn">+</div>
        </div>
      </div>
    </div>`;
  }).join('') || `<div style="grid-column:1/-1;padding:40px;text-align:center;color:var(--text-muted)">No products found</div>`;

  const subtotal = App.cart.reduce((s,i) => s+i.price*i.qty, 0);
  const discAmt  = App.discountType==='percent' ? subtotal*(App.discount/100) : Math.min(App.discount,subtotal);
  const taxAmt   = (subtotal-discAmt)*(DB.settings.taxRate/100);
  const total    = subtotal - discAmt + taxAmt;
  const cartCount = App.cart.reduce((s,i)=>s+i.qty,0);

  const cartItems = App.cart.length === 0
    ? `<div class="cart-empty">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
        <p>Cart is empty</p>
        <p style="font-size:12px">Tap a product to add it</p>
      </div>`
    : App.cart.map(item => `
      <div class="cart-item">
        <div class="cart-item-img">${item.emoji}</div>
        <div class="cart-item-info">
          <div class="cart-item-name">${esc(item.name)}</div>
          <div class="cart-item-price-line">${DB.fmt(item.price)} each</div>
        </div>
        <div class="qty-control">
          <div class="qty-btn" role="button" tabindex="0" aria-label="Decrease ${esc(item.name)} quantity" onclick="changeQty('${item.id}',-1)" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();changeQty('${item.id}',-1)}">−</div>
          <span class="qty-value" aria-label="Quantity ${item.qty}">${item.qty}</span>
          <div class="qty-btn" role="button" tabindex="0" aria-label="Increase ${esc(item.name)} quantity" onclick="changeQty('${item.id}',1)" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();changeQty('${item.id}',1)}">+</div>
        </div>
        <div class="cart-item-total">${DB.fmt(item.price*item.qty)}</div>
        <div class="cart-remove-btn" role="button" tabindex="0" aria-label="Remove ${esc(item.name)} from order" onclick="removeFromCart('${item.id}')" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();removeFromCart('${item.id}')}">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </div>
      </div>`).join('');

  // Product list rows (no images)
  const productRows = filtered.map(p => {
    const variantProd = DB.hasVariants(p);
    const stock  = DB.productStock(p);
    const oos    = stock === 0;
    const expanded = variantProd && App._expandVar === p.id;
    // For variant products the cart count is the sum of all their variant lines.
    const inCartQty = variantProd
      ? App.cart.filter(i => i.productId === p.id).reduce((s,i)=>s+i.qty,0)
      : (App.cart.find(i => i.id === p.id)?.qty || 0);
    const priceLabel = variantProd ? `from ${DB.fmt(DB.variantMinPrice(p))}` : DB.fmt(p.price);
    const subLabel = variantProd
      ? `${esc(p.category)} · ${p.variants.length} options · ${stock} in stock`
      : `${esc(p.category)} · ${stock} in stock`;
    return `<div class="pos-list-item${oos?' pos-list-oos':''}" style="${oos?'opacity:0.4;':''}"
      onmouseover="this.style.background='var(--primary-light)'" onmouseout="this.style.background=''">
      <div style="font-size:22px;flex-shrink:0;width:32px;text-align:center">${p.emoji}</div>
      <div style="flex:1;min-width:0">
        <div style="font-size:13.5px;font-weight:600;color:var(--text-primary)">${esc(p.name)}</div>
        <div style="font-size:11.5px;color:var(--text-muted)">${subLabel}</div>
      </div>
      ${stock<=p.minStock&&stock>0?`<span style="background:var(--accent);color:#333;font-size:9px;font-weight:800;padding:2px 6px;border-radius:99px;margin-right:4px">LOW</span>`:''}
      <div style="font-weight:800;font-size:14px;color:var(--text-primary);min-width:65px;text-align:right;${variantProd?'font-size:12px;':''}">${priceLabel}</div>
      ${!oos?`<button class="product-add-btn" aria-label="${variantProd?`Choose a variant of ${esc(p.name)}`:`Add ${esc(p.name)} to order`}" onclick="event.stopPropagation();addToCart('${p.id}')" style="margin-left:8px;flex-shrink:0">${variantProd?(expanded?'×':(inCartQty||'›')):(inCartQty||'+')}
      </button>`:''}
    </div>${expanded ? variantPickerHTML(p, "addToCart('%VID%')") : ''}`;
  }).join('') || `<div style="padding:32px;text-align:center;color:var(--text-muted)">No products found</div>`;

  el.innerHTML = `
    <!-- Cart Panel (TOP) -->
    <div class="section" style="padding-top:14px;position:sticky;top:calc(var(--topbar-height) + 6px);z-index:30;background:var(--bg)">
      <div class="cart-panel">
        <div class="cart-header">
          <div class="cart-header-left">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
            New Order ${cartCount>0?`<span style="background:#FFE66D;color:#0D2E2C;border-radius:99px;padding:1px 8px;font-size:11px;font-weight:700;margin-left:4px">${cartCount}</span>`:''}
          </div>
          <div style="display:flex;align-items:center;gap:8px">
            <button class="icon-btn" onclick="openScanner()" aria-label="Scan barcode" title="Scan barcode" style="width:28px;height:28px;background:var(--primary-light);color:var(--primary)">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:16px;height:16px"><path d="M3 5v14M7 5v14M11 5v14M15 5v10M19 5v14M21 5v14"/></svg>
            </button>
            <button onclick="openProductPickerModal()" aria-label="Add item" style="width:28px;height:28px;border-radius:50%;background:#FFE66D;color:#0D2E2C;border:none;font-size:18px;font-weight:700;display:flex;align-items:center;justify-content:center;cursor:pointer;line-height:1">+</button>
            ${App.cart.length>0?`<span class="cart-clear" onclick="App.cart=[];App.discount=0;navigate('pos')">Clear</span>`:''}
          </div>
        </div>

        <!-- Item search inside cart -->
        <div style="padding:8px 12px;border-bottom:1px solid var(--border)">
          <div class="pos-search-bar" style="padding:7px 12px">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            <input id="cartSearchInput" type="text" placeholder="Search &amp; add item to order…" value="${App.posSearch}" oninput="App.posSearch=this.value;navigate('pos')" />
            ${App.posSearch?`<span onclick="App.posSearch='';navigate('pos')" style="color:var(--text-muted);cursor:pointer;font-size:16px;line-height:1">×</span>`:''}
          </div>
        </div>

        ${App.posSearch && filtered.length > 0 ? `
        <div style="max-height:160px;overflow-y:auto;border-bottom:1px solid var(--border)">
          ${filtered.slice(0,6).map(p=>`
            <div onclick="addToCart('${p.id}')" style="display:flex;align-items:center;gap:10px;padding:9px 14px;cursor:pointer;transition:var(--t)" onmouseover="this.style.background='var(--primary-light)'" onmouseout="this.style.background=''">
              <span style="font-size:18px">${p.emoji}</span>
              <span style="flex:1;font-size:13px;font-weight:600">${esc(p.name)}</span>
              <span style="font-size:12px;color:var(--text-muted)">${p.stock} left</span>
              <span style="font-size:13px;font-weight:800;color:var(--primary)">${DB.fmt(p.price)}</span>
            </div>`).join('')}
        </div>` : ''}

        <div class="cart-items">${cartItems}</div>
        ${App.cart.length>0?`
        <div class="cart-summary">
          <div class="cart-line"><span>Subtotal</span><span>${DB.fmt(subtotal)}</span></div>
          ${discAmt>0?`<div class="cart-line" style="color:var(--success)"><span>Discount${App.discountLabel?` · ${App.discountLabel} <span onclick="clearDiscount()" style="cursor:pointer;color:var(--text-muted);font-weight:700">✕</span>`:''}</span><span>−${DB.fmt(discAmt)}</span></div>`:''}
          <div class="cart-line"><span>${DB.settings.taxName} (${DB.settings.taxRate}%)</span><span>${DB.fmt(taxAmt)}</span></div>
          <div class="cart-total">
            <span class="cart-total-label">Total</span>
            <span class="cart-total-value">${DB.fmt(total)}</span>
          </div>
        </div>
        <div style="padding:8px 12px;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:8px">
          <label style="font-size:12px;font-weight:600;color:var(--text-muted);white-space:nowrap">Discount (${DB.settings.currency})</label>
          <input type="number" id="posDiscountInput" min="0" step="0.01" class="form-control" style="height:30px;font-size:13px;padding:4px 8px;flex:1" placeholder="0.00"
            value="${App.discountType==='fixed'?App.discount:''}"
            oninput="App.discount=parseFloat(this.value)||0;App.discountType='fixed';navigate('pos')" />
        </div>
        <div class="cart-action-row">
          <button class="btn btn-secondary" onclick="openCouponModal()">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:14px;height:14px"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>
            Coupon
          </button>
          <button class="btn btn-secondary" onclick="openCustomerSelect()">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:14px;height:14px"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            ${App.selectedCustomer ? DB.getCustomer(App.selectedCustomer)?.name?.split(' ')[0] || 'Customer' : 'Customer'}
          </button>
        </div>
        <div class="cart-footer-btns">
          <button class="btn btn-primary btn-lg" style="width:100%" onclick="openPaymentModal()">
            ${iconCash()} Checkout — ${DB.fmt(total)}
          </button>
        </div>
        `:''}
      </div>
    </div>

    <!-- Category pills -->
    <div class="filter-tabs" style="margin-bottom:8px">${catPills}</div>

    <!-- Product LIST (no images) -->
    <div class="section" style="padding-bottom:20px">
      <div class="card" style="overflow:hidden">
        <div style="padding:12px 16px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between">
          <span style="font-size:14px;font-weight:700;color:var(--text-primary)">Products <span style="color:var(--text-muted);font-weight:500">(${filtered.length})</span></span>
        </div>
        <div style="max-height:400px;overflow-y:auto">${productRows}</div>
      </div>
    </div>

    <!-- Transaction History -->
    <div class="section" style="padding-bottom:20px">
      <div class="card">
        <div class="card-header">
          <span class="card-title">Transaction History</span>
          <span class="section-link" onclick="navigate('sales')" style="cursor:pointer">View All</span>
        </div>
        <div class="txn-list">${DB.transactions.slice(0,5).map(txnCard).join('')}</div>
      </div>
    </div>`;
}

function openCouponModal() {
  const active = (DB.promoCodes||[]).filter(p => p.active);
  const hint = active.length
    ? active.slice(0,4).map(p => `<button type="button" onclick="document.getElementById('couponCode').value='${p.code}'" style="background:var(--primary-light);color:var(--primary);border:none;border-radius:99px;padding:4px 10px;font-size:11px;font-weight:700;cursor:pointer">${p.code}</button>`).join(' ')
    : '<span style="color:var(--text-muted)">No active codes — add one in Marketing.</span>';
  openModal('Apply Promo Code', `
    <div class="form-group">
      <label class="form-label">Promo Code</label>
      <input type="text" class="form-control" id="couponCode" placeholder="Enter code…" style="font-size:18px;text-align:center;letter-spacing:2px;text-transform:uppercase" onkeyup="if(event.key==='Enter')applyCoupon()" />
    </div>
    <div style="display:flex;flex-wrap:wrap;gap:6px;align-items:center;margin-top:8px"><span style="font-size:12px;color:var(--text-muted)">Available:</span> ${hint}</div>`,
    `<button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
     <button class="btn btn-primary" onclick="applyCoupon()">Apply</button>`);
}
function applyCoupon() {
  const code = document.getElementById('couponCode')?.value.trim().toUpperCase();
  if (!code) { showToast('Enter a promo code','error'); return; }
  const subtotal = App.cart.reduce((s,i) => s+i.price*i.qty, 0);
  const res = DB.validatePromo(code, subtotal);
  if (!res.ok) { showToast(res.reason, 'error'); return; }
  // Promo overrides any tier/manual discount; store as a fixed amount so the
  // exact validated value is what the customer gets.
  App.discount     = res.discount;
  App.discountType = 'fixed';
  App.promoCode    = res.promo.code;
  App.discountLabel = res.promo.type === 'percent'
    ? `Promo ${res.promo.code} (${res.promo.value}% off)`
    : `Promo ${res.promo.code}`;
  closeModal();
  showToast(`${res.promo.code} applied — ${DB.fmt(res.discount)} off`, 'success');
  navigate('pos');
}

// Auto-apply a customer's pricing-tier discount (unless a promo is active).
function applyTierDiscount() {
  if (App.promoCode) return;   // an explicit promo takes precedence
  const pct = DB.tierPct(App.selectedCustomer);
  if (pct > 0) {
    App.discount = pct; App.discountType = 'percent';
    const t = DB.getTier(DB.getCustomer(App.selectedCustomer)?.tier);
    App.discountLabel = `${t.name} tier (${pct}% off)`;
  } else if (App.discountLabel && App.discountLabel.includes('tier')) {
    // clearing a previously-applied tier when switching to a non-tier customer
    App.discount = 0; App.discountLabel = '';
  }
}

// Remove any applied promo/tier discount.
function clearDiscount() {
  App.discount = 0; App.discountType = 'percent'; App.promoCode = null; App.discountLabel = '';
  navigate('pos');
}
function openCustomerSelect() {
  openModal('Select Customer', `
    <div class="txn-list">
      <div class="txn-card" onclick="App.selectedCustomer=null;selectPosCustomer();" style="cursor:pointer">
        <div class="txn-icon" style="background:var(--bg)"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:18px;height:18px"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></div>
        <div class="txn-info"><div class="txn-name">Walk-in Customer</div><div class="txn-meta">No account</div></div>
        ${!App.selectedCustomer?'<span class="badge-pill badge-primary">Selected</span>':''}
      </div>
      ${DB.customers.map(c=>{ const t = c.tier ? DB.getTier(c.tier) : null; return `
      <div class="txn-card" onclick="App.selectedCustomer='${c.id}';selectPosCustomer();" style="cursor:pointer">
        <div class="customer-avatar-sm">${c.name.split(' ').map(w=>w[0]).join('').slice(0,2)}</div>
        <div class="txn-info"><div class="txn-name">${esc(c.name)}</div><div class="txn-meta">${esc(c.email)}${t&&t.discountPct?` · ${esc(t.name)} −${t.discountPct}%`:''}</div></div>
        ${App.selectedCustomer==c.id?'<span class="badge-pill badge-primary">Selected</span>':''}
      </div>`;}).join('')}
    </div>`, '', 'modal-lg');
}

// Finalize a POS customer choice: apply tier pricing, prefill delivery, re-render.
function selectPosCustomer() {
  applyTierDiscount();
  prefillDeliveryFromCustomer(App.selectedCustomer);
  closeModal();
  navigate('pos');
}

// Part 2D — auto-fill a delivery order's address + contact from a saved customer.
function prefillDeliveryFromCustomer(custId) {
  const c = DB.getCustomer(custId);
  if (!c) return;
  if (c.address) App.deliveryLocation = c.address;
  if (c.phone)   App.deliveryContact = c.phone;
}

// Start a new sale pre-targeted at a specific customer (from their profile).
function startSaleForCustomer(id) {
  App.selectedCustomer = id;
  applyTierDiscount();
  prefillDeliveryFromCustomer(id);
  closeModal();
  openQuickOrder();
}

// Quick-order customer dropdown changed → apply tier + prefill delivery, re-render.
function onQuickOrderCustomerChange() {
  applyTierDiscount();
  prefillDeliveryFromCustomer(App.selectedCustomer);
  if (window._noRefresh) window._noRefresh();
}

function addToCart(id, over) {
  const s = DB.sellable(id);
  if (!s) return;
  // Parent with variants → toggle the inline variant picker instead of adding.
  if (s.needsVariant) { App._expandVar = (App._expandVar === s.id ? null : s.id); navigate('pos'); return; }
  const ex = App.cart.find(i => i.id === s.id);
  const current = ex ? ex.qty : 0;
  // Block by default when stock is exhausted, but allow an explicit override
  // (physical count may be out of sync). Best practice: never go negative silently.
  if (current + 1 > s.stock && !over) { promptOverstock(id, s); return; }
  if (ex) ex.qty++;
  else App.cart.push({ id:s.id, productId:s.productId, name:s.name, emoji:s.emoji, price:s.price, cost:s.cost, qty:1, variantName:s.variantName });
  App._expandVar = null;
  navigate('pos');
}

// Warn before overselling; let the user proceed only after confirming.
function promptOverstock(id, s) {
  const left = Math.max(0, s.stock || 0);
  openModal('Not enough stock',
    `<p style="font-size:14px;color:var(--text-secondary)">Only <strong>${left}</strong> of <strong>${esc(s.name)}</strong> ${left===1?'is':'are'} in stock.</p>
     <p style="font-size:13px;color:var(--text-muted);margin-top:8px">If your physical count is out of sync you can sell it anyway and reconcile stock afterwards. Inventory will not be allowed to go below zero.</p>`,
    `<button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
     <button class="btn btn-primary" onclick="closeModal();addToCart('${id}', true)">Sell anyway</button>`);
}

function changeQty(id, delta) {
  const idx = App.cart.findIndex(i => i.id===id);
  if (idx===-1) return;
  const s = DB.sellable(id);
  const next = App.cart[idx].qty + delta;
  if (next<=0) { App.cart.splice(idx,1); navigate('pos'); return; }
  if (delta>0 && s && next>s.stock) { promptOverstock(id, s); return; }   // override via the prompt
  App.cart[idx].qty = next;
  navigate('pos');
}

// Shared inline variant picker rows, reused by every product list (POS, quick
// order, product picker). `addExpr` is the JS run when a variant is chosen.
function variantPickerHTML(p, addExpr) {
  if (!DB.hasVariants(p)) return '';
  return `<div style="background:var(--bg);border-top:1px solid var(--border)">
    ${p.variants.map(v => {
      const oos = (v.stock||0) === 0;
      return `<div style="display:flex;align-items:center;gap:10px;padding:8px 14px 8px 40px;border-bottom:1px solid var(--border);${oos?'opacity:.45;':'cursor:pointer'}"
        ${oos?'':`onclick="${addExpr.replace('%VID%', v.id)}"`}>
        <div style="flex:1;min-width:0"><div style="font-size:12.5px;font-weight:600;color:var(--text-primary)">${esc(v.name)}</div>
        <div style="font-size:10.5px;color:var(--text-muted)">${esc(v.sku)} · ${oos?'Out of stock':v.stock+' left'}</div></div>
        <div style="font-weight:800;font-size:13px;color:var(--text-primary)">${DB.fmt(v.price)}</div>
        ${oos?'':`<span class="product-add-btn" style="pointer-events:none">+</span>`}
      </div>`;
    }).join('')}
  </div>`;
}

/* ── Barcode scanning (POS) ─────────────────────────────────
   Uses the browser BarcodeDetector API (Chrome/Edge, works offline) with a
   live camera feed, and always falls back to manual barcode/SKU entry when the
   API or camera isn't available. */
let _scanStream = null, _scanRAF = null, _lastScanCode = '', _lastScanAt = 0;

function openScanner() {
  const supported = 'BarcodeDetector' in window;
  openModal('Scan Barcode', `
    <div id="scanArea">
      ${supported ? `
        <video id="scanVideo" playsinline muted style="width:100%;border-radius:var(--r);background:#000;max-height:280px;object-fit:cover;display:block"></video>
        <p id="scanHint" style="font-size:12.5px;color:var(--text-muted);text-align:center;margin:8px 0 0">Point the camera at a barcode…</p>
      ` : `
        <div style="padding:12px 14px;background:var(--pastel-yellow);border-radius:var(--r);font-size:12.5px;color:#92400E">Live scanning isn't supported on this browser. Enter the barcode or SKU manually below.</div>
      `}
      <div class="form-group" style="margin-top:14px;margin-bottom:0">
        <label class="form-label">Enter barcode / SKU manually</label>
        <input type="text" id="scanManual" class="form-control" placeholder="e.g. 8901234500017 or FD-001" onkeyup="if(event.key==='Enter')scanManualAdd()" autofocus />
      </div>
    </div>`,
    `<button class="btn btn-secondary" onclick="closeScanner()">Close</button>
     <button class="btn btn-primary" onclick="scanManualAdd()">Add Item</button>`);
  if (supported) startBarcodeScan();
}

async function startBarcodeScan() {
  try {
    const detector = new window.BarcodeDetector();
    const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
    _scanStream = stream;
    const video = document.getElementById('scanVideo');
    if (!video) { stopScanStream(); return; }      // modal already closed
    video.srcObject = stream;
    await video.play();
    const tick = async () => {
      const v = document.getElementById('scanVideo');
      if (!v) return;                              // modal closed → stop loop
      try {
        const codes = await detector.detect(v);
        if (codes && codes.length) { onBarcodeDetected(codes[0].rawValue); }
      } catch (_) { /* transient detect error — keep scanning */ }
      _scanRAF = requestAnimationFrame(tick);
    };
    _scanRAF = requestAnimationFrame(tick);
  } catch (e) {
    // Permission denied / no camera → guide the user to manual entry.
    const hint = document.getElementById('scanHint');
    if (hint) hint.textContent = 'Camera unavailable — enter the code manually below.';
    const v = document.getElementById('scanVideo'); if (v) v.style.display = 'none';
  }
}

function stopScanStream() {
  if (_scanRAF) { cancelAnimationFrame(_scanRAF); _scanRAF = null; }
  if (_scanStream) { _scanStream.getTracks().forEach(t => t.stop()); _scanStream = null; }
}
function closeScanner() { stopScanStream(); closeModal(); }

// A code was detected by the camera. Debounce so one barcode held in view isn't
// added many times per second; keep the camera running for rapid multi-scanning.
function onBarcodeDetected(code) {
  const now = Date.now();
  if (code === _lastScanCode && now - _lastScanAt < 1500) return;
  _lastScanCode = code; _lastScanAt = now;
  const hit = DB.findByBarcode(code);
  const hint = document.getElementById('scanHint');
  if (!hit) { if (hint) hint.textContent = `No product for ${code} — try again`; return; }
  addScannedHit(hit, false);
  if (hint) hint.textContent = `Added ${hit.product.name}${hit.variant ? ' — ' + hit.variant.name : ''} ✓`;
}

// Manual entry path (also the only path when the camera/API is unavailable).
function scanManualAdd() {
  const code = (document.getElementById('scanManual')?.value || '').trim();
  if (!code) { showToast('Enter a barcode or SKU', 'error'); return; }
  const hit = DB.findByBarcode(code);
  if (!hit) { showToast(`No product matches “${code}”`, 'warning'); return; }
  addScannedHit(hit, true);
}

// Add a resolved scan to the cart. Manual entry closes the scanner; camera scans
// stay open for the next item.
function addScannedHit(hit, closeAfter) {
  const s = DB.sellable(hit.sellableId);
  if (!s) { showToast('Product not sellable', 'error'); return; }
  if (closeAfter) closeScanner();
  addToCart(hit.sellableId);   // handles stock guard / overstock prompt + re-render
  showToast(`Added ${hit.product.name}${hit.variant ? ' — ' + hit.variant.name : ''}`, 'success');
  const inp = document.getElementById('scanManual'); if (inp) { inp.value = ''; inp.focus(); }
}

function removeFromCart(id) {
  App.cart = App.cart.filter(i => i.id!==id);
  navigate('pos');
}

function openPaymentModal() {
  if (App.cart.length===0) return;
  App.cashEntered  = '';
  App.payMethod    = 'cash';
  App.bankReceipt  = null;
  openModal('Complete Payment', renderPaymentBody(),
    `<button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
     <button class="btn btn-success btn-lg" onclick="confirmPayment()">${iconCash()} Confirm Payment</button>`);
}

function renderPaymentBody() {
  const subtotal = App.cart.reduce((s,i) => s+i.price*i.qty, 0);
  const discAmt  = App.discountType==='percent' ? subtotal*(App.discount/100) : Math.min(App.discount,subtotal);
  const taxAmt   = (subtotal-discAmt)*(DB.settings.taxRate/100);
  const total    = subtotal-discAmt+taxAmt;
  const change   = parseFloat(App.cashEntered||0)-total;

  return `
    ${orderTypeFieldsHTML('refreshPayModal()')}
    <div class="payment-methods">
      <div class="pay-method-btn${App.payMethod==='cash'?' active':''}" onclick="App.payMethod='cash';refreshPayModal()">${iconCash()}<span>Cash</span></div>
      <div class="pay-method-btn${App.payMethod==='card'?' active':''}" onclick="App.payMethod='card';refreshPayModal()">${iconCard()}<span>Card</span></div>
      <div class="pay-method-btn${App.payMethod==='bank'?' active':''}" onclick="App.payMethod='bank';refreshPayModal()"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:18px;height:18px"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg><span>Bank</span></div>
    </div>
    <div class="pay-summary">
      <div class="pay-row"><span>Subtotal</span><span>${DB.fmt(subtotal)}</span></div>
      ${discAmt>0?`<div class="pay-row" style="color:var(--success)"><span>Discount</span><span>−${DB.fmt(discAmt)}</span></div>`:''}
      <div class="pay-row"><span>Tax (${DB.settings.taxRate}%)</span><span>${DB.fmt(taxAmt)}</span></div>
      <div class="pay-row total"><span>Total Due</span><span>${DB.fmt(total)}</span></div>
    </div>
    ${App.payMethod==='cash' ? `
      <div class="form-group" style="margin-bottom:12px">
        <label class="form-label">Cash Received</label>
        <input type="number" class="form-control" value="${App.cashEntered}" placeholder="0.00"
          oninput="App.cashEntered=this.value;refreshPayModal()" style="font-size:20px;font-weight:700;text-align:center" />
      </div>
      <div class="numpad">
        ${['1','2','3','4','5','6','7','8','9','.','0','⌫'].map(k=>`
          <div class="numpad-btn${k==='⌫'?' clear':''}" onclick="numpadKey('${k}')">${k}</div>`).join('')}
      </div>
      ${App.cashEntered?`<div class="change-display"><span>Change</span><span>${change>=0?DB.fmt(change):'—'}</span></div>`:''}
    ` : App.payMethod==='card' ? `
      <div style="background:var(--primary-light);border:1px solid var(--border-md);border-radius:var(--r);padding:14px;display:flex;align-items:center;gap:10px;font-size:13px;color:var(--text-secondary)">
        ${iconCard()}
        <span>Card payment — confirm once the card terminal approves the transaction.</span>
      </div>
    ` : `
      <div style="display:flex;flex-direction:column;gap:12px">
        ${DB.settings.accountNumber||DB.settings.accountName ? `
        <div style="background:var(--primary-light);border:1px solid var(--border-md);border-radius:var(--r);padding:12px 14px;font-size:13px">
          <div style="font-weight:700;color:var(--text-primary);margin-bottom:6px">Transfer to:</div>
          ${DB.settings.accountName?`<div style="color:var(--text-secondary)"><span style="color:var(--text-muted)">Account Name:</span> <strong>${DB.settings.accountName}</strong></div>`:''}
          ${DB.settings.accountNumber?`<div style="color:var(--text-secondary);margin-top:3px"><span style="color:var(--text-muted)">Account Number:</span> <strong>${DB.settings.accountNumber}</strong></div>`:''}
        </div>` : `<p style="font-size:12px;color:var(--text-muted);text-align:center">Set account details in Settings → General</p>`}
        <div class="form-group" style="margin:0">
          <label class="form-label" style="display:flex;align-items:center;gap:4px">
            Attach Transfer Receipt
            <span style="color:var(--danger);font-size:11px;font-weight:700">* Required</span>
          </label>
          <label style="display:flex;align-items:center;gap:10px;padding:10px 14px;border:2px dashed ${App.bankReceipt?'var(--success)':'var(--border-md)'};border-radius:var(--r);cursor:pointer;transition:var(--t);background:${App.bankReceipt?'var(--success-light, #f0fdf4)':'transparent'}"
            onmouseover="this.style.borderColor='var(--primary)'" onmouseout="this.style.borderColor='${App.bankReceipt?'var(--success)':'var(--border-md)'}'">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:18px;height:18px;color:${App.bankReceipt?'var(--success)':'var(--primary)'}"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            <span style="font-size:13px;font-weight:600;color:${App.bankReceipt?'var(--success)':'var(--primary)'}">
              ${App.bankReceipt ? '✓ Receipt attached: '+App.bankReceipt.name : 'Upload receipt image (JPEG/PNG)'}
            </span>
            <input type="file" accept="image/*" style="display:none" onchange="App.bankReceipt=this.files[0];refreshPayModal()" />
          </label>
          ${!App.bankReceipt?'<p style="font-size:11px;color:var(--danger);margin-top:4px">Receipt is required for bank transfer</p>':''}
        </div>
      </div>
    `}`;
}

function refreshPayModal() { document.getElementById('modalBody').innerHTML = renderPaymentBody(); }

function numpadKey(k) {
  if (k==='⌫') App.cashEntered = App.cashEntered.slice(0,-1);
  else if (k==='.' && App.cashEntered.includes('.')) return;
  else App.cashEntered += k;
  refreshPayModal();
}

/* ── Pickup / Delivery — shared order-type selector ─────────────
   Used by the POS payment modal and the pre-order form. `refreshExpr`
   is the JS run when the Pickup/Delivery toggle changes (to re-render). */
function orderTypeFieldsHTML(refreshExpr) {
  const isDel = App.orderType === 'delivery';
  const esc = s => String(s||'').replace(/"/g,'&quot;');
  const btn = (type, label, icon) => {
    const on = App.orderType === type;
    return `<div onclick="App.orderType='${type}';${refreshExpr}" role="button" tabindex="0"
      style="flex:1;display:flex;align-items:center;justify-content:center;gap:7px;padding:11px;border-radius:var(--r);cursor:pointer;font-size:13.5px;font-weight:700;transition:var(--t);
      border:1.5px solid ${on?'var(--primary)':'var(--border-md)'};background:${on?'var(--primary-light)':'var(--surface)'};color:${on?'var(--primary)':'var(--text-secondary)'}">
      ${icon}<span>${label}</span></div>`;
  };
  const bagIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:16px;height:16px"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>';
  const truckIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:16px;height:16px"><rect x="1" y="3" width="15" height="13"/><path d="M16 8h4l3 3v5h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>';
  return `
    <div class="form-group" style="margin-bottom:12px">
      <label class="form-label">Order Type</label>
      <div style="display:flex;gap:8px">
        ${btn('pickup','Pickup',bagIcon)}
        ${btn('delivery','Delivery',truckIcon)}
      </div>
    </div>
    ${isDel ? `
      <div class="form-group" style="margin-bottom:10px">
        <label class="form-label">Delivery Location <span style="color:var(--danger)">*</span></label>
        <input type="text" class="form-control" id="otLocation" value="${esc(App.deliveryLocation)}" placeholder="House / street / island" oninput="App.deliveryLocation=this.value" />
      </div>
      <div class="form-group" style="margin-bottom:12px">
        <label class="form-label">Contact Number <span style="color:var(--danger)">*</span></label>
        <input type="tel" class="form-control" id="otContact" value="${esc(App.deliveryContact)}" placeholder="+960 7XX XXXX" oninput="App.deliveryContact=this.value" />
      </div>
    ` : ''}`;
}

// Validate delivery fields before submitting any order. Returns {ok, reason}.
function validateOrderType() {
  if (App.orderType === 'delivery') {
    if (!String(App.deliveryLocation||'').trim()) return { ok:false, reason:'Delivery location is required' };
    if (!String(App.deliveryContact||'').trim())  return { ok:false, reason:'Contact number is required for delivery' };
    if (!isValidPhone(App.deliveryContact))        return { ok:false, reason:'Enter a valid delivery contact number' };
  }
  return { ok:true };
}

// Reset the order-type state after an order is completed/cancelled.
function resetOrderType() { App.orderType='pickup'; App.deliveryLocation=''; App.deliveryContact=''; }

function confirmPayment() {
  if (App.cart.length === 0) { showToast('Cart is empty', 'error'); return; }
  if (App.payMethod === 'bank' && !App.bankReceipt) {
    showToast('Please attach the bank transfer receipt to continue', 'error');
    return;
  }
  const ot = validateOrderType();
  if (!ot.ok) { showToast(ot.reason, 'error'); return; }
  const subtotal = DB.money(App.cart.reduce((s,i) => s+i.price*i.qty, 0));
  const discAmt  = DB.money(App.discountType==='percent' ? subtotal*(App.discount/100) : Math.min(App.discount,subtotal));
  const taxAmt   = DB.money((subtotal-discAmt)*(DB.settings.taxRate/100));
  const total    = DB.money(subtotal-discAmt+taxAmt);
  // Cash sales can't be completed with less tender than the amount due.
  if (App.payMethod === 'cash' && String(App.cashEntered||'').trim() !== '' && parseFloat(App.cashEntered) < total) {
    showToast(`Cash received (${DB.fmt(parseFloat(App.cashEntered)||0)}) is less than the total ${DB.fmt(total)}`, 'error');
    return;
  }
  const cust     = App.selectedCustomer ? DB.getCustomer(App.selectedCustomer) : null;

  // addTransaction handles money rounding, inventory decrement and CRM updates.
  const t = DB.addTransaction({
    date: new Date().toISOString().split('T')[0],
    items: App.cart.reduce((s,i) => s+i.qty, 0),
    subtotal, discount: discAmt, tax: taxAmt, total,
    cost: App.cart.reduce((s,i) => s+i.cost*i.qty, 0),
    method: App.payMethod,
    customerId: cust?.id||null,
    customerName: cust?.name||'Walk-in Customer',
    cashGiven: parseFloat(App.cashEntered||total),
    promoCode: App.promoCode || null,
    discountLabel: App.discountLabel || '',
    orderType: App.orderType || 'pickup',
    deliveryLocation: App.orderType==='delivery' ? cleanText(App.deliveryLocation) : '',
    deliveryContact:  App.orderType==='delivery' ? cleanText(App.deliveryContact)  : '',
    cartItems: App.cart.map(i=>({...i})),
  });

  const wasDelivery = t.orderType === 'delivery';
  closeModal();
  App.cart=[]; App.discount=0; App.discountType='percent'; App.discountLabel=''; App.promoCode=null;
  App.selectedCustomer=null; App.cashEntered=''; App.bankReceipt=null; resetOrderType();
  showToast(`Sale #${t.id} complete — ${DB.fmt(total)}`, 'success');
  navigate('dashboard');
  // Delivery orders: offer to message the delivery rider (skippable).
  if (wasDelivery) openDeliveryMessageModal(t.id);
}

/* ── Part 1: Send order details to the delivery rider ──────────
   Opens an editable, pre-filled message with WhatsApp / SMS / Copy
   options. Always skippable. */
function buildDeliveryMessage(t) {
  const biz = DB.settings.businessName || 'Our store';
  const items = (t.cartItems || []).map(i => `• ${i.qty}× ${i.name}`).join('\n') || '• (items not itemized)';
  const lines = [
    `🛵 New Delivery Order — ${t.id}`,
    `From: ${biz}`,
    ``,
    `Customer: ${t.customerName || 'Walk-in Customer'}`,
    `Address: ${t.deliveryLocation || '—'}`,
    `Contact: ${t.deliveryContact || '—'}`,
    ``,
    `Items:`,
    items,
    ``,
    `Total to collect: ${DB.fmt(t.total)} (${t.payment || 'Cash'})`,
  ];
  if (t.notes) lines.push('', `Notes: ${t.notes}`);
  return lines.join('\n');
}

function openDeliveryMessageModal(txnId) {
  const t = DB.transactions.find(x => String(x.id) === String(txnId));
  if (!t) return;
  App._delivMsgId = t.id;
  const escHtml = s => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  const msg = buildDeliveryMessage(t);
  const body = `
    <p style="font-size:13px;color:var(--text-secondary);margin:0 0 12px">Send the delivery details to your rider. Edit the message if you like, or skip for now.</p>
    <div style="display:flex;align-items:center;gap:10px;background:var(--pastel-purple);border-radius:var(--r);padding:11px 13px;margin-bottom:12px">
      <svg viewBox="0 0 24 24" fill="none" stroke="#6D28D9" stroke-width="2" style="width:20px;height:20px;flex-shrink:0"><rect x="1" y="3" width="15" height="13"/><path d="M16 8h4l3 3v5h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
      <div style="min-width:0"><div style="font-size:13.5px;font-weight:800;color:#5B21B6">${esc(t.deliveryContact || 'No contact number')}</div>
      <div style="font-size:11.5px;color:#6D28D9;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(t.deliveryLocation || '')}</div></div>
    </div>
    <label class="form-label">Message</label>
    <textarea id="delivMsg" class="form-control" style="min-height:180px;font-size:13px;line-height:1.5;font-family:inherit;resize:vertical">${escHtml(msg)}</textarea>`;
  const footer = `
    <button class="btn btn-secondary" onclick="closeModal()">Skip</button>
    <button class="btn btn-ghost" onclick="copyDeliveryMessage()">${iconCopy()} Copy</button>
    <button class="btn btn-secondary" onclick="sendDeliverySMS()">SMS</button>
    <button class="btn btn-success" onclick="sendDeliveryWhatsApp(this)">${iconWhatsApp()} WhatsApp</button>`;
  openModal('Send to Delivery Rider', body, footer, 'modal-lg');
}

function _getDelivMsg() { const e = document.getElementById('delivMsg'); return e ? e.value : ''; }
function _delivContact() {
  const t = DB.transactions.find(x => String(x.id) === String(App._delivMsgId));
  return t ? (t.deliveryContact || '') : '';
}
// Re-entrancy guard: a second tap before the first finishes was a freeze cause.
let _waBusy = false;
// Copy text to clipboard with a graceful fallback (used by the WhatsApp fallback).
function _copyText(text, done) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(done).catch(() => fallbackCopyText(text, done));
  } else { fallbackCopyText(text, done); }
}
function sendDeliveryWhatsApp(btn) {
  if (_waBusy) return;                       // ignore rapid double-taps
  _waBusy = true;
  if (btn) btn.disabled = true;
  const release = () => { _waBusy = false; if (btn) btn.disabled = false; };
  const text = _getDelivMsg();
  try {
    const num = _delivContact().replace(/\D/g, '');
    const url = num ? `https://wa.me/${num}?text=${encodeURIComponent(text)}`
                    : `https://wa.me/?text=${encodeURIComponent(text)}`;
    // window.open can be blocked (popup blocker / sandboxed webview) and return
    // null — never assume it succeeded. noopener detaches the new context so a
    // scheme the device can't handle can't hang the app's event loop.
    let win = null;
    try { win = window.open(url, '_blank', 'noopener,noreferrer'); } catch (_) { win = null; }
    if (win) {
      showToast('Opening WhatsApp…', 'info');
    } else {
      _copyText(text, () => {});
      showToast('WhatsApp couldn’t open — message copied to clipboard', 'warning');
    }
    closeModal();
  } catch (err) {
    console.error('WhatsApp error:', err);
    _copyText(text, () => {});
    showToast('Could not open WhatsApp. Message copied to clipboard.', 'error');
    closeModal();
  } finally {
    release();
  }
}
function sendDeliverySMS() {
  const num  = _delivContact().replace(/[^\d+]/g, '');
  const body = encodeURIComponent(_getDelivMsg());
  // "?&body=" maximizes cross-device compatibility for the SMS deep link.
  window.location.href = `sms:${num}?&body=${body}`;
  closeModal();
}
function copyDeliveryMessage() {
  const txt = _getDelivMsg();
  const done = () => showToast('Message copied to clipboard', 'success');
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(txt).then(done).catch(() => fallbackCopyText(txt, done));
  } else { fallbackCopyText(txt, done); }
}
function fallbackCopyText(txt, done) {
  const ta = document.createElement('textarea');
  ta.value = txt; ta.style.position = 'fixed'; ta.style.opacity = '0';
  document.body.appendChild(ta); ta.select();
  try { document.execCommand('copy'); done && done(); } catch (_) { showToast('Could not copy', 'error'); }
  document.body.removeChild(ta);
}

/* ══════════════════════════════════════════════════════════
   SALES
   ══════════════════════════════════════════════════════════ */
function renderSales(el) {
  const txns     = DB.transactions;
  const sales    = txns.filter(t => t.status !== 'refunded');
  const total    = DB.money(sales.reduce((s,t) => s+DB.saleCollected(t), 0));
  // Real month-over-month trend (no hard-coded numbers).
  const _now = new Date();
  const curMo  = `${_now.getFullYear()}-${String(_now.getMonth()+1).padStart(2,'0')}`;
  const _prev  = new Date(_now.getFullYear(), _now.getMonth()-1, 1);
  const prevMo = `${_prev.getFullYear()}-${String(_prev.getMonth()+1).padStart(2,'0')}`;
  const curMoTotal  = sales.filter(t => (t.date||'').startsWith(curMo)).reduce((s,t)=>s+DB.saleCollected(t),0);
  const prevMoTotal = sales.filter(t => (t.date||'').startsWith(prevMo)).reduce((s,t)=>s+DB.saleCollected(t),0);
  const momPct = prevMoTotal > 0 ? Math.round((curMoTotal-prevMoTotal)/prevMoTotal*100) : null;
  const momTrend = momPct === null ? 'No prior month data'
    : `${momPct>=0?'↑':'↓'} ${Math.abs(momPct)}% vs last month`;
  const _today   = `${_now.getFullYear()}-${String(_now.getMonth()+1).padStart(2,'0')}-${String(_now.getDate()).padStart(2,'0')}`;
  const todayCount = sales.filter(t => t.date === _today).length;
  const pending  = DB.invoices.filter(i => i.status === 'pending' || i.status === 'overdue');
  const overdue  = DB.invoices.filter(i => i.status === 'overdue');
  const filtered = txns.filter(t => !App.salesSearch ||
    (t.customerName||t.customer||'').toLowerCase().includes(App.salesSearch.toLowerCase()) ||
    t.id.toLowerCase().includes(App.salesSearch.toLowerCase()));
  const salesTab = App.salesTab || 'history';

  el.innerHTML = `
    <!-- Page header -->
    <div class="page-header">
      <div class="page-header-title">Sales Overview</div>
      <div class="page-header-sub">Transactions &amp; invoices for your store</div>
    </div>

    <!-- Date filter + New Sale -->
    <div class="section" style="display:flex;align-items:center;justify-content:space-between;gap:10px">
      <div style="display:flex;align-items:center;gap:6px;padding:8px 14px;background:var(--surface);border:1.5px solid var(--border-md);border-radius:var(--r-full);font-size:13px;font-weight:600;color:var(--text-secondary)">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:14px;height:14px"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
        Last 30 Days
      </div>
      <button class="btn btn-primary btn-sm" onclick="navigate('pos')">+ New Sale</button>
    </div>

    <!-- Total Sales Hero -->
    <div class="section">
      <div class="sales-hero">
        <div class="sales-hero-label">TOTAL SALES VOLUME</div>
        <div class="sales-hero-value">${DB.fmt(total)}</div>
        <div class="sales-trend">${momTrend}</div>
      </div>
    </div>

    <!-- Stat cards -->
    <div class="section">
      <div class="kpi-grid">
        <div class="kpi-card">
          <div class="kpi-label">Transactions</div>
          <div class="kpi-value">${sales.length.toLocaleString()}</div>
          <div class="kpi-change up">${todayCount} processed today</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">Pending Invoices</div>
          <div class="kpi-value">${pending.length}</div>
          <div class="kpi-change down">${overdue.length} Overdue</div>
        </div>
      </div>
    </div>

    <!-- Sales History / All Invoices tabs -->
    <div class="section" style="padding-bottom:0">
      <div class="card" style="overflow:visible">
        <div style="display:flex;align-items:center;justify-content:space-between;padding:0 4px;border-bottom:2px solid var(--border)">
          <div class="sales-tabs" style="border-bottom:none;flex:1">
            <div class="sales-tab${salesTab==='history'?' active':''}" onclick="App.salesTab='history';navigate('sales')">Sales History</div>
            <div class="sales-tab${salesTab==='invoices'?' active':''}" onclick="App.salesTab='invoices';navigate('sales')">All Invoices</div>
          </div>
          <div style="padding:8px;display:flex;gap:6px">
            <input type="text" id="salesSearchInput" class="form-control" placeholder="Search…" style="font-size:12.5px;width:130px;height:32px;padding:6px 10px"
              value="${App.salesSearch}" oninput="App.salesSearch=this.value;navigate('sales')" />
          </div>
        </div>

        ${salesTab === 'history' ? `
        <div class="sales-count-row">
          <span style="color:var(--text-muted)">${filtered.length} transactions</span>
          <span style="font-weight:700;color:var(--text-primary)">${DB.fmt(filtered.reduce((s,t)=>s+DB.saleCollected(t),0))}</span>
        </div>
        <div class="txn-list">${(App.salesShowAll?filtered:filtered.slice(0,8)).map(txnCard).join('') || `<div style="padding:32px;text-align:center;color:var(--text-muted)">No transactions found</div>`}</div>
        ${filtered.length>8?`<div class="pagination"><span>${App.salesShowAll?`Showing all ${filtered.length}`:`${filtered.length - 8} more transactions`}</span><button class="btn btn-ghost btn-sm" onclick="App.salesShowAll=${!App.salesShowAll};navigate('sales')">${App.salesShowAll?'Show less':'View All'}</button></div>`:''}
        ` : `
        <div class="table-wrapper">
          <table>
            <thead><tr><th>Invoice #</th><th>Customer</th><th>Amount</th><th>Status</th><th></th></tr></thead>
            <tbody>
              ${DB.invoices.map(inv => {
                const s = inv.status;
                const badge = s==='paid'?'<span class="badge-pill badge-success">Paid</span>':
                  s==='overdue'?'<span class="badge-pill badge-danger">Overdue</span>':
                  s==='draft'?'<span class="badge-pill badge-gray">Draft</span>':
                  '<span class="badge-pill badge-warning">Pending</span>';
                return `<tr>
                  <td><strong>${inv.number||inv.id}</strong></td>
                  <td>${inv.customer}</td>
                  <td><strong>${DB.fmt(inv.total||inv.amount||0)}</strong></td>
                  <td>${badge}</td>
                  <td><button class="btn btn-secondary btn-sm" onclick="viewInvoice('${inv.id}')">View</button></td>
                </tr>`;
              }).join('')}
            </tbody>
          </table>
        </div>
        `}
      </div>
    </div>`;
}

/* ══════════════════════════════════════════════════════════
   INVOICES
   ══════════════════════════════════════════════════════════ */
function renderInvoices(el) {
  const invs = DB.invoices;
  const paid = invs.filter(i => i.status==='paid');
  const due  = invs.filter(i => i.status==='pending');
  const over = invs.filter(i => i.status==='overdue');

  const statusBadge = s =>
    s==='paid'    ? '<span class="badge-pill badge-success">Paid</span>' :
    s==='overdue' ? '<span class="badge-pill badge-danger">Overdue</span>' :
    '<span class="badge-pill badge-warning">Pending</span>';

  el.innerHTML = `
    <div class="kpi-grid">
      ${miniKPI('Total Invoiced', DB.fmt(invs.reduce((s,i)=>s+(i.total||i.amount||0),0)), invs.length+' invoices','up','var(--pastel-blue)')}
      ${miniKPI('Paid',           DB.fmt(paid.reduce((s,i)=>s+(i.total||i.amount||0),0)), paid.length+' invoices','up','var(--pastel-green)')}
      ${miniKPI('Pending',        DB.fmt(due.reduce((s,i)=>s+(i.total||i.amount||0),0)),  due.length+' invoices','neutral','var(--pastel-yellow)')}
      ${miniKPI('Overdue',        DB.fmt(over.reduce((s,i)=>s+(i.total||i.amount||0),0)), over.length+' invoices','down','var(--pastel-pink)')}
    </div>
    <div class="card">
      <div class="invoice-toolbar">
        <span class="card-title">Invoices</span>
        <div style="display:flex;gap:8px">
          <select class="filter-select" onchange="App.invFilter=this.value;navigate('invoices')">
            ${[['all','All Status'],['paid','Paid'],['pending','Pending'],['overdue','Overdue'],['draft','Draft']].map(([v,l])=>`<option value="${v}" ${(App.invFilter||'all')===v?'selected':''}>${l}</option>`).join('')}
          </select>
          <button class="btn btn-primary btn-sm" onclick="openCreateInvoiceModal()">+ New Invoice</button>
        </div>
      </div>
      <div class="table-wrapper"><table>
        <thead><tr><th>Invoice #</th><th>Customer</th><th>Date</th><th>Due Date</th><th>Amount</th><th>Status</th><th>Actions</th></tr></thead>
        <tbody>
          ${invs.filter(i=>App.invFilter==='all'||i.status===App.invFilter).map(i=>`
            <tr>
              <td><strong>${i.number}</strong></td>
              <td>${i.customer}</td>
              <td>${formatDate(i.date)}</td>
              <td>${formatDate(i.dueDate)}</td>
              <td><strong>${DB.fmt(i.total||i.amount||0)}</strong></td>
              <td>${statusBadge(i.status)}</td>
              <td><div class="table-actions">
                <button class="btn btn-secondary btn-sm" onclick="viewInvoice('${i.id}')">View</button>
                ${i.status!=='paid'?`<button class="btn btn-success btn-sm" onclick="markInvoicePaid('${i.id}')">Mark Paid</button>`:''}
              </div></td>
            </tr>`).join('')}
        </tbody>
      </table></div>
    </div>`;
}

/* ── View Transaction Receipt ──────────────────────────────── */
// The receipt's document config — shared by the on-screen template (buildDocHTML)
// and the shareable image renderer (renderDocCanvas) so they never drift.
function buildReceiptCfg(t) {
  const customer = t.customerName || t.customer || 'Walk-in Customer';
  const biz      = DB.settings;
  const pmLabel  = DB.methodLabel(t.method || t.payment);
  const isRefund = t.status === 'refunded';

  const items = (t.cartItems || []).map(i => ({ name:i.name, qty:i.qty, price:i.price, amount:i.price*i.qty }));

  const metaLines = [
    `<div>Receipt No. <b>${t.id}</b></div>`,
    `<div>${formatDate(t.date)}${t.time ? ' · '+t.time : ''}</div>`,
    `<div>Paid via ${pmLabel}</div>`,
    `<div>Order Type: <b>${t.orderType==='delivery'?'Delivery':'Pickup'}</b></div>`,
    t.soldBy ? `<div>Served by ${esc(t.soldBy)}</div>` : '',
  ];
  // Delivery address/contact get a dedicated full-width block (see buildDocHTML),
  // not the cramped right-aligned meta column.

  const payLines = [`Method: <b>${pmLabel}</b>`];
  if ((t.method||'') === 'cash' && t.cashGiven != null) {
    payLines.push(`Cash Received: ${DB.fmt(t.cashGiven)}`);
    payLines.push(`Change: ${DB.fmt(Math.max(0, (t.cashGiven||0) - t.total))}`);
  } else if ((t.method||'') === 'bank') {
    if (biz.accountName)   payLines.push(`Account Name: ${esc(biz.accountName)}`);
    if (biz.accountNumber) payLines.push(`Account No.: ${esc(biz.accountNumber)}`);
  }

  return {
    docType: 'RECEIPT',
    billedTo: `<b style="color:#2A2A28;font-weight:600">${esc(customer)}</b>`,
    metaLines,
    status: isRefund ? 'REFUNDED' : 'PAID',
    statusStyle: isRefund ? 'background:#fbe9e9;color:#c0392b' : 'background:#e7f3ea;color:#2f7d46',
    delivery: { orderType: t.orderType, location: t.deliveryLocation, contact: t.deliveryContact },
    items, subtotal: t.subtotal, discount: t.discount||0, tax: t.tax, taxRate: biz.taxRate, total: t.total,
    paymentInfo: payLines.join('<br>'),
    thanks: biz.receiptFooter || 'Thank you!',
  };
}

function viewTransaction(id) {
  const t = DB.transactions.find(x => x.id === id);
  if (!t) return;
  const docHtml = buildDocHTML(buildReceiptCfg(t));
  openModal(`Receipt — ${t.id}`, `${deliveryManagePanelHTML(t)}<div class="invoice-preview-wrap">${docHtml}</div>`,
    `<button class="btn btn-secondary" onclick="closeModal()">Close</button>
     <button class="btn btn-ghost" onclick="window.print()">
       <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:14px;height:14px"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
       Print
     </button>
     <button class="btn btn-primary" onclick="shareTransaction('${t.id}')">
       <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:14px;height:14px"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
       Share
     </button>`, 'modal-lg');
}

/* ── Delivery management panel (transaction detail) ─────────────
   Shows Order Type for every order, and for deliveries: address,
   contact, schedule, delivered timestamp + the Mark-as-Delivered
   toggle and Postpone action (Parts 2 & 3). */
function deliveryManagePanelHTML(t) {
  if (!t) return '';
  if (t.orderType !== 'delivery') {
    return `<div style="display:flex;align-items:center;gap:8px;background:var(--pastel-teal);border-radius:var(--r);padding:11px 14px;margin-bottom:14px">
      <span style="font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:.6px;color:#0F766E">Order Type</span>
      <span style="margin-left:auto;font-weight:800;color:#0F766E">Pickup</span>
    </div>`;
  }
  const delivered = t.deliveryStatus === 'delivered';
  const toggleBtn = delivered
    ? `<button class="btn btn-secondary btn-sm" onclick="setDeliveryStatus('${t.id}',false,true)">↺ Mark as Pending</button>`
    : `<button class="btn btn-success btn-sm" onclick="setDeliveryStatus('${t.id}',true,true)">✓ Mark as Delivered</button>`;
  const postponeBtn = delivered ? ''
    : `<button class="btn btn-ghost btn-sm" onclick="postponeOrder('${t.id}',true)">Postpone to Tomorrow →</button>`;
  return `<div style="border:1.5px solid ${delivered?'var(--success)':'var(--border-md)'};border-radius:var(--r);padding:14px;margin-bottom:14px;background:${delivered?'var(--success-light,#f0fdf4)':'var(--surface)'}">
    <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">
      <span style="font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:.6px;color:var(--text-muted)">Order Type</span>
      <span style="margin-left:auto">${orderTypeBadge(t)}</span>
    </div>
    <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px;padding-bottom:10px;border-bottom:1px solid var(--border)">
      <span style="font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:.6px;color:var(--text-muted)">Delivery Status</span>
      <span style="margin-left:auto">${delivered
        ? `<span class="badge-pill badge-success">Delivered ✓</span>`
        : `<span class="badge-pill" style="background:var(--pastel-orange);color:#C2410C">Pending</span>`}</span>
    </div>
    <div style="font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:.6px;color:var(--text-muted);margin-bottom:4px">Delivery Address</div>
    <div style="font-size:13.5px;font-weight:600;color:var(--text-primary);line-height:1.4">${esc(t.deliveryLocation||'—')}</div>
    <div style="font-size:12.5px;color:var(--text-secondary);margin-top:4px">Contact: <strong>${esc(t.deliveryContact||'—')}</strong></div>
    <div style="font-size:12px;color:var(--text-muted);margin-top:4px">Scheduled: ${formatDate(DB.orderDate(t))}${t.postponedFrom?` · postponed from ${formatDate(t.postponedFrom)}`:''}</div>
    ${delivered&&t.deliveredAt?`<div style="font-size:12px;color:var(--success);font-weight:700;margin-top:4px">Delivered on ${formatDateTime(t.deliveredAt)}</div>`:''}
    <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:13px">${toggleBtn}${postponeBtn}</div>
  </div>`;
}

// Toggle a delivery order's fulfillment status (Part 3).
function setDeliveryStatus(id, delivered, reopen) {
  const t = delivered ? DB.markDelivered(id) : DB.unmarkDelivered(id);
  if (!t) { showToast('Could not update delivery status', 'error'); return; }
  DB.save();
  showToast(delivered ? `Order ${id} marked Delivered ✓` : `Order ${id} set back to Pending`, delivered ? 'success' : 'warning');
  refreshOrderViews();
  if (reopen) viewTransaction(id);
}

// Carry a pending delivery over to the next day (Part 5).
function postponeOrder(id, reopen) {
  const t = DB.postponeDelivery(id);
  if (!t) { showToast('Could not postpone this order', 'error'); return; }
  DB.save();
  showToast(`Order ${id} moved to ${formatDate(t.scheduledDate)}`, 'info');
  refreshOrderViews();
  if (reopen) viewTransaction(id);
}

// Re-render whichever order-bearing screen is visible so lists/badges update live.
function refreshOrderViews() {
  if (['orders','sales','dashboard'].includes(App.currentPage)) {
    const el = document.getElementById('pageContent');
    if (el) renderPage(App.currentPage, el);
  }
}

/* ══════════════════════════════════════════════════════════
   SHARE AS IMAGE — invoices & receipts (Part 1)
   ──────────────────────────────────────────────────────────
   The on-screen invoice/receipt is rendered to a PNG and shared
   through the native share sheet (Web Share API, files). This is
   the web-stack equivalent of expo-sharing + view-shot — the brief
   was written for React Native, but this app is vanilla web with no
   Node/npm, so no native libs are available. We paint the document
   onto a <canvas> manually (rather than rasterizing the DOM) because
   exporting an SVG/foreignObject snapshot taints the canvas and is
   blocked by the browser. Falls back to a PNG download where the
   Web Share API or file-sharing isn't supported.
   ══════════════════════════════════════════════════════════ */

// Strip the small amount of inline HTML used in cfg fields down to text lines.
function _docTextLines(html) {
  return String(html == null ? '' : html)
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(div|p)>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"')
    .split('\n').map(s => s.trim()).filter(Boolean);
}

function _roundRect(ctx, x, y, w, h, r) {
  if (ctx.roundRect) { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); return; }
  ctx.beginPath();
  ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
}

function _truncate(ctx, text, maxWidth) {
  text = String(text == null ? '' : text);
  if (ctx.measureText(text).width <= maxWidth) return text;
  let s = text;
  while (s.length > 1 && ctx.measureText(s + '…').width > maxWidth) s = s.slice(0, -1);
  return s + '…';
}

// Paint the document config onto a cropped canvas and return it.
function renderDocCanvas(cfg) {
  const biz   = DB.settings;
  const S     = 2;                     // supersample for crisp text
  const W     = 720;                   // logical paper width
  const PADX  = 40, PADTOP = 44, PADBOT = 36;
  const serif = "'Playfair Display', Georgia, serif";
  const sans  = "'Inter', system-ui, sans-serif";
  const cream = '#F6F3EC', ink = '#2A2A28', muted = '#8A8780', sub = '#54514A', hair = '#E6E1D5';

  const cv  = document.createElement('canvas');
  cv.width  = W * S; cv.height = 1700 * S;
  const ctx = cv.getContext('2d');
  ctx.scale(S, S);
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = cream; ctx.fillRect(0, 0, W, 1700);
  const setLS = v => { try { ctx.letterSpacing = v; } catch (_) {} };

  let y = PADTOP;
  // Emblem (dark circle + business initials)
  const ecx = PADX + 32, ecy = y + 32;
  ctx.beginPath(); ctx.arc(ecx, ecy, 32, 0, Math.PI * 2); ctx.fillStyle = '#1A1A1A'; ctx.fill();
  const initials = (biz.businessName || 'DP').split(' ').map(w => w[0]).join('').slice(0, 3).toUpperCase();
  ctx.fillStyle = '#fff'; ctx.font = `600 17px ${serif}`; ctx.textAlign = 'center';
  ctx.fillText(initials, ecx, ecy + 6);
  // Doc title (right)
  ctx.textAlign = 'right'; ctx.fillStyle = ink; ctx.font = `600 34px ${serif}`; setLS('4px');
  ctx.fillText(cfg.docType, W - PADX, y + 34); setLS('0px');
  y += 64 + 30;

  // Billed-to (left) + meta (right)
  const billedLines = _docTextLines(cfg.billedTo);
  const metaLines   = (cfg.metaLines || []).flatMap(_docTextLines);
  ctx.textAlign = 'left'; ctx.fillStyle = ink; ctx.font = `700 11px ${sans}`;
  ctx.fillText('BILLED TO:', PADX, y);
  let ly = y + 20;
  billedLines.forEach((l, i) => {
    ctx.font = i === 0 ? `600 13px ${sans}` : `400 12.5px ${sans}`;
    ctx.fillStyle = i === 0 ? ink : sub;
    ctx.fillText(l, PADX, ly); ly += 20;
  });
  let ry = y; ctx.textAlign = 'right'; ctx.font = `400 12.5px ${sans}`; ctx.fillStyle = sub;
  metaLines.forEach(l => { ctx.fillText(l, W - PADX, ry); ry += 22; });
  if (cfg.status) {
    ctx.font = `700 10px ${sans}`;
    ctx.fillStyle = cfg.status === 'REFUNDED' || cfg.status === 'OVERDUE' ? '#c0392b' : (cfg.status === 'PAID' ? '#2f7d46' : '#b7892b');
    setLS('1.4px'); ctx.fillText(cfg.status, W - PADX, ry + 6); setLS('0px'); ry += 22;
  }
  y = Math.max(ly, ry) + 18;

  // Delivery block
  if (cfg.delivery && cfg.delivery.orderType === 'delivery') {
    const bw = W - PADX * 2, bh = 66;
    ctx.fillStyle = '#F0ECE0'; _roundRect(ctx, PADX, y, bw, bh, 8); ctx.fill();
    ctx.strokeStyle = hair; ctx.lineWidth = 1; _roundRect(ctx, PADX, y, bw, bh, 8); ctx.stroke();
    ctx.textAlign = 'left';
    ctx.font = `700 10px ${sans}`; ctx.fillStyle = muted; setLS('1px'); ctx.fillText('DELIVERY ADDRESS', PADX + 14, y + 20); setLS('0px');
    ctx.font = `600 13.5px ${sans}`; ctx.fillStyle = ink; ctx.fillText(_truncate(ctx, cfg.delivery.location || '—', bw - 28), PADX + 14, y + 40);
    ctx.font = `400 12px ${sans}`; ctx.fillStyle = sub; ctx.fillText('Contact: ' + (cfg.delivery.contact || '—'), PADX + 14, y + 57);
    y += bh + 18;
  }

  // Item table
  const colItem = PADX, colQty = W - PADX - 250, colPrice = W - PADX - 120, colTotal = W - PADX;
  ctx.strokeStyle = ink; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(PADX, y); ctx.lineTo(W - PADX, y); ctx.stroke();
  y += 20;
  ctx.font = `700 11px ${sans}`; ctx.fillStyle = ink;
  ctx.textAlign = 'left';   ctx.fillText('Item', colItem, y);
  ctx.textAlign = 'center'; ctx.fillText('Quantity', colQty, y);
  ctx.textAlign = 'right';  ctx.fillText('Unit Price', colPrice, y);
  ctx.fillText('Total', colTotal, y);
  y += 10; ctx.strokeStyle = '#cdc7b9'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(PADX, y); ctx.lineTo(W - PADX, y); ctx.stroke();
  const items = cfg.items || [];
  if (!items.length) {
    y += 34; ctx.textAlign = 'center'; ctx.fillStyle = muted; ctx.font = `400 12.5px ${sans}`;
    ctx.fillText('No line items', W / 2, y); y += 6;
  }
  items.forEach(it => {
    y += 26;
    ctx.fillStyle = '#3c3a34'; ctx.font = `400 12.5px ${sans}`;
    ctx.textAlign = 'left';   ctx.fillText(_truncate(ctx, it.name, colQty - colItem - 70), colItem, y);
    ctx.textAlign = 'center'; ctx.fillText(String(it.qty), colQty, y);
    ctx.textAlign = 'right';  ctx.fillText(DB.fmt(it.price), colPrice, y);
    ctx.fillText(DB.fmt(it.amount), colTotal, y);
    y += 9; ctx.strokeStyle = hair;
    ctx.beginPath(); ctx.moveTo(PADX, y); ctx.lineTo(W - PADX, y); ctx.stroke();
  });
  y += 24;

  // Totals (right half)
  const tx0 = W / 2, tx1 = W - PADX;
  const totRow = (label, val) => {
    ctx.font = `400 12px ${sans}`; ctx.fillStyle = '#6f6c64';
    ctx.textAlign = 'left';  ctx.fillText(label, tx0, y);
    ctx.textAlign = 'right'; ctx.fillText(val, tx1, y);
    y += 12; ctx.strokeStyle = hair;
    ctx.beginPath(); ctx.moveTo(tx0, y); ctx.lineTo(tx1, y); ctx.stroke(); y += 16;
  };
  totRow('Subtotal', DB.fmt(cfg.subtotal));
  if (cfg.discount > 0) totRow('Discount', '−' + DB.fmt(cfg.discount));
  totRow('Tax (' + cfg.taxRate + '%)', DB.fmt(cfg.tax));
  y += 8;
  ctx.font = `700 23px ${serif}`; ctx.fillStyle = ink;
  ctx.textAlign = 'left';  ctx.fillText(cfg.totalLabel || 'Total', tx0, y + 8);
  ctx.textAlign = 'right'; ctx.fillText(DB.fmt(cfg.total), tx1, y + 8);
  y += 8 + 34;

  // Thanks
  ctx.textAlign = 'left'; ctx.font = `500 21px ${serif}`; ctx.fillStyle = ink;
  ctx.fillText(cfg.thanks || 'Thank you!', PADX, y + 16); y += 16 + 30;

  // Footer — payment info (left) + business (right)
  const payLines = _docTextLines(cfg.paymentInfo);
  let fy = y;
  if (payLines.length) {
    ctx.textAlign = 'left'; ctx.font = `700 11px ${sans}`; ctx.fillStyle = ink;
    setLS('1px'); ctx.fillText('PAYMENT INFORMATION', PADX, fy); setLS('0px'); fy += 18;
    ctx.font = `400 12px ${sans}`; ctx.fillStyle = sub;
    payLines.forEach(l => { ctx.fillText(l, PADX, fy); fy += 18; });
  }
  let by = y; ctx.textAlign = 'right'; ctx.font = `600 19px ${serif}`; ctx.fillStyle = ink;
  ctx.fillText(biz.businessName, W - PADX, by + 4); by += 24;
  ctx.font = `400 11px ${sans}`; ctx.fillStyle = muted;
  if (biz.address) { ctx.fillText(_truncate(ctx, biz.address, W / 2 - 10), W - PADX, by); by += 16; }
  if (biz.phone)   { ctx.fillText(biz.phone, W - PADX, by); by += 16; }
  y = Math.max(fy, by) + PADBOT;

  // Crop to actual content height
  const H = Math.round(y);
  const out = document.createElement('canvas');
  out.width = W * S; out.height = H * S;
  out.getContext('2d').drawImage(cv, 0, 0, W * S, H * S, 0, 0, W * S, H * S);
  return out;
}

// Render the cfg to PNG and open the native share sheet (file), with fallbacks.
async function shareDocImage(cfg, filename, title, text) {
  try {
    showToast('Preparing document…', 'info');
    // Make sure brand fonts are ready before painting (else canvas falls back).
    if (document.fonts && document.fonts.ready) { try { await document.fonts.ready; } catch (_) {} }
    const canvas = renderDocCanvas(cfg);
    const blob = await new Promise((res, rej) =>
      canvas.toBlob(b => b ? res(b) : rej(new Error('toBlob failed')), 'image/png'));
    const file = new File([blob], filename, { type: 'image/png' });

    if (navigator.canShare && navigator.canShare({ files: [file] }) && navigator.share) {
      await navigator.share({ files: [file], title, text });
      return;
    }
    // Fallback: download the image so the user can attach it in any app.
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 5000);
    showToast('Native share unavailable here — saved the image so you can attach it', 'info');
  } catch (e) {
    if (e && (e.name === 'AbortError' || e.name === 'NotAllowedError')) return; // user dismissed the sheet
    showToast('Could not generate the document image — try Print instead', 'error');
  }
}

function shareTransaction(id) {
  const t = DB.transactions.find(x => x.id === id);
  if (!t) return;
  shareDocImage(buildReceiptCfg(t), `Receipt-${t.id}.png`, `Receipt ${t.id}`,
    `Receipt ${t.id} from ${DB.settings.businessName}`);
}

function shareInvoiceDoc(number) {
  const inv = DB.invoices.find(i => (i.number || i.id) === number) || DB.invoices.find(i => i.id === number);
  if (!inv) { showToast('Invoice not found', 'error'); return; }
  const num = inv.number || inv.id;
  shareDocImage(buildInvoiceCfg(inv), `Invoice-${num}.png`, `Invoice ${num}`,
    `Invoice ${num} from ${DB.settings.businessName}`);
}

/* ── Product Picker Modal (cart + button) ──────────────── */
function openProductPickerModal() {
  App._ppSearch = '';
  function renderPP() {
    const q = (App._ppSearch||'').toLowerCase();
    const prods = DB.products.filter(p => !q || p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q));
    return `
      <div style="padding:0 0 8px">
        <div class="pos-search-bar" style="padding:7px 12px;margin-bottom:8px">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <input id="ppSearch" type="text" placeholder="Search products…" value="${App._ppSearch||''}" oninput="App._ppSearch=this.value;document.getElementById('ppList').innerHTML=window._ppListHTML()" autofocus />
          ${App._ppSearch?`<span onclick="App._ppSearch='';document.getElementById('ppSearch').value='';document.getElementById('ppList').innerHTML=window._ppListHTML()" style="cursor:pointer;color:var(--text-muted);font-size:16px">×</span>`:''}
        </div>
        <div id="ppList" style="max-height:380px;overflow-y:auto">${window._ppListHTML()}</div>
      </div>`;
  }
  window._ppListHTML = () => {
    const q = (App._ppSearch||'').toLowerCase();
    const prods = DB.products.filter(p => !q || p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q));
    if (!prods.length) return `<div style="padding:32px;text-align:center;color:var(--text-muted)">No products found</div>`;
    return prods.map(p => {
      const variantProd = DB.hasVariants(p);
      const st = DB.productStock(p);
      const oos = st===0;
      const expanded = variantProd && App._expandVar === p.id;
      const priceLabel = variantProd ? `from ${DB.fmt(DB.variantMinPrice(p))}` : DB.fmt(p.price);
      const sub = variantProd ? `${p.category} · ${p.variants.length} options · ${st} left` : `${p.category} · ${st} left`;
      const toggle = `App._expandVar=(App._expandVar==='${p.id}'?null:'${p.id}');document.getElementById('ppList').innerHTML=window._ppListHTML()`;
      return `<div style="display:flex;align-items:center;gap:10px;padding:10px 14px;${oos?'opacity:0.4;':'cursor:pointer;'}transition:var(--t)"
        onmouseover="if(${!oos})this.style.background='var(--primary-light)'" onmouseout="this.style.background=''">
        <span style="font-size:20px;width:28px;text-align:center;flex-shrink:0">${p.emoji}</span>
        <div style="flex:1;min-width:0">
          <div style="font-size:13.5px;font-weight:600;color:var(--text-primary)">${esc(p.name)}</div>
          <div style="font-size:11.5px;color:var(--text-muted)">${sub}</div>
        </div>
        <div style="font-weight:800;font-size:13px;color:var(--text-primary);min-width:60px;text-align:right;${variantProd?'font-size:11px;':''}">${priceLabel}</div>
        ${!oos?`<button class="product-add-btn" onclick="${variantProd?toggle:`addToCart('${p.id}');closeModal()`}" style="flex-shrink:0">${variantProd?(expanded?'×':'›'):'+'}</button>`:'<span style="font-size:10px;color:var(--danger);font-weight:700;padding:2px 8px;background:#fef2f2;border-radius:99px">Out</span>'}
      </div>${expanded ? variantPickerHTML(p, "addToCart('%VID%');closeModal()") : ''}`;
    }).join('');
  };
  openModal('Add Items', renderPP(),
    `<button class="btn btn-secondary" onclick="closeModal()">Done</button>`, 'modal-lg');
  setTimeout(() => {
    const s = document.getElementById('ppSearch');
    if (s) s.oninput = function() { App._ppSearch=this.value; document.getElementById('ppList').innerHTML=window._ppListHTML(); };
  }, 50);
}

/* ── Quick Order / FAB — full mini-POS modal ──────────── */
function openQuickOrder() {
  App._noSearch = '';
  App.bankReceipt = null;
  // Start each New Sale clean so it isn't polluted by a half-built POS cart.
  if (!App.cart) App.cart = [];

  function noBody() {
    const subtotal = App.cart.reduce((s,i)=>s+i.price*i.qty,0);
    const disc = App.discountType==='fixed' ? Math.min(App.discount||0,subtotal) : subtotal*(App.discount||0)/100;
    const taxAmt = (subtotal-disc)*(DB.settings.taxRate/100);
    const total = subtotal-disc+taxAmt;
    const q = (App._noSearch||'').toLowerCase();
    const prods = DB.products.filter(p => p.stock>0 && (!q || p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)));
    return `
      <div class="pos-search-bar" style="padding:7px 12px;margin-bottom:10px">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
        <input id="noSearch" type="text" placeholder="Search & add items…" value="${App._noSearch||''}" autofocus />
        ${App._noSearch?`<span onclick="App._noSearch='';window._noRefresh()" style="cursor:pointer;color:var(--text-muted);font-size:16px">×</span>`:''}
      </div>
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px">
        <svg viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" stroke-width="2" style="width:16px;height:16px;flex-shrink:0"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
        <select class="form-control" style="height:34px;font-size:13px;padding:4px 10px;flex:1"
          onchange="App.selectedCustomer=this.value||null;onQuickOrderCustomerChange()">
          <option value="">Walk-in Customer</option>
          ${DB.customers.map(c=>`<option value="${c.id}" ${App.selectedCustomer==c.id?'selected':''}>${esc(c.name)}</option>`).join('')}
        </select>
      </div>
      ${App.cart.length ? `
        <div style="border:1px solid var(--border);border-radius:var(--r);margin-bottom:10px;overflow:hidden">
          <div style="max-height:160px;overflow-y:auto">
            ${App.cart.map(i=>`
              <div style="display:flex;align-items:center;gap:8px;padding:9px 12px;border-bottom:1px solid var(--border)">
                <span style="font-size:16px">${i.emoji}</span>
                <div style="flex:1;min-width:0"><div style="font-size:13px;font-weight:600">${esc(i.name)}</div><div style="font-size:11px;color:var(--text-muted)">${DB.fmt(i.price)} each</div></div>
                <div style="display:flex;align-items:center;gap:6px">
                  <button class="qty-btn" onclick="window._noQty('${i.id}',-1)">−</button>
                  <span style="font-size:13px;font-weight:700;min-width:20px;text-align:center">${i.qty}</span>
                  <button class="qty-btn" onclick="window._noQty('${i.id}',1)">+</button>
                </div>
                <span style="font-size:13px;font-weight:700;min-width:55px;text-align:right">${DB.fmt(i.price*i.qty)}</span>
              </div>`).join('')}
          </div>
          <div style="padding:10px 12px;background:var(--bg)">
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">
              <label style="font-size:12px;font-weight:600;color:var(--text-muted);white-space:nowrap">Discount</label>
              <input type="number" id="noDiscountInput" min="0" class="form-control" style="height:28px;font-size:12px;padding:3px 8px;flex:1" value="${App.discount||''}" placeholder="0.00"
                oninput="App.discount=parseFloat(this.value)||0;App.discountType='fixed';window._noRefresh()" />
            </div>
            ${disc>0?`<div style="display:flex;justify-content:space-between;font-size:12px;color:var(--success);margin-bottom:2px"><span>Discount</span><span>−${DB.fmt(disc)}</span></div>`:''}
            <div style="display:flex;justify-content:space-between;font-size:12px;color:var(--text-muted);margin-bottom:2px"><span>Tax (${DB.settings.taxRate}%)</span><span>${DB.fmt(taxAmt)}</span></div>
            <div style="display:flex;justify-content:space-between;font-size:14px;font-weight:800;padding-top:6px;border-top:1px solid var(--border)"><span>Total</span><span style="color:var(--primary)">${DB.fmt(total)}</span></div>
          </div>
        </div>` :
        `<div style="padding:14px;text-align:center;color:var(--text-muted);font-size:13px;border:1px dashed var(--border);border-radius:var(--r);margin-bottom:10px">
          Cart is empty — search and add items below
        </div>`}
      <div style="max-height:220px;overflow-y:auto;border:1px solid var(--border);border-radius:var(--r)">
        ${prods.length ? prods.map(p => {
          const variantProd = DB.hasVariants(p);
          const st = DB.productStock(p);
          const expanded = variantProd && App._noExpand === p.id;
          const inCartQty = variantProd
            ? App.cart.filter(i=>i.productId===p.id).reduce((s,i)=>s+i.qty,0)
            : (App.cart.find(i=>i.id===p.id)?.qty || 0);
          const sub = variantProd ? `${p.variants.length} options · ${st} left · from ${DB.fmt(DB.variantMinPrice(p))}` : `${st} left · ${DB.fmt(p.price)}`;
          return `<div style="display:flex;align-items:center;gap:10px;padding:9px 12px;border-bottom:1px solid var(--border);cursor:pointer"
            onmouseover="this.style.background='var(--primary-light)'" onmouseout="this.style.background=''">
            <span style="font-size:18px">${p.emoji}</span>
            <div style="flex:1;min-width:0"><div style="font-size:13px;font-weight:600">${esc(p.name)}</div><div style="font-size:11px;color:var(--text-muted)">${sub}</div></div>
            <button class="product-add-btn" onclick="window._noAdd('${p.id}')" style="flex-shrink:0">${variantProd?(expanded?'×':(inCartQty||'›')):(inCartQty||'+')}</button>
          </div>${expanded ? variantPickerHTML(p, "window._noAdd('%VID%')") : ''}`;
        }).join('') : `<div style="padding:24px;text-align:center;color:var(--text-muted)">No products found</div>`}
      </div>`;
  }

  window._noRefresh = () => {
    const el = document.getElementById('noBody');
    if (el) {
      // Preserve focus + caret across the sub-render so the item search / discount
      // fields don't drop the cursor after every keystroke.
      const ae = document.activeElement;
      const keepId = ae && ae.id && (ae.tagName === 'INPUT') ? ae.id : null;
      let ss = null, se = null;
      if (keepId) { try { ss = ae.selectionStart; se = ae.selectionEnd; } catch (_) {} }
      el.innerHTML = noBody(); attachNoSearch();
      if (keepId) { const a = document.getElementById(keepId); if (a) { a.focus(); if (ss != null) { try { a.setSelectionRange(ss, se); } catch (_) {} } } }
    }
    const btn = document.getElementById('noCheckoutBtn');
    if (btn) {
      const sub = App.cart.reduce((s,i)=>s+i.price*i.qty,0);
      const disc = App.discountType==='fixed'?Math.min(App.discount||0,sub):sub*(App.discount||0)/100;
      const total = sub-disc+((sub-disc)*(DB.settings.taxRate/100));
      btn.disabled = !App.cart.length;
      btn.textContent = App.cart.length ? `Proceed to Payment — ${DB.fmt(total)}` : 'Proceed to Payment';
    }
  };
  window._noAdd = id => {
    const s = DB.sellable(id); if (!s) return;
    if (s.needsVariant) { App._noExpand = (App._noExpand===s.id?null:s.id); window._noRefresh(); return; }
    if (s.stock===0) { showToast('Out of stock','warning'); return; }
    const ex = App.cart.find(i=>i.id===s.id);
    if (ex) { if (ex.qty<s.stock) ex.qty++; else { showToast('Max stock reached','warning'); return; } }
    else App.cart.push({id:s.id,productId:s.productId,name:s.name,emoji:s.emoji,price:s.price,cost:s.cost,qty:1,variantName:s.variantName});
    App._noExpand = null;
    window._noRefresh();
  };
  window._noQty = (id, delta) => {
    const idx = App.cart.findIndex(i=>i.id===id); if (idx===-1) return;
    const s = DB.sellable(id);
    let q = App.cart[idx].qty + delta;
    if (q<=0) { App.cart.splice(idx,1); }
    else if (s && q>s.stock) { showToast('Max stock reached','warning'); App.cart[idx].qty = s.stock; }
    else { App.cart[idx].qty = q; }
    window._noRefresh();
  };
  function attachNoSearch() {
    const s = document.getElementById('noSearch');
    if (s) s.oninput = function(){ App._noSearch=this.value; window._noRefresh(); };
  }

  const sub0 = App.cart.reduce((s,i)=>s+i.price*i.qty,0);
  const disc0 = App.discountType==='fixed'?Math.min(App.discount||0,sub0):sub0*(App.discount||0)/100;
  const total0 = sub0-disc0+((sub0-disc0)*(DB.settings.taxRate/100));

  openModal('New Order', `<div id="noBody">${noBody()}</div>`,
    `<button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
     <button class="btn btn-primary" id="noCheckoutBtn" onclick="closeModal();openPaymentModal()" ${!App.cart.length?'disabled':''}>
       ${App.cart.length?`Proceed to Payment — ${DB.fmt(total0)}`:'Proceed to Payment'}
     </button>`, 'modal-lg');
  setTimeout(attachNoSearch, 50);
}

function markInvoicePaid(id) {
  const inv = DB.invoices.find(i => i.id===id);
  if (inv) { inv.status='paid'; showToast(`Invoice ${inv.number} marked paid`,'success'); navigate('invoices'); }
}

function openCreateInvoiceModal() {
  openModal('New Invoice', `
    <div class="invoice-header-form">
      <div class="form-group">
        <label class="form-label">Customer</label>
        <select class="form-control" id="invCust">
          ${DB.customers.map(c=>`<option value="${c.id}">${esc(c.name)}</option>`).join('')}
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Due Date</label>
        <input type="date" class="form-control" id="invDue" value="${new Date(Date.now()+30*864e5).toISOString().split('T')[0]}" />
      </div>
    </div>
    <div class="table-wrapper">
      <table class="invoice-items-table">
        <thead><tr><th>Item</th><th>Qty</th><th>Price</th></tr></thead>
        <tbody id="invItemsBody">
          <tr>
            <td><input type="text" class="form-control" placeholder="Item name" /></td>
            <td><input type="number" class="form-control" value="1" min="1" style="width:70px" /></td>
            <td><input type="number" class="form-control" value="0" min="0" style="width:100px" /></td>
          </tr>
        </tbody>
      </table>
    </div>
    <button class="btn btn-secondary btn-sm" style="margin-top:10px" onclick="addInvRow()">+ Add Row</button>`,
    `<button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
     <button class="btn btn-primary" onclick="saveInvoice()">Create Invoice</button>`);
}

function addInvRow() {
  const tbody = document.getElementById('invItemsBody');
  if (!tbody) return;
  const row = document.createElement('tr');
  row.innerHTML = `<td><input type="text" class="form-control" placeholder="Item name" /></td>
    <td><input type="number" class="form-control" value="1" min="1" style="width:70px" /></td>
    <td><input type="number" class="form-control" value="0" min="0" style="width:100px" /></td>`;
  tbody.appendChild(row);
}

function saveInvoice() {
  const custId = document.getElementById('invCust').value;
  const due    = document.getElementById('invDue').value;
  const cust   = DB.getCustomer(custId);
  const items  = [];
  document.querySelectorAll('#invItemsBody tr').forEach(row => {
    const [nameEl, qtyEl, priceEl] = row.querySelectorAll('input');
    const name  = (nameEl?.value || '').trim();
    const qty   = parseFloat(qtyEl?.value) || 0;
    const price = parseFloat(priceEl?.value) || 0;
    if (name && qty > 0) items.push({ name, qty, price, amount: DB.money(qty*price) });
  });
  if (!items.length) { showToast('Add at least one line item','warning'); return; }
  const subtotal = DB.money(items.reduce((s,i)=>s+i.amount,0));
  const tax      = DB.money(subtotal * (DB.settings.taxRate/100));
  const total    = DB.money(subtotal + tax);
  DB.addInvoice({ customer: cust?.name||'Walk-in Customer', customerId: cust?.id||null, items, subtotal, tax, total, dueDate: due, status: 'pending' });
  closeModal(); showToast('Invoice created','success'); navigate('invoices');
}

/* ── Elegant document template (shared by invoice & receipt) ── */
function docEmblem(biz) {
  // Circular logo mark (matches the reference). Uploads via Settings → Logo.
  if (biz.logoUrl) return `<div style="width:64px;height:64px;border-radius:50%;overflow:hidden;background:#2A2A28;flex-shrink:0"><img src="${biz.logoUrl}" style="width:100%;height:100%;object-fit:cover" /></div>`;
  return `<div style="width:64px;height:64px;border-radius:50%;background:#1A1A1A;flex-shrink:0"></div>`;
}

function buildDocHTML(cfg) {
  const biz = DB.settings;
  const itemRows = (cfg.items || []).map(it => `
    <tr>
      <td>${esc(it.name)}</td>
      <td class="c">${it.qty}</td>
      <td class="r">${DB.fmt(it.price)}</td>
      <td class="r">${DB.fmt(it.amount)}</td>
    </tr>`).join('') || `<tr><td colspan="4" style="text-align:center;color:#8a8780;padding:22px 0">No line items</td></tr>`;
  return `
    <div class="doc-paper">
      <div class="doc-head">
        <div class="doc-emblem">${docEmblem(biz)}</div>
        <div class="doc-title">${cfg.docType}</div>
      </div>

      <div class="doc-billed">
        <div>
          <div class="doc-label">BILLED TO:</div>
          <div class="doc-text">${cfg.billedTo}</div>
        </div>
        <div class="doc-meta">
          ${cfg.metaLines.join('')}
          ${cfg.status ? `<div><span class="doc-status" style="${cfg.statusStyle || ''}">${cfg.status}</span></div>` : ''}
        </div>
      </div>

      ${cfg.delivery && cfg.delivery.orderType === 'delivery' ? `
      <div style="margin:0 0 18px;padding:12px 14px;background:#F6F3EC;border:1px solid #E6E1D5;border-radius:8px">
        <div style="font-size:10px;font-weight:700;letter-spacing:1px;color:#8A8780;text-transform:uppercase;margin-bottom:5px">Delivery Address</div>
        <div style="font-size:13.5px;font-weight:600;color:#2A2A28;line-height:1.4">${esc(cfg.delivery.location || '—')}</div>
        <div style="font-size:12px;color:#54514A;margin-top:4px">Contact: <strong style="color:#2A2A28">${esc(cfg.delivery.contact || '—')}</strong></div>
      </div>` : ''}

      <table class="doc-table">
        <thead><tr><th>Item</th><th class="c">Quantity</th><th class="r">Unit Price</th><th class="r">Total</th></tr></thead>
        <tbody>${itemRows}</tbody>
      </table>

      <div class="doc-totals">
        <div class="doc-totals-row"><span>Subtotal</span><span>${DB.fmt(cfg.subtotal)}</span></div>
        ${cfg.discount > 0 ? `<div class="doc-totals-row"><span>Discount</span><span>−${DB.fmt(cfg.discount)}</span></div>` : ''}
        <div class="doc-totals-row" style="border-bottom:none"><span>Tax (${cfg.taxRate}%)</span><span>${DB.fmt(cfg.tax)}</span></div>
        <div class="doc-grand"><span class="l">${cfg.totalLabel || 'Total'}</span><span class="v">${DB.fmt(cfg.total)}</span></div>
      </div>

      <div class="doc-thanks">${cfg.thanks || 'Thank you!'}</div>

      <div class="doc-foot">
        <div>
          ${cfg.paymentInfo ? `<div class="doc-label">PAYMENT INFORMATION</div><div class="doc-pay-line">${cfg.paymentInfo}</div>` : ''}
        </div>
        <div>
          <div class="doc-sign-name">${esc(biz.businessName)}</div>
          <div class="doc-sign-addr">${esc(biz.address || '')}${biz.phone ? '<br>'+esc(biz.phone) : ''}</div>
        </div>
      </div>
    </div>`;
}

// The invoice's document config — shared by buildDocHTML and renderDocCanvas.
function buildInvoiceCfg(inv) {
  const cust    = DB.customers.find(c => c.name === inv.customer) || {};
  const biz     = DB.settings;
  const subtotal = inv.subtotal ?? inv.amount ?? 0;
  const tax      = inv.tax      ?? 0;
  const total    = inv.total    ?? subtotal + tax;
  const dueDate  = inv.dueDate  || 'N/A';
  const number   = inv.number   || inv.id;

  const statusStyleMap = {
    paid:    'background:#e7f3ea;color:#2f7d46',
    overdue: 'background:#fbe9e9;color:#c0392b',
    draft:   'background:#ece9e1;color:#8a8780',
    pending: 'background:#fbf3e2;color:#b7892b',
  };

  const items = (inv.items || []).map(it => ({
    name:   it.name || it.desc || 'Item',
    qty:    it.qty,
    price:  it.price ?? it.unit ?? it.amount,
    amount: it.amount ?? (it.qty * (it.price || 0)),
  }));

  const billedTo = `<b style="color:#2A2A28;font-weight:600">${esc(inv.customer)}</b>`
    + (cust.email ? `<br>${esc(cust.email)}` : '')
    + (cust.phone ? `<br>${esc(cust.phone)}` : '');

  const metaLines = [
    `<div>Invoice No. <b>${number}</b></div>`,
    `<div>Issued ${formatDate(inv.date)}</div>`,
    `<div>Due ${formatDate(dueDate)}</div>`,
  ];

  const payLines = [];
  if (biz.bankName)      payLines.push(`<b>${esc(biz.bankName)}</b>`);
  if (biz.accountName)   payLines.push(`Account Name: ${biz.accountName}`);
  if (biz.accountNumber) payLines.push(`Account No.: ${biz.accountNumber}`);
  payLines.push(`Pay by: ${formatDate(dueDate)}`);

  return {
    docType: 'INVOICE',
    billedTo, metaLines,
    status: inv.status.toUpperCase(),
    statusStyle: statusStyleMap[inv.status] || statusStyleMap.pending,
    items, subtotal, discount: inv.discount || 0, tax, taxRate: biz.taxRate, total,
    totalLabel: 'Total Due',
    paymentInfo: payLines.join('<br>'),
    thanks: 'Thank you for your Business!',
  };
}

function viewInvoice(id) {
  const inv  = DB.invoices.find(i => i.id === id);
  if (!inv) return;

  const cust    = DB.customers.find(c => c.name === inv.customer) || {};
  const number  = inv.number || inv.id;
  const docHtml = buildDocHTML(buildInvoiceCfg(inv));
  const customerEmail = cust.email || '';

  openModal(`Invoice ${number}`,
    `<div class="invoice-preview-wrap">${docHtml}</div>
     <div class="invoice-send-panel">
       <div class="invoice-send-label">
         <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
         Send Invoice to Customer
       </div>
       <div class="invoice-send-row">
         <input type="email" class="form-control" id="sendInvEmail" placeholder="customer@email.com" value="${customerEmail}" />
         <button class="btn btn-primary" onclick="sendInvoiceEmail('${number}')">
           <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
           Send
         </button>
       </div>
     </div>`,
    `<button class="btn btn-secondary" onclick="closeModal()">Close</button>
     <button class="btn btn-ghost" onclick="window.print()">
       <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:15px;height:15px"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
       Print
     </button>
     <button class="btn btn-primary" onclick="shareInvoiceDoc('${number}')">
       <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:14px;height:14px"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
       Share
     </button>
     ${inv.status!=='paid'?`<button class="btn btn-success" onclick="closeModal();markInvoicePaid('${inv.id}')">Mark as Paid</button>`:''}`,
    'modal-lg');
}

function sendInvoiceEmail(number) {
  const email = document.getElementById('sendInvEmail')?.value?.trim();
  if (!isValidEmail(email)) { showToast('Enter a valid email address', 'error'); return; }
  showToast(`Invoice ${number} sent to ${email}`, 'success');
}

/* ══════════════════════════════════════════════════════════
   INVENTORY
   ══════════════════════════════════════════════════════════ */
function renderInventory(el) {
  const products = DB.products;
  const totalVal = products.reduce((s,p) => s+DB.stockValue(p), 0);
  const retail   = products.reduce((s,p) => s+DB.retailValue(p), 0);
  const lowItems = products.filter(p => DB.productStock(p)<=p.minStock && DB.productStock(p)>0);
  const outItems = products.filter(p => DB.productStock(p)===0);
  const turnover = (retail / Math.max(totalVal, 1)).toFixed(1);
  const filtered = products.filter(p => {
    const st = DB.productStock(p);
    const filterOk = App.stockFilter==='all' ||
      (App.stockFilter==='low' && st<=p.minStock && st>0) ||
      (App.stockFilter==='out' && st===0);
    const searchOk = p.name.toLowerCase().includes(App.invSearch.toLowerCase());
    return filterOk && searchOk;
  });

  const itemRows = filtered.map((p, i) => {
    const stock = DB.productStock(p);
    const pct  = stock===0 ? 0 : Math.min(Math.round((stock / (p.minStock * 4 || 1)) * 100), 100);
    const fill = stock===0?'out':stock<=p.minStock?'mid':'high';
    const stockClass = stock===0?'inv-stock-out':stock<=p.minStock?'inv-stock-low':'inv-stock-ok';
    const bgs = ['var(--pastel-blue)','var(--pastel-purple)','var(--pastel-pink)','var(--pastel-green)','var(--pastel-yellow)','var(--pastel-orange)','var(--pastel-teal)'];
    return `<tr>
      <td>
        <div style="display:flex;align-items:center;gap:10px">
          <div class="inv-product-emoji" style="background:${bgs[i%7]}">${p.emoji}</div>
          <div>
            <div class="inv-product-name">${esc(p.name)}</div>
            <div class="inv-product-cat">${esc(p.category)}${DB.hasVariants(p)?` · <span style="color:var(--primary);font-weight:700">${p.variants.length} variants</span>`:''}</div>
          </div>
        </div>
      </td>
      <td><span class="inv-product-sku">${esc(p.sku)}</span></td>
      <td>
        <div class="${stockClass}" style="margin-bottom:4px">${stock===0?'Out of stock':stock+' units'}</div>
        <div class="stock-bar" style="width:80px"><div class="stock-fill ${fill}" style="width:${pct}%"></div></div>
        ${DB.hasVariants(p)?`<div style="font-size:10px;color:var(--text-muted);margin-top:3px">${p.variants.map(v=>`${esc(v.name)}:${v.stock}`).join(' · ')}</div>`:''}
      </td>
      <td>
        <div style="display:flex;gap:6px">
          <button class="btn btn-secondary btn-sm" onclick="openRestockModal('${p.id}')">+ Restock</button>
          <button class="btn btn-ghost btn-sm btn-icon" aria-label="Edit ${esc(p.name)}" onclick="openEditProductModal('${p.id}')">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:13px;height:13px" aria-hidden="true"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>
        </div>
      </td>
    </tr>`;
  }).join('');

  el.innerHTML = `
    <!-- Page header -->
    <div class="page-header">
      <div class="page-header-title">Inventory</div>
      <div class="page-header-sub">${products.length} products across ${new Set(products.map(p=>p.category)).size} categories</div>
    </div>

    <!-- Filter tabs -->
    <div class="filter-tabs">
      <div class="filter-tab${App.stockFilter==='all'?' active':''}" onclick="App.stockFilter='all';navigate('inventory')">All Items</div>
      <div class="filter-tab${App.stockFilter==='low'?' active':''}" onclick="App.stockFilter='low';navigate('inventory')">Low Stock</div>
      <div class="filter-tab${App.stockFilter==='out'?' active':''}" onclick="App.stockFilter='out';navigate('inventory')">Out of Stock</div>
    </div>

    <!-- Stat cards -->
    <div class="section">
      <div class="inv-hero-card">
        <div>
          <div class="inv-hero-label">TOTAL INVENTORY VALUE</div>
          <div class="inv-hero-value">${DB.fmt(retail)}</div>
          <div class="inv-hero-change">↑ ${DB.fmt(retail - totalVal)} potential profit</div>
        </div>
        <div class="inv-hero-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
        </div>
      </div>

      <div class="inv-alert-card">
        <div class="inv-alert-label">LOW STOCK ALERTS</div>
        <div class="inv-alert-count">${lowItems.length} Items Need Reorder</div>
        <button class="btn btn-primary btn-sm" onclick="App.stockFilter='low';navigate('inventory')">Review All</button>
      </div>

      <div class="inv-card" style="display:flex;align-items:center;justify-content:space-between">
        <div>
          <div class="inv-hero-label">STOCK TURNOVER</div>
          <div style="font-size:28px;font-weight:900;color:var(--text-primary)">${turnover}x</div>
          <div style="font-size:12px;color:var(--text-muted)">Retail-to-cost ratio</div>
        </div>
        <div style="display:flex;gap:8px">
          <div style="width:14px;height:14px;border-radius:50%;background:var(--grad-primary)"></div>
          <div style="width:14px;height:14px;border-radius:50%;background:var(--teal-bright)"></div>
          <div style="width:14px;height:14px;border-radius:50%;background:var(--primary-light);border:2px solid var(--primary-mid)"></div>
        </div>
      </div>
    </div>

    <!-- Search + Filters + Export -->
    <div class="section">
      <div class="inv-filter-row" style="gap:8px">
        <div class="pos-search-bar" style="flex:1;padding:9px 13px">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <input type="text" id="invSearchInput" placeholder="Search products, SKU…" value="${App.invSearch}" oninput="App.invSearch=this.value;navigate('inventory')" />
        </div>
        <button class="btn btn-secondary btn-sm" onclick="downloadInventoryCSV()">Export</button>
        <button class="btn btn-primary btn-sm" onclick="openAddProductModal()">+ Add</button>
      </div>
    </div>

    <!-- Product table -->
    <div class="section" style="padding-bottom:20px">
      <div class="card" style="overflow:hidden">
        <div class="table-wrapper">
          <table>
            <thead>
              <tr><th>Product</th><th>SKU</th><th>Stock</th><th>Actions</th></tr>
            </thead>
            <tbody>
              ${itemRows || `<tr><td colspan="4" style="text-align:center;padding:32px;color:var(--text-muted)">No products found</td></tr>`}
            </tbody>
          </table>
        </div>
        <div class="pagination">
          <span>Showing ${filtered.length} of ${products.length} products</span>
        </div>
      </div>
    </div>

    <!-- Stock movement audit log -->
    ${(() => {
      const col = { sale:'#DC2626', refund:'#2563EB', restock:'#059669', received:'#059669', adjustment:'#6B7280', new:'#0D6B5E', exchange:'#7C3AED' };
      const lbl = { sale:'Sale', refund:'Refund', restock:'Restock', received:'Received', adjustment:'Adjusted', new:'New', exchange:'Exchange' };
      const moves = (DB.stockMoves || []).slice(0, 12);
      return `<div class="section" style="padding-bottom:24px">
        <div class="card" style="overflow:hidden">
          <div class="card-header"><span class="card-title">Stock Movements</span>
            ${moves.length ? `<button class="btn btn-secondary btn-sm" onclick="downloadStockMovesCSV()">Download</button>` : ''}
          </div>
          ${moves.length ? `<div class="table-wrapper"><table>
            <thead><tr><th>Date</th><th>Product</th><th>Type</th><th>Change</th><th>Bal.</th></tr></thead>
            <tbody>${moves.map(m => { const c = col[m.type] || '#6B7280'; return `<tr>
              <td style="white-space:nowrap"><div style="font-size:12.5px;font-weight:600">${formatDate(m.date)}</div><div style="font-size:10px;color:var(--text-muted)">${m.time} · ${m.user}</div></td>
              <td>${m.productName}</td>
              <td><span style="font-size:10px;font-weight:700;padding:2px 8px;border-radius:99px;background:${c}1a;color:${c}">${lbl[m.type] || m.type}</span></td>
              <td style="font-weight:800;color:${m.delta>=0?'var(--success)':'var(--danger)'}">${m.delta>=0?'+':''}${m.delta}</td>
              <td style="font-weight:600">${m.balance==null?'—':m.balance}</td>
            </tr>`; }).join('')}</tbody>
          </table></div>` : `<div style="padding:28px;text-align:center;color:var(--text-muted);font-size:13px">No stock movements yet.<br>Sales, restocks and edits will be tracked here.</div>`}
        </div>
      </div>`;
    })()}`;
}

function openRestockModal(id) {
  const p = DB.products.find(x => x.id === id || x.id === String(id));
  if (!p) return;
  const variantSelect = DB.hasVariants(p) ? `
    <div class="form-group">
      <label class="form-label">Variant</label>
      <select class="form-control" id="restockVariant" onchange="onRestockVariantChange('${p.id}')">
        ${p.variants.map(v => `<option value="${v.id}">${v.name} — ${v.stock} in stock · ${DB.fmt(v.cost)}</option>`).join('')}
      </select>
    </div>` : '';
  // The unit/sellable we are restocking: first variant for variant products, else the product.
  const first = DB.hasVariants(p) ? DB.sellable(p.variants[0].id) : DB.sellable(p.id);
  openModal(`Restock: ${p.name}`, `
    <div style="text-align:center;margin-bottom:20px">
      <div style="font-size:56px">${p.emoji}</div>
      <div style="font-size:16px;font-weight:700;margin-top:8px">${p.name}</div>
      <div style="color:var(--gray-400);font-size:13px">${DB.hasVariants(p)?'Total stock':'Current stock'}: <strong style="color:var(--gray-800)">${DB.productStock(p)}</strong></div>
    </div>
    ${variantSelect}
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">Add Quantity</label>
        <input type="number" class="form-control" id="restockQty" value="10" min="1" style="font-size:20px;text-align:center" oninput="updateRestockPreview('${p.id}')" />
      </div>
      <div class="form-group">
        <label class="form-label">Unit Cost (${DB.settings.currency})</label>
        <input type="number" class="form-control" id="restockCost" value="${DB.money(first.cost)}" min="0" step="0.01" style="font-size:20px;text-align:center" oninput="updateRestockPreview('${p.id}')" />
      </div>
    </div>
    <div id="restockPreview" style="background:var(--bg);border:1px solid var(--border);border-radius:var(--r);padding:11px 14px;font-size:12.5px;color:var(--text-secondary)"></div>`,
    `<button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
     <button class="btn btn-primary" onclick="doRestock('${p.id}')">Add Stock</button>`);
  updateRestockPreview(p.id);
}

// The sellable id currently targeted by the restock modal (variant or product).
function restockTargetId(productId) {
  const sel = document.getElementById('restockVariant');
  return sel ? sel.value : productId;
}

// When the variant dropdown changes, reset the cost field to that variant's cost.
function onRestockVariantChange(productId) {
  const s = DB.sellable(restockTargetId(productId));
  const costEl = document.getElementById('restockCost');
  if (s && costEl) costEl.value = DB.money(s.cost);
  updateRestockPreview(productId);
}

// Live preview of the new weighted-average cost as the user types.
function updateRestockPreview(productId) {
  const s = DB.sellable(restockTargetId(productId));
  const box = document.getElementById('restockPreview');
  if (!s || !box) return;
  const qty  = parseInt(document.getElementById('restockQty')?.value) || 0;
  const cost = parseFloat(document.getElementById('restockCost')?.value);
  const unitCost = isNaN(cost) ? s.cost : Math.max(0, cost);
  const newStock = s.stock + Math.max(0, qty);
  const newAvg   = weightedAvgCost(s.stock, s.cost, qty, unitCost);
  box.innerHTML = qty > 0
    ? `New stock <strong style="color:var(--text-primary)">${newStock}</strong> · New avg cost
       <strong style="color:var(--primary)">${DB.fmt(newAvg)}</strong>
       ${DB.money(newAvg)!==DB.money(s.cost) ? `<span style="color:var(--text-muted)"> (was ${DB.fmt(s.cost)})</span>` : ''}`
    : `Enter a quantity to add stock.`;
}

// Weighted-average (moving-average) cost: blends existing inventory value with
// the incoming purchase. Falls back gracefully when there is no prior stock.
function weightedAvgCost(oldStock, oldCost, addQty, addCost) {
  oldStock = Math.max(0, oldStock || 0);
  addQty   = Math.max(0, addQty   || 0);
  const totalQty = oldStock + addQty;
  if (totalQty <= 0) return DB.money(addCost || oldCost || 0);
  if (addQty <= 0)   return DB.money(oldCost || 0);
  const blended = (oldStock * (oldCost || 0) + addQty * (addCost || 0)) / totalQty;
  return DB.money(blended);
}

function doRestock(productId) {
  const qty  = parseInt(document.getElementById('restockQty').value)||0;
  const costRaw = parseFloat(document.getElementById('restockCost')?.value);
  const targetId = restockTargetId(productId);
  const gv = DB.getVariant(targetId);
  const unit = gv ? gv.variant : DB.products.find(x => String(x.id) === String(targetId));
  if (unit && qty>0) {
    const unitCost = isNaN(costRaw) ? unit.cost : Math.max(0, costRaw);
    const oldCost  = unit.cost;
    unit.cost = weightedAvgCost(unit.stock, unit.cost, qty, unitCost);   // moving-average valuation
    DB.applyStockDelta(targetId, +qty, 'restock', `Restock @ ${DB.fmt(unitCost)}/unit`);
    const label = gv ? `${gv.product.name} — ${unit.name}` : unit.name;
    const costMsg = DB.money(unit.cost) !== DB.money(oldCost) ? ` · avg cost now ${DB.fmt(unit.cost)}` : '';
    showToast(`Added ${qty} to ${label}${costMsg}`,'success');
  }
  closeModal(); navigate('inventory');
}

function openEditProductModal(id) {
  const p = DB.products.find(x => x.id === id || x.id === String(id));
  if (!p) return;
  // Work on a transient copy of the variants so Cancel discards edits.
  App._editVariants = DB.hasVariants(p) ? p.variants.map(v => ({ ...v })) : [];
  openModal(`Edit: ${p.name}`, '', '', 'modal-lg');
  renderEditProductBody(p.id);
}

// Re-renderable body for the edit-product modal (so add/remove variant updates live).
function renderEditProductBody(id) {
  const p = DB.products.find(x => x.id === id || x.id === String(id));
  if (!p) return;
  // Persist any values currently typed in variant inputs before re-rendering.
  syncEditVariantInputs();
  const hasVars = (App._editVariants || []).length > 0;
  const derivedStock = (App._editVariants || []).reduce((s,v)=>s+(parseInt(v.stock,10)||0),0);

  const variantRows = (App._editVariants || []).map((v, i) => `
    <div style="display:grid;grid-template-columns:1.4fr 1fr 0.9fr 0.9fr 0.9fr auto;gap:6px;align-items:center;margin-bottom:6px" data-vrow="${i}">
      <input class="form-control" style="font-size:12px;padding:6px 8px" placeholder="Name (e.g. Small)" value="${v.name||''}" data-vfield="name" />
      <input class="form-control" style="font-size:12px;padding:6px 8px" placeholder="SKU" value="${v.sku||''}" data-vfield="sku" />
      <input class="form-control" type="number" min="0" step="0.01" style="font-size:12px;padding:6px 8px" placeholder="Cost" value="${v.cost!=null?v.cost:''}" data-vfield="cost" />
      <input class="form-control" type="number" min="0" step="0.01" style="font-size:12px;padding:6px 8px" placeholder="Price" value="${v.price!=null?v.price:''}" data-vfield="price" />
      <input class="form-control" type="number" min="0" style="font-size:12px;padding:6px 8px" placeholder="Stock" value="${v.stock!=null?v.stock:''}" data-vfield="stock" />
      <button class="btn btn-ghost btn-sm btn-icon" title="Remove" onclick="removeEditVariant('${id}',${i})" style="color:var(--danger)">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:13px;height:13px"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    </div>`).join('');

  document.getElementById('modalBody').innerHTML = `
    <div class="form-row">
      <div class="form-group"><label class="form-label">Name</label><input type="text" class="form-control" id="ep_name" value="${esc(p.name)}" /></div>
      <div class="form-group"><label class="form-label">Category</label><input type="text" class="form-control" id="ep_cat" value="${esc(p.category)}" /></div>
    </div>
    <div class="form-row">
      <div class="form-group"><label class="form-label">SKU</label><input type="text" class="form-control" id="ep_sku" value="${esc(p.sku||'')}" /></div>
      <div class="form-group"><label class="form-label">Barcode</label><input type="text" class="form-control" id="ep_barcode" value="${esc(p.barcode||'')}" placeholder="scannable code" /></div>
    </div>
    <div class="form-row">
      <div class="form-group"><label class="form-label">Cost Price${hasVars?' (default)':''}</label><input type="number" class="form-control" id="ep_cost" value="${p.cost}" /></div>
      <div class="form-group"><label class="form-label">Selling Price${hasVars?' (default)':''}</label><input type="number" class="form-control" id="ep_price" value="${p.price}" /></div>
    </div>
    <div class="form-row">
      <div class="form-group"><label class="form-label">Stock</label>
        <input type="number" class="form-control" id="ep_stock" value="${hasVars?derivedStock:p.stock}" ${hasVars?'disabled title="Derived from variants"':''} />
        ${hasVars?'<div style="font-size:10.5px;color:var(--text-muted);margin-top:3px">Sum of variant stock</div>':''}
      </div>
      <div class="form-group"><label class="form-label">Min Stock (reorder point)</label><input type="number" class="form-control" id="ep_min" value="${p.minStock}" /></div>
    </div>

    <div style="border-top:1px solid var(--border);margin-top:6px;padding-top:14px">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">
        <div style="font-size:13px;font-weight:700;color:var(--primary)">Variants <span style="color:var(--text-muted);font-weight:500">(size / color / etc.)</span></div>
        <button class="btn btn-secondary btn-sm" onclick="addEditVariant('${id}')">+ Add variant</button>
      </div>
      ${hasVars ? `<div style="display:grid;grid-template-columns:1.4fr 1fr 0.9fr 0.9fr 0.9fr auto;gap:6px;font-size:10px;font-weight:700;color:var(--text-muted);text-transform:uppercase;margin-bottom:4px">
        <span>Name</span><span>SKU</span><span>Cost</span><span>Price</span><span>Stock</span><span></span></div>${variantRows}`
      : `<div style="font-size:12.5px;color:var(--text-muted);padding:8px 0">No variants — this product is sold as a single item. Add variants to track size/color stock separately.</div>`}
    </div>`;

  document.getElementById('modalFooter').innerHTML = `
    <button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
    <button class="btn btn-primary" onclick="saveEditProduct('${id}')">Save Changes</button>`;
}

// Read the current variant input values back into App._editVariants.
function syncEditVariantInputs() {
  if (!App._editVariants) return;
  document.querySelectorAll('[data-vrow]').forEach(row => {
    const i = parseInt(row.getAttribute('data-vrow'), 10);
    if (!App._editVariants[i]) return;
    row.querySelectorAll('[data-vfield]').forEach(inp => {
      const f = inp.getAttribute('data-vfield');
      App._editVariants[i][f] = (f==='cost'||f==='price'||f==='stock') ? inp.value : inp.value;
    });
  });
}

function addEditVariant(id) {
  if (!App._editVariants) App._editVariants = [];
  const p = DB.products.find(x => x.id === id || x.id === String(id));
  App._editVariants.push({ name:'', sku:'', cost:p?p.cost:0, price:p?p.price:0, stock:0 });
  renderEditProductBody(id);
}

function removeEditVariant(id, i) {
  syncEditVariantInputs();
  App._editVariants.splice(i, 1);
  renderEditProductBody(id);
}

function saveEditProduct(id) {
  const p = DB.products.find(x => x.id === id || x.id === String(id));
  if (!p) return;
  syncEditVariantInputs();
  // Parse safely: keep the old value only when the field is blank/invalid (NaN),
  // but allow a deliberate 0 (e.g. setting stock to zero).
  const num = (elId, fallback, asInt) => {
    const raw = (document.getElementById(elId)?.value ?? '').trim();
    if (raw === '') return fallback;
    const v = asInt ? parseInt(raw, 10) : parseFloat(raw);
    return isNaN(v) ? fallback : v;
  };
  const oldStock = p.stock;
  p.name     = cleanText(document.getElementById('ep_name').value) || p.name;
  p.category = document.getElementById('ep_cat').value || p.category;
  { const skuEl = document.getElementById('ep_sku'); if (skuEl) p.sku = cleanText(skuEl.value) || p.sku;
    const bcEl = document.getElementById('ep_barcode'); if (bcEl) p.barcode = cleanText(bcEl.value); }
  p.cost     = Math.max(0, num('ep_cost', p.cost));
  p.price    = Math.max(0, num('ep_price', p.price));
  p.minStock = Math.max(0, num('ep_min', p.minStock, true));

  // Build variants from the editor (drop rows with a blank name).
  const vars = (App._editVariants || [])
    .filter(v => (v.name||'').trim())
    .map((v, idx) => ({
      id: v.id || `${p.id}-V${Date.now().toString(36)}${idx}`,
      name: cleanText(v.name),
      sku: (v.sku||'').trim() || `${p.sku||p.id}-${idx+1}`,
      cost: Math.max(0, parseFloat(v.cost) || 0),
      price: Math.max(0, parseFloat(v.price) || 0),
      stock: Math.max(0, parseInt(v.stock, 10) || 0),
    }));

  if (vars.length) {
    p.variants = vars;
    p.stock = DB.productStock(p);   // derived
  } else {
    if (DB.hasVariants(p)) delete p.variants;   // converted back to a simple product
    p.stock = Math.max(0, num('ep_stock', p.stock, true));
    if (p.stock !== oldStock) DB.logStock(p.id, p.stock - oldStock, 'adjustment', 'Stock edited');
  }
  App._editVariants = null;
  closeModal(); showToast(`${p.name} updated`, 'success'); navigate('inventory');
}

/* ══════════════════════════════════════════════════════════
   CUSTOMERS
   ══════════════════════════════════════════════════════════ */
function renderCustomers(el) {
  const active   = DB.customers.filter(c => c.is_active !== false);
  const filtered = DB.searchCustomers(App.custSearch);
  const totalSpend = active.reduce((s,c) => s+(c.totalSpent||0), 0);

  el.innerHTML = `
    <div class="kpi-grid">
      ${miniKPI('Total Customers', active.length,          'Active',            'up',      'var(--pastel-blue)')}
      ${miniKPI('Total Revenue',   DB.fmt(totalSpend),     'From customers',   'up',      'var(--pastel-green)')}
      ${miniKPI('Avg Spend',       DB.fmt(totalSpend/(active.length||1)), 'Per customer','up','var(--pastel-purple)')}
      ${miniKPI('Loyal (3+ visits)',active.filter(c=>c.visits>3).length, 'Customers','up', 'var(--pastel-teal)')}
    </div>
    <div class="card">
      <div class="card-header">
        <span class="card-title">Customers</span>
        <button class="btn btn-primary btn-sm" onclick="openAddCustomerModal()">+ Add</button>
      </div>
      <div style="padding:10px 14px;border-bottom:1px solid var(--border)">
        <div class="pos-search-bar" style="padding:8px 12px">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <input type="text" id="custSearchInput" placeholder="Search by name or phone…" value="${App.custSearch||''}" oninput="App.custSearch=this.value;navigate('customers')" />
          ${App.custSearch?`<span onclick="App.custSearch='';navigate('customers')" style="cursor:pointer;color:var(--text-muted);font-size:16px;line-height:1">×</span>`:''}
        </div>
      </div>
      <div class="txn-list">
        ${filtered.length ? filtered.map(c => `
          <div class="txn-card" onclick="viewCustomer('${c.id}')" style="cursor:pointer">
            <div class="customer-avatar-sm">${c.name.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase()}</div>
            <div class="txn-info">
              <div class="txn-name">${esc(c.name)}</div>
              <div class="txn-meta">${esc(c.phone||'No phone')}${c.email?` · ${esc(c.email)}`:''}</div>
            </div>
            <div class="txn-right" style="display:flex;align-items:center;gap:10px">
              <div style="text-align:right">
                <div class="txn-amount">${DB.fmt(c.totalSpent||0)}</div>
                <span class="badge-pill badge-primary" style="font-size:10px">${c.visits||0} visits</span>
              </div>
              <button class="btn btn-ghost btn-sm btn-icon" aria-label="Delete ${esc(c.name)}" title="Delete customer"
                onclick="event.stopPropagation();confirmDeleteCustomer('${c.id}')" style="color:var(--danger)">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:15px;height:15px" aria-hidden="true"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
              </button>
            </div>
          </div>`).join('') : `<div style="padding:36px 20px;text-align:center;color:var(--text-muted);font-size:13.5px">${App.custSearch?'No customers match your search.':'No customers yet. Tap “+ Add” to create one.'}</div>`}
      </div>
    </div>`;
}

function openAddCustomerModal() {
  openModal('New Customer', `
    <div class="form-row">
      <div class="form-group"><label class="form-label">Full Name <span style="color:var(--danger)">*</span></label><input type="text" class="form-control" id="nc_name" /></div>
      <div class="form-group"><label class="form-label">Phone <span style="color:var(--danger)">*</span></label><input type="tel" class="form-control" id="nc_phone" placeholder="+960 7XX XXXX" /></div>
    </div>
    <div class="form-group"><label class="form-label">Email</label><input type="email" class="form-control" id="nc_email" placeholder="customer@email.com" /></div>
    <div class="form-group"><label class="form-label">Delivery Address</label><input type="text" class="form-control" id="nc_address" placeholder="House / street / island — auto-fills delivery orders" /></div>
    <div class="form-group"><label class="form-label">Notes</label><textarea class="form-control" id="nc_notes" style="min-height:64px;resize:vertical;font-family:inherit" placeholder="Any extra info about this customer"></textarea></div>
    <div class="form-group"><label class="form-label">Pricing Tier</label>
      <select class="form-control" id="nc_tier">
        <option value="">No tier</option>
        ${(DB.pricingTiers||[]).map(t=>`<option value="${t.id}">${t.name}${t.discountPct?` (−${t.discountPct}%)`:''}</option>`).join('')}
      </select></div>`,
    `<button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
     <button class="btn btn-primary" onclick="saveNewCustomer()">Add Customer</button>`);
}

function saveNewCustomer() {
  const name  = cleanText(document.getElementById('nc_name')?.value);
  const email = cleanText(document.getElementById('nc_email').value);
  const phone = cleanText(document.getElementById('nc_phone').value);
  if (!name)  { showToast('Full name is required','error'); return; }
  if (!phone) { showToast('Phone number is required','error'); return; }
  if (!isValidPhone(phone)) { showToast('Enter a valid phone number','error'); return; }
  if (email && !isValidEmail(email)) { showToast('Enter a valid email address','error'); return; }
  DB.addCustomer({ name, email, phone,
    address: cleanText(document.getElementById('nc_address')?.value),
    notes: cleanText(document.getElementById('nc_notes')?.value),
    tier: document.getElementById('nc_tier')?.value || null,
    totalSpent: 0, visits: 0 });
  closeModal(); showToast(`${name} added`,'success'); navigate('customers');
}

// Delete / archive a customer with confirmation. Hard-deletes when no orders are
// linked, otherwise soft-deletes (archives) to preserve order history.
function confirmDeleteCustomer(id) {
  const c = DB.getCustomer(id);
  if (!c) return;
  const willArchive = DB.customerHasOrders(id);
  openModal('Delete Customer',
    `<p style="font-size:14px;color:var(--text-secondary)">Are you sure you want to delete <strong>${esc(c.name)}</strong>? This cannot be undone.</p>
     ${willArchive?`<p style="font-size:12.5px;color:var(--text-muted);margin-top:8px">This customer has existing orders, so they’ll be <strong>archived</strong> (hidden from the list) rather than fully removed, to keep your records intact.</p>`:''}`,
    `<button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
     <button class="btn" style="background:var(--danger);color:#fff" onclick="doDeleteCustomer('${id}')">Delete</button>`);
}
function doDeleteCustomer(id) {
  const c = DB.getCustomer(id);
  const res = DB.deleteCustomer(id);
  closeModal();
  if (!res.ok) { showToast('Could not delete customer','error'); return; }
  showToast(res.archived ? `${c?c.name:'Customer'} has existing orders — archived` : `${c?c.name:'Customer'} deleted`, res.archived?'warning':'success');
  navigate('customers');
}

// Change a customer's pricing tier from their profile.
function setCustomerTier(id, tierId) {
  const c = DB.getCustomer(id);
  if (c) { c.tier = tierId || null; showToast('Tier updated', 'success'); }
  viewCustomer(id);
}

function viewCustomer(id) {
  const c = DB.getCustomer(id);
  if (!c) return;
  const cTxns = DB.transactions.filter(t => t.customerId===id || t.customerName===c.name || t.customer===c.name);
  openModal(c.name, `
    <div style="display:flex;align-items:center;gap:14px;margin-bottom:16px">
      <div class="customer-avatar-sm" style="width:52px;height:52px;font-size:18px">${c.name.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase()}</div>
      <div style="min-width:0"><div style="font-size:17px;font-weight:700">${esc(c.name)} ${c.is_active===false?'<span class="badge-pill badge-gray" style="font-size:9.5px;vertical-align:middle">Archived</span>':''}</div>
        <div style="color:var(--gray-400);font-size:13px">${esc(c.phone||'No phone')}${c.email?` · ${esc(c.email)}`:''}</div></div>
    </div>
    ${(c.address||c.notes)?`<div style="background:var(--bg);border:1px solid var(--border);border-radius:var(--r);padding:11px 13px;margin-bottom:16px;font-size:13px">
      ${c.address?`<div style="display:flex;gap:7px;margin-bottom:${c.notes?'6px':'0'}"><svg viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" stroke-width="2" style="width:15px;height:15px;flex-shrink:0;margin-top:1px"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg><span style="color:var(--text-secondary)">${esc(c.address)}</span></div>`:''}
      ${c.notes?`<div style="display:flex;gap:7px"><svg viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" stroke-width="2" style="width:15px;height:15px;flex-shrink:0;margin-top:1px"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg><span style="color:var(--text-secondary)">${esc(c.notes)}</span></div>`:''}
    </div>`:''}
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:16px;background:var(--bg);border:1px solid var(--border);border-radius:var(--r);padding:10px 12px">
      <span style="font-size:12.5px;font-weight:700;color:var(--text-secondary);white-space:nowrap">Pricing Tier</span>
      <select class="form-control" style="height:34px;font-size:13px;flex:1" onchange="setCustomerTier('${c.id}', this.value)">
        <option value="">No tier</option>
        ${(DB.pricingTiers||[]).map(t=>`<option value="${t.id}" ${c.tier===t.id?'selected':''}>${t.name}${t.discountPct?` (−${t.discountPct}%)`:''}</option>`).join('')}
      </select>
    </div>
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:16px">
      ${miniKPI('Total Spent',DB.fmt(c.totalSpent),'Lifetime','up','var(--pastel-green)')}
      ${miniKPI('Visits',c.visits,'Store visits','up','var(--pastel-blue)')}
      ${miniKPI('Avg Order',DB.fmt(c.visits?c.totalSpent/c.visits:0),'Per visit','neutral','var(--pastel-purple)')}
    </div>
    ${cTxns.length?`<div style="font-size:14px;font-weight:700;margin-bottom:8px">Recent Transactions</div><div class="txn-list">${cTxns.slice(0,3).map(txnCard).join('')}</div>`:'<p style="color:var(--gray-400);font-size:14px">No transactions yet.</p>'}`,
    `<button class="btn btn-ghost" style="color:var(--danger)" onclick="closeModal();confirmDeleteCustomer('${c.id}')">Delete</button>
     <button class="btn btn-secondary" onclick="closeModal()">Close</button>
     <button class="btn btn-primary" onclick="startSaleForCustomer('${c.id}')">New Sale</button>`);
}

/* ══════════════════════════════════════════════════════════
   REPORTS — 4 tabs
   ══════════════════════════════════════════════════════════ */
function renderReports(el) {
  const now    = new Date();
  const monthNamesFull = ['January','February','March','April','May','June','July','August','September','October','November','December'];

  // ── custom date selection: pick your own year / month / day ──
  const years = Array.from(new Set(DB.transactions.map(t => parseInt(String(t.date).slice(0,4))).filter(Boolean))).sort((a,b)=>b-a);
  if (!years.includes(now.getFullYear())) years.unshift(now.getFullYear());
  if (App.reportYear == null || !years.includes(App.reportYear)) App.reportYear = years[0];
  const selYear  = App.reportYear;
  const selMonth = (App.reportMonth === 'all' || App.reportMonth == null) ? 'all' : parseInt(App.reportMonth);
  const selDay   = (selMonth === 'all' || App.reportDay === 'all' || App.reportDay == null) ? 'all' : parseInt(App.reportDay);

  const inSel = (dateStr) => {
    const p = String(dateStr).split('-').map(Number);   // [year, month(1-12), day]
    if (p[0] !== selYear) return false;
    if (selMonth !== 'all' && (p[1]-1) !== selMonth) return false;
    if (selDay !== 'all' && p[2] !== selDay) return false;
    return true;
  };
  const inPrev = (dateStr) => {
    const p = String(dateStr).split('-').map(Number);
    if (selDay !== 'all') { const d = new Date(selYear, selMonth, selDay-1); return p[0]===d.getFullYear() && (p[1]-1)===d.getMonth() && p[2]===d.getDate(); }
    if (selMonth !== 'all') { const d = new Date(selYear, selMonth-1, 1); return p[0]===d.getFullYear() && (p[1]-1)===d.getMonth(); }
    return p[0] === selYear-1;
  };

  const pmOf   = t => (t.method || t.payment || '').toLowerCase();

  // active (non-refunded) sales drive every figure; refunds tracked separately
  const inPeriod = DB.transactions.filter(t => inSel(t.date));
  const txns     = inPeriod.filter(t => t.status !== 'refunded');
  const refunds  = inPeriod.filter(t => t.status === 'refunded');
  const prevTxns = DB.transactions.filter(t => inPrev(t.date) && t.status !== 'refunded');

  // Accounting model (see DB.saleNet/saleCost): revenue is recognized NET OF TAX.
  // GST is collected for the government — a liability, never income or profit.
  const grossSales = txns.reduce((s,t) => s+DB.saleGross(t), 0);   // pre-discount, ex-tax (net of partial refunds)
  const discounts  = txns.reduce((s,t) => s+(t.discount||0), 0);
  const revenue    = txns.reduce((s,t) => s+DB.saleNet(t), 0);     // net sales (ex-tax) = the P&L revenue
  const collected  = txns.reduce((s,t) => s+DB.saleCollected(t), 0); // money taken incl tax
  const cogs       = txns.reduce((s,t) => s+DB.saleCost(t), 0);
  const expenses   = DB.expenses.filter(e => inSel(e.date)).reduce((s,e) => s+e.amount, 0);
  const tax        = txns.reduce((s,t) => s+DB.saleTax(t), 0);
  const partialRefunds = txns.reduce((s,t) => s+(t.refundedAmount||0), 0);   // refunds on still-active sales
  const grossP     = revenue-cogs;
  const netP       = grossP-expenses;
  const prevRev    = prevTxns.reduce((s,t) => s+DB.saleNet(t), 0);

  const selLabel  = selDay !== 'all' ? `${monthNamesFull[selMonth]} ${selDay}, ${selYear}`
                  : selMonth !== 'all' ? `${monthNamesFull[selMonth]} ${selYear}`
                  : `Year ${selYear}`;
  const prevLabel = selDay !== 'all' ? 'prev day' : selMonth !== 'all' ? 'prev month' : 'prev year';
  function trendOf(cur, prev) {
    if (prev <= 0) return { dir:'up', sub:'' };
    const pct = Math.round((cur-prev)/prev*100);
    return { dir: pct>=0?'up':'down', sub:`${pct>=0?'+':''}${pct}% vs ${prevLabel}` };
  }
  const revTrend = trendOf(revenue, prevRev);

  function emptyState(msg) {
    return `<div class="card report-empty">
      <svg viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" stroke-width="1.5" style="width:40px;height:40px;opacity:.45;margin-bottom:12px"><path d="M3 3v18h18"/><rect x="7" y="11" width="3" height="6"/><rect x="12" y="7" width="3" height="10"/><rect x="17" y="14" width="3" height="3"/></svg>
      <div style="font-size:14px;font-weight:600;color:var(--text-secondary);margin-bottom:4px">No data for ${selLabel}</div>
      <div style="font-size:12.5px">${msg}</div>
    </div>`;
  }

  // SALES BY STAFF — per-cashier performance for the period
  function staffTab() {
    if (!txns.length) return emptyState('No sales recorded for this selection.');
    const byUser = {};
    txns.forEach(t => {
      const u = t.soldBy || 'Unassigned';
      if (!byUser[u]) byUser[u] = { user:u, orders:0, net:0, collected:0, items:0 };
      byUser[u].orders++;
      byUser[u].net       += DB.saleNet(t);
      byUser[u].collected += DB.saleCollected(t);
      byUser[u].items     += (t.items||0);
    });
    const rows = Object.values(byUser).sort((a,b)=>b.net-a.net);
    const top  = rows[0];
    App._reportExport = {
      name: 'Sales by Staff',
      headers: ['Staff','Orders','Items','Net Sales','Collected','Avg Ticket'],
      rows: rows.map(r => [r.user, r.orders, r.items, DB.money(r.net).toFixed(2), DB.money(r.collected).toFixed(2), DB.money(r.orders?r.collected/r.orders:0).toFixed(2)]),
    };
    const maxNet = Math.max(...rows.map(r=>r.net), 1);
    const colors = ['var(--primary)','var(--teal-bright)','#7FD8C8','#B5E8DF','#5B8DEF'];
    return `
      <div class="report-grid">
        ${miniKPI('Staff',      rows.length, 'Active sellers','neutral','var(--pastel-blue)')}
        ${miniKPI('Top Seller', esc(top.user), DB.fmt(top.net)+' net','up','var(--pastel-green)')}
        ${miniKPI('Avg / Staff',DB.fmt(rows.reduce((s,r)=>s+r.net,0)/rows.length), 'Net sales','neutral','var(--pastel-purple)')}
      </div>
      <div class="card" style="margin-bottom:16px">
        <div class="card-header"><span class="card-title">Sales by Staff</span>
          <button class="btn btn-secondary btn-sm" onclick="exportReportCSV()">Download</button>
        </div>
        <div class="card-body" style="display:flex;flex-direction:column;gap:12px">
          ${rows.map((r,i)=>{
            const pct = Math.round(r.net/maxNet*100);
            return `<div>
              <div style="display:flex;justify-content:space-between;font-size:13px;font-weight:600;margin-bottom:6px">
                <span>${esc(r.user)}</span><span>${DB.fmt(r.net)} <span style="color:var(--gray-400)">· ${r.orders} order${r.orders!==1?'s':''}</span></span>
              </div>
              <div class="stock-bar"><div class="stock-fill high" style="width:${pct}%;background:${colors[i%5]};filter:brightness(.9)"></div></div>
            </div>`;
          }).join('')}
        </div>
      </div>
      <div class="card">
        <div class="card-header"><span class="card-title">Staff Detail</span></div>
        <div class="table-wrapper"><table>
          <thead><tr><th>Staff</th><th>Orders</th><th>Items</th><th>Net Sales</th><th>Collected</th><th>Avg</th></tr></thead>
          <tbody>${rows.map(r=>`<tr>
            <td><strong>${esc(r.user)}</strong></td>
            <td>${r.orders}</td>
            <td>${r.items}</td>
            <td>${DB.fmt(r.net)}</td>
            <td>${DB.fmt(r.collected)}</td>
            <td>${DB.fmt(r.orders?r.collected/r.orders:0)}</td>
          </tr>`).join('')}</tbody>
        </table></div>
      </div>`;
  }

  const tabs = { sales: salesTab, items: itemsTab, tax: taxTab, inventory: inventoryReportTab, reorder: reorderTab, dayend: dayEndTab, pl: plTab, staff: staffTab };

  function salesTab() {
    if (!txns.length) return emptyState('No sales were recorded for this selection.');
    const byDay = {};
    txns.forEach(t => { byDay[t.date] = (byDay[t.date]||0)+DB.saleNet(t); });
    const rows = Object.entries(byDay)
      .map(([d,amt]) => ({ date:d, txns: txns.filter(t=>t.date===d).length, revenue:amt }))
      .sort((a,b) => b.date.localeCompare(a.date));
    const cashT = txns.filter(t => pmOf(t)==='cash');
    const cardT = txns.filter(t => pmOf(t)==='card');
    const bankT = txns.filter(t => pmOf(t)==='bank');
    const best  = rows.slice().sort((a,b)=>b.revenue-a.revenue)[0];
    const avg   = rows.length ? revenue/rows.length : 0;
    const top   = rows.slice(0, 5);
    const shortD = d => new Date(d).toLocaleDateString('en-US',{month:'short',day:'numeric'});

    // stash for CSV download
    App._salesRows = rows; App._salesLabel = selLabel;

    return `
      <div class="report-grid">
        ${miniKPI('Net Sales', DB.fmt(revenue), revTrend.sub || (txns.length+' transactions'), revTrend.dir,'var(--pastel-blue)')}
        ${miniKPI('Collected', DB.fmt(collected), 'Incl. '+DB.fmt(tax)+' tax','neutral','var(--pastel-green)')}
        ${miniKPI('Avg Ticket', DB.fmt(txns.length?collected/txns.length:0), 'Per sale','up','var(--pastel-purple)')}
      </div>
      <div class="report-grid" style="margin-bottom:14px">
        ${miniKPI('Cash Collected', DB.fmt(cashT.reduce((s,t)=>s+DB.saleCollected(t),0)), cashT.length+' txns','neutral','var(--pastel-teal)')}
        ${miniKPI('Bank Collected', DB.fmt(bankT.reduce((s,t)=>s+DB.saleCollected(t),0)), bankT.length+' txns','neutral','var(--pastel-yellow)')}
        ${miniKPI('Card Collected', DB.fmt(cardT.reduce((s,t)=>s+DB.saleCollected(t),0)), cardT.length+' txns','neutral','var(--pastel-orange)')}
      </div>
      ${refunds.length ? `<div class="report-note"><strong>${refunds.length}</strong> fully-refunded transaction${refunds.length>1?'s':''} excluded · ${DB.fmt(refunds.reduce((s,t)=>s+t.total,0))}</div>` : ''}
      ${partialRefunds > 0 ? `<div class="report-note"><strong>${DB.fmt(partialRefunds)}</strong> in partial refunds deducted from the figures above</div>` : ''}
      <div class="card">
        <div class="card-header"><span class="card-title">Daily Breakdown</span>
          <div style="display:flex;gap:6px">
            <button class="btn btn-secondary btn-sm" onclick="downloadSalesCSV()">Download</button>
            <button class="btn btn-primary btn-sm" onclick="openViewReportModal('sales')">View</button>
          </div>
        </div>
        <div class="card-body" style="padding-top:14px">
          <div style="display:flex;gap:8px;margin-bottom:14px">
            <div style="flex:1;background:var(--bg);border-radius:12px;padding:10px 8px;text-align:center">
              <div style="font-size:16px;font-weight:800;color:var(--text-primary)">${rows.length}</div>
              <div style="font-size:10px;color:var(--text-muted);font-weight:600">Active days</div>
            </div>
            <div style="flex:1;background:var(--bg);border-radius:12px;padding:10px 8px;text-align:center">
              <div style="font-size:16px;font-weight:800;color:var(--text-primary)">${DB.fmt(avg)}</div>
              <div style="font-size:10px;color:var(--text-muted);font-weight:600">Avg / day</div>
            </div>
            <div style="flex:1;background:var(--bg);border-radius:12px;padding:10px 8px;text-align:center">
              <div style="font-size:16px;font-weight:800;color:var(--text-primary)">${best?shortD(best.date):'—'}</div>
              <div style="font-size:10px;color:var(--text-muted);font-weight:600">Best day</div>
            </div>
          </div>
          ${top.map(r => `<div style="display:flex;align-items:center;justify-content:space-between;padding:9px 0;border-bottom:1px solid var(--border);font-size:13px">
            <span style="font-weight:600;color:var(--text-primary)">${formatDate(r.date)}</span>
            <span style="font-size:11.5px;color:var(--text-muted)">${r.txns} txn${r.txns!==1?'s':''}</span>
            <strong style="min-width:80px;text-align:right">${DB.fmt(r.revenue)}</strong>
          </div>`).join('')}
          ${rows.length > 5 ? `<div style="text-align:center;padding-top:12px;font-size:12px;color:var(--text-muted)">+${rows.length-5} more day${rows.length-5!==1?'s':''} · tap View or Download for the full report</div>` : ''}
        </div>
      </div>`;
  }

  function plTab() {
    if (!txns.length && !expenses) return emptyState('No revenue or expenses in this period.');
    const margin = revenue ? Math.round(grossP/revenue*100) : 0;
    return `
      <div class="report-grid">
        ${miniKPI('Net Sales', DB.fmt(revenue), revTrend.sub || 'Ex-tax revenue', revTrend.dir,'var(--pastel-blue)')}
        ${miniKPI('Gross Profit',  DB.fmt(grossP),  margin+'% margin','up','var(--pastel-green)')}
        ${miniKPI('Net Profit',    DB.fmt(netP),    'After expenses', netP>=0?'up':'down','var(--pastel-teal)')}
      </div>
      <div class="card">
        <div class="card-header"><span class="card-title">Profit & Loss Statement</span>
          <button class="btn btn-primary btn-sm" onclick="openViewReportModal('pl')">View Report</button>
        </div>
        <div class="card-body">
          ${plRow('Gross Sales',            DB.fmt(grossSales),    'var(--text-primary)')}
          ${discounts>0?plRow('Less: Discounts', `(${DB.fmt(discounts)})`, 'var(--danger)'):''}
          ${plRow('Net Sales (ex-tax)',     DB.fmt(revenue),       'var(--success)', true)}
          ${plRow('Cost of Goods Sold',    `(${DB.fmt(cogs)})`,   'var(--danger)')}
          <div style="height:1px;background:var(--border);margin:10px 0"></div>
          ${plRow('Gross Profit',           DB.fmt(grossP),        'var(--success)', true)}
          ${plRow('Operating Expenses',    `(${DB.fmt(expenses)})`, 'var(--danger)')}
          <div style="height:2px;background:var(--gray-300);margin:10px 0"></div>
          ${plRow('Net Profit / Loss',      DB.fmt(netP),          netP>=0?'var(--success)':'var(--danger)', true, true)}
          <div style="margin-top:10px;padding:9px 12px;background:var(--bg);border-radius:8px;font-size:11.5px;color:var(--text-muted);display:flex;justify-content:space-between">
            <span>Memo · ${DB.settings.taxName} collected (liability, not revenue)</span><span style="font-weight:700">${DB.fmt(tax)}</span>
          </div>
        </div>
      </div>`;
  }

  function taxTab() {
    if (!txns.length) return emptyState('No taxable transactions in this period.');
    const byMethod = { cash:0, card:0, split:0 };
    txns.forEach(t => { const m = pmOf(t); byMethod[m] = (byMethod[m]||0)+DB.saleTax(t); });
    App._reportExport = {
      name: 'Tax Report',
      headers: ['Date','Customer','Net Sales','Tax','Method'],
      rows: txns.map(t => [t.date, t.customerName||t.customer||'Walk-in', DB.money(DB.saleNet(t)).toFixed(2), DB.money(DB.saleTax(t)).toFixed(2), pmOf(t)||'—']),
    };
    return `
      <div class="report-grid">
        ${miniKPI('Total Tax',  DB.fmt(tax),              '@'+DB.settings.taxRate+'% rate','neutral','var(--pastel-yellow)')}
        ${miniKPI('Cash Tax',   DB.fmt(byMethod.cash),    'From cash','neutral','var(--pastel-blue)')}
        ${miniKPI('Card Tax',   DB.fmt(byMethod.card),    'From card','neutral','var(--pastel-purple)')}
      </div>
      <div class="card">
        <div class="card-header"><span class="card-title">Tax Detail (${DB.settings.taxRate}%)</span>
          <div style="display:flex;gap:6px">
            <button class="btn btn-secondary btn-sm" onclick="exportReportCSV()">Download</button>
            <button class="btn btn-primary btn-sm" onclick="openViewReportModal('tax')">View</button>
          </div>
        </div>
        <div class="table-wrapper"><table>
          <thead><tr><th>Date</th><th>Customer</th><th>Net Sales</th><th>Tax</th><th>Method</th></tr></thead>
          <tbody>${txns.map(t => { const m = pmOf(t); return `<tr>
            <td>${formatDate(t.date)}</td>
            <td>${esc(t.customerName||t.customer||'Walk-in')}${t.status==='partial-refund'?' <span class="badge-pill badge-warning" style="font-size:9px">part. refund</span>':''}</td>
            <td>${DB.fmt(DB.saleNet(t))}</td>
            <td><strong>${DB.fmt(DB.saleTax(t))}</strong></td>
            <td><span class="badge-pill badge-${m==='cash'?'success':m==='card'?'info':'warning'}">${m||'—'}</span></td>
          </tr>`; }).join('')}</tbody>
        </table></div>
      </div>`;
  }

  function inventoryReportTab() {
    const prods       = DB.products;
    const totalCost   = prods.reduce((s,p) => s+DB.stockValue(p), 0);
    const totalRetail = prods.reduce((s,p) => s+DB.retailValue(p), 0);
    const potential   = totalRetail-totalCost;
    const lowItems    = prods.filter(p => DB.productStock(p)<=p.minStock && DB.productStock(p)>0);
    const outItems    = prods.filter(p => DB.productStock(p)===0);

    const byCat = {};
    prods.forEach(p => {
      if (!byCat[p.category]) byCat[p.category] = { items:0, value:0, stock:0, retail:0 };
      byCat[p.category].items++;
      byCat[p.category].value   += DB.stockValue(p);
      byCat[p.category].retail  += DB.retailValue(p);
      byCat[p.category].stock   += DB.productStock(p);
    });

    // Each variant gets its own export row; simple products export as one row.
    const exportRows = [];
    prods.forEach(p => {
      const st = DB.productStock(p);
      const status = st===0?'Out':st<=p.minStock?'Low':'OK';
      if (DB.hasVariants(p)) {
        p.variants.forEach(v => exportRows.push([`${p.name} — ${v.name}`, v.sku, p.category, v.stock, DB.money(v.cost).toFixed(2), DB.money(v.price).toFixed(2), DB.money(v.cost*v.stock).toFixed(2), v.stock===0?'Out':'']));
      } else {
        exportRows.push([p.name, p.sku, p.category, st, DB.money(p.cost).toFixed(2), DB.money(p.price).toFixed(2), DB.money(DB.stockValue(p)).toFixed(2), status]);
      }
    });
    App._reportExport = {
      name: 'Inventory Report',
      headers: ['Product','SKU','Category','Stock','Cost','Price','Stock Value','Status'],
      rows: exportRows,
    };

    return `
      <div class="report-grid">
        ${miniKPI('Inventory Value',  DB.fmt(totalCost),   prods.length+' products','neutral','var(--pastel-blue)')}
        ${miniKPI('Retail Value',     DB.fmt(totalRetail), 'At selling price',      'up',     'var(--pastel-green)')}
        ${miniKPI('Potential Profit', DB.fmt(potential),   'If all sold',           'up',     'var(--pastel-teal)')}
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:16px">
        ${miniKPI('Low Stock', lowItems.length, 'Need reorder','down','var(--pastel-yellow)')}
        ${miniKPI('Out of Stock', outItems.length, 'Unavailable','down','var(--pastel-pink)')}
      </div>
      <div class="card" style="margin-bottom:16px">
        <div class="card-header"><span class="card-title">Stock by Category</span>
          <button class="btn btn-primary btn-sm" onclick="openViewReportModal('inventory')">View Report</button>
        </div>
        <div class="table-wrapper"><table>
          <thead><tr><th>Category</th><th>Products</th><th>Total Stock</th><th>Cost Value</th><th>Retail Value</th></tr></thead>
          <tbody>${Object.entries(byCat).map(([cat,d]) => `<tr>
            <td><strong>${cat}</strong></td>
            <td>${d.items}</td>
            <td>${d.stock}</td>
            <td>${DB.fmt(d.value)}</td>
            <td>${DB.fmt(d.retail)}</td>
          </tr>`).join('')}</tbody>
        </table></div>
      </div>
      <div class="card">
        <div class="card-header">
          <span class="card-title">Full Inventory Report</span>
          <button class="btn btn-secondary btn-sm" onclick="exportReportCSV()">Download CSV</button>
        </div>
        <div class="table-wrapper"><table>
          <thead><tr><th>Product</th><th>SKU</th><th>Category</th><th>Stock</th><th>Cost</th><th>Price</th><th>Stock Value</th><th>Status</th></tr></thead>
          <tbody>${prods.map(p => {
            const st = DB.productStock(p);
            const status = st===0?'<span class="badge-pill badge-danger">Out</span>':
              st<=p.minStock?'<span class="badge-pill badge-warning">Low</span>':
              '<span class="badge-pill badge-success">OK</span>';
            const priceCell = DB.hasVariants(p) ? `from ${DB.fmt(DB.variantMinPrice(p))}` : DB.fmt(p.price);
            const costCell  = DB.hasVariants(p) ? '—' : DB.fmt(p.cost);
            return `<tr>
              <td><strong>${p.name}</strong>${DB.hasVariants(p)?`<div style="font-size:10.5px;color:var(--text-muted)">${p.variants.length} variants</div>`:''}</td>
              <td style="color:var(--gray-400);font-size:12px">${p.sku}</td>
              <td>${p.category}</td>
              <td><strong style="color:${st===0?'var(--danger)':st<=p.minStock?'var(--warning)':'inherit'}">${st}</strong></td>
              <td>${costCell}</td>
              <td>${priceCell}</td>
              <td>${DB.fmt(DB.stockValue(p))}</td>
              <td>${status}</td>
            </tr>`;
          }).join('')}</tbody>
        </table></div>
      </div>`;
  }

  // REORDER POINT — items at/below their reorder level, with a suggested
  // purchase quantity (reorder-up-to a target) and the estimated cost.
  function reorderTab() {
    // Reorder point = the product's Low-Stock level (minStock). Reorder-up-to
    // target tops the shelf back to ~3x that level (a safety buffer).
    const need = DB.products
      .map(p => {
        const stock  = DB.productStock(p);
        const point  = Math.max(0, p.minStock || 0);
        const target = Math.max(point * 3, point + 1, stock);
        const suggest = Math.max(0, target - stock);
        const avgCost = stock > 0 ? DB.stockValue(p) / stock : (DB.variantMinPrice(p) != null ? p.cost : p.cost) || 0;
        return { p, stock, point, target, suggest, cost: DB.money(suggest * avgCost) };
      })
      .filter(r => r.stock <= r.point && r.suggest > 0)
      .sort((a,b) => (a.stock - a.point) - (b.stock - b.point));   // most-depleted first

    if (!need.length) {
      return `<div class="card report-empty">
        <svg viewBox="0 0 24 24" fill="none" stroke="var(--success)" stroke-width="1.5" style="width:40px;height:40px;opacity:.6;margin-bottom:12px"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
        <div style="font-size:14px;font-weight:600;color:var(--text-secondary);margin-bottom:4px">Everything is well stocked</div>
        <div style="font-size:12.5px">No products are at or below their reorder point.</div>
      </div>`;
    }

    const outCount   = need.filter(r => r.stock === 0).length;
    const totalUnits = need.reduce((s,r) => s + r.suggest, 0);
    const totalCost  = need.reduce((s,r) => s + r.cost, 0);

    App._reportExport = {
      name: 'Reorder Report',
      headers: ['Product','SKU','Category','In Stock','Reorder Point','Suggested Qty','Unit Cost','Est. Cost'],
      rows: need.map(r => [r.p.name, r.p.sku, r.p.category, r.stock, r.point, r.suggest, (r.suggest?DB.money(r.cost/r.suggest):0).toFixed(2), r.cost.toFixed(2)]),
    };

    return `
      <div class="report-grid">
        ${miniKPI('Items to Reorder', need.length, outCount?`${outCount} out of stock`:'At/below point','down','var(--pastel-yellow)')}
        ${miniKPI('Units to Order',   totalUnits, 'Suggested total','neutral','var(--pastel-blue)')}
        ${miniKPI('Est. Cost',        DB.fmt(totalCost), 'At avg cost','neutral','var(--pastel-teal)')}
      </div>
      <div class="card">
        <div class="card-header">
          <span class="card-title">Reorder Suggestions</span>
          <button class="btn btn-secondary btn-sm" onclick="exportReportCSV()">Download CSV</button>
        </div>
        <div class="table-wrapper"><table>
          <thead><tr><th>Product</th><th>In Stock</th><th>Point</th><th>Suggested</th><th>Est. Cost</th></tr></thead>
          <tbody>${need.map(r => {
            const badge = r.stock===0
              ? '<span class="badge-pill badge-danger">Out</span>'
              : '<span class="badge-pill badge-warning">Low</span>';
            return `<tr>
              <td><strong>${r.p.name}</strong><div style="color:var(--text-muted);font-size:11px">${r.p.sku} · ${r.p.category}</div></td>
              <td><strong style="color:${r.stock===0?'var(--danger)':'var(--warning)'}">${r.stock}</strong> ${badge}</td>
              <td>${r.point}</td>
              <td><strong style="color:var(--primary)">+${r.suggest}</strong></td>
              <td>${DB.fmt(r.cost)}</td>
            </tr>`;
          }).join('')}</tbody>
        </table></div>
        <div style="padding:12px 16px;font-size:11.5px;color:var(--text-muted);border-top:1px solid var(--border)">
          Reorder point = the product's low-stock level. Suggested quantity tops stock back up to ~3× that level.
        </div>
      </div>`;
  }

  // PRODUCT / ITEM SALES — best sellers, profit per item, sales by category
  function itemsTab() {
    const itemMap = {};
    let noDetail = 0;
    txns.forEach(t => {
      if (Array.isArray(t.cartItems) && t.cartItems.length) {
        t.cartItems.forEach(i => {
          const key = i.id || i.name;
          if (!itemMap[key]) itemMap[key] = { name:i.name, emoji:i.emoji||'', qty:0, revenue:0, cost:0, cat:(DB.getProduct(i.id)?.category||'Other') };
          itemMap[key].qty     += i.qty;
          itemMap[key].revenue += i.price*i.qty;
          itemMap[key].cost    += (i.cost||0)*i.qty;
        });
      } else { noDetail++; }
    });
    const rows = Object.values(itemMap).map(r => ({ ...r, profit: r.revenue-r.cost })).sort((a,b) => b.revenue-a.revenue);
    if (!rows.length) return emptyState('No itemized sales in this period yet.');
    const units   = rows.reduce((s,r)=>s+r.qty,0);
    const itemRev = rows.reduce((s,r)=>s+r.revenue,0);
    const catMap = {};
    rows.forEach(r => { if (!catMap[r.cat]) catMap[r.cat]={revenue:0,qty:0}; catMap[r.cat].revenue+=r.revenue; catMap[r.cat].qty+=r.qty; });
    const cats = Object.entries(catMap).sort((a,b)=>b[1].revenue-a[1].revenue);
    const catMax = Math.max(...cats.map(([,d])=>d.revenue),1);
    const colors = ['var(--pastel-blue)','var(--pastel-purple)','var(--pastel-pink)','var(--pastel-green)','var(--pastel-yellow)','var(--pastel-orange)','var(--pastel-teal)'];
    App._reportExport = {
      name: 'Item Sales',
      headers: ['Product','Qty Sold','Revenue','Cost','Profit','Margin %'],
      rows: rows.map(r => [r.name, r.qty, DB.money(r.revenue).toFixed(2), DB.money(r.cost).toFixed(2), DB.money(r.profit).toFixed(2), r.revenue?Math.round(r.profit/r.revenue*100):0]),
    };
    return `
      <div class="report-grid">
        ${miniKPI('Units Sold',   units,           rows.length+' products','up','var(--pastel-blue)')}
        ${miniKPI('Top Seller',   rows[0].name,    rows[0].qty+' sold','up','var(--pastel-green)')}
        ${miniKPI('Item Revenue', DB.fmt(itemRev), 'From line items','up','var(--pastel-purple)')}
      </div>
      ${noDetail ? `<div class="report-note">${noDetail} older sale${noDetail>1?'s':''} without line-item detail aren't itemized here.</div>` : ''}
      <div class="card" style="margin-bottom:16px">
        <div class="card-header"><span class="card-title">Sales by Category</span></div>
        <div class="card-body" style="display:flex;flex-direction:column;gap:12px">
          ${cats.map(([cat,d],i)=>{
            const pct = Math.round(d.revenue/catMax*100);
            return `<div>
              <div style="display:flex;justify-content:space-between;font-size:13px;font-weight:600;margin-bottom:6px">
                <span>${cat}</span><span>${DB.fmt(d.revenue)} <span style="color:var(--gray-400)">· ${d.qty} units</span></span>
              </div>
              <div class="stock-bar"><div class="stock-fill high" style="width:${pct}%;background:${colors[i%7]};filter:brightness(.85)"></div></div>
            </div>`;
          }).join('')}
        </div>
      </div>
      <div class="card">
        <div class="card-header"><span class="card-title">Product Performance</span>
          <div style="display:flex;gap:6px">
            <button class="btn btn-secondary btn-sm" onclick="exportReportCSV()">Download</button>
            <button class="btn btn-primary btn-sm" onclick="openShopsReportModal('item-sales')">View</button>
          </div>
        </div>
        <div class="table-wrapper"><table>
          <thead><tr><th>Product</th><th>Qty</th><th>Revenue</th><th>Profit</th><th>Margin</th></tr></thead>
          <tbody>${rows.map(r=>{
            const margin = r.revenue ? Math.round(r.profit/r.revenue*100) : 0;
            return `<tr>
              <td><strong>${r.name}</strong></td>
              <td>${r.qty}</td>
              <td>${DB.fmt(r.revenue)}</td>
              <td style="color:${r.profit>=0?'var(--success)':'var(--danger)'}">${DB.fmt(r.profit)}</td>
              <td>${margin}%</td>
            </tr>`;
          }).join('')}</tbody>
        </table></div>
      </div>`;
  }

  // DAY-END / Z-REPORT — cash-up reconciliation for the period
  function dayEndTab() {
    if (!txns.length && !refunds.length) return emptyState('No transactions to reconcile in this period.');
    const refTot = refunds.reduce((s,t)=>s+t.total,0) + partialRefunds;   // full + partial refunds
    const byPay  = { cash:0, card:0, bank:0, split:0 };
    txns.forEach(t=>{ const m=pmOf(t); byPay[m] = (byPay[m]||0)+DB.saleCollected(t); });   // net of partial refunds
    const cashRefunds = refunds.filter(t=>pmOf(t)==='cash').reduce((s,t)=>s+t.total,0);
    const expectedCash = DB.money(byPay.cash - cashRefunds);   // cash that should be in the drawer (before float)
    const avg   = txns.length ? collected/txns.length : 0;
    const row = (label,val,opts='') => `<div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border);font-size:13px;${opts}"><span>${label}</span><span style="font-weight:700">${val}</span></div>`;
    return `
      <div class="report-grid">
        ${miniKPI('Total Collected', DB.fmt(collected), txns.length+' transactions','up','var(--pastel-green)')}
        ${miniKPI('Tax Collected',   DB.fmt(tax), '@'+DB.settings.taxRate+'%','neutral','var(--pastel-yellow)')}
        ${miniKPI('Avg Ticket',      DB.fmt(avg),    'Per sale','neutral','var(--pastel-blue)')}
      </div>
      <div class="card" style="margin-bottom:16px">
        <div class="card-header"><span class="card-title">Collection Summary</span></div>
        <div class="card-body">
          ${row('Cash',           DB.fmt(byPay.cash))}
          ${row('Card',           DB.fmt(byPay.card))}
          ${row('Bank Transfer',  DB.fmt(byPay.bank))}
          ${byPay.split?row('Split', DB.fmt(byPay.split)):''}
          ${row('Net Collected', DB.fmt(collected), 'border-bottom:none;font-weight:800')}
          ${refTot?`<div style="font-size:11px;color:var(--text-muted);padding-top:6px">Refunds this period (already deducted above): ${DB.fmt(refTot)}</div>`:''}
        </div>
      </div>
      <div class="card" style="margin-bottom:16px">
        <div class="card-header"><span class="card-title">Cash Reconciliation</span></div>
        <div class="card-body">
          <div style="display:flex;gap:10px;margin-bottom:12px">
            <div style="flex:1">
              <label class="form-label">Opening Float</label>
              <input type="number" min="0" step="0.01" class="form-control" id="zOpenFloat" placeholder="0.00" oninput="updateCashRecon(${expectedCash})" />
            </div>
            <div style="flex:1">
              <label class="form-label">Counted Cash</label>
              <input type="number" min="0" step="0.01" class="form-control" id="zCounted" placeholder="0.00" oninput="updateCashRecon(${expectedCash})" />
            </div>
          </div>
          ${row('Expected cash sales', DB.fmt(byPay.cash))}
          ${cashRefunds?row('Less: Cash refunds', '−'+DB.fmt(cashRefunds)):''}
          <div id="zReconResult" style="margin-top:10px;padding:11px 13px;background:var(--bg);border-radius:var(--r);font-size:12.5px;color:var(--text-secondary)">Expected in drawer (excl. float): <strong>${DB.fmt(expectedCash)}</strong> · enter counted cash to see variance</div>
        </div>
      </div>
      <div class="card">
        <div class="card-header"><span class="card-title">Sales Summary (Z-Report)</span>
          <button class="btn btn-primary btn-sm" onclick="openShopsReportModal('day-end')">View / Print</button>
        </div>
        <div class="card-body">
          ${row('Gross Sales (ex-tax)', DB.fmt(grossSales))}
          ${discounts?row('Less: Discounts', '−'+DB.fmt(discounts)):''}
          ${row('Net Sales (ex-tax)', DB.fmt(revenue), 'font-weight:700')}
          ${row('Tax Collected', DB.fmt(tax))}
          ${row('Total Collected', DB.fmt(collected))}
          ${row('Refunds — incl. above (' + (refunds.length+(partialRefunds>0?'+partial':'')) + ')', refTot?'−'+DB.fmt(refTot):DB.fmt(0))}
          ${row('Cost of Goods', '−'+DB.fmt(cogs))}
          ${row('Gross Profit', DB.fmt(revenue-cogs), 'border-bottom:none;font-weight:800;color:var(--success)')}
        </div>
      </div>`;
  }

  const timeBased = ['sales','items','tax','dayend','pl','staff'].includes(App.reportTab);
  const daysInSel = selMonth !== 'all' ? new Date(selYear, selMonth+1, 0).getDate() : 0;

  el.innerHTML = `
    <div class="report-tabs">
      ${[['sales','Sales'],['items','Items'],['tax','Tax'],['inventory','Inventory'],['reorder','Reorder'],['dayend','Day-End'],['pl','P&L'],['staff','Staff']].map(([t,l]) =>
        `<div class="report-tab${App.reportTab===t?' active':''}" onclick="App.reportTab='${t}';navigate('reports')">${l}</div>`
      ).join('')}
    </div>
    ${timeBased ? `
      <div class="period-bar">
        <select class="filter-select" style="flex:1" onchange="App.reportYear=parseInt(this.value);navigate('reports')" aria-label="Year">
          ${years.map(y=>`<option value="${y}" ${y===selYear?'selected':''}>${y}</option>`).join('')}
        </select>
        <select class="filter-select" style="flex:1" onchange="App.reportMonth=this.value;App.reportDay='all';navigate('reports')" aria-label="Month">
          <option value="all" ${selMonth==='all'?'selected':''}>All Months</option>
          ${monthNamesFull.map((mn,i)=>`<option value="${i}" ${selMonth===i?'selected':''}>${mn}</option>`).join('')}
        </select>
        <select class="filter-select" style="flex:1" onchange="App.reportDay=this.value;navigate('reports')" aria-label="Day" ${selMonth==='all'?'disabled':''}>
          <option value="all" ${selDay==='all'?'selected':''}>All Days</option>
          ${Array.from({length:daysInSel},(_,i)=>i+1).map(dd=>`<option value="${dd}" ${selDay===dd?'selected':''}>${dd}</option>`).join('')}
        </select>
      </div>
      <div class="report-context"><span class="dot"></span>Showing: ${selLabel}</div>
    ` : ''}
    <div>${(tabs[App.reportTab]||salesTab)()}</div>`;
}

// Live cash-up: compare counted drawer cash against expected (cash sales − cash
// refunds + opening float) and show the over/short variance.
function updateCashRecon(expectedCash) {
  const box = document.getElementById('zReconResult');
  if (!box) return;
  const open    = parseFloat(document.getElementById('zOpenFloat')?.value) || 0;
  const counted = parseFloat(document.getElementById('zCounted')?.value);
  const expected = DB.money(expectedCash + open);
  if (isNaN(counted)) {
    box.innerHTML = `Expected in drawer: <strong>${DB.fmt(expected)}</strong> <span style="color:var(--text-muted)">(incl. ${DB.fmt(open)} float)</span> · enter counted cash to see variance`;
    return;
  }
  const variance = DB.money(counted - expected);
  const label = variance === 0 ? 'Balanced ✓' : variance > 0 ? 'Over' : 'Short';
  const color = variance === 0 ? 'var(--success)' : variance > 0 ? 'var(--warning)' : 'var(--danger)';
  box.innerHTML = `Expected <strong>${DB.fmt(expected)}</strong> · Counted <strong>${DB.fmt(counted)}</strong> · <span style="color:${color};font-weight:800">${label}${variance!==0?' '+DB.fmt(Math.abs(variance)):''}</span>`;
}

function viewSalesReport() {
  const txns = DB.transactions.filter(t => t.status !== 'refunded');
  const collected = txns.reduce((s,t)=>s+DB.saleCollected(t),0);
  const netSales  = txns.reduce((s,t)=>s+DB.saleNet(t),0);
  const tax     = txns.reduce((s,t)=>s+DB.saleTax(t),0);
  const biz = DB.settings;
  const byDay = {};
  txns.forEach(t=>{byDay[t.date]=(byDay[t.date]||0)+DB.saleNet(t);});
  const days = Object.entries(byDay).sort((a,b)=>b[0].localeCompare(a[0]));
  const cashTotal = txns.filter(t=>(t.method||t.payment||'').toLowerCase()==='cash').reduce((s,t)=>s+DB.saleCollected(t),0);
  const cardTotal = txns.filter(t=>(t.method||t.payment||'').toLowerCase()==='card').reduce((s,t)=>s+DB.saleCollected(t),0);

  openModal('Sales Report', `
    <div style="background:#fff;border-radius:12px;overflow:hidden;border:1px solid #eee">
      <div style="background:linear-gradient(135deg,#0D2E2C 0%,#1A5C56 50%,#4ECDC4 100%);padding:20px 24px;display:flex;justify-content:space-between;align-items:center">
        <div>
          <div style="font-size:18px;font-weight:900;color:#fff">${esc(biz.businessName)}</div>
          <div style="font-size:12px;color:rgba(255,255,255,0.65);margin-top:2px">Sales Report</div>
        </div>
        <div style="text-align:right">
          <div style="font-size:11px;color:rgba(255,255,255,0.5);margin-bottom:2px">Generated</div>
          <div style="font-size:13px;font-weight:700;color:#fff">${new Date().toLocaleDateString()}</div>
        </div>
      </div>
      <div style="padding:16px 18px;border-bottom:1px solid #f0f0f0">
        <div style="font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:0.8px;color:#14877A;margin-bottom:10px">Summary</div>
        <div style="display:flex;justify-content:space-between;font-size:13px;padding:7px 0;border-bottom:1px solid #f5f5f5"><span style="color:#555">Net Sales (ex-tax)</span><span style="font-weight:700;color:#059669">${DB.fmt(netSales)}</span></div>
        <div style="display:flex;justify-content:space-between;font-size:13px;padding:7px 0;border-bottom:1px solid #f5f5f5"><span style="color:#555">Cash Collected</span><span style="font-weight:700">${DB.fmt(cashTotal)}</span></div>
        <div style="display:flex;justify-content:space-between;font-size:13px;padding:7px 0;border-bottom:1px solid #f5f5f5"><span style="color:#555">Card Collected</span><span style="font-weight:700">${DB.fmt(cardTotal)}</span></div>
        <div style="display:flex;justify-content:space-between;font-size:13px;padding:7px 0;border-bottom:1px solid #f5f5f5"><span style="color:#555">${biz.taxName||'GST'} Collected</span><span style="font-weight:700">${DB.fmt(tax)}</span></div>
        <div style="display:flex;justify-content:space-between;font-size:13px;padding:7px 0;border-bottom:1px solid #f5f5f5"><span style="color:#555">Total Collected</span><span style="font-weight:700">${DB.fmt(collected)}</span></div>
        <div style="display:flex;justify-content:space-between;font-size:13px;padding:7px 0"><span style="color:#555">Transactions</span><span style="font-weight:700">${txns.length}</span></div>
      </div>
      <div style="padding:16px 18px;border-bottom:1px solid #f0f0f0">
        <div style="font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:0.8px;color:#14877A;margin-bottom:10px">Daily Breakdown</div>
        ${days.map(([d,amt])=>`
          <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid #f5f5f5">
            <div>
              <div style="font-size:13px;font-weight:600;color:#1a1a1a">${d}</div>
              <div style="font-size:11px;color:#aaa">${txns.filter(t=>t.date===d).length} transactions</div>
            </div>
            <span style="font-size:14px;font-weight:800;color:#14877A">${DB.fmt(amt)}</span>
          </div>`).join('')}
      </div>
      <div style="background:#f8fffe;padding:14px 18px;display:flex;justify-content:space-between;align-items:center">
        <span style="font-size:15px;font-weight:800;color:#1a1a1a">Total Collected</span>
        <span style="font-size:26px;font-weight:900;color:#14877A">${DB.fmt(collected)}</span>
      </div>
      <div style="background:linear-gradient(135deg,#0D2E2C 0%,#1A5C56 50%,#4ECDC4 100%);padding:10px 18px;text-align:center">
        <div style="font-size:11px;color:rgba(255,255,255,0.65)">${biz.receiptFooter || 'Thank you for your business!'}</div>
      </div>
    </div>`,
    `<button class="btn btn-secondary" onclick="closeModal()">Close</button>
     <button class="btn btn-ghost" onclick="window.print()">
       <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:14px;height:14px"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
       Print
     </button>
     <button class="btn btn-primary" onclick="
       const t='Sales Report\n${biz.businessName}\nNet Sales (ex-tax): ${DB.fmt(netSales)}\nTotal Collected: ${DB.fmt(collected)}\nTransactions: ${txns.length}';
       if(navigator.share){navigator.share({title:'Sales Report',text:t}).catch(()=>{})}else{navigator.clipboard.writeText(t).then(()=>showToast('Copied','success'))}
     ">Share</button>`, 'modal-lg');
}

function openViewReportModal(type) {
  const now = new Date();
  const years  = [...new Set(DB.transactions.map(t => t.date.slice(0,4)))].sort((a,b)=>b-a);
  if (!years.includes(String(now.getFullYear()))) years.unshift(String(now.getFullYear()));
  const months = ['All','Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const days   = ['All',...Array.from({length:31},(_,i)=>String(i+1).padStart(2,'0'))];

  const typeLabel = {sales:'Sales Report',pl:'Profit & Loss',tax:'Tax Summary',inventory:'Inventory Report'}[type];

  function dateFilters(selYear, selMonth, selDay) {
    return `
      <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:14px">
        <span style="font-size:12px;font-weight:600;color:var(--text-muted)">Filter:</span>
        <select id="rYear" class="filter-select" onchange="window._refreshReport('${type}')">
          ${years.map(y=>`<option value="${y}"${y===selYear?'selected':''}>${y}</option>`).join('')}
        </select>
        <select id="rMonth" class="filter-select" onchange="window._refreshReport('${type}')">
          ${months.map((m,i)=>`<option value="${i===0?'all':String(i).padStart(2,'0')}"${(i===0?'all':String(i).padStart(2,'0'))===selMonth?'selected':''}>${m}</option>`).join('')}
        </select>
        <select id="rDay" class="filter-select" onchange="window._refreshReport('${type}')">
          ${days.map(d=>`<option value="${d==='All'?'all':d}"${(d==='All'?'all':d)===selDay?'selected':''}>${d}</option>`).join('')}
        </select>
      </div>
      <div id="reportContent">${generateReportHTML(type, selYear, selMonth, selDay)}</div>`;
  }

  window._refreshReport = (t) => {
    const y = document.getElementById('rYear')?.value || String(now.getFullYear());
    const m = document.getElementById('rMonth')?.value || 'all';
    const d = document.getElementById('rDay')?.value || 'all';
    const el = document.getElementById('reportContent');
    if (el) el.innerHTML = generateReportHTML(t, y, m, d);
  };

  openModal(typeLabel, dateFilters(String(now.getFullYear()), 'all', 'all'),
    `<button class="btn btn-secondary" onclick="closeModal()">Close</button>
     <button class="btn btn-ghost" onclick="window.print()">
       <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:14px;height:14px"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
       Print
     </button>`, 'modal-lg');
}

function openShopsReportModal(subtype) {
  const now = new Date();
  const years = [...new Set(DB.transactions.map(t => t.date.slice(0,4)))].sort((a,b)=>b-a);
  if (!years.includes(String(now.getFullYear()))) years.unshift(String(now.getFullYear()));
  const months = ['All','Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const days = ['All',...Array.from({length:31},(_,i)=>String(i+1).padStart(2,'0'))];
  const labels = {'item-sales':'Daily Item Sales','daily-detail':'Daily Sales Detail Report','day-end':'Day End Report'};

  function shopReportContent(sub, y, m, d) {
    const biz = DB.settings;
    let txns = DB.transactions.filter(t => {
      const dt = t.date||'';
      if (dt.slice(0,4) !== y) return false;
      if (m !== 'all' && dt.slice(5,7) !== m) return false;
      if (d !== 'all' && dt.slice(8,10) !== d) return false;
      return true;
    });
    const mNames = ['','Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const periodLabel = `${y}${m!=='all'?' / '+mNames[parseInt(m)]:''}${d!=='all'?' / Day '+parseInt(d):''}`;

    const sth = 'padding:6px 10px;border:1px solid #aaa;background:#d0d0d0;font-weight:700;font-size:12px;text-align:left';
    const std = 'padding:5px 10px;border:1px solid #ccc;font-size:12px';
    const stdr = 'padding:5px 10px;border:1px solid #ccc;font-size:12px;text-align:right';

    function rDoc(reportTitle, body) {
      const logo = biz.logoUrl ? `<img src="${biz.logoUrl}" style="width:60px;height:60px;object-fit:contain;border:1px solid #ddd;border-radius:4px" />` : '';
      return `<div style="font-family:Arial,sans-serif;background:#fff;color:#000;padding:20px;border:1px solid #ccc;border-radius:6px;font-size:13px">
        <div style="display:flex;align-items:flex-start;gap:14px;padding-bottom:12px;border-bottom:2px solid #000;margin-bottom:12px">
          ${logo}
          <div style="flex:1">
            <div style="font-size:20px;font-weight:900;letter-spacing:-0.3px">${esc(biz.businessName)}</div>
            ${biz.address?`<div style="font-size:11px;color:#444;margin-top:2px">${esc(biz.address)}</div>`:''}
            ${biz.phone?`<div style="font-size:11px;color:#444">Phone: ${esc(biz.phone)}</div>`:''}
          </div>
        </div>
        <div style="text-align:center;margin-bottom:16px">
          <div style="font-size:15px;font-weight:700">${periodLabel} ${reportTitle}</div>
          <div style="font-size:12px;color:#555">${periodLabel}</div>
        </div>
        ${body}
        <div style="margin-top:28px;display:flex;justify-content:flex-end;padding-top:16px;border-top:1px solid #ccc">
          <div style="text-align:center;min-width:180px">
            <div style="border-top:1px solid #000;padding-top:4px;font-size:12px">Verified By</div>
          </div>
        </div>
      </div>`;
    }

    if (sub === 'item-sales') {
      const itemMap = {};
      txns.forEach(t => (t.cartItems||[]).forEach(ci => {
        if (!itemMap[ci.name]) itemMap[ci.name] = { name:ci.name, emoji:ci.emoji||'', qty:0, revenue:0 };
        itemMap[ci.name].qty += ci.qty;
        itemMap[ci.name].revenue += ci.price * ci.qty;
      }));
      const items = Object.values(itemMap).sort((a,b)=>b.qty-a.qty);
      const totalQty = items.reduce((s,i)=>s+i.qty,0);
      const totalRev = items.reduce((s,i)=>s+i.revenue,0);
      return rDoc('Daily Item Sales', `
        <div style="font-weight:700;font-size:14px;margin-bottom:6px">Item Sales Report</div>
        <table style="width:100%;border-collapse:collapse">
          <thead><tr>
            <th style="${sth}">Item</th>
            <th style="${sth};text-align:center">Qty Sold</th>
            <th style="${sth};text-align:right">Revenue (${biz.currency})</th>
          </tr></thead>
          <tbody>
            ${!items.length ? `<tr><td colspan="3" style="${std};text-align:center;color:#888">No sales for this period</td></tr>` :
            items.map(i=>`<tr>
              <td style="${std};font-weight:600">${i.name}</td>
              <td style="${std};text-align:center;font-weight:700">${i.qty}</td>
              <td style="${stdr};font-weight:700">${DB.fmt(i.revenue)}</td>
            </tr>`).join('')}
            ${items.length ? `<tr style="background:#d0d0d0">
              <td style="${std};font-weight:700">Total</td>
              <td style="${std};text-align:center;font-weight:700">${totalQty}</td>
              <td style="${stdr};font-weight:700">${DB.fmt(totalRev)}</td>
            </tr>` : ''}
          </tbody>
        </table>`);
    }

    if (sub === 'daily-detail') {
      const sorted = txns.slice().sort((a,b)=>b.date.localeCompare(a.date));
      return rDoc('Daily Sales Detail Report', `
        <div style="font-weight:700;font-size:14px;margin-bottom:10px">Transaction Details</div>
        ${!sorted.length ? `<p style="text-align:center;color:#888;padding:20px 0">No transactions for this period</p>` :
        sorted.map(t=>`
          <table style="width:100%;border-collapse:collapse;margin-bottom:14px">
            <thead>
              <tr style="background:#d0d0d0">
                <th style="${sth}" colspan="2">ID: ${t.id} &nbsp;|&nbsp; ${t.date} ${t.time||''}</th>
                <th style="${sth}">${t.customerName||t.customer||'Walk-in'}</th>
                <th style="${sth};text-align:right">${t.method==='cash'?'Cash':'Bank Transfer'}</th>
              </tr>
            </thead>
            <tbody>
              ${(t.cartItems||[]).map(ci=>`<tr>
                <td colspan="2" style="${std}">${ci.name}</td>
                <td style="${std};text-align:center">×${ci.qty}</td>
                <td style="${stdr}">${DB.fmt(ci.price*ci.qty)}</td>
              </tr>`).join('')}
              <tr style="background:#f0f0f0">
                <td colspan="3" style="${std};font-size:11px;color:#555">Tax (${biz.taxRate}%)</td>
                <td style="${stdr};font-size:11px;color:#555">${DB.fmt(t.tax)}</td>
              </tr>
              <tr style="background:#d0d0d0">
                <td colspan="3" style="${std};font-weight:700">Total</td>
                <td style="${stdr};font-weight:700;font-size:14px">${DB.fmt(t.total)}</td>
              </tr>
            </tbody>
          </table>`).join('')}
        <table style="width:100%;border-collapse:collapse;margin-top:4px">
          <tbody>
            <tr style="background:#333">
              <td style="${std};font-weight:700;color:#fff">Grand Total &nbsp;(${sorted.length} transactions)</td>
              <td style="${stdr};font-weight:700;font-size:14px;color:#fff">${DB.fmt(sorted.reduce((s,t)=>s+t.total,0))}</td>
            </tr>
          </tbody>
        </table>`);
    }

    if (sub === 'day-end') {
      const active = txns.filter(t=>t.status!=='refunded');
      const total = active.reduce((s,t)=>s+DB.saleCollected(t),0);
      const cash = active.filter(t=>t.method==='cash').reduce((s,t)=>s+DB.saleCollected(t),0);
      const bank = active.filter(t=>t.method==='bank').reduce((s,t)=>s+DB.saleCollected(t),0);
      const taxAmt = active.reduce((s,t)=>s+DB.saleTax(t),0);
      const avg = active.length ? total/active.length : 0;
      const refundAmt = txns.filter(t=>t.status==='refunded').reduce((s,t)=>s+t.total,0)
        + active.reduce((s,t)=>s+(t.refundedAmount||0),0);
      const itemMap = {};
      txns.forEach(t => (t.cartItems||[]).forEach(ci => {
        itemMap[ci.name] = (itemMap[ci.name]||0)+ci.qty;
      }));
      const topItems = Object.entries(itemMap).sort((a,b)=>b[1]-a[1]).slice(0,5);

      return rDoc('Day End Report', `
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px">
          <div>
            <div style="font-weight:700;font-size:14px;margin-bottom:6px">Sales Summary</div>
            <table style="width:100%;border-collapse:collapse">
              <thead><tr><th style="${sth}">Type</th><th style="${sth};text-align:right">Amount</th></tr></thead>
              <tbody>
                ${refundAmt>0?`<tr><td style="${std}">Cash Exchange</td><td style="${stdr};color:#CC0000">(${DB.fmt(refundAmt)})</td></tr>`:''}
                <tr><td style="${std}">Cash</td><td style="${stdr}">${DB.fmt(cash)}</td></tr>
                <tr><td style="${std}">Card / Bank Transfer</td><td style="${stdr}">${DB.fmt(bank)}</td></tr>
                <tr style="background:#e8e8e8"><td style="${std};font-weight:700">Total Sales Inc GST</td><td style="${stdr};font-weight:700">${DB.fmt(total)}</td></tr>
                <tr style="background:#e8e8e8"><td style="${std};font-weight:700">Total's Sales GST Output</td><td style="${stdr};font-weight:700">${DB.fmt(taxAmt)}</td></tr>
              </tbody>
            </table>
          </div>
          <div>
            <div style="font-weight:700;font-size:14px;margin-bottom:6px">Collection Summary</div>
            <table style="width:100%;border-collapse:collapse">
              <thead><tr><th style="${sth}">Type</th><th style="${sth};text-align:right">Amount</th></tr></thead>
              <tbody>
                ${bank>0?`<tr><td style="${std}">Card Sales<br><span style="font-size:10px;color:#555">${biz.accountName||'Bank Transfer'} ${biz.accountNumber||''}</span></td><td style="${stdr}">${DB.fmt(bank)}</td></tr>`:''}
                <tr><td style="${std}">Cash Sales<br><span style="font-size:10px;color:#555">CASH SALES INCOME</span></td><td style="${stdr}">${DB.fmt(cash)}</td></tr>
                ${refundAmt>0?`<tr><td style="${std}">Exchange Sale<br><span style="font-size:10px;color:#555">CASH EXCHANGE</span></td><td style="${stdr};color:#CC0000">(${DB.fmt(refundAmt)})</td></tr>`:''}
                <tr style="background:#e8e8e8"><td style="${std};font-weight:700">Total Collection</td><td style="${stdr};font-weight:700">${DB.fmt(total-refundAmt)}</td></tr>
              </tbody>
            </table>
          </div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
          <div>
            <div style="font-weight:700;font-size:14px;margin-bottom:6px">Purchase Summary</div>
            <table style="width:100%;border-collapse:collapse">
              <thead><tr><th style="${sth}">Type</th><th style="${sth};text-align:right">Amount</th></tr></thead>
              <tbody><tr><td style="${std};color:#888" colspan="2">—</td></tr>
              <tr style="background:#e8e8e8"><td style="${std};font-weight:700">Total Purchases</td><td style="${stdr};font-weight:700">0.00</td></tr></tbody>
            </table>
            ${topItems.length ? `<div style="margin-top:12px">
              <div style="font-weight:700;font-size:14px;margin-bottom:6px">Top Items Sold</div>
              <table style="width:100%;border-collapse:collapse">
                <thead><tr><th style="${sth}">Item</th><th style="${sth};text-align:right">Qty</th></tr></thead>
                <tbody>${topItems.map(([n,q])=>`<tr><td style="${std}">${n}</td><td style="${stdr};font-weight:700">${q}</td></tr>`).join('')}</tbody>
              </table>
            </div>` : ''}
          </div>
          <div>
            <div style="font-weight:700;font-size:14px;margin-bottom:6px">Payment Summary</div>
            <table style="width:100%;border-collapse:collapse">
              <thead><tr><th style="${sth}">Type</th><th style="${sth};text-align:right">Amount</th></tr></thead>
              <tbody><tr><td style="${std};color:#888" colspan="2">—</td></tr>
              <tr style="background:#e8e8e8"><td style="${std};font-weight:700">Total Payment</td><td style="${stdr};font-weight:700">0.00</td></tr></tbody>
            </table>
            <div style="margin-top:12px;border:1px solid #ccc;border-radius:4px;overflow:hidden">
              <table style="width:100%;border-collapse:collapse">
                <tbody>
                  <tr><td style="${std}">Opening Balance</td><td style="${stdr}">0.00</td></tr>
                  <tr><td style="${std}">Cash Collection (Cash Sale Income)</td><td style="${stdr}">${DB.fmt(cash)}</td></tr>
                  <tr><td style="${std}">Total Payment (Cash Sale Income)</td><td style="${stdr}">0.00</td></tr>
                  <tr style="background:#e8e8e8"><td style="${std};font-weight:700">Net Collection</td><td style="${stdr};font-weight:700">${DB.fmt(cash)}</td></tr>
                </tbody>
              </table>
            </div>
            <div style="margin-top:8px;font-size:11px;color:#555;display:flex;gap:16px">
              <span>Transactions: <strong>${txns.length}</strong></span>
              <span>Avg Ticket: <strong>${DB.fmt(avg)}</strong></span>
            </div>
          </div>
        </div>`);
    }
    return '';
  }

  function dateFilters(selYear, selMonth, selDay) {
    return `
      <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:14px">
        <span style="font-size:12px;font-weight:600;color:var(--text-muted)">Filter:</span>
        <select id="srYear" class="filter-select" onchange="window._refreshShopReport()">
          ${years.map(y=>`<option value="${y}"${y===selYear?'selected':''}>${y}</option>`).join('')}
        </select>
        <select id="srMonth" class="filter-select" onchange="window._refreshShopReport()">
          ${months.map((m,i)=>`<option value="${i===0?'all':String(i).padStart(2,'0')}"${(i===0?'all':String(i).padStart(2,'0'))===selMonth?'selected':''}>${m}</option>`).join('')}
        </select>
        <select id="srDay" class="filter-select" onchange="window._refreshShopReport()">
          ${days.map(d=>`<option value="${d==='All'?'all':d}"${(d==='All'?'all':d)===selDay?'selected':''}>${d}</option>`).join('')}
        </select>
      </div>
      <div id="shopReportContent">${shopReportContent(subtype, selYear, selMonth, selDay)}</div>`;
  }

  window._refreshShopReport = () => {
    const y = document.getElementById('srYear')?.value || String(now.getFullYear());
    const m = document.getElementById('srMonth')?.value || 'all';
    const d = document.getElementById('srDay')?.value || 'all';
    const el = document.getElementById('shopReportContent');
    if (el) el.innerHTML = shopReportContent(subtype, y, m, d);
  };

  openModal(labels[subtype], dateFilters(String(now.getFullYear()), 'all', 'all'),
    `<button class="btn btn-secondary" onclick="closeModal()">Close</button>
     <button class="btn btn-ghost" onclick="window.print()">
       <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:14px;height:14px"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
       Print
     </button>`, 'modal-lg');
}

function generateReportHTML(type, year, month, day) {
  const biz = DB.settings;
  let txns = DB.transactions.filter(t => {
    const d = t.date || '';
    if (t.status === 'refunded') return false;   // fully-refunded sales are excluded
    if (d.slice(0,4) !== year) return false;
    if (month !== 'all' && d.slice(5,7) !== month) return false;
    if (day !== 'all' && d.slice(8,10) !== day) return false;
    return true;
  });
  const mNames = ['','Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const periodLabel = `${year}${month!=='all'?' / '+mNames[parseInt(month)]:''}${day!=='all'?' / Day '+parseInt(day):''}`;

  const revenue  = txns.reduce((s,t)=>s+DB.saleCollected(t),0);  // collected incl tax, net of refunds (sales report)
  const tax      = txns.reduce((s,t)=>s+DB.saleTax(t),0);
  const netSales = txns.reduce((s,t)=>s+DB.saleNet(t),0);    // ex-tax revenue (P&L)
  const grossSales = txns.reduce((s,t)=>s+DB.saleGross(t),0);
  const discounts  = txns.reduce((s,t)=>s+(t.discount||0),0);
  const cogs    = txns.reduce((s,t)=>s+DB.saleCost(t),0);
  // Operating expenses must match the SAME period as the sales above.
  const expenses= DB.expenses.filter(e => {
    const d = e.date || '';
    if (d.slice(0,4) !== year) return false;
    if (month !== 'all' && d.slice(5,7) !== month) return false;
    if (day !== 'all' && d.slice(8,10) !== day) return false;
    return true;
  }).reduce((s,e)=>s+e.amount,0);
  const grossP  = netSales-cogs;

  const rth = 'padding:6px 10px;border:1px solid #aaa;background:#d0d0d0;font-weight:700;font-size:12px;text-align:left';
  const rtd = 'padding:5px 10px;border:1px solid #ccc;font-size:12px';
  const rtdr = 'padding:5px 10px;border:1px solid #ccc;font-size:12px;text-align:right';

  function rDoc(reportTitle, body) {
    const logo = biz.logoUrl ? `<img src="${biz.logoUrl}" style="width:60px;height:60px;object-fit:contain;border:1px solid #ddd;border-radius:4px" />` : '';
    return `<div style="font-family:Arial,sans-serif;background:#fff;color:#000;padding:20px;border:1px solid #ccc;border-radius:6px;font-size:13px">
      <div style="display:flex;align-items:flex-start;gap:14px;padding-bottom:12px;border-bottom:2px solid #000;margin-bottom:12px">
        ${logo}
        <div style="flex:1">
          <div style="font-size:20px;font-weight:900;letter-spacing:-0.3px">${esc(biz.businessName)}</div>
          ${biz.address?`<div style="font-size:11px;color:#444;margin-top:2px">${esc(biz.address)}</div>`:''}
          ${biz.phone?`<div style="font-size:11px;color:#444">Phone: ${esc(biz.phone)}</div>`:''}
        </div>
      </div>
      <div style="text-align:center;margin-bottom:16px">
        <div style="font-size:15px;font-weight:700">${periodLabel} ${reportTitle}</div>
        <div style="font-size:12px;color:#555">${periodLabel}</div>
      </div>
      ${body}
      <div style="margin-top:28px;display:flex;justify-content:flex-end;padding-top:16px;border-top:1px solid #ccc">
        <div style="text-align:center;min-width:180px">
          <div style="border-top:1px solid #000;padding-top:4px;font-size:12px">Verified By</div>
        </div>
      </div>
    </div>`;
  }

  if (type === 'sales') {
    const byDay = {};
    txns.forEach(t=>{byDay[t.date]=(byDay[t.date]||0)+DB.saleCollected(t);});
    const days = Object.entries(byDay).sort((a,b)=>b[0].localeCompare(a[0]));
    const cash = txns.filter(t=>t.method==='cash').reduce((s,t)=>s+DB.saleCollected(t),0);
    const bank = txns.filter(t=>t.method==='bank').reduce((s,t)=>s+DB.saleCollected(t),0);
    return rDoc('Sales Report', `
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:14px">
        <div>
          <div style="font-weight:700;font-size:14px;margin-bottom:6px">Sales Summary</div>
          <table style="width:100%;border-collapse:collapse">
            <thead><tr><th style="${rth}">Type</th><th style="${rth};text-align:right">Amount</th></tr></thead>
            <tbody>
              <tr><td style="${rtd}">Cash Sales</td><td style="${rtdr}">${DB.fmt(cash)}</td></tr>
              <tr><td style="${rtd}">Bank Transfer Sales</td><td style="${rtdr}">${DB.fmt(bank)}</td></tr>
              <tr style="background:#e8e8e8"><td style="${rtd};font-weight:700">Total Sales Inc GST</td><td style="${rtdr};font-weight:700">${DB.fmt(revenue)}</td></tr>
              <tr style="background:#e8e8e8"><td style="${rtd};font-weight:700">GST Output</td><td style="${rtdr};font-weight:700">${DB.fmt(tax)}</td></tr>
            </tbody>
          </table>
        </div>
        <div>
          <div style="font-weight:700;font-size:14px;margin-bottom:6px">Daily Breakdown</div>
          <table style="width:100%;border-collapse:collapse">
            <thead><tr><th style="${rth}">Date</th><th style="${rth};text-align:center">Txns</th><th style="${rth};text-align:right">Revenue</th></tr></thead>
            <tbody>
              ${!days.length ? `<tr><td colspan="3" style="${rtd};text-align:center;color:#888">No data</td></tr>` :
              days.map(([d,amt])=>`<tr>
                <td style="${rtd}">${d}</td>
                <td style="${rtd};text-align:center">${txns.filter(t=>t.date===d).length}</td>
                <td style="${rtdr};font-weight:700">${DB.fmt(amt)}</td>
              </tr>`).join('')}
            </tbody>
          </table>
        </div>
      </div>
      <table style="width:100%;border-collapse:collapse">
        <tbody><tr style="background:#333">
          <td style="${rtd};font-weight:700;color:#fff">Grand Total Revenue &nbsp;(${txns.length} transactions)</td>
          <td style="${rtdr};font-weight:700;font-size:14px;color:#fff">${DB.fmt(revenue)}</td>
        </tr></tbody>
      </table>`);
  }

  if (type === 'pl') {
    const netP = grossP - expenses;
    return rDoc('Profit & Loss Statement', `
      <div style="font-weight:700;font-size:14px;margin-bottom:6px">Profit & Loss</div>
      <table style="width:100%;border-collapse:collapse">
        <thead><tr><th style="${rth}">Item</th><th style="${rth};text-align:right">Amount</th></tr></thead>
        <tbody>
          <tr><td style="${rtd}">Gross Sales (ex ${biz.taxName||'tax'})</td><td style="${rtdr}">${DB.fmt(grossSales)}</td></tr>
          ${discounts>0?`<tr><td style="${rtd}">Less: Discounts</td><td style="${rtdr};color:#CC0000">(${DB.fmt(discounts)})</td></tr>`:''}
          <tr style="background:#f3f3f3"><td style="${rtd};font-weight:700">Net Sales (ex ${biz.taxName||'tax'})</td><td style="${rtdr};font-weight:700;color:#059669">${DB.fmt(netSales)}</td></tr>
          <tr><td style="${rtd}">Cost of Goods Sold</td><td style="${rtdr};color:#CC0000">(${DB.fmt(cogs)})</td></tr>
          <tr style="background:#e8e8e8"><td style="${rtd};font-weight:700">Gross Profit</td><td style="${rtdr};font-weight:700;color:#059669">${DB.fmt(grossP)}</td></tr>
          <tr><td style="${rtd}">Operating Expenses</td><td style="${rtdr};color:#CC0000">(${DB.fmt(expenses)})</td></tr>
          <tr style="background:#333"><td style="${rtd};font-weight:700;font-size:14px;color:#fff">Net Profit / Loss</td><td style="${rtdr};font-weight:700;font-size:14px;color:${netP>=0?'#4ade80':'#f87171'}">${DB.fmt(netP)}</td></tr>
          <tr><td style="${rtd};color:#888;font-size:11px">Memo: ${biz.taxName||'Tax'} collected (liability, not revenue)</td><td style="${rtdr};color:#888;font-size:11px">${DB.fmt(tax)}</td></tr>
        </tbody>
      </table>`);
  }

  if (type === 'tax') {
    const cash = txns.filter(t=>t.method==='cash').reduce((s,t)=>s+DB.saleTax(t),0);
    const bank = txns.filter(t=>t.method==='bank').reduce((s,t)=>s+DB.saleTax(t),0);
    return rDoc('Tax Summary', `
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
        <div>
          <div style="font-weight:700;font-size:14px;margin-bottom:6px">Tax Summary</div>
          <table style="width:100%;border-collapse:collapse">
            <thead><tr><th style="${rth}">Type</th><th style="${rth};text-align:right">Tax (${biz.taxRate}%)</th></tr></thead>
            <tbody>
              <tr><td style="${rtd}">Cash Sales</td><td style="${rtdr}">${DB.fmt(cash)}</td></tr>
              <tr><td style="${rtd}">Bank Transfer Sales</td><td style="${rtdr}">${DB.fmt(bank)}</td></tr>
              <tr style="background:#e8e8e8"><td style="${rtd};font-weight:700">Total GST Output</td><td style="${rtdr};font-weight:700">${DB.fmt(tax)}</td></tr>
            </tbody>
          </table>
        </div>
        <div>
          <div style="font-weight:700;font-size:14px;margin-bottom:6px">Tax by Transaction</div>
          <div style="max-height:260px;overflow-y:auto;border:1px solid #ccc">
            <table style="width:100%;border-collapse:collapse">
              <thead><tr><th style="${rth}">Date / Customer</th><th style="${rth};text-align:right">Tax</th></tr></thead>
              <tbody>
                ${!txns.length ? `<tr><td colspan="2" style="${rtd};text-align:center;color:#888">No data</td></tr>` :
                txns.map(t=>`<tr>
                  <td style="${rtd}"><div style="font-weight:600">${t.date}</div><div style="font-size:11px;color:#666">${t.customerName||'Walk-in'}</div></td>
                  <td style="${rtdr};font-weight:700">${DB.fmt(t.tax)}</td>
                </tr>`).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>`);
  }

  if (type === 'inventory') {
    const prods = DB.products;
    const totalCost = prods.reduce((s,p)=>s+DB.stockValue(p),0);
    const totalRetail = prods.reduce((s,p)=>s+DB.retailValue(p),0);
    return rDoc('Inventory Report', `
      <div style="font-weight:700;font-size:14px;margin-bottom:6px">Stock Report</div>
      <table style="width:100%;border-collapse:collapse">
        <thead><tr>
          <th style="${rth}">Product</th>
          <th style="${rth}">Category</th>
          <th style="${rth};text-align:right">Stock</th>
          <th style="${rth};text-align:right">Cost</th>
          <th style="${rth};text-align:right">Price</th>
          <th style="${rth};text-align:right">Stock Value</th>
          <th style="${rth}">Status</th>
        </tr></thead>
        <tbody>
          ${prods.map(p=>{
            const st = DB.productStock(p);
            const s = st===0?'Out':st<=p.minStock?'Low':'OK';
            const sc = st===0?'#CC0000':st<=p.minStock?'#D97706':'#059669';
            const costCell = DB.hasVariants(p)?'—':DB.fmt(p.cost);
            const priceCell = DB.hasVariants(p)?`from ${DB.fmt(DB.variantMinPrice(p))}`:DB.fmt(p.price);
            return `<tr>
              <td style="${rtd};font-weight:600">${p.name}</td>
              <td style="${rtd}">${p.category}</td>
              <td style="${rtdr}">${st}</td>
              <td style="${rtdr}">${costCell}</td>
              <td style="${rtdr}">${priceCell}</td>
              <td style="${rtdr};font-weight:700">${DB.fmt(DB.stockValue(p))}</td>
              <td style="${rtd};color:${sc};font-weight:700">${s}</td>
            </tr>`;
          }).join('')}
          <tr style="background:#e8e8e8">
            <td colspan="5" style="${rtd};font-weight:700">Total Stock Value</td>
            <td style="${rtdr};font-weight:700">${DB.fmt(totalCost)}</td>
            <td style="${rtd}"></td>
          </tr>
          <tr style="background:#d0d0d0">
            <td colspan="5" style="${rtd};font-weight:700">Total Retail Value</td>
            <td style="${rtdr};font-weight:700">${DB.fmt(totalRetail)}</td>
            <td style="${rtd}"></td>
          </tr>
        </tbody>
      </table>`);
  }
  return '';
}

function plRow(label, value, color, bold=false, large=false) {
  return `<div style="display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid var(--border)">
    <span style="font-size:${large?'16':'14'}px;font-weight:${bold?'700':'500'};color:var(--gray-${bold?'900':'700'})">${label}</span>
    <span style="font-size:${large?'18':'15'}px;font-weight:${bold?'800':'600'};color:${color}">${value}</span>
  </div>`;
}

/* ══════════════════════════════════════════════════════════
   QUOTATIONS
   ══════════════════════════════════════════════════════════ */
function renderQuotations(el) {
  const quotes = DB.quotations;
  el.innerHTML = `
    <div class="page-header">
      <div class="page-header-title">Quotations</div>
      <div class="page-header-sub">Create and manage customer quotes</div>
    </div>
    <div class="section">
      <button class="btn btn-primary" style="width:100%" onclick="openNewQuotationModal()">
        + New Quotation
      </button>
    </div>
    <div class="section">
      <div class="card">
        <div class="card-header"><span class="card-title">All Quotations</span></div>
        ${!quotes.length ? '<div style="padding:32px;text-align:center;color:var(--text-muted)">No quotations yet</div>' :
          quotes.slice().reverse().map(q => {
            const statusColor = q.status==='converted'?'var(--success)':q.status==='confirmed'?'var(--primary)':'var(--text-muted)';
            const statusLabel = q.status==='converted'?'Converted':q.status==='confirmed'?'Confirmed':'Draft';
            return `<div style="display:flex;align-items:center;justify-content:space-between;padding:14px 16px;border-bottom:1px solid var(--border)">
              <div>
                <div style="font-size:13px;font-weight:700;color:var(--text-primary)">${q.id}</div>
                <div style="font-size:12px;color:var(--text-muted);margin-top:2px">${q.customerName} · ${q.date}</div>
                <div style="font-size:11px;color:var(--text-muted)">${q.items.length} item${q.items.length!==1?'s':''}</div>
              </div>
              <div style="text-align:right;display:flex;flex-direction:column;gap:6px;align-items:flex-end">
                <div style="font-size:14px;font-weight:800;color:var(--text-primary)">${DB.fmt(q.total)}</div>
                <span style="font-size:10px;font-weight:700;padding:2px 8px;border-radius:99px;background:${q.status==='converted'?'var(--success-light,#f0fdf4)':q.status==='confirmed'?'var(--primary-light)':'var(--bg)'};color:${statusColor}">${statusLabel}</span>
                <div style="display:flex;gap:4px">
                  ${q.status==='draft'?`<button class="btn btn-secondary btn-sm" onclick="confirmQuotation('${q.id}')">Confirm</button>`:''}
                  ${q.status==='confirmed'?`<button class="btn btn-primary btn-sm" onclick="convertQuotation('${q.id}')">Convert</button>`:''}
                  <button class="btn btn-ghost btn-sm" onclick="viewQuotation('${q.id}')">View</button>
                  ${q.status!=='converted'?`<button class="btn btn-ghost btn-sm" style="color:var(--danger)" onclick="deleteQuotation('${q.id}')">Delete</button>`:''}
                </div>
              </div>
            </div>`;
          }).join('')
        }
      </div>
    </div>`;
}

function openNewQuotationModal() {
  App._qtCart = [];
  App._qtSearch = '';
  App._qtDiscount = 0;
  App._qtCustomer = 'Walk-in Customer';

  function qtBody() {
    const subtotal = App._qtCart.reduce((s,i)=>s+i.price*i.qty,0);
    const disc = Math.min(App._qtDiscount||0, subtotal);
    const taxAmt = (subtotal-disc)*(DB.settings.taxRate/100);
    const total = subtotal-disc+taxAmt;
    const q = (App._qtSearch||'').toLowerCase();
    const prods = DB.products.filter(p => !q || p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q));
    return `
      <div class="pos-search-bar" style="padding:7px 12px;margin-bottom:10px">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
        <input id="qtSearch" type="text" placeholder="Search & add items…" value="${App._qtSearch||''}" autofocus />
        ${App._qtSearch?`<span onclick="App._qtSearch='';window._qtRefresh()" style="cursor:pointer;color:var(--text-muted);font-size:16px">×</span>`:''}
      </div>
      ${App._qtCart.length ? `
        <div style="border:1px solid var(--border);border-radius:var(--r);margin-bottom:10px;overflow:hidden">
          <div style="max-height:140px;overflow-y:auto">
            ${App._qtCart.map(i=>`
              <div style="display:flex;align-items:center;gap:8px;padding:9px 12px;border-bottom:1px solid var(--border)">
                <span style="font-size:16px">${i.emoji}</span>
                <div style="flex:1;min-width:0"><div style="font-size:13px;font-weight:600">${i.name}</div><div style="font-size:11px;color:var(--text-muted)">${DB.fmt(i.price)}</div></div>
                <div style="display:flex;align-items:center;gap:6px">
                  <button class="qty-btn" onclick="window._qtQty('${i.id}',-1)">−</button>
                  <span style="font-size:13px;font-weight:700;min-width:20px;text-align:center">${i.qty}</span>
                  <button class="qty-btn" onclick="window._qtQty('${i.id}',1)">+</button>
                </div>
                <span style="font-size:13px;font-weight:700;min-width:55px;text-align:right">${DB.fmt(i.price*i.qty)}</span>
              </div>`).join('')}
          </div>
          <div style="padding:10px 12px;background:var(--bg)">
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">
              <label style="font-size:12px;font-weight:600;color:var(--text-muted);white-space:nowrap">Discount</label>
              <input type="number" min="0" class="form-control" style="height:28px;font-size:12px;padding:3px 8px;flex:1" value="${App._qtDiscount||''}" placeholder="0.00"
                oninput="App._qtDiscount=parseFloat(this.value)||0;window._qtRefresh()" />
            </div>
            ${disc>0?`<div style="display:flex;justify-content:space-between;font-size:12px;color:var(--success);margin-bottom:2px"><span>Discount</span><span>−${DB.fmt(disc)}</span></div>`:''}
            <div style="display:flex;justify-content:space-between;font-size:12px;color:var(--text-muted);margin-bottom:2px"><span>Tax (${DB.settings.taxRate}%)</span><span>${DB.fmt(taxAmt)}</span></div>
            <div style="display:flex;justify-content:space-between;font-size:14px;font-weight:800;padding-top:6px;border-top:1px solid var(--border)"><span>Total</span><span style="color:var(--primary)">${DB.fmt(total)}</span></div>
            <div style="margin-top:8px;display:flex;gap:8px">
              <input type="text" class="form-control" style="height:28px;font-size:12px;padding:3px 8px;flex:1" placeholder="Customer name" value="${App._qtCustomer}"
                oninput="App._qtCustomer=this.value" />
              <input type="text" id="qtNotes" class="form-control" style="height:28px;font-size:12px;padding:3px 8px;flex:1" placeholder="Notes…" />
            </div>
          </div>
        </div>` :
        `<div style="padding:14px;text-align:center;color:var(--text-muted);font-size:13px;border:1px dashed var(--border);border-radius:var(--r);margin-bottom:10px">
          Add items to your quotation below
        </div>`}
      <div style="max-height:220px;overflow-y:auto;border:1px solid var(--border);border-radius:var(--r)">
        ${prods.length ? prods.map(p => {
          const inCart = App._qtCart.find(i=>i.id===p.id);
          return `<div style="display:flex;align-items:center;gap:10px;padding:9px 12px;border-bottom:1px solid var(--border);cursor:pointer"
            onmouseover="this.style.background='var(--primary-light)'" onmouseout="this.style.background=''">
            <span style="font-size:18px">${p.emoji}</span>
            <div style="flex:1;min-width:0"><div style="font-size:13px;font-weight:600">${p.name}</div><div style="font-size:11px;color:var(--text-muted)">${p.stock} left · ${DB.fmt(p.price)}</div></div>
            <button class="product-add-btn" onclick="window._qtAdd('${p.id}')" style="flex-shrink:0">${inCart?inCart.qty:'+'}</button>
          </div>`;
        }).join('') : `<div style="padding:24px;text-align:center;color:var(--text-muted)">No products found</div>`}
      </div>`;
  }

  window._qtRefresh = () => {
    const el = document.getElementById('qtBody');
    if (el) { el.innerHTML = qtBody(); attachQtSearch(); }
  };
  window._qtAdd = id => {
    const p = DB.getProduct(id); if (!p) return;
    const ex = App._qtCart.find(i=>i.id===id);
    if (ex) ex.qty++; else App._qtCart.push({id:p.id,name:p.name,emoji:p.emoji,price:p.price,cost:p.cost,qty:1});
    window._qtRefresh();
  };
  window._qtQty = (id, delta) => {
    const idx = App._qtCart.findIndex(i=>i.id===id); if (idx===-1) return;
    App._qtCart[idx].qty += delta;
    if (App._qtCart[idx].qty<=0) App._qtCart.splice(idx,1);
    window._qtRefresh();
  };
  function attachQtSearch() {
    const s = document.getElementById('qtSearch');
    if (s) s.oninput = function(){ App._qtSearch=this.value; window._qtRefresh(); };
  }

  openModal('New Quotation', `<div id="qtBody">${qtBody()}</div>`,
    `<button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
     <button class="btn btn-primary" onclick="saveQuotation()">Save Quotation</button>`, 'modal-lg');
  setTimeout(attachQtSearch, 50);
}

function saveQuotation() {
  if (!App._qtCart || !App._qtCart.length) { showToast('Add at least one item','error'); return; }
  const subtotal = App._qtCart.reduce((s,i)=>s+i.price*i.qty,0);
  const disc = Math.min(App._qtDiscount||0,subtotal);
  const tax = (subtotal-disc)*(DB.settings.taxRate/100);
  const total = subtotal-disc+tax;
  const notes = document.getElementById('qtNotes')?.value||'';
  DB.quotations.push({
    id: 'QT-'+String(DB.quotations.length+1).padStart(4,'0'),
    date: new Date().toISOString().split('T')[0],
    customerName: App._qtCustomer||'Walk-in Customer',
    customerId: null,
    items: App._qtCart.map(i=>({...i})),
    subtotal, discount:disc, tax, total,
    status:'draft', notes
  });
  closeModal();
  showToast('Quotation saved','success');
  navigate('quotations');
}

function confirmQuotation(id) {
  const q = DB.quotations.find(x=>x.id===id);
  if (!q) return;
  q.status = 'confirmed';
  showToast('Quotation confirmed','success');
  navigate('quotations');
}

function convertQuotation(id) {
  const q = DB.quotations.find(x=>x.id===id);
  if (!q) return;
  App.cart = q.items.map(i=>({...i}));
  App.discount = q.discount;
  App.discountType = 'fixed';
  App.selectedCustomer = null;
  q.status = 'converted';
  showToast('Quotation loaded into POS — complete checkout','success');
  navigate('pos');
}

function deleteQuotation(id) {
  openModal('Delete Quotation','<p style="color:var(--text-secondary);font-size:14px">Are you sure you want to delete this quotation? This cannot be undone.</p>',
    `<button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
     <button class="btn btn-danger" onclick="DB.quotations=DB.quotations.filter(q=>q.id!=='${id}');closeModal();showToast('Quotation deleted','success');navigate('quotations')">Delete</button>`);
}

function viewQuotation(id) {
  const q = DB.quotations.find(x=>x.id===id);
  if (!q) return;
  const biz = DB.settings;
  const statusLabel = q.status==='converted'?'CONVERTED':q.status==='confirmed'?'CONFIRMED':'DRAFT';
  openModal(`Quotation — ${q.id}`, `
    <div style="background:#fff;border-radius:12px;overflow:hidden;border:1px solid #eee">
      <div style="background:linear-gradient(135deg,#0D2E2C 0%,#1A5C56 50%,#4ECDC4 100%);padding:20px 24px;display:flex;justify-content:space-between;align-items:center">
        <div>
          <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:rgba(255,255,255,0.5);margin-bottom:4px">Quotation</div>
          <div style="font-size:15px;font-weight:900;color:#fff">${q.id}</div>
          <div style="margin-top:8px;background:rgba(255,255,255,0.15);border-radius:99px;padding:3px 12px;display:inline-block;font-size:11px;font-weight:800;color:#fff;letter-spacing:0.5px;border:1px solid rgba(255,255,255,0.3)">${statusLabel}</div>
        </div>
        <div style="text-align:right;display:flex;flex-direction:column;align-items:flex-end;gap:5px">
          ${biz.logoUrl?`<img src="${biz.logoUrl}" style="height:40px;width:auto;object-fit:contain;border-radius:8px"/>`:`<svg viewBox="0 0 48 48" width="40" height="40" xmlns="http://www.w3.org/2000/svg"><circle cx="24" cy="24" r="22" fill="none" stroke="#FFE66D" stroke-width="2.5"/><line x1="13" y1="18" x2="17" y2="22" stroke="#FFE66D" stroke-width="2.5" stroke-linecap="round"/><line x1="17" y1="18" x2="13" y2="22" stroke="#FFE66D" stroke-width="2.5" stroke-linecap="round"/><path d="M30 18 Q35 21 30 24" fill="none" stroke="#FFE66D" stroke-width="2.5" stroke-linecap="round"/><path d="M15 30 Q24 37 33 30" fill="none" stroke="#4ECDC4" stroke-width="2.5" stroke-linecap="round"/></svg>`}
          <div style="font-size:13px;font-weight:900;color:#fff">${esc(biz.businessName)}</div>
        </div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;border-bottom:1px solid #f0f0f0">
        <div style="padding:12px 18px;border-right:1px solid #f0f0f0">
          <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.8px;color:#aaa;margin-bottom:4px">Customer</div>
          <div style="font-size:13px;font-weight:600">${q.customerName}</div>
        </div>
        <div style="padding:12px 18px">
          <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.8px;color:#aaa;margin-bottom:4px">Date</div>
          <div style="font-size:13px;font-weight:600">${q.date}</div>
        </div>
      </div>
      <div style="padding:14px 18px">
        <table style="width:100%;border-collapse:collapse">
          <thead><tr>
            <th style="text-align:left;font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:0.8px;color:#14877A;padding-bottom:6px;border-bottom:2px solid #14877A">Item</th>
            <th style="text-align:center;font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:0.8px;color:#14877A;padding-bottom:6px;border-bottom:2px solid #14877A">Qty</th>
            <th style="text-align:right;font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:0.8px;color:#14877A;padding-bottom:6px;border-bottom:2px solid #14877A">Price</th>
            <th style="text-align:right;font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:0.8px;color:#14877A;padding-bottom:6px;border-bottom:2px solid #14877A">Total</th>
          </tr></thead>
          <tbody>${q.items.map(i=>`<tr>
            <td style="padding:8px 0;font-size:13px;border-bottom:1px solid #f5f5f5">${i.name}</td>
            <td style="padding:8px 0;text-align:center;font-size:13px;color:#555;border-bottom:1px solid #f5f5f5">${i.qty}</td>
            <td style="padding:8px 0;text-align:right;font-size:13px;color:#555;border-bottom:1px solid #f5f5f5">${DB.fmt(i.price)}</td>
            <td style="padding:8px 0;text-align:right;font-size:13px;font-weight:700;border-bottom:1px solid #f5f5f5">${DB.fmt(i.price*i.qty)}</td>
          </tr>`).join('')}</tbody>
        </table>
      </div>
      <div style="background:#f8fffe;border-top:1px solid #e8f4f3;padding:12px 18px">
        <div style="display:flex;justify-content:space-between;font-size:13px;color:#666;margin-bottom:4px"><span>Subtotal</span><span>${DB.fmt(q.subtotal)}</span></div>
        ${q.discount>0?`<div style="display:flex;justify-content:space-between;font-size:13px;color:#059669;margin-bottom:4px"><span>Discount</span><span>−${DB.fmt(q.discount)}</span></div>`:''}
        <div style="display:flex;justify-content:space-between;font-size:13px;color:#666;margin-bottom:8px"><span>Tax (${biz.taxRate}%)</span><span>${DB.fmt(q.tax)}</span></div>
        <div style="display:flex;justify-content:space-between;align-items:center;padding-top:8px;border-top:2px solid #14877A">
          <span style="font-size:15px;font-weight:800">Total</span>
          <span style="font-size:18px;font-weight:900;color:#14877A">${DB.fmt(q.total)}</span>
        </div>
      </div>
      ${q.notes?`<div style="padding:10px 18px;border-top:1px solid #f0f0f0;font-size:12px;color:#888">Notes: ${q.notes}</div>`:''}
      <div style="background:linear-gradient(135deg,#0D2E2C 0%,#1A5C56 50%,#4ECDC4 100%);padding:10px 18px;text-align:center">
        <div style="font-size:11px;color:rgba(255,255,255,0.7)">Valid for 30 days · ${esc(biz.businessName)}</div>
      </div>
    </div>`,
    `<button class="btn btn-secondary" onclick="closeModal()">Close</button>
     <button class="btn btn-ghost" onclick="window.print()">Print</button>
     ${q.status==='draft'?`<button class="btn btn-primary" onclick="closeModal();confirmQuotation('${q.id}')">Confirm</button>`:''}
     ${q.status==='confirmed'?`<button class="btn btn-success" onclick="closeModal();convertQuotation('${q.id}')">Convert to Purchase</button>`:''}
    `, 'modal-lg');
}

/* ══════════════════════════════════════════════════════════
   RETURNS & REFUNDS
   ══════════════════════════════════════════════════════════ */
function renderReturns(el) {
  const refunded   = DB.transactions.filter(t => t.status === 'refunded');
  const returnable = DB.transactions.filter(t => t.status !== 'refunded');
  el.innerHTML = `
    <div class="page-header">
      <div class="page-header-title">Returns &amp; Refunds</div>
      <div class="page-header-sub">Refund whole orders or individual items</div>
    </div>
    <div class="section">
      <div class="card">
        <div class="card-header"><span class="card-title">Recent Transactions</span><span style="font-size:12px;color:var(--text-muted)">Select to refund</span></div>
        ${!returnable.length ? '<div style="padding:32px;text-align:center;color:var(--text-muted)">No transactions to refund.</div>' :
          returnable.slice(0,12).map(t => {
            const partial = t.status === 'partial-refund';
            return `
            <div style="display:flex;align-items:center;justify-content:space-between;padding:12px 16px;border-bottom:1px solid var(--border)">
              <div style="min-width:0">
                <div style="font-size:13px;font-weight:700">${t.id} ${partial?'<span class="badge-pill badge-warning" style="font-size:9.5px">Partly refunded</span>':''}</div>
                <div style="font-size:12px;color:var(--text-muted)">${esc(t.customerName||t.customer||'Walk-in')} · ${t.date}</div>
                <div style="font-size:12px;color:var(--text-muted)">${t.items} item${t.items!==1?'s':''} · ${esc(t.payment||t.method||'cash')}</div>
              </div>
              <div style="text-align:right">
                <div style="font-size:14px;font-weight:800;margin-bottom:2px">${DB.fmt(DB.saleCollected(t))}</div>
                ${partial?`<div style="font-size:10.5px;color:var(--danger);margin-bottom:4px">−${DB.fmt(t.refundedAmount)} refunded</div>`:''}
                <button class="btn btn-danger btn-sm" onclick="openRefundModal('${t.id}')">Refund</button>
              </div>
            </div>`;
          }).join('')
        }
      </div>
    </div>
    ${refunded.length ? `
    <div class="section">
      <div class="card">
        <div class="card-header"><span class="card-title">Fully Refunded</span></div>
        ${refunded.map(t => `
          <div style="display:flex;align-items:center;justify-content:space-between;padding:12px 16px;border-bottom:1px solid var(--border);opacity:0.65">
            <div>
              <div style="font-size:13px;font-weight:700">${t.id}</div>
              <div style="font-size:12px;color:var(--text-muted)">${esc(t.customerName||t.customer||'Walk-in')} · ${t.date}</div>
            </div>
            <div style="text-align:right">
              <div style="font-size:14px;font-weight:800;color:var(--danger)">${DB.fmt(t.total)}</div>
              <span style="font-size:10px;color:var(--danger);font-weight:700">REFUNDED</span>
            </div>
          </div>`).join('')}
      </div>
    </div>` : ''}`;
}

function openRefundModal(id) {
  const t = DB.transactions.find(x => x.id === id);
  if (!t) return;
  if (t.status === 'refunded') { showToast('This sale is already fully refunded', 'warning'); return; }
  window._refundTxn = t;
  const items = (t.cartItems || []).filter(i => DB.refundableQty(i) > 0);
  // Legacy sales with no itemized lines → offer a whole-order refund only.
  if (!items.length) {
    openModal('Refund Order', `
      <div style="background:var(--bg);border-radius:var(--r);padding:14px;margin-bottom:8px">
        <div style="font-size:13px;font-weight:700">${t.id} · ${esc(t.customerName||t.customer||'Walk-in')}</div>
        <div style="font-size:12px;color:var(--text-muted)">${t.date} · ${DB.fmt(t.total)}</div>
      </div>
      <p style="font-size:13px;color:var(--text-secondary)">This sale has no itemized lines, so only a whole-order refund is available. Stock cannot be itemized back.</p>`,
      `<button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
       <button class="btn btn-danger" onclick="processFullRefundLegacy('${t.id}')">Refund ${DB.fmt(t.total)}</button>`);
    return;
  }
  App._refundQty = {};
  items.forEach(i => { App._refundQty[i.id] = DB.refundableQty(i); });   // default: refund everything remaining
  openModal('Process Refund', renderRefundBody(t),
    `<button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
     <button class="btn btn-ghost" onclick="processExchange('${t.id}')">Exchange →</button>
     <button class="btn btn-danger" onclick="processRefund('${t.id}')">Refund</button>`);
}

// Live refund preview using the same proportional discount/tax model as DB.refundItems.
function _refundPreview(t) {
  const origNet  = (t.subtotal||0) - (t.discount||0);
  const effRate  = origNet > 0 ? (t.tax||0) / origNet : 0;
  const discRate = (t.subtotal||0) > 0 ? (t.discount||0) / t.subtotal : 0;
  let amount = 0, qtyTotal = 0;
  (t.cartItems||[]).forEach(i => {
    const q = (App._refundQty||{})[i.id] || 0;
    if (q <= 0) return;
    const net = i.price * q * (1 - discRate);
    amount += net + net * effRate;
    qtyTotal += q;
  });
  return { amount: DB.money(amount), qtyTotal };
}

function renderRefundBody(t) {
  const items = (t.cartItems||[]).filter(i => DB.refundableQty(i) > 0);
  const pv = _refundPreview(t);
  return `
    <div style="background:var(--bg);border-radius:var(--r);padding:12px 14px;margin-bottom:14px">
      <div style="font-size:13px;font-weight:700">${t.id} · ${esc(t.customerName||t.customer||'Walk-in')}</div>
      <div style="font-size:12px;color:var(--text-muted)">${t.date} · paid ${DB.fmt(t.total)} via ${esc(t.payment||t.method||'cash')}</div>
    </div>
    <div style="font-size:13px;font-weight:700;margin-bottom:8px">Items &amp; quantities to refund</div>
    <div style="border:1px solid var(--border);border-radius:var(--r);overflow:hidden;margin-bottom:14px">
      ${items.map(i => {
        const max = DB.refundableQty(i);
        const q = (App._refundQty||{})[i.id] || 0;
        return `<div style="display:flex;align-items:center;gap:10px;padding:10px 12px;border-bottom:1px solid var(--border)">
          <div style="flex:1;min-width:0">
            <div style="font-size:13px;font-weight:600">${esc(i.name)}</div>
            <div style="font-size:11px;color:var(--text-muted)">${DB.fmt(i.price)} each · ${max} refundable${i.refundedQty?` · ${i.refundedQty} already refunded`:''}</div>
          </div>
          <div class="qty-control">
            <div class="qty-btn" role="button" tabindex="0" aria-label="Decrease" onclick="refundQtyChange('${i.id}',-1,${max})">−</div>
            <span class="qty-value">${q}</span>
            <div class="qty-btn" role="button" tabindex="0" aria-label="Increase" onclick="refundQtyChange('${i.id}',1,${max})">+</div>
          </div>
        </div>`;
      }).join('')}
    </div>
    <div style="display:flex;justify-content:space-between;align-items:center;background:var(--primary-light);border-radius:var(--r);padding:12px 14px">
      <span style="font-size:13px;font-weight:700;color:var(--primary)">Refund total (${pv.qtyTotal} item${pv.qtyTotal!==1?'s':''})</span>
      <span style="font-size:18px;font-weight:900;color:var(--primary)">${DB.fmt(pv.amount)}</span>
    </div>`;
}

function refundQtyChange(id, delta, max) {
  const cur = (App._refundQty||{})[id] || 0;
  let n = cur + delta;
  if (n < 0) n = 0;
  if (max != null && n > max) n = max;
  App._refundQty[id] = n;
  const body = document.getElementById('modalBody');
  if (body && window._refundTxn) body.innerHTML = renderRefundBody(window._refundTxn);
}

function _refundLines() {
  return Object.entries(App._refundQty || {}).map(([id, qty]) => ({ id, qty })).filter(l => l.qty > 0);
}

function processRefund(id) {
  const lines = _refundLines();
  if (!lines.length) { showToast('Select at least one item to refund', 'error'); return; }
  const res = DB.refundItems(id, lines);
  if (!res.ok) { showToast(res.reason || 'Refund failed', 'error'); return; }
  closeModal();
  showToast(`${res.fully ? 'Full' : 'Partial'} refund — ${DB.fmt(res.refundedAmount)} returned`, 'success');
  navigate('returns');
}

// Exchange = refund the selected items (restocking them) then open POS for replacements.
function processExchange(id) {
  const lines = _refundLines();
  if (!lines.length) { showToast('Select items to exchange', 'error'); return; }
  const res = DB.refundItems(id, lines);
  if (!res.ok) { showToast(res.reason || 'Exchange failed', 'error'); return; }
  App.cart = [];
  closeModal();
  showToast(`Items restocked (${DB.fmt(res.refundedAmount)}). Add the replacements.`, 'info');
  navigate('pos');
}

// Whole-order refund for legacy sales without itemized lines.
function processFullRefundLegacy(id) {
  const t = DB.transactions.find(x => x.id === id);
  if (!t || t.status === 'refunded') { closeModal(); showToast('Already refunded', 'warning'); return; }
  DB.reverseTransaction(t);
  closeModal();
  showToast(`Refund processed for ${t.id} — ${DB.fmt(t.total)} returned`, 'success');
  navigate('returns');
}

/* ══════════════════════════════════════════════════════════
   COSTING
   ══════════════════════════════════════════════════════════ */
function renderCosting(el) {
  const exps    = DB.expenses;
  const sales   = DB.transactions.filter(t => t.status !== 'refunded');   // exclude refunds
  const total   = DB.money(exps.reduce((s,e) => s+e.amount, 0));
  const revenue = DB.money(sales.reduce((s,t) => s+DB.saleNet(t), 0));   // net sales (ex-tax)
  const cogs    = DB.money(sales.reduce((s,t) => s+DB.saleCost(t), 0));
  const netP    = DB.money(revenue-total-cogs);
  const pctOfRev = v => revenue ? Math.round(v/revenue*100) : 0;

  const byCat = {};
  exps.forEach(e => { byCat[e.category] = (byCat[e.category]||0)+e.amount; });
  const catColors = ['var(--pastel-blue)','var(--pastel-purple)','var(--pastel-pink)','var(--pastel-green)','var(--pastel-yellow)','var(--pastel-orange)'];
  const cats = Object.entries(byCat);

  el.innerHTML = `
    <div class="kpi-grid">
      ${miniKPI('Total Expenses', DB.fmt(total),   exps.length+' entries','down','var(--pastel-pink)')}
      ${miniKPI('Net Sales',      DB.fmt(revenue), 'Ex-tax revenue',      'up',  'var(--pastel-blue)')}
      ${miniKPI('COGS',           DB.fmt(cogs),    'Cost of goods',  'neutral',  'var(--pastel-yellow)')}
      ${miniKPI('Net Profit',     DB.fmt(netP),    Math.round(netP/revenue*100||0)+'% margin', netP>=0?'up':'down','var(--pastel-green)')}
    </div>
    <div class="costing-grid">
      <div class="card">
        <div class="card-header"><span class="card-title">Expenses by Category</span>
          <button class="btn btn-primary btn-sm" onclick="openAddExpenseModal()">+ Add</button></div>
        <div class="card-body" style="display:flex;flex-direction:column;gap:12px">
          ${cats.map(([cat,amt],i) => {
            const pct = Math.round(amt/total*100);
            return `<div>
              <div style="display:flex;justify-content:space-between;font-size:13px;font-weight:600;margin-bottom:6px">
                <span style="display:flex;align-items:center;gap:6px">
                  <span style="width:10px;height:10px;background:${catColors[i%6]};border-radius:50%;display:inline-block"></span>${cat}
                </span>
                <span>${DB.fmt(amt)} <span style="color:var(--gray-400)">(${pct}%)</span></span>
              </div>
              <div class="stock-bar"><div class="stock-fill high" style="width:${pct}%;background:${catColors[i%6]};filter:brightness(0.8)"></div></div>
            </div>`;
          }).join('')}
        </div>
      </div>
      <div class="card">
        <div class="card-header"><span class="card-title">Margin Analysis</span></div>
        <div class="table-wrapper"><table>
          <thead><tr><th>Item</th><th>Amount</th><th>% of Rev</th></tr></thead>
          <tbody>
            <tr><td>Revenue</td><td><strong>${DB.fmt(revenue)}</strong></td><td>100%</td></tr>
            <tr><td>COGS</td><td style="color:var(--danger)">(${DB.fmt(cogs)})</td><td>${pctOfRev(cogs)}%</td></tr>
            <tr><td><strong>Gross Profit</strong></td><td style="color:var(--success)"><strong>${DB.fmt(revenue-cogs)}</strong></td><td><strong>${pctOfRev(revenue-cogs)}%</strong></td></tr>
            <tr><td>Expenses</td><td style="color:var(--danger)">(${DB.fmt(total)})</td><td>${pctOfRev(total)}%</td></tr>
            <tr style="border-top:2px solid var(--border)"><td><strong>Net Profit</strong></td>
              <td style="color:${netP>=0?'var(--success)':'var(--danger)'}"><strong>${DB.fmt(netP)}</strong></td>
              <td><strong>${pctOfRev(netP)}%</strong></td></tr>
          </tbody>
        </table></div>
      </div>
    </div>
    <div class="card">
      <div class="card-header"><span class="card-title">Expense Log</span>
        <button class="btn btn-primary btn-sm" onclick="openAddExpenseModal()">+ Add Expense</button></div>
      <div class="txn-list">
        ${exps.slice().reverse().map((e,i) => `
          <div class="txn-card">
            <div class="txn-icon" style="background:${catColors[i%6]};color:var(--gray-700)">${iconDollar()}</div>
            <div class="txn-info">
              <div class="txn-name">${e.description}</div>
              <div class="txn-meta">${e.category} · ${formatDate(e.date)}</div>
            </div>
            <div class="txn-right"><div class="txn-amount" style="color:var(--danger)">${DB.fmt(e.amount)}</div></div>
          </div>`).join('')}
      </div>
    </div>`;
}

/* ══════════════════════════════════════════════════════════
   ORDERS HUB — Deliveries & Pickups (Part 4)
   ══════════════════════════════════════════════════════════ */
// Shared row icons for the large order cards (orders + pre-orders).
const _ocPin   = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:14px;height:14px;flex-shrink:0;color:var(--text-muted)"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>';
const _ocPhone = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:14px;height:14px;flex-shrink:0;color:var(--text-muted)"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.94.36 1.86.7 2.73a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.35-1.27a2 2 0 0 1 2.11-.45c.87.34 1.79.57 2.73.7A2 2 0 0 1 22 16.92z"/></svg>';
const _ocBag   = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:14px;height:14px;flex-shrink:0;color:var(--text-muted)"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>';

function _itemsSummary(items, fallbackCount) {
  const list = items || [];
  if (!list.length) return `${fallbackCount} item${fallbackCount !== 1 ? 's' : ''}`;
  const totalQty = list.reduce((s, i) => s + i.qty, 0);
  return list.length <= 2
    ? list.map(i => `${i.qty}× ${i.name}`).join(', ')
    : `${totalQty} items · ${list.slice(0,2).map(i => i.name).join(', ')}…`;
}

// Large at-a-glance card for a regular order (sale).
function orderCardHTML(t) {
  const isDel     = t.orderType === 'delivery';
  const delivered = t.deliveryStatus === 'delivered';
  const itemsSummary = _itemsSummary(t.cartItems, t.items);
  const quickBtn = isDel && !delivered
    ? `<button class="btn btn-success btn-sm" onclick="event.stopPropagation();setDeliveryStatus('${t.id}',true,false)">✓ Mark Delivered</button>` : '';
  const postpone = isDel && !delivered
    ? `<button class="btn btn-ghost btn-sm" onclick="event.stopPropagation();postponeOrder('${t.id}',false)">Postpone →</button>` : '';
  return `<div class="order-card${delivered?' delivered':''}" onclick="viewTransaction('${t.id}')">
    <div class="order-card-top">
      <div style="min-width:0">
        <div class="order-card-id">${t.id}</div>
        <div class="order-card-cust">${esc(t.customerName || 'Walk-in Customer')}</div>
      </div>
      <div style="text-align:right;flex-shrink:0">
        <div class="order-card-total">${DB.fmt(t.total)}</div>
        <div style="display:flex;gap:5px;justify-content:flex-end;margin-top:5px;flex-wrap:wrap">${orderTypeBadge(t)} ${deliveryStatusBadge(t)}</div>
      </div>
    </div>
    ${isDel ? `
      <div class="order-card-row">${_ocPin}<span>${esc(t.deliveryLocation || '—')}</span></div>
      <div class="order-card-row">${_ocPhone}<span>${esc(t.deliveryContact || '—')}</span></div>` : ''}
    <div class="order-card-row">${_ocBag}<span>${itemsSummary}</span></div>
    <div class="order-card-foot">
      <span class="order-card-date">${formatDate(DB.orderDate(t))}${t.time ? ' · '+t.time : ''}${t.postponedFrom ? ' · postponed' : ''}</span>
      <div style="display:flex;gap:6px;flex-wrap:wrap;justify-content:flex-end">${postpone}${quickBtn}</div>
    </div>
  </div>`;
}

// Large card for a pre-order — same format, with a "Pre Order — <status>" badge.
function preOrderCardHTML(p) {
  const isDel = p.orderType === 'delivery';
  const meta  = PRE_STATUS[p.status] || PRE_STATUS.pending;
  const itemsSummary = _itemsSummary(p.cartItems, (p.cartItems||[]).reduce((s,i)=>s+i.qty,0));
  const acts = [];
  if (p.status === 'pending') acts.push(`<button class="btn btn-secondary btn-sm" onclick="event.stopPropagation();setPreStatus('${p.id}','confirmed')">Confirm</button>`);
  if (p.status === 'pending' || p.status === 'confirmed') {
    acts.push(`<button class="btn btn-ghost btn-sm" style="color:var(--danger)" onclick="event.stopPropagation();setPreStatus('${p.id}','cancelled')">Cancel</button>`);
    acts.push(`<button class="btn btn-success btn-sm" onclick="event.stopPropagation();fulfillPreOrder('${p.id}')">Fulfill → Sale</button>`);
  }
  return `<div class="order-card" onclick="viewPreOrder('${p.id}')">
    <div class="order-card-top">
      <div style="min-width:0">
        <div class="order-card-id">${p.id}</div>
        <div class="order-card-cust">${esc(p.customerName || 'Walk-in Customer')}</div>
      </div>
      <div style="text-align:right;flex-shrink:0">
        <div class="order-card-total">${DB.fmt(p.total||0)}</div>
        <div style="display:flex;gap:5px;justify-content:flex-end;margin-top:5px;flex-wrap:wrap">${orderTypeBadge(p)} <span class="badge-pill ${meta.cls}" style="font-size:9.5px">Pre Order — ${meta.label}</span></div>
      </div>
    </div>
    ${isDel ? `
      <div class="order-card-row">${_ocPin}<span>${esc(p.deliveryLocation || '—')}</span></div>
      <div class="order-card-row">${_ocPhone}<span>${esc(p.deliveryContact || '—')}</span></div>` : ''}
    <div class="order-card-row">${_ocBag}<span>${itemsSummary}</span></div>
    <div class="order-card-foot">
      <span class="order-card-date">${formatDate(p.date)}${p.time ? ' · '+p.time : ''}</span>
      <div style="display:flex;gap:6px;flex-wrap:wrap;justify-content:flex-end">${acts.join('')}</div>
    </div>
  </div>`;
}

// Segmented [Orders][Pre Orders] toggle; switching re-renders without resetting.
function setOrdersTab(tab) {
  App.ordersTab = tab;
  const el = document.getElementById('pageContent');
  if (el) renderOrders(el);
}

// Merged Orders + Pre-Orders screen. The segmented control switches the body;
// the filter bar swaps to match whichever tab is active (Part 3).
function renderOrders(el) {
  const isPre = App.ordersTab === 'preorders';
  const seg = (val,label) => `<button class="seg-btn${App.ordersTab===val?' active':''}" onclick="setOrdersTab('${val}')">${label}</button>`;
  const active = DB.transactions.filter(t => t.status !== 'refunded');
  const headerSub = isPre
    ? `${(DB.preOrders||[]).length} pre-orders`
    : `${active.filter(t => t.orderType==='delivery' && t.deliveryStatus==='pending').length} pending delivery`;
  const newBtn = isPre
    ? `<button class="btn btn-primary" onclick="openPreOrderModal()">+ New Pre-Order</button>`
    : `<button class="btn btn-primary" onclick="openQuickOrder()">+ New Order</button>`;

  el.innerHTML = `
    <div class="page-header" style="display:flex;align-items:center;justify-content:space-between">
      <div>
        <div class="page-header-title">Orders</div>
        <div class="page-header-sub">${headerSub}</div>
      </div>
      ${newBtn}
    </div>

    <div class="section" style="padding-bottom:6px">
      <div class="seg-control">${seg('orders','Orders')}${seg('preorders','Pre Orders')}</div>
    </div>

    ${isPre ? preOrdersTabBody() : ordersTabBody()}`;
}

// ── Orders tab body: KPIs + when/type/status filters + order cards ──
function ordersTabBody() {
  const today = new Date().toISOString().split('T')[0];
  const dateF = App.orderDateFilter, typeF = App.orderTypeFilter, statusF = App.orderStatusFilter;
  const list  = DB.queryOrders({ date: dateF, type: typeF, status: statusF });
  // Pending deliveries float to the top, then newest first.
  list.sort((a,b) => {
    const ap = (a.orderType==='delivery' && a.deliveryStatus==='pending') ? 0 : 1;
    const bp = (b.orderType==='delivery' && b.deliveryStatus==='pending') ? 0 : 1;
    if (ap !== bp) return ap - bp;
    const ad = DB.orderDate(a), bd = DB.orderDate(b);
    if (ad !== bd) return ad < bd ? 1 : -1;
    return (b.time||'').localeCompare(a.time||'');
  });

  const active        = DB.transactions.filter(t => t.status !== 'refunded');
  const todayPending  = DB.pendingDeliveriesOn(today).length;
  const pendingTotal  = active.filter(t => t.orderType==='delivery' && t.deliveryStatus==='pending').length;
  const deliveredCnt  = active.filter(t => t.orderType==='delivery' && t.deliveryStatus==='delivered').length;

  const chip = (group, val, label, cur) =>
    `<div class="filter-tab${cur===val?' active':''}" onclick="App.${group}='${val}';setOrdersTab('orders')">${label}</div>`;
  const grpLabel = txt => `<div style="font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:.8px;color:var(--text-muted);padding:0 16px 5px">${txt}</div>`;

  return `
    <div class="section">
      <div class="kpi-grid">
        ${miniKPI('Pending Today', todayPending, 'Deliveries due', todayPending?'down':'neutral', 'var(--pastel-orange)')}
        ${miniKPI('All Pending',   pendingTotal, 'Awaiting delivery','neutral','var(--pastel-yellow)')}
        ${miniKPI('Delivered',     deliveredCnt, 'Completed','up','var(--pastel-green)')}
      </div>
    </div>

    <div class="section" style="padding-top:0">
      ${grpLabel('When')}
      <div class="filter-tabs" style="margin-bottom:10px">
        ${chip('orderDateFilter','today','Today',dateF)}
        ${chip('orderDateFilter','week','This Week',dateF)}
        ${chip('orderDateFilter','all','All',dateF)}
      </div>
      ${grpLabel('Type')}
      <div class="filter-tabs" style="margin-bottom:10px">
        ${chip('orderTypeFilter','all','All',typeF)}
        ${chip('orderTypeFilter','delivery','Deliveries Only',typeF)}
        ${chip('orderTypeFilter','pickup','Pickups Only',typeF)}
      </div>
      ${grpLabel('Delivery status')}
      <div class="filter-tabs">
        ${chip('orderStatusFilter','all','Any',statusF)}
        ${chip('orderStatusFilter','pending','Pending Delivery',statusF)}
        ${chip('orderStatusFilter','delivered','Delivered',statusF)}
      </div>
    </div>

    <div class="section" style="padding-bottom:24px">
      ${list.length
        ? `<div class="order-grid">${list.map(orderCardHTML).join('')}</div>`
        : `<div class="card" style="padding:36px 20px;text-align:center;color:var(--text-muted);font-size:13.5px">
             No orders match these filters.<br>Try widening the date range or clearing the status filter.
           </div>`}
    </div>`;
}

// ── Pre-Orders tab body: KPIs + status filters + large pre-order cards ──
function preOrdersTabBody() {
  const all = DB.preOrders || [];
  const filter = App.preFilter || 'all';
  const counts = { pending:0, confirmed:0, fulfilled:0, cancelled:0 };
  all.forEach(p => { counts[p.status] = (counts[p.status]||0)+1; });
  const list = all.filter(p => filter==='all' || p.status===filter);
  const tabs = [['all','All'],['pending','Pending'],['confirmed','Confirmed'],['fulfilled','Fulfilled'],['cancelled','Cancelled']];

  return `
    <div class="section">
      <div class="kpi-grid">
        ${miniKPI('Pending',   counts.pending,   'Awaiting confirm','neutral','var(--pastel-yellow)')}
        ${miniKPI('Confirmed', counts.confirmed, 'Ready to fulfill','up','var(--pastel-blue)')}
        ${miniKPI('Fulfilled', counts.fulfilled, 'Completed','up','var(--pastel-green)')}
      </div>
    </div>

    <div class="filter-tabs">
      ${tabs.map(([v,l]) => `<div class="filter-tab${filter===v?' active':''}" onclick="App.preFilter='${v}';setOrdersTab('preorders')">${l}</div>`).join('')}
    </div>

    <div class="section" style="padding-bottom:24px">
      ${list.length
        ? `<div class="order-grid">${list.map(preOrderCardHTML).join('')}</div>`
        : `<div class="card" style="padding:36px 20px;text-align:center;color:var(--text-muted);font-size:13.5px">
             No pre-orders${filter!=='all'?' with this status':''} yet.<br>Tap “+ New Pre-Order” to create one.
           </div>`}
    </div>`;
}

/* ══════════════════════════════════════════════════════════
   PRE-ORDERS — future orders, managed separately from sales
   ══════════════════════════════════════════════════════════ */
const PRE_STATUS = {
  pending:   { label: 'Pending',   cls: 'badge-warning' },
  confirmed: { label: 'Confirmed', cls: 'badge-info' },
  fulfilled: { label: 'Fulfilled', cls: 'badge-success' },
  cancelled: { label: 'Cancelled', cls: 'badge-danger' },
};
function preStatusBadge(s) {
  const m = PRE_STATUS[s] || PRE_STATUS.pending;
  return `<span class="badge-pill ${m.cls}" style="font-size:10px">${m.label}</span>`;
}

function setPreStatus(id, status) {
  DB.setPreOrderStatus(id, status);
  showToast(`Pre-order ${id} ${status}`, status==='cancelled'?'warning':'success');
  App.ordersTab = 'preorders';
  navigate('orders');
}

function fulfillPreOrder(id) {
  const txn = DB.fulfillPreOrder(id);
  if (!txn) { showToast('Could not fulfill this pre-order', 'error'); return; }
  closeModal();
  showToast(`Pre-order fulfilled → sale ${txn.id}`, 'success');
  App.ordersTab = 'preorders';
  navigate('orders');
}

function viewPreOrder(id) {
  const p = DB.getPreOrder(id);
  if (!p) return;
  const rows = (p.cartItems||[]).map(i => `
    <tr><td>${i.name}</td><td style="text-align:center">${i.qty}</td><td style="text-align:right">${DB.fmt(i.price)}</td><td style="text-align:right;font-weight:700">${DB.fmt(i.price*i.qty)}</td></tr>`).join('');
  const delivery = p.orderType==='delivery'
    ? `<div style="background:var(--pastel-purple);border-radius:var(--r);padding:12px 14px;margin-bottom:14px">
         <div style="font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:.6px;color:#6D28D9;margin-bottom:4px">Delivery</div>
         <div style="font-size:13px"><strong>To:</strong> ${p.deliveryLocation||'—'}</div>
         <div style="font-size:13px"><strong>Contact:</strong> ${p.deliveryContact||'—'}</div>
       </div>`
    : `<div style="background:var(--pastel-teal);border-radius:var(--r);padding:10px 14px;margin-bottom:14px;font-size:13px;font-weight:600;color:#0F766E">Pickup order</div>`;
  const acts = [];
  if (p.status==='pending')   acts.push(`<button class="btn btn-secondary" onclick="setPreStatus('${p.id}','confirmed')">Confirm</button>`);
  if (p.status==='pending'||p.status==='confirmed') {
    acts.push(`<button class="btn btn-ghost" style="color:var(--danger)" onclick="setPreStatus('${p.id}','cancelled')">Cancel</button>`);
    acts.push(`<button class="btn btn-primary" onclick="fulfillPreOrder('${p.id}')">Fulfill → Sale</button>`);
  }
  openModal(`Pre-Order ${p.id}`, `
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px">
      <div>
        <div style="font-size:16px;font-weight:800">${p.customerName||'Walk-in Customer'}</div>
        <div style="font-size:12px;color:var(--text-muted)">${formatDate(p.date)}${p.time?' · '+p.time:''}</div>
      </div>
      ${preStatusBadge(p.status)}
    </div>
    ${delivery}
    <div class="table-wrapper" style="margin-bottom:14px"><table>
      <thead><tr><th>Item</th><th style="text-align:center">Qty</th><th style="text-align:right">Price</th><th style="text-align:right">Total</th></tr></thead>
      <tbody>${rows || '<tr><td colspan="4" style="text-align:center;color:var(--text-muted);padding:14px">No items</td></tr>'}</tbody>
    </table></div>
    <div style="background:var(--bg);border:1px solid var(--border);border-radius:var(--r);padding:12px 14px">
      <div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:4px"><span>Subtotal</span><span>${DB.fmt(p.subtotal||0)}</span></div>
      ${p.discount?`<div style="display:flex;justify-content:space-between;font-size:13px;color:var(--success);margin-bottom:4px"><span>Discount</span><span>−${DB.fmt(p.discount)}</span></div>`:''}
      <div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:4px"><span>${DB.settings.taxName} (${DB.settings.taxRate}%)</span><span>${DB.fmt(p.tax||0)}</span></div>
      <div style="display:flex;justify-content:space-between;font-size:16px;font-weight:900;padding-top:6px;border-top:1px solid var(--border)"><span>Total</span><span style="color:var(--primary)">${DB.fmt(p.total||0)}</span></div>
    </div>
    ${p.status==='fulfilled'&&p.fulfilledTxnId?`<p style="font-size:12px;color:var(--text-muted);margin-top:10px">Fulfilled as sale <strong>${p.fulfilledTxnId}</strong>.</p>`:''}`,
    `<button class="btn btn-secondary" onclick="closeModal()">Close</button>${acts.join('')}`, 'modal-lg');
}

/* ── Pre-order creation modal (mirrors the New Order form) ── */
function openPreOrderModal() {
  App.preCart = [];
  App.preCustomer = '';
  App._poSearch = '';
  App._poExpand = null;
  resetOrderType();
  openModal('New Pre-Order', '<div id="poBody"></div>',
    `<button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
     <button class="btn btn-primary" id="poSaveBtn" onclick="savePreOrder()">Create Pre-Order</button>`, 'modal-lg');
  window._poRender();
  setTimeout(()=>{ const s=document.getElementById('poSearch'); if(s) s.oninput=function(){ App._poSearch=this.value; window._poRender(); }; }, 50);
}

window._poTotals = function() {
  const subtotal = App.preCart.reduce((s,i)=>s+i.price*i.qty,0);
  const disc = Math.min(App.preDiscount||0, subtotal);
  const tax  = (subtotal-disc)*(DB.settings.taxRate/100);
  return { subtotal, disc, tax, total: subtotal-disc+tax };
};

window._poRender = function() {
  const body = document.getElementById('poBody');
  if (!body) return;
  const q = (App._poSearch||'').toLowerCase();
  const prods = DB.products.filter(p => DB.productStock(p)>0 && (!q || p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)));
  const t = window._poTotals();
  body.innerHTML = `
    <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px">
      <svg viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" stroke-width="2" style="width:16px;height:16px;flex-shrink:0"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
      <select class="form-control" style="height:36px;font-size:13px;flex:1" onchange="App.preCustomer=this.value;window._poRender()">
        <option value="">Walk-in Customer</option>
        ${DB.customers.map(c=>`<option value="${c.id}" ${App.preCustomer==c.id?'selected':''}>${esc(c.name)}</option>`).join('')}
      </select>
    </div>
    <div class="pos-search-bar" style="padding:7px 12px;margin-bottom:8px">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
      <input id="poSearch" type="text" placeholder="Search & add items…" value="${App._poSearch||''}" />
    </div>
    <div style="max-height:170px;overflow-y:auto;border:1px solid var(--border);border-radius:var(--r);margin-bottom:10px">
      ${prods.length ? prods.map(p=>{
        const variantProd = DB.hasVariants(p);
        const st = DB.productStock(p);
        const expanded = variantProd && App._poExpand===p.id;
        const inCart = variantProd ? App.preCart.filter(i=>i.productId===p.id).reduce((s,i)=>s+i.qty,0) : (App.preCart.find(i=>i.id===p.id)?.qty||0);
        const sub = variantProd ? `${p.variants.length} options · ${st} left` : `${st} left · ${DB.fmt(p.price)}`;
        return `<div style="display:flex;align-items:center;gap:10px;padding:9px 12px;border-bottom:1px solid var(--border);cursor:pointer" onmouseover="this.style.background='var(--primary-light)'" onmouseout="this.style.background=''">
          <span style="font-size:18px">${p.emoji}</span>
          <div style="flex:1;min-width:0"><div style="font-size:13px;font-weight:600">${p.name}</div><div style="font-size:11px;color:var(--text-muted)">${sub}</div></div>
          <button class="product-add-btn" onclick="window._poAdd('${p.id}')" style="flex-shrink:0">${variantProd?(expanded?'×':(inCart||'›')):(inCart||'+')}</button>
        </div>${expanded?variantPickerHTML(p,"window._poAdd('%VID%')"):''}`;
      }).join('') : `<div style="padding:20px;text-align:center;color:var(--text-muted);font-size:13px">No products found</div>`}
    </div>
    ${App.preCart.length ? `<div style="border:1px solid var(--border);border-radius:var(--r);margin-bottom:10px;overflow:hidden">
      ${App.preCart.map(i=>`<div style="display:flex;align-items:center;gap:8px;padding:8px 12px;border-bottom:1px solid var(--border)">
        <div style="flex:1;min-width:0"><div style="font-size:13px;font-weight:600">${i.name}</div><div style="font-size:11px;color:var(--text-muted)">${DB.fmt(i.price)} each</div></div>
        <div style="display:flex;align-items:center;gap:6px">
          <button class="qty-btn" onclick="window._poQty('${i.id}',-1)">−</button>
          <span style="font-size:13px;font-weight:700;min-width:18px;text-align:center">${i.qty}</span>
          <button class="qty-btn" onclick="window._poQty('${i.id}',1)">+</button>
        </div>
        <span style="font-size:13px;font-weight:700;min-width:60px;text-align:right">${DB.fmt(i.price*i.qty)}</span>
      </div>`).join('')}
    </div>` : `<div style="padding:12px;text-align:center;color:var(--text-muted);font-size:13px;border:1px dashed var(--border);border-radius:var(--r);margin-bottom:10px">No items added yet</div>`}

    ${orderTypeFieldsHTML('window._poRender()')}

    <div style="background:var(--bg);border:1px solid var(--border);border-radius:var(--r);padding:12px 14px">
      <div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:4px"><span>Subtotal</span><span>${DB.fmt(t.subtotal)}</span></div>
      <div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:4px"><span>${DB.settings.taxName} (${DB.settings.taxRate}%)</span><span>${DB.fmt(t.tax)}</span></div>
      <div style="display:flex;justify-content:space-between;font-size:15px;font-weight:900;padding-top:6px;border-top:1px solid var(--border)"><span>Total</span><span style="color:var(--primary)">${DB.fmt(t.total)}</span></div>
    </div>`;
  // keep the search box focused-ish after re-render
  setTimeout(()=>{ const s=document.getElementById('poSearch'); if(s) s.oninput=function(){ App._poSearch=this.value; window._poRender(); }; }, 0);
};

window._poAdd = function(id) {
  const s = DB.sellable(id); if (!s) return;
  if (s.needsVariant) { App._poExpand = (App._poExpand===s.id?null:s.id); window._poRender(); return; }
  if (s.stock===0) { showToast('Out of stock','warning'); return; }
  const ex = App.preCart.find(i=>i.id===s.id);
  if (ex) { if (ex.qty<s.stock) ex.qty++; else { showToast('Max stock reached','warning'); return; } }
  else App.preCart.push({ id:s.id, productId:s.productId, name:s.name, emoji:s.emoji, price:s.price, cost:s.cost, qty:1, variantName:s.variantName });
  App._poExpand = null;
  window._poRender();
};

window._poQty = function(id, delta) {
  const idx = App.preCart.findIndex(i=>i.id===id); if (idx===-1) return;
  const s = DB.sellable(id);
  let qn = App.preCart[idx].qty + delta;
  if (qn<=0) App.preCart.splice(idx,1);
  else if (s && qn>s.stock) { showToast('Max stock reached','warning'); App.preCart[idx].qty=s.stock; }
  else App.preCart[idx].qty = qn;
  window._poRender();
};

function savePreOrder() {
  if (!App.preCart.length) { showToast('Add at least one item', 'error'); return; }
  const ot = validateOrderType();
  if (!ot.ok) { showToast(ot.reason, 'error'); return; }
  const t = window._poTotals();
  const cust = App.preCustomer ? DB.getCustomer(App.preCustomer) : null;
  DB.addPreOrder({
    customerId: cust?.id || null,
    customerName: cust?.name || 'Walk-in Customer',
    items: App.preCart.reduce((s,i)=>s+i.qty,0),
    subtotal: t.subtotal, discount: t.disc, tax: t.tax, total: t.total,
    orderType: App.orderType || 'pickup',
    deliveryLocation: App.orderType==='delivery' ? cleanText(App.deliveryLocation) : '',
    deliveryContact:  App.orderType==='delivery' ? cleanText(App.deliveryContact)  : '',
    cartItems: App.preCart.map(i=>({...i})),
  });
  App.preCart = []; resetOrderType();
  closeModal();
  showToast('Pre-order created', 'success');
  App.ordersTab = 'preorders';
  navigate('orders');
}

/* ══════════════════════════════════════════════════════════
   MARKETING — promo codes & pricing tiers
   ══════════════════════════════════════════════════════════ */
function renderMarketing(el) {
  const user = App.user || { role:'Owner' };
  if (!canManage()) {
    el.innerHTML = `<div class="card report-empty" style="margin:16px">
      <svg viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" stroke-width="1.5" style="width:40px;height:40px;opacity:.5;margin-bottom:12px"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
      <div style="font-size:15px;font-weight:700;color:var(--text-secondary);margin-bottom:4px">Marketing is restricted</div>
      <div style="font-size:13px">Your role (<strong>${user.role}</strong>) doesn't have access. Contact the owner.</div>
    </div>`;
    return;
  }

  const promos = DB.promoCodes || [];
  const tiers  = DB.pricingTiers || [];
  const activeCount  = promos.filter(p => p.active).length;
  const redemptions  = promos.reduce((s,p) => s+(p.used||0), 0);
  const today = new Date().toISOString().split('T')[0];

  const promoCard = (p) => {
    const expired = p.expiry && p.expiry < today;
    const maxed   = p.usageLimit != null && (p.used||0) >= p.usageLimit;
    const dead    = !p.active || expired || maxed;
    const valLabel = p.type === 'percent' ? `${p.value}% off` : `${DB.fmt(p.value)} off`;
    const conds = [];
    if (p.minSpend) conds.push(`min ${DB.fmt(p.minSpend)}`);
    if (p.expiry)   conds.push(`${expired?'expired':'expires'} ${formatDate(p.expiry)}`);
    conds.push(p.usageLimit != null ? `${p.used||0}/${p.usageLimit} used` : `${p.used||0} used`);
    return `<div class="card" style="padding:14px 16px;margin-bottom:10px;${dead?'opacity:.62':''}">
      <div style="display:flex;align-items:center;justify-content:space-between;gap:10px">
        <div style="min-width:0">
          <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
            <span style="font-size:16px;font-weight:900;letter-spacing:1px;color:var(--primary)">${p.code}</span>
            <span class="badge-pill ${p.type==='percent'?'badge-info':'badge-success'}">${valLabel}</span>
            ${!p.active?'<span class="badge-pill badge-warning">paused</span>':expired?'<span class="badge-pill badge-danger">expired</span>':maxed?'<span class="badge-pill badge-danger">limit reached</span>':'<span class="badge-pill badge-success">active</span>'}
          </div>
          <div style="font-size:11.5px;color:var(--text-muted);margin-top:4px">${conds.join(' · ')}</div>
        </div>
        <div style="display:flex;gap:6px;flex-shrink:0">
          <button class="btn btn-ghost btn-sm" onclick="togglePromo('${p.code}')">${p.active?'Pause':'Activate'}</button>
          <button class="btn btn-ghost btn-sm btn-icon" onclick="deletePromoCode('${p.code}')" style="color:var(--danger)">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:13px;height:13px"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/></svg>
          </button>
        </div>
      </div>
    </div>`;
  };

  const tierRow = (t) => {
    const count = DB.customers.filter(c => c.tier === t.id).length;
    return `<div style="display:flex;align-items:center;justify-content:space-between;padding:11px 0;border-bottom:1px solid var(--border)">
      <div>
        <div style="font-size:14px;font-weight:700;color:var(--text-primary)">${t.name}</div>
        <div style="font-size:11.5px;color:var(--text-muted)">${count} customer${count!==1?'s':''}</div>
      </div>
      <div style="display:flex;align-items:center;gap:10px">
        <span class="badge-pill ${t.discountPct?'badge-success':'badge-info'}">${t.discountPct?`−${t.discountPct}%`:'no discount'}</span>
        <button class="btn btn-ghost btn-sm" onclick="openTierModal('${t.id}')">Edit</button>
        ${t.id==='standard'?'':`<button class="btn btn-ghost btn-sm btn-icon" onclick="deleteTier('${t.id}')" style="color:var(--danger)"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:13px;height:13px"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>`}
      </div>
    </div>`;
  };

  el.innerHTML = `
    <div class="page-header">
      <div class="page-header-title">Marketing</div>
      <div class="page-header-sub">Promo codes & customer pricing tiers</div>
    </div>

    <div class="section">
      <div class="kpi-grid">
        ${miniKPI('Active Codes', activeCount, `${promos.length} total`, 'up', 'var(--pastel-purple)')}
        ${miniKPI('Redemptions', redemptions, 'All-time', 'up', 'var(--pastel-green)')}
        ${miniKPI('Pricing Tiers', tiers.length, 'Customer levels', 'neutral', 'var(--pastel-blue)')}
      </div>
    </div>

    <div class="section">
      <div class="card">
        <div class="card-header"><span class="card-title">Promo Codes</span>
          <button class="btn btn-primary btn-sm" onclick="openPromoModal()">+ New Code</button>
        </div>
        <div class="card-body" style="padding-top:12px">
          ${promos.length ? promos.map(promoCard).join('') : '<div style="padding:18px;text-align:center;color:var(--text-muted);font-size:13px">No promo codes yet.</div>'}
        </div>
      </div>
    </div>

    <div class="section" style="padding-bottom:24px">
      <div class="card">
        <div class="card-header"><span class="card-title">Pricing Tiers</span>
          <button class="btn btn-primary btn-sm" onclick="openTierModal()">+ New Tier</button>
        </div>
        <div class="card-body" style="padding-top:6px">
          ${tiers.map(tierRow).join('')}
          <div style="font-size:11.5px;color:var(--text-muted);padding-top:10px">Selecting a tiered customer in the POS auto-applies their discount. Assign a tier from a customer's profile.</div>
        </div>
      </div>
    </div>`;
}

function openPromoModal() {
  openModal('New Promo Code', `
    <div class="form-group"><label class="form-label">Code <span style="color:var(--danger)">*</span></label>
      <input id="pm_code" class="form-control" placeholder="e.g. SUMMER20" style="text-transform:uppercase;letter-spacing:1px" /></div>
    <div class="form-row">
      <div class="form-group"><label class="form-label">Type</label>
        <select id="pm_type" class="form-control" onchange="document.getElementById('pm_valLabel').textContent=this.value==='percent'?'Value (%)':'Value (${DB.settings.currency})'">
          <option value="percent">Percent (%)</option><option value="fixed">Fixed amount</option>
        </select></div>
      <div class="form-group"><label class="form-label" id="pm_valLabel">Value (%)</label>
        <input id="pm_value" type="number" min="0" step="0.01" class="form-control" placeholder="0" /></div>
    </div>
    <div class="form-row">
      <div class="form-group"><label class="form-label">Min Spend (${DB.settings.currency})</label>
        <input id="pm_min" type="number" min="0" step="0.01" class="form-control" placeholder="0" /></div>
      <div class="form-group"><label class="form-label">Usage Limit</label>
        <input id="pm_limit" type="number" min="0" class="form-control" placeholder="∞" /></div>
    </div>
    <div class="form-group"><label class="form-label">Expiry (optional)</label>
      <input id="pm_expiry" type="date" class="form-control" /></div>`,
    `<button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
     <button class="btn btn-primary" onclick="savePromo()">Create Code</button>`);
}

function savePromo() {
  const code = (document.getElementById('pm_code')?.value || '').trim().toUpperCase();
  if (!code) { showToast('Enter a code', 'error'); return; }
  if (!/^[A-Z0-9]+$/.test(code)) { showToast('Use letters and numbers only', 'error'); return; }
  if (DB.findPromo(code)) { showToast('That code already exists', 'error'); return; }
  const value = parseFloat(document.getElementById('pm_value')?.value) || 0;
  if (value <= 0) { showToast('Enter a value greater than 0', 'error'); return; }
  const type = document.getElementById('pm_type')?.value || 'percent';
  if (type === 'percent' && value > 100) { showToast('Percent cannot exceed 100', 'error'); return; }
  DB.addPromo({ code, type, value,
    minSpend: parseFloat(document.getElementById('pm_min')?.value) || 0,
    usageLimit: document.getElementById('pm_limit')?.value,
    expiry: document.getElementById('pm_expiry')?.value || null });
  closeModal(); showToast(`${code} created`, 'success'); navigate('marketing');
}

function togglePromo(code) {
  const p = DB.findPromo(code);
  if (p) { p.active = !p.active; showToast(`${code} ${p.active?'activated':'paused'}`, 'success'); }
  navigate('marketing');
}

function deletePromoCode(code) {
  openModal('Delete Promo Code', `<p style="font-size:14px;color:var(--text-secondary)">Delete <strong>${code}</strong>? This can't be undone.</p>`,
    `<button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
     <button class="btn btn-danger" onclick="DB.deletePromo('${code}');closeModal();showToast('${code} deleted','success');navigate('marketing')">Delete</button>`);
}

function openTierModal(id) {
  const t = id ? DB.getTier(id) : null;
  openModal(t ? `Edit Tier: ${t.name}` : 'New Pricing Tier', `
    <div class="form-group"><label class="form-label">Tier Name <span style="color:var(--danger)">*</span></label>
      <input id="tm_name" class="form-control" value="${t?t.name:''}" placeholder="e.g. VIP" ${t&&t.id==='standard'?'readonly':''} /></div>
    <div class="form-group"><label class="form-label">Discount (%)</label>
      <input id="tm_pct" type="number" min="0" max="100" step="0.5" class="form-control" value="${t?t.discountPct:''}" placeholder="0" /></div>`,
    `<button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
     <button class="btn btn-primary" onclick="saveTier('${id||''}')">${t?'Save':'Create Tier'}</button>`);
}

function saveTier(id) {
  const name = cleanText(document.getElementById('tm_name')?.value);
  const pct  = Math.max(0, Math.min(100, parseFloat(document.getElementById('tm_pct')?.value) || 0));
  if (!name) { showToast('Enter a tier name', 'error'); return; }
  if (id) {
    const t = DB.getTier(id);
    if (t) { if (t.id !== 'standard') t.name = name; t.discountPct = pct; }
  } else {
    const tid = name.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'') || ('tier-'+Date.now());
    if (DB.getTier(tid)) { showToast('A tier with that name exists', 'error'); return; }
    DB.pricingTiers.push({ id: tid, name, discountPct: pct });
  }
  closeModal(); showToast('Pricing tier saved', 'success'); navigate('marketing');
}

function deleteTier(id) {
  if (id === 'standard') return;
  const t = DB.getTier(id);
  openModal('Delete Tier', `<p style="font-size:14px;color:var(--text-secondary)">Delete the <strong>${t?t.name:id}</strong> tier? Customers on it will revert to no tier.</p>`,
    `<button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
     <button class="btn btn-danger" onclick="confirmDeleteTier('${id}')">Delete</button>`);
}
function confirmDeleteTier(id) {
  DB.customers.forEach(c => { if (c.tier === id) c.tier = null; });
  DB.pricingTiers = DB.pricingTiers.filter(t => t.id !== id);
  closeModal(); showToast('Tier deleted', 'success'); navigate('marketing');
}

/* ══════════════════════════════════════════════════════════
   SETTINGS
   ══════════════════════════════════════════════════════════ */
function renderSettings(el) {
  const user = App.user || { name:'Admin User', email:'admin@posx.com', role:'Owner', initials:'AS' };

  // Role-based access control — only Owner / Store Manager may open Settings.
  if (!canManage()) {
    el.innerHTML = `<div class="card report-empty" style="margin:16px">
      <svg viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" stroke-width="1.5" style="width:40px;height:40px;opacity:.5;margin-bottom:12px"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
      <div style="font-size:15px;font-weight:700;color:var(--text-secondary);margin-bottom:4px">Settings are restricted</div>
      <div style="font-size:13px">Your role (<strong>${user.role}</strong>) doesn't have access. Contact the owner.</div>
    </div>`;
    return;
  }

  const tabs = {
    general: `
      <div class="card-header"><span class="card-title">General Settings</span></div>
      <div class="card-body" style="display:flex;flex-direction:column;gap:16px">
        <div class="form-group"><label class="form-label">Business Name</label><input type="text" class="form-control" value="${esc(DB.settings.businessName)}" oninput="DB.settings.businessName=this.value" /></div>
        <div class="form-group"><label class="form-label">Email</label><input type="email" class="form-control" value="${DB.settings.email||'admin@mybusiness.com'}" /></div>
        <div class="form-group"><label class="form-label">Phone</label><input type="tel" class="form-control" value="${DB.settings.phone||'+1 555 0100'}" /></div>
        <div class="form-group"><label class="form-label">Address</label><textarea class="form-control" rows="2">${DB.settings.address||'123 Main St'}</textarea></div>
        <div class="form-row">
          <div class="form-group"><label class="form-label">Currency Symbol</label><input type="text" class="form-control" value="${DB.settings.currency}" oninput="DB.settings.currency=this.value" /></div>
          <div class="form-group"><label class="form-label">Tax Rate (%)</label><input type="number" class="form-control" value="${DB.settings.taxRate}" oninput="DB.settings.taxRate=parseFloat(this.value)||0" /></div>
        </div>
        <div style="border-top:1px solid var(--border);padding-top:16px;margin-top:4px">
          <div style="font-size:13px;font-weight:700;color:var(--text-primary);margin-bottom:12px">Bank Transfer Details</div>
          <div class="form-row">
            <div class="form-group"><label class="form-label">Account Name</label><input type="text" class="form-control" placeholder="e.g. Doozi Store" value="${esc(DB.settings.accountName||'')}" oninput="DB.settings.accountName=this.value" /></div>
            <div class="form-group"><label class="form-label">Account Number</label><input type="text" class="form-control" placeholder="e.g. 7730001234" value="${esc(DB.settings.accountNumber||'')}" oninput="DB.settings.accountNumber=this.value" /></div>
          </div>
          <p style="font-size:11.5px;color:var(--text-muted);margin-top:-8px">These details appear on invoices for bank transfer customers.</p>
        </div>
        <button class="btn btn-primary" onclick="showToast('Settings saved','success')">Save Changes</button>
      </div>`,
    profile: `
      <div class="card-header"><span class="card-title">My Profile</span></div>
      <div class="card-body" style="display:flex;flex-direction:column;gap:16px">
        <div style="display:flex;align-items:center;gap:14px;padding:16px;background:var(--primary-light);border-radius:var(--r)">
          <div style="width:60px;height:60px;border-radius:50%;background:var(--grad-primary);display:grid;place-items:center;font-size:22px;font-weight:700;color:#fff">${user.initials}</div>
          <div>
            <div style="font-size:18px;font-weight:700">${user.name}</div>
            <div style="color:var(--gray-500);font-size:13px">${user.email}</div>
            <span class="badge-pill badge-primary" style="margin-top:4px">${user.role}</span>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group"><label class="form-label">Full Name</label><input type="text" class="form-control" value="${user.name}" /></div>
          <div class="form-group"><label class="form-label">Email</label><input type="email" class="form-control" value="${user.email}" /></div>
        </div>
        <div class="form-group"><label class="form-label">Role</label><input type="text" class="form-control" value="${user.role}" readonly style="background:var(--gray-100)" /></div>
        <button class="btn btn-primary" onclick="showToast('Profile updated','success')">Update Profile</button>
        <button class="btn btn-secondary" onclick="doLogout()" style="color:var(--danger)">Sign Out</button>
      </div>`,
    receipt: `
      <div class="card-header"><span class="card-title">Receipt &amp; Invoice Settings</span></div>
      <div class="card-body" style="display:flex;flex-direction:column;gap:16px">
        <div class="form-group">
          <label class="form-label">Business Logo (appears on invoices)</label>
          ${DB.settings.logoUrl ? `
            <div style="margin-bottom:10px;display:flex;align-items:center;gap:12px">
              <img src="${DB.settings.logoUrl}" style="height:64px;width:auto;max-width:140px;border-radius:8px;object-fit:contain;border:1px solid var(--border);padding:4px;background:#fff" />
              <button class="btn btn-secondary" style="font-size:12px" onclick="DB.settings.logoUrl=null;navigate('settings')">Remove</button>
            </div>` : ''}
          <label style="display:flex;align-items:center;gap:10px;padding:12px 16px;border:2px dashed var(--border-md);border-radius:var(--r);cursor:pointer;transition:var(--t)" onmouseover="this.style.borderColor='var(--primary)'" onmouseout="this.style.borderColor='var(--border-md)'">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:20px;height:20px;color:var(--primary)"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            <span style="font-size:13px;font-weight:600;color:var(--primary)">${DB.settings.logoUrl ? 'Change logo' : 'Upload logo (JPEG/PNG)'}</span>
            <input type="file" accept="image/*" style="display:none" onchange="uploadLogo(this)" />
          </label>
        </div>
        <div class="form-group"><label class="form-label">Receipt Header</label><input type="text" class="form-control" value="${DB.settings.receiptHeader||'Thank you for your purchase!'}" oninput="DB.settings.receiptHeader=this.value" /></div>
        <div class="form-group"><label class="form-label">Receipt Footer</label><input type="text" class="form-control" value="${DB.settings.receiptFooter||'No returns after 7 days.'}" oninput="DB.settings.receiptFooter=this.value" /></div>
        <button class="btn btn-primary" onclick="showToast('Saved','success')">Save</button>
      </div>`,
    view: `
      <div class="card-header"><span class="card-title">View & Display</span></div>
      <div class="card-body" style="display:flex;flex-direction:column;gap:16px">
        <div class="form-group">
          <label class="form-label" style="font-size:14px;font-weight:700;margin-bottom:10px">View Mode</label>
          <div class="mode-btns" style="width:fit-content">
            <div class="mode-btn${App.viewMode==='auto'?' active':''}" style="padding:10px 20px;font-size:13px" onclick="setViewMode('auto');navigate('settings')">Auto (Responsive)</div>
            <div class="mode-btn${App.viewMode==='desktop'?' active':''}" style="padding:10px 20px;font-size:13px" onclick="setViewMode('desktop');navigate('settings')">🖥 Desktop</div>
            <div class="mode-btn${App.viewMode==='mobile'?' active':''}" style="padding:10px 20px;font-size:13px" onclick="setViewMode('mobile');navigate('settings')">📱 Mobile</div>
          </div>
          <p style="font-size:12px;color:var(--gray-400);margin-top:8px">Desktop/Mobile forces the layout regardless of actual screen size.</p>
        </div>
        <div class="form-group"><label class="form-label">Default Page</label>
          <select class="form-control"><option>Dashboard</option><option>POS Terminal</option><option>Sales</option></select></div>
        <button class="btn btn-primary" onclick="showToast('Saved','success')">Save</button>
      </div>`,
    backup: cloudBackupTabHTML(),
  };

  el.innerHTML = `<div class="settings-grid">
    <div class="settings-nav">
      ${[['general','General'],['profile','My Profile'],['receipt','Receipt'],['view','View & Display'],['backup','Backup & Sync']].map(([t,l]) =>
        `<div class="settings-nav-item${App.settingsTab===t?' active':''}" onclick="App.settingsTab='${t}';navigate('settings')">${l}</div>`).join('')}
    </div>
    <div class="card" style="padding:0">${tabs[App.settingsTab]||tabs.general}</div>
  </div>`;

  if (App.settingsTab === 'backup') cloudLoadBackups();   // fill history list async
}

/* ── Cloud backup & sync (Settings → Backup & Sync) ─────────── */
function cloudStatusMeta() {
  const m = {
    saved:   { label: 'Synced',  color: 'var(--success)', bg: 'rgba(5,150,105,.12)' },
    syncing: { label: 'Syncing…',color: 'var(--primary)', bg: 'var(--primary-light)' },
    offline: { label: 'Offline — saving locally', color: '#B45309', bg: 'rgba(217,119,6,.12)' },
    idle:    { label: 'Auto-sync off', color: 'var(--text-muted)', bg: 'var(--bg)' },
    unauthorized: { label: 'Sync token rejected', color: 'var(--danger)', bg: 'rgba(220,38,38,.12)' },
  };
  return m[(typeof Cloud!=='undefined' && Cloud.status) || 'idle'] || m.idle;
}

function cloudBackupTabHTML() {
  const on = typeof Cloud !== 'undefined' ? Cloud.isEnabled() : true;
  const s  = cloudStatusMeta();
  const last = (typeof Cloud!=='undefined' && Cloud.lastSync) ? new Date(Cloud.lastSync).toLocaleTimeString() : '—';
  return `
    <div class="card-header"><span class="card-title">Backup &amp; Sync</span></div>
    <div class="card-body" style="display:flex;flex-direction:column;gap:16px">

      <div style="display:flex;align-items:center;justify-content:space-between;background:var(--bg);border:1px solid var(--border);border-radius:var(--r);padding:14px 16px">
        <div>
          <div style="font-size:13px;font-weight:700;color:var(--text-primary)">Cloud Status</div>
          <div style="font-size:11.5px;color:var(--text-muted);margin-top:2px">Last sync: <span id="cloudLastSync">${last}</span></div>
        </div>
        <span id="cloudStatusBadge" class="badge-pill" style="background:${s.bg};color:${s.color};font-weight:700">${s.label}</span>
      </div>

      <label style="display:flex;align-items:flex-start;gap:12px;cursor:pointer;background:var(--surface);border:1.5px solid var(--border-md);border-radius:var(--r);padding:14px">
        <input type="checkbox" ${on?'checked':''} onchange="Cloud.setEnabled(this.checked);navigate('settings')" style="width:18px;height:18px;accent-color:var(--primary);margin-top:1px;cursor:pointer" />
        <div>
          <div style="font-size:14px;font-weight:700;color:var(--text-primary)">Auto-sync to backup server</div>
          <div style="font-size:12px;color:var(--text-muted);margin-top:2px">Every change is saved to your local backup server. Turn off to keep data on this device only.</div>
        </div>
      </label>

      <div style="display:flex;gap:8px;flex-wrap:wrap">
        <button class="btn btn-primary btn-sm" onclick="cloudBackupNow()">Back up now</button>
        <button class="btn btn-secondary btn-sm" onclick="cloudSyncNow()">Sync from cloud</button>
        <button class="btn btn-secondary btn-sm" onclick="cloudLoadBackups()">Refresh history</button>
      </div>

      <div class="form-group" style="margin:0">
        <label class="form-label">Sync Token <span style="font-weight:500;color:var(--text-muted)">(optional)</span></label>
        <div style="display:flex;gap:8px">
          <input type="password" class="form-control" id="cloudTokenInput" placeholder="Leave blank if server is open"
            value="${esc((typeof Cloud!=='undefined' && Cloud._token()) || '')}" autocomplete="off" />
          <button class="btn btn-secondary btn-sm" onclick="saveCloudToken()">Save</button>
        </div>
        <p style="font-size:11px;color:var(--text-muted);margin-top:6px">Only needed if the backup server is started with a token. Set the same value as the server's <code>DOOZI_BACKUP_TOKEN</code> environment variable.</p>
      </div>

      <div>
        <div style="font-size:13px;font-weight:700;color:var(--text-primary);margin-bottom:8px">Backup History</div>
        <div id="cloudBackupList" style="border:1px solid var(--border);border-radius:var(--r);overflow:hidden">
          <div style="padding:16px;text-align:center;color:var(--text-muted);font-size:12.5px">Loading…</div>
        </div>
        <div style="font-size:11px;color:var(--text-muted);margin-top:6px">Snapshots are JSON files under <code>/backups</code> next to the server. The newest 50 are kept.</div>
      </div>

      <div style="background:var(--bg);border:1px solid var(--border);border-radius:var(--r);padding:14px 16px">
        <div style="font-size:12.5px;font-weight:700;color:var(--text-secondary);margin-bottom:6px">About cloud features</div>
        <div style="font-size:11.5px;color:var(--text-muted);line-height:1.6">
          <strong>Backup &amp; restore</strong> run against a local server (<code>server.js</code>) on this machine — your data has a real place to live beyond this browser.
          <strong>Multi-user accounts</strong>, <strong>cross-device sync over the internet</strong>, and a <strong>tamper-proof audit trail</strong> need a hosted account and aren't available in this local setup.
        </div>
      </div>
    </div>`;
}

// Update just the status badge / timestamp without a full re-render.
function refreshCloudUI() {
  const badge = document.getElementById('cloudStatusBadge');
  if (badge) { const s = cloudStatusMeta(); badge.textContent = s.label; badge.style.background = s.bg; badge.style.color = s.color; }
  const last = document.getElementById('cloudLastSync');
  if (last && typeof Cloud!=='undefined' && Cloud.lastSync) last.textContent = new Date(Cloud.lastSync).toLocaleTimeString();
}

function saveCloudToken() {
  if (typeof Cloud === 'undefined') return;
  const v = document.getElementById('cloudTokenInput')?.value || '';
  Cloud.setToken(v);
  showToast(v.trim() ? 'Sync token saved' : 'Sync token cleared', 'success');
  setTimeout(() => { try { refreshCloudUI(); cloudLoadBackups(); } catch (_) {} }, 400);
}

async function cloudBackupNow() {
  if (typeof Cloud === 'undefined') return;
  const ok = await Cloud.pushNow();
  showToast(ok ? 'Backed up to server' : 'Backup server unreachable', ok ? 'success' : 'error');
  cloudLoadBackups();
}

async function cloudSyncNow() {
  if (typeof Cloud === 'undefined') return;
  await Cloud.pull();
  if (Cloud.status === 'offline') showToast('Backup server unreachable', 'error');
  else showToast('Synced with cloud', 'success');
}

async function cloudLoadBackups() {
  const box = document.getElementById('cloudBackupList');
  if (!box || typeof Cloud === 'undefined') return;
  const list = await Cloud.listBackups();
  if (!list.length) { box.innerHTML = `<div style="padding:16px;text-align:center;color:var(--text-muted);font-size:12.5px">No snapshots yet.</div>`; return; }
  box.innerHTML = list.slice(0, 12).map((b,i) => `
    <div style="display:flex;align-items:center;justify-content:space-between;padding:10px 14px;${i?'border-top:1px solid var(--border)':''}">
      <div style="min-width:0">
        <div style="font-size:12.5px;font-weight:600;color:var(--text-primary)">${new Date(b.savedAt).toLocaleString()}</div>
        <div style="font-size:10.5px;color:var(--text-muted)">${(b.size/1024).toFixed(1)} KB</div>
      </div>
      ${i===0?'<span class="badge-pill badge-success" style="font-size:10px">latest</span>':''}
    </div>`).join('');
}

function uploadLogo(input) {
  const file = input.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    DB.settings.logoUrl = e.target.result;
    showToast('Logo uploaded successfully', 'success');
    navigate('settings');
  };
  reader.readAsDataURL(file);
}

/* ══════════════════════════════════════════════════════════
   EXPENSES & SUPPLIER BILLS
   ══════════════════════════════════════════════════════════ */
function renderExpenses(el) {
  const tab = App.expensesTab || 'expenses';
  const totalExp = DB.expenses.reduce((s,e) => s + e.amount, 0);
  const catBreakdown = DB.expenses.reduce((acc,e) => { acc[e.category]=(acc[e.category]||0)+e.amount; return acc; }, {});

  const supplierBills = DB.supplierBills || [];
  const totalBills = supplierBills.reduce((s,b) => s + b.amount, 0);
  const pendingBills = supplierBills.filter(b => b.status === 'pending').reduce((s,b) => s + b.amount, 0);

  const expenseList = DB.expenses.map(e => `
    <div class="txn-card" style="cursor:default">
      <div class="txn-icon" style="background:var(--pastel-pink);color:#9D174D">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:18px;height:18px"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
      </div>
      <div class="txn-info">
        <div class="txn-name">${esc(e.description)}</div>
        <div class="txn-meta">${e.date} · <span style="background:var(--primary-light);color:var(--primary);font-size:10px;font-weight:700;padding:1px 7px;border-radius:99px">${esc(e.category)}</span></div>
      </div>
      <div class="txn-right">
        <div class="txn-amount" style="color:var(--danger)">${DB.fmt(e.amount)}</div>
      </div>
    </div>`).join('') || '<div style="padding:24px;text-align:center;color:var(--text-muted)">No expenses yet</div>';

  const billList = supplierBills.length ? supplierBills.map(b => `
    <div class="txn-card" style="cursor:default">
      <div class="txn-icon" style="background:var(--pastel-yellow);color:#92400E">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:18px;height:18px"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
      </div>
      <div class="txn-info">
        <div class="txn-name">${b.supplier}</div>
        <div class="txn-meta">${b.date} · Due ${b.dueDate}</div>
      </div>
      <div class="txn-right">
        <div class="txn-amount" style="color:var(--danger)">${DB.fmt(b.amount)}</div>
        <span class="badge-pill ${b.status==='paid'?'badge-success':b.status==='overdue'?'badge-danger':'badge-warning'}">${b.status}</span>
      </div>
    </div>`).join('') : '<div style="padding:24px;text-align:center;color:var(--text-muted)">No supplier bills yet</div>';

  const catItems = Object.entries(catBreakdown).sort((a,b)=>b[1]-a[1]).map(([cat,amt]) => {
    const pct = Math.round(amt/totalExp*100);
    return `<div style="margin-bottom:10px">
      <div style="display:flex;justify-content:space-between;font-size:12.5px;margin-bottom:4px">
        <span style="font-weight:600">${cat}</span><span style="color:var(--text-muted)">${DB.fmt(amt)} (${pct}%)</span>
      </div>
      <div style="height:6px;background:var(--border);border-radius:99px;overflow:hidden">
        <div style="width:${pct}%;height:100%;background:var(--grad-primary);border-radius:99px"></div>
      </div>
    </div>`;
  }).join('');

  el.innerHTML = `
    <!-- Header -->
    <div style="padding:18px 18px 0;display:flex;align-items:center;justify-content:space-between">
      <div>
        <div style="font-size:20px;font-weight:800;color:var(--text-primary)">Expenses</div>
        <div style="font-size:12px;color:var(--text-muted)">Track costs & supplier bills</div>
      </div>
      <button class="btn btn-primary" onclick="openAddExpenseModal()">+ Add</button>
    </div>

    <!-- KPI Cards -->
    <div class="section" style="display:grid;grid-template-columns:1fr 1fr;gap:12px;padding-top:14px">
      <div class="stat-card">
        <div class="stat-icon" style="background:var(--pastel-pink)">
          <svg viewBox="0 0 24 24" fill="none" stroke="#9D174D" stroke-width="2.5" style="width:18px;height:18px"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
        </div>
        <div class="stat-value">${DB.fmt(totalExp)}</div>
        <div class="stat-sub">Total Expenses</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background:var(--pastel-yellow)">
          <svg viewBox="0 0 24 24" fill="none" stroke="#92400E" stroke-width="2.5" style="width:18px;height:18px"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
        </div>
        <div class="stat-value">${DB.fmt(pendingBills)}</div>
        <div class="stat-sub">Bills Due</div>
      </div>
    </div>

    <!-- Tabs -->
    <div class="filter-tabs" style="margin-bottom:8px">
      <div class="cat-pill${tab==='expenses'?' active':''}" onclick="App.expensesTab='expenses';navigate('expenses')">Expenses</div>
      <div class="cat-pill${tab==='bills'?' active':''}" onclick="App.expensesTab='bills';navigate('expenses')">Supplier Bills</div>
      <div class="cat-pill${tab==='report'?' active':''}" onclick="App.expensesTab='report';navigate('expenses')">Report</div>
    </div>

    <!-- Tab content -->
    <div class="section" style="padding-bottom:24px">
      ${tab === 'expenses' ? `
        <div style="display:flex;justify-content:flex-end;margin-bottom:10px">
          <button class="btn btn-primary btn-sm" onclick="openAddExpenseModal()">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="width:13px;height:13px"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Add Expense
          </button>
        </div>
        <div class="card" style="overflow:hidden"><div class="txn-list">${expenseList}</div></div>
      ` : tab === 'bills' ? `
        <div style="display:flex;justify-content:flex-end;margin-bottom:10px">
          <button class="btn btn-primary btn-sm" onclick="openAddBillModal()">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="width:13px;height:13px"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Add Bill
          </button>
        </div>
        <div class="card" style="overflow:hidden"><div class="txn-list">${billList}</div></div>
      ` : renderExpenseReport()}
    </div>`;

  function renderExpenseReport() {
    const now = new Date();
    const selYear  = App.expRepYear  || String(now.getFullYear());
    const selMonth = App.expRepMonth || '';
    const selDay   = App.expRepDay   || '';

    const years  = [...new Set(DB.expenses.map(e => e.date.slice(0,4)))].sort((a,b)=>b-a);
    const months = ['01','02','03','04','05','06','07','08','09','10','11','12'];
    const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

    // Filter expenses
    let filtered = DB.expenses.filter(e => e.date.startsWith(selYear));
    if (selMonth) filtered = filtered.filter(e => e.date.slice(5,7) === selMonth);
    if (selDay)   filtered = filtered.filter(e => e.date.slice(8,10) === selDay.padStart(2,'0'));

    const filtTotal = filtered.reduce((s,e) => s+e.amount, 0);
    const filtCats  = filtered.reduce((acc,e) => { acc[e.category]=(acc[e.category]||0)+e.amount; return acc; }, {});
    const catRows   = Object.entries(filtCats).sort((a,b)=>b[1]-a[1]).map(([c,a])=>`
      <div style="display:flex;justify-content:space-between;font-size:13px;padding:7px 0;border-bottom:1px solid var(--border)">
        <span style="color:var(--text-secondary)">${c}</span><span style="font-weight:700;color:var(--danger)">${DB.fmt(a)}</span>
      </div>`).join('');

    const expRows = filtered.map(e=>`
      <div style="display:flex;justify-content:space-between;align-items:center;font-size:13px;padding:8px 0;border-bottom:1px solid var(--border)">
        <div>
          <div style="font-weight:600;color:var(--text-primary)">${e.description}</div>
          <div style="font-size:11px;color:var(--text-muted)">${e.date} · ${e.category}</div>
        </div>
        <span style="font-weight:700;color:var(--danger)">${DB.fmt(e.amount)}</span>
      </div>`).join('') || '<div style="padding:16px;text-align:center;color:var(--text-muted);font-size:13px">No expenses for this period</div>';

    // Generate days 1-31
    const days = Array.from({length:31},(_,i)=>String(i+1).padStart(2,'0'));

    return `
      <div class="card">
        <div class="card-header"><span class="card-title">Expense Report</span></div>
        <div style="padding:14px 16px;border-bottom:1px solid var(--border)">
          <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:10px">
            <div>
              <label style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:var(--text-muted);display:block;margin-bottom:4px">Year</label>
              <select class="form-control" style="font-size:13px;padding:7px 10px" onchange="App.expRepYear=this.value;App.expRepMonth='';App.expRepDay='';navigate('expenses')">
                ${years.map(y=>`<option ${y===selYear?'selected':''}>${y}</option>`).join('')}
              </select>
            </div>
            <div>
              <label style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:var(--text-muted);display:block;margin-bottom:4px">Month</label>
              <select class="form-control" style="font-size:13px;padding:7px 10px" onchange="App.expRepMonth=this.value;App.expRepDay='';navigate('expenses')">
                <option value="">All Months</option>
                ${months.map((m,i)=>`<option value="${m}" ${m===selMonth?'selected':''}>${monthNames[i]}</option>`).join('')}
              </select>
            </div>
            <div>
              <label style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:var(--text-muted);display:block;margin-bottom:4px">Day</label>
              <select class="form-control" style="font-size:13px;padding:7px 10px" onchange="App.expRepDay=this.value;navigate('expenses')">
                <option value="">All Days</option>
                ${days.map(d=>`<option value="${d}" ${d===selDay?'selected':''}>${parseInt(d)}</option>`).join('')}
              </select>
            </div>
          </div>
          <div style="display:flex;gap:8px">
            <button class="btn btn-primary btn-sm" style="flex:1" onclick="viewExpenseReport()">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:13px;height:13px"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              View Report
            </button>
            <button class="btn btn-ghost btn-sm" style="flex:1" onclick="shareExpenseReport()">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:13px;height:13px"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
              Share
            </button>
          </div>
        </div>
        <div style="padding:14px 16px">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
            <div style="font-size:13px;font-weight:700;color:var(--text-secondary)">${filtered.length} expense${filtered.length!==1?'s':''} found</div>
            <div style="font-size:18px;font-weight:900;color:var(--danger)">${DB.fmt(filtTotal)}</div>
          </div>
          ${catRows ? `<div style="margin-bottom:14px;padding:12px;background:var(--bg);border-radius:var(--r-sm);border:1px solid var(--border)">${catRows}</div>` : ''}
          ${expRows}
        </div>
      </div>`;
  }

  window.viewExpenseReport = function() {
    const selYear  = App.expRepYear  || String(new Date().getFullYear());
    const selMonth = App.expRepMonth || '';
    const selDay   = App.expRepDay   || '';
    const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    let filtered = DB.expenses.filter(e => e.date.startsWith(selYear));
    if (selMonth) filtered = filtered.filter(e => e.date.slice(5,7) === selMonth);
    if (selDay)   filtered = filtered.filter(e => e.date.slice(8,10) === selDay.padStart(2,'0'));
    const total = filtered.reduce((s,e)=>s+e.amount,0);
    const catBreak = filtered.reduce((acc,e)=>{acc[e.category]=(acc[e.category]||0)+e.amount;return acc;},{});
    const periodLabel = selDay ? `${parseInt(selDay)} ${selMonth?months[parseInt(selMonth)-1]+' ':''}${selYear}`
                      : selMonth ? `${months[parseInt(selMonth)-1]} ${selYear}`
                      : `Full Year ${selYear}`;
    const biz = DB.settings;

    openModal(`Expense Report — ${periodLabel}`, `
      <div style="background:#fff;border-radius:12px;overflow:hidden;border:1px solid #eee">
        <div style="background:linear-gradient(135deg,#0D2E2C 0%,#1A5C56 50%,#4ECDC4 100%);padding:20px 24px;display:flex;justify-content:space-between;align-items:center">
          <div>
            <div style="font-size:18px;font-weight:900;color:#fff">${esc(biz.businessName)}</div>
            <div style="font-size:12px;color:rgba(255,255,255,0.65);margin-top:2px">Expense Report</div>
          </div>
          <div style="text-align:right">
            <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:rgba(255,255,255,0.5);margin-bottom:4px">Period</div>
            <div style="font-size:15px;font-weight:800;color:#fff">${periodLabel}</div>
          </div>
        </div>
        <div style="padding:16px 18px;border-bottom:1px solid #f0f0f0">
          <div style="font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:0.8px;color:#14877A;margin-bottom:10px">By Category</div>
          ${Object.entries(catBreak).sort((a,b)=>b[1]-a[1]).map(([c,a])=>`
            <div style="display:flex;justify-content:space-between;font-size:13px;padding:7px 0;border-bottom:1px solid #f5f5f5">
              <span style="color:#555">${c}</span><span style="font-weight:700;color:#DC2626">${DB.fmt(a)}</span>
            </div>`).join('') || '<div style="color:#aaa;text-align:center;padding:10px;font-size:13px">No data</div>'}
        </div>
        <div style="padding:16px 18px;border-bottom:1px solid #f0f0f0">
          <div style="font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:0.8px;color:#14877A;margin-bottom:10px">All Expenses</div>
          ${filtered.map(e=>`
            <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid #f5f5f5">
              <div>
                <div style="font-size:13px;font-weight:600;color:#1a1a1a">${e.description}</div>
                <div style="font-size:11px;color:#aaa">${e.date} · ${e.category}</div>
              </div>
              <span style="font-size:13px;font-weight:700;color:#DC2626">${DB.fmt(e.amount)}</span>
            </div>`).join('') || '<div style="color:#aaa;text-align:center;padding:10px;font-size:13px">No expenses</div>'}
        </div>
        <div style="background:#f8fffe;padding:14px 18px;display:flex;justify-content:space-between;align-items:center">
          <span style="font-size:15px;font-weight:800;color:#1a1a1a">Total</span>
          <span style="font-size:26px;font-weight:900;color:#DC2626">${DB.fmt(total)}</span>
        </div>
        <div style="background:linear-gradient(135deg,#0D2E2C 0%,#1A5C56 50%,#4ECDC4 100%);padding:10px 18px;text-align:center">
          <div style="font-size:11px;color:rgba(255,255,255,0.65)">Generated ${new Date().toLocaleDateString()}</div>
        </div>
      </div>`,
      `<button class="btn btn-secondary" onclick="closeModal()">Close</button>
       <button class="btn btn-ghost" onclick="window.print()">
         <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:14px;height:14px"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
         Print
       </button>
       <button class="btn btn-primary" onclick="shareExpenseReport()">
         <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:14px;height:14px"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
         Share
       </button>`, 'modal-lg');
  };

  window.shareExpenseReport = function() {
    const selYear  = App.expRepYear  || String(new Date().getFullYear());
    const selMonth = App.expRepMonth || '';
    const selDay   = App.expRepDay   || '';
    const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    let filtered = DB.expenses.filter(e => e.date.startsWith(selYear));
    if (selMonth) filtered = filtered.filter(e => e.date.slice(5,7) === selMonth);
    if (selDay)   filtered = filtered.filter(e => e.date.slice(8,10) === selDay.padStart(2,'0'));
    const total = filtered.reduce((s,e)=>s+e.amount,0);
    const periodLabel = selDay ? `${parseInt(selDay)} ${selMonth?months[parseInt(selMonth)-1]+' ':''}${selYear}`
                      : selMonth ? `${months[parseInt(selMonth)-1]} ${selYear}`
                      : `Full Year ${selYear}`;
    const catBreak = filtered.reduce((acc,e)=>{acc[e.category]=(acc[e.category]||0)+e.amount;return acc;},{});
    const lines = Object.entries(catBreak).map(([c,a])=>`  ${c}: ${DB.fmt(a)}`).join('\n');
    const text = `📊 Expense Report — ${periodLabel}\n${DB.settings.businessName}\n\nBy Category:\n${lines}\n\nTotal: ${DB.fmt(total)}`;
    if (navigator.share) {
      navigator.share({ title: `Expense Report ${periodLabel}`, text }).catch(()=>{});
    } else {
      navigator.clipboard.writeText(text).then(()=>showToast('Report copied to clipboard','success'));
    }
  };
}

function openAddExpenseModal() {
  const cats = ['Rent','Utilities','Supplies','Salaries','Marketing','Maintenance','Other'];
  openModal('Add Expense', `
    <div style="display:flex;flex-direction:column;gap:14px">
      <div class="form-group"><label class="form-label">Description</label><input id="expDesc" type="text" class="form-control" placeholder="e.g. Monthly rent" /></div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Category</label>
          <select id="expCat" class="form-control">${cats.map(c=>`<option>${c}</option>`).join('')}</select>
        </div>
        <div class="form-group"><label class="form-label">Amount (${DB.settings.currency})</label><input id="expAmt" type="number" class="form-control" placeholder="0.00" min="0" step="0.01" /></div>
      </div>
      <div class="form-group"><label class="form-label">Date</label><input id="expDate" type="date" class="form-control" value="${new Date().toISOString().split('T')[0]}" /></div>
    </div>`,
    `<button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
     <button class="btn btn-primary" onclick="saveExpense()">Save Expense</button>`);
}

function saveExpense() {
  const desc = cleanText(document.getElementById('expDesc').value);
  const cat  = document.getElementById('expCat').value;
  const amt  = parseFloat(document.getElementById('expAmt').value);
  const date = document.getElementById('expDate').value;
  if (!desc || !amt || amt <= 0) { showToast('Please fill all fields', 'error'); return; }
  DB.addExpense({ description: desc, category: cat, amount: amt, date });
  closeModal();
  showToast('Expense added', 'success');
  navigate('expenses');
}

function openAddBillModal() {
  openModal('Add Supplier Bill', `
    <div style="display:flex;flex-direction:column;gap:14px">
      <div class="form-group"><label class="form-label">Supplier Name</label><input id="billSupplier" type="text" class="form-control" placeholder="e.g. ABC Wholesalers" /></div>
      <div class="form-row">
        <div class="form-group"><label class="form-label">Amount (${DB.settings.currency})</label><input id="billAmt" type="number" class="form-control" placeholder="0.00" min="0" step="0.01" /></div>
        <div class="form-group">
          <label class="form-label">Status</label>
          <select id="billStatus" class="form-control"><option value="pending">Pending</option><option value="paid">Paid</option><option value="overdue">Overdue</option></select>
        </div>
      </div>
      <div class="form-row">
        <div class="form-group"><label class="form-label">Bill Date</label><input id="billDate" type="date" class="form-control" value="${new Date().toISOString().split('T')[0]}" /></div>
        <div class="form-group"><label class="form-label">Due Date</label><input id="billDue" type="date" class="form-control" value="${new Date(Date.now()+14*86400000).toISOString().split('T')[0]}" /></div>
      </div>
    </div>`,
    `<button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
     <button class="btn btn-primary" onclick="saveBill()">Add Bill</button>`);
}

function saveBill() {
  const supplier = document.getElementById('billSupplier').value.trim();
  const amt    = parseFloat(document.getElementById('billAmt').value);
  const status = document.getElementById('billStatus').value;
  const date   = document.getElementById('billDate').value;
  const due    = document.getElementById('billDue').value;
  if (!supplier || !amt || amt <= 0) { showToast('Please fill all fields', 'error'); return; }
  if (!DB.supplierBills) DB.supplierBills = [];
  DB.supplierBills.unshift({ id: `BILL-${String(DB.supplierBills.length+1).padStart(3,'0')}`, supplier, amount: amt, status, date, dueDate: due });
  closeModal();
  showToast('Bill added', 'success');
  navigate('expenses');
}

/* ══════════════════════════════════════════════════════════
   SUPPLIER INVOICES
   ══════════════════════════════════════════════════════════ */
function renderSupplierInvoices(el) {
  const invs = DB.supplierInvoices || [];
  const total = invs.reduce((s,i) => s + i.total, 0);
  const pending = invs.filter(i => i.status === 'pending').reduce((s,i) => s + i.total, 0);

  const rows = invs.map(inv => {
    const statusColor = inv.status === 'received' ? 'badge-success' : inv.status === 'partial' ? 'badge-warning' : 'badge-info';
    return `<div class="txn-card" onclick="viewSupplierInvoice('${inv.id}')" style="cursor:pointer">
      <div class="txn-icon" style="background:var(--pastel-yellow);color:#92400E">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:18px;height:18px"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
      </div>
      <div class="txn-info">
        <div class="txn-name">${esc(inv.supplier)}</div>
        <div class="txn-meta">${inv.date} · Ref: ${inv.reference} · ${inv.items.length} line${inv.items.length!==1?'s':''}</div>
      </div>
      <div class="txn-right">
        <div class="txn-amount">${DB.fmt(inv.total)}</div>
        <span class="badge-pill ${statusColor}">${inv.status}</span>
      </div>
    </div>`;
  }).join('') || `<div style="padding:32px;text-align:center;color:var(--text-muted)">No supplier invoices yet</div>`;

  el.innerHTML = `
    <div style="padding:18px 18px 0;display:flex;align-items:center;justify-content:space-between">
      <div>
        <div style="font-size:20px;font-weight:800;color:var(--text-primary)">Supplier Invoices</div>
        <div style="font-size:12px;color:var(--text-muted)">Stock purchases from suppliers</div>
      </div>
      <button class="btn btn-primary" onclick="openNewSupplierInvoice()">+ New</button>
    </div>

    <div class="section" style="display:grid;grid-template-columns:1fr 1fr;gap:12px;padding-top:14px">
      <div class="stat-card">
        <div class="stat-icon" style="background:var(--pastel-teal)">
          <svg viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2.5" style="width:18px;height:18px"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
        </div>
        <div class="stat-value">${invs.length}</div>
        <div class="stat-sub">Total Invoices</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background:var(--pastel-yellow)">
          <svg viewBox="0 0 24 24" fill="none" stroke="#92400E" stroke-width="2.5" style="width:18px;height:18px"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
        </div>
        <div class="stat-value">${DB.fmt(pending)}</div>
        <div class="stat-sub">Pending Value</div>
      </div>
    </div>

    <div class="section" style="padding-bottom:24px">
      <div class="card" style="overflow:hidden">
        <div class="card-header">
          <span class="card-title">All Invoices</span>
          <span style="font-size:12px;color:var(--text-muted)">${DB.fmt(total)} total</span>
        </div>
        <div class="txn-list">${rows}</div>
      </div>
    </div>`;
}

function viewSupplierInvoice(id) {
  const inv = (DB.supplierInvoices || []).find(i => i.id === id);
  if (!inv) return;
  const statusColor = inv.status === 'received' ? 'badge-success' : inv.status === 'partial' ? 'badge-warning' : 'badge-info';
  const itemRows = inv.items.map(it => `
    <tr>
      <td>${it.productName}</td>
      <td style="text-align:center">${it.qty}</td>
      <td style="text-align:right">${DB.fmt(it.unitCost)}</td>
      <td style="text-align:right;font-weight:700">${DB.fmt(it.total)}</td>
    </tr>`).join('');

  openModal(`Supplier Invoice — ${inv.id}`, `
    ${DB.settings.logoUrl ? `<div style="text-align:center;margin-bottom:12px"><img src="${DB.settings.logoUrl}" style="height:48px;width:auto;object-fit:contain;border-radius:8px" /></div>` : ''}
    <div style="background:linear-gradient(135deg,#1A3A2C,#1A5C56,#4ECDC4);border-radius:12px;padding:18px 20px;margin-bottom:16px;color:#fff;display:flex;justify-content:space-between;align-items:center">
      <div>
        <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;opacity:.5;margin-bottom:4px">Supplier Invoice</div>
        <div style="font-size:18px;font-weight:900">${inv.id}</div>
        <div style="font-size:12px;opacity:.6;margin-top:4px">${inv.date} · Ref: ${inv.reference}</div>
      </div>
      <span class="badge-pill ${statusColor}">${inv.status}</span>
    </div>
    <div style="background:var(--bg);border-radius:var(--r);padding:12px 14px;margin-bottom:14px;border:1px solid var(--border)">
      <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.8px;color:var(--text-muted);margin-bottom:4px">Supplier</div>
      <div style="font-size:15px;font-weight:700">${esc(inv.supplier)}</div>
    </div>
    <div class="table-wrapper" style="margin-bottom:14px">
      <table>
        <thead><tr><th>Item</th><th style="text-align:center">Qty</th><th style="text-align:right">Unit Cost</th><th style="text-align:right">Total</th></tr></thead>
        <tbody>${itemRows}</tbody>
      </table>
    </div>
    <div style="background:var(--bg);border-radius:var(--r);padding:14px;border:1px solid var(--border)">
      <div style="display:flex;justify-content:space-between;align-items:center">
        <span style="font-size:15px;font-weight:700">Total</span>
        <span style="font-size:22px;font-weight:900;color:var(--primary)">${DB.fmt(inv.total)}</span>
      </div>
    </div>`,
    `<button class="btn btn-secondary" onclick="closeModal()">Close</button>
     <button class="btn btn-danger" style="background:var(--danger);color:#fff;border:none" onclick="deleteSupplierInvoice('${inv.id}')">
       <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:14px;height:14px"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
       Delete
     </button>
     <button class="btn btn-primary" onclick="shareSupplierInvoice('${inv.id}')">
       <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:14px;height:14px"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
       Share
     </button>`);
}

function deleteSupplierInvoice(id) {
  openModal('Delete Bill', '<p style="color:var(--text-secondary);font-size:14px">Are you sure you want to delete this supplier invoice? This cannot be undone.</p>',
    `<button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
     <button class="btn btn-danger" onclick="confirmDeleteSupplierInvoice('${id}')">Delete</button>`);
}
function confirmDeleteSupplierInvoice(id) {
  DB.supplierInvoices = (DB.supplierInvoices || []).filter(i => i.id !== id);
  closeModal();
  showToast('Supplier invoice deleted', 'success');
  navigate('supplier-invoices');
}

function shareSupplierInvoice(id) {
  const inv = (DB.supplierInvoices || []).find(i => i.id === id);
  if (!inv) return;
  const text = `Supplier Invoice ${inv.id}\nSupplier: ${inv.supplier}\nRef: ${inv.reference}\nDate: ${inv.date}\nTotal: ${DB.fmt(inv.total)}\nStatus: ${inv.status}`;
  if (navigator.share) {
    navigator.share({ title: `Supplier Invoice ${inv.id}`, text }).catch(() => {});
  } else {
    navigator.clipboard.writeText(text).then(() => showToast('Copied to clipboard', 'success'));
  }
}

function openNewSupplierInvoice() {
  // Build initial state
  const siItems = []; // { productId, productName, qty, unitCost }

  function renderSIModal() {
    const rows = siItems.map((it, idx) => `
      <tr>
        <td style="font-size:13px;font-weight:600">${it.productName}</td>
        <td><input type="number" value="${it.qty}" min="1" style="width:60px;border:1px solid var(--border);border-radius:6px;padding:4px 6px;font-size:13px" onchange="siItems[${idx}].qty=parseInt(this.value)||1;siItems[${idx}].total=siItems[${idx}].qty*siItems[${idx}].unitCost;refreshSI()" /></td>
        <td><input type="number" value="${it.unitCost}" min="0" step="0.01" style="width:75px;border:1px solid var(--border);border-radius:6px;padding:4px 6px;font-size:13px" onchange="siItems[${idx}].unitCost=parseFloat(this.value)||0;siItems[${idx}].total=siItems[${idx}].qty*siItems[${idx}].unitCost;refreshSI()" /></td>
        <td style="font-weight:700;font-size:13px;text-align:right">${DB.fmt(it.qty * it.unitCost)}</td>
        <td><span onclick="siItems.splice(${idx},1);refreshSI()" style="cursor:pointer;color:var(--danger);font-size:18px;line-height:1">×</span></td>
      </tr>`).join('') || `<tr><td colspan="5" style="text-align:center;padding:12px;color:var(--text-muted);font-size:13px">No items added yet</td></tr>`;

    const grandTotal = siItems.reduce((s,i) => s + i.qty * i.unitCost, 0);

    document.getElementById('modalBody').innerHTML = `
      <div style="display:flex;flex-direction:column;gap:14px">
        <div class="form-row">
          <div class="form-group"><label class="form-label">Supplier Name</label><input id="siSupplier" type="text" class="form-control" placeholder="e.g. ABC Wholesale" /></div>
          <div class="form-group"><label class="form-label">Reference / PO #</label><input id="siRef" type="text" class="form-control" placeholder="PO-XXXX" /></div>
        </div>
        <div class="form-row">
          <div class="form-group"><label class="form-label">Invoice Date</label><input id="siDate" type="date" class="form-control" value="${new Date().toISOString().split('T')[0]}" /></div>
          <div class="form-group"><label class="form-label">Status</label>
            <select id="siStatus" class="form-control"><option value="pending">Pending</option><option value="received">Received</option><option value="partial">Partial</option></select>
          </div>
        </div>

        <div>
          <div style="font-size:13px;font-weight:700;margin-bottom:8px;color:var(--text-primary)">Items</div>
          <div style="overflow-x:auto">
            <table style="width:100%;font-size:13px;border-collapse:collapse">
              <thead><tr style="border-bottom:2px solid var(--border)">
                <th style="text-align:left;padding:6px 4px">Product</th>
                <th style="text-align:left;padding:6px 4px">Qty</th>
                <th style="text-align:left;padding:6px 4px">Unit Cost</th>
                <th style="text-align:right;padding:6px 4px">Total</th>
                <th></th>
              </tr></thead>
              <tbody id="siItemRows">${rows}</tbody>
            </table>
          </div>
          ${grandTotal > 0 ? `<div style="text-align:right;font-size:15px;font-weight:800;color:var(--primary);margin-top:8px;padding-top:8px;border-top:2px solid var(--border)">Grand Total: ${DB.fmt(grandTotal)}</div>` : ''}
        </div>

        <div style="display:flex;gap:8px">
          <button class="btn btn-secondary" style="flex:1" onclick="openAddSIItem()">+ Add Existing Product</button>
          <button class="btn btn-ghost" style="flex:1;border:1.5px dashed var(--border-md)" onclick="openCreateNewSIProduct()">+ Create New Product</button>
        </div>
      </div>`;

    document.getElementById('modalFooter').innerHTML = `
      <button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
      <button class="btn btn-primary" onclick="saveSupplierInvoice()">Save &amp; Update Stock</button>`;
  }

  window.siItems = siItems;
  window.refreshSI = renderSIModal;

  openModal('New Supplier Invoice', '', '', 'modal-lg');
  renderSIModal();
}

function openAddSIItem() {
  const prods = DB.products.map(p =>
    `<div onclick="addSIItemProduct('${p.id}','${p.name.replace(/'/g,"\\'")}',${p.cost||0})" style="display:flex;align-items:center;gap:10px;padding:10px 14px;cursor:pointer;border-bottom:1px solid var(--border);transition:var(--t)" onmouseover="this.style.background='var(--primary-light)'" onmouseout="this.style.background=''">
      <span style="font-size:20px">${p.emoji}</span>
      <span style="flex:1;font-size:13px;font-weight:600">${p.name}</span>
      <span style="font-size:11px;color:var(--text-muted)">${p.sku}</span>
      <span style="font-size:13px;font-weight:700;color:var(--primary)">${DB.fmt(p.cost||0)}</span>
    </div>`).join('');

  openModal('Select Product', `<div style="max-height:380px;overflow-y:auto">${prods}</div>`,
    `<button class="btn btn-secondary" onclick="closeModal();openNewSupplierInvoice._restore&&openNewSupplierInvoice._restore()">Back</button>`);

  window.addSIItemProduct = (id, name, cost) => {
    const existing = window.siItems.find(i => i.productId === id);
    if (existing) { existing.qty++; existing.total = existing.qty * existing.unitCost; }
    else window.siItems.push({ productId: id, productName: name, qty: 1, unitCost: cost, total: cost });
    closeModal();
    openModal('New Supplier Invoice', '', '', 'modal-lg');
    window.refreshSI();
  };
}

function openCreateNewSIProduct() {
  const cats = DB.categories.filter(c => c !== 'All');
  openModal('Create New Product', `
    <div style="display:flex;flex-direction:column;gap:14px">
      <div class="form-row">
        <div class="form-group"><label class="form-label">Product Name</label><input id="newProdName" type="text" class="form-control" placeholder="e.g. Espresso Beans 1kg" /></div>
        <div class="form-group"><label class="form-label">Emoji</label><input id="newProdEmoji" type="text" class="form-control" placeholder="☕" style="font-size:20px" maxlength="2" /></div>
      </div>
      <div class="form-row">
        <div class="form-group"><label class="form-label">Category</label>
          <select id="newProdCat" class="form-control">${cats.map(c=>`<option>${c}</option>`).join('')}</select>
        </div>
        <div class="form-group"><label class="form-label">SKU</label><input id="newProdSku" type="text" class="form-control" placeholder="XX-000" /></div>
      </div>
      <div class="form-row">
        <div class="form-group"><label class="form-label">Selling Price</label><input id="newProdPrice" type="number" class="form-control" placeholder="0.00" min="0" step="0.01" /></div>
        <div class="form-group"><label class="form-label">Cost Price</label><input id="newProdCost" type="number" class="form-control" placeholder="0.00" min="0" step="0.01" /></div>
      </div>
      <div class="form-row">
        <div class="form-group"><label class="form-label">Initial Stock (from this invoice)</label><input id="newProdStock" type="number" class="form-control" placeholder="0" min="0" /></div>
        <div class="form-group"><label class="form-label">Min Stock Alert</label><input id="newProdMin" type="number" class="form-control" placeholder="5" min="0" /></div>
      </div>
    </div>`,
    `<button class="btn btn-secondary" onclick="closeModal();openModal('New Supplier Invoice','','','modal-lg');window.refreshSI()">Back</button>
     <button class="btn btn-primary" onclick="saveNewSIProduct()">Create &amp; Add to Invoice</button>`);
}

function saveNewSIProduct() {
  const name  = document.getElementById('newProdName').value.trim();
  const emoji = document.getElementById('newProdEmoji').value.trim() || '📦';
  const cat   = document.getElementById('newProdCat').value;
  const sku   = document.getElementById('newProdSku').value.trim() || `XX-${String(DB.products.length+1).padStart(3,'0')}`;
  const price = parseFloat(document.getElementById('newProdPrice').value) || 0;
  const cost  = parseFloat(document.getElementById('newProdCost').value) || 0;
  const stock = parseInt(document.getElementById('newProdStock').value) || 0;
  const minSt = parseInt(document.getElementById('newProdMin').value) || 5;
  if (!name) { showToast('Product name required', 'error'); return; }

  const newId = `P${String(DB.products.length + 1).padStart(3, '0')}`;
  DB.products.push({ id: newId, name, emoji, category: cat, price, cost, stock: 0, minStock: minSt, sku });

  window.siItems.push({ productId: newId, productName: name, qty: stock || 1, unitCost: cost, total: (stock||1) * cost });
  closeModal();
  openModal('New Supplier Invoice', '', '', 'modal-lg');
  window.refreshSI();
  showToast(`Product "${name}" created`, 'success');
}

function saveSupplierInvoice() {
  const supplier = cleanText(document.getElementById('siSupplier')?.value);
  const ref      = cleanText(document.getElementById('siRef')?.value);
  const date     = document.getElementById('siDate')?.value;
  const status   = document.getElementById('siStatus')?.value;

  if (!supplier) { showToast('Supplier name required', 'error'); return; }
  if (!window.siItems || window.siItems.length === 0) { showToast('Add at least one item', 'error'); return; }

  const items = window.siItems.map(it => ({ ...it, total: it.qty * it.unitCost }));
  const total = items.reduce((s, i) => s + i.total, 0);
  const invId = `SINV-${String((DB.nextSInvId || 1)).padStart(3, '0')}`;
  DB.nextSInvId = (DB.nextSInvId || 1) + 1;

  DB.supplierInvoices = DB.supplierInvoices || [];
  DB.supplierInvoices.unshift({ id: invId, date, supplier, reference: ref || '—', status, total, items });

  // Update stock for all items
  if (status === 'received' || status === 'partial') {
    items.forEach(it => {
      const p = DB.products.find(x => x.id === it.productId);
      if (p) { p.stock += it.qty; DB.logStock(p.id, +it.qty, 'received', `Supplier: ${supplier}`); }
    });
    showToast(`Stock updated for ${items.length} product${items.length !== 1 ? 's' : ''}`, 'success');
  }

  closeModal();
  showToast(`Supplier invoice ${invId} saved`, 'success');
  navigate('supplier-invoices');
}

/* ══════════════════════════════════════════════════════════
   GENERAL — CREATE NEW ITEM
   ══════════════════════════════════════════════════════════ */
function openAddProductModal() {
  const existingCats = DB.categories.filter(c => c !== 'All');

  function renderModal() {
    const cats = DB.categories.filter(c => c !== 'All');
    document.getElementById('modalBody').innerHTML = `
      <div style="display:flex;flex-direction:column;gap:14px">

        <div class="form-group">
          <label class="form-label">Item Name <span style="color:var(--danger)">*</span></label>
          <input id="apName" type="text" class="form-control" placeholder="e.g. Espresso" />
        </div>

        <div class="form-group">
          <label class="form-label">Category <span style="color:var(--danger)">*</span></label>
          <div style="display:flex;gap:8px">
            <select id="apCat" class="form-control">${cats.map(c=>`<option>${c}</option>`).join('')}</select>
            <button class="btn btn-secondary" style="white-space:nowrap;flex-shrink:0" onclick="promptNewCategory()">+ New</button>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">SKU</label>
            <input id="apSku" type="text" class="form-control" placeholder="e.g. FD-001" />
          </div>
          <div class="form-group">
            <label class="form-label">Barcode <span style="font-weight:500;color:var(--text-muted)">(scannable)</span></label>
            <input id="apBarcode" type="text" class="form-control" placeholder="e.g. 8901234500017" />
          </div>
        </div>

        <div style="background:var(--primary-light);border-radius:var(--r);padding:14px;border:1px solid rgba(245,200,66,0.15)">
          <div style="font-size:13px;font-weight:700;color:var(--primary);margin-bottom:12px">Pricing</div>
          <div class="form-row" style="margin-bottom:10px">
            <div class="form-group">
              <label class="form-label">Cost Price (${DB.settings.currency}) <span style="color:var(--danger)">*</span></label>
              <input id="apCost" type="number" class="form-control" placeholder="0.00" min="0" step="0.01"
                oninput="recalcMinPrice()" />
            </div>
            <div class="form-group">
              <label class="form-label">Profit Margin (%)</label>
              <input id="apProfit" type="number" class="form-control" placeholder="e.g. 30" min="0" step="0.1"
                oninput="recalcMinPrice()" />
            </div>
          </div>
          <div class="form-group" style="margin-bottom:0">
            <label class="form-label">Min. Sale Price (auto-calculated)</label>
            <div style="position:relative">
              <input id="apMinPrice" type="number" class="form-control" placeholder="0.00" min="0" step="0.01"
                style="background:var(--surface);font-weight:700;color:var(--primary)" />
              <span style="position:absolute;right:12px;top:50%;transform:translateY(-50%);font-size:11px;color:var(--text-muted);pointer-events:none">min</span>
            </div>
            <div id="apPriceNote" style="font-size:11px;color:var(--text-muted);margin-top:4px"></div>
          </div>
          <div class="form-group" style="margin-top:10px;margin-bottom:0">
            <label class="form-label">Selling Price (${DB.settings.currency}) <span style="color:var(--danger)">*</span></label>
            <input id="apPrice" type="number" class="form-control" placeholder="0.00" min="0" step="0.01" />
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Initial Stock</label>
            <input id="apStock" type="number" class="form-control" placeholder="0" min="0" />
          </div>
          <div class="form-group">
            <label class="form-label">Low Stock Alert</label>
            <input id="apMin" type="number" class="form-control" placeholder="5" min="0" />
          </div>
        </div>

        <div style="background:var(--surface);border:1.5px solid var(--border-md);border-radius:var(--r);padding:14px">
          <label style="display:flex;align-items:flex-start;gap:12px;cursor:pointer">
            <div style="position:relative;margin-top:2px">
              <input type="checkbox" id="apGst" style="width:18px;height:18px;accent-color:var(--primary);cursor:pointer" />
            </div>
            <div>
              <div style="font-size:14px;font-weight:700;color:var(--text-primary)">Item includes GST (Tax)</div>
              <div style="font-size:12px;color:var(--text-muted);margin-top:2px">
                Tick this if this item is subject to GST (${DB.settings.taxRate}%). When selling, GST will be calculated on top of the price.
              </div>
            </div>
          </label>
        </div>

      </div>`;

    document.getElementById('modalFooter').innerHTML = `
      <button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
      <button class="btn btn-primary" onclick="saveNewProduct()">Save Item</button>`;
  }

  window.recalcMinPrice = function() {
    const cost   = parseFloat(document.getElementById('apCost')?.value) || 0;
    const profit = parseFloat(document.getElementById('apProfit')?.value) || 0;
    const min    = cost + (cost * profit / 100);
    const el     = document.getElementById('apMinPrice');
    const note   = document.getElementById('apPriceNote');
    if (el) el.value = min > 0 ? min.toFixed(2) : '';
    if (note && cost > 0) {
      note.textContent = profit > 0
        ? `Cost ${DB.fmt(cost)} + ${profit}% margin = Min sale ${DB.fmt(min)}`
        : `Enter a profit % to auto-calculate the minimum sale price`;
    }
    // also suggest selling price if empty
    const priceEl = document.getElementById('apPrice');
    if (priceEl && !priceEl.value && min > 0) priceEl.value = min.toFixed(2);
  };

  window.promptNewCategory = function() {
    // Save current field values before re-rendering
    const savedName  = document.getElementById('apName')?.value || '';
    const savedSku   = document.getElementById('apSku')?.value || '';
    const savedCost  = document.getElementById('apCost')?.value || '';
    const savedProfit= document.getElementById('apProfit')?.value || '';
    const savedPrice = document.getElementById('apPrice')?.value || '';
    const savedStock = document.getElementById('apStock')?.value || '';
    const savedMin   = document.getElementById('apMin')?.value || '';

    openModal('New Category', `
      <div class="form-group">
        <label class="form-label">Category Name <span style="color:var(--danger)">*</span></label>
        <input id="newCatName" type="text" class="form-control" placeholder="e.g. Beverages" autofocus />
      </div>`,
      `<button class="btn btn-secondary" onclick="openAddProductModal()">Cancel</button>
       <button class="btn btn-primary" onclick="
         const v=document.getElementById('newCatName').value.trim();
         if(!v){showToast('Enter a category name','error');return;}
         if(!DB.categories.includes(v)) DB.categories.push(v);
         showToast('Category added','success');
         openAddProductModal();
         setTimeout(()=>{
           const s=document.getElementById('apCat'); if(s) s.value=v;
           const n=document.getElementById('apName'); if(n) n.value='${savedName}';
           const sk=document.getElementById('apSku'); if(sk) sk.value='${savedSku}';
           const c=document.getElementById('apCost'); if(c) c.value='${savedCost}';
           const pr=document.getElementById('apProfit'); if(pr) pr.value='${savedProfit}';
           const p=document.getElementById('apPrice'); if(p) p.value='${savedPrice}';
           const st=document.getElementById('apStock'); if(st) st.value='${savedStock}';
           const m=document.getElementById('apMin'); if(m) m.value='${savedMin}';
         },50);
       ">Save Category</button>`
    );
  };

  openModal('Create New Item', '', '', 'modal-lg');
  renderModal();
}

function saveNewProduct() {
  const name   = cleanText(document.getElementById('apName')?.value);
  const emoji  = (name || '?').charAt(0).toUpperCase();   // letter badge, consistent with the rest of the app
  const cat    = document.getElementById('apCat')?.value;
  const sku    = document.getElementById('apSku')?.value.trim() || `XX-${String(DB.products.length+1).padStart(3,'0')}`;
  const barcode= cleanText(document.getElementById('apBarcode')?.value);
  const cost   = parseFloat(document.getElementById('apCost')?.value) || 0;
  const price  = parseFloat(document.getElementById('apPrice')?.value) || 0;
  const stock  = parseInt(document.getElementById('apStock')?.value) || 0;
  const minSt  = parseInt(document.getElementById('apMin')?.value) || 5;
  const hasGst = document.getElementById('apGst')?.checked || false;
  const minPrice = parseFloat(document.getElementById('apMinPrice')?.value) || 0;

  if (!name) { showToast('Item name is required', 'error'); return; }
  if (price <= 0) { showToast('Selling price must be greater than 0', 'error'); return; }
  if (minPrice > 0 && price < minPrice) {
    showToast(`Selling price (${DB.fmt(price)}) is below minimum (${DB.fmt(minPrice)})`, 'error');
    return;
  }

  // Collision-safe ID: one past the highest existing P-number.
  const maxP = DB.products.reduce((m,p) => Math.max(m, parseInt(String(p.id).replace(/\D/g,'')) || 0), 0);
  const newId = `P${String(maxP + 1).padStart(3, '0')}`;
  DB.products.push({
    id: newId, name, emoji, category: cat,
    price, cost, stock, minStock: minSt, sku, barcode,
    hasGst, minPrice: minPrice || undefined,
  });
  if (stock > 0) DB.logStock(newId, stock, 'new', 'Initial stock');

  closeModal();
  showToast(`"${name}" added to inventory`, 'success');
  navigate('inventory');
}

function openChangePasswordModal() {
  openModal('Change Password', `
    <div style="display:flex;flex-direction:column;gap:14px">
      <div class="form-group"><label class="form-label">Current Password</label><input type="password" class="form-control" placeholder="••••••••" /></div>
      <div class="form-group"><label class="form-label">New Password</label><input type="password" class="form-control" placeholder="••••••••" /></div>
      <div class="form-group"><label class="form-label">Confirm Password</label><input type="password" class="form-control" placeholder="••••••••" /></div>
    </div>`,
    `<button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
     <button class="btn btn-primary" onclick="closeModal();showToast('Password updated','success')">Update Password</button>`);
}

/* ══════════════════════════════════════════════════════════
   MODAL
   ══════════════════════════════════════════════════════════ */
let _modalLastFocus = null;
function openModal(title, body, footer='', sizeClass='') {
  const modal = document.getElementById('modal');
  modal.className = 'modal' + (sizeClass ? ' ' + sizeClass : '');
  document.getElementById('modalTitle').textContent = title;
  document.getElementById('modalBody').innerHTML    = body;
  document.getElementById('modalFooter').innerHTML  = footer || '<button class="btn btn-secondary" onclick="closeModal()">Close</button>';
  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
  document.getElementById('modalBackdrop').classList.add('open');
  // Remember what had focus so we can restore it, then move focus into the dialog.
  _modalLastFocus = document.activeElement;
  setTimeout(() => {
    const bodyEl = document.getElementById('modalBody');
    // Prefer the first form field in the body; fall back to the primary action.
    const focusable = bodyEl.querySelector('input:not([type=hidden]):not([disabled]), select:not([disabled]), textarea:not([disabled])')
      || modal.querySelector('.modal-footer button.btn-primary, .modal-footer button')
      || modal.querySelector('button');
    if (focusable) focusable.focus();
  }, 30);
}
function closeModal() {
  const modal = document.getElementById('modal');
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden', 'true');
  document.getElementById('modalBackdrop').classList.remove('open');
  if (typeof stopScanStream === 'function') stopScanStream();   // release camera if a scan modal was open
  // Restore focus to the control that opened the dialog (accessibility).
  if (_modalLastFocus && typeof _modalLastFocus.focus === 'function') {
    try { _modalLastFocus.focus(); } catch (_) {}
  }
  _modalLastFocus = null;
}
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('modalClose')?.addEventListener('click', closeModal);
  document.getElementById('modalBackdrop')?.addEventListener('click', closeModal);
});
// Escape closes any open modal; keeps focus trapped within an open dialog (Tab cycle).
document.addEventListener('keydown', (e) => {
  const modal = document.getElementById('modal');
  if (!modal || !modal.classList.contains('open')) return;
  if (e.key === 'Escape') { closeModal(); return; }
  if (e.key === 'Tab') {
    const items = [...modal.querySelectorAll('input:not([type=hidden]):not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])')]
      .filter(el => el.offsetParent !== null);
    if (!items.length) return;
    const first = items[0], last = items[items.length-1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }
});

/* ══════════════════════════════════════════════════════════
   TOAST
   ══════════════════════════════════════════════════════════ */
function showToast(msg, type='info') {
  const icons = {
    success: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>',
    error:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',
    warning: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/></svg>',
    info:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>',
  };
  const t = document.createElement('div');
  t.className = `toast ${type}`;
  t.innerHTML = (icons[type]||icons.info) + `<span>${msg}</span>`;
  document.getElementById('toastContainer').appendChild(t);
  setTimeout(() => { t.style.animation='toastOut .3s forwards'; setTimeout(()=>t.remove(),300); }, 3500);
}
