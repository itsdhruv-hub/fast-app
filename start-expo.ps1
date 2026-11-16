$ErrorActionPreference = 'Stop'

$ipv4Line = ipconfig | Select-String 'IPv4'
$lanIp = ($ipv4Line | ForEach-Object { $_.ToString() -replace '.*:\s*', '' } | Where-Object { $_ -notmatch '^127\.' -and $_ -notmatch '^169\.254\.' } | Select-Object -First 1).Trim()

if (-not $lanIp) {
  throw 'Could not find a LAN IPv4 address. Connect the computer and phone to the same Wi-Fi network, then try again.'
}

$env:EXPO_NO_TELEMETRY = '1'
$env:EXPO_OFFLINE = '1'
$env:REACT_NATIVE_PACKAGER_HOSTNAME = $lanIp

Write-Host "Starting Expo for Expo Go at exp://$lanIp`:8082" -ForegroundColor Green
npx.cmd expo start --clear --host lan --port 8082
