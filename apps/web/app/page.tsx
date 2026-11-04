import { serverTranslator } from '@/lib/i18n-server'
import { OrbitaLogo } from '@/components/orbita-logo'
import Link from 'next/link'
export default async function Home() {
  const t = await serverTranslator()
  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center gap-6 p-6">
      <OrbitaLogo className="w-44" />
      <h1 className="text-4xl font-bold">
        {t('Seu espaço vai além da mesa.')}
      </h1>
      <p className="text-slate-300">
        {t(
          'Experiências e serviços que acompanham sua rotina. Acesse sua conta criada pelo administrador para descobrir o que está disponível na sua unidade.',
        )}
      </p>
      <Link
        className="w-fit rounded-full bg-[#f4cc4e] px-6 py-3 font-semibold text-slate-950"
        href="/login"
      >
        {t('Entrar na Órbita')}
      </Link>
    </main>
  )
}
