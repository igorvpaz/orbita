import { z } from 'zod'
import {
  assertSameOrigin,
  apiFailure,
  ApiError,
  dbResult,
  parseBody,
  privateJson,
} from '@/lib/api'
import { getCurrentUser, requireActiveMember } from '@/lib/auth'
import { escapeHtml, sendTrackedEmail } from '@/lib/email'

const schema = z
  .object({
    serviceId: z.uuid(),
    idempotencyKey: z.uuid(),
    scheduledStart: z.iso.datetime({ offset: true }),
  })
  .strict()

export async function GET() {
  try {
    const { db, profile, authUser } = await getCurrentUser()
    if (profile.role === 'member') await requireActiveMember()
    let query = db
      .from('orders')
      .select(
        'id,service_id,member_id,status,total_cents,created_at,confirmed_at,scheduled_start,scheduled_end',
      )
      .order('created_at', { ascending: false })
      .limit(200)
    if (profile.role === 'member') query = query.eq('member_id', authUser.id)
    const orders = dbResult(await query)
    const serviceIds = [...new Set(orders.map((order) => order.service_id))]
    const services = serviceIds.length
      ? dbResult(
          await db.from('services').select('id,name').in('id', serviceIds),
        )
      : []
    const memberIds = [...new Set(orders.map((order) => order.member_id))]
    const members =
      profile.role === 'admin' && memberIds.length
        ? dbResult(
            await db
              .from('profiles')
              .select('id,full_name')
              .in('id', memberIds),
          )
        : []
    return privateJson({
      orders: orders.map((order) => ({
        ...order,
        service_name:
          services.find((s) => s.id === order.service_id)?.name ?? 'Serviço',
        member_name:
          members.find((m) => m.id === order.member_id)?.full_name ?? null,
      })),
    })
  } catch (error) {
    return apiFailure(error)
  }
}

export async function POST(request: Request) {
  try {
    assertSameOrigin(request)
    const { db, authUser, profile } = await requireActiveMember()
    const input = await parseBody(request, schema)
    const service = dbResult(
      await db
        .from('services')
        .select('id,name')
        .eq('id', input.serviceId)
        .eq('status', 'published')
        .maybeSingle(),
    )
    if (!service) throw new ApiError(404, 'Serviço não disponível')
    const inserted = await db
      .from('orders')
      .insert({
        member_id: authUser.id,
        service_id: input.serviceId,
        idempotency_key: input.idempotencyKey,
        scheduled_start: input.scheduledStart,
      })
      .select('id,total_cents,status,service_id,scheduled_start')
      .single()
    if (inserted.error?.code === '23505') {
      const existing = dbResult(
        await db
          .from('orders')
          .select('id,total_cents,status,service_id,scheduled_start')
          .eq('member_id', authUser.id)
          .eq('idempotency_key', input.idempotencyKey)
          .single(),
      )
      if (
        existing.service_id !== input.serviceId ||
        new Date(existing.scheduled_start).getTime() !==
          new Date(input.scheduledStart).getTime()
      )
        throw new ApiError(409, 'Chave de pedido já utilizada')
      return privateJson({ order: existing, duplicate: true })
    }
    const order = dbResult(inserted)
    if (process.env.ADMIN_NOTIFICATION_EMAIL)
      await sendTrackedEmail({
        kind: 'order_alert',
        recipient: process.env.ADMIN_NOTIFICATION_EMAIL,
        relatedId: order.id,
        subject: 'Nova solicitação na Órbita',
        text: `${profile.full_name} solicitou ${service.name}. Pedido ${order.id}. Valor nominal: R$ ${(order.total_cents / 100).toFixed(2)}.`,
        html: `<p>${escapeHtml(profile.full_name)} solicitou ${escapeHtml(service.name)}.</p><p>Pedido ${order.id}. Valor nominal: R$ ${(order.total_cents / 100).toFixed(2)}.</p>`,
      })
    return privateJson({ order }, 201)
  } catch (error) {
    return apiFailure(error)
  }
}
