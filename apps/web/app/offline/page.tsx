export default function OfflinePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-5 p-6">
      <p className="text-sm font-bold uppercase tracking-[0.3em] text-teal-300">
        Órbita
      </p>
      <h1 className="text-3xl font-bold">Sem conexão</h1>
      <p className="text-slate-300">
        O catálogo, login e solicitações exigem internet. Reconecte e tente
        novamente.
      </p>
      <a
        className="w-fit rounded-xl bg-teal-300 px-5 py-3 font-semibold text-slate-950"
        href="/member"
      >
        Tentar novamente
      </a>
    </main>
  )
}
