import { OrbitaLogo } from '@/components/orbita-logo'
import Link from 'next/link'

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center gap-6 p-6">
      <OrbitaLogo className="w-44" />
      <h1 className="text-4xl font-bold">Seu espaço vai além da mesa.</h1>
      <p className="text-slate-300">
        Experiências e serviços que acompanham sua rotina. Acesse sua conta
        criada pelo administrador para descobrir o que está disponível na sua
        unidade.
      </p>
      <Link
        className="w-fit rounded-full bg-[#f4cc4e] px-6 py-3 font-semibold text-slate-950"
        href="/login"
      >
        Entrar na Órbita
      </Link>
    </main>
  )
}
