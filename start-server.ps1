param(
  [Parameter(Mandatory=$true)][ipaddress]$Address,
  [int]$Port=3080
)
$ErrorActionPreference='Stop'
$backendDir=Join-Path $PSScriptRoot 'backend'
$frontendDir=Join-Path $PSScriptRoot 'frontend'
$stateDir=Join-Path $env:LOCALAPPDATA 'LamLab'
$env:VITE_API_URL='/api'
$env:LIS_WEB_ROOT=Join-Path $frontendDir 'dist'
Push-Location $PSScriptRoot
try {
  foreach ($part in @($backendDir,$frontendDir)){
    if (!(Test-Path (Join-Path $part 'node_modules'))){
      npm.cmd ci --prefix $part
      if($LASTEXITCODE){throw "npm ci failed: $part"}
    }
    npm.cmd run build --prefix $part
    if($LASTEXITCODE){throw "Build failed: $part"}
  }
  node (Join-Path $backendDir 'scripts/prepare-postgres.cjs')
  if($LASTEXITCODE){throw 'PostgreSQL setup failed.'}
  $settings=Get-Content -Raw (Join-Path $stateDir 'server.json') | ConvertFrom-Json
  $env:LIS_API_TOKEN=$settings.apiToken
  $env:DATABASE_URL='postgresql://lamlab:'+$settings.databasePassword+'@127.0.0.1:55432/lamlab'
  $env:HOST=$Address.ToString()
  $env:PORT=$Port.ToString()
  $url='http://'+$env:HOST+':'+$Port
  $env:LIS_FRONTEND_ORIGIN=$url
  $headers=@{Authorization='Bearer '+$settings.apiToken}
  function Ready {
    try {
      $snapshot=Invoke-RestMethod ($url+'/api/workspace') -Headers $headers -TimeoutSec 2
      return ($snapshot.PSObject.Properties.Name -contains 'version')
    }catch{return $false}
  }
  if(!(Ready)){
    $server=Start-Process -FilePath (Get-Command node.exe).Source -ArgumentList 'dist/main.js' -WorkingDirectory $backendDir -WindowStyle Hidden -PassThru -RedirectStandardOutput (Join-Path $stateDir 'api.log') -RedirectStandardError (Join-Path $stateDir 'api-errors.log')
    for($attempt=0;$attempt -lt 25;$attempt++){
      if($server.HasExited){throw "API stopped. See $stateDir/api-errors.log"}
      if(Ready){break}
      Start-Sleep -Milliseconds 400
    }
    if(!(Ready)){throw 'API did not become ready.'}
    Set-Content (Join-Path $stateDir 'api.pid') -Value $server.Id
  }
  Write-Output ("LamLab ready at "+$url)
}finally{Pop-Location}
