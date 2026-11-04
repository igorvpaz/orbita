import { apiFailure, ApiError, dbResult, privateJson } from '@/lib/api'
import { getCurrentUser } from '@/lib/auth'
import { getMemberCatalog } from '@/lib/catalog'
import { servicePhoto } from '@/lib/service-photo'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    const current = await getCurrentUser()
    if (current.profile.role === 'admin') {
      const service = dbResult(
        await current.db
          .from('services')
          .select('*')
          .eq('id', id)
          .maybeSingle(),
      )
      if (!service) throw new ApiError(404, 'Serviço não encontrado')
      const media = dbResult(
        await current.db
          .from('service_media')
          .select('storage_path,alt_pt,sort_order')
          .eq('service_id', id)
          .order('sort_order'),
      )
      const photos = await Promise.all(
        media.map(async (photo) => ({
          ...photo,
          image_url:
            (
              await current.db.storage
                .from('service-images')
                .createSignedUrl(photo.storage_path, 60)
            ).data?.signedUrl ?? null,
        })),
      )
      return privateJson({
        service: {
          ...service,
          media: photos.length
            ? photos
            : [servicePhoto(service.name, service.category)],
        },
      })
    }
    const row = dbResult(
      await current.db
        .from('services')
        .select('unit_id')
        .eq('id', id)
        .maybeSingle(),
    )
    if (!row) throw new ApiError(404, 'Serviço não encontrado')
    const catalog = await getMemberCatalog(row.unit_id)
    const service = catalog.services.find((item) => item.id === id)
    if (!service) throw new ApiError(404, 'Serviço não disponível')
    return privateJson({ service })
  } catch (error) {
    return apiFailure(error)
  }
}
