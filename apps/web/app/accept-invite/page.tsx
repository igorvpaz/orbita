import { serverTranslator } from '@/lib/i18n-server'
import { PasswordForm } from '@/components/password-form'
export default async function AcceptInvitePage() {
  const t = await serverTranslator()
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-6 p-6">
      <p className="text-sm font-bold uppercase tracking-[0.35em] text-teal-300">
        {t('Órbita')}
      </p>
      <h1 className="text-3xl font-bold">{t('Aceitar convite')}</h1>
      <PasswordForm invitation />
    </main>
  )
}
