# CET-4/6 Learning Site - Local Server
# Pure PowerShell + .NET (TcpListener, synchronous), no Python/Node needed,
# no admin required. Works on PowerShell 5.1.
# Usage: double-click start-server.bat, then open the printed URL on your phone.

$ErrorActionPreference = 'Stop'
$port = 8000
$root = Split-Path -Parent $MyInvocation.MyCommand.Path

# Find a free port
while ($true) {
  $inUse = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue
  if (-not $inUse) { break }
  $port++
}

# Get LAN IPv4 address
$ip = $null
try {
  $ip = (Get-NetIPAddress -AddressFamily IPv4 -ErrorAction SilentlyContinue |
    Where-Object { $_.IPAddress -notlike '127.*' -and $_.IPAddress -notlike '169.254.*' -and $_.PrefixOrigin -ne 'WellKnown' } |
    Select-Object -First 1).IPAddress
} catch { }
if (-not $ip) { $ip = '127.0.0.1' }

$mime = @{
  '.html' = 'text/html; charset=utf-8'
  '.js'   = 'application/javascript; charset=utf-8'
  '.css'  = 'text/css; charset=utf-8'
  '.json' = 'application/json; charset=utf-8'
  '.png'  = 'image/png'
  '.jpg'  = 'image/jpeg'
  '.jpeg' = 'image/jpeg'
  '.gif'  = 'image/gif'
  '.svg'  = 'image/svg+xml'
  '.ico'  = 'image/x-icon'
  '.woff' = 'font/woff'
  '.woff2'= 'font/woff2'
  '.ttf'  = 'font/ttf'
  '.txt'  = 'text/plain; charset=utf-8'
  '.md'   = 'text/plain; charset=utf-8'
  '.tsv'  = 'text/tab-separated-values; charset=utf-8'
}

# Sensitive files that must never be served (server source, configs, data, backups)
$blocked = '^(server\.js|package\.json|package-lock\.json|ecosystem\.config\.cjs|\.env(?:$|\.)|start-server\.(?:ps1|bat)$|.*\.bak$|data/|node_modules/|\.git/)'

function Send-File($client, $file, $immutable) {
  $stream = $client.GetStream()
  $bytes = [System.IO.File]::ReadAllBytes($file)
  $ext = [System.IO.Path]::GetExtension($file).ToLower()
  $ct = 'application/octet-stream'
  if ($mime.ContainsKey($ext)) { $ct = $mime[$ext] }
  $cache = 'no-cache'
  if ($immutable) { $cache = 'public, max-age=31536000, immutable' }
  $head = "HTTP/1.1 200 OK`r`nContent-Type: $ct`r`nContent-Length: $($bytes.Length)`r`nCache-Control: $cache`r`nConnection: close`r`n`r`n"
  $hb = [System.Text.Encoding]::ASCII.GetBytes($head)
  $stream.Write($hb, 0, $hb.Length)
  $stream.Write($bytes, 0, $bytes.Length)
}

function Send-404($client) {
  $stream = $client.GetStream()
  $body = '404 Not Found'
  $b = [System.Text.Encoding]::UTF8.GetBytes($body)
  $head = "HTTP/1.1 404 Not Found`r`nContent-Type: text/plain`r`nContent-Length: $($b.Length)`r`nConnection: close`r`n`r`n"
  $hb = [System.Text.Encoding]::ASCII.GetBytes($head)
  $stream.Write($hb, 0, $hb.Length)
  $stream.Write($b, 0, $b.Length)
}

$listener = New-Object System.Net.Sockets.TcpListener([System.Net.IPAddress]::Any, $port)
$listener.Start()

Write-Host ""
Write-Host "==============================================" -ForegroundColor Cyan
Write-Host "  CET-4/6 Learning Site - Server Started" -ForegroundColor Cyan
Write-Host "==============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Phone (connect phone & PC to same Wi-Fi):" -ForegroundColor Green
Write-Host "    http://$ip`:$port/index.html" -ForegroundColor Yellow
Write-Host ""
Write-Host "  This PC:" -ForegroundColor Green
Write-Host "    http://localhost:$port/index.html" -ForegroundColor Yellow
Write-Host ""
Write-Host "  If Windows Firewall asks, click Allow access." -ForegroundColor DarkYellow
Write-Host "  Press Ctrl+C to stop the server." -ForegroundColor Cyan
Write-Host ""

try {
  while ($true) {
    $client = $listener.AcceptTcpClient()
    try {
      $client.ReceiveTimeout = 3000
      $stream = $client.GetStream()
      $stream.ReadTimeout = 3000
      $buffer = New-Object byte[] 8192
      $n = $stream.Read($buffer, 0, $buffer.Length)
      if ($n -gt 0) {
        $reqText = [System.Text.Encoding]::UTF8.GetString($buffer, 0, $n)
        $firstLine = ($reqText -split "`r`n")[0]
        $parts = $firstLine -split ' '
        if ($parts.Count -ge 2) {
          $rawPath = $parts[1]
          $hasVersion = ($rawPath -match '\?v=')
          $path = [System.Uri]::UnescapeDataString(($rawPath -split '\?')[0])
          if ($path -eq '/' -or $path -eq '') { $path = '/index.html' }
          $rel = $path.TrimStart('/').Replace('\', '/')
          $relLower = $rel.ToLower()
          $full = [System.IO.Path]::GetFullPath((Join-Path $root $rel))
          if ($relLower -match $blocked) {
            Send-404 $client
          } elseif ($full.StartsWith([System.IO.Path]::GetFullPath($root)) -and [System.IO.File]::Exists($full)) {
            Send-File $client $full $hasVersion
          } else {
            Send-404 $client
          }
        }
      }
    } catch { }
    finally {
      try { $client.Close() } catch { }
    }
  }
}
finally {
  $listener.Stop()
}
