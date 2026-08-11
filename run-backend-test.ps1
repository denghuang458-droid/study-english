# Run backend test suite and capture output (pure ASCII, no CJK literals)
$node = 'C:\Program Files\nodejs\node.exe'
$dir = $PSScriptRoot
Set-Location $dir
& $node 'test-backend.js' 2>&1 | Out-File -FilePath (Join-Path $dir 'test-output.txt') -Encoding utf8
Write-Host '--- captured ---'
Get-Content (Join-Path $dir 'test-output.txt')
