# Publicação de 03/11/2026

- URL canônica: https://orbita-dpvgtjzjva-rj.a.run.app
- Login: https://orbita-dpvgtjzjva-rj.a.run.app/login
- Projeto: `orbita-513618`
- Serviço/região: `orbita` / `southamerica-east1`
- Revisão ativa: `orbita-00002-phj`
- Imagem: `southamerica-east1-docker.pkg.dev/orbita-513618/orbita/orbita:20261103161420`
- Build: `babd45f9-317f-4da5-94d6-92b1f08d2283` — concluído com sucesso.
- Configuração: CPU 1, memória 1 GiB, escala de zero a duas instâncias.

Foi vinculada a conta de **avaliação gratuita confirmada pelo usuário**. Não foi realizado upgrade para conta paga. O período pretendido para a demonstração é de 30 dias; não foi programado desligamento automático. O teste gratuito tem seus próprios limites de prazo e créditos.

O servidor recebeu `SITE_URL` com a URL canônica acima. Use esse endereço para acessar e compartilhar o app; o Cloud Run também pode exibir outro alias, mas a validação de origem da aplicação aceita apenas a origem configurada.

A chave privada Supabase é uma referência ao Secret Manager, acessível pela identidade de runtime. Nenhum arquivo `.env`, SDK local, cache de dependências ou chave privada foi enviado no pacote de build. O pacote de fonte tinha 167 arquivos e aproximadamente 1,5 MiB.

## Validação na URL pública

- Health HTTP 200.
- Login em português mesmo com cookie antigo de idioma inglês.
- Áreas `/admin` e `/member` redirecionam visitantes sem sessão para o login.
- API `/api/me` retorna 401 sem sessão e perfil administrativo com sessão válida.
- Login do administrador e página administrativa HTTP 200.
- Catálogo administrativo com 36 serviços, todos com foto.
- Manifest, service worker, favicon, script de tema e seis fotos WebP disponíveis.
- Service worker com `no-store` e escopo raiz.
- POST com sessão e origem corretas alcança a validação de entrada (422 para corpo vazio); origem externa é rejeitada com 403. Nenhum registro foi criado.
- A sessão temporária de validação foi encerrada sem afetar outras sessões.

Os 39 testes da aplicação e as verificações locais de TypeScript/ESLint passaram antes da publicação. O Docker foi construído pelo Cloud Build. Não foi feita instalação real em aparelho iOS/Android.

## URL padrão no painel Supabase

O conector disponível não oferece edição da configuração de URLs de Auth e não há token local de gerenciamento. Portanto, a configuração remota de Site URL não foi alterada nesta publicação. O login direto por e-mail/senha foi validado no site publicado e não depende desse redirect; confirmação e recuperação por e-mail permanecem desabilitadas conforme o escopo de treinamento.

Para alinhar também esse metadado, em [Authentication → URL Configuration](https://supabase.com/dashboard/project/ifazwnuhtajmmkwxhrjr/auth/url-configuration), use a URL canônica como Site URL e adicione os três callbacks descritos em [deploy-cloud-run.md](deploy-cloud-run.md). Isso passa a ser necessário se fluxos de autenticação com redirecionamento forem habilitados.
