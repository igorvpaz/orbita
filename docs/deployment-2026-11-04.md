# Atualização publicada — 04/11/2026

- URL: https://orbita-dpvgtjzjva-rj.a.run.app
- Projeto/região: `orbita-513618` / `southamerica-east1`.
- Revisão ativa: `orbita-00008-qvl`.
- Imagem: `southamerica-east1-docker.pkg.dev/orbita-513618/orbita/orbita:20261104093143`.
- Cloud Build: `23b93ff1-f080-42e8-b874-69aee4dc0121`, concluído com sucesso.
- A conta de avaliação e os limites de escala existentes foram mantidos.

## Entregas

CRUD de administradores com bloqueio de autoexclusão e proteção do último admin no banco. Exclusão Auth remove o perfil de forma transacional e preserva referências comerciais/auditorias com autoria nula. As APIs sempre revalidam o papel atual, impedindo acesso de contas removidas.

Pedidos passam a exigir uma data e faixa válida, com uma pessoa por pedido, até 30 dias à frente. A rede fictícia tem capacidades de 1, 10, 20, 30 e 50 pessoas por horário. O admin configura capacidade e duração. O banco revalida assinatura até o fim da reserva, plano, atendimento, preços e vagas; locks por serviço protegem a concorrência. Reservas solicitadas e confirmadas ocupam vagas; canceladas liberam. A duração não pode mudar com reservas futuras e a capacidade não pode ficar abaixo das reservas existentes. Pedidos históricos permanecem sem horário, sem fabricar dados.

Visão Geral oferece Hoje, 7 dias, 30 dias e Personalizado, evolução diária, jornada, rankings por visualizações/interesses/pedidos/valor, listagem detalhada de todos os serviços e comparação de unidades por membros únicos ou valor. Confirmações são valores nominais por data de confirmação; pedidos e eventos usam criação, no calendário de Brasília. Não há processamento de pagamentos.

Português, inglês, espanhol, francês, alemão e italiano disponíveis no login, navegação, interfaces e catálogo fictício. O idioma inicial acompanha o navegador e a escolha manual persiste em cookie. Conteúdo livre permanece no idioma informado pelo administrador. O fallback offline e as instruções PWA também receberam os idiomas.

Ícone de Parceiros substituído por estabelecimento e logout visível na parte fixa da navegação de ambos os papéis, com rolagem independente dos links.

## Migrações e rollout

Aplicadas no Supabase as migrações `20261104042708`, `20261104042808`, `20261104045219`, `20261104111125` e `20261104112203`. A primeira preservou temporariamente a compatibilidade com o app antigo. A migração `require_scheduled_reservations` foi aplicada após a nova revisão receber tráfego e exige horário também em inserções diretas na Data API. A última alinha a descrição fictícia do estúdio com as traduções, preservando conteúdo editado pelo usuário.

## Evidências

- 51 testes web e 3 shared passaram, incluindo intervalos no fuso de Brasília, limites dos schemas e cobertura de todas as mensagens literais traduzidas.
- TypeScript, ESLint, build Next.js e Docker no Cloud Build passaram.
- Integração remota: criar/editar/excluir admin, bloquear autoexclusão e acesso após exclusão; reservar a última vaga com duas requisições simultâneas (uma aceita, uma rejeitada), idempotência, horário inválido, cancelamento liberando vaga, confirmação refletida em métricas, Premium e períodos do relatório.
- Produção: health, login nos seis idiomas, login administrativo, criação/exclusão de admin temporário, autoexclusão bloqueada, relatórios, 36 serviços nas cinco capacidades, ícone, presença do logout e cache PWA v6 verificados por HTTP.
- Contas, pedidos, assinatura e auditorias temporários foram removidos. O banco manteve os dois pedidos, a assinatura e o admin existentes antes da validação.
- Advisor de segurança sem novos avisos; a proteção contra senhas vazadas continua desabilitada, conforme decisão de treinamento já documentada.

Não houve automação do navegador pessoal nem instalação física do PWA em celular. A suíte completa de RLS em Supabase local descartável permanece fora desta validação. A URL padrão do painel Auth Supabase não foi alterada; o login direto por senha foi validado na URL publicada, e os fluxos de e-mail seguem desabilitados.

## Controles compactos da conta

Idioma, tema e logout agora ficam lado a lado. Tema e sair mostram apenas ícones, com nomes acessíveis e tooltips. O idioma mostra globo + sigla; um disclosure nativo abre as seis opções e fecha com seleção, clique fora ou Esc, preservando o menu lateral no celular. No login, idioma e tema também são compactos.

Validação deste ajuste: TypeScript, ESLint, 12 testes existentes de idioma/tema, build Docker e conferência HTTP do HTML publicado. Não foram alteradas regras de Auth, reservas ou banco.
