import { AdminShell } from '@/components/admin-shell'
import { redirect } from 'next/navigation'
import { ApiError } from '@/lib/api'
import { getMemberState } from '@/lib/auth'
export default async function MemberLayout({
  children,
}: {
  children: React.ReactNode
}) {
  let name = ''
  let email = ''
  try {
    const { profile } = await getMemberState()
    name = profile.full_name
    email = profile.email
  } catch (error) {
    if (error instanceof ApiError && error.status < 500) redirect('/login')
    throw error
  }
  return (
    <AdminShell name={name} email={email} mode="member">
      {children}
    </AdminShell>
  )
}
