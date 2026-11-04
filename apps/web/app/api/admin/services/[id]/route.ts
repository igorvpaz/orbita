import {
  assertSameOrigin,
  apiFailure,
  ApiError,
  dbResult,
  parseBody,
  privateJson,
} from '@/lib/api'
import { requireAdmin } from '@/lib/auth'
import { updateServiceSchema } from '@/lib/service-schema'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    assertSameOrigin(request)
    const { db } = await requireAdmin()
    const { id } = await params
    const input = await parseBody(request, updateServiceSchema)
    if (input.rules?.some((rule) => rule.startTime >= rule.endTime))
      throw new ApiError(422, 'Faixa horária inválida')
    const original = dbResult(
      await db
        .from('services')
        .select('id,unit_id,partner_id')
        .eq('id', id)
        .maybeSingle(),
    )
    if (!original) throw new ApiError(404, 'Serviço não encontrado')
    const unitId = input.unitId ?? original.unit_id
    const partnerId = input.partnerId ?? original.partner_id
    const partner = dbResult(
      await db
        .from('partners')
        .select('id')
        .eq('id', partnerId)
        .eq('unit_id', unitId)
        .maybeSingle(),
    )
    if (!partner) throw new ApiError(422, 'Parceiro e unidade incompatíveis')
    dbResult(
      await db
        .from('services')
        .update({
          unit_id: unitId,
          partner_id: partnerId,
          name: input.name,
          description_pt: input.descriptionPt,
          description_en: input.descriptionEn,
          category: input.category,
          price_cents: input.priceCents,
          status: input.status,
          access_plan: input.accessPlan,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id),
    )
    if (input.rules) {
      const existing = dbResult(
        await db.from('recommendation_rules').select('id').eq('service_id', id),
      )
      for (const rule of existing)
        dbResult(
          await db
            .from('recommendation_rules')
            .update({ enabled: false })
            .eq('id', rule.id),
        )
      if (input.rules.length)
        dbResult(
          await db.from('recommendation_rules').insert(
            input.rules.map((rule) => ({
              service_id: id,
              plan_id: rule.planId,
              weekdays: rule.weekdays,
              start_time: rule.startTime,
              end_time: rule.endTime,
              priority: rule.priority,
            })),
          ),
        )
    }
    return privateJson({ ok: true })
  } catch (error) {
    return apiFailure(error)
  }
}
