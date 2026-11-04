import { serverTranslator } from '@/lib/i18n-server'
export default async function OfflinePage() {
  const t = await serverTranslator()
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-5 p-6">
      <p className="text-sm font-bold uppercase tracking-[0.3em] text-teal-300">
        {t('Órbita')}
      </p>
      <h1 className="text-3xl font-bold">{t('Sem conexão')}</h1>
      <p className="text-slate-300">
        {t(
          'O catálogo, login e solicitações exigem internet. Reconecte e tente novamente.',
        )}
      </p>
      <a
        className="w-fit rounded-xl bg-teal-300 px-5 py-3 font-semibold text-slate-950"
        href="/member"
      >
        {t('Tentar novamente')}
      </a>
    </main>
  )
}
