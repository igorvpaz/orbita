param(
  [Parameter(Mandatory = $true)][string]$ProjectId,
  [string]$Region = 'southamerica-east1',
  [ValidateSet('Docker', 'CloudBuild')][string]$BuildMode = 'CloudBuild',
  [string]$Service = 'orbita',
  [string]$Repository = 'orbita'
)

$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path $PSScriptRoot -Parent
Set-Location -LiteralPath $projectRoot
if ($ProjectId -notmatch '^[a-z][a-z0-9-]{4,28}[a-z0-9]$') { throw 'ID de projeto inválido' }
if ($Service -notmatch '^[a-z][a-z0-9-]{0,47}[a-z0-9]$') { throw 'Nome de serviço inválido' }
if ($Repository -notmatch '^[a-z][a-z0-9-]*$') { throw 'Nome de repositório inválido' }
if ($Region -notmatch '^[a-z]+-[a-z]+[0-9]+$') { throw 'Região inválida' }

$portableSdk = Join-Path $projectRoot '.tools/google-cloud-sdk/bin'
if (-not (Get-Command gcloud -ErrorAction SilentlyContinue) -and (Test-Path (Join-Path $portableSdk 'gcloud.cmd'))) {
  $env:PATH = "$portableSdk;$env:PATH"
  $env:CLOUDSDK_CONFIG = Join-Path $projectRoot '.tools/gcloud-config'
}
if (-not (Get-Command gcloud -ErrorAction SilentlyContinue)) { throw 'Instale o Google Cloud CLI primeiro' }
if ($BuildMode -eq 'Docker' -and -not (Get-Command docker -ErrorAction SilentlyContinue)) { throw 'Docker não encontrado; use -BuildMode CloudBuild para construir o mesmo Dockerfile na nuvem' }
function Check-Command([string]$message) { if ($LASTEXITCODE -ne 0) { throw $message } }
$account = gcloud auth list --filter=status:ACTIVE --format='value(account)'
Check-Command 'Falha ao consultar autenticação'
if (-not $account) { throw 'Faça login primeiro: gcloud auth login --no-launch-browser' }
gcloud projects describe $ProjectId --format='value(projectId)' | Out-Null
Check-Command 'Projeto não encontrado ou sem acesso'
$billing = gcloud billing projects describe $ProjectId --format='value(billingEnabled)'
Check-Command 'Falha ao consultar faturamento'
if ($billing -notmatch '^(?i:true)$') { throw 'Ative o faturamento do projeto antes de publicar' }

