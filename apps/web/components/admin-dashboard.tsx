'use client'
import { useLanguage } from '@/components/language-provider'
import { useEffect, useState } from 'react'
import { apiRequest } from './api-client'
import { PageSkeleton, Skeleton } from './loading-skeleton'
import { UiIcon } from './ui-icon'
type Metric = {
  id: string
  name: string
  unit_name?: string
  city?: string
  visitors: number
  views: number
  interests: number
  orders: number
  value_cents: number
}
type Report = {
  from: string
  to: string
  views: number
  interests: number
  orders_requested: number
  orders_confirmed: number
  nominal_confirmed_cents: number
  services: Metric[]
  units: Metric[]
  timeline: {
    day: string
    views: number
    interests: number
    orders: number
    value_cents: number
  }[]
}
export function AdminDashboard() {
  const { t } = useLanguage()
  const [period, setPeriod] = useState('30'),
    [query, setQuery] = useState('period=30'),
    [report, setReport] = useState<Report | null>(null),
    [loading, setLoading] = useState(true),
    [error, setError] = useState(''),
    [refresh, setRefresh] = useState(0),
    [ranking, setRanking] = useState<
      'views' | 'interests' | 'orders' | 'value_cents'
    >('views')
  const [unitRanking, setUnitRanking] = useState<'value_cents' | 'visitors'>(
    'value_cents',
  )
  const today = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'America/Sao_Paulo',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(new Date()),
    [from, setFrom] = useState(today),
    [to, setTo] = useState(today)
  const money = (n: number) =>
    new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(n / 100)
  useEffect(() => {
    let active = true
    void apiRequest<Report>('/api/analytics?' + query)
      .then((d) => {
        if (active) setReport(d)
      })
      .catch((e) => {
        if (active) setError(e.message)
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [query, refresh])
  if (!report && loading)
    return <PageSkeleton title={t('Visão geral')} variant="dashboard" />
  const top = [...(report?.services ?? [])]
      .sort((a, b) => b[ranking] - a[ranking])
      .slice(0, 6),
    max = Math.max(1, ...top.map((s) => s[ranking])),
    units = [...(report?.units ?? [])].sort(
      (a, b) => b[unitRanking] - a[unitRanking] || b.views - a.views,
    ),
    peak = Math.max(
      1,
      ...(report?.timeline ?? []).map((d) => d.views + d.interests + d.orders),
    )
  return (
    <div className="admin-workspace dashboard">
      <header className="workspace-heading">
        <div>
          <span className="eyebrow">{t('PAINEL DE DESEMPENHO')}</span>
          <h1>{t('Visão geral')}</h1>
          <p>
            {t('Entenda o que seus membros descobrem, desejam e reservam.')}
          </p>
        </div>
        <button
          className="secondary-button"
          disabled={loading}
          onClick={() => {
            setLoading(true)
            setError('')
            setRefresh((v) => v + 1)
          }}
        >
          <UiIcon name="refresh" />
          {t('Atualizar')}
        </button>
      </header>
      <section className="surface-card dashboard-filters">
        <div className="period-buttons">
          {[
            ['today', 'Hoje'],
            ['7', '7 dias'],
            ['30', '30 dias'],
            ['custom', 'Personalizado'],
          ].map(([id, label]) => (
            <button
              key={id}
              aria-pressed={period === id}
              className={period === id ? 'selected' : ''}
              onClick={() => {
                setPeriod(id)
                if (id !== 'custom') {
                  setLoading(true)
                  setError('')
                  setQuery('period=' + id)
                }
              }}
            >
              {t(label)}
            </button>
          ))}
        </div>
        {period === 'custom' && (
          <form
            className="date-filter"
            onSubmit={(e) => {
              e.preventDefault()
              if (from > to) {
                setError('Período inválido')
                return
              }
              setQuery(
                new URLSearchParams({ period: 'custom', from, to }).toString(),
              )
            }}
          >
            <label>
              {t('De')}
              <input
                type="date"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                required
              />
            </label>
            <label>
              {t('Até')}
              <input
                type="date"
                value={to}
                min={from}
                onChange={(e) => setTo(e.target.value)}
                required
              />
            </label>
            <button className="primary-button">{t('Aplicar período')}</button>
          </form>
        )}
        <p className="muted-copy">
          {t('Horário de Brasília · ')}
          {report?.from} — {report?.to}
        </p>
      </section>
      {error && (
        <p role="alert" className="notice-error">
          {t(error, 'Falha na operação')}
        </p>
      )}
      {loading && <Skeleton className="sk-refresh-line" />}
      <div className="dashboard-kpis">
        {[
          ['Visualizações', report?.views ?? 0, 'Descoberta dos serviços'],
          ['Interesses', report?.interests ?? 0, 'Intenção registrada'],
          ['Pedidos', report?.orders_requested ?? 0, 'Solicitações recebidas'],
          ['Confirmados', report?.orders_confirmed ?? 0, 'Pedidos aprovados'],
          [
            'Valor confirmado',
            money(report?.nominal_confirmed_cents ?? 0),
            'Valor nominal contratado',
          ],
        ].map(([label, value, hint], i) => (
          <article
            key={label}
            className={`surface-card metric-card ${i === 4 ? 'metric-revenue' : ''}`}
          >
            <span className="metric-index">0{i + 1}</span>
            <p>{t(label)}</p>
            <strong>{value}</strong>
            <small>{t(hint)}</small>
          </article>
        ))}
      </div>
      {!report?.views && !report?.interests && !report?.orders_requested && (
        <p className="upgrade-pending">
          {t(
            'Ainda não há movimento neste período. Os gráficos serão preenchidos conforme os membros utilizarem a plataforma.',
          )}
        </p>
      )}
      <div className="dashboard-panels">
        <section className="surface-card dashboard-panel">
          <header>
            <div>
              <span className="eyebrow">{t('AO LONGO DO TEMPO')}</span>
              <h2>{t('Movimento diário')}</h2>
            </div>
          </header>
          <div className="chart-legend">
            <span>
              <i className="legend-views" />
              {t('Visualizações')}
            </span>
            <span>
              <i className="legend-interests" />
              {t('Interesses')}
            </span>
            <span>
              <i className="legend-orders" />
              {t('Pedidos')}
            </span>
          </div>
          <div
            className="daily-chart"
            role="img"
            aria-label={t(
              'Gráfico diário de visualizações, interesses e pedidos',
            )}
          >
            {report?.timeline.map((d) => (
              <div
                className="daily-column"
                key={d.day}
                title={`${d.day}: ${d.views} / ${d.interests} / ${d.orders}`}
              >
                <div className="daily-stack">
                  <span
                    className="bar-orders"
                    style={{ height: `${(d.orders / peak) * 100}%` }}
                  />
                  <span
                    className="bar-interests"
                    style={{ height: `${(d.interests / peak) * 100}%` }}
                  />
                  <span
                    className="bar-views"
                    style={{ height: `${(d.views / peak) * 100}%` }}
                  />
                </div>
                <small>{d.day.slice(8)}</small>
              </div>
            ))}
          </div>
          <details className="chart-accessible">
            <summary>{t('Ver dados do gráfico')}</summary>
            <div className="table-scroll">
              <table className="members-table">
                <thead>
                  <tr>
                    <th>{t('Data')}</th>
                    <th>{t('Visualizações')}</th>
                    <th>{t('Interesses')}</th>
                    <th>{t('Pedidos')}</th>
                    <th>{t('Valor confirmado')}</th>
                  </tr>
                </thead>
                <tbody>
                  {report?.timeline.map((d) => (
                    <tr key={d.day}>
                      <td>{d.day}</td>
                      <td>{d.views}</td>
                      <td>{d.interests}</td>
                      <td>{d.orders}</td>
                      <td>{money(d.value_cents)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </details>
        </section>
        <section className="surface-card dashboard-panel">
          <header>
            <div>
              <span className="eyebrow">{t('DO INTERESSE À RESERVA')}</span>
              <h2>{t('Jornada dos membros')}</h2>
            </div>
          </header>
          <div className="journey">
            {[
              ['Visualizações', report?.views ?? 0],
              ['Interesses', report?.interests ?? 0],
              ['Pedidos', report?.orders_requested ?? 0],
              ['Confirmados', report?.orders_confirmed ?? 0],
            ].map(([label, value], i) => (
              <div key={label}>
                <span className="journey-number">{i + 1}</span>
                <span>{t(label)}</span>
                <strong>{value}</strong>
              </div>
            ))}
          </div>
          <p className="muted-copy">
            {t(
              'Eventos e pedidos do período. As etapas representam totais independentes.',
            )}
          </p>
        </section>
      </div>
      <section className="surface-card dashboard-panel">
        <header>
          <div>
            <span className="eyebrow">{t('EXPERIÊNCIAS EM DESTAQUE')}</span>
            <h2>{t('Desempenho dos serviços')}</h2>
          </div>
          <label>
            {t('Ordenar por')}
            <select
              value={ranking}
              onChange={(e) => setRanking(e.target.value as typeof ranking)}
            >
              <option value="views">{t('Visualizações')}</option>
              <option value="interests">{t('Interesses')}</option>
              <option value="orders">{t('Pedidos')}</option>
              <option value="value_cents">{t('Valor confirmado')}</option>
            </select>
          </label>
        </header>
        <div className="service-ranking">
          {top.map((s, i) => (
            <div className="ranking-row" key={s.id}>
              <span className="ranking-place">{i + 1}</span>
              <div>
                <strong>{t(s.name)}</strong>
                <small>{s.unit_name}</small>
                <div className="ranking-track">
                  <i style={{ width: `${(s[ranking] / max) * 100}%` }} />
                </div>
              </div>
              <span>
                {ranking === 'value_cents' ? money(s[ranking]) : s[ranking]}
              </span>
            </div>
          ))}
        </div>
        <details className="chart-accessible">
          <summary>{t('Todos os serviços')}</summary>
          <div className="table-scroll">
            <table className="members-table">
              <thead>
                <tr>
                  <th>{t('Serviços')}</th>
                  <th>{t('Unidade')}</th>
                  <th>{t('Visualizações')}</th>
                  <th>{t('Interesses')}</th>
                  <th>{t('Pedidos')}</th>
                  <th>{t('Valor confirmado')}</th>
                </tr>
              </thead>
              <tbody>
                {report?.services.map((s) => (
                  <tr key={s.id}>
                    <td>{t(s.name)}</td>
                    <td>{s.unit_name}</td>
                    <td>{s.views}</td>
                    <td>{s.interests}</td>
                    <td>{s.orders}</td>
                    <td>{money(s.value_cents)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
      </section>
      <section className="surface-card dashboard-panel">
        <header>
          <div>
            <span className="eyebrow">{t('A REDE ÓRBITA')}</span>
            <h2>{t('Movimento e valor por unidade')}</h2>
          </div>
          <label>
            {t('Ordenar por')}
            <select
              value={unitRanking}
              onChange={(e) =>
                setUnitRanking(e.target.value as typeof unitRanking)
              }
            >
              <option value="value_cents">{t('Valor confirmado')}</option>
              <option value="visitors">{t('Membros únicos')}</option>
            </select>
          </label>
        </header>
        <div className="table-scroll">
          <table className="members-table">
            <thead>
              <tr>
                <th>{t('Unidade')}</th>
                <th>{t('Membros únicos')}</th>
                <th>{t('Visualizações')}</th>
                <th>{t('Interesses')}</th>
                <th>{t('Pedidos')}</th>
                <th>{t('Valor confirmado')}</th>
              </tr>
            </thead>
            <tbody>
              {units.map((u) => (
                <tr key={u.id}>
                  <td>
                    <strong>{u.name}</strong>
                    <small className="block">{u.city}</small>
                  </td>
                  <td>{u.visitors}</td>
                  <td>{u.views}</td>
                  <td>{u.interests}</td>
                  <td>{u.orders}</td>
                  <td>
                    <strong>{money(u.value_cents)}</strong>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <p className="muted-copy">
        {t(
          'Valores confirmados são nominais: a plataforma não processa pagamentos. São contabilizados pela data de confirmação; pedidos e eventos, pela data de criação.',
        )}
      </p>
    </div>
  )
}
