/* ============================================================
   Doozi POS — local backup server (zero dependencies)
   ------------------------------------------------------------
   Serves the static app AND a small JSON backup API on one port
   (single origin → no CORS). Backups are plain .json files on
   disk under ./backups:
     - latest.json            → the current cloud copy (auto-sync)
     - snap-<timestamp>.json  → point-in-time history (throttled)

   Run:  node server.js   (defaults to port 3400)
   ============================================================ */
'use strict';

const http = require('http');
const fs   = require('fs');
const path = require('path');

const ROOT       = __dirname;
const BACKUP_DIR = path.join(ROOT, 'backups');
const PORT       = process.env.PORT || 3400;
// Optional shared secret. When set (env DOOZI_BACKUP_TOKEN), the data endpoints
// require a matching `X-Backup-Token` header. When unset, the API stays open
// (fine for a localhost-only server). Set it before exposing the port.
const AUTH_TOKEN = process.env.DOOZI_BACKUP_TOKEN || '';

// How far apart timestamped history snapshots are kept, and how many to retain.
const SNAPSHOT_MIN_GAP_MS = 5 * 60 * 1000;   // ≥5 min between history snapshots
const SNAPSHOT_KEEP       = 50;              // prune to the newest N
const MAX_BODY_BYTES      = 25 * 1024 * 1024; // 25 MB guard

if (!fs.existsSync(BACKUP_DIR)) fs.mkdirSync(BACKUP_DIR, { recursive: true });

const MIME = {
  '.html':'text/html; charset=utf-8', '.js':'text/javascript; charset=utf-8',
  '.css':'text/css; charset=utf-8', '.json':'application/json; charset=utf-8',
  '.svg':'image/svg+xml', '.png':'image/png', '.jpg':'image/jpeg', '.jpeg':'image/jpeg',
  '.gif':'image/gif', '.ico':'image/x-icon', '.webp':'image/webp', '.woff2':'font/woff2',
  '.woff':'font/woff', '.ttf':'font/ttf', '.mp4':'video/mp4', '.mov':'video/mp4',
};

function sendJSON(res, code, obj) {
  const body = JSON.stringify(obj);
  res.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8', 'Content-Length': Buffer.byteLength(body) });
  res.end(body);
}

function readBody(req, cb) {
  let size = 0; const chunks = [];
  req.on('data', d => {
    size += d.length;
    if (size > MAX_BODY_BYTES) { req.destroy(); cb(new Error('Payload too large')); return; }
    chunks.push(d);
  });
  req.on('end', () => cb(null, Buffer.concat(chunks).toString('utf8')));
  req.on('error', cb);
}

function latestSnapshotTime() {
  try {
    const snaps = fs.readdirSync(BACKUP_DIR).filter(f => f.startsWith('snap-') && f.endsWith('.json'));
    let newest = 0;
    snaps.forEach(f => { const st = fs.statSync(path.join(BACKUP_DIR, f)).mtimeMs; if (st > newest) newest = st; });
    return newest;
  } catch (_) { return 0; }
}

function pruneSnapshots() {
  try {
    const snaps = fs.readdirSync(BACKUP_DIR)
      .filter(f => f.startsWith('snap-') && f.endsWith('.json'))
      .map(f => ({ f, t: fs.statSync(path.join(BACKUP_DIR, f)).mtimeMs }))
      .sort((a, b) => b.t - a.t);
    snaps.slice(SNAPSHOT_KEEP).forEach(s => { try { fs.unlinkSync(path.join(BACKUP_DIR, s.f)); } catch (_) {} });
  } catch (_) {}
}

// True when no token is configured, or the request presents the matching one.
function authed(req) { return !AUTH_TOKEN || req.headers['x-backup-token'] === AUTH_TOKEN; }

