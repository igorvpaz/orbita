# PLAN.md — Órbita | Product Builder

> **Plano de execução do desafio técnico (7 dias)**  
> **Base:** enunciado `Product Builder.pdf` (2 páginas).  
> **Decisões adicionais do projeto:** monorepo, Next.js, PWA, Supabase PostgreSQL + Auth + Storage, Resend para e-mails, convites exclusivamente administrativos, controle de assinatura no painel, Docker e deploy no Google Cloud Run (GCP).  
> **Status:** plano de implementação; os itens assinalados são tarefas futuras, não funcionalidades já concluídas.

## 0. Missão, prioridade e regras de execução

Construir um **webapp de upsell de serviços extras** para a rede fictícia de coworkings **Órbita**, em duas experiências no mesmo aplicativo: **painel administrativo** e **área do membro**. O membro com assinatura válida recebe sugestões relevantes de acordo com **plano, unidade, dia e horário**, manifesta interesse ou solicita a contratação; o administrador cadastra parceiros e serviços, controla assinaturas, recebe essas ações e acompanha um funil de resultados.

**Regra central de priorização:** o prazo do desafio é de **7 dias corridos a partir do recebimento do PDF** (não necessariamente a partir da criação deste arquivo). Entregar cedo o fluxo de ponta a ponta, publicado e testado; não gastar dias refinando funções secundárias.

**Contrato de implementação para o agente de código:**

1. Implementar as etapas na ordem, sem iniciar recursos opcionais antes de todos os critérios de aceite do MVP.
2. Manter front e back em **TypeScript**; usar **Next.js App Router** com **Route Handlers** para a API de negócio.
3. Usar **Supabase como serviço externo** para PostgreSQL, Auth e Storage; **não** colocar PostgreSQL dentro do container. O container é da aplicação Next.js.
4. Não usar o Supabase Data API diretamente no cliente para operações de negócio: o frontend chama `/api/*` e o backend aplica regras, autenticação e autorização. RLS permanece obrigatória como segunda barreira.
5. Não expor `SUPABASE_SERVICE_ROLE_KEY`/chave secreta de servidor, chave do Resend, URL de banco ou credenciais administrativas ao navegador.
6. Cadastro **somente por convite emitido por administrador autenticado**. Não criar rota de cadastro público e desabilitar signups públicos no Supabase Auth.
7. Somente **admin** pode ativar/desativar assinaturas, associar planos e convidar usuários. O membro jamais escolhe seu papel ou status de assinatura.
8. Toda tabela do schema exposto deve ter **RLS habilitada e testada**; não aceitar a proteção visual das páginas como controle de acesso.
9. Toda regra crítica deve produzir registro persistente ou feedback verificável, e todos os valores de preço deverão ser validados no servidor e no banco.
10. Após cada etapa: rodar lint, checagem de tipos e testes aplicáveis; documentar escolhas no `DECISIONS.md`, incluindo erros reais de IA no `AI_DIARY.md`.

---

## 1. Requisitos — origem e cobertura

### 1.1 Obrigatórios do PDF

| Exigência do PDF | Implementação planejada | Evidência na entrega |
| --- | --- | --- |
| TypeScript no front e no back | Next.js App Router + Route Handlers escritos em TS | Repositório, `tsconfig`, build |
| UI React com framework moderno | React via Next.js | Painel e área do membro funcionando |
| API com framework moderno e justificativa | Next.js Route Handlers + camadas de serviço e validação | Endpoints `/api/*` + `DECISIONS.md` |
| Banco persistente | PostgreSQL do Supabase, migrations versionadas | Tabelas e dados sobrevivendo a redeploy |
| Autenticação real do administrador | Supabase Auth + cookies SSR + role verificada no servidor e RLS | Login/logout e rotas protegidas |
| Aplicação roda em Docker | Dockerfile multi-stage; imagem executável localmente | `docker build`, `docker run` |
| Deploy AWS, GCP ou Azure | **GCP Cloud Run** com URL pública HTTPS | Link acessível durante avaliação |
| Admin gerencia parceiros e serviços | CRUD com regras comerciais separadas | Cadastro funcional de parceiro e serviço |
| Serviço tem nome, descrição, fotos, preço e parceiro | Tabelas `services`, `service_media` e `partners` | Serviço cadastrado exibido ao membro |
| Parcerias têm condições comerciais | Tabela privada `partner_terms` | Admin visualiza/edita condições |
| Admin acompanha visto, interesse e vendido | Eventos, pedidos e dashboard | Métricas com valores e estados reais |
| Recomendações para membro ativo | Motor determinístico por plano/dia/horário/unidade | Cenários de recomendação reproduzíveis |
| Membro demonstra interesse ou contrata | Botões com registros persistentes | Eventos e pedido no painel |
| Mobile e visitantes estrangeiros | Layout mobile-first + PT-BR/EN | Testes em viewport de celular e idioma EN |
| Um app para admin e membro é permitido | Um Next.js com rotas segregadas | Navegação baseada em perfil |

### 1.2 Decisões adicionais solicitadas

- **Monorepo** com `pnpm workspaces` e pacotes compartilhados; apenas **um serviço implantável** neste MVP.
- **Supabase Cloud:** PostgreSQL, Supabase Auth e Supabase Storage; banco fora de Docker.
- **Resend:** envio transacional de convites e avisos de interesse/solicitações; entrega de mensagens de Auth via estratégia verificada com Supabase (seção 6).
- **PWA instalável** com `manifest`, service worker e shell offline seguro; operações de negócio exigem conexão.
- **RLS/RBAC** rigorosos, separando `admin` e `member`, com assinaturas `active` e `inactive` (e datas de validade).
- **Convite exclusivo pelo admin**; **admin decide quais membros possuem assinatura válida**.
- **Docker + GCP Cloud Run**, sem usar a VPS existente.

### 1.3 Entregáveis exigidos — TODOS obrigatórios

- [ ] Repositório GitHub público ou acesso concedido aos avaliadores.
- [ ] URL pública e funcional em GCP.
- [ ] Credenciais de teste de administrador + instrução para entrar como membro (usar conta de demo convidada; não publicar senhas reais no repositório).
- [ ] `README.md`: execução local, deploy, arquitetura explicada em figura/parágrafo e credenciais/instruções de demo de forma segura.
- [ ] `DECISIONS.md`: perguntas do enunciado, alternativas, decisões, justificativas, exclusões conscientes e experimento pós-MVP de impacto em receita.
- [ ] `AI_DIARY.md`: ferramentas de IA utilizadas e **3 a 5 erros ou desvios realmente encontrados**, diagnóstico, correção e como foram verificados; links/exportações opcionais.
- [ ] Vídeo de **até 5 minutos** demonstrando: admin cadastrando serviço → membro recebendo recomendação → membro contratando → admin vendo resultado.
- [ ] Produto acessível **durante todo o período de avaliação**; testar no dia da entrega e depois.

### 1.4 Critérios de avaliação (PDF)

| Critério | Peso |
| --- | ---: |
| Produto no ar, fluxo completo na URL pública | **30%** |
| Decisões de escopo e `DECISIONS.md` | **25%** |
| Qualidade de código, arquitetura, Docker e deploy | **20%** |
| Uso crítico da IA + diário | **15%** |
| Experiência mobile do membro | **10%** |

---

## 2. Escopo do MVP e o que NÃO construir

### 2.1 Jornada demonstrável obrigatória

1. Admin acessa `/login`, autentica e abre `/admin`.
2. Admin cria um **parceiro** (ex.: cafeteria) e informa **condições comerciais** (comissão, observações e vigência).
3. Admin cadastra **serviço** com nome, descrições, foto(s), preço, unidade, parceiro, critérios de elegibilidade e disponibilidade por dia/faixa de horário.
4. Admin cria **convite** para `member`, associa unidade/plano e define assinatura inicial (ativa/inativa e expiração opcional). Resend envia e-mail de convite.
5. Convidado aceita o convite e configura acesso; conta de usuário e assinatura ficam persistidas.
6. Membro com **assinatura ativa** abre área mobile e recebe recomendações contextualizadas pelo momento e pelo plano.
7. Membro abre detalhe de serviço; o backend registra a visualização; ele marca interesse ou solicita contratação.
8. O backend persiste a ação, o admin vê o evento/pedido no painel e recebe e-mail transacional (com falha de e-mail não bloqueando o pedido).
9. Admin confirma solicitação. Dashboard atualiza visualizações, interesses, pedidos, contratações confirmadas e **valor potencial/confirmado nominal (não receita recebida)**.
10. Admin desativa a assinatura do membro. O membro consegue fazer login, mas **não** pode ver catálogo/recomendações protegidas nem registrar novas ações; reativação restabelece acesso.

