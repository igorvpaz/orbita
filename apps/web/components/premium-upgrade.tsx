'use client'
import { useLanguage } from '@/components/language-provider'
import { useCallback, useEffect, useState } from 'react'
import { ContentSkeleton } from '@/components/loading-skeleton'
import { apiRequest } from '@/components/api-client'
import { UiIcon } from '@/components/ui-icon'
type State = {
  plan: {
    code: string
    name: string
  }
  requests: {
    id: string
    status: string
  }[]
}
export function PremiumUpgrade() {
  const { t } = useLanguage()
  const [state, setState] = useState<State | null>(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const load = useCallback(async () => {
    try {
      setState(await apiRequest<State>('/api/upgrades'))
      setError('')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao carregar')
    }
  }, [])
  useEffect(() => {
    const initial = setTimeout(() => void load(), 0)
    const timer = setInterval(() => void load(), 15000)
    return () => {
      clearTimeout(initial)
      clearInterval(timer)
    }
  }, [load])
  async function request() {
    setBusy(true)
    try {
      await apiRequest('/api/upgrades', 'POST')
      await load()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao solicitar')
    } finally {
      setBusy(false)
    }
  }
  const pending = state?.requests.some((r) => r.status === 'pending')
  const premium = state?.plan.code === 'premium'
  if (!state && !error) return <ContentSkeleton variant="subscription" />
  return (
    <section className="surface-card upgrade-panel">
      <span className="premium-emblem">
        <UiIcon name="crown" />
      </span>
      <span className="eyebrow">{t('ÓRBITA PREMIUM')}</span>
      <h2>
        {premium
          ? t('Seu acesso Premium está ativo.')
          : t('Mais possibilidades para sua rotina.')}
      </h2>
      <p>
        {t(
          'Salas executivas, estúdios e serviços exclusivos. Mantenha os benefícios do Básico e libere experiências Premium em todas as unidades.',
        )}
      </p>
      <ul>
        <li>{t('Experiências exclusivas em todo o RS')}</li>
        <li>{t('Salas executivas e estúdios de gravação')}</li>
        <li>{t('Acesso em todas as unidades Órbita')}</li>
      </ul>
      {error && (
        <p role="alert" className="notice-error">
          {t(error, 'Falha na operação')}
        </p>
      )}
      {premium ? (
        <p role="status" className="notice-success">
          {t(
            'Os serviços Premium estão liberados nos respectivos horários de atendimento.',
          )}
        </p>
      ) : pending ? (
        <p role="status" className="upgrade-pending">
          {t('Solicitação enviada. Aguardando aprovação do administrador.')}
        </p>
      ) : (
        <button
          disabled={busy || !state}
          className="primary-button"
          onClick={() => void request()}
        >
          <UiIcon name="crown" />
          {busy ? t('Enviando…') : t('Solicitar upgrade para Premium')}
        </button>
      )}
      <p className="upgrade-disclaimer">
        {t(
          'O administrador analisa o pedido. Não há cobrança nem troca automática de plano.',
        )}
      </p>
    </section>
  )
}
