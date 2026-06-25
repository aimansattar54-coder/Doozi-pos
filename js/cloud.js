/* ============================================================
   Doozi POS — Cloud sync client
   ------------------------------------------------------------
   Talks to the local backup server (server.js) on the same
   origin. Auto-syncs: pushes a debounced snapshot after every
   change and pulls the newest copy on load (last-write-wins via
   DB._meta.updatedAt). Degrades silently to local-only when the
   server isn't reachable.
   ============================================================ */
'use strict';

const Cloud = {
  status: 'idle',      // 'idle' | 'syncing' | 'saved' | 'offline'
  lastSync: 0,
  _timer: null,
  _base: null,         // resolved API base ('' = same origin, or http://localhost:3590)
  _ready: false,       // true once the initial pull has reconciled with the cloud
  _pendingPush: false, // a change happened before we were ready → push once ready

  // Candidate backends: same origin first (Node server.js), then the local
  // PowerShell backup server on its default port.
  _candidates() { return ['', 'http://localhost:3590']; },

  isEnabled() { return localStorage.getItem('doozi_cloud_off') !== '1'; },
  // Optional shared secret sent as X-Backup-Token (must match the server's
  // DOOZI_BACKUP_TOKEN). Empty = no token (server must also be open).
  _token() { return localStorage.getItem('doozi_cloud_token') || ''; },
  setToken(v) {
    const t = String(v || '').trim();
    if (t) localStorage.setItem('doozi_cloud_token', t);
    else   localStorage.removeItem('doozi_cloud_token');
    Cloud._base = null; Cloud._ready = false;   // re-resolve + re-reconcile with the new credential
    Cloud.init();
  },
  setEnabled(on) {
    if (on) localStorage.removeItem('doozi_cloud_off');
    else    localStorage.setItem('doozi_cloud_off', '1');
    if (on) Cloud.init(); else Cloud._set('idle');
  },

  _set(s) {
    Cloud.status = s;
    if (typeof refreshCloudUI === 'function') { try { refreshCloudUI(); } catch (_) {} }
  },

  // fetch with a hard timeout so a hung/unreachable server can never block the
  // app indefinitely (the request aborts and we fall back to local-only).
  async _fetch(url, opts, ms) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), ms || 6000);
    const o = { ...(opts || {}), signal: ctrl.signal };
    const tok = Cloud._token();
    if (tok) o.headers = { ...(o.headers || {}), 'X-Backup-Token': tok };
    try { return await fetch(url, o); }
    finally { clearTimeout(timer); }
  },

  // Probe candidates for a reachable /api/health and remember the one that works.
  async _resolveBase() {
    for (const base of Cloud._candidates()) {
      try {
        const r = await Cloud._fetch(base + '/api/health', { cache: 'no-store' }, 4000);
        if (r.ok) { Cloud._base = base; return true; }
      } catch (_) { /* try next */ }
    }
    Cloud._base = null;
    return false;
  },

  // Health-check + initial reconcile on page load.
  async init() {
    if (!Cloud.isEnabled()) { Cloud._set('idle'); return; }
    const ok = await Cloud._resolveBase();
    if (!ok) { Cloud._set('offline'); Cloud._ready = true; return; }
    await Cloud.pull();
    Cloud._ready = true;
    // Flush any change that landed during startup (after reconciling with cloud).
    if (Cloud._pendingPush) { Cloud._pendingPush = false; Cloud.pushNow(); }
  },

  // Pull the cloud copy; apply it only if it's newer than what we have.
  async pull() {
    if (!Cloud.isEnabled()) return;
    if (Cloud._base === null && !(await Cloud._resolveBase())) { Cloud._set('offline'); return; }
    try {
      const r = await Cloud._fetch(Cloud._base + '/api/latest', { cache: 'no-store' }, 8000);
      if (r.status === 401) { Cloud._set('unauthorized'); return; }   // wrong/missing sync token
      if (r.status === 204) { await Cloud.pushNow(); return; }   // server empty → seed it
      if (!r.ok) throw 0;
      const remote   = await r.json();
      const remoteAt = (remote && remote._meta && remote._meta.updatedAt) || remote._savedAt || 0;
      // Compare against the on-disk clock at load time, not a value bumped by
      // saves that ran during startup (which would falsely look "newer").
      const localAt  = (DB._loadedUpdatedAt != null ? DB._loadedUpdatedAt : (DB._meta && DB._meta.updatedAt)) || 0;
      if (remoteAt > localAt) {
        DB.applySnapshot(remote);
        DB.normalize();
        DB.save({ fromCloud: true });   // persist locally; don't bump clock or re-push
        DB._loadedUpdatedAt = remoteAt; // server and local are now reconciled
        Cloud.lastSync = Date.now(); Cloud._set('saved');
        if (typeof App !== 'undefined' && App.user && typeof navigate === 'function') navigate(App.currentPage || 'dashboard');
        if (typeof showToast === 'function') showToast('Synced latest data from cloud', 'info');
      } else {
        DB._loadedUpdatedAt = localAt;
        Cloud.lastSync = Date.now(); Cloud._set('saved');
        if (remoteAt < localAt) Cloud.pushNow();   // local is newer → bring the server up to date
      }
    } catch (_) { Cloud._set('offline'); }
  },

  // Debounce bursts of changes into a single push. Held until the initial
  // pull has reconciled, so a startup save can't clobber newer cloud data.
  schedulePush() {
    if (!Cloud.isEnabled()) return;
    if (!Cloud._ready) { Cloud._pendingPush = true; return; }
    clearTimeout(Cloud._timer);
    Cloud._timer = setTimeout(Cloud.pushNow, 1500);
  },

  async pushNow() {
    if (!Cloud.isEnabled()) return;
    if (Cloud._base === null && !(await Cloud._resolveBase())) { Cloud._set('offline'); return false; }
    Cloud._set('syncing');
    try {
      const r = await Cloud._fetch(Cloud._base + '/api/backup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(DB.snapshot()),
      }, 10000);
      if (r.status === 401) { Cloud._set('unauthorized'); return false; }   // wrong/missing sync token
      if (!r.ok) throw 0;
      DB._loadedUpdatedAt = (DB._meta && DB._meta.updatedAt) || 0;   // server now matches local
      Cloud.lastSync = Date.now(); Cloud._set('saved');
      return true;
    } catch (_) { Cloud._set('offline'); return false; }
  },

  async listBackups() {
    if (Cloud._base === null && !(await Cloud._resolveBase())) return [];
    try {
      const r = await Cloud._fetch(Cloud._base + '/api/backups', { cache: 'no-store' }, 6000);
      if (!r.ok) return [];
      return (await r.json()).backups || [];
    } catch (_) { return []; }
  },
};

// Reconcile shortly after load (after DB.load()/normalize() have run).
document.addEventListener('DOMContentLoaded', () => { setTimeout(() => Cloud.init(), 400); });
