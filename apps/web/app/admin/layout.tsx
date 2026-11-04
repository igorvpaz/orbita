import { redirect } from 'next/navigation'
import { requireAdmin } from '@/lib/auth'
import { ApiError } from '@/lib/api'
import { AdminShell } from '@/components/admin-shell'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  let name = ''
  let email = ''
  try {
    const current = await requireAdmin()
    name = current.profile.full_name
    email = current.profile.email
  } catch (error) {
    if (error instanceof ApiError && error.status < 500) redirect('/login')
    throw error
  }
  return (
    <AdminShell name={name} email={email}>
      {children}
    </AdminShell>
  )
}
