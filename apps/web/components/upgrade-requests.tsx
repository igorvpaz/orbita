'use client'
import { useLanguage } from '@/components/language-provider'
import { useCallback, useEffect, useState } from 'react'
import { PageSkeleton } from '@/components/loading-skeleton'
import { apiRequest } from '@/components/api-client'
import { UiIcon } from '@/components/ui-icon'
type RequestRow = {
  id: string
  status: string
  created_at: string
  member?: {
    full_name: string
    email: string
  }
}
export function UpgradeRequests() {
  const { t, locale } = useLanguage()
  const [requests, setRequests] = useState<RequestRow[]>([])
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const load = useCallback(async () => {
    try {
      setError('')
      setRequests(
        (
          await apiRequest<{
            requests: RequestRow[]
          }>('/api/admin/upgrades')
        ).requests,
      )
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao carregar')
    } finally {
      setLoading(false)
    }
  }, [])
  useEffect(() => {
    const initial = setTimeout(() => void load(), 0)
    const timer = setInterval(() => void load(), 30000)
    return () => {
      clearTimeout(initial)
      clearInterval(timer)
    }
  }, [load])
  async function review(id: string, decision: 'approved' | 'rejected') {
    setBusy(true)
    setMessage('')
    try {
      await apiRequest(`/api/admin/upgrades/${id}`, 'PATCH', { decision })
      setMessage(
        decision === 'approved'
          ? 'Upgrade aprovado. O membro já tem acesso Premium.'
          : 'Solicitação recusada.',
      )
      await load()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao analisar')
    } finally {
      setBusy(false)
    }
  }
  if (loading)
    return <PageSkeleton variant="table" title={t('Solicitações de upgrade')} />
  return (
    <div className="admin-workspace">
      <header className="workspace-heading">
        <div>
          <h1>{t('Solicitações de upgrade')}</h1>
          <p>{t('Aprove o acesso ao plano Premium dos seus membros.')}</p>
        </div>
        <button className="secondary-button" onClick={() => void load()}>
          <UiIcon name="refresh" />
          {t('Atualizar')}
        </button>
      </header>
      {error && (
        <p role="alert" className="notice-error">
          {t(error, 'Falha na operação')}
        </p>
      )}
      {message && (
        <p role="status" className="notice-success">
          {t(message)}
        </p>
      )}
      <section className="surface-card">
        <div className="card-heading upgrade-card-title">
          <h2>{t('Pedidos recebidos')}</h2>
          <span className="quiet-badge">
            {requests.filter((r) => r.status === 'pending').length}
            {t('pendentes')}
          </span>
        </div>
        <div className="table-scroll">
          <table className="members-table">
            <thead>
              <tr>
                <th>{t('Membro')}</th>
                <th>{t('Plano solicitado')}</th>
                <th>{t('Data')}</th>
                <th>{t('Status')}</th>
                <th>{t('Ações')}</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((r) => (
                <tr key={r.id}>
                  <td>
                    <strong>{r.member?.full_name}</strong>
                    <br />
                    {r.member?.email}
                  </td>
                  <td>
                    <span className="premium-badge">{t('Premium')}</span>
                  </td>
                  <td>{new Date(r.created_at).toLocaleString(locale)}</td>
                  <td>
                    {
                      {
                        pending: 'Pendente',
                        approved: 'Aprovado',
                        rejected: 'Recusado',
                      }[r.status]
                    }
                  </td>
                  <td>
                    {r.status === 'pending' && (
                      <div className="row-actions">
                        <button
                          disabled={busy}
                          onClick={() => void review(r.id, 'approved')}
                        >
                          {t('Aprovar upgrade')}
                        </button>
                        <button
                          disabled={busy}
                          className="action-danger"
                          onClick={() => void review(r.id, 'rejected')}
                        >
                          {t('Recusar')}
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {requests.length === 0 && (
          <div className="member-empty">
            <h3>{t('Nenhuma solicitação por enquanto.')}</h3>
            <p>{t('Os pedidos de upgrade dos membros aparecerão aqui.')}</p>
          </div>
        )}
      </section>
    </div>
  )
}
