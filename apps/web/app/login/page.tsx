import { ThemeToggle } from '@/components/theme-provider'
import { OrbitaLogo } from '@/components/orbita-logo'
import { LoginForm } from '@/components/login-form'
export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{
    next?: string
    error?: string
  }>
}) {
  const params = await searchParams
  return (
    <main className="login-page">
      <section className="login-brand-panel" aria-label={'Conheça a Órbita'}>
        <OrbitaLogo className="login-brand-logo" />
        <div className="login-brand-copy">
          <h2>{'Seu espaço. Sua rotina. Um universo de possibilidades.'}</h2>
          <p>
            {
              'Descubra serviços e experiências que tornam seu dia no coworking ainda melhor — tudo em um só lugar.'
            }
          </p>
        </div>
        <p className="login-brand-footer">
          <span />
          {'Acesso restrito · Órbita'}
        </p>
      </section>
      <section className="login-access-panel" aria-labelledby="login-title">
        <div className="login-language">
          <ThemeToggle />
        </div>
        <div className="login-access-content">
          <h1 id="login-title">{'Entrar'}</h1>
          <p className="login-intro">
            {'Use seu e-mail para acessar a plataforma.'}
          </p>
          <LoginForm next={params.next} linkError={!!params.error} />
        </div>
      </section>
    </main>
  )
}
