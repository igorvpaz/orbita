/* eslint-disable @next/next/no-img-element -- Signed private images expire quickly and bypass image optimization cache. */
'use client'
import Link from 'next/link'
import { ContentSkeleton } from '@/components/loading-skeleton'
import { useEffect, useState } from 'react'
import { apiRequest } from '@/components/api-client'
import { PremiumUpgrade } from '@/components/premium-upgrade'
import { UiIcon } from '@/components/ui-icon'
import type { CatalogService } from '@/components/member-catalog'
export function ServiceDetail({ id }: { id: string }) {
  const [service, setService] = useState<CatalogService | null>(null)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)
  useEffect(() => {
    void apiRequest<{
      service: CatalogService
    }>(`/api/services/${id}`)
      .then(({ service }) => {
        setService(service)
        const key = `view:${id}:${new Date().toISOString().slice(0, 10)}`
        let eventId = sessionStorage.getItem(key)
        if (!eventId) {
          eventId = crypto.randomUUID()
          sessionStorage.setItem(key, eventId)
        }
        void apiRequest('/api/events', 'POST', {
          serviceId: id,
          type: 'view',
          idempotencyKey: eventId,
        }).catch(() => {})
      })
      .catch((cause) => setError(cause.message))
  }, [id])
  useEffect(() => {
    const timer = setInterval(() => {
      void apiRequest<{
        service: CatalogService
      }>(`/api/services/${id}`)
        .then((data) => setService(data.service))
        .catch(() => {})
    }, 30000)
    return () => clearInterval(timer)
  }, [id])
  async function action(type: 'interest' | 'order') {
    setBusy(true)
    setError('')
    setMessage('')
    try {
      const key = crypto.randomUUID()
      if (type === 'interest')
        await apiRequest('/api/events', 'POST', {
          serviceId: id,
          type: 'interest',
          idempotencyKey: key,
        })
      else
        await apiRequest('/api/orders', 'POST', {
          serviceId: id,
          idempotencyKey: key,
        })
      setMessage(
        type === 'interest'
          ? 'Interesse registrado.'
          : 'Solicitação enviada. A equipe fará a confirmação.',
      )
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Falha na operação')
    } finally {
      setBusy(false)
    }
  }
  const currency = (value: number) =>
    new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value / 100)
  return (
    <div className="admin-workspace service-detail">
      <Link
        href={service ? `/member?unitId=${service.unit_id}` : '/member'}
        className="inline-block text-sm text-[#937728]"
      >
        ← {'Voltar'}
      </Link>
      {error && (
        <p role="alert" className="rounded-xl bg-[#fff0ed] p-4 text-[#a54a35]">
          {error}
        </p>
      )}
      {message && (
        <p role="status" className="rounded-xl bg-[#edf5e8] p-4 text-[#4d713b]">
          {message}
        </p>
      )}
      {!service && !error && <ContentSkeleton variant="detail" />}
      {service && (
        <article className="overflow-hidden rounded-3xl border border-[#e7e7df] bg-white">
          <div className="flex h-64 items-center justify-center bg-[#f2efdf] sm:h-80">
            {service.image_url ? (
              <img
                src={service.image_url}
                alt={service.image_alt}
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-6xl text-[#937728]">✦</span>
            )}
          </div>
          <div className="space-y-5 p-6 sm:p-8">
            <p className="text-xs uppercase tracking-wider text-[#937728]">
              {service.partner_name} · {service.category}
            </p>
            <h1 className="text-3xl font-bold">{service.name}</h1>
            <p className="text-[#77796d]">{service.description_pt}</p>
            <p className="text-2xl font-bold">
              {currency(service.price_cents)}
            </p>
            <p className="text-xs text-[#8f9483]">
              {
                'Solicitação sem cobrança online. O valor será confirmado pela equipe.'
              }
            </p>
            <p className="service-hours">
              <UiIcon name="clock" />
              {service.schedules.length
                ? service.schedules
                    .map((s) => `${s.start}–${s.end}`)
                    .join(' · ')
                : 'A qualquer hora'}{' '}
              · {service.unit_name}
            </p>
            {service.locked ? (
              <PremiumUpgrade />
            ) : (
              <>
                <p
                  className={
                    service.available_now ? 'notice-success' : 'upgrade-pending'
                  }
                >
                  {service.available_now
                    ? 'Disponível agora'
                    : 'Volte no horário de atendimento para solicitar esta experiência.'}
                </p>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <button
                    disabled={busy || !service.can_order}
                    onClick={() => void action('interest')}
                    className="rounded-xl border border-[#cfb14b] px-6 py-3 font-semibold text-[#937728] disabled:opacity-50"
                  >
                    {'Tenho interesse'}
                  </button>
                  <button
                    disabled={busy || !service.can_order}
                    onClick={() => void action('order')}
                    className="rounded-xl bg-[#f4cc4e] px-6 py-3 font-semibold text-[#303027] disabled:opacity-50"
                  >
                    {'Solicitar contratação'}
                  </button>
                </div>
              </>
            )}
          </div>
        </article>
      )}
    </div>
  )
}
