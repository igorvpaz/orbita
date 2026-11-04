# Decisões do projeto Órbita

Este documento reúne as escolhas de produto e arquitetura do MVP, os motivos de cada escolha.

## 1. Por que usar Supabase? Cloud ou self-hosted?

**Decisão:** usar Supabase Cloud para banco de dados PostgreSQL, autenticação e armazenamento de imagens.

Para este MVP, a proposta é concentrar o esforço no fluxo que demonstra valor: o administrador cadastra serviços, o membro recebe recomendações e solicita uma reserva, e o administrador acompanha o resultado. Reunir persistência, autenticação e armazenamento em um serviço gerenciado reduz o trabalho de integrar e operar esses componentes separadamente.

O self-hosting daria mais controle sobre a infraestrutura, mas também exigiria assumir sua configuração, atualização, monitoramento e rotinas de recuperação. Para o escopo e o prazo do desafio, essa responsabilidade adicional não traz um benefício proporcional.

O container da aplicação contém o Next.js; banco e imagens permanecem fora dele. A contrapartida é depender de um serviço externo e acompanhar seus limites e custos. A aplicação continua responsável pelas regras de negócio e pelas permissões de acesso, incluindo políticas de segurança no banco.

## 2. Por que escolher Next.js em vez de outras opções?

**Decisão:** usar Next.js com React e TypeScript para a interface e para a API da aplicação.

A proposta de justificativa é que o projeto precisa de uma interface React e de uma API em TypeScript. O Next.js permite reunir as duas partes na mesma aplicação, compartilhando tipos e validações e mantendo um único processo de build e publicação.

Uma interface React com Vite e uma API separada também atenderia ao produto, mas acrescentaria a configuração e a operação de dois serviços. Para este MVP, optei por manter a estrutura concentrada e facilitar a entrega do fluxo completo.

Essa escolha mantém interface e API no mesmo ciclo de publicação. Se surgirem outros clientes ou necessidades de escala independentes, a separação pode ser reavaliada. A escolha específica da API está detalhada na seção 9.

## 3. Por que hospedar na Google Cloud Platform?

**Decisão:** hospedar o container no Google Cloud Run.

Entre as opções consideradas nas três plataformas do desafio, o Cloud Run me pareceu a alternativa mais simples e direta para publicar esta aplicação. Eu já tinha conta na Google Cloud e experiência com outros serviços da plataforma, o que reduziu o esforço de configuração e aprendizado.