### 2.2 MVP — incluir

- Autenticação por convite, login, logout, aceite do convite e definição/recuperação de senha.
- Um administrador global e membros vinculados a unidades; uma unidade principal de demonstração, modelo preparado para mais unidades.
- Planos `basic` e `premium` de demonstração; status de assinatura controlado por admin.
- Cadastro e listagem de unidades (seed; editar unidades fica opcional), parceiros, termos comerciais e serviços; arquivar serviço sem apagar histórico.
- Regras simples de recomendação por plano, dia da semana e faixa horária; fallback para serviços elegíveis publicados.
- Página do membro com catálogo/recomendações, detalhes, interesse e contratação sem cobrança financeira.
- Métricas reais; notificações por e-mail Resend, PWA básica, UI PT/EN, acessibilidade e teste responsivo.
- Proteção SSR, endpoints autorizados, RLS, políticas do Storage, migrações SQL e testes de permissão.

### 2.3 Fora do MVP — registrar em `DECISIONS.md`

- Processamento de **pagamento real**, gateway, emissão fiscal ou repasse financeiro.
- Assinaturas pagas e renovação automática (o admin atribui a validade manualmente).
- App nativo, geolocalização em tempo real, push notifications, recomendação por ML/LLM, ranking por comportamento histórico, chat, ERP.
- Marketplace público, auto-cadastro, sistema de múltiplos papéis complexos, painel do parceiro, backoffice financeiro completo.
- Offline para login/contratação (PWA offline apenas shell e explicação; sem dados sensíveis em cache).

**Terminologia de negócio:** clicar em “Contratar” cria uma **solicitação de contratação** (`requested`); o admin pode confirmar (`confirmed`). Sem gateway, o sistema **não prova pagamento recebido**. Os indicadores devem distinguir **pedidos**, **contratações confirmadas** e **receita potencial/valor contratado**, evitando declarar “faturamento recebido”.

---

## 3. Arquitetura e decisões tecnológicas

### 3.1 Stack

| Camada | Escolha | Motivo |
| --- | --- | --- |
| Monorepo | `pnpm` workspaces | Compartilha schemas, tipos, UI e config sem dois deploys |
| Frontend | Next.js App Router + React + TypeScript | Mesmo runtime para web e APIs; excelente para 7 dias |
| Backend | Next.js Route Handlers + services/repositories + TypeScript | Atende API moderna e mantém regras próprias |
| Validação | Zod | Schemas compartilhados e validação no servidor |
| UI | Tailwind CSS + componentes acessíveis | Mobile-first, implementação enxuta |
| Banco | Supabase PostgreSQL | Persistência gerenciada; fora do Docker |
| Auth | Supabase Auth + `@supabase/ssr` | Sessão em cookies e verificação server-side |
| Fotos | Supabase Storage | Persistência de imagem fora do filesystem efêmero do Cloud Run |
| E-mails | Resend | Convites + notificações transacionais |
| PWA | Manifest + service worker mínimo | Instalação, ícones, tela offline sem dados privados |
| Testes | Vitest + Playwright + Supabase CLI/pgTAP | Lógica, E2E e políticas RLS |
| Container | Docker multi-stage, Next standalone | Deploy reproduzível e imagem menor |
| Cloud | Google Cloud Run + Artifact Registry | URL HTTPS, container gerenciado e escala por demanda |
| Observabilidade | Cloud Logging + logs estruturados no backend | Diagnóstico e evidência para demo |

**Importante:** Supabase também oferece Data API/Edge Functions, mas a **API principal de negócio será nossa**, em TypeScript, hospedada no container Next.js. No navegador, usar Supabase Auth apenas quando necessário ao fluxo de sessão; ações de negócios passam pelas rotas `/api/*`. Toda consulta com identidade do usuário deve respeitar RLS, inclusive no servidor. A chave privilegiada serve **apenas** a operações administrativas de Auth cuidadosamente protegidas.

### 3.2 Desenho lógico

```text
              ADMIN / MEMBRO (DESKTOP OU CELULAR)
                        HTTPS / PWA
                            |
                  GCP CLOUD RUN (Docker)
                  apps/web — Next.js TS
              +----------------------------+
              | React UI / Server Rendering|
              | /api/* Route Handlers      |
              | Guards de role/assinatura  |
              | Services / Zod / i18n      |
              | Regras e analytics         |
              +----------------------------+
                     |              |
             user-scoped SSR        | Resend API
             + admin Auth isolado   v
                     |          E-MAILS
               SUPABASE CLOUD
       +-------------------------------+
       | PostgreSQL + RLS              |
       | Auth (sessões e convites)     |
       | Storage (imagens de serviços) |
       +-------------------------------+
```

- **Um único container** para UI + backend; sem `postgres` no Docker e sem Kubernetes.
- **Dados persistentes** em Supabase e não no disco do Cloud Run.
- **Sem exposição de DB/Admin tokens ao browser**. Cookies de sessão seguros; aplicar guard no servidor, não apenas no middleware/redirecionamento.
- **Sem dependência de cron/worker** no MVP: envio de e-mails é best-effort com tratamento de erro; estado principal é persistido antes do envio. Registrar falhas para reenvio manual.

### 3.3 Estrutura do monorepo

```text
orbita-product-builder/
├── apps/
│   └── web/
│       ├── app/
│       │   ├── (public)/login/page.tsx
│       │   ├── (public)/auth/confirm/route.ts
│       │   ├── (public)/accept-invite/page.tsx
│       │   ├── (public)/offline/page.tsx
│       │   ├── (admin)/admin/...                 # dashboard, parceiros, serviços, usuários, pedidos
│       │   ├── (member)/member/...               # recomendações, catálogo, pedidos
│       │   ├── api/admin/invitations/route.ts
│       │   ├── api/admin/members/[id]/subscription/route.ts
│       │   ├── api/partners/...                  # CRUD admin
│       │   ├── api/services/...                  # CRUD admin / consultas de membro
│       │   ├── api/recommendations/route.ts
│       │   ├── api/events/route.ts
│       │   ├── api/orders/...                    # contratação e confirmação
│       │   ├── api/analytics/route.ts
│       │   ├── api/health/route.ts
│       │   ├── manifest.ts
│       │   └── layout.tsx
│       ├── components/
│       ├── lib/
│       │   ├── supabase/{browser,server,admin}.ts
│       │   ├── auth/{get-current-user,require-admin,require-active-member}.ts
│       │   ├── services/{invitations,recommendations,orders,analytics}.ts
│       │   ├── email/{resend,templates}.ts
│       │   └── i18n/
│       ├── public/{icons,sw.js,offline-assets}
│       ├── next.config.ts
│       └── package.json
├── packages/
│   ├── shared/                # Zod, DTOs, constantes e tipos
│   ├── ui/                    # componentes compartilhados (somente quando houver reuso real)
│   └── config/                # ESLint/TypeScript
├── supabase/
│   ├── migrations/           # schema + indexes + triggers + RLS + storage policies
│   ├── seeds/                # dados fictícios demonstrativos
│   └── tests/                # testes SQL de RLS (pgTAP)
├── tests/e2e/
├── .github/workflows/ci.yml
├── Dockerfile
├── .dockerignore
├── pnpm-workspace.yaml
├── pnpm-lock.yaml
├── .env.example
├── README.md
├── DECISIONS.md
├── AI_DIARY.md
└── PLAN.md
```

**Nota:** nomes de arquivos/rotas são referência e podem ser ajustados sem alterar requisitos; evitar abstrações/camadas que só adicionem complexidade.

---

## 4. Domínio, modelo de dados e integridade

