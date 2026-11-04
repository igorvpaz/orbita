# Diário de desenvolvimento com IA — Órbita

Usei o Codex como apoio para planejar, implementar, revisar e publicar o Órbita. As decisões sobre o produto partiram de mim: defini o que queria demonstrar, forneci referências visuais, testei o resultado e pedi mudanças quando a entrega não atendia ao que eu tinha em mente. A IA ajudou a transformar essas orientações em código, testes e configuração de infraestrutura.

O trabalho ficou concentrado em três dias de desenvolvimento: **1, 3 e 4 de novembro de 2026**. Também houve atividade na noite de **2 de novembro**, voltada à conexão dos serviços externos. Por isso, este diário registra quatro datas de calendário, considerando o horário de Brasília. As datas foram reconstruídas a partir das conversas de trabalho e dos registros do repositório; os commits, sozinhos, não mostram quando cada atividade aconteceu.

## 01/11/2026 — Do desafio à primeira implementação

Comecei revisando o planejamento em relação ao desafio de Product Builder. A prioridade era construir um fluxo completo: o administrador cadastra um serviço, o membro encontra uma oferta compatível com seu plano, solicita a contratação e o administrador acompanha o pedido. Pedi inicialmente uma implementação por etapas e depois autorizei o desenvolvimento do projeto inteiro.

Nesse dia, foi construída a base em Next.js e TypeScript, com interface e API na mesma aplicação, além das integrações previstas com Supabase e Resend. Entraram a estrutura de administradores e membros, assinaturas, parceiros, catálogo, recomendações por regras, pedidos, métricas e PWA. Também foram preparados migrations, políticas de acesso, testes e arquivos para executar a aplicação em container e publicá-la no Cloud Run.

A IA acelerou a construção dessa estrutura, mas algumas soluções precisaram de correção durante a validação:

- **Export inválido em uma rota:** a IA exportou um schema de validação diretamente de um arquivo de Route Handler. O build do Next.js rejeitou esse export. O schema passou a ficar privado ao módulo, e o build seguinte passou. Isso mostrou por que a checagem de tipos isolada não substitui o build da aplicação.
- **Edição parcial apagando informação:** o schema de atualização de serviço reaproveitava um valor padrão do cadastro. Com isso, uma edição apenas de status poderia apagar a descrição em inglês. Um teste identificou o campo indevido; o schema foi corrigido para preservar campos não enviados.

Ao final dessa primeira implementação, as verificações locais de tipos, lint, testes e build haviam passado. Isso ainda não significava que o produto estava validado em produção: conexão com os serviços reais, aplicação das migrations e publicação continuavam pendentes.

## 02/11/2026 — Tentativas de conectar os serviços

Na noite do dia 2, retomei o projeto para avançar na configuração externa. Eu já havia criado o projeto no Supabase e as contas no Resend e no Google Cloud, mas a conexão disponível para a IA ainda não tinha acesso operacional ao projeto correto.

O trabalho dessa sessão foi tentar disponibilizar os acessos necessários e entender o que faltava para configurar o ambiente. As tentativas de conexão não resultaram, naquele momento, na aplicação das migrations nem na configuração efetiva do Supabase ou do Resend.

Essa foi uma sessão curta de preparação, que continuou depois da meia-noite. Ela não correspondeu a uma nova etapa de funcionalidades. O principal aprendizado foi separar três coisas: ter uma conta criada, ter a integração conectada e conseguir executar operações no projeto certo. A IA só poderia concluir a configuração depois que a terceira condição estivesse atendida.

## 03/11/2026 — Integração real, identidade visual e publicação

Depois das dificuldades de acesso, o projeto avançou para o Supabase remoto. Também revi uma decisão importante do fluxo de entrada: para facilitar a avaliação do MVP, pedi que as contas fossem criadas diretamente pelo administrador, com e-mail e senha, sem depender de convite ou confirmação por e-mail. Eu não tinha um domínio próprio para configurar o envio, e essa dependência estava atrapalhando a demonstração.

Foram configurados autenticação, perfis, assinaturas e permissões no ambiente real. O fluxo foi exercitado com contas temporárias: criação e edição de membro, troca de senha, restrições de acesso e bloqueio após desativação da assinatura.

