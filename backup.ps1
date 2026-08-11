# SQLite backup script (Windows PowerShell 5.1, pure ASCII)
# Copies data/app.db (plus WAL/SHM) into backups/app-<timestamp>.db*
# Usage: powershell -File backup.ps1
$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$db = Join-Path $root 'data\app.db'
$bakDir = Join-Path $root 'backups'
if (-not (Test-Path $db)) { Write-Host 'No database found (data\app.db). Nothing to back up.'; exit 0 }
New-Item -ItemType Directory -Force -Path $bakDir | Out-Null
$stamp = Get-Date -Format 'yyyyMMdd-HHmmss'
$dest = Join-Path $bakDir "app-$stamp.db"
Copy-Item $db $dest -Force
$wal = "$db-wal"; if (Test-Path $wal) { Copy-Item $wal "$dest-wal" -Force }
$shm = "$db-shm"; if (Test-Path $shm) { Copy-Item $shm "$dest-shm" -Force }
Write-Host "Backup saved: $dest"
Write-Host "Backups directory: $bakDir"
