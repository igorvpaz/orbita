import { getMemberState } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { MemberOrders } from '@/components/member-orders'
export default async function MemberOrdersPage() {
  const state = await getMemberState()
  if (!state.active) redirect('/member')
  return <MemberOrders />
}
