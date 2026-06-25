# ============================================================
#  Doozi POS - local backup server (PowerShell, no dependencies)
#  ------------------------------------------------------------
#  Provides a small JSON backup API the POS app auto-syncs to.
#  Backups are plain .json files under .\backups :
#     latest.json           -> current cloud copy (auto-sync)
#     snap-<timestamp>.json -> point-in-time history (throttled)
#
#  Run:   powershell -ExecutionPolicy Bypass -File backup-server.ps1
#  Then open the POS app -> Settings -> Backup & Sync shows "Synced".
#  Stop with Ctrl+C.
# ============================================================
param(
  [int]$Port = 3590
)

$ErrorActionPreference = 'Stop'
$Root      = Split-Path -Parent $MyInvocation.MyCommand.Path
$BackupDir = Join-Path $Root 'backups'
$SnapGapMs = 5 * 60 * 1000   # >=5 min between history snapshots
$SnapKeep  = 50              # retain newest N snapshots
# Optional shared secret. When set, data endpoints require a matching
# X-Backup-Token header; when empty the API stays open (localhost-only use).
$Token     = $env:DOOZI_BACKUP_TOKEN
# Allowed CORS origin. Default '*' for localhost; set DOOZI_ALLOWED_ORIGIN to the
# exact app origin (e.g. http://localhost:3400) to lock it down in production.
$AllowOrigin = if ($env:DOOZI_ALLOWED_ORIGIN) { $env:DOOZI_ALLOWED_ORIGIN } else { '*' }

if (-not (Test-Path $BackupDir)) { New-Item -ItemType Directory -Path $BackupDir | Out-Null }

function Write-Response($ctx, [int]$code, $obj, [string]$contentType = 'application/json; charset=utf-8') {
  $resp = $ctx.Response
  $resp.StatusCode = $code
  # CORS so the statically-served app (different port) can call us.
  $resp.Headers['Access-Control-Allow-Origin']  = $AllowOrigin
  $resp.Headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
  $resp.Headers['Access-Control-Allow-Headers'] = 'Content-Type, X-Backup-Token'
  $resp.Headers['X-Content-Type-Options']       = 'nosniff'
  if ($null -eq $obj) { $resp.ContentLength64 = 0; $resp.OutputStream.Close(); return }
  $json  = if ($obj -is [string]) { $obj } else { $obj | ConvertTo-Json -Depth 60 -Compress }
  $bytes = [Text.Encoding]::UTF8.GetBytes($json)
  $resp.ContentType = $contentType
  $resp.ContentLength64 = $bytes.Length
  $resp.OutputStream.Write($bytes, 0, $bytes.Length)
  $resp.OutputStream.Close()
}

function Get-LatestSnapMs {
  $snaps = Get-ChildItem -Path $BackupDir -Filter 'snap-*.json' -ErrorAction SilentlyContinue
  if (-not $snaps) { return 0 }
  return ([DateTimeOffset]($snaps | Sort-Object LastWriteTime -Descending | Select-Object -First 1).LastWriteTime).ToUnixTimeMilliseconds()
}

function Remove-OldSnapshots {
  $snaps = Get-ChildItem -Path $BackupDir -Filter 'snap-*.json' -ErrorAction SilentlyContinue | Sort-Object LastWriteTime -Descending
  if ($snaps.Count -gt $SnapKeep) {
    $snaps | Select-Object -Skip $SnapKeep | ForEach-Object { Remove-Item $_.FullName -Force -ErrorAction SilentlyContinue }
  }
}

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$Port/")
try { $listener.Start() }
catch { Write-Host "Failed to start on port $Port. $_" -ForegroundColor Red; exit 1 }

Write-Host "Doozi backup server listening on http://localhost:$Port  (backups -> $BackupDir)" -ForegroundColor Green
Write-Host "Leave this window open while you use the POS. Press Ctrl+C to stop." -ForegroundColor DarkGray

while ($listener.IsListening) {
  try {
    $ctx    = $listener.GetContext()
    $req    = $ctx.Request
    $path   = $req.Url.AbsolutePath
    $method = $req.HttpMethod

    if ($method -eq 'OPTIONS') { Write-Response $ctx 204 $null; continue }

    # Auth: health is open (discovery); everything else needs the token when set.
    if ($Token -and $path -ne '/api/health' -and ($req.Headers['X-Backup-Token'] -ne $Token)) {
      Write-Response $ctx 401 @{ ok = $false; error = 'Unauthorized' }; continue
    }

    switch -Regex ("$method $path") {
      '^GET /api/health$' {
        Write-Response $ctx 200 @{ ok = $true; service = 'doozi-backup'; time = ([DateTimeOffset]::UtcNow).ToUnixTimeMilliseconds() }
      }
      '^GET /api/latest$' {
        $f = Join-Path $BackupDir 'latest.json'
        if (-not (Test-Path $f)) { Write-Response $ctx 204 $null }
        else { Write-Response $ctx 200 (Get-Content $f -Raw -Encoding UTF8) }
      }
      '^GET /api/backups$' {
        $list = @(Get-ChildItem -Path $BackupDir -Filter 'snap-*.json' -ErrorAction SilentlyContinue |
          Sort-Object LastWriteTime -Descending | ForEach-Object {
            @{ name = $_.Name; size = $_.Length; savedAt = ([DateTimeOffset]$_.LastWriteTime).ToUnixTimeMilliseconds() }
          })
        Write-Response $ctx 200 @{ ok = $true; backups = $list }
      }
      '^POST /api/backup$' {
        $reader = New-Object IO.StreamReader($req.InputStream, $req.ContentEncoding)
        $raw = $reader.ReadToEnd(); $reader.Close()
        try { $null = $raw | ConvertFrom-Json } catch { Write-Response $ctx 400 @{ ok = $false; error = 'Invalid JSON' }; continue }
        # Tag with a server save time, then write the live copy + throttled snapshot.
        # Insert before the FINAL closing brace only (TrimEnd('}') would strip all of them).
        $t   = $raw.Trim()
        $cut = $t.LastIndexOf('}')
        $stamped = $t.Substring(0, $cut) + ',"_savedAt":' + ([DateTimeOffset]::UtcNow).ToUnixTimeMilliseconds() + '}'
        [IO.File]::WriteAllText((Join-Path $BackupDir 'latest.json'), $stamped, [Text.Encoding]::UTF8)
        if ((([DateTimeOffset]::UtcNow).ToUnixTimeMilliseconds() - (Get-LatestSnapMs)) -ge $SnapGapMs) {
          $name = 'snap-' + (Get-Date -Format 'yyyy-MM-ddTHH-mm-ss') + '.json'
          [IO.File]::WriteAllText((Join-Path $BackupDir $name), $stamped, [Text.Encoding]::UTF8)
          Remove-OldSnapshots
        }
        Write-Response $ctx 200 @{ ok = $true; savedAt = ([DateTimeOffset]::UtcNow).ToUnixTimeMilliseconds() }
      }
      default { Write-Response $ctx 404 @{ ok = $false; error = 'Unknown endpoint' } }
    }
  } catch {
    try { Write-Response $ctx 500 @{ ok = $false; error = "$_" } } catch {}
  }
}