Nessa validação apareceu outro erro concreto da implementação assistida: **a API de assinatura aceitava datas terminadas em `Z`, mas o banco devolvia datas com `+00:00`**. A desativação de uma assinatura falhou por causa dessa diferença. A validação passou a aceitar o deslocamento de fuso, foi acrescentado um teste de regressão e a operação remota seguinte funcionou. O caso mostrou a importância de testar o ciclo completo, inclusive reaproveitando os dados retornados pelo banco.

Também foi um dia de direcionamento visual e de produto. Enviei referências para o painel, a marca e o login. Pedi a identidade escura com destaque amarelo e o símbolo orbital, usado também no favicon e no PWA. Defini que a rede fictícia teria unidades no Rio Grande do Sul e que o membro poderia consultar e contratar serviços em qualquer uma delas.

O catálogo passou a ter seis unidades e 36 serviços fictícios, com opções exclusivas do Premium e solicitação de upgrade ao administrador. Pedi ainda skeletons nos carregamentos, tema claro e escuro conforme o dispositivo e fotos fictícias nos serviços. Essas mudanças vieram da revisão do resultado: ter a funcionalidade implementada não bastava para considerar a experiência pronta.

A aplicação foi publicada em Docker no Google Cloud Run. A URL pública recebeu verificações de saúde, login, proteção de rotas, catálogo e arquivos do PWA. O deploy está registrado em [Publicação de 03/11](docs/deployment-2026-11-03.md). A instalação física do PWA em celular permaneceu sem validação.

## 04/11/2026 — Reservas com horário, gestão e acabamento

Com a aplicação publicada, pedi alterações para aproximar o fluxo de uma operação de coworking. O pedido de serviço passou a exigir data e horário válidos, respeitando duração, capacidade e disponibilidade. Solicitei serviços com capacidades diferentes, de 1, 10, 20, 30 e 50 pessoas por faixa.

A implementação incluiu validações no banco para plano, assinatura e vagas. Um teste remoto disputou a última vaga com duas requisições simultâneas: uma foi aceita e a outra rejeitada. Também foram verificados cancelamento liberando capacidade e repetição de requisição sem duplicar a reserva. Esse tipo de evidência era necessário porque o formulário, sozinho, não comprova que a regra resiste a acessos concorrentes.

Pedi também criação, edição e exclusão de administradores, além de um dashboard com filtros de período, evolução e comparação entre unidades. A exclusão passou a preservar o histórico e a impedir tanto a autoexclusão pela API quanto a remoção do último administrador pelo banco. Os valores do dashboard representam contratações confirmadas em valor nominal; o projeto não processa pagamentos.

Outra mudança foi ampliar a interface para português, inglês, espanhol, francês, alemão e italiano. Depois de ver o resultado, pedi um novo ajuste nos controles de idioma, tema e saída: os três lado a lado, com ícones compactos e a sigla do idioma. Foi mais um exemplo de revisão minha sobre a proposta inicial da IA.

A atualização foi publicada e recebeu validações locais e remotas. O registro da entrega informa 51 testes web e 3 do pacote compartilhado, além de verificações de tipos, lint, build e fluxos integrados. Os detalhes estão em [Atualização de 04/11](docs/deployment-2026-11-04.md).

Por fim, revisei a documentação. Pedi que o documento de decisões refletisse os motivos que eu realmente tive para escolher as tecnologias e o escopo. Também solicitei o link oficial do deploy no início do README e a reescrita deste diário por dias de trabalho, em vez de manter apenas uma lista de falhas técnicas.

## O que aprendi trabalhando com IA

A IA ajudou principalmente na velocidade de implementação e na investigação de problemas. Ainda assim, precisei orientar o produto, avaliar a interface e questionar entregas que pareciam concluídas. Os erros de schema, de convenção de rotas e de formato de data foram encontrados por validações diferentes; nenhum teste isolado cobriu tudo.

Também ficou clara a diferença entre código escrito, código validado localmente e comportamento confirmado no ambiente publicado. A suíte completa de RLS em um Supabase local descartável e a instalação do PWA em um aparelho real não fizeram parte das validações registradas. Manter esses limites explícitos faz parte do uso crítico da IA no projeto.