### 4.1 Entidades e campos mínimos

1. **`units`**: `id`, `name`, `slug`, `timezone` (`America/Sao_Paulo` na unidade demo), `active`, timestamps. Uma unidade demo; membros e serviços apontam para ela.
2. **`plans`**: `id`, `code` (`basic`, `premium`), `name`, `active`. Somente admin altera planos.
3. **`profiles`**: `id` = `auth.users.id` (FK), `email` ou referência consultada no Auth, `full_name`, `role` (`admin`/`member`), `unit_id`, `preferred_locale` (`pt-BR`/`en`), timestamps. Papel não pode ser editado pelo membro.
4. **`memberships`**: `id`, `user_id` **UNIQUE**, `plan_id`, `status` (`active`/`inactive`), `starts_at`, `expires_at` nullable, `changed_by` (admin), `updated_at`. Validade efetiva = papel member + status active + intervalo de datas válido.
5. **`invitations`**: `id`, `email`, `invited_user_id`, `invited_by`, `unit_id`, `plan_id`, `initial_status`, `status` (`pending`, `accepted`, `delivery_failed`, `revoked`), timestamps; permitir reenvio seguro, auditar tentativas; **nunca guardar link de convite ou token em texto puro**.
6. **`partners`**: `id`, `unit_id`, `name`, `description`, `contact_email` (privado para admin se presente), `status` (`active`/`inactive`), timestamps. **Contato sensível pode ficar em tabela privada ou somente em resposta admin**, não expor no DTO de membro.
7. **`partner_terms`**: `id`, `partner_id`, `commission_percent` nullable, `fixed_fee_cents` nullable, `notes`, `valid_from`, `valid_until`, timestamps; **somente admin lê**. Não misturar com o registro de parceiro visível ao membro.
8. **`services`**: `id`, `unit_id`, `partner_id`, `name`, `description_pt`, `description_en` nullable, `price_cents` inteiro positivo, `currency` (`BRL`), `category`, `status` (`draft`, `published`, `archived`), timestamps.
9. **`service_media`**: `id`, `service_id`, `storage_path`, `sort_order`, `alt_pt`, `alt_en` nullable. Fotos persistidas no Supabase Storage; nenhuma URL local de container.
10. **`recommendation_rules`**: `id`, `service_id`, `plan_id` nullable (= qualquer plano), `weekdays` array 0–6 (definir convenção), `start_time`/`end_time`, `priority`, `enabled`. Executar contexto temporal na timezone da unidade. Restringir `start_time < end_time` no MVP, sem janelas noturnas atravessando meia-noite.
11. **`service_events`**: `id`, `member_id`, `service_id`, `type` (`view`, `interest`), `occurred_at`, `idempotency_key` nullable, `unit_id` validada/derivada. Registros imutáveis; eventos devem ter autor ligado ao Auth, serviço elegível e unidade correta.
12. **`orders`**: `id`, `member_id`, `service_id`, `unit_id`, `status` (`requested`, `confirmed`, `cancelled`), `quantity` (MVP = 1), `unit_price_cents`, `total_cents`, `created_at`, `confirmed_at`, `confirmed_by`, `cancelled_at`. O banco calcula/preenche valores de preço a partir do serviço, nunca confia em `total_cents` do cliente.
13. **`email_deliveries`** (leve): `id`, `kind` (`invite`, `interest_alert`, `order_alert`), `recipient`, `related_id`, `status` (`sent`, `failed`), `provider_message_id` nullable, `error_code` seguro/curto, timestamps. Só admin acessa; não armazenar tokens ou corpo confidencial.
14. **`audit_logs`** (leve): `id`, `actor_user_id`, `action`, `target_table`, `target_id`, `occurred_at`, `safe_metadata` JSON sem segredos. Persistir alterações de assinatura, confirmação de pedidos e convites; não permitir escrita livre por membros.

### 4.2 Constraints e indexes essenciais

- FKs coerentes, `ON DELETE RESTRICT` para pedidos e histórico; serviços e parceiros com **arquivamento lógico**, não exclusão em cascata de contratações.
- `UNIQUE (memberships.user_id)`, `UNIQUE (plans.code)`, `UNIQUE (units.slug)`.
- `CHECK(price_cents >= 0)`, `CHECK(commission_percent BETWEEN 0 AND 100)`; estados via enum ou check; datas consistentes.
- Indexes: `profiles(role, unit_id)`, `memberships(user_id, status)`, `services(unit_id, status, partner_id)`, `recommendation_rules(service_id, enabled)`, `service_events(service_id, type, occurred_at)`, `orders(member_id, status, created_at)`, `orders(service_id, status, created_at)`, `invitations(email, status)`.
- Evento de view pode ser deduplicado por `(member_id, service_id, janela lógica)` com regra de idempotência no backend; não duplicar sempre que houver rerender. Usar IDs idempotentes em pedidos para mitigar duplo clique/retries.
- O membro da solicitação e o serviço devem pertencer à **mesma unidade**; parceria também. Validar no backend **e** em trigger/função de banco.
- A própria função/trigger do banco deve forçar `member_id = auth.uid()` para criação de pedidos e eventos quando originados de usuário autenticado, assegurando identidade mesmo com payload malicioso.

### 4.3 Relação entre perfil e assinatura

- **Role** (`admin` ou `member`) responde: *o que o usuário pode fazer?*
- **Membership** (`active`/`inactive`, plano e período) responde: *a qual oferta o membro tem acesso agora?*
- **Não armazenar assinatura ativa só no JWT**, porque o admin precisa revogar o acesso imediatamente. Consultar `memberships` atual em endpoint e RLS.
- Admin não precisa de assinatura ativa para acessar o painel. Inativar uma assinatura **não** altera automaticamente o role.
- `expires_at = NULL` significa assinatura sem data limite **somente se** `status = active`; exigir `starts_at <= now()` e `expires_at IS NULL OR expires_at > now()`.
- Um membro inativo recebe tela clara de acesso suspenso, nunca serviços privados ou preços/catálogo por API.

---

## 5. Segurança: autenticação, autorização e RLS (CRÍTICO)

### 5.1 Papéis e operações

**Papéis suportados no MVP:**

- `admin`: autentica, cria convites para `member`, controla assinaturas/planos/unidades, gerencia parceiros/termos/serviços/regras/fotos, lê eventos/pedidos e confirma pedidos, consulta dashboard.
- `member` com assinatura **ativa e válida**: vê seus próprios dados e serviços publicados **da sua unidade**, recebe recomendações, registra interesse/visualização, solicita contratação, consulta seus próprios pedidos.
- `member` com assinatura **inativa, futura ou expirada**: autentica, vê **somente seu perfil e status da assinatura**, tela de bloqueio; não acessa catálogo/recomendações e não cria eventos/pedidos.
- `anon`: **nenhum dado privado** da aplicação; apenas login, aceite de convite e assets públicos mínimos.

**Nenhum `partner_admin` e nenhum cadastro público neste escopo.** Criar o admin inicial manualmente com script de bootstrap restrito ou procedimento documentado fora do aplicativo. Não colocar credenciais fixas no código.

### 5.2 Matriz RLS de acesso a dados

| Tabela | Anônimo | Admin | Membro válido | Membro inválido |
| --- | --- | --- | --- | --- |
| `units` | Nada | Ler/gerir | Ler própria unidade | Ver identificação mínima da própria unidade se necessário |
| `plans` | Nada | Ler/gerir | Ler plano próprio | Ler plano próprio |
| `profiles` | Nada | Ler/gerir perfis | Ler **o próprio** | Ler **o próprio** |
| `memberships` | Nada | Ler/criar/alterar | Ler **a própria** | Ler **a própria** |
| `invitations` | Nada | Criar/ler/revogar | Nada | Nada |
| `partners` | Nada | Gerir | Ler apenas parceiros ativos com serviço publicado da própria unidade | Nada |
| `partner_terms` | Nada | Gerir | Nada | Nada |
| `services` | Nada | Gerir | Ler **publicados da própria unidade** | Nada |
| `service_media` | Nada | Gerir | Ler apenas mídia de serviço visível | Nada |
| `recommendation_rules` | Nada | Gerir | Idealmente sem acesso direto; backend consulta regras autorizadas | Nada |
| `service_events` | Nada | Ler/analytics | Inserir e ler **próprios** (tipos permitidos) | Nada |
| `orders` | Nada | Ler/confirmar/cancelar | Criar solicitação e ler **próprias** | Nada |
| `email_deliveries` | Nada | Ler | Nada | Nada |
| `audit_logs` | Nada | Ler | Nada | Nada |

