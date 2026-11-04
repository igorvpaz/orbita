import { z } from 'zod'
import {
  assertSameOrigin,
  apiFailure,
  ApiError,
  dbResult,
  parseBody,
  privateJson,
} from '@/lib/api'
import { requireActiveMember } from '@/lib/auth'
import { escapeHtml, sendTrackedEmail } from '@/lib/email'

const schema = z.object({
  serviceId: z.uuid(),
  type: z.enum(['view', 'interest']),
  idempotencyKey: z.uuid(),
})

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
      .from('service_events')
      .insert({
        member_id: authUser.id,
        service_id: input.serviceId,
        type: input.type,
        idempotency_key: input.idempotencyKey,
      })
      .select('id')
      .single()
    if (inserted.error?.code === '23505')
      return privateJson({ duplicate: true })
    const event = dbResult(inserted)
    if (input.type === 'interest' && process.env.ADMIN_NOTIFICATION_EMAIL) {
      await sendTrackedEmail({
        kind: 'interest_alert',
        recipient: process.env.ADMIN_NOTIFICATION_EMAIL,
        relatedId: event.id,
        subject: 'Novo interesse na Órbita',
        text: `${profile.full_name} demonstrou interesse em ${service.name}. Veja no painel administrativo.`,
        html: `<p>${escapeHtml(profile.full_name)} demonstrou interesse em ${escapeHtml(service.name)}.</p><p>Veja no painel administrativo.</p>`,
      })
    }
    return privateJson({ id: event.id }, 201)
  } catch (error) {
    return apiFailure(error)
  }
}
