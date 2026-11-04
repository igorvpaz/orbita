import { ApiError, dbResult } from '@/lib/api'
import { localContext, rankServices, type Rule } from '@/lib/recommendations'
import { requireActiveMember } from '@/lib/auth'
import { servicePhoto } from '@/lib/service-photo'

export async function getMemberCatalog(unitId?: string) {
  const member = await requireActiveMember()
  const { db, profile, membership } = member
  const units = dbResult(
    await db
      .from('units')
      .select('id,name,city,neighborhood,timezone')
      .eq('active', true)
      .order('name'),
  )
  const selectedId = unitId ?? profile.unit_id
  if (!units.some((item) => item.id === selectedId))
    throw new ApiError(404, 'Unidade não encontrada')
  const unit = dbResult(
    await db
      .from('units')
      .select('id,name,city,neighborhood,timezone')
      .eq('id', selectedId)
      .single(),
  )
  const plan = dbResult(
    await db
      .from('plans')
      .select('id,code,name')
      .eq('id', membership.plan_id)
      .single(),
  )
  const services = dbResult(
    await db
      .from('services')
      .select(
        'id,name,description_pt,description_en,price_cents,category,partner_id,created_at,access_plan',
      )
      .eq('unit_id', selectedId)
      .eq('status', 'published'),
  )
  if (!services?.length)
    return {
      unit,
      units,
      plan,
      services: [],
      generated_at: new Date().toISOString(),
    }
  const ids = services.map((item) => item.id)
  const partnerIds = [...new Set(services.map((item) => item.partner_id))]
  const [partnerResult, ruleResult, mediaResult] = await Promise.all([
    db.from('partners').select('id,name,status').in('id', partnerIds),
    db
      .from('recommendation_rules')
      .select(
        'service_id,plan_id,weekdays,start_time,end_time,priority,enabled',
      )
      .in('service_id', ids),
    db
      .from('service_media')
      .select('service_id,storage_path,alt_pt')
      .in('service_id', ids)
      .order('sort_order'),
  ])
  const partners = dbResult(partnerResult)
  const rules = dbResult(ruleResult) as Rule[]
  const media = dbResult(mediaResult)
  const partnerMap = new Map(
    partners?.filter((p) => p.status === 'active').map((p) => [p.id, p.name]),
  )
  const ranked = rankServices(
    services.filter((s) => partnerMap.has(s.partner_id)),
    rules ?? [],
    plan.id,
    localContext(new Date(), unit.timezone),
    plan.code,
  )
  const result = await Promise.all(
    ranked.map(async (service) => {
      const photo = media?.find((item) => item.service_id === service.id)
      let imageUrl: string | null = null
      if (photo) {
        const signed = await db.storage
          .from('service-images')
          .createSignedUrl(photo.storage_path, 60)
        imageUrl = signed.data?.signedUrl ?? null
      }
      return {
        ...service,
        unit_id: unit.id,
        unit_name: unit.name,
        partner_name: partnerMap.get(service.partner_id),
        image_url:
          imageUrl ?? servicePhoto(service.name, service.category).image_url,
        image_alt: imageUrl
          ? (photo?.alt_pt ?? service.name)
          : servicePhoto(service.name, service.category).alt_pt,
      }
    }),
  )
  return {
    unit,
    units,
    plan,
    services: result,
    generated_at: new Date().toISOString(),
  }
}
