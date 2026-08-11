# SQLite restore script (Windows PowerShell 5.1, pure ASCII)
# Usage: powershell -File restore.ps1 <backup-file>
# IMPORTANT: stop the site server before restoring.
param([Parameter(Mandatory=$true)][string]$Backup)
$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
if (-not (Test-Path $Backup)) { Write-Host "Backup file not found: $Backup"; exit 1 }
$db = Join-Path $root 'data\app.db'
$dbDir = Join-Path $root 'data'
New-Item -ItemType Directory -Force -Path $dbDir | Out-Null
Copy-Item $Backup $db -Force
$wal = "$Backup-wal"; if (Test-Path $wal) { Copy-Item $wal "$db-wal" -Force } else { Remove-Item "$db-wal" -Force -ErrorAction SilentlyContinue }
$shm = "$Backup-shm"; if (Test-Path $shm) { Copy-Item $shm "$db-shm" -Force } else { Remove-Item "$db-shm" -Force -ErrorAction SilentlyContinue }
Write-Host "Restored: $Backup -> $db"