O modelo gerenciado de execução de containers também se encaixa na entrega exigida: publicar a aplicação empacotada em Docker sem administrar um servidor ou um cluster. Essa característica é descrita na [documentação do Cloud Run](https://docs.cloud.google.com/run/docs/overview/what-is-cloud-run).

O custo inicial também pesou na escolha. Porém, não fiz uma comparação de preços que permita afirmar que o Cloud Run é sempre mais barato ou oferece mais gratuidade do que AWS e Azure. Para este projeto, a decisão combina familiaridade, simplicidade operacional e expectativa de baixo volume de uso; utilizando 90 dias grátis na plataforma, sendo mais que tempo suficiente para apresentar o case.

## 4. Por que dispensar a confirmação de acesso por e-mail?

**Decisão:** manter login com e-mail e senha, com contas criadas pelo administrador, sem exigir confirmação por e-mail ou links de convite para acessar o MVP.

Eu queria facilitar o acesso de quem vai testar a aplicação e validar os requisitos. Não possuo um domínio próprio para configurar o envio de e-mails, e depender de mensagens de confirmação acrescentaria uma etapa sujeita a atrasos, restrições de envio e configurações externas.

O SMTP padrão do Supabase tem restrições importantes: na documentação, o limite é de **2 mensagens por hora**, e o envio fica restrito aos endereços da equipe do projeto.

Configurar um provedor próprio e tratar os cenários de falha consumiria tempo que preferi dedicar ao fluxo principal. Assim, o administrador cria a conta e define a senha inicial; o usuário entra com essas credenciais. Não há cadastro público, e a redefinição de senha também fica sob responsabilidade do administrador neste MVP.

O custo dessa simplificação é não verificar a posse do endereço de e-mail e não oferecer recuperação autônoma por mensagem. Antes de ampliar o uso para uma operação real, eu reavaliaria esse fluxo. Alertas de negócio por e-mail são uma integração separada e não devem ser necessários para concluir uma reserva.

## 5. Por que apenas dois planos de usuário?

**Decisão:** trabalhar com os planos Básico e Premium.

Além de evitar complexidade, escolhi uma divisão que considero familiar em produtos por assinatura. Isso facilita explicar a diferença de acesso e demonstrar o valor de uma categoria superior sem criar muitas combinações de benefícios e regras.

No MVP, o Premium permite diferenciar serviços exclusivos e demonstrar um fluxo de solicitação de upgrade, sujeito à aprovação do administrador. A atribuição do plano e a validade da assinatura são controladas pelo administrador; não há cobrança automática.

Dois planos são suficientes para testar essa proposta inicial. A percepção de que esse modelo é comum orientou minha escolha, mas não substitui uma validação de quais benefícios justificariam um upgrade para os usuários reais.

## 6. Como facilitar o uso no celular?

**Decisão:** oferecer navegação responsiva com menu hambúrguer e uma PWA instalável.

Quis manter a navegação limpa no celular e dar ao membro a possibilidade de adicionar a aplicação à tela inicial, acessando-a de maneira semelhante a um aplicativo. Minha hipótese é que esse atalho facilite o retorno e aumente a frequência de uso; esse resultado precisaria ser medido.

A instalação não torna todas as funções disponíveis sem internet. Neste MVP, catálogo, autenticação e reservas dependem de conexão; o modo offline apresenta uma tela informativa, sem guardar dados privados no cache.

Como evolução, considero notificações sobre descontos em períodos específicos ou ofertas próximas de uma unidade. Essas ideias ficam para depois: push e geolocalização não estão implementados e exigiriam avaliar compatibilidade, permissões e utilidade para o usuário.

## 7. Como transformar os pontos do enunciado em decisões de produto?

### Atender visitantes estrangeiros

**Decisão:** oferecer a interface em português, inglês, espanhol, francês, alemão e italiano, com identificação inicial pelo idioma do navegador e opção de troca manual.

Meu raciocínio foi partir da presença de estrangeiros para reduzir uma barreira concreta de uso: o idioma. As traduções da interface são locais. Conteúdos cadastrados, como nomes e descrições de serviços, não recebem tradução automática; precisam de conteúdo traduzido para que toda a experiência seja multilíngue.

Para descobrir quais idiomas merecem mais investimento, a proposta é analisar uso e resultado por idioma escolhido: usuários ativos, solicitações, contratações confirmadas e, quando houver dados financeiros, receita e margem. Também compararia o resultado por usuário, pois o idioma com maior volume de acessos não necessariamente terá a maior conversão.

Essa análise ainda é uma evolução proposta. O idioma da interface não comprova nacionalidade, e o valor das reservas não comprova lucro. Para falar em rentabilidade, seria preciso considerar custos, comissões, cancelamentos e valores efetivamente recebidos.

### Ajudar o administrador a saber o que está funcionando

**Decisão:** tornar visível o caminho entre descobrir um serviço, demonstrar interesse, solicitar uma reserva e ter a contratação confirmada.

O dashboard atual reúne visualizações, interesses, solicitações, confirmações e valor nominal confirmado, com filtros por período, rankings por serviço e unidade e evolução ao longo do tempo.

Esses dados ajudam a investigar situações diferentes: um serviço pode ser muito visto e pouco solicitado, enquanto outro pode ter menos exposição e mais contratações. Como próximo passo, eu acrescentaria taxas de conversão com denominadores explícitos para facilitar essa leitura.

Como não há integração de pagamento, o painel apresenta **valor nominal confirmado**, sem afirmar que esse dinheiro foi recebido. A confirmação administrativa da contratação e o recebimento financeiro são etapas diferentes.

## 8. Como validar se as recomendações aumentam a receita extra?

**Proposta pós-MVP:** realizar um teste A/B com usuários reais, comparando a experiência com recomendações e a experiência sem esse destaque.

Minha ideia inicial é mostrar recomendações a um grupo e não mostrá-las ao outro. Para tornar a comparação útil, eu estruturaria o experimento assim:

1. Distribuir aleatoriamente os membros elegíveis entre os grupos e manter cada membro no mesmo grupo durante o teste.
2. Manter o mesmo catálogo, preços e condições de acesso nos dois grupos. O controle continua podendo encontrar e contratar os serviços; a diferença é o destaque das recomendações.
3. Executar os grupos ao mesmo tempo, acompanhando diferenças de plano e unidade para reduzir distorções.
4. Definir antes do início a métrica principal, o ganho mínimo relevante e o tamanho de amostra necessário. A duração deve cobrir os ciclos de uso e permitir atingir essa amostra.
5. Comparar a receita extra efetivamente recebida por membro elegível, incluindo quem não comprou e descontando estornos. Acompanhar também conversão, cancelamentos e margem, quando disponível.

Cliques e interesses ajudam a entender o comportamento, mas não bastam para concluir que houve aumento de receita. Enquanto o produto não registrar pagamentos, o teste só poderá avaliar sinais intermediários, como reservas confirmadas e valor nominal por membro.

Eu complementaria os números com conversas breves para entender se as recomendações foram úteis, em que momento apareceram e por que o usuário decidiu contratar ou ignorar a oferta. O experimento é uma proposta de validação, ainda não executada.

## 9. Por que usar a API do próprio framework?

**Decisão:** implementar a API com os Route Handlers do Next.js.

A proposta de justificativa é que as operações do MVP atendem à própria aplicação web. Usar o framework já escolhido permite manter os endpoints junto do projeto, com TypeScript, validação e acesso à sessão, sem exigir um segundo serviço para publicar e operar.

NestJS, Fastify ou Hono seriam alternativas para uma API independente; tRPC seria outra forma de integrar cliente e servidor com tipos compartilhados. Neste escopo, não identifiquei uma necessidade que compensasse acrescentar essa estrutura. Route Handlers permitem expor os endpoints HTTP de que a aplicação precisa.

O frontend chama `/api/*` para as operações de negócio. O servidor valida os dados, a identidade e as permissões, e o banco também aplica controles de acesso. Manter tudo no mesmo projeto não elimina essas responsabilidades.

Eu reavaliaria a separação da API se surgissem outros aplicativos consumidores, integrações com necessidades próprias ou uma equipe e uma escala que justificassem ciclos independentes de desenvolvimento e publicação.

## Limites conscientes do MVP

O foco é demonstrar o fluxo completo de descoberta, interesse, reserva e acompanhamento pelo administrador. Ficaram fora desta entrega pagamentos reais, repasses financeiros, cobrança automática de assinaturas, aplicativo nativo, push, geolocalização e recomendações por aprendizado de máquina.

As recomendações atuais usam regras de plano, dia e horário. Essa abordagem permite testar a utilidade da oferta contextual antes de investir em um mecanismo mais complexo.
