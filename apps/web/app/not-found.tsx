import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-5 p-6">
      <h1 className="text-3xl font-bold">Página não encontrada</h1>
      <p>Este endereço não existe ou não está mais disponível.</p>
      <Link href="/login" className="primary-button">
        Voltar ao início
      </Link>
    </main>
  )
}