**Regras de escrita ainda mais estritas:**

- Apenas admin altera `role` e atributos de assinatura; **não conceder `UPDATE` em `profiles.role`, `memberships.*` ou `invitations.*` a membros**. Preferir `profiles` totalmente read-only a membros no MVP.
- Membro **não** define preço, valor total, unidade, status de pedido nem `confirmed_by`; trigger/função transacional determina essas informações.
- Membro **não** confirma seus próprios pedidos e **não** cria termos comerciais.
- `service_events`: `INSERT` somente com `member_id = auth.uid()`, `type IN ('view','interest')`, assinatura vigente, serviço elegível da unidade. Sem `UPDATE`/`DELETE`.
- `orders`: `INSERT` somente por membro ativo para serviço publicado da própria unidade, com preço e status estabelecidos pelo banco; `SELECT` do próprio; `UPDATE` de status só por admin via endpoint e SQL restringindo colunas.
- `invitations`: só admin; chave de Auth administrativa utilizada exclusivamente no servidor após **verificar role real no banco**.
- Toda API administrativa valida sessão e admin de forma **repetida no servidor**, mesmo que a UI esconda botões.

### 5.3 Implementação segura das políticas

1. Criar **migrations SQL** para schema, grants, índices e RLS versionadas no Git.
2. Habilitar `ALTER TABLE ... ENABLE ROW LEVEL SECURITY` em **todas** as tabelas expostas; negar acesso anônimo e conceder somente privilégios SQL necessários a `authenticated`.
3. Criar funções auxiliares em schema **`private` não exposto na Data API**:
   - `private.is_admin()` → true somente se `auth.uid()` corresponde a perfil com `role = 'admin'`.
   - `private.has_active_membership()` → valida usuário corrente, role member, status, início e expiração.
   - `private.is_service_visible(service_id)` → assinatura vigente, unidade e serviço `published`.
   - `private.is_same_unit(member_id, service_id)` → valida vinculação.
4. Se usar `SECURITY DEFINER`, definir `SET search_path = ''`, nomes de schema totalmente qualificados e `EXECUTE` estritamente concedido a `authenticated`; nunca criar funções privilegiadas em schema publicamente exposto sem necessidade.
5. Evitar política RLS autorreferente em `profiles` que recursa: `private.is_admin()` usa desenho testado contra recursão.
6. Para `UPDATE`, usar `USING` e `WITH CHECK`; bloquear troca de PK/FK/papel e conferir grants de colunas ou operações via função/trigger.
7. Isolar informações comerciais em `partner_terms` (RLS separada); **RLS em linha não oculta colunas de uma linha visível**.
8. Evitar views `SECURITY DEFINER` que contornem RLS; preferir consultas server-side ou views com `security_invoker = true`.
9. Sem confiança em `user_metadata` controlável pelo próprio usuário para `role`/`membership`; a autoridade é a tabela protegida do banco.
10. RLS para `storage.objects`: bucket de fotos de serviços **privado**; admin pode upload/update/delete; membros válidos podem ler objetos de serviços publicados da sua unidade mediante política e URLs assinadas de curta duração. Validar path, extensão e tamanho (ex.: JPG/PNG/WebP até 5 MB). Não armazenar fotos particulares dos usuários.

#### Esqueleto ilustrativo (não substituir as migrations e testes completos)

```sql
-- Exemplo resumido: adaptar ao schema migrado de fato.
create schema if not exists private;

create or replace function private.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = (select auth.uid()) and p.role = 'admin'
  );
$$;

create or replace function private.has_active_membership()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles p
    join public.memberships m on m.user_id = p.id
    where p.id = (select auth.uid())
      and p.role = 'member'
      and m.status = 'active'
      and m.starts_at <= now()
      and (m.expires_at is null or m.expires_at > now())
  );
$$;

revoke all on function private.is_admin() from public;
revoke all on function private.has_active_membership() from public;
grant usage on schema private to authenticated;
grant execute on function private.is_admin() to authenticated;
grant execute on function private.has_active_membership() to authenticated;

alter table public.memberships enable row level security;
create policy memberships_admin_select
on public.memberships for select to authenticated
using ((select private.is_admin()));

create policy memberships_self_select
on public.memberships for select to authenticated
using (user_id = (select auth.uid()));

-- Grants de UPDATE/INSERT para a role DB `authenticated` devem ser
-- concedidos apenas se as políticas e restrições de coluna/trigger
-- cobrirem rigorosamente as operações; criar políticas admin explícitas.
```

**Alerta técnico:** no PostgreSQL, uma política `FOR UPDATE` sozinha não impede alteração de colunas sensíveis **quando uma linha é atualizável**. Complementar com `GRANT UPDATE (colunas específicas)`, triggers e/ou uma API transacional segura. Como admin gerencia status, a atualização é validada novamente no backend. O SQL acima é didático e **não representa a suíte completa de RLS**.

### 5.4 Segurança do SSR, APIs e dados

- Sessão `@supabase/ssr` via cookies; autenticação verificada server-side com API adequada (`getUser()`/`getClaims()` conforme fluxo suportado), não confiar apenas em `getSession()` ou em dados enviados pelo cliente.
- Incluir checks de autorização em **cada Route Handler**, e também em Server Components de páginas protegidas.
- Acesso DB realizado com **cliente Supabase vinculado à sessão do usuário** para que RLS seja aplicada. Se um cliente privilegiado precisar executar algo (ex.: Auth admin), manter em módulo server-only exclusivo, depois de `requireAdmin()`.
- Proteção contra CSRF em mutações autenticadas via cookies: origem/referer confiáveis, `SameSite` apropriado e práticas de Server Actions/Route Handlers do framework. Rate limit para login/convites/escritas.
- Validar entradas com Zod, limite de texto/upload, MIME, tamanho de arquivos e URLs; não confiar na extensão de arquivo.
- Regras e preços devem ser reavaliados no momento da contratação (evita dados obsoletos); operação atômica no banco para snapshot de preço/status.
- Logar status, IDs e tempos, não senhas, tokens, URLs de convite, conteúdo privado de e-mails, nem chaves.
- Configurar headers de segurança adequados, HTTPS obrigatório e URLs de redirect allowlist exatas (produção e localhost).
- `SUPABASE_SERVICE_ROLE_KEY` ou secret key nunca em variável `NEXT_PUBLIC_*` nem em artefatos cliente, HTML, bundle ou source map.

### 5.5 Testes negativos de RLS (não opcionais)

- [ ] `anon` não lê `profiles`, `memberships`, `orders`, `partner_terms` ou catálogo privado.
- [ ] `member` não acessa `/admin` nem endpoints de admin (403).
- [ ] `member` não gera convite (403; testar chamando HTTP manualmente).
- [ ] `member` não altera `profiles.role` ou status/plano de `memberships` via REST/SQL.
- [ ] `member` não vê perfil, assinatura, eventos ou pedidos de **outro membro**.
- [ ] `member` ativo de unidade A não vê serviços de unidade B.
- [ ] `member` inativo/expirado não consulta recomendações, serviços, mídias privadas, nem cria interesse/pedido.
- [ ] `member` não lê `partner_terms` ou contatos administrativos.
- [ ] `member` não envia pedido com preço menor, outra unidade, outro autor ou `status=confirmed`.
- [ ] `member` não atualiza nem exclui `orders`/`service_events` de outro usuário.
- [ ] Desativação da assinatura por admin passa a valer **sem novo login**.
- [ ] Link de convite expirado, usado duas vezes ou de outra origem não concede acesso indevido.
- [ ] Link de imagem privada não oferece acesso permanente após revogação (URLs temporárias podem durar até sua expiração; manter TTL curto).
- [ ] Após redeploy/restart do container os dados permanecem.

