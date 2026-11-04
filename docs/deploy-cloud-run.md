# Publicar Órbita no Cloud Run

O Dockerfile existente produz uma imagem Linux com o servidor Next.js standalone. O script publica no Artifact Registry, implanta no Cloud Run em São Paulo, configura `SITE_URL` com a URL HTTPS gerada e testa `/api/health`. A autenticação e os dados continuam no Supabase remoto atual.

## Autenticar

No PowerShell, na raiz do projeto, use o SDK portátil (ou seu `gcloud` já instalado):

```powershell
$env:CLOUDSDK_CONFIG = Join-Path $PWD '.tools/gcloud-config'
.\.tools\google-cloud-sdk\bin\gcloud.cmd auth login
```

Faça o login na sua conta Google no navegador. O projeto precisa ter faturamento ativo e sua conta deve poder gerenciar Cloud Run, Artifact Registry, service accounts, secrets e builds.

## Publicar

Construir o Dockerfile pelo Cloud Build, sem instalar Docker neste computador:

```powershell
.\scripts\publish-cloud-run.ps1 -ProjectId orbita-513618 -BuildMode CloudBuild
```

Se Docker Desktop estiver instalado e iniciado, construir localmente:

```powershell
.\scripts\publish-cloud-run.ps1 -ProjectId orbita-513618 -BuildMode Docker
```

O script usa os valores de `apps/web/.env.local`; não pede nem imprime chaves. Somente os dois valores públicos do Supabase entram no build. A chave de servidor vai para Secret Manager e é disponibilizada exclusivamente ao serviço. `.gcloudignore` e `.dockerignore` excluem ambientes locais e o SDK dos arquivos enviados. Não versionar `.tools/` ou `.env.local`.

O primeiro deploy usa no mínimo zero instâncias e no máximo duas. Cloud Run, builds, armazenamento e tráfego usam a conta de faturamento do projeto. O script não configura e-mail, pois as contas de treinamento são gerenciadas diretamente pelo administrador; serviços e pedidos continuam funcionando sem Resend.

## Após receber a URL

Em Supabase → Authentication → URL Configuration, defina Site URL como a URL HTTPS do Cloud Run e adicione exatamente:

```text
https://SUA_URL.run.app/auth/callback
https://SUA_URL.run.app/auth/confirm
https://SUA_URL.run.app/reset-password
```

Valide login do administrador, catálogo, fotos, criação de membros, pedido e aprovação Premium. No celular, abra a URL HTTPS e acesse **Instalar aplicativo**. O servidor público expõe a página de login; áreas e APIs privadas continuam protegidas pela sessão, papel e RLS.

## Referências

- [Construção de imagens Docker no Cloud Build](https://docs.cloud.google.com/build/docs/building/build-containers)
- [Deploy de imagens no Cloud Run](https://docs.cloud.google.com/run/docs/deploying)
- [Segredos no Cloud Run](https://docs.cloud.google.com/run/docs/configuring/services/secrets)
