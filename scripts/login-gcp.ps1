$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path $PSScriptRoot -Parent
$portable = Join-Path $projectRoot '.tools/google-cloud-sdk/bin/gcloud.cmd'
if (Test-Path -LiteralPath $portable) {
  $env:CLOUDSDK_CONFIG = Join-Path $projectRoot '.tools/gcloud-config'
  & $portable auth login
} elseif (Get-Command gcloud -ErrorAction SilentlyContinue) {
  gcloud auth login
} else {
  throw 'Google Cloud CLI não encontrado'
}
if ($LASTEXITCODE -ne 0) { throw 'Login não concluído' }
Write-Host 'Login concluído. Você pode voltar ao chat para continuar o deploy.'