---

## 6. Convites, Auth e envio de e-mails com Resend

### 6.1 Estratégia escolhida

**Convite-only** com Supabase Auth e Resend, sem cadastro público:

1. Desabilitar **signups públicos** no Supabase Auth e não criar `/signup`.
2. Criar admin inicial por um **bootstrap administrativo manual** documentado; não permitir que usuário se torne admin a partir de convite público.
3. Admin abre `/admin/members`, informa e-mail, nome, unidade, plano e validade/status inicial, e confirma o convite.
4. `POST /api/admin/invitations` exige sessão válida, `role=admin` no banco, schema validado e checagem anti-duplicidade.
5. Servidor invoca **Supabase Auth Admin `generateLink({ type: 'invite', email, options })`** via cliente privilegiado isolado. Essa operação gera link/token de autenticação, mas **não envia o e-mail automaticamente**.
6. Servidor registra metadados do convite, perfil com role **member** e assinatura pelo fluxo controlado/trigger. `role` e assinatura **não** são derivados de `user_metadata` enviado pelo convidado.
7. Servidor envia e-mail pelo **Resend API**, com URL de aceite HTTPS derivada da propriedade de link/token prevista pelo Supabase. Não salvar token nem link em banco/log. Incluir redirecionamento `SITE_URL` estritamente permitido.
8. `/auth/confirm` verifica token de convite usando fluxo SSR suportado (`verifyOtp` com `token_hash`/`type='invite'`, ou código PKCE se for o link gerado usado); estabelece sessão segura e redireciona para `/accept-invite`.
9. Convidado confirma identificação, define senha pelo fluxo Auth apropriado e acessa `/member`; atualizar `invitations.status=accepted` de forma confiável. Sem privilégio de admin.
10. Admin consegue consultar convites `pending`/`accepted`/`delivery_failed` e reenviar com **novo link válido**, tratando usuário já criado no Auth sem criar conta duplicada (validar método de reenvio contra a versão efetiva da API).
11. Toda ativação/desativação de assinatura é independente do aceite; convite aceito com assinatura inativa leva à tela de status, sem catálogo.

**Implementação do e-mail de Auth:** há duas opções suportadas; selecionar e documentar apenas uma após teste integrado:

- **Principal (preferida neste desafio):** gerar link administrativo no backend e enviá-lo diretamente pelo Resend API; evita duplicar o envio de convite pelo Supabase SMTP. Conferir link de aceite/callback SSR com testes E2E.
- **Alternativa para e-mails automáticos de Auth** (recuperação de senha, confirmações): configurar **Resend SMTP como SMTP customizado do Supabase Auth**, com templates e redirect allowlist. Não depender do SMTP gratuito padrão do Supabase para e-mails reais; ele é restrito e inadequado para vários destinatários. Evitar mandar o mesmo convite pelos dois mecanismos.

**Observação:** `generateLink(type='invite')` e a confirmação SSR precisam ser validados no projeto real, inclusive reenvios e expiração. Não presumir que a API reenvia convites existentes de forma idempotente. Documentar comportamento e fallback seguro.

### 6.2 E-mails previstos

| Evento | Destinatário | Conteúdo | Falha de envio |
| --- | --- | --- | --- |
| Convite criado | Convidado | Convite + link único/expirável | Registrar `delivery_failed`; permitir reenvio pelo admin |
| Interesse em serviço | Admin/caixa de operação | Membro, serviço, horário e link interno, mínimo de PII | Evento permanece salvo e visível no painel |
| Contratação solicitada | Admin/caixa de operação | Pedido, membro, serviço e link do pedido | Pedido permanece salvo; registrar falha |
| Confirmação do pedido (desejável) | Membro | Confirmação informativa, sem alegar pagamento | Pedido continua válido |
| Recuperação de senha | Usuário | Fluxo de Auth via Resend SMTP/integração apropriada | Mostrar erro seguro, permitir repetir respeitando limite |

### 6.3 Operação Resend

- Verificar domínio de envio e configurar registros DNS requeridos (SPF, DKIM; DMARC recomendado), com remetente válido (`no-reply@SEU_DOMINIO` de exemplo).
- Configurar `RESEND_API_KEY`, `EMAIL_FROM`, `ADMIN_NOTIFICATION_EMAIL`; segredos somente no servidor/Secret Manager.
- Templates simples e responsivos em PT-BR (EN opcional), com texto alternativo; evitar adicionar imagens complexas no prazo.
- Tratar rate limit, timeout e erro do provedor; **persistir evento/pedido antes** de tentar notificação.
- Não enviar senha em texto puro; links de Auth são de uso restrito/expiração; não incluir JWT em logs.

---

## 7. Produto e regras funcionais

### 7.1 Painel admin (rotas `/admin/*`)

**Dashboard:** cards com quantidade de views (definição: eventos registrados), interesses, solicitações, confirmações, conversão interesse→solicitação/solicitação→confirmação, valor total confirmado nominal, lista das últimas atividades e ranking de serviços. Filtros simples por unidade/intervalo (mínimo últimos 7/30 dias, com dados reais).

**Parceiros:** lista, criar, editar, ativar/inativar; mostrar dados de contato e condições comerciais (`partner_terms`) apenas ao admin.

**Serviços:** lista, criar, editar, arquivar/publicar; formulário: nome, descrições PT/EN, categoria, preço em centavos (exibir BRL), parceiro, unidade, fotos, dias/horários/planos, prioridade. Preview responsivo.

**Membros e convites:** lista membros com role, plano, unidade, assinatura/status, expiração, ações `Ativar`, `Desativar`, `Alterar plano`, `Alterar validade`, `Convidar membro`, `Reenviar convite`. Confirmar operações sensíveis e mostrar quem efetuou a mudança.

**Pedidos/interesses:** lista com estados; admin confirma/cancela solicitações e visualiza sinalizações de interesse. Ação de confirmação altera métrica e produz trilha de auditoria.

### 7.2 Área do membro (`/member/*`)

- Boas-vindas, unidade atual, selo do plano e recomendações atuais; mobile-first.
- Cards com foto, título, preço, parceiro, duração/tipo quando aplicável, CTA `Tenho interesse` e `Contratar`.
- Detalhe do serviço, interesse (sem duplicar excessivamente) e confirmação da solicitação de contratação.
- Tela `Meus pedidos` com estado `Solicitado / Confirmado / Cancelado`.
- Se assinatura inválida, mostrar `Assinatura inativa/expirada` e orientar contato com recepção/admin; **não** renderizar dados privados do catálogo no HTML.
- Troca PT-BR / EN, textos de ação e mensagens de erro em ambos idiomas; fallback de descrição para português se tradução ainda não cadastrada.

### 7.3 Recomendações do MVP (determinísticas, transparentes)

**Inputs**: membro autenticado, `memberships.plan_id`, `profiles.unit_id`, horário atual na timezone da unidade, dia da semana, serviços publicados e regras ativas.

**Algoritmo inicial**:

1. Rejeitar membro sem assinatura válida (403).
2. Listar serviços `published`, parceiro `active`, unidade do membro.
3. Selecionar regras compatíveis com plano ou plano genérico, dia e horário da unidade.
4. Ordenar por `priority DESC`, depois critérios estáveis (ex.: `created_at DESC`, `id`) para resultado reproduzível.
5. Se poucas regras casarem, completar com serviços publicados da própria unidade autorizados para o plano, sem mostrar serviço que tenha **restrição explícita de plano** incompatível.
6. Retornar `reason`/etiqueta simples, por exemplo: `Disponível agora`, `Combina com seu plano`, sem expor dados do usuário.
7. Registrar view **quando o cartão/detalhe é efetivamente visualizado** (evento validado) e não em todo rerender/prefetch.

**Casos de teste**: `basic` vs `premium`, dia útil vs fim de semana, manhã vs tarde, parceiro inativo, serviço arquivado, assinatura expirada, mudança de timezone. Seed com 6–10 serviços variados (café, estacionamento, sala, yoga, massagem, day pass).

### 7.4 Métricas e hipótese de produto

