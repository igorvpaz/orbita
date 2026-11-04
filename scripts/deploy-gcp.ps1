param(
  [Parameter(Mandatory = $true)][string]$ProjectId,
  [Parameter(Mandatory = $true)][string]$Region,
  [Parameter(Mandatory = $true)][string]$SupabaseUrl,
  [Parameter(Mandatory = $true)][string]$SupabasePublishableKey,
  [Parameter(Mandatory = $true)][string]$EmailFrom,
  [Parameter(Mandatory = $true)][string]$AdminNotificationEmail,
  [string]$Repository = 'orbita',
  [string]$Service = 'orbita',
  [string]$SupabaseSecretName = 'orbita-supabase-secret',
  [string]$ResendSecretName = 'orbita-resend-key'
)

$ErrorActionPreference = 'Stop'
foreach ($command in @('gcloud', 'docker')) {
  if (-not (Get-Command $command -ErrorAction SilentlyContinue)) { throw "$command não encontrado no PATH" }
}
if ($SupabaseUrl -notmatch '^https://[^/]+\.supabase\.co$') { throw 'SupabaseUrl inválida' }
if ($SupabasePublishableKey -notmatch '^sb_publishable_') { throw 'Use a chave publicável do Supabase' }
if ($EmailFrom -notmatch '^[^ ,<>]+@[^ ,<>]+$') { throw 'Use um endereço remetente simples, sem nome de exibição' }
if ($AdminNotificationEmail -notmatch '^[^ ,<>]+@[^ ,<>]+$') { throw 'E-mail administrativo inválido' }

gcloud config set project $ProjectId | Out-Null
gcloud services enable run.googleapis.com artifactregistry.googleapis.com secretmanager.googleapis.com iam.googleapis.com --project $ProjectId
if ($LASTEXITCODE -ne 0) { throw 'Falha ao habilitar APIs GCP' }
gcloud artifacts repositories describe $Repository --location $Region --project $ProjectId *> $null
if ($LASTEXITCODE -ne 0) {
  gcloud artifacts repositories create $Repository --repository-format=docker --location=$Region --project=$ProjectId
  if ($LASTEXITCODE -ne 0) { throw 'Falha ao criar Artifact Registry' }
}
foreach ($secret in @($SupabaseSecretName, $ResendSecretName)) {
  gcloud secrets describe $secret --project $ProjectId *> $null
  if ($LASTEXITCODE -ne 0) { throw "Secret $secret não encontrado no Secret Manager" }
}
$accountName = 'orbita-runtime'
$accountEmail = "$accountName@$ProjectId.iam.gserviceaccount.com"
gcloud iam service-accounts describe $accountEmail --project $ProjectId *> $null
if ($LASTEXITCODE -ne 0) {
  gcloud iam service-accounts create $accountName --display-name='Órbita runtime' --project $ProjectId
  if ($LASTEXITCODE -ne 0) { throw 'Falha ao criar service account' }
}
foreach ($secret in @($SupabaseSecretName, $ResendSecretName)) {
  gcloud secrets add-iam-policy-binding $secret --member "serviceAccount:$accountEmail" --role roles/secretmanager.secretAccessor --project $ProjectId --quiet | Out-Null
  if ($LASTEXITCODE -ne 0) { throw "Falha ao autorizar acesso ao secret $secret" }
}
gcloud auth configure-docker "$Region-docker.pkg.dev" --quiet
if ($LASTEXITCODE -ne 0) { throw 'Falha na autenticação do Docker' }

$tag = (Get-Date -Format 'yyyyMMddHHmmss')
$image = "$Region-docker.pkg.dev/$ProjectId/$Repository/$Service`:$tag"
docker build --build-arg "NEXT_PUBLIC_SUPABASE_URL=$SupabaseUrl" --build-arg "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=$SupabasePublishableKey" -t $image .
if ($LASTEXITCODE -ne 0) { throw 'Docker build falhou' }
docker push $image
if ($LASTEXITCODE -ne 0) { throw 'Docker push falhou' }

$secrets = "SUPABASE_SECRET_KEY=$SupabaseSecretName`:latest,RESEND_API_KEY=$ResendSecretName`:latest"
$envVars = "NEXT_PUBLIC_SUPABASE_URL=$SupabaseUrl,NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=$SupabasePublishableKey,EMAIL_FROM=$EmailFrom,ADMIN_NOTIFICATION_EMAIL=$AdminNotificationEmail"
gcloud run deploy $Service --image $image --region $Region --project $ProjectId --platform managed --allow-unauthenticated --service-account $accountEmail --port 8080 --memory 1Gi --cpu 1 --min-instances 0 --max-instances 2 --set-secrets $secrets --set-env-vars $envVars --quiet
if ($LASTEXITCODE -ne 0) { throw 'Deploy Cloud Run falhou' }
$siteUrl = (gcloud run services describe $Service --region $Region --project $ProjectId --format 'value(status.url)').Trim()
if (-not $siteUrl.StartsWith('https://')) { throw 'URL HTTPS do Cloud Run não encontrada' }
gcloud run services update $Service --region $Region --project $ProjectId --update-env-vars "SITE_URL=$siteUrl" --quiet
if ($LASTEXITCODE -ne 0) { throw 'Falha ao configurar SITE_URL' }
Write-Host "Deploy concluído: $siteUrl"
Write-Host "Health: $siteUrl/api/health"
Write-Host 'Adicione a URL aos redirects do Supabase Auth antes de testar convites e recuperação.'
