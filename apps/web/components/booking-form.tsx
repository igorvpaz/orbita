'use client'
import { useLanguage } from '@/components/language-provider'
import { useEffect, useRef, useState } from 'react'
import { apiRequest } from './api-client'
import { Skeleton } from './loading-skeleton'
type Slot = {
  starts_at: string
  ends_at: string
  capacity: number
  remaining: number
}
export function BookingForm({ serviceId }: { serviceId: string }) {
  const { t, locale } = useLanguage()
  const today = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date())
  const [date, setDate] = useState(today),
    [slots, setSlots] = useState<Slot[] | null>(null),
    [selected, setSelected] = useState(''),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(''),
    [message, setMessage] = useState(''),
    [refresh, setRefresh] = useState(0)
  const key = useRef<{
    slot: string
    id: string
  } | null>(null)
  useEffect(() => {
    let active = true
    const load = () =>
      void apiRequest<{
        slots: Slot[]
      }>(`/api/services/${serviceId}/slots?date=${date}`)
        .then((d) => {
          if (active) setSlots(d.slots)
        })
        .catch((e) => {
          if (active) setError(e.message)
        })
    load()
    const timer = setInterval(load, 30000)
    return () => {
      active = false
      clearInterval(timer)
    }
  }, [serviceId, date, refresh])
  const current = slots?.find((s) => s.starts_at === selected)
  const time = (value: string) =>
    new Date(value).toLocaleTimeString(locale, {
      timeZone: 'America/Sao_Paulo',
      hour: '2-digit',
      minute: '2-digit',
    })
  return (
    <section className="booking-form">
      <header>
        <span className="eyebrow">{t('SUA PRÓXIMA EXPERIÊNCIA')}</span>
        <h2>{t('Escolha seu horário')}</h2>
        <p>
          {t('Uma pessoa por pedido. Horários no fuso da unidade (Brasília).')}
        </p>
      </header>
      <label>
        {t('Data da reserva')}
        <input
          type="date"
          min={today}
          max={new Date(Date.parse(today) + 30 * 86400000)
            .toISOString()
            .slice(0, 10)}
          value={date}
          disabled={busy}
          onChange={(e) => {
            setSlots(null)
            setError('')
            setDate(e.target.value)
            setSelected('')
            setMessage('')
          }}
        />
      </label>
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
      {!slots && !error && <Skeleton className="sk-detail-art" />}
      <div
        className="booking-slots"
        role="group"
        aria-label={t('Horários disponíveis')}
      >
        {slots?.map((s) => (
          <button
            key={s.starts_at}
            type="button"
            disabled={busy || s.remaining === 0}
            aria-pressed={selected === s.starts_at}
            className={`booking-slot ${selected === s.starts_at ? 'is-selected' : ''}`}
            onClick={() => setSelected(s.starts_at)}
          >
            <strong>
              {time(s.starts_at)} — {time(s.ends_at)}
            </strong>
            <span>
              {s.remaining === 0
                ? t('Esgotado')
                : `${s.remaining} / ${s.capacity}`}{' '}
              {s.remaining > 0 && 'vagas disponíveis'}
            </span>
          </button>
        ))}
      </div>
      {slots?.length === 0 && (
        <p className="upgrade-pending">
          {t(
            'Nenhum horário disponível nesta data. Escolha outro dia ou confira a validade da assinatura.',
          )}
        </p>
      )}
      <button
        className="primary-button"
        disabled={busy || !current || current.remaining === 0}
        onClick={async () => {
          if (!current) return
          setBusy(true)
          setError('')
          setMessage('')
          if (key.current?.slot !== selected)
            key.current = { slot: selected, id: crypto.randomUUID() }
          try {
            await apiRequest('/api/orders', 'POST', {
              serviceId,
              scheduledStart: selected,
              idempotencyKey: key.current.id,
            })
            setMessage(
              'Reserva solicitada! Acompanhe a confirmação em Meus pedidos.',
            )
            setSelected('')
            key.current = null
            setRefresh((v) => v + 1)
          } catch (e) {
            setError(e instanceof Error ? e.message : 'Falha ao reservar')
          } finally {
            setBusy(false)
          }
        }}
      >
        {t('Reservar horário')}
      </button>
    </section>
  )
}