- `views`: eventos `view` únicos ou totais — **definir explicitamente** no README/UI (recomendado: views únicas por membro-serviço-dia).
- `interests`: eventos `interest` (preferir únicos por membro-serviço por janela para reduzir spam).
- `orders_requested`: contagem de solicitações.
- `orders_confirmed`: contagem confirmada pelo admin.
- `conversion`: pedidos/view e confirmados/pedidos, com denominador visível e sem divisão por zero.
- `nominal_confirmed_value`: soma dos `total_cents` de pedidos confirmados (não significa pagamento realizado).
- Não inventar aumento de receita. `DECISIONS.md`: propor teste A/B por unidade/membro, variante com vs sem recomendações, comparar receita extra por membro ativo/visita, conversão, frequência, intervalo definido, sazonalidade e efeitos de seleção; integrar pagamentos reais só depois do MVP.

---

## 8. API própria (contratos iniciais)

> Todas as rotas abaixo são **Route Handlers Next.js**, documentadas e tipadas via Zod. Responder JSON coerente; `401` não logado, `403` sem autorização/assinatura, `404` recurso ausente/invisível, `409` conflito/idempotência, `422` validação, `429` limite. Não retornar detalhes sensíveis de falhas.

| Método/rota | Acesso | Resultado |
| --- | --- | --- |
| `GET /api/health` | Público | `{ ok: true }` sem segredos |
| `GET /api/me` | Autenticado | Perfil, role, unidade, plano e validade atuais |
| `GET /api/recommendations` | Membro válido | Recomendações contextualizadas |
| `GET /api/services` | Membro válido/admin | Lista autorizada conforme papel |
| `GET /api/services/:id` | Membro válido/admin | Detalhes, imagens autorizadas |
| `POST /api/events` | Membro válido | Registra `view` ou `interest`, com proteção idempotente |
| `POST /api/orders` | Membro válido | Cria solicitação com preço calculado pelo servidor/banco |
| `GET /api/orders` | Autenticado | Admin: todos; membro: só próprios |
| `PATCH /api/orders/:id` | Admin | Confirma/cancela, auditando mudança |
| `GET /api/analytics` | Admin | Métricas derivadas de tabelas reais |
| `GET/POST /api/partners` | Admin | Consulta/cria parceiros |
| `PATCH /api/partners/:id` | Admin | Atualiza/inativa parceiro |
| `GET/POST /api/admin/services` | Admin | Gestão de catálogo |
| `PATCH /api/admin/services/:id` | Admin | Edita/publica/arquiva |
| `GET/POST /api/admin/invitations` | Admin | Lista/cria convites |
| `POST /api/admin/invitations/:id/resend` | Admin | Emite novo link de forma segura e envia Resend |
| `GET /api/admin/members` | Admin | Lista membros, plano e status |
| `PATCH /api/admin/members/:id/subscription` | Admin | Ativa/desativa, muda plano/datas |
| `POST /api/admin/services/:id/media` | Admin | Upload validado e registrado no Storage |

**Backend internals:** handlers leves; usar `requireAdmin()`, `requireActiveMember()`, schemas Zod, services e adapters/repositories. Não duplicar regras de acesso em vários handlers. Testar endpoints pela rede, inclusive sem depender da interface.

---

## 9. PWA, responsividade, acessibilidade e internacionalização

### 9.1 PWA mínima segura

- `app/manifest.ts`: nome **Órbita**, short name, `start_url`, `display='standalone'`, ícones 192/512 e maskable, `theme_color`/`background_color`.
- Service worker em `public/sw.js` ou ferramenta compatível com a versão exata do Next.js. **Cache somente de shell e assets estáticos públicos**, nunca HTML autenticado, respostas `/api`, cookies, tokens, e-mails, links de convite, perfil, pedidos ou serviços privados.
- Tela `/offline` com aviso e retry; catálogo e contratação requerem conexão. Não simular sucesso offline.
- Testar instalação em Android Chrome e comportamento `Add to Home Screen`/iOS Safari conforme recursos do navegador, HTTPS e ícones; usar Lighthouse como verificação complementar, não como critério único.
- Garantir atualização de service worker e desregistro da versão antiga; controlar impacto de cache após logout.

### 9.2 UX mobile

- Layout primeiro em ~375px, toque com alvos confortáveis, cards legíveis, modais acessíveis, estados de loading/empty/error.
- Formulário admin responsivo, mas prioridade de polimento visual no fluxo do membro.
- Loading skeleton, feedback de sucesso, prevenção de duplo clique em `Contratar`.
- `<html lang>` e mensagens PT/EN; exibição de dinheiro via `Intl.NumberFormat` e horários conforme timezone da unidade.
- Acessibilidade mínima: labels, foco visível, navegação por teclado, `alt` em fotos e contraste suficiente.

---

## 10. Ambiente, variáveis e configurações externas

### 10.1 Contas/serviços a preparar

1. **GitHub**: repositório e permissões para avaliadores.
2. **Supabase**: projeto Cloud na região mais próxima apropriada; registrar Project URL e chave publicável, segredo de servidor, storage bucket privado `service-images`.
3. **Resend**: conta, verificação do domínio remetente, DNS e chave; definir caixa de notificações administrativas.
4. **GCP**: projeto com faturamento habilitado, APIs **Cloud Run, Artifact Registry, Cloud Build**; `gcloud` local; configurar orçamento e alertas (não bloqueiam cobranças automaticamente).
5. **Cloud Run**: região escolhida e documentada, instâncias mínimas = 0 para baixo custo se viável, HTTPS público, `PORT` dinâmico, secrets em ambiente de execução.
6. **Supabase Auth**: URL de produção e allowlist de redirects; habilitar login por e-mail e **desabilitar signups públicos**; estratégia de e-mails Auth via Resend SMTP se necessária.

### 10.2 `.env.example` (placeholders — nunca segredos reais)

```dotenv
# Acesso público (pode aparecer no client)
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=https://PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_example

# Apenas servidor — nunca NEXT_PUBLIC_*
SUPABASE_SERVICE_ROLE_KEY=SET_IN_SECRET_MANAGER
RESEND_API_KEY=SET_IN_SECRET_MANAGER
EMAIL_FROM=Orbita <no-reply@SEU_DOMINIO_VERIFICADO>
ADMIN_NOTIFICATION_EMAIL=admin@example.com

# Configuração operacional
NODE_ENV=development
DEFAULT_LOCALE=pt-BR
```

**Observações:** a nomenclatura de chaves varia conforme geração/SDK do Supabase; documentar a escolhida e não misturar key legacy com publishable/secret inadvertidamente. Se utilizar conexão SQL direta em tarefas/migrações, `DATABASE_URL` deve ficar **apenas** em contexto administrativo de migrations, nunca no client e preferencialmente fora do runtime da API. Não exigir `DATABASE_URL` no container Next.js se toda persistência passar pelo SDK Supabase.

### 10.3 Docker e Google Cloud Run

- `Dockerfile` **multi-stage** com `pnpm`, cache de dependências e `output: 'standalone'` no Next.js.
- Como é **monorepo**, assegurar que o standalone rastreie pacotes de `packages/*` corretamente (`outputFileTracingRoot` se necessário), copiando `public` e `.next/static` para a imagem final.
- Executar com usuário não-root, rodar lint/typecheck/tests no CI, adicionar `.dockerignore`, não copiar `.env.local` para imagem.
- Container escuta em `0.0.0.0:$PORT` (Cloud Run define `PORT`); executar `node server.js` conforme estrutura do standalone. Não gravar dados persistentes no disco local.
- Publicar imagem no **Artifact Registry**, implantar no **Cloud Run** e configurar env/secrets. Provisionar **somente os recursos necessários**; região e quotas devem ser verificadas com os preços vigentes.
- Endpoint `/api/health`; logs no Cloud Logging; monitorar status, erros 500 e volume de requisições.
- Testar após deploy: login admin, convite e-mail, membro, assinatura, fotos, compra simulada, dashboard, acesso por celular, PWA.
- **Custos:** Cloud Run tem franquia gratuita condicionada ao uso, mas Cloud Build, Artifact Registry, egress, Secret Manager e outras operações podem gerar cobrança. Usar orçamento/alertas, limpar recursos de build/artefatos obsoletos e **não prometer custo absolutamente zero**.

