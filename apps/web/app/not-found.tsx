import { serverTranslator } from '@/lib/i18n-server'
import Link from 'next/link'
export default async function NotFound() {
  const t = await serverTranslator()
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-5 p-6">
      <h1 className="text-3xl font-bold">{t('Página não encontrada')}</h1>
      <p>{t('Este endereço não existe ou não está mais disponível.')}</p>
      <Link href="/login" className="primary-button">
        {t('Voltar ao início')}
      </Link>
    </main>
  )
}
