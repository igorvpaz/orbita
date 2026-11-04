import { getMemberState } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { ServiceDetail } from '@/components/service-detail'
export default async function ServicePage({
  params,
}: {
  params: Promise<{
    id: string
  }>
}) {
  const state = await getMemberState()
  if (!state.active) redirect('/member')
  return <ServiceDetail id={(await params).id} />
}