---

## 11. Etapas de execução e cronograma de 7 dias

> **Meta:** concluir um fluxo funcional até o **Dia 4**, publicar cedo e usar os últimos dias para segurança, UX, documentação e vídeo. Se um dia atrasar, cortar extras, nunca segurança básica ou entrega.

### DIA 1 — Base do monorepo, infra e modelagem

**Tarefas**

- [ ] Criar repositório, workspace `pnpm`, Next.js TS, estrutura `apps/web`, `packages/shared`, `packages/ui` e `supabase/`.
- [ ] Configurar Tailwind, ESLint, Prettier/format, checagem de tipos, `.env.example`, `.gitignore` e CI mínimo.
- [ ] Criar projeto Supabase (Auth, PostgreSQL, Storage privado), região, chaves; configurar contas Resend/GCP.
- [ ] Definir schema SQL e FKs/constraints/indexes; criar migrations iniciais reproduzíveis.
- [ ] Implementar perfis, memberships, roles e funções auxiliares `private`; RLS base e seed de 1 admin + 1 unidade + 2 planos.
- [ ] Criar Dockerfile inicial e provar `docker build` / app respondendo `/api/health` localmente.
- [ ] Abrir `DECISIONS.md` com motivo de Next + Supabase externo + Cloud Run e `AI_DIARY.md` com template de registros.

**Critérios de aceite**: monorepo inicia; migrações rodam em banco limpo; app executa no Docker; tabela de permissões definida e dados sobrevivem a restart.

### DIA 2 — Auth real, convites admin-only e assinaturas

**Tarefas**

- [ ] Integrar `@supabase/ssr` com cookies e sessão verificada no servidor.
- [ ] Criar login/logout, guard de admin e membro, tela de assinatura inválida.
- [ ] Preparar primeiro admin sem endpoint público de promoção e desativar signup público.
- [ ] Implementar `/api/admin/invitations`: criar convite apenas com admin autenticado e link gerado por Auth Admin.
- [ ] Conectar Resend, domínio/verificação de entrega, e-mail convite e callback de aceite.
- [ ] Implementar listagem de membros, plano/status e endpoint de alteração de assinatura pelo admin.
- [ ] Criar policies e testes para impedir membro alterar role/status ou convidar.

**Critérios de aceite**: admin convida; e-mail real chega; membro aceita; admin alterna active/inactive; membro bloqueado imediatamente fora das páginas de perfil/status; chamadas maliciosas retornam 403.

### DIA 3 — CRUD comercial completo

**Tarefas**

- [ ] CRUD de parceiros e condições comerciais em tabela separada.
- [ ] CRUD de serviços com nome, descrição PT/EN, preço, parceiro, unidade, status e fotos.
- [ ] Storage privado com política para admin upload e acesso somente a membro válido autorizado; validar arquivo.
- [ ] Criar regras de recomendação por plano, dia e faixa horária.
- [ ] Seed com 6–10 serviços reais do cenário fictício; publicar 4–6 serviços para a demo.
- [ ] Testar vínculo correto serviço-parceiro-unidade e impedir vazamento de termos comerciais.

**Critérios de aceite**: admin cadastra parceiro+termos e serviço com foto; registros persistem; membro inativo não consegue ler dados nem imagens privadas.

### DIA 4 — Área do membro, recomendações e contratação (MVP FIM A FIM)

**Tarefas**

- [ ] Página de recomendações com cards mobile-first e contexto hora/dia/plano.
- [ ] Serviço de recomendação determinístico com fallback seguro e testes unitários.
- [ ] Detalhe de serviço, registro de visualização e interesse.
- [ ] Criar pedidos transacionais, snapshot de preço, idempotência e confirmação de solicitação.
- [ ] Página `Meus pedidos`; admin lista e confirma/cancela pedidos.
- [ ] Implementar consultas agregadas básicas do dashboard.
- [ ] Validar **fluxo completo** com admin e membro em ambiente local; se possível, primeiro deploy no GCP.

**Critérios de aceite**: admin cadastra serviço → membro ativo vê recomendado → marca interesse e solicita contratação → admin confirma → dashboard atualiza; inativo não consegue.

### DIA 5 — GCP, segurança, RLS e observabilidade

**Tarefas**

- [ ] Publicar Docker definitivo no Artifact Registry e Cloud Run com URL HTTPS pública.
- [ ] Configurar secrets/env de produção, domínio de e-mail e redirects Auth.
- [ ] Executar testes `pgTAP`/SQL de acesso como `anon`, `admin`, `member active`, `member inactive`, unidade diferente.
- [ ] Testar tentativa direta à Data API do Supabase, endpoints Next.js e manipulação de preços/status.
- [ ] Ativar logs estruturados, tratamento de erros, rate limit de convites e mensagens de feedback.
- [ ] Revisar dependências/segredos, headers e configuração SSR.

**Critérios de aceite**: produção acessível; RLS de todas as tabelas validada; foto e e-mails funcionam em produção; build reproduzível e sem vazamento de secrets.

### DIA 6 — PWA, experiência mobile e testes E2E

**Tarefas**

- [ ] Manifest, ícones, service worker seguro, offline page e validação de instalabilidade.
- [ ] Polir interface do membro em ~375px; loaders, erros, mensagens, tap targets, imagens, responsividade.
- [ ] Localização PT-BR/EN para fluxo principal e timezone/preços.
- [ ] Playwright E2E para login, convite, assinatura, CRUD serviço, recomendação, pedido, dashboard.
- [ ] Testar em navegadores/viewport de celular e verificar acessibilidade mínima.
- [ ] Corrigir bugs críticos antes de novas funcionalidades.

**Critérios de aceite**: PWA instalável em navegador compatível; offline não vaza informação privada; demo mobile completa sem erros; testes E2E essenciais passando.

### DIA 7 — Revisão, evidências e entrega

**Tarefas**

- [ ] Rodar `lint`, `typecheck`, unit, RLS tests, E2E e build Docker final.
- [ ] Completar `README.md` com setup local, arquitetura, decisões, comandos GCP e instruções de teste.
- [ ] Completar `DECISIONS.md` incluindo escopo excluído, trade-offs e estratégia de experimento real sobre receita.
- [ ] Completar `AI_DIARY.md` com **3–5 episódios reais** de erros de IA, como detectados e corrigidos; não inventar episódios.
- [ ] Criar contas e dados de demonstração, sem senhas persistidas no Git. Compartilhar credenciais por canal apropriado com avaliadores.
- [ ] Gravar vídeo de **até 5 min**, com narração curta e fluxo funcional completo.
- [ ] Validar URL em janela anônima e em celular, e-mail de convite, PWA, acesso admin/membro e página de status inativo.
- [ ] Confirmar permissões do repositório e disponibilidade/limites de Supabase/Cloud Run durante avaliação.

**Critérios de aceite**: todos os entregáveis do PDF entregues, produção funcional, segurança revisada, vídeo publicado/acessível e `README` reproduzível.

### 11.1 Plano de contingência quando o prazo apertar

1. Não cortar **fluxo completo** nem deploy nem `DECISIONS.md`/diário/vídeo; são centrais para a nota.
2. Reduzir dashboard a quatro indicadores e uma lista de pedidos (dados reais).
3. Usar apenas uma unidade demonstrativa e 2 planos; manter relações no banco.
4. Tratar e-mail de confirmação como opcional, preservando convite Resend e registro de pedidos.
5. Deixar UI admin minimalista; preservar mobile polido no membro.
6. PWA mínima instalável, sem push, background sync ou cache de dados protegidos.
7. Múltiplas regras de recomendação complexas ficam fora: uma tabela simples + ordenação estável resolve.

---

## 12. Estratégia de testes e definição de pronto

### 12.1 Pirâmide objetiva

