/* eslint-disable @next/next/no-img-element -- Private signed media. */
'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { apiRequest } from '@/components/api-client'
import { PageSkeleton, Skeleton } from '@/components/loading-skeleton'
import { UiIcon } from '@/components/ui-icon'
export type CatalogService = {
  unit_id: string
  unit_name: string
  id: string
  name: string
  description_pt: string
  description_en: string | null
  price_cents: number
  category: string
  partner_name: string
  image_url: string | null
  image_alt: string
  reason: string
  premium: boolean
  locked: boolean
  available_now: boolean
  can_order: boolean
  schedules: {
    weekdays: number[]
    start: string
    end: string
  }[]
}
type Unit = {
  id: string
  name: string
  city: string
  neighborhood: string
  timezone: string
}
type Catalog = {
  unit: Unit
  units: Unit[]
  plan: {
    name: string
    code: string
  }
  services: CatalogService[]
  generated_at: string
}
export function MemberCatalog({
  initialUnitId = '',
}: {
  initialUnitId?: string
}) {
  const [catalog, setCatalog] = useState<Catalog | null>(null)
  const [unitId, setUnitId] = useState(initialUnitId)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [reload, setReload] = useState(0)
  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const data = await apiRequest<Catalog>(
          `/api/recommendations${unitId ? `?unitId=${encodeURIComponent(unitId)}` : ''}`,
        )
        if (!cancelled) {
          setCatalog(data)
          setError('')
        }
      } catch (e) {
        if (!cancelled)
          setError(e instanceof Error ? e.message : 'Erro ao carregar')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    void load()
    const interval = setInterval(() => void load(), 30000)
    const onVisible = () => {
      if (document.visibilityState === 'visible') void load()
    }
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      cancelled = true
      clearInterval(interval)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [unitId, reload])
  const currency = (value: number) =>
    new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value / 100)
  if (!catalog && loading)
    return <PageSkeleton variant="catalog" title={'Sua órbita hoje'} />
  return (
    <div className="admin-workspace member-catalog">
      <header className="workspace-heading">
        <div>
          <h1>{'Sua órbita hoje'}</h1>
          <p>
            {'Descubra experiências nos nossos espaços pelo Rio Grande do Sul.'}
          </p>
        </div>
        <button
          className="secondary-button"
          disabled={loading}
          onClick={() => {
            setLoading(true)
            setReload((n) => n + 1)
          }}
        >
          <UiIcon name="refresh" />
          {'Atualizar'}
        </button>
      </header>
      {error && (
        <p role="alert" className="notice-error">
          {error}
        </p>
      )}
      <section className="unit-overview surface-card">
        <div>
          <span className="eyebrow">ÓRBITA · RIO GRANDE DO SUL</span>
          <h2>{catalog?.unit.name ?? 'Encontre seu espaço'}</h2>
          <p>
            {catalog
              ? `${catalog.unit.neighborhood} · ${catalog.unit.city}, RS`
              : '—'}
          </p>
        </div>
        <label>
          {'Escolha uma unidade'}
          <select
            value={unitId || catalog?.unit.id || ''}
            onChange={(event) => {
              setLoading(true)
              setCatalog(null)
              setUnitId(event.target.value)
            }}
            disabled={!catalog && !unitId}
            aria-label={'Escolha uma unidade'}
          >
            {catalog?.units.map((unit) => (
              <option key={unit.id} value={unit.id}>
                {unit.name} · {unit.city}
              </option>
            ))}
          </select>
        </label>
      </section>
      {catalog?.plan.code === 'basic' && (
        <section className="premium-invite">
          <span className="premium-emblem">
            <UiIcon name="crown" />
          </span>
          <div>
            <span className="eyebrow">ÓRBITA PREMIUM</span>
            <h2>{'Abra espaço para mais possibilidades.'}</h2>
            <p>
              {
                'Desbloqueie estúdios e salas exclusivas. A mudança de plano é aprovada pelo administrador.'
              }
            </p>
          </div>
          <Link className="primary-button" href="/member/subscription">
            {'Conhecer Premium'}
            <span aria-hidden="true">↗</span>
          </Link>
        </section>
      )}
      <section>
        <div className="catalog-section-heading">
          <div>
            <h2>{'Todas as experiências da unidade'}</h2>
            <p>{'Disponíveis agora e experiências Premium em destaque.'}</p>
          </div>
          <span className="quiet-badge">
            {catalog?.services.length ?? 0} {'serviços'}
          </span>
        </div>
        {loading && (
          <div role="status">
            <span className="sr-only">{'Atualizando catálogo…'}</span>
            <Skeleton className="sk-refresh-line" />
          </div>
        )}
        <div className="catalog-grid">
          {catalog?.services.map((service) => (
            <Link
              href={`/member/services/${service.id}`}
              key={service.id}
              className={`catalog-card ${service.premium ? 'catalog-premium' : ''} ${service.available_now ? 'catalog-available' : ''}`}
            >
              <div
                className={`catalog-art art-${service.category === 'Gastronomia' ? 'food' : service.category === 'Mobilidade' ? 'mobility' : service.premium ? 'premium' : 'work'}`}
              >
                {service.image_url ? (
                  <img
                    src={service.image_url}
                    alt={service.image_alt}
                    loading="lazy"
                    decoding="async"
                  />
                ) : (
                  <>
                    <span className="catalog-art-orbit" />
                    <UiIcon
                      name={
                        service.premium
                          ? 'crown'
                          : service.category === 'Mobilidade'
                            ? 'services'
                            : service.category === 'Gastronomia'
                              ? 'partners'
                              : 'orders'
                      }
                    />
                  </>
                )}
                <div className="catalog-card-badges">
                  {service.premium && (
                    <span className="premium-badge">
                      <UiIcon name="crown" />
                      Premium
                    </span>
                  )}
                  {service.available_now && (
                    <span className="now-badge">
                      <i />
                      {'Disponível agora'}
                    </span>
                  )}
                </div>
                {service.locked && (
                  <span
                    className="catalog-lock"
                    aria-label={'Serviço Premium bloqueado'}
                  >
                    <UiIcon name="lock" />
                  </span>
                )}
              </div>
              <div className="catalog-card-body">
                <span className="eyebrow">{service.category}</span>
                <h3>{service.name}</h3>
                <p>{service.description_pt}</p>
                <div className="service-hours">
                  <UiIcon name="clock" />
                  {service.schedules.length
                    ? service.schedules
                        .map((s) => `${s.start}–${s.end}`)
                        .join(' · ')
                    : 'A qualquer hora'}
                </div>
                <div className="catalog-card-bottom">
                  <strong>{currency(service.price_cents)}</strong>
                  <span>
                    {service.locked
                      ? 'Desbloquear'
                      : service.available_now
                        ? 'Conhecer'
                        : 'Ver horários'}{' '}
                    {service.locked ? (
                      <UiIcon name="lock" />
                    ) : (
                      <span aria-hidden="true">↗</span>
                    )}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
        {catalog?.services.length === 0 && (
          <div className="surface-card member-empty">
            <h3>{'Novas experiências em breve.'}</h3>
          </div>
        )}
      </section>
      {catalog && (
        <p className="catalog-updated">
          {'Horário local'} ·{' '}
          {new Date(catalog.generated_at).toLocaleTimeString('pt-BR', {
            timeZone: catalog.unit.timezone,
            hour: '2-digit',
            minute: '2-digit',
          })}{' '}
          · {'Atualização automática a cada 30 segundos.'}
        </p>
      )}
    </div>
  )
}
