# Histórico técnico de decisões

Registro cronológico de implementação. As escolhas atuais de produto e arquitetura estão em [DECISIONS.md](../DECISIONS.md); referências a convites e pendências nas etapas iniciais descrevem o estado da época.

## Etapa 1 — 2026-11-01

- **Fluxo mínimo:** admin cadastra parceiro e serviço, convida membro, membro recebe recomendação e solicita contratação, admin confirma. Isso testa interesse em upsell sem simular pagamento.
- **Next.js Route Handlers:** uma aplicação implantável serve UI e API em TypeScript. Uma API NestJS/Fastify separada aumentaria configuração e deploy para o prazo do desafio.
- **Supabase externo:** PostgreSQL, Auth e Storage persistem fora do container; o Docker empacota só o Next.js. O PDF exige banco persistente e app em Docker, não banco no Docker.
- **Cloud Run:** destino de deploy do container, ainda não provisionado. Segredos serão configurados na execução.
- **Monorepo:** `apps/web`, `packages/shared`, `packages/ui`; o pacote de UI começa vazio para evitar abstração prematura.
- **Uma unidade demo, modelo multiunidade:** seed traz Paulista, com FKs de unidade para membros, serviços e pedidos. Planos básico e premium são dados de demonstração.
- **Assinatura e role no banco:** admin controla ambas. Validade é consultada na tabela atual, permitindo revogação sem esperar atualização de JWT.
- **RLS:** ativada em todas as 14 tabelas públicas. `anon` não recebe grants. Admin é identificado pelo perfil protegido. Tabelas comerciais novas começam acessíveis apenas ao admin; leitura/escrita de membros será aberta por políticas específicas com os endpoints dos dias 3 e 4.
- **Convites:** apenas admin autenticado; sem endpoint de cadastro público. A configuração do Supabase Auth para desabilitar signups é um passo manual. O fluxo entra na etapa 2.
- **Fotos:** bucket privado com limite de arquivo e MIME na migração; políticas de objetos e upload entram com o CRUD na etapa 3.
- **Resend:** serviço de e-mail previsto para convites e alertas. Falhas não devem reverter pedido persistido. Integração na etapa 2.
- **Recomendações:** regras de plano/dia/horário com ordenação estável; ML não é necessário para testar hipótese no MVP.
- **PWA:** shell offline sem catálogo privado ou ações; entra na etapa 6.
- **Fora do MVP:** gateway de pagamento, assinatura cobrada, push, app nativo, geolocalização e painel de parceiro.
- **Métrica futura:** comparar, por membro ativo, valor confirmado nominal e taxa de contratação entre grupo com recomendações e grupo de controle. Sem gateway, não declarar receita recebida.

## Etapas 2–6 — implementação

- Sessão SSR via `@supabase/ssr` e `proxy.ts` do Next 16. Cada API protegida verifica usuário atual e papel no banco; assinatura é lida da tabela a cada chamada para revogação imediata.
- Convite usa `auth.admin.generateLink(type='invite')` e envia link com `hashed_token` via Resend. Reenvio usa novo magic link para o usuário já criado. Nenhum token/link é persistido ou logado. A assinatura nasce inativa e só assume o status definido pelo admin dentro de `accept_invitation()`, que exige convite pendente para o usuário autenticado; revogação não libera catálogo. O comportamento precisa de prova integrada no projeto Supabase real antes da demo.
- Contato e condições comerciais ficam em `partner_terms`, sem acesso de membro. Serviço, parceiro e mídia usam RLS; elegibilidade de plano/horário/unidade está na função privada do banco, protegendo até acesso direto à Data API.
- Pedido e evento são inseridos com identidade autenticada; triggers derivam unidade e preço e rejeitam serviço indisponível. Status do pedido muda apenas de `requested` para `confirmed`/`cancelled`, com auditoria no banco.
- Visualização e interesse são únicos por membro, serviço, tipo e dia local da unidade. O dashboard conta esses eventos persistidos e usa soma SQL para valor nominal confirmado.
- Foto usa Storage privado com URLs assinadas por 60 segundos. O service worker só guarda ícones e tela offline; catálogo e respostas `/api` nunca entram no cache.
- UI de membro tem PT-BR/EN e formulário mobile; admin foi priorizado em português. E2E exige contas de teste reais em banco descartável.
- O script GCP usa Docker local + Artifact Registry + Cloud Run, com secrets no Secret Manager e service account dedicada. A aplicação não grava dados no disco do container.
- Sem gateway, repasse, cobrança de assinatura, renovação automática ou push. O valor confirmado é nominal. Um experimento posterior deve randomizar membros elegíveis entre recomendações e controle e comparar valor **recebido** por membro/visita após integrar pagamentos, controlando sazonalidade e diferenças entre unidades.

## Matriz de permissões da base

| Recurso | Anônimo | Admin | Membro ativo/inativo |
| --- | --- | --- | --- |
| Unidade e plano | Não | Ler/alterar | Ler próprios |
| Perfil e assinatura | Não | Ler/alterar | Ler próprios |
| Convites | Não | Ler/criar/alterar | Não |
| Parceiros e serviços | Não | Ler/criar/alterar | Consultar publicados de todas as unidades ativas; contratar só se plano/horário permitirem |
| Termos comerciais | Não | Ler/criar/alterar | Não |
| Mídia e regras | Não | Ler/criar/alterar | Ler apenas vinculadas a serviço elegível, se ativo |
| Eventos | Não | Ler | Views em serviços visíveis; interesse apenas se plano/horário permitirem |
| Pedidos | Não | Ler/confirmar/cancelar | Criar em qualquer unidade ativa se plano/horário permitirem; ler próprios |
| Upgrades Premium | Não | Analisar/aprovar/recusar | Solicitar e ler próprios; sem autoaprovação |
| Entregas de e-mail e auditoria | Não | Ler (inserção controlada) | Não |