- **Unitários (Vitest)**: membership válido/expirado, recomendação por dia/horário/plano, quantias, deduplicação de eventos, DTO/Zod.
- **Integração/API**: rotas admin/member, sessão, pedidos, status, erros e Resend mockado quando apropriado.
- **Banco/segurança (Supabase CLI + pgTAP)**: provar RLS allow/deny para todas as operações críticas com usuários simulados. **Não** considerar somente teste de interface suficiente.
- **E2E (Playwright)**: admin cria parceiro+serviço, convida membro, altera status, membro vê recomendação e contrata, admin vê e confirma. Testar assinatura inválida e usuário de unidade diferente.
- **Smoke em produção**: URL pública, `health`, login admin, aceite convite, e-mail, criação, fotos, contratação, dashboard, idioma EN e PWA.

### 12.2 Critérios globais de conclusão

- [ ] Não há rota de registro público nem forma de um não-admin emitir convite.
- [ ] Supabase é externo e persistente; aplicação completa roda em **Docker**.
- [ ] Next.js no Docker disponibilizado em **GCP Cloud Run**, com URL pública.
- [ ] Os requisitos TypeScript/React/API moderna/autenticação real do PDF estão demonstráveis.
- [ ] Admin cria parceiro, termos e serviço com foto/preço; membro ativo vê recomendação contextual.
- [ ] Interesses, views e solicitações são persistentes; admin recebe e observa os eventos.
- [ ] Admin decide assinatura válida/inválida; revogação bloqueia imediatamente operações de membro.
- [ ] Banco e Storage possuem políticas RLS testadas; acesso cruzado bloqueado.
- [ ] PWA é instalável, mobile-first e sem cache de dados sensíveis.
- [ ] Resend envia convite e alertas; falha de e-mail não corrompe pedidos.
- [ ] README, DECISIONS, diário de IA e vídeo até 5 min estão finalizados.

---

## 13. Documentação e roteiro do vídeo

### 13.1 `README.md` — seções obrigatórias

1. Visão do produto e escopo do MVP.
2. Arquitetura (diagrama simples da seção 3) e papel de Docker, GCP, Supabase e Resend.
3. Pré-requisitos (Node/pnpm/Docker/Supabase CLI/gcloud) e `.env` sem segredos.
4. Como rodar local: instalar dependências, aplicar migrations/seed em projeto de teste, iniciar Next, executar Docker.
5. Como criar admin inicial com bootstrap autorizado, sem expor senha em Git.
6. Como fazer deploy para GCP (Artifact Registry + Cloud Run) e configurar env/redirects.
7. Como executar lint, typecheck, testes unitários, RLS e E2E.
8. Rotas principais e exemplos de regras de recomendação.
9. Como acessar contas de demonstração e onde obter credenciais em canal seguro.
10. Limitações conhecidas (sem gateway, sem offline de dados, sem autoassinatura) e considerações de segurança/custo.

### 13.2 `DECISIONS.md` — entradas mínimas

- Qual o menor fluxo que prova a hipótese de upsell?
- Por que **Next.js Route Handlers** em vez de API separada em NestJS/Fastify?
- Por que Supabase gerenciado externo ao Docker? O PDF só pede banco persistente e aplicação containerizada.
- Por que uma unidade demo e suporte de múltiplas unidades no modelo?
- Por que assinatura gerenciada pelo admin e sem cobrança real?
- Por que convites admin-only e como impedir bypass?
- Por que RLS no banco além dos guards de API?
- Por que Resend e como tratar falhas?
- Por que recomendações baseadas em regras e não em IA?
- Por que PWA segura com offline limitado?
- O que ficou de fora, custos/risco, e como validar **aumento da receita extra por membro** após o MVP com experimento medido.

### 13.3 `AI_DIARY.md` — formato por ocorrência

```md
## Caso N — [data / ferramenta]
- Objetivo e prompt resumido:
- Resultado equivocado da IA:
- Como identifiquei o problema (teste/log/documentação):
- Mudança feita e por quê:
- Evidência de correção:
- Aprendizado para próximas instruções:
```

**Registrar fatos reais durante a execução**. O enunciado pede 3 a 5 erros reais e raciocínio, não histórias inventadas.

### 13.4 Vídeo de no máximo 5 minutos — cronograma sugerido

| Tempo | Demonstração |
| --- | --- |
| 0:00–0:30 | Abertura curta: Órbita, problema de upsell e arquitetura |
| 0:30–1:30 | Login admin; cadastra parceiro/termos e serviço com foto, preço e regras |
| 1:30–2:05 | Admin mostra convite de membro e status de assinatura; conta já aceita disponível para demo |
| 2:05–3:15 | Área do membro mobile, recomendações por plano/hora, interesse e contratação |
| 3:15–4:00 | Admin recebe pedido, confirma, mostra métricas reais e alerta por e-mail |
| 4:00–4:30 | Admin desativa assinatura; tentativa do membro fica bloqueada |
| 4:30–5:00 | PWA/EN/Docker GCP em segundos + decisões importantes e encerramento |

**Preparação:** usar e-mail de teste e duas contas previamente configuradas para evitar esperar entrega de e-mail em gravação. Não expor credenciais, chaves ou dados reais de usuários.

---

## 14. Sequência operacional sugerida para o agente Codex

**Executar um estágio por vez; conferir antes de avançar.**

1. Ler este `PLAN.md` e o PDF e criar checklist persistente com dependências/bloqueios.
2. Criar monorepo e infra local; validar build Next.js e Docker.
3. Criar migrations base e testes de RLS **antes** dos endpoints sensíveis.
4. Criar bootstrap admin + Auth SSR + convites Resend + status de assinatura; testar ataque de membro contra admin.
5. Criar CRUD de parceiros/termos e serviços/fotos/regras.
6. Criar recomendações + eventos + pedidos + analytics usando **conta real de membro**.
7. Deploy no Cloud Run; corrigir variáveis de runtime/cookies/redirects.
8. PWA e acabamento móvel/PT/EN, testes e documentação.
9. Entregar PR/commit final, vídeo e links com todos os critérios de aceite marcados.

**Comandos de verificação sugeridos** (ajustar aos scripts reais):

```bash
pnpm install --frozen-lockfile
pnpm lint
pnpm typecheck
pnpm test
pnpm build
# supabase test db              # com Supabase CLI e ambiente de teste local configurado
# pnpm exec playwright test     # suite de E2E com fixtures de teste

docker build -t orbita-product-builder .
docker run --rm -p 8080:8080 --env-file .env.local -e PORT=8080 orbita-product-builder
# curl http://localhost:8080/api/health
```

**Cuidados:** scripts precisam existir antes de executar; `docker run --env-file` é apenas ambiente de desenvolvimento privado — não commitar `.env.local`. No GCP, fornecer secrets pela configuração de Cloud Run. Migrações são aplicadas de forma controlada no Supabase, não automaticamente a cada inicialização do container.

---

## 15. Fontes técnicas oficiais para orientar a implementação

- Supabase — Auth SSR: <https://supabase.com/docs/guides/auth/server-side>
- Supabase — Next.js Auth: <https://supabase.com/docs/guides/auth/quickstarts/nextjs>
- Supabase — `auth.admin.generateLink`: <https://supabase.com/docs/reference/javascript/auth-admin-generatelink>
- Supabase — Row Level Security: <https://supabase.com/docs/guides/database/postgres/row-level-security>
- Supabase — E-mail SMTP customizado/Resend: <https://supabase.com/docs/guides/auth/auth-smtp>
- Supabase — Templates de e-mail/convite SSR: <https://supabase.com/docs/guides/auth/auth-email-templates>
- Next.js — Progressive Web Apps: <https://nextjs.org/docs/app/guides/progressive-web-apps>
- Next.js — Standalone output: <https://nextjs.org/docs/app/api-reference/config/next-config-js/output>
- Google Cloud Run — Deploy de container: <https://cloud.google.com/run/docs/quickstarts/deploy-container>
- Google Cloud Run — Portas/`PORT`: <https://cloud.google.com/run/docs/configuring/services/containers>
- Resend — Documentação: <https://resend.com/docs>

> **Critério de interpretação do desafio:** o PDF não exige que PostgreSQL rode no Docker, nem uso de Resend, PWA, RLS, monorepo ou convites. Estes últimos são **decisões adicionais adotadas neste projeto**. O requisito do PDF é que **a aplicação** rode em container, com banco persistente e deploy em AWS/GCP/Azure. Esta distinção deve aparecer claramente no `DECISIONS.md`.
