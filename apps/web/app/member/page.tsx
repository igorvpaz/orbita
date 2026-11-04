import { getMemberState } from '@/lib/auth'
import { MemberCatalog } from '@/components/member-catalog'
export default async function MemberPage({
  searchParams,
}: {
  searchParams: Promise<{
    unitId?: string
  }>
}) {
  const state = await getMemberState()
  if (!state.active)
    return (
      <section className="surface-card upgrade-panel">
        <p className="text-sm uppercase tracking-[0.25em] text-[#967a25]">
          {'Assinatura'}
        </p>
        <h1 className="mt-4 text-3xl font-bold">{'Acesso pausado'}</h1>
        <p className="mt-4 text-[#77796e]">
          {
            'Sua assinatura está inativa, ainda não começou ou expirou. Procure a recepção para regularizar.'
          }
        </p>
      </section>
    )
  return <MemberCatalog initialUnitId={(await searchParams).unitId} />
}
