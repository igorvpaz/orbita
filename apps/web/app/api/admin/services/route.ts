import {
  assertSameOrigin,
  apiFailure,
  ApiError,
  dbResult,
  parseBody,
  privateJson,
} from '@/lib/api'
import { requireAdmin } from '@/lib/auth'
import { createServiceSchema } from '@/lib/service-schema'
import { servicePhoto } from '@/lib/service-photo'

export async function GET() {
  try {
    const { db } = await requireAdmin()
    const [services, rules, media] = await Promise.all([
      db
        .from('services')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(200),
      db.from('recommendation_rules').select('*'),
      db.from('service_media').select('*').order('sort_order'),
    ])
    const allRules = dbResult(rules)
    const allMedia = dbResult(media)
    const allServices = await Promise.all(
      dbResult(services).map(async (service) => {
        const photos = await Promise.all(
          allMedia
            .filter((item) => item.service_id === service.id)
            .map(async (item) => ({
              ...item,
              image_url:
                (
                  await db.storage
                    .from('service-images')
                    .createSignedUrl(item.storage_path, 60)
                ).data?.signedUrl ?? null,
            })),
        )
        return {
          ...service,
          rules: allRules.filter((item) => item.service_id === service.id),
          media: photos.length
            ? photos
            : [servicePhoto(service.name, service.category)],
        }
      }),
    )
    return privateJson({ services: allServices })
  } catch (error) {
    return apiFailure(error)
  }
}

export async function POST(request: Request) {
  try {
    assertSameOrigin(request)
    const { db } = await requireAdmin()
    const input = await parseBody(request, createServiceSchema)
    if (input.rules.some((rule) => rule.startTime >= rule.endTime))
      throw new ApiError(422, 'Faixa horária inválida')
    const partner = dbResult(
      await db
        .from('partners')
        .select('id')
        .eq('id', input.partnerId)
        .eq('unit_id', input.unitId)
        .eq('status', 'active')
        .maybeSingle(),
    )
    if (!partner) throw new ApiError(422, 'Parceiro e unidade incompatíveis')
    const service = dbResult(
      await db
        .from('services')
        .insert({
          unit_id: input.unitId,
          partner_id: input.partnerId,
          name: input.name,
          description_pt: input.descriptionPt,
          description_en: input.descriptionEn,
          category: input.category,
          price_cents: input.priceCents,
          status: input.status,
          access_plan: input.accessPlan,
        })
        .select('id')
        .single(),
    )
    if (input.rules.length) {
      const result = await db.from('recommendation_rules').insert(
        input.rules.map((rule) => ({
          service_id: service.id,
          plan_id: rule.planId,
          weekdays: rule.weekdays,
          start_time: rule.startTime,
          end_time: rule.endTime,
          priority: rule.priority,
        })),
      )
      if (result.error) {
        await db
          .from('services')
          .update({ status: 'draft' })
          .eq('id', service.id)
        throw new ApiError(
          500,
          'Serviço salvo como rascunho; regras falharam. Revise no painel.',
        )
      }
    }
    return privateJson({ id: service.id }, 201)
  } catch (error) {
    return apiFailure(error)
  }
}
