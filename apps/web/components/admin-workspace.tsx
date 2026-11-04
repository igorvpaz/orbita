/* eslint-disable @next/next/no-img-element -- Local and signed service media. */
'use client'
import { useLanguage } from '@/components/language-provider'
import { useCallback, useEffect, useState } from 'react'
import { PageSkeleton, Skeleton } from '@/components/loading-skeleton'
import { apiRequest } from '@/components/api-client'
import { UiIcon } from '@/components/ui-icon'
import { statusLabel } from '@/lib/status-label'
type Unit = {
  id: string
  name: string
}
type Plan = {
  id: string
  name: string
  code: string
}
type Partner = {
  id: string
  name: string
  unit_id: string
  status: string
  description: string
  terms: {
    commission_percent: number | null
    fixed_fee_cents: number | null
    contact_email: string | null
  }[]
}
type Service = {
  id: string
  name: string
  unit_id: string
  partner_id: string
  status: string
  price_cents: number
  capacity_per_slot: number
  slot_duration_minutes: number
  access_plan: 'basic' | 'premium'
  category: string
  description_pt: string
  media: {
    image_url: string | null
  }[]
  rules: {
    plan_id: string | null
    weekdays: number[]
    start_time: string
    end_time: string
    priority: number
    enabled: boolean
  }[]
}
type Member = {
  id: string
  email: string
  full_name: string
  unit_id: string
  unit_name: string
  created_at: string
  plan_name: string
  membership: {
    plan_id: string
    status: 'active' | 'inactive'
    starts_at: string
    expires_at: string | null
  } | null
}
type Order = {
  scheduled_start?: string | null
  scheduled_end?: string | null
  id: string
  service_id: string
  service_name: string
  member_name?: string | null
  status: string
  total_cents: number
  created_at: string
  member_id: string
}
type Metrics = {
  days: number
  views: number
  interests: number
  orders_requested: number
  orders_confirmed: number
  nominal_confirmed_cents: number
  latest_orders: Order[]
}
const field =
  'w-full rounded-xl border border-[#dcdcd6] bg-[#f4f4f2] px-3 py-3 text-[#292925] focus:border-[#c2a53d] focus:outline-none'
const button =
  'rounded-xl bg-[#f4cc4e] px-5 py-3 font-semibold text-[#262622] disabled:opacity-50'
