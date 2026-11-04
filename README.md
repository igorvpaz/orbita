# Órbita — Product Builder

**Deploy oficial:** [Acessar Órbita](https://orbita-dpvgtjzjva-rj.a.run.app)

Webapp de serviços extras para uma rede fictícia de coworkings. Um Next.js em TypeScript serve UI e API; PostgreSQL, Auth e Storage ficam no Supabase Cloud. O container roda no Google Cloud Run. Resend é opcional para alertas de negócio.

```text
Admin / membro → Next.js (Cloud Run) → Supabase Cloud (Auth, PostgreSQL, Storage)
                         └──────────→ Resend (e-mail)
```

O frontend chama `/api/*` para ações de negócio. O backend usa o cliente Supabase associado à sessão para aplicar RLS. A chave secreta só é usada no servidor para Auth Admin e registro de e-mails. Sem gateway: “contratar” cria uma **solicitação**, e “confirmar” registra valor nominal contratado, não pagamento recebido.

## Estado

Publicado em 03/11/2026 no Google Cloud Run: **https://orbita-dpvgtjzjva-rj.a.run.app**. Auth, papéis e gestão direta de membros usam o Supabase remoto. Login do administrador, proteção das rotas, catálogo com 36 fotos e arquivos do PWA foram verificados por HTTP na URL pública. Atualizado em 04/11/2026; consulte [o registro atual](docs/deployment-2026-11-04.md). Nenhuma credencial real deve ser versionada.

## Execução local

Requisitos: Node 24, pnpm 11.25, Docker, Supabase CLI, `psql` (bootstrap admin) e `gcloud` (deploy). O Next.js roda em `apps/web`, então crie o ambiente nessa pasta:

```powershell
Copy-Item .env.example apps/web/.env.local
pnpm install --frozen-lockfile
pnpm dev
```

Para Auth, preencha URL, chave publicável e chave secreta Supabase e `SITE_URL=http://localhost:3000`. Valores `NEXT_PUBLIC_*` são publicáveis; as demais chaves ficam só no servidor. `GET /api/health` responde `{ "ok": true, "status": "ok" }`.

```powershell
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

## Supabase Auth — contas gerenciadas pelo admin

Este projeto de treinamento usa contas criadas pelo administrador, sem cadastro público, confirmação de e-mail ou SMTP para autenticação. Em `/admin/members`, informe nome, e-mail, senha inicial (8–128 caracteres), unidade, plano e status. O membro entra imediatamente com as credenciais definidas. Nos botões **Editar**, **Definir senha** e **Assinatura**, o admin altera nome/e-mail/unidade e define uma nova senha; plano, validade e ativação continuam no mesmo painel. As senhas atuais não podem ser consultadas.

O projeto remoto é `orbita` (`ifazwnuhtajmmkwxhrjr`). As migrations de Auth, catálogo, reservas, administradores e métricas foram aplicadas. Foram criados o administrador solicitado (credenciais privadas, não publicadas), seis unidades fictícias no RS e os planos Básico/Premium. A senha foi definida conforme solicitado na conversa e não é versionada. O seed remoto contém 36 serviços: seis por unidade, sendo dois Premium.

- `apps/web/.env.local`, ignorado pelo Git, contém URL, chave publicável e chave secreta de servidor. Nunca exponha `SUPABASE_SECRET_KEY` em variáveis `NEXT_PUBLIC_*`.
- Site URL remoto: `http://localhost:3000`; callbacks permitidos: `/auth/callback`, `/auth/confirm` e `/reset-password` nesse host. Configure o domínio publicado antes do deploy.
- **Allow new users to sign up**, **Allow anonymous sign-ins** e **Confirm email** estão desligados remotamente; o e-mail continua habilitado como método de login.
- Criação usa `auth.admin.createUser` com confirmação automática, exclusivamente no servidor após verificar o admin. Perfil e assinatura são inseridos atomicamente por `create_member_record` usando a sessão do administrador e RLS. Falha no banco remove somente a conta Auth recém-criada pela requisição.
- Rotas de convite por e-mail retornam `410`; execução dos RPCs legados de criação/aceite foi revogada. Redefinição de senha é feita pelo administrador no painel.
- O proxy valida sessão com `getUser()` e as APIs/layouts verificam o papel atual no banco. Login preserva destinos internos da área do papel autenticado; respostas de sessão usam `private, no-store`.

Para outro ambiente, aplique as migrations em ordem e crie o primeiro Auth user confirmado pelo painel ou pela API Admin. Faça o bootstrap do perfil com `supabase/bootstrap-admin.psql`, seguindo os parâmetros do próprio arquivo. A configuração de Auth deve ser replicada no painel; `supabase/config.toml` registra as opções locais. Não há rota pública de promoção a admin.

## Resend — passos manuais

Verifique um domínio e os registros DNS exigidos no painel Resend. Use um endereço desse domínio em `EMAIL_FROM` e uma caixa sua em `ADMIN_NOTIFICATION_EMAIL`. O app registra resultado em `email_deliveries`; falha de e-mail não desfaz interesse ou pedido.

## Docker e Google Cloud Run

Para a publicação atual no projeto **orbita-513618**, siga [o guia de deploy](docs/deploy-cloud-run.md). O script `scripts/publish-cloud-run.ps1` constrói o Dockerfile localmente ou no Cloud Build, configura Secret Manager e Cloud Run e valida a URL pública. E-mail não é requisito desse fluxo de treinamento.

```powershell
.\scripts\login-gcp.ps1
.\scripts\publish-cloud-run.ps1 -ProjectId orbita-513618 -BuildMode CloudBuild
```

O Dockerfile contém apenas Next.js. O build precisa dos dois valores públicos porque o Next os incorpora no bundle do cliente:

```powershell
docker build --build-arg NEXT_PUBLIC_SUPABASE_URL=https://SEU_REF.supabase.co --build-arg NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_... -t orbita .
docker run --rm -p 8080:8080 -e PORT=8080 --env-file apps/web/.env.local -e SITE_URL=http://localhost:8080 orbita
```

Confira `http://localhost:8080/api/health`. No GCP, habilite faturamento e crie dois secrets no Secret Manager: `orbita-supabase-secret` (chave secreta Supabase) e `orbita-resend-key` (chave Resend). O script cria service account de runtime e concede acesso só a esses secrets:

```powershell
.\scripts\deploy-gcp.ps1 -ProjectId SEU_PROJETO -Region southamerica-east1 -SupabaseUrl https://SEU_REF.supabase.co -SupabasePublishableKey sb_publishable_... -EmailFrom no-reply@seu-dominio.com -AdminNotificationEmail voce@seu-dominio.com
```

O script constrói imagem, publica no Artifact Registry, implanta no Cloud Run e configura `SITE_URL` com a URL HTTPS gerada. Ajuste Site URL no Supabase antes de publicar. Cloud Run, Artifact Registry, Secret Manager e tráfego podem gerar cobrança; crie orçamento e alerta no GCP.

## Rotas e demonstração

- `/login`: login; recuperação feita pelo admin, sem cadastro público.
- `/admin`: métricas; `/admin/partners`, `/admin/services`, `/admin/members`, `/admin/orders` e `/admin/upgrades`.
- `/member`: catálogo completo de qualquer unidade ativa do RS, com destaque por horário e plano; `/member/services/:id` registra view ao abrir, interesse e solicitação; `/member/orders` lista pedidos.
- Assinatura inativa/futura/expirada mostra apenas status. API e RLS bloqueiam catálogo, mídia e ações. Membro nunca define preço/status.
- Membros criados pelo admin recebem imediatamente o status de assinatura escolhido. Nenhum aceite de convite é necessário.
- `/member/subscription`: acompanha e solicita upgrade Premium; `/member/install`: botão de instalação quando compatível e instruções para Android, iOS e computador.
- PWA guarda apenas a tela estática offline e ícones. Dados privados, catálogo e APIs usam rede e não são cacheados. A interface oferece português, inglês, espanhol, francês, alemão e italiano, com preferência inicial do navegador e escolha salva em cookie. O tema claro/escuro segue inicialmente o dispositivo e salva a escolha manual.

Crie um membro pelo painel para a demo. Compartilhe credenciais com avaliadores por canal seguro, nunca no repositório. O vídeo final deve ter até 5 minutos e demonstrar admin cadastrar serviço → membro ver e solicitar → admin confirmar → assinatura desativada.

## Testes

- `pnpm test`: sessão e redirects protegidos, entrada de membros/senhas/assinaturas, schema de serviços e recomendações. Em 2026-11-03, 36 testes unitários passaram, assim como lint, tipos e build. O fluxo remoto confirmou login admin, criação de membro sem verificação, edição de e-mail/nome, redefinição de senha, rejeição de senha antiga, bloqueios de papel/RLS e desativação de assinatura; a conta temporária de teste foi removida.
- `$env:RUN_RLS_TESTS='1'; pnpm test:rls`: exige `apps/web/.env.test.local` com URL e chaves do **Supabase local** (`supabase status -o env`); o teste recusa URL remota. Cria dados fictícios, testa Data API anônima, membro inativo, alteração indevida e preço forjado. Rode após `supabase db reset` local.
- `pnpm exec playwright install chromium` e `pnpm test:e2e`: requer app em `E2E_BASE_URL` e variáveis `E2E_ADMIN_EMAIL`, `E2E_ADMIN_PASSWORD`, `E2E_MEMBER_EMAIL`, `E2E_MEMBER_PASSWORD`. O membro de teste deve estar ativo na primeira unidade do seed. Use contas e banco descartáveis. Playwright usa Chromium de teste, sem controlar seu Chrome pessoal.
- Smoke após deploy: health, login admin, criação de membro, alteração de senha, foto, recomendação no celular, pedido, e-mail, confirmação, métricas, bloqueio ao inativar, redefinição pelo admin, temas claro/escuro e instalação PWA.

## Segurança e limites

RLS está habilitada em todas as tabelas públicas da aplicação; `anon` não tem grants de dados. O banco preenche identidade, unidade, preço e total do pedido. API aplica sessão, papel e origem nas mutações. Sem pagamentos, renovação automática, push ou catálogo offline. O fluxo de contas foi validado no Supabase remoto; a suíte RLS completa ainda exige um banco local descartável.

## Identidade visual

O painel usa navegação lateral escura, área de trabalho clara, acentos amarelos e gestão de membros em tabela com busca. A navegação se adapta ao celular. A marca Órbita foi desenhada em vetor, com planeta dourado com anéis, conforme a referência: `apps/web/public/branding/orbita-logo.svg` e versão PNG transparente em `apps/web/public/branding/orbita-logo.png`. Favicon e ícones PWA usam o mesmo símbolo amarelo.

A página de login segue a mesma identidade: apresentação escura com grade sutil à esquerda e formulário claro à direita. Em telas pequenas, os painéis ficam empilhados. O campo de senha permite mostrar/ocultar o conteúdo; PT-BR/EN e o fluxo de autenticação existente foram preservados.

## Catálogo RS e Premium

Unidades fictícias: Moinhos de Vento, Menino Deus, Cidade Baixa e Bom Fim (Porto Alegre), Centro (Canoas) e Centro (Pelotas). Cada uma possui café da manhã, almoço, bicicletário, impressão, sala executiva Premium e estúdio de podcast Premium. Dados, parceiros e preços são fictícios. O seed é idempotente e integra a migration de release.

Membros ativos consultam e contratam em qualquer unidade. Todos os serviços publicados de parceiros e unidades ativos aparecem, mesmo fora do horário ou bloqueados pelo plano. O catálogo se atualiza a cada 30 segundos e ao voltar para a aba. O banco revalida plano e horário no momento da contratação; visualização não concede permissão de contratar. A unidade e o preço de pedidos/eventos são derivados do serviço no banco.

O Básico vê cadeados nos serviços Premium. Ao abrir um serviço bloqueado, pode solicitar upgrade. O admin recebe o pedido em `/admin/upgrades` e aprova ou recusa. A aprovação atualiza plano, status do pedido e auditoria em uma transação com locks. Membros não aprovam o próprio pedido. Há um único pedido pendente por membro, até três solicitações/dia, e assinatura inativa/expirada não pode ser promovida por esse fluxo. Não há cobrança automática.

Para instalar o PWA em celulares fora deste computador, publique o app em **HTTPS** e configure `SITE_URL` e o Supabase para esse domínio. `localhost`/loopback permitem a validação local. O manifest tem identidade, escopo e ícones `any`/`maskable`; o service worker usa escopo raiz e cabeçalhos sem cache. iOS usa Compartilhar → Adicionar à Tela de Início. O botão automático depende do suporte e da elegibilidade do navegador. Não foram adicionadas notificações push.

Validação remota: catálogo completo, contratação em outra unidade, bloqueio de Premium/horário pela API e Data API, deduplicação, recusa, aprovação imediata sem novo login, negação de autoaprovação, assinatura inativa e limite diário. O browser exibiu a opção nativa de instalar na tela dedicada; instalação real em aparelho iOS/Android e deploy HTTPS permanecem fora desta validação.

## Estados de carregamento

Catálogo, detalhes, pedidos, assinatura, instalação e telas administrativas usam skeletons responsivos em vez de textos visíveis de carregamento. Os segmentos `loading.tsx` também cobrem a navegação. Conteúdo já disponível permanece durante atualizações em segundo plano; formulários administrativos não são desmontados ao atualizar. Os placeholders não são interativos, têm anúncio acessível e desativam a animação quando `prefers-reduced-motion` está ativo.

## Temas e fotos dos serviços

O botão de tema fica no login e no menu lateral de administradores e membros. No primeiro acesso, segue o dispositivo; escolhas manuais persistem localmente. Fotos fictícias otimizadas em WebP cobrem todos os serviços; fotos enviadas pelo administrador têm prioridade. Os prompts e a procedência estão em [docs/branding/service-photos-prompts.md](docs/branding/service-photos-prompts.md).

## Administradores, reservas e métricas — atualização de 04/11/2026

- **Administradores:** `/admin/administrators` permite criar, editar e excluir outras contas de administração, com senha escolhida no painel e sem confirmação por e-mail. A API bloqueia excluir a própria conta e o banco preserva ao menos um admin. A exclusão conserva histórico comercial e auditorias, removendo o acesso da conta.
- **Reserva de horário:** o membro escolhe data e faixa válida, até 30 dias à frente. Cada pedido reserva uma pessoa. As 36 experiências fictícias usam capacidades de 1, 10, 20, 30 e 50 pessoas por faixa; o admin configura capacidade e duração (15 a 240 minutos). Data, plano, assinatura, atendimento, preço e vagas são revalidados no PostgreSQL, inclusive contra chamadas diretas à Data API. Locks serializam reservas concorrentes; cancelamentos liberam vagas e repetição da mesma requisição não duplica o pedido.
- **Dashboard:** Hoje, 7 dias, 30 dias e período personalizado (até 366 dias), no calendário de Brasília. Cards, evolução diária, jornada, rankings por visualizações/interesses/pedidos/valor e comparação entre unidades. O quadro detalhado inclui todos os serviços. Valor confirmado usa a data de confirmação e representa valor nominal, pois não há processamento de pagamentos; pedidos e eventos usam sua data de criação.
- **Idiomas:** seletor no login e no menu de ambos os papéis; textos da interface, catálogo fictício, datas, valores e instruções de instalação nos seis idiomas. Textos livres cadastrados pelo admin permanecem no idioma informado, sem tradução automática paga.
- **Navegação:** ícone de Parceiros representa um estabelecimento. Idioma, tema e sair ficam lado a lado na área fixa da conta: idioma mostra globo e sigla (PT/EN/ES/FR/DE/IT), enquanto tema e logout mostram apenas ícones. O seletor de idiomas abre ao clicar e fecha ao escolher, clicar fora ou pressionar Esc. Os controles mantêm nomes acessíveis e tooltips.

Validação: 51 testes web e 3 shared, TypeScript/ESLint, build standalone e fluxo integrado remoto com contas temporárias. Foram exercitados CRUD de admins, bloqueio de autoexclusão, revogação após exclusão, duas requisições simultâneas pela última vaga (uma aceita, uma rejeitada), idempotência, horário inválido, cancelamento, confirmação, soma no dashboard, Premium e seis idiomas. Os dados temporários foram removidos. A suíte completa de RLS em banco local descartável e a instalação física do PWA não fazem parte dessa validação.