As alterações de catálogo e upgrade foram exercitadas no Supabase remoto com conta temporária. A suíte local completa de RLS permanece dependente de Supabase local descartável.
## Auth e contas diretas — 2026-11-03

Por solicitação explícita do usuário, o projeto de treinamento substitui convites por criação direta de membros no painel. Admin escolhe e-mail/senha, edita nome/e-mail/unidade e redefine senha; plano, validade e status continuam sob seu controle. Não há verificação por e-mail nem recuperação por SMTP. Cadastro público e login anônimo ficam desabilitados. Esta decisão substitui as referências anteriores a convites neste documento.

A API usa Auth Admin somente no servidor, após validar o papel pela tabela protegida. `create_member_record` é SECURITY INVOKER e insere perfil, assinatura e auditoria em uma transação sujeita a RLS. O papel é sempre `member`; campos extras de autorização são rejeitados. Falhas do banco compensam apenas o Auth user recém-criado. Alteração de e-mail sincroniza Auth/perfil, com tentativa de reversão se o perfil falhar. Senha tem endpoint separado e nunca é retornada, logada ou armazenada nas tabelas da aplicação.

O proxy usa `getUser()`, as APIs e layouts consultam o perfil atual, e redirects preservam cookies e cabeçalhos de cache. URLs após login ficam limitadas à área do papel autenticado. As quatro migrations foram aplicadas no projeto `orbita`; administrador e referências mínimas foram criados. Funções de convite legadas perderam EXECUTE para authenticated, e os endpoints de criação/aceite/reenvio retornam 410. O advisor restante é a proteção contra senhas vazadas desabilitada, mantida para este treinamento com credencial escolhida pelo usuário.

## Layout e marca — 2026-11-03

O painel foi adaptado à referência visual fornecida pelo usuário: sidebar fixa escura, conteúdo claro, título serifado, formulários compactos e tabela com busca e ações. Os contadores usam dados reais; não foram criados membros fictícios para preencher a interface. A marca Órbita usa símbolo orbital vetorial amarelo, reaproveitado no login, navegação, favicon e ícones PWA. A busca é local à lista carregada. No celular, o menu é recolhível e a tabela tem rolagem própria. APIs e regras de autenticação permanecem as já validadas.

## Rede RS, catálogo completo e upgrades — 2026-11-03

Por instrução explícita, membros ativos agora podem escolher qualquer unidade do RS para consultar e contratar. Isso substitui a restrição anterior à unidade cadastrada no perfil. A unidade original continua registrada na conta. Foram criadas seis unidades e 36 serviços fictícios, com seed repetível; a antiga unidade Paulista foi renomeada para Moinhos de Vento preservando as referências existentes.

Visibilidade e contratação são controles distintos: `private.is_service_visible` permite a prévia de serviços publicados de unidades/parceiros ativos; `private.is_service_available` revalida assinatura, plano e faixa de horário. RLS e triggers usam o controle estrito em pedidos e interesse; views podem ser registradas em serviços bloqueados. A coluna `services.access_plan` define exclusividade Premium, separada das regras opcionais de horário/plano. O admin controla essa coluna no cadastro/edição.

`upgrade_requests` tem RLS, grants por coluna e índice único para um pedido pendente por membro. RPCs SECURITY INVOKER exigem o papel atual no banco. Aprovação serializa request e assinatura com locks e grava mudança de plano e auditoria atomicamente. Recusa preserva o plano, revisões incompatíveis são negadas e uma aprovação repetida é idempotente. Membro não grava status de revisão nem troca o próprio plano.

Admin e membro reutilizam o mesmo shell responsivo. O módulo de instalação contém apenas instalação/instruções. O provider captura `beforeinstallprompt` globalmente antes de o usuário navegar até o módulo; iOS recebe instruções de instalação manual. Manifest, safe zone do ícone maskable e service worker estático foram preparados. Nenhuma resposta privada é armazenada no cache e a página offline é HTML estático. A suíte de cache valida API privada, navegação autenticada, fallback offline e preservação de caches alheios.

O advisor de segurança não trouxe novos achados de schema. Persiste o aviso de [proteção contra senhas vazadas desabilitada](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection), registrado anteriormente para este treinamento.

## Reservas e gestão — 04/11/2026

Reservas futuras substituem o pedido sem horário. Cada pedido ocupa uma vaga; `requested` e `confirmed` ocupam capacidade e `cancelled` libera. O banco deriva fim/preço/unidade, valida plano e validade até o fim da reserva, e usa lock por serviço para evitar sobrelotação. Há até 30 dias de antecedência. Pedidos antigos mantêm horário nulo como histórico, sem inventar reservas. A duração não muda quando existem reservas futuras e a capacidade não pode cair abaixo da ocupação existente.

A migração expansiva mantém compatibilidade com a revisão antiga; `require_scheduled_reservations` é aplicada após a revisão nova receber tráfego para exigir horário também na Data API. O CRUD de administradores usa Auth Admin somente no servidor. FKs de autoria passam a SET NULL para preservar histórico; o perfil acompanha exclusão Auth via CASCADE. Um trigger serializado preserva o último administrador.

Métricas agregadas executam como invoker com RLS e verificação administrativa. Datas de calendário usam America/Sao_Paulo; valores confirmados são nominais e filtrados por confirmed_at. Seis idiomas foram escolhidos pelo usuário: PT, EN, ES, FR, DE e IT. Traduções são locais e a preferência inicial vem de Accept-Language; cookie guarda a escolha manual. Campos editáveis nunca recebem tradução automática, para não sobrescrever conteúdo de origem.