# Only public build values and the server credential are loaded. Never print the object.
$settings = (& node --env-file=apps/web/.env.local -e 'console.log(JSON.stringify({url:process.env.NEXT_PUBLIC_SUPABASE_URL,key:process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,secret:process.env.SUPABASE_SECRET_KEY}))') | ConvertFrom-Json
Check-Command 'Falha ao carregar ambiente local'
if ($settings.url -notmatch '^https://[^/]+\.supabase\.co$' -or $settings.key -notmatch '^sb_publishable_' -or -not $settings.secret) { throw 'Configuração Supabase local incompleta' }
gcloud services enable run.googleapis.com artifactregistry.googleapis.com secretmanager.googleapis.com iam.googleapis.com cloudbuild.googleapis.com --project $ProjectId --quiet
Check-Command 'Falha ao habilitar APIs'
gcloud artifacts repositories describe $Repository --location $Region --project $ProjectId *> $null
if ($LASTEXITCODE -ne 0) {
  gcloud artifacts repositories create $Repository --repository-format=docker --location $Region --project $ProjectId --quiet
  Check-Command 'Falha ao criar Artifact Registry'
}
$secretName = 'orbita-supabase-secret'
gcloud secrets describe $secretName --project $ProjectId *> $null
if ($LASTEXITCODE -ne 0) {
  gcloud secrets create $secretName --replication-policy=automatic --project $ProjectId --quiet
  Check-Command 'Falha ao criar secret'
  # Write exact bytes: PowerShell pipelines would append a newline to the API key.
  $secretDir = Join-Path $projectRoot '.tools'
  New-Item -ItemType Directory -Path $secretDir -Force | Out-Null
  $secretFile = Join-Path $secretDir ([Guid]::NewGuid().ToString() + '.secret')
  try {
    [System.IO.File]::WriteAllText($secretFile, $settings.secret, [System.Text.UTF8Encoding]::new($false))
    gcloud secrets versions add $secretName --data-file $secretFile --project $ProjectId --quiet
    Check-Command 'Falha ao gravar secret'
  } finally {
    if (Test-Path -LiteralPath $secretFile) { Remove-Item -LiteralPath $secretFile -Force }
  }
}
$settings.secret = $null
$accountEmail = "orbita-runtime@$ProjectId.iam.gserviceaccount.com"
gcloud iam service-accounts describe $accountEmail --project $ProjectId *> $null
if ($LASTEXITCODE -ne 0) {
  gcloud iam service-accounts create orbita-runtime --display-name='Órbita runtime' --project $ProjectId --quiet
  Check-Command 'Falha ao criar identidade do serviço'
}
gcloud secrets add-iam-policy-binding $secretName --member "serviceAccount:$accountEmail" --role roles/secretmanager.secretAccessor --project $ProjectId --quiet | Out-Null
Check-Command 'Falha ao autorizar acesso ao secret'
$tag = Get-Date -Format 'yyyyMMddHHmmss'
$image = "$Region-docker.pkg.dev/$ProjectId/$Repository/${Service}:$tag"
if ($BuildMode -eq 'Docker') {
  docker info *> $null
  Check-Command 'Inicie o Docker Desktop antes de publicar'
  gcloud auth configure-docker "$Region-docker.pkg.dev" --quiet
  Check-Command 'Falha na autenticação do Docker'
  docker build --platform linux/amd64 --build-arg "NEXT_PUBLIC_SUPABASE_URL=$($settings.url)" --build-arg "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=$($settings.key)" -t $image .
  Check-Command 'Docker build falhou'
  docker push $image
  Check-Command 'Docker push falhou'
} else {
  gcloud builds submit . --config=cloudbuild.yaml --project $ProjectId --region $Region --substitutions "_IMAGE=$image,_SUPABASE_URL=$($settings.url),_SUPABASE_PUBLISHABLE_KEY=$($settings.key)" --quiet
  Check-Command 'Build Docker no Cloud Build falhou'
}
$envVars = "NEXT_PUBLIC_SUPABASE_URL=$($settings.url),NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=$($settings.key)"
gcloud run deploy $Service --image $image --region $Region --project $ProjectId --platform managed --allow-unauthenticated --service-account $accountEmail --port 8080 --memory 1Gi --cpu 1 --min-instances 0 --max-instances 2 --set-secrets "SUPABASE_SECRET_KEY=${secretName}:latest" --set-env-vars $envVars --quiet
Check-Command 'Deploy Cloud Run falhou'
$siteUrl = (gcloud run services describe $Service --region $Region --project $ProjectId --format='value(status.url)').Trim()
Check-Command 'Falha ao consultar URL pública'
if (-not $siteUrl.StartsWith('https://')) { throw 'URL HTTPS não encontrada' }
gcloud run services update $Service --region $Region --project $ProjectId --update-env-vars "SITE_URL=$siteUrl" --quiet
Check-Command 'Falha ao configurar SITE_URL'
$health = Invoke-RestMethod -Uri "$siteUrl/api/health"
if (-not $health.ok) { throw 'Health check público falhou' }
Write-Host "Publicado: $siteUrl"
Write-Host "Login: $siteUrl/login"
Write-Host 'Configure Site URL e redirects no Supabase com essa URL HTTPS.'
