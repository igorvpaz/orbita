'use client'
import { useCallback, useEffect, useState } from 'react'
import { PageSkeleton } from '@/components/loading-skeleton'
import { apiRequest } from '@/components/api-client'
import { UiIcon } from '@/components/ui-icon'
type RequestRow = {
  id: string
  status: string
  created_at: string
  member?: { full_name: string; email: string }
}
export function UpgradeRequests() {
  const [requests, setRequests] = useState<RequestRow[]>([])
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const load = useCallback(async () => {
    try {
      setError('')
      setRequests(
        (await apiRequest<{ requests: RequestRow[] }>('/api/admin/upgrades'))
          .requests,
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
    return <PageSkeleton variant="table" title="Solicitações de upgrade" />
  return (
    <div className="admin-workspace">
      <header className="workspace-heading">
        <div>
          <h1>Solicitações de upgrade</h1>
          <p>Aprove o acesso ao plano Premium dos seus membros.</p>
        </div>
        <button className="secondary-button" onClick={() => void load()}>
          <UiIcon name="refresh" />
          Atualizar
        </button>
      </header>
      {error && (
        <p role="alert" className="notice-error">
          {error}
        </p>
      )}
      {message && (
        <p role="status" className="notice-success">
          {message}
        </p>
      )}
      <section className="surface-card">
        <div className="card-heading upgrade-card-title">
          <h2>Pedidos recebidos</h2>
          <span className="quiet-badge">
            {requests.filter((r) => r.status === 'pending').length} pendentes
          </span>
        </div>
        <div className="table-scroll">
          <table className="members-table">
            <thead>
              <tr>
                <th>Membro</th>
                <th>Plano solicitado</th>
                <th>Data</th>
                <th>Status</th>
                <th>Ações</th>
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
                    <span className="premium-badge">Premium</span>
                  </td>
                  <td>{new Date(r.created_at).toLocaleString('pt-BR')}</td>
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
                          Aprovar upgrade
                        </button>
                        <button
                          disabled={busy}
                          className="action-danger"
                          onClick={() => void review(r.id, 'rejected')}
                        >
                          Recusar
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
            <h3>Nenhuma solicitação por enquanto.</h3>
            <p>Os pedidos de upgrade dos membros aparecerão aqui.</p>
          </div>
        )}
      </section>
    </div>
  )
}
