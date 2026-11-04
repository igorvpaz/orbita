import { serverTranslator } from '@/lib/i18n-server'
import { ThemeToggle } from '@/components/theme-provider'
import { OrbitaLogo } from '@/components/orbita-logo'
import { LoginForm } from '@/components/login-form'
import { LanguageSelect } from '@/components/language-provider'
export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{
    next?: string
    error?: string
  }>
}) {
  const t = await serverTranslator()
  const params = await searchParams
  return (
    <main className="login-page">
      <section className="login-brand-panel" aria-label={t('Conheça a Órbita')}>
        <OrbitaLogo className="login-brand-logo" />
        <div className="login-brand-copy">
          <h2>{t('Seu espaço. Sua rotina. Um universo de possibilidades.')}</h2>
          <p>
            {t(
              'Descubra serviços e experiências que tornam seu dia no coworking ainda melhor — tudo em um só lugar.',
            )}
          </p>
        </div>
        <p className="login-brand-footer">
          <span />
          {t('Acesso restrito · Órbita')}
        </p>
      </section>
      <section className="login-access-panel" aria-labelledby="login-title">
        <div className="login-language">
          <LanguageSelect />
          <ThemeToggle />
        </div>
        <div className="login-access-content">
          <h1 id="login-title">{t('Entrar')}</h1>
          <p className="login-intro">
            {t('Use seu e-mail para acessar a plataforma.')}
          </p>
          <LoginForm next={params.next} linkError={!!params.error} />
        </div>
      </section>
    </main>
  )
}