// ── API ─────────────────────────────────────────────────────
function handleApi(req, res, url) {
  // GET /api/health — open (used for discovery; exposes no business data).
  if (req.method === 'GET' && url === '/api/health') {
    return sendJSON(res, 200, { ok: true, service: 'doozi-backup', auth: !!AUTH_TOKEN, time: Date.now() });
  }
  // Every other endpoint reads or writes business data → require the token.
  if (!authed(req)) return sendJSON(res, 401, { ok: false, error: 'Unauthorized' });

  // GET /api/latest → the current cloud copy (204 if none yet)
  if (req.method === 'GET' && url === '/api/latest') {
    const file = path.join(BACKUP_DIR, 'latest.json');
    if (!fs.existsSync(file)) { res.writeHead(204); return res.end(); }
    try { return sendJSON(res, 200, JSON.parse(fs.readFileSync(file, 'utf8'))); }
    catch (_) { return sendJSON(res, 500, { ok: false, error: 'Corrupt backup' }); }
  }

  // GET /api/backups → list history snapshots (metadata only)
  if (req.method === 'GET' && url === '/api/backups') {
    try {
      const list = fs.readdirSync(BACKUP_DIR)
        .filter(f => f.startsWith('snap-') && f.endsWith('.json'))
        .map(f => ({ name: f, size: fs.statSync(path.join(BACKUP_DIR, f)).size, savedAt: fs.statSync(path.join(BACKUP_DIR, f)).mtimeMs }))
        .sort((a, b) => b.savedAt - a.savedAt);
      return sendJSON(res, 200, { ok: true, backups: list });
    } catch (_) { return sendJSON(res, 500, { ok: false, error: 'List failed' }); }
  }

  // POST /api/backup → store the supplied DB payload
  if (req.method === 'POST' && url === '/api/backup') {
    return readBody(req, (err, raw) => {
      if (err) return sendJSON(res, 413, { ok: false, error: err.message });
      let data;
      try { data = JSON.parse(raw); } catch (_) { return sendJSON(res, 400, { ok: false, error: 'Invalid JSON' }); }
      const payload = JSON.stringify({ ...data, _savedAt: Date.now() }, null, 0);
      try {
        // Always refresh the live cloud copy.
        fs.writeFileSync(path.join(BACKUP_DIR, 'latest.json'), payload);
        // Add a throttled point-in-time snapshot for history.
        if (Date.now() - latestSnapshotTime() >= SNAPSHOT_MIN_GAP_MS) {
          const stamp = new Date().toISOString().replace(/[:.]/g, '-');
          fs.writeFileSync(path.join(BACKUP_DIR, `snap-${stamp}.json`), payload);
          pruneSnapshots();
        }
        return sendJSON(res, 200, { ok: true, savedAt: Date.now() });
      } catch (e) { return sendJSON(res, 500, { ok: false, error: 'Write failed' }); }
    });
  }

  return sendJSON(res, 404, { ok: false, error: 'Unknown endpoint' });
}

// ── Static files ────────────────────────────────────────────
function serveStatic(req, res, urlPath) {
  let rel = decodeURIComponent(urlPath.split('?')[0]);
  if (rel === '/' || rel === '') rel = '/index.html';
  // Prevent path traversal outside the project root.
  const filePath = path.normalize(path.join(ROOT, rel));
  if (!filePath.startsWith(ROOT)) { res.writeHead(403); return res.end('Forbidden'); }
  fs.stat(filePath, (err, st) => {
    if (err || !st.isFile()) { res.writeHead(404); return res.end('Not found'); }
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
    fs.createReadStream(filePath).pipe(res);
  });
}

// Baseline security headers on every response (no external deps / Helmet needed).
function applySecurityHeaders(res) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=()');
  res.setHeader('Cross-Origin-Resource-Policy', 'same-origin');
}

// Lightweight in-memory rate limiter for the API (per IP, sliding 1-min window),
// so a runaway client or brute-forcer can't hammer the backup endpoints.
const RL_WINDOW_MS = 60 * 1000, RL_MAX = 120;
const _rl = new Map();
function rateLimited(ip) {
  const now = Date.now();
  const hits = (_rl.get(ip) || []).filter(t => now - t < RL_WINDOW_MS);
  hits.push(now);
  _rl.set(ip, hits);
  if (_rl.size > 5000) _rl.clear();   // crude memory bound
  return hits.length > RL_MAX;
}

http.createServer((req, res) => {
  applySecurityHeaders(res);
  const urlPath = req.url.split('?')[0];
  // Standard health check for uptime monitors / load balancers.
  if (urlPath === '/health') return sendJSON(res, 200, { ok: true, status: 'healthy', time: Date.now() });
  if (urlPath.startsWith('/api/')) {
    const ip = req.socket.remoteAddress || 'unknown';
    if (urlPath !== '/api/health' && rateLimited(ip)) return sendJSON(res, 429, { ok: false, error: 'Too many requests' });
    return handleApi(req, res, urlPath);
  }
  return serveStatic(req, res, req.url);
}).listen(PORT, () => {
  console.log(`Doozi POS running at http://localhost:${PORT}  (backups → ${BACKUP_DIR})`);
  console.log(AUTH_TOKEN
    ? '  API auth: ENABLED (X-Backup-Token required)'
    : '  API auth: OPEN — set DOOZI_BACKUP_TOKEN to require a token before exposing this port.');
});