export function AdminWorkspace({
  section,
}: {
  section: 'dashboard' | 'partners' | 'services' | 'members' | 'orders'
}) {
  const { t, locale } = useLanguage()
  const money = (cents: number) =>
    new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: 'BRL',
    }).format(cents / 100)

  const [units, setUnits] = useState<Unit[]>([])
  const [plans, setPlans] = useState<Plan[]>([])
  const [partners, setPartners] = useState<Partner[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [serviceUnitId, setServiceUnitId] = useState('')
  const [members, setMembers] = useState<Member[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [metrics, setMetrics] = useState<Metrics | null>(null)
  const [days, setDays] = useState(30)
  const [busy, setBusy] = useState(false)
  const [loading, setLoading] = useState(true)
  const [loaded, setLoaded] = useState<typeof section | null>(null)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [memberSearch, setMemberSearch] = useState('')
  const load = useCallback(async () => {
    setLoading(true)
    try {
      setError('')
      if (section === 'dashboard')
        setMetrics(await apiRequest<Metrics>(`/api/analytics?days=${days}`))
      if (
        section === 'partners' ||
        section === 'services' ||
        section === 'members'
      ) {
        const ref = await apiRequest<{
          units: Unit[]
          plans: Plan[]
        }>('/api/admin/reference')
        setUnits(ref.units)
        setPlans(ref.plans)
      }
      if (section === 'partners' || section === 'services')
        setPartners(
          (
            await apiRequest<{
              partners: Partner[]
            }>('/api/partners')
          ).partners,
        )
      if (section === 'services')
        setServices(
          (
            await apiRequest<{
              services: Service[]
            }>('/api/admin/services')
          ).services,
        )
      if (section === 'members') {
        setMembers(
          (
            await apiRequest<{
              members: Member[]
            }>('/api/admin/members')
          ).members,
        )
      }
      if (section === 'orders')
        setOrders(
          (
            await apiRequest<{
              orders: Order[]
            }>('/api/orders')
          ).orders,
        )
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Falha ao carregar')
    } finally {
      setLoading(false)
      setLoaded(section)
    }
  }, [section, days])
  useEffect(() => {
    const timer = setTimeout(() => {
      void load()
    }, 0)
    return () => clearTimeout(timer)
  }, [load])
  async function act(
    operation: () => Promise<unknown>,
    success = 'Salvo com sucesso',
  ) {
    setBusy(true)
    setError('')
    setMessage('')
    try {
      await operation()
      setMessage(success)
      await load()
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Falha ao salvar')
    } finally {
      setBusy(false)
    }
  }
  const title = {
    dashboard: 'Visão geral',
    partners: 'Parceiros',
    services: 'Serviços',
    members: 'Gestão de membros',
    orders: 'Pedidos',
  }[section]
  if (loaded !== section)
    return (
      <PageSkeleton
        title={t(title)}
        variant={
          section === 'dashboard'
            ? 'dashboard'
            : section === 'orders'
              ? 'table'
              : 'form'
        }
      />
    )
  return (
    <div className="admin-workspace" aria-busy={loading}>
      <header className="workspace-heading">
        <div>
          <h1>{t(title)}</h1>
          <p>
            {section === 'members'
              ? t('Cadastre membros, gerencie acessos e acompanhe assinaturas.')
              : t('Tudo o que seu coworking precisa, em um só lugar.')}
          </p>
        </div>
        {section === 'members' ? (
          <div className="member-stats" aria-label={t('Resumo dos membros')}>
            <div>
              <strong>{members.length}</strong>
              <span>{t('membros')}</span>
            </div>
            <div className="stat-highlight">
              <strong>
                {
                  members.filter((m) => m.membership?.status === 'active')
                    .length
                }
              </strong>
              <span>{t('ativos')}</span>
            </div>
            <div>
              <strong>
                {
                  members.filter((m) => m.membership?.status !== 'active')
                    .length
                }
              </strong>
              <span>{t('inativos')}</span>
            </div>
          </div>
        ) : (
          <button onClick={() => void load()} className="secondary-button">
            <UiIcon name="refresh" />
            {t('Atualizar')}
          </button>
        )}
      </header>
      {loading && (
        <div role="status">
          <span className="sr-only">{t('Atualizando conteúdo…')}</span>
          <Skeleton className="sk-refresh-line" />
        </div>
      )}
      {message && (
        <p role="status" className="rounded-xl bg-[#edf6ee] p-4 text-[#35643d]">
          {t(message)}
        </p>
      )}
      {error && (
        <p role="alert" className="rounded-xl bg-[#fff0ee] p-4 text-[#a43e32]">
          {t(error, 'Falha na operação')}
        </p>
      )}

      {section === 'dashboard' && (
        <>
          <div className="flex gap-2">
            {[7, 30].map((value) => (
              <button
                key={value}
                onClick={() => setDays(value)}
                className={`rounded-full px-4 py-2 text-sm ${days === value ? 'bg-[#f4cc4e] text-[#262622]' : 'border border-[#dcdcd6]'}`}
              >
                {value}
                {t('dias')}
              </button>
            ))}
          </div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            {[
              ['Visualizações', metrics?.views ?? 0],
              ['Interesses', metrics?.interests ?? 0],
              ['Solicitações', metrics?.orders_requested ?? 0],
              ['Confirmadas', metrics?.orders_confirmed ?? 0],
              [
                'Valor confirmado',
                money(metrics?.nominal_confirmed_cents ?? 0),
              ],
            ].map(([label, value]) => (
              <div
                key={label}
                className="rounded-2xl border border-[#e7e7e2] bg-white p-5"
              >
                <p className="text-sm text-[#73736d]">{t(label)}</p>
                <p className="mt-3 text-2xl font-bold">{value}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-[#878780]">
            {t(
              'Valor nominal contratado, não pagamento recebido. Visualizações = eventos registrados.',
            )}
          </p>
          <h2 className="text-xl font-semibold">{t('Pedidos recentes')}</h2>
          <OrderList orders={metrics?.latest_orders ?? []} />
        </>
      )}

      {section === 'partners' && (
        <>
          <section className="rounded-2xl border border-[#e7e7e2] bg-white p-5">
            <h2 className="mb-5 text-xl font-semibold">{t('Novo parceiro')}</h2>
            <form
              className="grid gap-4 sm:grid-cols-2"
              onSubmit={(event) => {
                event.preventDefault()
                const form = event.currentTarget
                const data = new FormData(form)
                void act(async () => {
                  await apiRequest('/api/partners', 'POST', {
                    unitId: data.get('unitId'),
                    name: data.get('name'),
                    description: data.get('description'),
                    contactEmail: data.get('contactEmail'),
                    commissionPercent: data.get('commissionPercent')
                      ? Number(data.get('commissionPercent'))
                      : null,
                    fixedFeeCents: data.get('fixedFeeCents')
                      ? Math.round(Number(data.get('fixedFeeCents')) * 100)
                      : null,
                    notes: data.get('notes'),
                    validFrom: data.get('validFrom'),
                    validUntil: data.get('validUntil') || null,
                  })
                  form.reset()
                }, 'Parceiro cadastrado')
              }}
            >
              <label>
                {t('Unidade')}
                <select name="unitId" required className={field}>
                  {units.map((unit) => (
                    <option key={unit.id} value={unit.id}>
                      {unit.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                {t('Nome')}
                <input name="name" required minLength={2} className={field} />
              </label>
              <label className="sm:col-span-2">
                {t('Descrição')}
                <textarea name="description" className={field} rows={2} />
              </label>
              <label>
                {t('E-mail de contato')}
                <input name="contactEmail" type="email" className={field} />
              </label>
              <label>
                {t('Comissão (%)')}
                <input
                  name="commissionPercent"
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  className={field}
                />
              </label>
              <label>
                {t('Taxa fixa (R$)')}
                <input
                  name="fixedFeeCents"
                  type="number"
                  min="0"
                  step="0.01"
                  className={field}
                />
              </label>
              <label>
                {t('Válido desde')}
                <input
                  name="validFrom"
                  type="date"
                  required
                  defaultValue={new Date().toISOString().slice(0, 10)}
                  className={field}
                />
              </label>
              <label>
                {t('Válido até')}
                <input name="validUntil" type="date" className={field} />
              </label>
              <label className="sm:col-span-2">
                {t('Observações comerciais')}
                <textarea name="notes" rows={2} className={field} />
              </label>
              <button disabled={busy || !units.length} className={button}>
                {t('Cadastrar parceiro')}
              </button>
            </form>
          </section>
          <section className="space-y-3">
            <h2 className="text-xl font-semibold">
              {t('Parceiros cadastrados')}
            </h2>
            {partners.map((partner) => (
              <div
                key={partner.id}
                className="rounded-2xl border border-[#e7e7e2] bg-white p-5"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="font-semibold">{partner.name}</h3>
                    <p className="text-sm text-[#73736d]">
                      {partner.description || 'Sem descrição'} ·{' '}
                      {t(statusLabel(partner.status))}
                    </p>
                    <p className="text-xs text-[#878780]">
                      {t('Comissão:')}
                      {partner.terms[0]?.commission_percent ?? '—'}
                      {t('% · Taxa:')}{' '}
                      {partner.terms[0]?.fixed_fee_cents == null
                        ? '—'
                        : money(partner.terms[0].fixed_fee_cents)}
                    </p>
                  </div>
                  <button
                    disabled={busy}
                    onClick={() =>
                      void act(() =>
                        apiRequest(`/api/partners/${partner.id}`, 'PATCH', {
                          status:
                            partner.status === 'active' ? 'inactive' : 'active',
                        }),
                      )
                    }
                    className="rounded-xl border border-[#dcdcd6] px-4 py-2 text-sm"
                  >
                    {partner.status === 'active' ? t('Inativar') : t('Ativar')}
                  </button>
                </div>
                <details className="mt-4 text-sm">
                  <summary className="cursor-pointer text-[#857027]">
                    {t('Editar dados e condições')}
                  </summary>
                  <form
                    className="mt-4 grid gap-3 sm:grid-cols-2"
                    onSubmit={(event) => {
                      event.preventDefault()
                      const d = new FormData(event.currentTarget)
                      void act(() =>
                        apiRequest(`/api/partners/${partner.id}`, 'PATCH', {
                          name: d.get('name'),
                          description: d.get('description'),
                          terms: {
                            contactEmail: d.get('contactEmail'),
                            commissionPercent: d.get('commissionPercent')
                              ? Number(d.get('commissionPercent'))
                              : null,
                            fixedFeeCents: d.get('fixedFeeCents')
                              ? Math.round(Number(d.get('fixedFeeCents')) * 100)
                              : null,
                            notes: String(d.get('notes') ?? ''),
                            validFrom: d.get('validFrom'),
                            validUntil: d.get('validUntil') || null,
                          },
                        }),
                      )
                    }}
                  >
                    <input
                      name="name"
                      defaultValue={partner.name}
                      className={field}
                      required
                    />
                    <input
                      name="contactEmail"
                      type="email"
                      defaultValue={partner.terms[0]?.contact_email ?? ''}
                      className={field}
                    />
                    <textarea
                      name="description"
                      defaultValue={partner.description}
                      className={field}
                    />
                    <input
                      name="commissionPercent"
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      defaultValue={partner.terms[0]?.commission_percent ?? ''}
                      className={field}
                    />
                    <input
                      name="fixedFeeCents"
                      type="number"
                      step="0.01"
                      min="0"
                      defaultValue={
                        partner.terms[0]?.fixed_fee_cents != null
                          ? partner.terms[0].fixed_fee_cents / 100
                          : ''
                      }
                      className={field}
                    />
                    <input
                      name="validFrom"
                      type="date"
                      required
                      defaultValue={new Date().toISOString().slice(0, 10)}
                      className={field}
                    />
                    <input name="validUntil" type="date" className={field} />
                    <textarea
                      name="notes"
                      placeholder={t('Observações')}
                      className={field}
                    />
                    <button disabled={busy} className={button}>
                      {t('Salvar alterações')}
                    </button>
                  </form>
                </details>
              </div>
            ))}
            {partners.length === 0 && (
              <p className="text-[#878780]">
                {t('Nenhum parceiro cadastrado.')}
              </p>
            )}
          </section>
        </>
      )}

      {section === 'services' && (
        <>
          <section className="rounded-2xl border border-[#e7e7e2] bg-white p-5">
            <h2 className="mb-5 text-xl font-semibold">{t('Novo serviço')}</h2>
            <form
              className="grid gap-4 sm:grid-cols-2"
              onSubmit={(event) => {
                event.preventDefault()
                const form = event.currentTarget
                const d = new FormData(form)
                void act(async () => {
                  const weekdays = String(d.get('weekdays') ?? '')
                    .split(',')
                    .map((x) => Number(x.trim()))
                    .filter((x) => Number.isInteger(x) && x >= 0 && x <= 6)
                  const rules = weekdays.length
                    ? [
                        {
                          planId: d.get('planId') || null,
                          weekdays,
                          startTime: d.get('startTime'),
                          endTime: d.get('endTime'),
                          priority: Number(d.get('priority') ?? 0),
                        },
                      ]
                    : []
                  const created = await apiRequest<{
                    id: string
                  }>('/api/admin/services', 'POST', {
                    unitId: d.get('unitId'),
                    partnerId: d.get('partnerId'),
                    name: d.get('name'),
                    descriptionPt: d.get('descriptionPt'),
                    capacityPerSlot: Number(d.get('capacityPerSlot')),
                    slotDurationMinutes: Number(d.get('slotDurationMinutes')),
                    category: d.get('category'),
                    priceCents: Math.round(Number(d.get('price')) * 100),
                    accessPlan: d.get('accessPlan'),
                    status: d.get('status'),
                    rules,
                  })
                  const photo = d.get('photo')
                  if (photo instanceof File && photo.size) {
                    const upload = new FormData()
                    upload.set('file', photo)
                    upload.set('altPt', String(d.get('altPt') || d.get('name')))
                    const result = await fetch(
                      `/api/admin/services/${created.id}/media`,
                      { method: 'POST', body: upload },
                    )
                    if (!result.ok)
                      throw new Error(
                        'Serviço criado, mas a foto falhou. Edite o serviço.',
                      )
                  }
                  form.reset()
                }, 'Serviço cadastrado')
              }}
            >
              <label>
                {t('Unidade')}
                <select
                  name="unitId"
                  className={field}
                  required
                  value={serviceUnitId || units[0]?.id || ''}
                  onChange={(event) => setServiceUnitId(event.target.value)}
                >
                  {units.map((unit) => (
                    <option key={unit.id} value={unit.id}>
                      {unit.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                {t('Parceiro')}
                <select name="partnerId" className={field} required>
                  {partners
                    .filter(
                      (p) =>
                        p.status === 'active' &&
                        p.unit_id === (serviceUnitId || units[0]?.id),
                    )
                    .map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                </select>
              </label>
              <label>
                {t('Nome')}
                <input name="name" className={field} required minLength={2} />
              </label>
              <label>
                {t('Categoria')}
                <input name="category" className={field} required />
              </label>
              <label>
                {t('Preço (R$)')}
                <input
                  name="price"
                  type="number"
                  min="0"
                  step="0.01"
                  className={field}
                  required
                />
              </label>
              <label>
                {t('Capacidade por horário')}
                <input
                  name="capacityPerSlot"
                  type="number"
                  min="1"
                  max="500"
                  defaultValue={10}
                  required
                  className={field}
                />
              </label>
              <label>
                {t('Duração do horário (minutos)')}
                <select
                  name="slotDurationMinutes"
                  defaultValue={60}
                  className={field}
                >
                  {[15, 30, 45, 60, 90, 120, 180, 240].map((n) => (
                    <option key={n} value={n}>
                      {n}
                      {t(' min')}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                {t('Status')}
                <select name="status" className={field}>
                  <option value="draft">{t('Rascunho')}</option>
                  <option value="published">{t('Publicado')}</option>
                </select>
              </label>
              <label className="sm:col-span-2">
                {t('Descrição em português')}
                <textarea
                  name="descriptionPt"
                  minLength={10}
                  rows={3}
                  required
                  className={field}
                />
              </label>
              <label>
                {t('Foto (JPG, PNG ou WebP, até 5 MB)')}
                <input
                  name="photo"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className={field}
                />
              </label>
              <label>
                {t('Texto alternativo da foto')}
                <input name="altPt" className={field} />
              </label>
              <div className="sm:col-span-2 rounded-xl border border-[#deded8] p-4">
                <p className="mb-3 text-sm font-semibold">
                  {t('Disponibilidade opcional · 0=domingo, 6=sábado')}
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <label>
                    {t('Dias separados por vírgula')}
                    <input
                      name="weekdays"
                      placeholder="1,2,3,4,5"
                      className={field}
                    />
                  </label>
                  <label>
                    {t('Plano')}
                    <select name="planId" className={field}>
                      <option value="">{t('Todos')}</option>
                      {plans.map((plan) => (
                        <option key={plan.id} value={plan.id}>
                          {t(plan.name)}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    {t('Início')}
                    <input
                      name="startTime"
                      type="time"
                      defaultValue="08:00"
                      className={field}
                    />
                  </label>
                  <label>
                    {t('Fim')}
                    <input
                      name="endTime"
                      type="time"
                      defaultValue="18:00"
                      className={field}
                    />
                  </label>
                  <label>
                    {t('Prioridade')}
                    <input
                      name="priority"
                      type="number"
                      defaultValue="0"
                      className={field}
                    />
                  </label>
                </div>
              </div>
              <label>
                {t('Acesso por plano')}
                <select name="accessPlan" className={field}>
                  <option value="basic">{t('Básico e Premium')}</option>
                  <option value="premium">{t('Exclusivo Premium')}</option>
                </select>
              </label>
              <button disabled={busy || !partners.length} className={button}>
                {t('Cadastrar serviço')}
              </button>
            </form>
          </section>
          <section className="space-y-3">
            <h2 className="text-xl font-semibold">{t('Catálogo')}</h2>
            {services.map((service) => (
              <div
                key={service.id}
                className="flex flex-wrap items-center gap-4 rounded-2xl border border-[#e7e7e2] bg-white p-4"
              >
                {service.media[0]?.image_url && (
                  <img
                    src={service.media[0].image_url}
                    alt={`${service.name} — foto do serviço`}
                    loading="lazy"
                    decoding="async"
                    className="h-20 w-24 rounded-xl object-cover"
                  />
                )}
                <div className="min-w-40 flex-1">
                  <h3 className="font-semibold">{t(service.name)}</h3>
                  <p className="text-sm text-[#73736d]">
                    {t(service.category)} · {money(service.price_cents)} ·{' '}
                    {t(statusLabel(service.status))} ·{' '}
                    {units.find((unit) => unit.id === service.unit_id)?.name}
                    {service.access_plan === 'premium' && (
                      <span className="premium-badge">{t('Premium')}</span>
                    )}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(['draft', 'published', 'archived'] as const)
                    .filter((status) => status !== service.status)
                    .map((status) => (
                      <button
                        key={status}
                        disabled={busy}
                        onClick={() =>
                          void act(() =>
                            apiRequest(
                              `/api/admin/services/${service.id}`,
                              'PATCH',
                              { status },
                            ),
                          )
                        }
                        className="rounded-xl border border-[#dcdcd6] px-3 py-2 text-xs"
                      >
                        {status === 'published'
                          ? t('Publicar')
                          : status === 'archived'
                            ? t('Arquivar')
                            : t('Rascunho')}
                      </button>
                    ))}
                </div>
                <details className="w-full text-sm">
                  <summary className="cursor-pointer text-[#857027]">
                    {t('Editar serviço / adicionar foto')}
                  </summary>
                  <form
                    className="mt-3 grid gap-3 sm:grid-cols-3"
                    onSubmit={(event) => {
                      event.preventDefault()
                      const d = new FormData(event.currentTarget)
                      void act(() =>
                        apiRequest(
                          `/api/admin/services/${service.id}`,
                          'PATCH',
                          {
                            name: d.get('name'),
                            priceCents: Math.round(
                              Number(d.get('price')) * 100,
                            ),
                            descriptionPt: d.get('descriptionPt'),
                            capacityPerSlot: Number(d.get('capacityPerSlot')),
                            slotDurationMinutes: Number(
                              d.get('slotDurationMinutes'),
                            ),
                            accessPlan: d.get('accessPlan'),
                          },
                        ),
                      )
                    }}
                  >
                    <input
                      name="name"
                      defaultValue={service.name}
                      className={field}
                      required
                    />
                    <input
                      name="price"
                      type="number"
                      step="0.01"
                      min="0"
                      defaultValue={service.price_cents / 100}
                      className={field}
                      required
                    />
                    <textarea
                      name="descriptionPt"
                      defaultValue={service.description_pt}
                      minLength={10}
                      className={field}
                      required
                    />
                    <label>
                      {t('Capacidade por horário')}
                      <input
                        name="capacityPerSlot"
                        type="number"
                        min="1"
                        max="500"
                        defaultValue={service.capacity_per_slot}
                        required
                        className={field}
                      />
                    </label>
                    <label>
                      {t('Duração do horário (minutos)')}
                      <select
                        name="slotDurationMinutes"
                        defaultValue={service.slot_duration_minutes}
                        className={field}
                      >
                        {[15, 30, 45, 60, 90, 120, 180, 240].map((n) => (
                          <option key={n} value={n}>
                            {n}
                            {t(' min')}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label>
                      {t('Acesso por plano')}
                      <select
                        name="accessPlan"
                        defaultValue={service.access_plan}
                        className={field}
                      >
                        <option value="basic">{t('Básico e Premium')}</option>
                        <option value="premium">
                          {t('Exclusivo Premium')}
                        </option>
                      </select>
                    </label>
                    <button disabled={busy} className={button}>
                      {t('Salvar')}
                    </button>
                  </form>
                  <form
                    className="mt-3 flex flex-wrap gap-3"
                    onSubmit={(event) => {
                      event.preventDefault()
                      const d = new FormData(event.currentTarget)
                      void act(async () => {
                        const response = await fetch(
                          `/api/admin/services/${service.id}/media`,
                          { method: 'POST', body: d },
                        )
                        if (!response.ok)
                          throw new Error(
                            (await response.json()).error ?? 'Falha na foto',
                          )
                      })
                    }}
                  >
                    <input
                      name="file"
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      required
                      className={field}
                    />
                    <input
                      name="altPt"
                      placeholder={t('Descrição da foto')}
                      required
                      className={field}
                    />
                    <button disabled={busy} className={button}>
                      {t('Enviar foto')}
                    </button>
                  </form>
                  <RuleEditor
                    service={service}
                    plans={plans}
                    busy={busy}
                    act={act}
                  />
                </details>
              </div>
            ))}
            {services.length === 0 && (
              <p className="text-[#878780]">
                {t('Nenhum serviço cadastrado.')}
              </p>
            )}
          </section>
        </>
      )}

      {section === 'members' && (
        <>
          <section
            className="surface-card member-create-card"
            aria-labelledby="create-member-title"
          >
            <div className="card-heading">
              <h2 id="create-member-title">{t('Cadastrar novo membro')}</h2>
              <span className="quiet-badge">{t('Acesso imediato')}</span>
            </div>
            <form
              className="member-create-form"
              onSubmit={(event) => {
                event.preventDefault()
                const form = event.currentTarget
                const d = new FormData(form)
                void act(async () => {
                  await apiRequest('/api/admin/members', 'POST', {
                    email: d.get('email'),
                    password: d.get('password'),
                    fullName: d.get('fullName'),
                    unitId: d.get('unitId'),
                    planId: d.get('planId'),
                    initialStatus: d.get('status'),
                    expiresAt: d.get('expiresAt')
                      ? new Date(
                          String(d.get('expiresAt')) + 'T23:59:59Z',
                        ).toISOString()
                      : null,
                  })
                  form.reset()
                }, 'Membro criado. Já pode entrar com o e-mail e a senha definidos.')
              }}
            >
              <label>
                {t('E-mail')}
                <input
                  name="email"
                  type="email"
                  required
                  placeholder={t('nome@exemplo.com')}
                  autoComplete="off"
                  className={field}
                />
              </label>
              <label>
                {t('Nome')}
                <input
                  name="fullName"
                  placeholder={t('Nome completo')}
                  required
                  minLength={2}
                  className={field}
                />
              </label>
              <label>
                {t('Senha inicial')}
                <input
                  name="password"
                  placeholder={t('Mínimo de 8 caracteres')}
                  type="password"
                  required
                  minLength={8}
                  maxLength={128}
                  autoComplete="new-password"
                  className={field}
                />
              </label>
              <label>
                {t('Unidade')}
                <select name="unitId" required className={field}>
                  {units.map((unit) => (
                    <option key={unit.id} value={unit.id}>
                      {unit.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                {t('Plano')}
                <select name="planId" required className={field}>
                  {plans.map((plan) => (
                    <option key={plan.id} value={plan.id}>
                      {t(plan.name)}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                {t('Status inicial')}
                <select name="status" className={field}>
                  <option value="active">{t('Ativa')}</option>
                  <option value="inactive">{t('Inativa')}</option>
                </select>
              </label>
              <label>
                {t('Expira em (opcional)')}
                <input name="expiresAt" type="date" className={field} />
              </label>
              <button
                disabled={busy || !units.length}
                className="primary-button member-submit"
              >
                <UiIcon name="plus" />
                {t('Criar membro')}
              </button>
            </form>
          </section>
          <section
            className="surface-card member-list-card"
            aria-labelledby="member-list-title"
          >
            <div className="member-list-toolbar">
              <h2 id="member-list-title">
                {t('Membros cadastrados')}{' '}
                <span className="count-badge">{members.length}</span>
              </h2>
              <div className="list-controls">
                <label className="search-field">
                  <UiIcon name="search" />
                  <input
                    aria-label={t('Buscar membros')}
                    placeholder={t('Buscar por nome ou e-mail')}
                    value={memberSearch}
                    onChange={(event) => setMemberSearch(event.target.value)}
                  />
                </label>
                <button
                  onClick={() => void load()}
                  disabled={loading}
                  aria-label={t('Atualizar membros')}
                  className="icon-button"
                >
                  <UiIcon name="refresh" />
                </button>
              </div>
            </div>
            <div className="table-scroll">
              <table
                className="members-table"
                aria-labelledby="member-list-title"
              >
                <thead>
                  <tr>
                    <th>{t('Membro')}</th>
                    <th>{t('Unidade')}</th>
                    <th>{t('Plano')}</th>
                    <th>{t('Status')}</th>
                    <th>{t('Cadastro')}</th>
                    <th>{t('Ações')}</th>
                  </tr>
                </thead>
                {members
                  .filter((member) =>
                    `${member.full_name} ${member.email}`
                      .toLocaleLowerCase(locale)
                      .includes(memberSearch.toLocaleLowerCase(locale)),
                  )
                  .map((member) => (
                    <MemberRow
                      key={`${member.id}-${member.email}-${member.membership?.status}-${member.membership?.plan_id}`}
                      member={member}
                      units={units}
                      plans={plans}
                      busy={busy}
                      act={act}
                    />
                  ))}
              </table>
            </div>
            {members.length === 0 ? (
              <div className="member-empty">
                <span>
                  <UiIcon name="members" />
                </span>
                <h3>{t('Seu próximo membro começa aqui.')}</h3>
                <p>
                  {t('Cadastre o primeiro membro no formulário acima.')}
                  <br />
                  {t('Ele já poderá entrar com o e-mail e a senha definidos.')}
                </p>
              </div>
            ) : members.filter((member) =>
                `${member.full_name} ${member.email}`
                  .toLocaleLowerCase('pt-BR')
                  .includes(memberSearch.toLocaleLowerCase('pt-BR')),
              ).length === 0 ? (
              <div className="member-empty">
                <h3>{t('Nenhum membro encontrado')}</h3>
                <p>{t('Tente buscar por outro nome ou e-mail.')}</p>
              </div>
            ) : (
              <div className="table-footer">
                {members.length}{' '}
                {members.length === 1
                  ? t('membro cadastrado')
                  : t('membros cadastrados')}
                <span>{t('Gerenciado por você. Pronto para ir além.')}</span>
              </div>
            )}
          </section>
        </>
      )}

      {section === 'orders' && (
        <OrderList
          orders={orders}
          onChange={(order, status) =>
            void act(
              () => apiRequest(`/api/orders/${order.id}`, 'PATCH', { status }),
              'Pedido atualizado',
            )
          }
          busy={busy}
        />
      )}
    </div>
  )
}
function MemberRow({
  member,
  units,
  plans,
  busy,
  act,
}: {
  member: Member
  units: Unit[]
  plans: Plan[]
  busy: boolean
  act: (operation: () => Promise<unknown>, success?: string) => Promise<void>
}) {
  const { t, locale } = useLanguage()
  const current = member.membership
  const [panel, setPanel] = useState<
    'details' | 'password' | 'subscription' | null
  >(null)
  const [planId, setPlanId] = useState(current?.plan_id ?? '')
  const [expires, setExpires] = useState(
    current?.expires_at?.slice(0, 10) ?? '',
  )
  const initials = member.full_name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
  function toggle(value: typeof panel) {
    setPanel(panel === value ? null : value)
  }
  function save(status: 'active' | 'inactive') {
    if (!current) return
    void act(
      () =>
        apiRequest(`/api/admin/members/${member.id}/subscription`, 'PATCH', {
          status,
          planId,
          startsAt: current.starts_at,
          expiresAt: expires
            ? new Date(`${expires}T23:59:59Z`).toISOString()
            : null,
        }),
      'Assinatura atualizada',
    )
  }
  return (
    <tbody>
      <tr>
        <td>
          <div className="member-identity">
            <span className="member-avatar">{initials}</span>
            <div>
              <strong>{member.full_name}</strong>
              <span>{member.email}</span>
            </div>
          </div>
        </td>
        <td>{member.unit_name}</td>
        <td>
          <span className="plan-badge">
            {t(member.plan_name || 'Sem plano')}
          </span>
        </td>
        <td>
          <span
            className={`status-badge ${current?.status === 'active' ? 'status-active' : ''}`}
          >
            <i />
            {current?.status === 'active' ? t('Ativo') : t('Inativo')}
          </span>
        </td>
        <td className="date-cell">
          {new Date(member.created_at).toLocaleDateString(locale)}
        </td>
        <td>
          <div className="row-actions">
            <button
              aria-expanded={panel === 'subscription'}
              onClick={() => toggle('subscription')}
            >
              {t('Assinatura')}
            </button>
            <button
              aria-expanded={panel === 'details'}
              onClick={() => toggle('details')}
            >
              {t('Editar')}
            </button>
            <button
              aria-expanded={panel === 'password'}
              onClick={() => toggle('password')}
            >
              {t('Definir senha')}
            </button>
            {current && (
              <button
                disabled={busy}
                className={
                  current.status === 'active'
                    ? 'action-danger'
                    : 'action-activate'
                }
                onClick={() =>
                  save(current.status === 'active' ? 'inactive' : 'active')
                }
              >
                {current.status === 'active' ? t('Desativar') : t('Ativar')}
              </button>
            )}
          </div>
        </td>
      </tr>
      {panel && (
        <tr className="member-editor-row">
          <td colSpan={6}>
            <div className="member-editor">
              <div className="editor-heading">
                <h3>
                  {panel === 'details'
                    ? t('Editar dados')
                    : panel === 'password'
                      ? t('Definir nova senha')
                      : t('Gerenciar assinatura')}{' '}
                  · {member.full_name}
                </h3>
                <button
                  className="icon-button"
                  aria-label={t('Fechar edição')}
                  onClick={() => setPanel(null)}
                >
                  <UiIcon name="close" />
                </button>
              </div>
              {panel === 'details' && (
                <form
                  className="member-edit-form"
                  onSubmit={(event) => {
                    event.preventDefault()
                    const data = new FormData(event.currentTarget)
                    void act(
                      () =>
                        apiRequest(`/api/admin/members/${member.id}`, 'PATCH', {
                          fullName: data.get('fullName'),
                          email: data.get('email'),
                          unitId: data.get('unitId'),
                        }),
                      'Dados do membro atualizados',
                    )
                  }}
                >
                  <label>
                    {t('Nome')}
                    <input
                      name="fullName"
                      required
                      minLength={2}
                      defaultValue={member.full_name}
                      className={field}
                    />
                  </label>
                  <label>
                    {t('E-mail')}
                    <input
                      name="email"
                      type="email"
                      required
                      defaultValue={member.email}
                      className={field}
                    />
                  </label>
                  <label>
                    {t('Unidade')}
                    <select
                      name="unitId"
                      required
                      defaultValue={member.unit_id}
                      className={field}
                    >
                      {units.map((unit) => (
                        <option key={unit.id} value={unit.id}>
                          {unit.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <button disabled={busy} className="primary-button">
                    {t('Salvar dados')}
                  </button>
                </form>
              )}
              {panel === 'password' && (
                <form
                  className="member-edit-form password-edit-form"
                  onSubmit={(event) => {
                    event.preventDefault()
                    const form = event.currentTarget
                    const password = String(new FormData(form).get('password'))
                    void act(async () => {
                      await apiRequest(
                        `/api/admin/members/${member.id}/password`,
                        'PATCH',
                        { password },
                      )
                      form.reset()
                      setPanel(null)
                    }, 'Senha do membro alterada')
                  }}
                >
                  <label>
                    {t('Nova senha')}
                    <input
                      name="password"
                      type="password"
                      required
                      minLength={8}
                      maxLength={128}
                      autoComplete="new-password"
                      placeholder={t('Mínimo de 8 caracteres')}
                      className={field}
                    />
                  </label>
                  <button disabled={busy} className="primary-button">
                    {t('Salvar nova senha')}
                  </button>
                  <p>
                    {t(
                      'O membro poderá entrar com a nova senha imediatamente.',
                    )}
                  </p>
                </form>
              )}
              {panel === 'subscription' &&
                (current ? (
                  <form
                    className="member-edit-form"
                    onSubmit={(event) => {
                      event.preventDefault()
                      save(current.status)
                    }}
                  >
                    <label>
                      {t('Plano')}
                      <select
                        value={planId}
                        onChange={(event) => setPlanId(event.target.value)}
                        className={field}
                      >
                        {plans.map((plan) => (
                          <option key={plan.id} value={plan.id}>
                            {t(plan.name)}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label>
                      {t('Validade')}
                      <input
                        type="date"
                        value={expires}
                        onChange={(event) => setExpires(event.target.value)}
                        className={field}
                      />
                    </label>
                    <button disabled={busy} className="primary-button">
                      {t('Salvar plano e validade')}
                    </button>
                  </form>
                ) : (
                  <p>{t('Assinatura não configurada.')}</p>
                ))}
            </div>
          </td>
        </tr>
      )}
    </tbody>
  )
}
function RuleEditor({
  service,
  plans,
  busy,
  act,
}: {
  service: Service
  plans: Plan[]
  busy: boolean
  act: (operation: () => Promise<unknown>, success?: string) => Promise<void>
}) {
  const { t } = useLanguage()
  const current = service.rules.find((rule) => rule.enabled)
  return (
    <div className="mt-5 border-t border-[#deded8] pt-5">
      <p className="mb-3 font-semibold">{t('Disponibilidade e plano')}</p>
      <form
        className="grid gap-3 sm:grid-cols-3"
        onSubmit={(event) => {
          event.preventDefault()
          const d = new FormData(event.currentTarget)
          const weekdays = String(d.get('weekdays'))
            .split(',')
            .map((value) => Number(value.trim()))
          void act(
            () =>
              apiRequest(`/api/admin/services/${service.id}`, 'PATCH', {
                rules: [
                  {
                    planId: d.get('planId') || null,
                    weekdays,
                    startTime: d.get('startTime'),
                    endTime: d.get('endTime'),
                    priority: Number(d.get('priority') ?? 0),
                  },
                ],
              }),
            'Disponibilidade atualizada',
          )
        }}
      >
        <label>
          {t('Dias (0=dom, 6=sáb)')}
          <input
            name="weekdays"
            required
            defaultValue={current?.weekdays.join(',') ?? '1,2,3,4,5'}
            className={field}
          />
        </label>
        <label>
          {t('Plano')}
          <select
            name="planId"
            defaultValue={current?.plan_id ?? ''}
            className={field}
          >
            <option value="">{t('Todos')}</option>
            {plans.map((plan) => (
              <option key={plan.id} value={plan.id}>
                {t(plan.name)}
              </option>
            ))}
          </select>
        </label>
        <label>
          {t('Prioridade')}
          <input
            name="priority"
            type="number"
            defaultValue={current?.priority ?? 0}
            className={field}
          />
        </label>
        <label>
          {t('Início')}
          <input
            name="startTime"
            type="time"
            defaultValue={current?.start_time.slice(0, 5) ?? '08:00'}
            className={field}
          />
        </label>
        <label>
          {t('Fim')}
          <input
            name="endTime"
            type="time"
            defaultValue={current?.end_time.slice(0, 5) ?? '18:00'}
            className={field}
          />
        </label>
        <div className="flex items-end gap-2">
          <button disabled={busy} className={button}>
            {t('Salvar regra')}
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() =>
              void act(
                () =>
                  apiRequest(`/api/admin/services/${service.id}`, 'PATCH', {
                    rules: [],
                  }),
                'Regras removidas',
              )
            }
            className="rounded-xl border border-[#dcdcd6] px-4 py-3 text-sm"
          >
            {t('Remover')}
          </button>
        </div>
      </form>
      <p className="mt-2 text-xs text-[#878780]">
        {t(
          'Sem regra, o serviço publicado fica disponível para todos os planos e horários.',
        )}
      </p>
    </div>
  )
}
function OrderList({
  orders,
  onChange,
  busy,
}: {
  orders: Order[]
  onChange?: (order: Order, status: 'confirmed' | 'cancelled') => void
  busy?: boolean
}) {
  const { t, locale } = useLanguage()
  const money = (cents: number) =>
    new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: 'BRL',
    }).format(cents / 100)

  return (
    <div className="space-y-3">
      {orders.map((order) => (
        <div
          key={order.id}
          className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#e7e7e2] bg-white p-4"
        >
          <div>
            <h3 className="font-semibold">
              {order.service_name || order.service_id}
            </h3>
            <p className="text-sm text-[#73736d]">
              {order.scheduled_start &&
                new Date(order.scheduled_start).toLocaleString(locale, {
                  timeZone: 'America/Sao_Paulo',
                })}{' '}
              · {money(order.total_cents)} · {t(statusLabel(order.status))} ·{' '}
              {new Date(order.created_at).toLocaleString(locale)}
            </p>
            <p className="text-xs text-[#878780]">
              {t('Pedido')}
              {order.id.slice(0, 8)}
              {t(' · Membro')} {order.member_id.slice(0, 8)}
            </p>
          </div>
          {onChange && order.status === 'requested' && (
            <div className="flex gap-2">
              <button
                disabled={busy}
                onClick={() => onChange(order, 'confirmed')}
                className={button}
              >
                {t('Confirmar')}
              </button>
              <button
                disabled={busy}
                onClick={() => onChange(order, 'cancelled')}
                className="rounded-xl border border-[#dcdcd6] px-4 py-2 text-sm"
              >
                {t('Cancelar')}
              </button>
            </div>
          )}
        </div>
      ))}
      {orders.length === 0 && (
        <p className="rounded-2xl border border-[#e7e7e2] p-5 text-[#878780]">
          {t('Nenhum pedido neste período.')}
        </p>
      )}
    </div>
  )
}
