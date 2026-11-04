'use client'
import { LoadingRegion, Skeleton } from '@/components/loading-skeleton'
import { usePwa } from '@/components/pwa-provider'
import { UiIcon } from '@/components/ui-icon'
import { OrbitaLogo } from '@/components/orbita-logo'
export function InstallApp() {
  const pwa = usePwa()
  return (
    <div className="admin-workspace">
      <header className="workspace-heading">
        <div>
          <h1>{'Órbita, sempre com você.'}</h1>
          <p>
            {'Instale o aplicativo e acesse seu espaço direto da tela inicial.'}
          </p>
        </div>
      </header>
      <section className="surface-card install-app-card">
        <div className="install-brand">
          <OrbitaLogo />
        </div>
        <h2>{'Seu coworking a um toque.'}</h2>
        <p>
          {
            'Abra serviços, pedidos e sua assinatura em uma janela própria do aplicativo.'
          }
        </p>
        {pwa.error && (
          <p className="notice-error" role="alert">
            {pwa.error}
          </p>
        )}
        {!pwa.ready ? (
          <LoadingRegion>
            <Skeleton className="sk-button sk-install-button" />
          </LoadingRegion>
        ) : pwa.installed ? (
          <p className="notice-success" role="status">
            {'Você está usando o aplicativo Órbita instalado.'}
          </p>
        ) : pwa.available ? (
          <button className="primary-button" onClick={() => void pwa.install()}>
            <UiIcon name="download" />
            {'Instalar Órbita'}
          </button>
        ) : (
          <p className="upgrade-pending" role="status">
            {!pwa.secure
              ? 'Acesse o endereço HTTPS para instalar no celular.'
              : 'Use o menu do navegador para instalar. Se já instalou, abra o app pela tela inicial.'}
          </p>
        )}
        <div className="install-instructions">
          <article>
            <span>01</span>
            <h3>Android · Chrome / Edge</h3>
            <p>
              {
                'Abra o menu do navegador (⋮), selecione “Instalar aplicativo” ou “Adicionar à tela inicial” e confirme.'
              }
            </p>
          </article>
          <article>
            <span>02</span>
            <h3>iPhone / iPad · Safari</h3>
            <p>
              {
                'Toque em Compartilhar, escolha “Adicionar à Tela de Início” e confirme em “Adicionar”.'
              }
            </p>
          </article>
          <article>
            <span>03</span>
            <h3>{'Computador · Chrome / Edge'}</h3>
            <p>
              {
                'Use o ícone de instalação na barra de endereço ou a opção “Instalar Órbita” no menu do navegador.'
              }
            </p>
          </article>
        </div>
        <p className="upgrade-disclaimer">
          {
            'Login, catálogo e pedidos precisam de internet. Sem conexão, o app mostra apenas uma tela de aviso.'
          }
        </p>
      </section>
    </div>
  )
}
