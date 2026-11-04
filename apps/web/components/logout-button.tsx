'use client'
import { apiRequest } from '@/components/api-client'
import { useRouter } from 'next/navigation'
export function LogoutButton({ label }: { label?: string }) {
  const router = useRouter()
  return (
    <button
      className="text-sm text-slate-300 hover:text-white"
      onClick={async () => {
        await apiRequest('/api/auth/logout', 'POST')
        router.replace('/login')
        router.refresh()
      }}
    >
      {label ?? 'Sair'}
    </button>
  )
}
