'use client'
import { useLanguage } from '@/components/language-provider'
import { useEffect, useState } from 'react'
import { apiRequest } from './api-client'
import { PageSkeleton } from './loading-skeleton'
type Admin = {
  id: string
  email: string
  full_name: string
  created_at: string
}
export function Administrators() {
  const { t, locale } = useLanguage()
  const [data, setData] = useState<{
      administrators: Admin[]
      currentId: string
    } | null>(null),
    [editing, setEditing] = useState<Admin | null>(null),
    [removing, setRemoving] = useState<Admin | null>(null),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(''),
    [message, setMessage] = useState('')
  async function load() {
    setData(await apiRequest('/api/admin/administrators'))
  }
  useEffect(() => {
    void apiRequest<{ administrators: Admin[]; currentId: string }>(
      '/api/admin/administrators',
    )
      .then(setData)
      .catch((e) => setError(e.message))
  }, [])
  if (!data && !error)
    return <PageSkeleton title={t('Administradores')} variant="form" />
  return (
    <div className="admin-workspace">
      <header className="workspace-heading">
        <div>
          <h1>{t('Administradores')}</h1>
          <p>{t('Gerencie quem pode administrar a plataforma.')}</p>
        </div>
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
      <section className="surface-card admin-account-form">
        <h2>{editing ? t('Editar administrador') : t('Novo administrador')}</h2>
        <form
          key={editing?.id ?? 'new'}
          className="admin-account-fields"
          onSubmit={async (e) => {
            e.preventDefault()
            const form = e.currentTarget,
              d = new FormData(form)
            setBusy(true)
            setError('')
            setMessage('')
            try {
              const password = String(d.get('password') ?? '')
              await apiRequest(
                '/api/admin/administrators' + (editing ? '/' + editing.id : ''),
                editing ? 'PATCH' : 'POST',
                {
                  email: d.get('email'),
                  fullName: d.get('fullName'),
                  ...(password ? { password } : {}),
                },
              )
              setEditing(null)
              form.reset()
              await load()
              setMessage('Administrador salvo com sucesso.')
            } catch (e) {
              setError(e instanceof Error ? e.message : 'Falha ao salvar')
            } finally {
              setBusy(false)
            }
          }}
        >
          <label>
            {t('Nome completo')}
            <input
              name="fullName"
              required
              minLength={2}
              maxLength={120}
              defaultValue={editing?.full_name}
            />
          </label>
          <label>
            {t('E-mail')}
            <input
              name="email"
              type="email"
              required
              defaultValue={editing?.email}
            />
          </label>
          <label>
            {editing ? t('Nova senha (opcional)') : t('Senha')}
            <input
              name="password"
              type="password"
              autoComplete="new-password"
              minLength={8}
              maxLength={128}
              required={!editing}
            />
          </label>
          <div className="flex gap-3">
            <button disabled={busy} className="primary-button">
              {editing ? t('Salvar alterações') : t('Criar administrador')}
            </button>
            {editing && (
              <button
                type="button"
                className="secondary-button"
                onClick={() => setEditing(null)}
              >
                {t('Cancelar')}
              </button>
            )}
          </div>
        </form>
      </section>
      <section className="surface-card table-scroll">
        <table className="members-table">
          <thead>
            <tr>
              <th>{t('Administrador')}</th>
              <th>{t('Cadastro')}</th>
              <th>{t('Ações')}</th>
            </tr>
          </thead>
          <tbody>
            {data?.administrators.map((a) => (
              <tr key={a.id}>
                <td>
                  <strong>{a.full_name}</strong>
                  {a.id === data.currentId && (
                    <span className="count-badge">{t('Você')}</span>
                  )}
                  <p>{a.email}</p>
                </td>
                <td>{new Date(a.created_at).toLocaleDateString(locale)}</td>
                <td>
                  <div className="row-actions">
                    <button onClick={() => setEditing(a)}>{t('Editar')}</button>
                    <button
                      className="action-danger"
                      disabled={
                        busy ||
                        a.id === data.currentId ||
                        data.administrators.length < 2
                      }
                      onClick={() => setRemoving(a)}
                    >
                      {t('Excluir')}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
      {removing && (
        <section
          className="confirmation-overlay"
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="delete-admin-title"
        >
          <div className="surface-card confirmation-dialog">
            <h2 id="delete-admin-title">{t('Excluir administrador?')}</h2>
            <p>{removing.email}</p>
            <p>{t('O acesso dessa conta será removido permanentemente.')}</p>
            <div className="flex gap-3">
              <button
                disabled={busy}
                className="primary-button"
                onClick={async () => {
                  setBusy(true)
                  setError('')
                  try {
                    await apiRequest(
                      '/api/admin/administrators/' + removing.id,
                      'DELETE',
                    )
                    setRemoving(null)
                    await load()
                    setMessage('Administrador excluído.')
                  } catch (e) {
                    setError(
                      e instanceof Error ? e.message : 'Falha ao excluir',
                    )
                    setRemoving(null)
                  } finally {
                    setBusy(false)
                  }
                }}
              >
                {t('Confirmar exclusão')}
              </button>
              <button
                disabled={busy}
                className="secondary-button"
                onClick={() => setRemoving(null)}
              >
                {t('Cancelar')}
              </button>
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
