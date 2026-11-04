'use client'
import { useLanguage } from '@/components/language-provider'
import { apiRequest } from '@/components/api-client'
import { useRouter } from 'next/navigation'
import { UiIcon } from './ui-icon'
export function LogoutButton({ label }: { label?: string }) {
  const { t } = useLanguage()
  const router = useRouter()
  return (
    <button
      type="button"
      className="logout-button"
      aria-label={t(label || 'Sair da conta')}
      title={t(label || 'Sair da conta')}
      onClick={async () => {
        await apiRequest('/api/auth/logout', 'POST')
        router.replace('/login')
        router.refresh()
      }}
    >
      <UiIcon name="logout" />
    </button>
  )
}
